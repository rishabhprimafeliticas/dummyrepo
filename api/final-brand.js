const express = require("express");
var asyncHandler = require('express-async-handler');
const { body, validationResult, check } = require('express-validator');
router = express.Router();;
var finalbrandhandler = require('../services/final-brand-handler');
const { verify } = require('../middleware');
const fs = require('fs'); 
const path = require('path');
var _ = require('lodash');
var multer = require('multer');
const axios = require('axios'); 
var limits = {
    // allow only 1 file per request
    fileSize: 7340032, // 2 MB (max file size)
};
var fileFilters = function (req, file, cb) {
    // supported image file mimetypes

    // console.log("req, file", file.mimetype);

    var allowedMimes = ['application/pdf', 'image/png', 'image/heif', 'image/jpg', 'image/jpeg', 'image/pjpeg', 'image/heic', 'application/octet-stream'];

    // console.log("allowedMimes", allowedMimes);

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

        // const originalname = file.originalname;
        // const extension = originalname.substring(originalname.lastIndexOf('.')); // Get file extension
        // const filename = originalname.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, ''); // Replace spaces and non-English characters
        // cb(null, Date.now() + filename + extension);
        cb(null, file.originalname);

    }
});
var upload2 = multer({

    fileFilter: fileFilters,
    storage: storage2,

});

// const ArrayOfImages = [
//     "https://openclipart.org/image/800px/348753",
//     "https://static.remove.bg/sample-gallery/graphics/bird-thumbnail.jpg"
//   ];

//   const uploadDirectory = path.join(__dirname, './uploads');
// if (!fs.existsSync(uploadDirectory)) {
//     fs.mkdirSync(uploadDirectory);
// }
//   const downloadImage = async (url, filename) => {
//     try {
//       const response = await axios.get(url);
//       fs.writeFile(path.join(uploadDirectory, filename), response.data, (err) => {
//         if (err) {
//           console.error('Error saving image', err);
//         } else {
//           console.log(`Image saved: ${filename}`);
//         }
//       });
//     } catch (error) {
//       console.error('Error downloading image:', error);
//     }
//   };

//   ArrayOfImages.forEach((url, index) => {
//     const fileName = `image_${index}.jpg`;
//     downloadImage(url, fileName);
//   });

// purchasr order section
router.post('/v2/create_product', upload.array('uploadedImages[]'),
    [], verify, asyncHandler(finalbrandhandler.handlers.createProductAsync));

router.post('/v2/import_product',
    [], verify, asyncHandler(finalbrandhandler.handlers.importProductAsync));


router.get('/v2/get_products',
    [], verify, asyncHandler(finalbrandhandler.handlers.getProductsAsync));
    // Api to get Archive Product in a list
    router.get('/v2/get_archive_products',
        [], verify, asyncHandler(finalbrandhandler.handlers.getArchiveProductsAsync));
    
router.get('/v2/get_product_details',
    [], verify, asyncHandler(finalbrandhandler.handlers.getProductDetailsAsync));
    router.post('/v2/delete_product',
        [
            check('_awareid').escape(),
            check('po_id').escape(),
        ],
        verify,
        asyncHandler(finalbrandhandler.handlers.deleteProductAsync));
    // Archive Product API
router.post('/v2/archive_product', [],
verify, asyncHandler(finalbrandhandler.handlers.archiveProductAsync));
  
router.post("/v2/update-productphoto-async", verify,
    upload.fields([{ name: "companyphotos", maxCount: 1 }]),
    asyncHandler(finalbrandhandler.handlers.updateProductPhotoOneAsync)
);

// purchase order list

router.post('/v2/create_purchase_order',
    [], verify, asyncHandler(finalbrandhandler.handlers.createPurchaseOrderAsync));

router.get('/v2/get_purchase_orders_async', verify,
    asyncHandler(finalbrandhandler.handlers.getPurchaseOrdersAsync));

router.get('/v2/get_purchase_orders_details', verify,
    asyncHandler(finalbrandhandler.handlers.getPurchaseOrderDetailsAsync));

router.post('/v2/create_purchase_order_details_async', upload2.single("upload_pdf"),
    [
    ],
    verify,
    asyncHandler(finalbrandhandler.handlers.createPurchaseOrderDetailsAsync));

//done
router.get('/v2/get_purchase_order_details_async', verify,
    asyncHandler(finalbrandhandler.handlers.getPurchaseOrderDeatilsAsync));

router.post('/v2/delete_purchase_order_async',
    verify,
    asyncHandler(finalbrandhandler.handlers.deletePurchaseOrderAsync));

router.post('/v2/create_product_lines_async', [],
    verify,
    asyncHandler(finalbrandhandler.handlers.createProductLineAsync));

