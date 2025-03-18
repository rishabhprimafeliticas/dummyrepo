

var mongoose = require('mongoose');

const SourceAddressesSchema = new mongoose.Schema({
    _awareid: { type: String, required: true },
    source_name: { type: String, required: false },
    address_line_one: { type: String, required: false },
    address_line_two: { type: String, required: false },
    country: { type: String, required: false },
    state: { type: String, required: false },
    city: { type: String, required: false },
    zipcode: { type: String, required: false },
    isArchived: {type: Boolean, required: false, default: false},
    created_date: { type: Date, required: true, default: Date.now },
    modified_on: { type: Date, required: true, default: Date.now },
});
module.exports = mongoose.model('source_addresses', SourceAddressesSchema);
