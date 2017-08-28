/**
 * Chức năng vẽ đường dẫn dây điện: là đường thẳng
 * Tham số truyền vào (view, fixedLayers, drawLayer, systemVariable)
 * fixedLayers: Layer trụ điện khi tìm kiếm so trùng (hittest) Graphics
 * drawLayer: là layer để vẽ dây điện: Nhánh dây mạch điện
 */
define([
    "dojo/on",
    "ditagis/tools/DrawingPolylineAbstract",

], function (on,
    DrawingPolylineAbstract
) {
        'use strict';
        return class extends DrawingPolylineAbstract {
            constructor(view, fixedLayers) {
                super(view, fixedLayers);
                this.tmpGraphics = [];
                this.isStart = false;
            }
            /**
             * 
             */
            draw() {
                this.startup();
            }
            startup() {
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
                }

            }
            /**
             * Dùng sự kiện drag để tìm kiếm điểm thành các Polyline
             * @param {Sự kiện drag} evt 
             */
            clickFunc(evt) {
                evt.stopPropagation();

                const screenCoors = {
                    x: evt.x,
                    y: evt.y
                };
                let point = this.checkHittest(screenCoors).then((point) => {
                    // if (point) {
                    //     this.paths.push([point.x, point.y])
                    // }
                    this.view.hitTest(screenCoors)
                        .then(function (responses) {
                            // do something with the result graphic
                            for (let response of responses) {
                                const graphic = response.graphic,
                                layer = graphic.layer;
                                if (layer) {
                                    layerName = layer.name;
                                    if(layerName == constName.THIETBITRUYENDAN){
                                        
                                    }
                                }

                            }

                        });
                    // nếu như đã có điểm đầu thì vẽ đường line tạm
                    if (this.firstPoint) {
                        this.refreshMainGraphic({
                            paths: [
                                [this.firstPoint.x, this.firstPoint.y],
                                [point.x, point.y]
                            ]
                        });
                    }
                    this.firstPoint = point.clone();
                });
            }
            /**
             * Lấy giá trị graphic tại tọa độ màn hình khi dùng sự kiện drag
             * Và lưu lại đường dẫn của các điêm graphic khi sử dụng hàm này
             * @param {mapPoint, graphic} response 
             */
            hitTestDragEnd(response) {
                let results = response.results,
                    valid = false;
                if (results.length) {
                    for (let i in results) {
                        let graphic = results[i].graphic;
                        let layer = graphic.layer;
                        if (layer) {

                        }
                    }
                }
                if (!valid) {
                    alert('Chưa tìm thấy cột điện')
                }

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
            }

            finish() {
                if (this.isStart) {
                    this.eventListener.fire('draw-finish', this.mainGraphic);
                    this.cancel();
                }
            }
        }

    });