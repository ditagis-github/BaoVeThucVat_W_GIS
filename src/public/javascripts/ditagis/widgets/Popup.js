define([
  "dojo/on",
  "dojo/dom",
  "dojo/dom-construct",

  "ditagis/widgets/Popup/PopupEdit",
  "ditagis/support/HightlightGraphic",
  "ditagis/support/Editing",
  "ditagis/toolview/bootstrap",

  "esri/symbols/SimpleMarkerSymbol",
  "esri/symbols/SimpleFillSymbol",
  "esri/tasks/QueryTask",

  "esri/request"

], function (on, dom, domConstruct, PopupEdit, HightlightGraphic, editingSupport, bootstrap, SimpleMarkerSymbol, SimpleFillSymbol, QueryTask, esriRequest) {
  'use strict';
  return class {
    constructor(view) {
      this.view = view;
      this.options = {
        hightLength: 100
      }
      this.popupEdit = new PopupEdit(view, {
        hightLength: this.options.hightLength
      })

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
                layer: layer
              });
            if (layer.permission.delete)
              actions.push({
                id: "delete",
                title: "Xóa",
                className: "esri-icon-erase",
                layer: layer
              })
            if (layer.id === constName.TRONGTROT) {
              actions.push({
                id: "view-detail",
                title: "Chi tiết thời gian trồng trọt",
                className: "esri-icon-table",
                layer: layer
              })
            }
            layer.popupTemplate = {
              content: (target) => {
                return this.contentPopup(target,layer);
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
    triggerActionHandler(event) {
      let actionId = event.action.id;
      let layer = this.layer || event.action.layer;
      this.popupEdit.layer = layer;
      let fail = false;
      switch (actionId) {
        case "update":
          if (layer.permission && layer.permission.edit) {
            if (event.action.className === 'esri-icon-check-mark') {
              this.popupEdit.editFeature();
            } else {
              this.popupEdit.showEdit();
            }
          } else {
            fail = true;
          }
          break;
        case "delete":
          if (layer.permission && layer.permission.delete) {
            this.popupEdit.deleteFeature();
          } else {
            fail = true;
          }
          break;
        case "view-detail":
          if (this.attributes['MaDoiTuong'])
            this.triggerActionViewDetailTrongtrot(this.attributes['MaDoiTuong']);
          else
            $.notify({
              message: 'Không xác được định danh'
            }, {
                type: 'danger'
              })
          break;
        case "view-detail-edit":
          if (this.attributes['MaDoiTuong'])
            this.popupEdit.showTableDetailTrongTrot();
          else
            $.notify({
              message: 'Không xác được định danh'
            }, {
                type: 'danger'
              })
          break;
        case "update-geometry":
          if (layer.geometryType === 'polygon') {
            alert('Không thể thay đổi vị trí vùng...');
            break;
          }
          this.popupEdit.updateGeometryGPS();
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
      return codedValues;
    }
    /**
     * Hiển thị popup
     * @param {esri/layers/FeatureLayer} layer - layer được chọn (clickEvent)
     * @param {object} attributes - thông tin của layer được chọn
     */
    async contentPopup(target,featureLayer) {
      try {
        
        const graphic = target.graphic,
          layer = graphic.layer || featureLayer,
          attributes = graphic.attributes;
        if(!graphic.layer) graphic.layer = layer;
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
        let subtype = this.getSubtype();
        for (let field of layer.fields) {
          let value = attributes[field.name];
          if (field.type === 'oid')
            continue;
          //tạo <tr>
          let row = domConstruct.create('tr');
          //tạo <td>
          let tdName = domConstruct.create('td', {
            innerHTML: field.alias
          }),
            input, content, formatString;
          let codedValues;
          if (subtype && subtype.domains[field.name]) {
            codedValues = this.renderDomain(subtype.domains[field.name], field.name);
          }
          //kiểm tra domain
          else if (field.domain) {
            codedValues = this.renderDomain(field.domain, field.name);
          }
          //nếu field có domain thì hiển thị value theo name của codevalues
          if (codedValues) {
            //lấy name của code
            let codeValue = codedValues.find(f => { return f.code === value });
            if (codeValue) value = codeValue.name;
          } else if ((field.name === 'MaPhuongXa' || field.name === 'MaHuyenTP') && attributes[field.name]) {
            let location = await editingSupport.getLocationName(this.view, { PhuongXa: attributes['MaPhuongXa'], HuyenTP: attributes['MaHuyenTP'] }).then(async res => { return await res });
            value = field.name == 'MaPhuongXa' ? location['TenPhuong'] : location['TenHuyen'];
          } else {
            //lấy formatString
            if (field.type === "small-integer" ||
              (field.type === "integer") ||
              (field.type === "double")) {
              // formatString = 'NumberFormat(places:2)';
            } else if (field.type === 'date') {
              formatString = 'DateFormat';
            }
          }
          //nếu như có formatString
          if (formatString) {
            content = `{${field.name}:${formatString}}`;
          } else {
            content = value;
          }
          let tdValue = domConstruct.create('td');
          var txtArea = null;
          //neu co area thi cho area vao trong td. <td><textarea>{content}</textarea></td>
          if (field.length >= this.options.hightLength) {
            txtArea = domConstruct.create('textarea', {
              rows: 5,
              cols: 25,
              readonly: true,
              innerHTML: content,
              style: 'background: transparent;border:none'
            });
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

          layer.getAttachments(attributes['OBJECTID']).then(res => {
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
                }, itemDiv)

                let img = domConstruct.create('img', {
                  class: 'img-responsive',
                  id: `${url}/attachments/${item.id}`, src: `${url}/attachments/${item.id}`, alt: `${url}/attachments/${item.name}`,
                }, itemA)
                on(itemA, 'click', () => {
                  let modal = bootstrap.modal(`attachments-${item.id}`, item.name, img.cloneNode(true));
                  if (modal) modal.modal();
                })
              }

            }
          })
        }
        return div.outerHTML;
      } catch (err) {
        throw err;
      }
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
      let queryTask = new QueryTask(constName.TABLE_SXTT_URL);
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

          let table = document.createElement('table');
          table.classList.add('table', 'table-hover');
          let thead = document.createElement('thead');
          thead.innerHTML =
            `<tr>
              <th>Nhóm cây trồng</th>
              <th>Loại cây trồng</th>
              <th>Diện tích</th>
              <th>Thời gian</th>
            </tr>
            </thead>`
          domConstruct.place(thead, table);
          table.appendChild(thead);
          let tbody = document.createElement('tbody');
          table.appendChild(tbody);
          let features = results.features.sort(function (f1, f2) { let a = f1.attributes, b = f2.attributes; if (a['Nam'] == b['Nam']) return a['Thang'] > b['Thang']; else return a['Nam'] > b['Nam']; })
          for (let feature of features) {
            const item = feature.attributes;
            //tạo <tr>
            let row = document.createElement('tr');
            row.classList.add("Info");
            tbody.appendChild(row);
            //nhom cay trong
            let tdNCT = document.createElement('td');
            // tdNCT.innerText = item['NhomCayTrong'] || '';
            let NCTcodedValues = this.layer.getFieldDomain('NhomCayTrong').codedValues;
            if (NCTcodedValues) {
              let codeValue = NCTcodedValues.find(f => { return f.code == item['NhomCayTrong'] })
              if (codeValue) tdNCT.innerText = codeValue.name;
            }
            if (!tdNCT.innerText) tdNCT.innerText = item['NhomCayTrong'] || '';
            //loai cay trong
            let tdLCT = document.createElement('td');

            let subtype = this.getSubtype('NhomCayTrong', item['NhomCayTrong']);
            if (!subtype) return;
            let domain = subtype.domains['LoaiCayTrong'];
            if (domain) {
              let LCTcodedValues;
              if (domain.type === "inherited") {
                let fieldDomain = this.layer.getFieldDomain('LoaiCayTrong');
                if (fieldDomain) LCTcodedValues = fieldDomain.codedValues;
              } else {//type is codedValue
                LCTcodedValues = domain.codedValues;
              }
              if (LCTcodedValues) {
                let codeValue = LCTcodedValues.find(f => { return f.code == item['LoaiCayTrong'] });
                if (codeValue) tdLCT.innerText = codeValue.name;
              }
            }
            if (!tdLCT.innerText) tdLCT.innerText = item['LoaiCayTrong'] || '';

            //dien tich
            let tdArea = document.createElement('td');
            tdArea.innerText = item['DienTich'] || '0';
            //thoi gian
            let tdTime = document.createElement('td');
            tdTime.innerText = `${item['Thang'] || 0}/${item['Nam'] || 0}`;
            row.appendChild(tdNCT);
            row.appendChild(tdLCT);
            row.appendChild(tdArea);
            row.appendChild(tdTime);
          }
          let modal = bootstrap.modal('ttModal', 'Thời gian trồng trọt', table);
          modal.modal();
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