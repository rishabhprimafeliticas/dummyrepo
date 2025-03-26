var mongoose = require("mongoose");
const { body, validationResult, check } = require("express-validator");
var kyc_details = require("../models/kyc_details");
var account_details = require("../models/account_details");
var QRCode = require("qrcode");
const { createCanvas, loadImage } = require("canvas");
const chandedpi = require("changedpi");
const { refresh } = require("../refresh-token");
const physical_assets = require("../models/physical_asset");
const company_compliances = require("../models/company_compliances");
const source_address = require("../models/source_address");
const self_validation = require("../models/self_validation");
const tracer = require("../models/tracer");
const send_aw_tokens = require("../models/send_aw_tokens");
const select_receiver = require("../models/selected_receiver");
const selected_aware_token = require("../models/selected_aware_token");
const selected_update_aware_token = require("../models/selected_update_aware_token");
const selected_proof_of_delivery = require("../models/selected_proof_of_delivery");
const selected_transaction_certificates = require("../models/selected_transaction_certificates");
const aw_tokens = require("../models/aw_tokens");
var callstack = require("../scripts/call-stack");
const products = require("../models/products");
const purchase_orders = require("../models/purchase_orders");
const product_lines = require("../models/product_lines");
const SendGrid = require("../scripts/send-grid");
const purchase_order_details = require("../models/purchase_order_details");
var cache = require("memory-cache");
const Web3 = require("web3");
const notifications = require("../models/notifications");
var wallets = require("../models/wallets");
const helperfunctions = require("../scripts/helper-functions");
const Big = require("big.js");
const update_aw_tokens = require("../models/update_aw_tokens");
const loggerhandler = require("../logger/log");
const update_physical_asset = require("../models/update_physical_asset");
const abiArray = require("../contract/aware-2022-aib");
const transaction_history = require("../models/transaction_history");
const transferred_tokens = require("../models/transferred-tokens");
const update_tracer = require("../models/update_tracer");
const material_certificates = require("../models/material_certificates");
const material_certificate_types = require("../models/material_certificate_types");

