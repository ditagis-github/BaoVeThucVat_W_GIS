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

            //lấy thông tin xã huyện
            const locationInfo = await editingSupport.getLocationInfo(point.geometry);
            for(let i in locationInfo) {
                attributes[i] = locationInfo[i];
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
                    console.log(`Thêm thành công đối tượng ${drawLayer.title}`);
                } else {
                    console.log(`Thêm không thành công đối tượng ${drawLayer.title}`);
                }
            })

        }

    }

});