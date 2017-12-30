define(["require", "exports", "dojo/dom-construct", "dojo/dom-style"], function (require, exports, domConstruct, domStyle) {
    "use strict";
    class Tooltip {
        constructor() {
            this.container = domConstruct.toDom('<div class="dtg-tooltip-map"></div>');
            domStyle.set(this.container, {
                position: 'fixed'
            });
        }
        static instance() {
            if (!this._instance)
                this._instance = new Tooltip();
            return this._instance;
        }
        show(screencoor, string) {
            domStyle.set(this.container, {
                left: `${screencoor[0] + 30}px`,
                top: `${screencoor[1]}px`
            });
            this.container.innerHTML = string;
            if (!document.body.contains(this.container))
                document.body.appendChild(this.container);
        }
        hide() {
            if (document.body.contains(this.container))
                document.body.removeChild(this.container);
        }
    }
    return Tooltip;
});
//# sourceMappingURL=Tooltip.js.map