

/**
 * Phần này quan trọng không được xóa
 */
const constName = {
    TramBTS: 'TramBTS',
    DoanhNghiep: 'DoanhNghiep',
    HeThongPhatThanhTruyenHinh: 'HeThongPhatThanhTruyenHinh',
    HETHONGTRUYENDANVIENTHONG: 'HeThongTruyenDanVienThong',
    DiemCungCapDichVuVienThong: 'DiemCungCapDichVuVienThong',
    CotAngTen: 'CotAngTen',
    CotTreoCap: 'CotTreoCap',
    TuyenCapTreo: 'TuyenCapTreo',
    HaTangKyThuatNgam: 'HaTangKyThuatNgam',
    TuyenCapNgam: 'TuyenCapNgam',
    THIETBITRUYENDAN: 'ThietBiTruyenDan'
}
require([
    "ditagis/config",
    "esri/Map",
    "esri/views/MapView",
    "esri/layers/MapImageLayer",
    "esri/layers/FeatureLayer",
    "esri/tasks/QueryTask",
    "esri/tasks/support/Query",
    "esri/widgets/Expand",
    "esri/widgets/Locate",
    "esri/widgets/LayerList",
    "esri/widgets/Legend",

    "ditagis/classes/SystemStatusObject",

    "ditagis/widgets/LayerEditor",
    "ditagis/widgets/CalculateDistance",
    "ditagis/widgets/BufferingObjects",
    "ditagis/widgets/Popup",
    "ditagis/support/HightlightGraphic",
    "ditagis/support/QueryDistance",


    "dojo/on",
    "dojo/dom",
    "dojo/dom-construct",
    'dojo/window',
    "dijit/registry",
    "css!ditagis/styling/blue-map.css"


], function (mapconfigs, Map, MapView, MapImageLayer, FeatureLayer,
    QueryTask, Query, Expand, Locate, LayerList, Legend,
    SystemStatusObject,
    LayerEditor, CalculateDistance,BufferingObjects, Popup,
    HightlightGraphic, QueryDistance,
    on, dom, domConstruct, win, registry,
    ) {
        var systemVariable = new SystemStatusObject();
        var map = new Map({
            basemap: 'osm'
        });
        Map.prototype.getLayer = function (name) {
            return map.layers.items.filter(layer => {
                return layer.name === name;
            })[0];
        }

        if (window.username && window.role) {
            systemVariable.user = {
                username: username,
                role: role
            }
        } else {
            throw "Chương trình không chạy được do không xác định được định danh"
        }

        view = new MapView({
            container: "map", // Reference to the scene div created in step 5
            map: map, // Reference to the map object created before the scene
            zoom: mapconfigs.zoom, // Sets the zoom level based on level of detail (LOD)
            center: mapconfigs.center, // Sets the center point of view in lon/lat
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
        view.layers = [];
        view.basemap = [];

        

        on(view, "click", (evt) => {
            var queryDistance = new QueryDistance(view.layers);
            evt.stopPropagation();
            const screenCoors = {
                x: evt.x,
                y: evt.y
            };
            const point = view.toMap(screenCoors);
            queryDistance.execute(point);
        })
        const initBaseMap = () => {
            for (let bm of mapconfigs.baseMaps) {
                let basemap = new MapImageLayer(bm)
                view.basemap.push(basemap);
                map.add(basemap);
            }
        }


        const initFeatureLayers = () => {
            FeatureLayer.prototype.getPermission = function (role) {
                role = role || systemVariable.user.role;
                if (this.permissions) {
                    return this.permissions.find((it) => {
                        return it.role === role
                    })
                }
            },
                FeatureLayer.prototype.getHideFields = function (attributes) {
                    let hideFields = [];
                    if (this.popupConstraint) {
                        for (let field of this.fields) {
                            const itemConstraint = this.popupConstraint.getItem(field.name);
                            if (itemConstraint) {
                                if (attributes[itemConstraint.field] === itemConstraint.value) {
                                    for (let hideField of itemConstraint.hideSubFields) {
                                        hideFields.push(hideField);
                                    }
                                }

                            }
                        }
                    }
                    return hideFields;
                }
            for (var i in mapconfigs.layers) {
                let element = mapconfigs.layers[i];
                let fl = new FeatureLayer(element);
                view.layers.push(fl);
                map.add(fl);
            }
        }
        const initWidgets = () => {
            new CalculateDistance(view, {
                icon: 'esri-icon-map-pin',
                position: 'top-left'
            });
            new BufferingObjects(view,{
                icon: 'esri-icon-hollow-eye',
                position: 'top-left'
            })
            var layereditor = new LayerEditor(view);
            layereditor.startup();
            var layerListExpand = new Expand({
                expandIconClass: "esri-icon-layer-list", // see https://developers.arcgis.com/javascript/latest/guide/esri-icon-font/
                view: view,
                content: new LayerList({
                    container: document.createElement("div"),
                    view: view
                })
            });
            view.ui.add(layerListExpand, "top-left");
            var locateWidget = new Locate({
                view: view
            });
            view.ui.add(locateWidget, "top-left");

            //Add Logo DATAGIS to the bottom left of the view
            var logo = domConstruct.create("img", {
                src: "images/logo-ditagis.png",
                id: "logo",
                style: "background-color:transparent"
            });
            view.ui.add(logo, "bottom-left");
            var legendExpand = new Expand({
                expandIconClass: "esri-icon-collection",
                content: new Legend({
                    view: view,
                })
            });
            view.ui.add(legendExpand, "bottom-right");
            var popup = new Popup(view);
            popup.startup();
        }




        initBaseMap();
        initFeatureLayers();
        initWidgets();

        // //Chức năng hightlight Graphic khi nhấn {view.snapping.key}
        // var hightlightGraphic = new HightlightGraphic(this.view);
        // view.on('pointer-move', (evt) => {
        //     const key = view.snapping.key,
        //         pressKey = evt.native[key];
        //     view.keyPress[key] = pressKey;

        //     if (pressKey) {
        //         hightlightGraphic.hightlight({
        //             x: evt.x,
        //             y: evt.y
        //         });
        //     } else {
        //         hightlightGraphic.clearHightlight();
        //     }

        // })

        Loader.hide();
    });