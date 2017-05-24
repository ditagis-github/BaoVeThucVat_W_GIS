var FeatureTableUI;
require([
    "esri/dijit/FeatureTable",
    "dojo/dom-style",
    "dijit/registry"
], function (
        FeatureTable,
        domstyle,
        registry) {
    FeatureTableUI = class FeatureTableUI {
        constructor(options, controlDiv, tableDiv, mainContainer) {
            this.options = {
                layers: [],
                icon: 'glyphicon glyphicon-tasks'
            };
            for (var i in options) {
                this.options[i] = options[i] || this.options[i];
            }

            this.datas = [];

            this.mainContainer = mainContainer;
            this.tableDiv = tableDiv || 'contentPane';
            this.tableDivElement = $('#' + this.tableDiv);
            this.childTableDivs = [];
            this.controlDiv = controlDiv || 'tableControl';
            this.controlDivElement = $('#' + this.controlDiv);
            this.controlDivElement.addClass('dropdown map-control');
            this.button = $('<button/>');
            this.button.attr('data-toggle', 'dropdown');
            this.button.attr('type', 'button');

            let span = $('<span/>');
            span.addClass(this.options.icon);
            this.button.append(span);
            this.controlDivElement.append(this.button);
            this.ul = $('<ul/>');
            this.ul.addClass("dropdown-menu");
            let that = this, _clickEvent = this._clickEvent;
            this.isLoadTable = {
                firstClick: true
            }
            for (var i in this.options.layers) {
                let layer = this.options.layers[i];

                this.isLoadTable[layer.id] = false;

                let li = $('<li/>'),
                    a = $('<a/>');
                a.attr('href', '#');
                a.attr('id', "dtg-ft-link-"+layer.id);
                a.text(layer._params.name);
                a.click(function (evt) {
                    _clickEvent(that, evt.target);
                });
                
                li.append(a);
                this.ul.append(li);
                let childTableDiv = $('<div/>');
                childTableDiv.attr('id',"dtg-ft-div-"+ layer.id);

                this.tableDivElement.append(childTableDiv);
                this.childTableDivs.push(childTableDiv);
                let featureTable = this._loadTable(layer, childTableDiv.attr('id'),that);

                let data = {
                    layer: layer,
                    a: a.attr('id'),
                    div: childTableDiv.attr('id'),
                    featureTable: featureTable,
                    loadedTable:false
                }
                this.datas.push(data);

            }

            this.controlDivElement.append(this.ul);



        }

        _clickEvent(that, target) {
            if (that.isLoadTable.firstClick) {
                that._resizeSplitter('115px', that);
                that.isLoadTable.firstClick = false;
            }
            let datas = that.datas;
            for (var i in datas) {
                let data = datas[i];
                if (data.a == target.id) {
                    if (!data.loadedTable) {
                        data.featureTable.startup();
                        data.loadTable = true;
                    }
                    document.getElementById(data.div).style.display = 'block';
                }
                else {
                    document.getElementById(data.div).style.display = 'none';
                }
            }

        }
        _loadTable(layer, div, that) {
            that = that || this;
            //create new FeatureTable and set its properties 
            // create new FeatureTable and set its properties 
            var myFeatureTable = new FeatureTable({
                featureLayer: layer,
                map: map,
                // only allows selection from the table to the map 
                syncSelection: true,
                zoomToSelection: true,
                editable: true,
                gridOptions: {
                    allowSelectAll: true,
                    allowTextSelection: true,
                },
                dateOptions: {
                    // set date options at the feature table level 
                    // all date fields will adhere this 
                    datePattern: "d/M/y"
                },
                menuFunctions: [{
                    label: "Phóng đến",
                    callback: function () {
                        map.setZoom(15);
                    }
                }, {
                    label: "Tìm kiếm",
                    callback: function () {
                        if (layer.frmSearchDlg) {
                            layer.frmSearchDlg.show();
                        } else {
                            alert('Không có chức năng tìm kiếm trong mục này, liên hệ với DITAGIS để được hỗ trợ');
                        }
                    }
                }, {
                    label: "Xóa lựa chọn",
                    callback: function () {
                        let selecteds = myFeatureTable.selectedRowIds;
                        let graphics = [];
                        for (let i in selecteds) {
                            let select = selecteds[i];
                            graphics.push(new Graphic(null, null, {
                                OBJECTID: select
                            }));

                        }
                        layer.applyEdits(null, null, graphics);
                        myFeatureTable.refresh();
                        layer.refresh();
                    }
                },{
                    label: "Biểu đồ",
                    callback: function (evt) {
                        if (layer.frmChart) {
                            layer.frmChart.show();
                        } else {
                            alert('Không có chức năng biểu đồ trong mục này, liên hệ với DITAGIS để được hỗ trợ');
                        }
                    }
                },{
                    label: "Ẩn bảng",
                    callback: function (evt) {
                        that._resizeSplitter(0, that);
                    }
                }]
            }, div);
            //on(myFeatureTable, 'row-select', function () {
            //    map.setZoom(15);
            //});
            document.getElementById(div).style.display = 'hidden';
            return myFeatureTable;
        }
        _resizeSplitter(height, that) {
            if (that.mainContainer) {
                that = that || this;
                that.tableDivElement.css('height', height);
                registry.byId(that.mainContainer).resize();
            }
        }
    }
});