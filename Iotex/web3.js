
var from = require("@iotexproject/iotex-address-ts").from;
const Web3 = require('web3');
const Big = require('big.js');
const ethers = require('ethers');
var wallets = require("../models/wallets");
var mongoose = require("mongoose");
const HDWalletProvider = require('truffle-hdwallet-provider');
var bip39 = require('bip39')
var crypto = require('crypto');
var upload_handler = require("./upload");
const aw_tokens = require('../models/aw_tokens');
const physical_assets = require('../models/physical_asset');
const tracer = require('../models/tracer');
const self_validation = require('../models/self_validation');
const company_compliances = require('../models/company_compliances');
const kyc_details = require('../models/kyc_details');
const transaction_history = require('../models/transaction_history');
const helperfunctions = require("../scripts/helper-functions");
const update_physical_asset = require('../models/update_physical_asset');
const update_tracer = require('../models/update_tracer');

const update_self_validation = require('../models/update_self_validation');
const update_company_compliances = require('../models/update_company_compliancess');
const update_aw_tokens = require('../models/update_aw_tokens');
const selected_update_aware_token = require('../models/selected_update_aware_token');
const transferred_tokens = require('../models/transferred-tokens');
const { Readable } = require('stream');
const loggerhandler = require('../logger/log');


const { request, gql } = require('graphql-request')
const axios = require("axios"); // Requests

const fs = require('fs');
const path = require('path');
global.atob = require("atob");

// const fetch = require('node-fetch');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const { performance } = require('perf_hooks');

const https = require('https');





//aware sdk
var { awaretoken, constructAwareData, sha256FromBuffer, generateMetadata } = require("../@aware/sdk");

//Blockchain
const { v4: uuidv4 } = require('uuid')
const abiArray = require('../contract/aware-2022-aib');

const { FleekSdk, PersonalAccessTokenService } = require('@fleek-platform/sdk/node');

const personalAccessTokenService = new PersonalAccessTokenService({
    personalAccessToken: 'pat_Ri3CCWnv6hNFFrhd7i9f', // Use the API key here
    projectId: 'cm60xv4cn0001yattlog5a6jp', // Replace with your actual project ID
});


const from0xaddress = process.env.ADMIN_WALLET_ADDRESS;
var connectWeb3;


module.exports = {

    createWalletAsync: async function (aware_id, callback) {

        var wallet_found = await wallets.findOne({ _awareid: aware_id }).catch((ex) => { callback(false) })

        if (!wallet_found) {
            var web3 = null;
            try {
                web3 = new Web3(process.env.BABEL_ENDPOINT);
            }
            catch {
                web3 = new Web3(process.env.ALTERNATE_BABEL_ENDPOINT);
            }
            const account = web3.eth.accounts.create();

            const privateKey = account.privateKey;
            var chars = account.privateKey.split('');

            var io_privateKey = "";
            for (var i = 2; i < chars.length; i++) {
                io_privateKey = io_privateKey + chars[i];
            }

            var ramdomstring = helperfunctions.makeid(64);

            var fake_io_privatekey = `${ramdomstring}`;

            var encrypted_privateKey = helperfunctions.encryptAddress(privateKey, 'encrypt');
            var encrypted_io_privateKey = helperfunctions.encryptAddress(io_privateKey, 'encrypt');
            var encrypted_fake_io_privatekey = helperfunctions.encryptAddress(fake_io_privatekey, 'encrypt');


            const froom = encrypted_privateKey.slice(0, (encrypted_privateKey.length / 2));
            const too = encrypted_privateKey.slice((encrypted_privateKey.length / 2), encrypted_privateKey.length);

            const froom_i = encrypted_io_privateKey.slice(0, (encrypted_io_privateKey.length / 2));
            const too_i = encrypted_io_privateKey.slice((encrypted_io_privateKey.length / 2), encrypted_io_privateKey.length);

            await wallets.create({
                _awareid: aware_id,
                wallet_address_0x: account.address,
                wallet_address_io: from(account.address).string(),
                private_key: encrypted_fake_io_privatekey,
                from: froom,
                to: too,
                from_i: froom_i,
                to_i: too_i,
            }).catch((ex) => {

                console.log("ex", ex);
                callback(false)

            });

            // console.log("start")

            callback(true);

            // console.log("BOM BOOM")

            // await transferAsync(account.address,
            //     async function (response) {

            //         // console.log("response",response);

            //         if (response == true) {
            //             callback(true);
            //         }
            //         else {
            //             callback(false);
            //         }
            //     })


        }
        else {
            return callback(true);
        }

    },

    createAwareTokenAsync: async function (aware_token_id, callback) {
        try {
            try {
                connectWeb3 = await new Web3(new Web3.providers.HttpProvider(process.env.BABEL_ENDPOINT));
                await connectWeb3.eth.net.isListening();
            } catch {
                connectWeb3 = await new Web3(new Web3.providers.HttpProvider(process.env.ALTERNATE_BABEL_ENDPOINT));
                await connectWeb3.eth.net.isListening();
            }

            console.log("connected");

            const balance = await connectWeb3.eth.getBalance(from0xaddress);
            console.log("balance", balance);

            let iotxBalance = Big(balance).div(10 ** 18);
            console.log("iotxBalance", iotxBalance.toFixed(18));

            if (parseFloat(iotxBalance.toFixed(18)) > 0) {  // Ensure comparison works as expected
                // Fetch the first essential document (aw_token_avaliable)
                const aw_token_avaliable = await aw_tokens.findOne({ _id: mongoose.Types.ObjectId(aware_token_id) }).select(["_id", "_awareid"]).catch(() => { throw new Error("Failed to find token"); });

                // Now fetch the remaining data using aw_token_avaliable._awareid
                const [
                    kyc_details_avaliable,
                    wallet_avaliable,
                    assets_avaliable,
                    tracer_avaliable,
                    self_validation_avaliable,
                    company_compliances_avaliable
                ] = await Promise.all([
                    kyc_details.findOne({ aware_id: aw_token_avaliable._awareid }).select(["_id", "company_name"]).catch(() => { throw new Error("Failed to find KYC details"); }),
                    wallets.findOne({ _awareid: aw_token_avaliable._awareid }).select(["wallet_address_0x"]).catch(() => { throw new Error("Failed to find wallet details"); }),
                    physical_assets.findOne({ _awareid: aw_token_avaliable._awareid, aware_token_id: aw_token_avaliable._id.toString() }).catch(() => { throw new Error("Failed to find asset details"); }),
                    tracer.findOne({ _awareid: aw_token_avaliable._awareid, aware_token_id: aw_token_avaliable._id.toString() }).catch(() => { throw new Error("Failed to find tracer details"); }),
                    self_validation.findOne({ _awareid: aw_token_avaliable._awareid, aware_token_id: aw_token_avaliable._id.toString() }).catch(() => { throw new Error("Failed to find self-validation details"); }),
                    company_compliances.findOne({ _awareid: aw_token_avaliable._awareid, aware_token_id: aw_token_avaliable._id.toString() }).catch(() => { throw new Error("Failed to find compliance details"); })
                ]);

                const file = assets_avaliable.aware_token_type
                    ? `uploads/${assets_avaliable.aware_token_type === 'Product' ? 'product-t.png' :
                        assets_avaliable.aware_token_type === 'Fabric' ? 'fabric-t.png' :
                            assets_avaliable.aware_token_type === 'Yarn' ? 'yarn-t.png' :
                                'fibre-t.png'}` // Default for 'Fiber' and 'Pellet'
                    : null;


                mintAwareToken(
                    file,
                    kyc_details_avaliable,
                    assets_avaliable,
                    tracer_avaliable,
                    self_validation_avaliable,
                    company_compliances_avaliable,
                    wallet_avaliable.wallet_address_0x,
                    aw_token_avaliable._awareid,
                    aw_token_avaliable._id.toString(),
                    (success) => {
                        if (success) {
                            console.log("Minting successful");
                            callback(true);
                        } else {
                            console.error("Minting failed");
                            callback(false);
                        }
                    }
                );

            } else {
                callback(false);  // If the balance check fails
            }
        } catch (ex) {
            console.log("Error:", ex);
            loggerhandler.logger.error('Outer Catch - ', ex);
            callback(false);  // Ensure callback is called on error
        }
    },




    // createAwareTokenAsync: async function (aware_token_id, callback) {


    //     try {

    //         try {
    //             connectWeb3 = await new Web3(new Web3.providers.HttpProvider(process.env.BABEL_ENDPOINT));

    //             await connectWeb3.eth.net.isListening();
    //         }
    //         catch {
    //             connectWeb3 = await new Web3(new Web3.providers.HttpProvider(process.env.ALTERNATE_BABEL_ENDPOINT));

    //             await connectWeb3.eth.net.isListening();
    //         }

    //         console.log("connected");

    //         connectWeb3.eth.getBalance(from0xaddress).then(
    //             async function (balance) {

    //                 console.log("balance", balance)

    //                 let iotxBalance = Big(balance).div(10 ** 18);

    //                 console.log("iotxBalance", iotxBalance.toFixed(18))

    //                 if (iotxBalance.toFixed(18) > 0) {

    //                     const aw_token_avaliable = await aw_tokens.findOne({ _id: mongoose.Types.ObjectId(aware_token_id) }).select(["_id", "_awareid"]).catch((ex) => { callback(false); });

    //                     const kyc_details_avaliable = await kyc_details.findOne({ aware_id: aw_token_avaliable._awareid }).select(["_id", "company_name"]).catch((ex) => { callback(false); });

    //                     const wallet_avaliable = await wallets.findOne({ _awareid: aw_token_avaliable._awareid }).select(["wallet_address_0x"]).catch((ex) => { callback(false); })

    //                     const assets_avaliable = await physical_assets.findOne({ _awareid: aw_token_avaliable._awareid, aware_token_id: aw_token_avaliable._id.toString() }).catch((ex) => { callback(false); })

    //                     const tracer_avaliable = await tracer.findOne({ _awareid: aw_token_avaliable._awareid, aware_token_id: aw_token_avaliable._id.toString() }).catch((ex) => { callback(false); })

    //                     const self_validation_avaliable = await self_validation.findOne({ _awareid: aw_token_avaliable._awareid, aware_token_id: aw_token_avaliable._id.toString() }).catch((ex) => { callback(false); })

    //                     const company_compliances_avaliable = await company_compliances.findOne({ _awareid: aw_token_avaliable._awareid, aware_token_id: aw_token_avaliable._id.toString() }).catch((ex) => { callback(false); })


    //                     const file = assets_avaliable.aware_token_type
    //                         ? `uploads/${assets_avaliable.aware_token_type === 'Product' ? 'product-t.png' :
    //                             assets_avaliable.aware_token_type === 'Fabric' ? 'fabric-t.png' :
    //                                 assets_avaliable.aware_token_type === 'Yarn' ? 'yarn-t.png' :
    //                                     'fibre-t.png'}` // Default for 'Fiber' and 'Pellet'
    //                         : null;

    //                     await mintAwareToken(file, kyc_details_avaliable, assets_avaliable, tracer_avaliable, self_validation_avaliable, company_compliances_avaliable, wallet_avaliable.wallet_address_0x, aw_token_avaliable._awareid, aw_token_avaliable._id.toString(),
    //                         async function (response) {

    //                             console.log("response", response)
    //                             if (response == true) {
    //                                 callback(true);
    //                             }
    //                             else {
    //                                 callback(false);
    //                             }
    //                         })

    //                     // await mintAwareToken(file, kyc_details_avaliable, assets_avaliable, tracer_avaliable, self_validation_avaliable, company_compliances_avaliable, wallet_avaliable.wallet_address_0x, aw_token_avaliable._awareid, aw_token_avaliable._id.toString()).catch((ex) => { callback(false); })

    //                     // callback(true);

    //                 }
    //                 else {
    //                     callback(false);
    //                 }
    //             });
    //     }
    //     catch (ex) {
    //         console.log("ex", ex);

    //         callback(false);
    //     }

    // },

    updateAwareTokenAsync: async function (update_aware_token_id, callback) {
        try {
            // Attempt to connect to the main Web3 endpoint, fallback to alternate endpoint
            try {
                console.log("process.env.BABEL_ENDPOINT", process.env.BABEL_ENDPOINT);
                connectWeb3 = new Web3(new Web3.providers.HttpProvider(process.env.BABEL_ENDPOINT));
                await connectWeb3.eth.net.isListening();
            } catch {
                connectWeb3 = new Web3(new Web3.providers.HttpProvider(process.env.ALTERNATE_BABEL_ENDPOINT));
                await connectWeb3.eth.net.isListening();
            }

            console.log("connected");

            // Fetch balance and check if it's greater than 0
            const balance = await connectWeb3.eth.getBalance(from0xaddress);
            const iotxBalance = Big(balance).div(10 ** 18);
            console.log("iotxBalance", iotxBalance.toFixed(18));

            if (parseFloat(iotxBalance.toFixed(18)) > 0) {
                // Fetch token details
                const update_aw_token_avaliable = await update_aw_tokens.findOne({ _id: mongoose.Types.ObjectId(update_aware_token_id) }).select(["_id", "_awareid"]);
                if (!update_aw_token_avaliable) throw new Error("Failed to find token");

                // Fetch associated details in parallel using Promise.all
                const [
                    kyc_details_avaliable,
                    wallet_avaliable,
                    selected_update_aware_token_found,
                    assets_avaliable,
                    tracer_avaliable,
                    self_validation_avaliable,
                    company_compliances_avaliable
                ] = await Promise.all([
                    kyc_details.findOne({ aware_id: update_aw_token_avaliable._awareid }).select(["_id", "company_name"]),
                    wallets.findOne({ _awareid: update_aw_token_avaliable._awareid }).select(["wallet_address_0x"]),
                    selected_update_aware_token.findOne({ _awareid: update_aw_token_avaliable._awareid, update_aware_token_id: update_aw_token_avaliable._id.toString() }),
                    update_physical_asset.findOne({ _awareid: update_aw_token_avaliable._awareid, update_aware_token_id: update_aw_token_avaliable._id.toString() }),
                    update_tracer.findOne({ _awareid: update_aw_token_avaliable._awareid, update_aware_token_id: update_aw_token_avaliable._id.toString() }),
                    update_self_validation.findOne({ _awareid: update_aw_token_avaliable._awareid, update_aware_token_id: update_aw_token_avaliable._id.toString() }),
                    update_company_compliances.findOne({ _awareid: update_aw_token_avaliable._awareid, update_aware_token_id: update_aw_token_avaliable._id.toString() })
                ]);

                // Handle file selection based on the token type
                const file = selected_update_aware_token_found.aware_output_token_type
                    ? `uploads/${selected_update_aware_token_found.aware_output_token_type === 'Product' ? 'product-t.png' :
                        selected_update_aware_token_found.aware_output_token_type === 'Fabric' ? 'fabric-t.png' :
                            selected_update_aware_token_found.aware_output_token_type === 'Yarn' ? 'yarn-t.png' :
                                'fibre-t.png'}` // Default for 'Fiber' and 'Pellet'
                    : null;

                // Call mintUpdateAwareToken with the gathered data
                await mintUpdateAwareToken(file, kyc_details_avaliable, selected_update_aware_token_found, assets_avaliable, tracer_avaliable, self_validation_avaliable, company_compliances_avaliable, wallet_avaliable.wallet_address_0x, update_aw_token_avaliable._awareid, update_aw_token_avaliable._id.toString(), async function (response) {
                    if (response) {
                        console.log("Minting successful");
                        callback(true);
                    } else {
                        console.error("Minting failed");
                        callback(false);
                    }
                });

            } else {
                callback(false); // If the balance check fails
            }
        } catch (ex) {
            console.error("Error while updating aware token:", ex);
            callback(false); // Ensure callback is called on error
        }
    },



    // updateAwareTokenAsync: async function (update_aware_token_id, callback) {


    //     try {


    //         try {
    //             console.log("process.env.BABEL_ENDPOINT", process.env.BABEL_ENDPOINT)
    //             connectWeb3 = await new Web3(new Web3.providers.HttpProvider(process.env.BABEL_ENDPOINT));

    //             await connectWeb3.eth.net.isListening();
    //         }
    //         catch {
    //             connectWeb3 = await new Web3(new Web3.providers.HttpProvider(process.env.ALTERNATE_BABEL_ENDPOINT));

    //             await connectWeb3.eth.net.isListening();
    //         }

    //         console.log("connected");
    //         connectWeb3.eth.getBalance(from0xaddress).then(
    //             async function (balance) {

    //                 let iotxBalance = Big(balance).div(10 ** 18);

    //                 // console.log("iotxBalance", iotxBalance.toFixed(18))

    //                 if (iotxBalance.toFixed(18) > 0) {

    //                     const update_aw_token_avaliable = await update_aw_tokens.findOne({ _id: mongoose.Types.ObjectId(update_aware_token_id) }).select(["_id", "_awareid"]).catch((ex) => { callback(false); });

    //                     const kyc_details_avaliable = await kyc_details.findOne({ aware_id: update_aw_token_avaliable._awareid }).select(["_id", "company_name"]).catch((ex) => { callback(false); });

    //                     const wallet_avaliable = await wallets.findOne({ _awareid: update_aw_token_avaliable._awareid }).select(["wallet_address_0x"]).catch((ex) => { callback(false); })

    //                     var selected_update_aware_token_found = await selected_update_aware_token.findOne({ _awareid: update_aw_token_avaliable._awareid, update_aware_token_id: update_aw_token_avaliable._id.toString() }).catch((ex) => { return res.status(500).jsonp({ status: false, message: ex.toString() }) })

    //                     const assets_avaliable = await update_physical_asset.findOne({ _awareid: update_aw_token_avaliable._awareid, update_aware_token_id: update_aw_token_avaliable._id.toString() }).catch((ex) => { callback(false); })

    //                     const tracer_avaliable = await update_tracer.findOne({ _awareid: update_aw_token_avaliable._awareid, update_aware_token_id: update_aw_token_avaliable._id.toString() }).catch((ex) => { callback(false); })

    //                     const self_validation_avaliable = await update_self_validation.findOne({ _awareid: update_aw_token_avaliable._awareid, update_aware_token_id: update_aw_token_avaliable._id.toString() }).catch((ex) => { callback(false); })

    //                     const company_compliances_avaliable = await update_company_compliances.findOne({ _awareid: update_aw_token_avaliable._awareid, update_aware_token_id: update_aw_token_avaliable._id.toString() }).catch((ex) => { callback(false); })

    //                     const file = selected_update_aware_token_found.aware_output_token_type
    //                         ? `uploads/${selected_update_aware_token_found.aware_output_token_type === 'Product' ? 'product-t.png' :
    //                             selected_update_aware_token_found.aware_output_token_type === 'Fabric' ? 'fabric-t.png' :
    //                                 selected_update_aware_token_found.selected_update_aware_token_found === 'Yarn' ? 'yarn-t.png' :
    //                                     'fibre-t.png'}` // Default for 'Fiber' and 'Pellet'
    //                         : null;


    //                     await mintUpdateAwareToken(file, kyc_details_avaliable, selected_update_aware_token_found, assets_avaliable, tracer_avaliable, self_validation_avaliable, company_compliances_avaliable, wallet_avaliable.wallet_address_0x, update_aw_token_avaliable._awareid, update_aw_token_avaliable._id.toString(),
    //                         async function (response) {

    //                             console.log("mintUpdateAwareToken", response)
    //                             if (response == true) {
    //                                 callback(true);
    //                             }
    //                             else {
    //                                 callback(false);
    //                             }
    //                         })
    //                 }
    //                 else {
    //                     callback(false);
    //                 }
    //             });
    //     }
    //     catch (ex) {
    //         console.log("ex while connectng web3!", ex);

    //         callback(false);
    //     }

    // },


    getBalanceAsync: async function (callback) {
        try {

            var connectWeb3 = null;
            try {
                connectWeb3 = await new Web3(new Web3.providers.HttpProvider(process.env.BABEL_ENDPOINT));
            }
            catch {
                connectWeb3 = await new Web3(new Web3.providers.HttpProvider(process.env.ALTERNATE_BABEL_ENDPOINT));
            }



            const tokenHolder = process.env.ADMIN_WALLET_ADDRESS;

            const tokenHolder_ioaddress = from(tokenHolder).string();

            var balance = await connectWeb3?.eth.getBalance(tokenHolder);

            let iotxBalance = Big(balance).div(10 ** 18);

            callback({ "status": true, "address": tokenHolder_ioaddress, "iotxBalance": iotxBalance.toFixed(18) });

        } catch (ex) {
            callback({ "status": false, "address": null, "iotxBalance": null });

        }
    },
}


const getFileBuffer = async (file) => {
    return new Promise((resolve, reject) => {
        try {
            let reader = new FileReader();
            reader.readAsArrayBuffer(file);
            resolve(reader);
        }
        catch (ex) {
            reject();
        }
    });
};

// const convert = (imgPath, filename) => {

//     console.log(imgPath)
//     console.log(filename)

//     return new Promise(async function (resolve, reject) {

//         // fs.
//         // read image file
//         fs.readFile(imgPath, async (err, data) => {
//             // error handle
//             if (err) {
//                 reject()
//             }


//             const blob = new Blob([data])


//             // var fileobj = new fs([blob], "instanced", {type: 'image/png'});
//             //      fileobj.path = "instancedobject.png";

//             //      console.log("fileobj",fileobj)
//             // get image file extension name
//             const extensionName = path.extname(imgPath);

//             var newfile = blobToFile(blob, filename, extensionName, imgPath);

//             console.log({newfile});

//             // // convert image file to base64-encoded string
//             // const base64Image = Buffer.from(data, 'binary').toString('base64');

//             // // combine all strings
//             // const base64ImageStr = `data:image/${extensionName.split('.').pop()};base64,${base64Image}`;

//             // let imageStr = base64ImageStr.split(';base64,').pop();

//             // console.log("imageStr",imageStr);
//             // fs.writeFile(filename, imageStr, {encoding: 'base64'}, function(err) {
//             //     console.log('File created',res);


//             // });

//             // const blob = new Blob();

//             // const convertedtoblob = blob.stream(base64Image);
//             // console.log("convertedtoblob",convertedtoblob)
//             // // const b64s = await b.toBase64(blob);

//             // console.log("blob",blob); // true



//             resolve(newfile);
//         })
//     })
// }


const convert = (imgPath, filename) => {
    return new Promise((resolve, reject) => {
        fs.readFile(imgPath, (err, data) => {
            if (err) {
                // Provide meaningful rejection message
                return reject(new Error(`Failed to read the file: ${err.message}`));
            }

            try {
                const blob = new Blob([data]);
                const extensionName = path.extname(imgPath);

                const newfile = blobToFile(blob, filename, extensionName, imgPath);
                console.log({ newfile });

                resolve(newfile);
            } catch (err) {
                // Handle unexpected errors
                reject(new Error(`Error processing the file: ${err.message}`));
            }
        });
    });
};


var nonce = 0;
const mintAwareToken = async (file, kyc_details_avaliable, assets_avaliable, tracer_avaliable, self_validation_avaliable, company_compliances_avaliable, useraddress, _awareid, aware_token_id, callback) => {

    // Helper function to extract document names
    const extractDocuments = (arr) => arr.map(x => x.documentname);

    var valueChainProcess = [...assets_avaliable.value_chain_process_main.map(x => x.name), ...assets_avaliable.value_chain_process_sub.map(x => x.name)];
    var environmentalScopeCertificate = extractDocuments(company_compliances_avaliable.environmental_scope_certificates);
    var socialComplianceCertificate = extractDocuments(company_compliances_avaliable.social_compliance_certificates);
    var chemicalComplianceCertificate = extractDocuments(company_compliances_avaliable.chemical_compliance_certificates);

    const metadataJSON = generateMetadata("aware-20221012", {
        version: "aware-20221012",
        name: assets_avaliable._awareid,
        description: aware_token_id.toString(),
        date: new Date().toISOString(),
        awareTokenType: assets_avaliable.aware_token_type,
        awareAssetId: assets_avaliable.aware_asset_id,
        productionFacility: assets_avaliable.production_facility,
        producer: kyc_details_avaliable.company_name,
        batchNo: assets_avaliable.production_lot,
        ProductionQty: assets_avaliable.quantity ? assets_avaliable.quantity : '',
        weightInKgs: assets_avaliable.weight,
        valueChainProcess: valueChainProcess,
        materialSpecs: assets_avaliable.material_specs,
        color: assets_avaliable.main_color,
        sustainableProcessClaim: assets_avaliable.sustainable_process_claim == true ? assets_avaliable.sustainable_process_certificates : [],
        wetProcessing: assets_avaliable.wet_processing == true ? assets_avaliable.wet_processing_arr : [],
        tracer: {
            "tracerAdded": tracer_avaliable.tracer_added == true ? "Yes" : "No",
            "typeofTracer": tracer_avaliable.aware_tc_checked == true ? "aware" : "custom",
            "scandate": tracer_avaliable.aware_date ? tracer_avaliable.aware_date.toString() : tracer_avaliable.custom_date ? tracer_avaliable.custom_date.toString() : ''
        },
        selfValidationCertificate: ['requested'],
        environmentalScopeCertificate: environmentalScopeCertificate,
        socialComplianceCertificate: socialComplianceCertificate,
        chemicalComplianceCertificate: chemicalComplianceCertificate,
        previousTokenDetail: []
    });

    console.log("metadataJSON", metadataJSON);

    const file_read = fs.readFileSync(file); // Read file into a buffer
    console.log({ file_read });

    const contentHash = sha256FromBuffer(Buffer.from(file_read));
    const metadataHash = sha256FromBuffer(Buffer.from(metadataJSON));

    console.log({ contentHash });
    console.log({ metadataHash });

    // Upload files to fleek
    const data = {
        "file": file,
        "metadata": metadataJSON
    };

    let upload = await postToFleekAsync(data);


    console.log({ upload });

    if (upload == null || !upload.data?.fileUrl || !upload.data?.metadataUrl) {
        callback(false);
        return;
    }

    // Collect fileUrl and metadataUrl from Fleek
    const { fileUrl, metadataUrl } = upload.data;


    // Construct mediaData object
    const awareData = constructAwareData(
        fileUrl,
        metadataUrl,
        contentHash,
        metadataHash
    );

    console.log("awareData", awareData);

    const privatekey = process.env.ADMIN_PRIVATE_KEY;
    var non = await connectWeb3.eth.getTransactionCount(from0xaddress);
    nonce = (nonce === non) ? nonce + 1 : non;

    const contractAddress = process.env.CONTRACT_ADDRESS;
    var contract = new connectWeb3.eth.Contract(abiArray, contractAddress, { from: from0xaddress });

    var amountInUint = assets_avaliable.weight;

    // var gas_amount = await contract.methods.mint(awareData, useraddress, amountInUint).estimateGas({ from: from0xaddress });
    // var tweenty_perc_increase = Number(gas_amount) * 0.2;
    // gas_amount = Math.ceil(Number(gas_amount) + tweenty_perc_increase);

    // var gas_price = await connectWeb3.eth.getGasPrice();

    let gas_amount;
    let gas_price;
    try {
        // First attempt to estimate gas
        gas_amount = await contract.methods.mint(awareData, useraddress, amountInUint).estimateGas({ from: from0xaddress });
        var tweenty_perc_increase = Number(gas_amount) * 0.2;
        gas_amount = Math.ceil(Number(gas_amount) + tweenty_perc_increase);

        gas_price = await connectWeb3.eth.getGasPrice();
    } catch (error) {
        console.log("Error estimating gas", error);
        loggerhandler.logger.error('Error estimating gas - ', error);

        callback(false);
        return;
    }

    const txConfig = {
        from: from0xaddress,
        to: contractAddress,
        gasPrice: gas_price,
        gas: gas_amount,
        nonce: nonce,
        data: contract.methods.mint(awareData, useraddress, amountInUint).encodeABI(),
    };

    console.log("bangtxConfig", txConfig);

    //original
    // connectWeb3.eth.accounts.signTransaction(txConfig, privatekey, async function (err, signedTx) {
    //     if (err) {
    //         callback(false);
    //         return;
    //     }

    //     try {
    //         connectWeb3.eth.sendSignedTransaction(signedTx.rawTransaction)
    //             .on("receipt", async function (receipt) {
    //                 console.log("Tx Hash (Receipt): ", receipt);

    //                 await transaction_history.create({
    //                     _awareid: _awareid,
    //                     aware_token_id: aware_token_id,
    //                     transactionIndex: receipt.transactionIndex,
    //                     transactionHash: receipt.transactionHash,
    //                     blockHash: receipt.blockHash,
    //                     blockNumber: receipt.blockNumber,
    //                     from: receipt.from,
    //                     to: receipt.to,
    //                     cumulativeGasUsed: receipt.cumulativeGasUsed,
    //                     gasUsed: receipt.gasUsed,
    //                     contractAddress: receipt.contractAddress,
    //                     logsBloom: receipt.logsBloom,
    //                     logs: receipt.logs,
    //                     status: receipt.status
    //                 });

    //                 await sleep(10000);

    //                 const query = gql`{
    //                     awareTokens(
    //                       where: { owner: "${useraddress.toLowerCase()}" }
    //                       orderBy: createdAtTimestamp
    //                       orderDirection: desc
    //                       first: 1
    //                     ) {
    //                       id
    //                       owner {
    //                         id
    //                       }
    //                       creator {
    //                         id
    //                       }
    //                       contentURI
    //                       metadataURI
    //                       amount
    //                       createdAtTimestamp 
    //                     }
    //                 }`;

    //                 var result = await request(process.env.SUBGRAPH_URL, query);

    //                 const postID = result.awareTokens[0].id;

    //                 console.log("post", postID);

    //                 let response = null;
    //                 let metadata = null;
    //                 let startTime = null;
    //                 let endTime = null;
    //                 let attempt = 0; // Initialize attempt counter
    //                 const maxRetries = 60; // Set the maximum number of retries
    //                 const retryDelay = 5000; // Retry delay in milliseconds
    //                 const dnsLookupTime = 0;
    //                 const connectionTime = 0;


    //                 while (attempt < maxRetries) {
    //                     try {
    //                         console.log(`Attempt ${attempt + 1} to fetch metadata...`);

    //                         startTime = performance.now();
    //                         response = await fetch(result.awareTokens[0].metadataURI, { method: 'HEAD' });

    //                         // Check if the response is not OK
    //                         if (!response.ok) {
    //                             throw new Error(`HTTP error! status: ${response.status}`);
    //                         }

    //                         endTime = performance.now();

    //                         metadata = await axios.get(result.awareTokens[0].metadataURI);

    //                         console.log(`HTTP/${response.status}`);
    //                         console.log('Headers:');
    //                         response.headers.forEach((value, key) => {
    //                             console.log(`${key}: ${value}`);
    //                         });

    //                         console.log(`\nRequest Timing: ${(endTime - startTime).toFixed(2)}ms`);

    //                         // **Server-Timing**
    //                         if (response.headers.get('server-timing')) {
    //                             console.log('Server Timing Info:', response.headers.get('server-timing'));
    //                         }

    //                         // **Cloudflare Request ID**
    //                         if (response.headers.get('cf-ray')) {
    //                             console.log('Cloudflare Request ID:', response.headers.get('cf-ray'));
    //                         }

    //                         // **Forwarded Information**
    //                         if (response.headers.get('x-forwarded-for')) {
    //                             console.log('Forwarded For (Client IP):', response.headers.get('x-forwarded-for'));
    //                         }
    //                         if (response.headers.get('x-forwarded-proto')) {
    //                             console.log('Forwarded Protocol:', response.headers.get('x-forwarded-proto'));
    //                         }
    //                         if (response.headers.get('via')) {
    //                             console.log('Via (Proxy Info):', response.headers.get('via'));
    //                         }

    //                         // **Response Size**
    //                         if (response.headers.get('content-length')) {
    //                             console.log('Response Size (Content-Length):', response.headers.get('content-length'), 'bytes');
    //                         }

    //                         // **Latency Breakdown**
    //                         console.log('Latency Breakdown:');
    //                         console.log(`- DNS Lookup: ${(dnsLookupTime || 0).toFixed(2)}ms`);
    //                         console.log(`- Connection Time: ${(connectionTime || 0).toFixed(2)}ms`);
    //                         console.log(`- Transfer Time: ${(endTime - startTime).toFixed(2)}ms`);

    //                         // Exit loop if fetch is successful
    //                         break;
    //                     } catch (error) {
    //                         console.error(`Error fetching metadata on attempt ${attempt + 1}:`, error.message);

    //                         endTime = performance.now();

    //                         console.log(`HTTP/${response.status}`);
    //                         console.log('Headers:');
    //                         response.headers.forEach((value, key) => {
    //                             console.log(`${key}: ${value}`);
    //                         });

    //                         console.log(`\nRequest Timing: ${(endTime - startTime).toFixed(2)}ms`);

    //                         // **Server-Timing**
    //                         if (response.headers.get('server-timing')) {
    //                             console.log('Server Timing Info:', response.headers.get('server-timing'));
    //                         }

    //                         // **Cloudflare Request ID**
    //                         if (response.headers.get('cf-ray')) {
    //                             console.log('Cloudflare Request ID:', response.headers.get('cf-ray'));
    //                         }

    //                         // **Forwarded Information**
    //                         if (response.headers.get('x-forwarded-for')) {
    //                             console.log('Forwarded For (Client IP):', response.headers.get('x-forwarded-for'));
    //                         }
    //                         if (response.headers.get('x-forwarded-proto')) {
    //                             console.log('Forwarded Protocol:', response.headers.get('x-forwarded-proto'));
    //                         }
    //                         if (response.headers.get('via')) {
    //                             console.log('Via (Proxy Info):', response.headers.get('via'));
    //                         }

    //                         // **Response Size**
    //                         if (response.headers.get('content-length')) {
    //                             console.log('Response Size (Content-Length):', response.headers.get('content-length'), 'bytes');
    //                         }

    //                         // **Latency Breakdown**
    //                         console.log('Latency Breakdown:');
    //                         console.log(`- DNS Lookup: ${(dnsLookupTime || 0).toFixed(2)}ms`);
    //                         console.log(`- Connection Time: ${(connectionTime || 0).toFixed(2)}ms`);
    //                         console.log(`- Transfer Time: ${(endTime - startTime).toFixed(2)}ms`);

    //                         attempt++;

    //                         if (attempt < maxRetries) {
    //                             console.log(`Retrying after ${retryDelay}ms...`);
    //                             await new Promise((resolve) => setTimeout(resolve, retryDelay));
    //                         } else {
    //                             console.log("Max retries reached. Returning callback(false).");
    //                             callback(false);
    //                             return;
    //                         }
    //                     }
    //                 }

    //                 console.log("postID", result);

    //                 console.log(metadata.data.description, aware_token_id);

    //                 if (metadata.data.description == aware_token_id) {

    //                     console.log("IN");
    //                     await aw_tokens.findOneAndUpdate({ _id: aware_token_id },
    //                         {
    //                             blockchain_id: postID,
    //                             status: 'Approved',
    //                             type_of_token: assets_avaliable.aware_token_type,
    //                             total_tokens: Number(assets_avaliable.weight),
    //                             avaliable_tokens: Number(assets_avaliable.weight),
    //                         }, { new: true },
    //                     ).catch((ex) => {
    //                         console.log("ex", ex);
    //                         callback(false);
    //                     });

    //                     callback(true);
    //                 } else {
    //                     console.log("SubGraph or Fleek issue");
    //                     callback(false);
    //                 }

    //             })
    //             .on("error", async function (e) {
    //                 console.log("eeeeeeeeeeeeeee", e);
    //                 callback(false);
    //             });
    //     } catch (ex) {
    //         console.log("ex", ex);
    //         callback(false);
    //     }
    // });



    let attempt = 0;
    const maxRetries = 5; // Set the maximum number of retries in case of failure
    const retryDelay = 5000; // Retry delay in milliseconds

    const sendTransaction = async () => {
        try {
            connectWeb3.eth.accounts.signTransaction(txConfig, privatekey, async function (err, signedTx) {
                if (err) {
                    callback(false);
                    return;
                }

                try {
                    connectWeb3.eth.sendSignedTransaction(signedTx.rawTransaction)
                        .on("receipt", async function (receipt) {
                            console.log("Tx Hash (Receipt): ", receipt);

                            await transaction_history.create({
                                _awareid: _awareid,
                                aware_token_id: aware_token_id,
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
                                status: receipt.status
                            });

                            await sleep(50000);

                            const query = gql`{
                                awareTokens(
                                  where: { owner: "${useraddress.toLowerCase()}" }
                                  orderBy: createdAtTimestamp
                                  orderDirection: desc
                                  first: 1
                                ) {
                                  id
                                  owner {
                                    id
                                  }
                                  creator {
                                    id
                                  }
                                  contentURI
                                  metadataURI
                                  amount
                                  createdAtTimestamp 
                                }
                            }`;

                            var result = await request(process.env.SUBGRAPH_URL, query);

                            const postID = result.awareTokens[0].id;

                            console.log("post", postID);

                            let response = null;
                            let metadata = null;
                            let startTime = null;
                            let endTime = null;
                            let attempt = 0; // Initialize attempt counter
                            const maxRetries = 60; // Set the maximum number of retries
                            const retryDelay = 5000; // Retry delay in milliseconds
                            const dnsLookupTime = 0;
                            const connectionTime = 0;


                            while (attempt < maxRetries) {
                                try {
                                    console.log(`Attempt ${attempt + 1} to fetch metadata...`);

                                    startTime = performance.now();
                                    response = await fetch(result.awareTokens[0].metadataURI, { method: 'HEAD' });

                                    // Check if the response is not OK
                                    if (!response.ok) {
                                        throw new Error(`HTTP error! status: ${response.status}`);
                                    }

                                    endTime = performance.now();

                                    metadata = await axios.get(result.awareTokens[0].metadataURI);

                                    console.log(`HTTP/${response.status}`);
                                    console.log('Headers:');
                                    response.headers.forEach((value, key) => {
                                        console.log(`${key}: ${value}`);
                                    });

                                    console.log(`\nRequest Timing: ${(endTime - startTime).toFixed(2)}ms`);

                                    // **Server-Timing**
                                    if (response.headers.get('server-timing')) {
                                        console.log('Server Timing Info:', response.headers.get('server-timing'));
                                    }

                                    // **Cloudflare Request ID**
                                    if (response.headers.get('cf-ray')) {
                                        console.log('Cloudflare Request ID:', response.headers.get('cf-ray'));
                                    }

                                    // **Forwarded Information**
                                    if (response.headers.get('x-forwarded-for')) {
                                        console.log('Forwarded For (Client IP):', response.headers.get('x-forwarded-for'));
                                    }
                                    if (response.headers.get('x-forwarded-proto')) {
                                        console.log('Forwarded Protocol:', response.headers.get('x-forwarded-proto'));
                                    }
                                    if (response.headers.get('via')) {
                                        console.log('Via (Proxy Info):', response.headers.get('via'));
                                    }

                                    // **Response Size**
                                    if (response.headers.get('content-length')) {
                                        console.log('Response Size (Content-Length):', response.headers.get('content-length'), 'bytes');
                                    }

                                    // **Latency Breakdown**
                                    console.log('Latency Breakdown:');
                                    console.log(`- DNS Lookup: ${(dnsLookupTime || 0).toFixed(2)}ms`);
                                    console.log(`- Connection Time: ${(connectionTime || 0).toFixed(2)}ms`);
                                    console.log(`- Transfer Time: ${(endTime - startTime).toFixed(2)}ms`);

                                    // Exit loop if fetch is successful
                                    break;
                                } catch (error) {
                                    console.error(`Error fetching metadata on attempt ${attempt + 1}:`, error.message);
                                    loggerhandler.logger.error(`Error fetching metadata on attempt ${attempt + 1}:`, error.message);



                                    endTime = performance.now();

                                    console.log(`HTTP/${response.status}`);
                                    console.log('Headers:');
                                    response.headers.forEach((value, key) => {
                                        console.log(`${key}: ${value}`);
                                    });

                                    console.log(`\nRequest Timing: ${(endTime - startTime).toFixed(2)}ms`);

                                    // **Server-Timing**
                                    if (response.headers.get('server-timing')) {
                                        console.log('Server Timing Info:', response.headers.get('server-timing'));
                                    }

                                    // **Cloudflare Request ID**
                                    if (response.headers.get('cf-ray')) {
                                        console.log('Cloudflare Request ID:', response.headers.get('cf-ray'));
                                    }

                                    // **Forwarded Information**
                                    if (response.headers.get('x-forwarded-for')) {
                                        console.log('Forwarded For (Client IP):', response.headers.get('x-forwarded-for'));
                                    }
                                    if (response.headers.get('x-forwarded-proto')) {
                                        console.log('Forwarded Protocol:', response.headers.get('x-forwarded-proto'));
                                    }
                                    if (response.headers.get('via')) {
                                        console.log('Via (Proxy Info):', response.headers.get('via'));
                                    }

                                    // **Response Size**
                                    if (response.headers.get('content-length')) {
                                        console.log('Response Size (Content-Length):', response.headers.get('content-length'), 'bytes');
                                    }

                                    // **Latency Breakdown**
                                    console.log('Latency Breakdown:');
                                    console.log(`- DNS Lookup: ${(dnsLookupTime || 0).toFixed(2)}ms`);
                                    console.log(`- Connection Time: ${(connectionTime || 0).toFixed(2)}ms`);
                                    console.log(`- Transfer Time: ${(endTime - startTime).toFixed(2)}ms`);

                                    attempt++;

                                    if (attempt < maxRetries) {
                                        console.log(`Retrying after ${retryDelay}ms...`);
                                        await new Promise((resolve) => setTimeout(resolve, retryDelay));
                                    } else {
                                        console.log("Max retries reached. Returning callback(false).");
                                        callback(false);
                                        return;
                                    }
                                }
                            }

                            console.log("postID", result);
                            console.log("NEW ISSUE OF METADATA", metadata)

                            // console.log(metadata.data.description, aware_token_id);

                            if (metadata.data.description == aware_token_id) {

                                console.log("IN");
                                await aw_tokens.findOneAndUpdate({ _id: aware_token_id },
                                    {
                                        blockchain_id: postID,
                                        status: 'Approved',
                                        type_of_token: assets_avaliable.aware_token_type,
                                        total_tokens: Number(assets_avaliable.weight),
                                        avaliable_tokens: Number(assets_avaliable.weight),
                                    }, { new: true },
                                ).catch((ex) => {
                                    console.log("ex", ex);
                                    callback(false);
                                });

                                callback(true);
                            } else {
                                console.log("SubGraph or Fleek issue");
                                callback(false);
                            }
                        })
                        .on("error", async function (e) {
                            console.log("Error sending transaction", e);

                            loggerhandler.logger.error('Error sending transaction" - ', e);


                            if (attempt < maxRetries) {
                                attempt++;
                                console.log(`Retrying transaction, attempt ${attempt}`);
                                await new Promise(resolve => setTimeout(resolve, retryDelay));
                                sendTransaction();
                            } else {
                                console.log("Max retries reached, transaction failed.");
                                callback(false);
                            }
                        });
                } catch (ex) {
                    console.log("Error in signing or sending transaction", ex);
                    loggerhandler.logger.error('Error in signing or sending transaction" - ', ex);

                    callback(false);
                }
            });
        } catch (ex) {
            console.log("Error in sending transaction", ex);
            loggerhandler.logger.error('Error in sending transaction" - ', ex);

            callback(false);
        }
    };

    // Send transaction with retry mechanism
    sendTransaction();
};

