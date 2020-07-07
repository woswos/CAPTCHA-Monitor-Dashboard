var express = require('express');
var router = express.Router();
var dbHandle = require('../utils/db_connector.js');

let sql_get_groupped_urls_by_is_captcha_found = `
SELECT results.timestamp, results.url, results.is_captcha_found, urls.is_https, urls.supports_ipv4, urls.supports_ipv6, count(*) AS 'count'
FROM results
INNER JOIN urls on results.url = urls.url
GROUP BY results.is_captcha_found, results.url, (strftime('%s', timestamp) / (6 * 60 * 60 * 4))
ORDER BY timestamp DESC
LIMIT 500
`;

router.get('/is_captcha_found/tbb_security_levels', function(req, res, next) {

    let db = dbHandle.connect();

    let sql = `
    SELECT timestamp, tbb_security_level, is_captcha_found, count(*) AS 'count'
    FROM results
    WHERE results.method = 'tor_browser'
    GROUP BY tbb_security_level, is_captcha_found, (strftime('%s', timestamp) / (6 * 60 * 60 * 4))
    ORDER BY timestamp DESC
    LIMIT 500
    `;

    let params = []
    db.all(sql, params, (err, rows) => {
        if (err) {
            res.status(400).json({
                "error": err.message
            });
            return;
        }

        let classified = classify_by_date(rows, 'tbb_security_level')

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

router.get('/is_captcha_found/tbb_versions', function(req, res, next) {

    let db = dbHandle.connect();

    let sql = `
    SELECT results.timestamp, results.browser_version, results.is_captcha_found, count(*) AS 'count'
    FROM results
    WHERE results.method = 'tor_browser'
    GROUP BY results.is_captcha_found, results.browser_version, (strftime('%s', timestamp) / (6 * 60 * 60 * 4))
    ORDER BY timestamp DESC
    LIMIT 500
    `;

    let params = []
    db.all(sql, params, (err, rows) => {
        if (err) {
            res.status(400).json({
                "error": err.message
            });
            return;
        }

        let classified = classify_by_date(rows, 'browser_version')

        let data = {}
        for (let key in classified.data_bins) {
            data[key] = classified.data_bins[key];
        }

        let result = {
            "message": "success",
            "results": {
                "labels": classified.labels,
                "data": data
            }
        }

        res.json(result)
    });

    dbHandle.close(db);
});

router.get('/is_captcha_found/country', function(req, res, next) {

    let db = dbHandle.connect();

    let sql = `
    SELECT results.is_captcha_found, results.exit_node, relays.country, count(*) AS 'count'
    FROM results
    INNER JOIN relays on results.exit_node = relays.address
    WHERE results.is_captcha_found = '1'
    GROUP BY results.is_captcha_found, relays.country, relays.address
    LIMIT 1000
    `;

    let params = []
    db.all(sql, params, (err, rows) => {
        if (err) {
            res.status(400).json({
                "error": err.message
            });
            return;
        }

        let classified = classify_for_pie_chart(rows, 'country')

        let data = {};
        let total = 0;
        for (let key in classified.data_bins) {
            data[key] = classified.data_bins[key];
            total += classified.data_bins[key]
        }

        for (let key in data) {
            data[key] = ((data[key] / total) * 100).toFixed(2);
        }


        let converted_labels = [];
        for (let i = 0; i < classified.labels.length; i++) {
            converted_labels.push(isoCountries[classified.labels[i]])
        }

        let result = {
            "message": "success",
            "results": {
                "labels": converted_labels,
                "data": data
            }
        }

        res.json(result)
    });

    dbHandle.close(db);
});

router.get('/is_captcha_found/continent', function(req, res, next) {

    let db = dbHandle.connect();

    let sql = `
    SELECT results.is_captcha_found, results.exit_node, relays.continent, count(*) AS 'count'
    FROM results
    INNER JOIN relays on results.exit_node = relays.address
    WHERE results.is_captcha_found = '1'
    GROUP BY results.is_captcha_found, relays.continent, relays.address
    LIMIT 1000
    `;

    let params = []
    db.all(sql, params, (err, rows) => {
        if (err) {
            res.status(400).json({
                "error": err.message
            });
            return;
        }

        let classified = classify_for_pie_chart(rows, 'continent')

        let data = {};
        let total = 0;
        for (let key in classified.data_bins) {
            data[key] = classified.data_bins[key];
            total += classified.data_bins[key]
        }

        for (let key in data) {
            data[key] = ((data[key] / total) * 100).toFixed(2);
        }

        let result = {
            "message": "success",
            "results": {
                "labels": classified.labels,
                "data": data
            }
        }

        res.json(result)
    });

    dbHandle.close(db);
});

router.get('/is_captcha_found/web_browser_type', function(req, res, next) {

    let db = dbHandle.connect();

    let sql = `
    SELECT results.timestamp, results.method, results.is_captcha_found, count(*) AS 'count'
    FROM results
    GROUP BY results.is_captcha_found, results.method, (strftime('%s', timestamp) / (6 * 60 * 60 * 4))
    ORDER BY timestamp DESC
    LIMIT 500
    `;

    let params = []
    db.all(sql, params, (err, rows) => {
        if (err) {
            res.status(400).json({
                "error": err.message
            });
            return;
        }

        let classified = classify_by_date(rows, 'method')

        let data = {}
        for (let key in classified.data_bins) {
            data[sentenceCase(key.split('_').join(' '))] = classified.data_bins[key];
        }

        let result = {
            "message": "success",
            "results": {
                "labels": classified.labels,
                "data": data
            }
        }

        res.json(result)
    });

    dbHandle.close(db);
});

router.get('/is_captcha_found/http_vs_https', function(req, res, next) {

    let db = dbHandle.connect();

    let sql = sql_get_groupped_urls_by_is_captcha_found;

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

        let classified = classify_by_date(rows, 'http_status')

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

router.get('/is_captcha_found/single_vs_multiple_http_reqs', function(req, res, next) {

    let db = dbHandle.connect();

    let sql = sql_get_groupped_urls_by_is_captcha_found;

    let params = []
    db.all(sql, params, (err, rows) => {
        if (err) {
            res.status(400).json({
                "error": err.message
            });
            return;
        }

        let single_list = ['http://captcha.wtf',

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

        let classified = classify_by_date(rows, 'http_req_status')

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

router.get('/is_captcha_found/ip_versions', function(req, res, next) {

    let db = dbHandle.connect();

    let sql = sql_get_groupped_urls_by_is_captcha_found;

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

        let classified = classify_by_date(rows, 'ip_version')

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

function sentenceCase(str) {
    if ((str === null) || (str === ''))
        return false;
    else
        str = str.toString();

    return str.replace(/\w\S*/g, function(txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}

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

function classify_by_date(rows, attribute, max_days_prior = 5) {

    let today = new Date();
    let labels = [];
    let data_bins = {};

    // Figure out the classes by finding the unique values
    for (let i = 0; i < rows.length; i++) {
        data_bins[rows[i][attribute]] = []
    }

    // Iterate for classifying data for each wanted day
    for (let m = max_days_prior; m > 0; m--) {
        let selected_date = new Date();
        selected_date.setDate(selected_date.getDate() - m);
        //console.log('looking for m days back', m)

        // Iterate for classifying data for each data bin
        for (let data_bins_key in data_bins) {

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
                    if (rows[i][attribute] == data_bins_key) {

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
            data_bins[data_bins_key].push(captcha_faced_percentage);

        }

        labels.push(dateFormat(selected_date));
    }

    return {
        data_bins: data_bins,
        labels: labels
    };
}

function classify_for_pie_chart(rows, attribute) {

    let labels = [];
    let res = [];
    let data_bins = {};

    // Figure out the classes by finding the unique values
    for (let i = 0; i < rows.length; i++) {
        data_bins[rows[i][attribute]] = []
    }

    // Iterate for classifying data for each data bin
    let key_id = 0;

    for (let data_bins_key in data_bins) {

        let total_count = 0;
        let captcha_faced_count = 0;
        let captcha_faced_percentage = 0;

        for (let i = 0; i < rows.length; i++) {
            // Find the ones that match the data bin
            if (rows[i][attribute] == data_bins_key) {

                total_count += rows[i].count;

                if (rows[i].is_captcha_found == '1') {
                    captcha_faced_count += rows[i].count;
                }

            }
        }

        captcha_faced_percentage = ((captcha_faced_count / total_count) * 100).toFixed(2)

        // Populate the data bins
        //data_bins[data_bins_key].push(captcha_faced_percentage);
        //data_bins[data_bins_key][key_id] = captcha_faced_count;

        res.push(captcha_faced_count);

        labels.push(data_bins_key);

        key_id = key_id + 1
    }

    return {
        data_bins: res,
        labels: labels
    }
}

var isoCountries = {
    'AF' : 'Afghanistan',
    'AX' : 'Aland Islands',
    'AL' : 'Albania',
    'DZ' : 'Algeria',
    'AS' : 'American Samoa',
    'AD' : 'Andorra',
    'AO' : 'Angola',
    'AI' : 'Anguilla',
    'AQ' : 'Antarctica',
    'AG' : 'Antigua And Barbuda',
    'AR' : 'Argentina',
    'AM' : 'Armenia',
    'AW' : 'Aruba',
    'AU' : 'Australia',
    'AT' : 'Austria',
    'AZ' : 'Azerbaijan',
    'BS' : 'Bahamas',
    'BH' : 'Bahrain',
    'BD' : 'Bangladesh',
    'BB' : 'Barbados',
    'BY' : 'Belarus',
    'BE' : 'Belgium',
    'BZ' : 'Belize',
    'BJ' : 'Benin',
    'BM' : 'Bermuda',
    'BT' : 'Bhutan',
    'BO' : 'Bolivia',
    'BA' : 'Bosnia And Herzegovina',
    'BW' : 'Botswana',
    'BV' : 'Bouvet Island',
    'BR' : 'Brazil',
    'IO' : 'British Indian Ocean Territory',
    'BN' : 'Brunei Darussalam',
    'BG' : 'Bulgaria',
    'BF' : 'Burkina Faso',
    'BI' : 'Burundi',
    'KH' : 'Cambodia',
    'CM' : 'Cameroon',
    'CA' : 'Canada',
    'CV' : 'Cape Verde',
    'KY' : 'Cayman Islands',
    'CF' : 'Central African Republic',
    'TD' : 'Chad',
    'CL' : 'Chile',
    'CN' : 'China',
    'CX' : 'Christmas Island',
    'CC' : 'Cocos (Keeling) Islands',
    'CO' : 'Colombia',
    'KM' : 'Comoros',
    'CG' : 'Congo',
    'CD' : 'Congo, Democratic Republic',
    'CK' : 'Cook Islands',
    'CR' : 'Costa Rica',
    'CI' : 'Cote D\'Ivoire',
    'HR' : 'Croatia',
    'CU' : 'Cuba',
    'CY' : 'Cyprus',
    'CZ' : 'Czech Republic',
    'DK' : 'Denmark',
    'DJ' : 'Djibouti',
    'DM' : 'Dominica',
    'DO' : 'Dominican Republic',
    'EC' : 'Ecuador',
    'EG' : 'Egypt',
    'SV' : 'El Salvador',
    'GQ' : 'Equatorial Guinea',
    'ER' : 'Eritrea',
    'EE' : 'Estonia',
    'ET' : 'Ethiopia',
    'FK' : 'Falkland Islands (Malvinas)',
    'FO' : 'Faroe Islands',
    'FJ' : 'Fiji',
    'FI' : 'Finland',
    'FR' : 'France',
    'GF' : 'French Guiana',
    'PF' : 'French Polynesia',
    'TF' : 'French Southern Territories',
    'GA' : 'Gabon',
    'GM' : 'Gambia',
    'GE' : 'Georgia',
    'DE' : 'Germany',
    'GH' : 'Ghana',
    'GI' : 'Gibraltar',
    'GR' : 'Greece',
    'GL' : 'Greenland',
    'GD' : 'Grenada',
    'GP' : 'Guadeloupe',
    'GU' : 'Guam',
    'GT' : 'Guatemala',
    'GG' : 'Guernsey',
    'GN' : 'Guinea',
    'GW' : 'Guinea-Bissau',
    'GY' : 'Guyana',
    'HT' : 'Haiti',
    'HM' : 'Heard Island & Mcdonald Islands',
    'VA' : 'Holy See (Vatican City State)',
    'HN' : 'Honduras',
    'HK' : 'Hong Kong',
    'HU' : 'Hungary',
    'IS' : 'Iceland',
    'IN' : 'India',
    'ID' : 'Indonesia',
    'IR' : 'Iran, Islamic Republic Of',
    'IQ' : 'Iraq',
    'IE' : 'Ireland',
    'IM' : 'Isle Of Man',
    'IL' : 'Israel',
    'IT' : 'Italy',
    'JM' : 'Jamaica',
    'JP' : 'Japan',
    'JE' : 'Jersey',
    'JO' : 'Jordan',
    'KZ' : 'Kazakhstan',
    'KE' : 'Kenya',
    'KI' : 'Kiribati',
    'KR' : 'Korea',
    'KW' : 'Kuwait',
    'KG' : 'Kyrgyzstan',
    'LA' : 'Lao People\'s Democratic Republic',
    'LV' : 'Latvia',
    'LB' : 'Lebanon',
    'LS' : 'Lesotho',
    'LR' : 'Liberia',
    'LY' : 'Libyan Arab Jamahiriya',
    'LI' : 'Liechtenstein',
    'LT' : 'Lithuania',
    'LU' : 'Luxembourg',
    'MO' : 'Macao',
    'MK' : 'Macedonia',
    'MG' : 'Madagascar',
    'MW' : 'Malawi',
    'MY' : 'Malaysia',
    'MV' : 'Maldives',
    'ML' : 'Mali',
    'MT' : 'Malta',
    'MH' : 'Marshall Islands',
    'MQ' : 'Martinique',
    'MR' : 'Mauritania',
    'MU' : 'Mauritius',
    'YT' : 'Mayotte',
    'MX' : 'Mexico',
    'FM' : 'Micronesia, Federated States Of',
    'MD' : 'Moldova',
    'MC' : 'Monaco',
    'MN' : 'Mongolia',
    'ME' : 'Montenegro',
    'MS' : 'Montserrat',
    'MA' : 'Morocco',
    'MZ' : 'Mozambique',
    'MM' : 'Myanmar',
    'NA' : 'Namibia',
    'NR' : 'Nauru',
    'NP' : 'Nepal',
    'NL' : 'Netherlands',
    'AN' : 'Netherlands Antilles',
    'NC' : 'New Caledonia',
    'NZ' : 'New Zealand',
    'NI' : 'Nicaragua',
    'NE' : 'Niger',
    'NG' : 'Nigeria',
    'NU' : 'Niue',
    'NF' : 'Norfolk Island',
    'MP' : 'Northern Mariana Islands',
    'NO' : 'Norway',
    'OM' : 'Oman',
    'PK' : 'Pakistan',
    'PW' : 'Palau',
    'PS' : 'Palestinian Territory, Occupied',
    'PA' : 'Panama',
    'PG' : 'Papua New Guinea',
    'PY' : 'Paraguay',
    'PE' : 'Peru',
    'PH' : 'Philippines',
    'PN' : 'Pitcairn',
    'PL' : 'Poland',
    'PT' : 'Portugal',
    'PR' : 'Puerto Rico',
    'QA' : 'Qatar',
    'RE' : 'Reunion',
    'RO' : 'Romania',
    'RU' : 'Russian Federation',
    'RW' : 'Rwanda',
    'BL' : 'Saint Barthelemy',
    'SH' : 'Saint Helena',
    'KN' : 'Saint Kitts And Nevis',
    'LC' : 'Saint Lucia',
    'MF' : 'Saint Martin',
    'PM' : 'Saint Pierre And Miquelon',
    'VC' : 'Saint Vincent And Grenadines',
    'WS' : 'Samoa',
    'SM' : 'San Marino',
    'ST' : 'Sao Tome And Principe',
    'SA' : 'Saudi Arabia',
    'SN' : 'Senegal',
    'RS' : 'Serbia',
    'SC' : 'Seychelles',
    'SL' : 'Sierra Leone',
    'SG' : 'Singapore',
    'SK' : 'Slovakia',
    'SI' : 'Slovenia',
    'SB' : 'Solomon Islands',
    'SO' : 'Somalia',
    'ZA' : 'South Africa',
    'GS' : 'South Georgia And Sandwich Isl.',
    'ES' : 'Spain',
    'LK' : 'Sri Lanka',
    'SD' : 'Sudan',
    'SR' : 'Suriname',
    'SJ' : 'Svalbard And Jan Mayen',
    'SZ' : 'Swaziland',
    'SE' : 'Sweden',
    'CH' : 'Switzerland',
    'SY' : 'Syrian Arab Republic',
    'TW' : 'Taiwan',
    'TJ' : 'Tajikistan',
    'TZ' : 'Tanzania',
    'TH' : 'Thailand',
    'TL' : 'Timor-Leste',
    'TG' : 'Togo',
    'TK' : 'Tokelau',
    'TO' : 'Tonga',
    'TT' : 'Trinidad And Tobago',
    'TN' : 'Tunisia',
    'TR' : 'Turkey',
    'TM' : 'Turkmenistan',
    'TC' : 'Turks And Caicos Islands',
    'TV' : 'Tuvalu',
    'UG' : 'Uganda',
    'UA' : 'Ukraine',
    'AE' : 'United Arab Emirates',
    'GB' : 'United Kingdom',
    'US' : 'United States',
    'UM' : 'United States Outlying Islands',
    'UY' : 'Uruguay',
    'UZ' : 'Uzbekistan',
    'VU' : 'Vanuatu',
    'VE' : 'Venezuela',
    'VN' : 'Viet Nam',
    'VG' : 'Virgin Islands, British',
    'VI' : 'Virgin Islands, U.S.',
    'WF' : 'Wallis And Futuna',
    'EH' : 'Western Sahara',
    'YE' : 'Yemen',
    'ZM' : 'Zambia',
    'ZW' : 'Zimbabwe'
};

module.exports = router;
