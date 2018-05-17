define(["require", "exports", "./SimpleDrawPoint", "../editing/PointEditing", "../classes/EventListener"], function (require, exports, SimpleDrawPoint, PointEditing, EventListener) {
    "use strict";
    var PointDrawingToolManager = (function () {
        function PointDrawingToolManager(view) {
            this.view = view;
            this._drawLayer = null;
            this.systemVariable = view.systemVariable;
            this.simpleDrawPoint = new SimpleDrawPoint(this.view);
            this.eventListener = new EventListener(this);
            this.pointEditing = new PointEditing(this.view);
            this.registerEvent();
        }
        PointDrawingToolManager.prototype.addFeature = function (graphic) {
            var accept = confirm('Chắc chắn muốn thêm?');
            if (!accept)
                return;
            return this.pointEditing.draw(this.drawLayer, graphic);
        };
        PointDrawingToolManager.prototype.registerEvent = function () {
            var _this = this;
            this.simpleDrawPoint.on('draw-finish', function (graphic) {
                _this.addFeature(graphic).then(function (_) {
                    _this.eventListener.fire('draw-finish', {
                        graphic: {
                            layer: _this.drawLayer,
                            attributes: graphic.attributes,
                            geometry: graphic.geometry
                        },
                        method: 'simple'
                    });
                });
            });
        };
        Object.defineProperty(PointDrawingToolManager.prototype, "drawLayer", {
            get: function () {
                return this._drawLayer;
            },
            set: function (val) {
                this._drawLayer = val;
            },
            enumerable: true,
            configurable: true
        });
        PointDrawingToolManager.prototype.drawSimple = function () {
            this.clearEvents();
            this.simpleDrawPoint.draw(this.drawLayer);
        };
        PointDrawingToolManager.prototype.clearEvents = function () {
            this.simpleDrawPoint.clearEvents();
        };
        return PointDrawingToolManager;
    }());
    return PointDrawingToolManager;
});
