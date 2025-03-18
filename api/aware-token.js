const express = require("express");
var asyncHandler = require("express-async-handler");
const { body, validationResult, check } = require("express-validator");
router = express.Router();
var awaretokenhandler = require("../services/aware-token-handler");
const { verify } = require("../middleware");
var _ = require("lodash");
var multer = require("multer");
var limits = {
  // allow only 1 file per request
  fileSize: 7340032, // 2 MB (max file size)
};
var fileFilters = function (req, file, cb) {
  // supported image file mimetypes
  var allowedMimes = [
    "application/pdf",
    "image/png",
    "image/heif",
    "image/jpg",
    "image/jpeg",
    "image/pjpeg",
    "image/heic",
  ];

  if (_.includes(allowedMimes, file.mimetype)) {
    // allow supported image files
    cb(null, true);
  } else {
    // throw error for invalid files
    cb(new Error("I know you have it in you, Try again!"));
    // return res.status(400).jsonp('I know you have it in you, Try again!')
  }
};
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
var upload = multer({
  fileFilter: fileFilters,
  storage: storage,
});

var storage2 = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    // const originalname = file.originalname;
    // const extension = originalname.substring(originalname.lastIndexOf('.')); // Get file extension
    // const filename = originalname.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, ''); // Replace spaces and non-English characters
    // cb(null, Date.now() + filename + extension);

    cb(null, file.originalname);
  },
});
var upload2 = multer({
  fileFilter: fileFilters,
  storage: storage2,
});

router.post(
  "/v2/create_aware_token",
  [],
  verify,
  asyncHandler(awaretokenhandler.handlers.createAwareTokenAsync)
);

router.get(
  "/v2/getawaretokenasync",
  verify,
  asyncHandler(awaretokenhandler.handlers.getAwareTokenAsync)
);

router.get(
  "/v2/get_aware_token_transaction_history_async",
  verify,
  asyncHandler(awaretokenhandler.handlers.getAwareTokenTransactionHistoryAsync)
);

router.get(
  "/v2/getapprovedawaretokenasync",
  verify,
  asyncHandler(awaretokenhandler.handlers.getApprovedAwareTokenAsync)
);

router.get(
  "/v2/getallawaretokenasync",
  verify,
  asyncHandler(awaretokenhandler.handlers.getallAwareTokenAsync)
);

router.get(
  "/v2/getallAwareTokenforParticularProducerAsync",
  verify,
  asyncHandler(
    awaretokenhandler.handlers.getallAwareTokenforParticularProducerAsync
  )
);

router.get(
  "/v2/getuserdetailsasync",
  verify,
  asyncHandler(awaretokenhandler.handlers.getUsersKycDetailsAsync)
);

router.get(
  "/v2/get_manager_details",
  verify,
  asyncHandler(awaretokenhandler.handlers.getManagersUserKycDetailsAsync)
);

router.post(
  "/v2/CheckAvailableAwareID",
  check("aware_id")
    .not()
    .isEmpty()
    .withMessage("I know you have it in you, Try again!")
    .escape(),
  verify,
  asyncHandler(awaretokenhandler.handlers.getAvailableAwareIDAsync)
);

router.post(
  "/v2/post_source_address_async",
  [
    // check('_awareid').escape(),
    // check('source_name').escape(),
    // check('address_line_one').escape(),
    // check('address_line_two').escape(),
    // check('country').escape(),
    // check('state').escape(),
    // check('city').escape(),
    // check('zipcode').escape()
  ],
  verify,
  asyncHandler(awaretokenhandler.handlers.storeSourceAddressAsync)
);

router.get(
  "/v2/getsourceaddressasync",
  verify,
  asyncHandler(awaretokenhandler.handlers.getSourceAddressAsync)
);

router.get(
  "/v2/getallsourceaddressesasync",
  verify,
  asyncHandler(awaretokenhandler.handlers.getAllSourceAddressesAsync)
);

router.post(
  "/v2/archivesource",
  asyncHandler(awaretokenhandler.handlers.archiveSource)
);

