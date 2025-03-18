

var mongoose = require('mongoose');

const SessionStorageSchema = new mongoose.Schema({
    email: { type: String, default: null },
    linkexpirationtime: { type: Date, default: Date.now },
    hash: { type: String, default: null }
});
module.exports = mongoose.model('session_storage', SessionStorageSchema);
