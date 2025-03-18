

var mongoose = require('mongoose');

const hardGoodsBrandsSchema = new mongoose.Schema({
    //products
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
    product_photo_1: { type: String, required: false, default: null },
    product_photo_2: { type: String, required: false, default: null },
    product_photo_3: { type: String, required: false, default: null },
    dpp_settings: { type: Object, required: false, default: null },
    created_date: { type: Date, required: false, default: null },
    modified_on: { type: Date, required: false, default: Date.now },

    //purchase orders
    _awareid: { type: String, required: false },
    status: { type: String, required: false },
    create_token_stepper: { type: Number, required: false, default: 1 },
    type_of_token: { type: String, required: false, default: null },
    locked: { type: Boolean, required: false, default: false },
    hide: { type: Boolean, required: false },


    // Purchase_orders_details

    producer_aware_id: { type: String, required: false },
    po_id: { type: String, required: false },
    date: { type: Date, required: false },
    order_number: { type: String, required: false },
    country: { type: String, required: false },
    address: { type: String, required: false },
    etd: { type: Date, required: false },
    producer: { type: String, required: false },
    brand: { type: String, required: false },
    upload_po_pdf: { type: String, required: false },
    qrcode_status: { type: String, required: false },
    locked_status: { type: Boolean, required: false, default: false },

    //hardgoodsproducts
    brandname: { type: String, required: false, default: null },
    sustainablescore: { type: Number, required: false, default: null },
    producername: { type: String, required: false, default: null },
    companyglance: { type: String, required: false },
    produceraddress: { type: String, required: false, default: null },
    factorycompliances: { type: [Object], required: false, default: [] },
    productcertificates: { type: [Object], required: false, default: [] },
    weight: { type: String, required: false, default: null },
    itemmanual: { type: String, required: false, default: null },
    compliance: { type: String, required: false },
    certificationsdocandsoc: { type: String, required: false, default: null },
    circularity: { type: String, required: false },
    productImage: { type: String, required: false },
    brandlogo: { type: String, required: false },
    materials: { type: [Object], required: false, default: [] },
    brand_data: { type: Object, required: false, default: null },
    qr_generated: { type: Boolean, required: false, defauls: false },
    old_qr_id: { type: String, required: false, default: null },
    producerlogo: { type: String, required: false },
    photoattached: { type: String, required: false, default: null },
    url: { type: String, required: false },
    deleted: { type: Boolean, required: false, default: false }
});
module.exports = mongoose.model('hardGoodsBrands', hardGoodsBrandsSchema);
