'use strict'
let Router = require('./router');
var TTM = require('../modules/trongtrotdb');
class MapRouter extends Router {
	constructor(params) {
		super(params);
		this.trongtrotDB = new TTM();
		this.router.get('/', (req, res) => {
			if (this.session && this.session.user) {
				res.render('map', {
					title: 'Bảo vệ thực vật - Bình Dương',
					user: this.session.user
				});

			} else {
				res.redirect('/login');
			}
		});

		this.router.post('/trongtrot/thoigian', (req, res) => {
			this.trongtrotDB.timer(req.body.id, req.body.month, req.body.year).then(result => {
				res.status(200).send(result);
			}).catch(err => {
				res.status(400).send(err);
			})
		})

		this.router.post('/trongtrot/thoigian/add', (req, res) => {
			const attributes = {
				MaDoiTuong: req.body.MaDoiTuong,
				Thang: req.body.Thang,
				Nam: req.body.Nam,
				NhomCayTrong: req.body.NhomCayTrong,
				LoaiCayTrong: req.body.LoaiCayTrong || null
			}
			this.trongtrotDB.add(attributes).then(result => {
				res.status(200).send('Successfully');
			}).catch(err => {
				res.status(400).send(err);
			})
		})
		this.router.post('/trongtrot/thoigian/getbymadoituong', (req, res) => {
			console.log(req.body);
			const maDoiTuong = req.body.MaDoiTuong;
			if (maDoiTuong) {
				this.trongtrotDB.getByMaDoiTuong(maDoiTuong).then(result => {
					res.status(200).send(result);
				}).catch(err => {
					res.status(400).send(err);
				})
			} else {
				res.status(400).send('Parameters is null');
			}
		})
	}
}
module.exports = MapRouter;