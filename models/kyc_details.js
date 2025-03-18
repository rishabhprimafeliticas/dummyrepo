var mongoose = require("mongoose");

const KycDetailsSchema = new mongoose.Schema({
  company_name: { type: String, required: false, default: null },
  aware_id: { type: String, required: false, default: null },
  website: { type: String, required: false, default: null },
  address_lane_one: { type: String, required: false, default: null },
  address_lane_two: { type: String, required: false, default: null },
  country: { type: String, required: false, default: null },
  state: { type: String, required: false, default: null },
  city: { type: String, required: false, default: null },
  zipcode: { type: String, required: false, default: null },
  manager_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "accounts",
    required: false,
  },
  sub_user: [
    { type: mongoose.Schema.Types.ObjectId, ref: "accounts", required: false },
  ],
  sub_brand: [
    {
      _id: { type: String, default: mongoose.Types.ObjectId },
      name: { type: String, required: false, default: null },
      logo: { type: String, required: false, default: null },
      location: { type: String, required: false, default: null },
      circularity: { type: String, required: false, default: null },
      brand_data: { type: Array, required: false, default: null },
      dpp_settings: { type: Object, required: false, default: null },
      created_date: { type: Date, required: false, default: Date.now },
    },
  ],
  geo_location: [
    {
      lat: { type: Number, required: false, default: null },
      lng: { type: Number, required: false, default: null },
      country: { type: String, required: false, default: null },
      state: { type: String, required: false, default: null },
      city: { type: String, required: false, default: null },
      address: { type: String, required: false, default: null },
    },
  ],
  company_logo: { type: String, required: false, default: null },
  company_presentation: { type: String, required: false, default: null },
  company_profile_pdf: { type: String, required: false, default: null },
  company_photo_one: { type: String, required: false, default: null },
  company_photo_two: { type: String, required: false, default: null },
  company_photo_three: { type: String, required: false, default: null },
  company_photo_four: { type: String, required: false, default: null },
  company_photo_five: { type: String, required: false, default: null },
  // company_photos: { type: Array, required: false, default: null },

  environmental_scope_certificates: [
    {
      doc_id: { type: String, required: false, default: null },
      documentname: { type: String, required: false, default: null },
      description: { type: String, required: false, default: null },
      validthru: { type: String, required: false, default: null },
      isselected: { type: Boolean, required: false, default: null },
      path: { type: String, required: false, default: null },
      status: { type: String, required: false, default: null },
      archive: { type: Boolean, required: false, default: false },
    },
  ],

  social_compliance_certificates: [
    {
      doc_id: { type: String, required: false, default: null },
      documentname: { type: String, required: false, default: null },
      description: { type: String, required: false, default: null },
      validthru: { type: String, required: false, default: null },
      isselected: { type: Boolean, required: false, default: null },
      path: { type: String, required: false, default: null },
      status: { type: String, required: false, default: null },
      archive: { type: Boolean, required: false, default: false },
    },
  ],
  chemical_compliance_certificates: [
    {
      doc_id: { type: String, required: false, default: null },
      documentname: { type: String, required: false, default: null },
      description: { type: String, required: false, default: null },
      validthru: { type: String, required: false, default: null },
      isselected: { type: Boolean, required: false, default: null },
      path: { type: String, required: false, default: null },
      status: { type: String, required: false, default: null },
      archive: { type: Boolean, required: false, default: false },
    },
  ],
  sustainable_process_certificates: [
    {
      doc_id: { type: String, required: false, default: null },
      documentname: { type: String, required: false, default: null },
      description: { type: String, required: false, default: null },
      validthru: { type: String, required: false, default: null },
      isselected: { type: Boolean, required: false, default: null },
      path: { type: String, required: false, default: null },
      status: { type: String, required: false, default: null },
      archive: { type: Boolean, required: false, default: false },
    },
  ],

  aware_tracer: [
    {
      _id: { type: String, required: false, default: null },
      tracer_id: { type: String, required: false, default: null },
      licensenumber: { type: String, required: false, default: null },
      validthru: { type: String, required: false, default: null },
      path: { type: String, required: false, default: null },
      status: { type: String, required: false, default: null },
    },
  ],
  custom_tracer: [
    {
      tracer_id: { type: String, required: false, default: null },
      tracerName: { type: String, required: false, default: null },
      validthru: { type: String, required: false, default: null },
      path: { type: String, required: false, default: null },
      status: { type: String, required: false, default: null },
    },
  ],

  acknowledgement: { type: Boolean, required: false, default: null },
  terms_condition: { type: Boolean, required: false, default: null },
  subscription: {
    allowed_dpp: { type: Number, required: false },
    allowed_quantity: { type: Number, required: false}, // allowed_quantity is same as product_lines.product_line.quantity (which is also referenced as pieces in frontend)
    start_date: { type: Date, required: false }, 
    end_date: { type: Date, required: false },
  },
  kyc_status: { type: String, required: false, default: "1" },
  kyc_note: { type: String, required: false, default: null },
  created_by: { type: String, required: false, default: null },
  created_date: { type: Date, required: false, default: Date.now },
  modified_by: { type: String, required: false, default: null },
  modified_date: { type: Date, required: false, default: Date.now },
  kyc_verified_by: { type: String, required: false, default: null },
  kyc_verified_on: { type: Date, required: false, default: Date.now },
});
module.exports = mongoose.model("kyc_details", KycDetailsSchema);
