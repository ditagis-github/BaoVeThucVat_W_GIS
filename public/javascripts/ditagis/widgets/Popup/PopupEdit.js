define(["require", "exports", "../../classes/ConstName", "../../config", "dojo/on", "dojo/dom-construct", "esri/request", "esri/core/watchUtils", "esri/widgets/Locate/LocateViewModel", "../../support/Editing", "./ThoiGianSanXuatTrongTrotPopup", "../../support/FeatureTable", "../SplitPolygon", "../MergePolygon"], function (require, exports, constName, config, on, domConstruct, esriRequest, watchUtils, LocateViewModel, editingSupport, ThoiGianSanXuatTrongTrotPopup, FeatureTable, SplitPolygon, MergePolygon) {
    "use strict";
    var PopupEdit = (function () {
        function PopupEdit(view, options) {
            var _this = this;
            this.view = view;
            this.options = options;
            this.locateViewModel = new LocateViewModel({
                view: view,
                graphic: null
            });
            this.tblGiaiDoanSinhTruong = new FeatureTable({
                url: config.tables.find(function (f) { return f.id === constName.TBL_GIAI_DOAN_SINH_TRUONG; }).url,
                fieldID: 'OBJECTID'
            });
            this.fireFields = ['NgayCapNhat', 'NguoiCapNhat', 'MaPhuongXa', 'MaHuyenTP', 'MaDoiTuong'];
            this.inputElement = {};
            this.thoiGianSanXuatTrongTrotPopup = new ThoiGianSanXuatTrongTrotPopup({ view: view, table: options.table });
            this.thoiGianSanXuatTrongTrotTbl = options.table;
            if (location.pathname !== '/congtacvien') {
                this._splitPolygon = new SplitPolygon(view);
                this.view.on('layerview-create', function (e) {
                    if (e.layer.id === constName.TRONGTROT) {
                        _this._mergePolygon = new MergePolygon({ view: view, layer: e.layer });
                    }
                });
            }
        }
        Object.defineProperty(PopupEdit.prototype, "selectFeature", {
            get: function () {
                return this.view.popup.viewModel.selectedFeature;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PopupEdit.prototype, "layer", {
            get: function () {
                return this.selectFeature.layer || this._layer;
            },
            set: function (value) {
                if (this.selectFeature.layer)
                    return;
                this._layer = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PopupEdit.prototype, "attributes", {
            get: function () {
                return this.selectFeature.attributes;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PopupEdit.prototype, "objectId", {
            get: function () {
                return this.attributes['OBJECTID'];
            },
            enumerable: true,
            configurable: true
        });
        PopupEdit.prototype.resetInputElement = function () {
            this.inputElement = {};
        };
        PopupEdit.prototype.isFireField = function (fieldName) {
            return this.fireFields.indexOf(fieldName) !== -1;
        };
        PopupEdit.prototype.getSubtype = function (name, value) {
            name = name || this.layer.typeIdField;
            value = value || this.attributes[name];
            if (this.tblGiaiDoanSinhTruong.typeIdField === name) {
                var typeIdField = this.tblGiaiDoanSinhTruong.typeIdField, subtypes = this.tblGiaiDoanSinhTruong.types, subtype = subtypes.find(function (f) { return f.id == value; });
                return subtype;
            }
            return null;
        };
        PopupEdit.prototype.renderDomain = function (domain, name) {
            var codedValues;
            if (domain.type === "inherited") {
                var fieldDomain = this.layer.getFieldDomain(name);
                if (fieldDomain)
                    codedValues = fieldDomain.codedValues;
            }
            else {
                codedValues = domain.codedValues;
            }
            if (!codedValues)
                return null;
            var currentValue = this.attributes[name];
            var input = document.createElement('select');
            input.classList.add('form-control');
            var defaultComboValue = document.createElement('option');
            defaultComboValue.value = "-1";
            defaultComboValue.innerText = 'Chọn giá trị...';
            input.appendChild(defaultComboValue);
            for (var _i = 0, codedValues_1 = codedValues; _i < codedValues_1.length; _i++) {
                var codedValue = codedValues_1[_i];
                var dmCode = codedValue.code, dmName = codedValue.name;
                var option = document.createElement('option');
                option.setAttribute('value', dmCode);
                if (currentValue === dmCode) {
                    option.selected = true;
                }
                option.innerHTML = dmName;
                input.appendChild(option);
            }
            return input;
        };
        PopupEdit.prototype.showEdit = function () {
            var _this = this;
            var subtype = this.getSubtype();
            this.resetInputElement();
            var div = domConstruct.create('div', {
                id: 'show-edit-container',
                "class": 'popup-content'
            });
            var table = domConstruct.create('table', {
                "class": "table"
            }, div);
            for (var _i = 0, _a = this.layer.fields; _i < _a.length; _i++) {
                var field = _a[_i];
                if (field.type === 'oid' || this.isFireField(field.name))
                    continue;
                var row = domConstruct.create('tr');
                var tdName = domConstruct.create('td', {
                    innerHTML: field.alias
                }), input = void 0, tdValue = domConstruct.create('td');
                if (subtype && subtype.domains[field.name]) {
                    input = this.renderDomain(subtype.domains[field.name], field.name);
                }
                else if (field.domain) {
                    input = this.renderDomain(field.domain, field.name);
                }
                else {
                    var inputType = void 0, value = void 0;
                    if (field.type === "small-integer" ||
                        (field.type === "integer") ||
                        (field.type === "double"))
                        inputType = 'number';
                    else if (field.type === 'date') {
                        inputType = 'date';
                        var d = new Date(this.attributes[field.name]), date = d.getDate(), month = d.getMonth() + 1, year = d.getFullYear();
                        if (date / 10 < 1)
                            date = '0' + date;
                        if (month / 10 < 1)
                            month = '0' + month;
                        value = year + "-" + month + "-" + date;
                    }
                    else {
                        inputType = 'text';
                    }
                    if (length >= this.options.hightLength) {
                        input = domConstruct.create('textarea', {
                            rows: 5,
                            cols: 25,
                            "class": "form-control",
                            innerHTML: value || this.attributes[field.name],
                            value: value || this.attributes[field.name]
                        });
                    }
                    else {
                        input = domConstruct.create('input', {
                            type: inputType,
                            value: value || this.attributes[field.name],
                            "class": "form-control"
                        });
                    }
                }
                input.name = field.name;
                domConstruct.place(input, tdValue);
                domConstruct.place(tdName, row);
                domConstruct.place(tdValue, row);
                domConstruct.place(row, table);
                this.inputElement[field.name] = input;
                this.registerChangeEvent(input);
            }
            if (this.layer.hasAttachments) {
                this.layer.getAttachments(this.objectId).then(function (res) {
                    var div = domConstruct.create('div', {
                        "class": 'attachment-header',
                        id: "attachment-" + _this.layer.id + "-" + _this.attributes['OBJECTID']
                    }, document.getElementById('show-edit-container'));
                    div.innerText = "Hình ảnh";
                    var form = document.createElement('form');
                    form.id = 'attachment-data';
                    form.enctype = 'multipart/form-data';
                    form.method = 'post';
                    var file = document.createElement('input');
                    file.type = 'file';
                    file.name = 'attachment';
                    form.appendChild(file);
                    var hideField = document.createElement('input');
                    hideField.hidden = true;
                    hideField.name = 'f';
                    hideField.value = 'json';
                    form.appendChild(hideField);
                    div.appendChild(form);
                    _this.registerChangeEvent(file);
                    if (res && res.attachmentInfos && res.attachmentInfos.length > 0) {
                        for (var _i = 0, _a = res.attachmentInfos; _i < _a.length; _i++) {
                            var item = _a[_i];
                            _this.renderAttachmentEditPopup(item, {
                                container: div
                            });
                        }
                    }
                });
            }
            for (var key in this.inputElement) {
                this.inputChangeHandler(this.inputElement[key]);
            }
            this.view.popup.content = div;
            this.view.popup.title = this.layer.title;
            var updateAction = this.view.popup.actions.find(function (action) {
                return action.id === 'update';
            });
            updateAction.className = 'esri-icon-check-mark';
            this.view.popup.actions.add({
                id: 'update-geometry',
                title: 'Cập nhật vị trí đối tượng',
                className: 'esri-icon-locate'
            });
            var viewDetailAction = this.view.popup.actions.find(function (action) {
                return action.id === 'view-detail';
            });
            if (this.layer.id === constName.TRONGTROT && viewDetailAction) {
                viewDetailAction.id = 'view-detail-edit';
            }
            var watchFunc = function () {
                updateAction.className = 'esri-icon-edit';
                var action = _this.view.popup.actions.find(function (f) {
                    return f.id === 'update-geometry';
                });
                if (action)
                    _this.view.popup.actions.remove(action);
                if (_this.layer.id === constName.TRONGTROT && viewDetailAction)
                    viewDetailAction.id = 'view-detail';
            };
            watchUtils.once(this.view.popup, 'selectedFeature').then(watchFunc);
            watchUtils.once(this.view.popup, 'visible').then(watchFunc);
        };
        PopupEdit.prototype.renderAttachmentEditPopup = function (item, props) {
            var _this = this;
            var container = props.container || document.getElementById("attachment-" + this.layer.id + "-" + this.attributes['OBJECTID']);
            var url = this.layer.url + "/" + this.layer.layerId + "/" + this.attributes['OBJECTID'];
            var itemDiv = domConstruct.create('div', {
                "class": 'attachment-item'
            }, container);
            var itemName = domConstruct.create('div', {
                "class": 'attachment-name'
            }, itemDiv);
            var aItemName = domConstruct.create('a', {
                href: url + "/attachments/" + item.id,
                target: '_blank'
            }, itemName);
            aItemName.innerText = item.name;
            var itemDelete = domConstruct.create('div', {
                "class": 'delete-attachment esri-icon-trash'
            }, itemDiv);
            on(itemDelete, 'click', function () {
                if (!_this.attributes.deleteAttachment)
                    _this.attributes.deleteAttachment = [];
                _this.attributes.deleteAttachment.push(url + "/deleteAttachments?f=json&attachmentIds=" + item.id);
                container.removeChild(itemDiv);
            });
        };
        PopupEdit.prototype.registerChangeEvent = function (input) {
            var _this = this;
            on(input, 'change', function () { return _this.inputChangeHandler(input); });
        };
        PopupEdit.prototype.inputChangeHandler = function (inputDOM) {
            var name = inputDOM.name, value = inputDOM.value;
            if (!value)
                return;
            if (value == -1) {
                this.attributes[name] = null;
                return;
            }
            else if (name === 'attachment') {
                this.attributes[name] = value;
            }
            else {
                var field = this.layer.fields.find(function (f) { return f.name === name; });
                if (field) {
                    var fieldType = field.type;
                    if (fieldType) {
                        var convertValue = void 0;
                        if (fieldType === "small-integer" || fieldType === "integer")
                            convertValue = parseInt(value);
                        else if (fieldType === "double") {
                            convertValue = parseFloat(value);
                        }
                        else {
                            convertValue = value;
                        }
                        this.attributes[name] = convertValue;
                    }
                }
            }
            var subtypes = this.getSubtype(name);
            if (subtypes) {
                for (var key in subtypes.domains) {
                    var subtype = subtypes.domains[key];
                    var input = this.inputElement[key];
                    if (!input)
                        continue;
                    var codedValues = void 0;
                    if (subtype.type === "inherited") {
                        var fieldDomain = this.layer.getFieldDomain(key);
                        if (fieldDomain)
                            codedValues = fieldDomain.codedValues;
                    }
                    else {
                        codedValues = subtype.codedValues;
                    }
                    if (input.tagName === 'SELECT') {
                        input.innerHTML = '';
                        var defaultComboValue = document.createElement('option');
                        defaultComboValue.value = "-1";
                        defaultComboValue.innerText = 'Chọn giá trị...';
                        input.appendChild(defaultComboValue);
                        for (var _i = 0, codedValues_2 = codedValues; _i < codedValues_2.length; _i++) {
                            var codedValue = codedValues_2[_i];
                            var option = document.createElement('option');
                            option.setAttribute('value', codedValue.code);
                            option.innerText = codedValue.name;
                            if (codedValue.code === this.attributes[key])
                                option.setAttribute('selected', 'selected');
                            input.appendChild(option);
                        }
                        this.attributes[key] = input.value == -1 ? null : input.value;
                    }
                    else {
                        var dom = document.createElement('select');
                        dom.classList.add('form-control');
                        dom.setAttribute('name', key);
                        var defaultComboValue = document.createElement('option');
                        defaultComboValue.value = "-1";
                        defaultComboValue.innerText = 'Chọn giá trị...';
                        dom.appendChild(defaultComboValue);
                        this.registerChangeEvent(dom);
                        for (var _a = 0, codedValues_3 = codedValues; _a < codedValues_3.length; _a++) {
                            var codedValue = codedValues_3[_a];
                            var option = document.createElement('option');
                            option.setAttribute('value', codedValue.code);
                            option.innerText = codedValue.name;
                            dom.appendChild(option);
                        }
                        if (input.parentElement) {
                            var parent_1 = input.parentElement;
                            input.parentElement.removeChild(parent_1.firstChild);
                            parent_1.appendChild(dom);
                        }
                        this.attributes[key] = input.value == -1 ? null : input.value;
                        this.inputElement[key] = dom;
                    }
                }
            }
        };
        PopupEdit.prototype.uploadFile = function () {
            var url = this.layer.url + "/" + this.layer.layerId + "/" + this.objectId + "/addAttachment";
            var attachmentForm = document.getElementById('attachment-data');
            if (attachmentForm) {
                esriRequest(url, {
                    responseType: 'json',
                    body: attachmentForm
                }).then(function (res) {
                    if (res.data && res.data.addAttachmentResult && res.data.addAttachmentResult.success) {
                        $.notify({ message: 'Thêm hình ảnh thành công' }, {
                            type: 'success',
                            placement: {
                                from: 'top',
                                align: 'left'
                            }
                        });
                    }
                    else {
                        $.notify({
                            message: 'Thêm hình ảnh không thành công'
                        }, {
                            type: 'danger',
                            placement: {
                                from: 'top',
                                align: 'left'
                            }
                        });
                    }
                });
            }
        };
        PopupEdit.prototype.editFeature = function () {
            var _this = this;
            var notify = $.notify({
                title: "<strong>C\u1EADp nh\u1EADt <i>" + this.layer.title + "</i></strong>",
                message: 'Cập nhật...'
            }, {
                showProgressbar: true,
                delay: 20000,
                placement: {
                    from: 'top',
                    align: 'left'
                }
            });
            try {
                if (this.attributes) {
                    if (this.attributes['attachment']) {
                        this.uploadFile();
                    }
                    if (this.attributes.deleteAttachment) {
                        for (var _i = 0, _a = this.attributes.deleteAttachment; _i < _a.length; _i++) {
                            var url = _a[_i];
                            esriRequest(url);
                        }
                        this.attributes.deleteAttachment = [];
                    }
                    for (var _b = 0, _c = this.layer.fields; _b < _c.length; _b++) {
                        var field = _c[_b];
                        var type = field.type, name_1 = field.name;
                        if (type === 'date') {
                            var date = this.attributes[name_1];
                            if (date && !Number.isInteger(date)) {
                                var splitDate = date.split('-');
                                if (splitDate.length == 3) {
                                    var day = splitDate[2], month = splitDate[1], year = splitDate[0];
                                    var dayString = new Date(month + "/" + day + "/" + year);
                                    var timestamp = dayString.getTime();
                                    this.attributes[name_1] = timestamp;
                                }
                                else {
                                    throw 'Không thể lấy dữ liệu thời gian';
                                }
                            }
                        }
                    }
                    var updatedInfo = editingSupport.getUpdatedInfo(this.view);
                    for (var i in updatedInfo) {
                        this.attributes[i] = updatedInfo[i];
                    }
                    this.layer.applyEdits({
                        updateFeatures: [{
                                attributes: this.attributes
                            }]
                    }).then(function (res) {
                        var valid = false;
                        for (var _i = 0, _a = res.updateFeatureResults; _i < _a.length; _i++) {
                            var item = _a[_i];
                            if (item.error) {
                                valid = true;
                                break;
                            }
                        }
                        if (!valid) {
                            notify.update('type', 'success');
                            notify.update('message', 'Cập nhật thành công!');
                            notify.update('progress', 90);
                            var query = _this.layer.createQuery();
                            query.outFields = ['*'];
                            query.where = 'OBJECTID=' + _this.attributes['OBJECTID'];
                            _this.layer.queryFeatures(query).then(function (res) {
                                _this.view.popup.open({
                                    features: res.features
                                });
                            });
                        }
                    });
                }
            }
            catch (error) {
                notify.update('type', 'danger');
                notify.update('message', 'Có lỗi xảy ra trong quá trình cập nhật!');
                notify.update('progress', 90);
                throw error;
            }
        };
        PopupEdit.prototype.deleteFeature = function () {
            var _this = this;
            var accept = confirm('Chắc chắn muốn xóa?');
            if (!accept)
                return;
            var objectId = this.objectId;
            var notify = $.notify({
                title: "<strong>X\u00F3a <i>" + this.layer.title + "</i></strong>",
                message: 'Đang xóa...'
            }, {
                showProgressbar: true,
                delay: 20000
            });
            this.layer.applyEdits({
                deleteFeatures: [{
                        objectId: objectId
                    }]
            }).then(function (res) {
                if (res.deleteFeatureResults.length > 0 && !res.deleteFeatureResults[0].error) {
                    _this.view.popup.visible = false;
                    notify.update('type', 'success');
                    notify.update('message', 'Xóa thành công!');
                    notify.update('progress', 100);
                }
            });
        };
        PopupEdit.prototype.splitPolygon = function () {
            this.view.popup.visible = false;
            this._splitPolygon.startup(this.selectFeature, this.layer);
        };
        PopupEdit.prototype.mergePolygon = function () {
            this.view.popup.visible = false;
            this._mergePolygon.run(this.selectFeature);
        };
        PopupEdit.prototype.updateGeometryGPS = function () {
            var _this = this;
            var objectId = this.objectId;
            $.notify({
                message: 'Chọn vị trí trên bản đồ'
            });
            var notify = $.notify({
                title: "<strong>C\u1EADp nh\u1EADt v\u1ECB tr\u00ED</strong>",
                message: 'Cập nhật...'
            }, {
                showProgressbar: true,
                delay: 20000,
                placement: {
                    from: 'top',
                    align: 'left'
                }
            });
            var handle = this.view.on('click', function (e) {
                e.stopPropagation();
                _this.layer.applyEdits({
                    updateFeatures: [{
                            attributes: {
                                objectId: objectId,
                                NguoiCapNhat: _this.view.systemVariable.user.userName,
                                NgayCapNhat: new Date().getTime()
                            },
                            geometry: e.mapPoint
                        }]
                }).then(function (res) {
                    if (res.updateFeatureResults[0].error) {
                        notify.update('type', 'danger');
                        notify.update('message', 'Cập nhật không thành công!');
                        notify.update('progress', 90);
                    }
                    else {
                        notify.update('type', 'success');
                        notify.update('message', 'Cập nhật thành công!');
                        notify.update('progress', 90);
                        _this.view.popup.close();
                    }
                });
                handle.remove();
            });
        };
        PopupEdit.prototype.showTableDetailTrongTrot = function () {
            this.thoiGianSanXuatTrongTrotPopup.showTableDetailTrongTrot();
        };
        return PopupEdit;
    }());
    return PopupEdit;
});
