var mongoose = require("mongoose");
const { body, validationResult, check } = require("express-validator");
var kyc_details = require("../models/kyc_details");
var account_details = require("../models/account_details");
const { request, gql } = require("graphql-request");
const { refresh } = require("../refresh-token");
const physical_assets = require("../models/physical_asset");
const company_compliances = require("../models/company_compliances");
const source_address = require("../models/source_address");
const self_validation = require("../models/self_validation");
const tracer = require("../models/tracer");
const aw_tokens = require("../models/aw_tokens");
const wallets = require("../models/wallets");
const notifications = require("../models/notifications");
const transferred_tokens = require("../models/transferred-tokens");
// const transferred_tokens = require('../models/account_details');
const transaction_history = require("../models/transaction_history");
const purchase_order_details = require("../models/purchase_order_details");
const products = require("../models/products");
const purchase_orders = require("../models/purchase_orders");
const product_lines = require("../models/product_lines");
const update_physical_asset = require("../models/update_physical_asset");
const update_self_validation = require("../models/update_self_validation");
const update_company_compliances = require("../models/update_company_compliancess");
const update_aw_tokens = require("../models/update_aw_tokens");
const selected_update_aware_token = require("../models/selected_update_aware_token");
const update_tracer = require("../models/update_tracer");
const exempted_email = require("../models/exempted_email");

