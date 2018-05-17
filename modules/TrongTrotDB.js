const Database = require('./Database');
const TABLE_NAME = 'THOIGIANSANXUATTRONGTROT';

class TrongTrotDB extends Database {
	timer(id, month, year) {
		return new Promise((resolve, reject) => {
			resolve(null)
			// this.connect().then(() => {
			// 	return sql.query `SELECT * FROM THOIGIANSANXUATTRONGTROT WHERE MADOITUONG = ${id} AND THANG = ${month} AND NAM = ${year}`
			// }).then(result => {
			// 	resolve(result.recordset);
			// }).catch(err => {
			// 	reject(err);
			// })
		})
	}
	async add(attributes) {
		try {
			let result = await this.execute(`INSERT INTO ${TABLE_NAME}(
			OBJECTID,
			MaDoiTuong,
			NhomCayTrong,
			LoaiCayTrong,
			DienTich,
			GiaiDoanSinhTruong,
			NguoiCapNhat,
			NgayCapNhat,
			ThoiGianBatDauTrong,
			ThoiGianTrongTrot
		)
			SELECT ISNULL(MAX(OBJECTID),1) + 1 AS OBJECTID,
			'${attributes.MaDoiTuong}',
			'${attributes.NhomCayTrong}',
			'${attributes.LoaiCayTrong}',
			${attributes.DienTich},
			N'${attributes.GiaiDoanSinhTruong}',
			'${attributes.NguoiCapNhat}',
			'${attributes.NgayCapNhat.toJSON()}',
			'${attributes.ThoiGianBatDauTrong.toJSON()}',
			'${attributes.ThoiGianTrongTrot.toJSON()}'
			FROM ${TABLE_NAME}
		`);
			if (result) return attributes;
		} catch (error) {
			throw error;
		}
	}
	async delete(id) {
		try {
			let result = this.execute(`DELETE FROM ${TABLE_NAME} WHERE OBJECTID = ${id}`);
			return result;
		} catch (error) {
			throw error;
		}
	}
	async update(attributes) {
		try {
			let setStatements = [];

			if (attributes.NhomCayTrong) {
				setStatements.push(
					`NhomCayTrong = '${attributes.NhomCayTrong}'`
				)
			}

			if (attributes.LoaiCayTrong) {
				setStatements.push(
					`LoaiCayTrong = '${attributes.LoaiCayTrong}'`
				)
			}

			if (attributes.DienTich) {
				setStatements.push(
					`DienTich = ${attributes.DienTich}`
				)
			}

			if (attributes.GiaiDoanSinhTruong) {
				setStatements.push(
					`GiaiDoanSinhTruong = N'${attributes.GiaiDoanSinhTruong}'`
				)
			}

			if (attributes.NguoiCapNhat) {
				setStatements.push(
					`NguoiCapNhat = '${attributes.NguoiCapNhat}'`
				)
			}

			if (attributes.NgayCapNhat) {
				setStatements.push(
					`NgayCapNhat = '${new Date(attributes.NgayCapNhat).toJSON()}'`
				)
			}

			if (attributes.ThoiGianBatDauTrong) {
				setStatements.push(
					`ThoiGianBatDauTrong = '${new Date(attributes.ThoiGianBatDauTrong).toJSON()}'`
				)
			}

			if (attributes.ThoiGianTrongTrot) {
				setStatements.push(
					`ThoiGianTrongTrot = '${new Date(attributes.ThoiGianTrongTrot).toJSON()}'`
				)
			}
			if (setStatements.length > 0) {
				let result = this.execute(`
			UPDATE ${TABLE_NAME}
			SET ${setStatements.join(', ')}
			WHERE OBJECTID = ${attributes.OBJECTID}
			`)
				return result;
			} return null;
		} catch (error) {
			throw error;
		}
	}
}
module.exports = TrongTrotDB;