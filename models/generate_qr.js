

var mongoose = require('mongoose');

const generate = new mongoose.Schema({
    _awareid: { type: String, required: true },
    po_id: { type: String, required: true },
    product_line: { type: String, required: true },
    qr_code: { type: String, required: false, default: null },
    generated: { type: Boolean, required: false },
    created_date: { type: Date, required: true, default: Date.now },
    modified_on: { type: Date, required: false, default: Date.now },
    deleted: { type: Boolean, required: false, default: false }
});
module.exports = mongoose.model('qr_codes', generate);
