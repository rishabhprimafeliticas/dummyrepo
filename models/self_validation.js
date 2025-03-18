var mongoose = require("mongoose");

const SelfValidationSchema = new mongoose.Schema({
  _awareid: { type: String, required: true },
  aware_token_id: { type: String, required: true },
  declaration_number: { type: String, required: true },
  sustainble_material: [
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
      _id: { type: String, required: false, default: null },
      weight: { type: Number, required: false, default: null },
      selfvalidation: { type: Boolean, required: false, default: null },
      selfvalidationData: [
        {
          id: { type: String, required: false, default: null },
          composition_material_id: {
            type: String,
            required: false,
            default: null,
          },
          composition_material: {
            type: String,
            required: false,
            default: null,
          },
          sustainability_claim: {
            type: String,
            required: false,
            default: null,
          },
          color: { type: String, required: false, default: null },
          feedstock_recycled_materials: {
            type: String,
            required: false,
            default: null,
          },
          kgs: { type: String, required: false, default: null },
          feedstocktype: { type: String, required: false, default: null },
          feedstock_source_type: {
            type: String,
            required: false,
            default: null,
          },
          source_id: { type: String, required: false, default: null },
          source_name: { type: String, required: false, default: null },
          source_address: { type: String, required: false, default: null },
          source_certifications: {
            type: String,
            required: false,
            default: null,
          },
          source_certifications_list: {
            type: Array,
            required: false,
            default: null,
          },
          source_invoice_no: { type: String, required: false, default: null },
          Date: { type: Date, required: false, default: null },
          sourcepkgupload: { type: String, required: false, default: null },
          source_proof: { type: String, required: false, default: null },
          labtesting: { type: String, required: false, default: null },
          certificate1: {
            name: { type: String, required: false, default: null },
            document: { type: String, required: false, default: null },
          },
          certificate2: {
            name: { type: String, required: false, default: null },
            document: { type: String, required: false, default: null },
          },
          certificate3: {
            name: { type: String, required: false, default: null },
            document: { type: String, required: false, default: null },
          },
          other_document: {
            name: { type: String, required: false, default: null },
            document: { type: String, required: false, default: null },
          },
          colorchanger: { type: String, required: false, default: null },
          kg_percentage: { type: Number, required: false, default: null },
        },
      ],
      validateInfo: {
        fullname: { type: String, required: false, default: null },
        checkbox: { type: Boolean, required: false, default: null },
      },
      main_color: { type: String, required: false, default: null },
    },
  ],
  created_date: { type: Date, required: false, default: Date.now },
  modified_on: { type: Date, required: false, default: Date.now },
});
module.exports = mongoose.model("self_validation", SelfValidationSchema);
