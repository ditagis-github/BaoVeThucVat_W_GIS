'use strict'
let Router = require('./router');
class LoginRouter extends Router {
	constructor(params) {
		super(params);
		this.router.get('/', function (req, res) {
			res.redirect('/login')
		});
		this.router.get('/login', (req, res) => {
			res.render('login', { title: 'Đăng nhập' });
		});
		this.router.post('/login', this.passport.authenticate('local', {
			successRedirect: '/map',
			failureRedirect: '/login'
		}))
	}
}
module.exports = LoginRouter;