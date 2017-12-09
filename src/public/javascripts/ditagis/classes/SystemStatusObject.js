define(["require", "exports", "./EventListener"], function (require, exports, EventListener) {
    "use strict";
    class SystemStatusObject {
        constructor() {
            this.eventListener = new EventListener(this);
        }
    }
    return SystemStatusObject;
});
//# sourceMappingURL=SystemStatusObject.js.map