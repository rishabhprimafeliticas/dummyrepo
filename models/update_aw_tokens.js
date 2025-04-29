const { Schema } = require("mongoose");
var mongoose = require("mongoose");

const UpdateAwTokensSchema = new mongoose.Schema({
  _awareid: { type: String, required: false, default: null },
  status: { type: String, required: false, default: null },
  create_token_stepper: { type: Number, required: false, default: 1 },
  type_of_token: { type: String, required: false, default: null },
  total_tokens: { type: Number, required: false, default: 0 },
  used_tokens: { type: Number, required: false, default: 0 },
  locked_tokens: { type: Number, required: false, default: 0 },
  avaliable_tokens: { type: Number, required: false, default: 0 },
  locked: { type: Boolean, required: false, default: false },
  blockchain_id: { type: String, required: false, default: null },
  hide_flag: { type: Boolean, required: false },
  line_type: { type: Number, required: false, default: 0 },
  message: { type: String, required: false },
  reviewedBy: { type: Schema.Types.ObjectId, ref: "accounts", default: null },
  reviewedOn: { type: Date, required: false, default: null },
  created_date: { type: Date, required: false, default: Date.now },
  modified_on: { type: Date, required: false, default: Date.now },
});
module.exports = mongoose.model("update_aw_tokens", UpdateAwTokensSchema);
