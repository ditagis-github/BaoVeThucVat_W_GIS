define(["require", "exports", "esri/Graphic", "esri/symbols/SimpleMarkerSymbol", "esri/symbols/SimpleLineSymbol", "esri/Color"], function (require, exports, Graphic, SimpleMarkerSymbol, SimpleLineSymbol, Color) {
    "use strict";
    class HightlightGraphic {
        constructor(view, options) {
            options = options || {};
            this.view = view;
            this.symbolMarker = options.symbolMarker || new SimpleMarkerSymbol({
                color: new Color([255, 0, 0]),
                size: 3,
                outline: new SimpleLineSymbol({
                    width: 7,
                    color: new Color([255, 64, 0, 0.4])
                })
            });
            this.symbolLine = options.symbolLine || new SimpleLineSymbol({
                color: new Color([255, 0, 0]),
                width: 4
            });
            this.symbolPlg = options.symbolPlg || {
                type: 'simple-polygon',
                color: [255, 0, 0],
                size: 3,
                width: 4,
                outline: {
                    color: [255, 64, 0, 0.4],
                    width: 7
                }
            };
            this.tmpGraphics = [];
        }
        hightlight(screenCoors) {
            this.clear();
            this.view.hitTest(screenCoors).then((res) => {
                for (let result of res.results) {
                    const graphic = result.graphic;
                    if (graphic.attributes && graphic.attributes != null) {
                        this.add(graphic);
                    }
                }
            });
        }
        clear() {
            this.removeAll();
        }
        rendererGraphic(type, geometry) {
            let symbol;
            if (type === 'point') {
                symbol = this.symbolMarker;
            }
            else if (type === 'polyline') {
                symbol = this.symbolLine;
            }
            else {
                symbol = this.symbolPlg;
            }
            let graphic = new Graphic({
                geometry: geometry,
                symbol: symbol
            });
            return graphic;
        }
        add(graphic) {
            const type = graphic.geometry.type;
            let renderergraphic = this.rendererGraphic(type, graphic.geometry);
            this.tmpGraphics.push(renderergraphic);
            this.view.graphics.add(renderergraphic);
        }
        addAll(graphics) {
            for (let g of graphics) {
                this.add(g);
            }
        }
        removeAll() {
            for (let g of this.tmpGraphics) {
                this.view.graphics.remove(g);
            }
            this.tmpGraphics = [];
        }
    }
    return HightlightGraphic;
});
//# sourceMappingURL=HightlightGraphic.js.map