define([
    "dojo/on",
    "ditagis/classes/EventListener",
    "esri/Graphic",
    "esri/geometry/Polyline",
    "esri/geometry/Point",
    "esri/geometry/Circle",
    "esri/symbols/SimpleLineSymbol",
    "esri/symbols/SimpleMarkerSymbol",
    "esri/symbols/SimpleFillSymbol",

    "esri/geometry/geometryEngine",
    "esri/geometry/support/webMercatorUtils",
    "ditagis/toolview/Tooltip",

], function (on, EventListener,
    Graphic,
    Polyline, Point, Circle, SimpleLineSymbol, SimpleMarkerSymbol, SimpleFillSymbol,
    geometryEngine, webMercatorUtils, Tooltip) {
        'use strict';
        return class {
            constructor(view) {
                this.view = view;
                this.points = [];
                this.eventListener = new EventListener(this);
            }
            draw(layer) {
                this.options = {
                    tooltip: {
                        move: 'Nhấn vào màn hình để chọn tâm vòng tròn thứ nhất'
                    }
                }
                this.tooltipMoveEvent = on(this.view, 'pointer-move', evt => {
                    Tooltip.instance().show([evt.x, evt.y], this.options.tooltip.move);
                });
                this.points = [];
                this.clickBufferEvent = on(view, 'click', (evt) => {
                    this.clickBufferFunc(evt);
                });
                this.doubleClickEvent = on(this.view, 'double-click', (evt) => {
                    this.doubleClickFunc(evt);
                });

            }
            doubleClickFunc(evt) {
                this.clearEvents();
                for (let point of this.points) {
                    view.graphics.remove(point);
                }
                this.points = [];
            }
            clearEvents() {
                if (this.doubleClickEvent) {
                    this.doubleClickEvent.remove();
                    this.doubleClickEvent = null;
                }
                if (this.clickBufferEvent) {
                    this.clickBufferEvent.remove();
                    this.clickBufferEvent = null;
                }
                if (this.clickSelectPointEvent) {
                    this.clickSelectPointEvent.remove();
                    this.clickSelectPointEvent = null;
                }
                if (this.tooltipMoveEvent) {
                    Tooltip.instance().hide();
                    this.tooltipMoveEvent.remove();
                    this.tooltipMoveEvent = null;
                }
            }
            clickBufferFunc(evt) {
                let pointcenter = view.toMap({
                    x: evt.x,
                    y: evt.y
                }),
                    centerCircle = Graphic({
                        geometry: pointcenter,
                        symbol: new SimpleMarkerSymbol({
                            color: [255, 0, 0],
                            size: 3,
                            width: 4
                        })
                    });
                view.graphics.add(centerCircle);
                let dis = prompt("Nhập bán kính của đường tròn:");
                this.options.tooltip.move = "Nhấn vào màn hình để chọn tâm thứ 2";
                let circleGeometry = new Circle({
                    center: pointcenter,
                    radius: dis,
                    radiusUnit: "meters"
                });


                // Create a symbol for rendering the graphic
                let fillSymbol = new SimpleFillSymbol({
                    color: [227, 139, 79, 0.8],
                    outline: { // autocasts as new SimpleLineSymbol()
                        color: [255, 255, 255],
                        width: 1
                    },
                    opacity: 0.9
                });

                // Add the geometry and symbol to a new graphic
                let polygonGraphic = new Graphic({
                    geometry: circleGeometry,
                    symbol: fillSymbol
                });
                this.points.push(polygonGraphic);
                this.points.push(centerCircle);
                // this.points[this.points.length - 2] là Polygon
                // this.point của từ lần vẽ thứ 2 sẽ có độ dài bằng 4
                view.graphics.add(this.points[this.points.length - 2]);
                this.checkIntersection();
            }
            checkIntersection() {
                if (this.points.length === 4) {
                    // Lấy giao của hai đường tròn: intersectTwoCircle
                    var intersectTwoCircle = geometryEngine.intersect(this.points[0].geometry, this.points[2].geometry);
                    // Kiểm tra hai đường tròn có giao với nhau không
                    // Nếu có điểm chung
                    if (intersectTwoCircle) {
                        // Hai điểm giao thực chất không cùng nằm trên cả hai đường tròn
                        for (let coordinates of intersectTwoCircle.rings[0]) {
                            let check1 = false;
                            let check2 = false;
                            for (var ringCircle in this.points[0].geometry.rings[0]) {
                                //Lấy giá trị gần đúng của tọa độ trên intersecTwoCircle và trên đường tròn thứ nhất
                                let coordinateRingCircle = Math.round(this.points[0].geometry.rings[0][ringCircle][0] * 100) / 100,
                                    coordinateIntersect = Math.round(coordinates[0] * 100) / 100;
                                if (coordinateRingCircle == coordinateIntersect) {
                                    check1 = true;

                                }
                            }
                            for (var ringCircle in this.points[2].geometry.rings[0]) {
                                //Lấy giá trị gần đúng của tọa độ trên intersecTwoCircle và trên đường tròn thứ hai
                                let coordinateRingCircle = Math.round(this.points[2].geometry.rings[0][ringCircle][0] * 100) / 100,
                                    coordinateIntersect = Math.round(coordinates[0] * 100) / 100;
                                if (coordinateRingCircle == coordinateIntersect) {
                                    check2 = true;
                                }
                            }
                            // Nếu một giá trị ở trên intersectTwoCircle trùng với một trong hai đường tròn thì không phải là giao điểm cần lấy
                            if (!check1 && !check2) {
                                var longlat = webMercatorUtils.xyToLngLat(coordinates[0], coordinates[1]);
                                var pointIntersect = new Point({
                                    longitude: longlat[0],
                                    latitude: longlat[1]
                                });
                                let pointConjunctionGraphic = new Graphic({
                                    geometry: pointIntersect,
                                    symbol: new SimpleMarkerSymbol()
                                });
                                this.view.graphics.add(pointConjunctionGraphic);
                                // Để lưu giữ hai điểm tọa độ giao
                                this.points.push(pointConjunctionGraphic);
                                this.options.tooltip.move = "Chọn một trong hai điểm giao hội ở trên bản đồ để hoàn thành";

                            }
                        }
                        if (this.clickBufferEvent) {
                            this.clickBufferEvent.remove();
                            this.clickBufferEvent = null;
                        }
                        this.clickSelectPointEvent = on(this.view, 'click', (evt) => {
                            this.clickSelectPointFunc(evt);
                            if (this.tooltipMoveEvent) {
                                Tooltip.instance().hide();
                                this.tooltipMoveEvent.remove();
                                this.tooltipMoveEvent = null;
                            }
                        })
                        for (var i = 0; i < 4; i++)
                            this.view.graphics.remove(this.points[i]);
                    } else {
                        // Nếu không có giao hội thì tiếp tục vẽ đường tròn thứ 2 tới khi nào có giao hội
                        view.graphics.remove(this.points[2]);
                        view.graphics.remove(this.points[3]);
                        this.points.pop();
                        this.points.pop();
                    }
                }
            }
            clickSelectPointFunc(evt) {
                evt.stopPropagation();
                let screenCoors = {
                    x: evt.x,
                    y: evt.y
                };
                // Dùng hittest để kiểm tra nó có trùng với một trong hai giao hội không
                this.view.hitTest(screenCoors).then((res) => {
                    if (res.results.length === 1) {
                        let pointcenter = res.results[0].graphic.geometry;
                        let pointAdd = new Graphic({
                            geometry: pointcenter,
                            symbol: new SimpleMarkerSymbol()
                        });
                        this.eventListener.fire('draw-finish', pointAdd);
                        this.clickSelectPointEvent.remove();

                        for (let point of this.points) {
                            view.graphics.remove(point);
                        }
                        return;
                    }
                })

            }
        }

    });