define(["require", "exports"], function (require, exports) {
    "use strict";
    const config = {
        basemap: {
            title: 'Dữ liệu nền',
            id: 'dulieunen',
            url: 'https://ditagis.com/arcgis/rest/services/BinhDuong/DuLieuNen/MapServer',
            visible: true,
            copyright: 'Bản đồ biên tập bởi Trung tâm DITAGIS',
            sublayers: [{
                    id: 5,
                    title: 'Hành chính huyện'
                },
                {
                    id: 4,
                    title: 'Hành chính xã'
                },
                {
                    id: 3,
                    title: 'Sông hồ'
                },
                {
                    id: 2,
                    title: 'Phủ bề mặt',
                    visible: false
                }, {
                    id: 1,
                    title: 'Mặt giao thông',
                }, {
                    id: 0,
                    title: 'Tim đường'
                }
            ]
        },
        layers: [{
                title: 'Kiểm dịch thực vật',
                id: "KiemDichThucVat",
                url: "https://ditagis.com/arcgis/rest/services/BinhDuong/BVTV_ChuyenDe/FeatureServer/3",
                outFields: ['*'],
            }, {
                title: 'Trồng trọt',
                id: "TrongTrot",
                url: "https://ditagis.com/arcgis/rest/services/BinhDuong/BVTV_ChuyenDe/FeatureServer/2",
                outFields: ['*'],
            }, {
                title: 'Sâu bệnh',
                id: "SauBenh",
                url: "https://ditagis.com/arcgis/rest/services/BinhDuong/BVTV_ChuyenDe/FeatureServer/1",
                outFields: ['*']
            }, {
                title: 'Doanh nghiệp',
                id: "DoanhNghiep",
                url: "https://ditagis.com/arcgis/rest/services/BinhDuong/BVTV_ChuyenDe/FeatureServer/0",
                outFields: ['*'],
            }],
        tables: [{
                id: 'thoigiansxtt',
                url: "https://ditagis.com/arcgis/rest/services/BinhDuong/BVTV_ChuyenDe/FeatureServer/4",
            }, {
                id: 'tblgiaidoansinhtruong',
                url: "https://ditagis.com/arcgis/rest/services/BinhDuong/BVTV_ChuyenDe/FeatureServer/5",
            }],
        zoom: 10,
        center: [106.6843694, 11.158752270428375]
    };
    return config;
});
