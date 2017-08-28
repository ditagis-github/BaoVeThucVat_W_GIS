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
                this.units = options.units || "meters";
                this.distance = options.distance || 50;

                this.queryTasks = [];

                this.query = new Query();
                this.query.outFields = ["*"];
                this.query.returnGeometry = true;
                this.query.distance = 50;
                this.query.units = "meters";
                // this.query.spatialRelationship = "intersects";
            }

            get layers() {
                return this.view.layers;
            }

            execute(geometry) {
                this.query.geometry = geometry;
                let proms = [],
                    results = [];
                for (let layer of this.layers) {
                    var features = await layer.queryFeatures(this.query);
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