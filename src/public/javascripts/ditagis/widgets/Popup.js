define([
    "dojo/on",
    "dojo/dom",
    "dojo/dom-construct",
    "dijit/Dialog",
    "ditagis/support/Editing"

], function (on, dom, domConstruct, Dialog, editingSupport) {
    'use strict';
    return class {
        constructor(view) {
            this.view = view;
            this.options = {
                hightLength: 100
            }
            this.fireFields = ['NgayCapNhat', 'NguoiCapNhat'];
            this.updateIndexAction = 1;

            this.inputElement = {};
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
            view.popup.dockOptions = {
                // Disable the dock button so users cannot undock the popup
                buttonEnabled: false,
                // Dock the popup when the size of the view is less than or equal to 600x1000 pixels
                breakpoint: {
                    width: 600,
                    height: 1000
                },
                position: 'top-right'
            };
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
                            this.showEdit(layer, attributes);
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
            this.resetInputElement();
            let div = domConstruct.create('div');
            let table = domConstruct.create('table', {}, div);
            if (layer.name === constName.TRONGTROT) {
                //duyệt thông tin đối tượng
                for (let field of layer.fields) {
                    const alias = field.alias,
                        name = field.name,
                        type = field.type,
                        length = field.length,
                        domain = field.domain;
                    //nếu như field thuộc field cấm thì không hiển thị
                    if (this.isFireField(name) || type === 'oid' || name === 'MaDoiTuong' || name === 'LoaiCayTrong') {
                        continue;
                    }
                    //tạo <tr>
                    let row = domConstruct.create('tr', {}, table);
                    //tạo <td>
                    let
                        tdName = domConstruct.create('td', {
                            innerHTML: alias
                        }, row),
                        tdValue = domConstruct.create('td', {}, row),
                        input;
                    //kiểm tra domain
                    if (name === 'NhomCayTrong') {

                        /**
                         * 
                         * @param {*} input Nhóm cây trồng
                         */
                        var timeChangeHandle = () => {
                            attributes.LoaiCayTrongs=[];
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
                            let subtype = this.getSubtype(layer, 'NhomCayTrong', value);
                            let domain = subtype.domains.LoaiCayTrong || layer.getFieldDomain('LoaiCayTrong');
                            updateLoaiCayTrong(domain.codedValues);
                        }
                        function checkedLoaiCayTrong(values) {
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
                        function updateLoaiCayTrong(values) {
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
                        input = domConstruct.create('select', {
                            name: name,
                            id: name,
                        }, tdValue)
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
                        //tạo <tr>
                        let trLCT = domConstruct.create('tr', {}, table);
                        //tạo <td>
                        let tdNameLCT = domConstruct.create('td', {
                            innerHTML: 'Loại cây trồng'
                        }, trLCT);
                        let tdValueLCT = domConstruct.create('td', {}, trLCT);
                        this.inputElement['LoaiCayTrong'] = tdValueLCT;
                        on(input, 'change', (evt) => {
                            inputNhomCayTrongChangeHandler(evt.target.value);
                        })

                        inputNhomCayTrongChangeHandler(attributes[name]);

                        ///TIMER//
                        let currentTime = new Date();
                        //Month
                        //tạo <tr>
                        let trMonth = domConstruct.create('tr', {}, table);
                        //tạo <td>
                        let tdNameMonth = domConstruct.create('td', {
                            innerHTML: 'Tháng'
                        }, trMonth);
                        let tdValueMonth = domConstruct.create('td', {}, trMonth);
                        let inputMonth = domConstruct.create('select', {
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
                        let trYear = domConstruct.create('tr', {}, table);
                        //tạo <td>
                        let tdNameYear = domConstruct.create('td', {
                            innerHTML: 'Năm'
                        }, trYear);
                        let tdValueYear = domConstruct.create('td', {}, trYear);
                        let inputYear = domConstruct.create('select', {}, tdValueYear);
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
                        timeChangeHandle();
                    } else {
                        if (domain && domain.type === "codedValue") {
                            input = domConstruct.create('select', {
                                name: name,
                                id: name,
                            }, tdValue)
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
                                }, tdValue);

                            }
                        }
                    }

                    input['data-attributes'] = attributes;

                    this.inputElement[name] = input;
                    //thêm vào html
                    on(input, 'change', (evt) => {
                        this.inputChangeHandler(layer, evt.target, attributes);
                    })
                }
            } else {
                //duyệt thông tin đối tượng
                for (let field of layer.fields) {
                    const alias = field.alias,
                        name = field.name,
                        type = field.type,
                        length = field.length,
                        domain = field.domain;
                    //nếu như field thuộc field cấm thì không hiển thị
                    if (this.isFireField(name)) {
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

                    this.inputElement[name] = input;
                    //thêm vào html
                    on(input, 'change', (evt) => {
                        this.inputChangeHandler(layer, evt.target, attributes);
                    })
                }
            }
            let btnSubmit = domConstruct.create('button', {
                type: 'button',
                class: 'btn-popup-submit',
                title: 'Cập nhật'
            }, div);
            domConstruct.create('span', {
                class: 'esri-icon-check-mark'
            }, btnSubmit);
            on(btnSubmit, 'click', () => {
                this.editFeature(layer, attributes);
            })
            this.view.popup.content = div;
            this.view.popup.title = layer.title;
        }
        /**
         * Khi ô nhập dữ liệu trong popup có sự thay đổi giá trị
         * @param {esri/layers/FeatureLayer} layer 
         * @param {htmldom} input 
         */
        inputChangeHandler(layer, input, attributes) {
            const name = input.name,
                value = input.value;
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
        /**
         * Hiển thị popup
         * @param {esri/layers/FeatureLayer} layer - layer được chọn (clickEvent)
         * @param {object} attributes - thông tin của layer được chọn
         */
        contentPopup(target) {
            const graphic = target.graphic,
                layer = graphic.layer,
                attributes = graphic.attributes;

            let
                div = domConstruct.create('div'),
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
            let ttModal = document.getElementById('ttModal');//trongtrotModal
            if (ttModal)
                document.body.removeChild(ttModal);
            if (layer.name === constName.TRONGTROT) {
                let button = domConstruct.toDom(`<button type="button" class='btn-popup-submit' data-toggle="modal" data-target="#ttModal" title='Chi tiết'><span class='esri-icon-table'></span></button>`);
                domConstruct.place(button, div);
                $.post('map/trongtrot/thoigian/getbymadoituong', {
                    MaDoiTuong: attributes['MaDoiTuong']
                }).done(results => {
                    if (results && results.length > 0) {

                        let table = domConstruct.create('table', {
                            class: 'table table-hover'
                        }, div);
                        let thead = domConstruct.toDom(`<thead>
                            <tr>
                                <th>Thời gian</th>
                                <th>Nhóm cây trồng</th>
                                <th>Loại cây trồng</th>
                            </tr>
                            </thead>`)
                        domConstruct.place(thead, table);
                        let tbody = domConstruct.create('tbody', {}, table);
                        for (let item of results) {
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
                                <!-- Modal -->
                                <div id="ttModal" class="modal fade" role="dialog">
                                <div class="modal-dialog">

                                    <!-- Modal content-->
                                    <div class="modal-content">
                                    <div class="modal-header">
                                        <button type="button" class="close" data-dismiss="modal">&times;</button>
                                        <h4 class="modal-title">Thời gian trồng trọt</h4>
                                    </div>
                                    <div class="modal-body">
                                        ${table.outerHTML}
                                    </div>
                                    <div class="modal-footer">
                                        <button type="button" class="btn btn-default" data-dismiss="modal">Đóng</button>
                                    </div>
                                    </div>

                                </div>
                                </div>`);
                        document.body.appendChild(dlg);

                    }
                })

            }
            return div.outerHTML;
        }

        /**
         * * * * * * * * * * XÓA - SỬA * * * * * * * * * *
         */

        /**
         * Sự kiện chỉnh sửa thông tin đối tượng
         */
        editFeature(layer, attributes) {
            try {
                if (attributes) {
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
                    for (let data of datas) {
                        $.post('map/trongtrot/thoigian/add', data).done(res => {
                            if (res === 'Successfully')
                                $.notify('Thêm thành công dữ liệu: ' + JSON.stringify(data));
                        })
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
                            view.popup.visible = false;
                        }
                    })
                }

            } catch (error) {
                throw error;
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