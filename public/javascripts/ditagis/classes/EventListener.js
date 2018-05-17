define(["require", "exports"], function (require, exports) {
    "use strict";
    var EventListener = (function () {
        function EventListener(member) {
            this.eventListeners = {};
            member.on = this.on;
            member.fire = this.fire;
            member.eventListeners = this.eventListeners;
        }
        EventListener.prototype.on = function (type, listener) {
            if (this.eventListeners[type]) {
                this.eventListeners[type].push(listener);
            }
            else {
                this.eventListeners[type] = [listener];
            }
        };
        EventListener.prototype.fire = function (type, evt) {
            var listeners = this.eventListeners[type];
            if (listeners) {
                for (var _i = 0, listeners_1 = listeners; _i < listeners_1.length; _i++) {
                    var listener = listeners_1[_i];
                    listener(evt);
                }
            }
        };
        return EventListener;
    }());
    return EventListener;
});
