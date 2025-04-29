const express = require("express");
var asyncHandler = require("express-async-handler");
const { body, validationResult, check } = require("express-validator");
router = express.Router();
var updateawaretokenhandler = require("../services/update-aware-token-handler");
const { verify } = require("../middleware");
var _ = require("lodash");
var multer = require("multer");
const {
  ensureUpdateTokenExists,
  ensureUpdateTokenEditableAndLock,
  ensureUpdateTokenAccessibleAndHandleDeleteLock,
  ensurePoAccessibleWithLock,
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
  "/v2/update_aware_token",
  [],
  verify,
  asyncHandler(updateawaretokenhandler.handlers.updateAwareTokenAsync)
);

router.post(
  "/v2/create_draft_info_async",
  [],
  verify,
  asyncHandler(updateawaretokenhandler.handlers.createDraftInfoAsync)
);
router.post(
  "/v2/update_purchase_order_async",
  [],
  verify,
  ensureUpdateTokenExists,
  ensureUpdateTokenEditableAndLock,
  asyncHandler(updateawaretokenhandler.handlers.updatePurchaseOrderAsync)
);

router.get(
  "/v2/get_draft_info_list_async",
  verify,
  asyncHandler(updateawaretokenhandler.handlers.getDraftInfoListAsync)
);

router.get(
  "/v2/get_draft_info_async",
  verify,
  asyncHandler(updateawaretokenhandler.handlers.getDraftInfoAsync)
);

router.get(
  "/v2/get_updated_aware_token_async",
  verify,
  asyncHandler(updateawaretokenhandler.handlers.getUpdatedAwareTokensAsync)
);

router.get(
  "/v2/get_all_update_aware_token_async",
  verify,
  asyncHandler(updateawaretokenhandler.handlers.getAllUpdateAwareTokenAsync)
);

router.get(
  "/v2/get_all_update_aware_token_manager_async",
  verify,
  asyncHandler(
    updateawaretokenhandler.handlers.getallupdateAwareTokenManagerAsync
  )
);

router.post(
  "/v2/select_update_aware_token_type_async",
  [],
  verify,
  ensureUpdateTokenExists,
  ensureUpdateTokenEditableAndLock,
  asyncHandler(updateawaretokenhandler.handlers.selectUpdateAwareTokenTypeAsync)
);

router.get(
  "/v2/get_selected_update_aware_token_type_async",
  verify,
  asyncHandler(
    updateawaretokenhandler.handlers.getSelectedUpdateAwareTokenTypeAsync
  )
);

router.post(
  "/v2/update_physical_assest_async",
  [],
  verify,
  ensureUpdateTokenExists,
  ensureUpdateTokenEditableAndLock,
  asyncHandler(updateawaretokenhandler.handlers.updatePhysicalAssestAsync)
);

router.get(
  "/v2/get_updated_physical_assets",
  verify,
  asyncHandler(updateawaretokenhandler.handlers.getUpdatedPhyscialAssetsAsync)
);

router.post(
  "/v2/update_tracer",
  upload.single("update_pdf"),
  [],
  verify,
  ensureUpdateTokenExists,
  ensureUpdateTokenEditableAndLock,
  asyncHandler(updateawaretokenhandler.handlers.updateTracerAsync)
);

router.get(
  "/v2/get_updated_tracer",
  verify,
  asyncHandler(updateawaretokenhandler.handlers.getUpdatedTracerAsync)
);

router.post(
  "/v2/update_post_self_validation_async",
  upload2.array("uploadedImages[]"),
  [],
  verify,
  ensureUpdateTokenExists,
  ensureUpdateTokenEditableAndLock,
  asyncHandler(updateawaretokenhandler.handlers.updateSelfValidationAsync)
);

router.get(
  "/v2/get_updated_self_validation",
  verify,
  asyncHandler(updateawaretokenhandler.handlers.getUpdatedSelfValidationAsync)
);

