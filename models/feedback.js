var mongoose = require('mongoose');
const dpp_feedback = new mongoose.Schema({
    aware_id: { type: String, default: null },
    passport_url: { type: String, default: null },    
    feedback: { type: String, default: null }
});
module.exports = mongoose.model('dpp_feedbacks', dpp_feedback);