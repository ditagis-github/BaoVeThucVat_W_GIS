define([
    "dojo/on",
    "dojo/dom",
    "dojo/dom-construct",
    'dojo/window',
    "dojo/sniff",
    "ditagis/support/Editing",
    "ditagis/support/HightlightGraphic",
    "ditagis/toolview/bootstrap",

    "esri/symbols/SimpleMarkerSymbol",
    "esri/symbols/SimpleFillSymbol",
    "esri/tasks/QueryTask",
    "esri/core/watchUtils",
    "esri/request"

], function (on, dom, domConstruct, win, has, editingSupport, HightlightGraphic, bootstrap, SimpleMarkerSymbol, SimpleFillSymbol, QueryTask, watchUtils, esriRequest) {
    'use strict';
    return class {
        constructor(view) {
            this.view = view;
            this.options = {
                hightLength: 100
            }
            this.fireFields = ['NgayCapNhat', 'NguoiCapNhat', 'MaPhuongXa', 'MaHuyenTP'];

            this.inputElement = {};
            this.hightlightGraphic = new HightlightGraphic(view, {
                symbolMarker: new SimpleMarkerSymbol({
                    outline: { // autocasts as new SimpleLineSymbol()
                        color: '#7EABCD', // autocasts as new Color()
                        width: 2
                    }
                }),
                symbolFill: new SimpleFillSymbol({
                    outline: {
                        color: '#7EABCD', // autocasts as new Color()
                        width: 2
                    }
                })
            });
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
        startup() {
            // this.view.on('layerview-create', (evt) => {
            this.view.map.layers.map(layer => {
                layer.then(() => {
                    // let layer = evt.layer;
                    if (layer.type == 'feature') {
                        let actions = [];
                        if (layer.permission.edit)
                            actions.push({
                                id: "update",
                                title: "Cập nhật",
                                className: "esri-icon-edit",
                            });
                        if (layer.permission.delete)
                            actions.push({
                                id: "delete",
                                title: "Xóa",
                                className: "esri-icon-erase",
                            })
                        if (layer.id === constName.TRONGTROT) {
                            actions.push({
                                id: "view-detail",
                                title: "Chi tiết thời gian trồng trọt",
                                className: "esri-icon-table",
                            })
                        }
                        layer.popupTemplate = {
                            content: (target) => {
                                return this.contentPopup(target);
                            },
                            title: layer.title,
                            actions: actions
                        }
                    }

                });
            })

            this.view.popup.watch('visible', (newValue) => {
                if (!newValue)//unvisible
                    this.hightlightGraphic.clear();
            })
            this.view.popup.on("trigger-action", (evt) => {
                this.triggerActionHandler(evt);
            }); //đăng ký sự kiện khi click vào action
            this.view.popup.dockOptions = {
                // Disable the dock button so users cannot undock the popup
                buttonEnabled: true,
                // Dock the popup when the size of the view is less than or equal to 600x1000 pixels
                breakpoint: {
                    width: 600,
                    height: 1000
                },
                position: 'top-right'
            };
        }
        triggerActionHandler(event) {
            let actionId = event.action.id,
                selectedFeature = this.view.popup.viewModel.selectedFeature,
                layer = selectedFeature.layer,
                attributes = selectedFeature.attributes,
                objectid = attributes.OBJECTID;
            let fail = false;
            switch (actionId) {
                case "update":
                    if (layer.permission && layer.permission.edit) {
                        if (event.action.className === 'esri-icon-check-mark') {
                            this.editFeature(layer, attributes);
                        } else {
                            this.showEdit(layer, attributes);
                        }
                    } else {
                        fail = true;
                    }
                    break;
                case "delete":
                    if (layer.permission && layer.permission.delete) {
                        this.deleteFeature(layer, objectid);
                    } else {
                        fail = true;
                    }
                    break;
                case "view-detail":
                    if (attributes['MaDoiTuong'])
                        this.triggerActionViewDetailTrongtrot(attributes['MaDoiTuong']);
                    else
                        $.notify({
                            message: 'Không xác được định danh'
                        }, {
                                type: 'danger'
                            })
                    break;
                default:
                    break;
            }
            if (fail) {
                $.notify({
                    message: 'Không có quyền thực hiện tác vụ'
                }, {
                        type: 'danger'
                    })
            }
        }
        /**
         * Lấy subtype của {name} với giá trị {value} trong {layer}
         * @param {*} layer 
         * @param {*} name 
         * @param {*} value 
         * @return subtype
         */
        getSubtype(layer, name, value) {
            if (layer.typeIdField === name) {
                const typeIdField = layer.typeIdField,//tên thuộc tính của subtypes
                    domainType = layer.getFieldDomain(typeIdField),//lấy domain
                    subtypes = layer.types,//subtypes
                    subtype = subtypes.find(f => f.id == value);
                return subtype;
            }
            return null;
        }

        /**
         * Hiển thị popup
         * @param {esri/layers/FeatureLayer} layer - layer được chọn (clickEvent)
         * @param {object} attributes - thông tin của layer được chọn
         */
        showEdit(layer, attributes) {
            var pass = (row, tdName, tdValue, input, field) => {
                //kiểm tra domain
                if (field.domain && field.domain.type === "codedValue") {
                    input = domConstruct.create('select', {
                        name: field.name,
                        id: field.name
                    })
                    for (let codedValue of field.domain.codedValues) {
                        let dmCode = codedValue.code,
                            dmName = codedValue.name;
                        let option = domConstruct.create('option', {
                            value: dmCode,
                        });
                        if (attributes[field.name] === dmCode) {
                            option.selected = 'selected'
                        }
                        option.innerHTML = dmName;
                        domConstruct.place(option, input);
                    }
                } else {
                    let inputType, value;
                    if (field.type === "small-integer" ||
                        (field.type === "integer") ||
                        (field.type === "double"))
                        inputType = 'number';
                    else if (field.type === 'date') {
                        inputType = 'date';
                        var d = new Date(attributes[field.name]),
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
                            id: field.name,
                            name: field.name,
                            innerHTML: value || attributes[field.name],
                        }, tdValue);
                    } else {
                        input = domConstruct.create('input', {
                            type: inputType,
                            id: field.name,
                            name: field.name,
                            value: value || attributes[field.name],
                        });

                    }
                }
                input.readOnly = this.isFireField(field.name)
                domConstruct.place(input, tdValue);
                domConstruct.place(tdName, row);
                domConstruct.place(tdValue, row);
                domConstruct.place(row, table);

                this.inputElement[field.name] = input;
                //thêm vào html
                on(input, 'change', (evt) => {
                    this.inputChangeHandler(layer, evt.target, attributes);
                })
            }
            this.resetInputElement();
            let div = domConstruct.create('div', {
                id: 'show-edit-container',
                class: 'popup-content'
            });
            let table = domConstruct.create('table', {}, div);
            if (layer.id === constName.TRONGTROT) {
                var timeChangeHandle = () => {
                    attributes.LoaiCayTrongs = [];
                    let input = this.inputElement['NhomCayTrong'];
                    if (input) {
                        $.post('map/trongtrot/thoigian', {
                            id: attributes.MaDoiTuong, month: inputMonth.value, year: inputYear.value
                        }).done(results => {
                            if (results && results.length > 0) {
                                let loaiCayTrong = [];
                                for (let result of results) {
                                    //neu co nhom cay trong
                                    if (result.NhomCayTrong) {
                                        input.value = result.NhomCayTrong;
                                        inputNhomCayTrongChangeHandler(result.NhomCayTrong)
                                    }
                                    //neu co loai cay trong
                                    if (result.LoaiCayTrong)
                                        loaiCayTrong.push(result.LoaiCayTrong);
                                }
                                // updateLoaiCayTrong(loaiCayTrong);
                                if (loaiCayTrong.length > 0)
                                    checkedLoaiCayTrong(loaiCayTrong);
                            }
                        });
                    }
                }
                // var updateTrongTrongTimer = ()=>{
                //     //neu chua co thi tao
                //     if(!attributes['ThoiGianTrongTrot']){
                //         attributes['ThoiGianTrongTrot'] = [];
                //     }

                //     let items = attributes['ThoiGianTrongTrot'];
                //     let item = items.find(f=>f.Thang === thang && f.Nam === nam);
                //     //neu ton tai thoi gian
                //     if(item){
                //         //neu chua co loai cay trong thi tao
                //         if(!item['LoaiCayTrongs']){
                //             item['LoaiCayTrongs'] = [];
                //         }
                //     }
                //     //neu chua ton tai thoi gian
                //     else{

                //     }
                // }
                var inputNhomCayTrongChangeHandler = (value) => {
                    value = value || 1;
                    let subtype = this.getSubtype(layer, 'NhomCayTrong', value);
                    let domain =
                        (subtype.domains.LoaiCayTrong && subtype.domains.LoaiCayTrong.type === "codedValues") ? subtype.domains.LoaiCayTrong : layer.getFieldDomain('LoaiCayTrong');
                    updateLoaiCayTrong(domain.codedValues);
                }
                var checkedLoaiCayTrong = (values) => {
                    if (values && values.length > 0) {
                        let childNodes = tdValueLCT.childNodes;
                        if (childNodes && childNodes.length > 0) {
                            for (let value of values) {
                                for (let child of childNodes) {
                                    if (child.type === 'checkbox' && child.value == value)
                                        child.checked = true;
                                }
                            }
                        }
                    }
                }
                var updateLoaiCayTrong = (values) => {
                    if (values && values.length > 0) {
                        tdValueLCT.innerHTML = '';
                        for (let codedValue of values) {
                            if (codedValue) {
                                let input = domConstruct.create('input', {
                                    type: 'checkbox',
                                    name: 'LoaiCayTrong',
                                    value: codedValue.code
                                }, tdValueLCT);
                                domConstruct.create('text', {
                                    innerHTML: codedValue.name + '<br>'
                                }, tdValueLCT);
                                on(input, 'change', evt => {
                                    //neu chua co 
                                    if (!attributes['LoaiCayTrongs']) {
                                        attributes['LoaiCayTrongs'] = [];
                                    }
                                    //neu loai cay trong duoc chon thi them vao
                                    if (evt.target.checked) {
                                        attributes['LoaiCayTrongs'].push(evt.target.value);
                                    }
                                    //neu khong chon thi kiem tra trong mang da co chua, neu co thi xoa
                                    else {
                                        let index = attributes['LoaiCayTrongs'].indexOf(evt.target.value);
                                        if (index !== -1) {
                                            attributes['LoaiCayTrongs'].splice(index, 1);
                                        }
                                    }
                                });
                            }
                        }
                    }
                }
                //duyệt thông tin đối tượng
                for (let field of layer.fields) {
                    //nếu như field thuộc field cấm thì không hiển thị
                    if (field.type === 'oid' || field.name === 'MaDoiTuong' || field.name === 'LoaiCayTrong') {
                        continue;
                    }
                    //tạo <tr>
                    let row = domConstruct.create('tr', {}, table);
                    //tạo <td>
                    let
                        tdName = domConstruct.create('td', {
                            innerHTML: field.alias
                        }, row),
                        tdValue = domConstruct.create('td', {}, row),
                        input;
                    //kiểm tra domain
                    if (field.name === 'NhomCayTrong') {

                        /**
                         * 
                         * @param {*} input Nhóm cây trồng
                         */

                        input = domConstruct.create('select', {
                            name: field.name,
                            id: field.name,
                        }, tdValue)
                        for (let codedValue of field.domain.codedValues) {
                            let dmCode = codedValue.code,
                                dmName = codedValue.name;
                            let option = domConstruct.create('option', {
                                value: dmCode,
                            });
                            if (attributes[field.name] === dmCode) {
                                option.selected = 'selected'
                            }
                            option.innerHTML = dmName;
                            domConstruct.place(option, input);
                        }
                        //tạo <tr>
                        let trLCT = domConstruct.create('tr', {}, table);
                        //tạo <td>
                        let tdNameLCT = domConstruct.create('td', {
                            innerHTML: 'Loại cây trồng'
                        }, trLCT);
                        var tdValueLCT = domConstruct.create('td', {}, trLCT);
                        this.inputElement['LoaiCayTrong'] = tdValueLCT;
                        on(input, 'change', (evt) => {
                            inputNhomCayTrongChangeHandler(evt.target.value);
                        })

                        inputNhomCayTrongChangeHandler(attributes[field.name]);

                        ///TIMER//
                        var currentTime = new Date();
                        //Month
                        //tạo <tr>
                        var trMonth = domConstruct.create('tr', {}, table);
                        //tạo <td>
                        var tdNameMonth = domConstruct.create('td', {
                            innerHTML: 'Tháng'
                        }, trMonth);
                        var tdValueMonth = domConstruct.create('td', {}, trMonth);
                        var inputMonth = domConstruct.create('select', {
                        }, tdValueMonth)
                        for (var i = 0; i < 12; i++) {
                            let option = domConstruct.create('option', {
                                value: i + 1,
                                innerHTML: i + 1
                            });
                            domConstruct.place(option, inputMonth);
                        }
                        //chon thang hien tai
                        inputMonth.value = currentTime.getMonth() + 1;
                        attributes['Thang'] = parseInt(inputMonth.value);
                        on(inputMonth, 'change', (evt) => {
                            timeChangeHandle();
                            attributes['Thang'] = parseInt(inputMonth.value);
                        })

                        //Year
                        //tạo <tr>
                        var trYear = domConstruct.create('tr', {}, table);
                        //tạo <td>
                        var tdNameYear = domConstruct.create('td', {
                            innerHTML: 'Năm'
                        }, trYear);
                        var tdValueYear = domConstruct.create('td', {}, trYear);
                        var inputYear = domConstruct.create('select', {}, tdValueYear);
                        for (var i = 2015; i <= currentTime.getFullYear() + 1; i++) {
                            let option = domConstruct.create('option', {
                                value: i,
                                innerHTML: i
                            });
                            domConstruct.place(option, inputYear);

                        }
                        //chon nam hien tai
                        inputYear.value = currentTime.getFullYear();
                        attributes['Nam'] = parseInt(inputYear.value);
                        on(inputYear, 'change', (evt) => {
                            timeChangeHandle();
                            attributes['Nam'] = parseInt(inputYear.value);
                        })
                        this.inputElement[field.name] = input;
                        timeChangeHandle();
                    } else {
                        pass(row, tdName, tdValue, input, field);
                    }
                }
            } else {
                //duyệt thông tin đối tượng
                for (let field of layer.fields) {

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
                    pass(row, tdName, tdValue, input, field);
                }

            }
            if (layer.hasAttachments) {


                this.getAttachments(layer, attributes['OBJECTID']).then(res => {
                    let div = domConstruct.create('div', {
                        class: 'attachment-header',
                        id: `attachment-${layer.id}-${attributes['OBJECTID']}`
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
                    on(file, 'change', () => {
                        this.inputChangeHandler(layer, file, attributes);
                    });

                    if (res && res.attachmentInfos && res.attachmentInfos.length > 0) {


                        for (let item of res.attachmentInfos) {
                            this.renderAttachmentEditPopup(item, {
                                container: div,
                                layer: layer,
                                attributes: attributes
                            })
                        }
                    }
                })
            }
            this.view.popup.content = div;
            this.view.popup.title = layer.title;
            let updateAction = this.view.popup.actions.find(function (action) {
                return action.id === 'update';
            })
            updateAction.className = 'esri-icon-check-mark';
            watchUtils.once(this.view.popup, 'selectedFeature').then(result => {
                updateAction.className = 'esri-icon-edit';
            })
            watchUtils.once(this.view.popup, 'visible').then(result => {
                updateAction.className = 'esri-icon-edit';
            })
        }
        renderAttachmentEditPopup(item, props) {
            const
                layer = props.layer || this.view.poup.selectedFeature.layer,
                attributes = props.attributes || this.view.poup.selectedFeature.attributes,
                container = props.container || document.getElementById(`attachment-${layer.id}-${attributes['OBJECTID']}`);

            let url = `${layer.url}/${layer.layerId}/${attributes['OBJECTID']}`;
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
        /**
         * Khi ô nhập dữ liệu trong popup có sự thay đổi giá trị
         * @param {esri/layers/FeatureLayer} layer 
         * @param {htmldom} input 
         */
        inputChangeHandler(layer, input, attributes) {
            const name = input.name,
                value = input.value;
            if (name === 'attachment') {
                attributes[name] = value;
            } else {
                const field = layer.fields.find(f => f.name === name);
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
                        attributes[name] = convertValue;
                    }
                }
            }
        }
        /**
         * Hiển thị popup
         * @param {esri/layers/FeatureLayer} layer - layer được chọn (clickEvent)
         * @param {object} attributes - thông tin của layer được chọn
         */
        contentPopup(target) {
            const graphic = target.graphic,
                layer = graphic.layer,
                attributes = graphic.attributes;

            //hightlight graphic
            this.hightlightGraphic.clear();
            this.hightlightGraphic.add(graphic);
            let
                div = domConstruct.create('div', {
                    class: 'popup-content',
                    id: 'popup-content'
                }),
                table = domConstruct.create('table', {}, div);
            //duyệt thông tin đối tượng
            for (let field of layer.fields) {
                const alias = field.alias,
                    name = field.name,
                    type = field.type,
                    length = field.length,
                    domain = field.domain;
                let value = attributes[name];
                if (type === 'oid')
                    continue;
                //tạo <tr>
                let row = domConstruct.create('tr');
                //tạo <td>
                let tdName = domConstruct.create('td', {
                    innerHTML: alias
                }),
                    input, content, formatString;
                //nếu field có domain thì hiển thị value theo name của codevalues
                if (domain && domain.type === "codedValue") {
                    const codedValues = domain.codedValues;
                    //lấy name của code
                    for (let codedValue of domain.codedValues) {
                        let code = codedValue.code,
                            name = codedValue.name;
                        if (code === value) {
                            // content = `${name}`
                            value = name;
                            break;
                        }
                    }

                } else {
                    //lấy formatString
                    if (type === "small-integer" ||
                        (type === "integer") ||
                        (type === "double")) {
                        // formatString = 'NumberFormat(places:2)';
                    } else if (type === 'date') {
                        formatString = 'DateFormat';
                    }
                }
                //nếu như có formatString
                if (formatString) {
                    content = `{${name}:${formatString}}`;
                } else {
                    content = value;
                }
                let tdValue = domConstruct.create('td');
                var txtArea = null;
                //neu co area thi cho area vao trong td. <td><textarea>{content}</textarea></td>
                if (length >= this.options.hightLength) {
                    txtArea = domConstruct.create('textarea', {
                        rows: 5,
                        cols: 25,
                        readonly: true,
                        innerHTML: content,
                        style: 'background: transparent;border:none'
                    }, tdValue);
                }
                //neu khong thi co content vao trong td. <td>{content}</td>
                else {
                    tdValue.innerHTML = content;
                }
                domConstruct.place(tdName, row);
                domConstruct.place(tdValue, row);
                domConstruct.place(row, table);
            }
            if (layer.hasAttachments) {

                this.getAttachments(layer, attributes['OBJECTID']).then(res => {
                    if (res && res.attachmentInfos && res.attachmentInfos.length > 0) {
                        let div = domConstruct.create('div', {
                            class: 'attachment-container'
                        }, document.getElementById('popup-content'));
                        // div.innerText = "Hình ảnh";
                        domConstruct.create('legend', {
                            innerHTML: 'Hình ảnh'
                        }, div)
                        let url = `${layer.url}/${layer.layerId}/${attributes['OBJECTID']}`;
                        for (let item of res.attachmentInfos) {
                            let itemDiv = domConstruct.create('div', {
                                class: 'col-lg-3 col-md-4 col-xs-6 thumb'
                            }, div);
                            let itemA = domConstruct.create('a', {
                                class: "thumbnail", href: "#",
                                // 'data-image-id':"",
                                //  'data-toggle':"modal",
                                //   'data-title':`data.name`,
                                //     'data-image':`${url}/attachments/${item.id}`,
                                //      'data-target':"#image-gallery"
                            }, itemDiv)

                            let img = domConstruct.create('img', {
                                class: 'img-responsive',
                                id: `${url}/attachments/${item.id}`, src: `${url}/attachments/${item.id}`, alt: `${url}/attachments/${item.name}`,
                            }, itemA)
                            on(itemA, 'click', () => {
                                let body = img.outerHTML;
                                let modal = bootstrap.modal(`attachments-${item.id}`, item.name, body);
                                if (modal) modal.modal();
                            })
                        }

                    }
                })
            }
            return div.outerHTML;
        }
        /**
         * ATTACHMENT
         */
        uploadFile() {
            let url = this.view.popup.selectedFeature.layer.url + "/" + this.view.popup.selectedFeature.layer.layerId + "/" + this.view.popup.selectedFeature.attributes.OBJECTID + "/addAttachment";
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
         * @param {*} feature 
         */
        getAttachments(layer, id) {
            return new Promise((resolve, reject) => {
                var url = layer.url + "/" + layer.layerId + "/" + id;
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
        editFeature(layer, attributes) {
            let notify = $.notify({
                title: `<strong>Cập nhật <i>${layer.title}</i></strong>`,
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
                if (attributes) {
                    if (attributes['attachment']) {
                        this.uploadFile();
                    }
                    if (attributes.deleteAttachment) {
                        for (let url of attributes.deleteAttachment) {
                            esriRequest(url);
                        }
                        attributes.deleteAttachment = [];
                    }
                    for (let field of layer.fields) {
                        const type = field.type,
                            name = field.name;
                        if (type === 'date') {
                            let date = attributes[name]
                            //nếu như date có giá trị và date không phải là số
                            if (date && !Number.isInteger(date)) {
                                let
                                    splitDate = date.split('-');
                                if (splitDate.length == 3) {
                                    day = splitDate[2],
                                        month = splitDate[1],
                                        year = splitDate[0];
                                    var dayString = new Date(`${month}/${day}/${year}`);
                                    const timestamp = dayString.getTime();
                                    attributes[name] = timestamp;
                                } else {
                                    throw 'Không thể lấy dữ liệu thời gian'
                                }
                            }
                        }
                    }
                    const updatedInfo = editingSupport.getUpdatedInfo(this.view)
                    for (let i in updatedInfo) {
                        attributes[i] = updatedInfo[i];
                    }
                    //nếu là Trồng trọt thì xét đến trường hợp Loại cây trồng và thời gian
                    //lấy danh sách loại cây trồng dã tick
                    if (layer.id === constName.TRONGTROT) {
                        const
                            nhomCayTrong = attributes['NhomCayTrong'],
                            loaiCayTrongs = attributes['LoaiCayTrongs'],
                            thang = attributes['Thang'],
                            nam = attributes['Nam'];
                        //thêm vào dữ liệu
                        //neu co loai cay trong
                        let datas = [];
                        if (loaiCayTrongs && loaiCayTrongs.length > 0) {
                            for (let loaiCayTrong of loaiCayTrongs) {
                                datas.push({
                                    MaDoiTuong: attributes['MaDoiTuong'],
                                    Thang: thang,
                                    Nam: nam,
                                    NhomCayTrong: nhomCayTrong,
                                    LoaiCayTrong: loaiCayTrong
                                });

                            }
                            //xoa het du lieu
                            attributes.LoaiCayTrongs = [];
                        }
                        //neu khong thi khong them loai cay trong
                        else {
                            datas.push({
                                MaDoiTuong: attributes['MaDoiTuong'],
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
                            esriRequest('https://ditagis.com:6443/arcgis/rest/services/BinhDuong/BaoVeThucVat/FeatureServer/4/addFeatures?f=json', {
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
                    layer.applyEdits({
                        updateFeatures: [{
                            attributes: attributes
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
         * @param {esri/layers/FeatureLayer} layer 
         * @param {string} objectid 
         */
        deleteFeature(layer, objectid) {
            let notify = $.notify({
                title: `<strong>Xóa <i>${layer.title}</i></strong>`,
                message: 'Đang xóa...'
            }, {
                    showProgressbar: true,
                    delay: 20000
                })
            layer.applyEdits({
                deleteFeatures: [{
                    objectId: objectid
                }] //xoa objectID truyen vao
            }).then((res) => {
                if (res.deleteFeatureResults.length > 0 && !res.deleteFeatureResults[0].error) {
                    this.view.popup.visible = false;
                    notify.update({ 'type': 'success', 'message': 'Xóa thành công!', 'progress': 100 });
                    this.hightlightGraphic.clear();
                }
            });
        }
        /**
         * Xem thông tin thời gian trồng trọt
         * @param {*} maDoiTuong Mã đối tượng trồng trọt
         */
        triggerActionViewDetailTrongtrot(maDoiTuong) {
            let notify = $.notify({
                title: 'Thời gian trồng trọt thửa đất: ' + maDoiTuong,
                message: 'Đang truy vấn...'
            }, {
                    delay: 20000,
                    showProgressbar: true
                })
            // $.post('map/trongtrot/thoigian/getbymadoituong', {
            //     MaDoiTuong: maDoiTuong
            // }).done(results => {
            let queryTask = new QueryTask('https://ditagis.com:6443/arcgis/rest/services/BinhDuong/BaoVeThucVat/FeatureServer/4');
            queryTask.execute({
                outFields: ['*'],
                where: `MaDoiTuong = '${maDoiTuong}'`
            }).then(results => {
                if (results.features.length > 0) {
                    notify.update({
                        message: `Tìm thấy ${results.features.length} dữ liệu`,
                        progress: 100
                    }, {
                            type: 'success'
                        })

                    let table = domConstruct.create('table', {
                        class: 'table table-hover'
                    });
                    let thead = domConstruct.toDom(`<thead>
                        <tr>
                            <th>Thời gian</th>
                            <th>Nhóm cây trồng</th>
                            <th>Loại cây trồng</th>
                        </tr>
                        </thead>`)
                    domConstruct.place(thead, table);
                    let tbody = domConstruct.create('tbody', {}, table);
                    for (let feature of results.features) {
                        const item = feature.attributes;
                        //tạo <tr>
                        let row = domConstruct.create('tr', {}, tbody);
                        //thoi gian
                        domConstruct.create('td', {
                            innerHTML: `${item.Thang}/${item.Nam}`
                        }, row);
                        //nhom cay trong
                        domConstruct.create('td', {
                            innerHTML: `${item.NhomCayTrong}`
                        }, row);
                        //loai cay trong
                        domConstruct.create('td', {
                            innerHTML: `${item.LoaiCayTrong}`
                        }, row);
                    }
                    let dlg = domConstruct.toDom(`
                            <div id="ttModal" class="modal fade" role="dialog">
                            <div class="modal-dialog" style="width:fit-content">

                                <!-- Modal content-->
                                <div class="modal-content">
                                <div class="modal-header">
                                    <button type="button" class="close" data-dismiss="modal">&times;</button>
                                    <h4 class="modal-title">Thời gian trồng trọt</h4>
                                </div>
                                <div class="modal-body" id="ttModal-body">
                                    ${table.outerHTML}
                                </div>
                                <div class="modal-footer">
                                    <button type="button" class="btn btn-default" data-dismiss="modal">Đóng</button>
                                </div>
                                </div>

                            </div>
                            </div>`);
                    document.body.appendChild(dlg);
                    $('#ttModal').on('hidden.bs.modal', function () {
                        let ttModal = document.getElementById('ttModal');//trongtrotModal
                        if (ttModal)
                            document.body.removeChild(ttModal);
                    })
                    $('#ttModal').modal();
                } else {
                    notify.update({
                        type: 'danger',
                        message: 'Không tìm thấy dữ liệu',
                        progress: 100
                    })
                }
            })
        }
    }
});