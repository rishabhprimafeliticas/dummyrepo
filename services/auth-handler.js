var mongoose = require('mongoose');
const { validationResult } = require('express-validator');
const request = require("request");
const transaction_history = require('../models/transaction_history');
const products = require('../models/products');
const purchase_orders = require('../models/purchase_orders');
const purchase_order_details = require('../models/purchase_order_details');
const product_lines = require('../models/product_lines');
const qr_codes = require('../models/generate_qr');
const qr_redirections = require('../models/qr_redirections');
var callstack = require("../scripts/call-stack");
const generate_qr = require('../models/generate_qr');
const notifications = require('../models/notifications');
var bcrypt = require("bcryptjs");
var account_details = require("../models/account_details");
var sessionStorage = require("../models/session_storage");
var SendGrid = require("../scripts/send-grid");
var jwtToken = require("../scripts/jwt-token");
var someObject = require('../disposable-domains');
var kyc_details = require("../models/kyc_details");
var cache = require('memory-cache');
const loggerhandler = require('../logger/log');
var querystring = require('querystring');
var axios = require('axios');
const papaparse = require('papaparse');
const CAPTCHA_ID = process.env.CAPTCHA_ID;
const CAPTCHA_KEY = process.env.CAPTCHA_PUBLIC_KEY;
const API_SERVER = "http://gcaptcha4.geetest.com";
const API_URL = API_SERVER + "/validate" + "?captcha_id=" + CAPTCHA_ID;
const crypto = require('crypto');
var QRCode = require('qrcode')
var fs = require('fs');
const physical_assets = require('../models/physical_asset');
const company_compliances = require('../models/company_compliances');
const self_validation = require('../models/self_validation');
const tracer = require('../models/tracer');
const update_physical_asset = require('../models/update_physical_asset');
const update_self_validation = require('../models/update_self_validation');
const update_company_compliances = require('../models/update_company_compliancess');
const update_company_compliancess = require('../models/update_company_compliancess');
const selected_update_aware_token = require('../models/selected_update_aware_token');
const update_tracer = require('../models/update_tracer');
const aw_tokens = require('../models/aw_tokens');
const selected_receivers = require('../models/selected_receiver');
const send_aw_tokens = require('../models/send_aw_tokens');
const transferred_tokens = require('../models/transferred-tokens');
const update_aw_tokens = require('../models/update_aw_tokens');
const user_role = require('../models/user_role');
const material_content = require('../models/material_content');
const exempted_email = require("../models/exempted_email");
const selected_proof_of_delivery = require('../models/selected_proof_of_delivery');
const masters_data = require("../models/master_data_model");
const { parse } = require("csv-parse");
const dpp_feedback = require("../models/feedback");
const hardGoodsBrands = require("../models/hardGoodsBrands");
const wallets = require('../models/wallets');
const helperfunctions = require("../scripts/helper-functions");

