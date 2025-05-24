var mongoose = require("mongoose");
const { body, validationResult, check } = require("express-validator");
var kyc_details = require("../models/kyc_details");
var account_details = require("../models/account_details");
const kyc_status = require("../models/kyc_status");
const user_role = require("../models/user_role");
const requests = require("../models/requests");
const { refresh } = require("../refresh-token");
const notifications = require("../models/notifications");
const source_address = require("../models/source_address");
const aw_tokens = require("../models/aw_tokens");
const update_aw_tokens = require("../models/update_aw_tokens");
const transaction_history = require("../models/transaction_history");
const wallets = require("../models/wallets");
const transferred_tokens = require("../models/transferred-tokens");
const selected_update_aware_token = require("../models/selected_update_aware_token");
const update_physical_asset = require("../models/update_physical_asset");
const update_tracer = require("../models/update_tracer");

const update_self_validation = require("../models/update_self_validation");
const update_company_compliancess = require("../models/update_company_compliancess");
const physical_assets = require("../models/physical_asset");
const tracer = require("../models/tracer");
const purchase_order_details = require("../models/purchase_order_details");
const products = require("../models/products");
const purchase_orders = require("../models/purchase_orders");
const product_lines = require("../models/product_lines");
var callstack = require("../scripts/call-stack");

const draft_info = require("../models/draft_info");
const loggerhandler = require("../logger/log");
const { Readable, Transform } = require("stream");
const selected_receiver = require("../models/selected_receiver");
const selected_aware_token = require("../models/selected_aware_token");

