

var mongoose = require('mongoose');

const masterdataSchema = new mongoose.Schema({
    masterId: { type: String },
    name: { type: String },
    icon: { type: String, required: false, default: null },

});

module.exports = mongoose.model('masters_data', masterdataSchema);