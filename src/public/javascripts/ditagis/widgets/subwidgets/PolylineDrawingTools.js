define([
    "dojo/on",
    "dojo/dom-construct",
    "dojo/dom-attr",
    "dojo/dom-class",
    "dojo/dom",
    "esri/widgets/Expand",

    "ditagis/tools/PointDrawingToolManager",
    "ditagis/tools/PolylineDrawingToolManager",

    "ditagis/classes/EventListener",

], function (on,
    domConstruct, domAttr, domClass, dom,
    Expand,
    PointDrawingToolManager, PolylineDrawingToolManager,
    EventListener) {
    'use strict';

    return class {
        constructor(view) {
            this.view = view;
            this.systemVariable = view.systemVariable;
            this.isStartup = false;

            this._drawLayer = null;
            this.drawingMethods = [{
                    name: "Mặc định",
                    type: "macdinh"
                },
                {
                    name: "Đoạn cung",
                    type: "arcsegment"
                }
            ];

            this.drawingManager = new PolylineDrawingToolManager(view)
            this.eventListener = new EventListener(this);
            this.drawingManager.on('draw-finish', (evt) => {
                let method = evt.method;
            })
            //đăng ký sự kiện khi có sự thay đổi giá trị của systemVariable
            this.systemVariable.on('change-selectedFeature', () => {
                //khi giá trị thay đổi thì cập nhật cho drawingManager
                this.drawingManager.drawLayer = this.drawLayer;
            })
            
        }
        startup() {
            if (!this.isStartup) {
                this.initView();
                this.view.ui.add(this.expandWidget, "top-right");
                this.isStartup = true;
            }
        }
        
        destroy() {
            if (this.isStartup) {
                this.view.ui.remove(this.expandWidget);
                this.isStartup = false;
            }
            this.drawingManager.cancel();
        }
        destroyView(){
            document.body.removeChild(this.container);
        }
        initView() {
            this.container = domConstruct.create("div",{
                class:'dtg-subwidget-polyline-drawingtool'
            });
            for (let drawingMethod of this.drawingMethods) {
                let btn = domConstruct.create("button", {
                    class: 'dtg-btn-widget',
                    innerHTML: drawingMethod.name
                }, this.container);
                domAttr.set(btn, 'drawing-method', drawingMethod.type)
                btn.drawingMethod = drawingMethod;
                on(btn, 'click', (evt) => {
                    this.clickBtnFunc(evt);
                })
            }
            domConstruct.place(this.container, document.body)
            this.expandWidget = new Expand({
                expandIconClass: "esri-icon-layer-list",
                view: this.view,
                content: this.container
            });
        }
        get drawLayer() {
            return this.systemVariable.selectedFeature;
        }

        clickBtnFunc(evt) {
            if (!this.drawLayer || this.drawLayer.geometryType !== 'polyline') return;
            let target = evt.target,
                drawingMethod = domAttr.get(target, 'drawing-method');
            switch (drawingMethod) {
                case this.drawingMethods[0].type:
                    this.drawingManager.drawSimple();
                    break;
                case this.drawingMethods[1].type:
                    this.drawingManager.dragArcSegment();
                    break;
                default:
                    break;
            }
            this.expandWidget.expanded = false;
        }

    }
});