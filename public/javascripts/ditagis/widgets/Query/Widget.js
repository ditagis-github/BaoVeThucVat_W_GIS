define([
    "./QueryLayer",
], function (QueryLayer
) {
        'use strict';
        return class {
            constructor(view, options = {}) {
                this.view = view;
                this.options = {
                    position: "top-left",
                    icon: "esri-icon-review",
                    title: 'Báo cáo, thống kê'
                }
                for (let i in options) {
                    this.options[i] = options[i];
                }
                this.isStartup = false;
                this.initView();
            }
            initView() {
                this.DOM = {};
                this.DOM.container = $("<div/>", {
                    class: "esri-component esri-widget"
                });
                this.DOM.wgbutton = $("<div/>", {
                    class: "esri-widget-button"
                }).appendTo(this.DOM.container);
                this.DOM.span = $("<div/>", {
                    class: this.options.icon,
                    title: this.options.title
                }).appendTo(this.DOM.wgbutton);
                this.view.ui.add(this.DOM.container[0], this.options.position);
                var queryLayer = new QueryLayer(this.view);
                this.DOM.container.on('click', () => {
                    queryLayer.show();
                });
            }
        }
    });