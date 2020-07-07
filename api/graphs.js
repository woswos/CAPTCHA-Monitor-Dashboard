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
    // var monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    //     'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    // ];
    //
    // var date = new Date(date)
    // date.setDate(date.getDate())
    // date = monthNames[date.getMonth()] + ',' + date.getDate() + ' ' + date.getFullYear()
    return date.toISOString().split('T')[0]
}

function classify(rows, attribute, classes, max_days_prior = 5) {

    let today = new Date();
    let labels = [];
    let data_bins = []

    // Create the data bins for each class
    for (let i = 0; i < classes.length; i++) {
        data_bins[classes[i]] = []
    }

    // Iterate for classifying data for each wanted day
    for (let m = max_days_prior; m > 0; m--) {
        let selected_date = new Date();
        selected_date.setDate(selected_date.getDate() - m);
        //console.log('looking for m days back', m)

        // Iterate for classifying data for each data bin
        for (let s = 0; s < classes.length; s++) {
            let total_count = 0;
            let captcha_faced_count = 0;
            let captcha_faced_percentage = 0;
            let date;

            // Find the ones that match the day and data bin
            for (let i = 0; i < rows.length; i++) {
                date = new Date(Date.parse(rows[i].timestamp));

                // Compare the days between today and the given date
                if (daysBetween(date, today) == m) {
                    selected_date = date

                    // Find the ones that match the data bin
                    if (rows[i][attribute] == classes[s]) {

                        //console.log('selected_date: ', selected_date, '->', rows[i][attribute], '-> count: ', rows[i].count, '-> CAPTCHA?: ', rows[i].is_captcha_found)

                        total_count += rows[i].count;

                        if (rows[i].is_captcha_found == '1') {
                            captcha_faced_count += rows[i].count;
                        }

                    }

                }
            }

            captcha_faced_percentage = ((captcha_faced_count / total_count) * 100).toFixed(2)

            // Populate the data bins
            data_bins[classes[s]].push(captcha_faced_percentage);

        }

        labels.push(dateFormat(selected_date));
    }

    return {
        data_bins: data_bins,
        labels: labels
    };
}


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

        let tbb_security_levels = ['low', 'medium', 'high'];
        let classified = classify(rows, 'tbb_security_level', tbb_security_levels)

        let result = {
            "message": "success",
            "results": {
                "labels": classified.labels,
                "data": {
                    "Low (Standard)": classified.data_bins.low,
                    "Medium (Safer)": classified.data_bins.medium,
                    "High (Safest)": classified.data_bins.high
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
    SELECT results.timestamp, results.url, results.is_captcha_found, urls.is_https, urls.supports_ipv4, urls.supports_ipv6, count(*) AS 'count'
    FROM results
    INNER JOIN urls on results.url = urls.url
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

        https_map = {
            1: 'https',
            0: 'http'
        };

        for (let i = 0; i < rows.length; i++) {
            rows[i].http_status = https_map[rows[i].is_https]
        }

        let websites = ['https', 'http'];
        let classified = classify(rows, 'http_status', websites)

        let result = {
            "message": "success",
            "results": {
                "labels": classified.labels,
                "data": {

                    "HTTP": classified.data_bins.http,
                    "HTTPS": classified.data_bins.https,
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

        let single_list = [
            'http://captcha.wtf',
            'https://captcha.wtf',
            'http://exit11.online',
            'https://exit11.online'
        ]

        for (let i = 0; i < rows.length; i++) {
            if (single_list.indexOf(rows[i].url) >= 0) {
                rows[i].http_req_status = 'single'
            } else {
                rows[i].http_req_status = 'multiple'
            }

        }

        let websites = ['single', 'multiple'];
        let classified = classify(rows, 'http_req_status', websites)

        let result = {
            "message": "success",
            "results": {
                "labels": classified.labels,
                "data": {
                    "Single request": classified.data_bins.single,
                    "Multiple requests": classified.data_bins.multiple,
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
    SELECT results.timestamp, results.url, results.is_captcha_found, urls.is_https, urls.supports_ipv4, urls.supports_ipv6, count(*) AS 'count'
    FROM results
    INNER JOIN urls on results.url = urls.url
    GROUP BY is_captcha_found, (strftime('%s', timestamp) / (6 * 60 * 60 * 4))
    ORDER BY timestamp
    LIMIT 50
    `;

    let params = []
    db.all(sql, params, (err, rows) => {
        if (err) {
            res.st
            atus(400).json({
                "error": err.message
            });
            return;
        }

        for (let i = 0; i < rows.length; i++) {
            if (rows[i].supports_ipv6 == '1') {
                rows[i].ip_version = 'ipv6'
            } else {
                rows[i].ip_version = 'ipv4'
            }

        }

        let ip_versions = ['ipv4', 'ipv6'];
        let classified = classify(rows, 'ip_version', ip_versions)

        let result = {
            "message": "success",
            "results": {
                "labels": classified.labels,
                "data": {
                    "IPv4": classified.data_bins.ipv4,
                    "IPv6": classified.data_bins.ipv6,
                }
            }
        }

        res.json(result)
    });

    dbHandle.close(db);

});

module.exports
= router;
