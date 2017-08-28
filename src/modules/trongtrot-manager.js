const sql = require('mssql')
let config = {

	user: 'sa',

	password: '268@lTk',

	server: '112.78.4.175',

	database: 'BaoVeThucVat',
	options: {
		encrypt: false // Use this if you're on Windows Azure 
	}

}
let pool = new sql.ConnectionPool(config);

let timer = function (id, month, year) {
	return new Promise((resolve, reject) => {

		pool.connect().then(() => {
			new sql.Request(pool).query(`SELECT * FROM THOIGIANSANXUATTRONGTROT WHERE MADOITUONG = ${id} AND THANG = ${month} AND NAM = ${year}`)
				.then(result => {
					resolve(result.recordset);
					pool.close();
				}).catch(err => {
					reject(err);
					pool.close();
				})
		})
	});
}
let getByMaDoiTuong = function (maDoiTuong) {
	return new Promise((resolve, reject) => {

		pool.connect().then(() => {
			new sql.Request(pool).query(`SELECT * FROM THOIGIANSANXUATTRONGTROT WHERE MADOITUONG = ${maDoiTuong}`)
				.then(result => {
					resolve(result.recordset);
					pool.close();
				}).catch(err => {
					reject(err);
					pool.close();
				})
		})
	});
}
let add = function (attributes) {
	return new Promise((resolve, reject) => {
		console.log(attributes);
		let
			MaDoiTuong = attributes.MaDoiTuong,
			Thang = attributes.Thang,
			Nam = attributes.Nam,
			NhomCayTrong = attributes.NhomCayTrong,
			LoaiCayTrong = attributes.LoaiCayTrong || null;
		if (MaDoiTuong && Thang && Nam && NhomCayTrong) {
			pool.connect().then(() => {
				new sql.Request(pool).query(`SELECT TOP 1 OBJECTID FROM THOIGIANSANXUATTRONGTROT ORDER BY OBJECTID DESC `)
					.then(result => {
						console.log(result);
						let ObjectId = result.recordset[0].OBJECTID + 1;
						new sql.Request(pool).query(`INSERT INTO THOIGIANSANXUATTRONGTROT (OBJECTID,MADOITUONG,THANG,NAM,NHOMCAYTRONG,LOAICAYTRONG) VALUES(${ObjectId},${MaDoiTuong},${Thang},${Nam},${NhomCayTrong},'${LoaiCayTrong}')`)
							.then(result => {
								console.log(result);
								resolve(result);
								pool.close();
							})
					})
					.catch(err => {
						reject(err);
						pool.close();
					});
			})
		}
		else {
			reject('Tham số truyền vào còn thiếu hoặc không chính xác');
		}
	});
}
exports.timer = timer;
exports.add = add;
exports.getByMaDoiTuong = getByMaDoiTuong;