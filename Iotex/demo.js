



// var nonce2 = 0;
// const mintUpdateAwareToken = async (file, kyc_details_avaliable, selected_update_aware_token_found, assets_avaliable, tracer_avaliable, self_validation_avaliable, company_compliances_avaliable, useraddress, _awareid, update_aware_token_id, callback) => {

//     var valueChainProcess = [];

//     selected_update_aware_token_found.value_chain_process_main.forEach(x => {
//         valueChainProcess.push(x.name);
//     })
//     selected_update_aware_token_found.value_chain_process_sub.forEach(x => {
//         valueChainProcess.push(x.name);
//     })

//     var previousTokenUsed = [];
//     tokens_that_needs_to_be_burn = [];

//     const temp_transferred_tokens = await transferred_tokens.find({}).select(['_id', 'blockchain_id']).catch((ex) => { callback(false); })

//     assets_avaliable.assetdataArrayMain.forEach(x => {

//         var block = temp_transferred_tokens.find(k => k._id.toString() == x.tt_id);

//         tokens_that_needs_to_be_burn.push({ 'used_tokens': x.token_deduction, 'blockchain_id': block.blockchain_id });
//         previousTokenUsed.push(block.blockchain_id);
//     })

//     console.log("tokens_that_needs_to_be_burn", tokens_that_needs_to_be_burn)

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
//         description: update_aware_token_id.toString(),
//         date: new Date().toISOString(),
//         awareTokenType: selected_update_aware_token_found.aware_output_token_type,
//         awareAssetId: assets_avaliable.updated_aware_asset_id,
//         productionFacility: selected_update_aware_token_found.production_facility,
//         producer: kyc_details_avaliable.company_name,
//         batchNo: assets_avaliable.production_lot,
//         ProductionQty: assets_avaliable.quantity ? assets_avaliable.quantity : '',
//         weightInKgs: assets_avaliable.weight,
//         valueChainProcess: valueChainProcess,
//         materialSpecs: assets_avaliable.material_specs ? assets_avaliable.material_specs : '',
//         color: assets_avaliable.main_color,
//         sustainableProcessClaim: assets_avaliable.sustainable_process_claim == true ? assets_avaliable.sustainable_process_certificates : [],
//         wetProcessing: assets_avaliable.wet_processing_t == true ? assets_avaliable.wet_processing : [],
//         tracer: {
//             "tracerAdded": tracer_avaliable.tracer_added == true ? "Yes" : "No",
//             "typeofTracer": tracer_avaliable.aware_tc_checked == true ? "aware" : "custom",
//             "scandate": tracer_avaliable.aware_date || tracer_avaliable.custom_date || null
//         },
//         selfValidationCertificate: ['requested'],
//         environmentalScopeCertificate: environmentalScopeCertificate,
//         socialComplianceCertificate: socialComplianceCertificate,
//         chemicalComplianceCertificate: chemicalComplianceCertificate,
//         previousTokenDetail: previousTokenUsed
//     });

//     // Generate image buffer
//     // const buffer = await getFileBuffer(file).catch((ex) => { reject() });
//     // console.log("buffer", buffer);

//     // Generate content hashes
//     const contentHash = sha256FromBuffer(Buffer.from(file.buffer));
//     const metadataHash = sha256FromBuffer(Buffer.from(metadataJSON));


//     console.log("contentHash", contentHash);
//     console.log("metadataHash", metadataHash);


//     // Upload files to fleek
//     const data = {
//         "file": file,
//         "name": kyc_details_avaliable.company_name,
//         "metadata": metadataJSON
//     }

//     const upload = await postToFleekAsync(data).catch((ex) => { callback(false); })

//     // Collect fileUrl and metadataUrl from Fleek
//     const { fileUrl, metadataUrl } = upload.data;

//     // Construct mediaData object
//     const awareData = constructAwareData(
//         fileUrl,
//         metadataUrl,
//         contentHash,
//         metadataHash
//     );

//     console.log("awareData", awareData)

//     const privatekey = process.env.ADMIN_PRIVATE_KEY;

//     var non = await connectWeb3.eth.getTransactionCount(from0xaddress);
//     if (nonce2 == non) {
//         nonce2 = nonce2 + 1;
//     }
//     else {
//         nonce2 = non;
//     }

