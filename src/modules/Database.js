const config = {

    user: 'bvtvbinhduong',

    password: 'BaovethucvatBD2017',

    server: 'ditagis.com',

    database: 'BinhDuong_BaoVeThucVat',
    options: {
        encrypt: false // Use this if you're on Windows Azure 
    }

}
let sql = require('mssql')
class Database {
    constructor(params) {
        this.sql = sql;
    }
    connect(){
        return this.sql.connect(config);
    }
    close(){
		this.sql.close();
	}
}
module.exports = Database;