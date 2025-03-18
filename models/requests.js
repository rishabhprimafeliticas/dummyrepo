

var mongoose = require('mongoose');

const requestsSchema = new mongoose.Schema({
    sender_aware_id: { type: String, required: true },
    receiver_aware_id: { type: String, required: false },
    status: { type: String, required: false, default: "Pending" },
    isdeleted : {type: Boolean, required: false, default: null},
    created_date: { type: Date, required: true, default: Date.now},
    modified_on: { type: Date, required: true, default: Date.now},
});
module.exports = mongoose.model('requests', requestsSchema);
