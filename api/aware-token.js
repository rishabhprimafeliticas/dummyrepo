const express = require("express");
var asyncHandler = require("express-async-handler");
const { body, validationResult, check } = require("express-validator");
router = express.Router();
var awaretokenhandler = require("../services/aware-token-handler");
const { verify } = require("../middleware");
var _ = require("lodash");
var multer = require("multer");
const {
  ensureCreateTokenExists,
  ensureCreateTokenAccessibleAndHandleDeleteLock,
  ensureCreateTokenEditableAndLock,
} = require("../middleware/tokenLockMiddleware");
var limits = {
  fileSize: 7340032,
};
var fileFilters = function (req, file, cb) {
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
    cb(null, true);
  } else {
    cb(new Error("I know you have it in you, Try again!"));
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
  [],
  verify,
  asyncHandler(awaretokenhandler.handlers.storeSourceAddressAsync)
);

router.post(
  "/v2/post_production_address_async",
  verify,
  asyncHandler(awaretokenhandler.handlers.storeProductionAddressAsync)
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

router.post(
  "/v2/create_physical_assest_async",
  [],
  verify,
  ensureCreateTokenExists,
  ensureCreateTokenEditableAndLock,
  asyncHandler(awaretokenhandler.handlers.createPhysicalAssestAsync)
);

router.get(
  "/v2/getphysicalassets",
  verify,
  asyncHandler(awaretokenhandler.handlers.getPhyscialAssetsAsync)
);

router.post(
  "/v2/company_complinces_async",
  [check("_awareid").escape()],
  verify,
  ensureCreateTokenExists,
  ensureCreateTokenEditableAndLock,
  asyncHandler(awaretokenhandler.handlers.createCompanyComplianceAsync)
);

router.get(
  "/v2/getcompanycompliance",
  verify,
  asyncHandler(awaretokenhandler.handlers.getCompanyComplianceAsync)
);

router.post(
  "/v2/post_self_validation_async",
  upload.array("uploadedImages[]"),
  [check("_awareid").escape()],
  verify,
  ensureCreateTokenExists,
  ensureCreateTokenEditableAndLock,
  asyncHandler(awaretokenhandler.handlers.createSelfValidationAsync)
);

router.get(
  "/v2/getselfvalidation",
  verify,
  asyncHandler(awaretokenhandler.handlers.getSelfValidationAsync)
);

router.post(
  "/v2/reset_aware_token",
  [check("_awareid").escape(), check("type").escape()],
  verify,
  asyncHandler(awaretokenhandler.handlers.deleteResetAwareTokenAsync)
);

router.post(
  "/v2/post_tracer",
  upload2.single("upload_pdf"),
  [],
  verify,
  ensureCreateTokenExists,
  ensureCreateTokenEditableAndLock,
  asyncHandler(awaretokenhandler.handlers.createTracerAsync)
);

router.get(
  "/v2/gettracer",
  verify,
  asyncHandler(awaretokenhandler.handlers.getTracerAsync)
);

router.post(
  "/v2/post_digital_twin",
  [],
  verify,
  ensureCreateTokenExists,
  ensureCreateTokenEditableAndLock,
  asyncHandler(awaretokenhandler.handlers.postDigitalTwinAsync)
);

router.get(
  "/v1/traceability_report",
  verify,
  asyncHandler(awaretokenhandler.handlers.traceabilityReport)
);

router.get(
  "/v1/get_sankey_diagram_data",
  verify,
  asyncHandler(awaretokenhandler.handlers.getSankeyDiagramData)
);

router.get(
  "/v2/get_digital_twin",
  verify,
  ensureCreateTokenExists,
  asyncHandler(awaretokenhandler.handlers.getDigitalTwinAsync)
);

router.get(
  "/v2/get_token_statistics",
  asyncHandler(awaretokenhandler.handlers.getTokenStatisticsAsync)
);

router.get(
  "/v3/get_digital_twin",
  verify,
  asyncHandler(awaretokenhandler.handlers.getDigitalTwinAsyncV3)
);

router.post(
  "/v2/delete_aware_token",
  [check("_awareid").escape(), check("aware_token_id").escape()],
  verify,
  ensureCreateTokenExists,
  ensureCreateTokenAccessibleAndHandleDeleteLock,
  asyncHandler(awaretokenhandler.handlers.deleteAwareTokenAsync)
);

router.get(
  "/v2/get_aw_token_details",
  verify,
  ensureCreateTokenExists,
  asyncHandler(awaretokenhandler.handlers.getAwareTokenDetailsAsync)
);

router.get(
  "/v2/get_wallet_async",
  verify,
  asyncHandler(awaretokenhandler.handlers.getWalletAsync)
);

router.get(
  "/v2/get_details_for_self_validation_certificate_async",
  verify,
  asyncHandler(
    awaretokenhandler.handlers.getDetailsForSelfValidationCertificateAsync
  )
);

router.get(
  "/v2/get_purchase_orders_async",
  verify,
  asyncHandler(awaretokenhandler.handlers.getPurchaseOrdersFromBrandAsync)
);

router.get(
  "/v2/get_purchase_order_details_async",
  verify,
  asyncHandler(
    awaretokenhandler.handlers.getParticularPurchaseOrdersFromBrandAsync
  )
);

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
