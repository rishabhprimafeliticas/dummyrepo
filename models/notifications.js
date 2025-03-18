

var mongoose = require('mongoose');

const requestsSchema = new mongoose.Schema({
    notification_sent_to: { type: mongoose.Schema.Types.String, ref: "kyc_details", required: false },
    message: { type: String, required: false },
    read: { type: Boolean, required: false, default: false },
    date: { type: String, required: false },
    created_date: { type: Date, required: true, default: Date.now },
    modified_on: { type: Date, required: true, default: Date.now },
});
module.exports = mongoose.model('notifications', requestsSchema);
