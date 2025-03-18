const express = require("express");
var asyncHandler = require('express-async-handler');
const { body, validationResult, check } = require('express-validator');
router = express.Router();;
var updateawaretokenhandler = require('../services/update-aware-token-handler');
const { verify } = require('../middleware');
var _ = require('lodash');
var multer = require('multer');
var limits = {
    // allow only 1 file per request
    fileSize: 7340032, // 2 MB (max file size)
};
var fileFilters = function (req, file, cb) {
    // supported image file mimetypes
    var allowedMimes = ['application/pdf', 'image/png', 'image/heif', 'image/jpg', 'image/jpeg', 'image/pjpeg', 'image/heic'];

    if (_.includes(allowedMimes, file.mimetype)) {
        // allow supported image files
        cb(null, true);
    } else {
        // throw error for invalid files
        cb(new Error('I know you have it in you, Try again!'));
        // return res.status(400).jsonp('I know you have it in you, Try again!')

    }
};
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads');
    },
    filename: function (req, file, cb) {
        // const originalname = file.originalname;
        // const extension = originalname.substring(originalname.lastIndexOf('.')); // Get file extension
        // const filename = originalname.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, ''); // Replace spaces and non-English characters
        // cb(null, Date.now() + filename + extension);
        cb(null, file.originalname);
    }
});
var upload = multer({

    fileFilter: fileFilters,
    storage: storage,

});


var storage2 = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads');
    },
    filename: function (req, file, cb) {

        cb(null, file.originalname);
    }
});
var upload2 = multer({

    fileFilter: fileFilters,
    storage: storage2,

});


router.post('/v2/update_aware_token',
    [

    ],
    verify,
    asyncHandler(updateawaretokenhandler.handlers.updateAwareTokenAsync));


router.post('/v2/create_draft_info_async',
    [

    ],
    verify,
    asyncHandler(updateawaretokenhandler.handlers.createDraftInfoAsync));
router.post('/v2/update_purchase_order_async',
    [],
    verify,
    asyncHandler(updateawaretokenhandler.handlers.updatePurchaseOrderAsync));

router.get('/v2/get_draft_info_list_async', verify,
    asyncHandler(updateawaretokenhandler.handlers.getDraftInfoListAsync));


router.get('/v2/get_draft_info_async', verify,
    asyncHandler(updateawaretokenhandler.handlers.getDraftInfoAsync));

router.get('/v2/get_updated_aware_token_async', verify,
    asyncHandler(updateawaretokenhandler.handlers.getUpdatedAwareTokensAsync));

router.get('/v2/get_all_update_aware_token_async', verify,
    asyncHandler(updateawaretokenhandler.handlers.getAllUpdateAwareTokenAsync));

router.get('/v2/get_all_update_aware_token_manager_async', verify,
    asyncHandler(updateawaretokenhandler.handlers.getallupdateAwareTokenManagerAsync));

// router.get('/v2/get_aware_token_transaction_history_async', verify,
//     asyncHandler(awaretokenhandler.handlers.getAwareTokenTransactionHistoryAsync));

// router.get('/v2/getapprovedawaretokenasync', verify,
//     asyncHandler(awaretokenhandler.handlers.getApprovedAwareTokenAsync));

// router.get('/v2/getallawaretokenasync', verify,
//     asyncHandler(awaretokenhandler.handlers.getallAwareTokenAsync));

// router.get('/v2/getuserdetailsasync', verify,
//     asyncHandler(awaretokenhandler.handlers.getUsersKycDetailsAsync));

// router.post("/v2/CheckAvailableAwareID", check('aware_id').not().isEmpty().withMessage("I know you have it in you, Try again!").escape(), verify,
//     asyncHandler(awaretokenhandler.handlers.getAvailableAwareIDAsync)
// );

