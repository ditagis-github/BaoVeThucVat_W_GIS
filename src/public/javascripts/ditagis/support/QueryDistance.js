define([
    "esri/tasks/support/Query",
    "esri/tasks/QueryTask",
    "ditagis/config"
], function (Query, QueryTask,
    config) {
        'use strict';
        class QueryDistance {
            constructor(layers, options = {}) {
                if (!layers) {
                    console.debug("Chưa có featurelayer để kiểm tra");
                }
                this.layers = layers;
                this.units = options.units || "meters";
                this.distance = options.distance || 100;

                this.queryTasks = [];

                this.query = new Query();
                this.query.outFields = ["*"];
                this.query.returnGeometry = true;
                this.query.distance = this.distance;
                this.query.units = "meters";
                // this.query.spatialRelationship = "intersects";
            }


            async execute(geometry) {
                this.query.geometry = geometry;
                let proms = [],
                    results = [];
                for (let layer of this.layers) {
                    var queryFeatures = await layer.queryFeatures(this.query);   
                    var features = queryFeatures.features; 
                    for (let ft of features) {
                        results.push(ft);
                    }
                }
                return results;
            }
            static execute(layers, geometry) {
                let queryDistance = new QueryDistance(layers);
                return queryDistance.execute(geometry);
            }

        }
        return QueryDistance;
    });