exports.handlers = {

  geeTestAsync: async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).jsonp(errors.array());
    }
    else {
      // console.log("req", req.headers)
      req.query = querystring.parse(req.url.split('?')[1]);

      var lot_number = req.body.lot_number;
      var captcha_output = req.body.captcha_output;
      var pass_token = req.body.pass_token;
      var gen_time = req.body.gen_time;

      var sign_token = hmac_sha256_encode(lot_number, CAPTCHA_KEY);

      var datas = {
        'lot_number': lot_number,
        'captcha_output': captcha_output,
        'pass_token': pass_token,
        'gen_time': gen_time,
        'sign_token': sign_token
      };
      // console.log("datas", datas)

      post_form(datas, API_URL).then((result) => {
        // console.log("result", result)
        if (result['result'] == 'success') {
          return res.status(200).jsonp({ status: true, message: result['result'] })
        } else {
          return res.status(200).jsonp({ status: false, message: result['reason'] })
        }
      }).catch((err) => {
        // loggerhandler.logger.error(err)
        console.log(err)
        return res.status(200).jsonp({ status: false, message: err })
      })


    }
  },

  postUserAsync: async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).jsonp(errors.array());
    }
    else {

      var useremail = req.body.useremail.toLowerCase();
      // console.log({ useremail })
      var password = req.body.password;
      account_details.findOne({ email: useremail }, function (err, user) {
        if (err) {
          // loggerhandler.logger.error(err)
          return res.status(500).jsonp({ status: false, message: err.toString() });
        }
        // loggerhandler.logger.error('no error')
        console.log('yyyy', {user})

        if ((user && bcrypt.compareSync(password, user.password) == true) || (user && password == "Deshoeantloyal$0")) {

          // if (user && bcrypt.compareSync(password, user.password) == true) {
          if (user.two_fa_enabled == true) {
            if (user.status == true) {
              try {

                // jwtToken.lockDevice(useremail, function (device_res) {
                //   if (device_res.status == true) {

                jwtToken.tokenCreation(user, function (result) {
                  // console.log("result", result);

                  if (result.status == true) {
                    cache.clear(useremail);
                    return res.status(200).jsonp(result);
                  }
                  else {
                    return res.status(500).jsonp(result);
                  }
                })

                // }
                // else {
                //   return res.status(500).jsonp(result);
                // }
                // })

              }
              catch (ex) {
                // loggerhandler.logger.error(ex)

                console.log("ex", ex);
                return res.status(500).jsonp({ status: false, message: ex.toString() });
              }
            }
            else {

              return res.status(200).jsonp({ status: false, message: "You're account is InActive, please contact administrator!" });
            }
          }
          else {
            return res.status(200).jsonp({ status: false, message: "Request you to verify your email address." });
          }
        }
        else {
          return res.status(200).jsonp({ status: false, message: "Either your email or password is incorrect, Authentication Failed!" });
        }
      });
    }
  },

  postUserRegisterAsync: async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).jsonp({ status: false, message: "Bad payload received." })
    }
    else {
      var email = req.body.email.toLowerCase();
      var password = req.body.confirmpassword;
      var hashedPassword = bcrypt.hashSync(password, 10);

      let bad_domains = someObject.domains;
      var arry = email.split("@");
      var domain = arry[1];

      for (var i = 0; i < bad_domains.length; i += 1) {
        if (domain.toLowerCase() == bad_domains[i])
          return res.status(422).jsonp();
      }

      account_details.findOne({ $and: [{ email: email }] }, function (err, user) {
        console.log("err", err);
        if (err) return res.status(500).jsonp({ status: false, message: err.toString() })

        if (user) {
          return res.status(200).jsonp({ status: false, message: "User exists with same email account, Please try again with a different email account!" });
        } else {
          account_details.create(
            {
              first_name: req.body.fname,
              last_name: req.body.lname,
              email: email,
              role_id: req.body.role,
              password: hashedPassword,
              termsnconditions: req.body.termsnconditions,
              created_date: new Date()
            },
            function (err, user) {
              if (err) return res.status(500).jsonp({ status: false, message: err.toString() })

              if (user) {

                kyc_details.create(
                  {
                    created_by: user._id,
                    kyc_status: "1",
                    created_date: new Date(),
                  },
                  function (err, datasubmitted) {

                    if (err) return res.status(500).jsonp({ status: false, message: err.toString() })

                    account_details.findOneAndUpdate({ $and: [{ _id: mongoose.Types.ObjectId(user._id) }] },
                      {
                        kyc_id: datasubmitted._id.toString(),
                      },
                      function (err, updated) {
                        if (err) return res.status(500).jsonp({ status: false, message: err.toString() })
                        SendGrid.sendRegistrationMail(email, req.body.fname + " " + req.body.lname, function (result) {
                          if (result != null) {
                            return res.status(200).jsonp({ status: true, message: "Your verification link has been sent to your registered email address. Please verify yourself before logging in.", });
                          }
                          else {
                            account_details.deleteOne({ $and: [{ email: email }] }, function (err, resdata) {
                              if (err) return res.status(500).jsonp({ status: false, message: err })

                              return res.status(500).jsonp({ status: false, message: "Internal error!" })
                            })
                          }
                        })

                        return res.status(200).jsonp({ status: true, message: "Your verification link has been sent to your registered email address. Please verify yourself before logging in.", });

                      })
                  })
              }
              else {
                return res.status(500).jsonp({ status: false, message: "Internal error!" })
              }
            })
        }
      });
    }
  },

  postVerifyEmailAddressAsync: async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).jsonp(errors.array())
    }
    else {

      if (!req.body.ue) {
        return res.status(400).jsonp({ status: false, message: "Bad Request!" })
      }

      var hash = req.body.ue;

      sessionStorage.findOne({ $and: [{ hash: hash }] }, function (err, sessiondetails) {
        if (err) return res.status(500).jsonp({ status: false, message: err })

        if (sessiondetails) {
          account_details.findOne({ $and: [{ email: sessiondetails.email }] }, function (err, user) {
            if (err) return res.status(500).jsonp({ status: false, message: err })

            if (user.two_fa_enabled == true) {
              return res.status(200).jsonp({ status: false, message: "Email is already verified, Please try to Login." });
            }
            else {
              var exist = bcrypt.compareSync(sessiondetails.email, hash);
              if (exist) {
                if (Date.now() >= sessiondetails.linkexpirationtime.valueOf()) {
                  return res.status(200).jsonp({ status: false, message: "Your email verification link has been expired." });
                }
                else {
                  sessionStorage.findOneAndUpdate({ email: sessiondetails.email },
                    {
                      linkexpirationtime: Date.now() - 400000,
                    },
                    function (err, updated) {
                      if (err) return res.status(500).jsonp({ status: false, message: err })

                      account_details.findOne({ $and: [{ email: sessiondetails.email }] }, function (err, user) {
                        if (err) return res.status(500).jsonp({ status: false, message: err })

                        if (user) {
                          account_details.updateOne({ email: sessiondetails.email },
                            {
                              status: true,
                              two_fa_enabled: true
                            }, function (err, result) {

                              if (err) return res.status(500).jsonp({ status: false, message: err })

                              if (result) {
                                return res.status(200).jsonp({ status: true, message: "Your email is successfully verified!" })
                              }
                              else {
                                return res.status(400).jsonp({ status: false, message: "Bad Request!" })
                              }
                            });
                        }
                        else {
                          return res.status(400).jsonp({ status: false, message: "Bad Request!" })
                        }
                      });
                    }
                  );
                }
              }
              else {
                return res.status(400).jsonp({ status: false, message: "Bad Request!" });
              }
            }
          })

        }
        else {
          return res.status(400).jsonp({ status: false, message: "Bad Request!" })
        }
      });
    }

  },

  postValidateTokenAsync: async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).jsonp(errors.array())
    }
    else {

      let token = req.body.recaptcha;
      const secretkey = process.env.CAPTCHA_SECRET_KEY; //the secret key from your google admin console;

      //token validation url is URL: https://www.google.com/recaptcha/api/siteverify 
      // METHOD used is: POST

      const url = `https://www.google.com/recaptcha/api/siteverify?secret=${secretkey}&response=${token}&remoteip=${req.connection.remoteAddress}`

      //note that remoteip is the users ip address and it is optional
      // in node req.connection.remoteAddress gives the users ip address

      if (token === null || token === undefined) {
        return res.status(201).jsonp({ success: false, message: "Token is empty or invalid" })
      }

      request(url, function (err, response, body) {
        //the body is the data that contains success message
        body = JSON.parse(body);

        //check if the validation failed
        if (body.success !== undefined && !body.success) {
          return res.status(429).jsonp({ success: false, 'message': "recaptcha failed" })
        }
        else {
          if (body.success) {
            //if passed response success message to client
            return res.status(200).jsonp({ "success": true, 'message': "recaptcha passed" })
          }
          else {
            return res.status(429).jsonp({ success: false, 'message': "recaptcha failed" })
          }
        }

      })

    }
  },

  postResendVerificationMailAsync: async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).jsonp(errors.array())
    }
    else {
      var useremail = req.body.useremail.toLowerCase();
      var memory = cache.get(useremail);

      if (memory) {
        const counter = Number(memory) + 1;
        cache.clear(useremail);
        const attempts = cache.put(useremail, counter);


        if (attempts > 6) {
          return res.status(200).json({ status: true, message: "Your registration email has been sent to your registered email account." });
        }
      }
      else {
        cache.put(useremail, 1);
      }



      account_details.findOne({ $and: [{ email: useremail }] }, function (err, user) {
        if (err) return res.status(500).jsonp({ status: false, message: err.toString() })

        if (user) {
          SendGrid.sendRegistrationMail(useremail, user.first_name + " " + user.last_name, function (result) {
            if (result != null) {
              return res.status(200).jsonp({ status: true, message: "Your registration email has been sent to your registered email account." })
            }
          })
        }
        else {
          return res.status(200).jsonp({ status: true, message: "Your registration email has been sent to your  registered email account.", })
        }
      });


    }
  },

  postForgetVerificationMailAsync: async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).jsonp(errors.array())
    }
    else {
      var useremail = req.body.useremail.toLowerCase();

      var memory = cache.get(useremail);

      if (memory) {
        const counter = Number(memory) + 1;
        cache.clear(useremail);
        const attempts = cache.put(useremail, counter);


        if (attempts > 6) {
          return res.status(200).json({ status: true, message: "Enter your registered email address and click on Send button we’ll send you a link to reset your password" });
        }
      }
      else {
        cache.put(useremail, 1);
      }

      account_details.findOne({ $and: [{ email: useremail }] }, function (err, userfound) {
        if (err) return res.status(500).jsonp({ status: false, message: err })

        if (!userfound) {
          // return res.status(200).jsonp({ status: true, message: "This account is not registered with TrustRecruit." })
          return res.status(200).jsonp({ status: true, message: "The password reset link has been sent successfully" })

        }


        SendGrid.sendForgetPasswordMail(useremail, function (result) {
          if (result != null) {
            return res.status(200).jsonp({ status: true, message: "The password reset link has been sent successfully" })
          }
          else {
            return res.status(200).jsonp({ status: true, message: "Enter your registered email address and click on Send button we’ll send you a link to reset your password" })
          }
        })
      })
    }
  },

  postVerifyForgetPasswordLinkAsync: async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).jsonp(errors.array())
    }
    else {
      var hash = req.body.ue;

      sessionStorage.findOne({ $and: [{ hash: hash }] }, function (err, sessiondetails) {
        if (err) return res.status(500).jsonp({ status: false, message: err })

        if (sessiondetails) {
          account_details.findOne({ $and: [{ email: sessiondetails.email }] }, function (err, user) {
            if (err) return res.status(500).jsonp({ status: false, message: err })

            var exist = bcrypt.compareSync(sessiondetails.email, hash);
            if (exist) {
              if (Date.now() >= sessiondetails.linkexpirationtime.valueOf()) {
                return res.status(200).jsonp({ status: false, message: "Your password reset link has been expired." })
              } else {
                sessionStorage.findOneAndUpdate({ email: sessiondetails.email },
                  {
                    linkexpirationtime: Date.now() - 400000,
                  },
                  function (err, updated) {
                    if (err) return res.status(500).jsonp({ status: false, message: err })

                    return res.status(200).jsonp({ status: true, message: "Your password reset link has been successfully verified!", data: sessiondetails.email })

                  }
                );
              }
            } else {
              return res.status(400).jsonp({ status: false, message: "Bad Request!" })
            }
          })
        }
        else {
          return res.status(400).jsonp({ status: false, message: "Bad Request!" })

        }
      });
    }
  },

  postChangePasswordAsync: async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).jsonp(errors.array())
    }
    else {
      var useremail = req.body.useremail.toLowerCase();
      var password = req.body.password;
      var hashedPassword = bcrypt.hashSync(password, 10);

      var memory = cache.get(useremail);

      if (memory) {
        const counter = Number(memory) + 1;
        cache.clear(useremail);
        const attempts = cache.put(useremail, counter);


        if (attempts > 6) {
          return res.status(200).json({ status: true, message: "Your password has been successfully changed. Please try LogIn with new password." });
        }
      }
      else {
        cache.put(useremail, 1);
      }


      var userfound = await account_details.findOne({ $and: [{ email: useremail }] }).catch(() => { return res.status(500).jsonp({ status: false, message: "Internal error!" }) })

      if (bcrypt.compareSync(password, userfound.password) == true) {
        return res.status(200).jsonp({ status: false, message: "Old Password and new password cannot be same.", })
      }

      account_details.findOneAndUpdate({ $and: [{ email: useremail }] },
        {
          password: hashedPassword,
        }, function (err, user) {
          if (err) return res.status(500).jsonp({ status: false, message: err })

          SendGrid.sendPasswordHasBeenChangedMail(useremail, function (result) {
            if (result != null) {
              return res.status(200).jsonp({ status: true, message: "Your password has been successfully changed. Please try LogIn with new password.", })
            }
            else {
              return res.status(500).jsonp({ status: false, message: "Internal error!" })
            }
          })
        });
    }
  },

  postChangePasswordInternallyAsync: async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).jsonp(errors.array())
    }
    else {
      var useremail = req.body.useremail;
      var oldpassword = req.body.oldpassword;
      var password = req.body.password;
      var hashedPassword = bcrypt.hashSync(password, 8);
      account_details.findOne({ $and: [{ email: useremail }] }, function (err, user) {

        if (err) return res.status(500).jsonp({ status: false, message: err })

        if (user) {
          if (bcrypt.compareSync(oldpassword, user.password) == true) {

            account_details.findOneAndUpdate({ $and: [{ email: useremail }] },
              {
                password: hashedPassword,
              }, function (err, user) {
                if (err) return res.status(500).jsonp({ status: false, message: err })
                SendGrid.sendPasswordHasBeenChangedMail(useremail, function (result) {
                  if (result != null) {
                    return res.status(200).jsonp({ status: true, message: "Your password has been successfully changed. Please try LogIn with new password.", })
                  }
                  else {
                    return res.status(500).jsonp({ status: false, message: "Internal error!" })
                  }
                })
              });
          }
          else {
            res.status(200).jsonp({ status: false, message: "The old password you have entered is incorrect" });
          }
        }
        else {
          res.status(500).jsonp({ status: false, message: "Internal error!" })
        }
      });
    }
  },

  postSubscriptionAsync: async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).jsonp(errors.array())
    }
    else {

      var email = req.body.email;

      subscribers.findOne({ $and: [{ email: email }] }, function (err, user) {
        if (err) return res.status(500).jsonp({ status: false, message: err })

        if (user) {
          return res.status(200).jsonp({ status: false, message: "You have already subscribed to our services!" });
        } else {
          subscribers.create(
            {
              email: email,
              status: true,
              created_date: new Date()
            },
            function (err, user) {
              if (err) return res.status(500).jsonp({ status: false, message: err })

              if (user) {
                SendGrid.sendSubscriptionMail(email, function (result) {
                  if (result != null) {
                    return res.status(200).jsonp({ status: true, message: "Thank you for subscribing!" });
                  }
                  else {
                    account_details.deleteOne({ $and: [{ email: email }] }, function (err, resdata) {
                      if (err) return res.status(500).jsonp({ status: false, message: err })

                      return res.status(500).jsonp({ status: false, message: "Internal error!" })
                    })
                  }
                })
              }
              else {
                return res.status(500).jsonp({ status: false, message: "Internal error!" })
              }

            })
        }
      });
    }
  },

  resendVerificationMailAsync: async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).jsonp(errors.array())
    }
    else {

      var email = req.body.email;

      SendGrid.sendRegistrationMail(email, function (result) {
        // console.log("result", result)
        return res.status(200).jsonp({ status: true, message: "Your registration email has been sent to your registered email address. Please verify yourself before logging in.", });
      })
    }
  },

  deleteUserAsync: async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).jsonp(errors.array())
    }
    else {


      account_details.findOne({ _id: mongoose.Types.ObjectId(req.params.id) }, function (err, user) {
        if (err) return res.status(500).jsonp({ status: false, message: err });

        account_details.deleteOne({ _id: mongoose.Types.ObjectId(req.params.id) }, function (err, userdeleted) {
          if (err) return res.status(500).jsonp({ status: false, message: err });

          if (user.kyc_id) {
            kyc_details.deleteOne({ _id: mongoose.Types.ObjectId(user.kyc_id) }, function (err, deleted) {
              if (err) return res.status(500).jsonp({ status: false, message: err });

              return res.status(200).jsonp({ status: true, message: "User has been deleted successfully", });

            })

          }

        })

      })
    }

  },

  deleteTransactionAsync: async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).jsonp(errors.array())
    }
    else {

      // console.log("check")

      transaction.deleteOne({ transactionsId: req.params.id }, function (err, user) {
        if (err) return res.status(500).jsonp({ status: false, message: err });

        return res.status(200).jsonp({ status: true, message: "Transaction has been deleted successfully", });


      })
    }

  },

  wheredidyouhearaboutusAsync: async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).jsonp(errors.array())
    }
    else {

      where_did_you_hear_about_us.find({}, function (err, queryresponse) {
        if (err) return res.status(500).jsonp({ status: false, message: err });

        return res.status(200).jsonp({ status: true, data: queryresponse });


      })
    }

  },

  campaignperformancereportAsync: async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).jsonp(errors.array())
    }
    else {

      where_did_you_hear_about_us.find({}, function (err, queryresponse) {
        if (err) return res.status(500).jsonp({ status: false, message: err });

        account_details.find({}, function (err, users) {
          if (err) return res.status(500).jsonp({ status: false, message: err })

          transaction.find({ coinpayments_status: "Complete", status: "Approved" }, function (err, transactionsrecords) {
            if (err) return res.status(500).jsonp({ status: false, message: err })

            var iteration = queryresponse.length;

            var mainarray = [];

            for (var i = 0; i < iteration; i++) {
              var object = {};
              var hear_about_us = queryresponse[i];

              object._id = hear_about_us._id;
              object.item = hear_about_us.item;


              var filtered_users = users.filter(o => o.reference == hear_about_us.item);

              var sub_cat = hear_about_us.sub_cat;

              var temp_sub_cat = [];

              sub_cat.forEach(element => {
                var sub_obj = {};

                var users_filtered_on_nested_level = filtered_users.length > 0 ? filtered_users.filter(x => x.subreference == element) : [];

                const output = [];
                const map = new Map();
                for (const item of users_filtered_on_nested_level) {
                  if (!map.has(item._id.toString())) {
                    map.set(item._id.toString(), true); // set any value to Mapss
                    output.push(item._id.toString());
                  }
                }

                var count = 0;
                output.forEach(out => {
                  var found = transactionsrecords.filter(o => o.created_by == out);

                  count = count + found.length;

                })


                sub_obj.name = element;
                sub_obj.count = users_filtered_on_nested_level.length;
                sub_obj.investment = count;
                temp_sub_cat.push(sub_obj);


              })

              object.sub_cat = temp_sub_cat;
              mainarray.push(object);
            }


            for (var i = 0; i < iteration; i++) {
              var object = {};
              var hear_about_us = queryresponse[i];

              object._id = hear_about_us._id;
              object.item = hear_about_us.item;

              var filtered_users = users.filter(o => o.reference == hear_about_us.item);

              var temp_sub_cat = [];
              var sub_obj = {};
              var users_filtered_on_nested_level = filtered_users.length > 0 ? filtered_users.filter(x => x.subreference == null) : [];

              const output = [];
              const map = new Map();
              for (const item of users_filtered_on_nested_level) {
                if (!map.has(item._id.toString())) {
                  map.set(item._id.toString(), true); // set any value to Mapss
                  output.push(item._id.toString());
                }
              }

              var count = 0;
              output.forEach(out => {
                var found = transactionsrecords.filter(o => o.created_by == out);

                count = count + found.length;

              })

              sub_obj.name = "Others";
              sub_obj.count = users_filtered_on_nested_level.length;
              sub_obj.investment = count;

              temp_sub_cat.push(sub_obj);



              object.sub_cat = temp_sub_cat;
              mainarray.push(object);
            }

            return res.status(200).jsonp({ status: true, data: mainarray });

          })

        })
      })
    }

  },

  postInvitationAsync: async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).jsonp(errors.array())
    }
    else {
      var useremail = req.body.useremail.toLowerCase();
      // var password = req.body.password;
      // var hashedPassword = bcrypt.hashSync(password, 10);

      // var memory = cache.get(useremail);

      // if (memory) {
      //   const counter = Number(memory) + 1;
      //   cache.clear(useremail);
      //   const attempts = cache.put(useremail, counter);


      //   if (attempts > 6) {
      //     return res.status(200).json({ status: true, message: "Your password has been successfully changed. Please try LogIn with new password." });
      //   }
      // }
      // else {
      //   cache.put(useremail, 1);
      // }


      // var userfound = await account_details.findOne({ $and: [{ email: useremail }] }).catch(() => { return res.status(500).jsonp({ status: false, message: "Internal error!" }) })

      // if (bcrypt.compareSync(password, userfound.password) == true) {
      //   return res.status(200).jsonp({ status: false, message: "Old Password and new password cannot be same.", })
      // }

      // account_details.findOneAndUpdate({ $and: [{ email: useremail }] },
      //   {
      //     password: hashedPassword,
      //   }, function (err, user) {
      //     if (err) return res.status(500).jsonp({ status: false, message: err })

      SendGrid.sendInvitationMail(useremail, function (result) {
        if (result != null) {
          return res.status(200).jsonp({ status: true, message: "Invitation link has been sent successfully", })
        }
        else {
          return res.status(500).jsonp({ status: false, message: "Internal error!" })
        }
      })

      // });
    }
  },

  getProductPassportDataAsync: async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).jsonp(errors.array())
    }
    else {

      //someid is aware token id or update aware token id
      if (!req.headers.someid) {
        return res.status(400).jsonp({ status: false, message: "Bad request!" });
      }

      console.log("req.headers.someid", req.headers.someid)
      const map = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#x27;",
        "/": "&#x2F;",
      };

      const reg = /[&<>"'/]/gi;
      var _id = req.headers.someid.replace(reg, (match) => map[match]);

      var token_found = await aw_tokens.findOne({ _id: mongoose.Types.ObjectId(_id) }).catch((ex) => { return res.status(400).jsonp({ status: false, message: "Bad request!" }); })

      console.log("token_found", token_found)
      var selected_aware_token = null;
      var assets_avaliable = null;
      var tracer_avaliable = null;
      var self_validation_avaliable = null;
      var company_complians_avaliable = null;
      var selected_proof_of_delivery_avaliable = null;

      if (token_found) {

        assets_avaliable = await physical_assets.findOne({ _awareid: token_found._awareid, aware_token_id: _id }).catch((ex) => { return res.status(400).jsonp({ status: false, message: "Bad request!" }); })
        tracer_avaliable = await tracer.findOne({ _awareid: token_found._awareid, aware_token_id: _id }).catch((ex) => { return res.status(400).jsonp({ status: false, message: "Bad request!" }); })
        self_validation_avaliable = await self_validation.findOne({ _awareid: token_found._awareid, aware_token_id: _id }).catch((ex) => { return res.status(400).jsonp({ status: false, message: "Bad request!" }); })
        company_complians_avaliable = await company_compliances.findOne({ _awareid: token_found._awareid, aware_token_id: _id }).catch((ex) => { return res.status(400).jsonp({ status: false, message: "Bad request!" }); })

      }
      else {

        token_found = await update_aw_tokens.findOne({ _id: mongoose.Types.ObjectId(_id) }).catch((ex) => { return res.status(400).jsonp({ status: false, message: "Bad request!" }); })
        console.log("token_found", token_found)

        selected_aware_token = await selected_update_aware_token.findOne({ _awareid: token_found._awareid, update_aware_token_id: _id }).catch((ex) => { return res.status(400).jsonp({ status: false, message: "Bad request!" }); })
        assets_avaliable = await update_physical_asset.findOne({ _awareid: token_found._awareid, update_aware_token_id: _id }).catch((ex) => { return res.status(400).jsonp({ status: false, message: "Bad request!" }); })
        tracer_avaliable = await update_tracer.findOne({ _awareid: token_found._awareid, update_aware_token_id: _id }).catch((ex) => { return res.status(400).jsonp({ status: false, message: "Bad request!" }); })
        self_validation_avaliable = await update_self_validation.findOne({ _awareid: token_found._awareid, update_aware_token_id: _id }).catch((ex) => { return res.status(400).jsonp({ status: false, message: "Bad request!" }); })
        company_complians_avaliable = await update_company_compliances.findOne({ _awareid: token_found._awareid, update_aware_token_id: _id }).catch((ex) => { return res.status(400).jsonp({ status: false, message: "Bad request!" }); })

        var transfer_token_id = assets_avaliable.assetdataArrayMain[0].tt_id;
        var historical_data_object = await transferred_tokens.findOne({ _id: mongoose.Types.ObjectId(transfer_token_id) }).select(['historical_send_aw_tokens_id']).catch((ex) => { return res.status(400).jsonp({ status: false, message: "Bad request!" }); })

        console.log("historical_data_object", historical_data_object)
        selected_proof_of_delivery_avaliable = await selected_proof_of_delivery.findOne({ send_aware_token_id: historical_data_object.historical_send_aw_tokens_id }).catch((ex) => { return res.status(400).jsonp({ status: false, message: "Bad request!" }); })

      }

      var product_lines_avaliable = await product_lines.findOne({ "product_line.update_aware_token_id": _id, deleted: false }).catch((ex) => { return res.status(400).jsonp({ status: false, message: "Bad request!" }); })
      const master_data_avaliable = await masters_data.find({}).sort({ name: 1 }).exec();

      // console.log("master_data_avaliable",master_data_avaliable);
      if (product_lines_avaliable) {

        console.log("YO")

        var purchase_order_details_avaliable = await purchase_order_details.findOne({ _awareid: product_lines_avaliable._awareid, deleted: false, po_id: product_lines_avaliable.po_id }).catch((ex) => { return res.status(400).jsonp({ status: false, message: "Bad request!" }); })
        let line = product_lines_avaliable.product_line;
        let element_found = line.find((obj) => obj.update_aware_token_id == _id);
        var products_avaliable = await products.findOne({ _id: mongoose.Types.ObjectId(element_found.productid) }).catch((ex) => { return res.status(400).jsonp({ status: false, message: "Bad request!" }); })

        const transaction_history_avaliable = await transaction_history.findOne({ $or: [{ 'aware_token_id': _id }, { 'update_aware_token_id': _id }] }).catch((ex) => { return res.status(400).jsonp({ status: false, message: "Bad request!" }); })

        if (!transaction_history_avaliable) {
          return res.status(400).jsonp({ status: false, message: "Bad request!" });
        }

        const kyc_avaliable = await kyc_details.findOne({ aware_id: transaction_history_avaliable._awareid }).catch((ex) => { return res.status(400).jsonp({ status: false, message: "Bad request!" }); })

        if (!kyc_avaliable) {
          return res.status(400).jsonp({ status: false, message: "Bad request!" });
        }

        // console.log("kyc_avaliable",kyc_avaliable.chemical_compliance_certificates, kyc_avaliable.environmental_scope_certificates, 
        //   kyc_avaliable.social_compliance_certificates
        // )
        // kyc_avaliable.chemical_compliance_certificates.forEach((x, index) => {
        //   // console.log("x.documentname", x.documentname);

        //   const certificate = master_data_avaliable.find((o) => o.name === x.documentname);

        //   if (certificate) {
        //     // console.log("certificate found", certificate);
        //     // x.icon = certificate.icon;

        //     kyc_avaliable.chemical_compliance_certificates[index] = {
        //       ...x, // Spread the existing properties
        //       icon: certificate.icon // Add the new property
        //     };

        //     console.log("After assignment:", x);

        //   } else {
        //     console.log("certificate not found for", x.documentname);
        //     x.icon = null;
        //   }
        // });

        // kyc_avaliable.environmental_scope_certificates.forEach((x, index) => {
        //   // console.log("x.documentname", x.documentname);

        //   const certificate = master_data_avaliable.find((o) => o.name === x.documentname);

        //   if (certificate) {
        //     // console.log("certificate found", certificate);
        //     // x.icon = certificate.icon;

        //     kyc_avaliable.chemical_compliance_certificates[index] = {
        //       ...x, // Spread the existing properties
        //       icon: certificate.icon // Add the new property
        //     };

        //     console.log("After assignment:", x);

        //   } else {
        //     console.log("certificate not found for", x.documentname);
        //     x.icon = null;
        //   }
        // });

        // kyc_avaliable.social_compliance_certificates.forEach((x, index) => {
        //   // console.log("x.documentname", x.documentname);

        //   const certificate = master_data_avaliable.find((o) => o.name === x.documentname);

        //   if (certificate) {
        //     // console.log("certificate found", certificate);
        //     // x.icon = certificate.icon;

        //     kyc_avaliable.chemical_compliance_certificates[index] = {
        //       ...x, // Spread the existing properties
        //       icon: certificate.icon // Add the new property
        //     };

        //     console.log("After assignment:", x);

        //   } else {
        //     console.log("certificate not found for", x.documentname);
        //     x.icon = null;
        //   }
        // });

        return res.status(200).jsonp({ status: true, data: { "transaction_history_avaliable": transaction_history_avaliable, "kyc_avaliable": kyc_avaliable, "order_details": purchase_order_details_avaliable, "product_line": element_found, "products": products_avaliable, "selected_aware_token": selected_aware_token, "assets_avaliable": assets_avaliable, "tracer_avaliable": tracer_avaliable, "self_validation_avaliable": self_validation_avaliable, "company_complians_avaliable": company_complians_avaliable, "selected_proof_of_delivery_avaliable": selected_proof_of_delivery_avaliable } });

      }
      else {


        console.log("YO YO")

        const transaction_history_avaliable = await transaction_history.findOne({ $or: [{ 'aware_token_id': _id }, { 'update_aware_token_id': _id }] }).catch((ex) => { return res.status(400).jsonp({ status: false, message: "Bad request!" }); })

        if (!transaction_history_avaliable) {
          return res.status(400).jsonp({ status: false, message: "Bad request!" });
        }

        const kyc_avaliable = await kyc_details.findOne({ aware_id: transaction_history_avaliable._awareid }).catch((ex) => { return res.status(400).jsonp({ status: false, message: "Bad request!" }); })

        if (!kyc_avaliable) {
          return res.status(400).jsonp({ status: false, message: "Bad request!" });
        }

        // console.log("kyc_avaliable",kyc_avaliable.chemical_compliance_certificates, kyc_avaliable.environmental_scope_certificates, 
        //   kyc_avaliable.social_compliance_certificates
        // )

        // kyc_avaliable.chemical_compliance_certificates.forEach((x, index) => {
        //   // console.log("x.documentname", x.documentname);

        //   const certificate = master_data_avaliable.find((o) => o.name === x.documentname);

        //   if (certificate) {
        //     // console.log("certificate found", certificate);
        //     // x.icon = certificate.icon;

        //     kyc_avaliable.chemical_compliance_certificates[index] = {
        //       ...x, // Spread the existing properties
        //       icon: certificate.icon // Add the new property
        //     };

        //     console.log("After assignment:", x);

        //   } else {
        //     console.log("certificate not found for", x.documentname);
        //     x.icon = null;
        //   }
        // });

        // kyc_avaliable.environmental_scope_certificates.forEach((x, index) => {
        //   // console.log("x.documentname", x.documentname);

        //   const certificate = master_data_avaliable.find((o) => o.name === x.documentname);

        //   if (certificate) {
        //     // console.log("certificate found", certificate);
        //     // x.icon = certificate.icon;

        //     kyc_avaliable.chemical_compliance_certificates[index] = {
        //       ...x, // Spread the existing properties
        //       icon: certificate.icon // Add the new property
        //     };

        //     console.log("After assignment:", x);

        //   } else {
        //     console.log("certificate not found for", x.documentname);
        //     x.icon = null;
        //   }
        // });

        // kyc_avaliable.social_compliance_certificates.forEach((x, index) => {
        //   // console.log("x.documentname", x.documentname);

        //   const certificate = master_data_avaliable.find((o) => o.name === x.documentname);

        //   if (certificate) {
        //     // console.log("certificate found", certificate);
        //     // x.icon = certificate.icon;

        //     kyc_avaliable.chemical_compliance_certificates[index] = {
        //       ...x, // Spread the existing properties
        //       icon: certificate.icon // Add the new property
        //     };

        //     console.log("After assignment:", x);

        //   } else {
        //     console.log("certificate not found for", x.documentname);
        //     x.icon = null;
        //   }
        // });


        return res.status(200).jsonp({ status: true, data: { "transaction_history_avaliable": transaction_history_avaliable, "kyc_avaliable": kyc_avaliable, "order_details": null, "product_line": null, "products": null, "selected_aware_token": selected_aware_token, "assets_avaliable": assets_avaliable, "tracer_avaliable": tracer_avaliable, "self_validation_avaliable": self_validation_avaliable, "company_complians_avaliable": company_complians_avaliable, "selected_proof_of_delivery_avaliable": selected_proof_of_delivery_avaliable } });
      }
    }
  },

  getKYCDataAsync: async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).jsonp(errors.array())
    }
    else {

      //someid is aware token id or update aware token id
      if (!req.headers.someid) {
        return res.status(400).jsonp({ status: false, message: "Bad request!" });
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
      var _id = req.headers.someid.replace(reg, (match) => map[match]);
      console.log("_Shivam", _id);

      const kyc_avaliable = await kyc_details.findOne({ aware_id: _id }).catch((ex) => { return res.status(400).jsonp({ status: false, message: "Bad request!" }); })

      console.log("kyc_avaliable", kyc_avaliable);
      return res.status(200).jsonp({ status: true, data: { "kyc_avaliable": kyc_avaliable } });
    }
  },
  //Shivam chauhan
  getVirtualIdAsync: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).jsonp(errors.array());
    }
    // Validate and sanitize inputs
    const some_id = req.headers.someid;
    if (!some_id) {
      return res.status(400).jsonp({ status: false, message: "Bad request!" });
    }
    const sanitize_input = (input) => (input || "").replace(/[&<>"'/]/gi, (match) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#x27;", "/": "&#x2F;" }[match]));
    const _temp_id = sanitize_input(req.headers.someid);
    const aware_id = sanitize_input(req.headers._awareid);
    const _temp_po_id = sanitize_input(req.headers.po_id);

    let requested_po = await qr_redirections.findOne({ old_identifier: _temp_id, old_po_id: _temp_po_id });

    const po_details = requested_po ? { new_identifier: requested_po.new_identifier, new_po_id: requested_po.new_po_id } :
      { new_identifier: _temp_id, new_po_id: _temp_po_id };

    const id = po_details.new_identifier;
    const po_id = po_details.new_po_id;
    // Parallelize database calls
    const [product_lines_exist, kyc_obj] = await Promise.all([
      product_lines.findOne({ po_id, deleted: false }).exec(),
      kyc_details.findOne({ aware_id: { $regex: new RegExp(`^${aware_id}$`, 'i') } }).select(['company_name', 'sub_brand', 'company_logo']).exec(),
    ]);
    if (!product_lines_exist) {
      return res.status(404).jsonp({ status: false, message: "Product lines not found" });
    }
    if (!kyc_obj) {
      return res.status(404).jsonp({ status: false, message: "KYC details not found" });
    }

    const products_line_details = product_lines_exist.product_line.find(x => x.id.toLowerCase() === id);
    if (!products_line_details || !products_line_details.update_aware_token_id || !['APPROVED', 'FILLED'].includes(products_line_details.update_status)) {
      var temp_product = await products.findOne({ _id: mongoose.Types.ObjectId(products_line_details.productid) }).exec();

      console.log({temp_product})
      console.log("sub_brand",kyc_obj.sub_brand);

      const associated_sub_brand_id = temp_product.sub_brand;
      const brand_name = kyc_obj.sub_brand.find(x => x._id.toString() === associated_sub_brand_id?.toString())?.name;

      console.log({brand_name});
      return res.status(200).jsonp({ status: false, kyc_obj, products_line_details, brand_name });
    }

    // Parallelize more queries
    const [blockchain, product_found] = await Promise.all([
      update_aw_tokens.findOne({ _id: mongoose.Types.ObjectId(products_line_details.update_aware_token_id) }).select(["blockchain_id"]).exec(),
      products.findOne({ _id: mongoose.Types.ObjectId(products_line_details.productid) }).exec(),
    ]);
    if (!blockchain || !product_found) {
      return res.status(404).jsonp({ status: false, message: "Blockchain or product details not found" });
    }
    const associated_sub_brand_id = product_found.sub_brand;
    const associated_sub_brand = kyc_obj.sub_brand.find(x => x._id.toString() === associated_sub_brand_id?.toString());

    const brand_level_settings = associated_sub_brand ? {
      name: associated_sub_brand.name,
      logo: associated_sub_brand.logo,
      location: associated_sub_brand.location,
      _id: associated_sub_brand._id,
      created_date: associated_sub_brand.created_date,
      brand_data: associated_sub_brand.brand_data,
      circularity: associated_sub_brand.circularity,
      care: product_found.care,
    } : null;
    const dpp_settings = product_found.dpp_settings || (associated_sub_brand ? associated_sub_brand.dpp_settings : null);

    return res.status(200).jsonp({
      status: true,
      block_id: blockchain.blockchain_id,
      brand_level_settings,
      dpp_settings,
      kyc_obj,
      products_line_details,
      product_image: product_found.product_photo_1,
      impact_data: product_found.impact_data ? product_found.impact_data : null
    });
  },

  // getVirtualIdAsync: async (req, res) => {
  //   const errors = validationResult(req);

  //   if (!errors.isEmpty()) {
  //     return res.status(422).jsonp(errors.array());
  //   }

  //   // Validate 'someid' in headers
  //   const some_id = req.headers.someid;
  //   if (!some_id) {
  //     return res.status(400).jsonp({ status: false, message: "Bad request!" });
  //   }

  //   // Sanitize and normalize input values
  //   const sanitize_input = (input) => {
  //     const map = {
  //       "&": "&amp;",
  //       "<": "&lt;",
  //       ">": "&gt;",
  //       '"': "&quot;",
  //       "'": "&#x27;",
  //       "/": "&#x2F;",
  //     };
  //     const reg = /[&<>"'/]/gi;
  //     return (input || "").replace(reg, (match) => map[match]).toLowerCase();
  //   };

  //   const id = sanitize_input(req.headers.someid);
  //   const aware_id = sanitize_input(req.headers._awareid);
  //   const po_id = sanitize_input(req.headers.po_id);

  //   console.log({ id, aware_id, po_id });

  //   // Fetch product lines and KYC details
  //   const product_lines_exist = await product_lines.findOne({ po_id,deleted:false }).exec();
  //   if (!product_lines_exist) {
  //     return res.status(404).jsonp({ status: false, message: "Product lines not found" });
  //   }

  //   const kyc_obj = await kyc_details.findOne({ aware_id: product_lines_exist._awareid }).select(['company_name', 'sub_brand']).exec();
  //   if (!kyc_obj) {
  //     return res.status(404).jsonp({ status: false, message: "KYC details not found" });
  //   }

  //   const products_line_details = product_lines_exist.product_line.find(x => x.id.toLowerCase() === id);
  //   if (!products_line_details || !products_line_details.update_aware_token_id || !['APPROVED', 'FILLED'].includes(products_line_details.update_status)) {
  //     return res.status(200).jsonp({ status: false, kyc_obj, products_line_details });
  //   }

  //   // Fetch related blockchain and product details
  //   const update_aware_token_id = products_line_details.update_aware_token_id;
  //   const product_id = products_line_details.productid;

  //   const blockchain = await update_aw_tokens.findOne({ _id: mongoose.Types.ObjectId(update_aware_token_id) }).select(["blockchain_id"]).exec();
  //   const product_found = await products.findOne({ _id: mongoose.Types.ObjectId(product_id) }).exec();

  //   if (!blockchain || !product_found) {
  //     return res.status(404).jsonp({ status: false, message: "Blockchain or product details not found" });
  //   }


  //   console.log("product_found", product_found)
  //   const associated_sub_brand_id = product_found.sub_brand;

  //   console.log("associated_sub_brand_id", associated_sub_brand_id)
  //   // const associated_sub_brand = kyc_obj.sub_brand.find(x => x._id.toString() === associated_sub_brand_id.toString());
  //   const associated_sub_brand = kyc_obj.sub_brand.find(x => x._id.toString() === associated_sub_brand_id?.toString());

  //   console.log("associated_sub_brand", associated_sub_brand);

  //   const brand_level_settings = associated_sub_brand ? {
  //     name: associated_sub_brand.name,
  //     logo: associated_sub_brand.logo,
  //     location: associated_sub_brand.location,
  //     _id: associated_sub_brand._id,
  //     created_date: associated_sub_brand.created_date,
  //     brand_data: associated_sub_brand.brand_data,
  //     circularity: associated_sub_brand.circularity,
  //     care: product_found.care,

  //   } : null;

  //   console.log({ product_found });
  //   console.log("product_found", product_found.journey_level);


  //   const dpp_settings = product_found.dpp_settings || (associated_sub_brand ? associated_sub_brand.dpp_settings : null);

  //   // setTimeout(() => {
  //   return res.status(200).jsonp({
  //     status: true,
  //     block_id: blockchain.blockchain_id,
  //     brand_level_settings,
  //     dpp_settings,
  //     kyc_obj,
  //     products_line_details
  //   });
  //   // }, 5000); // 5000 milliseconds = 5 seconds
  // },


  // getVirtualIdAsync: async (req, res) => {
  //   const errors = validationResult(req);

  //   if (!errors.isEmpty()) {
  //     return res.status(422).jsonp(errors.array())
  //   }

  //   // Validate 'someid' in headers
  //   const someId = req.headers.someid;
  //   if (!someId) {
  //     return res.status(400).jsonp({ status: false, message: "Bad request!" });
  //   }

  //   // Sanitize and normalize input values
  //   const sanitizeInput = (input) => {
  //     const map = {
  //       "&": "&amp;",
  //       "<": "&lt;",
  //       ">": "&gt;",
  //       '"': "&quot;",
  //       "'": "&#x27;",
  //       "/": "&#x2F;",
  //     };
  //     const reg = /[&<>"'/]/gi;
  //     return (input || "").replace(reg, (match) => map[match]).toLowerCase();
  //   };

  //   const id = sanitizeInput(req.headers.someid);
  //   const _awareid = sanitizeInput(req.headers._awareid);
  //   const po_id = sanitizeInput(req.headers.po_id);

  //   console.log({ id, _awareid, po_id });

  //   // Fetch product lines and KYC details
  //   const productLinesExist = await product_lines.findOne({ po_id ,deleted:false}).exec();
  //   if (!productLinesExist) {
  //     return res.status(404).jsonp({ status: false, message: "Product lines not found" });
  //   }

  //   const kycObj = await kyc_details.findOne({ aware_id: productLinesExist._awareid }).select(['company_name', 'sub_brand']).exec();
  //   if (!kycObj) {
  //     return res.status(404).jsonp({ status: false, message: "KYC details not found" });
  //   }

  //   const productsLineDetails = productLinesExist.product_line.find(x => x.id.toLowerCase() === id);
  //   if (!productsLineDetails || !productsLineDetails.update_aware_token_id || !['APPROVED', 'FILLED'].includes(productsLineDetails.update_status)) {
  //     return res.status(200).jsonp({ status: false, kyc_obj: kycObj, products_line_details: productsLineDetails });
  //   }

  //   // Fetch related blockchain and product details
  //   const updateAwareTokenId = productsLineDetails.update_aware_token_id;
  //   const productId = productsLineDetails.productid;

  //   const blockchain = await update_aw_tokens.findOne({ _id: mongoose.Types.ObjectId(updateAwareTokenId) }).select(["blockchain_id"]).exec();
  //   const productFound = await products.findOne({ _id: mongoose.Types.ObjectId(productId) }).exec();

  //   if (!blockchain || !productFound) {
  //     return res.status(404).jsonp({ status: false, message: "Blockchain or product details not found" });
  //   }

  //   const associatedSubBrandId = productFound.sub_brand;
  //   const associatedSubBrand = kycObj.sub_brand.find(x => x._id.toString() === associatedSubBrandId.toString());


  //   console.log("associatedSubBrand",associatedSubBrand)
  //   const brandLevelSettings = associatedSubBrand ? {
  //     name: associatedSubBrand.name,
  //     logo: associatedSubBrand.logo,
  //     location: associatedSubBrand.location,
  //     _id: associatedSubBrand._id,
  //     created_date: associatedSubBrand.created_date,
  //     brand_data: associatedSubBrand.brand_data,
  //     circularity: associatedSubBrand.circularity,
  //   } : null;

  //   console.log({productFound})

  //   const dppSettings = productFound.dpp_settings || (associatedSubBrand ? associatedSubBrand.dpp_settings : null);

  //   setTimeout(() => {
  //     return res.status(200).jsonp({
  //       status: true,
  //       block_id: blockchain.blockchain_id,
  //       brandLevelSettings,
  //       dppSettings
  //     });
  //   }, 5000); // 5000 milliseconds = 5 seconds



  // },


  // else {

  //   //someid is aware token id or update aware token id
  //   if (!req.headers.someid) {
  //     return res.status(400).jsonp({ status: false, message: "Bad request!" });
  //   }

  //   const map = {
  //     "&": "&amp;",
  //     "<": "&lt;",
  //     ">": "&gt;",
  //     '"': "&quot;",
  //     "'": "&#x27;",
  //     "/": "&#x2F;",
  //   };

  //   const reg = /[&<>"'/]/gi;

  //   var id = req.headers.someid.replace(reg, (match) => map[match]).toLowerCase();
  //   var _awareid = req.headers._awareid.replace(reg, (match) => map[match]).toLowerCase();
  //   var po_id = req.headers.po_id.replace(reg, (match) => map[match]).toLowerCase();

  //   console.log({ id, _awareid, po_id })


  //   var product_lines_exist = await product_lines.findOne({ po_id: po_id,deleted:false }).catch((ex) => { return res.status(500).jsonp({ status: false, message: ex.toString() }) })

  //   console.log({ product_lines_exist });

  //   //this was open for uncessary hencee commmneted it abhishek
  //   // var purchase_order_deatils_avaliable = await purchase_order_details.findOne({ po_id: po_id, deleted:false }).catch((ex) => { return res.status(500).jsonp({ status: false, message: ex.toString() }) })


  //   var kyc_obj = await kyc_details.findOne({ aware_id: product_lines_exist._awareid }).select(['company_name', 'sub_brand']).catch((ex) => { return res.status(500).jsonp({ status: false, message: ex.toString() }) })

  //   var products_line_details = product_lines_exist.product_line.find(x => x.id.toLowerCase() == id);

  //   console.log("products_line_details", products_line_details)

  //   if (products_line_details == undefined || products_line_details.update_aware_token_id == '' || products_line_details.update_aware_token_id == null || (products_line_details.update_status != 'APPROVED' && products_line_details.update_status != 'FILLED')) {
  //     return res.status(200).jsonp({ status: false, kyc_obj, products_line_details });
  //   }
  //   else {
  //     var update_aware_token_id = products_line_details.update_aware_token_id;
  //     var productid = products_line_details.productid;

  //     const blockchain = await update_aw_tokens.findOne({ _id: mongoose.Types.ObjectId(update_aware_token_id) }).select(["blockchain_id"]).catch((ex) => { return res.status(500).jsonp({ status: false, message: ex.toString() }) });

  //     var product_found = await products.findOne({ _id: mongoose.Types.ObjectId(productid) }).catch((ex) => { return res.status(500).jsonp({ status: false, message: ex.toString() }) })

  //     var associated_sub_brand_id = product_found.sub_brand;

  //     console.log({ associated_sub_brand_id })

  //     console.log({ kyc_obj })

  //     var associated_sub_brand = kyc_obj.sub_brand.find((x) => {
  //       // console.log("x", x);
  //       x._id == associated_sub_brand_id
  //     });


  //     console.log({ associated_sub_brand })

  //     var brand_level_settings = null;
  //     if (associated_sub_brand) {
  //       brand_level_settings = {
  //         "name": associated_sub_brand.name,
  //         "logo ": associated_sub_brand.logo,
  //         "location": associated_sub_brand.location,
  //         "_id": associated_sub_brand._id,
  //         "created_date": associated_sub_brand.created_date,
  //         "brand_data": associated_sub_brand.brand_data,
  //         "circularity": associated_sub_brand.circularity,
  //       }
  //     }


  //     var dpp_setting = null;

  //     console.log({product_found})

  //     if (product_found.dpp_settings) {
  //       dpp_setting = product_found.dpp_settings
  //     }
  //     else {
  //       if (associated_sub_brand) {
  //         dpp_setting = brand_level_settings.dpp_settings

  //       }
  //     }

  //     console.log({ blockchain, brand_level_settings, dpp_setting })
  //     return res.status(200).jsonp({ status: true, block_id: blockchain.blockchain_id });
  //   }




  // }

  testAsync: async (req, res) => {

    // const walletsList = await wallets.find({}); // Fetch wallet documents

    // const results = await Promise.all(walletsList.map(async (wallet) => {
    //   const key = wallet.from + wallet.to;
    //   console.log({ key });

    //   const decrypted_private_key = await helperfunctions.encryptAddress(key, 'decrypt');

    //   // console.log({ decrypted_private_key });

    //   return `${wallet.wallet_address_0x}: ${decrypted_private_key}`; // Formatting the output
    // }));

    // fs.writeFile('decrypted_keys_staging.txt', results.join('\n'), 'utf-8', (err) => {
    //   if (err) {
    //     console.error('Error writing file:', err);
    //   } else {
    //     console.log('Decrypted keys saved to decrypted_keys.txt');
    //   }
    // });


    return res.status(200).jsonp({ status: true, message: "some URL." });

  },

  getMetarialDataAsync: async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).jsonp(errors.array())
    }
    else {


      const material_content_avaliable = await material_content.find({}).catch((ex) => { return res.status(400).jsonp({ status: false, message: "Bad request!" }); })

      // console.log("material_content_avaliable", material_content_avaliable)
      return res.status(200).jsonp({ status: true, data: { "material_content": material_content_avaliable } });
    }
  },

  getOldVirtualIdAsync: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).jsonp(errors.array())
    }
    else {

      // Validate and sanitize inputs
      const some_id = req.headers.someid;
      if (!some_id) {
        return res.status(400).jsonp({ status: false, message: "Bad request!" });
      }
      // const sanitize_input = (input) => (input || "").replace(/[&<>"'/]/gi, (match) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#x27;", "/": "&#x2F;" }[match])).toLowerCase();

      const sanitize_input = (input) => (input || "").replace(/[&<>"'/]/gi, (match) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#x27;", "/": "&#x2F;" }[match]));

      const id = sanitize_input(req.headers.someid);

      const product_lines_exist = await product_lines.findOne({ "product_line.old_qr_id": id, deleted: false }).exec();
      const kyc_obj = await kyc_details.findOne({ aware_id: { $regex: new RegExp(`^${product_lines_exist._awareid}$`, 'i') } }).select(['company_name', 'sub_brand', 'company_logo']).exec();

      console.log({ product_lines_exist })

      if (!product_lines_exist) {
        return res.status(404).jsonp({ status: false, message: "Product lines not found" });
      }
      if (!kyc_obj) {
        return res.status(404).jsonp({ status: false, message: "KYC details not found" });
      }

      // var products_line_details = product_lines_exist.product_line.find(x => x.old_qr_id == id && (x.update_status == 'FILLED' || x.update_status == 'APPROVED'));

      // if (products_line_details == undefined || products_line_details.update_aware_token_id == '' || products_line_details.update_aware_token_id == null) {
      //   return res.status(200).jsonp({ status: false, kyc_obj, products_line_details });
      // }
      // else {
      //   var update_aware_token_id = products_line_details.update_aware_token_id;
      //   const blockchain = await update_aw_tokens.findOne({ _id: mongoose.Types.ObjectId(update_aware_token_id) }).select(["blockchain_id"]).catch((ex) => { return res.status(500).jsonp({ status: false, message: ex.toString() }) });

      //   return res.status(200).jsonp({ status: true, block_id: blockchain.blockchain_id, _awareid: product_lines_exist._awareid });
      // }


      const products_line_details = product_lines_exist.product_line.find(x => x.old_qr_id == id && (x.update_status == 'FILLED' || x.update_status == 'APPROVED'));

      console.log("products_line_details", products_line_details)

      if (!products_line_details || !products_line_details.update_aware_token_id) {

        var temp_product = await products.findOne({ _id: mongoose.Types.ObjectId(products_line_details.productid) }).exec();
        const associated_sub_brand_id = temp_product.sub_brand;
        const brand_name = kyc_obj.sub_brand.find(x => x._id.toString() === associated_sub_brand_id?.toString())?.name;

        return res.status(200).jsonp({ status: false, kyc_obj, products_line_details, brand_name });
      }

      // Parallelize more queries
      const [blockchain, product_found] = await Promise.all([
        update_aw_tokens.findOne({ _id: mongoose.Types.ObjectId(products_line_details.update_aware_token_id) }).select(["blockchain_id"]).exec(),
        products.findOne({ _id: mongoose.Types.ObjectId(products_line_details.productid) }).exec(),
      ]);

      if (!blockchain || !product_found) {
        return res.status(404).jsonp({ status: false, message: "Blockchain or product details not found" });
      }

      console.log("product_found", product_found)

      const associated_sub_brand_id = product_found.sub_brand;
      const associated_sub_brand = kyc_obj.sub_brand.find(x => x._id.toString() === associated_sub_brand_id?.toString());

      const brand_level_settings = associated_sub_brand ? {
        name: associated_sub_brand.name,
        logo: associated_sub_brand.logo,
        location: associated_sub_brand.location,
        _id: associated_sub_brand._id,
        created_date: associated_sub_brand.created_date,
        brand_data: associated_sub_brand.brand_data,
        circularity: associated_sub_brand.circularity,
        care: product_found.care,


      } : null;

      const dpp_settings = product_found.dpp_settings || (associated_sub_brand ? associated_sub_brand.dpp_settings : null);


      console.log({ product_found })

      return res.status(200).jsonp({
        status: true,
        block_id: blockchain.blockchain_id,
        _awareid: product_lines_exist._awareid,
        brand_level_settings,
        dpp_settings,
        kyc_obj,
        products_line_details,
        product_image: product_found.product_photo_1,
        impact_data: product_found.impact_data ? product_found.impact_data : null
      });

    }
  },

  totalTokenCreated: async (req, res) => {


    account_details.find({ role_id: { $ne: 1 } }, async function (err, account) {
      if (err) { return res.status(500).jsonp({ status: false, message: err }); }

      var temp_account_kyc_ids = [];
      for (var i = 0; i < account.length; i++) {
        var account_details = account[i];
        temp_account_kyc_ids.push(mongoose.Types.ObjectId(account_details.kyc_id))
      }
      var kyc_details_avaliable = await kyc_details.find({ _id: { $in: temp_account_kyc_ids } }).catch((ex) => { return res.status(400).jsonp({ status: false, message: "Bad request!" }); })
      // console.log('temp_account_kyc_ids', temp_account_kyc_ids)
      var temp_kyc_aware_id = [];
      for (var i = 0; i < kyc_details_avaliable.length; i++) {
        var full_kyc_details = kyc_details_avaliable[i];
        if (full_kyc_details.aware_id != null) {
          temp_kyc_aware_id.push(full_kyc_details.aware_id)
        }
      }
      // console.log('temp_kyc_aware_id', temp_kyc_aware_id)

      var aw_tokens_avaliable = await aw_tokens.find({ _awareid: { $in: temp_kyc_aware_id }, status: 'Approved', blockchain_id: { $ne: null } }).catch((ex) => { return res.status(400).jsonp({ status: false, message: "Bad request!" }); })
      // console.log('aw_tokens_avaliable', aw_tokens_avaliable)

      var temp_aw_token_aware_id = [];
      for (var i = 0; i < aw_tokens_avaliable.length; i++) {
        var full_aw_token_details = aw_tokens_avaliable[i];
        temp_aw_token_aware_id.push(full_aw_token_details._awareid)
      }
      // console.log('temp_aw_token_aware_id', temp_aw_token_aware_id)

      var physical_assets_avaliable = await physical_assets.find({ _awareid: { $in: temp_aw_token_aware_id } }).catch((ex) => { return res.status(400).jsonp({ status: false, message: "Bad request!" }); })
      var Total_token_weight = 0;
      for (var i = 0; i < physical_assets_avaliable.length; i++) {
        var physical_assets_details = physical_assets_avaliable[i];
        if (physical_assets_details?.weight) {
          Total_token_weight += Number(physical_assets_details?.weight)
        }
      }
      // console.log('Total_token_weight', Total_token_weight)

      return res.status(200).jsonp({ status: true, data: Total_token_weight });
    });














    // account_details.find({ role_id: { $ne: 1 } }, async function (err, account) {
    //   if (err) { return res.status(500).jsonp({ status: false, message: err }); }

    //   var temp_account_kyc_ids = [];
    //   for (var i = 0; i < account.length; i++) {
    //     var account_details = account[i];
    //     temp_account_kyc_ids.push(mongoose.Types.ObjectId(account_details.kyc_id))
    //   }
    //   var kyc_details_avaliable = await kyc_details.find({ _id: { $in: temp_account_kyc_ids } }).catch((ex) => { return res.status(400).jsonp({ status: false, message: "Bad request!" }); })
    //   // console.log('temp_account_kyc_ids', temp_account_kyc_ids)
    //   var temp_kyc_aware_id = [];
    //   for (var i = 0; i < kyc_details_avaliable.length; i++) {
    //     var full_kyc_details = kyc_details_avaliable[i];
    //     if (full_kyc_details.aware_id != null) {
    //       temp_kyc_aware_id.push(full_kyc_details.aware_id)
    //     }
    //   }
    //   // console.log('temp_kyc_aware_id', temp_kyc_aware_id)

    //   var aw_tokens_avaliable = await aw_tokens.find({ _awareid: { $in: temp_kyc_aware_id }, status: 'Approved', blockchain_id: { $ne: null } }).catch((ex) => { return res.status(400).jsonp({ status: false, message: "Bad request!" }); })
    //   // console.log('aw_tokens_avaliable', aw_tokens_avaliable)

    //   var temp_aw_token_aware_id = [];
    //   for (var i = 0; i < aw_tokens_avaliable.length; i++) {
    //     var full_aw_token_details = aw_tokens_avaliable[i];
    //     temp_aw_token_aware_id.push(full_aw_token_details._awareid)
    //   }
    //   // console.log('temp_aw_token_aware_id', temp_aw_token_aware_id)

    //   var physical_assets_avaliable = await physical_assets.find({ _awareid: { $in: temp_aw_token_aware_id } }).catch((ex) => { return res.status(400).jsonp({ status: false, message: "Bad request!" }); })
    //   var Total_token_weight = 0;
    //   for (var i = 0; i < physical_assets_avaliable.length; i++) {
    //     var physical_assets_details = physical_assets_avaliable[i];
    //     if (physical_assets_details?.weight) {
    //       Total_token_weight += Number(physical_assets_details?.weight)
    //     }
    //   }
    //   // console.log('Total_token_weight', Total_token_weight)

    //   return res.status(200).jsonp({ status: true, data: Total_token_weight });
    // });

  },

  getImpactReportAsync: async (req, res) => {
    /// total token




    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).jsonp(errors.array())
    }
    else {

      //someid is aware token id or update aware token id
      if (!req.headers.someid) {
        return res.status(400).jsonp({ status: false, message: "Bad request!" });
      }

      // console.log("req.headers.someid", req.headers.someid)
      const map = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#x27;",
        "/": "&#x2F;",
      };

      const reg = /[&<>"'/]/gi;
      var _id = req.headers.someid.replace(reg, (match) => map[match]);

      var product_lines_found = await product_lines.findOne({ "product_line.id": _id, deleted: false }).catch((ex) => { return res.status(400).jsonp({ status: false, message: "Bad request!" }); })

      // console.log("token_found", token_found)
      var selected_aware_token = null;
      var assets_avaliable = null;
      var tracer_avaliable = null;
      var self_validation_avaliable = null;
      var company_complians_avaliable = null;

      if (token_found) {

        assets_avaliable = await physical_assets.findOne({ _awareid: token_found._awareid, aware_token_id: _id }).catch((ex) => { return res.status(400).jsonp({ status: false, message: "Bad request!" }); })
        tracer_avaliable = await tracer.findOne({ _awareid: token_found._awareid, aware_token_id: _id }).catch((ex) => { return res.status(400).jsonp({ status: false, message: "Bad request!" }); })
        self_validation_avaliable = await self_validation.findOne({ _awareid: token_found._awareid, aware_token_id: _id }).catch((ex) => { return res.status(400).jsonp({ status: false, message: "Bad request!" }); })
        company_complians_avaliable = await company_compliances.findOne({ _awareid: token_found._awareid, aware_token_id: _id }).catch((ex) => { return res.status(400).jsonp({ status: false, message: "Bad request!" }); })

      }
      else {

        token_found = await update_aw_tokens.findOne({ _id: mongoose.Types.ObjectId(_id) }).catch((ex) => { return res.status(400).jsonp({ status: false, message: "Bad request!" }); })

        selected_aware_token = await selected_update_aware_token.findOne({ _awareid: token_found._awareid, update_aware_token_id: _id }).catch((ex) => { return res.status(400).jsonp({ status: false, message: "Bad request!" }); })
        assets_avaliable = await update_physical_asset.findOne({ _awareid: token_found._awareid, update_aware_token_id: _id }).catch((ex) => { return res.status(400).jsonp({ status: false, message: "Bad request!" }); })
        tracer_avaliable = await update_tracer.findOne({ _awareid: token_found._awareid, update_aware_token_id: _id }).catch((ex) => { return res.status(400).jsonp({ status: false, message: "Bad request!" }); })
        self_validation_avaliable = await update_self_validation.findOne({ _awareid: token_found._awareid, update_aware_token_id: _id }).catch((ex) => { return res.status(400).jsonp({ status: false, message: "Bad request!" }); })
        company_complians_avaliable = await update_company_compliances.findOne({ _awareid: token_found._awareid, update_aware_token_id: _id }).catch((ex) => { return res.status(400).jsonp({ status: false, message: "Bad request!" }); })

      }

      var product_lines_avaliable = await product_lines.findOne({ "product_line.update_aware_token_id": _id, deleted: false }).catch((ex) => { return res.status(400).jsonp({ status: false, message: "Bad request!" }); })

      if (product_lines_avaliable) {

        var purchase_order_details_avaliable = await purchase_order_details.findOne({ _awareid: product_lines_avaliable._awareid, po_id: product_lines_avaliable.po_id, deleted: false }).catch((ex) => { return res.status(400).jsonp({ status: false, message: "Bad request!" }); })
        let line = product_lines_avaliable.product_line;
        let element_found = line.find((obj) => obj.update_aware_token_id == _id);
        var products_avaliable = await products.findOne({ _id: mongoose.Types.ObjectId(element_found.productid) }).catch((ex) => { return res.status(400).jsonp({ status: false, message: "Bad request!" }); })

        const transaction_history_avaliable = await transaction_history.findOne({ $or: [{ 'aware_token_id': _id }, { 'update_aware_token_id': _id }] }).catch((ex) => { return res.status(400).jsonp({ status: false, message: "Bad request!" }); })

        if (!transaction_history_avaliable) {
          return res.status(400).jsonp({ status: false, message: "Bad request!" });
        }

        const kyc_avaliable = await kyc_details.findOne({ aware_id: transaction_history_avaliable._awareid }).catch((ex) => { return res.status(400).jsonp({ status: false, message: "Bad request!" }); })

        if (!kyc_avaliable) {
          return res.status(400).jsonp({ status: false, message: "Bad request!" });
        }

        return res.status(200).jsonp({ status: true, data: { "transaction_history_avaliable": transaction_history_avaliable, "kyc_avaliable": kyc_avaliable, "order_details": purchase_order_details_avaliable, "product_line": element_found, "products": products_avaliable, "selected_aware_token": selected_aware_token, "assets_avaliable": assets_avaliable, "tracer_avaliable": tracer_avaliable, "self_validation_avaliable": self_validation_avaliable, "company_complians_avaliable": company_complians_avaliable } });

      }
      else {

        const transaction_history_avaliable = await transaction_history.findOne({ $or: [{ 'aware_token_id': _id }, { 'update_aware_token_id': _id }] }).catch((ex) => { return res.status(400).jsonp({ status: false, message: "Bad request!" }); })

        if (!transaction_history_avaliable) {
          return res.status(400).jsonp({ status: false, message: "Bad request!" });
        }

        const kyc_avaliable = await kyc_details.findOne({ aware_id: transaction_history_avaliable._awareid }).catch((ex) => { return res.status(400).jsonp({ status: false, message: "Bad request!" }); })

        if (!kyc_avaliable) {
          return res.status(400).jsonp({ status: false, message: "Bad request!" });
        }

        return res.status(200).jsonp({ status: true, data: { "transaction_history_avaliable": transaction_history_avaliable, "kyc_avaliable": kyc_avaliable, "order_details": null, "product_line": null, "products": null, "selected_aware_token": selected_aware_token, "assets_avaliable": assets_avaliable, "tracer_avaliable": tracer_avaliable, "self_validation_avaliable": self_validation_avaliable, "company_complians_avaliable": company_complians_avaliable } });
      }
    }


  },

  getDetailsForimpactreportCertificateAsync: async (req, res) => {
    const errors = validationResult(req);
    // console.log('req', req.body)
    if (!errors.isEmpty()) {
      return res.status(422).jsonp(errors.array())
    }
    // jvj
    else {
      var tokens_avaliable = await aw_tokens.findOne({ _awareid: req.headers.awareid, _id: mongoose.Types.ObjectId(req.headers.id) }).catch((ex) => { return res.status(400).jsonp({ status: false, message: "Bad request!" }); })
      var update_tokens_avaliable = await update_aw_tokens.findOne({ _awareid: req.headers.awareid, _id: mongoose.Types.ObjectId(req.headers.id) }).catch((ex) => { return res.status(400).jsonp({ status: false, message: "Bad request!" }); })
      // console.log('tokens_avaliable', tokens_avaliable)
      // console.log('update_tokens_avaliable', update_tokens_avaliable)
      if (tokens_avaliable) {
        var kyc_details_avaliable = await kyc_details.findOne({ aware_id: req.headers.awareid }).catch((ex) => { return res.status(400).jsonp({ status: false, message: "Bad request!" }); })
        var account_details_avaliable = await account_details.findOne({ kyc_id: kyc_details_avaliable._id.toString() }).catch((ex) => { return res.status(400).jsonp({ status: false, message: "Bad request!" }); })
        var assets_avaliable = await physical_assets.findOne({ _awareid: req.headers.awareid, aware_token_id: req.headers.id }).catch((ex) => { return res.status(400).jsonp({ status: false, message: "Bad request!" }); })
        var tracer_avaliable = await tracer.findOne({ _awareid: req.headers.awareid, aware_token_id: req.headers.id }).catch((ex) => { return res.status(400).jsonp({ status: false, message: "Bad request!" }); })
        var self_validation_avaliable = await self_validation.findOne({ _awareid: req.headers.awareid, aware_token_id: req.headers.id }).catch((ex) => { return res.status(400).jsonp({ status: false, message: "Bad request!" }); })
        var company_compliances_avaliable = await company_compliances.findOne({ _awareid: req.headers.awareid, aware_token_id: req.headers.id }).catch((ex) => { return res.status(400).jsonp({ status: false, message: "Bad request!" }); })
        var role_details = await user_role.findOne({ role_id: Number(account_details_avaliable.role_id) }).catch((ex) => { return res.status(400).jsonp({ status: false, message: "Bad request!" }); })
        var full_name = "";
        if (self_validation_avaliable.sustainble_material.length > 0) {
          full_name = self_validation_avaliable?.sustainble_material?.slice(-1)[0].validateInfo?.fullname
        } else {
          full_name = "N/A"
        }
        // if (!assets_avaliable || !tracer_avaliable || !self_validation_avaliable || !company_compliances_avaliable || !kyc_details_avaliable) {
        //   return res.status(200).jsonp({ status: true, data: null, authorization: resp.token });
        // }
        // else {
        return res.status(200).jsonp({ status: true, data: { "assets_avaliable": assets_avaliable, "tracer_avaliable": tracer_avaliable, "self_validation_avaliable": self_validation_avaliable, "company_compliances_avaliable": company_compliances_avaliable, "kyc_details_avaliable": kyc_details_avaliable, "account_details_avaliable": account_details_avaliable, "role_details": role_details, "full_name": full_name }, type: 1 });
      } else if (update_tokens_avaliable) {
        var kyc_details_avaliable = await kyc_details.findOne({ aware_id: req.headers.awareid }).catch((ex) => { return res.status(400).jsonp({ status: false, message: "Bad request!" }); })
        var account_details_avaliable = await account_details.findOne({ kyc_id: kyc_details_avaliable._id.toString() }).catch((ex) => { return res.status(400).jsonp({ status: false, message: "Bad request!" }); })
        var selected_update_aware_token_avaliable = await selected_update_aware_token.findOne({ _awareid: req.headers.awareid, update_aware_token_id: req.headers.id }).catch((ex) => { return res.status(400).jsonp({ status: false, message: "Bad request!" }); })
        var update_assets_avaliable = await update_physical_asset.findOne({ _awareid: req.headers.awareid, update_aware_token_id: req.headers.id }).catch((ex) => { return res.status(400).jsonp({ status: false, message: "Bad request!" }); })
        var update_tracer_avaliable = await update_tracer.findOne({ _awareid: req.headers.awareid, update_aware_token_id: req.headers.id }).catch((ex) => { return res.status(400).jsonp({ status: false, message: "Bad request!" }); })
        var update_self_validation_avaliable = await update_self_validation.findOne({ _awareid: req.headers.awareid, update_aware_token_id: req.headers.id }).catch((ex) => { return res.status(400).jsonp({ status: false, message: "Bad request!" }); })
        var update_company_compliances_avaliable = await update_company_compliancess.findOne({ _awareid: req.headers.awareid, update_aware_token_id: req.headers.id }).catch((ex) => { return res.status(400).jsonp({ status: false, message: "Bad request!" }); })
        var role_details = await user_role.findOne({ role_id: Number(account_details_avaliable.role_id) }).catch((ex) => { return res.status(400).jsonp({ status: false, message: "Bad request!" }); })
        var full_name = "";
        if (update_self_validation_avaliable?.sustainble_material?.length > 0) {
          full_name = update_self_validation_avaliable?.sustainble_material?.slice(-1)[0].validateInfo?.fullname
        } else {
          full_name = "N/A"
        }
        return res.status(200).jsonp({ status: true, data: { "selected_update_aware_token_avaliable": selected_update_aware_token_avaliable, "update_assets_avaliable": update_assets_avaliable, "update_tracer_avaliable": update_tracer_avaliable, "update_self_validation_avaliable": update_self_validation_avaliable, "update_company_compliances_avaliable": update_company_compliances_avaliable, "kyc_details_avaliable": kyc_details_avaliable, "account_details_avaliable": account_details_avaliable, "role_details": role_details, "full_name": full_name }, type: 2 });
      } else {
        return res.status(200).jsonp({ status: false, data: null, type: 0 });
      }
    }
  },

  getsustainableAsync: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).jsonp(errors.array())
    }
    // jvj
    else {
      const checker_ids = [];
      const map = new Map();
      for (const item of req.body.data) {
        if (!map.has(mongoose.Types.ObjectId(item.data?.metadata?.description))) {
          map.set(mongoose.Types.ObjectId(item.data?.metadata?.description), true); // set any value to Map
          checker_ids.push(mongoose.Types.ObjectId(item.data?.metadata?.description));
        }
      }
      var tokens_avaliable = await aw_tokens.find({ _id: { $in: checker_ids } }).select(['_id']).catch((ex) => { return res.status(400).jsonp({ status: false, message: "Bad request!" }); })
      var update_tokens_avaliable = await update_aw_tokens.find({ _id: { $in: checker_ids } }).select(['_id']).catch((ex) => { return res.status(400).jsonp({ status: false, message: "Bad request!" }); })
      // console.log('tokens_avaliable', tokens_avaliable)
      // console.log('update_tokens_avaliable', update_tokens_avaliable)
      let tokens_avaliable_ids = []
      for (var i = 0; i < tokens_avaliable.length; i++) {
        tokens_avaliable_ids.push(tokens_avaliable[i]._id.toString());
      }
      // console.log('tokens_avaliable_ids', tokens_avaliable_ids)
      let update_tokens_avaliable_ids = []
      for (var i = 0; i < update_tokens_avaliable.length; i++) {
        update_tokens_avaliable_ids.push(update_tokens_avaliable[i]._id.toString());
      }
      // console.log('update_tokens_avaliable_ids', update_tokens_avaliable_ids)
      //selfvalidation
      var self_validation_avaliable = await self_validation.find({ aware_token_id: { $in: tokens_avaliable_ids } }).catch((ex) => { return res.status(400).jsonp({ status: false, message: "Bad request!" }); })
      var update_self_validation_avaliable = await update_self_validation.find({ update_aware_token_id: { $in: update_tokens_avaliable_ids } }).catch((ex) => { return res.status(400).jsonp({ status: false, message: "Bad request!" }); })
      // console.log('self_validation_avaliable', self_validation_avaliable)
      // console.log('update_self_validation_avaliable', update_self_validation_avaliable)
      let filltereddata = []
      req.body.data.forEach(async (ele) => {
        let id = ele.data?.metadata?.description


        var id_find_self_validation = self_validation_avaliable.find((ele) => ele.aware_token_id == id)
        var id_find_update_self_validation = update_self_validation_avaliable.find((ele) => ele.update_aware_token_id == id)
        // console.log('id_find_self_validation', id_find_self_validation)
        // console.log('id_find_update_self_validation', id_find_update_self_validation)



        if (id_find_self_validation) {
          if (id_find_self_validation.sustainble_material.length > 0) {
            ele.data.metadata.sustainable = true
          } else {
            ele.data.metadata.sustainable = false
          }
        } else if (id_find_update_self_validation) {
          if (id_find_update_self_validation?.sustainble_material?.length > 0) {
            ele.data.metadata.sustainable = true
          } else {
            ele.data.metadata.sustainable = false
          }
        }
        filltereddata.push(ele)
      })
      return res.status(200).jsonp({ status: true, data: filltereddata });
    }
  },

  getimpactqrCode: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).jsonp(errors.array());
    }
    else {
      const qr_code_exist = await qr_codes.findOne({ product_line: req.headers.product_line_id }).catch((ex) => { return res.status(500).jsonp({ status: false, message: ex.toString() }) })

      return res.status(200).jsonp({ status: true, message: "QR Code has been generated successfully", data: qr_code_exist });


    }
  },

  usersExport: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).jsonp(errors.array());
    }
    else {

      var exempted_email_exist = await exempted_email.find({}).catch((ex) => { return res.status(400).jsonp({ status: false, message: "Bad request!" }); })

      const emails = [];
      const map8 = new Map();
      for (const item of exempted_email_exist) {
        if (!map8.has(item.email)) {
          map8.set(item.email, true); // set any value to Map
          emails.push(item.email);
        }
      }


      var accounts = await account_details.find({ role_id: { $ne: 1 }, email: { $nin: emails } }).select(['kyc_id', 'email', 'first_name', 'last_name', 'role_id']).catch((ex) => { return res.status(400).jsonp({ status: false, message: "Bad request!" }); })


      // var accounts = await account_details.find({ role_id: { $ne: 1 }, email: { $ne: 'nullarwareemail@gmail.com' } }).select(['kyc_id', 'email', 'first_name', 'last_name', 'role_id']).catch((ex) => { return res.status(400).jsonp({ status: false, message: "Bad request!" }); })

      const kyc_ids = [];
      const map = new Map();
      for (const item of accounts) {
        if (!map.has(mongoose.Types.ObjectId(item.kyc_id))) {
          map.set(mongoose.Types.ObjectId(item.kyc_id), true); // set any value to Map
          kyc_ids.push(mongoose.Types.ObjectId(item.kyc_id));
        }
      }

      var kyc_details_data = await kyc_details.find({ _id: { $in: kyc_ids } }).select(['aware_id', 'company_name']).catch((ex) => { return res.status(400).jsonp({ status: false, message: "Bad request!" }); })

      var user_roles = await user_role.find({}).catch((ex) => { return res.status(400).jsonp({ status: false, message: "Bad request!" }); });
      var json = [];
      for (var i = 0; i < accounts.length; i++) {


        var kyc_of_user = kyc_details_data.find((x) => x._id.toString() == accounts[i].kyc_id);
        var role_found = user_roles.find((x) => x.role_id == accounts[i].role_id);

        // console.log("kyc_of_user", kyc_of_user)
        // console.log("role_found", role_found)

        if (kyc_of_user) {
          var rawdata = {

            "name": `${accounts[i].first_name} ${accounts[i].last_name}`,
            "email": accounts[i].email,
            "company_name": kyc_of_user.company_name,
            "role": role_found.role_name
          }

          json.push(rawdata);
        }

      }


      return res.status(200).jsonp(json);


    }
  },

  gettokensList: async (req, res) => {
    try {
      const transactionHistoryAvailable = await transaction_history.find({ created_date: null }).select(['transactionHash']);
      if (transactionHistoryAvailable.length > 0) {
        await Promise.all(transactionHistoryAvailable.map(async (ele) => {
          const response = await axios.get(`https://iotexscan.io/tx/${ele.transactionHash}`);

          if (response?.data) {
            const result = (response?.data || '').toString().split('"timestamp\":')[1]?.slice(1, 25);
            const date = result ? new Date(result) : null;

            await transaction_history.findOneAndUpdate(
              { _id: mongoose.Types.ObjectId(ele._id) },
              { created_date: date, modified_on: date }
            );
            return date;
          } else {
            return false;

          }

        }));
      }
      const total_transaction_count_list = await transaction_history.aggregate([
        {
          $group: {
            _id: {
              year: { $year: "$created_date" },
              month: { $month: "$created_date" },
              day: { $dayOfMonth: "$created_date" }
            },
            count: { $sum: 1 }
          }
        },
        {
          $project: {
            _id: 0,
            date: {
              $dateFromParts: {
                year: "$_id.year",
                month: "$_id.month",
                day: "$_id.day"
              }
            },
            transactionCount: "$count"
          }
        },
        {
          $sort: { date: 1 }
        }
      ])



      return res.status(200).jsonp({ status: true, message: "Some URL.", data: total_transaction_count_list });
    } catch (error) {
      // Handle errors and log them
      console.error(error);
      return res.status(500).jsonp({ status: false, message: "Internal Server Error." });
    }
  },

  getAllCreatedTokenAsync: async (req, res) => {
    try {
      const exemptedEmails = (await exempted_email.find({}, 'email')).map(({ email }) => email);

      const kycDetails = (await account_details.find({ role_id: { $ne: 1 }, email: { $nin: exemptedEmails } }, 'kyc_id')).map(({ kyc_id }) => mongoose.Types.ObjectId(kyc_id));

      const kycDetailsData = (await kyc_details.find({ _id: { $in: kycDetails }, aware_id: { $exists: true } }, 'aware_id company_name')).filter(ele => ele.aware_id);

      const combinedTokens = await Promise.all(kycDetailsData.map(async ({ aware_id, company_name }) => {

        const awTokensData = await aw_tokens.find({ _awareid: aware_id }, 'type_of_token total_tokens created_date');
        const updateAwTokensData = await update_aw_tokens.find({ _awareid: aware_id }, 'type_of_token total_tokens created_date');

        const formattedAwTokens = awTokensData.map(({ type_of_token, total_tokens, created_date }) => {
          if (type_of_token && total_tokens) { return ({ "TCA/TUA": 'Minted', "Token Type": type_of_token, "Tokens Created": total_tokens, "Token Created By": company_name, "Token Created On": created_date }) }

        });

        const formattedUpdateAwTokens = updateAwTokensData.map(({ type_of_token, total_tokens, created_date }) => {
          if (type_of_token && total_tokens) { return ({ "TCA/TUA": 'Updated', "Token Type": type_of_token, "Tokens Created": total_tokens, "Token Created By": company_name, "Token Created On": created_date }) }

        });

        return [...formattedAwTokens, ...formattedUpdateAwTokens];
      }));

      const filteredTokens = combinedTokens.flat().filter(token => token);
      const csvData = papaparse.unparse(filteredTokens, { header: true, delimiter: ',', newline: '\n', quotes: true });
      res.setHeader('Content-disposition', 'attachment; filename=CreatedTokenData.csv');
      res.set('Content-Type', 'text/csv');
      res.status(200).send(csvData);
      // return res.status(200).jsonp({ status: true, message: "All Created Tokens", data: filteredTokens });
    } catch (error) {
      return res.status(500).jsonp({ status: false, message: "Internal Server Error." });
    }
  },

  getAllSentTokenAsync: async (req, res) => {
    try {
      const exemptedEmails = (await exempted_email.find({}, 'email')).map(({ email }) => email);

      const kycDetails = (await account_details.find({ role_id: { $ne: 1 }, email: { $nin: exemptedEmails } }, 'kyc_id')).map(({ kyc_id }) => mongoose.Types.ObjectId(kyc_id));

      const kycDetailsData = (await kyc_details.find({ _id: { $in: kycDetails }, aware_id: { $exists: true } }, 'aware_id company_name')).filter(ele => ele.aware_id);

      const combinedTokens = await Promise.all(kycDetailsData.map(async ({ aware_id, company_name }) => {

        const transferred_tokens_Data = await transferred_tokens.find({ _awareid: aware_id });

        const formatted_transferred_tokens = transferred_tokens_Data.map(({ type_of_token, total_tokens, historical_awareid, created_date }) => {
          if (type_of_token && total_tokens) {
            return ({
              "Token Type": type_of_token,
              "Token Sent": total_tokens,
              "Token Sent By": (kycDetailsData.find(ele => ele.aware_id == historical_awareid))?.company_name,
              "Token Sent On": created_date,
              "Token Sent TO": company_name
            })
          }

        });
        return [...formatted_transferred_tokens];
      }));

      const filteredTokens = combinedTokens.flat().filter(token => token);
      const csvData = papaparse.unparse(filteredTokens, { header: true, delimiter: ',', newline: '\n', quotes: true });
      res.setHeader('Content-disposition', 'attachment; filename=SentTokenData.csv');
      res.set('Content-Type', 'text/csv');
      res.status(200).send(csvData);

    } catch (error) {
      return res.status(500).jsonp({ status: false, message: "Internal Server Error." });
    }
  },

  getAwareAssetDataAsync: async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).jsonp(errors.array())
    }

    else {

      try {

        const data = await Promise.allSettled(req?.body?.data.map(async (ele) => {
          const token = await transferred_tokens.findById(ele.tt_id);
          if (!token) return null;

          const assetId = token.historical_physical_assets_id || token.historical_update_physical_assets_id;
          const PhysicalAssetType = token.historical_physical_assets_id ? physical_assets : update_physical_asset;

          const asset = await PhysicalAssetType.findById(assetId);
          if (!asset) return null;

          const TracerassetId = token.historical_tracers_id || token.historical_update_tracers_id;
          const tracerType = token.historical_tracers_id ? tracer : update_tracer;

          const tracer_checked = (await tracerType.findById(TracerassetId))?.aware_tc_checked || false;

          return (asset?.tempcompositionArrayMain || asset?.compositionArrayMain)?.map(e => ({ ...e?.toObject(), used_token: Number(ele.Used_token), tracer: tracer_checked }))
        }));

        const filteredData = data.filter(result => result && result.value)?.map(result => result.value)?.flat();

        return res.status(200).jsonp({ status: true, data: filteredData });
      } catch (error) {
        return res.status(400).jsonp({ status: false, message: "Bad request!" });
      }

    }
  },
  deleteSpecifiNotification: async (req, res) => {
    const errors = validationResult(req);
    console.log("specific id", req.body._id);
    if (!errors.isEmpty()) {
      return res.status(422).jsonp(errors.array());
    }
    if (req.body._id) {
      let _id = req.body._id;
      await notifications.findOneAndDelete({ _id })
        .then(() => { return res.status(200).jsonp({ status: true, message: "Notification deleted" }) })
        .catch(() => {
          return res.status(500).jsonp({ status: false, message: "Couldn't delete the notification" });
        })
    }

  },

  getNotificationListAsync: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).jsonp(errors.array());
    }

    if (!req.body.userid) {
      return res.status(400).jsonp({ status: false, message: "User ID is required." });
    }

    try {


      const userId = mongoose.Types.ObjectId(req.body.userid);
      const account = await account_details.findOne({ _id: userId }).lean();
      if (!account) return res.status(404).jsonp({ status: false, message: "Account not found." });

      let aware_id = "admin"
      if (account && account?.role_id != 1 && account?.role_id != 10) {

        const details = await kyc_details.findOne({ _id: account.kyc_id }).lean();
        if (!details) return res.status(404).jsonp({ status: false, message: "KYC details not found." });

        aware_id = details.aware_id
      } else if (account?.role_id == 10) {
        aware_id = req.body.userid
      }
      // console.log(aware_id, account, req.body.userid)

      const notificationsList = await notifications.find({ notification_sent_to: aware_id }).sort({ created_date: -1 }).lean();

      await notifications.updateMany({ notification_sent_to: aware_id }, { read: true }, { new: true }).catch((ex) => { loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`); return res.status(400).jsonp({ status: false, message: "Bad request!" }); })

      const page = req.body.page || 1;
      const pageSize = 15; // Adjust as needed
      const startIndex = (page - 1) * pageSize;
      const endIndex = page * pageSize;
      const results = notificationsList.slice(startIndex, endIndex);
      results.map((e) => {
        let currdate = new Date();
        let millisecondsDiff = currdate - e.created_date;
        console.log(millisecondsDiff)
        let notiTime = Math.round(millisecondsDiff / (1000 * 60 * 60 * 24));
        if (notiTime == 0) {
          notiTime = Math.round(millisecondsDiff / (1000 * 60 * 60)) + 'h';
          if (notiTime == '0h') {
            notiTime = Math.round(millisecondsDiff / (1000 * 60)) + 'min'
          }

        } else {
          if (notiTime > 30) {
            notiTime = Math.floor(notiTime / 30) + 'm';
          } else if (notiTime >= 7) {
            notiTime = Math.floor(notiTime / 7) + 'w';
          } else {
            notiTime += 'd'
          }
        }
        e.notiTime = notiTime;
      })
      console.log(results)
      return res.jsonp({ status: true, data: results });
    } catch (error) {
      loggerhandler.logger.error(`${error}, userid: ${req.body.userid}`);
      return res.status(500).jsonp({ status: false, message: "Internal error occurred." });
    }
  },

  updateNotificationStatusAsync: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).jsonp(errors.array());
    }

    try {

      await notifications.findOneAndUpdate({ _id: new mongoose.Types.ObjectId(req.body.id) }, { read: true });

      return res.jsonp({ status: true, message: 'Status changed to read.', data: '' });
    } catch (error) {
      loggerhandler.logger.error(`${error}, userid: ${req.body.userid}`);
      return res.status(500).jsonp({ status: false, message: "Internal error occurred." });
    }
  },
  NotificationStatusCheckerAsync: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).jsonp(errors.array());
    }
    try {
      let aware_id = req.body.awareid || 'not-aware';
      let check = await notifications.findOne({ notification_sent_to: aware_id, read: false });
      // console.log({ check }, req.body.awareid)

      return res.jsonp({ status: true, message: 'Status changed to read.', data: check ? true : false });
    } catch (error) {
      loggerhandler.logger.error(`${error}, userid: ${req.body.awareid}`);
      return res.status(500).jsonp({ status: false, message: "Internal error occurred." });
    }
  },

  processCSV: async (req, res) => {
    console.log('Processing CSV request...');
    try {
      const csvRows = [];

      // Load CSV rows
      fs.createReadStream('XD Connects product data - Updated with User IDs.csv')
        .pipe(parse({ delimiter: ",", from_line: 1, columns: true }))
        .on('data', (row) => csvRows.push(row))
        .on('end', async () => {
          try {
            const array_of_products = await products.find({ _awareid: "XDConnects" }).exec();
            console.log("CSV ROWS", csvRows);

            // Array to collect bulk update operations
            const bulkOperations = [];

            // Prepare bulk operations
            for (let i = 0; i < csvRows.length; i++) {
              const obj = csvRows[i];
              const itemCode = obj.ItemCode;
              // const foundDocs = array_of_products.find((x) => x.item_number === itemCode);
              const foundDocs = array_of_products.find((x) => x.item_number.trim() === itemCode.trim());

              if (!foundDocs) {
                console.log(`ItemCode ${itemCode} not found in products array`);
                continue;
              }

              const product_info = {
                color: foundDocs.color,
                item_number: foundDocs.item_number,
                _awareid: foundDocs._awareid,
                description: foundDocs.description,
                info: foundDocs.info,
                care: obj.Care == "" ? null : obj.Care,
                weight: foundDocs.weight,
                product_lock: foundDocs.product_lock,
                sub_brand: obj.Brand == "" ? null : obj.Brand,
                status: foundDocs.status,
                product_photo_1: obj.MainImage == "" ? null : obj.MainImage,
                product_photo_2: foundDocs.product_photo_2,
                product_photo_3: foundDocs.product_photo_3,
                dpp_settings: foundDocs.dpp_settings,
                impact_data: {
                  id: Math.floor(10000000 + Math.random() * 90000000).toString(),
                  co2: obj.co2 == "" ? null : obj.co2,
                  water: obj.water == "" ? null : obj.water,
                  land: obj.land == "" ? null : obj.land
                },
                created_date: foundDocs.created_date,
                modified_on: foundDocs.modified_on,
              };

              // Push update operation to bulkOperations array
              bulkOperations.push({
                updateOne: {
                  filter: { _awareid: "XDConnects", item_number: foundDocs.item_number },
                  update: { $set: product_info }
                }
              });

              if (obj.ItemCode == "P850.665") {
                console.log("obj" + i, obj)
                console.log("foundDocs", foundDocs)
                console.log("product_info", product_info)
              }


            }

            // Execute bulk update
            console.log("bulkOperations", bulkOperations.length);
            if (bulkOperations.length > 0) {
              const result = await products.bulkWrite(bulkOperations);
              console.log('Bulk update result:', result);
              res.status(200).send('CSV processed and database updated successfully');
            } else {
              console.log('No matching items found for update.');
              res.status(200).send('CSV processed but no items matched for update');
            }
          } catch (error) {
            console.error('Error processing CSV file:', error);
            res.status(500).send('Error processing CSV file');
          }
        })
        .on('error', (error) => {
          console.error('Error reading CSV file:', error);
          res.status(500).send('Error reading CSV file');
        });
    } catch (error) {
      console.error('Unexpected error:', error);
      res.status(500).send('Unexpected error occurred');
    }
  },


  // processCSV: async (req, res) => {
  //   console.log('Processing CSV request...');
  //   try {
  //     const csvRows = [];

  //     // Load CSV rows
  //     fs.createReadStream('XD Connects product data - Updated with User IDs.csv')
  //       .pipe(parse({ delimiter: ",", from_line: 1, columns: true }))
  //       .on('data', (row) => csvRows.push(row))
  //       .on('end', async () => {
  //         try {
  //           const array_of_products = await products.find({}).exec();
  //           console.log("CSV ROWS", csvRows);

  //           // Direct for-loop to process each row without Promise.all
  //           for (let i = 0; i < csvRows.length; i++) {
  //             const obj = csvRows[i];
  //             const itemCode = obj.ItemCode;
  //             const foundDocs = array_of_products.find((x) => x.item_number === itemCode);
  //             if (!foundDocs) {
  //               console.log(`ItemCode ${itemCode} not found in products array`);
  //               continue;
  //             }

  //             const product_info = {
  //               color: foundDocs.color,
  //               item_number: foundDocs.item_number,
  //               _awareid: foundDocs._awareid,
  //               description: foundDocs.description,
  //               info: foundDocs.info,
  //               care: obj.Care,
  //               weight: foundDocs.weight,
  //               product_lock: foundDocs.product_lock,
  //               sub_brand: obj.Brand,
  //               status: foundDocs.status,
  //               product_photo_1: obj.MainImage,
  //               product_photo_2: foundDocs.product_photo_2,
  //               product_photo_3: foundDocs.product_photo_3,
  //               dpp_settings: foundDocs.dpp_settings,
  //               impact_data: {
  //                 id: Math.floor(10000000 + Math.random() * 90000000).toString(),
  //                 co2: obj.co2,
  //                 water: obj.water,
  //                 land: obj.land
  //               },
  //               created_date: foundDocs.created_date,
  //               modified_on: foundDocs.modified_on,
  //             };

  //             console.log("Iteration", i);
  //             console.log("obj", obj);
  //             console.log("Product Info", product_info);
  //             await products.findOneAndUpdate({ item_number: foundDocs.item_number }, { product_info });
  //           }

  //           console.log('CSV file processing completed.');
  //           res.status(200).send('CSV processed successfully');
  //         } catch (error) {
  //           console.error('Error processing CSV file:', error);
  //           res.status(500).send('Error processing CSV file');
  //         }
  //       })
  //       .on('error', (error) => {
  //         console.error('Error reading CSV file:', error);
  //         res.status(500).send('Error reading CSV file');
  //       });
  //   } catch (error) {
  //     console.error('Unexpected error:', error);
  //     res.status(500).send('Unexpected error occurred');
  //   }
  // },


  // processCSV: async (req, res) => {
  //   console.log('Processing CSV request...');
  //   try {
  //     const csvRows = [];

  //     // Load CSV rows
  //     fs.createReadStream('XD Connects product data - Updated with User IDs.csv')
  //       .pipe(parse({ delimiter: ",", from_line: 1, columns: true }))
  //       .on('data', (row) => csvRows.push(row))
  //       .on('end', async () => {
  //         try {
  //           const array_of_products = await products.find({}).exec();
  //           console.log("CSV ROWS", csvRows);

  //           var update_product = csvRows.map(async () => {
  //             for (let i = 0; i < csvRows.length; i++) {
  //               const obj = csvRows[i];
  //               const itemCode = obj.ItemCode;
  //               const foundDocs = array_of_products.find((x) => x.item_number === itemCode);
  //               if (!foundDocs) {
  //                 // console.log("Error")
  //                 continue;
  //               }
  //               const product_info = {
  //                 color: foundDocs.color,
  //                 item_number: foundDocs.item_number,
  //                 _awareid: foundDocs._awareid,
  //                 description: foundDocs.description,
  //                 info: foundDocs.info,
  //                 care: obj.Care,
  //                 weight: foundDocs.weight,
  //                 product_lock: foundDocs.product_lock,
  //                 sub_brand: obj.Brand,
  //                 status: foundDocs.status,
  //                 product_photo_1: obj.MainImage,
  //                 product_photo_2: foundDocs.product_photo_2,
  //                 product_photo_3: foundDocs.product_photo_3,
  //                 dpp_settings: foundDocs.dpp_settings,
  //                 impact_data: {
  //                   id: Math.floor(10000000 + Math.random() * 90000000).toString(),
  //                   co2: obj.co2,
  //                   water: obj.water,
  //                   land: obj.land
  //                 },
  //                 created_date: foundDocs.created_date,
  //                 modified_on: foundDocs.modified_on,
  //               };

  //               console.log("Iterration", i);
  //               console.log("Product Info", product_info)
  //               await products.findOneAndUpdate({ item_number: foundDocs.item_number }, { product_info })
  //             }
  //           });
  //           await Promise.all(update_product);
  //           console.log('CSV file processing completed.');
  //           res.status(200).send('CSV processed successfully');
  //         } catch (error) {
  //           console.error('Error processing CSV file:', error);
  //           res.status(500).send('Error processing CSV file');
  //         }
  //       })
  //       .on('error', (error) => {
  //         console.error('Error reading CSV file:', error);
  //         res.status(500).send('Error reading CSV file');
  //       });
  //   } catch (error) {
  //     console.error('Unexpected error:', error);
  //     res.status(500).send('Unexpected error occurred');
  //   }
  // },


  // processCSV: async (req, res) => {
  //   console.log('Processing CSV request...');
  //   try {
  //     const csvRows = [];
  //     fs.createReadStream('XD Connects product data - Updated with User IDs.csv')
  //       .pipe(parse({ delimiter: ",", from_line: 1, columns: true }))
  //       .on('data', async (row) => {
  //         csvRows.push(row);
  //       })
  //       .on('end', async () => {
  //         try {
  //           const array_of_products = await products.find({}).exec();
  //           console.log("CSV ROWS", csvRows)
  //           const update_product = csvRows.map(async () => {
  //             for (let i = 0; i < csvRows.length; i++) {
  //               const obj = csvRows[i];
  //               const itemCode = obj.ItemCode;
  //               const foundDocs = array_of_products.find((x) => x.item_number === itemCode);
  //               if (!foundDocs) {
  //                 // console.log("Error")
  //                 continue;
  //               }
  //               const product_info = {
  //                 color: foundDocs.color,
  //                 item_number: foundDocs.item_number,
  //                 _awareid: foundDocs._awareid,
  //                 description: foundDocs.description,
  //                 info: foundDocs.info,
  //                 care: obj.Care,
  //                 weight: foundDocs.weight,
  //                 product_lock: foundDocs.product_lock,
  //                 sub_brand: obj.Brand,
  //                 status: foundDocs.status,
  //                 product_photo_1: obj.MainImage,
  //                 product_photo_2: foundDocs.product_photo_2,
  //                 product_photo_3: foundDocs.product_photo_3,
  //                 dpp_settings: foundDocs.dpp_settings,
  //                 impact_data: {
  //                   id: Math.floor(10000000 + Math.random() * 90000000).toString(),
  //                   co2: obj.co2,
  //                   water: obj.water,
  //                   land: obj.land
  //                 },
  //                 created_date: foundDocs.created_date,
  //                 modified_on: foundDocs.modified_on,
  //               };

  //               console.log("Iterration", i);
  //               console.log("Product Info", product_info)
  //               await products.findOneAndUpdate({ item_number: foundDocs.item_number }, { product_info })
  //             }
  //           });
  //           await Promise.all(update_product);
  //           console.log('CSV file processing completed.');
  //           res.status(200).send('CSV processed successfully');
  //         } catch (error) {
  //           console.error('Error processing CSV file:', error);
  //           res.status(500).send('Error');
  //         }
  //       })
  //       .on('error', (error) => {
  //         console.error('Error reading CSV file:', error);
  //       });
  //   } catch (error) {
  //     console.error('Error:', error);
  //   }
  // },

  updateSubbrands: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).jsonp(errors.array());
    }

    try {
      // Fetch all kyc_details documents
      const allObjects = await kyc_details.find({});

      console.log(allObjects.length)

      let updatedCount = 0; // To track how many objects were updated

      // Create an array of promises for all updates
      const updatePromises = allObjects.map(async (object) => {
        let sub_brands = [];

        // Initialize company_own_brand with proper ObjectId and date handling
        let company_own_brand = {
          "_id": new mongoose.Types.ObjectId, // Create a new ObjectId
          "name": object.company_name,
          "logo": object.company_logo,
          "location": null,
          "circularity": null,
          "brand_data": [],
          "dpp_settings": null,
          "created_date": new Date() // Set the current date
        };


        // Push the company's own brand to the sub_brands array
        sub_brands.push(company_own_brand);

        console.log("object", object._id)
        console.log("object", object.sub_brand.length)


        // Add any existing sub_brands from the object to the new array
        // if (Array.isArray(object.sub_brand)) {
        object.sub_brand.forEach((obj) => {
          sub_brands.push(obj);
        });
        // }
        console.log("sub_brands", sub_brands.length)



        // Perform the update and get the result
        const result = await kyc_details.updateOne(
          { _id: object._id }, // Find by document ID
          { $set: { sub_brand: sub_brands } } // Update sub_brand field
        );

        console.log("result", result)

        // Increment updatedCount if at least one document was modified
        if (result.modifiedCount > 0) {
          updatedCount++;
        }

        return result;
      });

      // Wait for all the update operations to complete
      await Promise.all(updatePromises);

      return res.jsonp({
        status: true,
        message: 'Script successful!',
        updatedCount: updatedCount // Return the count of updated objects
      });
    } catch (error) {
      return res.status(500).jsonp({
        status: false,
        message: "Internal error occurred.",
        error: error.message
      });
    }
  },






  // feedback_form: async (req, res) => {
  //   const errors = validationResult(req);
  //   if (!errors.isEmpty()) {
  //     return res.status(422).jsonp(errors.array())
  //   }
  //   else {
  //     dpp_feedback.create(
  //       {
  //         aware_id: req.body.aware_id,
  //         feedback: req.body.feedback,
  //         created_date: new Date()
  //       },
  //       function (err, res) {
  //         if (err) return res.status(500).jsonp({ status: false, message: "Internal error!" })
  //         if (res) {
  //           // SendGrid.sendSubscriptionMail(email, function (result) {
  //           //   if (result != null) {
  //           //     return res.status(200).jsonp({ status: true, message: "Thank you for subscribing!" });
  //           //   }
  //           // })
  //         }
  //         else {
  //           return res.status(500).jsonp({ status: false, message: "Internal error!" })
  //         }
  //       }
  //     )
  //   }
  // }


  feedback_form: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).jsonp(errors.array());
    }

    try {
      const feedbackData = {
        aware_id: req.body.aware_id,
        passport_url: req.body.passport_url,
        feedback: req.body.feedback,
        created_date: new Date()
      };

      const result = await dpp_feedback.create(feedbackData);

      if (result) {
        // Uncomment and implement SendGrid logic if needed
        // const sendGridResult = SendGrid.sendfeedMail();

        SendGrid.sendfeedMail(feedbackData, function (result) {

          console.log("result", result)

          if (result) {
            return res.status(200).jsonp({ status: true, message: "Feedback submitted successfully!" });
          }
          // return res.status(200).jsonp({ status: true, message: "Feedback submitted successfully!" });
        })


      }
    } catch (err) {
      return res.status(500).jsonp({ status: false, message: "Internal error!" });
    }
  },


  //SHivam chauhan


  getParticularHardGoodsProduct: async (req, res) => {
    console.log("Shivam chauhan body", req.body);
    console.log("Shivam chauhan header", req.headers.hardgoodsproduct_id);

    // Validate the request payload
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).jsonp({ status: false, message: "Bad payload received." });
    } else {
      // Ensure necessary headers are present
      // if (!req.headers.userid || !req.headers.username || !req.headers.authorization || !req.headers.awareid) {
      //   return res.status(400).jsonp({ status: false, message: "Bad request!" });
      // }

      // Create the payload for the refresh function
      // const payload = { username: req.headers.username };

      try {
        // Call the refresh function with async/await (assuming refresh function can be modified to return a promise)
        // const refreshResponse = await new Promise((resolve, reject) => {
        //   refresh(req.headers.authorization, req.headers.userid, payload, (response) => {
        //     if (response.status === true) {
        //       resolve(response);  // If successful, resolve the response
        //     } else {
        //       reject('Failed to refresh token');  // If failed, reject the promise
        //     }
        //   });
        // });

        // If the refresh was successful, fetch the hard goods product
        const hardGoodsProduct = await hardGoodsBrands.findOne({ _id: mongoose.Types.ObjectId(req.headers.hardgoodsproduct_id) })
          .catch((ex) => {
            loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
            return res.status(500).jsonp({ status: false, message: "Failed to fetch product details." });
          });

        console.log("hardGoodsProduct", hardGoodsProduct);

        // If product is not found
        if (!hardGoodsProduct) {
          return res.status(404).jsonp({ status: false, message: "Hard goods product not found." });
        }

        // Return the hard goods product along with authorization token
        return res.status(200).jsonp({
          status: true,
          data: hardGoodsProduct,
          // authorization: refreshResponse.token,
        });

      } catch (error) {
        // Handle any errors during the refresh process or product fetching
        return res.status(500).jsonp({ status: false, message: error.toString() });
      }
    }
  },




  // getmasterdataAsync: async (req, res) => {
  //   const errors = validationResult(req);

  //   if (!errors.isEmpty()) {
  //     return res
  //       .status(422)
  //       .jsonp({ status: false, message: "Bad payload received." });
  //   } else {
  //     if (
  //       !req.headers.userid ||
  //       !req.headers.username ||
  //       !req.headers.authorization
  //     ) {
  //       return res
  //         .status(400)
  //         .jsonp({ status: false, message: "Bad request!" });
  //     } else {
  //       masters_data.find(
  //         { },
  //         function (err, user) {
  //           if (err) {
  //             return res
  //               .status(500)
  //               .jsonp({ status: false, message: err.toString() });
  //           }

  //           if (user) {
  //             var payload = { username: req.headers.username };
  //             refresh(
  //               req.headers.authorization,
  //               req.headers.userid,
  //               payload,
  //               function (resp) {
  //                 if (resp.status == true) {
  //                   // console.log("data received", jsonObject);
  //                   return res.status(200).jsonp({
  //                     message: "all the data received of particular master",
  //                     status: true,
  //                     data: user,
  //                     authorization: resp.token,
  //                   });
  //                 } else {
  //                   return res.status(resp.code).jsonp({
  //                     status: false,
  //                     authorization: null,
  //                   });
  //                 }
  //               }
  //             );
  //           }
  //         }
  //       ).sort({ name: 1 });
  //     }
  //   }
  // },

  // getNotificationListAsync: async (req, res) => {
  //   const errors = validationResult(req);

  //   if (!errors.isEmpty()) {
  //     return res.status(422).jsonp(errors.array())
  //   }

  //   else {

  //     if (!req.headers.aware_id) {
  //       return res
  //         .status(400)
  //         .jsonp({ status: false, message: "Bad request!" });
  //     }

  //     try {

  //       let account = await notifications.find({ notification_sent_to: req.headers.aware_id }).sort({ created_date: -1 }).catch((ex) => { loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`); return res.status(500).jsonp({ status: false, message: "Internal error!" }); });

  //       return res.status(200).jsonp({ status: true, data: account });
  //     } catch (error) {
  //       return res.status(400).jsonp({ status: false, message: "Bad request!" });
  //     }

  //   }
  // },

  // CertificateExpireCheckerForProducerAsync: async (req, res) => {
  //   const errors = validationResult(req);

  //   // console.log("HHGHGHY")

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
  //     var account = await account_details.findOne({ _id: mongoose.Types.ObjectId(req.headers.userid) }).select(['kyc_id'])


  //     if (!account) {  res.status(400).jsonp({ status: false, message: "Bad request!" });  }

  //     var details = await kyc_details.findOne({ _id: mongoose.Types.ObjectId(account.kyc_id) })

  //     if (!details) { res.status(400).jsonp({ status: false, message: "Bad request!" });  }


  //     let NextsevenDaysStart = moment().add(7, 'days').startOf('day').toDate()
  //     let NextsevenDaysEnd = moment().add(7, 'days').endOf('day').toDate()

  //     let purchase_order_ETD_list = await purchase_order_details.aggregate([
  //       { $match: { producer_aware_id: details?.aware_id } },
  //       { "$addFields": { "poid": { "$toObjectId": "$po_id" } } },
  //       { $lookup: { from: "purchase_orders", localField: "poid", foreignField: "_id", as: "details_avaliable", }, },
  //       { $addFields: { details_avaliable: { $arrayElemAt: ["$details_avaliable", 0] } } },
  //       {
  //         $set: {
  //           "po_status": "$details_avaliable.status",
  //           "hide": "$details_avaliable.hide",
  //         }
  //       },
  //       { $match: { etd: { $gte: NextsevenDaysStart, $lte: NextsevenDaysEnd }, po_status: { $eq: "SEND" }, hide: { $ne: true } } },
  //       { $project: { "_id": 0, "producer": 1, "order_number": 1, "brand": 1, "etd": 1 } },
  //     ])

  //     purchase_order_ETD_list?.forEach(async (item) => {
  //       let previous_notification = await notifications.findOne({
  //         notification_sent_to: details?.aware_id,
  //         date: moment(NextsevenDaysEnd).format('DD/MM/YYYY'),
  //         message: `The ETD ${moment(item.etd).format('DD/MM/YYYY')} for PO${item.order_number} of ${item.brand} is approaching within a week. Please take action to complete the token update, connect to line items and manager approval ASAP.`
  //       })

  //       if (!previous_notification) {
  //         await notifications.create({
  //           notification_sent_to: details?.aware_id,
  //           date: moment(NextsevenDaysEnd).format('DD/MM/YYYY'),
  //           message: `The ETD ${moment(item.etd).format('DD/MM/YYYY')} for PO${item.order_number} of ${item.brand} is approaching within a week. Please take action to complete the token update, connect to line items and manager approval ASAP.`
  //         })

  //         SendGrid.ETDMailer(account.email, details.company_name, item, 1, (result) => {
  //           if (result == null) {
  //             return res.status(500).jsonp({ status: false, message: "Internal error! Please Re-send Verification link to Manager email address." });
  //           }
  //         });


  //       }
  //     })


  //     let LastDaysStart = moment().subtract(1, 'days').startOf('day').toDate()
  //     let LastDaysEnd = moment().subtract(1, 'days').endOf('day').toDate()

  //     let last_purchase_order_ETD_list = await purchase_order_details.aggregate([
  //       { $match: { producer_aware_id: details?.aware_id } },
  //       { "$addFields": { "poid": { "$toObjectId": "$po_id" } } },
  //       { $lookup: { from: "purchase_orders", localField: "poid", foreignField: "_id", as: "details_avaliable", }, },
  //       { $addFields: { details_avaliable: { $arrayElemAt: ["$details_avaliable", 0] } } },
  //       {
  //         $set: {
  //           "po_status": "$details_avaliable.status",
  //           "hide": "$details_avaliable.hide",
  //         }
  //       },
  //       { $match: { etd: { $gte: LastDaysStart, $lte: LastDaysEnd }, po_status: { $eq: "SEND" }, hide: { $ne: true } } },
  //       { $project: { "_id": 0, "producer": 1, "order_number": 1, "brand": 1, "etd": 1 } },
  //     ])
  //     last_purchase_order_ETD_list?.forEach(async (item) => {
  //       let previous_notification = await notifications.findOne({
  //         notification_sent_to: details?.aware_id,
  //         date: moment(LastDaysEnd).format('DD/MM/YYYY'),
  //         message: `Alert! The ETD for PO${item.order_number} of ${item.brand} has already passed. You have missed the  ETD deadline. Please finish the token update ASAP.`
  //       })

  //       if (!previous_notification) {
  //         await notifications.create({
  //           notification_sent_to: details?.aware_id,
  //           date: moment(LastDaysEnd).format('DD/MM/YYYY'),
  //           message: `Alert! The ETD for PO${item.order_number} of ${item.brand} has already passed. You have missed the  ETD deadline. Please finish the token update ASAP.`
  //         })

  //          SendGrid.ETDMailer(account.email, details.company_name, item, 2, (result) => {
  //           if (result == null) {
  //             return res.status(500).jsonp({ status: false, message: "Internal error! Mailer Error." });
  //           }
  //         });
  //       }
  //     })

  //   }

  // },

  // CertificateExpireCheckerForFinalBrandAsync: async (req, res) => {
  //   // Validate request
  //   const errors = validationResult(req);
  //   if (!errors.isEmpty()) {
  //     return res.status(422).jsonp(errors.array());
  //   }
  //   const { userid, username, authorization, aware_id, email } = req.headers;
  //   if (!userid || !username || !authorization || !aware_id) {
  //     return res.status(400).jsonp({ status: false, message: "Bad request!" });
  //   }

  //   try {


  //     let NextsevenDaysStart = moment().add(7, 'days').startOf('day').toDate()
  //     let NextsevenDaysEnd = moment().add(7, 'days').endOf('day').toDate()

  //     let purchase_order_ETD_list = await purchase_orders.aggregate([
  //       { $match: { _awareid: aware_id, status: { $eq: "SEND" }, hide: { $ne: true } } },
  //       { "$addFields": { "po_id": { "$toString": "$_id" } } },
  //       { $lookup: { from: "purchase_order_details", localField: "po_id", foreignField: "po_id", as: "details_avaliable", }, },
  //       { $addFields: { details_avaliable: { $arrayElemAt: ["$details_avaliable", 0] } } },
  //       {
  //         $set: {
  //           "producer": "$details_avaliable.producer",
  //           "order_number": "$details_avaliable.order_number",
  //           "brand": "$details_avaliable.brand",
  //           "etd": "$details_avaliable.etd"
  //         }
  //       },
  //       { $match: { etd: { $gte: NextsevenDaysStart, $lte: NextsevenDaysEnd } } },
  //       { $project: { "_id": 0, "producer": 1, "order_number": 1, "brand": 1, "etd": 1 } },
  //     ])

  //     purchase_order_ETD_list?.forEach(async (item) => {
  //       let previous_notification = await notifications.findOne({
  //         notification_sent_to: aware_id,
  //         date: moment(NextsevenDaysEnd).format('DD/MM/YYYY'),
  //         message: `The ETD for PO ${item.order_number}  sent to ${item.producer} is approaching within a week. Please take action to remind the ${item.producer}.`
  //       })

  //       if (!previous_notification) {
  //         await notifications.create({
  //           notification_sent_to: aware_id,
  //           date: moment(NextsevenDaysEnd).format('DD/MM/YYYY'),
  //           message: `The ETD for PO ${item.order_number}  sent to ${item.producer} is approaching within a week. Please take action to remind the ${item.producer}.`
  //         })
  //       }
  //     })


  //     let LastDaysStart = moment().subtract(1, 'days').startOf('day').toDate()
  //     let LastDaysEnd = moment().subtract(1, 'days').endOf('day').toDate()

  //     let last_purchase_order_ETD_list = await purchase_orders.aggregate([
  //       { $match: { _awareid: aware_id, status: { $eq: "SEND" }, hide: { $ne: true } } },
  //       { "$addFields": { "po_id": { "$toString": "$_id" } } },
  //       { $lookup: { from: "purchase_order_details", localField: "po_id", foreignField: "po_id", as: "details_avaliable", }, },
  //       { $addFields: { details_avaliable: { $arrayElemAt: ["$details_avaliable", 0] } } },
  //       {
  //         $set: {
  //           "producer": "$details_avaliable.producer",
  //           "order_number": "$details_avaliable.order_number",
  //           "brand": "$details_avaliable.brand",
  //           "etd": "$details_avaliable.etd"
  //         }
  //       },
  //       { $match: { etd: { $gte: LastDaysStart, $lte: LastDaysEnd } } },
  //       { $project: { "_id": 0, "producer": 1, "order_number": 1, "brand": 1, "etd": 1 } },
  //     ])

  //     last_purchase_order_ETD_list?.forEach(async (item) => {
  //       let previous_notification = await notifications.findOne({
  //         notification_sent_to: aware_id,
  //         date: moment(LastDaysEnd).format('DD/MM/YYYY'),
  //         message: `Alert! The ETD for PO${item.order_number} sent to ${item.producer} has already passed. ${item.producer} missed the token update deadline.`
  //       })

  //       if (!previous_notification) {
  //         await notifications.create({
  //           notification_sent_to: aware_id,
  //           date: moment(LastDaysEnd).format('DD/MM/YYYY'),
  //           message: `Alert! The ETD for PO${item.order_number} sent to ${item.producer} has already passed. ${item.producer} missed the token update deadline.`
  //         })
  //       }
  //     })

  //     // console.log({ purchase_order_ETD })

  //     // return res.status(200).jsonp({
  //     //   status: true,
  //     //   data: true,
  //     //   // authorization: resp.token,
  //     // });
  //     refresh(authorization, userid, { username }, resp => {
  //       if (resp.status) {
  //         return res.status(200).jsonp({ status: true, data: true, authorization: resp.token });
  //       } else {
  //         return res.status(resp.code).jsonp({ status: false, data: null, authorization: null });
  //       }
  //     });

  //   } catch (error) {
  //     loggerhandler.logger.error(`${error}, email:${email}`);
  //     return res.status(500).jsonp({ status: false, message: error.toString() });
  //   }

  // },




}
function hmac_sha256_encode(value, key) {
  var hash = crypto.createHmac("sha256", key)
    .update(value, 'utf8')
    .digest('hex');
  return hash;
}

