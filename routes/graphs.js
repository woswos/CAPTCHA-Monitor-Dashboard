var express = require('express');
var router = express.Router();
var dbHandle = require('../utils/db_connector.js');

function daysBetween(date1, date2) {
    date1 = Date.UTC(date1.getFullYear(), date1.getMonth(), date1.getDate());
    date2 = Date.UTC(date2.getFullYear(), date2.getMonth(), date2.getDate());
    var ms = Math.abs(date1 - date2);
    return Math.floor(ms / 1000 / 60 / 60 / 24); //floor should be unnecessary, but just in case
}

function dateFormat(date) {
    var monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    var date = new Date(date)
    date.setDate(date.getDate())
    date = monthNames[date.getMonth()] + ',' + date.getDate() + ' ' + date.getFullYear()
    return date
}

/* GET users listing. */
router.get('/tbb_security_levels', function(req, res, next) {

    let db = dbHandle.connect();
    
    let sql = `
    SELECT timestamp, tbb_security_level, is_captcha_found, count(*) AS 'count'
    FROM results
    -- Group by columns and put into 1 day bins
    GROUP BY tbb_security_level, is_captcha_found, (strftime('%s', timestamp) / (6 * 60 * 60 * 4))
    ORDER BY timestamp
    LIMIT 50
    `;

    let params = []
    db.all(sql, params, (err, rows) => {
        if (err) {
            res.status(400).json({
                "error": err.message
            });
            return;
        }

        let today = new Date();
        let tbb_security_levels = ['low', 'medium', 'high'];
        let max_days_prior = 5;
        let labels = [];
        let data_low = [];
        let data_medium = [];
        let data_high = [];

        // Iterate for classifying data for each wanted day
        for (let m = max_days_prior; m > 0; m--) {
            let selected_date = new Date();
            selected_date.setDate(selected_date.getDate() - m);

            // Iterate for classifying data for tbb security levels
            for (let s = 0; s < tbb_security_levels.length; s++) {
                let total_count = 0;
                let captcha_faced_count = 0;
                let captcha_faced_percentage = 0;
                let date;

                // Find the ones that match the day and security level criteria
                for (let i = 0; i < rows.length; i++) {
                    date = new Date(Date.parse(rows[i].timestamp));
                    if (daysBetween(date, today) == m) {
                        selected_date = date
                        if (rows[i].tbb_security_level == tbb_security_levels[s]) {
                            total_count += rows[i].count;
                            if (rows[i].is_captcha_found == '1') {
                                captcha_faced_count += rows[i].count;
                            }
                        }
                    }
                }
                captcha_faced_percentage = ((captcha_faced_count / total_count) * 100).toFixed(2)

                switch (tbb_security_levels[s]) {
                    case 'low':
                        data_low.push(captcha_faced_percentage);
                        break;
                    case 'medium':
                        data_medium.push(captcha_faced_percentage);
                        break;
                    case 'high':
                        data_high.push(captcha_faced_percentage);
                        break;
                }

            }

            labels.push(dateFormat(selected_date));
        }

        let result = {
            "message": "success",
            "result": {
                "labels": labels,
                "data": {
                    "Low (Standard)": data_low,
                    "Medium (Safer)": data_medium,
                    "High (Safest)": data_high
                }
            }
        }

        res.json(result)
    });

    dbHandle.close(db);
});


router.get('/http_vs_https', function(req, res, next) {

    let db = dbHandle.connect();

    let sql = `
    SELECT timestamp, url, is_captcha_found, count(*) AS 'count'
    FROM results
    GROUP BY is_captcha_found, (strftime('%s', timestamp) / (6 * 60 * 60 * 4))
    ORDER BY timestamp
    LIMIT 50
    `;

    let params = []
    db.all(sql, params, (err, rows) => {
        if (err) {
            res.status(400).json({
                "error": err.message
            });
            return;
        }

        let today = new Date();
        let websites = ['https', 'http'];
        let max_days_prior = 5;
        let labels = [];
        let data_http = [];
        let data_https = [];

        // Iterate for classifying data for each wanted day
        for (let m = max_days_prior; m > 0; m--) {
            let selected_date = new Date();
            selected_date.setDate(selected_date.getDate() - m);

            // Iterate for classifying data for tbb security levels
            for (let w = 0; w < websites.length; w++) {
                let total_count = 0;
                let captcha_faced_count = 0;
                let captcha_faced_percentage = 0;
                let date;

                // Find the ones that match the day and security level criteria
                for (let i = 0; i < rows.length; i++) {
                    date = new Date(Date.parse(rows[i].timestamp));
                    if (daysBetween(date, today) == m) {
                        selected_date = date;
                        if (rows[i].url.substring(0, 5) == websites[w]) {
                            total_count += rows[i].count;
                            if (rows[i].is_captcha_found == '1') {
                                captcha_faced_count += rows[i].count;
                            }
                        }
                    }
                }
                captcha_faced_percentage = ((captcha_faced_count / total_count) * 100).toFixed(2)

                switch (websites[w]) {
                    case 'https':
                        data_https.push(captcha_faced_percentage);
                        break;
                    case 'http':
                        data_http.push(captcha_faced_percentage);
                        break;
                }

            }

            labels.push(dateFormat(selected_date));
        }


        let result = {
            "message": "success",
            "result": {
                "labels": labels,
                "data": {
                    "HTTP": data_http,
                    "HTTPS": data_https,
                }
            }
        }

        res.json(result)
    });

    dbHandle.close(db);

});

