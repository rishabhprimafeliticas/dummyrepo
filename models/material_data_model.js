

var mongoose = require('mongoose');

const materialdataSchema = new mongoose.Schema({
    name: { type: String, required: false, default: null },
    // descriptionss:{ type: String, required: false, default: null },
    value: [{
        name: { type: String, required: false, default: null },
        value: [{
            name: { type: String, required: false, default: null },
            value: [{
                name: { type: String, required: false, default: null },
                value: { type: String, required: false, default: null }
            }]
        }]
    }],
    created_date: { type: Date, required: false, default: Date.now },
    modified_on: { type: Date, required: false, default: Date.now },
});

module.exports = mongoose.model('material_data', materialdataSchema);