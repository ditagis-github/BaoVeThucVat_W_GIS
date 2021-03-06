var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "../classes/ConstName", "../config", "dojo/on", "dojo/dom-construct", "./Popup/PopupEdit", "../support/HightlightGraphic", "../support/Editing", "../toolview/Bootstrap", "esri/symbols/SimpleMarkerSymbol", "esri/symbols/SimpleFillSymbol", "esri/symbols/SimpleLineSymbol", "../support/FeatureTable", "esri/Color"], function (require, exports, constName, config, on, domConstruct, PopupEdit, HightlightGraphic, editingSupport, bootstrap, SimpleMarkerSymbol, SimpleFillSymbol, SimpleLineSymbol, FeatureTable, Color) {
    "use strict";
    class Popup {
        constructor(view) {
            this.view = view;
            this.options = {
                hightLength: 100
            };
            this.thoiGianSanXuatTrongTrot = new FeatureTable({
                url: config.tables.find((f) => {
                    return f.id === constName.THOI_GIAN_SAN_XUAT_TRONG_TROT;
                }).url,
                fieldID: 'MaDoiTuong'
            });
            this.popupEdit = new PopupEdit(view, {
                hightLength: this.options.hightLength,
                table: this.thoiGianSanXuatTrongTrot
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
        startup() {
            this.view.map.layers.forEach((layer) => {
                layer.then(() => {
                    if (layer.type == 'feature') {
                        let actions = [];
                        let permission = layer.permission;
                        if (permission.edit) {
                            actions.push({
                                id: "showedits",
                                title: "Chỉnh sửa",
                                className: "esri-icon-edit",
                                layer: layer,
                                visible: true
                            });
                            actions.push({
                                id: "editfeature",
                                title: "Cập nhật",
                                className: "esri-icon-check-mark",
                                layer: layer,
                                visible: false
                            });
                            if (layer.geometryType === 'point')
                                actions.push({
                                    id: "update-geometry",
                                    title: "Cập nhật vị trí",
                                    className: "esri-icon-locate",
                                    layer: layer
                                });
                        }
                        if (permission.delete)
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
                            content: (target) => {
                                let content = this.contentPopup(target, layer);
                                return content;
                            },
                            title: layer.title,
                            actions: actions
                        };
                    }
                });
            });
            this.view.popup.watch('visible', (newValue) => {
                if (!newValue)
                    this.hightlightGraphic.clear();
            });
            this.view.popup.on("trigger-action", (evt) => {
                this.triggerActionHandler(evt);
            });
            this.view.popup.dockOptions = {
                buttonEnabled: true,
                breakpoint: {
                    width: 600,
                    height: 1000
                },
                position: 'bottom-center'
            };
        }
        restartUpdateAction() {
            let showeditsAction = this.view.popup.actions.find(function (action) {
                return action.id === 'showedits';
            });
            let editFeatureAction = this.view.popup.actions.find(function (action) {
                return action.id === 'editfeature';
            });
            showeditsAction.visible = true;
            editFeatureAction.visible = false;
            if (showeditsAction.visible) {
                let viewDetailEditAction = this.view.popup.actions.find(function (action) {
                    return action.id === 'view-detail-edit';
                });
                if (viewDetailEditAction) {
                    viewDetailEditAction.id = 'view-detail';
                }
            }
        }
        get selectFeature() {
            return this.view.popup.viewModel.selectedFeature;
        }
        get layer() {
            return this.selectFeature.layer;
        }
        get attributes() {
            return this.selectFeature.attributes;
        }
        get objectId() {
            return this.attributes['OBJECTID'];
        }
        triggerActionHandler(event) {
            let actionId = event.action.id;
            let layer = this.layer || event.action.layer;
            this.popupEdit.layer = layer;
            let fail = false;
            switch (actionId) {
                case "showedits":
                    if (layer.permission && layer.permission.edit) {
                        this.popupEdit.showEdit();
                    }
                    else {
                        fail = true;
                    }
                    break;
                case "editfeature":
                    if (layer.permission && layer.permission.edit) {
                        this.popupEdit.editFeature();
                    }
                    else {
                        fail = true;
                    }
                    break;
                case "delete":
                    if (layer.permission && layer.permission.delete) {
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
        }
        getSubtype(name, value) {
            name = name || this.layer.typeIdField;
            value = value || this.attributes[name];
            if (this.thoiGianSanXuatTrongTrot.typeIdField === name) {
                const subtypes = this.thoiGianSanXuatTrongTrot.types, subtype = subtypes.find(f => f.id == value);
                return subtype;
            }
            return null;
        }
        renderDomain(domain, name) {
            let codedValues;
            if (domain.type === "inherited") {
                let fieldDomain = this.layer.getFieldDomain(name);
                if (fieldDomain)
                    codedValues = fieldDomain.codedValues;
            }
            else {
                codedValues = domain.codedValues;
            }
            return codedValues;
        }
        contentPopup(target, featureLayer) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    this.restartUpdateAction();
                    const graphic = target.graphic, layer = graphic.layer || featureLayer, attributes = graphic.attributes;
                    if (!graphic.layer)
                        graphic.layer = layer;
                    this.hightlightGraphic.clear();
                    this.hightlightGraphic.add(graphic);
                    let div = domConstruct.create('div', {
                        class: 'popup-content',
                        id: 'popup-content'
                    }), table = domConstruct.create('table', {}, div);
                    let subtype = this.getSubtype();
                    for (let field of layer.fields) {
                        let value = attributes[field.name];
                        if (field.type === 'oid')
                            continue;
                        let row = domConstruct.create('tr');
                        let tdName = domConstruct.create('td', {
                            innerHTML: field.alias
                        }), input, content, formatString;
                        let codedValues;
                        if (subtype && subtype.domains[field.name]) {
                            codedValues = this.renderDomain(subtype.domains[field.name], field.name);
                        }
                        else if (field.domain) {
                            codedValues = this.renderDomain(field.domain, field.name);
                        }
                        if (codedValues) {
                            let codeValue = codedValues.find(f => {
                                return f.code === value;
                            });
                            if (codeValue)
                                value = codeValue.name;
                        }
                        else if ((field.name === 'MaPhuongXa' || field.name === 'MaHuyenTP') && attributes[field.name]) {
                            let location = yield editingSupport.getLocationName(this.view, {
                                PhuongXa: attributes['MaPhuongXa'],
                                HuyenTP: attributes['MaHuyenTP']
                            }).then((res) => __awaiter(this, void 0, void 0, function* () {
                                return yield res;
                            }));
                            value = field.name == 'MaPhuongXa' ? location['TenPhuong'] : location['TenHuyen'];
                        }
                        else {
                            if (field.type === "small-integer" ||
                                (field.type === "integer") ||
                                (field.type === "double")) {
                            }
                            else if (field.type === 'date') {
                                formatString = 'DateFormat';
                            }
                        }
                        if (formatString) {
                            content = `{${field.name}:${formatString}}`;
                        }
                        else {
                            content = value;
                        }
                        let tdValue = domConstruct.create('td');
                        var txtArea = null;
                        if (field.length >= this.options.hightLength) {
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
                    }
                    if (layer.hasAttachments) {
                        layer.getAttachments(attributes['OBJECTID']).then(res => {
                            if (res && res.attachmentInfos && res.attachmentInfos.length > 0) {
                                let div = domConstruct.create('div', {
                                    class: 'attachment-container'
                                }, document.getElementById('popup-content'));
                                domConstruct.create('legend', {
                                    innerHTML: 'Hình ảnh'
                                }, div);
                                let url = `${layer.url}/${layer.layerId}/${attributes['OBJECTID']}`;
                                for (let item of res.attachmentInfos) {
                                    let itemDiv = domConstruct.create('div', {
                                        class: 'col-lg-3 col-md-4 col-xs-6 thumb'
                                    }, div);
                                    let itemA = domConstruct.create('a', {
                                        class: "thumbnail",
                                        href: "javascript:void(0)",
                                    }, itemDiv);
                                    let img = domConstruct.create('img', {
                                        class: 'img-responsive',
                                        id: `${url}/attachments/${item.id}`,
                                        src: `${url}/attachments/${item.id}`,
                                        alt: `${url}/attachments/${item.name}`,
                                    }, itemA);
                                    on(itemA, 'click', () => {
                                        let modal = bootstrap.modal(`attachments-${item.id}`, item.name, img.cloneNode(true));
                                        if (modal)
                                            modal.modal();
                                    });
                                }
                            }
                        });
                    }
                    return div.outerHTML;
                }
                catch (err) {
                    throw err;
                }
            });
        }
        triggerActionViewDetailTrongtrot(maDoiTuong) {
            let notify = $.notify({
                title: 'Thời gian trồng trọt thửa đất: ' + maDoiTuong,
                message: 'Đang truy vấn...'
            }, {
                delay: 20000,
                showProgressbar: true
            });
            this.thoiGianSanXuatTrongTrot.findById(maDoiTuong).then(results => {
                if (results.features.length > 0) {
                    notify.update('message', `Tìm thấy ${results.features.length} dữ liệu`);
                    notify.update('progress', 100);
                    notify.update('type', 'success');
                    let table = document.createElement('table');
                    table.classList.add('table', 'table-hover');
                    let thead = document.createElement('thead');
                    thead.innerHTML =
                        `<tr>
              <th>Nhóm cây trồng</th>
              <th>Loại cây trồng</th>
              <th>Diện tích</th>
              <th>Thời gian bắt đầu trồng</th>
              <th>Thời gian trồng trọt</th>
              <th>Giai đoạn sinh trưởng</th>
            </tr>
            </thead>`;
                    domConstruct.place(thead, table);
                    table.appendChild(thead);
                    let tbody = document.createElement('tbody');
                    table.appendChild(tbody);
                    let features = results.features.sort(function (f1, f2) {
                        let a = f1.attributes, b = f2.attributes;
                        if (a['Nam'] == b['Nam'])
                            return a['Thang'] > b['Thang'];
                        else
                            return a['Nam'] > b['Nam'];
                    });
                    for (let feature of features) {
                        const item = feature.attributes;
                        let row = document.createElement('tr');
                        row.classList.add("Info");
                        tbody.appendChild(row);
                        let tdNCT = document.createElement('td');
                        let NCTcodedValues = this.layer.getFieldDomain('NhomCayTrong').codedValues;
                        if (NCTcodedValues) {
                            let codeValue = NCTcodedValues.find(f => {
                                return f.code == item['NhomCayTrong'];
                            });
                            if (codeValue)
                                tdNCT.innerText = codeValue.name;
                        }
                        if (!tdNCT.innerText)
                            tdNCT.innerText = item['NhomCayTrong'] + "" || '';
                        let tdLCT = document.createElement('td');
                        if (item['NhomCayTrong']) {
                            let subtype = this.getSubtype('NhomCayTrong', item['NhomCayTrong']);
                            if (subtype) {
                                let domain = subtype.domains['LoaiCayTrong'];
                                if (domain) {
                                    let LCTcodedValues;
                                    if (domain.type === "inherited") {
                                        let fieldDomain = this.layer.getFieldDomain('LoaiCayTrong');
                                        if (fieldDomain)
                                            LCTcodedValues = fieldDomain.codedValues;
                                    }
                                    else {
                                        LCTcodedValues = domain.codedValues;
                                    }
                                    if (LCTcodedValues) {
                                        let codeValue = LCTcodedValues.find(f => {
                                            return f.code == item['LoaiCayTrong'];
                                        });
                                        if (codeValue)
                                            tdLCT.innerText = codeValue.name;
                                    }
                                }
                            }
                        }
                        if (!tdLCT.innerText)
                            tdLCT.innerText = item['LoaiCayTrong'] || '';
                        let tdArea = document.createElement('td');
                        tdArea.innerText = item['DienTich'] + "" || '0';
                        let tdTGBDT = document.createElement('td');
                        if (item.ThoiGianBatDauTrong) {
                            let dtTGBDT = new Date(item.ThoiGianBatDauTrong);
                            tdTGBDT.innerText = `${dtTGBDT.getDate()}/${dtTGBDT.getMonth() + 1}/${dtTGBDT.getFullYear()}`;
                        }
                        let tdTGTT = document.createElement('td');
                        if (item.ThoiGianTrongTrot) {
                            let dtTGTT = new Date(item.ThoiGianTrongTrot);
                            tdTGTT.innerText = `${dtTGTT.getDate()}/${dtTGTT.getMonth() + 1}/${dtTGTT.getFullYear()}`;
                        }
                        let tdGDST = document.createElement('td');
                        tdGDST.innerText = item.GiaiDoanSinhTruong;
                        row.appendChild(tdNCT);
                        row.appendChild(tdLCT);
                        row.appendChild(tdArea);
                        row.appendChild(tdTGBDT);
                        row.appendChild(tdTGTT);
                        row.appendChild(tdGDST);
                    }
                    let modal = bootstrap.modal('ttModal', 'Thời gian trồng trọt', table);
                    modal.modal();
                }
                else {
                    notify.update('type', 'danger');
                    notify.update('message', 'Không tìm thấy dữ liệu');
                    notify.update('progress', 100);
                }
            });
        }
    }
    return Popup;
});
