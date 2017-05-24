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
            this.mainContainer = mainContainer;
            this.tableDiv = $("#" + (tableDiv || 'contentPane'));
            this.childTableDivs = [];
            this.controlDiv = $("#" + (controlDiv || 'tableControl'));
            this.controlDiv.addClass('dropdown map-control');
            this.button = $('<button/>');
            this.button.attr('data-toggle', 'dropdown');
            this.button.attr('type', 'button');

            let span = $('<span/>');
            span.addClass(this.options.icon);
            this.button.append(span);
            this.controlDiv.append(this.button);
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
                a.attr('id', layer.id);
                a.text(layer._params.name);
                a.click(function (evt) {
                    _clickEvent(that, evt.target);
                })
                li.append(a);
                this.ul.append(li);
                let childTableDiv = $('<div/>');
                childTableDiv.attr('id', layer.id);

                this.tableDiv.append(childTableDiv);
                this.childTableDivs.push(childTableDiv);
                this._loadTable(layer, childTableDiv.attr('id'));
                childTableDiv.addClass('hidden');
                console.log(childTableDiv.attr('class'));

            }

            this.controlDiv.append(this.ul);



        }

        _clickEvent(that, target) {
            if (that.isLoadTable.firstClick) {
                that._resizeSplitter('115px', that);
                that.isLoadTable.firstClick = false;
            }
            for (var i in that.childTableDivs) {
                let childTableDiv = that.childTableDivs[parseInt(i)];
                if (childTableDiv.attr('id') == $(target).attr('id')) {
                    childTableDiv.css('display', 'block');
                    let layer = that.options.layers[i];
                    if (!that.isLoadTable[layer.id]) {
                        layer.featureTable.startup();
                        that.isLoadTable[layer.id] = true;
                    }
                } else {
                    childTableDiv.css('display', 'none');
                }


            }

        }
        _loadTable(layer, div) {
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
                    label: "Ẩn bảng",
                    callback: function (evt) {
                        resizeSplitter(0);
                    }
                }, {
                    label: "Phóng đến",
                    callback: function () {
                        map.setZoom(15);
                    }
                }, {
                    label: "Tìm kiếm",
                    callback: function () {
                        layer.frmSearchDlg.show();
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
                }]
            }, div);
            //on(myFeatureTable, 'row-select', function () {
            //    map.setZoom(15);
            //});
            layer.featureTable = myFeatureTable;
        }
        _resizeSplitter(height, that) {
            if (that.mainContainer) {
                that = that || this;
                that.tableDiv.css('height', height);
                registry.byId(that.mainContainer).resize();
            }
        }
    }
});