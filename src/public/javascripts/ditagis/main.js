

/**
 * Phần này quan trọng không được xóa
 */
const constName = {
    SAUBENH: 'saubenh',
    DOANHNGHIEP: 'doanhnghiep',
    TRONGTROT: 'trongtrot',
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
    "esri/tasks/QueryTask",
    "esri/tasks/support/Query",
    "ditagis/classes/SystemStatusObject",

    "ditagis/widgets/LayerEditor",
    "ditagis/widgets/Popup",
    "dojo/on",
    "dojo/dom-construct",
    "dojo/sniff",
    "css!ditagis/styling/dtg-map.css"


], function (mapconfigs, Map, MapView, TileLayer, OpenStreetMapLayer, MapImageLayer, FeatureLayer,
    Expand, Locate, LayerList, Legend, Search,
    QueryTask, Query,
    SystemStatusObject,
    LayerEditor, Popup,
    on, domConstruct,has
    ) {
        try {

            var systemVariable = new SystemStatusObject();
            var map = new Map({
                basemap: 'osm'
            });

            if (window.username && window.role) {
                systemVariable.user = {
                    username: username,
                    role: role
                }
            } else {
                throw "Chương trình không chạy được do không xác định được định danh"
            }
            // window.role = 725;

            view = new MapView({
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
            view.layers = [];
            view.basemap = [];


            const initBaseMap = () => {
                let bmCfg = mapconfigs.basemap;//basemap config
                if (Math.floor(role / 100) === 7) {//role bat dau tu so 7
                    let definitionExpression = `MaHuyenTP = '${role}'`;//vi du role = 725, => MaHuyenTP = 725
                    for (let sublayer of bmCfg.sublayers) {
                        sublayer.definitionExpression = definitionExpression;
                    }
                }
                let basemap = new MapImageLayer(bmCfg);
                map.add(basemap);
                // basemap.then(()=>{
                //     view.goTo(basemap.fullExtent);
                // })
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
                let definitionExpression;
                if (Math.floor(role / 100) === 7) {//role bat dau tu so 7
                    definitionExpression = `MaHuyenTP = '${role}'`;//vi du role = 725, => MaHuyenTP = 725
                }
                for (var i in mapconfigs.layers) {
                    let element = mapconfigs.layers[i];
                    if (definitionExpression)
                        element.definitionExpression = definitionExpression;
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

        } catch (error) {
            console.log(error);
        }
    });