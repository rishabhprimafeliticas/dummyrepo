

var mongoose = require('mongoose');

const materialCertificatesSchema = new mongoose.Schema({
    name: { type: String, default: null },
    file_name: { type: String, default: null },
    type: { type: mongoose.Schema.Types.ObjectId, ref: "material_certificate_types", default: null },

});
module.exports = mongoose.model('material_certificates', materialCertificatesSchema);
