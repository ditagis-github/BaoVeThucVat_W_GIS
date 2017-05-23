
var mapconfigs = {
    basemapUrl: "http://112.78.4.175:6080/arcgis/rest/services/Basemap_BaoVeThucVat/MapServer",
    doanhNghiepUrl: "http://112.78.4.175:6080/arcgis/rest/services/BaoVeThucVat_ChuyenDe/FeatureServer/0",
    sauBenhUrl: "http://112.78.4.175:6080/arcgis/rest/services/BaoVeThucVat_ChuyenDe/FeatureServer/1",
    trongTrotUrl: "http://112.78.4.175:6080/arcgis/rest/services/BaoVeThucVat_ChuyenDe/FeatureServer/2"
};
require(["esri/tasks/query",
    "esri/geometry/Point",
    "esri/geometry/Extent"
], function (Query, Point, Extent) {
    var SearchEvent = {
        options: {
            domId: undefined,
            feature: undefined,
            arrAttribute: undefined,
            selectProperty: undefined
        },
        init: function (options) {
            for (var i in options) {
                this.options[i] = options[i];
            }
        },
        _findClick: function () {

        },
        _getQuery: function () {
            var query = new Query();

            arrAttribute.forEach(function (value, index) {
                var domValue = $("#" + value.dom).val();
                var where = ['1=1'];
                if (domValue.length > 0) {
                    where.push(value.property + " LIKE N'%" + domValue + "%'");
                }
            });
            where.join(' AND');
            query.where = where;
            return query;
        },
        _selectFeatures: function () {
            var viewPoint = this._viewPoint;
            this.options.feature.selectFeatures(query, FeatureLayer.SELECTION_NEW, function (features) {
                var html = "";
                for (var i = 0 ; i < features.length ; i++) {
                    var attr = features[i].attributes;
                    var span = $('<span/>').text(attr[selectProperty[1]]).attr('alt', attr[selectProperty[0]]).click(function () {
                        var where = [selectProperty[0], "='", this.attributes['alt'].nodeValue, "'"].join('');
                        console.log(where);
                        viewPoint(where, feature)
                    });;
                    var tr = $('<tr/>');
                    tr.append($('<td/>').text((i + 1) + ". "));
                    tr.append($('<td/>').text(attr[selectProperty[2]]));
                    tr.append($('<td/>').append(span));

                    $(resultDom).append(tr);

                }
                $(counterDom).html(features.length);
                $(".loading").css("display", "none");

            });
        },
        _viewPoint: function (value, layer) {
            query.where = value;
            query.returnGeometry = true;
            query.outFields = ["*"];
            layer.selectFeatures(query, FeatureLayer.SELECTION_NEW, function (results) {
                if (results.length > 0) {
                    var feat = results[0];
                    var point = feat.geometry;
                    // var graphic1 = new esri.Graphic(point, ptSymbol1);

                    var pt = new Point(point.x, point.y, map.spatialReference);
                    if (pt) {
                        var extent = new Extent((point.x + 40), (point.y + 40), (point.x - 40), (point.y - 40), map.spatialReference);
                        var stateExtent = extent.expand(5.0);
                        map.setExtent(stateExtent);
                    }
                }
            });
        }, _viewPolygon: function (value, layer) {
            var query = new Query();
            query.returnGeometry = true;
            query.outFields = ["*"];
            query.where = value;
            layer.selectFeatures(query, FeatureLayer.SELECTION_NEW, function (results) {
                if (results.length > 0) {
                    var feat = results[0];
                    var point = feat.geometry;
                    // var graphic1 = new esri.Graphic(point, ptSymbol1);
                    var stateExtent = point.getExtent().expand(8.0);
                    map.setExtent(stateExtent);
                }
            });
        }
    }
});
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
var SauBenhMode, FeatureTableUI;
SauBenhMode = class SauBenhMode {

    constructor(options, domElement) {
        this.options = {
            normalCSS: 'glyphicon glyphicon-eye-open',
            heatmapCSS: 'glyphicon glyphicon-eye-close',
            defaultMode: 'normal'
        };
        for (var i in options) {
            this.options[i] = options[i] || this.options[i];
        }
        this.options.defaultMode = this.options.defaultMode == 'normal' ? 'heatmap' : 'normal';
        this.normalLayer = this.options.normalLayer,
        this.heatmapLayer = this.options.heatmapLayer;
        this.mode = this.options.defaultMode;
        this.div = $('<button/>');
        $('#' + domElement).append(this.div);
        let that = this,
        _change = this.change;
        this.div.click(function () {
            _change(that);
        });
    }
    change(that) {
        that = that || this;
        if (that.mode === 'heatmap') {
            that.heatmapLayer.hide();
            that.normalLayer.show();
            that.mode = 'normal';
            that.div.attr('class', that.options.normalCSS);
        } else {
            that.heatmapLayer.show();
            that.normalLayer.hide();
            that.mode = 'heatmap';
            that.div.attr('class', that.options.heatmapCSS);
        }
    }
}
require([
    "esri/dijit/FeatureTable",
    "dojo/dom-style",
    "dijit/registry"
], function (
        FeatureTable,
        domstyle,
        registry) {
    FeatureTableUI = class FeatureTableUI {
        constructor(options, controlDiv, tableDiv, mainContainer) {
            this.options = {
                layers: [],
                icon: 'glyphicon glyphicon-tasks'
            };
            for (var i in options) {
                this.options[i] = options[i] || this.options[i];
            }
            this.mainContainer = mainContainer;
            this.tableDiv = $("#" + (tableDiv || 'contentPane'));
            this.childTableDivs = [];
            this.controlDiv = $("#" + (controlDiv || 'tableControl'));
            this.controlDiv.addClass('dropdown map-control');
            this.button = $('<button/>');
            this.button.attr('data-toggle', 'dropdown');
            this.button.attr('type', 'button');

            let span = $('<span/>');
            span.addClass(this.options.icon);
            this.button.append(span);
            this.controlDiv.append(this.button);
            this.ul = $('<ul/>');
            this.ul.addClass("dropdown-menu");
            let that = this, _clickEvent = this._clickEvent;
            this.isLoadTable = {
                firstClick: true
            }
            for (var i in this.options.layers) {
                let layer = this.options.layers[i];

                this.isLoadTable[layer.id] = false;

                let li = $('<li/>'),
                    a = $('<a/>');
                a.attr('href', '#');
                a.attr('id', layer.id);
                a.text(layer._params.name);
                a.click(function () {
                    _clickEvent(that);
                })
                li.append(a);
                this.ul.append(li);
                let childTableDiv = $('<div/>');
                childTableDiv.attr('id', layer.id);
                this.tableDiv.append(childTableDiv);
                this.childTableDivs.push(childTableDiv);
                this._loadTable(layer, childTableDiv);

            }

            this.controlDiv.append(this.ul);



        }

        _clickEvent(that) {
            if (that.isLoadTable.firstClick) {
                that._resizeSplitter('115px',that);
                that.isLoadTable.firstClick = false;
            }
            for (var i in that.childTableDivs) {
                let childTableDiv = that.childTableDivs[i];
                if (childTableDiv.attr('id') == $(this).attr('id')) {
                    childTableDiv.css('display', 'block');
                    let layer = that.options.layers[i];
                    if (!that.isLoadTable[layer.id]) {
                        layer.featureTable.startup();
                        that.isLoadTable[layer.id] = true;
                    }
                } else {
                    childTableDiv.css('display', 'none');
                }


            }

        }
        _loadTable(layer, div) {
            // listen to featurelayer click event to handle selection 
            // from layer to the table. 
            // when user clicks on a feature on the map, the corresponding 
            // record will be selected in the table.   
            //layer.on("click", function (evt) {
            //    var idProperty = layer.objectIdField,
            //        feature,
            //        featureId,
            //        query;

            //    if (evt.graphic && evt.graphic.attributes && evt.graphic.attributes[idProperty]) {
            //        feature = evt.graphic,
            //            featureId = feature.attributes[idProperty];

            //        query = new Query();
            //        query.returnGeometry = false;
            //        query.objectIds = [featureId];
            //        query.where = "1=1";

            //        layer.selectFeatures(query, FeatureLayer.SELECTION_NEW);
            //    }
            //});

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
                            graphics.push(new Graphic(null, null, {
                                OBJECTID: select
                            }));

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
        }
        _resizeSplitter(height, that) {
            if (that.mainContainer) {
                that = that || this;
                that.tableDiv.css('height',height);
                registry.byId(that.mainContainer).resize();
            }
        }
    }
});
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
    dom, domstyle, registry, ready, on, Color, arcgisUtils, SimpleFillSymbol, Graphic, geometryEngine, InfoTemplate, HeatmapRenderer, LayerList
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
    },null,null,'mainContainer');
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
        var heatmapRenderer = new HeatmapRenderer();
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

        geoLocate.startup();
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
