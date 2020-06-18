var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
    result = {
        "results": {
            "tbb_security_levels": {
                "labels": ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
                "data": {
                    "Low (Standard)": [0, 1, 2, 13, 4, 15, 13],
                    "Medium (Safer)": [10, 11, 12, 13, 14, 15, 13],
                    "High (Safest)": [10, 0, 12, 2, 14, 15, 3]
                }
            },
            "http_vs_https": {
                "labels": ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
                "data": {
                    "HTTP": [0, 1, 2, 13, 4, 15, 13],
                    "HTTPS": [10, 11, 12, 13, 14, 15, 13]
                }
            },
            "single_vs_multiple_http_reqs": {
                "labels": ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
                "data": {
                    "Single request": [0, 1, 2, 13, 4, 15, 13],
                    "Multiple requests": [10, 11, 12, 13, 14, 15, 13]
                }
            },
            "ip_versions": {
                "labels": ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
                "data": {
                    "IPv4": [0, 1, 2, 13, 4, 15, 13],
                    "IPv6": [10, 11, 12, 13, 14, 15, 13]
                }
            },
            "physical_location": {
                "labels": ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
                "data": {
                    "percentages": [0, 1, 2, 13, 4, 15, 13]
                }
            }
        }
    }
    res.json(result);
});

module.exports = router;