//     var abiArray = [
//         {
//             "inputs": [],
//             "stateMutability": "nonpayable",
//             "type": "constructor"
//         },
//         {
//             "anonymous": false,
//             "inputs": [
//                 {
//                     "indexed": true,
//                     "internalType": "address",
//                     "name": "account",
//                     "type": "address"
//                 },
//                 {
//                     "indexed": true,
//                     "internalType": "address",
//                     "name": "operator",
//                     "type": "address"
//                 },
//                 {
//                     "indexed": false,
//                     "internalType": "bool",
//                     "name": "approved",
//                     "type": "bool"
//                 }
//             ],
//             "name": "ApprovalForAll",
//             "type": "event"
//         },
//         {
//             "anonymous": false,
//             "inputs": [
//                 {
//                     "indexed": true,
//                     "internalType": "uint256",
//                     "name": "_tokenId",
//                     "type": "uint256"
//                 },
//                 {
//                     "indexed": false,
//                     "internalType": "address",
//                     "name": "owner",
//                     "type": "address"
//                 },
//                 {
//                     "indexed": false,
//                     "internalType": "string",
//                     "name": "_uri",
//                     "type": "string"
//                 }
//             ],
//             "name": "TokenMetadataURIUpdated",
//             "type": "event"
//         },
//         {
//             "anonymous": false,
//             "inputs": [
//                 {
//                     "indexed": true,
//                     "internalType": "uint256",
//                     "name": "_tokenId",
//                     "type": "uint256"
//                 },
//                 {
//                     "indexed": false,
//                     "internalType": "address",
//                     "name": "owner",
//                     "type": "address"
//                 },
//                 {
//                     "indexed": false,
//                     "internalType": "string",
//                     "name": "_uri",
//                     "type": "string"
//                 }
//             ],
//             "name": "TokenURIUpdated",
//             "type": "event"
//         },
//         {
//             "anonymous": false,
//             "inputs": [
//                 {
//                     "indexed": true,
//                     "internalType": "address",
//                     "name": "operator",
//                     "type": "address"
//                 },
//                 {
//                     "indexed": true,
//                     "internalType": "address",
//                     "name": "from",
//                     "type": "address"
//                 },
//                 {
//                     "indexed": true,
//                     "internalType": "address",
//                     "name": "to",
//                     "type": "address"
//                 },
//                 {
//                     "indexed": false,
//                     "internalType": "uint256[]",
//                     "name": "ids",
//                     "type": "uint256[]"
//                 },
//                 {
//                     "indexed": false,
//                     "internalType": "uint256[]",
//                     "name": "values",
//                     "type": "uint256[]"
//                 }
//             ],
//             "name": "TransferBatch",
//             "type": "event"
//         },
//         {
//             "anonymous": false,
//             "inputs": [
//                 {
//                     "indexed": true,
//                     "internalType": "address",
//                     "name": "operator",
//                     "type": "address"
//                 },
//                 {
//                     "indexed": true,
//                     "internalType": "address",
//                     "name": "from",
//                     "type": "address"
//                 },
//                 {
//                     "indexed": true,
//                     "internalType": "address",
//                     "name": "to",
//                     "type": "address"
//                 },
//                 {
//                     "indexed": false,
//                     "internalType": "uint256",
//                     "name": "id",
//                     "type": "uint256"
//                 },
//                 {
//                     "indexed": false,
//                     "internalType": "uint256",
//                     "name": "value",
//                     "type": "uint256"
//                 }
//             ],
//             "name": "TransferSingle",
//             "type": "event"
//         },
//         {
//             "anonymous": false,
//             "inputs": [
//                 {
//                     "indexed": false,
//                     "internalType": "string",
//                     "name": "value",
//                     "type": "string"
//                 },
//                 {
//                     "indexed": true,
//                     "internalType": "uint256",
//                     "name": "id",
//                     "type": "uint256"
//                 }
//             ],
//             "name": "URI",
//             "type": "event"
//         },
//         {
//             "inputs": [
//                 {
//                     "internalType": "address",
//                     "name": "account",
//                     "type": "address"
//                 },
//                 {
//                     "internalType": "uint256",
//                     "name": "id",
//                     "type": "uint256"
//                 }
//             ],
//             "name": "balanceOf",
//             "outputs": [
//                 {
//                     "internalType": "uint256",
//                     "name": "",
//                     "type": "uint256"
//                 }
//             ],
//             "stateMutability": "view",
//             "type": "function"
//         },
//         {
//             "inputs": [
//                 {
//                     "internalType": "address[]",
//                     "name": "accounts",
//                     "type": "address[]"
//                 },
//                 {
//                     "internalType": "uint256[]",
//                     "name": "ids",
//                     "type": "uint256[]"
//                 }
//             ],
//             "name": "balanceOfBatch",
//             "outputs": [
//                 {
//                     "internalType": "uint256[]",
//                     "name": "",
//                     "type": "uint256[]"
//                 }
//             ],
//             "stateMutability": "view",
//             "type": "function"
//         },
//         {
//             "inputs": [
//                 {
//                     "internalType": "address",
//                     "name": "from",
//                     "type": "address"
//                 },
//                 {
//                     "internalType": "uint256",
//                     "name": "tokenId",
//                     "type": "uint256"
//                 },
//                 {
//                     "internalType": "uint256",
//                     "name": "amount",
//                     "type": "uint256"
//                 }
//             ],
//             "name": "burn",
//             "outputs": [],
//             "stateMutability": "nonpayable",
//             "type": "function"
//         },
//         {
//             "inputs": [
//                 {
//                     "internalType": "address",
//                     "name": "account",
//                     "type": "address"
//                 },
//                 {
//                     "internalType": "uint256[]",
//                     "name": "ids",
//                     "type": "uint256[]"
//                 },
//                 {
//                     "internalType": "uint256[]",
//                     "name": "values",
//                     "type": "uint256[]"
//                 }
//             ],
//             "name": "burnBatch",
//             "outputs": [],
//             "stateMutability": "nonpayable",
//             "type": "function"
//         },
//         {
//             "inputs": [
//                 {
//                     "internalType": "address",
//                     "name": "account",
//                     "type": "address"
//                 },
//                 {
//                     "internalType": "address",
//                     "name": "operator",
//                     "type": "address"
//                 }
//             ],
//             "name": "isApprovedForAll",
//             "outputs": [
//                 {
//                     "internalType": "bool",
//                     "name": "",
//                     "type": "bool"
//                 }
//             ],
//             "stateMutability": "view",
//             "type": "function"
//         },
//         {
//             "inputs": [
//                 {
//                     "components": [
//                         {
//                             "internalType": "string",
//                             "name": "tokenURI",
//                             "type": "string"
//                         },
//                         {
//                             "internalType": "string",
//                             "name": "metadataURI",
//                             "type": "string"
//                         },
//                         {
//                             "internalType": "bytes32",
//                             "name": "contentHash",
//                             "type": "bytes32"
//                         },
//                         {
//                             "internalType": "bytes32",
//                             "name": "metadataHash",
//                             "type": "bytes32"
//                         }
//                     ],
//                     "internalType": "struct IAwareToken.AwareData",
//                     "name": "data",
//                     "type": "tuple"
//                 },
//                 {
//                     "internalType": "address",
//                     "name": "recipient",
//                     "type": "address"
//                 },
//                 {
//                     "internalType": "uint256",
//                     "name": "amount",
//                     "type": "uint256"
//                 }
//             ],
//             "name": "mint",
//             "outputs": [],
//             "stateMutability": "nonpayable",
//             "type": "function"
//         },
//         {
//             "inputs": [
//                 {
//                     "internalType": "uint256",
//                     "name": "tokenId",
//                     "type": "uint256"
//                 }
//             ],
//             "name": "ownerOf",
//             "outputs": [
//                 {
//                     "internalType": "address",
//                     "name": "",
//                     "type": "address"
//                 }
//             ],
//             "stateMutability": "view",
//             "type": "function"
//         },
//         {
//             "inputs": [
//                 {
//                     "internalType": "uint256",
//                     "name": "",
//                     "type": "uint256"
//                 }
//             ],
//             "name": "previousTokenOwners",
//             "outputs": [
//                 {
//                     "internalType": "address",
//                     "name": "",
//                     "type": "address"
//                 }
//             ],
//             "stateMutability": "view",
//             "type": "function"
//         },
//         {
//             "inputs": [
//                 {
//                     "internalType": "address",
//                     "name": "from",
//                     "type": "address"
//                 },
//                 {
//                     "internalType": "address",
//                     "name": "to",
//                     "type": "address"
//                 },
//                 {
//                     "internalType": "uint256[]",
//                     "name": "ids",
//                     "type": "uint256[]"
//                 },
//                 {
//                     "internalType": "uint256[]",
//                     "name": "amounts",
//                     "type": "uint256[]"
//                 },
//                 {
//                     "internalType": "bytes",
//                     "name": "data",
//                     "type": "bytes"
//                 }
//             ],
//             "name": "safeBatchTransferFrom",
//             "outputs": [],
//             "stateMutability": "nonpayable",
//             "type": "function"
//         },
//         {
//             "inputs": [
//                 {
//                     "internalType": "address",
//                     "name": "from",
//                     "type": "address"
//                 },
//                 {
//                     "internalType": "address",
//                     "name": "to",
//                     "type": "address"
//                 },
//                 {
//                     "internalType": "uint256",
//                     "name": "id",
//                     "type": "uint256"
//                 },
//                 {
//                     "internalType": "uint256",
//                     "name": "amount",
//                     "type": "uint256"
//                 },
//                 {
//                     "internalType": "bytes",
//                     "name": "data",
//                     "type": "bytes"
//                 }
//             ],
//             "name": "safeTransferFrom",
//             "outputs": [],
//             "stateMutability": "nonpayable",
//             "type": "function"
//         },
//         {
//             "inputs": [
//                 {
//                     "internalType": "address",
//                     "name": "operator",
//                     "type": "address"
//                 },
//                 {
//                     "internalType": "bool",
//                     "name": "approved",
//                     "type": "bool"
//                 }
//             ],
//             "name": "setApprovalForAll",
//             "outputs": [],
//             "stateMutability": "nonpayable",
//             "type": "function"
//         },
//         {
//             "inputs": [
//                 {
//                     "internalType": "uint256",
//                     "name": "_tokenId",
//                     "type": "uint256"
//                 },
//                 {
//                     "internalType": "string",
//                     "name": "_type",
//                     "type": "string"
//                 }
//             ],
//             "name": "setTokenType",
//             "outputs": [],
//             "stateMutability": "nonpayable",
//             "type": "function"
//         },
//         {
//             "inputs": [
//                 {
//                     "internalType": "bytes4",
//                     "name": "interfaceId",
//                     "type": "bytes4"
//                 }
//             ],
//             "name": "supportsInterface",
//             "outputs": [
//                 {
//                     "internalType": "bool",
//                     "name": "",
//                     "type": "bool"
//                 }
//             ],
//             "stateMutability": "view",
//             "type": "function"
//         },
//         {
//             "inputs": [
//                 {
//                     "internalType": "uint256",
//                     "name": "",
//                     "type": "uint256"
//                 }
//             ],
//             "name": "tokenContentHashes",
//             "outputs": [
//                 {
//                     "internalType": "bytes32",
//                     "name": "",
//                     "type": "bytes32"
//                 }
//             ],
//             "stateMutability": "view",
//             "type": "function"
//         },
//         {
//             "inputs": [
//                 {
//                     "internalType": "uint256",
//                     "name": "",
//                     "type": "uint256"
//                 }
//             ],
//             "name": "tokenCreators",
//             "outputs": [
//                 {
//                     "internalType": "address",
//                     "name": "",
//                     "type": "address"
//                 }
//             ],
//             "stateMutability": "view",
//             "type": "function"
//         },
//         {
//             "inputs": [
//                 {
//                     "internalType": "uint256",
//                     "name": "",
//                     "type": "uint256"
//                 }
//             ],
//             "name": "tokenMetadataHashes",
//             "outputs": [
//                 {
//                     "internalType": "bytes32",
//                     "name": "",
//                     "type": "bytes32"
//                 }
//             ],
//             "stateMutability": "view",
//             "type": "function"
//         },
//         {
//             "inputs": [
//                 {
//                     "internalType": "uint256",
//                     "name": "tokenId",
//                     "type": "uint256"
//                 }
//             ],
//             "name": "tokenMetadataURI",
//             "outputs": [
//                 {
//                     "internalType": "string",
//                     "name": "",
//                     "type": "string"
//                 }
//             ],
//             "stateMutability": "view",
//             "type": "function"
//         },
//         {
//             "inputs": [
//                 {
//                     "internalType": "uint256",
//                     "name": "tokenId",
//                     "type": "uint256"
//                 }
//             ],
//             "name": "tokentype",
//             "outputs": [
//                 {
//                     "internalType": "string",
//                     "name": "",
//                     "type": "string"
//                 }
//             ],
//             "stateMutability": "view",
//             "type": "function"
//         },
//         {
//             "inputs": [
//                 {
//                     "internalType": "uint256",
//                     "name": "tokenId",
//                     "type": "uint256"
//                 },
//                 {
//                     "internalType": "string",
//                     "name": "metadataURI",
//                     "type": "string"
//                 }
//             ],
//             "name": "updateTokenMetadataURI",
//             "outputs": [],
//             "stateMutability": "nonpayable",
//             "type": "function"
//         },
//         {
//             "inputs": [
//                 {
//                     "internalType": "uint256",
//                     "name": "tokenId",
//                     "type": "uint256"
//                 },
//                 {
//                     "internalType": "string",
//                     "name": "tokenURI",
//                     "type": "string"
//                 }
//             ],
//             "name": "updateTokenURI",
//             "outputs": [],
//             "stateMutability": "nonpayable",
//             "type": "function"
//         },
//         {
//             "inputs": [
//                 {
//                     "internalType": "uint256",
//                     "name": "tokenId",
//                     "type": "uint256"
//                 }
//             ],
//             "name": "uri",
//             "outputs": [
//                 {
//                     "internalType": "string",
//                     "name": "",
//                     "type": "string"
//                 }
//             ],
//             "stateMutability": "view",
//             "type": "function"
//         }
//     ]

