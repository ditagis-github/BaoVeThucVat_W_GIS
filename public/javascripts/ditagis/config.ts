const config = {
    basemap: {
        title: 'Dữ liệu nền',
        id: 'dulieunen',
        url: 'https://ditagis.com:6443/arcgis/rest/services/BinhDuong/DuLieuNen/MapServer',
        visible: true,
        copyright: 'Bản đồ biên tập bởi Trung tâm DITAGIS',
    },
    layers: [{
        title: 'Trồng trọt',
        id: "TrongTrot",
        url: "https://ditagis.com:6443/arcgis/rest/services/BinhDuong/BaoVeThucVat_ChuyenDe/FeatureServer/2",
        outFields: ['*'],
    }, {
        title: 'Sâu bệnh',
        id: "SauBenh",
        url: "https://ditagis.com:6443/arcgis/rest/services/BinhDuong/BaoVeThucVat_ChuyenDe/FeatureServer/1",
        outFields: ['*']

    }, {
        title: 'Doanh nghiệp',
        id: "DoanhNghiep",
        url: "https://ditagis.com:6443/arcgis/rest/services/BinhDuong/BaoVeThucVat_ChuyenDe/FeatureServer/0",
        outFields: ['*'],
    }],
    tables: [{
        id: 'thoigiansxtt',
        url: "https://ditagis.com:6443/arcgis/rest/services/BinhDuong/BaoVeThucVat_ChuyenDe/FeatureServer/3",
    }, {
        id: 'tblgiaidoansinhtruong',
        url: "https://ditagis.com:6443/arcgis/rest/services/BinhDuong/BaoVeThucVat_ChuyenDe/FeatureServer/4",
    }],
    zoom: 10,
    center: [106.6843694, 11.158752270428375]
}
export = config;