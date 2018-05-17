var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
define(["require", "exports", "esri/tasks/QueryTask", "../classes/ConstName"], function (require, exports, QueryTask, constName) {
    "use strict";
    var Editing = (function () {
        function Editing() {
        }
        Editing.getQueryLocation = function (view) {
            if (!this._queryLocation) {
                this._queryLocation = new QueryTask({
                    url: view.map.findLayerById(constName.BASEMAP).findSublayerById(constName.INDEX_HANHCHINHXA).url
                });
            }
            return this._queryLocation;
        };
        Editing.getLocationName = function (view, params) {
            var _this = this;
            if (params === void 0) { params = { PhuongXa: null, HuyenTP: null }; }
            return new Promise(function (resolve, reject) {
                try {
                    var queryLocation = _this.getQueryLocation(view);
                    var where = [];
                    if (params.PhuongXa)
                        where.push("MaPhuongXa = '" + params.PhuongXa + "'");
                    if (params.HuyenTP)
                        where.push("MaHuyenTP = '" + params.HuyenTP + "'");
                    queryLocation.execute({
                        outFields: ['TenXa', 'TenHuyen'],
                        where: where.join(' and ')
                    }).then(function (res) {
                        if (res && res.features.length > 0) {
                            var ft = res.features[0];
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
        };
        Editing.getCreatedInfo = function (view) {
            return {
                NguoiCapNhat: view.systemVariable.user.userName,
                NgayCapNhat: new Date().getTime()
            };
        };
        Editing.getUpdatedInfo = function (view) {
            return {
                NguoiCapNhat: view.systemVariable.user.userName,
                NgayCapNhat: new Date().getTime()
            };
        };
        Editing.getNhomCayTrong = function (view, geometry) {
            return __awaiter(this, void 0, void 0, function () {
                var screenCoors, hitTestResults, trongTrotGraphic;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            screenCoors = view.toScreen(geometry);
                            return [4, view.hitTest(screenCoors)];
                        case 1:
                            hitTestResults = _a.sent();
                            if (hitTestResults.results.length > 0) {
                                trongTrotGraphic = hitTestResults.results.find(function (f) { return f.graphic.layer.id === constName.TRONGTROT; });
                                if (trongTrotGraphic && trongTrotGraphic.graphic && trongTrotGraphic.graphic.attributes) {
                                    return [2, {
                                            NhomCayTrong: trongTrotGraphic.graphic.attributes.NhomCayTrong,
                                            LoaiCayTrong: trongTrotGraphic.graphic.attributes.LoaiCayTrong
                                        }];
                                }
                                else {
                                    return [2, null];
                                }
                            }
                            else {
                                return [2, null];
                            }
                            return [2];
                    }
                });
            });
        };
        Editing.getLocationInfo = function (view, geometry) {
            var _this = this;
            return new Promise(function (resolve, reject) {
                try {
                    var queryLocation = _this.getQueryLocation(view);
                    queryLocation.execute({
                        outFields: ['MaPhuongXa', 'MaHuyenTP'],
                        geometry: geometry
                    }).then(function (res) {
                        if (res && res.features.length > 0) {
                            var ft = res.features[0];
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
        };
        return Editing;
    }());
    return Editing;
});
