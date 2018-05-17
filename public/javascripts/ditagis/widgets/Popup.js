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
define(["require", "exports", "../classes/ConstName", "../config", "dojo/on", "dojo/dom-construct", "./Popup/PopupEdit", "../support/HightlightGraphic", "../support/Editing", "../toolview/Bootstrap", "esri/symbols/SimpleMarkerSymbol", "esri/symbols/SimpleFillSymbol", "esri/symbols/SimpleLineSymbol", "../support/FeatureTable", "esri/Color"], function (require, exports, constName, config, on, domConstruct, PopupEdit, HightlightGraphic, editingSupport, bootstrap, SimpleMarkerSymbol, SimpleFillSymbol, SimpleLineSymbol, FeatureTable, Color) {
    "use strict";
    var Popup = (function () {
        function Popup(view) {
            this.view = view;
            this.options = {
                hightLength: 100
            };
            var url = config.tables.find(function (f) {
                return f.id === constName.THOI_GIAN_SAN_XUAT_TRONG_TROT;
            }).url;
            this.thoiGianSanXuatTrongTrot = new FeatureTable({ url: url, fieldID: 'MaDoiTuong' });
            this.popupEdit = new PopupEdit(view, {
                hightLength: this.options.hightLength,
                table: this.thoiGianSanXuatTrongTrot
            });
            this.tblGiaiDoanSinhTruong = new FeatureTable({
                url: config.tables.find(function (f) { return f.id === constName.TBL_GIAI_DOAN_SINH_TRUONG; }).url,
                fieldID: 'OBJECTID'
            });
            this.hightlightGraphic = new HightlightGraphic(view, {
                symbolMarker: new SimpleMarkerSymbol({
                    outline: new SimpleLineSymbol({
                        color: new Color('#7EABCD'),
                        width: 2
                    })
                }),
                symbolFill: new SimpleFillSymbol({
                    outline: new SimpleLineSymbol({
                        color: new Color('#7EABCD'),
                        width: 2
                    })
                })
            });
        }
        Popup.prototype.startup = function () {
            var _this = this;
            this.view.map.layers.map(function (layer) {
                layer.then(function () {
                    if (layer.type == 'feature') {
                        var actions = [];
                        if (layer.permission.edit) {
                            actions.push({
                                id: "update",
                                title: "Cập nhật",
                                className: "esri-icon-edit",
                                layer: layer
                            });
                            actions.push({
                                id: "update-geometry",
                                title: "Cập nhật vị trí",
                                className: "esri-icon-locate",
                                layer: layer
                            });
                        }
                        if (layer.permission["delete"])
                            actions.push({
                                id: "delete",
                                title: "Xóa",
                                className: "esri-icon-erase",
                                layer: layer
                            });
                        if (layer.id === constName.TRONGTROT) {
                            if (location.pathname !== '/cattachthua')
                                actions.push({
                                    id: "view-detail",
                                    title: "Chi tiết thời gian trồng trọt",
                                    className: "esri-icon-table",
                                    layer: layer
                                });
                            if (location.pathname !== '/congtacvien') {
                                actions.push({
                                    id: "split",
                                    title: "Chia thửa",
                                    className: "esri-icon-zoom-out-fixed",
                                    layer: layer
                                });
                                actions.push({
                                    id: "merge",
                                    title: "Ghép thửa",
                                    className: "esri-icon-zoom-in-fixed",
                                    layer: layer
                                });
                            }
                        }
                        layer.popupTemplate = {
                            content: function (target) {
                                var content = _this.contentPopup(target, layer);
                                return content;
                            },
                            title: layer.title,
                            actions: actions
                        };
                    }
                });
            });
            this.view.popup.watch('visible', function (newValue) {
                if (!newValue)
                    _this.hightlightGraphic.clear();
            });
            this.view.popup.on("trigger-action", function (evt) {
                _this.triggerActionHandler(evt);
            });
            this.view.popup.dockOptions = {
                buttonEnabled: true,
                breakpoint: {
                    width: 600,
                    height: 1000
                },
                position: 'bottom-center'
            };
        };
        Object.defineProperty(Popup.prototype, "selectFeature", {
            get: function () {
                return this.view.popup.viewModel.selectedFeature;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Popup.prototype, "layer", {
            get: function () {
                return this.selectFeature.layer;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Popup.prototype, "attributes", {
            get: function () {
                return this.selectFeature.attributes;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Popup.prototype, "objectId", {
            get: function () {
                return this.attributes['OBJECTID'];
            },
            enumerable: true,
            configurable: true
        });
        Popup.prototype.triggerActionHandler = function (event) {
            var actionId = event.action.id;
            var layer = this.layer || event.action.layer;
            this.popupEdit.layer = layer;
            var fail = false;
            switch (actionId) {
                case "update":
                    if (layer.permission && layer.permission.edit) {
                        if (event.action.className === 'esri-icon-check-mark') {
                            this.popupEdit.editFeature();
                        }
                        else {
                            this.popupEdit.showEdit();
                        }
                    }
                    else {
                        fail = true;
                    }
                    break;
                case "delete":
                    if (layer.permission && layer.permission["delete"]) {
                        this.popupEdit.deleteFeature();
                    }
                    else {
                        fail = true;
                    }
                    break;
                case "view-detail":
                    if (this.attributes['MaDoiTuong'])
                        this.triggerActionViewDetailTrongtrot(this.attributes['MaDoiTuong']);
                    else
                        $.notify({
                            message: 'Không xác được định danh'
                        }, {
                            type: 'danger'
                        });
                    break;
                case "view-detail-edit":
                    if (this.attributes['MaDoiTuong'])
                        this.popupEdit.showTableDetailTrongTrot();
                    else
                        $.notify({
                            message: 'Không xác được định danh'
                        }, {
                            type: 'danger'
                        });
                    break;
                case "update-geometry":
                    if (layer.geometryType === 'polygon') {
                        alert('Không thể thay đổi vị trí vùng...');
                        break;
                    }
                    this.popupEdit.updateGeometryGPS();
                    break;
                case "split":
                    this.popupEdit.splitPolygon();
                    break;
                case "merge":
                    this.popupEdit.mergePolygon();
                    break;
                default:
                    break;
            }
            if (fail) {
                $.notify({
                    message: 'Không có quyền thực hiện tác vụ'
                }, {
                    type: 'danger'
                });
            }
        };
        Popup.prototype.getSubtype = function (name, value) {
            name = name || this.layer.typeIdField;
            value = value || this.attributes[name];
            if (this.tblGiaiDoanSinhTruong.typeIdField === name) {
                var typeIdField = this.tblGiaiDoanSinhTruong.typeIdField, subtypes = this.tblGiaiDoanSinhTruong.types, subtype = subtypes.find(function (f) { return f.id == value; });
                return subtype;
            }
            return null;
        };
        Popup.prototype.renderDomain = function (domain, name) {
            var codedValues;
            if (domain.type === "inherited") {
                var fieldDomain = this.layer.getFieldDomain(name);
                if (fieldDomain)
                    codedValues = fieldDomain.codedValues;
            }
            else {
                codedValues = domain.codedValues;
            }
            return codedValues;
        };
        Popup.prototype.contentPopup = function (target, featureLayer) {
            return __awaiter(this, void 0, void 0, function () {
                var _this = this;
                var graphic, layer_1, attributes_1, div, table, subtype, _loop_1, this_1, txtArea, _i, _a, field, err_1;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _b.trys.push([0, 5, , 6]);
                            graphic = target.graphic, layer_1 = graphic.layer || featureLayer, attributes_1 = graphic.attributes;
                            if (!graphic.layer)
                                graphic.layer = layer_1;
                            this.hightlightGraphic.clear();
                            this.hightlightGraphic.add(graphic);
                            div = domConstruct.create('div', {
                                "class": 'popup-content',
                                id: 'popup-content'
                            }), table = domConstruct.create('table', {}, div);
                            subtype = this.getSubtype();
                            _loop_1 = function (field) {
                                var value, row, tdName, input, content, formatString, codedValues, codeValue, location_1, tdValue;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            value = attributes_1[field.name];
                                            if (field.type === 'oid')
                                                return [2, "continue"];
                                            row = domConstruct.create('tr');
                                            tdName = domConstruct.create('td', {
                                                innerHTML: field.alias
                                            }), input = void 0, content = void 0, formatString = void 0;
                                            codedValues = void 0;
                                            if (subtype && subtype.domains[field.name]) {
                                                codedValues = this_1.renderDomain(subtype.domains[field.name], field.name);
                                            }
                                            else if (field.domain) {
                                                codedValues = this_1.renderDomain(field.domain, field.name);
                                            }
                                            if (!codedValues) return [3, 1];
                                            codeValue = codedValues.find(function (f) {
                                                return f.code === value;
                                            });
                                            if (codeValue)
                                                value = codeValue.name;
                                            return [3, 4];
                                        case 1:
                                            if (!((field.name === 'MaPhuongXa' || field.name === 'MaHuyenTP') && attributes_1[field.name])) return [3, 3];
                                            return [4, editingSupport.getLocationName(this_1.view, {
                                                    PhuongXa: attributes_1['MaPhuongXa'],
                                                    HuyenTP: attributes_1['MaHuyenTP']
                                                }).then(function (res) { return __awaiter(_this, void 0, void 0, function () {
                                                    return __generator(this, function (_a) {
                                                        switch (_a.label) {
                                                            case 0: return [4, res];
                                                            case 1: return [2, _a.sent()];
                                                        }
                                                    });
                                                }); })];
                                        case 2:
                                            location_1 = _a.sent();
                                            value = field.name == 'MaPhuongXa' ? location_1['TenPhuong'] : location_1['TenHuyen'];
                                            return [3, 4];
                                        case 3:
                                            if (field.type === "small-integer" ||
                                                (field.type === "integer") ||
                                                (field.type === "double")) {
                                            }
                                            else if (field.type === 'date') {
                                                formatString = 'DateFormat';
                                            }
                                            _a.label = 4;
                                        case 4:
                                            if (formatString) {
                                                content = "{" + field.name + ":" + formatString + "}";
                                            }
                                            else {
                                                content = value;
                                            }
                                            tdValue = domConstruct.create('td');
                                            txtArea = null;
                                            if (field.length >= this_1.options.hightLength) {
                                                txtArea = domConstruct.create('textarea', {
                                                    rows: 5,
                                                    cols: 25,
                                                    readonly: true,
                                                    innerHTML: content,
                                                    style: 'background: transparent;border:none'
                                                }, tdValue);
                                            }
                                            else {
                                                tdValue.innerHTML = content;
                                            }
                                            domConstruct.place(tdName, row);
                                            domConstruct.place(tdValue, row);
                                            domConstruct.place(row, table);
                                            return [2];
                                    }
                                });
                            };
                            this_1 = this;
                            _i = 0, _a = layer_1.fields;
                            _b.label = 1;
                        case 1:
                            if (!(_i < _a.length)) return [3, 4];
                            field = _a[_i];
                            return [5, _loop_1(field)];
                        case 2:
                            _b.sent();
                            _b.label = 3;
                        case 3:
                            _i++;
                            return [3, 1];
                        case 4:
                            if (layer_1.hasAttachments) {
                                layer_1.getAttachments(attributes_1['OBJECTID']).then(function (res) {
                                    if (res && res.attachmentInfos && res.attachmentInfos.length > 0) {
                                        var div_1 = domConstruct.create('div', {
                                            "class": 'attachment-container'
                                        }, document.getElementById('popup-content'));
                                        domConstruct.create('legend', {
                                            innerHTML: 'Hình ảnh'
                                        }, div_1);
                                        var url = layer_1.url + "/" + layer_1.layerId + "/" + attributes_1['OBJECTID'];
                                        var _loop_2 = function (item) {
                                            var itemDiv = domConstruct.create('div', {
                                                "class": 'col-lg-3 col-md-4 col-xs-6 thumb'
                                            }, div_1);
                                            var itemA = domConstruct.create('a', {
                                                "class": "thumbnail",
                                                href: "javascript:void(0)"
                                            }, itemDiv);
                                            var img = domConstruct.create('img', {
                                                "class": 'img-responsive',
                                                id: url + "/attachments/" + item.id,
                                                src: url + "/attachments/" + item.id,
                                                alt: url + "/attachments/" + item.name
                                            }, itemA);
                                            on(itemA, 'click', function () {
                                                var modal = bootstrap.modal("attachments-" + item.id, item.name, img.cloneNode(true));
                                                if (modal)
                                                    modal.modal();
                                            });
                                        };
                                        for (var _i = 0, _a = res.attachmentInfos; _i < _a.length; _i++) {
                                            var item = _a[_i];
                                            _loop_2(item);
                                        }
                                    }
                                });
                            }
                            return [2, div.outerHTML];
                        case 5:
                            err_1 = _b.sent();
                            throw err_1;
                        case 6: return [2];
                    }
                });
            });
        };
        Popup.prototype.triggerActionViewDetailTrongtrot = function (maDoiTuong) {
            var _this = this;
            var notify = $.notify({
                title: 'Thời gian trồng trọt thửa đất: ' + maDoiTuong,
                message: 'Đang truy vấn...'
            }, {
                delay: 20000,
                showProgressbar: true
            });
            this.thoiGianSanXuatTrongTrot.findById(maDoiTuong).then(function (results) {
                if (results.features.length > 0) {
                    notify.update('message', "T\u00ECm th\u1EA5y " + results.features.length + " d\u1EEF li\u1EC7u");
                    notify.update('progress', 100);
                    notify.update('type', 'success');
                    var table = document.createElement('table');
                    table.classList.add('table', 'table-hover');
                    var thead = document.createElement('thead');
                    thead.innerHTML =
                        "<tr>\n              <th>Nh\u00F3m c\u00E2y tr\u1ED3ng</th>\n              <th>Lo\u1EA1i c\u00E2y tr\u1ED3ng</th>\n              <th>Di\u1EC7n t\u00EDch</th>\n              <th>Th\u1EDDi gian b\u1EAFt \u0111\u1EA7u tr\u1ED3ng</th>\n              <th>Th\u1EDDi gian tr\u1ED3ng tr\u1ECDt</th>\n              <th>Giai \u0111o\u1EA1n sinh tr\u01B0\u1EDFng</th>\n            </tr>\n            </thead>";
                    domConstruct.place(thead, table);
                    table.appendChild(thead);
                    var tbody = document.createElement('tbody');
                    table.appendChild(tbody);
                    var features = results.features.sort(function (f1, f2) {
                        var a = f1.attributes, b = f2.attributes;
                        if (a['Nam'] == b['Nam'])
                            return a['Thang'] > b['Thang'];
                        else
                            return a['Nam'] > b['Nam'];
                    });
                    var _loop_3 = function (feature) {
                        var item = feature.attributes;
                        var row = document.createElement('tr');
                        row.classList.add("Info");
                        tbody.appendChild(row);
                        var tdNCT = document.createElement('td');
                        var NCTcodedValues = _this.layer.getFieldDomain('NhomCayTrong').codedValues;
                        if (NCTcodedValues) {
                            var codeValue = NCTcodedValues.find(function (f) {
                                return f.code == item['NhomCayTrong'];
                            });
                            if (codeValue)
                                tdNCT.innerText = codeValue.name;
                        }
                        if (!tdNCT.innerText)
                            tdNCT.innerText = item['NhomCayTrong'] + "" || '';
                        var tdLCT = document.createElement('td');
                        var subtype = _this.getSubtype('NhomCayTrong', item['NhomCayTrong']);
                        if (!subtype)
                            return { value: void 0 };
                        var domain = subtype.domains['LoaiCayTrong'];
                        if (domain) {
                            var LCTcodedValues = void 0;
                            if (domain.type === "inherited") {
                                var fieldDomain = _this.layer.getFieldDomain('LoaiCayTrong');
                                if (fieldDomain)
                                    LCTcodedValues = fieldDomain.codedValues;
                            }
                            else {
                                LCTcodedValues = domain.codedValues;
                            }
                            if (LCTcodedValues) {
                                var codeValue = LCTcodedValues.find(function (f) {
                                    return f.code == item['LoaiCayTrong'];
                                });
                                if (codeValue)
                                    tdLCT.innerText = codeValue.name;
                            }
                        }
                        if (!tdLCT.innerText)
                            tdLCT.innerText = item['LoaiCayTrong'] || '';
                        var tdArea = document.createElement('td');
                        tdArea.innerText = item['DienTich'] + "" || '0';
                        var tdTGBDT = document.createElement('td');
                        if (item.ThoiGianBatDauTrong) {
                            var dtTGBDT = new Date(item.ThoiGianBatDauTrong);
                            tdTGBDT.innerText = dtTGBDT.getDate() + "/" + (dtTGBDT.getMonth() + 1) + "/" + dtTGBDT.getFullYear();
                        }
                        var tdTGTT = document.createElement('td');
                        if (item.ThoiGianTrongTrot) {
                            var dtTGTT = new Date(item.ThoiGianTrongTrot);
                            tdTGTT.innerText = dtTGTT.getDate() + "/" + (dtTGTT.getMonth() + 1) + "/" + dtTGTT.getFullYear();
                        }
                        var tdGDST = document.createElement('td');
                        tdGDST.innerText = item.GiaiDoanSinhTruong;
                        row.appendChild(tdNCT);
                        row.appendChild(tdLCT);
                        row.appendChild(tdArea);
                        row.appendChild(tdTGBDT);
                        row.appendChild(tdTGTT);
                        row.appendChild(tdGDST);
                    };
                    for (var _i = 0, features_1 = features; _i < features_1.length; _i++) {
                        var feature = features_1[_i];
                        var state_1 = _loop_3(feature);
                        if (typeof state_1 === "object")
                            return state_1.value;
                    }
                    var modal = bootstrap.modal('ttModal', 'Thời gian trồng trọt', table);
                    modal.modal();
                }
                else {
                    notify.update('type', 'danger');
                    notify.update('message', 'Không tìm thấy dữ liệu');
                    notify.update('progress', 100);
                }
            });
        };
        return Popup;
    }());
    return Popup;
});
