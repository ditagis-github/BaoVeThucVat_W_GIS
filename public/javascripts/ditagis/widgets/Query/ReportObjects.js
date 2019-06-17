
define(["dojo/dom-construct",
    "../../classes/ConstName",
    "../../support/FeatureTable",
    '../../config',],
    function (domConstruct, constName, FeatureTable, config) {
        "use strict";
        class ReportObject {
            constructor(view) {
                this.view = view;
                this.displayFields = {
                    KiemDichThucVat: [
                        { width: 60, title: "STT", field: "STT" },
                        { width: 60, title: "Tên công ty", field: "TenCongTy" },
                        { width: 60, title: "Địa chỉ", field: "DiaChi" },
                        { width: 60, title: "Phường xã", field: "MaPhuongXa" },
                        { width: 60, title: "Huyện TP", field: "MaHuyenTP" },
                    ],
                    TrongTrot: [
                        { width: 60, title: "STT", field: "STT" },
                        { width: 60, title: "Mã đối tượng", field: "MaDoiTuong" },
                        { width: 60, title: "Huyện TP", field: "MaHuyenTP" },
                        { width: 60, title: "Nhóm cây trồng", field: "NhomCayTrong" },
                        { width: 60, title: "Loại cây trồng", field: "LoaiCayTrong" },
                        { width: 60, title: "Ghi chú", field: "GhiChu" },
                    ],
                    SauBenh: [
                        { width: 60, title: "STT", field: "STT" },
                        { width: 60, title: "Nhóm cây trồng", field: "NhomCayTrong" },
                        { width: 60, title: "Loại cây trồng", field: "LoaiCayTrong" },
                        { width: 60, title: "Tên sâu bệnh", field: "TenSauBenhGayHai" },
                        { width: 60, title: "Cấp độ gây hại", field: "CapDoGayHai" },
                        { width: 60, title: "Tình hình kiểm soát", field: "TinhHinhKiemSoatDichBenh" },
                    ],
                    DoanhNghiep: [
                        { width: 60, title: "STT", field: "STT" },
                        { width: 60, title: "Mã doanh nghiệp", field: "MaDoanhNghiep" },
                        { width: 60, title: "Người đại diện", field: "NguoiDaiDienDoanhNghiep" },
                        { width: 60, title: "Phường xã", field: "MaPhuongXa" },
                        { width: 60, title: "Huyện TP", field: "MaHuyenTP" },
                    ]
                };
                this.tblGiaiDoanSinhTruong = new FeatureTable({
                    url: config.tables.find(f => { return f.id === constName.TBL_GIAI_DOAN_SINH_TRUONG; }).url,
                    fieldID: 'OBJECTID'
                });
                this.initWindowKendo();

            }
            getSubtype(name, value) {
                name = name || this.layer.typeIdField;
                value = value || this.attributes[name];
                if (this.tblGiaiDoanSinhTruong.typeIdField === name) {
                    const subtypes = this.tblGiaiDoanSinhTruong.types,
                        subtype = subtypes.find(f => f.id == value);
                    return subtype;
                }
                return null;
            }
            initWindowKendo() {
                this.report_content = $('<div/>', {
                    id: "report-objects"
                }).appendTo(document.body);
                this.table = domConstruct.create('div', {
                    id: 'table-report'
                });
                this.report_content.append(this.table);
            }
            convertAttributes(fields, lstAttributes) {
                if (fields && fields.length > 0) {
                    fields.forEach(field => {
                        if (field.type === "date") {
                            lstAttributes.forEach(attributes => {
                                if (attributes[field.name])
                                    attributes[field.name] = kendo.toString(new Date(attributes[field.name]), "HH:mm:ss dd-MM-yyyy");
                            });
                        }
                    });
                }
                return lstAttributes;
            }
            showTable(layer, attributes) {
                let columns = this.displayFields[layer.id];
                var fields = layer.fields;
                if (columns)
                    columns.forEach(c => {
                        if (!c.title) {
                            let field = layer.fields.find(f => f.name === c.field);
                            if (field)
                                c.title = field.alias;
                        }
                    });
                let kendoData = this.convertAttributes(fields, attributes);
                this.kendoGrid = $('#table-report').empty().kendoGrid({
                    toolbar: [{ name: "excel", text: "Xuất báo cáo" }],
                    resizable: true,
                    excel: {
                        allPages: true,
                        fileName: "Thống kê dữ liệu.xlsx"
                    },
                    selectable: true,
                    pageable: true,
                    columns: columns,
                    dataSource: {
                        transport: {
                            read: function (e) {
                                e.success(kendoData);
                            },
                            error: function (e) {
                                alert("Status: " + e.status + "; Error message: " + e.errorThrown);
                            }
                        },
                        pageSize: 5,
                        batch: false,
                        schema: {
                            model: {
                                id: "OBJECTID",
                            }
                        }
                    },
                    change: e => {
                        let selectedRows = e.sender.select();
                        let id = e.sender.dataItem(selectedRows)['OBJECTID'];
                        let query = layer.createQuery();
                        query.where = 'OBJECTID = ' + id;
                        query.outSpatialReference = this.view.spatialReference;
                        query.returnGeometry = true;
                        layer.queryFeatures(query).then(results => {
                            this.view.popup.open({
                                features: results.features,
                                updateLocationEnabled: true
                            });
                        });
                    },
                    excelExport: (e) => {
                        if (e.data) {
                            for (const item of e.data) {
                            }
                        }
                    }
                });
                this.report_content.kendoWindow({
                    width: "90%",
                    title: layer.title,
                    visible: false,
                    actions: [
                        "Pin",
                        "Minimize",
                        "Maximize",
                        "Close"
                    ],
                    position: {
                        top: 100, // or "100px"
                        left: 8
                    },

                }).data("kendoWindow").open();
            }
            showReport(layer, features) {
                return __awaiter(this, void 0, void 0, function* () {
                    var attributes = features.map(m => m.attributes);
                    for (const field of layer.fields) {
                        if (field.name == "NhomCayTrong") {
                            attributes.forEach(attr => {
                                var value = attr["NhomCayTrong"];
                                if (value) {
                                    let subtype = this.getSubtype("NhomCayTrong", value);
                                    if (subtype != null) {
                                        const codedValues = subtype.domains.LoaiCayTrong.codedValues;
                                        if (codedValues != null) {
                                            let codedValue = codedValues.find(f => f.code === attr["LoaiCayTrong"]);
                                            if (codedValue) {
                                                attr["LoaiCayTrong"] = codedValue.name;
                                            }
                                        }
                                    }
                                }
                            });
                        }
                        if (field.domain) {
                            let codedValues = field.domain.codedValues;
                            attributes.forEach(attr => {
                                if (attr[field.name]) {
                                    let codedValue = codedValues.find(f => f.code === attr[field.name]);
                                    if (codedValue)
                                        attr[field.name] = codedValue.name;
                                }
                            });
                        }
                    }
                    for (let i = 0; i < features.length; i++) {
                        let element = features[i];
                        element.attributes["STT"] = i + 1;
                    }
                    this.showTable(layer, attributes);
                    return true;
                });
            }
        }
        return ReportObject;
    });