//     const contractAddress = process.env.CONTRACT_ADDRESS;
//     var contract = new connectWeb3.eth.Contract(abiArray, contractAddress, { from: from0xaddress })
//     //var amountInUint = connectWeb3.utils.toWei(assets_avaliable.weight);
//     var amountInUint = assets_avaliable.weight;

//     // useraddress = "0x00da1094c17793bfc060924a990e82b1783edde4"


//     const txConfig = {
//         from: from0xaddress,
//         to: contractAddress,
//         gasPrice: "1000000000000",
//         gas: "800000",
//         // nonce: nonce2,
//         data: contract.methods.mint(awareData, useraddress, amountInUint).encodeABI(),
//     };




//     connectWeb3.eth.accounts.signTransaction(txConfig, privatekey, async function (err, signedTx) {
//         if (err) {
//             console.log("err", err)
//             callback(false);
//         }

//         console.log("signedTx", signedTx)

//         connectWeb3.eth.sendSignedTransaction(signedTx.rawTransaction)
//             .on("receipt", async function (receipt) {
//                 console.log("Tx Hash (Receipt): ", receipt);


//                 transaction_history.create(
//                     {
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
//                     }, async function (err, history) {

//                         if (err) {
//                             console.log("err", err)
//                             callback(false);

//                         }


