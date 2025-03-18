const express = require("express");
var asyncHandler = require('express-async-handler');
const { check } = require('express-validator');
const loggerhandler = require('../logger/log');
router = express.Router();

var authhandler = require('../services/auth-handler');
var kycstatushandler = require('../models/kyc_status');
const { verify } = require("../middleware");



// var doaminmiddleware = require('../verify-doamin-middleware');

router.get("/v1/gettokensList",  
    asyncHandler(authhandler.handlers.gettokensList)
);

router.get("/v1/test_api",  
    asyncHandler(authhandler.handlers.testAsync)
);
router.get("/v1/gettokensList",  
    asyncHandler(authhandler.handlers.gettokensList)
);
router.get("/v1/getallcreatedtokenlist",  
    asyncHandler(authhandler.handlers.getAllCreatedTokenAsync)
);
router.get("/v1/getallsenttokenlist",  
    asyncHandler(authhandler.handlers.getAllSentTokenAsync)
);

router.post('/v1/user-onboarding',
    [
        check('fname').isLength({ min: 1, max: 26 }).withMessage("I know you have it in you, Try again!").trim().escape()
            .not().isEmpty().withMessage("I know you have it in you, Try again!"),
        check('lname').isLength({ min: 1, max: 26 }).withMessage("I know you have it in you, Try again!").trim().escape()
            .not().isEmpty().withMessage("I know you have it in you, Try again!"),
        check('email')
            .exists().withMessage("I know you have it in you, Try again!")
            .isEmail().withMessage("I know you have it in you, Try again!")
            .isLength({ max: 320 }).withMessage("I know you have it in you, Try again!"),
        check('role')
            .isNumeric().withMessage("I know you have it in you, Try again!")
            .isLength({ min: 1, max: 1 }).withMessage("I know you have it in you, Try again!"),
        // check('confirmpassword')
        //     .exists().withMessage("I know you have it in you, Try again!")
        //     .isLength({ min: 8, max: 16 }).withMessage("I know you have it in you, Try again!")
        //     .matches(/^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[A-Z])(?=.*[a-z]).{8,}$/).withMessage("I know you have it in you, Try again!"),
        check('termsnconditions')
            .not()
            .isEmpty().withMessage("I know you have it in you, Try again!")
            .isBoolean().withMessage("I know you have it in you, Try again!")
    ],  
    asyncHandler(authhandler.handlers.postUserRegisterAsync))

router.post('/v1/geetest',
    asyncHandler(authhandler.handlers.geeTestAsync))

router.post('/v1/login',
    [
        check('useremail')
            .exists().withMessage("I know you have it in you, Try again!")
            .isEmail().withMessage("I know you have it in you, Try again!")
            .isLength({ max: 320 }).withMessage("I know you have it in you, Try again!"),
        // check('password')
        //     .exists().withMessage("I know you have it in you, Try again!")
        //     .isLength({ min: 8, max: 16 }).withMessage("I know you have it in you, Try again!")
        //     .matches(/^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[A-Z])(?=.*[a-z]).{8,}$/).withMessage("I know you have it in you, Try again!"),
    ],  
    asyncHandler(authhandler.handlers.postUserAsync))

router.post('/v1/verifyemailaddress',  
    [], asyncHandler(authhandler.handlers.postVerifyEmailAddressAsync))

//rate limit applied
router.post('/v1/resendemailverificationmail',
    [
        check('useremail', "I know you have it in you, Try again!")
            .exists().withMessage("I know you have it in you, Try again!")
            .isEmail().withMessage("I know you have it in you, Try again!")
            .isLength({ max: 320 }).withMessage("I know you have it in you, Try again!"),
    ]
    ,  
    asyncHandler(authhandler.handlers.postResendVerificationMailAsync))

//rate limit applied
router.post('/v1/forgetpassword',
    [
        check('useremail', "I know you have it in you, Try again!")
            .exists().withMessage("I know you have it in you, Try again!")
            .isEmail().withMessage("I know you have it in you, Try again!")
            .isLength({ max: 320 }).withMessage("I know you have it in you, Try again!"),
    ],  
    asyncHandler(authhandler.handlers.postForgetVerificationMailAsync))

