/*================================================================
AZUREAD:
deals with ldap authentication for users
the req param "account_id" in the URL is used to identify the app account (so the Ldap configuration)
================================================================*/
var express = require('express');
var router = express.Router();
var getLdapAdAccount = require("../bin/ldapAd");

/*================================================================
 USER LDAP AUTH
 ================================================================*/

/* GET login page. Passport will redirect to Ldap authentication page */
router.post('/:account_id/login',getLdapAdAccount,
    passport.authenticate('ldapauth', { failureRedirect: '/login'}),
    function (req, res) {
        if (req.session.passport.user.email) req.session.email = req.session.passport.user.email;
        if (req.session.passport.user.mail) req.session.email = req.session.passport.user.mail;
        else req.session.email = req.session.passport.user.upn;
        console.info("\x1b[32minfo\x1b[0m:", 'User ' + req.session.email + ' logged in');
        res.redirect('/web-app/');
    }
);

/* Handle Logout */
router.get('/:account_id/logout', function (req, res) {
    console.log("\x1b[32minfo\x1b[0m:", "User " + req.session.email + " is now logged out.");
    req.logout();
    req.session.destroy();
    res.redirect('/login/:account_id/');
});

module.exports = router;
