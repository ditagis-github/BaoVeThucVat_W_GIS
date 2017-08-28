/**
 * Quá trình xử lý Vẽ Point với chức năng Tùy chọn điểm
 * Để khai báo lớp này, các tham số truyền vào
 * Ví dụ: var simpleDrawPoint = new SimpleDrawPoint(view,systemVariable)
 * systemVariable: Thông tin của khách hàng đang hiển thị
 */
define([
    "dojo/dom-construct",
    "dojo/dom-class",
    "dojo/dom",
    "dojo/on",

    "esri/layers/FeatureLayer",
    "esri/Graphic",
    "esri/layers/GraphicsLayer",
    "esri/geometry/Polyline",
    "esri/geometry/Point",
    "esri/geometry/Circle",
    "esri/symbols/SimpleLineSymbol",
    "esri/symbols/SimpleMarkerSymbol",
    "esri/symbols/SimpleFillSymbol",


    "esri/geometry/geometryEngine",
    "esri/geometry/geometryEngineAsync",


    "ditagis/editing/PointEditing",
    "ditagis/classes/EventListener",
    "ditagis/toolview/Tooltip",

], function (domConstruct, domClass, dom, on,
    FeatureLayer, Graphic, GraphicsLayer, Polyline, Point, Circle, SimpleLineSymbol, SimpleMarkerSymbol, SimpleFillSymbol,
    geometryEngine, geometryEngineAsync,
    PointEditing,
    EventListener,
    Tooltip
) {
    'use strict';
    return class {
        constructor(view) {
            this.options = {
                tooltip:{
                    move:'Nhấn vào màn hình để vẽ'
                }
            }
            this.view = view;
            this.systemVariable = view.systemVariable;
            this.drawLayer = new PointEditing();
            this.eventListener = new EventListener(this);
        }
        /**
         * Truyền vào là layer dùng để vẽ trụ điện
         * @param {Feature Layer} layer 
         */
        draw(layer) {
            this.drawLayer.layer = layer;
            // Sự kiện hủy vẽ
            this.doubleClickEvent = on(this.view, 'double-click', (evt) => {
                this.doubleClickFunc(evt);
            });
            // Lưu lại sự kiện hủy vẽ để xóa sau nếu không dùng sự kiện này bây giờ
            // Sự kiện vẽ điểm
            this.dragEventBufferFinal = on(this.view, 'click', (evt) => {
                this.dragFuncBufferFinal(evt)
            });
            // Lưu lại sự kiện hủy vẽ để xóa sau nếu không dùng sự kiện này bây giờ
            this.pointerMoveEvent = on(this.view,'pointer-move',evt=>{
                Tooltip.instance().show([evt.x,evt.y],this.options.tooltip.move);
            })

        }
        /**
         * Sau khi kết thúc quá trình vẽ nếu sự kiện nào còn tồn tại thì hủy nó đi
         */
        clearEvents() {
            if (this.dragEventBufferFinal) {
                this.dragEventBufferFinal.remove();
                this.dragEventBufferFinal = null;
            }
            if (this.doubleClickEvent) {
                this.doubleClickEvent.remove();
                this.doubleClickEvent = null;
            }
            if (this.pointerMoveEvent) {
                Tooltip.instance().hide();
                this.pointerMoveEvent.remove();
                this.pointerMoveEvent = null;
            }
        }
        /**
         * Sự kiện hủy vẽ
         * @param {event handle} evt 
         */
        doubleClickFunc(evt) {
            evt.stopPropagation();
            // Xóa sự kiện này khi hoàn tất vẽ Point
            
            this.clearEvents();
        }
        /**
         * Sự kiện vẽ Point
         * @param {Event handle} evt
         */
        dragFuncBufferFinal(evt) {
            evt.stopPropagation();
            let point;
            point = new Graphic({
                geometry: view.toMap({
                    x: evt.x,
                    y: evt.y
                }),
                symbol: new SimpleMarkerSymbol()
            });
            this.eventListener.fire('draw-finish', point);
            //nếu như chưa đăng ký
            if (!this.doubleClickEvent)
                this.doubleClickEvent = on(this.view, 'double-click', (evt) => {
                    this.doubleClickFunc(evt);
                });
        }

    };

});