import MapView = require('esri/views/MapView');
import SystemStatusObject = require('./SystemStatusObject');
import esriRequest = require('esri/request');
class MapViewDTG extends MapView{
  systemVariable:SystemStatusObject;
  constructor(params){
    super(params);
    this.systemVariable  = new SystemStatusObject();
  }
  /**
   * session
   */
  public session():Promise<any> {
    return new Promise((resolve, reject) => {
      esriRequest('/map', {
        method: 'post'
      }).then(res=>{
        this.systemVariable.user = res.data;
        resolve(res.data);
      })
    });
  }
}
export = MapViewDTG;