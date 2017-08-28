/**
 * Lớp này dùng để gọi các chức năng của các lớp khi vẽ Point (Vẽ cung, đường thẳng)
 * Tham số truyền vào (view, systemVariable)
 * systemVariable: Thông tin khách hàng đang hiển thị
 */
define([
    "esri/Graphic", "esri/geometry/Polyline", "esri/symbols/SimpleLineSymbol",
    "esri/geometry/SpatialReference",
    "ditagis/tools/SimpleDrawPolyline",
    "ditagis/tools/ArcSegment",
    "ditagis/classes/EventListener",
    "ditagis/editing/PolylineEditing",
], function (Graphic, Polyline, SimpleLineSymbol, SpatialReference,
    SimpleDrawPolyline, ArcSegment,
    EventListener, PolylineEditing
) {
        'use strict';
        return class {
            constructor(view, layers) {
                this.view = view;
                this.systemVariable = view.systemVariable;
                this._drawLayer = null;
                this.mainGraphic = new Graphic({
                    geometry: new Polyline({
                        spatialReference: new SpatialReference(102100)
                    }),
                    symbol: new SimpleLineSymbol({
                        color: [255, 0, 0],
                        size: 2,
                    })
                });
                this.simpleDrawPolyline = new SimpleDrawPolyline(view);
                //segment
                this.arcSegmentDraw = new ArcSegment(view);
                this.simpleDrawPolyline.mainGraphic = this.arcSegmentDraw.mainGraphic = this.mainGraphic;
                this.polylineEditing = new PolylineEditing(this.view,)
                this.eventListener = new EventListener(this);
                this.registerEvent();

            }
            /**
             * Xoa graphic ra khoi map
             */
            removeGraphic() {
                if (this.isAdd) {
                    this.view.graphics.remove(this.mainGraphic);
                    this.isAdd = false;
                }
            }
            /**
             * Them graphic vao map
             */
            addGraphic() {
                if (!this.isAdd) {
                    this.view.graphics.add(this.mainGraphic);
                    this.isAdd = true;
                }
            }
            set drawLayer(val) {
                this._drawLayer = val;
            }
            get drawLayer() {
                return this._drawLayer;
            }
            drawFinish(graphic, method) {
                //kich hoat su kien
                this.eventListener.fire('draw-finish', {
                    graphic: graphic,
                    method: method
                });
                //applyEdit
                this.addFeature(graphic);
                //xoa graphic 
                this.removeGraphic();
            }
            addFeature(graphic) {
                this.polylineEditing.draw(this.drawLayer, graphic, this.view).then((res) => {
                    this.mainGraphic.geometry.paths=[];
                })
            }
            registerEvent() {
                this.simpleDrawPolyline.on('draw-finish', (graphic) => {
                    this.drawFinish(graphic, 'simple')
                })
                this.arcSegmentDraw.on('draw-finish', (graphic) => {
                    this.drawFinish(graphic, 'arcsegment')
                })
            }
            drawSimple() {
                this.addGraphic();
                this.cancel();
                this.simpleDrawPolyline.draw(this._drawLayer);

            }
            dragArcSegment() {
                this.addGraphic();
                this.cancel();
                this.arcSegmentDraw.draw(this._drawLayer);
            }
            cancel() {
                this.simpleDrawPolyline.cancel();
                this.arcSegmentDraw.cancel();
            }

        }
    });