//                         const query = gql`
//                             {
//                                 awareTokens(where: { owner: "${useraddress.toLowerCase()}" }) {
//                                 id
//                                 owner {
//                                 id
//                                     }
//                                 creator {
//                                 id
//                                     }
//                                 contentURI
//                                 metadataURI
//                                 amount
//                                 createdAtTimestamp        
//                                 }
//                             }`


//                         setTimeout(async () => {
//                             var result = await request(process.env.SUBGRAPH_URL, query)

//                             var tokens_in_wallet = result.awareTokens.sort(compare).reverse();

//                             console.log("tokens_in_wallet", tokens_in_wallet)

//                             const postID = tokens_in_wallet[0].id;

//                             console.log("postID", postID)

//                             const query2 = gql`{awareToken(id:"${postID.toString()}") {id,owner {id},creator {id},contentURI,metadataURI,amount,createdAtTimestamp}}`

//                             var token = await request(process.env.SUBGRAPH_URL, query2)

//                             const metadata = await axios.get(token.awareToken.metadataURI);

//                             console.log("metadata.data.description", metadata.data.description)
//                             console.log("update_aware_token_id", update_aware_token_id)

//                             if (metadata.data.description == update_aware_token_id) {

//                                 var wallet_of_sender = await wallets.findOne({ wallet_address_0x: useraddress }).select(['wallet_address_0x', 'from', 'to']).catch((ex) => { return res.status(400).jsonp({ status: false, message: "Bad request!" }); })

//                                 var key = wallet_of_sender.from + wallet_of_sender.to;
//                                 var decrypted_private_key = helperfunctions.encryptAddress(key, 'decrypt');

//                                 var privatekey = "";
//                                 for (var i = 3; i < decrypted_private_key.length - 1; i++) {
//                                     privatekey = privatekey + decrypted_private_key[i];
//                                 }

