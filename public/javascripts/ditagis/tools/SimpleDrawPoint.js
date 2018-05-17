define(["require", "exports", "dojo/on", "esri/Graphic", "esri/symbols/SimpleMarkerSymbol", "../editing/PointEditing", "../classes/EventListener", "../toolview/Tooltip"], function (require, exports, on, Graphic, SimpleMarkerSymbol, PointEditing, EventListener, Tooltip) {
    "use strict";
    var SimpleDrawPoint = (function () {
        function SimpleDrawPoint(view) {
            this.options = {
                tooltip: {
                    move: 'Nhấn vào màn hình để vẽ'
                }
            };
            this.view = view;
            this.systemVariable = view.systemVariable;
            this.drawLayer = new PointEditing(view);
            this.eventListener = new EventListener(this);
        }
        SimpleDrawPoint.prototype.draw = function (layer) {
            var _this = this;
            this.drawLayer.layer = layer;
            this.clickEvent = on(this.view, 'click', function (evt) {
                _this.clickHandler(evt);
            });
            this.pointerMoveEvent = on(this.view, 'pointer-move', function (evt) {
                Tooltip.instance().show([evt.x, evt.y], _this.options.tooltip.move);
            });
        };
        SimpleDrawPoint.prototype.clearEvents = function () {
            if (this.clickEvent) {
                this.clickEvent.remove();
                this.clickEvent = null;
            }
            if (this.pointerMoveEvent) {
                Tooltip.instance().hide();
                this.pointerMoveEvent.remove();
                this.pointerMoveEvent = null;
            }
        };
        SimpleDrawPoint.prototype.clickHandler = function (evt) {
            evt.stopPropagation();
            var point;
            point = new Graphic({
                geometry: this.view.toMap({
                    x: evt.x,
                    y: evt.y
                }),
                symbol: new SimpleMarkerSymbol()
            });
            this.eventListener.fire('draw-finish', point);
            this.clearEvents();
        };
        return SimpleDrawPoint;
    }());
    ;
    return SimpleDrawPoint;
});
