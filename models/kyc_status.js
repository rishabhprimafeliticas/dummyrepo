

var mongoose = require('mongoose');

const KycStatusSchema = new mongoose.Schema({
    status_id: { type: String },
    status: { type: String },
});

module.exports = mongoose.model('kyc_status_directories', KycStatusSchema);
