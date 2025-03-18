const jwt = require("jsonwebtoken");
var account_availability = require("./models/account_availability");
var account_details = require("./models/account_details");

exports.verify = async function (req, res, next) {
  const allowedIPs = []; // Replace with actual IPs

  const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;

  if (allowedIPs.includes(ip)) {
    const htmlContent = `<div style="width: 100%; height: 100vh; background: #2E2B4E; display: grid; place-items: center;">
        <div style="width: 30%; max-width: 90%; text-align: center;">
            <div style="font-size: 3.5rem; line-height: 3.5rem; margin: auto; margin-bottom: 20px; width: 5rem; height: 5rem; background: #fff; border-radius: 5rem; display: grid; place-items: center; color: #2E2B4E; ">&#x26A0;</div>
            <h1 style="font-size: 3rem; margin-bottom: 20px; color: #FFFFFF;">We’ll be back soon!</h1>
            <p style="font-size: 1.2rem; color: #FFFFFF;">Sorry for the inconvenience. We’re performing some maintenance at the moment. If you need to, you can always follow us on
                <a href="https://www.linkedin.com/company/wearaware/" target="_blank" style="color: #FFFFFF; font-weight: bold; text-decoration: underline;">LinkedIn</a> for updates, otherwise, we’ll be back up shortly!</p>
            <p style="font-size: 1.2rem; color: #FFFFFF;">— The AWARE™ Team</p>
        </div>
    </div>`;
    res.status(503).send(htmlContent); // Send 503 status with maintenance HTML
  } else {
    if (!req.headers.authorization) {
      return res
        .status(401)
        .jsonp({
          status: false,
          message: "undefined authorization token!",
          code: 401,
        });
    }
    let accessToken = req.headers.authorization;
    try {
      jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
      var account_avaliable = await account_availability
        .findOne({ email: req.headers.email })
        .catch((ex) => {
          return res
            .status(400)
            .jsonp({ status: false, message: "Bad request!" });
        });
      if (account_avaliable) {
        // console.log("headers",req.headers.hash)
        // console.log("hash",account_avaliable.hash)

        if (req.headers.hash === account_avaliable.hash) {
          const { is_deleted } = await account_details
            .findOne({ email: req.headers.email })
            .select("is_deleted")
            .catch((ex) => {
              return res
                .status(400)
                .jsonp({ status: false, message: "Bad request!" });
            });
          // console.log({is_deleted})
          if (is_deleted && is_deleted == true) {
            return res
              .status(401)
              .jsonp({
                status: false,
                message: "undefined authorization token!",
                code: 401,
              });
          } else {
            next();
          }
        } else {
          return res
            .status(401)
            .jsonp({
              status: false,
              message: "multiple devices undefined authorization token!",
              code: 401,
            });
        }
      } else {
        return res
          .status(401)
          .jsonp({
            status: false,
            message: "undefined authorization token!",
            code: 401,
          });
      }
    } catch (ex) {
      return res
        .status(401)
        .jsonp({ status: false, message: ex.message.toString(), code: 401 });
    }
  }
};
