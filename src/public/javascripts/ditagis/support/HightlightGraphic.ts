import Graphic = require("esri/Graphic");
import SimpleMarkerSymbol = require("esri/symbols/SimpleMarkerSymbol");
import SimpleLineSymbol = require("esri/symbols/SimpleLineSymbol");
import SimpleFillSymbol = require("esri/symbols/SimpleFillSymbol");
import View = require('esri/views/MapView');
import Color = require('esri/Color');
import GraphicsLayer = require('esri/layers/GraphicsLayer');
class HightlightGraphic {
  private view: View;
  private symbolMarker: SimpleMarkerSymbol;
  private symbolLine: SimpleLineSymbol;
  private symbolPlg: SimpleFillSymbol;
  private graphics: GraphicsLayer;
  constructor(view: View, options) {
    options = options || {};
    this.view = view;
    this.graphics = new GraphicsLayer({
      listMode:'hide'
    })
    this.view.map.add(this.graphics);
    this.symbolMarker = options.symbolMarker || new SimpleMarkerSymbol({
      color: new Color([255, 0, 0]),
      size: 3,
      outline: new SimpleLineSymbol({
        width: 7,
        color: new Color([255, 64, 0, 0.4])
      })
    })

    this.symbolLine = options.symbolLine || new SimpleLineSymbol({
      color: new Color([255, 0, 0]),
      width: 4
    })
    this.symbolPlg = options.symbolPlg ||
      new SimpleFillSymbol({
        style: "none",
        outline: new SimpleLineSymbol({ // autocasts as SimpleLineSymbol
          color: new Color([255, 64, 0, 0.4]),
          width: 1
        })
      })
  }
  /**
   * Làm sáng các graphic được tìm thấy xung quanh screenCoor
   * @param {ScreenCoor{x,y}} screenCoors 
   */
  hightlight(screenCoors): void {
    this.clear(); //xóa cái hightlight hiện có
    //tìm những graphic có ở tọa độ screenCoors
    this.view.hitTest(screenCoors).then((res) => {
      //duyệt kết quả
      for (let result of res.results) {
        const graphic = result.graphic; //lấy graphic
        //kiểm tra xem có attributes hay không
        //nếu không có nghĩa là graphic này không được sinh ra từ FeatureLayer services
        if (graphic.attributes && graphic.attributes != null) {
          this.add(graphic);
        }
      }
      //nếu như có graphic cần hightlight thì gọi renderer
    })
  }
  /**
   * Trên bản đồ chỉ được hightlight duy nhất một vùng nên 
   * cần phải có phương thức này để xóa các hightlight của những layer khác
   * vì giải thuật này hightlight theo UniqueValuaRenderer 
   * nên sẽ có tình trạng những layer khác nhau được hightligt thì sẽ không bị ẩn đi
   * có thể xóa dùng this.clear() ở phương thức hightlight để nhìn nhận rõ ràng hơn
   */
  clear() {
    this.removeAll();
  }
  rendererGraphic(type, geometry) {
    let symbol;

    if (type === 'point') {
      symbol = this.symbolMarker;
    } else if (type === 'polyline') {
      symbol = this.symbolLine;
    } else {
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
    this.graphics.add(renderergraphic);
  }
  addAll(graphics) {
    for (let g of graphics) {
      this.add(g);
    }
  }
  removeAll() {
    this.graphics.removeAll();
  }
}
export = HightlightGraphic;