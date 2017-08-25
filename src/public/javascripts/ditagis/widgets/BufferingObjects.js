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
                    icon: "esri-icon-hollow-eye",
                    title: 'Hiển thị các đối tượng gần vị trí'
                };

                if (options && typeof options === 'object') {
                    for (let index in options) {
                        this.options[index] = options[index] || this.options[index];
                    }
                }
                this.statusDraw = false;
                this.initWidget();

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
                findObjectEvt = on(this.view, 'pointer-move', (evt) => {
                    findObjectFunc(evt);
                });
            }
            findObjectFunc(evt) {
                
            }
            clickHandler(evt) {
                this.changeStatusDraw();
            }
            changeStatusDraw() {
                if (!this.statusDraw) {
                    domClass.add(this.spanComponent, 'esri-icon-non-visible');
                    domClass.remove(this.spanComponent, this.options.icon);
                    this.statusDraw = true;
                } else {
                    domClass.add(this.spanComponent, this.options.icon);
                    domClass.remove(this.spanComponent, 'esri-icon-non-visible');
                    this.statusDraw = false;
                }
            }
        }
    });