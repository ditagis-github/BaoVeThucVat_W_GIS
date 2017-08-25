/**
 * Chức năng vẽ đường dẫn dây điện: là đường thẳng
 * Tham số truyền vào (view, fixedLayers, drawLayer, systemVariable)
 * fixedLayers: Layer trụ điện khi tìm kiếm so trùng (hittest) Graphics
 * drawLayer: là layer để vẽ dây điện: Nhánh dây mạch điện
 */
define([
    "dojo/on",
    "ditagis/tools/DrawingPolylineAbstract",
    "ditagis/toolview/Tooltip",
], function (on,
    DrawingPolylineAbstract,
    Tooltip
) {
        'use strict';
        return class extends DrawingPolylineAbstract {
            constructor(view, options = {}) {
               
                super(view, options);
                let cstOptions={};
                 cstOptions.firstMoveTooltip = {
                    text: 'Bấm để bắt đầu vẽ \r\n Nhấn CTRL để bắt dính đối tượng trên bản đồ',
                    visible: true
                };
                cstOptions.otherMoveTooltip = {
                    text: "Bấm để tiếp tục vẽ \r\n Nhấn đúp để hoàn thành",
                    visible: true
                }
                for(let i in cstOptions) {
                    this.options[i] = this.options[i] || cstOptions[i]
                }

                this.isStart = false;
                this.toolTipMoveEventFuc;
            }
            /**
             * 
             */
            draw() {
                this.startup();
            }
            startup() {
                this.toolTipMoveEventFuc = (evt) => {
                    if (this.options.firstMoveTooltip.visible) {
                        Tooltip.instance().show([evt.x, evt.y], this.options.firstMoveTooltip.text);
                    }
                }
                this.tooltipMoveEvent = on(this.view, 'pointer-move', evt => {
                    this.toolTipMoveEventFuc(evt);
                })
                if (!this.isStart) {
                    this.clickEvent = on(view, 'click', (evt) => {
                        this.clickFunc(evt);
                    });
                    this.dblClickHandler = on(view, 'double-click', (evt) => {
                        evt.stopPropagation();
                        this.finish();
                    })
                    this.pointerMoveEvent = on(this.view, 'pointer-move', (evt) => {
                        this.pointerMoveHandler(evt);
                    });
                    this.isStart = true;
                }
            }
            pointerMoveHandler(evt) {
                const screenCoors = {
                    x: evt.x,
                    y: evt.y
                };
                //Tìm kiếm graphic trùng với tọa độ màn hình khi drag
                var point = view.toMap(screenCoors);
                //nếu như đã có điểm đầu thì vẽ đường line tạm
                if (this.firstPoint) {
                    this.addTmpGraphic([[this.firstPoint.x, this.firstPoint.y], [point.x, point.y]]);
                    this.eventListener.fire('pointer-move', {
                        x: evt.x, y: evt.y, geometry: this.geometry
                    })
                }

            }
            /**
             * Dùng sự kiện drag để tìm kiếm điểm thành các Polyline
             * @param {Sự kiện drag} evt 
             */
            async clickFunc(evt) {
                evt.stopPropagation();
                this.toolTipMoveEventFuc = (evt) => {
                    if (this.options.otherMoveTooltip.visible) {
                        Tooltip.instance().show([evt.x, evt.y], this.options.otherMoveTooltip.text);
                    }
                }

                const screenCoors = {
                    x: evt.x,
                    y: evt.y
                };
                let point;
                if (this.view.snapping) {
                    //nếu có nhấn key thì chạy hitest
                    if (this.view.snapping.isKeyPress()) {
                        point = this.checkHittest(screenCoors).then(async (point) => {
                            return await point
                        });
                    }
                }
                if (!point)
                    point = this.view.toMap(screenCoors);
                if (this.firstPoint) {
                    this.refreshMainGraphic([
                        [this.firstPoint.x, this.firstPoint.y],
                        [point.x, point.y]
                    ]);
                }
                this.firstPoint = point.clone();
            }
            cancel() {
                //lấy những graphic tạm, sự kiện được đăng ký để xóa
                this.clearTmpGraphic();

                //xóa sự kiện
                this.clearEvents();
                //xóa widget
                this.isStart = false;
                this.firstPoint = null;
            }
            /**
             * Xóa những sự kiện đã đăng ký với view
             */
            clearEvents() {
                if (this.pointerMoveEvent) {
                    this.pointerMoveEvent.remove();
                    this.pointerMoveEvent = null;
                }
                if (this.clickEvent) {
                    this.clickEvent.remove();
                    this.clickEvent = null;
                }
                if (this.dblClickHandler) {
                    this.dblClickHandler.remove();
                    this.dblClickHandler = null;
                }
                if (this.tooltipMoveEvent) {
                    Tooltip.instance().hide();
                    this.tooltipMoveEvent.remove();
                    this.tooltipMoveEvent = null;
                }
            }

            finish() {
                if (this.isStart) {
                    this.eventListener.fire('draw-finish', this.geometry);
                    this.clearEvents();
                    this.clearTmpGraphic();
                    this.isStart = false;
                }
            }
        }

    });