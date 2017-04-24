var map;

require([
    "esri/config",
    "esri/map",
    "esri/dijit/LocateButton",
    "esri/layers/ArcGISDynamicMapServiceLayer",
    "esri/SnappingManager",
    "esri/dijit/editing/Editor",
    "esri/layers/FeatureLayer",
    "esri/tasks/GeometryService",
    "esri/toolbars/draw",
    "dojo/keys",
    "dojo/parser",
    "dojo/_base/array",
    "dojo/i18n!esri/nls/jsapi",
    "dijit/layout/BorderContainer",
    "dijit/layout/ContentPane",
    "dojo/domReady!"
], function (
    esriConfig, Map, LocateButton, ArcGISDynamicMapServiceLayer, SnappingManager, Editor, FeatureLayer, GeometryService,
    Draw, keys, parser, arrayUtils, i18n
) {

    parser.parse();

    //snapping is enabled for this sample - change the tooltip to reflect this
    i18n.toolbars.draw.start += "<br/>Press <b>CTRL</b> to enable snapping";
    i18n.toolbars.draw.addPoint += "<br/>Press <b>CTRL</b> to enable snapping";

    //This sample requires a proxy page to handle communications with the ArcGIS Server services. You will need to
    //replace the url below with the location of a proxy on your machine. See the 'Using the proxy page' help topic
    //for details on setting up a proxy page.
    esriConfig.defaults.io.proxyUrl = "/proxy/";

    //This service is for development and testing purposes only. We recommend that you create your own geometry service for use within your applications
    esriConfig.defaults.geometryService = new GeometryService("https://utility.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer");

    map = new Map("map", {
        basemap: "dark-gray",
        zoom: 11,
        center: [106.688166, 11.172618]
    });

    var dynamicMapServiceLayer = new ArcGISDynamicMapServiceLayer("http://112.78.4.175:6080/arcgis/rest/services/Basemap_BaoVeThucVat/MapServer");
    map.addLayer(dynamicMapServiceLayer);
    map.on("layers-add-result", initEditing);

    doanhNghiepLayer = new FeatureLayer("http://112.78.4.175:6080/arcgis/rest/services/BaoVeThucVat_ChuyenDe/FeatureServer/0", {
        mode: FeatureLayer.MODE_ONDEMAND,
        outFields: ["*"]
    });
    sauBenhLayer = new FeatureLayer("http://112.78.4.175:6080/arcgis/rest/services/BaoVeThucVat_ChuyenDe/FeatureServer/1", {
        mode: FeatureLayer.MODE_ONDEMAND,
        outFields: ["*"]
    });
    suDungDatTrongLayer = new FeatureLayer("http://112.78.4.175:6080/arcgis/rest/services/BaoVeThucVat_ChuyenDe/FeatureServer/3", {
        mode: FeatureLayer.MODE_ONDEMAND,
        outFields: ["*"]
    });
    trongTrotLayer = new FeatureLayer("http://112.78.4.175:6080/arcgis/rest/services/BaoVeThucVat_ChuyenDe/FeatureServer/2", {
        mode: FeatureLayer.MODE_ONDEMAND,
        outFields: ["*"]
    });


    map.addLayers([trongTrotLayer, suDungDatTrongLayer, sauBenhLayer, doanhNghiepLayer]);
    map.infoWindow.resize(400, 300);

    function initEditing(event) {
        var featureLayerInfos = arrayUtils.map(event.layers, function (layer) {
            return {
                "featureLayer": layer.layer
            };
        });

        var settings = {
            map: map,
            layerInfos: featureLayerInfos
        };
        var params = {
            settings: settings
        };
        var editorWidget = new Editor(params, 'editorDiv');
        editorWidget.startup();

        //snapping defaults to Cmd key in Mac & Ctrl in PC.
        //specify "snapKey" option only if you want a different key combination for snapping
        map.enableSnapping();
    }
    var geoLocate = new LocateButton({
        map: map
    }, "LocateButton");
    geoLocate.startup();
});
