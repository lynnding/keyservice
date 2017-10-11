const mongoose = require('mongoose');

const LdapAdSchema = new mongoose.Schema({
    url: { type: String, required: true },
    baseDN: { type: String, required: true },
    username: { type: String, required: false },
    password: { type: String, required: false },
    groups: [],
    created_at: { type: Date },
    updated_at: { type: Date }
});

const LdapAd = mongoose.model('LdapAd', LdapAdSchema);


// Pre save
LdapAdSchema.pre('save', function (next) {
    const now = new Date();
    this.updated_at = now;
    if (!this.created_at) {
        this.created_at = now;
    }
    next();
});

module.exports = LdapAd;

