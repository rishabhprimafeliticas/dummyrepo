

var mongoose = require('mongoose');

const AccountsDetailsSchema = new mongoose.Schema({
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    role_id: { type: Number, required: true },
    status: { type: Boolean, required: true, default: false  },
    two_fa_enabled: { type: Boolean, required: true, default: false  },
    refresh_token_secret: { type: String, required: false, default: null },
    termsnconditions: { type: Boolean, required: true, default: true },
    kyc_id: { type: String, required: false, default: null },
    is_number_verified: { type: Boolean, required: true, default: false },
    aware_id :{ type: String, required: false},
    acknowledgement: { type: Boolean, required: true, default: false },
    // able_to_login: { type: Boolean, required: true, default: false },
    // create_token_stepper: { type: Number, required: true, default: 1 },
    created_date: { type: Date, required: false,default: Date.now  },
    modified_on: { type: Date, required: false,default: Date.now  },
    is_deleted: { type: Boolean, required: false, default: false },
    sub_user:{type:Boolean,default :false}
});
module.exports = mongoose.model('accounts', AccountsDetailsSchema);
