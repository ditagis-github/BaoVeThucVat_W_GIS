var map, view, baseMap, sauBenhLayer, trongTrotLayer, SuDungDatTrong, doanhNghiepLayer, dynamicMapServiceLayer, hanhChinhHuyenLayer,query;
require([
  "dojo/dom-construct",
  "esri/Map",
  "esri/views/MapView",
  "esri/layers/MapImageLayer",
  "esri/layers/FeatureLayer", "esri/tasks/support/Query", "esri/tasks/QueryTask",
  "esri/widgets/Home","esri/widgets/Expand","esri/widgets/LayerList","esri/widgets/Search","esri/widgets/Locate","esri/widgets/Legend",//widget
  "dojo/domReady!"
], function (
    domConstruct,
    Map, MapView,
    MapImageLayer,
    FeatureLayer, Query, QueryTask,
    Home,Expand,LayerList,Search,Locate,Legend//widget
    ) {
    map = new Map();
    view = new MapView({
        container: "map",  // Reference to the scene div created in step 5
        map: map,  // Reference to the map object created before the scene
        zoom: 13,  // Sets the zoom level based on level of detail (LOD)
        center: [106.688166, 11.172618],  // Sets the center point of view in lon/lat
        maxZoom: 13 //Sets the maxZoom level of the view
    });

    baseMap = new MapImageLayer({
        url: "http://112.78.4.175:6080/arcgis/rest/services/Basemap_BaoVeThucVat/MapServer",
        title: "Bình Dương"
    });
    map.add(baseMap);
    var esriImageWorld = new MapImageLayer({
        url: "https://services.arcgisonline.com/arcgis/rest/services/ESRI_Imagery_World_2D/MapServer",
        title: "Vệ tinh",
        visible: false
    });
    map.add(esriImageWorld);
    doanhNghiepLayer = new FeatureLayer("http://112.78.4.175:6080/arcgis/rest/services/BaoVeThucVat_ChuyenDe/FeatureServer/0", {
        mode: FeatureLayer.MODE_ONDEMAND,
        outFields: ["*"],
        title: "Doanh nghiệp"
    });
    sauBenhLayer = new FeatureLayer("http://112.78.4.175:6080/arcgis/rest/services/BaoVeThucVat_ChuyenDe/FeatureServer/1", {
        mode: FeatureLayer.MODE_ONDEMAND,
        outFields: ["*"],
        title: "Sâu bệnh"
    });
    SuDungDatTrong = new FeatureLayer("http://112.78.4.175:6080/arcgis/rest/services/BaoVeThucVat_ChuyenDe/FeatureServer/3", {
        mode: FeatureLayer.MODE_ONDEMAND,
        outFields: ["*"],
        title: "Sử dụng đất"
    });
    trongTrotLayer = new FeatureLayer("http://112.78.4.175:6080/arcgis/rest/services/BaoVeThucVat_ChuyenDe/FeatureServer/2", {
        mode: FeatureLayer.MODE_ONDEMAND,
        outFields: ["*"],
        title: "Trồng trọt"
    });
    //map.add(sauBenhLayer);
    map.addMany([SuDungDatTrong,trongTrotLayer, sauBenhLayer, doanhNghiepLayer]);






    //// --------------------------------- Widget ---------------------------------///

    // Add the Home widget to the top left corner of the view
    view.ui.add(new Home({
        view: view
    }), //Add Home Widget to top-left of the view
    {
        position: "top-left"
    });

    // LayerList //
    var layerList = new LayerList({
        container: document.createElement("div"),
        view: view
    });
    layerListExpand = new Expand({
        expandIconClass: "esri-icon-layer-list",  // see https://developers.arcgis.com/javascript/latest/guide/esri-icon-font/
        expandTooltip: "Lớp dữ liệu", ///Set tooltip when hover at button Expand of the view, defaults to "Expand" for English locale
        view: view,
        content: layerList.domNode
    });
    view.ui.add(layerListExpand, "top-left");



    // Widget Search Features //
    var searchWidget = new Search({
        view: view,
        allPlaceholder: "District or Senator",
        sources: [{
            featureLayer: sauBenhLayer,
            searchFields: ["TenSauBenhGayHai", "LoaiCayTrong"],
            displayField: "TenSauBenhGayHai",
            exactMatch: false,
            outFields: ["*"],
            name: "Sâu hại",
            placeholder: "Ví dụ: Chuồn chuồn",
        }, {
            featureLayer: doanhNghiepLayer,
            searchFields: ["MaDoanhNghiep", "NguoiDaiDienDoanhNghiep"],
            displayField: "NguoiDaiDienDoanhNghiep",
            exactMatch: false,
            outFields: ["*"],
            name: "Doanh Nghiệp",
            placeholder: "Nhập tên hoặc mã Doanh nghiệp",
        }]
    });

    // Add the search widget to the top left corner of the view
    view.ui.add(searchWidget, {
        position: "top-right"
    });

    //Add Logo DATAGIS to the bottom left of the view
    var logo = domConstruct.create("img", {
        src: "/Content/img/logo-ditagis.png",
        id: "logo"
    });
    view.ui.add(logo, "bottom-left");


    // Add the locate widget to the top left corner of the view
    view.ui.add(new Locate({
        view: view
    }), //Add Locate Widget to top-left of the view
    {
        position: "top-left"
    });

    // Add Legend widget to the bottom right corner of the view
    view.ui.add(new Legend({
        view: view,
        layerInfos: [{
            layer: sauBenhLayer,
            title: "Sâu bệnh"
        }, {
            layer: doanhNghiepLayer,
            title: "Doanh nghiệp"
        }, {
            layer: trongTrotLayer,
            title: "Đất trồng"
        }]
    }), "bottom-right");

    var query = new Query({
        returnGeometry: true,
        outFields: ["*"]
    });

    //-----------------------EVENT FIND AT TAB-----------------------//

    query = new Query({
        returnGeometry: true,
        outFields: ["*"]
    });
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


            $(".loading").css("display", "inline-block");
            $(resultDom).html('');
            $(counterDom).html('');
            query.where = where;

            feature.queryFeatures(query).then(function (results) {
                var html = "";
                var features = results.features;
                if (features.length > 0) {
                    for (var i = 0 ; i < features.length ; i++) {
                        var attr = features[i].attributes;
                        var span = $('<span/>').text(attr[selectProperty[1]]).click(function () {
                            query.where = [selectProperty[0], "='", attr[selectProperty[0]], "'"].join('');

                            feature.queryFeatures(query).then(function (response) {
                                if (response.features.length > 0) {
                                    var f = response.features[0];
                                    var p = response.features[0].geometry;
                                    p.latitude = p.y, p.longitude = p.x;
                                    view.goTo(p);
                                    view.zoom = 5;
                                }

                            })
                        });;
                        var tr = $('<tr/>');
                        tr.append($('<td/>').text((i + 1) + ". "));
                        tr.append($('<td/>').append(span));
                        $(resultDom).append(tr);

                    }
                    $(counterDom).html(features.length);
                }

                $(".loading").css("display", "none");

            });

        });
    }

    addSearchEvent('#tab-doanhnghiep', doanhNghiepLayer, [{
        dom: 'txtMaDN',
        property: 'MaDoanhNghiep'
    },
    {
        dom: 'txtTen',
        property: 'NguoiDaiDienDoanhNghiep'
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
    ], ['LoaiCayTrong', 'TenSauBenhGayHai'])

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
    ], ['LoaiCayTrong', 'TenGiongCayTrong'])
});