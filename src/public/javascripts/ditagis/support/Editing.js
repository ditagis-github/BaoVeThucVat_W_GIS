define([
    "esri/tasks/QueryTask",
    "esri/tasks/support/Query",
], function (QueryTask, Query) {
    'use strict';
    return class {
        static getCreatedInfo(view) {
            return {
                NguoiCapNhat: view.systemVariable.user.username,
                NgayCapNhat: new Date().getTime(),
            }
        }
        static getUpdatedInfo(view) {
            return {
                NguoiCapNhat: view.systemVariable.user.username,
                NgayCapNhat: new Date().getTime(),
            }
        }

        static getLocationInfo(geometry) {
            return new Promise((resolve, reject) => {

                try {
                    if (!this.queryLocation)
                        this.queryLocation = new QueryTask({
                            url: 'https://ditagis.com:6443/arcgis/rest/services/BinhDuong/BaoVeThucVat_DLN/MapServer/4'
                        });
                    this.queryLocation.execute({
                        outFields: ['MaPhuongXa', 'MaHuyenTP'],
                        geometry: geometry
                    }).then(res => {
                        if (res) {
                            let ft = res.features[0];
                            if (ft && ft.attributes) {
                                resolve(ft.attributes);
                            }
                        } else {
                            resolve(null);
                        }
                    });
                } catch (error) {
                    console.log(error)
                    reject(error);
                }

            });
        }
    }
});