router.get('/single_vs_multiple_http_reqs', function(req, res, next) {

    let db = dbHandle.connect();

    let sql = `
    SELECT timestamp, url, is_captcha_found, count(*) AS 'count'
    FROM results
    GROUP BY is_captcha_found, (strftime('%s', timestamp) / (6 * 60 * 60 * 4))
    ORDER BY timestamp
    LIMIT 50
    `;

    let params = []
    db.all(sql, params, (err, rows) => {
        if (err) {
            res.status(400).json({
                "error": err.message
            });
            return;
        }

        let today = new Date();
        let websites = ['complex', ''];
        let max_days_prior = 5;
        let labels = [];
        let data_single = [];
        let data_multiple = [];

        // Iterate for classifying data for each wanted day
        for (let m = max_days_prior; m > 0; m--) {
            let selected_date = new Date();
            selected_date.setDate(selected_date.getDate() - m);

            // Iterate for classifying data for tbb security levels
            for (let w = 0; w < websites.length; w++) {
                let total_count = 0;
                let captcha_faced_count = 0;
                let captcha_faced_percentage = 0;
                let date;


                // Find the ones that match the day and security level criteria
                for (let i = 0;
i <
                    rows.length; i++) {
                    date = new Date(Date.parse(rows[i].timestamp));
                    if (daysBetween(date, today) == m) {
                        selected_date = date
                        if (rows[i].url.indexOf(websites[w]) !== -1) {
                            total_count += rows[i].count;
                            if (rows[i].is_captcha_found == '1') {
                                captcha_faced_count += rows[i].count;
                            }
                        }
                    }
                }
                captcha_faced_percentage = ((captcha_faced_count / total_count) * 100).toFixed(2)

                switch (websites[w]) {
                    case '':
                        data_single.push(captcha_faced_percentage);
                        break;
                    case 'complex':
                        data_multiple.push(captcha_faced_percentage);
                        break;
                }

            }

            labels.push(dateFormat(selected_date));
        }


        let result = {
            "message": "success",
            "result": {
                "labels": labels,
                "data": {
                    "Single request": data_single,
                    "Multiple requests": data_multiple,
                }
            }
        }

        res.json(result)
    });

    dbHandle.close(db);

});


router.get('/ip_versions', function(req, res, next) {

    let db = dbHandle.connect();

    let sql = `
    SELECT timestamp, url, is_captcha_found, count(*) AS 'count'
    FROM results
    GROUP BY is_captcha_found, (strftime('%s', timestamp) / (6 * 60 * 60 * 4)), instr(url, 'captcha.wtf')
    ORDER BY timestamp
    LIMIT 50
    `;

    let params = []
    db.all(sql, params, (err, rows) => {
        if (err) {
            res.status(400).json({
                "error": err.message
            });
            return;
        }

        let today = new Date();
        let websites = ['exit11.online', 'captcha.wtf'];
        let max_days_prior = 5;
        let labels = [];
        let data_ipv4 = [];
        let data_ipv6 = [];

        // Iterate for classifying data for each wanted day
        for (let m = max_days_prior; m > 0; m--) {
            let selected_date = new Date();
            selected_date.setDate(selected_date.getDate() - m);

            // Iterate for classifying data for tbb security levels
            for (let w = 0; w < websites.length; w++) {
                let total_count = 0;
                let captcha_faced_count = 0;
                let captcha_faced_percentage = 0;
                let date;

                // Find the ones that match the day and security level criteria
                for (let i = 0; i < rows.length; i++) {
                    date = new Date(Date.parse(rows[i].timestamp));
                    if (daysBetween(date, today) == m) {
                        selected_date = date
                        if (rows[i].url.indexOf(websites[w]) !== -1) {
                            total_count += rows[i].count;
                            if (rows[i].is_captcha_found == '1') {
                                captcha_faced_count += rows[i].count;
                            }
                        }
                    }
                }
                captcha_faced_percentage = ((captcha_faced_count / total_count) * 100).toFixed(2)

                switch (websites[w]) {
                    case 'exit11.online':
                        data_ipv6.push(captcha_faced_percentage);
                        break;
                    case 'captcha.wtf':
                        data_ipv4.push(captcha_faced_percentage);
                        break;
                }

            }

            labels.push(dateFormat(selected_date));
        }


        let result = {
            "message": "success",
            "result": {
                "labels": labels,
                "data": {
                    "IPv4": data_ipv4,
                    "IPv6": data_ipv6,
                }
            }
        }

        res.json(result)
    });

    dbHandle.close(db);

});

module.exports = router;
