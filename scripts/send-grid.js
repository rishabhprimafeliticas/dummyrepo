var sessionStorage = require("../models/session_storage");
var bcrypt = require("bcryptjs");
const sgMail = require("@sendgrid/mail");
const account_details = require("../models/account_details");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const sender_identity = process.env.Sender_Identity;
const loggerhandler = require('../logger/log');
const moment = require('moment');

module.exports = {

  sendRegistrationMail: function (emailaddress, username, callback) {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(emailaddress, salt);
    const random = bcrypt.hashSync("Aaware-Ensure-Absolute-Identity-Verification", salt);
    var expirationtime = Date.now() + 600000;

    sessionStorage.findOne({ email: emailaddress }, function (err, session) {
      if (err) { loggerhandler.logger.error(`${err} ,email:${req.headers.email}`); return callback(null); }

      var currentyear = new Date().getFullYear()
      var NextYear = new Date().getFullYear() + 1
      var year = currentyear + '-' + NextYear;

      if (session) {
        sessionStorage.deleteOne({ email: emailaddress }, function (err, sessionremoved) {
          if (err) { loggerhandler.logger.error(`${err} ,email:${req.headers.email}`); return callback(null); }

          sessionStorage.create(
            { email: emailaddress, linkexpirationtime: expirationtime, hash: hash },
            function (err, result) {
              if (err) { loggerhandler.logger.error(`${err} ,email:${req.headers.email}`); return callback(null); }
              if (result) {
                var verificationaddress =
                  process.env.DOMAIN + "/emailVerification?ue=" + hash +
                  "&ex=" + expirationtime + "&gt=" + random;
                const msg = {
                  from: sender_identity,
                  to: emailaddress,
                  cc: sender_identity,
                  subject:
                    "Welcome to Aware!",
                  html: `<!DOCTYPE html>
                  <html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">
                  
                  <head>
                    <title></title>
                    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch><o:AllowPNG/></o:OfficeDocumentSettings></xml><![endif]-->
                    <!--[if !mso]><!-->
                          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500&display=swap" rel="stylesheet">
                    <!--<![endif]-->
                    <style>
                      * {
                        box-sizing: border-box;
                      }
                  
                      body {
                        margin: 0;
                        padding: 0; background: #f2f2f2;
                      }
                  
                      a[x-apple-data-detectors] {
                        color: inherit !important;
                        text-decoration: inherit !important;
                      }
                  
                      #MessageViewBody a {
                        color: inherit;
                        text-decoration: none;
                      }
                  
                      p {
                        line-height: inherit
                      }
                          ul li{line-height: 23px;}
                  
                      .desktop_hide,
                      .desktop_hide table {
                        mso-hide: all;
                        display: none;
                        max-height: 0px;
                        overflow: hidden;
                      }
                  
                      @media (max-width:620px) {
                        .desktop_hide table.icons-inner {
                          display: inline-block !important;
                        }
                  
                        .icons-inner {
                          text-align: center;
                        }
                  
                        .icons-inner td {
                          margin: 0 auto;
                        }
                  
                        .row-content {
                          width: 100% !important;
                        }
                  
                        .mobile_hide {
                          display: none;
                        }
                  
                        .stack .column {
                          width: 100%;
                          display: block;
                        }
                  
                        .mobile_hide {
                          min-height: 0;
                          max-height: 0;
                          max-width: 0;
                          overflow: hidden;
                          font-size: 0px;
                        }
                  
                        .desktop_hide,
                        .desktop_hide table {
                          display: table !important;
                          max-height: none !important;
                        }
                      }
                    </style>
                  </head>
                  
                  <body style="background: #f2f2f2; margin: 0; padding: 0; -webkit-text-size-adjust: none; text-size-adjust: none;">
                    <table class="nl-container" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background: #f2f2f2;" >
                      <tbody>
                        <tr>
                          <td>
                                      <p>&nbsp;</p>
                                      <table style="background: #ffffff; box-shadow:0px 0px 10px #0000003b;  border-radius: 5px; mso-table-lspace: 0pt; width: 600px; margin-top: 50px; mso-table-rspace: 0pt; " align="center" width="600" border="0" cellpadding="0" cellspacing="0" >
                                          <tr>
                                              <td >
                                                  <table class="row row-1" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                      <tbody>
                                                          <tr>
                                                              <td>
                                                                  <p style="margin: 0;">&nbsp;</p>
                                                                  <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #000000; width: 600px;" width="600">
                                                                      <tbody>
                                                                          <tr>
                                                                              <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; padding-top: 5px; padding-bottom: 5px; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                                                  <table class="image_block block-1" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                                                      <tr>
                                                                                          <td class="pad" style="width:100%;padding-right:0px;padding-left:0px;">
                                                                                              <div class="alignment" align="center" style="line-height:10px"><img src="https://api.wearaware.co/uploads/aware-logo-new-mail.png" style="display: block; height: auto; border: 0; width: 200px; max-width: 100%;" width="200"></div>
                                                                                          </td>
                                                                                      </tr>
                                                                                  </table>
                                                                              </td>
                                                                          </tr>
                                                                      </tbody>
                                                                  </table>
                                                              </td>
                                                          </tr>
                                                      </tbody>
                                                  </table>
                                                  <table class="row row-2" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; margin-top: 5px; mso-table-rspace: 0pt;">
                                                      <tbody>
                                                          <tr>
                                                              <td>
                                                                  <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #000000; width: 600px;" width="600">
                                                                      <tbody>
                                                                          <tr>
                                                                              <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; padding-top: 5px; padding-bottom: 5px; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                                                  <table class="image_block block-1" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                                                      <tr>
                                                                                          <td class="pad" style="width:100%;padding-right:0px;padding-left:0px;">
                                                                                              <div class="alignment" align="center" style="line-height:10px"><img src="https://api.wearaware.co/uploads/mail.png" style="display: block; height: auto; border: 0; width: 90px; max-width: 100%;" width="90"></div>
                                                                                          </td>
                                                                                      </tr>
                                                                                  </table>
                                                                              </td>
                                                                          </tr>
                                                                      </tbody>
                                                                  </table>
                                                              </td>
                                                          </tr>
                                                      </tbody>
                                                  </table>
                                                  <table class="row row-3" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                      <tbody>
                                                          <tr>
                                                              <td>
                                                                  <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #7f8399; width: 600px;" width="600">
                                                                      <tbody>
                                                                          <tr>
                                                                              <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 15pt; font-weight: 400; text-align: left; padding-left: 20px; padding-right: 20px; vertical-align: top; padding-top: 5px; padding-bottom: 5px; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                                                  <table class="text_block block-1" width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                                                                      <tr>
                                                                                          <td class="pad">
                                                                                              <div style="font-family: sans-serif">
                                                                                                  <div class style="font-size: 12px; font-family: 'Inter', sans-serif; mso-line-height-alt: 14.399999999999999px; color: #555555; line-height: 1.2;">
                                                                                                      <p style="margin: 0; margin-bottom: 20px; font-size: 14px; text-align: center; mso-line-height-alt: 16.8px;"><span style="color:#000000;"><strong><span style=" font-size: 1.5em;">Email Verification</span></strong></span></p>
                                                                                                  </div>
                                                                                              </div>
                                                                                          </td>
                                                                                      </tr>
                                                                                  </table>
                                                                                  <table class="paragraph_block block-2" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                                                                      <tr>
                                                                                          <td class="pad">
                                                                                              <div style="color:#7f8399;direction:ltr;font-family: 'Inter', sans-serif;font-size: 14px;font-weight:400;letter-spacing:0px;line-height:120%;text-align:left;mso-line-height-alt:19.2px;">
                                                                                                  <p style="margin: 0; margin-bottom: 16px;"><span>Greetings from Aware™.</span></p>
                                                                                                  <p style="margin: 0;"><span>Thanks for starting the new account creation process. We want to make sure it's really you. Please click the button below to activate your account and proceed with the registration. If you don’t want to create an account, you can ignore this message.</span></p>
                                                                                                  <p style="margin: 0;">&nbsp;</p>
                                                                                                  <div class="alignment" align="center"><!--[if mso]><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${verificationaddress}" style="height:32px;width:170px;v-text-anchor:middle;" arcsize="75%" stroke="false" fillcolor="#0352C9"><w:anchorlock/><v:textbox inset="0px,0px,0px,0px"><center style="color:#ffffff; font-family:Arial, sans-serif; font-size:16px"><![endif]--><a href="${verificationaddress}" target="_blank" style="text-decoration:none;display:inline-block;color:#ffffff;background-color:#0352C9;border-radius:24px;width:auto;border-top:0px solid transparent;font-weight:400;border-right:0px solid transparent;border-bottom:0px solid transparent;border-left:0px solid transparent;padding-top:0px;padding-bottom:0px;font-family: 'Inter', sans-serif;text-align:center;mso-border-alt:none;word-break:keep-all;"><span style="padding-left:25px;padding-right:25px;font-size:14px;display:inline-block;letter-spacing:normal;"><span style="font-family: 'Inter', sans-serif; line-height: 32px;">Verify Email Address</span></span></a><!--[if mso]></center></v:textbox></v:roundrect><![endif]--></div>
                                                                                                  <p style="margin: 0;">&nbsp;</p>
                                                                                                  <p style="margin: 0;"><span>If you have issue with viewing the above button, try to copy and paste the link below in your web browser. </span></p>
                                                                                                  <p style="margin: 0;">&nbsp;</p>
                                                                                                  <p style="margin: 0; color: #000000;"><span><b>Activation Link:</b></span></p>
                                                                                                
                                                                                                  <p style="margin: 0;"><span><a style="text-decoration: underline; color: #0352C9;" href="${verificationaddress}">${verificationaddress}</a></span></p>
                                                                                              </div>
                                                                                          </td>
                                                                                      </tr>
                                                                                  </table>
                                                                                  
                                                                                  <table class="paragraph_block block-4" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                                                                      <tr>
                                                                                          <td class="pad">
                                                                                              <div style="color:#7f8399;direction:ltr;font-family:'Open Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif;font-size: 14px;font-weight:400;letter-spacing:0px;line-height:120%;text-align:left;mso-line-height-alt:19.2px;">
                                                                                                  <p style="margin: 0;">&nbsp;</p>
                                                                                                  <p style="margin: 0;"><strong><span style="color: #000000;">Contact us:&nbsp;</span></strong><a href="mailto:support@wearaware.co" style="text-decoration: none; color: #7f8399;">support@wearaware.co</a></p>
                                                                                                  <p style="margin: 0;">&nbsp;</p>
                                                                                              </div>
                                                                                          </td>
                                                                                      </tr>
                                                                                  </table>
                                                                              </td>
                                                                          </tr>
                                                                      </tbody>
                                                                  </table>
                                                              </td>
                                                          </tr>
                                                      </tbody>
                                                  </table>
                                              </td>
                                          </tr>
                                      </table>
                                      <table class="row row-4" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                              <tbody>
                                <tr>
                                  <td>
                                    <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #7f8399; width: 600px;" width="600">
                                      <tbody>
                                        <tr>
                                          <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; padding-top: 5px; padding-bottom: 5px; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                            <table class="text_block block-1" width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                              <tr>
                                                <td class="pad" style="padding: 10px 0;">
                                                  <div style="font-family: sans-serif">
                                                    <div class style="font-size: 13px; font-family: 'Inter', sans-serif; mso-line-height-alt: 14.399999999999999px; color: #7f8399; line-height: 1.2;">
                                                      <p style="margin: 0; font-size: 13px; text-align: center; mso-line-height-alt: 16.8px; color: #7f8399; "><span style="font-size:13px;">This message was produced and distributed by the Aware™ Platform, The Netherlands. All rights reserved. Aware™ is a registered trademark of The Movement IP BV. View our&nbsp;<a href="https://www.iubenda.com/privacy-policy/31166669/full-legal" target="_blank"  style="text-decoration: underline; color: #0352C9;" >privacy policy</a>.</span></p>
                                                    </div>
                                                  </div>
                                                </td>
                                              </tr>
                                            </table>
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </td>
                                  
                        </tr>
                      </tbody>
                    </table><!-- End -->
                  </body>
                  
                  </html>`};
                sgMail
                  .send(msg)
                  .then(() => {
                    return callback('success');
                  })
                  .catch((error) => {
                    // loggerhandler.logger.error(`${error} ,email:${req.headers.email}`);
                    if (error.response) {
                      const { message, code, response } = error;
                      const { headers, body } = response;
                      return callback(null);
                    }
                  });
              }
            }
          );
        })
      }
      else {
        sessionStorage.create(
          { email: emailaddress, linkexpirationtime: expirationtime, hash: hash },
          function (err, result) {
            if (err) { loggerhandler.logger.error(`${err} ,email:${req.headers.email}`); return callback(null); }
            if (result) {
              var verificationaddress =
                process.env.DOMAIN + "/emailVerification?ue=" + hash +
                "&ex=" + expirationtime + "&gt=" + random;
              const msg = {
                from: sender_identity,
                to: emailaddress,
                subject:
                  "Welcome to Aware!",
                html: `<!DOCTYPE html>
                <html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">
                
                <head>
                  <title></title>
                  <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch><o:AllowPNG/></o:OfficeDocumentSettings></xml><![endif]-->
                  <!--[if !mso]><!-->
                        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500&display=swap" rel="stylesheet">
                  <!--<![endif]-->
                  <style>
                    * {
                      box-sizing: border-box;
                    }
                
                    body {
                      margin: 0;
                      padding: 0; background: #f2f2f2;
                    }
                
                    a[x-apple-data-detectors] {
                      color: inherit !important;
                      text-decoration: inherit !important;
                    }
                
                    #MessageViewBody a {
                      color: inherit;
                      text-decoration: none;
                    }
                
                    p {
                      line-height: inherit
                    }
                        ul li{line-height: 23px;}
                
                    .desktop_hide,
                    .desktop_hide table {
                      mso-hide: all;
                      display: none;
                      max-height: 0px;
                      overflow: hidden;
                    }
                
                    @media (max-width:620px) {
                      .desktop_hide table.icons-inner {
                        display: inline-block !important;
                      }
                
                      .icons-inner {
                        text-align: center;
                      }
                
                      .icons-inner td {
                        margin: 0 auto;
                      }
                
                      .row-content {
                        width: 100% !important;
                      }
                
                      .mobile_hide {
                        display: none;
                      }
                
                      .stack .column {
                        width: 100%;
                        display: block;
                      }
                
                      .mobile_hide {
                        min-height: 0;
                        max-height: 0;
                        max-width: 0;
                        overflow: hidden;
                        font-size: 0px;
                      }
                
                      .desktop_hide,
                      .desktop_hide table {
                        display: table !important;
                        max-height: none !important;
                      }
                    }
                  </style>
                </head>
                
                <body style="background: #f2f2f2; margin: 0; padding: 0; -webkit-text-size-adjust: none; text-size-adjust: none;">
                  <table class="nl-container" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background: #f2f2f2;" >
                    <tbody>
                      <tr>
                        <td>
                                    <p>&nbsp;</p>
                                    <table style="background: #ffffff; box-shadow:0px 0px 10px #0000003b;  border-radius: 5px; mso-table-lspace: 0pt; width: 600px; margin-top: 50px; mso-table-rspace: 0pt; " align="center" width="600" border="0" cellpadding="0" cellspacing="0" >
                                        <tr>
                                            <td >
                                                <table class="row row-1" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                    <tbody>
                                                        <tr>
                                                            <td>
                                                                <p style="margin: 0;">&nbsp;</p>
                                                                <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #000000; width: 600px;" width="600">
                                                                    <tbody>
                                                                        <tr>
                                                                            <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; padding-top: 5px; padding-bottom: 5px; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                                                <table class="image_block block-1" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                                                    <tr>
                                                                                        <td class="pad" style="width:100%;padding-right:0px;padding-left:0px;">
                                                                                            <div class="alignment" align="center" style="line-height:10px"><img src="https://api.wearaware.co/uploads/aware-logo-new-mail.png" style="display: block; height: auto; border: 0; width: 200px; max-width: 100%;" width="200"></div>
                                                                                        </td>
                                                                                    </tr>
                                                                                </table>
                                                                            </td>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                                <table class="row row-2" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; margin-top: 5px; mso-table-rspace: 0pt;">
                                                    <tbody>
                                                        <tr>
                                                            <td>
                                                                <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #000000; width: 600px;" width="600">
                                                                    <tbody>
                                                                        <tr>
                                                                            <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; padding-top: 5px; padding-bottom: 5px; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                                                <table class="image_block block-1" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                                                    <tr>
                                                                                        <td class="pad" style="width:100%;padding-right:0px;padding-left:0px;">
                                                                                            <div class="alignment" align="center" style="line-height:10px"><img src="https://api.wearaware.co/uploads/mail.png" style="display: block; height: auto; border: 0; width: 90px; max-width: 100%;" width="90"></div>
                                                                                        </td>
                                                                                    </tr>
                                                                                </table>
                                                                            </td>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                                <table class="row row-3" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                    <tbody>
                                                        <tr>
                                                            <td>
                                                                <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #7f8399; width: 600px;" width="600">
                                                                    <tbody>
                                                                        <tr>
                                                                            <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 15pt; font-weight: 400; text-align: left; padding-left: 20px; padding-right: 20px; vertical-align: top; padding-top: 5px; padding-bottom: 5px; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                                                <table class="text_block block-1" width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                                                                    <tr>
                                                                                        <td class="pad">
                                                                                            <div style="font-family: sans-serif">
                                                                                                <div class style="font-size: 12px; font-family: 'Inter', sans-serif; mso-line-height-alt: 14.399999999999999px; color: #555555; line-height: 1.2;">
                                                                                                    <p style="margin: 0; margin-bottom: 20px; font-size: 14px; text-align: center; mso-line-height-alt: 16.8px;"><span style="color:#000000;"><strong><span style=" font-size: 1.5em;">Email Verification</span></strong></span></p>
                                                                                                </div>
                                                                                            </div>
                                                                                        </td>
                                                                                    </tr>
                                                                                </table>
                                                                                <table class="paragraph_block block-2" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                                                                    <tr>
                                                                                        <td class="pad">
                                                                                            <div style="color:#7f8399;direction:ltr;font-family: 'Inter', sans-serif;font-size: 14px;font-weight:400;letter-spacing:0px;line-height:120%;text-align:left;mso-line-height-alt:19.2px;">
                                                                                                <p style="margin: 0; margin-bottom: 16px;"><span>Greetings from Aware™.</span></p>
                                                                                                <p style="margin: 0;"><span>Thanks for starting the new account creation process. We want to make sure it's really you. Please click the button below to activate your account and proceed with the registration. If you don’t want to create an account, you can ignore this message.</span></p>
                                                                                                <div class="alignment" align="center"><!--[if mso]><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${verificationaddress}" style="height:32px;width:170px;v-text-anchor:middle;" arcsize="75%" stroke="false" fillcolor="#0352C9"><w:anchorlock/><v:textbox inset="0px,0px,0px,0px"><center style="color:#ffffff; font-family:Arial, sans-serif; font-size:16px"><![endif]--><a href="${verificationaddress}" target="_blank" style="text-decoration:none;display:inline-block;color:#ffffff;background-color:#0352C9;border-radius:24px;width:auto;border-top:0px solid transparent;font-weight:400;border-right:0px solid transparent;border-bottom:0px solid transparent;border-left:0px solid transparent;padding-top:0px;padding-bottom:0px;font-family: 'Inter', sans-serif;text-align:center;mso-border-alt:none;word-break:keep-all;"><span style="padding-left:25px;padding-right:25px;font-size:14px;display:inline-block;letter-spacing:normal;"><span style="font-family: 'Inter', sans-serif; line-height: 32px;">Verify Email Address</span></span></a><!--[if mso]></center></v:textbox></v:roundrect><![endif]--></div>
                                                                                                <p style="margin: 0;">&nbsp;</p>
                                                                                                <p style="margin: 0;"><span>If you have issue with viewing the above button, try to copy and paste the link below in your web browser. </span></p>
                                                                                                <p style="margin: 0;">&nbsp;</p>
                                                                                                <p style="margin: 0; color: #000000;"><span><b>Activation Link:</b></span></p>
                                                                                              
                                                                                                <p style="margin: 0;"><span><a style="text-decoration: underline; color: #0352C9;" href="${verificationaddress}">${verificationaddress}</a></span></p>
                                                                                            </div>
                                                                                        </td>
                                                                                    </tr>
                                                                                </table>
                                                                                
                                                                                <table class="paragraph_block block-4" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                                                                    <tr>
                                                                                        <td class="pad">
                                                                                            <div style="color:#7f8399;direction:ltr;font-family:'Open Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif;font-size: 14px;font-weight:400;letter-spacing:0px;line-height:120%;text-align:left;mso-line-height-alt:19.2px;">
                                                                                                <p style="margin: 0;">&nbsp;</p>
                                                                                                <p style="margin: 0;"><strong><span style="color: #000000;">Contact us:&nbsp;</span></strong><a href="mailto:support@wearaware.co" style="text-decoration: none; color: #7f8399;">support@wearaware.co</a></p>
                                                                                                <p style="margin: 0;">&nbsp;</p>
                                                                                            </div>
                                                                                        </td>
                                                                                    </tr>
                                                                                </table>
                                                                            </td>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </td>
                                        </tr>
                                    </table>
                                    <table class="row row-4" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                            <tbody>
                              <tr>
                                <td>
                                  <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #7f8399; width: 600px;" width="600">
                                    <tbody>
                                      <tr>
                                        <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; padding-top: 5px; padding-bottom: 5px; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                          <table class="text_block block-1" width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                            <tr>
                                              <td class="pad" style="padding: 10px 0;">
                                                <div style="font-family: sans-serif">
                                                  <div class style="font-size: 13px; font-family: 'Inter', sans-serif; mso-line-height-alt: 14.399999999999999px; color: #7f8399; line-height: 1.2;">
                                                    <p style="margin: 0; font-size: 13px; text-align: center; mso-line-height-alt: 16.8px; color: #7f8399; "><span style="font-size:13px;">This message was produced and distributed by the Aware™ Platform, The Netherlands. All rights reserved. Aware™ is a registered trademark of The Movement IP BV. View our&nbsp;<a href="https://www.iubenda.com/privacy-policy/31166669/full-legal" target="_blank"  style="text-decoration: underline; color: #0352C9;" >privacy policy</a>.</span></p>
                                                  </div>
                                                </div>
                                              </td>
                                            </tr>
                                          </table>
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                                
                      </tr>
                    </tbody>
                  </table><!-- End -->
                </body>
                
                </html>`};
              sgMail
                .send(msg)
                .then(() => {
                  return callback('success');
                })
                .catch((error) => {
                  // loggerhandler.logger.error(`${error} ,email:${req.headers.email}`);
                  if (error.response) {
                    const { message, code, response } = error;
                    const { headers, body } = response;
                    console.log("Error", error)
                    return callback(null);
                  }
                });
            }
          }
        );
      }
    })
  },

  sendForgetPasswordMail: function (emailaddress, callback) {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(emailaddress, salt);
    const random = bcrypt.hashSync("welcome-to-Aware-it-must-be-finished-on-time", salt);
    var expirationtime = Date.now() + 300000;

    sessionStorage.findOne({ email: emailaddress }, async function (err, session) {
      if (err) { loggerhandler.logger.error(`${err} ,email:${req.headers.email}`); return callback(null); }

      var currentyear = new Date().getFullYear()
      var NextYear = new Date().getFullYear() + 1
      var year = currentyear + '-' + NextYear;


      var account = await account_details.findOne({ email: emailaddress }).catch((ex) => { loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`); return callback(null); });

      var username = `${account.first_name} ${account.last_name}`;


      if (session) {
        sessionStorage.deleteOne({ email: emailaddress }, function (err, sessionremoved) {

          if (err) { loggerhandler.logger.error(`${err} ,email:${req.headers.email}`); return callback(null); }

          sessionStorage.create(
            { email: emailaddress, linkexpirationtime: expirationtime, hash: hash },
            function (err, result) {
              if (err) { loggerhandler.logger.error(`${err} ,email:${req.headers.email}`); return callback(null); }
              if (result) {
                var verificationaddress =
                  process.env.DOMAIN + "/reset-password?ue=" + hash +
                  "&ex=" + expirationtime + "&gt=" + random;
                const msg = {
                  from: sender_identity,
                  to: emailaddress,
                  subject:
                    "Mail - Recover Password",
                  html: `<!DOCTYPE html>
                  <html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">
                  
                  <head>
                    <title></title>
                    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch><o:AllowPNG/></o:OfficeDocumentSettings></xml><![endif]-->
                    <!--[if !mso]><!-->
                          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500&display=swap" rel="stylesheet">
                    <!--<![endif]-->
                    <style>
                      * {
                        box-sizing: border-box;
                      }
                  
                      body {
                        margin: 0;
                        padding: 0; background: #f2f2f2;
                      }
                  
                      a[x-apple-data-detectors] {
                        color: inherit !important;
                        text-decoration: inherit !important;
                      }
                  
                      #MessageViewBody a {
                        color: inherit;
                        text-decoration: none;
                      }
                  
                      p {
                        line-height: inherit
                      }
                          ul li{line-height: 23px;}
                  
                      .desktop_hide,
                      .desktop_hide table {
                        mso-hide: all;
                        display: none;
                        max-height: 0px;
                        overflow: hidden;
                      }
                  
                      @media (max-width:620px) {
                        .desktop_hide table.icons-inner {
                          display: inline-block !important;
                        }
                  
                        .icons-inner {
                          text-align: center;
                        }
                  
                        .icons-inner td {
                          margin: 0 auto;
                        }
                  
                        .row-content {
                          width: 100% !important;
                        }
                  
                        .mobile_hide {
                          display: none;
                        }
                  
                        .stack .column {
                          width: 100%;
                          display: block;
                        }
                  
                        .mobile_hide {
                          min-height: 0;
                          max-height: 0;
                          max-width: 0;
                          overflow: hidden;
                          font-size: 0px;
                        }
                  
                        .desktop_hide,
                        .desktop_hide table {
                          display: table !important;
                          max-height: none !important;
                        }
                      }
                    </style>
                  </head>
                  
                  <body style="background: #f2f2f2; margin: 0; padding: 0; -webkit-text-size-adjust: none; text-size-adjust: none;">
                    <table class="nl-container" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background: #f2f2f2;" >
                      <tbody>
                        <tr>
                          <td>
                                      <p>&nbsp;</p>
                                      <table style="background: #ffffff; box-shadow:0px 0px 10px #0000003b;  border-radius: 5px; mso-table-lspace: 0pt; width: 600px; margin-top: 50px; mso-table-rspace: 0pt; " align="center" width="600" border="0" cellpadding="0" cellspacing="0" >
                                          <tr>
                                              <td >
                                                  <table class="row row-1" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                      <tbody>
                                                          <tr>
                                                              <td>
                                                                  <p style="margin: 0;">&nbsp;</p>
                                                                  <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #000000; width: 600px;" width="600">
                                                                      <tbody>
                                                                          <tr>
                                                                              <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; padding-top: 5px; padding-bottom: 5px; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                                                  <table class="image_block block-1" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                                                      <tr>
                                                                                          <td class="pad" style="width:100%;padding-right:0px;padding-left:0px;">
                                                                                              <div class="alignment" align="center" style="line-height:10px"><img src="https://api.wearaware.co/uploads/aware-logo-new-mail.png" style="display: block; height: auto; border: 0; width: 200px; max-width: 100%;" width="200"></div>
                                                                                          </td>
                                                                                      </tr>
                                                                                  </table>
                                                                              </td>
                                                                          </tr>
                                                                      </tbody>
                                                                  </table>
                                                              </td>
                                                          </tr>
                                                      </tbody>
                                                  </table>
                                                  <table class="row row-2" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; margin-top: 5px; mso-table-rspace: 0pt;">
                                                      <tbody>
                                                          <tr>
                                                              <td>
                                                                  <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #000000; width: 600px;" width="600">
                                                                      <tbody>
                                                                          <tr>
                                                                              <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; padding-top: 5px; padding-bottom: 5px; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                                                  <table class="image_block block-1" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                                                      <tr>
                                                                                          <td class="pad" style="width:100%;padding-right:0px;padding-left:0px;">
                                                                                              <div class="alignment" align="center" style="line-height:10px"><img src="https://api.wearaware.co/uploads/mail.png" style="display: block; height: auto; border: 0; width: 90px; max-width: 100%;" width="90"></div>
                                                                                          </td>
                                                                                      </tr>
                                                                                  </table>
                                                                              </td>
                                                                          </tr>
                                                                      </tbody>
                                                                  </table>
                                                              </td>
                                                          </tr  >
                                                      </tbody>
                                                  </table>
                                                  <table class="row row-3" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                      <tbody>
                                                          <tr>
                                                              <td>
                                                                  <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #7f8399; width: 600px;" width="600">
                                                                      <tbody>
                                                                          <tr>
                                                                              <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 15pt; font-weight: 400; text-align: left; padding-left: 20px; padding-right: 20px; vertical-align: top; padding-top: 5px; padding-bottom: 5px; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                                                  <table class="text_block block-1" width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                                                                      <tr>
                                                                                          <td class="pad">
                                                                                              <div style="font-family: sans-serif">
                                                                                                  <div class style="font-size: 12px; font-family: 'Inter', sans-serif; mso-line-height-alt: 14.399999999999999px; color: #555555; line-height: 1.2;">
                                                                                                      <p style="margin: 0; margin-bottom: 20px; font-size: 14px; text-align: center; mso-line-height-alt: 16.8px;"><span style="color:#000000;"><strong><span style="    font-size: 1.5em;">Reset Password</span></strong></span></p>
                                                                                                  </div>
                                                                                              </div>
                                                                                          </td>
                                                                                      </tr>
                                                                                  </table>
                                                                                  <table class="paragraph_block block-2" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                                                                      <tr>
                                                                                          <td class="pad">
                                                                                              <div style="color:#7f8399;direction:ltr;font-family: 'Inter', sans-serif;font-size: 14px;font-weight:400;letter-spacing:0px;line-height:120%;text-align:left;mso-line-height-alt:19.2px;">
                                                                                                  <p style="margin: 0; margin-bottom: 16px;"><span>Greetings from Aware™.</span></p>
                                                                                                  <p style="margin: 0;"><span>We received a request to reset the password for the Aware™ account associated with this e-mail address. Click the button below to reset your password using our secure server:</span></p>
                                                                                                  <p style="margin: 0;">&nbsp;</p>
                  
                                                                                                  <div class="alignment" align="center"><!--[if mso]><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${verificationaddress}" style="height:32px;width:170px;v-text-anchor:middle;" arcsize="75%" stroke="false" fillcolor="#0352C9"><w:anchorlock/><v:textbox inset="0px,0px,0px,0px"><center style="color:#ffffff; font-family:Arial, sans-serif; font-size:16px"><![endif]--><a href="${verificationaddress}" target="_blank" style="text-decoration:none;display:inline-block;color:#ffffff;background-color:#0352C9;border-radius:24px;width:auto;border-top:0px solid transparent;font-weight:400;border-right:0px solid transparent;border-bottom:0px solid transparent;border-left:0px solid transparent;padding-top:0px;padding-bottom:0px;font-family: 'Inter', sans-serif;text-align:center;mso-border-alt:none;word-break:keep-all;"><span style="padding-left:25px;padding-right:25px;font-size:14px;display:inline-block;letter-spacing:normal;"><span style="font-family: 'Inter', sans-serif; line-height: 32px;">Change Password</span></span></a><!--[if mso]></center></v:textbox></v:roundrect><![endif]--></div>
                                                                                                  <p style="margin: 0;">&nbsp;</p>
                                                                                                  <p style="margin: 0;"><span>If you have issue with viewing the above button, try to copy and paste the link below in your web browser:</span></p>
                                                                                                  
                                                                                                  
                                                                                                  <p style="margin: 0;">&nbsp;</p>
                                                                                                  <p style="margin: 0;"><span><a style="text-decoration: underline; color: #0352C9;" href="${verificationaddress}">${verificationaddress}</a></span></p>
                                                                                                  <p style="margin: 0;">&nbsp;</p>
                                                                                                  <p style="margin: 0;"><span>If clicking the link doesn't work, you can copy and paste the link into your web browser's address bar. You will be able to create a new password for your Aware™ account after clicking the link above.
                                                                                                  </span></p>
                                                                                                  <p style="margin: 0;">&nbsp;</p>
                                                                                                  <p style="margin: 0;"><span>If you did not request to have your password reset, you can safely ignore this email. Rest assured your Aware™ account is safe.</span></p>
                                                                                                  <p style="margin: 0;">&nbsp;</p>
                                                                                                  <p style="margin: 0;"><span>Aware™ will never email you and ask you to disclose or verify your password, credit card, or banking account number. If you receive a suspicious email with a link to update your account information, do not click on the link. Instead, report the e-mail to Aware™ for investigation. </span></p>
                                                                                              </div>
                                                                                          </td>
                                                                                      </tr>
                                                                                  </table>
                                                                                  
                                                                                  <table class="paragraph_block block-4" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                                                                      <tr>
                                                                                          <td class="pad">
                                                                                              <div style="color:#7f8399;direction:ltr;font-family:'Open Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif;font-size: 14px;font-weight:400;letter-spacing:0px;line-height:120%;text-align:left;mso-line-height-alt:19.2px;">
                                                                                                  <p style="margin: 0;">&nbsp;</p>
                                                                                                  <p style="margin: 0;"><strong><span style="color: #000000;">Contact us:&nbsp;</span></strong><a href="mailto:support@wearaware.co" style="text-decoration: none; color: #7f8399;">support@wearaware.co</a></p>
                                                                                                  <p style="margin: 0;">&nbsp;</p>
                                                                                              </div>
                                                                                          </td>
                                                                                      </tr>
                                                                                  </table>
                                                                              </td>
                                                                          </tr>
                                                                      </tbody>
                                                                  </table>
                                                              </td>
                                                          </tr>
                                                      </tbody>
                                                  </table>
                                              </td>
                                          </tr>
                                      </table>
                                      <table class="row row-4" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                              <tbody>
                                <tr>
                                  <td>
                                    <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #7f8399; width: 600px;" width="600">
                                      <tbody>
                                        <tr>
                                          <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; padding-top: 5px; padding-bottom: 5px; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                            <table class="text_block block-1" width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                              <tr>
                                                <td class="pad" style="padding: 10px 0;">
                                                  <div style="font-family: sans-serif">
                                                    <div class style="font-size: 13px; font-family: 'Inter', sans-serif; mso-line-height-alt: 14.399999999999999px; color: #7f8399; line-height: 1.2;">
                                                      <p style="margin: 0; font-size: 13px; text-align: center; mso-line-height-alt: 16.8px; color: #7f8399; "><span style="font-size:13px;">This message was produced and distributed by the Aware™ Platform, The Netherlands. All rights reserved. Aware™ is a registered trademark of The Movement IP BV. View our&nbsp;<a href="https://www.iubenda.com/privacy-policy/31166669/full-legal"  target="_blank" style="text-decoration: underline; color: #0352C9;" >privacy policy</a>.</span></p>
                                                    </div>
                                                  </div>
                                                </td>
                                              </tr>
                                            </table>
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </td>
                                  
                        </tr>
                      </tbody>
                    </table><!-- End -->
                  </body>
                  
                  </html>`
                };
                sgMail
                  .send(msg)
                  .then(() => {
                    return callback('success');
                  })
                  .catch((error) => {
                    loggerhandler.logger.error(`${error} ,email:${req.headers.email}`);
                    if (error.response) {
                      const { message, code, response } = error;
                      const { headers, body } = response;
                      return callback(null);
                    }
                  });
              }
            }
          );
        })
      }
      else {
        sessionStorage.create(
          { email: emailaddress, linkexpirationtime: expirationtime, hash: hash },
          function (err, result) {
            if (err) { loggerhandler.logger.error(`${err} ,email:${req.headers.email}`); return callback(null); }
            if (result) {
              var verificationaddress =
                process.env.DOMAIN + "/reset-password?ue=" + hash +
                "&ex=" + expirationtime + "&gt=" + random;
              const msg = {
                from: sender_identity,
                to: emailaddress,
                subject:
                  "Mail - Recover Password",
                html: `<!DOCTYPE html>
                <html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">
                
                <head>
                  <title></title>
                  <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch><o:AllowPNG/></o:OfficeDocumentSettings></xml><![endif]-->
                  <!--[if !mso]><!-->
                        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500&display=swap" rel="stylesheet">
                  <!--<![endif]-->
                  <style>
                    * {
                      box-sizing: border-box;
                    }
                
                    body {
                      margin: 0;
                      padding: 0; background: #f2f2f2;
                    }
                
                    a[x-apple-data-detectors] {
                      color: inherit !important;
                      text-decoration: inherit !important;
                    }
                
                    #MessageViewBody a {
                      color: inherit;
                      text-decoration: none;
                    }
                
                    p {
                      line-height: inherit
                    }
                        ul li{line-height: 23px;}
                
                    .desktop_hide,
                    .desktop_hide table {
                      mso-hide: all;
                      display: none;
                      max-height: 0px;
                      overflow: hidden;
                    }
                
                    @media (max-width:620px) {
                      .desktop_hide table.icons-inner {
                        display: inline-block !important;
                      }
                
                      .icons-inner {
                        text-align: center;
                      }
                
                      .icons-inner td {
                        margin: 0 auto;
                      }
                
                      .row-content {
                        width: 100% !important;
                      }
                
                      .mobile_hide {
                        display: none;
                      }
                
                      .stack .column {
                        width: 100%;
                        display: block;
                      }
                
                      .mobile_hide {
                        min-height: 0;
                        max-height: 0;
                        max-width: 0;
                        overflow: hidden;
                        font-size: 0px;
                      }
                
                      .desktop_hide,
                      .desktop_hide table {
                        display: table !important;
                        max-height: none !important;
                      }
                    }
                  </style>
                </head>
                
                <body style="background: #f2f2f2; margin: 0; padding: 0; -webkit-text-size-adjust: none; text-size-adjust: none;">
                  <table class="nl-container" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background: #f2f2f2;" >
                    <tbody>
                      <tr>
                        <td>
                                    <p>&nbsp;</p>
                                    <table style="background: #ffffff; box-shadow:0px 0px 10px #0000003b;  border-radius: 5px; mso-table-lspace: 0pt; width: 600px; margin-top: 50px; mso-table-rspace: 0pt; " align="center" width="600" border="0" cellpadding="0" cellspacing="0" >
                                        <tr>
                                            <td >
                                                <table class="row row-1" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                    <tbody>
                                                        <tr>
                                                            <td>
                                                                <p style="margin: 0;">&nbsp;</p>
                                                                <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #000000; width: 600px;" width="600">
                                                                    <tbody>
                                                                        <tr>
                                                                            <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; padding-top: 5px; padding-bottom: 5px; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                                                <table class="image_block block-1" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                                                    <tr>
                                                                                        <td class="pad" style="width:100%;padding-right:0px;padding-left:0px;">
                                                                                            <div class="alignment" align="center" style="line-height:10px"><img src="https://api.wearaware.co/uploads/aware-logo-new-mail.png" style="display: block; height: auto; border: 0; width: 200px; max-width: 100%;" width="200"></div>
                                                                                        </td>
                                                                                    </tr>
                                                                                </table>
                                                                            </td>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                                <table class="row row-2" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; margin-top: 5px; mso-table-rspace: 0pt;">
                                                    <tbody>
                                                        <tr>
                                                            <td>
                                                                <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #000000; width: 600px;" width="600">
                                                                    <tbody>
                                                                        <tr>
                                                                            <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; padding-top: 5px; padding-bottom: 5px; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                                                <table class="image_block block-1" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                                                    <tr>
                                                                                        <td class="pad" style="width:100%;padding-right:0px;padding-left:0px;">
                                                                                            <div class="alignment" align="center" style="line-height:10px"><img src="https://api.wearaware.co/uploads/mail.png" style="display: block; height: auto; border: 0; width: 90px; max-width: 100%;" width="90"></div>
                                                                                        </td>
                                                                                    </tr>
                                                                                </table>
                                                                            </td>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                                <table class="row row-3" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                    <tbody>
                                                        <tr>
                                                            <td>
                                                                <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #7f8399; width: 600px;" width="600">
                                                                    <tbody>
                                                                        <tr>
                                                                            <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 15pt; font-weight: 400; text-align: left; padding-left: 20px; padding-right: 20px; vertical-align: top; padding-top: 5px; padding-bottom: 5px; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                                                <table class="text_block block-1" width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                                                                    <tr>
                                                                                        <td class="pad">
                                                                                            <div style="font-family: sans-serif">
                                                                                                <div class style="font-size: 12px; font-family: 'Inter', sans-serif; mso-line-height-alt: 14.399999999999999px; color: #555555; line-height: 1.2;">
                                                                                                    <p style="margin: 0; margin-bottom: 20px; font-size: 14px; text-align: center; mso-line-height-alt: 16.8px;"><span style="color:#000000;"><strong><span style="    font-size: 1.5em;">Reset Password</span></strong></span></p>
                                                                                                </div>
                                                                                            </div>
                                                                                        </td>
                                                                                    </tr>
                                                                                </table>
                                                                                <table class="paragraph_block block-2" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                                                                    <tr>
                                                                                        <td class="pad">
                                                                                            <div style="color:#7f8399;direction:ltr;font-family: 'Inter', sans-serif;font-size: 14px;font-weight:400;letter-spacing:0px;line-height:120%;text-align:left;mso-line-height-alt:19.2px;">
                                                                                                <p style="margin: 0; margin-bottom: 16px;"><span>Greetings from Aware™.</span></p>
                                                                                                <p style="margin: 0;"><span>We received a request to reset the password for the Aware™ account associated with this e-mail address. Click the button below to reset your password using our secure server:</span></p>
                                                                                                <p style="margin: 0;">&nbsp;</p>
                
                                                                                                <div class="alignment" align="center"><!--[if mso]><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${verificationaddress}" style="height:32px;width:170px;v-text-anchor:middle;" arcsize="75%" stroke="false" fillcolor="#0352C9"><w:anchorlock/><v:textbox inset="0px,0px,0px,0px"><center style="color:#ffffff; font-family:Arial, sans-serif; font-size:16px"><![endif]--><a href="${verificationaddress}" target="_blank" style="text-decoration:none;display:inline-block;color:#ffffff;background-color:#0352C9;border-radius:24px;width:auto;border-top:0px solid transparent;font-weight:400;border-right:0px solid transparent;border-bottom:0px solid transparent;border-left:0px solid transparent;padding-top:0px;padding-bottom:0px;font-family: 'Inter', sans-serif;text-align:center;mso-border-alt:none;word-break:keep-all;"><span style="padding-left:25px;padding-right:25px;font-size:14px;display:inline-block;letter-spacing:normal;"><span style="font-family: 'Inter', sans-serif; line-height: 32px;">Change Password</span></span></a><!--[if mso]></center></v:textbox></v:roundrect><![endif]--></div>
                                                                                                <p style="margin: 0;">&nbsp;</p>
                                                                                                <p style="margin: 0;"><span>If you have issue with viewing the above button, try to copy and paste the link below in your web browser:</span></p>
                                                                                                
                                                                                                
                                                                                                <p style="margin: 0;">&nbsp;</p>
                                                                                                <p style="margin: 0;"><span><a style="text-decoration: underline; color: #0352C9;" href="${verificationaddress}">${verificationaddress}</a></span></p>
                                                                                                <p style="margin: 0;">&nbsp;</p>
                                                                                                <p style="margin: 0;"><span>If clicking the link doesn't work, you can copy and paste the link into your web browser's address bar. You will be able to create a new password for your Aware™ account after clicking the link above.
                                                                                                </span></p>
                                                                                                <p style="margin: 0;">&nbsp;</p>
                                                                                                <p style="margin: 0;"><span>If you did not request to have your password reset, you can safely ignore this email. Rest assured your Aware™ account is safe.</span></p>
                                                                                                <p style="margin: 0;">&nbsp;</p>
                                                                                                <p style="margin: 0;"><span>Aware™ will never email you and ask you to disclose or verify your password, credit card, or banking account number. If you receive a suspicious email with a link to update your account information, do not click on the link. Instead, report the e-mail to Aware™ for investigation. </span></p>
                                                                                            </div>
                                                                                        </td>
                                                                                    </tr>
                                                                                </table>
                                                                                
                                                                                <table class="paragraph_block block-4" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                                                                    <tr>
                                                                                        <td class="pad">
                                                                                            <div style="color:#7f8399;direction:ltr;font-family:'Open Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif;font-size: 14px;font-weight:400;letter-spacing:0px;line-height:120%;text-align:left;mso-line-height-alt:19.2px;">
                                                                                                <p style="margin: 0;">&nbsp;</p>
                                                                                                <p style="margin: 0;"><strong><span style="color: #000000;">Contact us:&nbsp;</span></strong><a href="mailto:support@wearaware.co" style="text-decoration: none; color: #7f8399;">support@wearaware.co</a></p>
                                                                                                <p style="margin: 0;">&nbsp;</p>
                                                                                            </div>
                                                                                        </td>
                                                                                    </tr>
                                                                                </table>
                                                                            </td>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </td>
                                        </tr>
                                    </table>
                                    <table class="row row-4" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                            <tbody>
                              <tr>
                                <td>
                                  <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #7f8399; width: 600px;" width="600">
                                    <tbody>
                                      <tr>
                                        <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; padding-top: 5px; padding-bottom: 5px; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                          <table class="text_block block-1" width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                            <tr>
                                              <td class="pad" style="padding: 10px 0;">
                                                <div style="font-family: sans-serif">
                                                  <div class style="font-size: 13px; font-family: 'Inter', sans-serif; mso-line-height-alt: 14.399999999999999px; color: #7f8399; line-height: 1.2;">
                                                    <p style="margin: 0; font-size: 13px; text-align: center; mso-line-height-alt: 16.8px; color: #7f8399; "><span style="font-size:13px;">This message was produced and distributed by the Aware™ Platform, The Netherlands. All rights reserved. Aware™ is a registered trademark of The Movement IP BV. View our&nbsp;<a href="https://www.iubenda.com/privacy-policy/31166669/full-legal"  target="_blank" style="text-decoration: underline; color: #0352C9;" >privacy policy</a>.</span></p>
                                                  </div>
                                                </div>
                                              </td>
                                            </tr>
                                          </table>
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                                
                      </tr>
                    </tbody>
                  </table><!-- End -->
                </body>
                
                </html>`
              };
              sgMail
                .send(msg)
                .then(() => {
                  return callback('success');
                })
                .catch((error) => {
                  loggerhandler.logger.error(`${error} ,email:${req.headers.email}`);
                  if (error.response) {
                    const { message, code, response } = error;
                    const { headers, body } = response;
                    return callback(null);
                  }
                });
            }
          }
        );
      }
    })
  },

  sendPasswordHasBeenChangedMail: async function (emailaddress, callback) {

    var currentyear = new Date().getFullYear()
    var NextYear = new Date().getFullYear() + 1;
    var year = currentyear + '-' + NextYear;

    var account = await account_details.findOne({ email: emailaddress }).catch((ex) => { loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`); return callback(null); });
    var username = `${account.first_name} ${account.last_name}`;

    console.log("username", username);
    const msg = {
      from: sender_identity,
      to: emailaddress,
      subject:
        "Mail - Password Successfully Changed",
      html: `<!DOCTYPE html>
      <html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">
      
      <head>
        <title></title>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch><o:AllowPNG/></o:OfficeDocumentSettings></xml><![endif]-->
        <!--[if !mso]><!-->
              <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500&display=swap" rel="stylesheet">
        <!--<![endif]-->
        <style>
          * {
            box-sizing: border-box;
          }
      
          body {
            margin: 0;
            padding: 0; background: #f2f2f2;
          }
      
          a[x-apple-data-detectors] {
            color: inherit !important;
            text-decoration: inherit !important;
          }
      
          #MessageViewBody a {
            color: inherit;
            text-decoration: none;
          }
      
          p {
            line-height: inherit
          }
              ul li{line-height: 23px;}
      
          .desktop_hide,
          .desktop_hide table {
            mso-hide: all;
            display: none;
            max-height: 0px;
            overflow: hidden;
          }
      
          @media (max-width:620px) {
            .desktop_hide table.icons-inner {
              display: inline-block !important;
            }
      
            .icons-inner {
              text-align: center;
            }
      
            .icons-inner td {
              margin: 0 auto;
            }
      
            .row-content {
              width: 100% !important;
            }
      
            .mobile_hide {
              display: none;
            }
      
            .stack .column {
              width: 100%;
              display: block;
            }
      
            .mobile_hide {
              min-height: 0;
              max-height: 0;
              max-width: 0;
              overflow: hidden;
              font-size: 0px;
            }
      
            .desktop_hide,
            .desktop_hide table {
              display: table !important;
              max-height: none !important;
            }
          }
        </style>
      </head>
      
      <body style="background: #f2f2f2; margin: 0; padding: 0; -webkit-text-size-adjust: none; text-size-adjust: none;">
        <table class="nl-container" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background: #f2f2f2;" >
          <tbody>
            <tr>
              <td>
                          <p>&nbsp;</p>
                          <table style="background: #ffffff; box-shadow:0px 0px 10px #0000003b;  border-radius: 5px; mso-table-lspace: 0pt; width: 600px; margin-top: 50px; mso-table-rspace: 0pt; " align="center" width="600" border="0" cellpadding="0" cellspacing="0" >
                              <tr>
                                  <td >
                                      <table class="row row-1" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                          <tbody>
                                              <tr>
                                                  <td>
                                                      <p style="margin: 0;">&nbsp;</p>
                                                      <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #000000; width: 600px;" width="600">
                                                          <tbody>
                                                              <tr>
                                                                  <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; padding-top: 5px; padding-bottom: 5px; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                                      <table class="image_block block-1" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                                          <tr>
                                                                              <td class="pad" style="width:100%;padding-right:0px;padding-left:0px;">
                                                                                  <div class="alignment" align="center" style="line-height:10px"><img src="https://api.wearaware.co/uploads/aware-logo-new-mail.png" style="display: block; height: auto; border: 0; width: 200px; max-width: 100%;" width="200"></div>
                                                                              </td>
                                                                          </tr>
                                                                      </table>
                                                                  </td>
                                                              </tr>
                                                          </tbody>
                                                      </table>
                                                  </td>
                                              </tr>
                                          </tbody>
                                      </table>
                                      <table class="row row-2" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; margin-top: 5px; mso-table-rspace: 0pt;">
                                          <tbody>
                                              <tr>
                                                  <td>
                                                      <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #000000; width: 600px;" width="600">
                                                          <tbody>
                                                              <tr>
                                                                  <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; padding-top: 5px; padding-bottom: 5px; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                                      <table class="image_block block-1" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                                          <tr>
                                                                              <td class="pad" style="width:100%;padding-right:0px;padding-left:0px;">
                                                                                  <div class="alignment" align="center" style="line-height:10px"><img src="https://api.wearaware.co/uploads/mail.png" style="display: block; height: auto; border: 0; width: 90px; max-width: 100%;" width="90"></div>
                                                                              </td>
                                                                          </tr>
                                                                      </table>
                                                                  </td>
                                                              </tr>
                                                          </tbody>
                                                      </table>
                                                  </td>
                                              </tr>
                                          </tbody>
                                      </table>
                                      <table class="row row-3" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                          <tbody>
                                              <tr>
                                                  <td>
                                                      <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #7f8399; width: 600px;" width="600">
                                                          <tbody>
                                                              <tr>
                                                                  <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 15pt; font-weight: 400; text-align: left; padding-left: 20px; padding-right: 20px; vertical-align: top; padding-top: 5px; padding-bottom: 5px; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                                      <table class="text_block block-1" width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                                                          <tr>
                                                                              <td class="pad">
                                                                                  <div style="font-family: sans-serif">
                                                                                      <div class style="font-size: 12px; font-family: 'Inter', sans-serif; mso-line-height-alt: 14.399999999999999px; color: #555555; line-height: 1.2;">
                                                                                          <p style="margin: 0; margin-bottom: 20px; font-size: 14px; text-align: center; mso-line-height-alt: 16.8px;"><span style="color:#000000;"><strong><span style="    font-size: 1.5em;">Password Changed</span></strong></span></p>
                                                                                      </div>
                                                                                  </div>
                                                                              </td>
                                                                          </tr>
                                                                      </table>
                                                                      <table class="paragraph_block block-2" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                                                          <tr>
                                                                              <td class="pad">
                                                                                  <div style="color:#7f8399;direction:ltr;font-family: 'Inter', sans-serif;font-size: 14px;font-weight:400;letter-spacing:0px;line-height:120%;text-align:left;mso-line-height-alt:19.2px;">
                                                                                      <p style="margin: 0; margin-bottom: 16px;"><span>Greetings from Aware™.</span></p>
                                                                                      <p style="margin: 0;"><span>Your password have been successfully changed. You can login now with your new password.</span></p>
                                                                                      <p style="margin: 0;">&nbsp;</p>
                                                                                      <p style="margin: 0;"><span>If you did made this request, you can safely ignore this email. Rest assured your Aware™ account is safe.</span></p>
                                                                                  </div>
                                                                              </td>
                                                                          </tr>
                                                                      </table>
                                                                      
                                                                      <table class="paragraph_block block-4" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                                                          <tr>
                                                                              <td class="pad">
                                                                                  <div style="color:#7f8399;direction:ltr;font-family:'Open Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif;font-size: 14px;font-weight:400;letter-spacing:0px;line-height:120%;text-align:left;mso-line-height-alt:19.2px;">
                                                                                      <p style="margin: 0;">&nbsp;</p>
                                                                                      <p style="margin: 0;"><strong><span style="color: #000000;">Contact us:&nbsp;</span></strong><a href="mailto:support@wearaware.co" style="text-decoration: none; color: #7f8399;">support@wearaware.co</a></p>
                                                                                      <p style="margin: 0;">&nbsp;</p>
                                                                                  </div>
                                                                              </td>
                                                                          </tr>
                                                                      </table>
                                                                  </td>
                                                              </tr>
                                                          </tbody>
                                                      </table>
                                                  </td>
                                              </tr>
                                          </tbody>
                                      </table>
                                  </td>
                              </tr>
                          </table>
                          <table class="row row-4" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                  <tbody>
                    <tr>
                      <td>
                        <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #7f8399; width: 600px;" width="600">
                          <tbody>
                            <tr>
                              <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; padding-top: 5px; padding-bottom: 5px; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                <table class="text_block block-1" width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                  <tr>
                                    <td class="pad" style="padding: 10px 0;">
                                      <div style="font-family: sans-serif">
                                        <div class style="font-size: 13px; font-family: 'Inter', sans-serif; mso-line-height-alt: 14.399999999999999px; color: #7f8399; line-height: 1.2;">
                                          <p style="margin: 0; font-size: 13px; text-align: center; mso-line-height-alt: 16.8px; color: #7f8399; "><span style="font-size:13px;">This message was produced and distributed by the Aware™ Platform, The Netherlands. All rights reserved. Aware™ is a registered trademark of The Movement IP BV. View our&nbsp;<a href="https://www.iubenda.com/privacy-policy/31166669/full-legal" target="_blank"  style="text-decoration: underline; color: #0352C9;" >privacy policy</a>.</span></p>
                                        </div>
                                      </div>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
                      
            </tr>
          </tbody>
        </table><!-- End -->
      </body>
      
      </html>`
    };
    sgMail
      .send(msg)
      .then(() => {
        return callback('success');
      })
      .catch((error) => {
        loggerhandler.logger.error(`${error} ,email:${req.headers.email}`);
        if (error.response) {
          const { message, code, response } = error;
          const { headers, body } = response;
          return callback(null);
        }
      });

  },

  sendKycSubmissionMail: function (emailaddress, callback) {

    var currentyear = new Date().getFullYear()
    var NextYear = new Date().getFullYear() + 1
    var year = currentyear + '-' + NextYear;


    const msg = {
      from: sender_identity,
      to: emailaddress,
      subject:
        "Your KYC is under verification",
      html: `<!DOCTYPE html>
      <html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">
      
      <head>
        <title></title>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch><o:AllowPNG/></o:OfficeDocumentSettings></xml><![endif]-->
        <!--[if !mso]><!-->
              <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500&display=swap" rel="stylesheet">
        <!--<![endif]-->
        <style>
          * {
            box-sizing: border-box;
          }
      
          body {
            margin: 0;
            padding: 0; background: #f2f2f2;
          }
      
          a[x-apple-data-detectors] {
            color: inherit !important;
            text-decoration: inherit !important;
          }
      
          #MessageViewBody a {
            color: inherit;
            text-decoration: none;
          }
      
          p {
            line-height: inherit
          }
              ul li{line-height: 23px;}
      
          .desktop_hide,
          .desktop_hide table {
            mso-hide: all;
            display: none;
            max-height: 0px;
            overflow: hidden;
          }
      
          @media (max-width:620px) {
            .desktop_hide table.icons-inner {
              display: inline-block !important;
            }
      
            .icons-inner {
              text-align: center;
            }
      
            .icons-inner td {
              margin: 0 auto;
            }
      
            .row-content {
              width: 100% !important;
            }
      
            .mobile_hide {
              display: none;
            }
      
            .stack .column {
              width: 100%;
              display: block;
            }
      
            .mobile_hide {
              min-height: 0;
              max-height: 0;
              max-width: 0;
              overflow: hidden;
              font-size: 0px;
            }
      
            .desktop_hide,
            .desktop_hide table {
              display: table !important;
              max-height: none !important;
            }
          }
        </style>
      </head>
      
      <body style="background: #f2f2f2; margin: 0; padding: 0; -webkit-text-size-adjust: none; text-size-adjust: none;">
        <table class="nl-container" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background: #f2f2f2;" >
          <tbody>
            <tr>
              <td>
                          <p>&nbsp;</p>
                          <table style="background: #ffffff; box-shadow:0px 0px 10px #0000003b;  border-radius: 5px; mso-table-lspace: 0pt; width: 600px; margin-top: 50px; mso-table-rspace: 0pt; " align="center" width="600" border="0" cellpadding="0" cellspacing="0" >
                              <tr>
                                  <td >
                                      <table class="row row-1" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt;  mso-table-rspace: 0pt;">
                                          <tbody>
                                              <tr>
                                                  <td>
                                                      <p style="margin: 0;">&nbsp;</p>
                                                      <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #000000; width: 600px;" width="600">
                                                          <tbody>
                                                              <tr>
                                                                  <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; padding-top: 5px; padding-bottom: 5px; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                                      <table class="image_block block-1" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                                          <tr>
                                                                              <td class="pad" style="width:100%;padding-right:0px;padding-left:0px;">
                                                                                  <div class="alignment" align="center" style="line-height:10px"><img src="https://api.wearaware.co/uploads/aware-logo-new-mail.png" style="display: block; height: auto; border: 0; width: 200px; max-width: 100%;" width="200"></div>
                                                                              </td>
                                                                          </tr>
                                                                      </table>
                                                                  </td>
                                                              </tr>
                                                          </tbody>
                                                      </table>
                                                  </td>
                                              </tr>
                                          </tbody>
                                      </table>
                                      <table class="row row-2" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; margin-top: 5px; mso-table-rspace: 0pt;">
                                          <tbody>
                                              <tr>
                                                  <td>
                                                      <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #000000; width: 600px;" width="600">
                                                          <tbody>
                                                              <tr>
                                                                  <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; padding-top: 5px; padding-bottom: 5px; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                                      <table class="image_block block-1" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                                          <tr>
                                                                              <td class="pad" style="width:100%;padding-right:0px;padding-left:0px;">
                                                                                  <div class="alignment" align="center" style="line-height:10px"><img src="https://api.wearaware.co/uploads/mail.png" style="display: block; height: auto; border: 0; width: 90px; max-width: 100%;" width="90"></div>
                                                                              </td>
                                                                          </tr>
                                                                      </table>
                                                                  </td>
                                                              </tr>
                                                          </tbody>
                                                      </table>
                                                  </td>
                                              </tr>
                                          </tbody>
                                      </table>
                                      <table class="row row-3" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                          <tbody>
                                              <tr>
                                                  <td>
                                                      <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #7f8399; width: 600px;" width="600">
                                                          <tbody>
                                                              <tr>
                                                                  <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 15pt; font-weight: 400; text-align: left; padding-left: 20px; padding-right: 20px; vertical-align: top; padding-top: 5px; padding-bottom: 5px; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                                      <table class="text_block block-1" width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                                                          <tr>
                                                                              <td class="pad">
                                                                                  <div style="font-family: sans-serif">
                                                                                      <div class style="font-size: 12px; font-family: 'Inter', sans-serif; mso-line-height-alt: 14.399999999999999px; color: #555555; line-height: 1.2;">
                                                                                          <p style="margin: 0; margin-bottom: 20px; font-size: 14px; text-align: center; mso-line-height-alt: 16.8px;"><span style="color:#000000;"><strong><span style="    font-size: 1.5em;">KYC Submitted</span></strong></span></p>
                                                                                      </div>
                                                                                  </div>
                                                                              </td>
                                                                          </tr>
                                                                      </table>
                                                                      <table class="paragraph_block block-2" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                                                          <tr>
                                                                              <td class="pad">
                                                                                  <div style="color:#7f8399;direction:ltr;font-family: 'Inter', sans-serif;font-size: 14px;font-weight:400;letter-spacing:0px;line-height:120%;text-align:left;mso-line-height-alt:19.2px;">
                                                                                      <p style="margin: 0; margin-bottom: 16px;"><span>Greetings from Aware™.</span></p>
                                                                                      <p style="margin: 0;"><span>Thanks for submitting your company info (KYC). What's next:</span></p>
                                                                                      <p style="margin: 0;">&nbsp;</p>
                                                                                      <ol style="margin: 0; padding: 0; margin-left: 20px; list-style-type: decimal; color: #7f8399; direction: ltr; font-family: 'Inter', sans-serif; font-size: 14px;font-weight: 400; letter-spacing: 0px; line-height: 120%; text-align: left;">
                                                                                          <li style="margin-bottom: 0px; line-height: 23px;">Your info is being reviewed by our integrity department.</li>
                                                                                          <li style="margin-bottom: 0px; line-height: 23px;">If still some questions we will get back to you.</li>
                                                                                          <li style="line-height: 23px;">If approved, we will create your account on the Aware™ Platform, create your Digital Wallet on IoTex blockchain and send your login info by email.</li>
                                                                                      </ol>
                                                                                  </div>
                                                                              </td>
                                                                          </tr>
                                                                      </table>
                                                                      
                                                                      <table class="paragraph_block block-4" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                                                          <tr>
                                                                              <td class="pad">
                                                                                  <div style="color:#7f8399;direction:ltr;font-family:'Open Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif;font-size: 14px;font-weight:400;letter-spacing:0px;line-height:120%;text-align:left;mso-line-height-alt:19.2px;">
                                                                                      <p style="margin: 0;">&nbsp;</p>
                                                                                      <p style="margin: 0;"><strong><span style="color: #000000;">Contact us:&nbsp;</span></strong><a href="mailto:support@wearaware.co" style="text-decoration: none; color: #7f8399;">support@wearaware.co</a></p>
                                                                                      <p style="margin: 0;">&nbsp;</p>
                                                                                  </div>
                                                                              </td>
                                                                          </tr>
                                                                      </table>
                                                                  </td>
                                                              </tr>
                                                          </tbody>
                                                      </table>
                                                  </td>
                                              </tr>
                                          </tbody>
                                      </table>
                                  </td>
                              </tr>
                          </table>
                          <table class="row row-4" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                  <tbody>
                    <tr>
                      <td>
                        <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #7f8399; width: 600px;" width="600">
                          <tbody>
                            <tr>
                              <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; padding-top: 5px; padding-bottom: 5px; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                <table class="text_block block-1" width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                  <tr>
                                    <td class="pad" style="padding: 10px 0;">
                                      <div style="font-family: sans-serif">
                                        <div class style="font-size: 13px; font-family: 'Inter', sans-serif; mso-line-height-alt: 14.399999999999999px; color: #7f8399; line-height: 1.2;">
                                          <p style="margin: 0; font-size: 13px; text-align: center; mso-line-height-alt: 16.8px; color: #7f8399; "><span style="font-size:13px;">This message was produced and distributed by the Aware™ Platform, The Netherlands. All rights reserved. Aware™ is a registered trademark of The Movement IP BV. View our&nbsp;<a href="https://www.iubenda.com/privacy-policy/31166669/full-legal" target="_blank"  style="text-decoration: underline; color: #0352C9;" >privacy policy</a>.</span></p>
                                        </div>
                                      </div>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
                      
            </tr>
          </tbody>
        </table><!-- End -->
      </body>
      
      </html>`
    };
    sgMail
      .send(msg)
      .then(() => {
        return callback('success');
      })
      .catch((error) => {
        loggerhandler.logger.error(`${error} ,email:${req.headers.email}`);
        if (error.response) {
          const { message, code, response } = error;
          const { headers, body } = response;
          return callback(null);
        }
      });

  },

  sendSubscriptionMail: function (emailaddress, callback) {

    var currentyear = new Date().getFullYear();
    var NextYear = new Date().getFullYear() + 1;
    var year = currentyear + '-' + NextYear;


    const msg = {
      from: "admin@trustrecruit.io",
      to: emailaddress,
      subject:
        "Welcome to TrustRecruit!",
      html: `<table style=" background: #0A1831; font-size: 14px; line-height: normal; font-weight: 400; color: #758698; width: 100%; height: 100vh;">
            <tbody><tr>
                <td >
                    <table style="width: 100%; max-width: 620px; margin: 0 auto;">
                        <tbody>
                            <tr>
                                <td style="text-align:center">
                                    <img style="height:150px" src="https://trustrecruit.io/assets/images/png/logo.png">
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <table style="width: 96%; max-width: 620px; margin: 0 auto; background: #FFFFFF; border: 1px solid #E6EFFB; border-bottom: 4px solid #0A1831; ">
                        <tbody>
                            <tr>
                                <td style="padding: 30px;">
                                    <h1 style="font-size: 25px;color: #0A1831; font-weight: 500; margin: 0; padding-top: 12px;  margin-bottom: 20px; "> Welcome to TrustRecruit!</h1>
                                    <p  style="font-size:13px;  margin: 5px 0">Thank you for submitting your interest on our website.</p>
                                    <p  style="font-size:13px;">We will be in touch with you by email to explain the process of how to buy TRT tokens very soon.</p>
                                    <p  style="font-size:13px; margin-bottom: 10px;">If you have any questions or queries please contact us at:
                                    <a style="color: #0A1831; font-weight: bold; text-decoration: none; word-break: break-all;" href="mailto:info@trustrecruit.io">info@trustrecruit.io</a></p>
                                    <p  style="font-size:13px; margin: 0;">Thanks</p>
                                    <p  style="font-size:13px; margin-top: 0;">TrustRecruit Investor Relations</p>
                                    <p  style="font-size:13px; margin-bottom: 0;">For latest updates follow us:</p>
                                    <p  style="font-size:13px;  margin: 0px 0">Twitter: <a style="color: #0A1831; font-weight: bold; text-decoration: none" href="https://twitter.com/trust_recruit">https://twitter.com/trust_recruit</a></p>
                                    <p  style="font-size:13px;  margin: 0px 0">Telegram Community: <a style="color: #0A1831; font-weight: bold; text-decoration: none" href="https://t.me/TrustRecruit">https://t.me/TrustRecruit</a></p>
                                    <p  style="font-size:13px;  margin: 0px 0">Telegram Announcement Channel: <a style="color: #0A1831; font-weight: bold; text-decoration: none" href="https://t.me/TrustRecruitAnn">https://t.me/TrustRecruitAnn</a></p>
                                    <p  style="font-size:13px;  margin: 0px 0">LinkedIn: <a style="color: #0A1831; font-weight: bold; text-decoration: none" href="https://www.linkedin.com/company/trustrecruit/">https://www.linkedin.com/company/trustrecruit/</a></p>
                                    <p  style="font-size:13px;  margin: 0px 0">Facebook: <a style="color: #0A1831; font-weight: bold; text-decoration: none" href="https://www.facebook.com/TrustRecruit-109869988206407">https://www.facebook.com/TrustRecruit-109869988206407</a></p>
                                    <p style="font-size:11px; color: rgb(184, 184, 184);">This is an automatically generated email please do not reply to this email.</p>
                                    </td>
                            </tr>
                        </tbody>
                    </table>
                    <table style="width: 100%; max-width: 620px; margin: 0 auto;">
                        <tbody>
                            <tr>
                                <td style="text-align: center;">
                                    <p style="font-size: 13px;">Copyright © ${year} TrustRecruit.
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </td>
            </tr>
        </tbody></table>`};
    sgMail
      .send(msg)
      .then(() => {
        return callback('success');
      })
      .catch((error) => {
        loggerhandler.logger.error(`${error} ,email:${req.headers.email}`);
        if (error.response) {
          const { message, code, response } = error;
          const { headers, body } = response;
          return callback(null);
        }
      });

  },

  sendKycStatusMail: function (emailaddress, status, note, callback) {
    var currentyear = new Date().getFullYear()
    var NextYear = new Date().getFullYear() + 1
    var year = currentyear + '-' + NextYear;
    //approved
    if (status == 3) {
      let msg = {
        from: sender_identity,
        to: emailaddress,
        subject:
          "Your KYC is Approved.",
        html: `<!DOCTYPE html>
        <html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">
        
        <head>
          <title></title>
          <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch><o:AllowPNG/></o:OfficeDocumentSettings></xml><![endif]-->
          <!--[if !mso]><!-->
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500&display=swap" rel="stylesheet">
          <!--<![endif]-->
          <style>
            * {
              box-sizing: border-box;
            }
        
            body {
              margin: 0;
              padding: 0; background: #f2f2f2;
            }
        
            a[x-apple-data-detectors] {
              color: inherit !important;
              text-decoration: inherit !important;
            }
        
            #MessageViewBody a {
              color: inherit;
              text-decoration: none;
            }
        
            p {
              line-height: inherit
            }
                ul li{line-height: 23px;}
        
            .desktop_hide,
            .desktop_hide table {
              mso-hide: all;
              display: none;
              max-height: 0px;
              overflow: hidden;
            }
        
            @media (max-width:620px) {
              .desktop_hide table.icons-inner {
                display: inline-block !important;
              }
        
              .icons-inner {
                text-align: center;
              }
        
              .icons-inner td {
                margin: 0 auto;
              }
        
              .row-content {
                width: 100% !important;
              }
        
              .mobile_hide {
                display: none;
              }
        
              .stack .column {
                width: 100%;
                display: block;
              }
        
              .mobile_hide {
                min-height: 0;
                max-height: 0;
                max-width: 0;
                overflow: hidden;
                font-size: 0px;
              }
        
              .desktop_hide,
              .desktop_hide table {
                display: table !important;
                max-height: none !important;
              }
            }
          </style>
        </head>
        
        <body style="background: #f2f2f2; margin: 0; padding: 0; -webkit-text-size-adjust: none; text-size-adjust: none;">
          <table class="nl-container" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background: #f2f2f2;" >
            <tbody>
              <tr>
                <td>
                            <p>&nbsp;</p>
                            <table style="background: #ffffff; box-shadow:0px 0px 10px #0000003b;  border-radius: 5px; mso-table-lspace: 0pt; width: 600px; margin-top: 50px; mso-table-rspace: 0pt; " align="center" width="600" border="0" cellpadding="0" cellspacing="0" >
                                <tr>
                                    <td >
                                        <table class="row row-1" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                            <tbody>
                                                <tr>
                                                    <td>
                                                        <p style="margin: 0;" >&nbsp;</p>
                                                        <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #000000; width: 600px;" width="600">
                                                            <tbody>
                                                                <tr>
                                                                    <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; padding-top: 5px; padding-bottom: 5px; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                                        <table class="image_block block-1" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                                            <tr>
                                                                                <td class="pad" style="width:100%;padding-right:0px;padding-left:0px;">
                                                                                    <div class="alignment" align="center" style="line-height:10px"><img src="https://api.wearaware.co/uploads/aware-logo-new-mail.png" style="display: block; height: auto; border: 0; width: 200px; max-width: 100%;" width="200"></div>
                                                                                </td>
                                                                            </tr>
                                                                        </table>
                                                                    </td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                        <table class="row row-2" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; margin-top: 5px; mso-table-rspace: 0pt;">
                                            <tbody>
                                                <tr>
                                                    <td>
                                                        <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #000000; width: 600px;" width="600">
                                                            <tbody>
                                                                <tr>
                                                                    <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; padding-top: 5px; padding-bottom: 5px; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                                        <table class="image_block block-1" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                                            <tr>
                                                                                <td class="pad" style="width:100%;padding-right:0px;padding-left:0px;">
                                                                                    <div class="alignment" align="center" style="line-height:10px"><img src="https://api.wearaware.co/uploads/mail.png" style="display: block; height: auto; border: 0; width: 90px; max-width: 100%;" width="90"></div>
                                                                                </td>
                                                                            </tr>
                                                                        </table>
                                                                    </td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                        <table class="row row-3" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                            <tbody>
                                                <tr>
                                                    <td>
                                                        <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #7f8399; width: 600px;" width="600">
                                                            <tbody>
                                                                <tr>
                                                                    <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 15pt; font-weight: 400; text-align: left; padding-left: 20px; padding-right: 20px; vertical-align: top; padding-top: 5px; padding-bottom: 5px; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                                        <table class="text_block block-1" width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                                                            <tr>
                                                                                <td class="pad">
                                                                                    <div style="font-family: sans-serif">
                                                                                        <div class style="font-size: 12px; font-family: 'Inter', sans-serif; mso-line-height-alt: 14.399999999999999px; color: #555555; line-height: 1.2;">
                                                                                            <p style="margin: 0; margin-bottom: 20px; font-size: 14px; text-align: center; mso-line-height-alt: 16.8px;"><span style="color:#000000;"><strong><span style="    font-size: 1.5em;">Account Activation</span></strong></span></p>
                                                                                        </div>
                                                                                    </div>
                                                                                </td>
                                                                            </tr>
                                                                        </table>
                                                                        <table class="paragraph_block block-2" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                                                            <tr>
                                                                                <td class="pad">
                                                                                    <div style="color:#7f8399;direction:ltr;font-family: 'Inter', sans-serif;font-size: 14px;font-weight:400;letter-spacing:0px;line-height:120%;text-align:left;mso-line-height-alt:19.2px;">
                                                                                        <p style="margin: 0; margin-bottom: 16px;"><span>Greetings from Aware™.</span></p>
                                                                                        <p style="margin: 0; margin-bottom: 16px;"><span>Your KYC info is approved!</span></p>
                                                                                        <p style="margin: 0; margin-bottom: 16px;"><span>Congrats, you are part now of the Aware™ sustainable textiles community built on sharing. Your account has been established and your digital wallet created.</span></p>
                                                                                        <p style="margin: 0;"><span>Before you can send Aware™ Digital Tokens, you have to connect your relations (supplier and / or brands) to your account. After login, please go to Settings / Profile / Relations. Here you can add and invite your relations.</span></p>
                                                                                       
                                                                                      
                                                                                    </div>
                                                                                </td>
                                                                            </tr>
                                                                        </table>
                                                                        
                                                                        <table class="paragraph_block block-4" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                                                            <tr>
                                                                                <td class="pad">
                                                                                    <div style="color:#7f8399;direction:ltr;font-family:'Open Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif;font-size: 14px;font-weight:400;letter-spacing:0px;line-height:120%;text-align:left;mso-line-height-alt:19.2px;">
                                                                                        <p style="margin: 0;">&nbsp;</p>
                                                                                        <p style="margin: 0;"><strong><span style="color: #000000;">Contact us:&nbsp;</span></strong><a href="mailto:support@wearaware.co" style="text-decoration: none; color: #7f8399;">support@wearaware.co</a></p>
                                                                                        <p style="margin: 0;">&nbsp;</p>
                                                                                    </div>
                                                                                </td>
                                                                            </tr>
                                                                        </table>
                                                                    </td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                            <table class="row row-4" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                    <tbody>
                      <tr>
                        <td>
                          <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #7f8399; width: 600px;" width="600">
                            <tbody>
                              <tr>
                                <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; padding-top: 5px; padding-bottom: 5px; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                  <table class="text_block block-1" width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                    <tr>
                                      <td class="pad" style="padding: 10px 0;">
                                        <div style="font-family: sans-serif">
                                          <div class style="font-size: 13px; font-family: 'Inter', sans-serif; mso-line-height-alt: 14.399999999999999px; color: #7f8399; line-height: 1.2;">
                                            <p style="margin: 0; font-size: 13px; text-align: center; mso-line-height-alt: 16.8px; color: #7f8399; "><span style="font-size:13px;">produced and distributed by the Aware™ Platform, The Netherlands. All rights reserved. Aware™ is a registered trademark of The Movement IP BV. View our&nbsp;<a href="https://www.iubenda.com/privacy-policy/31166669/full-legal" target="_blank"  style="text-decoration: underline; color: #0352C9;" >privacy policy</a>.</span></p>
                                          </div>
                                        </div>
                                      </td>
                                    </tr>
                                  </table>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
                        
              </tr>
            </tbody>
          </table><!-- End -->
        </body>
        
        </html>`
      };
      sgMail
        .send(msg)
        .then(() => {
          return callback('success');
        })
        .catch((error) => {
          loggerhandler.logger.error(`${error} ,email:${req.headers.email}`);
          if (error.response) {
            const { message, code, response } = error;
            const { headers, body } = response;
            return callback(null);
          }
        });
    }
    //reject
    else if (status == 4) {
      let msg = {
        from: sender_identity,
        to: emailaddress,
        subject:
          "Your KYC is Rejected.",
        html: `<!DOCTYPE html>
        <html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">
        
        <head>
          <title></title>
          <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch><o:AllowPNG/></o:OfficeDocumentSettings></xml><![endif]-->
          <!--[if !mso]><!-->
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500&display=swap" rel="stylesheet">
          <!--<![endif]-->
          <style>
            * {
              box-sizing: border-box;
            }
        
            body {
              margin: 0;
              padding: 0; background: #f2f2f2;
            }
        
            a[x-apple-data-detectors] {
              color: inherit !important;
              text-decoration: inherit !important;
            }
        
            #MessageViewBody a {
              color: inherit;
              text-decoration: none;
            }
        
            p {
              line-height: inherit
            }
                ul li{line-height: 23px;}
        
            .desktop_hide,
            .desktop_hide table {
              mso-hide: all;
              display: none;
              max-height: 0px;
              overflow: hidden;
            }
        
            @media (max-width:620px) {
              .desktop_hide table.icons-inner {
                display: inline-block !important;
              }
        
              .icons-inner {
                text-align: center;
              }
        
              .icons-inner td {
                margin: 0 auto;
              }
        
              .row-content {
                width: 100% !important;
              }
        
              .mobile_hide {
                display: none;
              }
        
              .stack .column {
                width: 100%;
                display: block;
              }
        
              .mobile_hide {
                min-height: 0;
                max-height: 0;
                max-width: 0;
                overflow: hidden;
                font-size: 0px;
              }
        
              .desktop_hide,
              .desktop_hide table {
                display: table !important;
                max-height: none !important;
              }
            }
          </style>
        </head>
        
        <body style="background: #f2f2f2; margin: 0; padding: 0; -webkit-text-size-adjust: none; text-size-adjust: none;">
          <table class="nl-container" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background: #f2f2f2;" >
            <tbody>
              <tr>
                <td>
                            <p>&nbsp;</p>
                            <table style="background: #ffffff; box-shadow:0px 0px 10px #0000003b;  border-radius: 5px; mso-table-lspace: 0pt; width: 600px; margin-top: 50px; mso-table-rspace: 0pt; " align="center" width="600" border="0" cellpadding="0" cellspacing="0" >
                                <tr>
                                    <td >
                                        <table class="row row-1" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                            <tbody>
                                                <tr>
                                                    <td>
                                                        <p style="margin: 0;" >&nbsp;</p>
                                                        <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #000000; width: 600px;" width="600">
                                                            <tbody>
                                                                <tr>
                                                                    <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; padding-top: 5px; padding-bottom: 5px; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                                        <table class="image_block block-1" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                                            <tr>
                                                                                <td class="pad" style="width:100%;padding-right:0px;padding-left:0px;">
                                                                                    <div class="alignment" align="center" style="line-height:10px"><img src="https://api.wearaware.co/uploads/aware-logo-new-mail.png" style="display: block; height: auto; border: 0; width: 200px; max-width: 100%;" width="200"></div>
                                                                                </td>
                                                                            </tr>
                                                                        </table>
                                                                    </td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                        <table class="row row-2" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; margin-top: 5px; mso-table-rspace: 0pt;">
                                            <tbody>
                                                <tr>
                                                    <td>
                                                        <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #000000; width: 600px;" width="600">
                                                            <tbody>
                                                                <tr>
                                                                    <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; padding-top: 5px; padding-bottom: 5px; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                                        <table class="image_block block-1" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                                            <tr>
                                                                                <td class="pad" style="width:100%;padding-right:0px;padding-left:0px;">
                                                                                    <div class="alignment" align="center" style="line-height:10px"><img src="https://api.wearaware.co/uploads/mail.png" style="display: block; height: auto; border: 0; width: 90px; max-width: 100%;" width="90"></div>
                                                                                </td>
                                                                            </tr>
                                                                        </table>
                                                                    </td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                        <table class="row row-3" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                            <tbody>
                                                <tr>
                                                    <td>
                                                        <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #7f8399; width: 600px;" width="600">
                                                            <tbody>
                                                                <tr>
                                                                    <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 15pt; font-weight: 400; text-align: left; padding-left: 20px; padding-right: 20px; vertical-align: top; padding-top: 5px; padding-bottom: 5px; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                                        <table class="text_block block-1" width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                                                            <tr>
                                                                                <td class="pad">
                                                                                    <div style="font-family: sans-serif">
                                                                                        <div class style="font-size: 12px; font-family: 'Inter', sans-serif; mso-line-height-alt: 14.399999999999999px; color: #555555; line-height: 1.2;">
                                                                                            <p style="margin: 0; margin-bottom: 20px; font-size: 14px; text-align: center; mso-line-height-alt: 16.8px;"><span style="color:#000000;"><strong><span style="    font-size: 1.5em;">KYC Rejected</span></strong></span></p>
                                                                                        </div>
                                                                                    </div>
                                                                                </td>
                                                                            </tr>
                                                                        </table>
                                                                        <table class="paragraph_block block-2" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                                                            <tr>
                                                                                <td class="pad">
                                                                                    <div style="color:#7f8399;direction:ltr;font-family: 'Inter', sans-serif;font-size: 14px;font-weight:400;letter-spacing:0px;line-height:120%;text-align:left;mso-line-height-alt:19.2px;">
                                                                                        <p style="margin: 0; margin-bottom: 16px;"><span>Greetings from Aware™.</span></p>
                                                                                        <p style="margin: 0;"><span>Sorry to inform that your KYC has been rejected by our Integrity Department. We will contact you by email to inform you about the details. </span></p></div>
                                                                                </td>
                                                                            </tr>
                                                                        </table>
                                                                        
                                                                        <table class="paragraph_block block-4" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                                                            <tr>
                                                                                <td class="pad">
                                                                                    <div style="color:#7f8399;direction:ltr;font-family:'Open Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif;font-size: 14px;font-weight:400;letter-spacing:0px;line-height:120%;text-align:left;mso-line-height-alt:19.2px;">
                                                                                        <p style="margin: 0;">&nbsp;</p>
                                                                                        <p style="margin: 0;"><strong><span style="color: #000000;">Contact us:&nbsp;</span></strong><a href="mailto:support@wearaware.co" style="text-decoration: none; color: #7f8399;">support@wearaware.co</a></p>
                                                                                        <p style="margin: 0;">&nbsp;</p>
                                                                                    </div>
                                                                                </td>
                                                                            </tr>
                                                                        </table>
                                                                    </td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                            <table class="row row-4" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                    <tbody>
                      <tr>
                        <td>
                          <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #7f8399; width: 600px;" width="600">
                            <tbody>
                              <tr>
                                <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; padding-top: 5px; padding-bottom: 5px; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                  <table class="text_block block-1" width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                    <tr>
                                      <td class="pad" style="padding: 10px 0;">
                                        <div style="font-family: sans-serif">
                                          <div class style="font-size: 13px; font-family: 'Inter', sans-serif; mso-line-height-alt: 14.399999999999999px; color: #7f8399; line-height: 1.2;">
                                            <p style="margin: 0; font-size: 13px; text-align: center; mso-line-height-alt: 16.8px; color: #7f8399; "><span style="font-size:13px;">This message was produced and distributed by the Aware™ Platform, The Netherlands. All rights reserved. Aware™ is a registered trademark of The Movement IP BV. View our&nbsp;<a href="https://www.iubenda.com/privacy-policy/31166669/full-legal" target="_blank"  style="text-decoration: underline; color: #0352C9;" >privacy policy</a>.</span></p>
                                          </div>
                                        </div>
                                      </td>
                                    </tr>
                                  </table>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
                        
              </tr>
            </tbody>
          </table><!-- End -->
        </body>
        
        </html>`
      };
      sgMail
        .send(msg)
        .then(() => {
          return callback('success');
        })
        .catch((error) => {
          loggerhandler.logger.error(`${error} ,email:${req.headers.email}`);
          if (error.response) {
            const { message, code, response } = error;
            const { headers, body } = response;
            return callback(null);
          }
        });
    }
    //on-hold
    else if (status == 5) {
      let msg = {
        from: sender_identity,
        to: emailaddress,
        subject:
          "Your KYC is On Hold.",
        html: `<!DOCTYPE html>
        <html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">
        
        <head>
          <title></title>
          <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch><o:AllowPNG/></o:OfficeDocumentSettings></xml><![endif]-->
          <!--[if !mso]><!-->
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500&display=swap" rel="stylesheet">
          <!--<![endif]-->
          <style>
            * {
              box-sizing: border-box;
            }
        
            body {
              margin: 0;
              padding: 0; background: #f2f2f2;
            }
        
            a[x-apple-data-detectors] {
              color: inherit !important;
              text-decoration: inherit !important;
            }
        
            #MessageViewBody a {
              color: inherit;
              text-decoration: none;
            }
        
            p {
              line-height: inherit
            }
                ul li{line-height: 23px;}
        
            .desktop_hide,
            .desktop_hide table {
              mso-hide: all;
              display: none;
              max-height: 0px;
              overflow: hidden;
            }
        
            @media (max-width:620px) {
              .desktop_hide table.icons-inner {
                display: inline-block !important;
              }
        
              .icons-inner {
                text-align: center;
              }
        
              .icons-inner td {
                margin: 0 auto;
              }
        
              .row-content {
                width: 100% !important;
              }
        
              .mobile_hide {
                display: none;
              }
        
              .stack .column {
                width: 100%;
                display: block;
              }
        
              .mobile_hide {
                min-height: 0;
                max-height: 0;
                max-width: 0;
                overflow: hidden;
                font-size: 0px;
              }
        
              .desktop_hide,
              .desktop_hide table {
                display: table !important;
                max-height: none !important;
              }
            }
          </style>
        </head>
        
        <body style="background: #f2f2f2; margin: 0; padding: 0; -webkit-text-size-adjust: none; text-size-adjust: none;">
          <table class="nl-container" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background: #f2f2f2;" >
            <tbody>
              <tr>
                <td>
                            <p>&nbsp;</p>
                            <table style="background: #ffffff; box-shadow:0px 0px 10px #0000003b;  border-radius: 5px; mso-table-lspace: 0pt; width: 600px; margin-top: 50px; mso-table-rspace: 0pt; " align="center" width="600" border="0" cellpadding="0" cellspacing="0" >
                                <tr>
                                    <td >
                                        <table class="row row-1" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                            <tbody>
                                                <tr>
                                                    <td>
                                                        <p style="margin: 0;" >&nbsp;</p>
                                                        <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #000000; width: 600px;" width="600">
                                                            <tbody>
                                                                <tr>
                                                                    <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; padding-top: 5px; padding-bottom: 5px; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                                        <table class="image_block block-1" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                                            <tr>
                                                                                <td class="pad" style="width:100%;padding-right:0px;padding-left:0px;">
                                                                                    <div class="alignment" align="center" style="line-height:10px"><img src="https://api.wearaware.co/uploads/aware-logo-new-mail.png" style="display: block; height: auto; border: 0; width: 200px; max-width: 100%;" width="200"></div>
                                                                                </td>
                                                                            </tr>
                                                                        </table>
                                                                    </td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                        <table class="row row-2" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; margin-top: 5px; mso-table-rspace: 0pt;">
                                            <tbody>
                                                <tr>
                                                    <td>
                                                        <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #000000; width: 600px;" width="600">
                                                            <tbody>
                                                                <tr>
                                                                    <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; padding-top: 5px; padding-bottom: 5px; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                                        <table class="image_block block-1" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                                            <tr>
                                                                                <td class="pad" style="width:100%;padding-right:0px;padding-left:0px;">
                                                                                    <div class="alignment" align="center" style="line-height:10px"><img src="https://api.wearaware.co/uploads/mail.png" style="display: block; height: auto; border: 0; width: 90px; max-width: 100%;" width="90"></div>
                                                                                </td>
                                                                            </tr>
                                                                        </table>
                                                                    </td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                        <table class="row row-3" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                            <tbody>
                                                <tr>
                                                    <td>
                                                        <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #7f8399; width: 600px;" width="600">
                                                            <tbody>
                                                                <tr>
                                                                    <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 15pt; font-weight: 400; text-align: left; padding-left: 20px; padding-right: 20px; vertical-align: top; padding-top: 5px; padding-bottom: 5px; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                                        <table class="text_block block-1" width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                                                            <tr>
                                                                                <td class="pad">
                                                                                    <div style="font-family: sans-serif">
                                                                                        <div class style="font-size: 12px; font-family: 'Inter', sans-serif; mso-line-height-alt: 14.399999999999999px; color: #555555; line-height: 1.2;">
                                                                                            <p style="margin: 0; margin-bottom: 20px; font-size: 14px; text-align: center; mso-line-height-alt: 16.8px;"><span style="color:#000000;"><strong><span style="    font-size: 1.5em;">KYC On-Hold</span></strong></span></p>
                                                                                        </div>
                                                                                    </div>
                                                                                </td>
                                                                            </tr>
                                                                        </table>
                                                                        <table class="paragraph_block block-2" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                                                            <tr>
                                                                                <td class="pad">
                                                                                    <div style="color:#7f8399;direction:ltr;font-family: 'Inter', sans-serif;font-size: 14px;font-weight:400;letter-spacing:0px;line-height:120%;text-align:left;mso-line-height-alt:19.2px;">
                                                                                        <p style="margin: 0; margin-bottom: 16px;"><span>Greetings from Aware™.</span></p>
                                                                                        <p style="margin: 0;"><span>Your company info (KYC) has been reviewed by our Integrity Department. We have some questions for you. We will contact you by email to inform you about the details.”</span></p></div>
                                                                                </td>
                                                                            </tr>
                                                                        </table>
                                                                        
                                                                        <table class="paragraph_block block-4" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                                                            <tr>
                                                                                <td class="pad">
                                                                                    <div style="color:#7f8399;direction:ltr;font-family:'Open Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif;font-size: 14px;font-weight:400;letter-spacing:0px;line-height:120%;text-align:left;mso-line-height-alt:19.2px;">
                                                                                        <p style="margin: 0;">&nbsp;</p>
                                                                                        <p style="margin: 0;"><strong><span style="color: #000000;">Contact us:&nbsp;</span></strong><a href="mailto:support@wearaware.co" style="text-decoration: none; color: #7f8399;">support@wearaware.co</a></p>
                                                                                        <p style="margin: 0;">&nbsp;</p>
                                                                                    </div>
                                                                                </td>
                                                                            </tr>
                                                                        </table>
                                                                    </td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                            <table class="row row-4" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                    <tbody>
                      <tr>
                        <td>
                          <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #7f8399; width: 600px;" width="600">
                            <tbody>
                              <tr>
                                <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; padding-top: 5px; padding-bottom: 5px; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                  <table class="text_block block-1" width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                    <tr>
                                      <td class="pad" style="padding: 10px 0;">
                                        <div style="font-family: sans-serif">
                                          <div class style="font-size: 13px; font-family: 'Inter', sans-serif; mso-line-height-alt: 14.399999999999999px; color: #7f8399; line-height: 1.2;">
                                            <p style="margin: 0; font-size: 13px; text-align: center; mso-line-height-alt: 16.8px; color: #7f8399; "><span style="font-size:13px;">This message was produced and distributed by the Aware™ Platform, The Netherlands. All rights reserved. Aware™ is a registered trademark of The Movement IP BV. View our&nbsp;<a href="https://www.iubenda.com/privacy-policy/31166669/full-legal" target="_blank"  style="text-decoration: underline; color: #0352C9;" >privacy policy</a>.</span></p>
                                          </div>
                                        </div>
                                      </td>
                                    </tr>
                                  </table>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
                        
              </tr>
            </tbody>
          </table><!-- End -->
        </body>
        
        </html>`
      };
      sgMail
        .send(msg)
        .then(() => {
          return callback('success');
        })
        .catch((error) => {
          loggerhandler.logger.error(`${error} ,email:${req.headers.email}`);
          if (error.response) {
            const { message, code, response } = error;
            const { headers, body } = response;
            return callback(null);
          }
        });
    }

  },

  sendInvitationMail: function (emailaddress, callback) {

    // var currentyear = new Date().getFullYear()
    // var NextYear = new Date().getFullYear() + 1
    // var year = currentyear + '-' + NextYear;


    const msg = {
      from: sender_identity,
      to: emailaddress,
      subject:
        `Invite you to join Aware™`,
      html: `<!DOCTYPE html>
      <html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">
      
      <head>
        <title></title>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        
              <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500&display=swap" rel="stylesheet">
        <style>
          * {
            box-sizing: border-box;
          }
      
          body {
            margin: 0;
            padding: 0; background: #f2f2f2;
          }
      
          a[x-apple-data-detectors] {
            color: inherit !important;
            text-decoration: inherit !important;
          }
      
          #MessageViewBody a {
            color: inherit;
            text-decoration: none;
          }
      
          p {
            line-height: inherit
          }
              ul li{line-height: 23px;}
      
          .desktop_hide,
          .desktop_hide table {
            mso-hide: all;
            display: none;
            max-height: 0px;
            overflow: hidden;
          }
      
          @media (max-width:620px) {
            .desktop_hide table.icons-inner {
              display: inline-block !important;
            }
      
            .icons-inner {
              text-align: center;
            }
      
            .icons-inner td {
              margin: 0 auto;
            }
      
            .row-content {
              width: 100% !important;
            }
      
            .mobile_hide {
              display: none;
            }
      
            .stack .column {
              width: 100%;
              display: block;
            }
      
            .mobile_hide {
              min-height: 0;
              max-height: 0;
              max-width: 0;
              overflow: hidden;
              font-size: 0px;
            }
      
            .desktop_hide,
            .desktop_hide table {
              display: table !important;
              max-height: none !important;
            }
          }
        </style>
      </head>
      
      <body style="background: #f2f2f2; margin: 0; padding: 0; -webkit-text-size-adjust: none; text-size-adjust: none;">
        <table class="nl-container" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background: #f2f2f2;" >
          <tbody>
            <tr>
              <td>
                          <p>&nbsp;</p>
                          <table style="background: #ffffff; box-shadow:0px 0px 10px #0000003b;  border-radius: 5px; mso-table-lspace: 0pt; width: 600px; margin-top: 50px; mso-table-rspace: 0pt; " align="center" width="600" border="0" cellpadding="0" cellspacing="0" >
                              <tr>
                                  <td >
                                      <table class="row row-1" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                          <tbody>
                                              <tr>
                                                  <td>
                                                      <p style="margin: 0;">&nbsp;</p>
                                                      <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #000000; width: 600px;" width="600">
                                                          <tbody>
                                                              <tr>
                                                                  <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; padding-top: 5px; padding-bottom: 5px; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                                      <table class="image_block block-1" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                                          <tr>
                                                                              <td class="pad" style="width:100%;padding-right:0px;padding-left:0px;">
                                                                                  <div class="alignment" align="center" style="line-height:10px"><img src="https://api.wearaware.co/uploads/aware-logo-new-mail.png" style="display: block; height: auto; border: 0; width: 200px; max-width: 100%;" width="200"></div>
                                                                              </td>
                                                                          </tr>
                                                                      </table>
                                                                  </td>
                                                              </tr>
                                                          </tbody>
                                                      </table>
                                                  </td>
                                              </tr>
                                          </tbody>
                                      </table>
                                      <table class="row row-2" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; margin-top: 5px; mso-table-rspace: 0pt;">
                                          <tbody>
                                              <tr>
                                                  <td>
                                                      <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #000000; width: 600px;" width="600">
                                                          <tbody>
                                                              <tr>
                                                                  <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; padding-top: 5px; padding-bottom: 5px; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                                      <table class="image_block block-1" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                                          <tr>
                                                                              <td class="pad" style="width:100%;padding-right:0px;padding-left:0px;">
                                                                                  <div class="alignment" align="center" style="line-height:10px"><img src="https://api.wearaware.co/uploads/mail.png" style="display: block; height: auto; border: 0; width: 90px; max-width: 100%;" width="90"></div>
                                                                              </td>
                                                                          </tr>
                                                                      </table>
                                                                  </td>
                                                              </tr>
                                                          </tbody>
                                                      </table>
                                                  </td>
                                              </tr>
                                          </tbody>
                                      </table>
                                      <table class="row row-3" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                          <tbody>
                                              <tr>
                                                  <td>
                                                      <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #7f8399; width: 600px;" width="600">
                                                          <tbody>
                                                              <tr>
                                                                  <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 15pt; font-weight: 400; text-align: left; padding-left: 20px; padding-right: 20px; vertical-align: top; padding-top: 5px; padding-bottom: 5px; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                                      <table class="text_block block-1" width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                                                          <tr>
                                                                              <td class="pad">
                                                                                  <div style="font-family: sans-serif">
                                                                                      <div class style="font-size: 12px; font-family: 'Inter', sans-serif; mso-line-height-alt: 14.399999999999999px; color: #555555; line-height: 1.2;">
                                                                                          <p style="margin: 0; margin-bottom: 20px; font-size: 14px; text-align: center; mso-line-height-alt: 16.8px;"><span style="color:#000000;"><strong><span style=" font-size: 1.5em;"> Invitation</span></strong></span></p>
                                                                                      </div>
                                                                                  </div>
                                                                              </td>
                                                                          </tr>
                                                                      </table>
                                                                      <table class="paragraph_block block-2" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                                                          <tr>
                                                                              <td class="pad">
                                                                                  <div style="color:#7f8399;direction:ltr;font-family: 'Inter', sans-serif;font-size: 14px;font-weight:400;letter-spacing:0px;line-height:120%;text-align:left;mso-line-height-alt:19.2px;">
                                                                                      <p style="margin: 0; margin-bottom: 16px;"><span>Greetings from Aware™.</span></p>
                                                                                      <p style="margin: 0;"><span>You have been invited to join the Aware™ platform. This invitation comes from a partner supplier or a final brand within your supply chain. They want you to join a fully traceable supply chain of sustainable materials.
                                                                                      </span></p>
                                                                                      <p style="margin: 0;">&nbsp;</p>
                                                                                      <p style="margin: 0;">Click the button below to sign up for an account:
                                                                                      </p>
                                                                                      <p style="margin: 0;">&nbsp;</p>
                                                                                      <div class="alignment" align="center"><!--[if mso]><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${process.env.DOMAIN}/register" style="height:32px;width:101px;v-text-anchor:middle;" arcsize="75%" stroke="false" fillcolor="#0352C9"><w:anchorlock/><v:textbox inset="0px,0px,0px,0px"><center style="color:#ffffff; font-family:Arial, sans-serif; font-size:16px"><![endif]--><a href="${process.env.DOMAIN}/register" target="_blank" style="text-decoration:none;display:inline-block;color:#ffffff;background-color:#0352C9;border-radius:24px;width:auto;border-top:0px solid transparent;font-weight:400;border-right:0px solid transparent;border-bottom:0px solid transparent;border-left:0px solid transparent;padding-top:0px;padding-bottom:0px;font-family: 'Inter', sans-serif;text-align:center;mso-border-alt:none;word-break:keep-all;"><span style="padding-left:25px;padding-right:25px;font-size:14px;display:inline-block;letter-spacing:normal;"><span style="font-family: 'Inter', sans-serif; line-height: 32px;">Signup</span></span></a><!--[if mso]></center></v:textbox></v:roundrect><![endif]--></div>
                                                                                      <p style="margin: 0;">&nbsp;</p>
                                                                                      <p style="margin: 0;"><span>If you have issue with viewing the above button, try to copy and paste the link below in your web browser:</span></p>
                                                                                      <p style="margin: 0;">&nbsp;</p>
                                                                                      <p style="margin: 0;"><span><a style="text-decoration: underline; color: #0352C9;" href="${process.env.DOMAIN}">${process.env.DOMAIN}</a></span></p>
                                                                                      <p style="margin: 0;">&nbsp;</p>
                                                                                      <p style="margin: 0;">As member of the Aware™ platform you have the opportunity to benefit from additional business and it is completely free.</p>
                                                                                  </div>
                                                                              </td>
                                                                          </tr>
                                                                      </table>
                                                                      
                                                                      <table class="paragraph_block block-4" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                                                          <tr>
                                                                              <td class="pad">
                                                                                  <div style="color:#7f8399;direction:ltr;font-family:'Open Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif;font-size: 14px;font-weight:400;letter-spacing:0px;line-height:120%;text-align:left;mso-line-height-alt:19.2px;">
                                                                                      <p style="margin: 0;">&nbsp;</p>
                                                                                      <p style="margin: 0;"><strong><span style="color: #000000;">Contact us:&nbsp;</span></strong><a href="mailto:support@wearaware.co" style="text-decoration: none; color: #7f8399;">support@wearaware.co</a></p>
                                                                                      <p style="margin: 0;">&nbsp;</p>
                                                                                  </div>
                                                                              </td>
                                                                          </tr>
                                                                      </table>
                                                                  </td>
                                                              </tr>
                                                          </tbody>
                                                      </table>
                                                  </td>
                                              </tr>
                                          </tbody>
                                      </table>
                                  </td>
                              </tr>
                          </table>
                          <table class="row row-4" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                  <tbody>
                    <tr>
                      <td>
                        <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #7f8399; width: 600px;" width="600">
                          <tbody>
                            <tr>
                              <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; padding-top: 5px; padding-bottom: 5px; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                <table class="text_block block-1" width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                  <tr>
                                    <td class="pad" style="padding: 10px 0;">
                                      <div style="font-family: sans-serif">
                                        <div class style="font-size: 13px; font-family: 'Inter', sans-serif; mso-line-height-alt: 14.399999999999999px; color: #7f8399; line-height: 1.2;">
                                          <p style="margin: 0; font-size: 13px; text-align: center; mso-line-height-alt: 16.8px; color: #7f8399; "><span style="font-size:13px;">This message was produced and distributed by the Aware™ Platform, The Netherlands. All rights reserved. Aware™ is a registered trademark of The Movement IP BV. View our&nbsp;<a href="https://www.iubenda.com/privacy-policy/31166669/full-legal" target="_blank"  style="text-decoration: underline; color: #0352C9;" >privacy policy</a>.</span></p>
                                        </div>
                                      </div>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
                      
            </tr>
          </tbody>
        </table>
      </body>
      
      </html>`
    };
    sgMail
      .send(msg)
      .then(() => {
        return callback('success');
      })
      .catch((error) => {
        loggerhandler.logger.error(`${error} ,email:${req.headers.email}`);
        if (error.response) {
          const { message, code, response } = error;
          const { headers, body } = response;
          return callback(null);
        }
      });

  },

  sendInvitationManagerMail: function (emailaddress, capitalizedString, callback) {

    // var currentyear = new Date().getFullYear()
    // var NextYear = new Date().getFullYear() + 1
    // var year = currentyear + '-' + NextYear;


    const msg = {
      from: sender_identity,
      to: emailaddress,
      subject:
        `Invitation to join Aware ™!`,
      html: `<!DOCTYPE html>
      <html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">
      
      <head>
        <title></title>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch><o:AllowPNG/></o:OfficeDocumentSettings></xml><![endif]-->
        <!--[if !mso]><!-->
              <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500&display=swap" rel="stylesheet">
        <!--<![endif]-->
        <style>
          * {
            box-sizing: border-box;
          }
      
          body {
            margin: 0;
            padding: 0; background: #f2f2f2;
          }
      
          a[x-apple-data-detectors] {
            color: inherit !important;
            text-decoration: inherit !important;
          }
      
          #MessageViewBody a {
            color: inherit;
            text-decoration: none;
          }
      
          p {
            line-height: inherit
          }
              ul li{line-height: 23px;}
      
          .desktop_hide,
          .desktop_hide table {
            mso-hide: all;
            display: none;
            max-height: 0px;
            overflow: hidden;
          }
      
          @media (max-width:620px) {
            .desktop_hide table.icons-inner {
              display: inline-block !important;
            }
      
            .icons-inner {
              text-align: center;
            }
      
            .icons-inner td {
              margin: 0 auto;
            }
      
            .row-content {
              width: 100% !important;
            }
      
            .mobile_hide {
              display: none;
            }
      
            .stack .column {
              width: 100%;
              display: block;
            }
      
            .mobile_hide {
              min-height: 0;
              max-height: 0;
              max-width: 0;
              overflow: hidden;
              font-size: 0px;
            }
      
            .desktop_hide,
            .desktop_hide table {
              display: table !important;
              max-height: none !important;
            }
          }
        </style>
      </head>
      
      <body style="background: #f2f2f2; margin: 0; padding: 0; -webkit-text-size-adjust: none; text-size-adjust: none;">
        <table class="nl-container" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background: #f2f2f2;" >
          <tbody>
            <tr>
              <td>
                          <p>&nbsp;</p>
                          <table style="background: #ffffff; box-shadow:0px 0px 10px #0000003b;  border-radius: 5px; mso-table-lspace: 0pt; width: 600px; margin-top: 50px; mso-table-rspace: 0pt; " align="center" width="600" border="0" cellpadding="0" cellspacing="0" >
                              <tr>
                                  <td >
                                      <table class="row row-1" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                          <tbody>
                                              <tr>
                                                  <td>
                                                      <p style="margin: 0;">&nbsp;</p>
                                                      <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #000000; width: 600px;" width="600">
                                                          <tbody>
                                                              <tr>
                                                                  <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; padding-top: 5px; padding-bottom: 5px; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                                      <table class="image_block block-1" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                                          <tr>
                                                                              <td class="pad" style="width:100%;padding-right:0px;padding-left:0px;">
                                                                                  <div class="alignment" align="center" style="line-height:10px"><img src="https://api.wearaware.co/uploads/aware-logo-new-mail.png" style="display: block; height: auto; border: 0; width: 200px; max-width: 100%;" width="200"></div>
                                                                              </td>
                                                                          </tr>
                                                                      </table>
                                                                  </td>
                                                              </tr>
                                                          </tbody>
                                                      </table>
                                                  </td>
                                              </tr>
                                          </tbody>
                                      </table>
                                      <table class="row row-2" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; margin-top: 5px; mso-table-rspace: 0pt;">
                                          <tbody>
                                              <tr>
                                                  <td>
                                                      <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #000000; width: 600px;" width="600">
                                                          <tbody>
                                                              <tr>
                                                                  <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; padding-top: 5px; padding-bottom: 5px; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                                      <table class="image_block block-1" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                                          <tr>
                                                                              <td class="pad" style="width:100%;padding-right:0px;padding-left:0px;">
                                                                                  <div class="alignment" align="center" style="line-height:10px"><img src="https://api.wearaware.co/uploads/mail.png" style="display: block; height: auto; border: 0; width: 90px; max-width: 100%;" width="90"></div>
                                                                              </td>
                                                                          </tr>
                                                                      </table>
                                                                  </td>
                                                              </tr>
                                                          </tbody>
                                                      </table>
                                                  </td>
                                              </tr  >
                                          </tbody>
                                      </table>
                                      <table class="row row-3" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                          <tbody>
                                              <tr>
                                                  <td>
                                                      <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #7f8399; width: 600px;" width="600">
                                                          <tbody>
                                                              <tr>
                                                                  <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 15pt; font-weight: 400; text-align: left; padding-left: 20px; padding-right: 20px; vertical-align: top; padding-top: 5px; padding-bottom: 5px; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                                      <table class="text_block block-1" width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                                                          <tr>
                                                                              <td class="pad">
                                                                                  <div style="font-family: sans-serif">
                                                                                      <div class style="font-size: 12px; font-family: 'Inter', sans-serif; mso-line-height-alt: 14.399999999999999px; color: #555555; line-height: 1.2;">
                                                                                          <p style="margin: 0; margin-bottom: 20px; font-size: 14px; text-align: center; mso-line-height-alt: 16.8px;"><span style="color:#000000;"><strong><span style="    font-size: 1.5em;">Invitation</span></strong></span></p>
                                                                                      </div>
                                                                                  </div>
                                                                              </td>
                                                                          </tr>
                                                                      </table>
                                                                      <table class="paragraph_block block-2" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                                                          <tr>
                                                                              <td class="pad">
                                                                                  <div style="color:#7f8399;direction:ltr;font-family: 'Inter', sans-serif;font-size: 14px;font-weight:400;letter-spacing:0px;line-height:120%;text-align:left;mso-line-height-alt:19.2px;">
                                                                                    <p style="margin: 0; margin-bottom: 16px;"><span>Hi ${capitalizedString},</span></p>
                                                                                      <p style="margin: 0; margin-bottom: 16px;"><span>Greetings from Aware™!</span></p>
                                                                                      <p style="margin: 0; line-height: 21px;"><span>We are delighted to announce that you have been officially invited to become a part of the AWARE™ family.</span></p>
                                                                                      <p style="margin: 0;">&nbsp;</p>
                                                                                      <p style="margin: 0;">To initiate your journey, kindly follow these simple instructions:</p>
                                                                                      <ul>
                                                                                      <li style="margin: 0;"><p style="margin: 0;">Click the following link: <a style="text-decoration: underline; color: #0352C9;" href="${process.env.DOMAIN}">${process.env.DOMAIN}</a></p></li>
                                                                                        <li style="margin: 0;"><p style="margin: 0;">Enter your <b>full email</b>.</p></li>
                                                                                       
                                                                                       
                                                                                     <li style="margin: 0;"> <p style="margin: 0;">Your <b>password</b> is made of upto first four characters of your first name (with first character as capital), dashed, and upto the first four characters of your last name (case sensitive), dashed 
                                                                                     aw with the current year. For example : If your name is Jane Doe, the password will be Jane-Doe-aw2025.</p></li>
                                                                                     <li style="margin: 0;"> <p style="margin: 0;"> Upon your initial login, you can create a new password of your choice. We recommend selecting a password that is easy to remember.</p></li>
                                                                                      </ul>
                                                                                   
                                                                                    <p style="margin: 0; display:flex;">We look forward to witnessing your success on the AWARE™ Platform.
                                                                                    </p>
                                                                                      <p style="margin: 0;">&nbsp;</p>
                                                                                      <p style="margin: 0;"><span>Best regards,</span></p>
                                                                                      <p><span>The Aware™ Team</span></p>

                                                                                  </div>
                                                                              </td>
                                                                          </tr>
                                                                      </table>
                                                                      
                                                                      
                                                                  </td>
                                                              </tr>
                                                          </tbody>
                                                      </table>
                                                  </td>
                                              </tr>
                                          </tbody>
                                      </table>
                                  </td>
                              </tr>
                          </table>
                          <table class="row row-4" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                  <tbody>
                    <tr>
                      <td>
                        <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #7f8399; width: 600px;" width="600">
                          <tbody>
                            <tr>
                              <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; padding-top: 5px; padding-bottom: 5px; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                <table class="text_block block-1" width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                  <tr>
                                    <td class="pad" style="padding: 10px 0;">
                                      <div style="font-family: sans-serif">
                                        <div class style="font-size: 13px; font-family: 'Inter', sans-serif; mso-line-height-alt: 14.399999999999999px; color: #7f8399; line-height: 1.2;">
                                          <p style="margin: 0; font-size: 13px; text-align: center; mso-line-height-alt: 16.8px; color: #7f8399; "><span style="font-size:13px;">This message was produced and distributed by the Aware™ Platform, The Netherlands. All rights reserved. Aware™ is a registered trademark of The Movement IP BV. View our&nbsp;<a href="https://www.iubenda.com/privacy-policy/31166669/full-legal"  target="_blank" style="text-decoration: underline; color: #0352C9;" >privacy policy</a>.</span></p>
                                        </div>
                                      </div>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
                      
            </tr>
          </tbody>
        </table><!-- End -->
      </body>
      
      </html>`
    };
    sgMail
      .send(msg)
      .then(() => {
        return callback('success');
      })
      .catch((error) => {
        console.log({ error })
        // loggerhandler.logger.error(`${error} ,email:${req.headers.email}`);
        if (error.response) {
          const { message, code, response } = error;
          const { headers, body } = response;
          return callback(null);
        }
      });

  },
  sendInvitationSubBrandMail: function (emailaddress, capitalizedString, company_name, callback) {

    // var currentyear = new Date().getFullYear()
    // var NextYear = new Date().getFullYear() + 1
    // var year = currentyear + '-' + NextYear;


    const msg = {
      from: sender_identity,
      to: emailaddress,
      subject:
        `Invitation to join Aware ™!`,
      html: `<!DOCTYPE html>
      <html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">
      
      <head>
        <title></title>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch><o:AllowPNG/></o:OfficeDocumentSettings></xml><![endif]-->
        <!--[if !mso]><!-->
              <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500&display=swap" rel="stylesheet">
        <!--<![endif]-->
        <style>
          * {
            box-sizing: border-box;
          }
      
          body {
            margin: 0;
            padding: 0; background: #f2f2f2;
          }
      
          a[x-apple-data-detectors] {
            color: inherit !important;
            text-decoration: inherit !important;
          }
      
          #MessageViewBody a {
            color: inherit;
            text-decoration: none;
          }
      
          p {
            line-height: inherit
          }
              ul li{line-height: 23px;}
      
          .desktop_hide,
          .desktop_hide table {
            mso-hide: all;
            display: none;
            max-height: 0px;
            overflow: hidden;
          }
      
          @media (max-width:620px) {
            .desktop_hide table.icons-inner {
              display: inline-block !important;
            }
      
            .icons-inner {
              text-align: center;
            }
      
            .icons-inner td {
              margin: 0 auto;
            }
      
            .row-content {
              width: 100% !important;
            }
      
            .mobile_hide {
              display: none;
            }
      
            .stack .column {
              width: 100%;
              display: block;
            }
      
            .mobile_hide {
              min-height: 0;
              max-height: 0;
              max-width: 0;
              overflow: hidden;
              font-size: 0px;
            }
      
            .desktop_hide,
            .desktop_hide table {
              display: table !important;
              max-height: none !important;
            }
          }
        </style>
      </head>
      
      <body style="background: #f2f2f2; margin: 0; padding: 0; -webkit-text-size-adjust: none; text-size-adjust: none;">
        <table class="nl-container" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background: #f2f2f2;" >
          <tbody>
            <tr>
              <td>
                          <p>&nbsp;</p>
                          <table style="background: #ffffff; box-shadow:0px 0px 10px #0000003b;  border-radius: 5px; mso-table-lspace: 0pt; width: 600px; margin-top: 50px; mso-table-rspace: 0pt; " align="center" width="600" border="0" cellpadding="0" cellspacing="0" >
                              <tr>
                                  <td >
                                      <table class="row row-1" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                          <tbody>
                                              <tr>
                                                  <td>
                                                      <p style="margin: 0;">&nbsp;</p>
                                                      <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #000000; width: 600px;" width="600">
                                                          <tbody>
                                                              <tr>
                                                                  <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; padding-top: 5px; padding-bottom: 5px; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                                      <table class="image_block block-1" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                                          <tr>
                                                                              <td class="pad" style="width:100%;padding-right:0px;padding-left:0px;">
                                                                                  <div class="alignment" align="center" style="line-height:10px"><img src="https://api.wearaware.co/uploads/aware-logo-new-mail.png" style="display: block; height: auto; border: 0; width: 200px; max-width: 100%;" width="200"></div>
                                                                              </td>
                                                                          </tr>
                                                                      </table>
                                                                  </td>
                                                              </tr>
                                                          </tbody>
                                                      </table>
                                                  </td>
                                              </tr>
                                          </tbody>
                                      </table>
                                      <table class="row row-2" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; margin-top: 5px; mso-table-rspace: 0pt;">
                                          <tbody>
                                              <tr>
                                                  <td>
                                                      <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #000000; width: 600px;" width="600">
                                                          <tbody>
                                                              <tr>
                                                                  <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; padding-top: 5px; padding-bottom: 5px; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                                      <table class="image_block block-1" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                                          <tr>
                                                                              <td class="pad" style="width:100%;padding-right:0px;padding-left:0px;">
                                                                                  <div class="alignment" align="center" style="line-height:10px"><img src="https://api.wearaware.co/uploads/mail.png" style="display: block; height: auto; border: 0; width: 90px; max-width: 100%;" width="90"></div>
                                                                              </td>
                                                                          </tr>
                                                                      </table>
                                                                  </td>
                                                              </tr>
                                                          </tbody>
                                                      </table>
                                                  </td>
                                              </tr  >
                                          </tbody>
                                      </table>
                                      <table class="row row-3" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                          <tbody>
                                              <tr>
                                                  <td>
                                                      <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #7f8399; width: 600px;" width="600">
                                                          <tbody>
                                                              <tr>
                                                                  <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 15pt; font-weight: 400; text-align: left; padding-left: 20px; padding-right: 20px; vertical-align: top; padding-top: 5px; padding-bottom: 5px; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                                      <table class="text_block block-1" width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                                                          <tr>
                                                                              <td class="pad">
                                                                                  <div style="font-family: sans-serif">
                                                                                      <div class style="font-size: 12px; font-family: 'Inter', sans-serif; mso-line-height-alt: 14.399999999999999px; color: #555555; line-height: 1.2;">
                                                                                          <p style="margin: 0; margin-bottom: 20px; font-size: 14px; text-align: center; mso-line-height-alt: 16.8px;"><span style="color:#000000;"><strong><span style="    font-size: 1.5em;">Added as Sub-User</span></strong></span></p>
                                                                                      </div>
                                                                                  </div>
                                                                              </td>
                                                                          </tr>
                                                                      </table>
                                                                      <table class="paragraph_block block-2" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                                                          <tr>
                                                                              <td class="pad">
                                                                                  <div style="color:#7f8399;direction:ltr;font-family: 'Inter', sans-serif;font-size: 14px;font-weight:400;letter-spacing:0px;line-height:120%;text-align:left;mso-line-height-alt:19.2px;">
                                                                                    <p style="margin: 0; margin-bottom: 16px;"><span>Hi ${capitalizedString},</span></p>
                                                                                      <p style="margin: 0; margin-bottom: 16px;"><span>Greetings from Aware™!</span></p>
                                                                                      <p style="margin: 0; line-height: 21px;"><span>We’re writing to inform you that you have been added as a sub-user by administrator of Aware for ${company_name}.</span></p>
                                                                                      <p style="margin: 0;">&nbsp;</p>
                                                                                      <p style="margin: 0;">To continue your journey, kindly follow these simple instructions:</p>
                                                                                      <ul>
                                                                                      <li style="margin: 0;"><p style="margin: 0;">Click the following link: <a style="text-decoration: underline; color: #0352C9;" href="${process.env.DOMAIN}">${process.env.DOMAIN}</a></p></li>
                                                                                        <li style="margin: 0;"><p style="margin: 0;">Enter your <b>full email address.</b></p></li>
                                                                                
                                                                                      <li style="margin: 0;"><p style="margin: 0;">  Your password is made of upto first four characters of your first name (with first character as capital), dashed, and upto the first four characters of your last name (case sensitive), dashed aw with the current year</p></li>
                                                                                      <li style="margin: 0;"><p style="margin: 0;">  For example : If your first name is <b>Jane</b> and last name is <b>Doe</b>, the password will be <b>Jane-Doe-aw2025</b>.</p></li>
                                                                                    
                                                                                    
                                                                                      </ul>
                                                                                      <p style="margin-bottom: 16px; line-height: 21px;"><span>Upon your initial login, you can create a new password of your choice. We recommend selecting a password that is easy to remember.</span></p>
                                                                                      <p style="margin: 0; display:flex;"><span>We look forward to witnessing your success on the AWARE™ Platform.</span></p>
                                                                                      <p style="margin: 0;">&nbsp;</p>
                                                                                      <p style="margin: 0;"><span>Best regards,</span></p>
                                                                                      <p style="margin-bottom: 10px;"><span>The Aware™ Team</span></p>

                                                                                  </div>
                                                                              </td>
                                                                          </tr>
                                                                      </table>
                                                                      
                                                                      
                                                                  </td>
                                                              </tr>
                                                          </tbody>
                                                      </table>
                                                  </td>
                                              </tr>
                                          </tbody>
                                      </table>
                                  </td>
                              </tr>
                          </table>
                          <table class="row row-4" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                  <tbody>
                    <tr>
                      <td>
                        <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #7f8399; width: 600px;" width="600">
                          <tbody>
                            <tr>
                              <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; padding-top: 5px; padding-bottom: 5px; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                <table class="text_block block-1" width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                  <tr>
                                    <td class="pad" style="padding: 10px 0;">
                                      <div style="font-family: sans-serif">
                                        <div class style="font-size: 13px; font-family: 'Inter', sans-serif; mso-line-height-alt: 14.399999999999999px; color: #7f8399; line-height: 1.2;">
                                          <p style="margin: 0; font-size: 13px; text-align: center; mso-line-height-alt: 16.8px; color: #7f8399; "><span style="font-size:13px;">This message was produced and distributed by the Aware™ Platform, The Netherlands. All rights reserved. Aware™ is a registered trademark of The Movement IP BV. View our&nbsp;<a href="https://www.iubenda.com/privacy-policy/31166669/full-legal"  target="_blank" style="text-decoration: underline; color: #0352C9;" >privacy policy</a>.</span></p>
                                        </div>
                                      </div>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
                      
            </tr>
          </tbody>
        </table><!-- End -->
      </body>
      
      </html>`

    };
    sgMail
      .send(msg)
      .then(() => {
        return callback('success');
      })
      .catch((error) => {
        console.log({ error })
        // loggerhandler.logger.error(`${error} ,email:${req.headers.email}`);
        if (error.response) {
          const { message, code, response } = error;
          const { headers, body } = response;
          return callback(null);
        }
      });

  },
  sendManagerPasswordChangeMail: function (emailaddress, capitalizedString, callback) {
    console.log("working Shivam");
    // var currentyear = new Date().getFullYear()
    // var NextYear = new Date().getFullYear() + 1
    // var year = currentyear + '-' + NextYear;


    const msg = {
      from: sender_identity,
      to: emailaddress,
      subject:
        `Important: Your Password Has Been Changed`,
      html: `<!DOCTYPE html>
      <html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">
      
      <head>
        <title></title>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch><o:AllowPNG/></o:OfficeDocumentSettings></xml><![endif]-->
        <!--[if !mso]><!-->
              <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500&display=swap" rel="stylesheet">
        <!--<![endif]-->
        <style>
          * {
            box-sizing: border-box;
          }
      
          body {
            margin: 0;
            padding: 0; background: #f2f2f2;
          }
      
          a[x-apple-data-detectors] {
            color: inherit !important;
            text-decoration: inherit !important;
          }
      
          #MessageViewBody a {
            color: inherit;
            text-decoration: none;
          }
      
          p {
            line-height: inherit
          }
              ul li{line-height: 23px;}
      
          .desktop_hide,
          .desktop_hide table {
            mso-hide: all;
            display: none;
            max-height: 0px;
            overflow: hidden;
          }
      
          @media (max-width:620px) {
            .desktop_hide table.icons-inner {
              display: inline-block !important;
            }
      
            .icons-inner {
              text-align: center;
            }
      
            .icons-inner td {
              margin: 0 auto;
            }
      
            .row-content {
              width: 100% !important;
            }
      
            .mobile_hide {
              display: none;
            }
      
            .stack .column {
              width: 100%;
              display: block;
            }
      
            .mobile_hide {
              min-height: 0;
              max-height: 0;
              max-width: 0;
              overflow: hidden;
              font-size: 0px;
            }
      
            .desktop_hide,
            .desktop_hide table {
              display: table !important;
              max-height: none !important;
            }
          }
        </style>
      </head>
      
      <body style="background: #f2f2f2; margin: 0; padding: 0; -webkit-text-size-adjust: none; text-size-adjust: none;">
        <table class="nl-container" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background: #f2f2f2;" >
          <tbody>
            <tr>
              <td>
                          <p>&nbsp;</p>
                          <table style="background: #ffffff; box-shadow:0px 0px 10px #0000003b;  border-radius: 5px; mso-table-lspace: 0pt; width: 600px; margin-top: 50px; mso-table-rspace: 0pt; " align="center" width="600" border="0" cellpadding="0" cellspacing="0" >
                              <tr>
                                  <td >
                                      <table class="row row-1" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                          <tbody>
                                              <tr>
                                                  <td>
                                                      <p style="margin: 0;">&nbsp;</p>
                                                      <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #000000; width: 600px;" width="600">
                                                          <tbody>
                                                              <tr>
                                                                  <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; padding-top: 5px; padding-bottom: 5px; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                                      <table class="image_block block-1" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                                          <tr>
                                                                              <td class="pad" style="width:100%;padding-right:0px;padding-left:0px;">
                                                                                  <div class="alignment" align="center" style="line-height:10px"><img src="https://api.wearaware.co/uploads/aware-logo-new-mail.png" style="display: block; height: auto; border: 0; width: 200px; max-width: 100%;" width="200"></div>
                                                                              </td>
                                                                          </tr>
                                                                      </table>
                                                                  </td>
                                                              </tr>
                                                          </tbody>
                                                      </table>
                                                  </td>
                                              </tr>
                                          </tbody>
                                      </table>
                                      <table class="row row-2" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; margin-top: 5px; mso-table-rspace: 0pt;">
                                          <tbody>
                                              <tr>
                                                  <td>
                                                      <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #000000; width: 600px;" width="600">
                                                          <tbody>
                                                              <tr>
                                                                  <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; padding-top: 5px; padding-bottom: 5px; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                                      <table class="image_block block-1" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                                          <tr>
                                                                              <td class="pad" style="width:100%;padding-right:0px;padding-left:0px;">
                                                                                  <div class="alignment" align="center" style="line-height:10px"><img src="https://api.wearaware.co/uploads/mail.png" style="display: block; height: auto; border: 0; width: 90px; max-width: 100%;" width="90"></div>
                                                                              </td>
                                                                          </tr>
                                                                      </table>
                                                                  </td>
                                                              </tr>
                                                          </tbody>
                                                      </table>
                                                  </td>
                                              </tr  >
                                          </tbody>
                                      </table>
                                      <table class="row row-3" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                          <tbody>
                                              <tr>
                                                  <td>
                                                      <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #7f8399; width: 600px;" width="600">
                                                          <tbody>
                                                              <tr>
                                                                  <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 15pt; font-weight: 400; text-align: left; padding-left: 20px; padding-right: 20px; vertical-align: top; padding-top: 5px; padding-bottom: 5px; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                                      <table class="text_block block-1" width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                                                          <tr>
                                                                              <td class="pad">
                                                                                  <div style="font-family: sans-serif">
                                                                                      <div class style="font-size: 12px; font-family: 'Inter', sans-serif; mso-line-height-alt: 14.399999999999999px; color: #555555; line-height: 1.2;">
                                                                                          <p style="margin: 0; margin-bottom: 20px; font-size: 14px; text-align: center; mso-line-height-alt: 16.8px;"><span style="color:#000000;"><strong><span style="    font-size: 1.5em;">Update</span></strong></span></p>
                                                                                      </div>
                                                                                  </div>
                                                                              </td>
                                                                          </tr>
                                                                      </table>
                                                                      <table class="paragraph_block block-2" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                                                          <tr>
                                                                              <td class="pad">
                                                                                  <div style="color:#7f8399;direction:ltr;font-family: 'Inter', sans-serif;font-size: 14px;font-weight:400;letter-spacing:0px;line-height:120%;text-align:left;mso-line-height-alt:19.2px;">
                                                                                    <p style="margin: 0; margin-bottom: 16px;"><span>Hi ${capitalizedString},</span></p>
                                                                                      <p style="margin: 0; margin-bottom: 16px;"><span>Greetings from Aware™!</span></p>
                                                                                      <p style="margin: 0; line-height: 21px;"><span>We’re writing to inform you that your name has been updated by the AWARE™ admin. As a result, your password has also been changed.</span></p>
                                                                                      <p style="margin: 0;">&nbsp;</p>
                                                                                      <p style="margin: 0;">To continue your journey, kindly follow these simple instructions:</p>
                                                                                      <ul>
                                                                                      <li style="margin: 0;"><p style="margin: 0;">Click the following link: <a style="text-decoration: underline; color: #0352C9;" href="${process.env.DOMAIN}">${process.env.DOMAIN}</a></p></li>
                                                                                        <li style="margin: 0;"><p style="margin: 0;">Enter your <b>full email address.</b></p></li>
                                                                                
                                                                                      <li style="margin: 0;"><p style="margin: 0;">  Your password is made of upto first four characters of your first name (with first character as capital), dashed, and upto the first four characters of your last name (case sensitive), dashed <b>aw</b> with the current year. <br>For example : If your first name is <b>Jane</b>  and last name is <b>Doe</b>, the password will be <b>Jane-Doe-aw2025</b>.</p>
                                                                                       
                                                                                      </li>
                                                                                       
                                                                                    
                                                                                    
                                                                                      </ul>
                                                                                      <p style="margin-bottom: 10px; line-height: 21px;"><span>Upon your initial login, you can create a new password of your choice. We recommend selecting a password that is easy to remember.</span></p>
                                                                                      <p style="margin: 0; display:flex;"><span>We look forward to witnessing your success on the AWARE™ Platform.</span></p>
                                                                                      <p style="margin: 0;">&nbsp;</p>
                                                                                      <p style="margin: 0;"><span>Best regards,</span></p>
                                                                                      <p style="margin-bottom: 10px;"><span>The Aware™ Team</span></p>

                                                                                  </div>
                                                                              </td>
                                                                          </tr>
                                                                      </table>
                                                                      
                                                                      
                                                                  </td>
                                                              </tr>
                                                          </tbody>
                                                      </table>
                                                  </td>
                                              </tr>
                                          </tbody>
                                      </table>
                                  </td>
                              </tr>
                          </table>
                          <table class="row row-4" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                  <tbody>
                    <tr>
                      <td>
                        <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #7f8399; width: 600px;" width="600">
                          <tbody>
                            <tr>
                              <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; padding-top: 5px; padding-bottom: 5px; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                <table class="text_block block-1" width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                  <tr>
                                    <td class="pad" style="padding: 10px 0;">
                                      <div style="font-family: sans-serif">
                                        <div class style="font-size: 13px; font-family: 'Inter', sans-serif; mso-line-height-alt: 14.399999999999999px; color: #7f8399; line-height: 1.2;">
                                          <p style="margin: 0; font-size: 13px; text-align: center; mso-line-height-alt: 16.8px; color: #7f8399; "><span style="font-size:13px;">This message was produced and distributed by the Aware™ Platform, The Netherlands. All rights reserved. Aware™ is a registered trademark of The Movement IP BV. View our&nbsp;<a href="https://www.iubenda.com/privacy-policy/31166669/full-legal"  target="_blank" style="text-decoration: underline; color: #0352C9;" >privacy policy</a>.</span></p>
                                        </div>
                                      </div>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
                      
            </tr>
          </tbody>
        </table><!-- End -->
      </body>
      
      </html>`

    };
    sgMail
      .send(msg)
      .then(() => {
        return callback('success');
      })
      .catch((error) => {
        console.log({ error })
        // loggerhandler.logger.error(`${error} ,email:${req.headers.email}`);
        if (error.response) {
          const { message, code, response } = error;
          const { headers, body } = response;
          return callback(null);
        }
      });

  },
  sendCryptoTcMail: function (data, callback) {
    let jsonData = data
    console.log({ data })
    let total_token = 0
    const linksHtml = jsonData?.token_list?.map(ele => {
      total_token += Number(ele.To_be_Send)
      return `<li style="margin:3px;"><p style="margin:1px;">
<a style="text-decoration: underline; color: #0352C9;" href="${process.env.DOMAIN}/cryptotc/${jsonData.send_aware_token_id}-${(ele.update_aware_token_id || ele.aware_token_id)}">${(ele.asset_id || ele.update_asset_id)}</href=>
</p></li>`
    }
    ).join('');


    const msg = {
      from: sender_identity,
      to: `${jsonData?.receiver_details?.email}`,
      subject: `${jsonData?.senderKycDetails?.company_name} sent tokens to you`,
      html: `<!DOCTYPE html>
      <html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">

      <head>
        <title></title>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch><o:AllowPNG/></o:OfficeDocumentSettings></xml><![endif]-->
        <!--[if !mso]><!-->
              <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500&display=swap" rel="stylesheet">
        <!--<![endif]-->
        <style>
          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
            padding: 0; background: #f2f2f2;
          }

          a[x-apple-data-detectors] {
            color: inherit !important;
            text-decoration: inherit !important;
          }

          #MessageViewBody a {
            color: inherit;
            text-decoration: none;
          }

          p {
            line-height: inherit
          }
              ul li{line-height: 23px;}

          .desktop_hide,
          .desktop_hide table {
            mso-hide: all;
            display: none;
            max-height: 0px;
            overflow: hidden;
          }

          @media (max-width:620px) {
            .desktop_hide table.icons-inner {
              display: inline-block !important;
            }

            .icons-inner {
              text-align: center;
            }

            .icons-inner td {
              margin: 0 auto;
            }

            .row-content {
              width: 100% !important;
            }

            .mobile_hide {
              display: none;
            }

            .stack .column {
              width: 100%;
              display: block;
            }

            .mobile_hide {
              min-height: 0;
              max-height: 0;
              max-width: 0;
              overflow: hidden;
              font-size: 0px;
            }

            .desktop_hide,
            .desktop_hide table {
              display: table !important;
              max-height: none !important;
            }
          }
        </style>
      </head>

      <body style="background: #f2f2f2; margin: 0; padding: 0; -webkit-text-size-adjust: none; text-size-adjust: none;">
        <table class="nl-container" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background: #f2f2f2;" >
          <tbody>
            <tr>
              <td>
                          <p>&nbsp;</p>
                          <table style="background: #ffffff; box-shadow:0px 0px 10px #0000003b;  border-radius: 5px; mso-table-lspace: 0pt; width: 600px; margin-top: 50px; mso-table-rspace: 0pt; " align="center" width="600" border="0" cellpadding="0" cellspacing="0" >
                              <tr>
                                  <td >
                                      <table class="row row-1" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                          <tbody>
                                              <tr>
                                                  <td>
                                                      <p style="margin: 0;">&nbsp;</p>
                                                      <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #000000; width: 600px;" width="600">
                                                          <tbody>
                                                              <tr>
                                                                  <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; padding-top: 5px; padding-bottom: 5px; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                                      <table class="image_block block-1" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                                          <tr>
                                                                              <td class="pad" style="width:100%;padding-right:0px;padding-left:0px;">
                                                                                  <div class="alignment" align="center" style="line-height:10px"><img src="https://api.wearaware.co/uploads/aware-logo-new-mail.png" style="display: block; height: auto; border: 0; width: 200px; max-width: 100%;" width="200"></div>
                                                                              </td>
                                                                          </tr>
                                                                      </table>
                                                                  </td>
                                                              </tr>
                                                          </tbody>
                                                      </table>
                                                  </td>
                                              </tr>
                                          </tbody>
                                      </table>

                                      <table class="row row-3" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                          <tbody>
                                              <tr>
                                                  <td>
                                                      <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #7f8399; width: 600px;" width="600">
                                                          <tbody>
                                                              <tr>
                                                                  <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 15pt; font-weight: 400; text-align: left; padding-left: 20px; padding-right: 20px; vertical-align: top; padding-top: 5px; padding-bottom: 5px; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">

                                                                      <table class="paragraph_block block-2" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                                                          <tr>
                                                                              <td class="pad">
                                                                                  <div style="color:#7f8399;direction:ltr;font-family: 'Inter', sans-serif;font-size: 14px;font-weight:400;letter-spacing:0px;line-height:120%;text-align:left;mso-line-height-alt:19.2px;">
                                                                                    <p style="margin: 0;">&nbsp;</p>  
                                                                                      <p style="margin: 0;"><span>Hi ${jsonData?.receiverKycDetails?.company_name},</span></p>
                                                                                      <p style="margin: 0;">&nbsp;</p>
                                                                                      <p style="margin: 0;">${jsonData?.senderKycDetails?.company_name} has sent ${total_token} ${jsonData?.token_type} tokens. Please find below links of Crypto TC for each token received in this sent request:</p>
                                                                                       <ol type="A">
                                                                                       ${linksHtml}
                                                                                       </ol>
                                                                                  </div>
                                                                              </td>
                                                                          </tr>
                                                                      </table>

                                                                      <table class="paragraph_block block-4" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                                                          <tr>
                                                                              <td class="pad">
                                                                                  <div style="color:#7f8399;direction:ltr;font-family:'Open Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif;font-size: 14px;font-weight:400;letter-spacing:0px;line-height:120%;text-align:left;mso-line-height-alt:19.2px;">
                                                                                      <p style="margin: 0;">&nbsp;</p>
                                                                                      <p style="margin: 0;"><b>Thanks</b></p>
                                                                                      <p style="margin: 0;">Aware™</p>
                                                                                      <p style="margin: 0;">&nbsp;</p>
                                                                                  </div>
                                                                              </td>
                                                                          </tr>
                                                                      </table>
                                                                  </td>
                                                              </tr>
                                                          </tbody>
                                                      </table>
                                                  </td>
                                              </tr>
                                          </tbody>
                                      </table>
                                  </td>
                              </tr>
                          </table>
                          <table class="row row-4" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                  <tbody>
                    <tr>
                      <td>
                        <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #7f8399; width: 600px;" width="600">
                          <tbody>
                            <tr>
                              <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; padding-top: 5px; padding-bottom: 5px; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                <table class="text_block block-1" width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                  <tr>
                                    <td class="pad" style="padding: 10px 0;">
                                      <div style="font-family: sans-serif">
                                        <div class style="font-size: 13px; font-family: 'Inter', sans-serif; mso-line-height-alt: 14.399999999999999px; color: #7f8399; line-height: 1.2;">
                                          <p style="margin: 0; font-size: 13px; text-align: center; mso-line-height-alt: 16.8px; color: #7f8399; "><span style="font-size:13px;">This message was produced and distributed by the Aware™ Platform, The Netherlands. All rights reserved. Aware™ is a registered trademark of The Movement IP BV. View our&nbsp;<a href="https://www.iubenda.com/privacy-policy/31166669/full-legal"  target="_blank" style="text-decoration: underline; color: #0352C9;" >privacy policy</a>.</span></p>
                                        </div>
                                      </div>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>

            </tr>
          </tbody>
        </table><!-- End -->
      </body>

      </html>`
    };
    sgMail
      .send(msg)
      .then(() => {
        return callback('success');
      })
      .catch((error) => {
        console.log({ error })
        // loggerhandler.logger.error(`${error} ,email:${req.headers.email}`);
        if (error.response) {
          const { message, code, response } = error;
          const { headers, body } = response;
          return callback(null);
        }
      });

  },
  ETDMailer: async function (email, company_name, data, condition, callback) {
    console.log('mailer', { email, company_name, data, condition })
    let jsonData = data
    if (!data) return callback(null)
    try {
      if (condition == 1) {
        const msg = {
          from: sender_identity,
          to: email,
          subject: `It's time to update tokens for PO ${data.order_number}`,
          html: `<!DOCTYPE html>
      <html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">
      
      <head>
        <title></title>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch><o:AllowPNG/></o:OfficeDocumentSettings></xml><![endif]-->
        <!--[if !mso]><!-->
              <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500&display=swap" rel="stylesheet">
        <!--<![endif]-->
        <style>
          * {
            box-sizing: border-box;
          }
      
          body {
            margin: 0;
            padding: 0; background: #f2f2f2;
          }
      
          a[x-apple-data-detectors] {
            color: inherit !important;
            text-decoration: inherit !important;
          }
      
          #MessageViewBody a {
            color: inherit;
            text-decoration: none;
          }
      
          p {
            line-height: inherit
          }
              ul li{line-height: 23px;}
      
          .desktop_hide,
          .desktop_hide table {
            mso-hide: all;
            display: none;
            max-height: 0px;
            overflow: hidden;
          }
      
          @media (max-width:620px) {
            .desktop_hide table.icons-inner {
              display: inline-block !important;
            }
      
            .icons-inner {
              text-align: center;
            }
      
            .icons-inner td {
              margin: 0 auto;
            }
      
            .row-content {
              width: 100% !important;
            }
      
            .mobile_hide {
              display: none;
            }
      
            .stack .column {
              width: 100%;
              display: block;
            }
      
            .mobile_hide {
              min-height: 0;
              max-height: 0;
              max-width: 0;
              overflow: hidden;
              font-size: 0px;
            }
      
            .desktop_hide,
            .desktop_hide table {
              display: table !important;
              max-height: none !important;
            }
          }
        </style>
      </head>
      
      <body style="background: #f2f2f2; margin: 0; padding: 0; -webkit-text-size-adjust: none; text-size-adjust: none;">
        <table class="nl-container" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background: #f2f2f2;" >
          <tbody>
            <tr>
              <td>
                          <p>&nbsp;</p>
                          <table style="background: #ffffff; box-shadow:0px 0px 10px #0000003b;  border-radius: 5px; mso-table-lspace: 0pt; width: 600px; margin-top: 50px; mso-table-rspace: 0pt; " align="center" width="600" border="0" cellpadding="0" cellspacing="0" >
                              <tr>
                                  <td >
                                      <table class="row row-1" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                          <tbody>
                                              <tr>
                                                  <td>
                                                      <p style="margin: 0;">&nbsp;</p>
                                                      <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #000000; width: 600px;" width="600">
                                                          <tbody>
                                                              <tr>
                                                                  <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; padding-top: 5px; padding-bottom: 5px; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                                      <table class="image_block block-1" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                                          <tr>
                                                                              <td class="pad" style="width:100%;padding-right:0px;padding-left:0px;">
                                                                                  <div class="alignment" align="center" style="line-height:10px"><img src="https://api.wearaware.co/uploads/aware-logo-new-mail.png" style="display: block; height: auto; border: 0; width: 200px; max-width: 100%;" width="200"></div>
                                                                              </td>
                                                                          </tr>
                                                                      </table>
                                                                  </td>
                                                              </tr>
                                                          </tbody>
                                                      </table>
                                                  </td>
                                              </tr>
                                          </tbody>
                                      </table>
                                   
                                      <table class="row row-3" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                          <tbody>
                                              <tr>
                                                  <td>
                                                      <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #7f8399; width: 600px;" width="600">
                                                          <tbody>
                                                              <tr>
                                                                  <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 15pt; font-weight: 400; text-align: left; padding-left: 20px; padding-right: 20px; vertical-align: top; padding-top: 5px; padding-bottom: 5px; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                                      <table class="text_block block-1" width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                                                          <tr>
                                                                              <td style="padding-left: 0;" class="pad">
                                                                                  <div style="font-family: sans-serif">
                                                                                      <div class style="font-size: 12px; font-family: 'Inter', sans-serif; mso-line-height-alt: 14.399999999999999px; color: #555555; line-height: 1.2;">
                                                                                          <p style="margin: 0; margin-bottom: 20px; font-size: 12px; text-align: left; mso-line-height-alt: 16.8px;"><span style="color:#7f8399;"><strong><span style="font-size: 1.5em;">REMINDER</span></strong></span></p>
                                                                                      </div>
                                                                                  </div>
                                                                              </td>
                                                                          </tr>
                                                                      </table>
                                                                      <table class="paragraph_block block-2" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                                                          <tr>
                                                                              <td class="pad">
                                                                                  <div style="color:#7f8399;direction:ltr;font-family: 'Inter', sans-serif;font-size: 14px;font-weight:400;letter-spacing:0px;line-height:120%;text-align:left;mso-line-height-alt:19.2px;">
                                                                                    <p style="margin: 0; margin-bottom: 16px;"><span>Hi ${company_name},</span></p>
                                                                                      <p style="margin: 0; margin-bottom: 16px;"><span>Greetings from Aware™. We are here to help you. We discovered a potential issue:</span></p>
                                                                                      <p style="margin: 0; line-height: 21px;"><span>The ETD for <b>${jsonData?.order_number}</b> of your customer <b>${jsonData.brand}</b> is within a week from now, but you have not added data. Please finish the token update ASAP!</span></p>
                                                                                 
                                                                                      <p style="margin: 0;">&nbsp;</p>
                                                                                      <p style="margin: 0;"><span>Best regards,</span></p>
                                                                                      <p style="margin-bottom: 10px;"><span>The Aware™ Team</span></p>

                                                                                  </div>
                                                                              </td>
                                                                          </tr>
                                                                      </table>
                                                                      
                                                                      
                                                                  </td>
                                                              </tr>
                                                          </tbody>
                                                      </table>
                                                  </td>
                                              </tr>
                                          </tbody>
                                      </table>
                                  </td>
                              </tr>
                          </table>
                          <table class="row row-4" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                  <tbody>
                    <tr>
                      <td>
                        <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #7f8399; width: 600px;" width="600">
                          <tbody>
                            <tr>
                              <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; padding-top: 5px; padding-bottom: 5px; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                <table class="text_block block-1" width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                  <tr>
                                    <td class="pad" style="padding: 10px 0;">
                                      <div style="font-family: sans-serif">
                                        <div class style="font-size: 13px; font-family: 'Inter', sans-serif; mso-line-height-alt: 14.399999999999999px; color: #7f8399; line-height: 1.2;">
                                          <p style="margin: 0; font-size: 13px; text-align: center; mso-line-height-alt: 16.8px; color: #7f8399; "><span style="font-size:13px;">This message was produced and distributed by the Aware™ Platform, The Netherlands. All rights reserved. Aware™ is a registered trademark of The Movement IP BV. View our&nbsp;<a href="https://www.iubenda.com/privacy-policy/31166669/full-legal"  target="_blank" style="text-decoration: underline; color: #0352C9;" >privacy policy</a>.</span></p>
                                        </div>
                                      </div>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
                      
            </tr>
          </tbody>
        </table><!-- End -->
      </body>
      
      </html>`

        };
        await sgMail
          .send(msg)
          .then(() => {
            return callback('success');
          })
          .catch((error) => {
            console.log('1', { error })
            // loggerhandler.logger.error(`${error} ,email:${req.headers.email}`);
            if (error.response) {
              const { message, code, response } = error;
              const { headers, body } = response;
              return callback(null);
            }
          });
      } else if (condition == 2) {
        const msg = {
          from: sender_identity,
          to: email,
          subject: `Immediate Action Required for PO ${data.order_number}`,
          html: `<!DOCTYPE html>
      <html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">
      
      <head>
        <title></title>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch><o:AllowPNG/></o:OfficeDocumentSettings></xml><![endif]-->
        <!--[if !mso]><!-->
              <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500&display=swap" rel="stylesheet">
        <!--<![endif]-->
        <style>
          * {
            box-sizing: border-box;
          }
      
          body {
            margin: 0;
            padding: 0; background: #f2f2f2;
          }
      
          a[x-apple-data-detectors] {
            color: inherit !important;
            text-decoration: inherit !important;
          }
      
          #MessageViewBody a {
            color: inherit;
            text-decoration: none;
          }
      
          p {
            line-height: inherit
          }
              ul li{line-height: 23px;}
      
          .desktop_hide,
          .desktop_hide table {
            mso-hide: all;
            display: none;
            max-height: 0px;
            overflow: hidden;
          }
      
          @media (max-width:620px) {
            .desktop_hide table.icons-inner {
              display: inline-block !important;
            }
      
            .icons-inner {
              text-align: center;
            }
      
            .icons-inner td {
              margin: 0 auto;
            }
      
            .row-content {
              width: 100% !important;
            }
      
            .mobile_hide {
              display: none;
            }
      
            .stack .column {
              width: 100%;
              display: block;
            }
      
            .mobile_hide {
              min-height: 0;
              max-height: 0;
              max-width: 0;
              overflow: hidden;
              font-size: 0px;
            }
      
            .desktop_hide,
            .desktop_hide table {
              display: table !important;
              max-height: none !important;
            }
          }
        </style>
      </head>
      
      <body style="background: #f2f2f2; margin: 0; padding: 0; -webkit-text-size-adjust: none; text-size-adjust: none;">
        <table class="nl-container" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background: #f2f2f2;" >
          <tbody>
            <tr>
              <td>
                          <p>&nbsp;</p>
                          <table style="background: #ffffff; box-shadow:0px 0px 10px #0000003b;  border-radius: 5px; mso-table-lspace: 0pt; width: 600px; margin-top: 50px; mso-table-rspace: 0pt; " align="center" width="600" border="0" cellpadding="0" cellspacing="0" >
                              <tr>
                                  <td >
                                      <table class="row row-1" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                          <tbody>
                                              <tr>
                                                  <td>
                                                      <p style="margin: 0;">&nbsp;</p>
                                                      <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #000000; width: 600px;" width="600">
                                                          <tbody>
                                                              <tr>
                                                                  <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; padding-top: 5px; padding-bottom: 5px; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                                      <table class="image_block block-1" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                                          <tr>
                                                                              <td class="pad" style="width:100%;padding-right:0px;padding-left:0px;">
                                                                                  <div class="alignment" align="center" style="line-height:10px"><img src="https://api.wearaware.co/uploads/aware-logo-new-mail.png" style="display: block; height: auto; border: 0; width: 200px; max-width: 100%;" width="200"></div>
                                                                              </td>
                                                                          </tr>
                                                                      </table>
                                                                  </td>
                                                              </tr>
                                                          </tbody>
                                                      </table>
                                                  </td>
                                              </tr>
                                          </tbody>
                                      </table>
                                 
                                      <table class="row row-3" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                          <tbody>
                                              <tr>
                                                  <td>
                                                      <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #7f8399; width: 600px;" width="600">
                                                          <tbody>
                                                              <tr>
                                                                  <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 15pt; font-weight: 400; text-align: left; padding-left: 20px; padding-right: 20px; vertical-align: top; padding-top: 5px; padding-bottom: 5px; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                                      <table class="text_block block-1" width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                                                          <tr>
                                                                              <td style="padding-left: 0;" class="pad">
                                                                                  <div style="font-family: sans-serif">
                                                                                      <div class style="font-size: 12px; font-family: 'Inter', sans-serif; mso-line-height-alt: 14.399999999999999px; color: #555555; line-height: 1.2;">
                                                                                          <p style="margin: 0; margin-bottom: 20px; font-size: 12px; text-align: left; mso-line-height-alt: 16.8px;"><span style="color:#7f8399;"><strong><span style="    font-size: 1.5em;">URGENT</span></strong></span></p>
                                                                                      </div>
                                                                                  </div>
                                                                              </td>
                                                                          </tr>
                                                                      </table>
                                                                      <table class="paragraph_block block-2" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                                                          <tr>
                                                                              <td class="pad">
                                                                                  <div style="color:#7f8399;direction:ltr;font-family: 'Inter', sans-serif;font-size: 14px;font-weight:400;letter-spacing:0px;line-height:120%;text-align:left;mso-line-height-alt:19.2px;">
                                                                                    <p style="margin: 0; margin-bottom: 16px;"><span>Hi ${company_name},</span></p>
                                                                                      <p style="margin: 0; margin-bottom: 16px;"><span>Greetings from Aware™. We are here to help you. We discovered an issue:</span></p>
                                                                                      <p style="margin: 0; line-height: 21px;"><span>The ETD for <b> ${jsonData.order_number}</b> of your customer <b> ${jsonData.brand}</b> has already been passed, but you have not added data. DPP must be live now. Add
                                                                                        token data urgently!</span></p>
                                                                                 
                                                                                      <p style="margin: 0;">&nbsp;</p>
                                                                                      <p style="margin: 0;"><span>Best regards,</span></p>
                                                                                      <p style="margin-bottom: 10px;"><span>The Aware™ Team</span></p>

                                                                                  </div>
                                                                              </td>
                                                                          </tr>
                                                                      </table>
                                                                      
                                                                      
                                                                  </td>
                                                              </tr>
                                                          </tbody>
                                                      </table>
                                                  </td>
                                              </tr>
                                          </tbody>
                                      </table>
                                  </td>
                              </tr>
                          </table>
                          <table class="row row-4" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                  <tbody>
                    <tr>
                      <td>
                        <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #7f8399; width: 600px;" width="600">
                          <tbody>
                            <tr>
                              <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; padding-top: 5px; padding-bottom: 5px; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                <table class="text_block block-1" width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                  <tr>
                                    <td class="pad" style="padding: 10px 0;">
                                      <div style="font-family: sans-serif">
                                        <div class style="font-size: 13px; font-family: 'Inter', sans-serif; mso-line-height-alt: 14.399999999999999px; color: #7f8399; line-height: 1.2;">
                                          <p style="margin: 0; font-size: 13px; text-align: center; mso-line-height-alt: 16.8px; color: #7f8399; "><span style="font-size:13px;">This message was produced and distributed by the Aware™ Platform, The Netherlands. All rights reserved. Aware™ is a registered trademark of The Movement IP BV. View our&nbsp;<a href="https://www.iubenda.com/privacy-policy/31166669/full-legal"  target="_blank" style="text-decoration: underline; color: #0352C9;" >privacy policy</a>.</span></p>
                                        </div>
                                      </div>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
                      
            </tr>
          </tbody>
        </table><!-- End -->
      </body>
      
      </html>`

        };
        await sgMail
          .send(msg)
          .then(() => {
            return callback('success');
          })
          .catch((error) => {
            console.log('2', { error })
            // loggerhandler.logger.error(`${error} ,email:${req.headers.email}`);
            if (error.response) {
              const { message, code, response } = error;
              const { headers, body } = response;
              return callback(null);
            }
          });
      }
    } catch (error) {
      console.log('error', { error })
    }

  },


  sendfeedMail: function (feedbackData, callback) {

    // var currentyear = new Date().getFullYear()
    // var NextYear = new Date().getFullYear() + 1
    // var year = currentyear + '-' + NextYear;


    const email = sender_identity
    const msg = {
      from: sender_identity,
      // to: 'designerdeepak01@gmail.com',
      to: email,
      subject:
        `DPP User Feedback`,
      html: `<!DOCTYPE html>
      <html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">
      
      <head>
        <title></title>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        
              <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500&display=swap" rel="stylesheet">
        <style>
          * {
            box-sizing: border-box;
          }
      
          body {
            margin: 0;
            padding: 0; background: #f2f2f2;
          }
      
          a[x-apple-data-detectors] {
            color: inherit !important;
            text-decoration: inherit !important;
          }
      
          #MessageViewBody a {
            color: inherit;
            text-decoration: none;
          }
      
          p {
            line-height: inherit
          }
              ul li{line-height: 23px;}
      
          .desktop_hide,
          .desktop_hide table {
            mso-hide: all;
            display: none;
            max-height: 0px;
            overflow: hidden;
          }
      
          @media (max-width:620px) {
            .desktop_hide table.icons-inner {
              display: inline-block !important;
            }
      
            .icons-inner {
              text-align: center;
            }
      
            .icons-inner td {
              margin: 0 auto;
            }
      
            .row-content {
              width: 100% !important;
            }
      
            .mobile_hide {
              display: none;
            }
      
            .stack .column {
              width: 100%;
              display: block;
            }
      
            .mobile_hide {
              min-height: 0;
              max-height: 0;
              max-width: 0;
              overflow: hidden;
              font-size: 0px;
            }
      
            .desktop_hide,
            .desktop_hide table {
              display: table !important;
              max-height: none !important;
            }
          }
        </style>
      </head>
      
      <body style="background: #f2f2f2; margin: 0; padding: 0; -webkit-text-size-adjust: none; text-size-adjust: none;">
        <table class="nl-container" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background: #f2f2f2;" >
          <tbody>
            <tr>
              <td>
                          <p>&nbsp;</p>
                          <table style="background: #ffffff; box-shadow:0px 0px 10px #0000003b;  border-radius: 5px; mso-table-lspace: 0pt; width: 600px; margin-top: 50px; mso-table-rspace: 0pt; " align="center" width="600" border="0" cellpadding="0" cellspacing="0" >
                              <tr>
                                  <td >
                                      <table class="row row-1" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                          <tbody>
                                              <tr>
                                                  <td>
                                                      <p style="margin: 0;">&nbsp;</p>
                                                      <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #000000; width: 600px;" width="600">
                                                          <tbody>
                                                              <tr>
                                                                  <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; padding-top: 5px; padding-bottom: 5px; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                                      <table class="image_block block-1" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                                          <tr>
                                                                              <td class="pad" style="width:100%;padding-right:0px;padding-left:0px;">
                                                                                  <div class="alignment" align="center" style="line-height:10px"><img src="https://api.wearaware.co/uploads/aware-logo-new-mail.png" style="display: block; height: auto; border: 0; width: 200px; max-width: 100%;" width="200"></div>
                                                                              </td>
                                                                          </tr>
                                                                      </table>
                                                                  </td>
                                                              </tr>
                                                          </tbody>
                                                      </table>
                                                  </td>
                                              </tr>
                                          </tbody>
                                      </table>
                                      <table class="row row-2" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; margin-top: 5px; mso-table-rspace: 0pt;">
                                          <tbody>
                                              <tr>
                                                  <td>
                                                      <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #000000; width: 600px;" width="600">
                                                          <tbody>
                                                              <tr>
                                                                  <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; padding-top: 5px; padding-bottom: 5px; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                                      <table class="image_block block-1" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                                          <tr>
                                                                              <td class="pad" style="width:100%;padding-right:0px;padding-left:0px;">
                                                                                  <div class="alignment" align="center" style="line-height:10px"><img src="https://api.wearaware.co/uploads/mail.png" style="display: block; height: auto; border: 0; width: 90px; max-width: 100%;" width="90"></div>
                                                                              </td>
                                                                          </tr>
                                                                      </table>
                                                                  </td>
                                                              </tr>
                                                          </tbody>
                                                      </table>
                                                  </td>
                                              </tr>
                                          </tbody>
                                      </table>
                                      <table class="row row-3" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                          <tbody>
                                              <tr>
                                                  <td>
                                                      <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #7f8399; width: 600px;" width="600">
                                                          <tbody>
                                                              <tr>
                                                                  <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 15pt; font-weight: 400; text-align: left; padding-left: 20px; padding-right: 20px; vertical-align: top; padding-top: 5px; padding-bottom: 5px; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                                      <table class="text_block block-1" width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                                                          <tr>
                                                                              <td class="pad" style="padding-left:0">
                                                                                  <div style="font-family: sans-serif">
                                                                                      <div class style="font-size: 12px; font-family: 'Inter', sans-serif; mso-line-height-alt: 14.399999999999999px; color: #555555; line-height: 1.2;">
                                                                                          <p style="margin: 0; margin-bottom: 20px; font-size: 14px; text-align: center; mso-line-height-alt: 16.8px;"><span style="color:#000000;"><strong><span style=" font-size: 1.5em;"> Feedback</span></strong></span></p>
                                                                                      </div>
                                                                                  </div>
                                                                              </td>
                                                                          </tr>
                                                                      </table>
                                                                      <table class="paragraph_block block-2" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                                                          <tr>
                                                                              <td class="pad">
                                                                                  <div style="color:#7f8399;direction:ltr;font-family: 'Inter', sans-serif;font-size: 14px;font-weight:400;letter-spacing:0px;line-height:120%;text-align:left;mso-line-height-alt:19.2px;">
                                                                                      <p style="margin: 0;"><span>${feedbackData.feedback}</span></p>
                                                                                       <p style="margin: 0;" >&nbsp;</p>
                                                                                    <p style="margin: 0;"><span><a style="text-decoration: underline; color: #0352C9;" href="${feedbackData.passport_url}">${feedbackData.passport_url}</a></span></p>
                                                                                    <p style="margin: 0;">&nbsp;</p>
                                                                                      </div>
                                                                              </td>
                                                                          </tr>
                                                                      </table>
                                                                      
                                                              
                                                                  </td>
                                                              </tr>
                                                          </tbody>
                                                      </table>
                                                  </td>
                                              </tr>
                                          </tbody>
                                      </table>
                                  </td>
                              </tr>
                          </table>
                          <table class="row row-4" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                  <tbody>
                    <tr>
                      <td>
                        <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #7f8399; width: 600px;" width="600">
                          <tbody>
                            <tr>
                              <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; padding-top: 5px; padding-bottom: 5px; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                <table class="text_block block-1" width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                  <tr>
                                    <td class="pad" style="padding: 10px 0;">
                                      <div style="font-family: sans-serif">
                                        <div class style="font-size: 13px; font-family: 'Inter', sans-serif; mso-line-height-alt: 14.399999999999999px; color: #7f8399; line-height: 1.2;">
                                          <p style="margin: 0; font-size: 13px; text-align: center; mso-line-height-alt: 16.8px; color: #7f8399; "><span style="font-size:13px;">This message was produced and distributed by the Aware™ Platform, The Netherlands. All rights reserved. Aware™ is a registered trademark of The Movement IP BV. View our&nbsp;<a href="https://www.iubenda.com/privacy-policy/31166669/full-legal" target="_blank"  style="text-decoration: underline; color: #0352C9;" >privacy policy</a>.</span></p>
                                        </div>
                                      </div>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
                      
            </tr>
          </tbody>
        </table>
      </body>
      
      </html>`
    };
    sgMail
      .send(msg)
      .then(() => {
        return callback('success');
      })
      .catch((error) => {

        console.log("error", error)
        if (error.response) {
          const { message, code, response } = error;
          const { headers, body } = response;
          return callback(null);
        }
      });

  },

  sendQRUpdationMail: function (emailaddress, item_numbers, final_brand_name) {

    // var currentyear = new Date().getFullYear()
    // var NextYear = new Date().getFullYear() + 1
    // var year = currentyear + '-' + NextYear;


    const msg = {
      from: sender_identity,
      to: emailaddress,
      subject:
        `Brand Name Updated on QR Codes for Item_Number`,
      html: `<!DOCTYPE html>
      <html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">
      
      <head>
        <title></title>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        
              <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500&display=swap" rel="stylesheet">
        <style>
          * {
            box-sizing: border-box;
          }
      
          body {
            margin: 0;
            padding: 0; background: #f2f2f2;
          }
      
          a[x-apple-data-detectors] {
            color: inherit !important;
            text-decoration: inherit !important;
          }
      
          #MessageViewBody a {
            color: inherit;
            text-decoration: none;
          }
      
          p {
            line-height: inherit
          }
              ul li{line-height: 23px;}
      
          .desktop_hide,
          .desktop_hide table {
            mso-hide: all;
            display: none;
            max-height: 0px;
            overflow: hidden;
          }
      
          @media (max-width:620px) {
            .desktop_hide table.icons-inner {
              display: inline-block !important;
            }
      
            .icons-inner {
              text-align: center;
            }
      
            .icons-inner td {
              margin: 0 auto;
            }
      
            .row-content {
              width: 100% !important;
            }
      
            .mobile_hide {
              display: none;
            }
      
            .stack .column {
              width: 100%;
              display: block;
            }
      
            .mobile_hide {
              min-height: 0;
              max-height: 0;
              max-width: 0;
              overflow: hidden;
              font-size: 0px;
            }
      
            .desktop_hide,
            .desktop_hide table {
              display: table !important;
              max-height: none !important;
            }
          }
        </style>
      </head>
      
      <body style="background: #f2f2f2; margin: 0; padding: 0; -webkit-text-size-adjust: none; text-size-adjust: none;">
        <table class="nl-container" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background: #f2f2f2;" >
          <tbody>
            <tr>
              <td>
                          <p>&nbsp;</p>
                          <table style="background: #ffffff; box-shadow:0px 0px 10px #0000003b;  border-radius: 5px; mso-table-lspace: 0pt; width: 600px; margin-top: 50px; mso-table-rspace: 0pt; " align="center" width="600" border="0" cellpadding="0" cellspacing="0" >
                              <tr>
                                  <td >
                                      <table class="row row-1" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                          <tbody>
                                              <tr>
                                                  <td>
                                                      <p style="margin: 0;">&nbsp;</p>
                                                      <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #000000; width: 600px;" width="600">
                                                          <tbody>
                                                              <tr>
                                                                  <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; padding-top: 5px; padding-bottom: 5px; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                                      <table class="image_block block-1" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                                          <tr>
                                                                              <td class="pad" style="width:100%;padding-right:0px;padding-left:0px;">
                                                                                  <div class="alignment" align="center" style="line-height:10px"><img src="https://api.wearaware.co/uploads/aware-logo-new-mail.png" style="display: block; height: auto; border: 0; width: 200px; max-width: 100%;" width="200"></div>
                                                                              </td>
                                                                          </tr>
                                                                      </table>
                                                                  </td>
                                                              </tr>
                                                          </tbody>
                                                      </table>
                                                  </td>
                                              </tr>
                                          </tbody>
                                      </table>
                                      <table class="row row-2" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; margin-top: 5px; mso-table-rspace: 0pt;">
                                          <tbody>
                                              <tr>
                                                  <td>
                                                      <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #000000; width: 600px;" width="600">
                                                          <tbody>
                                                              <tr>
                                                                  <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; padding-top: 5px; padding-bottom: 5px; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                                      <table class="image_block block-1" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                                          <tr>
                                                                              <td class="pad" style="width:100%;padding-right:0px;padding-left:0px;">
                                                                                  <div class="alignment" align="center" style="line-height:10px"><img src="https://api.wearaware.co/uploads/mail.png" style="display: block; height: auto; border: 0; width: 90px; max-width: 100%;" width="90"></div>
                                                                              </td>
                                                                          </tr>
                                                                      </table>
                                                                  </td>
                                                              </tr>
                                                          </tbody>
                                                      </table>
                                                  </td>
                                              </tr>
                                          </tbody>
                                      </table>
                                      <table class="row row-3" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                          <tbody>
                                              <tr>
                                                  <td>
                                                      <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #7f8399; width: 600px;" width="600">
                                                          <tbody>
                                                              <tr>
                                                                  <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 15pt; font-weight: 400; text-align: left; padding-left: 20px; padding-right: 20px; vertical-align: top; padding-top: 5px; padding-bottom: 5px; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                                      <table class="text_block block-1" width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                                                          <tr>
                                                                              <td class="pad">
                                                                                  <div style="font-family: sans-serif">
                                                                                      <div class style="font-size: 12px; font-family: 'Inter', sans-serif; mso-line-height-alt: 14.399999999999999px; color: #555555; line-height: 1.2;">
                                                                                          <p style="margin: 0; margin-bottom: 20px; font-size: 14px; text-align: center; mso-line-height-alt: 16.8px;"><span style="color:#000000;"><strong><span style=" font-size: 1.5em;"> Brand Name Updated on QR Codes</span></strong></span></p>
                                                                                      </div>
                                                                                  </div>
                                                                              </td>
                                                                          </tr>
                                                                      </table>
                                                                      <table class="paragraph_block block-2" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                                                          <tr>
                                                                              <td class="pad">
                                                                                  <div style="color:#7f8399;direction:ltr;font-family: 'Inter', sans-serif;font-size: 14px;font-weight:400;letter-spacing:0px;line-height:120%;text-align:left;mso-line-height-alt:19.2px;">
                                                                                    <p style="margin: 0; margin-bottom: 16px;"><span>Hi ${final_brand_name}</span></p>
                                                                                      <p style="margin: 0; margin-bottom: 16px;"><span>Greetings from Aware™.</span></p>

                                                                                      <p style="margin: 0;"><span>We are pleased to inform you that the Brand name on the QR codes for all line items associated with ${item_numbers} have been successfully updated. <br><br>
                                                                                        This update reflects the recent change you made to the Brand associated with this product.
                                                                                      </span></p>
                                                                                      <p style="margin: 0;">&nbsp;</p>
                                                                                      <!-- <p style="margin: 0;">Click the button below to sign up for an account:
                                                                                      </p> -->
                                                                                      <!-- <p style="margin: 0;">&nbsp;</p> -->
                                                                                      <div class="alignment" align="left"><!--[if mso]><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${process.env.DOMAIN}/register" style="height:32px;width:101px;v-text-anchor:middle;" arcsize="75%" stroke="false" fillcolor="#0352C9"><w:anchorlock/><v:textbox inset="0px,0px,0px,0px"><center style="color:#ffffff; font-family:Arial, sans-serif; font-size:16px"><![endif]-->
                                                                                        <!-- <a href="${process.env.DOMAIN}/register" target="_blank" style="text-decoration:none;display:inline-block;color:#ffffff;background-color:#0352C9;border-radius:24px;width:auto;border-top:0px solid transparent;font-weight:400;border-right:0px solid transparent;border-bottom:0px solid transparent;border-left:0px solid transparent;padding-top:0px;padding-bottom:0px;font-family: 'Inter', sans-serif;text-align:center;mso-border-alt:none;word-break:keep-all;"><span style="padding-left:25px;padding-right:25px;font-size:14px;display:inline-block;letter-spacing:normal;"><span style="font-family: 'Inter', sans-serif; line-height: 32px;">Signup</span></span></a>[if mso]></center></v:textbox></v:roundrect><![endif]</div> -->
                                                                                      <!-- <p style="margin: 0;">&nbsp;</p>
                                                                                      <p style="margin: 0;"><span>If you have issue with viewing the above button, try to copy and paste the link below in your web browser:</span></p>
                                                                                      <p style="margin: 0;">&nbsp;</p>
                                                                                      <p style="margin: 0;"><span><a style="text-decoration: underline; color: #0352C9;" href="${process.env.DOMAIN}">${process.env.DOMAIN}</a></span></p>
                                                                                      <p style="margin: 0;">&nbsp;</p>-->
                                                                                      <p style="margin: 0;">Best regards,<br>
                                                                                      Aware™ Support </p> 
                                                                                  </div>
                                                                              </td>
                                                                          </tr>
                                                                      </table>
                                                                      
                                                                      <table class="paragraph_block block-4" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                                                          <tr>
                                                                              <td class="pad">
                                                                                  <div style="color:#7f8399;direction:ltr;font-family:'Open Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif;font-size: 14px;font-weight:400;letter-spacing:0px;line-height:120%;text-align:left;mso-line-height-alt:19.2px;">
                                                                                      <p style="margin: 0;">&nbsp;</p>
                                                                                      <p style="margin: 0;"><strong><span style="color: #000000;">Contact us:&nbsp;</span></strong><a href="mailto:support@wearaware.co" style="text-decoration: none; color: #7f8399;">support@wearaware.co</a></p>
                                                                                      <p style="margin: 0;">&nbsp;</p>
                                                                                  </div>
                                                                              </td>
                                                                          </tr>
                                                                      </table>
                                                                  </td>
                                                              </tr>
                                                          </tbody>
                                                      </table>
                                                  </td>
                                              </tr>
                                          </tbody>
                                      </table>
                                  </td>
                              </tr>
                          </table>
                          <table class="row row-4" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                  <tbody>
                    <tr>
                      <td>
                        <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #7f8399; width: 600px;" width="600">
                          <tbody>
                            <tr>
                              <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; padding-top: 5px; padding-bottom: 5px; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                <table class="text_block block-1" width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                  <tr>
                                    <td class="pad" style="padding: 10px 0;">
                                      <div style="font-family: sans-serif">
                                        <div class style="font-size: 13px; font-family: 'Inter', sans-serif; mso-line-height-alt: 14.399999999999999px; color: #7f8399; line-height: 1.2;">
                                          <p style="margin: 0; font-size: 13px; text-align: center; mso-line-height-alt: 16.8px; color: #7f8399; "><span style="font-size:13px;">This message was produced and distributed by the Aware™ Platform, The Netherlands. All rights reserved. Aware™ is a registered trademark of The Movement IP BV. View our&nbsp;<a href="https://www.iubenda.com/privacy-policy/31166669/full-legal" target="_blank"  style="text-decoration: underline; color: #0352C9;" >privacy policy</a>.</span></p>
                                        </div>
                                      </div>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
                      
            </tr>
          </tbody>
        </table>
      </body>
      
      </html>`
    };
    sgMail
      .send(msg)
      .then(() => {
        // return callback('success');
      })
      .catch((error) => {
        console.log("error", error);
        if (error.response) {
          const { message, code, response } = error;
          const { headers, body } = response;
          // return callback(null);
        }
      });

  },
}


