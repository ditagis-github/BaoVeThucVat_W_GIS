require([
  "ditagis/classes/ConstName",
  "ditagis/config",
  "esri/Map",
  "esri/tasks/Locator",
  "ditagis/classes/MapView",
  "esri/layers/OpenStreetMapLayer",
  "esri/layers/MapImageLayer",
  "esri/layers/FeatureLayer",
  "esri/layers/WebTileLayer",
  "esri/widgets/Expand",
  "esri/widgets/Locate",
  "esri/widgets/LayerList",
  "esri/widgets/Legend",
  "esri/widgets/Search",
  "esri/tasks/QueryTask",
  "esri/tasks/support/Query",
  "esri/request",
  "esri/renderers/UniqueValueRenderer",
  "esri/symbols/SimpleMarkerSymbol",
  "ditagis/classes/SystemStatusObject",

  "ditagis/widgets/User",
  "ditagis/widgets/Popup",
  'esri/symbols/SimpleFillSymbol',
  'esri/symbols/SimpleLineSymbol',
  "esri/geometry/Extent",
  "dojo/on",
  "dojo/dom-construct",
  "dojo/sniff",
  "css!ditagis/styling/dtg-map.css"


], function (constName, mapconfigs, Map, Locator, MapView, OpenStreetMapLayer, MapImageLayer, FeatureLayer, WebTileLayer,
  Expand, Locate, LayerList, Legend, Search,
  QueryTask, Query, esriRequest,
  UniqueValueRenderer, SimpleMarkerSymbol,
  SystemStatusObject,
  UserWidget, Popup, SimpleFillSymbol, SimpleLineSymbol, Extent,
  on, domConstruct, has
) {
    'use strict';
    var systemVariable = new SystemStatusObject();
    var map = new Map({
      // basemap: 'osm'
    });
    var view = new MapView({
      container: "map", // Reference to the scene div created in step 5
      map: map, // Reference to the map object created before the scene
      center: mapconfigs.center,
      zoom: mapconfigs.zoom
    });
    var basemap, worldImage, osm;
    view.session().then(user => {
      systemVariable.user = user
      let definitionExpression;
      if (Math.floor(systemVariable.user.role / 100) === 7) { //role bat dau tu so 7
        definitionExpression = `MaHuyenTP = '${systemVariable.user.role.trim()}'`; //vi du role = 725, => MaHuyenTP = 725
      }

      view.systemVariable = systemVariable;
      const initBaseMap = () => {
        let bmCfg = mapconfigs.basemap; //basemap config
        if (definitionExpression) {
          for (let sublayer of bmCfg.sublayers) {
            sublayer.definitionExpression = definitionExpression;
          }
        }
        bmCfg.visible = false;
        basemap = new MapImageLayer(bmCfg);
        basemap.watch('visible', function (value) {
          if ($)
            $.notify(value ? 'Hiển thị dữ liệu nền' : 'Ẩn dữ liệu nền');
        });
        basemap.then(() => {
          if (definitionExpression) {
            let layer = basemap.findSublayerById(constName.INDEX_HANHCHINHHUYEN);
            let query = layer.createQuery();
            query.where = definitionExpression;
            query.returnGeometry = true;
            query.outSpatialReference = view.spatialReference;
            layer.queryFeatures(query).then(res => {
              let ft = res.features[0];
              view.goTo({
                target: ft.geometry
              })
            })
          }
        })
        worldImage = new WebTileLayer({
          urlTemplate: '//mt1.google.com/vt/lyrs=y&x={col}&y={row}&z={level}',
          title: 'Ảnh vệ tinh',
          id: 'worldimagery',
          visible: true
        });
        osm = new WebTileLayer({
          title: 'Đường đi',
          urlTemplate: '//mt1.google.com/vt/lyrs=m&x={col}&y={row}&z={level}',
          id: 'osm',
          visible: false
        })
        map.addMany([osm, worldImage, basemap])

        function watchVisible(newValue, oldValue, property, target) {
          if (newValue) {
            switch (target) {
              case osm:
                basemap.visible = worldImage.visible = !newValue;
                // map.findLayerById(constName.TRONGTROT).opacity = 1;
                break;
              case basemap:
                osm.visible = worldImage.visible = !newValue;
                // map.findLayerById(constName.TRONGTROT).opacity = 1;
                break;
              case worldImage:
                osm.visible = basemap.visible = !newValue;
                // map.findLayerById(constName.TRONGTROT).opacity = 0.7;
                break;
            }
          }
        }
        osm.watch('visible', watchVisible)
        worldImage.watch('visible', watchVisible)
        basemap.watch('visible', watchVisible)
      }
      const initFeatureLayers = () => {
        /**
         * Lấy attachments của feature layer
         */
        FeatureLayer.prototype.getAttachments = function (id) {
          return new Promise((resolve, reject) => {
            var url = this.url + "/" + this.layerId + "/" + id;
            esriRequest(url + "/attachments?f=json", {
              responseType: 'json',
              method: 'get'
            }).then(result => {
              resolve(result.data || null);
            });
          });
        }
        return new Promise((resolve, reject) => {
          esriRequest('/map/layerrole', {
            method: 'post'
          }).then(res => {
            if (res.data) {
              for (let lr of res.data) {
                let layer = mapconfigs.layers.find(f => f.id === lr.layer);
                layer.permission = {
                  create: lr.isCreate,
                  view: lr.isView,
                  delete: lr.false,
                  edit: lr.false
                }

              }
              for (var i in mapconfigs.layers) {
                let element = mapconfigs.layers[i];
                if (element.permission.view) {
                  if (element.id === constName.SAUBENH || element.id === constName.DOANHNGHIEP) {
                    continue;
                  }
                  if (definitionExpression) {
                    if (element.definitionExpression) {
                      element.definitionExpression += ` and ` + definitionExpression;
                    } else {
                      element.definitionExpression = definitionExpression;
                    }
                    element.definitionExpression = definitionExpression;
                  }
                  if (element.id === constName.TRONGTROT)
                    element.opacity = 0.7
                  let fl = new FeatureLayer(element);
                  map.add(fl);
                }
              }
              resolve();
            } else {
              throw 'cannot request permission';
            }
          })

        });
      }
      const initWidgets = () => {
        function searchWidget() {
          var searchdiv = $('<div/>', {
            class: 'input-group add-on',
          });
          var searchbox = $('<input/>', {
            class: 'form-control',
            type: 'text',
            name: 'srch-term',
            id: 'srch-term',
            placeholder: "Nhập đơn vị hành chính, tên đường "
          }).appendTo(searchdiv);
          var input_group = $('<div/>', {
            class: 'input-group-btn',
          }).appendTo(searchdiv);
          var btnsearch = $('<button/>', {
            class: 'btn btn-default',
            type: 'submit',
          }).appendTo(input_group);
          var iconsearch = $('<i/>', {
            class: 'glyphicon glyphicon-search',
          }).appendTo(btnsearch);
          var data;
          var ketqua = $('<div/>', {
            class: 'output-group add-on',
            id: 'ketqua'
          });
          view.ui.add(searchdiv[0], 'top-left');
          view.ui.add(ketqua[0], 'top-left');
          btnsearch.on('click', ((e) => {
            function clearResultSearch() {
              var ketqua = document.getElementById('ketqua');
              if (ketqua)
                while (ketqua.firstChild) {
                  ketqua.removeChild(ketqua.firstChild);
                }
            }
            function btnChiTietClick(bound) {
              let extent = new Extent({
                ymin: bound.southwest.lat,
                ymax: bound.northeast.lat,
                xmin: bound.southwest.lng,
                xmax: bound.northeast.lng,
              });
              view.goTo(extent);
              clearResultSearch();
            }
            let address = searchbox.val().toString().replace(/[ ]/g, '+');
            $.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=AIzaSyC9VTEqoczK2j7lDRacfQ3aRTE3f4vuHek`).done((response) => {
              let results = response.results;
              clearResultSearch();
              for (const item of results) {
                let div = $('<div />', {
                  class: 'address list-group-item'
                }).appendTo(ketqua);
                var diachi_chitiet = $('<div />', {
                  class: 'address-detail',
                  text: item.formatted_address
                }).appendTo(div);
                diachi_chitiet.click(() => btnChiTietClick(item.geometry.viewport));
              }
            });
          }));
        }
        searchWidget();
        var userWidget = new UserWidget(view);
        userWidget.startup();
        view.ui.move(["zoom"], "top-left");
        //LAYER LIST
        view.ui.add(new Expand({
          expandIconClass: "esri-icon-layer-list",
          view: view,
          content: new LayerList({
            container: document.createElement("div"),
            view: view
          })
        }), "top-left");


        //LOCATE
        view.ui.add(new Locate({
          view: view
        }), "top-left");
        //neu khong phai la thiet bi di dong
        //LEGEND
        view.ui.add(new Expand({
          expandIconClass: "esri-icon-collection",
          content: new Legend({
            view: view,
          })
        }), "top-left");

        /**
         * Layer Editor
         */
        var popup = new Popup(view);
        popup.startup();
      }

      initBaseMap();
      initFeatureLayers().then(() => {
        initWidgets();
        map.reorder(basemap, 5)
      })


      Loader.hide();
    })
  })