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
            id: "trongtrot",
            url: "https://ditagis.com:6443/arcgis/rest/services/BinhDuong/BaoVeThucVat/FeatureServer/2",
            outFields: ['*'],
            permissions: [{
                role: 1,//sở thông tin truyền thông
                edit: true,
                create: false,
                delete: true
            }, {
                role: 2,//doanh nghiệp
                edit: true,
                create: false,
                delete: true
            }
            ]
        }, {
            title: 'Doanh nghiệp',
            id: "doanhnghiep",
            url: "https://ditagis.com:6443/arcgis/rest/services/BinhDuong/BaoVeThucVat/FeatureServer/0",
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
            }, {
                role: 725,//doanh nghiệp
                edit: true,
                create: true,
                delete: true
            }
            ]
        },
        {
            title: 'Sâu bệnh',
            id: "saubenh",
            url: "https://ditagis.com:6443/arcgis/rest/services/BinhDuong/BaoVeThucVat/FeatureServer/1",
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
            // {
            //     title: 'Quy hoạch sử dụng đất',
            //     id: "QuyHoachSuDungDat",
            //     url: "https://ditagis.com:6443/arcgis/rest/services/BinhDuong/BaoVeThucVat/FeatureServer/3",
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
        zoom: 11, // Sets the zoom level based on level of detail (LOD)
        // center: [106.5872641, 11.0254935] // Sets the center point of view in lon/lat
        center: [106.6843694, 11.0576851]
    }
});