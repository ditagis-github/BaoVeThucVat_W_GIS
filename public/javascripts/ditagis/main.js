/**
 * Phần này quan trọng không được xóa
 */
//  var socket = io();
require([
  "ditagis/classes/ConstName",
  "ditagis/config",
  "esri/Map",
  "ditagis/classes/MapView",
  "esri/layers/TileLayer",
  "esri/layers/OpenStreetMapLayer",
  "esri/layers/MapImageLayer",
  "esri/layers/FeatureLayer",
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

  "ditagis/widgets/EditorHistory",
  "ditagis/widgets/LayerEditor",
  "ditagis/widgets/User",
  "ditagis/widgets/Popup",
  "ditagis/support/HightlightGraphic",
  'esri/symbols/SimpleFillSymbol',
  'esri/symbols/SimpleLineSymbol',
  "dojo/on",
  "dojo/dom-construct",
  "dojo/sniff",
  "css!ditagis/styling/dtg-map.css"


], function (constName, mapconfigs, Map, MapView, TileLayer, OpenStreetMapLayer, MapImageLayer, FeatureLayer,
  Expand, Locate, LayerList, Legend, Search,
  QueryTask, Query, esriRequest,
  UniqueValueRenderer, SimpleMarkerSymbol,
  SystemStatusObject,
  EditorHistory, LayerEditor, UserWidget, Popup, HightlightGraphic, SimpleFillSymbol, SimpleLineSymbol,
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
      let basemap = new MapImageLayer(bmCfg);
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
      let worldImage = new MapImageLayer({
        url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/',
        title: 'Ảnh vệ tinh',
        id: 'worldimagery',
        visible: false
      });
      let osm = new OpenStreetMapLayer({
        title: 'Open Street Map',
        id: 'osm',
        visible: false
      })
      map.addMany([osm, worldImage, basemap])

      function watchVisible(newValue, oldValue, property, target) {
        if (newValue) {
          switch (target) {
            case osm:
              basemap.visible = worldImage.visible = !newValue;
              map.findLayerById(constName.TRONGTROT).opacity = 1;
              break;
            case basemap:
              osm.visible = worldImage.visible = !newValue;
              map.findLayerById(constName.TRONGTROT).opacity = 1;
              break;
            case worldImage:
              osm.visible = basemap.visible = !newValue;
              map.findLayerById(constName.TRONGTROT).opacity = 0.7;
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
                delete: lr.isDelete,
                edit: lr.isEdit
              }

            }
            for (var i in mapconfigs.layers) {
              let element = mapconfigs.layers[i];
              if (element.permission.view) {
                if (element.id === constName.SAUBENH) {
                  let date = new Date();
                  date.setDate(date.getDate() - 365);
                  element.definitionExpression = `NgayXayRa >= date '${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}'`;
                  element.renderer = new UniqueValueRenderer({
                    field: "CapDoGayHai",
                    uniqueValueInfos: [{
                      value: "1",
                      symbol: new SimpleMarkerSymbol({
                        color: '#0f0',
                        style: 'circle',
                        outline: {
                          color: "white"
                        }
                      }),
                      label: "Nhẹ"
                    }, {
                      value: "2",
                      symbol: new SimpleMarkerSymbol({
                        color: '#00a9e6',
                        style: 'circle',
                        outline: {
                          color: "white"
                        }
                      }),
                      label: "Nặng"
                    }, {
                      value: "3", // code for U.S. highways
                      symbol: new SimpleMarkerSymbol({
                        color: '#ff0000',
                        style: 'circle',
                        outline: {
                          color: "white"
                        }
                      }),
                      label: "Mất trắng"
                    }, {
                      value: "4", // code for U.S. highways
                      symbol: new SimpleMarkerSymbol({
                        color: '#ffff6d',
                        style: 'circle',
                        outline: {
                          color: "white"
                        }
                      }),
                      label: "Trung bình"
                    }]
                  });
                }
                if (definitionExpression) {
                  if (element.definitionExpression) {
                    element.definitionExpression += ` and ` + definitionExpression;
                  } else {
                    element.definitionExpression = definitionExpression;
                  }
                  element.definitionExpression = definitionExpression;
                }

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
      if (!has('android') && !has('ios') && !has('bb')) {
        //Add Logo DATAGIS to the bottom left of the view
        var logo = domConstruct.create("img", {
          src: "images/logo-ditagis.png",
          id: "dtg-widget-logo",
        });
        view.ui.add(logo, "bottom-right");
      }
      //LEGEND
      view.ui.add(new Expand({
        expandIconClass: "esri-icon-collection",
        content: new Legend({
          view: view,
        })
      }), "top-left");
      var hightlightGraphic = new HightlightGraphic(view, {
        symbolPlg: new SimpleFillSymbol({
          style: "none",
          outline: new SimpleLineSymbol({ // autocasts as SimpleLineSymbol
            color: "black",
            width: 3
          })
        })
      });
      // Widget Search Features //
      var searchWidget = new Search({
        view: view,
        allPlaceholder: "Nhập nội dung tìm kiếm",
        sources: [{
          featureLayer: map.findLayerById(constName.SAUBENH),
          searchFields: ["OBJECTID", "MaSauBenh", "MaHuyenTP"],
          displayField: "MaSauBenh",
          exactMatch: false,
          outFields: ["*"],
          name: "Sâu hại",
          placeholder: "Tìm kiếm theo tên, loại cây trồng, huyện/tp",
        }, {
          featureLayer: map.findLayerById(constName.DOANHNGHIEP),
          searchFields: ["OBJECTID", "MaDoanhNghiep", "NguoiDaiDienDoanhNghiep"],
          displayField: "NguoiDaiDienDoanhNghiep",

          exactMatch: false,
          outFields: ["*"],
          name: "Doanh Nghiệp",
          placeholder: "Nhập tên hoặc mã Doanh nghiệp",
        }, {
          featureLayer: map.findLayerById(constName.TRONGTROT),
          searchFields: ["MaDoiTuong"],
          displayField: "MaDoiTuong",

          exactMatch: false,
          outFields: ["*"],
          name: "Trồng Trọt",
          placeholder: "Nhập mã đối tượng Trồng trọt",
        }, {
          featureLayer: new FeatureLayer({
            // url: mapconfigs.basemap.url + '/' + constName.INDEX_HANHCHINHHUYEN
            url: "https://ditagis.com:6443/arcgis/rest/services/BinhDuong/DuLieuNen/MapServer/4"
          }),
          searchFields: ["MaPhuongXa", "TenXa"],
          displayField: "TenXa",
          outFields: ["*"],
          name: "Hành chính xã",
          placeholder: "Nhập tên xã/ phường"
        }, {
          featureLayer: new FeatureLayer({
            url: "https://ditagis.com:6443/arcgis/rest/services/BinhDuong/DuLieuNen/MapServer/0"
          }),
          searchFields: ["Ten", "maNhanDang"],
          displayField: "maNhanDang",
          exactMatch: false,
          outFields: ["*"],
          name: "Tìm đường",
          placeholder: "Nhập tên đường"
        }]
      });
      // Add the search widget to the top left corner of the view
      view.ui.add(searchWidget, {
        position: "top-right"
      });
      searchWidget.on('search-complete', e => {
        hightlightGraphic.clear();
        let hanhChinh = e.results.find(f => {
          return f.sourceIndex === 3
        });
        if (hanhChinh && hanhChinh.results.length > 0) {
          let graphic = hanhChinh.results[0].feature;
          hightlightGraphic.add(graphic);
        }
      })
      /**
       * Layer Editor
       */
      var layerEditor = new LayerEditor(view);
      layerEditor.startup();



      var popup = new Popup(view);
      popup.startup();
      var editorHistory = new EditorHistory({
        view: view
      });
      layerEditor.on("draw-finish", function (e) {
        editorHistory.add({
          layerName: e.graphic.layer.title,
          geometry: e.graphic.geometry
        });
      })
    }

    initBaseMap();
    initFeatureLayers().then(() => {
      initWidgets();
    })


    Loader.hide();
  })
})