var mongoose = require("mongoose");

const TracerSchema = new mongoose.Schema({
  _awareid: { type: String, required: true },
  aware_token_id: { type: String, required: true },

  tracer_added: { type: Boolean, required: true },
  type_selection: { type: String, required: false },

  aware_tc_checked: { type: Boolean, required: false },
  custom_tc_checked: { type: Boolean, required: false },

  aware_date: { type: Date, required: false },
  custom_date: { type: Date, required: false },

  custom_name: { type: String, required: false },
  aware_licences: { type: String, required: false },
  tracer_pdf: { type: String, required: false },
  created_date: { type: Date, required: false, default: Date.now },
  modified_on: { type: Date, required: false, default: Date.now },
});
module.exports = mongoose.model("tracer", TracerSchema);
