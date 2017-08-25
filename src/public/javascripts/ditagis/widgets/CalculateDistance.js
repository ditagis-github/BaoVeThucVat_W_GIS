define([
    "dojo/dom-construct",
    "dojo/dom-class",
    "dojo/dom",
    "dojo/on",

    "esri/Graphic",
    "esri/layers/GraphicsLayer",
    "esri/geometry/Polyline",
    "esri/geometry/Point",
    "esri/geometry/Circle",
    "esri/symbols/SimpleLineSymbol",
    "esri/symbols/SimpleMarkerSymbol",
    "esri/symbols/SimpleFillSymbol",
    "esri/geometry/geometryEngine",
    "esri/geometry/geometryEngineAsync",
    "esri/geometry/SpatialReference",
    "ditagis/tools/SimpleDrawPolyline",
    "ditagis/toolview/Tooltip",


], function (domConstruct, domClass, dom, on,
    Graphic, GraphicsLayer, Polyline, Point, Circle, SimpleLineSymbol, SimpleMarkerSymbol, SimpleFillSymbol,
    geometryEngine, geometryEngineAsync, SpatialReference, SimpleDrawPolyline, Tooltip) {

        'use strict';
        return class {
            constructor(view, options = {}) {
                this.view = view;
                this.options = {
                    position: "top-right",
                    distanceBuffer: 50,
                    icon: "esri-icon-map-pin",
                    title: 'Đo khoảng cách'
                };

                if (options && typeof options === 'object') {
                    for (let index in options) {
                        this.options[index] = options[index] || this.options[index];
                    }
                }
                this.statusDraw = false;
                this.initWidget();

            }
            async finish(geometry) {
                if (geometry) {
                    var distance = await geometryEngineAsync.geodesicLength(geometry, 'meters');
                    // làm tròn
                    distance = Math.round(distance * 10000) / 10000;
                }
                this.simpleDrawPolyline.clearGraphic();
                this.changeStatusDraw();
                this.simpleDrawPolyline = null;
                delete this.simpleDrawPolyline;
            }
            initWidget() {
                let divDistance = domConstruct.create('div', {
                    id: "dtg-wget-distance",
                    class: "esri-widget esri-widget-button",
                    title: this.options.title
                });
                this.spanComponent = domConstruct.create('span', {
                    class: this.options.icon
                })
                domConstruct.place(this.spanComponent, divDistance);
                domConstruct.place(divDistance, document.body);

                this.view.ui.add(dom.byId('dtg-wget-distance'), this.options.position);

                on(divDistance, "click", (evt) => {
                    this.clickHandler(evt);
                });
            }
            clickHandler(evt) {
                this.changeStatusDraw();
                //nếu chưa khởi tạo
                if (!this.simpleDrawPolyline) {
                    this.simpleDrawPolyline = new SimpleDrawPolyline(view, {
                        otherMoveTooltip: {
                            visible: false
                        }
                    });

                    this.simpleDrawPolyline.on('draw-finish', geometry => {
                        this.finish(geometry);
                    });

                    this.simpleDrawPolyline.on('pointer-move', evt => {
                        geometryEngineAsync.geodesicLength(evt.geometry, 'meters').then(distance => {
                            distance = Math.round(distance * 10000) / 10000;
                            Tooltip.instance().show([evt.x, evt.y], distance);
                        })

                    });
                }
                this.simpleDrawPolyline.startup();
            }
            changeStatusDraw() {
                if (!this.statusDraw) {
                    domClass.add(this.spanComponent, 'esri-icon-directions');
                    domClass.remove(this.spanComponent, 'esri-icon-map-pin');
                    this.statusDraw = true;
                } else {
                    domClass.add(this.spanComponent, 'esri-icon-map-pin');
                    domClass.remove(this.spanComponent, 'esri-icon-directions');
                    this.statusDraw = false;
                }
            }
        }
    });