var mongoose = require("mongoose");
const { body, validationResult, check } = require("express-validator");
const helperfunctions = require("../scripts/helper-functions");
var kyc_details = require("../models/kyc_details");
const { refresh } = require("../refresh-token");
const account_details = require("../models/account_details");
const kyc_status = require("../models/kyc_status");
const user_role = require("../models/user_role");
const masters_data = require("../models/master_data_model");
const masters = require("../models/master_directory");
const requests = require("../models/requests");
const material = require("../models/material_data_model");
var SendGrid = require("../scripts/send-grid");
const product_lines = require("../models/product_lines");
const account_availability = require("../models/account_availability");
const loggerhandler = require("../logger/log");
var bcrypt = require("bcryptjs");

var from = require("@iotexproject/iotex-address-ts").from;
const Web3 = require("web3");
const Big = require("big.js");
const ethers = require("ethers");
var wallets = require("../models/wallets");
const draft_info = require("../models/draft_info");


var bip39 = require("bip39"); // npm i -S bip39
var crypto = require("crypto");
const aw_tokens = require("../models/aw_tokens");
const physical_assets = require("../models/physical_asset");
const send_aw_tokens = require("../models/send_aw_tokens");
const web3_handler = require("../Iotex/web3");
const update_physical_asset = require("../models/update_physical_asset");
const update_self_validation = require("../models/update_self_validation");
const update_company_compliances = require("../models/update_company_compliancess");
const update_aw_tokens = require("../models/update_aw_tokens");
const selected_update_aware_token = require("../models/selected_update_aware_token");
var callstack = require("../scripts/call-stack");
const purchase_orders = require("../models/purchase_orders");
const purchase_order_details = require("../models/purchase_order_details");
const valueChain = require("../models/value_chain_process");
const exempted_email = require("../models/exempted_email");
const moment = require("moment");
const notifications = require("../models/notifications");
const { schedulerRunning, startScheduler } = require("../utils/scheduler");
const handlers = {
  /// get user list for manage user
  getUsersAsync: async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).jsonp(errors.array());
    } else {
      if (!req.headers.username || !req.headers.authorization) {
        return res
          .status(400)
          .jsonp({ status: false, message: "Bad request!" });
      }

     
      try {
        var userroles = await user_role.find({ role_id: { $nin: [1] } });
        // console.log('userroles', userroles, 'useroless')
        let user_list = await account_details
          .aggregate([
            { $match: { is_deleted: { $ne: true }, role_id: { $nin: [1] } } },
            { $addFields: { kycid: { $toObjectId: "$kyc_id" } } },
            {
              $lookup: {
                from: "kyc_details",
                localField: "kycid",
                foreignField: "_id",
                as: "details_avaliable",
              },
            },
            {
              $lookup: {
                from: "kyc_details",
                localField: "aware_id",
                foreignField: "aware_id",
                as: "manager_details_avaliable",
              },
            },
            {
              $lookup: {
                from: "user_roles",
                localField: "role_id",
                foreignField: "role_id",
                as: "role_details",
              },
            },
            {
              $addFields: {
                details_avaliable: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: {
                          $concatArrays: [
                            "$details_avaliable",
                            "$manager_details_avaliable",
                          ],
                        },
                        as: "detail",
                        cond: { $ne: ["$$detail", null] },
                      },
                    },
                    0,
                  ],
                },
                role_details: { $arrayElemAt: ["$role_details", 0] },
              },
            },
            {
              $set: {
                company_name: "$details_avaliable.company_name",
                aware_id: "$details_avaliable.aware_id",
                role_name: "$role_details.role_name",
              },
            },
            {
              $project: {
                producer: 1,
                company_name: 1,
                aware_id: 1,
                role_name: 1,
                first_name: 1,
                last_name: 1,
                email: 1,
                role_id: 1,
                status: 1,
                sub_user: 1,
                created_date: 1,
              },
            },
          ])
          .sort({ created_date: -1 });
        var payload = { username: req.headers.username };
        await refresh(
          req.headers.authorization,
          req.headers.userid,
          payload,
          function (resp) {
            if (resp.status == true) {
              return res.status(200).jsonp({
                status: true,
                data: user_list,
                role: userroles,
                authorization: resp.token,
              });
            } else {
              return res
                .status(resp.code)
                .jsonp({ status: false, data: null, authorization: null });
            }
          }
        );
      } catch (e) {
        loggerhandler.logger.error(`${e} ,email:${req.headers.email}`);
        return res
          .status(500)
          .jsonp({ status: false, message: "Internal error!" });
      }
    }
  },

 

  getdashboard: async (req, res) => {
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

      if (account_details.length == 0) {
        return res
          .status(400)
          .jsonp({ status: false, message: "Bad request!" });
      }

      account_details.find(
        { role_id: { $in: [2, 3, 4, 5, 6, 7] }, is_deleted: { $ne: true } },
        async function (err, account) {
          if (err) {
            loggerhandler.logger.error(`${err} ,email:${req.headers.email}`);
            return res.status(500).jsonp({ status: false, message: err });
          }

          const jsonData = account.reduce((acc, ele) => {
            const roleCounts = {
              2: "pallet_compounder",
              3: "fiber_producer",
              4: "yarn_producer",
              5: "fabric_producer",
              6: "product_producer",
              7: "final_brand",
            };
            const roleName = roleCounts[ele.role_id];
            if (roleName) {
              acc[roleName] = (acc[roleName] || 0) + 1;
            }
            return acc;
          }, {});

          // console.log("jsonData", jsonData)
          var payload = { username: req.headers.username };
          refresh(
            req.headers.authorization,
            req.headers.userid,
            payload,
            function (resp) {
              if (resp.status == true) {
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
      );
    }
  },

  getdashboardkyc: async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).jsonp(errors.array());
    } else {
      // console.log(req.headers.username);

      if (!req.headers.username || !req.headers.authorization) {
        return res
          .status(400)
          .jsonp({ status: false, message: "Bad request!" });
      }

      account_details.find(
        { is_deleted: { $ne: true }, role_id: { $ne: 1 } },
        async function (err, account) {
          if (err) {
            loggerhandler.logger.error(`${err} ,email:${req.headers.email}`);
            return res.status(500).jsonp({ status: false, message: err });
          }
          let account_ids = account.map((ele) =>
            mongoose.Types.ObjectId(ele.kyc_id)
          );
          // console.log({ account_ids})
          var kycDetails = await kyc_details
            .find({ _id: { $in: account_ids }, aware_id: { $ne: null } })
            .catch((ex) => {
              loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
              return res
                .status(500)
                .jsonp({ status: false, message: ex.toString() });
            });
          

          var jsonkyc = {
            Pending: kycDetails?.filter((x) => x.kyc_status == "1").length || 0,
            Under_Verification:
              kycDetails?.filter((x) => x.kyc_status == "2").length || 0,
            Approved:
              kycDetails?.filter((x) => x.kyc_status == "3").length || 0,
            Rejected:
              kycDetails?.filter((x) => x.kyc_status == "4").length || 0,
            OnHold: kycDetails?.filter((x) => x.kyc_status == "5").length || 0,
          };
          console.log(
            "jj",
            kycDetails?.filter((x) => x.kyc_status == "5")
          );

          var payload = { username: req.headers.username };

          refresh(
            req.headers.authorization,
            req.headers.userid,
            payload,
            function (resp) {
              if (resp.status == true) {
                // console.log("2 =>", jsonArray);
                return res.status(200).jsonp({
                  status: true,
                  data: jsonkyc,
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
  },

  //nikhil code
  //get data of particular user by id for manage user
  getUserById: async (req, res) => {
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
        { _id: mongoose.Types.ObjectId(req.headers.clientid) },
        async function (err, account) {
          if (err) {
            loggerhandler.logger.error(`${err} ,email:${req.headers.email}`);
            return res.status(500).jsonp({ status: false, message: err });
          }

          if (!account) {
            res.status(400).jsonp({ status: false, message: "Bad request!" });
          }
          var userroles = await user_role.find({}).catch((ex) => {
            loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
            return res
              .status(500)
              .jsonp({ status: false, message: "Internal error!" });
          });
          // let role_name = userroles.find(
          //   (x) => x.role_id.toString() == account.role_id.toString()
          // ).role_name;

          let filtered_role = userroles.filter(
            (item) => item.role_name !== "Administrator"
          );
          var payload = { username: req.headers.username };
          refresh(
            req.headers.authorization,
            req.headers.userid,
            payload,
            function (resp) {
              if (resp.status == true) {
                return res.status(200).jsonp({
                  status: true,
                  data: account,
                  role: filtered_role,
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
  },

 

  updateUserDetail: async (req, res) => {
    const errors = validationResult(req);

    // Check if validation errors exist
    if (!errors.isEmpty()) {
      return res.status(422).jsonp(errors.array());
    }

    // Ensure required headers are provided
    if (
      !req.headers.userid ||
      !req.headers.username ||
      !req.headers.authorization
    ) {
      return res.status(400).jsonp({ status: false, message: "Bad request!" });
    }

    const { id, firstname, lastname, email } = req.body;

    // Capitalize first name
    const capitalizedString =
      firstname.charAt(0).toUpperCase() + firstname.slice(1);
    const email_address = email.toLowerCase().trim();

    console.log({ capitalizedString });
    // Generate password
    const password = `${capitalizedString.slice(0, 4)}-${lastname.slice(
      0,
      4
    )}-aw${new Date().getFullYear()}`;

    console.log({ password });
    // Hash the password for secure storage
    const hashedPassword = bcrypt.hashSync(password, 10);

    try {
      // Update user details in the database
      const updatedUser = await account_details.findOneAndUpdate(
        { _id: mongoose.Types.ObjectId(id) },
        {
          first_name: capitalizedString,
          last_name: lastname,
          email: email_address,
          password: hashedPassword,
          modified_date: new Date(),
        },
        { new: true }
      );

      if (updatedUser) {
        // Send the password change email using the callback
        SendGrid.sendManagerPasswordChangeMail(
          email,
          capitalizedString,
          (emailResult) => {
            if (emailResult === "success") {
              return res.status(200).jsonp({
                status: true,
                message: "User details has been updated to the directory.",
              });
            } else {
              return res.status(500).jsonp({
                status: false,
                message:
                  "Internal error! Please Re-send Verification link to Manager email address.",
              });
            }
          }
        );
      } else {
        return res
          .status(404)
          .jsonp({ status: false, message: "User not found." });
      }
    } catch (error) {
      console.error("Error updating user details:", error);
      return res.status(500).jsonp({
        status: false,
        message: "Internal error during user update.",
      });
    }
  },

  // delete user from  manage user
  deleteUserDetail: async (req, res) => {
    const errors = validationResult(req);
    // console.log("id is there", req.headers.clientid);

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
        const datasubmitted = await account_details.findByIdAndUpdate(
          { _id: mongoose.Types.ObjectId(req.headers.clientid) },
          { email: process.env.ARCHIVED_EMAIL_ADDRESS, is_deleted: true },
          { new: true }
        );

        if (datasubmitted.role_id == 10) {
          let { manager_id } = await kyc_details
            .findOneAndUpdate(
              { aware_id: datasubmitted?.aware_id },
              { manager_id: null }
            )
            .select(["manager_id"]);

          // Update the manager's details
          await account_details.findOneAndUpdate(
            { _id: manager_id },
            { email: process.env.ARCHIVED_EMAIL_ADDRESS, is_deleted: true }
          );
        } else if (datasubmitted.role_id == 7 && !datasubmitted.sub_user) {
          const { sub_user, manager_id } = await kyc_details
            .findOneAndUpdate(
              { _id: mongoose.Types.ObjectId(datasubmitted?.kyc_id) },
              { sub_user: [] }
            )
            .select(["sub_user", "manager_id"]);

          // Update the manager's details
          await account_details.findOneAndUpdate(
            { _id: manager_id },
            { email: process.env.ARCHIVED_EMAIL_ADDRESS, is_deleted: true }
          );

          // Update all sub-users details
          sub_user?.forEach(async (ele) => {
            await account_details.findOneAndUpdate(
              { _id: ele },
              { email: process.env.ARCHIVED_EMAIL_ADDRESS, is_deleted: true }
            );
          });
        }
        // For other cases, update the manager and sub-users
        else {
          const { manager_id } = await kyc_details
            .findOne({ _id: mongoose.Types.ObjectId(datasubmitted.kyc_id) })
            .select("manager_id");
          // Update the manager's details
          await account_details.findOneAndUpdate(
            { _id: manager_id },
            { email: process.env.ARCHIVED_EMAIL_ADDRESS, is_deleted: true }
          );
        }

        const { aware_id } = await kyc_details
          .findOne({ _id: mongoose.Types.ObjectId(datasubmitted.kyc_id) })
          .select("aware_id");
        await requests.updateMany(
          {
            $or: [
              { receiver_aware_id: aware_id },
              { sender_aware_id: aware_id },
            ],
          },
          { $set: { isdeleted: true } }
        );

        // Refresh token logic
        const payload = { username: req.headers.username };
        refresh(
          req.headers.authorization,
          req.headers.userid,
          payload,
          function (resp) {
            if (resp.status == true) {
              return res.status(200).jsonp({
                status: true,
                message: "User has been deleted successfully",
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
    }
  },

  //// kyc manage list of users
  getUsersKycDetail: async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).jsonp(errors.array());
    } else {
      // console.log(req.headers.username);

      if (!req.headers.username || !req.headers.authorization) {
        return res
          .status(400)
          .jsonp({ status: false, message: "Bad request!" });
      }

      let account = await account_details
        .find({ is_deleted: { $ne: true }, role_id: { $nin: [1, 10] } })
        .catch((ex) => {
          loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
          return res
            .status(500)
            .jsonp({ status: false, message: "Internal error!" });
        });
      let account_ids = account.map((ele) =>
        mongoose.Types.ObjectId(ele.kyc_id)
      );
      var kycDetails = await kyc_details
        .find({ _id: { $in: account_ids } })
        .populate("manager_id", "first_name last_name email")
        .catch((ex) => {
          loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
          return res
            .status(500)
            .jsonp({ status: false, message: "Internal error!" });
        });
      var userroles = await user_role
        .find({ role_id: { $nin: [1, 10] } })
        .catch((ex) => {
          loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
          return res
            .status(500)
            .jsonp({ status: false, message: "Internal error!" });
        });
      var user_status = await kyc_status.find({}).catch((ex) => {
        loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
        return res
          .status(500)
          .jsonp({ status: false, message: "Internal error!" });
      });

      let filtered_data = account.map((ele) => {
        let kyc_data = kycDetails.find(
          (item) => item._id == ele.kyc_id && !ele.sub_user
        );
        return {
          // ...ele.toObject(),
          id: ele._id,
          iaware_idd: ele._id,
          kyc_id: ele.kyc_id,
          firstname: ele.first_name,
          lastname: ele.last_name,
          email: ele.email,
          created_date: kyc_data?.created_date,
          manager_data: kyc_data?.manager_id,
          role_id: ele.role_id,
          kyc_status: kyc_data?.kyc_status,
          role: userroles.find((x) => x.role_id == ele.role_id)?.role_name,
          awareId: kyc_data?.aware_id,
          companyname: kyc_data?.company_name,
          modified_date: kyc_data?.modified_date,
          userStatus: user_status.find(
            (item) => item.status_id == kyc_data?.kyc_status
          )?.status,
          subscription: kyc_data?.subscription || {},
        };
      });
      // console.log({ filtered_data })
      var payload = { username: req.headers.username };

      refresh(
        req.headers.authorization,
        req.headers.userid,
        payload,
        function (resp) {
          if (resp.status == true) {
            return res.status(200).jsonp({
              status: true,
              data: filtered_data,
              authorization: resp.token,
              role: userroles,
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

  ////get detailed information of particular user
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
          .jsonp({ status: false, message: "Bad request1!" });
      }
      // console.log(req.headers.kyc_id);

      account_details.findOne(
        { _id: mongoose.Types.ObjectId(req.headers.kyc_id) },
        function (err, account) {
          if (err) {
            loggerhandler.logger.error(`${err} ,email:${req.headers.email}`);
            return res.status(500).jsonp({ status: false, message: err });
          }

          if (!account) {
            res.status(400).jsonp({ status: false, message: "Bad request2!" });
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
                  .jsonp({ status: false, message: "Bad request3!" });
              }

              var role_details = await user_role
                .findOne({ role_id: Number(account.role_id) })
                .catch((ex) => {
                  loggerhandler.logger.error(
                    `${ex} ,email:${req.headers.email}`
                  );
                  res.status(500).jsonp({ status: false, message: ex });
                });
              var kyc_details = await kyc_status
                .findOne({ status_id: Number(details.kyc_status) })
                .catch((ex) => {
                  loggerhandler.logger.error(
                    `${ex} ,email:${req.headers.email}`
                  );
                  res.status(500).jsonp({ status: false, message: ex });
                });

              var jsonObject = {
                first_name: account.first_name,
                last_name: account.last_name,
                kyc_id: account.kyc_id,
                acknowledgement: account.acknowledgement,
                role_id: role_details.role_id,
                role_name: role_details.role_name,
                kyc_status_id: kyc_details.status_id,
                kyc_status: kyc_details.status,
                details: details,
              };
              details.aware_tracer.map((e) => {
                console.log(e);
                if (new Date(`${e.validthru}`) < new Date()) {
                  e.status = "expired";
                }
              });
              details.custom_tracer.map((e) => {
                console.log(e);
                if (new Date(`${e.validthru}`) < new Date()) {
                  e.status = "expired";
                }
              });
              // console.log("jsonObject", jsonObject);

              var payload = { username: req.headers.username };
              refresh(
                req.headers.authorization,
                req.headers.userid,
                payload,
                function (resp) {
                  if (resp.status == true) {
                    // console.log("data received", jsonObject);
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

  ///kyc-users-details-my-connection
  getUserKycInformationAsync: async (req, res) => {
    const errors = validationResult(req);
    console.log("hit");

    if (!errors.isEmpty()) {
      return res.status(422).jsonp(errors.array());
    } else {
      const { userid, username, authorization, awareid } = req.headers;
      if (!userid || !username || !authorization) {
        return res
          .status(400)
          .jsonp({ status: false, message: "Bad request1!" });
      }

      try {
        let details = await kyc_details.findOne({ aware_id: awareid });

        if (!details) {
          res.status(400).jsonp({ status: false, message: "Bad request3!" });
        }

        let account = await account_details.findOne({
          kyc_id: mongoose.Types.ObjectId(details?._id),
        });

        if (!account) {
          res.status(400).jsonp({ status: false, message: "Bad request2!" });
        }

        var role_details = await user_role.findOne({
          role_id: Number(account.role_id),
        });

        var status = await kyc_status.findOne({
          status_id: Number(details.kyc_status),
        });

        var jsonObject = {
          first_name: account.first_name,
          last_name: account.last_name,
          kyc_id: account.kyc_id,
          acknowledgement: account.acknowledgement,
          role_id: role_details.role_id,
          role_name: role_details.role_name,
          kyc_status_id: status.status_id,
          kyc_status: status.status,
          details: details,
        };

        await refresh(authorization, userid, { username }, function (resp) {
          if (resp.status == true) {
            return res.status(200).jsonp({
              status: true,
              data: jsonObject,
              authorization: resp.token,
            });
          } else {
            return res
              .status(resp.code)
              .jsonp({ status: false, data: null, authorization: null });
          }
        });
      } catch (ex) {
        console.log("hit");
        loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
        return res.status(500).jsonp({ status: false, message: ex });
      }
    }
  },

 

  updateKycStatus: async (req, res) => {
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
        var details_of_kyc = await kyc_details
          .findOne({ _id: mongoose.Types.ObjectId(req.headers.statusid) })
          .catch((ex) => {
            loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
            return res
              .status(500)
              .jsonp({ status: false, message: ex.toString() });
          });
        var temp_account_details = await account_details
          .findOne({ kyc_id: mongoose.Types.ObjectId(req.headers.statusid) })
          .catch((ex) => {
            loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
            return res
              .status(400)
              .jsonp({ status: false, message: "Bad request!" });
          });
        if (!details_of_kyc) {
          return res
            .status(403)
            .jsonp({ status: false, message: "You are not allowed to do so!" });
        }

        var environmental_scope_certificates = [];
        var social_compliance_certificates = [];
        var chemical_compliance_certificates = [];
        var sustainable_process_certificates = [];
        var aware_tracer = [];
        var custom_tracer = [];
        console.log(
          "details_of_kyc.environmental_scope_certificates",
          details_of_kyc.environmental_scope_certificates
        );

        console.log(
          "Shivam_chauhan",
          req.body.kyc_status,
          req.headers.statusid
        );
        if (req.body.kyc_status == 3) {
          for (const item of details_of_kyc.environmental_scope_certificates) {
            if (item.status != "verified") {
              var temp = {
                doc_id: item.doc_id,
                documentname: item.documentname,
                description: item.description,
                validthru: item.validthru,
                isselected: item.isselected,
                path: item.path,
                status: "verified",
              };
              environmental_scope_certificates.push(temp);
            } else {
              environmental_scope_certificates.push(item);
            }
          }
          for (const item of details_of_kyc.social_compliance_certificates) {
           

            if (item.status != "verified") {
              var temp = {
                doc_id: item.doc_id,
                documentname: item.documentname,
                description: item.description,
                validthru: item.validthru,
                isselected: item.isselected,
                path: item.path,
                status: "verified",
              };
              social_compliance_certificates.push(temp);
            } else {
              social_compliance_certificates.push(item);
            }
          }
          for (const item of details_of_kyc.chemical_compliance_certificates) {
            if (item.status != "verified") {
              var temp = {
                doc_id: item.doc_id,
                documentname: item.documentname,
                description: item.description,
                validthru: item.validthru,
                isselected: item.isselected,
                path: item.path,
                status: "verified",
              };
              chemical_compliance_certificates.push(temp);
            } else {
              chemical_compliance_certificates.push(item);
            }
          }

          for (const item of details_of_kyc.sustainable_process_certificates) {
            if (item.status != "verified") {
              var temp = {
                doc_id: item.doc_id,
                documentname: item.documentname,
                description: item.description,
                validthru: item.validthru,
                isselected: item.isselected,
                path: item.path,
                status: "verified",
              };
              sustainable_process_certificates.push(temp);
            } else {
              sustainable_process_certificates.push(item);
            }
          }
          for (const item of details_of_kyc.aware_tracer) {
            if (item.status != "verified") {
              var temp = {
                _id: item._id,
                tracer_id: item.tracer_id,
                licensenumber: item.licensenumber,
                validthru: item.validthru,
                path: item.path,
                status: "verified",
              };
              aware_tracer.push(temp);
            } else {
              aware_tracer.push(item);
            }
          }
          for (const item of details_of_kyc.custom_tracer) {
            if (item.status != "verified") {
              var temp = {
                tracer_id: item.tracer_id,
                tracerName: item.tracerName,
                validthru: item.validthru,
                path: item.path,
                status: "verified",
              };
              custom_tracer.push(temp);
            } else {
              custom_tracer.push(item);
            }
          }
        } else if (req.body.kyc_status == 4) {
          for (const item of details_of_kyc.environmental_scope_certificates) {
            if (item.status != "verified") {
              var temp = {
                doc_id: item.doc_id,
                documentname: item.documentname,
                description: item.description,
                validthru: item.validthru,
                isselected: item.isselected,
                path: item.path,
                status: "rejected",
              };
              environmental_scope_certificates.push(temp);
            } else {
              environmental_scope_certificates.push(item);
            }
          }
          for (const item of details_of_kyc.social_compliance_certificates) {
            if (item.status != "verified") {
              var temp = {
                doc_id: item.doc_id,
                documentname: item.documentname,
                description: item.description,
                validthru: item.validthru,
                isselected: item.isselected,
                path: item.path,
                status: "rejected",
              };
              social_compliance_certificates.push(temp);
            } else {
              social_compliance_certificates.push(item);
            }
          }
          for (const item of details_of_kyc.chemical_compliance_certificates) {
            if (item.status != "verified") {
              var temp = {
                doc_id: item.doc_id,
                documentname: item.documentname,
                description: item.description,
                validthru: item.validthru,
                isselected: item.isselected,
                path: item.path,
                status: "rejected",
              };
              chemical_compliance_certificates.push(temp);
            } else {
              chemical_compliance_certificates.push(item);
            }
          }
          for (const item of details_of_kyc.sustainable_process_certificates) {
            if (item.status != "verified") {
              var temp = {
                doc_id: item.doc_id,
                documentname: item.documentname,
                description: item.description,
                validthru: item.validthru,
                isselected: item.isselected,
                path: item.path,
                status: "rejected",
              };
              sustainable_process_certificates.push(temp);
            } else {
              sustainable_process_certificates.push(item);
            }
          }
          for (const item of details_of_kyc.aware_tracer) {
            if (item.status != "verified") {
              var temp = {
                _id: item._id,
                tracer_id: item.tracer_id,
                licensenumber: item.licensenumber,
                validthru: item.validthru,
                path: item.path,
                status: "rejected",
              };
              aware_tracer.push(temp);
            } else {
              aware_tracer.push(item);
            }
          }
          for (const item of details_of_kyc.custom_tracer) {
            if (item.status != "verified") {
              var temp = {
                tracer_id: item.tracer_id,
                tracerName: item.tracerName,
                validthru: item.validthru,
                path: item.path,
                status: "rejected",
              };
              custom_tracer.push(temp);
            } else {
              custom_tracer.push(item);
            }
          }
        } else if (req.body.kyc_status == 5) {
          for (const item of details_of_kyc.environmental_scope_certificates) {
            if (item.status != "verified") {
              var temp = {
                doc_id: item.doc_id,
                documentname: item.documentname,
                description: item.description,
                validthru: item.validthru,
                isselected: item.isselected,
                path: item.path,
                status: "on-hold",
              };
              environmental_scope_certificates.push(temp);
            } else {
              environmental_scope_certificates.push(item);
            }
          }
          for (const item of details_of_kyc.social_compliance_certificates) {
            if (item.status != "verified") {
              var temp = {
                doc_id: item.doc_id,
                documentname: item.documentname,
                description: item.description,
                validthru: item.validthru,
                isselected: item.isselected,
                path: item.path,
                status: "on-hold",
              };
              social_compliance_certificates.push(temp);
            } else {
              social_compliance_certificates.push(item);
            }
          }
          for (const item of details_of_kyc.chemical_compliance_certificates) {
            if (item.status != "verified") {
              var temp = {
                doc_id: item.doc_id,
                documentname: item.documentname,
                description: item.description,
                validthru: item.validthru,
                isselected: item.isselected,
                path: item.path,
                status: "on-hold",
              };
              chemical_compliance_certificates.push(temp);
            } else {
              chemical_compliance_certificates.push(item);
            }
          }
          for (const item of details_of_kyc.sustainable_process_certificates) {
            if (item.status != "verified") {
              var temp = {
                doc_id: item.doc_id,
                documentname: item.documentname,
                description: item.description,
                validthru: item.validthru,
                isselected: item.isselected,
                path: item.path,
                status: "on-hold",
              };
              sustainable_process_certificates.push(temp);
            } else {
              sustainable_process_certificates.push(item);
            }
          }
          for (const item of details_of_kyc.aware_tracer) {
            if (item.status != "verified") {
              var temp = {
                _id: item._id,
                tracer_id: item.tracer_id,
                licensenumber: item.licensenumber,
                validthru: item.validthru,
                path: item.path,
                status: "on-hold",
              };
              aware_tracer.push(temp);
            } else {
              aware_tracer.push(item);
            }
          }
          for (const item of details_of_kyc.custom_tracer) {
            if (item.status != "verified") {
              var temp = {
                tracer_id: item.tracer_id,
                tracerName: item.tracerName,
                validthru: item.validthru,
                path: item.path,
                status: "on-hold",
              };
              custom_tracer.push(temp);
            } else {
              custom_tracer.push(item);
            }
          }
        }
        let lockaccessToken = Math.floor(Math.random() * 16777215).toString(16);
        await account_availability
          .findOneAndUpdate(
            { email: temp_account_details.email },
            { hash: lockaccessToken }
          )
          .catch((ex) => {
            loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
            return callback({ status: false, message: "Internal error" });
          });

        //newly added
        // const kyc_obj_found = await kyc_details.findOne({ _id: mongoose.Types.ObjectId(req.headers.statusid) }).select(["company_name", "company_logo"]).catch((ex) => { loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`); return res.status(400).jsonp({ status: false, message: "Bad request!" }); })

        const kyc_obj_found = await kyc_details
          .findOne({ _id: mongoose.Types.ObjectId(req.headers.statusid) })
          .select(["company_name", "company_logo", "sub_brand"])
          .catch((ex) => {
            loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
            return res
              .status(400)
              .jsonp({ status: false, message: "Bad request!" });
          });

        console.log("kyc_obj_found132", kyc_obj_found);
        let SubBrand = {
          name: kyc_obj_found.company_name,
          logo: kyc_obj_found.company_logo,
        };

        console.log("SubBrand", SubBrand);
        console.log(
          "temp_account_details.role_id",
          temp_account_details.role_id
        );

        kyc_details.findByIdAndUpdate(
          { _id: mongoose.Types.ObjectId(req.headers.statusid) },
        
          {
            kyc_status: req.body.kyc_status,
            environmental_scope_certificates: environmental_scope_certificates,
            social_compliance_certificates: social_compliance_certificates,
            chemical_compliance_certificates: chemical_compliance_certificates,
            sustainable_process_certificates: sustainable_process_certificates,
            aware_tracer: aware_tracer,
            custom_tracer: custom_tracer,
          },
          async function (err, datasubmitted) {
            if (err) {
              loggerhandler.logger.error(`${err} ,email:${req.headers.email}`);
              return res.status(500).jsonp({ status: false, message: err });
            }

            if (req.body.kyc_status == 3) {
              web3_handler.createWalletAsync(
                details_of_kyc.aware_id,
                function (resget) {
                  console.log("res", resget);
                  if (resget != true) {
                    return res
                      .status(500)
                      .jsonp({ status: false, message: "Internal error!" });
                  } else {
                    var payload = { username: req.headers.username };
                    refresh(
                      req.headers.authorization,
                      req.headers.userid,
                      payload,
                      async function (resp) {
                        if (resp.status == true) {
                          var accountdetails = await account_details
                            .findOne({ kyc_id: req.headers.statusid })
                            .catch((ex) => {
                              loggerhandler.logger.error(
                                `${ex} ,email:${req.headers.email}`
                              );
                              return res.status(400).jsonp({
                                status: false,
                                message: "Bad request!",
                              });
                            });

                          if (!accountdetails) {
                            return res.status(200).jsonp({
                              status: true,
                              data: null,
                              authorization: resp.token,
                            });
                          } else {
                            SendGrid.sendKycStatusMail(
                              accountdetails.email,
                              req.body.kyc_status,
                              "",
                              function (result) {
                                if (result != null) {
                                  return res.status(200).jsonp({
                                    status: true,
                                    message: "KYC status has been updated.",
                                    authorization: resp.token,
                                  });
                                } else {
                                  return res.status(500).jsonp({
                                    status: false,
                                    message: "Internal error!",
                                  });
                                }
                              }
                            );
                          }
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
                }
              );
            } else {
              var payload = { username: req.headers.username };
              refresh(
                req.headers.authorization,
                req.headers.userid,
                payload,
                async function (resp) {
                  if (resp.status == true) {
                    var accountdetails = await account_details
                      .findOne({ kyc_id: req.headers.statusid })
                      .catch((ex) => {
                        loggerhandler.logger.error(
                          `${ex} ,email:${req.headers.email}`
                        );
                        return res
                          .status(400)
                          .jsonp({ status: false, message: "Bad request!" });
                      });

                    if (!accountdetails) {
                      return res.status(200).jsonp({
                        status: true,
                        data: null,
                        authorization: resp.token,
                      });
                    } else {
                      SendGrid.sendKycStatusMail(
                        accountdetails.email,
                        req.body.kyc_status,
                        "",
                        function (result) {
                          if (result != null) {
                            return res.status(200).jsonp({
                              status: true,
                              message: "KYC status has been updated.",
                              authorization: resp.token,
                            });
                          } else {
                            return res.status(500).jsonp({
                              status: false,
                              message: "Internal error!",
                            });
                          }
                        }
                      );
                    }
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
          }
        );
      }
    }
  },
  ///create wet processsing list
  postmasterdataAsync: async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res
        .status(422)
        .jsonp({ status: false, message: "Bad payload received." });
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
        var name = req.body.name;
        var masterId = req.body.masterId;
        masters_data.find(
          { $and: [{ masterId: masterId }] },
          function (err, user) {
            console.log("err", err);
            if (err) {
              loggerhandler.logger.error(`${err} ,email:${req.headers.email}`);
              return res
                .status(500)
                .jsonp({ status: false, message: err.toString() });
            }

            if (user.name == name) {
              console.log(name);
              return res.status(200).jsonp({
                status: false,
                message: user,
              });
            } else {
              masters_data.create(
                {
                  masterId: masterId,
                  name: name,
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

                  if (user) {
                    // console.log("user", user);
                    var payload = { username: req.headers.username };
                    refresh(
                      req.headers.authorization,
                      req.headers.userid,
                      payload,
                      function (resp) {
                        if (resp.status == true) {
                          // console.log("data received", jsonObject);
                          return res.status(200).jsonp({
                            message: "new data added successfully",
                            status: true,
                            authorization: resp.token,
                          });
                        } else {
                          return res.status(resp.code).jsonp({
                            status: false,
                            authorization: null,
                          });
                        }
                      }
                    );
                  }
                }
              );
            }
          }
        );
      }
    }
  },

  postmasterAsync: async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res
        .status(422)
        .jsonp({ status: false, message: "Bad payload received." });
    } else {
      var masterName = req.body.masterName;

      masters.findOne(
        { $and: [{ masterName: masterName }] },
        function (err, user) {
          console.log("err", err);
          if (err) {
            {
              loggerhandler.logger.error(`${err} ,email:${req.headers.email}`);
              return res
                .status(500)
                .jsonp({ status: false, message: err.toString() });
            }
          } else if (user) {
            return res.status(200).jsonp({
              status: false,
              message: "Name exist!, Please try again with a different name!",
            });
          } else {
            masters.create(
              {
                masterName: masterName,
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

                if (user) {
                  // console.log("user", user);
                  res.status(200).jsonp({
                    status: true,
                    message: "new master created",
                  });
                }
              }
            );
          }
        }
      );
    }
  },

  getallmastersasync: async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).jsonp(errors.array());
    } else {
      // console.log(req.headers.username);

      if (!req.headers.username || !req.headers.authorization) {
        return res
          .status(400)
          .jsonp({ status: false, message: "Bad request!" });
      }

      masters.find({}, async function (err, account) {
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
                data: account,
                authorization: resp.token,
              });
            } else {
              return res
                .status(resp.code)
                .jsonp({ status: false, data: null, authorization: null });
            }
          }
        );
      });
    }
  },

  getmasterdataAsync: async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res
        .status(422)
        .jsonp({ status: false, message: "Bad payload received." });
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
        var masterId = req.headers.masterid;
        masters_data
          .find({ $and: [{ masterId: masterId }] }, function (err, user) {
            // console.log("err", err);
            if (err) {
              loggerhandler.logger.error(`${err} ,email:${req.headers.email}`);
              return res
                .status(500)
                .jsonp({ status: false, message: err.toString() });
            }

            if (user) {
              // console.log("user", user);

              var payload = { username: req.headers.username };
              refresh(
                req.headers.authorization,
                req.headers.userid,
                payload,
                function (resp) {
                  if (resp.status == true) {
                    // console.log("data received", jsonObject);
                    return res.status(200).jsonp({
                      message: "all the data received of particular master",
                      status: true,
                      data: user,
                      authorization: resp.token,
                    });
                  } else {
                    return res.status(resp.code).jsonp({
                      status: false,
                      authorization: null,
                    });
                  }
                }
              );
            }
          })
          .sort({ name: 1 });
      }
    }
  },

  // SHIVAM CHUAHAN

  getmasterdataHArdAsync: async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res
        .status(422)
        .jsonp({ status: false, message: "Bad payload received." });
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
        const masterIDS = req.headers.masterid;
        let masters_data01;
        let allIDDATA;
        for (let i = 0; i < masterIDS.length; i++) {
          masters_data01 = masters_data.findOne({ masketrId: masterIDS[i] });
          allIDDATA.push(masters_data01);
        }

        
      }
    }
  },

  deletemasterdata: async (req, res) => {
    const errors = validationResult(req);
    // console.log("id is there", req.headers.clientid);

    if (!errors.isEmpty()) {
      return res.status(422).jsonp(errors.array());
    } else {
      // console.log(req.body);
      if (
        !req.headers.userid ||
        !req.headers.username ||
        !req.headers.authorization
      ) {
        return res
          .status(400)
          .jsonp({ status: false, message: "Bad request!" });
      } else {
        masters_data.findByIdAndRemove(
          { _id: mongoose.Types.ObjectId(req.headers.id) },

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
                    message: "details has been Deleted.",
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

  updatemasterdata: async (req, res) => {
    const errors = validationResult(req);
    // console.log("id is there", req.headers.clientid);

    if (!errors.isEmpty()) {
      return res.status(422).jsonp(errors.array());
    } else {
      // console.log(req.body);
      if (
        !req.headers.userid ||
        !req.headers.username ||
        !req.headers.authorization
      ) {
        return res
          .status(400)
          .jsonp({ status: false, message: "Bad request!" });
      } else {
        let name = req.body.name;
        masters_data.findByIdAndUpdate(
          { _id: mongoose.Types.ObjectId(req.headers.id) },
          {
            name: name,
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
                    message: " details has been updated to the directory.",
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

  updateTokenStatusAndTransferAwareToken: async (req, res) => {
    try {
   

      const { userid, username, authorization } = req.headers;
      console.log("req.headers", req.headers);
      console.log("req.body", req.body);
      const { data } = req.body;

      // Validate required headers and body parameters
      if (!userid || !username || !authorization) {
        return res
          .status(400)
          .jsonp({ status: false, message: "Bad request!" });
      }

      // Refresh token and store new authorization
      let newToken;
      https: await new Promise((resolve) => {
        refresh(authorization, userid, { username }, (resp) => {
          if (resp.status) {
            newToken = resp.token;
            resolve();
          } else {
            return res.status(resp.code).jsonp({
              status: false,
              message: "Authorization failed!",
              authorization: null,
            });
          }
        });
      });

      const createTokensIds = data.map((item) => mongoose.Types.ObjectId(item._id));

      console.log("🪙TCA🪙 CreateTokensIds", createTokensIds);

      // Update token status
      await aw_tokens.updateMany(
        { _id: { $in: createTokensIds } },
        { status: "Processing" }
      );

      

      if (!schedulerRunning) {
        console.log("Scheduler started.");
        startScheduler();
      } else {
        console.log("Scheduler already running.");
      }

      // Immediately respond to the request
      res.status(200).jsonp({
        status: true,
        message:
          "Your request for token approval has been logged. This process may take a few minutes. Please check the status later.",
        authorization: newToken,
      });

     
    } catch (ex) {
      loggerhandler.logger.error(`Unhandled error: ${ex}`);
      return res.status(500).jsonp({ status: false, message: ex.message });
    }
  },

 

  updateTokenStatusAndSendToken: async (req, res) => {
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
      } else {
        if (req.body.token_status == "approved") {
         
          await send_aw_tokens
            .findOneAndUpdate(
              {
                _awareid: req.headers.aware_id,
                _id: mongoose.Types.ObjectId(req.body._id),
              },
              { status: "Approved" },
              { new: true }
            )
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
                return res.status(200).jsonp({
                  status: true,
                  message:
                    "Tokens have been transferred to the user wallet successfully",
                  authorization: resp.token,
                });
              } else {
                return res
                  .status(resp.code)
                  .jsonp({ status: false, message: null, authorization: null });
              }
            }
          );
        } else {
          await send_aw_tokens
            .findOneAndUpdate(
              {
                _awareid: req.headers.aware_id,
                _id: mongoose.Types.ObjectId(req.body._id),
              },
              { status: "Approved" },
              { new: true }
            )
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
                return res.status(200).jsonp({
                  status: true,
                  message: "Token request has been rejected.",
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
      }
    }
  },



  updateTokenStatusAndTransferUpdateAwareToken: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).jsonp(errors.array());
      }

      const { userid, username, authorization } = req.headers;
      const { data } = req.body;

      // Validate required headers and body parameters
      if (!userid || !username || !authorization) {
        return res
          .status(400)
          .jsonp({ status: false, message: "Bad request!" });
      }

      // Refresh token and store new authorization
      let newToken;
      await new Promise((resolve) => {
        refresh(authorization, userid, { username }, (resp) => {
          if (resp.status) {
            newToken = resp.token;
            resolve();
          } else {
            return res.status(resp.code).jsonp({
              status: false,
              message: "Authorization failed!",
              authorization: null,
            });
          }
        });
      });

       const updateTokensIds = data.map((item) => item._id);

      console.log("🪙TUA🪙 UpdateTokensIds", updateTokensIds);

      // Update token status
      await update_aw_tokens.updateMany(
        { _id: { $in: updateTokensIds } },
        { status: "Processing" }
      );


      

      if (!schedulerRunning) {
        console.log("Scheduler started.");
        startScheduler();
      } else {
        console.log("Scheduler already running.");
      }

      // Immediately respond to the request
      res.status(200).jsonp({
        status: true,
        message:
          "Your request for token approval has been logged. This process may take a few minutes. Please check the status later.",
        authorization: newToken,
      });

      
    } catch (ex) {
      loggerhandler.logger.error(`Unhandled error: ${ex}`);
      return res.status(500).jsonp({ status: false, message: ex.message });
    }
  },

  ///// jan 2 nikhil
  updateMaterialDataAsync: async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res
        .status(422)
        .jsonp({ status: false, message: "Bad payload received." });
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
        // console.log("body", req.body)
        const update_material_data_exist = await material
          .findOne({ _id: mongoose.Types.ObjectId(req.body._id) })
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
              if (update_material_data_exist) {
                // console.log("req.body", req.body)

                material.findOneAndUpdate(
                  { _id: mongoose.Types.ObjectId(req.body._id) },
                  {
                    name: req.body.name,
                    // description: req.body.description,
                    // value: req.body.value,
                    value: req.body.description,
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
                    return res.status(200).jsonp({
                      status: true,
                      message: "Material has beeen Updated successfully",
                      authorization: resp.token,
                    });
                  }
                );
              } else {
                const duplicate_material_data_exist = await material
                  .findOne({ name: req.body.name })
                  .catch((ex) => {
                    loggerhandler.logger.error(
                      `${ex} ,email:${req.headers.email}`
                    );
                    return res
                      .status(500)
                      .jsonp({ status: false, message: ex.toString() });
                  });
                if (duplicate_material_data_exist) {
                  return res.status(resp.code).jsonp({
                    status: false,
                    message:
                      "Name Entered on Material is Duplicate Please Try Another Name",
                  });
                } else {
                  material.create(
                    { name: req.body.name, value: req.body.description },
                    async function (err, user) {
                      if (err) {
                        loggerhandler.logger.error(
                          `${err} ,email:${req.headers.email}`
                        );
                        return res
                          .status(500)
                          .jsonp({ status: false, message: err.toString() });
                      } else {
                        return res.status(200).jsonp({
                          status: true,
                          message: "New Material Saved successfully",
                          authorization: resp.token,
                        });
                      }
                    }
                  );
                }
              }
            } else {
              return res.status(resp.code).jsonp({
                status: false,
                message: `An internal error occurred while authenticating.,
            Please contact Administrator.`,
                authorization: null,
              });
            }
          }
        );
      }
    }
  },
  getMaterialDataListAsync: async (req, res) => {
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
            var get_all_material_list = await material.find({}).catch((ex) => {
              loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
              return res
                .status(400)
                .jsonp({ status: false, message: "Bad request!" });
            });
            if (get_all_material_list.length <= 0) {
              return res
                .status(200)
                .jsonp({ status: true, data: null, authorization: resp.token });
            } else {
              return res.status(200).jsonp({
                status: true,
                data: get_all_material_list,
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
  deleteMaterialDataAsync: async (req, res) => {
    const errors = validationResult(req);
    // console.log("id is there", req.headers.clientid);

    if (!errors.isEmpty()) {
      return res.status(422).jsonp(errors.array());
    } else {
      // console.log(req.body);
      if (
        !req.headers.userid ||
        !req.headers.username ||
        !req.headers.authorization
      ) {
        return res
          .status(400)
          .jsonp({ status: false, message: "Bad request!" });
      } else {
        material.findByIdAndRemove(
          { _id: mongoose.Types.ObjectId(req.headers.id) },

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
                    message: "details has been Deleted.",
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

  //// 3 jan

  getvaluechainprocess: async (req, res) => {
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
            var valueChain_exist = await valueChain.find({}).catch((ex) => {
              loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
              return res
                .status(400)
                .jsonp({ status: false, message: "Bad request!" });
            });
            console.log("value chain 1", valueChain_exist);

            if (!valueChain_exist) {
              return res
                .status(200)
                .jsonp({ status: true, data: null, authorization: resp.token });
            } else {
              let value_chain_process_list = [];
              valueChain_exist.forEach((item) => {
                let object = {
                  id: item._id,
                  color: item.color,
                  main: item.main,
                  sub: item.sub,
                };
                value_chain_process_list.push(object);
              });
              console.log("value chain 2", value_chain_process_list);
              return res.status(200).jsonp({
                status: true,
                data: value_chain_process_list,
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
  postvaluechainprocess: async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res
        .status(422)
        .jsonp({ status: false, message: "Bad payload received." });
    } else {
      const valueChain_exist = await valueChain
        .findOne({ main: req.body.valuechain_object.main })
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
            const last_element = await valueChain
              .find()
              .sort({ $natural: -1 })
              .limit(1)
              .catch((ex) => {
                loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
                return res
                  .status(500)
                  .jsonp({ status: false, message: ex.toString() });
              });

            var value = 0;
            if (last_element[0]?.color_number) {
              value = last_element[0]?.color_number - 16;
            } else {
              value = 230;
            }
            var grayscale = (value << 16) | (value << 8) | value;
            var color = "#" + grayscale.toString(16);
            // console.log('hi', color);
            if (valueChain_exist) {
              return res.status(200).jsonp({
                status: false,
                message:
                  "Main Entered on Value Chain Process is Duplicate Please Try Another Main",
                authorization: null,
              });
            } else {
              if (last_element[0]?.color_number == 86) {
                return res.status(200).jsonp({
                  status: false,
                  message:
                    "The limitation of adding Value Chain Process has been exceeded. Please contact Administrator.",
                  authorization: null,
                });
              } else {
                valueChain.create(
                  {
                    color: color,
                    color_number: value,
                    main: req.body.valuechain_object.main,
                    sub: req.body.valuechain_object.sub,
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
                      message:
                        "Value Chain Process has been Saved successfully",
                      authorization: resp.token,
                    });
                  }
                );
              }
            }
          } else {
            return res.status(resp.code).jsonp({
              status: false,
              message:
                "An internal error occurred while authenticating.Please contact Administrator.",
              authorization: null,
            });
          }
        }
      );
    }
  },

  report_including_token_minted_and_update_per_account: async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res
        .status(422)
        .jsonp({ status: false, message: "Bad payload received." });
    } else {
      var exempted_email_exist = await exempted_email.find({}).catch((ex) => {
        return res
          .status(400)
          .jsonp({ status: false, message: "Bad request!" });
      });

      // console.log("exempted_email_exist", exempted_email_exist)

      const emails = [];
      const map8 = new Map();
      for (const item of exempted_email_exist) {
        if (!map8.has(item.email)) {
          map8.set(item.email, true); // set any value to Map
          emails.push(item.email);
        }
      }

      var accounts = await account_details
        .find({ role_id: { $ne: 1 }, email: { $nin: emails } })
        .select(["kyc_id"])
        .catch((ex) => {
          return res
            .status(400)
            .jsonp({ status: false, message: "Bad request!" });
        });

      const kyc_ids = [];
      const map = new Map();
      for (const item of accounts) {
        if (!map.has(mongoose.Types.ObjectId(item.kyc_id))) {
          map.set(mongoose.Types.ObjectId(item.kyc_id), true); // set any value to Map
          kyc_ids.push(mongoose.Types.ObjectId(item.kyc_id));
        }
      }

      var aware_ids = await kyc_details
        .find({ _id: { $in: kyc_ids } })
        .select(["aware_id"])
        .catch((ex) => {
          return res
            .status(400)
            .jsonp({ status: false, message: "Bad request!" });
        });

      var aware_ids_converted = [];
      for (var i = 0; i < aware_ids.length; i++) {
        aware_ids_converted.push(aware_ids[i].aware_id);
      }

      var aware_token_ids = await aw_tokens
        .find({
          _awareid: { $in: aware_ids_converted },
          status: "Approved",
          blockchain_id: { $ne: null },
        })
        .select(["_id"])
        .catch((ex) => {
          return res
            .status(400)
            .jsonp({ status: false, message: "Bad request!" });
        });

      var aware_token_ids_converted = [];
      for (var i = 0; i < aware_token_ids.length; i++) {
        aware_token_ids_converted.push(aware_token_ids[i]._id.toString());
      }

      var physical_assets_avaliable = await physical_assets
        .find({ aware_token_id: { $in: aware_token_ids_converted } })
        .select(["weight"])
        .catch((ex) => {
          return res
            .status(400)
            .jsonp({ status: false, message: "Bad request!" });
        });

      var tokens_minted = 0;
      for (var i = 0; i < physical_assets_avaliable.length; i++) {
        tokens_minted += Number(physical_assets_avaliable[i].weight);
      }

      var ids = await purchase_orders
        .find({
          _awareid: { $in: aware_ids_converted },
          hide: { $ne: true },
          deleted: false,
        })
        .select(["_id"])
        .catch((ex) => {
          return res
            .status(400)
            .jsonp({ status: false, message: "Bad request!" });
        });

      var po_ids = [];
      for (var i = 0; i < ids.length; i++) {
        po_ids.push(ids[i]._id.toString());
      }

      var purchase_order_details_avaliable = await purchase_order_details
        .find({ po_id: { $in: po_ids }, deleted: false })
        .select([
          "_awareid",
          "producer_aware_id",
          "po_id",
          "date",
          "order_number",
          "country",
          "etd",
          "producer",
          "brand",
          "upload_po_pdf",
          "created_date",
        ])
        .catch((ex) => {
          return res
            .status(400)
            .jsonp({ status: false, message: "Bad request!" });
        });
      var product_lines_avaliable = await product_lines
        .find({ po_id: { $in: po_ids }, deleted: false })
        .select([
          "product_line.update_aware_token_id",
          "product_line.order_number",
          "product_line.product",
          "product_line.color",
          "product_line.color",
          "product_line.item_number",
          "product_line.description",
          "product_line.update_status",
          "po_id",
        ])
        .catch((ex) => {
          return res
            .status(400)
            .jsonp({ status: false, message: "Bad request!" });
        });
      var update_physical_asset_avaliable = await update_physical_asset
        .find({})
        .select(["update_aware_token_id", "weight"])
        .catch((ex) => {
          return res
            .status(400)
            .jsonp({ status: false, message: "Bad request!" });
        });

      // var update_physical_asset_avaliable = await update_physical_asset.find({}).select(['order_number','product','color','quantity','item_number','description','update_status','update_aware_token_id', 'weight']).catch((ex) => { return res.status(400).jsonp({ status: false, message: "Bad request!" }); })

      var JsonFormatted = [];
      for (var i = 0; i < purchase_order_details_avaliable.length; i++) {
        const po_id = purchase_order_details_avaliable[i].po_id;
        const product_lines = product_lines_avaliable.filter(
          (item) => item.po_id == po_id
        );

        var temp_array = [];
        var total_tokens = 0;
        for (var j = 0; j < product_lines.length; j++) {
          for (var k = 0; k < product_lines[j].product_line.length; k++) {
            if (product_lines[j].product_line[k].update_status == "FILLED") {
              const token_found = update_physical_asset_avaliable.find(
                (item) =>
                  item.update_aware_token_id ==
                  product_lines[j].product_line[k].update_aware_token_id
              );
              if (token_found) {
                total_tokens += Number(token_found.weight);

                temp_array.push({
                  product_line: product_lines[j].product_line[k],
                  token_detials: token_found,
                });
              }
            }
          }
        }

        if (temp_array.length > 0) {
          JsonFormatted.push({
            purchase_order: purchase_order_details_avaliable[i],
            related_po_lines: temp_array,
            total_token: total_tokens,
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
            return res.status(200).jsonp({
              status: true,
              data: { tokens_minted: tokens_minted, raw: JsonFormatted },
              authorization: resp.token,
            });
          } else {
            return res.status(resp.code).jsonp({
              status: false,
              message:
                "An internal error occurred while authenticating.Please contact Administrator.",
              authorization: null,
            });
          }
        }
      );
    }
  },

  getexemptedemaillist: async (req, res) => {
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
            var exempted_email_exist = await exempted_email
              .find({})
              .catch((ex) => {
                return res
                  .status(400)
                  .jsonp({ status: false, message: "Bad request!" });
              });
            if (!exempted_email_exist) {
              return res
                .status(200)
                .jsonp({ status: true, data: null, authorization: resp.token });
            } else {
              return res.status(200).jsonp({
                status: true,
                data: exempted_email_exist,
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
  postexemptedemail: async (req, res) => {
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
            exempted_email.create(
              {
                email: req.body.email,
                created_date: new Date(),
              },
              async function (err, user) {
                if (err)
                  return res
                    .status(500)
                    .jsonp({ status: false, message: err.toString() });
                return res.status(200).jsonp({
                  status: true,
                  message: "Exempted Email has been Saved successfully",
                  authorization: resp.token,
                });
              }
            );
          } else {
            return res.status(resp.code).jsonp({
              status: false,
              message:
                "An internal error occurred while authenticating.Please contact Administrator.",
              authorization: null,
            });
          }
        }
      );
    }
  },
  deleteexemptedemail: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).jsonp(errors.array());
    } else {
      // console.log(req.body);
      if (
        !req.headers.userid ||
        !req.headers.username ||
        !req.headers.authorization
      ) {
        return res
          .status(400)
          .jsonp({ status: false, message: "Bad request!" });
      } else {
        exempted_email.findByIdAndRemove(
          { _id: mongoose.Types.ObjectId(req.body.id) },
          function (err, datasubmitted) {
            if (err)
              return res.status(500).jsonp({ status: false, message: err });
            var payload = { username: req.headers.username };
            refresh(
              req.headers.authorization,
              req.headers.userid,
              payload,
              function (resp) {
                if (resp.status == true) {
                  return res.status(200).jsonp({
                    status: true,
                    message: "Exempted Email has been Deleted.",
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

  getBalancesFromAdminWallet: async (req, res) => {
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
            await web3_handler.getBalanceAsync(async function (response) {
              if (response.status == false) {
                return res.status(500).jsonp({
                  status: false,
                  message: "Internal error!",
                  data: null,
                  authorization: null,
                });
              } else {
                return res.status(200).jsonp({
                  status: true,
                  message: "Data fetched successfully!",
                  data: {
                    address: response.address,
                    iotxBalance: parseFloat(response.iotxBalance).toFixed(2),
                  },
                  authorization: resp.token,
                });
              }
            });
          } else {
            return res.status(500).jsonp({
              status: false,
              message:
                "An internal error occurred while authenticating.Please contact Administrator.",
              data: null,
              authorization: null,
            });
          }
        }
      );
    }
  },



  postManagerRegisterAsync: async (req, res) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res
          .status(422)
          .jsonp({ status: false, message: "Bad payload received." });
      }

      const { first_name, last_name, aware_id, email, role_id, id } = req.body;
      console.log({ first_name, last_name, aware_id, email, role_id, id });

      const capitalizedString =
        first_name.charAt(0).toUpperCase() + first_name.slice(1);
      console.log(capitalizedString);
      const fullname = `${capitalizedString} ${last_name}`;
      const email_address = email.toLowerCase();

      const password = `${capitalizedString?.slice(0, 4)}-${last_name?.slice(
        0,
        4
      )}-aw${new Date()?.getFullYear()}`;
      console.log({ password, date: new Date()?.getFullYear() });
      const hashedPassword = bcrypt.hashSync(password, 10);

      if (id) {
        // existing manager password changed to the new password

        const updatedUser = await account_details.findOneAndUpdate(
          { _id: mongoose.Types.ObjectId(id) },
          {
            first_name: capitalizedString,
            last_name,
            email: email_address.trim(),
            password: hashedPassword,
            modified_date: new Date(),
          },
          { new: true }
        );
        if (updatedUser) {
          SendGrid.sendManagerPasswordChangeMail(
            email,
            capitalizedString,
            (result) => {
              if (result != null) {
                return res.status(200).jsonp({
                  status: true,
                  message:
                    "An Invitation email has been sent to the manager successfully.",
                });
              } else {
                return res.status(500).jsonp({
                  status: false,
                  message:
                    "Internal error! Please Re-send Verification link to Manager email address.",
                });
              }
            }
          );

          // return res.status(200).jsonp({ status: true, message: "Updated Manager Details" });
        }
      } else {
        let emailchecker = await account_details.findOne({ email });

        console.log({ emailchecker, email });
        if (emailchecker) {
          return res.status(200).jsonp({
            status: false,
            message:
              "User exists with same email account, Please try again with a different email account!",
          });
        }

        const createdUser = await account_details.create({
          first_name: capitalizedString,
          last_name,
          aware_id,
          email: email_address.trim(),
          role_id,
          password: hashedPassword,
          termsnconditions: true,
          status: true,
          two_fa_enabled: true,
          created_date: new Date(),
        });

        await kyc_details.findOneAndUpdate(
          { aware_id },
          { manager_id: createdUser._id }
        );

        SendGrid.sendInvitationManagerMail(email, fullname, (result) => {
          if (result != null) {
            return res.status(200).jsonp({
              status: true,
              message:
                "An Invitation email has been sent to the manager successfully.",
            });
          } else {
            return res.status(500).jsonp({
              status: false,
              message:
                "Internal error! Please Re-send Verification link to Manager email address.",
            });
          }
        });
      }
    } catch (error) {
      return res
        .status(500)
        .jsonp({ status: false, message: error.toString() });
    }
  },

  postSubUserRegisterAsync: async (req, res) => {
    console.log("hitting here only");
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res
          .status(422)
          .jsonp({ status: false, message: "Bad payload received." });
      }

      const {
        first_name,
        last_name,
        aware_id,
        email,
        role_id = 7,
        id,
        kyc_id,
      } = req.body;
      console.log({
        first_name,
        last_name,
        aware_id,
        email,
        role_id,
        id,
        kyc_id,
      });

      const capitalizedString =
        first_name.charAt(0).toUpperCase() + first_name.slice(1);
      console.log({ capitalizedString });
      const fullname = `${capitalizedString} ${last_name}`;
      const email_address = email.toLowerCase();

      const password = `${capitalizedString?.slice(0, 4)}-${last_name?.slice(
        0,
        4
      )}-aw${new Date()?.getFullYear()}`;
      console.log({ password, date: new Date()?.getFullYear() });
      const hashedPassword = bcrypt.hashSync(password, 10);

      if (id) {
        // existing manager password changed to the new password

        const updatedUser = await account_details.findOneAndUpdate(
          { _id: mongoose.Types.ObjectId(id) },
          {
            first_name: capitalizedString,
            last_name,
            email: email_address.trim(),
            password: hashedPassword,
            modified_date: new Date(),
          },
          { new: true }
        );
        console.log({ updatedUser });
        if (updatedUser) {
          console.log("working till now!!!!");
          SendGrid.sendManagerPasswordChangeMail(
            email,
            capitalizedString,
            (result) => {
              if (result != null) {
                return res.status(200).jsonp({
                  status: true,
                  message:
                    "An Invitation email has been sent to the Sub User successfully.",
                });
              } else {
                return res.status(500).jsonp({
                  status: false,
                  message:
                    "Internal error! Please Re-send Verification link to Manager email address.",
                });
              }
            }
          );

          // return res.status(200).jsonp({ status: true, message: "Updated Manager Details" });
        }
      } else {
        console.log("working till now!!!!101");

        let emailchecker = await account_details.findOne({ email });

        console.log({ emailchecker });

        if (emailchecker) {
          return res.status(200).jsonp({
            status: false,
            message:
              "User exists with same email account, Please try again with a different email account!",
          });
        }

        const createdUser = await account_details.create({
          first_name: capitalizedString,
          last_name,
          aware_id,
          email: email_address.trim(),
          role_id,
          kyc_id,
          password: hashedPassword,
          termsnconditions: true,
          status: true,
          two_fa_enabled: true,
          created_date: new Date(),
          sub_user: true,
          acknowledgement: true,
        });
        // unable beacuse it is not reflecting the current added subuser in the sub user array
        let kyc_details_updated = await kyc_details.findOneAndUpdate(
          { aware_id },
          {
            $addToSet: { sub_user: createdUser._id },
            modified_on: new Date(),
          },
          { new: true }
        );

        SendGrid.sendInvitationSubBrandMail(
          email,
          fullname,
          kyc_details_updated?.company_name,
          (result) => {
            if (result != null) {
              return res.status(200).jsonp({
                status: true,
                message:
                  "An Invitation email has been sent to the Sub User successfully.",
                data: kyc_details_updated.sub_user,
              });
            } else {
              return res.status(500).jsonp({
                status: false,
                message:
                  "Internal error! Please Re-send Verification link to Manager email address.",
              });
            }
          }
        );
      }
    } catch (error) {
      if (!errors.isEmpty()) {
        return res
          .status(422)
          .jsonp({ status: false, message: "Bad payload received." });
      }
      return res
        .status(500)
        .jsonp({ status: false, message: error.toString() });
    }
  },

  deleteSubUserAsync: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty() || !req.body.aware_id || !req.body.id) {
        return res
          .status(422)
          .jsonp({ status: false, message: "Bad payload received." });
      }
      const { id, aware_id } = req.body;
      let kyc_details_available = await kyc_details
        .findOne({ aware_id: aware_id })
        .catch((err) => {
          return res
            .status(400)
            .json({ status: false, message: "Error while deleting" });
        });
      if (!kyc_details_available)
        return res
          .status(400)
          .json({ status: false, message: "Sub user does not exist" });
      kyc_details_available.sub_user = kyc_details_available.sub_user.filter(
        (e) => e != id
      );
      await kyc_details_available.save();
      console.log(id);

      await account_details
        .findOneAndUpdate(
          { _id: id },
          {
            email: process.env.ARCHIVED_EMAIL_ADDRESS,
            is_deleted: true,
          }
        )
        .then((result) => {
          if (result) {
            return res.status(200).jsonp({
              status: true,
              message: "Sub user deleted successfully",
              data: kyc_details_available.sub_user,
            });
          } else {
            return res
              .status(400)
              .json({ status: false, message: "Sub user not found" });
          }
        })
        .catch(() => {
          return res
            .status(400)
            .json({ status: false, message: "Error while deleting sub user" });
        });
    } catch {
      return res
        .status(400)
        .json({ status: false, message: "Error while deleting sub user" });
    }
  },

  postSubscriptionAsync: async (req, res) => {
    const errors = validationResult(req);
    // console.log("id is there", req.headers.clientid);

    if (!errors.isEmpty()) {
      return res.status(422).jsonp(errors.array());
    } else {
      // console.log(req.body);
      if (
        !req.headers.userid ||
        !req.headers.username ||
        !req.headers.authorization
      ) {
        return res
          .status(400)
          .jsonp({ status: false, message: "Bad request!" });
      } else {
        const {
          allowed_dpp,
          allowed_quantity,
          start_date,
          end_date,
          aware_id,
          id,
        } = req.body;
        console.log({
          allowed_dpp,
          allowed_quantity,
          start_date,
          end_date,
          aware_id,
          id,
        });

        // let startDate = moment(start_date, 'DD-MM-YYYY').toDate();
        // let endDate = moment(end_date, 'DD-MM-YYYY').toDate();

        // console.log('ffff', startDate, endDate);
        kyc_details.findOneAndUpdate(
          { aware_id },
          {
            subscription: {
              allowed_dpp,
              allowed_quantity,
              start_date,
              end_date,
            },
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
                    message: "Subscription has been updated to the directory.",
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

  getSubscriptionReportDetail: async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).jsonp(errors.array());
    } else {
      // console.log(req.headers.username);

      if (!req.headers.username || !req.headers.authorization) {
        return res
          .status(400)
          .jsonp({ status: false, message: "Bad request!" });
      }

      let account = await account_details
        .find({ is_deleted: { $ne: true }, role_id: 7 })
        .select(["kyc_id", "created_date"])
        .sort({ created_date: -1 })
        .catch((ex) => {
          loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
          return res
            .status(500)
            .jsonp({ status: false, message: "Internal error!" });
        });
      let account_ids = account.map((ele) =>
        mongoose.Types.ObjectId(ele.kyc_id)
      );
      var kycDetails = await kyc_details
        .find({ kyc_status: "3", _id: { $in: account_ids } })
        .catch((ex) => {
          loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
          return res
            .status(500)
            .jsonp({ status: false, message: "Internal error!" });
        });
      let aware_ids = kycDetails.map((ele) => ele.aware_id);
      var product_line_list = await product_lines
        .find({ _awareid: { $in: aware_ids }, deleted: false })
        .catch((ex) => {
          loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
          return res
            .status(500)
            .jsonp({ status: false, message: "Internal error!" });
        });

      let filtered_data = kycDetails.map((ele) => {
        let startDate = ele?.subscription?.start_date
          ? new Date(ele?.subscription?.start_date)
          : null;
        let endDate = ele?.subscription?.end_date
          ? new Date(ele?.subscription?.end_date)
          : null;

        let allowed_dpp = ele?.subscription?.allowed_dpp
          ? ele?.subscription?.allowed_dpp
          : 0;

        let total_created = product_line_list.reduce((acc, current) => {
          if (current._awareid === ele.aware_id) {
            let length = current.product_line?.length || 0;
            acc += length;
          }
          return acc;
        }, 0);

        let find = product_line_list.filter((e) => e._awareid == ele.aware_id);

        

        let created = product_line_list.reduce((acc, current) => {
          let date = current?.created_date
            ? new Date(current.created_date)
            : new Date();

          if (
            current._awareid == ele.aware_id &&
            startDate &&
            endDate &&
            startDate <= date &&
            endDate >= date
          ) {
            let length = current?.product_line?.length || 0;
            acc += length;
          }

          return acc;
        }, 0);

        let remaining = allowed_dpp - created;

        let custom_date =
          startDate && endDate
            ? `${moment(startDate).format("DD/MM/YYYY")}-${moment(
                endDate
              ).format("DD/MM/YYYY")}`
            : "N/A";
        return {
          companyname: ele?.company_name,
          allowed_dpp,
          custom_date,
          total_created,
          remaining,
          created,
         
        };
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
              data: filtered_data,
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

  getParticularSubscriptionDetail: async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).jsonp(errors.array());
    } else {
      if (
        (!req.headers.username ||
          !req.headers.authorization ||
          !req.headers.aware_id,
        !req.headers.customdate)
      ) {
        return res
          .status(400)
          .jsonp({ status: false, message: "Bad request!" });
      }

      var final_brand_kyc_Details = await kyc_details
        .findOne({ aware_id: req.headers.aware_id })
        .catch((ex) => {
          loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
          return res
            .status(500)
            .jsonp({ status: false, message: "Internal error!" });
        });

      var purchase_order_list = await purchase_orders
        .find({
          _awareid: req.headers.aware_id,
          hide: { $ne: true },
          deleted: false,
        })
        .catch((ex) => {
          loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
          return res
            .status(500)
            .jsonp({ status: false, message: "Internal error!" });
        });

      let ids = [...new Set(purchase_order_list.map((ele) => ele._id))];

      var purchase_order_detail_list = await purchase_order_details
        .find({ po_id: { $in: ids }, deleted: false })
        .catch((ex) => {
          loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
          return res
            .status(500)
            .jsonp({ status: false, message: "Internal error!" });
        });

      let aware_ids = [
        ...new Set(
          purchase_order_detail_list.map((ele) => ele.producer_aware_id)
        ),
      ];

      var kycDetails = await kyc_details
        .find({ aware_id: { $in: aware_ids } })
        .catch((ex) => {
          loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
          return res
            .status(500)
            .jsonp({ status: false, message: "Internal error!" });
        });

      var product_line_list = await product_lines
        .find({ po_id: { $in: ids }, deleted: false })
        .catch((ex) => {
          loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
          return res
            .status(500)
            .jsonp({ status: false, message: "Internal error!" });
        });

      const startDate = final_brand_kyc_Details?.subscription?.start_date
        ? new Date(final_brand_kyc_Details.subscription.start_date)
        : null;
      const endDate = final_brand_kyc_Details?.subscription?.end_date
        ? new Date(final_brand_kyc_Details.subscription.end_date)
        : null;
      let allowed_dpp = final_brand_kyc_Details?.subscription?.allowed_dpp
        ? final_brand_kyc_Details?.subscription?.allowed_dpp
        : 0;
      let allowed_quantity = final_brand_kyc_Details?.subscription
        ?.allowed_quantity
        ? final_brand_kyc_Details?.subscription?.allowed_quantity
        : 0;
      let custom_date =
        startDate && endDate
          ? `${moment(startDate).format("D MMM YYYY")}-${moment(endDate).format(
              "D MMM YYYY"
            )}`
          : "N/A";


      const pi_chart_data = {
        FILLED: 0,
        DONE: 0,
        SELECT: 0,
        APPROVED: 0,
        CONCEPT: 0,
        SEND: 0,
      };
      let customDate = req.headers.customdate || moment().format("DD/MM/YYYY");
      let NextsevenDaysStart = moment(customDate, "DD/MM/YYYY")
        .startOf("day")
        .toDate();
      let NextsevenDaysEnd = moment(customDate, "DD/MM/YYYY")
        .add(7, "days")
        .endOf("day")
        .toDate();
      let LastDaysStart = moment("01/01/2022", "DD/MM/YYYY")
        .startOf("day")
        .toDate();
      let LastDaysEnd = moment(customDate, "DD/MM/YYYY")
        .subtract(1, "days")
        .endOf("day")
        .toDate();
      let purchase_order_ETD_list = await purchase_orders.aggregate([
        {
          $match: {
            _awareid: req.headers.aware_id,
            status: { $eq: "SEND" },
            hide: { $ne: true },
          },
        },
        { $addFields: { po_id: { $toString: "$_id" } } },
        {
          $lookup: {
            from: "purchase_order_details",
            localField: "po_id",
            foreignField: "po_id",
            as: "details_avaliable",
          },
        },
        {
          $addFields: {
            details_avaliable: { $arrayElemAt: ["$details_avaliable", 0] },
          },
        },
        {
          $set: {
            producer: "$details_avaliable.producer",
            order_number: "$details_avaliable.order_number",
            brand: "$details_avaliable.brand",
            etd: "$details_avaliable.etd",
            producer_aware_id: "$details_avaliable.producer_aware_id",
          },
        },
        {
          $project: {
            _id: 0,
            producer: 1,
            order_number: 1,
            producer_aware_id: 1,
            brand: 1,
            etd: 1,
          },
        },
      ]);

      const filtered_data = kycDetails.map((ele) => {
        const object = {
          company_name: ele.company_name,
          afterSevenDayExpireEtd: {
            status: false,
            start: NextsevenDaysStart,
            end: NextsevenDaysEnd,
          },
          yesterdayExpiredEtd: {
            status: false,
            start: LastDaysStart,
            end: LastDaysEnd,
          },
          FILLED: 0,
          DONE: 0,
          SELECT: 0,
          APPROVED: 0,
          CONCEPT: 0,
          SEND: 0,
        };

        purchase_order_ETD_list?.forEach(async (item) => {
          if (item.producer_aware_id == ele.aware_id) {
            let etd_date = new Date(item.etd);
            // console.log({ item, etd_date })
            if (
              NextsevenDaysStart <= etd_date &&
              etd_date <= NextsevenDaysEnd
            ) {
              object.afterSevenDayExpireEtd.status = true;
              // console.log(1, { item })
            } else if (LastDaysStart <= etd_date && etd_date <= LastDaysEnd) {
              object.yesterdayExpiredEtd.status = true;
              // console.log(2, { item })
            }
          }
        });

        purchase_order_detail_list.forEach((e) => {
          if (
            e.producer_aware_id === ele.aware_id &&
            e.producer_aware_id === ele.aware_id
          ) {
            const temp_product_lines_avaliable = product_line_list.find(
              (element) => element.po_id === e.po_id
            );

            // console.log({ temp_product_lines_avaliable })
            const date = temp_product_lines_avaliable?.created_date
              ? new Date(temp_product_lines_avaliable.created_date)
              : new Date();

            if (startDate && endDate && startDate <= date && endDate >= date) {
              temp_product_lines_avaliable?.product_line.forEach((line) => {
                if (object.hasOwnProperty(line.update_status)) {
                  // console.log('ghghgh',line.update_status)
                  object[line.update_status] += 1;
                  pi_chart_data[line.update_status] += 1;
                } else if (line.update_status == "Rejected") {
                  object["CONCEPT"] += 1;
                  pi_chart_data["CONCEPT"] += 1;
                }
              });
            }
          }
        });
        return object;
      });


      let created = product_line_list.reduce((acc, current) => {
        let date = current?.created_date
          ? new Date(current.created_date)
          : new Date();

        if (startDate && endDate && startDate <= date && endDate >= date) {
          let length = current?.product_line?.length || 0;
          acc += length;
        }

        return acc;
      }, 0);

      

      const created_quantity = product_line_list.reduce((acc, current) => {
        let date = current?.created_date
          ? new Date(current.created_date)
          : new Date();

        if (startDate && endDate && startDate <= date && endDate >= date) {
          // accumulate the quantity from each product in the product_line array
          const lineQuantity = Array.isArray(current.product_line)
            ? current.product_line.reduce(
                (subAcc, prod) => subAcc + (prod.quantity || 0),
                0
              )
            : current.product_line?.quantity || 0;
          acc += lineQuantity;
        }

        return acc;
      }, 0);

      let total_dpp_created = product_line_list.reduce((acc, current) => {
        let length = current?.product_line?.length || 0;
        acc += length;
        return acc;
      }, 0);

     

      const total_quantity_created = product_line_list.reduce(
        (acc, current) => {
          const lineQuantity = Array.isArray(current.product_line)
            ? current.product_line.reduce(
                (subAcc, product) => subAcc + (product.quantity || 0),
                0
              )
            : current.product_line?.quantity || 0;
          return acc + lineQuantity;
        },
        0
      );

      let remaining = allowed_dpp - created;
      let remaining_quantity = allowed_quantity - created_quantity;

      let subscription_object = {
        custom_date,
        remaining,
        created,
        allowed_dpp,
        startDate,
        endDate,
        total_dpp_created,
        remaining_quantity,
        created_quantity,
        allowed_quantity,
        total_quantity_created,
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
              data: {
                subscription_object,
                filtered_data,
                pi_chart_data,
                purchase_order_detail_list,
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
};

module.exports = {
  handlers,
};
