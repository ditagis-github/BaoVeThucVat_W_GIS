var mapconfigs = {
    basemapUrl: "http://112.78.4.175:6080/arcgis/rest/services/Basemap_BaoVeThucVat/MapServer",
    doanhNghiepUrl: "http://112.78.4.175:6080/arcgis/rest/services/BaoVeThucVat_ChuyenDe/FeatureServer/0",
    sauBenhUrl: "http://112.78.4.175:6080/arcgis/rest/services/BaoVeThucVat_ChuyenDe/FeatureServer/1",
    trongTrotUrl: "http://112.78.4.175:6080/arcgis/rest/services/BaoVeThucVat_ChuyenDe/FeatureServer/2"
};
var SearchEvent;
require(["esri/layers/FeatureLayer", "esri/tasks/support/Query", "esri/geometry/Extent"
], function (FeatureLayer, Query, Extent) {
    SearchEvent = class SearchEvent {

        constructor(options) {
            this.options = [];
            for (var i in options) {
                this.options[i] = options[i] || this.options[i];
            }
            let btnFindDom = $(this.options.domId + ' #btnFind');
            this.resultDom = $(this.options.domId + ' #result'),
            this.counterDom = $(this.options.domId + ' #counter');
            let that = this;
            $(btnFindDom).click(function () {
                let query = that.getQuery();
                that.selectFeatures(query);
            });
        }
        getQuery() {
            let query = new Query({
                returnGeometry: true,
                outFields: ["*"]
            }),
             where = ['1=1'];
            this.options.attributes.forEach(function (value, index) {
                let domValue = $("#" + value.dom).val();

                if (domValue.length > 0) {
                    where.push(value.property + " LIKE N'%" + domValue + "%'");
                }
            });
            where.join(' AND');
            query.where = where;
            return query;
        }
        selectFeatures(query) {
            let resultDom = this.resultDom,
                counterDom = this.counterDom,
                selectProperties = this.options.selectProperties,
                feature = this.options.feature;
            feature.queryFeatures(query).then(function (results) {
                let features = results.features;
                if (features.length > 0) {
                    for (let i in features) {
                        let currentFeature = features[i],
                        attrs = currentFeature.attributes;
                        let tr = $('<tr/>');
                        tr.attr('data-id', attrs['OBJECTID']);
                        let _feature = feature;
                        tr.click(function () {
                            let id = $(this).attr('data-id');
                            searchWidget.search(id);
                        });
                        tr.append($('<td/>').text((i + 1) + ". "));
                        tr.append($('<td/>').text(attrs[selectProperties[2]]));
                        tr.append($('<td/>').append(attrs[selectProperties[1]]));

                        $(resultDom).append(tr);

                    }
                    $(counterDom).html(features.length);
                }

                $(".loading").css("display", "none");

            });
        }
    }
});

var map, view, baseMap,
    sauBenhLayer, trongTrotLayer, doanhNghiepLayer,
    searchWidget;

