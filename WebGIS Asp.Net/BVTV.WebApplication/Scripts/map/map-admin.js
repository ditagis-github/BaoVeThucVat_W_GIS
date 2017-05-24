
var mapconfigs = {
    basemapUrl: "http://112.78.4.175:6080/arcgis/rest/services/Basemap_BaoVeThucVat/MapServer",
    doanhNghiepUrl: "http://112.78.4.175:6080/arcgis/rest/services/BaoVeThucVat_ChuyenDe/FeatureServer/0",
    sauBenhUrl: "http://112.78.4.175:6080/arcgis/rest/services/BaoVeThucVat_ChuyenDe/FeatureServer/1",
    trongTrotUrl: "http://112.78.4.175:6080/arcgis/rest/services/BaoVeThucVat_ChuyenDe/FeatureServer/2"
};
function getDefinition() {
    var result = [];
    for (let i in roles) {
        let rl = roles[i].toString();
        //kiem tra ma role co bat dau bang chu MH hay khong
        if (rl.startsWith('MH')) {
            result.push('MaHuyenTP = ' + rl.slice(2, rl.length));
        }
    }
    result = result.join(' or ');
    return result;
}
//khai bao bien
var map, basemap, doanhNghiepLayer, sauBenhLayer, trongTrotLayer, sauBenhHeatMapLayer, sbMode, ftUI;

//khai bao bien su kien
var loadTableTrongTrot, loadTableSauBenh, loadTableDoanhNghiep, findRecordsFeatureLayer;
//khai bao class

