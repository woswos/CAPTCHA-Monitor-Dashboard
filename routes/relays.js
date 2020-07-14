var express = require('express');
var router = express.Router();

router.get('/details', function(req, res, next) {
    res.redirect('/relays');
});

router.get('/', function(req, res, next) {
    res.render('relays_summary', {
        title: 'CAPTCHA Monitor | Relays'
    });
});

router.get('/details/:fingerprint', function(req, res, next) {
    res.render('relays_details', {
        title: 'CAPTCHA Monitor | Relays',
        fingerprint: req.params.fingerprint
    });
});

module.exports = router;
