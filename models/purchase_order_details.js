

var mongoose = require('mongoose');

const purchaseOrderDetailsSchema = new mongoose.Schema({
    _awareid: { type: String, required: true },
    producer_aware_id: { type: String, required: true },
    po_id: { type: String, required: true},
    date: { type: Date, required: true },
    order_number: { type: String, required: true },
    country: { type: String, required: true },
    address:{ type: String, required: true },
    etd: { type: Date, required: true },
    producer: { type: String, required: true },
    brand: { type: String, required: true },
    upload_po_pdf: { type: String, required: true },
    qrcode_status:{ type: String, required: false },
    locked_status:{ type: Boolean, required: true, default: false },
    created_date: { type: Date, required: true, default: Date.now },
    modified_on: { type: Date, required: false, default: Date.now },
    deleted: { type: Boolean, required: false, default: false }
});
module.exports = mongoose.model('purchase_order_details', purchaseOrderDetailsSchema);
