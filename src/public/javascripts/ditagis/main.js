

/**
 * Phần này quan trọng không được xóa
 */
const constName = {
    SAUBENH: 'SauBenh',
    DOANHNGHIEP: 'DoanhNghiep',
    TRONGTROT: 'TrongTrot',
}
//  var socket = io();
require([
    "ditagis/config",
    "esri/Map",
    "esri/views/MapView",
    "esri/layers/TileLayer",
    "esri/layers/OpenStreetMapLayer",
    "esri/layers/MapImageLayer",
    "esri/layers/FeatureLayer",
    "esri/widgets/Expand",
    "esri/widgets/Locate",
    "esri/widgets/LayerList",
    "esri/widgets/Legend",
    "esri/widgets/Search",
    "esri/widgets/BasemapToggle",
    "esri/tasks/QueryTask",
    "esri/tasks/support/Query",
    "esri/request",
    "ditagis/classes/SystemStatusObject",

    "ditagis/widgets/LayerEditor",
    "ditagis/widgets/User",
    "ditagis/widgets/Popup",
    "ditagis/widgets/TimeSlider",
    "dojo/on",
    "dojo/dom-construct",
    "dojo/sniff",
    "css!ditagis/styling/dtg-map.css"


], function (mapconfigs, Map, MapView, TileLayer, OpenStreetMapLayer, MapImageLayer, FeatureLayer,
    Expand, Locate, LayerList, Legend, Search, BasemapToggle,
    QueryTask, Query, esriRequest,
    SystemStatusObject,
    LayerEditor, UserWidget, Popup, TimeSlider,
    on, domConstruct, has
) {
        'use strict';
        esriRequest('/map', {
            method: 'post'
        }).then(res => {
            try {
                if (res.data) {
                    var systemVariable = new SystemStatusObject();
                    var map = new Map({
                        basemap: 'osm'
                    });

                    systemVariable.user = res.data
                    let definitionExpression;
                    if (Math.floor(systemVariable.user.role / 100) === 7) {//role bat dau tu so 7
                        definitionExpression = `MaHuyenTP = '${systemVariable.user.role.trim()}'`;//vi du role = 725, => MaHuyenTP = 725
                    }

                    var view = new MapView({
                        container: "map", // Reference to the scene div created in step 5
                        map: map, // Reference to the map object created before the scene
                        center: mapconfigs.center,
                        zoom: mapconfigs.zoom
                    });
                  

                    view.systemVariable = systemVariable;
                    view.snapping = {
                        key: 'ctrlKey',
                        isKeyPress: function () {
                            return view.keyPress[this.key]
                        }
                    }
                    view.keyPress = {
                        ctrlKey: false
                    }

                    const initBaseMap = () => {
                        let bmCfg = mapconfigs.basemap;//basemap config
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
                                let layer = basemap.findSublayerById(4);
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
                                basemap.visible = true;
                            }


                        })
                        map.add(basemap);
                    }
                    const initFeatureLayers = () => {
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
                                            if (definitionExpression)
                                                element.definitionExpression = definitionExpression;
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
                                id: "logo",
                                style: "background-color:transparent"
                            });
                            view.ui.add(logo, "bottom-left");
                        }
                        //BasemapToggle
                        view.ui.add(new BasemapToggle({
                            view: view,
                            nextBasemap: "satellite"
                        }), {
                                position: "bottom-right"
                            });
                        //LEGEND
                        view.ui.add(new Expand({
                            expandIconClass: "esri-icon-collection",
                            content: new Legend({
                                view: view,
                            })
                        }), "top-left");

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
                            }
                                , {
                                featureLayer: map.findLayerById(constName.DOANHNGHIEP),
                                searchFields: ["OBJECTID", "MaDoanhNghiep", "NguoiDaiDienDoanhNghiep"],
                                displayField: "NguoiDaiDienDoanhNghiep",

                                exactMatch: false,
                                outFields: ["*"],
                                name: "Doanh Nghiệp",
                                placeholder: "Nhập tên hoặc mã Doanh nghiệp",
                            }
                            ]
                        });
                        // Add the search widget to the top left corner of the view
                        view.ui.add(searchWidget, {
                            position: "top-right"
                        });
                        //TIME SLIDER
                        var timeSlider = new TimeSlider(view);
                        timeSlider.startup();
                        /**
                         * Layer Editor
                         */
                        var layerEditor = new LayerEditor(view);
                        layerEditor.startup();



                        var popup = new Popup(view);
                        popup.startup();


                    }

                    initBaseMap();
                    initFeatureLayers().then(() => {
                        initWidgets();
                    })


                    Loader.hide();
                }
                else {
                    throw "Chương trình không chạy được do không xác định được định danh"
                }
            } catch (error) {
                console.log(error);
            }
        })


    });