//done
router.post(
  "/v2/create_physical_assest_async",
  [
    // check('_awareid_t').not().isEmpty().withMessage("I know you have it in you, Try again!").escape(),
    // check('date_t').not().isEmpty().withMessage("I know you have it in you, Try again!").escape(),
    // // check('production_facility_t').not().isEmpty().withMessage("I know you have it in you, Try again!").escape(),
    // // check('value_chain_process_main').not().isEmpty().withMessage("I know you have it in you, Try again!").escape(),
    // // check('value_chain_process_sub').not().isEmpty().withMessage("I know you have it in you, Try again!").escape(),
    // check('aware_token_type_t').not().isEmpty().withMessage("I know you have it in you, Try again!").escape(),
    // // check('material_specs_t').not().isEmpty().withMessage("I know you have it in you, Try again!").escape(),
    // check('main_color_t').not().isEmpty().withMessage("I know you have it in you, Try again!").escape(),
    // check('select_main_color_t').not().isEmpty().withMessage("I know you have it in you, Try again!").escape(),
    // check('production_lot_t').not().isEmpty().withMessage("I know you have it in you, Try again!").escape(),
    // // check('compositionArrayMain').not().isEmpty().withMessage("I know you have it in you, Try again!").escape(),
    // check('weight_t').not().isEmpty().withMessage("I know you have it in you, Try again!").escape(),
    // check('sustainable_process_claim_t').not().isEmpty().withMessage("I know you have it in you, Try again!").escape(),
    // check('wet_processing_t').not().isEmpty().withMessage("I know you have it in you, Try again!").escape(),
    // // check('wet_processing').not().isEmpty().withMessage("I know you have it in you, Try again!").escape(),
    // // check('sustainable_process_certificates').not().isEmpty().withMessage("I know you have it in you, Try again!").escape(),
  ],
  verify,
  asyncHandler(awaretokenhandler.handlers.createPhysicalAssestAsync)
);

//done
router.get(
  "/v2/getphysicalassets",
  verify,
  asyncHandler(awaretokenhandler.handlers.getPhyscialAssetsAsync)
);

//done
router.post(
  "/v2/company_complinces_async",
  [
    check("_awareid").escape(),
    // check('environmental_scope_certificates').not().isEmpty().withMessage("I know you have it in you, Try again!").escape(),
    // check('social_compliance_certificates').not().isEmpty().withMessage("I know you have it in you, Try again!").escape(),
    // check('chemical_compliance_certificates').not().isEmpty().withMessage("I know you have it in you, Try again!").escape(),
  ],
  verify,
  asyncHandler(awaretokenhandler.handlers.createCompanyComplianceAsync)
);

//done
router.get(
  "/v2/getcompanycompliance",
  verify,
  asyncHandler(awaretokenhandler.handlers.getCompanyComplianceAsync)
);

//done
router.post(
  "/v2/post_self_validation_async",
  upload.array("uploadedImages[]"),
  [check("_awareid").escape()],
  verify,
  asyncHandler(awaretokenhandler.handlers.createSelfValidationAsync)
);

//done
router.get(
  "/v2/getselfvalidation",
  verify,
  asyncHandler(awaretokenhandler.handlers.getSelfValidationAsync)
);

//done
router.post(
  "/v2/reset_aware_token",
  [check("_awareid").escape(), check("type").escape()],
  verify,
  asyncHandler(awaretokenhandler.handlers.deleteResetAwareTokenAsync)
);

//done
router.post(
  "/v2/post_tracer",
  upload2.single("upload_pdf"),
  [],
  verify,
  asyncHandler(awaretokenhandler.handlers.createTracerAsync)
);

//done
router.get(
  "/v2/gettracer",
  verify,
  asyncHandler(awaretokenhandler.handlers.getTracerAsync)
);

//done
router.post(
  "/v2/post_digital_twin",
  [],
  verify,
  asyncHandler(awaretokenhandler.handlers.postDigitalTwinAsync)
);

//done
router.get(
  "/v2/get_digital_twin",
  verify,
  asyncHandler(awaretokenhandler.handlers.getDigitalTwinAsync)
);

//done
router.post(
  "/v2/delete_aware_token",
  [check("_awareid").escape(), check("aware_token_id").escape()],
  verify,
  asyncHandler(awaretokenhandler.handlers.deleteAwareTokenAsync)
);

//done
router.get(
  "/v2/get_aw_token_details",
  verify,
  asyncHandler(awaretokenhandler.handlers.getAwareTokenDetailsAsync)
);

router.get(
  "/v2/get_wallet_async",
  verify,
  asyncHandler(awaretokenhandler.handlers.getWalletAsync)
);

//done
router.get(
  "/v2/get_details_for_self_validation_certificate_async",
  verify,
  asyncHandler(
    awaretokenhandler.handlers.getDetailsForSelfValidationCertificateAsync
  )
);

//done
router.get(
  "/v2/get_purchase_orders_async",
  verify,
  asyncHandler(awaretokenhandler.handlers.getPurchaseOrdersFromBrandAsync)
);

//done
router.get(
  "/v2/get_purchase_order_details_async",
  verify,
  asyncHandler(
    awaretokenhandler.handlers.getParticularPurchaseOrdersFromBrandAsync
  )
);

//done
router.get(
  "/v2/get_product_lines_async",
  verify,
  asyncHandler(awaretokenhandler.handlers.getProductLineFromBrandAsync)
);

router.get(
  "/v2/get_wallet_export_async",
  asyncHandler(awaretokenhandler.handlers.getWalletExportAsync)
);

router.get(
  "/v2/get_pdetailed_wallet_export_async",
  asyncHandler(
    awaretokenhandler.handlers.getParticularProducerAllSentTokenAsync
  )
);

router.get(
  "/v2/getHelloAsync",
  asyncHandler(awaretokenhandler.handlers.getHelloAsync)
);

module.exports = router;
