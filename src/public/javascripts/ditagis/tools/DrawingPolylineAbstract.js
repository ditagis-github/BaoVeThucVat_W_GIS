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
            constructor(view, options = {}) {
                this.view = view;
                this.options = {
                    symbol: new SimpleLineSymbol({
                        color: [255, 0, 0],
                        size: 2,
                    })
                }
                for (let i in options) {
                    this.options[i] = options[i];
                }
                this.fixedLayers = options.fixedLayers,
                    this._geometry = null;
                this.eventListener = new EventListener(this);
                this.tmpGraphicIndex = -1;
            }
            clearGraphic() {
                if (this.graphic) {
                    this.view.graphics.remove(this.graphic);
                    this.graphic = null;
                    this.firstPoint = null;
                    this.geometry = null;
                }
            }
            get geometry() {
                return this._geometry;
            }
            set geometry(geometry) {
                this._geometry = geometry;
                this.eventListener.fire('geometry-change', this.geometry)
            }
            get paths() {
                if (this.geometry)
                    return this.geometry.paths;
                return 0;
            }
            get firstPoint() {
                if (this._firstPoint)
                    return this._firstPoint;
                if (this.paths.length > 0) { //nếu tồn tại phần tử trong polyline thì mới kiểm tra tiếp
                    const subs = this.paths[this.paths.length - 1];
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
                return null;
            }
            set firstPoint(point) {
                this._firstPoint = point;
            }
            /**
             * Cập nhật lại circleGraphic trên bản đồ
             */
            refreshMainGraphic(paths) {
                try {
                    //xóa graphic cũ nếu có
                    if (this.graphic) {
                        this.view.graphics.remove(this.graphic);
                    }
                    //nếu chưa có geometry thì khởi tạo
                    if (!this.geometry) {
                        this.geometry = new Polyline({
                            spatialReference: new SpatialReference(102100),
                        });
                    }
                    if (paths) {
                        const geometry = this.geometry.addPath(paths);
                        this.geometry = geometry;
                        //tạo mới graphic
                        this.graphic = new Graphic({
                            geometry: this.geometry,
                            symbol: this.options.symbol
                        })
                        //thêm vào map
                        this.view.graphics.add(this.graphic);
                    }
                } catch (error) {
                    console.log(error);
                }

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
            checkHittest(screenCoors) {
                return new Promise((resolve, reject) => {
                    this.view.hitTest(screenCoors).then((res) => {
                        if (res.results.length > 0) {
                            for (let result of res.results) {
                                let graphic = result.graphic;
                                const geometry = graphic.geometry;
                                if (geometry.type == 'point') {
                                    resolve(geometry);
                                }
                            }
                        }
                        resolve(this.view.toMap(screenCoors));
                    })
                });
            }

            addTmpGraphic(paths) {
                this.clearTmpGraphic();
                this.refreshMainGraphic(paths);
                this.tmpGraphicIndex = this.geometry.paths.length - 1;
            }
            clearTmpGraphic() {
                if (this.geometry) {
                    this.geometry.removePath(this.tmpGraphicIndex);
                }
            }
        }
    });