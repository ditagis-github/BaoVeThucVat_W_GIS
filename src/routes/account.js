
var CT = require('../modules/country-list');
var AM = require('../modules/account-manager');
// var EM = require('../modules/email-dispatcher');
const router = require('express').Router();

// main login page //
router.get('/', function (req, res) {
	// check if the user's credentials are saved in a cookie //
	if (!req.cookies.user || !req.cookies.pass) {
		res.render('login', { title: 'Đăng nhập' });
	} else {
		// attempt automatic login //
		AM.autoLogin(req.cookies.user, req.cookies.pass, function (o) {
			if (o != null) {
				req.session.user = o;
				res.redirect('/map');
			} else {
				res.render('login', { title: 'Đăng nhập' });
			}
		});
	}
});

router.post('/', function (req, res) {
	const account = AM.manualLogin(req.body['user'], req.body['pass']);
	if (!account) {
		res.status(400).send('Cannot find account');
	} else {
		req.session.user = account;
		if (req.body['remember-me'] == true) {
			res.cookie('user', o.user, { maxAge: 900000 });
			res.cookie('pass', o.pass, { maxAge: 900000 });
		}
		res.status(200).send(account);
	}
});

// logged-in user homepage //

router.get('/map', function (req, res) {
	if (req.session.user == null) {
		// if user is not logged-in redirect back to login page //
		res.redirect('/');
	} else {
		res.render('map', {
			title: 'Hệ thống viễn thông thụ động tỉnh Bình Dương',
			user: req.session.user
		});
	}
});

router.get('/account', function (req, res) {
	if (req.session.user == null) {
		// if user is not logged-in redirect back to login page //
		res.redirect('/');
	} else {
		res.render('account/home', {
			title: 'Control Panel',
			countries: CT,
			udata: req.session.user
		});
	}
});

router.post('/account', function (req, res) {
	if (req.session.user == null) {
		res.redirect('/');
	} else {
		AM.updateAccount({
			id: req.session.user._id,
			name: req.body['name'],
			email: req.body['email'],
			pass: req.body['pass'],
			country: req.body['country']
		}, function (e, o) {
			if (e) {
				res.status(400).send('error-updating-account');
			} else {
				req.session.user = o;
				// update the user's login cookies if they exists //
				if (req.cookies.user != undefined && req.cookies.pass != undefined) {
					res.cookie('user', o.user, { maxAge: 900000 });
					res.cookie('pass', o.pass, { maxAge: 900000 });
				}
				res.status(200).send('ok');
			}
		});
	}
});

router.post('/account/logout', function (req, res) {
	res.clearCookie('user');
	res.clearCookie('pass');
	req.session.destroy(function (e) { res.status(200).send('ok'); });
})

// creating new accounts //

router.get('/account/signup', function (req, res) {
	res.render('account/signup', { title: 'Signup', countries: CT });
});

router.post('/account/signup', function (req, res) {
	AM.addNewAccount({
		name: req.body['name'],
		email: req.body['email'],
		user: req.body['user'],
		pass: req.body['pass'],
		country: req.body['country']
	}, function (e) {
		if (e) {
			res.status(400).send(e);
		} else {
			res.status(200).send('ok');
		}
	});
});

// password reset //

router.post('/account/lost-password', function (req, res) {
	// look up the user's account via their email //
	AM.getAccountByEmail(req.body['email'], function (o) {
		if (o) {
			EM.dispatchResetPasswordLink(o, function (e, m) {
				// this callback takes a moment to return //
				// TODO add an ajax loader to give user feedback //
				if (!e) {
					res.status(200).send('ok');
				} else {
					for (k in e) console.log('ERROR : ', k, e[k]);
					res.status(400).send('unable to dispatch password reset');
				}
			});
		} else {
			res.status(400).send('email-not-found');
		}
	});
});

router.get('/account/reset-password', function (req, res) {
	var email = req.query["e"];
	var passH = req.query["p"];
	AM.validateResetLink(email, passH, function (e) {
		if (e != 'ok') {
			res.redirect('/');
		} else {
			// save the user's email in a session instead of sending to the client //
			req.session.reset = { email: email, passHash: passH };
			res.render('account/reset', { title: 'Reset Password' });
		}
	})
});

router.post('/account/reset-password', function (req, res) {
	var nPass = req.body['pass'];
	// retrieve the user's email from the session to lookup their account and reset password //
	var email = req.session.reset.email;
	// destory the session immediately after retrieving the stored email //
	req.session.destroy();
	AM.updatePassword(email, nPass, function (e, o) {
		if (o) {
			res.status(200).send('ok');
		} else {
			res.status(400).send('unable to update password');
		}
	})
});

// view & delete accounts //

router.get('/account/print', function (req, res) {
	AM.getAllRecords(function (e, accounts) {
		res.render('account/print', { title: 'Account List', accts: accounts });
	})
});

router.post('/account/delete', function (req, res) {
	AM.deleteAccount(req.body.id, function (e, obj) {
		if (!e) {
			res.clearCookie('user');
			res.clearCookie('pass');
			req.session.destroy(function (e) { res.status(200).send('ok'); });
		} else {
			res.status(400).send('record not found');
		}
	});
});

router.get('/account/reset', function (req, res) {
	AM.delAllRecords(function () {
		res.redirect('account/print');
	});
});

module.exports = router