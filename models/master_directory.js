var mongoose = require("mongoose");

const masterSchema = new mongoose.Schema({
  masterName: { type: String },
});

module.exports = mongoose.model("masters_directories", masterSchema);
