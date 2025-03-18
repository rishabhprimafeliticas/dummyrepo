const express = require("express");
var asyncHandler = require("express-async-handler");
const { body, validationResult, check } = require("express-validator");
router = express.Router();
var kychandler = require("../services/kyc-handler");
const { verify } = require("../middleware");
var _ = require("lodash");
var multer = require("multer");
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
    // cb(null,file.originalname.replace(/\s/g, "")+ "-" + Date.now());

    const originalname = file.originalname;
    const extension = originalname.substring(originalname.lastIndexOf('.'));
    const stringBeforeDot = originalname.substring(0, originalname.lastIndexOf('.'));
    var randomString = Math.random().toString(36).substr(2, 19);
    const filename = `${stringBeforeDot.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '')}${randomString}${extension}`
    cb(null, filename);


    // cb(null, Date.now() + "-" + file.originalname.replace(" ", ""));
  },
});

var upload = multer({
  limits: limits,
  fileFilter: fileFilters,
  storage: storage,
});

var profileStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});
var profileupload = multer({
  limits: limits,
  fileFilter: fileFilters,
  storage: profileStorage,

});

router.get("/v2/get-users-kyc-details", verify,
  asyncHandler(kychandler.handlers.getUsersKycDetailsAsync)
);
router.get("/v2/get-manager-kyc-details", verify,
  asyncHandler(kychandler.handlers.getManagerKycDetailsAsync)
);

router.post("/v2/updatekycasync",
  [
    // check("_id").escape(),
    // check("companyName")
    //   .not()
    //   .isEmpty()
    //   .isLength({ min: 3, max: 50 })
    //   .withMessage("I know you have it in you, Try again!")
    //   .escape(),
    // check("awareId")
    //   .not()
    //   .isEmpty()
    //   .withMessage("I know you have it in you, Try again!")
    //   .escape(),
    // check("website")
    //   .not()
    //   .isEmpty()
    //   .matches(
    //     /^((https?|ftp|smtp):\/\/)?(www.)?[a-z0-9_-]+(\.[a-z]{2,}){1,3}(#?\/?[a-zA-Z0-9#]+)*\/?(\?[a-zA-Z0-9-_]+=[a-zA-Z0-9-%]+&?)?$/
    //   )
    //   .withMessage("I know you have it in you, Try again!")
    //   .isLength({ max: 50 })
    //   .withMessage("I know you have it in you, Try again!"),
    // check("address1")
    //   .not()
    //   .isEmpty()
    //   .isLength({ min: 3, max: 60 })
    //   .withMessage("I know you have it in you, Try again!")
    //   .escape(),
    // check("address2")
    //   .optional({ checkFalsy: true })
    //   .isLength({ min: 3, max: 60 })
    //   .withMessage("I know you have it in you, Try again!")
    //   .escape(),
    // check("zip")
    //   .not()
    //   .isEmpty()
    //   .isLength({ min: 1, max: 15 })
    //   .withMessage("I know you have it in you, Try again!")
    //   .escape(),
    // // check("city")
    // //   .not()
    // //   .isEmpty()
    // //   .withMessage("I know you have it in you, Try again!")
    // //   .escape(),
    // // check("state")
    // //   .not()
    // //   .isEmpty()
    // //   .withMessage("I know you have it in you, Try again!")
    // //   .escape(),
    // check("country")
    //   .not()
    //   .isEmpty()
    //   .withMessage("I know you have it in you, Try again!")
    //   .escape(),
  ], verify,
  asyncHandler(kychandler.handlers.updateKycAsync)
);

router.post("/v2/update-kyc-cerificate-async",
  upload.single("certificate"), verify,
  asyncHandler(kychandler.handlers.updateKycCerificateAsync)
);

router.put("/v2/delete-certificate",
  [
    check("doc_id").notEmpty().withMessage("Name field is required"),
    // check("documentname").notEmpty().withMessage("Name field is required"),
    check("type").notEmpty().withMessage("Name field is required"),
  ], verify,
  asyncHandler(kychandler.handlers.deleteCertificateAsync)
);

