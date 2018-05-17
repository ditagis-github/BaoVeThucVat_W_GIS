define(["require", "exports", "dojo/on", "dojo/dom-construct", "esri/widgets/Expand"], function (require, exports, on, domConstruct, Expand) {
    "use strict";
    var EditorHistory = (function () {
        function EditorHistory(options) {
            this.number = 0;
            this.view = options.view;
            this.options = {
                position: "top-left",
                icon: 'esri-icon-documentation',
                title: 'Lịch sử thao tác dữ liệu'
            };
            this.initView();
            this.view.ui.add(this.expand, this.options.position);
        }
        EditorHistory.prototype.initView = function () {
            var container = domConstruct.create('div', {
                "class": "editor-history-widget"
            });
            var resultsContainer = domConstruct.create('div', {
                "class": "results-container"
            }, container);
            this.ul = domConstruct.create('ul', { "class": "list-group", innerHTML: "<li class='list-group-item'><strong>Chưa có dữ liệu</strong></li>" }, resultsContainer);
            this.expand = new Expand({
                expandIconClass: this.options.icon,
                expandTooltip: this.options.title,
                view: this.view,
                content: container
            });
        };
        EditorHistory.prototype.add = function (info) {
            var _this = this;
            if (this.number === 0) {
                this.ul.innerHTML = '';
            }
            var li = domConstruct.create('li', {
                "class": "list-group-item"
            }, this.ul);
            this.number++;
            var index = this.number / 10 < 1 ? '0' + this.number : this.number;
            var date = new Date();
            var time = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
            li.innerHTML = "<div class=\"row\">\n        <div class=\"col-1\">\n        <span class=\"number\">" + index + "</span></div>\n        <div class=\"col-2\">\n        <strong class=\"name\">" + info.layerName + "</strong>\n        <p>Th\u1EDDi gian: " + time + "</p></div></div>";
            if (info.geometry) {
                on(li, 'click', function (_) {
                    _this.view.goTo(info.geometry);
                });
            }
        };
        return EditorHistory;
    }());
    return EditorHistory;
});
