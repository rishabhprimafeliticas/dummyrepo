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
    // const originalname = file.originalname;
    // const extension = originalname.substring(originalname.lastIndexOf('.')); // Get file extension
    // const filename = originalname.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, ''); // Replace spaces and non-English characters
    // cb(null, Date.now() + filename + extension);
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

//done
router.post(
  "/v2/create_select_receiver_async",
  [],
  verify,
  ensureSendTokenExists,
  ensureSendTokenEditableAndLock,
  asyncHandler(sendtokenhandler.handlers.selectReceiverAsync)
);

//done
router.get(
  "/v2/get_select_receiver",
  verify,
  asyncHandler(sendtokenhandler.handlers.getSelectedReceiverAsync)
);

router.get(
  "/v2/get_send_aw_token_details",
  verify,
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

//done
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

//done
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
  // upload2.array("proofs[]"),

  upload2.fields([
    { name: "delivery", maxCount: 10 }, // Adjust maxCount as needed
    { name: "packing", maxCount: 10 }, // Adjust maxCount as needed
    { name: "certificates", maxCount: 10 }, // Add another array for the additional PDFs
    { name: "labtests", maxCount: 10 },
    { name: "billoflading", maxCount: 10 },
  ]),
  // upload.single("packing_list_pdf"),
  verify,
  ensureSendTokenExists,
  ensureSendTokenEditableAndLock,
  asyncHandler(sendtokenhandler.handlers.selectProofOfDeliveryAsync)
);

//done
router.get(
  "/v2/get_proof_of_delivery_async",
  verify,
  asyncHandler(sendtokenhandler.handlers.getSelectedProofOfDeliveryAsync)
);

//done
router.post(
  "/v2/post_recap",
  [],
  verify,
  ensureSendTokenExists,
  ensureSendTokenEditableAndLock,
  asyncHandler(sendtokenhandler.handlers.postRecapAsync)
);

//done
router.get(
  "/v2/get_recap",
  verify,
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

//done
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

//product producer send token
router.get(
  "/v2/get_purchase_order",
  [],
  verify,
  asyncHandler(sendtokenhandler.handlers.getPurchaseOrdersAsync)
);

module.exports = router;
