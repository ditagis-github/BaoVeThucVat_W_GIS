'use strict'
var AccountManager = require('../modules/AccountDB');
let Router = require('./router');
class AccountRouter extends Router {
	constructor(params) {
		super(params);
		this.accountManager = new AccountManager();
		this.router.get('/', (req, res) => {
			if (req.session.user == null) {
				// if user is not logged-in redirect back to login page //
				res.redirect('/');
			} else {
				res.render('account/home', {
					title: 'Quản lý tài khoản',
					udata: req.session.user
				});
			}
		});

		this.router.post('/', (req, res) => {
			if (this.session.user == null) {
				res.redirect('/');
			} else {
				this.accountManager.updateAccount({
					id: this.session.user.Id,
					displayName: req.body['displayName'],
					password: req.body['password'],
				}.then(user => {
					this.session.user = user;
					// update the user's login cookies if they exists //
					if (req.cookies.user != undefined && req.cookies.pass != undefined) {
						res.cookie('username', user.Username, { maxAge: 900000 });
						res.cookie('password', user.Password, { maxAge: 900000 });
					}
					res.status(200).send('ok');
				}).catch(o => res.status(400).send('error-updating-account')));
			}
		});

		this.router.get('/logout', (req, res) => {
			console.log('logout');
			res.clearCookie('username');
			res.clearCookie('password');
			req.session.destroy();
			this.session=null;
			res.redirect('/');
			res.end()

		})

		// creating new accounts //

		this.router.get('/signup', (req, res) => {
			res.render('account/signup', { title: 'Signup', countries: CT });
		});

		this.router.post('/signup', (req, res) => {
			this.accountManager.addNewAccount({
				name: req.body['name'],
				email: req.body['email'],
				user: req.body['user'],
				pass: req.body['pass'],
			}).then((e) => {
				if (e) {
					res.status(400).send(e);
				} else {
					res.status(200).send('ok');
				}
			});
		});

		this.router.post('/account/delete', (req, res) => {
			this.accountManager.deleteAccount(req.body.id, (e, obj) => {
				if (!e) {
					res.clearCookie('user');
					res.clearCookie('pass');
					req.session.destroy((e) => { res.status(200).send('ok'); });
				} else {
					res.status(400).send('record not found');
				}
			});
		});

	}
}
module.exports = AccountRouter;