//done
router.get('/v2/get_product_lines_async', verify,
    asyncHandler(finalbrandhandler.handlers.getProductLineAsync));
//varun
router.get('/v2/get_token_details',
    asyncHandler(finalbrandhandler.handlers.gettokendetailsAsync))

router.post('/v2/edit_product_lines_async', verify,
    asyncHandler(finalbrandhandler.handlers.editProductLineAsync));
//done
router.post('/v2/send_po_to_producer',
    [],
    verify,
    asyncHandler(finalbrandhandler.handlers.sendPoToProducer));

// //done
// router.get('/v2/get_digital_twin', verify,
//     asyncHandler(awaretokenhandler.handlers.getDigitalTwinAsync));

router.post("/v2/generateQR", verify,
    asyncHandler(finalbrandhandler.handlers.generateQR)
);
router.get('/v2/getqrCode',
    [
    ],
    verify,
    asyncHandler(finalbrandhandler.handlers.getqrCode));

router.post('/v2/deleteqr',
    [

    ],
    verify,
    asyncHandler(finalbrandhandler.handlers.deleteqrAsync));
router.post('/v2/generate_Update',
    [
    ],
    verify,
    asyncHandler(finalbrandhandler.handlers.generate_Update));


router.post('/v2/reset_purchase_order',
    [
        check('_awareid').escape(),
        check('type').escape(),
    ],
    verify,
    asyncHandler(finalbrandhandler.handlers.deleteResetPurchaseOrdersAsync));


router.post('/v2/deleteproductLine',
    verify,
    asyncHandler(finalbrandhandler.handlers.deleteproductLineAsync));

router.get('/v2/getproductLineslist',
    verify,
    asyncHandler(finalbrandhandler.handlers.getProductLinesAsync));

// varun's code
router.post('/v2/postSubBrandAysnc', verify, upload2.single('upload_file'),
    asyncHandler(finalbrandhandler.handlers.postSubBrandAysnc));


//Abhishek2.0
router.post('/v2/post_dpp_configurations_on_brand_level', [], verify,
    asyncHandler(finalbrandhandler.handlers.postDppConfigurationsOnBrandLevel));

//Abhishek2.0
router.post('/v2/reset_dpp_configurations_on_brand_level', [], verify,
    asyncHandler(finalbrandhandler.handlers.resetDppConfigurationOnBrandLevel));

//Abhishek2.0
router.post('/v2/post_dpp_configurations_on_product_level', [], verify,
    asyncHandler(finalbrandhandler.handlers.postDppConfigurationsOnProductLevel));

//Abhishek2.0
router.post('/v2/reset_dpp_configurations_on_product_level', [], verify,
    asyncHandler(finalbrandhandler.handlers.resetDppConfigurationsOnProductLevel));

router.post('/v2/deletesubbranddetails', verify,
    asyncHandler(finalbrandhandler.handlers.deleteSubBrandAsync));

router.post('/v2/updateEtdDetail', verify,
    asyncHandler(finalbrandhandler.handlers.updateEtdDetailsAsync));


router.post('/v2/alotproducttosubbrand', verify,
    asyncHandler(finalbrandhandler.handlers.AlotSubBrandToProductAsync));


//Shivam chauhan

router.post('/v2/add_hardGoodsProduct', upload.array('uploadedImages[]'),
    [], verify, asyncHandler(finalbrandhandler.handlers.add_hardGoodsProduct));

router.post('/v2/generateHardGoodsProductQR', verify, asyncHandler(finalbrandhandler.handlers.generateHardGoodsProductQR));



router.post('/v2/downloadHardGoodsProductQR', verify, asyncHandler(finalbrandhandler.handlers.downloadHardGoodsProductQR));

router.post('/v2/deletehardGoodsProduct', verify, asyncHandler(finalbrandhandler.handlers.deletehardGoodsProduct));

router.post('/v2/editDppSetting', verify, asyncHandler(finalbrandhandler.handlers.editDppSetting));

router.get('/v2/getAllhardGoodsProduct', verify, asyncHandler(finalbrandhandler.handlers.getAllhardGoodsProduct))

router.post('/v2/importHardGoodsProducts', upload.array('uploadedImages[]'),
    [], verify, asyncHandler(finalbrandhandler.handlers.importHardGoodsProducts));

router.post('/v2/import_generate_and_download_QR', verify, asyncHandler(finalbrandhandler.handlers.import_generate_and_download_QR));

router.post('/v2/delete_line_items',
    verify,
    asyncHandler(finalbrandhandler.handlers.delete_line_items));



//Shivam chauhan

module.exports = router;


