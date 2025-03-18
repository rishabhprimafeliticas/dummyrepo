

var mongoose = require('mongoose');

const selectReceiverSchema = new mongoose.Schema({
    _awareid: { type: String, required: true },
    _receiver_awareid: { type: String, required: true },
    send_aware_token_id: { type: String, required: true },
    date: { type: Date, required: false, default: null },
    created_date: { type: Date, required: false, default: Date.now },
    modified_on: { type: Date, required: false, default: Date.now },
});
module.exports = mongoose.model('selected_receiver', selectReceiverSchema);