exports.handlers = {
  updateAwareTokenAsync: async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res
        .status(422)
        .jsonp({ status: false, message: "Bad payload received." });
    } else {
      var payload = { username: req.headers.username };
      refresh(
        req.headers.authorization,
        req.headers.userid,
        payload,
        function (resp) {
          if (resp.status == true) {
            update_aw_tokens.create(
              {
                _awareid: req.body._awareid,
                status: "CONCEPT",
                created_date: new Date(),
              },
              async function (err, user) {
                if (err) {
                  loggerhandler.logger.error(
                    `${err} ,email:${req.headers.email}`
                  );
                  return res
                    .status(500)
                    .jsonp({ status: false, message: err.toString() });
                }

                return res.status(200).jsonp({
                  status: true,
                  data: { _id: user._id, _awareid: user._awareid },
                  authorization: resp.token,
                });
              }
            );
          } else {
            return res
              .status(resp.code)
              .jsonp({ status: false, data: null, authorization: null });
          }
        }
      );
    }
  },

  getUpdatedAwareTokensAsync: async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).jsonp(errors.array());
    } else {
      if (
        !req.headers.userid ||
        !req.headers.username ||
        !req.headers.authorization ||
        !req.headers.awareid
      ) {
        return res
          .status(400)
          .jsonp({ status: false, message: "Bad request!" });
      }

      var payload = { username: req.headers.username };
      refresh(
        req.headers.authorization,
        req.headers.userid,
        payload,
        async function (resp) {
          if (resp.status == true) {
            var update_aw_tokens_avaliable = await update_aw_tokens
              .find({
                _awareid: req.headers.awareid,
                status: { $ne: "Approved" },
              })
              .catch((ex) => {
                loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
                return res
                  .status(400)
                  .jsonp({ status: false, message: "Bad request!" });
              });

            if (update_aw_tokens_avaliable.length <= 0) {
              return res
                .status(200)
                .jsonp({ status: true, data: null, authorization: resp.token });
            } else {
              var selected_update_aware_token_avaliable =
                await selected_update_aware_token.find({}).catch((ex) => {
                  loggerhandler.logger.error(
                    `${ex} ,email:${req.headers.email}`
                  );
                  return res
                    .status(400)
                    .jsonp({ status: false, message: "Bad request!" });
                });

              var update_physical_asset_avaliable = await update_physical_asset
                .find({})
                .catch((ex) => {
                  loggerhandler.logger.error(
                    `${ex} ,email:${req.headers.email}`
                  );
                  return res
                    .status(400)
                    .jsonp({ status: false, message: "Bad request!" });
                });

              var jsonData = [];
              for (var i = 0; i < update_aw_tokens_avaliable.length; i++) {
                var temp_update_aw_token = update_aw_tokens_avaliable[i];

                var temp_selected_update_aware_token_avaliable =
                  selected_update_aware_token_avaliable.find(
                    (x) =>
                      x._awareid == temp_update_aw_token._awareid &&
                      x.update_aware_token_id == temp_update_aw_token._id
                  );
                var temp_update_physical_asset_avaliable =
                  update_physical_asset_avaliable.find(
                    (x) =>
                      x._awareid == temp_update_aw_token._awareid &&
                      x.update_aware_token_id == temp_update_aw_token._id
                  );

                var jsonObject = {
                  update_aw_token: temp_update_aw_token,
                  selected_update_aware_token_avaliable:
                    temp_selected_update_aware_token_avaliable
                      ? temp_selected_update_aware_token_avaliable
                      : null,
                  update_physical_asset_avaliable:
                    temp_update_physical_asset_avaliable
                      ? temp_update_physical_asset_avaliable
                      : null,
                };

                jsonData.push(jsonObject);
              }

              return res.status(200).jsonp({
                status: true,
                data: jsonData,
                authorization: resp.token,
              });
            }
          } else {
            return res
              .status(resp.code)
              .jsonp({ status: false, data: null, authorization: null });
          }
        }
      );
    }
  },

  getUpdateAwareTokenDetailsAsync: async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).jsonp(errors.array());
    } else {
      if (
        !req.headers.userid ||
        !req.headers.username ||
        !req.headers.authorization ||
        !req.headers.awareid ||
        !req.headers.update_aware_token_id
      ) {
        return res
          .status(400)
          .jsonp({ status: false, message: "Bad request!" });
      }

      var payload = { username: req.headers.username };
      refresh(
        req.headers.authorization,
        req.headers.userid,
        payload,
        async function (resp) {
          if (resp.status == true) {
            var update_aw_tokens_avaliable = await update_aw_tokens
              .findOne({
                _awareid: req.headers.awareid,
                _id: mongoose.Types.ObjectId(req.headers.update_aware_token_id),
              })
              .catch((ex) => {
                loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
                return res
                  .status(400)
                  .jsonp({ status: false, message: "Bad request!" });
              });

            if (!update_aw_tokens_avaliable) {
              return res
                .status(200)
                .jsonp({ status: true, data: null, authorization: resp.token });
            } else {
              return res.status(200).jsonp({
                status: true,
                data: update_aw_tokens_avaliable,
                authorization: resp.token,
              });
            }
          } else {
            return res
              .status(resp.code)
              .jsonp({ status: false, data: null, authorization: null });
          }
        }
      );
    }
  },

  deleteUpdateAwareTokenAsync: async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res
        .status(422)
        .jsonp({ status: false, message: "Bad payload received." });
    } else {
      await update_aw_tokens
        .deleteOne({
          _awareid: req.body._awareid,
          _id: mongoose.Types.ObjectId(req.body.update_aware_token_id),
        })
        .catch((ex) => {
          loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
          return res
            .status(500)
            .jsonp({ status: false, message: ex.toString() });
        });

      await selected_update_aware_token
        .deleteOne({
          _awareid: req.body._awareid,
          update_aware_token_id: req.body.update_aware_token_id,
        })
        .catch((ex) => {
          loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
          return res
            .status(500)
            .jsonp({ status: false, message: ex.toString() });
        });

      var selected_aware_asset = await update_physical_asset
        .findOne({
          _awareid: req.body._awareid,
          update_aware_token_id: req.body.update_aware_token_id,
        })
        .select(["assetdataArrayMain"])
        .catch((ex) => {
          loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
          return res
            .status(500)
            .jsonp({ status: false, message: ex.toString() });
        });

      const output = [];
      const map = new Map();
      if (selected_aware_asset) {
        for (const item of selected_aware_asset.assetdataArrayMain) {
          if (!map.has(mongoose.Types.ObjectId(item.tt_id))) {
            map.set(mongoose.Types.ObjectId(item.tt_id), true);
            output.push(mongoose.Types.ObjectId(item.tt_id));
          }
        }
      }

      await transferred_tokens
        .updateMany({ _id: { $in: output } }, { locked: false }, { new: true })
        .catch((ex) => {
          loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
          return res
            .status(500)
            .jsonp({ status: false, message: ex.toString() });
        });

      if (req.body.po_id) {
        var product_lines_avaliable = await product_lines
          .findOne({ po_id: req.body.po_id, deleted: false })
          .catch((ex) => {
            loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
            return res
              .status(400)
              .jsonp({ status: false, message: "Bad request!" });
          });

        if (product_lines_avaliable) {
          let product_line = product_lines_avaliable.product_line;
          let elementIndex = product_line.findIndex(
            (obj) => obj.update_aware_token_id == req.body.update_aware_token_id
          );
          product_line[elementIndex].update_status = "SELECT";
          product_line[elementIndex].update_aware_token_id = "";
          product_line[elementIndex].production_quantity = "";
          await product_lines
            .findOneAndUpdate(
              { po_id: req.body.po_id, deleted: false },
              { product_line: product_line },
              { new: true }
            )
            .catch((ex) => {
              loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
              return res
                .status(500)
                .jsonp({ status: false, message: ex.toString() });
            });
        }
      }
      await update_physical_asset
        .deleteOne({
          _awareid: req.body._awareid,
          update_aware_token_id: req.body.update_aware_token_id,
        })
        .catch((ex) => {
          loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
          return res
            .status(500)
            .jsonp({ status: false, message: ex.toString() });
        });

      await update_self_validation
        .deleteOne({
          _awareid: req.body._awareid,
          update_aware_token_id: req.body.update_aware_token_id,
        })
        .catch((ex) => {
          loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
          return res
            .status(500)
            .jsonp({ status: false, message: ex.toString() });
        });

      await update_company_compliancess
        .deleteOne({
          _awareid: req.body._awareid,
          update_aware_token_id: req.body.update_aware_token_id,
        })
        .catch((ex) => {
          loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
          return res
            .status(500)
            .jsonp({ status: false, message: ex.toString() });
        });

      var payload = { username: req.headers.username };
      refresh(
        req.headers.authorization,
        req.headers.userid,
        payload,
        function (resp) {
          if (resp.status == true) {
            return res.status(200).jsonp({
              status: true,
              message: "Token Update request has been deleted successfully",
              authorization: resp.token,
            });
          } else {
            return res
              .status(resp.code)
              .jsonp({ status: false, message: null, authorization: null });
          }
        }
      );
    }
  },

  deleteResetUpdateAwareTokenAsync: async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res
        .status(422)
        .jsonp({ status: false, message: "Bad payload received." });
    } else {
      if (req.body.type == "updatephysicalasset") {
        var selected_aware_asset = await update_physical_asset
          .findOne({
            _awareid: req.body._awareid,
            update_aware_token_id: req.body.update_aware_token_id,
          })
          .select(["assetdataArrayMain"])
          .catch((ex) => {
            loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
            return res
              .status(500)
              .jsonp({ status: false, message: ex.toString() });
          });

        const output = [];
        const map = new Map();
        if (selected_aware_asset) {
          for (const item of selected_aware_asset.assetdataArrayMain) {
            if (!map.has(mongoose.Types.ObjectId(item.tt_id))) {
              map.set(mongoose.Types.ObjectId(item.tt_id), true);
              output.push(mongoose.Types.ObjectId(item.tt_id));
            }
          }
        }

        await transferred_tokens
          .updateMany(
            { _id: { $in: output } },
            { locked: false },
            { new: true }
          )
          .catch((ex) => {
            loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
            return res
              .status(500)
              .jsonp({ status: false, message: ex.toString() });
          });

        await update_physical_asset
          .deleteOne({
            _awareid: req.body._awareid,
            update_aware_token_id: req.body.update_aware_token_id,
          })
          .catch((ex) => {
            loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
            return res
              .status(500)
              .jsonp({ status: false, message: ex.toString() });
          });

        if (req.body.po_id) {
          var product_lines_avaliable = await product_lines
            .findOne({ po_id: req.body.po_id, deleted: false })
            .catch((ex) => {
              loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
              return res
                .status(400)
                .jsonp({ status: false, message: "Bad request!" });
            });

          if (product_lines_avaliable) {
            let product_line = product_lines_avaliable?.product_line;
            let elementIndex = product_line.findIndex(
              (obj) =>
                obj.update_aware_token_id == req.body.update_aware_token_id
            );
            if (elementIndex !== -1) {
              product_line[elementIndex].production_quantity = "";
              await product_lines
                .findOneAndUpdate(
                  { po_id: req.body.po_id, deleted: false },
                  { product_line: product_line },
                  { new: true }
                )
                .catch((ex) => {
                  loggerhandler.logger.error(
                    `${ex} ,email:${req.headers.email}`
                  );
                  console.error("Error updating product lines:", ex);
                  return res
                    .status(500)
                    .jsonp({ status: false, message: ex.toString() });
                });
            } else {
              loggerhandler.logger.warn(
                `Product line item with update_aware_token_id ${req.body.update_aware_token_id} not found in po_id ${req.body.po_id}. Email: ${req.headers.email}`
              );
            }
          }
        }

        await update_aw_tokens
          .findOneAndUpdate(
            {
              _awareid: req.body._awareid,
              _id: mongoose.Types.ObjectId(req.body.update_aware_token_id),
            },
            { create_token_stepper: 1, status: "CONCEPT" },
            { new: true }
          )
          .catch((ex) => {
            loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
            return res
              .status(500)
              .jsonp({ status: false, message: ex.toString() });
          });
      } else if (req.body.type == "updatetracer") {
        await update_tracer
          .deleteOne({
            _awareid: req.body._awareid,
            update_aware_token_id: req.body.update_aware_token_id,
          })
          .catch((ex) => {
            loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
            return res
              .status(500)
              .jsonp({ status: false, message: ex.toString() });
          });

        await update_aw_tokens
          .findOneAndUpdate(
            {
              _awareid: req.body._awareid,
              _id: mongoose.Types.ObjectId(req.body.update_aware_token_id),
            },
            { create_token_stepper: 2, status: "CONCEPT" },
            { new: true }
          )
          .catch((ex) => {
            loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
            return res
              .status(500)
              .jsonp({ status: false, message: ex.toString() });
          });
      } else if (req.body.type == "updateselfvalidation") {
        await update_self_validation
          .deleteOne({
            _awareid: req.body._awareid,
            update_aware_token_id: req.body.update_aware_token_id,
          })
          .catch((ex) => {
            loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
            return res
              .status(500)
              .jsonp({ status: false, message: ex.toString() });
          });

        await update_aw_tokens
          .findOneAndUpdate(
            {
              _awareid: req.body._awareid,
              _id: mongoose.Types.ObjectId(req.body.update_aware_token_id),
            },
            { create_token_stepper: 3, status: "CONCEPT" },
            { new: true }
          )
          .catch((ex) => {
            return res
              .status(500)
              .jsonp({ status: false, message: ex.toString() });
          });
      } else if (req.body.type == "updatecompanycompliance") {
        await update_company_compliancess
          .deleteOne({
            _awareid: req.body._awareid,
            update_aware_token_id: req.body.update_aware_token_id,
          })
          .catch((ex) => {
            loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
            return res
              .status(500)
              .jsonp({ status: false, message: ex.toString() });
          });

        await update_aw_tokens
          .findOneAndUpdate(
            {
              _awareid: req.body._awareid,
              _id: mongoose.Types.ObjectId(req.body.update_aware_token_id),
            },
            { create_token_stepper: 4, status: "CONCEPT" },
            { new: true }
          )
          .catch((ex) => {
            loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
            return res
              .status(500)
              .jsonp({ status: false, message: ex.toString() });
          });
      }

      var payload = { username: req.headers.username };
      refresh(
        req.headers.authorization,
        req.headers.userid,
        payload,
        function (resp) {
          if (resp.status == true) {
            return res.status(200).jsonp({
              status: true,
              message: "Directory has been successfully updated.",
              authorization: resp.token,
            });
          } else {
            return res
              .status(resp.code)
              .jsonp({ status: false, message: null, authorization: null });
          }
        }
      );
    }
  },

  updatePhysicalAssestAsync: async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res
        .status(422)
        .jsonp({ status: false, message: "Bad payload received." });
    } else {
      const update_physical_asset_exist = await update_physical_asset
        .findOne({
          _awareid: req.body._awareid,
          update_aware_token_id: req.body.update_aware_token_id,
        })
        .catch((ex) => {
          loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
          return res
            .status(500)
            .jsonp({ status: false, message: ex.toString() });
        });

      var selected_update_aware_token_avaliable =
        await selected_update_aware_token
          .findOne({
            _awareid: req.body._awareid,
            update_aware_token_id: req.body.update_aware_token_id,
          })
          .catch((ex) => {
            loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
            return res
              .status(400)
              .jsonp({ status: false, message: "Bad request!" });
          });

      var payload = { username: req.headers.username };
      refresh(
        req.headers.authorization,
        req.headers.userid,
        payload,
        async function (resp) {
          if (resp.status == true) {
            var type = req.body.type_of_update;

            if (type == 1) {
              var compositionstring = "";
              var arr = req.body.tempcompositionArrayMain;
              arr.forEach(function (i, idx, array) {
                var element = array[idx];
                if (idx === array.length - 1) {
                  compositionstring =
                    compositionstring +
                    `${element.percentage}% ${
                      element.sustainable == false
                        ? "Conventional"
                        : element.sustainability_claim
                    } ${element.composition_material}${
                      element.feedstock_recycled_materials
                        ? "(" + element.feedstock_recycled_materials + ")"
                        : ""
                    }`;
                } else {
                  compositionstring =
                    compositionstring +
                    `${element.percentage}%  ${
                      element.sustainable == false
                        ? "Conventional"
                        : element.sustainability_claim
                    } ${element.composition_material}${
                      element.feedstock_recycled_materials
                        ? "(" + element.feedstock_recycled_materials + ")"
                        : ""
                    } / `;
                }
              });

              var updated_aware_asset_id = `${req.body._awareid} - ${selected_update_aware_token_avaliable.aware_output_token_type} - ${req.body.material_specs} - ${compositionstring} - ${req.body.main_color} - ${req.body.production_lot}`;

              if (update_physical_asset_exist) {
                update_physical_asset.findOneAndUpdate(
                  {
                    _awareid: req.body._awareid,
                    update_aware_token_id: req.body.update_aware_token_id,
                  },
                  {
                    _awareid: req.body._awareid,
                    update_aware_token_id: req.body.update_aware_token_id,
                    updated_aware_asset_id: updated_aware_asset_id,
                    material_specs: req.body.material_specs,
                    main_color: req.body.main_color,
                    select_main_color: req.body.select_main_color,
                    production_lot: req.body.production_lot,
                    sustainable_processing_location:
                      req.body.sustainable_processing_location,
                    tempcompositionArrayMain: req.body.tempcompositionArrayMain,
                    compositionArrayMain: req.body.compositionArrayMain,
                    assetdataArrayMain: req.body.assetdataArrayMain,
                    orginal_weight: req.body.weight,
                    weight: req.body.weight,
                    sustainable_process_claim:
                      req.body.sustainable_process_claim,
                    wet_processing_t: req.body.wet_processing_t,
                    wet_processing: req.body.wet_processing,
                    sustainable_process_certificates:
                      req.body.sustainable_process_certificates,
                  },
                  { new: true },
                  async function (err, user) {
                    if (err) {
                      loggerhandler.logger.error(
                        `${err} ,email:${req.headers.email}`
                      );
                      return res
                        .status(500)
                        .jsonp({ status: false, message: err.toString() });
                    }

                    await update_aw_tokens
                      .findOneAndUpdate(
                        {
                          _awareid: req.body._awareid,
                          _id: mongoose.Types.ObjectId(
                            req.body.update_aware_token_id
                          ),
                        },
                        { create_token_stepper: 3 },
                        { new: true }
                      )
                      .catch((ex) => {
                        loggerhandler.logger.error(
                          `${ex} ,email:${req.headers.email}`
                        );
                        return res
                          .status(500)
                          .jsonp({ status: false, message: ex.toString() });
                      });

                    return res.status(200).jsonp({
                      status: true,
                      message:
                        "Information entered on Physical Asset page has been saved successfully",
                      authorization: resp.token,
                    });
                  }
                );
              } else {
                const tokenSelected = req.body.assetdataArrayMain;
                for (let i = 0; i < tokenSelected.length; i++) {
                  const token = tokenSelected[i];
                  if (token.tt_id) {
                    const transferredToken = await transferred_tokens
                      .findOne({
                        _id: mongoose.Types.ObjectId(token.tt_id),
                      })
                      .select(["locked"]);

                    console.log("transferredToken", transferredToken);

                    if (transferredToken && transferredToken.locked) {
                      return res.status(401).jsonp({
                        status: false,
                        message: "Selected token is already locked.",
                      });
                    }
                  }
                }
                const output = [];
                const map = new Map();
                for (const item of req.body.assetdataArrayMain) {
                  if (!map.has(mongoose.Types.ObjectId(item.tt_id))) {
                    map.set(mongoose.Types.ObjectId(item.tt_id), true);
                    output.push(mongoose.Types.ObjectId(item.tt_id));
                  }
                }

                await transferred_tokens
                  .updateMany(
                    { _id: { $in: output } },
                    { locked: true },
                    { new: true }
                  )
                  .catch((ex) => {
                    loggerhandler.logger.error(
                      `${ex} ,email:${req.headers.email}`
                    );
                    return res
                      .status(500)
                      .jsonp({ status: false, message: ex.toString() });
                  });

                update_physical_asset.create(
                  {
                    _awareid: req.body._awareid,
                    update_aware_token_id: req.body.update_aware_token_id,
                    updated_aware_asset_id: updated_aware_asset_id,
                    material_specs: req.body.material_specs,
                    main_color: req.body.main_color,
                    select_main_color: req.body.select_main_color,
                    production_lot: req.body.production_lot,
                    sustainable_processing_location:
                      req.body.sustainable_processing_location,
                    tempcompositionArrayMain: req.body.tempcompositionArrayMain,

                    compositionArrayMain: req.body.compositionArrayMain,
                    assetdataArrayMain: req.body.assetdataArrayMain,
                    orginal_weight: req.body.weight,
                    weight: req.body.weight,
                    sustainable_process_claim:
                      req.body.sustainable_process_claim,
                    wet_processing_t: req.body.wet_processing_t,
                    wet_processing: req.body.wet_processing,
                    sustainable_process_certificates:
                      req.body.sustainable_process_certificates,
                  },
                  async function (err, user) {
                    if (err) {
                      loggerhandler.logger.error(
                        `${err} ,email:${req.headers.email}`
                      );
                      return res
                        .status(500)
                        .jsonp({ status: false, message: err.toString() });
                    }

                    await update_aw_tokens
                      .findOneAndUpdate(
                        {
                          _awareid: req.body._awareid,
                          _id: mongoose.Types.ObjectId(
                            req.body.update_aware_token_id
                          ),
                        },
                        { create_token_stepper: 3 },
                        { new: true }
                      )
                      .catch((ex) => {
                        loggerhandler.logger.error(
                          `${ex} ,email:${req.headers.email}`
                        );
                        return res
                          .status(500)
                          .jsonp({ status: false, message: ex.toString() });
                      });

                    return res.status(200).jsonp({
                      status: true,
                      message:
                        "Information entered on Physical Asset page has been saved successfully",
                      authorization: resp.token,
                    });
                  }
                );
              }
            } else if (type == 2) {
              const product_lines_avaliable = await product_lines
                .findOne({ po_id: req.body.po_id, deleted: false })
                .catch((ex) => {
                  loggerhandler.logger.error(
                    `${ex} ,email:${req.headers.email}`
                  );
                  return res
                    .status(400)
                    .jsonp({ status: false, message: "Bad request!" });
                });

              const particular_product_line =
                product_lines_avaliable.product_line.find(
                  (item) =>
                    item.update_aware_token_id == req.body.update_aware_token_id
                );

              var compositionstring = "";

              var updated_aware_asset_id = `${req.body._awareid} - ${selected_update_aware_token_avaliable.aware_output_token_type} - ${particular_product_line?.order_number} - ${particular_product_line?.item_number} - ${particular_product_line?.description} - ${req.body.main_color} - ${req.body.production_lot}`;

              if (update_physical_asset_exist) {
                update_physical_asset.findOneAndUpdate(
                  {
                    _awareid: req.body._awareid,
                    update_aware_token_id: req.body.update_aware_token_id,
                  },
                  {
                    _awareid: req.body._awareid,
                    update_aware_token_id: req.body.update_aware_token_id,
                    updated_aware_asset_id: updated_aware_asset_id,
                    main_color: req.body.main_color,
                    select_main_color: req.body.select_main_color,
                    production_lot: req.body.production_lot,
                    tempcompositionArrayMain:
                      req?.body?.tempcompositionArrayMain || [],
                    compositionArrayMain: req.body.compositionArrayMain,
                    assetdataArrayMain: req.body.assetdataArrayMain,
                    quantity: req.body.quantity,
                    orginal_weight: req.body.weight,
                    weight: req.body.weight,
                    sustainable_process_claim:
                      req.body.sustainable_process_claim,
                    wet_processing_t: req.body.wet_processing_t,
                    wet_processing: req.body.wet_processing,
                    sustainable_process_certificates:
                      req.body.sustainable_process_certificates,
                    type_of_update: req.body.type_of_update,
                    sustainable_processing_location:
                      req.body.sustainable_processing_location,
                  },
                  { new: true },
                  async function (err, user) {
                    if (err) {
                      loggerhandler.logger.error(
                        `${err} ,email:${req.headers.email}`
                      );
                      return res
                        .status(500)
                        .jsonp({ status: false, message: err.toString() });
                    }
                    if (req.body.po_id) {
                      var product_lines_avaliable = await product_lines
                        .findOne({ po_id: req.body.po_id, deleted: false })
                        .catch((ex) => {
                          loggerhandler.logger.error(
                            `${ex} ,email:${req.headers.email}`
                          );
                          return res
                            .status(400)
                            .jsonp({ status: false, message: "Bad request!" });
                        });

                      if (product_lines_avaliable) {
                        let product_line = product_lines_avaliable.product_line;
                        let elementIndex = product_line.findIndex(
                          (obj) =>
                            obj.update_aware_token_id ==
                            req.body.update_aware_token_id
                        );
                        if (elementIndex !== -1) {
                          product_line[elementIndex].production_quantity =
                            req.body.quantity;
                          await product_lines
                            .findOneAndUpdate(
                              { po_id: req.body.po_id, deleted: false },
                              { product_line: product_line },
                              { new: true }
                            )
                            .catch((ex) => {
                              loggerhandler.logger.error(
                                `${ex} ,email:${req.headers.email}`
                              );
                              return res.status(500).jsonp({
                                status: false,
                                message: ex.toString(),
                              });
                            });
                        } else {
                          loggerhandler.logger.warn(
                            `Product line item with update_aware_token_id ${req.body.update_aware_token_id} not found in po_id ${req.body.po_id}. Email: ${req.headers.email}`
                          );
                        }
                      }
                    }

                    await update_aw_tokens
                      .findOneAndUpdate(
                        {
                          _awareid: req.body._awareid,
                          _id: mongoose.Types.ObjectId(
                            req.body.update_aware_token_id
                          ),
                        },
                        { create_token_stepper: 3 },
                        { new: true }
                      )
                      .catch((ex) => {
                        loggerhandler.logger.error(
                          `${ex} ,email:${req.headers.email}`
                        );
                        return res
                          .status(500)
                          .jsonp({ status: false, message: ex.toString() });
                      });

                    return res.status(200).jsonp({
                      status: true,
                      message:
                        "Information entered on Physical Asset page has been saved successfully",
                      authorization: resp.token,
                    });
                  }
                );
              } else {
                const tokenSelected = req.body.assetdataArrayMain;
                for (let i = 0; i < tokenSelected.length; i++) {
                  const token = tokenSelected[i];
                  if (token.tt_id) {
                    const transferredToken = await transferred_tokens
                      .findOne({
                        _id: mongoose.Types.ObjectId(token.tt_id),
                      })
                      .select(["locked"]);

                    console.log("transferredToken", transferredToken);

                    if (transferredToken && transferredToken.locked) {
                      return res.status(401).jsonp({
                        status: false,
                        message: "Selected token is already locked.",
                      });
                    }
                  }
                }
                const output = [];
                const map = new Map();
                for (const item of req.body.assetdataArrayMain) {
                  if (!map.has(mongoose.Types.ObjectId(item.tt_id))) {
                    map.set(mongoose.Types.ObjectId(item.tt_id), true);
                    output.push(mongoose.Types.ObjectId(item.tt_id));
                  }
                }

                await transferred_tokens
                  .updateMany(
                    { _id: { $in: output } },
                    { locked: true },
                    { new: true }
                  )
                  .catch((ex) => {
                    loggerhandler.logger.error(
                      `${ex} ,email:${req.headers.email}`
                    );
                    return res
                      .status(500)
                      .jsonp({ status: false, message: ex.toString() });
                  });

                update_physical_asset.create(
                  {
                    _awareid: req.body._awareid,
                    update_aware_token_id: req.body.update_aware_token_id,
                    updated_aware_asset_id: updated_aware_asset_id,
                    main_color: req.body.main_color,
                    select_main_color: req.body.select_main_color,
                    production_lot: req.body.production_lot,
                    tempcompositionArrayMain: req.body.tempcompositionArrayMain,
                    compositionArrayMain: req.body.compositionArrayMain,
                    assetdataArrayMain: req.body.assetdataArrayMain,
                    quantity: req.body.quantity,
                    orginal_weight: req.body.weight,
                    weight: req.body.weight,
                    sustainable_process_claim:
                      req.body.sustainable_process_claim,
                    wet_processing_t: req.body.wet_processing_t,
                    wet_processing: req.body.wet_processing,
                    sustainable_process_certificates:
                      req.body.sustainable_process_certificates,
                    type_of_update: req.body.type_of_update,
                    sustainable_processing_location:
                      req.body.sustainable_processing_location,
                  },
                  async function (err, user) {
                    if (err) {
                      loggerhandler.logger.error(
                        `${err} ,email:${req.headers.email}`
                      );
                      return res
                        .status(500)
                        .jsonp({ status: false, message: err.toString() });
                    }
                    if (req.body.po_id) {
                      var product_lines_avaliable = await product_lines
                        .findOne({ po_id: req.body.po_id, deleted: false })
                        .catch((ex) => {
                          loggerhandler.logger.error(
                            `${ex} ,email:${req.headers.email}`
                          );
                          return res
                            .status(400)
                            .jsonp({ status: false, message: "Bad request!" });
                        });

                      if (product_lines_avaliable) {
                        let product_line = product_lines_avaliable.product_line;
                        let elementIndex = product_line.findIndex(
                          (obj) =>
                            obj.update_aware_token_id ==
                            req.body.update_aware_token_id
                        );

                        if (elementIndex !== -1) {
                          product_line[elementIndex].production_quantity =
                            req.body.quantity;
                          await product_lines
                            .findOneAndUpdate(
                              { po_id: req.body.po_id, deleted: false },
                              { product_line: product_line },
                              { new: true }
                            )
                            .catch((ex) => {
                              loggerhandler.logger.error(
                                `${ex} ,email:${req.headers.email}`
                              );
                              return res.status(500).jsonp({
                                status: false,
                                message: ex.toString(),
                              });
                            });
                        } else {
                          loggerhandler.logger.warn(
                            `Product line item with update_aware_token_id ${req.body.update_aware_token_id} not found in po_id ${req.body.po_id}. Email: ${req.headers.email}`
                          );
                        }
                      }
                    }

                    await update_aw_tokens
                      .findOneAndUpdate(
                        {
                          _awareid: req.body._awareid,
                          _id: mongoose.Types.ObjectId(
                            req.body.update_aware_token_id
                          ),
                        },
                        { create_token_stepper: 3 },
                        { new: true }
                      )
                      .catch((ex) => {
                        loggerhandler.logger.error(
                          `${ex} ,email:${req.headers.email}`
                        );
                        return res
                          .status(500)
                          .jsonp({ status: false, message: ex.toString() });
                      });

                    return res.status(200).jsonp({
                      status: true,
                      message:
                        "Information entered on Physical Asset page has been saved successfully",
                      authorization: resp.token,
                    });
                  }
                );
              }
            }
          } else {
            return res
              .status(resp.code)
              .jsonp({ status: false, message: null, authorization: null });
          }
        }
      );
    }
  },

  getUpdatedPhyscialAssetsAsync: async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).jsonp(errors.array());
    } else {
      if (
        !req.headers.userid ||
        !req.headers.username ||
        !req.headers.authorization ||
        !req.headers.awareid ||
        !req.headers.update_aware_token_id
      ) {
        return res
          .status(400)
          .jsonp({ status: false, message: "Bad request!" });
      }

      var payload = { username: req.headers.username };
      refresh(
        req.headers.authorization,
        req.headers.userid,
        payload,
        async function (resp) {
          if (resp.status == true) {
            var update_physical_asset_avaliable = await update_physical_asset
              .findOne({
                _awareid: req.headers.awareid,
                update_aware_token_id: req.headers.update_aware_token_id,
              })
              .catch((ex) => {
                loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
                return res
                  .status(400)
                  .jsonp({ status: false, message: "Bad request!" });
              });
            if (!update_physical_asset_avaliable) {
              return res
                .status(200)
                .jsonp({ status: true, data: null, authorization: resp.token });
            } else {
              return res.status(200).jsonp({
                status: true,
                data: update_physical_asset_avaliable,
                authorization: resp.token,
              });
            }
          } else {
            return res
              .status(resp.code)
              .jsonp({ status: false, data: null, authorization: null });
          }
        }
      );
    }
  },

  updateTracerAsync: async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res
        .status(422)
        .jsonp({ status: false, message: "Bad payload received." });
    }

    try {
      const updateTracerExist = await update_tracer.findOne({
        _awareid: req.body._awareid,
        update_aware_token_id: req.body.update_aware_token_id,
      });
      const payload = { username: req.headers.username };

      refresh(
        req.headers.authorization,
        req.headers.userid,
        payload,
        async (resp) => {
          if (resp.status == true) {
            const updateData = {
              _awareid: req.body._awareid,
              update_aware_token_id: req.body.update_aware_token_id,
              tracer_added: req.body.Traceradded,
              type_selection: req.body.type_selection,
              aware_tc_checked: req.body.awareTracerTC,
              custom_tc_checked: req.body.customTracerTC,
              aware_date: req.body.awareDate
                ? new Date(req.body.awareDate)
                : null,
              custom_date: req.body.customDate
                ? new Date(req.body.customDate)
                : null,
              custom_name: req.body.customName,
              aware_licences: req.body.Awarelicence,
              tracer_pdf:
                req.body.aware_or_custom_tarcer_pdf &&
                req.body.aware_or_custom_tarcer_pdf !== "null"
                  ? req.body.aware_or_custom_tarcer_pdf
                  : (req.body.type_selection ===
                    updateTracerExist?.type_selection
                      ? updateTracerExist?.tracer_pdf
                      : null) || null,
            };

            if (updateTracerExist) {
              await update_tracer.findOneAndUpdate(
                {
                  _awareid: req.body._awareid,
                  update_aware_token_id: req.body.update_aware_token_id,
                },
                updateData,
                { new: true }
              );
            } else {
              await update_tracer.create(updateData);
            }

            await update_aw_tokens.findOneAndUpdate(
              {
                _awareid: req.body._awareid,
                _id: mongoose.Types.ObjectId(req.body.update_aware_token_id),
              },
              { create_token_stepper: 4 },
              { new: true }
            );

            return res.status(200).jsonp({
              status: true,
              message:
                "Information entered on Tracer page has been saved successfully",
              authorization: resp.token,
            });
          } else {
            return res
              .status(resp.code)
              .jsonp({ status: false, message: null, authorization: null });
          }
        }
      );
    } catch (ex) {
      loggerhandler.logger.error(`${ex}, email:${req.headers.email}`);
      return res.status(500).jsonp({ status: false, message: ex.toString() });
    }
  },

  getUpdatedTracerAsync: async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).jsonp(errors.array());
    } else {
      if (
        !req.headers.userid ||
        !req.headers.username ||
        !req.headers.authorization ||
        !req.headers.awareid ||
        !req.headers.update_aware_token_id
      ) {
        return res
          .status(400)
          .jsonp({ status: false, message: "Bad request!" });
      }

      var payload = { username: req.headers.username };
      refresh(
        req.headers.authorization,
        req.headers.userid,
        payload,
        async function (resp) {
          if (resp.status == true) {
            var update_tracer_avaliable = await update_tracer
              .findOne({
                _awareid: req.headers.awareid,
                update_aware_token_id: req.headers.update_aware_token_id,
              })
              .catch((ex) => {
                loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
                return res
                  .status(400)
                  .jsonp({ status: false, message: "Bad request!" });
              });

            if (!update_tracer_avaliable) {
              return res
                .status(200)
                .jsonp({ status: true, data: null, authorization: resp.token });
            } else {
              return res.status(200).jsonp({
                status: true,
                data: update_tracer_avaliable,
                authorization: resp.token,
              });
            }
          } else {
            return res
              .status(resp.code)
              .jsonp({ status: false, data: null, authorization: null });
          }
        }
      );
    }
  },

  updateSelfValidationAsync: async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res
        .status(422)
        .jsonp({ status: false, message: "Bad payload received." });
    } else {
      let sustainble_material = JSON.parse(req.body.sustainble_material);

      const update_self_validation_exist = await update_self_validation
        .findOne({
          _awareid: req.body._awareid,
          update_aware_token_id: req.body.update_aware_token_id,
        })
        .catch((ex) => {
          loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
          return res
            .status(500)
            .jsonp({ status: false, message: ex.toString() });
        });

      var payload = { username: req.headers.username };
      refresh(
        req.headers.authorization,
        req.headers.userid,
        payload,
        async function (resp) {
          if (resp.status == true) {
            if (update_self_validation_exist) {
              update_self_validation.findOneAndUpdate(
                {
                  _awareid: req.body._awareid,
                  update_aware_token_id: req.body.update_aware_token_id,
                },
                {
                  _awareid: req.body._awareid,
                  update_aware_token_id: req.body.update_aware_token_id,
                  declaraction_number: req.body.declaraction_number,
                  sustainble_material: sustainble_material,
                },
                { new: true },
                async function (err, user) {
                  if (err) {
                    loggerhandler.logger.error(
                      `${err} ,email:${req.headers.email}`
                    );
                    return res
                      .status(500)
                      .jsonp({ status: false, message: err.toString() });
                  }

                  await update_aw_tokens
                    .findOneAndUpdate(
                      {
                        _awareid: req.body._awareid,
                        _id: mongoose.Types.ObjectId(
                          req.body.update_aware_token_id
                        ),
                      },
                      { create_token_stepper: 5 },
                      { new: true }
                    )
                    .catch((ex) => {
                      loggerhandler.logger.error(
                        `${ex} ,email:${req.headers.email}`
                      );
                      return res
                        .status(500)
                        .jsonp({ status: false, message: ex.toString() });
                    });

                  return res.status(200).jsonp({
                    status: true,
                    message:
                      "Information entered on Self Validation page has been saved successfully",
                    authorization: resp.token,
                  });
                }
              );
            } else {
              update_self_validation.create(
                {
                  _awareid: req.body._awareid,
                  update_aware_token_id: req.body.update_aware_token_id,
                  declaraction_number: req.body.declaraction_number,

                  sustainble_material: sustainble_material,
                },
                async function (err, user) {
                  if (err) {
                    loggerhandler.logger.error(
                      `${err} ,email:${req.headers.email}`
                    );
                    return res
                      .status(500)
                      .jsonp({ status: false, message: err.toString() });
                  }

                  await update_aw_tokens
                    .findOneAndUpdate(
                      {
                        _awareid: req.body._awareid,
                        _id: mongoose.Types.ObjectId(
                          req.body.update_aware_token_id
                        ),
                      },
                      { create_token_stepper: 5 },
                      { new: true }
                    )
                    .catch((ex) => {
                      console.log("ex", ex);
                      loggerhandler.logger.error(
                        `${ex} ,email:${req.headers.email}`
                      );
                      return res
                        .status(500)
                        .jsonp({ status: false, message: ex.toString() });
                    });

                  return res.status(200).jsonp({
                    status: true,
                    message:
                      "Information entered on Self Validation page has been saved successfully",
                    authorization: resp.token,
                  });
                }
              );
            }
          } else {
            return res
              .status(resp.code)
              .jsonp({ status: false, message: null, authorization: null });
          }
        }
      );
    }
  },

  getUpdatedSelfValidationAsync: async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).jsonp(errors.array());
    } else {
      if (
        !req.headers.userid ||
        !req.headers.username ||
        !req.headers.authorization ||
        !req.headers.awareid ||
        !req.headers.update_aware_token_id
      ) {
        return res
          .status(400)
          .jsonp({ status: false, message: "Bad request!" });
      }

      var payload = { username: req.headers.username };
      refresh(
        req.headers.authorization,
        req.headers.userid,
        payload,
        async function (resp) {
          if (resp.status == true) {
            var update_self_validation_avaliable = await update_self_validation
              .findOne({
                _awareid: req.headers.awareid,
                update_aware_token_id: req.headers.update_aware_token_id,
              })
              .catch((ex) => {
                loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
                return res
                  .status(400)
                  .jsonp({ status: false, message: "Bad request!" });
              });

            if (!update_self_validation_avaliable) {
              return res
                .status(200)
                .jsonp({ status: true, data: null, authorization: resp.token });
            } else {
              return res.status(200).jsonp({
                status: true,
                data: update_self_validation_avaliable,
                authorization: resp.token,
              });
            }
          } else {
            return res
              .status(resp.code)
              .jsonp({ status: false, data: null, authorization: null });
          }
        }
      );
    }
  },

  updateCompanyComplianceAsync: async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res
        .status(422)
        .jsonp({ status: false, message: "Bad payload received." });
    } else {
      const update_company_compliancess_exist =
        await update_company_compliancess
          .findOne({
            _awareid: req.body._awareid,
            update_aware_token_id: req.body.update_aware_token_id,
          })
          .catch((ex) => {
            loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
            return res
              .status(500)
              .jsonp({ status: false, message: ex.toString() });
          });

      var payload = { username: req.headers.username };
      refresh(
        req.headers.authorization,
        req.headers.userid,
        payload,
        async function (resp) {
          if (resp.status == true) {
            if (update_company_compliancess_exist) {
              update_company_compliancess.findOneAndUpdate(
                {
                  _awareid: req.body._awareid,
                  update_aware_token_id: req.body.update_aware_token_id,
                },
                {
                  _awareid: req.body._awareid,
                  update_aware_token_id: req.body.update_aware_token_id,
                  isselected: req.body.isselected,
                  environmental_scope_certificates:
                    req.body.environmental_scope_certificates,
                  social_compliance_certificates:
                    req.body.social_compliance_certificates,
                  chemical_compliance_certificates:
                    req.body.chemical_compliance_certificates,
                },
                { new: true },
                async function (err, user) {
                  if (err) {
                    loggerhandler.logger.error(
                      `${err} ,email:${req.headers.email}`
                    );
                    return res
                      .status(500)
                      .jsonp({ status: false, message: err.toString() });
                  }

                  await update_aw_tokens
                    .findOneAndUpdate(
                      {
                        _awareid: req.body._awareid,
                        _id: mongoose.Types.ObjectId(
                          req.body.update_aware_token_id
                        ),
                      },
                      { create_token_stepper: 6 },
                      { new: true }
                    )
                    .catch((ex) => {
                      loggerhandler.logger.error(
                        `${ex} ,email:${req.headers.email}`
                      );
                      return res
                        .status(500)
                        .jsonp({ status: false, message: ex.toString() });
                    });

                  return res.status(200).jsonp({
                    status: true,
                    message:
                      "Information entered on Company Compliances page has been saved successfully",
                    authorization: resp.token,
                  });
                }
              );
            } else {
              update_company_compliancess.create(
                {
                  _awareid: req.body._awareid,
                  update_aware_token_id: req.body.update_aware_token_id,
                  environmental_scope_certificates:
                    req.body.environmental_scope_certificates,
                  social_compliance_certificates:
                    req.body.social_compliance_certificates,
                  chemical_compliance_certificates:
                    req.body.chemical_compliance_certificates,
                },
                async function (err, user) {
                  if (err) {
                    loggerhandler.logger.error(
                      `${err} ,email:${req.headers.email}`
                    );
                    return res
                      .status(500)
                      .jsonp({ status: false, message: err.toString() });
                  }

                  await update_aw_tokens
                    .findOneAndUpdate(
                      {
                        _awareid: req.body._awareid,
                        _id: mongoose.Types.ObjectId(
                          req.body.update_aware_token_id
                        ),
                      },
                      { create_token_stepper: 6 },
                      { new: true }
                    )
                    .catch((ex) => {
                      loggerhandler.logger.error(
                        `${ex} ,email:${req.headers.email}`
                      );
                      return res
                        .status(500)
                        .jsonp({ status: false, message: ex.toString() });
                    });

                  return res.status(200).jsonp({
                    status: true,
                    message:
                      "Information entered on Company Compliances page has been saved successfully",
                    authorization: resp.token,
                  });
                }
              );
            }
          } else {
            return res
              .status(resp.code)
              .jsonp({ status: false, message: null, authorization: null });
          }
        }
      );
    }
  },

  getUpdateCompanyComplianceAsync: async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).jsonp(errors.array());
    } else {
      if (
        !req.headers.userid ||
        !req.headers.username ||
        !req.headers.authorization ||
        !req.headers.awareid ||
        !req.headers.update_aware_token_id
      ) {
        return res
          .status(400)
          .jsonp({ status: false, message: "Bad request!" });
      }

      var payload = { username: req.headers.username };
      refresh(
        req.headers.authorization,
        req.headers.userid,
        payload,
        async function (resp) {
          if (resp.status == true) {
            var cupdate_company_compliancess_avaliable =
              await update_company_compliancess
                .findOne({
                  _awareid: req.headers.awareid,
                  update_aware_token_id: req.headers.update_aware_token_id,
                })
                .catch((ex) => {
                  loggerhandler.logger.error(
                    `${ex} ,email:${req.headers.email}`
                  );
                  return res
                    .status(400)
                    .jsonp({ status: false, message: "Bad request!" });
                });

            if (!cupdate_company_compliancess_avaliable) {
              return res
                .status(200)
                .jsonp({ status: true, data: null, authorization: resp.token });
            } else {
              return res.status(200).jsonp({
                status: true,
                data: cupdate_company_compliancess_avaliable,
                authorization: resp.token,
              });
            }
          } else {
            return res
              .status(resp.code)
              .jsonp({ status: false, data: null, authorization: null });
          }
        }
      );
    }
  },

  postUpdatedDigitalTwinAsync: async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res
        .status(422)
        .jsonp({ status: false, message: "Bad payload received." });
    } else {
      var payload = { username: req.headers.username };
      refresh(
        req.headers.authorization,
        req.headers.userid,
        payload,
        async function (resp) {
          if (resp.status == true) {
            if (req.body.po_id && req.body.draft_id) {
              var product_lines_avaliable = await product_lines
                .findOne({ po_id: req.body.po_id, deleted: false })
                .catch((ex) => {
                  loggerhandler.logger.error(
                    `${ex} ,email:${req.headers.email}`
                  );
                  return res
                    .status(400)
                    .jsonp({ status: false, message: "Bad request!" });
                });

              if (product_lines_avaliable) {
                let product_line = product_lines_avaliable?.product_line;

                let eleIndex = product_line.findIndex(
                  (obj) =>
                    obj.update_aware_token_id == req.body.update_aware_token_id
                );

                if (product_line[eleIndex].update_status == "DONE") {
                  return res.status(401).jsonp({
                    status: false,
                    message:
                      "Token request already submitted by another sub-user.",
                    isLocked: true,
                    authorization: null,
                  });
                }

                var update_physical_assets_found = await update_physical_asset
                  .findOne({
                    update_aware_token_id: req.body.update_aware_token_id,
                  })
                  .catch((ex) => {
                    loggerhandler.logger.error(
                      `${ex} ,email:${req.headers.email}`
                    );
                    return res
                      .status(500)
                      .jsonp({ status: false, message: ex.toString() });
                  });

                await Promise.allSettled(
                  update_physical_assets_found.assetdataArrayMain.map(
                    async (dataset) => {
                      await callstack.unlockedTheLockedTokens(dataset, req);
                    }
                  )
                ).catch((error) => {
                  loggerhandler.logger.error(
                    `${error} ,email:${req.headers.email}`
                  );
                });

                let elementIndex = product_line.findIndex(
                  (obj) =>
                    obj.update_aware_token_id == req.body.update_aware_token_id
                );
                product_line[elementIndex].update_status = "DONE";
                product_line[elementIndex].draft_id = req.body.draft_id;

                let po_ids = [];
                var draft_info_avalible = await draft_info
                  .findOne({ _id: mongoose.Types.ObjectId(req.body.draft_id) })
                  .catch((ex) => {
                    loggerhandler.logger.error(
                      `${ex} ,email:${req.headers.email}`
                    );
                    return res
                      .status(500)
                      .jsonp({ status: false, message: ex.toString() });
                  });

                if (draft_info_avalible.order_lines_in_current_request) {
                  draft_info_avalible.order_lines_in_current_request.forEach(
                    (element) => {
                      po_ids.push(element);
                    }
                  );
                }
                if (
                  draft_info_avalible.order_lines_in_current_request.some(
                    (ele) => ele == product_line[elementIndex].id
                  ) == false
                ) {
                  po_ids.push(product_line[elementIndex].id);
                }

                await draft_info
                  .findOneAndUpdate(
                    { _id: mongoose.Types.ObjectId(req.body.draft_id) },
                    { order_lines_in_current_request: po_ids, status: "Done" },
                    { new: true }
                  )
                  .catch((ex) => {
                    loggerhandler.logger.error(
                      `${ex} ,email:${req.headers.email}`
                    );
                    return res
                      .status(500)
                      .jsonp({ status: false, message: ex.toString() });
                  });

                await product_lines
                  .findOneAndUpdate(
                    { po_id: req.body.po_id, deleted: false },
                    { product_line: product_line },
                    { new: true }
                  )
                  .catch((ex) => {
                    loggerhandler.logger.error(
                      `${ex} ,email:${req.headers.email}`
                    );
                    return res
                      .status(500)
                      .jsonp({ status: false, message: ex.toString() });
                  });

                return res.status(200).jsonp({
                  status: true,
                  message:
                    "Information entered on Update Digital Twin has been saved successfully",
                  authorization: resp.token,
                });
              }
            } else {
              const updateToken = await update_aw_tokens
                .findOne({
                  _id: mongoose.Types.ObjectId(req.body.update_aware_token_id),
                })
                .catch((ex) => {
                  loggerhandler.logger.error(
                    `${ex} ,email:${req.headers.email}`
                  );
                  return res
                    .status(400)
                    .jsonp({ status: false, message: "Bad request!" });
                });

              if (updateToken && updateToken.status.toLowerCase() === "send") {
                return res.status(401).jsonp({
                  status: false,
                  message:
                    "Token request already submitted by another sub-user.",
                  isLocked: true,
                  authorization: null,
                });
              }

              console.log("After if");

              var update_physical_assets_found = await update_physical_asset
                .findOne({
                  update_aware_token_id: req.body.update_aware_token_id,
                })
                .catch((ex) => {
                  loggerhandler.logger.error(
                    `${ex} ,email:${req.headers.email}`
                  );
                  return res
                    .status(500)
                    .jsonp({ status: false, message: ex.toString() });
                });

              await Promise.allSettled(
                update_physical_assets_found.assetdataArrayMain.map(
                  async (dataset) => {
                    await callstack.unlockedTheLockedTokens(dataset, req);
                  }
                )
              ).catch((error) => {
                loggerhandler.logger.error(
                  `${error} ,email:${req.headers.email}`
                );
              });

              let update_aw_token = await update_aw_tokens
                .findOneAndUpdate(
                  {
                    _awareid: req.body._awareid,
                    _id: mongoose.Types.ObjectId(
                      req.body.update_aware_token_id
                    ),
                  },
                  { status: "SEND" },
                  { new: true }
                )
                .catch((ex) => {
                  return res
                    .status(400)
                    .jsonp({ status: false, message: "Bad request!" });
                });

              let kyc_detail = await kyc_details
                .findOne({ aware_id: req.body._awareid })
                .catch((ex) => {
                  loggerhandler.logger.error(
                    `${ex} ,email:${req.headers.email}`
                  );
                  return res
                    .status(400)
                    .jsonp({ status: false, message: "Bad request!" });
                });

              await notifications.create({
                notification_sent_to: kyc_detail.manager_id,
                message: `You have received a new request for ${
                  update_aw_token?.total_tokens || ""
                } token approval `,
              });

              var update_aw_tokens_avaliable = await update_aw_tokens
                .find({
                  _awareid: req.body._awareid,
                  status: "CONCEPT",
                  create_token_stepper: 1,
                })
                .catch((ex) => {
                  loggerhandler.logger.error(
                    `${ex} ,email:${req.headers.email}`
                  );
                  return res
                    .status(400)
                    .jsonp({ status: false, message: "Bad request!" });
                });

              const output = [];
              const map = new Map();
              for (const item of update_aw_tokens_avaliable) {
                if (!map.has(mongoose.Types.ObjectId(item._id))) {
                  map.set(mongoose.Types.ObjectId(item._id), true);
                  output.push(mongoose.Types.ObjectId(item._id));
                }
              }

              await update_aw_tokens
                .deleteMany({ _id: { $in: output } })
                .catch((ex) => {
                  loggerhandler.logger.error(
                    `${ex} ,email:${req.headers.email}`
                  );
                  return res
                    .status(400)
                    .jsonp({ status: false, message: "Bad request!" });
                });

              return res.status(200).jsonp({
                status: true,
                message:
                  "Your Update token request has been sent to your manager for approval.",
                authorization: resp.token,
              });
            }
          } else {
            return res
              .status(resp.code)
              .jsonp({ status: false, message: null, authorization: null });
          }
        }
      );
    }
  },

  getUpdatedDigitalTwinAsync: async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).jsonp(errors.array());
    } else {
      if (
        !req.headers.userid ||
        !req.headers.username ||
        !req.headers.authorization ||
        !req.headers.awareid ||
        !req.headers.update_aware_token_id
      ) {
        return res
          .status(400)
          .jsonp({ status: false, message: "Bad request!" });
      }

      var payload = { username: req.headers.username };
      refresh(
        req.headers.authorization,
        req.headers.userid,
        payload,
        async function (resp) {
          if (resp.status == true) {
            var kyc_details_avaliable = await kyc_details
              .findOne({ aware_id: req.headers.awareid })
              .catch((ex) => {
                loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
                return res
                  .status(400)
                  .jsonp({ status: false, message: "Bad request!" });
              });

            var selected_update_aware_token_avaliable =
              await selected_update_aware_token
                .findOne({
                  _awareid: req.headers.awareid,
                  update_aware_token_id: req.headers.update_aware_token_id,
                })
                .catch((ex) => {
                  loggerhandler.logger.error(
                    `${ex} ,email:${req.headers.email}`
                  );
                  return res
                    .status(400)
                    .jsonp({ status: false, message: "Bad request!" });
                });

            var update_physical_asset_avaliable = await update_physical_asset
              .findOne({
                _awareid: req.headers.awareid,
                update_aware_token_id: req.headers.update_aware_token_id,
              })
              .catch((ex) => {
                loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
                return res
                  .status(400)
                  .jsonp({ status: false, message: "Bad request!" });
              });

            var update_tracer_avaliable = await update_tracer
              .findOne({
                _awareid: req.headers.awareid,
                update_aware_token_id: req.headers.update_aware_token_id,
              })
              .catch((ex) => {
                loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
                return res
                  .status(400)
                  .jsonp({ status: false, message: "Bad request!" });
              });

            var update_self_validation_avaliable = await update_self_validation
              .findOne({
                _awareid: req.headers.awareid,
                update_aware_token_id: req.headers.update_aware_token_id,
              })
              .catch((ex) => {
                loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
                return res
                  .status(400)
                  .jsonp({ status: false, message: "Bad request!" });
              });

            var update_company_compliancess_avaliable =
              await update_company_compliancess
                .findOne({
                  _awareid: req.headers.awareid,
                  update_aware_token_id: req.headers.update_aware_token_id,
                })
                .catch((ex) => {
                  loggerhandler.logger.error(
                    `${ex} ,email:${req.headers.email}`
                  );
                  return res
                    .status(400)
                    .jsonp({ status: false, message: "Bad request!" });
                });

            if (
              !selected_update_aware_token_avaliable ||
              !update_physical_asset_avaliable ||
              !update_tracer_avaliable ||
              !update_self_validation_avaliable ||
              !update_company_compliancess_avaliable ||
              !kyc_details_avaliable
            ) {
              return res
                .status(200)
                .jsonp({ status: true, data: null, authorization: resp.token });
            } else {
              return res.status(200).jsonp({
                status: true,
                data: {
                  selected_update_aware_token_avaliable:
                    selected_update_aware_token_avaliable,
                  update_physical_asset_avaliable:
                    update_physical_asset_avaliable,
                  update_tracer_avaliable: update_tracer_avaliable,
                  update_self_validation_avaliable:
                    update_self_validation_avaliable,
                  update_company_compliancess_avaliable:
                    update_company_compliancess_avaliable,
                  kyc_details_avaliable: kyc_details_avaliable,
                },
                authorization: resp.token,
              });
            }
          } else {
            return res
              .status(resp.code)
              .jsonp({ status: false, data: null, authorization: null });
          }
        }
      );
    }
  },

  // Without Authorization
  getUpdatedDigitalTwinAsyncV3: async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).jsonp(errors.array());
    } else {
      if (!req.headers.awareid || !req.headers.update_aware_token_id) {
        return res
          .status(400)
          .jsonp({ status: false, message: "Bad request!" });
      }

      try {
        const kyc_details_avaliable = await kyc_details
          .findOne({ aware_id: req.headers.awareid })
          .populate("manager_id")
          .catch((ex) => {
            loggerhandler.logger.error(`${ex} ,awareid:${req.headers.awareid}`);
            return res
              .status(400)
              .jsonp({ status: false, message: "Bad request!" });
          });

        if (!kyc_details_avaliable) {
          return res.status(200).jsonp({
            status: true,
            message: `Kyc Details does not exist for the AwaredId - ${req.headers.awareid}`,
            data: null,
          });
        }

        const account_details_avaliable = await account_details
          .findOne({
            kyc_id: kyc_details_avaliable._id.toString(),
          })
          .select("first_name last_name email");

        const email = account_details_avaliable.email;

        const selected_update_aware_token_avaliable =
          await selected_update_aware_token
            .findOne({
              _awareid: req.headers.awareid,
              update_aware_token_id: req.headers.update_aware_token_id,
            })
            .catch((ex) => {
              loggerhandler.logger.error(`${ex} ,email:${email}`);
              return res
                .status(400)
                .jsonp({ status: false, message: "Bad request!" });
            });

        const update_physical_asset_avaliable = await update_physical_asset
          .findOne({
            _awareid: req.headers.awareid,
            update_aware_token_id: req.headers.update_aware_token_id,
          })
          .lean()
          .catch((ex) => {
            loggerhandler.logger.error(`${ex} ,email:${email}`);
            return res
              .status(400)
              .jsonp({ status: false, message: "Bad request!" });
          });

        // Process asset data and generate processed composition data
        let previousAwareAssetComposition = [];
        if (
          update_physical_asset_avaliable &&
          update_physical_asset_avaliable.assetdataArrayMain &&
          update_physical_asset_avaliable.assetdataArrayMain.length > 0
        ) {
          try {
            // Prepare data for getAwareAssetDataForComposition function
            const assetData = {
              data: update_physical_asset_avaliable.assetdataArrayMain.map(
                (asset) => ({
                  tt_id: asset.tt_id,
                  Used_token: asset.Used_token || asset.token_deduction,
                })
              ),
            };

            // Call getAwareAssetDataForComposition to get composition data from previous assets
            const result = await getAwareAssetDataForComposition(assetData);

            // Store the previous aware asset composition data
            if (result && result.status && result.data) {
              previousAwareAssetComposition = result.data;

              // Process both the previous aware asset composition and the current physical asset composition
              const processedCompositionArray = await processCompositionData(
                previousAwareAssetComposition,
                update_physical_asset_avaliable.compositionArrayMain || [],
                update_physical_asset_avaliable
              );

              // Set the processed array as the compositionArray
              update_physical_asset_avaliable.compositionArray =
                processedCompositionArray;
            }
          } catch (error) {
            loggerhandler.logger.error(
              `Error processing asset data: ${error}, email:${email}`
            );
            // Continue execution even if this part fails
          }
        }

        // Continue with the rest of the function to fetch other data
        const update_tracer_avaliable = await update_tracer
          .findOne({
            _awareid: req.headers.awareid,
            update_aware_token_id: req.headers.update_aware_token_id,
          })
          .catch((ex) => {
            loggerhandler.logger.error(`${ex} ,email:${email}`);
            return res
              .status(400)
              .jsonp({ status: false, message: "Bad request!" });
          });

        const update_self_validation_avaliable = await update_self_validation
          .findOne({
            _awareid: req.headers.awareid,
            update_aware_token_id: req.headers.update_aware_token_id,
          })
          .catch((ex) => {
            loggerhandler.logger.error(`${ex} ,email:${email}`);
            return res
              .status(400)
              .jsonp({ status: false, message: "Bad request!" });
          });

        const update_company_compliancess_avaliable =
          await update_company_compliancess
            .findOne({
              _awareid: req.headers.awareid,
              update_aware_token_id: req.headers.update_aware_token_id,
            })
            .catch((ex) => {
              loggerhandler.logger.error(`${ex} ,email:${email}`);
              return res
                .status(400)
                .jsonp({ status: false, message: "Bad request!" });
            });

        const update_aw_tokens_avaliable = await update_aw_tokens
          .findOne({
            _awareid: req.headers.awareid,
            _id: req.headers.update_aware_token_id,
          })
          .populate("reviewedBy")
          .catch((ex) => {
            loggerhandler.logger.error(`${ex} ,email:${email}`);
            return res
              .status(400)
              .jsonp({ status: false, message: "Bad request!" });
          });

        const awareUpdateTokenId = update_aw_tokens_avaliable?._id;

        const transaction_history_data = await transaction_history.findOne({
          update_aware_token_id: awareUpdateTokenId,
        });

        let transferred_data = [];
        // Find selected_aware_tokens documents
        const selectedAwareTokens = await selected_aware_token.find({
          selected_tokens: {
            $elemMatch: {
              update_aware_token_id: awareUpdateTokenId,
            },
          },
        });

        // Loop through each selected_aware_token document
        if (transaction_history_data && selectedAwareTokens.length > 0) {
          for (let i = 0; i < selectedAwareTokens.length; i++) {
            // Skip if no selected_tokens array or it's empty
            if (
              !selectedAwareTokens[i].selected_tokens ||
              selectedAwareTokens[i].selected_tokens.length === 0
            ) {
              continue;
            }

            // For each selected_aware_token, get the receiver information
            const selectedReceiver = await selected_receiver.findOne({
              send_aware_token_id: selectedAwareTokens[i].send_aware_token_id,
            });

            if (!selectedReceiver) {
              continue;
            }

            // Get the company name for the receiver
            const kycDetailsData = await kyc_details
              .findOne({
                aware_id: selectedReceiver._receiver_awareid,
              })
              .select("company_name");

            if (!kycDetailsData) {
              continue;
            }

            // Loop through selected_tokens array in this document
            for (
              let j = 0;
              j < selectedAwareTokens[i].selected_tokens.length;
              j++
            ) {
              const token = selectedAwareTokens[i].selected_tokens[j];

              // Check if this token matches our awareUpdateTokenId
              if (
                token.update_aware_token_id &&
                token.update_aware_token_id.toString() ===
                  awareUpdateTokenId.toString()
              ) {
                // Build the new data object
                const newData = {
                  _id: selectedAwareTokens[i]._id,
                  total_tokens: Number(token.To_be_Send),
                  created_date: selectedAwareTokens[i].created_date,
                  company_name: kycDetailsData.company_name,
                };

                transferred_data.push(newData);
              }
            }
          }
        }

        if (
          !selected_update_aware_token_avaliable ||
          !update_physical_asset_avaliable ||
          !update_tracer_avaliable ||
          !update_self_validation_avaliable ||
          !update_company_compliancess_avaliable ||
          !kyc_details_avaliable
        ) {
          return res.status(200).jsonp({
            status: true,
            data: null,
          });
        } else {
          return res.status(200).jsonp({
            status: true,
            data: {
              selected_update_aware_token_avaliable:
                selected_update_aware_token_avaliable,
              update_physical_asset_avaliable: update_physical_asset_avaliable,
              update_tracer_avaliable: update_tracer_avaliable,
              update_self_validation_avaliable:
                update_self_validation_avaliable,
              update_company_compliancess_avaliable:
                update_company_compliancess_avaliable,
              kyc_details_avaliable: kyc_details_avaliable,
              update_aw_tokens_avaliable: update_aw_tokens_avaliable,
              transferred_data: transferred_data,
              transaction_history_data: {
                _id: transaction_history_data?._id,
                update_aware_token_id:
                  transaction_history_data?.update_aware_token_id,
                transactionHash: transaction_history_data?.transactionHash,
                created_date: transaction_history_data?.created_date,
              },
              accounts: account_details_avaliable,
            },
          });
        }
      } catch (error) {
        loggerhandler.logger.error(`${error}`);
        return res
          .status(500)
          .jsonp({ status: false, message: "Internal server error" });
      }
    }
  },

  getReceivedAwareTokensAsync: async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).jsonp(errors.array());
    } else {
      if (
        !req.headers.userid ||
        !req.headers.username ||
        !req.headers.authorization ||
        !req.headers.awareid ||
        !req.headers.type
      ) {
        return res
          .status(400)
          .jsonp({ status: false, message: "Bad request!" });
      }

      var payload = { username: req.headers.username };
      refresh(
        req.headers.authorization,
        req.headers.userid,
        payload,
        async function (resp) {
          if (resp.status == true) {
            var transferred_tokens_avaliable = await transferred_tokens
              .find({
                _awareid: req.headers.awareid,
                type_of_token: req.headers.type,
                locked: false,
                avaliable_tokens: { $gt: 0 },
              })
              .sort({ created_date: -1 })
              .catch((ex) => {
                loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
                return res
                  .status(400)
                  .jsonp({ status: false, message: "Bad request!" });
              });

            if (!transferred_tokens_avaliable) {
              return res
                .status(200)
                .jsonp({ status: true, data: null, authorization: resp.token });
            } else {
              var jsonData = [];
              for (var i = 0; i < transferred_tokens_avaliable?.length; i++) {
                var temp_transferred_token = transferred_tokens_avaliable[i];

                if (temp_transferred_token.historical_physical_assets_id) {
                  var temp_assets_avaliable = await physical_assets
                    .findOne({
                      _id: temp_transferred_token?.historical_physical_assets_id,
                    })
                    .catch((ex) => {
                      loggerhandler.logger.error(
                        `${ex} ,email:${req.headers.email}`
                      );
                      return res
                        .status(400)
                        .jsonp({ status: false, message: "Bad request!" });
                    });
                  var jsonObject = {
                    aware_asset_id: temp_assets_avaliable?.aware_asset_id
                      ? temp_assets_avaliable.aware_asset_id
                      : null,
                    avaliable_tokens: temp_transferred_token?.avaliable_tokens
                      ? temp_transferred_token.avaliable_tokens
                      : 0,
                    tt_id: temp_transferred_token?._id
                      ? temp_transferred_token._id
                      : null,
                  };

                  jsonData.push(jsonObject);
                } else {
                  var temp_assets_avaliable = await update_physical_asset
                    .findOne({
                      _id: temp_transferred_token.historical_update_physical_assets_id,
                    })
                    .catch((ex) => {
                      loggerhandler.logger.error(
                        `${ex} ,email:${req.headers.email}`
                      );
                      return res
                        .status(400)
                        .jsonp({ status: false, message: "Bad request!" });
                    });
                  var jsonObject = {
                    aware_asset_id:
                      temp_assets_avaliable?.updated_aware_asset_id
                        ? temp_assets_avaliable.updated_aware_asset_id
                        : null,
                    avaliable_tokens: temp_transferred_token?.avaliable_tokens
                      ? temp_transferred_token.avaliable_tokens
                      : 0,
                    tt_id: temp_transferred_token?._id
                      ? temp_transferred_token._id
                      : null,
                  };
                  jsonData.push(jsonObject);
                }
              }
              return res.status(200).jsonp({
                status: true,
                data: jsonData,
                authorization: resp.token,
              });
            }
          } else {
            return res
              .status(resp.code)
              .jsonp({ status: false, data: null, authorization: null });
          }
        }
      );
    }
  },

  getMyFinalBrandConnectionsAsync: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).jsonp(errors.array());
    } else {
      if (
        !req.headers.userid ||
        !req.headers.username ||
        !req.headers.authorization ||
        !req.headers.aware_id
      ) {
        return res
          .status(400)
          .jsonp({ status: false, message: "Bad request!" });
      }

      const request_data_receiver = await requests
        .find({
          receiver_aware_id: req.headers.aware_id,
          status: "Accepted",
          isdeleted: false,
        })
        .catch((ex) => {
          loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
          return res
            .status(500)
            .jsonp({ status: false, message: ex.toString() });
        });

      const request_data_sender = await requests
        .find({
          sender_aware_id: req.headers.aware_id,
          status: "Accepted",
          isdeleted: false,
        })
        .catch((ex) => {
          loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
          return res
            .status(500)
            .jsonp({ status: false, message: ex.toString() });
        });

      const output = [];
      const map = new Map();
      for (const item of request_data_receiver) {
        if (!map.has(item.sender_aware_id.toString())) {
          map.set(item.sender_aware_id.toString(), true);
          output.push(item.sender_aware_id.toString());
        }
      }

      for (const item of request_data_sender) {
        if (!map.has(item.receiver_aware_id.toString())) {
          map.set(item.receiver_aware_id.toString(), true);
          output.push(item.receiver_aware_id.toString());
        }
      }

      var kyc_details_data = await kyc_details
        .find({ aware_id: { $in: output } })
        .select(["company_name", "aware_id", "_id", "country"])
        .catch((ex) => {
          loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
          return res.status(500).jsonp({ status: false, message: ex });
        });

      const output2 = [];
      const map2 = new Map();
      for (const item of kyc_details_data) {
        if (!map2.has(item._id)) {
          map2.set(item._id, true);
          output2.push(item._id);
        }
      }

      var accounts_found = await account_details
        .find({ kyc_id: { $in: output2 } })
        .select(["role_id", "kyc_id"])
        .catch((ex) => {
          loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
          return res.status(500).jsonp({ status: false, message: ex });
        });
      var user_roles = await user_role
        .find()
        .select(["role_id", "role_name"])
        .catch((ex) => {
          loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
          return res.status(500).jsonp({ status: false, message: ex });
        });

      var jsonArray = [];
      for (const item of request_data_receiver) {
        var details_to_send = kyc_details_data.find(
          (x) => x.aware_id == item.sender_aware_id
        );
        var role_id = accounts_found.find(
          (x) => x.kyc_id == details_to_send._id.toString()
        ).role_id;
        var role_name = user_roles.find((x) => x.role_id == role_id).role_name;

        var rawobject = {
          _id: details_to_send._id,
          company_name: details_to_send.company_name,
          aware_id: details_to_send.aware_id,
          country: details_to_send.country,
          role_name: role_name,
          role_id: role_id,
          status: item.status,
        };

        jsonArray.push(rawobject);
      }

      for (const item of request_data_sender) {
        var details_to_send = kyc_details_data.find(
          (x) => x.aware_id == item.receiver_aware_id
        );
        var role_id = accounts_found.find(
          (x) => x.kyc_id == details_to_send._id.toString()
        ).role_id;
        var role_name = user_roles.find((x) => x.role_id == role_id).role_name;

        var rawobject = {
          _id: details_to_send._id,
          company_name: details_to_send.company_name,
          aware_id: details_to_send.aware_id,
          country: details_to_send.country,
          role_name: role_name,
          role_id: role_id,
          status: item.status,
        };

        jsonArray.push(rawobject);
      }
      let filterData = jsonArray.filter((item) => item.role_id == 7);
      var payload = { username: req.headers.username };
      refresh(
        req.headers.authorization,
        req.headers.userid,
        payload,
        function (resp) {
          if (resp.status == true) {
            return res.status(200).jsonp({
              status: true,
              data: filterData,
              authorization: resp.token,
            });
          } else {
            return res
              .status(resp.code)
              .jsonp({ status: false, data: null, authorization: null });
          }
        }
      );
    }
  },

  getHistoricalTracersOfAwareAssetsAsync: async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).jsonp(errors.array());
    } else {
      if (
        !req.headers.userid ||
        !req.headers.username ||
        !req.headers.authorization ||
        !req.headers.awareid ||
        req.body.update_aware_token_id
      ) {
        return res
          .status(400)
          .jsonp({ status: false, message: "Bad request!" });
      }
      console.log("headers---------------------", req.headers);
      console.log("body---------------------", req.body);

      var selected_aware_assets = await update_physical_asset
        .findOne({
          _awareid: req.headers.awareid,
          update_aware_token_id: req.headers.update_aware_token_id,
        })
        .select([
          "assetdataArrayMain",
          "compositionArrayMain",
          "updated_aware_asset_id",
        ])
        .catch((ex) => {
          loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
          return res
            .status(400)
            .jsonp({ status: false, message: "Bad request!" });
        });

      var physical_asset_avaliable = await physical_assets
        .find({})
        .catch((ex) => {
          loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
          return res
            .status(400)
            .jsonp({ status: false, message: "Bad request!" });
        });

      var update_physical_asset_avaliable = await update_physical_asset
        .find({})
        .catch((ex) => {
          loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
          return res
            .status(400)
            .jsonp({ status: false, message: "Bad request!" });
        });

      var transferred_tokens_avaliable = await transferred_tokens
        .find({})
        .catch((ex) => {
          loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
          return res
            .status(400)
            .jsonp({ status: false, message: "Bad request!" });
        });

      var tracer_avaliable = await tracer.find({}).catch((ex) => {
        loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
        return res
          .status(400)
          .jsonp({ status: false, message: "Bad request!" });
      });

      var update_tracer_avaliable = await update_tracer.find({}).catch((ex) => {
        loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
        return res
          .status(400)
          .jsonp({ status: false, message: "Bad request!" });
      });

      var selected_update_aware_token_avaliable =
        await selected_update_aware_token.find({}).catch((ex) => {
          loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
          return res
            .status(400)
            .jsonp({ status: false, message: "Bad request!" });
        });

      var multiple_aware_assets_tracer_history = [];
      for (
        var i = 0;
        i < selected_aware_assets?.assetdataArrayMain?.length;
        i++
      ) {
        var selected_aware_asset = selected_aware_assets?.assetdataArrayMain[i];

        var final_object_of_selected_aware_asset = {};
        var aware_asset_found = selected_aware_asset?.aware_asset_id;

        var history_level_one = [];
        for (var j = 0; j < 1; j++) {
          var physical_asset_found = null;
          physical_asset_found = physical_asset_avaliable.find(
            (x) => x.aware_asset_id == aware_asset_found
          );

          var transferred_token_found = null;
          var tracer_found = null;
          var selected_update_aware_token_found = null;

          if (!physical_asset_found) {
            physical_asset_found = update_physical_asset_avaliable.find(
              (x) => x?.updated_aware_asset_id == aware_asset_found
            );

            transferred_token_found = transferred_tokens_avaliable.find(
              (x) =>
                x?.historical_awareid == physical_asset_found?._awareid &&
                x?.historical_update_aware_token_id ==
                  physical_asset_found?.update_aware_token_id
            );
            tracer_found = update_tracer_avaliable.find(
              (x) =>
                x?._awareid == transferred_token_found?.historical_awareid &&
                x?.update_aware_token_id ==
                  transferred_token_found?.historical_update_aware_token_id
            );
            selected_update_aware_token_found =
              selected_update_aware_token_avaliable.find(
                (x) =>
                  x._awareid == transferred_token_found?.historical_awareid &&
                  x.update_aware_token_id ==
                    transferred_token_found?.historical_update_aware_token_id
              );
          } else {
            transferred_token_found = transferred_tokens_avaliable.find(
              (x) =>
                x?.historical_awareid == physical_asset_found?._awareid &&
                x?.historical_aware_token_id?.toString() ==
                  physical_asset_found?.aware_token_id?.toString()
            );
            tracer_found = tracer_avaliable.find(
              (x) =>
                x?._awareid == transferred_token_found?.historical_awareid &&
                x?.aware_token_id ==
                  transferred_token_found?.historical_aware_token_id
            );
          }
          history_level_one.push({
            physical_asset: physical_asset_found,
            tracer: tracer_found,
            selected_update_aware_token: selected_update_aware_token_found,
          });

          final_object_of_selected_aware_asset = {
            belongs_to_line: selected_aware_asset.aware_asset_id,
            aware_asset_id: aware_asset_found,
            percentage: selected_aware_asset.percentage,
            used_token: selected_aware_asset.Used_token,
            tracer: history_level_one,
            depth: j,
          };

          multiple_aware_assets_tracer_history.push(
            final_object_of_selected_aware_asset
          );

          if (transferred_token_found?.token_base_type != "initiated") {
            var tracer_found = update_tracer_avaliable.find(
              (x) =>
                x?._awareid == transferred_token_found?.historical_awareid &&
                x?.update_aware_token_id ==
                  transferred_token_found?.historical_update_aware_token_id
            );

            var aware_assets = update_physical_asset_avaliable.find(
              (x) =>
                x?._awareid == transferred_token_found?.historical_awareid &&
                x?.update_aware_token_id ==
                  transferred_token_found?.historical_update_aware_token_id
            )?.assetdataArrayMain;

            var history_level_two = [];

            aware_assets?.forEach((asset) => {
              var transferred_token_found = transferred_tokens_avaliable.find(
                (x) => x?._id == asset?.tt_id
              );

              var tracer_found = null;
              if (transferred_token_found?.token_base_type != "initiated") {
                physical_asset_found = update_physical_asset_avaliable.find(
                  (x) => x?.updated_aware_asset_id == asset?.aware_asset_id
                );

                tracer_found = update_tracer_avaliable.find(
                  (x) =>
                    x?._awareid ==
                      transferred_token_found?.historical_awareid &&
                    x?.update_aware_token_id ==
                      transferred_token_found?.historical_update_aware_token_id
                );
                selected_update_aware_token_found =
                  selected_update_aware_token_avaliable.find(
                    (x) =>
                      x?._awareid ==
                        transferred_token_found?.historical_awareid &&
                      x?.update_aware_token_id ==
                        transferred_token_found?.historical_update_aware_token_id
                  );

                history_level_two.push({
                  physical_asset: physical_asset_found,
                  tracer: tracer_found,
                  selected_update_aware_token:
                    selected_update_aware_token_found,
                });
                final_object_of_selected_aware_asset = {
                  belongs_to_line: selected_aware_asset.aware_asset_id,
                  aware_asset_id: asset.updated_aware_asset_id,
                  percentage: asset.percentage,
                  used_token: selected_aware_asset.Used_token,
                  tracer: history_level_two,
                  depth: j,
                };
              } else {
                physical_asset_found = physical_asset_avaliable.find(
                  (x) => x.aware_asset_id == asset.aware_asset_id
                );

                tracer_found = tracer_avaliable.find(
                  (x) =>
                    x._awareid == transferred_token_found?.historical_awareid &&
                    x.aware_token_id ==
                      transferred_token_found?.historical_aware_token_id
                );
                history_level_two.push({
                  physical_asset: physical_asset_found,
                  tracer: tracer_found,
                  selected_update_aware_token: null,
                });
                final_object_of_selected_aware_asset = {
                  belongs_to_line: selected_aware_asset.aware_asset_id,
                  aware_asset_id: asset.aware_asset_id,
                  percentage: asset.percentage,
                  used_token: selected_aware_asset.Used_token,
                  tracer: history_level_two,
                  depth: j,
                };
              }

              multiple_aware_assets_tracer_history.push(
                final_object_of_selected_aware_asset
              );

              if (transferred_token_found?.token_base_type != "initiated") {
                var tracer_found = update_tracer_avaliable.find(
                  (x) =>
                    x._awareid == transferred_token_found?.historical_awareid &&
                    x.update_aware_token_id ==
                      transferred_token_found?.historical_update_aware_token_id
                );

                var aware_assets = update_physical_asset_avaliable.find(
                  (x) =>
                    x._awareid == transferred_token_found?.historical_awareid &&
                    x.update_aware_token_id ==
                      transferred_token_found?.historical_update_aware_token_id
                ).assetdataArrayMain;

                var history_level_three = [];

                aware_assets.forEach((asset) => {
                  var transferred_token_found =
                    transferred_tokens_avaliable.find(
                      (x) => x._id == asset.tt_id
                    );

                  var tracer_found = null;
                  if (transferred_token_found?.token_base_type != "initiated") {
                    physical_asset_found = update_physical_asset_avaliable.find(
                      (x) => x.updated_aware_asset_id == asset.aware_asset_id
                    );

                    tracer_found = update_tracer_avaliable.find(
                      (x) =>
                        x._awareid ==
                          transferred_token_found?.historical_awareid &&
                        x.update_aware_token_id ==
                          transferred_token_found?.historical_update_aware_token_id
                    );
                    selected_update_aware_token_found =
                      selected_update_aware_token_avaliable.find(
                        (x) =>
                          x._awareid ==
                            transferred_token_found?.historical_awareid &&
                          x.update_aware_token_id ==
                            transferred_token_found?.historical_update_aware_token_id
                      );

                    history_level_two.push({
                      physical_asset: physical_asset_found,
                      tracer: tracer_found,
                      selected_update_aware_token:
                        selected_update_aware_token_found,
                    });
                    final_object_of_selected_aware_asset = {
                      belongs_to_line: selected_aware_asset.aware_asset_id,
                      aware_asset_id: asset.updated_aware_asset_id,
                      percentage: asset.percentage,
                      used_token: selected_aware_asset.Used_token,
                      tracer: history_level_three,
                      depth: j,
                    };
                  } else {
                    physical_asset_found = physical_asset_avaliable.find(
                      (x) => x.aware_asset_id == asset.aware_asset_id
                    );

                    tracer_found = tracer_avaliable.find(
                      (x) =>
                        x._awareid ==
                          transferred_token_found?.historical_awareid &&
                        x.aware_token_id ==
                          transferred_token_found?.historical_aware_token_id
                    );
                    history_level_two.push({
                      physical_asset: physical_asset_found,
                      tracer: tracer_found,
                      selected_update_aware_token: null,
                    });
                    final_object_of_selected_aware_asset = {
                      belongs_to_line: selected_aware_asset.aware_asset_id,
                      aware_asset_id: asset.aware_asset_id,
                      percentage: asset.percentage,
                      used_token: selected_aware_asset.Used_token,
                      tracer: history_level_three,
                      depth: j,
                    };
                  }

                  multiple_aware_assets_tracer_history.push(
                    final_object_of_selected_aware_asset
                  );
                });
              }
            });
          }
        }
      }

      var payload = { username: req.headers.username };
      refresh(
        req.headers.authorization,
        req.headers.userid,
        payload,
        async function (resp) {
          if (resp.status == true) {
            return res.status(200).jsonp({
              status: true,
              data: {
                updated_aware_asset_id:
                  selected_aware_assets.updated_aware_asset_id,
                multiple_aware_assets_tracer_history:
                  multiple_aware_assets_tracer_history,
                composition_array_main:
                  selected_aware_assets.compositionArrayMain,
              },
              authorization: resp.token,
            });
          } else {
            return res
              .status(resp.code)
              .jsonp({ status: false, data: null, authorization: null });
          }
        }
      );
    }
  },

  getAllUpdateAwareTokenAsync: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).jsonp(errors.array());
    }
    if (
      !req.headers.userid ||
      !req.headers.username ||
      !req.headers.authorization
    ) {
      return res.status(400).jsonp({ status: false, message: "Bad request!" });
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const excludeRegex = new RegExp("^concept$", "i");
    let statusMatch = { status: { $not: excludeRegex } };

    if (req.query.status) {
      const statusRegex = new RegExp(
        "^" + escapeRegExp(req.query.status.toLowerCase()) + "$",
        "i"
      );
      statusMatch = { status: statusRegex };
    }

    const searchTerm = req.query.search ? req.query.search.trim() : "";
    let searchMatch = {};
    let searchRegex = null;
    if (searchTerm.length > 0) {
      const escapedSearchTerm = escapeRegExp(searchTerm).replace(
        /\s+/g,
        "\\s+"
      );
      searchRegex = new RegExp(escapedSearchTerm, "i");
      searchMatch = {
        $or: [
          { "update_assets.updated_aware_asset_id": searchRegex },
          { "update_assets.weight": searchRegex },
          { "kyc_detail.company_name": searchRegex },

          {
            "update_aw_tokens.type_of_token": searchRegex,
          },
        ],
      };
    }

    var payload = { username: req.headers.username };
    refresh(
      req.headers.authorization,
      req.headers.userid,
      payload,
      async function (resp) {
        if (resp.status === true) {
          try {
            const pipeline = [
              { $match: statusMatch },

              {
                $lookup: {
                  from: "kyc_details",
                  let: { awareid: "$_awareid" },
                  pipeline: [
                    {
                      $match: {
                        $expr: { $eq: ["$aware_id", "$$awareid"] },
                      },
                    },
                    { $limit: 1 },
                    {
                      $project: {
                        company_name: 1,
                      },
                    },
                  ],
                  as: "kyc_detail",
                },
              },

              {
                $lookup: {
                  from: "update_physical_assets",
                  let: { awareid: "$_awareid", tokenid: "$_id" },
                  pipeline: [
                    {
                      $match: {
                        $expr: {
                          $and: [
                            { $eq: ["$_awareid", "$$awareid"] },
                            {
                              $eq: [
                                { $toString: "$update_aware_token_id" },
                                { $toString: "$$tokenid" },
                              ],
                            },
                          ],
                        },
                      },
                    },
                    { $limit: 1 },
                    {
                      $project: {
                        updated_aware_asset_id: 1,
                        weight: 1,
                        created_date: 1,
                      },
                    },
                  ],
                  as: "update_assets",
                },
              },

              ...(searchTerm.length > 0 ? [{ $match: searchMatch }] : []),

              {
                $addFields: {
                  kyc_details_available: {
                    $cond: {
                      if: { $gt: [{ $size: "$kyc_detail" }, 0] },
                      then: { $arrayElemAt: ["$kyc_detail", 0] },
                      else: null,
                    },
                  },
                  update_assets_available: {
                    $cond: {
                      if: { $gt: [{ $size: "$update_assets" }, 0] },
                      then: { $arrayElemAt: ["$update_assets", 0] },
                      else: null,
                    },
                  },
                },
              },

              {
                $project: {
                  update_aw_tokens: {
                    _id: "$_id",
                    _awareid: "$_awareid",
                    status: "$status",
                    type_of_token: "$type_of_token",
                  },
                  kyc_details_available: 1,
                  update_assets_available: 1,
                },
              },

              {
                $unset: [
                  "update_aw_tokens.kyc_detail",
                  "update_aw_tokens.update_assets",
                  "update_aw_tokens.kyc_details_available",
                  "update_aw_tokens.update_assets_available",
                ],
              },

              {
                $sort: {
                  "update_assets_available.created_date": -1,
                },
              },

              {
                $facet: {
                  metadata: [{ $count: "total" }],
                  data: [{ $skip: skip }, { $limit: limit }],
                },
              },
            ];

            const aggregationResult = await update_aw_tokens
              .aggregate(pipeline, { allowDiskUse: true })
              .catch((ex) => {
                loggerhandler.logger.error(`${ex}, email:${req.headers.email}`);
                return res
                  .status(400)
                  .jsonp({ status: false, message: "Bad request!" });
              });

            const result = aggregationResult[0];
            const totalDocuments =
              result.metadata.length > 0 ? result.metadata[0].total : 0;
            const totalPages = Math.ceil(totalDocuments / limit);
            const data = result.data;

            if (!data || data.length <= 0) {
              return res.status(200).jsonp({
                status: true,
                data: [],
                pagination: {
                  page,
                  limit,
                  total: totalDocuments,
                  pages: totalPages,
                },
                authorization: resp.token,
              });
            } else {
              return res.status(200).jsonp({
                status: true,
                data: data,
                pagination: {
                  page: page,
                  limit: limit,
                  total: totalDocuments,
                  pages: totalPages,
                },
                authorization: resp.token,
              });
            }
          } catch (error) {
            console.error(error);
            loggerhandler.logger.error(`${error}, email:${req.headers.email}`);
            return res
              .status(500)
              .jsonp({ status: false, message: "Server error!" });
          }
        } else {
          return res
            .status(resp.code)
            .jsonp({ status: false, data: [], authorization: null });
        }
      }
    );
  },

  getallupdateAwareTokenManagerAsync: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).jsonp(errors.array());
    }
    if (
      !req.headers.userid ||
      !req.headers.username ||
      !req.headers.authorization
    ) {
      return res.status(400).jsonp({ status: false, message: "Bad request!" });
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const excludeRegex = new RegExp("^concept$", "i");
    let statusMatch = { status: { $not: excludeRegex } };

    if (req.query.status) {
      const statusRegex = new RegExp(
        "^" + escapeRegExp(req.query.status.toLowerCase()) + "$",
        "i"
      );
      statusMatch = { status: statusRegex };
    }

    const searchTerm = req.query.search ? req.query.search.trim() : "";
    let searchMatch = {};
    let searchRegex = null;
    if (searchTerm.length > 0) {
      const escapedSearchTerm = escapeRegExp(searchTerm).replace(
        /\s+/g,
        "\\s+"
      );
      searchRegex = new RegExp(escapedSearchTerm, "i");
      searchMatch = {
        $or: [
          { "update_assets.updated_aware_asset_id": searchRegex },
          { "update_assets.weight": searchRegex },
          { "kyc_detail.company_name": searchRegex },
          { "update_aw_tokens.type_of_token": searchRegex },
        ],
      };
    }

    var payload = { username: req.headers.username };
    refresh(
      req.headers.authorization,
      req.headers.userid,
      payload,
      async function (resp) {
        if (resp.status === true) {
          try {
            var manager_kyc_details_available = await kyc_details
              .findOne({
                manager_id: mongoose.Types.ObjectId(req.headers.userid),
              })
              .catch((ex) => {
                loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
                return res
                  .status(400)
                  .jsonp({ status: false, message: "Bad request!" });
              });

            if (!manager_kyc_details_available) {
              return res
                .status(200)
                .jsonp({ status: true, data: [], authorization: resp.token });
            }

            const combinedMatch = {
              ...statusMatch,
              _awareid: manager_kyc_details_available?.aware_id,
            };

            const pipeline = [
              { $match: combinedMatch },

              {
                $lookup: {
                  from: "kyc_details",
                  let: { awareid: "$_awareid" },
                  pipeline: [
                    {
                      $match: {
                        $expr: { $eq: ["$aware_id", "$$awareid"] },
                      },
                    },
                    { $limit: 1 },
                    {
                      $project: {
                        company_name: 1,
                      },
                    },
                  ],
                  as: "kyc_detail",
                },
              },

              {
                $lookup: {
                  from: "update_physical_assets",
                  let: { awareid: "$_awareid", tokenid: "$_id" },
                  pipeline: [
                    {
                      $match: {
                        $expr: {
                          $and: [
                            { $eq: ["$_awareid", "$$awareid"] },
                            {
                              $eq: [
                                { $toString: "$update_aware_token_id" },
                                { $toString: "$$tokenid" },
                              ],
                            },
                          ],
                        },
                      },
                    },
                    { $limit: 1 },
                    {
                      $project: {
                        updated_aware_asset_id: 1,
                        weight: 1,
                        created_date: 1,
                      },
                    },
                  ],
                  as: "update_assets",
                },
              },

              ...(searchTerm.length > 0 ? [{ $match: searchMatch }] : []),

              {
                $addFields: {
                  kyc_details_available: {
                    $cond: {
                      if: { $gt: [{ $size: "$kyc_detail" }, 0] },
                      then: { $arrayElemAt: ["$kyc_detail", 0] },
                      else: null,
                    },
                  },
                  update_assets_available: {
                    $cond: {
                      if: { $gt: [{ $size: "$update_assets" }, 0] },
                      then: { $arrayElemAt: ["$update_assets", 0] },
                      else: null,
                    },
                  },
                },
              },

              {
                $project: {
                  update_aw_tokens: {
                    _id: "$_id",
                    _awareid: "$_awareid",
                    status: "$status",
                    type_of_token: "$type_of_token",
                  },
                  kyc_details_available: 1,
                  update_assets_available: 1,
                },
              },

              {
                $unset: [
                  "update_aw_tokens.kyc_detail",
                  "update_aw_tokens.update_assets",
                  "update_aw_tokens.kyc_details_available",
                  "update_aw_tokens.update_assets_available",
                ],
              },

              {
                $sort: {
                  "update_assets_available.created_date": -1,
                },
              },

              {
                $facet: {
                  metadata: [{ $count: "total" }],
                  data: [{ $skip: skip }, { $limit: limit }],
                },
              },
            ];

            const aggregationResult = await update_aw_tokens
              .aggregate(pipeline)
              .catch((ex) => {
                loggerhandler.logger.error(`${ex}, email:${req.headers.email}`);
                return res
                  .status(400)
                  .jsonp({ status: false, message: "Bad request!" });
              });

            const result = aggregationResult[0];
            const totalDocuments =
              result.metadata.length > 0 ? result.metadata[0].total : 0;
            const totalPages = Math.ceil(totalDocuments / limit);
            const data = result.data;

            if (!data || data.length <= 0) {
              return res.status(200).jsonp({
                status: true,
                data: [],
                pagination: {
                  page,
                  limit,
                  total: totalDocuments,
                  pages: totalPages,
                },
                authorization: resp.token,
              });
            } else {
              return res.status(200).jsonp({
                status: true,
                data: data,
                pagination: {
                  page: page,
                  limit: limit,
                  total: totalDocuments,
                  pages: totalPages,
                },
                authorization: resp.token,
              });
            }
          } catch (error) {
            console.error(error);
            loggerhandler.logger.error(`${error}, email:${req.headers.email}`);
            return res
              .status(500)
              .jsonp({ status: false, message: "Server error!" });
          }
        } else {
          return res
            .status(resp.code)
            .jsonp({ status: false, data: null, authorization: null });
        }
      }
    );
  },

  getUpdateDigitalTwinAsync: async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).jsonp(errors.array());
    } else {
      if (
        !req.headers.userid ||
        !req.headers.username ||
        !req.headers.authorization ||
        !req.headers.awareid ||
        !req.headers.update_aware_token_id
      ) {
        return res
          .status(400)
          .jsonp({ status: false, message: "Bad request!" });
      }

      var payload = { username: req.headers.username };
      refresh(
        req.headers.authorization,
        req.headers.userid,
        payload,
        async function (resp) {
          if (resp.status == true) {
            var update_kyc_details_avaliable = await kyc_details
              .findOne({ aware_id: req.headers.awareid })
              .catch((ex) => {
                loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
                return res
                  .status(400)
                  .jsonp({ status: false, message: "Bad request!" });
              });

            var selected_update_aware_token_avaliable =
              await selected_update_aware_token
                .findOne({
                  _awareid: req.headers.awareid,
                  update_aware_token_id: req.headers.update_aware_token_id,
                })
                .catch((ex) => {
                  loggerhandler.logger.error(
                    `${ex} ,email:${req.headers.email}`
                  );
                  return res
                    .status(400)
                    .jsonp({ status: false, message: "Bad request!" });
                });

            var update_assets_avaliable = await update_physical_asset
              .findOne({
                _awareid: req.headers.awareid,
                update_aware_token_id: req.headers.update_aware_token_id,
              })
              .catch((ex) => {
                loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
                return res
                  .status(400)
                  .jsonp({ status: false, message: "Bad request!" });
              });

            var update_tracer_avaliable = await update_tracer
              .findOne({
                _awareid: req.headers.awareid,
                update_aware_token_id: req.headers.update_aware_token_id,
              })
              .catch((ex) => {
                loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
                return res
                  .status(400)
                  .jsonp({ status: false, message: "Bad request!" });
              });

            var update_self_validation_avaliable = await update_self_validation
              .findOne({
                _awareid: req.headers.awareid,
                update_aware_token_id: req.headers.update_aware_token_id,
              })
              .catch((ex) => {
                loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
                return res
                  .status(400)
                  .jsonp({ status: false, message: "Bad request!" });
              });

            var update_company_compliances_avaliable =
              await update_company_compliancess
                .findOne({
                  _awareid: req.headers.awareid,
                  update_aware_token_id: req.headers.update_aware_token_id,
                })
                .catch((ex) => {
                  loggerhandler.logger.error(
                    `${ex} ,email:${req.headers.email}`
                  );
                  return res
                    .status(400)
                    .jsonp({ status: false, message: "Bad request!" });
                });
            var update_aw_tokens_avaliable = await update_aw_tokens
              .findOne({
                _awareid: req.headers.awareid,
                _id: req.headers.update_aware_token_id,
              })
              .catch((ex) => {
                loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
                return res
                  .status(400)
                  .jsonp({ status: false, message: "Bad request!" });
              });

            if (
              !update_assets_avaliable ||
              !update_tracer_avaliable ||
              !update_self_validation_avaliable ||
              !update_company_compliances_avaliable ||
              !update_kyc_details_avaliable
            ) {
              return res
                .status(200)
                .jsonp({ status: true, data: null, authorization: resp.token });
            } else {
              return res.status(200).jsonp({
                status: true,
                data: {
                  selected_update_aware_token_avaliable:
                    selected_update_aware_token_avaliable,
                  update_assets_avaliable: update_assets_avaliable,
                  update_tracer_avaliable: update_tracer_avaliable,
                  update_self_validation_avaliable:
                    update_self_validation_avaliable,
                  update_company_compliances_avaliable:
                    update_company_compliances_avaliable,
                  update_kyc_details_avaliable: update_kyc_details_avaliable,
                  update_aw_tokens_avaliable: update_aw_tokens_avaliable,
                },
                authorization: resp.token,
              });
            }
          } else {
            return res
              .status(resp.code)
              .jsonp({ status: false, data: null, authorization: null });
          }
        }
      );
    }
  },

  getDetailsForUpdateSelfValidationCertificateAsync: async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).jsonp(errors.array());
    } else {
      if (!req.headers.awareid || !req.headers.update_aware_token_id) {
        return res
          .status(400)
          .jsonp({ status: false, message: "Bad request!" });
      }

      try {
        const kyc_details_avaliable = await kyc_details
          .findOne({
            aware_id: req.headers.awareid,
          })
          .catch((ex) => {
            loggerhandler.logger.error(
              `${ex}, awareid: ${req.headers.awareid}`
            );
            return res
              .status(400)
              .jsonp({ status: false, message: "Bad request!" });
          });

        const account_details_avaliable = await account_details
          .findOne({
            kyc_id: kyc_details_avaliable._id.toString(),
          })
          .catch((ex) => {
            loggerhandler.logger.error(
              `${ex}, email: ${account_details_avaliable?.email}`
            );
            return res
              .status(400)
              .jsonp({ status: false, message: "Bad request!" });
          });

        const selected_update_aware_token_avaliable =
          await selected_update_aware_token
            .findOne({
              _awareid: req.headers.awareid,
              update_aware_token_id: req.headers.update_aware_token_id,
            })
            .catch((ex) => {
              loggerhandler.logger.error(
                `${ex}, email: ${account_details_avaliable?.email}`
              );
              return res
                .status(400)
                .jsonp({ status: false, message: "Bad request!" });
            });

        const update_assets_avaliable = await update_physical_asset
          .findOne({
            _awareid: req.headers.awareid,
            update_aware_token_id: req.headers.update_aware_token_id,
          })
          .catch((ex) => {
            loggerhandler.logger.error(
              `${ex}, email: ${account_details_avaliable?.email}`
            );
            return res
              .status(400)
              .jsonp({ status: false, message: "Bad request!" });
          });

        const update_tracer_avaliable = await update_tracer
          .findOne({
            _awareid: req.headers.awareid,
            update_aware_token_id: req.headers.update_aware_token_id,
          })
          .catch((ex) => {
            loggerhandler.logger.error(
              `${ex}, email: ${account_details_avaliable?.email}`
            );
            return res
              .status(400)
              .jsonp({ status: false, message: "Bad request!" });
          });

        const update_self_validation_avaliable = await update_self_validation
          .findOne({
            _awareid: req.headers.awareid,
            update_aware_token_id: req.headers.update_aware_token_id,
          })
          .catch((ex) => {
            loggerhandler.logger.error(
              `${ex}, email: ${account_details_avaliable?.email}`
            );
            return res
              .status(400)
              .jsonp({ status: false, message: "Bad request!" });
          });

        const update_company_compliances_avaliable =
          await update_company_compliancess
            .findOne({
              _awareid: req.headers.awareid,
              update_aware_token_id: req.headers.update_aware_token_id,
            })
            .catch((ex) => {
              loggerhandler.logger.error(
                `${ex}, email: ${account_details_avaliable?.email}`
              );
              return res
                .status(400)
                .jsonp({ status: false, message: "Bad request!" });
            });

        const role_details = await user_role
          .findOne({
            role_id: Number(account_details_avaliable.role_id),
          })
          .catch((ex) => {
            loggerhandler.logger.error(
              `${ex}, email: ${account_details_avaliable?.email}`
            );
            return res
              .status(400)
              .jsonp({ status: false, message: "Bad request!" });
          });

        let full_name = "";

        if (update_self_validation_avaliable?.sustainble_material?.length > 0) {
          full_name =
            update_self_validation_avaliable?.sustainble_material?.slice(-1)[0]
              .validateInfo?.fullname;
        } else {
          full_name = "N/A";
        }

        return res.status(200).jsonp({
          status: true,
          data: {
            selected_update_aware_token_avaliable,
            update_assets_avaliable,
            update_tracer_avaliable,
            update_self_validation_avaliable,
            update_company_compliances_avaliable,
            kyc_details_avaliable,
            account_details_avaliable,
            role_details,
            full_name,
          },
        });
      } catch (ex) {
        loggerhandler.logger.error(
          `${ex}, email: ${
            account_details_avaliable?.email || "unknown"
          }, awareid: ${req.headers.awareid}`
        );
        return res
          .status(400)
          .jsonp({ status: false, message: "Bad request!" });
      }
    }
  },

  createDraftInfoAsync: async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res
        .status(422)
        .jsonp({ status: false, message: "Bad payload received." });
    } else {
      var payload = { username: req.headers.username };
      refresh(
        req.headers.authorization,
        req.headers.userid,
        payload,
        async function (resp) {
          if (resp.status == true) {
            let draft_id_Exist = req.body.draft_id;

            if (draft_id_Exist) {
              draft_info.findOneAndUpdate(
                {
                  _awareid: req.body._awareid,
                  _id: mongoose.Types.ObjectId(req.body.draft_id),
                },
                {
                  _awareid: req.body._awareid,
                  aware_output_token_type: req.body.aware_output_token_type,
                  date: req.body.date,
                  way_to_update_token: req.body.way_to_update_token
                    ? req.body.way_to_update_token
                    : null,
                  production_facility: req.body.production_facility,
                  value_chain_process_main: req.body.value_chain_process_main,
                  value_chain_process_sub: req.body.value_chain_process_sub,
                },
                { new: true },
                async function (err, user) {
                  if (err) {
                    loggerhandler.logger.error(
                      `${err} ,email:${req.headers.email}`
                    );
                    return res
                      .status(500)
                      .jsonp({ status: false, message: err.toString() });
                  }

                  await draft_info
                    .findOneAndUpdate(
                      {
                        _awareid: req.body._awareid,
                        _id: mongoose.Types.ObjectId(req.body.draft_id),
                      },
                      { create_token_stepper: 2 },
                      { new: true }
                    )
                    .catch((ex) => {
                      loggerhandler.logger.error(
                        `${ex} ,email:${req.headers.email}`
                      );
                      return res
                        .status(500)
                        .jsonp({ status: false, message: ex.toString() });
                    });

                  return res.status(200).jsonp({
                    status: true,
                    message:
                      "Information entered on Select Aware™ Type page has been saved successfully",
                    authorization: resp.token,
                  });
                }
              );
            } else {
              draft_info.create(
                {
                  _awareid: req.body._awareid,
                  status: "CONCEPT",
                  aware_output_token_type: req.body.aware_output_token_type,
                  date: req.body.date,
                  create_token_stepper: 2,
                  way_to_update_token: req.body.way_to_update_token
                    ? req.body.way_to_update_token
                    : null,
                  production_facility: req.body.production_facility,
                  value_chain_process_main: req.body.value_chain_process_main,
                  value_chain_process_sub: req.body.value_chain_process_sub,
                  created_date: new Date(),
                },
                async function (err, user) {
                  if (err) {
                    loggerhandler.logger.error(
                      `${err} ,email:${req.headers.email}`
                    );
                    return res
                      .status(500)
                      .jsonp({ status: false, message: err.toString() });
                  }

                  return res.status(200).jsonp({
                    status: true,
                    data: { _id: user._id, _awareid: user._awareid },
                    message:
                      "Information entered on Select Aware™ Token page has been successfully saved",
                    authorization: resp.token,
                  });
                }
              );
            }
          } else {
            return res
              .status(resp.code)
              .jsonp({ status: false, message: null, authorization: null });
          }
        }
      );
    }
  },

  getDraftInfoAsync: async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).jsonp(errors.array());
    } else {
      if (
        !req.headers.userid ||
        !req.headers.username ||
        !req.headers.authorization ||
        !req.headers.awareid ||
        !req.headers.draft_id
      ) {
        return res
          .status(400)
          .jsonp({ status: false, message: "Bad request!" });
      }

      var payload = { username: req.headers.username };
      refresh(
        req.headers.authorization,
        req.headers.userid,
        payload,
        async function (resp) {
          if (resp.status == true) {
            var getDraftInfoAsync = await draft_info
              .findOne({
                _awareid: req.headers.awareid,
                _id: mongoose.Types.ObjectId(req.headers.draft_id),
              })
              .catch((ex) => {
                loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
                return res
                  .status(400)
                  .jsonp({ status: false, message: "Bad request!" });
              });

            if (!getDraftInfoAsync) {
              return res.status(401).jsonp({
                status: false,
                data: null,
                message: "No Draft Info Found",
                authorization: resp.token,
              });
            } else {
              return res.status(200).jsonp({
                status: true,
                data: getDraftInfoAsync,
                authorization: resp.token,
              });
            }
          } else {
            return res
              .status(resp.code)
              .jsonp({ status: false, data: null, authorization: null });
          }
        }
      );
    }
  },
  selectUpdateAwareTokenTypeAsync: async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res
        .status(422)
        .jsonp({ status: false, message: "Bad payload received." });
    } else {
      if (req.body.update_aware_token_id) {
        const selected_update_aware_token_exist =
          await selected_update_aware_token
            .findOne({
              _awareid: req.body._awareid,
              update_aware_token_id: req.body.update_aware_token_id,
            })
            .catch((ex) => {
              loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
              return res
                .status(500)
                .jsonp({ status: false, message: ex.toString() });
            });

        var payload = { username: req.headers.username };
        refresh(
          req.headers.authorization,
          req.headers.userid,
          payload,
          async function (resp) {
            if (resp.status == true) {
              let product_line_type = req.body.way_to_update_token
                ? req.body.way_to_update_token
                : "noProductProducer";

              if (selected_update_aware_token_exist) {
                selected_update_aware_token.findOneAndUpdate(
                  {
                    _awareid: req.body._awareid,
                    update_aware_token_id: req.body.update_aware_token_id,
                  },
                  {
                    _awareid: req.body._awareid,
                    update_aware_token_id: req.body.update_aware_token_id,
                    aware_output_token_type: req.body.aware_output_token_type,
                    date: req.body.date,
                    way_to_update_token: req.body.way_to_update_token
                      ? req.body.way_to_update_token
                      : null,
                    production_facility: req.body.production_facility,
                    value_chain_process_main: req.body.value_chain_process_main,
                    value_chain_process_sub: req.body.value_chain_process_sub,
                  },
                  { new: true },
                  async function (err, user) {
                    if (err) {
                      loggerhandler.logger.error(
                        `${err} ,email:${req.headers.email}`
                      );
                      return res
                        .status(500)
                        .jsonp({ status: false, message: err.toString() });
                    }
                    if (product_line_type == "productLine") {
                      await update_aw_tokens
                        .findOneAndUpdate(
                          {
                            _awareid: req.body._awareid,
                            _id: mongoose.Types.ObjectId(
                              req.body.update_aware_token_id
                            ),
                          },
                          {
                            create_token_stepper: 2,
                            line_type: 3,
                            type_of_token: req.body.aware_output_token_type,
                          },
                          { new: true }
                        )
                        .catch((ex) => {
                          loggerhandler.logger.error(
                            `${ex} ,email:${req.headers.email}`
                          );
                          return res
                            .status(500)
                            .jsonp({ status: false, message: ex.toString() });
                        });

                      return res.status(200).jsonp({
                        status: true,
                        message:
                          "Information entered on Select Aware™ Type page has been saved successfully",
                        authorization: resp.token,
                      });
                    } else if (product_line_type == "newPO") {
                      await update_aw_tokens
                        .findOneAndUpdate(
                          {
                            _awareid: req.body._awareid,
                            _id: mongoose.Types.ObjectId(
                              req.body.update_aware_token_id
                            ),
                          },
                          {
                            create_token_stepper: 2,
                            line_type: 2,
                            type_of_token: req.body.aware_output_token_type,
                          },
                          { new: true }
                        )
                        .catch((ex) => {
                          loggerhandler.logger.error(
                            `${ex} ,email:${req.headers.email}`
                          );
                          return res
                            .status(500)
                            .jsonp({ status: false, message: ex.toString() });
                        });

                      return res.status(200).jsonp({
                        status: true,
                        message:
                          "Information entered on Select Aware™ Type page has been saved successfully",
                        authorization: resp.token,
                      });
                    } else {
                      await update_aw_tokens
                        .findOneAndUpdate(
                          {
                            _awareid: req.body._awareid,
                            _id: mongoose.Types.ObjectId(
                              req.body.update_aware_token_id
                            ),
                          },
                          {
                            create_token_stepper: 2,
                            line_type: 1,
                            type_of_token: req.body.aware_output_token_type,
                          },
                          { new: true }
                        )
                        .catch((ex) => {
                          loggerhandler.logger.error(
                            `${ex} ,email:${req.headers.email}`
                          );
                          return res
                            .status(500)
                            .jsonp({ status: false, message: ex.toString() });
                        });

                      return res.status(200).jsonp({
                        status: true,
                        message:
                          "Information entered on Select Aware™ Type page has been saved successfully",
                        authorization: resp.token,
                      });
                    }
                  }
                );
              } else {
                await selected_update_aware_token
                  .create({
                    _awareid: req.body._awareid,
                    update_aware_token_id: req.body.update_aware_token_id,
                    aware_output_token_type: req.body.aware_output_token_type,
                    date: req.body.date,
                    way_to_update_token: req.body.way_to_update_token
                      ? req.body.way_to_update_token
                      : null,
                    production_facility: req.body.production_facility,
                    value_chain_process_main: req.body.value_chain_process_main,
                    value_chain_process_sub: req.body.value_chain_process_sub,
                  })
                  .catch(() => {
                    return res
                      .status(500)
                      .jsonp({ status: false, message: ex.toString() });
                  });
                if (product_line_type == "productLine") {
                  await update_aw_tokens
                    .findOneAndUpdate(
                      {
                        _awareid: req.body._awareid,
                        _id: mongoose.Types.ObjectId(
                          req.body.update_aware_token_id
                        ),
                      },
                      {
                        create_token_stepper: 2,
                        line_type: 3,
                        type_of_token: req.body.aware_output_token_type,
                      },
                      { new: true }
                    )
                    .catch((ex) => {
                      loggerhandler.logger.error(
                        `${ex} ,email:${req.headers.email}`
                      );
                      return res
                        .status(500)
                        .jsonp({ status: false, message: ex.toString() });
                    });

                  return res.status(200).jsonp({
                    status: true,
                    message:
                      "Information entered on Select Aware™ Type page has been saved successfully",
                    authorization: resp.token,
                  });
                } else if (product_line_type == "newPO") {
                  await update_aw_tokens
                    .findOneAndUpdate(
                      {
                        _awareid: req.body._awareid,
                        _id: mongoose.Types.ObjectId(
                          req.body.update_aware_token_id
                        ),
                      },
                      {
                        create_token_stepper: 2,
                        line_type: 2,
                        type_of_token: req.body.aware_output_token_type,
                      },
                      { new: true }
                    )
                    .catch((ex) => {
                      loggerhandler.logger.error(
                        `${ex} ,email:${req.headers.email}`
                      );
                      return res
                        .status(500)
                        .jsonp({ status: false, message: ex.toString() });
                    });

                  return res.status(200).jsonp({
                    status: true,
                    message:
                      "Information entered on Select Aware™ Type page has been saved successfully",
                    authorization: resp.token,
                  });
                } else {
                  await update_aw_tokens
                    .findOneAndUpdate(
                      {
                        _awareid: req.body._awareid,
                        _id: mongoose.Types.ObjectId(
                          req.body.update_aware_token_id
                        ),
                      },
                      {
                        create_token_stepper: 2,
                        line_type: 1,
                        type_of_token: req.body.aware_output_token_type,
                      },
                      { new: true }
                    )
                    .catch((ex) => {
                      loggerhandler.logger.error(
                        `${ex} ,email:${req.headers.email}`
                      );
                      return res
                        .status(500)
                        .jsonp({ status: false, message: ex.toString() });
                    });

                  return res.status(200).jsonp({
                    status: true,
                    message:
                      "Information entered on Select Aware™ Type page has been saved successfully",
                    authorization: resp.token,
                  });
                }
              }
            } else {
              return res
                .status(resp.code)
                .jsonp({ status: false, message: null, authorization: null });
            }
          }
        );
      }
    }
  },

  getSelectedUpdateAwareTokenTypeAsync: async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).jsonp(errors.array());
    } else {
      if (req.headers.update_aware_token_id) {
        if (
          !req.headers.userid ||
          !req.headers.username ||
          !req.headers.authorization ||
          !req.headers.awareid ||
          !req.headers.update_aware_token_id
        ) {
          return res
            .status(400)
            .jsonp({ status: false, message: "Bad request!" });
        }

        var payload = { username: req.headers.username };
        refresh(
          req.headers.authorization,
          req.headers.userid,
          payload,
          async function (resp) {
            if (resp.status == true) {
              var selected_update_aware_token_avaliable =
                await selected_update_aware_token
                  .findOne({
                    _awareid: req.headers.awareid,
                    update_aware_token_id: req.headers.update_aware_token_id,
                  })
                  .catch((ex) => {
                    loggerhandler.logger.error(
                      `${ex} ,email:${req.headers.email}`
                    );
                    return res
                      .status(400)
                      .jsonp({ status: false, message: "Bad request!" });
                  });

              if (!selected_update_aware_token_avaliable) {
                return res.status(200).jsonp({
                  status: true,
                  data: null,
                  authorization: resp.token,
                });
              } else {
                return res.status(200).jsonp({
                  status: true,
                  data: selected_update_aware_token_avaliable,
                  authorization: resp.token,
                });
              }
            } else {
              return res
                .status(resp.code)
                .jsonp({ status: false, data: null, authorization: null });
            }
          }
        );
      } else {
        if (
          !req.headers.userid ||
          !req.headers.username ||
          !req.headers.authorization ||
          !req.headers.awareid ||
          !req.headers.draft_id
        ) {
          return res
            .status(400)
            .jsonp({ status: false, message: "Bad request!" });
        }

        var payload = { username: req.headers.username };
        refresh(
          req.headers.authorization,
          req.headers.userid,
          payload,
          async function (resp) {
            if (resp.status == true) {
              var selected_update_aware_token_avaliable =
                await selected_update_aware_token
                  .findOne({
                    _awareid: req.headers.awareid,
                    draft_id: req.headers.draft_id,
                  })
                  .catch((ex) => {
                    loggerhandler.logger.error(
                      `${ex} ,email:${req.headers.email}`
                    );
                    return res
                      .status(400)
                      .jsonp({ status: false, message: "Bad request!" });
                  });

              if (!selected_update_aware_token_avaliable) {
                return res.status(200).jsonp({
                  status: true,
                  data: null,
                  authorization: resp.token,
                });
              } else {
                return res.status(200).jsonp({
                  status: true,
                  data: selected_update_aware_token_avaliable,
                  authorization: resp.token,
                });
              }
            } else {
              return res
                .status(resp.code)
                .jsonp({ status: false, data: null, authorization: null });
            }
          }
        );
      }
    }
  },

  getparticularPurchaseOrdersFromBrandAsync: async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).jsonp(errors.array());
    } else {
      if (
        !req.headers.userid ||
        !req.headers.username ||
        !req.headers.authorization ||
        !req.headers.awareid
      ) {
        return res
          .status(400)
          .jsonp({ status: false, message: "Bad request!" });
      }

      var payload = { username: req.headers.username };
      refresh(
        req.headers.authorization,
        req.headers.userid,
        payload,
        async function (resp) {
          if (resp.status == true) {
            var purchase_order_details_avaliable = await purchase_order_details
              .find({
                producer_aware_id: req.headers.awareid,
                _awareid: req.headers.receiver_aware_id,
                deleted: false,
              })
              .catch((ex) => {
                loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
                return res
                  .status(400)
                  .jsonp({ status: false, message: "Bad request!" });
              });

            if (purchase_order_details_avaliable.length <= 0) {
              return res
                .status(200)
                .jsonp({ status: true, data: null, authorization: resp.token });
            } else {
              var jsonData = [];

              for (
                var i = 0;
                i < purchase_order_details_avaliable.length;
                i++
              ) {
                var temp_purchase_order_details_avaliable =
                  purchase_order_details_avaliable[i];

                console.log(
                  "temp_purchase_order_details_avaliable",
                  temp_purchase_order_details_avaliable
                );

                if (
                  temp_purchase_order_details_avaliable.po_id &&
                  temp_purchase_order_details_avaliable.po_id != "null"
                ) {
                  var temp_purchase_orders = await purchase_orders
                    .find({
                      _id: mongoose.Types.ObjectId(
                        temp_purchase_order_details_avaliable.po_id
                      ),
                      deleted: false,
                      status: "SEND",
                      hide: { $ne: true },
                    })
                    .catch((ex) => {
                      loggerhandler.logger.error(
                        `${ex} ,email:${req.headers.email}`
                      );
                      return res
                        .status(400)
                        .jsonp({ status: false, message: "Bad request!" });
                    });

                  console.log("temp_purchase_orders", temp_purchase_orders);

                  if (temp_purchase_orders.length > 0) {
                    var jsonObject = {
                      purchase_orders:
                        temp_purchase_orders.length == 0
                          ? null
                          : temp_purchase_orders[0],
                      purchase_order_details_avaliable:
                        temp_purchase_order_details_avaliable
                          ? temp_purchase_order_details_avaliable
                          : null,
                    };
                    jsonData.push(jsonObject);
                  } else {
                    console.log("hola amigo!");
                  }
                }
              }

              console.log("jsonData", jsonData);

              return res.status(200).jsonp({
                status: true,
                data: jsonData,
                authorization: resp.token,
              });
            }
          } else {
            return res
              .status(resp.code)
              .jsonp({ status: false, data: null, authorization: null });
          }
        }
      );
    }
  },

  getProductLineFromBrandAsync: async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).jsonp(errors.array());
    } else {
      if (
        !req.headers.userid ||
        !req.headers.username ||
        !req.headers.authorization ||
        !req.headers.po_id
      ) {
        return res
          .status(400)
          .jsonp({ status: false, message: "Bad request!" });
      }

      var payload = { username: req.headers.username };
      refresh(
        req.headers.authorization,
        req.headers.userid,
        payload,
        async function (resp) {
          if (resp.status == true) {
            var temp_product_lines_avaliable = await product_lines
              .findOne({
                po_id: req.headers.po_id,
                deleted: false,
                product_line: { $elemMatch: { deleted: false } },
              })
              .catch((ex) => {
                loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
                return res
                  .status(400)
                  .jsonp({ status: false, message: "Bad request!" });
              });

            if (!temp_product_lines_avaliable) {
              return res
                .status(200)
                .jsonp({ status: true, data: null, authorization: resp.token });
            }

            const output = [];
            const map = new Map();
            for (const item of temp_product_lines_avaliable?.product_line) {
              if (!map.has(item.update_aware_token_i)) {
                map.set(item.update_aware_token_id, true);
                output.push(item.update_aware_token_id);
              }
            }

            var update_physical_asset_avaliable = await update_physical_asset
              .find({ update_aware_token_id: { $in: output } })
              .catch((ex) => {
                loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
                return res
                  .status(400)
                  .jsonp({ status: false, message: "Bad request!" });
              });

            var product_line = [];
            for (
              var i = 0;
              i < temp_product_lines_avaliable?.product_line.length;
              i++
            ) {
              var new_object = temp_product_lines_avaliable?.product_line[i];
              if (new_object.update_aware_token_id) {
                var asset_found = update_physical_asset_avaliable.find(
                  (x) =>
                    x.update_aware_token_id == new_object.update_aware_token_id
                );
                if (asset_found) {
                  new_object.attched_token = {
                    update_asset_id: asset_found.updated_aware_asset_id,
                    main_color: asset_found.select_main_color,
                    in_wallet: asset_found.weight,
                    To_be_Send: asset_found.weight,
                    balance: 0,
                    update_aware_token_id: asset_found.update_aware_token_id,
                    temp_lock: false,
                  };
                } else {
                  new_object.attched_token = null;
                }
              }

              product_line.push(new_object);
            }

            var product_lines_avaliable = {
              _id: temp_product_lines_avaliable._id,
              _awareid: temp_product_lines_avaliable._awareid,
              po_id: temp_product_lines_avaliable.po_id,
              product_line: product_line,
              product_line_status:
                temp_product_lines_avaliable.product_line_status,
              created_date: temp_product_lines_avaliable.created_date,
              modified_on: temp_product_lines_avaliable.modified_on,
              __v: temp_product_lines_avaliable.__v,
            };

            if (!product_lines_avaliable) {
              return res
                .status(200)
                .jsonp({ status: true, data: null, authorization: resp.token });
            } else {
              return res.status(200).jsonp({
                status: true,
                data: product_lines_avaliable,
                authorization: resp.token,
              });
            }
          } else {
            return res
              .status(resp.code)
              .jsonp({ status: false, data: null, authorization: null });
          }
        }
      );
    }
  },

  updatePurchaseOrderAsync: async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res
        .status(422)
        .jsonp({ status: false, message: "Bad payload received." });
    } else {
      var payload = { username: req.headers.username };
      refresh(
        req.headers.authorization,
        req.headers.userid,
        payload,
        async function (resp) {
          if (resp.status == true) {
            const productLinesData = await product_lines.findOne({
              po_id: req.body.purchase_order,
              deleted: false,
            });

            if (!productLinesData) {
              return res.status(200).jsonp({
                status: false,
                message: `Product lines not found for the purchase order ${req.body.purchase_order}`,
                authorization: resp.token,
              });
            }

            const productLine = productLinesData.product_line.find(
              (item) => item.id.toString() === req.body.productLineId.toString()
            );

            if (!productLine) {
              return res.status(200).jsonp({
                status: false,
                message: `Product line with ID ${req.body.productLineId} not found`,
                authorization: resp.token,
              });
            }

            if (productLine.update_aware_token_id.trim() !== "") {
              if (
                productLine.update_aware_token_id !==
                req.body.update_aware_token_id
              ) {
                return res.status(401).jsonp({
                  status: false,
                  message:
                    "Product line is already attached with another token",
                  authorization: null,
                });
              }
            }

            await product_lines
              .findOneAndUpdate(
                { po_id: req.body.purchase_order, deleted: false },
                { product_line: req.body.productlist },
                { new: true }
              )
              .catch((ex) => {
                loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
                return res
                  .status(500)
                  .jsonp({ status: false, message: ex.toString() });
              });

            await purchase_orders
              .findOneAndUpdate(
                {
                  _id: mongoose.Types.ObjectId(req.body.purchase_order),
                  deleted: false,
                },
                { locked: true }
              )
              .catch((ex) => {
                loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
                return res
                  .status(400)
                  .jsonp({ status: false, message: "Bad request!" });
              });

            var draft_info_avaliable = await draft_info
              .findOne({ _id: mongoose.Types.ObjectId(req.body.draft_id) })
              .catch((ex) => {
                loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
                return res
                  .status(400)
                  .jsonp({ status: false, message: "Bad request!" });
              });

            if (draft_info_avaliable) {
              const selected_update_aware_token_exist =
                await selected_update_aware_token
                  .findOne({
                    _awareid: req.body._awareid,
                    update_aware_token_id: req.body.update_aware_token_id,
                  })
                  .catch((ex) => {
                    loggerhandler.logger.error(
                      `${ex} ,email:${req.headers.email}`
                    );
                    return res
                      .status(500)
                      .jsonp({ status: false, message: ex.toString() });
                  });
              if (selected_update_aware_token_exist) {
                selected_update_aware_token.findOneAndUpdate(
                  {
                    _awareid: req.body._awareid,
                    update_aware_token_id: req.body.update_aware_token_id,
                  },
                  {
                    _awareid: draft_info_avaliable._awareid,
                    update_aware_token_id: req.body.update_aware_token_id,
                    aware_output_token_type:
                      draft_info_avaliable.aware_output_token_type,
                    date: draft_info_avaliable.date,
                    way_to_update_token:
                      draft_info_avaliable.way_to_update_token
                        ? draft_info_avaliable.way_to_update_token
                        : null,
                    production_facility:
                      draft_info_avaliable.production_facility,
                    value_chain_process_main:
                      draft_info_avaliable.value_chain_process_main,
                    value_chain_process_sub:
                      draft_info_avaliable.value_chain_process_sub,
                  },
                  { new: true },
                  async function (err, user) {
                    if (err) {
                      loggerhandler.logger.error(
                        `${err} ,email:${req.headers.email}`
                      );
                      return res
                        .status(500)
                        .jsonp({ status: false, message: err.toString() });
                    }
                  }
                );
              } else {
                await selected_update_aware_token
                  .create({
                    _awareid: draft_info_avaliable._awareid,
                    update_aware_token_id: req.body.update_aware_token_id,
                    aware_output_token_type:
                      draft_info_avaliable.aware_output_token_type,
                    date: draft_info_avaliable.date,
                    way_to_update_token:
                      draft_info_avaliable.way_to_update_token
                        ? draft_info_avaliable.way_to_update_token
                        : null,
                    production_facility:
                      draft_info_avaliable.production_facility,
                    value_chain_process_main:
                      draft_info_avaliable.value_chain_process_main,
                    value_chain_process_sub:
                      draft_info_avaliable.value_chain_process_sub,
                  })
                  .catch(() => {
                    loggerhandler.logger.error(
                      `${ex} ,email:${req.headers.email}`
                    );
                    return res
                      .status(500)
                      .jsonp({ status: false, message: ex.toString() });
                  });
              }
            }

            draft_info.findOneAndUpdate(
              { _id: mongoose.Types.ObjectId(req.body.draft_id) },
              {
                final_brand: req.body.final_brand,
                purchase_order: req.body.purchase_order,
              },
              { new: true },
              async function (err, user) {
                if (err) {
                  loggerhandler.logger.error(
                    `${err} ,email:${req.headers.email}`
                  );
                  return res
                    .status(500)
                    .jsonp({ status: false, message: err.toString() });
                }
                await update_aw_tokens
                  .findOneAndUpdate(
                    {
                      _awareid: req.body._awareid,
                      _id: mongoose.Types.ObjectId(
                        req.body.update_aware_token_id
                      ),
                    },
                    {
                      create_token_stepper: 2,
                      line_type: 3,
                      type_of_token:
                        draft_info_avaliable.aware_output_token_type,
                    },
                    { new: true }
                  )
                  .catch((ex) => {
                    loggerhandler.logger.error(
                      `${ex} ,email:${req.headers.email}`
                    );
                    return res
                      .status(500)
                      .jsonp({ status: false, message: ex.toString() });
                  });

                await draft_info
                  .findOneAndUpdate(
                    {
                      _awareid: req.body._awareid,
                      _id: mongoose.Types.ObjectId(req.body.draft_id),
                    },
                    { create_token_stepper: 2 },
                    { new: true }
                  )
                  .catch((ex) => {
                    loggerhandler.logger.error(
                      `${ex} ,email:${req.headers.email}`
                    );
                    return res
                      .status(500)
                      .jsonp({ status: false, message: ex.toString() });
                  });

                return res.status(200).jsonp({
                  status: true,
                  message:
                    "Information entered on Update Line Items till now has been saved successfully",
                  authorization: resp.token,
                });
              }
            );
          } else {
            return res
              .status(resp.code)
              .jsonp({ status: false, message: null, authorization: null });
          }
        }
      );
    }
  },

  getParticularProductLineFromBrandAsync: async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).jsonp(errors.array());
    } else {
      if (
        !req.headers.userid ||
        !req.headers.username ||
        !req.headers.authorization ||
        !req.headers.po_id
      ) {
        return res
          .status(400)
          .jsonp({ status: false, message: "Bad request!" });
      }

      var payload = { username: req.headers.username };
      refresh(
        req.headers.authorization,
        req.headers.userid,
        payload,
        async function (resp) {
          if (resp.status == true) {
            var product_lines_avaliable = await product_lines
              .findOne({ po_id: req.headers.po_id, deleted: false })
              .catch((ex) => {
                loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
                return res
                  .status(400)
                  .jsonp({ status: false, message: "Bad request!" });
              });

            if (!product_lines_avaliable) {
              return res
                .status(200)
                .jsonp({ status: true, data: null, authorization: resp.token });
            } else {
              let particular_product_line =
                product_lines_avaliable.product_line.find(
                  (item) =>
                    item.update_aware_token_id ==
                    req.headers.update_aware_token_id
                );

              if (!particular_product_line) {
                return res.status(200).jsonp({
                  status: true,
                  data: null,
                  authorization: resp.token,
                });
              } else {
                return res.status(200).jsonp({
                  status: true,
                  data: particular_product_line,
                  authorization: resp.token,
                });
              }
            }
          } else {
            return res
              .status(resp.code)
              .jsonp({ status: false, data: null, authorization: null });
          }
        }
      );
    }
  },

  getDraftInfoListAsync: async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).jsonp(errors.array());
    }

    if (
      !req.headers.userid ||
      !req.headers.username ||
      !req.headers.authorization ||
      !req.headers.awareid
    ) {
      return res.status(400).jsonp({ status: false, message: "Bad request!" });
    }

    const payload = { username: req.headers.username };
    refresh(
      req.headers.authorization,
      req.headers.userid,
      payload,
      async function (resp) {
        if (!resp.status) {
          return res
            .status(resp.code)
            .jsonp({ status: false, data: null, authorization: null });
        }

        try {
          const getDraftInfoAsync = await draft_info
            .find({
              _awareid: req.headers.awareid,
              status: { $ne: "Approved" },
            })
            .catch((ex) => {
              loggerhandler.logger.error(`${ex}, email:${req.headers.email}`);
              throw new Error("Draft info query failed");
            });

          if (!getDraftInfoAsync.length) {
            return res
              .status(200)
              .jsonp({ status: true, data: null, authorization: resp.token });
          }

          const [product_lines_avaliable, update_physical_asset_avaliable] =
            await Promise.all([
              product_lines.find({ deleted: false }).catch((ex) => {
                loggerhandler.logger.error(`${ex}, email:${req.headers.email}`);
                throw new Error("Product lines query failed");
              }),
              update_physical_asset
                .find({ _awareid: req.headers.awareid })
                .catch((ex) => {
                  loggerhandler.logger.error(
                    `${ex}, email:${req.headers.email}`
                  );
                  throw new Error("Physical assets query failed");
                }),
            ]);

          const token_ids = update_physical_asset_avaliable.map((ele) =>
            mongoose.Types.ObjectId(ele.update_aware_token_id)
          );
          const update_aw_tokens_avaliable = await update_aw_tokens
            .find({ _id: { $in: token_ids } })
            .catch((ex) => {
              loggerhandler.logger.error(`${ex}, email:${req.headers.email}`);
              throw new Error("Update tokens query failed");
            });

          const draft_info_list = getDraftInfoAsync.map((item) => {
            const temp_product_lines_avaliable = product_lines_avaliable.find(
              (x) => x.po_id === item.purchase_order
            );
            const product_line = [];

            if (temp_product_lines_avaliable) {
              const all_po_lines = item.order_lines_in_current_request
                ? item.order_lines_in_current_request.map((el) =>
                    temp_product_lines_avaliable.product_line.find(
                      (x) => x.id === el
                    )
                  )
                : temp_product_lines_avaliable.product_line;

              all_po_lines.forEach((line) => {
                if (line && line.update_aware_token_id) {
                  const asset_found = update_physical_asset_avaliable.find(
                    (x) =>
                      x.update_aware_token_id === line.update_aware_token_id
                  );
                  const update_aw_token_found = update_aw_tokens_avaliable.find(
                    (x) => x._id.equals(line.update_aware_token_id)
                  );

                  if (asset_found) {
                    product_line.push({
                      update_asset_id: asset_found.updated_aware_asset_id,
                      main_color: asset_found.select_main_color,
                      color: asset_found.main_color,
                      weight: asset_found.weight,
                      update_aware_token_id: asset_found.update_aware_token_id,
                      status: update_aw_token_found?.status,
                      order_number: line.order_number,
                    });
                  }
                }
              });
            }

            return {
              _id: item._id,
              _awareid: item._awareid || null,
              status: item.status || null,
              aware_output_token_type: item.aware_output_token_type || null,
              date: item.date || null,
              way_to_update_token: item.way_to_update_token || null,
              final_brand: item.final_brand || null,
              purchase_order: item.purchase_order || null,
              create_token_stepper: item.create_token_stepper || null,
              product_lines_avaliable:
                product_line.length > 0 ? product_line : [],
            };
          });

          return res.status(200).jsonp({
            status: true,
            data: draft_info_list,
            authorization: resp.token,
          });
        } catch (err) {
          loggerhandler.logger.error(err.message);
          return res
            .status(500)
            .jsonp({ status: false, message: "Internal server error!" });
        }
      }
    );
  },

  sendPosToAdminForApprovalAsync: async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res
        .status(422)
        .jsonp({ status: false, message: "Bad payload received." });
    } else {
      var payload = { username: req.headers.username };
      refresh(
        req.headers.authorization,
        req.headers.userid,
        payload,
        async function (resp) {
          if (resp.status == true) {
            if (!req.body.po_id || !req.body.draft_id) {
              return res
                .status(400)
                .jsonp({ status: false, message: "Bad request!" });
            }
            var product_lines_avaliable = await product_lines
              .findOne({ po_id: req.body.po_id, deleted: false })
              .catch((ex) => {
                loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
                return res
                  .status(400)
                  .jsonp({ status: false, message: "Bad request!" });
              });

            console.log(
              "product_lines_avaliable --------------------------------------------",
              product_lines_avaliable
            );
            console.log(
              "--------------------------------------------------------"
            );

            if (!product_lines_avaliable) {
              return res
                .status(400)
                .jsonp({ status: false, message: "Bad request!" });
            } else {
              console.log("Inside Else ------------------------------------");
              let element = product_lines_avaliable.product_line.filter(
                (obj) => obj.update_status == "DONE"
              );

              console.log("element --------------------", element);
              console.log("-------------------------------");

              const output = [];
              const map = new Map();
              for (const item of element) {
                if (
                  !map.has(mongoose.Types.ObjectId(item.update_aware_token_id))
                ) {
                  map.set(
                    mongoose.Types.ObjectId(item.update_aware_token_id),
                    true
                  );
                  output.push(
                    mongoose.Types.ObjectId(item.update_aware_token_id)
                  );
                }
              }

              const temp = [];
              const map8 = new Map();
              for (const item of element) {
                if (!map8.has(item.update_aware_token_id)) {
                  map8.set(item.update_aware_token_id, true);
                  temp.push(item.update_aware_token_id);
                }
              }

              await update_aw_tokens
                .updateMany(
                  { _id: { $in: output } },
                  { status: "SEND" },
                  { new: true }
                )
                .catch((ex) => {
                  loggerhandler.logger.error(
                    `${ex} ,email:${req.headers.email}`
                  );
                  return res
                    .status(400)
                    .jsonp({ status: false, message: "Bad request!" });
                });

              await draft_info
                .findOneAndUpdate(
                  { _id: mongoose.Types.ObjectId(req.body.draft_id) },
                  { status: "SEND" },
                  { new: true }
                )
                .catch((ex) => {
                  loggerhandler.logger.error(
                    `${ex} ,email:${req.headers.email}`
                  );
                  return res
                    .status(400)
                    .jsonp({ status: false, message: "Bad request!" });
                });

              await purchase_orders
                .findOneAndUpdate(
                  {
                    _id: mongoose.Types.ObjectId(req.body.po_id),
                    deleted: false,
                  },
                  { locked: false }
                )
                .catch((ex) => {
                  loggerhandler.logger.error(
                    `${ex} ,email:${req.headers.email}`
                  );
                  return res
                    .status(400)
                    .jsonp({ status: false, message: "Bad request!" });
                });

              var product_line = [];
              for (
                var i = 0;
                i < product_lines_avaliable.product_line.length;
                i++
              ) {
                product_line = product_lines_avaliable.product_line;
                let elementIndex = product_line.findIndex(
                  (obj) => obj.update_aware_token_id == temp[i]
                );
                if (elementIndex >= 0) {
                  if (product_line[elementIndex].update_status == "DONE") {
                    product_line[elementIndex].update_status = "SEND";
                  }
                }
              }

              await product_lines
                .findOneAndUpdate(
                  { po_id: req.body.po_id, deleted: false },
                  {
                    product_line: product_line,
                  },
                  { new: true }
                )
                .catch((ex) => {
                  loggerhandler.logger.error(
                    `${ex} ,email:${req.headers.email}`
                  );
                  return res
                    .status(500)
                    .jsonp({ status: false, message: ex.toString() });
                });

              var update_aw_tokens_avaliable = await update_aw_tokens
                .find({
                  _awareid: req.body._awareid,
                  status: "CONCEPT",
                  create_token_stepper: 1,
                })
                .catch((ex) => {
                  loggerhandler.logger.error(
                    `${ex} ,email:${req.headers.email}`
                  );
                  return res
                    .status(400)
                    .jsonp({ status: false, message: "Bad request!" });
                });

              const output2 = [];
              const map2 = new Map();
              for (const item of update_aw_tokens_avaliable) {
                if (!map2.has(mongoose.Types.ObjectId(item._id))) {
                  map2.set(mongoose.Types.ObjectId(item._id), true);
                  output2.push(mongoose.Types.ObjectId(item._id));
                }
              }

              await update_aw_tokens
                .findOne({ _id: { $in: output }, status: "SEND" })
                .catch((ex) => {
                  return res
                    .status(400)
                    .jsonp({ status: false, message: "Bad request!" });
                });

              let kyc_detail = await kyc_details
                .findOne({ aware_id: req.body._awareid })
                .catch((ex) => {
                  loggerhandler.logger.error(
                    `${ex} ,email:${req.headers.email}`
                  );
                  return res
                    .status(400)
                    .jsonp({ status: false, message: "Bad request!" });
                });

              await notifications.create({
                notification_sent_to: kyc_detail.manager_id,
                message: `You have received a new request for token approval.`,
              });

              await update_aw_tokens
                .deleteMany({ _id: { $in: output2 } })
                .catch((ex) => {
                  loggerhandler.logger.error(
                    `${ex} ,email:${req.headers.email}`
                  );
                  return res
                    .status(400)
                    .jsonp({ status: false, message: "Bad request!" });
                });

              return res.status(200).jsonp({
                status: true,
                message:
                  "Your update token request has been sent to your manager for approval.",
                authorization: resp.token,
              });
            }
          }
        }
      );
    }
  },

  deleteUpdateAwareTokenPoLineAsync: async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res
        .status(422)
        .jsonp({ status: false, message: "Bad payload received." });
    } else {
      if (!req.body.draft_id) {
        return res
          .status(400)
          .jsonp({ status: false, message: "Bad request!" });
      }

      var payload = { username: req.headers.username };
      refresh(
        req.headers.authorization,
        req.headers.userid,
        payload,
        async function (resp) {
          if (resp.status == true) {
            var draft_info_avaliable = await draft_info
              .findOne({
                _awareid: req.headers.awareid,
                _id: mongoose.Types.ObjectId(req.headers.draft_id),
              })
              .catch((ex) => {
                loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
                return res
                  .status(400)
                  .jsonp({ status: false, message: "Bad request!" });
              });

            if (!draft_info_avaliable) {
              return res.status(200).jsonp({
                status: true,
                message: "Update token request has been deleted successfully",
                authorization: resp.token,
              });
            }

            var product_lines_avaliable = await product_lines
              .findOne({
                po_id: draft_info_avaliable.purchase_order,
                deleted: false,
              })
              .catch((ex) => {
                loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
                return res
                  .status(400)
                  .jsonp({ status: false, message: "Bad request!" });
              });

            if (!product_lines_avaliable) {
              await draft_info
                .deleteOne({
                  _awareid: req.headers.awareid,
                  _id: mongoose.Types.ObjectId(req.headers.draft_id),
                })
                .catch((ex) => {
                  loggerhandler.logger.error(
                    `${ex} ,email:${req.headers.email}`
                  );
                  return res
                    .status(400)
                    .jsonp({ status: false, message: "Bad request!" });
                });

              return res.status(200).jsonp({
                status: true,
                message: "Update token request has been deleted successfully",
                authorization: resp.token,
              });
            }

            let element = product_lines_avaliable.product_line.filter(
              (obj) => obj.update_status == "CONCEPT"
            );

            const output = [];
            const map = new Map();
            for (const item of element) {
              if (
                !map.has(mongoose.Types.ObjectId(item.update_aware_token_id))
              ) {
                map.set(
                  mongoose.Types.ObjectId(item.update_aware_token_id),
                  true
                );
                output.push(
                  mongoose.Types.ObjectId(item.update_aware_token_id)
                );
              }
            }

            const temp = [];
            const map8 = new Map();
            for (const item of element) {
              if (!map8.has(item.update_aware_token_id)) {
                map8.set(item.update_aware_token_id, true);
                temp.push(item.update_aware_token_id);
              }
            }

            var main_selected_aware_asset = await update_physical_asset
              .find({ update_aware_token_id: { $in: output } })
              .select(["assetdataArrayMain"])
              .catch((ex) => {
                loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
                return res
                  .status(500)
                  .jsonp({ status: false, message: ex.toString() });
              });

            await update_aw_tokens
              .deleteMany({ _id: { $in: output } })
              .catch((ex) => {
                loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
                return res
                  .status(500)
                  .jsonp({ status: false, message: ex.toString() });
              });

            await update_physical_asset
              .deleteMany({ update_aware_token_id: { $in: temp } })
              .catch((ex) => {
                loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
                return res
                  .status(500)
                  .jsonp({ status: false, message: ex.toString() });
              });

            await update_tracer
              .deleteMany({ update_aware_token_id: { $in: temp } })
              .catch((ex) => {
                loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
                return res
                  .status(500)
                  .jsonp({ status: false, message: ex.toString() });
              });

            await update_self_validation
              .deleteMany({ update_aware_token_id: { $in: temp } })
              .catch((ex) => {
                loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
                return res
                  .status(500)
                  .jsonp({ status: false, message: ex.toString() });
              });

            await update_company_compliancess
              .deleteMany({ update_aware_token_id: { $in: temp } })
              .catch((ex) => {
                loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
                return res
                  .status(500)
                  .jsonp({ status: false, message: ex.toString() });
              });

            await selected_update_aware_token
              .deleteMany({ update_aware_token_id: { $in: temp } })
              .catch((ex) => {
                loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
                return res
                  .status(500)
                  .jsonp({ status: false, message: ex.toString() });
              });

            let output2 = [];
            let map2 = new Map();
            for (const selected_aware_asset of main_selected_aware_asset) {
              for (const item of selected_aware_asset.assetdataArrayMain) {
                if (!map2.has(mongoose.Types.ObjectId(item.tt_id))) {
                  map2.set(mongoose.Types.ObjectId(item.tt_id), true);
                  output2.push(mongoose.Types.ObjectId(item.tt_id));
                }
              }
            }

            await transferred_tokens
              .updateMany(
                { _id: { $in: output2 } },
                { locked: false },
                { new: true }
              )
              .catch((ex) => {
                loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
                return res
                  .status(500)
                  .jsonp({ status: false, message: ex.toString() });
              });

            var product_line = [];
            for (
              var i = 0;
              i < product_lines_avaliable.product_line.length;
              i++
            ) {
              product_line = product_lines_avaliable.product_line;
              let elementIndex = product_line.findIndex(
                (obj) => obj.update_aware_token_id == temp[i]
              );
              if (elementIndex >= 0) {
                product_line[elementIndex].update_status = "SELECT";
                product_line[elementIndex].update_aware_token_id = "";
                product_line[elementIndex].production_quantity = "";
              }
            }

            await product_lines
              .findOneAndUpdate(
                { po_id: draft_info_avaliable.purchase_order, deleted: false },
                { product_line: product_line },
                { new: true }
              )
              .catch((ex) => {
                loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
                return res
                  .status(500)
                  .jsonp({ status: false, message: ex.toString() });
              });

            await purchase_orders
              .findOneAndUpdate(
                {
                  _id: mongoose.Types.ObjectId(
                    draft_info_avaliable.purchase_order
                  ),
                  deleted: false,
                },
                { locked: false }
              )
              .catch((ex) => {
                loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
                return res
                  .status(400)
                  .jsonp({ status: false, message: "Bad request!" });
              });

            await draft_info
              .deleteOne({
                _awareid: req.headers.awareid,
                _id: mongoose.Types.ObjectId(req.headers.draft_id),
              })
              .catch((ex) => {
                loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
                return res
                  .status(400)
                  .jsonp({ status: false, message: "Bad request!" });
              });

            return res.status(200).jsonp({
              status: true,
              message: "Update token request has been deleted successfully",
              authorization: resp.token,
            });
          } else {
            return res
              .status(resp.code)
              .jsonp({ status: false, message: null, authorization: null });
          }
        }
      );
    }
  },

  for_CID: async (req, res) => {
    console.log("working!!!505");
    let data_for_cid = await aw_tokens.find({}).select(["blockchain_id"]);
    console.log("data_for_cid", { data_for_cid });
    return res.status(200).jsonp({ status: false, data: data_for_cid });
  },
};

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const createReadableStream = async (model) => {
  const data = await model.find({}).lean().exec();
  console.log("data", data.length);
  const readableStream = new Readable({ objectMode: true });

  data.forEach((item) => {
    readableStream.push(item);
  });

  readableStream.push(null);

  return readableStream;
};

