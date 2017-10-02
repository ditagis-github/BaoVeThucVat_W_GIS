define([
    "esri/tasks/QueryTask",
    "esri/tasks/support/Query",
], function (QueryTask, Query) {
    'use strict';
    return class {
        static getCreatedInfo(view) {
            return {
                NguoiCapNhat: view.systemVariable.user.userName,
                NgayCapNhat: new Date().getTime(),
            }
        }
        static getUpdatedInfo(view) {
            return {
                NguoiCapNhat: view.systemVariable.user.userName,
                NgayCapNhat: new Date().getTime(),
            }
        }
        static getNhomCayTrong(view,geometry){
            let layer = view.map.findLayerById(constName.TRONGTROT);
            var query = layer.createQuery();
            query.geometry = geometry;
            query.outFields = ["LoaiCayTrong","NhomCayTrong"];
            return new Promise((resolve, reject) => {
                layer.queryFeatures(query).then(result =>{
                    console.log(result.features[0].attributes);
                    resolve(result.features[0].attributes);
                });
                
            })
        }
        static getLocationInfo(view,geometry) {
            return new Promise((resolve, reject) => {

                try {
                    if (!this.queryLocation)
                        this.queryLocation = new QueryTask({
                            url: view.map.findLayerById(constName.BASEMAP).findSublayerById(constName.INDEX_HANHCHINHXA).url
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