// var nonce = 0;
// const mintAwareToken = async (file, kyc_details_avaliable, assets_avaliable, tracer_avaliable, self_validation_avaliable, company_compliances_avaliable, useraddress, _awareid, aware_token_id, callback) => {

//     // Helper function to extract document names
//     const extractDocuments = (arr) => arr.map(x => x.documentname);

//     var valueChainProcess = [...assets_avaliable.value_chain_process_main.map(x => x.name), ...assets_avaliable.value_chain_process_sub.map(x => x.name)];
//     var environmentalScopeCertificate = extractDocuments(company_compliances_avaliable.environmental_scope_certificates);
//     var socialComplianceCertificate = extractDocuments(company_compliances_avaliable.social_compliance_certificates);
//     var chemicalComplianceCertificate = extractDocuments(company_compliances_avaliable.chemical_compliance_certificates);

//     const metadataJSON = generateMetadata("aware-20221012", {
//         version: "aware-20221012",
//         name: assets_avaliable._awareid,
//         description: aware_token_id.toString(),
//         date: new Date().toISOString(),
//         awareTokenType: assets_avaliable.aware_token_type,
//         awareAssetId: assets_avaliable.aware_asset_id,
//         productionFacility: assets_avaliable.production_facility,
//         producer: kyc_details_avaliable.company_name,
//         batchNo: assets_avaliable.production_lot,
//         ProductionQty: assets_avaliable.quantity ? assets_avaliable.quantity : '',
//         weightInKgs: assets_avaliable.weight,
//         valueChainProcess: valueChainProcess,
//         materialSpecs: assets_avaliable.material_specs,
//         color: assets_avaliable.main_color,
//         sustainableProcessClaim: assets_avaliable.sustainable_process_claim == true ? assets_avaliable.sustainable_process_certificates : [],
//         wetProcessing: assets_avaliable.wet_processing == true ? assets_avaliable.wet_processing_arr : [],
//         tracer: {
//             "tracerAdded": tracer_avaliable.tracer_added == true ? "Yes" : "No",
//             "typeofTracer": tracer_avaliable.aware_tc_checked == true ? "aware" : "custom",
//             "scandate": tracer_avaliable.aware_date ? tracer_avaliable.aware_date.toString() : tracer_avaliable.custom_date ? tracer_avaliable.custom_date.toString() : ''
//         },
//         selfValidationCertificate: ['requested'],
//         environmentalScopeCertificate: environmentalScopeCertificate,
//         socialComplianceCertificate: socialComplianceCertificate,
//         chemicalComplianceCertificate: chemicalComplianceCertificate,
//         previousTokenDetail: []
//     });

//     console.log("metadataJSON", metadataJSON);

//     const file_read = fs.readFileSync(file); // Read file into a buffer
//     console.log({ file_read });

//     const contentHash = sha256FromBuffer(Buffer.from(file_read));
//     const metadataHash = sha256FromBuffer(Buffer.from(metadataJSON));

//     console.log({ contentHash });
//     console.log({ metadataHash });

//     // Upload files to fleek
//     const data = {
//         "file": file,
//         "metadata": metadataJSON
//     };

//     let upload = await postToFleekAsync(data);


//     console.log({ upload });

//     if (upload == null || !upload.data?.fileUrl || !upload.data?.metadataUrl) {
//         callback(false);
//         return;
//     }

//     // Collect fileUrl and metadataUrl from Fleek
//     const { fileUrl, metadataUrl } = upload.data;


//     // Construct mediaData object
//     const awareData = constructAwareData(
//         fileUrl,
//         metadataUrl,
//         contentHash,
//         metadataHash
//     );

//     console.log("awareData", awareData);

//     const privatekey = process.env.ADMIN_PRIVATE_KEY;
//     var non = await connectWeb3.eth.getTransactionCount(from0xaddress);
//     nonce = (nonce === non) ? nonce + 1 : non;

//     const contractAddress = process.env.CONTRACT_ADDRESS;
//     var contract = new connectWeb3.eth.Contract(abiArray, contractAddress, { from: from0xaddress });

//     var amountInUint = assets_avaliable.weight;

//     let gas_amount;
//     let gas_price;
//     try {
//         // First attempt to estimate gas
//         gas_amount = await contract.methods.mint(awareData, useraddress, amountInUint).estimateGas({ from: from0xaddress });
//         var tweenty_perc_increase = Number(gas_amount) * 0.2;
//         gas_amount = Math.ceil(Number(gas_amount) + tweenty_perc_increase);

//         gas_price = await connectWeb3.eth.getGasPrice();
//     } catch (error) {
//         console.log("Error estimating gas", error);
//         loggerhandler.logger.error('Error estimating gas - ', error);

//         callback(false);
//         return;
//     }

//     const txConfig = {
//         from: from0xaddress,
//         to: contractAddress,
//         gasPrice: gas_price,
//         gas: gas_amount,
//         nonce: nonce,
//         data: contract.methods.mint(awareData, useraddress, amountInUint).encodeABI(),
//     };

//     console.log("bangtxConfig", txConfig);

//     let attempt = 0;
//     const maxRetries = 5; // Set the maximum number of retries in case of failure
//     const retryDelay = 5000; // Retry delay in milliseconds

//     const sendTransaction = async () => {
//         try {
//             connectWeb3.eth.accounts.signTransaction(txConfig, privatekey, async function (err, signedTx) {
//                 if (err) {
//                     callback(false);
//                     return;
//                 }

//                 try {
//                     connectWeb3.eth.sendSignedTransaction(signedTx.rawTransaction)
//                         .on("receipt", async function (receipt) {
//                             console.log("Tx Hash (Receipt): ", receipt);

//                             await transaction_history.create({
//                                 _awareid: _awareid,
//                                 aware_token_id: aware_token_id,
//                                 transactionIndex: receipt.transactionIndex,
//                                 transactionHash: receipt.transactionHash,
//                                 blockHash: receipt.blockHash,
//                                 blockNumber: receipt.blockNumber,
//                                 from: receipt.from,
//                                 to: receipt.to,
//                                 cumulativeGasUsed: receipt.cumulativeGasUsed,
//                                 gasUsed: receipt.gasUsed,
//                                 contractAddress: receipt.contractAddress,
//                                 logsBloom: receipt.logsBloom,
//                                 logs: receipt.logs,
//                                 status: receipt.status
//                             });

//                             await sleep(50000);

//                             const query = gql`{
//                                 awareTokens(
//                                   where: { owner: "${useraddress.toLowerCase()}" }
//                                   orderBy: createdAtTimestamp
//                                   orderDirection: desc
//                                   first: 1
//                                 ) {
//                                   id
//                                   owner {
//                                     id
//                                   }
//                                   creator {
//                                     id
//                                   }
//                                   contentURI
//                                   metadataURI
//                                   amount
//                                   createdAtTimestamp 
//                                 }
//                             }`;

//                             var result = await request(process.env.SUBGRAPH_URL, query);

//                             const postID = result.awareTokens[0].id;

//                             console.log("post", postID);

//                             let response = null;
//                             let metadata = null;
//                             let startTime = null;
//                             let endTime = null;
//                             let attempt = 0; // Initialize attempt counter
//                             const maxRetries = 60; // Set the maximum number of retries
//                             const retryDelay = 5000; // Retry delay in milliseconds
//                             const dnsLookupTime = 0;
//                             const connectionTime = 0;


//                             while (attempt < maxRetries) {
//                                 try {
//                                     console.log(`Attempt ${attempt + 1} to fetch metadata...`);

//                                     startTime = performance.now();
//                                     response = await fetch(result.awareTokens[0].metadataURI, { method: 'HEAD' });

//                                     // Check if the response is not OK
//                                     if (!response.ok) {
//                                         throw new Error(`HTTP error! status: ${response.status}`);
//                                     }

//                                     endTime = performance.now();

//                                     metadata = await axios.get(result.awareTokens[0].metadataURI);

                                  
//                                     // Exit loop if fetch is successful
//                                     break;
//                                 } catch (error) {
//                                     console.error(`Error fetching metadata on attempt ${attempt + 1}:`, error.message);
//                                     loggerhandler.logger.error(`Error fetching metadata on attempt ${attempt + 1}:`, error.message);

//                                     endTime = performance.now();

//                                     response.headers.forEach((value, key) => {
//                                         console.log(`${key}: ${value}`);
//                                     });

//                                     attempt++;

//                                     if (attempt < maxRetries) {
//                                         await new Promise((resolve) => setTimeout(resolve, retryDelay));
//                                     } else {
//                                         callback(false);
//                                         return;
//                                     }
//                                 }
//                             }

//                             console.log("postID", result);
//                             console.log("NEW ISSUE OF METADATA", metadata)

//                             // console.log(metadata.data.description, aware_token_id);

//                             if (metadata.data.description == aware_token_id) {

//                                 console.log("IN");
//                                 await aw_tokens.findOneAndUpdate({ _id: aware_token_id },
//                                     {
//                                         blockchain_id: postID,
//                                         status: 'Approved',
//                                         type_of_token: assets_avaliable.aware_token_type,
//                                         total_tokens: Number(assets_avaliable.weight),
//                                         avaliable_tokens: Number(assets_avaliable.weight),
//                                     }, { new: true },
//                                 ).catch((ex) => {
//                                     console.log("ex", ex);
//                                     callback(false);
//                                 });

//                                 callback(true);
//                             } else {
//                                 console.log("SubGraph or Fleek issue");
//                                 callback(false);
//                             }
//                         })
//                         .on("error", async function (e) {
//                             console.log("Error sending transaction", e);

//                             loggerhandler.logger.error('Error sending transaction" - ', e);


//                             if (attempt < maxRetries) {
//                                 attempt++;
//                                 console.log(`Retrying transaction, attempt ${attempt}`);
//                                 await new Promise(resolve => setTimeout(resolve, retryDelay));
//                                 sendTransaction();
//                             } else {
//                                 console.log("Max retries reached, transaction failed.");
//                                 callback(false);
//                             }
//                         });
//                 } catch (ex) {
//                     console.log("Error in signing or sending transaction", ex);
//                     loggerhandler.logger.error('Error in signing or sending transaction" - ', ex);

//                     callback(false);
//                 }
//             });
//         } catch (ex) {
//             console.log("Error in sending transaction", ex);
//             loggerhandler.logger.error('Error in sending transaction" - ', ex);

//             callback(false);
//         }
//     };

//     // Send transaction with retry mechanism
//     sendTransaction();
// };



// var nonce = 0;
// const mintAwareToken = async (file, kyc_details_avaliable, assets_avaliable, tracer_avaliable, self_validation_avaliable, company_compliances_avaliable, useraddress, _awareid, aware_token_id, callback) => {

//     // return new Promise(async function (resolve, reject) {

//     var valueChainProcess = [];

//     assets_avaliable.value_chain_process_main.forEach(x => {
//         valueChainProcess.push(x.name);
//     })
//     assets_avaliable.value_chain_process_sub.forEach(x => {
//         valueChainProcess.push(x.name);
//     })

//     var environmentalScopeCertificate = [];
//     company_compliances_avaliable.environmental_scope_certificates.forEach(x => {
//         environmentalScopeCertificate.push(x.documentname);
//     })

//     var socialComplianceCertificate = [];
//     company_compliances_avaliable.social_compliance_certificates.forEach(x => {
//         socialComplianceCertificate.push(x.documentname);
//     })

//     var chemicalComplianceCertificate = [];
//     company_compliances_avaliable.chemical_compliance_certificates.forEach(x => {
//         chemicalComplianceCertificate.push(x.documentname);
//     })


//     const metadataJSON = generateMetadata("aware-20221012", {
//         version: "aware-20221012",
//         name: assets_avaliable._awareid,
//         description: aware_token_id.toString(),
//         date: new Date().toISOString(),
//         awareTokenType: assets_avaliable.aware_token_type,
//         awareAssetId: assets_avaliable.aware_asset_id,
//         productionFacility: assets_avaliable.production_facility,
//         producer: kyc_details_avaliable.company_name,
//         batchNo: assets_avaliable.production_lot,
//         ProductionQty: assets_avaliable.quantity ? assets_avaliable.quantity : '',
//         weightInKgs: assets_avaliable.weight,
//         valueChainProcess: valueChainProcess,
//         materialSpecs: assets_avaliable.material_specs,
//         color: assets_avaliable.main_color,
//         sustainableProcessClaim: assets_avaliable.sustainable_process_claim == true ? assets_avaliable.sustainable_process_certificates : [],
//         wetProcessing: assets_avaliable.wet_processing == true ? assets_avaliable.wet_processing_arr : [],
//         tracer: {
//             "tracerAdded": tracer_avaliable.tracer_added == true ? "Yes" : "No",
//             "typeofTracer": tracer_avaliable.aware_tc_checked == true ? "aware" : "custom",
//             "scandate": tracer_avaliable.aware_date ? tracer_avaliable.aware_date.toString() : tracer_avaliable.custom_date ? tracer_avaliable.custom_date.toString() : ''
//         },
//         selfValidationCertificate: ['requested'],
//         environmentalScopeCertificate: environmentalScopeCertificate,
//         socialComplianceCertificate: socialComplianceCertificate,
//         chemicalComplianceCertificate: chemicalComplianceCertificate,
//         previousTokenDetail: []
//     });

//     console.log("metadataJSON", metadataJSON)

//     const file_read = fs.readFileSync(file); // Read file into a buffer

//     console.log({ file_read });


//     const contentHash = sha256FromBuffer(Buffer.from(file_read));
//     const metadataHash = sha256FromBuffer(Buffer.from(metadataJSON));

//     console.log({ contentHash });
//     console.log({ metadataHash });

//     // Upload files to fleek
//     const data = {
//         "file": file,
//         "metadata": metadataJSON
//     }


//     const upload = await postToFleekAsync(data).catch((ex) => { callback(false); })

//     console.log({ upload });

//     // Collect fileUrl and metadataUrl from Fleek
//     const { fileUrl, metadataUrl } = upload.data;

//     // // Construct mediaData object
//     const awareData = constructAwareData(
//         fileUrl,
//         metadataUrl,
//         contentHash,
//         metadataHash
//     );

//     console.log("awareData", awareData)


//     const privatekey = process.env.ADMIN_PRIVATE_KEY;

//     var non = await connectWeb3.eth.getTransactionCount(from0xaddress);
//     if (nonce == non) {
//         nonce = nonce + 1;
//     }
//     else {
//         nonce = non;
//     }

//     const contractAddress = process.env.CONTRACT_ADDRESS;
//     var contract = new connectWeb3.eth.Contract(abiArray, contractAddress, { from: from0xaddress })
//     //var amountInUint = connectWeb3.utils.toWei(assets_avaliable.weight);
//     var amountInUint = assets_avaliable.weight;

//     var gas_amount = await contract.methods.mint(awareData, useraddress, amountInUint).estimateGas({ from: from0xaddress });
//     var tweenty_perc_increase = Number(gas_amount) * 0.2;
//     gas_amount = Math.ceil(Number(gas_amount) + tweenty_perc_increase);

//     var gas_price = await connectWeb3.eth.getGasPrice();

//     const txConfig = {
//         from: from0xaddress,
//         to: contractAddress,
//         gasPrice: gas_price,
//         gas: gas_amount,
//         nonce: nonce,
//         data: contract.methods.mint(awareData, useraddress, amountInUint).encodeABI(),
//     };


//     console.log("bangtxConfig", txConfig)

//     connectWeb3.eth.accounts.signTransaction(txConfig, privatekey, async function (err, signedTx) {
//         if (err) callback(false);

//         try {
//             connectWeb3.eth.sendSignedTransaction(signedTx.rawTransaction)
//                 .on("receipt", async function (receipt) {
//                     console.log("Tx Hash (Receipt): ", receipt);


//                     transaction_history.create(
//                         {
//                             _awareid: _awareid,
//                             aware_token_id: aware_token_id,
//                             transactionIndex: receipt.transactionIndex,
//                             transactionHash: receipt.transactionHash,
//                             blockHash: receipt.blockHash,
//                             blockNumber: receipt.blockNumber,
//                             from: receipt.from,
//                             to: receipt.to,
//                             cumulativeGasUsed: receipt.cumulativeGasUsed,
//                             gasUsed: receipt.gasUsed,
//                             contractAddress: receipt.contractAddress,
//                             logsBloom: receipt.logsBloom,
//                             logs: receipt.logs,
//                             status: receipt.status
//                         }, async function (err, history) {

//                             if (err) callback(false);

//                             await sleep(10000);

//                             console.log("useraddress", useraddress)

//                             const query = gql`{
//                                 awareTokens(
//                                   where: { owner: "${useraddress.toLowerCase()}" }
//                                   orderBy: createdAtTimestamp
//                                   orderDirection: desc
//                                   first: 1
//                                 ) {
//                                   id
//                                   owner {
//                                     id
//                                         }
//                                     creator {
//                                     id
//                                         }
//                                     contentURI
//                                     metadataURI
//                                     amount
//                                     createdAtTimestamp 
//                                 }
//                               }`


//                             var result = await request(process.env.SUBGRAPH_URL, query).catch((e) => { console.log("e", e) });

//                             const postID = result.awareTokens[0].id;

//                             console.log("post", postID);

//                             var metadata = null;
//                             let maxRetries = 60; // Number of retries
//                             let retryDelay = 5000; // Delay between retries in milliseconds (5 seconds)
//                             let attempt = 0;

//                             while (attempt < maxRetries) {
//                                 console.log("TCA Fleek logs: ", new Date().toLocaleString());

//                                 try {
//                                     console.log(`Attempt ${attempt + 1} to fetch metadata...`);
//                                     metadata = await axios.get(result.awareTokens[0].metadataURI);
//                                     break; // Exit loop if the request is successful
//                                 } catch (error) {
//                                     console.error(`Error fetching metadata on attempt ${attempt + 1}:`, error.message);

//                                     // Log request details for debugging
//                                     console.log("Request Details:");
//                                     console.log(`Endpoint: ${result.awareTokens[0].metadataURI}`);
//                                     console.log("Headers:", error.config?.headers || "No headers sent");
//                                     console.log("Request Body:", error.config?.data || "No request body sent");

//                                     // Generate and log the equivalent cURL command
//                                     const curlCommand = `
//     curl -X GET ${result.awareTokens[0].metadataURI} \\
//     -H 'Accept: application/json'`.trim();

//                                     console.log("Equivalent cURL Command:");
//                                     console.log(curlCommand);

//                                     attempt++;

//                                     if (attempt < maxRetries) {
//                                         console.log(`Retrying after ${retryDelay}ms...`);
//                                         await new Promise((resolve) => setTimeout(resolve, retryDelay)); // Wait before retrying
//                                     } else {
//                                         console.log("Max retries reached. Returning callback(false).");
//                                         callback(false);
//                                         return; // Exit the current function
//                                     }
//                                 }
//                             }



//                             console.log("postID", result);

//                             console.log(metadata.data.description, aware_token_id)

//                             if (metadata.data.description == aware_token_id) {

//                                 console.log("IN")
//                                 await aw_tokens.findOneAndUpdate({ _id: aware_token_id },
//                                     {
//                                         blockchain_id: postID,
//                                         status: 'Approved',
//                                         type_of_token: assets_avaliable.aware_token_type,
//                                         total_tokens: Number(assets_avaliable.weight),
//                                         avaliable_tokens: Number(assets_avaliable.weight),

//                                     }, { new: true },
//                                 ).catch((ex) => {

//                                     console.log("ex", ex)
//                                     callback(false);
//                                 });

//                                 callback(true);
//                                 // break;
//                             }
//                             else {
//                                 console.log("SubGraph or Fleek issue");
//                                 callback(false);
//                             }


//                         })

//                 })
//                 .on("error", async function (e) {

//                     console.log("eeeeeeeeeeeeeee", e)
//                     callback(false);
//                 });
//         }
//         catch (ex) {
//             console.log("ex", ex);
//             callback(false);

//         }
//     });


// };

// //last running version
// var nonce = 0;
// const mintAwareToken = async (file, kyc_details_avaliable, assets_avaliable, tracer_avaliable, self_validation_avaliable, company_compliances_avaliable, useraddress, _awareid, aware_token_id, callback) => {

//     // return new Promise(async function (resolve, reject) {

//     var valueChainProcess = [];

//     assets_avaliable.value_chain_process_main.forEach(x => {
//         valueChainProcess.push(x.name);
//     })
//     assets_avaliable.value_chain_process_sub.forEach(x => {
//         valueChainProcess.push(x.name);
//     })

//     var environmentalScopeCertificate = [];
//     company_compliances_avaliable.environmental_scope_certificates.forEach(x => {
//         environmentalScopeCertificate.push(x.documentname);
//     })

//     var socialComplianceCertificate = [];
//     company_compliances_avaliable.social_compliance_certificates.forEach(x => {
//         socialComplianceCertificate.push(x.documentname);
//     })

//     var chemicalComplianceCertificate = [];
//     company_compliances_avaliable.chemical_compliance_certificates.forEach(x => {
//         chemicalComplianceCertificate.push(x.documentname);
//     })


//     const metadataJSON = generateMetadata("aware-20221012", {
//         version: "aware-20221012",
//         name: assets_avaliable._awareid,
//         description: aware_token_id.toString(),
//         date: new Date().toISOString(),
//         awareTokenType: assets_avaliable.aware_token_type,
//         awareAssetId: assets_avaliable.aware_asset_id,
//         productionFacility: assets_avaliable.production_facility,
//         producer: kyc_details_avaliable.company_name,
//         batchNo: assets_avaliable.production_lot,
//         ProductionQty: assets_avaliable.quantity ? assets_avaliable.quantity : '',
//         weightInKgs: assets_avaliable.weight,
//         valueChainProcess: valueChainProcess,
//         materialSpecs: assets_avaliable.material_specs,
//         color: assets_avaliable.main_color,
//         sustainableProcessClaim: assets_avaliable.sustainable_process_claim == true ? assets_avaliable.sustainable_process_certificates : [],
//         wetProcessing: assets_avaliable.wet_processing == true ? assets_avaliable.wet_processing_arr : [],
//         tracer: {
//             "tracerAdded": tracer_avaliable.tracer_added == true ? "Yes" : "No",
//             "typeofTracer": tracer_avaliable.aware_tc_checked == true ? "aware" : "custom",
//             "scandate": tracer_avaliable.aware_date ? tracer_avaliable.aware_date.toString() : tracer_avaliable.custom_date ? tracer_avaliable.custom_date.toString() : ''
//         },
//         selfValidationCertificate: ['requested'],
//         environmentalScopeCertificate: environmentalScopeCertificate,
//         socialComplianceCertificate: socialComplianceCertificate,
//         chemicalComplianceCertificate: chemicalComplianceCertificate,
//         previousTokenDetail: []
//     });

//     console.log("metadataJSON", metadataJSON)

//     const file_read = fs.readFileSync(file); // Read file into a buffer

//     console.log({ file_read });


//     const contentHash = sha256FromBuffer(Buffer.from(file_read));
//     const metadataHash = sha256FromBuffer(Buffer.from(metadataJSON));

//     console.log({ contentHash });
//     console.log({ metadataHash });

//     // Upload files to fleek
//     const data = {
//         "file": file,
//         "metadata": metadataJSON
//     }


//     const upload = await postToFleekAsync(data).catch((ex) => { callback(false); })

//     console.log({ upload });

//     // Collect fileUrl and metadataUrl from Fleek
//     const { fileUrl, metadataUrl } = upload.data;

//     // // Construct mediaData object
//     const awareData = constructAwareData(
//         fileUrl,
//         metadataUrl,
//         contentHash,
//         metadataHash
//     );

//     console.log("awareData", awareData)


//     const privatekey = process.env.ADMIN_PRIVATE_KEY;