class TransformStream extends Transform {
  constructor(
    temp_kyc_details,
    temp_selected_update_aware_token,
    temp_update_physical_asset,
    temp_update_tracer,
    temp_update_self_validation,
    temp_update_company_compliancess
  ) {
    super({ objectMode: true });

    this.temp_kyc_details = temp_kyc_details;
    this.temp_selected_update_aware_token = temp_selected_update_aware_token;
    this.temp_update_physical_asset = temp_update_physical_asset;
    this.temp_update_tracer = temp_update_tracer;
    this.temp_update_self_validation = temp_update_self_validation;
    this.temp_update_company_compliancess = temp_update_company_compliancess;
  }

  async _transform(data, encoding, callback) {
    try {
      var temp_aw_token = data;
      var temp_kyc_details_avaliable = this.temp_kyc_details.find(
        (x) => x.aware_id == temp_aw_token._awareid
      );
      var temp_selected_update_aware_token_avaliable =
        this.temp_selected_update_aware_token.find(
          (x) =>
            x._awareid == temp_aw_token._awareid &&
            x.update_aware_token_id == temp_aw_token._id
        );
      var temp_update_assets_avaliable = this.temp_update_physical_asset.find(
        (x) =>
          x._awareid == temp_aw_token._awareid &&
          x.update_aware_token_id == temp_aw_token._id
      );
      var temp_update_tracer_avaliable = this.temp_update_tracer.find(
        (x) =>
          x._awareid == temp_aw_token._awareid &&
          x.update_aware_token_id == temp_aw_token._id
      );
      var temp_update_self_validation_avaliable =
        this.temp_update_self_validation.find(
          (x) =>
            x._awareid == temp_aw_token._awareid &&
            x.update_aware_token_id == temp_aw_token._id
        );
      var temp_update_company_compliances_avaliable =
        this.temp_update_company_compliancess.find(
          (x) =>
            x._awareid == temp_aw_token._awareid &&
            x.update_aware_token_id == temp_aw_token._id
        );

      var jsonObject = {
        update_aw_tokens: temp_aw_token,
        kyc_details_avaliable: temp_kyc_details_avaliable
          ? temp_kyc_details_avaliable
          : null,
        selected_update_aware_token_avaliable:
          temp_selected_update_aware_token_avaliable
            ? temp_selected_update_aware_token_avaliable
            : null,
        update_assets_avaliable: temp_update_assets_avaliable
          ? temp_update_assets_avaliable
          : null,
        update_tracer_avaliable: temp_update_tracer_avaliable
          ? temp_update_tracer_avaliable
          : null,
        update_self_validation_avaliable: temp_update_self_validation_avaliable
          ? temp_update_self_validation_avaliable
          : null,
        update_company_compliances_avaliable:
          temp_update_company_compliances_avaliable
            ? temp_update_company_compliances_avaliable
            : null,
      };

      this.push(jsonObject);

      callback();
    } catch (error) {
      console.log("error", error);
      callback(error);
    }
  }
}

