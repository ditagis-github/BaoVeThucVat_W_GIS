import EventListener = require('./EventListener');
class SystemStatusObject {
    eventListener: EventListener;
    user:any;
    constructor() {
        this.eventListener = new EventListener(this);
    }
}
export = SystemStatusObject;