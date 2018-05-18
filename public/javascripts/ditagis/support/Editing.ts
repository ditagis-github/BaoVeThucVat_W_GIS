import QueryTask = require("esri/tasks/QueryTask");
import Query = require("esri/tasks/support/Query");
import constName = require('../classes/ConstName');
class Editing {

    private static _queryLocation: QueryTask;
    public static getQueryLocation(view: __esri.MapView): QueryTask {
        if (!this._queryLocation) {
            this._queryLocation = new QueryTask({
                url: (view.map.findLayerById(constName.BASEMAP) as __esri.MapImageLayer).findSublayerById(constName.INDEX_HANHCHINHXA).url
            });
        }
        return this._queryLocation;
    }

    static getLocationName(view, params = { PhuongXa: null, HuyenTP: null }) {
        return new Promise((resolve, reject) => {
            try {
                let queryLocation = this.getQueryLocation(view);
                let where = [];
                if (params.PhuongXa) where.push(`MaPhuongXa = '${params.PhuongXa}'`);
                if (params.HuyenTP) where.push(`MaHuyenTP = '${params.HuyenTP}'`);
                queryLocation.execute(<__esri.Query>{
                    outFields: ['TenXa', 'TenHuyen'],
                    where: where.join(' and ')
                }).then(res => {
                    if (res && res.features.length>0) {
                        let ft = res.features[0];
                        if (ft && ft.attributes) {
                            resolve(ft.attributes);
                        }
                    } else {
                        resolve(null);
                    }
                });
            } catch (error) {
                reject(error);
            }

        });
    }
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
    static async getNhomCayTrong(view: __esri.MapView, geometry: __esri.Point) {
        let screenCoors = view.toScreen(geometry);
        let hitTestResults = await view.hitTest(screenCoors);
        if (hitTestResults.results.length > 0) {
            let trongTrotGraphic = hitTestResults.results.find(f => f.graphic.layer.id === constName.TRONGTROT);
            if (trongTrotGraphic && trongTrotGraphic.graphic && trongTrotGraphic.graphic.attributes) {
                return {
                    NhomCayTrong: trongTrotGraphic.graphic.attributes.NhomCayTrong,
                    LoaiCayTrong: trongTrotGraphic.graphic.attributes.LoaiCayTrong
                }
            } else {
                return null;
            }

        } else {
            return null;
        }
    }
    static getLocationInfo(view, geometry) {
        return new Promise((resolve, reject) => {
            try {
                let queryLocation = this.getQueryLocation(view);
                queryLocation.execute(<__esri.Query>{
                    outFields: ['MaPhuongXa', 'MaHuyenTP'],
                    geometry: geometry
                }).then(res => {
                    if (res && res.features.length>0) {
                        let ft = res.features[0];
                        if (ft && ft.attributes) {
                            resolve(ft.attributes);
                        }
                    } else {
                        resolve(null);
                    }
                });
            } catch (error) {
                reject(error);
            }

        });
    }
}
export = Editing