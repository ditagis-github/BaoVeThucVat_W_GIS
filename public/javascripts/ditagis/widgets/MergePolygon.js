define(["require", "exports", "esri/geometry/geometryEngine", "../classes/ConstName", "esri/layers/GraphicsLayer", "esri/Graphic", "esri/symbols/SimpleFillSymbol", "esri/symbols/SimpleLineSymbol", "esri/core/Collection", "esri/Color"], function (require, exports, geometryEngine, constName, GraphicsLayer, Graphic, SimpleFillSymbol, SimpleLineSymbol, Collection, Color) {
    "use strict";
    const SYMBOL = new SimpleFillSymbol({
        outline: new SimpleLineSymbol({
            color: new Color('red')
        })
    });
    class MergePolygon {
        constructor(params) {
            this.mergeGraphics = new Collection();
            this.unionGraphic = null;
            this.mainGraphic = null;
            this.view = params.view;
            this.layer = params.layer;
            this.initWnd();
            this.graphicLayers = new GraphicsLayer({ listMode: 'hide' });
        }
        get isRun() {
            return this._isRun;
        }
        set isRun(v) {
            if (!v) {
                this.clear();
            }
            else {
                this.view.ui.add(this.widgetContainer, 'top-right');
            }
            this._isRun = v;
        }
        initWnd() {
            let div = document.createElement('div');
            div.id = "dtg-wget-split-polygon";
            div.classList.add('esri-widget', 'esri-widget-button', 'esri-icon-close-circled');
            div.title = "Hủy";
            div.addEventListener('click', this.clear.bind(this));
            this.widgetContainer = div;
        }
        run(mainGraphic) {
            this.mainGraphic = mainGraphic;
            this.isRun = true;
            this.graphicLayers.removeAll();
            this.mergeGraphics.add(mainGraphic);
            this.graphicLayers.add(new Graphic({
                geometry: mainGraphic.geometry,
                symbol: SYMBOL
            }));
            this.view.map.add(this.graphicLayers);
            this.clickHandler = this.view.on('click', e => {
                e.stopPropagation();
                this.view.hitTest({ x: e.x, y: e.y }).then(r => {
                    if (r.results.length > 0) {
                        let trongTrot = r.results.find(f => f.graphic.layer.id === constName.TRONGTROT);
                        if (trongTrot) {
                            if (trongTrot.graphic === mainGraphic)
                                return;
                            if (this.mergeGraphics.some(f => f === trongTrot.graphic)) {
                                this.remove(trongTrot.graphic);
                            }
                            else {
                                this.add(trongTrot.graphic);
                            }
                        }
                    }
                });
            });
            this.dblClickHandler = this.view.on('double-click', this.dblClickHandlerEvent.bind(this));
        }
        add(graphic) {
            this.graphicLayers.removeAll();
            this.mergeGraphics.add(graphic);
            let union = geometryEngine.union(this.mergeGraphics.map(m => m.geometry).toArray());
            this.graphicLayers.add(new Graphic({
                geometry: union,
                symbol: SYMBOL
            }));
            this.unionGraphic = union;
            return union;
        }
        remove(graphic) {
            this.graphicLayers.removeAll();
            this.mergeGraphics.remove(graphic);
            let union = geometryEngine.union(this.mergeGraphics.map(m => m.geometry).toArray());
            this.graphicLayers.add(new Graphic({
                geometry: union,
                symbol: SYMBOL
            }));
            this.unionGraphic = union;
            return union;
        }
        dblClickHandlerEvent(e) {
            e.stopPropagation();
            if (confirm('Có chắc chắn ghép thửa?')) {
                let deleteGrahics = this.mergeGraphics.slice(1, this.mergeGraphics.length);
                let deletes = deleteGrahics.map(m => { return { objectId: m.attributes.OBJECTID }; }).toArray();
                let updateFeature = this.mainGraphic.clone();
                updateFeature.geometry = this.unionGraphic;
                this.layer.applyEdits({
                    updateFeatures: [updateFeature],
                    deleteFeatures: deletes
                });
            }
            this.clear();
        }
        clear() {
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
        }
    }
    return MergePolygon;
});
