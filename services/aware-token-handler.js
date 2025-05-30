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
        async function (resp) {
          if (resp.status == true) {
            var compositionstring = "";

            var arr = req.body.compositionArrayMain;

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

            var aware_asset_id = `${req.body._awareid_t} - ${req.body.aware_token_type_t} - ${req.body.material_specs_t} - ${compositionstring} - ${req.body.main_color_t} - ${req.body.production_lot_t}`;

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
                  sustainable_processing_location:
                    req.body.sustainable_processing_location,
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
                  sustainable_processing_location:
                    req.body.sustainable_processing_location,
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

                  await aw_tokens
                    .findOneAndUpdate(
                      {
                        _awareid: req.body._awareid_t,
                        _id: mongoose.Types.ObjectId(req.body.aware_token_id),
                      },
                      {
                        create_token_stepper: 2,
                        type_of_token: req.body.aware_token_type_t,
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
        async function (resp) {
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

  storeProductionAddressAsync: async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res
        .status(422)
        .jsonp({ status: false, message: "Bad payload received." });
    } else {
      if (!req.headers.kyc_id) {
        return res
          .status(400)
          .jsonp({ status: false, message: "kyc_id is required in headers" });
      }

      const {
        address_line_one,
        address_line_two,
        country,
        state,
        city,
        zipcode,
      } = req.body;

      let address = "";
      if (address_line_one && address_line_one !== "") {
        address = address + address_line_one.trim();
      }
      if (address_line_two && address_line_two !== "") {
        address = address + ", " + address_line_two.trim();
      }
      if (city && city !== "") {
        address = address + ", " + city.trim();
      }
      if (state && state !== "") {
        address = address + ", " + state.trim();
      }
      if (zipcode && zipcode !== "") {
        address = address + " " + zipcode.trim();
      }
      if (country && country !== "") {
        address = address + ", " + country.trim();
      }

      var payload = { username: req.headers.username };
      refresh(
        req.headers.authorization,
        req.headers.userid,
        payload,
        async function (resp) {
          if (resp.status == true) {
            try {
              const kycDetails = await kyc_details.findOneAndUpdate(
                { _id: mongoose.Types.ObjectId(req.headers.kyc_id) },
                {
                  $push: {
                    geo_location: {
                      address: address,
                      city: city || null,
                      state: state || null,
                      country: country || null,
                    },
                  },
                },
                { new: true }
              );

              if (!kycDetails) {
                return res.status(404).jsonp({
                  status: false,
                  message: "KYC details not found",
                  authorization: resp.token,
                });
              }

              return res.status(200).jsonp({
                status: true,
                message: "Production address has been successfully added.",
                authorization: resp.token,
              });
            } catch (err) {
              loggerhandler.logger.error(`${err}, email:${req.headers.email}`);
              return res
                .status(500)
                .jsonp({ status: false, message: err.toString() });
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
              const escapedSearchTerm = escapeRegExp(searchTerm);

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

              const orConditions = [...fieldConditions, addressSearchCondition];

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
        async function (resp) {
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

                  await aw_tokens
                    .findOneAndUpdate(
                      {
                        _awareid: req.body._awareid,
                        _id: mongoose.Types.ObjectId(req.body.aware_token_id),
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

                  await aw_tokens
                    .findOneAndUpdate(
                      {
                        _awareid: req.body._awareid,
                        _id: mongoose.Types.ObjectId(req.body.aware_token_id),
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

        await aw_tokens
          .findOneAndUpdate(
            {
              _awareid: req.body._awareid,
              _id: mongoose.Types.ObjectId(req.body.aware_token_id),
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

        await aw_tokens
          .findOneAndUpdate(
            {
              _awareid: req.body._awareid,
              _id: mongoose.Types.ObjectId(req.body.aware_token_id),
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

        await aw_tokens
          .findOneAndUpdate(
            {
              _awareid: req.body._awareid,
              _id: mongoose.Types.ObjectId(req.body.aware_token_id),
            },
            { create_token_stepper: 3, status: "CONCEPT" },
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

  createTracerAsync: async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res
        .status(422)
        .jsonp({ status: false, message: "Bad payload received." });
    }

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
      if (!req.headers.awareid || !req.headers.aware_token_id) {
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
            _id: kyc_details_avaliable.created_by.toString(),
          })
          .select("first_name last_name role_id email");

        const email = account_details_avaliable.email;

        const assets_avaliable = await physical_assets
          .findOne({
            _awareid: req.headers.awareid,
            aware_token_id: req.headers.aware_token_id,
          })
          .catch((ex) => {
            loggerhandler.logger.error(`${ex} ,email:${email}`);
            return res
              .status(400)
              .jsonp({ status: false, message: "Bad request!" });
          });

        const tracer_avaliable = await tracer
          .findOne({
            _awareid: req.headers.awareid,
            aware_token_id: req.headers.aware_token_id,
          })
          .catch((ex) => {
            loggerhandler.logger.error(`${ex} ,email:${email}`);
            return res
              .status(400)
              .jsonp({ status: false, message: "Bad request!" });
          });

        const self_validation_avaliable = await self_validation
          .findOne({
            _awareid: req.headers.awareid,
            aware_token_id: req.headers.aware_token_id,
          })
          .catch((ex) => {
            loggerhandler.logger.error(`${ex} ,email:${email}`);
            return res
              .status(400)
              .jsonp({ status: false, message: "Bad request!" });
          });

        const company_compliances_avaliable = await company_compliances
          .findOne({
            _awareid: req.headers.awareid,
            aware_token_id: req.headers.aware_token_id,
          })
          .catch((ex) => {
            loggerhandler.logger.error(`${ex} ,email:${email}`);
            return res
              .status(400)
              .jsonp({ status: false, message: "Bad request!" });
          });

        const aw_tokens_avaliable = await aw_tokens
          .findOne({
            _awareid: req.headers.awareid,
            _id: req.headers.aware_token_id,
          })
          .populate("reviewedBy")
          .catch((ex) => {
            loggerhandler.logger.error(`${ex} ,email:${email}`);
            return res
              .status(400)
              .jsonp({ status: false, message: "Bad request!" });
          });

        const awareTokenId = aw_tokens_avaliable._id;

        const transaction_history_data = await transaction_history.findOne({
          aware_token_id: awareTokenId,
        });

        let transferred_data = [];

        const selectedAwareTokens = await selected_aware_token.find({
          selected_tokens: {
            $elemMatch: {
              aware_token_id: awareTokenId,
            },
          },
        });

        for (let i = 0; i < selectedAwareTokens.length; i++) {
          if (
            !selectedAwareTokens[i].selected_tokens ||
            selectedAwareTokens[i].selected_tokens.length === 0
          ) {
            continue;
          }

          const selectedReceiver = await selected_receiver.findOne({
            send_aware_token_id: selectedAwareTokens[i].send_aware_token_id,
          });

          if (!selectedReceiver) {
            continue;
          }

          const kycDetailsData = await kyc_details
            .findOne({
              aware_id: selectedReceiver._receiver_awareid,
            })
            .select("company_name");

          if (!kycDetailsData) {
            continue;
          }

          for (
            let j = 0;
            j < selectedAwareTokens[i].selected_tokens.length;
            j++
          ) {
            const token = selectedAwareTokens[i].selected_tokens[j];

            if (
              token.aware_token_id &&
              token.aware_token_id.toString() === awareTokenId.toString()
            ) {
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

        if (
          !assets_avaliable ||
          !tracer_avaliable ||
          !self_validation_avaliable ||
          !company_compliances_avaliable ||
          !kyc_details_avaliable
        ) {
          return res.status(200).jsonp({ status: true, data: null });
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
                _id: transaction_history_data?._id,
                aware_token_id: transaction_history_data?.aware_token_id,
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
          .status(400)
          .jsonp({ status: false, message: "Bad request!" });
      }
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

            var jsonData = [];

            if (aw_tokens_avaliable.length <= 0) {
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
            }

            if (update_aw_tokens_avaliable.length <= 0) {
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
            }

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
            const pipeline = [
              { $match: statusMatch },

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

              {
                $unset: [
                  "aw_tokens.physical_asset",
                  "aw_tokens.kyc_detail",
                  "aw_tokens.assets_available",
                  "aw_tokens.kyc_details_available",
                ],
              },

              {
                $sort: {
                  "assets_available.created_date": -1,
                },
              },

              {
                $facet: {
                  metadata: [{ $count: "total" }],
                  data: [{ $skip: skip }, { $limit: limit }],
                },
              },
            ];

            const aggregationResult = await aw_tokens
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

            const pipeline = [
              { $match: combinedMatch },

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

              {
                $unset: [
                  "aw_tokens.physical_asset",
                  "aw_tokens.kyc_detail",
                  "aw_tokens.assets_available",
                  "aw_tokens.kyc_details_available",
                ],
              },

              {
                $sort: {
                  "assets_available.created_date": -1,
                },
              },

              {
                $facet: {
                  metadata: [{ $count: "total" }],
                  data: [{ $skip: skip }, { $limit: limit }],
                },
              },
            ];

            const aggregationResult = await aw_tokens
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
            let aw_token = await aw_tokens.findOne({
              _awareid: req.body._awareid,
              _id: mongoose.Types.ObjectId(req.body.aware_token_id),
            });

            if (aw_token && aw_token.status.toLowerCase() === "send") {
              return res.status(401).jsonp({
                status: true,
                message: "Token request already submitted by another sub-user.",
                isLocked: true,
                authorization: resp.token,
              });
            }

            aw_token = await aw_tokens
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

            const output = [];
            const map = new Map();
            for (const item of aw_tokens_avaliable) {
              if (!map.has(mongoose.Types.ObjectId(item._id))) {
                map.set(mongoose.Types.ObjectId(item._id), true);
                output.push(mongoose.Types.ObjectId(item._id));
              }
            }

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
                };

                jsonData.push(jsonObject);
              }
            }

            if (update_aw_tokens_avaliable.length <= 0) {
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
                };

                jsonData.push(jsonObject);
              }
            }

            if (transferred_tokens_avaliable.length <= 0) {
            } else {
              for (var i = 0; i < transferred_tokens_avaliable.length; i++) {
                var temp_transferred_token = transferred_tokens_avaliable[i];

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
                  };
                }

                jsonData.push(jsonObject);
              }
            }

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
    } else {
      if (!req.headers.awareid || !req.headers.aware_token_id) {
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

        const assets_avaliable = await physical_assets
          .findOne({
            _awareid: req.headers.awareid,
            aware_token_id: req.headers.aware_token_id,
          })
          .catch((ex) => {
            loggerhandler.logger.error(
              `${ex}, email: ${account_details_avaliable?.email}`
            );
            return res
              .status(400)
              .jsonp({ status: false, message: "Bad request!" });
          });

        const tracer_avaliable = await tracer
          .findOne({
            _awareid: req.headers.awareid,
            aware_token_id: req.headers.aware_token_id,
          })
          .catch((ex) => {
            loggerhandler.logger.error(
              `${ex}, email: ${account_details_avaliable?.email}`
            );
            return res
              .status(400)
              .jsonp({ status: false, message: "Bad request!" });
          });

        const self_validation_avaliable = await self_validation
          .findOne({
            _awareid: req.headers.awareid,
            aware_token_id: req.headers.aware_token_id,
          })
          .catch((ex) => {
            loggerhandler.logger.error(
              `${ex}, email: ${account_details_avaliable?.email}`
            );
            return res
              .status(400)
              .jsonp({ status: false, message: "Bad request!" });
          });

        const company_compliances_avaliable = await company_compliances
          .findOne({
            _awareid: req.headers.awareid,
            aware_token_id: req.headers.aware_token_id,
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

        if (self_validation_avaliable?.sustainble_material?.length > 0) {
          full_name =
            self_validation_avaliable?.sustainble_material?.slice(-1)[0]
              .validateInfo?.fullname;
        } else {
          full_name = "N/A";
        }

        return res.status(200).jsonp({
          status: true,
          data: {
            assets_avaliable,
            tracer_avaliable,
            self_validation_avaliable,
            company_compliances_avaliable,
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

            let final_data = {
              ...product,
              product_line: product.product_line.filter(
                (item) => item.deleted == false
              ),
            };

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

      var accounts_avaliable = await account_details.find({
        is_deleted: { $ne: true },
        role_id: { $ne: 1 },
        email: { $nin: emails },
      });
      var kyc_ids = accounts_avaliable.map((account) => account.kyc_id);

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
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res
        .status(422)
        .jsonp({ status: false, message: "Bad payload received." });
    }

    var payload = { username: req.headers.username };
    refresh(
      req.headers.authorization,
      req.headers.userid,
      payload,
      async function (resp) {
        if (resp.status == true) {
          try {
            if (!req.headers.token_id) {
              return res.status(400).jsonp({
                status: false,
                message: "Send Token ID is required",
                authorization: resp.token,
              });
            }
            if (!req.headers.selected_token_id) {
              return res.status(400).jsonp({
                status: false,
                message: "Selected Token ID is required",
                authorization: resp.token,
              });
            }

            const sendtokenId = req.headers.token_id;
            const selectedTokenId = req.headers.selected_token_id;

            const receiverData = await getReceiverData(sendtokenId);
            if (!receiverData.success) {
              return res.status(400).jsonp({
                status: false,
                message: receiverData.message,
                authorization: resp.token,
              });
            }

            let selectedToken;
            if (
              receiverData.data.selected_aware_token &&
              receiverData.data.selected_aware_token.selected_tokens &&
              receiverData.data.selected_aware_token.selected_tokens.length > 0
            ) {
              selectedToken =
                receiverData.data.selected_aware_token.selected_tokens.find(
                  (token) => token._id.toString() === selectedTokenId.toString()
                );
            }
            if (!selectedToken) {
              return res.status(400).jsonp({
                status: false,
                message: "Selected token not found",
                authorization: resp.token,
              });
            }

            const tokenId = selectedToken.aware_token_id
              ? selectedToken.aware_token_id
              : selectedToken.update_aware_token_id;
            if (!tokenId) {
              return res.status(400).jsonp({
                status: false,
                message: "Token ID not found in selected token",
                authorization: resp.token,
              });
            }

            const transferredToken = receiverData.data.transferredTokens.find(
              (token) =>
                (token.historical_update_aware_token_id &&
                  token.historical_update_aware_token_id.toString() ===
                    tokenId.toString()) ||
                (token.historical_aware_token_id &&
                  token.historical_aware_token_id.toString() ===
                    tokenId.toString())
            );

            const hierarchicalData = await buildTraceabilityTree(
              tokenId,
              0,
              10,
              transferredToken
            );
            if (!hierarchicalData) {
              return res.status(404).jsonp({
                status: false,
                message: "Traceability data not found",
                authorization: resp.token,
              });
            }

            const flattenedData = [];
            function flattenTree(node, level = 1) {
              if (!node) return;
              const { children, ...nodeWithoutChildren } = node;
              flattenedData.push({ ...nodeWithoutChildren, level });
              if (children && Array.isArray(children)) {
                children.forEach((child) => flattenTree(child, level + 1));
              }
            }
            flattenTree(hierarchicalData);

            const levelZeroData = {
              kycDetails: receiverData.data.kycDetails,
              wallet: receiverData.data.wallet,
              sendAwToken: receiverData.data.send_aw_token,
              selectedAwareToken: receiverData.data.selected_aware_token,
              selectedReceiver: receiverData.data.selected_receiver,
              level: 0,
            };
            flattenedData.unshift(levelZeroData);

            flattenedData.forEach((item) => {
              if (item.level === 1) {
                item.transactionCertificate =
                  receiverData.data.transactionCertificate;
                item.proofOfDelivery = receiverData.data.proofOfDelivery;

                if (
                  receiverData.data.selected_aware_token &&
                  receiverData.data.selected_aware_token.selected_tokens &&
                  Array.isArray(
                    receiverData.data.selected_aware_token.selected_tokens
                  )
                ) {
                  const selectedAwareToken = receiverData.data
                    .selected_aware_token.toObject
                    ? receiverData.data.selected_aware_token.toObject()
                    : { ...receiverData.data.selected_aware_token };

                  const matchedToken = selectedAwareToken.selected_tokens.find(
                    (token) =>
                      (token.aware_token_id &&
                        token.aware_token_id.toString() ===
                          item.tokenId.toString()) ||
                      (token.update_aware_token_id &&
                        token.update_aware_token_id.toString() ===
                          item.tokenId.toString())
                  );

                  if (matchedToken) {
                    selectedAwareToken.selected_token = matchedToken;

                    delete selectedAwareToken.selected_tokens;
                  }

                  item.selectedAwareToken = selectedAwareToken;
                } else {
                  item.selectedAwareToken =
                    receiverData.data.selected_aware_token;
                }

                item.transferredToken = transferredToken;
              }
            });

            flattenedData.sort((a, b) => a.level - b.level);
            return res.status(200).jsonp({
              status: true,
              data: flattenedData,
              authorization: resp.token,
            });
          } catch (error) {
            console.error("Error in traceabilityReport:", error);
            loggerhandler.logger.error(`${error}, email: ${req.headers.email}`);
            return res.status(500).json({
              success: false,
              message: "Failed to fetch traceability data",
              error: error.message,
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
  },

  getSankeyDiagramData: async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res
        .status(422)
        .jsonp({ status: false, message: "Bad payload received." });
    }

    var payload = { username: req.headers.username };
    refresh(
      req.headers.authorization,
      req.headers.userid,
      payload,
      async function (resp) {
        if (resp.status == true) {
          try {
            // Validate token ID and role ID in request headers
            if (!req.headers.aware_token_id || !req.headers.role_id) {
              return res.status(400).jsonp({
                status: false,
                message: "Token ID and Role ID are required",
                authorization: resp.token,
              });
            }

            const initialTokenId = req.headers.aware_token_id;
            const requestRoleId = parseInt(req.headers.role_id, 10);

            // Get all role definitions
            const roles = await user_role.find({}).sort({ role_id: 1 });

            // Create a mapping of role_id to level based on the request role_id
            const roleLevels = {};

            // Assign levels based on the requestRoleId
            if (requestRoleId === 2) {
              roleLevels[2] = 1; // Pellet Compounder - level 1
              roleLevels[3] = 0; // Fiber Producer - not in this chain
              roleLevels[4] = 2; // Yarn Producer - level 2
              roleLevels[5] = 3; // Fabric Producer - level 3
              roleLevels[6] = 4; // Product Producer - level 4
              roleLevels[7] = 5; // Final Brand - level 5
            } else if (requestRoleId === 3) {
              roleLevels[2] = 0; // Pellet Compounder - not in this chain
              roleLevels[3] = 1; // Fiber Producer - level 1
              roleLevels[4] = 2; // Yarn Producer - level 2
              roleLevels[5] = 3; // Fabric Producer - level 3
              roleLevels[6] = 4; // Product Producer - level 4
              roleLevels[7] = 5; // Final Brand - level 5
            } else if (requestRoleId === 4) {
              roleLevels[2] = 0; // Pellet Compounder - not in this chain
              roleLevels[3] = 0; // Fiber Producer - not in this chain
              roleLevels[4] = 1; // Yarn Producer - level 1
              roleLevels[5] = 2; // Fabric Producer - level 2
              roleLevels[6] = 3; // Product Producer - level 3
              roleLevels[7] = 4; // Final Brand - level 4
            } else if (requestRoleId === 5) {
              roleLevels[2] = 0; // Pellet Compounder - not in this chain
              roleLevels[3] = 0; // Fiber Producer - not in this chain
              roleLevels[4] = 0; // Yarn Producer - not in this chain
              roleLevels[5] = 1; // Fabric Producer - level 1
              roleLevels[6] = 2; // Product Producer - level 2
              roleLevels[7] = 3; // Final Brand - level 3
            } else if (requestRoleId === 6) {
              roleLevels[2] = 0; // Pellet Compounder - not in this chain
              roleLevels[3] = 0; // Fiber Producer - not in this chain
              roleLevels[4] = 0; // Yarn Producer - not in this chain
              roleLevels[5] = 0; // Fabric Producer - not in this chain
              roleLevels[6] = 1; // Product Producer - level 1
              roleLevels[7] = 2; // Final Brand - level 2
            } else if (requestRoleId === 7) {
              roleLevels[2] = 0; // Pellet Compounder - not in this chain
              roleLevels[3] = 0; // Fiber Producer - not in this chain
              roleLevels[4] = 0; // Yarn Producer - not in this chain
              roleLevels[5] = 0; // Fabric Producer - not in this chain
              roleLevels[6] = 0; // Product Producer - not in this chain
              roleLevels[7] = 1; // Final Brand - level 1
            }
            // Default case - for administrators, production managers, or any unspecified role
            else {
              roleLevels[2] = 1;
              roleLevels[3] = 1;
              roleLevels[4] = 2;
              roleLevels[5] = 3;
              roleLevels[6] = 4;
              roleLevels[7] = 5;
            }

            // Always ensure Administrator and Production Manager are level 0
            roleLevels[1] = 0; // Administrator is always level 0
            roleLevels[10] = 0; // Production Manager is always level 0

            // Create a mapping of role_id to role_name for reference
            const roleNames = {};
            roles.forEach((role) => {
              roleNames[role.role_id] = role.role_name;
            });

            // Determine if the token is in aw_tokens or update_aw_tokens
            let initialToken = await aw_tokens.findOne({
              _id: mongoose.Types.ObjectId(initialTokenId),
            });
            let initialIsUpdateToken = false;

            if (!initialToken) {
              return res.status(404).jsonp({
                status: false,
                message: "Token not found",
                authorization: resp.token,
              });
            }

            // Get asset ID for token info
            let assetId = null;
            if (!initialIsUpdateToken) {
              const asset = await physical_assets
                .findOne({ aware_token_id: initialTokenId })
                .select("aware_asset_id");
              if (asset) {
                assetId = asset.aware_asset_id;
              }
            }

            const nodes = new Map(); // Use Map for unique nodes
            const links = [];
            const processedTokens = new Set(); // Track processed tokens to avoid cycles
            const nodeDppLinks = {}; // To store awareId -> dppLinks mappings
            let remainingInitialToken = initialToken.total_tokens;
            let calculatedRemaining = true;

            // Queue for breadth-first search traversal
            const queue = [
              {
                tokenId: initialTokenId,
                isUpdateToken: initialIsUpdateToken,
                compositionPercent: 100,
              },
            ];

            // Process tokens using BFS
            while (queue.length > 0) {
              const {
                tokenId,
                isUpdateToken,
                compositionPercent,
                leftOverTokens,
              } = queue.shift();
              let duplicateLeftOverTokens = leftOverTokens;

              processedTokens.add(tokenId.toString());

              // Find token in either aw_tokens or update_aw_tokens collection
              let token = isUpdateToken
                ? await update_aw_tokens.findOne({
                    _id: mongoose.Types.ObjectId(tokenId),
                  })
                : await aw_tokens.findOne({
                    _id: mongoose.Types.ObjectId(tokenId),
                  });

              if (!token) continue;

              // Get the company that created/owns this token
              const companyKyc = await kyc_details
                .findOne({ aware_id: token._awareid })
                .select("company_name _id aware_id");

              if (!companyKyc) continue;

              // Get account details to determine role
              const accountDetails = await account_details
                .findOne({ kyc_id: companyKyc._id.toString() })
                .select("role_id");

              if (!accountDetails) continue;

              const companyRoleId = accountDetails?.role_id;
              const companyRoleName =
                roleNames[companyRoleId] || "Unknown Role";
              const companyLevel = roleLevels[companyRoleId] || 0;

              // Add to nodes if not already present
              if (!nodes.has(companyKyc?._id.toString())) {
                nodes.set(companyKyc?._id.toString(), {
                  id: companyKyc?._id.toString(),
                  name: companyKyc?.company_name,
                  roleId: companyRoleId,
                  roleName: companyRoleName,
                  level: companyLevel,
                  awareId: companyKyc?.aware_id,
                });
              }

              // Find transfers of this token
              const queryField = isUpdateToken
                ? "historical_update_aware_token_id"
                : "historical_aware_token_id";
              const transfers = await transferred_tokens.find({
                [queryField]: tokenId,
              });

              // Process each transfer
              for (const transfer of transfers) {
                if (calculatedRemaining === true) {
                  remainingInitialToken -= transfer.total_tokens;
                }

                // Get the company that received the token
                const targetCompanyKyc = await kyc_details
                  .findOne({ aware_id: transfer._awareid })
                  .select("company_name _id aware_id");

                if (!targetCompanyKyc) continue;

                // Get target company's role
                const targetAccountDetails = await account_details
                  .findOne({ kyc_id: targetCompanyKyc._id.toString() })
                  .select("role_id");

                if (!targetAccountDetails) continue;

                const targetRoleId = targetAccountDetails?.role_id;
                const targetRoleName =
                  roleNames[targetRoleId] || "Unknown Role";
                const targetLevel = roleLevels[targetRoleId] || 0;
                const targetAwareId = targetCompanyKyc?.aware_id;

                let productLinesData = null;

                // For dppLink
                if (targetRoleId == 7 && isUpdateToken) {
                  productLinesData = await product_lines.find({
                    _awareid: targetAwareId,
                    "product_line.update_aware_token_id": token?._id,
                  });

                  if (productLinesData) {
                    for (const plData of productLinesData) {
                      const poId = plData.po_id;

                      plData.product_line.forEach((line) => {
                        if (
                          line.update_aware_token_id ===
                            token?._id.toString() &&
                          line.deleted === false &&
                          line?.update_status.toLowerCase() === "filled"
                        ) {
                          // Store dppLink in the mapping
                          if (!nodeDppLinks[targetAwareId]) {
                            nodeDppLinks[targetAwareId] = [];
                          }

                          const dppLink = {
                            poId: poId,
                            qrId: line?.id,
                            orderNumber: line?.order_number,
                            itemNumber: line?.item_number,
                            url: `${
                              process.env.PASSPORT_ADDRESS
                            }${targetAwareId}-${poId}-${line.id.toLowerCase()}`,
                          };

                          // console.log("dppLink", dppLink);

                          // Avoid duplicates
                          const exists = nodeDppLinks[targetAwareId].some(
                            (link) => link.url === dppLink.url
                          );

                          if (!exists) {
                            nodeDppLinks[targetAwareId].push(dppLink);
                          }
                        }
                      });
                    }
                  }
                }

                // Add target company to nodes if not already present
                if (!nodes.has(targetCompanyKyc._id.toString())) {
                  nodes.set(targetCompanyKyc._id.toString(), {
                    id: targetCompanyKyc._id.toString(),
                    name: targetCompanyKyc.company_name,
                    roleId: targetRoleId,
                    roleName: targetRoleName,
                    level: targetLevel,
                    awareId: targetAwareId,
                  });
                }

                // Check if this transferred token is used in any physical assets
                const physicalAssets = await update_physical_asset.find({
                  "assetdataArrayMain.tt_id": transfer._id.toString(),
                });

                // Array for approved physical assets
                const approvedPhysicalAssets = [];

                // Process each physical asset and only include ones with approved tokens
                for (const asset of physicalAssets) {
                  if (asset?.update_aware_token_id) {
                    const tokenInfo = await update_aw_tokens.findOne({
                      _id: mongoose.Types.ObjectId(asset.update_aware_token_id),
                      status: "Approved",
                    });

                    if (tokenInfo) {
                      approvedPhysicalAssets.push(asset);
                    }
                  }
                }

                // Calculate both wasted and used tokens across approved physical assets
                const tokenStats = approvedPhysicalAssets.reduce(
                  (total, asset) => {
                    const assetStats = asset.assetdataArrayMain?.reduce(
                      (sum, item) => {
                        if (item.tt_id === transfer._id.toString()) {
                          return {
                            waste: sum.waste + (Number(item.Waste_token) || 0),
                            used: sum.used + (Number(item.Used_token) || 0),
                          };
                        }
                        return sum;
                      },
                      { waste: 0, used: 0 }
                    ) || { waste: 0, used: 0 };

                    // Combine with running total
                    return {
                      waste: total.waste + assetStats.waste,
                      used: total.used + assetStats.used,
                    };
                  },
                  { waste: 0, used: 0 }
                );

                let totalTokens = 0;
                let wastedTokens = 0;
                let usedTokens = 0;
                let remainingTokens = 0;
                if (
                  Number(compositionPercent) === 100 &&
                  approvedPhysicalAssets.length === 0
                ) {
                  totalTokens = transfer?.total_tokens;
                  wastedTokens = tokenStats.waste;
                  usedTokens = tokenStats.used;
                  remainingTokens = totalTokens - (usedTokens + wastedTokens);
                } else if (approvedPhysicalAssets.length === 0) {
                  totalTokens =
                    (transfer?.total_tokens * compositionPercent) / 100;
                  wastedTokens = 0;
                  usedTokens = 0;
                  remainingTokens = totalTokens - (usedTokens + wastedTokens);
                } else {
                  totalTokens =
                    (transfer?.total_tokens * compositionPercent) / 100;
                  wastedTokens = (tokenStats.waste * compositionPercent) / 100;
                  usedTokens = (tokenStats.used * compositionPercent) / 100;
                  remainingTokens = totalTokens - (usedTokens + wastedTokens);
                }

                duplicateLeftOverTokens = duplicateLeftOverTokens - totalTokens;

                const pushObj = {
                  source: companyKyc._id.toString(),
                  sourceName: companyKyc.company_name,
                  sourceRole: companyRoleName,
                  sourceRoleId: companyRoleId,
                  sourceLevel: companyLevel,
                  target: targetCompanyKyc._id.toString(),
                  targetName: targetCompanyKyc.company_name,
                  targetRole: targetRoleName,
                  targetRoleId: targetRoleId,
                  targetLevel: targetLevel,
                  value: Number(totalTokens.toFixed(2)),
                  used: Number(usedTokens.toFixed(2)),
                  waste: Number(wastedTokens.toFixed(2)),
                  remaining: Number(remainingTokens.toFixed(2)),
                  tokenType: token.type_of_token || "Unknown",
                };

                // Add link between companies
                links.push(pushObj);

                // Add subsequent tokens to the queue
                for (const asset of approvedPhysicalAssets) {
                  const assetUsed = asset.assetdataArrayMain?.find(
                    (item) =>
                      item?.tt_id?.toString() === transfer._id.toString()
                  );
                  if (!assetUsed) continue;

                  const assetUsedToken = Number(assetUsed?.Used_token) || 0;
                  const totalTokensCreated = Number(asset?.orginal_weight) || 0;

                  // First calculate what percentage of the new asset comes from this input
                  const directContributionPercent =
                    (assetUsedToken / totalTokensCreated) * 100;

                  // Then multiply by the incoming composition percentage to properly cascade the percentage
                  // This ensures correct calculation like in the example: 50% of Pellet in Yarn × 40% of Yarn in Fabric = 20% Pellet in Fabric
                  const cascadedCompositionPercent =
                    (compositionPercent * directContributionPercent) / 100;

                  const leftOverTokens =
                    (totalTokensCreated * cascadedCompositionPercent) / 100;

                  if (asset.update_aware_token_id) {
                    queue.push({
                      tokenId: asset.update_aware_token_id,
                      isUpdateToken: true,
                      compositionPercent: cascadedCompositionPercent, // Using the cascaded percentage
                      leftOverTokens: leftOverTokens,
                    });
                  }
                }
              }

              // Handle leftover tokens for this company/node
              const currentNode = nodes.get(companyKyc._id.toString());

              // If we're calculating the remaining tokens for the initial token
              if (calculatedRemaining === true) {
                // Set leftOverTokens to remainingInitialToken (rounded to 2 decimal places)
                const roundedRemainingInitial = Number(
                  remainingInitialToken.toFixed(2)
                );
                if (roundedRemainingInitial > 0) {
                  if (currentNode.leftOverTokens !== undefined) {
                    currentNode.leftOverTokens += roundedRemainingInitial;
                  } else {
                    currentNode.leftOverTokens = roundedRemainingInitial;
                  }
                  // Update the node in the map
                  nodes.set(companyKyc._id.toString(), currentNode);
                }
              }
              // Handle the duplicateLeftOverTokens case
              else if (duplicateLeftOverTokens !== undefined) {
                // Round to 2 decimal places to avoid floating point issues
                const roundedLeftOver = Number(
                  duplicateLeftOverTokens.toFixed(2)
                );

                if (currentNode.leftOverTokens !== undefined) {
                  // If leftOverTokens already exists, add to it
                  currentNode.leftOverTokens +=
                    roundedLeftOver > 0 ? roundedLeftOver : 0;
                } else {
                  // Otherwise create it
                  currentNode.leftOverTokens =
                    roundedLeftOver > 0 ? roundedLeftOver : 0;
                }

                // Update the node in the map
                nodes.set(companyKyc._id.toString(), currentNode);
              }

              calculatedRemaining = false;
            }

            // Sort nodes by level for better visualization
            const sortedNodes = Array.from(nodes.values()).sort(
              (a, b) => a.level - b.level
            );

            sortedNodes.forEach((node) => {
              if (node.awareId && nodeDppLinks[node.awareId]) {
                if (!node.dppLinks) {
                  node.dppLinks = [];
                }

                // Add all the dppLinks for this awareId to the node
                node.dppLinks = [...nodeDppLinks[node.awareId]];
              }
              if (!node.hasOwnProperty("leftOverTokens") && node.roleId !== 7) {
                node.leftOverTokens = 0;
              }
            });

            // Group nodes by level
            const nodesByLevel = {};
            sortedNodes.forEach((node) => {
              if (!nodesByLevel[node.level]) {
                nodesByLevel[node.level] = [];
              }
              nodesByLevel[node.level].push(node);
            });

            return res.status(200).jsonp({
              status: true,
              data: {
                token: {
                  id: initialTokenId,
                  assetId,
                  totalTokens: initialToken.total_tokens,
                  tokenType: initialToken.type_of_token,
                  tokenAction: initialIsUpdateToken ? "Update" : "Create",
                  remainingTokens: remainingInitialToken,
                },
                nodes: sortedNodes,
                nodesByLevel,
                links,
                roleLevels,
                requestRoleId,
              },
              authorization: resp.token,
            });
          } catch (error) {
            console.error("Error generating Sankey diagram data:", error);
            loggerhandler.logger.error(`${error}, email: ${req.headers.email}`);
            return res.status(500).jsonp({
              status: false,
              message: "Failed to generate Sankey diagram data",
              error: error.message,
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
  },

  getTokenStatisticsAsync: async (req, res) => {
    try {
      const exemptedEmails = await exempted_email.find({}).select("email");

      const emails = exemptedEmails.map((account) => account.email);

      const accounts = await account_details
        .find({
          is_deleted: { $ne: true },
          role_id: { $nin: [1, 10] },
          $or: [{ sub_user: false }, { sub_user: { $exists: false } }],
          email: { $nin: emails },
        })
        .select("kyc_id role_id");
      console.log("accounts", accounts.length);

      if (!accounts.length) {
        return res.status(200).jsonp({
          status: true,
          data: [],
        });
      }

      const kycIds = accounts.map((account) => account.kyc_id).filter(Boolean);

      console.log("kycIds.length", kycIds.length);

      const accountMap = {};
      accounts.forEach((account) => {
        if (account.kyc_id) {
          accountMap[account.kyc_id] = account.role_id;
        }
      });

      const kycDetails = await kyc_details.find({
        _id: { $in: kycIds },
        is_deleted: { $ne: true },
      });

      console.log("kycDetails", kycDetails.length);

      const roles = await user_role.find({});

      const roleMap = {};
      roles.forEach((role) => {
        roleMap[role.role_id] = role.role_name;
      });

      const kycMap = {};
      let cnt = 0;
      let insideCnt = 0;
      const noAwareIdInKyc = {};
      kycDetails.forEach((kyc) => {
        cnt++;

        if (kyc.aware_id) {
          insideCnt++;
          kycMap[kyc.aware_id] = kyc;
        } else {
          noAwareIdInKyc[kyc._id] = kyc;
        }
      });

      console.log("Cnt", cnt);
      console.log("Inside Cnt", insideCnt);

      const noAwareIdInKycKeys = Object.keys(noAwareIdInKyc);
      let noAwareIdInKycObjectsId = noAwareIdInKycKeys.map((id) =>
        mongoose.Types.ObjectId(id)
      );
      console.log("noAwareIdInKycObjectsId", noAwareIdInKycObjectsId);

      console.log("kycMap Length", Object.keys(kycMap).length);

      const awareIds = Object.keys(kycMap);

      if (!awareIds.length) {
        return res.status(200).jsonp({
          status: true,
          data: [],
        });
      }

      const [awTokens, updateAwTokens] = await Promise.all([
        aw_tokens
          .find({
            _awareid: { $in: awareIds },
            status: "Approved",
          })
          .select("_awareid total_tokens"),

        update_aw_tokens
          .find({
            _awareid: { $in: awareIds },
            status: "Approved",
          })
          .select("_awareid total_tokens"),
      ]);

      const mintedTokensMap = {};
      awareIds.forEach((id) => (mintedTokensMap[id] = 0));

      awTokens.forEach((token) => {
        if (token._awareid && token.total_tokens) {
          mintedTokensMap[token._awareid] += token.total_tokens;
        }
      });

      updateAwTokens.forEach((token) => {
        if (token._awareid && token.total_tokens) {
          mintedTokensMap[token._awareid] += token.total_tokens;
        }
      });

      const [outgoingTransfers, incomingTransfers] = await Promise.all([
        selected_receiver.find({ _awareid: { $in: awareIds } }),
        selected_receiver.find({ _receiver_awareid: { $in: awareIds } }),
      ]);

      const sendAwareTokenIds = [
        ...new Set([
          ...outgoingTransfers.map((t) => t.send_aware_token_id),
          ...incomingTransfers.map((t) => t.send_aware_token_id),
        ]),
      ].filter(Boolean);

      const tokenInfo = await selected_aware_token
        .find({
          send_aware_token_id: { $in: sendAwareTokenIds },
        })
        .select("send_aware_token_id selected_tokens");

      const tokenAmountMap = {};
      tokenInfo.forEach((info) => {
        if (!info.send_aware_token_id) return;

        let totalTokens = 0;
        if (info.selected_tokens && Array.isArray(info.selected_tokens)) {
          info.selected_tokens.forEach((token) => {
            if (!token) return;

            const amount = parseInt(token.To_be_Send);
            if (!isNaN(amount)) {
              totalTokens += amount;
            }
          });
        }
        tokenAmountMap[info.send_aware_token_id] = totalTokens;
      });

      const relatedAwareIds = [
        ...new Set([
          ...outgoingTransfers.map((t) => t._receiver_awareid),
          ...incomingTransfers.map((t) => t._awareid),
        ]),
      ].filter(Boolean);

      const relatedKyc = await kyc_details
        .find({
          aware_id: { $in: relatedAwareIds },
        })
        .select("aware_id company_name");

      const companyNameMap = {};
      relatedKyc.forEach((kyc) => {
        if (kyc.aware_id) {
          companyNameMap[kyc.aware_id] = kyc.company_name;
        }
      });

      const outgoingMap = {};
      outgoingTransfers.forEach((transfer) => {
        const { _awareid, _receiver_awareid, send_aware_token_id } = transfer;

        if (!_awareid || !_receiver_awareid || !send_aware_token_id) return;

        const amount = tokenAmountMap[send_aware_token_id] || 0;

        if (!outgoingMap[_awareid]) {
          outgoingMap[_awareid] = {};
        }

        if (!outgoingMap[_awareid][_receiver_awareid]) {
          outgoingMap[_awareid][_receiver_awareid] = {
            company_name: companyNameMap[_receiver_awareid] || "Unknown",
            total_tokens: 0,
          };
        }

        outgoingMap[_awareid][_receiver_awareid].total_tokens += amount;
      });

      const incomingMap = {};
      incomingTransfers.forEach((transfer) => {
        const { _awareid, _receiver_awareid, send_aware_token_id } = transfer;

        if (!_awareid || !_receiver_awareid || !send_aware_token_id) return;

        const amount = tokenAmountMap[send_aware_token_id] || 0;

        if (!incomingMap[_receiver_awareid]) {
          incomingMap[_receiver_awareid] = {};
        }

        if (!incomingMap[_receiver_awareid][_awareid]) {
          incomingMap[_receiver_awareid][_awareid] = {
            company_name: companyNameMap[_awareid] || "Unknown",
            total_tokens: 0,
          };
        }

        incomingMap[_receiver_awareid][_awareid].total_tokens += amount;
      });

      const result = awareIds.map((awareId) => {
        const kyc = kycMap[awareId];
        const companyData = {};

        companyData.company_name = kyc.company_name || "Unknown";
        companyData.aware_id = awareId;

        const roleId = accountMap[kyc._id.toString()] || null;
        companyData.role = roleMap[roleId] || "Unknown";

        if (kyc.website) {
          companyData.website = kyc.website;
        }

        const addressParts = [];
        if (kyc.address_line_one) addressParts.push(kyc.address_line_one);
        if (kyc.address_line_two) addressParts.push(kyc.address_line_two);
        if (kyc.city) addressParts.push(kyc.city);
        if (kyc.state) addressParts.push(kyc.state);
        if (kyc.country) addressParts.push(kyc.country);
        if (kyc.zip_code) addressParts.push(`${kyc.zip_code}`);

        if (addressParts.length > 0) {
          companyData.address = addressParts.join(", ");
        }

        if (
          kyc.geo_location &&
          Array.isArray(kyc.geo_location) &&
          kyc.geo_location.length > 0
        ) {
          companyData.geo_location = kyc.geo_location
            .filter((location) => location && location.address)
            .map((location) => ({ address: location.address }));
        }

        if (kyc.company_presentation) {
          companyData.comapany_description = kyc.company_presentation;
        }

        companyData.total_minted = mintedTokensMap[awareId] || 0;
        companyData.outgoing_transfers = outgoingMap[awareId]
          ? Object.values(outgoingMap[awareId])
          : [];
        companyData.incoming_transfers = incomingMap[awareId]
          ? Object.values(incomingMap[awareId])
          : [];

        return companyData;
      });
      console.log("result", result.length);

      return res.status(200).jsonp({
        status: true,
        data: result,
      });
    } catch (error) {
      console.error("Error in getTokenStatisticsAsync:", error);
      loggerhandler.logger.error(`${error}`);
      return res.status(500).jsonp({
        status: false,
        message: "An error occurred while processing your request.",
      });
    }
  },

  getHelloAsync: async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).jsonp(errors.array());
    } else {
    }
  },
};

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function flattenTree(node, flattenedData, level = 1) {
  if (!node) return;

  const { children, ...nodeWithoutChildren } = node;

  const flatNode = {
    ...nodeWithoutChildren,
    level,
  };

  flattenedData.push(flatNode);

  if (children && Array.isArray(children)) {
    children.forEach((child) => flattenTree(child, flattenedData, level + 1));
  }
}

async function getReceiverData(tokenId) {
  try {
    const sendAwToken = await send_aw_tokens.findOne({
      _id: mongoose.Types.ObjectId(tokenId),
    });

    if (!sendAwToken) {
      return { success: false, message: "Token not found" };
    }

    if (sendAwToken.status.toUpperCase() === "CONCEPT") {
      return { success: false, message: "Token has CONCEPT status" };
    }

    const selectedAwareToken = await selected_aware_token.findOne({
      send_aware_token_id: tokenId,
    });

    if (
      !selectedAwareToken.selected_tokens ||
      selectedAwareToken.selected_tokens.length === 0
    ) {
      return { success: false, message: "No selected tokens found" };
    }

    const selectedReceiver = await selected_receiver.findOne({
      send_aware_token_id: tokenId,
    });

    if (!selectedReceiver) {
      return { success: false, message: "No selected receiver data found" };
    }

    let receiverKycDetails = null;
    let walletData = null;
    if (selectedReceiver && selectedReceiver._receiver_awareid) {
      receiverKycDetails = await kyc_details.findOne({
        aware_id: selectedReceiver._receiver_awareid,
      });

      walletData = await wallets
        .findOne({
          _awareid: selectedReceiver._receiver_awareid,
        })
        .select("wallet_address_io");
    }

    const transactionCertificateData =
      await selected_transaction_certificates.findOne({
        send_aware_token_id: tokenId,
      });

    const proofOfDeliveryData = await selected_proof_of_delivery.findOne({
      send_aware_token_id: tokenId,
    });

    const transferredTokensData = await transferred_tokens.find({
      historical_send_aw_tokens_id: tokenId,
    });

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
        wallet: walletData,
        level: 0,
      },
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

async function buildTraceabilityTree(
  tokenId,
  depth = 0,
  maxDepth = 10,
  transferredToken = null
) {
  if (depth >= maxDepth) {
    return null;
  }

  try {
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
    let selectedUpdateAwareTokenData = null;
    let selectedAwareTokenDataWhileSending = null;

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
      aware_id: tokenData?._awareid,
    });

    const walledData = await wallets
      .findOne({
        _awareid: tokenData?._awareid,
      })
      .select("wallet_address_io");

    if (isUpdateToken) {
      assetData = await update_physical_asset.findOne({
        update_aware_token_id: tokenId,
      });

      transactionHistory = await transaction_history.findOne({
        _awareid: tokenData?._awareid,
        update_aware_token_id: tokenId,
      });

      tracerData = await update_tracer.findOne({
        update_aware_token_id: tokenId,
      });

      companyComplianceData = await update_company_compliances.findOne({
        update_aware_token_id: tokenId,
      });

      selfValidationData = await update_self_validation.findOne({
        update_aware_token_id: tokenId,
      });

      selectedUpdateAwareTokenData = await selected_update_aware_token.findOne({
        update_aware_token_id: tokenId,
      });
    } else {
      assetData = await physical_assets.findOne({
        aware_token_id: tokenId,
      });

      transactionHistory = await transaction_history.findOne({
        _awareid: tokenData?._awareid,
        aware_token_id: tokenId,
      });

      tracerData = await tracer.findOne({
        aware_token_id: tokenId,
      });

      companyComplianceData = await company_compliances.findOne({
        aware_token_id: tokenId,
      });

      selfValidationData = await self_validation.findOne({
        aware_token_id: tokenId,
      });
    }

    let receiverTransactionHistory = {};
    if (transferredToken && transferredToken.linked_transaction_history_id) {
      receiverTransactionHistory = await transaction_history.findOne({
        _id: mongoose.Types.ObjectId(
          transferredToken.linked_transaction_history_id
        ),
      });
    }

    if (depth !== 0) {
      if (
        transferredToken &&
        transferredToken.historical_selected_transaction_certificates_id !==
          null
      ) {
        transactionCertificateData =
          await selected_transaction_certificates.findOne({
            _id: transferredToken.historical_selected_transaction_certificates_id,
          });
      }

      if (
        transferredToken &&
        transferredToken.historical_selected_proof_of_deliveries_id !== null
      ) {
        proofOfDeliveryData = await selected_proof_of_delivery.findOne({
          _id: transferredToken.historical_selected_proof_of_deliveries_id,
        });
      }

      if (
        transferredToken &&
        transferredToken.historical_selected_aware_tokens_id !== null
      ) {
        selectedAwareTokenDataWhileSending = await selected_aware_token.findOne(
          {
            _id: mongoose.Types.ObjectId(
              transferredToken.historical_selected_aware_tokens_id
            ),
          }
        );

        if (
          selectedAwareTokenDataWhileSending &&
          selectedAwareTokenDataWhileSending.selected_tokens &&
          Array.isArray(selectedAwareTokenDataWhileSending.selected_tokens)
        ) {
          const matchedToken =
            selectedAwareTokenDataWhileSending.selected_tokens.find(
              (token) =>
                (token.aware_token_id &&
                  token.aware_token_id?.toString() === tokenId?.toString()) ||
                (token.update_aware_token_id &&
                  token.update_aware_token_id?.toString() ===
                    tokenId.toString())
            );

          if (matchedToken) {
            selectedAwareTokenDataWhileSending =
              selectedAwareTokenDataWhileSending.toObject
                ? selectedAwareTokenDataWhileSending.toObject()
                : { ...selectedAwareTokenDataWhileSending };

            selectedAwareTokenDataWhileSending.selected_token = matchedToken;

            delete selectedAwareTokenDataWhileSending.selected_tokens;
          }
        }
      }
    }

    const transferredTokensData = [];

    if (
      assetData &&
      assetData.assetdataArrayMain &&
      Array.isArray(assetData.assetdataArrayMain)
    ) {
      for (const assetItem of assetData.assetdataArrayMain) {
        if (assetItem.tt_id) {
          const transferredToken = await transferred_tokens.findOne({
            _id: mongoose.Types.ObjectId(assetItem.tt_id),
          });

          if (transferredToken) {
            let historicalTokenId = null;

            if (transferredToken.token_base_type === "initiated") {
              historicalTokenId = transferredToken.historical_aware_token_id;
            } else if (transferredToken.token_base_type === "updated") {
              historicalTokenId =
                transferredToken.historical_update_aware_token_id;
            }

            if (historicalTokenId) {
              const historicalTokenData = await buildTraceabilityTree(
                historicalTokenId,
                depth + 1,
                maxDepth,
                transferredToken
              );

              if (historicalTokenData) {
                transferredTokensData.push(historicalTokenData);
              }
            } else {
              transferredTokensData.push({
                transferredToken,
                level: depth + 1,
                children: [],
              });
            }
          }
        }
      }
    }

    if (selectedUpdateAwareTokenData && assetData) {
      assetData = assetData.toObject ? assetData.toObject() : { ...assetData };

      if (
        selectedUpdateAwareTokenData?.value_chain_process_main !== undefined
      ) {
        assetData.value_chain_process_main =
          selectedUpdateAwareTokenData.value_chain_process_main;
      }

      if (selectedUpdateAwareTokenData?.value_chain_process_sub !== undefined) {
        assetData.value_chain_process_sub =
          selectedUpdateAwareTokenData.value_chain_process_sub;
      }

      if (
        selectedUpdateAwareTokenData &&
        selectedUpdateAwareTokenData.production_facility !== undefined
      ) {
        assetData.production_facility =
          selectedUpdateAwareTokenData.production_facility;
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
      wallet: walledData,
      tracer: tracerData,
      companyCompliance: companyComplianceData,
      selfValidation: selfValidationData,
      children: transferredTokensData,
    };

    if (transferredToken) {
      result.transferredToken = transferredToken;
    }

    if (depth !== 0) {
      result.transactionCertificate = transactionCertificateData;
      result.proofOfDelivery = proofOfDeliveryData;
      result.selectedAwareToken = selectedAwareTokenDataWhileSending;
    }

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

const validateTokenStepper = async (req, res, expectedStep) => {
  try {
    const tokenId = req.body.aware_token_id;

    const token = await aw_tokens.findOne({
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
