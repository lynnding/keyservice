const mongoose = require('mongoose');
const AzureAd = require('./azureAd');
const LdapAd = require('./ldapAd');
const Config = require('./configuration');
const Customization = require('./customization');

const AccountSchema = new mongoose.Schema({
    ownerId: {type: String, required: true},
    accessToken: {type: String, required: true},
    refreshToken: {type: String, required: true},
    vpcUrl: {type: String, required: true},
    vhmId: {type: String, required: true},
    authMethod: {type: String, required: false},
    expireAt: { type: String, required: true },
    config: {type: mongoose.Schema.ObjectId, ref:"Config"},
    customization: {type: mongoose.Schema.ObjectId, ref:"Customization"},
    azureAd: {type: mongoose.Schema.ObjectId, ref:"AzureAd"},
    ldapAd: {type: mongoose.Schema.ObjectId, ref:"LdapAd"},
    created_at    : { type: Date },
    updated_at    : { type: Date }
});

const Account = mongoose.model('Account', AccountSchema);


// Pre save
AccountSchema.pre('save', function(next) {
    const now = new Date();
    this.updated_at = now;
    if ( !this.created_at ) {
        this.created_at = now;
    }
    next();
});

module.exports = Account;

