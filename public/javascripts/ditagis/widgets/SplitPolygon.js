var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "dojo/dom-construct", "dojo/on", "../toolview/Tooltip", "../support/HightlightGraphic", "esri/symbols/SimpleFillSymbol", "esri/symbols/SimpleLineSymbol", "esri/Color", "esri/Graphic", "esri/geometry/Polyline", "esri/geometry/Polygon", "esri/geometry/geometryEngine"], function (require, exports, domConstruct, on, Tooltip, HightlightGraphic, SimpleFillSymbol, SimpleLineSymbol, Color, Graphic, Polyline, Polygon, geometryEngine) {
    "use strict";
    class SplitPolygon {
        constructor(view, options = {}) {
            this.view = view;
            this.options = {
                position: "top-right",
                icon: "esri-widget esri-widget-button esri-icon-basemap",
                icon_cancel: "esri-widget esri-widget-button esri-icon-close-circled",
                title: 'Chia thửa',
                tooltip: {
                    move: 'Nhấn để vẽ đường chia thửa'
                }
            };
            this.initView();
        }
        startup(selectedFeature, layer) {
            this.selectedFeature = selectedFeature;
            this.layer = layer;
            this.hightlightGraphic.clear();
            this.hightlightGraphic.add(selectedFeature);
            this.add_dtg_wget_cancel();
            this.clickEvent = on(this.view, 'click', (evt) => {
                this.clickHandler(evt);
            });
            this.pointerMoveEvent = on(this.view, 'pointer-move', evt => {
                Tooltip.instance().show([evt.x, evt.y], this.options.tooltip.move);
                this.pointerMoveHandler(evt);
            });
            this.dblClickHandler = on(this.view, 'double-click', (evt) => {
                evt.stopPropagation();
                this.finish(evt);
            });
        }
        pointerMoveHandler(evt) {
            evt.stopPropagation();
            let screenCoors = {
                x: evt.x,
                y: evt.y
            };
            let point = this.view.toMap(screenCoors);
            var vertice = [point.x, point.y];
            var paths = [];
            if (this.vertices.length > 0) {
                for (const path of this.vertices) {
                    paths.push(path);
                }
            }
            paths.push(vertice);
            this.refreshMainGraphic(paths);
        }
        finish(evt) {
            const screenCoors = {
                x: evt.x,
                y: evt.y
            };
            let point = this.view.toMap(screenCoors);
            var vertice = [point.x, point.y];
            this.vertices.push(vertice);
            this.refreshMainGraphic(this.vertices);
            this.xuly();
            this.clearEvent();
        }
        xuly() {
            return __awaiter(this, void 0, void 0, function* () {
                if (confirm('Có chắc chắn tách thửa?')) {
                    var selectedFeature_attributes = this.selectedFeature.attributes;
                    var geometry = this.selectedFeature.geometry;
                    let line = new Polyline({
                        paths: this.vertices,
                        spatialReference: this.view.spatialReference
                    });
                    let res = geometryEngine.cut(geometry, line);
                    var ring_list = [];
                    for (var result in res) {
                        var graphic = res[result];
                        for (const ring of graphic.rings) {
                            ring_list.push(ring);
                        }
                    }
                    var madoituong = yield this.taoMaDoiTuong();
                    var update_graphics = [], add_graphics = [];
                    for (var index = 0; index < ring_list.length; index++) {
                        var polygon = new Polygon({
                            rings: ring_list[index],
                            spatialReference: this.view.spatialReference
                        });
                        if (index == 0) {
                            const addFeature = new Graphic({
                                geometry: polygon,
                                attributes: selectedFeature_attributes,
                            });
                            update_graphics.push(addFeature);
                        }
                        else {
                            var attributes = {};
                            attributes["LoaiCayTrong"] = selectedFeature_attributes['LoaiCayTrong'];
                            attributes["OBJECTID"] = selectedFeature_attributes['OBJECTID'];
                            attributes["MaHuyenTP"] = selectedFeature_attributes['MaHuyenTP'];
                            attributes["NhomCayTrong"] = selectedFeature_attributes['NhomCayTrong'];
                            attributes["MaDoiTuong"] = selectedFeature_attributes['MaDoiTuong'] + "_" + (madoituong + index);
                            const addFeature = new Graphic({
                                geometry: polygon,
                                attributes: attributes,
                            });
                            add_graphics.push(addFeature);
                        }
                    }
                    let edits = {
                        updateFeatures: update_graphics,
                        addFeatures: add_graphics,
                    };
                    this.layer.applyEdits(edits);
                    this.vertices = [];
                }
            });
        }
        taoMaDoiTuong() {
            return __awaiter(this, void 0, void 0, function* () {
                var maDoiTuong = this.selectedFeature.attributes['MaDoiTuong'];
                var split_mdt = maDoiTuong.split('_');
                var len_mdt = split_mdt.length;
                let query = this.layer.createQuery();
                query.outFields = ['MaDoiTuong'];
                query.where = "MaDoiTuong like '" + maDoiTuong + "[_]%'";
                let danhSachTrongTrot = yield this.layer.queryFeatures(query);
                var max_ma = 0;
                for (const item of danhSachTrongTrot.features) {
                    let mdt = item.attributes.MaDoiTuong;
                    if (mdt) {
                        var split_mdt_query = mdt.split('_');
                        var stt = parseInt(split_mdt_query[len_mdt]);
                        if (stt > max_ma)
                            max_ma = stt;
                    }
                }
                return max_ma;
            });
        }
        add_dtg_wget_cancel() {
            this.view.ui.add(this.DOM.cancel_wget, this.options.position);
        }
        initView() {
            try {
                this.vertices = [];
                this.hightlightGraphic = new HightlightGraphic(this.view, {
                    symbolPlg: new SimpleFillSymbol({
                        style: "none",
                        outline: new SimpleLineSymbol({
                            color: new Color('#0000ff'),
                            width: 1
                        })
                    })
                });
                this.DOM = {};
                this.DOM.cancel_wget = domConstruct.create('div', {
                    id: "dtg-wget-split-polygon",
                    class: this.options.icon_cancel,
                    title: "Hủy"
                });
                on(this.DOM.cancel_wget, "click", (evt) => {
                    this.clearEvent();
                });
            }
            catch (error) {
                throw error;
            }
        }
        clickHandler(evt) {
            evt.stopPropagation();
            const screenCoors = {
                x: evt.x,
                y: evt.y
            };
            let point = this.view.toMap(screenCoors);
            var vertice = [point.x, point.y];
            this.vertices.push(vertice);
            this.refreshMainGraphic(this.vertices);
        }
        refreshMainGraphic(paths) {
            try {
                if (this.graphic) {
                    this.view.graphics.remove(this.graphic);
                    this.graphic = null;
                }
                if (paths) {
                    let line = new Polyline({
                        paths: paths,
                        spatialReference: this.view.spatialReference
                    });
                    this.graphic = new Graphic({
                        geometry: line,
                        symbol: new SimpleLineSymbol({
                            color: new Color([255, 0, 0]),
                            width: 1
                        })
                    });
                    this.view.graphics.add(this.graphic);
                }
            }
            catch (error) {
            }
        }
        clearEvent() {
            if (this.clickEvent) {
                this.clickEvent.remove();
                this.clickEvent = null;
            }
            if (this.pointerMoveEvent) {
                Tooltip.instance().hide();
                this.pointerMoveEvent.remove();
                this.pointerMoveEvent = null;
            }
            if (this.dblClickHandler) {
                this.dblClickHandler.remove();
                this.dblClickHandler = null;
            }
            this.view.ui.remove(this.DOM.cancel_wget);
            this.vertices = [];
            this.hightlightGraphic.clear();
            if (this.graphic) {
                this.view.graphics.remove(this.graphic);
                this.graphic = null;
            }
        }
    }
    return SplitPolygon;
});
