define(["require", "exports", "dojo/on", "dojo/dom-construct", "esri/widgets/Expand"], function (require, exports, on, domConstruct, Expand) {
    "use strict";
    class EditorHistory {
        constructor(options) {
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
        initView() {
            let container = domConstruct.create('div', {
                class: "editor-history-widget",
            });
            let resultsContainer = domConstruct.create('div', {
                class: "results-container"
            }, container);
            this.ul = domConstruct.create('ul', { class: "list-group" }, resultsContainer);
            this.expand = new Expand({
                expandIconClass: this.options.icon,
                expandTooltip: this.options.title,
                view: this.view,
                content: container
            });
        }
        add(info) {
            let li = domConstruct.create('li', {
                class: "list-group-item"
            }, this.ul);
            this.number++;
            let index = this.number / 10 < 1 ? '0' + this.number : this.number;
            let date = new Date();
            let time = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
            li.innerHTML = `<div class="row">
        <div class="col-1">
        <span class="number">${index}</span></div>
        <div class="col-2">
        <strong class="name">${info.layerName}</strong>
        <p>Thời gian: ${time}</p></div></div>`;
            if (info.geometry) {
                on(li, 'click', _ => {
                    this.view.goTo(info.geometry);
                });
            }
        }
    }
    return EditorHistory;
});
//# sourceMappingURL=EditorHistory.js.map