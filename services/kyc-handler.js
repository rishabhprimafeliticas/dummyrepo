var mongoose = require("mongoose");
const { body, validationResult, check } = require("express-validator");
var kyc_details = require("../models/kyc_details");
const { refresh } = require("../refresh-token");
const account_details = require("../models/account_details");
const kyc_status = require("../models/kyc_status");
const user_role = require("../models/user_role");
const requests = require("../models/requests");
var SendGrid = require("../scripts/send-grid");
const loggerhandler = require('../logger/log');
const notifications = require('../models/notifications');
const moment = require('moment');
const purchase_orders = require("../models/purchase_orders");
const purchase_order_details = require("../models/purchase_order_details");
exports.handlers = {

  getUsersKycDetailsAsync: async (req, res) => {
    const errors = validationResult(req);

    // console.log("HHGHGHY")

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

      var account = await account_details.findOne({ _id: mongoose.Types.ObjectId(req.headers.userid) }).select(['kyc_id', 'role_id', 'first_name', 'last_name', 'kyc_id', 'acknowledgement', 'create_token_stepper']).catch((err) => {
        loggerhandler.logger.error(`${err} ,email:${req.headers.email}`)
        return res.status(500).jsonp({ status: false, message: err });
      });

      if (!account) {
        res.status(400).jsonp({ status: false, message: "Bad request!" });
      }


      // console.log("account.kyc_id", account.kyc_id)

      var details = await kyc_details.findOne({ _id: mongoose.Types.ObjectId(account.kyc_id) }).catch((err) => {
        loggerhandler.logger.error(`${err} ,email:${req.headers.email}`)
        return res.status(500).jsonp({ status: false, message: err });
      });
      
      if (!details) {
        res.status(400).jsonp({ status: false, message: "Bad request!" });
      }



      var role_details = await user_role.findOne({ role_id: Number(account.role_id) }).select(['role_id', 'role_name']).catch((ex) => { loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`), res.status(500).jsonp({ status: false, message: ex }); });
      var kyc_status_avaliable = await kyc_status.findOne({ status_id: Number(details.kyc_status) }).select(['status_id', 'status']).catch((ex) => { loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`), res.status(500).jsonp({ status: false, message: ex }) });

      var jsonObject = {
        first_name: account.first_name,
        last_name: account.last_name,
        kyc_id: account.kyc_id,
        acknowledgement: account.acknowledgement,
        role_id: role_details.role_id,
        role_name: role_details.role_name,
        kyc_status_id: kyc_status_avaliable.status_id,
        kyc_status: kyc_status_avaliable.status,
        create_token_stepper: account.create_token_stepper,
        details: details,
      };

      console.log("jsonObject", jsonObject)


      var payload = { username: req.headers.username };
      refresh(req.headers.authorization, req.headers.userid, payload,
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
              authorization: resp.token,
            });
          }
        }
      );
    }

  },

  getManagerKycDetailsAsync: async (req, res) => {
    const errors = validationResult(req);

    // console.log("HHGHGHY")

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

      var account = await account_details.findOne({ _id: mongoose.Types.ObjectId(req.headers.userid) }).select(['kyc_id', 'role_id', 'first_name', 'last_name', 'kyc_id', 'acknowledgement', 'create_token_stepper']).catch((err) => {
        loggerhandler.logger.error(`${err} ,email:${req.headers.email}`)
        return res.status(500).jsonp({ status: false, message: err });
      });

      if (!account) {
        res.status(400).jsonp({ status: false, message: "Bad request!" });
      }


      // console.log("account.kyc_id", account.kyc_id)

      var details = await kyc_details.findOne({ manager_id: mongoose.Types.ObjectId(req.headers.userid) }).catch((err) => {
        loggerhandler.logger.error(`${err} ,email:${req.headers.email}`)
        return res.status(500).jsonp({ status: false, message: err });
      });
      if (!details) {
        res.status(400).jsonp({ status: false, message: "Bad request!" });
      }



      var role_details = await user_role.findOne({ role_id: Number(account.role_id) }).select(['role_id', 'role_name']).catch((ex) => { loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`), res.status(500).jsonp({ status: false, message: ex }); });
      var kyc_status_avaliable = await kyc_status.findOne({ status_id: Number(details.kyc_status) }).select(['status_id', 'status']).catch((ex) => { loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`), res.status(500).jsonp({ status: false, message: ex }) });

      var jsonObject = {
        first_name: account.first_name,
        last_name: account.last_name,
        kyc_id: account.kyc_id,
        acknowledgement: account.acknowledgement,
        role_id: role_details.role_id,
        role_name: role_details.role_name,
        kyc_status_id: kyc_status_avaliable.status_id,
        kyc_status: kyc_status_avaliable.status,
        create_token_stepper: account.create_token_stepper,
        details: details,
      };

      // console.log("jsonObject", jsonObject)


      var payload = { username: req.headers.username };
      refresh(req.headers.authorization, req.headers.userid, payload,
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
              authorization: resp.token,
            });
          }
        }
      );
    }

  },

  updateKycAsync: async (req, res) => {
    const errors = validationResult(req);
    // console.log('req.headers.adminflag1', req.headers.adminflag)
    if (!errors.isEmpty()) {
      return res.status(422).jsonp(errors.array());
    }
    else {
      if (!req.headers.userid || !req.headers.username || !req.headers.authorization) {
        return res.status(400).jsonp({ status: false, message: "Bad request!" });
      }
      else {
        var temp_kyc_status = await kyc_details.findOne({ _id: mongoose.Types.ObjectId(req.body._id) }).select(['kyc_status']).catch((ex) => {
          loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`)
          return res.status(500).jsonp({ status: false, message: ex });
        })
        if (!req.headers.adminflag) {

          kyc_details.findByIdAndUpdate(
            { _id: mongoose.Types.ObjectId(req.body._id) },
            {
              company_name: req.body.companyName,
              aware_id: req.body.awareId,
              website: req.body.website,
              address_lane_one: req.body.address1,
              address_lane_two: req.body.address2,
              country: req.body.country,
              state: req.body.state,
              city: req.body.city,
              zipcode: req.body.zip,
              modified_by: req.headers.userid,
              kyc_status: req.body.is_updatetable == true && temp_kyc_status == "3" ? "2" : "1",
              geo_location: req.body.production_location,
              sub_brand: [{ 
                name: req.body.companyName,   
              }],
              modified_date: new Date(),
            },
            function (err, datasubmitted) {
              if (err) {
                loggerhandler.logger.error(`${err} ,email:${req.headers.email}`);
                return res.status(500).jsonp({ status: false, message: err });
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
                      message: "Your KYC information entered so far has been saved successfully.",
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
          );
        } else {
          // console.log('req.headers.adminflag2', req.headers.adminflag)
          // console.log('req.body._id', req.body._id)
          // console.log('temp_kyc_status', temp_kyc_status)


          kyc_details.findByIdAndUpdate(
            { _id: mongoose.Types.ObjectId(req.body._id) },
            {
              company_name: req.body.companyName,
              aware_id: req.body.awareId,
              website: req.body.website,
              address_lane_one: req.body.address1,
              address_lane_two: req.body.address2,
              country: req.body.country,
              state: req.body.state,
              city: req.body.city,
              zipcode: req.body.zip,
              modified_by: req.headers.userid,
              kyc_status: temp_kyc_status.kyc_status,
              geo_location: req.body.production_location,
              sub_brand: [{ 
                name: req.body.companyName,   
              }],
              modified_date: new Date(),
            },
            function (err, datasubmitted) {
              if (err) {
                loggerhandler.logger.error(`${err} ,email:${req.headers.email}`);
                return res.status(500).jsonp({ status: false, message: err });
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
                      message: "KYC information entered so far has been saved successfully.",
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
          );
        }

      }
    }
  },

  updateKycCerificateAsync: async (req, res) => {
    if (
      !req.headers.userid ||
      !req.headers.username ||
      !req.headers.authorization
    ) {
      return res.status(400).jsonp({ status: false, message: "Bad request!" });
    } else {
      if (
        !req.body._id ||
        !req.body.doc_id ||
        !req.body.documentName ||
        !req.body.discription ||
        !req.body.validThru ||
        !req.body.type
      ) {
        return res.status(422).jsonp("I know you have it in you, Try again!");
      }

      var file = req.file;
      // console.log("file",file)

      var certificates = [];

      const map = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#x27;",
        "/": "&#x2F;",
      };

      const reg = /[&<>"'/]/gi;
      var _id = req.body._id.replace(reg, (match) => map[match]);
      // var documentName = req.body.documentName.replace(
      //   reg,
      //   (match) => map[match]
      // );
      var documentName = req.body.documentName;
      var description = req.body.discription
      // .replace(
      //   reg,
      //   (match) => map[match]
      // );
      var validThru = req.body.validThru
      // replace(reg, (match) => map[match]);
      var type = req.body.type
      // .replace(reg, (match) => map[match]);
      var doc_id = req.body.doc_id
      // .replace(reg, (match) => map[match]);

      var tempobject = null;
      if (!req.headers.adminflag) {
        tempobject = {
          doc_id: doc_id,
          documentname: documentName,
          description: description,
          validthru: validThru,
          isselected: true,
          path: file.filename.replace(/\s/g, ""),
          status: "Under Verification",
        };
      }
      else {
        tempobject = {
          doc_id: doc_id,
          documentname: documentName,
          description: description,
          validthru: validThru,
          isselected: true,
          path: file.filename.replace(/\s/g, ""),
          status: "Verified",
        };
      }


      var temp_kyc_status = await kyc_details.findOne({ _id: mongoose.Types.ObjectId(req.body._id) }).select(['kyc_status']).catch((ex) => { loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`); return res.status(500).jsonp({ status: false, message: ex }); })
      if (!req.headers.adminflag) {
        if (type == "escForm") {
          var details = await kyc_details
            .findOne({ _id: mongoose.Types.ObjectId(_id) })
            .catch((ex) => {
              res.status(500).jsonp({ status: false, message: ex });
            });
          var env_certificates = details.environmental_scope_certificates;

          env_certificates.forEach(function (i, idx, array) {
            var element = array[idx];
            if (element.doc_id === tempobject.doc_id) {
              env_certificates.splice(idx, 1);
            }
          });

          env_certificates.forEach((element) => {
            certificates.push(element);
          });

          certificates.push(tempobject);

          kyc_details.findByIdAndUpdate(
            { _id: mongoose.Types.ObjectId(_id) },
            {
              environmental_scope_certificates: certificates,
              kyc_status: req.body.is_updatetable == true && temp_kyc_status == "3" ? "2" : "1",
              modified_by: req.headers.userid,
              modified_date: new Date(),
            },
            function (err, datasubmitted) {
              if (err) {
                loggerhandler.logger.error(`${err} ,email:${req.headers.email}`);
                return res.status(500).jsonp({ status: false, message: err });
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
                      message:
                        "Your Environmental Scope Certificate has been saved successfully.",
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
          );
        } else if (type == "sccForm") {
          var details = await kyc_details
            .findOne({ _id: mongoose.Types.ObjectId(_id) })
            .catch((ex) => {
              loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
              res.status(500).jsonp({ status: false, message: ex });
            });
          var env_certificates = details.social_compliance_certificates;

          env_certificates.forEach(function (i, idx, array) {
            var element = array[idx];
            if (element.doc_id === tempobject.doc_id) {
              env_certificates.splice(idx, 1);
            }
          });

          env_certificates.forEach((element) => {
            certificates.push(element);
          });

          certificates.push(tempobject);

          kyc_details.findByIdAndUpdate(
            { _id: mongoose.Types.ObjectId(_id) },
            {
              social_compliance_certificates: certificates,
              kyc_status: req.body.is_updatetable == true && temp_kyc_status == "3" ? "2" : "1",
              modified_by: req.headers.userid,
              modified_date: new Date(),
            },
            function (err, datasubmitted) {
              if (err) {
                loggerhandler.logger.error(`${err} ,email:${req.headers.email}`);
                return res.status(500).jsonp({ status: false, message: err });
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
                      message:
                        "Your Social Compliance Certificate has been saved successfully.",
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
          );
        } else if (type == "cccForm") {
          var details = await kyc_details
            .findOne({ _id: mongoose.Types.ObjectId(_id) })
            .catch((ex) => {
              loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
              res.status(500).jsonp({ status: false, message: ex });
            });
          var env_certificates = details.chemical_compliance_certificates;

          env_certificates.forEach(function (i, idx, array) {
            var element = array[idx];
            if (element.doc_id === tempobject.doc_id) {
              env_certificates.splice(idx, 1);
            }
          });

          env_certificates.forEach((element) => {
            certificates.push(element);
          });

          certificates.push(tempobject);

          kyc_details.findByIdAndUpdate(
            { _id: mongoose.Types.ObjectId(_id) },
            {

              chemical_compliance_certificates: certificates,
              kyc_status: req.body.is_updatetable == true && temp_kyc_status == "3" ? "2" : "1",
              modified_by: req.headers.userid,
              modified_date: new Date(),
            },
            function (err, datasubmitted) {
              if (err) {
                loggerhandler.logger.error(`${err} ,email:${req.headers.email}`);
                return res.status(500).jsonp({ status: false, message: err });
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
                      message:
                        "Your Chemical Compliance Certificate has been saved successfully.",
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
          );
        } else if (type == "spcForm") {
          var details = await kyc_details
            .findOne({ _id: mongoose.Types.ObjectId(_id) })
            .catch((ex) => {
              loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
              res.status(500).jsonp({ status: false, message: ex });
            });
          var env_certificates = details.sustainable_process_certificates;

          env_certificates.forEach(function (i, idx, array) {
            var element = array[idx];
            if (element.doc_id === tempobject.doc_id) {
              env_certificates.splice(idx, 1);
            }
          });

          env_certificates.forEach((element) => {
            certificates.push(element);
          });

          certificates.push(tempobject);

          kyc_details.findByIdAndUpdate(
            { _id: mongoose.Types.ObjectId(_id) },
            {
              sustainable_process_certificates: certificates,
              kyc_status: req.body.is_updatetable == true && temp_kyc_status == "3" ? "2" : "1",
              modified_by: req.headers.userid,
              modified_date: new Date(),
            },
            function (err, datasubmitted) {
              if (err) {
                loggerhandler.logger.error(`${err} ,email:${req.headers.email}`);
                return res.status(500).jsonp({ status: false, message: err });
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
                      message:
                        "Your Sustainable Process Certificate has been saved successfully.",
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
          );
        }
      } else {
        if (type == "escForm") {
          var details = await kyc_details
            .findOne({ _id: mongoose.Types.ObjectId(_id) })
            .catch((ex) => {
              loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
              res.status(500).jsonp({ status: false, message: ex });
            });
          var env_certificates = details.environmental_scope_certificates;

          env_certificates.forEach(function (i, idx, array) {
            var element = array[idx];
            if (element.doc_id === tempobject.doc_id) {
              env_certificates.splice(idx, 1);
            }
          });

          env_certificates.forEach((element) => {
            certificates.push(element);
          });

          certificates.push(tempobject);

          kyc_details.findByIdAndUpdate(
            { _id: mongoose.Types.ObjectId(_id) },
            {
              environmental_scope_certificates: certificates,

              modified_by: req.headers.userid,
              modified_date: new Date(),
            },
            function (err, datasubmitted) {
              if (err) {
                loggerhandler.logger.error(`${err} ,email:${req.headers.email}`);
                return res.status(500).jsonp({ status: false, message: err });
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
                      message:
                        "Environmental Scope Certificate has been saved successfully.",
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
          );
        } else if (type == "sccForm") {
          var details = await kyc_details
            .findOne({ _id: mongoose.Types.ObjectId(_id) })
            .catch((ex) => {
              loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
              res.status(500).jsonp({ status: false, message: ex });
            });
          var env_certificates = details.social_compliance_certificates;

          env_certificates.forEach(function (i, idx, array) {
            var element = array[idx];
            if (element.doc_id === tempobject.doc_id) {
              env_certificates.splice(idx, 1);
            }
          });

          env_certificates.forEach((element) => {
            certificates.push(element);
          });

          certificates.push(tempobject);

          kyc_details.findByIdAndUpdate(
            { _id: mongoose.Types.ObjectId(_id) },
            {
              social_compliance_certificates: certificates,

              modified_by: req.headers.userid,
              modified_date: new Date(),
            },
            function (err, datasubmitted) {
              if (err) {
                loggerhandler.logger.error(`${err} ,email:${req.headers.email}`);
                return res.status(500).jsonp({ status: false, message: err });
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
                      message:
                        "Social Compliance Certificate has been saved successfully.",
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
          );
        } else if (type == "cccForm") {
          var details = await kyc_details
            .findOne({ _id: mongoose.Types.ObjectId(_id) })
            .catch((ex) => {
              loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
              res.status(500).jsonp({ status: false, message: ex });
            });
          var env_certificates = details.chemical_compliance_certificates;

          env_certificates.forEach(function (i, idx, array) {
            var element = array[idx];
            if (element.doc_id === tempobject.doc_id) {
              env_certificates.splice(idx, 1);
            }
          });

          env_certificates.forEach((element) => {
            certificates.push(element);
          });

          certificates.push(tempobject);

          kyc_details.findByIdAndUpdate(
            { _id: mongoose.Types.ObjectId(_id) },
            {

              chemical_compliance_certificates: certificates,

              modified_by: req.headers.userid,
              modified_date: new Date(),
            },
            function (err, datasubmitted) {
              if (err) {
                loggerhandler.logger.error(`${err} ,email:${req.headers.email}`);
                return res.status(500).jsonp({ status: false, message: err });
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
                      message:
                        "Chemical Compliance Certificate has been saved successfully.",
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
          );
        } else if (type == "spcForm") {
          var details = await kyc_details
            .findOne({ _id: mongoose.Types.ObjectId(_id) })
            .catch((ex) => {
              loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
              res.status(500).jsonp({ status: false, message: ex });
            });
          var env_certificates = details.sustainable_process_certificates;

          env_certificates.forEach(function (i, idx, array) {
            var element = array[idx];
            if (element.doc_id === tempobject.doc_id) {
              env_certificates.splice(idx, 1);
            }
          });

          env_certificates.forEach((element) => {
            certificates.push(element);
          });

          certificates.push(tempobject);

          kyc_details.findByIdAndUpdate(
            { _id: mongoose.Types.ObjectId(_id) },
            {
              sustainable_process_certificates: certificates,

              modified_by: req.headers.userid,
              modified_date: new Date(),
            },
            function (err, datasubmitted) {
              if (err) {
                loggerhandler.logger.error(`${err} ,email:${req.headers.email}`);
                return res.status(500).jsonp({ status: false, message: err });
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
                      message:
                        "Sustainable Process Certificate has been saved successfully.",
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
          );
        }
      }

    }
  },

  deleteCertificateAsync: async (req, res) => {
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
      } else {
        var temp_certificates = null;

        var details = await kyc_details
          .findOne({ _id: mongoose.Types.ObjectId(req.body._id) })
          .catch((ex) => {
            res.status(500).jsonp({ status: false, message: ex });
          });

        var temp_kyc_status = await kyc_details.findOne({ _id: mongoose.Types.ObjectId(req.body._id) }).select(['kyc_status']).catch((ex) => { loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`); return res.status(500).jsonp({ status: false, message: ex }); })
        if (!req.headers.adminflag) {
          if (req.body.type == "escForm") {
            temp_certificates = details.environmental_scope_certificates;

            // temp_certificates = temp_certificates.filter(function (obj) {
            //   return obj.doc_id !== req.body.doc_id;
            // });
            temp_certificates= temp_certificates.map((e)=>{
              if(e.doc_id==req.body.doc_id)
                { 
                  e.archive=true;
                }
                return e;
            })
            console.log(temp_certificates,'temp_certificates')
            kyc_details.findByIdAndUpdate(
              { _id: mongoose.Types.ObjectId(req.body._id) },
              {
                environmental_scope_certificates: temp_certificates,
                kyc_status: req.body.is_updatetable == true && temp_kyc_status == "3" ? "2" : "1",
                modified_by: req.headers.userid,
                modified_date: new Date(),
              },
              function (err, datasubmitted) {
                if (err) {
                  loggerhandler.logger.error(`${err} ,email:${req.headers.email}`);
                  return res.status(500).jsonp({ status: false, message: err });
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
                        message:
                          "Environmental Scope Certificate has been deleted successfully.",
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
          } else if (req.body.type == "sccForm") {
            temp_certificates = details.social_compliance_certificates;
            // temp_certificates = temp_certificates.filter(function (obj) {
            //   return obj.doc_id !== req.body.doc_id;
            // });
            temp_certificates= temp_certificates.map((e)=>{
              if(e.doc_id==req.body.doc_id)
                { 
                  e.archive=true;
                }
                return e;
            })
            kyc_details.findByIdAndUpdate(
              { _id: mongoose.Types.ObjectId(req.body._id) },
              {
                social_compliance_certificates: temp_certificates,
                kyc_status: req.body.is_updatetable == true && temp_kyc_status == "3" ? "2" : "1",
                modified_by: req.headers.userid,
                modified_date: new Date(),
              },
              function (err, datasubmitted) {
                if (err) {
                  loggerhandler.logger.error(`${err} ,email:${req.headers.email}`);
                  return res.status(500).jsonp({ status: false, message: err });
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
                        message:
                          "Social Compliance Certificate has been deleted successfully.",
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
          } else if (req.body.type == "cccForm") {
            temp_certificates = details.chemical_compliance_certificates;

            // temp_certificates = temp_certificates.filter(function (obj) {
            //   return obj.doc_id !== req.body.doc_id;
            // });
            temp_certificates= temp_certificates.map((e)=>{
              if(e.doc_id==req.body.doc_id)
                { 
                  e.archive=true;
                }
                return e;
            })

            kyc_details.findByIdAndUpdate(
              { _id: mongoose.Types.ObjectId(req.body._id) },
              {
                chemical_compliance_certificates: temp_certificates,
                kyc_status: req.body.is_updatetable == true && temp_kyc_status == "3" ? "2" : "1",
                modified_by: req.headers.userid,
                modified_date: new Date(),
              },
              function (err, datasubmitted) {
                if (err) {
                  loggerhandler.logger.error(`${err} ,email:${req.headers.email}`);
                  return res.status(500).jsonp({ status: false, message: err });
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
                        message:
                          "Chemical Compliance Certificate has been deleted successfully.",
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
          } else if (req.body.type == "spcForm") {
            temp_certificates = details.sustainable_process_certificates;

            // temp_certificates = temp_certificates.filter(function (obj) {
            //   return obj.doc_id !== req.body.doc_id;
            // });
            temp_certificates= temp_certificates.map((e)=>{
              if(e.doc_id==req.body.doc_id)
                { 
                  e.archive=true;
                }
                return e;
            })

            kyc_details.findByIdAndUpdate(
              { _id: mongoose.Types.ObjectId(req.body._id) },
              {
                sustainable_process_certificates: temp_certificates,
                kyc_status: req.body.is_updatetable == true && temp_kyc_status == "3" ? "2" : "1",
                modified_by: req.headers.userid,
                modified_date: new Date(),
              },
              function (err, datasubmitted) {
                if (err) {
                  loggerhandler.logger.error(`${err} ,email:${req.headers.email}`);
                  return res.status(500).jsonp({ status: false, message: err });
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
                        message:
                          "Sustainable Process Certificate has been deleted successfully.",
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
        } else {
          if (req.body.type == "escForm") {
            temp_certificates = details.environmental_scope_certificates;

            // temp_certificates = temp_certificates.filter(function (obj) {
            //   return obj.doc_id !== req.body.doc_id;
            // });
            temp_certificates= temp_certificates.map((e)=>{
              if(e.doc_id==req.body.doc_id)
                { 
                  e.archive=true;
                }
                return e;
            })

            kyc_details.findByIdAndUpdate(
              { _id: mongoose.Types.ObjectId(req.body._id) },
              {
                environmental_scope_certificates: temp_certificates,

                modified_by: req.headers.userid,
                modified_date: new Date(),
              },
              function (err, datasubmitted) {
                if (err) {
                  loggerhandler.logger.error(`${err} ,email:${req.headers.email}`);
                  return res.status(500).jsonp({ status: false, message: err });
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
                        message:
                          "Environmental Scope Certificate has been deleted successfully.",
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
          } else if (req.body.type == "sccForm") {
            temp_certificates = details.social_compliance_certificates;
            temp_certificates = temp_certificates.filter(function (obj) {
              return obj.doc_id !== req.body.doc_id;
            });
            kyc_details.findByIdAndUpdate(
              { _id: mongoose.Types.ObjectId(req.body._id) },
              {
                social_compliance_certificates: temp_certificates,

                modified_by: req.headers.userid,
                modified_date: new Date(),
              },
              function (err, datasubmitted) {
                if (err) {
                  loggerhandler.logger.error(`${err} ,email:${req.headers.email}`);
                  return res.status(500).jsonp({ status: false, message: err });
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
                        message:
                          "Social Compliance Certificate has been deleted successfully.",
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
          } else if (req.body.type == "cccForm") {
            temp_certificates = details.chemical_compliance_certificates;

            temp_certificates = temp_certificates.filter(function (obj) {
              return obj.doc_id !== req.body.doc_id;
            });

            kyc_details.findByIdAndUpdate(
              { _id: mongoose.Types.ObjectId(req.body._id) },
              {
                chemical_compliance_certificates: temp_certificates,

                modified_by: req.headers.userid,
                modified_date: new Date(),
              },
              function (err, datasubmitted) {
                if (err) {
                  loggerhandler.logger.error(`${err} ,email:${req.headers.email}`);
                  return res.status(500).jsonp({ status: false, message: err });
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
                        message:
                          "Chemical Compliance Certificate has been deleted successfully.",
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
          } else if (req.body.type == "spcForm") {
            temp_certificates = details.sustainable_process_certificates;

            temp_certificates = temp_certificates.filter(function (obj) {
              return obj.doc_id !== req.body.doc_id;
            });

            kyc_details.findByIdAndUpdate(
              { _id: mongoose.Types.ObjectId(req.body._id) },
              {
                sustainable_process_certificates: temp_certificates,

                modified_by: req.headers.userid,
                modified_date: new Date(),
              },
              function (err, datasubmitted) {
                if (err) {
                  loggerhandler.logger.error(`${err} ,email:${req.headers.email}`);
                  return res.status(500).jsonp({ status: false, message: err });
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
                        message:
                          "Sustainable Process Certificate has been deleted successfully.",
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
        }

      }
    }
  },




  updateKycTracerAsync: async (req, res) => {
    if (
      !req.headers.userid ||
      !req.headers.username ||
      !req.headers.authorization
    ) {
      return res.status(400).jsonp({ status: false, message: "Bad request!" });
    } else {
      if (
        !req.body._id ||
        !req.body.tracer_id ||
        !req.body.licenseNumber ||
        !req.body.validThru ||
        !req.body.type
      ) {
        return res.status(422).jsonp("I know you have it in you, Try again!");
      }

      var file = req.file;
      var certificates = [];

      const map = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#x27;",
        "/": "&#x2F;",
      };

      const reg = /[&<>"'/]/gi;
      var _id = req.body._id
      // .replace(reg, (match) => map[match]);
      var tracer_id = req.body.tracer_id
      // .replace(reg, (match) => map[match]);

      var licenseNumber = req.body.licenseNumber
      // .replace(
      //   reg,
      //   (match) => map[match]
      // );
      var validThru = req.body.validThru
      // .replace(reg, (match) => map[match]);
      var type = req.body.type
      // .replace(reg, (match) => map[match]);

      var temp_kyc_status = await kyc_details.findOne({ _id: mongoose.Types.ObjectId(req.body._id) }).select(['kyc_status']).catch((ex) => { loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`); return res.status(500).jsonp({ status: false, message: ex }); })
      if (!req.headers.adminflag) {
        if (type == "escForm") {
          var tempobject = {
            _id: _id,
            tracer_id: tracer_id,
            licensenumber: licenseNumber,
            validthru: validThru,
            path: file.filename.replace(/\s/g, ""),
            status: "Under Verification",
          };

          var details = await kyc_details
            .findOne({ _id: mongoose.Types.ObjectId(_id) })
            .catch((ex) => {
              loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
              res.status(500).jsonp({ status: false, message: ex });
            });
          var env_certificates = details.aware_tracer;

          env_certificates.forEach(function (i, idx, array) {
            var element = array[idx];
            if (element.tracer_id === tempobject.tracer_id) {
              env_certificates.splice(idx, 1);
            }
          });

          env_certificates.forEach((element) => {
            certificates.push(element);
          });

          certificates.push(tempobject);

          kyc_details.findByIdAndUpdate(
            { _id: mongoose.Types.ObjectId(_id) },
            {
              aware_tracer: certificates,
              kyc_status: req.body.is_updatetable == true && temp_kyc_status == "3" ? "2" : "1",
              modified_by: req.headers.userid,
              modified_date: new Date(),
            },
            function (err, datasubmitted) {
              if (err) {
                loggerhandler.logger.error(`${err} ,email:${req.headers.email}`);
                return res.status(500).jsonp({ status: false, message: err });
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
                      message: "Aware™ tracer has been updated successfully.",
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
          );
        } else if (type == "sccForm") {
          var tempobject = {
            tracer_id: tracer_id,
            tracerName: licenseNumber,
            validthru: validThru,
            path: file.filename.replace(/\s/g, ""),
            status: "Under Verification",
          };

          var details = await kyc_details
            .findOne({ _id: mongoose.Types.ObjectId(_id) })
            .catch((ex) => {
              loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
              res.status(500).jsonp({ status: false, message: ex });
            });
          var env_certificates = details.custom_tracer;

          env_certificates.forEach(function (i, idx, array) {
            var element = array[idx];
            if (element.tracer_id === tempobject.tracer_id) {
              env_certificates.splice(idx, 1);
            }
          });

          env_certificates.forEach((element) => {
            certificates.push(element);
          });

          certificates.push(tempobject);

          kyc_details.findByIdAndUpdate(
            { _id: mongoose.Types.ObjectId(_id) },
            {
              custom_tracer: certificates,
              kyc_status: req.body.is_updatetable == true && temp_kyc_status == "3" ? "2" : "1",
              modified_by: req.headers.userid,
              modified_date: new Date(),
            },
            function (err, datasubmitted) {
              if (err) {
                loggerhandler.logger.error(`${err} ,email:${req.headers.email}`);
                return res.status(500).jsonp({ status: false, message: err });
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
                      message:
                        "Custom Tracer has been saved successfully",
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
          );
        }
      } else {
        if (type == "escForm") {
          var tempobject = {
            _id: _id,
            tracer_id: tracer_id,
            licensenumber: licenseNumber,
            validthru: validThru,
            path: file.filename.replace(/\s/g, ""),
            status: "Verified",
          };

          var details = await kyc_details
            .findOne({ _id: mongoose.Types.ObjectId(_id) })
            .catch((ex) => {
              loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
              res.status(500).jsonp({ status: false, message: ex });
            });
          var env_certificates = details.aware_tracer;

          env_certificates.forEach(function (i, idx, array) {
            var element = array[idx];
            if (element.tracer_id === tempobject.tracer_id) {
              env_certificates.splice(idx, 1);
            }
          });

          env_certificates.forEach((element) => {
            certificates.push(element);
          });

          certificates.push(tempobject);

          kyc_details.findByIdAndUpdate(
            { _id: mongoose.Types.ObjectId(_id) },
            {
              aware_tracer: certificates,

              modified_by: req.headers.userid,
              modified_date: new Date(),
            },
            function (err, datasubmitted) {
              if (err) {
                loggerhandler.logger.error(`${err} ,email:${req.headers.email}`);
                return res.status(500).jsonp({ status: false, message: err });
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
                      message: "Aware™ tracer has been updated successfully.",
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
          );
        } else if (type == "sccForm") {
          var tempobject = {
            tracer_id: tracer_id,
            tracerName: licenseNumber,
            validthru: validThru,
            path: file.filename.replace(/\s/g, ""),
            status: "Verified",
          };

          var details = await kyc_details
            .findOne({ _id: mongoose.Types.ObjectId(_id) })
            .catch((ex) => {
              loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
              res.status(500).jsonp({ status: false, message: ex });
            });
          var env_certificates = details.custom_tracer;

          env_certificates.forEach(function (i, idx, array) {
            var element = array[idx];
            if (element.tracer_id === tempobject.tracer_id) {
              env_certificates.splice(idx, 1);
            }
          });

          env_certificates.forEach((element) => {
            certificates.push(element);
          });

          certificates.push(tempobject);

          kyc_details.findByIdAndUpdate(
            { _id: mongoose.Types.ObjectId(_id) },
            {
              custom_tracer: certificates,

              modified_by: req.headers.userid,
              modified_date: new Date(),
            },
            function (err, datasubmitted) {
              if (err) {
                loggerhandler.logger.error(`${err} ,email:${req.headers.email}`);
                return res.status(500).jsonp({ status: false, message: err });
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
                      message:
                        "Custom Tracer has been saved successfully",
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
          );
        }
      }

    }
  },

  deleteTracerAsync: async (req, res) => {
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
      } else {
        var temp_certificates = null;

        var details = await kyc_details
          .findOne({ _id: mongoose.Types.ObjectId(req.body._id) })
          .catch((ex) => {
            loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
            res.status(500).jsonp({ status: false, message: ex });
          });

        var temp_kyc_status = await kyc_details.findOne({ _id: mongoose.Types.ObjectId(req.body._id) }).select(['kyc_status']).catch((ex) => { loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`); return res.status(500).jsonp({ status: false, message: ex }); })
        if (!req.headers.adminflag) {
          if (req.body.type == "escForm") {
            temp_certificates = details.aware_tracer;
            temp_certificates = temp_certificates.filter(function (obj) {
              return obj.tracer_id !== req.body.tracer_id;
            });

            kyc_details.findByIdAndUpdate(
              { _id: mongoose.Types.ObjectId(req.body._id) },
              {
                aware_tracer: temp_certificates,
                kyc_status: req.body.is_updatetable == true && temp_kyc_status == "3" ? "2" : "1",
                modified_by: req.headers.userid,
                modified_date: new Date(),
              },
              function (err, datasubmitted) {
                if (err) {
                  loggerhandler.logger.error(`${err} ,email:${req.headers.email}`);
                  return res.status(500).jsonp({ status: false, message: err });
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
                        message:
                          "Aware™ Tracer has been deleted successfully.",
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
          } else if (req.body.type == "sccForm") {
            temp_certificates = details.custom_tracer;

            temp_certificates = temp_certificates.filter(function (obj) {
              return obj.tracer_id !== req.body.tracer_id;
            });

            kyc_details.findByIdAndUpdate(
              { _id: mongoose.Types.ObjectId(req.body._id) },
              {
                custom_tracer: temp_certificates,
                kyc_status: req.body.is_updatetable == true && temp_kyc_status == "3" ? "2" : "1",
                modified_by: req.headers.userid,
                modified_date: new Date(),
              },
              function (err, datasubmitted) {
                if (err) {
                  loggerhandler.logger.error(`${err} ,email:${req.headers.email}`);
                  return res.status(500).jsonp({ status: false, message: err });
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
                        message:
                          "Custom Tracer has been deleted successfully.",
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
        } else {

          if (req.body.type == "escForm") {
            temp_certificates = details.aware_tracer;
            temp_certificates = temp_certificates.filter(function (obj) {
              return obj.tracer_id !== req.body.tracer_id;
            });

            kyc_details.findByIdAndUpdate(
              { _id: mongoose.Types.ObjectId(req.body._id) },
              {
                aware_tracer: temp_certificates,

                modified_by: req.headers.userid,
                modified_date: new Date(),
              },
              function (err, datasubmitted) {
                if (err) {
                  loggerhandler.logger.error(`${err} ,email:${req.headers.email}`);
                  return res.status(500).jsonp({ status: false, message: err });
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
                        message:
                          "Aware™ Tracer has been deleted successfully.",
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
          } else if (req.body.type == "sccForm") {
            temp_certificates = details.custom_tracer;

            temp_certificates = temp_certificates.filter(function (obj) {
              return obj.tracer_id !== req.body.tracer_id;
            });

            kyc_details.findByIdAndUpdate(
              { _id: mongoose.Types.ObjectId(req.body._id) },
              {
                custom_tracer: temp_certificates,

                modified_by: req.headers.userid,
                modified_date: new Date(),
              },
              function (err, datasubmitted) {
                if (err) {
                  loggerhandler.logger.error(`${err} ,email:${req.headers.email}`);
                  return res.status(500).jsonp({ status: false, message: err });
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
                        message:
                          "Custom Tracer has been deleted successfully.",
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
        }

      }
    }
  },

  updateTermsNConditionsAsync: async (req, res) => {
    const errors = validationResult(req);
    // console.log(req.body)
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
      } else {
        kyc_details.findByIdAndUpdate(
          { _id: mongoose.Types.ObjectId(req.body._id) },
          {
            terms_condition: req.body.AcceptTerms,
            kyc_status: req.body.kyc_status,
            modified_by: req.headers.userid,
            modified_date: new Date(),
          },
          function (err, datasubmitted) {
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
                  // return res.status(200).jsonp({
                  //   status: true,
                  //   message: "KYC has been submitted successfully.",
                  //   authorization: resp.token,
                  // });

                  var accountdetails = await account_details.findOne({ kyc_id: req.body._id }).catch((ex) => { loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`); return res.status(400).jsonp({ status: false, message: "Bad request!" }); })
                  if (!accountdetails) {
                    return res.status(200).jsonp({ status: true, data: null, authorization: resp.token });
                  }
                  else {
                    SendGrid.sendKycSubmissionMail(accountdetails.email, async function (result) {
                      if (result != null) {

                        await notifications.create({
                          notification_sent_to: "admin",
                          message: `KYC request by ${datasubmitted.company_name} is pending.`
                        })

                        return res.status(200).jsonp({
                          status: true,
                          message: "KYC has been submitted successfully.",
                          authorization: resp.token,
                        });

                      }

                    })
                    // return res.status(200).jsonp({ status: true, data: update_aw_tokens_avaliable, authorization: resp.token });

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
      }
    }
  },

  updateCompanyLogoAsync: async (req, res) => {
    if (
      !req.headers.userid ||
      !req.headers.username ||
      !req.headers.authorization
    ) {
      return res.status(400).jsonp({ status: false, message: "Bad request!" });
    } else {
      if (!req.body._id) {
        return res.status(422).jsonp("I know you have it in you, Try again!");
      }

      // console.log("Nikhil",req.files);
      // console.log("companyphotos",req.body);
      // var file = req.file;

      var companylogo = req.files.companylogo[0];
      // var companypdf = req.files.companypdf[0];
      // var companyphotos = req.files.companyphotos;
      // var companyphotosname = companyphotos.map(a => a.filename.replace(/\s/g, ''));

      // var certificates = [];

      const map = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#x27;",
        "/": "&#x2F;",
      };

      const reg = /[&<>"'/]/gi;
      var _id = req.body._id.replace(reg, (match) => map[match]);
      var temp_kyc_status = await kyc_details.findOne({ _id: mongoose.Types.ObjectId(req.body._id) }).select(['kyc_status']).catch((ex) => { loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`); return res.status(500).jsonp({ status: false, message: ex }); })
      if (!req.headers.adminflag) {
        kyc_details.findByIdAndUpdate(
          { _id: mongoose.Types.ObjectId(_id) },
          {
            company_logo: companylogo.filename.replace(/\s/g, ""),
            kyc_status: req.body.is_updatetable == true && temp_kyc_status == "3" ? "2" : "1",

            // company_profile_pdf: companypdf.filename.replace(/\s/g, ''),
            // company_presentation: companypresentation,
            // company_photos : companyphotosname
            // modified_by: req.headers.userid,
            modified_date: new Date(),
          },

          function (err, datasubmitted) {
            if (err) {
              loggerhandler.logger.error(`${err} ,email:${req.headers.email}`);
              return res.status(500).jsonp({ status: false, message: err });
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
                    message: "Company logo has been updated successfully.",
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
        )
      } else {
        kyc_details.findByIdAndUpdate(
          { _id: mongoose.Types.ObjectId(_id) },
          {
            company_logo: companylogo.filename.replace(/\s/g, ""),
            // company_profile_pdf: companypdf.filename.replace(/\s/g, ''),
            // company_presentation: companypresentation,
            // company_photos : companyphotosname
            // modified_by: req.headers.userid,
            modified_date: new Date(),
          },
          function (err, datasubmitted) {
            if (err) {
              loggerhandler.logger.error(`${err} ,email:${req.headers.email}`);
              return res.status(500).jsonp({ status: false, message: err });
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
                    message: "Company logo has been updated successfully.",
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
        );
      }


    }
  },

  updateComapnyPresentationAsync: async (req, res) => {


    if (
      !req.headers.userid ||
      !req.headers.username ||
      !req.headers.authorization
    ) {
      return res.status(400).jsonp({ status: false, message: "Bad request!" });
    } else {
      if (!req.body._id || !req.body.companypresentation) {
        return res.status(422).jsonp("I know you have it in you, Try again!");
      }


      // console.log('hi',req.body.companypresentation)



      // console.log("Nikhil",req.files);
      // console.log("companyphotos",req.body);
      // var file = req.file;

      // var companylogo = req.files.companylogo[0];
      // var companypdf = req.files.companypdf[0];
      // var companyphotos = req.files.companyphotos;
      // var companyphotosname = companyphotos.map(a => a.filename.replace(/\s/g, ''));

      // var certificates = [];
      var companypresentation = req.body.companypresentation
      // const map = {
      //   "&": "&amp;",
      //   "<": "&lt;",
      //   ">": "&gt;",
      //   '"': "&quot;",
      //   "'": "&#x27;",
      //   "/": "&#x2F;",
      // };

      const reg = /[&<>"'/]/gi;
      var _id = req.body._id.replace(reg, (match) => map[match]);
      // var companypresentation = req.body.companypresentation.replace(
      //   reg,
      //   (match) => map[match]
      // );

      // var tempobject = {
      //   'licensenumber': licenseNumber,
      //   'validthru': validThru,
      //   'path': file.filename.replace(/\s/g, ''),
      //   'status': 'Under Verification'
      // }

      // var details = await kyc_details.findOne({ _id: mongoose.Types.ObjectId(_id) }).catch((ex) => { res.status(500).jsonp({ status: false, message: ex }); });
      // var env_certificates = details.aware_tracer;

      // env_certificates.forEach(element => {
      //   certificates.push(element);
      // })

      // certificates.push(tempobject);ss


      var temp_kyc_status = await kyc_details.findOne({ _id: mongoose.Types.ObjectId(req.body._id) }).select(['kyc_status']).catch((ex) => { loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`); return res.status(500).jsonp({ status: false, message: ex }); })
      if (!req.headers.adminflag) {
        kyc_details.findByIdAndUpdate(
          { _id: mongoose.Types.ObjectId(_id) },
          {
            // company_logo: companylogo.filename.replace(/\s/g, ''),
            // company_profile_pdf: companypdf.filename.replace(/\s/g, ''),
            company_presentation: companypresentation,
            kyc_status: req.body.is_updatetable == true && temp_kyc_status == "3" ? "2" : "1",

            // company_photos : companyphotosname
            // modified_by: req.headers.userid,
            modified_date: new Date(),
          },
          function (err, datasubmitted) {
            if (err) {
              loggerhandler.logger.error(`${err} ,email:${req.headers.email}`);
              return res.status(500).jsonp({ status: false, message: err });
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
                    message: "Company glance has been updated successfully.",
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
        )
      } else {
        [
        ],
          kyc_details.findByIdAndUpdate(
            { _id: mongoose.Types.ObjectId(_id) },
            {
              // company_logo: companylogo.filename.replace(/\s/g, ''),
              // company_profile_pdf: companypdf.filename.replace(/\s/g, ''),
              company_presentation: companypresentation,

              // company_photos : companyphotosname
              // modified_by: req.headers.userid,
              modified_date: new Date(),
            },
            function (err, datasubmitted) {
              if (err) {
                loggerhandler.logger.error(`${err} ,email:${req.headers.email}`);
                return res.status(500).jsonp({ status: false, message: err });
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
                      message: "Company glance has been updated successfully.",
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
          );
      }

    }
  },

  updateCompanyPdfAsync: async (req, res) => {
    if (
      !req.headers.userid ||
      !req.headers.username ||
      !req.headers.authorization
    ) {
      return res.status(400).jsonp({ status: false, message: "Bad request!" });
    } else {
      if (!req.body._id) {
        return res.status(422).jsonp("I know you have it in you, Try again!");
      }

      // console.log("Nikhil",req.files);
      // console.log("companyphotos",req.body);
      // var file = req.file;

      // var companylogo = req.files.companylogo[0];
      var companypdf = req.files.companypdf[0];
      // var companyphotos = req.files.companyphotos;
      // var companyphotosname = companyphotos.map(a => a.filename.replace(/\s/g, ''));

      // var certificates = [];

      const map = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#x27;",
        "/": "&#x2F;",
      };

      const reg = /[&<>"'/]/gi;
      var _id = req.body._id.replace(reg, (match) => map[match]);
      // var companypresentation = req.body.companypresentation.replace(reg, (match) => (map[match]));

      // var temp = []
      //  var tempobject = {
      //     'name': req.body.project_case,
      //   }
      //   temp.push(tempobject);

      // var tempobject = {
      //   'licensenumber': licenseNumber,
      //   'validthru': validThru,
      //   'path': file.filename.replace(/\s/g, ''),
      //   'status': 'Under Verification'
      // }

      // var details = await kyc_details.findOne({ _id: mongoose.Types.ObjectId(_id) }).catch((ex) => { res.status(500).jsonp({ status: false, message: ex }); });
      // var env_certificates = details.aware_tracer;

      // env_certificates.forEach(element => {
      //   certificates.push(element);
      // })

      // certificates.push(tempobject);
      var temp_kyc_status = await kyc_details.findOne({ _id: mongoose.Types.ObjectId(req.body._id) }).select(['kyc_status']).catch((ex) => { loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`); return res.status(500).jsonp({ status: false, message: ex }); })
      if (!req.headers.adminflag) {
        kyc_details.findByIdAndUpdate(
          { _id: mongoose.Types.ObjectId(_id) },
          {
            // company_logo: companylogo.filename.replace(/\s/g, ''),
            company_profile_pdf: companypdf.filename,
            kyc_status: req.body.is_updatetable == true && temp_kyc_status == "3" ? "2" : "1",

            // company_presentation: companypresentation,
            // company_photos : companyphotosname
            // modified_by: req.headers.userid,
            modified_date: new Date(),
          },
          function (err, datasubmitted) {
            if (err) {
              loggerhandler.logger.error(`${err} ,email:${req.headers.email}`);
              return res.status(500).jsonp({ status: false, message: err });
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
                    message: "Company PDF has been updated successfully.",
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
        )
      } else {
        kyc_details.findByIdAndUpdate(
          { _id: mongoose.Types.ObjectId(_id) },
          {
            // company_logo: companylogo.filename.replace(/\s/g, ''),
            company_profile_pdf: companypdf.filename,


            // company_presentation: companypresentation,
            // company_photos : companyphotosname
            // modified_by: req.headers.userid,
            modified_date: new Date(),
          },
          function (err, datasubmitted) {
            if (err) {
              loggerhandler.logger.error(`${err} ,email:${req.headers.email}`);
              return res.status(500).jsonp({ status: false, message: err });
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
                    message: "Company PDF has been updated successfully.",
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
        );
      }

    }
  },

  //nikhil 
  deleteCompanyPdfAsync: async (req, res) => {
    if (
      !req.headers.userid ||
      !req.headers.username ||
      !req.headers.authorization
    ) {
      return res.status(400).jsonp({ status: false, message: "Bad request!" });
    } else {
      if (!req.body._id) {
        return res.status(422).jsonp("I know you have it in you, Try again!");
      }

      const map = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#x27;",
        "/": "&#x2F;",
      };
      const reg = /[&<>"'/]/gi;
      var _id = req.body._id.replace(reg, (match) => map[match]);

      var temp_kyc_status = await kyc_details.findOne({ _id: mongoose.Types.ObjectId(req.body._id) }).select(['kyc_status']).catch((ex) => { loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`); return res.status(500).jsonp({ status: false, message: ex }); })
      if (!req.headers.adminflag) {
        kyc_details.findByIdAndUpdate(
          { _id: mongoose.Types.ObjectId(_id) },
          {
            company_profile_pdf: null,
            kyc_status: req.body.is_updatetable == true && temp_kyc_status == "3" ? "2" : "1",
            modified_by: req.headers.userid,
            modified_date: new Date(),
          },
          function (err, datasubmitted) {
            if (err) {
              loggerhandler.logger.error(`${err} ,email:${req.headers.email}`);
              return res.status(500).jsonp({ status: false, message: err });
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
                    message: "Company Pdf has been removed.",
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
        )
      } else {
        kyc_details.findByIdAndUpdate(
          { _id: mongoose.Types.ObjectId(_id) },
          {
            company_profile_pdf: null,
            modified_by: req.headers.userid,
            modified_date: new Date(),
          },
          function (err, datasubmitted) {
            if (err) {
              loggerhandler.logger.error(`${err} ,email:${req.headers.email}`);
              return res.status(500).jsonp({ status: false, message: err });
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
                    message: "Company Pdf has been removed.",
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
        );
      }

    }
  },

  updateCompanyPhotoOneAsync: async (req, res) => {
    if (
      !req.headers.userid ||
      !req.headers.username ||
      !req.headers.authorization
    ) {
      return res.status(400).jsonp({ status: false, message: "Bad request!" });
    } else {
      if (!req.body._id) {
        return res.status(422).jsonp("I know you have it in you, Try again!");
      }
      // console.log("Nikhil", req.files);
      // console.log("companyphotos", req.body);
      // var file = req.file;
      // var companylogo = req.files.companylogo[0];
      // var companypdf = req.files.companypdf[0];
      var companyphotos = req.files.companyphotofile[0];


      // console.log("companyphotos", companyphotos);

      const map = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#x27;",
        "/": "&#x2F;",
      };
      const reg = /[&<>"'/]/gi;
      var _id = req.body._id.replace(reg, (match) => map[match]);
      var type = req.body.type.replace(reg, (match) => map[match]);

      // console.log("type", type);
      // certificates.push(tempobject);
      var temp_kyc_status = await kyc_details.findOne({ _id: mongoose.Types.ObjectId(req.body._id) }).select(['kyc_status']).catch((ex) => { loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`); return res.status(500).jsonp({ status: false, message: ex }); })
      if (!req.headers.adminflag) {
        if (type == 1) {
          kyc_details.findByIdAndUpdate(
            { _id: mongoose.Types.ObjectId(_id) },
            {
              company_photo_one: companyphotos.filename,
              kyc_status: req.body.is_updatetable == true && temp_kyc_status == "3" ? "2" : "1",
              modified_by: req.headers.userid,
              modified_date: new Date(),
            },
            function (err, datasubmitted) {
              if (err) {
                loggerhandler.logger.error(`${err} ,email:${req.headers.email}`);
                return res.status(500).jsonp({ status: false, message: err });
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
                      message: "Company logo has been updated to the directory.",
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
          );
        } else if (type == 2) {
          kyc_details.findByIdAndUpdate(
            { _id: mongoose.Types.ObjectId(_id) },
            {
              // company_logo: companylogo.filename.replace(/\s/g, ''),
              // company_profile_pdf: companypdf.filename.replace(/\s/g, ''),
              // company_presentation: companypresentation,
              company_photo_two: companyphotos.filename,
              kyc_status: req.body.is_updatetable == true && temp_kyc_status == "3" ? "2" : "1",
              modified_by: req.headers.userid,
              modified_date: new Date(),
            },
            function (err, datasubmitted) {
              if (err) {
                loggerhandler.logger.error(`${err} ,email:${req.headers.email}`);
                return res.status(500).jsonp({ status: false, message: err });
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
                      message: "Company logo has been updated to the directory.",
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
          );
        } else if (type == 3) {
          kyc_details.findByIdAndUpdate(
            { _id: mongoose.Types.ObjectId(_id) },
            {
              // company_logo: companylogo.filename.replace(/\s/g, ''),
              // company_profile_pdf: companypdf.filename.replace(/\s/g, ''),
              // company_presentation: companypresentation,
              company_photo_three: companyphotos.filename,
              kyc_status: req.body.is_updatetable == true && temp_kyc_status == "3" ? "2" : "1",
              modified_by: req.headers.userid,
              modified_date: new Date(),
            },
            function (err, datasubmitted) {
              if (err) {
                loggerhandler.logger.error(`${err} ,email:${req.headers.email}`);
                return res.status(500).jsonp({ status: false, message: err });
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
                      message: "Company logo has been updated to the directory.",
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
          );
        } else if (type == 4) {
          kyc_details.findByIdAndUpdate(
            { _id: mongoose.Types.ObjectId(_id) },
            {
              // company_logo: companylogo.filename.replace(/\s/g, ''),
              // company_profile_pdf: companypdf.filename.replace(/\s/g, ''),
              // company_presentation: companypresentation,
              company_photo_four: companyphotos.filename,
              kyc_status: req.body.is_updatetable == true && temp_kyc_status == "3" ? "2" : "1",
              modified_by: req.headers.userid,
              modified_date: new Date(),
            },
            function (err, datasubmitted) {
              if (err) {
                loggerhandler.logger.error(`${err} ,email:${req.headers.email}`);
                return res.status(500).jsonp({ status: false, message: err });
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
                      message: "Company logo has been updated to the directory.",
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
          );
        } else if (type == 5) {
          kyc_details.findByIdAndUpdate(
            { _id: mongoose.Types.ObjectId(_id) },
            {
              // company_logo: companylogo.filename.replace(/\s/g, ''),
              // company_profile_pdf: companypdf.filename.replace(/\s/g, ''),
              // company_presentation: companypresentation,
              company_photo_five: companyphotos.filename,
              kyc_status: req.body.is_updatetable == true && temp_kyc_status == "3" ? "2" : "1",
              modified_by: req.headers.userid,
              modified_date: new Date(),
            },
            function (err, datasubmitted) {
              if (err) {
                loggerhandler.logger.error(`${err} ,email:${req.headers.email}`);
                return res.status(500).jsonp({ status: false, message: err });
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
                      message: "Company logo has been updated to the directory.",
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
          );
        }
      } else {

        if (type == 1) {
          kyc_details.findByIdAndUpdate(
            { _id: mongoose.Types.ObjectId(_id) },
            {
              company_photo_one: companyphotos.filename,

              modified_by: req.headers.userid,
              modified_date: new Date(),
            },
            function (err, datasubmitted) {
              if (err) {
                loggerhandler.logger.error(`${err} ,email:${req.headers.email}`);
                return res.status(500).jsonp({ status: false, message: err });
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
                      message: "Company logo has been updated to the directory.",
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
          );
        } else if (type == 2) {
          kyc_details.findByIdAndUpdate(
            { _id: mongoose.Types.ObjectId(_id) },
            {
              // company_logo: companylogo.filename.replace(/\s/g, ''),
              // company_profile_pdf: companypdf.filename.replace(/\s/g, ''),
              // company_presentation: companypresentation,
              company_photo_two: companyphotos.filename,
              modified_by: req.headers.userid,
              modified_date: new Date(),
            },
            function (err, datasubmitted) {
              if (err) {
                loggerhandler.logger.error(`${err} ,email:${req.headers.email}`);
                return res.status(500).jsonp({ status: false, message: err });
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
                      message: "Company logo has been updated to the directory.",
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
          );
        } else if (type == 3) {
          kyc_details.findByIdAndUpdate(
            { _id: mongoose.Types.ObjectId(_id) },
            {
              // company_logo: companylogo.filename.replace(/\s/g, ''),
              // company_profile_pdf: companypdf.filename.replace(/\s/g, ''),
              // company_presentation: companypresentation,
              company_photo_three: companyphotos.filename,

              modified_by: req.headers.userid,
              modified_date: new Date(),
            },
            function (err, datasubmitted) {
              if (err) {
                loggerhandler.logger.error(`${err} ,email:${req.headers.email}`);
                return res.status(500).jsonp({ status: false, message: err });
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
                      message: "Company logo has been updated to the directory.",
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
          );
        } else if (type == 4) {
          kyc_details.findByIdAndUpdate(
            { _id: mongoose.Types.ObjectId(_id) },
            {
              // company_logo: companylogo.filename.replace(/\s/g, ''),
              // company_profile_pdf: companypdf.filename.replace(/\s/g, ''),
              // company_presentation: companypresentation,
              company_photo_four: companyphotos.filename,

              modified_by: req.headers.userid,
              modified_date: new Date(),
            },
            function (err, datasubmitted) {
              if (err) {
                loggerhandler.logger.error(`${err} ,email:${req.headers.email}`);
                return res.status(500).jsonp({ status: false, message: err });
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
                      message: "Company logo has been updated to the directory.",
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
          );
        } else if (type == 5) {
          kyc_details.findByIdAndUpdate(
            { _id: mongoose.Types.ObjectId(_id) },
            {
              // company_logo: companylogo.filename.replace(/\s/g, ''),
              // company_profile_pdf: companypdf.filename.replace(/\s/g, ''),
              // company_presentation: companypresentation,
              company_photo_five: companyphotos.filename,

              modified_by: req.headers.userid,
              modified_date: new Date(),
            },
            function (err, datasubmitted) {
              if (err) {
                loggerhandler.logger.error(`${err} ,email:${req.headers.email}`);
                return res.status(500).jsonp({ status: false, message: err });
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
                      message: "Company logo has been updated to the directory.",
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
          );
        }
      }



    }
  },

  updateAcknowledgementAsync: async (req, res) => {
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
      } else {
        // var userDetails = await account_details.findOne({ _id: mongoose.Types.ObjectId(req.headers.userid) }).catch((ex) => { return res.status(400).jsonp({ status: false, message: "Bad request!" }); })
        account_details.findByIdAndUpdate(
          { _id: mongoose.Types.ObjectId(req.headers.userid) },
          {
            acknowledgement: true,
          },
          function (err, datasubmitted) {
            if (err) {
              loggerhandler.logger.error(`${err} ,email:${req.headers.email}`);
              return res.status(500).jsonp({ status: false, message: err });
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
                    message: "Acknowledged!",
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
        );
      }
    }
  },

  deleteCompanyPhotoOneAsync: async (req, res) => {
    if (
      !req.headers.userid ||
      !req.headers.username ||
      !req.headers.authorization
    ) {
      return res.status(400).jsonp({ status: false, message: "Bad request!" });
    } else {
      if (!req.body._id) {
        return res.status(422).jsonp("I know you have it in you, Try again!");
      }
      // console.log("Nikhil", req.files);
      // console.log("companyphotos", req.body);
      // var file = req.file;
      // var companylogo = req.files.companylogo[0];
      // var companypdf = req.files.companypdf[0];


      const map = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#x27;",
        "/": "&#x2F;",
      };
      const reg = /[&<>"'/]/gi;
      var _id = req.body._id;
      var type = req.body.type;

      // console.log("type", type);
      // certificates.push(tempobject);
      var temp_kyc_status = await kyc_details.findOne({ _id: mongoose.Types.ObjectId(req.body._id) }).select(['kyc_status']).catch((ex) => { loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`); return res.status(500).jsonp({ status: false, message: ex }); })
      if (!req.headers.adminflag) {
        if (type == 1) {
          kyc_details.findByIdAndUpdate(
            { _id: mongoose.Types.ObjectId(_id) },
            {
              company_photo_one: null,
              kyc_status: req.body.is_updatetable == true && temp_kyc_status == "3" ? "2" : "1",
              modified_by: req.headers.userid,
              modified_date: new Date(),
            },
            function (err, datasubmitted) {
              if (err) {
                loggerhandler.logger.error(`${err} ,email:${req.headers.email}`);
                return res.status(500).jsonp({ status: false, message: err });
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
                      message: "Company logo has been updated to the directory.",
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
          );
        } else if (type == 2) {
          kyc_details.findByIdAndUpdate(
            { _id: mongoose.Types.ObjectId(_id) },
            {
              // company_logo: companylogo.filename.replace(/\s/g, ''),
              // company_profile_pdf: companypdf.filename.replace(/\s/g, ''),
              // company_presentation: companypresentation,
              company_photo_two: null,
              kyc_status: req.body.is_updatetable == true && temp_kyc_status == "3" ? "2" : "1",
              modified_by: req.headers.userid,
              modified_date: new Date(),
            },
            function (err, datasubmitted) {
              if (err) {
                loggerhandler.logger.error(`${err} ,email:${req.headers.email}`);
                return res.status(500).jsonp({ status: false, message: err });
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
                      message: "Company logo has been updated to the directory.",
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
          );
        } else if (type == 3) {
          kyc_details.findByIdAndUpdate(
            { _id: mongoose.Types.ObjectId(_id) },
            {
              // company_logo: companylogo.filename.replace(/\s/g, ''),
              // company_profile_pdf: companypdf.filename.replace(/\s/g, ''),
              // company_presentation: companypresentation,
              company_photo_three: null,
              kyc_status: req.body.is_updatetable == true && temp_kyc_status == "3" ? "2" : "1",
              modified_by: req.headers.userid,
              modified_date: new Date(),
            },
            function (err, datasubmitted) {
              if (err) {
                loggerhandler.logger.error(`${err} ,email:${req.headers.email}`);
                return res.status(500).jsonp({ status: false, message: err });
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
                      message: "Company logo has been updated to the directory.",
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
          );
        } else if (type == 4) {
          kyc_details.findByIdAndUpdate(
            { _id: mongoose.Types.ObjectId(_id) },
            {
              // company_logo: companylogo.filename.replace(/\s/g, ''),
              // company_profile_pdf: companypdf.filename.replace(/\s/g, ''),
              // company_presentation: companypresentation,
              company_photo_four: null,
              kyc_status: req.body.is_updatetable == true && temp_kyc_status == "3" ? "2" : "1",
              modified_by: req.headers.userid,
              modified_date: new Date(),
            },
            function (err, datasubmitted) {
              if (err) {
                loggerhandler.logger.error(`${err} ,email:${req.headers.email}`);
                return res.status(500).jsonp({ status: false, message: err });
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
                      message: "Company logo has been updated to the directory.",
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
          );
        } else if (type == 5) {
          kyc_details.findByIdAndUpdate(
            { _id: mongoose.Types.ObjectId(_id) },
            {
              // company_logo: companylogo.filename.replace(/\s/g, ''),
              // company_profile_pdf: companypdf.filename.replace(/\s/g, ''),
              // company_presentation: companypresentation,
              company_photo_five: null,
              kyc_status: req.body.is_updatetable == true && temp_kyc_status == "3" ? "2" : "1",
              modified_by: req.headers.userid,
              modified_date: new Date(),
            },
            function (err, datasubmitted) {
              if (err) {
                loggerhandler.logger.error(`${err} ,email:${req.headers.email}`);
                return res.status(500).jsonp({ status: false, message: err });
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
                      message: "Company logo has been updated to the directory.",
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
          );
        }
      } else {
        if (type == 1) {
          kyc_details.findByIdAndUpdate(
            { _id: mongoose.Types.ObjectId(_id) },
            {
              company_photo_one: null,

              modified_by: req.headers.userid,
              modified_date: new Date(),
            },
            function (err, datasubmitted) {
              if (err) {
                loggerhandler.logger.error(`${err} ,email:${req.headers.email}`);
                return res.status(500).jsonp({ status: false, message: err });
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
                      message: "Company logo has been updated to the directory.",
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
          );
        } else if (type == 2) {
          kyc_details.findByIdAndUpdate(
            { _id: mongoose.Types.ObjectId(_id) },
            {
              // company_logo: companylogo.filename.replace(/\s/g, ''),
              // company_profile_pdf: companypdf.filename.replace(/\s/g, ''),
              // company_presentation: companypresentation,
              company_photo_two: null,

              modified_by: req.headers.userid,
              modified_date: new Date(),
            },
            function (err, datasubmitted) {
              if (err) {
                loggerhandler.logger.error(`${err} ,email:${req.headers.email}`);
                return res.status(500).jsonp({ status: false, message: err });
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
                      message: "Company logo has been updated to the directory.",
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
          );
        } else if (type == 3) {
          kyc_details.findByIdAndUpdate(
            { _id: mongoose.Types.ObjectId(_id) },
            {
              // company_logo: companylogo.filename.replace(/\s/g, ''),
              // company_profile_pdf: companypdf.filename.replace(/\s/g, ''),
              // company_presentation: companypresentation,
              company_photo_three: null,

              modified_by: req.headers.userid,
              modified_date: new Date(),
            },
            function (err, datasubmitted) {
              if (err) {
                loggerhandler.logger.error(`${err} ,email:${req.headers.email}`);
                return res.status(500).jsonp({ status: false, message: err });
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
                      message: "Company logo has been updated to the directory.",
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
          );
        } else if (type == 4) {
          kyc_details.findByIdAndUpdate(
            { _id: mongoose.Types.ObjectId(_id) },
            {
              // company_logo: companylogo.filename.replace(/\s/g, ''),
              // company_profile_pdf: companypdf.filename.replace(/\s/g, ''),
              // company_presentation: companypresentation,
              company_photo_four: null,

              modified_by: req.headers.userid,
              modified_date: new Date(),
            },
            function (err, datasubmitted) {
              if (err) {
                loggerhandler.logger.error(`${err} ,email:${req.headers.email}`);
                return res.status(500).jsonp({ status: false, message: err });
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
                      message: "Company logo has been updated to the directory.",
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
          );
        } else if (type == 5) {
          kyc_details.findByIdAndUpdate(
            { _id: mongoose.Types.ObjectId(_id) },
            {
              // company_logo: companylogo.filename.replace(/\s/g, ''),
              // company_profile_pdf: companypdf.filename.replace(/\s/g, ''),
              // company_presentation: companypresentation,
              company_photo_five: null,

              modified_by: req.headers.userid,
              modified_date: new Date(),
            },
            function (err, datasubmitted) {
              if (err) {
                loggerhandler.logger.error(`${err} ,email:${req.headers.email}`);
                return res.status(500).jsonp({ status: false, message: err });
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
                      message: "Company logo has been updated to the directory.",
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
          );
        }
      }




    }
  },

  getAvailableUsersInSystem: async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).jsonp(errors.array());
    }
    else {
      if (!req.headers.userid || !req.headers.username || !req.headers.authorization || !req.headers.aware_id) {
        return res.status(400).jsonp({ status: false, message: "Bad request!" });
      }


      const request_i_have_accepted = await requests.find({ receiver_aware_id: req.headers.aware_id, isdeleted: false }).catch((ex) => { loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`); return res.status(500).jsonp({ status: false, message: ex.toString() }) })

      const request_i_have_sent = await requests.find({ sender_aware_id: req.headers.aware_id, isdeleted: false }).catch((ex) => { loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`); return res.status(500).jsonp({ status: false, message: ex.toString() }) })


      const output = [];
      const map = new Map();
      for (const item of request_i_have_accepted) {
        if (!map.has(item.sender_aware_id.toString())) {
          map.set(item.sender_aware_id.toString(), true); // set any value to Map
          output.push(item.sender_aware_id.toString());
        }
      }

      for (const item of request_i_have_sent) {
        if (!map.has(item.receiver_aware_id.toString())) {
          map.set(item.receiver_aware_id.toString(), true); // set any value to Map
          output.push(item.receiver_aware_id.toString());
        }
      }

      var JsonArray = await kyc_details.find({ kyc_status: "3", aware_id: { $nin: output } }).select(["company_name", "aware_id", "_id"]).catch((ex) => { loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`); return res.status(500).jsonp({ status: false, message: ex }) });

      const output2 = [];
      const map2 = new Map();
      for (const item of JsonArray) {
        if (!map2.has(item._id.toString())) {
          map2.set(item._id.toString(), true); // set any value to Map
          output2.push(item._id.toString());
        }
      }

      var accounts_found = await account_details.find({ kyc_id: { $in: output2 }, is_deleted: false }).select(["role_id", "kyc_id"]).catch((ex) => { loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`); return res.status(500).jsonp({ status: false, message: ex }) });
      var user_roles = await user_role.find().select(["role_id", "role_name"]).catch((ex) => { loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`); return res.status(500).jsonp({ status: false, message: ex }) });
      // console.log('account', accounts_found)
      // console.log('user_roles', user_roles)


      var JsonSerialize = [];
      for (const item of JsonArray) {

        var role_id = accounts_found.find(x => x.kyc_id == item._id.toString())?.role_id;
        var role_name = user_roles.find(x => x.role_id == role_id)?.role_name;

        if (role_id) {
          var temp = {
            "company_name": item.company_name,
            "aware_id": item.aware_id,
            "role_name": role_name,
            "role_id": role_id,
            "_id": item._id
          }

          JsonSerialize.push(temp)
        }
      }

      JsonSerialize = JsonSerialize.filter(x => x.aware_id != req.headers.aware_id);

      var payload = { username: req.headers.username };
      refresh(req.headers.authorization, req.headers.userid, payload,
        function (resp) {
          if (resp.status == true) {
            return res.status(200).jsonp({ status: true, data: JsonSerialize, authorization: resp.token });
          } else {
            return res.status(resp.code).jsonp({ status: false, data: null, authorization: null });
          }
        }
      );


    }
  },

  getProducers: async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).jsonp(errors.array());
    }
    else {
      if (!req.headers.userid || !req.headers.username || !req.headers.authorization) {
        return res.status(400).jsonp({ status: false, message: "Bad request!" });
      }


      var JsonArray = await user_role.find({ role_id: { $in: [2, 3, 4, 5, 6, 7] } }).select(["role_id", "role_name"]).catch((ex) => { loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`); return res.status(500).jsonp({ status: false, message: ex }) });


      var payload = { username: req.headers.username };
      refresh(req.headers.authorization, req.headers.userid, payload,
        function (resp) {
          if (resp.status == true) {
            return res.status(200).jsonp({ status: true, data: JsonArray, authorization: resp.token });
          } else {
            return res.status(resp.code).jsonp({ status: false, data: null, authorization: null });
          }
        }
      );


    }
  },

  postRequestAsync: async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).jsonp({ status: false, message: "Bad payload received." })
    }
    else {

      const requests_exist = await requests.findOne({ sender_aware_id: req.body.sender_aware_id, receiver_aware_id: req.body.receiver_aware_id, isdeleted: false }).catch((ex) => { loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`); return res.status(500).jsonp({ status: false, message: ex.toString() }) })
      const kyc = await kyc_details.findOne({ aware_id: req.body.sender_aware_id, isdeleted: false }).catch((ex) => { loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`); return res.status(500).jsonp({ status: false, message: ex.toString() }) })


      var payload = { username: req.headers.username };
      refresh(req.headers.authorization, req.headers.userid, payload, async function (resp) {
        if (resp.status == true) {


          if (requests_exist) {
            return res.status(200).jsonp({ status: true, message: "Request sent already waiting for response.", authorization: resp.token });
          }


          requests.create(
            {
              sender_aware_id: req.body.sender_aware_id,
              // producer_id: req.body.producer_id,
              // producer_name: req.body.producer_name,
              // company_name: req.body.company_name,
              receiver_aware_id: req.body.receiver_aware_id,
              isdeleted: false

            },
            async function (err, user) {
              if (err) {
                loggerhandler.logger.error(`${err} ,email:${req.headers.email}`); return res.status(500).jsonp({ status: false, message: err.toString() })
              }
              await notifications.create({
                notification_sent_to: req.body.receiver_aware_id,
                message: `You have received a relation request from ${kyc?.company_name}.`
              })

              return res.status(200).jsonp({ status: true, message: "Add Relation request has been sent successfully", authorization: resp.token });

            })






          // await requests.findOneAndUpdate({ _awareid: req.body._awareid, _id: mongoose.Types.ObjectId(req.body.aware_token_id) },
          //   {
          //     status: 'SEND',
          //   },
          //   { new: true },
          //   async function (err, user) {
          //     if (err) return res.status(500).jsonp({ status: false, message: err.toString() })

          //     return res.status(200).jsonp({ status: true, message: "Token request has been generated.", authorization: resp.token });

          //   })

        }
        else {
          return res.status(resp.code).jsonp({ status: false, message: null, authorization: null });
        }
      });

    }
  },

  getSentRequestsAsync: async (req, res) => {
    // let sender_aware_id = req.headers.sender_aware_id
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).jsonp(errors.array())
    }
    else {

      if (!req.headers.userid || !req.headers.username || !req.headers.authorization || !req.headers.sender_aware_id) {
        return res.status(400).jsonp({ status: false, message: "Bad request!" });
      }

      const request_data = await requests.find({ sender_aware_id: req.headers.sender_aware_id, status: { $ne: "Accepted" }, isdeleted: false }).catch((ex) => { loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`); return res.status(500).jsonp({ status: false, message: ex.toString() }) })

      const output = [];
      const map = new Map();
      for (const item of request_data) {
        if (!map.has(item.receiver_aware_id.toString())) {
          map.set(item.receiver_aware_id.toString(), true); // set any value to Map
          output.push(item.receiver_aware_id.toString());
        }
      }


      var kyc_details_data = await kyc_details.find({ aware_id: { $in: output } }).select(["company_name", "aware_id", "_id"]).catch((ex) => { loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`); return res.status(500).jsonp({ status: false, message: ex }) });

      const output2 = [];
      const map2 = new Map();
      for (const item of kyc_details_data) {
        if (!map2.has(item._id)) {
          map2.set(item._id, true); // set any value to Map
          output2.push(item._id);
        }
      }

      var accounts_found = await account_details.find({ kyc_id: { $in: output2 } }).select(["role_id", "kyc_id"]).catch((ex) => { loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`); return res.status(500).jsonp({ status: false, message: ex }) });
      var user_roles = await user_role.find().select(["role_id", "role_name"]).catch((ex) => { loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`); return res.status(500).jsonp({ status: false, message: ex }) });

      var jsonArray = [];
      for (const item of request_data) {

        var details_to_send = kyc_details_data.find(x => x.aware_id == item.receiver_aware_id);
        var role_id = accounts_found.find(x => x.kyc_id == details_to_send._id.toString()).role_id;
        var role_name = user_roles.find(x => x.role_id == role_id).role_name;

        var rawobject = {
          _id: details_to_send._id,
          company_name: details_to_send.company_name,
          aware_id: details_to_send.aware_id,
          role_name: role_name,
          status: item.status
        }

        jsonArray.push(rawobject);

      }


      var payload = { username: req.headers.username };
      refresh(req.headers.authorization, req.headers.userid, payload, function (resp) {
        if (resp.status == true) {
          return res.status(200).jsonp({ status: true, data: jsonArray, authorization: resp.token });
        }
        else {
          return res.status(resp.code).jsonp({ status: false, data: null, authorization: null });
        }
      });
    }
  },

  getReceivedRequestsAsync: async (req, res) => {
    // let receiver_aware_id = req.headers.receiver_aware_id
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).jsonp(errors.array())
    }
    else {

      if (!req.headers.userid || !req.headers.username || !req.headers.authorization || !req.headers.receiver_aware_id) {
        return res.status(400).jsonp({ status: false, message: "Bad request!" });
      }

      const request_data = await requests.find({ receiver_aware_id: req.headers.receiver_aware_id, status: { $ne: "Accepted" }, isdeleted: false }).catch((ex) => { loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`); return res.status(500).jsonp({ status: false, message: ex.toString() }) })

      // console.log("request_data", request_data)
      const output = [];
      const map = new Map();
      for (const item of request_data) {
        if (!map.has(item.sender_aware_id.toString())) {
          map.set(item.sender_aware_id.toString(), true); // set any value to Map
          output.push(item.sender_aware_id.toString());
        }
      }

      var kyc_details_data = await kyc_details.find({ aware_id: { $in: output } }).select(["company_name", "aware_id", "_id"]).catch((ex) => { loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`); return res.status(500).jsonp({ status: false, message: ex }) });

      const output2 = [];
      const map2 = new Map();
      for (const item of kyc_details_data) {
        if (!map2.has(item._id)) {
          map2.set(item._id, true); // set any value to Map
          output2.push(item._id);
        }
      }

      var accounts_found = await account_details.find({ kyc_id: { $in: output2 } }).select(["role_id", "kyc_id"]).catch((ex) => { loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`); return res.status(500).jsonp({ status: false, message: ex }) });
      var user_roles = await user_role.find().select(["role_id", "role_name"]).catch((ex) => { loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`); return res.status(500).jsonp({ status: false, message: ex }) });

      var jsonArray = [];
      for (const item of request_data) {

        var details_to_send = kyc_details_data.find(x => x.aware_id == item.sender_aware_id);
        var role_id = accounts_found.find(x => x.kyc_id == details_to_send._id.toString()).role_id;
        var role_name = user_roles.find(x => x.role_id == role_id).role_name;

        var rawobject = {
          _id: details_to_send._id,
          company_name: details_to_send.company_name,
          aware_id: details_to_send.aware_id,
          role_name: role_name,
          status: item.status
        }

        jsonArray.push(rawobject);

      }

      var payload = { username: req.headers.username };
      refresh(req.headers.authorization, req.headers.userid, payload, function (resp) {
        if (resp.status == true) {
          return res.status(200).jsonp({ status: true, data: jsonArray, authorization: resp.token });
        }
        else {
          return res.status(resp.code).jsonp({ status: false, data: null, authorization: null });
        }
      });
    }
  },

  getMyConnectionsAsync: async (req, res) => {

    console.log("getMyConnectionsAsync")
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).jsonp(errors.array());
    }

    // Verify required headers
    const { userid, username, authorization, aware_id, email } = req.headers;
    if (!userid || !username || !authorization || !aware_id) {
      return res.status(400).jsonp({ status: false, message: "Bad request!" });
    }

    console.log(userid, username, authorization, aware_id, email);

    try {
      const pendingRequests = await requests.find({
        $or: [
          { receiver_aware_id: aware_id, status: "Accepted" },
          { sender_aware_id: aware_id, status: "Accepted" }
        ], isdeleted: false
      }).sort({ created_date: -1 });

      console.log(pendingRequests);


      const uniqueAwareIds = new Set(pendingRequests.map(item =>
        item.receiver_aware_id.toString() === aware_id ? item.sender_aware_id.toString() : item.receiver_aware_id.toString()
      ));

      console.log(uniqueAwareIds);

      const kyc_details_data = await kyc_details.find({ aware_id: { $in: [...uniqueAwareIds] }, is_deleted: { $ne: true } })


      console.log(kyc_details_data);


      let UniqueKycIds = kyc_details_data.map(ele => ele?._id.toString())

      const accounts_found = await account_details.find({ kyc_id: { $in: [...UniqueKycIds] } }).select(["role_id", "kyc_id"]);

      console.log(accounts_found);


      const user_roles = await user_role.find({}).select(["role_id", "role_name"]);
      // console.log({ user_roles })
      const jsonArray = pendingRequests.map(item => {

        const awareId = item.receiver_aware_id.toString() === aware_id ? item.sender_aware_id.toString() : item.receiver_aware_id.toString();
        const details = kyc_details_data.find(x => x.aware_id === awareId);
        const account = accounts_found.find(x => x.kyc_id === details._id.toString());
        const role = user_roles.find(x => x.role_id === account?.role_id);

        const { environmental_scope_certificates, social_compliance_certificates,
          chemical_compliance_certificates, sustainable_process_certificates,
          aware_tracer, custom_tracer } = details

        let CombineArray = [...environmental_scope_certificates, ...social_compliance_certificates,
        ...chemical_compliance_certificates, ...sustainable_process_certificates,
        ...aware_tracer, ...custom_tracer]


        let IsCertificateExpired = CombineArray.some((ele) => { return (new Date(ele.validthru) < new Date()&& ele.archive==false ) })

        return {
          _id: details._id,
          company_name: details.company_name,
          aware_id: details.aware_id,
          country: details.country,
          role_name: role ? role.role_name : '',
          role_id: account ? account.role_id : '',
          status: item.status,
          IsCertificateExpired
        };
      });

      console.log(jsonArray);

      refresh(authorization, userid, { username }, resp => {
        if (resp.status) {
          return res.status(200).jsonp({ status: true, data: jsonArray, authorization: resp.token });
        } else {
          return res.status(resp.code).jsonp({ status: false, data: null, authorization: null });
        }
      });

    } catch (error) {

      console.log({error})
      loggerhandler.logger.error(`${error}, email:${email}`);
      return res.status(500).jsonp({ status: false, message: error.toString() });
    }
  },

  getMyAllPendingRequestsAsync: async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).jsonp(errors.array());
    }

    // Verify required headers
    const { userid, username, authorization, aware_id, email } = req.headers;
    if (!userid || !username || !authorization || !aware_id) {
      return res.status(400).jsonp({ status: false, message: "Bad request!" });
    }

    try {
      const pendingRequests = await requests.find({
        $or: [
          { receiver_aware_id: aware_id, status: { $ne: "Accepted" } },
          { sender_aware_id: aware_id, status: { $ne: "Accepted" } }
        ], isdeleted: false
      }).sort({ created_date: -1 });

      const uniqueAwareIds = new Set(pendingRequests.map(item =>
        item.receiver_aware_id.toString() === aware_id ? item.sender_aware_id.toString() : item.receiver_aware_id.toString()
      ));

      const kyc_details_data = await kyc_details.find({ aware_id: { $in: [...uniqueAwareIds] } }).select(["company_name", "aware_id", "_id", "country"]);


      let UniqueKycIds = kyc_details_data.map(ele => ele?._id.toString())

      const accounts_found = await account_details.find({ kyc_id: { $in: [...UniqueKycIds] } }).select(["role_id", "kyc_id"]);


      const user_roles = await user_role.find({}).select(["role_id", "role_name"]);
      // console.log({ user_roles })
      const jsonArray = pendingRequests.map(item => {

        const awareId = item.receiver_aware_id.toString() === aware_id ? item.sender_aware_id.toString() : item.receiver_aware_id.toString();
        const details = kyc_details_data.find(x => x.aware_id === awareId);
        const account = accounts_found.find(x => x.kyc_id === details._id.toString());
        const role = user_roles.find(x => x.role_id === account?.role_id);
        const request = item.receiver_aware_id.toString() === aware_id ? "Received" : "Sent";

        return {
          _id: details._id,
          company_name: details.company_name,
          aware_id: details.aware_id,
          country: details.country,
          role_name: role ? role.role_name : '',
          role_id: account ? account.role_id : '',
          status: item.status,
          request
        };
      });

      refresh(authorization, userid, { username }, resp => {
        if (resp.status) {
          return res.status(200).jsonp({ status: true, data: jsonArray, authorization: resp.token });
        } else {
          return res.status(resp.code).jsonp({ status: false, data: null, authorization: null });
        }
      });

    } catch (error) {
      loggerhandler.logger.error(`${error}, email:${email}`);
      return res.status(500).jsonp({ status: false, message: error.toString() });
    }
  },

  acceptRequestAsync: async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).jsonp({ status: false, message: "Bad payload received." })
    }
    else {


      await requests.findOneAndUpdate({ receiver_aware_id: req.body.receiver_aware_id, sender_aware_id: req.body.sender_aware_id}, {
        status: req.body.status
      }, { new: true }).catch((ex) => { loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`); return res.status(500).jsonp({ status: false, message: ex.toString() }) })

      const kyc = await kyc_details.findOne({ aware_id: req.body.receiver_aware_id }).catch((ex) => { loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`); return res.status(500).jsonp({ status: false, message: ex.toString() }) })

      var payload = { username: req.headers.username };
      refresh(req.headers.authorization, req.headers.userid, payload, async function (resp) {
        if (resp.status == true) {
          await notifications.create({
            notification_sent_to: req.body.sender_aware_id,
            message: `Your relation request with ${kyc?.company_name} has been accepted.`
          })
          return res.status(200).jsonp({ status: true, message: "Add Relation request has been accepted successfully", authorization: resp.token });
        }
        else {
          return res.status(resp.code).jsonp({ status: false, message: null, authorization: null });
        }
      });

    }
  },


  requestReverificationAsync: async (req, res) => {
    const errors = validationResult(req);
    // console.log(req.body)
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
      } else {

        console.log("_awareid", req.body._awareid)


        kyc_details.findOneAndUpdate(
          { aware_id: req.body._awareid },
          {
            kyc_status: "5",
            modified_by: req.headers.userid,
            modified_date: new Date(),
          },
          function (err, datasubmitted) {
            console.log("datasubmitted", datasubmitted)
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
                  return res.status(200).jsonp({
                    status: true,
                    message: "Your KYC has been put on-hold. Please update the details and re-submit your KYC",
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
        );
      }
    }
  },

  CertificateExpireCheckerForProducerAsync: async (req, res) => {
    const errors = validationResult(req);

    // console.log("HHGHGHY")

    if (!errors.isEmpty()) {
      return res.status(422).jsonp(errors.array());
    } else {
      if (
        !req.headers.userid ||
        !req.headers.username ||
        !req.headers.authorization ||
        !req.headers.customdate
      ) {
        return res
          .status(400)
          .jsonp({ status: false, message: "Bad request!" });
      }

      let customDate = req.headers.customdate || moment().format('DD/MM/YYYY')

      var account = await account_details.findOne({ _id: mongoose.Types.ObjectId(req.headers.userid) }).select(['kyc_id', 'email']).catch((err) => {
        loggerhandler.logger.error(`${err} ,email:${req.headers.email}`)
        return res.status(500).jsonp({ status: false, message: err });
      });

      console.log({ account })
      if (!account) {
        res.status(400).jsonp({ status: false, message: "Bad request!" });
      }


      // console.log("account.kyc_id", account.kyc_id)

      var details = await kyc_details.findOne({ _id: mongoose.Types.ObjectId(account.kyc_id) }).catch((err) => {
        loggerhandler.logger.error(`${err} ,email:${req.headers.email}`)
        return res.status(500).jsonp({ status: false, message: err });
      });
      if (!details) {
        res.status(400).jsonp({ status: false, message: "Bad request!" });
      }


      const { environmental_scope_certificates, social_compliance_certificates,
        chemical_compliance_certificates, sustainable_process_certificates,
        aware_tracer, custom_tracer } = details

      let CombineArray = [...environmental_scope_certificates, ...social_compliance_certificates,
      ...chemical_compliance_certificates, ...sustainable_process_certificates,
      ...aware_tracer, ...custom_tracer]


      CombineArray.forEach(async (ele) => {

        let tracer_name = ele?.licensenumber ? ` Aware Tracer` : ele?.tracerName ? ` Custom Tracer` : ''
        let certificates_expire_date = new Date(ele.validthru);

        if (certificates_expire_date <= moment().add(30, 'days').toDate() && certificates_expire_date > new Date()) {
          // console.log('expired soon', (ele.documentname || ele.licensenumber || ele.tracerName))

          let previous_notification = await notifications.findOne({
            notification_sent_to: details?.aware_id,
            date: moment(certificates_expire_date).format('DD/MM/YYYY'),
            message: `Validity of${tracer_name} ${(ele.documentname || ele.licensenumber || ele.tracerName)} is expiring soon.`
          })

          // console.log('previous_notification expiring soon', previous_notification);

          if (!previous_notification) {
            await notifications.create({
              notification_sent_to: details?.aware_id,
              date: moment(certificates_expire_date).format('DD/MM/YYYY'),
              message: `Validity of${tracer_name} ${(ele.documentname || ele.licensenumber || ele.tracerName)} is expiring soon.`
            })
          }
        } else if (certificates_expire_date <= new Date()) {
          // console.log('expired certificate', (ele.documentname || ele.licensenumber || ele.tracerName))

          let previous_notification = await notifications.findOne({
            notification_sent_to: details?.aware_id,
            date: moment(certificates_expire_date).format('DD/MM/YYYY'),
            message: `Validity of${tracer_name} ${(ele.documentname || ele.licensenumber || ele.tracerName)} is expired.`
          })

          // console.log('previous_notification expired', previous_notification);

          if (!previous_notification) {
            await notifications.create({
              notification_sent_to: details?.aware_id,
              date: moment(certificates_expire_date).format('DD/MM/YYYY'),
              message: `Validity of${tracer_name} ${(ele.documentname || ele.licensenumber || ele.tracerName)} is expired.`
            })
          }
        }
      })
      let NextsevenDaysStart = moment(customDate, 'DD/MM/YYYY').add(7, 'days').startOf('day').toDate()
      let NextsevenDaysEnd = moment(customDate, 'DD/MM/YYYY').add(7, 'days').endOf('day').toDate()

      // console.log('kyc_details?.aware_id',details?.aware_id)
      let purchase_order_ETD_list = await purchase_order_details.aggregate([
        { $match: { producer_aware_id: details?.aware_id } },
        { "$addFields": { "poid": { "$toObjectId": "$po_id" } } },
        { $lookup: { from: "purchase_orders", localField: "poid", foreignField: "_id", as: "details_avaliable", }, },
        { $addFields: { details_avaliable: { $arrayElemAt: ["$details_avaliable", 0] } } },
        {
          $set: {
            "po_status": "$details_avaliable.status",
            "hide": "$details_avaliable.hide",
          }
        },
        { $match: { etd: { $gte: NextsevenDaysStart, $lte: NextsevenDaysEnd }, po_status: { $eq: "SEND" }, hide: { $ne: true } } },
        { $project: { "_id": 0, "producer": 1, "order_number": 1, "brand": 1, "etd": 1 } },
      ])

      // console.log({ purchase_order_ETD_list })
      purchase_order_ETD_list?.forEach(async (item) => {
        let previous_notification = await notifications.findOne({
          notification_sent_to: details?.aware_id,
          date: customDate,
          message: `The ETD ${moment(item.etd).format('DD/MM/YYYY')} for PO ${item.order_number} of ${item.brand} is approaching within a week. Please take action to complete the token update, connect to line items and manager approval ASAP.`
        })

        if (!previous_notification && item) {
          await notifications.create({
            notification_sent_to: details?.aware_id,
            date: customDate,
            message: `The ETD ${moment(item.etd).format('DD/MM/YYYY')} for PO ${item.order_number} of ${item.brand} is approaching within a week. Please take action to complete the token update, connect to line items and manager approval ASAP.`
          })
          // console.log('1',{item})
          SendGrid.ETDMailer(account.email, details.company_name, item, 1, (result) => {
            // console.log('resulttttt 1', result)
            if (result == null) {

              return res.status(500).jsonp({ status: false, message: "Internal error! Please Re-send Verification link to Manager email address." });
            }
          });


        }
      })


      let LastDaysStart = moment(customDate, 'DD/MM/YYYY').subtract(1, 'days').startOf('day').toDate()
      let LastDaysEnd = moment(customDate, 'DD/MM/YYYY').subtract(1, 'days').endOf('day').toDate()

      let last_purchase_order_ETD_list = await purchase_order_details.aggregate([
        { $match: { producer_aware_id: details?.aware_id } },
        { "$addFields": { "poid": { "$toObjectId": "$po_id" } } },
        { $lookup: { from: "purchase_orders", localField: "poid", foreignField: "_id", as: "details_avaliable", }, },
        { $addFields: { details_avaliable: { $arrayElemAt: ["$details_avaliable", 0] } } },
        {
          $set: {
            "po_status": "$details_avaliable.status",
            "hide": "$details_avaliable.hide",
          }
        },
        { $match: { etd: { $gte: LastDaysStart, $lte: LastDaysEnd }, po_status: { $eq: "SEND" }, hide: { $ne: true } } },
        { $project: { "_id": 0, "producer": 1, "order_number": 1, "brand": 1, "etd": 1 } },
      ])
      // console.log({ last_purchase_order_ETD_list })

      last_purchase_order_ETD_list?.forEach(async (item) => {
        let previous_notification = await notifications.findOne({
          notification_sent_to: details?.aware_id,
          date: customDate,
          message: `Alert! The ETD for PO ${item.order_number} of ${item.brand} has already passed. You have missed the  ETD deadline. Please finish the token update ASAP.`
        })

        if (!previous_notification && item) {
          await notifications.create({
            notification_sent_to: details?.aware_id,
            date: customDate,
            message: `Alert! The ETD for PO ${item.order_number} of ${item.brand} has already passed. You have missed the  ETD deadline. Please finish the token update ASAP.`
          })
          // console.log('2',{item})
          SendGrid.ETDMailer(account.email, details.company_name, item, 2, (result) => {
            // console.log('resulttttt 2',result)
            if (result == null) {
              return res.status(500).jsonp({ status: false, message: "Internal error! Mailer Error." });
            }
          });
        }
      })

      var payload = { username: req.headers.username };
      refresh(req.headers.authorization, req.headers.userid, payload,
        function (resp) {
          if (resp.status == true) {
            return res.status(200).jsonp({
              status: true,
              data: purchase_order_ETD_list,
              authorization: resp.token,
            });
          } else {
            return res.status(resp.code).jsonp({
              status: false,
              data: null,
              authorization: resp.token,
            });
          }
        }
      );




    }

  },

  CertificateExpireCheckerForFinalBrandAsync: async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).jsonp(errors.array());
    }
    const { userid, username, authorization, aware_id, email, customdate } = req.headers;
    if (!userid || !username || !authorization || !aware_id) {
      return res.status(400).jsonp({ status: false, message: "Bad request!" });
    }

    try {
      let customDate = customdate || moment().format('DD/MM/YYYY')
      const pendingRequests = await requests.find({
        $or: [
          { receiver_aware_id: aware_id, status: "Accepted" },
          { sender_aware_id: aware_id, status: "Accepted" }
        ], isdeleted: false
      }).sort({ created_date: -1 });

      const uniqueAwareIds = new Set(pendingRequests.map(item =>
        item.receiver_aware_id.toString() === aware_id ? item.sender_aware_id.toString() : item.receiver_aware_id.toString()
      ));

      const kyc_details_data = await kyc_details.find({ aware_id: { $in: [...uniqueAwareIds] } })


      pendingRequests.forEach(item => {

        const awareId = item.receiver_aware_id.toString() === aware_id ? item.sender_aware_id.toString() : item.receiver_aware_id.toString();
        const details = kyc_details_data.find(x => x.aware_id === awareId);


        const { environmental_scope_certificates, social_compliance_certificates,
          chemical_compliance_certificates, sustainable_process_certificates,
          aware_tracer, custom_tracer } = details

        let CombineArray = [...environmental_scope_certificates, ...social_compliance_certificates,
        ...chemical_compliance_certificates, ...sustainable_process_certificates,
        ...aware_tracer, ...custom_tracer]


        CombineArray.forEach(async (ele) => {
          let certificates_expire_date = new Date(ele.validthru);
         
          if (certificates_expire_date <= moment().add(30, 'days').toDate() && certificates_expire_date > new Date()) {
            // console.log('expired soon', (ele.documentname || ele.licensenumber || ele.tracerName))

            let previous_notification = await notifications.findOne({
              notification_sent_to: aware_id,
              date: moment(certificates_expire_date).format('DD/MM/YYYY'),
              message: `Validity of ${(ele.documentname || ele.licensenumber || ele.tracerName)} certificate of ${details?.company_name} is expiring soon.`
            })

            // console.log('previous_notification expiring soon', previous_notification);

            if (!previous_notification) {
              await notifications.create({
                notification_sent_to: aware_id,
                date: moment(certificates_expire_date).format('DD/MM/YYYY'),
                message: `Validity of ${(ele.documentname || ele.licensenumber || ele.tracerName)} certificate of ${details?.company_name} is expiring soon.`
              })
            }
          } else if (certificates_expire_date <= new Date() && ele.archive==false) {
            // console.log('expired certificate', (ele.documentname || ele.licensenumber || ele.tracerName))

            let previous_notification = await notifications.findOne({
              notification_sent_to: aware_id,
              date: moment(certificates_expire_date).format('DD/MM/YYYY'),
              message: `Validity of ${(ele.documentname || ele.licensenumber || ele.tracerName)} certificate of ${details?.company_name} is expired.`
            })

            // console.log('previous_notification expired', previous_notification);

            if (!previous_notification) {
              await notifications.create({
                notification_sent_to: aware_id,
                date: moment(certificates_expire_date).format('DD/MM/YYYY'),
                message: `Validity of ${(ele.documentname || ele.licensenumber || ele.tracerName)} certificate of ${details?.company_name} is expired.`
              })
            }
          }
        })
      });
      let NextsevenDaysStart = moment(customDate, 'DD/MM/YYYY').add(7, 'days').startOf('day').toDate()
      let NextsevenDaysEnd = moment(customDate, 'DD/MM/YYYY').add(7, 'days').endOf('day').toDate()

      let purchase_order_ETD_list = await purchase_orders.aggregate([
        { $match: { _awareid: aware_id, status: { $eq: "SEND" }, hide: { $ne: true } } },
        { "$addFields": { "po_id": { "$toString": "$_id" } } },
        { $lookup: { from: "purchase_order_details", localField: "po_id", foreignField: "po_id", as: "details_avaliable", }, },
        { $addFields: { details_avaliable: { $arrayElemAt: ["$details_avaliable", 0] } } },
        {
          $set: {
            "producer": "$details_avaliable.producer",
            "order_number": "$details_avaliable.order_number",
            "brand": "$details_avaliable.brand",
            "etd": "$details_avaliable.etd"
          }
        },
        { $match: { etd: { $gte: NextsevenDaysStart, $lte: NextsevenDaysEnd } } },
        { $project: { "_id": 0, "producer": 1, "order_number": 1, "brand": 1, "etd": 1 } },
      ])

      purchase_order_ETD_list?.forEach(async (item) => {
        let previous_notification = await notifications.findOne({
          notification_sent_to: aware_id,
          date: customDate,
          message: `The ETD for PO ${item.order_number}  sent to ${item.producer} is approaching within a week. Please take action to remind the ${item.producer}.`
        })

        if (!previous_notification) {
          await notifications.create({
            notification_sent_to: aware_id,
            date: customDate,
            message: `The ETD for PO ${item.order_number}  sent to ${item.producer} is approaching within a week. Please take action to remind the ${item.producer}.`
          })
        }
      })


      let LastDaysStart = moment(customDate, 'DD/MM/YYYY').subtract(1, 'days').startOf('day').toDate()
      let LastDaysEnd = moment(customDate, 'DD/MM/YYYY').subtract(1, 'days').endOf('day').toDate()

      let last_purchase_order_ETD_list = await purchase_orders.aggregate([
        { $match: { _awareid: aware_id, status: { $eq: "SEND" }, hide: { $ne: true } } },
        { "$addFields": { "po_id": { "$toString": "$_id" } } },
        { $lookup: { from: "purchase_order_details", localField: "po_id", foreignField: "po_id", as: "details_avaliable", }, },
        { $addFields: { details_avaliable: { $arrayElemAt: ["$details_avaliable", 0] } } },
        {
          $set: {
            "producer": "$details_avaliable.producer",
            "order_number": "$details_avaliable.order_number",
            "brand": "$details_avaliable.brand",
            "etd": "$details_avaliable.etd"
          }
        },
        { $match: { etd: { $gte: LastDaysStart, $lte: LastDaysEnd } } },
        { $project: { "_id": 0, "producer": 1, "order_number": 1, "brand": 1, "etd": 1 } },
      ])

      last_purchase_order_ETD_list?.forEach(async (item) => {
        let previous_notification = await notifications.findOne({
          notification_sent_to: aware_id,
          date: customDate,
          message: `Alert! The ETD for PO ${item.order_number} sent to ${item.producer} has already passed. ${item.producer} missed the token update deadline.`
        })

        if (!previous_notification) {
          await notifications.create({
            notification_sent_to: aware_id,
            date: customDate,
            message: `Alert! The ETD for PO ${item.order_number} sent to ${item.producer} has already passed. ${item.producer} missed the token update deadline.`
          })
        }
      })

      // console.log({ purchase_order_ETD })

      // return res.status(200).jsonp({
      //   status: true,
      //   data: true,
      //   // authorization: resp.token,
      // });
      refresh(authorization, userid, { username }, resp => {
        if (resp.status) {
          return res.status(200).jsonp({ status: true, data: true, authorization: resp.token });
        } else {
          return res.status(resp.code).jsonp({ status: false, data: null, authorization: null });
        }
      });

      console.log('hhhiiii dvsdvjha')

    } catch (error) {
      loggerhandler.logger.error(`${error}, email:${email}`);
      return res.status(500).jsonp({ status: false, message: error.toString() });
    }

  },




};

// getOldMyConnectionsAsync: async (req, res) => {
//   // let receiver_aware_id = req.headers.receiver_aware_id
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     return res.status(422).jsonp(errors.array())
//   }
//   else {

//     if (!req.headers.userid || !req.headers.username || !req.headers.authorization || !req.headers.aware_id) {
//       return res.status(400).jsonp({ status: false, message: "Bad request!" });
//     }

//     const request_data_receiver = await requests.find({ receiver_aware_id: req.headers.aware_id, status: "Accepted" }).catch((ex) => { loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`); return res.status(500).jsonp({ status: false, message: ex.toString() }) })

//     const request_data_sender = await requests.find({ sender_aware_id: req.headers.aware_id, status: "Accepted" }).catch((ex) => { loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`); return res.status(500).jsonp({ status: false, message: ex.toString() }) })

//     const output = [];
//     const map = new Map();
//     for (const item of request_data_receiver) {
//       if (!map.has(item.sender_aware_id.toString())) {
//         map.set(item.sender_aware_id.toString(), true); // set any value to Map
//         output.push(item.sender_aware_id.toString());
//       }
//     }


//     for (const item of request_data_sender) {
//       if (!map.has(item.receiver_aware_id.toString())) {
//         map.set(item.receiver_aware_id.toString(), true); // set any value to Map
//         output.push(item.receiver_aware_id.toString());
//       }
//     }

//     var kyc_details_data = await kyc_details.find({ aware_id: { $in: output } }).select(["company_name", "aware_id", "_id", "country"]).catch((ex) => { loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`); return res.status(500).jsonp({ status: false, message: ex }) });

//     const output2 = [];
//     const map2 = new Map();
//     for (const item of kyc_details_data) {
//       if (!map2.has(item._id)) {
//         map2.set(item._id, true); // set any value to Map
//         output2.push(item._id);
//       }
//     }

//     var accounts_found = await account_details.find({ kyc_id: { $in: output2 } }).select(["role_id", "kyc_id"]).catch((ex) => { loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`); return res.status(500).jsonp({ status: false, message: ex }) });
//     var user_roles = await user_role.find().select(["role_id", "role_name"]).catch((ex) => { loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`); return res.status(500).jsonp({ status: false, message: ex }) });

//     var jsonArray = [];
//     for (const item of request_data_receiver) {

//       var details_to_send = kyc_details_data.find(x => x.aware_id == item.sender_aware_id);
//       var role_id = accounts_found.find(x => x.kyc_id == details_to_send._id.toString()).role_id;
//       var role_name = user_roles.find(x => x.role_id == role_id).role_name;

//       var rawobject = {
//         _id: details_to_send._id,
//         company_name: details_to_send.company_name,
//         aware_id: details_to_send.aware_id,
//         country: details_to_send.country,
//         role_name: role_name,
//         role_id: role_id,
//         status: item.status
//       }

//       jsonArray.push(rawobject);
//     }

//     for (const item of request_data_sender) {

//       var details_to_send = kyc_details_data.find(x => x.aware_id == item.receiver_aware_id);
//       var role_id = accounts_found.find(x => x.kyc_id == details_to_send._id.toString()).role_id;
//       var role_name = user_roles.find(x => x.role_id == role_id).role_name;

//       var rawobject = {
//         _id: details_to_send._id,
//         company_name: details_to_send.company_name,
//         aware_id: details_to_send.aware_id,
//         country: details_to_send.country,
//         role_name: role_name,
//         role_id: role_id,
//         status: item.status
//       }

//       jsonArray.push(rawobject);
//     }
//     // let filterData = jsonArray.filter((item) => item.role_id == 7)
//     var payload = { username: req.headers.username };
//     refresh(req.headers.authorization, req.headers.userid, payload, function (resp) {
//       if (resp.status == true) {
//         return res.status(200).jsonp({ status: true, data: jsonArray, authorization: resp.token });
//       }
//       else {
//         return res.status(resp.code).jsonp({ status: false, data: null, authorization: null });
//       }purchase_order_ETD_list
//     });
//   }
// },

