define([
    "dojo/on",
    "ditagis/tools/DrawingPolylineAbstract",
    "esri/geometry/Polyline", "esri/geometry/Circle",
    "esri/geometry/geometryEngine",
    "ditagis/support/equation",
    "esri/Graphic",
    "esri/geometry/SpatialReference",
    "esri/symbols/SimpleLineSymbol",
    "esri/symbols/SimpleMarkerSymbol",
    "ditagis/toolview/Tooltip",

], function (on,
    DrawingPolylineAbstract,
    Polyline, Circle,
    geometryEngine,
    equation,
    Graphic, spatialReference, SimpleLineSymbol, SimpleMarkerSymbol,
    Tooltip
) {
        'use strict';
        return class extends DrawingPolylineAbstract {
            constructor(view, fixedLayers, drawLayer, systemVariable) {
                super(view, fixedLayers, drawLayer, systemVariable)
            }
            draw() {
                this.startup();
                this.options = {
                    tooltip: {
                        move: 'Bấm để bắt đầu vẽ \r\n Nhấn CTRL để bắt dính đối tượng trên bản đồ'
                    }
                }
                this.tooltipMoveEvent = on(this.view, 'pointer-move', evt => {
                    Tooltip.instance().show([evt.x, evt.y], this.options.tooltip.move);
                })
            }
            /**
             * Sự kiện lấy 2 trụ để vẽ đường cung
             */
            startup() {
                this.selectLineSegmentEvent = on(this.view, 'pointer-move', (evt) => {
                    this.pointerMoveHandler(evt);
                });
                this.clickGetLineSegmentEvent = on(view, 'click', async evt => {
                    this.clickGetLineSegmentFunc(evt);
                });
                this.dblClickHandler = on(view, 'double-click', (evt) => {
                    evt.stopPropagation();
                    this.finish();
                })
            }

            pointerMoveHandler(evt) {
                const screenCoors = {
                    x: evt.x,
                    y: evt.y
                };
                //Tìm kiếm graphic trùng với tọa độ màn hình khi drag

                // nếu như đã có điểm đầu thì vẽ đường line tạm
                if (this.firstPoint) {
                    const point = this.view.toMap(screenCoors);
                    this.addTmpGraphic([[this.firstPoint.x, this.firstPoint.y], [point.x, point.y]]);
                }

            }
            clickGetLineSegmentFunc(evt) {
                evt.stopPropagation();
                this.options.tooltip.move = "Chọn điểm thứ hai để vẽ vòng cung";
                const screenCoors = {
                    x: evt.x,
                    y: evt.y
                };
                if (this.view.snapping) {
                    //nếu có nhấn key thì chạy hitest
                    if (this.view.snapping.isKeyPress()) {
                        this.checkHittest(screenCoors).then((point) => {
                            this.resultsPoint(point);
                        });
                    }
                    //không thì lấy điểm screenCoors
                    else {
                        this.resultsPoint(this.view.toMap(screenCoors));
                    }
                } else {
                    this.resultsPoint(this.view.toMap(screenCoors));
                }
            }
            resultsPoint(point) {
                if (!this.firstPoint) {
                    this.firstPoint = point;
                } else {
                    this.secondPoint = point;
                    this.addTmpGraphic([
                        [this.firstPoint.x, this.firstPoint.y],
                        [point.x, point.y]
                    ]);
                    this.finishChoosePoint();
                }
            }

            /**
             * Lấy giá trị graphic tại tọa độ màn hình khi dùng sự kiện drag
             * @param {mapPoint, graphic} response 
             */
            hitTestDragEnd(response) {
                let results = response.results,
                    valid = false;
                if (results.length) {
                    for (let i in results) {
                        let graphic = results[i].graphic;
                        let layer = graphic.layer;
                        if (layer) {
                            // if (this.withOnFixedLayer(layer)) {
                            let point = graphic.geometry;
                            if (point) {
                                //nếu chưa có điểm đầu thì gán điểm đầu
                                if (!this.firstPoint) {
                                    this.firstPoint = point;
                                } else {
                                    this.secondPoint = point;
                                    this.refreshMainGraphic([
                                        [this.firstPoint.x, this.firstPoint.y],
                                        [point.x, point.y]
                                    ]);
                                    this.finishChoosePoint();
                                }

                                valid = true;
                            }
                        }
                    }
                }
                if (!valid) {
                    alert('Chưa tìm thấy cột điện')
                }
            }

            /**
             * Kết thúc xử lý vẽ
             */
            finishChoosePoint() {
                if (this.clickGetLineSegmentEvent) {
                    this.clickGetLineSegmentEvent.remove();
                    this.clickGetLineSegmentEvent = null;
                }
                this.drawArgSegment();
            }
            /**
             * 
             * @param {circle} cutGeo 
             * @param {polyline} line 
             */
            getSegment(cutGeo, line) {
                for (let geo of cutGeo) {
                    var p = geometryEngine.intersect(geo, line);
                    if (p) {
                        return geo;
                    }
                }
                return null;
            }
            /**
             * 
             * @param {polygon} pointSegment 
             * @param {some paths of pointSegment } intersectPath 
             * @return đường cung
             */
            removeLine(pointSegment, intersectPath, lineCutGeo) {
                let r1 = pointSegment.rings[0];
                r1.pop();
                var lineCut1 = intersectPath[0],
                    lineCut2 = intersectPath[1];
                let paths = [];
                var count = 0;
                /**
                 * Nếu giá trị đầu tiên của đường dẫn trùng với một điểm trên Polyline
                 * thì lấy nguyên giá trị của Polygon truyền vào nhưng xóa điểm cuối Polygon
                 */
                var check = undefined;
                for (let i = 0; i < r1.length - 1; i = i + 1) {
                    if (check === 2) {
                        paths.push([r1[i][0], r1[i][1]]);
                    }
                    if ((r1[i][0] === lineCut1[0] && r1[i][1] === lineCut1[1]) &&
                        (r1[i + 1][0] === lineCut2[0] && r1[i + 1][1] === lineCut2[1])) {
                        count = i;
                        check = 1;
                        break;
                    }
                    else if ((r1[i][0] === lineCut2[0] && r1[i][1] === lineCut2[1]) &&
                        (r1[i + 1][0] === lineCut1[0] && r1[i + 1][1] === lineCut1[1])) {
                        count = i;
                        check = 2;
                    }
                    else if (r1[0][0] === lineCut1[0] && r1[0][1] === lineCut1[1]) {
                        paths.push([r1[i][0], r1[i][1]]);
                    }
                    else if (r1[0][0] === lineCut2[0] && r1[0][1] === lineCut2[1]) {
                        if (r1[1][0] === lineCut1[0] && r1[1][1] === lineCut1[1]) {
                            check = 2;
                            count = 0;
                        }
                        if (r1[r1.length - 1][0] === lineCut1[0] && r1[r1.length - 1][1] === lineCut1[1]) {
                            paths.push([r1[r1.length - i - 1][0], r1[r1.length - i - 1][1]]);
                            check = 3;
                        }
                        else {
                            check = 4;
                            paths.push([r1[i][0], r1[i][1]]);
                        }
                    }

                }

                if (check === 1) {
                    for (let i = count; i >= 0; i = i - 1) {
                        paths.push([r1[i][0], r1[i][1]]);
                    }
                    for (let i = r1.length - 1; i > count; i = i - 1) {
                        paths.push([r1[i][0], r1[i][1]]);
                    }
                }
                else if (check === 2) {
                    for (let i = 0; i <= count; i = i + 1) {
                        paths.push([r1[i][0], r1[i][1]]);
                    }
                }
                else if (check === 3) {
                    paths.push([r1[0][0], r1[0][1]]);
                }
                else if (check === 4) {
                    paths.push([r1[r1.length - 1][0], r1[r1.length - 1][1]]);
                }
                paths[0] = lineCutGeo[0];
                paths[paths.length - 1] = lineCutGeo[1];

                return paths;
            }
            getCirlePaths(screenCoors) {
                try {

                    var point = view.toMap(screenCoors);



                    // point 1 of line
                    var p1 = this.firstPoint;
                    // point 2 of line
                    var p2 = this.secondPoint;
                    var mid = equation.cal([
                        [p1.x, p1.y],
                        [p2.x, p2.y],
                        [point.x, point.y]
                    ]);
                    var midPoint = p1.clone();
                    midPoint.x = mid[0];
                    midPoint.y = mid[1];
                    var r = geometryEngine.distance(midPoint, p1, 'meters');

                    var circle = new Circle({
                        center: midPoint,
                        radius: r,
                        radiusUnit: 'meters'
                    })
                    var lineCutGeo = [
                        [p1.x, p1.y],
                        [p2.x, p2.y]
                    ];

                    var cutGeo = geometryEngine.cut(circle, new Polyline({
                        paths: lineCutGeo
                    }));
                    if (cutGeo.length > 0) {
                        var firstRing = cutGeo[0].rings[0],
                            secondRing = cutGeo[1].rings[0];
                        var intersectPath = this.intersectTwoCircle(firstRing, secondRing, lineCutGeo);
                        var pointSegment = this.getSegment(cutGeo, new Polyline({
                            paths: [
                                [p1.x, p1.y],
                                [point.x, point.y]
                            ]
                        }));
                        if (pointSegment) {
                            var cirPaths = this.removeLine(pointSegment, intersectPath, lineCutGeo);
                            return cirPaths;
                        } else {
                            console.log(`Không xác định được polyline để vẽ đường tròn, kiểm tra lại this.circleGraphic`);
                        }
                    }

                } catch (error) {
                    console.log(error);
                }
                return null;
            }
            /**
             * 
             * @param {event handle} evt 
             */
            pointerMoveArcSegmentFunc(evt) {
                this.options.tooltip.move = "Bấm để chọn vòng cung thích hợp"
                var cirPaths = this.getCirlePaths({
                    x: evt.x,
                    y: evt.y
                });
                this.addTmpGraphic(cirPaths);
            }
            clickPointFunc() {
                this.options.tooltip.move = "Chọn cách vẽ để tiếp tục \r\n Bấm đúp để hoàn thành"
                try {
                    this.refreshMainGraphic(this.tmpGraphic.geometry.paths[0]);
                    this.clearTmpGraphic();
                    if (this.pointerMoveArcSegmentEvent) {
                        this.pointerMoveArcSegmentEvent.remove();
                        this.pointerMoveArcSegmentEvent = null;
                    }
                    if (this.clickGetLineSegmentEvent) {
                        this.clickGetLineSegmentEvent.remove();
                        this.clickGetLineSegmentEvent = null;
                    }

                    if (this.clickPointEvent) {
                        this.clickPointEvent.remove();
                        this.clickPointEvent = null;
                    }
                } catch (error) {
                    console.log(error);
                }
            }
            /**
             * Lấy đường dẫn của hai đường tròn: là một đường thẳng
             * @param {ring of circle} firstRing 
             * @param {ring of circle} secondRing 
             * return: paths của Polyline
             */
            intersectTwoCircle(firstRing, secondRing, line) {
                let paths = [];
                for (let r1 in firstRing) {
                    for (let r2 in secondRing) {
                        if (firstRing[r1][0] === secondRing[r2][0] && firstRing[r1][1] === secondRing[r2][1]) {
                            let path = [firstRing[r1][0], firstRing[r1][1]];
                            paths.push(path);
                        }
                    }

                }
                function multiDimensionalUnique(arr) {
                    var uniques = [];
                    var itemsFound = {};
                    for (var i = 0, l = arr.length; i < l; i++) {
                        var stringified = JSON.stringify(arr[i]);
                        if (itemsFound[stringified]) { continue; }
                        uniques.push(arr[i]);
                        itemsFound[stringified] = true;
                    }
                    return uniques;
                }

                var uniquePaths = multiDimensionalUnique(paths);
                var firstPoint = line[0];
                var x1 = Math.abs(firstPoint[0] - uniquePaths[0][0]);
                var x2 = Math.abs(firstPoint[0] - uniquePaths[1][0]);
                if ((Math.abs(firstPoint[0] - uniquePaths[0][0]) < Math.abs(firstPoint[0] - uniquePaths[1][0]))
                    && (Math.abs(firstPoint[0] - uniquePaths[0][0]) < Math.abs(firstPoint[0] - uniquePaths[1][0]))) {
                    return uniquePaths;
                }
                else {
                    var path0 = uniquePaths[0];
                    uniquePaths[0] = uniquePaths[1];
                    uniquePaths[1] = path0;
                }

                return uniquePaths;
            }
            /**
             * Dùng sự kiện kiếm điểm tạo cung tròn
             */
            drawArgSegment() {
                if (this.selectLineSegmentEvent) {
                    this.selectLineSegmentEvent.remove();
                    this.selectLineSegmentEvent = null;
                }
                this.pointerMoveArcSegmentEvent = on(this.view, 'pointer-move', (evt) => {
                    this.pointerMoveArcSegmentFunc(evt);
                });
                this.clickPointEvent = on(this.view, 'click', (evt) => {
                    this.clickPointFunc(evt)
                });
            }
            clearEvents() {
                if (this.pointerMoveArcSegmentEvent) {
                    this.pointerMoveArcSegmentEvent.remove();
                    this.pointerMoveArcSegmentEvent = null;
                }
                if (this.clickGetLineSegmentEvent) {
                    this.clickGetLineSegmentEvent.remove();
                    this.clickGetLineSegmentEvent = null;
                }
                if (this.dblClickHandler) {
                    this.dblClickHandler.remove();
                    this.dblClickHandler = null;
                }
                if (this.tooltipMoveEvent) {
                    Tooltip.instance().hide();
                    this.tooltipMoveEvent.remove();
                    this.tooltipMoveEvent = null;
                }
            }
            finish() {
                this.eventListener.fire('draw-finish', this.geometry);
                this.cancel();
            }
            cancel() {
                //xóa sự kiện
                this.clearEvents();
                this.firstPoint = null;
                //xóa graphic tạm
                this.clearTmpGraphic();

            }
        }


    });
