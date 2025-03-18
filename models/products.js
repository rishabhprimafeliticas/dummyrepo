

var mongoose = require('mongoose');

const productsSchema = new mongoose.Schema({
    _awareid: { type: String, required: true },
    item_number: { type: String, required: false, default: null },
    description: { type: String, required: false, default: null },
    color: { type: String, required: false, default: null },
    info: { type: String, required: false, default: null },
    care: { type: String, required: false, default: null },
    weight: { type: Number, required: false, default: null },
    product_lock: { type: String, required: false, default: null },
    sub_brand: { type: String, required: false, default: null },
    impact_data: {
        type: {
            id: { type: String, required: false, default: null },
            co2: { type: String, required: false, default: null },
            water: { type: String, required: false, default: null },
            land: { type: String, required: false, default: null }
        },
        required: false,
        default: null  // Allow the entire impact_data object to be null
    },
    status: { type: String, required: false, default: null },
    archive: { type: Boolean, required: false, default: false },
    product_photo_1: { type: String, required: false, default: null },
    product_photo_2: { type: String, required: false, default: null },
    product_photo_3: { type: String, required: false, default: null },
    dpp_settings: { type: Object, required: false, default: null },
    created_date: { type: Date, required: false, default: null },
    modified_on: { type: Date, required: false, default: Date.now },
});
module.exports = mongoose.model('products', productsSchema);
