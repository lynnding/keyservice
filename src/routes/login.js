/*================================================================
LOGIN:
Generate the generic or unique login page based on the URL params
================================================================*/
var express = require('express');
var router = express.Router();
var devAccount = require("../config.js").devAccount;
var serverHostname = require("../config.js").appServer.vhost;
var Account = require("../bin/models/account");
var Customization = require("../bin/models/customization");

/*================================================================
FUNCTION
================================================================*/
function getAccount(req, res, next) {
    // retrieve the account in the DB based on the req params 
    Account
        .findById(req.params.account_id)
        .populate("config")
        .populate("ldapAd")
        .exec(function (err, account) {
            if (err) res.render('error', { error: { message: err } });
            else if (account) {
                // store the usefull data in the user session
                req.session.account = JSON.parse(JSON.stringify(account));
                req.session.xapi = {
                    vpcUrl: account.vpcUrl,
                    accessToken: account.accessToken,
                    ownerId: account.ownerId
                };
                req.session.uurl = account._id;
                req.session.groupId = account.config.userGroupId;
                req.session.groups = account.ldapAd.groups;
                // update the user session
                req.session.save(function (err) {
                    next();
                })
            } else res.redirect("/login/");
        })
}

/*================================================================
ROUTES
================================================================*/
// when the user load the unique login page
router.get("/login/:account_id/", getAccount, function (req, res) {
    // determine the authenticaiton method (Azure / ADFS) and generate the corresponding login link
    var method = "";
    var guest = "";
    method = "/"+req.session.account.authMethod+"/" + req.params.account_id + "/login";
    guest =  "/api/" + req.params.account_id ;
     
    res.render("login", {
        title: 'Get a Key!',
        oauthUrl: "https://cloud.aerohive.com/thirdpartylogin?client_id=" + devAccount.clientID + "&redirect_uri=" + devAccount.redirectUrl,
        method: method,
        guest : guest,
        url: req.query.url,
        auth: req.session.account.authMethod,
        groups: req.session.groups,
        custom: req.custom
    });
    
    //console.info("\x1b[32minfo\x1b[0m:", 'Session QUERY ', req);
})

// just to be sure. Should never be called...
router.get("/login/:account_id/callback", function (req, res) {
    res.render('error', { error: { message: "It seems the callback URL is misconfigured on your AzureAD or ADFS. Please be sure to use the callback url from the configuration interface." } });
})
// When the generic login page is called
router.get("/login", function (req, res) {
    res.render("login", {
        title: 'Get a Key!',
        oauthUrl: "https://cloud.aerohive.com/thirdpartylogin?client_id=" + devAccount.clientID + "&redirect_uri=" + devAccount.redirectUrl,
        method: null
    });
})
// When the logout URL is called
router.get("/logout/", function (req, res) {
    // if the account is configured with AzureAD, redirect the user to azure logout URL
    if (req.session.account.authMethod == 'aad') {
        res.redirect("https://login.windows.net/" + req.session.account.azureAd.tenant + "/oauth2/logout?post_logout_redirect_uri=https://" + serverHostname + "/login/" + req.session.account._id + "/");
        req.logout();
        req.session.destroy();
    } else if (req.session.account.authMethod == 'ldap') {
            console.info("\x1b[32minfo\x1b[0m:", 'Session ID ', req.session.account._id);
            var redirecturi = "/login/" + req.session.account._id + "/";
            req.logout();
            req.session.destroy(); 
            res.redirect(redirecturi);
    } else {
        req.logout();
        req.session.destroy();
        res.redirect("/");
    }
})

module.exports = router;
