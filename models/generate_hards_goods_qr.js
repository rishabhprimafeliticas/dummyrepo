

var mongoose = require('mongoose');

const generate_hard_good_qr = new mongoose.Schema({
    _awareid: { type: String, required: false },
    po_id: { type: String, required: false },
    hard_goods_id: { type: String, required: false },
    hard_good_qr: { type: String, required: false, default: null },
    generated: { type: Boolean, required: false },
    created_date: { type: Date, required: false, default: Date.now },
    modified_on: { type: Date, required: false, default: Date.now },
    deleted: { type: Boolean, required: false, default: false }
});
module.exports = mongoose.model('generate_hard_good_qr', generate_hard_good_qr);
