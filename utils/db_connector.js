let db_user = process.env.CM_DB_USER;
let db_pass = process.env.CM_DB_PASS;
let db_host = process.env.CM_DB_HOST;
let db_port = process.env.CM_DB_PORT;
let db_name = process.env.CM_DB_NAME;

const pg = require('pg');

module.exports = {
    connect: function() {
        const pool = new pg.Pool({
            user: db_user,
            host: db_host,
            database: db_name,
            password: db_pass,
            port: db_port
        });
        return pool;
    },
    close: function(db) {
        db.end((err) => {
            if (err) {
                return console.error(err.message);
            }
        });
    }
}