// router.post('/v2/post_source_address_async',
//     [
//         check('_awareid').escape(),
//         check('source_name').escape(),
//         check('address_line_one').escape(),
//         check('address_line_two').escape(),
//         check('country').escape(),
//         check('state').escape(),
//         check('city').escape(),
//         check('zipcode').escape()
//     ],
//     verify,
//     asyncHandler(awaretokenhandler.handlers.storeSourceAddressAsync));

// router.get('/v2/getsourceaddressasync', verify,
//     asyncHandler(awaretokenhandler.handlers.getSourceAddressAsync));

// //done
router.post('/v2/select_update_aware_token_type_async',
    [
        // check('_awareid_t').not().isEmpty().withMessage("I know you have it in you, Try again!").escape(),
        // check('date_t').not().isEmpty().withMessage("I know you have it in you, Try again!").escape(),
        // check('production_facility_t').not().isEmpty().withMessage("I know you have it in you, Try again!").escape(),

        // check('aware_token_type_t').not().isEmpty().withMessage("I know you have it in you, Try again!").escape(),
        // check('main_color_t').not().isEmpty().withMessage("I know you have it in you, Try again!").escape(),
        // check('select_main_color_t').not().isEmpty().withMessage("I know you have it in you, Try again!").escape(),
        // check('production_lot_t').not().isEmpty().withMessage("I know you have it in you, Try again!").escape(),
        // check('weight_t').not().isEmpty().withMessage("I know you have it in you, Try again!").escape(),
        // check('sustainable_process_claim_t').not().isEmpty().withMessage("I know you have it in you, Try again!").escape(),
        // check('wet_processing_t').not().isEmpty().withMessage("I know you have it in you, Try again!").escape(),


    ],
    verify,
    asyncHandler(updateawaretokenhandler.handlers.selectUpdateAwareTokenTypeAsync));

//done
router.get('/v2/get_selected_update_aware_token_type_async', verify,
    asyncHandler(updateawaretokenhandler.handlers.getSelectedUpdateAwareTokenTypeAsync));


//done
router.post('/v2/update_physical_assest_async',
    [
    ],
    verify,
    asyncHandler(updateawaretokenhandler.handlers.updatePhysicalAssestAsync));

//done
router.get('/v2/get_updated_physical_assets', verify,
    asyncHandler(updateawaretokenhandler.handlers.getUpdatedPhyscialAssetsAsync));


//done
router.post('/v2/update_tracer', upload.single("update_pdf"), [], verify,
    asyncHandler(updateawaretokenhandler.handlers.updateTracerAsync));


//done
router.get('/v2/get_updated_tracer', verify,
    asyncHandler(updateawaretokenhandler.handlers.getUpdatedTracerAsync));


//done
router.post('/v2/update_post_self_validation_async', upload2.array('uploadedImages[]'),
    [
    ],
    verify,
    asyncHandler(updateawaretokenhandler.handlers.updateSelfValidationAsync));

//done
router.get('/v2/get_updated_self_validation', verify,
    asyncHandler(updateawaretokenhandler.handlers.getUpdatedSelfValidationAsync));


//done
router.post('/v2/update_company_complinces_async',
    [
        check('_awareid').escape(),
        // check('environmental_scope_certificates').not().isEmpty().withMessage("I know you have it in you, Try again!").escape(),
        // check('social_compliance_certificates').not().isEmpty().withMessage("I know you have it in you, Try again!").escape(),
        // check('chemical_compliance_certificates').not().isEmpty().withMessage("I know you have it in you, Try again!").escape(),
    ],
    verify,
    asyncHandler(updateawaretokenhandler.handlers.updateCompanyComplianceAsync));

//done
router.get('/v2/get_updated_company_compliance', verify,
    asyncHandler(updateawaretokenhandler.handlers.getUpdateCompanyComplianceAsync));

//done
router.post('/v2/post_updated_digital_twin',
    [
    ],
    verify,
    asyncHandler(updateawaretokenhandler.handlers.postUpdatedDigitalTwinAsync));