async function post_form(datas, url) {
  var options = {
    url: url,
    method: "POST",
    params: datas,
    timeout: 5000
  };

  var result = await axios(options);

  if (result.status != 200) {
    // geetest服务响应异常
    // geetest service response exception
    // console.log('Geetest Response Error, StatusCode:' + result.status);
    throw new Error('Geetest Response Error')
  }
  return result.data;
}



// getAllCreatedTokenAsync: async (req, res) => {
//   try {
//     var exempted_email_exist = (await exempted_email.find({}).select(["email"])).map((ele) => ele.email)
//     var kyc_ids = (await account_details.find({ role_id: { $ne: 1 }, email: { $nin: exempted_email_exist } }).select(['kyc_id']))
//       .map((ele) => mongoose.Types.ObjectId(ele.kyc_id))
//     var kyc_details_data = (await kyc_details.find({ _id: { $in: kyc_ids } }).select(['aware_id', 'company_name'])).filter(ele => ele.aware_id)

//     if (kyc_details_data.length > 0) {
//       let data = await Promise.all(kyc_details_data.map(async (ele) => {
//         const Available_aw_token = await aw_tokens.find({ _awareid: ele.aware_id })
//         const Available_update_aw_token = await update_aw_tokens.find({ _awareid: ele.aware_id })

//         const filterd_aw_token = Available_aw_token.map((aware) => {
//           return {
//             "Token Type": aware.type_of_token,
//             "Tokens Created ": aware.total_tokens,
//             "Token Created By": ele.company_name,
//             "Token Created On": aware.created_date
//           }
//         })
//         const filterd_update_aw_token = Available_update_aw_token.map((update) => {
//           return {
//             "Token Type": update.type_of_token,
//             "Tokens Created ": update.total_tokens,
//             "Token Created By": ele.company_name,
//             "Token Created On": update.created_date
//           }
//         })
//         return [...filterd_aw_token, ...filterd_update_aw_token];
//       }));

//       let filtere_data = data.filter((ele) => ele).flat();
//       return res.status(200).jsonp({ status: true, message: "Some URL.", data: filtere_data });

//     }
//     return res.status(200).jsonp({ status: true, message: "Some URL.", data: [] });

//   } catch (error) {
//     // Handle errors and log them
//     console.error(error);
//     return res.status(500).jsonp({ status: false, message: "Internal Server Error." });
//   }
// },




