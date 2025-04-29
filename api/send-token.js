const express = require("express");
var asyncHandler = require("express-async-handler");
const { body, validationResult, check } = require("express-validator");
router = express.Router();
var sendtokenhandler = require("../services/send-token-handler");
const { verify } = require("../middleware");
var _ = require("lodash");
var multer = require("multer");
const {
  ensureSendTokenEditableAndLock,
  ensureSendTokenAccessibleAndHandleDeleteLock,
  ensureSendTokenExists,
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
  "/v2/create_send_token_request",
  [],
  verify,
  asyncHandler(sendtokenhandler.handlers.createSendTokenRequestAsync)
);

router.get(
  "/v2/get_send_aware_token_requests_async",
  verify,
  asyncHandler(sendtokenhandler.handlers.getSendAwareTokenRequestsAsync)
);

router.get(
  "/v2/get_all_send_aware_token_requests_async",
  verify,
  asyncHandler(sendtokenhandler.handlers.getAllSendAwareTokenRequestsAsync)
);

router.post(
  "/v2/create_select_receiver_async",
  [],
  verify,
  ensureSendTokenExists,
  ensureSendTokenEditableAndLock,
  asyncHandler(sendtokenhandler.handlers.selectReceiverAsync)
);

router.get(
  "/v2/get_select_receiver",
  verify,
  asyncHandler(sendtokenhandler.handlers.getSelectedReceiverAsync)
);

router.get(
  "/v2/get_send_aw_token_details",
  verify,
  ensureSendTokenExists,
  asyncHandler(sendtokenhandler.handlers.getSendAwareTokenDetailsAsync)
);

router.post(
  "/v2/create_select_aware_token_async",
  [],
  verify,
  ensureSendTokenExists,
  ensureSendTokenEditableAndLock,
  asyncHandler(sendtokenhandler.handlers.selectAwareTokenAsync)
);

router.get(
  "/v2/get_aware_token_async",
  verify,
  asyncHandler(sendtokenhandler.handlers.getSelectedAwareTokenAsync)
);

router.post(
  "/v2/select_transaction_certificates_async",
  upload.single("certificate"),
  verify,
  ensureSendTokenExists,
  ensureSendTokenEditableAndLock,
  asyncHandler(sendtokenhandler.handlers.selectTransactionCertificatesAsync)
);

router.get(
  "/v2/get_transaction_certificates_async",
  verify,
  asyncHandler(sendtokenhandler.handlers.getTransactionCertificatesAsync)
);

router.post(
  "/v2/delete_transaction_certificates_async",
  upload.single("certificate"),
  verify,
  asyncHandler(sendtokenhandler.handlers.deleteTransactionCertificatesAsync)
);

router.post(
  "/v2/select_proof_of_delivery_async",

  upload2.fields([
    { name: "delivery", maxCount: 10 },
    { name: "packing", maxCount: 10 },
    { name: "certificates", maxCount: 10 },
    { name: "labtests", maxCount: 10 },
    { name: "billoflading", maxCount: 10 },
  ]),

  verify,
  ensureSendTokenExists,
  ensureSendTokenEditableAndLock,
  asyncHandler(sendtokenhandler.handlers.selectProofOfDeliveryAsync)
);

router.get(
  "/v2/get_proof_of_delivery_async",
  verify,
  asyncHandler(sendtokenhandler.handlers.getSelectedProofOfDeliveryAsync)
);

router.post(
  "/v2/post_recap",
  [],
  verify,
  ensureSendTokenExists,
  ensureSendTokenEditableAndLock,
  asyncHandler(sendtokenhandler.handlers.postRecapAsync)
);

router.get(
  "/v2/get_recap",
  verify,
  ensureSendTokenExists,
  asyncHandler(sendtokenhandler.handlers.getRecapAsync)
);

router.get(
  "/v2/get_crypto_tc",
  asyncHandler(sendtokenhandler.handlers.getCryptoTcDetailsRequestAsync)
);

router.get(
  "/v2/get_material_certificates",
  asyncHandler(sendtokenhandler.handlers.getMaterialCertificatesAsync)
);

router.post(
  "/v2/delete_send_aware_token",
  [check("_awareid").escape(), check("send_aware_token_id").escape()],
  verify,
  ensureSendTokenExists,
  ensureSendTokenAccessibleAndHandleDeleteLock,
  asyncHandler(sendtokenhandler.handlers.deleteSendAwareTokenAsync)
);

router.post(
  "/v2/reset_send_aware_token",
  [check("_awareid").escape(), check("type").escape()],
  verify,
  asyncHandler(sendtokenhandler.handlers.deleteResetSendAwareTokenAsync)
);

router.get(
  "/v2/get_purchase_order",
  [],
  verify,
  asyncHandler(sendtokenhandler.handlers.getPurchaseOrdersAsync)
);

module.exports = router;
