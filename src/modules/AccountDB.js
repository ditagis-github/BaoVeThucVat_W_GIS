const Database = require('./Database');
class AccountManager extends Database {
	constructor(params) {
		super(params);
	}
	getRoleByUsername(username) {
		return new Promise((resolve, reject) => {
			this.getByUsername(username).then(res => {
				if (res)
					resolve(res.Role)
				else
					resolve(null);
			}).catch(err => reject(err));
		});
	}
	getByUsername(username) {
		return new Promise((resolve, reject) => {
			this.select(`SELECT * FROM ACCOUNT WHERE USERNAME = '${username}'`).then(recordset=>{
				if (recordset.length > 0)
				resolve(recordset[0])
			else resolve(null);
			})
		})
	}
	isUser(username, password) {
		return new Promise((resolve, reject) => {
			this.select(`SELECT * FROM ACCOUNT WHERE USERNAME = '${username}' AND PASSWORD = '${password}'`).then(recordset=>{
				if (recordset.length > 0)
				resolve(recordset[0])
			else resolve(null);
			})
		})
	}
}
module.exports = AccountManager