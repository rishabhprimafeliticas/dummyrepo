

var mongoose = require('mongoose');

const materialCertificateTypesSchema = new mongoose.Schema({
    type: { type: String, default: null },
});
module.exports = mongoose.model('material_certificate_types', materialCertificateTypesSchema);