exports.handlers = {
  createSendTokenRequestAsync: async (req, res) => {
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
            send_aw_tokens.create(
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

  getSendAwareTokenRequestsAsync: async (req, res) => {
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
            var send_aw_tokens_avaliable = await send_aw_tokens
              .find({
                _awareid: req.headers.awareid,
                status: { $ne: "Approved" },
                hide: { $ne: true },
              })
              .catch((ex) => {
                loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
                return res
                  .status(400)
                  .jsonp({ status: false, message: "Bad request!" });
              });

            if (send_aw_tokens_avaliable.length <= 0) {
              return res
                .status(200)
                .jsonp({ status: true, data: null, authorization: resp.token });
            } else {
              var selected_receiver_avaliable = await select_receiver
                .find({})
                .catch((ex) => {
                  loggerhandler.logger.error(
                    `${ex} ,email:${req.headers.email}`
                  );
                  return res
                    .status(400)
                    .jsonp({ status: false, message: "Bad request!" });
                });

              var selected_aware_token_avaliable = await selected_aware_token
                .find({})
                .catch((ex) => {
                  loggerhandler.logger.error(
                    `${ex} ,email:${req.headers.email}`
                  );
                  return res
                    .status(400)
                    .jsonp({ status: false, message: "Bad request!" });
                });

              var selected_transaction_certificates_avaliable =
                await selected_transaction_certificates.find({}).catch((ex) => {
                  loggerhandler.logger.error(
                    `${ex} ,email:${req.headers.email}`
                  );
                  return res
                    .status(400)
                    .jsonp({ status: false, message: "Bad request!" });
                });

              var selected_proof_of_delivery_avaliable =
                await selected_proof_of_delivery.find({}).catch((ex) => {
                  loggerhandler.logger.error(
                    `${ex} ,email:${req.headers.email}`
                  );
                  return res
                    .status(400)
                    .jsonp({ status: false, message: "Bad request!" });
                });
              var physical_asset_avaliable = await physical_assets
                .find({})
                .catch((ex) => {
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
              for (var i = 0; i < send_aw_tokens_avaliable.length; i++) {
                var temp_aw_token = send_aw_tokens_avaliable[i];

                var temp_selected_receiver_avaliable =
                  selected_receiver_avaliable.find(
                    (x) =>
                      x._awareid == temp_aw_token._awareid &&
                      x.send_aware_token_id == temp_aw_token._id
                  );
                var temp_selected_aware_token_avaliable =
                  selected_aware_token_avaliable.find(
                    (x) =>
                      x._awareid == temp_aw_token._awareid &&
                      x.send_aware_token_id == temp_aw_token._id
                  );
                var temp_selected_transaction_certificates_avaliable =
                  selected_transaction_certificates_avaliable.find(
                    (x) =>
                      x._awareid == temp_aw_token._awareid &&
                      x.send_aware_token_id == temp_aw_token._id
                  );
                var temp_selected_proof_of_delivery_avaliable =
                  selected_proof_of_delivery_avaliable.find(
                    (x) =>
                      x._awareid == temp_aw_token._awareid &&
                      x.send_aware_token_id == temp_aw_token._id
                  );

                // console.log('ddd',)
                // let token_avaliable =
                temp_selected_aware_token_avaliable?.selected_tokens.forEach(
                  (ele) => {
                    ele.color = null;
                    if (ele.aware_token_id) {
                      ele.color =
                        physical_asset_avaliable.find(
                          (x) => x.aware_token_id == ele.aware_token_id
                        )?.main_color || null;
                    } else if (ele.update_aware_token_id) {
                      ele.color =
                        update_physical_asset_avaliable.find(
                          (x) =>
                            x.update_aware_token_id == ele.update_aware_token_id
                        )?.main_color || null;
                    }
                  }
                );
               
                var jsonObject = {
                  send_aw_tokens: temp_aw_token,
                  selected_receiver_avaliable: temp_selected_receiver_avaliable
                    ? temp_selected_receiver_avaliable
                    : null,
                  selected_aware_token_avaliable:
                    temp_selected_aware_token_avaliable
                      ? temp_selected_aware_token_avaliable
                      : null,
                  selected_transaction_certificates_avaliable:
                    temp_selected_transaction_certificates_avaliable
                      ? temp_selected_transaction_certificates_avaliable
                      : null,
                  selected_proof_of_delivery_avaliable:
                    temp_selected_proof_of_delivery_avaliable
                      ? temp_selected_proof_of_delivery_avaliable
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

  

  selectReceiverAsync: async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res
        .status(422)
        .jsonp({ status: false, message: "Bad payload received." });
    } else {
      const select_receiver_exist = await select_receiver
        .findOne({
          _awareid: req.body._awareid,
          send_aware_token_id: req.body.send_aware_token_id,
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
            if (select_receiver_exist) {
              select_receiver.findOneAndUpdate(
                {
                  _awareid: req.body._awareid,
                  send_aware_token_id: req.body.send_aware_token_id,
                },
                {
                  _awareid: req.body._awareid,
                  send_aware_token_id: req.body.send_aware_token_id,
                  _receiver_awareid: req.body.receiver_awareid,
                  date: new Date(req.body.date),
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

                  await send_aw_tokens
                    .findOneAndUpdate(
                      {
                        _awareid: req.body._awareid,
                        _id: mongoose.Types.ObjectId(
                          req.body.send_aware_token_id
                        ),
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
                      "Information entered on Select Receiver page has been saved successfully",
                    authorization: resp.token,
                  });
                }
              );
            } else {
              select_receiver.create(
                {
                  _awareid: req.body._awareid,
                  send_aware_token_id: req.body.send_aware_token_id,
                  _receiver_awareid: req.body.receiver_awareid,
                  date: new Date(req.body.date),
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

                  await send_aw_tokens
                    .findOneAndUpdate(
                      {
                        _awareid: req.body._awareid,
                        _id: mongoose.Types.ObjectId(
                          req.body.send_aware_token_id
                        ),
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
                      "Information entered on Select Receiver page has been saved successfully",
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

  getSelectedReceiverAsync: async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).jsonp(errors.array());
    } else {
      if (
        !req.headers.userid ||
        !req.headers.username ||
        !req.headers.authorization ||
        !req.headers.awareid ||
        !req.headers.send_aware_token_id
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
            var selected_receiver_avaliable = await select_receiver
              .findOne({
                _awareid: req.headers.awareid,
                send_aware_token_id: req.headers.send_aware_token_id,
              })
              .catch((ex) => {
                loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
                return res
                  .status(400)
                  .jsonp({ status: false, message: "Bad request!" });
              });

            if (!selected_receiver_avaliable) {
              return res
                .status(200)
                .jsonp({ status: true, data: null, authorization: resp.token });
            } else {
              return res.status(200).jsonp({
                status: true,
                data: selected_receiver_avaliable,
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

  getSendAwareTokenDetailsAsync: async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).jsonp(errors.array());
    } else {
      if (
        !req.headers.userid ||
        !req.headers.username ||
        !req.headers.authorization ||
        !req.headers.awareid ||
        !req.headers.send_aware_token_id
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
            var send_aw_tokens_avaliable = await send_aw_tokens
              .findOne({
                _awareid: req.headers.awareid,
                _id: mongoose.Types.ObjectId(req.headers.send_aware_token_id),
              })
              .catch((ex) => {
                loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
                return res
                  .status(400)
                  .jsonp({ status: false, message: "Bad request!" });
              });

            if (!send_aw_tokens_avaliable) {
              return res
                .status(200)
                .jsonp({ status: true, data: null, authorization: resp.token });
            } else {
              return res.status(200).jsonp({
                status: true,
                data: send_aw_tokens_avaliable,
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

  selectAwareTokenAsync: async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res
        .status(422)
        .jsonp({ status: false, message: "Bad payload received." });
    } else {
      const selected_aware_token_exist = await selected_aware_token
        .findOne({
          _awareid: req.body._awareid,
          send_aware_token_id: req.body.send_aware_token_id,
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
            if (selected_aware_token_exist) {
              const output = [];
              const map = new Map();
              for (const item of req.body.selected_tokens) {
                if (!map.has(mongoose.Types.ObjectId(item.aware_token_id))) {
                  map.set(mongoose.Types.ObjectId(item.aware_token_id), true); // set any value to Map
                  output.push(mongoose.Types.ObjectId(item.aware_token_id));
                }
              }

              const output2 = [];
              const map2 = new Map();
              for (const item of req.body.selected_tokens) {
                if (
                  !map2.has(mongoose.Types.ObjectId(item.update_aware_token_id))
                ) {
                  map2.set(
                    mongoose.Types.ObjectId(item.update_aware_token_id),
                    true
                  ); // set any value to Map
                  output2.push(
                    mongoose.Types.ObjectId(item.update_aware_token_id)
                  );
                }
              }

              // console.log("selected_tokens", req.body.selected_tokens)

              // console.log("output", output)

              await aw_tokens
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
              await update_aw_tokens
                .updateMany(
                  { _id: { $in: output2 } },
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

              selected_aware_token.findOneAndUpdate(
                {
                  _awareid: req.body._awareid,
                  send_aware_token_id: req.body.send_aware_token_id,
                },
                {
                  _awareid: req.body._awareid,
                  send_aware_token_id: req.body.send_aware_token_id,
                  aware_token_type: req.body.aware_token_type,
                  selected_tokens: req.body.selected_tokens,
                  po_id: req.body.po_id ? req.body.po_id : null,
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
                    await purchase_orders
                      .findOneAndUpdate(
                        {
                          _id: mongoose.Types.ObjectId(req.body.po_id),
                          deleted: false,
                        },
                        { locked: true }
                      )
                      .catch((ex) => {
                        loggerhandler.logger.error(
                          `${ex} ,email:${req.headers.email}`
                        );
                        return res
                          .status(400)
                          .jsonp({ status: false, message: "Bad request!" });
                      });
                  }
                  await send_aw_tokens
                    .findOneAndUpdate(
                      {
                        _awareid: req.body._awareid,
                        _id: mongoose.Types.ObjectId(
                          req.body.send_aware_token_id
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
                      "Information entered on Select Aware™ Token page has been saved successfully",
                    authorization: resp.token,
                  });
                }
              );
            } else {
              const output = [];
              const map = new Map();
              for (const item of req.body.selected_tokens) {
                if (!map.has(mongoose.Types.ObjectId(item.aware_token_id))) {
                  map.set(mongoose.Types.ObjectId(item.aware_token_id), true); // set any value to Map
                  output.push(mongoose.Types.ObjectId(item.aware_token_id));
                }
              }

              const output2 = [];
              const map2 = new Map();
              for (const item of req.body.selected_tokens) {
                if (
                  !map2.has(mongoose.Types.ObjectId(item.update_aware_token_id))
                ) {
                  map2.set(
                    mongoose.Types.ObjectId(item.update_aware_token_id),
                    true
                  ); // set any value to Map
                  output2.push(
                    mongoose.Types.ObjectId(item.update_aware_token_id)
                  );
                }
              }


              await aw_tokens
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
              await update_aw_tokens
                .updateMany(
                  { _id: { $in: output2 } },
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

              await selected_aware_token
                .create({
                  _awareid: req.body._awareid,
                  send_aware_token_id: req.body.send_aware_token_id,
                  aware_token_type: req.body.aware_token_type,
                  selected_tokens: req.body.selected_tokens,
                  po_id: req.body.po_id ? req.body.po_id : null,
                })
                .catch(() => {
                  return res
                    .status(500)
                    .jsonp({ status: false, message: ex.toString() });
                });

              await send_aw_tokens
                .findOneAndUpdate(
                  {
                    _awareid: req.body._awareid,
                    _id: mongoose.Types.ObjectId(req.body.send_aware_token_id),
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
              if (req.body.po_id) {
                await purchase_orders
                  .findOneAndUpdate(
                    {
                      _id: mongoose.Types.ObjectId(req.body.po_id),
                      deleted: false,
                    },
                    { locked: true }
                  )
                  .catch((ex) => {
                    loggerhandler.logger.error(
                      `${ex} ,email:${req.headers.email}`
                    );
                    return res
                      .status(400)
                      .jsonp({ status: false, message: "Bad request!" });
                  });
              }
              return res.status(200).jsonp({
                status: true,
                message:
                  "Information entered on Select Aware™ Token page has been saved successfully",
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

  getSelectedAwareTokenAsync: async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).jsonp(errors.array());
    } else {
      if (
        !req.headers.userid ||
        !req.headers.username ||
        !req.headers.authorization ||
        !req.headers.awareid ||
        !req.headers.send_aware_token_id
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
            var selected_aware_token_avaliable = await selected_aware_token
              .findOne({
                _awareid: req.headers.awareid,
                send_aware_token_id: req.headers.send_aware_token_id,
              })
              .catch((ex) => {
                loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
                return res
                  .status(400)
                  .jsonp({ status: false, message: "Bad request!" });
              });

            if (!selected_aware_token_avaliable) {
              return res
                .status(200)
                .jsonp({ status: true, data: null, authorization: resp.token });
            } else {
              return res.status(200).jsonp({
                status: true,
                data: selected_aware_token_avaliable,
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

  selectTransactionCertificatesAsync: async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res
        .status(422)
        .jsonp({ status: false, message: "Bad payload received." });
    } else {
      const selected_transaction_certificates_exist =
        await selected_transaction_certificates
          .findOne({
            _awareid: req.body._awareid,
            send_aware_token_id: req.body.send_aware_token_id,
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
            if (selected_transaction_certificates_exist) {
              var new_tran_certificate = {
                transaction_certificate_id: req.body.transaction_certificate_id,
                standard: req.body.standard,
                certification_body: req.body.certification_body,
                tc_date: req.body.tc_date,
                tc_number: req.body.tc_number,
                certificate_doc:
                  req.file != undefined
                    ? req.file.filename.replace(/\s/g, "")
                    : req.body.file_already_exist,
              };

              var certificates = [];
              var transaction_certificates =
                selected_transaction_certificates_exist.transaction_certificates;

              transaction_certificates.forEach(function (i, idx, array) {
                var element = array[idx];
                if (
                  element.transaction_certificate_id ===
                  new_tran_certificate.transaction_certificate_id
                ) {
                  transaction_certificates.splice(idx, 1);
                }
              });

              transaction_certificates.forEach((element) => {
                certificates.push(element);
              });

              certificates.push(new_tran_certificate);

              selected_transaction_certificates.findOneAndUpdate(
                {
                  _awareid: req.body._awareid,
                  send_aware_token_id: req.body.send_aware_token_id,
                },
                {
                  _awareid: req.body._awareid,
                  send_aware_token_id: req.body.send_aware_token_id,
                  transaction_certificates: certificates,
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

                  await send_aw_tokens
                    .findOneAndUpdate(
                      {
                        _awareid: req.body._awareid,
                        _id: mongoose.Types.ObjectId(
                          req.body.send_aware_token_id
                        ),
                      },
                      { create_token_stepper: 4 },
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
                      "Transaction Certificate has been saved successfully",
                    authorization: resp.token,
                  });
                }
              );
            } else {
              selected_transaction_certificates.create(
                {
                  _awareid: req.body._awareid,
                  send_aware_token_id: req.body.send_aware_token_id,
                  transaction_certificates: [
                    {
                      transaction_certificate_id:
                        req.body.transaction_certificate_id,
                      standard: req.body.standard,
                      certification_body: req.body.certification_body,
                      tc_date: req.body.tc_date,
                      tc_number: req.body.tc_number,
                      certificate_doc: req.file.filename.replace(/\s/g, ""),
                    },
                  ],
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

                  await send_aw_tokens
                    .findOneAndUpdate(
                      {
                        _awareid: req.body._awareid,
                        _id: mongoose.Types.ObjectId(
                          req.body.send_aware_token_id
                        ),
                      },
                      { create_token_stepper: 4 },
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
                      "Transaction Certificate has been saved successfully",
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

  getTransactionCertificatesAsync: async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).jsonp(errors.array());
    } else {
      if (
        !req.headers.userid ||
        !req.headers.username ||
        !req.headers.authorization ||
        !req.headers.awareid ||
        !req.headers.send_aware_token_id
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
            var selected_transaction_certificates_avaliable =
              await selected_transaction_certificates
                .findOne({
                  _awareid: req.headers.awareid,
                  send_aware_token_id: req.headers.send_aware_token_id,
                })
                .catch((ex) => {
                  loggerhandler.logger.error(
                    `${ex} ,email:${req.headers.email}`
                  );
                  return res
                    .status(400)
                    .jsonp({ status: false, message: "Bad request!" });
                });

            if (!selected_transaction_certificates_avaliable) {
              return res
                .status(200)
                .jsonp({ status: true, data: null, authorization: resp.token });
            } else {
              return res.status(200).jsonp({
                status: true,
                data: selected_transaction_certificates_avaliable,
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

  deleteTransactionCertificatesAsync: async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res
        .status(422)
        .jsonp({ status: false, message: "Bad payload received." });
    } else {
      const selected_transaction_certificates_exist =
        await selected_transaction_certificates
          .findOne({
            _awareid: req.body._awareid,
            send_aware_token_id: req.body.send_aware_token_id,
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
            if (selected_transaction_certificates_exist) {
             

              var certificates = [];
              var transaction_certificates =
                selected_transaction_certificates_exist.transaction_certificates;

              // console.log("transaction_certificates", transaction_certificates)

              transaction_certificates.forEach(function (i, idx, array) {
                var element = array[idx];
                if (element.transaction_certificate_id === req.body._id) {
                  transaction_certificates.splice(idx, 1);
                }
              });

              transaction_certificates.forEach((element) => {
                certificates.push(element);
              });


              selected_transaction_certificates.findOneAndUpdate(
                {
                  _awareid: req.body._awareid,
                  send_aware_token_id: req.body.send_aware_token_id,
                },
                {
                  _awareid: req.body._awareid,
                  send_aware_token_id: req.body.send_aware_token_id,
                  transaction_certificates: certificates,
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

                  await send_aw_tokens
                    .findOneAndUpdate(
                      {
                        _awareid: req.body._awareid,
                        _id: mongoose.Types.ObjectId(
                          req.body.send_aware_token_id
                        ),
                      },
                      { create_token_stepper: 4 },
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
                      "Transaction Certificate has been deleted successfully",
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

  selectProofOfDeliveryAsync: async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res
        .status(422)
        .jsonp({ status: false, message: "Bad payload received." });
    } else {
      console.log("req1", req.body);
      console.log("req1", req.files);

      const selected_proof_of_delivery_exist = await selected_proof_of_delivery
        .findOne({
          _awareid: req.body._awareid,
          send_aware_token_id: req.body.send_aware_token_id,
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
            if (selected_proof_of_delivery_exist) {
              const material_certificates = JSON.parse(
                req.body.material_certificates
              );

              selected_proof_of_delivery.findOneAndUpdate(
                {
                  _awareid: req.body._awareid,
                  send_aware_token_id: req.body.send_aware_token_id,
                },
                {
                  _awareid: req.body._awareid,
                  send_aware_token_id: req.body.send_aware_token_id,
                  delivery_note_pdf: req.files.delivery
                    ? req.files.delivery[0].filename
                    : selected_proof_of_delivery_exist.delivery_note_pdf,
                  packing_list_pdf: req.files.packing
                    ? req.files.packing[0].filename
                    : selected_proof_of_delivery_exist.packing_list_pdf,
                  material_certificates: material_certificates
                    ? material_certificates
                    : null,
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

                  await send_aw_tokens
                    .findOneAndUpdate(
                      {
                        _awareid: req.body._awareid,
                        _id: mongoose.Types.ObjectId(
                          req.body.send_aware_token_id
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
                      "Information entered on Proof of Delivery has been saved successfully",
                    authorization: resp.token,
                  });
                }
              );
            } else {
              selected_proof_of_delivery.create(
                {
                  _awareid: req.body._awareid,
                  send_aware_token_id: req.body.send_aware_token_id,
                  delivery_note_pdf: req.files.delivery
                    ? req.files.delivery[0].filename
                    : null,
                  packing_list_pdf: req.files.packing
                    ? req.files.packing[0].filename
                    : null,
                  material_certificates: req.files.certificates
                    ? JSON.parse(req.body.material_certificates)
                    : null,
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

                  await send_aw_tokens
                    .findOneAndUpdate(
                      {
                        _awareid: req.body._awareid,
                        _id: mongoose.Types.ObjectId(
                          req.body.send_aware_token_id
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
                      "Information entered on Proof of Delivery has been saved successfully",
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

  getAllSendAwareTokenRequestsAsync: async (req, res) => {
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

    // Pagination variables
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    // Get search term (if provided)
    const searchTerm = req.query.search ? req.query.search.trim() : "";

    const conceptRegex = new RegExp("^concept$", "i");
    let statusMatch = { status: { $not: conceptRegex } };

    function escapeRegExp(string) {
      return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }

    // Search term filtering
    let searchMatch = {};
    if (searchTerm.length > 0) {
      // const escapedSearchTerm = escapeRegExp(searchTerm);
      const escapedSearchTerm = escapeRegExp(searchTerm).replace(
        /\s+/g,
        "\\s+"
      );
      const searchRegex = new RegExp(escapedSearchTerm, "i");
      searchMatch = {
        $or: [
          { status: searchRegex },
          { "selected_aware_token.aware_token_type": searchRegex },
          { "selected_aware_token.selected_tokens.asset_id": searchRegex },
          {
            "selected_aware_token.selected_tokens.update_asset_id": searchRegex,
          },
          { "selected_aware_token.selected_tokens.To_be_Send": searchRegex },
          { "sender_kyc_detail.company_name": searchRegex },
          { "receiver_kyc_detail.company_name": searchRegex },
        ],
      };
      console.log("searchRegex",searchRegex)

    }


    var payload = { username: req.headers.username };
    refresh(
      req.headers.authorization,
      req.headers.userid,
      payload,
      async function (resp) {
        if (resp.status === true) {
          try {
            // Create aggregation pipeline
            const pipeline = [
              // Stage 1: Match tokens that meet status criteria
              { $match: statusMatch },

              // Stage 2: Lookup selected_aware_token
              {
                $lookup: {
                  from: "selected_aware_tokens",
                  let: { awareid: "$_awareid", tokenid: "$_id" },
                  pipeline: [
                    {
                      $match: {
                        $expr: {
                          $and: [
                            { $eq: ["$_awareid", "$$awareid"] },
                            {
                              $eq: [
                                { $toString: "$send_aware_token_id" },
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
                        aware_token_type: 1,
                        selected_tokens: 1,
                      },
                    },
                  ],
                  as: "selected_aware_token",
                },
              },

              // Stage 3: Lookup selected_receiver
              {
                $lookup: {
                  from: "selected_receivers",
                  let: { awareid: "$_awareid", tokenid: "$_id" },
                  pipeline: [
                    {
                      $match: {
                        $expr: {
                          $and: [
                            { $eq: ["$_awareid", "$$awareid"] },
                            {
                              $eq: [
                                { $toString: "$send_aware_token_id" },
                                { $toString: "$$tokenid" },
                              ],
                            },
                          ],
                        },
                      },
                    },
                    { $limit: 1 },
                    {$project: {
                      _awareid: 1,
                      _receiver_awareid: 1
                    }}
                  ],
                  as: "selected_receiver",
                },
              },

              // Stage 4: Lookup kyc_details for sender
              {
                $lookup: {
                  from: "kyc_details",
                  let: {
                    senderAwareId: {
                      $arrayElemAt: ["$selected_receiver._awareid", 0],
                    },
                  },
                  pipeline: [
                    {
                      $match: {
                        $expr: { $eq: ["$aware_id", "$$senderAwareId"] },
                      },
                    },
                    { $limit: 1 },
                    {
                      $project: {
                        company_name: 1
                      }
                    }
                  ],
                  as: "sender_kyc_detail",
                },
              },

              // Stage 5: Lookup kyc_details for receiver
              {
                $lookup: {
                  from: "kyc_details",
                  let: {
                    receiverAwareId: {
                      $arrayElemAt: ["$selected_receiver._receiver_awareid", 0],
                    },
                  },
                  pipeline: [
                    {
                      $match: {
                        $expr: { $eq: ["$aware_id", "$$receiverAwareId"] },
                      },
                    },
                    { $limit: 1 },
                    {
                      $project: {
                        company_name: 1
                      }
                    }
                  ],
                  as: "receiver_kyc_detail",
                },
              },

              

              

              // Stage 6: Apply search filter if provided
              ...(searchTerm.length > 0 ? [{ $match: searchMatch }] : []),

              // Stage 7: Format the output - convert arrays to single objects or null
              {
                $addFields: {
                  selected_aware_token_avaliable: {
                    $cond: {
                      if: { $gt: [{ $size: "$selected_aware_token" }, 0] },
                      then: { $arrayElemAt: ["$selected_aware_token", 0] },
                      else: null,
                    },
                  },
                  selected_receiver_avaliable: {
                    $cond: {
                      if: { $gt: [{ $size: "$selected_receiver" }, 0] },
                      then: { $arrayElemAt: ["$selected_receiver", 0] },
                      else: null,
                    },
                  },
                  selected_sender_company_name: {
                    $cond: {
                      if: {
                        $gt: [{ $size: "$sender_kyc_detail" }, 0],
                      },
                      then: {
                        $arrayElemAt: ["$sender_kyc_detail", 0],
                      },
                      else: null,
                    },
                  },
                  selected_receiver_company_name: {
                    $cond: {
                      if: {
                        $gt: [{ $size: "$receiver_kyc_detail" }, 0],
                      },
                      then: {
                        $arrayElemAt: ["$receiver_kyc_detail", 0],
                      },
                      else: null,
                    },
                  },
                },
              },

              // Stage 8: Create final structure
              {
                $project: {
                  send_aw_tokens: {
                    _id: "$_id",
                    _awareid: "$_awareid",
                    created_date: "$created_date",
                    status: "$status"
                  },
                  selected_aware_token_avaliable: 1,
                  selected_receiver_avaliable: 1,
                  selected_sender_company_name: 1,
                  selected_receiver_company_name: 1,
                },
              },

              // Stage 9: Remove unwanted nested fields from send_aw_tokens
              {
                $unset: [
                  "send_aw_tokens.selected_aware_token",
                  "send_aw_tokens.kyc_detail",
                  "send_aw_tokens.selected_receiver",
                  "send_aw_tokens.selected_aware_token_avaliable",
                  "send_aw_tokens.selected_receiver_avaliable",
                  "send_aw_tokens.selected_sender_company_name",
                  "send_aw_tokens.selected_receiver_company_name",
                ],
              },

              // Stage 10: Sort by created_date descending (newest first)
              {
                $sort: {
                  "send_aw_tokens.created_date": -1,
                },
              },

              // Stage 11: Get total count for pagination
              {
                $facet: {
                  metadata: [{ $count: "total" }],
                  data: [{ $skip: skip }, { $limit: limit }],
                },
              },
            ];

            // Execute aggregation pipeline
            const aggregationResult = await send_aw_tokens
              .aggregate(pipeline)
              .catch((ex) => {
                loggerhandler.logger.error(`${ex}, email:${req.headers.email}`);
                return res
                  .status(400)
                  .jsonp({ status: false, message: "Bad request!" });
              });

              

            if (!aggregationResult || aggregationResult.length === 0) {
              return res.status(200).jsonp({
                status: true,
                data: [],
                pagination: {
                  page,
                  limit,
                  total: 0,
                  pages: 0,
                },
                authorization: resp.token,
              });
            }

            // console.log("aggregationResult", aggregationResult);

            // Extract results and metadata
            const result = aggregationResult[0];
            // console.log("aggregationResult", aggregationResult[0]);
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

  

  getSelectedProofOfDeliveryAsync: async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).jsonp(errors.array());
    } else {
      if (
        !req.headers.userid ||
        !req.headers.username ||
        !req.headers.authorization ||
        !req.headers.awareid ||
        !req.headers.send_aware_token_id
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
            var selected_proof_of_delivery_avaliable =
              await selected_proof_of_delivery
                .findOne({
                  _awareid: req.headers.awareid,
                  send_aware_token_id: req.headers.send_aware_token_id,
                })
                .catch((ex) => {
                  loggerhandler.logger.error(
                    `${ex} ,email:${req.headers.email}`
                  );
                  return res
                    .status(400)
                    .jsonp({ status: false, message: "Bad request!" });
                });

            if (!selected_proof_of_delivery_avaliable) {
              return res
                .status(200)
                .jsonp({ status: true, data: null, authorization: resp.token });
            } else {
              return res.status(200).jsonp({
                status: true,
                data: selected_proof_of_delivery_avaliable,
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

  
  postRecapAsync: async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res
        .status(422)
        .jsonp({ status: false, message: "Bad payload received." });
    } else {
      var selected_aware_token_avaliable = await selected_aware_token
        .findOne({
          _awareid: req.body._awareid,
          send_aware_token_id: req.body.send_aware_token_id,
        })
        .catch((ex) => {
          loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
          return res
            .status(400)
            .jsonp({ status: false, message: "Bad request!" });
        });

      var select_receiver_avaliable = await select_receiver
        .findOne({
          _awareid: req.body._awareid,
          send_aware_token_id: req.body.send_aware_token_id,
        })
        .catch((ex) => {
          loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
          return res
            .status(400)
            .jsonp({ status: false, message: "Bad request!" });
        });

      console.log("start!");

      var connectWeb3 = null;

      try {
        connectWeb3 = await new Web3(
          new Web3.providers.HttpProvider(process.env.BABEL_ENDPOINT)
        );
        await connectWeb3.eth.net.isListening();
      } catch (exx) {
        try {
          connectWeb3 = await new Web3(
            new Web3.providers.HttpProvider(
              process.env.ALTERNATE_BABEL_ENDPOINT
            )
          );
          await connectWeb3.eth.net.isListening();
        } catch (ex) {
          loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
          console.log("ex", ex);
          return res
            .status(500)
            .jsonp({ status: false, message: "Internal error!" });
        }
      }

      console.log("connect!");

      var wallet_of_sender = await wallets
        .findOne({ _awareid: select_receiver_avaliable._awareid })
        .select(["wallet_address_0x", "from", "to"])
        .catch((ex) => {
          loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
          return res
            .status(400)
            .jsonp({ status: false, message: "Bad request!" });
        });
      var wallet_of_receiver = await wallets
        .findOne({ _awareid: select_receiver_avaliable._receiver_awareid })
        .select(["wallet_address_0x", "from", "to"])
        .catch((ex) => {
          loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
          return res
            .status(400)
            .jsonp({ status: false, message: "Bad request!" });
        });

      var from0xaddress = wallet_of_sender.wallet_address_0x;
      var useraddress = wallet_of_receiver.wallet_address_0x;
      var key = wallet_of_sender.from + wallet_of_sender.to;
      var decrypted_private_key = helperfunctions.encryptAddress(
        key,
        "decrypt"
      );

      var privatekey = "";
      for (var i = 3; i < decrypted_private_key.length - 1; i++) {
        privatekey = privatekey + decrypted_private_key[i];
      }

      var count_of_transactions = await connectWeb3.eth.getTransactionCount(
        from0xaddress
      );

      if (count_of_transactions == 0) {
        count_of_transactions += 1;
      }

      const contractAddress = process.env.CONTRACT_ADDRESS;
      var contract = new connectWeb3.eth.Contract(abiArray, contractAddress, {
        from: process.env.ADMIN_WALLET_ADDRESS,
      });

      var token_ids = [];
      var array_of_amounts = [];
      var temp_array = [];

      var result = await Promise.allSettled(
        selected_aware_token_avaliable.selected_tokens.map(async (dataset) => {
          var value = await callstack.blockchainIds(dataset, req);
          token_ids.push(value.blockchain_id.toString());
          array_of_amounts.push(value.To_be_Send.toString());
          temp_array.push({
            id: dataset.update_asset_id,
            blockchain_id: value.blockchain_id,
            To_be_Send: value.To_be_Send,
          });
        })
      );

      console.log("token_ids", token_ids);
      console.log("array_of_amounts", array_of_amounts);

      var promise_failed = result.find((x) => x.status == "rejected");
      if (promise_failed) {
        return res.status(400).jsonp({
          status: false,
          message: "Transaction has been reverted!",
          authorization: null,
        });
      }

      //important code to check ownership and balacne

      for (var i = 0; i < temp_array.length; i++) {
       

        const temp = temp_array[i];

        const owner = await contract.methods.ownerOf(temp.blockchain_id).call();
        const balance_user = await contract.methods
          .balanceOf(useraddress.toLowerCase(), temp.blockchain_id)
          .call();
        const DUMP_WALLET_ADDRESS = await contract.methods
          .balanceOf(
            process.env.DUMP_WALLET_ADDRESS.toLowerCase(),
            temp.blockchain_id
          )
          .call();
        const owner_balacne = await contract.methods
          .balanceOf(owner.toLowerCase(), temp.blockchain_id)
          .call();
        const balance_admin = await contract.methods
          .balanceOf(from0xaddress.toLowerCase(), temp.blockchain_id)
          .call();

        console.log("To_be_Send", temp.To_be_Send);

        console.log("owner", owner);
        console.log("useraddress from token is transferring", from0xaddress);
        console.log("useraddress to token t/f", useraddress);

        console.log("balance_admin", balance_admin);
        console.log("owner_balacne", owner_balacne);
        console.log("useraddress balacne", balance_user);
        console.log("DUMP_WALLET_ADDRESS", DUMP_WALLET_ADDRESS);
      }

      // //Code that needs to be uncommented later
      var gasAmount = await contract.methods
        .safeBatchTransferFrom(
          from0xaddress.toLowerCase(),
          useraddress.toLowerCase(),
          token_ids,
          array_of_amounts,
          []
        )
        .estimateGas({ from: from0xaddress });

      var increased = Number(gasAmount) * 0.2;
      gasAmount = Math.ceil(Number(gasAmount) + increased);

      console.log("gasAmount", gasAmount);

      var blockDetails = await connectWeb3.eth.getBlock("latest");
      console.log("blockDetails", blockDetails);

      connectWeb3.eth
        .getBalance(from0xaddress.toLowerCase())
        .then(async function (balance) {
          let iotxBalance = Big(balance).div(10 ** 18);
          console.log(
            "Balance while send aw update token",
            iotxBalance.toFixed(18)
          );

          const senderKycDetails = await kyc_details
            .findOne({ aware_id: select_receiver_avaliable._awareid })
            .catch((ex) => {
              return res
                .status(400)
                .jsonp({ status: false, message: "Bad request!" });
            });
          const receiverKycDetails = await kyc_details
            .findOne({ aware_id: select_receiver_avaliable._receiver_awareid })
            .catch((ex) => {
              return res
                .status(400)
                .jsonp({ status: false, message: "Bad request!" });
            });
          const sender_details = await account_details
            .findOne({ kyc_id: senderKycDetails?._id })
            .catch((ex) => {
              return res
                .status(400)
                .jsonp({ status: false, message: "Bad request!" });
            });
          const receiver_details = await account_details
            .findOne({ kyc_id: receiverKycDetails?._id })
            .catch((ex) => {
              return res
                .status(400)
                .jsonp({ status: false, message: "Bad request!" });
            });

          let object = {
            senderKycDetails,
            receiverKycDetails,
            sender_details,
            receiver_details,
            token_list: selected_aware_token_avaliable.selected_tokens,
            token_type: selected_aware_token_avaliable.aware_token_type,
            send_aware_token_id: req.body.send_aware_token_id,
          };
          if (iotxBalance.toFixed(18) < 10) {
            await transferAsync(
              from0xaddress,
              gasAmount,
              async function (response) {
                connectWeb3.eth
                  .getBalance(from0xaddress.toLowerCase())
                  .then(async function (balance) {
                    let iotxBalance = Big(balance).div(10 ** 18);
                    console.log(
                      "Balance after t/f of funds send aw token",
                      iotxBalance.toFixed(18)
                    );
                    if (response == true && iotxBalance.toFixed(18) > 0) {
                      const gasPrice = await connectWeb3.eth.getGasPrice();

                      console.log(
                        "calculate",
                        Number(gasPrice) * Number(gasAmount)
                      );

                      const txConfig = {
                        from: from0xaddress,
                        to: contractAddress,
                        gasPrice: gasPrice,
                        gas: gasAmount.toString(),
                        data: contract.methods
                          .safeBatchTransferFrom(
                            from0xaddress.toLowerCase(),
                            useraddress.toLowerCase(),
                            token_ids,
                            array_of_amounts,
                            []
                          )
                          .encodeABI(),
                      };

                      console.log("bangtxConfig", txConfig);

                      connectWeb3.eth.accounts.signTransaction(
                        txConfig,
                        "0x" + privatekey,
                        async function (err, signedTx) {
                          if (err) {
                            loggerhandler.logger.error(
                              `${err} ,email:${req.headers.email}`
                            );
                            console.log("signTransactionerr", err);
                            return res.status(500).jsonp({
                              status: false,
                              message: "Internal error!",
                            });
                          }

                          console.log("signedTx", signedTx);
                          connectWeb3.eth
                            .sendSignedTransaction(signedTx.rawTransaction)
                            .on("receipt", async function (receipt) {
                              console.log("Tx Hash (Receipt): ", receipt);

                              var result_promise = await Promise.allSettled(
                                selected_aware_token_avaliable.selected_tokens.map(
                                  async (dataset) => {
                                    await callstack.sendTokenAndUpdateBalanceInBatch(
                                      dataset,
                                      select_receiver_avaliable,
                                      selected_aware_token_avaliable,
                                      receipt,
                                      req
                                    );
                                  }
                                )
                              );

                              var promise_failed = result_promise.find(
                                (x) => x.status == "rejected"
                              );
                              if (promise_failed) {
                                return res.status(400).jsonp({
                                  status: false,
                                  message: "Transaction has been reverted!",
                                  authorization: null,
                                });
                              }

                              var send_aw_tokens_avaliable =
                                await send_aw_tokens
                                  .find({
                                    _awareid: req.body._awareid,
                                    status: "CONCEPT",
                                    create_token_stepper: 1,
                                  })
                                  .catch((ex) => {
                                    loggerhandler.logger.error(
                                      `${ex} ,email:${req.headers.email}`
                                    );
                                    return res.status(400).jsonp({
                                      status: false,
                                      message: "Bad request!",
                                    });
                                  });

                              const output = [];
                              const map = new Map();
                              for (const item of send_aw_tokens_avaliable) {
                                if (
                                  !map.has(mongoose.Types.ObjectId(item._id))
                                ) {
                                  map.set(
                                    mongoose.Types.ObjectId(item._id),
                                    true
                                  ); // set any value to Map
                                  output.push(
                                    mongoose.Types.ObjectId(item._id)
                                  );
                                }
                              }

                              await send_aw_tokens
                                .findOneAndUpdate(
                                  {
                                    _awareid: req.body._awareid,
                                    _id: mongoose.Types.ObjectId(
                                      req.body.send_aware_token_id
                                    ),
                                  },
                                  { status: "SEND" },
                                  { new: true }
                                )
                                .catch((ex) => {
                                  loggerhandler.logger.error(
                                    `${ex} ,email:${req.headers.email}`
                                  );
                                  return res.status(400).jsonp({
                                    status: false,
                                    message: "Bad request!",
                                  });
                                });

                              await send_aw_tokens
                                .deleteMany({ _id: { $in: output } })
                                .catch((ex) => {
                                  return res.status(400).jsonp({
                                    status: false,
                                    message: "Bad request!",
                                  });
                                });
                              const senderKycDetails = await kyc_details
                                .findOne({
                                  aware_id: select_receiver_avaliable._awareid,
                                })
                                .catch((ex) => {
                                  return res.status(400).jsonp({
                                    status: false,
                                    message: "Bad request!",
                                  });
                                });
                              const receiverKycDetails = await kyc_details
                                .findOne({
                                  aware_id:
                                    select_receiver_avaliable._receiver_awareid,
                                })
                                .catch((ex) => {
                                  return res.status(400).jsonp({
                                    status: false,
                                    message: "Bad request!",
                                  });
                                });
                              const sender_details = await account_details
                                .findOne({ kyc_id: senderKycDetails?._id })
                                .catch((ex) => {
                                  return res.status(400).jsonp({
                                    status: false,
                                    message: "Bad request!",
                                  });
                                });
                              const receiver_details = await account_details
                                .findOne({ kyc_id: receiverKycDetails?._id })
                                .catch((ex) => {
                                  return res.status(400).jsonp({
                                    status: false,
                                    message: "Bad request!",
                                  });
                                });

                              if (req.body.po_id) {
                                await purchase_orders
                                  .findOneAndUpdate(
                                    {
                                      _id: mongoose.Types.ObjectId(
                                        req.body.po_id
                                      ),
                                      deleted: false,
                                    },
                                    { locked: false }
                                  )
                                  .catch((ex) => {
                                    loggerhandler.logger.error(
                                      `${ex} ,email:${req.headers.email}`
                                    );
                                    return res.status(400).jsonp({
                                      status: false,
                                      message: "Bad request!",
                                    });
                                  });

                                var product_lines_avaliable =
                                  await product_lines
                                    .findOne({
                                      po_id: req.body.po_id,
                                      deleted: false,
                                      product_line: {
                                        $elemMatch: { deleted: false },
                                      },
                                    })
                                    .catch((ex) => {
                                      loggerhandler.logger.error(
                                        `${ex} ,email:${req.headers.email}`
                                      );
                                      return res.status(400).jsonp({
                                        status: false,
                                        message: "Bad request!",
                                      });
                                    });
                                //Shivam chauhan
                                if (product_lines_avaliable) {
                                  let length = 0;
                                  var product_line =
                                    product_lines_avaliable.product_line;
                                  product_line.forEach((ele) => {
                                    let approved_line =
                                      ele.update_status == "APPROVED";
                                    if (approved_line) {
                                      length += 1;
                                      ele.update_status = "FILLED";
                                    }
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
                                      return res.status(500).jsonp({
                                        status: false,
                                        message: ex.toString(),
                                      });
                                    });
                                  let validate = product_line.every(
                                    (e) => e.update_status == "FILLED"
                                  );
                                  if (validate) {
                                    await purchase_orders
                                      .findOneAndUpdate(
                                        {
                                          _id: mongoose.Types.ObjectId(
                                            req.body.po_id
                                          ),
                                          deleted: false,
                                        },
                                        { status: "FILLED" },
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
                                  }
                                  await notifications.create({
                                    notification_sent_to:
                                      select_receiver_avaliable._receiver_awareid,
                                    message: `A DPP report by ${senderKycDetails?.company_name} is live now.`,
                                  });

                                  await notifications.create({
                                    notification_sent_to:
                                      select_receiver_avaliable._receiver_awareid,
                                    message:
                                      length == 1
                                        ? `${length} DPPs is live now`
                                        : `${length} DPPs are live now`,
                                  });
                                }
                              }

                              let object = {
                                senderKycDetails,
                                receiverKycDetails,
                                sender_details,
                                receiver_details,
                                token_list:
                                  selected_aware_token_avaliable.selected_tokens,
                                token_type:
                                  selected_aware_token_avaliable.aware_token_type,
                                send_aware_token_id:
                                  req.body.send_aware_token_id,
                              };

                              var payload = { username: req.headers.username };
                              refresh(
                                req.headers.authorization,
                                req.headers.userid,
                                payload,
                                async function (resp) {
                                  if (resp.status == true) {
                                    SendGrid.sendCryptoTcMail(
                                      object,
                                      async (result) => {
                                        if (result != null) {
                                          await Promise.allSettled(
                                            array_of_amounts.map(
                                              async (dataset) => {
                                                await notifications.create({
                                                  notification_sent_to:
                                                    select_receiver_avaliable._receiver_awareid,
                                                  message: `${senderKycDetails?.company_name} sent ${dataset} tokens to you`,
                                                });
                                              }
                                            )
                                          );

                                          return res.status(200).jsonp({
                                            status: true,
                                            message:
                                              "Tokens have been transferred successfully",
                                            authorization: resp.token,
                                          });
                                        } else {
                                          return res.status(500).jsonp({
                                            status: false,
                                            message: null,
                                            authorization: null,
                                          });
                                        }
                                      }
                                    );
                                  } else {
                                    return res.status(resp.code).jsonp({
                                      status: false,
                                      message: null,
                                      authorization: null,
                                    });
                                  }
                                }
                              );
                            })
                            .on("error", async function (e) {
                              console.log("e", e);

                              checkTransactionReceipt(
                                connectWeb3,
                                signedTx.transactionHash,
                                async function (result) {
                                  // Handle the result as needed
                                  console.log("Transaction result:", result);

                                  if (result == true) {
                                    // callback(true);

                                    var result_promise =
                                      await Promise.allSettled(
                                        selected_aware_token_avaliable.selected_tokens.map(
                                          async (dataset) => {
                                            await callstack.sendTokenAndUpdateBalanceInBatch(
                                              dataset,
                                              select_receiver_avaliable,
                                              selected_aware_token_avaliable,
                                              receipt,
                                              req
                                            );
                                          }
                                        )
                                      );

                                    var promise_failed = result_promise.find(
                                      (x) => x.status == "rejected"
                                    );
                                    if (promise_failed) {
                                      return res.status(400).jsonp({
                                        status: false,
                                        message:
                                          "Transaction has been reverted!",
                                        authorization: null,
                                      });
                                    }

                                    var send_aw_tokens_avaliable =
                                      await send_aw_tokens
                                        .find({
                                          _awareid: req.body._awareid,
                                          status: "CONCEPT",
                                          create_token_stepper: 1,
                                        })
                                        .catch((ex) => {
                                          loggerhandler.logger.error(
                                            `${ex} ,email:${req.headers.email}`
                                          );
                                          return res.status(400).jsonp({
                                            status: false,
                                            message: "Bad request!",
                                          });
                                        });

                                    const output = [];
                                    const map = new Map();
                                    for (const item of send_aw_tokens_avaliable) {
                                      if (
                                        !map.has(
                                          mongoose.Types.ObjectId(item._id)
                                        )
                                      ) {
                                        map.set(
                                          mongoose.Types.ObjectId(item._id),
                                          true
                                        ); // set any value to Map
                                        output.push(
                                          mongoose.Types.ObjectId(item._id)
                                        );
                                      }
                                    }

                                    await send_aw_tokens
                                      .findOneAndUpdate(
                                        {
                                          _awareid: req.body._awareid,
                                          _id: mongoose.Types.ObjectId(
                                            req.body.send_aware_token_id
                                          ),
                                        },
                                        { status: "SEND" },
                                        { new: true }
                                      )
                                      .catch((ex) => {
                                        loggerhandler.logger.error(
                                          `${ex} ,email:${req.headers.email}`
                                        );
                                        return res.status(400).jsonp({
                                          status: false,
                                          message: "Bad request!",
                                        });
                                      });

                                    await send_aw_tokens
                                      .deleteMany({ _id: { $in: output } })
                                      .catch((ex) => {
                                        return res.status(400).jsonp({
                                          status: false,
                                          message: "Bad request!",
                                        });
                                      });
                                    if (req.body.po_id) {
                                      await purchase_orders
                                        .findOneAndUpdate(
                                          {
                                            _id: mongoose.Types.ObjectId(
                                              req.body.po_id
                                            ),
                                            deleted: false,
                                          },
                                          { locked: false }
                                        )
                                        .catch((ex) => {
                                          loggerhandler.logger.error(
                                            `${ex} ,email:${req.headers.email}`
                                          );
                                          return res.status(400).jsonp({
                                            status: false,
                                            message: "Bad request!",
                                          });
                                        });
                                      var product_lines_avaliable =
                                        await product_lines
                                          .findOne({
                                            po_id: req.body.po_id,
                                            deleted: false,
                                          })
                                          .catch((ex) => {
                                            loggerhandler.logger.error(
                                              `${ex} ,email:${req.headers.email}`
                                            );
                                            return res.status(400).jsonp({
                                              status: false,
                                              message: "Bad request!",
                                            });
                                          });
                                      if (product_lines_avaliable) {
                                        let length = 0;
                                        var product_line =
                                          product_lines_avaliable.product_line;
                                        product_line.forEach((ele) => {
                                          let approved_line =
                                            ele.update_status == "APPROVED";
                                          if (approved_line) {
                                            length += 1;
                                            ele.update_status = "FILLED";
                                          }
                                        });
                                        await product_lines
                                          .findOneAndUpdate(
                                            {
                                              po_id: req.body.po_id,
                                              deleted: false,
                                            },
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
                                        let validate = product_line.every(
                                          (e) => e.update_status == "FILLED"
                                        );
                                        if (validate) {
                                          await purchase_orders
                                            .findOneAndUpdate(
                                              {
                                                _id: mongoose.Types.ObjectId(
                                                  req.body.po_id
                                                ),
                                                deleted: false,
                                              },
                                              { status: "FILLED" },
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
                                        }

                                        await notifications.create({
                                          notification_sent_to:
                                            select_receiver_avaliable._receiver_awareid,
                                          message: `A DPP report by ${senderKycDetails?.company_name} is live now.`,
                                        });
                                        await notifications.create({
                                          notification_sent_to:
                                            select_receiver_avaliable._receiver_awareid,
                                          message:
                                            length == 1
                                              ? `${length} DPPs is live now`
                                              : `${length} DPPs are live now`,
                                        });
                                      }
                                    }

                                    var payload = {
                                      username: req.headers.username,
                                    };
                                    refresh(
                                      req.headers.authorization,
                                      req.headers.userid,
                                      payload,
                                      async function (resp) {
                                        if (resp.status == true) {
                                         

                                          await Promise.allSettled(
                                            array_of_amounts.map(
                                              async (dataset) => {
                                                await notifications.create({
                                                  notification_sent_to:
                                                    select_receiver_avaliable._receiver_awareid,
                                                  message: `${senderKycDetails?.company_name} sent ${dataset} tokens to you`,
                                                });
                                              }
                                            )
                                          );

                                          return res.status(200).jsonp({
                                            status: true,
                                            message:
                                              "Tokens have been transferred successfully",
                                            authorization: resp.token,
                                          });
                                        } else {
                                          return res.status(resp.code).jsonp({
                                            status: false,
                                            message: null,
                                            authorization: null,
                                          });
                                        }
                                      }
                                    );
                                  } else {
                                    return res.status(500).jsonp({
                                      status: false,
                                      message: "Internal error!",
                                    });

                                  }
                                }
                              );

                            });
                        }
                      );
                    } else {
                      return res
                        .status(500)
                        .jsonp({ status: false, message: "Internal error!" });
                    }
                  });
              }
            );
          } else {
            const gasPrice = await connectWeb3.eth.getGasPrice();

            const txConfig = {
              from: from0xaddress,
              to: contractAddress,
              gasPrice: gasPrice,
              gas: gasAmount.toString(),
              data: contract.methods
                .safeBatchTransferFrom(
                  from0xaddress.toLowerCase(),
                  useraddress.toLowerCase(),
                  token_ids,
                  array_of_amounts,
                  []
                )
                .encodeABI(),
            };

            console.log("bangtxConfig", txConfig);

            connectWeb3.eth.accounts.signTransaction(
              txConfig,
              "0x" + privatekey,
              async function (err, signedTx) {
                if (err) {
                  loggerhandler.logger.error(
                    `${err} ,email:${req.headers.email}`
                  );
                  console.log("signTransactionerr", err);
                  return res
                    .status(500)
                    .jsonp({ status: false, message: "Internal error!" });
                }

                console.log("signedTx", signedTx);
                connectWeb3.eth
                  .sendSignedTransaction(signedTx.rawTransaction)
                  .on("receipt", async function (receipt) {
                    console.log("Tx Hash (Receipt): ", receipt);

                    var result_promise = await Promise.allSettled(
                      selected_aware_token_avaliable.selected_tokens.map(
                        async (dataset) => {
                          await callstack.sendTokenAndUpdateBalanceInBatch(
                            dataset,
                            select_receiver_avaliable,
                            selected_aware_token_avaliable,
                            receipt,
                            req
                          );
                        }
                      )
                    );

                    var promise_failed = result_promise.find(
                      (x) => x.status == "rejected"
                    );
                    if (promise_failed) {
                      return res.status(400).jsonp({
                        status: false,
                        message: "Transaction has been reverted!",
                        authorization: null,
                      });
                    }

                    var send_aw_tokens_avaliable = await send_aw_tokens
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
                    for (const item of send_aw_tokens_avaliable) {
                      if (!map.has(mongoose.Types.ObjectId(item._id))) {
                        map.set(mongoose.Types.ObjectId(item._id), true); // set any value to Map
                        output.push(mongoose.Types.ObjectId(item._id));
                      }
                    }

                    await send_aw_tokens
                      .findOneAndUpdate(
                        {
                          _awareid: req.body._awareid,
                          _id: mongoose.Types.ObjectId(
                            req.body.send_aware_token_id
                          ),
                        },
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

                    await send_aw_tokens
                      .deleteMany({ _id: { $in: output } })
                      .catch((ex) => {
                        return res
                          .status(400)
                          .jsonp({ status: false, message: "Bad request!" });
                      });
                    if (req.body.po_id) {
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
                      var product_lines_avaliable = await product_lines
                        .findOne({ po_id: req.body.po_id, deleted: false })
                        .catch((ex) => {
                          return res
                            .status(400)
                            .jsonp({ status: false, message: "Bad request!" });
                        });
                      if (product_lines_avaliable) {
                        let length = 0;
                        var product_line = product_lines_avaliable.product_line;
                        product_line.forEach((ele) => {
                          let approved_line = ele.update_status == "APPROVED";
                          if (approved_line) {
                            length += 1;
                            ele.update_status = "FILLED";
                          }
                        });
                        await product_lines
                          .findOneAndUpdate(
                            { po_id: req.body.po_id },
                            { product_line: product_line, deleted: false },
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
                        let validate = product_line.every(
                          (e) => e.update_status == "FILLED"
                        );
                        if (validate) {
                          await purchase_orders
                            .findOneAndUpdate(
                              {
                                _id: mongoose.Types.ObjectId(req.body.po_id),
                                deleted: false,
                              },
                              { status: "FILLED" },
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
                        }

                        await notifications.create({
                          notification_sent_to:
                            select_receiver_avaliable._receiver_awareid,
                          message: `A DPP report by ${senderKycDetails?.company_name} is live now.`,
                        });

                        await notifications.create({
                          notification_sent_to:
                            select_receiver_avaliable._receiver_awareid,
                          message:
                            length == 1
                              ? `${length} DPPs is live now`
                              : `${length} DPPs are live now`,
                        });
                      }
                    }

                    var payload = { username: req.headers.username };
                    refresh(
                      req.headers.authorization,
                      req.headers.userid,
                      payload,
                      async function (resp) {
                        if (resp.status == true) {
                          SendGrid.sendCryptoTcMail(object, async (result) => {
                            if (result != null) {
                              
                              await Promise.allSettled(
                                array_of_amounts.map(async (dataset) => {
                                  await notifications.create({
                                    notification_sent_to:
                                      select_receiver_avaliable._receiver_awareid,
                                    message: `${senderKycDetails?.company_name} sent ${dataset} tokens to you`,
                                  });
                                })
                              );
                              return res.status(200).jsonp({
                                status: true,
                                message:
                                  "Tokens have been transferred successfully",
                                authorization: resp.token,
                              });
                            } else {
                              return res.status(500).jsonp({
                                status: false,
                                message: null,
                                authorization: null,
                              });
                            }
                          });

                        } else {
                          return res.status(resp.code).jsonp({
                            status: false,
                            message: null,
                            authorization: null,
                          });
                        }
                      }
                    );
                  })
                  .on("error", async function (e) {
                    console.log("e", e);

                    checkTransactionReceipt(
                      connectWeb3,
                      signedTx.transactionHash,
                      async function (result) {
                        // Handle the result as needed
                        console.log("Transaction result:", result);

                        if (result == true) {
                          // callback(true);

                          var result_promise = await Promise.allSettled(
                            selected_aware_token_avaliable.selected_tokens.map(
                              async (dataset) => {
                                await callstack.sendTokenAndUpdateBalanceInBatch(
                                  dataset,
                                  select_receiver_avaliable,
                                  selected_aware_token_avaliable,
                                  receipt,
                                  req
                                );
                              }
                            )
                          );

                          var promise_failed = result_promise.find(
                            (x) => x.status == "rejected"
                          );
                          if (promise_failed) {
                            return res.status(400).jsonp({
                              status: false,
                              message: "Transaction has been reverted!",
                              authorization: null,
                            });
                          }

                          var send_aw_tokens_avaliable = await send_aw_tokens
                            .find({
                              _awareid: req.body._awareid,
                              status: "CONCEPT",
                              create_token_stepper: 1,
                            })
                            .catch((ex) => {
                              loggerhandler.logger.error(
                                `${ex} ,email:${req.headers.email}`
                              );
                              return res.status(400).jsonp({
                                status: false,
                                message: "Bad request!",
                              });
                            });

                          const output = [];
                          const map = new Map();
                          for (const item of send_aw_tokens_avaliable) {
                            if (!map.has(mongoose.Types.ObjectId(item._id))) {
                              map.set(mongoose.Types.ObjectId(item._id), true); // set any value to Map
                              output.push(mongoose.Types.ObjectId(item._id));
                            }
                          }

                          await send_aw_tokens
                            .findOneAndUpdate(
                              {
                                _awareid: req.body._awareid,
                                _id: mongoose.Types.ObjectId(
                                  req.body.send_aware_token_id
                                ),
                              },
                              { status: "SEND" },
                              { new: true }
                            )
                            .catch((ex) => {
                              loggerhandler.logger.error(
                                `${ex} ,email:${req.headers.email}`
                              );
                              return res.status(400).jsonp({
                                status: false,
                                message: "Bad request!",
                              });
                            });

                          await send_aw_tokens
                            .deleteMany({ _id: { $in: output } })
                            .catch((ex) => {
                              return res.status(400).jsonp({
                                status: false,
                                message: "Bad request!",
                              });
                            });
                          if (req.body.po_id) {
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
                                return res.status(400).jsonp({
                                  status: false,
                                  message: "Bad request!",
                                });
                              });
                            var product_lines_avaliable = await product_lines
                              .findOne({
                                po_id: req.body.po_id,
                                deleted: false,
                              })
                              .catch((ex) => {
                                return res.status(400).jsonp({
                                  status: false,
                                  message: "Bad request!",
                                });
                              });
                            if (product_lines_avaliable) {
                              let length = 0;
                              var product_line =
                                product_lines_avaliable.product_line;
                              product_line.forEach((ele) => {
                                let approved_line =
                                  ele.update_status == "APPROVED";
                                if (approved_line) {
                                  length += 1;
                                  ele.update_status = "FILLED";
                                }
                              });
                              await product_lines
                                .findOneAndUpdate(
                                  { po_id: req.body.po_id },
                                  {
                                    product_line: product_line,
                                    deleted: false,
                                  },
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
                              let validate = product_line.every(
                                (e) => e.update_status == "FILLED"
                              );
                              if (validate) {
                                await purchase_orders
                                  .findOneAndUpdate(
                                    {
                                      _id: mongoose.Types.ObjectId(
                                        req.body.po_id
                                      ),
                                      deleted: false,
                                    },
                                    { status: "FILLED" },
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
                              }

                              await notifications.create({
                                notification_sent_to:
                                  select_receiver_avaliable._receiver_awareid,
                                message: `A DPP report by ${senderKycDetails?.company_name} is live now.`,
                              });
                              await notifications.create({
                                notification_sent_to:
                                  select_receiver_avaliable._receiver_awareid,
                                message:
                                  length == 1
                                    ? `${length} DPPs is live now`
                                    : `${length} DPPs are live now`,
                              });
                            }
                          }

                          var payload = { username: req.headers.username };
                          refresh(
                            req.headers.authorization,
                            req.headers.userid,
                            payload,
                            async function (resp) {
                              if (resp.status == true) {
                               

                                await Promise.allSettled(
                                  array_of_amounts.map(async (dataset) => {
                                    await notifications.create({
                                      notification_sent_to:
                                        select_receiver_avaliable._receiver_awareid,
                                      message: `${senderKycDetails?.company_name} sent ${dataset} tokens to you`,
                                    });
                                  })
                                );
                                return res.status(200).jsonp({
                                  status: true,
                                  message:
                                    "Tokens have been transferred successfully",
                                  authorization: resp.token,
                                });
                              } else {
                                return res.status(resp.code).jsonp({
                                  status: false,
                                  message: null,
                                  authorization: null,
                                });
                              }
                            }
                          );
                        } else {
                          // callback(false);
                          return res.status(500).jsonp({
                            status: false,
                            message: "Internal error!",
                          });
                        }
                      }
                    );
                  });
              }
            );
          }
        });
      

     
    }
  },

  getRecapAsync: async (req, res) => {
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

            var select_receiver_avaliable = await select_receiver
              .findOne({
                _awareid: req.headers.awareid,
                send_aware_token_id: req.headers.send_aware_token_id,
              })
              .catch((ex) => {
                loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
                return res
                  .status(400)
                  .jsonp({ status: false, message: "Bad request!" });
              });

            var selected_aware_token_avaliable = await selected_aware_token
              .findOne({
                _awareid: req.headers.awareid,
                send_aware_token_id: req.headers.send_aware_token_id,
              })
              .catch((ex) => {
                loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
                return res
                  .status(400)
                  .jsonp({ status: false, message: "Bad request!" });
              });

            var selected_transaction_certificates_avaliable =
              await selected_transaction_certificates
                .findOne({
                  _awareid: req.headers.awareid,
                  send_aware_token_id: req.headers.send_aware_token_id,
                })
                .catch((ex) => {
                  loggerhandler.logger.error(
                    `${ex} ,email:${req.headers.email}`
                  );
                  return res
                    .status(400)
                    .jsonp({ status: false, message: "Bad request!" });
                });

            var selected_proof_of_delivery_avaliable =
              await selected_proof_of_delivery
                .findOne({
                  _awareid: req.headers.awareid,
                  send_aware_token_id: req.headers.send_aware_token_id,
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
              !select_receiver_avaliable ||
              !selected_aware_token_avaliable ||
              !selected_proof_of_delivery_avaliable
            ) {
              return res
                .status(200)
                .jsonp({ status: true, data: null, authorization: resp.token });
            } else {
              return res.status(200).jsonp({
                status: true,
                data: {
                  select_receiver_avaliable: select_receiver_avaliable,
                  selected_aware_token_avaliable:
                    selected_aware_token_avaliable,
                  selected_transaction_certificates_avaliable:
                    selected_transaction_certificates_avaliable,
                  selected_proof_of_delivery_avaliable:
                    selected_proof_of_delivery_avaliable,
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

  deleteSendAwareTokenAsync: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(422)
        .jsonp({ status: false, message: "Bad payload received." });
    } else {
      await send_aw_tokens
        .deleteOne({
          _awareid: req.body._awareid,
          _id: mongoose.Types.ObjectId(req.body.send_aware_token_id),
        })
        .catch((ex) => {
          loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
          return res
            .status(500)
            .jsonp({ status: false, message: ex.toString() });
        });

      await select_receiver
        .deleteOne({
          _awareid: req.body._awareid,
          send_aware_token_id: req.body.send_aware_token_id,
        })
        .catch((ex) => {
          loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
          return res
            .status(500)
            .jsonp({ status: false, message: ex.toString() });
        });

      var selected_aware_tokens = await selected_aware_token
        .findOne({
          _awareid: req.body._awareid,
          send_aware_token_id: req.body.send_aware_token_id,
        })
        .catch((ex) => {
          loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
          return res
            .status(500)
            .jsonp({ status: false, message: ex.toString() });
        });

      const output = [];
      const map = new Map();
      if (selected_aware_tokens) {
        for (const item of selected_aware_tokens.selected_tokens) {
          if (!map.has(mongoose.Types.ObjectId(item.aware_token_id))) {
            map.set(mongoose.Types.ObjectId(item.aware_token_id), true); // set any value to Map
            output.push(mongoose.Types.ObjectId(item.aware_token_id));
          }
        }
      }

      const output2 = [];
      const map2 = new Map();
      if (selected_aware_tokens) {
        for (const item of selected_aware_tokens.selected_tokens) {
          if (!map2.has(mongoose.Types.ObjectId(item.update_aware_token_id))) {
            map2.set(mongoose.Types.ObjectId(item.update_aware_token_id), true); // set any value to Map
            output2.push(mongoose.Types.ObjectId(item.update_aware_token_id));
          }
        }
      }

      await aw_tokens
        .updateMany({ _id: { $in: output } }, { locked: false }, { new: true })
        .catch((ex) => {
          loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
          return res
            .status(500)
            .jsonp({ status: false, message: ex.toString() });
        });

      await update_aw_tokens
        .updateMany({ _id: { $in: output2 } }, { locked: false }, { new: true })
        .catch((ex) => {
          loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
          return res
            .status(500)
            .jsonp({ status: false, message: ex.toString() });
        });

      if (req.body.po_id) {
        await purchase_orders
          .findOneAndUpdate(
            { _id: mongoose.Types.ObjectId(req.body.po_id), deleted: false },
            { locked: false }
          )
          .catch((ex) => {
            loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
            return res
              .status(400)
              .jsonp({ status: false, message: "Bad request!" });
          });
      }
      await selected_aware_token
        .deleteOne({
          _awareid: req.body._awareid,
          send_aware_token_id: req.body.send_aware_token_id,
        })
        .catch((ex) => {
          loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
          return res
            .status(500)
            .jsonp({ status: false, message: ex.toString() });
        });

      await selected_transaction_certificates
        .deleteOne({
          _awareid: req.body._awareid,
          send_aware_token_id: req.body.send_aware_token_id,
        })
        .catch((ex) => {
          loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
          return res
            .status(500)
            .jsonp({ status: false, message: ex.toString() });
        });

      await selected_proof_of_delivery
        .deleteOne({
          _awareid: req.body._awareid,
          send_aware_token_id: req.body.send_aware_token_id,
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
              message: "Send token request has been deleted successfully",
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

  deleteResetSendAwareTokenAsync: async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res
        .status(422)
        .jsonp({ status: false, message: "Bad payload received." });
    } else {
      if (req.body.type == "selected_aware_token") {
        await selected_aware_token
          .deleteOne({
            _awareid: req.body._awareid,
            send_aware_token_id: req.body.send_aware_token_id,
          })
          .catch((ex) => {
            loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
            return res
              .status(500)
              .jsonp({ status: false, message: ex.toString() });
          });

        // var kyc_Details = await kyc_details.findOne({ _awareid: req.body._awareid }).catch((ex) => { return res.status(500).jsonp({ status: false, message: ex.toString() }) })

        // await account_details.findOneAndUpdate({ kyc_id: kyc_Details._id.toString() }, { create_token_stepper: 1 }, { new: true }).catch((ex) => { return res.status(500).jsonp({ status: false, message: ex.toString() }) })

        await send_aw_tokens
          .findOneAndUpdate(
            {
              _awareid: req.body._awareid,
              _id: mongoose.Types.ObjectId(req.body.send_aware_token_id),
            },
            { create_token_stepper: 1 },
            { new: true }
          )
          .catch((ex) => {
            loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
            return res
              .status(500)
              .jsonp({ status: false, message: ex.toString() });
          });
      } else if (req.body.type == "selected_transaction_certificates") {
        await selected_transaction_certificates
          .deleteOne({
            _awareid: req.body._awareid,
            send_aware_token_id: req.body.send_aware_token_id,
          })
          .catch((ex) => {
            loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
            return res
              .status(500)
              .jsonp({ status: false, message: ex.toString() });
          });

       
        await send_aw_tokens
          .findOneAndUpdate(
            {
              _awareid: req.body._awareid,
              _id: mongoose.Types.ObjectId(req.body.send_aware_token_id),
            },
            { create_token_stepper: 2 },
            { new: true }
          )
          .catch((ex) => {
            loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
            return res
              .status(500)
              .jsonp({ status: false, message: ex.toString() });
          });
      } else if (req.body.type == "selected_proof_of_delivery") {
        await selected_proof_of_delivery
          .deleteOne({
            _awareid: req.body._awareid,
            send_aware_token_id: req.body.send_aware_token_id,
          })
          .catch((ex) => {
            loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
            return res
              .status(500)
              .jsonp({ status: false, message: ex.toString() });
          });

        await send_aw_tokens
          .findOneAndUpdate(
            {
              _awareid: req.body._awareid,
              _id: mongoose.Types.ObjectId(req.body.send_aware_token_id),
            },
            { create_token_stepper: 3 },
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

  //product producer send token

  getPurchaseOrdersAsync: async (req, res) => {
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
            var products_data = await products
              .find({
                _awareid: req.headers._awareid,
                locked: false,
                status: "SEND",
              })
              .catch((ex) => {
                loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
                return res
                  .status(500)
                  .jsonp({ status: false, message: ex.toString() });
              });

            return res.status(200).jsonp({
              status: true,
              data: products_data,
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

  // crypto tc API

  getCryptoTcDetailsRequestAsync: async (req, res) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(422).jsonp(errors.array());
      }
      const { send_aware_token_id, token_id } = req.headers;

      if (!send_aware_token_id || !token_id) {
        return res
          .status(400)
          .jsonp({ status: false, message: "Bad request!" });
      }

      const cryptoDetail = {};
      const DataJson = {};
      const object = {};

      DataJson.reference_number = Math.floor(
        10000000 + Math.random() * 90000000
      );

      const selectReceiver = await select_receiver.findOne({
        send_aware_token_id,
      });
      const selectedAwareToken = await selected_aware_token.findOne({
        send_aware_token_id,
      });
      const selectedTransactionCertificates =
        await selected_transaction_certificates.findOne({
          send_aware_token_id,
        });
      const selectedProofOfDelivery = await selected_proof_of_delivery.findOne({
        send_aware_token_id,
      });

      cryptoDetail.select_receiver_avaliable = selectReceiver;
      cryptoDetail.selected_aware_token_avaliable = selectedAwareToken;
      cryptoDetail.selected_transaction_certificates_avaliable =
        selectedTransactionCertificates;
      cryptoDetail.selected_proof_of_delivery_avaliable =
        selectedProofOfDelivery;
      DataJson.selected_proof_of_delivery_avaliable = selectedProofOfDelivery;
      if (cryptoDetail.select_receiver_avaliable) {
        const receiverKycDetails = await kyc_details.findOne({
          aware_id: cryptoDetail.select_receiver_avaliable._receiver_awareid,
        });
        const senderKycDetails = await kyc_details.findOne({
          aware_id: cryptoDetail.select_receiver_avaliable._awareid,
        });
      
        cryptoDetail.sender_kyc_details = senderKycDetails;
        cryptoDetail.receiver_kyc_details = receiverKycDetails;
        object.senderKycDetails = senderKycDetails;
        object.receiverKycDetails = receiverKycDetails;
        
        object.send_aware_token_id = send_aware_token_id;

        DataJson.sender_address = senderKycDetails?.address_lane_one;
        DataJson.sender_country = senderKycDetails?.country;
        DataJson.receiver_address = receiverKycDetails?.address_lane_one;
        DataJson.receiver_country = receiverKycDetails?.country;
      }

      if (cryptoDetail.selected_aware_token_avaliable) {
        const tokenType =
          cryptoDetail.selected_aware_token_avaliable.selected_tokens.find(
            (ele) =>
              ele.update_aware_token_id == token_id ||
              ele.aware_token_id == token_id
          );

        (object.token_list = selectedAwareToken.selected_tokens),
          (cryptoDetail.token_detail = tokenType.toObject());

        DataJson.total_token = tokenType.toObject()?.To_be_Send;
        object.token_type = selectedAwareToken.aware_token_type;
        const keyOfSearchValue = tokenType
          ? Object.keys(cryptoDetail.token_detail).find(
              (key) => tokenType[key] === token_id
            )
          : null;
        // console.log('hhh',{ keyOfSearchValue })

        if (keyOfSearchValue === "aware_token_id") {
          const awTokensAvaliable = await aw_tokens.findOne({
            _id: mongoose.Types.ObjectId(token_id),
          });
          const physicalAssetsAvaliable = await physical_assets.findOne({
            aware_token_id: token_id,
          });
          const tracerAvaliable = await tracer.findOne({
            aware_token_id: token_id,
          });

          cryptoDetail.aw_tokens_avaliable = awTokensAvaliable;
          cryptoDetail.physical_assets_avaliable = physicalAssetsAvaliable;
          cryptoDetail.tracerAvaliable = tracerAvaliable;

          DataJson.production_facility =
            physicalAssetsAvaliable?.production_facility;
          DataJson.tracer_type = tracerAvaliable?.type_selection;
          DataJson.scan_date =
            tracerAvaliable?.aware_date || tracerAvaliable?.custom_date;
          DataJson.token_type = physicalAssetsAvaliable?.aware_token_type;
          DataJson.color = physicalAssetsAvaliable?.main_color;
          DataJson.type = "new";
          DataJson.Aware_material_list = [];

          let weight = Number(DataJson.total_token);

          if (physicalAssetsAvaliable?.compositionArrayMain?.length > 0) {
            DataJson.material_list =
              physicalAssetsAvaliable?.compositionArrayMain?.map((ele) => {
                let particular_weight = (ele.percentage * weight) / 100;
                return { ...ele.toObject(), particular_weight };
              });
          } else {
            DataJson.material_list = [];
          }
        } else {
          const updateAwTokensAvaliable = await update_aw_tokens.findOne({
            _id: mongoose.Types.ObjectId(token_id),
          });
          const updatePhysicalAssetAvaliable =
            await update_physical_asset.findOne({
              update_aware_token_id: token_id,
            });
          const tracerAvaliable = await update_tracer.findOne({
            update_aware_token_id: token_id,
          });
          const updateSelectedUpdateAwareTokens =
            await selected_update_aware_token.findOne({
              update_aware_token_id: token_id,
            });

          cryptoDetail.update_aw_tokens_avaliable = updateAwTokensAvaliable;
          cryptoDetail.update_physical_asset_avaliable =
            updatePhysicalAssetAvaliable;
          cryptoDetail.tracerAvaliable = tracerAvaliable;
          cryptoDetail.update_selected_update_aware_tokens =
            updateSelectedUpdateAwareTokens;

          DataJson.production_facility =
            updateSelectedUpdateAwareTokens?.production_facility;
          DataJson.tracer_type = tracerAvaliable?.type_selection;
          DataJson.scan_date =
            tracerAvaliable?.aware_date || tracerAvaliable?.custom_date || "";
          DataJson.token_type =
            updateSelectedUpdateAwareTokens?.aware_output_token_type;
          DataJson.color = updatePhysicalAssetAvaliable?.main_color;
          DataJson.type = "update";
          DataJson.Aware_material_list =
            updatePhysicalAssetAvaliable?.assetdataArrayMain?.length > 0
              ? updatePhysicalAssetAvaliable?.assetdataArrayMain
              : [];

          let weight = Number(DataJson.total_token);

          if (updatePhysicalAssetAvaliable?.compositionArrayMain?.length > 0) {
            DataJson.material_list =
              updatePhysicalAssetAvaliable?.compositionArrayMain?.map((ele) => {
                let percentage =
                  (Number(ele.total_kgs) * 100) /
                  Number(updatePhysicalAssetAvaliable?.weight);
                let particular_weight = (percentage * weight) / 100;

                return {
                  ...ele.toObject(),
                  percentage: percentage?.toFixed(2),
                  particular_weight,
                };
              });
          } else {
            DataJson.material_list = [];
          }
        }

        const transferredTokensDetail = await transferred_tokens.findOne({
          $or: [
            { historical_aware_token_id: token_id },
            { historical_update_aware_token_id: token_id },
          ],
          historical_send_aw_tokens_id: send_aware_token_id,
        });

        const transactionHistoryDetail = await transaction_history.findOne({
          _id: transferredTokensDetail.blochchain_transaction_history_id,
        });

        cryptoDetail.transferred_tokens_detail = transferredTokensDetail;
        cryptoDetail.transaction_history_detail = transactionHistoryDetail;

        DataJson.transactionHash = transactionHistoryDetail?.transactionHash;
        DataJson.transaction_history_detail = transactionHistoryDetail;
      }
      var jsondata = `${process.env.DOMAIN}/cryptotc/${send_aware_token_id}-${token_id}`;
      // var jsondata = `${process.env.PRODUCT_DOMAIN}/product-passport/aw_qrnwrt/${_awareid}-${po_id}-${products_line_details.id}`;

      const canvas = createCanvas(150, 150);
      QRCode.toCanvas(canvas, jsondata.toLowerCase(), {
        errorCorrectionLevel: "H",
        version: 10,
        margin: 1,
        quality: 1,
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
      });
      let imageURL = canvas.toDataURL("image/jpeg", 1);
      var url = chandedpi.changeDpiDataUrl(imageURL, 300);

      console.log("hhiiii");

      return res
        .status(200)
        .jsonp({ status: true, data: { cryptoDetail, DataJson, url } });

     
    } catch (error) {
      loggerhandler.logger.error(`${error}, email:${req.headers.email}`);
      return res
        .status(500)
        .jsonp({ status: false, message: "Internal Server Error" });
    }
  },

  getMaterialCertificatesAsync: async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).jsonp(errors.array());
    } else {
      if (
        !req.headers.userid ||
        !req.headers.username ||
        !req.headers.authorization
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
           

            const materialCertificates = await material_certificates
              .find({})
              .catch((ex) => {
                console.log("ex", ex);
                loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
              });

            const materialCertificateTypes = await material_certificate_types
              .find({})
              .catch((ex) => {
                console.log("ex", ex);
                loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
              });

            if (materialCertificates && materialCertificateTypes) {
              // Map the type name to each certificate
              const available_material_certificates = materialCertificates.map(
                (cert) => {
                  const typeObj = materialCertificateTypes.find((type) =>
                    type._id.equals(cert.type)
                  );
                  return {
                    ...cert._doc, // Spread the document properties
                    typeName: typeObj ? typeObj.type : null, // Add the type name or null if not found
                  };
                }
              );

              // Share the array in the response
              return res.status(200).json({
                status: true,
                data: {
                  available_material_certificates,
                  materialCertificateTypes,
                },
              });
            } else {
              // Handle the case where fetching certificates or types fails
              return res.status(400).json({
                status: false,
                message: "Failed to fetch material certificates or types",
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
};



const transferAsync = async (to0xaddress, gastobetransfred, callback) => {
  try {
    connectWeb3 = await new Web3(
      new Web3.providers.HttpProvider(process.env.BABEL_ENDPOINT)
    );

    await connectWeb3.eth.net.isListening();
  } catch {
    connectWeb3 = await new Web3(
      new Web3.providers.HttpProvider(process.env.ALTERNATE_BABEL_ENDPOINT)
    );

    await connectWeb3.eth.net.isListening();
  }

  connectWeb3.eth
    .getBalance(process.env.ADMIN_WALLET_ADDRESS)
    .then(async function (balance) {
      let iotxBalance = Big(balance).div(10 ** 18);

      console.log("Funds has been transfrred");

      if (iotxBalance.toFixed(18) > 0) {
        const gasPrice = await connectWeb3.eth.getGasPrice();
        var gasAmount = "40000";
        var amountInUint = connectWeb3.utils.toWei("1");

        const txConfig = {
          from: process.env.ADMIN_WALLET_ADDRESS,
          to: to0xaddress,
          gasPrice: gasPrice,
          gas: gasAmount.toString(),
          value: amountInUint,
        };

        console.log("txConfig", txConfig);
        const privatekey = process.env.ADMIN_PRIVATE_KEY;

        connectWeb3.eth.accounts.signTransaction(
          txConfig,
          privatekey,
          async function (err, signedTx) {
            if (err) {
              loggerhandler.logger.error(`${err} ,email:${req.headers.email}`);
              callback(false);
            }

            console.log("signedTx", signedTx);
            connectWeb3.eth
              .sendSignedTransaction(signedTx.rawTransaction)
              .on("receipt", async function (receipt) {
                console.log("receipt", receipt);

                callback(true);
              })
              .on("error", async function (e) {
                console.log("ex", e);
                loggerhandler.logger.error(`${e} ,email:${req.headers.email}`);
                callback(false);
              });
          }
        );
      } else {
        callback(false);
      }
    });
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const maxTries = 5;
async function checkTransactionReceipt(
  connectWeb3,
  transactionHash,
  callback,
  tryCount = 1
) {
  console.log(`Attempt ${tryCount}`);
  connectWeb3.eth.getTransactionReceipt(
    transactionHash,
    async function (err, receipt_response) {
      if (err) {
        if (tryCount < maxTries) {
          // call the function again
          await sleep(20000); // Add a delay before the next attempt (adjust as needed)
          await checkTransactionReceipt(
            connectWeb3,
            transactionHash,
            callback,
            tryCount + 1
          );
        } else {
          // Max tries reached, handle accordingly
          console.log("Max tries reached, unable to get transaction receipt.");
          callback(false);
        }
      } else {
        console.log("receipt_response", receipt_response);
        if (receipt_response) {
          if (receipt_response.status) {
            callback(true);
          } else {
            callback(false);
          }
        } else {
          if (tryCount < maxTries) {
            // call the function again
            await sleep(20000); // Add a delay before the next attempt (adjust as needed)
            await checkTransactionReceipt(
              connectWeb3,
              transactionHash,
              callback,
              tryCount + 1
            );
          } else {
            // Max tries reached, handle accordingly
            console.log(
              "Max tries reached, unable to get transaction receipt."
            );
            callback(false);
          }
        }
      }
    }
  );
}
