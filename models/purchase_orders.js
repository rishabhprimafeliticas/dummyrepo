

var mongoose = require('mongoose');

const purchaseOrdersSchema = new mongoose.Schema({
    _awareid: { type: String, required: true },
    status: { type: String, required: true },
    create_token_stepper: { type: Number, required: true, default: 1 },
    type_of_token: { type: String, required: false, default: null  },
    locked : { type: Boolean, required: true, default: false },
    created_date: { type: Date, required: true, default: Date.now },
    modified_on: { type: Date, required: false, default: Date.now },
    hide: {type: Boolean, required: false},
    deleted: { type: Boolean, required: false, default: false }
});
module.exports = mongoose.model('purchase_orders', purchaseOrdersSchema);
