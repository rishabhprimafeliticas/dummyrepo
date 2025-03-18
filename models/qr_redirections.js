

var mongoose = require('mongoose');

const qr_redirectionsSchema = new mongoose.Schema({
    name: { type: String, required: true },
    item_number: { type: String, required: false },
    old_identifier: { type: String, required: false },
    old_po_id: { type: String, required: false },
    new_identifier: { type: String, required: false },
    new_po_id: { type: String, required: false },
});
module.exports = mongoose.model('qr_redirections', qr_redirectionsSchema);
