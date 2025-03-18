

var mongoose = require('mongoose');

const CompanyCompliancesSchema = new mongoose.Schema({
    _awareid: { type: String, required: true },
    update_aware_token_id: { type: String, required: true },
    environmental_scope_certificates: [
        {
            doc_id: { type: String, required: false, default: null },
            documentname: { type: String, required: false, default: null },
            description: { type: String, required: false, default: null },
            validthru: { type: String, required: false, default: null },
            isselected: { type: Boolean, required: false, default: null },
            path: { type: String, required: false, default: null },
            status: { type: String, required: false, default: null },
        }
    ],
    social_compliance_certificates: [
        {
            doc_id: { type: String, required: false, default: null },
            documentname: { type: String, required: false, default: null },
            description: { type: String, required: false, default: null },
            validthru: { type: String, required: false, default: null },
            isselected: { type: Boolean, required: false, default: null },
            path: { type: String, required: false, default: null },
            status: { type: String, required: false, default: null },
        }
    ],
    chemical_compliance_certificates: [
        {
            doc_id: { type: String, required: false, default: null },
            documentname: { type: String, required: false, default: null },
            description: { type: String, required: false, default: null },
            validthru: { type: String, required: false, default: null },
            isselected: { type: Boolean, required: false, default: null },
            path: { type: String, required: false, default: null },
            status: { type: String, required: false, default: null },
        }
    ],
    created_date: { type: Date, required: true, default: Date.now },
    modified_on: { type: Date, required: true, default: Date.now },
});
module.exports = mongoose.model('update_company_compliances', CompanyCompliancesSchema);
