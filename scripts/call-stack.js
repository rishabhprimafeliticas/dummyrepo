var sessionStorage = require("../models/session_storage");
var bcrypt = require("bcryptjs");
var mongoose = require("mongoose");
const { body, validationResult, check } = require("express-validator");
var kyc_details = require("../models/kyc_details");
var account_details = require("../models/account_details");
require("dotenv").config();
const { refresh } = require("../refresh-token");
const physical_assets = require("../models/physical_asset");
const company_complians = require("../models/company_compliances");
const source_address = require("../models/source_address");
const self_validation = require("../models/self_validation");
const tracer = require("../models/tracer");
const select_receiver = require("../models/selected_receiver");
const selected_aware_token = require("../models/selected_aware_token");
const selected_proof_of_delivery = require("../models/selected_proof_of_delivery");
const selected_transaction_certificates = require("../models/selected_transaction_certificates");
const aw_tokens = require("../models/aw_tokens");
const transferred_tokens = require("../models/transferred-tokens");
var QRCode = require("qrcode");
var fs = require("fs");
const products = require("../models/products");
const purchase_orders = require("../models/purchase_orders");
const purchase_order_details = require("../models/purchase_order_details");
const product_lines = require("../models/product_lines");
const generate_qr = require("../models/generate_qr");
const generate_hard_good_qr = require("../models/generate_hards_goods_qr");
const hardGoodsBrands = require("../models/hardGoodsBrands");
const transaction_history = require("../models/transaction_history");
const { createCanvas, loadImage } = require("canvas");
const selected_update_aware_token = require("../models/selected_update_aware_token");
const update_physical_asset = require("../models/update_physical_asset");
const update_tracer = require("../models/update_tracer");
var sgMail = require("../scripts/send-grid");
const update_self_validation = require("../models/update_self_validation");
const update_company_compliancess = require("../models/update_company_compliancess");
const update_aw_tokens = require("../models/update_aw_tokens");
var nonce = 0;
var from0xaddress = null;
var wallets = require("../models/wallets");
const Web3 = require("web3");
const helperfunctions = require("../scripts/helper-functions");
const Big = require("big.js");
const ethers = require("ethers");
const loggerhandler = require("../logger/log");
var connectWeb3;
var nonce3 = 0;
var cache = require("memory-cache");
// const changedpi = require('changeDpiDataUrl');
const chandedpi = require("changedpi");
const { request, gql } = require("graphql-request");
const axios = require("axios"); // Requests
const abiArray = require("../contract/aware-2022-aib");

const qr_codes = require("../models/generate_qr");

