const config = {
    user: 'bvtvbinhduong',
    password: 'BaovethucvatBD2017',
    server: 'ditagis.com',
    database: 'BinhDuong_BVTV',
}
let sql = require('mssql')
class Database {
    async execute(query) {
        try {
            const pool = await sql.connect(config);
            let result = await pool.request().query(query);
            return result;
        } catch (error) {
            throw error;
        }
        finally {
            sql.close();
        }
    }
}
module.exports = Database;