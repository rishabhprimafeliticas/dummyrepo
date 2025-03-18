

var mongoose = require('mongoose');

const AccountAvailabilitySchema = new mongoose.Schema({
    email: { type: String, default: null },
    hash: { type: String, default: null }
});
module.exports = mongoose.model('account_availability', AccountAvailabilitySchema);
