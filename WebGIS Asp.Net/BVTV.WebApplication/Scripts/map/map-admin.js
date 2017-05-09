var map;

require([
    "esri/config",
    "esri/map",
    "esri/dijit/LocateButton",
    "esri/layers/ArcGISDynamicMapServiceLayer",
    "esri/SnappingManager",
    "esri/dijit/editing/Editor",
    "esri/layers/FeatureLayer",
    "esri/tasks/query",
    "esri/geometry/Point",
    "esri/geometry/Extent",
    "esri/tasks/GeometryService",
    "esri/toolbars/draw",
    "dojo/keys",
    "dojo/parser",
    "dojo/_base/array",
    "dojo/i18n!esri/nls/jsapi",
    "dijit/layout/BorderContainer",
    "dijit/layout/ContentPane",
    "esri/dijit/FeatureTable",
    "esri/graphicsUtils",
    "esri/symbols/PictureMarkerSymbol",
    "dojo/dom",
    "dojo/dom-style",
    "dijit/registry",
    "dojo/dom-attr",
    "dojo/ready",
    "dojo/on",
    "esri/Color",
    "esri/arcgis/utils",
    "esri/symbols/SimpleFillSymbol",
    "esri/graphic",
    "esri/geometry/geometryEngine",
    "esri/InfoTemplate",
    "esri/renderers/HeatmapRenderer",
    "dojo/domReady!"
], function (
    esriConfig, Map, LocateButton, ArcGISDynamicMapServiceLayer, SnappingManager, Editor, FeatureLayer,Query,Point,Extent, GeometryService,
    Draw, keys, parser, arrayUtils, i18n, BorderContainer, ContentPane, FeatureTable, graphicsUtils, PictureMarkerSymbol,
    dom, domstyle, registry, domAttr, ready, on, Color, arcgisUtils, SimpleFillSymbol, Graphic, geometryEngine, InfoTemplate, HeatmapRenderer
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
    var infoContentDesc = "<p>${numfatal:formatFatalities} died when a ${age} year old ${sex:formatGender} was involved in a fatal speeding accident.</p>";
    var infoContentDetails = "${atmcond:formatConditions}${conszone:formatWorkZone}${alcres:formatAlcoholTestResults}";
    var infoContent = infoContentDesc + infoContentDetails;
    var infoTemplate = new InfoTemplate("Accident details", infoContent);

    var serviceURL = "http://112.78.4.175:6080/arcgis/rest/services/BaoVeThucVat_ChuyenDe/FeatureServer/1";
    var heatmapFeatureLayerOptions = {
        mode: FeatureLayer.MODE_SNAPSHOT,
        outFields: ["*"],
        maxScale: 22000
    };
    var heatmapFeatureLayer = new FeatureLayer(serviceURL,  heatmapFeatureLayerOptions);
    var heatmapRenderer = new HeatmapRenderer();
    heatmapFeatureLayer.setRenderer(heatmapRenderer);
    map.addLayer(heatmapFeatureLayer);
    
    var dynamicMapServiceLayer = new ArcGISDynamicMapServiceLayer("http://112.78.4.175:6080/arcgis/rest/services/Basemap_BaoVeThucVat/MapServer");
    map.addLayer(dynamicMapServiceLayer);
    map.on("layers-add-result", initEditing);

    doanhNghiepLayer = new FeatureLayer("http://112.78.4.175:6080/arcgis/rest/services/BaoVeThucVat_ChuyenDe/FeatureServer/0", {
        mode: FeatureLayer.MODE_ONDEMAND,
        outFields: ["*"]
    });
    sauBenhLayer = new FeatureLayer("http://112.78.4.175:6080/arcgis/rest/services/BaoVeThucVat_ChuyenDe/FeatureServer/1", {
        mode: FeatureLayer.MODE_ONDEMAND,
        outFields: ["*"],
        title: "Sâu bệnh",
        minScale:22000,
        fields: [{
            name: 'OBJECTID',
            alias: 'Nhóm cây trồng',
            visible: false,
            editable: false //disable editing on this field 
        }, {
            name: 'MaSauBenh',
            alias: 'Mã sâu bệnh'
        }, {
            name: 'NhomCayTrong',
            alias: 'Nhóm cây trồng',
            editable: false //disable editing on this field 
        }, {
            name: 'LoaiCayTrong',
            alias: 'Loại cây trồng'
        }, {
            name: 'TenSauBenhGayHai',
            alias: 'Tên sâu bệnh gây hại'
        }, {
            name: 'MatDoSauBenhGayHai',
            alias: 'Mật độ'
        }, {
            name: 'PhamViAnhHuong',
            alias: 'Phạm vi ảnh huoqngr'
        }, {
            name: 'MucDoAnhHuong',
            alias: 'Mức độ ảnh hưởng'
        }, {
            name: 'ThoiGianGayHai',
            alias: 'Thời gian gây hại'
        }, {
            name: 'CapDoGayHai',
            alias: 'Cấp độ gây hại'
        }, {
            name: 'TinhHinhKiemSoatDichBenh',
            alias: 'Tình hình kiểm soát dịch bệnh'
        }, {
            name: 'BienPhapXuLy',
            alias: 'Biện pháp xử lý'
        }, {
            name: 'DienTich',
            alias: 'Diện tích'
        }, {
            name: 'MaHuyenTP',
            alias: 'Huyện/TP',
            format: {

            }
        }, {
            name: 'GiaiDoanSinhTruong',
            alias: 'Giai đoạn sinh trưởng'
        }, {
            name: 'NgayCapNhat',
            alias: 'Ngày cập nhật'
        }, {
            name: 'NguoiCapNhat',
            alias: 'Người cập nhật'
        }, {
            name: 'NgayXuatHien',
            alias: 'Ngày xuất hiện'
        }, {
            name: 'SauBenhGayHai',
            alias: 'Sâu bệnh gây hại',
            visible: false
        }],
        popupTemplate: {
            title: "{TenSauBenhGayHai}",
            content: "<table>" +
                "<tr><td>Nhóm cây trồng: </td><td>{NhomCayTrong}</td></tr>" +
                "<tr><td>Loại cây trồng: {LoaiCayTrong}</td></tr>" +
                "<tr><td>Tên sâu bệnh gây hại: </td><td>{TenSauBenhGayHai}</td></tr>" +
                "<tr><td>Mật độ sâu bệnh gây hại: </td><td>{MatDoSauBenhGayHai}</td></tr>" +
                "<tr><td>Phạm vi ảnh ưởng: </td><td>{PhamViAnhHuong}</td></tr>" +
                "<tr><td>Mức độ ảnh hưởng: </td><td>{MucDoAnhHuong}</td></tr>" +
                "<tr><td>Thời gian gây hại: </td><td>{ThoiGianGayHai}</td></tr>" +
                "<tr><td>Cấp độ gây hại: </td><td>{CapDoGayHai}</td></tr>" +
                "<tr><td>Tình hình kiểm soát dịch: </td><td>{TinhHinhKiemSoatDichBenh}</td></tr>" +
                "<tr><td>Mức độ kiểm soát: </td><td>{MucDoKiemSoat}</td></tr>" +
                "<tr><td>Biện pháp xử lý: </td><td>{BienPhapXuLy}</td></tr>" +
                "<tr><td>Diện tích: </td><td>{DienTich}</td></tr>" +
                "<tr><td>Huyện/TP: </td><td>{MaHuyenTP}</td></tr>" +
                "<tr><td>Giai đoạn sinh trưởng: </td><td>{GiaiDoanSinhTruong}</td></tr>" +
                "</table>"
        }
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

    var query = new Query();
   

    function addSearchEvent(domId, feature, arrAttribute, selectProperty) {

        var btnFindDom = $(domId + ' #btnFind'), resultDom = $(domId + ' #result'), counterDom = $(domId + ' #counter');
        $(btnFindDom).click(function (e) {
            var where = "1=1";

            arrAttribute.forEach(function (value, index) {
                var domValue = $("#" + value.dom).val();
                if (domValue.length > 0) {
                    where += " AND " + value.property + " LIKE N'%" + domValue + "%'";
                }
            });


            $(".loading").css("display", "inline-block");
            $(resultDom).html('');
            $(counterDom).html('');
           
            query.where = where;

            feature.selectFeatures(query, FeatureLayer.SELECTION_NEW, function (features) {
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

        });
    }
    function viewPoint(value, layer) {
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
    }

    function viewPolygon(value, layer) {
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
    };
    addSearchEvent('#tab-doanhnghiep', doanhNghiepLayer, [{
        dom: 'txtMaDN',
        property: 'MaDoanhNghiep'
    },
    {
        dom: 'txtTen',
        property: 'NguoiDaiDienDoanhNghiep'
    }, {
        dom: 'cbQuanHuyen',
        property: 'MaHuyenTP'
    }
    ], ['MaDoanhNghiep', 'NguoiDaiDienDoanhNghiep', 'MaDoanhNghiep'])

    //

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
    //add event to update combobox  when click tab-saubenh
    $('#a-tab-saubenh').on('click', function () {
        loadData('#tab-saubenh #cbNhomCayTrong', 'NhomCayTrong', sauBenhLayer), loadData('#tab-saubenh #cbLoaiCayTrong', 'LoaiCayTrong', sauBenhLayer), loadData('#tab-saubenh #cbCapDoGayHai', 'CapDoGayHai', sauBenhLayer);
    });


    //add event to search with button
    addSearchEvent('#tab-saubenh', sauBenhLayer, [{
        dom: 'cbNhomCayTrong',
        property: 'NhomCayTrong'
    }, {
        dom: 'cbLoaiCayTrong',
        property: 'LoaiCayTrong'
    }, {
        dom: 'nbPhamViAnhHuong',
        property: 'PhamViAnhHuong'
    }, {
        dom: 'nbDienTich',
        property: 'DienTich'
    }, { dom: 'cbCapDoGayHai', property: 'CapDoGayHai' }
    ], ['LoaiCayTrong', 'TenSauBenhGayHai', 'MaSauBenh'])

    //add event to update combobox  when click tab-trongtrot
    $('#a-tab-trongtrot').first().on('click', function () {
        loadData('#tab-trongtrot #cbNhomCayTrong', 'NhomCayTrong', trongTrotLayer), loadData('#tab-trongtrot #cbLoaiCayTrong', 'LoaiCayTrong', trongTrotLayer), loadData('#tab-trongtrot #cbPhuongThucTrong', 'PhuongThucTrong', trongTrotLayer);
    });


    //add event to search with button
    addSearchEvent('#tab-trongtrot', trongTrotLayer, [{
        dom: 'cbNhomCayTrong',
        property: 'NhomCayTrong'
    }, {
        dom: 'cbLoaiCayTrong',
        property: 'LoaiCayTrong'
    }, {
        dom: 'cbPhuongThucTrong',
        property: 'PhuongThucTrong'
    }, { dom: 'cbCapDoGayHai', property: 'CapDoGayHai' }, {
        dom: 'nbDienTich',
        property: 'DienTich'
    }
    ], ['LoaiCayTrong', 'MaHuyenTP', 'MaDoiTuong']);



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
            var idProperty = myFeatureLayer.objectIdField,
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
            showAttachments: true,
            // only allows selection from the table to the map 
            syncSelection: true,
            zoomToSelection: true,
            editable: true,
            gridOptions: {
                allowSelectAll: true,
                allowTextSelection: true,
            },
            editable: true,
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
            }]
        }, div);
        myFeatureTable.startup();

    }



    function loadTableSauBenh() {
        if (!isLoadTable.sauBenh) {
            loadTable(sauBenhLayer, 'tableLayerSauBenh');
            isLoadTable.sauBenh = true;
        //    //isLoadTable.trongTrot = false;
        //    //isLoadTable.doanhNghiep = false;
        }
        document.getElementById('tableDoanhNghiep').style.display = 'none';
        document.getElementById('tableTrongTrot').style.display = 'none';
        document.getElementById('tableLayerSauBenh').style.display = 'block';
        resizeSplitter($("#contentPane").height());
    }

    function loadTableDoanhNghiep() {
        if (!isLoadTable.doanhNghiep) {
            loadTable(doanhNghiepLayer, 'tableDoanhNghiep');
           isLoadTable.doanhNghiep = true;
        //    //isLoadTable.trongTrot = false;
        //    //isLoadTable.sauBenh = false;
        }
        
        console.log($(".dijitContentPane").height());
       
        document.getElementById('tableLayerSauBenh').style.display = 'none';
        document.getElementById('tableTrongTrot').style.display = 'none';
        document.getElementById('tableDoanhNghiep').style.display = 'block';
        resizeSplitter($("#contentPane").height());
    }

    function loadTableTrongTrot() {
        if (!isLoadTable.trongTrot) {
            loadTable(trongTrotLayer, 'tableTrongTrot');
            isLoadTable.trongTrot = true;
        }
       
        document.getElementById('tableDoanhNghiep').style.display = 'none';
        document.getElementById('tableLayerSauBenh').style.display = 'none';
        document.getElementById('tableTrongTrot').style.display = 'block';
        resizeSplitter($("#contentPane").height());
    }
    

    var isLoadTable = {
        firstClick:true,
        sauBenh: false,
        trongTrot: false,
        doanhNghiep: false
    }
    window.loadTableSauBenh = loadTableSauBenh;
    window.loadTableDoanhNghiep = loadTableDoanhNghiep;
    window.loadTableTrongTrot = loadTableTrongTrot;
    $(document).ready(function () {
        $('ul.dropdown-menu li').click(function (e) {
           
        });
    });
});
