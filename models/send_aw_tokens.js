

var mongoose = require('mongoose');

const AwTokensSchema = new mongoose.Schema({
    _awareid: { type: String, required: true },
    aware_token_id: { type: Array, required: false, default: null },
    status: { type: String, required: true },
    create_token_stepper: { type: Number, required: true, default: 1 },
    created_date: { type: Date, required: false,default: Date.now },
    modified_on: { type: Date, required: false, default: Date.now },
    hide: { type: Boolean, required: false}
});
module.exports = mongoose.model('send_aw_tokens', AwTokensSchema);
