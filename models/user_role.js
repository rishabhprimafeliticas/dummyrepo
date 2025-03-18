

var mongoose = require('mongoose');

const userroleSchema = new mongoose.Schema({
    role_id: { type: Number, default: null },
    role_name: { type: String, default: null },
    isactive: { type: Boolean, default: null },
    created_date: { type: Date, default: Date.now },
});
module.exports = mongoose.model('user_role', userroleSchema);
