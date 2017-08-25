const router = require('express').Router();
// var AM = require('../controllers/account-manager');
router.get('/', (req, res, next) => {
    // check if the user's credentials are saved in a cookie //
    if (req.session.user ||( req.cookies.username &&  req.cookies.password)) {
        res.redirect('/map')
    } else {
        res.render('login', { title: 'Hello - Please Login To Your Account' });
    }
})
router.post('/', (req, res, next) => {
    const username = req.body.uname,
        password = req.body.pwd;
    if (username === 'admin' && password === 'admin') {
        console.log(req.session);
        req.session.user = {
            username: username,
            password: password
        }
        if (req.body['remember-me'] == 'on') {
            res.cookie('username', username, { maxAge: 90000 })
            res.cookie('password', password, { maxAge: 90000 })
        }
        res.redirect('/map');
    } else {
        res.render('login', { title: 'Hello - Please Login To Your Account' });
    }
})
module.exports = router;
