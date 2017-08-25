define([
    "dojo/on",
    "esri/Graphic",
    "esri/geometry/Circle",
    "esri/geometry/Polyline",
    "esri/geometry/Point",

    "esri/symbols/SimpleLineSymbol",
    "esri/symbols/SimpleMarkerSymbol",
    "esri/symbols/SimpleFillSymbol",

    "esri/geometry/geometryEngine",
    "esri/geometry/support/webMercatorUtils",
    "ditagis/classes/EventListener",
    "ditagis/toolview/Tooltip",
], function (on,
    Graphic, Circle, Polyline, Point,
    SimpleLineSymbol, SimpleMarkerSymbol, SimpleFillSymbol,
    geometryEngine, webMercatorUtils,
    EventListener,
    Tooltip
) {
        'use strict';
        return class {
            constructor(view) {
                this.view = view;
                this.bufferGeometry = {
                    centerPoint: undefined,
                    moveLine: undefined,
                    polygonGraphic: undefined
                };
                this.eventListener = new EventListener(this);
            }
            draw(layer) {
                this.options = {
                    tooltip: {
                        move: 'Nhấn vào màn hình để chọn tâm vòng tròn'
                    }
                }
                this.tooltipMoveEvent = on(this.view, 'pointer-move', evt => {
                    Tooltip.instance().show([evt.x, evt.y], this.options.tooltip.move);
                });
                this.clickEventBuffer = on(this.view, 'click', (evt) => {
                    this.clickBufferFunc(evt)
                });
                this.doubleClickEvent = on(this.view, 'double-click', (evt) => {
                    this.doubleClickFunc(evt);
                });
            }
            doubleClickFunc(evt) {
                this.clearEvents();
            }
            clearEvents() {
                if (this.tooltipMoveEvent) {
                    Tooltip.instance().hide();
                    this.tooltipMoveEvent.remove();
                    this.tooltipMoveEvent = null;
                }
                if (this.clickEventBuffer) {
                    this.clickEventBuffer.remove();
                    this.clickEventBuffer = null;
                }
                if (this.pointerMoveBufferEvent) {
                    this.pointerMoveBufferEvent.remove();
                    this.pointerMoveBufferEvent = null;
                }
                if (this.clickPointEvent) {
                    this.clickPointEvent.remove();
                    this.clickPointEvent = null;
                }
                if (this.doubleClickEvent) {
                    this.doubleClickEvent.remove();
                    this.doubleClickEvent = null;
                }
            }
            clickBufferFunc(evt) {
                evt.stopPropagation();
                var dis = prompt("Nhập khoảng cách giữa các trụ điện");
                if (!dis) return;
                var screenCoors = {
                    x: evt.x,
                    y: evt.y
                };
                this.pointcenter = this.view.toMap(screenCoors);
                let circleGeometry = new Circle({
                    center: this.pointcenter,
                    radius: dis,
                    radiusUnit: "meters"
                });
                // Create a symbol for rendering the graphic
                var fillSymbol = new SimpleFillSymbol({
                    color: [227, 139, 79, 0.8],
                    outline: { // autocasts as new SimpleLineSymbol()
                        color: [255, 255, 255],
                        width: 1
                    },
                    opacity: 0.9
                });
                this.bufferGeometry.polygonGraphic = new Graphic({
                    geometry: circleGeometry,
                    symbol: fillSymbol
                });
                this.view.graphics.add(this.bufferGeometry.polygonGraphic);

                this.pointerMoveBufferEvent = on(this.view, 'pointer-move', (evt) => {
                    this.options.tooltip.move = "Nhấn để chọn điểm trên vòng tròn";
                    this.pointerMoveBufferFunc(evt)
                });
            }
            pointerMoveBufferFunc(evt) {
                if (this.clickEventBuffer) {
                    this.clickEventBuffer.remove();
                    this.clickEventBuffer = null;
                }
                if (this.clickPointEvent) {
                    this.clickPointEvent.remove();
                    this.clickPointEvent = null;
                }
                var point = this.view.toMap({
                    x: evt.x,
                    y: evt.y
                });
                if (this.bufferGeometry.centerPoint)
                    view.graphics.remove(this.bufferGeometry.centerPoint);
                if (this.bufferGeometry.moveLine)
                    view.graphics.remove(this.bufferGeometry.moveLine);
                //Là đường nối từ tâm đường tròn tới điểm tọa độ trên màn hình của sự kiện drag
                let line = new Polyline({
                    paths: [
                        [this.pointcenter.x, this.pointcenter.y],
                        [point.x, point.y]
                    ],
                    spatialReference: point.spatialReference
                });
                this.bufferGeometry.moveLine = new Graphic({
                    geometry: line,
                    symbol: new SimpleLineSymbol()
                });
                this.view.graphics.add(this.bufferGeometry.moveLine);
                // Xác định giao điểm của đường tròn với đường Polyline để tìm điểm Vẽ Point cần lấy

                var p = geometryEngine.intersect(this.bufferGeometry.moveLine.geometry, this.bufferGeometry.polygonGraphic.geometry);
                if (p) {
                    // Đổi tọa độ x,y sang long và lat
                    var longlat = webMercatorUtils.xyToLngLat(p.paths[0][1][0], p.paths[0][1][1]);
                    var point = new Point({
                        longitude: longlat[0],
                        latitude: longlat[1]
                    });
                    this.bufferGeometry.centerPoint = new Graphic({
                        geometry: point,
                        symbol: new SimpleMarkerSymbol()
                    });
                    this.view.graphics.add(this.bufferGeometry.centerPoint);
                }
                this.view.graphics.add(this.bufferGeometry.moveLine);
                this.clickPointEvent = on(this.view, 'click', (evt) => {
                    this.clickPointFunc(evt)
                });
            }
            clickPointFunc(evt) {
                this.options.tooltip.move = 'Nhấn vào màn hình để chọn tâm vòng tròn';
                if (this.pointerMoveBufferEvent) {
                    this.pointerMoveBufferEvent.remove();
                    this.pointerMoveBufferEvent = null;
                }
                this.eventListener.fire('draw-finish', this.bufferGeometry.centerPoint);
                this.view.graphics.remove(this.bufferGeometry.centerPoint);
                this.view.graphics.remove(this.bufferGeometry.polygonGraphic);
                this.view.graphics.remove(this.bufferGeometry.moveLine);
                if (this.clickPointEvent) {
                    this.clickPointEvent.remove();
                    this.clickPointEvent = null;
                }
                this.clickEventBuffer = on(this.view, 'click', (evt) => {
                    this.clickBufferFunc(evt)
                });
            }
        }

    });