//     var non = await connectWeb3.eth.getTransactionCount(from0xaddress);
//     if (nonce == non) {
//         nonce = nonce + 1;
//     }
//     else {
//         nonce = non;
//     }

//     // var abiArray = abi;

//     // var abiArray = [
//     //     {
//     //         "inputs": [],
//     //         "stateMutability": "nonpayable",
//     //         "type": "constructor"
//     //     },
//     //     {
//     //         "anonymous": false,
//     //         "inputs": [
//     //             {
//     //                 "indexed": true,
//     //                 "internalType": "address",
//     //                 "name": "account",
//     //                 "type": "address"
//     //             },
//     //             {
//     //                 "indexed": true,
//     //                 "internalType": "address",
//     //                 "name": "operator",
//     //                 "type": "address"
//     //             },
//     //             {
//     //                 "indexed": false,
//     //                 "internalType": "bool",
//     //                 "name": "approved",
//     //                 "type": "bool"
//     //             }
//     //         ],
//     //         "name": "ApprovalForAll",
//     //         "type": "event"
//     //     },
//     //     {
//     //         "anonymous": false,
//     //         "inputs": [
//     //             {
//     //                 "indexed": true,
//     //                 "internalType": "uint256",
//     //                 "name": "_tokenId",
//     //                 "type": "uint256"
//     //             },
//     //             {
//     //                 "indexed": false,
//     //                 "internalType": "address",
//     //                 "name": "owner",
//     //                 "type": "address"
//     //             },
//     //             {
//     //                 "indexed": false,
//     //                 "internalType": "string",
//     //                 "name": "_uri",
//     //                 "type": "string"
//     //             }
//     //         ],
//     //         "name": "TokenMetadataURIUpdated",
//     //         "type": "event"
//     //     },
//     //     {
//     //         "anonymous": false,
//     //         "inputs": [
//     //             {
//     //                 "indexed": true,
//     //                 "internalType": "uint256",
//     //                 "name": "_tokenId",
//     //                 "type": "uint256"
//     //             },
//     //             {
//     //                 "indexed": false,
//     //                 "internalType": "address",
//     //                 "name": "owner",
//     //                 "type": "address"
//     //             },
//     //             {
//     //                 "indexed": false,
//     //                 "internalType": "string",
//     //                 "name": "_uri",
//     //                 "type": "string"
//     //             }
//     //         ],
//     //         "name": "TokenURIUpdated",
//     //         "type": "event"
//     //     },
//     //     {
//     //         "anonymous": false,
//     //         "inputs": [
//     //             {
//     //                 "indexed": true,
//     //                 "internalType": "address",
//     //                 "name": "operator",
//     //                 "type": "address"
//     //             },
//     //             {
//     //                 "indexed": true,
//     //                 "internalType": "address",
//     //                 "name": "from",
//     //                 "type": "address"
//     //             },
//     //             {
//     //                 "indexed": true,
//     //                 "internalType": "address",
//     //                 "name": "to",
//     //                 "type": "address"
//     //             },
//     //             {
//     //                 "indexed": false,
//     //                 "internalType": "uint256[]",
//     //                 "name": "ids",
//     //                 "type": "uint256[]"
//     //             },
//     //             {
//     //                 "indexed": false,
//     //                 "internalType": "uint256[]",
//     //                 "name": "values",
//     //                 "type": "uint256[]"
//     //             }
//     //         ],
//     //         "name": "TransferBatch",
//     //         "type": "event"
//     //     },
//     //     {
//     //         "anonymous": false,
//     //         "inputs": [
//     //             {
//     //                 "indexed": true,
//     //                 "internalType": "address",
//     //                 "name": "operator",
//     //                 "type": "address"
//     //             },
//     //             {
//     //                 "indexed": true,
//     //                 "internalType": "address",
//     //                 "name": "from",
//     //                 "type": "address"
//     //             },
//     //             {
//     //                 "indexed": true,
//     //                 "internalType": "address",
//     //                 "name": "to",
//     //                 "type": "address"
//     //             },
//     //             {
//     //                 "indexed": false,
//     //                 "internalType": "uint256",
//     //                 "name": "id",
//     //                 "type": "uint256"
//     //             },
//     //             {
//     //                 "indexed": false,
//     //                 "internalType": "uint256",
//     //                 "name": "value",
//     //                 "type": "uint256"
//     //             }
//     //         ],
//     //         "name": "TransferSingle",
//     //         "type": "event"
//     //     },
//     //     {
//     //         "anonymous": false,
//     //         "inputs": [
//     //             {
//     //                 "indexed": false,
//     //                 "internalType": "string",
//     //                 "name": "value",
//     //                 "type": "string"
//     //             },
//     //             {
//     //                 "indexed": true,
//     //                 "internalType": "uint256",
//     //                 "name": "id",
//     //                 "type": "uint256"
//     //             }
//     //         ],
//     //         "name": "URI",
//     //         "type": "event"
//     //     },
//     //     {
//     //         "inputs": [
//     //             {
//     //                 "internalType": "address",
//     //                 "name": "account",
//     //                 "type": "address"
//     //             },
//     //             {
//     //                 "internalType": "uint256",
//     //                 "name": "id",
//     //                 "type": "uint256"
//     //             }
//     //         ],
//     //         "name": "balanceOf",
//     //         "outputs": [
//     //             {
//     //                 "internalType": "uint256",
//     //                 "name": "",
//     //                 "type": "uint256"
//     //             }
//     //         ],
//     //         "stateMutability": "view",
//     //         "type": "function"
//     //     },
//     //     {
//     //         "inputs": [
//     //             {
//     //                 "internalType": "address[]",
//     //                 "name": "accounts",
//     //                 "type": "address[]"
//     //             },
//     //             {
//     //                 "internalType": "uint256[]",
//     //                 "name": "ids",
//     //                 "type": "uint256[]"
//     //             }
//     //         ],
//     //         "name": "balanceOfBatch",
//     //         "outputs": [
//     //             {
//     //                 "internalType": "uint256[]",
//     //                 "name": "",
//     //                 "type": "uint256[]"
//     //             }
//     //         ],
//     //         "stateMutability": "view",
//     //         "type": "function"
//     //     },
//     //     {
//     //         "inputs": [
//     //             {
//     //                 "internalType": "address",
//     //                 "name": "from",
//     //                 "type": "address"
//     //             },
//     //             {
//     //                 "internalType": "uint256",
//     //                 "name": "tokenId",
//     //                 "type": "uint256"
//     //             },
//     //             {
//     //                 "internalType": "uint256",
//     //                 "name": "amount",
//     //                 "type": "uint256"
//     //             }
//     //         ],
//     //         "name": "burn",
//     //         "outputs": [],
//     //         "stateMutability": "nonpayable",
//     //         "type": "function"
//     //     },
//     //     {
//     //         "inputs": [
//     //             {
//     //                 "internalType": "address",
//     //                 "name": "account",
//     //                 "type": "address"
//     //             },
//     //             {
//     //                 "internalType": "uint256[]",
//     //                 "name": "ids",
//     //                 "type": "uint256[]"
//     //             },
//     //             {
//     //                 "internalType": "uint256[]",
//     //                 "name": "values",
//     //                 "type": "uint256[]"
//     //             }
//     //         ],
//     //         "name": "burnBatch",
//     //         "outputs": [],
//     //         "stateMutability": "nonpayable",
//     //         "type": "function"
//     //     },
//     //     {
//     //         "inputs": [
//     //             {
//     //                 "internalType": "address",
//     //                 "name": "account",
//     //                 "type": "address"
//     //             },
//     //             {
//     //                 "internalType": "address",
//     //                 "name": "operator",
//     //                 "type": "address"
//     //             }
//     //         ],
//     //         "name": "isApprovedForAll",
//     //         "outputs": [
//     //             {
//     //                 "internalType": "bool",
//     //                 "name": "",
//     //                 "type": "bool"
//     //             }
//     //         ],
//     //         "stateMutability": "view",
//     //         "type": "function"
//     //     },
//     //     {
//     //         "inputs": [
//     //             {
//     //                 "components": [
//     //                     {
//     //                         "internalType": "string",
//     //                         "name": "tokenURI",
//     //                         "type": "string"
//     //                     },
//     //                     {
//     //                         "internalType": "string",
//     //                         "name": "metadataURI",
//     //                         "type": "string"
//     //                     },
//     //                     {
//     //                         "internalType": "bytes32",
//     //                         "name": "contentHash",
//     //                         "type": "bytes32"
//     //                     },
//     //                     {
//     //                         "internalType": "bytes32",
//     //                         "name": "metadataHash",
//     //                         "type": "bytes32"
//     //                     }
//     //                 ],
//     //                 "internalType": "struct IAwareToken.AwareData",
//     //                 "name": "data",
//     //                 "type": "tuple"
//     //             },
//     //             {
//     //                 "internalType": "address",
//     //                 "name": "recipient",
//     //                 "type": "address"
//     //             },
//     //             {
//     //                 "internalType": "uint256",
//     //                 "name": "amount",
//     //                 "type": "uint256"
//     //             }
//     //         ],
//     //         "name": "mint",
//     //         "outputs": [],
//     //         "stateMutability": "nonpayable",
//     //         "type": "function"
//     //     },
//     //     {
//     //         "inputs": [
//     //             {
//     //                 "internalType": "uint256",
//     //                 "name": "tokenId",
//     //                 "type": "uint256"
//     //             }
//     //         ],
//     //         "name": "ownerOf",
//     //         "outputs": [
//     //             {
//     //                 "internalType": "address",
//     //                 "name": "",
//     //                 "type": "address"
//     //             }
//     //         ],
//     //         "stateMutability": "view",
//     //         "type": "function"
//     //     },
//     //     {
//     //         "inputs": [
//     //             {
//     //                 "internalType": "uint256",
//     //                 "name": "",
//     //                 "type": "uint256"
//     //             }
//     //         ],
//     //         "name": "previousTokenOwners",
//     //         "outputs": [
//     //             {
//     //                 "internalType": "address",
//     //                 "name": "",
//     //                 "type": "address"
//     //             }
//     //         ],
//     //         "stateMutability": "view",
//     //         "type": "function"
//     //     },
//     //     {
//     //         "inputs": [
//     //             {
//     //                 "internalType": "address",
//     //                 "name": "from",
//     //                 "type": "address"
//     //             },
//     //             {
//     //                 "internalType": "address",
//     //                 "name": "to",
//     //                 "type": "address"
//     //             },
//     //             {
//     //                 "internalType": "uint256[]",
//     //                 "name": "ids",
//     //                 "type": "uint256[]"
//     //             },
//     //             {
//     //                 "internalType": "uint256[]",
//     //                 "name": "amounts",
//     //                 "type": "uint256[]"
//     //             },
//     //             {
//     //                 "internalType": "bytes",
//     //                 "name": "data",
//     //                 "type": "bytes"
//     //             }
//     //         ],
//     //         "name": "safeBatchTransferFrom",
//     //         "outputs": [],
//     //         "stateMutability": "nonpayable",
//     //         "type": "function"
//     //     },
//     //     {
//     //         "inputs": [
//     //             {
//     //                 "internalType": "address",
//     //                 "name": "from",
//     //                 "type": "address"
//     //             },
//     //             {
//     //                 "internalType": "address",
//     //                 "name": "to",
//     //                 "type": "address"
//     //             },
//     //             {
//     //                 "internalType": "uint256",
//     //                 "name": "id",
//     //                 "type": "uint256"
//     //             },
//     //             {
//     //                 "internalType": "uint256",
//     //                 "name": "amount",
//     //                 "type": "uint256"
//     //             },
//     //             {
//     //                 "internalType": "bytes",
//     //                 "name": "data",
//     //                 "type": "bytes"
//     //             }
//     //         ],
//     //         "name": "safeTransferFrom",
//     //         "outputs": [],
//     //         "stateMutability": "nonpayable",
//     //         "type": "function"
//     //     },
//     //     {
//     //         "inputs": [
//     //             {
//     //                 "internalType": "address",
//     //                 "name": "operator",
//     //                 "type": "address"
//     //             },
//     //             {
//     //                 "internalType": "bool",
//     //                 "name": "approved",
//     //                 "type": "bool"
//     //             }
//     //         ],
//     //         "name": "setApprovalForAll",
//     //         "outputs": [],
//     //         "stateMutability": "nonpayable",
//     //         "type": "function"
//     //     },
//     //     {
//     //         "inputs": [
//     //             {
//     //                 "internalType": "uint256",
//     //                 "name": "_tokenId",
//     //                 "type": "uint256"
//     //             },
//     //             {
//     //                 "internalType": "string",
//     //                 "name": "_type",
//     //                 "type": "string"
//     //             }
//     //         ],
//     //         "name": "setTokenType",
//     //         "outputs": [],
//     //         "stateMutability": "nonpayable",
//     //         "type": "function"
//     //     },
//     //     {
//     //         "inputs": [
//     //             {
//     //                 "internalType": "bytes4",
//     //                 "name": "interfaceId",
//     //                 "type": "bytes4"
//     //             }
//     //         ],
//     //         "name": "supportsInterface",
//     //         "outputs": [
//     //             {
//     //                 "internalType": "bool",
//     //                 "name": "",
//     //                 "type": "bool"
//     //             }
//     //         ],
//     //         "stateMutability": "view",
//     //         "type": "function"
//     //     },
//     //     {
//     //         "inputs": [
//     //             {
//     //                 "internalType": "uint256",
//     //                 "name": "",
//     //                 "type": "uint256"
//     //             }
//     //         ],
//     //         "name": "tokenContentHashes",
//     //         "outputs": [
//     //             {
//     //                 "internalType": "bytes32",
//     //                 "name": "",
//     //                 "type": "bytes32"
//     //             }
//     //         ],
//     //         "stateMutability": "view",
//     //         "type": "function"
//     //     },
//     //     {
//     //         "inputs": [
//     //             {
//     //                 "internalType": "uint256",
//     //                 "name": "",
//     //                 "type": "uint256"
//     //             }
//     //         ],
//     //         "name": "tokenCreators",
//     //         "outputs": [
//     //             {
//     //                 "internalType": "address",
//     //                 "name": "",
//     //                 "type": "address"
//     //             }
//     //         ],
//     //         "stateMutability": "view",
//     //         "type": "function"
//     //     },
//     //     {
//     //         "inputs": [
//     //             {
//     //                 "internalType": "uint256",
//     //                 "name": "",
//     //                 "type": "uint256"
//     //             }
//     //         ],
//     //         "name": "tokenMetadataHashes",
//     //         "outputs": [
//     //             {
//     //                 "internalType": "bytes32",
//     //                 "name": "",
//     //                 "type": "bytes32"
//     //             }
//     //         ],
//     //         "stateMutability": "view",
//     //         "type": "function"
//     //     },
//     //     {
//     //         "inputs": [
//     //             {
//     //                 "internalType": "uint256",
//     //                 "name": "tokenId",
//     //                 "type": "uint256"
//     //             }
//     //         ],
//     //         "name": "tokenMetadataURI",
//     //         "outputs": [
//     //             {
//     //                 "internalType": "string",
//     //                 "name": "",
//     //                 "type": "string"
//     //             }
//     //         ],
//     //         "stateMutability": "view",
//     //         "type": "function"
//     //     },
//     //     {
//     //         "inputs": [
//     //             {
//     //                 "internalType": "uint256",
//     //                 "name": "tokenId",
//     //                 "type": "uint256"
//     //             }
//     //         ],
//     //         "name": "tokentype",
//     //         "outputs": [
//     //             {
//     //                 "internalType": "string",
//     //                 "name": "",
//     //                 "type": "string"
//     //             }
//     //         ],
//     //         "stateMutability": "view",
//     //         "type": "function"
//     //     },
//     //     {
//     //         "inputs": [
//     //             {
//     //                 "internalType": "uint256",
//     //                 "name": "tokenId",
//     //                 "type": "uint256"
//     //             },
//     //             {
//     //                 "internalType": "string",
//     //                 "name": "metadataURI",
//     //                 "type": "string"
//     //             }
//     //         ],
//     //         "name": "updateTokenMetadataURI",
//     //         "outputs": [],
//     //         "stateMutability": "nonpayable",
//     //         "type": "function"
//     //     },
//     //     {
//     //         "inputs": [
//     //             {
//     //                 "internalType": "uint256",
//     //                 "name": "tokenId",
//     //                 "type": "uint256"
//     //             },
//     //             {
//     //                 "internalType": "string",
//     //                 "name": "tokenURI",
//     //                 "type": "string"
//     //             }
//     //         ],
//     //         "name": "updateTokenURI",
//     //         "outputs": [],
//     //         "stateMutability": "nonpayable",
//     //         "type": "function"
//     //     },
//     //     {
//     //         "inputs": [
//     //             {
//     //                 "internalType": "uint256",
//     //                 "name": "tokenId",
//     //                 "type": "uint256"
//     //             }
//     //         ],
//     //         "name": "uri",
//     //         "outputs": [
//     //             {
//     //                 "internalType": "string",
//     //                 "name": "",
//     //                 "type": "string"
//     //             }
//     //         ],
//     //         "stateMutability": "view",
//     //         "type": "function"
//     //     }
//     // ]

//     const contractAddress = process.env.CONTRACT_ADDRESS;
//     var contract = new connectWeb3.eth.Contract(abiArray, contractAddress, { from: from0xaddress })
//     //var amountInUint = connectWeb3.utils.toWei(assets_avaliable.weight);
//     var amountInUint = assets_avaliable.weight;

//     // useraddress = "0x00da1094c17793bfc060924a990e82b1783edde4"

//     console.log("useraddress", useraddress)


//     var gas_amount = await contract.methods.mint(awareData, useraddress, amountInUint).estimateGas({ from: from0xaddress });
//     var tweenty_perc_increase = Number(gas_amount) * 0.2;
//     gas_amount = Math.ceil(Number(gas_amount) + tweenty_perc_increase);

//     var gas_price = await connectWeb3.eth.getGasPrice();

//     const txConfig = {
//         from: from0xaddress,
//         to: contractAddress,
//         gasPrice: gas_price,
//         gas: gas_amount,
//         nonce: nonce,
//         data: contract.methods.mint(awareData, useraddress, amountInUint).encodeABI(),
//     };

//     // const txConfig = {
//     //     from: from0xaddress,
//     //     to: contractAddress,
//     //     gasPrice: "1000000000000",
//     //     gas: "600000",
//     //     nonce: nonce,
//     //     data: contract.methods.mint(awareData, useraddress, amountInUint).encodeABI(),
//     // };

//     console.log("bangtxConfig", txConfig)

//     // console.log("connectWeb3", connectWeb3)
//     connectWeb3.eth.accounts.signTransaction(txConfig, privatekey, async function (err, signedTx) {
//         if (err) callback(false);

//         try {
//             connectWeb3.eth.sendSignedTransaction(signedTx.rawTransaction)
//                 .on("receipt", async function (receipt) {
//                     console.log("Tx Hash (Receipt): ", receipt);


//                     transaction_history.create(
//                         {
//                             _awareid: _awareid,
//                             aware_token_id: aware_token_id,
//                             transactionIndex: receipt.transactionIndex,
//                             transactionHash: receipt.transactionHash,
//                             blockHash: receipt.blockHash,
//                             blockNumber: receipt.blockNumber,
//                             from: receipt.from,
//                             to: receipt.to,
//                             cumulativeGasUsed: receipt.cumulativeGasUsed,
//                             gasUsed: receipt.gasUsed,
//                             contractAddress: receipt.contractAddress,
//                             logsBloom: receipt.logsBloom,
//                             logs: receipt.logs,
//                             status: receipt.status
//                         }, async function (err, history) {

//                             if (err) callback(false);

//                             await sleep(10000);

//                             console.log("useraddress", useraddress)

//                             const query = gql`{
//                                 awareTokens(
//                                   where: { owner: "${useraddress.toLowerCase()}" }
//                                   orderBy: createdAtTimestamp
//                                   orderDirection: desc
//                                   first: 1
//                                 ) {
//                                   id
//                                   owner {
//                                     id
//                                         }
//                                     creator {
//                                     id
//                                         }
//                                     contentURI
//                                     metadataURI
//                                     amount
//                                     createdAtTimestamp 
//                                 }
//                               }`

//                             // const query = gql`
//                             // {
//                             //     awareTokens(where: { owner: "${useraddress.toLowerCase()}" }) {
//                             //     id
//                             //     owner {
//                             //     id
//                             //         }
//                             //     creator {
//                             //     id
//                             //         }
//                             //     contentURI
//                             //     metadataURI
//                             //     amount
//                             //     createdAtTimestamp        
//                             //     }
//                             // }`


//                             var result = await request(process.env.SUBGRAPH_URL, query).catch((e) => { console.log("e", e) });

//                             const postID = result.awareTokens[0].id;

//                             console.log("post", postID);


//                             //                     var metadata = null;

//                             //                     try {

//                             //                         metadata = await axios.get(result.awareTokens[0].metadataURI);

//                             //                     }

//                             //                     catch (error) {
//                             //                         console.error("Error fetching metadata:", error.message);
//                             //                         // Log the request details
//                             //                         console.log("Request Details:");
//                             //                         console.log(`Endpoint: ${result.awareTokens[0].metadataURI}`);
//                             //                         console.log("Headers:", error.config?.headers || "No headers sent");

//                             //                         // Generate and log the equivalent cURL command
//                             //                         const curlCommand = `
//                             // curl -X GET ${result.awareTokens[0].metadataURI} \\
//                             // -H 'Accept: application/json'`.trim();

//                             //                         console.log("Equivalent cURL Command:");
//                             //                         console.log(curlCommand);

//                             //                         callback(false);


//                             //                     }


//                             var metadata = null;
//                             let maxRetries = 60; // Number of retries
//                             let retryDelay = 5000; // Delay between retries in milliseconds (5 seconds)
//                             let attempt = 0;

//                             while (attempt < maxRetries) {
//                                 console.log("TCA Fleek logs: ", new Date().toLocaleString());

//                                 try {
//                                     console.log(`Attempt ${attempt + 1} to fetch metadata...`);
//                                     metadata = await axios.get(result.awareTokens[0].metadataURI);
//                                     break; // Exit loop if the request is successful
//                                 } catch (error) {
//                                     console.error(`Error fetching metadata on attempt ${attempt + 1}:`, error.message);

//                                     // Log request details for debugging
//                                     console.log("Request Details:");
//                                     console.log(`Endpoint: ${result.awareTokens[0].metadataURI}`);
//                                     console.log("Headers:", error.config?.headers || "No headers sent");
//                                     console.log("Request Body:", error.config?.data || "No request body sent");

//                                     // Generate and log the equivalent cURL command
//                                     const curlCommand = `
//     curl -X GET ${result.awareTokens[0].metadataURI} \\
//     -H 'Accept: application/json'`.trim();

//                                     console.log("Equivalent cURL Command:");
//                                     console.log(curlCommand);

//                                     attempt++;

//                                     if (attempt < maxRetries) {
//                                         console.log(`Retrying after ${retryDelay}ms...`);
//                                         await new Promise((resolve) => setTimeout(resolve, retryDelay)); // Wait before retrying
//                                     } else {
//                                         console.log("Max retries reached. Returning callback(false).");
//                                         callback(false);
//                                         return; // Exit the current function
//                                     }
//                                 }
//                             }



//                             console.log("postID", result);

//                             console.log(metadata.data.description, aware_token_id)

//                             if (metadata.data.description == aware_token_id) {

//                                 console.log("IN")
//                                 await aw_tokens.findOneAndUpdate({ _id: aware_token_id },
//                                     {
//                                         blockchain_id: postID,
//                                         status: 'Approved',
//                                         type_of_token: assets_avaliable.aware_token_type,
//                                         total_tokens: Number(assets_avaliable.weight),
//                                         avaliable_tokens: Number(assets_avaliable.weight),

//                                     }, { new: true },
//                                 ).catch((ex) => {

//                                     console.log("ex", ex)
//                                     callback(false);
//                                 });

//                                 // await aw_tokens.findOneAndUpdate({ _awareid: req.headers.aware_id, _id: mongoose.Types.ObjectId(req.body._id) },
//                                 //     {
//                                 //         status: 'Approved', type_of_token: assets_avaliable.aware_token_type,
//                                 //         total_tokens: Number(assets_avaliable.weight),
//                                 //         avaliable_tokens: Number(assets_avaliable.weight),
//                                 //         // used_tokens: Number(physical_assets_found.weight)
//                                 //     },
//                                 //     { new: true }).catch((ex) => { return res.status(500).jsonp({ status: false, message: ex.toString() }) })

//                                 callback(true);
//                                 // break;
//                             }
//                             else {
//                                 console.log("SubGraph or Fleek issue");
//                                 callback(false);
//                             }




//                         })

//                 })
//                 .on("error", async function (e) {

//                     console.log("eeeeeeeeeeeeeee", e)
//                     callback(false);
//                 });
//         }
//         catch (ex) {
//             console.log("ex", ex);
//             callback(false);

//         }
//     });


//     // });

// };

//orignal code
// var nonce2 = 0;
// const mintUpdateAwareToken = async (
//     file,
//     kyc_details_avaliable,
//     selected_update_aware_token_found,
//     assets_avaliable,
//     tracer_avaliable,
//     self_validation_avaliable,
//     company_compliances_avaliable,
//     useraddress,
//     _awareid,
//     update_aware_token_id,
//     callback
// ) => {

//     try {

//         const valueChainProcess = [
//             ...selected_update_aware_token_found.value_chain_process_main,
//             ...selected_update_aware_token_found.value_chain_process_sub
//         ].map(x => x.name);

//         const temp_transferred_tokens = await transferred_tokens.find({})
//             .select(['_id', 'blockchain_id']);

//         const tokens_that_needs_to_be_burn = assets_avaliable.assetdataArrayMain.map((x) => {
//             const block = temp_transferred_tokens.find((k) => k._id.toString() === x.tt_id);
//             return { used_tokens: x.token_deduction, blockchain_id: block.blockchain_id };
//         });

//         const previousTokenUsed = tokens_that_needs_to_be_burn.map((block) => block.blockchain_id);

//         const metadataJSON = generateMetadata("aware-20221012", {
//             version: "aware-20221012",
//             name: assets_avaliable._awareid,
//             description: update_aware_token_id.toString(),
//             date: new Date().toISOString(),
//             awareTokenType: selected_update_aware_token_found.aware_output_token_type,
//             awareAssetId: assets_avaliable.updated_aware_asset_id,
//             productionFacility: selected_update_aware_token_found.production_facility,
//             producer: kyc_details_avaliable.company_name,
//             batchNo: assets_avaliable.production_lot,
//             ProductionQty: assets_avaliable.quantity || '',
//             weightInKgs: assets_avaliable.weight,
//             valueChainProcess,
//             materialSpecs: assets_avaliable.material_specs || '',
//             color: assets_avaliable.main_color,
//             sustainableProcessClaim: assets_avaliable.sustainable_process_claim == true ? assets_avaliable.sustainable_process_certificates : [],
//             wetProcessing: assets_avaliable.wet_processing_t == true ? assets_avaliable.wet_processing : [],
//             tracer: {
//                 "tracerAdded": tracer_avaliable.tracer_added == true ? "Yes" : "No",
//                 "typeofTracer": tracer_avaliable.aware_tc_checked == true ? "aware" : "custom",
//                 "scandate": tracer_avaliable.aware_date || tracer_avaliable.custom_date || null
//             },
//             selfValidationCertificate: ['requested'],
//             environmentalScopeCertificate: company_compliances_avaliable.environmental_scope_certificates.map(x => x.documentname),
//             socialComplianceCertificate: company_compliances_avaliable.social_compliance_certificates.map(x => x.documentname),
//             chemicalComplianceCertificate: company_compliances_avaliable.chemical_compliance_certificates.map(x => x.documentname),
//             previousTokenDetail: previousTokenUsed
//         });

//         const contentHash = sha256FromBuffer(Buffer.from(file.buffer));
//         const metadataHash = sha256FromBuffer(Buffer.from(metadataJSON));

//         const data = {
//             "file": file,
//             "name": kyc_details_avaliable.company_name,
//             "metadata": metadataJSON
//         };

//         //uncommented

//         // Upload files to fleek
//         const upload = await postToFleekAsync(data);

//         // Collect fileUrl and metadataUrl from Fleek
//         const { fileUrl, metadataUrl } = upload.data;

//         // Construct mediaData object
//         const awareData = constructAwareData(
//             fileUrl,
//             metadataUrl,
//             contentHash,
//             metadataHash
//         );

//         console.log({ awareData })


//         //uncommented


//         // const tempnonce = await getNonce(process.env.ADMIN_WALLET_ADDRESS);
//         // console.log("ADMIN_WALLET_ADDRESS", process.env.ADMIN_WALLET_ADDRESS)
//         // console.log("tempnonce", tempnonce)

