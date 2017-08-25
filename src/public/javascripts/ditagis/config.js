define([

], function () {
    'use strict';
    return {
        baseMaps: [{
            title: 'Dữ liệu nền',
            name: 'dulieunen',
            url: 'https://ditagis.com:6443/arcgis/rest/services/BinhDuong/DuLieuNen/MapServer',
            visible: true
        }],
        layers: [{
            title: 'Doanh nghiệp',
            name: "DoanhNghiep",
            url: "https://ditagis.com:6443/arcgis/rest/services/BinhDuong/HeThongVienThong_ChuyenDe/FeatureServer/0",
            outFields: ['*'],
            permissions: [{
                role: 1,//sở thông tin truyền thông
                edit: true,
                create: true,
                delete: true
            }, {
                role: 2,//doanh nghiệp
                edit: false,
                create: false,
                delete: false
            }
            ]
        },
        {
            title: 'Hệ thống phát thanh truyền hình',
            name: "HeThongPhatThanhTruyenHinh",
            url: "https://ditagis.com:6443/arcgis/rest/services/BinhDuong/HeThongVienThong_ChuyenDe/FeatureServer/1",
            outFields: ['*'],
            popupConstraint: {
                getItem: function (field) {
                    return this.items.find((it) => {
                        return it.field === field
                    })
                },
                items: [{
                    field: 'LoaiQuyMo',
                    value: 1,
                    hideSubFields: ['DienTichThuaDatSuDung', 'HinhThucSuDungDat', 'DienTichDatXayDung', 'ChieuCaoCongTrinh',
                        'CotAngTen', 'HanhLangBaoVe'
                    ]
                }
                ]
            },
            permissions: [{
                role: 1,//sở thông tin truyền thông
                edit: true,
                create: true,
                delete: true
            }, {
                role: 2,//doanh nghiệp
                edit: true,
                create: true,
                delete: true
            }
            ]
        },
        {
            title: 'Hệ thống truyền dẫn viễn thông',
            name: "HeThongTruyenDanVienThong",
            url: "https://ditagis.com:6443/arcgis/rest/services/BinhDuong/HeThongVienThong_ChuyenDe/FeatureServer/2",
            outFields: ['*'],
            permissions: [{
                role: 1,//sở thông tin truyền thông
                edit: true,
                create: true,
                delete: true
            }, {
                role: 2,//doanh nghiệp
                edit: true,
                create: true,
                delete: true
            }
            ]
        },
        {
            title: 'Dịch vụ viễn thông công cộng',
            name: "DiemCungCapDichVuVienThong",
            url: "https://ditagis.com:6443/arcgis/rest/services/BinhDuong/HeThongVienThong_ChuyenDe/FeatureServer/3",
            outFields: ['*'],
            permissions: [{
                role: 1,//sở thông tin truyền thông
                edit: true,
                create: true,
                delete: true
            }, {
                role: 2,//doanh nghiệp
                edit: true,
                create: true,
                delete: true
            }
            ]
        },
        {
            title: 'Cột ăng ten',
            name: "CotAngTen",
            url: "https://ditagis.com:6443/arcgis/rest/services/BinhDuong/HeThongVienThong_ChuyenDe/FeatureServer/4",
            outFields: ['*'],
            permissions: [{
                role: 1,//sở thông tin truyền thông
                edit: true,
                create: true,
                delete: true
            }, {
                role: 2,//doanh nghiệp
                edit: true,
                create: true,
                delete: true
            }
            ]
        },
        {
            title: 'Cột treo cáp',
            name: "CotTreoCap",
            url: "https://ditagis.com:6443/arcgis/rest/services/BinhDuong/HeThongVienThong_ChuyenDe/FeatureServer/5",
            outFields: ['*'],
            permissions: [{
                role: 1,//sở thông tin truyền thông
                edit: true,
                create: true,
                delete: true
            }, {
                role: 2,//doanh nghiệp
                edit: true,
                create: true,
                delete: true
            }]
        },
        {
            title: 'Tuyến cáp treo',
            name: "TuyenCapTreo",
            url: "https://ditagis.com:6443/arcgis/rest/services/BinhDuong/HeThongVienThong_ChuyenDe/FeatureServer/6",
            outFields: ['*'],
            permissions: [{
                role: 1,//sở thông tin truyền thông
                edit: true,
                create: true,
                delete: true
            }, {
                role: 2,//doanh nghiệp
                edit: true,
                create: true,
                delete: true
            }]
        },
        {
            title: 'Tuyến cáp ngầm',
            name: "TuyenCapNgam",
            url: "https://ditagis.com:6443/arcgis/rest/services/BinhDuong/HeThongVienThong_ChuyenDe/FeatureServer/7",
            outFields: ['*'],
            permissions: [{
                role: 1,//sở thông tin truyền thông
                edit: true,
                create: true,
                delete: true
            }, {
                role: 2,//doanh nghiệp
                edit: true,
                create: true,
                delete: true
            }]
        },
        {
            title: 'Thiết bị truyền dẫn',
            name: "ThietBiTruyenDan",
            url: "https://ditagis.com:6443/arcgis/rest/services/BinhDuong/HeThongVienThong_ChuyenDe/FeatureServer/8",
            outFields: ['*'],
            permissions: [{
                role: 1,//sở thông tin truyền thông
                edit: true,
                create: true,
                delete: true
            }, {
                role: 2,//doanh nghiệp
                edit: true,
                create: true,
                delete: true
            }]
        },
        {
            title: 'Hạ tầng kỹ thuật ngầm',
            name: "HaTangKyThuatNgam",
            url: "https://ditagis.com:6443/arcgis/rest/services/BinhDuong/HeThongVienThong_ChuyenDe/FeatureServer/9",
            permissions: [{
                role: 1,//sở thông tin truyền thông
                edit: true,
                create: true,
                delete: true
            }, {
                role: 2,//doanh nghiệp
                edit: true,
                create: true,
                delete: true
            }]
        }],
        zoom: 16, // Sets the zoom level based on level of detail (LOD)
        // center: [106.5872641, 11.0254935] // Sets the center point of view in lon/lat
        center: [106.6843694, 11.0576851]
    }
});