//                                 var abiArray = [
//                                     {
//                                         "inputs": [],
//                                         "stateMutability": "nonpayable",
//                                         "type": "constructor"
//                                     },
//                                     {
//                                         "anonymous": false,
//                                         "inputs": [
//                                             {
//                                                 "indexed": true,
//                                                 "internalType": "address",
//                                                 "name": "account",
//                                                 "type": "address"
//                                             },
//                                             {
//                                                 "indexed": true,
//                                                 "internalType": "address",
//                                                 "name": "operator",
//                                                 "type": "address"
//                                             },
//                                             {
//                                                 "indexed": false,
//                                                 "internalType": "bool",
//                                                 "name": "approved",
//                                                 "type": "bool"
//                                             }
//                                         ],
//                                         "name": "ApprovalForAll",
//                                         "type": "event"
//                                     },
//                                     {
//                                         "anonymous": false,
//                                         "inputs": [
//                                             {
//                                                 "indexed": true,
//                                                 "internalType": "uint256",
//                                                 "name": "_tokenId",
//                                                 "type": "uint256"
//                                             },
//                                             {
//                                                 "indexed": false,
//                                                 "internalType": "address",
//                                                 "name": "owner",
//                                                 "type": "address"
//                                             },
//                                             {
//                                                 "indexed": false,
//                                                 "internalType": "string",
//                                                 "name": "_uri",
//                                                 "type": "string"
//                                             }
//                                         ],
//                                         "name": "TokenMetadataURIUpdated",
//                                         "type": "event"
//                                     },
//                                     {
//                                         "anonymous": false,
//                                         "inputs": [
//                                             {
//                                                 "indexed": true,
//                                                 "internalType": "uint256",
//                                                 "name": "_tokenId",
//                                                 "type": "uint256"
//                                             },
//                                             {
//                                                 "indexed": false,
//                                                 "internalType": "address",
//                                                 "name": "owner",
//                                                 "type": "address"
//                                             },
//                                             {
//                                                 "indexed": false,
//                                                 "internalType": "string",
//                                                 "name": "_uri",
//                                                 "type": "string"
//                                             }
//                                         ],
//                                         "name": "TokenURIUpdated",
//                                         "type": "event"
//                                     },
//                                     {
//                                         "anonymous": false,
//                                         "inputs": [
//                                             {
//                                                 "indexed": true,
//                                                 "internalType": "address",
//                                                 "name": "operator",
//                                                 "type": "address"
//                                             },
//                                             {
//                                                 "indexed": true,
//                                                 "internalType": "address",
//                                                 "name": "from",
//                                                 "type": "address"
//                                             },
//                                             {
//                                                 "indexed": true,
//                                                 "internalType": "address",
//                                                 "name": "to",
//                                                 "type": "address"
//                                             },
//                                             {
//                                                 "indexed": false,
//                                                 "internalType": "uint256[]",
//                                                 "name": "ids",
//                                                 "type": "uint256[]"
//                                             },
//                                             {
//                                                 "indexed": false,
//                                                 "internalType": "uint256[]",
//                                                 "name": "values",
//                                                 "type": "uint256[]"
//                                             }
//                                         ],
//                                         "name": "TransferBatch",
//                                         "type": "event"
//                                     },
//                                     {
//                                         "anonymous": false,
//                                         "inputs": [
//                                             {
//                                                 "indexed": true,
//                                                 "internalType": "address",
//                                                 "name": "operator",
//                                                 "type": "address"
//                                             },
//                                             {
//                                                 "indexed": true,
//                                                 "internalType": "address",
//                                                 "name": "from",
//                                                 "type": "address"
//                                             },
//                                             {
//                                                 "indexed": true,
//                                                 "internalType": "address",
//                                                 "name": "to",
//                                                 "type": "address"
//                                             },
//                                             {
//                                                 "indexed": false,
//                                                 "internalType": "uint256",
//                                                 "name": "id",
//                                                 "type": "uint256"
//                                             },
//                                             {
//                                                 "indexed": false,
//                                                 "internalType": "uint256",
//                                                 "name": "value",
//                                                 "type": "uint256"
//                                             }
//                                         ],
//                                         "name": "TransferSingle",
//                                         "type": "event"
//                                     },
//                                     {
//                                         "anonymous": false,
//                                         "inputs": [
//                                             {
//                                                 "indexed": false,
//                                                 "internalType": "string",
//                                                 "name": "value",
//                                                 "type": "string"
//                                             },
//                                             {
//                                                 "indexed": true,
//                                                 "internalType": "uint256",
//                                                 "name": "id",
//                                                 "type": "uint256"
//                                             }
//                                         ],
//                                         "name": "URI",
//                                         "type": "event"
//                                     },
//                                     {
//                                         "inputs": [
//                                             {
//                                                 "internalType": "address",
//                                                 "name": "account",
//                                                 "type": "address"
//                                             },
//                                             {
//                                                 "internalType": "uint256",
//                                                 "name": "id",
//                                                 "type": "uint256"
//                                             }
//                                         ],
//                                         "name": "balanceOf",
//                                         "outputs": [
//                                             {
//                                                 "internalType": "uint256",
//                                                 "name": "",
//                                                 "type": "uint256"
//                                             }
//                                         ],
//                                         "stateMutability": "view",
//                                         "type": "function"
//                                     },
//                                     {
//                                         "inputs": [
//                                             {
//                                                 "internalType": "address[]",
//                                                 "name": "accounts",
//                                                 "type": "address[]"
//                                             },
//                                             {
//                                                 "internalType": "uint256[]",
//                                                 "name": "ids",
//                                                 "type": "uint256[]"
//                                             }
//                                         ],
//                                         "name": "balanceOfBatch",
//                                         "outputs": [
//                                             {
//                                                 "internalType": "uint256[]",
//                                                 "name": "",
//                                                 "type": "uint256[]"
//                                             }
//                                         ],
//                                         "stateMutability": "view",
//                                         "type": "function"
//                                     },
//                                     {
//                                         "inputs": [
//                                             {
//                                                 "internalType": "address",
//                                                 "name": "from",
//                                                 "type": "address"
//                                             },
//                                             {
//                                                 "internalType": "uint256",
//                                                 "name": "tokenId",
//                                                 "type": "uint256"
//                                             },
//                                             {
//                                                 "internalType": "uint256",
//                                                 "name": "amount",
//                                                 "type": "uint256"
//                                             }
//                                         ],
//                                         "name": "burn",
//                                         "outputs": [],
//                                         "stateMutability": "nonpayable",
//                                         "type": "function"
//                                     },
//                                     {
//                                         "inputs": [
//                                             {
//                                                 "internalType": "address",
//                                                 "name": "account",
//                                                 "type": "address"
//                                             },
//                                             {
//                                                 "internalType": "uint256[]",
//                                                 "name": "ids",
//                                                 "type": "uint256[]"
//                                             },
//                                             {
//                                                 "internalType": "uint256[]",
//                                                 "name": "values",
//                                                 "type": "uint256[]"
//                                             }
//                                         ],
//                                         "name": "burnBatch",
//                                         "outputs": [],
//                                         "stateMutability": "nonpayable",
//                                         "type": "function"
//                                     },
//                                     {
//                                         "inputs": [
//                                             {
//                                                 "internalType": "address",
//                                                 "name": "account",
//                                                 "type": "address"
//                                             },
//                                             {
//                                                 "internalType": "address",
//                                                 "name": "operator",
//                                                 "type": "address"
//                                             }
//                                         ],
//                                         "name": "isApprovedForAll",
//                                         "outputs": [
//                                             {
//                                                 "internalType": "bool",
//                                                 "name": "",
//                                                 "type": "bool"
//                                             }
//                                         ],
//                                         "stateMutability": "view",
//                                         "type": "function"
//                                     },
//                                     {
//                                         "inputs": [
//                                             {
//                                                 "components": [
//                                                     {
//                                                         "internalType": "string",
//                                                         "name": "tokenURI",
//                                                         "type": "string"
//                                                     },
//                                                     {
//                                                         "internalType": "string",
//                                                         "name": "metadataURI",
//                                                         "type": "string"
//                                                     },
//                                                     {
//                                                         "internalType": "bytes32",
//                                                         "name": "contentHash",
//                                                         "type": "bytes32"
//                                                     },
//                                                     {
//                                                         "internalType": "bytes32",
//                                                         "name": "metadataHash",
//                                                         "type": "bytes32"
//                                                     }
//                                                 ],
//                                                 "internalType": "struct IAwareToken.AwareData",
//                                                 "name": "data",
//                                                 "type": "tuple"
//                                             },
//                                             {
//                                                 "internalType": "address",
//                                                 "name": "recipient",
//                                                 "type": "address"
//                                             },
//                                             {
//                                                 "internalType": "uint256",
//                                                 "name": "amount",
//                                                 "type": "uint256"
//                                             }
//                                         ],
//                                         "name": "mint",
//                                         "outputs": [],
//                                         "stateMutability": "nonpayable",
//                                         "type": "function"
//                                     },
//                                     {
//                                         "inputs": [
//                                             {
//                                                 "internalType": "uint256",
//                                                 "name": "tokenId",
//                                                 "type": "uint256"
//                                             }
//                                         ],
//                                         "name": "ownerOf",
//                                         "outputs": [
//                                             {
//                                                 "internalType": "address",
//                                                 "name": "",
//                                                 "type": "address"
//                                             }
//                                         ],
//                                         "stateMutability": "view",
//                                         "type": "function"
//                                     },
//                                     {
//                                         "inputs": [
//                                             {
//                                                 "internalType": "uint256",
//                                                 "name": "",
//                                                 "type": "uint256"
//                                             }
//                                         ],
//                                         "name": "previousTokenOwners",
//                                         "outputs": [
//                                             {
//                                                 "internalType": "address",
//                                                 "name": "",
//                                                 "type": "address"
//                                             }
//                                         ],
//                                         "stateMutability": "view",
//                                         "type": "function"
//                                     },
//                                     {
//                                         "inputs": [
//                                             {
//                                                 "internalType": "address",
//                                                 "name": "from",
//                                                 "type": "address"
//                                             },
//                                             {
//                                                 "internalType": "address",
//                                                 "name": "to",
//                                                 "type": "address"
//                                             },
//                                             {
//                                                 "internalType": "uint256[]",
//                                                 "name": "ids",
//                                                 "type": "uint256[]"
//                                             },
//                                             {
//                                                 "internalType": "uint256[]",
//                                                 "name": "amounts",
//                                                 "type": "uint256[]"
//                                             },
//                                             {
//                                                 "internalType": "bytes",
//                                                 "name": "data",
//                                                 "type": "bytes"
//                                             }
//                                         ],
//                                         "name": "safeBatchTransferFrom",
//                                         "outputs": [],
//                                         "stateMutability": "nonpayable",
//                                         "type": "function"
//                                     },
//                                     {
//                                         "inputs": [
//                                             {
//                                                 "internalType": "address",
//                                                 "name": "from",
//                                                 "type": "address"
//                                             },
//                                             {
//                                                 "internalType": "address",
//                                                 "name": "to",
//                                                 "type": "address"
//                                             },
//                                             {
//                                                 "internalType": "uint256",
//                                                 "name": "id",
//                                                 "type": "uint256"
//                                             },
//                                             {
//                                                 "internalType": "uint256",
//                                                 "name": "amount",
//                                                 "type": "uint256"
//                                             },
//                                             {
//                                                 "internalType": "bytes",
//                                                 "name": "data",
//                                                 "type": "bytes"
//                                             }
//                                         ],
//                                         "name": "safeTransferFrom",
//                                         "outputs": [],
//                                         "stateMutability": "nonpayable",
//                                         "type": "function"
//                                     },
//                                     {
//                                         "inputs": [
//                                             {
//                                                 "internalType": "address",
//                                                 "name": "operator",
//                                                 "type": "address"
//                                             },
//                                             {
//                                                 "internalType": "bool",
//                                                 "name": "approved",
//                                                 "type": "bool"
//                                             }
//                                         ],
//                                         "name": "setApprovalForAll",
//                                         "outputs": [],
//                                         "stateMutability": "nonpayable",
//                                         "type": "function"
//                                     },
//                                     {
//                                         "inputs": [
//                                             {
//                                                 "internalType": "uint256",
//                                                 "name": "_tokenId",
//                                                 "type": "uint256"
//                                             },
//                                             {
//                                                 "internalType": "string",
//                                                 "name": "_type",
//                                                 "type": "string"
//                                             }
//                                         ],
//                                         "name": "setTokenType",
//                                         "outputs": [],
//                                         "stateMutability": "nonpayable",
//                                         "type": "function"
//                                     },
//                                     {
//                                         "inputs": [
//                                             {
//                                                 "internalType": "bytes4",
//                                                 "name": "interfaceId",
//                                                 "type": "bytes4"
//                                             }
//                                         ],
//                                         "name": "supportsInterface",
//                                         "outputs": [
//                                             {
//                                                 "internalType": "bool",
//                                                 "name": "",
//                                                 "type": "bool"
//                                             }
//                                         ],
//                                         "stateMutability": "view",
//                                         "type": "function"
//                                     },
//                                     {
//                                         "inputs": [
//                                             {
//                                                 "internalType": "uint256",
//                                                 "name": "",
//                                                 "type": "uint256"
//                                             }
//                                         ],
//                                         "name": "tokenContentHashes",
//                                         "outputs": [
//                                             {
//                                                 "internalType": "bytes32",
//                                                 "name": "",
//                                                 "type": "bytes32"
//                                             }
//                                         ],
//                                         "stateMutability": "view",
//                                         "type": "function"
//                                     },
//                                     {
//                                         "inputs": [
//                                             {
//                                                 "internalType": "uint256",
//                                                 "name": "",
//                                                 "type": "uint256"
//                                             }
//                                         ],
//                                         "name": "tokenCreators",
//                                         "outputs": [
//                                             {
//                                                 "internalType": "address",
//                                                 "name": "",
//                                                 "type": "address"
//                                             }
//                                         ],
//                                         "stateMutability": "view",
//                                         "type": "function"
//                                     },
//                                     {
//                                         "inputs": [
//                                             {
//                                                 "internalType": "uint256",
//                                                 "name": "",
//                                                 "type": "uint256"
//                                             }
//                                         ],
//                                         "name": "tokenMetadataHashes",
//                                         "outputs": [
//                                             {
//                                                 "internalType": "bytes32",
//                                                 "name": "",
//                                                 "type": "bytes32"
//                                             }
//                                         ],
//                                         "stateMutability": "view",
//                                         "type": "function"
//                                     },
//                                     {
//                                         "inputs": [
//                                             {
//                                                 "internalType": "uint256",
//                                                 "name": "tokenId",
//                                                 "type": "uint256"
//                                             }
//                                         ],
//                                         "name": "tokenMetadataURI",
//                                         "outputs": [
//                                             {
//                                                 "internalType": "string",
//                                                 "name": "",
//                                                 "type": "string"
//                                             }
//                                         ],
//                                         "stateMutability": "view",
//                                         "type": "function"
//                                     },
//                                     {
//                                         "inputs": [
//                                             {
//                                                 "internalType": "uint256",
//                                                 "name": "tokenId",
//                                                 "type": "uint256"
//                                             }
//                                         ],
//                                         "name": "tokentype",
//                                         "outputs": [
//                                             {
//                                                 "internalType": "string",
//                                                 "name": "",
//                                                 "type": "string"
//                                             }
//                                         ],
//                                         "stateMutability": "view",
//                                         "type": "function"
//                                     },
//                                     {
//                                         "inputs": [
//                                             {
//                                                 "internalType": "uint256",
//                                                 "name": "tokenId",
//                                                 "type": "uint256"
//                                             },
//                                             {
//                                                 "internalType": "string",
//                                                 "name": "metadataURI",
//                                                 "type": "string"
//                                             }
//                                         ],
//                                         "name": "updateTokenMetadataURI",
//                                         "outputs": [],
//                                         "stateMutability": "nonpayable",
//                                         "type": "function"
//                                     },
//                                     {
//                                         "inputs": [
//                                             {
//                                                 "internalType": "uint256",
//                                                 "name": "tokenId",
//                                                 "type": "uint256"
//                                             },
//                                             {
//                                                 "internalType": "string",
//                                                 "name": "tokenURI",
//                                                 "type": "string"
//                                             }
//                                         ],
//                                         "name": "updateTokenURI",
//                                         "outputs": [],
//                                         "stateMutability": "nonpayable",
//                                         "type": "function"
//                                     },
//                                     {
//                                         "inputs": [
//                                             {
//                                                 "internalType": "uint256",
//                                                 "name": "tokenId",
//                                                 "type": "uint256"
//                                             }
//                                         ],
//                                         "name": "uri",
//                                         "outputs": [
//                                             {
//                                                 "internalType": "string",
//                                                 "name": "",
//                                                 "type": "string"
//                                             }
//                                         ],
//                                         "stateMutability": "view",
//                                         "type": "function"
//                                     }
//                                 ]

