'use strict'
let Router = require('./router');
var TTM = require('../modules/TrongTrotDB');
var LayerRole = require('../modules/Layer');
class MapRouter extends Router {
	constructor(params) {
		super(params);
		this.trongtrotDB = new TTM();
		this.layerRole = new LayerRole();
		this.router.get('/', (req, res) => {
			if (this.session && this.session.user) {
				res.render('map', {
					title: 'Bảo vệ thực vật - Bình Dương'
				});

			} else {
				res.redirect('/login');
			}
		});
		this.router.post('/', (req, res) => {
			if (this.session && this.session.user) {
				res.status(200).send({
					userName:this.session.user.Username,
					displayName:this.session.user.DisplayName,
					role:this.session.user.Role
				});
			} else {
				res.status(400).send('fail');
			}
		});
		this.router.post('/layerrole', (req, res) => {
			if (this.session && this.session.user) {
				this.layerRole.getByRole(this.session.user.Role).then(result=>{
					res.status(200).send(result);
				}).catch(err=>{
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

		this.router.post('/trongtrot/thoigian/add', (req, res) => {
			console.log(req.body);
			const attributes = {
				MaDoiTuong: req.body.MaDoiTuong,
				Thang: req.body.Thang,
				Nam: req.body.Nam,
				NhomCayTrong: req.body.NhomCayTrong,
				LoaiCayTrong: req.body.LoaiCayTrong || null
			}
			// this.trongtrotDB.add(attributes).then(result => {
			// 	res.status(200).send('Successfully');
			// }).catch(err => {
			// 	res.status(400).send(err);
			// })
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