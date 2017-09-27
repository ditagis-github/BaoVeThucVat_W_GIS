define([
  "dojo/on",
  "dojo/dom",
  "dojo/dom-construct",

  "ditagis/widgets/Popup/PopupEdit",
  "ditagis/support/HightlightGraphic",
  "ditagis/toolview/bootstrap",

  "esri/geometry/Point",
  "esri/symbols/SimpleMarkerSymbol",
  "esri/symbols/SimpleFillSymbol",
  "esri/tasks/QueryTask",

  "esri/request"

], function (on, dom, domConstruct, PopupEdit, HightlightGraphic, bootstrap, Point, SimpleMarkerSymbol, SimpleFillSymbol, QueryTask, esriRequest) {
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
      let fail = false;
      switch (actionId) {
        case "update":
          if (this.layer.permission && this.layer.permission.edit) {
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
          if (this.layer.permission && this.layer.permission.delete) {
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
            this.popupEdit.editDetailTrongtrot();
          else
            $.notify({
              message: 'Không xác được định danh'
            }, {
                type: 'danger'
              })
          break;
        case "update-geometry":
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
    contentPopup(target) {
      try {
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
        let subtype = this.getSubtype();
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
                  let body = img.outerHTML;
                  let modal = bootstrap.modal(`attachments-${item.id}`, item.name, body);
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