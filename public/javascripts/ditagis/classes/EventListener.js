define(["require", "exports"], function (require, exports) {
    "use strict";
    class EventListener {
        constructor(member) {
            this.eventListeners = {};
            member.on = this.on;
            member.fire = this.fire;
            member.eventListeners = this.eventListeners;
        }
        on(type, listener) {
            if (this.eventListeners[type]) {
                this.eventListeners[type].push(listener);
            }
            else {
                this.eventListeners[type] = [listener];
            }
        }
        fire(type, evt) {
            let listeners = this.eventListeners[type];
            if (listeners) {
                for (let listener of listeners) {
                    listener(evt);
                }
            }
        }
    }
    return EventListener;
});
//# sourceMappingURL=EventListener.js.map