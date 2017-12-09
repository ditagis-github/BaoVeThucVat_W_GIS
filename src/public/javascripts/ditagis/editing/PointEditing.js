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
        draw(graphic, layer) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
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
                    notify.update('message', 'Đang lấy định danh...');
                    notify.update('progress', 20);
                    const createdInfo = yield editingSupport.getCreatedInfo(this.view);
                    for (let i in createdInfo) {
                        attributes[i] = createdInfo[i];
                    }
                    notify.update('type', 'info');
                    notify.update('message', 'Lấy định danh thành công');
                    notify.update('progress', 30);
                    graphic.attributes = attributes;
                    let edits = {
                        addFeatures: [graphic]
                    };
                    layer.applyEdits(edits).then((result) => {
                        if (result.addFeatureResults.length > 0) {
                            for (let item of result.addFeatureResults) {
                                notify.update('type', 'info');
                                notify.update('message', 'Đang lấy vị trí...!');
                                notify.update('progress', 55);
                                var proms = [];
                                proms.push(editingSupport.getNhomCayTrong(this.view, graphic.geometry));
                                proms.push(editingSupport.getLocationInfo(this.view, graphic.geometry));
                                Promise.all(proms).then((value) => {
                                    notify.update('type', 'info');
                                    notify.update('message', 'Lấy vị trí thành công!');
                                    notify.update('progress', 80);
                                    let attributes = { objectId: item.objectId };
                                    for (let i in value[0]) {
                                        attributes[i] = value[0][i];
                                    }
                                    for (let i in value[1]) {
                                        attributes[i] = value[1][i];
                                    }
                                    layer.applyEdits({
                                        updateFeatures: [{
                                                attributes: attributes
                                            }]
                                    }).then((result) => {
                                        if (!result.updateFeatureResults[0].error) {
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
                                                        location: ft.geometry
                                                    });
                                                }
                                            });
                                        }
                                        else
                                            notify.update('type', 'danger');
                                        notify.update('message', 'Cập nhật vị trí không thành công');
                                        notify.update('progress', 100);
                                    });
                                });
                            }
                        }
                    });
                }
                catch (err) {
                    console.log(err);
                }
            });
        }
    }
    return PointEditing;
});
//# sourceMappingURL=PointEditing.js.map