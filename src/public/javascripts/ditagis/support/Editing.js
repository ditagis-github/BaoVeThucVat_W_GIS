define([
    "esri/tasks/QueryTask",
    "esri/tasks/support/Query",
], function (QueryTask, Query) {
    'use strict';
    return class {
        static getCreatedInfo(view) {
            return {
                created_user: view.systemVariable.user.username,
                created_date: new Date().getTime(),
            }
        }
        static getUpdatedInfo(view) {
            return {
                last_edited_user: view.systemVariable.user.username,
                last_edited_date: new Date().getTime(),
            }
        }
        
        static async getLocationInfo(geometry) {
            this.queryXa = new QueryTask({
                url: 'https://ditagis.com:6443/arcgis/rest/services/BinhDuong/DuLieuNen/MapServer/3'
            });
            this.queryHuyen = new QueryTask({
                url: 'https://ditagis.com:6443/arcgis/rest/services/BinhDuong/DuLieuNen/MapServer/4'
            });


            let huyen = await this.queryHuyen.execute({
                outFields:['TenHuyen'],
                geometry:geometry
            }).then(
                async res => {
                    if (res) {
                        let ft =  res.features[0];
                        if(ft && ft.attributes){
                            return await ft.attributes.TenHuyen;
                        }
                    } else {
                        return await null;
                    }
                }
            );
            let xa = await this.queryXa.execute({
                outFields:['TenXa'],
                geometry:geometry
            }).then(
                async res => {
                    if (res) {
                        let ft =  res.features[0];
                        if(ft && ft.attributes){
                            return await ft.attributes.TenXa;
                        }
                    } else {
                        return await null;
                    }
                }
            );

            return {
                HuyenTP: huyen,
                XaPhuong: xa,
            }
        }
    }
});