//                                 // const contractAddress = process.env.CONTRACT_ADDRESS;
//                                 var contract2 = new connectWeb3.eth.Contract(abiArray, contractAddress, { from: process.env.ADMIN_WALLET_ADDRESS })

//                                 var token_ids = [];
//                                 var array_of_amounts = [];
//                                 tokens_that_needs_to_be_burn.forEach((dataset) => {
//                                     token_ids.push(dataset.blockchain_id.toString());
//                                     array_of_amounts.push(dataset.used_tokens.toString());
//                                 })

//                                 console.log("token_ids", token_ids);
//                                 console.log("array_of_amounts", array_of_amounts);

//                                 // try {
//                                 //     var check_balance = await contract.methods.balanceOfBatch([useraddress.toLowerCase(),useraddress.toLowerCase()], token_ids).call();
//                                 //     console.log("check_balance", check_balance);
//                                 // }
//                                 // catch (ex) {

//                                 // }

//                                 console.log("required info", postID, 'Approved', selected_update_aware_token_found.aware_output_token_type, Number(assets_avaliable.weight), Number(assets_avaliable.weight), "useraddress", useraddress)

//                                 const query3 = gql`{
//                                     awareTokens(where: { owner: "${useraddress}" }) {
//                                       id
//                                       owner {
//                                         id
//                                       }
//                                       creator {
//                                         id
//                                       }
//                                       contentURI
//                                       metadataURI
//                                       amount
//                                       createdAtTimestamp        
//                                     }
//                                   }`;

