

var mongoose = require('mongoose');

const selectedUpdateAwareTokenSchema = new mongoose.Schema({
    _awareid: { type: String, required: true },
    update_aware_token_id: { type: String, required: false },
    draft_id: { type: String, required: false },

    aware_output_token_type: { type: String, required: true },
    date: { type: Date, required: true },
    way_to_update_token: { type: String, required: false, default: null },
    production_facility: { type: String, required: true },
    value_chain_process_main: [{
        color: { type: String, required: false, default: null },
        name: { type: String, required: false, default: null },
    }],
    value_chain_process_sub: [{
        color: { type: String, required: false, default: null },
        name: { type: String, required: false, default: null },
    }],
    created_date: { type: Date, required: false, default: Date.now },
    modified_on: { type: Date, required: false, default: Date.now },
});
module.exports = mongoose.model('selected_update_aware_token', selectedUpdateAwareTokenSchema);
