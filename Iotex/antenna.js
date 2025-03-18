// // import Antenna from "iotex-antenna";
// // import Antenna from "iotex-antenna";

// const Antenna = require('iotex-antenna');
// // import Antenna from 'iotex-antenna';

// const Big = require('big.js');
// var user_details = require("../models/user_details");
// var wallets = require("../models/wallets");
// var mongoose = require("mongoose");
// const MongoClient = require('mongodb').MongoClient;
// const URL = process.env.DATABASE_SENSITIVE_URL;
// const DB = process.env.DATABASE_SENSITIVE;

// exports.handlers = {

//     createWalletAsync: async (req, res) => {

//         if (!req.body.user_id) {
//             return res.json({ status: false, message: "Mandatory parameter user_id is missing!" });
//         }

//         var userid = req.body.user_id;

//         wallets.findOne({ $and: [{ user_id: userid }] }, function (err, wallet) {
//             if (err) return res.json({ status: false, message: err });

//             if (wallet) {
//                 return res.json({ status: false, message: "Wallet already exists." });
//             }
//             else {

//                 user_details.findOne({ $and: [{ _id: new mongoose.Types.ObjectId(userid) }] }, function (err, user) {
//                     if (err) return res.json({ status: false, message: err });
//                     if (!user) {
//                         return res.json({ status: false, message: "No user exists." });
//                     }

//                     const antenna = new Antenna("http://api.testnet.iotex.one:80");
//                     const account = antenna.iotx.accounts.create();

//                     wallets.create(
//                         {
//                             user_id: userid,
//                             wallet_address: account.address,
//                             created_date: new Date(),
//                         },
//                         function (err, user) {
//                             if (err) return res.json({ status: false, message: err });

//                             const client = new MongoClient(URL);
//                             client.connect(function (err) {
//                                 if (err) return res.json({ status: false, message: err });

//                                 console.log("Connected successfully to server");

//                                 const db = client.db(DB);
//                                 const collection = db.collection('wallet_key');

//                                 collection.insertOne({
//                                     uuid: user._id.toString(),
//                                     private_key: account.privateKey,
//                                     created_on: new Date(),

//                                 }, function (err, modified) {
//                                     console.log("err", err)
//                                     if (err) return res.json({ status: false, message: err });

//                                     return res.json({ "status": true, "message": "success", "account": account });

//                                 })
//                             });
//                         })
//                 })
//             }
//         })
//     },

// }

// // function createCollated(db, callback) {
// //     db.createCollection('wallet_key',
// //         {},

// //         function (err, results) {
// //             console.log("Collection created.", results);
// //             callback();
// //         }
// //     );
// // };

// // function findDocuments(db, callback) {
// //     const collection = db.collection('wallet_key');
// //     collection.find({}).toArray(function (err, docs) {
// //         // assert.equal(err, null);
// //         console.log("docs", docs)
// //         callback(docs);
// //     });
// // }

// // const mnemonic = await ethers.utils.HDNode.fromMnemonic(ethers.utils.randomBytes(16));
//                             // const mnemonic = await ethers.HDNode.entropyToMnemonic(ethers.utils.randomBytes(16));
//                             // const response = ethers.Wallet.fromMnemonic(mnemonic);