const user_role = require("../models/user_role");
const loggerhandler = require("../logger/log");
const { default: axios } = require("axios");
const send_aw_tokens = require("../models/send_aw_tokens");
const selected_receiver = require("../models/selected_receiver");
const selected_aware_token = require("../models/selected_aware_token");
const selected_transaction_certificates = require("../models/selected_transaction_certificates");
const selected_proof_of_delivery = require("../models/selected_proof_of_delivery");
exports.handlers = {
  createAwareTokenAsync: async (req, res) => {
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
            aw_tokens.create(
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

  createPhysicalAssestAsync: async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res
        .status(422)
        .jsonp({ status: false, message: "Bad payload received." });
    } else {
      const asset_alread_exist = await physical_assets
        .findOne({
          _awareid: req.body._awareid_t,
          aware_token_id: req.body.aware_token_id,
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
            var compositionstring = "";

            var arr = req.body.compositionArrayMain;

            arr.forEach(function (i, idx, array) {
              var element = array[idx];
              // console.log('element: ', element)
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

            var aware_asset_id = `${req.body._awareid_t} - ${req.body.aware_token_type_t} - ${req.body.material_specs_t} - ${compositionstring} - ${req.body.main_color_t} - ${req.body.production_lot_t}`;
            // console.log('aware_asset_id', aware_asset_id)
            if (asset_alread_exist) {
              physical_assets.findOneAndUpdate(
                {
                  _awareid: req.body._awareid_t,
                  aware_token_id: req.body.aware_token_id,
                },
                {
                  _awareid: req.body._awareid_t,
                  aware_token_id: req.body.aware_token_id,
                  aware_asset_id: aware_asset_id,
                  date: new Date(req.body.date_t),
                  production_facility: req.body.production_facility_t,
                  value_chain_process_main: req.body.value_chain_process_main,
                  value_chain_process_sub: req.body.value_chain_process_sub,
                  aware_token_type: req.body.aware_token_type_t,
                  material_specs: req.body.material_specs_t,
                  main_color: req.body.main_color_t,
                  select_main_color: req.body.select_main_color_t,
                  production_lot: req.body.production_lot_t,
                  compositionArrayMain: req.body.compositionArrayMain,
                  weight: req.body.weight_t,
                  sustainable_process_claim:
                    req.body.sustainable_process_claim_t,
                  wet_processing: req.body.wet_processing_t,
                  wet_processing_arr: req.body.wet_processing,
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

                  // var kyc_Details = await kyc_details.findOne({ _awareid: req.body._awareid_t }).catch((ex) => { return res.status(500).jsonp({ status: false, message: ex.toString() }) })

                  await aw_tokens
                    .findOneAndUpdate(
                      {
                        _awareid: req.body._awareid_t,
                        _id: mongoose.Types.ObjectId(req.body.aware_token_id),
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
                      "Information entered on Physical Asset page has been updated successfully",
                    authorization: resp.token,
                  });
                }
              );
            } else {
              physical_assets.create(
                {
                  _awareid: req.body._awareid_t,
                  aware_token_id: req.body.aware_token_id,
                  aware_asset_id: aware_asset_id,
                  date: new Date(req.body.date_t),
                  production_facility: req.body.production_facility_t,
                  value_chain_process_main: req.body.value_chain_process_main,
                  value_chain_process_sub: req.body.value_chain_process_sub,
                  aware_token_type: req.body.aware_token_type_t,
                  material_specs: req.body.material_specs_t,
                  main_color: req.body.main_color_t,
                  select_main_color: req.body.select_main_color_t,
                  production_lot: req.body.production_lot_t,
                  compositionArrayMain: req.body.compositionArrayMain,
                  weight: req.body.weight_t,
                  sustainable_process_claim:
                    req.body.sustainable_process_claim_t,
                  wet_processing: req.body.wet_processing_t,
                  wet_processing_arr: req.body.wet_processing,
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

                  // var kyc_Details = await kyc_details.findOne({ _awareid: req.body._awareid_t }).catch((ex) => { return res.status(500).jsonp({ status: false, message: ex.toString() }) })

                  // await account_details.findOneAndUpdate({ kyc_id: kyc_Details._id.toString() }, { create_token_stepper: 2 }, { new: true }).catch((ex) => { return res.status(500).jsonp({ status: false, message: ex.toString() }) })

                  await aw_tokens
                    .findOneAndUpdate(
                      {
                        _awareid: req.body._awareid_t,
                        _id: mongoose.Types.ObjectId(req.body.aware_token_id),
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
                      "Information entered on Physical Asset page has been updated successfully",
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

  getUsersKycDetailsAsync: async (req, res) => {
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

      account_details.findOne(
        { _id: mongoose.Types.ObjectId(req.headers.userid) },
        function (err, account) {
          if (err) {
            loggerhandler.logger.error(`${err} ,email:${req.headers.email}`);
            return res.status(500).jsonp({ status: false, message: err });
          }

          console.log("account", account);
          if (!account) {
            res.status(400).jsonp({ status: false, message: "Bad request!" });
          }

          kyc_details.findOne(
            { _id: mongoose.Types.ObjectId(account.kyc_id) },
            async function (err, details) {
              if (err) {
                loggerhandler.logger.error(
                  `${err} ,email:${req.headers.email}`
                );
                return res.status(500).jsonp({ status: false, message: err });
              }

              if (!details) {
                res
                  .status(400)
                  .jsonp({ status: false, message: "Bad request!" });
              }

              var jsonObject = {
                kyc_details: details,
              };

              console.log("list", jsonObject);

              var payload = { username: req.headers.username };
              refresh(
                req.headers.authorization,
                req.headers.userid,
                payload,
                function (resp) {
                  if (resp.status == true) {
                    return res.status(200).jsonp({
                      status: true,
                      data: jsonObject,
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
      );
    }
  },
  getManagersUserKycDetailsAsync: async (req, res) => {
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

      account_details.findOne(
        { _id: mongoose.Types.ObjectId(req.headers.userid) },
        function (err, account) {
          if (err) {
            loggerhandler.logger.error(`${err} ,email:${req.headers.email}`);
            return res.status(500).jsonp({ status: false, message: err });
          }

          if (!account) {
            res.status(400).jsonp({ status: false, message: "Bad request!" });
          }

          kyc_details.findOne(
            { manager_id: mongoose.Types.ObjectId(req.headers.userid) },
            async function (err, details) {
              if (err) {
                loggerhandler.logger.error(
                  `${err} ,email:${req.headers.email}`
                );
                return res.status(500).jsonp({ status: false, message: err });
              }

              if (!details) {
                res
                  .status(400)
                  .jsonp({ status: false, message: "Bad request!" });
              }

              var jsonObject = {
                kyc_details: details,
              };

              var payload = { username: req.headers.username };
              refresh(
                req.headers.authorization,
                req.headers.userid,
                payload,
                function (resp) {
                  if (resp.status == true) {
                    return res.status(200).jsonp({
                      status: true,
                      data: jsonObject,
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
      );
    }
  },

  getPhyscialAssetsAsync: async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).jsonp(errors.array());
    } else {
      if (
        !req.headers.userid ||
        !req.headers.username ||
        !req.headers.authorization ||
        !req.headers.awareid ||
        !req.headers.aware_token_id
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
            var assets_avaliable = await physical_assets
              .findOne({
                _awareid: req.headers.awareid,
                aware_token_id: req.headers.aware_token_id,
              })
              .catch((ex) => {
                loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
                return res
                  .status(400)
                  .jsonp({ status: false, message: "Bad request!" });
              });

            if (!assets_avaliable) {
              return res
                .status(200)
                .jsonp({ status: true, data: null, authorization: resp.token });
            } else {
              return res.status(200).jsonp({
                status: true,
                data: assets_avaliable,
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

  getAvailableAwareIDAsync: async (req, res) => {
    kyc_details.findOne(
      { aware_id: req.body.aware_id },
      async function (err, details) {
        if (err) {
          loggerhandler.logger.error(`${err} ,email:${req.headers.email}`);
          return res.status(500).jsonp({ status: false, message: err });
        }

        var payload = { username: req.headers.username };
        refresh(
          req.headers.authorization,
          req.headers.userid,
          payload,
          async function (resp) {
            if (resp.status == true) {
              if (details) {
                res.status(200).jsonp({
                  status: true,
                  message: "Aware™ ID already exists, Please try another.",
                  color: false,
                  authorization: resp.token,
                });
              } else {
                res.status(200).jsonp({
                  status: true,
                  message: "Aware™ ID avaliable.",
                  color: true,
                  authorization: resp.token,
                });
              }

              // var assets_avaliable = await physical_assets.findOne({ _awareid: req.headers.awareid, aware_token_id: req.headers.aware_token_id }).catch((ex) => { return res.status(400).jsonp({ status: false, message: "Bad request!" }); })

              // if (!assets_avaliable) {
              //   return res.status(200).jsonp({ status: true, data: null, authorization: resp.token });
              // }
              // else {
              //   return res.status(200).jsonp({ status: true, data: assets_avaliable, authorization: resp.token });

              // }
            } else {
              return res
                .status(resp.code)
                .jsonp({ status: false, data: null, authorization: null });
            }
          }
        );
      }
    );
  },

  createCompanyComplianceAsync: async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res
        .status(422)
        .jsonp({ status: false, message: "Bad payload received." });
    } else {
      // console.log("body", req.body);

      const company_compliances_exist = await company_compliances
        .findOne({
          _awareid: req.body._awareid,
          aware_token_id: req.body.aware_token_id,
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
            if (company_compliances_exist) {
              company_compliances.findOneAndUpdate(
                {
                  _awareid: req.body._awareid,
                  aware_token_id: req.body.aware_token_id,
                },
                {
                  _awareid: req.body._awareid,
                  aware_token_id: req.body.aware_token_id,
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

                  // var kyc_Details = await kyc_details.findOne({ _awareid: req.body._awareid }).catch((ex) => { return res.status(500).jsonp({ status: false, message: ex.toString() }) })

                  // await account_details.findOneAndUpdate({ kyc_id: kyc_Details._id.toString() }, { create_token_stepper: 5 }, { new: true }).catch((ex) => { return res.status(500).jsonp({ status: false, message: ex.toString() }) })

                  await aw_tokens
                    .findOneAndUpdate(
                      {
                        _awareid: req.body._awareid,
                        _id: mongoose.Types.ObjectId(req.body.aware_token_id),
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
                      "Information entered on Company Compliances page has been saved successfully",
                    authorization: resp.token,
                  });
                }
              );
            } else {
              company_compliances.create(
                {
                  _awareid: req.body._awareid,
                  aware_token_id: req.body.aware_token_id,
                  environmental_scope_certificates:
                    req.body.environmental_scope_certificates,
                  social_compliance_certificates:
                    req.body.social_compliance_certificates,
                  chemical_compliance_certificates:
                    req.body.chemical_compliance_certificates,
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

                  // var kyc_Details = await kyc_details.findOne({ _awareid: req.body._awareid }).catch((ex) => { return res.status(500).jsonp({ status: false, message: ex.toString() }) })

                  // await account_details.findOneAndUpdate({ kyc_id: kyc_Details._id.toString() }, { create_token_stepper: 5 }, { new: true }).catch((ex) => { return res.status(500).jsonp({ status: false, message: ex.toString() }) })

                  await aw_tokens
                    .findOneAndUpdate(
                      {
                        _awareid: req.body._awareid,
                        _id: mongoose.Types.ObjectId(req.body.aware_token_id),
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

  storeSourceAddressAsync: async (req, res) => {
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
            source_address.create(
              {
                _awareid: req.body._awareid,
                source_name: req.body.source_name,
                address_line_one: req.body.address_line_one,
                address_line_two:
                  req.body.address_line_two != ""
                    ? req.body.address_line_two
                    : null,
                country: req.body.country,
                state: req.body.state != "" ? req.body.state : null,
                city: req.body.city != "" ? req.body.city : null,
                zipcode: req.body.zipcode,
              },
              function (err, user) {
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
                  message: "Source has been successfully added.",
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

  getCompanyComplianceAsync: async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).jsonp(errors.array());
    } else {
      if (
        !req.headers.userid ||
        !req.headers.username ||
        !req.headers.authorization ||
        !req.headers.awareid ||
        !req.headers.aware_token_id
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
            var company_compliances_avaliable = await company_compliances
              .findOne({
                _awareid: req.headers.awareid,
                aware_token_id: req.headers.aware_token_id,
              })
              .catch((ex) => {
                loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
                return res
                  .status(400)
                  .jsonp({ status: false, message: "Bad request!" });
              });

            if (!company_compliances_avaliable) {
              return res
                .status(200)
                .jsonp({ status: true, data: null, authorization: resp.token });
            } else {
              return res.status(200).jsonp({
                status: true,
                data: company_compliances_avaliable,
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

  getSourceAddressAsync: async (req, res) => {
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
            var source_address_avaliable = await source_address
              .find({ _awareid: req.headers.awareid, isArchived: false })
              .catch((ex) => {
                loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
                return res
                  .status(400)
                  .jsonp({ status: false, message: "Bad request!" });
              });

            if (!source_address_avaliable) {
              return res
                .status(200)
                .jsonp({ status: true, data: null, authorization: resp.token });
            } else {
              return res.status(200).jsonp({
                status: true,
                data: source_address_avaliable,
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

  getAllSourceAddressesAsync: async (req, res) => {
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
        if (resp.status === true) {
          try {
            const page = parseInt(req.query.page, 10) || 1;
            const limit = parseInt(req.query.limit, 10) || 10;
            const skip = (page - 1) * limit;
            const {
              page: pageParam,
              limit: limitParam,
              ...filters
            } = req.query;
            filters.isArchived = false;

            function escapeRegExp(string) {
              return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            }

            const searchTerm = req.query.search ? req.query.search.trim() : "";
            if (searchTerm.length > 0) {
              // Escape special characters in the search term
              const escapedSearchTerm = escapeRegExp(searchTerm);

              // Conditions for searching individual fields
              const fieldConditions = [
                { _awareid: new RegExp(escapedSearchTerm, "i") },
                { source_name: new RegExp(escapedSearchTerm, "i") },
                { address_line_one: new RegExp(escapedSearchTerm, "i") },
                { address_line_two: new RegExp(escapedSearchTerm, "i") },
                { city: new RegExp(escapedSearchTerm, "i") },
                { state: new RegExp(escapedSearchTerm, "i") },
                { country: new RegExp(escapedSearchTerm, "i") },
                { zipcode: new RegExp(escapedSearchTerm, "i") },
              ];

              // Condition for searching concatenated address fields
              const addressSearchCondition = {
                $expr: {
                  $regexMatch: {
                    input: {
                      $reduce: {
                        input: [
                          "$address_line_one",
                          "$address_line_two",
                          "$city",
                          "$state",
                        ],
                        initialValue: "",
                        in: {
                          $cond: [
                            { $eq: ["$$this", null] },
                            "$$value",
                            {
                              $cond: [
                                { $eq: ["$$value", ""] },
                                "$$this",
                                { $concat: ["$$value", ", ", "$$this"] },
                              ],
                            },
                          ],
                        },
                      },
                    },
                    regex: new RegExp(escapedSearchTerm, "i"),
                  },
                },
              };

              // Combine individual field searches and concatenated address search
              const orConditions = [...fieldConditions, addressSearchCondition];

              // Apply filters with search conditions
              const existingFilter = { ...filters };
              delete existingFilter.search;
              filters.$and = [{ ...existingFilter }, { $or: orConditions }];
              Object.keys(existingFilter).forEach((key) => delete filters[key]);
            }

            const totalDocuments = await source_address.countDocuments(filters);
            const sourceAddresses = await source_address
              .find(filters)
              .skip(skip)
              .limit(limit)
              .sort({ created_date: -1 })
              .lean();

            const data = sourceAddresses.map((item) => {
              const addressComponents = [];
              if (item.address_line_one)
                addressComponents.push(item.address_line_one);
              if (item.address_line_two)
                addressComponents.push(item.address_line_two);
              if (item.city) addressComponents.push(item.city);
              if (item.state) addressComponents.push(item.state);
              const address = addressComponents.join(", ");

              return {
                _id: item._id,
                _awareid: item._awareid,
                source_name: item.source_name,
                address: address,
                country: item.country,
                zipcode: item.zipcode,
                created_on: item.created_date,
                modified_on: item.modified_on,
                isArchived: item.isArchived,
              };
            });

            return res.status(200).jsonp({
              status: true,
              data: data,
              pagination: {
                total: totalDocuments,
                page: page,
                limit: limit,
                pages: Math.ceil(totalDocuments / limit),
              },
              authorization: resp.token,
            });
          } catch (error) {
            console.error(error);
            loggerhandler.logger.error(`${error}, email:${req.headers.email}`);
            return res
              .status(500)
              .jsonp({ status: false, message: "Internal server error." });
          }
        } else {
          return res
            .status(resp.code)
            .jsonp({ status: false, data: null, authorization: null });
        }
      }
    );
  },

  archiveSource: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(422)
        .jsonp({ status: false, message: "Bad payload received." });
    }
    if (
      !req.headers.userid ||
      !req.headers.username ||
      !req.headers.authorization
    ) {
      return res.status(400).jsonp({ status: false, message: "Bad request!" });
    }

    const payload = { username: req.headers.username };
    refresh(
      req.headers.authorization,
      req.headers.userid,
      payload,
      async function (resp) {
        if (resp.status === true) {
          try {
            const id = req.body.id;
            await source_address.findByIdAndUpdate(
              { _id: id },
              { isArchived: true }
            );
            return res.status(200).jsonp({
              status: true,
              message: "Successfully Archived",
              authorization: resp.token,
            });
          } catch (error) {
            loggerhandler.logger.error(`${error} , email:${req.headers.email}`);
            return res
              .status(500)
              .jsonp({ status: false, message: "Internal server error." });
          }
        } else {
          return res
            .status(resp.code)
            .jsonp({ status: false, message: null, authorization: null });
        }
      }
    );
  },

  createSelfValidationAsync: async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res
        .status(422)
        .jsonp({ status: false, message: "Bad payload received." });
    } else {
      // console.log("body",req.body)
      // console.log("body",JSON.parse(req.body.sustainble_material))

      let sustainble_material = JSON.parse(req.body.sustainble_material);
      const self_validation_exist = await self_validation
        .findOne({
          _awareid: req.body._awareid,
          aware_token_id: req.body.aware_token_id,
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
            if (self_validation_exist) {
              self_validation.findOneAndUpdate(
                {
                  _awareid: req.body._awareid,
                  aware_token_id: req.body.aware_token_id,
                },
                {
                  _awareid: req.body._awareid,
                  aware_token_id: req.body.aware_token_id,
                  declaration_number: req.body.declaration_number,
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

                  // var kyc_Details = await kyc_details.findOne({ _awareid: req.body._awareid }).catch((ex) => { return res.status(500).jsonp({ status: false, message: ex.toString() }) })

                  // await account_details.findOneAndUpdate({ kyc_id: kyc_Details._id.toString() }, { create_token_stepper: 3 }, { new: true }).catch((ex) => { return res.status(500).jsonp({ status: false, message: ex.toString() }) })

                  await aw_tokens
                    .findOneAndUpdate(
                      {
                        _awareid: req.body._awareid,
                        _id: mongoose.Types.ObjectId(req.body.aware_token_id),
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
                      "Information entered on Self Validation page has been saved successfully",
                    authorization: resp.token,
                  });
                }
              );
            } else {
              self_validation.create(
                {
                  _awareid: req.body._awareid,
                  aware_token_id: req.body.aware_token_id,
                  declaration_number: req.body.declaration_number,
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

                  // var kyc_Details = await kyc_details.findOne({ _awareid: req.body._awareid }).catch((ex) => { return res.status(500).jsonp({ status: false, message: ex.toString() }) })

                  // await account_details.findOneAndUpdate({ kyc_id: kyc_Details._id.toString() }, { create_token_stepper: 3 }, { new: true }).catch((ex) => { return res.status(500).jsonp({ status: false, message: ex.toString() }) })

                  await aw_tokens
                    .findOneAndUpdate(
                      {
                        _awareid: req.body._awareid,
                        _id: mongoose.Types.ObjectId(req.body.aware_token_id),
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

  getSelfValidationAsync: async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).jsonp(errors.array());
    } else {
      if (
        !req.headers.userid ||
        !req.headers.username ||
        !req.headers.authorization ||
        !req.headers.awareid ||
        !req.headers.aware_token_id
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
            var self_validation_avaliable = await self_validation
              .findOne({
                _awareid: req.headers.awareid,
                aware_token_id: req.headers.aware_token_id,
              })
              .catch((ex) => {
                loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
                return res
                  .status(400)
                  .jsonp({ status: false, message: "Bad request!" });
              });

            if (!self_validation_avaliable) {
              return res
                .status(200)
                .jsonp({ status: true, data: null, authorization: resp.token });
            } else {
              return res.status(200).jsonp({
                status: true,
                data: self_validation_avaliable,
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

  deleteResetAwareTokenAsync: async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res
        .status(422)
        .jsonp({ status: false, message: "Bad payload received." });
    } else {
      if (req.body.type == "tracer") {
        await tracer
          .deleteOne({
            _awareid: req.body._awareid,
            aware_token_id: req.body.aware_token_id,
          })
          .catch((ex) => {
            loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
            return res
              .status(500)
              .jsonp({ status: false, message: ex.toString() });
          });

        // var kyc_Details = await kyc_details.findOne({ _awareid: req.body._awareid }).catch((ex) => { return res.status(500).jsonp({ status: false, message: ex.toString() }) })

        // await account_details.findOneAndUpdate({ kyc_id: kyc_Details._id.toString() }, { create_token_stepper: 1 }, { new: true }).catch((ex) => { return res.status(500).jsonp({ status: false, message: ex.toString() }) })

        await aw_tokens
          .findOneAndUpdate(
            {
              _awareid: req.body._awareid,
              _id: mongoose.Types.ObjectId(req.body.aware_token_id),
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
      } else if (req.body.type == "selfvalidation") {
        await self_validation
          .deleteOne({
            _awareid: req.body._awareid,
            aware_token_id: req.body.aware_token_id,
          })
          .catch((ex) => {
            loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
            return res
              .status(500)
              .jsonp({ status: false, message: ex.toString() });
          });

        // var kyc_Details = await kyc_details.findOne({ _awareid: req.body._awareid }).catch((ex) => { return res.status(500).jsonp({ status: false, message: ex.toString() }) })

        // await account_details.findOneAndUpdate({ kyc_id: kyc_Details._id.toString() }, { create_token_stepper: 2 }, { new: true }).catch((ex) => { return res.status(500).jsonp({ status: false, message: ex.toString() }) })

        await aw_tokens
          .findOneAndUpdate(
            {
              _awareid: req.body._awareid,
              _id: mongoose.Types.ObjectId(req.body.aware_token_id),
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
      } else if (req.body.type == "companycompliance") {
        await company_compliances
          .deleteOne({
            _awareid: req.body._awareid,
            aware_token_id: req.body.aware_token_id,
          })
          .catch((ex) => {
            loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
            return res
              .status(500)
              .jsonp({ status: false, message: ex.toString() });
          });

        // var kyc_Details = await kyc_details.findOne({ _awareid: req.body._awareid }).catch((ex) => { return res.status(500).jsonp({ status: false, message: ex.toString() }) })

        // await account_details.findOneAndUpdate({ kyc_id: kyc_Details._id.toString() }, { create_token_stepper: 3 }, { new: true }).catch((ex) => { return res.status(500).jsonp({ status: false, message: ex.toString() }) })

        await aw_tokens
          .findOneAndUpdate(
            {
              _awareid: req.body._awareid,
              _id: mongoose.Types.ObjectId(req.body.aware_token_id),
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

  // createTracerAsync: async (req, res) => {

  //   const errors = validationResult(req);

  //   if (!errors.isEmpty()) {
  //     return res.status(422).jsonp({ status: false, message: "Bad payload received." })
  //   }
  //   else {

  //     const tracer_exist = await tracer.findOne({ _awareid: req.body._awareid, aware_token_id: req.body.aware_token_id }).catch((ex) => {loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`); return res.status(500).jsonp({ status: false, message: ex.toString() }) })

  //     var payload = { username: req.headers.username };
  //     refresh(req.headers.authorization, req.headers.userid, payload, function (resp) {
  //       if (resp.status == true) {

  //         if (tracer_exist) {

  //           tracer.findOneAndUpdate({ _awareid: req.body._awareid, aware_token_id: req.body.aware_token_id },
  //             {
  //               _awareid: req.body._awareid,
  //               aware_token_id: req.body.aware_token_id,
  //               tracer_added: req.body.Traceradded,
  //               type_selection: req.body.type_selection,
  //               aware_tc_checked: req.body.awareTracerTC,
  //               custom_tc_checked: req.body.customTracerTC,
  //               aware_date: req.body.awareDate ? new Date(req.body.awareDate) : null,
  //               custom_date : req.body.customDate ? new Date(req.body.customDate) : null,
  //               custom_name: req.body.customName,
  //               aware_licences: req.body.Awarelicence,
  //               tracer_pdf: req.file ? req.file.filename.replace(/\s/g, "") : null
  //             },
  //             { new: true },
  //             async function (err, user) {
  //               if (err){loggerhandler.logger.error(`${err} ,email:${req.headers.email}`);
  //                return res.status(500).jsonp({ status: false, message: err.toString() })}

  //               // var kyc_Details = await aw_tokens.findOne({ _awareid: req.body._awareid }).catch((ex) => { return res.status(500).jsonp({ status: false, message: ex.toString() }) })

  //               // await account_details.findOneAndUpdate({ kyc_id: kyc_Details._id.toString() }, { create_token_stepper: 3 }, { new: true }).catch((ex) => { return res.status(500).jsonp({ status: false, message: ex.toString() }) })

  //               await aw_tokens.findOneAndUpdate({ _awareid: req.body._awareid, _id: mongoose.Types.ObjectId(req.body.aware_token_id) }, { create_token_stepper: 3 }, { new: true }).catch((ex) => {loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`); return res.status(500).jsonp({ status: false, message: ex.toString() }) })

  //               return res.status(200).jsonp({ status: true, message: "Information entered on Tracer page has been saved successfully", authorization: resp.token });

  //             })
  //         }
  //         else {

  //           tracer.create(
  //             {
  //               _awareid: req.body._awareid,
  //               aware_token_id: req.body.aware_token_id,
  //               tracer_added: req.body.Traceradded,
  //               type_selection: req.body.type_selection,
  //               aware_tc_checked: req.body.awareTracerTC,
  //               custom_tc_checked: req.body.customTracerTC,
  //               aware_date: req.body.awareDate ? new Date(req.body.awareDate) : null,
  //               custom_date : req.body.customDate ? new Date(req.body.customDate) : null,
  //               custom_name: req.body.customName,
  //               aware_licences: req.body.Awarelicence,
  //               tracer_pdf: req.file ? req.file.filename.replace(/\s/g, "") : null
  //             },
  //             async function (err, user) {
  //               if (err){loggerhandler.logger.error(`${err} ,email:${req.headers.email}`);
  //                return res.status(500).jsonp({ status: false, message: err.toString() })}

  //               // var kyc_Details = await kyc_details.findOne({ _awareid: req.body._awareid }).catch((ex) => { return res.status(500).jsonp({ status: false, message: ex.toString() }) })

  //               // await account_details.findOneAndUpdate({ kyc_id: kyc_Details._id.toString() }, { create_token_stepper: 3 }, { new: true }).catch((ex) => { return res.status(500).jsonp({ status: false, message: ex.toString() }) })

  //               await aw_tokens.findOneAndUpdate({ _awareid: req.body._awareid, _id: mongoose.Types.ObjectId(req.body.aware_token_id) }, { create_token_stepper: 3 }, { new: true }).catch((ex) => {loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`); return res.status(500).jsonp({ status: false, message: ex.toString() }) })

  //               return res.status(200).jsonp({ status: true, message: "Information entered on Tracer page has been saved successfully", authorization: resp.token });

  //             })

  //         }
  //       }
  //       else {
  //         return res.status(resp.code).jsonp({ status: false, message: null, authorization: null });
  //       }
  //     });

  //   }
  // },
  createTracerAsync: async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res
        .status(422)
        .jsonp({ status: false, message: "Bad payload received." });
    }
    // console.log('hii',req.body)
    try {
      const tracerExist = await tracer.findOne({
        _awareid: req.body._awareid,
        aware_token_id: req.body.aware_token_id,
      });
      const payload = { username: req.headers.username };
      await refresh(
        req.headers.authorization,
        req.headers.userid,
        payload,
        async function (resp) {
          if (resp.status == true) {
            const updateData = {
              _awareid: req.body._awareid,
              aware_token_id: req.body.aware_token_id,
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
                req?.file?.filename?.replace(/\s/g, "") ||
                (req.body.type_selection === tracerExist?.type_selection
                  ? req.body.type_selection == "Custom"
                    ? req.body.customDate && tracerExist?.tracer_pdf
                      ? tracerExist?.tracer_pdf
                      : null
                    : tracerExist?.tracer_pdf
                  : null) ||
                null,
            };

            if (tracerExist) {
              await tracer.findOneAndUpdate(
                {
                  _awareid: req.body._awareid,
                  aware_token_id: req.body.aware_token_id,
                },
                updateData,
                { new: true }
              );
            } else {
              await tracer.create(updateData);
            }

            await aw_tokens.findOneAndUpdate(
              {
                _awareid: req.body._awareid,
                _id: mongoose.Types.ObjectId(req.body.aware_token_id),
              },
              { create_token_stepper: 3 },
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

  getTracerAsync: async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).jsonp(errors.array());
    } else {
      if (
        !req.headers.userid ||
        !req.headers.username ||
        !req.headers.authorization ||
        !req.headers.awareid ||
        !req.headers.aware_token_id
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
            var tracer_avaliable = await tracer
              .findOne({
                _awareid: req.headers.awareid,
                aware_token_id: req.headers.aware_token_id,
              })
              .catch((ex) => {
                loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
                return res
                  .status(400)
                  .jsonp({ status: false, message: "Bad request!" });
              });

            if (!tracer_avaliable) {
              return res
                .status(200)
                .jsonp({ status: true, data: null, authorization: resp.token });
            } else {
              return res.status(200).jsonp({
                status: true,
                data: tracer_avaliable,
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

  getDigitalTwinAsync: async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).jsonp(errors.array());
    } else {
      if (
        !req.headers.userid ||
        !req.headers.username ||
        !req.headers.authorization ||
        !req.headers.awareid ||
        !req.headers.aware_token_id
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

            // console.log("kyc_details_avaliable", kyc_details_avaliable)
            var assets_avaliable = await physical_assets
              .findOne({
                _awareid: req.headers.awareid,
                aware_token_id: req.headers.aware_token_id,
              })
              .catch((ex) => {
                loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
                return res
                  .status(400)
                  .jsonp({ status: false, message: "Bad request!" });
              });

            var tracer_avaliable = await tracer
              .findOne({
                _awareid: req.headers.awareid,
                aware_token_id: req.headers.aware_token_id,
              })
              .catch((ex) => {
                loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
                return res
                  .status(400)
                  .jsonp({ status: false, message: "Bad request!" });
              });

            var self_validation_avaliable = await self_validation
              .findOne({
                _awareid: req.headers.awareid,
                aware_token_id: req.headers.aware_token_id,
              })
              .catch((ex) => {
                loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
                return res
                  .status(400)
                  .jsonp({ status: false, message: "Bad request!" });
              });

            var company_compliances_avaliable = await company_compliances
              .findOne({
                _awareid: req.headers.awareid,
                aware_token_id: req.headers.aware_token_id,
              })
              .catch((ex) => {
                loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
                return res
                  .status(400)
                  .jsonp({ status: false, message: "Bad request!" });
              });

            var aw_tokens_avaliable = await aw_tokens
              .findOne({
                _awareid: req.headers.awareid,
                _id: req.headers.aware_token_id,
              })
              .catch((ex) => {
                loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
                return res
                  .status(400)
                  .jsonp({ status: false, message: "Bad request!" });
              });

            if (
              !assets_avaliable ||
              !tracer_avaliable ||
              !self_validation_avaliable ||
              !company_compliances_avaliable ||
              !kyc_details_avaliable
            ) {
              return res
                .status(200)
                .jsonp({ status: true, data: null, authorization: resp.token });
            } else {
              return res.status(200).jsonp({
                status: true,
                data: {
                  assets_avaliable: assets_avaliable,
                  tracer_avaliable: tracer_avaliable,
                  self_validation_avaliable: self_validation_avaliable,
                  company_compliances_avaliable: company_compliances_avaliable,
                  kyc_details_avaliable: kyc_details_avaliable,
                  aw_tokens_avaliable: aw_tokens_avaliable,
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

  getDigitalTwinAsyncV3: async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).jsonp(errors.array());
    } else {
      if (
        !req.headers.userid ||
        !req.headers.username ||
        !req.headers.authorization ||
        !req.headers.awareid ||
        !req.headers.aware_token_id
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

            // console.log("kyc_details_avaliable", kyc_details_avaliable)
            var assets_avaliable = await physical_assets
              .findOne({
                _awareid: req.headers.awareid,
                aware_token_id: req.headers.aware_token_id,
              })
              .catch((ex) => {
                loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
                return res
                  .status(400)
                  .jsonp({ status: false, message: "Bad request!" });
              });

            var tracer_avaliable = await tracer
              .findOne({
                _awareid: req.headers.awareid,
                aware_token_id: req.headers.aware_token_id,
              })
              .catch((ex) => {
                loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
                return res
                  .status(400)
                  .jsonp({ status: false, message: "Bad request!" });
              });

            var self_validation_avaliable = await self_validation
              .findOne({
                _awareid: req.headers.awareid,
                aware_token_id: req.headers.aware_token_id,
              })
              .catch((ex) => {
                loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
                return res
                  .status(400)
                  .jsonp({ status: false, message: "Bad request!" });
              });

            var company_compliances_avaliable = await company_compliances
              .findOne({
                _awareid: req.headers.awareid,
                aware_token_id: req.headers.aware_token_id,
              })
              .catch((ex) => {
                loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
                return res
                  .status(400)
                  .jsonp({ status: false, message: "Bad request!" });
              });

            var aw_tokens_avaliable = await aw_tokens
              .findOne({
                _awareid: req.headers.awareid,
                _id: req.headers.aware_token_id,
              })
              .catch((ex) => {
                loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
                return res
                  .status(400)
                  .jsonp({ status: false, message: "Bad request!" });
              });

            const blockChainId = aw_tokens_avaliable.blockchain_id;
            const typeOfToken = aw_tokens_avaliable.type_of_token;
            const awareTokenId = aw_tokens_avaliable._id;

            const transferred_tokens_data_by_blockchain_id =
              await transferred_tokens.find({
                blockchain_id: blockChainId,
                type_of_token: typeOfToken,
              });

            const transaction_history_data = await transaction_history.findOne({
              aware_token_id: awareTokenId,
            });

            let transferred_data = [];
            for (let data of transferred_tokens_data_by_blockchain_id) {
              const kycDetailsData = await kyc_details
                .findOne({
                  aware_id: data._awareid,
                })
                .select("company_name");

              console.log("data", data);

              const newData = {
                _id: data._id,
                total_tokens: data.total_tokens,
                created_date: data.created_date,
                company_name: kycDetailsData.company_name,
              };

              transferred_data.push(newData);
            }

            if (
              !assets_avaliable ||
              !tracer_avaliable ||
              !self_validation_avaliable ||
              !company_compliances_avaliable ||
              !kyc_details_avaliable
            ) {
              return res
                .status(200)
                .jsonp({ status: true, data: null, authorization: resp.token });
            } else {
              return res.status(200).jsonp({
                status: true,
                data: {
                  assets_avaliable: assets_avaliable,
                  tracer_avaliable: tracer_avaliable,
                  self_validation_avaliable: self_validation_avaliable,
                  company_compliances_avaliable: company_compliances_avaliable,
                  kyc_details_avaliable: kyc_details_avaliable,
                  aw_tokens_avaliable: aw_tokens_avaliable,
                  transferred_data: transferred_data,
                  transaction_history_data: {
                    _id: transaction_history_data._id,
                    aware_token_id: transaction_history_data.aware_token_id,
                    transactionHash: transaction_history_data.transactionHash,
                    created_date: transaction_history_data.created_date,
                  },
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

  getAwareTokenAsync: async (req, res) => {
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
            var aw_tokens_avaliable = await aw_tokens
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

            if (aw_tokens_avaliable.length <= 0) {
              return res
                .status(200)
                .jsonp({ status: true, data: null, authorization: resp.token });
            } else {
              var assets_avaliable = await physical_assets
                .find({})
                .catch((ex) => {
                  loggerhandler.logger.error(
                    `${ex} ,email:${req.headers.email}`
                  );
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

              var self_validation_avaliable = await self_validation
                .find({})
                .catch((ex) => {
                  loggerhandler.logger.error(
                    `${ex} ,email:${req.headers.email}`
                  );
                  return res
                    .status(400)
                    .jsonp({ status: false, message: "Bad request!" });
                });

              var company_compliances_avaliable = await company_compliances
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
              for (var i = 0; i < aw_tokens_avaliable.length; i++) {
                var temp_aw_token = aw_tokens_avaliable[i];

                var temp_assets_avaliable = assets_avaliable.find(
                  (x) =>
                    x._awareid == temp_aw_token._awareid &&
                    x.aware_token_id == temp_aw_token._id
                );
                var temp_tracer_avaliable = tracer_avaliable.find(
                  (x) =>
                    x._awareid == temp_aw_token._awareid &&
                    x.aware_token_id == temp_aw_token._id
                );
                var temp_self_validation_avaliable =
                  self_validation_avaliable.find(
                    (x) =>
                      x._awareid == temp_aw_token._awareid &&
                      x.aware_token_id == temp_aw_token._id
                  );
                var temp_company_compliances_avaliable =
                  company_compliances_avaliable.find(
                    (x) =>
                      x._awareid == temp_aw_token._awareid &&
                      x.aware_token_id == temp_aw_token._id
                  );

                var jsonObject = {
                  aw_tokens: temp_aw_token,
                  assets_avaliable: temp_assets_avaliable
                    ? temp_assets_avaliable
                    : null,
                  tracer_avaliable: temp_tracer_avaliable
                    ? temp_tracer_avaliable
                    : null,
                  self_validation_avaliable: temp_self_validation_avaliable
                    ? temp_self_validation_avaliable
                    : null,
                  company_compliances_avaliable:
                    temp_company_compliances_avaliable
                      ? temp_company_compliances_avaliable
                      : null,
                };

                jsonData.push(jsonObject);
              }

              // console.log("jsonObject",jsonData)
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

  getApprovedAwareTokenAsync: async (req, res) => {
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
            var aw_tokens_avaliable = await aw_tokens
              .find({
                _awareid: req.headers.awareid,
                status: "Approved",
                hide_flag: { $ne: true },
                locked: false,
                avaliable_tokens: { $gt: 0 },
              })
              .catch((ex) => {
                loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
                return res
                  .status(400)
                  .jsonp({ status: false, message: "Bad request!" });
              });

            // console.log("aw_tokens_avaliable", aw_tokens_avaliable.length)
            var update_aw_tokens_avaliable = await update_aw_tokens
              .find({
                _awareid: req.headers.awareid,
                status: "Approved",
                locked: false,
                avaliable_tokens: { $gt: 0 },
              })
              .catch((ex) => {
                loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
                return res
                  .status(400)
                  .jsonp({ status: false, message: "Bad request!" });
              });

            // console.log("update_aw_tokens_avaliable", update_aw_tokens_avaliable.length)

            var jsonData = [];

            if (aw_tokens_avaliable.length <= 0) {
              // return res.status(200).jsonp({ status: true, data: null, authorization: resp.token });
            } else {
              var assets_avaliable = await physical_assets
                .find({})
                .catch((ex) => {
                  loggerhandler.logger.error(
                    `${ex} ,email:${req.headers.email}`
                  );
                  return res
                    .status(400)
                    .jsonp({ status: false, message: "Bad request!" });
                });

              for (var i = 0; i < aw_tokens_avaliable.length; i++) {
                var temp_aw_token = aw_tokens_avaliable[i];

                var temp_assets_avaliable = assets_avaliable.find(
                  (x) =>
                    x._awareid == temp_aw_token._awareid &&
                    x.aware_token_id == temp_aw_token._id
                );

                var jsonObject = {
                  aw_tokens: temp_aw_token,
                  assets_avaliable: temp_assets_avaliable
                    ? temp_assets_avaliable
                    : null,
                  update_aw_tokens: null,
                  update_assets_avaliable: null,
                };

                jsonData.push(jsonObject);
              }

              // return res.status(200).jsonp({ status: true, data: jsonData, authorization: resp.token });
            }

            if (update_aw_tokens_avaliable.length <= 0) {
              // console.log("IN")
              // return res.status(200).jsonp({ status: true, data: null, authorization: resp.token });
            } else {
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

              // console.log("update_physical_asset_avaliable", update_physical_asset_avaliable.length)

              for (var i = 0; i < update_aw_tokens_avaliable.length; i++) {
                var temp_aw_token = update_aw_tokens_avaliable[i];

                var temp_assets_avaliable =
                  update_physical_asset_avaliable.find(
                    (x) =>
                      x._awareid == temp_aw_token._awareid &&
                      x.update_aware_token_id == temp_aw_token._id
                  );

                var jsonObject = {
                  aw_tokens: null,
                  assets_avaliable: null,
                  update_aw_tokens: temp_aw_token,
                  update_assets_avaliable: temp_assets_avaliable
                    ? temp_assets_avaliable
                    : null,
                };

                jsonData.push(jsonObject);
              }

              // return res.status(200).jsonp({ status: true, data: jsonData, authorization: resp.token });
            }

            // console.log("jsonData", jsonData)

            return res.status(200).jsonp({
              status: true,
              data: jsonData,
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

  getallAwareTokenAsync: async (req, res) => {
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

    // Filter to exclude concept or processing tokens
    const excludeRegex = new RegExp("^concept$", "i");
    let statusMatch = { status: { $not: excludeRegex } };

    // Add status filter if provided
    if (req.query.status) {
      const statusRegex = new RegExp(
        "^" + escapeRegExp(req.query.status.toLowerCase()) + "$",
        "i"
      );
      statusMatch = { status: statusRegex };
    }

    // Search term filtering
    const searchTerm = req.query.search ? req.query.search.trim() : "";
    let searchMatch = {};
    let searchRegex = null;
    if (searchTerm.length > 0) {
      const escapedSearchTerm = escapeRegExp(searchTerm).replace(
        /\s+/g,
        "\\s+"
      );
      searchRegex = new RegExp(escapedSearchTerm, "i");
      console.log("searchRegex", searchRegex);
      searchMatch = {
        $or: [
          { "physical_asset.aware_asset_id": searchRegex },
          { "physical_asset.weight": searchRegex },
          { "physical_asset.aware_token_type": searchRegex },
          { "kyc_detail.company_name": searchRegex },
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
            // Create aggregation pipeline
            const pipeline = [
              // Stage 1: Match aw_tokens that meet status criteria
              { $match: statusMatch },

              // Stage 2: Lookup physical_assets
              {
                $lookup: {
                  from: "physical_assets",
                  let: { awareid: "$_awareid", tokenid: "$_id" },
                  pipeline: [
                    {
                      $match: {
                        $expr: {
                          $and: [
                            {
                              $eq: ["$_awareid", "$$awareid"],
                            },
                            {
                              $eq: [
                                { $toString: "$aware_token_id" },
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
                        created_date: 1,
                        aware_token_type: 1,
                        aware_asset_id: 1,
                        weight: 1,
                      },
                    },
                  ],
                  as: "physical_asset",
                },
              },

              // Stage 3: Lookup kyc_details
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

              // Stage 4: Apply search filter if provided
              ...(searchTerm.length > 0
                ? [
                    {
                      $match: {
                        $or: [
                          { "physical_asset.aware_asset_id": searchRegex },
                          { "physical_asset.weight": searchRegex },
                          { "physical_asset.aware_token_type": searchRegex },
                          { "kyc_detail.company_name": searchRegex },
                        ],
                      },
                    },
                  ]
                : []),

              // Stage 5: Format the output - convert arrays to single objects or null
              {
                $addFields: {
                  assets_available: {
                    $cond: {
                      if: { $gt: [{ $size: "$physical_asset" }, 0] },
                      then: { $arrayElemAt: ["$physical_asset", 0] },
                      else: null,
                    },
                  },
                  kyc_details_available: {
                    $cond: {
                      if: { $gt: [{ $size: "$kyc_detail" }, 0] },
                      then: { $arrayElemAt: ["$kyc_detail", 0] },
                      else: null,
                    },
                  },
                },
              },

              // Stage 6: Create final structure
              {
                $project: {
                  aw_tokens: {
                    _id: "$_id",
                    status: "$status",
                    _awareid: "$_awareid",
                  },
                  assets_available: 1,
                  kyc_details_available: 1,
                },
              },

              // Stage 7: Remove unwanted nested fields from update_aw_tokens
              {
                $unset: [
                  "aw_tokens.physical_asset",
                  "aw_tokens.kyc_detail",
                  "aw_tokens.assets_available",
                  "aw_tokens.kyc_details_available",
                ],
              },

              // Stage 11: Sort by created_date descending (newest first)
              {
                $sort: {
                  "assets_available.created_date": -1,
                },
              },

              // Stage 12: Get total count for pagination
              {
                $facet: {
                  metadata: [{ $count: "total" }],
                  data: [{ $skip: skip }, { $limit: limit }],
                },
              },
            ];

            // Execute aggregation pipeline
            const aggregationResult = await aw_tokens
              .aggregate(pipeline, { allowDiskUse: true })
              .catch((ex) => {
                loggerhandler.logger.error(`${ex}, email:${req.headers.email}`);
                return res
                  .status(400)
                  .jsonp({ status: false, message: "Bad request!" });
              });

            // Extract results and metadata
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

  getallAwareTokenforParticularProducerAsync: async (req, res) => {
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

    // Filter to exclude concept or processing tokens
    const excludeRegex = new RegExp("^concept$", "i");
    let statusMatch = { status: { $not: excludeRegex } };

    // Add status filter if provided
    if (req.query.status) {
      const statusRegex = new RegExp(
        "^" + escapeRegExp(req.query.status.toLowerCase()) + "$",
        "i"
      );
      statusMatch = { status: statusRegex };
    }

    // Search term filtering
    const searchTerm = req.query.search ? req.query.search.trim() : "";
    let searchMatch = {};
    let searchRegex = null;
    if (searchTerm.length > 0) {
      const escapedSearchTerm = escapeRegExp(searchTerm).replace(
        /\s+/g,
        "\\s+"
      );
      searchRegex = new RegExp(escapedSearchTerm, "i");
      console.log("searchRegex", searchRegex);
      searchMatch = {
        $or: [
          { "physical_asset.aware_asset_id": searchRegex },
          { "physical_asset.weight": searchRegex },
          { "physical_asset.aware_token_type": searchRegex },
          { "kyc_detail.company_name": searchRegex },
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
            var manager_kyc_details_avaliable = await kyc_details
              .findOne({
                manager_id: mongoose.Types.ObjectId(req.headers.userid),
              })
              .catch((ex) => {
                loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
                return res
                  .status(400)
                  .jsonp({ status: false, message: "Bad request!" });
              });

            if (!manager_kyc_details_avaliable) {
              return res
                .status(200)
                .jsonp({ status: true, data: [], authorization: resp.token });
            }

            const combinedMatch = {
              ...statusMatch,
              _awareid: manager_kyc_details_avaliable?.aware_id,
            };

            // Create aggregation pipeline
            const pipeline = [
              // Stage 1: Match aw_tokens that meet status criteria
              { $match: combinedMatch },

              // Stage 2: Lookup physical_assets
              {
                $lookup: {
                  from: "physical_assets",
                  let: { awareid: "$_awareid", tokenid: "$_id" },
                  pipeline: [
                    {
                      $match: {
                        $expr: {
                          $and: [
                            {
                              $eq: ["$_awareid", "$$awareid"],
                            },
                            {
                              $eq: [
                                { $toString: "$aware_token_id" },
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
                        created_date: 1,
                        aware_token_type: 1,
                        aware_asset_id: 1,
                        weight: 1,
                      },
                    },
                  ],
                  as: "physical_asset",
                },
              },

              // Stage 3: Lookup kyc_details
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

              // Stage 7: Apply search filter if provided
              ...(searchTerm.length > 0
                ? [
                    {
                      $match: {
                        $or: [
                          { "physical_asset.aware_asset_id": searchRegex },
                          { "physical_asset.weight": searchRegex },
                          { "physical_asset.aware_token_type": searchRegex },
                          { "kyc_detail.company_name": searchRegex },
                        ],
                      },
                    },
                  ]
                : []),

              // Stage 8: Format the output - convert arrays to single objects or null
              {
                $addFields: {
                  assets_available: {
                    $cond: {
                      if: { $gt: [{ $size: "$physical_asset" }, 0] },
                      then: { $arrayElemAt: ["$physical_asset", 0] },
                      else: null,
                    },
                  },
                  kyc_details_available: {
                    $cond: {
                      if: { $gt: [{ $size: "$kyc_detail" }, 0] },
                      then: { $arrayElemAt: ["$kyc_detail", 0] },
                      else: null,
                    },
                  },
                },
              },

              // Stage 9: Create final structure
              {
                $project: {
                  aw_tokens: {
                    _id: "$_id",
                    status: "$status",
                    _awareid: "$_awareid",
                  },
                  assets_available: 1,
                  kyc_details_available: 1,
                },
              },

              // Stage 10: Remove unwanted nested fields from update_aw_tokens
              {
                $unset: [
                  "aw_tokens.physical_asset",
                  "aw_tokens.kyc_detail",
                  "aw_tokens.assets_available",
                  "aw_tokens.kyc_details_available",
                ],
              },

              // Stage 11: Sort by created_date descending (newest first)
              {
                $sort: {
                  "assets_available.created_date": -1,
                },
              },

              // Stage 12: Get total count for pagination
              {
                $facet: {
                  metadata: [{ $count: "total" }],
                  data: [{ $skip: skip }, { $limit: limit }],
                },
              },
            ];

            // Execute aggregation pipeline
            const aggregationResult = await aw_tokens
              .aggregate(pipeline)
              .catch((ex) => {
                loggerhandler.logger.error(`${ex}, email:${req.headers.email}`);
                return res
                  .status(400)
                  .jsonp({ status: false, message: "Bad request!" });
              });

            // Extract results and metadata
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

  // getallAwareTokenforParticularProducerAsync: async (req, res) => {
  //   const errors = validationResult(req);

  //   if (!errors.isEmpty()) {
  //     return res.status(422).jsonp(errors.array());
  //   } else {
  //     if (
  //       !req.headers.userid ||
  //       !req.headers.username ||
  //       !req.headers.authorization
  //     ) {
  //       return res
  //         .status(400)
  //         .jsonp({ status: false, message: "Bad request!" });
  //     }

  //     var payload = { username: req.headers.username };
  //     refresh(
  //       req.headers.authorization,
  //       req.headers.userid,
  //       payload,
  //       async function (resp) {
  //         if (resp.status == true) {
  //           console.log("checker");
  //           var manager_kyc_details_avaliable = await kyc_details
  //             .findOne({
  //               manager_id: mongoose.Types.ObjectId(req.headers.userid),
  //             })
  //             .catch((ex) => {
  //               loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
  //               return res
  //                 .status(400)
  //                 .jsonp({ status: false, message: "Bad request!" });
  //             });

  //           if (!manager_kyc_details_avaliable) {
  //             return res
  //               .status(200)
  //               .jsonp({ status: true, data: null, authorization: resp.token });
  //           }
  //           var aw_tokens_avaliable = await aw_tokens
  //             .find({ _awareid: manager_kyc_details_avaliable?.aware_id })
  //             .catch((ex) => {
  //               loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
  //               return res
  //                 .status(400)
  //                 .jsonp({ status: false, message: "Bad request!" });
  //             });
  //           if (aw_tokens_avaliable.length <= 0) {
  //             return res
  //               .status(200)
  //               .jsonp({ status: true, data: null, authorization: resp.token });
  //           } else {
  //             var kyc_details_avaliable = await kyc_details
  //               .find({})
  //               .catch((ex) => {
  //                 loggerhandler.logger.error(
  //                   `${ex} ,email:${req.headers.email}`
  //                 );
  //                 return res
  //                   .status(400)
  //                   .jsonp({ status: false, message: "Bad request!" });
  //               });

  //             var assets_avaliable = await physical_assets
  //               .find({})
  //               .catch((ex) => {
  //                 loggerhandler.logger.error(
  //                   `${ex} ,email:${req.headers.email}`
  //                 );
  //                 return res
  //                   .status(400)
  //                   .jsonp({ status: false, message: "Bad request!" });
  //               });

  //             var tracer_avaliable = await tracer.find({}).catch((ex) => {
  //               loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
  //               return res
  //                 .status(400)
  //                 .jsonp({ status: false, message: "Bad request!" });
  //             });

  //             var self_validation_avaliable = await self_validation
  //               .find({})
  //               .catch((ex) => {
  //                 loggerhandler.logger.error(
  //                   `${ex} ,email:${req.headers.email}`
  //                 );
  //                 return res
  //                   .status(400)
  //                   .jsonp({ status: false, message: "Bad request!" });
  //               });

  //             var company_compliances_avaliable = await company_compliances
  //               .find({})
  //               .catch((ex) => {
  //                 loggerhandler.logger.error(
  //                   `${ex} ,email:${req.headers.email}`
  //                 );
  //                 return res
  //                   .status(400)
  //                   .jsonp({ status: false, message: "Bad request!" });
  //               });

  //             var jsonData = [];
  //             for (var i = 0; i < aw_tokens_avaliable.length; i++) {
  //               var temp_aw_token = aw_tokens_avaliable[i];

  //               var temp_assets_avaliable = assets_avaliable.find(
  //                 (x) =>
  //                   x._awareid == temp_aw_token._awareid &&
  //                   x.aware_token_id == temp_aw_token._id
  //               );
  //               var temp_kyc_details_avaliable = kyc_details_avaliable.find(
  //                 (x) => x.aware_id == temp_aw_token._awareid
  //               );

  //               var temp_tracer_avaliable = tracer_avaliable.find(
  //                 (x) =>
  //                   x._awareid == temp_aw_token._awareid &&
  //                   x.aware_token_id == temp_aw_token._id
  //               );
  //               var temp_self_validation_avaliable =
  //                 self_validation_avaliable.find(
  //                   (x) =>
  //                     x._awareid == temp_aw_token._awareid &&
  //                     x.aware_token_id == temp_aw_token._id
  //                 );
  //               var temp_company_compliances_avaliable =
  //                 company_compliances_avaliable.find(
  //                   (x) =>
  //                     x._awareid == temp_aw_token._awareid &&
  //                     x.aware_token_id == temp_aw_token._id
  //                 );

  //               var jsonObject = {
  //                 aw_tokens: temp_aw_token,
  //                 assets_avaliable: assets_avaliable
  //                   ? temp_assets_avaliable
  //                   : null,
  //                 kyc_details_avaliable: kyc_details_avaliable
  //                   ? temp_kyc_details_avaliable
  //                   : null,

  //                 tracer_avaliable: temp_tracer_avaliable
  //                   ? temp_tracer_avaliable
  //                   : null,
  //                 self_validation_avaliable: temp_self_validation_avaliable
  //                   ? temp_self_validation_avaliable
  //                   : null,
  //                 company_compliances_avaliable:
  //                   temp_company_compliances_avaliable
  //                     ? temp_company_compliances_avaliable
  //                     : null,
  //               };

  //               jsonData.push(jsonObject);
  //             }

  //             return res.status(200).jsonp({
  //               status: true,
  //               data: jsonData,
  //               authorization: resp.token,
  //             });
  //           }
  //         } else {
  //           return res
  //             .status(resp.code)
  //             .jsonp({ status: false, data: null, authorization: null });
  //         }
  //       }
  //     );
  //   }
  // },

  deleteAwareTokenAsync: async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res
        .status(422)
        .jsonp({ status: false, message: "Bad payload received." });
    } else {
      await aw_tokens
        .deleteOne({
          _awareid: req.body._awareid,
          _id: mongoose.Types.ObjectId(req.body.aware_token_id),
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
              message: "Create token request has been deleted successfully",
              authorization: resp.token,
            });
            //Token Create request has been deleted successfully
          } else {
            return res
              .status(resp.code)
              .jsonp({ status: false, message: null, authorization: null });
          }
        }
      );
    }
  },

  getAwareTokenDetailsAsync: async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).jsonp(errors.array());
    } else {
      if (
        !req.headers.userid ||
        !req.headers.username ||
        !req.headers.authorization ||
        !req.headers.awareid ||
        !req.headers.aware_token_id
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
            var aw_tokens_avaliable = await aw_tokens
              .findOne({
                _awareid: req.headers.awareid,
                _id: mongoose.Types.ObjectId(req.headers.aware_token_id),
              })
              .catch((ex) => {
                loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
                return res
                  .status(400)
                  .jsonp({ status: false, message: "Bad request!" });
              });

            if (!aw_tokens_avaliable) {
              return res
                .status(200)
                .jsonp({ status: true, data: null, authorization: resp.token });
            } else {
              return res.status(200).jsonp({
                status: true,
                data: aw_tokens_avaliable,
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

  postDigitalTwinAsync: async (req, res) => {
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
            let aw_token = await aw_tokens
              .findOneAndUpdate(
                {
                  _awareid: req.body._awareid,
                  _id: mongoose.Types.ObjectId(req.body.aware_token_id),
                },
                { status: "SEND" },
                { new: true }
              )
              .catch((ex) => {
                loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
                return res
                  .status(400)
                  .jsonp({ status: false, message: "Bad request!" });
              });

            let physical_asset_avaliable = await physical_assets
              .findOne({ aware_token_id: req.body.aware_token_id })
              .catch((ex) => {
                loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
                return res
                  .status(400)
                  .jsonp({ status: false, message: "Bad request!" });
              });

            let kyc_detail = await kyc_details
              .findOne({ aware_id: req.body._awareid })
              .catch((ex) => {
                loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
                return res
                  .status(400)
                  .jsonp({ status: false, message: "Bad request!" });
              });

            console.log("aw_token", aw_token);
            await notifications.create({
              notification_sent_to: kyc_detail?.manager_id || "",
              message: `You have received a new request for ${
                physical_asset_avaliable?.weight || ""
              } token approval.`,
            });

            var aw_tokens_avaliable = await aw_tokens
              .find({
                _awareid: req.body._awareid,
                status: "CONCEPT",
                create_token_stepper: 1,
              })
              .catch((ex) => {
                loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
                return res
                  .status(400)
                  .jsonp({ status: false, message: "Bad request!" });
              });

            // console.log("aw_tokens_avaliable", aw_tokens_avaliable)

            const output = [];
            const map = new Map();
            for (const item of aw_tokens_avaliable) {
              if (!map.has(mongoose.Types.ObjectId(item._id))) {
                map.set(mongoose.Types.ObjectId(item._id), true); // set any value to Map
                output.push(mongoose.Types.ObjectId(item._id));
              }
            }

            // console.log("output", output)

            await aw_tokens.deleteMany({ _id: { $in: output } }).catch((ex) => {
              loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
              return res
                .status(400)
                .jsonp({ status: false, message: "Bad request!" });
            });

            return res.status(200).jsonp({
              status: true,
              message:
                "Your create token request has been sent to your manager for approval.",
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

  getWalletAsync: async (req, res) => {
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
            var wallet_found = await wallets
              .findOne({ _awareid: req.headers.awareid })
              .catch((ex) => {
                loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
                return res
                  .status(400)
                  .jsonp({ status: false, message: "Bad request!" });
              });

            var aw_tokens_found = await aw_tokens
              .find({ _awareid: req.headers.awareid, hide_flag: { $ne: true } })
              .catch((ex) => {
                loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
                return res
                  .status(400)
                  .jsonp({ status: false, message: "Bad request!" });
              });

            var update_aw_tokens_found = await update_aw_tokens
              .find({ _awareid: req.headers.awareid })
              .catch((ex) => {
                loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
                return res
                  .status(400)
                  .jsonp({ status: false, message: "Bad request!" });
              });

            var transferred_tokens_avaliable = await transferred_tokens
              .find({ _awareid: req.headers.awareid })
              .catch((ex) => {
                loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
                return res
                  .status(400)
                  .jsonp({ status: false, message: "Bad request!" });
              });

            var Pellet = 0,
              Fiber = 0,
              Yarn = 0,
              Fabric = 0,
              Product = 0;
            Final_product = 0;

            aw_tokens_found.filter((item) => {
              if (item.type_of_token === "Pellet") {
                Pellet = Pellet + item.avaliable_tokens;
              } else if (item.type_of_token === "Fiber") {
                Fiber = Fiber + item.avaliable_tokens;
              } else if (item.type_of_token === "Yarn") {
                Yarn = Yarn + item.avaliable_tokens;
              } else if (item.type_of_token === "Fabric") {
                Fabric = Fabric + item.avaliable_tokens;
              } else if (item.type_of_token === "Product") {
                Product = Product + item.avaliable_tokens;
              } else if (item.type_of_token === "Final product") {
                Product = Product + item.avaliable_tokens;
              }
            });

            update_aw_tokens_found.filter((item) => {
              if (item.type_of_token === "Pellet") {
                Pellet = Pellet + item.avaliable_tokens;
              } else if (item.type_of_token === "Fiber") {
                Fiber = Fiber + item.avaliable_tokens;
              } else if (item.type_of_token === "Yarn") {
                Yarn = Yarn + item.avaliable_tokens;
              } else if (item.type_of_token === "Fabric") {
                Fabric = Fabric + item.avaliable_tokens;
              } else if (item.type_of_token === "Product") {
                Product = Product + item.avaliable_tokens;
              } else if (item.type_of_token === "Final product") {
                Product = Product + item.avaliable_tokens;
              }
            });

            transferred_tokens_avaliable.filter((item) => {
              if (item.type_of_token === "Pellet") {
                Pellet = Pellet + item.avaliable_tokens;
              } else if (item.type_of_token === "Fiber") {
                Fiber = Fiber + item.avaliable_tokens;
              } else if (item.type_of_token === "Yarn") {
                Yarn = Yarn + item.avaliable_tokens;
              } else if (item.type_of_token === "Fabric") {
                Fabric = Fabric + item.avaliable_tokens;
              } else if (item.type_of_token === "Product") {
                Product = Product + item.avaliable_tokens;
              } else if (item.type_of_token === "Final product") {
                Product = Product + item.avaliable_tokens;
              }
            });

            return res.status(200).jsonp({
              status: true,
              data: {
                wallet_address_io: wallet_found
                  ? wallet_found.wallet_address_io
                  : null,
                wallet_address_0x: wallet_found
                  ? wallet_found.wallet_address_0x
                  : null,
                Pellet,
                Fiber,
                Yarn,
                Fabric,
                Product,
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

  getAwareTokenTransactionHistoryAsync: async (req, res) => {
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

      console.log("req.headers.type", req.headers.awareid, req.headers.type);

      var payload = { username: req.headers.username };
      refresh(
        req.headers.authorization,
        req.headers.userid,
        payload,
        async function (resp) {
          if (resp.status == true) {
            var aw_tokens_avaliable = await aw_tokens
              .find({
                _awareid: req.headers.awareid,
                status: "Approved",
                type_of_token: req.headers.type,
                hide_flag: { $ne: true },
                avaliable_tokens: { $gt: 0 },
              })
              .catch((ex) => {
                loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
                return res
                  .status(400)
                  .jsonp({ status: false, message: "Bad request!" });
              });

            var update_aw_tokens_avaliable = await update_aw_tokens
              .find({
                _awareid: req.headers.awareid,
                status: "Approved",
                type_of_token: req.headers.type,
                avaliable_tokens: { $gt: 0 },
              })
              .catch((ex) => {
                loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
                return res
                  .status(400)
                  .jsonp({ status: false, message: "Bad request!" });
              });

            // console.log("aw_tokens_avaliable", aw_tokens_avaliable)
            // console.log("update_aw_tokens_avaliable", update_aw_tokens_avaliable)

            var transferred_tokens_avaliable = await transferred_tokens
              .find({
                _awareid: req.headers.awareid,
                type_of_token: req.headers.type,
                avaliable_tokens: { $gt: 0 },
              })
              .catch((ex) => {
                loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
                return res
                  .status(400)
                  .jsonp({ status: false, message: "Bad request!" });
              });

            var jsonData = [];

            if (aw_tokens_avaliable.length <= 0) {
              // return res.status(200).jsonp({ status: true, data: null, authorization: resp.token });
            } else {
              var assets_avaliable = await physical_assets
                .find({})
                .catch((ex) => {
                  loggerhandler.logger.error(
                    `${ex} ,email:${req.headers.email}`
                  );
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

              var self_validation_avaliable = await self_validation
                .find({})
                .catch((ex) => {
                  loggerhandler.logger.error(
                    `${ex} ,email:${req.headers.email}`
                  );
                  return res
                    .status(400)
                    .jsonp({ status: false, message: "Bad request!" });
                });

              var company_compliances_avaliable = await company_compliances
                .find({})
                .catch((ex) => {
                  loggerhandler.logger.error(
                    `${ex} ,email:${req.headers.email}`
                  );
                  return res
                    .status(400)
                    .jsonp({ status: false, message: "Bad request!" });
                });

              var transaction_history_avaliable = await transaction_history
                .find({})
                .catch((ex) => {
                  loggerhandler.logger.error(
                    `${ex} ,email:${req.headers.email}`
                  );
                  return res
                    .status(400)
                    .jsonp({ status: false, message: "Bad request!" });
                });

              // var jsonData = [];
              for (var i = 0; i < aw_tokens_avaliable.length; i++) {
                var temp_aw_token = aw_tokens_avaliable[i];

                var temp_assets_avaliable = assets_avaliable.find(
                  (x) =>
                    x._awareid == temp_aw_token._awareid &&
                    x.aware_token_id == temp_aw_token._id
                );
                var temp_tracer_avaliable = tracer_avaliable.find(
                  (x) =>
                    x._awareid == temp_aw_token._awareid &&
                    x.aware_token_id == temp_aw_token._id
                );
                var temp_self_validation_avaliable =
                  self_validation_avaliable.find(
                    (x) =>
                      x._awareid == temp_aw_token._awareid &&
                      x.aware_token_id == temp_aw_token._id
                  );
                var temp_company_compliances_avaliable =
                  company_compliances_avaliable.find(
                    (x) =>
                      x._awareid == temp_aw_token._awareid &&
                      x.aware_token_id == temp_aw_token._id
                  );
                var temp_transaction_history_avaliable =
                  transaction_history_avaliable.find(
                    (x) =>
                      x._awareid == temp_aw_token._awareid &&
                      x.aware_token_id == temp_aw_token._id
                  );

                var jsonObject = {
                  aw_tokens: temp_aw_token,
                  transferred_token: null,
                  assets_avaliable: temp_assets_avaliable
                    ? temp_assets_avaliable
                    : null,
                  tracer_avaliable: temp_tracer_avaliable
                    ? temp_tracer_avaliable
                    : null,
                  self_validation_avaliable: temp_self_validation_avaliable
                    ? temp_self_validation_avaliable
                    : null,
                  company_compliances_avaliable:
                    temp_company_compliances_avaliable
                      ? temp_company_compliances_avaliable
                      : null,
                  transaction_history_avaliable:
                    temp_transaction_history_avaliable
                      ? temp_transaction_history_avaliable
                      : null,
                  transaction_type: "created",

                  // "historical_data": h_assets_avaliable ? {'assets_avaliable': h_assets_avaliable, 'tracer_avaliable': h_tracer_avaliable, 'self_validation_avaliable' : h_self_validation_avaliable, 'company_compliances_avaliable': h_company_compliances_avaliable} : null
                };

                jsonData.push(jsonObject);
              }
            }

            if (update_aw_tokens_avaliable.length <= 0) {
              // return res.status(200).jsonp({ status: true, data: null, authorization: resp.token });
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

              var update_assets_avaliable = await update_physical_asset
                .find({})
                .catch((ex) => {
                  loggerhandler.logger.error(
                    `${ex} ,email:${req.headers.email}`
                  );
                  return res
                    .status(400)
                    .jsonp({ status: false, message: "Bad request!" });
                });

              var update_tracer_avaliable = await update_tracer
                .find({})
                .catch((ex) => {
                  loggerhandler.logger.error(
                    `${ex} ,email:${req.headers.email}`
                  );
                  return res
                    .status(400)
                    .jsonp({ status: false, message: "Bad request!" });
                });

              var update_self_validation_avaliable =
                await update_self_validation.find({}).catch((ex) => {
                  loggerhandler.logger.error(
                    `${ex} ,email:${req.headers.email}`
                  );
                  return res
                    .status(400)
                    .jsonp({ status: false, message: "Bad request!" });
                });

              var update_company_compliances_avaliable =
                await update_company_compliances.find({}).catch((ex) => {
                  loggerhandler.logger.error(
                    `${ex} ,email:${req.headers.email}`
                  );
                  return res
                    .status(400)
                    .jsonp({ status: false, message: "Bad request!" });
                });

              var transaction_history_avaliable = await transaction_history
                .find({})
                .catch((ex) => {
                  loggerhandler.logger.error(
                    `${ex} ,email:${req.headers.email}`
                  );
                  return res
                    .status(400)
                    .jsonp({ status: false, message: "Bad request!" });
                });

              // var jsonData = [];
              for (var i = 0; i < update_aw_tokens_avaliable.length; i++) {
                var temp_aw_token = update_aw_tokens_avaliable[i];

                var temp_selected_update_aware_token_avaliable =
                  selected_update_aware_token_avaliable.find(
                    (x) =>
                      x._awareid == temp_aw_token._awareid &&
                      x.update_aware_token_id == temp_aw_token._id
                  );
                var temp_assets_avaliable = update_assets_avaliable.find(
                  (x) =>
                    x._awareid == temp_aw_token._awareid &&
                    x.update_aware_token_id == temp_aw_token._id
                );
                var temp_tracer_avaliable = update_tracer_avaliable.find(
                  (x) =>
                    x._awareid == temp_aw_token._awareid &&
                    x.update_aware_token_id == temp_aw_token._id
                );
                var temp_self_validation_avaliable =
                  update_self_validation_avaliable.find(
                    (x) =>
                      x._awareid == temp_aw_token._awareid &&
                      x.update_aware_token_id == temp_aw_token._id
                  );
                var temp_company_compliances_avaliable =
                  update_company_compliances_avaliable.find(
                    (x) =>
                      x._awareid == temp_aw_token._awareid &&
                      x.update_aware_token_id == temp_aw_token._id
                  );
                var temp_transaction_history_avaliable =
                  transaction_history_avaliable.find(
                    (x) =>
                      x._awareid == temp_aw_token._awareid &&
                      x.update_aware_token_id == temp_aw_token._id
                  );

                var jsonObject = {
                  update_aw_tokens: temp_aw_token,
                  transferred_token: null,
                  selected_update_aware_token_avaliable:
                    temp_selected_update_aware_token_avaliable
                      ? temp_selected_update_aware_token_avaliable
                      : null,
                  update_assets_avaliable: temp_assets_avaliable
                    ? temp_assets_avaliable
                    : null,
                  update_tracer_avaliable: temp_tracer_avaliable
                    ? temp_tracer_avaliable
                    : null,
                  update_self_validation_avaliable:
                    temp_self_validation_avaliable
                      ? temp_self_validation_avaliable
                      : null,
                  update_company_compliances_avaliable:
                    temp_company_compliances_avaliable
                      ? temp_company_compliances_avaliable
                      : null,
                  transaction_history_avaliable:
                    temp_transaction_history_avaliable
                      ? temp_transaction_history_avaliable
                      : null,
                  transaction_type: "updated",
                  // "historical_data": h_assets_avaliable ? {'assets_avaliable': h_assets_avaliable, 'tracer_avaliable': h_tracer_avaliable, 'self_validation_avaliable' : h_self_validation_avaliable, 'company_compliances_avaliable': h_company_compliances_avaliable} : null
                };

                jsonData.push(jsonObject);
              }
            }

            if (transferred_tokens_avaliable.length <= 0) {
              // return res.status(200).jsonp({ status: true, data: null, authorization: resp.token });
            } else {
              // var jsonData = [];
              for (var i = 0; i < transferred_tokens_avaliable.length; i++) {
                var temp_transferred_token = transferred_tokens_avaliable[i];

                // console.log("temp_transferred_token", temp_transferred_token)

                if (temp_transferred_token.token_base_type == "initiated") {
                  var temp_assets_avaliable = await physical_assets
                    .findOne({
                      _id: temp_transferred_token.historical_physical_assets_id,
                    })
                    .catch((ex) => {
                      loggerhandler.logger.error(
                        `${ex} ,email:${req.headers.email}`
                      );
                      return res
                        .status(400)
                        .jsonp({ status: false, message: "Bad request!" });
                    });
                  var temp_tracer_avaliable = await tracer
                    .findOne({
                      _id: temp_transferred_token.historical_tracers_id,
                    })
                    .catch((ex) => {
                      loggerhandler.logger.error(
                        `${ex} ,email:${req.headers.email}`
                      );
                      return res
                        .status(400)
                        .jsonp({ status: false, message: "Bad request!" });
                    });
                  var temp_self_validation_avaliable = await self_validation
                    .findOne({
                      _id: temp_transferred_token.historical_self_validations_id,
                    })
                    .catch((ex) => {
                      loggerhandler.logger.error(
                        `${ex} ,email:${req.headers.email}`
                      );
                      return res
                        .status(400)
                        .jsonp({ status: false, message: "Bad request!" });
                    });

                  var temp_company_compliances_avaliable =
                    await company_compliances
                      .findOne({
                        _id: temp_transferred_token.historical_company_compliances_id,
                      })
                      .catch((ex) => {
                        loggerhandler.logger.error(
                          `${ex} ,email:${req.headers.email}`
                        );
                        return res
                          .status(400)
                          .jsonp({ status: false, message: "Bad request!" });
                      });
                  var temp_transaction_history_avaliable =
                    await transaction_history
                      .findOne({
                        _id: temp_transferred_token.blochchain_transaction_history_id,
                      })
                      .catch((ex) => {
                        loggerhandler.logger.error(
                          `${ex} ,email:${req.headers.email}`
                        );
                        return res
                          .status(400)
                          .jsonp({ status: false, message: "Bad request!" });
                      });

                  // var temp_company_compliances_avaliable = await transaction_history.findOne({ _id: temp_transferred_token.historical_company_compliances_id }).catch((ex) => { return res.status(400).jsonp({ status: false, message: "Bad request!" }); })

                  var jsonObject = {
                    aw_tokens: null,
                    transferred_token: temp_transferred_token,
                    assets_avaliable: temp_assets_avaliable
                      ? temp_assets_avaliable
                      : null,
                    tracer_avaliable: temp_tracer_avaliable
                      ? temp_tracer_avaliable
                      : null,
                    self_validation_avaliable: temp_self_validation_avaliable
                      ? temp_self_validation_avaliable
                      : null,
                    company_compliances_avaliable:
                      temp_company_compliances_avaliable
                        ? temp_company_compliances_avaliable
                        : null,
                    transaction_history_avaliable:
                      temp_transaction_history_avaliable
                        ? temp_transaction_history_avaliable
                        : null,
                    transaction_type: "transferred",
                    // "historical_data": h_assets_avaliable ? {'assets_avaliable': h_assets_avaliable, 'tracer_avaliable': h_tracer_avaliable, 'self_validation_avaliable' : h_self_validation_avaliable, 'company_compliances_avaliable': h_company_compliances_avaliable} : null
                  };
                } else {
                  var temp_aw_token = await update_aw_tokens
                    .findOne({
                      _id: temp_transferred_token.historical_update_aware_token_id,
                    })
                    .catch((ex) => {
                      loggerhandler.logger.error(
                        `${ex} ,email:${req.headers.email}`
                      );
                      return res
                        .status(400)
                        .jsonp({ status: false, message: "Bad request!" });
                    });
                  var selected_update_aware_token_avaliable =
                    await selected_update_aware_token
                      .findOne({
                        _id: temp_transferred_token.historical_selected_update_aware_token_id,
                      })
                      .catch((ex) => {
                        loggerhandler.logger.error(
                          `${ex} ,email:${req.headers.email}`
                        );
                        return res
                          .status(400)
                          .jsonp({ status: false, message: "Bad request!" });
                      });
                  var temp_assets_avaliable = await update_physical_asset
                    .findOne({
                      _id: temp_transferred_token.historical_update_physical_assets_id,
                    })
                    .catch((ex) => {
                      return res
                        .status(400)
                        .jsonp({ status: false, message: "Bad request!" });
                    });
                  var temp_tracer_avaliable = await update_tracer
                    .findOne({
                      _id: temp_transferred_token.historical_update_tracers_id,
                    })
                    .catch((ex) => {
                      loggerhandler.logger.error(
                        `${ex} ,email:${req.headers.email}`
                      );
                      return res
                        .status(400)
                        .jsonp({ status: false, message: "Bad request!" });
                    });
                  var temp_self_validation_avaliable =
                    await update_self_validation
                      .findOne({
                        _id: temp_transferred_token.historical_update_self_validations_id,
                      })
                      .catch((ex) => {
                        loggerhandler.logger.error(
                          `${ex} ,email:${req.headers.email}`
                        );
                        return res
                          .status(400)
                          .jsonp({ status: false, message: "Bad request!" });
                      });
                  var temp_company_compliances_avaliable =
                    await update_company_compliances
                      .findOne({
                        _id: temp_transferred_token.historical_update_company_compliances_id,
                      })
                      .catch((ex) => {
                        loggerhandler.logger.error(
                          `${ex} ,email:${req.headers.email}`
                        );
                        return res
                          .status(400)
                          .jsonp({ status: false, message: "Bad request!" });
                      });
                  var temp_transaction_history_avaliable =
                    await transaction_history
                      .findOne({
                        _id: temp_transferred_token.blochchain_transaction_history_id,
                      })
                      .catch((ex) => {
                        loggerhandler.logger.error(
                          `${ex} ,email:${req.headers.email}`
                        );
                        return res
                          .status(400)
                          .jsonp({ status: false, message: "Bad request!" });
                      });

                  // var temp_company_compliances_avaliable = await transaction_history.findOne({ _id: temp_transferred_token.historical_company_compliances_id }).catch((ex) => { return res.status(400).jsonp({ status: false, message: "Bad request!" }); })

                  var jsonObject = {
                    update_aw_tokens: temp_aw_token,
                    transferred_token: temp_transferred_token,
                    selected_update_aware_token_avaliable:
                      selected_update_aware_token_avaliable
                        ? selected_update_aware_token_avaliable
                        : null,
                    update_assets_avaliable: temp_assets_avaliable
                      ? temp_assets_avaliable
                      : null,
                    update_tracer_avaliable: temp_tracer_avaliable
                      ? temp_tracer_avaliable
                      : null,
                    update_self_validation_avaliable:
                      temp_self_validation_avaliable
                        ? temp_self_validation_avaliable
                        : null,
                    update_company_compliances_avaliable:
                      temp_company_compliances_avaliable
                        ? temp_company_compliances_avaliable
                        : null,
                    transaction_history_avaliable:
                      temp_transaction_history_avaliable
                        ? temp_transaction_history_avaliable
                        : null,
                    transaction_type: "transferred",
                    // "historical_data": h_assets_avaliable ? {'assets_avaliable': h_assets_avaliable, 'tracer_avaliable': h_tracer_avaliable, 'self_validation_avaliable' : h_self_validation_avaliable, 'company_compliances_avaliable': h_company_compliances_avaliable} : null
                  };
                }

                jsonData.push(jsonObject);
              }

              // console.log("jsonObject",jsonData)
            }

            // console.log("jsonData", jsonData)
            return res.status(200).jsonp({
              status: true,
              data: jsonData,
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

  getDetailsForSelfValidationCertificateAsync: async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).jsonp(errors.array());
    }
    // jvj
    else {
      if (
        !req.headers.userid ||
        !req.headers.username ||
        !req.headers.authorization ||
        !req.headers.awareid ||
        !req.headers.aware_token_id
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

            var account_details_avaliable = await account_details
              .findOne({ kyc_id: kyc_details_avaliable._id.toString() })
              .catch((ex) => {
                loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
                return res
                  .status(400)
                  .jsonp({ status: false, message: "Bad request!" });
              });

            var assets_avaliable = await physical_assets
              .findOne({
                _awareid: req.headers.awareid,
                aware_token_id: req.headers.aware_token_id,
              })
              .catch((ex) => {
                loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
                return res
                  .status(400)
                  .jsonp({ status: false, message: "Bad request!" });
              });

            var tracer_avaliable = await tracer
              .findOne({
                _awareid: req.headers.awareid,
                aware_token_id: req.headers.aware_token_id,
              })
              .catch((ex) => {
                loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
                return res
                  .status(400)
                  .jsonp({ status: false, message: "Bad request!" });
              });

            var self_validation_avaliable = await self_validation
              .findOne({
                _awareid: req.headers.awareid,
                aware_token_id: req.headers.aware_token_id,
              })
              .catch((ex) => {
                loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
                return res
                  .status(400)
                  .jsonp({ status: false, message: "Bad request!" });
              });

            var company_compliances_avaliable = await company_compliances
              .findOne({
                _awareid: req.headers.awareid,
                aware_token_id: req.headers.aware_token_id,
              })
              .catch((ex) => {
                loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
                return res
                  .status(400)
                  .jsonp({ status: false, message: "Bad request!" });
              });

            var role_details = await user_role
              .findOne({ role_id: Number(account_details_avaliable.role_id) })
              .catch((ex) => {
                loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
                return res
                  .status(400)
                  .jsonp({ status: false, message: "Bad request!" });
              });

            var full_name = "";

            if (self_validation_avaliable.sustainble_material.length > 0) {
              full_name =
                self_validation_avaliable?.sustainble_material?.slice(-1)[0]
                  .validateInfo?.fullname;
            } else {
              full_name = "N/A";
            }
            // if (!assets_avaliable || !tracer_avaliable || !self_validation_avaliable || !company_compliances_avaliable || !kyc_details_avaliable) {
            //   return res.status(200).jsonp({ status: true, data: null, authorization: resp.token });
            // }
            // else {
            return res.status(200).jsonp({
              status: true,
              data: {
                assets_avaliable: assets_avaliable,
                tracer_avaliable: tracer_avaliable,
                self_validation_avaliable: self_validation_avaliable,
                company_compliances_avaliable: company_compliances_avaliable,
                kyc_details_avaliable: kyc_details_avaliable,
                account_details_avaliable: account_details_avaliable,
                role_details: role_details,
                full_name: full_name,
              },
              authorization: resp.token,
            });

            // // if (!assets_avaliable || !tracer_avaliable || !self_validation_avaliable || !company_compliances_avaliable || !kyc_details_avaliable) {
            // //   return res.status(200).jsonp({ status: true, data: null, authorization: resp.token });
            // // }
            // // else {
            // return res.status(200).jsonp({ status: true, data: { "assets_avaliable": assets_avaliable, "tracer_avaliable": tracer_avaliable, "self_validation_avaliable": self_validation_avaliable, "company_compliances_avaliable": company_compliances_avaliable, "kyc_details_avaliable": kyc_details_avaliable, "account_details_avaliable": account_details_avaliable }, authorization: resp.token });
            // }
          } else {
            return res
              .status(resp.code)
              .jsonp({ status: false, data: null, authorization: null });
          }
        }
      );
    }
  },

  getPurchaseOrdersFromBrandAsync: async (req, res) => {
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
            try {
              const purchaseOrderDetailsAvailable = await purchase_order_details
                .find({
                  producer_aware_id: req.headers.awareid,
                  deleted: false,
                })
                .lean();
              const poIdList = purchaseOrderDetailsAvailable.map(
                (detail) => detail.po_id
              );

              const [productLinesAvailable, purchaseOrders] = await Promise.all(
                [
                  product_lines.find({
                    po_id: { $in: poIdList },
                    deleted: false,
                  }),
                  purchase_orders
                    .find({
                      _id: { $in: poIdList },
                      deleted: false,
                      hide: { $ne: true },
                      status: { $in: ["SEND", "FILLED"] },
                    })
                    .sort({ created_date: -1 }),
                ]
              );

              if (purchaseOrders.length === 0) {
                return res.status(200).jsonp({
                  status: true,
                  data: null,
                  authorization: resp.token,
                });
              }

              const data = purchaseOrders.map((order) => {
                const details = purchaseOrderDetailsAvailable.find(
                  (detail) => detail.po_id == order._id.toString()
                );
                const productLine = productLinesAvailable.find(
                  (line) => line.po_id == order._id.toString()
                );
                // const totalProductLine = productLine ? productLine.product_line.length : 0;

                let total_product_line =
                  productLine && productLine.product_line
                    ? productLine.product_line.filter(
                        (item) => item.deleted === false
                      ).length
                    : 0;

                return {
                  purchase_orders: order,
                  purchase_order_details_available: details || null,
                  total_product_line: total_product_line,
                };
              });
              console.log("data", data);

              return res
                .status(200)
                .jsonp({ status: true, data, authorization: resp.token });
            } catch (ex) {
              // loggerhandler.logger.error(`${ex}`);
              return res
                .status(400)
                .jsonp({ status: false, message: ex.message });
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

  getParticularPurchaseOrdersFromBrandAsync: async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).jsonp(errors.array());
    } else {
      if (
        !req.headers.userid ||
        !req.headers.username ||
        !req.headers.authorization ||
        !req.headers.awareid ||
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
            var purchase_order_details_avaliable = await purchase_order_details
              .findOne({
                producer_aware_id: req.headers.awareid,
                po_id: req.headers.po_id,
                deleted: false,
              })
              .catch((ex) => {
                loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
                return res
                  .status(400)
                  .jsonp({ status: false, message: "Bad request!" });
              });

            if (!purchase_order_details_avaliable) {
              return res
                .status(200)
                .jsonp({ status: true, data: null, authorization: resp.token });
            } else {
              return res.status(200).jsonp({
                status: true,
                data: purchase_order_details_avaliable,
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

  //Shivam chauhan

  // getProductLineFromBrandAsync: async (req, res) => {

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

  //         if (!product_lines_avaliable) {
  //           return res.status(200).jsonp({ status: true, data: null, authorization: resp.token });
  //         }
  //         else {
  //           return res.status(200).jsonp({ status: true, data: product_lines_avaliable, authorization: resp.token });

  //         }

  //       }
  //       else {
  //         return res.status(resp.code).jsonp({ status: false, data: null, authorization: null });
  //       }
  //     });

  //   }
  // },

  getProductLineFromBrandAsync: async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).jsonp(errors.array());
    } else {
      if (
        !req.headers.userid ||
        !req.headers.username ||
        !req.headers.authorization ||
        !req.headers.awareid ||
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
            // var product_lines_avaliable = await product_lines.findOne({
            //   _awareid: req.headers.awareid,
            //   po_id: req.headers.po_id,
            //   deleted: false,
            //   'product_line.deleted': false,
            //   // product_line: { $elemMatch: { deleted: false } }
            // });

            var product_lines_avaliable = await product_lines
              .findOne({
                _awareid: req.headers.awareid,
                po_id: req.headers.po_id,
                deleted: false,
                "product_line.deleted": false,
              })
              .catch((ex) => {
                loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
                return res
                  .status(400)
                  .jsonp({ status: false, message: "Bad request!" });
              });

            console.log("product_lines_avaliable", product_lines_avaliable);
            if (!product_lines_avaliable) {
              return res
                .status(200)
                .jsonp({ status: true, data: null, authorization: resp.token });
            }

            let product = product_lines_avaliable.toObject();

            // Fetch and add historical tokens to product lines if available
            await Promise.all(
              product.product_line.map(async (e) => {
                if (e.update_aware_token_id) {
                  try {
                    let transferred_tokens_available = await transferred_tokens
                      .findOne({
                        historical_update_aware_token_id:
                          e.update_aware_token_id,
                      })
                      .catch((ex) => {
                        loggerhandler.logger.error(
                          `${ex} ,email:${req.headers.email}`
                        );
                        return res
                          .status(400)
                          .jsonp({ status: false, message: "Bad request!" });
                      });
                    e.historical_send_aw_tokens_id =
                      transferred_tokens_available?.historical_send_aw_tokens_id;
                  } catch (error) {
                    console.error("Error fetching transferred tokens:", error);
                  }
                }
              })
            );
            console.log("product.product_line", product);

            // Filter product_line where deleted is false
            let final_data = {
              ...product, // Spread the existing product data to maintain other fields like _id, _awareid, etc.
              product_line: product.product_line.filter(
                (item) => item.deleted == false
              ), // Filter product_line where deleted is false
            };

            // console.log("final_data1", final_data, final_data.length);
            console.log(
              "final_data.length2",
              typeof final_data,
              final_data.length
            );

            return res.status(200).jsonp({
              status: true,
              data: final_data,
              authorization: resp.token,
            });
            // else {
            //   return res.status(200).jsonp({ status: true, data: product_lines_avaliable, authorization: resp.token });
            // }
          } else {
            return res
              .status(resp.code)
              .jsonp({ status: false, data: null, authorization: null });
          }
        }
      );
    }
  },

  getWalletExportAsync: async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).jsonp(errors.array());
    } else {
      const exemptedEmails = await exempted_email.find({});
      const emails = exemptedEmails.map((account) => account.email);

      // Fetch accounts available
      var accounts_avaliable = await account_details.find({
        is_deleted: { $ne: true },
        role_id: { $ne: 1 },
        email: { $nin: emails },
      });
      var kyc_ids = accounts_avaliable.map((account) => account.kyc_id);

      // Fetch KYC details
      var kyc_Details = await kyc_details.find({
        _id: { $in: kyc_ids },
        is_deleted: { $ne: true },
      });
      var aware_ids = kyc_Details.map((kyc) => kyc.aware_id);

      var [
        aw_tokens_found,
        update_aw_tokens_found,
        transferred_tokens_avaliable,
        roles,
      ] = await Promise.all([
        aw_tokens.find({
          _awareid: { $in: aware_ids },
          hide_flag: { $ne: true },
        }),
        update_aw_tokens.find({ _awareid: { $in: aware_ids } }),
        transferred_tokens.find({ _awareid: { $in: aware_ids } }),
        user_role.find({}),
      ]);

      var dataset = [];
      kyc_Details.forEach((kyc) => {
        const account_found = accounts_avaliable.find(
          (x) => x.kyc_id == kyc._id
        );
        const type_of_producer = roles.find(
          (x) => x.role_id == account_found.role_id
        ).role_name;

        const retrived_aw_tokens = aw_tokens_found.filter(
          (x) => x._awareid == kyc.aware_id
        );
        const retrived_update_aw_tokens = update_aw_tokens_found.filter(
          (x) => x._awareid == kyc.aware_id
        );
        const retrived_transferred_tokens_avaliable =
          transferred_tokens_avaliable.filter(
            (x) => x._awareid == kyc.aware_id
          );

        const tokenTypes = ["Pellet", "Fiber", "Yarn", "Fabric", "Product"];

        const tokenCounts = tokenTypes.reduce((acc, tokenType) => {
          acc[tokenType] = 0;
          [
            retrived_aw_tokens,
            retrived_update_aw_tokens,
            retrived_transferred_tokens_avaliable,
          ].forEach((tokenList) => {
            tokenList.forEach((item) => {
              if (
                tokenType === "Product" &&
                item.type_of_token === "Final product"
              ) {
                acc[tokenType] += item.avaliable_tokens;
              } else if (item.type_of_token === tokenType) {
                acc[tokenType] += item.avaliable_tokens;
              }
            });
          });
          return acc;
        }, {});

        if (kyc.aware_id) {
          dataset.push({
            aware_id: kyc.aware_id,
            company_name: kyc.company_name,
            type_of_producer,
            ...tokenCounts,
          });
        }
      });

      return res.status(200).jsonp({ status: true, data: { dataset } });
    }
  },

  getParticularProducerAllSentTokenAsync: async (req, res) => {
    try {
      const { awareid } = req.headers;
      console.log({ awareid });
      const exemptedEmails = (await exempted_email.find({}, "email")).map(
        ({ email }) => email
      );

      const kycDetails = (
        await account_details.find(
          { role_id: { $ne: 1 }, email: { $nin: exemptedEmails } },
          "kyc_id"
        )
      ).map(({ kyc_id }) => mongoose.Types.ObjectId(kyc_id));

      const kycDetailsData = (
        await kyc_details.find(
          { _id: { $in: kycDetails }, aware_id: { $exists: true } },
          "aware_id company_name"
        )
      ).filter((ele) => ele.aware_id);

      const transferred_tokens_Data = await transferred_tokens.find({
        $or: [{ _awareid: awareid }, { historical_awareid: awareid }],
      });

      const combinedTokens = await Promise.all(
        transferred_tokens_Data.map(
          async ({
            historical_update_aware_token_id,
            historical_aware_token_id,
            type_of_token,
            total_tokens,
            historical_awareid,
            _awareid,
            created_date,
          }) => {
            let check = kycDetailsData.find(
              (ele) =>
                ele.aware_id == historical_awareid || ele.aware_id == _awareid
            );

            if (check && type_of_token && total_tokens) {
              return {
                token_type: type_of_token,
                token_sent: total_tokens,
                token_sent_by: kycDetailsData.find(
                  (ele) => ele.aware_id == historical_awareid
                )?.company_name,
                sender_id: kycDetailsData.find(
                  (ele) => ele.aware_id == historical_awareid
                )?.aware_id,
                token_sent_on: created_date,
                token_sent_to: kycDetailsData.find(
                  (ele) => ele.aware_id == _awareid
                )?.company_name,
                recevier_id: kycDetailsData.find(
                  (ele) => ele.aware_id == _awareid
                )?.aware_id,
                aware_token_id: historical_aware_token_id || "",
                update_aware_token_id: historical_update_aware_token_id || "",
              };
            }
          }
        )
      );

      const filteredTokens = combinedTokens.flat().filter((token) => token);
      return res
        .status(200)
        .jsonp({ status: true, message: "fetched", data: filteredTokens });
    } catch (error) {
      return res
        .status(500)
        .jsonp({ status: false, message: "Internal Server Error." });
    }
  },

  traceabilityReport: async (req, res) => {
    try {
      // Validate token ID in request headers
      if (!req.headers.token_id) {
        return res
          .status(400)
          .jsonp({ status: false, message: "Token ID is required" });
      }
  
      const sendtokenId = req.headers.token_id;
      const selectedTokenId = req.headers.selected_token_id;
      console.log("token", req.headers.token_id);
  
      // Get receiver data for the token
      const receiverData = await getReceiverData(sendtokenId);
  
      if (!receiverData.success) {
        return res
          .status(400)
          .jsonp({ status: false, message: receiverData.message });
      }
  
      // Initialize array to store all tree data
      const allTreesData = [];
      const flattenedData = [];
  
      // Process each token in the selected_tokens array
      if (
        receiverData.data.selected_aware_token &&
        receiverData.data.selected_aware_token.selected_tokens &&
        receiverData.data.selected_aware_token.selected_tokens.length > 0
      ) {
        let cnt = 0;
        // Process each token in the array one by one
        for (const selectedToken of receiverData.data.selected_aware_token.selected_tokens) {
          if(selectedToken._id.toString() === selectedTokenId.toString()) {
              const tokenId = selectedToken.aware_token_id 
              ? selectedToken.aware_token_id 
              : selectedToken.update_aware_token_id;
            
              if (tokenId) {
                // Build traceability tree for this token
                const hierarchicalData = await buildTraceabilityTree(tokenId);
                allTreesData.push(hierarchicalData);
                
                // Flatten this tree and add to the overall flattened data
                flattenTree(hierarchicalData, flattenedData);
            }
            cnt++;
          }

          if(cnt === 1) break;
        }
      }

      flattenedData.forEach(item=> {
        console.log("item tokenId", item.tokenId);
        console.log("item level", item.level);
      })

      const tokenIdMap = new Map();
      flattenedData.forEach(item => {
        if (item.tokenId.toString() && !tokenIdMap.has(item.tokenId.toString())) {
          tokenIdMap.set(item.tokenId.toString(), item);
        }
      });

      // Convert the Map values back to an array
      const uniqueFlattenedData = Array.from(tokenIdMap.values());

      // Sort the flattened data by level
      uniqueFlattenedData.sort((a, b) => a.level - b.level);

      const levelZeroData = {
        kycDetails: receiverData.data.kycDetails,
        level : 0
      }

      // Add receiver data as the root
      uniqueFlattenedData.unshift(levelZeroData);

      // Add the key transactionCertificate and proofOfDelivery of receiverData.data  into the uniqueFlattenedData array of level 1.
      uniqueFlattenedData.forEach(item => {
        if (item.level === 1) {
          item.transactionCertificate = receiverData.data.transactionCertificate;
          item.proofOfDelivery = receiverData.data.proofOfDelivery;
        }
      }
      );

      // Add transferredToken to level 1 items
      uniqueFlattenedData.forEach(item => {
        if (item.level === 1) {
          // Filter the transferredTokens array to find matching tokens
          item.transferredToken = receiverData.data.transferredTokens.find(token => 
            (token.historical_update_aware_token_id && token.historical_update_aware_token_id.toString() === item.tokenId.toString()) ||
            (token.historical_aware_token_id && token.historical_aware_token_id.toString() === item.tokenId.toString())
          );
        }
      });
      
      return res.status(200).jsonp({
        status: true,
        data: uniqueFlattenedData,
      });
    } catch (error) {
      console.error("Error fetching token by blockchain ID:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch token data",
        error: error.message,
      });
    }
  },

  getHelloAsync: async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).jsonp(errors.array());
    } else {
      // const response = await transaction_history.aggregate({
      //   $match: {
      //     createdAt: {
      //       $gte: new Date("2016-01-01")
      //     }
      //   }
      // }, {
      //   $group: {
      //     _id: {
      //       "year":  { "$year": "$createdAt" },
      //       "month": { "$month": "$createdAt" },
      //       "day":   { "$dayOfMonth": "$createdAt" }
      //     },
      //     count:{$sum: 1}
      //   }
      // }).exec(function(err,data){
      //   if (err) {
      //     console.log('Error Fetching model');
      //     console.log(err);
      //   } else {
      //     console.log(data);
      //   }
      // });
      // console.log("response",response)
      // const exemptedEmails = await exempted_email.find({});
      // const emails = exemptedEmails.map((account) => account.email);
      // // Fetch accounts available
      // var accounts_avaliable = await account_details.find({ is_deleted: { $ne: true }, role_id: { $ne: 1 }, email: { $nin: emails } });
      // var kyc_ids = accounts_avaliable.map((account) => account.kyc_id);
      // // Fetch KYC details
      // var kyc_Details = await kyc_details.find({ _id: { $in: kyc_ids }, is_deleted: { $ne: true } });
      // var aware_ids = kyc_Details.map((kyc) => kyc.aware_id);
      // var [
      //   aw_tokens_found,
      //   update_aw_tokens_found,
      //   transferred_tokens_avaliable,
      //   transaction_history_avalible,
      //   roles,
      // ] = await Promise.all([
      //   aw_tokens.find({ _awareid: { $in: aware_ids }, hide_flag: { $ne: true } }),
      //   update_aw_tokens.find({ _awareid: { $in: aware_ids } }),
      //   transferred_tokens.find({ _awareid: { $in: aware_ids } }),
      //   transaction_history.find({ _awareid: { $in: aware_ids } }),
      //   user_role.find({}),
      // ]);
      // console.log("aw_tokens_found", aw_tokens_found.length)
      // // console.log("roles",roles)
      // var dataset = [];
      // kyc_Details.forEach((kyc) => {
      //   var account_found = accounts_avaliable.find((x) => x.kyc_id == kyc._id);
      //   if (account_found) {
      //     const type_of_producer = roles.find((x) => x.role_id == account_found.role_id).role_name;
      //     var t1 = [];
      //     var t2 = [];
      //     var t3 = [];
      //     var retrived_aw_tokens = aw_tokens_found.filter((x) => x._awareid == kyc.aware_id).map((y) => y._id);
      //     if (retrived_aw_tokens.length > 0) {
      //       const ft1 = transaction_history_avalible.filter((transaction) =>
      //         retrived_aw_tokens.includes(mongoose.Types.ObjectId(transaction.aware_token_id))
      //       );
      //       // t1.push(ft1)
      //       console.log("t1", ft1.length);
      //     }
      //     const retrived_update_aw_tokens = update_aw_tokens_found.filter((x) => x._awareid == kyc.aware_id).map((y) => y._id);
      //     if (retrived_update_aw_tokens.length > 0) {
      //       t1 = transaction_history_avalible.filter((transaction) =>
      //         retrived_update_aw_tokens.includes(transaction.update_aware_token_id)
      //       );
      //     }
      //     const retrived_transferred_tokens_avaliable = transferred_tokens_avaliable.filter((x) => x._awareid == kyc.aware_id);
      //     if (retrived_transferred_tokens_avaliable.length > 0) {
      //       // t3 = transaction_history_avalible.find((x) => x.update_aware_token_id == retrived_transferred_tokens_avaliable._id.toString());
      //       t3 = transaction_history_avalible.filter((transaction) =>
      //         retrived_transferred_tokens_avaliable.includes(transaction.update_aware_token_id)
      //       );
      //     }
      //     if (kyc.aware_id) {
      //       dataset.push({
      //         company_name: kyc.company_name,
      //         type_of_producer,
      //         t1,
      //         t2, t3
      //       });
      //     }
      //   }
      // });
      // return res.status(200).jsonp({ status: true, data: { dataset } });
    }
  },
};

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function flattenTree(node, flattenedData, level = 1) {
  if (!node) return;

  // Create a copy of the node without the children property
  const { children, ...nodeWithoutChildren } = node;

  // Add level indicator to the node
  const flatNode = {
    ...nodeWithoutChildren,
    level,
  };

  // Add the node to our flattened array
  flattenedData.push(flatNode);

  // Process all children
  if (children && Array.isArray(children)) {
    children.forEach((child) => flattenTree(child, flattenedData, level + 1));
  }
}

async function getReceiverData(tokenId) {
  try {
    // Get the send_aw_tokens record
    const sendAwToken = await send_aw_tokens.findOne({
      _id: mongoose.Types.ObjectId(tokenId),
    });

    if (!sendAwToken) {
      return { success: false, message: "Token not found" };
    }

    if(sendAwToken.status.toUpperCase() === "CONCEPT") {
      return { success: false, message: "Token has CONCEPT status" };
    }

    // Get the selected_aware_token data - this contains the tokens we need
    const selectedAwareToken = await selected_aware_token.findOne({
      send_aware_token_id: tokenId,
    });

    if (!selectedAwareToken) {
      return { success: false, message: "No selected aware token data found" };
    }

    // Ensure we have selected tokens
    if (!selectedAwareToken.selected_tokens || selectedAwareToken.selected_tokens.length === 0) {
      return { success: false, message: "No selected tokens found" };
    }

    // Get the selected_receiver data if needed for context
    const selectedReceiver = await selected_receiver.findOne({
      send_aware_token_id: tokenId,
    });

    // Get basic KYC details if receiver exists
    let receiverKycDetails = null;
    if (selectedReceiver && selectedReceiver._receiver_awareid) {
      receiverKycDetails = await kyc_details.findOne({
        aware_id: selectedReceiver._receiver_awareid,
      });
    }

    let transactionCertificateData = await selected_transaction_certificates.findOne({
      send_aware_token_id: tokenId,
    });

    let proofOfDeliveryData = await selected_proof_of_delivery.findOne({
      _send_aware_token_id: tokenId,
    });

    let transferredTokensData = await transferred_tokens.find({
      historical_send_aw_tokens_id: tokenId,
    });

    console.log("transferredTokensData", transferredTokensData);

    // Combine the required data
    return {
      success: true,
      data: {
        send_aw_token: sendAwToken,
        selected_aware_token: selectedAwareToken,
        selected_receiver: selectedReceiver,
        transactionCertificate: transactionCertificateData,
        proofOfDelivery: proofOfDeliveryData,
        kycDetails: receiverKycDetails,
        transferredTokens: transferredTokensData,
        level: 0,
      }
    };
  } catch (error) {
    console.error("Error in getReceiverData:", error);
    loggerhandler.logger.error(`Error in getReceiverData: ${error.message}`);

    return {
      success: false,
      message: "Failed to retrieve receiver data",
      error: error.message,
    };
  }
}

async function buildTraceabilityTree(tokenId, depth = 0, maxDepth = 3, transferredToken = null) {
  // Prevent infinite recursion
  if (depth >= maxDepth) {
    return null;
  }

  try {
    // Try to find token in aw_tokens first
    let tokenData = await aw_tokens.findOne({
      _id: mongoose.Types.ObjectId(tokenId),
    });
    let isUpdateToken = false;
    let assetData = null;
    let transactionHistory = null;
    let tracerData = null;
    let companyComplianceData = null;
    let selfValidationData = null;
    let transactionCertificateData = null;
    let proofOfDeliveryData = null;

    // If not found in aw_tokens, try update_aw_tokens
    if (!tokenData) {
      tokenData = await update_aw_tokens.findOne({
        _id: mongoose.Types.ObjectId(tokenId),
      });
      isUpdateToken = true;

      if (!tokenData) {
        throw new Error(
          `Token with ID ${tokenId} not found in either collection`
        );
      }
    }

    const kycDetailsData = await kyc_details.findOne({
      aware_id: tokenData._awareid,
    });


    // Get physical asset data
    if (isUpdateToken) {
      assetData = await update_physical_asset.findOne({
        update_aware_token_id: tokenId,
      });

      transactionHistory = await transaction_history.findOne({
        _awareid: tokenData._awareid,
        update_aware_token_id: tokenId,
      });

      tracerData = await update_tracer.findOne({
        update_aware_token_id: tokenId
      })

      companyComplianceData = await update_company_compliances.findOne({
        update_aware_token_id: tokenId
      })

      selfValidationData = await update_self_validation.findOne({
        update_aware_token_id: tokenId
      })
   
    } else {
      assetData = await physical_assets.findOne({
        aware_token_id: tokenId,
      });

      transactionHistory = await transaction_history.findOne({
        _awareid: tokenData._awareid,
        aware_token_id: tokenId,
      });

      tracerData = await update_tracer.findOne({
        aware_token_id: tokenId
      });

      companyComplianceData = await company_compliances.findOne({
        aware_token_id: tokenId
      });

      selfValidationData = await self_validation.findOne({
        aware_token_id: tokenId
      });

    }

    let receiverTransactionHistory = {};
    if(transferredToken && transferredToken.linked_transaction_history_id) {
      receiverTransactionHistory = await transaction_history.findOne({
        _id: mongoose.Types.ObjectId(transferredToken.linked_transaction_history_id),
      });
    }

    if(depth !== 0) {

      if(transferredToken && transferredToken.historical_selected_transaction_certificates_id !== null) {
        transactionCertificateData = await selected_transaction_certificates.findOne({
          _id: transferredToken.historical_selected_transaction_certificates_id,
        });
      }
  
      if(transferredToken && transferredToken.historical_selected_proof_of_deliveries_id !== null) {
        proofOfDeliveryData = await selected_proof_of_delivery.findOne({
          _id: transferredToken.historical_selected_proof_of_deliveries_id,
        });
      }
    }

    // Process transferred tokens as children 
    const transferredTokensData = [];
    
    // Check if assetData and assetdataArrayMain exist
    if (assetData && assetData.assetdataArrayMain && Array.isArray(assetData.assetdataArrayMain)) {
      // Process each item in assetdataArrayMain
      for (const assetItem of assetData.assetdataArrayMain) {
        if (assetItem.tt_id) {
          // Find the transferred token using tt_id
          const transferredToken = await transferred_tokens.findOne({
            _id: mongoose.Types.ObjectId(assetItem.tt_id)
          });
          
          if (transferredToken) {
            // Determine which token ID to use based on token_base_type
            let historicalTokenId = null;
            
            if (transferredToken.token_base_type === 'initiated') {
              historicalTokenId = transferredToken.historical_aware_token_id;
            } else if (transferredToken.token_base_type === 'updated') {
              historicalTokenId = transferredToken.historical_update_aware_token_id;
            }
            
            // If we have a valid historical token ID, build its tree
            if (historicalTokenId) {
              const historicalTokenData = await buildTraceabilityTree(
                historicalTokenId,
                depth + 1,
                maxDepth,
                transferredToken // Pass the transferredToken to include it in the child node
              );
              
              if (historicalTokenData) {
                transferredTokensData.push(historicalTokenData);
              }
            } else {
              // Add the transferred token as a leaf node if no historical token ID
              transferredTokensData.push({
                transferredToken,
                level: depth + 1,
                children: []
              });
            }
          }
        }
      }
    }

    const result = {
      tokenId: tokenId,
      tokenType: isUpdateToken ? "update_token" : "create_token",
      token: tokenData,
      asset: assetData,
      transactionHistory: transactionHistory,
      receiverTransactionHistory: receiverTransactionHistory,
      kycDetails: kycDetailsData,
      tracer: tracerData,
      companyCompliance: companyComplianceData,
      selfValidation: selfValidationData,
      children: transferredTokensData, // Include transferred tokens as children
    };
    
    
    // Only include transferredToken if it was provided
    if (transferredToken) {
      result.transferredToken = transferredToken;
    }

    if(depth !== 0) {
      result.transactionCertificate = transactionCertificateData;
      result.proofOfDelivery = proofOfDeliveryData;
    }

    // Add level as the last property to ensure it appears at the end
    result.level = depth;
    
    return result;
  } catch (error) {
    console.error(
      `Error building traceability tree for token ${tokenId} at depth ${depth}:`,
      error
    );
    loggerhandler.logger.error(
      `Error in buildTraceabilityTree: ${error.message}`
    );

    return {
      tokenId: tokenId,
      error: error.message,
      level: depth,
      children: [],
    };
  }
}


// function AWARE_TOKEN_BY_ID(id) {
//   return gql`
//   {
//     awareToken(id:"${id.toString()}") {
//       id,
//       owner {
//         id
//       },
//       creator {
//         id
//       },
//       contentURI,
//       metadataURI,
//       amount,
//       createdAtTimestamp
//     }
//   }
//   `;
// }

// async function getTokenByBlockchainIdAsync(blockchainId) {
//   try {
//     if (!blockchainId) {
//       throw new Error("Blockchain ID is required");
//     }

//     // GraphQL query to fetch token data
//     const result = await request(
//       process.env.SUBGRAPH_URL,
//       AWARE_TOKEN_BY_ID(blockchainId)
//     );

//     if (!result || !result.awareToken) {
//       throw new Error("Token not found");
//     }

//     // Update URI if needed
//     const updatedURI = result.awareToken.metadataURI.includes(
//       "https://storageapi.fleek.co"
//     )
//       ? result.awareToken.metadataURI.replace(
//           "https://storageapi.fleek.co",
//           "https://storage.wearaware.co"
//         )
//       : result.awareToken.metadataURI;

//     // Fetch metadata
//     const metadata = await axios.get(updatedURI);

//     return {
//       success: true,
//       data: result.awareToken,
//       metadata: metadata.data,
//     };
//   } catch (error) {
//     console.error("Error fetching token by blockchain ID:", error);
//     return {
//       success: false,
//       message: "Failed to fetch token data",
//       error: error.message,
//     };
//   }
// }



// kyc_Details.forEach((kyc) => {

//   const account_found = accounts_avaliable.find(x => x.kyc_id == kyc._id);

//   const type_of_producer = roles.find(x => x.role_id == account_found.role_id).role_name;

//   const retrived_aw_tokens = aw_tokens_found.filter((x) => x._awareid == kyc.aware_id);

//   const retrived_update_aw_tokens = update_aw_tokens_found.filter(x => x._awareid == kyc.aware_id);

//   const retrived_transferred_tokens_avaliable = transferred_tokens_avaliable.filter(x => x._awareid == kyc.aware_id);

//   var Pellet = 0, Fiber = 0, Yarn = 0, Fabric = 0, Product = 0; Final_product = 0;
//   retrived_aw_tokens.filter((item) => {
//     if (item.type_of_token === 'Pellet') {
//       Pellet = Pellet + item.avaliable_tokens;
//     }
//     else if (item.type_of_token === 'Fiber') {
//       Fiber = Fiber + item.avaliable_tokens;
//     }
//     else if (item.type_of_token === 'Yarn') {
//       Yarn = Yarn + item.avaliable_tokens;
//     }
//     else if (item.type_of_token === 'Fabric') {
//       Fabric = Fabric + item.avaliable_tokens;
//     }
//     else if (item.type_of_token === 'Product') {
//       Product = Product + item.avaliable_tokens;
//     }
//     else if (item.type_of_token === 'Final product') {
//       Product = Product + item.avaliable_tokens;
//     }
//   });

//   retrived_update_aw_tokens.filter((item) => {
//     if (item.type_of_token === 'Pellet') {
//       Pellet = Pellet + item.avaliable_tokens;
//     }
//     else if (item.type_of_token === 'Fiber') {
//       Fiber = Fiber + item.avaliable_tokens;
//     }
//     else if (item.type_of_token === 'Yarn') {
//       Yarn = Yarn + item.avaliable_tokens;
//     }
//     else if (item.type_of_token === 'Fabric') {
//       Fabric = Fabric + item.avaliable_tokens;
//     }
//     else if (item.type_of_token === 'Product') {
//       Product = Product + item.avaliable_tokens;
//     }
//     else if (item.type_of_token === 'Final product') {
//       Product = Product + item.avaliable_tokens;
//     }
//   });

//   retrived_transferred_tokens_avaliable.filter((item) => {
//     if (item.type_of_token === 'Pellet') {
//       Pellet = Pellet + item.avaliable_tokens;
//     }
//     else if (item.type_of_token === 'Fiber') {
//       Fiber = Fiber + item.avaliable_tokens;
//     }
//     else if (item.type_of_token === 'Yarn') {
//       Yarn = Yarn + item.avaliable_tokens;
//     }
//     else if (item.type_of_token === 'Fabric') {
//       Fabric = Fabric + item.avaliable_tokens;
//     }
//     else if (item.type_of_token === 'Product') {
//       Product = Product + item.avaliable_tokens;
//     }
//     else if (item.type_of_token === 'Final product') {
//       Product = Product + item.avaliable_tokens;
//     }
//   });

//   if (kyc.aware_id) dataset.push({ "company_name": kyc.company_name, type_of_producer, Pellet, Fiber, Yarn, Fabric, Fabric, Product })

// });