//         // var abiArray = [
//         //     {
//         //         "inputs": [],
//         //         "stateMutability": "nonpayable",
//         //         "type": "constructor"
//         //     },
//         //     {
//         //         "anonymous": false,
//         //         "inputs": [
//         //             {
//         //                 "indexed": true,
//         //                 "internalType": "address",
//         //                 "name": "account",
//         //                 "type": "address"
//         //             },
//         //             {
//         //                 "indexed": true,
//         //                 "internalType": "address",
//         //                 "name": "operator",
//         //                 "type": "address"
//         //             },
//         //             {
//         //                 "indexed": false,
//         //                 "internalType": "bool",
//         //                 "name": "approved",
//         //                 "type": "bool"
//         //             }
//         //         ],
//         //         "name": "ApprovalForAll",
//         //         "type": "event"
//         //     },
//         //     {
//         //         "anonymous": false,
//         //         "inputs": [
//         //             {
//         //                 "indexed": true,
//         //                 "internalType": "uint256",
//         //                 "name": "_tokenId",
//         //                 "type": "uint256"
//         //             },
//         //             {
//         //                 "indexed": false,
//         //                 "internalType": "address",
//         //                 "name": "owner",
//         //                 "type": "address"
//         //             },
//         //             {
//         //                 "indexed": false,
//         //                 "internalType": "string",
//         //                 "name": "_uri",
//         //                 "type": "string"
//         //             }
//         //         ],
//         //         "name": "TokenMetadataURIUpdated",
//         //         "type": "event"
//         //     },
//         //     {
//         //         "anonymous": false,
//         //         "inputs": [
//         //             {
//         //                 "indexed": true,
//         //                 "internalType": "uint256",
//         //                 "name": "_tokenId",
//         //                 "type": "uint256"
//         //             },
//         //             {
//         //                 "indexed": false,
//         //                 "internalType": "address",
//         //                 "name": "owner",
//         //                 "type": "address"
//         //             },
//         //             {
//         //                 "indexed": false,
//         //                 "internalType": "string",
//         //                 "name": "_uri",
//         //                 "type": "string"
//         //             }
//         //         ],
//         //         "name": "TokenURIUpdated",
//         //         "type": "event"
//         //     },
//         //     {
//         //         "anonymous": false,
//         //         "inputs": [
//         //             {
//         //                 "indexed": true,
//         //                 "internalType": "address",
//         //                 "name": "operator",
//         //                 "type": "address"
//         //             },
//         //             {
//         //                 "indexed": true,
//         //                 "internalType": "address",
//         //                 "name": "from",
//         //                 "type": "address"
//         //             },
//         //             {
//         //                 "indexed": true,
//         //                 "internalType": "address",
//         //                 "name": "to",
//         //                 "type": "address"
//         //             },
//         //             {
//         //                 "indexed": false,
//         //                 "internalType": "uint256[]",
//         //                 "name": "ids",
//         //                 "type": "uint256[]"
//         //             },
//         //             {
//         //                 "indexed": false,
//         //                 "internalType": "uint256[]",
//         //                 "name": "values",
//         //                 "type": "uint256[]"
//         //             }
//         //         ],
//         //         "name": "TransferBatch",
//         //         "type": "event"
//         //     },
//         //     {
//         //         "anonymous": false,
//         //         "inputs": [
//         //             {
//         //                 "indexed": true,
//         //                 "internalType": "address",
//         //                 "name": "operator",
//         //                 "type": "address"
//         //             },
//         //             {
//         //                 "indexed": true,
//         //                 "internalType": "address",
//         //                 "name": "from",
//         //                 "type": "address"
//         //             },
//         //             {
//         //                 "indexed": true,
//         //                 "internalType": "address",
//         //                 "name": "to",
//         //                 "type": "address"
//         //             },
//         //             {
//         //                 "indexed": false,
//         //                 "internalType": "uint256",
//         //                 "name": "id",
//         //                 "type": "uint256"
//         //             },
//         //             {
//         //                 "indexed": false,
//         //                 "internalType": "uint256",
//         //                 "name": "value",
//         //                 "type": "uint256"
//         //             }
//         //         ],
//         //         "name": "TransferSingle",
//         //         "type": "event"
//         //     },
//         //     {
//         //         "anonymous": false,
//         //         "inputs": [
//         //             {
//         //                 "indexed": false,
//         //                 "internalType": "string",
//         //                 "name": "value",
//         //                 "type": "string"
//         //             },
//         //             {
//         //                 "indexed": true,
//         //                 "internalType": "uint256",
//         //                 "name": "id",
//         //                 "type": "uint256"
//         //             }
//         //         ],
//         //         "name": "URI",
//         //         "type": "event"
//         //     },
//         //     {
//         //         "inputs": [
//         //             {
//         //                 "internalType": "address",
//         //                 "name": "account",
//         //                 "type": "address"
//         //             },
//         //             {
//         //                 "internalType": "uint256",
//         //                 "name": "id",
//         //                 "type": "uint256"
//         //             }
//         //         ],
//         //         "name": "balanceOf",
//         //         "outputs": [
//         //             {
//         //                 "internalType": "uint256",
//         //                 "name": "",
//         //                 "type": "uint256"
//         //             }
//         //         ],
//         //         "stateMutability": "view",
//         //         "type": "function"
//         //     },
//         //     {
//         //         "inputs": [
//         //             {
//         //                 "internalType": "address[]",
//         //                 "name": "accounts",
//         //                 "type": "address[]"
//         //             },
//         //             {
//         //                 "internalType": "uint256[]",
//         //                 "name": "ids",
//         //                 "type": "uint256[]"
//         //             }
//         //         ],
//         //         "name": "balanceOfBatch",
//         //         "outputs": [
//         //             {
//         //                 "internalType": "uint256[]",
//         //                 "name": "",
//         //                 "type": "uint256[]"
//         //             }
//         //         ],
//         //         "stateMutability": "view",
//         //         "type": "function"
//         //     },
//         //     {
//         //         "inputs": [
//         //             {
//         //                 "internalType": "address",
//         //                 "name": "from",
//         //                 "type": "address"
//         //             },
//         //             {
//         //                 "internalType": "uint256",
//         //                 "name": "tokenId",
//         //                 "type": "uint256"
//         //             },
//         //             {
//         //                 "internalType": "uint256",
//         //                 "name": "amount",
//         //                 "type": "uint256"
//         //             }
//         //         ],
//         //         "name": "burn",
//         //         "outputs": [],
//         //         "stateMutability": "nonpayable",
//         //         "type": "function"
//         //     },
//         //     {
//         //         "inputs": [
//         //             {
//         //                 "internalType": "address",
//         //                 "name": "account",
//         //                 "type": "address"
//         //             },
//         //             {
//         //                 "internalType": "uint256[]",
//         //                 "name": "ids",
//         //                 "type": "uint256[]"
//         //             },
//         //             {
//         //                 "internalType": "uint256[]",
//         //                 "name": "values",
//         //                 "type": "uint256[]"
//         //             }
//         //         ],
//         //         "name": "burnBatch",
//         //         "outputs": [],
//         //         "stateMutability": "nonpayable",
//         //         "type": "function"
//         //     },
//         //     {
//         //         "inputs": [
//         //             {
//         //                 "internalType": "address",
//         //                 "name": "account",
//         //                 "type": "address"
//         //             },
//         //             {
//         //                 "internalType": "address",
//         //                 "name": "operator",
//         //                 "type": "address"
//         //             }
//         //         ],
//         //         "name": "isApprovedForAll",
//         //         "outputs": [
//         //             {
//         //                 "internalType": "bool",
//         //                 "name": "",
//         //                 "type": "bool"
//         //             }
//         //         ],
//         //         "stateMutability": "view",
//         //         "type": "function"
//         //     },
//         //     {
//         //         "inputs": [
//         //             {
//         //                 "components": [
//         //                     {
//         //                         "internalType": "string",
//         //                         "name": "tokenURI",
//         //                         "type": "string"
//         //                     },
//         //                     {
//         //                         "internalType": "string",
//         //                         "name": "metadataURI",
//         //                         "type": "string"
//         //                     },
//         //                     {
//         //                         "internalType": "bytes32",
//         //                         "name": "contentHash",
//         //                         "type": "bytes32"
//         //                     },
//         //                     {
//         //                         "internalType": "bytes32",
//         //                         "name": "metadataHash",
//         //                         "type": "bytes32"
//         //                     }
//         //                 ],
//         //                 "internalType": "struct IAwareToken.AwareData",
//         //                 "name": "data",
//         //                 "type": "tuple"
//         //             },
//         //             {
//         //                 "internalType": "address",
//         //                 "name": "recipient",
//         //                 "type": "address"
//         //             },
//         //             {
//         //                 "internalType": "uint256",
//         //                 "name": "amount",
//         //                 "type": "uint256"
//         //             }
//         //         ],
//         //         "name": "mint",
//         //         "outputs": [],
//         //         "stateMutability": "nonpayable",
//         //         "type": "function"
//         //     },
//         //     {
//         //         "inputs": [
//         //             {
//         //                 "internalType": "uint256",
//         //                 "name": "tokenId",
//         //                 "type": "uint256"
//         //             }
//         //         ],
//         //         "name": "ownerOf",
//         //         "outputs": [
//         //             {
//         //                 "internalType": "address",
//         //                 "name": "",
//         //                 "type": "address"
//         //             }
//         //         ],
//         //         "stateMutability": "view",
//         //         "type": "function"
//         //     },
//         //     {
//         //         "inputs": [
//         //             {
//         //                 "internalType": "uint256",
//         //                 "name": "",
//         //                 "type": "uint256"
//         //             }
//         //         ],
//         //         "name": "previousTokenOwners",
//         //         "outputs": [
//         //             {
//         //                 "internalType": "address",
//         //                 "name": "",
//         //                 "type": "address"
//         //             }
//         //         ],
//         //         "stateMutability": "view",
//         //         "type": "function"
//         //     },
//         //     {
//         //         "inputs": [
//         //             {
//         //                 "internalType": "address",
//         //                 "name": "from",
//         //                 "type": "address"
//         //             },
//         //             {
//         //                 "internalType": "address",
//         //                 "name": "to",
//         //                 "type": "address"
//         //             },
//         //             {
//         //                 "internalType": "uint256[]",
//         //                 "name": "ids",
//         //                 "type": "uint256[]"
//         //             },
//         //             {
//         //                 "internalType": "uint256[]",
//         //                 "name": "amounts",
//         //                 "type": "uint256[]"
//         //             },
//         //             {
//         //                 "internalType": "bytes",
//         //                 "name": "data",
//         //                 "type": "bytes"
//         //             }
//         //         ],
//         //         "name": "safeBatchTransferFrom",
//         //         "outputs": [],
//         //         "stateMutability": "nonpayable",
//         //         "type": "function"
//         //     },
//         //     {
//         //         "inputs": [
//         //             {
//         //                 "internalType": "address",
//         //                 "name": "from",
//         //                 "type": "address"
//         //             },
//         //             {
//         //                 "internalType": "address",
//         //                 "name": "to",
//         //                 "type": "address"
//         //             },
//         //             {
//         //                 "internalType": "uint256",
//         //                 "name": "id",
//         //                 "type": "uint256"
//         //             },
//         //             {
//         //                 "internalType": "uint256",
//         //                 "name": "amount",
//         //                 "type": "uint256"
//         //             },
//         //             {
//         //                 "internalType": "bytes",
//         //                 "name": "data",
//         //                 "type": "bytes"
//         //             }
//         //         ],
//         //         "name": "safeTransferFrom",
//         //         "outputs": [],
//         //         "stateMutability": "nonpayable",
//         //         "type": "function"
//         //     },
//         //     {
//         //         "inputs": [
//         //             {
//         //                 "internalType": "address",
//         //                 "name": "operator",
//         //                 "type": "address"
//         //             },
//         //             {
//         //                 "internalType": "bool",
//         //                 "name": "approved",
//         //                 "type": "bool"
//         //             }
//         //         ],
//         //         "name": "setApprovalForAll",
//         //         "outputs": [],
//         //         "stateMutability": "nonpayable",
//         //         "type": "function"
//         //     },
//         //     {
//         //         "inputs": [
//         //             {
//         //                 "internalType": "uint256",
//         //                 "name": "_tokenId",
//         //                 "type": "uint256"
//         //             },
//         //             {
//         //                 "internalType": "string",
//         //                 "name": "_type",
//         //                 "type": "string"
//         //             }
//         //         ],
//         //         "name": "setTokenType",
//         //         "outputs": [],
//         //         "stateMutability": "nonpayable",
//         //         "type": "function"
//         //     },
//         //     {
//         //         "inputs": [
//         //             {
//         //                 "internalType": "bytes4",
//         //                 "name": "interfaceId",
//         //                 "type": "bytes4"
//         //             }
//         //         ],
//         //         "name": "supportsInterface",
//         //         "outputs": [
//         //             {
//         //                 "internalType": "bool",
//         //                 "name": "",
//         //                 "type": "bool"
//         //             }
//         //         ],
//         //         "stateMutability": "view",
//         //         "type": "function"
//         //     },
//         //     {
//         //         "inputs": [
//         //             {
//         //                 "internalType": "uint256",
//         //                 "name": "",
//         //                 "type": "uint256"
//         //             }
//         //         ],
//         //         "name": "tokenContentHashes",
//         //         "outputs": [
//         //             {
//         //                 "internalType": "bytes32",
//         //                 "name": "",
//         //                 "type": "bytes32"
//         //             }
//         //         ],
//         //         "stateMutability": "view",
//         //         "type": "function"
//         //     },
//         //     {
//         //         "inputs": [
//         //             {
//         //                 "internalType": "uint256",
//         //                 "name": "",
//         //                 "type": "uint256"
//         //             }
//         //         ],
//         //         "name": "tokenCreators",
//         //         "outputs": [
//         //             {
//         //                 "internalType": "address",
//         //                 "name": "",
//         //                 "type": "address"
//         //             }
//         //         ],
//         //         "stateMutability": "view",
//         //         "type": "function"
//         //     },
//         //     {
//         //         "inputs": [
//         //             {
//         //                 "internalType": "uint256",
//         //                 "name": "",
//         //                 "type": "uint256"
//         //             }
//         //         ],
//         //         "name": "tokenMetadataHashes",
//         //         "outputs": [
//         //             {
//         //                 "internalType": "bytes32",
//         //                 "name": "",
//         //                 "type": "bytes32"
//         //             }
//         //         ],
//         //         "stateMutability": "view",
//         //         "type": "function"
//         //     },
//         //     {
//         //         "inputs": [
//         //             {
//         //                 "internalType": "uint256",
//         //                 "name": "tokenId",
//         //                 "type": "uint256"
//         //             }
//         //         ],
//         //         "name": "tokenMetadataURI",
//         //         "outputs": [
//         //             {
//         //                 "internalType": "string",
//         //                 "name": "",
//         //                 "type": "string"
//         //             }
//         //         ],
//         //         "stateMutability": "view",
//         //         "type": "function"
//         //     },
//         //     {
//         //         "inputs": [
//         //             {
//         //                 "internalType": "uint256",
//         //                 "name": "tokenId",
//         //                 "type": "uint256"
//         //             }
//         //         ],
//         //         "name": "tokentype",
//         //         "outputs": [
//         //             {
//         //                 "internalType": "string",
//         //                 "name": "",
//         //                 "type": "string"
//         //             }
//         //         ],
//         //         "stateMutability": "view",
//         //         "type": "function"
//         //     },
//         //     {
//         //         "inputs": [
//         //             {
//         //                 "internalType": "uint256",
//         //                 "name": "tokenId",
//         //                 "type": "uint256"
//         //             },
//         //             {
//         //                 "internalType": "string",
//         //                 "name": "metadataURI",
//         //                 "type": "string"
//         //             }
//         //         ],
//         //         "name": "updateTokenMetadataURI",
//         //         "outputs": [],
//         //         "stateMutability": "nonpayable",
//         //         "type": "function"
//         //     },
//         //     {
//         //         "inputs": [
//         //             {
//         //                 "internalType": "uint256",
//         //                 "name": "tokenId",
//         //                 "type": "uint256"
//         //             },
//         //             {
//         //                 "internalType": "string",
//         //                 "name": "tokenURI",
//         //                 "type": "string"
//         //             }
//         //         ],
//         //         "name": "updateTokenURI",
//         //         "outputs": [],
//         //         "stateMutability": "nonpayable",
//         //         "type": "function"
//         //     },
//         //     {
//         //         "inputs": [
//         //             {
//         //                 "internalType": "uint256",
//         //                 "name": "tokenId",
//         //                 "type": "uint256"
//         //             }
//         //         ],
//         //         "name": "uri",
//         //         "outputs": [
//         //             {
//         //                 "internalType": "string",
//         //                 "name": "",
//         //                 "type": "string"
//         //             }
//         //         ],
//         //         "stateMutability": "view",
//         //         "type": "function"
//         //     }
//         // ]

//         var amountInUint = assets_avaliable.weight;
//         var contract = new connectWeb3.eth.Contract(abiArray, process.env.CONTRACT_ADDRESS,
//             { from: process.env.ADMIN_WALLET_ADDRESS })

//         var gas_amount = await contract.methods.mint(awareData, useraddress, amountInUint).estimateGas({ from: process.env.ADMIN_WALLET_ADDRESS });

//         // console.log("gas_amount",gas_amount.toString());

//         var tweenty_perc_increase = Number(gas_amount) * 0.2;
//         gas_amount = Math.ceil(Number(gas_amount) + tweenty_perc_increase);

//         var gas_price = await connectWeb3.eth.getGasPrice();

//         console.log("gas_amount", gas_amount.toString());
//         console.log("gas_price", gas_price.toString());

//         // var blockNumber = await connectWeb3.eth.getBlockNumber();
//         // const nonce = connectWeb3.eth.wallets.getAccount(process.env.ADMIN_WALLET_ADDRESS);
//         var nonce = await connectWeb3.eth.getTransactionCount(process.env.ADMIN_WALLET_ADDRESS);

//         // const nonce = await connectWeb3.eth.getTransactionCount(process.env.ADMIN_WALLET_ADDRESS);
//         console.log("nonce", nonce);
//         // const pendingTransactions = await connectWeb3.eth.getBlock('pending');
//         // console.log("pendingTransactions",pendingTransactions);



//         // var blockDetails = await connectWeb3.eth.getBlock('latest');
//         // console.log("blockDetails", blockDetails);

//         // const gasLimit = blockDetails.gasLimit - pendingTransactions.transactions.length;
//         // console.log("gasLimit",gasLimit);

//         // const txConfig = {
//         //     from: process.env.ADMIN_WALLET_ADDRESS,
//         //     to: process.env.CONTRACT_ADDRESS,
//         //     gasPrice: "1000000000000",
//         //     gas: "850000",
//         //     // nonce: nonce2,
//         //     // gasLimit: blockDetails.gasLimit,
//         //     data: contract.methods.mint(awareData, useraddress, amountInUint).encodeABI(),
//         // };
//         // const gastogewi = connectWeb3.utils.toWei(tempgasAmount.toString());
//         // console.log("gastogewi",gastogewi);

//         const txConfig = {
//             from: process.env.ADMIN_WALLET_ADDRESS,
//             to: process.env.CONTRACT_ADDRESS,
//             gasPrice: gas_price.toString(),
//             gas: gas_amount.toString(),
//             nonce: nonce,
//             // gas: gasLimit.toString(),
//             // gasLimit: blockDetails.gasLimit,
//             // nonce: nonce2,
//             data: contract.methods.mint(awareData, useraddress, amountInUint).encodeABI(),
//         };

//         console.log("txConfig", txConfig)

//         //code that need to be uncommented
//         connectWeb3.eth.accounts.signTransaction(txConfig, process.env.ADMIN_PRIVATE_KEY, async function (err, signedTx) {
//             if (err) {

//                 console.log("err", err);
//                 callback(false);

//             }
//             console.log("signedTx", signedTx);

//             connectWeb3.eth.sendSignedTransaction(signedTx.rawTransaction)
//                 .on("receipt", async function (receipt) {

//                     console.log("Tx Hash (Receipt): ", receipt);

//                     const history = {
//                         _awareid: _awareid,
//                         update_aware_token_id: update_aware_token_id,
//                         transactionIndex: receipt.transactionIndex,
//                         transactionHash: receipt.transactionHash,
//                         blockHash: receipt.blockHash,
//                         blockNumber: receipt.blockNumber,
//                         from: receipt.from,
//                         to: receipt.to,
//                         cumulativeGasUsed: receipt.cumulativeGasUsed,
//                         gasUsed: receipt.gasUsed,
//                         contractAddress: receipt.contractAddress,
//                         logsBloom: receipt.logsBloom,
//                         logs: receipt.logs,
//                         status: receipt.status
//                     }

//                     await transaction_history.create(history);


//                     console.log("useraddress", useraddress)


//                     // const query = gql`{awareTokens(where: { owner: "${useraddress.toLowerCase()}" }) 
//                     // {
//                     //     id
//                     //     owner {
//                     //     id
//                     //         }
//                     //     creator {
//                     //     id
//                     //         }
//                     //     contentURI
//                     //     metadataURI
//                     //     amount
//                     //     createdAtTimestamp        
//                     //     }
//                     // }`

//                     await sleep(20000);

//                     // setTimeout(async () => {
//                     // var result = await request(process.env.SUBGRAPH_URL, query)
//                     // var tokens_in_wallet = result.awareTokens.sort(compare).reverse();
//                     // console.log("tokens_in_wallet", tokens_in_wallet)

//                     // const postID = tokens_in_wallet[0].id;
//                     // console.log("postID", postID)
//                     // // console.log("amount", tokens_in_wallet[0].amount)

//                     //this one is latest
//                     const calculateLatestCreation = (users) => {
//                         // Collect all users
//                         const allUsers = users.users;
//                         let allCreationIDs = [];

//                         // For each user
//                         for (const user of allUsers) {
//                             // If user has creations
//                             if (user.creations && user.creations.length > 0) {
//                                 // For each creation
//                                 for (const creation of user.creations) {
//                                     // Push creation ID (cast to int) to allCreationIDs
//                                     allCreationIDs.push(parseInt(creation.id));
//                                 }
//                             }
//                         }

//                         // Return max creation ID
//                         return Math.max(...allCreationIDs);
//                     };

//                     const allUsers = await request(process.env.SUBGRAPH_URL, gql`
//                         {
//                           users {
//                               creations(orderBy: createdAtTimestamp, orderDirection: desc) {
//                                 id
//                                 createdAtTimestamp
//                               }
//                             }
//                           }
//                         `).catch((err) => { console.log("err", err) });

//                     var postID = calculateLatestCreation(allUsers);

//                     // postID = 2334;
//                     // console.log("postID",postID)

//                     const query2 = gql`{awareToken(id:"${postID.toString()}") {id,owner {id},creator {id},contentURI,metadataURI,amount,createdAtTimestamp}}`
//                     var token = await request(process.env.SUBGRAPH_URL, query2)

//                     console.log("token", token)
//                     const metadata = await axios.get(token.awareToken.metadataURI);

//                     console.log("metadata.data.description", metadata.data.description)
//                     console.log("update_aware_token_id", update_aware_token_id)

//                     if (metadata.data.description == update_aware_token_id) {

//                         var wallet_of_sender = await wallets.findOne({ wallet_address_0x: useraddress })
//                             .select(['wallet_address_0x', 'from', 'to']);
//                         var key = wallet_of_sender.from + wallet_of_sender.to;
//                         var decrypted_private_key = helperfunctions.encryptAddress(key, 'decrypt');

//                         const privatekey = decrypted_private_key.substring(3, decrypted_private_key.length - 1);

//                         // var abiArray = [
//                         //     {
//                         //         "inputs": [],
//                         //         "stateMutability": "nonpayable",
//                         //         "type": "constructor"
//                         //     },
//                         //     {
//                         //         "anonymous": false,
//                         //         "inputs": [
//                         //             {
//                         //                 "indexed": true,
//                         //                 "internalType": "address",
//                         //                 "name": "account",
//                         //                 "type": "address"
//                         //             },
//                         //             {
//                         //                 "indexed": true,
//                         //                 "internalType": "address",
//                         //                 "name": "operator",
//                         //                 "type": "address"
//                         //             },
//                         //             {
//                         //                 "indexed": false,
//                         //                 "internalType": "bool",
//                         //                 "name": "approved",
//                         //                 "type": "bool"
//                         //             }
//                         //         ],
//                         //         "name": "ApprovalForAll",
//                         //         "type": "event"
//                         //     },
//                         //     {
//                         //         "anonymous": false,
//                         //         "inputs": [
//                         //             {
//                         //                 "indexed": true,
//                         //                 "internalType": "uint256",
//                         //                 "name": "_tokenId",
//                         //                 "type": "uint256"
//                         //             },
//                         //             {
//                         //                 "indexed": false,
//                         //                 "internalType": "address",
//                         //                 "name": "owner",
//                         //                 "type": "address"
//                         //             },
//                         //             {
//                         //                 "indexed": false,
//                         //                 "internalType": "string",
//                         //                 "name": "_uri",
//                         //                 "type": "string"
//                         //             }
//                         //         ],
//                         //         "name": "TokenMetadataURIUpdated",
//                         //         "type": "event"
//                         //     },
//                         //     {
//                         //         "anonymous": false,
//                         //         "inputs": [
//                         //             {
//                         //                 "indexed": true,
//                         //                 "internalType": "uint256",
//                         //                 "name": "_tokenId",
//                         //                 "type": "uint256"
//                         //             },
//                         //             {
//                         //                 "indexed": false,
//                         //                 "internalType": "address",
//                         //                 "name": "owner",
//                         //                 "type": "address"
//                         //             },
//                         //             {
//                         //                 "indexed": false,
//                         //                 "internalType": "string",
//                         //                 "name": "_uri",
//                         //                 "type": "string"
//                         //             }
//                         //         ],
//                         //         "name": "TokenURIUpdated",
//                         //         "type": "event"
//                         //     },
//                         //     {
//                         //         "anonymous": false,
//                         //         "inputs": [
//                         //             {
//                         //                 "indexed": true,
//                         //                 "internalType": "address",
//                         //                 "name": "operator",
//                         //                 "type": "address"
//                         //             },
//                         //             {
//                         //                 "indexed": true,
//                         //                 "internalType": "address",
//                         //                 "name": "from",
//                         //                 "type": "address"
//                         //             },
//                         //             {
//                         //                 "indexed": true,
//                         //                 "internalType": "address",
//                         //                 "name": "to",
//                         //                 "type": "address"
//                         //             },
//                         //             {
//                         //                 "indexed": false,
//                         //                 "internalType": "uint256[]",
//                         //                 "name": "ids",
//                         //                 "type": "uint256[]"
//                         //             },
//                         //             {
//                         //                 "indexed": false,
//                         //                 "internalType": "uint256[]",
//                         //                 "name": "values",
//                         //                 "type": "uint256[]"
//                         //             }
//                         //         ],
//                         //         "name": "TransferBatch",
//                         //         "type": "event"
//                         //     },
//                         //     {
//                         //         "anonymous": false,
//                         //         "inputs": [
//                         //             {
//                         //                 "indexed": true,
//                         //                 "internalType": "address",
//                         //                 "name": "operator",
//                         //                 "type": "address"
//                         //             },
//                         //             {
//                         //                 "indexed": true,
//                         //                 "internalType": "address",
//                         //                 "name": "from",
//                         //                 "type": "address"
//                         //             },
//                         //             {
//                         //                 "indexed": true,
//                         //                 "internalType": "address",
//                         //                 "name": "to",
//                         //                 "type": "address"
//                         //             },
//                         //             {
//                         //                 "indexed": false,
//                         //                 "internalType": "uint256",
//                         //                 "name": "id",
//                         //                 "type": "uint256"
//                         //             },
//                         //             {
//                         //                 "indexed": false,
//                         //                 "internalType": "uint256",
//                         //                 "name": "value",
//                         //                 "type": "uint256"
//                         //             }
//                         //         ],
//                         //         "name": "TransferSingle",
//                         //         "type": "event"
//                         //     },
//                         //     {
//                         //         "anonymous": false,
//                         //         "inputs": [
//                         //             {
//                         //                 "indexed": false,
//                         //                 "internalType": "string",
//                         //                 "name": "value",
//                         //                 "type": "string"
//                         //             },
//                         //             {
//                         //                 "indexed": true,
//                         //                 "internalType": "uint256",
//                         //                 "name": "id",
//                         //                 "type": "uint256"
//                         //             }
//                         //         ],
//                         //         "name": "URI",
//                         //         "type": "event"
//                         //     },
//                         //     {
//                         //         "inputs": [
//                         //             {
//                         //                 "internalType": "address",
//                         //                 "name": "account",
//                         //                 "type": "address"
//                         //             },
//                         //             {
//                         //                 "internalType": "uint256",
//                         //                 "name": "id",
//                         //                 "type": "uint256"
//                         //             }
//                         //         ],
//                         //         "name": "balanceOf",
//                         //         "outputs": [
//                         //             {
//                         //                 "internalType": "uint256",
//                         //                 "name": "",
//                         //                 "type": "uint256"
//                         //             }
//                         //         ],
//                         //         "stateMutability": "view",
//                         //         "type": "function"
//                         //     },
//                         //     {
//                         //         "inputs": [
//                         //             {
//                         //                 "internalType": "address[]",
//                         //                 "name": "accounts",
//                         //                 "type": "address[]"
//                         //             },
//                         //             {
//                         //                 "internalType": "uint256[]",
//                         //                 "name": "ids",
//                         //                 "type": "uint256[]"
//                         //             }
//                         //         ],
//                         //         "name": "balanceOfBatch",
//                         //         "outputs": [
//                         //             {
//                         //                 "internalType": "uint256[]",
//                         //                 "name": "",
//                         //                 "type": "uint256[]"
//                         //             }
//                         //         ],
//                         //         "stateMutability": "view",
//                         //         "type": "function"
//                         //     },
//                         //     {
//                         //         "inputs": [
//                         //             {
//                         //                 "internalType": "address",
//                         //                 "name": "from",
//                         //                 "type": "address"
//                         //             },
//                         //             {
//                         //                 "internalType": "uint256",
//                         //                 "name": "tokenId",
//                         //                 "type": "uint256"
//                         //             },
//                         //             {
//                         //                 "internalType": "uint256",
//                         //                 "name": "amount",
//                         //                 "type": "uint256"
//                         //             }
//                         //         ],
//                         //         "name": "burn",
//                         //         "outputs": [],
//                         //         "stateMutability": "nonpayable",
//                         //         "type": "function"
//                         //     },
//                         //     {
//                         //         "inputs": [
//                         //             {
//                         //                 "internalType": "address",
//                         //                 "name": "account",
//                         //                 "type": "address"
//                         //             },
//                         //             {
//                         //                 "internalType": "uint256[]",
//                         //                 "name": "ids",
//                         //                 "type": "uint256[]"
//                         //             },
//                         //             {
//                         //                 "internalType": "uint256[]",
//                         //                 "name": "values",
//                         //                 "type": "uint256[]"
//                         //             }
//                         //         ],
//                         //         "name": "burnBatch",
//                         //         "outputs": [],
//                         //         "stateMutability": "nonpayable",
//                         //         "type": "function"
//                         //     },
//                         //     {
//                         //         "inputs": [
//                         //             {
//                         //                 "internalType": "address",
//                         //                 "name": "account",
//                         //                 "type": "address"
//                         //             },
//                         //             {
//                         //                 "internalType": "address",
//                         //                 "name": "operator",
//                         //                 "type": "address"
//                         //             }
//                         //         ],
//                         //         "name": "isApprovedForAll",
//                         //         "outputs": [
//                         //             {
//                         //                 "internalType": "bool",
//                         //                 "name": "",
//                         //                 "type": "bool"
//                         //             }
//                         //         ],
//                         //         "stateMutability": "view",
//                         //         "type": "function"
//                         //     },
//                         //     {
//                         //         "inputs": [
//                         //             {
//                         //                 "components": [
//                         //                     {
//                         //                         "internalType": "string",
//                         //                         "name": "tokenURI",
//                         //                         "type": "string"
//                         //                     },
//                         //                     {
//                         //                         "internalType": "string",
//                         //                         "name": "metadataURI",
//                         //                         "type": "string"
//                         //                     },
//                         //                     {
//                         //                         "internalType": "bytes32",
//                         //                         "name": "contentHash",
//                         //                         "type": "bytes32"
//                         //                     },
//                         //                     {
//                         //                         "internalType": "bytes32",
//                         //                         "name": "metadataHash",
//                         //                         "type": "bytes32"
//                         //                     }
//                         //                 ],
//                         //                 "internalType": "struct IAwareToken.AwareData",
//                         //                 "name": "data",
//                         //                 "type": "tuple"
//                         //             },
//                         //             {
//                         //                 "internalType": "address",
//                         //                 "name": "recipient",
//                         //                 "type": "address"
//                         //             },
//                         //             {
//                         //                 "internalType": "uint256",
//                         //                 "name": "amount",
//                         //                 "type": "uint256"
//                         //             }
//                         //         ],
//                         //         "name": "mint",
//                         //         "outputs": [],
//                         //         "stateMutability": "nonpayable",
//                         //         "type": "function"
//                         //     },
//                         //     {
//                         //         "inputs": [
//                         //             {
//                         //                 "internalType": "uint256",
//                         //                 "name": "tokenId",
//                         //                 "type": "uint256"
//                         //             }
//                         //         ],
//                         //         "name": "ownerOf",
//                         //         "outputs": [
//                         //             {
//                         //                 "internalType": "address",
//                         //                 "name": "",
//                         //                 "type": "address"
//                         //             }
//                         //         ],
//                         //         "stateMutability": "view",
//                         //         "type": "function"
//                         //     },
//                         //     {
//                         //         "inputs": [
//                         //             {
//                         //                 "internalType": "uint256",
//                         //                 "name": "",
//                         //                 "type": "uint256"
//                         //             }
//                         //         ],
//                         //         "name": "previousTokenOwners",
//                         //         "outputs": [
//                         //             {
//                         //                 "internalType": "address",
//                         //                 "name": "",
//                         //                 "type": "address"
//                         //             }
//                         //         ],
//                         //         "stateMutability": "view",
//                         //         "type": "function"
//                         //     },
//                         //     {
//                         //         "inputs": [
//                         //             {
//                         //                 "internalType": "address",
//                         //                 "name": "from",
//                         //                 "type": "address"
//                         //             },
//                         //             {
//                         //                 "internalType": "address",
//                         //                 "name": "to",
//                         //                 "type": "address"
//                         //             },
//                         //             {
//                         //                 "internalType": "uint256[]",
//                         //                 "name": "ids",
//                         //                 "type": "uint256[]"
//                         //             },
//                         //             {
//                         //                 "internalType": "uint256[]",
//                         //                 "name": "amounts",
//                         //                 "type": "uint256[]"
//                         //             },
//                         //             {
//                         //                 "internalType": "bytes",
//                         //                 "name": "data",
//                         //                 "type": "bytes"
//                         //             }
//                         //         ],
//                         //         "name": "safeBatchTransferFrom",
//                         //         "outputs": [],
//                         //         "stateMutability": "nonpayable",
//                         //         "type": "function"
//                         //     },
//                         //     {
//                         //         "inputs": [
//                         //             {
//                         //                 "internalType": "address",
//                         //                 "name": "from",
//                         //                 "type": "address"
//                         //             },
//                         //             {
//                         //                 "internalType": "address",
//                         //                 "name": "to",
//                         //                 "type": "address"
//                         //             },
//                         //             {
//                         //                 "internalType": "uint256",
//                         //                 "name": "id",
//                         //                 "type": "uint256"
//                         //             },
//                         //             {
//                         //                 "internalType": "uint256",
//                         //                 "name": "amount",
//                         //                 "type": "uint256"
//                         //             },
//                         //             {
//                         //                 "internalType": "bytes",
//                         //                 "name": "data",
//                         //                 "type": "bytes"
//                         //             }
//                         //         ],
//                         //         "name": "safeTransferFrom",
//                         //         "outputs": [],
//                         //         "stateMutability": "nonpayable",
//                         //         "type": "function"
//                         //     },
//                         //     {
//                         //         "inputs": [
//                         //             {
//                         //                 "internalType": "address",
//                         //                 "name": "operator",
//                         //                 "type": "address"
//                         //             },
//                         //             {
//                         //                 "internalType": "bool",
//                         //                 "name": "approved",
//                         //                 "type": "bool"
//                         //             }
//                         //         ],
//                         //         "name": "setApprovalForAll",
//                         //         "outputs": [],
//                         //         "stateMutability": "nonpayable",
//                         //         "type": "function"
//                         //     },
//                         //     {
//                         //         "inputs": [
//                         //             {
//                         //                 "internalType": "uint256",
//                         //                 "name": "_tokenId",
//                         //                 "type": "uint256"
//                         //             },
//                         //             {
//                         //                 "internalType": "string",
//                         //                 "name": "_type",
//                         //                 "type": "string"
//                         //             }
//                         //         ],
//                         //         "name": "setTokenType",
//                         //         "outputs": [],
//                         //         "stateMutability": "nonpayable",
//                         //         "type": "function"
//                         //     },
//                         //     {
//                         //         "inputs": [
//                         //             {
//                         //                 "internalType": "bytes4",
//                         //                 "name": "interfaceId",
//                         //                 "type": "bytes4"
//                         //             }
//                         //         ],
//                         //         "name": "supportsInterface",
//                         //         "outputs": [
//                         //             {
//                         //                 "internalType": "bool",
//                         //                 "name": "",
//                         //                 "type": "bool"
//                         //             }
//                         //         ],
//                         //         "stateMutability": "view",
//                         //         "type": "function"
//                         //     },
//                         //     {
//                         //         "inputs": [
//                         //             {
//                         //                 "internalType": "uint256",
//                         //                 "name": "",
//                         //                 "type": "uint256"
//                         //             }
//                         //         ],
//                         //         "name": "tokenContentHashes",
//                         //         "outputs": [
//                         //             {
//                         //                 "internalType": "bytes32",
//                         //                 "name": "",
//                         //                 "type": "bytes32"
//                         //             }
//                         //         ],
//                         //         "stateMutability": "view",
//                         //         "type": "function"
//                         //     },
//                         //     {
//                         //         "inputs": [
//                         //             {
//                         //                 "internalType": "uint256",
//                         //                 "name": "",
//                         //                 "type": "uint256"
//                         //             }
//                         //         ],
//                         //         "name": "tokenCreators",
//                         //         "outputs": [
//                         //             {
//                         //                 "internalType": "address",
//                         //                 "name": "",
//                         //                 "type": "address"
//                         //             }
//                         //         ],
//                         //         "stateMutability": "view",
//                         //         "type": "function"
//                         //     },
//                         //     {
//                         //         "inputs": [
//                         //             {
//                         //                 "internalType": "uint256",
//                         //                 "name": "",
//                         //                 "type": "uint256"
//                         //             }
//                         //         ],
//                         //         "name": "tokenMetadataHashes",
//                         //         "outputs": [
//                         //             {
//                         //                 "internalType": "bytes32",
//                         //                 "name": "",
//                         //                 "type": "bytes32"
//                         //             }
//                         //         ],
//                         //         "stateMutability": "view",
//                         //         "type": "function"
//                         //     },
//                         //     {
//                         //         "inputs": [
//                         //             {
//                         //                 "internalType": "uint256",
//                         //                 "name": "tokenId",
//                         //                 "type": "uint256"
//                         //             }
//                         //         ],
//                         //         "name": "tokenMetadataURI",
//                         //         "outputs": [
//                         //             {
//                         //                 "internalType": "string",
//                         //                 "name": "",
//                         //                 "type": "string"
//                         //             }
//                         //         ],
//                         //         "stateMutability": "view",
//                         //         "type": "function"
//                         //     },
//                         //     {
//                         //         "inputs": [
//                         //             {
//                         //                 "internalType": "uint256",
//                         //                 "name": "tokenId",
//                         //                 "type": "uint256"
//                         //             }
//                         //         ],
//                         //         "name": "tokentype",
//                         //         "outputs": [
//                         //             {
//                         //                 "internalType": "string",
//                         //                 "name": "",
//                         //                 "type": "string"
//                         //             }
//                         //         ],
//                         //         "stateMutability": "view",
//                         //         "type": "function"
//                         //     },
//                         //     {
//                         //         "inputs": [
//                         //             {
//                         //                 "internalType": "uint256",
//                         //                 "name": "tokenId",
//                         //                 "type": "uint256"
//                         //             },
//                         //             {
//                         //                 "internalType": "string",
//                         //                 "name": "metadataURI",
//                         //                 "type": "string"
//                         //             }
//                         //         ],
//                         //         "name": "updateTokenMetadataURI",
//                         //         "outputs": [],
//                         //         "stateMutability": "nonpayable",
//                         //         "type": "function"
//                         //     },
//                         //     {
//                         //         "inputs": [
//                         //             {
//                         //                 "internalType": "uint256",
//                         //                 "name": "tokenId",
//                         //                 "type": "uint256"
//                         //             },
//                         //             {
//                         //                 "internalType": "string",
//                         //                 "name": "tokenURI",
//                         //                 "type": "string"
//                         //             }
//                         //         ],
//                         //         "name": "updateTokenURI",
//                         //         "outputs": [],
//                         //         "stateMutability": "nonpayable",
//                         //         "type": "function"
//                         //     },
//                         //     {
//                         //         "inputs": [
//                         //             {
//                         //                 "internalType": "uint256",
//                         //                 "name": "tokenId",
//                         //                 "type": "uint256"
//                         //             }
//                         //         ],
//                         //         "name": "uri",
//                         //         "outputs": [
//                         //             {
//                         //                 "internalType": "string",
//                         //                 "name": "",
//                         //                 "type": "string"
//                         //             }
//                         //         ],
//                         //         "stateMutability": "view",
//                         //         "type": "function"
//                         //     }
//                         // ];

