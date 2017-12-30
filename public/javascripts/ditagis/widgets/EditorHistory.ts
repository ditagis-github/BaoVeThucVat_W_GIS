import on = require("dojo/on");
import domConstruct = require("dojo/dom-construct");
import Expand = require("esri/widgets/Expand");
import View = require("esri/views/View");
interface ConstructorProperties {
    position?: string; icon?: string; title?: string; view: View;
}
class EditorHistory {
    private view: View;
    private options: ConstructorProperties;
    private expand: Expand;
    private ul: HTMLElement;
    private number: number = 0;
    constructor(options: ConstructorProperties) {
        this.view = options.view;
        this.options = <ConstructorProperties>{
            position: "top-left",
            icon: 'esri-icon-documentation',
            title: 'Lịch sử thao tác dữ liệu'
        }
        this.initView();
        this.view.ui.add(this.expand, this.options.position);
    }
    initView() {
        let container = domConstruct.create('div', {
            class: "editor-history-widget",
        });
        let resultsContainer = domConstruct.create('div',{
            class:"results-container"
        },container)
        this.ul = domConstruct.create('ul', { class: "list-group" }, resultsContainer);
        this.expand = new Expand({
            expandIconClass: this.options.icon,
            expandTooltip: this.options.title,
            view: this.view,
            content: container
        });
    }
    public add(info: {
        layerName: string
    }) {
        let li = domConstruct.create('li', {
            class: "list-group-item"
        },this.ul);
        this.number++;
        let index = this.number / 10 < 1 ? '0' + this.number : this.number;
        let date = new Date();
        let time:String = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
        li.innerHTML = `<div class="row">
        <div class="col-1">
        <span class="number">${index}</span></div>
        <div class="col-2">
        <strong class="name">${info.layerName}</strong>
        <p>Thời gian: ${time}</p></div></div>`
    }
}
export = EditorHistory;