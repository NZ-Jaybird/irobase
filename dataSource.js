const Pool = require('pg').Pool

module.exports = class DataSource {
    constructor(user, host, database, password, port) {
        this.pool = new Pool({ user, host, database, password, port })
    }

    query(sql) {
        return new Promise((resolve, reject) => {
            this.pool.query(sql, (error, results) => {
                if (error) {
                    console.log(error)
                    reject(error)
                } else {
                    console.log(results.command, results.rows)
                    resolve(results)
                }
            })
        })
    }
}