router.post("/v2/update-kyc-tracer-async",
  upload.single("certificate"), verify,
  asyncHandler(kychandler.handlers.updateKycTracerAsync)
);

router.put("/v2/delete-tracer",
  [
    check("licenseNumber").notEmpty().withMessage("Name field is required"),
    check("type").notEmpty().withMessage("Name field is required"),
  ], verify,
  asyncHandler(kychandler.handlers.deleteTracerAsync)
);

router.post("/v2/update-companylogo-async",
  upload.fields([{ name: "companylogo", maxCount: 1 }]),
  verify,
  asyncHandler(kychandler.handlers.updateCompanyLogoAsync)
);

router.post("/v2/update-comapnypresentation-async",
  [],
  // upload.fields([{ name: "companypresentation", maxCount: 1 }]),
  verify,
  asyncHandler(kychandler.handlers.updateComapnyPresentationAsync)
);

router.post("/v2/update-companypdf-async",
  profileupload.fields([{ name: "companypdf", maxCount: 1 }]),
  
  asyncHandler(kychandler.handlers.updateCompanyPdfAsync)
);

router.post("/v2/update-companyphoto-async",
  profileupload.fields([{ name: "companyphotofile", maxCount: 1 }]),
  
  asyncHandler(kychandler.handlers.updateCompanyPhotoOneAsync)
);

router.post("/v2/delete-companyphoto-async",
  verify,
  asyncHandler(kychandler.handlers.deleteCompanyPhotoOneAsync)
);


router.post("/v2/delete-companypdf-async",
  verify,
  asyncHandler(kychandler.handlers.deleteCompanyPdfAsync)
);


router.post("/v2/agree-to-terms-async",
  [
    check("AcceptTerms")
      .not()
      .isEmpty()
      .withMessage("Required field.")
      .isBoolean()
      .withMessage("type error."),
  ], verify,
  asyncHandler(kychandler.handlers.updateTermsNConditionsAsync)
);

router.post("/v2/updateacknowledgementasync",
  [], verify,
  asyncHandler(kychandler.handlers.updateAcknowledgementAsync)
);

router.get("/v2/get-available-users-in-system", verify,
  asyncHandler(kychandler.handlers.getAvailableUsersInSystem)
);

router.get("/v2/get-producers", verify,
  asyncHandler(kychandler.handlers.getProducers)
);

//done
router.post('/v2/post_request',
  [
  ],
  verify,
  asyncHandler(kychandler.handlers.postRequestAsync));

router.get('/v2/get_sent_requests',
  [
  ],
  verify,
  asyncHandler(kychandler.handlers.getSentRequestsAsync));

router.get('/v2/get_received_requests',
  [
  ],
  verify,
  asyncHandler(kychandler.handlers.getReceivedRequestsAsync));



router.get('/v2/get_my_connections',
  [
  ],
  verify,
  asyncHandler(kychandler.handlers.getMyConnectionsAsync));


router.get('/v2/get_my_pendingRequests', [], verify,
  asyncHandler(kychandler.handlers.getMyAllPendingRequestsAsync));


router.post('/v2/accept_request',
  [
  ],
  verify,
  asyncHandler(kychandler.handlers.acceptRequestAsync));


router.post("/v2/request_reverification_async",
  [
    // check("AcceptTerms")
    //   .not()
    //   .isEmpty()
    //   .withMessage("Required field.")
    //   .isBoolean()
    //   .withMessage("type error."),
  ], verify,
  asyncHandler(kychandler.handlers.requestReverificationAsync)
);

router.get('/v2/certificate_expire_checker', [], verify,
  asyncHandler(kychandler.handlers.CertificateExpireCheckerForProducerAsync));

router.get('/v2/certificate_expire_checker_finalbrand', [], verify,
  asyncHandler(kychandler.handlers.CertificateExpireCheckerForFinalBrandAsync));
module.exports = router;