//                         var contract2 = new connectWeb3.eth.Contract(abiArray, process.env.CONTRACT_ADDRESS,
//                             { from: process.env.ADMIN_WALLET_ADDRESS })

//                         const token_ids = tokens_that_needs_to_be_burn.map((dataset) => dataset.blockchain_id.toString());
//                         const array_of_amounts = tokens_that_needs_to_be_burn.map((dataset) => dataset.used_tokens.toString());
//                         console.log("token_ids", token_ids);
//                         console.log("array_of_amounts", array_of_amounts);
//                         console.log("required info", postID, 'Approved', selected_update_aware_token_found.aware_output_token_type, Number(assets_avaliable.weight), Number(assets_avaliable.weight), "useraddress", useraddress)

//                         // try {
//                         //     var check_balance = await contract.methods.balanceOfBatch([useraddress.toLowerCase(), useraddress.toLowerCase()], token_ids).call();
//                         //     console.log("check_balance", check_balance);
//                         // }

//                         try {
//                             var gasAmount = await contract2.methods.safeBatchTransferFrom(useraddress.toLowerCase(),
//                                 process.env.DUMP_WALLET_ADDRESS, token_ids, array_of_amounts, []).estimateGas({ from: useraddress });

//                             console.log("gasAmount", gasAmount)

//                             var increased = Number(gasAmount) * 0.2;
//                             gasAmount = Math.ceil(Number(gasAmount) + increased);

//                             connectWeb3.eth.getBalance(useraddress.toLowerCase()).then(
//                                 async function (balance) {

//                                     let iotxBalance = Big(balance).div(10 ** 18);

//                                     console.log("iotxBalance", iotxBalance.toFixed(18))

//                                     if (iotxBalance.toFixed(18) < 3) {

//                                         await transferAsync(useraddress.toLowerCase(), gasAmount).catch((ex) => { console.log("Error while transferAsync", ex) });

//                                         connectWeb3.eth.getBalance(useraddress.toLowerCase()).then(
//                                             async function (balance) {

//                                                 let iotxBalance = Big(balance).div(10 ** 18);

//                                                 // console.log("iotxBalance check", iotxBalance);
//                                                 // console.log("response", response);
//                                                 console.log("iotxBalance.toFixed(18)", iotxBalance.toFixed(18));

//                                                 if (iotxBalance.toFixed(18) > 0) {

//                                                     const gasPrice = await connectWeb3.eth.getGasPrice();
//                                                     const txConfig = {
//                                                         from: useraddress,
//                                                         to: process.env.CONTRACT_ADDRESS,
//                                                         gasPrice: gasPrice,
//                                                         gas: gasAmount.toString(),
//                                                         data: contract2.methods.safeBatchTransferFrom(useraddress.toLowerCase(),
//                                                             process.env.DUMP_WALLET_ADDRESS, token_ids, array_of_amounts, []).encodeABI(),
//                                                     };

//                                                     console.log("txConfig", txConfig);


//                                                     connectWeb3.eth.accounts.signTransaction(txConfig, `0x${privatekey}`,
//                                                         async function (err, signedTx) {
//                                                             err ? callback(false) : console.log("signedTx", signedTx);

//                                                             connectWeb3.eth.sendSignedTransaction(signedTx.rawTransaction)
//                                                                 .on("receipt", async function (receipt) {

//                                                                     console.log("Tx Hash (Receipt): ", receipt);
//                                                                     const token_data = {
//                                                                         blockchain_id: postID,
//                                                                         status: 'Approved',
//                                                                         type_of_token: selected_update_aware_token_found.aware_output_token_type,
//                                                                         total_tokens: Number(assets_avaliable.weight),
//                                                                         avaliable_tokens: Number(assets_avaliable.weight),
//                                                                     };
//                                                                     await update_aw_tokens.findOneAndUpdate({ _id: update_aware_token_id },
//                                                                         token_data, { new: true });

//                                                                     callback(true);


//                                                                 })
//                                                                 .on("error", async function (e) {
//                                                                     console.log("Error while burn token", e)
//                                                                     // loggerhandler.logger.error(`${e} ,update_aware_token_id:${update_aware_token_id}`);
//                                                                     // loggerhandler.logger.error(`${signedTx.transactionHash} ,transactionHash`);

//                                                                     console.log("Hello");

//                                                                     checkTransactionReceipt(connectWeb3, signedTx.transactionHash, postID,
//                                                                         selected_update_aware_token_found.aware_output_token_type, assets_avaliable.weight, update_aware_token_id, function (result) {
//                                                                             // Handle the result as needed
//                                                                             console.log("Transaction result:", result);

//                                                                             if (result == true) {
//                                                                                 callback(true);
//                                                                             }
//                                                                             else {
//                                                                                 callback(false);
//                                                                             }
//                                                                         });

//                                                                 });
//                                                         })
//                                                 }
//                                             })

//                                     }
//                                     else {
//                                         // await transferAsync(useraddress.toLowerCase(), gasAmount).catch((ex) => {
//                                         //     console.log("Error while transferAsync", ex)
//                                         // });

//                                         const gasPrice = await connectWeb3.eth.getGasPrice();
//                                         const txConfig = {
//                                             from: useraddress,
//                                             to: process.env.CONTRACT_ADDRESS,
//                                             gasPrice: gasPrice,
//                                             gas: gasAmount.toString(),
//                                             data: contract2.methods.safeBatchTransferFrom(useraddress.toLowerCase(),
//                                                 process.env.DUMP_WALLET_ADDRESS, token_ids, array_of_amounts, []).encodeABI(),
//                                         };

//                                         console.log("txConfig", txConfig);

//                                         connectWeb3.eth.accounts.signTransaction(txConfig, `0x${privatekey}`,
//                                             async function (err, signedTx) {
//                                                 err ? callback(false) : console.log("signedTx", signedTx);

//                                                 connectWeb3.eth.sendSignedTransaction(signedTx.rawTransaction)
//                                                     .on("receipt", async function (receipt) {
//                                                         console.log("Tx Hash (Receipt): ", receipt);
//                                                         const token_data = {
//                                                             blockchain_id: postID,
//                                                             status: 'Approved',
//                                                             type_of_token: selected_update_aware_token_found.aware_output_token_type,
//                                                             total_tokens: Number(assets_avaliable.weight),
//                                                             avaliable_tokens: Number(assets_avaliable.weight),
//                                                         };
//                                                         await update_aw_tokens.findOneAndUpdate({ _id: update_aware_token_id },
//                                                             token_data, { new: true });

//                                                         callback(true);

//                                                     })
//                                                     .on("error", async function (e) {
//                                                         console.log("Error while burn token", e)
//                                                         // loggerhandler.logger.error(`${e} ,update_aware_token_id:${update_aware_token_id}`);
//                                                         // loggerhandler.logger.error(`${signedTx.transactionHash} ,transactionHash`);

//                                                         console.log("Hello");
//                                                         checkTransactionReceipt(connectWeb3, signedTx.transactionHash, postID,
//                                                             selected_update_aware_token_found.aware_output_token_type, assets_avaliable.weight, update_aware_token_id, function (result) {
//                                                                 // Handle the result as needed
//                                                                 console.log("Transaction result:", result);

//                                                                 if (result == true) {
//                                                                     callback(true);
//                                                                 }
//                                                                 else {
//                                                                     callback(false);
//                                                                 }
//                                                             });

//                                                     });
//                                             })

//                                     }
//                                 })
//                         }
//                         catch (ex) {
//                             console.log("Error while safeBatchTransferFrom", ex);
//                             callback(false);
//                         }




//                         // // token approve without burn
//                         // const token_data = {
//                         //     blockchain_id: postID,
//                         //     status: 'Approved',
//                         //     type_of_token: selected_update_aware_token_found.aware_output_token_type,
//                         //     total_tokens: Number(assets_avaliable.weight),
//                         //     avaliable_tokens: Number(assets_avaliable.weight),
//                         // };
//                         // await update_aw_tokens.findOneAndUpdate({ _id: update_aware_token_id },
//                         //     token_data, { new: true });

//                         // callback(true);

//                     }
//                     else {
//                         console.log("SubGraph or Fleek issue");
//                         callback(false);
//                     }
//                     // }, "20000")
//                 })
//                 .on("error", async function (error) {
//                     console.log("updated_aware_asset_id", assets_avaliable.updated_aware_asset_id)
//                     console.log("error while minting", error)
//                     callback(false);
//                 });
//         })
//     }
//     catch (error) {
//         console.log(error);
//         callback(false);
//     }

// }


//New original
// var nonce2 = 0;
// const mintUpdateAwareToken = async (
//     file,
//     kyc_details_avaliable,
//     selected_update_aware_token_found,
//     assets_avaliable,
//     tracer_avaliable,
//     self_validation_avaliable,
//     company_compliances_avaliable,
//     useraddress,
//     _awareid,
//     update_aware_token_id,
//     callback
// ) => {

//     try {

//         const valueChainProcess = [
//             ...selected_update_aware_token_found.value_chain_process_main,
//             ...selected_update_aware_token_found.value_chain_process_sub
//         ].map(x => x.name);

//         const temp_transferred_tokens = await transferred_tokens.find({})
//             .select(['_id', 'blockchain_id']);

//         const temp_array = [];
//         const tokens_that_needs_to_be_burn = assets_avaliable.assetdataArrayMain.map((x) => {
//             const block = temp_transferred_tokens.find((k) => k._id.toString() === x.tt_id);

//             //we can comment this after checking balacne
//             temp_array.push({ "blockchain_id": block.blockchain_id, "To_be_Send": x.token_deduction })

//             return { used_tokens: x.token_deduction, blockchain_id: block.blockchain_id };
//         });

//         const previousTokenUsed = tokens_that_needs_to_be_burn.map((block) => block.blockchain_id);

//         const metadataJSON = generateMetadata("aware-20221012", {
//             version: "aware-20221012",
//             name: assets_avaliable._awareid,
//             description: update_aware_token_id.toString(),
//             date: new Date().toISOString(),
//             awareTokenType: selected_update_aware_token_found.aware_output_token_type,
//             awareAssetId: assets_avaliable.updated_aware_asset_id,
//             productionFacility: selected_update_aware_token_found.production_facility,
//             producer: kyc_details_avaliable.company_name,
//             batchNo: assets_avaliable.production_lot,
//             ProductionQty: assets_avaliable.quantity || '',
//             weightInKgs: assets_avaliable.weight,
//             valueChainProcess,
//             materialSpecs: assets_avaliable.material_specs || '',
//             color: assets_avaliable.main_color,
//             sustainableProcessClaim: assets_avaliable.sustainable_process_claim == true ? assets_avaliable.sustainable_process_certificates : [],
//             wetProcessing: assets_avaliable.wet_processing_t == true ? assets_avaliable.wet_processing : [],
//             tracer: {
//                 "tracerAdded": tracer_avaliable.tracer_added == true ? "Yes" : "No",
//                 "typeofTracer": tracer_avaliable.aware_tc_checked == true ? "aware" : "custom",
//                 "scandate": tracer_avaliable.aware_date || tracer_avaliable.custom_date || null
//             },
//             selfValidationCertificate: ['requested'],
//             environmentalScopeCertificate: company_compliances_avaliable.environmental_scope_certificates.map(x => x.documentname),
//             socialComplianceCertificate: company_compliances_avaliable.social_compliance_certificates.map(x => x.documentname),
//             chemicalComplianceCertificate: company_compliances_avaliable.chemical_compliance_certificates.map(x => x.documentname),
//             previousTokenDetail: previousTokenUsed
//         });

//         const contentHash = sha256FromBuffer(Buffer.from(file.buffer));
//         const metadataHash = sha256FromBuffer(Buffer.from(metadataJSON));

//         const data = {
//             "file": file,
//             "name": kyc_details_avaliable.company_name,
//             "metadata": metadataJSON
//         };


//         // Upload files to fleek
//         const upload = await postToFleekAsync(data);

//         // Collect fileUrl and metadataUrl from Fleek
//         const { fileUrl, metadataUrl } = upload.data;

//         // Construct mediaData object
//         const awareData = constructAwareData(
//             fileUrl,
//             metadataUrl,
//             contentHash,
//             metadataHash
//         );

//         console.log({ awareData })

//         // const tempnonce = await getNonce(process.env.ADMIN_WALLET_ADDRESS);
//         // console.log("ADMIN_WALLET_ADDRESS", process.env.ADMIN_WALLET_ADDRESS)
//         // console.log("tempnonce", tempnonce)

//         var amountInUint = assets_avaliable.weight;
//         var contract = new connectWeb3.eth.Contract(abiArray, process.env.CONTRACT_ADDRESS,
//             { from: process.env.ADMIN_WALLET_ADDRESS })

//         var gas_amount = await contract.methods.mint(awareData, useraddress, amountInUint).estimateGas({ from: process.env.ADMIN_WALLET_ADDRESS });

//         var tweenty_perc_increase = Number(gas_amount) * 0.2;
//         gas_amount = Math.ceil(Number(gas_amount) + tweenty_perc_increase);

//         var gas_price = await connectWeb3.eth.getGasPrice();

//         console.log("gas_amount", gas_amount.toString());
//         console.log("gas_price", gas_price.toString());

//         // var blockNumber = await connectWeb3.eth.getBlockNumber();
//         // const nonce = connectWeb3.eth.wallets.getAccount(process.env.ADMIN_WALLET_ADDRESS);
//         var nonce = await connectWeb3.eth.getTransactionCount(process.env.ADMIN_WALLET_ADDRESS);

//         // const nonce = await connectWeb3.eth.getTransactionCount(process.env.ADMIN_WALLET_ADDRESS);
//         // const pendingTransactions = await connectWeb3.eth.getBlock('pending');
//         // console.log("pendingTransactions",pendingTransactions);


//         // var blockDetails = await connectWeb3.eth.getBlock('latest');
//         // console.log("blockDetails", blockDetails);

//         // const gasLimit = blockDetails.gasLimit - pendingTransactions.transactions.length;
//         // console.log("gasLimit",gasLimit);

//         // const txConfig = {
//         //     from: process.env.ADMIN_WALLET_ADDRESS,
//         //     to: process.env.CONTRACT_ADDRESS,
//         //     gasPrice: "1000000000000",
//         //     gas: "850000",
//         //     // nonce: nonce2,
//         //     // gasLimit: blockDetails.gasLimit,
//         //     data: contract.methods.mint(awareData, useraddress, amountInUint).encodeABI(),
//         // };
//         // const gastogewi = connectWeb3.utils.toWei(tempgasAmount.toString());
//         // console.log("gastogewi",gastogewi);

//         const txConfig = {
//             from: process.env.ADMIN_WALLET_ADDRESS,
//             to: process.env.CONTRACT_ADDRESS,
//             gasPrice: gas_price.toString(),
//             gas: gas_amount.toString(),
//             nonce: nonce,
//             data: contract.methods.mint(awareData, useraddress, amountInUint).encodeABI(),
//         };

//         console.log("txConfig", txConfig)

//         //code that need to be uncommented
//         connectWeb3.eth.accounts.signTransaction(txConfig, process.env.ADMIN_PRIVATE_KEY, async function (err, signedTx) {
//             if (err) {

//                 console.log("err", err);
//                 callback(false);

//             }
//             console.log("signedTx", signedTx);

//             connectWeb3.eth.sendSignedTransaction(signedTx.rawTransaction)
//                 .on("receipt", async function (receipt) {

//                     console.log("Tx Hash (Receipt): ", receipt);

//                     const history = {
//                         _awareid: _awareid,
//                         update_aware_token_id: update_aware_token_id,
//                         transactionIndex: receipt.transactionIndex,
//                         transactionHash: receipt.transactionHash,
//                         blockHash: receipt.blockHash,
//                         blockNumber: receipt.blockNumber,
//                         from: receipt.from,
//                         to: receipt.to,
//                         cumulativeGasUsed: receipt.cumulativeGasUsed,
//                         gasUsed: receipt.gasUsed,
//                         contractAddress: receipt.contractAddress,
//                         logsBloom: receipt.logsBloom,
//                         logs: receipt.logs,
//                         status: receipt.status
//                     }

//                     await transaction_history.create(history);

//                     await sleep(10000);

//                     console.log("useraddress", useraddress)

//                     const query = gql`{
//                         awareTokens(
//                           where: { owner: "${useraddress.toLowerCase()}" }
//                           orderBy: createdAtTimestamp
//                           orderDirection: desc
//                           first: 1
//                         ) {
//                           id
//                           owner {
//                             id
//                                 }
//                             creator {
//                             id
//                                 }
//                             contentURI
//                             metadataURI
//                             amount
//                             createdAtTimestamp 
//                         }
//                       }`

//                     var result = await request(process.env.SUBGRAPH_URL, query).catch((ex) => {
//                         console.log("EXX", ex)
//                         console.log("EXX", ex.ClientError)
//                         console.log("EXX", ex.response)

//                     })

//                     console.log("result", result)

//                     const postID = result.awareTokens[0].id;

//                     const metadata = await axios.get(result.awareTokens[0].metadataURI);


//                     console.log("postID", result);
//                     // console.log("metadata.data.description", metadata)



//                     // const query = gql`{awareTokens(where: { owner: "${useraddress.toLowerCase()}" }) 
//                     // {
//                     //     id
//                     //     owner {
//                     //     id
//                     //         }
//                     //     creator {
//                     //     id
//                     //         }
//                     //     contentURI
//                     //     metadataURI
//                     //     amount
//                     //     createdAtTimestamp        
//                     //     }
//                     // }`

//                     // # query {
//                     //     #   awareTokens(
//                     //     #     where: { owner: "0xf01c00a9d5aec6dbfa23fcd7c82676df6f3d0fc0" }
//                     //     #     orderBy: createdAtTimestamp,
//                     //     #     orderDirection: desc,
//                     //     #     first: 1
//                     //     #   ) {
//                     //     #     id
//                     //     #     owner {
//                     //     #       id
//                     //     #     }
//                     //     #     creator {
//                     //     #       id
//                     //     #     }
//                     //     #     contentURI
//                     //     #     metadataURI
//                     //     #     amount
//                     //     #     createdAtTimestamp
//                     //     #   }
//                     //     # }

//                     // await sleep(20000);

//                     // setTimeout(async () => {
//                     // var result = await request(process.env.SUBGRAPH_URL, query)
//                     // var tokens_in_wallet = result.awareTokens.sort(compare).reverse();
//                     // console.log("tokens_in_wallet", tokens_in_wallet)

//                     // const postID = tokens_in_wallet[0].id;
//                     // console.log("postID", postID)
//                     // // console.log("amount", tokens_in_wallet[0].amount)

//                     //this one is latest
//                     // const calculateLatestCreation = (users) => {
//                     //     // Collect all users
//                     //     const allUsers = users.users;
//                     //     let allCreationIDs = [];

//                     //     // For each user
//                     //     for (const user of allUsers) {
//                     //         // If user has creations
//                     //         if (user.creations && user.creations.length > 0) {
//                     //             // For each creation
//                     //             for (const creation of user.creations) {
//                     //                 // Push creation ID (cast to int) to allCreationIDs
//                     //                 allCreationIDs.push(parseInt(creation.id));
//                     //             }
//                     //         }
//                     //     }

//                     //     // Return max creation ID
//                     //     return Math.max(...allCreationIDs);
//                     // };

//                     // const allUsers = await request(process.env.SUBGRAPH_URL, gql`
//                     //     {
//                     //       users {
//                     //           creations(orderBy: createdAtTimestamp, orderDirection: desc) {
//                     //             id
//                     //             createdAtTimestamp
//                     //           }
//                     //         }
//                     //       }
//                     //     `).catch((err) => { console.log("err", err) });

//                     // var postID = calculateLatestCreation(allUsers);

//                     // postID = 2334;
//                     // console.log("postID",postID)

//                     // const query2 = gql`{awareToken(id:"${postID.toString()}") {id,owner {id},creator {id},contentURI,metadataURI,amount,createdAtTimestamp}}`
//                     // var token = await request(process.env.SUBGRAPH_URL, query2)

//                     // console.log("token", token)
//                     // const metadata = await axios.get(token.awareToken.metadataURI);

//                     console.log("metadata.data.description", metadata.data.description)
//                     console.log("update_aware_token_id", update_aware_token_id)

//                     if (metadata.data.description == update_aware_token_id) {

//                         var wallet_of_sender = await wallets.findOne({ wallet_address_0x: useraddress })
//                             .select(['wallet_address_0x', 'from', 'to']);
//                         var key = wallet_of_sender.from + wallet_of_sender.to;
//                         var decrypted_private_key = helperfunctions.encryptAddress(key, 'decrypt');

//                         const privatekey = decrypted_private_key.substring(3, decrypted_private_key.length - 1);

//                         // var abiArray = [
//                         //     {
//                         //         "inputs": [],
//                         //         "stateMutability": "nonpayable",
//                         //         "type": "constructor"
//                         //     },
//                         //     {
//                         //         "anonymous": false,
//                         //         "inputs": [
//                         //             {
//                         //                 "indexed": true,
//                         //                 "internalType": "address",
//                         //                 "name": "account",
//                         //                 "type": "address"
//                         //             },
//                         //             {
//                         //                 "indexed": true,
//                         //                 "internalType": "address",
//                         //                 "name": "operator",
//                         //                 "type": "address"
//                         //             },
//                         //             {
//                         //                 "indexed": false,
//                         //                 "internalType": "bool",
//                         //                 "name": "approved",
//                         //                 "type": "bool"
//                         //             }
//                         //         ],
//                         //         "name": "ApprovalForAll",
//                         //         "type": "event"
//                         //     },
//                         //     {
//                         //         "anonymous": false,
//                         //         "inputs": [
//                         //             {
//                         //                 "indexed": true,
//                         //                 "internalType": "uint256",
//                         //                 "name": "_tokenId",
//                         //                 "type": "uint256"
//                         //             },
//                         //             {
//                         //                 "indexed": false,
//                         //                 "internalType": "address",
//                         //                 "name": "owner",
//                         //                 "type": "address"
//                         //             },
//                         //             {
//                         //                 "indexed": false,
//                         //                 "internalType": "string",
//                         //                 "name": "_uri",
//                         //                 "type": "string"
//                         //             }
//                         //         ],
//                         //         "name": "TokenMetadataURIUpdated",
//                         //         "type": "event"
//                         //     },
//                         //     {
//                         //         "anonymous": false,
//                         //         "inputs": [
//                         //             {
//                         //                 "indexed": true,
//                         //                 "internalType": "uint256",
//                         //                 "name": "_tokenId",
//                         //                 "type": "uint256"
//                         //             },
//                         //             {
//                         //                 "indexed": false,
//                         //                 "internalType": "address",
//                         //                 "name": "owner",
//                         //                 "type": "address"
//                         //             },
//                         //             {
//                         //                 "indexed": false,
//                         //                 "internalType": "string",
//                         //                 "name": "_uri",
//                         //                 "type": "string"
//                         //             }
//                         //         ],
//                         //         "name": "TokenURIUpdated",
//                         //         "type": "event"
//                         //     },
//                         //     {
//                         //         "anonymous": false,
//                         //         "inputs": [
//                         //             {
//                         //                 "indexed": true,
//                         //                 "internalType": "address",
//                         //                 "name": "operator",
//                         //                 "type": "address"
//                         //             },
//                         //             {
//                         //                 "indexed": true,
//                         //                 "internalType": "address",
//                         //                 "name": "from",
//                         //                 "type": "address"
//                         //             },
//                         //             {
//                         //                 "indexed": true,
//                         //                 "internalType": "address",
//                         //                 "name": "to",
//                         //                 "type": "address"
//                         //             },
//                         //             {
//                         //                 "indexed": false,
//                         //                 "internalType": "uint256[]",
//                         //                 "name": "ids",
//                         //                 "type": "uint256[]"
//                         //             },
//                         //             {
//                         //                 "indexed": false,
//                         //                 "internalType": "uint256[]",
//                         //                 "name": "values",
//                         //                 "type": "uint256[]"
//                         //             }
//                         //         ],
//                         //         "name": "TransferBatch",
//                         //         "type": "event"
//                         //     },
//                         //     {
//                         //         "anonymous": false,
//                         //         "inputs": [
//                         //             {
//                         //                 "indexed": true,
//                         //                 "internalType": "address",
//                         //                 "name": "operator",
//                         //                 "type": "address"
//                         //             },
//                         //             {
//                         //                 "indexed": true,
//                         //                 "internalType": "address",
//                         //                 "name": "from",
//                         //                 "type": "address"
//                         //             },
//                         //             {
//                         //                 "indexed": true,
//                         //                 "internalType": "address",
//                         //                 "name": "to",
//                         //                 "type": "address"
//                         //             },
//                         //             {
//                         //                 "indexed": false,
//                         //                 "internalType": "uint256",
//                         //                 "name": "id",
//                         //                 "type": "uint256"
//                         //             },
//                         //             {
//                         //                 "indexed": false,
//                         //                 "internalType": "uint256",
//                         //                 "name": "value",
//                         //                 "type": "uint256"
//                         //             }
//                         //         ],
//                         //         "name": "TransferSingle",
//                         //         "type": "event"
//                         //     },
//                         //     {
//                         //         "anonymous": false,
//                         //         "inputs": [
//                         //             {
//                         //                 "indexed": false,
//                         //                 "internalType": "string",
//                         //                 "name": "value",
//                         //                 "type": "string"
//                         //             },
//                         //             {
//                         //                 "indexed": true,
//                         //                 "internalType": "uint256",
//                         //                 "name": "id",
//                         //                 "type": "uint256"
//                         //             }
//                         //         ],
//                         //         "name": "URI",
//                         //         "type": "event"
//                         //     },
//                         //     {
//                         //         "inputs": [
//                         //             {
//                         //                 "internalType": "address",
//                         //                 "name": "account",
//                         //                 "type": "address"
//                         //             },
//                         //             {
//                         //                 "internalType": "uint256",
//                         //                 "name": "id",
//                         //                 "type": "uint256"
//                         //             }
//                         //         ],
//                         //         "name": "balanceOf",
//                         //         "outputs": [
//                         //             {
//                         //                 "internalType": "uint256",
//                         //                 "name": "",
//                         //                 "type": "uint256"
//                         //             }
//                         //         ],
//                         //         "stateMutability": "view",
//                         //         "type": "function"
//                         //     },
//                         //     {
//                         //         "inputs": [
//                         //             {
//                         //                 "internalType": "address[]",
//                         //                 "name": "accounts",
//                         //                 "type": "address[]"
//                         //             },
//                         //             {
//                         //                 "internalType": "uint256[]",
//                         //                 "name": "ids",
//                         //                 "type": "uint256[]"
//                         //             }
//                         //         ],
//                         //         "name": "balanceOfBatch",
//                         //         "outputs": [
//                         //             {
//                         //                 "internalType": "uint256[]",
//                         //                 "name": "",
//                         //                 "type": "uint256[]"
//                         //             }
//                         //         ],
//                         //         "stateMutability": "view",
//                         //         "type": "function"
//                         //     },
//                         //     {
//                         //         "inputs": [
//                         //             {
//                         //                 "internalType": "address",
//                         //                 "name": "from",
//                         //                 "type": "address"
//                         //             },
//                         //             {
//                         //                 "internalType": "uint256",
//                         //                 "name": "tokenId",
//                         //                 "type": "uint256"
//                         //             },
//                         //             {
//                         //                 "internalType": "uint256",
//                         //                 "name": "amount",
//                         //                 "type": "uint256"
//                         //             }
//                         //         ],
//                         //         "name": "burn",
//                         //         "outputs": [],
//                         //         "stateMutability": "nonpayable",
//                         //         "type": "function"
//                         //     },
//                         //     {
//                         //         "inputs": [
//                         //             {
//                         //                 "internalType": "address",
//                         //                 "name": "account",
//                         //                 "type": "address"
//                         //             },
//                         //             {
//                         //                 "internalType": "uint256[]",
//                         //                 "name": "ids",
//                         //                 "type": "uint256[]"
//                         //             },
//                         //             {
//                         //                 "internalType": "uint256[]",
//                         //                 "name": "values",
//                         //                 "type": "uint256[]"
//                         //             }
//                         //         ],
//                         //         "name": "burnBatch",
//                         //         "outputs": [],
//                         //         "stateMutability": "nonpayable",
//                         //         "type": "function"
//                         //     },
//                         //     {
//                         //         "inputs": [
//                         //             {
//                         //                 "internalType": "address",
//                         //                 "name": "account",
//                         //                 "type": "address"
//                         //             },
//                         //             {
//                         //                 "internalType": "address",
//                         //                 "name": "operator",
//                         //                 "type": "address"
//                         //             }
//                         //         ],
//                         //         "name": "isApprovedForAll",
//                         //         "outputs": [
//                         //             {
//                         //                 "internalType": "bool",
//                         //                 "name": "",
//                         //                 "type": "bool"
//                         //             }
//                         //         ],
//                         //         "stateMutability": "view",
//                         //         "type": "function"
//                         //     },
//                         //     {
//                         //         "inputs": [
//                         //             {
//                         //                 "components": [
//                         //                     {
//                         //                         "internalType": "string",
//                         //                         "name": "tokenURI",
//                         //                         "type": "string"
//                         //                     },
//                         //                     {
//                         //                         "internalType": "string",
//                         //                         "name": "metadataURI",
//                         //                         "type": "string"
//                         //                     },
//                         //                     {
//                         //                         "internalType": "bytes32",
//                         //                         "name": "contentHash",
//                         //                         "type": "bytes32"
//                         //                     },
//                         //                     {
//                         //                         "internalType": "bytes32",
//                         //                         "name": "metadataHash",
//                         //                         "type": "bytes32"
//                         //                     }
//                         //                 ],
//                         //                 "internalType": "struct IAwareToken.AwareData",
//                         //                 "name": "data",
//                         //                 "type": "tuple"
//                         //             },
//                         //             {
//                         //                 "internalType": "address",
//                         //                 "name": "recipient",
//                         //                 "type": "address"
//                         //             },
//                         //             {
//                         //                 "internalType": "uint256",
//                         //                 "name": "amount",
//                         //                 "type": "uint256"
//                         //             }
//                         //         ],
//                         //         "name": "mint",
//                         //         "outputs": [],
//                         //         "stateMutability": "nonpayable",
//                         //         "type": "function"
//                         //     },
//                         //     {
//                         //         "inputs": [
//                         //             {
//                         //                 "internalType": "uint256",
//                         //                 "name": "tokenId",
//                         //                 "type": "uint256"
//                         //             }
//                         //         ],
//                         //         "name": "ownerOf",
//                         //         "outputs": [
//                         //             {
//                         //                 "internalType": "address",
//                         //                 "name": "",
//                         //                 "type": "address"
//                         //             }
//                         //         ],
//                         //         "stateMutability": "view",
//                         //         "type": "function"
//                         //     },
//                         //     {
//                         //         "inputs": [
//                         //             {
//                         //                 "internalType": "uint256",
//                         //                 "name": "",
//                         //                 "type": "uint256"
//                         //             }
//                         //         ],
//                         //         "name": "previousTokenOwners",
//                         //         "outputs": [
//                         //             {
//                         //                 "internalType": "address",
//                         //                 "name": "",
//                         //                 "type": "address"
//                         //             }
//                         //         ],
//                         //         "stateMutability": "view",
//                         //         "type": "function"
//                         //     },
//                         //     {
//                         //         "inputs": [
//                         //             {
//                         //                 "internalType": "address",
//                         //                 "name": "from",
//                         //                 "type": "address"
//                         //             },
//                         //             {
//                         //                 "internalType": "address",
//                         //                 "name": "to",
//                         //                 "type": "address"
//                         //             },
//                         //             {
//                         //                 "internalType": "uint256[]",
//                         //                 "name": "ids",
//                         //                 "type": "uint256[]"
//                         //             },
//                         //             {
//                         //                 "internalType": "uint256[]",
//                         //                 "name": "amounts",
//                         //                 "type": "uint256[]"
//                         //             },
//                         //             {
//                         //                 "internalType": "bytes",
//                         //                 "name": "data",
//                         //                 "type": "bytes"
//                         //             }
//                         //         ],
//                         //         "name": "safeBatchTransferFrom",
//                         //         "outputs": [],
//                         //         "stateMutability": "nonpayable",
//                         //         "type": "function"
//                         //     },
//                         //     {
//                         //         "inputs": [
//                         //             {
//                         //                 "internalType": "address",
//                         //                 "name": "from",
//                         //                 "type": "address"
//                         //             },
//                         //             {
//                         //                 "internalType": "address",
//                         //                 "name": "to",
//                         //                 "type": "address"
//                         //             },
//                         //             {
//                         //                 "internalType": "uint256",
//                         //                 "name": "id",
//                         //                 "type": "uint256"
//                         //             },
//                         //             {
//                         //                 "internalType": "uint256",
//                         //                 "name": "amount",
//                         //                 "type": "uint256"
//                         //             },
//                         //             {
//                         //                 "internalType": "bytes",
//                         //                 "name": "data",
//                         //                 "type": "bytes"
//                         //             }
//                         //         ],
//                         //         "name": "safeTransferFrom",
//                         //         "outputs": [],
//                         //         "stateMutability": "nonpayable",
//                         //         "type": "function"
//                         //     },
//                         //     {
//                         //         "inputs": [
//                         //             {
//                         //                 "internalType": "address",
//                         //                 "name": "operator",
//                         //                 "type": "address"
//                         //             },
//                         //             {
//                         //                 "internalType": "bool",
//                         //                 "name": "approved",
//                         //                 "type": "bool"
//                         //             }
//                         //         ],
//                         //         "name": "setApprovalForAll",
//                         //         "outputs": [],
//                         //         "stateMutability": "nonpayable",
//                         //         "type": "function"
//                         //     },
//                         //     {
//                         //         "inputs": [
//                         //             {
//                         //                 "internalType": "uint256",
//                         //                 "name": "_tokenId",
//                         //                 "type": "uint256"
//                         //             },
//                         //             {
//                         //                 "internalType": "string",
//                         //                 "name": "_type",
//                         //                 "type": "string"
//                         //             }
//                         //         ],
//                         //         "name": "setTokenType",
//                         //         "outputs": [],
//                         //         "stateMutability": "nonpayable",
//                         //         "type": "function"
//                         //     },
//                         //     {
//                         //         "inputs": [
//                         //             {
//                         //                 "internalType": "bytes4",
//                         //                 "name": "interfaceId",
//                         //                 "type": "bytes4"
//                         //             }
//                         //         ],
//                         //         "name": "supportsInterface",
//                         //         "outputs": [
//                         //             {
//                         //                 "internalType": "bool",
//                         //                 "name": "",
//                         //                 "type": "bool"
//                         //             }
//                         //         ],
//                         //         "stateMutability": "view",
//                         //         "type": "function"
//                         //     },
//                         //     {
//                         //         "inputs": [
//                         //             {
//                         //                 "internalType": "uint256",
//                         //                 "name": "",
//                         //                 "type": "uint256"
//                         //             }
//                         //         ],
//                         //         "name": "tokenContentHashes",
//                         //         "outputs": [
//                         //             {
//                         //                 "internalType": "bytes32",
//                         //                 "name": "",
//                         //                 "type": "bytes32"
//                         //             }
//                         //         ],
//                         //         "stateMutability": "view",
//                         //         "type": "function"
//                         //     },
//                         //     {
//                         //         "inputs": [
//                         //             {
//                         //                 "internalType": "uint256",
//                         //                 "name": "",
//                         //                 "type": "uint256"
//                         //             }
//                         //         ],
//                         //         "name": "tokenCreators",
//                         //         "outputs": [
//                         //             {
//                         //                 "internalType": "address",
//                         //                 "name": "",
//                         //                 "type": "address"
//                         //             }
//                         //         ],
//                         //         "stateMutability": "view",
//                         //         "type": "function"
//                         //     },
//                         //     {
//                         //         "inputs": [
//                         //             {
//                         //                 "internalType": "uint256",
//                         //                 "name": "",
//                         //                 "type": "uint256"
//                         //             }
//                         //         ],
//                         //         "name": "tokenMetadataHashes",
//                         //         "outputs": [
//                         //             {
//                         //                 "internalType": "bytes32",
//                         //                 "name": "",
//                         //                 "type": "bytes32"
//                         //             }
//                         //         ],
//                         //         "stateMutability": "view",
//                         //         "type": "function"
//                         //     },
//                         //     {
//                         //         "inputs": [
//                         //             {
//                         //                 "internalType": "uint256",
//                         //                 "name": "tokenId",
//                         //                 "type": "uint256"
//                         //             }
//                         //         ],
//                         //         "name": "tokenMetadataURI",
//                         //         "outputs": [
//                         //             {
//                         //                 "internalType": "string",
//                         //                 "name": "",
//                         //                 "type": "string"
//                         //             }
//                         //         ],
//                         //         "stateMutability": "view",
//                         //         "type": "function"
//                         //     },
//                         //     {
//                         //         "inputs": [
//                         //             {
//                         //                 "internalType": "uint256",
//                         //                 "name": "tokenId",
//                         //                 "type": "uint256"
//                         //             }
//                         //         ],
//                         //         "name": "tokentype",
//                         //         "outputs": [
//                         //             {
//                         //                 "internalType": "string",
//                         //                 "name": "",
//                         //                 "type": "string"
//                         //             }
//                         //         ],
//                         //         "stateMutability": "view",
//                         //         "type": "function"
//                         //     },
//                         //     {
//                         //         "inputs": [
//                         //             {
//                         //                 "internalType": "uint256",
//                         //                 "name": "tokenId",
//                         //                 "type": "uint256"
//                         //             },
//                         //             {
//                         //                 "internalType": "string",
//                         //                 "name": "metadataURI",
//                         //                 "type": "string"
//                         //             }
//                         //         ],
//                         //         "name": "updateTokenMetadataURI",
//                         //         "outputs": [],
//                         //         "stateMutability": "nonpayable",
//                         //         "type": "function"
//                         //     },
//                         //     {
//                         //         "inputs": [
//                         //             {
//                         //                 "internalType": "uint256",
//                         //                 "name": "tokenId",
//                         //                 "type": "uint256"
//                         //             },
//                         //             {
//                         //                 "internalType": "string",
//                         //                 "name": "tokenURI",
//                         //                 "type": "string"
//                         //             }
//                         //         ],
//                         //         "name": "updateTokenURI",
//                         //         "outputs": [],
//                         //         "stateMutability": "nonpayable",
//                         //         "type": "function"
//                         //     },
//                         //     {
//                         //         "inputs": [
//                         //             {
//                         //                 "internalType": "uint256",
//                         //                 "name": "tokenId",
//                         //                 "type": "uint256"
//                         //             }
//                         //         ],
//                         //         "name": "uri",
//                         //         "outputs": [
//                         //             {
//                         //                 "internalType": "string",
//                         //                 "name": "",
//                         //                 "type": "string"
//                         //             }
//                         //         ],
//                         //         "stateMutability": "view",
//                         //         "type": "function"
//                         //     }
//                         // ];

