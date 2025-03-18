var jwt = require("jsonwebtoken");
var user_details = require("../models/account_details");
var kyc_details = require("../models/kyc_details");
var user_roles = require("../models/user_role");
var account_availability = require("../models/account_availability");
const loggerhandler = require('../logger/log');
var mongoose = require('mongoose');

module.exports = {

    tokenCreation: async function (userdetails, callback) {

       
        if (userdetails) {
            let payload = { email: userdetails.email };

            let accessToken = jwt.sign(
                payload,
                process.env.ACCESS_TOKEN_SECRET,
                {
                    algorithm: "HS256",
                    expiresIn: process.env.ACCESS_TOKEN_LIFE, //1 Hour
                }
            );

            let refreshToken = jwt.sign(
                payload,
                process.env.REFRESH_TOKEN_SECRET,
                {
                    algorithm: "HS256",
                    expiresIn: process.env.REFRESH_TOKEN_LIFE, //24 Hour
                }
            );



            let lockaccessToken = jwt.sign(
                payload,
                process.env.DEVICE_TOKEN_SECRET,
                {
                    algorithm: "HS256",
                    expiresIn: process.env.DEVICE_TOKEN_LIFE, //1 Hour
                }
            );

            await account_availability.deleteMany({ email: userdetails.email }).catch((ex) => { return callback({ status: false, message: "Internal error" }); })

            await account_availability.create({
                email: userdetails.email,
                hash: lockaccessToken
            }).catch((ex) => { return callback({ status: false, message: "Internal error" }); })


            var query = { $and: [{ email: userdetails.email }] };

            user_details.findOne(query, function (err, result) {
                if (err) return callback({ status: false, message: "Internal error" });


                user_details.updateOne(
                    query,
                    {
                        refresh_token_secret: refreshToken,
                    },
                    async function (err, resp) {
                        if (err) return callback({ status: false, message: "Internal error" });


                        if (result.kyc_id) {
                            var deatils = await kyc_details.findOne({ _id: mongoose.Types.ObjectId(result.kyc_id) }).catch((ex) => { });
                            var role_data = await user_roles.findOne({ role_id: userdetails.role_id }).select(["role_name"]).catch((ex) => { });

                            var array_of_emails = [
                                "selfuser73+finalbrand@gmail.com",
                                "selfuser73+fs@gmail.com",
                                "test.zuberaalam+f.alb.dev@gmail.com",
                                "rstesting56+rru01@gmail.com",
                                "rstesting56+f.brandjc@gmail.com" ,
                            ];


                            // Fetch the Hard Goods product only for these users!!!!
                            let hard_goods_enabled = array_of_emails.includes(userdetails.email) == true ? true : userdetails.email.split('@')[1] == "xdconnects.com" ;

                            console.log("hard_goods_enabled", hard_goods_enabled);
                            return callback({
                                status: true,
                                message: "Logged in successfully",
                                userdetails: {
                                    "userid": userdetails._id,
                                    "role_id": userdetails.role_id,
                                    "role_name": role_data.role_name,
                                    "username": `${userdetails.first_name}${userdetails.last_name}`,
                                    "email": userdetails.email,
                                    "kyc_status": Number(deatils.kyc_status),
                                    "awareid": userdetails.role_id == 10 ? userdetails._id : userdetails.role_id == 1 ? 'admin' : (deatils?.aware_id || ''),
                                    "acknowledgement": userdetails.acknowledgement,
                                    hard_goods_enabled
                                },
                                authorization: accessToken,
                                hash: lockaccessToken
                            });
                        }
                        else {
                            var details = await kyc_details.findOne({ manager_id: userdetails._id }).catch((ex) => { res.status(500).jsonp({ status: false, message: ex }); });
                            var role_data = await user_roles.findOne({ role_id: userdetails.role_id }).select(["role_name"]).catch((ex) => { res.status(500).jsonp({ status: false, message: ex }); });
                            var particularuserdetail = await user_details.findOne({ kyc_id: details._id }).catch((ex) => { res.status(500).jsonp({ status: false, message: ex }); });


                            return callback({
                                status: true,
                                message: "Logged in successfully",
                                userdetails: {
                                    "userid": userdetails._id,
                                    "role_name": role_data.role_name,
                                    "role_id": userdetails.role_id,
                                    "user_role_id": particularuserdetail?.role_id || '',
                                    "username": `${userdetails.first_name}${userdetails.last_name}`,
                                    "email": userdetails.email,
                                    "kyc_status": details.kyc_status,
                                    "awareid": userdetails.role_id == 10 ? userdetails._id : '',
                                    "acknowledgement": userdetails.acknowledgement
                                },
                                authorization: accessToken,
                                hash: lockaccessToken
                            });
                        }
                    }
                );
            });
        } else {
            return callback({ status: false, message: "Internal error" });
        }
    },

}