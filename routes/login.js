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
			failureRedirect: '/login'
		}), function (req, res) {
			res.redirect(req.body.pm)
		})
	}
}
module.exports = LoginRouter;