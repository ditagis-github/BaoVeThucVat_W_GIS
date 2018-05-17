var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
define(["require", "exports", "esri/views/MapView", "./SystemStatusObject", "esri/request"], function (require, exports, MapView, SystemStatusObject, esriRequest) {
    "use strict";
    var MapViewDTG = (function (_super) {
        __extends(MapViewDTG, _super);
        function MapViewDTG(params) {
            var _this = _super.call(this, params) || this;
            _this.systemVariable = new SystemStatusObject();
            return _this;
        }
        MapViewDTG.prototype.session = function () {
            var _this = this;
            return new Promise(function (resolve, reject) {
                esriRequest('/map', {
                    method: 'post'
                }).then(function (res) {
                    _this.systemVariable.user = res.data;
                    resolve(res.data);
                });
            });
        };
        return MapViewDTG;
    }(MapView));
    return MapViewDTG;
});
