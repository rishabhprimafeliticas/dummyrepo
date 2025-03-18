var mongoose = require("mongoose");

const PhysicalAssetSchema = new mongoose.Schema({
  _awareid: { type: String, required: true },
  aware_token_id: { type: String, required: true },
  aware_asset_id: { type: String, required: true },
  date: { type: Date, required: false, default: Date.now },
  production_facility: { type: String, required: false, default: null },
  value_chain_process_main: [
    {
      color: { type: String, required: false, default: null },
      name: { type: String, required: false, default: null },
    },
  ],
  value_chain_process_sub: [
    {
      color: { type: String, required: false, default: null },
      name: { type: String, required: false, default: null },
    },
  ],
  aware_token_type: { type: String, required: false, default: null },
  material_specs: { type: String, required: false, default: null },
  main_color: { type: String, required: false, default: null },
  select_main_color: { type: String, required: false, default: null },
  production_lot: { type: String, required: false, default: null },
  compositionArrayMain: [
    {
      id: { type: String, required: false, default: null },
      color: { type: String, required: false, default: null },
      composition_material: { type: String, required: false, default: null },
      feedstock_recycled_materials: {
        type: String,
        required: false,
        default: null,
      },
      percentage: { type: Number, required: false, default: null },
      sustainability_claim: { type: String, required: false, default: null },
      sustainable: { type: Boolean, required: false, default: null },
    },
  ],
  weight: { type: String, required: false, default: null },
  sustainable_process_claim: { type: Boolean, required: false, default: null },
  wet_processing: { type: Boolean, required: false, default: null },
  wet_processing_arr: { type: Array, required: false, default: null },
  sustainable_process_certificates: [
    {
      _id: { type: String, required: false, default: null },
      documentname: { type: String, required: false, default: null },
      description: { type: String, required: false, default: null },
      validthru: { type: String, required: false, default: null },
      path: { type: String, required: false, default: null },
      status: { type: String, required: false, default: null },
    },
  ],
  created_date: { type: Date, required: false, default: Date.now },
  modified_on: { type: Date, required: false, default: Date.now },
});
module.exports = mongoose.model("physical_asset", PhysicalAssetSchema);
