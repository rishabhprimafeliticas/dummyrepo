

var mongoose = require('mongoose');

const walletsSchema = new mongoose.Schema({
    name: { type: String, default: null },
    description: { type: String, default: null },
});
module.exports = mongoose.model('material_content', walletsSchema);
