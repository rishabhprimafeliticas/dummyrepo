

var mongoose = require('mongoose');

const transferredTokensSchema = new mongoose.Schema({
    _awareid: { type: String, required: false, default: null },
    
    type_of_token: { type: String, required: false, default: null },
    total_tokens: { type: Number, required: false, default: 0 },
    used_tokens: { type: Number, required: false, default: 0 },
    locked_tokens: { type: Number, required: false, default: 0 },
    avaliable_tokens: { type: Number, required: false, default: 0 },
    locked: { type: Boolean, required: false, default: false },
    blockchain_id: { type: String, required: false, default: null  },

    token_base_type: { type: String, required: false, default: null },
    historical_awareid: { type: String, required: false, default: null },

    historical_aware_token_id: { type: mongoose.Schema.Types.ObjectId, required: false, default: null },
    historical_physical_assets_id: { type: mongoose.Schema.Types.ObjectId, required: false, default: null },
    historical_tracers_id: { type: mongoose.Schema.Types.ObjectId, required: false, default: null },
    historical_company_compliances_id: { type: mongoose.Schema.Types.ObjectId, required: false, default: null },
    historical_self_validations_id: { type: mongoose.Schema.Types.ObjectId, required: false, default: null },

    historical_update_aware_token_id: { type: mongoose.Schema.Types.ObjectId, required: false, default: null },
    historical_selected_update_aware_token_id: { type: mongoose.Schema.Types.ObjectId, required: false, default: null },
    historical_update_physical_assets_id: { type: mongoose.Schema.Types.ObjectId, required: false, default: null },
    historical_update_tracers_id: { type: mongoose.Schema.Types.ObjectId, required: false, default: null },
    historical_update_company_compliances_id: { type: mongoose.Schema.Types.ObjectId, required: false, default: null },
    historical_update_self_validations_id: { type: mongoose.Schema.Types.ObjectId, required: false, default: null },
    
    historical_send_aw_tokens_id: { type: String, required: false, default: null },
    historical_selected_receivers_id: { type: mongoose.Schema.Types.ObjectId, required: false, default: null },
    historical_selected_aware_tokens_id: { type: mongoose.Schema.Types.ObjectId, required: false, default: null },
    historical_selected_transaction_certificates_id: { type: mongoose.Schema.Types.ObjectId, required: false, default: null },
    historical_selected_proof_of_deliveries_id: { type: mongoose.Schema.Types.ObjectId, required: false, default: null },
    blochchain_transaction_history_id: { type: mongoose.Schema.Types.ObjectId, required: false, default: null },
    linked_transaction_history_id: { type: mongoose.Schema.Types.ObjectId, required: false, default: null },
    created_date: { type: Date, required: false,default: Date.now },
    modified_on: { type: Date, required: false, default: Date.now },
});
module.exports = mongoose.model('transferred_tokens', transferredTokensSchema);
