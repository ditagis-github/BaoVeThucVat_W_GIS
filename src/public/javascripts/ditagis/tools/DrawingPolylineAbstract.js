define([
    "ditagis/classes/EventListener",

    "esri/Graphic", "esri/symbols/SimpleLineSymbol",
    "esri/geometry/Point",
    "esri/geometry/Polyline",
    "esri/geometry/SpatialReference"
], function (
    EventListener,
    Graphic, SimpleLineSymbol,
    Point, Polyline,
    SpatialReference) {
        'use strict';
        return class {
            constructor(view, fixedLayers) {
                this.view = view;
                this.options = {
                    symbolPolyline: new SimpleLineSymbol()
                };
                this.fixedLayers = fixedLayers,
                    this.systemVariable = view.systemVariable;
                this.mainGraphic = null;
                this.eventListener = new EventListener(this);
            }
            resetGraphic() {
                // this.firstPoint = null;
                // this.paths = [];
            }
            set paths(val) {
                this.mainGraphic.geometry.paths = val;
            }
            get paths() {
                return this.mainGraphic.geometry.paths;
            }
            get firstPoint() {
                if (this._firstPoint)
                    return this._firstPoint;
                if (this.paths.length > 0) { //nếu tồn tại phần tử trong polyline thì mới kiểm tra tiếp
                    const pathsLength = this.paths.length;
                    for (let index = pathsLength - 1; index >= 0; index--) {
                        const subs = this.paths[index];
                        //nếu như trong subs có phần tử
                        //ví dụ [[1]] tức mảng subs có 1 phần tử là 1
                        if (subs.length > 0) {
                            let xy = subs[subs.length - 1] //tọa độ của point là điểm cuối cùng
                            this._firstPoint = new Point({
                                x: xy[0],
                                y: xy[1],
                                spatialReference: new SpatialReference(102100)
                            });
                            return this._firstPoint;
                        }
                    }
                }
                return null;
            }
            set firstPoint(point) {
                this._firstPoint = point;
            }
            /**
             * Cập nhật lại circleGraphic trên bản đồ
             */
            refreshMainGraphic(options = {}) {
                let geometry = this.mainGraphic.geometry;
                //
                //nếu như có paths thì cập nhật lại paths cho circleGraphic
                if (options.paths) {
                    // while(circleGraphicGeometry.paths.length>0){
                    //     circleGraphicGeometry.paths.slice(0,1);
                    // }

                    //nếu như sizePaths = 0 thì thêm paths vào luôn, không tính đến trường hợp bên dưới
                    if (this.sizePaths == 0) {
                        geometry.addPath(options.paths);
                    } else {
                        if (options.paths.length > 0) {

                            //nếu như paths chỉ có một phần tử thì sẽ thêm vào path đang có
                            //mà ở đây là chọn path cuối cùng
                            if (options.paths.length == 1) {
                                geometry.paths[this.sizePaths - 1].push(options.paths[0]);
                            } else {
                                geometry.addPath(options.paths);
                            }
                        }
                    }
                }
            }
            get sizePaths() {
                return this.mainGraphic.geometry.paths.length;
            }
            /**
             * Kiểm tra {layer} có thuộc this.fixedLayers hay không
             * @param {FeatureLayer} layer 
             * @return true: {layer} thuộc this.fixedLayers
             */
            withOnFixedLayer(layer) {
                let containLayerIndex = this.fixedLayers.indexOf(layer);
                return containLayerIndex !== -1
            }
            cancel() {
                //lấy những graphic tạm, sự kiện được đăng ký để xóa
                //xóa graphic tạm
                //xóa sự kiện
            }
            /**
             * Xóa những sự kiện đã đăng ký với view
             */
            clearEvents() {

            }
            async checkHittest(screenCoors) {
                var res = await this.view.hitTest(screenCoors);
                if (res.results.length > 0) {
                    for (let result of res.results) {
                        let graphic = result.graphic;
                        const geometry = graphic.geometry;
                        if (geometry.type == 'point') {
                            return geometry;
                        }
                    }
                }
                return this.view.toMap(screenCoors);

            }

            addTmpGraphic(paths) {
                this.clearTmpGraphic();
                this.tmpGraphic = new Graphic({
                    geometry: new Polyline({
                        paths: paths,
                        spatialReference: this.view.spatialReference
                    }),
                    symbol: new SimpleLineSymbol({
                        color: [255, 0, 0],
                        size: 2,
                    })
                });
                this.view.graphics.add(this.tmpGraphic);
            }
            clearTmpGraphic() {
                if (this.tmpGraphic) {
                    this.view.graphics.remove(this.tmpGraphic);
                    this.tmpGraphic = null;
                }
            }
        }
    });