var map, sauBenhLayer, trongTrotLayer, SuDungDatTrong, doanhNghiepLayer, dynamicMapServiceLayer, hanhChinhHuyenLayer;

require([
  "esri/map",
  "esri/tasks/GeometryService",

  "esri/layers/ArcGISTiledMapServiceLayer",
  "esri/layers/ArcGISDynamicMapServiceLayer",
  "esri/layers/ImageParameters",
  "esri/layers/FeatureLayer",

  "esri/Color",
  "esri/symbols/SimpleMarkerSymbol",
  "esri/symbols/SimpleLineSymbol",

  "esri/dijit/editing/Editor",
  "esri/dijit/editing/TemplatePicker",

  "esri/config",
  "dojo/i18n!esri/nls/jsapi",

  "dojo/_base/array", "dojo/parser", "dojo/keys",

  "esri/dijit/HomeButton",
  "esri/dijit/Scalebar",
   "esri/geometry/Point",
   "esri/tasks/ProjectParameters",
    "esri/graphic",
    "esri/SpatialReference",
    "esri/geometry/Extent",

    "esri/tasks/query", "dojo/query",

    "esri/toolbars/navigation",
    "dijit/registry",
    "dojo/on",
    'jquery',
    'knockout',
  "dijit/layout/BorderContainer", "dijit/layout/ContentPane",
  "dojo/domReady!"
], function ($, ko,
  Map, GeometryService,
  ArcGISTiledMapServiceLayer, ArcGISDynamicMapServiceLayer, ImageParameters, FeatureLayer,
  Color, SimpleMarkerSymbol, SimpleLineSymbol,
  Editor, TemplatePicker,
  esriConfig, jsapiBundle,
  arrayUtils, parser, keys
  , HomeButton, Scalebar, Point, ProjectParameters, Graphic, SpatialReference, Extent
  , Query, dojoQuery
  , Navigation, registry, on

) {

    parser.parse();

    // snapping is enabled for this sample - change the tooltip to reflect this
    jsapiBundle.toolbars.draw.start = jsapiBundle.toolbars.draw.start + "<br>Press <b>ALT</b> to enable snapping";

    // refer to "Using the Proxy Page" for more information:  https://developers.arcgis.com/javascript/3/jshelp/ags_proxy.html

    var url = window.location.href + "DotNet/proxy.ashx";
    esriConfig.defaults.io.proxyUrl = url;

    //This service is for development and testing purposes only. We recommend that you create your own geometry service for use within your applications.
    esriConfig.defaults.geometryService = new GeometryService("https://utility.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer");

    var sr = new SpatialReference({
        "wkt": 'PROJCS["BINHDUONG_VN2000",GEOGCS["GCS_VN_2000",DATUM["D_Vietnam_2000",SPHEROID["WGS_1984",6378137.0,298.257223563]],PRIMEM["Greenwich",0.0],UNIT["Degree",0.0174532925199433]],PROJECTION["Transverse_Mercator"],PARAMETER["False_Easting",500000.0],PARAMETER["False_Northing",0.0],PARAMETER["Central_Meridian",105.75],PARAMETER["Scale_Factor",0.9999],PARAMETER["Latitude_Of_Origin",0.0],UNIT["Meter",1.0]]'
    });

    map = new Map("map", {
        zoom: 14,
        logo: false
    });

    map.on("layers-add-result", initEditor);

    var imageParameters = new ImageParameters();
    imageParameters.format = "jpeg";

    var linkBaseMap = "http://112.78.4.175:6080/arcgis/rest/services/Basemap_BaoVeThucVat/MapServer";
    var geoMetryLink = "http://112.78.4.175:6080/arcgis/rest/services/Utilities/Geometry/GeometryServer";

    var BaoVeThucVat_link = "http://112.78.4.175:6080/arcgis/rest/services/BaoVeThucVat_ChuyenDe/FeatureServer/0";
    var DoanhNghiep_link = "http://112.78.4.175:6080/arcgis/rest/services/BaoVeThucVat_ChuyenDe/FeatureServer/0";
    var PhanBon_link = "http://112.78.4.175:6080/arcgis/rest/services/BaoVeThucVat_ChuyenDe/FeatureServer/2";
    var sauBenhLink = "http://112.78.4.175:6080/arcgis/rest/services/BaoVeThucVat_ChuyenDe/FeatureServer/1";
    var KiemDichThucVat_link = "http://112.78.4.175:6080/arcgis/rest/services/BaoVeThucVat_ChuyenDe/FeatureServer/4";
    var TrongTrot_link = "http://112.78.4.175:6080/arcgis/rest/services/BaoVeThucVat_ChuyenDe/FeatureServer/2";
    var SuDungDatTrong_link = "http://112.78.4.175:6080/arcgis/rest/services/BaoVeThucVat_ChuyenDe/FeatureServer/3";
    var GiongCay_link = "http://112.78.4.175:6080/arcgis/rest/services/BaoVeThucVat_ChuyenDe/FeatureServer/7";
    var ThuaDat_link = "http://112.78.4.175:6080/arcgis/rest/services/BaoVeThucVat_ChuyenDe/FeatureServer/8";

    //add boundaries and place names
    dynamicMapServiceLayer = new ArcGISDynamicMapServiceLayer(linkBaseMap, {
        "imageParameters": imageParameters
    });

    doanhNghiepLayer = new FeatureLayer(DoanhNghiep_link, {
        mode: FeatureLayer.MODE_ONDEMAND,
        outFields: ["*"]
    });
    GiongCay = new FeatureLayer(GiongCay_link, {
        mode: FeatureLayer.MODE_ONDEMAND,
        outFields: ["*"]
    });
    sauBenhLayer = new FeatureLayer(sauBenhLink, {
        mode: FeatureLayer.MODE_ONDEMAND,
        outFields: ["*"]
    });
    SuDungDatTrong = new FeatureLayer(SuDungDatTrong_link, {
        mode: FeatureLayer.MODE_ONDEMAND,
        outFields: ["*"]
    });
    trongTrotLayer = new FeatureLayer(TrongTrot_link, {
        mode: FeatureLayer.MODE_ONDEMAND,
        outFields: ["*"]
    });

    hanhChinhHuyenLayer = new FeatureLayer("http://112.78.4.175:6080/arcgis/rest/services/BaoVeThucVat_BDBaseMap/MapServer/6", {
        mode: FeatureLayer.MODE_ONDEMAND,
        outFields: ["*"]
    });

    map.addLayer(dynamicMapServiceLayer);
    map.addLayers([trongTrotLayer, SuDungDatTrong, sauBenhLayer, doanhNghiepLayer]);

    function initEditor(evt) {
        var templateLayers = arrayUtils.map(evt.layers, function (result) {
            return result.layer;
        });
        var templatePicker = new TemplatePicker({
            featureLayers: templateLayers,
            grouping: true,
            rows: "auto",
            columns: 3
        }, "templateDiv");
        templatePicker.startup();

        var layers = arrayUtils.map(evt.layers, function (result) {
            return { featureLayer: result.layer };
        });
        var settings = {
            map: map,
            templatePicker: templatePicker,
            layerInfos: layers,
            toolbarVisible: true,
            createOptions: {
                polylineDrawTools: [Editor.CREATE_TOOL_FREEHAND_POLYLINE],
                polygonDrawTools: [Editor.CREATE_TOOL_FREEHAND_POLYGON,
                  Editor.CREATE_TOOL_CIRCLE,
                  Editor.CREATE_TOOL_TRIANGLE,
                  Editor.CREATE_TOOL_RECTANGLE
                ]
            },
            toolbarOptions: {
                reshapeVisible: true
            }
        };

        var params = { settings: settings };
        var myEditor = new Editor(params, 'editorDiv');
        //define snapping options
        var symbol = new SimpleMarkerSymbol(
          SimpleMarkerSymbol.STYLE_CROSS,
          15,
          new SimpleLineSymbol(
            SimpleLineSymbol.STYLE_SOLID,
            new Color([255, 0, 0, 0.5]),
            5
          ),
          null
        );
        map.enableSnapping({
            snapPointSymbol: symbol,
            tolerance: 20,
            snapKey: keys.ALT
        });

        myEditor.startup();
    }

    //var homeButton = new HomeButton({
    //    theme: "HomeButton",
    //    map: map,
    //    extent: null,
    //    visible: false
    //}, "homeDiv");
    //homeButton.startup();

    //$("#home").click(function () {
    //    homeButton.home();
    //});

    var scalebar = new Scalebar({
        map: map,
        attachTo: "bottom-left"
    });


    //create button Search in map
    var btnFind = $("<div class='leaflet-control-geocoder leaflet-control'><a class='leaflet-control-geocoder-toggle' href='#' title='Tìm kiếm'></a></div>");
    btnFind.click(function () {

        var check = $("#tabSearchControl").hasClass("undisplay");

        if (check) {

            $("#tabMapControl").removeClass("col-md-12");
            $("#tabMapControl").removeClass("col-lg-12");

            $("#tabSearchControl").addClass("col-md-4");
            $("#tabSearchControl").addClass("col-lg-3");

            $("#tabMapControl").addClass("col-md-8");
            $("#tabMapControl").addClass("col-lg-9");


            $("#tabAddDataControl").removeClass("col-md-4");
            $("#tabAddDataControl").removeClass("col-lg-3");

            $("#tabAddDataControl").css("display", "none");
            $("#tabSearchControl").css("display", "inherit");

        }
        else {

            $("#tabSearchControl").removeClass("col-md-4");
            $("#tabSearchControl").removeClass("col-lg-3");

            $("#tabMapControl").removeClass("col-md-8");
            $("#tabMapControl").removeClass("col-lg-9");

            $("#tabMapControl").addClass("col-md-12");
            $("#tabMapControl").addClass("col-lg-12");

            $("#tabSearchControl").css("display", "none");
        }

        map.resize();

    });
    $('#map').append(btnFind);

    //add logo to bottom left in map
    $('#map').append($("<div class='leaflet-control-logo leaflet-control'><img src='/Content/img/logo-ditagis.png'/>"));


    ////////////////////////////////


    function extentHistoryChangeHandler() {
        registry.byId("zoomprev").disabled = navToolbar.isFirstExtent();
        registry.byId("zoomnext").disabled = navToolbar.isLastExtent();
    }

    ////////////////////////////////

    ///////////////  location  /////////////////

    $("#location").click(function () {
        initFunc(map);
    });

    var watchID;
    function initFunc(map) {
        if (navigator.geolocation) {
            watchID = navigator.geolocation.getCurrentPosition(zoomToLocation, locationError,
            {
                //timeout: 0,
                enableHighAccuracy: true,
                maximumAge: Infinity
            }
            );
        } else {
            alert("Trình duyệt bạn đan sử dụng không hỗ trợ định vị vị trí.");
        }
    }

    function zoomToLocation(location) {
        // get lat/lon and convert to VN_2000
        var geometryService = new GeometryService(geoMetryLink);
        var inputpoint = new Point(location.coords.longitude, location.coords.latitude);

        var PrjParams = new ProjectParameters();
        PrjParams.geometries = [inputpoint];
        PrjParams.outSR = sr;

        geometryService.project(PrjParams, function (outputpoint) {
            y = outputpoint[0].y + 112.01;
            x = outputpoint[0].x - 196.5;
            var pt = new Point(x, y, map.spatialReference);

            var ptSymbol = new SimpleMarkerSymbol({
                "color": [127, 255, 255, 255],
                "size": 10,
                "type": "esriSMS",
                "style": "esriSMSCircle",
                "outline": {
                    "color": [0, 0, 0, 255],
                    "width": 1,
                    "type": "esriSLS",
                    "style": "esriSLSSolid"
                }
            });
            var ptGraphic = new Graphic(pt, ptSymbol);
            map.graphics.clear();
            map.graphics.add(ptGraphic);
            var extent = new Extent((x + 80), (y + 80), (x - 80), (y - 80), map.spatialReference);
            var stateExtent = extent.expand(5.0);
            map.setExtent(stateExtent);
        });

    }

    function locationError(error) {
        //error occurred so stop watchPosition
        if (navigator.geolocation) {
            navigator.geolocation.clearWatch(watchID);
        }
        switch (error.code) {
            case error.PERMISSION_DENIED:
                alert("Quyền truy cập vị trí bị cấm khi sử dụng trình duyệt này. Vui lòng đổi trình duyệt khác hoặc nâng cấp lên giao thức có bảo mật SSL");
                break;

            case error.POSITION_UNAVAILABLE:
                alert("Không thể xác định vị trí của bạn ");
                break;

            case error.TIMEOUT:
                alert("Hết thời gian kết nối. Máy chủ đang quá tải");
                break;

            default:
                alert("Máy chủ đang quá tải");
                break;
        }
    }
    ////////////// end location //////////////////
    /// config layout ///



    ////End config//////

    /// Seach ///
    function addSearchEvent(domId, feature, arrAttribute, selectProperty) {

        var btnFindDom = $(domId + ' #btnFind'), resultDom = $(domId + ' #result'), counterDom = $(domId + ' #counter');
        $(btnFindDom).click(function (e) {
            var where = "1=1";

            arrAttribute.forEach(function (value, index) {
                var domValue = $("#" + value.dom).val();
                if (domValue.trim().length > 0) {
                    where += " AND " + value.property + " LIKE N'%" + domValue + "%'";
                }
            });

            //if (where == "1=1") {
            //    alert("Vui lòng nhập thông tin tìm kiếm");
            //    return;
            //}

            $(".loading").css("display", "inline-block");
            $(resultDom).html('');
            $(counterDom).html('');
            var query = new Query();
            query.returnGeometry = true;
            query.outFields = ["*"];
            query.where = where;
            feature.selectFeatures(query, FeatureLayer.SELECTION_NEW, function (results) {
                //alert(results.length);
                var html = "";
                if (results.length > 0) {
                    for (var i = 0 ; i < results.length ; i++) {
                        var feat = results[i];
                        var attr = feat.attributes;

                        html += "<tr>  <td>  <span alt='" + attr[selectProperty[0]] + "' class='viewdata'>" + attr[selectProperty[1]] + " </span></td> </tr>";

                    }

                    $(resultDom).html(html);
                    $(counterDom).html(results.length);

                }

                $(".loading").css("display", "none");

            });

        });


        //$(btnExcelId).click(function (e) {
        //    var where = "1=1";

        //    arrAttribute.forEach(function (value, index) {
        //        if (value.dom.trim().length > 0) {
        //            where += " AND "+value.property+"LIKE N'%" + value.dom+ "%'";
        //        }
        //    });

        //    if (where == "1=1") {
        //        alert("Vui lòng nhập thông tin tìm kiếm");
        //        return;
        //    }

        //    $(".loading").css("display", "inline-block");
        //    document.getElementById(resultFormDomId).innerHTML = "";
        //    document.getElementById(counterResultFormDomId).innerHTML = "";
        //    var query = new Query();
        //    query.returnGeometry = true;
        //    query.outFields = ["*"];
        //    query.where = where;

        //    var fieldList = SuDungDatTrong.fields;

        //    var htmlTable = "<table> <tr><th colspan='" + fieldList.length + "'>" + feature.name + "</th></tr> <tr> ";
        //    for (var i = 0 ; i < fieldList.length ; i++) {
        //        htmlTable += "<th> " + fieldList[i].alias + " </th>";
        //    }
        //    htmlTable += "</tr>";


        //    feature.selectFeatures(query, FeatureLayer.SELECTION_NEW, function (results) {
        //        //alert(results.length);
        //        var html = "";
        //        if (results.length > 0) {
        //            for (var i = 0 ; i < results.length ; i++) {
        //                var feat = results[0];
        //                var attr = feat.attributes;

        //                html += "<tr>  <td>  <span alt=" + attr["MaDN"] + " class='viewdata'>" + attr["Ten"] + " </span></td> </tr>";

        //            }

        //            document.getElementById(resultFormDomId).innerHTML = html;
        //            document.getElementById(counterResultFormDomId).innerHTML = results.length;

        //            htmlTable += "<tr>";
        //            for (var y = 0 ; y < fieldList.length; y++) {
        //                htmlTable += "<td> " + attr[fieldList[y].name] + " </td>";
        //            }
        //            htmlTable += " </tr>";
        //            htmlTable += "</table>";

        //            // alert(htmlTable);
        //            // nếu có data thì load excel
        //            var ua = window.navigator.userAgent;
        //            var msie = ua.indexOf('MSIE ');
        //            var trident = ua.indexOf('Trident/');
        //            var edge = ua.indexOf('Edge/');

        //            if (msie > 0 || trident > 0 || edge > 0) {
        //                if (window.navigator.msSaveBlob) {
        //                    var blob = new Blob([htmlTable], {
        //                        type: "application/csv;charset=utf-8;"
        //                    });
        //                    navigator.msSaveBlob(blob, 'BaoCaoExcel.xls');
        //                }
        //            }
        //            else {
        //                var url = 'data:application/vnd.ms-excel,' + encodeURIComponent(htmlTable);
        //                location.href = url
        //            }
        //            // end load excel
        //        }
        //        else {

        //            // nếu ko có data thì thông báo
        //            alert("Không có dữ liệu để xuất thông tin ra file excel.");

        //        }

        //        $(".loading").css("display", "none");

        //    });

        //});


        $(resultDom).on("click", "span.viewdata", function () {
            var value = $(this).attr('alt');
            viewPoint((selectProperty[0] + " = '" + value + "'"), feature);
        });
    }


    function viewPoint(query, layer) {
        var query = new Query();
        query.returnGeometry = true;
        query.outFields = ["*"];
        query.where = value;
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
    }
    addSearchEvent('#tab-doanhnghiep', doanhNghiepLayer, [{
        dom: 'txtMaDN',
        property: 'MaDoanhNghiep'
    },
    {
        dom: 'txtTen',
        property: 'NguoiDaiDienDoanhNghiep  '
    }, {
        dom: 'txtQuanHuyen',
        property: 'QuanHuyen'
    }
    ], ['MaDoanhNghiep', 'NguoiDaiDienDoanhNghiep'])

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
    $('a[href=#tab-saubenh]').first().on('click', function () {
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
    ], ['LoaiCayTrong', 'TenSauBenhGayHai'])

    //add event to update combobox  when click tab-trongtrot
    $('a[href=#tab-trongtrot]').first().on('click', function () {
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
    ], ['LoaiCayTrong', 'TenGiongCayTrong'])

});
