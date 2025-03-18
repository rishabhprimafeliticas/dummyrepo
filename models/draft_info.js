

var mongoose = require('mongoose');

const DraftAwTokensSchema = new mongoose.Schema({
    _awareid: { type: String, required: false, default: null },
    status: { type: String, required: false, default: null },
    aware_output_token_type: { type: String, required: true },
    date: { type: Date, required: true  },
    way_to_update_token: { type: String, required: false, default: null },
    production_facility: { type: String, required: true },
    value_chain_process_main: [
        {
            color: { type: String, required: false, default: null },
            name: { type: String, required: false, default: null },
        }
    ],
    value_chain_process_sub:[
        {
            color: { type: String, required: false, default: null },
            name: { type: String, required: false, default: null },
        }
    ],
    final_brand: { type: String, required: false, default: null },
    purchase_order: { type: String, required: false, default: null },
    order_lines_in_current_request: { type: Array, required: false, default: null },

    create_token_stepper: { type: Number, required: false, default: 1 },
    created_date: { type: Date, required: false ,default: Date.now},
    modified_on: { type: Date, required: false, default: Date.now },
});
module.exports = mongoose.model('draft_info', DraftAwTokensSchema);
