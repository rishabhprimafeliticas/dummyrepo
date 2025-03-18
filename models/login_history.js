

var mongoose = require('mongoose');

const loginhistorySchema = new mongoose.Schema({
    user_id: { type: String, default: null },
    user_name: { type: String, default: null },
    login_date: { type: Date, default: Date.now},
    logout_date: { type: Date, default: Date.now },
    status: { type: Boolean, default: null },

});
module.exports = mongoose.model('login_history', loginhistorySchema);
