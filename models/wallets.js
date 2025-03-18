

var mongoose = require('mongoose');

const walletsSchema = new mongoose.Schema({
    _awareid: { type: String, default: null },
    wallet_address_0x: { type: String, default: null },
    wallet_address_io: { type: String, default: null },
    private_key: { type: String, default: null },
    from: { type: String, default: null },
    to: { type: String, default: null },
    from_i: { type: String, default: null },
    to_i: { type: String, default: null },
    created_date: { type: Date, required: true, default: Date.now },
    modified_on: { type: Date, required: true, default: Date.now },
});
module.exports = mongoose.model('wallets', walletsSchema);
