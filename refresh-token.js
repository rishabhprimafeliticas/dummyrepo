const jwt = require("jsonwebtoken");
var user_details = require("./models/account_details");
var mongoose = require("mongoose");

module.exports = {
  refresh: function (authorization, userid, payload, callback) {
    if (!authorization || !userid || !payload) {
      return callback({
        status: false,
        message: "Undefined access token",
        code: 403,
      });
    }

    try {
      jwt.verify(authorization, process.env.ACCESS_TOKEN_SECRET);
    } catch (e) {
      return callback({
        status: false,
        message: "Your session has expired!",
        code: 401,
      });
    }

    var query = { $and: [{ _id: mongoose.Types.ObjectId(userid) }] };

    user_details.findOne(query, function (err, user) {
      if (err)
        return callback({
          status: false,
          message: "Internal error",
          code: 500,
        });

      if (!user) {
        return callback({
          status: false,
          message: "Internal error",
          code: 500,
        });
      }

      try {
        jwt.verify(user.refresh_token_secret, process.env.REFRESH_TOKEN_SECRET);
      } catch (e) {
        return callback({
          status: false,
          message: "Your session has expired!",
          code: 401,
        });
      }

      var newToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
        algorithm: "HS256",
        expiresIn: process.env.ACCESS_TOKEN_LIFE,
      });

      // user_details.findOneAndUpdate(query,
      //     {
      //         refresh_token_secret: newToken
      //     },
      //     function (err, updated) {
      //         if (err) return callback({ "status": false, "message": "Internal error", "code": 500 });

      //         return callback({ "status": true, "message": "verified", "code": 200 });
      //     })

      return callback({
        status: true,
        message: "verified",
        code: 200,
        token: newToken,
      });
    });
  },
};
