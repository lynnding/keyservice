/*================================================================
LDAPAD:
deals with LdapAD authentication 
Depending on the configuration, it will user Ldap API to get user/groups informations or not
================================================================*/
const LdapStrategy = require('passport-ldapauth');
const Account = require("../bin/models/account");
const https = require('https');
/*================================================================
PASSPORT
================================================================*/
passport.serializeUser(function (user, done) {
    done(null, user);
});
passport.deserializeUser(function (user, done) {
    done(null, user);
});

/*================================================================
FUNCTIONS
================================================================*/

//function to generate the LdapAD authentication error page
function renderError(error, user, req, res) {
    let message;
    if (error == "external")
        message = "User " + user + " is not allowed to access to this network because the account is an external account";
    else if (error == "memberOf")
        message = "User " + user + " does not belong to the required user groups";
    else if (error == "license")
        message = "User " + user + " does not any license to use this app";
    else if (error == "permissions")
        message = "Unable to retrieve memberOf information for user " + user + ". Please check the application permission in your Ldap portal.";
    console.error("\x1b[31mERROR\x1b[0m:", message);
    res.status(401).render("error_ldapAd", {
        exeption: error,
        user: user
    });
}
/*================================================================
MODULE
================================================================*/
module.exports = function (req, res, next) {
    // if Ldap OAuth returns an error message
    if (req.query.error) {
        console.error("\x1b[31mERROR\x1b[0m:", "LdapAD error: " + req.query.error);
        if (req.query.error_description) console.error("\x1b[31mERROR\x1b[0m:", "LdapAD message: " + req.query.error_description.replace(/\+/g, " "));
        res.render('error', {
            status: req.query.error,
            message: req.query.error_description.replace(/\+/g, " ")
        });
    } else
        // retrieve the configuration from DB
        Account
            .findById(req.params.account_id)
            .populate("ldapAd")
            .exec(function (err, account) {
                 
                if (err) res.status(500).json({ error: err });
                else if (!account) res.status(500).json({ error: "unknown error" });
                else {
                        var opts = {
                            server: {
                            url: account.ldapAd.url,
                            bindDn: 'cn='+account.ldapAd.username+',' +account.ldapAd.baseDN,
                            bindCredentials: account.ldapAd.password,
                            searchBase: account.ldapAd.baseDN,
                            searchFilter: '(&(department='+ JSON.parse(req.body.department).group +')(|(uid={{username}})(cn={{username}})))'
                            //searchFilter: '(&(department='+ req.body.department +')(|(uid={{username}})(cn={{username}})))'
                            }
                        };
 
                    //console.error("\x1b[31mERROR\x1b[0m:", "VAR ", JSON.parse(req.body.department).group, opts);
                    req.session.groupId = JSON.parse(req.body.department).userGroupId;
                    // Passport strategy to use for app authentication
                    passport.use(new LdapStrategy(
                        opts
                    ));
                    
                    next();
                }
            })
}
