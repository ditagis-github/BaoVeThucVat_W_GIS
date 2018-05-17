define(["require", "exports", "esri/Graphic", "esri/symbols/SimpleMarkerSymbol", "esri/symbols/SimpleLineSymbol", "esri/symbols/SimpleFillSymbol", "esri/Color", "esri/layers/GraphicsLayer"], function (require, exports, Graphic, SimpleMarkerSymbol, SimpleLineSymbol, SimpleFillSymbol, Color, GraphicsLayer) {
    "use strict";
    var HightlightGraphic = (function () {
        function HightlightGraphic(view, options) {
            options = options || {};
            this.view = view;
            this.graphics = new GraphicsLayer({
                listMode: 'hide'
            });
            this.view.map.add(this.graphics);
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
            this.symbolPlg = options.symbolPlg ||
                new SimpleFillSymbol({
                    style: "none",
                    outline: new SimpleLineSymbol({
                        color: new Color([255, 64, 0, 0.4]),
                        width: 1
                    })
                });
        }
        HightlightGraphic.prototype.hightlight = function (screenCoors) {
            var _this = this;
            this.clear();
            this.view.hitTest(screenCoors).then(function (res) {
                for (var _i = 0, _a = res.results; _i < _a.length; _i++) {
                    var result = _a[_i];
                    var graphic = result.graphic;
                    if (graphic.attributes && graphic.attributes != null) {
                        _this.add(graphic);
                    }
                }
            });
        };
        HightlightGraphic.prototype.clear = function () {
            this.removeAll();
        };
        HightlightGraphic.prototype.rendererGraphic = function (type, geometry) {
            var symbol;
            if (type === 'point') {
                symbol = this.symbolMarker;
            }
            else if (type === 'polyline') {
                symbol = this.symbolLine;
            }
            else {
                symbol = this.symbolPlg;
            }
            var graphic = new Graphic({
                geometry: geometry,
                symbol: symbol
            });
            return graphic;
        };
        HightlightGraphic.prototype.add = function (graphic) {
            var type = graphic.geometry.type;
            var renderergraphic = this.rendererGraphic(type, graphic.geometry);
            this.graphics.add(renderergraphic);
        };
        HightlightGraphic.prototype.addAll = function (graphics) {
            for (var _i = 0, graphics_1 = graphics; _i < graphics_1.length; _i++) {
                var g = graphics_1[_i];
                this.add(g);
            }
        };
        HightlightGraphic.prototype.removeAll = function () {
            this.graphics.removeAll();
        };
        return HightlightGraphic;
    }());
    return HightlightGraphic;
});