require([
  "dojo/dom-construct",
  "esri/Map",
  "esri/views/MapView",
  "esri/layers/MapImageLayer",
  "esri/geometry/SpatialReference",
  "esri/layers/FeatureLayer", "esri/tasks/support/Query", "esri/tasks/QueryTask",
  "esri/widgets/Home", "esri/widgets/Expand", "esri/widgets/LayerList", "esri/widgets/Search", "esri/widgets/Locate", "esri/widgets/Legend",//widget

  "dojo/domReady!"
], function (
    domConstruct,
    Map, MapView,
    MapImageLayer,
    SpatialReference,
    FeatureLayer, Query, QueryTask,
    Home, Expand, LayerList, Search, Locate, Legend//widget
    ) {

    map = new Map({
        basemap: "dark-gray"
    });
    baseMap = new MapImageLayer({
        url: mapconfigs.basemapUrl,
        title: "Dữ liệu nền Bình Dương"
    });
    map.add(baseMap);
    view = new MapView({
        container: "map",  // Reference to the scene div created in step 5
        map: map,  // Reference to the map object created before the scene
        zoom: 10,  // Sets the zoom level based on level of detail (LOD)
        center: [106.688166, 11.172618]
    });


    var esriImageWorld = new MapImageLayer({
        url: "https://services.arcgisonline.com/arcgis/rest/services/ESRI_Imagery_World_2D/MapServer",
        title: "Vệ tinh",
        visible: false
    });
    map.add(esriImageWorld);

    initFeatureLayers();

    initWidgets();

    function initFeatureLayers() {
        doanhNghiepLayer = new FeatureLayer(mapconfigs.doanhNghiepUrl, {
            mode: FeatureLayer.MODE_ONDEMAND,
            outFields: ["*"],
            title: "Doanh nghiệp",
            popupTemplate: {
                title: "{NguoiDaiDienDoanhNghiep}",
                content: "<table>" +
                    "<tr><td>Tên: </td><td>{NguoiDaiDienDoanhNghiep}</td></tr>" +
                    "<tr><td>Địa chỉ: </td><td>{SoNha}</td></tr>" +
                    "<tr><td>Website: </td><td>{Website}</td></tr>" +
                    "<tr><td>Email: </td><td>{Email}</td></tr>" +
                    "<tr><td>Danh mục sản phẩm: </td><td>{DanhMucSanPham}</td></tr>" +
                    "</table>"
            }
        });
        sauBenhLayer = new FeatureLayer(mapconfigs.sauBenhUrl, {
            mode: FeatureLayer.MODE_ONDEMAND,
            outFields: ["*"],
            title: "Sâu bệnh",
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
        trongTrotLayer = new FeatureLayer(mapconfigs.trongTrotUrl, {
            mode: FeatureLayer.MODE_ONDEMAND,
            outFields: ["*"],
            title: "Trồng trọt",
            popupTemplate: {
                title: "{TenGiongCayTrong}",
                content: "<table>" +
                    "<tr><td>Nhóm cây trồng: </td><td>{NhomCayTrong}</td></tr>" +
                    "<tr><td>Loại cây trồng: {LoaiCayTrong}</td></tr>" +
                    "<tr><td>Diện tích trồng: </td><td>{DienTichTrong}</td></tr>" +
                    "<tr><td>Tình hình ứng dụng công nghệ: </td><td>{TinhHinhUngDungCongNghe}</td></tr>" +
                    "<tr><td>Tổ chức cá nhân quản lý: </td><td>{ToChucCaNhanQuanLy}</td></tr>" +
                    "<tr><td>Tình trạng thu hoạch: </td><td>{TinhTrangThuHoach}</td></tr>" +
                    "<tr><td>Phương thức trồng: </td><td>{PhuongThucTrong}</td></tr>" +
                    "<tr><td>Thời vụ trồng: </td><td>{ThoiVuTrongTrot}</td></tr>" +
                    "<tr><td>Giai đoạn sinh trưởng: </td><td>{GiaiDoanSinhTruong}</td></tr>" +
                    "<tr><td>Ghi chú: </td><td>{GhiChu}</td></tr>" +
                    "</table>"
            }
        });
        //map.add(sauBenhLayer);
        map.addMany([trongTrotLayer, sauBenhLayer, doanhNghiepLayer]);
    }

    //// --------------------------------- Widget ---------------------------------///
    function initWidgets() {
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
        searchWidget = new Search({
            view: view,
            allPlaceholder: "Nhập nội dung tìm kiếm",
            sources: [{
                featureLayer: sauBenhLayer,
                searchFields: ["OBJECTID", "MaSauBenh", "MaHuyenTP"],
                displayField: "MaSauBenh",
                exactMatch: false,
                outFields: ["*"],
                name: "Sâu hại",
                placeholder: "Tìm kiếm theo tên, loại cây trồng, huyện/tp",
            }
            , {
                featureLayer: doanhNghiepLayer,
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
    }


    //-----------------------EVENT FIND AT TAB-----------------------//

    function loadData(dom, fieldName, layer) {
        var combo = $(dom);
        if (combo.find("option").length > 1)
            return;

        layer.getFieldDomain(fieldName).codedValues.forEach(function (value, index) {
            var code = value.code, name = value.name;
            //create Element option item with Jquery
            var option = $('<option/>').val(code).text(name);
            combo.append(option);
        })
    }


    let saubenhSearch = new SearchEvent({
        domId: '#tab-doanhnghiep',
        feature: doanhNghiepLayer,
        attributes: [
            {
                dom: 'txtMaDN',
                property: 'MaDoanhNghiep'
            }, {
                dom: 'txtTen',
                property: 'NguoiDaiDienDoanhNghiep'
            }, {
                dom: 'cbQuanHuyen',
                property: 'MaHuyenTP'
            }
        ],
        selectProperties: ['MaDoanhNghiep', 'NguoiDaiDienDoanhNghiep', 'MaDoanhNghiep']
    }), doanhNghiepSearch = new SearchEvent({
        domId: '#tab-saubenh',
        feature: sauBenhLayer,
        attributes: [{
            dom: 'cbNhomCayTrong',
            property: 'NhomCayTrong'
        }, {
            dom: 'cbGiaiDoanSinhTruong',
            property: 'GiaiDoanSinhTruong '
        }, {
            dom: 'nbPhamViAnhHuong',
            property: 'PhamViAnhHuong'
        }, {
            dom: 'nbDienTich',
            property: 'DienTich'
        }, {
            dom: 'cbCapDoGayHai',
            property: 'CapDoGayHai'
        }
        ],
        selectProperties: ['LoaiCayTrong', 'TenSauBenhGayHai', 'MaSauBenh']
    }),
 trongTrotSearch = doanhNghiepSearch = new SearchEvent({
     domId: '#tab-trongtrot',
     feature: trongTrotLayer,
     attributes: [{
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
     ],
     selectProperties: ['LoaiCayTrong', 'MaHuyenTP', 'MaDoiTuong']
 });
    //add event to update combobox  when click tab-saubenh
    $('#a-tab-saubenh').on('click', function () {
        loadData('#tab-saubenh #cbNhomCayTrong', 'NhomCayTrong', sauBenhLayer),
        loadData('#tab-saubenh #cbGiaiDoanSinhTruong', 'GiaiDoanSinhTruong', sauBenhLayer),
        loadData('#tab-saubenh #cbLoaiCayTrong', 'LoaiCayTrong', sauBenhLayer);

    });
    //add event to update combobox  when click tab-trongtrot
    $('#a-tab-trongtrot').first().on('click', function () {
        loadData('#tab-trongtrot #cbNhomCayTrong', 'NhomCayTrong', trongTrotLayer),
        loadData('#tab-trongtrot #cbLoaiCayTrong', 'LoaiCayTrong', trongTrotLayer),
        loadData('#tab-trongtrot #cbPhuongThucTrong', 'PhuongThucTrong', trongTrotLayer);
    });

});