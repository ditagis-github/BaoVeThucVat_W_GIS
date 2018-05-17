define(["require", "exports", "esri/geometry/geometryEngine", "../classes/ConstName", "esri/layers/GraphicsLayer", "esri/Graphic", "esri/symbols/SimpleFillSymbol", "esri/symbols/SimpleLineSymbol", "esri/core/Collection", "esri/Color"], function (require, exports, geometryEngine, constName, GraphicsLayer, Graphic, SimpleFillSymbol, SimpleLineSymbol, Collection, Color) {
    "use strict";
    var SYMBOL = new SimpleFillSymbol({
        outline: new SimpleLineSymbol({
            color: new Color('red')
        })
    });
    var MergePolygon = (function () {
        function MergePolygon(params) {
            this.mergeGraphics = new Collection();
            this.unionGraphic = null;
            this.mainGraphic = null;
            this.view = params.view;
            this.layer = params.layer;
            this.initWnd();
            this.graphicLayers = new GraphicsLayer({ listMode: 'hide' });
        }
        Object.defineProperty(MergePolygon.prototype, "isRun", {
            get: function () {
                return this._isRun;
            },
            set: function (v) {
                if (!v) {
                    this.clear();
                }
                else {
                    this.view.ui.add(this.widgetContainer, 'top-right');
                }
                this._isRun = v;
            },
            enumerable: true,
            configurable: true
        });
        MergePolygon.prototype.initWnd = function () {
            var div = document.createElement('div');
            div.id = "dtg-wget-split-polygon";
            div.classList.add('esri-widget', 'esri-widget-button', 'esri-icon-close-circled');
            div.title = "Hủy";
            div.addEventListener('click', this.clear.bind(this));
            this.widgetContainer = div;
        };
        MergePolygon.prototype.run = function (mainGraphic) {
            var _this = this;
            this.mainGraphic = mainGraphic;
            this.isRun = true;
            this.graphicLayers.removeAll();
            this.mergeGraphics.add(mainGraphic);
            this.graphicLayers.add(new Graphic({
                geometry: mainGraphic.geometry,
                symbol: SYMBOL
            }));
            this.view.map.add(this.graphicLayers);
            this.clickHandler = this.view.on('click', function (e) {
                e.stopPropagation();
                _this.view.hitTest({ x: e.x, y: e.y }).then(function (r) {
                    if (r.results.length > 0) {
                        var trongTrot_1 = r.results.find(function (f) { return f.graphic.layer.id === constName.TRONGTROT; });
                        if (trongTrot_1) {
                            if (trongTrot_1.graphic === mainGraphic)
                                return;
                            if (_this.mergeGraphics.some(function (f) { return f === trongTrot_1.graphic; })) {
                                _this.remove(trongTrot_1.graphic);
                            }
                            else {
                                _this.add(trongTrot_1.graphic);
                            }
                        }
                    }
                });
            });
            this.dblClickHandler = this.view.on('double-click', this.dblClickHandlerEvent.bind(this));
        };
        MergePolygon.prototype.add = function (graphic) {
            this.graphicLayers.removeAll();
            this.mergeGraphics.add(graphic);
            var union = geometryEngine.union(this.mergeGraphics.map(function (m) { return m.geometry; }).toArray());
            this.graphicLayers.add(new Graphic({
                geometry: union,
                symbol: SYMBOL
            }));
            this.unionGraphic = union;
            return union;
        };
        MergePolygon.prototype.remove = function (graphic) {
            this.graphicLayers.removeAll();
            this.mergeGraphics.remove(graphic);
            var union = geometryEngine.union(this.mergeGraphics.map(function (m) { return m.geometry; }).toArray());
            this.graphicLayers.add(new Graphic({
                geometry: union,
                symbol: SYMBOL
            }));
            this.unionGraphic = union;
            return union;
        };
        MergePolygon.prototype.dblClickHandlerEvent = function (e) {
            e.stopPropagation();
            if (confirm('Có chắc chắn ghép thửa?')) {
                var deleteGrahics = this.mergeGraphics.slice(1, this.mergeGraphics.length);
                var deletes = deleteGrahics.map(function (m) { return { objectId: m.attributes.OBJECTID }; }).toArray();
                var updateFeature = this.mainGraphic.clone();
                updateFeature.geometry = this.unionGraphic;
                this.layer.applyEdits({
                    updateFeatures: [updateFeature],
                    deleteFeatures: deletes
                });
            }
            this.clear();
        };
        MergePolygon.prototype.clear = function () {
            this.view.ui.remove(this.widgetContainer);
            this.mainGraphic = null;
            if (this.clickHandler) {
                this.clickHandler.remove();
                delete this.clickHandler;
            }
            this.graphicLayers.removeAll();
            this.view.map.remove(this.graphicLayers);
            this.mergeGraphics.removeAll();
            if (this.dblClickHandler) {
                this.dblClickHandler.remove();
                delete this.dblClickHandler;
            }
        };
        return MergePolygon;
    }());
    return MergePolygon;
});
