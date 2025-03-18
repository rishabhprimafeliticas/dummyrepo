var mongoose = require('mongoose');

const valuechainSchema = new mongoose.Schema({
    color: { type: String, default: null },
    color_number:{type: Number, default:null},
    main: { type: String, default: null },
    sub: { type: Array, default: null },
    created_date: { type: Date, default: Date.now },
});
module.exports = mongoose.model('valuechain', valuechainSchema);
