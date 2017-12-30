import QueryTask = require("esri/tasks/QueryTask");
import Query = require("esri/tasks/support/Query");
import editingSupport = require('../support/Editing');
import View = require('esri/views/MapView');
import FeatureLayer = require('esri/layers/FeatureLayer');
import Point = require('esri/geometry/Point');
import Graphic = require('esri/Graphic');
import constName = require('../classes/ConstName');
class PointEditing {
  private view: View
  private _layer: FeatureLayer;
  constructor(view: View) {
    if (view) {
      this.view = view;
    }
  }
  get layer(): FeatureLayer {
    return this._layer;
  }
  set layer(value: FeatureLayer) {
    this._layer = value;
  }
  async draw(layer, graphic) {
    try {
      var notify = $.notify({
        title: '<strong>Cập nhật đối tượng</strong>',
        message: 'Đang cập nhật...'
      }, {
          showProgressbar: true,
          delay: 20000
        });
      //tạo attributes để giữ giá trị cho graphic attribute khi sử dụng phương thức applyEdits
      let attributes = {};

      /**
       * ví dụ sử dụng domain thì cần phải gán domain vào attributes thì khi thêm đối tượng
       * vào cơ sở dữ liệu thì mới hiển thị lên được bản đồ
       */
      if (layer.drawingAttributes) {
        for (let i in layer.drawingAttributes) {
          attributes[i] = layer.drawingAttributes[i];
        }
      }
      if (layer.id === constName.SAUBENH) {
        attributes['NgayXayRa'] = new Date().getTime();
      }



      //lấy thông tin cập nhật gồm người tạo và thời gian tạo
      notify.update('type', 'info')
      notify.update('message', 'Đang lấy định danh...')
      notify.update('progress', 20)
      const createdInfo = await editingSupport.getCreatedInfo(this.view);
      for (let i in createdInfo) {
        attributes[i] = createdInfo[i];
      }
      notify.update('type', 'info')
      notify.update('message', 'Lấy định danh thành công')
      notify.update('progress', 30)
      graphic.attributes = attributes;
      let edits = {
        addFeatures: [graphic]
      };
      layer.applyEdits(edits).then((result) => {
        if (result.addFeatureResults.length > 0) {
          for (let item of result.addFeatureResults) {
            //lấy thông tin xã huyện
            notify.update('type', 'info');
            notify.update('message', 'Đang lấy vị trí...!')
            notify.update('progress', 55)
            var proms = [];
            if (layer.id === constName.SAUBENH)
              proms.push(editingSupport.getLocationInfo(this.view, graphic.geometry));
            proms.push(editingSupport.getNhomCayTrong(this.view, graphic.geometry));
            Promise.all(proms).then((value) => {
              notify.update('type', 'info');
              notify.update('message', 'Lấy vị trí thành công!')
              notify.update('progress', 80);
              let attributes = { objectId: item.objectId };
              for (let i in value[0]) {
                attributes[i] = value[0][i];
              }
              if (value[1])
                for (let i in value[1]) {
                  attributes[i] = value[1][i];
                }
              layer.applyEdits({
                updateFeatures: [{
                  attributes: attributes
                }]
              }).then((result) => {
                if (!result.updateFeatureResults[0].error) {
                  Promise.resolve();
                  notify.update('type', 'success')
                  notify.update('message', 'Cập nhật vị trí thành công!')
                  notify.update('progress', 100);
                  //POPUP OPEN
                  layer.queryFeatures({
                    returnGeometry: true,
                    spatialReference: this.view.spatialReference,
                    where: 'OBJECTID = ' + item.objectId,
                    outFields: ['*']
                  }).then(res => {
                    //neu tim duoc
                    if (res.features[0]) {
                      let ft = res.features[0];
                      this.view.popup.open({
                        features: [ft],
                        location: ft.geometry
                      });
                    }
                  });
                }
                else{
                  notify.update('type', 'danger')
                  Promise.reject("err");
                }
              });

            });



          }
        }
      })
    } catch (err) {
      console.log(err);
    }
  }

}
export = PointEditing;