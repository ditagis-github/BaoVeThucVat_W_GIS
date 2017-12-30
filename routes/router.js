
class Router {
    constructor(params = { session: null }) {
        let router = require('express').Router();
        this.params = params;
        this.router = router;
    }
    get passport(){
        return this.params.passport;
    }
};
module.exports = Router;