//                         var contract2 = new connectWeb3.eth.Contract(abiArray, process.env.CONTRACT_ADDRESS,
//                             { from: process.env.ADMIN_WALLET_ADDRESS })

//                         const token_ids = tokens_that_needs_to_be_burn.map((dataset) => dataset.blockchain_id.toString());
//                         const array_of_amounts = tokens_that_needs_to_be_burn.map((dataset) => dataset.used_tokens.toString());
//                         console.log("token_ids", token_ids);
//                         console.log("array_of_amounts", array_of_amounts);
//                         console.log("required info", postID, 'Approved', selected_update_aware_token_found.aware_output_token_type, Number(assets_avaliable.weight), Number(assets_avaliable.weight), "useraddress", useraddress)

//                         // try {
//                         //     var check_balance = await contract.methods.balanceOfBatch([useraddress.toLowerCase(), useraddress.toLowerCase()], token_ids).call();
//                         //     console.log("check_balance", check_balance);
//                         // }





//                         // //check balance
//                         for (var i = 0; i < temp_array.length; i++) {

//                             var temp = temp_array[i];
//                             const owner = await contract.methods.ownerOf(temp.blockchain_id).call();
//                             // const creator = await contract.methods.creatorOf(temp.blockchain_id).call();

//                             //   const balance_admin = await contract.methods.balanceOf(process.env.ADMIN_WALLET_ADDRESS.toLowerCase(), temp.blockchain_id).call();;
//                             const balance_user = await contract.methods.balanceOf(useraddress.toLowerCase(), temp.blockchain_id).call();;
//                             const DUMP_WALLET_ADDRESS = await contract.methods.balanceOf(process.env.DUMP_WALLET_ADDRESS.toLowerCase(), temp.blockchain_id).call();;
//                             const owner_balacne = await contract.methods.balanceOf(owner.toLowerCase(), temp.blockchain_id).call();;

//                             console.log("To_be_Send", temp.To_be_Send);

//                             console.log("owner", owner)
//                             // console.log("creator", creator.toLowerCase())
//                             console.log("useraddress from token is transferring", useraddress.toLowerCase())

//                             console.log("owner_balacne", owner_balacne)
//                             console.log("useraddress balacne", balance_user)
//                             console.log("DUMP_WALLET_ADDRESS", DUMP_WALLET_ADDRESS)

//                         }


//                         // var wallet_of_owner = await wallets.findOne({ wallet_address_0x: owner })
//                         //     .select(['wallet_address_0x', 'from', 'to']);
//                         // var key = wallet_of_owner.from + wallet_of_owner.to;
//                         // var decrypted_private_key_2 = helperfunctions.encryptAddress(key, 'decrypt');

//                         // const privatekey_2 = decrypted_private_key_2.substring(3, decrypted_private_key_2.length - 1);

//                         // var gasAmount_2 = await contract2.methods.safeBatchTransferFrom(owner.toLowerCase(),
//                         //     process.env.DUMP_WALLET_ADDRESS, token_ids, array_of_amounts, []).estimateGas({ from: owner });

//                         // console.log("gasAmount_2", gasAmount_2)


//                         // const gasPrice_2 = await connectWeb3.eth.getGasPrice();
//                         // const txConfig_2 = {
//                         //     from: owner,
//                         //     to: process.env.CONTRACT_ADDRESS,
//                         //     gasPrice: gasPrice_2,
//                         //     gas: gasAmount_2.toString(),
//                         //     data: contract2.methods.safeBatchTransferFrom(owner.toLowerCase(),
//                         //     useraddress, token_ids, array_of_amounts, []).encodeABI(),
//                         // };

//                         //This is our main code
//                         try {
//                             var gasAmount = await contract2.methods.safeBatchTransferFrom(useraddress.toLowerCase(),
//                                 process.env.DUMP_WALLET_ADDRESS, token_ids, array_of_amounts, []).estimateGas({ from: useraddress });

//                             console.log("gasAmount", gasAmount)

//                             var increased = Number(gasAmount) * 0.2;
//                             gasAmount = Math.ceil(Number(gasAmount) + increased);

//                             connectWeb3.eth.getBalance(useraddress.toLowerCase()).then(
//                                 async function (balance) {

//                                     let iotxBalance = Big(balance).div(10 ** 18);

//                                     console.log("iotxBalance", iotxBalance.toFixed(18))

//                                     if (iotxBalance.toFixed(18) < 3) {

//                                         await transferAsync(useraddress.toLowerCase(), gasAmount).catch((ex) => { console.log("Error while transferAsync", ex) });

//                                         connectWeb3.eth.getBalance(useraddress.toLowerCase()).then(
//                                             async function (balance) {

//                                                 let iotxBalance = Big(balance).div(10 ** 18);

//                                                 // console.log("iotxBalance check", iotxBalance);
//                                                 // console.log("response", response);
//                                                 console.log("iotxBalance.toFixed(18)", iotxBalance.toFixed(18));

//                                                 if (iotxBalance.toFixed(18) > 0) {

//                                                     const gasPrice = await connectWeb3.eth.getGasPrice();
//                                                     const txConfig = {
//                                                         from: useraddress,
//                                                         to: process.env.CONTRACT_ADDRESS,
//                                                         gasPrice: gasPrice,
//                                                         gas: gasAmount.toString(),
//                                                         data: contract2.methods.safeBatchTransferFrom(useraddress.toLowerCase(),
//                                                             process.env.DUMP_WALLET_ADDRESS, token_ids, array_of_amounts, []).encodeABI(),
//                                                     };

//                                                     console.log("txConfig", txConfig);


//                                                     connectWeb3.eth.accounts.signTransaction(txConfig, `0x${privatekey}`,
//                                                         async function (err, signedTx) {
//                                                             err ? callback(false) : console.log("signedTx", signedTx);

//                                                             connectWeb3.eth.sendSignedTransaction(signedTx.rawTransaction)
//                                                                 .on("receipt", async function (receipt) {

//                                                                     console.log("Tx Hash (Receipt): ", receipt);
//                                                                     const token_data = {
//                                                                         blockchain_id: postID,
//                                                                         status: 'Approved',
//                                                                         type_of_token: selected_update_aware_token_found.aware_output_token_type,
//                                                                         total_tokens: Number(assets_avaliable.weight),
//                                                                         avaliable_tokens: Number(assets_avaliable.weight),
//                                                                     };
//                                                                     await update_aw_tokens.findOneAndUpdate({ _id: update_aware_token_id },
//                                                                         token_data, { new: true });

//                                                                     callback(true);


//                                                                 })
//                                                                 .on("error", async function (e) {
//                                                                     console.log("Error while burn token", e)
//                                                                     // loggerhandler.logger.error(`${e} ,update_aware_token_id:${update_aware_token_id}`);
//                                                                     // loggerhandler.logger.error(`${signedTx.transactionHash} ,transactionHash`);

//                                                                     console.log("Hello");

//                                                                     checkTransactionReceipt(connectWeb3, signedTx.transactionHash, postID,
//                                                                         selected_update_aware_token_found.aware_output_token_type, assets_avaliable.weight, update_aware_token_id, function (result) {
//                                                                             // Handle the result as needed
//                                                                             console.log("Transaction result:", result);

//                                                                             if (result == true) {
//                                                                                 callback(true);
//                                                                             }
//                                                                             else {
//                                                                                 callback(false);
//                                                                             }
//                                                                         });

//                                                                 });
//                                                         })
//                                                 }
//                                             })

//                                     }
//                                     else {
//                                         // await transferAsync(useraddress.toLowerCase(), gasAmount).catch((ex) => {
//                                         //     console.log("Error while transferAsync", ex)
//                                         // });

//                                         const gasPrice = await connectWeb3.eth.getGasPrice();
//                                         const txConfig = {
//                                             from: useraddress,
//                                             to: process.env.CONTRACT_ADDRESS,
//                                             gasPrice: gasPrice,
//                                             gas: gasAmount.toString(),
//                                             data: contract2.methods.safeBatchTransferFrom(useraddress.toLowerCase(),
//                                                 process.env.DUMP_WALLET_ADDRESS, token_ids, array_of_amounts, []).encodeABI(),
//                                         };

//                                         console.log("txConfig", txConfig);

//                                         connectWeb3.eth.accounts.signTransaction(txConfig, `0x${privatekey}`,
//                                             async function (err, signedTx) {
//                                                 err ? callback(false) : console.log("signedTx", signedTx);

//                                                 connectWeb3.eth.sendSignedTransaction(signedTx.rawTransaction)
//                                                     .on("receipt", async function (receipt) {
//                                                         console.log("Tx Hash (Receipt): ", receipt);
//                                                         const token_data = {
//                                                             blockchain_id: postID,
//                                                             status: 'Approved',
//                                                             type_of_token: selected_update_aware_token_found.aware_output_token_type,
//                                                             total_tokens: Number(assets_avaliable.weight),
//                                                             avaliable_tokens: Number(assets_avaliable.weight),
//                                                         };
//                                                         await update_aw_tokens.findOneAndUpdate({ _id: update_aware_token_id },
//                                                             token_data, { new: true });

//                                                         callback(true);

//                                                     })
//                                                     .on("error", async function (e) {
//                                                         console.log("Error while burn token", e)
//                                                         // loggerhandler.logger.error(`${e} ,update_aware_token_id:${update_aware_token_id}`);
//                                                         // loggerhandler.logger.error(`${signedTx.transactionHash} ,transactionHash`);

//                                                         console.log("Hello");
//                                                         checkTransactionReceipt(connectWeb3, signedTx.transactionHash, postID,
//                                                             selected_update_aware_token_found.aware_output_token_type, assets_avaliable.weight, update_aware_token_id, function (result) {
//                                                                 // Handle the result as needed
//                                                                 console.log("Transaction result:", result);

//                                                                 if (result == true) {
//                                                                     callback(true);
//                                                                 }
//                                                                 else {
//                                                                     callback(false);
//                                                                 }
//                                                             });

//                                                     });
//                                             })

//                                     }
//                                 })
//                         }
//                         catch (ex) {
//                             console.log("Error while safeBatchTransferFrom", ex);
//                             callback(false);
//                         }




//                         // // token approve without burn
//                         // const token_data = {
//                         //     blockchain_id: postID,
//                         //     status: 'Approved',
//                         //     type_of_token: selected_update_aware_token_found.aware_output_token_type,
//                         //     total_tokens: Number(assets_avaliable.weight),
//                         //     avaliable_tokens: Number(assets_avaliable.weight),
//                         // };
//                         // await update_aw_tokens.findOneAndUpdate({ _id: update_aware_token_id },
//                         //     token_data, { new: true });

//                         // callback(true);

//                     }
//                     else {
//                         console.log("SubGraph or Fleek issue");
//                         callback(false);
//                     }
//                     // }, "20000")
//                 })
//                 .on("error", async function (error) {
//                     console.log("updated_aware_asset_id", assets_avaliable.updated_aware_asset_id)
//                     console.log("error while minting", error)
//                     callback(false);
//                 });
//         })
//     }
//     catch (error) {
//         console.log(error);
//         callback(false);
//     }

// }


var nonce2 = 0;
const mintUpdateAwareToken = async (
    file,
    kyc_details_avaliable,
    selected_update_aware_token_found,
    assets_avaliable,
    tracer_avaliable,
    self_validation_avaliable,
    company_compliances_avaliable,
    useraddress,
    _awareid,
    update_aware_token_id,
    callback
) => {
    try {
        // Step 1: Prepare valueChainProcess array
        const valueChainProcess = [
            ...selected_update_aware_token_found.value_chain_process_main,
            ...selected_update_aware_token_found.value_chain_process_sub
        ].map(x => x.name);

        // Step 2: Retrieve transferred tokens from the database
        const temp_transferred_tokens = await transferred_tokens.find({}).select(['_id', 'blockchain_id']);
        const temp_array = [];

        // Step 3: Map and prepare tokens that need to be burned
        const tokens_that_needs_to_be_burn = assets_avaliable.assetdataArrayMain.map((x) => {
            const block = temp_transferred_tokens.find((k) => k._id.toString() === x.tt_id);

            temp_array.push({ "blockchain_id": block.blockchain_id, "To_be_Send": x.token_deduction });

            return { used_tokens: x.token_deduction, blockchain_id: block.blockchain_id };
        });

        const previousTokenUsed = tokens_that_needs_to_be_burn.map((block) => block.blockchain_id);

        // Step 4: Generate metadata JSON
        const metadataJSON = generateMetadata("aware-20221012", {
            version: "aware-20221012",
            name: assets_avaliable._awareid,
            description: update_aware_token_id.toString(),
            date: new Date().toISOString(),
            awareTokenType: selected_update_aware_token_found.aware_output_token_type,
            awareAssetId: assets_avaliable.updated_aware_asset_id,
            productionFacility: selected_update_aware_token_found.production_facility,
            producer: kyc_details_avaliable.company_name,
            batchNo: assets_avaliable.production_lot,
            ProductionQty: assets_avaliable.quantity ? assets_avaliable.quantity : '',
            weightInKgs: assets_avaliable.weight,
            valueChainProcess: valueChainProcess,
            materialSpecs: assets_avaliable.material_specs || '',
            color: assets_avaliable.main_color,
            sustainableProcessClaim: assets_avaliable.sustainable_process_claim == true ? assets_avaliable.sustainable_process_certificates : [],
            wetProcessing: assets_avaliable.wet_processing_t == true ? assets_avaliable.wet_processing : [],
            tracer: {
                "tracerAdded": tracer_avaliable.tracer_added == true ? "Yes" : "No",
                "typeofTracer": tracer_avaliable.aware_tc_checked == true ? "aware" : "custom",
                "scandate": tracer_avaliable.aware_date ? tracer_avaliable.aware_date.toString() : tracer_avaliable.custom_date ? tracer_avaliable.custom_date.toString() : ''
            },
            selfValidationCertificate: ['requested'],
            environmentalScopeCertificate: company_compliances_avaliable.environmental_scope_certificates.map(x => x.documentname),
            socialComplianceCertificate: company_compliances_avaliable.social_compliance_certificates.map(x => x.documentname),
            chemicalComplianceCertificate: company_compliances_avaliable.chemical_compliance_certificates.map(x => x.documentname),
            previousTokenDetail: previousTokenUsed
        });

        console.log("metadataJSON", metadataJSON);

        // Step 5: Read file and hash content & metadata
        const file_read = fs.readFileSync(file); // Read file into a buffer
        const contentHash = sha256FromBuffer(Buffer.from(file_read));
        const metadataHash = sha256FromBuffer(Buffer.from(metadataJSON));

        const data = {
            "file": file,
            "metadata": metadataJSON
        };

        // Step 6: Upload files to Fleek
        const upload = await postToFleekAsync(data).catch((ex) => { callback(false); });

        // Step 7: Collect fileUrl and metadataUrl from Fleek
        const { fileUrl, metadataUrl } = upload.data;

        // Step 8: Construct mediaData object
        const awareData = constructAwareData(fileUrl, metadataUrl, contentHash, metadataHash);
        console.log({ awareData });

        var amountInUint = assets_avaliable.weight;
        var contract = new connectWeb3.eth.Contract(abiArray, process.env.CONTRACT_ADDRESS, { from: process.env.ADMIN_WALLET_ADDRESS });

        // // Step 9: Estimate gas amount for minting
        // var gas_amount = await contract.methods.mint(awareData, useraddress, amountInUint).estimateGas({ from: process.env.ADMIN_WALLET_ADDRESS });

        // var tweenty_perc_increase = Number(gas_amount) * 0.2;
        // gas_amount = Math.ceil(Number(gas_amount) + tweenty_perc_increase);

        // // Step 10: Get gas price and nonce
        // var gas_price = await connectWeb3.eth.getGasPrice();
        // var nonce = await connectWeb3.eth.getTransactionCount(process.env.ADMIN_WALLET_ADDRESS);

        let gas_amount;
        let gas_price;
        let nonce;
        try {
            // Step 9: Estimate gas amount for minting
            gas_amount = await contract.methods.mint(awareData, useraddress, amountInUint).estimateGas({ from: process.env.ADMIN_WALLET_ADDRESS });
            var tweenty_perc_increase = Number(gas_amount) * 0.2;
            gas_amount = Math.ceil(Number(gas_amount) + tweenty_perc_increase);

            // Step 10: Get gas price and nonce
            gas_price = await connectWeb3.eth.getGasPrice();
            nonce = await connectWeb3.eth.getTransactionCount(process.env.ADMIN_WALLET_ADDRESS);
        } catch (error) {
            console.log("Error estimating gas", error);
            loggerhandler.logger.error('Error estimating gas - ', error);
            callback(false);
            return;
        }


        // Step 11: Configure transaction
        const txConfig = {
            from: process.env.ADMIN_WALLET_ADDRESS,
            to: process.env.CONTRACT_ADDRESS,
            gasPrice: gas_price.toString(),
            gas: gas_amount.toString(),
            nonce: nonce,
            data: contract.methods.mint(awareData, useraddress, amountInUint).encodeABI(),
        };

        console.log("txConfig", txConfig);

        
        let attempt = 0;
        const maxRetries = 5; // Set the maximum number of retries in case of failure
        const retryDelay = 5000; // Retry delay in milliseconds

        // Step 12: Sign and send the transaction
        const sendTransaction = async () => {
            try {

                connectWeb3.eth.accounts.signTransaction(txConfig, process.env.ADMIN_PRIVATE_KEY, async function (err, signedTx) {
                    if (err) {
                        callback(false);
                    }

                    console.log("signedTx", signedTx);

                    connectWeb3.eth.sendSignedTransaction(signedTx.rawTransaction)
                        .on("receipt", async function (receipt) {
                            console.log("Tx Hash (Receipt): ", receipt);

                            // Step 13: Store transaction history
                            const history = {
                                _awareid: _awareid,
                                update_aware_token_id: update_aware_token_id,
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
                                status: receipt.status
                            };

                            await transaction_history.create(history);

                            // Step 14: Sleep to wait for subgraph query
                            await sleep(10000);

                            const temp_query = gql`
                                {
                                    awareTokens(where: { owner: "0x125f06b203ad5c43905b7c420dc1e420b515faee" }) {
                                        id
                                        owner { id }
                                        creator { id }
                                        contentURI
                                        metadataURI
                                        amount
                                        createdAtTimestamp        
                                    }
                                }`;

                            await sleep(20000);
                            // await sleep(50000);


                            // Step 15: Fetch temp result from the subgraph
                            var temp_result = await request(process.env.SUBGRAPH_URL, temp_query);
                            var temp_tokens_in_wallet = temp_result.awareTokens.sort(compare).reverse();
                            console.log("temp_tokens_in_wallet", temp_tokens_in_wallet);

                            const query = gql`
                                {
                                    awareTokens(
                                        where: { owner: "${useraddress.toLowerCase()}" }
                                        orderBy: createdAtTimestamp
                                        orderDirection: desc
                                        first: 1
                                    ) {
                                        id
                                        owner { id }
                                        creator { id }
                                        contentURI
                                        metadataURI
                                        amount
                                        createdAtTimestamp 
                                    }
                                }`;

                            // Step 16: Fetch result from the subgraph
                            var result = await request(process.env.SUBGRAPH_URL, query).catch((ex) => { console.log("EXX", ex); });
                            console.log("SUBGRAPH_Result", result);
                            const postID = result.awareTokens[0].id;
                            console.log("post", postID);

                            // Step 17: Retry loop for fetching metadata
                            let response = null;
                            let metadata = null;
                            let startTime = null;
                            let endTime = null;
                            let attempt = 0; // Initialize attempt counter
                            const maxRetries = 60; // Set the maximum number of retries
                            const retryDelay = 5000; // Retry delay in milliseconds
                            const dnsLookupTime = 0;
                            const connectionTime = 0;


                            while (attempt < maxRetries) {
                                try {
                                    console.log(`Attempt ${attempt + 1} to fetch metadata...`);

                                    startTime = performance.now();
                                    response = await fetch(result.awareTokens[0].metadataURI, { method: 'HEAD' });

                                    // Check if the response is not OK
                                    if (!response.ok) {
                                        throw new Error(`HTTP error! status: ${response.status}`);
                                    }

                                    endTime = performance.now();

                                    metadata = await axios.get(result.awareTokens[0].metadataURI);

                                    console.log(`HTTP/${response.status}`);
                                    console.log('Headers:');
                                    response.headers.forEach((value, key) => {
                                        console.log(`${key}: ${value}`);
                                    });

                                    console.log(`\nRequest Timing: ${(endTime - startTime).toFixed(2)}ms`);

                                    // **Server-Timing**
                                    if (response.headers.get('server-timing')) {
                                        console.log('Server Timing Info:', response.headers.get('server-timing'));
                                    }

                                    // **Cloudflare Request ID**
                                    if (response.headers.get('cf-ray')) {
                                        console.log('Cloudflare Request ID:', response.headers.get('cf-ray'));
                                    }

                                    // **Forwarded Information**
                                    if (response.headers.get('x-forwarded-for')) {
                                        console.log('Forwarded For (Client IP):', response.headers.get('x-forwarded-for'));
                                    }
                                    if (response.headers.get('x-forwarded-proto')) {
                                        console.log('Forwarded Protocol:', response.headers.get('x-forwarded-proto'));
                                    }
                                    if (response.headers.get('via')) {
                                        console.log('Via (Proxy Info):', response.headers.get('via'));
                                    }

                                    // **Response Size**
                                    if (response.headers.get('content-length')) {
                                        console.log('Response Size (Content-Length):', response.headers.get('content-length'), 'bytes');
                                    }

                                    // **Latency Breakdown**
                                    console.log('Latency Breakdown:');
                                    console.log(`- DNS Lookup: ${(dnsLookupTime || 0).toFixed(2)}ms`);
                                    console.log(`- Connection Time: ${(connectionTime || 0).toFixed(2)}ms`);
                                    console.log(`- Transfer Time: ${(endTime - startTime).toFixed(2)}ms`);

                                    // Exit loop if fetch is successful
                                    break;
                                } catch (error) {
                                    console.error(`Error fetching metadata on attempt ${attempt + 1}:`, error.message);

                                    loggerhandler.logger.error(`Error fetching metadata on attempt ${attempt + 1}:`, error.message);


                                    endTime = performance.now();

                                    console.log(`HTTP/${response.status}`);
                                    console.log('Headers:');
                                    response.headers.forEach((value, key) => {
                                        console.log(`${key}: ${value}`);
                                    });

                                    console.log(`\nRequest Timing: ${(endTime - startTime).toFixed(2)}ms`);

                                    // **Server-Timing**
                                    if (response.headers.get('server-timing')) {
                                        console.log('Server Timing Info:', response.headers.get('server-timing'));
                                    }

                                    // **Cloudflare Request ID**
                                    if (response.headers.get('cf-ray')) {
                                        console.log('Cloudflare Request ID:', response.headers.get('cf-ray'));
                                    }

                                    // **Forwarded Information**
                                    if (response.headers.get('x-forwarded-for')) {
                                        console.log('Forwarded For (Client IP):', response.headers.get('x-forwarded-for'));
                                    }
                                    if (response.headers.get('x-forwarded-proto')) {
                                        console.log('Forwarded Protocol:', response.headers.get('x-forwarded-proto'));
                                    }
                                    if (response.headers.get('via')) {
                                        console.log('Via (Proxy Info):', response.headers.get('via'));
                                    }

                                    // **Response Size**
                                    if (response.headers.get('content-length')) {
                                        console.log('Response Size (Content-Length):', response.headers.get('content-length'), 'bytes');
                                    }

                                    // **Latency Breakdown**
                                    console.log('Latency Breakdown:');
                                    console.log(`- DNS Lookup: ${(dnsLookupTime || 0).toFixed(2)}ms`);
                                    console.log(`- Connection Time: ${(connectionTime || 0).toFixed(2)}ms`);
                                    console.log(`- Transfer Time: ${(endTime - startTime).toFixed(2)}ms`);

                                    attempt++;

                                    if (attempt < maxRetries) {
                                        console.log(`Retrying after ${retryDelay}ms...`);
                                        await new Promise((resolve) => setTimeout(resolve, retryDelay));
                                    } else {
                                        console.log("Max retries reached. Returning callback(false).");
                                        callback(false);
                                        return;
                                    }
                                }
                            }

                            console.log("NEW ISSUE OF METADATA", metadata)

                            // Step 18: Check if metadata matches the update aware token ID
                            if (metadata.data.description == update_aware_token_id) {
                                try {
                                    // Retrieve sender's wallet details
                                    const wallet_of_sender = await wallets.findOne({ wallet_address_0x: useraddress }).select(['wallet_address_0x', 'from', 'to']);
                                    console.log({ wallet_of_sender })

                                    const key = wallet_of_sender.from + wallet_of_sender.to;

                                    console.log({ key })


                                    // const testEncrypt = helperfunctions.encryptAddress('test123', 'encrypt');
                                    // const testDecrypt = helperfunctions.encryptAddress(testEncrypt, 'decrypt');
                                    // console.log('Roundtrip:', testDecrypt); // Should output 'test123'

                                    const decrypted_private_key = helperfunctions.encryptAddress(key, 'decrypt');

                                    console.log({ decrypted_private_key })

                                    const privatekey = decrypted_private_key.substring(3, decrypted_private_key.length - 1);

                                    // Setup contract interaction
                                    const contract2 = new connectWeb3.eth.Contract(abiArray, process.env.CONTRACT_ADDRESS, {
                                        from: process.env.ADMIN_WALLET_ADDRESS
                                    });

                                    // Prepare token IDs and amounts to burn
                                    const token_ids = tokens_that_needs_to_be_burn.map(dataset => dataset.blockchain_id.toString());
                                    const array_of_amounts = tokens_that_needs_to_be_burn.map(dataset => dataset.used_tokens.toString());

                                    // Check balance for each token
                                    for (let i = 0; i < temp_array.length; i++) {
                                        const temp = temp_array[i];

                                        const owner = await contract.methods.ownerOf(temp.blockchain_id).call();
                                        const balance_user = await contract.methods.balanceOf(useraddress.toLowerCase(), temp.blockchain_id).call();
                                        const DUMP_WALLET_ADDRESS = await contract.methods.balanceOf(process.env.DUMP_WALLET_ADDRESS.toLowerCase(), temp.blockchain_id).call();
                                        const owner_balance = await contract.methods.balanceOf(owner.toLowerCase(), temp.blockchain_id).call();

                                        console.log("To_be_Send", temp.To_be_Send);
                                        console.log("owner", owner)
                                        console.log("useraddress from token is transferring", useraddress.toLowerCase())
                                        console.log("owner_balacne", owner_balance)
                                        console.log("useraddress balacne", balance_user)
                                        console.log("DUMP_WALLET_ADDRESS", DUMP_WALLET_ADDRESS)

                                    }

                                    // Main transfer logic
                                    try {
                                        console.log("Original is working");

                                        let gasAmount = await contract2.methods.safeBatchTransferFrom(
                                            useraddress.toLowerCase(),
                                            process.env.DUMP_WALLET_ADDRESS,
                                            token_ids,
                                            array_of_amounts,
                                            []
                                        ).estimateGas({ from: useraddress });


                                        let increasedGasAmount = Math.ceil(Number(gasAmount) * 1.2); // Adding 20% buffer

                                        const userBalance = await connectWeb3.eth.getBalance(useraddress.toLowerCase());
                                        const iotxBalance = Big(userBalance).div(10 ** 18);

                                        if (iotxBalance.toFixed(18) < 3) {
                                            // If balance is low, transfer IOTX to cover gas
                                            await transferAsync(useraddress.toLowerCase(), increasedGasAmount).catch(ex => console.log("Error in transferAsync", ex));
                                            const userBalanceAfterTransfer = await connectWeb3.eth.getBalance(useraddress.toLowerCase());
                                            const iotxBalanceAfterTransfer = Big(userBalanceAfterTransfer).div(10 ** 18);

                                            if (iotxBalanceAfterTransfer.toFixed(18) <= 0) {
                                                callback(false);
                                                return;
                                            }
                                        }

                                        const gasPrice = await connectWeb3.eth.getGasPrice();
                                        const txConfig = {
                                            from: useraddress,
                                            to: process.env.CONTRACT_ADDRESS,
                                            gasPrice: gasPrice,
                                            gas: increasedGasAmount.toString(),
                                            data: contract2.methods.safeBatchTransferFrom(
                                                useraddress.toLowerCase(),
                                                process.env.DUMP_WALLET_ADDRESS,
                                                token_ids,
                                                array_of_amounts,
                                                []
                                            ).encodeABI(),
                                        };

                                        connectWeb3.eth.accounts.signTransaction(txConfig, `0x${privatekey}`, async function (err, signedTx) {
                                            if (err) {
                                                callback(false);
                                                return;
                                            }

                                            connectWeb3.eth.sendSignedTransaction(signedTx.rawTransaction)
                                                .on("receipt", async function (receipt) {
                                                    console.log("Tx Hash (Receipt): ", receipt);
                                                    const token_data = {
                                                        blockchain_id: postID,
                                                        status: 'Approved',
                                                        type_of_token: selected_update_aware_token_found.aware_output_token_type,
                                                        total_tokens: Number(assets_avaliable.weight),
                                                        avaliable_tokens: Number(assets_avaliable.weight),
                                                    };
                                                    await update_aw_tokens.findOneAndUpdate({ _id: update_aware_token_id }, token_data, { new: true });
                                                    callback(true);
                                                })
                                                .on("error", async function (e) {
                                                    console.log("Error while burning token", e);
                                                    loggerhandler.logger.error("Error while burning token", e);

                                                    checkTransactionReceipt(connectWeb3, signedTx.transactionHash, postID, selected_update_aware_token_found.aware_output_token_type, assets_avaliable.weight, update_aware_token_id, function (result) {
                                                        console.log("Transaction result:", result);
                                                        callback(result);
                                                    });
                                                });
                                        });

                                    } catch (error) {
                                        console.log("Error in safeBatchTransferFrom", error);
                                        loggerhandler.logger.error("Error in safeBatchTransferFrom", error);
                                        callback(false);
                                    }


                                    // // token approve without burn
                                    // const token_data = {
                                    //     blockchain_id: postID,
                                    //     status: 'Approved',
                                    //     type_of_token: selected_update_aware_token_found.aware_output_token_type,
                                    //     total_tokens: Number(assets_avaliable.weight),
                                    //     avaliable_tokens: Number(assets_avaliable.weight),
                                    // };
                                    // await update_aw_tokens.findOneAndUpdate({ _id: update_aware_token_id },
                                    //     token_data, { new: true });

                                    // callback(true);
                                } catch (ex) {
                                    console.log("Error in metadata check or contract interaction", ex);
                                    callback(false);
                                }
                            } else {
                                console.log("SubGraph or Fleek issue");
                                callback(false);
                            }
                        })
                        .on("error", async function (e) {
                            console.log("Error sending transaction", e);

                            loggerhandler.logger.error('Error sending transaction" - ', e);


                            if (attempt < maxRetries) {
                                attempt++;
                                console.log(`Retrying transaction, attempt ${attempt}`);
                                await new Promise(resolve => setTimeout(resolve, retryDelay));
                                sendTransaction();
                            } else {
                                console.log("Max retries reached, transaction failed.");
                                callback(false);
                            }
                        });
                });

            }
            catch (ex) {
                console.log("Error in sending transaction", ex);
                loggerhandler.logger.error('Error in signing or sending transaction" - ', ex);

                callback(false);
            }
        }

        // Send transaction with retry mechanism
        sendTransaction();

    } catch (ex) {
        console.log(ex);
        loggerhandler.logger.error('Error in sending transaction" - ', ex);
        callback(false);
    }
};


