
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

         
            callback(true);

            

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




const fleekSdk = new FleekSdk({
    accessTokenService: personalAccessTokenService,
});



const onUploadProgress = ({ loadedSize, totalSize }) => {
    console.log("HEELO");
    if (totalSize !== undefined) {
        console.log(`Uploaded ${loadedSize} of ${totalSize} bytes`);
    }
    else {
        console.log(`Uploaded ${loadedSize} bytes (total size unknown)`);
    }
};



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



async function getNonce(address) {
    const non = await connectWeb3.eth.getTransactionCount(address);
    nonce2 == non ? nonce2 = nonce2 + 1 : nonce2 = non;
    return null;
}


