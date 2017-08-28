

/**
 * Phần này quan trọng không được xóa
 */
const constName = {
    SAUBENH: 'trambts',
    DOANHNGHIEP: 'doanhnghiep',
    TRONGTROT: 'trongtrot',
}
//  var socket = io();
require([
    "ditagis/config",
    "esri/Map",
    "esri/views/MapView",
    "esri/layers/MapImageLayer",
    "esri/layers/FeatureLayer",
    "esri/widgets/Expand",
    "esri/widgets/Locate",
    "esri/widgets/LayerList",
    "esri/widgets/Legend",
    "esri/widgets/Search",

    "ditagis/classes/SystemStatusObject",

    "ditagis/widgets/LayerEditor",
    "ditagis/widgets/Popup",
    "dojo/on",
    "dojo/dom-construct",
    "css!ditagis/styling/dtg-map.css"


], function (mapconfigs, Map, MapView, MapImageLayer, FeatureLayer,
    Expand, Locate, LayerList, Legend,Search,
    SystemStatusObject,
    LayerEditor, Popup,
    on, domConstruct,
    ) {
        
        var systemVariable = new SystemStatusObject();
        var map = new Map();
        Map.prototype.getLayer = function (name) {
            return map.layers.items.find(layer =>layer.name === name);
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
            };
            for (var i in mapconfigs.layers) {
                let element = mapconfigs.layers[i];
                let fl = new FeatureLayer(element);
                view.layers.push(fl);
                map.add(fl);
            }
        }
        const initWidgets = () => {
            var layerListExpand = new Expand({
                expandIconClass: "esri-icon-layer-list",
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
            var legendtExpand = new Expand({
                expandIconClass: "esri-icon-collection",
                content: new Legend({
                    view: view,
                })
            });
            view.ui.add(legendtExpand, "bottom-right");

            // Widget Search Features //
            var searchWidget = new Search({
                view: view,
                allPlaceholder: "Nhập nội dung tìm kiếm",
                sources: [{
                    featureLayer: map.getLayer(constName.SAUBENH),
                    searchFields: ["OBJECTID", "MaSauBenh", "MaHuyenTP"],
                    displayField: "MaSauBenh",
                    exactMatch: false,
                    outFields: ["*"],
                    name: "Sâu hại",
                    placeholder: "Tìm kiếm theo tên, loại cây trồng, huyện/tp",
                }
                    , {
                    featureLayer: map.getLayer(constName.DOANHNGHIEP),
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

            /**
             * Layer Editor
             */
            var layerEditor = new LayerEditor(view);
            layerEditor.startup();

            var popup = new Popup(view);
            popup.startup();
        }




        initBaseMap();
        initFeatureLayers();
        initWidgets();

        Loader.hide();
    });