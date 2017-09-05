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
            const createdInfo = await editingSupport.getCreatedInfo(this.view);
            for (let i in createdInfo) {
                attributes[i] = createdInfo[i];
            }

            point.attributes = attributes;
            let edits = {
                addFeatures: [point]
            };
            layer.applyEdits(edits).then((result) => {
                if (result.addFeatureResults.length > 0) {
                    for (let item of result.addFeatureResults) {
                        layer.queryExtent({
                            where: 'OBJECTID = ' + item.objectId
                        }).then(function (results) {
                            this.view.goTo({
                                target: results.extent,
                                zoom: 18
                            });
                        });
                        //lấy thông tin xã huyện
                        // var queryParams = layer.createQuery();
                        // queryParams.returnGeometry=true;
                        // queryParams.where=
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
                                    for (let i in locationInfo) {
                                        ft.attributes[i] = locationInfo[i];
                                    }
                                    layer.applyEdits({
                                        updateFeatures: [{
                                            attributes: ft.attributes
                                        }]
                                    }).then((result) => {
                                        console.log(result);
                                    });
                                })
                            }
                        })

                    }
                    //khi applyEdits, nếu phát hiện lỗi
                    let valid = false;
                    for (let item of res.addFeatureResults) {
                        if (item.error) {
                            valid = true;
                            break;
                        }
                    }
                    //không phát hiện lỗi nên tắt popup
                    if (valid) {
                        $.notify('Có lỗi xảy ra trong quá trình thực hiện');
                    }
                }
            })
        }

    }

});