//                                 var token3 = await request(process.env.SUBGRAPH_URL, query3);

//                                 console.log("token3", token3)




//                                 var gasAmount = await contract2.methods.safeBatchTransferFrom(useraddress.toLowerCase(), process.env.DUMP_WALLET_ADDRESS, token_ids, array_of_amounts, []).estimateGas({ from: useraddress });

//                                 var increased = Number(gasAmount) * 0.2;
//                                 gasAmount = Math.ceil(Number(gasAmount) + increased);


//                                 connectWeb3.eth.getBalance(useraddress.toLowerCase()).then(
//                                     async function (balance) {

//                                         let iotxBalance = Big(balance).div(10 ** 18);
//                                         console.log("new iotxBalance", iotxBalance.toFixed(18))

//                                         if (iotxBalance.toFixed(18) < 2) {

//                                             await transferAsync(useraddress.toLowerCase(), gasAmount,
//                                                 async function (response) {

//                                                     connectWeb3.eth.getBalance(useraddress.toLowerCase()).then(
//                                                         async function (balance) {

//                                                             let iotxBalance = Big(balance).div(10 ** 18);
//                                                             console.log("new iotxBalance", iotxBalance.toFixed(18))
//                                                             if (response == true && iotxBalance.toFixed(18) > 0) {

//                                                                 const gasPrice = await connectWeb3.eth.getGasPrice();

//                                                                 const txConfig = {
//                                                                     from: useraddress,
//                                                                     to: contractAddress,
//                                                                     gasPrice: gasPrice,
//                                                                     gas: gasAmount.toString(),
//                                                                     data: contract2.methods.safeBatchTransferFrom(useraddress.toLowerCase(), process.env.DUMP_WALLET_ADDRESS, token_ids, array_of_amounts, []).encodeABI(),
//                                                                 };


//                                                                 connectWeb3.eth.accounts.signTransaction(txConfig, '0x' + privatekey, async function (err, signedTx) {
//                                                                     if (err) {
//                                                                         console.log("signTransactionerr", err)

//                                                                         callback(false);
//                                                                     }

//                                                                     console.log("signedTx", signedTx)
//                                                                     connectWeb3.eth.sendSignedTransaction(signedTx.rawTransaction)
//                                                                         .on("receipt", async function (receipt) {
//                                                                             console.log("Tx Hash (Receipt): ", receipt);

//                                                                             await update_aw_tokens.findOneAndUpdate({ _id: update_aware_token_id },
//                                                                                 {
//                                                                                     blockchain_id: postID,
//                                                                                     status: 'Approved',
//                                                                                     type_of_token: selected_update_aware_token_found.aware_output_token_type,
//                                                                                     total_tokens: Number(assets_avaliable.weight),
//                                                                                     avaliable_tokens: Number(assets_avaliable.weight),