require([
    "esri/config",
    "esri/map",
    "esri/dijit/LocateButton",
    "esri/layers/ArcGISDynamicMapServiceLayer",
    "esri/dijit/editing/Editor",
    "esri/layers/FeatureLayer",
    "esri/tasks/query",
    "esri/geometry/Point",
    "esri/geometry/Extent",
    "esri/tasks/GeometryService",
    "esri/toolbars/draw",
    "esri/dijit/editing/TemplatePicker",
    "dojo/parser",
    "dojo/_base/array",
    "dijit/layout/BorderContainer",
    "dijit/layout/ContentPane",
    "esri/dijit/FeatureTable",
    "esri/graphicsUtils",
    "esri/symbols/PictureMarkerSymbol",
    "dojo/dom",
    "dojo/dom-style",
    "dojo/dom-class",
    "dijit/registry",
    "dojo/ready",
    "dojo/on",
    "esri/Color",
    "esri/arcgis/utils",
    "esri/symbols/SimpleFillSymbol",
    "esri/graphic",
    "esri/geometry/geometryEngine",
    "esri/InfoTemplate",
    "esri/renderers/HeatmapRenderer",
    "esri/dijit/LayerList",
    "dojo/domReady!"
], function (
    esriConfig, Map, LocateButton, ArcGISDynamicMapServiceLayer, Editor, FeatureLayer, Query, Point, Extent, GeometryService,
    Draw, TemplatePicker, parser, arrayUtils, BorderContainer, ContentPane, FeatureTable, graphicsUtils, PictureMarkerSymbol,
    dom, domstyle, domClass, registry, ready, on, Color, arcgisUtils, SimpleFillSymbol, Graphic, geometryEngine, InfoTemplate, HeatmapRenderer, LayerList
) {

    parser.parse();
    map = new Map("map", {
        basemap: "dark-gray",
        zoom: 10,
        center: [106.725785, 11.188761],
        logo: false
    });
    map.on("layers-add-result", initEditing);
    var definition = getDefinition();
    initBasemap();
    initFeatureLayer();
    sbMode = new SauBenhMode({
        defaultMode: 'normal',
        normalLayer: sauBenhLayer,
        heatmapLayer: sauBenhHeatMapLayer
    }, 'dtg-control-saubenh-mode');
    sbMode.change();
    ftUI = new FeatureTableUI({
        layers: [doanhNghiepLayer, sauBenhLayer, trongTrotLayer]
    }, null, null, 'mainContainer');
    initWidget();
    initEvents();

    function initBasemap() {
        basemap = new ArcGISDynamicMapServiceLayer(mapconfigs.basemapUrl);
        basemap.setVisibleLayers([5, 6, 8, 9]);
        //Phan quyen cap nhat theo huyen

        if (definition != undefined && definition != '') {
            var layerDefinitions = [];
            for (var i in basemap.layerInfos) {
                layerDefinitions.push(definition);
            }
            basemap.setLayerDefinitions(layerDefinitions);
        }
        map.addLayer(basemap);
    }

    function initFeatureLayer() {
        FeatureLayer.prototype.EditsComplete = function () {
            if (this.featureTable) {
                this.featureTable.refresh();
            }
        };
        doanhNghiepLayer = new FeatureLayer(mapconfigs.doanhNghiepUrl, {
            mode: FeatureLayer.MODE_ONDEMAND,
            outFields: ["*"],
            id: 'doanhnghiep',
            name: 'Doanh nghiệp'
        });

        sauBenhLayer = new FeatureLayer(mapconfigs.sauBenhUrl, {
            mode: FeatureLayer.MODE_ONDEMAND,
            outFields: ["*"],
            id: 'saubenh',
            name: 'Sâu bệnh'
            //,minScale: 22000
        });
        //on(sauBenhLayer, "edits-complete", function () {
        //    if (sauBenhLayer.featureTable) {
        //        sauBenhLayer.featureTable.refresh();
        //    }
        //});
        trongTrotLayer = new FeatureLayer(mapconfigs.trongTrotUrl, {
            mode: FeatureLayer.MODE_ONDEMAND,
            outFields: ["*"],
            id: 'trongtrot',
            name: 'Trồng trọt'
        });
        sauBenhHeatMapLayer = new FeatureLayer(mapconfigs.sauBenhUrl, {
            mode: FeatureLayer.MODE_SNAPSHOT,
            outFields: ["*"]
            //,maxScale: 22000
        });

        if (definition != undefined && definition != '') {
            doanhNghiepLayer.setDefinitionExpression(definition);
            trongTrotLayer.setDefinitionExpression(definition);
            sauBenhLayer.setDefinitionExpression(definition);
            sauBenhHeatMapLayer.setDefinitionExpression(definition);
        }
        var heatmapRenderer = new HeatmapRenderer({
            colorStops: [
                          { ratio: 0, color: "rgba(250, 0, 0, 0)" },
                          { ratio: 0.6, color: "rgb(250, 0, 0)" },
                          { ratio: 0.85, color: "rgb(250, 150, 0)" },
                          { ratio: 0.95, color: "rgb(255, 255, 0)" }
            ],
            blurRadius: 17,
            maxPixelIntensity: 550,
            minPixelIntensity: 10
        });
        sauBenhHeatMapLayer.setRenderer(heatmapRenderer);



        map.addLayers([trongTrotLayer, doanhNghiepLayer, sauBenhLayer, sauBenhHeatMapLayer]);
    };

    function initEditing(event) {
        var settings = {
            map: map,
            layerInfos: [{
                featureLayer: sauBenhLayer
            }, {
                featureLayer: doanhNghiepLayer
            }]
        };
        var params = {
            settings: settings
        };
        var editorWidget = new Editor(params, 'editorDiv');
        editorWidget.startup();

        ////snapping defaults to Cmd key in Mac & Ctrl in PC.
        ////specify "snapKey" option only if you want a different key combination for snapping
        //map.enableSnapping();

        var drawToolbar = new Draw(map);
        on(dom.byId('addDNFL'), 'click', function () {
            drawToolbar.activate(Draw.POINT);
            let event = drawToolbar.on("draw-end", function (evt) {
                drawToolbar.deactivate();
                var newGraphic = new Graphic(evt.geometry, null, {});
                doanhNghiepLayer.applyEdits([newGraphic], null, null);
                event.remove();
            });
        });
        on(dom.byId('addSBFL'), 'click', function () {
            drawToolbar.activate(Draw.POINT);
            let event = drawToolbar.on("draw-end", function (evt) {
                drawToolbar.deactivate();
                var newGraphic = new Graphic(evt.geometry, null, { CapDoGayHai: 1 });
                sauBenhLayer.applyEdits([newGraphic], null, null);
                event.remove();
            });
        });

    }

    function initWidget() {
        var geoLocate = new LocateButton({
            map: map
        }, "LocateButton"),
        layerList = new LayerList({
            map: map,
            layers: [{
                layer: basemap,
                id: 'Dữ liệu nền Bình Dương'
            }],
        }, "layerList");

        $("#LocateButton").addClass("dtg-widget-control");
        geoLocate.startup();
        $("#layerList").addClass("dtg-widget-control");
        layerList.startup();
    }

    function loadData(dom, fieldName, layer) {
        var combo = $(dom);
        if (combo.find("option").length > 1)
            return;

        layer.getField(fieldName).domain.codedValues.forEach(function (value, index) {
            var code = value.code, name = value.name;
            //create Element option item with Jquery
            var option = $('<option/>').val(code).text(name);
            combo.append(option);
        })
    }
    ////add event to update combobox  when click tab-saubenh
    //$('#a-tab-saubenh').on('click', function () {
    //    loadData('#tab-saubenh #cbNhomCayTrong', 'NhomCayTrong', sauBenhLayer),
    //    loadData('#tab-saubenh #cbCapDoGayHai', 'CapDoGayHai', sauBenhLayer),
    //    loadData('#tab-saubenh #cbLoaiCayTrong', 'LoaiCayTrong', sauBenhLayer);

    //});

    ////add event to update combobox  when click tab-trongtrot
    //$('#a-tab-trongtrot').first().on('click', function () {
    //    loadData('#tab-trongtrot #cbNhomCayTrong', 'NhomCayTrong', trongTrotLayer),
    //     loadData('#tab-trongtrot #cbLoaiCayTrong', 'LoaiCayTrong', trongTrotLayer),
    //     loadData('#tab-trongtrot #cbPhuongThucTrong', 'PhuongThucTrong', trongTrotLayer);
    //});

    //Table Feature
    function resizeSplitter(height) {
        domstyle.set('contentPane', {
            height: height
        });
        registry.byId('mainContainer').resize();
    }
    function loadTable(layer, div) {
        if (isLoadTable.firstClick) {
            resizeSplitter('115px');
            isLoadTable.firstClick = false;
        }
        // listen to featurelayer click event to handle selection 
        // from layer to the table. 
        // when user clicks on a feature on the map, the corresponding 
        // record will be selected in the table.   
        layer.on("click", function (evt) {
            var idProperty = layer.objectIdField,
                feature,
                featureId,
                query;

            if (evt.graphic && evt.graphic.attributes && evt.graphic.attributes[idProperty]) {
                feature = evt.graphic,
                    featureId = feature.attributes[idProperty];

                query = new Query();
                query.returnGeometry = false;
                query.objectIds = [featureId];
                query.where = "1=1";

                layer.selectFeatures(query, FeatureLayer.SELECTION_NEW);
            }
        });

        //create new FeatureTable and set its properties 
        // create new FeatureTable and set its properties 
        var myFeatureTable = new FeatureTable({
            featureLayer: layer,
            map: map,
            // only allows selection from the table to the map 
            syncSelection: true,
            zoomToSelection: true,
            editable: true,
            gridOptions: {
                allowSelectAll: true,
                allowTextSelection: true,
            },
            dateOptions: {
                // set date options at the feature table level 
                // all date fields will adhere this 
                datePattern: "d/M/y"
            },
            menuFunctions: [{
                label: "Ẩn bảng",
                callback: function (evt) {
                    resizeSplitter(0);
                }
            }, {
                label: "Phóng đến",
                callback: function () {
                    map.setZoom(15);
                }
            }, {
                label: "Tìm kiếm",
                callback: function () {
                    layer.frmSearchDlg.show();
                }
            }, {
                label: "Xóa lựa chọn",
                callback: function () {
                    let selecteds = myFeatureTable.selectedRowIds;
                    let graphics = [];
                    for (let i in selecteds) {
                        let select = selecteds[i];
                        graphics.push(new Graphic(null, null, { OBJECTID: select }));

                    }
                    layer.applyEdits(null, null, graphics);
                    myFeatureTable.refresh();
                    layer.refresh();
                }
            }]
        }, div);
        //on(myFeatureTable, 'row-select', function () {
        //    map.setZoom(15);
        //});
        layer.featureTable = myFeatureTable;
        myFeatureTable.startup();

    }


    var isLoadTable = {
        firstClick: true,
        sauBenh: false,
        trongTrot: false,
        doanhNghiep: false
    }
    function initEvents() {
        loadTableSauBenh = function () {
            if (!isLoadTable.sauBenh) {
                sauBenhLayer.frmSearchDlg = frmSauBenh;
                loadTable(sauBenhLayer, 'tableLayerSauBenh');
                isLoadTable.sauBenh = true;
            }
            document.getElementById('tableDoanhNghiep').style.display = 'none';
            document.getElementById('tableTrongTrot').style.display = 'none';
            document.getElementById('tableLayerSauBenh').style.display = 'block';
            resizeSplitter($("#contentPane").height());
        }

        loadTableDoanhNghiep = function () {
            if (!isLoadTable.doanhNghiep) {
                doanhNghiepLayer.frmSearchDlg = frmDoanhNghiep;
                loadTable(doanhNghiepLayer, 'tableDoanhNghiep');
                isLoadTable.doanhNghiep = true;
            }

            document.getElementById('tableLayerSauBenh').style.display = 'none';
            document.getElementById('tableTrongTrot').style.display = 'none';
            document.getElementById('tableDoanhNghiep').style.display = 'block';
            resizeSplitter($("#contentPane").height());
        }

        loadTableTrongTrot = function () {
            if (!isLoadTable.trongTrot) {
                loadTable(trongTrotLayer, 'tableTrongTrot');
                isLoadTable.trongTrot = true;
            }

            document.getElementById('tableDoanhNghiep').style.display = 'none';
            document.getElementById('tableLayerSauBenh').style.display = 'none';
            document.getElementById('tableTrongTrot').style.display = 'block';
            resizeSplitter($("#contentPane").height());
        }
        findRecordsFeatureLayer = function (arguments, type) {
            arguments = JSON.parse(arguments);
            let featureLayer = type == "DN" ? doanhNghiepLayer : type == "SB" ? sauBenhLayer : trongTrotLayer;
            let query = new Query();
            let where = ['1=1'];
            let attributes = featureLayer.attributes;
            for (var i in arguments) {
                if (arguments[i])
                    where.push(i + " LIKE N'%" + arguments[i] + "%'");
            }
            query.where = where.join(' AND ');
            let objectid = [];
            featureLayer.selectFeatures(query);
        }
        //$('#changeSBMode').click(function () {
        //    //kiem tra xem dang o che do nao
        //    let that = $(this);
        //    let type = that.attr('data-type');
        //    changeModeSauBenh(type);
        //});
        //changeModeSauBenh();
    }
});
