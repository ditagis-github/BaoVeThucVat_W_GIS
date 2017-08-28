define([

], function () {
    'use strict';
    return {
        baseMaps: [{
            title: 'Dữ liệu nền',
            name: 'dulieunen',
            url: 'https://ditagis.com:6443/arcgis/rest/services/BinhDuong/BaoVeThucVat_DLN/MapServer',
            visible: true
        }],
        layers: [{
            title: 'Trồng trọt',
            name: "trongtrot",
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
            name: "doanhnghiep",
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
            }
            ]
        },
        {
            title: 'Sâu bệnh',
            name: "saubenh",
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
        //     name: "QuyHoachSuDungDat",
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
        zoom: 16, // Sets the zoom level based on level of detail (LOD)
        // center: [106.5872641, 11.0254935] // Sets the center point of view in lon/lat
        center: [106.6843694, 11.0576851]
    }
});