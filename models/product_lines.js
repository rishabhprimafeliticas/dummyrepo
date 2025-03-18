

var mongoose = require('mongoose');
const { NumberContext } = require('twilio/lib/rest/pricing/v2/voice/number');

const ProductLinesSchema = new mongoose.Schema({
    _awareid: { type: String, required: true },
    po_id: { type: String, required: true },
    product_line: [
        {
            id: { type: String, required: false, default: null },
            order_number: { type: String, required: false, default: null },
            product: { type: String, required: false, default: null },
            color: { type: String, required: false, default: null },
            weight: { type: Number, required: false, default: null },
            quantity: { type: Number, required: false, default: null },
            item_number: { type: String, required: false, default: null },
            description: { type: String, required: false, default: null },
            productid: { type: String, required: false, default: null },
            existproduct: { type: Boolean, required: false, default: null },
            update_aware_token_id: { type: String, required: false, default: null },
            update_status: { type: String, required: false, default: null },
            generated: { type: Boolean, required: false, default: null },
            message: { type: String, required: false },
            attched_token: {
                update_asset_id: { type: String, required: false, default: null },
                main_color: { type: String, required: false, default: null },
                in_wallet: { type: String, required: false, default: null },
                To_be_Send: { type: String, required: false, default: null },
                balance: { type: Number, required: false, default: null },
                update_aware_token_id: { type: String, required: false, default: null },
                temp_lock: { type: Boolean, required: false, default: null },
            },
            production_quantity: { type: String, required: false, default: null },
            draft_id: { type: String, required: false, default: null },
            old_qr_id: { type: String, required: false, default: null },
            deleted: { type: Boolean, required: false, default: false },
        }],
    product_line_status: { type: String, required: false, default: null },
    created_date: { type: Date, required: true, default: Date.now },
    modified_on: { type: Date, required: false, default: Date.now },
    deleted: { type: Boolean, required: false, default: false }
});
module.exports = mongoose.model('product_lines', ProductLinesSchema);
