/*================================================================
WEB-APP:
just serve the web-app page
================================================================*/
var express = require('express');
var router = express.Router();
var Customization = require("../bin/models/customization");

/*================================================================
FUNCTION
================================================================*/
function getCustom(req, res, next) {
    if (!req.session.xapi || !req.session.passport) {
        res.redirect('/login/');
    } else if (req.session.account.customization)
        Customization
            .findById(req.session.account.customization)
            .exec(function (err, custom) {
                if (!err) req.custom = custom;
                next();
            })
    else next();
}
/*================================================================
ROUTES
================================================================*/
router.get('/', getCustom, function (req, res, next) {
    if (!req.session.xapi || !req.session.passport) 
        res.redirect('/login/');
    else 
        res.render('web-app', {
                    title: 'Get a Key!',
                    custom: req.custom
                    });
    
    });

module.exports = router;


