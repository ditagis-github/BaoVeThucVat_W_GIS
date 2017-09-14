'use strict'
var AccountManager = require('../modules/accountdb');
let Router = require('./router');
class LoginRouter extends Router {
	constructor(params) {
		super(params);
		this.accountManager = new AccountManager();
		this.router.get('/', function (req, res) {
			res.redirect('/login')
		});
		this.router.get('/login', (req, res) => {
			if (this.session && this.session.user) {
				res.redirect('/map');
			} else {
				res.render('login', { title: 'Đăng nhập' });
			}
		});
		this.router.post('/login', (req, res) => {
			this.accountManager.manualLogin(req.body['user'], req.body['pass']).then(user => {
				if (user) {
					this.session = req.session;
					this.session.user = user;

					if (req.body['remember-me'] == true) {
						res.cookie('username', user.Username, { maxAge: 900000 });
						res.cookie('password', user.Password, { maxAge: 900000 });
					}
					// res.status(200).send(user);
					res.redirect('/map');
					res.end();
				}
				else {
					res.status(400).send('Không tìm thấy tài khoản');
				}
			}).catch(err => {
				console.log(err);
				res.status(400).send('Không tìm thấy tài khoản');
			})
		});
	}
}
module.exports = LoginRouter;