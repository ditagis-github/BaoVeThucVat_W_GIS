const Database = require('./Database');
class AccountManager extends Database {
	async isUser(username, password) {
		try {
			let result = await this.execute(`SELECT * FROM ACCOUNT WHERE USERNAME = '${username}' AND PASSWORD = '${password}'`)
			if (result.recordset.length > 0)
				return result.recordset[0];
		} catch (error) {
			throw error;
		}
	}
}
module.exports = AccountManager