router.post(
  "/v2/update_company_complinces_async",
  [check("_awareid").escape()],
  verify,
  ensureUpdateTokenExists,
  ensureUpdateTokenEditableAndLock,
  asyncHandler(updateawaretokenhandler.handlers.updateCompanyComplianceAsync)
);

router.get(
  "/v2/get_updated_company_compliance",
  verify,
  asyncHandler(updateawaretokenhandler.handlers.getUpdateCompanyComplianceAsync)
);

router.post(
  "/v2/post_updated_digital_twin",
  [],
  verify,
  ensureUpdateTokenExists,
  ensureUpdateTokenEditableAndLock,
  asyncHandler(updateawaretokenhandler.handlers.postUpdatedDigitalTwinAsync)
);

router.get(
  "/v2/get_updated_digital_twin",
  verify,
  ensureUpdateTokenExists,
  asyncHandler(updateawaretokenhandler.handlers.getUpdatedDigitalTwinAsync)
);

router.get(
  "/v3/get_updated_digital_twin",
  verify,
  asyncHandler(updateawaretokenhandler.handlers.getUpdatedDigitalTwinAsyncV3)
);

router.get(
  "/v2/get_my_final_brand_connections",
  [],
  verify,
  asyncHandler(updateawaretokenhandler.handlers.getMyFinalBrandConnectionsAsync)
);

router.post(
  "/v2/reset_update_aware_token",
  [check("_awareid").escape(), check("type").escape()],
  verify,
  asyncHandler(
    updateawaretokenhandler.handlers.deleteResetUpdateAwareTokenAsync
  )
);

router.post(
  "/v2/delete_update_aware_token",
  verify,
  ensureUpdateTokenExists,
  ensureUpdateTokenAccessibleAndHandleDeleteLock,
  asyncHandler(updateawaretokenhandler.handlers.deleteUpdateAwareTokenAsync)
);

router.get(
  "/v2/get_update_aw_token_details",
  verify,
  ensureUpdateTokenExists,
  asyncHandler(updateawaretokenhandler.handlers.getUpdateAwareTokenDetailsAsync)
);

router.get(
  "/v2/get_received_aware_tokens_async",
  verify,
  asyncHandler(updateawaretokenhandler.handlers.getReceivedAwareTokensAsync)
);

router.get(
  "/v2/get_historical_tracers_of_aware_asset",
  verify,
  asyncHandler(
    updateawaretokenhandler.handlers.getHistoricalTracersOfAwareAssetsAsync
  )
);

router.get(
  "/v2/get_update_digital_twin",
  verify,
  asyncHandler(updateawaretokenhandler.handlers.getUpdateDigitalTwinAsync)
);

router.get(
  "/v2/get_details_for_update_self_validation_certificate_async",
  verify,
  asyncHandler(
    updateawaretokenhandler.handlers
      .getDetailsForUpdateSelfValidationCertificateAsync
  )
);

router.get(
  "/v2/get_purchase_orders_async",
  verify,
  asyncHandler(
    updateawaretokenhandler.handlers.getparticularPurchaseOrdersFromBrandAsync
  )
);

router.get(
  "/v2/get_product_lines_async",
  verify,
  asyncHandler(updateawaretokenhandler.handlers.getProductLineFromBrandAsync)
);

router.get(
  "/v2/get_particular_product_line_async",
  verify,
  asyncHandler(
    updateawaretokenhandler.handlers.getParticularProductLineFromBrandAsync
  )
);

router.post(
  "/v2/send_pos_to_admin_for_approval",
  verify,
  ensurePoAccessibleWithLock,
  asyncHandler(updateawaretokenhandler.handlers.sendPosToAdminForApprovalAsync)
);

router.post(
  "/v2/delete_update_aware_token_po_line_async",
  verify,
  asyncHandler(
    updateawaretokenhandler.handlers.deleteUpdateAwareTokenPoLineAsync
  )
);

router.get(
  "/v2/for_CID",

  asyncHandler(updateawaretokenhandler.handlers.for_CID)
);

module.exports = router;
