define([

    "esri/geometry/support/webMercatorUtils",
    "esri/geometry/Point",
    "esri/geometry/Polyline",
    "esri/Graphic",
    "esri/symbols/SimpleMarkerSymbol",
    "ditagis/support/Editing",
    "esri/geometry/geometryEngineAsync",
    "esri/geometry/geometryEngine",
    "esri/geometry/SpatialReference",
    "ditagis/support/PolylineAttributes"
], function (webMercatorUtils, Point, Polyline, Graphic, SimpleMarkerSymbol, editingSupport,
    geometryEngineAsync, geometryEngine, SpatialReference, PolylineAttributes) {
        'use strict';
        return class {
            constructor(view) {
                this.view = view;
                this.systemVariable = view.systemVariable;
            }
            get layer() {
                return this._layer;
            }
            set layer(value) {
                this._layer = value;
            }

            draw(drawLayer = this.layer, geometry) {
                return new Promise((resolve, reject) => {
                    let attributes = {};
                    var plAttrs = new PolylineAttributes(this.view, drawLayer);
                    plAttrs.getAttributes(geometry).then(attributes => {
                        for (var i in drawLayer.drawingAttributes) {
                            attributes[i] = drawLayer.drawingAttributes[i];
                        }
                        for (var i in plAttrs.attributes) {
                            attributes[i] = attributes[i];
                        }
                        let edits = {
                            addFeatures: [{
                                geometry:geometry,
                                attributes:attributes
                            }]
                        };
                        drawLayer.applyEdits(edits).then((result) => {
                            if (result.addFeatureResults.length > 0) {
                                if (result.addFeatureResults[0].error)
                                    reject(result.addFeatureResults[0].error);
                                else
                                    resolve(`Thêm thành công đối tượng ${drawLayer.title}`);
                            }
                        })
                    });


                });
            }

        }

    });