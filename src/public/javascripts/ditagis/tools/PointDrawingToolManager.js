define(["require", "exports", "./SimpleDrawPoint", "../editing/PointEditing", "../classes/EventListener"], function (require, exports, SimpleDrawPoint, PointEditing, EventListener) {
    "use strict";
    class PointDrawingToolManager {
        constructor(view) {
            this.view = view;
            this._drawLayer = null;
            this.systemVariable = view.systemVariable;
            this.simpleDrawPoint = new SimpleDrawPoint(this.view);
            this.eventListener = new EventListener(this);
            this.pointEditing = new PointEditing(this.view);
            this.registerEvent();
        }
        addFeature(graphic) {
            let accept = confirm('Chắc chắn muốn thêm?');
            if (!accept)
                return;
            this.pointEditing.draw(this.drawLayer, graphic);
        }
        registerEvent() {
            this.simpleDrawPoint.on('draw-finish', (graphic) => {
                this.eventListener.fire('draw-finish', {
                    graphic: graphic,
                    method: 'simple'
                });
                this.addFeature(graphic);
            });
        }
        set drawLayer(val) {
            this._drawLayer = val;
        }
        get drawLayer() {
            return this._drawLayer;
        }
        drawSimple() {
            this.clearEvents();
            this.simpleDrawPoint.draw(this.drawLayer);
        }
        clearEvents() {
            this.simpleDrawPoint.clearEvents();
        }
    }
    return PointDrawingToolManager;
});
//# sourceMappingURL=PointDrawingToolManager.js.map