//done
router.get('/v2/get_updated_digital_twin', verify,
    asyncHandler(updateawaretokenhandler.handlers.getUpdatedDigitalTwinAsync));



router.get('/v2/get_my_final_brand_connections', [],
    verify,
    asyncHandler(updateawaretokenhandler.handlers.getMyFinalBrandConnectionsAsync));
// //done
// router.post('/v2/post_self_validation_async', upload.array('uploadedImages[]'),
//     [
//         check('_awareid').escape(),
//     ],
//     verify,
//     asyncHandler(awaretokenhandler.handlers.createSelfValidationAsync));

// //done
// router.get('/v2/getselfvalidation', verify,
//     asyncHandler(awaretokenhandler.handlers.getSelfValidationAsync));

//done
router.post('/v2/reset_update_aware_token',
    [
        check('_awareid').escape(),
        check('type').escape(),
    ],
    verify,
    asyncHandler(updateawaretokenhandler.handlers.deleteResetUpdateAwareTokenAsync));

// //done
// router.post('/v2/post_tracer',
//     [

//     ],
//     verify,
//     asyncHandler(awaretokenhandler.handlers.createTracerAsync));

// //done
// router.get('/v2/gettracer', verify,
//     asyncHandler(awaretokenhandler.handlers.getTracerAsync));

// //done
// router.post('/v2/post_digital_twin',
//     [
//     ],
//     verify,
//     asyncHandler(awaretokenhandler.handlers.postDigitalTwinAsync));

// //done
// router.get('/v2/get_digital_twin', verify,
//     asyncHandler(awaretokenhandler.handlers.getDigitalTwinAsync));

router.post('/v2/delete_update_aware_token',
    verify,
    asyncHandler(updateawaretokenhandler.handlers.deleteUpdateAwareTokenAsync));

//done
router.get('/v2/get_update_aw_token_details', verify,
    asyncHandler(updateawaretokenhandler.handlers.getUpdateAwareTokenDetailsAsync));

// router.get('/v2/get_wallet_async', verify,
//     asyncHandler(awaretokenhandler.handlers.getWalletAsync));


///we have to do it for both create token and updated token
router.get('/v2/get_received_aware_tokens_async', verify,
    asyncHandler(updateawaretokenhandler.handlers.getReceivedAwareTokensAsync));


router.get('/v2/get_historical_tracers_of_aware_asset', verify,
    asyncHandler(updateawaretokenhandler.handlers.getHistoricalTracersOfAwareAssetsAsync));

router.get('/v2/get_update_digital_twin', verify,
    asyncHandler(updateawaretokenhandler.handlers.getUpdateDigitalTwinAsync));

router.get('/v2/get_details_for_update_self_validation_certificate_async', verify,
    asyncHandler(updateawaretokenhandler.handlers.getDetailsForUpdateSelfValidationCertificateAsync));


//03/12/2022
router.get('/v2/get_purchase_orders_async', verify,
    asyncHandler(updateawaretokenhandler.handlers.getparticularPurchaseOrdersFromBrandAsync));

router.get('/v2/get_product_lines_async', verify,
    asyncHandler(updateawaretokenhandler.handlers.getProductLineFromBrandAsync));

router.get('/v2/get_particular_product_line_async', verify,
    asyncHandler(updateawaretokenhandler.handlers.getParticularProductLineFromBrandAsync));

router.post('/v2/send_pos_to_admin_for_approval',
    verify,
    asyncHandler(updateawaretokenhandler.handlers.sendPosToAdminForApprovalAsync));

router.post('/v2/delete_update_aware_token_po_line_async',
    verify,
    asyncHandler(updateawaretokenhandler.handlers.deleteUpdateAwareTokenPoLineAsync));


    router.get('/v2/for_CID',
     
        asyncHandler(updateawaretokenhandler.handlers.for_CID));

module.exports = router;


