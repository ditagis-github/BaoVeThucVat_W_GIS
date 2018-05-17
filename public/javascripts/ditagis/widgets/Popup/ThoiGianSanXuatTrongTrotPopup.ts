import bootstrap = require('../../toolview/bootstrap');
import DateTimeDefine = require('../../toolview/DateTimeDefine');
import Graphic = require('esri/Graphic');
import FeatureTable = require('../../support/FeatureTable');
import on = require('dojo/on');
import MapView = require('../../classes/MapView');
import geometryEngine = require('esri/geometry/geometryEngine');
import constName = require('../../classes/ConstName');
import mapConfig = require('../../config');
import trongTrotApi = require('../../api/TrongTrotApi');


interface ThoiGianSanXuatTrongTrot {
  OBJECTID: number;
  MaDoiTuong: string;
  NhomCayTrong: number;
  LoaiCayTrong: string;
  DienTich: number;
  ThoiGianTrongTrot: Date
  ThoiGianBatDauTrong: Date;
  GiaiDoanSinhTruong: string;
}
interface ThoiGianSanXuatTrongTrotService {
  OBJECTID: number;
  MaDoiTuong: string;
  NhomCayTrong: number;
  LoaiCayTrong: string;
  DienTich: number;
  ThoiGianTrongTrot: number;
  ThoiGianBatDauTrong: number;
  GiaiDoanSinhTruong: string;
  NguoiCapNhat: string
  NgayCapNhat: number
}
interface TmpDataDetailTrongTrot {
  adds: Array<ThoiGianSanXuatTrongTrot>,
  edits: Array<ThoiGianSanXuatTrongTrot>,
  deletes: Array<number>,
  tableDatas: Array<ThoiGianSanXuatTrongTrot>,
  tbody: HTMLTableSectionElement
}
interface TrongTrotLayer {
  OBJECTID: number;
  NhomCayTrong: number;
  HuyenTP: string;
}
interface ConstructorProperies {
  view;
  table;
}
class ThoiGianSanXuatTrongTrotPopup {
  private view: MapView;
  private tmpDatasDetailTrongTrong: TmpDataDetailTrongTrot;
  private thoiGianSanXuatTrongTrot: FeatureTable;
  private dataDetails: ThoiGianSanXuatTrongTrotService[];
  private tblGiaiDoanSinhTruong: FeatureTable;
  constructor(params: ConstructorProperies) {
    this.view = params.view;
    this.thoiGianSanXuatTrongTrot = params.table;
    this.tblGiaiDoanSinhTruong = new FeatureTable({
      url: mapConfig.tables.find(f => { return f.id === constName.TBL_GIAI_DOAN_SINH_TRUONG }).url,
      fieldID: 'OBJECTID'
    })
    this.dataDetails = [];
  }
  private get selectFeature(): Graphic {
    return this.view.popup.viewModel.selectedFeature;
  }
  private get layer(): __esri.FeatureLayer {
    return this.view.map.findLayerById(constName.TRONGTROT) as __esri.FeatureLayer;
  }
  private get attributes(): TrongTrotLayer {
    return this.selectFeature.attributes;
  }
  /**
 * Lấy subtype của {name} với giá trị {value} trong {layer}
 * @param {*} layer 
 * @param {*} name 
 * @param {*} value 
 * @return subtype
 */
  private getSubtype(name?, value?) {
    name = name || this.layer.typeIdField;
    value = value || this.attributes[name];
    if (this.tblGiaiDoanSinhTruong.typeIdField === name) {
      const typeIdField = this.tblGiaiDoanSinhTruong.typeIdField, //tên thuộc tính của subtypes
        subtypes = this.tblGiaiDoanSinhTruong.types, //subtypes
        subtype = subtypes.find(f => f.id == value);
      return subtype;
    }
    return null;
  }
  private renderDomain(domain, name) {
    let codedValues;
    if (domain.type === "inherited") {
      let fieldDomain = this.layer.getFieldDomain(name) as __esri.CodedValueDomain;
      if (fieldDomain) codedValues = fieldDomain.codedValues;
    } else { //type is codedValue
      codedValues = domain.codedValues;
    }
    if (!codedValues) return null;

    let currentValue = this.attributes[name];
    let input = document.createElement('select');
    input.classList.add('form-control');
    let defaultComboValue = document.createElement('option');
    defaultComboValue.value = "-1";
    defaultComboValue.innerText = 'Chọn giá trị...';
    input.appendChild(defaultComboValue);
    for (let codedValue of codedValues) {
      let dmCode = codedValue.code,
        dmName = codedValue.name;
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
  private addDetailTrongTrot() {
    let div = document.createElement('div');
    let divInfo, formGroupNCT, formGroupLCT, formGroupArea, formGroupTime, formGroupTGBDTT, formGroupTGTT, btnAdd;
    divInfo = document.createElement('div');

    //LOAI CAY TRONG
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
    formGroupLCT.appendChild(inputLCT)

    //NHOM CAY TRONG
    formGroupNCT = document.createElement('div');
    formGroupNCT.classList.add('form-group');
    let lbNCT, inputNCT;
    inputNCT = document.createElement('select');
    inputNCT.id = 'NhomCayTrong';
    inputNCT.classList.add('form-control');
    let codedValues = (this.layer.getFieldDomain('NhomCayTrong') as __esri.CodedValueDomain).codedValues;
    for (let codedValue of codedValues) {
      let dmCode = codedValue.code,
        dmName = codedValue.name;
      let option = document.createElement('option');
      option.setAttribute('value', dmCode + "");
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
      if (!subtype) return;
      let domain = subtype.domains['LoaiCayTrong'];
      if (!domain) return;
      let codedValues;
      if (domain.type === "inherited") {
        let fieldDomain = this.layer.getFieldDomain('LoaiCayTrong') as __esri.CodedValueDomain;
        if (fieldDomain) codedValues = fieldDomain.codedValues;
      } else { //type is codedValue
        codedValues = domain.codedValues;
      }
      if (!codedValues) return;
      for (let codedValue of codedValues) {
        let dmCode = codedValue.code,
          dmName = codedValue.name;
        let option = document.createElement('option');
        option.setAttribute('value', dmCode);
        option.innerHTML = dmName;
        inputLCT.appendChild(option);
      }
    }
    on(inputNCT, 'change', () => {
      inputNCTChange();
      capNhatGiaiDoanSinhTruong();
    })
    inputNCTChange();
    on(inputLCT, 'change', _ => {
      capNhatGiaiDoanSinhTruong();
    })
    lbNCT = document.createElement('label');
    lbNCT.innerText = 'Nhóm cây trồng';
    lbNCT.setAttribute('for', inputNCT.id);
    formGroupNCT.appendChild(lbNCT);
    formGroupNCT.appendChild(inputNCT);

    //DIEN TICH
    formGroupArea = document.createElement('div');
    formGroupArea.classList.add('form-group');
    let lbArea, inputArea: HTMLInputElement;
    inputArea = document.createElement('input');
    // inputArea.type = 'number';
    inputArea.id = 'DienTich';
    inputArea.classList.add('form-control');
    if (this.selectFeature.geometry) {
      let area = geometryEngine.geodesicArea(this.selectFeature.geometry as __esri.Polygon, "square-meters").toFixed(1);
      inputArea.value = area + "";
    }

    lbArea = document.createElement('label');
    lbArea.innerText = 'Diện tích (m2)';
    lbArea.setAttribute('for', inputArea.id);
    formGroupArea.appendChild(lbArea);
    formGroupArea.appendChild(inputArea);

    // Thoi gian trong trot
    formGroupTGTT = document.createElement('div');
    formGroupTGTT.classList.add('form-group');
    let inputTGTT, lbTGTT;
    inputTGTT = document.createElement('input');
    inputTGTT.type = 'date';
    inputTGTT.id = 'ThoiGianTrongTrot';
    inputTGTT.classList.add('form-control');
    inputTGTT.valueAsDate = new Date();
    lbTGTT = document.createElement('label');
    lbTGTT.innerText = 'Thời gian trồng trọt';
    lbTGTT.setAttribute('for', inputTGTT.id);
    formGroupTGTT.appendChild(lbTGTT);
    formGroupTGTT.appendChild(inputTGTT);

    // Ngay thu hoach
    formGroupTGBDTT = document.createElement('div');
    formGroupTGBDTT.classList.add('form-group');
    let inputTime, lbTime;
    inputTime = document.createElement('input');
    inputTime.type = 'date';
    inputTime.id = 'ThoiGianBatDauTrong';
    inputTime.classList.add('form-control');
    inputTime.valueAsDate = new Date();
    lbTime = document.createElement('label');
    lbTime.innerText = 'Thời gian bắt đầu trồng';
    lbTime.setAttribute('for', inputTime.id);
    formGroupTGBDTT.appendChild(lbTime);
    formGroupTGBDTT.appendChild(inputTime);

    //GIAI DOAN SINH TRUONG
    let
      formGDST = document.createElement('div');
    formGDST.classList.add('form-group');
    let lbGDST: HTMLLabelElement, inputGDST: HTMLSelectElement;
    lbGDST = document.createElement('label');
    lbGDST.innerText = 'Giai đoạn sinh trưởng';
    inputGDST = document.createElement('select');
    inputGDST.classList.add('form-control');
    let defaultComboValue = document.createElement('option');
    defaultComboValue.value = "Chưa xác định";
    defaultComboValue.innerText = 'Chọn giá trị...';
    defaultComboValue.selected = true;
    inputGDST.appendChild(defaultComboValue);
    const capNhatGiaiDoanSinhTruong = () => {
      inputGDST.innerHTML = '';
      inputGDST.appendChild(defaultComboValue);
      this.tblGiaiDoanSinhTruong.queryFeatures(<__esri.Query>{
        where: `NhomCayTrong = ${inputNCT.value} and LoaiCayTrong = '${inputLCT.value}'`,
        outFields: ['GiaiDoanSinhTruong'],
        orderByFields: ['MocTG']
      }).then(res => {
        res.features.forEach(f => {
          let gdst = f.attributes.GiaiDoanSinhTruong;
          let cbb = document.createElement('option');
          cbb.value = cbb.innerText = gdst;
          inputGDST.appendChild(cbb);
        })
      })
    }
    formGDST.appendChild(lbGDST);
    formGDST.appendChild(inputGDST);

    //Add
    btnAdd = document.createElement('button');
    btnAdd.classList.add('btn', 'btn-primary');
    btnAdd.innerText = "Thêm";
    on(btnAdd, 'click', () => {
      var length = this.tmpDatasDetailTrongTrong.adds.length;
      let data = <ThoiGianSanXuatTrongTrot>{
        OBJECTID: length + 1,
        MaDoiTuong: this.attributes['MaDoiTuong'],
        NhomCayTrong: parseInt(inputNCT.value),
        LoaiCayTrong: inputLCT.value == -1 ? null : inputLCT.value,
        DienTich: inputArea.value ? parseFloat(inputArea.value) : 0,
        ThoiGianBatDauTrong: !inputTime.value ? null : new Date(inputTime.value),
        ThoiGianTrongTrot: !inputTGTT.value ? (!inputTime.value ? null : new Date(inputTime.value)) : new Date(inputTGTT.value),
        GiaiDoanSinhTruong: inputGDST.value || 'Trồng mới'
      }
      let tableDatas = this.tmpDatasDetailTrongTrong.tableDatas;
      let addDatas = this.tmpDatasDetailTrongTrong.adds;
      for (const d of addDatas) {
        if (data.LoaiCayTrong == d.LoaiCayTrong &&
          data.NhomCayTrong == d.NhomCayTrong && data.ThoiGianBatDauTrong.getTime() === d.ThoiGianBatDauTrong.getTime()) {
          alert("Dữ liệu vừa mới thêm - Không được thêm nữa")
          return;
        }
      }
      this.tmpDatasDetailTrongTrong.tableDatas.push(data);
      this.tmpDatasDetailTrongTrong.adds.push(data);
      this.addDataToDetailTrongtrot(data);
      $('#ModalDetail').modal('toggle');
    })
    divInfo.appendChild(formGroupNCT);
    divInfo.appendChild(formGroupLCT);
    divInfo.appendChild(formGroupArea);
    divInfo.appendChild(formGroupTGBDTT);
    divInfo.appendChild(formGroupTGTT);
    divInfo.appendChild(formGDST);
    div.appendChild(divInfo);
    let footer = document.createElement('div');
    footer.appendChild(btnAdd);
    let modalDetail = bootstrap.modal('ModalDetail', 'Thêm dữ liệu', div, footer);
    modalDetail.modal();
  }
  private editDetailTrongTrot(item: ThoiGianSanXuatTrongTrot) {
    let div = document.createElement('div');
    let divInfo, formGroupNCT, formGroupLCT, formGroupArea, formGroupTGTT, formGroupTGBDTT, formGDST, btnEdit;
    divInfo = document.createElement('div');

    //LOAI CAY TRONG
    formGroupLCT = document.createElement('div');
    formGroupLCT.classList.add('form-group');
    let lbLCT: HTMLLabelElement, inputLCT: HTMLSelectElement;
    inputLCT = document.createElement('select');
    inputLCT.classList.add('form-control');
    lbLCT = document.createElement('label');
    lbLCT.innerText = 'Loại cây trồng';
    formGroupLCT.appendChild(lbLCT);
    formGroupLCT.appendChild(inputLCT)


    //NHOM CAY TRONG
    formGroupNCT = document.createElement('div');
    formGroupNCT.classList.add('form-group');
    let lbNCT: HTMLLabelElement, inputNCT: HTMLSelectElement;
    inputNCT = document.createElement('select');
    inputNCT.classList.add('form-control');
    let codedValues = (this.layer.getFieldDomain('NhomCayTrong') as __esri.CodedValueDomain).codedValues;
    for (let codedValue of codedValues) {
      let dmCode = codedValue.code,
        dmName = codedValue.name;
      let option = document.createElement('option');
      option.setAttribute('value', dmCode + "");
      option.innerHTML = dmName;
      inputNCT.appendChild(option);
    }
    inputNCT.value = item.NhomCayTrong + "";
    var inputNCTChange = () => {
      inputLCT.innerHTML = '';
      let defaultComboValue = document.createElement('option');
      defaultComboValue.value = "-1";
      defaultComboValue.innerText = 'Chọn giá trị...';
      inputLCT.appendChild(defaultComboValue);
      let subtype = this.getSubtype('NhomCayTrong', inputNCT.value);
      if (!subtype) return;
      let domain = subtype.domains['LoaiCayTrong'];
      if (!domain) return;
      let codedValues;
      if (domain.type === "inherited") {
        let fieldDomain = this.layer.getFieldDomain('LoaiCayTrong') as __esri.CodedValueDomain;
        if (fieldDomain) codedValues = fieldDomain.codedValues;
      } else { //type is codedValue
        codedValues = domain.codedValues;
      }
      if (!codedValues) return;
      for (let codedValue of codedValues) {
        let dmCode = codedValue.code,
          dmName = codedValue.name;
        let option = document.createElement('option');
        option.setAttribute('value', dmCode);
        option.innerHTML = dmName;
        inputLCT.appendChild(option);
      }
    }
    on(inputNCT, 'change', () => {
      inputNCTChange();
      capNhatGiaiDoanSinhTruong();
    })
    inputNCTChange();
    inputLCT.value = item.LoaiCayTrong;
    on(inputLCT, 'change', _ => {
      capNhatGiaiDoanSinhTruong();
    })
    lbNCT = document.createElement('label');
    lbNCT.innerText = 'Nhóm cây trồng';
    formGroupNCT.appendChild(lbNCT);
    formGroupNCT.appendChild(inputNCT);

    //DIEN TICH
    formGroupArea = document.createElement('div');
    formGroupArea.classList.add('form-group');
    let lbArea: HTMLLabelElement, inputArea: HTMLInputElement;
    inputArea = document.createElement('input');
    inputArea.type = 'number';
    inputArea.value = item.DienTich + "";
    inputArea.classList.add('form-control');
    lbArea = document.createElement('label');
    lbArea.innerText = 'Diện tích (m2)';
    formGroupArea.appendChild(lbArea);
    formGroupArea.appendChild(inputArea);

    // Thoi gian trong trot
    formGroupTGTT = document.createElement('div');
    formGroupTGTT.classList.add('form-group');
    let inputTGTT: HTMLInputElement, lbTGTT: HTMLLabelElement;
    inputTGTT = document.createElement('input');
    inputTGTT.type = 'date';
    inputTGTT.value = DateTimeDefine.formatDateValue(item.ThoiGianTrongTrot);
    inputTGTT.classList.add('form-control');
    lbTGTT = document.createElement('label');
    lbTGTT.innerText = 'Thời gian trồng trọt';
    formGroupTGTT.appendChild(lbTGTT);
    formGroupTGTT.appendChild(inputTGTT);

    // Ngay thu hoach
    formGroupTGBDTT = document.createElement('div');
    formGroupTGBDTT.classList.add('form-group');
    let inputTGBDT: HTMLInputElement, lbTime: HTMLLabelElement;
    inputTGBDT = document.createElement('input');
    inputTGBDT.type = 'date';
    inputTGBDT.value = DateTimeDefine.formatDateValue(item.ThoiGianBatDauTrong);
    inputTGBDT.classList.add('form-control');
    lbTime = document.createElement('label');
    lbTime.innerText = 'Thời gian bắt đầu trồng';
    formGroupTGBDTT.appendChild(lbTime);
    formGroupTGBDTT.appendChild(inputTGBDT);

    //GIAI DOAN SINH TRUONG
    formGDST = document.createElement('div');
    formGDST.classList.add('form-group');
    let lbGDST: HTMLLabelElement, inputGDST: HTMLSelectElement;
    lbGDST = document.createElement('label');
    lbGDST.innerText = 'Giai đoạn sinh trưởng';
    inputGDST = document.createElement('select');
    inputGDST.classList.add('form-control');
    let defaultComboValue = document.createElement('option');
    defaultComboValue.value = "Chưa xác định";
    defaultComboValue.innerText = 'Chọn giá trị...';
    defaultComboValue.selected = true;
    inputGDST.appendChild(defaultComboValue);
    const capNhatGiaiDoanSinhTruong = () => {
      inputGDST.innerHTML = '';
      inputGDST.appendChild(defaultComboValue);
      this.tblGiaiDoanSinhTruong.queryFeatures(<__esri.Query>{
        where: `NhomCayTrong = ${inputNCT.value} and LoaiCayTrong = '${inputLCT.value}'`,
        outFields: ['GiaiDoanSinhTruong'],
        orderByFields: ['MocTG']
      }).then(res => {
        res.features.forEach(f => {
          let gdst = f.attributes.GiaiDoanSinhTruong;
          let cbb = document.createElement('option');
          cbb.value = cbb.innerText = gdst;
          inputGDST.appendChild(cbb);
        })
        inputGDST.value = item.GiaiDoanSinhTruong;
      })
    }
    capNhatGiaiDoanSinhTruong();
    formGDST.appendChild(lbGDST);
    formGDST.appendChild(inputGDST);

    //Add
    btnEdit = document.createElement('button');
    btnEdit.classList.add('btn', 'btn-primary');
    btnEdit.innerText = "Chấp nhận";
    on(btnEdit, 'click', () => {
      alert('click');
      let data = <ThoiGianSanXuatTrongTrot>{
        OBJECTID: item.OBJECTID,
        NhomCayTrong: parseInt(inputNCT.value),
        LoaiCayTrong: inputLCT.value == "-1" ? null : inputLCT.value,
        DienTich: inputArea.value ? parseFloat(inputArea.value) : 0,
        ThoiGianTrongTrot: !inputTGTT.value ? null : new Date(inputTGTT.value),
        ThoiGianBatDauTrong: !inputTGBDT.value ? null : new Date(inputTGBDT.value),
        GiaiDoanSinhTruong: inputGDST.value
      }
      $('#ModalDetail').modal('toggle');

      this.renderEditDetailTrongTrot(data);

    })
    divInfo.appendChild(formGroupNCT);
    divInfo.appendChild(formGroupLCT);
    divInfo.appendChild(formGroupArea);
    divInfo.appendChild(formGroupTGBDTT);
    divInfo.appendChild(formGroupTGTT);
    divInfo.appendChild(formGDST);
    div.appendChild(divInfo);
    let footer = document.createElement('div');
    footer.appendChild(btnEdit);
    let modalDetail = bootstrap.modal('ModalDetail', 'Sửa dữ liệu', div, footer);
    modalDetail.modal();
  }

  public showTableDetailTrongTrot() {
    let notify = $.notify({
      message: 'Đang tai dữ liệu...'
    }, {
        showProgressbar: true,
        delay: 20000,
        placement: {
          from: 'top',
          align: 'left'
        }
      })
    this.tmpDatasDetailTrongTrong = <TmpDataDetailTrongTrot>{
      adds: [],
      edits: [],
      deletes: [],
      tableDatas: [],
      tbody: null
    }
    this.dataDetails = [];
    let div = document.createElement('div');
    let tableResponsive = document.createElement('div');
    tableResponsive.classList.add('table-responsive');
    //TABLE ON DIV
    let table = document.createElement('table');
    table.classList.add('table');
    tableResponsive.appendChild(table);
    //THEAD ON TABLE
    let thead = document.createElement('thead');
    thead.innerHTML =
      `<tr>
          <th>Nhóm cây trồng</th>
          <th>Loại cây trồng</th>
          <th>Diện tích (m2)</th>
          <th>Thời gian trồng trọt</th>
          <th>Thời gian bắt đầu trồng</th>
          <th>Giai đoạn sinh trưởng</th>
          <th>Tác vụ</th>
        </tr>`
    table.appendChild(thead);
    //TBODY ON TABLE
    let tbody = document.createElement('tbody');
    table.appendChild(tbody);
    this.tmpDatasDetailTrongTrong.tbody = tbody;

    let footer = document.createElement('div');
    let btnAdd = document.createElement('button');
    btnAdd.classList.add('btn', 'btn-default');
    btnAdd.innerText = "Thêm dữ liệu";
    on(btnAdd, "click", () => {
      this.addDetailTrongTrot();

    })
    let btnSubmit = document.createElement('button');
    btnSubmit.classList.add('btn', 'btn-primary');
    btnSubmit.innerText = "Chấp nhận";
    on(btnSubmit, 'click', () => {
      this.submitDetailTrongtrot(this.tmpDatasDetailTrongTrong);
    })
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
        let features: Graphic[] = results.features;
        features.forEach(f => {
          let attributes: ThoiGianSanXuatTrongTrotService = f.attributes;
          let item: ThoiGianSanXuatTrongTrot = <ThoiGianSanXuatTrongTrot>{
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
            item.ThoiGianTrongTrot = new Date(attributes.ThoiGianTrongTrot)
          this.tmpDatasDetailTrongTrong.tableDatas.push(item)
          this.dataDetails.push(f.attributes);
          let row = this.renderDetailTrongtrot(item);
          tbody.appendChild(row);
        });
      }
      let modal = bootstrap.modal('ttModal', 'Thời gian trồng trọt', div, footer);
      modal.modal();
      notify.update('type', 'success');
      notify.update('progress', 90);
    })
  }
  private renderEditDetailTrongTrot(item: ThoiGianSanXuatTrongTrot) {
    try {
      this.tmpDatasDetailTrongTrong.edits.forEach(row => {
        if (row.OBJECTID == item.OBJECTID) {
          this.tmpDatasDetailTrongTrong.edits.splice(this.tmpDatasDetailTrongTrong.edits.indexOf(row));
        }
      })
      let tableDatas = [];

      this.tmpDatasDetailTrongTrong.tableDatas.forEach(row => {
        row.OBJECTID == item.OBJECTID ? tableDatas.push(item) : tableDatas.push(row);
      })
      this.tmpDatasDetailTrongTrong.tableDatas = tableDatas;
      this.tmpDatasDetailTrongTrong.edits.push(item);
      // let rows = this.tmpDatasDetailTrongTrong.tbody.getElementsByTagName('tr');
      let id = item['OBJECTID'] || item['ID'];
      let row = this.tmpDatasDetailTrongTrong.tbody.querySelector(`tr[id='${id}']`);
      if (!row) return;
      let tds = row.getElementsByTagName('td');
      let tdNCT: HTMLElement = tds[0],
        tdLCT: HTMLElement = tds[1],
        tdArea: HTMLElement = tds[2],
        tdTGTT: HTMLElement = tds[3],
        tdTGBDT: HTMLElement = tds[4],
        tdGDST: HTMLElement = tds[5];
      //Nhom Cay Trong
      let NCTcodedValues = (this.layer.getFieldDomain('NhomCayTrong') as __esri.CodedValueDomain).codedValues;
      if (NCTcodedValues) {
        let codeValue = NCTcodedValues.find(f => {
          return f.code == item['NhomCayTrong']
        })
        if (codeValue) tdNCT.innerText = codeValue.name;
      }
      if (!tdNCT.innerText) tdNCT.innerText = item['NhomCayTrong'] + "" || '';
      //Loai cay trong
      let subtype = this.getSubtype('NhomCayTrong', item['NhomCayTrong']);
      if (!subtype) return;
      let domain = subtype.domains['LoaiCayTrong'];
      if (domain) {
        let LCTcodedValues;
        if (domain.type === "inherited") {
          let fieldDomain = this.layer.getFieldDomain('LoaiCayTrong') as __esri.CodedValueDomain;
          if (fieldDomain) LCTcodedValues = fieldDomain.codedValues;
        } else { //type is codedValue
          LCTcodedValues = domain.codedValues;
        }
        if (LCTcodedValues) {
          let codeValue = LCTcodedValues.find(f => {
            return f.code == item['LoaiCayTrong']
          });
          if (codeValue) tdLCT.innerText = codeValue.name;
        }
      }
      if (!tdLCT.innerText) tdLCT.innerText = item['LoaiCayTrong'] || '';
      //dien tich
      tdArea.innerText = item['DienTich'] + "" || '0';
      //thoi gian trong trot
      tdTGTT.innerText = DateTimeDefine.formatDateValue(item.ThoiGianTrongTrot);
      //thoi gian bat dau trong
      tdTGBDT.innerText = DateTimeDefine.formatDateValue(item.ThoiGianBatDauTrong);
      //giai doan sinh truong
      tdGDST.innerText = item.GiaiDoanSinhTruong;
    } catch (error) {
      alert(JSON.stringify(error))
      throw 'Có lỗi xảy ra trong quá trình thực hiện'
    }
  }
  private renderDetailTrongtrot(item: ThoiGianSanXuatTrongTrot, isNew = false) {
    try {
      //tạo <tr>
      let row = document.createElement('tr');
      row.id = item['OBJECTID'] || item['ID'];
      if (isNew) row.classList.add("info");
      //nhom cay trong
      let tdNCT = document.createElement('td');
      // tdNCT.innerText = item['NhomCayTrong'] || '';
      let NCTcodedValues = (this.layer.getFieldDomain('NhomCayTrong') as __esri.CodedValueDomain).codedValues;
      if (NCTcodedValues) {
        let codeValue = NCTcodedValues.find(f => {
          return f.code == item['NhomCayTrong']
        })
        if (codeValue) tdNCT.innerText = codeValue.name;
      }
      if (!tdNCT.innerText) tdNCT.innerText = item['NhomCayTrong'] + "" || '';
      //loai cay trong
      let tdLCT = document.createElement('td');
      if (item['NhomCayTrong']) {
        let subtype = this.getSubtype('NhomCayTrong', item['NhomCayTrong']);
        if (subtype) {
          let domain = subtype.domains['LoaiCayTrong'];
          if (domain) {
            let LCTcodedValues;
            if (domain.type === "inherited") {
              let fieldDomain = this.layer.getFieldDomain('LoaiCayTrong') as __esri.CodedValueDomain;
              if (fieldDomain) LCTcodedValues = fieldDomain.codedValues;
            } else { //type is codedValue
              LCTcodedValues = domain.codedValues;
            }
            if (LCTcodedValues) {
              let codeValue = LCTcodedValues.find(f => {
                return f.code == item['LoaiCayTrong']
              });
              if (codeValue) tdLCT.innerText = codeValue.name;
            }
          }
        }
      }
      if (!tdLCT.innerText) tdLCT.innerText = item['LoaiCayTrong'] || '';

      //dien tich
      let tdArea = document.createElement('td');
      tdArea.innerText = item['DienTich'] + "" || '0';
      //thoi gian trong trot
      let tdTGTT = document.createElement('td');
      tdTGTT.innerText = DateTimeDefine.formatDateValue(item['ThoiGianTrongTrot']);
      //thoi gian bat dau trong
      let tdTGBDT = document.createElement('td');
      tdTGBDT.innerText = DateTimeDefine.formatDateValue(item['ThoiGianBatDauTrong']);
      let tdAction = document.createElement('td');
      let tdGDST = document.createElement('td');
      tdGDST.innerText = item.GiaiDoanSinhTruong || 'N/A';
      //SỬA
      let itemEdit = document.createElement('span');
      itemEdit.classList.add('esri-icon-edit');
      on(itemEdit, 'click', (evt) => {
        this.tmpDatasDetailTrongTrong.tableDatas.forEach(row => {
          if (row.OBJECTID == item.OBJECTID)
            this.editDetailTrongTrot(row);
        })
      })
      //Xóa
      let itemDelete = document.createElement('span');
      itemDelete.classList.add('esri-icon-trash');
      on(itemDelete, 'click', () => {
        if (item['OBJECTID']) {
          this.tmpDatasDetailTrongTrong.deletes.push(item['OBJECTID'])
          this.tmpDatasDetailTrongTrong.tableDatas.forEach(row => {
            if (row.OBJECTID == item['OBJECTID']) {
              let index = this.tmpDatasDetailTrongTrong.tableDatas.indexOf(row);
              this.tmpDatasDetailTrongTrong.tableDatas.splice(index, 1);
            }
          });
        }
        this.tmpDatasDetailTrongTrong.tbody.removeChild(row);
        //KIEM TRA CO TRONG ADDS?
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

    } catch (error) {
      throw error;
    }
  }
  private addDataToDetailTrongtrot(data) {
    let row = this.renderDetailTrongtrot(data, true);
    this.tmpDatasDetailTrongTrong.tbody.appendChild(row);
  }
  //Cập nhật lại các adds, edits.
  private submitData(datas) {
    let adds: ThoiGianSanXuatTrongTrot[] = [],
      edits: ThoiGianSanXuatTrongTrot[];
    datas.tableDatas.forEach(fs => {
      let valid = datas.adds.find(f => f.OBJECTID == fs.OBJECTID);
      if (valid) adds.push(valid);
    });
    this.tmpDatasDetailTrongTrong.adds = adds;
    edits = datas.edits.filter(f => {
      return datas.adds.indexOf(f);
    })
    this.tmpDatasDetailTrongTrong.edits = edits;
  }
  private submitDetailTrongtrot(datas: TmpDataDetailTrongTrot) {
    this.submitData(datas);
    let applyEdits = {
      adds: [],
      updates: [],
      deletes: []
    }
    if (datas.deletes.length > 0) {
      applyEdits.deletes = datas.deletes;
    }
    if (datas.adds.length > 0) {
      let addFeatures = [];
      for (let item of datas.adds) {
        let attributes = <ThoiGianSanXuatTrongTrotService>{
          DienTich: item.DienTich,
          GiaiDoanSinhTruong: item.GiaiDoanSinhTruong,
          LoaiCayTrong: item.LoaiCayTrong,
          MaDoiTuong: item.MaDoiTuong,
          NhomCayTrong: item.NhomCayTrong,
          NguoiCapNhat: this.view.systemVariable.user.userName,
          NgayCapNhat: new Date().getTime(),
          ThoiGianBatDauTrong: item.ThoiGianBatDauTrong && item.ThoiGianBatDauTrong.getTime(),
          ThoiGianTrongTrot: item.ThoiGianTrongTrot ? item.ThoiGianTrongTrot.getTime() : (item.ThoiGianBatDauTrong ? item.ThoiGianBatDauTrong.getTime() : null)
        }
        applyEdits.adds.push(attributes);
      }
    }
    if (datas.edits.length > 0) {
      for (let item of datas.edits) {
        let attributes = <ThoiGianSanXuatTrongTrotService>{
          DienTich: item.DienTich,
          GiaiDoanSinhTruong: item.GiaiDoanSinhTruong,
          LoaiCayTrong: item.LoaiCayTrong,
          MaDoiTuong: item.MaDoiTuong,
          NhomCayTrong: item.NhomCayTrong,
          OBJECTID: item.OBJECTID
        }
        if (item.ThoiGianBatDauTrong)
          attributes.ThoiGianBatDauTrong = item.ThoiGianBatDauTrong.getTime();
        if (item.ThoiGianTrongTrot)
          attributes.ThoiGianTrongTrot = item.ThoiGianTrongTrot.getTime();
        applyEdits.updates.push(attributes);
      }
    }

    alert(JSON.stringify(applyEdits))
    trongTrotApi.capNhatTGSXTT(applyEdits).then(e => {
      this.refreshNhomCayTrong(this.dataDetails, datas.adds);
      this.tmpDatasDetailTrongTrong = null;
      this.dataDetails = null;
    })
    $('#ttModal').modal('toggle');
  }
  /**
   * Cập nhật lại nhóm cây trồng của trồng trọt
   */
  private refreshNhomCayTrong(currents: ThoiGianSanXuatTrongTrotService[], adds: ThoiGianSanXuatTrongTrot[]) {
    if (adds.length === 0) return;
    let tgsxtt = currents.filter(f => {
      return f.NhomCayTrong === this.attributes.NhomCayTrong
    });
    let isValid = false;
    if (tgsxtt.length > 0) {
      let group = {};
      tgsxtt.forEach(function (f) {
        let ThoiGianBatDauTrong = f.ThoiGianBatDauTrong;
        if (!group[ThoiGianBatDauTrong])
          group[ThoiGianBatDauTrong] = [];
        group[ThoiGianBatDauTrong].push(f.GiaiDoanSinhTruong);
      })
      for (const key in group) {
        let item = group[key];
        if (item.indexOf('Thu hoạch') !== -1) {
          isValid = true;
          break;
        }
      }
    } else {
      isValid = true
    }
    if (isValid) {
      let firstItem = adds[0];
      this.layer.applyEdits({
        updateFeatures: [new Graphic({
          attributes: <TrongTrotLayer>{
            OBJECTID: this.attributes.OBJECTID,
            NhomCayTrong: firstItem.NhomCayTrong
          }
        })]
      })
    }

  }
}
export = ThoiGianSanXuatTrongTrotPopup;