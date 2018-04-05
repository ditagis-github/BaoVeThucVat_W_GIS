var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "esri/tasks/QueryTask", "../classes/ConstName"], function (require, exports, QueryTask, constName) {
    "use strict";
    class Editing {
        static getQueryLocation(view) {
            if (!this._queryLocation) {
                this._queryLocation = new QueryTask({
                    url: view.map.findLayerById(constName.BASEMAP).findSublayerById(constName.INDEX_HANHCHINHXA).url
                });
            }
            return this._queryLocation;
        }
        static getLocationName(view, params = { PhuongXa: null, HuyenTP: null }) {
            return new Promise((resolve, reject) => {
                try {
                    let queryLocation = this.getQueryLocation(view);
                    let where = [];
                    if (params.PhuongXa)
                        where.push(`MaPhuongXa = '${params.PhuongXa}'`);
                    if (params.HuyenTP)
                        where.push(`MaHuyenTP = '${params.HuyenTP}'`);
                    queryLocation.execute({
                        outFields: ['TenXa', 'TenHuyen'],
                        where: where.join(' and ')
                    }).then(res => {
                        if (res && res.features.length > 0) {
                            let ft = res.features[0];
                            if (ft && ft.attributes) {
                                resolve(ft.attributes);
                            }
                        }
                        else {
                            resolve(null);
                        }
                    });
                }
                catch (error) {
                    console.log(error);
                    reject(error);
                }
            });
        }
        static getCreatedInfo(view) {
            return {
                NguoiCapNhat: view.systemVariable.user.userName,
                NgayCapNhat: new Date().getTime(),
            };
        }
        static getUpdatedInfo(view) {
            return {
                NguoiCapNhat: view.systemVariable.user.userName,
                NgayCapNhat: new Date().getTime(),
            };
        }
        static getNhomCayTrong(view, geometry) {
            return __awaiter(this, void 0, void 0, function* () {
                let screenCoors = view.toScreen(geometry);
                let hitTestResults = yield view.hitTest(screenCoors);
                if (hitTestResults.results.length > 0) {
                    let trongTrotGraphic = hitTestResults.results.find(f => f.graphic.layer.id === constName.TRONGTROT);
                    if (trongTrotGraphic && trongTrotGraphic.graphic && trongTrotGraphic.graphic.attributes) {
                        return {
                            NhomCayTrong: trongTrotGraphic.graphic.attributes.NhomCayTrong,
                            LoaiCayTrong: trongTrotGraphic.graphic.attributes.LoaiCayTrong
                        };
                    }
                    else {
                        return null;
                    }
                }
                else {
                    return null;
                }
            });
        }
        static getLocationInfo(view, geometry) {
            return new Promise((resolve, reject) => {
                try {
                    let queryLocation = this.getQueryLocation(view);
                    queryLocation.execute({
                        outFields: ['MaPhuongXa', 'MaHuyenTP'],
                        geometry: geometry
                    }).then(res => {
                        if (res && res.features.length > 0) {
                            let ft = res.features[0];
                            if (ft && ft.attributes) {
                                resolve(ft.attributes);
                            }
                        }
                        else {
                            resolve(null);
                        }
                    });
                }
                catch (error) {
                    console.log(error);
                    reject(error);
                }
            });
        }
    }
    return Editing;
});
//# sourceMappingURL=Editing.js.map