module.exports = {
  sendTokenAndUpdateBalance: function (
    token_details,
    select_receiver_avaliable,
    selected_aware_token_avaliable,
    nonce_coming,
    connectWeb3,
    req
  ) {
    return new Promise(async (resolve, reject) => {
      try {
        // console.log("token_details", token_details, select_receiver_avaliable, selected_aware_token_avaliable)
        //checking if it is aware_token_if or update_aware_token_id
        if (token_details.aware_token_id) {
          var assets_avaliable_id = await physical_assets
            .findOne({
              _awareid: select_receiver_avaliable._awareid,
              aware_token_id: token_details.aware_token_id,
            })
            .select(["_id"])
            .catch((ex) => {
              loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
              return res
                .status(400)
                .jsonp({ status: false, message: "Bad request!" });
            });
          var tracer_id = await tracer
            .findOne({
              _awareid: select_receiver_avaliable._awareid,
              aware_token_id: token_details.aware_token_id,
            })
            .select(["_id"])
            .catch((ex) => {
              loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
              return res
                .status(400)
                .jsonp({ status: false, message: "Bad request!" });
            });
          var self_validation_id = await self_validation
            .findOne({
              _awareid: select_receiver_avaliable._awareid,
              aware_token_id: token_details.aware_token_id,
            })
            .select(["_id"])
            .catch((ex) => {
              loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
              return res
                .status(400)
                .jsonp({ status: false, message: "Bad request!" });
            });
          var company_complians_id = await company_complians
            .findOne({
              _awareid: select_receiver_avaliable._awareid,
              aware_token_id: token_details.aware_token_id,
            })
            .select(["_id"])
            .catch((ex) => {
              loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
              return res
                .status(400)
                .jsonp({ status: false, message: "Bad request!" });
            });

          const select_receiver_id = await select_receiver
            .findOne({
              _awareid: select_receiver_avaliable._awareid,
              send_aware_token_id:
                select_receiver_avaliable.send_aware_token_id,
            })
            .select(["_id"])
            .catch((ex) => {
              loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
              return res
                .status(500)
                .jsonp({ status: false, message: ex.toString() });
            });
          const selected_aware_token_id = await selected_aware_token
            .findOne({
              _awareid: select_receiver_avaliable._awareid,
              send_aware_token_id:
                select_receiver_avaliable.send_aware_token_id,
            })
            .select(["_id"])
            .catch((ex) => {
              loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
              return res
                .status(500)
                .jsonp({ status: false, message: ex.toString() });
            });
          const selected_transaction_certificates_id =
            await selected_transaction_certificates
              .findOne({
                _awareid: select_receiver_avaliable._awareid,
                send_aware_token_id:
                  select_receiver_avaliable.send_aware_token_id,
              })
              .select(["_id"])
              .catch((ex) => {
                loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
                return res
                  .status(500)
                  .jsonp({ status: false, message: ex.toString() });
              });
          const selected_proof_of_delivery_id = await selected_proof_of_delivery
            .findOne({
              _awareid: select_receiver_avaliable._awareid,
              send_aware_token_id:
                select_receiver_avaliable.send_aware_token_id,
            })
            .select(["_id"])
            .catch((ex) => {
              loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
              return res
                .status(500)
                .jsonp({ status: false, message: ex.toString() });
            });

          const transaction_history_avaliable = await transaction_history
            .findOne({
              _awareid: select_receiver_avaliable._awareid,
              aware_token_id: token_details.aware_token_id,
            })
            .select(["_id"])
            .catch((ex) => {
              loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
              return res
                .status(400)
                .jsonp({ status: false, message: "Bad request!" });
            });

          var blockchain_Object = await aw_tokens
            .findOne({
              _id: mongoose.Types.ObjectId(token_details.aware_token_id),
            })
            .select(["blockchain_id"])
            .catch((ex) => {
              loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
              return res
                .status(400)
                .jsonp({ status: false, message: "Bad request!" });
            });
          var wallet_of_sender = await wallets
            .findOne({ _awareid: select_receiver_avaliable._awareid })
            .select(["wallet_address_0x", "from", "to"])
            .catch((ex) => {
              loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
              return res
                .status(400)
                .jsonp({ status: false, message: "Bad request!" });
            });
          var wallet_of_receiver = await wallets
            .findOne({ _awareid: select_receiver_avaliable._receiver_awareid })
            .select(["wallet_address_0x", "from", "to"])
            .catch((ex) => {
              loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
              return res
                .status(400)
                .jsonp({ status: false, message: "Bad request!" });
            });

          var from0xaddress = wallet_of_sender.wallet_address_0x;
          var useraddress = wallet_of_receiver.wallet_address_0x;
          var key = wallet_of_sender.from + wallet_of_sender.to;
          var decrypted_private_key = helperfunctions.encryptAddress(
            key,
            "decrypt"
          );

          var privatekey = "";
          for (var i = 3; i < decrypted_private_key.length - 1; i++) {
            privatekey = privatekey + decrypted_private_key[i];
          }

          // var abiArray = [
          //   {
          //     "inputs": [],
          //     "stateMutability": "nonpayable",
          //     "type": "constructor"
          //   },
          //   {
          //     "anonymous": false,
          //     "inputs": [
          //       {
          //         "indexed": true,
          //         "internalType": "address",
          //         "name": "account",
          //         "type": "address"
          //       },
          //       {
          //         "indexed": true,
          //         "internalType": "address",
          //         "name": "operator",
          //         "type": "address"
          //       },
          //       {
          //         "indexed": false,
          //         "internalType": "bool",
          //         "name": "approved",
          //         "type": "bool"
          //       }
          //     ],
          //     "name": "ApprovalForAll",
          //     "type": "event"
          //   },
          //   {
          //     "anonymous": false,
          //     "inputs": [
          //       {
          //         "indexed": true,
          //         "internalType": "uint256",
          //         "name": "_tokenId",
          //         "type": "uint256"
          //       },
          //       {
          //         "indexed": false,
          //         "internalType": "address",
          //         "name": "owner",
          //         "type": "address"
          //       },
          //       {
          //         "indexed": false,
          //         "internalType": "string",
          //         "name": "_uri",
          //         "type": "string"
          //       }
          //     ],
          //     "name": "TokenMetadataURIUpdated",
          //     "type": "event"
          //   },
          //   {
          //     "anonymous": false,
          //     "inputs": [
          //       {
          //         "indexed": true,
          //         "internalType": "uint256",
          //         "name": "_tokenId",
          //         "type": "uint256"
          //       },
          //       {
          //         "indexed": false,
          //         "internalType": "address",
          //         "name": "owner",
          //         "type": "address"
          //       },
          //       {
          //         "indexed": false,
          //         "internalType": "string",
          //         "name": "_uri",
          //         "type": "string"
          //       }
          //     ],
          //     "name": "TokenURIUpdated",
          //     "type": "event"
          //   },
          //   {
          //     "anonymous": false,
          //     "inputs": [
          //       {
          //         "indexed": true,
          //         "internalType": "address",
          //         "name": "operator",
          //         "type": "address"
          //       },
          //       {
          //         "indexed": true,
          //         "internalType": "address",
          //         "name": "from",
          //         "type": "address"
          //       },
          //       {
          //         "indexed": true,
          //         "internalType": "address",
          //         "name": "to",
          //         "type": "address"
          //       },
          //       {
          //         "indexed": false,
          //         "internalType": "uint256[]",
          //         "name": "ids",
          //         "type": "uint256[]"
          //       },
          //       {
          //         "indexed": false,
          //         "internalType": "uint256[]",
          //         "name": "values",
          //         "type": "uint256[]"
          //       }
          //     ],
          //     "name": "TransferBatch",
          //     "type": "event"
          //   },
          //   {
          //     "anonymous": false,
          //     "inputs": [
          //       {
          //         "indexed": true,
          //         "internalType": "address",
          //         "name": "operator",
          //         "type": "address"
          //       },
          //       {
          //         "indexed": true,
          //         "internalType": "address",
          //         "name": "from",
          //         "type": "address"
          //       },
          //       {
          //         "indexed": true,
          //         "internalType": "address",
          //         "name": "to",
          //         "type": "address"
          //       },
          //       {
          //         "indexed": false,
          //         "internalType": "uint256",
          //         "name": "id",
          //         "type": "uint256"
          //       },
          //       {
          //         "indexed": false,
          //         "internalType": "uint256",
          //         "name": "value",
          //         "type": "uint256"
          //       }
          //     ],
          //     "name": "TransferSingle",
          //     "type": "event"
          //   },
          //   {
          //     "anonymous": false,
          //     "inputs": [
          //       {
          //         "indexed": false,
          //         "internalType": "string",
          //         "name": "value",
          //         "type": "string"
          //       },
          //       {
          //         "indexed": true,
          //         "internalType": "uint256",
          //         "name": "id",
          //         "type": "uint256"
          //       }
          //     ],
          //     "name": "URI",
          //     "type": "event"
          //   },
          //   {
          //     "inputs": [
          //       {
          //         "internalType": "address",
          //         "name": "account",
          //         "type": "address"
          //       },
          //       {
          //         "internalType": "uint256",
          //         "name": "id",
          //         "type": "uint256"
          //       }
          //     ],
          //     "name": "balanceOf",
          //     "outputs": [
          //       {
          //         "internalType": "uint256",
          //         "name": "",
          //         "type": "uint256"
          //       }
          //     ],
          //     "stateMutability": "view",
          //     "type": "function"
          //   },
          //   {
          //     "inputs": [
          //       {
          //         "internalType": "address[]",
          //         "name": "accounts",
          //         "type": "address[]"
          //       },
          //       {
          //         "internalType": "uint256[]",
          //         "name": "ids",
          //         "type": "uint256[]"
          //       }
          //     ],
          //     "name": "balanceOfBatch",
          //     "outputs": [
          //       {
          //         "internalType": "uint256[]",
          //         "name": "",
          //         "type": "uint256[]"
          //       }
          //     ],
          //     "stateMutability": "view",
          //     "type": "function"
          //   },
          //   {
          //     "inputs": [
          //       {
          //         "internalType": "address",
          //         "name": "from",
          //         "type": "address"
          //       },
          //       {
          //         "internalType": "uint256",
          //         "name": "tokenId",
          //         "type": "uint256"
          //       },
          //       {
          //         "internalType": "uint256",
          //         "name": "amount",
          //         "type": "uint256"
          //       }
          //     ],
          //     "name": "burn",
          //     "outputs": [],
          //     "stateMutability": "nonpayable",
          //     "type": "function"
          //   },
          //   {
          //     "inputs": [
          //       {
          //         "internalType": "address",
          //         "name": "account",
          //         "type": "address"
          //       },
          //       {
          //         "internalType": "uint256[]",
          //         "name": "ids",
          //         "type": "uint256[]"
          //       },
          //       {
          //         "internalType": "uint256[]",
          //         "name": "values",
          //         "type": "uint256[]"
          //       }
          //     ],
          //     "name": "burnBatch",
          //     "outputs": [],
          //     "stateMutability": "nonpayable",
          //     "type": "function"
          //   },
          //   {
          //     "inputs": [
          //       {
          //         "internalType": "address",
          //         "name": "account",
          //         "type": "address"
          //       },
          //       {
          //         "internalType": "address",
          //         "name": "operator",
          //         "type": "address"
          //       }
          //     ],
          //     "name": "isApprovedForAll",
          //     "outputs": [
          //       {
          //         "internalType": "bool",
          //         "name": "",
          //         "type": "bool"
          //       }
          //     ],
          //     "stateMutability": "view",
          //     "type": "function"
          //   },
          //   {
          //     "inputs": [
          //       {
          //         "components": [
          //           {
          //             "internalType": "string",
          //             "name": "tokenURI",
          //             "type": "string"
          //           },
          //           {
          //             "internalType": "string",
          //             "name": "metadataURI",
          //             "type": "string"
          //           },
          //           {
          //             "internalType": "bytes32",
          //             "name": "contentHash",
          //             "type": "bytes32"
          //           },
          //           {
          //             "internalType": "bytes32",
          //             "name": "metadataHash",
          //             "type": "bytes32"
          //           }
          //         ],
          //         "internalType": "struct IAwareToken.AwareData",
          //         "name": "data",
          //         "type": "tuple"
          //       },
          //       {
          //         "internalType": "address",
          //         "name": "recipient",
          //         "type": "address"
          //       },
          //       {
          //         "internalType": "uint256",
          //         "name": "amount",
          //         "type": "uint256"
          //       }
          //     ],
          //     "name": "mint",
          //     "outputs": [],
          //     "stateMutability": "nonpayable",
          //     "type": "function"
          //   },
          //   {
          //     "inputs": [
          //       {
          //         "internalType": "uint256",
          //         "name": "tokenId",
          //         "type": "uint256"
          //       }
          //     ],
          //     "name": "ownerOf",
          //     "outputs": [
          //       {
          //         "internalType": "address",
          //         "name": "",
          //         "type": "address"
          //       }
          //     ],
          //     "stateMutability": "view",
          //     "type": "function"
          //   },
          //   {
          //     "inputs": [
          //       {
          //         "internalType": "uint256",
          //         "name": "",
          //         "type": "uint256"
          //       }
          //     ],
          //     "name": "previousTokenOwners",
          //     "outputs": [
          //       {
          //         "internalType": "address",
          //         "name": "",
          //         "type": "address"
          //       }
          //     ],
          //     "stateMutability": "view",
          //     "type": "function"
          //   },
          //   {
          //     "inputs": [
          //       {
          //         "internalType": "address",
          //         "name": "from",
          //         "type": "address"
          //       },
          //       {
          //         "internalType": "address",
          //         "name": "to",
          //         "type": "address"
          //       },
          //       {
          //         "internalType": "uint256[]",
          //         "name": "ids",
          //         "type": "uint256[]"
          //       },
          //       {
          //         "internalType": "uint256[]",
          //         "name": "amounts",
          //         "type": "uint256[]"
          //       },
          //       {
          //         "internalType": "bytes",
          //         "name": "data",
          //         "type": "bytes"
          //       }
          //     ],
          //     "name": "safeBatchTransferFrom",
          //     "outputs": [],
          //     "stateMutability": "nonpayable",
          //     "type": "function"
          //   },
          //   {
          //     "inputs": [
          //       {
          //         "internalType": "address",
          //         "name": "from",
          //         "type": "address"
          //       },
          //       {
          //         "internalType": "address",
          //         "name": "to",
          //         "type": "address"
          //       },
          //       {
          //         "internalType": "uint256",
          //         "name": "id",
          //         "type": "uint256"
          //       },
          //       {
          //         "internalType": "uint256",
          //         "name": "amount",
          //         "type": "uint256"
          //       },
          //       {
          //         "internalType": "bytes",
          //         "name": "data",
          //         "type": "bytes"
          //       }
          //     ],
          //     "name": "safeTransferFrom",
          //     "outputs": [],
          //     "stateMutability": "nonpayable",
          //     "type": "function"
          //   },
          //   {
          //     "inputs": [
          //       {
          //         "internalType": "address",
          //         "name": "operator",
          //         "type": "address"
          //       },
          //       {
          //         "internalType": "bool",
          //         "name": "approved",
          //         "type": "bool"
          //       }
          //     ],
          //     "name": "setApprovalForAll",
          //     "outputs": [],
          //     "stateMutability": "nonpayable",
          //     "type": "function"
          //   },
          //   {
          //     "inputs": [
          //       {
          //         "internalType": "uint256",
          //         "name": "_tokenId",
          //         "type": "uint256"
          //       },
          //       {
          //         "internalType": "string",
          //         "name": "_type",
          //         "type": "string"
          //       }
          //     ],
          //     "name": "setTokenType",
          //     "outputs": [],
          //     "stateMutability": "nonpayable",
          //     "type": "function"
          //   },
          //   {
          //     "inputs": [
          //       {
          //         "internalType": "bytes4",
          //         "name": "interfaceId",
          //         "type": "bytes4"
          //       }
          //     ],
          //     "name": "supportsInterface",
          //     "outputs": [
          //       {
          //         "internalType": "bool",
          //         "name": "",
          //         "type": "bool"
          //       }
          //     ],
          //     "stateMutability": "view",
          //     "type": "function"
          //   },
          //   {
          //     "inputs": [
          //       {
          //         "internalType": "uint256",
          //         "name": "",
          //         "type": "uint256"
          //       }
          //     ],
          //     "name": "tokenContentHashes",
          //     "outputs": [
          //       {
          //         "internalType": "bytes32",
          //         "name": "",
          //         "type": "bytes32"
          //       }
          //     ],
          //     "stateMutability": "view",
          //     "type": "function"
          //   },
          //   {
          //     "inputs": [
          //       {
          //         "internalType": "uint256",
          //         "name": "",
          //         "type": "uint256"
          //       }
          //     ],
          //     "name": "tokenCreators",
          //     "outputs": [
          //       {
          //         "internalType": "address",
          //         "name": "",
          //         "type": "address"
          //       }
          //     ],
          //     "stateMutability": "view",
          //     "type": "function"
          //   },
          //   {
          //     "inputs": [
          //       {
          //         "internalType": "uint256",
          //         "name": "",
          //         "type": "uint256"
          //       }
          //     ],
          //     "name": "tokenMetadataHashes",
          //     "outputs": [
          //       {
          //         "internalType": "bytes32",
          //         "name": "",
          //         "type": "bytes32"
          //       }
          //     ],
          //     "stateMutability": "view",
          //     "type": "function"
          //   },
          //   {
          //     "inputs": [
          //       {
          //         "internalType": "uint256",
          //         "name": "tokenId",
          //         "type": "uint256"
          //       }
          //     ],
          //     "name": "tokenMetadataURI",
          //     "outputs": [
          //       {
          //         "internalType": "string",
          //         "name": "",
          //         "type": "string"
          //       }
          //     ],
          //     "stateMutability": "view",
          //     "type": "function"
          //   },
          //   {
          //     "inputs": [
          //       {
          //         "internalType": "uint256",
          //         "name": "tokenId",
          //         "type": "uint256"
          //       }
          //     ],
          //     "name": "tokentype",
          //     "outputs": [
          //       {
          //         "internalType": "string",
          //         "name": "",
          //         "type": "string"
          //       }
          //     ],
          //     "stateMutability": "view",
          //     "type": "function"
          //   },
          //   {
          //     "inputs": [
          //       {
          //         "internalType": "uint256",
          //         "name": "tokenId",
          //         "type": "uint256"
          //       },
          //       {
          //         "internalType": "string",
          //         "name": "metadataURI",
          //         "type": "string"
          //       }
          //     ],
          //     "name": "updateTokenMetadataURI",
          //     "outputs": [],
          //     "stateMutability": "nonpayable",
          //     "type": "function"
          //   },
          //   {
          //     "inputs": [
          //       {
          //         "internalType": "uint256",
          //         "name": "tokenId",
          //         "type": "uint256"
          //       },
          //       {
          //         "internalType": "string",
          //         "name": "tokenURI",
          //         "type": "string"
          //       }
          //     ],
          //     "name": "updateTokenURI",
          //     "outputs": [],
          //     "stateMutability": "nonpayable",
          //     "type": "function"
          //   },
          //   {
          //     "inputs": [
          //       {
          //         "internalType": "uint256",
          //         "name": "tokenId",
          //         "type": "uint256"
          //       }
          //     ],
          //     "name": "uri",
          //     "outputs": [
          //       {
          //         "internalType": "string",
          //         "name": "",
          //         "type": "string"
          //       }
          //     ],
          //     "stateMutability": "view",
          //     "type": "function"
          //   }
          // ]

          const contractAddress = process.env.CONTRACT_ADDRESS;
          var contract = new connectWeb3.eth.Contract(
            abiArray,
            contractAddress,
            { from: process.env.ADMIN_WALLET_ADDRESS }
          );

          var amountInUint = token_details.To_be_Send;
          var gasAmount = await contract.methods
            .safeTransferFrom(
              from0xaddress.toLowerCase(),
              useraddress.toLowerCase(),
              blockchain_Object.blockchain_id.toString(),
              amountInUint.toString(),
              []
            )
            .estimateGas({ from: from0xaddress });
          var increased = Number(gasAmount) * 0.2;
          gasAmount = Math.ceil(Number(gasAmount) + increased);

          connectWeb3.eth
            .getBalance(from0xaddress.toLowerCase())
            .then(async function (balance) {
              let iotxBalance = Big(balance).div(10 ** 18);
              console.log(
                "Balance while send aw token",
                iotxBalance.toFixed(18)
              );
              if (iotxBalance.toFixed(18) < 2) {
                await transferAsync(
                  req,
                  from0xaddress.toLowerCase(),
                  gasAmount,
                  async function (response) {
                    connectWeb3.eth
                      .getBalance(from0xaddress.toLowerCase())
                      .then(async function (balance) {
                        let iotxBalance = Big(balance).div(10 ** 18);
                        console.log(
                          "Balance after t/f of funds send aw token",
                          iotxBalance.toFixed(18)
                        );
                        if (response == true && iotxBalance.toFixed(18) > 0) {
                          const gasPrice = await connectWeb3.eth.getGasPrice();

                          const txConfig = {
                            from: from0xaddress,
                            to: contractAddress,
                            gasPrice: gasPrice,
                            gas: gasAmount.toString(),
                            nonce: nonce_coming.toString(),
                            data: contract.methods
                              .safeTransferFrom(
                                from0xaddress.toLowerCase(),
                                useraddress.toLowerCase(),
                                blockchain_Object.blockchain_id.toString(),
                                amountInUint.toString(),
                                []
                              )
                              .encodeABI(),
                          };

                          console.log("bangtxConfig", txConfig);

                          connectWeb3.eth.accounts.signTransaction(
                            txConfig,
                            "0x" + privatekey,
                            async function (err, signedTx) {
                              if (err) {
                                console.log("signTransactionerr", err);
                                loggerhandler.logger.error(
                                  `${err} ,email:${req.headers.email}`
                                );
                                reject();
                              }

                              console.log("signedTx", signedTx);
                              connectWeb3.eth
                                .sendSignedTransaction(signedTx.rawTransaction)
                                .on("receipt", async function (receipt) {
                                  console.log("Tx Hash (Receipt): ", receipt);

                                  transaction_history.create(
                                    {
                                      _awareid:
                                        select_receiver_avaliable._awareid,
                                      aware_token_id:
                                        token_details.aware_token_id,
                                      transactionIndex:
                                        receipt.transactionIndex,
                                      transactionHash: receipt.transactionHash,
                                      blockHash: receipt.blockHash,
                                      blockNumber: receipt.blockNumber,
                                      from: receipt.from,
                                      to: receipt.to,
                                      cumulativeGasUsed:
                                        receipt.cumulativeGasUsed,
                                      gasUsed: receipt.gasUsed,
                                      contractAddress: receipt.contractAddress,
                                      logsBloom: receipt.logsBloom,
                                      logs: receipt.logs,
                                      status: receipt.status,
                                    },
                                    async function (err, history) {
                                      if (err) {
                                        console.log("err", err);
                                        loggerhandler.logger.error(
                                          `${err} ,email:${req.headers.email}`
                                        );
                                        reject();
                                      }

                                      transferred_tokens.create(
                                        {
                                          _awareid:
                                            select_receiver_avaliable._receiver_awareid,
                                          type_of_token:
                                            selected_aware_token_avaliable.aware_token_type,
                                          total_tokens:
                                            token_details.To_be_Send,
                                          avaliable_tokens:
                                            token_details.To_be_Send,
                                          historical_awareid:
                                            select_receiver_avaliable._awareid,
                                          blockchain_id:
                                            blockchain_Object.blockchain_id,
                                          historical_aware_token_id:
                                            token_details.aware_token_id,
                                          historical_physical_assets_id:
                                            assets_avaliable_id
                                              ? assets_avaliable_id
                                              : null,
                                          historical_tracers_id: tracer_id
                                            ? tracer_id
                                            : null,
                                          historical_company_compliances_id:
                                            company_complians_id
                                              ? company_complians_id
                                              : null,
                                          historical_self_validations_id:
                                            self_validation_id
                                              ? self_validation_id
                                              : null,

                                          historical_send_aw_tokens_id:
                                            select_receiver_avaliable.send_aware_token_id,

                                          historical_selected_receivers_id:
                                            select_receiver_id
                                              ? select_receiver_id
                                              : null,
                                          historical_selected_aware_tokens_id:
                                            selected_aware_token_id
                                              ? selected_aware_token_id
                                              : null,
                                          historical_selected_transaction_certificates_id:
                                            selected_transaction_certificates_id
                                              ? selected_transaction_certificates_id
                                              : null,
                                          historical_selected_proof_of_deliveries_id:
                                            selected_proof_of_delivery_id
                                              ? selected_proof_of_delivery_id
                                              : null,

                                          blochchain_transaction_history_id:
                                            transaction_history_avaliable
                                              ? transaction_history_avaliable._id
                                              : null,

                                          token_base_type: "initiated",
                                        },
                                        async function (err, history) {
                                          if (err) {
                                            console.log(
                                              "transferred_tokenserr",
                                              err
                                            );
                                            loggerhandler.logger.error(
                                              `${err} ,email:${req.headers.email}`
                                            );
                                            reject();
                                          }

                                          await aw_tokens
                                            .findOneAndUpdate(
                                              {
                                                _awareid:
                                                  select_receiver_avaliable._awareid,
                                                _id: mongoose.Types.ObjectId(
                                                  token_details.aware_token_id
                                                ),
                                              },
                                              {
                                                avaliable_tokens:
                                                  token_details.balance,
                                                used_tokens:
                                                  token_details.To_be_Send,
                                                locked: false,
                                              },
                                              { new: true }
                                            )
                                            .catch((ex) => {
                                              loggerhandler.logger.error(
                                                `${ex} ,email:${req.headers.email}`
                                              );
                                              console.log("ex", ex);

                                              reject();
                                            });

                                          resolve();
                                        }
                                      );
                                    }
                                  );
                                })
                                .on("error", async function (e) {
                                  loggerhandler.logger.error(
                                    `${e} ,email:${req.headers.email}`
                                  );
                                  console.log("e", e);
                                  reject();
                                });
                            }
                          );
                        } else {
                          reject();
                        }
                      });
                  }
                );
              } else {
                const gasPrice = await connectWeb3.eth.getGasPrice();
                const txConfig = {
                  from: from0xaddress,
                  to: contractAddress,
                  gasPrice: gasPrice,
                  gas: gasAmount.toString(),
                  nonce: nonce_coming.toString(),
                  data: contract.methods
                    .safeTransferFrom(
                      from0xaddress.toLowerCase(),
                      useraddress.toLowerCase(),
                      blockchain_Object.blockchain_id.toString(),
                      amountInUint.toString(),
                      []
                    )
                    .encodeABI(),
                };

                console.log("bangtxConfig", txConfig);

                connectWeb3.eth.accounts.signTransaction(
                  txConfig,
                  "0x" + privatekey,
                  async function (err, signedTx) {
                    if (err) {
                      console.log("signTransactionerr", err);
                      loggerhandler.logger.error(
                        `${err} ,email:${req.headers.email}`
                      );
                      reject();
                    }

                    console.log("signedTx", signedTx);
                    connectWeb3.eth
                      .sendSignedTransaction(signedTx.rawTransaction)
                      .on("receipt", async function (receipt) {
                        console.log("Tx Hash (Receipt): ", receipt);

                        transaction_history.create(
                          {
                            _awareid: select_receiver_avaliable._awareid,
                            aware_token_id: token_details.aware_token_id,
                            transactionIndex: receipt.transactionIndex,
                            transactionHash: receipt.transactionHash,
                            blockHash: receipt.blockHash,
                            blockNumber: receipt.blockNumber,
                            from: receipt.from,
                            to: receipt.to,
                            cumulativeGasUsed: receipt.cumulativeGasUsed,
                            gasUsed: receipt.gasUsed,
                            contractAddress: receipt.contractAddress,
                            logsBloom: receipt.logsBloom,
                            logs: receipt.logs,
                            status: receipt.status,
                          },
                          async function (err, history) {
                            if (err) {
                              console.log("err", err);
                              loggerhandler.logger.error(
                                `${err} ,email:${req.headers.email}`
                              );
                              reject();
                            }

                            // console.log(select_receiver_avaliable._receiver_awareid)
                            // console.log(selected_aware_token_avaliable.aware_token_type)
                            // console.log(token_details.To_be_Send)
                            // console.log(select_receiver_avaliable._awareid)
                            // console.log(blockchain_Object.blockchain_id)
                            // console.log(token_details.aware_token_id)
                            // console.log(assets_avaliable_id)
                            // console.log(tracer_id)
                            // console.log(company_complians_id)
                            // console.log(self_validation_id)
                            // console.log(select_receiver_avaliable)
                            // console.log(select_receiver_id)
                            // console.log(selected_aware_token_id)
                            // console.log(selected_transaction_certificates_id)
                            // console.log(selected_proof_of_delivery_id)
                            // console.log(transaction_history_avaliable)
                            // console.log(assets_avaliable_id)

                            transferred_tokens.create(
                              {
                                _awareid:
                                  select_receiver_avaliable._receiver_awareid,
                                type_of_token:
                                  selected_aware_token_avaliable.aware_token_type,
                                total_tokens: token_details.To_be_Send,
                                avaliable_tokens: token_details.To_be_Send,
                                historical_awareid:
                                  select_receiver_avaliable._awareid,
                                blockchain_id: blockchain_Object.blockchain_id,
                                historical_aware_token_id:
                                  token_details.aware_token_id,
                                historical_physical_assets_id:
                                  assets_avaliable_id
                                    ? assets_avaliable_id
                                    : null,
                                historical_tracers_id: tracer_id
                                  ? tracer_id
                                  : null,
                                historical_company_compliances_id:
                                  company_complians_id
                                    ? company_complians_id
                                    : null,
                                historical_self_validations_id:
                                  self_validation_id
                                    ? self_validation_id
                                    : null,

                                historical_send_aw_tokens_id:
                                  select_receiver_avaliable.send_aware_token_id,

                                historical_selected_receivers_id:
                                  select_receiver_id
                                    ? select_receiver_id
                                    : null,
                                historical_selected_aware_tokens_id:
                                  selected_aware_token_id
                                    ? selected_aware_token_id
                                    : null,
                                historical_selected_transaction_certificates_id:
                                  selected_transaction_certificates_id
                                    ? selected_transaction_certificates_id
                                    : null,
                                historical_selected_proof_of_deliveries_id:
                                  selected_proof_of_delivery_id
                                    ? selected_proof_of_delivery_id
                                    : null,

                                blochchain_transaction_history_id:
                                  transaction_history_avaliable
                                    ? transaction_history_avaliable._id
                                    : null,

                                token_base_type: "initiated",
                              },
                              async function (err, history) {
                                if (err) {
                                  console.log("transferred_tokenserr", err);
                                  loggerhandler.logger.error(
                                    `${err} ,email:${req.headers.email}`
                                  );
                                  reject();
                                }

                                await aw_tokens
                                  .findOneAndUpdate(
                                    {
                                      _awareid:
                                        select_receiver_avaliable._awareid,
                                      _id: mongoose.Types.ObjectId(
                                        token_details.aware_token_id
                                      ),
                                    },
                                    {
                                      avaliable_tokens: token_details.balance,
                                      used_tokens: token_details.To_be_Send,
                                      locked: false,
                                    },
                                    { new: true }
                                  )
                                  .catch((ex) => {
                                    loggerhandler.logger.error(
                                      `${ex} ,email:${req.headers.email}`
                                    );
                                    console.log("ex", ex);

                                    reject();
                                  });

                                resolve();
                              }
                            );

                            // await transferred_tokens.create(
                            //   {
                            //     _awareid: select_receiver_avaliable._receiver_awareid,
                            //     type_of_token: selected_aware_token_avaliable.aware_token_type,
                            //     total_tokens: token_details.To_be_Send,
                            //     avaliable_tokens: token_details.To_be_Send,
                            //     historical_awareid: select_receiver_avaliable._awareid,
                            //     blockchain_id: blockchain_Object.blockchain_id,
                            //     historical_aware_token_id: token_details.aware_token_id,
                            //     historical_physical_assets_id: assets_avaliable_id ? assets_avaliable_id : null,
                            //     historical_tracers_id: tracer_id ? tracer_id : null,
                            //     historical_company_compliances_id: company_complians_id ? company_complians_id : null,
                            //     historical_self_validations_id: self_validation_id ? self_validation_id : null,

                            //     historical_send_aw_tokens_id: select_receiver_avaliable.send_aware_token_id,

                            //     historical_selected_receivers_id: select_receiver_id ? select_receiver_id : null,
                            //     historical_selected_aware_tokens_id: selected_aware_token_id ? selected_aware_token_id : null,
                            //     historical_selected_transaction_certificates_id: selected_transaction_certificates_id ? selected_transaction_certificates_id : null,
                            //     historical_selected_proof_of_deliveries_id: selected_proof_of_delivery_id ? selected_proof_of_delivery_id : null,

                            //     blochchain_transaction_history_id: transaction_history_avaliable ? transaction_history_avaliable._id : null,

                            //     token_base_type: "initiated"
                            //   }).catch(async (err) => {
                            //     console.log("err", err)
                            //     reject();
                            //   })

                            // await aw_tokens.findOneAndUpdate({ _awareid: select_receiver_avaliable._awareid, _id: mongoose.Types.ObjectId(token_details.aware_token_id) },
                            //   {
                            //     avaliable_tokens: token_details.balance,
                            //     used_tokens: token_details.To_be_Send,
                            //     locked: false
                            //   },
                            //   { new: true }).catch((ex) => {
                            //     console.log("ex", ex)

                            //     reject();
                            //   })

                            // resolve();
                          }
                        );
                      })
                      .on("error", async function (e) {
                        loggerhandler.logger.error(
                          `${e} ,email:${req.headers.email}`
                        );
                        console.log("e", e);
                        reject();
                      });
                  }
                );
              }
            });
        } else {
          var selected_update_aware_token_id = await selected_update_aware_token
            .findOne({
              _awareid: select_receiver_avaliable._awareid,
              update_aware_token_id: token_details.update_aware_token_id,
            })
            .select(["_id"])
            .catch((ex) => {
              loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
              return res
                .status(400)
                .jsonp({ status: false, message: "Bad request!" });
            });
          var update_assets_avaliable_id = await update_physical_asset
            .findOne({
              _awareid: select_receiver_avaliable._awareid,
              update_aware_token_id: token_details.update_aware_token_id,
            })
            .select(["_id"])
            .catch((ex) => {
              loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
              return res
                .status(400)
                .jsonp({ status: false, message: "Bad request!" });
            });
          var update_tracer_id = await update_tracer
            .findOne({
              _awareid: select_receiver_avaliable._awareid,
              update_aware_token_id: token_details.update_aware_token_id,
            })
            .select(["_id"])
            .catch((ex) => {
              loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
              return res
                .status(400)
                .jsonp({ status: false, message: "Bad request!" });
            });
          var update_self_validation_id = await update_self_validation
            .findOne({
              _awareid: select_receiver_avaliable._awareid,
              update_aware_token_id: token_details.update_aware_token_id,
            })
            .select(["_id"])
            .catch((ex) => {
              loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
              return res
                .status(400)
                .jsonp({ status: false, message: "Bad request!" });
            });
          var update_company_complians_id = await update_company_compliancess
            .findOne({
              _awareid: select_receiver_avaliable._awareid,
              update_aware_token_id: token_details.update_aware_token_id,
            })
            .select(["_id"])
            .catch((ex) => {
              loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
              return res
                .status(400)
                .jsonp({ status: false, message: "Bad request!" });
            });

          const select_receiver_id = await select_receiver
            .findOne({
              _awareid: select_receiver_avaliable._awareid,
              send_aware_token_id:
                select_receiver_avaliable.send_aware_token_id,
            })
            .select(["_id"])
            .catch((ex) => {
              loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
              return res
                .status(500)
                .jsonp({ status: false, message: ex.toString() });
            });
          const selected_aware_token_id = await selected_aware_token
            .findOne({
              _awareid: select_receiver_avaliable._awareid,
              send_aware_token_id:
                select_receiver_avaliable.send_aware_token_id,
            })
            .select(["_id"])
            .catch((ex) => {
              loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
              return res
                .status(500)
                .jsonp({ status: false, message: ex.toString() });
            });
          const selected_transaction_certificates_id =
            await selected_transaction_certificates
              .findOne({
                _awareid: select_receiver_avaliable._awareid,
                send_aware_token_id:
                  select_receiver_avaliable.send_aware_token_id,
              })
              .select(["_id"])
              .catch((ex) => {
                loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
                return res
                  .status(500)
                  .jsonp({ status: false, message: ex.toString() });
              });
          const selected_proof_of_delivery_id = await selected_proof_of_delivery
            .findOne({
              _awareid: select_receiver_avaliable._awareid,
              send_aware_token_id:
                select_receiver_avaliable.send_aware_token_id,
            })
            .select(["_id"])
            .catch((ex) => {
              loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
              return res
                .status(500)
                .jsonp({ status: false, message: ex.toString() });
            });
          const transaction_history_avaliable = await transaction_history
            .findOne({
              _awareid: select_receiver_avaliable._awareid,
              update_aware_token_id: token_details.update_aware_token_id,
            })
            .select(["_id"])
            .catch((ex) => {
              loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
              return res
                .status(400)
                .jsonp({ status: false, message: "Bad request!" });
            });

          var blockchain_Object = await update_aw_tokens
            .findOne({
              _id: mongoose.Types.ObjectId(token_details.update_aware_token_id),
            })
            .select(["blockchain_id"])
            .catch((ex) => {
              loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
              return res
                .status(400)
                .jsonp({ status: false, message: "Bad request!" });
            });
          var wallet_of_sender = await wallets
            .findOne({ _awareid: select_receiver_avaliable._awareid })
            .select(["wallet_address_0x", "from", "to"])
            .catch((ex) => {
              loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
              return res
                .status(400)
                .jsonp({ status: false, message: "Bad request!" });
            });
          var wallet_of_receiver = await wallets
            .findOne({ _awareid: select_receiver_avaliable._receiver_awareid })
            .select(["wallet_address_0x", "from", "to"])
            .catch((ex) => {
              loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
              return res
                .status(400)
                .jsonp({ status: false, message: "Bad request!" });
            });

          var from0xaddress = wallet_of_sender.wallet_address_0x;
          var useraddress = wallet_of_receiver.wallet_address_0x;
          var key = wallet_of_sender.from + wallet_of_sender.to;
          var decrypted_private_key = helperfunctions.encryptAddress(
            key,
            "decrypt"
          );

          var privatekey = "";
          for (var i = 3; i < decrypted_private_key.length - 1; i++) {
            privatekey = privatekey + decrypted_private_key[i];
          }

          // var abiArray = [
          //   {
          //     "inputs": [],
          //     "stateMutability": "nonpayable",
          //     "type": "constructor"
          //   },
          //   {
          //     "anonymous": false,
          //     "inputs": [
          //       {
          //         "indexed": true,
          //         "internalType": "address",
          //         "name": "account",
          //         "type": "address"
          //       },
          //       {
          //         "indexed": true,
          //         "internalType": "address",
          //         "name": "operator",
          //         "type": "address"
          //       },
          //       {
          //         "indexed": false,
          //         "internalType": "bool",
          //         "name": "approved",
          //         "type": "bool"
          //       }
          //     ],
          //     "name": "ApprovalForAll",
          //     "type": "event"
          //   },
          //   {
          //     "anonymous": false,
          //     "inputs": [
          //       {
          //         "indexed": true,
          //         "internalType": "uint256",
          //         "name": "_tokenId",
          //         "type": "uint256"
          //       },
          //       {
          //         "indexed": false,
          //         "internalType": "address",
          //         "name": "owner",
          //         "type": "address"
          //       },
          //       {
          //         "indexed": false,
          //         "internalType": "string",
          //         "name": "_uri",
          //         "type": "string"
          //       }
          //     ],
          //     "name": "TokenMetadataURIUpdated",
          //     "type": "event"
          //   },
          //   {
          //     "anonymous": false,
          //     "inputs": [
          //       {
          //         "indexed": true,
          //         "internalType": "uint256",
          //         "name": "_tokenId",
          //         "type": "uint256"
          //       },
          //       {
          //         "indexed": false,
          //         "internalType": "address",
          //         "name": "owner",
          //         "type": "address"
          //       },
          //       {
          //         "indexed": false,
          //         "internalType": "string",
          //         "name": "_uri",
          //         "type": "string"
          //       }
          //     ],
          //     "name": "TokenURIUpdated",
          //     "type": "event"
          //   },
          //   {
          //     "anonymous": false,
          //     "inputs": [
          //       {
          //         "indexed": true,
          //         "internalType": "address",
          //         "name": "operator",
          //         "type": "address"
          //       },
          //       {
          //         "indexed": true,
          //         "internalType": "address",
          //         "name": "from",
          //         "type": "address"
          //       },
          //       {
          //         "indexed": true,
          //         "internalType": "address",
          //         "name": "to",
          //         "type": "address"
          //       },
          //       {
          //         "indexed": false,
          //         "internalType": "uint256[]",
          //         "name": "ids",
          //         "type": "uint256[]"
          //       },
          //       {
          //         "indexed": false,
          //         "internalType": "uint256[]",
          //         "name": "values",
          //         "type": "uint256[]"
          //       }
          //     ],
          //     "name": "TransferBatch",
          //     "type": "event"
          //   },
          //   {
          //     "anonymous": false,
          //     "inputs": [
          //       {
          //         "indexed": true,
          //         "internalType": "address",
          //         "name": "operator",
          //         "type": "address"
          //       },
          //       {
          //         "indexed": true,
          //         "internalType": "address",
          //         "name": "from",
          //         "type": "address"
          //       },
          //       {
          //         "indexed": true,
          //         "internalType": "address",
          //         "name": "to",
          //         "type": "address"
          //       },
          //       {
          //         "indexed": false,
          //         "internalType": "uint256",
          //         "name": "id",
          //         "type": "uint256"
          //       },
          //       {
          //         "indexed": false,
          //         "internalType": "uint256",
          //         "name": "value",
          //         "type": "uint256"
          //       }
          //     ],
          //     "name": "TransferSingle",
          //     "type": "event"
          //   },
          //   {
          //     "anonymous": false,
          //     "inputs": [
          //       {
          //         "indexed": false,
          //         "internalType": "string",
          //         "name": "value",
          //         "type": "string"
          //       },
          //       {
          //         "indexed": true,
          //         "internalType": "uint256",
          //         "name": "id",
          //         "type": "uint256"
          //       }
          //     ],
          //     "name": "URI",
          //     "type": "event"
          //   },
          //   {
          //     "inputs": [
          //       {
          //         "internalType": "address",
          //         "name": "account",
          //         "type": "address"
          //       },
          //       {
          //         "internalType": "uint256",
          //         "name": "id",
          //         "type": "uint256"
          //       }
          //     ],
          //     "name": "balanceOf",
          //     "outputs": [
          //       {
          //         "internalType": "uint256",
          //         "name": "",
          //         "type": "uint256"
          //       }
          //     ],
          //     "stateMutability": "view",
          //     "type": "function"
          //   },
          //   {
          //     "inputs": [
          //       {
          //         "internalType": "address[]",
          //         "name": "accounts",
          //         "type": "address[]"
          //       },
          //       {
          //         "internalType": "uint256[]",
          //         "name": "ids",
          //         "type": "uint256[]"
          //       }
          //     ],
          //     "name": "balanceOfBatch",
          //     "outputs": [
          //       {
          //         "internalType": "uint256[]",
          //         "name": "",
          //         "type": "uint256[]"
          //       }
          //     ],
          //     "stateMutability": "view",
          //     "type": "function"
          //   },
          //   {
          //     "inputs": [
          //       {
          //         "internalType": "address",
          //         "name": "from",
          //         "type": "address"
          //       },
          //       {
          //         "internalType": "uint256",
          //         "name": "tokenId",
          //         "type": "uint256"
          //       },
          //       {
          //         "internalType": "uint256",
          //         "name": "amount",
          //         "type": "uint256"
          //       }
          //     ],
          //     "name": "burn",
          //     "outputs": [],
          //     "stateMutability": "nonpayable",
          //     "type": "function"
          //   },
          //   {
          //     "inputs": [
          //       {
          //         "internalType": "address",
          //         "name": "account",
          //         "type": "address"
          //       },
          //       {
          //         "internalType": "uint256[]",
          //         "name": "ids",
          //         "type": "uint256[]"
          //       },
          //       {
          //         "internalType": "uint256[]",
          //         "name": "values",
          //         "type": "uint256[]"
          //       }
          //     ],
          //     "name": "burnBatch",
          //     "outputs": [],
          //     "stateMutability": "nonpayable",
          //     "type": "function"
          //   },
          //   {
          //     "inputs": [
          //       {
          //         "internalType": "address",
          //         "name": "account",
          //         "type": "address"
          //       },
          //       {
          //         "internalType": "address",
          //         "name": "operator",
          //         "type": "address"
          //       }
          //     ],
          //     "name": "isApprovedForAll",
          //     "outputs": [
          //       {
          //         "internalType": "bool",
          //         "name": "",
          //         "type": "bool"
          //       }
          //     ],
          //     "stateMutability": "view",
          //     "type": "function"
          //   },
          //   {
          //     "inputs": [
          //       {
          //         "components": [
          //           {
          //             "internalType": "string",
          //             "name": "tokenURI",
          //             "type": "string"
          //           },
          //           {
          //             "internalType": "string",
          //             "name": "metadataURI",
          //             "type": "string"
          //           },
          //           {
          //             "internalType": "bytes32",
          //             "name": "contentHash",
          //             "type": "bytes32"
          //           },
          //           {
          //             "internalType": "bytes32",
          //             "name": "metadataHash",
          //             "type": "bytes32"
          //           }
          //         ],
          //         "internalType": "struct IAwareToken.AwareData",
          //         "name": "data",
          //         "type": "tuple"
          //       },
          //       {
          //         "internalType": "address",
          //         "name": "recipient",
          //         "type": "address"
          //       },
          //       {
          //         "internalType": "uint256",
          //         "name": "amount",
          //         "type": "uint256"
          //       }
          //     ],
          //     "name": "mint",
          //     "outputs": [],
          //     "stateMutability": "nonpayable",
          //     "type": "function"
          //   },
          //   {
          //     "inputs": [
          //       {
          //         "internalType": "uint256",
          //         "name": "tokenId",
          //         "type": "uint256"
          //       }
          //     ],
          //     "name": "ownerOf",
          //     "outputs": [
          //       {
          //         "internalType": "address",
          //         "name": "",
          //         "type": "address"
          //       }
          //     ],
          //     "stateMutability": "view",
          //     "type": "function"
          //   },
          //   {
          //     "inputs": [
          //       {
          //         "internalType": "uint256",
          //         "name": "",
          //         "type": "uint256"
          //       }
          //     ],
          //     "name": "previousTokenOwners",
          //     "outputs": [
          //       {
          //         "internalType": "address",
          //         "name": "",
          //         "type": "address"
          //       }
          //     ],
          //     "stateMutability": "view",
          //     "type": "function"
          //   },
          //   {
          //     "inputs": [
          //       {
          //         "internalType": "address",
          //         "name": "from",
          //         "type": "address"
          //       },
          //       {
          //         "internalType": "address",
          //         "name": "to",
          //         "type": "address"
          //       },
          //       {
          //         "internalType": "uint256[]",
          //         "name": "ids",
          //         "type": "uint256[]"
          //       },
          //       {
          //         "internalType": "uint256[]",
          //         "name": "amounts",
          //         "type": "uint256[]"
          //       },
          //       {
          //         "internalType": "bytes",
          //         "name": "data",
          //         "type": "bytes"
          //       }
          //     ],
          //     "name": "safeBatchTransferFrom",
          //     "outputs": [],
          //     "stateMutability": "nonpayable",
          //     "type": "function"
          //   },
          //   {
          //     "inputs": [
          //       {
          //         "internalType": "address",
          //         "name": "from",
          //         "type": "address"
          //       },
          //       {
          //         "internalType": "address",
          //         "name": "to",
          //         "type": "address"
          //       },
          //       {
          //         "internalType": "uint256",
          //         "name": "id",
          //         "type": "uint256"
          //       },
          //       {
          //         "internalType": "uint256",
          //         "name": "amount",
          //         "type": "uint256"
          //       },
          //       {
          //         "internalType": "bytes",
          //         "name": "data",
          //         "type": "bytes"
          //       }
          //     ],
          //     "name": "safeTransferFrom",
          //     "outputs": [],
          //     "stateMutability": "nonpayable",
          //     "type": "function"
          //   },
          //   {
          //     "inputs": [
          //       {
          //         "internalType": "address",
          //         "name": "operator",
          //         "type": "address"
          //       },
          //       {
          //         "internalType": "bool",
          //         "name": "approved",
          //         "type": "bool"
          //       }
          //     ],
          //     "name": "setApprovalForAll",
          //     "outputs": [],
          //     "stateMutability": "nonpayable",
          //     "type": "function"
          //   },
          //   {
          //     "inputs": [
          //       {
          //         "internalType": "uint256",
          //         "name": "_tokenId",
          //         "type": "uint256"
          //       },
          //       {
          //         "internalType": "string",
          //         "name": "_type",
          //         "type": "string"
          //       }
          //     ],
          //     "name": "setTokenType",
          //     "outputs": [],
          //     "stateMutability": "nonpayable",
          //     "type": "function"
          //   },
          //   {
          //     "inputs": [
          //       {
          //         "internalType": "bytes4",
          //         "name": "interfaceId",
          //         "type": "bytes4"
          //       }
          //     ],
          //     "name": "supportsInterface",
          //     "outputs": [
          //       {
          //         "internalType": "bool",
          //         "name": "",
          //         "type": "bool"
          //       }
          //     ],
          //     "stateMutability": "view",
          //     "type": "function"
          //   },
          //   {
          //     "inputs": [
          //       {
          //         "internalType": "uint256",
          //         "name": "",
          //         "type": "uint256"
          //       }
          //     ],
          //     "name": "tokenContentHashes",
          //     "outputs": [
          //       {
          //         "internalType": "bytes32",
          //         "name": "",
          //         "type": "bytes32"
          //       }
          //     ],
          //     "stateMutability": "view",
          //     "type": "function"
          //   },
          //   {
          //     "inputs": [
          //       {
          //         "internalType": "uint256",
          //         "name": "",
          //         "type": "uint256"
          //       }
          //     ],
          //     "name": "tokenCreators",
          //     "outputs": [
          //       {
          //         "internalType": "address",
          //         "name": "",
          //         "type": "address"
          //       }
          //     ],
          //     "stateMutability": "view",
          //     "type": "function"
          //   },
          //   {
          //     "inputs": [
          //       {
          //         "internalType": "uint256",
          //         "name": "",
          //         "type": "uint256"
          //       }
          //     ],
          //     "name": "tokenMetadataHashes",
          //     "outputs": [
          //       {
          //         "internalType": "bytes32",
          //         "name": "",
          //         "type": "bytes32"
          //       }
          //     ],
          //     "stateMutability": "view",
          //     "type": "function"
          //   },
          //   {
          //     "inputs": [
          //       {
          //         "internalType": "uint256",
          //         "name": "tokenId",
          //         "type": "uint256"
          //       }
          //     ],
          //     "name": "tokenMetadataURI",
          //     "outputs": [
          //       {
          //         "internalType": "string",
          //         "name": "",
          //         "type": "string"
          //       }
          //     ],
          //     "stateMutability": "view",
          //     "type": "function"
          //   },
          //   {
          //     "inputs": [
          //       {
          //         "internalType": "uint256",
          //         "name": "tokenId",
          //         "type": "uint256"
          //       }
          //     ],
          //     "name": "tokentype",
          //     "outputs": [
          //       {
          //         "internalType": "string",
          //         "name": "",
          //         "type": "string"
          //       }
          //     ],
          //     "stateMutability": "view",
          //     "type": "function"
          //   },
          //   {
          //     "inputs": [
          //       {
          //         "internalType": "uint256",
          //         "name": "tokenId",
          //         "type": "uint256"
          //       },
          //       {
          //         "internalType": "string",
          //         "name": "metadataURI",
          //         "type": "string"
          //       }
          //     ],
          //     "name": "updateTokenMetadataURI",
          //     "outputs": [],
          //     "stateMutability": "nonpayable",
          //     "type": "function"
          //   },
          //   {
          //     "inputs": [
          //       {
          //         "internalType": "uint256",
          //         "name": "tokenId",
          //         "type": "uint256"
          //       },
          //       {
          //         "internalType": "string",
          //         "name": "tokenURI",
          //         "type": "string"
          //       }
          //     ],
          //     "name": "updateTokenURI",
          //     "outputs": [],
          //     "stateMutability": "nonpayable",
          //     "type": "function"
          //   },
          //   {
          //     "inputs": [
          //       {
          //         "internalType": "uint256",
          //         "name": "tokenId",
          //         "type": "uint256"
          //       }
          //     ],
          //     "name": "uri",
          //     "outputs": [
          //       {
          //         "internalType": "string",
          //         "name": "",
          //         "type": "string"
          //       }
          //     ],
          //     "stateMutability": "view",
          //     "type": "function"
          //   }
          // ]

          const contractAddress = process.env.CONTRACT_ADDRESS;
          var contract = new connectWeb3.eth.Contract(
            abiArray,
            contractAddress,
            { from: process.env.ADMIN_WALLET_ADDRESS }
          );

          var amountInUint = token_details.To_be_Send;

          var gasAmount = await contract.methods
            .safeTransferFrom(
              from0xaddress.toLowerCase(),
              useraddress.toLowerCase(),
              blockchain_Object.blockchain_id.toString(),
              amountInUint.toString(),
              []
            )
            .estimateGas({ from: from0xaddress });

          var increased = Number(gasAmount) * 0.2;
          gasAmount = Math.ceil(Number(gasAmount) + increased);

          connectWeb3.eth
            .getBalance(from0xaddress.toLowerCase())
            .then(async function (balance) {
              let iotxBalance = Big(balance).div(10 ** 18);
              console.log(
                "Balance while send aw update token",
                iotxBalance.toFixed(18)
              );
              if (iotxBalance.toFixed(18) < 2) {
                await transferAsync(
                  req,
                  from0xaddress,
                  gasAmount,
                  async function (response) {
                    connectWeb3.eth
                      .getBalance(from0xaddress.toLowerCase())
                      .then(async function (balance) {
                        let iotxBalance = Big(balance).div(10 ** 18);
                        console.log(
                          "Balance after t/f of funds send aw token",
                          iotxBalance.toFixed(18)
                        );
                        if (response == true && iotxBalance.toFixed(18) > 0) {
                          const gasPrice = await connectWeb3.eth.getGasPrice();

                          const txConfig = {
                            from: from0xaddress,
                            to: contractAddress,
                            gasPrice: gasPrice,
                            gas: gasAmount.toString(),
                            nonce: nonce_coming.toString(),
                            data: contract.methods
                              .safeTransferFrom(
                                from0xaddress.toLowerCase(),
                                useraddress.toLowerCase(),
                                blockchain_Object.blockchain_id.toString(),
                                amountInUint.toString(),
                                []
                              )
                              .encodeABI(),
                          };

                          console.log("bangtxConfig", txConfig);
                          // console.log("privatekey", privatekey)

                          connectWeb3.eth.accounts.signTransaction(
                            txConfig,
                            "0x" + privatekey,
                            async function (err, signedTx) {
                              if (err) {
                                loggerhandler.logger.error(
                                  `${err} ,email:${req.headers.email}`
                                );
                                console.log("signTransactionerr", err);
                                reject();
                              }

                              console.log("signedTx", signedTx);
                              connectWeb3.eth
                                .sendSignedTransaction(signedTx.rawTransaction)
                                .on("receipt", async function (receipt) {
                                  console.log("Tx Hash (Receipt): ", receipt);

                                  transaction_history.create(
                                    {
                                      _awareid:
                                        select_receiver_avaliable._awareid,
                                      update_aware_token_id:
                                        token_details.update_aware_token_id,
                                      transactionIndex:
                                        receipt.transactionIndex,
                                      transactionHash: receipt.transactionHash,
                                      blockHash: receipt.blockHash,
                                      blockNumber: receipt.blockNumber,
                                      from: receipt.from,
                                      to: receipt.to,
                                      cumulativeGasUsed:
                                        receipt.cumulativeGasUsed,
                                      gasUsed: receipt.gasUsed,
                                      contractAddress: receipt.contractAddress,
                                      logsBloom: receipt.logsBloom,
                                      logs: receipt.logs,
                                      status: receipt.status,
                                    },
                                    async function (err, history) {
                                      if (err) {
                                        loggerhandler.logger.error(
                                          `${err} ,email:${req.headers.email}`
                                        );
                                        reject();
                                      }

                                      transferred_tokens.create(
                                        {
                                          _awareid:
                                            select_receiver_avaliable._receiver_awareid,
                                          type_of_token:
                                            selected_aware_token_avaliable.aware_token_type,
                                          total_tokens:
                                            token_details.To_be_Send,
                                          avaliable_tokens:
                                            token_details.To_be_Send,
                                          historical_awareid:
                                            select_receiver_avaliable._awareid,
                                          blockchain_id:
                                            blockchain_Object.blockchain_id,

                                          historical_update_aware_token_id:
                                            token_details.update_aware_token_id,
                                          historical_selected_update_aware_token_id:
                                            selected_update_aware_token_id
                                              ? selected_update_aware_token_id
                                              : null,
                                          historical_update_physical_assets_id:
                                            update_assets_avaliable_id
                                              ? update_assets_avaliable_id
                                              : null,
                                          historical_update_tracers_id:
                                            update_tracer_id
                                              ? update_tracer_id
                                              : null,
                                          historical_update_self_validations_id:
                                            update_self_validation_id
                                              ? update_self_validation_id
                                              : null,
                                          historical_update_company_compliances_id:
                                            update_company_complians_id
                                              ? update_company_complians_id
                                              : null,

                                          historical_send_aw_tokens_id:
                                            select_receiver_avaliable.send_aware_token_id,

                                          historical_selected_receivers_id:
                                            select_receiver_id
                                              ? select_receiver_id
                                              : null,
                                          historical_selected_aware_tokens_id:
                                            selected_aware_token_id
                                              ? selected_aware_token_id
                                              : null,
                                          historical_selected_transaction_certificates_id:
                                            selected_transaction_certificates_id
                                              ? selected_transaction_certificates_id
                                              : null,
                                          historical_selected_proof_of_deliveries_id:
                                            selected_proof_of_delivery_id
                                              ? selected_proof_of_delivery_id
                                              : null,

                                          blochchain_transaction_history_id:
                                            transaction_history_avaliable
                                              ? transaction_history_avaliable._id
                                              : null,

                                          token_base_type: "updated",
                                        },
                                        async function (err, history) {
                                          if (err) {
                                            loggerhandler.logger.error(
                                              `${err} ,email:${req.headers.email}`
                                            );
                                            console.log(
                                              "transferred_tokenserr",
                                              err
                                            );
                                            reject();
                                          }

                                          await update_aw_tokens
                                            .findOneAndUpdate(
                                              {
                                                _awareid:
                                                  select_receiver_avaliable._awareid,
                                                _id: mongoose.Types.ObjectId(
                                                  token_details.update_aware_token_id
                                                ),
                                              },
                                              {
                                                avaliable_tokens:
                                                  token_details.balance,
                                                used_tokens:
                                                  token_details.To_be_Send,
                                                locked: false,
                                              },
                                              { new: true }
                                            )
                                            .catch((ex) => {
                                              console.log("ex", ex);
                                              loggerhandler.logger.error(
                                                `${ex} ,email:${req.headers.email}`
                                              );
                                              reject();
                                            });

                                          resolve();
                                        }
                                      );
                                    }
                                  );
                                })
                                .on("error", async function (e) {
                                  loggerhandler.logger.error(
                                    `${e} ,email:${req.headers.email}`
                                  );
                                  console.log("e", e);

                                  reject();
                                });
                            }
                          );
                        } else {
                          reject();
                        }
                      });
                  }
                );
              } else {
                const gasPrice = await connectWeb3.eth.getGasPrice();

                const txConfig = {
                  from: from0xaddress,
                  to: contractAddress,
                  gasPrice: gasPrice,
                  gas: gasAmount.toString(),
                  nonce: nonce_coming.toString(),
                  data: contract.methods
                    .safeTransferFrom(
                      from0xaddress.toLowerCase(),
                      useraddress.toLowerCase(),
                      blockchain_Object.blockchain_id.toString(),
                      amountInUint.toString(),
                      []
                    )
                    .encodeABI(),
                };

                console.log("bangtxConfig", txConfig);
                // console.log("connectWeb3", connectWeb3.eth.accounts)

                connectWeb3.eth.accounts.signTransaction(
                  txConfig,
                  "0x" + privatekey,
                  async function (err, signedTx) {
                    if (err) {
                      loggerhandler.logger.error(
                        `${err} ,email:${req.headers.email}`
                      );
                      console.log("signTransactionerr", err);
                      reject();
                    }

                    console.log("signedTx", signedTx);
                    connectWeb3.eth
                      .sendSignedTransaction(signedTx.rawTransaction)
                      .on("receipt", async function (receipt) {
                        console.log("Tx Hash (Receipt): ", receipt);

                        transaction_history.create(
                          {
                            _awareid: select_receiver_avaliable._awareid,
                            update_aware_token_id:
                              token_details.update_aware_token_id,
                            transactionIndex: receipt.transactionIndex,
                            transactionHash: receipt.transactionHash,
                            blockHash: receipt.blockHash,
                            blockNumber: receipt.blockNumber,
                            from: receipt.from,
                            to: receipt.to,
                            cumulativeGasUsed: receipt.cumulativeGasUsed,
                            gasUsed: receipt.gasUsed,
                            contractAddress: receipt.contractAddress,
                            logsBloom: receipt.logsBloom,
                            logs: receipt.logs,
                            status: receipt.status,
                          },
                          async function (err, history) {
                            if (err) {
                              loggerhandler.logger.error(
                                `${err} ,email:${req.headers.email}`
                              );
                              reject();
                            }

                            transferred_tokens.create(
                              {
                                _awareid:
                                  select_receiver_avaliable._receiver_awareid,
                                type_of_token:
                                  selected_aware_token_avaliable.aware_token_type,
                                total_tokens: token_details.To_be_Send,
                                avaliable_tokens: token_details.To_be_Send,
                                historical_awareid:
                                  select_receiver_avaliable._awareid,
                                blockchain_id: blockchain_Object.blockchain_id,

                                historical_update_aware_token_id:
                                  token_details.update_aware_token_id,
                                historical_selected_update_aware_token_id:
                                  selected_update_aware_token_id
                                    ? selected_update_aware_token_id
                                    : null,
                                historical_update_physical_assets_id:
                                  update_assets_avaliable_id
                                    ? update_assets_avaliable_id
                                    : null,
                                historical_update_tracers_id: update_tracer_id
                                  ? update_tracer_id
                                  : null,
                                historical_update_self_validations_id:
                                  update_self_validation_id
                                    ? update_self_validation_id
                                    : null,
                                historical_update_company_compliances_id:
                                  update_company_complians_id
                                    ? update_company_complians_id
                                    : null,

                                historical_send_aw_tokens_id:
                                  select_receiver_avaliable.send_aware_token_id,

                                historical_selected_receivers_id:
                                  select_receiver_id
                                    ? select_receiver_id
                                    : null,
                                historical_selected_aware_tokens_id:
                                  selected_aware_token_id
                                    ? selected_aware_token_id
                                    : null,
                                historical_selected_transaction_certificates_id:
                                  selected_transaction_certificates_id
                                    ? selected_transaction_certificates_id
                                    : null,
                                historical_selected_proof_of_deliveries_id:
                                  selected_proof_of_delivery_id
                                    ? selected_proof_of_delivery_id
                                    : null,

                                blochchain_transaction_history_id:
                                  transaction_history_avaliable
                                    ? transaction_history_avaliable._id
                                    : null,

                                token_base_type: "updated",
                              },
                              async function (err, history) {
                                if (err) {
                                  loggerhandler.logger.error(
                                    `${err} ,email:${req.headers.email}`
                                  );
                                  console.log("transferred_tokenserr", err);
                                  reject();
                                }

                                await update_aw_tokens
                                  .findOneAndUpdate(
                                    {
                                      _awareid:
                                        select_receiver_avaliable._awareid,
                                      _id: mongoose.Types.ObjectId(
                                        token_details.update_aware_token_id
                                      ),
                                    },
                                    {
                                      avaliable_tokens: token_details.balance,
                                      used_tokens: token_details.To_be_Send,
                                      locked: false,
                                    },
                                    { new: true }
                                  )
                                  .catch((ex) => {
                                    console.log("ex", ex);
                                    loggerhandler.logger.error(
                                      `${ex} ,email:${req.headers.email}`
                                    );
                                    reject();
                                  });

                                resolve();
                              }
                            );
                          }
                        );
                      })
                      .on("error", async function (e) {
                        loggerhandler.logger.error(
                          `${e} ,email:${req.headers.email}`
                        );
                        console.log("e", e);

                        reject();
                      });
                  }
                );
              }
            });
        }
      } catch (error) {
        loggerhandler.logger.error(`${error} ,email:${req.headers.email}`);
        console.log("error", error);
        reject();
      }
    });
  },

  sendTokenAndUpdateBalanceInBatch: function (
    token_details,
    select_receiver_avaliable,
    selected_aware_token_avaliable,
    receipt,
    req
  ) {
    return new Promise(async (resolve, reject) => {
      try {
        //checking if it is aware_token_if or update_aware_token_id
        if (token_details.aware_token_id) {
          var assets_avaliable_id = await physical_assets
            .findOne({
              _awareid: select_receiver_avaliable._awareid,
              aware_token_id: token_details.aware_token_id,
            })
            .select(["_id"])
            .catch((ex) => {
              loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
              return res
                .status(400)
                .jsonp({ status: false, message: "Bad request!" });
            });
          var tracer_id = await tracer
            .findOne({
              _awareid: select_receiver_avaliable._awareid,
              aware_token_id: token_details.aware_token_id,
            })
            .select(["_id"])
            .catch((ex) => {
              loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
              return res
                .status(400)
                .jsonp({ status: false, message: "Bad request!" });
            });
          var self_validation_id = await self_validation
            .findOne({
              _awareid: select_receiver_avaliable._awareid,
              aware_token_id: token_details.aware_token_id,
            })
            .select(["_id"])
            .catch((ex) => {
              loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
              return res
                .status(400)
                .jsonp({ status: false, message: "Bad request!" });
            });
          var company_complians_id = await company_complians
            .findOne({
              _awareid: select_receiver_avaliable._awareid,
              aware_token_id: token_details.aware_token_id,
            })
            .select(["_id"])
            .catch((ex) => {
              loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
              return res
                .status(400)
                .jsonp({ status: false, message: "Bad request!" });
            });

          const select_receiver_id = await select_receiver
            .findOne({
              _awareid: select_receiver_avaliable._awareid,
              send_aware_token_id:
                select_receiver_avaliable.send_aware_token_id,
            })
            .select(["_id"])
            .catch((ex) => {
              loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
              return res
                .status(500)
                .jsonp({ status: false, message: ex.toString() });
            });
          const selected_aware_token_id = await selected_aware_token
            .findOne({
              _awareid: select_receiver_avaliable._awareid,
              send_aware_token_id:
                select_receiver_avaliable.send_aware_token_id,
            })
            .select(["_id"])
            .catch((ex) => {
              loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
              return res
                .status(500)
                .jsonp({ status: false, message: ex.toString() });
            });
          const selected_transaction_certificates_id =
            await selected_transaction_certificates
              .findOne({
                _awareid: select_receiver_avaliable._awareid,
                send_aware_token_id:
                  select_receiver_avaliable.send_aware_token_id,
              })
              .select(["_id"])
              .catch((ex) => {
                loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
                return res
                  .status(500)
                  .jsonp({ status: false, message: ex.toString() });
              });
          const selected_proof_of_delivery_id = await selected_proof_of_delivery
            .findOne({
              _awareid: select_receiver_avaliable._awareid,
              send_aware_token_id:
                select_receiver_avaliable.send_aware_token_id,
            })
            .select(["_id"])
            .catch((ex) => {
              loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
              return res
                .status(500)
                .jsonp({ status: false, message: ex.toString() });
            });

          const transaction_history_avaliable = await transaction_history
            .findOne({
              _awareid: select_receiver_avaliable._awareid,
              aware_token_id: token_details.aware_token_id,
            })
            .select(["_id"])
            .catch((ex) => {
              loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
              return res
                .status(400)
                .jsonp({ status: false, message: "Bad request!" });
            });

          var blockchain_Object = await aw_tokens
            .findOne({
              _id: mongoose.Types.ObjectId(token_details.aware_token_id),
            })
            .select(["blockchain_id"])
            .catch((ex) => {
              loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
              return res
                .status(400)
                .jsonp({ status: false, message: "Bad request!" });
            });

          transaction_history.create(
            {
              _awareid: select_receiver_avaliable._awareid,
              aware_token_id: token_details.aware_token_id,
              transactionIndex: receipt.transactionIndex,
              transactionHash: receipt.transactionHash,
              blockHash: receipt.blockHash,
              blockNumber: receipt.blockNumber,
              from: receipt.from,
              to: receipt.to,
              cumulativeGasUsed: receipt.cumulativeGasUsed,
              gasUsed: receipt.gasUsed,
              contractAddress: receipt.contractAddress,
              logsBloom: receipt.logsBloom,
              logs: receipt.logs,
              status: receipt.status,
            },
            async function (err, history) {
              if (err) {
                loggerhandler.logger.error(
                  `${err} ,email:${req.headers.email}`
                );
                console.log("err", err);
                reject();
              }

              transferred_tokens.create(
                {
                  _awareid: select_receiver_avaliable._receiver_awareid,
                  type_of_token:
                    selected_aware_token_avaliable.aware_token_type,
                  total_tokens: token_details.To_be_Send,
                  avaliable_tokens: token_details.To_be_Send,
                  historical_awareid: select_receiver_avaliable._awareid,
                  blockchain_id: blockchain_Object.blockchain_id,
                  historical_aware_token_id: token_details.aware_token_id,
                  historical_physical_assets_id: assets_avaliable_id
                    ? assets_avaliable_id
                    : null,
                  historical_tracers_id: tracer_id ? tracer_id : null,
                  historical_company_compliances_id: company_complians_id
                    ? company_complians_id
                    : null,
                  historical_self_validations_id: self_validation_id
                    ? self_validation_id
                    : null,

                  historical_send_aw_tokens_id:
                    select_receiver_avaliable.send_aware_token_id,

                  historical_selected_receivers_id: select_receiver_id
                    ? select_receiver_id
                    : null,
                  historical_selected_aware_tokens_id: selected_aware_token_id
                    ? selected_aware_token_id
                    : null,
                  historical_selected_transaction_certificates_id:
                    selected_transaction_certificates_id
                      ? selected_transaction_certificates_id
                      : null,
                  historical_selected_proof_of_deliveries_id:
                    selected_proof_of_delivery_id
                      ? selected_proof_of_delivery_id
                      : null,

                  blochchain_transaction_history_id:
                    transaction_history_avaliable
                      ? transaction_history_avaliable._id
                      : null,

                  token_base_type: "initiated",
                },
                async function (err, history) {
                  if (err) {
                    loggerhandler.logger.error(
                      `${err} ,email:${req.headers.email}`
                    );
                    console.log("transferred_tokenserr", err);
                    reject();
                  }

                  await aw_tokens
                    .findOneAndUpdate(
                      {
                        _awareid: select_receiver_avaliable._awareid,
                        _id: mongoose.Types.ObjectId(
                          token_details.aware_token_id
                        ),
                      },
                      {
                        avaliable_tokens: token_details.balance,
                        used_tokens: token_details.To_be_Send,
                        locked: false,
                      },
                      { new: true }
                    )
                    .catch((ex) => {
                      console.log("ex", ex);
                      loggerhandler.logger.error(
                        `${ex} ,email:${req.headers.email}`
                      );
                      reject();
                    });

                  resolve();
                }
              );
            }
          );
        } else {
          var selected_update_aware_token_id = await selected_update_aware_token
            .findOne({
              _awareid: select_receiver_avaliable._awareid,
              update_aware_token_id: token_details.update_aware_token_id,
            })
            .select(["_id"])
            .catch((ex) => {
              loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
              return res
                .status(400)
                .jsonp({ status: false, message: "Bad request!" });
            });
          var update_assets_avaliable_id = await update_physical_asset
            .findOne({
              _awareid: select_receiver_avaliable._awareid,
              update_aware_token_id: token_details.update_aware_token_id,
            })
            .select(["_id"])
            .catch((ex) => {
              loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
              return res
                .status(400)
                .jsonp({ status: false, message: "Bad request!" });
            });
          var update_tracer_id = await update_tracer
            .findOne({
              _awareid: select_receiver_avaliable._awareid,
              update_aware_token_id: token_details.update_aware_token_id,
            })
            .select(["_id"])
            .catch((ex) => {
              loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
              return res
                .status(400)
                .jsonp({ status: false, message: "Bad request!" });
            });
          var update_self_validation_id = await update_self_validation
            .findOne({
              _awareid: select_receiver_avaliable._awareid,
              update_aware_token_id: token_details.update_aware_token_id,
            })
            .select(["_id"])
            .catch((ex) => {
              loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
              return res
                .status(400)
                .jsonp({ status: false, message: "Bad request!" });
            });
          var update_company_complians_id = await update_company_compliancess
            .findOne({
              _awareid: select_receiver_avaliable._awareid,
              update_aware_token_id: token_details.update_aware_token_id,
            })
            .select(["_id"])
            .catch((ex) => {
              loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
              return res
                .status(400)
                .jsonp({ status: false, message: "Bad request!" });
            });

          const select_receiver_id = await select_receiver
            .findOne({
              _awareid: select_receiver_avaliable._awareid,
              send_aware_token_id:
                select_receiver_avaliable.send_aware_token_id,
            })
            .select(["_id"])
            .catch((ex) => {
              loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
              return res
                .status(500)
                .jsonp({ status: false, message: ex.toString() });
            });
          const selected_aware_token_id = await selected_aware_token
            .findOne({
              _awareid: select_receiver_avaliable._awareid,
              send_aware_token_id:
                select_receiver_avaliable.send_aware_token_id,
            })
            .select(["_id"])
            .catch((ex) => {
              loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
              return res
                .status(500)
                .jsonp({ status: false, message: ex.toString() });
            });
          const selected_transaction_certificates_id =
            await selected_transaction_certificates
              .findOne({
                _awareid: select_receiver_avaliable._awareid,
                send_aware_token_id:
                  select_receiver_avaliable.send_aware_token_id,
              })
              .select(["_id"])
              .catch((ex) => {
                loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
                return res
                  .status(500)
                  .jsonp({ status: false, message: ex.toString() });
              });
          const selected_proof_of_delivery_id = await selected_proof_of_delivery
            .findOne({
              _awareid: select_receiver_avaliable._awareid,
              send_aware_token_id:
                select_receiver_avaliable.send_aware_token_id,
            })
            .select(["_id"])
            .catch((ex) => {
              loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
              return res
                .status(500)
                .jsonp({ status: false, message: ex.toString() });
            });
          const transaction_history_avaliable = await transaction_history
            .findOne({
              _awareid: select_receiver_avaliable._awareid,
              update_aware_token_id: token_details.update_aware_token_id,
            })
            .select(["_id"])
            .catch((ex) => {
              loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
              return res
                .status(400)
                .jsonp({ status: false, message: "Bad request!" });
            });

          var blockchain_Object = await update_aw_tokens
            .findOne({
              _id: mongoose.Types.ObjectId(token_details.update_aware_token_id),
            })
            .select(["blockchain_id"])
            .catch((ex) => {
              loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
              return res
                .status(400)
                .jsonp({ status: false, message: "Bad request!" });
            });

          transaction_history.create(
            {
              _awareid: select_receiver_avaliable._awareid,
              update_aware_token_id: token_details.update_aware_token_id,
              transactionIndex: receipt.transactionIndex,
              transactionHash: receipt.transactionHash,
              blockHash: receipt.blockHash,
              blockNumber: receipt.blockNumber,
              from: receipt.from,
              to: receipt.to,
              cumulativeGasUsed: receipt.cumulativeGasUsed,
              gasUsed: receipt.gasUsed,
              contractAddress: receipt.contractAddress,
              logsBloom: receipt.logsBloom,
              logs: receipt.logs,
              status: receipt.status,
            },
            async function (err, history) {
              if (err) {
                loggerhandler.logger.error(
                  `${err} ,email:${req.headers.email}`
                );
                reject();
              }

              transferred_tokens.create(
                {
                  _awareid: select_receiver_avaliable._receiver_awareid,
                  type_of_token:
                    selected_aware_token_avaliable.aware_token_type,
                  total_tokens: token_details.To_be_Send,
                  avaliable_tokens: token_details.To_be_Send,
                  historical_awareid: select_receiver_avaliable._awareid,
                  blockchain_id: blockchain_Object.blockchain_id,

                  historical_update_aware_token_id:
                    token_details.update_aware_token_id,
                  historical_selected_update_aware_token_id:
                    selected_update_aware_token_id
                      ? selected_update_aware_token_id
                      : null,
                  historical_update_physical_assets_id:
                    update_assets_avaliable_id
                      ? update_assets_avaliable_id
                      : null,
                  historical_update_tracers_id: update_tracer_id
                    ? update_tracer_id
                    : null,
                  historical_update_self_validations_id:
                    update_self_validation_id
                      ? update_self_validation_id
                      : null,
                  historical_update_company_compliances_id:
                    update_company_complians_id
                      ? update_company_complians_id
                      : null,

                  historical_send_aw_tokens_id:
                    select_receiver_avaliable.send_aware_token_id,

                  historical_selected_receivers_id: select_receiver_id
                    ? select_receiver_id
                    : null,
                  historical_selected_aware_tokens_id: selected_aware_token_id
                    ? selected_aware_token_id
                    : null,
                  historical_selected_transaction_certificates_id:
                    selected_transaction_certificates_id
                      ? selected_transaction_certificates_id
                      : null,
                  historical_selected_proof_of_deliveries_id:
                    selected_proof_of_delivery_id
                      ? selected_proof_of_delivery_id
                      : null,

                  blochchain_transaction_history_id:
                    transaction_history_avaliable
                      ? transaction_history_avaliable._id
                      : null,

                  token_base_type: "updated",
                },
                async function (err, history) {
                  if (err) {
                    loggerhandler.logger.error(
                      `${err} ,email:${req.headers.email}`
                    );
                    console.log("transferred_tokenserr", err);
                    reject();
                  }

                  await update_aw_tokens
                    .findOneAndUpdate(
                      {
                        _awareid: select_receiver_avaliable._awareid,
                        _id: mongoose.Types.ObjectId(
                          token_details.update_aware_token_id
                        ),
                      },
                      {
                        avaliable_tokens: token_details.balance,
                        used_tokens: token_details.To_be_Send,
                        locked: false,
                      },
                      { new: true }
                    )
                    .catch((ex) => {
                      console.log("ex", ex);
                      loggerhandler.logger.error(
                        `${ex} ,email:${req.headers.email}`
                      );
                      reject();
                    });

                  resolve();
                }
              );
            }
          );
        }
      } catch (error) {
        loggerhandler.logger.error(`${error} ,email:${req.headers.email}`);
        console.log("error", error);
        reject();
      }
    });
  },

  sendTokenAndUpdateBalanceInBatchTemp: function (
    token_details,
    select_receiver_avaliable,
    selected_aware_token_avaliable,
    req
  ) {
    return new Promise(async (resolve, reject) => {
      try {
        //checking if it is aware_token_if or update_aware_token_id
        if (token_details.aware_token_id) {
          var assets_avaliable_id = await physical_assets
            .findOne({
              _awareid: select_receiver_avaliable._awareid,
              aware_token_id: token_details.aware_token_id,
            })
            .select(["_id"])
            .catch((ex) => {
              loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
              return res
                .status(400)
                .jsonp({ status: false, message: "Bad request!" });
            });
          var tracer_id = await tracer
            .findOne({
              _awareid: select_receiver_avaliable._awareid,
              aware_token_id: token_details.aware_token_id,
            })
            .select(["_id"])
            .catch((ex) => {
              loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
              return res
                .status(400)
                .jsonp({ status: false, message: "Bad request!" });
            });
          var self_validation_id = await self_validation
            .findOne({
              _awareid: select_receiver_avaliable._awareid,
              aware_token_id: token_details.aware_token_id,
            })
            .select(["_id"])
            .catch((ex) => {
              loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
              return res
                .status(400)
                .jsonp({ status: false, message: "Bad request!" });
            });
          var company_complians_id = await company_complians
            .findOne({
              _awareid: select_receiver_avaliable._awareid,
              aware_token_id: token_details.aware_token_id,
            })
            .select(["_id"])
            .catch((ex) => {
              loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
              return res
                .status(400)
                .jsonp({ status: false, message: "Bad request!" });
            });

          const select_receiver_id = await select_receiver
            .findOne({
              _awareid: select_receiver_avaliable._awareid,
              send_aware_token_id:
                select_receiver_avaliable.send_aware_token_id,
            })
            .select(["_id"])
            .catch((ex) => {
              loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
              return res
                .status(500)
                .jsonp({ status: false, message: ex.toString() });
            });
          const selected_aware_token_id = await selected_aware_token
            .findOne({
              _awareid: select_receiver_avaliable._awareid,
              send_aware_token_id:
                select_receiver_avaliable.send_aware_token_id,
            })
            .select(["_id"])
            .catch((ex) => {
              loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
              return res
                .status(500)
                .jsonp({ status: false, message: ex.toString() });
            });
          const selected_transaction_certificates_id =
            await selected_transaction_certificates
              .findOne({
                _awareid: select_receiver_avaliable._awareid,
                send_aware_token_id:
                  select_receiver_avaliable.send_aware_token_id,
              })
              .select(["_id"])
              .catch((ex) => {
                loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
                return res
                  .status(500)
                  .jsonp({ status: false, message: ex.toString() });
              });
          const selected_proof_of_delivery_id = await selected_proof_of_delivery
            .findOne({
              _awareid: select_receiver_avaliable._awareid,
              send_aware_token_id:
                select_receiver_avaliable.send_aware_token_id,
            })
            .select(["_id"])
            .catch((ex) => {
              loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
              return res
                .status(500)
                .jsonp({ status: false, message: ex.toString() });
            });

          const transaction_history_avaliable = await transaction_history
            .findOne({
              _awareid: select_receiver_avaliable._awareid,
              aware_token_id: token_details.aware_token_id,
            })
            .select(["_id"])
            .catch((ex) => {
              loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
              return res
                .status(400)
                .jsonp({ status: false, message: "Bad request!" });
            });

          var blockchain_Object = await aw_tokens
            .findOne({
              _id: mongoose.Types.ObjectId(token_details.aware_token_id),
            })
            .select(["blockchain_id"])
            .catch((ex) => {
              loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
              return res
                .status(400)
                .jsonp({ status: false, message: "Bad request!" });
            });

          transaction_history.create(
            {
              _awareid: select_receiver_avaliable._awareid,
              aware_token_id: token_details.aware_token_id,
              transactionIndex: "transactionIndex",
              transactionHash: "transactionHash",
              blockHash: "blockHash",
              blockNumber: "blockNumber",
              from: "from",
              to: "to",
              cumulativeGasUsed: "cumulativeGasUsed",
              gasUsed: "gasUsed",
              contractAddress: "contractAddress",
              logsBloom: "logsBloom",
              logs: [
                {
                  removed: true,
                  logIndex: 0,
                  transactionIndex: 0,
                  transactionHash: "transactionHash",
                  blockHash: "blockHash",
                  blockNumber: 0,
                  address: "address",
                  data: "data",
                  topics: [],
                  id: "id",
                },
              ],
              status: false,
            },
            async function (err, history) {
              if (err) {
                loggerhandler.logger.error(
                  `${err} ,email:${req.headers.email}`
                );
                console.log("err", err);
                reject();
              }

              transferred_tokens.create(
                {
                  _awareid: select_receiver_avaliable._receiver_awareid,
                  type_of_token:
                    selected_aware_token_avaliable.aware_token_type,
                  total_tokens: token_details.To_be_Send,
                  avaliable_tokens: token_details.To_be_Send,
                  historical_awareid: select_receiver_avaliable._awareid,
                  blockchain_id: blockchain_Object.blockchain_id,
                  historical_aware_token_id: token_details.aware_token_id,
                  historical_physical_assets_id: assets_avaliable_id
                    ? assets_avaliable_id
                    : null,
                  historical_tracers_id: tracer_id ? tracer_id : null,
                  historical_company_compliances_id: company_complians_id
                    ? company_complians_id
                    : null,
                  historical_self_validations_id: self_validation_id
                    ? self_validation_id
                    : null,

                  historical_send_aw_tokens_id:
                    select_receiver_avaliable.send_aware_token_id,

                  historical_selected_receivers_id: select_receiver_id
                    ? select_receiver_id
                    : null,
                  historical_selected_aware_tokens_id: selected_aware_token_id
                    ? selected_aware_token_id
                    : null,
                  historical_selected_transaction_certificates_id:
                    selected_transaction_certificates_id
                      ? selected_transaction_certificates_id
                      : null,
                  historical_selected_proof_of_deliveries_id:
                    selected_proof_of_delivery_id
                      ? selected_proof_of_delivery_id
                      : null,

                  blochchain_transaction_history_id:
                    transaction_history_avaliable
                      ? transaction_history_avaliable._id
                      : null,

                  token_base_type: "initiated",
                },
                async function (err, history) {
                  if (err) {
                    loggerhandler.logger.error(
                      `${err} ,email:${req.headers.email}`
                    );
                    console.log("transferred_tokenserr", err);
                    reject();
                  }

                  await aw_tokens
                    .findOneAndUpdate(
                      {
                        _awareid: select_receiver_avaliable._awareid,
                        _id: mongoose.Types.ObjectId(
                          token_details.aware_token_id
                        ),
                      },
                      {
                        avaliable_tokens: token_details.balance,
                        used_tokens: token_details.To_be_Send,
                        locked: false,
                      },
                      { new: true }
                    )
                    .catch((ex) => {
                      console.log("ex", ex);
                      loggerhandler.logger.error(
                        `${ex} ,email:${req.headers.email}`
                      );
                      reject();
                    });

                  resolve();
                }
              );
            }
          );
        } else {
          var selected_update_aware_token_id = await selected_update_aware_token
            .findOne({
              _awareid: select_receiver_avaliable._awareid,
              update_aware_token_id: token_details.update_aware_token_id,
            })
            .select(["_id"])
            .catch((ex) => {
              loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
              return res
                .status(400)
                .jsonp({ status: false, message: "Bad request!" });
            });
          var update_assets_avaliable_id = await update_physical_asset
            .findOne({
              _awareid: select_receiver_avaliable._awareid,
              update_aware_token_id: token_details.update_aware_token_id,
            })
            .select(["_id"])
            .catch((ex) => {
              loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
              return res
                .status(400)
                .jsonp({ status: false, message: "Bad request!" });
            });
          var update_tracer_id = await update_tracer
            .findOne({
              _awareid: select_receiver_avaliable._awareid,
              update_aware_token_id: token_details.update_aware_token_id,
            })
            .select(["_id"])
            .catch((ex) => {
              loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
              return res
                .status(400)
                .jsonp({ status: false, message: "Bad request!" });
            });
          var update_self_validation_id = await update_self_validation
            .findOne({
              _awareid: select_receiver_avaliable._awareid,
              update_aware_token_id: token_details.update_aware_token_id,
            })
            .select(["_id"])
            .catch((ex) => {
              loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
              return res
                .status(400)
                .jsonp({ status: false, message: "Bad request!" });
            });
          var update_company_complians_id = await update_company_compliancess
            .findOne({
              _awareid: select_receiver_avaliable._awareid,
              update_aware_token_id: token_details.update_aware_token_id,
            })
            .select(["_id"])
            .catch((ex) => {
              loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
              return res
                .status(400)
                .jsonp({ status: false, message: "Bad request!" });
            });

          const select_receiver_id = await select_receiver
            .findOne({
              _awareid: select_receiver_avaliable._awareid,
              send_aware_token_id:
                select_receiver_avaliable.send_aware_token_id,
            })
            .select(["_id"])
            .catch((ex) => {
              loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
              return res
                .status(500)
                .jsonp({ status: false, message: ex.toString() });
            });
          const selected_aware_token_id = await selected_aware_token
            .findOne({
              _awareid: select_receiver_avaliable._awareid,
              send_aware_token_id:
                select_receiver_avaliable.send_aware_token_id,
            })
            .select(["_id"])
            .catch((ex) => {
              loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
              return res
                .status(500)
                .jsonp({ status: false, message: ex.toString() });
            });
          const selected_transaction_certificates_id =
            await selected_transaction_certificates
              .findOne({
                _awareid: select_receiver_avaliable._awareid,
                send_aware_token_id:
                  select_receiver_avaliable.send_aware_token_id,
              })
              .select(["_id"])
              .catch((ex) => {
                loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
                return res
                  .status(500)
                  .jsonp({ status: false, message: ex.toString() });
              });
          const selected_proof_of_delivery_id = await selected_proof_of_delivery
            .findOne({
              _awareid: select_receiver_avaliable._awareid,
              send_aware_token_id:
                select_receiver_avaliable.send_aware_token_id,
            })
            .select(["_id"])
            .catch((ex) => {
              loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
              return res
                .status(500)
                .jsonp({ status: false, message: ex.toString() });
            });
          const transaction_history_avaliable = await transaction_history
            .findOne({
              _awareid: select_receiver_avaliable._awareid,
              update_aware_token_id: token_details.update_aware_token_id,
            })
            .select(["_id"])
            .catch((ex) => {
              loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
              return res
                .status(400)
                .jsonp({ status: false, message: "Bad request!" });
            });

          var blockchain_Object = await update_aw_tokens
            .findOne({
              _id: mongoose.Types.ObjectId(token_details.update_aware_token_id),
            })
            .select(["blockchain_id"])
            .catch((ex) => {
              loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
              return res
                .status(400)
                .jsonp({ status: false, message: "Bad request!" });
            });

          transaction_history.create(
            {
              _awareid: select_receiver_avaliable._awareid,
              aware_token_id: token_details.aware_token_id,
              transactionIndex: "transactionIndex",
              transactionHash: "transactionHash",
              blockHash: "blockHash",
              blockNumber: "blockNumber",
              from: "from",
              to: "to",
              cumulativeGasUsed: "cumulativeGasUsed",
              gasUsed: "gasUsed",
              contractAddress: "contractAddress",
              logsBloom: "logsBloom",
              logs: [
                {
                  removed: true,
                  logIndex: 0,
                  transactionIndex: 0,
                  transactionHash: "transactionHash",
                  blockHash: "blockHash",
                  blockNumber: 0,
                  address: "address",
                  data: "data",
                  topics: [],
                  id: "id",
                },
              ],
              status: false,
            },
            async function (err, history) {
              if (err) {
                loggerhandler.logger.error(
                  `${err} ,email:${req.headers.email}`
                );
                reject();
              }

              transferred_tokens.create(
                {
                  _awareid: select_receiver_avaliable._receiver_awareid,
                  type_of_token:
                    selected_aware_token_avaliable.aware_token_type,
                  total_tokens: token_details.To_be_Send,
                  avaliable_tokens: token_details.To_be_Send,
                  historical_awareid: select_receiver_avaliable._awareid,
                  blockchain_id: blockchain_Object.blockchain_id,

                  historical_update_aware_token_id:
                    token_details.update_aware_token_id,
                  historical_selected_update_aware_token_id:
                    selected_update_aware_token_id
                      ? selected_update_aware_token_id
                      : null,
                  historical_update_physical_assets_id:
                    update_assets_avaliable_id
                      ? update_assets_avaliable_id
                      : null,
                  historical_update_tracers_id: update_tracer_id
                    ? update_tracer_id
                    : null,
                  historical_update_self_validations_id:
                    update_self_validation_id
                      ? update_self_validation_id
                      : null,
                  historical_update_company_compliances_id:
                    update_company_complians_id
                      ? update_company_complians_id
                      : null,

                  historical_send_aw_tokens_id:
                    select_receiver_avaliable.send_aware_token_id,

                  historical_selected_receivers_id: select_receiver_id
                    ? select_receiver_id
                    : null,
                  historical_selected_aware_tokens_id: selected_aware_token_id
                    ? selected_aware_token_id
                    : null,
                  historical_selected_transaction_certificates_id:
                    selected_transaction_certificates_id
                      ? selected_transaction_certificates_id
                      : null,
                  historical_selected_proof_of_deliveries_id:
                    selected_proof_of_delivery_id
                      ? selected_proof_of_delivery_id
                      : null,

                  blochchain_transaction_history_id:
                    transaction_history_avaliable
                      ? transaction_history_avaliable._id
                      : null,

                  token_base_type: "updated",
                },
                async function (err, history) {
                  if (err) {
                    loggerhandler.logger.error(
                      `${err} ,email:${req.headers.email}`
                    );
                    console.log("transferred_tokenserr", err);
                    reject();
                  }

                  await update_aw_tokens
                    .findOneAndUpdate(
                      {
                        _awareid: select_receiver_avaliable._awareid,
                        _id: mongoose.Types.ObjectId(
                          token_details.update_aware_token_id
                        ),
                      },
                      {
                        avaliable_tokens: token_details.balance,
                        used_tokens: token_details.To_be_Send,
                        locked: false,
                      },
                      { new: true }
                    )
                    .catch((ex) => {
                      console.log("ex", ex);
                      loggerhandler.logger.error(
                        `${ex} ,email:${req.headers.email}`
                      );
                      reject();
                    });

                  resolve();
                }
              );
            }
          );
        }
      } catch (error) {
        loggerhandler.logger.error(`${error} ,email:${req.headers.email}`);
        console.log("error", error);
        reject();
      }
    });
  },

  blockchainIds: function (token_details, req) {
    return new Promise(async (resolve, reject) => {
      try {
        console.log("token_details", token_details);

        if (token_details.aware_token_id) {
          var blockchain_Object = await aw_tokens
            .findOne({
              _id: mongoose.Types.ObjectId(token_details.aware_token_id),
            })
            .select(["blockchain_id"])
            .catch((ex) => {
              console.log("ex", ex);
              loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
              return res
                .status(400)
                .jsonp({ status: false, message: "Bad request!" });
            });
          // token_ids.push(blockchain_Object.blockchain_id);
          // array_of_amounts.push(token_details.To_be_Send);
          console.log("blockchain_Object1", blockchain_Object);
        } else {
          var blockchain_Object = await update_aw_tokens
            .findOne({
              _id: mongoose.Types.ObjectId(token_details.update_aware_token_id),
            })
            .select(["blockchain_id"])
            .catch((ex) => {
              console.log("ex", ex);
              loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
              return res
                .status(400)
                .jsonp({ status: false, message: "Bad request!" });
            });
          // token_ids.push(blockchain_Object.blockchain_id);
          // array_of_amounts.push(token_details.To_be_Send);
          console.log("blockchain_Object2", blockchain_Object);
        }

        resolve({
          blockchain_id: blockchain_Object.blockchain_id,
          To_be_Send: token_details.To_be_Send,
        });
      } catch (error) {
        loggerhandler.logger.error(`${error} ,email:${req.headers.email}`);
        console.log("error", error);
        reject();
      }
    });
  },

  rollBackSendTokenAndUpdateBalance: function (
    token_details,
    select_receiver_avaliable,
    selected_aware_token_avaliable
  ) {
    return new Promise(async (resolve, reject) => {
      try {
        if (token_details.aware_token_id) {
          await transaction_history
            .deleteOne({
              _awareid: select_receiver_avaliable._awareid,
              aware_token_id: token_details.aware_token_id,
            })
            .catch((ex) => {
              loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
              return res
                .status(400)
                .jsonp({ status: false, message: "Bad request!" });
            });
          await transferred_tokens
            .deleteOne({
              _awareid: select_receiver_avaliable._receiver_awareid,
              historical_aware_token_id: token_details.aware_token_id,
              historical_send_aw_tokens_id:
                select_receiver_avaliable.send_aware_token_id,
            })
            .catch((ex) => {
              loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
              return res
                .status(400)
                .jsonp({ status: false, message: "Bad request!" });
            });

          var temprarory_token_data = await aw_tokens
            .findOne({
              _awareid: select_receiver_avaliable._awareid,
              _id: mongoose.Types.ObjectId(token_details.aware_token_id),
            })
            .catch((ex) => {
              loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
              reject();
            });

          await aw_tokens
            .findOneAndUpdate(
              {
                _awareid: select_receiver_avaliable._awareid,
                _id: mongoose.Types.ObjectId(token_details.aware_token_id),
              },
              {
                avaliable_tokens:
                  Number(temprarory_token_data.avaliable_tokens) +
                  Number(token_details.balance),
                used_tokens:
                  Number(temprarory_token_data.used_tokens) -
                  Number(token_details.To_be_Send),
              },
              { new: true }
            )
            .catch((ex) => {
              loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
              reject();
            });

          resolve();
        } else {
          await transaction_history
            .deleteOne({
              _awareid: select_receiver_avaliable._awareid,
              update_aware_token_id: token_details.update_aware_token_id,
            })
            .catch((ex) => {
              loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
              return res
                .status(400)
                .jsonp({ status: false, message: "Bad request!" });
            });
          await transferred_tokens
            .deleteOne({
              _awareid: select_receiver_avaliable._receiver_awareid,
              historical_update_aware_token_id:
                token_details.update_aware_token_id,
              historical_send_aw_tokens_id:
                select_receiver_avaliable.send_aware_token_id,
            })
            .catch((ex) => {
              loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
              return res
                .status(400)
                .jsonp({ status: false, message: "Bad request!" });
            });

          var temprarory_token_data = await update_aw_tokens
            .findOne({
              _awareid: select_receiver_avaliable._awareid,
              _id: mongoose.Types.ObjectId(token_details.update_aware_token_id),
            })
            .catch((ex) => {
              loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
              reject();
            });

          await update_aw_tokens
            .findOneAndUpdate(
              {
                _awareid: select_receiver_avaliable._awareid,
                _id: mongoose.Types.ObjectId(
                  token_details.update_aware_token_id
                ),
              },
              {
                avaliable_tokens:
                  Number(temprarory_token_data.avaliable_tokens) +
                  Number(token_details.balance),
                used_tokens:
                  Number(temprarory_token_data.used_tokens) -
                  Number(token_details.To_be_Send),
              },
              { new: true }
            )
            .catch((ex) => {
              loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
              reject();
            });

          resolve();
        }
      } catch (error) {
        loggerhandler.logger.error(`${error} ,email:${req.headers.email}`);
        console.log("error", error);
        reject();
      }
    });
  },

  // updatingQR: async function (_awareid, po_id, id, req) {
  //   return new Promise(async (resolve, reject) => {
  //     try {
  //       const ID = id;
  //       // Fetch all necessary data concurrently using Promise.all
  //       const [generate_qr_exist, product_lines_exist, kyc_details_exist] = await Promise.all([
  //         generate_qr.findOne({ product_line: id, deleted: false }).select('_id'),
  //         product_lines.findOne({ _awareid: _awareid, po_id: po_id, deleted: false }),
  //         kyc_details.findOne({ aware_id: _awareid })
  //       ]).catch((ex) => {
  //         loggerhandler.logger.error(`${ex}, email:${req.headers.email}`);
  //         return res.status(500).jsonp({ status: false, message: ex.toString() });
  //       });

  //       const products_line_details = product_lines_exist.product_line.find(x => x.id == id);
  //       var jsondata = `${process.env.PASSPORT_ADDRESS}${_awareid}-${po_id}-${products_line_details.id}`;
  //       // Create a large canvas (300 DPI for high resolution printing)
  //       const canvas = createCanvas(3000, 2100);
  //       const ctx = canvas.getContext('2d');
  //       // Generate QR Code with high resolution
  //       await QRCode.toCanvas(canvas, jsondata.toLowerCase(), {
  //         errorCorrectionLevel: 'H',
  //         margin: 20,
  //         width: 6000,  // QR Code size
  //         color: {
  //           dark: '#000000',
  //           light: '#ffffff',
  //         },
  //       });
  //       // Set font size dynamically
  //       let fontSize = 225;
  //       ctx.font = `bold ${fontSize}px Arial`;
  //       const margin = 50;  // Text margin
  //       const maxWidth = canvas.width - margin * 2;
  //       // Retrieve brand name and product details
  //       let productid;
  //       for (let i = 0; i < product_lines_exist.product_line.length; i++) {
  //         if (product_lines_exist.product_line[i].id == ID) {
  //           productid = product_lines_exist.product_line[i].productid;
  //         }
  //       }
  //       const productSubBrandIdWithData = await products.findOne({ _id: mongoose.Types.ObjectId(productid) });
  //       const subrandID = productSubBrandIdWithData.sub_brand;
  //       let final_brand_name;
  //       for (let i = 0; i < kyc_details_exist.sub_brand.length; i++) {
  //         if (kyc_details_exist.sub_brand[i]._id == subrandID) {
  //           final_brand_name = kyc_details_exist.sub_brand[i].name;
  //         }
  //       }
  //       console.log("final_brand_name123", final_brand_name);
  //       // Combine text data into one string
  //       const lines = [
  //         `Brand : ${final_brand_name}`,
  //         `Order : ${products_line_details.order_number}`,
  //         `Item  : ${products_line_details.item_number}`,
  //         `Color : ${products_line_details.color}`,
  //       ];
  //       const combinedText = lines.join('\n');
  //       console.log("combineText" + '\n' + combinedText)
  //       // Function to check if text fits within the max width
  //       const fitText = (text, maxWidth) => {
  //         const width = ctx.measureText(text).width;
  //         return width <= maxWidth;
  //       };
  //       // Adjust font size until it fits within the available width
  //       while (!fitText(combinedText, maxWidth) && fontSize > 10) {
  //         fontSize -= 2;
  //         ctx.font = `bold ${fontSize}px Arial`;
  //       }
  //       // Function to wrap text if it exceeds maxWidth
  //       const wrapText = (text, maxWidth) => {
  //         const words = text.split(' ');
  //         let lines = [];
  //         let currentLine = '';
  //         words.forEach(word => {
  //           const testLine = currentLine + word + ' ';
  //           const width = ctx.measureText(testLine).width;
  //           if (width > maxWidth && currentLine !== '') {
  //             lines.push(currentLine);
  //             currentLine = word + ' ';
  //           } else {
  //             currentLine = testLine;
  //           }
  //         });
  //         if (currentLine !== '') {
  //           lines.push(currentLine);
  //         }
  //         return lines;
  //       };
  //       // Wrap text and determine its position on the canvas
  //       const wrappedLines = wrapText(combinedText, maxWidth);
  //       console.log("wrappedLines" + '\n' + wrappedLines)
  //       let yOffset = 300;  // Adjust this value based on your layout
  //       // Draw wrapped text on the canvas
  //       wrappedLines.forEach(line => {
  //         const textWidth = ctx.measureText(line).width;
  //         const xOffset = (canvas.width - textWidth) / 2;  // Center align text
  //         ctx.fillText(line, xOffset, yOffset);
  //         yOffset += fontSize + 10;  // Adjust vertical space for next line
  //       });
  //       // Draw image (e.g., 'aware.png')
  //       const img = await loadImage('aware.png');
  //       const scaleFactor = 10;
  //       const imgWidth = img.width * scaleFactor;
  //       const imgHeight = img.height * scaleFactor;
  //       console.log("img ", imgWidth, imgHeight)
  //       console.log("canvas ", canvas.width, canvas.height)
  //       ctx.drawImage(img, (canvas.width - imgWidth) / 2, (canvas.height - imgHeight) / 2, imgWidth, imgHeight);
  //       // Convert canvas to image data URL
  //       let URL = canvas.toDataURL('image/png', 1);
  //       // Update or create the QR code entry
  //       if (generate_qr_exist) {
  //         await generate_qr.findOneAndUpdate({ product_line: id }, {
  //           qr_code: URL,
  //           generated: true
  //         }).catch(async () => { reject(); });
  //       } else {
  //         await generate_qr.create({
  //           _awareid: _awareid,
  //           po_id: po_id,
  //           product_line: id,
  //           qr_code: URL,
  //           generated: true
  //         }).catch(async () => { reject(); });
  //       }
  //       resolve({ final_brand_name });
  //     } catch (error) {
  //       loggerhandler.logger.error(`${error} ,email:${req.headers.email}`);
  //       console.log("error", error);
  //       reject();
  //     }
  //   });
  // },

  updatingQR: async function (_awareid, po_id, id, req) {
    return new Promise(async (resolve, reject) => {
      try {
        const ID = id;

        // -- Step 1: Fetch Data in Parallel
        const [generate_qr_exist, product_lines_exist, kyc_details_exist] =
          await Promise.all([
            generate_qr
              .findOne({ product_line: id, deleted: false })
              .select("_id"),
            product_lines.findOne({
              _awareid: _awareid,
              po_id: po_id,
              deleted: false,
            }),
            kyc_details.findOne({ aware_id: _awareid }),
          ]);

        if (!product_lines_exist || !kyc_details_exist) {
          throw new Error("Required data not found");
        }

        const products_line_details = product_lines_exist.product_line.find(
          (x) => x.id == id
        );
        if (!products_line_details) {
          throw new Error("Product line not found");
        }

        // -- Step 2: Create the Main Canvas (600×800)
        const canvasWidth = 1000;
        const canvasHeight = 1000;
        const canvas = createCanvas(canvasWidth, canvasHeight);
        const ctx = canvas.getContext("2d");

        // Optional background fill
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        // -- Step 3: Create a Separate Canvas for the QR Code (600×600)
        const qrCanvasSize = 800;
        const qrCanvas = createCanvas(qrCanvasSize, qrCanvasSize);
        const qrCtx = qrCanvas.getContext("2d");

        // Build the QR code data string
        const jsondata = `${process.env.PASSPORT_ADDRESS}${_awareid}-${po_id}-${products_line_details.id}`;

        // Generate the QR code on the QR canvas
        await QRCode.toCanvas(qrCanvas, jsondata.toLowerCase(), {
          errorCorrectionLevel: "H",
          margin: 4,
          width: qrCanvasSize,
          color: {
            dark: "#000000",
            light: "#FFFFFF",
          },
        });

        // -- Step 4: (Optional) Draw a Logo in the Center of the QR Code
        const img = await loadImage("aware.png");
        const logoSize = 100; // Adjust as needed
        const logoX = (qrCanvasSize - logoSize) / 2;
        const logoY = (qrCanvasSize - logoSize) / 2;
        qrCtx.drawImage(img, logoX, logoY, logoSize, logoSize);

        // -- Step 5: Retrieve Product Details
        let productid;
        for (let i = 0; i < product_lines_exist.product_line.length; i++) {
          if (product_lines_exist.product_line[i].id == ID) {
            productid = product_lines_exist.product_line[i].productid;
          }
        }
        const productSubBrandIdWithData = await products.findOne({
          _id: mongoose.Types.ObjectId(productid),
        });
        const subrandID = productSubBrandIdWithData.sub_brand;

        // let final_brand_name;
        // for (let i = 0; i < kyc_details_exist.sub_brand.length; i++) {
        //   if (kyc_details_exist.sub_brand[i]._id == subrandID) {
        //     final_brand_name = kyc_details_exist.sub_brand[i].name;
        //   }
        // }
        // console.log("ID", ID);
        // console.log("productid", productid);
        // console.log("subrandID", subrandID);
        // console.log("productSubBrandIdWithData", productSubBrandIdWithData);
        // console.log("kyc_details_exist", kyc_details_exist);

        const matchingSubBrand = kyc_details_exist.sub_brand.find(
          (sub) => sub._id.toString() === subrandID.toString()
        );
        const final_brand_name = matchingSubBrand
          ? matchingSubBrand.name
          : kyc_details_exist.company_name;

        // -- Step 6: Prepare the Single Text String
        let textLine =
          `Brand : ${final_brand_name} | ` +
          `Order : ${products_line_details.order_number} | ` +
          `Item : ${products_line_details.item_number} | ` +
          `Color : ${products_line_details.color}`;

        // -- Step 7: Wrap Text if Needed
        // Start with a large font size and shrink until it fits
        let fontSize = 50; // start large
        ctx.font = `${fontSize}px Arial`;
        ctx.fillStyle = "black";

        // We'll define a helper function to wrap text by words
        function wrapText(text, maxWidth, context) {
          const words = text.split(" ");
          let lines = [];
          let currentLine = "";

          words.forEach((word) => {
            const testLine = currentLine + word + " ";
            const metrics = context.measureText(testLine);
            if (metrics.width > maxWidth && currentLine !== "") {
              // If testLine is too wide, push currentLine and reset
              lines.push(currentLine.trim());
              currentLine = word + " ";
            } else {
              currentLine = testLine;
            }
          });
          // Push any remaining text
          if (currentLine.trim()) {
            lines.push(currentLine.trim());
          }
          return lines;
        }

        // We keep shrinking the font size until *all* wrapped lines fit within the canvas width
        // i.e., none of them exceed the canvas width
        let lines = wrapText(textLine, canvasWidth - 20, ctx); // 20px margin
        while (
          lines.some(
            (line) => ctx.measureText(line).width > canvasWidth - 20
          ) &&
          fontSize > 10
        ) {
          fontSize -= 2;
          ctx.font = `${fontSize}px Arial`;
          lines = wrapText(textLine, canvasWidth - 20, ctx);
        }

        // -- Step 8: Draw the Wrapped Lines near the Top
        let y = 80; // first line's Y position
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          const lineWidth = ctx.measureText(line).width;
          const x = (canvasWidth - lineWidth) / 2; // center
          ctx.fillText(line, x, y);
          y += fontSize + 10; // move down for next line
        }

        // -- Step 9: Draw the QR code onto the main canvas
        const qrY = 200;
        const qrX = 100;
        ctx.drawImage(qrCanvas, qrX, qrY);

        // -- Step 10: Convert the Final Canvas to a Data URL
        const URL = canvas.toDataURL("image/png", 1);

        // -- Step 11: Update or Create the QR Record in DB
        if (generate_qr_exist) {
          await generate_qr.findOneAndUpdate(
            { product_line: id },
            { qr_code: URL, generated: true }
          );
        } else {
          await generate_qr.create({
            _awareid: _awareid,
            po_id: po_id,
            product_line: id,
            qr_code: URL,
            generated: true,
          });
        }

        resolve({ final_brand_name });
      } catch (error) {
        loggerhandler.logger.error(`${error}, email:${req.headers.email}`);
        console.error("error", error);
        reject(error);
      }
    });
  },

  newQRCodeUpdating: async function (_awareid, body_data) {
    try {
      const product_ID = mongoose.Types.ObjectId(body_data.product_id);
      const multiple_pos_with_line_details = await product_lines.find({
        "product_line.productid": product_ID,
        deleted: false,
      });
      const qr_codes_updation_required = multiple_pos_with_line_details.map(
        (pos) => {
          const matchedProduct = pos.product_line.find(
            (o) => o.productid == product_ID
          );
          if (matchedProduct) {
            return {
              id: matchedProduct.id,
              po_id: pos.po_id,
              item_number: matchedProduct.item_number,
              order_number: matchedProduct.order_number,
              color: matchedProduct.color,
            }; // Extract id and po_id
          }
          return null; // Handle cases where no match is found
        }
      );
      var kyc_details_data = await kyc_details.findOne({ aware_id: _awareid });
      let final_brand_name =
        kyc_details_data.sub_brand.find((o) => o._id == body_data.sub_brand)
          ?.name || kyc_details_data.company_name;
      const promises = qr_codes_updation_required.map(async (obj) => {
        var jsondata = `${process.env.PASSPORT_ADDRESS}${_awareid}-${obj.po_id}-${obj.id}`;
        //  Create a large canvas (300 DPI for high resolution printing)
        const canvas = createCanvas(300, 300);
        const ctx = canvas.getContext("2d");
        // Generate QR Code with high resolution
        await QRCode.toCanvas(canvas, jsondata.toLowerCase(), {
          errorCorrectionLevel: "H",
          margin: 20,
          width: 6000, // QR Code size
          color: {
            dark: "#000000",
            light: "#ffffff",
          },
        });
        // Set font size dynamically
        let fontSize = 150;
        ctx.font = `${fontSize}px Prestige Elite Std`;
        const margin = 50; // Text margin
        const maxWidth = canvas.width - margin * 2;
        // Combine text data into one string
        const lines = [
          `Brand : ${final_brand_name}`,
          `Order : ${obj.order_number}`,
          `Item   : ${obj.item_number}`,
          `Color  : ${obj.color}`,
        ];
        const combinedText = lines.join("  |  ");
        // Function to check if text fits within the max width
        const fitText = (text, maxWidth) => {
          const width = ctx.measureText(text).width;
          return width <= maxWidth;
        };
        // Adjust font size until it fits within the available width
        while (!fitText(combinedText, maxWidth) && fontSize > 10) {
          fontSize -= 2;
          ctx.font = `${fontSize}px Prestige Elite Std`;
        }
        // Function to wrap text if it exceeds maxWidth
        const wrapText = (text, maxWidth) => {
          const words = text.split(" ");
          let lines = [];
          let currentLine = "";
          words.forEach((word) => {
            const testLine = currentLine + word + " ";
            const width = ctx.measureText(testLine).width;
            if (width > maxWidth && currentLine !== "") {
              lines.push(currentLine);
              currentLine = word + " ";
            } else {
              currentLine = testLine;
            }
          });
          if (currentLine !== "") {
            lines.push(currentLine);
          }
          return lines;
        };
        // Wrap text and determine its position on the canvas
        const wrappedLines = wrapText(combinedText, maxWidth);
        let yOffset = 600; // Adjust this value based on your layout
        // Draw wrapped text on the canvas
        wrappedLines.forEach((line) => {
          const textWidth = ctx.measureText(line).width;
          const xOffset = (canvas.width - textWidth) / 2; // Center align text
          ctx.fillText(line, xOffset, yOffset);
          yOffset += fontSize + 10; // Adjust vertical space for next line
        });
        // Draw image (e.g., 'aware.png')
        const img = await loadImage("aware.png");
        const scaleFactor = 10;
        const imgWidth = img.width * scaleFactor;
        const imgHeight = img.height * scaleFactor;
        ctx.drawImage(
          img,
          (canvas.width - imgWidth) / 2,
          (canvas.height - imgHeight) / 2,
          imgWidth,
          imgHeight
        );
        // Convert canvas to image data URL
        let URL = canvas.toDataURL("image/png", 1);
        // Update or create the QR code entry
        await qr_codes.findOneAndUpdate(
          { product_line: obj.id },
          { qr_code: URL }, // Update operation
          { new: true } // Return the updated document
        );
      });
      const results = await Promise.all(promises);
      const email_address = await account_details
        .findOne({ kyc_id: kyc_details_data._id.toString() })
        .select("email");
      const item_numbers = qr_codes_updation_required[0].item_number;
      sgMail.sendQRUpdationMail(email_address, item_numbers, final_brand_name);
    } catch (error) {
      console.error("Error updating QR codes:", error);
      // throw error;
    }
  },

  updating_hard_goods_QR: async function (_awareid, id, req, res) {
    let responseSent = false; // Flag to track if a response has been sent

    try {
      // Fetch hard goods data from the database
      const hard_goods_product = await hardGoodsBrands.findOne({
        _id: mongoose.Types.ObjectId(id),
      });

      console.log("hard_goods_product", hard_goods_product);

      if (!hard_goods_product) {
        console.log("No data found");
        // If hard goods product is not found, send a response and return early
        if (!responseSent) {
          responseSent = true;
          return res
            .status(404)
            .json({ status: false, message: "Hard Goods Product not found" });
        }
      }
      // Creating JSON data for the QR code
      const jsondata = `${process.env.HARD_GOODS_PASSPORT_ADDRESS}${_awareid}-${id}`;

      // Create a canvas to generate the QR code
      const canvas = createCanvas(300, 300);
      await QRCode.toCanvas(canvas, jsondata.toLowerCase(), {
        errorCorrectionLevel: "H",
        margin: 20, // Larger margin for better scanning
        width: 6000, // QR code width (scale as needed for your desired size)
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
      });

      const ctx = canvas.getContext("2d");

      // Set a starting font size and line height for text
      let fontSize = 150; // Initial font size
      ctx.font = `${fontSize}px Prestige Elite Std`;

      // Function to check if text fits within the canvas
      const fitText = (text, maxWidth) => {
        let width = ctx.measureText(text).width;
        return width <= maxWidth;
      };

      const margin = 20; // Starting margin for text placement
      const maxWidth = canvas.width - margin * 2; // Max width available for text

      // Combine all text into one string to fit in a single line
      const lines = [
        `Brand Name : ${hard_goods_product.sub_brand}`,
        `Item   : ${hard_goods_product.item_number}`,
        `Color  : ${hard_goods_product.color}`,
      ];

      const combinedText = lines.join("  |  "); // Adding a separator between them

      // Adjust font size to fit the combined text
      while (!fitText(combinedText, maxWidth) && fontSize > 10) {
        fontSize -= 2; // Decrease font size
        ctx.font = `${fontSize}px Prestige Elite Std`; // Update font size
      }

      // Function to wrap text into multiple lines if needed
      const wrapText = (text, maxWidth) => {
        const words = text.split(" ");
        let lines = [];
        let currentLine = "";

        words.forEach((word) => {
          const testLine = currentLine + word + " ";
          const width = ctx.measureText(testLine).width;

          if (width > maxWidth && currentLine !== "") {
            lines.push(currentLine);
            currentLine = word + " ";
          } else {
            currentLine = testLine;
          }
        });

        if (currentLine !== "") {
          lines.push(currentLine);
        }

        return lines;
      };

      // Break text into multiple lines if it exceeds the available width
      const wrappedLines = wrapText(combinedText, maxWidth);

      // Calculate the initial yOffset for text placement
      let yOffset = 300; // Start text placement from top, leaving space for the QR code

      // Draw each line of text
      wrappedLines.forEach((line) => {
        const textWidth = ctx.measureText(line).width;
        const xOffset = (canvas.width - textWidth) / 2; // Center-align text
        ctx.fillText(line, xOffset, yOffset);
        yOffset += fontSize + 10; // Move down for next line
      });

      // Add the logo image (assuming the image exists in the specified path)
      const img = await loadImage("aware.png");

      // Increase the size of the image (scale factor)
      const scaleFactor = 10; // Increase by 50% (adjust as needed)
      const imgWidth = img.width * scaleFactor;
      const imgHeight = img.height * scaleFactor;

      // Draw the image at the center of the canvas
      ctx.drawImage(
        img,
        (canvas.width - imgWidth) / 2,
        (canvas.height - imgHeight) / 2,
        imgWidth,
        imgHeight
      );

      let URL = canvas.toDataURL("image/png", 1);

      // Log the converted URL (for debugging)

      // Check if the QR already exists for this hard goods product
      const generated_hardgoods_qr_exist = await generate_hard_good_qr.findOne({
        hard_goods_id: id,
      });

      if (generated_hardgoods_qr_exist) {
        // If the QR already exists, update it
        await generate_hard_good_qr.findOneAndUpdate(
          { hard_goods_id: id },
          { hard_good_qr: URL, generated: true },
          { new: true }
        );
      } else {
        // If QR does not exist, create a new one
        await generate_hard_good_qr.create({
          _awareid: _awareid,
          hard_goods_id: id,
          hard_good_qr: URL,
          generated: true,
        });
      }

      // Ensure the response is sent only once, after all tasks are done
    } catch (error) {
      // Catch any errors that occur during the process
      loggerhandler.logger.error(`${error}, email:${req.headers.email}`);
      console.log("error", error);

      // Ensure response is sent only once, even in error cases
      if (!responseSent) {
        responseSent = true;
        return res
          .status(500)
          .json({ status: false, message: error.toString() });
      }
    }
  },

  //   updating_importData_hard_goods_QR: async function (_awareid, id, req, res) {
  //     let responseSent = false; // Flag to track if a response has been sent

  //     try {
  //       // Fetch hard goods data from the database
  //       const hard_goods_product = await hardGoodsBrands.findOne({ _id: mongoose.Types.ObjectId(id) });

  //       console.log("hard_goods_product",hard_goods_product);

  //       if (!hard_goods_product) {
  //         console.log("No data found");
  //         // If hard goods product is not found, send a response and return early
  //         if (!responseSent) {
  //           responseSent = true;
  //           return res.status(404).json({ status: false, message: "Hard Goods Product not found" });
  //         }
  //       }
  //       // Creating JSON data for the QR code
  //       const jsondata = `${process.env.HARD_GOODS_PASSPORT_ADDRESS}${_awareid}-${id}`;

  //       // Create a canvas to generate the QR code
  //       const canvas = createCanvas(300, 300);
  //       await QRCode.toCanvas(canvas, jsondata.toLowerCase(), {
  //         errorCorrectionLevel: 'H',
  //         margin: 20, // Larger margin for better scanning
  //         width: 6000, // QR code width (scale as needed for your desired size)
  //         color: {
  //           dark: '#000000',
  //           light: '#ffffff',
  //         },
  //       });

  //       const ctx = canvas.getContext('2d');

  //       // Set a starting font size and line height for text
  //       let fontSize = 150; // Initial font size
  //       ctx.font = `${fontSize}px Prestige Elite Std`;

  //       // Function to check if text fits within the canvas
  //       const fitText = (text, maxWidth) => {
  //         let width = ctx.measureText(text).width;
  //         return width <= maxWidth;
  //       };

  //       const margin = 20; // Starting margin for text placement
  //       const maxWidth = canvas.width - margin * 2; // Max width available for text

  //       // Combine all text into one string to fit in a single line
  //       const lines = [
  //         `Brand Name : ${hard_goods_product.sub_brand}`,
  //         `Item   : ${hard_goods_product.item_number}`,
  //         `Color  : ${hard_goods_product.color}`
  //       ];

  //       console.log({lines});

  //       const combinedText = lines.join('  |  ');  // Adding a separator between them

  //       // Adjust font size to fit the combined text
  //       while (!fitText(combinedText, maxWidth) && fontSize > 10) {
  //         fontSize -= 2; // Decrease font size
  //         ctx.font = `${fontSize}px Prestige Elite Std`; // Update font size
  //       }
  // console.log("working_101");
  //       // Function to wrap text into multiple lines if needed
  //       const wrapText = (text, maxWidth) => {
  //         const words = text.split(' ');
  //         let lines = [];
  //         let currentLine = '';

  //         words.forEach(word => {
  //           const testLine = currentLine + word + ' ';
  //           const width = ctx.measureText(testLine).width;

  //           if (width > maxWidth && currentLine !== '') {
  //             lines.push(currentLine);
  //             currentLine = word + ' ';
  //           } else {
  //             currentLine = testLine;
  //           }
  //         });

  //         if (currentLine !== '') {
  //           lines.push(currentLine);
  //         }

  //         return lines;
  //       };
  // console.log("shivam_202");
  //       // Break text into multiple lines if it exceeds the available width
  //       const wrappedLines = wrapText(combinedText, maxWidth);

  //       // Calculate the initial yOffset for text placement
  //       let yOffset = 300; // Start text placement from top, leaving space for the QR code

  //       // Draw each line of text
  //       wrappedLines.forEach(line => {
  //         const textWidth = ctx.measureText(line).width;
  //         const xOffset = (canvas.width - textWidth) / 2; // Center-align text
  //         ctx.fillText(line, xOffset, yOffset);
  //         yOffset += fontSize + 10;  // Move down for next line
  //       });

  //       // Add the logo image (assuming the image exists in the specified path)
  //       const img = await loadImage('aware.png');
  //       console.log("shivam_203");
  //       // Increase the size of the image (scale factor)
  //       const scaleFactor = 10; // Increase by 50% (adjust as needed)
  //       const imgWidth = img.width * scaleFactor;
  //       const imgHeight = img.height * scaleFactor;

  //       // Draw the image at the center of the canvas
  //       ctx.drawImage(img, (canvas.width - imgWidth) / 2, (canvas.height - imgHeight) / 2, imgWidth, imgHeight);

  //       let URL = canvas.toDataURL('image/png', 1);
  //       console.log("shivam_204");
  //         await generate_hard_good_qr.create({
  //           _awareid: _awareid,
  //           hard_goods_id: id,
  //           hard_good_qr: URL,
  //           generated: true
  //         });
  //         console.log("shivam_205");

  //       // Ensure the response is sent only once, after all tasks are done

  //     } catch (error) {
  //       // Catch any errors that occur during the process
  //       loggerhandler.logger.error(`${error}, email:${req.headers.email}`);
  //       console.log("error", error);

  //       // Ensure response is sent only once, even in error cases
  //       if (!responseSent) {
  //         responseSent = true;
  //         return res.status(500).json({ status: false, message: error.toString() });
  //       }
  //     }
  //   },

  // updating_importData_hard_goods_QR: async function (_awareid, id, req, res) {
  //   try {
  //     const hard_goods_product = await hardGoodsBrands.findOne({ _id: mongoose.Types.ObjectId(id) });
  //     console.log("hard_goods_product03", hard_goods_product);

  //     if (!hard_goods_product) {
  //       return null; // Return null if no product found
  //     }

  //     console.log("shivam_working")
  //     // Create JSON data for the QR code
  //     const jsondata = `${process.env.HARD_GOODS_PASSPORT_ADDRESS}${_awareid}-${id}`;
  //     console.log("shivam_116");
  //     // Create the QR code
  //     const canvas = createCanvas(300, 300);
  //     await QRCode.toCanvas(canvas, jsondata.toLowerCase(), {
  //       errorCorrectionLevel: 'H',
  //       margin: 20,
  //       width: 6000,
  //       color: {
  //         dark: '#000000',
  //         light: '#ffffff',
  //       },
  //     });
  //     console.log("shivam_115");
  //     const ctx = canvas.getContext('2d');
  //     let fontSize = 150;
  //     ctx.font = `${fontSize}px Prestige Elite Std`;

  //     const margin = 20;
  //     const maxWidth = canvas.width - margin * 2;
  //     console.log("shivam_114");
  //     const lines = [
  //       `Brand Name : ${hard_goods_product.sub_brand}`,
  //       `Item   : ${hard_goods_product.item_number}`,
  //       `Color  : ${hard_goods_product.color}`
  //     ];
  // console.log("lines_lines",lines);
  //     const combinedText = lines.join('  |  ');

  //     // Adjust text to fit within the canvas
  //     while (ctx.measureText(combinedText).width > maxWidth && fontSize > 10) {
  //       fontSize -= 2;
  //       ctx.font = `${fontSize}px Prestige Elite Std`;
  //     }
  //     console.log("shivam_113");
  //     const wrapText = (text, maxWidth) => {
  //       const words = text.split(' ');
  //       let lines = [];
  //       let currentLine = '';

  //       words.forEach(word => {
  //         const testLine = currentLine + word + ' ';
  //         const width = ctx.measureText(testLine).width;

  //         if (width > maxWidth && currentLine !== '') {
  //           lines.push(currentLine);
  //           currentLine = word + ' ';
  //         } else {
  //           currentLine = testLine;
  //         }
  //       });

  //       if (currentLine !== '') {
  //         lines.push(currentLine);
  //       }

  //       return lines;
  //     };
  //     console.log("shivam_112" , lines);
  //     const wrappedLines = wrapText(combinedText, maxWidth);
  //     let yOffset = 300;
  //     console.log("shivam_111");
  //     wrappedLines.forEach(line => {
  //       const textWidth = ctx.measureText(line).width;
  //       const xOffset = (canvas.width - textWidth) / 2;
  //       ctx.fillText(line, xOffset, yOffset);
  //       yOffset += fontSize + 10;
  //     });

  //     const img = await loadImage('aware.png');
  //     const scaleFactor = 10;
  //     const imgWidth = img.width * scaleFactor;
  //     const imgHeight = img.height * scaleFactor;

  //     ctx.drawImage(img, (canvas.width - imgWidth) / 2, (canvas.height - imgHeight) / 2, imgWidth, imgHeight);
  // console.log("shivam_109");
  //     let URL = canvas.toDataURL('image/png', 1);
  //     const generated_qr_data = await generate_hard_good_qr.create({
  //       _awareid: _awareid,
  //       hard_goods_id: id,
  //       hard_good_qr: URL,
  //       generated: true
  //     });
  //     console.log("shivam_1101");
  //     // Return the QR code URL to be used in the main function
  //     return generated_qr_data;

  //   } catch (error) {
  //     loggerhandler.logger.error(`${error}, email:${req.headers.email}`);
  //     console.log("error", error);
  //     return null; // Return null in case of error
  //   }
  // },

  //need to uncomment later, if not working =
  // updating_importData_hard_goods_QR: async function (_awareid, id, req, res) {
  //   try {
  //     const hard_goods_product = await hardGoodsBrands.findOne({ _id: mongoose.Types.ObjectId(id) });
  //     // console.log("hard_goods_product03", hard_goods_product);

  //     if (!hard_goods_product) {
  //       return null; // Return null if no product found
  //     }

  //     // Create JSON data for the QR code
  //     const jsondata = `${process.env.HARD_GOODS_PASSPORT_ADDRESS}${_awareid}-${id}`;

  //     // Create the QR code
  //     const canvas = createCanvas(300, 300);
  //     await QRCode.toCanvas(canvas, jsondata.toLowerCase(), {
  //       errorCorrectionLevel: 'H',
  //       margin: 20,
  //       width: 6000,
  //       color: {
  //         dark: '#000000',
  //         light: '#ffffff',
  //       },
  //     });

  //     const ctx = canvas.getContext('2d');
  //     let fontSize = 150;
  //     ctx.font = `${fontSize}px Prestige Elite Std`;

  //     const margin = 20;
  //     const maxWidth = canvas.width - margin * 2;
  //     const lines = [
  //       `Brand Name : ${hard_goods_product.sub_brand}`,
  //       `Item   : ${hard_goods_product.item_number}`,
  //       `Color  : ${hard_goods_product.color}`
  //     ];
  //     const combinedText = lines.join('  |  ');

  //     // Adjust text to fit within the canvas
  //     while (ctx.measureText(combinedText).width > maxWidth && fontSize > 10) {
  //       fontSize -= 2;
  //       ctx.font = `${fontSize}px Prestige Elite Std`;
  //     }

  //     const wrapText = (text, maxWidth) => {
  //       const words = text.split(' ');
  //       let lines = [];
  //       let currentLine = '';

  //       words.forEach(word => {
  //         const testLine = currentLine + word + ' ';
  //         const width = ctx.measureText(testLine).width;

  //         if (width > maxWidth && currentLine !== '') {
  //           lines.push(currentLine);
  //           currentLine = word + ' ';
  //         } else {
  //           currentLine = testLine;
  //         }
  //       });

  //       if (currentLine !== '') {
  //         lines.push(currentLine);
  //       }

  //       return lines;
  //     };
  //     const wrappedLines = wrapText(combinedText, maxWidth);
  //     let yOffset = 300;
  //     wrappedLines.forEach(line => {
  //       const textWidth = ctx.measureText(line).width;
  //       const xOffset = (canvas.width - textWidth) / 2;
  //       ctx.fillText(line, xOffset, yOffset);
  //       yOffset += fontSize + 10;
  //     });

  //     const img = await loadImage('aware.png');
  //     const scaleFactor = 10;
  //     const imgWidth = img.width * scaleFactor;
  //     const imgHeight = img.height * scaleFactor;

  //     ctx.drawImage(img, (canvas.width - imgWidth) / 2, (canvas.height - imgHeight) / 2, imgWidth, imgHeight);

  //     let URL = canvas.toDataURL('image/png', 1);
  //     const generated_qr_data = await generate_hard_good_qr.create({
  //       _awareid: _awareid,
  //       hard_goods_id: id,
  //       hard_good_qr: URL,
  //       generated: true
  //     });

  //     // Return the QR code data object with the generated URL
  //     return generated_qr_data;

  //   } catch (error) {
  //     console.log("error", error);
  //     return null; // Return null in case of error
  //   }
  // },

  updating_importData_hard_goods_QR: async function (_awareid, id, req, res) {
    try {
      const hard_goods_product = await hardGoodsBrands.findOne({
        _id: mongoose.Types.ObjectId(id),
      });
      if (!hard_goods_product) {
        return null;
      }

      const jsondata = `${process.env.HARD_GOODS_PASSPORT_ADDRESS}${_awareid}-${id}`;

      const canvas = createCanvas(300, 300);
      await QRCode.toCanvas(canvas, jsondata.toLowerCase(), {
        errorCorrectionLevel: "H",
        margin: 20,
        width: 6000,
        color: { dark: "#000000", light: "#ffffff" },
      });

      const ctx = canvas.getContext("2d");
      let fontSize = 150;
      ctx.font = `${fontSize}px Prestige Elite Std`;

      const margin = 20;
      const maxWidth = canvas.width - margin * 2;
      const lines = [
        `Brand Name : ${hard_goods_product.sub_brand}`,
        `Item   : ${hard_goods_product.item_number}`,
        `Color  : ${hard_goods_product.color}`,
      ];
      const combinedText = lines.join("  |  ");

      while (ctx.measureText(combinedText).width > maxWidth && fontSize > 10) {
        fontSize -= 2;
        ctx.font = `${fontSize}px Prestige Elite Std`;
      }

      const wrapText = (text, maxWidth) => {
        const words = text.split(" ");
        let lines = [];
        let currentLine = "";

        words.forEach((word) => {
          const testLine = currentLine + word + " ";
          const width = ctx.measureText(testLine).width;

          if (width > maxWidth && currentLine !== "") {
            lines.push(currentLine);
            currentLine = word + " ";
          } else {
            currentLine = testLine;
          }
        });

        if (currentLine !== "") {
          lines.push(currentLine);
        }

        return lines;
      };
      const wrappedLines = wrapText(combinedText, maxWidth);
      let yOffset = 300;
      wrappedLines.forEach((line) => {
        const textWidth = ctx.measureText(line).width;
        const xOffset = (canvas.width - textWidth) / 2;
        ctx.fillText(line, xOffset, yOffset);
        yOffset += fontSize + 10;
      });

      const img = await loadImage("aware.png");
      const scaleFactor = 10;
      const imgWidth = img.width * scaleFactor;
      const imgHeight = img.height * scaleFactor;

      ctx.drawImage(
        img,
        (canvas.width - imgWidth) / 2,
        (canvas.height - imgHeight) / 2,
        imgWidth,
        imgHeight
      );

      const URL = canvas.toDataURL("image/png", 1);
      const generated_qr_data = await generate_hard_good_qr.create({
        _awareid: _awareid,
        hard_goods_id: id,
        hard_good_qr: URL,
        generated: true,
      });

      let temp_generated_qr_data = generated_qr_data;

      // // Assuming `hard_goods_product` is an available object with the required fields
      // temp_generated_qr_data.brand_name = hard_goods_product.sub_brand;
      // temp_generated_qr_data.item = hard_goods_product.item_number;
      // temp_generated_qr_data.color = hard_goods_product.color;
      // console.log("temp_generated_qr_data", temp_generated_qr_data)

      const updated_Data = {
        ...generated_qr_data,
        sub_brand: hard_goods_product.sub_brand,
        item_number: hard_goods_product.item_number,
        color: hard_goods_product.color,
      };

      console.log("updated_Data", updated_Data);
      // const updated_Data2 = {
      //   // ...generated_qr_data,
      //   sub_brand: hard_goods_product.sub_brand,
      //   item_number: hard_goods_product.item_number,
      //   color: hard_goods_product.color,
      //   _awareid: generated_qr_data._doc._awareid,
      //   hard_goods_id: generated_qr_data._doc.hard_goods_id,
      //   hard_good_qr: generated_qr_data._doc.hard_good_qr,
      //   generated: generated_qr_data._doc.generated,
      //   deleted:generated_qr_data._doc.deleted,
      //   _id: generated_qr_data._doc._id,
      //   created_date: generated_qr_data._doc.created_date,
      //   modified_on: generated_qr_data._doc.modified_on,
      // }
      // console.log("updated_Data2",updated_Data2)

      const updated_Data2 = {
        ...Object.assign({}, generated_qr_data._doc), // Dynamically copy properties from _doc
        sub_brand: hard_goods_product.sub_brand, // Add properties from hard_goods_product
        item_number: hard_goods_product.item_number,
        color: hard_goods_product.color,
      };

      console.log("updated_Data2", updated_Data2);
      return updated_Data2;
    } catch (error) {
      console.log("error", error);
      return null;
    }
  },

  unlockedTheLockedTokens: function (aware_asset, req) {
    return new Promise(async (resolve, reject) => {
      try {
        var transferred_tokens_avaliable = await transferred_tokens
          .findOne({ _id: mongoose.Types.ObjectId(aware_asset.tt_id) })
          .catch((ex) => {
            loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
            return res
              .status(400)
              .jsonp({ status: false, message: "Bad request!" });
          });

        // console.log("transferred_tokens_avaliable", transferred_tokens_avaliable)
        var balance =
          transferred_tokens_avaliable.avaliable_tokens -
          Number(aware_asset.Used_token) -
          Number(aware_asset.Waste_token);

        // console.log("balance", balance)

        await transferred_tokens
          .findOneAndUpdate(
            { _id: mongoose.Types.ObjectId(aware_asset.tt_id) },
            {
              avaliable_tokens: balance,
              used_tokens:
                Number(aware_asset.Used_token) +
                Number(aware_asset.Waste_token),
              locked: false,
            },
            { new: true }
          )
          .catch((ex) => {
            loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
            reject();
          });

        resolve();
      } catch (error) {
        loggerhandler.logger.error(`${error} ,email:${req.headers.email}`);
        reject();
      }
    });
  },

  unlockedWTheLockedTokensWithoutChangingBalance: function (aware_asset) {
    return new Promise(async (resolve, reject) => {
      try {
        var transferred_tokens_avaliable = await transferred_tokens
          .findOne({ _id: mongoose.Types.ObjectId(aware_asset.tt_id) })
          .catch((ex) => {
            loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
            return res
              .status(400)
              .jsonp({ status: false, message: "Bad request!" });
          });

        // console.log("transferred_tokens_avaliable", transferred_tokens_avaliable)
        var balance =
          transferred_tokens_avaliable.avaliable_tokens -
          Number(aware_asset.Used_token) -
          Number(aware_asset.Waste_token);

        console.log("balance", balance);

        await transferred_tokens
          .findOneAndUpdate(
            { _id: mongoose.Types.ObjectId(aware_asset.tt_id) },
            {
              // avaliable_tokens: balance,
              // used_tokens: Number(aware_asset.Used_token) + Number(aware_asset.Waste_token),
              locked: false,
            },
            { new: true }
          )
          .catch((ex) => {
            loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
            reject();
          });

        resolve();
      } catch (error) {
        loggerhandler.logger.error(`${error} ,email:${req.headers.email}`);
        reject();
      }
    });
  },

  unlockedWTheLockedTokensAndAddingBalance: function (aware_asset, req) {
    return new Promise(async (resolve, reject) => {
      try {
        var transferred_tokens_avaliable = await transferred_tokens
          .findOne({ _id: mongoose.Types.ObjectId(aware_asset.tt_id) })
          .catch((ex) => {
            loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
            return res
              .status(400)
              .jsonp({ status: false, message: "Bad request!" });
          });

        // console.log("transferred_tokens_avaliable", transferred_tokens_avaliable)
        var balance =
          transferred_tokens_avaliable.avaliable_tokens +
          Number(aware_asset.Used_token) +
          Number(aware_asset.Waste_token);

        // console.log("balance", balance)

        await transferred_tokens
          .findOneAndUpdate(
            { _id: mongoose.Types.ObjectId(aware_asset.tt_id) },
            {
              avaliable_tokens: balance,
              used_tokens: transferred_tokens_avaliable.total_tokens - balance,
              //  Number(aware_asset.Used_token) - Number(aware_asset.Waste_token),
              locked: true,
            },
            { new: true }
          )
          .catch((ex) => {
            loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
            reject();
          });

        resolve();
      } catch (error) {
        loggerhandler.logger.error(`${error} ,email:${req.headers.email}`);
        reject();
      }
    });
  },

  //we need to check this one
  burnToken: function (
    from0xaddress,
    amountInUint,
    tokenID,
    nonce,
    connectWeb3
  ) {
    return new Promise(async (resolve, reject) => {
      try {
        // console.log("BOOM ->", from0xaddress, amountInUint, tokenID)

        // var result = await request(process.env.SUBGRAPH_URL, query)

        const query2 = gql`{awareToken(id:"${tokenID.toString()}") {id,owner {id},creator {id},contentURI,metadataURI,amount,createdAtTimestamp}}`;
        var token = await request(process.env.SUBGRAPH_URL, query2);

        console.log("token", token);

        // const metadata = await axios.get(token.awareToken.metadataURI);

        // console.log('metadata',metadata)

        // connectWeb3 = await new Web3(new Web3.providers.HttpProvider(process.env.BABEL_ENDPOINT));

        // await connectWeb3.eth.net.isListening();
        connectWeb3.eth
          .getBalance(from0xaddress)
          .then(async function (balance) {
            let iotxBalance = Big(balance).div(10 ** 18);

            console.log("iotxBalance", iotxBalance.toFixed(18));

            if (iotxBalance.toFixed(18) > 0) {
              var wallet_of_sender = await wallets
                .findOne({ wallet_address_0x: from0xaddress })
                .select(["wallet_address_0x", "from", "to"])
                .catch((ex) => {
                  loggerhandler.logger.error(
                    `${ex} ,email:${req.headers.email}`
                  );
                  return res
                    .status(400)
                    .jsonp({ status: false, message: "Bad request!" });
                });
              var key = wallet_of_sender.from + wallet_of_sender.to;
              var decrypted_private_key = helperfunctions.encryptAddress(
                key,
                "decrypt"
              );
              var privatekey = "";
              for (var i = 3; i < decrypted_private_key.length - 1; i++) {
                privatekey = privatekey + decrypted_private_key[i];
              }

              // var non3 = await connectWeb3.eth.getTransactionCount(from0xaddress);

              // // console.log("non3", non3)

              // if (nonce3 == non3) {
              //   nonce3 = nonce3 + 1;
              // }
              // else {
              //   nonce3 = non3;
              // }

              // console.log("nonce3", nonce3)

              // var abiArray = [
              //   {
              //     "inputs": [],
              //     "stateMutability": "nonpayable",
              //     "type": "constructor"
              //   },
              //   {
              //     "anonymous": false,
              //     "inputs": [
              //       {
              //         "indexed": true,
              //         "internalType": "address",
              //         "name": "account",
              //         "type": "address"
              //       },
              //       {
              //         "indexed": true,
              //         "internalType": "address",
              //         "name": "operator",
              //         "type": "address"
              //       },
              //       {
              //         "indexed": false,
              //         "internalType": "bool",
              //         "name": "approved",
              //         "type": "bool"
              //       }
              //     ],
              //     "name": "ApprovalForAll",
              //     "type": "event"
              //   },
              //   {
              //     "anonymous": false,
              //     "inputs": [
              //       {
              //         "indexed": true,
              //         "internalType": "uint256",
              //         "name": "_tokenId",
              //         "type": "uint256"
              //       },
              //       {
              //         "indexed": false,
              //         "internalType": "address",
              //         "name": "owner",
              //         "type": "address"
              //       },
              //       {
              //         "indexed": false,
              //         "internalType": "string",
              //         "name": "_uri",
              //         "type": "string"
              //       }
              //     ],
              //     "name": "TokenMetadataURIUpdated",
              //     "type": "event"
              //   },
              //   {
              //     "anonymous": false,
              //     "inputs": [
              //       {
              //         "indexed": true,
              //         "internalType": "uint256",
              //         "name": "_tokenId",
              //         "type": "uint256"
              //       },
              //       {
              //         "indexed": false,
              //         "internalType": "address",
              //         "name": "owner",
              //         "type": "address"
              //       },
              //       {
              //         "indexed": false,
              //         "internalType": "string",
              //         "name": "_uri",
              //         "type": "string"
              //       }
              //     ],
              //     "name": "TokenURIUpdated",
              //     "type": "event"
              //   },
              //   {
              //     "anonymous": false,
              //     "inputs": [
              //       {
              //         "indexed": true,
              //         "internalType": "address",
              //         "name": "operator",
              //         "type": "address"
              //       },
              //       {
              //         "indexed": true,
              //         "internalType": "address",
              //         "name": "from",
              //         "type": "address"
              //       },
              //       {
              //         "indexed": true,
              //         "internalType": "address",
              //         "name": "to",
              //         "type": "address"
              //       },
              //       {
              //         "indexed": false,
              //         "internalType": "uint256[]",
              //         "name": "ids",
              //         "type": "uint256[]"
              //       },
              //       {
              //         "indexed": false,
              //         "internalType": "uint256[]",
              //         "name": "values",
              //         "type": "uint256[]"
              //       }
              //     ],
              //     "name": "TransferBatch",
              //     "type": "event"
              //   },
              //   {
              //     "anonymous": false,
              //     "inputs": [
              //       {
              //         "indexed": true,
              //         "internalType": "address",
              //         "name": "operator",
              //         "type": "address"
              //       },
              //       {
              //         "indexed": true,
              //         "internalType": "address",
              //         "name": "from",
              //         "type": "address"
              //       },
              //       {
              //         "indexed": true,
              //         "internalType": "address",
              //         "name": "to",
              //         "type": "address"
              //       },
              //       {
              //         "indexed": false,
              //         "internalType": "uint256",
              //         "name": "id",
              //         "type": "uint256"
              //       },
              //       {
              //         "indexed": false,
              //         "internalType": "uint256",
              //         "name": "value",
              //         "type": "uint256"
              //       }
              //     ],
              //     "name": "TransferSingle",
              //     "type": "event"
              //   },
              //   {
              //     "anonymous": false,
              //     "inputs": [
              //       {
              //         "indexed": false,
              //         "internalType": "string",
              //         "name": "value",
              //         "type": "string"
              //       },
              //       {
              //         "indexed": true,
              //         "internalType": "uint256",
              //         "name": "id",
              //         "type": "uint256"
              //       }
              //     ],
              //     "name": "URI",
              //     "type": "event"
              //   },
              //   {
              //     "inputs": [
              //       {
              //         "internalType": "address",
              //         "name": "account",
              //         "type": "address"
              //       },
              //       {
              //         "internalType": "uint256",
              //         "name": "id",
              //         "type": "uint256"
              //       }
              //     ],
              //     "name": "balanceOf",
              //     "outputs": [
              //       {
              //         "internalType": "uint256",
              //         "name": "",
              //         "type": "uint256"
              //       }
              //     ],
              //     "stateMutability": "view",
              //     "type": "function"
              //   },
              //   {
              //     "inputs": [
              //       {
              //         "internalType": "address[]",
              //         "name": "accounts",
              //         "type": "address[]"
              //       },
              //       {
              //         "internalType": "uint256[]",
              //         "name": "ids",
              //         "type": "uint256[]"
              //       }
              //     ],
              //     "name": "balanceOfBatch",
              //     "outputs": [
              //       {
              //         "internalType": "uint256[]",
              //         "name": "",
              //         "type": "uint256[]"
              //       }
              //     ],
              //     "stateMutability": "view",
              //     "type": "function"
              //   },
              //   {
              //     "inputs": [
              //       {
              //         "internalType": "address",
              //         "name": "from",
              //         "type": "address"
              //       },
              //       {
              //         "internalType": "uint256",
              //         "name": "tokenId",
              //         "type": "uint256"
              //       },
              //       {
              //         "internalType": "uint256",
              //         "name": "amount",
              //         "type": "uint256"
              //       }
              //     ],
              //     "name": "burn",
              //     "outputs": [],
              //     "stateMutability": "nonpayable",
              //     "type": "function"
              //   },
              //   {
              //     "inputs": [
              //       {
              //         "internalType": "address",
              //         "name": "account",
              //         "type": "address"
              //       },
              //       {
              //         "internalType": "uint256[]",
              //         "name": "ids",
              //         "type": "uint256[]"
              //       },
              //       {
              //         "internalType": "uint256[]",
              //         "name": "values",
              //         "type": "uint256[]"
              //       }
              //     ],
              //     "name": "burnBatch",
              //     "outputs": [],
              //     "stateMutability": "nonpayable",
              //     "type": "function"
              //   },
              //   {
              //     "inputs": [
              //       {
              //         "internalType": "address",
              //         "name": "account",
              //         "type": "address"
              //       },
              //       {
              //         "internalType": "address",
              //         "name": "operator",
              //         "type": "address"
              //       }
              //     ],
              //     "name": "isApprovedForAll",
              //     "outputs": [
              //       {
              //         "internalType": "bool",
              //         "name": "",
              //         "type": "bool"
              //       }
              //     ],
              //     "stateMutability": "view",
              //     "type": "function"
              //   },
              //   {
              //     "inputs": [
              //       {
              //         "components": [
              //           {
              //             "internalType": "string",
              //             "name": "tokenURI",
              //             "type": "string"
              //           },
              //           {
              //             "internalType": "string",
              //             "name": "metadataURI",
              //             "type": "string"
              //           },
              //           {
              //             "internalType": "bytes32",
              //             "name": "contentHash",
              //             "type": "bytes32"
              //           },
              //           {
              //             "internalType": "bytes32",
              //             "name": "metadataHash",
              //             "type": "bytes32"
              //           }
              //         ],
              //         "internalType": "struct IAwareToken.AwareData",
              //         "name": "data",
              //         "type": "tuple"
              //       },
              //       {
              //         "internalType": "address",
              //         "name": "recipient",
              //         "type": "address"
              //       },
              //       {
              //         "internalType": "uint256",
              //         "name": "amount",
              //         "type": "uint256"
              //       }
              //     ],
              //     "name": "mint",
              //     "outputs": [],
              //     "stateMutability": "nonpayable",
              //     "type": "function"
              //   },
              //   {
              //     "inputs": [
              //       {
              //         "internalType": "uint256",
              //         "name": "tokenId",
              //         "type": "uint256"
              //       }
              //     ],
              //     "name": "ownerOf",
              //     "outputs": [
              //       {
              //         "internalType": "address",
              //         "name": "",
              //         "type": "address"
              //       }
              //     ],
              //     "stateMutability": "view",
              //     "type": "function"
              //   },
              //   {
              //     "inputs": [
              //       {
              //         "internalType": "uint256",
              //         "name": "",
              //         "type": "uint256"
              //       }
              //     ],
              //     "name": "previousTokenOwners",
              //     "outputs": [
              //       {
              //         "internalType": "address",
              //         "name": "",
              //         "type": "address"
              //       }
              //     ],
              //     "stateMutability": "view",
              //     "type": "function"
              //   },
              //   {
              //     "inputs": [
              //       {
              //         "internalType": "address",
              //         "name": "from",
              //         "type": "address"
              //       },
              //       {
              //         "internalType": "address",
              //         "name": "to",
              //         "type": "address"
              //       },
              //       {
              //         "internalType": "uint256[]",
              //         "name": "ids",
              //         "type": "uint256[]"
              //       },
              //       {
              //         "internalType": "uint256[]",
              //         "name": "amounts",
              //         "type": "uint256[]"
              //       },
              //       {
              //         "internalType": "bytes",
              //         "name": "data",
              //         "type": "bytes"
              //       }
              //     ],
              //     "name": "safeBatchTransferFrom",
              //     "outputs": [],
              //     "stateMutability": "nonpayable",
              //     "type": "function"
              //   },
              //   {
              //     "inputs": [
              //       {
              //         "internalType": "address",
              //         "name": "from",
              //         "type": "address"
              //       },
              //       {
              //         "internalType": "address",
              //         "name": "to",
              //         "type": "address"
              //       },
              //       {
              //         "internalType": "uint256",
              //         "name": "id",
              //         "type": "uint256"
              //       },
              //       {
              //         "internalType": "uint256",
              //         "name": "amount",
              //         "type": "uint256"
              //       },
              //       {
              //         "internalType": "bytes",
              //         "name": "data",
              //         "type": "bytes"
              //       }
              //     ],
              //     "name": "safeTransferFrom",
              //     "outputs": [],
              //     "stateMutability": "nonpayable",
              //     "type": "function"
              //   },
              //   {
              //     "inputs": [
              //       {
              //         "internalType": "address",
              //         "name": "operator",
              //         "type": "address"
              //       },
              //       {
              //         "internalType": "bool",
              //         "name": "approved",
              //         "type": "bool"
              //       }
              //     ],
              //     "name": "setApprovalForAll",
              //     "outputs": [],
              //     "stateMutability": "nonpayable",
              //     "type": "function"
              //   },
              //   {
              //     "inputs": [
              //       {
              //         "internalType": "uint256",
              //         "name": "_tokenId",
              //         "type": "uint256"
              //       },
              //       {
              //         "internalType": "string",
              //         "name": "_type",
              //         "type": "string"
              //       }
              //     ],
              //     "name": "setTokenType",
              //     "outputs": [],
              //     "stateMutability": "nonpayable",
              //     "type": "function"
              //   },
              //   {
              //     "inputs": [
              //       {
              //         "internalType": "bytes4",
              //         "name": "interfaceId",
              //         "type": "bytes4"
              //       }
              //     ],
              //     "name": "supportsInterface",
              //     "outputs": [
              //       {
              //         "internalType": "bool",
              //         "name": "",
              //         "type": "bool"
              //       }
              //     ],
              //     "stateMutability": "view",
              //     "type": "function"
              //   },
              //   {
              //     "inputs": [
              //       {
              //         "internalType": "uint256",
              //         "name": "",
              //         "type": "uint256"
              //       }
              //     ],
              //     "name": "tokenContentHashes",
              //     "outputs": [
              //       {
              //         "internalType": "bytes32",
              //         "name": "",
              //         "type": "bytes32"
              //       }
              //     ],
              //     "stateMutability": "view",
              //     "type": "function"
              //   },
              //   {
              //     "inputs": [
              //       {
              //         "internalType": "uint256",
              //         "name": "",
              //         "type": "uint256"
              //       }
              //     ],
              //     "name": "tokenCreators",
              //     "outputs": [
              //       {
              //         "internalType": "address",
              //         "name": "",
              //         "type": "address"
              //       }
              //     ],
              //     "stateMutability": "view",
              //     "type": "function"
              //   },
              //   {
              //     "inputs": [
              //       {
              //         "internalType": "uint256",
              //         "name": "",
              //         "type": "uint256"
              //       }
              //     ],
              //     "name": "tokenMetadataHashes",
              //     "outputs": [
              //       {
              //         "internalType": "bytes32",
              //         "name": "",
              //         "type": "bytes32"
              //       }
              //     ],
              //     "stateMutability": "view",
              //     "type": "function"
              //   },
              //   {
              //     "inputs": [
              //       {
              //         "internalType": "uint256",
              //         "name": "tokenId",
              //         "type": "uint256"
              //       }
              //     ],
              //     "name": "tokenMetadataURI",
              //     "outputs": [
              //       {
              //         "internalType": "string",
              //         "name": "",
              //         "type": "string"
              //       }
              //     ],
              //     "stateMutability": "view",
              //     "type": "function"
              //   },
              //   {
              //     "inputs": [
              //       {
              //         "internalType": "uint256",
              //         "name": "tokenId",
              //         "type": "uint256"
              //       }
              //     ],
              //     "name": "tokentype",
              //     "outputs": [
              //       {
              //         "internalType": "string",
              //         "name": "",
              //         "type": "string"
              //       }
              //     ],
              //     "stateMutability": "view",
              //     "type": "function"
              //   },
              //   {
              //     "inputs": [
              //       {
              //         "internalType": "uint256",
              //         "name": "tokenId",
              //         "type": "uint256"
              //       },
              //       {
              //         "internalType": "string",
              //         "name": "metadataURI",
              //         "type": "string"
              //       }
              //     ],
              //     "name": "updateTokenMetadataURI",
              //     "outputs": [],
              //     "stateMutability": "nonpayable",
              //     "type": "function"
              //   },
              //   {
              //     "inputs": [
              //       {
              //         "internalType": "uint256",
              //         "name": "tokenId",
              //         "type": "uint256"
              //       },
              //       {
              //         "internalType": "string",
              //         "name": "tokenURI",
              //         "type": "string"
              //       }
              //     ],
              //     "name": "updateTokenURI",
              //     "outputs": [],
              //     "stateMutability": "nonpayable",
              //     "type": "function"
              //   },
              //   {
              //     "inputs": [
              //       {
              //         "internalType": "uint256",
              //         "name": "tokenId",
              //         "type": "uint256"
              //       }
              //     ],
              //     "name": "uri",
              //     "outputs": [
              //       {
              //         "internalType": "string",
              //         "name": "",
              //         "type": "string"
              //       }
              //     ],
              //     "stateMutability": "view",
              //     "type": "function"
              //   }
              // ]

              const contractAddress = process.env.CONTRACT_ADDRESS;
              var contract = new connectWeb3.eth.Contract(
                abiArray,
                contractAddress,
                { from: process.env.ADMIN_WALLET_ADDRESS }
              );

              // var gasAmount = await contract.methods.burn(from0xaddress.toLowerCase(), tokenID.toString(), amountInUint.toString()).estimateGas({ from: from0xaddress });

              var gasAmount = "60000";

              // console.log("gasAmount",gasAmount)
              // var increased = Number(gasAmount) * 0.1;
              // gasAmount = Math.round(Number(gasAmount) + increased);

              const gasPrice = await connectWeb3.eth.getGasPrice();
              // console.log("gasPrice", gasPrice)

              const txConfig = {
                from: from0xaddress,
                to: contractAddress,
                gasPrice: gasPrice,
                gas: gasAmount.toString(),
                // nonce: nonce.toString(),
                data: contract.methods
                  .burn(
                    from0xaddress.toLowerCase(),
                    tokenID.toString(),
                    amountInUint.toString()
                  )
                  .encodeABI(),
              };

              console.log("txConfig", txConfig);
              console.log("privatekey", privatekey);

              connectWeb3.eth.accounts.signTransaction(
                txConfig,
                "0x" + privatekey,
                async function (err, signedTx) {
                  if (err) {
                    loggerhandler.logger.error(
                      `${err} ,email:${req.headers.email}`
                    );
                    reject();
                  }

                  console.log("checkchekcsignedTx", signedTx);
                  connectWeb3.eth
                    .sendSignedTransaction(signedTx.rawTransaction)
                    .on("receipt", async function (receipt) {
                      console.log("Tx Hash (Receipt): ", receipt);

                      resolve();
                    })
                    .on("error", async function (e) {
                      loggerhandler.logger.error(
                        `${e} ,email:${req.headers.email}`
                      );
                      console.log("eee", e);
                      reject();
                    });
                }
              );
            } else {
              console.log("yahan hai kya?");
              reject();
            }
          });
      } catch (error) {
        loggerhandler.logger.error(`${error} ,email:${req.headers.email}`);
        console.log("error", error);
        reject();
      }
    });
  },

  burnthroughToken: function (
    from0xaddress,
    amountInUint,
    tokenID,
    nonce,
    connectWeb3,
    req
  ) {
    return new Promise(async (resolve, reject) => {
      try {
        var wallet_of_sender = await wallets
          .findOne({ wallet_address_0x: from0xaddress })
          .select(["wallet_address_0x", "from", "to"])
          .catch((ex) => {
            loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
            return res
              .status(400)
              .jsonp({ status: false, message: "Bad request!" });
          });

        var key = wallet_of_sender.from + wallet_of_sender.to;
        var decrypted_private_key = helperfunctions.encryptAddress(
          key,
          "decrypt"
        );

        var privatekey = "";
        for (var i = 3; i < decrypted_private_key.length - 1; i++) {
          privatekey = privatekey + decrypted_private_key[i];
        }

        console.log("privatekey", privatekey);

        // var abiArray = [
        //   {
        //     "inputs": [],
        //     "stateMutability": "nonpayable",
        //     "type": "constructor"
        //   },
        //   {
        //     "anonymous": false,
        //     "inputs": [
        //       {
        //         "indexed": true,
        //         "internalType": "address",
        //         "name": "account",
        //         "type": "address"
        //       },
        //       {
        //         "indexed": true,
        //         "internalType": "address",
        //         "name": "operator",
        //         "type": "address"
        //       },
        //       {
        //         "indexed": false,
        //         "internalType": "bool",
        //         "name": "approved",
        //         "type": "bool"
        //       }
        //     ],
        //     "name": "ApprovalForAll",
        //     "type": "event"
        //   },
        //   {
        //     "anonymous": false,
        //     "inputs": [
        //       {
        //         "indexed": true,
        //         "internalType": "uint256",
        //         "name": "_tokenId",
        //         "type": "uint256"
        //       },
        //       {
        //         "indexed": false,
        //         "internalType": "address",
        //         "name": "owner",
        //         "type": "address"
        //       },
        //       {
        //         "indexed": false,
        //         "internalType": "string",
        //         "name": "_uri",
        //         "type": "string"
        //       }
        //     ],
        //     "name": "TokenMetadataURIUpdated",
        //     "type": "event"
        //   },
        //   {
        //     "anonymous": false,
        //     "inputs": [
        //       {
        //         "indexed": true,
        //         "internalType": "uint256",
        //         "name": "_tokenId",
        //         "type": "uint256"
        //       },
        //       {
        //         "indexed": false,
        //         "internalType": "address",
        //         "name": "owner",
        //         "type": "address"
        //       },
        //       {
        //         "indexed": false,
        //         "internalType": "string",
        //         "name": "_uri",
        //         "type": "string"
        //       }
        //     ],
        //     "name": "TokenURIUpdated",
        //     "type": "event"
        //   },
        //   {
        //     "anonymous": false,
        //     "inputs": [
        //       {
        //         "indexed": true,
        //         "internalType": "address",
        //         "name": "operator",
        //         "type": "address"
        //       },
        //       {
        //         "indexed": true,
        //         "internalType": "address",
        //         "name": "from",
        //         "type": "address"
        //       },
        //       {
        //         "indexed": true,
        //         "internalType": "address",
        //         "name": "to",
        //         "type": "address"
        //       },
        //       {
        //         "indexed": false,
        //         "internalType": "uint256[]",
        //         "name": "ids",
        //         "type": "uint256[]"
        //       },
        //       {
        //         "indexed": false,
        //         "internalType": "uint256[]",
        //         "name": "values",
        //         "type": "uint256[]"
        //       }
        //     ],
        //     "name": "TransferBatch",
        //     "type": "event"
        //   },
        //   {
        //     "anonymous": false,
        //     "inputs": [
        //       {
        //         "indexed": true,
        //         "internalType": "address",
        //         "name": "operator",
        //         "type": "address"
        //       },
        //       {
        //         "indexed": true,
        //         "internalType": "address",
        //         "name": "from",
        //         "type": "address"
        //       },
        //       {
        //         "indexed": true,
        //         "internalType": "address",
        //         "name": "to",
        //         "type": "address"
        //       },
        //       {
        //         "indexed": false,
        //         "internalType": "uint256",
        //         "name": "id",
        //         "type": "uint256"
        //       },
        //       {
        //         "indexed": false,
        //         "internalType": "uint256",
        //         "name": "value",
        //         "type": "uint256"
        //       }
        //     ],
        //     "name": "TransferSingle",
        //     "type": "event"
        //   },
        //   {
        //     "anonymous": false,
        //     "inputs": [
        //       {
        //         "indexed": false,
        //         "internalType": "string",
        //         "name": "value",
        //         "type": "string"
        //       },
        //       {
        //         "indexed": true,
        //         "internalType": "uint256",
        //         "name": "id",
        //         "type": "uint256"
        //       }
        //     ],
        //     "name": "URI",
        //     "type": "event"
        //   },
        //   {
        //     "inputs": [
        //       {
        //         "internalType": "address",
        //         "name": "account",
        //         "type": "address"
        //       },
        //       {
        //         "internalType": "uint256",
        //         "name": "id",
        //         "type": "uint256"
        //       }
        //     ],
        //     "name": "balanceOf",
        //     "outputs": [
        //       {
        //         "internalType": "uint256",
        //         "name": "",
        //         "type": "uint256"
        //       }
        //     ],
        //     "stateMutability": "view",
        //     "type": "function"
        //   },
        //   {
        //     "inputs": [
        //       {
        //         "internalType": "address[]",
        //         "name": "accounts",
        //         "type": "address[]"
        //       },
        //       {
        //         "internalType": "uint256[]",
        //         "name": "ids",
        //         "type": "uint256[]"
        //       }
        //     ],
        //     "name": "balanceOfBatch",
        //     "outputs": [
        //       {
        //         "internalType": "uint256[]",
        //         "name": "",
        //         "type": "uint256[]"
        //       }
        //     ],
        //     "stateMutability": "view",
        //     "type": "function"
        //   },
        //   {
        //     "inputs": [
        //       {
        //         "internalType": "address",
        //         "name": "from",
        //         "type": "address"
        //       },
        //       {
        //         "internalType": "uint256",
        //         "name": "tokenId",
        //         "type": "uint256"
        //       },
        //       {
        //         "internalType": "uint256",
        //         "name": "amount",
        //         "type": "uint256"
        //       }
        //     ],
        //     "name": "burn",
        //     "outputs": [],
        //     "stateMutability": "nonpayable",
        //     "type": "function"
        //   },
        //   {
        //     "inputs": [
        //       {
        //         "internalType": "address",
        //         "name": "account",
        //         "type": "address"
        //       },
        //       {
        //         "internalType": "uint256[]",
        //         "name": "ids",
        //         "type": "uint256[]"
        //       },
        //       {
        //         "internalType": "uint256[]",
        //         "name": "values",
        //         "type": "uint256[]"
        //       }
        //     ],
        //     "name": "burnBatch",
        //     "outputs": [],
        //     "stateMutability": "nonpayable",
        //     "type": "function"
        //   },
        //   {
        //     "inputs": [
        //       {
        //         "internalType": "address",
        //         "name": "account",
        //         "type": "address"
        //       },
        //       {
        //         "internalType": "address",
        //         "name": "operator",
        //         "type": "address"
        //       }
        //     ],
        //     "name": "isApprovedForAll",
        //     "outputs": [
        //       {
        //         "internalType": "bool",
        //         "name": "",
        //         "type": "bool"
        //       }
        //     ],
        //     "stateMutability": "view",
        //     "type": "function"
        //   },
        //   {
        //     "inputs": [
        //       {
        //         "components": [
        //           {
        //             "internalType": "string",
        //             "name": "tokenURI",
        //             "type": "string"
        //           },
        //           {
        //             "internalType": "string",
        //             "name": "metadataURI",
        //             "type": "string"
        //           },
        //           {
        //             "internalType": "bytes32",
        //             "name": "contentHash",
        //             "type": "bytes32"
        //           },
        //           {
        //             "internalType": "bytes32",
        //             "name": "metadataHash",
        //             "type": "bytes32"
        //           }
        //         ],
        //         "internalType": "struct IAwareToken.AwareData",
        //         "name": "data",
        //         "type": "tuple"
        //       },
        //       {
        //         "internalType": "address",
        //         "name": "recipient",
        //         "type": "address"
        //       },
        //       {
        //         "internalType": "uint256",
        //         "name": "amount",
        //         "type": "uint256"
        //       }
        //     ],
        //     "name": "mint",
        //     "outputs": [],
        //     "stateMutability": "nonpayable",
        //     "type": "function"
        //   },
        //   {
        //     "inputs": [
        //       {
        //         "internalType": "uint256",
        //         "name": "tokenId",
        //         "type": "uint256"
        //       }
        //     ],
        //     "name": "ownerOf",
        //     "outputs": [
        //       {
        //         "internalType": "address",
        //         "name": "",
        //         "type": "address"
        //       }
        //     ],
        //     "stateMutability": "view",
        //     "type": "function"
        //   },
        //   {
        //     "inputs": [
        //       {
        //         "internalType": "uint256",
        //         "name": "",
        //         "type": "uint256"
        //       }
        //     ],
        //     "name": "previousTokenOwners",
        //     "outputs": [
        //       {
        //         "internalType": "address",
        //         "name": "",
        //         "type": "address"
        //       }
        //     ],
        //     "stateMutability": "view",
        //     "type": "function"
        //   },
        //   {
        //     "inputs": [
        //       {
        //         "internalType": "address",
        //         "name": "from",
        //         "type": "address"
        //       },
        //       {
        //         "internalType": "address",
        //         "name": "to",
        //         "type": "address"
        //       },
        //       {
        //         "internalType": "uint256[]",
        //         "name": "ids",
        //         "type": "uint256[]"
        //       },
        //       {
        //         "internalType": "uint256[]",
        //         "name": "amounts",
        //         "type": "uint256[]"
        //       },
        //       {
        //         "internalType": "bytes",
        //         "name": "data",
        //         "type": "bytes"
        //       }
        //     ],
        //     "name": "safeBatchTransferFrom",
        //     "outputs": [],
        //     "stateMutability": "nonpayable",
        //     "type": "function"
        //   },
        //   {
        //     "inputs": [
        //       {
        //         "internalType": "address",
        //         "name": "from",
        //         "type": "address"
        //       },
        //       {
        //         "internalType": "address",
        //         "name": "to",
        //         "type": "address"
        //       },
        //       {
        //         "internalType": "uint256",
        //         "name": "id",
        //         "type": "uint256"
        //       },
        //       {
        //         "internalType": "uint256",
        //         "name": "amount",
        //         "type": "uint256"
        //       },
        //       {
        //         "internalType": "bytes",
        //         "name": "data",
        //         "type": "bytes"
        //       }
        //     ],
        //     "name": "safeTransferFrom",
        //     "outputs": [],
        //     "stateMutability": "nonpayable",
        //     "type": "function"
        //   },
        //   {
        //     "inputs": [
        //       {
        //         "internalType": "address",
        //         "name": "operator",
        //         "type": "address"
        //       },
        //       {
        //         "internalType": "bool",
        //         "name": "approved",
        //         "type": "bool"
        //       }
        //     ],
        //     "name": "setApprovalForAll",
        //     "outputs": [],
        //     "stateMutability": "nonpayable",
        //     "type": "function"
        //   },
        //   {
        //     "inputs": [
        //       {
        //         "internalType": "uint256",
        //         "name": "_tokenId",
        //         "type": "uint256"
        //       },
        //       {
        //         "internalType": "string",
        //         "name": "_type",
        //         "type": "string"
        //       }
        //     ],
        //     "name": "setTokenType",
        //     "outputs": [],
        //     "stateMutability": "nonpayable",
        //     "type": "function"
        //   },
        //   {
        //     "inputs": [
        //       {
        //         "internalType": "bytes4",
        //         "name": "interfaceId",
        //         "type": "bytes4"
        //       }
        //     ],
        //     "name": "supportsInterface",
        //     "outputs": [
        //       {
        //         "internalType": "bool",
        //         "name": "",
        //         "type": "bool"
        //       }
        //     ],
        //     "stateMutability": "view",
        //     "type": "function"
        //   },
        //   {
        //     "inputs": [
        //       {
        //         "internalType": "uint256",
        //         "name": "",
        //         "type": "uint256"
        //       }
        //     ],
        //     "name": "tokenContentHashes",
        //     "outputs": [
        //       {
        //         "internalType": "bytes32",
        //         "name": "",
        //         "type": "bytes32"
        //       }
        //     ],
        //     "stateMutability": "view",
        //     "type": "function"
        //   },
        //   {
        //     "inputs": [
        //       {
        //         "internalType": "uint256",
        //         "name": "",
        //         "type": "uint256"
        //       }
        //     ],
        //     "name": "tokenCreators",
        //     "outputs": [
        //       {
        //         "internalType": "address",
        //         "name": "",
        //         "type": "address"
        //       }
        //     ],
        //     "stateMutability": "view",
        //     "type": "function"
        //   },
        //   {
        //     "inputs": [
        //       {
        //         "internalType": "uint256",
        //         "name": "",
        //         "type": "uint256"
        //       }
        //     ],
        //     "name": "tokenMetadataHashes",
        //     "outputs": [
        //       {
        //         "internalType": "bytes32",
        //         "name": "",
        //         "type": "bytes32"
        //       }
        //     ],
        //     "stateMutability": "view",
        //     "type": "function"
        //   },
        //   {
        //     "inputs": [
        //       {
        //         "internalType": "uint256",
        //         "name": "tokenId",
        //         "type": "uint256"
        //       }
        //     ],
        //     "name": "tokenMetadataURI",
        //     "outputs": [
        //       {
        //         "internalType": "string",
        //         "name": "",
        //         "type": "string"
        //       }
        //     ],
        //     "stateMutability": "view",
        //     "type": "function"
        //   },
        //   {
        //     "inputs": [
        //       {
        //         "internalType": "uint256",
        //         "name": "tokenId",
        //         "type": "uint256"
        //       }
        //     ],
        //     "name": "tokentype",
        //     "outputs": [
        //       {
        //         "internalType": "string",
        //         "name": "",
        //         "type": "string"
        //       }
        //     ],
        //     "stateMutability": "view",
        //     "type": "function"
        //   },
        //   {
        //     "inputs": [
        //       {
        //         "internalType": "uint256",
        //         "name": "tokenId",
        //         "type": "uint256"
        //       },
        //       {
        //         "internalType": "string",
        //         "name": "metadataURI",
        //         "type": "string"
        //       }
        //     ],
        //     "name": "updateTokenMetadataURI",
        //     "outputs": [],
        //     "stateMutability": "nonpayable",
        //     "type": "function"
        //   },
        //   {
        //     "inputs": [
        //       {
        //         "internalType": "uint256",
        //         "name": "tokenId",
        //         "type": "uint256"
        //       },
        //       {
        //         "internalType": "string",
        //         "name": "tokenURI",
        //         "type": "string"
        //       }
        //     ],
        //     "name": "updateTokenURI",
        //     "outputs": [],
        //     "stateMutability": "nonpayable",
        //     "type": "function"
        //   },
        //   {
        //     "inputs": [
        //       {
        //         "internalType": "uint256",
        //         "name": "tokenId",
        //         "type": "uint256"
        //       }
        //     ],
        //     "name": "uri",
        //     "outputs": [
        //       {
        //         "internalType": "string",
        //         "name": "",
        //         "type": "string"
        //       }
        //     ],
        //     "stateMutability": "view",
        //     "type": "function"
        //   }
        // ]

        const contractAddress = process.env.CONTRACT_ADDRESS;
        var contract = new connectWeb3.eth.Contract(abiArray, contractAddress, {
          from: process.env.ADMIN_WALLET_ADDRESS,
        });

        var gasAmount = await contract.methods
          .safeTransferFrom(
            from0xaddress.toLowerCase(),
            process.env.DUMP_WALLET_ADDRESS,
            tokenID,
            amountInUint.toString(),
            []
          )
          .estimateGas({ from: from0xaddress });

        var increased = Number(gasAmount) * 0.2;
        gasAmount = Math.ceil(Number(gasAmount) + increased);

        connectWeb3.eth
          .getBalance(from0xaddress.toLowerCase())
          .then(async function (balance) {
            let iotxBalance = Big(balance).div(10 ** 18);
            console.log("new iotxBalance", iotxBalance.toFixed(18));

            if (iotxBalance.toFixed(18) < 2) {
              await transferAsync(
                req,
                from0xaddress.toLowerCase(),
                gasAmount,
                async function (response) {
                  // console.log("response",response);

                  connectWeb3.eth
                    .getBalance(from0xaddress.toLowerCase())
                    .then(async function (balance) {
                      let iotxBalance = Big(balance).div(10 ** 18);
                      console.log("new iotxBalance", iotxBalance.toFixed(18));
                      if (response == true && iotxBalance.toFixed(18) > 0) {
                        const gasPrice = await connectWeb3.eth.getGasPrice();

                        const txConfig = {
                          from: from0xaddress,
                          to: contractAddress,
                          gasPrice: gasPrice,
                          gas: gasAmount.toString(),
                          nonce: nonce.toString(),
                          data: contract.methods
                            .safeTransferFrom(
                              from0xaddress.toLowerCase(),
                              process.env.DUMP_WALLET_ADDRESS,
                              tokenID,
                              amountInUint.toString(),
                              []
                            )
                            .encodeABI(),
                        };

                        console.log("bangtxConfig", txConfig);

                        console.log("decryptedprivatekey 5555", privatekey);

                        // var check = "0xd254a2e20f3d9bb59c88cb0b6f25f2784d94777059db74da35997faf270e12c5";

                        connectWeb3.eth.accounts.signTransaction(
                          txConfig,
                          "0x" + privatekey,
                          async function (err, signedTx) {
                            if (err) {
                              console.log("signTransactionerr", err);
                              loggerhandler.logger.error(
                                `${err} ,email:${req.headers.email}`
                              );
                              reject();
                            }

                            console.log("signedTx", signedTx);
                            connectWeb3.eth
                              .sendSignedTransaction(signedTx.rawTransaction)
                              .on("receipt", async function (receipt) {
                                console.log("Tx Hash (Receipt): ", receipt);

                                resolve();
                              })
                              .on("error", async function (e) {
                                loggerhandler.logger.error(
                                  `${e} ,email:${req.headers.email}`
                                );
                                console.log("e", e);
                                reject();
                              });
                          }
                        );
                      } else {
                        reject();
                      }
                    });
                }
              );
            } else {
              const gasPrice = await connectWeb3.eth.getGasPrice();
              const txConfig = {
                from: from0xaddress,
                to: contractAddress,
                gasPrice: gasPrice,
                gas: gasAmount.toString(),
                nonce: nonce.toString(),
                data: contract.methods
                  .safeTransferFrom(
                    from0xaddress.toLowerCase(),
                    process.env.DUMP_WALLET_ADDRESS,
                    tokenID,
                    amountInUint.toString(),
                    []
                  )
                  .encodeABI(),
              };

              console.log("bangtxConfig", txConfig);

              connectWeb3.eth.accounts.signTransaction(
                txConfig,
                "0x" + privatekey,
                async function (err, signedTx) {
                  if (err) {
                    console.log("signTransactionerr", err);
                    loggerhandler.logger.error(
                      `${err} ,email:${req.headers.email}`
                    );
                    reject();
                  }

                  console.log("signedTx", signedTx);
                  connectWeb3.eth
                    .sendSignedTransaction(signedTx.rawTransaction)
                    .on("receipt", async function (receipt) {
                      console.log("Tx Hash (Receipt): ", receipt);

                      resolve();
                    })
                    .on("error", async function (e) {
                      loggerhandler.logger.error(
                        `${e} ,email:${req.headers.email}`
                      );
                      console.log("e", e);
                      reject();
                    });
                }
              );
            }
          });
      } catch (error) {
        loggerhandler.logger.error(`${error} ,email:${req.headers.email}`);
        console.log("error", error);
        reject();
      }
    });
  },

  //  batchburnthroughToken: function (from0xaddress, amountInUint, tokenID) {
  //   return new Promise(async (resolve, reject) => {
  //     try {

  //       var wallet_of_sender = await wallets.findOne({ wallet_address_0x: from0xaddress }).select(['wallet_address_0x', 'from', 'to']).catch((ex) => { return res.status(400).jsonp({ status: false, message: "Bad request!" }); })

  //       var key = wallet_of_sender.from + wallet_of_sender.to;
  //       var decrypted_private_key = helperfunctions.encryptAddress(key, 'decrypt');

  //       var privatekey = "";
  //       for (var i = 3; i < decrypted_private_key.length - 1; i++) {
  //         privatekey = privatekey + decrypted_private_key[i];
  //       }

  //       console.log("privatekey", privatekey)

  //       var abiArray = [
  //         {
  //           "inputs": [],
  //           "stateMutability": "nonpayable",
  //           "type": "constructor"
  //         },
  //         {
  //           "anonymous": false,
  //           "inputs": [
  //             {
  //               "indexed": true,
  //               "internalType": "address",
  //               "name": "account",
  //               "type": "address"
  //             },
  //             {
  //               "indexed": true,
  //               "internalType": "address",
  //               "name": "operator",
  //               "type": "address"
  //             },
  //             {
  //               "indexed": false,
  //               "internalType": "bool",
  //               "name": "approved",
  //               "type": "bool"
  //             }
  //           ],
  //           "name": "ApprovalForAll",
  //           "type": "event"
  //         },
  //         {
  //           "anonymous": false,
  //           "inputs": [
  //             {
  //               "indexed": true,
  //               "internalType": "uint256",
  //               "name": "_tokenId",
  //               "type": "uint256"
  //             },
  //             {
  //               "indexed": false,
  //               "internalType": "address",
  //               "name": "owner",
  //               "type": "address"
  //             },
  //             {
  //               "indexed": false,
  //               "internalType": "string",
  //               "name": "_uri",
  //               "type": "string"
  //             }
  //           ],
  //           "name": "TokenMetadataURIUpdated",
  //           "type": "event"
  //         },
  //         {
  //           "anonymous": false,
  //           "inputs": [
  //             {
  //               "indexed": true,
  //               "internalType": "uint256",
  //               "name": "_tokenId",
  //               "type": "uint256"
  //             },
  //             {
  //               "indexed": false,
  //               "internalType": "address",
  //               "name": "owner",
  //               "type": "address"
  //             },
  //             {
  //               "indexed": false,
  //               "internalType": "string",
  //               "name": "_uri",
  //               "type": "string"
  //             }
  //           ],
  //           "name": "TokenURIUpdated",
  //           "type": "event"
  //         },
  //         {
  //           "anonymous": false,
  //           "inputs": [
  //             {
  //               "indexed": true,
  //               "internalType": "address",
  //               "name": "operator",
  //               "type": "address"
  //             },
  //             {
  //               "indexed": true,
  //               "internalType": "address",
  //               "name": "from",
  //               "type": "address"
  //             },
  //             {
  //               "indexed": true,
  //               "internalType": "address",
  //               "name": "to",
  //               "type": "address"
  //             },
  //             {
  //               "indexed": false,
  //               "internalType": "uint256[]",
  //               "name": "ids",
  //               "type": "uint256[]"
  //             },
  //             {
  //               "indexed": false,
  //               "internalType": "uint256[]",
  //               "name": "values",
  //               "type": "uint256[]"
  //             }
  //           ],
  //           "name": "TransferBatch",
  //           "type": "event"
  //         },
  //         {
  //           "anonymous": false,
  //           "inputs": [
  //             {
  //               "indexed": true,
  //               "internalType": "address",
  //               "name": "operator",
  //               "type": "address"
  //             },
  //             {
  //               "indexed": true,
  //               "internalType": "address",
  //               "name": "from",
  //               "type": "address"
  //             },
  //             {
  //               "indexed": true,
  //               "internalType": "address",
  //               "name": "to",
  //               "type": "address"
  //             },
  //             {
  //               "indexed": false,
  //               "internalType": "uint256",
  //               "name": "id",
  //               "type": "uint256"
  //             },
  //             {
  //               "indexed": false,
  //               "internalType": "uint256",
  //               "name": "value",
  //               "type": "uint256"
  //             }
  //           ],
  //           "name": "TransferSingle",
  //           "type": "event"
  //         },
  //         {
  //           "anonymous": false,
  //           "inputs": [
  //             {
  //               "indexed": false,
  //               "internalType": "string",
  //               "name": "value",
  //               "type": "string"
  //             },
  //             {
  //               "indexed": true,
  //               "internalType": "uint256",
  //               "name": "id",
  //               "type": "uint256"
  //             }
  //           ],
  //           "name": "URI",
  //           "type": "event"
  //         },
  //         {
  //           "inputs": [
  //             {
  //               "internalType": "address",
  //               "name": "account",
  //               "type": "address"
  //             },
  //             {
  //               "internalType": "uint256",
  //               "name": "id",
  //               "type": "uint256"
  //             }
  //           ],
  //           "name": "balanceOf",
  //           "outputs": [
  //             {
  //               "internalType": "uint256",
  //               "name": "",
  //               "type": "uint256"
  //             }
  //           ],
  //           "stateMutability": "view",
  //           "type": "function"
  //         },
  //         {
  //           "inputs": [
  //             {
  //               "internalType": "address[]",
  //               "name": "accounts",
  //               "type": "address[]"
  //             },
  //             {
  //               "internalType": "uint256[]",
  //               "name": "ids",
  //               "type": "uint256[]"
  //             }
  //           ],
  //           "name": "balanceOfBatch",
  //           "outputs": [
  //             {
  //               "internalType": "uint256[]",
  //               "name": "",
  //               "type": "uint256[]"
  //             }
  //           ],
  //           "stateMutability": "view",
  //           "type": "function"
  //         },
  //         {
  //           "inputs": [
  //             {
  //               "internalType": "address",
  //               "name": "from",
  //               "type": "address"
  //             },
  //             {
  //               "internalType": "uint256",
  //               "name": "tokenId",
  //               "type": "uint256"
  //             },
  //             {
  //               "internalType": "uint256",
  //               "name": "amount",
  //               "type": "uint256"
  //             }
  //           ],
  //           "name": "burn",
  //           "outputs": [],
  //           "stateMutability": "nonpayable",
  //           "type": "function"
  //         },
  //         {
  //           "inputs": [
  //             {
  //               "internalType": "address",
  //               "name": "account",
  //               "type": "address"
  //             },
  //             {
  //               "internalType": "uint256[]",
  //               "name": "ids",
  //               "type": "uint256[]"
  //             },
  //             {
  //               "internalType": "uint256[]",
  //               "name": "values",
  //               "type": "uint256[]"
  //             }
  //           ],
  //           "name": "burnBatch",
  //           "outputs": [],
  //           "stateMutability": "nonpayable",
  //           "type": "function"
  //         },
  //         {
  //           "inputs": [
  //             {
  //               "internalType": "address",
  //               "name": "account",
  //               "type": "address"
  //             },
  //             {
  //               "internalType": "address",
  //               "name": "operator",
  //               "type": "address"
  //             }
  //           ],
  //           "name": "isApprovedForAll",
  //           "outputs": [
  //             {
  //               "internalType": "bool",
  //               "name": "",
  //               "type": "bool"
  //             }
  //           ],
  //           "stateMutability": "view",
  //           "type": "function"
  //         },
  //         {
  //           "inputs": [
  //             {
  //               "components": [
  //                 {
  //                   "internalType": "string",
  //                   "name": "tokenURI",
  //                   "type": "string"
  //                 },
  //                 {
  //                   "internalType": "string",
  //                   "name": "metadataURI",
  //                   "type": "string"
  //                 },
  //                 {
  //                   "internalType": "bytes32",
  //                   "name": "contentHash",
  //                   "type": "bytes32"
  //                 },
  //                 {
  //                   "internalType": "bytes32",
  //                   "name": "metadataHash",
  //                   "type": "bytes32"
  //                 }
  //               ],
  //               "internalType": "struct IAwareToken.AwareData",
  //               "name": "data",
  //               "type": "tuple"
  //             },
  //             {
  //               "internalType": "address",
  //               "name": "recipient",
  //               "type": "address"
  //             },
  //             {
  //               "internalType": "uint256",
  //               "name": "amount",
  //               "type": "uint256"
  //             }
  //           ],
  //           "name": "mint",
  //           "outputs": [],
  //           "stateMutability": "nonpayable",
  //           "type": "function"
  //         },
  //         {
  //           "inputs": [
  //             {
  //               "internalType": "uint256",
  //               "name": "tokenId",
  //               "type": "uint256"
  //             }
  //           ],
  //           "name": "ownerOf",
  //           "outputs": [
  //             {
  //               "internalType": "address",
  //               "name": "",
  //               "type": "address"
  //             }
  //           ],
  //           "stateMutability": "view",
  //           "type": "function"
  //         },
  //         {
  //           "inputs": [
  //             {
  //               "internalType": "uint256",
  //               "name": "",
  //               "type": "uint256"
  //             }
  //           ],
  //           "name": "previousTokenOwners",
  //           "outputs": [
  //             {
  //               "internalType": "address",
  //               "name": "",
  //               "type": "address"
  //             }
  //           ],
  //           "stateMutability": "view",
  //           "type": "function"
  //         },
  //         {
  //           "inputs": [
  //             {
  //               "internalType": "address",
  //               "name": "from",
  //               "type": "address"
  //             },
  //             {
  //               "internalType": "address",
  //               "name": "to",
  //               "type": "address"
  //             },
  //             {
  //               "internalType": "uint256[]",
  //               "name": "ids",
  //               "type": "uint256[]"
  //             },
  //             {
  //               "internalType": "uint256[]",
  //               "name": "amounts",
  //               "type": "uint256[]"
  //             },
  //             {
  //               "internalType": "bytes",
  //               "name": "data",
  //               "type": "bytes"
  //             }
  //           ],
  //           "name": "safeBatchTransferFrom",
  //           "outputs": [],
  //           "stateMutability": "nonpayable",
  //           "type": "function"
  //         },
  //         {
  //           "inputs": [
  //             {
  //               "internalType": "address",
  //               "name": "from",
  //               "type": "address"
  //             },
  //             {
  //               "internalType": "address",
  //               "name": "to",
  //               "type": "address"
  //             },
  //             {
  //               "internalType": "uint256",
  //               "name": "id",
  //               "type": "uint256"
  //             },
  //             {
  //               "internalType": "uint256",
  //               "name": "amount",
  //               "type": "uint256"
  //             },
  //             {
  //               "internalType": "bytes",
  //               "name": "data",
  //               "type": "bytes"
  //             }
  //           ],
  //           "name": "safeTransferFrom",
  //           "outputs": [],
  //           "stateMutability": "nonpayable",
  //           "type": "function"
  //         },
  //         {
  //           "inputs": [
  //             {
  //               "internalType": "address",
  //               "name": "operator",
  //               "type": "address"
  //             },
  //             {
  //               "internalType": "bool",
  //               "name": "approved",
  //               "type": "bool"
  //             }
  //           ],
  //           "name": "setApprovalForAll",
  //           "outputs": [],
  //           "stateMutability": "nonpayable",
  //           "type": "function"
  //         },
  //         {
  //           "inputs": [
  //             {
  //               "internalType": "uint256",
  //               "name": "_tokenId",
  //               "type": "uint256"
  //             },
  //             {
  //               "internalType": "string",
  //               "name": "_type",
  //               "type": "string"
  //             }
  //           ],
  //           "name": "setTokenType",
  //           "outputs": [],
  //           "stateMutability": "nonpayable",
  //           "type": "function"
  //         },
  //         {
  //           "inputs": [
  //             {
  //               "internalType": "bytes4",
  //               "name": "interfaceId",
  //               "type": "bytes4"
  //             }
  //           ],
  //           "name": "supportsInterface",
  //           "outputs": [
  //             {
  //               "internalType": "bool",
  //               "name": "",
  //               "type": "bool"
  //             }
  //           ],
  //           "stateMutability": "view",
  //           "type": "function"
  //         },
  //         {
  //           "inputs": [
  //             {
  //               "internalType": "uint256",
  //               "name": "",
  //               "type": "uint256"
  //             }
  //           ],
  //           "name": "tokenContentHashes",
  //           "outputs": [
  //             {
  //               "internalType": "bytes32",
  //               "name": "",
  //               "type": "bytes32"
  //             }
  //           ],
  //           "stateMutability": "view",
  //           "type": "function"
  //         },
  //         {
  //           "inputs": [
  //             {
  //               "internalType": "uint256",
  //               "name": "",
  //               "type": "uint256"
  //             }
  //           ],
  //           "name": "tokenCreators",
  //           "outputs": [
  //             {
  //               "internalType": "address",
  //               "name": "",
  //               "type": "address"
  //             }
  //           ],
  //           "stateMutability": "view",
  //           "type": "function"
  //         },
  //         {
  //           "inputs": [
  //             {
  //               "internalType": "uint256",
  //               "name": "",
  //               "type": "uint256"
  //             }
  //           ],
  //           "name": "tokenMetadataHashes",
  //           "outputs": [
  //             {
  //               "internalType": "bytes32",
  //               "name": "",
  //               "type": "bytes32"
  //             }
  //           ],
  //           "stateMutability": "view",
  //           "type": "function"
  //         },
  //         {
  //           "inputs": [
  //             {
  //               "internalType": "uint256",
  //               "name": "tokenId",
  //               "type": "uint256"
  //             }
  //           ],
  //           "name": "tokenMetadataURI",
  //           "outputs": [
  //             {
  //               "internalType": "string",
  //               "name": "",
  //               "type": "string"
  //             }
  //           ],
  //           "stateMutability": "view",
  //           "type": "function"
  //         },
  //         {
  //           "inputs": [
  //             {
  //               "internalType": "uint256",
  //               "name": "tokenId",
  //               "type": "uint256"
  //             }
  //           ],
  //           "name": "tokentype",
  //           "outputs": [
  //             {
  //               "internalType": "string",
  //               "name": "",
  //               "type": "string"
  //             }
  //           ],
  //           "stateMutability": "view",
  //           "type": "function"
  //         },
  //         {
  //           "inputs": [
  //             {
  //               "internalType": "uint256",
  //               "name": "tokenId",
  //               "type": "uint256"
  //             },
  //             {
  //               "internalType": "string",
  //               "name": "metadataURI",
  //               "type": "string"
  //             }
  //           ],
  //           "name": "updateTokenMetadataURI",
  //           "outputs": [],
  //           "stateMutability": "nonpayable",
  //           "type": "function"
  //         },
  //         {
  //           "inputs": [
  //             {
  //               "internalType": "uint256",
  //               "name": "tokenId",
  //               "type": "uint256"
  //             },
  //             {
  //               "internalType": "string",
  //               "name": "tokenURI",
  //               "type": "string"
  //             }
  //           ],
  //           "name": "updateTokenURI",
  //           "outputs": [],
  //           "stateMutability": "nonpayable",
  //           "type": "function"
  //         },
  //         {
  //           "inputs": [
  //             {
  //               "internalType": "uint256",
  //               "name": "tokenId",
  //               "type": "uint256"
  //             }
  //           ],
  //           "name": "uri",
  //           "outputs": [
  //             {
  //               "internalType": "string",
  //               "name": "",
  //               "type": "string"
  //             }
  //           ],
  //           "stateMutability": "view",
  //           "type": "function"
  //         }
  //       ]

  //       const contractAddress = process.env.CONTRACT_ADDRESS;
  //       var contract = new connectWeb3.eth.Contract(abiArray, contractAddress, { from: process.env.ADMIN_WALLET_ADDRESS })

  //       var gasAmount = await contract.methods.safeTransferFrom(from0xaddress.toLowerCase(), process.env.DUMP_WALLET_ADDRESS, tokenID, amountInUint.toString(), []).estimateGas({ from: from0xaddress });

  //       var increased = Number(gasAmount) * 0.2;
  //       gasAmount = Math.ceil(Number(gasAmount) + increased);

  //       connectWeb3.eth.getBalance(from0xaddress.toLowerCase()).then(
  //         async function (balance) {

  //           let iotxBalance = Big(balance).div(10 ** 18);
  //           console.log("new iotxBalance", iotxBalance.toFixed(18))

  //           if (iotxBalance.toFixed(18) < 2) {

  //             await transferAsync(from0xaddress.toLowerCase(), gasAmount,
  //               async function (response) {

  //                 // console.log("response",response);

  //                 connectWeb3.eth.getBalance(from0xaddress.toLowerCase()).then(
  //                   async function (balance) {

  //                     let iotxBalance = Big(balance).div(10 ** 18);
  //                     console.log("new iotxBalance", iotxBalance.toFixed(18))
  //                     if (response == true && iotxBalance.toFixed(18) > 0) {

  //                       const gasPrice = await connectWeb3.eth.getGasPrice();

  //                       const txConfig = {
  //                         from: from0xaddress,
  //                         to: contractAddress,
  //                         gasPrice: gasPrice,
  //                         gas: gasAmount.toString(),
  //                         nonce: nonce.toString(),
  //                         data: contract.methods.safeTransferFrom(from0xaddress.toLowerCase(), process.env.DUMP_WALLET_ADDRESS, tokenID, amountInUint.toString(), []).encodeABI(),
  //                       };

  //                       console.log("bangtxConfig", txConfig)

  //                       console.log("decryptedprivatekey 5555", privatekey)

  //                       // var check = "0xd254a2e20f3d9bb59c88cb0b6f25f2784d94777059db74da35997faf270e12c5";

  //                       connectWeb3.eth.accounts.signTransaction(txConfig, '0x' + privatekey, async function (err, signedTx) {
  //                         if (err) {
  //                           console.log("signTransactionerr", err)

  //                           reject();
  //                         }

  //                         console.log("signedTx", signedTx)
  //                         connectWeb3.eth.sendSignedTransaction(signedTx.rawTransaction)
  //                           .on("receipt", async function (receipt) {
  //                             console.log("Tx Hash (Receipt): ", receipt);

  //                             resolve();

  //                           })
  //                           .on("error", async function (e) {
  //                             console.log("e", e)
  //                             reject();
  //                           });
  //                       });

  //                     }
  //                     else {
  //                       reject();
  //                     }

  //                   })

  //               })

  //           }
  //           else {

  //             const gasPrice = await connectWeb3.eth.getGasPrice();
  //             const txConfig = {
  //               from: from0xaddress,
  //               to: contractAddress,
  //               gasPrice: gasPrice,
  //               gas: gasAmount.toString(),
  //               nonce: nonce.toString(),
  //               data: contract.methods.safeTransferFrom(from0xaddress.toLowerCase(), process.env.DUMP_WALLET_ADDRESS, tokenID, amountInUint.toString(), []).encodeABI(),
  //             };

  //             console.log("bangtxConfig", txConfig)

  //             connectWeb3.eth.accounts.signTransaction(txConfig, '0x' + privatekey, async function (err, signedTx) {
  //               if (err) {
  //                 console.log("signTransactionerr", err)

  //                 reject();
  //               }

  //               console.log("signedTx", signedTx)
  //               connectWeb3.eth.sendSignedTransaction(signedTx.rawTransaction)
  //                 .on("receipt", async function (receipt) {
  //                   console.log("Tx Hash (Receipt): ", receipt);

  //                   resolve();

  //                 })
  //                 .on("error", async function (e) {
  //                   console.log("e", e)
  //                   reject();
  //                 });
  //             });
  //           }
  //         })

  //     }
  //     catch (error) {
  //       console.log("error", error)
  //       reject();
  //     }
  //   })
  // }
};

