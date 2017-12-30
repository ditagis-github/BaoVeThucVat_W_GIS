define(["require", "exports", "esri/views/MapView", "./SystemStatusObject", "esri/request"], function (require, exports, MapView, SystemStatusObject, esriRequest) {
    "use strict";
    class MapViewDTG extends MapView {
        constructor(params) {
            super(params);
            this.systemVariable = new SystemStatusObject();
        }
        session() {
            return new Promise((resolve, reject) => {
                esriRequest('/map', {
                    method: 'post'
                }).then(res => {
                    this.systemVariable.user = res.data;
                    resolve(res.data);
                });
            });
        }
    }
    return MapViewDTG;
});
//# sourceMappingURL=MapView.js.map