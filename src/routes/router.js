
class Router {
    constructor(params = { session: null }) {
        let router = require('express').Router();
        this.params = params;
        this.router = router;
    }
    get session() {
        return this.params.session;
    }
    set session(val) {
        this.params.session = val;
    }
};
module.exports = Router;