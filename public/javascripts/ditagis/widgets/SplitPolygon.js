var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
define(["require", "exports", "dojo/dom-construct", "dojo/on", "../toolview/Tooltip", "../support/HightlightGraphic", "esri/symbols/SimpleFillSymbol", "esri/symbols/SimpleLineSymbol", "esri/Color", "esri/Graphic", "esri/geometry/Polyline", "esri/geometry/Polygon", "esri/geometry/geometryEngine"], function (require, exports, domConstruct, on, Tooltip, HightlightGraphic, SimpleFillSymbol, SimpleLineSymbol, Color, Graphic, Polyline, Polygon, geometryEngine) {
    "use strict";
    var SplitPolygon = (function () {
        function SplitPolygon(view, options) {
            if (options === void 0) { options = {}; }
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
        SplitPolygon.prototype.startup = function (selectedFeature, layer) {
            var _this = this;
            this.selectedFeature = selectedFeature;
            this.layer = layer;
            this.hightlightGraphic.clear();
            this.hightlightGraphic.add(selectedFeature);
            this.add_dtg_wget_cancel();
            this.clickEvent = on(this.view, 'click', function (evt) {
                _this.clickHandler(evt);
            });
            this.pointerMoveEvent = on(this.view, 'pointer-move', function (evt) {
                Tooltip.instance().show([evt.x, evt.y], _this.options.tooltip.move);
                _this.pointerMoveHandler(evt);
            });
            this.dblClickHandler = on(this.view, 'double-click', function (evt) {
                evt.stopPropagation();
                _this.finish(evt);
            });
        };
        SplitPolygon.prototype.pointerMoveHandler = function (evt) {
            evt.stopPropagation();
            var screenCoors = {
                x: evt.x,
                y: evt.y
            };
            var point = this.view.toMap(screenCoors);
            var vertice = [point.x, point.y];
            var paths = [];
            if (this.vertices.length > 0) {
                for (var _i = 0, _a = this.vertices; _i < _a.length; _i++) {
                    var path = _a[_i];
                    paths.push(path);
                }
            }
            paths.push(vertice);
            this.refreshMainGraphic(paths);
        };
        SplitPolygon.prototype.finish = function (evt) {
            var screenCoors = {
                x: evt.x,
                y: evt.y
            };
            var point = this.view.toMap(screenCoors);
            var vertice = [point.x, point.y];
            this.vertices.push(vertice);
            this.refreshMainGraphic(this.vertices);
            this.xuly();
            this.clearEvent();
        };
        SplitPolygon.prototype.xuly = function () {
            return __awaiter(this, void 0, void 0, function () {
                var selectedFeature_attributes, geometry, line, res, ring_list, result, graphic, _i, _a, ring, madoituong, update_graphics, add_graphics, index, polygon, addFeature, attributes, addFeature, edits;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            if (!confirm('Có chắc chắn tách thửa?')) return [3, 2];
                            selectedFeature_attributes = this.selectedFeature.attributes;
                            geometry = this.selectedFeature.geometry;
                            line = new Polyline({
                                paths: this.vertices,
                                spatialReference: this.view.spatialReference
                            });
                            res = geometryEngine.cut(geometry, line);
                            ring_list = [];
                            for (result in res) {
                                graphic = res[result];
                                for (_i = 0, _a = graphic.rings; _i < _a.length; _i++) {
                                    ring = _a[_i];
                                    ring_list.push(ring);
                                }
                            }
                            return [4, this.taoMaDoiTuong()];
                        case 1:
                            madoituong = _b.sent();
                            update_graphics = [], add_graphics = [];
                            for (index = 0; index < ring_list.length; index++) {
                                polygon = new Polygon({
                                    rings: ring_list[index],
                                    spatialReference: this.view.spatialReference
                                });
                                if (index == 0) {
                                    addFeature = new Graphic({
                                        geometry: polygon,
                                        attributes: selectedFeature_attributes
                                    });
                                    update_graphics.push(addFeature);
                                }
                                else {
                                    attributes = {};
                                    attributes["LoaiCayTrong"] = selectedFeature_attributes['LoaiCayTrong'];
                                    attributes["OBJECTID"] = selectedFeature_attributes['OBJECTID'];
                                    attributes["MaHuyenTP"] = selectedFeature_attributes['MaHuyenTP'];
                                    attributes["NhomCayTrong"] = selectedFeature_attributes['NhomCayTrong'];
                                    attributes["MaDoiTuong"] = selectedFeature_attributes['MaDoiTuong'] + "_" + (madoituong + index);
                                    addFeature = new Graphic({
                                        geometry: polygon,
                                        attributes: attributes
                                    });
                                    add_graphics.push(addFeature);
                                }
                            }
                            edits = {
                                updateFeatures: update_graphics,
                                addFeatures: add_graphics
                            };
                            this.layer.applyEdits(edits);
                            this.vertices = [];
                            _b.label = 2;
                        case 2: return [2];
                    }
                });
            });
        };
        SplitPolygon.prototype.taoMaDoiTuong = function () {
            return __awaiter(this, void 0, void 0, function () {
                var maDoiTuong, split_mdt, len_mdt, query, danhSachTrongTrot, max_ma, _i, _a, item, mdt, split_mdt_query, stt;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            maDoiTuong = this.selectedFeature.attributes['MaDoiTuong'];
                            split_mdt = maDoiTuong.split('_');
                            len_mdt = split_mdt.length;
                            query = this.layer.createQuery();
                            query.outFields = ['MaDoiTuong'];
                            query.where = "MaDoiTuong like '" + maDoiTuong + "[_]%'";
                            return [4, this.layer.queryFeatures(query)];
                        case 1:
                            danhSachTrongTrot = _b.sent();
                            max_ma = 0;
                            for (_i = 0, _a = danhSachTrongTrot.features; _i < _a.length; _i++) {
                                item = _a[_i];
                                mdt = item.attributes.MaDoiTuong;
                                if (mdt) {
                                    split_mdt_query = mdt.split('_');
                                    stt = parseInt(split_mdt_query[len_mdt]);
                                    if (stt > max_ma)
                                        max_ma = stt;
                                }
                            }
                            return [2, max_ma];
                    }
                });
            });
        };
        SplitPolygon.prototype.add_dtg_wget_cancel = function () {
            this.view.ui.add(this.DOM.cancel_wget, this.options.position);
        };
        SplitPolygon.prototype.initView = function () {
            var _this = this;
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
                    "class": this.options.icon_cancel,
                    title: "Hủy"
                });
                on(this.DOM.cancel_wget, "click", function (evt) {
                    _this.clearEvent();
                });
            }
            catch (error) {
                throw error;
            }
        };
        SplitPolygon.prototype.clickHandler = function (evt) {
            evt.stopPropagation();
            var screenCoors = {
                x: evt.x,
                y: evt.y
            };
            var point = this.view.toMap(screenCoors);
            var vertice = [point.x, point.y];
            this.vertices.push(vertice);
            this.refreshMainGraphic(this.vertices);
        };
        SplitPolygon.prototype.refreshMainGraphic = function (paths) {
            try {
                if (this.graphic) {
                    this.view.graphics.remove(this.graphic);
                    this.graphic = null;
                }
                if (paths) {
                    var line = new Polyline({
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
                console.log(error);
            }
        };
        SplitPolygon.prototype.clearEvent = function () {
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
        };
        return SplitPolygon;
    }());
    return SplitPolygon;
});