router.post('/v1/verifyforgetpasswordlink',  
    [], asyncHandler(authhandler.handlers.postVerifyForgetPasswordLinkAsync))

//rate limit applied
router.post('/v1/changepassword',
    [
        check('useremail', "I know you have it in you, Try again!")
            .exists().withMessage("I know you have it in you, Try again!")
            .isEmail().withMessage("I know you have it in you, Try again!")
            .isLength({ max: 320 }).withMessage("I know you have it in you, Try again!"),
        // check('password')
        //     .exists().withMessage("I know you have it in you, Try again!")
        //     .isLength({ min: 8, max: 16 }).withMessage("I know you have it in you, Try again!")
        //     .matches(/^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[A-Z])(?=.*[a-z]).{8,}$/).withMessage("I know you have it in you, Try again!"),
    ],  
    asyncHandler(authhandler.handlers.postChangePasswordAsync))

//rate limit applied
router.post('/v1/sendInvitation',
    [
        check('useremail', "I know you have it in you, Try again!")
            .exists().withMessage("I know you have it in you, Try again!")
            .isEmail().withMessage("I know you have it in you, Try again!")
            .isLength({ max: 320 }).withMessage("I know you have it in you, Try again!"),
    ],  
    asyncHandler(authhandler.handlers.postInvitationAsync))


//retreving data for product passport
router.get("/v1/some_useless_data",  
    asyncHandler(authhandler.handlers.getProductPassportDataAsync)
);

//retreving data for product passport
router.get("/v1/another_useless_data",  
    asyncHandler(authhandler.handlers.getKYCDataAsync)
);

router.get("/v1/find_virtual_id",  
    asyncHandler(authhandler.handlers.getVirtualIdAsync)
);

router.get("/v1/get_metarial_data",  
    asyncHandler(authhandler.handlers.getMetarialDataAsync)
);


router.get("/v1/find_old_virtual_id",  
    asyncHandler(authhandler.handlers.getOldVirtualIdAsync)
);
router.get("/v1/get_details_for_impact_self_validation_certificate_async",  
    asyncHandler(authhandler.handlers.getDetailsForimpactreportCertificateAsync)
);

router.get('/v1/getimpactqrCode',  
    asyncHandler(authhandler.handlers.getimpactqrCode));

router.post('/v1/sustaiable_data',  
    [], asyncHandler(authhandler.handlers.getsustainableAsync))

router.post('/v1/awareAssetData',  
    [], asyncHandler(authhandler.handlers.getAwareAssetDataAsync))


router.post('/v1/get-notifications',  
    [], asyncHandler(authhandler.handlers.getNotificationListAsync))

router.post('/v1/delete-Speicfic-notifications',  
    [], asyncHandler(authhandler.handlers.deleteSpecifiNotification))

router.post('/v1/update-notification-status',  
    [], asyncHandler(authhandler.handlers.updateNotificationStatusAsync))

router.post('/v1/notification-status-check',  
    [], asyncHandler(authhandler.handlers.NotificationStatusCheckerAsync))

router.get("/v1/total_token_created",  
    asyncHandler(authhandler.handlers.totalTokenCreated)
);

router.get('/v1/users_export',  
    asyncHandler(authhandler.handlers.usersExport));

// Deepak Code Start
router.post("/v1/feedback_form", [
    check('aware_id').escape(),
    check('feedback').escape(),
],  
    asyncHandler(authhandler.handlers.feedback_form)
);


//reetika code
router.post('/awa_036',  
    asyncHandler(authhandler.handlers.processCSV)
);

//reetika code
router.get('/update_subbrand',  
    asyncHandler(authhandler.handlers.updateSubbrands)
);

// Deepak Code Start

//Shivam chauhan 

 router.get('/v1/getParticularHardGoodsProduct',[], asyncHandler(authhandler.handlers.getParticularHardGoodsProduct));

 
module.exports = router;

