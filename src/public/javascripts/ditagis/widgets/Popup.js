define([
    "dojo/on",
    "dojo/dom",
    "dojo/dom-construct",

    "ditagis/support/Editing"
], function (on, dom, domConstruct, editingSupport) {
    'use strict';
    return class {
        constructor(view) {
            this.view = view;
            this.options = {
                hightLength: 100
            }
            this.fireFields = ['created_user', 'created_date', 'last_edited_user', 'last_edited_date'];
            this.updateIndexAction = 1;
        }
        isFireField(fieldName) {
            return this.fireFields.indexOf(fieldName) !== -1;
        }
        get layers() {
            return this.view.layers;
        }
        startup() {
            this.view.on('layerview-create', (evt) => {
                let layer = evt.layer;
                layer.popupTemplate = {
                    content: (target) => {
                        return this.contentPopup(target);
                    },
                    title: layer.title,
                    actions: [{
                        id: "update",
                        title: "Cập nhật",
                        layerID: layer.name,
                        className: "esri-icon-edit"
                    },
                    {
                        id: "delete",
                        title: "Xóa",
                        layerID: layer.name,
                        className: "esri-icon-erase"
                    }
                    ]
                }
            })
            this.view.popup.on("trigger-action", (evt) => {
                this.triggerActionHandler(evt);
            }); //đăng ký sự kiện khi click vào action
        }
        triggerActionHandler(event) {
            let id = event.action.layerID,
                layer = this.view.map.getLayer(id);
            if (layer) {

                let actionId = event.action.id,
                    selectedFeature = this.view.popup.viewModel.selectedFeature,
                    attributes = selectedFeature.attributes,
                    objectid = attributes.OBJECTID;
                const per = layer.getPermission();
                switch (actionId) {
                    case "update":
                        if (per && per.edit) {
                            this.showPopup(layer, attributes);
                        }
                        break;
                    case "delete":
                        if (per && per.delete) {
                            this.deleteFeature(layer, objectid);
                        }
                        break;
                    default:
                        break;
                }
            }
        }

        /**
         * Hiển thị popup
         * @param {esri/layers/FeatureLayer} layer - layer được chọn (clickEvent)
         * @param {object} attributes - thông tin của layer được chọn
         */
        showPopup(layer, attributes) {
            let div = domConstruct.create('div');
            let table = domConstruct.create('table', {}, div);
            let hideFields = layer.getHideFields(attributes);
            //duyệt thông tin đối tượng
            for (let field of layer.fields) {
                const alias = field.alias,
                    name = field.name,
                    type = field.type,
                    length = field.length;;
                //nếu như field thuộc field cấm thì không hiển thị
                //nếu như field có trong hideFields thì không hiển thị
                if (this.isFireField(name) || hideFields.indexOf(name) !== -1) {
                    continue;
                }
                if (type === 'oid')
                    continue;
                //tạo <tr>
                let row = domConstruct.create('tr');
                //tạo <td>
                let tdName = domConstruct.create('td', {
                    innerHTML: alias
                }),
                    input,
                    tdValue = domConstruct.create('td');
                //kiểm tra domain
                const domain = layer.getFieldDomain(name);
                if (domain && domain.type === "codedValue") {
                    input = domConstruct.create('select', {
                        name: name,
                        id: name,
                    })
                    for (let codedValue of domain.codedValues) {
                        let dmCode = codedValue.code,
                            dmName = codedValue.name;
                        let option = domConstruct.create('option', {
                            value: dmCode,
                        });
                        if (attributes[name] === dmCode) {
                            option.selected = 'selected'
                        }
                        option.innerHTML = dmName;
                        domConstruct.place(option, input);
                    }
                } else {
                    let inputType, value;
                    if (type === "small-integer" ||
                        (type === "integer") ||
                        (type === "double"))
                        inputType = 'number';
                    else if (type === 'date') {
                        inputType = 'date';
                        var d = new Date(attributes[name]),
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
                            id: name,
                            name: name,
                            innerHTML: value || attributes[name],
                        }, tdValue);
                    } else {
                        input = domConstruct.create('input', {
                            type: inputType,
                            id: name,
                            name: name,
                            value: value || attributes[name],
                        });

                    }
                }

                input['data-attributes'] = attributes;
                domConstruct.place(input, tdValue);
                domConstruct.place(tdName, row);
                domConstruct.place(tdValue, row);
                domConstruct.place(row, table);

                //thêm vào html
                on(input, 'change', (evt) => {
                    this.inputChangeHandler(layer, evt.target);
                })
            }
            let btnSubmit = domConstruct.create('input', {
                value: 'Cập nhật',
                type: 'button',
                class: 'btn-popup'
            }, div);
            on(btnSubmit, 'click', () => {
                this.editFeature(layer, attributes);
            })
            this.view.popup.content = div;
            this.view.popup.title = layer.title;
        }
        /**
         * 
         * @param {esri/layers/FeatureLayer} layer 
         * @param {htmldom} input 
         */
        inputChangeHandler(layer, input) {
            const name = input.name,
                value = input.value,
                attributes = input['data-attributes'];
            let fieldType;
            for (let field of layer.fields) {
                if (field.name === name)
                    fieldType = field.type;
            }
            if (fieldType) {
                if (fieldType === "small-integer" || fieldType === "integer")
                    attributes[name] = parseInt(value);
                else if (fieldType === "double")
                    attributes[name] = parseFloat(value);
                else {
                    attributes[name] = value;
                }
                const domain = layer.getFieldDomain(name);
                if (domain && domain.type === "codedValue") {
                    this.showPopup(layer, attributes);
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
            let hideFields = layer.getHideFields(attributes);
            let table = domConstruct.create('table');
            //duyệt thông tin đối tượng
            for (let field of layer.fields) {
                const alias = field.alias,
                    name = field.name,
                    type = field.type,
                    length = field.length;
                let value = attributes[name];
                //nếu như field có trong hideFields thì không hiển thị
                if (hideFields.indexOf(name) !== -1) {
                    continue;
                }
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
                const domain = layer.getFieldDomain(name);
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
                        innerHTML: content
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
            return table.outerHTML;
        }


        /**
         * Sự kiện chỉnh sửa thông tin đối tượng
         */
        editFeature(layer, attributes) {
            if (attributes) {
                let hideFields = layer.getHideFields(attributes);
                for (let field of layer.fields) {
                    const type = field.type,
                        name = field.name;
                    //nếu như field nào thuộc hideField thì reset giá trị về null
                    if (hideFields.indexOf(name) !== -1) {
                        attributes[name] = null;
                    }
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
                layer.applyEdits({
                    updateFeatures: [{
                        attributes: attributes
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
                        view.popup.visible = false;
                    }
                })
            }

        }
        /**
         * Xóa đối tượng được chọn
         * @param {esri/layers/FeatureLayer} layer 
         * @param {string} objectid 
         */
        deleteFeature(layer, objectid) {
            layer.applyEdits({
                deleteFeatures: [{
                    objectId: objectid
                }] //xoa objectID truyen vao
            }).then((res) => {
                if (res.deleteFeatureResults.length > 0) {
                    view.popup.visible = false;
                }
            });
        }
    }
});