//                                                                                 }, { new: true },
//                                                                             ).catch((ex) => { callback(false); });


//                                                                             callback(true);

//                                                                         })
//                                                                         .on("error", async function (e) {
//                                                                             console.log("e", e)
//                                                                             callback(false);
//                                                                         });
//                                                                 });


//                                                             }
//                                                             else {
//                                                                 callback(false);
//                                                             }

//                                                         })


//                                                 })

//                                         }
//                                         else {

//                                             const gasPrice = await connectWeb3.eth.getGasPrice();
//                                             const txConfig = {
//                                                 from: from0xaddress,
//                                                 to: contractAddress,
//                                                 gasPrice: gasPrice,
//                                                 gas: gasAmount.toString(),
//                                                 data: contract2.methods.safeBatchTransferFrom(useraddress.toLowerCase(), process.env.DUMP_WALLET_ADDRESS, token_ids, array_of_amounts, []).encodeABI(),
//                                             };


//                                             console.log("bangtxConfig", txConfig)

//                                             connectWeb3.eth.accounts.signTransaction(txConfig, '0x' + privatekey, async function (err, signedTx) {
//                                                 if (err) {
//                                                     console.log("signTransactionerr", err)

//                                                     callback(false);
//                                                 }

//                                                 console.log("signedTx", signedTx)
//                                                 connectWeb3.eth.sendSignedTransaction(signedTx.rawTransaction)
//                                                     .on("receipt", async function (receipt) {
//                                                         console.log("Tx Hash (Receipt): ", receipt);

//                                                         await update_aw_tokens.findOneAndUpdate({ _id: update_aware_token_id },
//                                                             {
//                                                                 blockchain_id: postID,
//                                                                 status: 'Approved',
//                                                                 type_of_token: selected_update_aware_token_found.aware_output_token_type,
//                                                                 total_tokens: Number(assets_avaliable.weight),
//                                                                 avaliable_tokens: Number(assets_avaliable.weight),

//                                                             }, { new: true },
//                                                         ).catch((ex) => { callback(false); });


//                                                         callback(true);
//                                                     })
//                                                     .on("error", async function (e) {
//                                                         console.log("e", e)
//                                                         callback(false);
//                                                     });
//                                             });
//                                         }
//                                     })
//                             }
//                             else {

//                                 console.log("update_aware_token_id, Not macthed")

//                                 callback(false);
//                             }

//                         }, "15000")


//                     })

//             })
//             .on("error", async function (e) {

//                 console.log("eeeee", e)
//                 callback(false);
//             });
//     });

// }





// async function processTokens() {
//     try {
//         const result = await request(process.env.SUBGRAPH_URL, query);
//         const tokens_in_wallet = result.awareTokens.sort(compare).reverse();
//         const postID = tokens_in_wallet[0].id;
//         const query2 = gql`{awareToken(id: "${postID.toString()}") {id, owner {id}, creator {id}, contentURI, metadataURI, amount, createdAtTimestamp}}`;
//         const token = await request(process.env.SUBGRAPH_URL, query2);
//         const metadata = await axios.get(token.awareToken.metadataURI);

//         if (metadata.data.description === update_aware_token_id) {
//             const wallet_of_sender = await wallets.findOne({ wallet_address_0x: useraddress }).select(['wallet_address_0x', 'from', 'to']);
//             const key = wallet_of_sender.from + wallet_of_sender.to;
//             const decrypted_private_key = helperfunctions.encryptAddress(key, 'decrypt');
//             const privatekey = decrypted_private_key.substring(3, decrypted_private_key.length - 1);

//             const abiArray = [];
//             const contract2 = new connectWeb3.eth.Contract(abiArray, process.env.CONTRACT_ADDRESS, { from: process.env.ADMIN_WALLET_ADDRESS });

//             const token_ids = tokens_that_needs_to_be_burn.map((dataset) => dataset.blockchain_id.toString());
//             const array_of_amounts = tokens_that_needs_to_be_burn.map((dataset) => dataset.used_tokens.toString());

//             let gasAmount = await contract2.methods.safeBatchTransferFrom(useraddress.toLowerCase(),
//                 process.env.DUMP_WALLET_ADDRESS, token_ids, array_of_amounts, []).estimateGas({ from: useraddress });

//             const increased = Number(gasAmount) * 0.2;
//             gasAmount = Math.ceil(Number(gasAmount) + increased);

//             const balance = await connectWeb3.eth.getBalance(useraddress.toLowerCase());
//             const iotxBalance = Big(balance).div(10 ** 18);

//             if (iotxBalance.toFixed(18) < 2) {
//                 const response = await transferAsync(useraddress.toLowerCase(), gasAmount);

//                 const updatedBalance = await connectWeb3.eth.getBalance(useraddress.toLowerCase());
//                 const updatedIotxBalance = Big(updatedBalance).div(10 ** 18);

//                 if (response && updatedIotxBalance.toFixed(18) > 0) {
//                     const gasPrice = await connectWeb3.eth.getGasPrice();
//                     const txConfig = {
//                         from: useraddress,
//                         to: process.env.CONTRACT_ADDRESS,
//                         gasPrice: gasPrice,
//                         gas: gasAmount.toString(),
//                         data: contract2.methods.safeBatchTransferFrom(useraddress.toLowerCase(),
//                             process.env.DUMP_WALLET_ADDRESS, token_ids, array_of_amounts, []).encodeABI(),
//                     };

//                     const signedTx = await connectWeb3.eth.accounts.signTransaction(txConfig, `0x${privatekey}`);

//                     const receipt = await connectWeb3.eth.sendSignedTransaction(signedTx.rawTransaction);
//                     console.log("Tx Hash (Receipt): ", receipt);

//                     const token_data = {
//                         blockchain_id: postID,
//                         status: 'Approved',
//                         type_of_token: selected_update_aware_token_found.aware_output_token_type,
//                         total_tokens: Number(assets_avaliable.weight),
//                         available_tokens: Number(assets_avaliable.weight),
//                     };

//                     await update_aw_tokens.findOneAndUpdate({ _id: update_aware_token_id },
//                         token_data, { new: true });

//                     callback(true);
//                 }
//             }
//         }
//     } catch (error) {
//         console.error(error);
//         callback(false);
//     }
// }