define([
    "esri/tasks/QueryTask",
    "esri/tasks/support/Query",
    "ditagis/support/Editing"
], function (QueryTask, Query, editingSupport) {
    'use strict';
    return class PointEditing {
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
        draw(point) {
            this.draw(this.layer, point);
        }

        async draw(layer, point) {
            try {
                var notify = $.notify({
                    title: '<strong>Cập nhật đối tượng</strong>',
                    message: 'Đang cập nhật...'
                }, {
                        allow_dismiss: false,
                        showProgressbar: true
                    });
                //tạo attributes để giữ giá trị cho graphic attribute khi sử dụng phương thức applyEdits
                let attributes = {};

                /**
                 * ví dụ sử dụng domain thì cần phải gán domain vào attributes thì khi thêm đối tượng
                 * vào cơ sở dữ liệu thì mới hiển thị lên được bản đồ
                 */
                if (layer.drawingAttributes) {
                    for (let i in layer.drawingAttributes) {
                        attributes[i] = layer.drawingAttributes[i];
                    }
                }



                //lấy thông tin cập nhật gồm người tạo và thời gian tạo
                notify.update({ 'type': 'info', 'message': 'Đang lấy định danh...', 'progress': 20 });
                const createdInfo = await editingSupport.getCreatedInfo(this.view);
                for (let i in createdInfo) {
                    attributes[i] = createdInfo[i];
                }
                notify.update({ 'type': 'info', 'message': 'Lấy định danh thành công', 'progress': 30 });
                point.attributes = attributes;
                let edits = {
                    addFeatures: [point]
                };
                layer.applyEdits(edits).then((result) => {
                    if (result.addFeatureResults.length > 0) {
                        for (let item of result.addFeatureResults) {

                            //lấy thông tin xã huyện
                            notify.update({ 'type': 'info', 'message': 'Đang lấy vị trí...!', 'progress': 55 });

                            //POPUP OPEN
                            layer.queryFeatures({
                                returnGeometry: true,
                                spatialReference: this.view.spatialReference,
                                where: 'OBJECTID = ' + item.objectId,
                                outFields: ['*']
                            }).then(res => {
                                //neu tim duoc
                                if (res.features[0]) {
                                    let ft = res.features[0];
                                    this.view.popup.open({
                                        features: [ft],
                                        location: ft.geometry
                                    });
                                }});

                            layer.queryFeatures({
                                returnGeometry: true,
                                spatialReference: this.view.spatialReference,
                                where: 'OBJECTID = ' + item.objectId,
                                outFields: ['OBJECTID']
                            }).then(res => {
                                //neu tim duoc
                                if (res.features[0]) {
                                    let ft = res.features[0];
                                    editingSupport.getLocationInfo(ft.geometry).then(locationInfo => {
                                        notify.update({ 'type': 'info', 'message': 'Lấy vị trí thành công!', 'progress': 80 });
                                        for (let i in locationInfo) {
                                            ft.attributes[i] = locationInfo[i];
                                        }
                                        layer.applyEdits({
                                            updateFeatures: [{
                                                attributes: ft.attributes
                                            }]
                                        }).then((result) => {
                                            if (!result.updateFeatureResults[0].error)
                                                notify.update({ 'type': 'success', 'message': 'Cập nhật vị trí thành công!', 'progress': 100 });
                                            else
                                                notify.update({ 'type': 'danger', 'message': 'Cập nhật vị trí không thành công', 'progress': 100 });
                                        });
                                    })
                                }
                            })

                        }
                        //khi applyEdits, nếu phát hiện lỗi
                        if (!res.updateFeatureResults[0].error)
                            notify.update({ 'type': 'danger', 'message': 'Có lỗi xảy ra trong quá trình thực hiện', 'progress': 100 });
                    }
                })
            } catch (err) {
                console.log(err);
            }
        }

    }

});