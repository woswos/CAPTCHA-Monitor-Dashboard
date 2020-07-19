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

    let sql = `SELECT id, TO_CHAR(timestamp,'YYYY-MM-DD HH24:MI:SS') as "timestamp", method, url, exit_node, is_captcha_found, is_data_modified, tbb_security_level, browser_version FROM results ORDER BY timestamp DESC LIMIT ` + req.params.limit;

    let params = []
    db.query(sql, params, (err, db_result) => {
        if (err) {
            res.status(400).json({
                "error": err.message
            });
            return;
        }

        let result_json = {
            "message": "success",
            "results": db_result.rows
        }

        res.json(result_json);
    });

    dbHandle.close(db);
});

router.get('/details/:id', function(req, res, next) {

    let db = dbHandle.connect();

    let sql = 'SELECT * FROM results WHERE id = $1';

    let params = [req.params.id]
    db.query(sql, params, (err, db_result) => {
        if (err) {
            res.status(400).json({
                "error": err.message
            });
            return;
        }

        let result_json = {
            "message": "success",
            "results": db_result.rows
        }

        res.json(result_json);
    });

    dbHandle.close(db);
});

module.exports = router;
