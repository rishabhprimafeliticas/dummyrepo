const express = require("express");
var asyncHandler = require("express-async-handler");
const { body, validationResult, check } = require("express-validator");
router = express.Router();
var adminhandler = require("../services/admin-common-handler");
const { verify } = require("../middleware");
var _ = require("lodash");
var multer = require("multer");
const {
  storeReqMiddleware,
  redisQueueMiddleware,
} = require("../middleware/redisMiddleware");

var limits = {
  files: 7, // allow only 1 file per request
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
    const originalname = file.originalname;
    const extension = originalname.substring(originalname.lastIndexOf("."));
    const stringBeforeDot = originalname.substring(
      0,
      originalname.lastIndexOf(".")
    );
    var randomString = Math.random().toString(36).substr(2, 19);
    const filename = `${stringBeforeDot
      .replace(/\s+/g, "_")
      .replace(/[^a-zA-Z0-9_]/g, "")}${randomString}${extension}`;
    cb(null, filename);

    // cb(null, file.originalname.replace(/\s/g, ""));
  },
});
var upload = multer({
  limits: limits,
  fileFilter: fileFilters,
  storage: storage,
});

router.get(
  "/v2/get-users",
  verify,
  asyncHandler(adminhandler.handlers.getUsersAsync)
);

router.get(
  "/v2/get-dashboard",
  verify,
  asyncHandler(adminhandler.handlers.getdashboard)
);

router.get(
  "/v2/get-dashboardkyc",
  verify,
  asyncHandler(adminhandler.handlers.getdashboardkyc)
);

router.get(
  "/v2/get-userbyId",
  verify,
  asyncHandler(adminhandler.handlers.getUserById)
);

router.post(
  "/v2/post-userbyId",
  verify,
  [],
  asyncHandler(adminhandler.handlers.updateUserDetail)
);

router.delete(
  "/v2/delete-userbyId",
  verify,
  [],
  asyncHandler(adminhandler.handlers.deleteUserDetail)
);

router.get(
  "/v2/get-kycusers",
  verify,
  asyncHandler(adminhandler.handlers.getUsersKycDetail)
);

router.get(
  "/v2/get-kycuser-detail",
  verify,
  asyncHandler(adminhandler.handlers.getUsersKycDetailsAsync)
);

router.get(
  "/v2/get-user-kyc-detail-view",
  verify,
  asyncHandler(adminhandler.handlers.getUserKycInformationAsync)
);

router.post(
  "/v2/post-kycuser-Status",
  verify,
  asyncHandler(adminhandler.handlers.updateKycStatus)
);

//create master
router.post(
  "/v2/post-masters_directories",
  verify,
  [],
  asyncHandler(adminhandler.handlers.postmasterAsync)
);

//get all master directories
router.get(
  "/v2/get-masters-directories",
  verify,
  asyncHandler(adminhandler.handlers.getallmastersasync)
);

// create master datas or sub
router.post(
  "/v2/post-master-data-names",
  verify,
  asyncHandler(adminhandler.handlers.postmasterdataAsync)
);
// get all the data of particular master
router.get(
  "/v2/get-masters-data",
  verify,
  asyncHandler(adminhandler.handlers.getmasterdataAsync)
);
router.get(
  "/v2/get-masters-data",
  verify,
  asyncHandler(adminhandler.handlers.getmasterdataHArdAsync)
);

router.post(
  "/v2/update-master-data-names",
  verify,
  [],
  asyncHandler(adminhandler.handlers.updatemasterdata)
);

router.delete(
  "/v2/delete-master-data",
  verify,
  [],
  asyncHandler(adminhandler.handlers.deletemasterdata)
);

// router.post("/v2/transfer-token",
//   verify,
//   asyncHandler(adminhandler.handlers.updateTokenStatusAndTransferAwareToken)
// );

router.post(
  "/v2/transfer-token",
  verify,
  storeReqMiddleware,
  redisQueueMiddleware,
  asyncHandler(adminhandler.handlers.updateTokenStatusAndTransferAwareToken)
);

router.post(
  "/v2/send-token",
  verify,
  asyncHandler(adminhandler.handlers.updateTokenStatusAndSendToken)
);

// router.post("/v2/update-transfer-token",
//   verify,
//   asyncHandler(adminhandler.handlers.updateTokenStatusAndTransferToken)
// );

// router.post("/v2/update-transfer-token",
//   verify,
//   asyncHandler(adminhandler.handlers.updateTokenStatusAndTransferUpdateAwareToken)
// );

router.post(
  "/v2/update-transfer-token",
  verify,
  storeReqMiddleware,
  redisQueueMiddleware,
  asyncHandler(
    adminhandler.handlers.updateTokenStatusAndTransferUpdateAwareToken
  )
);

//
router.post(
  "/v2/update-material-data",
  verify,
  asyncHandler(adminhandler.handlers.updateMaterialDataAsync)
);

router.post(
  "/v2/updatemanagerkycasync",
  // verify,
  asyncHandler(adminhandler.handlers.postManagerRegisterAsync)
);

router.post(
  "/v2/update-subscription-async",
  // verify,
  asyncHandler(adminhandler.handlers.postSubscriptionAsync)
);
router.get(
  "/v2/get-subscription-report-list",
  verify,
  asyncHandler(adminhandler.handlers.getSubscriptionReportDetail)
);

router.get(
  "/v2/get-finalbrand-dashboard-data",
  verify,
  asyncHandler(adminhandler.handlers.getParticularSubscriptionDetail)
);

router.get(
  "/v2/get-material-data-list",
  verify,
  asyncHandler(adminhandler.handlers.getMaterialDataListAsync)
);

router.delete(
  "/v2/delete-material-data",
  verify,
  [],
  asyncHandler(adminhandler.handlers.deleteMaterialDataAsync)
);

//// jan 3]
// create valuechainprocess

router.post(
  "/v2/post-valuechain-process",
  verify,
  asyncHandler(adminhandler.handlers.postvaluechainprocess)
);

// router.delete("/v2/delete-valuechain-process",
// verify,
// asyncHandler(adminhandler.handlers.deletevaluechainprocess));

router.get(
  "/v2/get-valuechain-process",
  verify,
  asyncHandler(adminhandler.handlers.getvaluechainprocess)
);

router.get(
  "/v2/token_minted_report",
  verify,
  asyncHandler(
    adminhandler.handlers.report_including_token_minted_and_update_per_account
  )
);
router.get(
  "/v2/get-exempted-email-list",
  verify,
  asyncHandler(adminhandler.handlers.getexemptedemaillist)
);
router.post(
  "/v2/update-exempted-email-data",
  verify,
  asyncHandler(adminhandler.handlers.postexemptedemail)
);
router.post(
  "/v2/delete-exempted-email-data",
  verify,
  asyncHandler(adminhandler.handlers.deleteexemptedemail)
);

router.get(
  "/v2/fetch-admin-wallet-balance",
  asyncHandler(adminhandler.handlers.getBalancesFromAdminWallet)
);

// varun code

router.post(
  "/v2/postSubUserRegisterAsync",
  // verify,
  asyncHandler(adminhandler.handlers.postSubUserRegisterAsync)
);
router.post(
  "/v2/deleteSubUserAsync",
  // verify,
  asyncHandler(adminhandler.handlers.deleteSubUserAsync)
);

module.exports = router;
