const Database = require('./Database');
class TrongTrotDB extends Database {
	constructor(params) {
		super(params)
	}
	timer(id, month, year) {
		return new Promise((resolve, reject) => {
			this.connect().then(() => {
				return sql.query `SELECT * FROM THOIGIANSANXUATTRONGTROT WHERE MADOITUONG = ${id} AND THANG = ${month} AND NAM = ${year}`
			}).then(result => {
				resolve(result.recordset);
			}).catch(err => {
				reject(err);
			})
		})
	}
	getByMaDoiTuong(maDoiTuong) {
		return new Promise((resolve, reject) => {
			this.connect().then(() => {
				return sql.query `SELECT * FROM THOIGIANSANXUATTRONGTROT WHERE MADOITUONG = ${maDoiTuong}`
			}).then(result => {
				resolve(result.recordset);
				console.log(result.recordset);
			}).catch(err => {
				reject(err);
			})
		})
	}
	add(attributes) {
		return new Promise((resolve, reject) => {
			console.log('Them du lieu thoi gian trong trot' + JSON.stringify(attributes));
			let
				MaDoiTuong = attributes.MaDoiTuong,
				Thang = attributes.Thang,
				Nam = attributes.Nam,
				NhomCayTrong = attributes.NhomCayTrong,
				LoaiCayTrong = attributes.LoaiCayTrong || null;
			if (MaDoiTuong && Thang && Nam && NhomCayTrong) {
				this.connect().then(() => {
						return sql.query `SELECT TOP 1 OBJECTID FROM THOIGIANSANXUATTRONGTROT ORDER BY OBJECTID DESC `
					})
					.then(result => {
						let ObjectId = result.recordset[0].OBJECTID + 1;
						return sql.query `INSERT INTO THOIGIANSANXUATTRONGTROT (OBJECTID,MADOITUONG,THANG,NAM,NHOMCAYTRONG,LOAICAYTRONG) VALUES(${ObjectId},${MaDoiTuong},${Thang},${Nam},${NhomCayTrong},${LoaiCayTrong})`
					}).catch(err => {
						console.log(err);
						reject(err);
					})
					.then(result => {
						console.log('Them thanh cong du lieu ' + attributes.MaDoiTuong);
						resolve(result);
					}).catch(err => {
						console.log(err);
						reject(err);
					})
			} else {
				reject('Tham số truyền vào còn thiếu hoặc không chính xác');
			}
		});
	}
	adds(arr) {
		return new Promise((resolve, reject) => {
			this.connect().then((request) => {
				return request.query('SELECT TOP 1 OBJECTID FROM THOIGIANSANXUATTRONGTROT ORDER BY OBJECTID DESC', function (err, ls) {
					console.log(ls);
				})
			})
		});
	}
}
module.exports = TrongTrotDB;