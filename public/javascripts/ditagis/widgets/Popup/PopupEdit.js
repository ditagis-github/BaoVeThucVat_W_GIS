define(["require", "exports", "../../classes/ConstName", "dojo/on", "dojo/dom-construct", "esri/request", "esri/core/watchUtils", "esri/widgets/Locate/LocateViewModel", "../../support/Editing", "./ThoiGianSanXuatTrongTrotPopup", "../SplitPolygon", "../MergePolygon"], function (require, exports, constName, on, domConstruct, esriRequest, watchUtils, LocateViewModel, editingSupport, ThoiGianSanXuatTrongTrotPopup, SplitPolygon, MergePolygon) {
    "use strict";
    class PopupEdit {
        constructor(view, options) {
            this.view = view;
            this.options = options;
            this.locateViewModel = new LocateViewModel({
                view: view,
                graphic: null
            });
            this.fireFields = ['NgayCapNhat', 'NguoiCapNhat', 'MaPhuongXa', 'MaHuyenTP', 'MaDoiTuong'];
            this.inputElement = {};
            this.thoiGianSanXuatTrongTrotPopup = new ThoiGianSanXuatTrongTrotPopup({ view: view, table: options.table });
            this.thoiGianSanXuatTrongTrotTbl = options.table;
            if (location.pathname !== '/congtacvien') {
                this._splitPolygon = new SplitPolygon(view);
                this.view.on('layerview-create', e => {
                    if (e.layer.id === constName.TRONGTROT) {
                        this._mergePolygon = new MergePolygon({ view: view, layer: e.layer });
                    }
                });
            }
        }
        get selectFeature() {
            return this.view.popup.viewModel.selectedFeature;
        }
        get layer() {
            return this.selectFeature.layer || this._layer;
        }
        set layer(value) {
            if (this.selectFeature.layer)
                return;
            this._layer = value;
        }
        get attributes() {
            return this.selectFeature.attributes;
        }
        get objectId() {
            return this.attributes['OBJECTID'];
        }
        resetInputElement() {
            this.inputElement = {};
        }
        isFireField(fieldName) {
            return this.fireFields.indexOf(fieldName) !== -1;
        }
        getSubtype(name, value) {
            name = name || this.layer.typeIdField;
            value = value || this.attributes[name];
            if (this.thoiGianSanXuatTrongTrotTbl.typeIdField === name) {
                const subtypes = this.thoiGianSanXuatTrongTrotTbl.types, subtype = subtypes.find(f => f.id == value);
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
            if (!codedValues)
                return null;
            let currentValue = this.attributes[name];
            let input = document.createElement('select');
            input.classList.add('form-control');
            let defaultComboValue = document.createElement('option');
            defaultComboValue.value = "-1";
            defaultComboValue.innerText = 'Chọn giá trị...';
            input.appendChild(defaultComboValue);
            for (let codedValue of codedValues) {
                let dmCode = codedValue.code, dmName = codedValue.name;
                let option = document.createElement('option');
                option.setAttribute('value', dmCode);
                if (currentValue === dmCode) {
                    option.selected = true;
                }
                option.innerHTML = dmName;
                input.appendChild(option);
            }
            return input;
        }
        showEdit() {
            let subtype = this.getSubtype();
            this.resetInputElement();
            let div = domConstruct.create('div', {
                id: 'show-edit-container',
                class: 'popup-content'
            });
            let table = domConstruct.create('table', {
                class: "table"
            }, div);
            for (let field of this.layer.fields) {
                if (field.type === 'oid' || this.isFireField(field.name))
                    continue;
                let row = domConstruct.create('tr');
                let tdName = domConstruct.create('td', {
                    innerHTML: field.alias
                }), input, tdValue = domConstruct.create('td');
                if (subtype && subtype.domains[field.name]) {
                    input = this.renderDomain(subtype.domains[field.name], field.name);
                }
                else if (field.domain) {
                    input = this.renderDomain(field.domain, field.name);
                }
                else {
                    let inputType, value;
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
                        value = `${year}-${month}-${date}`;
                    }
                    else {
                        inputType = 'text';
                    }
                    if (length >= this.options.hightLength) {
                        input = domConstruct.create('textarea', {
                            rows: 5,
                            cols: 25,
                            class: "form-control",
                            innerHTML: value || this.attributes[field.name],
                            value: value || this.attributes[field.name]
                        });
                    }
                    else {
                        input = domConstruct.create('input', {
                            type: inputType,
                            value: value || this.attributes[field.name],
                            class: "form-control"
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
                this.layer.getAttachments(this.objectId).then(res => {
                    let div = domConstruct.create('div', {
                        class: 'attachment-header',
                        id: `attachment-${this.layer.id}-${this.attributes['OBJECTID']}`
                    }, document.getElementById('show-edit-container'));
                    div.innerText = "Hình ảnh";
                    let form = document.createElement('form');
                    form.id = 'attachment-data';
                    form.enctype = 'multipart/form-data';
                    form.method = 'post';
                    let file = document.createElement('input');
                    file.type = 'file';
                    file.name = 'attachment';
                    file.accept = "image/*";
                    form.appendChild(file);
                    let hideField = document.createElement('input');
                    hideField.hidden = true;
                    hideField.name = 'f';
                    hideField.value = 'json';
                    form.appendChild(hideField);
                    div.appendChild(form);
                    $(form).change(_ => {
                        var notify = $.notify({
                            message: 'Đang cập nhật hình ảnh...'
                        }, {
                            showProgressbar: true,
                            delay: 20000,
                            placement: {
                                from: 'top',
                                align: 'left'
                            }
                        });
                        var formData = new FormData(form);
                        var request = new XMLHttpRequest();
                        var url = this.view.popup.selectedFeature.layer.url
                            + "/" + this.view.popup.selectedFeature.layer.layerId
                            + "/" + this.view.popup.selectedFeature.attributes.OBJECTID + "/addAttachment";
                        request.open("POST", url);
                        request.onload = (e) => {
                            var json = JSON.parse(request.responseText);
                            if (json.addAttachmentResult.success == true) {
                                notify.update('type', 'success');
                                notify.update('message', 'Cập nhật thành công');
                                notify.update('progress', 90);
                                this.renderAttachmentEditPopup({
                                    id: json.addAttachmentResult.objectId, name: file.value.split(/(\\|\/)/g).pop()
                                }, { container: div });
                            }
                            else {
                                notify.update('type', 'danger');
                                notify.update('message', 'Cập nhật thất bại, vui lòng thử lại');
                                notify.update('progress', 90);
                            }
                        };
                        request.onerror = function (e) {
                            notify.update('type', 'danger');
                            notify.update('message', 'Cập nhật thất bại, vui lòng thử lại');
                            notify.update('progress', 90);
                        };
                        request.send(formData);
                    });
                    if (res && res.attachmentInfos && res.attachmentInfos.length > 0) {
                        for (let item of res.attachmentInfos) {
                            this.renderAttachmentEditPopup(item, {
                                container: div,
                            });
                        }
                    }
                });
            }
            for (let key in this.inputElement) {
                this.inputChangeHandler(this.inputElement[key]);
            }
            this.view.popup.content = div;
            this.view.popup.title = this.layer.title;
            this.toggleAction();
            var watchFunc = () => {
            };
            watchUtils.once(this.view.popup, 'selectedFeature').then(watchFunc);
            watchUtils.once(this.view.popup, 'visible').then(watchFunc);
        }
        renderAttachmentEditPopup(item, props) {
            const container = props.container || document.getElementById(`attachment-${this.layer.id}-${this.attributes['OBJECTID']}`);
            let url = `${this.layer.url}/${this.layer.layerId}/${this.attributes['OBJECTID']}`;
            let itemDiv = domConstruct.create('div', {
                class: 'attachment-item'
            }, container);
            let itemName = domConstruct.create('div', {
                class: 'attachment-name'
            }, itemDiv);
            let aItemName = domConstruct.create('a', {
                href: `${url}/attachments/${item.id}`,
                target: '_blank'
            }, itemName);
            aItemName.innerText = item.name;
            let itemDelete = domConstruct.create('div', {
                class: 'delete-attachment esri-icon-trash'
            }, itemDiv);
            on(itemDelete, 'click', () => {
                let deleteUrl = `${url}/deleteAttachments?f=json&attachmentIds=${item.id}`;
                var notify = $.notify({
                    message: 'Đang xóa hình...'
                }, {
                    showProgressbar: true,
                    delay: 20000,
                    placement: {
                        from: 'top',
                        align: 'left'
                    }
                });
                esriRequest(deleteUrl)
                    .then(e => {
                    notify.update('type', 'success');
                    notify.update('message', 'Xóa thành công!');
                    notify.update('progress', 90);
                });
                container.removeChild(itemDiv);
            });
        }
        registerChangeEvent(input) {
            on(input, 'change', () => this.inputChangeHandler(input));
        }
        inputChangeHandler(inputDOM) {
            const name = inputDOM.name, value = inputDOM.value;
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
                const field = this.layer.fields.find(f => f.name === name);
                if (field) {
                    let fieldType = field.type;
                    if (fieldType) {
                        let convertValue;
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
            let subtypes = this.getSubtype(name);
            if (subtypes) {
                for (let key in subtypes.domains) {
                    let subtype = subtypes.domains[key];
                    let input = this.inputElement[key];
                    if (!input)
                        continue;
                    let codedValues;
                    if (subtype.type === "inherited") {
                        let fieldDomain = this.layer.getFieldDomain(key);
                        if (fieldDomain)
                            codedValues = fieldDomain.codedValues;
                    }
                    else {
                        codedValues = subtype.codedValues;
                    }
                    if (input.tagName === 'SELECT') {
                        input.innerHTML = '';
                        let defaultComboValue = document.createElement('option');
                        defaultComboValue.value = "-1";
                        defaultComboValue.innerText = 'Chọn giá trị...';
                        input.appendChild(defaultComboValue);
                        for (let codedValue of codedValues) {
                            let option = document.createElement('option');
                            option.setAttribute('value', codedValue.code);
                            option.innerText = codedValue.name;
                            if (codedValue.code === this.attributes[key])
                                option.setAttribute('selected', 'selected');
                            input.appendChild(option);
                        }
                        this.attributes[key] = input.value == -1 ? null : input.value;
                    }
                    else {
                        let dom = document.createElement('select');
                        dom.classList.add('form-control');
                        dom.setAttribute('name', key);
                        let defaultComboValue = document.createElement('option');
                        defaultComboValue.value = "-1";
                        defaultComboValue.innerText = 'Chọn giá trị...';
                        dom.appendChild(defaultComboValue);
                        this.registerChangeEvent(dom);
                        for (let codedValue of codedValues) {
                            let option = document.createElement('option');
                            option.setAttribute('value', codedValue.code);
                            option.innerText = codedValue.name;
                            dom.appendChild(option);
                        }
                        if (input.parentElement) {
                            let parent = input.parentElement;
                            input.parentElement.removeChild(parent.firstChild);
                            parent.appendChild(dom);
                        }
                        this.attributes[key] = input.value == -1 ? null : input.value;
                        this.inputElement[key] = dom;
                    }
                }
            }
        }
        uploadFile() {
            alert('upfile');
            let url = this.layer.url + "/" + this.layer.layerId + "/" + this.objectId + "/addAttachment";
            let attachmentForm = document.getElementById('attachment-data');
            if (attachmentForm) {
                esriRequest(url, {
                    method: 'POST',
                    responseType: 'json',
                    body: attachmentForm
                }).then(res => {
                    alert(JSON.stringify(res));
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
                            message: 'Thêm hình ảnh không thành công',
                        }, {
                            type: 'danger',
                            placement: {
                                from: 'top',
                                align: 'left'
                            }
                        });
                    }
                }).otherwise(e => alert(JSON.stringify(e)));
            }
        }
        editFeature() {
            let notify = $.notify({
                title: `<strong>Cập nhật <i>${this.layer.title}</i></strong>`,
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
                    for (let field of this.layer.fields) {
                        const type = field.type, name = field.name;
                        if (type === 'date') {
                            let date = this.attributes[name];
                            if (date && !Number.isInteger(date)) {
                                let splitDate = date.split('-');
                                if (splitDate.length == 3) {
                                    let day = splitDate[2], month = splitDate[1], year = splitDate[0];
                                    var dayString = new Date(`${month}/${day}/${year}`);
                                    const timestamp = dayString.getTime();
                                    this.attributes[name] = timestamp;
                                }
                                else {
                                    throw 'Không thể lấy dữ liệu thời gian';
                                }
                            }
                        }
                    }
                    const updatedInfo = editingSupport.getUpdatedInfo(this.view);
                    for (let i in updatedInfo) {
                        this.attributes[i] = updatedInfo[i];
                    }
                    this.layer.applyEdits({
                        updateFeatures: [{
                                attributes: this.attributes
                            }]
                    }).then((res) => {
                        let valid = false;
                        for (let item of res.updateFeatureResults) {
                            if (item.error) {
                                valid = true;
                                break;
                            }
                        }
                        if (!valid) {
                            notify.update('type', 'success');
                            notify.update('message', 'Cập nhật thành công!');
                            notify.update('progress', 90);
                            let query = this.layer.createQuery();
                            query.outFields = ['*'];
                            query.where = 'OBJECTID=' + this.attributes['OBJECTID'];
                            this.layer.queryFeatures(query).then(res => {
                                this.view.popup.open({
                                    features: res.features
                                });
                            });
                            this.toggleAction();
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
        }
        toggleAction() {
            let showeditsAction = this.view.popup.actions.find(function (action) {
                return action.id === 'showedits';
            });
            let editFeatureAction = this.view.popup.actions.find(function (action) {
                return action.id === 'editfeature';
            });
            showeditsAction.visible = !showeditsAction.visible;
            editFeatureAction.visible = !editFeatureAction.visible;
            if (editFeatureAction.visible) {
                let viewDetailAction = this.view.popup.actions.find(function (action) {
                    return action.id === 'view-detail';
                });
                if (this.layer.id === constName.TRONGTROT && viewDetailAction) {
                    viewDetailAction.id = 'view-detail-edit';
                }
            }
        }
        deleteFeature() {
            let accept = confirm('Chắc chắn muốn xóa?');
            if (!accept)
                return;
            let objectId = this.objectId;
            let notify = $.notify({
                title: `<strong>Xóa <i>${this.layer.title}</i></strong>`,
                message: 'Đang xóa...'
            }, {
                showProgressbar: true,
                delay: 20000
            });
            this.layer.applyEdits({
                deleteFeatures: [{
                        objectId: objectId
                    }]
            }).then((res) => {
                if (res.deleteFeatureResults.length > 0 && !res.deleteFeatureResults[0].error) {
                    this.view.popup.visible = false;
                    notify.update('type', 'success');
                    notify.update('message', 'Xóa thành công!');
                    notify.update('progress', 100);
                }
            });
        }
        splitPolygon() {
            this.view.popup.visible = false;
            this._splitPolygon.startup(this.selectFeature, this.layer);
        }
        mergePolygon() {
            this.view.popup.visible = false;
            this._mergePolygon.run(this.selectFeature);
        }
        updateGeometryGPS() {
            let objectId = this.objectId;
            $.notify({
                message: 'Chọn vị trí trên bản đồ'
            });
            let notify = $.notify({
                title: `<strong>Cập nhật vị trí</strong>`,
                message: 'Cập nhật...'
            }, {
                showProgressbar: true,
                delay: 20000,
                placement: {
                    from: 'top',
                    align: 'left'
                }
            });
            let handle = this.view.on('click', (e) => {
                e.stopPropagation();
                this.layer.applyEdits({
                    updateFeatures: [{
                            attributes: {
                                objectId: objectId,
                                NguoiCapNhat: this.view.systemVariable.user.userName,
                                NgayCapNhat: new Date().getTime()
                            },
                            geometry: e.mapPoint
                        }]
                }).then(res => {
                    if (res.updateFeatureResults[0].error) {
                        notify.update('type', 'danger');
                        notify.update('message', 'Cập nhật không thành công!');
                        notify.update('progress', 90);
                    }
                    else {
                        notify.update('type', 'success');
                        notify.update('message', 'Cập nhật thành công!');
                        notify.update('progress', 90);
                        this.view.popup.close();
                    }
                });
                handle.remove();
            });
        }
        showTableDetailTrongTrot() {
            this.thoiGianSanXuatTrongTrotPopup.showTableDetailTrongTrot();
        }
    }
    return PopupEdit;
});