const transferAsync = async (req, to0xaddress, gastobetransfred, callback) => {
  // console.log("to0xaddress",to0xaddress);

  try {
    connectWeb3 = await new Web3(
      new Web3.providers.HttpProvider(process.env.BABEL_ENDPOINT)
    );

    await connectWeb3.eth.net.isListening();
  } catch {
    connectWeb3 = await new Web3(
      new Web3.providers.HttpProvider(process.env.ALTERNATE_BABEL_ENDPOINT)
    );

    await connectWeb3.eth.net.isListening();
  }

  connectWeb3.eth
    .getBalance(process.env.ADMIN_WALLET_ADDRESS)
    .then(async function (balance) {
      let iotxBalance = Big(balance).div(10 ** 18);

      console.log("Funds has been transfrred");

      if (iotxBalance.toFixed(18) > 0) {
        const gasPrice = await connectWeb3.eth.getGasPrice();
        var gasAmount = "40000";
        var amountInUint = connectWeb3.utils.toWei("1");

        const txConfig = {
          from: process.env.ADMIN_WALLET_ADDRESS,
          to: to0xaddress,
          gasPrice: gasPrice,
          gas: gasAmount.toString(),
          value: amountInUint,
        };

        console.log("txConfig", txConfig);
        const privatekey = process.env.ADMIN_PRIVATE_KEY;

        connectWeb3.eth.accounts.signTransaction(
          txConfig,
          privatekey,
          async function (err, signedTx) {
            if (err) {
              loggerhandler.logger.error(`${err} ,email:${req.headers.email}`);
              callback(false);
            }

            console.log("signedTx", signedTx);
            connectWeb3.eth
              .sendSignedTransaction(signedTx.rawTransaction)
              .on("receipt", async function (receipt) {
                console.log("receipt", receipt);

                callback(true);
              })
              .on("error", async function (e) {
                console.log("ex", e);
                loggerhandler.logger.error(`${e} ,email:${req.headers.email}`);
                callback(false);
              });
          }
        );
      } else {
        callback(false);
      }
    });
};