// var nonce2 = 0;
// const mintUpdateAwareToken = async (
//     file,
//     kyc_details_avaliable,
//     selected_update_aware_token_found,
//     assets_avaliable,
//     tracer_avaliable,
//     self_validation_avaliable,
//     company_compliances_avaliable,
//     useraddress,
//     _awareid,
//     update_aware_token_id,
//     callback
// ) => {

//     try {

//         const valueChainProcess = [
//             ...selected_update_aware_token_found.value_chain_process_main,
//             ...selected_update_aware_token_found.value_chain_process_sub
//         ].map(x => x.name);

//         const temp_transferred_tokens = await transferred_tokens.find({})
//             .select(['_id', 'blockchain_id']);

//         const temp_array = [];
//         const tokens_that_needs_to_be_burn = assets_avaliable.assetdataArrayMain.map((x) => {
//             const block = temp_transferred_tokens.find((k) => k._id.toString() === x.tt_id);

//             //we can comment this after checking balacne
//             temp_array.push({ "blockchain_id": block.blockchain_id, "To_be_Send": x.token_deduction })

//             return { used_tokens: x.token_deduction, blockchain_id: block.blockchain_id };
//         });

//         const previousTokenUsed = tokens_that_needs_to_be_burn.map((block) => block.blockchain_id);


//         //  //we need to uncomment it as this to revert tokens
//         //  var contract2 = new connectWeb3.eth.Contract(abiArray, process.env.CONTRACT_ADDRESS,
//         //     { from: process.env.ADMIN_WALLET_ADDRESS })

//         // const token_ids = tokens_that_needs_to_be_burn.map((dataset) => dataset.blockchain_id.toString());
//         // const array_of_amounts = tokens_that_needs_to_be_burn.map((dataset) => dataset.used_tokens.toString());
//         // console.log("token_ids", token_ids);
//         // console.log("array_of_amounts", array_of_amounts);

//         // const owner = await contract2.methods.ownerOf(token_ids[0]).call();
//         // // const balance_user = await contract2.methods.balanceOf(useraddress.toLowerCase(), temp.blockchain_id).call();;
//         // // const DUMP_WALLET_ADDRESS = await contract2.methods.balanceOf(process.env.DUMP_WALLET_ADDRESS.toLowerCase(), temp.blockchain_id).call();;
//         // const owner_balacne = await contract2.methods.balanceOf(owner.toLowerCase(), token_ids[0]).call();;

//         // // console.log("To_be_Send", temp.To_be_Send);

//         // console.log("owner", owner)
//         // // console.log("useraddress from token is transferring", useraddress.toLowerCase())

//         // console.log("owner_balacne", owner_balacne)

//         // var wallet_of_owner = await wallets.findOne({ wallet_address_0x: owner })
//         //     .select(['wallet_address_0x', 'from', 'to']);
//         // var key2 = wallet_of_owner.from + wallet_of_owner.to;
//         // var decrypted_private_key_2 = helperfunctions.encryptAddress(key2, 'decrypt');

//         // const privatekey_2 = decrypted_private_key_2.substring(3, decrypted_private_key_2.length - 1);

//         // var gasAmount_2 = await contract2.methods.safeBatchTransferFrom(owner.toLowerCase(),
//         //     useraddress, token_ids, array_of_amounts, []).estimateGas({ from: owner });

//         // console.log("gasAmount_2", gasAmount_2)

//         // await transferAsync(owner.toLowerCase(), gasAmount_2).catch((ex) => { console.log("Error while transferAsync", ex) });


//         // const gasPrice_2 = await connectWeb3.eth.getGasPrice();
//         // const txConfig_2 = {
//         //     from: owner,
//         //     to: process.env.CONTRACT_ADDRESS,
//         //     gasPrice: gasPrice_2,
//         //     gas: gasAmount_2.toString(),
//         //     data: contract2.methods.safeBatchTransferFrom(owner.toLowerCase(),
//         //         useraddress, token_ids, array_of_amounts, []).encodeABI(),
//         // };

//         // var signedTx2 = await connectWeb3.eth.accounts.signTransaction(txConfig_2, `0x${privatekey_2}`);

//         // console.log("signedTx: ", signedTx2);

//         // var receipt2 = await connectWeb3.eth.sendSignedTransaction(signedTx2.rawTransaction);

//         // console.log("Tx Hash (Receipt): ", receipt2);
//         // //revert tokens end here


//         // const metadataJSON = generateMetadata("aware-20221012", {
//         //     version: "aware-20221012",
//         //     name: assets_avaliable._awareid,
//         //     description: update_aware_token_id.toString(),
//         //     date: new Date().toISOString(),
//         //     awareTokenType: selected_update_aware_token_found.aware_output_token_type,
//         //     awareAssetId: assets_avaliable.updated_aware_asset_id,
//         //     productionFacility: selected_update_aware_token_found.production_facility,
//         //     producer: kyc_details_avaliable.company_name,
//         //     batchNo: assets_avaliable.production_lot,
//         //     ProductionQty: assets_avaliable.quantity || '',
//         //     weightInKgs: assets_avaliable.weight,
//         //     valueChainProcess : valueChainProcess,
//         //     materialSpecs: assets_avaliable.material_specs || '',
//         //     color: assets_avaliable.main_color,
//         //     sustainableProcessClaim: assets_avaliable.sustainable_process_claim == true ? assets_avaliable.sustainable_process_certificates : [],
//         //     wetProcessing: assets_avaliable.wet_processing_t == true ? assets_avaliable.wet_processing : [],
//         //     tracer: {
//         //         "tracerAdded": tracer_avaliable.tracer_added == true ? "Yes" : "No",
//         //         "typeofTracer": tracer_avaliable.aware_tc_checked == true ? "aware" : "custom",
//         //         "scandate": tracer_avaliable.aware_date || tracer_avaliable.custom_date || null
//         //     },
//         //     selfValidationCertificate: ['requested'],
//         //     environmentalScopeCertificate: company_compliances_avaliable.environmental_scope_certificates.map(x => x.documentname),
//         //     socialComplianceCertificate: company_compliances_avaliable.social_compliance_certificates.map(x => x.documentname),
//         //     chemicalComplianceCertificate: company_compliances_avaliable.chemical_compliance_certificates.map(x => x.documentname),
//         //     previousTokenDetail: previousTokenUsed
//         // });




//         console.log("_awareid", assets_avaliable._awareid)
//         console.log("update_aware_token_id", update_aware_token_id.toString())
//         console.log("aware_output_token_type", selected_update_aware_token_found.aware_output_token_type)
//         console.log("updated_aware_asset_id", assets_avaliable.updated_aware_asset_id)
//         console.log("production_facility", selected_update_aware_token_found.production_facility)

//         console.log("company_name", kyc_details_avaliable.company_name)
//         console.log("production_lot", assets_avaliable.production_lot)
//         console.log("quantity", assets_avaliable.quantity)
//         console.log("valueChainProcess", valueChainProcess)
//         console.log("material_specs", assets_avaliable.material_specs)
//         console.log("main_color", assets_avaliable.main_color)
//         console.log("sustainable_process_claim", assets_avaliable.sustainable_process_claim)
//         console.log("sustainable_process_certificates", assets_avaliable.sustainable_process_certificates)
//         console.log("wet_processing", assets_avaliable.wet_processing_t)
//         console.log("wet_processing_arr", assets_avaliable.wet_processing_arr)
//         console.log("tracer_added", tracer_avaliable.tracer_added)
//         console.log("aware_tc_checked", tracer_avaliable.aware_tc_checked)
//         console.log("aware_date", tracer_avaliable.aware_date ? tracer_avaliable.aware_date.toString() : '')
//         console.log("environmental_scope_certificates", company_compliances_avaliable.environmental_scope_certificates.map(x => x.documentname))
//         console.log("social_compliance_certificates", company_compliances_avaliable.social_compliance_certificates.map(x => x.documentname))
//         console.log("chemical_compliance_certificates", company_compliances_avaliable.chemical_compliance_certificates.map(x => x.documentname))
//         console.log("previousTokenUsed", previousTokenUsed)

//         const metadataJSON = generateMetadata("aware-20221012", {
//             version: "aware-20221012",
//             name: assets_avaliable._awareid,
//             description: update_aware_token_id.toString(),
//             date: new Date().toISOString(),
//             awareTokenType: selected_update_aware_token_found.aware_output_token_type,
//             awareAssetId: assets_avaliable.updated_aware_asset_id,
//             productionFacility: selected_update_aware_token_found.production_facility,
//             producer: kyc_details_avaliable.company_name,
//             batchNo: assets_avaliable.production_lot,
//             ProductionQty: assets_avaliable.quantity ? assets_avaliable.quantity : '',
//             weightInKgs: assets_avaliable.weight,
//             valueChainProcess: valueChainProcess,
//             materialSpecs: assets_avaliable.material_specs || '',
//             color: assets_avaliable.main_color,
//             sustainableProcessClaim: assets_avaliable.sustainable_process_claim == true ? assets_avaliable.sustainable_process_certificates : [],
//             // wetProcessing: assets_avaliable.wet_processing_t == true ? assets_avaliable.wet_processing_arr : [],
//             wetProcessing: assets_avaliable.wet_processing_t == true ? assets_avaliable.wet_processing : [],
//             tracer: {
//                 "tracerAdded": tracer_avaliable.tracer_added == true ? "Yes" : "No",
//                 "typeofTracer": tracer_avaliable.aware_tc_checked == true ? "aware" : "custom",
//                 // "scandate": tracer_avaliable.aware_date.toString() || tracer_avaliable.custom_date.toString() || ''
//                 "scandate": tracer_avaliable.aware_date ? tracer_avaliable.aware_date.toString() : tracer_avaliable.custom_date ? tracer_avaliable.custom_date.toString() : ''
//             },
//             selfValidationCertificate: ['requested'],
//             environmentalScopeCertificate: company_compliances_avaliable.environmental_scope_certificates.map(x => x.documentname),
//             socialComplianceCertificate: company_compliances_avaliable.social_compliance_certificates.map(x => x.documentname),
//             chemicalComplianceCertificate: company_compliances_avaliable.chemical_compliance_certificates.map(x => x.documentname),
//             previousTokenDetail: previousTokenUsed
//         });


//         // const metadataJSON = generateMetadata("aware-20221012", {
//         //     version: "aware-20221012",
//         //     name: "hello",
//         //     description: "hello",
//         //     date: new Date().toISOString(),
//         //     awareTokenType: "hello",
//         //     awareAssetId: "hello",
//         //     productionFacility: "hello",
//         //     producer: "hello",
//         //     batchNo: "hello",
//         //     ProductionQty: "hello",
//         //     weightInKgs: "hello",
//         //     valueChainProcess: ['valueChainProcess'],
//         //     materialSpecs: "hello",
//         //     color: "hello",
//         //     sustainableProcessClaim: [],
//         //     wetProcessing: [],
//         //     tracer: {
//         //         "tracerAdded": "No",
//         //         "typeofTracer": "custom",
//         //         "scandate": null
//         //     },
//         //     selfValidationCertificate: ['requested'],
//         //     environmentalScopeCertificate: [],
//         //     socialComplianceCertificate: [],
//         //     chemicalComplianceCertificate: [],
//         //     previousTokenDetail: []
//         // });

//         console.log("metadataJSON", metadataJSON)

//         const file_read = fs.readFileSync(file); // Read file into a buffer

//         console.log({ file_read });

//         const contentHash = sha256FromBuffer(Buffer.from(file_read));
//         const metadataHash = sha256FromBuffer(Buffer.from(metadataJSON));

//         const data = {
//             "file": file,
//             "metadata": metadataJSON
//         };


//         // Upload files to fleek
//         // const upload = await postToFleekAsync(data);
//         const upload = await postToFleekAsync(data).catch((ex) => { callback(false); })

//         // Collect fileUrl and metadataUrl from Fleek
//         const { fileUrl, metadataUrl } = upload.data;

//         // Construct mediaData object
//         const awareData = constructAwareData(
//             fileUrl,
//             metadataUrl,
//             contentHash,
//             metadataHash
//         );

//         console.log({ awareData })

//         var amountInUint = assets_avaliable.weight;
//         var contract = new connectWeb3.eth.Contract(abiArray, process.env.CONTRACT_ADDRESS,
//             { from: process.env.ADMIN_WALLET_ADDRESS })

//         var gas_amount = await contract.methods.mint(awareData, useraddress, amountInUint).estimateGas({ from: process.env.ADMIN_WALLET_ADDRESS });

//         var tweenty_perc_increase = Number(gas_amount) * 0.2;
//         gas_amount = Math.ceil(Number(gas_amount) + tweenty_perc_increase);

//         var gas_price = await connectWeb3.eth.getGasPrice();

//         console.log("gas_amount", gas_amount.toString());
//         console.log("gas_price", gas_price.toString());

//         var nonce = await connectWeb3.eth.getTransactionCount(process.env.ADMIN_WALLET_ADDRESS);

//         const txConfig = {
//             from: process.env.ADMIN_WALLET_ADDRESS,
//             to: process.env.CONTRACT_ADDRESS,
//             gasPrice: gas_price.toString(),
//             gas: gas_amount.toString(),
//             nonce: nonce,
//             data: contract.methods.mint(awareData, useraddress, amountInUint).encodeABI(),
//         };

//         console.log("txConfig", txConfig)

//         //code that need to be uncommented
//         connectWeb3.eth.accounts.signTransaction(txConfig, process.env.ADMIN_PRIVATE_KEY, async function (err, signedTx) {
//             if (err) {

//                 console.log("err", err);
//                 callback(false);

//             }
//             console.log("signedTx", signedTx);

//             connectWeb3.eth.sendSignedTransaction(signedTx.rawTransaction)
//                 .on("receipt", async function (receipt) {

//                     console.log("Tx Hash (Receipt): ", receipt);

//                     const history = {
//                         _awareid: _awareid,
//                         update_aware_token_id: update_aware_token_id,
//                         transactionIndex: receipt.transactionIndex,
//                         transactionHash: receipt.transactionHash,
//                         blockHash: receipt.blockHash,
//                         blockNumber: receipt.blockNumber,
//                         from: receipt.from,
//                         to: receipt.to,
//                         cumulativeGasUsed: receipt.cumulativeGasUsed,
//                         gasUsed: receipt.gasUsed,
//                         contractAddress: receipt.contractAddress,
//                         logsBloom: receipt.logsBloom,
//                         logs: receipt.logs,
//                         status: receipt.status
//                     }

//                     await transaction_history.create(history);

//                     await sleep(10000);

//                     console.log("useraddress", useraddress)


//                     console.log("SUBGRAPH_URL", process.env.SUBGRAPH_URL)
//                     // "0x125f06b203ad5c43905b7c420dc1e420b515faee"
//                     //const temp_query = gql`{awareTokens(where: { owner: "${useraddress.toLowerCase()}" }) 

//                     const temp_query = gql`{awareTokens(where: { owner: "0x125f06b203ad5c43905b7c420dc1e420b515faee" }) 

//                     {
//                         id
//                         owner {
//                         id
//                             }
//                         creator {
//                         id
//                             }
//                         contentURI
//                         metadataURI
//                         amount
//                         createdAtTimestamp        
//                         }
//                     }`

//                     await sleep(20000);

//                     // setTimeout(async () => {
//                     var temp_result = await request(process.env.SUBGRAPH_URL, temp_query)
//                     var temp_tokens_in_wallet = temp_result.awareTokens.sort(compare).reverse();
//                     console.log("temp_tokens_in_wallet", temp_tokens_in_wallet)

//                     // const postID = tokens_in_wallet[0].id;
//                     // console.log("postID", postID)





//                     const query = gql`{
//                         awareTokens(
//                           where: { owner: "${useraddress.toLowerCase()}" }
//                           orderBy: createdAtTimestamp
//                           orderDirection: desc
//                           first: 1
//                         ) {
//                           id
//                           owner {
//                             id
//                                 }
//                             creator {
//                             id
//                                 }
//                             contentURI
//                             metadataURI
//                             amount
//                             createdAtTimestamp 
//                         }
//                       }`

//                     var result = await request(process.env.SUBGRAPH_URL, query).catch((ex) => { console.log("EXX", ex) })

//                     console.log("SUBGRAPH_Result", result)

//                     const postID = result.awareTokens[0].id;

//                     console.log("post", postID);

//                     //                     var metadata = null;

//                     //                     try {

//                     //                         metadata = await axios.get(result.awareTokens[0].metadataURI);

//                     //                     }

//                     //                     catch (error) {
//                     //                         console.error("Error fetching metadata:", error.message);
//                     //                         // Log the request details
//                     //                         console.log("Request Details:");
//                     //                         console.log(`Endpoint: ${result.awareTokens[0].metadataURI}`);
//                     //                         console.log("Headers:", error.config?.headers || "No headers sent");

//                     //                         // Generate and log the equivalent cURL command
//                     //                         const curlCommand = `
//                     // curl -X GET ${result.awareTokens[0].metadataURI} \\
//                     // -H 'Accept: application/json'`.trim();

//                     //                         console.log("Equivalent cURL Command:");
//                     //                         console.log(curlCommand);

//                     //                         callback(false);


//                     //                     }


//                     var metadata = null;
//                     let maxRetries = 60; // Number of retries
//                     let retryDelay = 5000; // Delay between retries in milliseconds (5 seconds)
//                     let attempt = 0;

//                     while (attempt < maxRetries) {
//                         console.log("TUA Fleek logs: ", new Date().toLocaleString());
//                         try {
//                             console.log(`Attempt ${attempt + 1} to fetch metadata...`);
//                             metadata = await axios.get(result.awareTokens[0].metadataURI);
//                             break; // Exit loop if the request is successful
//                         } catch (error) {
//                             console.log(`Error fetching metadata on attempt ${attempt + 1}:`, error.message);

//                             // Log request details for debugging
//                             console.log("Request Details:");
//                             console.log(`Endpoint: ${result.awareTokens[0].metadataURI}`);
//                             console.log("Headers:", error.config?.headers || "No headers sent");
//                             console.log("Request Body:", error.config?.data || "No request body sent");

//                             // Generate and log the equivalent cURL command
//                             const curlCommand = `
// curl -X GET ${result.awareTokens[0].metadataURI} \\
// -H 'Accept: application/json'`.trim();

//                             console.log("Equivalent cURL Command:");
//                             console.log(curlCommand);

//                             attempt++;

//                             if (attempt < maxRetries) {
//                                 console.log(`Retrying after ${retryDelay}ms...`);
//                                 await new Promise((resolve) => setTimeout(resolve, retryDelay)); // Wait before retrying
//                             } else {
//                                 console.log("Max retries reached. Returning callback(false).");
//                                 callback(false);
//                                 return; // Exit the current function
//                             }
//                         }
//                     }





//                     console.log("postID", result);
//                     console.log("metadata.data.description", metadata.data.description)
//                     console.log("update_aware_token_id", update_aware_token_id)

//                     if (metadata.data.description == update_aware_token_id) {

//                         const wallet_of_sender = await wallets.findOne({ wallet_address_0x: useraddress }).select(['wallet_address_0x', 'from', 'to']);
//                         const key = wallet_of_sender.from + wallet_of_sender.to;
//                         const decrypted_private_key = helperfunctions.encryptAddress(key, 'decrypt');
//                         const privatekey = decrypted_private_key.substring(3, decrypted_private_key.length - 1);

//                         var contract2 = new connectWeb3.eth.Contract(abiArray, process.env.CONTRACT_ADDRESS,
//                             { from: process.env.ADMIN_WALLET_ADDRESS })

//                         const token_ids = tokens_that_needs_to_be_burn.map((dataset) => dataset.blockchain_id.toString());
//                         const array_of_amounts = tokens_that_needs_to_be_burn.map((dataset) => dataset.used_tokens.toString());
//                         console.log("token_ids", token_ids);
//                         console.log("array_of_amounts", array_of_amounts);
//                         console.log("required info", postID, 'Approved', selected_update_aware_token_found.aware_output_token_type, Number(assets_avaliable.weight), Number(assets_avaliable.weight), "useraddress", useraddress)


//                         // //check balance
//                         for (var i = 0; i < temp_array.length; i++) {

//                             const temp = temp_array[i];

//                             const owner = await contract.methods.ownerOf(temp.blockchain_id).call();
//                             const balance_user = await contract.methods.balanceOf(useraddress.toLowerCase(), temp.blockchain_id).call();;
//                             const DUMP_WALLET_ADDRESS = await contract.methods.balanceOf(process.env.DUMP_WALLET_ADDRESS.toLowerCase(), temp.blockchain_id).call();;
//                             const owner_balacne = await contract.methods.balanceOf(owner.toLowerCase(), temp.blockchain_id).call();;

//                             console.log("To_be_Send", temp.To_be_Send);

//                             console.log("owner", owner)
//                             console.log("useraddress from token is transferring", useraddress.toLowerCase())

//                             console.log("owner_balacne", owner_balacne)
//                             console.log("useraddress balacne", balance_user)
//                             console.log("DUMP_WALLET_ADDRESS", DUMP_WALLET_ADDRESS)

//                         }

//                         // //This is our main code
//                         try {

//                             console.log("Original is working")
//                             var gasAmount = await contract2.methods.safeBatchTransferFrom(useraddress.toLowerCase(),
//                                 process.env.DUMP_WALLET_ADDRESS, token_ids, array_of_amounts, []).estimateGas({ from: useraddress });

//                             console.log("gasAmount", gasAmount)

//                             var increased = Number(gasAmount) * 0.2;
//                             gasAmount = Math.ceil(Number(gasAmount) + increased);

//                             connectWeb3.eth.getBalance(useraddress.toLowerCase()).then(
//                                 async function (balance) {

//                                     let iotxBalance = Big(balance).div(10 ** 18);

//                                     console.log("iotxBalance", iotxBalance.toFixed(18))

//                                     if (iotxBalance.toFixed(18) < 3) {

//                                         await transferAsync(useraddress.toLowerCase(), gasAmount).catch((ex) => { console.log("Error while transferAsync", ex) });

//                                         connectWeb3.eth.getBalance(useraddress.toLowerCase()).then(
//                                             async function (balance) {

//                                                 let iotxBalance = Big(balance).div(10 ** 18);

//                                                 console.log("iotxBalance.toFixed(18)", iotxBalance.toFixed(18));

//                                                 if (iotxBalance.toFixed(18) > 0) {

//                                                     const gasPrice = await connectWeb3.eth.getGasPrice();
//                                                     const txConfig = {
//                                                         from: useraddress,
//                                                         to: process.env.CONTRACT_ADDRESS,
//                                                         gasPrice: gasPrice,
//                                                         gas: gasAmount.toString(),
//                                                         data: contract2.methods.safeBatchTransferFrom(useraddress.toLowerCase(),
//                                                             process.env.DUMP_WALLET_ADDRESS, token_ids, array_of_amounts, []).encodeABI(),
//                                                     };

//                                                     console.log("txConfig", txConfig);


//                                                     connectWeb3.eth.accounts.signTransaction(txConfig, `0x${privatekey}`,
//                                                         async function (err, signedTx) {
//                                                             err ? callback(false) : console.log("signedTx", signedTx);

//                                                             connectWeb3.eth.sendSignedTransaction(signedTx.rawTransaction)
//                                                                 .on("receipt", async function (receipt) {

//                                                                     console.log("Tx Hash (Receipt): ", receipt);
//                                                                     const token_data = {
//                                                                         blockchain_id: postID,
//                                                                         status: 'Approved',
//                                                                         type_of_token: selected_update_aware_token_found.aware_output_token_type,
//                                                                         total_tokens: Number(assets_avaliable.weight),
//                                                                         avaliable_tokens: Number(assets_avaliable.weight),
//                                                                     };
//                                                                     await update_aw_tokens.findOneAndUpdate({ _id: update_aware_token_id },
//                                                                         token_data, { new: true });

//                                                                     callback(true);


//                                                                 })
//                                                                 .on("error", async function (e) {
//                                                                     console.log("Error while burn token", e)

//                                                                     checkTransactionReceipt(connectWeb3, signedTx.transactionHash, postID,
//                                                                         selected_update_aware_token_found.aware_output_token_type, assets_avaliable.weight, update_aware_token_id, function (result) {
//                                                                             // Handle the result as needed
//                                                                             console.log("Transaction result:", result);

//                                                                             if (result == true) {
//                                                                                 callback(true);
//                                                                             }
//                                                                             else {
//                                                                                 callback(false);
//                                                                             }
//                                                                         });

//                                                                 });
//                                                         })
//                                                 }
//                                             })

//                                     }
//                                     else {

//                                         const gasPrice = await connectWeb3.eth.getGasPrice();
//                                         const txConfig = {
//                                             from: useraddress,
//                                             to: process.env.CONTRACT_ADDRESS,
//                                             gasPrice: gasPrice,
//                                             gas: gasAmount.toString(),
//                                             data: contract2.methods.safeBatchTransferFrom(useraddress.toLowerCase(),
//                                                 process.env.DUMP_WALLET_ADDRESS, token_ids, array_of_amounts, []).encodeABI(),
//                                         };

//                                         console.log("txConfig", txConfig);

//                                         connectWeb3.eth.accounts.signTransaction(txConfig, `0x${privatekey}`,
//                                             async function (err, signedTx) {
//                                                 err ? callback(false) : console.log("signedTx", signedTx);

//                                                 connectWeb3.eth.sendSignedTransaction(signedTx.rawTransaction)
//                                                     .on("receipt", async function (receipt) {
//                                                         console.log("Tx Hash (Receipt): ", receipt);
//                                                         const token_data = {
//                                                             blockchain_id: postID,
//                                                             status: 'Approved',
//                                                             type_of_token: selected_update_aware_token_found.aware_output_token_type,
//                                                             total_tokens: Number(assets_avaliable.weight),
//                                                             avaliable_tokens: Number(assets_avaliable.weight),
//                                                         };
//                                                         await update_aw_tokens.findOneAndUpdate({ _id: update_aware_token_id },
//                                                             token_data, { new: true });

//                                                         callback(true);

//                                                     })
//                                                     .on("error", async function (e) {
//                                                         console.log("Error while burn token", e)

//                                                         checkTransactionReceipt(connectWeb3, signedTx.transactionHash, postID,
//                                                             selected_update_aware_token_found.aware_output_token_type, assets_avaliable.weight, update_aware_token_id, function (result) {
//                                                                 // Handle the result as needed
//                                                                 console.log("Transaction result:", result);

//                                                                 if (result == true) {
//                                                                     callback(true);
//                                                                 }
//                                                                 else {
//                                                                     callback(false);
//                                                                 }
//                                                             });

//                                                     });
//                                             })

