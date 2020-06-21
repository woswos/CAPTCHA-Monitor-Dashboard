var express = require('express');
var router = express.Router();

router.get('/details', function(req, res, next) {
    res.redirect('/measurements');
});

router.get('/', function(req, res, next) {
    res.render('measurements_summary', {
        title: 'CAPTCHA Monitor | Measurements',
    });
});

router.get('/full', function(req, res, next) {
    res.render('measurements_full', {
        title: 'CAPTCHA Monitor | Measurements',
    });
});

router.get('/details/:id', function(req, res, next) {
    res.render('measurements_details', {
        title: 'CAPTCHA Monitor | Measurements',
        id: req.params.id
    });
});

module.exports = router;
