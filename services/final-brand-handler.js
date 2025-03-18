var mongoose = require('mongoose');
const { body, validationResult, check } = require('express-validator');
var kyc_details = require("../models/kyc_details");
var account_details = require("../models/account_details");

const { refresh } = require('../refresh-token');
const physical_assets = require('../models/physical_asset');
const company_compliances = require('../models/company_compliances');
const source_address = require('../models/source_address');
const self_validation = require('../models/self_validation');
const tracer = require('../models/tracer');
const aw_tokens = require('../models/aw_tokens');
const wallets = require('../models/wallets');
const products = require('../models/products');
const hardGoodsBrands = require('../models/hardGoodsBrands');
const generate_hard_good_qrs = require('../models/generate_hards_goods_qr')
const purchase_orders = require('../models/purchase_orders');
const purchase_order_details = require('../models/purchase_order_details');
const product_lines = require('../models/product_lines');
const qr_codes = require('../models/generate_qr');
var callstack = require("../scripts/call-stack");
var sgMail = require("../scripts/send-grid");
const generate_qr = require('../models/generate_qr');
const loggerhandler = require('../logger/log');
const notifications = require('../models/notifications');
const update_physical_asset = require('../models/update_physical_asset')
const update_aw_tokens = require('../models/update_aw_tokens');
const transaction_history = require('../models/transaction_history')
const transferred_tokens = require('../models/transferred-tokens')
const multer = require('multer');
const upSubBrandLogo = multer({ dest: '.uploads/' });
const moment = require('moment');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