//                                     }
//                                 })
//                         }
//                         catch (ex) {
//                             console.log("Error while safeBatchTransferFrom", ex);
//                             callback(false);
//                         }


//                         // ---------------------------------------------





//                         // // token approve without burn
//                         // const token_data = {
//                         //     blockchain_id: postID,
//                         //     status: 'Approved',
//                         //     type_of_token: selected_update_aware_token_found.aware_output_token_type,
//                         //     total_tokens: Number(assets_avaliable.weight),
//                         //     avaliable_tokens: Number(assets_avaliable.weight),
//                         // };
//                         // await update_aw_tokens.findOneAndUpdate({ _id: update_aware_token_id },
//                         //     token_data, { new: true });

//                         // callback(true);

//                     }
//                     else {
//                         console.log("SubGraph or Fleek issue");
//                         callback(false);
//                     }
//                 })
//                 .on("error", async function (error) {
//                     console.log("updated_aware_asset_id", assets_avaliable.updated_aware_asset_id)
//                     console.log("error while minting", error)
//                     callback(false);
//                 });
//         })
//     }
//     catch (error) {
//         console.log("outter error", error);
//         callback(false);
//     }

// }

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const maxTries = 50;
async function checkTransactionReceipt(connectWeb3, transactionHash, postID, aware_output_token_type, weight, update_aware_token_id, callback, tryCount = 1) {

    console.log(`Attempt ${tryCount}`);
    connectWeb3.eth.getTransactionReceipt(transactionHash, async function (err, receipt_response) {
        if (err) {
            if (tryCount < maxTries) {
                // call the function again
                await sleep(20000); // Add a delay before the next attempt (adjust as needed)


                await checkTransactionReceipt(connectWeb3, transactionHash, postID, aware_output_token_type, weight, update_aware_token_id, callback, tryCount + 1);
            } else {
                // Max tries reached, handle accordingly
                console.log("Max tries reached, unable to get transaction receipt.");
                callback(false);
            }
        } else {
            console.log("receipt_response", receipt_response);
            if (receipt_response) {
                if (receipt_response.status) {
                    const token_data = {
                        blockchain_id: postID,
                        status: 'Approved',
                        type_of_token: aware_output_token_type,
                        total_tokens: Number(weight),
                        avaliable_tokens: Number(weight),
                    };
                    await update_aw_tokens.findOneAndUpdate({ _id: update_aware_token_id },
                        token_data, { new: true });

                    callback(true);
                } else {
                    callback(false);
                }
            }
            else {
                if (tryCount < maxTries) {
                    // call the function again
                    await sleep(20000); // Add a delay before the next attempt (adjust as needed)


                    await checkTransactionReceipt(connectWeb3, transactionHash, postID, aware_output_token_type, weight, update_aware_token_id, callback, tryCount + 1);
                } else {
                    // Max tries reached, handle accordingly
                    console.log("Max tries reached, unable to get transaction receipt.");
                    callback(false);
                }
            }
        }
    })


}


// const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));


// const postToFleekAsync = async (data) => {

//     return new Promise(async function (resolve, reject) {

//         try {
//             // Async readFile operation
//             const readFileAsync = promisify(fs.readFile);
//             const file = data.file;
//             const fileData = await readFileAsync(file.path);
//             const name = data.name;
//             const metadata = data.metadata;


//             if (fileData && name && metadata) {
//                 // // Upload media to Fleek
//                 // const { publicUrl: fileUrl } = await fleekStorage.upload({
//                 //     ...fleekAuth,
//                 //     key: uuidv4(),
//                 //     data: fileData,
//                 // });

//                 const result = await fleekSdk.storage().list();

//                 console.log("Abhishek",result.length)



//                 const fileStream = fs.createReadStream(file.path);

//                 // File-like object for the SDK
//                 const fileObject = {
//                     name: uuidv4(),
//                     stream: () => Readable.toWeb(fileStream),
//                 };

//                 // Upload file to Fleek
//                 const fileUploadResponse = await fleekSdk.storage().uploadFile({
//                     file: fileObject,
//                     onUploadProgress: ({ loadedSize, totalSize }) => {
//                         console.log(`Uploaded ${loadedSize} of ${totalSize} bytes for file.`);
//                     },
//                 }).catch((ex)=>{console.log({ex})});

//                 console.log({fileUploadResponse});

//                 const fileUrl = fileUploadResponse.pin.cid; // CID of the file


//                 // Metadata upload requires conversion to a readable stream
//                 const metadataBuffer = Buffer.from(JSON.stringify(metadata));
//                 const metadataStream = Readable.from(metadataBuffer);

//                 const metadataObject = {
//                     name: uuidv4(),
//                     stream: () => Readable.toWeb(metadataStream),
//                 };

//                 // Upload metadata to Fleek
//                 const metadataUploadResponse = await fleekSdk.storage().uploadFile({
//                     file: metadataObject,
//                     onUploadProgress: ({ loadedSize, totalSize }) => {
//                         console.log(`Uploaded ${loadedSize} of ${totalSize} bytes for metadata.`);
//                     },
//                 });

//                 const metadataUrl = metadataUploadResponse.pin.cid; // CID of the metadata



//                 // // Upload metdata to Fleek
//                 // const { publicUrl: metadataUrl } = await fleekStorage.upload({
//                 //     ...fleekAuth,
//                 //     key: uuidv4(),
//                 //     data: metadata,
//                 // });

//                 // Return fileUrl and metadataUrl


//                 console.log({ fileUrl, metadataUrl });
//                 resolve({ "data": { fileUrl, metadataUrl } });
//             }
//             else {
//                 // Else, return 501
//                 reject();
//             }
//         }
//         catch (ex) {
//             reject();
//         }

//     });


// }


// const postToFleekAsync = async (data) => {
//     return new Promise(async function (resolve, reject) {
//       try {
//         // Read the file asynchronously
//         const readFileAsync = promisify(fs.readFile);
//         const file = data.file;
//         const fileData = await readFileAsync(file.path); // Read the file content
//         const name = data.name;
//         const metadata = data.metadata;

//         if (fileData && name && metadata) {
//           // Construct FileLike object for upload
//           const fileLike = {
//             name: name, // The file name
//             stream: () => Readable.toWeb(fs.createReadStream(file.path)), // Ensures Web Streams compatibility

//             // stream: () => fs.createReadStream(file.path), // Stream for file content
//           };

//           // Progress callback
//           const onUploadProgress = ({ loadedSize, totalSize }) => {
//             console.log(`Uploaded ${loadedSize} of ${totalSize} bytes.`);
//           };

//           // Upload media to Fleek
//           const fileUploadResponse = await fleekSdk.storage().uploadFile({
//             file: fileLike,
//             onUploadProgress,
//           });

//           console.log({fileUploadResponse})

//           const fileUrl = `https://ipfs.io/ipfs/${fileUploadResponse.pin.cid}`;

//           console.log({fileUrl})


//           // Upload metadata to Fleek
//           const metadataLike = {
//             name: `${name}-metadata`,
//             stream: () => {
//               const metadataStream = new ReadableStream({
//                 start(controller) {
//                   controller.enqueue(Buffer.from(JSON.stringify(metadata)));
//                   controller.close();
//                 },
//               });
//               return metadataStream;
//             },
//           };

//           const metadataUploadResponse = await fleekSdk.storage().uploadFile({
//             file: metadataLike,
//             onUploadProgress,
//           });

//           console.log({metadataUploadResponse})


//           const metadataUrl = `https://ipfs.io/ipfs/${metadataUploadResponse.pin.cid}`;

//           console.log({metadataUrl})


//           // Return URLs
//           resolve({ data: { fileUrl, metadataUrl } });
//         } else {
//           reject(new Error('Invalid input data. File, name, or metadata is missing.'));
//         }
//       } catch (ex) {
//         console.error('Error during upload:', ex);
//         reject(ex);
//       }
//     });
//   };




//   const postToFleekAsync = async (data) => {
//     return new Promise(async function (resolve, reject) {
//       try {
//         // Read the file asynchronously
//         const readFileAsync = promisify(fs.readFile);
//         const file = data.file;
//         const fileData = await readFileAsync(file.path); // Read the file content
//         const name = data.name;
//         const metadata = data.metadata;

//         if (fileData && name && metadata) {
//           // Construct FileLike object for upload
//           const fileLike = {
//             name: name, // The file name
//             stream: () => Readable.toWeb(fs.createReadStream(file.path)), // Ensures Web Streams compatibility
//           };

//           // Progress callback
//           const onUploadProgress = ({ loadedSize, totalSize }) => {
//             console.log(`Uploaded ${loadedSize} of ${totalSize} bytes.`);
//           };

//           // Upload media to Fleek
//           const fileUploadResponse = await fleekSdk.storage().uploadFile({
//             file: fileLike,
//             onUploadProgress,
//           });

//           console.log({ fileUploadResponse });

//           const fileUrl = `https://ipfs.io/ipfs/${fileUploadResponse.pin.cid}`;

//           console.log({ fileUrl });

//           // Upload metadata to Fleek
//           const metadataLike = {
//             name: `${name}-metadata`,
//             stream: () => {
//               const metadataStream = new Readable();
//               metadataStream.push(Buffer.from(JSON.stringify(metadata)));
//               metadataStream.push(null); // End the stream
//               return metadataStream;
//             },
//           };

//           const metadataUploadResponse = await fleekSdk.storage().uploadFile({
//             file: metadataLike,
//             onUploadProgress,
//           });

//           console.log({ metadataUploadResponse });

//           const metadataUrl = `https://ipfs.io/ipfs/${metadataUploadResponse.pin.cid}`;

//           console.log({ metadataUrl });

//           // Return URLs
//           resolve({ data: { fileUrl, metadataUrl } });
//         } else {
//           reject(new Error('Invalid input data. File, name, or metadata is missing.'));
//         }
//       } catch (ex) {
//         console.error('Error during upload:', ex);
//         reject(ex);
//       }
//     });
//   };


// // Function to create a FileLike object
// const createFileLike = (filePath) => {
//     const fileBuffer = fs.readFileSync(filePath); // Read file into a buffer

//     const stream = () => {
//         const stream = new ReadableStream({
//             start(controller) {
//                 controller.enqueue(fileBuffer); // Enqueue the file buffer
//                 controller.close(); // Close the stream
//             }
//         });
//         return stream;
//     };

//     return {
//         name: filePath.split('/').pop() || 'file', // Get the file name from the path
//         stream,
//     };
// };

// // Function to upload file and metadata to Fleek
// const postToFleekAsync = async (data) => {
//     return new Promise(async function (resolve, reject) {
//       try {
//         // Read the file asynchronously
//         const readFileAsync = promisify(fs.readFile);
//         const file = data.file;
//         const fileData = await readFileAsync(file.path); // Read the file content
//         const name = data.name;
//         const metadata = data.metadata;

//         if (fileData && name && metadata) {
//           // Construct FileLike object for upload
//           const fileLike = createFileLike(file.path);

//           // Progress callback
//           const onUploadProgress = ({ loadedSize, totalSize }) => {
//             console.log(`Uploaded ${loadedSize} of ${totalSize} bytes.`);
//           };

//           // Upload media to Fleek
//           const fileUploadResponse = await fleekSdk.storage().uploadFile({
//             file: fileLike,
//             onUploadProgress,
//           });

//           console.log({ fileUploadResponse });

//           const fileUrl = `https://ipfs.io/ipfs/${fileUploadResponse.pin.cid}`;

//           console.log({ fileUrl });

//           // Upload metadata to Fleek
//           const metadataLike = {
//             name: `${name}-metadata`,
//             stream: () => {
//               const metadataStream = new Readable();
//               metadataStream.push(Buffer.from(JSON.stringify(metadata)));
//               metadataStream.push(null); // End the stream
//               return metadataStream;
//             },
//           };

//           const metadataUploadResponse = await fleekSdk.storage().uploadFile({
//             file: metadataLike,
//             onUploadProgress,
//           });

//           console.log({ metadataUploadResponse });

//           const metadataUrl = `https://ipfs.io/ipfs/${metadataUploadResponse.pin.cid}`;

//           console.log({ metadataUrl });

//           // Return URLs
//           resolve({ data: { fileUrl, metadataUrl } });
//         } else {
//           reject(new Error('Invalid input data. File, name, or metadata is missing.'));
//         }
//       } catch (ex) {
//         console.error('Error during upload:', ex);
//         reject(ex);
//       }
//     });
//   };



// //sent code
// const postToFleekAsync = async (data) => {
//     return new Promise(async function (resolve, reject) {
//         try {
//             // Read the file asynchronously
//             const readFileAsync = promisify(fs.readFile);
//             const file = data.file;
//             const fileData = await readFileAsync(file.path); // Read the file content
//             const name = data.name;
//             const metadata = data.metadata;

//             if (fileData && name && metadata) {
//                 // Construct FileLike object for upload
//                 const fileLike = {
//                     name: name, // The file name
//                     stream: () => fs.createReadStream(file.path), // Plain Node.js Readable stream
//                 };

//                 // Progress callback
//                 const onUploadProgress = ({ loadedSize, totalSize }) => {
//                     console.log(`Uploaded ${loadedSize} of ${totalSize} bytes.`);
//                 };

//                 // Upload media to Fleek
//                 const fileUploadResponse = await fleekSdk.storage().uploadFile({
//                     file: fileLike,
//                     onUploadProgress,
//                 });

//                 console.log({ fileUploadResponse });

//                 const fileUrl = `https://ipfs.io/ipfs/${fileUploadResponse.pin.cid}`;

//                 console.log({ fileUrl });

//                 // Upload metadata to Fleek
//                 const metadataLike = {
//                     name: `${name}-metadata`,
//                     stream: () => {
//                         const metadataStream = new Readable();
//                         metadataStream.push(Buffer.from(JSON.stringify(metadata)));
//                         metadataStream.push(null); // End the stream
//                         return metadataStream;
//                     },
//                 };

//                 const metadataUploadResponse = await fleekSdk.storage().uploadFile({
//                     file: metadataLike,
//                     onUploadProgress,
//                 });

//                 console.log({ metadataUploadResponse });

//                 const metadataUrl = `https://ipfs.io/ipfs/${metadataUploadResponse.pin.cid}`;

//                 console.log({ metadataUrl });

//                 // Return URLs
//                 resolve({ data: { fileUrl, metadataUrl } });
//             } else {
//                 reject(new Error('Invalid input data. File, name, or metadata is missing.'));
//             }
//         } catch (ex) {
//             console.error('Error during upload:', ex);
//             reject(ex);
//         }
//     });
// };

const fleekSdk = new FleekSdk({
    accessTokenService: personalAccessTokenService,
});

// Callback function to track upload progress
// const onUploadProgress = ({ loadedSize, totalSize }) => {
//     console.log(`Uploaded ${loadedSize} of ${totalSize} bytes`);
// };

const onUploadProgress = ({ loadedSize, totalSize }) => {
    console.log("HEELO");
    if (totalSize !== undefined) {
        console.log(`Uploaded ${loadedSize} of ${totalSize} bytes`);
    }
    else {
        console.log(`Uploaded ${loadedSize} bytes (total size unknown)`);
    }
};

// // Function to create a FileLike object
// const createFileLike = (filePath) => {
//     const fileBuffer = fs.readFileSync(filePath); // Read file into a buffer

//     console.log({fileBuffer})

//     // const imageBuffer = Buffer.from(fileBuffer);

//     // console.log({imageBuffer})


//     // const arrayBuffer = fileBuffer.buffer.slice(fileBuffer.byteOffset, fileBuffer.byteOffset + fileBuffer.byteLength);

//     // const uint8Array = new Uint8Array(fileBuffer.buffer, fileBuffer.byteOffset, fileBuffer.byteLength);

//     const stream = () => {
//         const stream = new ReadableStream({
//             start(controller) {
//                 controller.enqueue(fileBuffer); // Enqueue the file buffer
//                 controller.close(); // Close the stream
//             }
//         });
//         return stream;
//     };

//     return {
//         name: filePath.split('/').pop() || 'file', // Get the file name from the path
//         stream,
//     };
// };

// Function to create a FileLike object using UUID as the name
const createFileLike = (filePath) => {
    const fileBuffer = fs.readFileSync(filePath); // Read file into a buffer
    const modifiedBuffer = Buffer.concat([fileBuffer, Buffer.from(`Timestamp: ${Date.now()}`)]);
    const stream = () => {
        const stream = new ReadableStream({
            start(controller) {
                controller.enqueue(modifiedBuffer); // Enqueue the file buffer
                controller.close(); // Close the stream
            }
        });
        return stream;
    };
    return {
        name: `${uuidv4()}_${filePath.split('/').pop() || 'file'}`, // Generate a unique name using UUID and file name
        stream,
    };
};

const createFileLikeFromJSON = (data, fileName) => {
    const jsonBuffer = Buffer.from(data); // Convert JSON to a buffer

    const stream = () => {
        const readableStream = new ReadableStream({
            start(controller) {
                controller.enqueue(jsonBuffer); // Enqueue the JSON buffer
                controller.close(); // Close the stream
            }
        });
        return readableStream;
    };

    return {
        name: `${uuidv4()}_${fileName}`, // Generate a unique name for the JSON file
        stream,
    };
};


const postToFleekAsync = async (data) => {
    try {
        const file = createFileLike(data.file); // Create the FileLike object
        const publicUrl = await fleekSdk.storage().uploadFile({
            file,
            onUploadProgress,
        });

        const fileUrl = `https://storage.wearaware.co/ipfs/${publicUrl.pin.cid}`


        // Upload the JSON data
        const jsonFile = createFileLikeFromJSON(data.metadata, 'metadata.json'); // Create a FileLike object for JSON
        const jsonResult = await fleekSdk.storage().uploadFile({
            file: jsonFile,
            onUploadProgress,
        });

        const metadataUrl = `https://storage.wearaware.co/ipfs/${jsonResult.pin.cid}`


        return { "data": { fileUrl, metadataUrl } };
    }
    catch (error) {
        console.error('Error during upload:', error);
        return null;
    }
};

// const postToFleekAsync = async (data) => {

//     return new Promise(async function (resolve, reject) {

//         try {

//             const file = createFileLike(data.file.path); // Create the FileLike object

//             console.log({file})
//             const result = await fleekSdk.storage().uploadFile({
//                 file,
//                 onUploadProgress,
//             });    

//             console.log('Upload successful:', result);

//             // Async readFile operation
//             // const readFileAsync = promisify(fs.readFile);
//             // const file = data.file;
//             // const fileData = await readFileAsync(file.path);
//             // const name = data.name;
//             // const metadata = data.metadata;

//             // if (fileData && name && metadata) {
//             //     // Upload media to Fleek
//             //     const { publicUrl: fileUrl } = await fleekStorage.upload({
//             //         ...fleekAuth,
//             //         key: uuidv4(),
//             //         data: fileData,
//             //     });
//             //     // Upload metdata to Fleek
//             //     const { publicUrl: metadataUrl } = await fleekStorage.upload({
//             //         ...fleekAuth,
//             //         key: uuidv4(),
//             //         data: metadata,
//             //     });
//             //     // Return fileUrl and metadataUrl
//             //     resolve({ "data": { fileUrl, metadataUrl } });
//             // }
//             // else {
//             //     // Else, return 501
//             //     reject();
//             // }
//         }
//         catch (ex) {
//             reject();
//         }

//     });


// }

// const postToFleekAsync = async (data) => {
//     return new Promise(async function (resolve, reject) {
//         try {

//             console.log("Into it!")

//             // Read the file asynchronously
//             // const extracted_file = data.file;

//             const extracted_file = 'uploads/aaa7e6ka3dh2e9.jpg';

//             // Create the FileLike object
//             const file = createFileLike('uploads/aaa7e6ka3dh2e9.jpg');

//             console.log({ file });

//             const result = await fleekSdk.storage().uploadFile({
//                 file,
//                 onUploadProgress,
//             });

//             console.log('Upload successful:', result);

//         } catch (ex) {
//             console.error('Error during upload:', ex);
//             reject(ex);
//         }
//     });
// };


// const postToFleekAsync = async (data) => {
//     return new Promise(async function (resolve, reject) {
//       try {
//         // Read the file asynchronously
//         const readFileAsync = promisify(fs.readFile);
//         const file = data.file;
//         const fileData = await readFileAsync(file.path); // Read the file content
//         const name = data.name;
//         const metadata = data.metadata;

//         if (fileData && name && metadata) {
//           // Construct FileLike object for upload
//           const fileLike = {
//             name: name, // The file name
//             stream: fs.createReadStream(file.path), // Direct stream for file content
//           };

//           // Progress callback
//           const onUploadProgress = ({ loadedSize, totalSize }) => {
//             console.log(`Uploaded ${loadedSize} of ${totalSize} bytes.`);
//           };

//           // Upload media to Fleek
//           const fileUploadResponse = await fleekSdk.storage().uploadFile({
//             file: fileLike,
//             onUploadProgress,
//           });

//           console.log({fileUploadResponse})

//           const fileUrl = `https://ipfs.io/ipfs/${fileUploadResponse.pin.cid}`;

//           console.log({fileUrl})

//           // Upload metadata to Fleek
//           const metadataLike = {
//             name: `${name}-metadata`,
//             stream: () => {
//               const metadataStream = new ReadableStream({
//                 start(controller) {
//                   controller.enqueue(Buffer.from(JSON.stringify(metadata)));
//                   controller.close();
//                 },
//               });
//               return metadataStream;
//             },
//           };

//           const metadataUploadResponse = await fleekSdk.storage().uploadFile({
//             file: metadataLike,
//             onUploadProgress,
//           });

//           console.log({metadataUploadResponse})

//           const metadataUrl = `https://ipfs.io/ipfs/${metadataUploadResponse.pin.cid}`;

//           console.log({metadataUrl})

//           // Return URLs
//           resolve({ data: { fileUrl, metadataUrl } });
//         } else {
//           reject(new Error('Invalid input data. File, name, or metadata is missing.'));
//         }
//       } catch (ex) {
//         console.error('Error during upload:', ex);
//         reject(ex);
//       }
//     });
//   };


// const postToFleekAsync = async (data) => {
//     return new Promise(async function (resolve, reject) {
//       try {
//         // Read the file asynchronously
//         const readFileAsync = promisify(fs.readFile);
//         const file = data.file;
//         const fileData = await readFileAsync(file.path); // Read the file content
//         const name = data.name;
//         const metadata = data.metadata;

//         if (fileData && name && metadata) {
//           // Construct FileLike object for upload
//           const fileLike = {
//             name: name, // The file name
//             stream: () => fs.createReadStream(file.path), // Direct stream for file content
//           };

//           // Progress callback
//           const onUploadProgress = ({ loadedSize, totalSize }) => {
//             console.log(`Uploaded ${loadedSize} of ${totalSize} bytes.`);
//           };

//           // Upload media to Fleek
//           const fileUploadResponse = await fleekSdk.storage().uploadFile({
//             file: fileLike,
//             onUploadProgress,
//           });

//           console.log({ fileUploadResponse });

//           const fileUrl = `https://ipfs.io/ipfs/${fileUploadResponse.pin.cid}`;
//           console.log({ fileUrl });

//           // Upload metadata to Fleek
//           const metadataLike = {
//             name: `${name}-metadata`,
//             stream: () => {
//               const metadataStream = new ReadableStream({
//                 start(controller) {
//                   controller.enqueue(Buffer.from(JSON.stringify(metadata)));
//                   controller.close();
//                 },
//               });
//               return metadataStream;
//             },
//           };

//           const metadataUploadResponse = await fleekSdk.storage().uploadFile({
//             file: metadataLike,
//             onUploadProgress,
//           });

//           console.log({ metadataUploadResponse });

//           const metadataUrl = `https://ipfs.io/ipfs/${metadataUploadResponse.pin.cid}`;
//           console.log({ metadataUrl });

//           // Return URLs
//           resolve({ data: { fileUrl, metadataUrl } });
//         } else {
//           reject(new Error('Invalid input data. File, name, or metadata is missing.'));
//         }
//       } catch (ex) {
//         console.error('Error during upload:', ex);
//         reject(ex);
//       }
//     });
//   };


// const postToFleekAsync = async (data) => {
//     return new Promise(async function (resolve, reject) {
//       try {
//         // Read the file asynchronously
//         const readFileAsync = promisify(fs.readFile);
//         const file = data.file;
//         const fileData = await readFileAsync(file.path); // Read the file content
//         const name = data.name;
//         const metadata = data.metadata;

//         if (fileData && name && metadata) {
//           // Construct FileLike object for upload
//           const fileLike = {
//             name: name, // The file name
//             stream: () => fs.createReadStream(file.path), // Using Node.js Readable stream
//           };

//           // Progress callback
//           const onUploadProgress = ({ loadedSize, totalSize }) => {
//             console.log(`Uploaded ${loadedSize} of ${totalSize} bytes.`);
//           };

//           // Upload media to Fleek
//           const fileUploadResponse = await fleekSdk.storage().uploadFile({
//             file: fileLike,
//             onUploadProgress,
//           });

//           console.log({ fileUploadResponse });

//           const fileUrl = `https://ipfs.io/ipfs/${fileUploadResponse.pin.cid}`;
//           console.log({ fileUrl });

//           // Upload metadata to Fleek
//           const metadataLike = {
//             name: `${name}-metadata`,
//             stream: () => {
//               const readableStream = fs.createReadStream(file.path); // Node.js Readable stream
//               return readableStream;
//             },
//           };

//           const metadataUploadResponse = await fleekSdk.storage().uploadFile({
//             file: metadataLike,
//             onUploadProgress,
//           });

//           console.log({ metadataUploadResponse });

//           const metadataUrl = `https://ipfs.io/ipfs/${metadataUploadResponse.pin.cid}`;
//           console.log({ metadataUrl });

//           // Return URLs
//           resolve({ data: { fileUrl, metadataUrl } });
//         } else {
//           reject(new Error('Invalid input data. File, name, or metadata is missing.'));
//         }
//       } catch (ex) {
//         console.error('Error during upload:', ex);
//         reject(ex);
//       }
//     });
//   };



function blobToFile(theBlob, fileName, type, path) {
    //A Blob() is almost a File() - it's just missing the two properties below which we will add
    theBlob.lastModifiedDate = new Date();
    theBlob.name = fileName;
    theBlob.path = path;
    theBlob.type = type;

    return theBlob;
}


function compare(a, b) {
    if (Number(a.id) < Number(b.id)) {
        return -1;
    }
    if (Number(a.id) > Number(b.id)) {
        return 1;
    }
    return 0;
}

const transferAsync = async (to0xaddress, gastobetransfred) => {

    return new Promise(async function (resolve, reject) {

        try {
            console.log("to0xaddress", to0xaddress);

            try {
                connectWeb3 = await new Web3(new Web3.providers.HttpProvider(process.env.BABEL_ENDPOINT));

                await connectWeb3.eth.net.isListening();
            }
            catch {
                connectWeb3 = await new Web3(new Web3.providers.HttpProvider(process.env.ALTERNATE_BABEL_ENDPOINT));

                await connectWeb3.eth.net.isListening();
            }

            connectWeb3.eth.getBalance(from0xaddress).then(
                async function (balance) {

                    let iotxBalance = Big(balance).div(10 ** 18);

                    if (iotxBalance.toFixed(18) > 0) {

                        const gasPrice = await connectWeb3.eth.getGasPrice();
                        var gasAmount = '40000';

                        var amountInUint = connectWeb3.utils.toWei('1');

                        console.log("amountInUint", amountInUint)

                        const txConfig = {
                            from: from0xaddress,
                            to: to0xaddress,
                            gasPrice: gasPrice,
                            gas: gasAmount.toString(),
                            value: amountInUint
                        };
                        const privatekey = process.env.ADMIN_PRIVATE_KEY;


                        connectWeb3.eth.accounts.signTransaction(txConfig, privatekey, async function (err, signedTx) {
                            if (err) reject();

                            console.log("signedTx", signedTx)
                            connectWeb3.eth.sendSignedTransaction(signedTx.rawTransaction)
                                .on("receipt", async function (receipt) {
                                    console.log("receipt", receipt)
                                    // console.log("STOP")
                                    resolve();
                                })
                                .on("error", async function (e) {
                                    console.log("ex", e);

                                    reject();
                                });
                        });
                    }
                    else {
                        reject();
                    }
                });

        }
        catch (ex) {
            reject();
        }

    });


}

// const transferAsync = async (to0xaddress, gastobetransfred, callback) => {

//     console.log("to0xaddress", to0xaddress);

//     connectWeb3 = await new Web3(new Web3.providers.HttpProvider(process.env.BABEL_ENDPOINT));

//     await connectWeb3.eth.net.isListening();
//     connectWeb3.eth.getBalance(from0xaddress).then(
//         async function (balance) {

//             let iotxBalance = Big(balance).div(10 ** 18);

//             if (iotxBalance.toFixed(18) > 0) {

//                 const gasPrice = await connectWeb3.eth.getGasPrice();
//                 var gasAmount = '40000';

//                 var amountInUint = connectWeb3.utils.toWei('1');

//                 console.log("amountInUint", amountInUint)

//                 const txConfig = {
//                     from: from0xaddress,
//                     to: to0xaddress,
//                     gasPrice: gasPrice,
//                     gas: gasAmount.toString(),
//                     value: amountInUint
//                 };
//                 const privatekey = process.env.ADMIN_PRIVATE_KEY;


//                 connectWeb3.eth.accounts.signTransaction(txConfig, privatekey, async function (err, signedTx) {
//                     if (err) callback(false);

//                     console.log("signedTx", signedTx)
//                     connectWeb3.eth.sendSignedTransaction(signedTx.rawTransaction)
//                         .on("receipt", async function (receipt) {
//                             console.log("receipt", receipt)
//                             // console.log("STOP")
//                             callback(true);
//                         })
//                         .on("error", async function (e) {
//                             console.log("ex", e);

//                             callback(false);
//                         });
//                 });
//             }
//             else {
//                 callback(false);
//             }
//         });


// }

async function getNonce(address) {
    const non = await connectWeb3.eth.getTransactionCount(address);
    nonce2 == non ? nonce2 = nonce2 + 1 : nonce2 = non;
    return null;
}








// if (iotxBalance.toFixed(18) < 2) {


//     await transferAsync(useraddress.toLowerCase(), gasAmount,
//         async function (response) {

//             connectWeb3.eth.getBalance(useraddress.toLowerCase()).then(
//                 async function (balance) {

//                     let iotxBalance = Big(balance).div(10 ** 18);

//                     console.log("iotxBalance", iotxBalance);

//                     if (response == true && iotxBalance.toFixed(18) > 0) {

//                         const gasPrice = await connectWeb3.eth.getGasPrice();
//                         const txConfig = {
//                             from: useraddress,
//                             to: process.env.CONTRACT_ADDRESS,
//                             gasPrice: gasPrice,
//                             gas: gasAmount.toString(),
//                             data: contract2.methods.safeBatchTransferFrom(useraddress.toLowerCase(),
//                                 process.env.DUMP_WALLET_ADDRESS, token_ids, array_of_amounts, []).encodeABI(),
//                         };

//                         console.log("txConfig", txConfig);


//                         connectWeb3.eth.accounts.signTransaction(txConfig, `0x${privatekey}`,
//                             async function (err, signedTx) {
//                                 err ? callback(false) : console.log("signedTx", signedTx);

//                                 connectWeb3.eth.sendSignedTransaction(signedTx.rawTransaction)
//                                     .on("receipt", async function (receipt) {
//                                         console.log("Tx Hash (Receipt): ", receipt);
//                                         const token_data = {
//                                             blockchain_id: postID,
//                                             status: 'Approved',
//                                             type_of_token: selected_update_aware_token_found.aware_output_token_type,
//                                             total_tokens: Number(assets_avaliable.weight),
//                                             avaliable_tokens: Number(assets_avaliable.weight),
//                                         };
//                                         await update_aw_tokens.findOneAndUpdate({ _id: update_aware_token_id },
//                                             token_data, { new: true });

//                                         callback(true);
//                                     })
//                                     .on("error", async function (e) {
//                                         console.log("e", e)
//                                         callback(false);
//                                     });
//                             })
//                     }
//                 })


//         })
// }
// else {

//     const gasPrice = await connectWeb3.eth.getGasPrice();
//     const txConfig = {
//         from: useraddress,
//         to: process.env.CONTRACT_ADDRESS,
//         gasPrice: gasPrice,
//         gas: gasAmount.toString(),
//         data: contract2.methods.safeBatchTransferFrom(useraddress.toLowerCase(),
//             process.env.DUMP_WALLET_ADDRESS, token_ids, array_of_amounts, []).encodeABI(),
//     };

//     console.log("txConfig", txConfig);


//     connectWeb3.eth.accounts.signTransaction(txConfig, `0x${privatekey}`,
//         async function (err, signedTx) {
//             err ? callback(false) : console.log("signedTx", signedTx);

//             connectWeb3.eth.sendSignedTransaction(signedTx.rawTransaction)
//                 .on("receipt", async function (receipt) {
//                     console.log("Tx Hash (Receipt): ", receipt);
//                     const token_data = {
//                         blockchain_id: postID,
//                         status: 'Approved',
//                         type_of_token: selected_update_aware_token_found.aware_output_token_type,
//                         total_tokens: Number(assets_avaliable.weight),
//                         avaliable_tokens: Number(assets_avaliable.weight),
//                     };
//                     await update_aw_tokens.findOneAndUpdate({ _id: update_aware_token_id },
//                         token_data, { new: true });

//                     callback(true);
//                 })
//                 .on("error", async function (e) {
//                     console.log("e", e)
//                     callback(false);
//                 });
//         })

// }