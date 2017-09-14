const config = {

	user: 'sa',

	password: '268@lTk',

	server: '112.78.4.175',

	database: 'BaoVeThucVat',
	options: {
		encrypt: false // Use this if you're on Windows Azure 
	}

}
let sql = require('mssql')
class TrongTrotDB {
	constructor(params) {
		this.pool = new sql.ConnectionPool(config);
	}
	connect() {
		return sql.connect(config);
	}
	close() {
		sql.close();
	}
	select(sql) {
		return new Promise((resolve, reject) => {
			sql.connect(config).then(() => {
				return sql.query`${sql}`
			}).then(result => {
				resolve(result.recordset);
				this.close();
			}).catch(err => {
				reject(err);
				this.close();
			})
		})
	}
	timer(id, month, year) {
		return new Promise((resolve, reject) => {
			sql.connect(config).then(() => {
				return sql.query`SELECT * FROM THOIGIANSANXUATTRONGTROT WHERE MADOITUONG = ${id} AND THANG = ${month} AND NAM = ${year}`
			}).then(result => {
				resolve(result.recordset);
				this.close();
			}).catch(err => {
				reject(err);
				this.close();
			})
		})
	}
	getByMaDoiTuong(maDoiTuong) {
		return new Promise((resolve, reject) => {
			sql.connect(config).then(() => {
				return sql.query`SELECT * FROM THOIGIANSANXUATTRONGTROT WHERE MADOITUONG = ${maDoiTuong}`
			}).then(result => {
				resolve(result.recordset);
				console.log(result.recordset);
				this.close();
			}).catch(err => {
				reject(err);
				this.close();
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
				sql.connect(config).then(() => {
					return sql.query`SELECT TOP 1 OBJECTID FROM THOIGIANSANXUATTRONGTROT ORDER BY OBJECTID DESC `
				})
					.then(result => {
						let ObjectId = result.recordset[0].OBJECTID + 1;
						return sql.query`INSERT INTO THOIGIANSANXUATTRONGTROT (OBJECTID,MADOITUONG,THANG,NAM,NHOMCAYTRONG,LOAICAYTRONG) VALUES(${ObjectId},${MaDoiTuong},${Thang},${Nam},${NhomCayTrong},${LoaiCayTrong})`
					}).catch(err => { console.log(err); reject(err); this.close(); })
					.then(result => {
						console.log('Them thanh cong du lieu ' + attributes.MaDoiTuong);
						resolve(result);
						this.close();
					}).catch(err => { console.log(err); reject(err); this.close(); })
			}
			else {
				reject('Tham số truyền vào còn thiếu hoặc không chính xác');
			}
		});
	}
	adds(arr) {


		sql.connect(config).then(() => {
			return sql.query`SELECT TOP 1 OBJECTID FROM THOIGIANSANXUATTRONGTROT ORDER BY OBJECTID DESC `
		}).then(result => {
			let ObjectId = result.recordset[0].OBJECTID;
			console.log(ObjectId);
			const transaction = new sql.Transaction();
			transaction.begin(err => {
				if (!err) {
					const request = new sql.Request(transaction)
					for (let item of arr) {
						console.log(item);
						let flag = false;
						request.query(`INSERT INTO THOIGIANSANXUATTRONGTROT (OBJECTID,MADOITUONG,THANG,NAM,NHOMCAYTRONG,LOAICAYTRONG) VALUES(${++ObjectId},'${item.MaDoiTuong}',${item.Thang},${item.Nam},${item.NhomCayTrong},'${item.LoaiCayTrong}')`, (err, result) => {
							transaction.commit(err => {
								if (!err)
									flag=true;
							})
						})
						let interval = setInterval(function () {
							console.log(flag);
							if(flag)
								clearInterval(interval);
						}, 1000);
					}
				} else {
					console.log(err);
				}
			});

		})
	}
}
module.exports = TrongTrotDB;