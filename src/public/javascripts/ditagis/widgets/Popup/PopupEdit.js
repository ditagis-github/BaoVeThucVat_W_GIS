define([
    "dojo/on",
    "dojo/dom",
    "dojo/dom-construct",
    "esri/request",
    "esri/tasks/QueryTask",
    "esri/core/watchUtils",
    "esri/widgets/Locate/LocateViewModel",
    "ditagis/support/Editing",
], function (on, dom, domConstruct, esriRequest, QueryTask, watchUtils, LocateViewModel,
    editingSupport) {
        'use strict';
        return class {
            constructor(view, options) {
                this.view = view;
                this.options = options;
                this.locateViewModel = new LocateViewModel({
                    view: view,
                    graphic: null
                })
                this.fireFields = ['NgayCapNhat', 'NguoiCapNhat', 'MaPhuongXa', 'MaHuyenTP'];
                this.inputElement = {};
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
            /**
             * Khởi tạo lại inputElement
             */
            resetInputElement() {
                this.inputElement = {};
            }
            isFireField(fieldName) {
                return this.fireFields.indexOf(fieldName) !== -1;
            }
            /**
            * Lấy subtype của {name} với giá trị {value} trong {layer}
            * @param {*} layer 
            * @param {*} name 
            * @param {*} value 
            * @return subtype
            */
            getSubtype(name, value) {
                name = name || this.layer.typeIdField;
                value = value || this.attributes[name];
                if (this.layer.typeIdField === name) {
                    const typeIdField = this.layer.typeIdField,//tên thuộc tính của subtypes
                        domainType = this.layer.getFieldDomain(typeIdField),//lấy domain
                        subtypes = this.layer.types,//subtypes
                        subtype = subtypes.find(f => f.id == value);
                    return subtype;
                }
                return null;
            }
            renderDomain(domain, name) {
                let codedValues;
                if (domain.type === "inherited") {
                    let fieldDomain = this.layer.getFieldDomain(name);
                    if (fieldDomain) codedValues = fieldDomain.codedValues;
                } else {//type is codedValue
                    codedValues = domain.codedValues;
                }
                if (!codedValues) return null;

                let currentValue = this.attributes[name];
                let input = document.createElement('select');
                for (let codedValue of codedValues) {
                    let dmCode = codedValue.code,
                        dmName = codedValue.name;
                    let option = document.createElement('option');
                    option.setAttribute('value', dmCode);
                    if (currentValue === dmCode) {
                        option.selected = 'selected'
                    }
                    option.innerHTML = dmName;
                    input.appendChild(option);
                }
                return input;
            }
            /**
             * Hiển thị popup
             */
            showEdit() {
                let subtype = this.getSubtype();
                this.resetInputElement();
                let div = domConstruct.create('div', {
                    id: 'show-edit-container',
                    class: 'popup-content'
                });
                let table = domConstruct.create('table', {}, div);
                // if (this.layer.id === constName.TRONGTROT) {
                //     var timeChangeHandle = () => {
                //         this.attributes.LoaiCayTrongs = [];
                //         let input = this.inputElement['NhomCayTrong'];
                //         if (input) {
                //             let queryTask = new QueryTask(constName.TABLE_SXTT_URL);
                //             queryTask.execute({
                //                 outFields: ['*'],
                //                 where: `MaDoiTuong = '${this.attributes.MaDoiTuong}' and Thang = ${inputMonth.value} and Nam = ${inputYear.value}`
                //             }).then(results => {
                //                 if (results.features.length > 0) {
                //                     let loaiCayTrong = [];
                //                     for (let feature of results.features) {
                //                         let attributes = feature.attributes;
                //                         //neu co nhom cay trong
                //                         if (attributes.NhomCayTrong) {
                //                             input.value = attributes.NhomCayTrong;
                //                             inputNhomCayTrongChangeHandler(attributes.NhomCayTrong)
                //                         }
                //                         //neu co loai cay trong
                //                         if (attributes.LoaiCayTrong)
                //                             loaiCayTrong.push(attributes.LoaiCayTrong);
                //                     }
                //                     // updateLoaiCayTrong(loaiCayTrong);
                //                     if (loaiCayTrong.length > 0)
                //                         checkedLoaiCayTrong(loaiCayTrong);
                //                 }
                //             }
                //                 );
                //         }
                //     }
                //     // var updateTrongTrongTimer = ()=>{
                //     //     //neu chua co thi tao
                //     //     if(!attributes['ThoiGianTrongTrot']){
                //     //         attributes['ThoiGianTrongTrot'] = [];
                //     //     }

                //     //     let items = attributes['ThoiGianTrongTrot'];
                //     //     let item = items.find(f=>f.Thang === thang && f.Nam === nam);
                //     //     //neu ton tai thoi gian
                //     //     if(item){
                //     //         //neu chua co loai cay trong thi tao
                //     //         if(!item['LoaiCayTrongs']){
                //     //             item['LoaiCayTrongs'] = [];
                //     //         }
                //     //     }
                //     //     //neu chua ton tai thoi gian
                //     //     else{

                //     //     }
                //     // }
                //     var inputNhomCayTrongChangeHandler = (value) => {
                //         value = value || 1;
                //         let subtype = this.getSubtype('NhomCayTrong', value);
                //         let domain =
                //             (subtype.domains.LoaiCayTrong && subtype.domains.LoaiCayTrong.type === "codedValue") ? subtype.domains.LoaiCayTrong : this.layer.getFieldDomain('LoaiCayTrong');
                //         updateLoaiCayTrong(domain.codedValues);

                //     }
                //     var checkedLoaiCayTrong = (values) => {
                //         if (values && values.length > 0) {
                //             let childNodes = tdValueLCT.childNodes;
                //             if (childNodes && childNodes.length > 0) {
                //                 for (let value of values) {
                //                     for (let child of childNodes) {
                //                         if (child.type === 'checkbox' && child.value == value)
                //                             child.checked = true;
                //                     }
                //                 }
                //             }
                //         }
                //     }
                //     var updateLoaiCayTrong = (values) => {
                //         if (values && values.length > 0) {
                //             tdValueLCT.innerHTML = '';
                //             for (let codedValue of values) {
                //                 if (codedValue) {
                //                     let input = domConstruct.create('input', {
                //                         type: 'checkbox',
                //                         name: 'LoaiCayTrong',
                //                         value: codedValue.code
                //                     }, tdValueLCT);
                //                     domConstruct.create('text', {
                //                         innerHTML: codedValue.name + '<br>'
                //                     }, tdValueLCT);
                //                     on(input, 'change', evt => {
                //                         //neu chua co 
                //                         if (!this.attributes['LoaiCayTrongs']) {
                //                             this.attributes['LoaiCayTrongs'] = [];
                //                         }
                //                         //neu loai cay trong duoc chon thi them vao
                //                         if (evt.target.checked) {
                //                             this.attributes['LoaiCayTrongs'].push(evt.target.value);
                //                         }
                //                         //neu khong chon thi kiem tra trong mang da co chua, neu co thi xoa
                //                         else {
                //                             let index = this.attributes['LoaiCayTrongs'].indexOf(evt.target.value);
                //                             if (index !== -1) {
                //                                 this.attributes['LoaiCayTrongs'].splice(index, 1);
                //                             }
                //                         }
                //                     });
                //                 }
                //             }
                //         }
                //     }
                //     //duyệt thông tin đối tượng
                //     for (let field of this.layer.fields) {
                //         //nếu như field thuộc field cấm thì không hiển thị
                //         if (field.type === 'oid' || field.name === 'MaDoiTuong' || field.name === 'LoaiCayTrong') {
                //             continue;
                //         }
                //         //tạo <tr>
                //         let row = domConstruct.create('tr', {}, table);
                //         //tạo <td>
                //         let
                //             tdName = domConstruct.create('td', {
                //                 innerHTML: field.alias
                //             }, row),
                //             tdValue = domConstruct.create('td', {}, row),
                //             input;
                //         //kiểm tra domain
                //         if (field.name === 'NhomCayTrong') {

                //             /**
                //              * 
                //              * @param {*} input Nhóm cây trồng
                //              */

                //             input = domConstruct.create('select', null, tdValue)
                //             for (let codedValue of field.domain.codedValues) {
                //                 let dmCode = codedValue.code,
                //                     dmName = codedValue.name;
                //                 let option = domConstruct.create('option', {
                //                     value: dmCode,
                //                 });
                //                 if (this.attributes[field.name] === dmCode) {
                //                     option.selected = 'selected'
                //                 }
                //                 option.innerHTML = dmName;
                //                 domConstruct.place(option, input);
                //             }
                //             //tạo <tr>
                //             let trLCT = domConstruct.create('tr', {}, table);
                //             //tạo <td>
                //             let tdNameLCT = domConstruct.create('td', {
                //                 innerHTML: 'Loại cây trồng'
                //             }, trLCT);
                //             var tdValueLCT = domConstruct.create('td', {}, trLCT);
                //             this.inputElement['LoaiCayTrong'] = tdValueLCT;
                //             on(input, 'change', (evt) => {
                //                 this.attributes[field.name] = parseInt(evt.target.value);
                //                 inputNhomCayTrongChangeHandler(evt.target.value);
                //             })

                //             inputNhomCayTrongChangeHandler(this.attributes[field.name]);

                //             ///TIMER//
                //             var currentTime = new Date();
                //             //Month
                //             //tạo <tr>
                //             var trMonth = domConstruct.create('tr', {}, table);
                //             //tạo <td>
                //             var tdNameMonth = domConstruct.create('td', {
                //                 innerHTML: 'Tháng'
                //             }, trMonth);
                //             var tdValueMonth = domConstruct.create('td', {}, trMonth);
                //             var inputMonth = domConstruct.create('select', {
                //             }, tdValueMonth)
                //             for (var i = 0; i < 12; i++) {
                //                 let option = domConstruct.create('option', {
                //                     value: i + 1,
                //                     innerHTML: i + 1
                //                 });
                //                 domConstruct.place(option, inputMonth);
                //             }
                //             //chon thang hien tai
                //             inputMonth.value = currentTime.getMonth() + 1;
                //             this.attributes['Thang'] = parseInt(inputMonth.value);
                //             on(inputMonth, 'change', (evt) => {
                //                 timeChangeHandle();
                //                 this.attributes['Thang'] = parseInt(inputMonth.value);
                //             })

                //             //Year
                //             //tạo <tr>
                //             var trYear = domConstruct.create('tr', {}, table);
                //             //tạo <td>
                //             var tdNameYear = domConstruct.create('td', {
                //                 innerHTML: 'Năm'
                //             }, trYear);
                //             var tdValueYear = domConstruct.create('td', {}, trYear);
                //             var inputYear = domConstruct.create('select', {}, tdValueYear);
                //             for (var i = 2015; i <= currentTime.getFullYear() + 1; i++) {
                //                 let option = domConstruct.create('option', {
                //                     value: i,
                //                     innerHTML: i
                //                 });
                //                 domConstruct.place(option, inputYear);

                //             }
                //             //chon nam hien tai
                //             inputYear.value = currentTime.getFullYear();
                //             this.attributes['Nam'] = parseInt(inputYear.value);
                //             on(inputYear, 'change', (evt) => {
                //                 timeChangeHandle();
                //                 this.attributes['Nam'] = parseInt(inputYear.value);
                //             })
                //             this.inputElement[field.name] = input;
                //             timeChangeHandle();
                //         } else {
                //             pass(row, tdName, tdValue, input, field);
                //         }
                //     }
                // } else {
                //duyệt thông tin đối tượng
                for (let field of this.layer.fields) {

                    if (field.type === 'oid')
                        continue;
                    //tạo <tr>
                    let row = domConstruct.create('tr');
                    //tạo <td>
                    let tdName = domConstruct.create('td', {
                        innerHTML: field.alias
                    }),
                        input,
                        tdValue = domConstruct.create('td');
                    if (subtype && subtype.domains[field.name]) {
                        input = this.renderDomain(subtype.domains[field.name], field.name);
                    }
                    //kiểm tra domain
                    else if (field.domain) {
                        input = this.renderDomain(field.domain, field.name);
                    } else {
                        let inputType, value;
                        if (field.type === "small-integer" ||
                            (field.type === "integer") ||
                            (field.type === "double"))
                            inputType = 'number';
                        else if (field.type === 'date') {
                            inputType = 'date';
                            var d = new Date(this.attributes[field.name]),
                                date = d.getDate(),
                                month = d.getMonth() + 1,
                                year = d.getFullYear();
                            if (date / 10 < 1)
                                date = '0' + date;
                            if (month / 10 < 1)
                                month = '0' + month;
                            value = `${year}-${month}-${date}`;
                        } else {
                            inputType = 'text';
                        }
                        //neu du lieu qua lon thi hien thi textarea
                        if (length >= this.options.hightLength) {
                            input = domConstruct.create('textarea', {
                                rows: 5,
                                cols: 25,
                                innerHTML: value || this.attributes[field.name],
                                value: value || this.attributes[field.name]
                            });
                        } else {
                            input = domConstruct.create('input', {
                                type: inputType,
                                value: value || this.attributes[field.name],
                            });

                        }
                    }
                    input.readOnly = this.isFireField(field.name);
                    input.name = field.name;
                    domConstruct.place(input, tdValue);
                    domConstruct.place(tdName, row);
                    domConstruct.place(tdValue, row);
                    domConstruct.place(row, table);

                    this.inputElement[field.name] = input;
                    //thêm vào html
                    this.registerChangeEvent(input);
                }

                // }
                if (this.layer.hasAttachments) {


                    this.getAttachments().then(res => {
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
                        hideField.hidden = 'hidden';
                        hideField.name = 'f';
                        hideField.value = 'json';
                        form.appendChild(hideField);
                        div.appendChild(form);
                        this.registerChangeEvent(file);

                        if (res && res.attachmentInfos && res.attachmentInfos.length > 0) {
                            for (let item of res.attachmentInfos) {
                                this.renderAttachmentEditPopup(item, {
                                    container: div,
                                })
                            }
                        }
                    })
                }
                for (let key in this.inputElement) {
                    this.inputChangeHandler(this.inputElement[key]);
                }
                this.view.popup.content = div;
                this.view.popup.title = this.layer.title;
                //CHANGE ICON FROM UPDATE TO EDIT
                let updateAction = this.view.popup.actions.find(function (action) {
                    return action.id === 'update';
                })
                updateAction.className = 'esri-icon-check-mark';
                //ADD ACTON UPDATE GEOMETRY WITH GPS
                this.view.popup.actions.add({
                    id: 'update-geometry',
                    title: 'Cập nhật vị trí đối tượng',
                    className: 'esri-icon-locate'
                })
                //RESTORE WHEN OUT EDIT MODE
                var watchFunc = () => {
                    updateAction.className = 'esri-icon-edit';
                    let action = this.view.popup.actions.find(f => { return f.id === 'update-geometry' });
                    if (action) this.view.popup.actions.remove(action);
                }
                watchUtils.once(this.view.popup, 'selectedFeature').then(watchFunc)
                watchUtils.once(this.view.popup, 'visible').then(watchFunc)
            }
            renderAttachmentEditPopup(item, props) {
                const
                    container = props.container || document.getElementById(`attachment-${this.layer.id}-${attributes['OBJECTID']}`);

                let url = `${this.layer.url}/${this.layer.layerId}/${attributes['OBJECTID']}`;
                let itemDiv = domConstruct.create('div', {
                    class: 'attachment-item'
                }, container);
                let itemName = domConstruct.create('div', {
                    class: 'attachment-name'
                }, itemDiv);
                let aItemName = domConstruct.create('a', {
                    href: `${url}/attachments/${item.id}`,
                    target: '_blank'
                }, itemName)
                aItemName.innerText = item.name;
                let itemDelete = domConstruct.create('div', {
                    class: 'delete-attachment esri-icon-trash'
                }, itemDiv);
                on(itemDelete, 'click', () => {
                    if (!attributes.deleteAttachment)
                        attributes.deleteAttachment = [];
                    attributes.deleteAttachment.push(`${url}/deleteAttachments?f=json&attachmentIds=${item.id}`);
                    container.removeChild(itemDiv);
                });
            }
            registerChangeEvent(input) {
                on(input, 'change', () => this.inputChangeHandler(input));
            }
            /**
             * Khi ô nhập dữ liệu trong popup có sự thay đổi giá trị
             * @param {htmldom} inputDOM 
             */
            inputChangeHandler(inputDOM) {
                const name = inputDOM.name,
                    value = inputDOM.value;
                    if(!value) return;
                if (name === 'attachment') {
                    this.attributes[name] = value;
                } else {
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
                //check subtype
                let subtypes = this.getSubtype(name);
                if (subtypes) {
                    for (let key in subtypes.domains) {
                        let subtype = subtypes.domains[key];
                        let input = this.inputElement[key];
                        let codedValues;
                        if (subtype.type === "inherited") {
                            let fieldDomain = this.layer.getFieldDomain(key);
                            if (fieldDomain) codedValues = fieldDomain.codedValues;
                        } else {
                            codedValues = subtype.codedValues;
                        }
                        if (input.tagName === 'SELECT') {
                            input.innerHTML = '';
                            for (let codedValue of codedValues) {
                                let option = document.createElement('option');
                                option.setAttribute('value', codedValue.code);
                                option.innerText = codedValue.name;
                                if(codedValue.code === this.attributes[key])
                                option.setAttribute('selected','selected');
                                input.appendChild(option);
                            }
                            this.attributes[key] = input.value;
                        } else {
                            let dom = document.createElement('select');
                            dom.setAttribute('name', key);
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
                            this.attributes[key] = input.value;
                            this.inputElement[key] = dom;
                        }
                    }
                }
            }
            /**
             * ATTACHMENT
             */
            uploadFile() {
                let url = this.layer.url + "/" + this.layer.layerId + "/" + this.objectId + "/addAttachment";
                let attachmentForm = document.getElementById('attachment-data');
                if (attachmentForm) {
                    esriRequest(url, {
                        responseType: 'json',
                        body: attachmentForm
                    }).then(res => {
                        if (res.data && res.data.addAttachmentResult && res.data.addAttachmentResult.success) {
                            // let file = attachmentForm.getElementsByTagName('input')[0];
                            // let item = {
                            //     id:res.data.addAttachmentResult.objectId,
                            //     name: file.value.replace(/^.*[\\\/]/, '')
                            // }
                            // this.renderAttachmentEditPopup(item);
                            // //xoa duong dan da chon
                            // file.value = '';
                            $.notify('Thêm hình ảnh thành công', {
                                type: 'success',
                                placement: {
                                    from: 'top',
                                    align: 'left'
                                }
                            });
                        } else {
                            $.notify('Thêm hình ảnh không thành công', {
                                type: 'danger',
                                placement: {
                                    from: 'top',
                                    align: 'left'
                                }
                            });
                        }
                    })
                }
            }
            /**
            * Lấy attachments của feature layer
            */
            getAttachments(id) {
                return new Promise((resolve, reject) => {
                    var url = this.layer.url + "/" + this.layer.layerId + "/" + id;
                    esriRequest(url + "/attachments?f=json", {
                        responseType: 'json',
                        method: 'get'
                    }).then(result => {
                        resolve(result.data || null);
                    });
                });

            }
            /**
             * * * * * * * * * * XÓA - SỬA * * * * * * * * * *
             */

            /**
             * Sự kiện chỉnh sửa thông tin đối tượng
             */
            editFeature() {
                let notify = $.notify({
                    title: `<strong>Cập nhật <i>${this.layer.title}</i></strong>`,
                    message: 'Cập nhật...'
                }, {
                        showProgressbar: true,
                        delay: 20000,
                        placement: {
                            from: 'top',
                            alias: 'left'
                        }
                    })
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
                            const type = field.type,
                                name = field.name;
                            if (type === 'date') {
                                let date = this.attributes[name]
                                //nếu như date có giá trị và date không phải là số
                                if (date && !Number.isInteger(date)) {
                                    let
                                        splitDate = date.split('-');
                                    if (splitDate.length == 3) {
                                        let day = splitDate[2],
                                            month = splitDate[1],
                                            year = splitDate[0];
                                        var dayString = new Date(`${month}/${day}/${year}`);
                                        const timestamp = dayString.getTime();
                                        this.attributes[name] = timestamp;
                                    } else {
                                        throw 'Không thể lấy dữ liệu thời gian'
                                    }
                                }
                            }
                        }
                        const updatedInfo = editingSupport.getUpdatedInfo(this.view)
                        for (let i in updatedInfo) {
                            this.attributes[i] = updatedInfo[i];
                        }
                        //nếu là Trồng trọt thì xét đến trường hợp Loại cây trồng và thời gian
                        //lấy danh sách loại cây trồng dã tick
                        if (this.layer.id === constName.TRONGTROT) {
                            const
                                nhomCayTrong = this.attributes['NhomCayTrong'],
                                loaiCayTrongs = this.attributes['LoaiCayTrongs'],
                                thang = this.attributes['Thang'],
                                nam = this.attributes['Nam'];
                            //thêm vào dữ liệu
                            //neu co loai cay trong
                            let datas = [];
                            if (loaiCayTrongs && loaiCayTrongs.length > 0) {
                                for (let loaiCayTrong of loaiCayTrongs) {
                                    datas.push({
                                        MaDoiTuong: this.attributes['MaDoiTuong'],
                                        Thang: thang,
                                        Nam: nam,
                                        NhomCayTrong: nhomCayTrong,
                                        LoaiCayTrong: loaiCayTrong
                                    });

                                }
                                //xoa het du lieu
                                this.attributes.LoaiCayTrongs = [];
                            }
                            //neu khong thi khong them loai cay trong
                            else {
                                datas.push({
                                    MaDoiTuong: this.attributes['MaDoiTuong'],
                                    Thang: thang,
                                    Nam: nam,
                                    NhomCayTrong: nhomCayTrong,
                                    LoaiCayTrong: null
                                });
                            }
                            if (datas.length > 0) {
                                let xnotify = $.notify({
                                    title: `<strong>Cập nhật thời gian sản xuất trồng trọt</strong>`,
                                    message: 'Đang Cập nhật...'
                                }, {
                                        showProgressbar: true,
                                        delay: 20000,
                                        placement: {
                                            from: 'top',
                                            alias: 'left'
                                        }
                                    })
                                let dataSent = [];
                                for (let item of datas) {
                                    dataSent.push({
                                        attributes: item
                                    });
                                }
                                let form = document.createElement('form');
                                form.method = 'post';
                                let ft = document.createElement('input');
                                ft.name = 'features'
                                ft.type = 'text';
                                ft.value = JSON.stringify(dataSent)
                                form.appendChild(ft);
                                let format = document.createElement('input');
                                format.name = 'f';
                                format.type = 'text';
                                format.value = 'json';
                                form.appendChild(format);
                                esriRequest(constName.TABLE_SXTT_URL + '/addFeatures?f=json', {
                                    method: 'post',
                                    body: form
                                }).then(res => {
                                    if (res.data.addResults[0].success) {
                                        xnotify.update({ 'type': 'success', 'message': 'Cập nhật thời gian sản xuất trồng trọt thành công!', 'progress': 90 });
                                    } else {
                                        xnotify.update({ 'type': 'danger', 'message': 'Cập nhật thời gian sản xuất trồng trọt không thành công!', 'progress': 90 });
                                    }

                                })
                            }
                        }
                        this.layer.applyEdits({
                            updateFeatures: [{
                                attributes: this.attributes
                            }]
                        }).then((res) => {
                            //khi applyEdits, nếu phát hiện lỗi
                            let valid = false;
                            for (let item of res.updateFeatureResults) {
                                if (item.error) {
                                    valid = true;
                                    break;
                                }
                            }
                            //không phát hiện lỗi nên tắt popup
                            if (!valid) {
                                notify.update({ 'type': 'success', 'message': 'Cập nhật thành công!', 'progress': 90 });
                                let query = this.layer.createQuery();
                                query.outField = ['*'];
                                query.where = 'OBJECTID=' + this.attributes['OBJECTID'];
                                this.layer.queryFeatures(query).then(res => {
                                    this.view.popup.open({
                                        features: res.features
                                    })
                                })
                            }
                        })
                    }

                } catch (error) {
                    notify.update({ 'type': 'danger', 'message': 'Có lỗi xảy ra trong quá trình cập nhật!', 'progress': 90 });
                    throw error;
                }
            }
            /**
             * Xóa đối tượng được chọn
             */
            deleteFeature() {
                let accept = confirm('Chắc chắn muốn xóa?');
                if (!accept) return;
                let objectId = this.objectId;
                let notify = $.notify({
                    title: `<strong>Xóa <i>${this.layer.title}</i></strong>`,
                    message: 'Đang xóa...'
                }, {
                        showProgressbar: true,
                        delay: 20000
                    })
                this.layer.applyEdits({
                    deleteFeatures: [{
                        objectId: objectId
                    }] //xoa objectID truyen vao
                }).then((res) => {
                    if (res.deleteFeatureResults.length > 0 && !res.deleteFeatureResults[0].error) {
                        this.view.popup.visible = false;
                        notify.update({ 'type': 'success', 'message': 'Xóa thành công!', 'progress': 100 });
                        this.hightlightGraphic.clear();
                    }
                });
            }
            updateGemetryGPS() {
                let objectId = this.objectId;
                let notify = $.notify({
                    title: `<strong>Cập nhật vị trí</strong>`,
                    message: 'Cập nhật...'
                }, {
                        showProgressbar: true,
                        delay: 20000,
                        placement: {
                            from: 'top',
                            alias: 'left'
                        }
                    })
                this.locateViewModel.locate().then(res => {
                    const coords = res.coords,
                        latitude = coords.latitude,
                        longitude = coords.longitude;
                    const geometry = new Point({
                        latitude: latitude,
                        longitude: longitude,
                        spatialReference: this.view.spatialReference
                    })
                    this.layer.applyEdits({
                        updateFeatures: [{
                            attributes: { objectId: objectId },
                            geometry: geometry
                        }]
                    }).then(res => {
                        if (res.updateFeatureResults[0].error) {
                            notify.update({ 'type': 'danger', 'message': 'Cập nhật không thành công!', 'progress': 90 });
                        } else {
                            notify.update({ 'type': 'success', 'message': 'Cập nhật thành công!', 'progress': 90 });
                        }
                    })
                })
            }
        }
    });