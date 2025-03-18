

var mongoose = require('mongoose');

const selectedTransactionCertificatesSchema = new mongoose.Schema({
    _awareid: { type: String, required: true },
    send_aware_token_id: { type: String, required: true },
    transaction_certificates: [{
        transaction_certificate_id: { type: String, required: false, default: null },
        standard: { type: String, required: false, default: null },
        certification_body: { type: String, required: false, default: null },
        tc_date: { type: String, required: false, default: null },
        tc_number: { type: String, required: false, default: null },
        certificate_doc: { type: String, required: false, default: null },
    }],
    created_date: { type: Date, required: false, default: Date.now },
    modified_on: { type: Date, required: false, default: Date.now },
});
module.exports = mongoose.model('selected_transaction_certificates', selectedTransactionCertificatesSchema);