const validateTokenStepper = async (req, res, expectedStep) => {
  try {
    const tokenId = req.body.update_aware_token_id;

    const token = await update_aw_tokens.findOne({
      _id: mongoose.Types.ObjectId(tokenId),
    });

    if (!token) {
      return {
        valid: false,
        statusCode: 404,
        message: "Token not found",
      };
    }

    const serverStepper = token.create_token_stepper;

    if (expectedStep !== serverStepper + 1) {
      return {
        valid: false,
        statusCode: 200,
        message:
          "The token is being modified by another user. Please refresh, open the edit page again, and try once more.",
        currentStep: serverStepper,
        expectedStep: serverStepper + 1,
      };
    }

    console.log(
      `Token stepper validated: ${serverStepper} -> ${expectedStep} 🚀🚀🚀🚀🚀`
    );

    return { valid: true, token };
  } catch (err) {
    loggerhandler.logger.error(
      `${err}, email:${req.headers?.email || "unknown"}`
    );
    return {
      valid: false,
      statusCode: 500,
      message: "Error validating token state",
    };
  }
};

// This function processes aware asset data for composition
async function getAwareAssetDataForComposition(reqData) {
  try {
    const data = await Promise.allSettled(
      reqData?.data.map(async (ele) => {
        const token = await transferred_tokens.findById(ele.tt_id);
        if (!token) return null;

        const assetId =
          token.historical_physical_assets_id ||
          token.historical_update_physical_assets_id;
        const PhysicalAssetType = token.historical_physical_assets_id
          ? physical_assets
          : update_physical_asset;

        const asset = await PhysicalAssetType.findById(assetId);
        if (!asset) return null;

        const TracerassetId =
          token.historical_tracers_id || token.historical_update_tracers_id;
        const tracerType = token.historical_tracers_id ? tracer : update_tracer;

        const tracer_checked =
          (await tracerType.findById(TracerassetId))?.aware_tc_checked || false;

        return (
          asset?.tempcompositionArrayMain || asset?.compositionArrayMain
        )?.map((e) => ({
          ...e?.toObject(),
          used_token: Number(ele.Used_token),
          tracer: tracer_checked,
        }));
      })
    );

    const filteredData = data
      .filter((result) => result && result.value)
      ?.map((result) => result.value)
      ?.flat();
    return { status: true, data: filteredData };
  } catch (error) {
    loggerhandler.logger.error(
      `Error in getAwareAssetDataForComposition: ${error}`
    );
    return { status: false, message: "Error processing asset data" };
  }
}

