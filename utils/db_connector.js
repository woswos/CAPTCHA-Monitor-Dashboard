const sqlite3 = require('sqlite3').verbose();

// Get the database file from the environment variable
let db_file = process.env.CM_DB_FILE_PATH;

module.exports = {
    connect: function() {
        let db = new sqlite3.Database(db_file, sqlite3.OPEN_READONLY, (err) => {
            if (err) {
                return console.error(err.message);
            }
            //console.log('Connected to the SQlite database.');
        });

        return db;
    },
    close: function(db) {
        db.close((err) => {
            if (err) {
                return console.error(err.message);
            }
            //console.log('Close the database connection.');
        });
    }
}
