const config = {

    user: 'bvtvbinhduong',

    password: 'BaovethucvatBD2017',

    server: 'ditagis.com',

    database: 'BinhDuong_BVTV',
    options: {
        encrypt: false // Use this if you're on Windows Azure 
    }
}
let sql = require('mssql')
class Database {
    constructor(params) {
        this.sql = sql;
    }
    static set request(request) {
        this._request = request
    }
    static get request() {
        return this._request;
    }
    static create(params) {
        if (!this._instance)
            this._instance = new Database(params);
        return this._instance;
    }
    getColumns(table) {
        return new Promise((resolve, reject) => {
            this.query(`SELECT 
        c.name 'ColumnName',
        t.Name 'DataType',
        c.max_length 'MaxLength',
        c.precision ,
        c.scale ,
        c.is_nullable,
        C.is_identity 'IsIdentity',
        ISNULL(i.is_primary_key, 0) 'PrimaryKey'
    FROM    
        sys.columns c
    INNER JOIN 
        sys.types t ON c.user_type_id = t.user_type_id
    LEFT OUTER JOIN 
        sys.index_columns ic ON ic.object_id = c.object_id AND ic.column_id = c.column_id
    LEFT OUTER JOIN 
        sys.indexes i ON ic.object_id = i.object_id AND ic.index_id = i.index_id
    WHERE
        c.object_id = OBJECT_ID('${table}')`).then(rows => {
                resolve(rows.recordset);
                ////this.close();
            })
        });

    }
    connect() {
        console.log('connect database');
        return new Promise((resolve, reject) => {
            if (Database.request) {
                resolve(Database.request);
            } else {
                this.sql.connect(config).then(function () {
                    Database.request = new sql.Request();
                    resolve(Database.request);
                })
            }
            //   ////this.close();
            //   this.sql.connect(config).then(() => {
            //     const request = new this.sql.Request()
            //     resolve(request);
            //   }).catch(err => {
            //     reject(err);
            //     ////this.close();
            //   });
        });
    }
    query(sql, request) {
        return new Promise((resolve, reject) => {
            if (request) {
                request.query(sql, (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result.recordset)
                    }
                })
            } else {
                this.connect().then((request) => {
                    request.query(sql, (err, result) => {
                        if (err) {
                            console.log(err);
                            reject(err);
                        } else {
                            resolve(result)
                        }
                        ////this.close();
                    })
                }).catch(err => {
                    console.log(err);
                    reject(err);
                    ////this.close();
                });
            }
        });
    }
    select(sql, request) {
        return new Promise((resolve, reject) => {
            if (request) {
                request.query(sql, (err, result) => {
                    if (err) {
                        console.log(err);
                        reject(err);
                    } else {
                        resolve(result.recordset)
                    }
                })
            } else {
                this.connect().then((request) => {
                    request.query(sql, (err, result) => {
                        if (err) {
                            console.log(err);
                            reject(err);
                        } else {
                            resolve(result.recordset)
                        }
                        ////this.close();
                    })
                }).catch(err => {
                    console.log(err);
                    reject(err);
                    ////this.close();
                });
            }
        });
    }
    close() {
        console.log('close database');
        this.sql.close();
    }
    delete(id, table) {
        return this.query(`DELETE FROM ${table} WHERE ID = ${id}`);
    }
}
module.exports = Database;