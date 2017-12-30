/**
 * Quá trình xử lý Vẽ Point với chức năng Tùy chọn điểm
 * Để khai báo lớp này, các tham số truyền vào
 * Ví dụ: var simpleDrawPoint = new SimpleDrawPoint(view,systemVariable)
 * systemVariable: Thông tin của khách hàng đang hiển thị
 */
import domConstruct = require('dojo/dom-construct');
import domClass = require('dojo/dom-class');
import dom = require('dojo/dom');
import on = require('dojo/on');
import FeatureLayer = require('esri/layers/FeatureLayer');
import Graphic = require("esri/Graphic");
import GraphicsLayer = require('esri/layers/GraphicsLayer');
import Polyline = require("esri/geometry/Polyline");
import Point = require("esri/geometry/Point");
import Circle = require("esri/geometry/Circle");
import SimpleLineSymbol = require("esri/symbols/SimpleLineSymbol");
import SimpleMarkerSymbol = require("esri/symbols/SimpleMarkerSymbol");
import SimpleFillSymbol = require("esri/symbols/SimpleFillSymbol");
import geometryEngine = require('esri/geometry/geometryEngine');
import geometryEngineAsync = require('esri/geometry/geometryEngineAsync');
import PointEditing = require('../editing/PointEditing');
import EventListener = require('../classes/EventListener');
import Tooltip = require("ditagis/toolview/Tooltip");
     class SimpleDrawPoint {
         options;
         view;
         systemVariable;
         drawLayer;
         eventListener;
         clickEvent;
         pointerMoveEvent;
        constructor(view) {
            this.options = {
                tooltip: {
                    move: 'Nhấn vào màn hình để vẽ'
                }
            }
            this.view = view;
            this.systemVariable = view.systemVariable;
            this.drawLayer = new PointEditing(view);
            this.eventListener = new EventListener(this);
        }
        /**
         * Truyền vào là layer dùng để vẽ trụ điện
         * @param {Feature Layer} layer 
         */
        draw(layer) {
            this.drawLayer.layer = layer;
            // Lưu lại sự kiện hủy vẽ để xóa sau nếu không dùng sự kiện này bây giờ
            // Sự kiện vẽ điểm
            this.clickEvent = on(this.view, 'click', (evt) => {
                this.clickHandler(evt)
            });
            // Lưu lại sự kiện hủy vẽ để xóa sau nếu không dùng sự kiện này bây giờ
            this.pointerMoveEvent = on(this.view, 'pointer-move', evt => {
                Tooltip.instance().show([evt.x, evt.y], this.options.tooltip.move);
            })

        }
        /**
         * Sau khi kết thúc quá trình vẽ nếu sự kiện nào còn tồn tại thì hủy nó đi
         */
        clearEvents() {
            if (this.clickEvent) {
                this.clickEvent.remove();
                this.clickEvent = null;
            }
            if (this.pointerMoveEvent) {
                Tooltip.instance().hide();
                this.pointerMoveEvent.remove();
                this.pointerMoveEvent = null;
            }
        }
        /**
         * Sự kiện vẽ Point
         * @param {Event handle} evt
         */
        clickHandler(evt) {
            evt.stopPropagation();
            let point;
            point = new Graphic({
                geometry: this.view.toMap({
                    x: evt.x,
                    y: evt.y
                }),
                symbol: new SimpleMarkerSymbol()
            });
            this.eventListener.fire('draw-finish', point);
            this.clearEvents();
        }

    };
    export = SimpleDrawPoint;