define(["require", "exports", "esri/tasks/QueryTask", "esri/request"], function (require, exports, QueryTask, esriRequest) {
    "use strict";
    var FeatureTable = (function () {
        function FeatureTable(params) {
            if (params === void 0) { params = {}; }
            var _this = this;
            this.url = params.url;
            this.fieldID = params.fieldID || 'OBJECTID';
            this.queryTask = new QueryTask(this.url);
            $.get(this.url + '?f=json').done(function (res) {
                res = JSON.parse(res);
                for (var key in res) {
                    _this[key] = res[key];
                }
            });
        }
        FeatureTable.prototype.findById = function (id) {
            return this.queryTask.execute({
                outFields: ['*'],
                where: this.fieldID + " = '" + id + "'"
            });
        };
        FeatureTable.prototype.getFieldDomain = function (field) {
            return this.fields.find(function (f) {
                return f.name === field;
            }).domain;
        };
        FeatureTable.prototype.applyEdits = function (options) {
            if (options === void 0) { options = {
                addFeatures: [],
                updateFeatures: [],
                deleteFeatures: []
            }; }
            var form = document.createElement('form');
            form.method = 'post';
            if (options.addFeatures.length > 0) {
                var adds = document.createElement('input');
                adds.name = 'adds';
                adds.type = 'text';
                adds.value = JSON.stringify(options.addFeatures);
                form.appendChild(adds);
            }
            if (options.deleteFeatures.length > 0) {
                var deletes = document.createElement('input');
                deletes.name = 'deletes';
                deletes.type = 'text';
                deletes.value = options.deleteFeatures.join(',');
                form.appendChild(deletes);
            }
            if (options.updateFeatures.length > 0) {
                var updates = document.createElement('input');
                updates.name = 'updates';
                updates.type = 'text';
                updates.value = JSON.stringify(options.updateFeatures);
                form.appendChild(updates);
            }
            var format = document.createElement('input');
            format.name = 'f';
            format.type = 'text';
            format.value = 'json';
            form.appendChild(format);
            return esriRequest(this.url + '/applyEdits?f=json', {
                method: 'post',
                body: form
            });
        };
        FeatureTable.prototype.queryFeatures = function (query) {
            return this.queryTask.execute(query);
        };
        return FeatureTable;
    }());
    return FeatureTable;
});
