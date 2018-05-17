define(["require", "exports", "./EventListener"], function (require, exports, EventListener) {
    "use strict";
    var SystemStatusObject = (function () {
        function SystemStatusObject() {
            this.eventListener = new EventListener(this);
        }
        return SystemStatusObject;
    }());
    return SystemStatusObject;
});
