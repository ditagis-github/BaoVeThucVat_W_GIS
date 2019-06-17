import geometryEngine = require('esri/geometry/geometryEngine');
import constName = require('../classes/ConstName');
import GraphicsLayer = require('esri/layers/GraphicsLayer');
import Graphic = require('esri/Graphic');
import SimpleFillSymbol = require('esri/symbols/SimpleFillSymbol');
import SimpleLineSymbol = require('esri/symbols/SimpleLineSymbol');
import Collection = require('esri/core/Collection');
import Color = require('esri/Color');
const SYMBOL = new SimpleFillSymbol({
  outline: new SimpleLineSymbol({
    color: new Color('red')
  })
})
class MergePolygon {
  private view: __esri.MapView;
  private layer: __esri.FeatureLayer;
  private mergeGraphics: Collection<__esri.Graphic> = new Collection();
  private graphicLayers: __esri.GraphicsLayer;
  private clickHandler;
  private dblClickHandler;
  private _isRun: boolean;
  private widgetContainer;
  private unionGraphic: __esri.Polygon = null;
  private mainGraphic: __esri.Graphic = null;
  public get isRun(): boolean {
    return this._isRun;
  }
  public set isRun(v: boolean) {
    if (!v) {
      this.clear();
    } else {
      this.view.ui.add(this.widgetContainer, 'top-right');
    }
    this._isRun = v;
  }

  constructor(params: { view: __esri.MapView, layer: __esri.FeatureLayer }) {
    this.view = params.view;
    this.layer = params.layer;
    this.initWnd();
    this.graphicLayers = new GraphicsLayer({ listMode: 'hide' });
  }
  private initWnd() {
    let div = document.createElement('div');
    div.id = "dtg-wget-split-polygon";
    div.classList.add('esri-widget', 'esri-widget-button', 'esri-icon-close-circled');
    div.title = "Hủy";
    div.addEventListener('click', this.clear.bind(this));
    this.widgetContainer = div;
  }
  public run(mainGraphic: Graphic) {
    this.mainGraphic = mainGraphic;
    this.isRun = true;
    this.graphicLayers.removeAll();
    this.mergeGraphics.add(mainGraphic);
    this.graphicLayers.add(new Graphic({
      geometry: mainGraphic.geometry,
      symbol: SYMBOL
    }))
    this.view.map.add(this.graphicLayers);
    this.clickHandler = this.view.on('click', event => {
      event.stopPropagation();
      var layer = this.view.map.findLayerById(constName.TRONGTROT) as __esri.FeatureLayer;
      const queryParams = layer.createQuery();
      queryParams.geometry = event.mapPoint;
      layer.queryFeatures(queryParams).then((results)=>{
        // prints the array of result graphics to the console
        console.log(results.features);
        var feature = results.features[0];
        if (feature.attributes.OBJECTID === mainGraphic.attributes.OBJECTID)
        return;
        if (this.mergeGraphics.some(f => f === feature)) {
            this.remove(feature);
        }
        else {
            this.add(feature);
        }
      });
    })
    this.dblClickHandler = this.view.on('double-click', this.dblClickHandlerEvent.bind(this))
  }
  private add(graphic: __esri.Graphic): __esri.Polygon {
    this.graphicLayers.removeAll();
    this.mergeGraphics.add(graphic);
    let union = geometryEngine.union(this.mergeGraphics.map(m => m.geometry).toArray()) as __esri.Polygon;
    this.graphicLayers.add(new Graphic({
      geometry: union,
      symbol: SYMBOL
    }))
    this.unionGraphic = union;
    return union as __esri.Polygon;
  }
  private remove(graphic: __esri.Graphic): __esri.Polygon {
    this.graphicLayers.removeAll();
    this.mergeGraphics.remove(graphic);
    let union = geometryEngine.union(this.mergeGraphics.map(m => m.geometry).toArray()) as __esri.Polygon;
    this.graphicLayers.add(new Graphic({
      geometry: union,
      symbol: SYMBOL
    }))
    this.unionGraphic = union;
    return union as __esri.Polygon;
  }
  private dblClickHandlerEvent(e: __esri.MapViewDoubleClickEvent) {
    e.stopPropagation();
    if (confirm('Có chắc chắn ghép thửa?')) {
      let deleteGrahics = this.mergeGraphics.slice(1, this.mergeGraphics.length);
      let deletes = deleteGrahics.map(m => { return { objectId: m.attributes.OBJECTID } }).toArray();
      let updateFeature = this.mainGraphic.clone();
      updateFeature.geometry = this.unionGraphic;
      this.layer.applyEdits({
        updateFeatures: [updateFeature],
        deleteFeatures: deletes
      })
    }
    this.clear();
  }
  private clear() {
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
      this.dblClickHandler.remove()
      delete this.dblClickHandler;
    }
  }
}
export = MergePolygon;