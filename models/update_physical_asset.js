

var mongoose = require('mongoose');

const PhysicalAssetSchema = new mongoose.Schema({
    _awareid: { type: String, required: true },
    update_aware_token_id: { type: String, required: true },
    updated_aware_asset_id: { type: String, required: true },
    material_specs: { type: String, required: false, default: null },
    product_description: { type: String, required: false, default: null },

    main_color: { type: String, required: false, default: null },
    select_main_color: { type: String, required: false, default: null },
    production_lot: { type: String, required: false, default: null },
    tempcompositionArrayMain


        : [{
            id: { type: String, required: false, default: null },
            color: { type: String, required: false, default: null },
            composition_material: { type: String, required: false, default: null },
            feedstock_recycled_materials: { type: String, required: false, default: null },
            percentage: { type: Number, required: false, default: null },
            sustainability_claim: { type: String, required: false, default: null },
            sustainable: { type: Boolean, required: false, default: null },
        }],

    compositionArrayMain



        : [{
            id: { type: String, required: false, default: null },
            color: { type: String, required: false, default: null },
            composition_material: { type: String, required: false, default: null },
            feedstock_recycled_materials: { type: String, required: false, default: null },
            total_kgs: { type: Number, required: false, default: null },
            sustainability_claim: { type: String, required: false, default: null },
            sustainable: { type: Boolean, required: false, default: null },
        }],

    assetdataArrayMain: [{
        id: { type: String, required: false, default: null },
        color: { type: String, required: false, default: null },
        aware_asset: { type: Boolean, required: false, default: null },
        tt_id: { type: String, required: false, default: null },
        aware_token_type: { type: String, required: false, default: null },
        aware_asset_id: { type: String, required: false, default: null },
        tokens_in_Wallet: { type: Number, required: false, default: null },
        Used_token: { type: String, required: false, default: null },
        Waste_token: { type: Number, required: false, default: null },
        token_deduction: { type: Number, required: false, default: null },
        token_balance: { type: Number, required: false, default: null },
    }],
    weight: { type: String, required: false, default: null },
    quantity: { type: String, required: false, default: null },
    orginal_weight: { type: String, required: false, default: null },
    // 1. next proccssor 2.po line 3.new po
    type_of_update: { type: Number, required: false, default: null },
    sustainable_process_claim: { type: Boolean, required: false, default: null },
    wet_processing_t: { type: Boolean, required: false, default: null },
    wet_processing: { type: Array, required: false, default: null },
    sustainable_process_certificates: [{
        _id: { type: String, required: false, default: null },
        documentname: { type: String, required: false, default: null },
        description: { type: String, required: false, default: null },
        validthru: { type: String, required: false, default: null },
        path: { type: String, required: false, default: null },
        status: { type: String, required: false, default: null }
    }],
    created_date: { type: Date, required: false, default: Date.now },
    modified_on: { type: Date, required: false, default: Date.now },
});
module.exports = mongoose.model('update_physical_asset', PhysicalAssetSchema);
