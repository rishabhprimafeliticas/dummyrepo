var jwt = require("jsonwebtoken");
var user_details = require("../models/account_details");
var kyc_details = require("../models/kyc_details");
var user_roles = require("../models/user_role");
var account_availability = require("../models/account_availability");
var purchase_order_details = require("../models/purchase_order_details");
var purchase_orders = require("../models/purchase_orders");
var notifications = require("../models/notifications");
var SendGrid = require("./send-grid");
var moment = require("moment");
const loggerhandler = require('../logger/log');
var mongoose = require('mongoose');

module.exports = {

  ETDNotificationSync: async () => {
    try {

      let customDate = moment().format('DD/MM/YYYY');

      const user_list = await user_details.aggregate([
        { $match: { email: { $ne: 'nullarwareemail@gmail.com' }, is_deleted: { $ne: true },sub_user: { $ne: true }, status: { $ne: false }, role_id: { $in: [6, 7] } } },
        { "$addFields": { "kycid": { "$toObjectId": "$kyc_id" } } },
        { $lookup: { from: "kyc_details", localField: "kycid", foreignField: "_id", as: "details_avaliable" } },
        { $addFields: { details_avaliable: { $arrayElemAt: ["$details_avaliable", 0] } } },
        {
          $set: {
            "aware_id": "$details_avaliable.aware_id",
            "kyc_status": "$details_avaliable.kyc_status",
            "company_name": "$details_avaliable.company_name",
          }
        },
        { $match: { kyc_status: "3" } },
        { $project: { "_id": 0, "email": 1, "company_name": 1, "aware_id": 1, "role_id": 1 } },
      ]);

      // console.debug(user_list)
      const function1 = async (data) => {
        let NextsevenDaysStart = moment().add(7, 'days').startOf('day').toDate();
        let NextsevenDaysEnd = moment().add(7, 'days').endOf('day').toDate();

        let purchase_order_ETD_list = await purchase_order_details.aggregate([
          { $match: { $or: [{ producer_aware_id: data?.aware_id }, { _awareid: data?.aware_id }] } },
          { "$addFields": { "poid": { "$toObjectId": "$po_id" } } },
          { $lookup: { from: "purchase_orders", localField: "poid", foreignField: "_id", as: "details_avaliable" } },
          { $addFields: { details_avaliable: { $arrayElemAt: ["$details_avaliable", 0] } } },
          {
            $set: {
              "po_status": "$details_avaliable.status",
              "hide": "$details_avaliable.hide",
            }
          },
          { $match: { etd: { $gte: NextsevenDaysStart, $lte: NextsevenDaysEnd }, po_status: "SEND", hide: { $ne: true } } },
          { $project: { "_id": 0, "producer": 1, "order_number": 1, "brand": 1, "etd": 1, "_awareid": 1, "producer_aware_id": 1 } },
        ]);

        for (let item of purchase_order_ETD_list) {
          if (data.role_id == 6) {
            let previous_notification_producer = await notifications.findOne({
              notification_sent_to: item.producer_aware_id,
              date: customDate,
              message: `The ETD ${moment(item.etd).format('DD/MM/YYYY')} for PO ${item.order_number} of ${item.brand} is approaching within a week. Please take action to complete the token update, connect to line items and manager approval ASAP.`
            });

            if (!previous_notification_producer) {
              await notifications.create({
                notification_sent_to: item.producer_aware_id,
                date: customDate,
                message: `The ETD ${moment(item.etd).format('DD/MM/YYYY')} for PO ${item.order_number} of ${item.brand} is approaching within a week. Please take action to complete the token update, connect to line items and manager approval ASAP.`
              });

              SendGrid.ETDMailer(data.email, item.producer, item, 1, (result) => {
                if (result == null) {
                  loggerhandler.logger.debug(`Internal error! Please Re-send Verification link to Manager email address`);
                  // console.error("Internal error! Please Re-send Verification link to Manager email address.");
                }
              });
            }
          } else {
            let previous_notification_finalbrand = await notifications.findOne({
              notification_sent_to: item._awareid,
              date: customDate,
              message: `The ETD for PO ${item.order_number} sent to ${item.producer} is approaching within a week. Please take action to remind the ${item.producer}.`
            });

            if (!previous_notification_finalbrand) {
              await notifications.create({
                notification_sent_to: item._awareid,
                date: customDate,
                message: `The ETD for PO ${item.order_number} sent to ${item.producer} is approaching within a week. Please take action to remind the ${item.producer}.`
              });
            }
          }
        }
      };

      const function2 = async (data) => {
        let LastDaysStart = moment().subtract(1, 'days').startOf('day').toDate();
        let LastDaysEnd = moment().subtract(1, 'days').endOf('day').toDate();

        let last_purchase_order_ETD_list = await purchase_order_details.aggregate([
          { $match: { $or: [{ producer_aware_id: data?.aware_id }, { _awareid: data?.aware_id }] } },
          { "$addFields": { "poid": { "$toObjectId": "$po_id" } } },
          { $lookup: { from: "purchase_orders", localField: "poid", foreignField: "_id", as: "details_avaliable" } },
          { $addFields: { details_avaliable: { $arrayElemAt: ["$details_avaliable", 0] } } },
          {
            $set: {
              "po_status": "$details_avaliable.status",
              "hide": "$details_avaliable.hide",
            }
          },
          { $match: { etd: { $gte: LastDaysStart, $lte: LastDaysEnd }, po_status: "SEND", hide: { $ne: true } } },
          { $project: { "_id": 0, "producer": 1, "order_number": 1, "brand": 1, "etd": 1, "_awareid": 1, "producer_aware_id": 1 } },
        ]);
        // console.debug({awareid:data?.aware_id},last_purchase_order_ETD_list)
        for (let item of last_purchase_order_ETD_list) {
          if (data.role_id == 6) {
            let previous_notification_producer = await notifications.findOne({
              notification_sent_to: item.producer_aware_id,
              date: customDate,
              message: `Alert! The ETD for PO ${item.order_number} of ${item.brand} has already passed. You have missed the ETD deadline. Please finish the token update ASAP.`
            });

            if (!previous_notification_producer) {
              await notifications.create({
                notification_sent_to: item.producer_aware_id,
                date: customDate,
                message: `Alert! The ETD for PO ${item.order_number} of ${item.brand} has already passed. You have missed the ETD deadline. Please finish the token update ASAP.`
              });

              SendGrid.ETDMailer(data.email, item.producer, item, 2, (result) => {
                if (result == null) {

                  loggerhandler.logger.debug(`Internal error! Mailer Error.`);
                  console.error("Internal error! Mailer Error.");
                }
              });
            }

          } else {
            let previous_notification_finalbrand = await notifications.findOne({
              notification_sent_to: item._awareid,
              date: customDate,
              message: `Alert! The ETD for PO ${item.order_number} sent to ${item.producer} has already passed. ${item.producer} missed the token update deadline.`
            });

            if (!previous_notification_finalbrand) {
              await notifications.create({
                notification_sent_to: item._awareid,
                date: customDate,
                message: `Alert! The ETD for PO ${item.order_number} sent to ${item.producer} has already passed. ${item.producer} missed the token update deadline.`
              });
            }
          }
        }
      };

      const promises = user_list.map(async (data) => {
        await function1(data);
        await function2(data);
      });

      await Promise.all(promises);

      loggerhandler.logger.debug(`Data Sync Ended: ${moment().format('YYYY-MM-DD HH:mm')} length: ${promises.length}`);
    } catch (error) {
      console.log('games error sync_wearable_daily_summary',error);
      loggerhandler.logger.debug(`Data Sync ERROR: ${moment().format('YYYY-MM-DD HH:mm')} - ${error.toString()}`);
      console.log('Error:', error);
    }
  }









  // ETDNotificationSync: async () => {
  //   try {

  //     let customDate = moment().format('DD/MM/YYYY')

  //     var email_list = await account_details.find({}).select(['email'])

  //     const function1 = async (email) => {
  //       let NextsevenDaysStart = moment(customDate, 'DD/MM/YYYY').add(7, 'days').startOf('day').toDate()
  //       let NextsevenDaysEnd = moment(customDate, 'DD/MM/YYYY').add(7, 'days').endOf('day').toDate()

  //       let purchase_order_ETD_list = await purchase_order_details.aggregate([
  //         // { $match: { producer_aware_id: details?.aware_id } },
  //         { "$addFields": { "poid": { "$toObjectId": "$po_id" } } },
  //         { $lookup: { from: "purchase_orders", localField: "poid", foreignField: "_id", as: "details_avaliable", }, },
  //         { $addFields: { details_avaliable: { $arrayElemAt: ["$details_avaliable", 0] } } },
  //         {
  //           $set: {
  //             "po_status": "$details_avaliable.status",
  //             "hide": "$details_avaliable.hide",
  //           }
  //         },
  //         { $match: { etd: { $gte: NextsevenDaysStart, $lte: NextsevenDaysEnd }, po_status: { $eq: "SEND" }, hide: { $ne: true } } },
  //         { $project: { "_id": 0, "producer": 1, "order_number": 1, "brand": 1, "etd": 1, "_awareid": 1, "producer_aware_id": 1 } },
  //       ])

  //       purchase_order_ETD_list?.forEach(async (item) => {
  //         let previous_notification_producer = await notifications.findOne({
  //           notification_sent_to: item?.producer_aware_id,
  //           date: customDate,
  //           message: `The ETD ${moment(item.etd).format('DD/MM/YYYY')} for PO ${item.order_number} of ${item.brand} is approaching within a week. Please take action to complete the token update, connect to line items and manager approval ASAP.`
  //         })

  //         if (!previous_notification_producer && item) {
  //           await notifications.create({
  //             notification_sent_to: item?.producer_aware_id,
  //             date: customDate,
  //             message: `The ETD ${moment(item.etd).format('DD/MM/YYYY')} for PO ${item.order_number} of ${item.brand} is approaching within a week. Please take action to complete the token update, connect to line items and manager approval ASAP.`
  //           })
  //           // console.log('1',{item})
  //           SendGrid.ETDMailer(email, item.producer, item, 1, (result) => {
  //             // console.log('resulttttt 1', result)
  //             if (result == null) {

  //               return res.status(500).jsonp({ status: false, message: "Internal error! Please Re-send Verification link to Manager email address." });
  //             }
  //           });


  //         }

  //         let previous_notification_finalbrand = await notifications.findOne({
  //           notification_sent_to: item._awareid,
  //           date: customDate,
  //           message: `The ETD for PO ${item.order_number}  sent to ${item.producer} is approaching within a week. Please take action to remind the ${item.producer}.`
  //         })

  //         if (!previous_notification_finalbrand) {
  //           await notifications.create({
  //             notification_sent_to: item._awareid,
  //             date: customDate,
  //             message: `The ETD for PO ${item.order_number}  sent to ${item.producer} is approaching within a week. Please take action to remind the ${item.producer}.`
  //           })
  //         }

  //       })
  //     }

  //     const function2 = async (email) => {
  //       let LastDaysStart = moment(customDate, 'DD/MM/YYYY').subtract(1, 'days').startOf('day').toDate()
  //       let LastDaysEnd = moment(customDate, 'DD/MM/YYYY').subtract(1, 'days').endOf('day').toDate()

  //       let last_purchase_order_ETD_list = await purchase_order_details.aggregate([
  //         { $match: { producer_aware_id: details?.aware_id } },
  //         { "$addFields": { "poid": { "$toObjectId": "$po_id" } } },
  //         { $lookup: { from: "purchase_orders", localField: "poid", foreignField: "_id", as: "details_avaliable", }, },
  //         { $addFields: { details_avaliable: { $arrayElemAt: ["$details_avaliable", 0] } } },
  //         {
  //           $set: {
  //             "po_status": "$details_avaliable.status",
  //             "hide": "$details_avaliable.hide",
  //           }
  //         },
  //         { $match: { etd: { $gte: LastDaysStart, $lte: LastDaysEnd }, po_status: { $eq: "SEND" }, hide: { $ne: true } } },
  //         { $project: { "_id": 0, "producer": 1, "order_number": 1, "brand": 1, "etd": 1, "_awareid": 1, "producer_aware_id": 1 } },
  //       ])

  //       last_purchase_order_ETD_list?.forEach(async (item) => {
  //         let previous_notification_producer = await notifications.findOne({
  //           notification_sent_to: item?.producer_aware_id,
  //           date: customDate,
  //           message: `Alert! The ETD for PO ${item.order_number} of ${item.brand} has already passed. You have missed the  ETD deadline. Please finish the token update ASAP.`
  //         })

  //         if (!previous_notification_producer && item) {
  //           await notifications.create({
  //             notification_sent_to: item?.producer_aware_id,
  //             date: customDate,
  //             message: `Alert! The ETD for PO ${item.order_number} of ${item.brand} has already passed. You have missed the  ETD deadline. Please finish the token update ASAP.`
  //           })
  //           // console.log('2',{item})
  //           SendGrid.ETDMailer(email, item.producer, item, 2, (result) => {
  //             // console.log('resulttttt 2',result)
  //             if (result == null) {
  //               return res.status(500).jsonp({ status: false, message: "Internal error! Mailer Error." });
  //             }
  //           });
  //         }


  //         let previous_notification_finalbrand = await notifications.findOne({
  //           notification_sent_to: item._awareid,
  //           date: customDate,
  //           message: `Alert! The ETD for PO ${item.order_number} sent to ${item.producer} has already passed. ${item.producer} missed the token update deadline.`
  //         })

  //         if (!previous_notification_finalbrand) {
  //           await notifications.create({
  //             notification_sent_to: item._awareid,
  //             date: customDate,
  //             message: `Alert! The ETD for PO ${item.order_number} sent to ${item.producer} has already passed. ${item.producer} missed the token update deadline.`
  //           })
  //         }
  //       })

  //     }
  //     const promises = email_list.map(async (data) => {
  //       await function1(data.email);
  //       await function2(data.email);

  //     });

  //     await Promise.all(promises);

  //     loggerhandler.logger.debug(`Data Sync Ended: ${moment().format('YYYY-MM-DD HH:mm')} length: ${promises.length}`);
  //   } catch (error) {
  //     console.log('games error sync_wearable_daily_summary')
  //     loggerhandler.logger.debug(`Data Sync ERROR: ${moment().format('YYYY-MM-DD HH:mm')} - ${error.toString()}`);
  //     // loggerhandler.logger.error(`data sync problem :- ${error.toString()} `);
  //     console.log('Error:', error);
  //   }
  // },

}