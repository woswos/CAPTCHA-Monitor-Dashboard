var express = require('express');
var router = express.Router();
var dbHandle = require('../utils/db_connector.js');

router.get('/:limit?', function(req, res, next) {

    let db = dbHandle.connect();

    if (typeof req.params.limit == 'undefined') {
        req.params.limit = 50;
    } else if (isNaN(req.params.limit)) {
        res.status(400).json({
            "error": 'Invalid offset'
        });
        return
    }

    let sql = 'SELECT nickname, fingerprint, address, is_ipv4_exiting_allowed, is_ipv6_exiting_allowed, country, status FROM relays ORDER BY nickname ASC LIMIT ' + req.params.limit;

    let params = []
    db.all(sql, params, (err, rows) => {
        if (err) {
            res.status(400).json({
                "error": err.message
            });
            return;
        }

        let result_json = {
            "message": "success",
            "results": rows
        }

        res.json(result_json);
    });

    dbHandle.close(db);
});

router.get('/details/:fingerprint', function(req, res, next) {

    let db = dbHandle.connect();

    let sql = 'SELECT * FROM relays WHERE fingerprint = ?';

    let params = [req.params.fingerprint]
    db.all(sql, params, (err, rows) => {
        if (err) {
            res.status(400).json({
                "error": err.message
            });
            return;
        }

        let result_json = {
            "message": "success",
            "results": rows
        }

        res.json(result_json);
    });

    dbHandle.close(db);
});

module.exports = router;