async function processCompositionData(
  previousAwareAssetComposition,
  physicalAssetCompositionArray,
  physicalAssetData
) {
  // Extract required values from physical asset data
  const weightForCalculation = Number(physicalAssetData?.weight || 1);
  const totalProductionQuantity = Number(
    physicalAssetData?.total_production_quantity || 1000
  );

  // Initialize array to store processed composition materials
  const compositionMaterials = [];

  // Function to process a single composition element
  const processElement = (element, isPreviousAwareAsset) => {
    if (!element) return;

    const compositionMaterial = element.composition_material;
    const sustainabilityClaim = element.sustainability_claim;
    const sustainable = element.sustainable;
    const feedstockRecycledMaterials = element.feedstock_recycled_materials;

    // Calculate values
    const value = Number(element.total_kgs)
      ? (Number(element.total_kgs) * 1000) / totalProductionQuantity
      : 0;

    const totalWeight = element.used_token
      ? (Number(element.used_token) * 1000) / totalProductionQuantity
      : 0;

    const valueFromInnerMaterials = totalWeight
      ? (totalWeight * Number(element.percentage)) / 100
      : 0;

    // Calculate the percentage using the formula
    const calculatedPercentage = Number(
      element.total_kgs
        ? (element.total_kgs / weightForCalculation) * 100
        : ((element.used_token * element.percentage) /
            100 /
            weightForCalculation) *
            100
    );

    // Find if this element already exists in our composition materials
    const elementToUpdate = compositionMaterials.find(
      (item) =>
        item.composition_material === compositionMaterial &&
        item.feedstock_recycled_materials === feedstockRecycledMaterials &&
        item.sustainability_claim === sustainabilityClaim &&
        item.sustainable === sustainable
    );

    if (elementToUpdate) {
      // Update existing element
      elementToUpdate.value += value || valueFromInnerMaterials;
      elementToUpdate.percentage = (
        Number(elementToUpdate.percentage) + calculatedPercentage
      ).toFixed(2);

      // Add tracer information if it's from a previous aware asset
      if (isPreviousAwareAsset) {
        elementToUpdate.tracer =
          elementToUpdate.tracer ||
          (element.total_kgs || element.tracer ? element.tracer : undefined);
      }
    } else {
      // Add new material
      compositionMaterials.push({
        composition_material: compositionMaterial,
        sustainability_claim: sustainabilityClaim,
        sustainable: sustainable,
        feedstock_recycled_materials: feedstockRecycledMaterials,
        percentage: Number(calculatedPercentage.toFixed(2)),
        value: element.total_kgs ? value : valueFromInnerMaterials,
        material: sustainable
          ? `${sustainabilityClaim} ${compositionMaterial}`
          : `Conventional ${compositionMaterial}`,
      });
    }
  };

  // Process previous aware asset composition data
  if (
    previousAwareAssetComposition &&
    Array.isArray(previousAwareAssetComposition)
  ) {
    previousAwareAssetComposition.forEach((element) => {
      processElement(element, true);
    });
  }

  // Process physical asset composition data
  if (
    physicalAssetCompositionArray &&
    Array.isArray(physicalAssetCompositionArray)
  ) {
    physicalAssetCompositionArray.forEach((element) => {
      processElement(element, false);
    });
  }

  // Create the final result with only the required fields
  return compositionMaterials.map((item) => {
    // Format percentage to remove decimal places if it's a whole number
    const percentageValue = parseFloat(item.percentage);
    const formattedPercentage = Number.isInteger(percentageValue)
      ? Number(percentageValue.toFixed(0))
      : Number(percentageValue.toFixed(2));

    return {
      composition_material: item.composition_material,
      sustainability_claim: item.sustainability_claim,
      sustainable: item.sustainable,
      percentage: formattedPercentage,
    };
  });
}
