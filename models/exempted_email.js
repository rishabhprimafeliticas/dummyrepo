var mongoose = require("mongoose");

const exemptedEmailSchema = new mongoose.Schema({
  email: { type: String, required: true },
  created_date: { type: Date, required: true, default: Date.now },
});

module.exports = mongoose.model("exempted_email", exemptedEmailSchema);
