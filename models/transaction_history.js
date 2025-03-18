var mongoose = require('mongoose');

const transactionhistorySchema = new mongoose.Schema({
    _awareid: { type: String, required: false, default: null },
    aware_token_id: { type: String, required: false, default: null },
    update_aware_token_id: { type: String, required: false, default: null },
    transactionIndex: { type: String, required: false, default: null },
    transactionHash: { type: String, required: false, default: null },
    blockHash: { type: String, required: false, default: null },
    blockNumber: { type: String, required: false, default: null },
    from: { type: String, required: false, default: null },
    to: { type: String, required: false, default: false },
    cumulativeGasUsed: { type: String, required: false, default: null },
    gasUsed: { type: String, required: false, default: null },
    contractAddress: { type: String, required: false, default: null },
    logsBloom: { type: String, required: false, default: null },
    logs: [{
        removed: { type: Boolean, required: false, default: null },
        logIndex: { type: Number, required: false, default: null },
        transactionIndex: { type: Number, required: false, default: null },
        transactionHash: { type: String, required: false, default: null },
        blockHash: { type: String, required: false, default: null },
        blockNumber: { type: Number, required: false, default: null },
        address: { type: String, required: false, default: null },
        data: { type: String, required: false, default: null },
        topics: { type: Array, required: false, default: null },
        id: { type: String, required: false, default: null },
    }],
    status: { type: String, required: false, default: null },
    created_date: { type: Date, required: false, default: Date.now },
    modified_on: { type: Date, required: false, default: Date.now },
});
module.exports = mongoose.model('transaction_history', transactionhistorySchema);