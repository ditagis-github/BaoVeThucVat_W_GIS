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
define(["require", "exports", "../support/Editing", "../classes/ConstName"], function (require, exports, editingSupport, constName) {
    "use strict";
    var PointEditing = (function () {
        function PointEditing(view) {
            if (view) {
                this.view = view;
            }
        }
        Object.defineProperty(PointEditing.prototype, "layer", {
            get: function () {
                return this._layer;
            },
            set: function (value) {
                this._layer = value;
            },
            enumerable: true,
            configurable: true
        });
        PointEditing.prototype.draw = function (layer, graphic) {
            return __awaiter(this, void 0, void 0, function () {
                var _this = this;
                var notify, attributes, i, createdInfo, i, locationInfo, i, edits;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            notify = $.notify({
                                title: '<strong>Cập nhật đối tượng</strong>',
                                message: 'Đang cập nhật...'
                            }, {
                                showProgressbar: true,
                                delay: 20000
                            });
                            attributes = {};
                            if (layer.drawingAttributes) {
                                for (i in layer.drawingAttributes) {
                                    attributes[i] = layer.drawingAttributes[i];
                                }
                            }
                            if (layer.id === constName.SAUBENH) {
                                attributes['NgayXayRa'] = new Date().getTime();
                            }
                            notify.update('type', 'info');
                            notify.update('message', 'Đang lấy thông tin người cập nhật...');
                            notify.update('progress', 10);
                            return [4, editingSupport.getCreatedInfo(this.view)];
                        case 1:
                            createdInfo = _a.sent();
                            for (i in createdInfo) {
                                attributes[i] = createdInfo[i];
                            }
                            notify.update('type', 'info');
                            notify.update('message', 'Lấy thông tin người cập nhật thành công');
                            notify.update('progress', 20);
                            notify.update('type', 'info');
                            notify.update('message', 'Đang lấy vị trí...!');
                            notify.update('progress', 30);
                            return [4, editingSupport.getLocationInfo(this.view, graphic.geometry)];
                        case 2:
                            locationInfo = _a.sent();
                            if (!locationInfo) {
                                notify.update('type', 'danger');
                                notify.update('message', 'Không xác định được vị trí');
                                notify.update('progress', 90);
                                return [2];
                            }
                            else {
                                notify.update('type', 'info');
                                notify.update('message', 'Lấy vị trí thành công!');
                                notify.update('progress', 80);
                                for (i in locationInfo) {
                                    attributes[i] = locationInfo[i];
                                }
                                graphic.attributes = attributes;
                                edits = {
                                    addFeatures: [graphic]
                                };
                                layer.applyEdits(edits).then(function (result) { return __awaiter(_this, void 0, void 0, function () {
                                    var _this = this;
                                    var _loop_1, this_1, _i, _a, item;
                                    return __generator(this, function (_b) {
                                        switch (_b.label) {
                                            case 0:
                                                if (!(result.addFeatureResults.length > 0)) return [3, 4];
                                                _loop_1 = function (item) {
                                                    var attributes_1, nhomCayTrong, i;
                                                    return __generator(this, function (_a) {
                                                        switch (_a.label) {
                                                            case 0:
                                                                attributes_1 = { objectId: item.objectId };
                                                                if (!(layer.id === constName.SAUBENH)) return [3, 2];
                                                                notify.update('type', 'info');
                                                                notify.update('message', 'Đang lấy thông tin cây trồng!');
                                                                notify.update('progress', 60);
                                                                return [4, editingSupport.getNhomCayTrong(this_1.view, graphic.geometry)];
                                                            case 1:
                                                                nhomCayTrong = _a.sent();
                                                                if (nhomCayTrong) {
                                                                    notify.update('type', 'info');
                                                                    notify.update('message', 'Lấy thông tin cây trồng thành công');
                                                                    notify.update('progress', 80);
                                                                    for (i in nhomCayTrong) {
                                                                        attributes_1[i] = nhomCayTrong[i];
                                                                    }
                                                                }
                                                                else {
                                                                    notify.update('type', 'danger');
                                                                    notify.update('message', 'Lấy thông tin cây trồng thất bại');
                                                                    notify.update('progress', 80);
                                                                }
                                                                _a.label = 2;
                                                            case 2:
                                                                layer.applyEdits({
                                                                    updateFeatures: [{
                                                                            attributes: attributes_1
                                                                        }]
                                                                }).then(function (result) {
                                                                    if (!result.updateFeatureResults[0].error) {
                                                                        Promise.resolve();
                                                                        notify.update('type', 'success');
                                                                        notify.update('message', 'Cập nhật vị trí thành công!');
                                                                        notify.update('progress', 100);
                                                                        layer.queryFeatures({
                                                                            returnGeometry: true,
                                                                            spatialReference: _this.view.spatialReference,
                                                                            where: 'OBJECTID = ' + item.objectId,
                                                                            outFields: ['*']
                                                                        }).then(function (res) {
                                                                            if (res.features[0]) {
                                                                                var ft = res.features[0];
                                                                                _this.view.popup.open({
                                                                                    features: [ft],
                                                                                    updateLocationEnabled: true
                                                                                });
                                                                            }
                                                                        });
                                                                    }
                                                                    else {
                                                                        notify.update('type', 'danger');
                                                                        Promise.reject("err");
                                                                    }
                                                                });
                                                                return [2];
                                                        }
                                                    });
                                                };
                                                this_1 = this;
                                                _i = 0, _a = result.addFeatureResults;
                                                _b.label = 1;
                                            case 1:
                                                if (!(_i < _a.length)) return [3, 4];
                                                item = _a[_i];
                                                return [5, _loop_1(item)];
                                            case 2:
                                                _b.sent();
                                                _b.label = 3;
                                            case 3:
                                                _i++;
                                                return [3, 1];
                                            case 4: return [2];
                                        }
                                    });
                                }); });
                            }
                            return [2];
                    }
                });
            });
        };
        return PointEditing;
    }());
    return PointEditing;
});