exports.handlers = {


  // Products section
  // createProductAsync: async (req, res) => {
  //   console.log("reqqqq01", req.body)

  //   const errors = validationResult(req);
  //   if (!errors.isEmpty()) {
  //     return res.status(422).jsonp({ status: false, message: "Bad payload received." })
  //   }
  //   else {
  //     // let data = req.body.tostringify()
  //     // var pictureArray = [];
  //     // console.log("body", req.body)

  //     // console.log("files", req.files)
  //     // req.files.forEach(element => {
  //     //   let filename = element.filename
  //     //   pictureArray.push(filename.replace(/\s/g, ""))
  //     // });
  //     // console.log('pictureArray', pictureArray)
  //     var products_exist = null;
  //     if (req.body.product_id != 'null') {
  //       products_exist = await products.findOne({ _awareid: req.body._awareid, _id: mongoose.Types.ObjectId(req.body.product_id) }).catch((ex) => { loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`); return res.status(500).jsonp({ status: false, message: ex.toString() }) })

  //     }

  //     var payload = { username: req.headers.username };
  //     // console.log(req.body.sub_brand,'subBrand');
  //     refresh(req.headers.authorization, req.headers.userid, payload, function (resp) {
  //       if (resp.status == true) {
  //         // console.log("re.body", req.body)
  //         // console.log('req.body.sub_brand', req.body.sub_brand)
  //         if (products_exist) {
  //           products.findOneAndUpdate({ _awareid: req.body._awareid, _id: mongoose.Types.ObjectId(req.body.product_id) },
  //             {
  //               sub_brand: req.body.sub_brand,
  //               _awareid: req.body._awareid,
  //               item_number: req.body.item_number,
  //               description: req.body.description,
  //               color: req.body.color,
  //               info: req.body.info,
  //               care: req.body.care == 'null' ? null : req.body.care,
  //               weight: req.body.weight ? Number(req.body.weight) : null,
  //               // photos: pictureArray,
  //               status: req.body.sended_po_or_new_po == 'true' ? "SEND" : "CONCEPT",
  //               product_lock: req.body.product_lock,
  //               product_photo_1: req.body.product_photo_1 == 'null' ? null : req.body.product_photo_1,
  //               product_photo_2: req.body.product_photo_2 == 'null' ? null : req.body.product_photo_2,
  //               product_photo_3: req.body.product_photo_3 == 'null' ? null : req.body.product_photo_3,
  //               impact_data: req.body.impact_data == 'null' ? null : JSON.parse(req.body.impact_data),
  //               modified_on: new Date()

  //             },
  //             async function (err, purchaseorder) {
  //               // console.log("purchaseorder",purchaseorder)
  //               if (err) { loggerhandler.logger.error(`${err} ,email:${req.headers.email}`); return res.status(500).jsonp({ status: false, message: err.toString() }) }

  //               return res.status(200).jsonp({ status: true, message: "Product has been updated successfully", data: { "_id": products_exist._id, "_awareid": products_exist._awareid }, authorization: resp.token });

  //             })
  //         }
  //         else {
  //           products.create(
  //             {
  //               sub_brand: req.body.sub_brand,
  //               _awareid: req.body._awareid,
  //               item_number: req.body.item_number,
  //               description: req.body.description,
  //               color: req.body.color,
  //               product_lock: req.body.product_lock,
  //               info: req.body.info == 'null' ? null : req.body.info,
  //               care: req.body.care == 'null' ? null : req.body.care,
  //               weight: req.body.weight ? Number(req.body.weight) : null,
  //               // photos: pictureArray,req.body.product_photo_1 == 'null' ? null : req.body.product_photo_1,
  //               status: req.body.sended_po_or_new_po == 'true' ? "SEND" : "CONCEPT",
  //               product_photo_1: req.body.product_photo_1 == 'null' ? null : req.body.product_photo_1,
  //               product_photo_2: req.body.product_photo_2 == 'null' ? null : req.body.product_photo_2,
  //               product_photo_3: req.body.product_photo_3 == 'null' ? null : req.body.product_photo_3,
  //               impact_data: req.body.impact_data == 'null' ? null : JSON.parse(req.body.impact_data),
  //               created_date: new Date()
  //             },
  //             async function (err, purchaseorder) {
  //               if (err) { loggerhandler.logger.error(`${err} ,email:${req.headers.email}`); return res.status(500).jsonp({ status: false, message: err.toString() }) }
  //               return res.status(200).jsonp({ status: true, message: "Product has been added successfully", data: { "_id": purchaseorder._id, "_awareid": purchaseorder._awareid }, authorization: resp.token });
  //             })
  //         }
  //       }
  //       else {
  //         return res.status(resp.code).jsonp({ status: false, data: null, authorization: null });
  //       }
  //     });
  //   }
  // },

  createProductAsync: async (req, res) => {
    console.log("Request Body:", req.body);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).jsonp({ status: false, message: "Bad payload received." });
    }

    try {
      console.log("req.body.product_id", req.body.product_id);
      console.log("req.body._awareid", req.body._awareid);
      let products_exist = null;
      if (req.body.product_id !== 'null') {
        products_exist = await products.findOne({ _awareid: req.body._awareid, _id: mongoose.Types.ObjectId(req.body.product_id) })
          .catch((ex) => {
            loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
            return res.status(500).jsonp({ status: false, message: ex.toString() });
          });
      }
      console.log("products_exist", products_exist);
      const payload = { username: req.headers.username };

      // Refresh token logic
      refresh(req.headers.authorization, req.headers.userid, payload, async function (resp) {
        if (resp.status) {
          console.log("Refreshing token was successful.");

          // Prepare data for updating or creating product
          const productData = {
            sub_brand: req.body.sub_brand,
            _awareid: req.body._awareid,
            item_number: req.body.item_number,
            description: req.body.description,
            color: req.body.color,
            product_lock: req.body.product_lock,
            info: req.body.info === 'null' ? null : req.body.info,
            care: req.body.care === 'null' ? null : req.body.care,
            weight: req.body.weight ? Number(req.body.weight) : null,
            status: req.body.sended_po_or_new_po === 'true' ? "SEND" : "CONCEPT",
            product_photo_1: req.body.product_photo_1 === 'null' ? null : req.body.product_photo_1,
            product_photo_2: req.body.product_photo_2 === 'null' ? null : req.body.product_photo_2,
            product_photo_3: req.body.product_photo_3 === 'null' ? null : req.body.product_photo_3,
            archive: req.body.archive === 'null' ? false :  req.body.archive,
            impact_data: req.body.impact_data === 'null' ? null : JSON.parse(req.body.impact_data),
            modified_on: new Date(),
          };

          // console.log("productDataproductData",productData);
          // console.log("req.body.product_id",req.body.product_id);
          // If the product exists, update it
          var kyc_details_available = await kyc_details.findOne({ aware_id: req.body._awareid })?.select(["sub_brand"]).catch((ex) => { loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`); return res.status(500).jsonp({ status: false, message: ex.toString() }) })
          if (products_exist) {
            console.log('product', products_exist);
            var upadteproductcolor = kyc_details_available.sub_brand.map((item) => {
              if (item._id === req.body.sub_brand && products_exist.dpp_settings) {
                var dpp_setting = {}
                console.log('subbrand match', item);
                dpp_setting = {
                  ...products_exist.dpp_settings, // Spread the existing dpp_settings
                  header_background_color: item.dpp_settings.header_background_color, // Update with item values
                  button_accent_color: item.dpp_settings.button_accent_color, // Update with item values
                };
                return productData.dpp_settings = dpp_setting

              }
            })

            // console.log('deepakabc',products_exist);


            console.log('deepakabc', productData)


            await products.findOneAndUpdate(
              { _awareid: req.body._awareid, _id: mongoose.Types.ObjectId(req.body.product_id) },
              productData
            ).catch((err) => {
              loggerhandler.logger.error(`${err} ,email:${req.headers.email}`);
              return res.status(500).jsonp({ status: false, message: err.toString() });
            });

            // Generate the QR code after updating
            // console.log("req.body._awareid", req.body._awareid);
            // console.log("req.body.po_id", req.body.po_id);
            console.log("req_body12303", req.body);
            const body_data = req.body

            console.log("req.body.generate_qr_code", req.body.generate_qr_code, typeof (req.body.generate_qr_code));
            if (req.body.generate_qr_code == 'true') {
              console.log("working11223344");
              callstack.newQRCodeUpdating(req.body._awareid, body_data);
            }
            return res.status(200).jsonp({
              status: true,
              message: "Product has been updated successfully",
              data: { "_id": products_exist._id, "_awareid": products_exist._awareid },
              authorization: resp.token
            });



          } else {
            // Create a new product if it doesn't exist
            const newProduct = await products.create({
              ...productData,
              created_date: new Date(),
            }).catch((err) => {
              loggerhandler.logger.error(`${err} ,email:${req.headers.email}`);
              return res.status(500).jsonp({ status: false, message: err.toString() });
            });

            // Generate the QR code after creation

            // await callstack.newQRCodeUpdating(req.body._awareid, req.body.po_id, req.body);

            return res.status(200).jsonp({
              status: true,
              message: "Product has been added successfully",
              data: { "_id": newProduct._id, "_awareid": newProduct._awareid },
              authorization: resp.token
            });
          }
        } else {
          return res.status(resp.code).jsonp({ status: false, data: null, authorization: null });
        }
      });

    } catch (error) {
      loggerhandler.logger.error(`${error} ,email:${req.headers.email}`);
      return res.status(500).jsonp({ status: false, message: error.toString() });
    }
  },


  importProductAsync: async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).jsonp({ status: false, message: "Bad payload received." })
    }
    else {

      var data = req.body.importData;

      data.forEach((x) => {
        x.created_date = new Date();
      })

      console.log("data", data);

      var payload = { username: req.headers.username };
      refresh(req.headers.authorization, req.headers.userid, payload, function (resp) {
        if (resp.status == true) {

          products.create(data,
            async function (err, purchaseorder) {
              if (err) { loggerhandler.logger.error(`${err} ,email:${req.headers.email}`); return res.status(500).jsonp({ status: false, message: err.toString() }) }

              return res.status(200).jsonp({ status: true, message: "Product has been added successfully", data: { "_id": purchaseorder._id, "_awareid": purchaseorder._awareid }, authorization: resp.token });

            })
        }
        else {
          return res.status(resp.code).jsonp({ status: false, data: null, authorization: null });
        }
      });
    }
  },


  getProductsAsync: async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).jsonp({ status: false, message: "Bad payload received." })
    }
    else {

      var payload = { username: req.headers.username };
      refresh(req.headers.authorization, req.headers.userid, payload, async function (resp) {
        if (resp.status == true) {

          var products_data = await products.find({ _awareid: req.headers._awareid }).catch((ex) => { loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`); return res.status(500).jsonp({ status: false, message: ex.toString() }) })

          // console.log("products_data", products_data);
          var product_lines_send = await product_lines.find({ _awareid: req.headers._awareid, product_line_status: "SEND", deleted: false }).catch((ex) => { loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`); return res.status(400).jsonp({ status: false, message: "Bad request!" }); })

          // console.log("product_lines_send", product_lines_send);
          var tempproducts_data = [];
          products_data.forEach((ele) => {
            tempproducts_data.push((String)(mongoose.Types.ObjectId(ele._id)))
          })

          var temp_product_send_checkers1 = []

          product_lines_send.forEach((item) => {
            item.product_line.forEach(async (ele) => {
              temp_product_send_checkers1.push(ele.productid)
            })
          })
          // console.log("temp_product_send_checkers1", temp_product_send_checkers1);
          const filteredArray = tempproducts_data.filter(value => temp_product_send_checkers1.includes(value));

          filteredArray.forEach(async (ele) => {
            await products.findByIdAndUpdate({ _id: mongoose.Types.ObjectId(ele) }, { status: "SEND" }).catch((ex) => { loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`); return res.status(400).jsonp({ status: false, message: "Bad request!" }); })
          })

          var products_data_Updated = await products.find({ _awareid: req.headers._awareid }).catch((ex) => { loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`); return res.status(500).jsonp({ status: false, message: ex.toString() }) })
          var kyc_details_available = await kyc_details.findOne({ aware_id: req.headers._awareid })?.select(["sub_brand", "company_name", "company_logo", "website"]).catch((ex) => { loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`); return res.status(500).jsonp({ status: false, message: ex.toString() }) })


          let latest_data = products_data_Updated?.map((ele) => {

            var dpp_settings = ele.dpp_settings
              ? ele.dpp_settings // Return `ele.dpp_settings` if it exists
              : kyc_details_available?.sub_brand.find((e) => e._id == ele.sub_brand)?.dpp_settings || null; // Otherwise, find and return the value from `sub_brand`, or `null` if not found           


            // console.log({ kyc_details_available })
            return ({
              ...ele.toObject(),
              // sub_brand: dpp_settings == null ? kyc_details_available.company_name : kyc_details_available?.sub_brand.find((e) => e._id == ele.sub_brand)?.name || (ele.sub_brand == req.headers._awareid ? kyc_details_available?.company_name : ''),

              sub_brand: kyc_details_available?.sub_brand.find((e) => e._id == ele.sub_brand)?.name || (ele.sub_brand == req.headers._awareid ? kyc_details_available?.company_name : ''),
              sub_brand_id: ele.sub_brand,
              dpp_settings: dpp_settings,
              // brand_data: dpp_settings?.sub_brand?.find((e) => e._id == ele.sub_brand)?.brand_data || null,
              brand_data: kyc_details_available?.sub_brand?.find((e) => e._id == ele.sub_brand)?.brand_data || null,
              // no_dpp_settings_companylogo: dpp_settings == null ? kyc_details_available.company_logo : kyc_details_available?.sub_brand.find((e) => e._id == ele.sub_brand)?.logo || null,
              no_dpp_settings_companylogo: (kyc_details_available?.sub_brand.find((e) => e._id == ele.sub_brand)?.logo) || (kyc_details_available.company_logo) || null,

              website: kyc_details_available.website
            })
          })
          console.log("latest_data", latest_data.length, latest_data);

          // console.log("latest_data",latest_data)

          return res.status(200).jsonp({ status: true, data: latest_data, authorization: resp.token });

        }
        else {
          return res.status(resp.code).jsonp({ status: false, data: null, authorization: null });
        }
      });
    }
  },

  getArchiveProductsAsync: async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).jsonp({ status: false, message: "Bad payload received." });
    } else {

      var payload = { username: req.headers.username };
      refresh(req.headers.authorization, req.headers.userid, payload, async function (resp) {
        if (resp.status == true) {
          var products_not_archived = await products.find({ _awareid: req.headers._awareid, archive: { $ne: true } }).catch((ex) => {
            loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
            return res.status(500).jsonp({ status: false, message: ex.toString() });
          });

          // var products_not_archived = products_data.filter(product => product.archive !== true);

          var product_lines_send = await product_lines.find({
            _awareid: req.headers._awareid,
            product_line_status: "SEND",
            deleted: false
          }).catch((ex) => {
            loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
            return res.status(400).jsonp({ status: false, message: "Bad request!" });
          });

          var tempproducts_data = [];
          products_not_archived.forEach((ele) => {
            tempproducts_data.push((String)(mongoose.Types.ObjectId(ele._id)))
          });

          var temp_product_send_checkers1 = [];

          product_lines_send.forEach((item) => {
            item.product_line.forEach(async (ele) => {
              temp_product_send_checkers1.push(ele.productid);
            });
          });
          const filteredArray = tempproducts_data.filter(value => temp_product_send_checkers1.includes(value));

          filteredArray.forEach(async (ele) => {
            await products.findByIdAndUpdate({ _id: mongoose.Types.ObjectId(ele) }, { status: "SEND" }).catch((ex) => {
              loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
              return res.status(400).jsonp({ status: false, message: "Bad request!" });
            });
          });
          var products_data_Updated = await products.find({ _awareid: req.headers._awareid }).catch((ex) => {
            loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
            return res.status(500).jsonp({ status: false, message: ex.toString() });
          });

          var kyc_details_available = await kyc_details.findOne({ aware_id: req.headers._awareid })
            ?.select(["sub_brand", "company_name", "company_logo", "website"]).catch((ex) => {
              loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
              return res.status(500).jsonp({ status: false, message: ex.toString() });
            });

          let latest_data = products_data_Updated?.map((ele) => {

            var dpp_settings = ele.dpp_settings
              ? ele.dpp_settings
              : kyc_details_available?.sub_brand.find((e) => e._id == ele.sub_brand)?.dpp_settings || null;

            return ({
              ...ele.toObject(),
              sub_brand: kyc_details_available?.sub_brand.find((e) => e._id == ele.sub_brand)?.name || (ele.sub_brand == req.headers._awareid ? kyc_details_available?.company_name : ''),
              sub_brand_id: ele.sub_brand,
              dpp_settings: dpp_settings,
              brand_data: kyc_details_available?.sub_brand?.find((e) => e._id == ele.sub_brand)?.brand_data || null,
              no_dpp_settings_companylogo: (kyc_details_available?.sub_brand.find((e) => e._id == ele.sub_brand)?.logo) || (kyc_details_available.company_logo) || null,
              website: kyc_details_available.website
            });
          });

          latest_data = latest_data.filter(product => product.archive !== true);

          console.log("Filtered Products (not archived):", latest_data);

          return res.status(200).jsonp({ status: true, data: latest_data, authorization: resp.token });

        } else {
          return res.status(resp.code).jsonp({ status: false, data: null, authorization: null });
        }
      });
    }
  },



  getProductDetailsAsync: async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).jsonp({ status: false, message: "Bad payload received." })
    }
    else {
      var payload = { username: req.headers.username };
      refresh(req.headers.authorization, req.headers.userid, payload, async function (resp) {
        if (resp.status == true) {

          var products_data = await products.findOne({ _id: mongoose.Types.ObjectId(req.headers._id) }).catch((ex) => { loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`); return res.status(500).jsonp({ status: false, message: ex.toString() }) })

          return res.status(200).jsonp({ status: true, data: products_data, authorization: resp.token });

        }
        else {
          return res.status(resp.code).jsonp({ status: false, data: null, authorization: null });
        }
      });
    }
  },

  deleteProductAsync: async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).jsonp({ status: false, message: "Bad payload received." })
    }
    else {

      await products.deleteOne({ _awareid: req.body._awareid, _id: mongoose.Types.ObjectId(req.body.po_id) }).catch((ex) => { loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`); return res.status(500).jsonp({ status: false, message: ex.toString() }) })

      var payload = { username: req.headers.username };
      refresh(req.headers.authorization, req.headers.userid, payload, function (resp) {
        if (resp.status == true) {
          return res.status(200).jsonp({ status: true, message: "Selected products information has been deleted successfully", authorization: resp.token });
        }
        else {
          return res.status(resp.code).jsonp({ status: false, message: null, authorization: null });
        }
      });

    }
  },
  // Archive  product
  archiveProductAsync: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).jsonp({ status: false, message: "Bad payload received." });
    }

    const { _awareid, po_id, archive } = req.body;

    try {
      await products.updateOne(
        { _awareid: _awareid, _id: mongoose.Types.ObjectId(po_id) },
        { $set: { archive: archive } }
      );

      var payload = { username: req.headers.username };
      refresh(req.headers.authorization, req.headers.userid, payload, function (resp) {
        if (resp.status === true) {
          return res.status(200).jsonp({ status: true, message: archive ? "Product archived successfully." : "Product unarchived successfully.", authorization: resp.token });
        } else {
          return res.status(resp.code).jsonp({ status: false, message: null, authorization: null });
        }
      });
    } catch (ex) {
      loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
      return res.status(500).jsonp({ status: false, message: ex.toString() });
    }
  },

  updateProductPhotoOneAsync: async (req, res) => {
    if (
      !req.headers.userid ||
      !req.headers.username ||
      !req.headers.authorization
    ) {
      return res.status(400).jsonp({ status: false, message: "Bad request!" });
    } else {
      // if (!req.body._id) {
      //   return res.status(422).jsonp("I know you have it in you, Try again!");
      // }

      var pictureArray = [];
      req.files.forEach(element => {
        let filename = element.filename
        pictureArray.push(filename.replace(/\s/g, ""))
      });

      const map = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#x27;",
        "/": "&#x2F;",
      };
      const reg = /[&<>"'/]/gi;
      // var _id = req.body._id.replace(reg, (match) => map[match]);

      var payload = { username: req.headers.username };
      refresh(req.headers.authorization, req.headers.userid, payload, function (resp) {
        if (resp.status == true) {

          products.findOneAndUpdate({ _awareid: req.body._awareid, _id: mongoose.Types.ObjectId(req.body.product_id) },
            {
              // _awareid: req.body._awareid,
              // item_number: req.body.item_number,
              // description: req.body.description,
              // color: req.body.color,
              // info: req.body.info,
              photos: pictureArray,
              // status: "CONCEPT",
              // product_photo_1: req.files.length > 0 ? req.files[0].filename.replace(/\s/g, "") : products_exist.product_photo_1,
              // product_photo_2: req.files.length > 1 ? req.files[1].filename.replace(/\s/g, "") : products_exist.product_photo_2,
              // product_photo_3: req.files.length > 2 ? req.files[2].filename.replace(/\s/g, "") : products_exist.product_photo_3,

            },
            async function (err, purchaseorder) {
              // console.log("purchaseorder",purchaseorder)
              if (err) { loggerhandler.logger.error(`${err} ,email:${req.headers.email}`); return res.status(500).jsonp({ status: false, message: err.toString() }) }

              return res.status(200).jsonp({ status: true, message: "Selected products information has been updated successfully", data: { "_id": products_exist._id, "_awareid": products_exist._awareid }, authorization: resp.token });

            })

        }
        else {
          return res.status(resp.code).jsonp({ status: false, data: null, authorization: null });
        }
      });
    }
  },

  // Purchase order section
  createPurchaseOrderAsync: async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).jsonp({ status: false, message: "Bad payload received." })
    }
    else {

      var payload = { username: req.headers.username };
      refresh(req.headers.authorization, req.headers.userid, payload, function (resp) {
        if (resp.status == true) {

          purchase_orders.create(
            {
              _awareid: req.body._awareid,
              status: 'CONCEPT',
            },
            async function (err, user) {
              if (err) { loggerhandler.logger.error(`${err} ,email:${req.headers.email}`); return res.status(500).jsonp({ status: false, message: err.toString() }) }

              return res.status(200).jsonp({ status: true, data: { "_id": user._id, "_awareid": user._awareid }, authorization: resp.token });

            })

        }
        else {
          return res.status(resp.code).jsonp({ status: false, data: null, authorization: null });
        }
      });
    }
  },

  // getPurchaseOrdersAsync: async (req, res) => {

  //   const errors = validationResult(req);

  //   if (!errors.isEmpty()) {
  //     return res.status(422).jsonp(errors.array())
  //   }
  //   else {

  //     if (!req.headers.userid || !req.headers.username || !req.headers.authorization || !req.headers.awareid) {
  //       return res.status(400).jsonp({ status: false, message: "Bad request!" });
  //     }


  //     var payload = { username: req.headers.username };
  //     refresh(req.headers.authorization, req.headers.userid, payload, async function (resp) {
  //       if (resp.status == true) {

  //         var purchase_orders_avaliable = await purchase_orders.find({ _awareid: req.headers.awareid, deleted:false, hide: { $ne: true }, status: { $ne: "Approved" } }).catch((ex) => { loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`); return res.status(400).jsonp({ status: false, message: "Bad request!" }); })

  //         if (purchase_orders_avaliable.length <= 0) {
  //           return res.status(200).jsonp({ status: true, data: null, authorization: resp.token });
  //         }
  //         else {

  //           var purchase_order_details_avaliable = await purchase_order_details.find({ _awareid: req.headers.awareid , deleted:false}).catch((ex) => { loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`); return res.status(400).jsonp({ status: false, message: "Bad request!" }); })
  //           var product_line_available = await product_lines.find({ _awareid: req.headers.awareid }).catch((ex) => { loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`); return res.status(400).jsonp({ status: false, message: "Bad request!" }); })


  //           // var tracer_avaliable = await tracer.find({}).catch((ex) => { return res.status(400).jsonp({ status: false, message: "Bad request!" }); })

  //           // var self_validation_avaliable = await self_validation.find({}).catch((ex) => { return res.status(400).jsonp({ status: false, message: "Bad request!" }); })

  //           // var company_compliances_avaliable = await company_compliances.find({}).catch((ex) => { return res.status(400).jsonp({ status: false, message: "Bad request!" }); })


  //           var jsonData = [];
  //           for (var i = 0; i < purchase_orders_avaliable.length; i++) {

  //             var temp_purchase_orders = purchase_orders_avaliable[i];

  //             var temp_purchase_order_details_avaliable = purchase_order_details_avaliable.find(x => x._awareid == temp_purchase_orders._awareid && x.po_id == temp_purchase_orders._id)
  //             var temp_product_line_available = product_line_available.find(x => x._awareid == temp_purchase_orders._awareid && x.po_id == temp_purchase_orders._id);



  //             let total_product_line = temp_product_line_available ? temp_product_line_available.product_line?.length : 0

  //             let product_line_inprogress = temp_product_line_available ? temp_product_line_available.product_line?.some(ele => ele.update_status != "SELECT") : false
  //             // var temp_tracer_avaliable = tracer_avaliable.find(x => x._awareid == temp_aw_token._awareid && x.aware_token_id == temp_aw_token._id)
  //             // var temp_self_validation_avaliable = self_validation_avaliable.find(x => x._awareid == temp_aw_token._awareid && x.aware_token_id == temp_aw_token._id)
  //             // var temp_company_compliances_avaliable = company_compliances_avaliable.find(x => x._awareid == temp_aw_token._awareid && x.aware_token_id == temp_aw_token._id)



  //             var jsonObject = {
  //               "purchase_orders": temp_purchase_orders,
  //               "purchase_order_details_avaliable": temp_purchase_order_details_avaliable ? temp_purchase_order_details_avaliable : null,
  //               total_product_line,
  //               product_line_inprogress
  //               // "tracer_avaliable": temp_tracer_avaliable ? temp_tracer_avaliable : null,
  //               // "self_validation_avaliable": temp_self_validation_avaliable ? temp_self_validation_avaliable : null,
  //               // "company_compliances_avaliable": temp_company_compliances_avaliable ? temp_company_compliances_avaliable : null
  //             }

  //             jsonData.push(jsonObject);
  //           }

  //           // console.log("jsonObject",jsonData)
  //           return res.status(200).jsonp({ status: true, data: jsonData, authorization: resp.token });

  //         }

  //       }
  //       else {
  //         return res.status(resp.code).jsonp({ status: false, data: null, authorization: null });
  //       }
  //     });
  //   }
  // },


  getPurchaseOrdersAsync: async (req, res) => {
    // console.log("SHIVAM WORKING FINE");

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).jsonp(errors.array())
    }
    else {

      if (!req.headers.userid || !req.headers.username || !req.headers.authorization || !req.headers.awareid) {
        return res.status(400).jsonp({ status: false, message: "Bad request!" });
      }


      var payload = { username: req.headers.username };
      refresh(req.headers.authorization, req.headers.userid, payload, async function (resp) {
        if (resp.status == true) {

          var purchase_orders_avaliable = await purchase_orders.find({ _awareid: req.headers.awareid, deleted: false, hide: { $ne: true }, status: { $ne: "Approved" } }).catch((ex) => { loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`); return res.status(400).jsonp({ status: false, message: "Bad request!" }); })

          // console.log("purchase_orders_avaliable", purchase_orders_avaliable);

          if (purchase_orders_avaliable.length <= 0) {
            return res.status(200).jsonp({ status: true, data: null, authorization: resp.token });
          }
          else {

            var purchase_order_details_avaliable = await purchase_order_details.find({ _awareid: req.headers.awareid, deleted: false }).catch((ex) => { loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`); return res.status(400).jsonp({ status: false, message: "Bad request!" }); })
            var product_line_available = await product_lines.find({ _awareid: req.headers.awareid, deleted: false }).catch((ex) => { loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`); return res.status(400).jsonp({ status: false, message: "Bad request!" }); })


            // var tracer_avaliable = await tracer.find({}).catch((ex) => { return res.status(400).jsonp({ status: false, message: "Bad request!" }); })

            // var self_validation_avaliable = await self_validation.find({}).catch((ex) => { return res.status(400).jsonp({ status: false, message: "Bad request!" }); })

            // var company_compliances_avaliable = await company_compliances.find({}).catch((ex) => { return res.status(400).jsonp({ status: false, message: "Bad request!" }); })


            var jsonData = [];
            for (var i = 0; i < purchase_orders_avaliable.length; i++) {

              var temp_purchase_orders = purchase_orders_avaliable[i];

              var temp_purchase_order_details_avaliable = purchase_order_details_avaliable.find(x => x._awareid == temp_purchase_orders._awareid && x.po_id == temp_purchase_orders._id)
              var temp_product_line_available = product_line_available.find(x => x._awareid == temp_purchase_orders._awareid && x.po_id == temp_purchase_orders._id);



              let total_product_line = temp_product_line_available && temp_product_line_available.product_line
                ? temp_product_line_available.product_line.filter(item => item.deleted === false).length
                : 0;

              // console.log("Total product lines with deleted = false:", total_product_line);

              let product_line_inprogress = temp_product_line_available ? temp_product_line_available.product_line?.some(ele => ele.update_status != "SELECT") : false
              // var temp_tracer_avaliable = tracer_avaliable.find(x => x._awareid == temp_aw_token._awareid && x.aware_token_id == temp_aw_token._id)
              // var temp_self_validation_avaliable = self_validation_avaliable.find(x => x._awareid == temp_aw_token._awareid && x.aware_token_id == temp_aw_token._id)
              // var temp_company_compliances_avaliable = company_compliances_avaliable.find(x => x._awareid == temp_aw_token._awareid && x.aware_token_id == temp_aw_token._id)



              var jsonObject = {
                "purchase_orders": temp_purchase_orders,
                "purchase_order_details_avaliable": temp_purchase_order_details_avaliable ? temp_purchase_order_details_avaliable : null,
                total_product_line,
                product_line_inprogress
                // "tracer_avaliable": temp_tracer_avaliable ? temp_tracer_avaliable : null,
                // "self_validation_avaliable": temp_self_validation_avaliable ? temp_self_validation_avaliable : null,
                // "company_compliances_avaliable": temp_company_compliances_avaliable ? temp_company_compliances_avaliable : null
              }

              jsonData.push(jsonObject);
            }

            // console.log("101jsonObject", jsonData)
            return res.status(200).jsonp({ status: true, data: jsonData, authorization: resp.token });

          }

        }
        else {
          return res.status(resp.code).jsonp({ status: false, data: null, authorization: null });
        }
      });
    }
  },



  getPurchaseOrderDetailsAsync: async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).jsonp(errors.array())
    }
    else {

      if (!req.headers.userid || !req.headers.username || !req.headers.authorization || !req.headers.awareid || !req.headers.po_id) {
        return res.status(400).jsonp({ status: false, message: "Bad request!" });
      }


      var payload = { username: req.headers.username };
      refresh(req.headers.authorization, req.headers.userid, payload, async function (resp) {
        if (resp.status == true) {

          var purchase_orders_avaliable = await purchase_orders.findOne({ _awareid: req.headers.awareid, _id: mongoose.Types.ObjectId(req.headers.po_id), deleted: false }).catch((ex) => { loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`); return res.status(400).jsonp({ status: false, message: "Bad request!" }); })

          if (!purchase_orders_avaliable) {
            return res.status(200).jsonp({ status: true, data: null, authorization: resp.token });
          }
          else {
            return res.status(200).jsonp({ status: true, data: purchase_orders_avaliable, authorization: resp.token });

          }
        }
        else {
          return res.status(resp.code).jsonp({ status: false, data: null, authorization: null });
        }
      });
    }
  },

  createPurchaseOrderDetailsAsync: async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).jsonp({ status: false, message: "Bad payload received." })
    }
    else {

      // console.log(req.body)
      // console.log(req.file)

      const purchase_order_details_exist = await purchase_order_details.findOne({ _awareid: req.body._awareid, po_id: req.body.po_id, deleted: false }).catch((ex) => { loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`); return res.status(500).jsonp({ status: false, message: ex.toString() }) })

      var payload = { username: req.headers.username };
      refresh(req.headers.authorization, req.headers.userid, payload, async function (resp) {
        if (resp.status == true) {
          let etd = req.body.etd ? moment(req.body.etd, 'DD/MM/YYYY').toDate() : new Date();
          console.log(req.body.etd, 'etd');

          if (purchase_order_details_exist) {

            await purchase_order_details.findOneAndUpdate({ _awareid: req.body._awareid, po_id: req.body.po_id, deleted: false },
              {
                _awareid: req.body._awareid,
                producer_aware_id: req.body.producer_aware_id,
                po_id: req.body.po_id,
                date: req.body.date,
                order_number: req.body.order_number,
                country: req.body.country,
                // geo_location:req.body.geo_location,
                address: req.body.address,
                etd: etd,
                producer: req.body.producer,
                brand: req.body.brand,
                upload_po_pdf: req.file ? req.file.filename.replace(/\s/g, "") : purchase_order_details_exist.upload_po_pdf,
                qrcode_status: req.body.qrcode_status
              },
              { new: true },
              async function (err, user) {
                if (err) { loggerhandler.logger.error(`${err} ,email:${req.headers.email}`); return res.status(500).jsonp({ status: false, message: err.toString() }) }

                await purchase_orders.findOneAndUpdate({ _awareid: req.body._awareid, _id: mongoose.Types.ObjectId(req.body.po_id), deleted: false }, { create_token_stepper: 2 }, { new: true }).catch((ex) => { loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`); return res.status(500).jsonp({ status: false, message: ex.toString() }) })

                return res.status(200).jsonp({ status: true, message: "Information entered on Purchase Order has been saved successfully", authorization: resp.token });
              })
          }
          else {

            await purchase_order_details.create({
              _awareid: req.body._awareid,
              producer_aware_id: req.body.producer_aware_id,
              po_id: req.body.po_id,
              date: req.body.date,
              order_number: req.body.order_number,
              country: req.body.country,
              // geo_location:req.body.geo_location,
              address: req.body.address,
              etd: etd,
              producer: req.body.producer,
              brand: req.body.brand,
              qrcode_status: req.body.qrcode_status,
              upload_po_pdf: req.file.filename.replace(/\s/g, "")


            }).catch((ex) => { loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`); return res.status(500).jsonp({ status: false, message: ex.toString() }) })

            await purchase_orders.findOneAndUpdate({ _awareid: req.body._awareid, _id: mongoose.Types.ObjectId(req.body.po_id), deleted: false }, { create_token_stepper: 2 }, { new: true }).catch((ex) => { loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`); return res.status(500).jsonp({ status: false, message: ex.toString() }) })
            return res.status(200).jsonp({ status: true, message: "Information entered on Purchase Order has been saved successfully", authorization: resp.token });

          }
        }
        else {
          return res.status(resp.code).jsonp({ status: false, message: null, authorization: null });
        }
      });



    }
  },

  getPurchaseOrderDeatilsAsync: async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).jsonp(errors.array())
    }
    else {

      if (!req.headers.userid || !req.headers.username || !req.headers.authorization || !req.headers.awareid || !req.headers.po_id) {
        return res.status(400).jsonp({ status: false, message: "Bad request!" });
      }

      var payload = { username: req.headers.username };
      refresh(req.headers.authorization, req.headers.userid, payload, async function (resp) {
        if (resp.status == true) {

          // var purchase_order_details_avaliable = await purchase_order_details.findOne({ _awareid: req.headers.awareid, po_id: req.headers.po_id, deleted:false }).catch((ex) => { loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`); return res.status(400).jsonp({ status: false, message: "Bad request!" }); })

          var purchase_order_details_avaliable = await purchase_order_details.aggregate([
            { $match: { _awareid: req.headers.awareid, po_id: req.headers.po_id, } },
            { "$addFields": { "poid": { "$toObjectId": "$po_id" } } },
            { $lookup: { from: "purchase_orders", localField: "poid", foreignField: "_id", as: "details_avaliable", }, },
            { $addFields: { details_avaliable: { $arrayElemAt: ["$details_avaliable", 0] } } },
            { $set: { "po_status": "$details_avaliable.status" } },
          ]).catch((ex) => { loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`); return res.status(400).jsonp({ status: false, message: "Bad request!" }); })


          if (purchase_order_details_avaliable?.length <= 0) {
            return res.status(200).jsonp({ status: true, data: null, authorization: resp.token });
          }
          else {
            return res.status(200).jsonp({ status: true, data: purchase_order_details_avaliable[0], authorization: resp.token });

          }

        }
        else {
          return res.status(resp.code).jsonp({ status: false, data: null, authorization: null });
        }
      });




    }
  },


  // modified by Harish Nishad
  deletePurchaseOrderAsync: async (req, res) => {

    const errors = validationResult(req);
    // console.log('hi', req.body)
    if (!errors.isEmpty()) {
      return res.status(422).jsonp({ status: false, message: "Bad payload received." })
    }
    else {
      var product_lines_length_exist_po_id = await product_lines.find({ _awareid: req.body._awareid, po_id: req.body.po_id, deleted: false }).catch((ex) => { loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`); return res.status(400).jsonp({ status: false, message: "Bad request!" }); })
      var tempproduct_lines_length_exist_po_id = [];
      product_lines_length_exist_po_id.forEach((item) => {
        item.product_line.forEach(async (ele) => {
          tempproduct_lines_length_exist_po_id.push(ele.w)
        })
      })

      var product_lines_finds = await product_lines.find({ _awareid: req.body._awareid, deleted: false }).catch((ex) => { return res.status(400).jsonp({ status: false, message: "Bad request!" }); })

      let total_temp_product_checker = []
      product_lines_finds.forEach((item) => {
        item.product_line.forEach(async (ele) => {
          total_temp_product_checker.push(ele.productid)
        })
      })

      for (var i = 0; i < tempproduct_lines_length_exist_po_id.length; i++) {

        const conceptmainhan = total_temp_product_checker.includes(tempproduct_lines_length_exist_po_id[i]);

        if (conceptmainhan) {
          var getconcetptcount = total_temp_product_checker.filter((val) => {
            return (val === tempproduct_lines_length_exist_po_id[i])
          }).length;
          // console.log("getconcetptcount", getconcetptcount);
          if (getconcetptcount == 1) {
            await products.findByIdAndUpdate({ _id: mongoose.Types.ObjectId(tempproduct_lines_length_exist_po_id[i]) }, { status: "CONCEPT" }).catch((ex) => { loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`); return res.status(400).jsonp({ status: false, message: "Bad request!" }); })
          } else {
            // console.log("Concept remaining")
          }
        } else {
          // console.log("conceptmainhan nhi hey", conceptmainhan)
        }
      }


      // let data = await product_lines.findOne({po_id: req.body.po_id,deleted:false});
      // console.log(data);
      // data.product_line.find((e)=>{
      //   if(e.update_status!='SELECT')return res.status(200).jsonp({ status: true, message: "Can't delete This PO", authorization: resp.token });
      // })
      // // console.log('why', tempproduct_lines_length_exist_po_id)
      // await purchase_orders.deleteOne({ _awareid: req.body._awareid, _id: mongoose.Types.ObjectId(req.body.po_id) }).catch((ex) => { loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`); return res.status(500).jsonp({ status: false, message: ex.toString() }) })

      // await purchase_order_details.deleteOne({ _awareid: req.body._awareid, po_id: req.body.po_id }).catch((ex) => { loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`); return res.status(500).jsonp({ status: false, message: ex.toString() }) })

      // await product_lines.deleteOne({ _awareid: req.body._awareid, po_id: req.body.po_id }).catch((ex) => { loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`); return res.status(500).jsonp({ status: false, message: ex.toString() }) })

      // await generate_qr.deleteOne({ _awareid: req.body._awareid, po_id: req.body.po_id }).catch((ex) => { loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`); return res.status(500).jsonp({ status: false, message: ex.toString() }) })

      var payload = { username: req.headers.username };
      refresh(req.headers.authorization, req.headers.userid, payload, async function (resp) {
        if (resp.status == true) {
          let data = await product_lines.findOne({ po_id: req.body.po_id, deleted: false });
          let dataIfAny = (data?.product_line?.some((e) => e.update_status != 'SELECT') || false)

          if (dataIfAny) {
            return res.status(200).jsonp({ status: false, message: "Can't delete This PO", authorization: resp.token });
          }
          // console.log('why', tempproduct_lines_length_exist_po_id)
          await purchase_orders.findOneAndUpdate({ _awareid: req.body._awareid, _id: mongoose.Types.ObjectId(req.body.po_id), deleted: false },
            { $set: { deleted: true } },
            { new: true }).catch((ex) => { loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`); return res.status(500).jsonp({ status: false, message: ex.toString() }) })



          await purchase_order_details.findOneAndUpdate({ _awareid: req.body._awareid, po_id: req.body.po_id, deleted: false },
            { $set: { deleted: true } },
            { new: true }).catch((ex) => { loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`); return res.status(500).jsonp({ status: false, message: ex.toString() }) })

          await product_lines.findOneAndUpdate({ _awareid: req.body._awareid, po_id: req.body.po_id, deleted: false },
            { $set: { deleted: true } },
            { new: true }).catch((ex) => { loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`); return res.status(500).jsonp({ status: false, message: ex.toString() }) })

          await generate_qr.findOneAndUpdate({ _awareid: req.body._awareid, po_id: req.body.po_id, deleted: false },
            { $set: { deleted: true } },
            { new: true }).catch((ex) => { loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`); return res.status(500).jsonp({ status: false, message: ex.toString() }) })


          return res.status(200).jsonp({ status: true, message: "Selected purchase order information has been deleted successfully", authorization: resp.token });
        }
        else {
          return res.status(resp.code).jsonp({ status: false, message: null, authorization: null });
        }
      });

    }
  },

  // modified by Harish Nishad
  createProductLineAsync: async (req, res) => {
    const errors = validationResult(req);
    console.log("reqqqqqqq", req.body);

    if (!errors.isEmpty()) {
      return res.status(422).jsonp({ status: false, message: "Bad payload received." })
    }
    else {
      req.body.product_line.forEach((item) => {
        item.existproduct = true
      })
      const product_lines_exist = await product_lines.findOne({ _awareid: req.body._awareid, po_id: req.body.po_id, deleted: false }).catch((ex) => {
        // console.log("ex", ex)
        loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
        return res.status(500).jsonp({ status: false, message: ex.toString() })
      })

      var payload = { username: req.headers.username };
      refresh(req.headers.authorization, req.headers.userid, payload, async function (resp) {
        if (resp.status == true) {
          if (product_lines_exist) {

            if (product_lines_exist.product_line_status == "SEND") {
              return res.status(200).json({ status: true, authorization: null, message: "The purchase order has already been sent to the product producer" });
            }

            product_lines.findOneAndUpdate({ _awareid: req.body._awareid, po_id: req.body.po_id, deleted: false },
              {
                _awareid: req.body._awareid,
                po_id: req.body.po_id,
                product_line: req.body.product_line,
                product_line_status: 'CONCEPT'

              },
              { new: true },
              async function (err, user) {
                if (err) { loggerhandler.logger.error(`${err} ,email:${req.headers.email}`); return res.status(500).jsonp({ status: false, message: err.toString() }) }

                var product_lines_finds = await product_lines.find({ _awareid: req.body._awareid, status: "CONCEPT", deleted: false }).catch((ex) => { loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`); return res.status(400).jsonp({ status: false, message: "Bad request!" }); })
                var product_avaliable = await products.find({ _awareid: req.body._awareid, status: "CONCEPT" }).catch((ex) => { loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`); return res.status(400).jsonp({ status: false, message: "Bad request!" }); })
                // console.log('product_lines_avaliable2', product_lines_finds.length)
                product_lines_finds.forEach(async (item) => {
                  await item.product_line.forEach(async (val) => {
                    await product_avaliable.forEach(async (ele) => {
                      if (val.productid === ((String)(mongoose.Types.ObjectId(ele._id)))) {
                        await products.findOneAndUpdate({ _awareid: req.body._awareid, _id: mongoose.Types.ObjectId(val.productid) }, { status: 'SEND' }, { new: true }).catch((ex) => { loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`); return res.status(400).jsonp({ status: false, message: "Bad request!" }); })
                      }
                    })
                  })
                });
                await purchase_order_details.findOneAndUpdate({ _awareid: req.body._awareid, po_id: req.body.po_id, deleted: false }, { qrcode_status: false }).catch((ex) => { loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`); return res.status(400).jsonp({ status: false, message: "Bad request!" }); })

                await purchase_orders.findOneAndUpdate({ _awareid: req.body._awareid, _id: mongoose.Types.ObjectId(req.body.po_id), deleted: false }, { create_token_stepper: 3 }, { new: true }).catch((ex) => { loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`); return res.status(500).jsonp({ status: false, message: ex.toString() }) })

                return res.status(200).jsonp({ status: true, message: "Information entered on line items has been saved successfully", authorization: resp.token });

              })
          }
          else {
            await product_lines.create({
              _awareid: req.body._awareid,
              po_id: req.body.po_id,
              product_line: req.body.product_line,
              product_line_status: 'CONCEPT'
            }).catch((ex) => {
              loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
              return res.status(500).jsonp({ status: false, message: ex.toString() })
            })
            var temparray = []
            var product_lines_finds = await product_lines.find({ _awareid: req.body._awareid, status: "CONCEPT", deleted: false }).catch((ex) => { loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`); return res.status(400).jsonp({ status: false, message: "Bad request!" }); })
            var product_avaliable = await products.find({ _awareid: req.body._awareid, status: "CONCEPT" }).catch((ex) => { loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`); return res.status(400).jsonp({ status: false, message: "Bad request!" }); })
            // console.log('product_lines_avaliable2', product_lines_finds.length)
            product_lines_finds.forEach(async (item) => {
              await item.product_line.forEach(async (val) => {
                await product_avaliable.forEach(async (ele) => {
                  if (val.productid === ((String)(mongoose.Types.ObjectId(ele._id)))) {
                    await products.findOneAndUpdate({ _awareid: req.body._awareid, _id: mongoose.Types.ObjectId(val.productid) }, { status: 'SEND' }, { new: true }).catch((ex) => { loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`); return res.status(400).jsonp({ status: false, message: "Bad request!" }); })
                  }
                })
              })
            });

            await purchase_orders.findOneAndUpdate({ _awareid: req.body._awareid, _id: mongoose.Types.ObjectId(req.body.po_id), deleted: false }, { create_token_stepper: 3 }, { new: true }).catch((ex) => { loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`); return res.status(500).jsonp({ status: false, message: ex.toString() }) })

            return res.status(200).jsonp({ status: true, message: "Information entered on line items has been saved successfully", authorization: resp.token });

          }

        }
        else {
          return res.status(resp.code).jsonp({ status: false, message: null, authorization: null });
        }
      });



    }
  },

  // modified by Harish Nishad
  // getProductLineAsync: async (req, res) => {

  //   const errors = validationResult(req);

  //   if (!errors.isEmpty()) {
  //     return res.status(422).jsonp(errors.array())
  //   }
  //   else {

  //     if (!req.headers.userid || !req.headers.username || !req.headers.authorization || !req.headers.awareid || !req.headers.po_id) {
  //       return res.status(400).jsonp({ status: false, message: "Bad request!" });
  //     }

  //     var payload = { username: req.headers.username };
  //     refresh(req.headers.authorization, req.headers.userid, payload, async function (resp) {
  //       if (resp.status == true) {

  //         var product_lines_avaliable = await product_lines.findOne({ _awareid: req.headers.awareid, po_id: req.headers.po_id ,deleted:false}).catch((ex) => { loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`); return res.status(400).jsonp({ status: false, message: "Bad request!" }); })


  //         console.log("product_lines_avaliable", product_lines_avaliable)
  //         if (!product_lines_avaliable) {
  //           return res.status(200).jsonp({ status: true, data: null, authorization: resp.token });
  //         }
  //         else {
  //           let product = product_lines_avaliable.toObject();
  //           for (let e of product.product_line) {
  //             if (e.update_aware_token_id) {
  //               let transferred_tokens_available = await transferred_tokens.findOne({ historical_update_aware_token_id: e.update_aware_token_id }).catch((ex) => { loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`); return res.status(400).jsonp({ status: false, message: "Bad request!" }); })
  //               e.historical_send_aw_tokens_id = transferred_tokens_available?.historical_send_aw_tokens_id;
  //             }
  //           }
  //           let final_data = [];
  //           console.log("get_product_lines_async", product.product_line);

  //           // Filter the product_line array where 'deleted' is false
  //           final_data = product.product_line.filter(item => item.deleted === false);

  //           console.log("final_datafinal_datafinal_data",final_data);
  //           if (final_data.length > 0) {
  //             console.log("Filtered data:", final_data);

  //             return res.status(200).jsonp({ status: true, data: final_data, authorization: resp.token });
  //           } else {
  //             console.log("No data found where deleted is false");

  //             return res.status(404).jsonp({ status: false, message: "No data found where deleted is false", authorization: resp.token });
  //           }

  //         }

  //       }
  //       else {
  //         return res.status(resp.code).jsonp({ status: false, data: null, authorization: null });
  //       }
  //     });




  //   }
  // },


  //Shivam chauhan

  getProductLineAsync: async (req, res) => {
    const errors = validationResult(req);

    // Handle validation errors
    if (!errors.isEmpty()) {
      return res.status(422).jsonp(errors.array());
    }

    // Check for required headers
    if (!req.headers.userid || !req.headers.username || !req.headers.authorization || !req.headers.awareid || !req.headers.po_id) {
      return res.status(400).jsonp({ status: false, message: "Bad request!" });
    }

    // Payload for refresh function
    var payload = { username: req.headers.username };

    // Call refresh and proceed only if successful
    refresh(req.headers.authorization, req.headers.userid, payload, async function (resp) {
      if (resp.status == true) {
        try {
          // Fetch product lines from database
          var product_lines_avaliable = await product_lines.findOne({ _awareid: req.headers.awareid, po_id: req.headers.po_id, deleted: false, 'product_line.deleted': false }).catch((ex) => {
            loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
            return res.status(400).jsonp({ status: false, message: "Bad request!" });
          });

          console.log("product_lines_avaliable", product_lines_avaliable);

          // If product lines not found, return null data
          if (!product_lines_avaliable) {
            return res.status(200).jsonp({ status: true, data: null, message: "Product line not found.", authorization: resp.token });
          }

          // Convert to object to allow modifications
          let product = product_lines_avaliable.toObject();

          // Fetch and add historical tokens to product lines if available
          await Promise.all(product.product_line.map(async (e) => {
            if (e.update_aware_token_id) {
              try {
                let transferred_tokens_available = await transferred_tokens.findOne({ historical_update_aware_token_id: e.update_aware_token_id }).catch((ex) => {
                  loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
                  return res.status(400).jsonp({ status: false, message: "Bad request!" });
                });
                e.historical_send_aw_tokens_id = transferred_tokens_available?.historical_send_aw_tokens_id;
              } catch (error) {
                console.error("Error fetching transferred tokens:", error);
              }
            }
          }));
          console.log("product.product_line", product);

          // Filter product_line where deleted is false
          let final_data = {
            ...product, // Spread the existing product data to maintain other fields like _id, _awareid, etc.
            product_line: product.product_line.filter(item => item.deleted == false) // Filter product_line where deleted is false
          };

          // console.log("final_data1", final_data, final_data.length);
          console.log("final_data.length2", typeof (final_data), final_data);

          return res.status(200).jsonp({ status: true, data: final_data, authorization: resp.token });

          // Return filtered data if found, otherwise return no data message
          // if (final_data.product_line.length > 0 ) {
          //   return res.status(200).jsonp({ status: true, data: final_data, authorization: resp.token });
          // } else {
          //   console.log("No data found where deleted is false");
          //   return res.status(404).jsonp({ status: false, message: "No data found where deleted is false", authorization: resp.token });
          // }
        } catch (ex) {
          // General error handling for the entire try block
          loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
          return res.status(500).jsonp({ status: false, message: "Internal server error", authorization: resp.token });
        }
      } else {
        return res.status(resp.code).jsonp({ status: false, data: null, authorization: null });
      }
    });
  },


  gettokendetailsAsync: async (req, res) => {

    var payload = { username: req.headers.username };
    refresh(req.headers.authorization, req.headers.userid, payload, async function (resp) {
      if (resp.status == true) {

        let update_aware_token_id = req.headers.update_aware_token_id;
        if (!update_aware_token_id) return res.status(400).jsonp({ status: false, message: "Bad request!" });

        const aw_tokens_avaliable = await update_aw_tokens.findById(update_aware_token_id).catch((ex) => { loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`); return res.status(400).jsonp({ status: false, message: "Bad request!" }); })
        const update_physical_asset_avaliable = await update_physical_asset.findOne({ update_aware_token_id }).catch((ex) => { loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`); return res.status(400).jsonp({ status: false, message: "Bad request!" }); })
        const transaction_history_available = await transaction_history.findOne({ update_aware_token_id }).catch((ex) => { loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`); return res.status(400).jsonp({ status: false, message: "Bad request!" }); })
        console.log(aw_tokens_avaliable?._awareid, 'awareid');

        if (update_physical_asset_avaliable || aw_tokens_avaliable) {
          let detaildata = {
            created_date: aw_tokens_avaliable?.created_date || 'N/A',
            total_tokens: aw_tokens_avaliable?.total_tokens || 'N/A',
            used_tokens: aw_tokens_avaliable?.used_tokens || 'N/A',
            balance: aw_tokens_avaliable.avaliable_tokens,
            updated_aware_asset_id: update_physical_asset_avaliable?.updated_aware_asset_id || 'N/A',
            type: aw_tokens_avaliable?.type_of_token || 'N/A',
            update_aware_token_id: req.headers.update_aware_token_id,
            _awareid: aw_tokens_avaliable?._awareid,
            transactionhash: transaction_history_available?.transactionHash || 'N/A',
            status: aw_tokens_avaliable?.status,
          };
          return res.status(200).jsonp({ status: true, data: detaildata, authorization: resp.token });
        }
        else {
          return res.status(resp.code).jsonp({ status: false, data: null, authorization: null });
        }
      } else {
        return res.status(resp.code).jsonp({ status: false, data: null, authorization: null });
      }
    }
    )
  },

  editProductLineAsync: async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).jsonp(errors.array())
    }
    else {

      if (!req.headers.userid || !req.headers.username || !req.headers.authorization) {
        return res.status(400).jsonp({ status: false, message: "Bad request!" });
      }

      var payload = { username: req.headers.username };
      refresh(req.headers.authorization, req.headers.userid, payload, async function (resp) {
        if (resp.status == true) {

          var product_lines_avaliable = await product_lines.findOneAndUpdate(
            { "product_line.id": req.body.id, deleted: false }, { $set: { "product_line.$.quantity": req.body.quantity } },
            { arrayFilters: [{ "product_line.id": req.body.id }], new: true }
          ).catch((ex) => { loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`); return res.status(400).jsonp({ status: false, message: "Bad request!" }); })

          // console.log("product_lines_avaliable", req.body.quantity, product_lines_avaliable)
          if (!product_lines_avaliable) {
            return res.status(200).jsonp({ status: true, data: null, authorization: resp.token });
          }
          else {
            let data = product_lines_avaliable?.product_line?.find((ele) => req.body.id == ele.id)
            let order_num = data?.order_number;
            let item_num = data?.item_number;
            let poId = product_lines_avaliable?.po_id;
            let purchase_order_detail = await purchase_order_details.findOne({ po_id: poId, deleted: false });
            let producer_id = purchase_order_detail.producer_aware_id;
            let kyc_detail = await kyc_details.findOne({ aware_id: purchase_order_detail._awareid });
            let company_name = kyc_detail.company_name;
            if (kyc_detail && order_num && item_num && producer_id) {
              await notifications.create({ notification_sent_to: producer_id, message: ` ${company_name} has updated order quantity for ${item_num} item number in ${order_num}` })
              return res.status(200).jsonp({ status: true, data: product_lines_avaliable, authorization: resp.token });
            }

            return res.status(resp.code).jsonp({ status: false, data: null, authorization: null });
          }

        }
        else {
          return res.status(resp.code).jsonp({ status: false, data: null, authorization: null });
        }
      }
      );




    }
  },

  // modified by Harish Nishad
  sendPoToProducer: async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).jsonp({ status: false, message: "Bad payload received." })
    }
    else {
      var payload = { username: req.headers.username };
      refresh(req.headers.authorization, req.headers.userid, payload, async function (resp) {
        if (resp.status == true) {
          await purchase_orders.findOneAndUpdate({ _awareid: req.body._awareid, _id: mongoose.Types.ObjectId(req.body.po_id), deleted: false }, { status: 'SEND' }, { new: true }).catch((ex) => { loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`); return res.status(400).jsonp({ status: false, message: "Bad request!" }); })
          await product_lines.findOneAndUpdate({ _awareid: req.body._awareid, po_id: req.body.po_id, deleted: false }, { product_line_status: 'SEND' }).catch((ex) => { loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`); return res.status(400).jsonp({ status: false, message: "Bad request!" }); });
          var purchase_orders_avaliable = await purchase_orders.find({ _awareid: req.body._awareid, status: "CONCEPT", deleted: false, hide: { $ne: true }, create_token_stepper: 1 }).catch((ex) => { loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`); return res.status(400).jsonp({ status: false, message: "Bad request!" }); })
          const output = [];
          const map = new Map();
          for (const item of purchase_orders_avaliable) {
            if (!map.has(mongoose.Types.ObjectId(item._id))) {
              map.set(mongoose.Types.ObjectId(item._id), true); // set any value to Map
              output.push(mongoose.Types.ObjectId(item._id));
            }
          }
          await purchase_orders.deleteMany({ _id: { $in: output } }).catch((ex) => { loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`); return res.status(400).jsonp({ status: false, message: "Bad request!" }); })
          //  notification
          let producers_details = await purchase_order_details.findOne({ _awareid: req.body._awareid, po_id: req.body.po_id, deleted: false }).select(['producer_aware_id', 'brand', 'order_number']);
          await notifications.create({ notification_sent_to: producers_details.producer_aware_id, message: `New PO ${producers_details.order_number} received from ${producers_details.brand}.` })

          return res.status(200).jsonp({ status: true, message: "Purchase Order has been sent successfully to selected Product Producer", authorization: resp.token });

        }
        else {
          return res.status(resp.code).jsonp({ status: false, message: null, authorization: null });
        }
      });

    }
  },







  //Harish Nishad
  // generateQR: async (req, res) => {
  //   const errors = validationResult(req);
  //   if (!errors.isEmpty()) {
  //     return res.status(422).jsonp(errors.array());
  //   }
  //   else {
  //     var payload = { username: req.headers.username };
  //     refresh(req.headers.authorization, req.headers.userid, payload, async function (resp) {
  //       if (resp.status == true) {


  //         const product_lines_exist = await product_lines.findOneAndUpdate({ _awareid: req.body._awareid, po_id: req.body.po_id }, { $set: { 'product_line.$[].generated': true } }, { new: true }).catch((ex) => { loggerhandler.logger.error(`${ex}, email:${req.headers.email}`); return res.status(500).jsonp({ status: false, message: ex.toString() }); });
  //         // const product_lines_exist = await product_lines.findOne({ _awareid: req.body._awareid, po_id: req.body.po_id ,deleted:false}).catch((ex) => {loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`); return res.status(500).jsonp({ status: false, message: ex.toString() }) })
  //         console.log("product_lines_exist", product_lines_exist);
  //         if (product_lines_exist) {


  //           // var temparray = [];
  //           // var tempobj = {};
  //           // product_lines_exist.product_line.forEach((item) => {
  //           //   tempobj = {
  //           //     id: item.id,
  //           //     order_number: item.order_number,
  //           //     product: item.product,
  //           //     color: item.color,
  //           //     quantity: item.quantity,
  //           //     item_number: item.item_number,
  //           //     description: item.description,
  //           //     productid: item.productid,
  //           //     existproduct: item.existproduct,
  //           //     update_aware_token_id: item.update_aware_token_id,
  //           //     update_status: item.update_status,
  //           //     generated: true
  //           //     // generated: false //Abhishek

  //           //   }
  //           //   temparray.push(tempobj);
  //           // })
  //           // console.log("temparray", temparray);{qrcode_status:true}
  //           // console.log({ product_lines_exist })
  //           await purchase_order_details.findOneAndUpdate({ _awareid: req.body._awareid, po_id: req.body.po_id, deleted:false }, { qrcode_status: true }).catch((ex) => { loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`); return res.status(400).jsonp({ status: false, message: "Bad request!" }); })

  //           // await product_lines.findOneAndUpdate({ _awareid: req.body._awareid, po_id: req.body.po_id ,deleted:false}, { product_line: temparray })
  //           const output = [];
  //           const map = new Map();
  //           for (const item of product_lines_exist.product_line) {
  //             if (!map.has(item.id.toString())) {
  //               map.set(item.id.toString(), true); // set any value to Map
  //               output.push(item.id.toString());
  //             }
  //           }



  //           await Promise.allSettled(
  //             output.map(async (id) => {
  //               await callstack.updatingQR(req.body._awareid, req.body.po_id, id, req);
  //             })
  //           ).catch((error) => {
  //             loggerhandler.logger.error(`${error} ,email:${req.headers.email}`);
  //           })
  //           return res.status(200).jsonp({ status: true, message: "QR Codes have been generated successfully", authorization: resp.token });

  //         } else {
  //           return res.status(200).jsonp({ status: true, message: "Product Line is not exist", authorization: resp.token });
  //         }



  //       }
  //       else {
  //         return res.status(resp.code).jsonp({ status: false, message: null, authorization: null });
  //       }
  //     });



  //   }

  // },

  //Shivam chauhan

  generateQR: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).jsonp(errors.array());
    }

    const payload = { username: req.headers.username };

    try {
      // Verify token and user
      const resp = await new Promise((resolve, reject) => {
        refresh(req.headers.authorization, req.headers.userid, payload, (resp) => {
          if (resp.status) resolve(resp);
          else reject({ status: false, code: resp.code });
        });
      });

      // Find and update product lines
      const product_lines_exist = await product_lines.findOneAndUpdate(
        { _awareid: req.body._awareid, po_id: req.body.po_id, deleted: false },
        { $set: { 'product_line.$[].generated': true } },
        { new: true }
      ).catch((ex) => {
        loggerhandler.logger.error(`${ex}, email:${req.headers.email}`);
        return res.status(500).jsonp({ status: false, message: ex.toString() });
      });

      if (!product_lines_exist) {
        return res.status(200).jsonp({ status: true, message: "Product Line is not exist", authorization: resp.token });
      }

      // Update purchase order details for QR code status
      await purchase_order_details.findOneAndUpdate(
        { _awareid: req.body._awareid, po_id: req.body.po_id, deleted: false },
        { qrcode_status: true }
      ).catch((ex) => {
        loggerhandler.logger.error(`${ex}, email:${req.headers.email}`);
        return res.status(400).jsonp({ status: false, message: "Bad request!" });
      });

      // Get unique product IDs to avoid redundant updates
      const uniqueProductIds = [...new Set(product_lines_exist.product_line.map(item => item.id.toString()))];

      // Use Promise.all for concurrent execution of updating QR codes



      // await Promise.all(
      //   uniqueProductIds.map(async (id) => {
      //     try {
      //       await callstack.updatingQR(req.body._awareid, req.body.po_id, id, req);
      //     } catch (error) {
      //       loggerhandler.logger.error(`${error}, email:${req.headers.email}`);
      //     }
      //   })
      // );


      const results = await Promise.all(
        uniqueProductIds.map(async (id) => {
          try {
            const result = await callstack.updatingQR(req.body._awareid, req.body.po_id, id, req);
            return result.final_brand_name; // Extract final_brand_name
          } catch (error) {
            loggerhandler.logger.error(`${error}, email:${req.headers.email}`);
            return null; // Handle errors gracefully
          }
        })
      );

      // Filter out null values
      const validBrandNames = results.filter(name => name !== null);
      console.log("Final Brand Names:", validBrandNames);

      return res.status(200).jsonp({ status: true, message: "QR Codes have been generated successfully", authorization: resp.token, brand_names: validBrandNames });

    } catch (error) {
      if (error.status === false) {
        return res.status(error.code).jsonp({ status: false, message: null, authorization: null });
      }
      loggerhandler.logger.error(`${error}, email:${req.headers.email}`);
      return res.status(500).jsonp({ status: false, message: "Internal server error" });
    }
  },


  //Harish Nishad
  // getqrCode: async (req, res) => {
  //   const errors = validationResult(req);
  //   if (!errors.isEmpty()) {
  //     return res.status(422).jsonp(errors.array());
  //   }
  //   else {
  //     var payload = { username: req.headers.username };
  //     refresh(req.headers.authorization, req.headers.userid, payload, async function (resp) {
  //       if (resp.status == true) {

  //         // var product_lines_exists = await product_lines.findOne({ _awareid: req.headers._awareid, po_id: req.headers.po_id,deleted:false }).catch((ex) => {loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`); return res.status(500).jsonp({ status: false, message: ex.toString() }) })

  //         // if (product_lines_exists) {

  //         //   var tempdeletearray = [];
  //         //   var tempdelobj = {};

  //         //   product_lines_exists.product_line.forEach((item) => {

  //         //     if (item.id === req.headers.product_line) {

  //         //       tempdelobj = {
  //         //         id: item.id,
  //         //         order_number: item.order_number,
  //         //         product: item.product,
  //         //         color: item.color,
  //         //         quantity: item.quantity,
  //         //         item_number: item.item_number,
  //         //         description: item.description,
  //         //         generated: item.generated,
  //         //         productid: item.productid,
  //         //         update_aware_token_id: item.update_aware_token_id,
  //         //         update_status: item.update_status,
  //         //         existproduct: item.existproduct
  //         //       }
  //         //       tempdeletearray.push(tempdelobj);
  //         //     }
  //         //     else if (item.id !== req.headers.product_line) {

  //         //       tempdelobj = {
  //         //         id: item.id,
  //         //         order_number: item.order_number,
  //         //         product: item.product,
  //         //         color: item.color,
  //         //         quantity: item.quantity,
  //         //         item_number: item.item_number,
  //         //         description: item.description,
  //         //         generated: item.generated,
  //         //         productid: item.productid,
  //         //         existproduct: item.existproduct,
  //         //         update_aware_token_id: item.update_aware_token_id,
  //         //         update_status: item.update_status,
  //         //       }
  //         //       tempdeletearray.push(tempdelobj);
  //         //     }
  //         //     else {

  //         //     }
  //         //   })

  //         //   await product_lines.findOneAndUpdate({ _awareid: req.headers._awareid, po_id: req.headers.po_id,deleted:false }, { product_line: tempdeletearray })
  //         // }
  //         // else {
  //         //   return res.status(200).jsonp({ status: true, message: "product Line is Not Exists", data: null, authorization: resp.token });
  //         // }



  //         // const qr_code_exist = await qr_codes.findOne({ product_line: req.headers.product_line }).catch((ex) => { return res.status(500).jsonp({ status: false, message: ex.toString() }) })

  //         // if (qr_code_exist == null) {

  //         const itemid = req.headers.product_line;
  //         const output = [];

  //         const map = new Map();
  //         if (!map.has(itemid.toString())) {
  //           map.set(itemid.toString(), true); // set any value to Map
  //           output.push(itemid.toString());
  //         }

  //         await Promise.allSettled(
  //           output.map(async (id) => {
  //             await callstack.updatingQR(req.headers._awareid, req.headers.po_id, id, req);
  //           })
  //         ).catch((error) => {
  //           loggerhandler.logger.error(`${error} ,email:${req.headers.email}`);
  //         })

  //         console.log("req.headers.product_line", req.headers.product_line);
  //         const qr_code_exist = await qr_codes.findOne({ product_line: req.headers.product_line }).catch((ex) => { loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`); return res.status(500).jsonp({ status: false, message: ex.toString() }) })

  //         console.log("qr_code_exist", qr_code_exist);
  //         return res.status(200).jsonp({ status: true, message: "QR Code has been generated successfully", data: qr_code_exist, authorization: resp.token });
  //         // }
  //         // else {
  //         //   return res.status(200).jsonp({ status: true, message: "QR Code is Already generated", data: qr_code_exist, authorization: resp.token });
  //         // }

  //       }
  //       else {
  //         return res.status(resp.code).jsonp({ status: false, message: null, authorization: null });
  //       }
  //     });
  //   }
  // },


  //SHIVAM CHAUHAN

  getqrCode: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).jsonp(errors.array());
    }
    else {
      var payload = { username: req.headers.username };
      refresh(req.headers.authorization, req.headers.userid, payload, async function (resp) {
        if (resp.status == true) {
          const itemid = req.headers.product_line;
          const output = [];

          const map = new Map();
          if (!map.has(itemid.toString())) {
            map.set(itemid.toString(), true); // set any value to Map
            output.push(itemid.toString());
          }

          // await Promise.allSettled(
          //   output.map(async (id) => {
          //     await callstack.updatingQR(req.headers._awareid, req.headers.po_id, id, req);
          //   })
          // ).catch((error) => {
          //   loggerhandler.logger.error(`${error} ,email:${req.headers.email}`);
          // })


          const results = await Promise.all(
            output.map(async (id) => {
              try {
                const result = await callstack.updatingQR(req.headers._awareid, req.headers.po_id, id, req);
                return result.final_brand_name; // Extract final_brand_name
              } catch (error) {
                loggerhandler.logger.error(`${error}, email:${req.headers.email}`);
                return null; // Handle errors gracefully
              }
            })
          );

          console.log("results", results)

          // Filter out null values
          const validBrandNames = results.find(name => name !== null);
          console.log("Final Brand Names:", validBrandNames);


          // console.log("req.headers.product_line", req.headers.product_line);
          var qr_code_exist = await qr_codes.findOne({ product_line: req.headers.product_line }).catch((ex) => { loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`); return res.status(500).jsonp({ status: false, message: ex.toString() }) })

          // qr_code_exist.brand_names = validBrandNames;

          // qr_code_exist = { ...qr_code_exist, brand_names: validBrandNames };

          // console.log("qr_code_exist",qr_code_exist)

          // Convert the Mongoose document to a plain JavaScript object
          let qr_code_obj = qr_code_exist.toObject();

          // Now modify the object in memory
          qr_code_obj.brand_names = validBrandNames;

          // console.log("qr_code_obj", qr_code_obj);


          // console.log("qr_code_exist", qr_code_exist);
          return res.status(200).jsonp({ status: true, message: "QR Code has been generated successfully", data: qr_code_obj, authorization: resp.token });
          // }
          // else {
          //   return res.status(200).jsonp({ status: true, message: "QR Code is Already generated", data: qr_code_exist, authorization: resp.token });
          // }

        }
        else {
          return res.status(resp.code).jsonp({ status: false, message: null, authorization: null });
        }
      });
    }
  },

  //Harish Nishad
  deleteqrAsync: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).jsonp(errors.array());
    }
    else {
      var payload = { username: req.headers.username };
      refresh(req.headers.authorization, req.headers.userid, payload, async function (resp) {
        if (resp.status == true) {
          try {
            const productLine = await product_lines.findOne({ _awareid: req.body._awareid, po_id: req.body.po_id, deleted: false });

            if (productLine) {
              await qr_codes.findOneAndUpdate({ product_line: req.body.product_line }, { generated: false });


              const tempdeletearray = await product_lines.findOneAndUpdate({ _awareid: req.body._awareid, po_id: req.body.po_id, deleted: false },
                { $set: { 'product_line.$[elem].generated': false } },
                { new: true, arrayFilters: [{ 'elem.id': req.body.product_line }] });

              // const tempdeletearray = productLine.product_line.map(item => ({ ...item, generated: item.id === req.body.product_line ? false : item.generated }));
              // const tempdeletearray = productLine.product_line.map(item => {
              //   const tempUpdateObj = { ...item, generated: item.id === req.body.product_line ? false : item.generated };
              //   return tempUpdateObj;
              // });
              console.log({ tempdeletearray })
              // await product_lines.findOneAndUpdate({ _awareid: req.body._awareid, po_id: req.body.po_id ,deleted:false}, { product_line: tempdeletearray });
            }
            return res.status(200).jsonp({ status: true, message: "QR Code has been deleted successfully", authorization: resp.token });
          } catch (ex) {
            loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
            return res.status(500).jsonp({ status: false, message: ex.toString() });
          }

          // const product_lines_find = await product_lines.findOne({ _awareid: req.body._awareid, po_id: req.body.po_id,deleted:false }).catch((ex) => {loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`); return res.status(500).jsonp({ status: false, message: ex.toString() }) })
          // if (product_lines_find) {
          //   await qr_codes.findOneAndUpdate({ product_line: req.body.product_line }, { qr_code: null, generated: false }).catch((ex) => {loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`); return res.status(500).jsonp({ status: false, message: ex.toString() }) })
          //   var tempdeletearray = [];
          //   var tempdelobj = [];
          //   // console.log("product_lines_find",product_lines_find,req.body.product_line);
          //   product_lines_find.product_line.forEach((item) => {
          //     if (item.id === req.body.product_line) {
          //       tempdelobj = {
          //         id: item.id,
          //         order_number: item.order_number,
          //         product: item.product,
          //         color: item.color,
          //         quantity: item.quantity,
          //         item_number: item.item_number,
          //         description: item.description,
          //         generated: false,
          //         productid: item.productid,
          //         existproduct: item.existproduct,
          //         update_aware_token_id: item.update_aware_token_id,
          //         update_status: item.update_status,
          //       }
          //       tempdeletearray.push(tempdelobj);
          //     } else if (item.id !== req.body.product_line) {
          //       tempdelobj = {
          //         id: item.id,
          //         order_number: item.order_number,
          //         product: item.product,
          //         color: item.color,
          //         quantity: item.quantity,
          //         item_number: item.item_number,
          //         description: item.description,
          //         generated: item.generated,
          //         productid: item.productid,
          //         existproduct: item.existproduct,
          //         update_aware_token_id: item.update_aware_token_id,
          //         update_status: item.update_status,
          //       }
          //       tempdeletearray.push(tempdelobj);
          //     } else {
          //       // console.log("Is Not found")
          //     }
          //   })
          //   // console.log("temparray", tempdeletearray)
          //   await product_lines.findOneAndUpdate({ _awareid: req.body._awareid, po_id: req.body.po_id ,deleted:false}, { product_line: tempdeletearray })
          //   return res.status(200).jsonp({ status: true, message: "QR Code has been deleted successfully", authorization: resp.token });
          // } else {
          //   return res.status(200).jsonp({ status: true, message: "QR Code Deleting Failed", authorization: resp.token });
          // }

        } else {
          return res.status(resp.code).jsonp({ status: false, message: null, authorization: null });
        }
      });
    }
  },

  //Harish Nishad
  generate_Update: async (req, res) => {
    console.log("productLinesToUpdate1");
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).jsonp(errors.array());
    }
    else {
      // console.log('body', req.body)
      var payload = { username: req.headers.username };
      refresh(req.headers.authorization, req.headers.userid, payload, async function (resp) {

        // if (resp.status == true) {
        //   const product_lines_find_update = await product_lines.findOne({ _awareid: req.body._awareid, po_id: req.body.po_id ,deleted:false}).catch((ex) => { loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`); return res.status(500).jsonp({ status: false, message: ex.toString() }) })
        //   if (product_lines_find_update) {

        //     var tempUpdatearray = [];
        //     var tempUpdateobj = [];
        //     product_lines_find_update.product_line.forEach((item) => {

        //       if (item.id === req.body.product_line) {
        //         // console.log("item",item,"req.headers.product_line",req.headers.product_line);
        //         tempUpdateobj = {
        //           id: item.id,
        //           order_number: item.order_number,
        //           product: item.product,
        //           color: item.color,
        //           quantity: item.quantity,
        //           item_number: item.item_number,
        //           description: item.description,
        //           generated: true,
        //           // generated: false, //Abhishek

        //           productid: item.productid,
        //           existproduct: item.existproduct,
        //           update_aware_token_id: item.update_aware_token_id,
        //           update_status: item.update_status,
        //         }
        //         tempUpdatearray.push(tempUpdateobj);
        //       } else if (item.id !== req.body.product_line) {
        //         //  console.log("product_lines_find is Not found",product_lines_find);
        //         tempUpdateobj = {
        //           id: item.id,
        //           order_number: item.order_number,
        //           product: item.product,
        //           color: item.color,
        //           quantity: item.quantity,
        //           item_number: item.item_number,
        //           description: item.description,
        //           generated: item.generated,
        //           productid: item.productid,
        //           existproduct: item.existproduct,
        //           update_aware_token_id: item.update_aware_token_id,
        //           update_status: item.update_status,
        //         }
        //         tempUpdatearray.push(tempUpdateobj);
        //       } else {
        //         // console.log("Is")
        //       }
        //     })
        //     // console.log("temparray", tempUpdatearray)
        //     await product_lines.findOneAndUpdate({ _awareid: req.body._awareid, po_id: req.body.po_id ,deleted:false}, { product_line: tempUpdatearray })
        //     return res.status(200).jsonp({ status: true, message: "QR Code has been generated successfully", authorization: resp.token });
        //   } else {
        //     return res.status(200).jsonp({ status: true, message: "Generate Update Failed", authorization: resp.token });
        //   }
        // } 

        if (resp.status) {
          try {
            const productLinesToUpdate = await product_lines.findOne({ _awareid: req.body._awareid, po_id: req.body.po_id, deleted: false });
            console.log("productLinesToUpdate2", productLinesToUpdate);
            if (productLinesToUpdate) {
              const data_of_po_line = await product_lines.findOneAndUpdate({ _awareid: req.body._awareid, po_id: req.body.po_id, deleted: false },
                { $set: { 'product_line.$[elem].generated': true } },
                { new: true, arrayFilters: [{ 'elem.id': req.body.product_line }] });

              console.log("data_of_po_line", data_of_po_line);
              const itemid = req.body.product_line;
              await callstack.updatingQR(req.body._awareid, req.body.po_id, itemid, req).catch((error) => {
                loggerhandler.logger.error(`${error} ,email:${req.headers.email}`);
              })

              // await product_lines.findOneAndUpdate({ _awareid: req.body._awareid, po_id: req.body.po_id ,deleted:false}, { product_line: tempUpdateArray });
              return res.status(200).jsonp({ status: true, message: "QR Code has been generated successfully", authorization: resp.token });
            } else {
              return res.status(200).jsonp({ status: true, message: "Generate Update Failed", authorization: resp.token });
            }
          } catch (ex) {
            loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
            return res.status(500).jsonp({ status: false, message: ex.toString() });
          }
        }

        else {
          return res.status(resp.code).jsonp({ status: false, message: null, authorization: null });
        }
      });
    }
  },

  //Harish Nishad 
  deleteResetPurchaseOrdersAsync: async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).jsonp({ status: false, message: "Bad payload received." })
    }
    else {


      if (req.body.type == 'product_line') {

        //---------------------------------
        var product_lines_length_exist_po_id = await product_lines.find({ _awareid: req.body._awareid, po_id: req.body.po_id, deleted: false }).catch((ex) => { loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`); return res.status(400).jsonp({ status: false, message: "Bad request!" }); })
        var tempproduct_lines_length_exist_po_id = [];
        product_lines_length_exist_po_id.forEach((item) => {
          item.product_line.forEach(async (ele) => {
            tempproduct_lines_length_exist_po_id.push(ele.productid)
          })
        })

        var product_lines_finds = await product_lines.find({ _awareid: req.body._awareid, deleted: false }).catch((ex) => { loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`); return res.status(400).jsonp({ status: false, message: "Bad request!" }); })

        let total_temp_product_checker = []
        product_lines_finds.forEach((item) => {
          item.product_line.forEach(async (ele) => {
            total_temp_product_checker.push(ele.productid)
          })
        })

        for (var i = 0; i < tempproduct_lines_length_exist_po_id.length; i++) {

          const conceptmainhan = total_temp_product_checker.includes(tempproduct_lines_length_exist_po_id[i]);

          if (conceptmainhan) {
            var getconcetptcount = total_temp_product_checker.filter((val) => {
              return (val === tempproduct_lines_length_exist_po_id[i])
            }).length;
            // console.log("getconcetptcount", getconcetptcount);
            if (getconcetptcount == 1) {
              await products.findByIdAndUpdate({ _id: mongoose.Types.ObjectId(tempproduct_lines_length_exist_po_id[i]) }, { status: "CONCEPT" }).catch((ex) => { loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`); return res.status(400).jsonp({ status: false, message: "Bad request!" }); })
            } else {
              // console.log("Concept remaining")
            }
          } else {
            // console.log("conceptmainhan nhi hey", conceptmainhan)
          }
        }



        //----------------------------

        await product_lines.deleteOne({ _awareid: req.body._awareid, po_id: req.body.po_id }).catch((ex) => { loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`); return res.status(500).jsonp({ status: false, message: ex.toString() }) })

        await purchase_orders.findOneAndUpdate({ _awareid: req.body._awareid, _id: mongoose.Types.ObjectId(req.body.po_id), deleted: false }, { create_token_stepper: 1 }, { new: true }).catch((ex) => { loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`); return res.status(500).jsonp({ status: false, message: ex.toString() }) })
        // console.log("req.body.type", req.body.type);

      } else if (req.body.type == 'qr_codes') {

        // console.log("req.body.type", req.body.type);


        await generate_qr.deleteOne({ _awareid: req.body._awareid, po_id: req.body.po_id }).catch((ex) => { loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`); return res.status(500).jsonp({ status: false, message: ex.toString() }) })

        await product_lines.findOneAndUpdate({ _awareid: req.body._awareid, po_id: req.body.po_id, deleted: false }, { $set: { 'product_line.$[].generated': false } }).catch((ex) => { loggerhandler.logger.error(`${ex}, email:${req.headers.email}`); return res.status(500).jsonp({ status: false, message: ex.toString() }); });

        await purchase_orders.findOneAndUpdate({ _awareid: req.body._awareid, _id: mongoose.Types.ObjectId(req.body.po_id), deleted: false }, { create_token_stepper: 2 }, { new: true }).catch((ex) => { loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`); return res.status(500).jsonp({ status: false, message: ex.toString() }) })

      }


      var payload = { username: req.headers.username };
      refresh(req.headers.authorization, req.headers.userid, payload, function (resp) {
        if (resp.status == true) {

          return res.status(200).jsonp({ status: true, message: "Directory has been successfully updated.", authorization: resp.token });

        }
        else {
          return res.status(resp.code).jsonp({ status: false, message: null, authorization: null });
        }
      });

    }
  },

  //Harish Nishad&Nikhil
  deleteproductLineAsync: async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).jsonp({ status: false, message: "Bad payload received." })
    }
    else {
      var product_lines_finds = await product_lines.findOne({ _awareid: req.body._awareid, po_id: req.body.po_id, deleted: false }).catch((ex) => { loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`); return res.status(400).jsonp({ status: false, message: "Bad request!" }); })
      // console.log("product_lines_finds", product_lines_finds);
      let temp_product_lines = product_lines_finds.product_line.filter((item) => item.productid != req.body.productid)
      product_lines.findOneAndUpdate(
        { _awareid: req.body._awareid, po_id: req.body.po_id, deleted: false },
        {
          product_line: temp_product_lines ? temp_product_lines : null
        },
        function (err, datasubmitted) {
          if (err) { loggerhandler.logger.error(`${err} ,email:${req.headers.email}`); return res.status(500).jsonp({ status: false, message: err }); }

          var payload = { username: req.headers.username };
          refresh(
            req.headers.authorization,
            req.headers.userid,
            payload,
            async function (resp) {
              if (resp.status == true) {
                var product_lines_finds = await product_lines.find({ _awareid: req.body._awareid, deleted: false }).catch((ex) => { loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`); return res.status(400).jsonp({ status: false, message: "Bad request!" }); })

                let temp_product_checker = []
                product_lines_finds.forEach((item) => {
                  item.product_line.forEach(async (ele) => {
                    temp_product_checker.push(ele)
                  })
                })
                let exist_product = temp_product_checker.find((item) => item.productid == req.body.productid)
                if (!exist_product) {
                  await products.findByIdAndUpdate({ _id: mongoose.Types.ObjectId(req.body.productid) }, { status: "CONCEPT" }).catch((ex) => { loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`); return res.status(400).jsonp({ status: false, message: "Bad request!" }); })
                }
                var product_lines_length_checker = await product_lines.findOne({ _awareid: req.body._awareid, po_id: req.body.po_id, deleted: false }).select(['product_line']).catch((ex) => { loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`); return res.status(400).jsonp({ status: false, message: "Bad request!" }); })

                // console.log("product_lines_length_checker",product_lines_length_checker)
                if (product_lines_length_checker.product_line.length == 0) {
                  await purchase_orders.findOneAndUpdate({ _awareid: req.body._awareid, _id: mongoose.Types.ObjectId(req.body.po_id), deleted: false }, { create_token_stepper: 2 }, { new: true }).catch((ex) => { loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`); return res.status(500).jsonp({ status: false, message: ex.toString() }) })
                }
                return res.status(200).jsonp({
                  status: true,
                  message:
                    "Product Line has been deleted successfully",
                  authorization: resp.token,
                });
              } else {
                return res.status(resp.code).jsonp({
                  status: false,
                  data: null,
                  authorization: null,
                });
              }
            }
          );
        }
      );
    }
  },

  getProductLinesAsync: async (req, res) => {
    console.log("SHIVAM");

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).jsonp(errors.array())
    }
    else {

      if (!req.headers.userid || !req.headers.username || !req.headers.authorization || !req.headers.awareid) {
        return res.status(400).jsonp({ status: false, message: "Bad request!" });
      }


      var payload = { username: req.headers.username };
      refresh(req.headers.authorization, req.headers.userid, payload, async function (resp) {
        if (resp.status == true) {

          var product_line_available = await product_lines.find({ _awareid: req.headers.awareid, deleted: false }).sort({ created_date: -1 }).catch((ex) => { loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`); return res.status(400).jsonp({ status: false, message: "Bad request!" }); })
          var purchase_order_details_avaliable = await purchase_order_details.find({ _awareid: req.headers.awareid, deleted: false }).catch((ex) => { loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`); return res.status(400).jsonp({ status: false, message: "Bad request!" }); })
          var purchase_orders_avaliable = await purchase_orders.find({ _awareid: req.headers.awareid, deleted: false, hide: { $ne: true }, status: { $ne: "Approved" } }).catch((ex) => { loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`); return res.status(400).jsonp({ status: false, message: "Bad request!" }); })

          if (product_line_available.length <= 0 && purchase_order_details_avaliable.length <= 0) {
            return res.status(200).jsonp({ status: true, data: null, authorization: resp.token });
          }
          else {
            let jsonData = [];
            product_line_available.forEach(ele => {
              var temp_purchase_order_details_avaliable = purchase_order_details_avaliable.find(x => x.po_id == ele.po_id);
              var temp_purchase_order_avaliable = purchase_orders_avaliable.find(x => x._id.toString() == ele.po_id);
              if (temp_purchase_order_avaliable) {
                let product_line = ele.product_line.length > 0 ? ele.product_line.filter(item => item.deleted == false) : [];
                let add_item_product_line = product_line.map(ele => ({ ...ele.toObject(), ...temp_purchase_order_details_avaliable.toObject() }));
                jsonData.push(...add_item_product_line);
              }

            })

            console.log("jsonData", jsonData);


            return res.status(200).jsonp({ status: true, data: jsonData?.flat(Infinity), authorization: resp.token });

          }

        }
        else {
          return res.status(resp.code).jsonp({ status: false, data: null, authorization: null });
        }
      });
    }
  },

  updateEtdDetailsAsync: async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).jsonp({ status: false, message: "Bad payload received." })
    }
    else {
      const purchase_order_details_exist = await purchase_order_details.findOne({ po_id: req.body.po_id, deleted: false }).catch((ex) => { loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`); return res.status(500).jsonp({ status: false, message: ex.toString() }) })

      var payload = { username: req.headers.username };
      refresh(req.headers.authorization, req.headers.userid, payload, async function (resp) {
        if (resp.status == true) {
          if (purchase_order_details_exist) {
            let etd = req.body.etd ? moment(req.body.etd, 'DD/MM/YYYY').toDate() : new Date();
            console.log({ etd })
            purchase_order_details.findOneAndUpdate({ po_id: req.body.po_id, deleted: false },
              { etd: etd }, { new: true },
              async function (err, user) {
                if (err) { loggerhandler.logger.error(`${err} ,email:${req.headers.email}`); return res.status(500).jsonp({ status: false, message: err.toString() }) }

                await notifications.create({
                  notification_sent_to: user.producer_aware_id,
                  date: moment().format('DD/MM/YYYY'),
                  message: `The ETD for PO ${user.order_number} of ${user.brand} has been updated to ${moment(user.etd).format('DD/MM/YYYY')}.`
                })

                return res.status(200).jsonp({ status: true, message: `The ETD for PO ${user.order_number} of ${user.brand} has been updated.`, authorization: resp.token });
              })
          }
          else {
            return res.status(400).jsonp({ status: true, message: "Purchase Order Not Found!", authorization: resp.token });
          }
        }
        else {
          return res.status(resp.code).jsonp({ status: false, message: null, authorization: null });
        }
      });
    }
  },

  AlotSubBrandToProductAsync: async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).jsonp({ status: false, message: "Bad payload received." })
    }
    else {
      const { sub_brand_id, product_array } = req.body;

      var payload = { username: req.headers.username };
      refresh(req.headers.authorization, req.headers.userid, payload, async function (resp) {
        if (resp.status == true) {

          const output = [];
          const map = new Map();
          for (const item of product_array) {
            if (!map.has(mongoose.Types.ObjectId(item))) {
              map.set(mongoose.Types.ObjectId(item), true); // set any value to Map
              output.push(mongoose.Types.ObjectId(item));
            }
          }

          await products.updateMany({ _id: { $in: output } }, { sub_brand: sub_brand_id }).catch((ex) => { loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`); return res.status(500).jsonp({ status: false, message: ex.toString(), authorization: resp.token }) })
          return res.status(200).jsonp({ status: true, message: "Products has been successfully Assign with Sub brand", authorization: resp.token });
        }
        else {
          return res.status(resp.code).jsonp({ status: false, message: null, authorization: null });
        }
      });
    }
  },
  //varun's code
  postSubBrandAysnc: async (req, res) => {

    try {
      const errors = validationResult(req);

      console.log("req.body", req.body)
      if (!errors.isEmpty() || req.body.aware_id === "") return res.status(422).jsonp({ status: false, message: "Bad payload received." });
      let { name, location, aware_id, _id, logo, circularity, branddata } = req.body;
      if (req.file) logo = req.file.filename;

      // var temp = JSON.parse(branddata);
      // console.log("req.temp", temp)

      var brand_data = branddata ? JSON.parse(branddata) : branddata;
      var dpp_settings = null;
      let SubBrand = { name, logo, location, circularity, brand_data, dpp_settings };
      console.log(SubBrand)
      var payload = { username: req.headers.username };

      // var resp = null;
      refresh(req.headers.authorization, req.headers.userid, payload, async function (resp) {
        if (resp.status == true) {
          let kycDetailsAvialable = await kyc_details.findOne({ aware_id: aware_id });

          if (!kycDetailsAvialable) return res.status(400).jsonp({ status: true, message: "Error while finding", authorization: resp.token });
          if (_id) {
            let flag = true;
            kycDetailsAvialable.sub_brand.map((e) => {
              if (e._id.toString() == _id) {
                flag = false;
                name ? e.name = name : '';
                logo ? e.logo = logo : '';
                location ? e.location = location : '';
                circularity ? e.circularity = circularity : '';
                brand_data ? e.brand_data = brand_data : '';
                e.dpp_settings ? e.dpp_settings = e.dpp_settings : null;

              }
              return;
            })

            if (flag) return res.status(400).json({ status: true, message: "No such Brand found", authorization: resp.token });
            console.log({ flag })
            kycDetailsAvialable.save();
            return res.status(200).json({ status: true, message: "Brand has been updated successfully", data: kycDetailsAvialable.sub_brand, authorization: resp.token });
          }

          if (kycDetailsAvialable.sub_brand.length >= 20) return res.status(200).json({ status: true, message: "You can't add more than 20 Sub brands", data: null });
          // adding new sub brand if sub brands are not more than 7
          kycDetailsAvialable.sub_brand = [...kycDetailsAvialable.sub_brand, SubBrand];
          await kycDetailsAvialable.save();
          return res.status(200).json({ status: true, message: "Brand has been added successfully", data: kycDetailsAvialable.sub_brand, authorization: resp.token });

        }
        else {
          return res.status(resp.code).jsonp({ status: false, message: null, authorization: null });
        }
      });

    }
    catch (ex) {
      console.log("ex", ex)
      return res.status(422).jsonp({ status: false, message: "Error while updating Sub brand" });
    }
  },

  postDppConfigurationsOnBrandLevel: async (req, res) => {

    console.log("req.body", req.body, req.headers.username);

    const payload = { username: req.headers.username };

    // Refresh token and authorization check
    const resp = await new Promise((resolve, reject) =>
      refresh(req.headers.authorization, req.headers.userid, payload, resolve)
    );

    console.log("resp", resp);


    if (resp.status) {
      const {
        aware_id, _id, care, impact, circularity, journey_level,
        sustainable_material_score, brand_data, header_background_color, button_accent_color
      } = req.body;

      const dpp_settings = { care, impact, circularity, journey_level, sustainable_material_score, brand_data, header_background_color, button_accent_color };

      // Check if KYC details are available
      const kycDetails = await kyc_details.findOne({ aware_id });
      if (!kycDetails) return res.status(400).json({ status: false, message: "Bad request!", authorization: resp.token });

      // Update the sub_brand fields
      let subBrandUpdated = false;
      kycDetails.sub_brand.forEach(e => {
        if (e._id.toString() === _id) {
          subBrandUpdated = true;
          Object.assign(e, { ...e, dpp_settings });
        }
      });

      if (!subBrandUpdated) return res.status(400).json({ status: false, message: "Sub-brand not found!", authorization: resp.token });

      await kycDetails.save();

      // Update product data
      return res.status(200).json({ status: true, message: "DPP settings have been saved successfully", data: kycDetails.sub_brand, authorization: resp.token });

      // thid code hide by deepak for bug num 1857
      // const productsToUpdate = await products.find({ _awareid: aware_id, sub_brand: _id });
      // if (Array.isArray(productsToUpdate)) {
      //   await Promise.all(productsToUpdate.map(e => {
      //     if (e.sub_brand === _id) {
      //       Object.assign(e, { ...e, dpp_settings });
      //       return e.save();
      //     }
      //   }));
      //   return res.status(200).json({ status: true, message: "DPP settings have been saved successfully", data: kycDetails.sub_brand, authorization: resp.token });
      // } else {
      //   return res.status(400).json({ status: false, message: "Products data retrieval failed", authorization: resp.token });
      // }
    } else {
      return res.status(resp.code).json({ status: false, message: null, authorization: null });
    }

  },

  // postDppConfigurationsOnBrandLevel: async (req, res) => {

  //   console.log("req.body", req.body, req.headers.username)

  //   var payload = { username: req.headers.username };
  //   refresh(req.headers.authorization, req.headers.userid, payload, async function (resp) {
  //     if (resp.status == true) {

  //       const { aware_id, _id, care, impact, circularity, journey_level,
  //         sustainable_material_score, brand_data, header_background_color, button_accent_color } = req.body;

  //       let dpp_settings = {
  //         care, impact, circularity, journey_level,
  //         sustainable_material_score, brand_data, header_background_color, button_accent_color
  //       };

  //       let kycDetailsAvialable = await kyc_details.findOne({ aware_id: aware_id });

  //       if (!kycDetailsAvialable) return res.status(400).jsonp({ status: false, message: "Bad request!", authorization: resp.token });

  //       let flag = true;
  //       kycDetailsAvialable.sub_brand.map((e) => {
  //         if (e._id.toString() == _id) {
  //           flag = false;
  //           e.name ? e.name = e.name : null;
  //           e.logo ? e.logo = e.logo : null;
  //           e.location ? e.location = e.location : null;
  //           e.circularity ? e.circularity = e.circularity : null;
  //           e.brand_data ? e.brand_data = e.brand_data : null;
  //           dpp_settings ? e.dpp_settings = dpp_settings : null;
  //         }
  //         return;
  //       })

  //       if (flag) return res.status(400).json({ status: true, message: "Bad request!", authorization: resp.token });

  //       kycDetailsAvialable.save().catch((ex) => { return res.status(400).jsonp({ status: false, message: "Bad request!", authorization: resp.token }); });



  //       //master reset this we can comment later
  //       // var products_data_Updated = await products.find({ _awareid: aware_id, sub_brand: _id }).catch((ex) => { loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`); return res.status(500).jsonp({ status: false, message: ex.toString() }) })


  //       const products_data_Updated = await products.find({ _awareid: aware_id, sub_brand: _id })
  //         .catch((ex) => {
  //           loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
  //           return res.status(500).jsonp({ status: false, message: ex.toString() });
  //         });

  //       // products_data_Updated.map((e) => {
  //       //   if (e.sub_brand == _id) {
  //       //     e._awareid = e._awareid;
  //       //     e.item_number = e.item_number;
  //       //     e.description = e.description;
  //       //     e.color = e.color;
  //       //     e.info = e.info;
  //       //     e.care = e.care;
  //       //     e.weight = e.weight;
  //       //     e.product_lock = e.product_lock;
  //       //     e.sub_brand = e.sub_brand;
  //       //     e.status = e.status;
  //       //     e.product_photo_1 = e.product_photo_1;
  //       //     e.product_photo_2 = e.product_photo_2;
  //       //     e.product_photo_3 = e.product_photo_3;
  //       //     e.dpp_settings = dpp_settings;
  //       //     e.created_date = e.created_date;
  //       //     e.care = e.care;
  //       //   }
  //       //   return;
  //       // })


  //       // products_data_Updated.save().catch((ex) => { return res.status(400).jsonp({ status: false, message: "Bad request!", authorization: resp.token }); });


  //       if (Array.isArray(products_data_Updated)) {
  //         // Iterate over each document and update the fields
  //         const updatePromises = products_data_Updated.map(async (e) => {
  //           if (e.sub_brand == _id) {
  //             // Update fields
  //             e._awareid = e._awareid;
  //             e.item_number = e.item_number;
  //             e.description = e.description;
  //             e.color = e.color;
  //             e.info = e.info;
  //             e.care = e.care;
  //             e.weight = e.weight;
  //             e.product_lock = e.product_lock;
  //             e.sub_brand = e.sub_brand;
  //             e.status = e.status;
  //             e.product_photo_1 = e.product_photo_1;
  //             e.product_photo_2 = e.product_photo_2;
  //             e.product_photo_3 = e.product_photo_3;
  //             e.dpp_settings = dpp_settings;
  //             e.created_date = e.created_date;
  //             e.care = e.care;

  //             // Save each updated document
  //             return e.save();
  //           }
  //         });

  //         // Execute all save operations
  //         await Promise.all(updatePromises)
  //           .then(() =>
  //             res.status(200).json({ status: true, message: "DPP settings have been saved successfully", data: kycDetailsAvialable.sub_brand, authorization: resp.token })
  //             // res.status(200).jsonp({ status: true, message: "Update successful" })
  //           )
  //           .catch((ex) => res.status(400).jsonp({ status: false, message: "Bad request!", authorization: resp.token }));
  //       } else {
  //         // Handle case when products_data_Updated is not an array
  //         return res.status(400).json({ status: true, message: "Bad request!", authorization: resp.token });
  //       }
  //     }
  //     else {
  //       return res.status(resp.code).jsonp({ status: false, message: null, authorization: null });
  //     }
  //   })


  // },

  resetDppConfigurationOnBrandLevel: async (req, res) => {


    var payload = { username: req.headers.username };
    refresh(req.headers.authorization, req.headers.userid, payload, async function (resp) {
      if (resp.status == true) {

        const { aware_id, _id } = req.body;

        let kycDetailsAvialable = await kyc_details.findOne({ aware_id: aware_id });

        if (!kycDetailsAvialable) return res.status(400).jsonp({ status: false, message: "Bad request!", authorization: resp.token });

        let flag = true;
        kycDetailsAvialable.sub_brand.map((e) => {
          if (e._id.toString() == _id) {
            flag = false;
            e.name ? e.name = e.name : null;
            e.logo ? e.logo = e.logo : null;
            e.location ? e.location = e.location : null;
            e.circularity ? e.circularity = e.circularity : null;
            e.brand_data ? e.brand_data = e.brand_data : null;
            e.dpp_settings = null;
          }
          return;
        })

        if (flag) return res.status(400).json({ status: true, message: "No such Brand found", authorization: resp.token });
        // console.log({ flag })
        kycDetailsAvialable.save();

        return res.status(200).json({ status: true, message: "DPP settings have been reset to the default successfully", data: kycDetailsAvialable.sub_brand, authorization: resp.token });
      }
    })



    //}
  },

  postDppConfigurationsOnProductLevel: async (req, res) => {

    console.log("req.body", req.body, req.headers.username)

    var payload = { username: req.headers.username };
    refresh(req.headers.authorization, req.headers.userid, payload, async function (resp) {
      if (resp.status == true) {

        const { aware_id, product_id, care, impact, circularity, journey_level,
          sustainable_material_score, brand_data, header_background_color, button_accent_color } = req.body;

        let dpp_settings = {
          care, impact, circularity, journey_level,
          sustainable_material_score, brand_data, header_background_color, button_accent_color
        };

        const products_exist = await products.findOne({ _awareid: aware_id, _id: mongoose.Types.ObjectId(product_id) }).catch((ex) => { return res.status(500).jsonp({ status: false, message: ex.toString(), authorization: resp.token }) })

        products.findOneAndUpdate({ _awareid: aware_id, _id: mongoose.Types.ObjectId(product_id) },
          {
            sub_brand: products_exist.sub_brand,
            _awareid: products_exist._awareid,
            item_number: products_exist.item_number,
            description: products_exist.description,
            color: products_exist.color,
            info: products_exist.info,
            care: products_exist.care,
            weight: products_exist.weight ? Number(products_exist.weight) : null,
            status: products_exist.status,
            product_lock: products_exist.product_lock,
            product_photo_1: products_exist.product_photo_1,
            product_photo_2: products_exist.product_photo_2,
            product_photo_3: products_exist.product_photo_3,
            dpp_settings: dpp_settings,
            modified_on: new Date()

          },
          async function (err, purchaseorder) {
            if (err) { return res.status(500).jsonp({ status: false, message: err.toString(), authorization: resp.token }) }

            return res.status(200).json({ status: true, message: "DPP settings have been saved successfully", authorization: resp.token });

          })
      }
      else {
        return res.status(resp.code).jsonp({ status: false, message: null, authorization: null });
      }
    })


  },

  resetDppConfigurationsOnProductLevel: async (req, res) => {


    console.log("req.body", req.body, req.headers.username)

    var payload = { username: req.headers.username };
    refresh(req.headers.authorization, req.headers.userid, payload, async function (resp) {
      if (resp.status == true) {

        const { aware_id, product_id } = req.body;

        const products_exist = await products.findOne({ _awareid: aware_id, _id: mongoose.Types.ObjectId(product_id) }).catch((ex) => { return res.status(500).jsonp({ status: false, message: ex.toString(), authorization: resp.token }) })

        products.findOneAndUpdate({ _awareid: aware_id, _id: mongoose.Types.ObjectId(product_id) },
          {
            sub_brand: products_exist.sub_brand,
            _awareid: products_exist._awareid,
            item_number: products_exist.item_number,
            description: products_exist.description,
            color: products_exist.color,
            info: products_exist.info,
            care: products_exist.care,
            weight: products_exist.weight ? Number(products_exist.weight) : null,
            status: products_exist.status,
            product_lock: products_exist.product_lock,
            product_photo_1: products_exist.product_photo_1,
            product_photo_2: products_exist.product_photo_2,
            product_photo_3: products_exist.product_photo_3,
            dpp_settings: null,
            modified_on: new Date()

          },
          async function (err, purchaseorder) {
            if (err) { return res.status(500).jsonp({ status: false, message: err.toString(), authorization: resp.token }) }

            return res.status(200).json({ status: true, message: "DPP settings have been reset to the default successfully", authorization: resp.token });

          })
      }
      else {
        return res.status(resp.code).jsonp({ status: false, message: null, authorization: null });
      }
    })
  },


  deleteSubBrandAsync: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(422).jsonp({ status: false, message: "Bad payload received." });
      let { aware_id, _id } = req.body;

      var payload = { username: req.headers.username };
      refresh(req.headers.authorization, req.headers.userid, payload, async function (resp) {
        if (resp.status == true) {
          let kyc_details_available = await kyc_details.findOne({ aware_id: aware_id });

          if (!kyc_details_available) return res.status(400).json({ status: false, message: "Can't find the account", authorization: resp.token });
          kyc_details_available.sub_brand = kyc_details_available.sub_brand.filter((e) => e._id.toString() !== _id);
          await kyc_details_available.save();

          return res.status(200).json({ status: true, message: "Sub brand deleted successfully", data: kyc_details_available.sub_brand, authorization: resp.token })

        }
        else {
          return res.status(resp.code).jsonp({ status: false, message: null, authorization: null });
        }
      });

    } catch {
      return res.status(400).json({ status: false, message: "Error while deleting sub brand" })
    }
  },



  //SHIVAM CHAUHAN

  add_hardGoodsProduct: async (req, res) => {
    console.log("working1", req.body);
    const errors = validationResult(req);
    const { authorization, userid, username } = req.headers;
    if (!authorization || !userid || !username) {
      return res.status(401).json({ status: false, message: "Missing authorization details." });
    }
    if (!errors.isEmpty()) {
      return res.status(422).jsonp({ status: false, message: "Bad payload received." });
    } else {
      let brand_exist = null;

      // Check if brand already exists
      if (req.body.hardGoodsBrands_id !== null && req.body.hardGoodsBrands_id !== 'null') {
        brand_exist = await hardGoodsBrands.findOne({ _id: mongoose.Types.ObjectId(req.body.hardGoodsBrands_id) })
          .catch((ex) => {
            loggerhandler.logger.error(`${ex}, email:${req.headers.email}`);
            return res.status(500).jsonp({ status: false, message: ex.toString() });
          });
      }

      let created_current_date = new Date();

      const payload = { username: req.headers.username };
      // Refresh token
      refresh(req.headers.authorization, req.headers.userid, payload, async function (resp) {
        if (resp.status === true) {
          if (brand_exist) {
            console.log("req_body_photoatatched", req.body.photoattached, typeof (req.body.photoattached));
            // Update existing brand
            const updatedBrand = await hardGoodsBrands.findOneAndUpdate(
              { _id: mongoose.Types.ObjectId(req.body.hardGoodsBrands_id) },
              {
                item_number: req.body.item_number,
                description: req.body.description,
                color: req.body.color,
                info: req.body.info,
                care: req.body.care,
                weight: req.body.weight,
                product_lock: req.body.product_lock,
                sub_brand: req.body.sub_brand,
                impact_data: req.body.impact_data ? JSON.parse(req.body.impact_data) : null,
                product_photo_2: req.body.product_photo_2,
                productImage: req.body.productImage,
                product_photo_3: req.body.product_photo_3,
                dpp_settings: req.body.dpp_settings ? JSON.parse(req.body.dpp_settings) : null,
                modified_on: req.body.modified_on,
                _awareid: req.body._awareid,
                status: req.body.status,
                create_token_stepper: req.body.create_token_stepper,
                type_of_token: req.body.type_of_token,
                locked: req.body.locked,
                hide: req.body.hide,
                producer_aware_id: req.body.producer_aware_id,
                po_id: req.body.po_id,
                date: req.body.date,
                order_number: req.body.order_number,
                country: req.body.country,
                address: req.body.produceraddress,
                etd: req.body.etd,
                producer: req.body.producer,
                brand: req.body.brand,
                upload_po_pdf: req.body.upload_po_pdf,
                qrcode_status: req.body.qrcode_status,
                locked_status: req.body.locked_status,
                brandname: req.body.brandname,
                sustainablescore: req.body.sustainablescore,
                producername: req.body.producername,
                companyglance: req.body.companyglance,
                produceraddress: req.body.produceraddress,
                factorycompliances: JSON.parse(req.body.factorycompliances) ? JSON.parse(req.body.factorycompliances) : null,
                productcertificates: req.body.productcertificates ? JSON.parse(req.body.productcertificates) : null,
                brand_data: req.body.brand_data ? JSON.parse(req.body.brand_data) : null,
                circularity: req.body.circularity,
                product_photo_1: req.body.product_photo_1 === "null" ? null : req.body.product_photo_1,
                brandlogo: req.body.brandlogo === "null" ? null : req.body.brandlogo,
                materials: req.body.materials ? JSON.parse(req.body.materials) : null,
                modified_on: created_current_date,
                producerlogo: req.body.producerlogo === "null" ? null : req.body.producerlogo,
                url: '',
                // name: req.body.photoattached ? req.body.photoattached.split('/').pop() : null,
                // photoattached: req.body.photoattached === "null" ? null : req.body.photoattached,
              },
              { new: true }
            );

            console.log("updatedBrand101", updatedBrand);
            // const imageUrl = updatedBrand.url;
            // if (!imageUrl || typeof imageUrl !== 'string') {
            //     console.error('Invalid image URL');
            // } else {
            //     console.log('Image URL:', imageUrl);
            //         const uploadDirectory = path.join(__dirname, '../uploads');
            //     fs.mkdirSync(uploadDirectory, { recursive: true });

            //     const downloadImage = async (url) => {
            //         try {
            //             const fileName = path.basename(url);
            //             const filePath = path.join(uploadDirectory, fileName);

            //             const response = await axios.get(url, { responseType: 'arraybuffer' });
            //             fs.writeFileSync(filePath, response.data);
            //             console.log(`Image saved: ${fileName}`);
            //         } catch (error) {
            //             console.error(`Failed to download image: ${url}`, error);
            //         }
            //     };

            //     await downloadImage(imageUrl);
            // }
            return res.status(200).jsonp({
              status: true,
              message: "Product has been updated successfully.",
              data: { "_id": updatedBrand._id, "_awareid": updatedBrand._awareid },
              authorization: resp.token,
            });

          } else {
            // Create new brand
            const purchaseorder = await hardGoodsBrands.create({
              item_number: req.body.item_number || null,
              description: req.body.description || null,
              color: req.body.color || null,
              info: req.body.info || null,
              care: req.body.care || null,
              weight: req.body.weight || null,
              product_lock: req.body.product_lock || null,
              sub_brand: req.body.sub_brand || null,
              impact_data: req.body.impact_data ? JSON.parse(req.body.impact_data) : null,
              product_photo_2: req.body.product_photo_2 || null,
              product_photo_3: req.body.product_photo_3 || null,
              dpp_settings: req.body.dpp_settings ? JSON.parse(req.body.dpp_settings) : null,
              created_date: created_current_date || null,
              modified_on: req.body.modified_on || null,
              _awareid: req.body._awareid || null,
              status: req.body.status || null,
              create_token_stepper: req.body.create_token_stepper || null,
              type_of_token: req.body.type_of_token || null,
              locked: req.body.locked || null,
              hide: req.body.hide || null,
              producer_aware_id: req.body.producer_aware_id || null,
              po_id: req.body.po_id || null,
              date: req.body.date || null,
              order_number: req.body.order_number || null,
              country: req.body.country || null,
              address: req.body.address || null,
              etd: req.body.etd || null,
              producer: req.body.producer || null,
              brand: req.body.brand || null,
              upload_po_pdf: req.body.upload_po_pdf || null,
              qrcode_status: req.body.qrcode_status || null,
              locked_status: req.body.locked_status || null,
              brandname: req.body.brandname || null,
              sustainablescore: req.body.sustainablescore || null,
              producername: req.body.producername || null,
              companyglance: req.body.companyglance,
              produceraddress: req.body.produceraddress || null,
              factorycompliances: JSON.parse(req.body.factorycompliances) ? JSON.parse(req.body.factorycompliances) : null,
              productcertificates: req.body.productcertificates ? JSON.parse(req.body.productcertificates) : null,
              weight: req.body.weight || null,
              brand_data: req.body.brand_data ? JSON.parse(req.body.brand_data) : null,
              circularity: req.body.circularity,
              product_photo_1: req.body.product_photo_1 === "null" ? null : req.body.product_photo_1,
              brandlogo: req.body.brandlogo === "null" ? null : req.body.brandlogo,
              materials: req.body.materials ? JSON.parse(req.body.materials) : null,
              modified_on: created_current_date,
              producerlogo: req.body.producerlogo === "null" ? null : req.body.producerlogo,
              url: "",
              // name: req.body.photoattached ? req.body.photoattached.split('/').pop() : null,
              // photoattached: req.body.photoattached === "null" ? null : req.body.photoattached,
            });
            console.log("purchaseorder", purchaseorder);
            // const imageUrl = purchaseorder.url;
            // if (!imageUrl || typeof imageUrl !== 'string') {
            //     console.error('Invalid image URL');
            // } else {
            //     console.log('Image URL:', imageUrl);
            //         const uploadDirectory = path.join(__dirname, '../uploads');
            //     fs.mkdirSync(uploadDirectory, { recursive: true });

            //     const downloadImage = async (url) => {
            //         try {
            //             const fileName = path.basename(url);
            //             const filePath = path.join(uploadDirectory, fileName);

            //             const response = await axios.get(url, { responseType: 'arraybuffer' });
            //             fs.writeFileSync(filePath, response.data);
            //             console.log(`Image saved: ${fileName}`);
            //         } catch (error) {
            //             console.error(`Failed to download image: ${url}`, error);
            //         }
            //     };

            //     await downloadImage(imageUrl);
            // }
            return res.status(200).jsonp({
              status: true,
              // message: "Product has been successfully added.",
              message: "Product has been added successfully.",
              data: { "_id": purchaseorder._id, "_awareid": purchaseorder._awareid },
              authorization: resp.token,
            });
          }
        } else {
          return res.status(resp.code).jsonp({ status: false, message: null, authorization: null });
        }
      });
    }
  },

  downloadHardGoodsProductQR: async (req, res) => {
    // console.log("working121212")
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).jsonp({ status: false, message: "Bad payload received." })
    }
    else {

      Id = req.body.hard_goods_id;
      console.log("Id", Id);
      var payload = { username: req.headers.username };
      refresh(req.headers.authorization, req.headers.userid, payload, async function (resp) {
        if (resp.status == true) {
          var generated_qr_data = await generate_hard_good_qrs.findOne({ hard_goods_id: Id }).catch((ex) => {
            loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
            return res.status(500).jsonp({ status: false, message: ex.toString() })
          })
          return res.status(200).jsonp({ status: true, data: generated_qr_data, authorization: resp.token });
        }
        else {
          return res.status(resp.code).jsonp({ status: false, data: null, authorization: null });
        }
      });
    }
  },

  // deletehardGoodsProduct: async (req, res) => {
  //   const errors = validationResult(req);
  //   if (!errors.isEmpty()) {
  //     return res.status(422).jsonp({ status: false, message: "Bad payload received." })
  //   }
  //   else {

  //     var payload = { username: req.headers.username };

  //     if(!req.headers._id){
  //       return res.status(401).jsonp({ status: false, message: "ID Not Found", authorization: res.token });
  //     }else{
  //       await hardGoodsBrands.findByIdAndUpdate(
  //         { _awareid: req.headers._awareid, _id: mongoose.Types.ObjectId(req.headers._id) },
  //         { $set: { deleted: true } }
  //     );
  //     }

  //     refresh(req.headers.authorization, req.headers.userid, payload, function (res) {
  //       if (res.status == true) {
  //         return res.status(200).jsonp({ status: true, message: "Selected Brand has been deleted successfully", authorization: res.token });
  //       }
  //       else {
  //         return res.status(resp.code).jsonp({ status: false, message: null, authorization: null });
  //       }
  //     });
  //   }
  // },


  deletehardGoodsProduct: async (req, res) => {
    // console.log("shivam chauhan");
    try {
      console.log("Shivam is working on this");

      // Validate the incoming request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).jsonp({ status: false, message: "Bad payload received." });
      }
      // console.log("headres", req.headers);
      // Check if the required headers are present
      const { username, authorization, userid, aware_id, _id } = req.headers;
      console.log("headers", { username }, { authorization }, { userid }, { aware_id }, { _id });
      if (!username || !authorization || !userid) {
        return res.status(400).jsonp({ status: false, message: "Missing required headers." });
      }
      console.log("Shivam working 1")
      // Prepare the payload for the refresh function
      const payload = { username };

      // Call the refresh function
      console.log("req.headers.authorization", req.headers.authorization);
      refresh(req.headers.authorization, req.headers.userid, payload, async (resp) => {
        // Handle response from refresh function
        console.log("Shivam working 2")
        if (resp.status) {
          console.log("Shivam_working", resp.token);
          // Check if the _id is provided
          if (!_id) {
            return res.status(401).jsonp({ status: false, message: "ID Not Found", authorization: resp.token });
          }

          try {
            // Perform the database update to mark the brand as deleted
            console.log("Shivam working 4")
            const result = await hardGoodsBrands.findByIdAndUpdate(
              { _id: mongoose.Types.ObjectId(_id) },
              { $set: { deleted: true } },
              { new: true }  // Optionally return the updated document
            );
            console.log("Shivam working 5")
            if (!result) {
              return res.status(404).jsonp({ status: false, message: "Brand not found" });
            }

            // Send a success response with the updated result
            console.log("Shivam working 6", { result });
            return res.status(200).jsonp({
              status: true,
              message: "Product has been marked as deleted.",
              data: result,
              authorization: resp.token
            });

          } catch (ex) {
            // Log error and return a 500 response
            loggerhandler.logger.error(`${ex}, email: ${req.headers.email}`);
            return res.status(500).jsonp({ status: false, message: ex.toString() });
          }
        } else {
          // If the refresh function fails, return the error code from its response
          return res.status(resp.code).jsonp({ status: false, message: resp.message || "Authorization failed", authorization: null });
        }
      });
    } catch (error) {
      // Catch unexpected errors
      loggerhandler.logger.error(`${error}, email: ${req.headers.email}`);
      return res.status(500).jsonp({ status: false, message: "An unexpected error occurred." });
    }
  },





  getAllhardGoodsProduct: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).jsonp({ status: false, message: "Bad payload received." })
    }
    else {
      var payload = { username: req.headers.username };
      refresh(req.headers.authorization, req.headers.userid, payload, async function (resp) {
        if (resp.status == true) {
          var brandlist = await hardGoodsBrands.find({ deleted: false }).catch((ex) => {
            loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
            return res.status(500).jsonp({ status: false, message: ex.toString() })
          })
          return res.status(200).jsonp({ status: true, data: brandlist, authorization: resp.token });
        }
        else {
          return res.status(resp.code).jsonp({ status: false, data: null, authorization: null });
        }
      });
    }
  },

  // importHardGoodsProducts: async (req, res) => {
  //   console.log("req_body202",);
  //   try {
  //     // console.log("working1", req.body);
  //     // Step 1: Validate the incoming request payload
  //     const errors = validationResult(req);
  //     if (!errors.isEmpty()) {
  //       return res.status(422).json({ status: false, message: "Bad payload received." });
  //     }

  //     // Step 2: Extract data from the request
  //     const { importData } = req.body;

  //     // console.log("working2", JSON.parse(importData));
  //     if (!importData || !Array.isArray(JSON.parse(importData)) || JSON.parse(importData).length === 0) {
  //       return res.status(400).json({ status: false, message: "No data provided for import." });
  //     }

  //     // Step 3: Get user details and validate authorization
  //     const { authorization, userid, username } = req.headers;
  //     if (!authorization || !userid || !username) {
  //       return res.status(401).json({ status: false, message: "Missing authorization details." });
  //     }

  //     // Step 4: Refresh the authorization token and validate user
  //     const payload = { username: req.headers.username };
  //     refresh(authorization, userid, payload, function (refreshResponse) {

  //       if (refreshResponse.status !== true) {
  //         return res.status(refreshResponse.code).json({ status: false, message: "Unauthorized access.", authorization: null });
  //       }

  //       // Step 5: Prepare the data for insertion (add any missing data like created_date if needed)
  //       const dataToInsert = JSON.parse(importData).map(item => ({
  //         ...item,
  //         created_date: new Date(),
  //         created_by: username, // Optionally you could add who created the record
  //       }));

  //       // Step 6: Insert the data into the database
  //       console.log("dataToInsert",dataToInsert);
  //       hardGoodsBrands.create(dataToInsert, async (err, purchaseorder) => {
  //         if (err) {
  //           loggerhandler.logger.error(`Error: ${err.message}, email: ${req.headers.email}`);
  //           return res.status(500).json({ status: false, message: `An error occurred while inserting data: ${err.message}` });
  //         }


  //         // Step 7: Send success response with new purchaseorder details
  //         return res.status(200).json({
  //           status: true,
  //           message: "Hard Goods Product has been added successfully.",
  //           data: {
  //             "_id": purchaseorder._id,
  //             "_awareid": purchaseorder._awareid
  //           },
  //           authorization: refreshResponse.token
  //         });
  //       });
  //     });
  //   } catch (err) {
  //     // Catch unexpected errors and log them
  //     loggerhandler.logger.error(`Error: ${err.message}, email: ${req.headers.email}`);
  //     return res.status(500).json({ status: false, message: `An error occurred: ${err.message}` });
  //   }
  // },

  // importHardGoodsProducts: async (req, res) => {
  //   console.log("req_body202");
  //   try {
  //     // Step 1: Validate the incoming request payload
  //     const errors = validationResult(req);
  //     if (!errors.isEmpty()) {
  //       return res.status(422).json({ status: false, message: "Bad payload received." });
  //     }

  //     // Step 2: Extract data from the request
  //     const { importData } = req.body;

  //     if (!importData || !Array.isArray(JSON.parse(importData)) || JSON.parse(importData).length === 0) {
  //       return res.status(400).json({ status: false, message: "No data provided for import." });
  //     }

  //     // Step 3: Get user details and validate authorization
  //     const { authorization, userid, username } = req.headers;
  //     if (!authorization || !userid || !username) {
  //       return res.status(401).json({ status: false, message: "Missing authorization details." });
  //     }

  //     // Step 4: Refresh the authorization token and validate user
  //     const payload = { username: req.headers.username };
  //     refresh(authorization, userid, payload, async function (refreshResponse) {
  //       if (refreshResponse.status !== true) {
  //         return res.status(refreshResponse.code).json({ status: false, message: "Unauthorized access.", authorization: null });
  //       }

  //       // Step 5: Prepare the data for insertion (add any missing data like created_date if needed)
  //       const dataToInsert = JSON.parse(importData).map(item => ({
  //         ...item,
  //         created_date: new Date(),
  //         created_by: username, // Optionally you could add who created the record
  //       }));

  //       // Step 6: Insert the data into the database
  //       console.log("dataToInsert", dataToInsert);

  //       try {
  //         const purchaseorder = await hardGoodsBrands.create(dataToInsert);

  //         // You can extract the _id values here, but not return them in the response.
  //         const insertedIds = purchaseorder.map(doc => doc._id);
  //         console.log("insertedIds", insertedIds);

  //         return res.status(200).json({
  //           status: true,
  //           message: "Hard Goods Product has been added successfully.",
  //           data: {
  //             "_id": purchaseorder[0]._id,  // You can still send details for the first inserted doc if needed
  //             "_awareid": purchaseorder[0]._awareid // If you want to send the _awareid for the first inserted document
  //           },
  //           authorization: refreshResponse.token
  //         });

  //         for(let i = 0;i<insertedIds.length;i++){
  //           const hard_goods_exist = await hardGoodsBrands.findOneAndUpdate(
  //             { _id: mongoose.Types.ObjectId(insertedIds[i]) },
  //             { $set: { 'qr_generated': true } },
  //             { new: true } // Returns the updated document
  //           )

  //           console.log("hard_goods_exist",hard_goods_exist);

  //           if(hard_goods_exist){

  //             const output = [];
  //             const map = new Map();

  //             // Assuming hard_goods_exist has an `id` (or other unique identifier)
  //             if (!map.has(hard_goods_exist._id.toString())) {
  //               map.set(hard_goods_exist._id.toString(), true); // set the id
  //               output.push(hard_goods_exist._id.toString());
  //             }

  //             console.log({output});



  //             // Generate QR for each unique product in the product_line
  //             await Promise.allSettled(
  //               output.map(async (id) => {
  //                 await callstack.updating_importData_hard_goods_QR(req.body._awareid, id, req , res);
  //               })
  //             ).catch((error) => {
  //               loggerhandler.logger.error(`${error}, email:${req.headers.email}`);
  //             });
  //             console.log("shivam_207");
  //           }

  //         }



  //         // Step 7: Send success response with new purchaseorder details
  //         return res.status(200).json({
  //           status: true,
  //           message: "Hard Goods Product has been added successfully.",
  //           data: {
  //             "_id": purchaseorder[0]._id,  // You can still send details for the first inserted doc if needed
  //             "_awareid": purchaseorder[0]._awareid // If you want to send the _awareid for the first inserted document
  //           },
  //           authorization: refreshResponse.token
  //         });
  //       } catch (err) {
  //         loggerhandler.logger.error(`Error: ${err.message}, email: ${req.headers.email}`);
  //         return res.status(500).json({ status: false, message: `An error occurred while inserting data: ${err.message}` });
  //       }
  //     });
  //   } catch (err) {
  //     // Catch unexpected errors and log them
  //     loggerhandler.logger.error(`Error: ${err.message}, email: ${req.headers.email}`);
  //     return res.status(500).json({ status: false, message: `An error occurred: ${err.message}` });
  //   }
  // },


  //wait
  // importHardGoodsProducts: async (req, res) => {
  //   console.log("req_body202");
  //   try {
  //     // Step 1: Validate the incoming request payload
  //     const errors = validationResult(req);
  //     if (!errors.isEmpty()) {
  //       return res.status(422).json({ status: false, message: "Bad payload received." });
  //     }

  //     // Step 2: Extract data from the request
  //     const { importData } = req.body;

  //     if (!importData || !Array.isArray(JSON.parse(importData)) || JSON.parse(importData).length === 0) {
  //       return res.status(400).json({ status: false, message: "No data provided for import." });
  //     }

  //     // Step 3: Get user details and validate authorization
  //     const { authorization, userid, username } = req.headers;
  //     if (!authorization || !userid || !username) {
  //       return res.status(401).json({ status: false, message: "Missing authorization details." });
  //     }

  //     // Step 4: Refresh the authorization token and validate user
  //     const payload = { username: req.headers.username };
  //     refresh(authorization, userid, payload, async function (refreshResponse) {
  //       if (refreshResponse.status !== true) {
  //         return res.status(refreshResponse.code).json({ status: false, message: "Unauthorized access.", authorization: null });
  //       }

  //       // Step 5: Prepare the data for insertion
  //       const dataToInsert = JSON.parse(importData).map(item => ({
  //         ...item,
  //         created_date: new Date(),
  //         created_by: username,
  //       }));

  //       // Step 6: Insert the data into the database
  //       // console.log("dataToInsert" );
  //       try {
  //         const purchaseorder = await hardGoodsBrands.create(dataToInsert);

  //         // Extract inserted IDs
  //         const insertedIds = purchaseorder.map(doc => doc._id);
  //         console.log("insertedIds", insertedIds);

  //         // Step 7: Immediately send the success response


  //         // res.status(200).json({
  //         //   status: true,
  //         //   message: "Hard Goods Product has been added successfully.",
  //         //   data: {
  //         //     "_id": purchaseorder[0]._id,
  //         //     "_awareid": purchaseorder[0]._awareid
  //         //   },
  //         //   authorization: refreshResponse.token
  //         // });

  //         // Step 8: Process each inserted product and generate QR codes in the background
  //         const qrCodeData = []; // This will store the QR codes to send in the response

  //         const updatePromises = insertedIds.map(async (id) => {
  //           const hard_goods_exist = await hardGoodsBrands.findOneAndUpdate(
  //             { _id: mongoose.Types.ObjectId(id) },
  //             { $set: { 'qr_generated': true } },
  //             { new: true }
  //           );

  //           if (hard_goods_exist) {
  //             const output = [];
  //             const map = new Map();

  //             if (!map.has(hard_goods_exist._id.toString())) {
  //               map.set(hard_goods_exist._id.toString(), true);
  //               output.push(hard_goods_exist._id.toString());
  //             }

  //             // Generate QR codes for each unique product
  //             await Promise.allSettled(
  //               output.map(async (id) => {
  //                 const qrCodeUrl = await callstack.updating_importData_hard_goods_QR(req.body._awareid, id, req, res);
  //                 console.log("qrCodeUrl",qrCodeUrl.hard_goods_id);
  //                 if (qrCodeUrl) {
  //                   qrCodeData.push({ productId: id, qrCodeUrl });
  //                 }
  //               })
  //             ).catch((error) => {
  //               loggerhandler.logger.error(`${error}, email:${req.headers.email}`);
  //             });

  //             // After QR generation, store them if necessary
  //             const imported_qr_download = await generate_hard_good_qrs.findOne({ _id: new mongoose.Types.ObjectId(id) });
  //             if (imported_qr_download) {
  //               qrCodeData.push({
  //                 productId: id,
  //                 qrDownloadUrl: imported_qr_download.hard_good_qr
  //               });
  //             }
  //           }
  //         });

  //         // Wait for all background tasks to complete (QR generation and updates)
  //         const promises_response = await Promise.all(updatePromises);

  //         // After QR codes are generated and downloaded, send them in the response
  //         // console.log("Generated QR Codes:", qrCodeData);

  //         // Send response with all QR codes
  //         return res.status(200).json({
  //           status: true,
  //           message: "QR codes generated successfully.",
  //           qrCodes: qrCodeData,
  //           authorization: refreshResponse.token,
  //           promises_response
  //         });

  //       } catch (err) {
  //         loggerhandler.logger.error(`Error: ${err.message}, email: ${req.headers.email}`);
  //         return res.status(500).json({ status: false, message: `An error occurred while inserting data: ${err.message}` });
  //       }
  //     });
  //   } catch (err) {
  //     loggerhandler.logger.error(`Error: ${err.message}, email: ${req.headers.email}`);
  //     return res.status(500).json({ status: false, message: `An error occurred: ${err.message}` });
  //   }
  // },

  importHardGoodsProducts: async (req, res) => {
    console.log("req_body202", req.size);
    console.log("Request size in bytes:", Buffer.byteLength(JSON.stringify(req.body), 'utf8'));

    try {
      // Step 1: Validate the incoming request payload
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({ status: false, message: "Bad payload received." });
      }

      // Step 2: Extract and validate data from the request
      const { importData } = req.body;
      console.log("req.body", req.body)
      let parsedData;
      try {
        parsedData = JSON.parse(importData);
      } catch (e) {
        return res.status(400).json({ status: false, message: "Invalid JSON format in importData." });
      }

      if (!parsedData || !Array.isArray(parsedData) || parsedData.length === 0) {
        return res.status(400).json({ status: false, message: "No data provided for import." });
      }

      // Step 3: Get user details and validate authorization
      const { authorization, userid, username } = req.headers;
      if (!authorization || !userid || !username) {
        return res.status(401).json({ status: false, message: "Missing authorization details." });
      }

      // Step 4: Refresh the authorization token and validate user
      const payload = { username: req.headers.username };
      refresh(authorization, userid, payload, async function (refreshResponse) {
        if (refreshResponse.status !== true) {
          return res.status(refreshResponse.code).json({ status: false, message: "Unauthorized access.", authorization: null });
        }

        // Step 5: Prepare the data for insertion
        // const dataToInsert = parsedData.map(item => ({
        //   ...item,
        //   url: item.photoattached,
        //   product_photo_1: item.photoattached.split('/').pop().split('?')[0], 
        //   created_date: new Date(),
        //   created_by: username,
        // }));
        // Function to check and append a default image extension if needed
        const addExtensionIfMissing = (fileName) => {
          const validExtensions = ['.jpg', '.jpeg', '.png', '.gif'];

          const hasValidExtension = validExtensions.some(ext => fileName.toLowerCase().endsWith(ext));

          if (!hasValidExtension) {
            return fileName + '.jpg';
          }

          return fileName;
        };

        const dataToInsert = parsedData.map(item => ({
          ...item,
          url: item.photoattached,
          product_photo_1: addExtensionIfMissing(item.photoattached.split('/').pop()),
          created_date: new Date(),
          created_by: username,
        }));

        console.log(dataToInsert);

        console.log("dataToInsert", dataToInsert)
        try {
          // Step 6: Insert the data into the database
          const purchaseorder = await hardGoodsBrands.create(dataToInsert);
          const insertedIds = purchaseorder.map(doc => doc._id);

          console.log({ insertedIds });
          // Step 7: Process each inserted product and generate QR codes in the background
          const qrCodeData = [];

          // Bulk update for setting 'qr_generated' to true
          await hardGoodsBrands.updateMany(
            { _id: { $in: insertedIds } },
            { $set: { qr_generated: true } }
          );

          // Fetch unique IDs in a single query
          const uniqueIds = await hardGoodsBrands.find(
            { _id: { $in: insertedIds } },
            { _id: 1 }
          ).distinct('_id');

          // const qrDownloadData = await generate_hard_good_qrs.find(
          //   { _id: { $in: uniqueIds } },
          //   { _id: 1, hard_good_qr: 1 }
          // );

          const qrDownloadData = await generate_hard_good_qrs.find(
            { _id: { $in: uniqueIds } }
          ).select('hard_good_qr');


          console.log("SHIVAM_qrDownloadData", qrDownloadData);
          const qrCodeMap = qrDownloadData.reduce((acc, doc) => {
            acc[doc._id.toString()] = doc.hard_good_qr;
            return acc;
          }, {});


          console.log("shivam010", qrCodeMap);
          
          await Promise.all(uniqueIds.map(async (id) => {
            const qrCodeUrl = await callstack.updating_importData_hard_goods_QR(req.body._awareid, id, req, res);
            console.log("req.body", req.body.importData)
            console.log("qrCodeUrl", qrCodeUrl)
            
            // let importDatatoSend = [];
            // try {
            //   importDatatoSend = JSON.parse(req.body.importData); 
            // } catch (error) {
            //   console.error("Error parsing importData:", error);
            // }
            if (qrCodeUrl) {
              qrCodeData.push({ productId: id, qrCodeUrl});
            }

            if (qrCodeMap[id]) {
              qrCodeData.push({
                productId: id,
                qrDownloadUrl: qrCodeMap[id]
              });
            }
          }));
          console.log("req.body.importData", req.body.importData);
          // Image Upload 
          let ArrayOfImages = [];

          try {
            if (typeof data.product_photo_1 === 'string') {
              data.product_photo_1 = JSON.parse(data.product_photo_1);
            }

            if (Array.isArray(data.product_photo_1)) {
              ArrayOfImages = data.product_photo_1.map(item => item.photoattached);
            } else if (typeof data.product_photo_1 === 'object' && data.product_photo_1 !== null) {
              ArrayOfImages = [data.product_photo_1];
            } else {
              console.error('importData is not in the expected format');
            }

          } catch (error) {
            console.error('Error parsing importData:', error);
          }

          console.log('ArrayOfImages:', ArrayOfImages);

          const uploadDirectory = path.join(__dirname, '../uploads');
          if (!fs.existsSync(uploadDirectory)) {
            fs.mkdirSync(uploadDirectory);
          }

          const downloadImages = async (retries = 3) => {
            const uploadDirectory = path.join(__dirname, '../uploads');

            if (!fs.existsSync(uploadDirectory)) {
              fs.mkdirSync(uploadDirectory);
            }

              const downloadPromises = dataToInsert.map((data, index) => {
                if (data && data.url) {
                  const fileName = data.product_photo_1;
                  return (
                    async () => {
                      for (let i = 0; i < retries; i++) {
                        try {
                          const response = await axios.get(data.url, { responseType: 'arraybuffer' });
                          fs.writeFile(path.join(uploadDirectory, fileName), response.data, (err) => {
                            if (err) {
                              console.error('Error saving image', err);
                            } else {
                              console.log(`Image saved: ${fileName}`);
                            }
                          });
                          return;
                        } catch (error) {
                          console.error(`Error downloading image (attempt ${i + 1}):`, error);
                          if (i === retries - 1) {
                            console.log(`Failed to download image after ${retries} attempts: ${data.url}`);
                          }
                        }
                      }
                    })();
                } else {
                  console.log(`No image URL found for item at index ${index}`);
                  return Promise.resolve();
                }
              });

              await Promise.all(downloadPromises);
            };

            downloadImages().catch((error) => {
              console.error('Error in downloading images:', error);
            });

          //   const downloadPromises = dataToInsert.map((data, index) => {
          //     if (data && data.url) {
          //       let fileName = data.product_photo_1;

          //       return (
          //         async () => {
          //           for (let i = 0; i < retries; i++) {
          //             try {
          //               const response = await axios.get(data.url, { responseType: 'arraybuffer' });

          //               const contentType = response.headers['content-type'];
          //               let extension = '';
          //               if (contentType.includes('image/jpeg')) {
          //                 extension = '.jpg';
          //               } else if (contentType.includes('image/png')) {
          //                 extension = '.png';
          //               } else if (contentType.includes('image/gif')) {
          //                 extension = '.gif';
          //               }

          //               if (!fileName.includes('.')) {
          //                 fileName += extension || '.jpg';
          //               }
          //               await fs.promises.writeFile(path.join(uploadDirectory, fileName), response.data);
          //               console.log(`Image saved: ${fileName}`);
          //               return;
          //             } catch (error) {
          //               console.error(`Error downloading image (attempt ${i + 1}):`, error);
          //               if (i === retries - 1) {
          //                 console.log(`Failed to download image after ${retries} attempts: ${data.url}`);
          //               }
          //             }
          //           }
          //         })();
          //     } else {
          //       console.log(`No image URL found for item at index ${index}`);
          //       return Promise.resolve();
          //     }
          //   });

          //   await Promise.all(downloadPromises);
          // };

          // downloadImages().catch((error) => {
          //   console.error('Error in downloading images:', error);
          // });
          ArrayOfImages.forEach((url, index) => {
            if (url) {
              // const fileName = url.split('/').pop();
              const fileName = url.split('/').pop();
              downloadImages(url, fileName);
            } else {
              console.log(`No image URL found for item at index ${index}`);
            }
          });

          // Image Upload End


          // Send response with all QR codes
          return res.status(200).json({
            status: true,
            message: "Product has been successfully imported. QR codes will be downloaded shortly.",
            qrCodes: qrCodeData,
            authorization: refreshResponse.token,
          });

        } catch (err) {
          loggerhandler.logger.error(`Error: ${err.message}, email: ${req.headers.email}`);
          return res.status(500).json({ status: false, message: `An error occurred while inserting data: ${err.message}` });
        }
      });
    } catch (err) {
      loggerhandler.logger.error(`Error: ${err.message}, email: ${req.headers.email}`);
      return res.status(500).json({ status: false, message: `An error occurred: ${err.message}` });
    }
  },



  delete_line_items: async (req, res) => {

    try {
      // Step 1: Validation Check
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).jsonp({ status: false, message: "Bad payload received." });
      }

      const payload = { username: req.headers.username };

      // Step 2: Token Validation (Refresh token)
      refresh(req.headers.authorization, req.headers.userid, payload, async (resp) => {
        if (resp.status) {
          try {
            // Step 3: Fetch Product Line Document
            const productLineDocument = await product_lines.findOne({
              _awareid: req.body._awareid,
              po_id: req.body.po_id,
              deleted: false // Ensure you're not fetching deleted documents
            }).catch((ex) => {
              loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
              return res.status(500).jsonp({ status: false, message: ex.toString() });
            });

            if (!productLineDocument) {
              return res.status(404).jsonp({ status: false, message: "Product line document not found." });
            }


            let onlyOneProductLine = false;
            // Step 4: Case When Only One Product Line Exists
            const activeProductLines = productLineDocument.product_line.filter(x => x.deleted === false);

            if (activeProductLines.length === 1) {

              onlyOneProductLine = true;

              await Promise.all([
                purchase_orders.updateOne({ _id: mongoose.Types.ObjectId(productLineDocument.po_id) },
                  { $set: { deleted: true } },
                  { new: true }),
                purchase_order_details.updateOne({ _awareid: productLineDocument._awareid, po_id: productLineDocument.po_id },
                  { $set: { deleted: true } },
                  { new: true }),
                product_lines.updateOne({ _awareid: productLineDocument._awareid, po_id: productLineDocument.po_id },
                  { $set: { deleted: true } },
                  { new: true }),
                generate_qr.updateOne({ _awareid: productLineDocument._awareid, po_id: productLineDocument.po_id, product_line: req.body.line_id },
                  { $set: { deleted: true } },
                  { new: true })
              ]);
            } else {
              // Step 5: Case When Multiple Product Lines Exist (Soft-delete specific line)
              const indexToDelete = productLineDocument.product_line.findIndex(item => item.id === req.body.line_id);

              if (indexToDelete === -1) {
                return res.status(404).jsonp({
                  status: false,
                  message: "Product line item not found."
                });
              }

              // Soft-delete the product line item by setting the 'deleted' flag
              productLineDocument.product_line[indexToDelete].deleted = true;

              // Save the updated product line document
              await productLineDocument.save();

              // Step 6: Soft-delete corresponding generate_qr entry
              await generate_qr.findOneAndUpdate(
                { _awareid: req.body._awareid, po_id: req.body.po_id, product_line: req.body.line_id, deleted: false },
                { $set: { deleted: true } },
                { new: true }
              );
            }

            return res.status(200).jsonp({
              status: true,
              // message: "Selected Line Item has been marked as deleted successfully",
              message: "Selected Line Item has been deleted successfully",
              authorization: resp.token,
              onlyOneProductLine: onlyOneProductLine,
            });

          } catch (ex) {
            loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
            return res.status(500).jsonp({ status: false, message: ex.toString() });
          }
        } else {
          return res.status(resp.code).jsonp({ status: false, message: null, authorization: null });
        }
      });
    } catch (error) {
      loggerhandler.logger.error(`${error} ,email:${req.headers.email}`);
      return res.status(500).jsonp({ status: false, message: "An unexpected error occurred." });
    }
  },



  generateHardGoodsProductQR: async (req, res, hardGoods_Id) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).jsonp(errors.array());
    } else {
      var payload = { username: req.headers.username };
      refresh(req.headers.authorization, req.headers.userid, payload, async function (resp) {
        if (resp.status == true) {
          try {
            const hard_goods_exist = await hardGoodsBrands.findOneAndUpdate(
              { _id: mongoose.Types.ObjectId(req.body.hardGoods_Id) },
              { $set: { 'qr_generated': true } },
              { new: true } // Returns the updated document
            ).catch((ex) => {
              loggerhandler.logger.error(`${ex}, email:${req.headers.email}`);
              return res.status(500).jsonp({ status: false, message: ex.toString() });
            });


            if (hard_goods_exist) {

              const output = [];
              const map = new Map();

              // Assuming hard_goods_exist has an `id` (or other unique identifier)
              if (!map.has(hard_goods_exist._id.toString())) {
                map.set(hard_goods_exist._id.toString(), true); // set the id
                output.push(hard_goods_exist._id.toString());
              }

              // Generate QR for each unique product in the product_line
              await Promise.allSettled(
                output.map(async (id) => {
                  await callstack.updating_hard_goods_QR(req.body._awareid, id, req);
                })
              ).catch((error) => {
                loggerhandler.logger.error(`${error}, email:${req.headers.email}`);
              });

              return res.status(200).jsonp({ status: true, message: "QR Codes for Hard Goods Product have been generated successfully", authorization: resp.token });
            } else {
              return res.status(200).jsonp({ status: true, message: "Hard Goods Product does not exist", authorization: resp.token });
            }
          } catch (error) {
            loggerhandler.logger.error(`${error}, email:${req.headers.email}`);

          }
        } else {
          return res.status(resp.code).jsonp({ status: false, message: null, authorization: null });
        }
      });
    }
  },


  import_generate_and_download_QR: async (req, res) => {
    console.log("Shivam_req");
    try {
      // console.log("working1", req.body);
      // Step 1: Validate the incoming request payload
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({ status: false, message: "Bad payload received." });
      }

      // Step 2: Extract data from the request
      const insted_ID = req.headers.array_of_id;

      console.log({ insted_ID });

      // console.log("working2", JSON.parse(importData));
      if (!importData || !Array.isArray(JSON.parse(importData)) || JSON.parse(importData).length === 0) {
        return res.status(400).json({ status: false, message: "No data provided for import." });
      }

      // Step 3: Get user details and validate authorization
      const { authorization, userid, username } = req.headers;
      if (!authorization || !userid || !username) {
        return res.status(401).json({ status: false, message: "Missing authorization details." });
      }

      // Step 4: Refresh the authorization token and validate user
      const payload = { username: req.headers.username };
      refresh(authorization, userid, payload, function (refreshResponse) {

        if (refreshResponse.status !== true) {
          return res.status(refreshResponse.code).json({ status: false, message: "Unauthorized access.", authorization: null });
        }





        // Step 5: Prepare the data for insertion (add any missing data like created_date if needed)
        const dataToInsert = JSON.parse(importData).map(item => ({
          ...item,
          created_date: new Date(),
          created_by: username, // Optionally you could add who created the record
        }));

        // Step 6: Insert the data into the database
        console.log("dataToInsert", dataToInsert);
        hardGoodsBrands.create(dataToInsert, async (err, purchaseorder) => {
          if (err) {
            loggerhandler.logger.error(`Error: ${err.message}, email: ${req.headers.email}`);
            return res.status(500).json({ status: false, message: `An error occurred while inserting data: ${err.message}` });
          }


          // Step 7: Send success response with new purchaseorder details
          res.status(200).json({
            status: true, message: "Hard Goods Product has been added successfully.", data: {
              "_id": purchaseorder._id,
              "_awareid": purchaseorder._awareid
            },
            authorization: refreshResponse.token
          });

        });
      });
    } catch (err) {
      // Catch unexpected errors and log them
      loggerhandler.logger.error(`Error: ${err.message}, email: ${req.headers.email}`);
      return res.status(500).json({ status: false, message: `An error occurred: ${err.message}` });
    }
  },



  editDppSetting: async (req, res) => {

    const payload = { username: req.headers.username };

    try {
      // Call the refresh function asynchronously
      const resp = await new Promise((resolve, reject) => {
        refresh(req.headers.authorization, req.headers.userid, payload, (response) => {
          if (response.status === true) {
            resolve(response);
          } else {
            reject(new Error('Failed to refresh token'));
          }
        });
      });

      // Check if the user has the necessary authorization
      if (resp.status === true) {
        // Log the hardGoodsBrands_id
        // Fetch the document from the database
        const hardGoodsBrandsData = await hardGoodsBrands.findOne({ _id: mongoose.Types.ObjectId(req.body.hardGoodsBrands_id) }).catch((ex) => {
          return res.status(500).jsonp({ status: false, message: ex.toString(), authorization: resp.token });
        });

        // Check if the document is found
        if (!hardGoodsBrandsData) {
          return res.status(404).jsonp({ status: false, message: "Product not found.", authorization: resp.token });
        }
        // Update the dpp_settings object with the data from the request body
        const updatedDppSettings = {
          // Retain existing settings if not provided
          care: req.body.dpp_setting.care,
          impact: req.body.dpp_setting.impact,
          circularity: req.body.dpp_setting.circularity,
          journey: req.body.dpp_setting.journey, // If you want to update this, else leave it as is
          sustainablematerialscore: req.body.dpp_setting.sustainablematerialscore,
          branddata: req.body.dpp_setting.branddata,
          header_background_color: req.body.dpp_setting.header_background_color,
          button_accent_color: req.body.dpp_setting.button_accent_color,
        };
        // Update the document with the new dpp_settings values
        await hardGoodsBrands.findOneAndUpdate(
          { _id: mongoose.Types.ObjectId(req.body.hardGoodsBrands_id) },
          { $set: { dpp_settings: updatedDppSettings } },
          { new: true } // Return the updated document
        ).catch((err) => {
          return res.status(500).jsonp({ status: false, message: err.toString(), authorization: resp.token });
        });

        // Return success message
        return res.status(200).json({
          status: true,
          message: "DPP settings have been saved successfully",
          authorization: resp.token
        });

      } else {
        return res.status(resp.code).jsonp({ status: false, message: null, authorization: null });
      }
    } catch (error) {
      // Handle unexpected errors
      console.error("Error:", error);
      return res.status(500).jsonp({ status: false, message: error.message, authorization: null });
    }
  },

  //SHIVAM CHAUHAN



}


