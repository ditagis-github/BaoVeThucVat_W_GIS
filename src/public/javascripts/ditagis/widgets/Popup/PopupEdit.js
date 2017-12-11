define(["require", "exports", "../../classes/ConstName", "dojo/on", "dojo/dom-construct", "esri/request", "esri/core/watchUtils", "esri/geometry/Point", "esri/widgets/Locate/LocateViewModel", "ditagis/support/Editing", "../../toolview/bootstrap", "../../toolview/DateTimeDefine"], function (require, exports, constName, on, domConstruct, esriRequest, watchUtils, Point, LocateViewModel, editingSupport, bootstrap, DateTimeDefine) {
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
            this.thoiGianSanXuatTrongTrot = options.table;
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
            if (this.thoiGianSanXuatTrongTrot.typeIdField === name) {
                const typeIdField = this.thoiGianSanXuatTrongTrot.typeIdField, subtypes = this.thoiGianSanXuatTrongTrot.types, subtype = subtypes.find(f => f.id == value);
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
                    form.appendChild(file);
                    let hideField = document.createElement('input');
                    hideField.hidden = true;
                    hideField.name = 'f';
                    hideField.value = 'json';
                    form.appendChild(hideField);
                    div.appendChild(form);
                    this.registerChangeEvent(file);
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
            let updateAction = this.view.popup.actions.find(function (action) {
                return action.id === 'update';
            });
            updateAction.className = 'esri-icon-check-mark';
            this.view.popup.actions.add({
                id: 'update-geometry',
                title: 'Cập nhật vị trí đối tượng',
                className: 'esri-icon-locate'
            });
            let viewDetailAction = this.view.popup.actions.find(function (action) {
                return action.id === 'view-detail';
            });
            if (this.layer.id === constName.TRONGTROT && viewDetailAction) {
                viewDetailAction.id = 'view-detail-edit';
            }
            var watchFunc = () => {
                updateAction.className = 'esri-icon-edit';
                let action = this.view.popup.actions.find(f => {
                    return f.id === 'update-geometry';
                });
                if (action)
                    this.view.popup.actions.remove(action);
                if (this.layer.id === constName.TRONGTROT && viewDetailAction)
                    viewDetailAction.id = 'view-detail';
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
                if (!this.attributes.deleteAttachment)
                    this.attributes.deleteAttachment = [];
                this.attributes.deleteAttachment.push(`${url}/deleteAttachments?f=json&attachmentIds=${item.id}`);
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
        addDetailTrongTrot() {
            let div = document.createElement('div');
            let divInfo, formGroupNCT, formGroupLCT, formGroupArea, formGroupTime, formGroupTGBDTT, formGroupTGTT, btnAdd;
            divInfo = document.createElement('div');
            formGroupLCT = document.createElement('div');
            formGroupLCT.classList.add('form-group');
            let lbLCT, inputLCT;
            inputLCT = document.createElement('select');
            inputLCT.id = 'LoaiCayTrong';
            inputLCT.classList.add('form-control');
            lbLCT = document.createElement('label');
            lbLCT.innerText = 'Loại cây trồng';
            lbLCT.setAttribute('for', inputLCT.id);
            formGroupLCT.appendChild(lbLCT);
            formGroupLCT.appendChild(inputLCT);
            formGroupNCT = document.createElement('div');
            formGroupNCT.classList.add('form-group');
            let lbNCT, inputNCT;
            inputNCT = document.createElement('select');
            inputNCT.id = 'NhomCayTrong';
            inputNCT.classList.add('form-control');
            let codedValues = this.layer.getFieldDomain('NhomCayTrong').codedValues;
            for (let codedValue of codedValues) {
                let dmCode = codedValue.code, dmName = codedValue.name;
                let option = document.createElement('option');
                option.setAttribute('value', dmCode);
                option.innerHTML = dmName;
                inputNCT.appendChild(option);
            }
            var inputNCTChange = () => {
                inputLCT.innerHTML = '';
                let defaultComboValue = document.createElement('option');
                defaultComboValue.value = "-1";
                defaultComboValue.innerText = 'Chọn giá trị...';
                inputLCT.appendChild(defaultComboValue);
                let subtype = this.getSubtype('NhomCayTrong', inputNCT.value);
                if (!subtype)
                    return;
                let domain = subtype.domains['LoaiCayTrong'];
                if (!domain)
                    return;
                let codedValues;
                if (domain.type === "inherited") {
                    let fieldDomain = this.layer.getFieldDomain('LoaiCayTrong');
                    if (fieldDomain)
                        codedValues = fieldDomain.codedValues;
                }
                else {
                    codedValues = domain.codedValues;
                }
                if (!codedValues)
                    return;
                for (let codedValue of codedValues) {
                    let dmCode = codedValue.code, dmName = codedValue.name;
                    let option = document.createElement('option');
                    option.setAttribute('value', dmCode);
                    option.innerHTML = dmName;
                    inputLCT.appendChild(option);
                }
            };
            on(inputNCT, 'change', () => {
                inputNCTChange();
            });
            inputNCTChange();
            lbNCT = document.createElement('label');
            lbNCT.innerText = 'Nhóm cây trồng';
            lbNCT.setAttribute('for', inputNCT.id);
            formGroupNCT.appendChild(lbNCT);
            formGroupNCT.appendChild(inputNCT);
            formGroupArea = document.createElement('div');
            formGroupArea.classList.add('form-group');
            let lbArea, inputArea;
            inputArea = document.createElement('input');
            inputArea.type = 'number';
            inputArea.id = 'DienTich';
            inputArea.classList.add('form-control');
            lbArea = document.createElement('label');
            lbArea.innerText = 'Diện tích';
            lbArea.setAttribute('for', inputArea.id);
            formGroupArea.appendChild(lbArea);
            formGroupArea.appendChild(inputArea);
            formGroupTGTT = document.createElement('div');
            formGroupTGTT.classList.add('form-group');
            let inputTGTT, lbTGTT;
            inputTGTT = document.createElement('input');
            inputTGTT.type = 'date';
            inputTGTT.id = 'ThoiGianTrongTrot';
            inputTGTT.classList.add('form-control');
            lbTGTT = document.createElement('label');
            lbTGTT.innerText = 'Thời gian trồng trọt';
            lbTGTT.setAttribute('for', inputTGTT.id);
            formGroupTGTT.appendChild(lbTGTT);
            formGroupTGTT.appendChild(inputTGTT);
            formGroupTGBDTT = document.createElement('div');
            formGroupTGBDTT.classList.add('form-group');
            let inputTime, lbTime;
            inputTime = document.createElement('input');
            inputTime.type = 'date';
            inputTime.id = 'ThoiGianBatDauTrong';
            inputTime.classList.add('form-control');
            lbTime = document.createElement('label');
            lbTime.innerText = 'Thời gian bắt đầu trồng';
            lbTime.setAttribute('for', inputTime.id);
            formGroupTGBDTT.appendChild(lbTime);
            formGroupTGBDTT.appendChild(inputTime);
            btnAdd = document.createElement('button');
            btnAdd.classList.add('btn', 'btn-primary');
            btnAdd.innerText = "Thêm";
            on(btnAdd, 'click', () => {
                var length = this.tmpDatasDetailTrongTrong.adds.length;
                let data = {
                    OBJECTID: length + 1,
                    MaDoiTuong: this.attributes['MaDoiTuong'],
                    NhomCayTrong: parseInt(inputNCT.value),
                    LoaiCayTrong: inputLCT.value == -1 ? null : inputLCT.value,
                    DienTich: parseFloat(inputArea.value ? inputArea.value : 0),
                    ThoiGianTrongTrot: !inputTGTT.value ? null : new Date(inputTGTT.value),
                    ThoiGianBatDauTrong: !inputTime.value ? null : new Date(inputTime.value),
                };
                let tableDatas = this.tmpDatasDetailTrongTrong.tableDatas;
                let addDatas = this.tmpDatasDetailTrongTrong.adds;
                for (const d of addDatas) {
                    if (data.LoaiCayTrong == d.LoaiCayTrong &&
                        data.NhomCayTrong == d.NhomCayTrong && data.ThoiGianBatDauTrong.getTime() === d.ThoiGianBatDauTrong.getTime()) {
                        alert("Dữ liệu vừa mới thêm - Không được thêm nữa");
                        return;
                    }
                }
                this.tmpDatasDetailTrongTrong.tableDatas.push(data);
                this.tmpDatasDetailTrongTrong.adds.push(data);
                this.addDataToDetailTrongtrot(data);
                $('#ModalDetail').modal('toggle');
            });
            divInfo.appendChild(formGroupNCT);
            divInfo.appendChild(formGroupLCT);
            divInfo.appendChild(formGroupArea);
            divInfo.appendChild(formGroupTGTT);
            divInfo.appendChild(formGroupTGBDTT);
            divInfo.appendChild(btnAdd);
            div.appendChild(divInfo);
            let footer = document.createElement('div');
            footer.appendChild(btnAdd);
            let modalDetail = bootstrap.modal('ModalDetail', 'Thêm dữ liệu', div, footer);
            modalDetail.modal();
        }
        editDetailTrongTrot(item) {
            let div = document.createElement('div');
            let divInfo, formGroupNCT, formGroupLCT, formGroupArea, formGroupTGTT, formGroupTGBDTT, formGDST, btnEdit;
            divInfo = document.createElement('div');
            formGroupLCT = document.createElement('div');
            formGroupLCT.classList.add('form-group');
            let lbLCT, inputLCT;
            inputLCT = document.createElement('select');
            inputLCT.id = 'LoaiCayTrong';
            inputLCT.classList.add('form-control');
            lbLCT = document.createElement('label');
            lbLCT.innerText = 'Loại cây trồng';
            lbLCT.setAttribute('for', inputLCT.id);
            formGroupLCT.appendChild(lbLCT);
            formGroupLCT.appendChild(inputLCT);
            formGroupNCT = document.createElement('div');
            formGroupNCT.classList.add('form-group');
            let lbNCT, inputNCT;
            inputNCT = document.createElement('select');
            inputNCT.id = 'NhomCayTrong';
            inputNCT.value = item[inputNCT.id];
            inputNCT.classList.add('form-control');
            let codedValues = this.layer.getFieldDomain('NhomCayTrong').codedValues;
            for (let codedValue of codedValues) {
                let dmCode = codedValue.code, dmName = codedValue.name;
                let option = document.createElement('option');
                option.setAttribute('value', dmCode);
                option.innerHTML = dmName;
                inputNCT.appendChild(option);
            }
            inputNCT.value = item[inputNCT.id];
            var inputNCTChange = () => {
                inputLCT.innerHTML = '';
                let defaultComboValue = document.createElement('option');
                defaultComboValue.value = "-1";
                defaultComboValue.innerText = 'Chọn giá trị...';
                inputLCT.appendChild(defaultComboValue);
                let subtype = this.getSubtype('NhomCayTrong', inputNCT.value);
                if (!subtype)
                    return;
                let domain = subtype.domains['LoaiCayTrong'];
                if (!domain)
                    return;
                let codedValues;
                if (domain.type === "inherited") {
                    let fieldDomain = this.layer.getFieldDomain('LoaiCayTrong');
                    if (fieldDomain)
                        codedValues = fieldDomain.codedValues;
                }
                else {
                    codedValues = domain.codedValues;
                }
                if (!codedValues)
                    return;
                for (let codedValue of codedValues) {
                    let dmCode = codedValue.code, dmName = codedValue.name;
                    let option = document.createElement('option');
                    option.setAttribute('value', dmCode);
                    option.innerHTML = dmName;
                    inputLCT.appendChild(option);
                }
            };
            on(inputNCT, 'change', () => {
                inputNCTChange();
            });
            inputNCTChange();
            inputLCT.value = item[inputLCT.id];
            lbNCT = document.createElement('label');
            lbNCT.innerText = 'Nhóm cây trồng';
            lbNCT.setAttribute('for', inputNCT.id);
            formGroupNCT.appendChild(lbNCT);
            formGroupNCT.appendChild(inputNCT);
            formGroupArea = document.createElement('div');
            formGroupArea.classList.add('form-group');
            let lbArea, inputArea;
            inputArea = document.createElement('input');
            inputArea.type = 'number';
            inputArea.id = 'DienTich';
            inputArea.value = item[inputArea.id];
            inputArea.classList.add('form-control');
            lbArea = document.createElement('label');
            lbArea.innerText = 'Diện tích';
            lbArea.setAttribute('for', inputArea.id);
            formGroupArea.appendChild(lbArea);
            formGroupArea.appendChild(inputArea);
            formGroupTGTT = document.createElement('div');
            formGroupTGTT.classList.add('form-group');
            let inputTGTT, lbTGTT;
            inputTGTT = document.createElement('input');
            inputTGTT.type = 'date';
            inputTGTT.id = 'ThoiGianTrongTrot';
            inputTGTT.value = DateTimeDefine.formatDateValue(item[inputTGTT.id]);
            inputTGTT.classList.add('form-control');
            lbTGTT = document.createElement('label');
            lbTGTT.innerText = 'Thời gian trồng trọth';
            lbTGTT.setAttribute('for', inputTGTT.id);
            formGroupTGTT.appendChild(lbTGTT);
            formGroupTGTT.appendChild(inputTGTT);
            formGroupTGBDTT = document.createElement('div');
            formGroupTGBDTT.classList.add('form-group');
            let inputTGBDT, lbTime;
            inputTGBDT = document.createElement('input');
            inputTGBDT.type = 'date';
            inputTGBDT.id = 'ThoiGianBatDauTrong';
            inputTGBDT.value = DateTimeDefine.formatDateValue(item[inputTGBDT.id]);
            inputTGBDT.classList.add('form-control');
            lbTime = document.createElement('label');
            lbTime.innerText = 'Ngày thu hoạch';
            lbTime.setAttribute('for', inputTGBDT.id);
            formGroupTGBDTT.appendChild(lbTime);
            formGroupTGBDTT.appendChild(inputTGBDT);
            formGDST = document.createElement('div');
            formGDST.classList.add('form-group');
            let lbGDST, inputGDST;
            inputGDST = document.createElement('input');
            inputGDST.id = 'GiaiDoanSinhTruong';
            inputGDST.value = item[inputGDST.id];
            inputGDST.classList.add('form-control');
            lbGDST = document.createElement('label');
            lbGDST.innerText = 'Giai đoạn sinh trưởng';
            lbGDST.setAttribute('for', inputGDST.id);
            formGDST.appendChild(lbGDST);
            formGDST.appendChild(inputGDST);
            btnEdit = document.createElement('button');
            btnEdit.classList.add('btn', 'btn-primary');
            btnEdit.innerText = "Chấp nhận";
            on(btnEdit, 'click', () => {
                let data = {
                    OBJECTID: item.OBJECTID,
                    NhomCayTrong: parseInt(inputNCT.value),
                    LoaiCayTrong: inputLCT.value == "-1" ? null : inputLCT.value,
                    DienTich: inputArea.value ? parseFloat(inputArea.value) : 0,
                    ThoiGianTrongTrot: !inputTGTT.value ? null : new Date(inputTGTT.value),
                    ThoiGianBatDauTrong: !inputTGBDT.value ? null : new Date(inputTGBDT.value),
                    GiaiDoanSinhTruong: inputGDST.value
                };
                this.editRenderDetailTrongTrot(data);
                $('#ModalDetail').modal('toggle');
            });
            divInfo.appendChild(formGroupNCT);
            divInfo.appendChild(formGroupLCT);
            divInfo.appendChild(formGroupArea);
            divInfo.appendChild(formGroupTGTT);
            divInfo.appendChild(formGroupTGBDTT);
            divInfo.appendChild(formGDST);
            divInfo.appendChild(btnEdit);
            div.appendChild(divInfo);
            let footer = document.createElement('div');
            footer.appendChild(btnEdit);
            let modalDetail = bootstrap.modal('ModalDetail', 'Sửa dữ liệu', div, footer);
            modalDetail.modal();
        }
        showTableDetailTrongTrot() {
            let notify = $.notify({
                message: 'Đang tai dữ liệu...'
            }, {
                showProgressbar: true,
                delay: 20000,
                placement: {
                    from: 'top',
                    align: 'left'
                }
            });
            this.tmpDatasDetailTrongTrong = {
                adds: [],
                edits: [],
                updates: [],
                deletes: [],
                tableDatas: [],
                tbody: null
            };
            let div = document.createElement('div');
            let tableResponsive = document.createElement('div');
            tableResponsive.classList.add('table-responsive');
            let table = document.createElement('table');
            table.classList.add('table');
            tableResponsive.appendChild(table);
            let thead = document.createElement('thead');
            thead.innerHTML =
                `<tr>
          <th>Nhóm cây trồng</th>
          <th>Loại cây trồng</th>
          <th>Diện tích</th>
          <th>Thời gian bắt đầu trồng</th>
          <th>Thời gian trồng trọt</th>
          <th>Giai đoạn sinh trưởng</th>
          <th>Tác vụ</th>
        </tr>`;
            table.appendChild(thead);
            let tbody = document.createElement('tbody');
            table.appendChild(tbody);
            this.tmpDatasDetailTrongTrong.tbody = tbody;
            let footer = document.createElement('div');
            let btnAdd = document.createElement('button');
            btnAdd.classList.add('btn', 'btn-default');
            btnAdd.innerText = "Thêm dữ liệu";
            on(btnAdd, "click", () => {
                this.addDetailTrongTrot();
            });
            let btnSubmit = document.createElement('button');
            btnSubmit.classList.add('btn', 'btn-primary');
            btnSubmit.innerText = "Chấp nhận";
            on(btnSubmit, 'click', () => {
                this.submitDetailTrongtrot(this.tmpDatasDetailTrongTrong);
            });
            let btnClose = document.createElement('button');
            btnClose.type = 'button';
            btnClose.classList.add('btn', 'btn-default');
            btnClose.setAttribute('data-dismiss', 'modal');
            btnClose.innerText = 'Đóng';
            footer.appendChild(btnSubmit);
            footer.appendChild(btnAdd);
            footer.appendChild(btnClose);
            div.appendChild(tableResponsive);
            this.thoiGianSanXuatTrongTrot.findById(this.attributes['MaDoiTuong']).then(results => {
                if (results.features.length > 0) {
                    let features = results.features;
                    for (let feature of features) {
                        const item = feature.attributes;
                        if (!item['NhomCayTrong'])
                            continue;
                        let row = this.renderDetailTrongtrot(item);
                        tbody.appendChild(row);
                    }
                    this.tmpDatasDetailTrongTrong.tableDatas = results.features.map(f => {
                        return f.attributes;
                    });
                }
                let modal = bootstrap.modal('ttModal', 'Thời gian trồng trọt', div, footer);
                modal.modal();
                notify.update('type', 'success');
                notify.update('progress', 90);
            });
        }
        editRenderDetailTrongTrot(item) {
            try {
                this.tmpDatasDetailTrongTrong.edits.map(row => {
                    if (row.OBJECTID == item.OBJECTID) {
                        this.tmpDatasDetailTrongTrong.edits.splice(this.tmpDatasDetailTrongTrong.edits.indexOf(row));
                    }
                });
                let tableDatas = [];
                this.tmpDatasDetailTrongTrong.tableDatas.map(row => {
                    row.OBJECTID == item.OBJECTID ? tableDatas.push(item) : tableDatas.push(row);
                });
                this.tmpDatasDetailTrongTrong.tableDatas = tableDatas;
                this.tmpDatasDetailTrongTrong.edits.push(item);
                let rows = this.tmpDatasDetailTrongTrong.tbody.getElementsByTagName('tr');
                let row;
                for (const r of rows) {
                    let id = parseInt(r.id);
                    if (id == item['OBJECTID'] || id == item['ID']) {
                        row = r;
                        break;
                    }
                }
                let tds = row.getElementsByTagName('td');
                let tdNCT = tds[0], tdLCT = tds[1], tdArea = tds[2], tdTGTT = tds[3], tdTGBDT = tds[4], tdGDST = tds[5];
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
                let subtype = this.getSubtype('NhomCayTrong', item['NhomCayTrong']);
                if (!subtype)
                    return;
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
                if (!tdLCT.innerText)
                    tdLCT.innerText = item['LoaiCayTrong'] || '';
                tdArea.innerText = item['DienTich'] + "" || '0';
                tdTGTT.innerText = DateTimeDefine.formatNumberDate(item['ThoiGianTrongTrot']);
                tdTGBDT.innerText = DateTimeDefine.formatNumberDate(item['ThoiGianBatDauTrong']);
                tdGDST.innerText = item.GiaiDoanSinhTruong;
            }
            catch (error) {
                throw 'Có lỗi xảy ra trong quá trình thực hiện';
            }
        }
        renderDetailTrongtrot(item, isNew = false) {
            try {
                let row = document.createElement('tr');
                row.id = item['OBJECTID'] || item['ID'];
                if (isNew)
                    row.classList.add("info");
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
                let subtype = this.getSubtype('NhomCayTrong', item['NhomCayTrong']);
                if (!subtype)
                    return;
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
                if (!tdLCT.innerText)
                    tdLCT.innerText = item['LoaiCayTrong'] || '';
                let tdArea = document.createElement('td');
                tdArea.innerText = item['DienTich'] + "" || '0';
                let tdTGTT = document.createElement('td');
                tdTGTT.innerText = DateTimeDefine.formatNumberDate(item['ThoiGianTrongTrot']);
                let tdTGBDT = document.createElement('td');
                tdTGBDT.innerText = DateTimeDefine.formatNumberDate(item['ThoiGianBatDauTrong']);
                let tdAction = document.createElement('td');
                let tdGDST = document.createElement('td');
                tdGDST.innerText = item.GiaiDoanSinhTruong || 'N/A';
                let itemEdit = document.createElement('span');
                itemEdit.classList.add('esri-icon-edit');
                on(itemEdit, 'click', (evt) => {
                    this.tmpDatasDetailTrongTrong.tableDatas.map(row => {
                        if (row.OBJECTID == item.OBJECTID)
                            this.editDetailTrongTrot(row);
                    });
                });
                let itemDelete = document.createElement('span');
                itemDelete.classList.add('esri-icon-trash');
                on(itemDelete, 'click', () => {
                    if (item['OBJECTID']) {
                        this.tmpDatasDetailTrongTrong.deletes.push(item['OBJECTID']);
                        this.tmpDatasDetailTrongTrong.tableDatas.map(row => {
                            if (row.OBJECTID == item['OBJECTID']) {
                                let index = this.tmpDatasDetailTrongTrong.tableDatas.indexOf(row);
                                this.tmpDatasDetailTrongTrong.tableDatas.splice(index, 1);
                            }
                        });
                    }
                    this.tmpDatasDetailTrongTrong.tbody.removeChild(row);
                    let addItem = this.tmpDatasDetailTrongTrong.adds.find(f => {
                        return f.OBJECTID == item.OBJECTID;
                    });
                    if (addItem) {
                        this.tmpDatasDetailTrongTrong.adds.splice(this.tmpDatasDetailTrongTrong.adds.indexOf(addItem));
                    }
                });
                tdAction.appendChild(itemEdit);
                tdAction.appendChild(itemDelete);
                row.appendChild(tdNCT);
                row.appendChild(tdLCT);
                row.appendChild(tdArea);
                row.appendChild(tdTGTT);
                row.appendChild(tdTGBDT);
                row.appendChild(tdGDST);
                row.appendChild(tdAction);
                return row;
            }
            catch (error) {
                throw error;
            }
        }
        addDataToDetailTrongtrot(data) {
            let row = this.renderDetailTrongtrot(data, true);
            this.tmpDatasDetailTrongTrong.tbody.appendChild(row);
        }
        submitData(datas) {
            let adds = [], edits;
            datas.tableDatas.map(fs => {
                if (datas.adds.some(f => {
                    return f.OBJECTID == fs.OBJECTID;
                }))
                    adds.push(fs);
            });
            this.tmpDatasDetailTrongTrong.adds = adds;
            edits = datas.edits.filter(f => {
                return datas.adds.indexOf(f);
            });
            this.tmpDatasDetailTrongTrong.edits = edits;
        }
        submitDetailTrongtrot(datas) {
            this.submitData(datas);
            let applyEdits = {
                addFeatures: [],
                updateFeatures: [],
                deleteFeatures: []
            };
            if (datas.deletes.length > 0) {
                applyEdits.deleteFeatures = datas.deletes;
            }
            if (datas.adds.length > 0) {
                for (let item of datas.adds) {
                    applyEdits.addFeatures.push({
                        attributes: {
                            DienTich: item.DienTich,
                            GiaiDoanSinhTruong: item.GiaiDoanSinhTruong,
                            LoaiCayTrong: item.LoaiCayTrong,
                            MaDoiTuong: item.MaDoiTuong,
                            NhomCayTrong: item.NhomCayTrong,
                            ThoiGianBatDauTrong: item.ThoiGianBatDauTrong.getTime(),
                            ThoiGianTrongTrot: item.ThoiGianTrongTrot.getTime()
                        }
                    });
                }
            }
            if (datas.edits.length > 0) {
                for (let item of datas.edits) {
                    applyEdits.updateFeatures.push({
                        attributes: {
                            DienTich: item.DienTich,
                            GiaiDoanSinhTruong: item.GiaiDoanSinhTruong,
                            LoaiCayTrong: item.LoaiCayTrong,
                            MaDoiTuong: item.MaDoiTuong,
                            NhomCayTrong: item.NhomCayTrong,
                            OBJECTID: item.OBJECTID,
                            ThoiGianBatDauTrong: item.ThoiGianBatDauTrong.getTime(),
                            ThoiGianTrongTrot: item.ThoiGianTrongTrot.getTime()
                        }
                    });
                }
            }
            this.thoiGianSanXuatTrongTrot.applyEdits(applyEdits).then(function (e) {
                console.log(e);
                $('#ttModal').modal('toggle');
            });
        }
        uploadFile() {
            let url = this.layer.url + "/" + this.layer.layerId + "/" + this.objectId + "/addAttachment";
            let attachmentForm = document.getElementById('attachment-data');
            if (attachmentForm) {
                esriRequest(url, {
                    responseType: 'json',
                    body: attachmentForm
                }).then(res => {
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
                });
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
                    if (this.attributes['attachment']) {
                        this.uploadFile();
                    }
                    if (this.attributes.deleteAttachment) {
                        for (let url of this.attributes.deleteAttachment) {
                            esriRequest(url);
                        }
                        this.attributes.deleteAttachment = [];
                    }
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
                            query.outField = ['*'];
                            query.where = 'OBJECTID=' + this.attributes['OBJECTID'];
                            this.layer.queryFeatures(query).then(res => {
                                this.view.popup.open({
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
        updateGeometryGPS() {
            let objectId = this.objectId;
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
            this.locateViewModel.locate().then(res => {
                const coords = res.coords, latitude = coords.latitude, longitude = coords.longitude;
                const geometry = new Point({
                    latitude: latitude,
                    longitude: longitude,
                    spatialReference: this.view.spatialReference
                });
                this.layer.applyEdits({
                    updateFeatures: [{
                            attributes: {
                                objectId: objectId
                            },
                            geometry: geometry
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
            });
        }
    }
    return PopupEdit;
});
//# sourceMappingURL=PopupEdit.js.map