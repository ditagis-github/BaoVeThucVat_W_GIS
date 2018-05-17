const Database = require('./Database');
class LayerRoleManager extends Database {
	async getByRole(role) {
		try {
			let result = await this.execute(`SELECT layer,role,isView,isDelete,isEdit,isCreate FROM LAYERROLE WHERE ROLE = ${role}`);
			return result.recordset;
		} catch (error) {
			throw error;
		}
	}

}
module.exports = LayerRoleManager;