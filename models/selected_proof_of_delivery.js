

var mongoose = require('mongoose');
const material_certificates = require('./material_certificates');

const selectedProofOfDeliverySchema = new mongoose.Schema({
    _awareid: { type: String, required: true },
    send_aware_token_id: { type: String, required: true },
    delivery_note_pdf: { type: String, required: true, default: null },
    packing_list_pdf: { type: String, required: true, default: null },
    material_certificates: { type: Array, required: false, default: null },
    created_date: { type: Date, required: false, default: Date.now },
    modified_on: { type: Date, required: false, default: Date.now },
  
});
module.exports = mongoose.model('selected_proof_of_delivery', selectedProofOfDeliverySchema);
