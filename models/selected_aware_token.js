

var mongoose = require('mongoose');

const selectReceiverSchema = new mongoose.Schema({
    _awareid: { type: String, required: false, default: null },
    send_aware_token_id: { type: String, required: false, default: null },
    aware_token_type: { type: String, required: false, default: null },
    selected_tokens: [{
        asset_id: { type: String, required: false, default: null },

        update_asset_id: { type: String, required: false, default: null },
        main_color: { type: String, required: false, default: null },
        color: { type: String, required: false},
        in_wallet: { type: String, required: false, default: null },
        To_be_Send: { type: String, required: false, default: null },
        balance: { type: String, required: false, default: null },
        aware_token_id: { type: String, required: false, default: null },
        update_aware_token_id: { type: String, required: false, default: null },
        temp_lock: { type: Boolean, required: false, default: null },
    }],
    po_id: { type: String, required: false, default: null },
    created_date: { type: Date, required: false, default: Date.now },
    modified_on: { type: Date, required: false, default: Date.now },
});
module.exports = mongoose.model('selected_aware_token', selectReceiverSchema);
