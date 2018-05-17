define(["require", "exports", "../../toolview/bootstrap", "../../toolview/DateTimeDefine", "esri/Graphic", "../../support/FeatureTable", "dojo/on", "esri/geometry/geometryEngine", "../../classes/ConstName", "../../config"], function (require, exports, bootstrap, DateTimeDefine, Graphic, FeatureTable, on, geometryEngine, constName, mapConfig) {
    "use strict";
    var ThoiGianSanXuatTrongTrotPopup = (function () {
        function ThoiGianSanXuatTrongTrotPopup(params) {
            this.view = params.view;
            this.thoiGianSanXuatTrongTrot = params.table;
            this.tblGiaiDoanSinhTruong = new FeatureTable({
                url: mapConfig.tables.find(function (f) { return f.id === constName.TBL_GIAI_DOAN_SINH_TRUONG; }).url,
                fieldID: 'OBJECTID'
            });
            this.dataDetails = [];
        }
        Object.defineProperty(ThoiGianSanXuatTrongTrotPopup.prototype, "selectFeature", {
            get: function () {
                return this.view.popup.viewModel.selectedFeature;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ThoiGianSanXuatTrongTrotPopup.prototype, "layer", {
            get: function () {
                return this.view.map.findLayerById(constName.TRONGTROT);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ThoiGianSanXuatTrongTrotPopup.prototype, "attributes", {
            get: function () {
                return this.selectFeature.attributes;
            },
            enumerable: true,
            configurable: true
        });
        ThoiGianSanXuatTrongTrotPopup.prototype.getSubtype = function (name, value) {
            name = name || this.layer.typeIdField;
            value = value || this.attributes[name];
            if (this.tblGiaiDoanSinhTruong.typeIdField === name) {
                var typeIdField = this.tblGiaiDoanSinhTruong.typeIdField, subtypes = this.tblGiaiDoanSinhTruong.types, subtype = subtypes.find(function (f) { return f.id == value; });
                return subtype;
            }
            return null;
        };
        ThoiGianSanXuatTrongTrotPopup.prototype.renderDomain = function (domain, name) {
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
        ThoiGianSanXuatTrongTrotPopup.prototype.addDetailTrongTrot = function () {
            var _this = this;
            var div = document.createElement('div');
            var divInfo, formGroupNCT, formGroupLCT, formGroupArea, formGroupTime, formGroupTGBDTT, formGroupTGTT, btnAdd;
            divInfo = document.createElement('div');
            formGroupLCT = document.createElement('div');
            formGroupLCT.classList.add('form-group');
            var lbLCT, inputLCT;
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
            var lbNCT, inputNCT;
            inputNCT = document.createElement('select');
            inputNCT.id = 'NhomCayTrong';
            inputNCT.classList.add('form-control');
            var codedValues = this.layer.getFieldDomain('NhomCayTrong').codedValues;
            for (var _i = 0, codedValues_2 = codedValues; _i < codedValues_2.length; _i++) {
                var codedValue = codedValues_2[_i];
                var dmCode = codedValue.code, dmName = codedValue.name;
                var option = document.createElement('option');
                option.setAttribute('value', dmCode + "");
                option.innerHTML = dmName;
                inputNCT.appendChild(option);
            }
            var inputNCTChange = function () {
                inputLCT.innerHTML = '';
                var defaultComboValue = document.createElement('option');
                defaultComboValue.value = "-1";
                defaultComboValue.innerText = 'Chọn giá trị...';
                inputLCT.appendChild(defaultComboValue);
                var subtype = _this.getSubtype('NhomCayTrong', inputNCT.value);
                if (!subtype)
                    return;
                var domain = subtype.domains['LoaiCayTrong'];
                if (!domain)
                    return;
                var codedValues;
                if (domain.type === "inherited") {
                    var fieldDomain = _this.layer.getFieldDomain('LoaiCayTrong');
                    if (fieldDomain)
                        codedValues = fieldDomain.codedValues;
                }
                else {
                    codedValues = domain.codedValues;
                }
                if (!codedValues)
                    return;
                for (var _i = 0, codedValues_3 = codedValues; _i < codedValues_3.length; _i++) {
                    var codedValue = codedValues_3[_i];
                    var dmCode = codedValue.code, dmName = codedValue.name;
                    var option = document.createElement('option');
                    option.setAttribute('value', dmCode);
                    option.innerHTML = dmName;
                    inputLCT.appendChild(option);
                }
            };
            on(inputNCT, 'change', function () {
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
            var lbArea, inputArea;
            inputArea = document.createElement('input');
            inputArea.id = 'DienTich';
            inputArea.classList.add('form-control');
            if (this.selectFeature.geometry) {
                var area = geometryEngine.geodesicArea(this.selectFeature.geometry, "square-meters").toFixed(1);
                inputArea.value = area + "";
            }
            lbArea = document.createElement('label');
            lbArea.innerText = 'Diện tích (m2)';
            lbArea.setAttribute('for', inputArea.id);
            formGroupArea.appendChild(lbArea);
            formGroupArea.appendChild(inputArea);
            formGroupTGTT = document.createElement('div');
            formGroupTGTT.classList.add('form-group');
            var inputTGTT, lbTGTT;
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
            var inputTime, lbTime;
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
            on(btnAdd, 'click', function () {
                var length = _this.tmpDatasDetailTrongTrong.adds.length;
                var data = {
                    OBJECTID: length + 1,
                    MaDoiTuong: _this.attributes['MaDoiTuong'],
                    NhomCayTrong: parseInt(inputNCT.value),
                    LoaiCayTrong: inputLCT.value == -1 ? null : inputLCT.value,
                    DienTich: inputArea.value ? parseFloat(inputArea.value) : 0,
                    ThoiGianBatDauTrong: !inputTime.value ? null : new Date(inputTime.value),
                    ThoiGianTrongTrot: !inputTGTT.value ? (!inputTime.value ? null : new Date(inputTime.value)) : new Date(inputTGTT.value),
                    GiaiDoanSinhTruong: 'Trồng mới'
                };
                var tableDatas = _this.tmpDatasDetailTrongTrong.tableDatas;
                var addDatas = _this.tmpDatasDetailTrongTrong.adds;
                for (var _i = 0, addDatas_1 = addDatas; _i < addDatas_1.length; _i++) {
                    var d = addDatas_1[_i];
                    if (data.LoaiCayTrong == d.LoaiCayTrong &&
                        data.NhomCayTrong == d.NhomCayTrong && data.ThoiGianBatDauTrong.getTime() === d.ThoiGianBatDauTrong.getTime()) {
                        alert("Dữ liệu vừa mới thêm - Không được thêm nữa");
                        return;
                    }
                }
                _this.tmpDatasDetailTrongTrong.tableDatas.push(data);
                _this.tmpDatasDetailTrongTrong.adds.push(data);
                _this.addDataToDetailTrongtrot(data);
                $('#ModalDetail').modal('toggle');
            });
            divInfo.appendChild(formGroupNCT);
            divInfo.appendChild(formGroupLCT);
            divInfo.appendChild(formGroupArea);
            divInfo.appendChild(formGroupTGBDTT);
            divInfo.appendChild(formGroupTGTT);
            div.appendChild(divInfo);
            var footer = document.createElement('div');
            footer.appendChild(btnAdd);
            var modalDetail = bootstrap.modal('ModalDetail', 'Thêm dữ liệu', div, footer);
            modalDetail.modal();
        };
        ThoiGianSanXuatTrongTrotPopup.prototype.editDetailTrongTrot = function (item) {
            var _this = this;
            var div = document.createElement('div');
            var divInfo, formGroupNCT, formGroupLCT, formGroupArea, formGroupTGTT, formGroupTGBDTT, formGDST, btnEdit;
            divInfo = document.createElement('div');
            formGroupLCT = document.createElement('div');
            formGroupLCT.classList.add('form-group');
            var lbLCT, inputLCT;
            inputLCT = document.createElement('select');
            inputLCT.classList.add('form-control');
            lbLCT = document.createElement('label');
            lbLCT.innerText = 'Loại cây trồng';
            formGroupLCT.appendChild(lbLCT);
            formGroupLCT.appendChild(inputLCT);
            formGroupNCT = document.createElement('div');
            formGroupNCT.classList.add('form-group');
            var lbNCT, inputNCT;
            inputNCT = document.createElement('select');
            inputNCT.classList.add('form-control');
            var codedValues = this.layer.getFieldDomain('NhomCayTrong').codedValues;
            for (var _i = 0, codedValues_4 = codedValues; _i < codedValues_4.length; _i++) {
                var codedValue = codedValues_4[_i];
                var dmCode = codedValue.code, dmName = codedValue.name;
                var option = document.createElement('option');
                option.setAttribute('value', dmCode + "");
                option.innerHTML = dmName;
                inputNCT.appendChild(option);
            }
            inputNCT.value = item.NhomCayTrong + "";
            var inputNCTChange = function () {
                inputLCT.innerHTML = '';
                var defaultComboValue = document.createElement('option');
                defaultComboValue.value = "-1";
                defaultComboValue.innerText = 'Chọn giá trị...';
                inputLCT.appendChild(defaultComboValue);
                var subtype = _this.getSubtype('NhomCayTrong', inputNCT.value);
                if (!subtype)
                    return;
                var domain = subtype.domains['LoaiCayTrong'];
                if (!domain)
                    return;
                var codedValues;
                if (domain.type === "inherited") {
                    var fieldDomain = _this.layer.getFieldDomain('LoaiCayTrong');
                    if (fieldDomain)
                        codedValues = fieldDomain.codedValues;
                }
                else {
                    codedValues = domain.codedValues;
                }
                if (!codedValues)
                    return;
                for (var _i = 0, codedValues_5 = codedValues; _i < codedValues_5.length; _i++) {
                    var codedValue = codedValues_5[_i];
                    var dmCode = codedValue.code, dmName = codedValue.name;
                    var option = document.createElement('option');
                    option.setAttribute('value', dmCode);
                    option.innerHTML = dmName;
                    inputLCT.appendChild(option);
                }
            };
            on(inputNCT, 'change', function () {
                inputNCTChange();
                capNhatGiaiDoanSinhTruong();
            });
            inputNCTChange();
            inputLCT.value = item.LoaiCayTrong;
            on(inputLCT, 'change', function (_) {
                capNhatGiaiDoanSinhTruong();
            });
            lbNCT = document.createElement('label');
            lbNCT.innerText = 'Nhóm cây trồng';
            formGroupNCT.appendChild(lbNCT);
            formGroupNCT.appendChild(inputNCT);
            formGroupArea = document.createElement('div');
            formGroupArea.classList.add('form-group');
            var lbArea, inputArea;
            inputArea = document.createElement('input');
            inputArea.type = 'number';
            inputArea.value = item.DienTich + "";
            inputArea.classList.add('form-control');
            lbArea = document.createElement('label');
            lbArea.innerText = 'Diện tích (m2)';
            formGroupArea.appendChild(lbArea);
            formGroupArea.appendChild(inputArea);
            formGroupTGTT = document.createElement('div');
            formGroupTGTT.classList.add('form-group');
            var inputTGTT, lbTGTT;
            inputTGTT = document.createElement('input');
            inputTGTT.type = 'date';
            inputTGTT.value = DateTimeDefine.formatDateValue(item.ThoiGianTrongTrot);
            inputTGTT.classList.add('form-control');
            lbTGTT = document.createElement('label');
            lbTGTT.innerText = 'Thời gian trồng trọt';
            formGroupTGTT.appendChild(lbTGTT);
            formGroupTGTT.appendChild(inputTGTT);
            formGroupTGBDTT = document.createElement('div');
            formGroupTGBDTT.classList.add('form-group');
            var inputTGBDT, lbTime;
            inputTGBDT = document.createElement('input');
            inputTGBDT.type = 'date';
            inputTGBDT.value = DateTimeDefine.formatDateValue(item.ThoiGianBatDauTrong);
            inputTGBDT.classList.add('form-control');
            lbTime = document.createElement('label');
            lbTime.innerText = 'Thời gian bắt đầu trồng';
            formGroupTGBDTT.appendChild(lbTime);
            formGroupTGBDTT.appendChild(inputTGBDT);
            formGDST = document.createElement('div');
            formGDST.classList.add('form-group');
            var lbGDST, inputGDST;
            lbGDST = document.createElement('label');
            lbGDST.innerText = 'Giai đoạn sinh trưởng';
            inputGDST = document.createElement('select');
            inputGDST.classList.add('form-control');
            var defaultComboValue = document.createElement('option');
            defaultComboValue.value = "Chưa xác định";
            defaultComboValue.innerText = 'Chọn giá trị...';
            defaultComboValue.selected = true;
            inputGDST.appendChild(defaultComboValue);
            var capNhatGiaiDoanSinhTruong = function () {
                inputGDST.innerHTML = '';
                inputGDST.appendChild(defaultComboValue);
                _this.tblGiaiDoanSinhTruong.queryFeatures({
                    where: "NhomCayTrong = " + inputNCT.value + " and LoaiCayTrong = '" + inputLCT.value + "'",
                    outFields: ['GiaiDoanSinhTruong'],
                    orderByFields: ['MocTG']
                }).then(function (res) {
                    res.features.forEach(function (f) {
                        var gdst = f.attributes.GiaiDoanSinhTruong;
                        var cbb = document.createElement('option');
                        cbb.value = cbb.innerText = gdst;
                        inputGDST.appendChild(cbb);
                    });
                    inputGDST.value = item.GiaiDoanSinhTruong;
                });
            };
            formGDST.appendChild(lbGDST);
            formGDST.appendChild(inputGDST);
            btnEdit = document.createElement('button');
            btnEdit.classList.add('btn', 'btn-primary');
            btnEdit.innerText = "Chấp nhận";
            on(btnEdit, 'click', function () {
                var data = {
                    OBJECTID: item.OBJECTID,
                    NhomCayTrong: parseInt(inputNCT.value),
                    LoaiCayTrong: inputLCT.value == "-1" ? null : inputLCT.value,
                    DienTich: inputArea.value ? parseFloat(inputArea.value) : 0,
                    ThoiGianTrongTrot: !inputTGTT.value ? null : new Date(inputTGTT.value),
                    ThoiGianBatDauTrong: !inputTGBDT.value ? null : new Date(inputTGBDT.value),
                    GiaiDoanSinhTruong: inputGDST.value
                };
                _this.renderEditDetailTrongTrot(data);
                $('#ModalDetail').modal('toggle');
            });
            divInfo.appendChild(formGroupNCT);
            divInfo.appendChild(formGroupLCT);
            divInfo.appendChild(formGroupArea);
            divInfo.appendChild(formGroupTGBDTT);
            divInfo.appendChild(formGroupTGTT);
            divInfo.appendChild(formGDST);
            div.appendChild(divInfo);
            var footer = document.createElement('div');
            footer.appendChild(btnEdit);
            var modalDetail = bootstrap.modal('ModalDetail', 'Sửa dữ liệu', div, footer);
            modalDetail.modal();
        };
        ThoiGianSanXuatTrongTrotPopup.prototype.showTableDetailTrongTrot = function () {
            var _this = this;
            var notify = $.notify({
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
                deletes: [],
                tableDatas: [],
                tbody: null
            };
            this.dataDetails = [];
            var div = document.createElement('div');
            var tableResponsive = document.createElement('div');
            tableResponsive.classList.add('table-responsive');
            var table = document.createElement('table');
            table.classList.add('table');
            tableResponsive.appendChild(table);
            var thead = document.createElement('thead');
            thead.innerHTML =
                "<tr>\n          <th>Nh\u00F3m c\u00E2y tr\u1ED3ng</th>\n          <th>Lo\u1EA1i c\u00E2y tr\u1ED3ng</th>\n          <th>Di\u1EC7n t\u00EDch (m2)</th>\n          <th>Th\u1EDDi gian tr\u1ED3ng tr\u1ECDt</th>\n          <th>Th\u1EDDi gian b\u1EAFt \u0111\u1EA7u tr\u1ED3ng</th>\n          <th>Giai \u0111o\u1EA1n sinh tr\u01B0\u1EDFng</th>\n          <th>T\u00E1c v\u1EE5</th>\n        </tr>";
            table.appendChild(thead);
            var tbody = document.createElement('tbody');
            table.appendChild(tbody);
            this.tmpDatasDetailTrongTrong.tbody = tbody;
            var footer = document.createElement('div');
            var btnAdd = document.createElement('button');
            btnAdd.classList.add('btn', 'btn-default');
            btnAdd.innerText = "Thêm dữ liệu";
            on(btnAdd, "click", function () {
                _this.addDetailTrongTrot();
            });
            var btnSubmit = document.createElement('button');
            btnSubmit.classList.add('btn', 'btn-primary');
            btnSubmit.innerText = "Chấp nhận";
            on(btnSubmit, 'click', function () {
                _this.submitDetailTrongtrot(_this.tmpDatasDetailTrongTrong);
            });
            var btnClose = document.createElement('button');
            btnClose.type = 'button';
            btnClose.classList.add('btn', 'btn-default');
            btnClose.setAttribute('data-dismiss', 'modal');
            btnClose.innerText = 'Đóng';
            footer.appendChild(btnSubmit);
            footer.appendChild(btnAdd);
            footer.appendChild(btnClose);
            div.appendChild(tableResponsive);
            this.thoiGianSanXuatTrongTrot.findById(this.attributes['MaDoiTuong']).then(function (results) {
                if (results.features.length > 0) {
                    var features = results.features;
                    features.forEach(function (f) {
                        var attributes = f.attributes;
                        var item = {
                            DienTich: attributes.DienTich,
                            GiaiDoanSinhTruong: attributes.GiaiDoanSinhTruong,
                            MaDoiTuong: attributes.MaDoiTuong,
                            LoaiCayTrong: attributes.LoaiCayTrong,
                            NhomCayTrong: attributes.NhomCayTrong,
                            OBJECTID: attributes.OBJECTID
                        };
                        if (attributes.ThoiGianBatDauTrong)
                            item.ThoiGianBatDauTrong = new Date(attributes.ThoiGianBatDauTrong);
                        if (attributes.ThoiGianTrongTrot)
                            item.ThoiGianTrongTrot = new Date(attributes.ThoiGianTrongTrot);
                        _this.tmpDatasDetailTrongTrong.tableDatas.push(item);
                        _this.dataDetails.push(f.attributes);
                        var row = _this.renderDetailTrongtrot(item);
                        tbody.appendChild(row);
                    });
                }
                var modal = bootstrap.modal('ttModal', 'Thời gian trồng trọt', div, footer);
                modal.modal();
                notify.update('type', 'success');
                notify.update('progress', 90);
            });
        };
        ThoiGianSanXuatTrongTrotPopup.prototype.renderEditDetailTrongTrot = function (item) {
            var _this = this;
            try {
                this.tmpDatasDetailTrongTrong.edits.map(function (row) {
                    if (row.OBJECTID == item.OBJECTID) {
                        _this.tmpDatasDetailTrongTrong.edits.splice(_this.tmpDatasDetailTrongTrong.edits.indexOf(row));
                    }
                });
                var tableDatas_1 = [];
                this.tmpDatasDetailTrongTrong.tableDatas.map(function (row) {
                    row.OBJECTID == item.OBJECTID ? tableDatas_1.push(item) : tableDatas_1.push(row);
                });
                this.tmpDatasDetailTrongTrong.tableDatas = tableDatas_1;
                this.tmpDatasDetailTrongTrong.edits.push(item);
                var rows = this.tmpDatasDetailTrongTrong.tbody.getElementsByTagName('tr');
                var row = void 0;
                for (var _i = 0, rows_1 = rows; _i < rows_1.length; _i++) {
                    var r = rows_1[_i];
                    var id = parseInt(r.id);
                    if (id == item['OBJECTID'] || id == item['ID']) {
                        row = r;
                        break;
                    }
                }
                var tds = row.getElementsByTagName('td');
                var tdNCT = tds[0], tdLCT = tds[1], tdArea = tds[2], tdTGTT = tds[3], tdTGBDT = tds[4], tdGDST = tds[5];
                var NCTcodedValues = this.layer.getFieldDomain('NhomCayTrong').codedValues;
                if (NCTcodedValues) {
                    var codeValue = NCTcodedValues.find(function (f) {
                        return f.code == item['NhomCayTrong'];
                    });
                    if (codeValue)
                        tdNCT.innerText = codeValue.name;
                }
                if (!tdNCT.innerText)
                    tdNCT.innerText = item['NhomCayTrong'] + "" || '';
                var subtype = this.getSubtype('NhomCayTrong', item['NhomCayTrong']);
                if (!subtype)
                    return;
                var domain = subtype.domains['LoaiCayTrong'];
                if (domain) {
                    var LCTcodedValues = void 0;
                    if (domain.type === "inherited") {
                        var fieldDomain = this.layer.getFieldDomain('LoaiCayTrong');
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
                tdArea.innerText = item['DienTich'] + "" || '0';
                tdTGTT.innerText = DateTimeDefine.formatDateValue(item.ThoiGianTrongTrot);
                tdTGBDT.innerText = DateTimeDefine.formatDateValue(item.ThoiGianBatDauTrong);
                tdGDST.innerText = item.GiaiDoanSinhTruong;
            }
            catch (error) {
                throw 'Có lỗi xảy ra trong quá trình thực hiện';
            }
        };
        ThoiGianSanXuatTrongTrotPopup.prototype.renderDetailTrongtrot = function (item, isNew) {
            var _this = this;
            if (isNew === void 0) { isNew = false; }
            try {
                var row_1 = document.createElement('tr');
                row_1.id = item['OBJECTID'] || item['ID'];
                if (isNew)
                    row_1.classList.add("info");
                var tdNCT = document.createElement('td');
                var NCTcodedValues = this.layer.getFieldDomain('NhomCayTrong').codedValues;
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
                var subtype = this.getSubtype('NhomCayTrong', item['NhomCayTrong']);
                if (!subtype)
                    return;
                var domain = subtype.domains['LoaiCayTrong'];
                if (domain) {
                    var LCTcodedValues = void 0;
                    if (domain.type === "inherited") {
                        var fieldDomain = this.layer.getFieldDomain('LoaiCayTrong');
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
                var tdTGTT = document.createElement('td');
                tdTGTT.innerText = DateTimeDefine.formatDateValue(item['ThoiGianTrongTrot']);
                var tdTGBDT = document.createElement('td');
                tdTGBDT.innerText = DateTimeDefine.formatDateValue(item['ThoiGianBatDauTrong']);
                var tdAction = document.createElement('td');
                var tdGDST = document.createElement('td');
                tdGDST.innerText = item.GiaiDoanSinhTruong || 'N/A';
                var itemEdit = document.createElement('span');
                itemEdit.classList.add('esri-icon-edit');
                on(itemEdit, 'click', function (evt) {
                    _this.tmpDatasDetailTrongTrong.tableDatas.map(function (row) {
                        if (row.OBJECTID == item.OBJECTID)
                            _this.editDetailTrongTrot(row);
                    });
                });
                var itemDelete = document.createElement('span');
                itemDelete.classList.add('esri-icon-trash');
                on(itemDelete, 'click', function () {
                    if (item['OBJECTID']) {
                        _this.tmpDatasDetailTrongTrong.deletes.push(item['OBJECTID']);
                        _this.tmpDatasDetailTrongTrong.tableDatas.map(function (row) {
                            if (row.OBJECTID == item['OBJECTID']) {
                                var index = _this.tmpDatasDetailTrongTrong.tableDatas.indexOf(row);
                                _this.tmpDatasDetailTrongTrong.tableDatas.splice(index, 1);
                            }
                        });
                    }
                    _this.tmpDatasDetailTrongTrong.tbody.removeChild(row_1);
                    var addItem = _this.tmpDatasDetailTrongTrong.adds.find(function (f) {
                        return f.OBJECTID == item.OBJECTID;
                    });
                    if (addItem) {
                        _this.tmpDatasDetailTrongTrong.adds.splice(_this.tmpDatasDetailTrongTrong.adds.indexOf(addItem));
                    }
                });
                tdAction.appendChild(itemEdit);
                tdAction.appendChild(itemDelete);
                row_1.appendChild(tdNCT);
                row_1.appendChild(tdLCT);
                row_1.appendChild(tdArea);
                row_1.appendChild(tdTGTT);
                row_1.appendChild(tdTGBDT);
                row_1.appendChild(tdGDST);
                row_1.appendChild(tdAction);
                return row_1;
            }
            catch (error) {
                throw error;
            }
        };
        ThoiGianSanXuatTrongTrotPopup.prototype.addDataToDetailTrongtrot = function (data) {
            var row = this.renderDetailTrongtrot(data, true);
            this.tmpDatasDetailTrongTrong.tbody.appendChild(row);
        };
        ThoiGianSanXuatTrongTrotPopup.prototype.submitData = function (datas) {
            var adds = [], edits;
            datas.tableDatas.map(function (fs) {
                if (datas.adds.some(function (f) {
                    return f.OBJECTID == fs.OBJECTID;
                }))
                    adds.push(fs);
            });
            this.tmpDatasDetailTrongTrong.adds = adds;
            edits = datas.edits.filter(function (f) {
                return datas.adds.indexOf(f);
            });
            this.tmpDatasDetailTrongTrong.edits = edits;
        };
        ThoiGianSanXuatTrongTrotPopup.prototype.submitDetailTrongtrot = function (datas) {
            var _this = this;
            this.submitData(datas);
            var applyEdits = {
                addFeatures: [],
                updateFeatures: [],
                deleteFeatures: []
            };
            if (datas.deletes.length > 0) {
                applyEdits.deleteFeatures = datas.deletes;
            }
            if (datas.adds.length > 0) {
                for (var _i = 0, _a = datas.adds; _i < _a.length; _i++) {
                    var item = _a[_i];
                    var attributes = {
                        DienTich: item.DienTich,
                        GiaiDoanSinhTruong: item.GiaiDoanSinhTruong,
                        LoaiCayTrong: item.LoaiCayTrong,
                        MaDoiTuong: item.MaDoiTuong,
                        NhomCayTrong: item.NhomCayTrong
                    };
                    if (item.ThoiGianBatDauTrong)
                        attributes.ThoiGianBatDauTrong = item.ThoiGianBatDauTrong.getTime();
                    if (item.ThoiGianTrongTrot)
                        attributes.ThoiGianTrongTrot = item.ThoiGianTrongTrot.getTime();
                    applyEdits.addFeatures.push({
                        attributes: attributes
                    });
                }
            }
            if (datas.edits.length > 0) {
                for (var _b = 0, _c = datas.edits; _b < _c.length; _b++) {
                    var item = _c[_b];
                    var attributes = {
                        DienTich: item.DienTich,
                        GiaiDoanSinhTruong: item.GiaiDoanSinhTruong,
                        LoaiCayTrong: item.LoaiCayTrong,
                        MaDoiTuong: item.MaDoiTuong,
                        NhomCayTrong: item.NhomCayTrong,
                        OBJECTID: item.OBJECTID
                    };
                    if (item.ThoiGianBatDauTrong)
                        attributes.ThoiGianBatDauTrong = item.ThoiGianBatDauTrong.getTime();
                    if (item.ThoiGianTrongTrot)
                        attributes.ThoiGianTrongTrot = item.ThoiGianTrongTrot.getTime();
                    applyEdits.updateFeatures.push({
                        attributes: attributes
                    });
                }
            }
            this.thoiGianSanXuatTrongTrot.applyEdits(applyEdits).then(function (e) {
                _this.refreshNhomCayTrong(_this.dataDetails, datas.adds);
                _this.tmpDatasDetailTrongTrong = null;
                _this.dataDetails = null;
            });
            $('#ttModal').modal('toggle');
        };
        ThoiGianSanXuatTrongTrotPopup.prototype.refreshNhomCayTrong = function (currents, adds) {
            var _this = this;
            if (adds.length === 0)
                return;
            var tgsxtt = currents.filter(function (f) {
                return f.NhomCayTrong === _this.attributes.NhomCayTrong;
            });
            var isValid = false;
            if (tgsxtt.length > 0) {
                var group_1 = {};
                tgsxtt.forEach(function (f) {
                    var ThoiGianBatDauTrong = f.ThoiGianBatDauTrong;
                    if (!group_1[ThoiGianBatDauTrong])
                        group_1[ThoiGianBatDauTrong] = [];
                    group_1[ThoiGianBatDauTrong].push(f.GiaiDoanSinhTruong);
                });
                for (var key in group_1) {
                    var item = group_1[key];
                    if (item.indexOf('Thu hoạch') !== -1) {
                        isValid = true;
                        break;
                    }
                }
            }
            else {
                isValid = true;
            }
            if (isValid) {
                var firstItem = adds[0];
                this.layer.applyEdits({
                    updateFeatures: [new Graphic({
                            attributes: {
                                OBJECTID: this.attributes.OBJECTID,
                                NhomCayTrong: firstItem.NhomCayTrong
                            }
                        })]
                });
            }
        };
        return ThoiGianSanXuatTrongTrotPopup;
    }());
    return ThoiGianSanXuatTrongTrotPopup;
});
