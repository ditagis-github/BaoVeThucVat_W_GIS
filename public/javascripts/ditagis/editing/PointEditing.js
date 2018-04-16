var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "../support/Editing", "../classes/ConstName"], function (require, exports, editingSupport, constName) {
    "use strict";
    class PointEditing {
        constructor(view) {
            if (view) {
                this.view = view;
            }
        }
        get layer() {
            return this._layer;
        }
        set layer(value) {
            this._layer = value;
        }
        draw(layer, graphic) {
            return __awaiter(this, void 0, void 0, function* () {
                var notify = $.notify({
                    title: '<strong>Cập nhật đối tượng</strong>',
                    message: 'Đang cập nhật...'
                }, {
                    showProgressbar: true,
                    delay: 20000
                });
                let attributes = {};
                if (layer.drawingAttributes) {
                    for (let i in layer.drawingAttributes) {
                        attributes[i] = layer.drawingAttributes[i];
                    }
                }
                if (layer.id === constName.SAUBENH) {
                    attributes['NgayXayRa'] = new Date().getTime();
                }
                notify.update('type', 'info');
                notify.update('message', 'Đang lấy thông tin người cập nhật...');
                notify.update('progress', 10);
                const createdInfo = yield editingSupport.getCreatedInfo(this.view);
                for (let i in createdInfo) {
                    attributes[i] = createdInfo[i];
                }
                notify.update('type', 'info');
                notify.update('message', 'Lấy thông tin người cập nhật thành công');
                notify.update('progress', 20);
                notify.update('type', 'info');
                notify.update('message', 'Đang lấy vị trí...!');
                notify.update('progress', 30);
                let locationInfo = yield editingSupport.getLocationInfo(this.view, graphic.geometry);
                if (!locationInfo) {
                    notify.update('type', 'danger');
                    notify.update('message', 'Không xác định được vị trí');
                    notify.update('progress', 90);
                    return;
                }
                else {
                    notify.update('type', 'info');
                    notify.update('message', 'Lấy vị trí thành công!');
                    notify.update('progress', 80);
                    for (let i in locationInfo) {
                        attributes[i] = locationInfo[i];
                    }
                    graphic.attributes = attributes;
                    let edits = {
                        addFeatures: [graphic]
                    };
                    layer.applyEdits(edits).then((result) => __awaiter(this, void 0, void 0, function* () {
                        if (result.addFeatureResults.length > 0) {
                            for (let item of result.addFeatureResults) {
                                let attributes = { objectId: item.objectId };
                                if (layer.id === constName.SAUBENH) {
                                    notify.update('type', 'info');
                                    notify.update('message', 'Đang lấy thông tin cây trồng!');
                                    notify.update('progress', 60);
                                    let nhomCayTrong = yield editingSupport.getNhomCayTrong(this.view, graphic.geometry);
                                    if (nhomCayTrong) {
                                        notify.update('type', 'info');
                                        notify.update('message', 'Lấy thông tin cây trồng thành công');
                                        notify.update('progress', 80);
                                        for (let i in nhomCayTrong) {
                                            attributes[i] = nhomCayTrong[i];
                                        }
                                    }
                                    else {
                                        notify.update('type', 'danger');
                                        notify.update('message', 'Lấy thông tin cây trồng thất bại');
                                        notify.update('progress', 80);
                                    }
                                }
                                layer.applyEdits({
                                    updateFeatures: [{
                                            attributes: attributes
                                        }]
                                }).then((result) => {
                                    if (!result.updateFeatureResults[0].error) {
                                        Promise.resolve();
                                        notify.update('type', 'success');
                                        notify.update('message', 'Cập nhật vị trí thành công!');
                                        notify.update('progress', 100);
                                        layer.queryFeatures({
                                            returnGeometry: true,
                                            spatialReference: this.view.spatialReference,
                                            where: 'OBJECTID = ' + item.objectId,
                                            outFields: ['*']
                                        }).then(res => {
                                            if (res.features[0]) {
                                                let ft = res.features[0];
                                                this.view.popup.open({
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
                            }
                        }
                    }));
                }
            });
        }
    }
    return PointEditing;
});
