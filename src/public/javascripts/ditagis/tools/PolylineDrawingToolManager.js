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

                this.simpleDrawPolyline = new SimpleDrawPolyline(view);
                //segment
                this.arcSegmentDraw = new ArcSegment(view);

                this.polylineEditing = new PolylineEditing(this.view, )
                this.eventListener = new EventListener(this);
                this.registerEvent();

            }
            setGeometryForTool(geometry) {
                geometry = geometry || new Polyline({
                    spatialReference: new SpatialReference(102100)
                });
                this.simpleDrawPolyline.geometry = this.arcSegmentDraw.geometry = geometry;
            }
            set drawLayer(val) {
                this._drawLayer = val;
            }
            get drawLayer() {
                return this._drawLayer;
            }
            drawFinish(geometry, method) {
                //kich hoat su kien
                this.eventListener.fire('draw-finish', {
                    geometry: geometry,
                    method: method
                });
                //applyEdit
                this.addFeature(geometry);
            }
            addFeature(geometry) {
                this.polylineEditing.draw(this.drawLayer, geometry, this.view).then((res) => {
                    this.arcSegmentDraw.clearGraphic();
                    this.simpleDrawPolyline.clearGraphic();
                })
            }
            registerEvent() {
                this.simpleDrawPolyline.on('draw-finish', (geometry) => {
                    this.drawFinish(geometry, 'simple')
                })
                this.arcSegmentDraw.on('draw-finish', (geometry) => {
                    this.drawFinish(geometry, 'arcsegment')
                })


                this.simpleDrawPolyline.on('geometry-change', (geometry) => {
                    // this.setGeometryForTool(geometry);
                    this.arcSegmentDraw.geometry = geometry;
                })
                this.arcSegmentDraw.on('geometry-change', (geometry) => {
                    // this.setGeometryForTool(geometry);
                    this.simpleDrawPolyline.geometry = geometry;
                })
            }
            drawSimple() {
                this.setGeometryForTool();
                this.cancel();
                this.simpleDrawPolyline.draw(this._drawLayer);

            }
            dragArcSegment() {
                this.setGeometryForTool();
                this.cancel();
                this.arcSegmentDraw.draw(this._drawLayer);
            }
            cancel() {
                this.simpleDrawPolyline.cancel();
                this.arcSegmentDraw.cancel();
            }

        }
    });