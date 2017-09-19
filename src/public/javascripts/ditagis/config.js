define([

], function () {
    'use strict';
    return {
        basemap: {
            title: 'Dữ liệu nền',
            id: 'dulieunen',
            url: 'https://ditagis.com:6443/arcgis/rest/services/BinhDuong/DuLieuNen/MapServer',
            visible: false,
            copyright:'Bản đồ biên tập bởi Trung tâm DITAGIS',
            sublayers: [
                {
                    id: 4,
                    title: 'Hành chính huyện'
                },
                {
                    id: 3,
                    title: 'Hành chính xã'
                }, {
                    id: 2,
                    title: 'Mặt giao thông'
                }, {
                    id: 1,
                    title: 'Sông hồ'
                }, {
                    id: 0,
                    title: 'Tim đường'
                }
            ]
        },
        layers: [{
            title: 'Trồng trọt',
            id: "TrongTrot",
            url: "https://ditagis.com:6443/arcgis/rest/services/BinhDuong/BaoVeThucVat_ChuyenDe/FeatureServer/2",
            outFields: ['*'],
        }, {
            title: 'Doanh nghiệp',
            id: "DoanhNghiep",
            url: "https://ditagis.com:6443/arcgis/rest/services/BinhDuong/BaoVeThucVat_ChuyenDe/FeatureServer/0",
            outFields: ['*'],
        },
        {
            title: 'Sâu bệnh',
            id: "SauBenh",
            url: "https://ditagis.com:6443/arcgis/rest/services/BinhDuong/BaoVeThucVat_ChuyenDe/FeatureServer/1",
            outFields: ['*'],
        },
            // {
            //     title: 'Quy hoạch sử dụng đất',
            //     id: "QuyHoachSuDungDat",
            //     url: "https://ditagis.com:6443/arcgis/rest/services/BinhDuong/BaoVeThucVat_ChuyenDe/FeatureServer/3",
            //     outFields: ['*'],
            //     permissions: [{
            //         role: 1,//sở thông tin truyền thông
            //         edit: true,
            //         create: true,
            //         delete: true
            //     }, {
            //         role: 2,//doanh nghiệp
            //         edit: true,
            //         create: true,
            //         delete: true
            //     }]
            // }
        ],
        zoom: 10,
        center: [106.6843694, 11.158752270428375]
    }
});