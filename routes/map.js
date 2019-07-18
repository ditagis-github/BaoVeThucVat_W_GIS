'use strict'
let Router = require('./router');
var TTM = require('../modules/TrongTrotDB');
var LayerRole = require('../modules/Layer');
var AccountManager = require('../modules/AccountDB');
class MapRouter extends Router {
	constructor(params) {
		super(params);
		this.trongtrotDB = new TTM();
		this.layerRole = new LayerRole();
		this.accountManager = new AccountManager();
		// });
		this.router.get('/', (req, res) => {
			if (req.isAuthenticated()) {
				res.render('map', {
					title: 'Bảo vệ thực vật - Bình Dương'
				});
			} else {
				res.redirect('/login');
			}
		});
		this.router.post('/', (req, res) => {
			if (req.isAuthenticated()) {
				const user = req.session.passport.user;
				res.status(200).send({
					userName: user.Username,
					displayName: user.DisplayName,
					role: user.Role
				});

			} else {
				res.status(400).send('fail');
			}
		});
		this.router.post('/layerrole', (req, res) => {
			if (req.isAuthenticated()) {
				const user = req.session.passport.user;
				this.layerRole.getByRole(user.Role).then(result => {
					res.status(200).send(result);
				}).catch(err => {
					res.status(400).send(null);
					console.log(err);
				})

			} else {
				res.status(400).send('fail');
			}
		});

		this.router.post('/trongtrot/thoigian', (req, res) => {
			this.trongtrotDB.timer(req.body.id, req.body.month, req.body.year).then(result => {
				res.status(200).send(result);
			}).catch(err => {
				res.status(400).send(err);
			})
		})

		this.router.post('/trongtrot/thoigian/edits', async (req, res) => {
			let body = JSON.parse(req.body.edits);
			try {
				if (body.adds) {
					body.adds.forEach(
						async addModel => {
							console.log(addModel);
							await this.trongtrotDB.add({
								...addModel,
								ThoiGianBatDauTrong: new Date(parseInt(addModel.ThoiGianBatDauTrong)),
								ThoiGianTrongTrot: new Date(parseInt(addModel.ThoiGianTrongTrot)),
								NgayCapNhat: new Date(parseInt(addModel.NgayCapNhat)),
							})

						})
				}

				if (body.deletes) {
					body.deletes.forEach(
						async id => await this.trongtrotDB.delete(id)
					);
				}

				if (body.updates) {
					body.updates.forEach(
						async attributes => await this.trongtrotDB.update(attributes)
					);
				}
				res.status(200).send();
			} catch (error) {
				res.status(400).send(error)
			}
		})

		this.router.post('/trongtrot/thoigian/getbymadoituong', (req, res) => {
			const maDoiTuong = req.body.MaDoiTuong;
			if (maDoiTuong) {
				this.trongtrotDB.getByMaDoiTuong(maDoiTuong)
					.then(result => res.status(200).send(result))
					.catch(err => res.status(400).send(err));
			} else {
				res.status(400).send('Parameters is null');
			}
		})
	}
}
module.exports = MapRouter;