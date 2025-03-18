import {
  awaretoken,
  constructAwareData,
  sha256FromBuffer,
  generateMetadata,
} from "../@aware/sdk"; // Aware provider
import axios from "axios"; // axios requests
import Web3Modal from "web3modal"; // Web3Modal
import { providers } from "ethers"; // Ethers
import { useState, useEffect } from "react"; // State management
import { createContainer } from "unstated-next"; // Unstated-next containerization
import WalletConnectProvider from "@walletconnect/web3-provider"; // WalletConnectProvider (Web3Modal)
import addressbook from "../config/4690.json";
import { AwareToken__factory } from '../@aware/sdk/typechain';
import { JsonRpcProvider } from '@ethersproject/providers';
import Web3 from "web3";
// Web3Modal provider options
// const providerOptions = {
//   walletconnect: {
//     package: WalletConnectProvider,
//     options: {
//       // Inject Infura
//       infuraId: process.env.NEXT_PUBLIC_INFURA_ID,
//     },
//   },
// };

// const provider = new WalletConnectProvider({
//   rpc: {
//     4690: process.env.BABEL_ENDPOINT,    
//     // ...
//   },
// });

function useWeb3() {
  // const [AwareToken, setAwareToken] = useState(null); // Pebble provider
  // const [modal, setModal] = useState(null); // Web3Modal
  // const [address, setAddress] = useState(null); // ETH address
  // const [signer, setSigner] = useState(null); // connected user address
  // const [AwareTokenBalance, setAwareTokenBalance] = useState(0); // Token balance
  
  /**
   * Setup Web3Modal on page load (requires window)
   */
  // const setupWeb3Modal = () => {
  //   // Creaste new web3Modal
  //   const web3Modal = new Web3Modal({
  //     network: "iotextestnet",
  //     cacheProvider: true,
  //     provider
  //   });

  //   // const web3Modal = new Web3Modal({
  //   //   network: "ropsten",
  //   //   cacheProvider: true,
  //   //   providerOptions: providerOptions,
  //   // });

  //   // Set web3Modal
  //   setModal(web3Modal);
  // };

  /**
   * Authenticate and store necessary items in global state
   */
  // const authenticate = async () => {
  //   // Initiate web3Modal
  //   const web3Provider = await modal.connect();
  //   await web3Provider.enable();

  //   // Generate ethers provider
  //   const provider = new providers.Web3Provider(web3Provider);

  //   console.log(provider);
  //   // Collect address
  //   const signer = provider.getSigner();
  //   const address = await signer.getAddress();
  //   setAddress(address);
  //   setSigner(signer);

  //   // Generate Aware provider
  //   const Awareobj = new awaretoken(signer, 4690, addressbook.awareToken);
   
  //   console.log(Awareobj);    
  //   setAwareToken(Awareobj);
  // };

  // const getuserAddress = async() => {
  //   if(signer){
  //     return await signer.getAddress();
  //   }
  //   if(address){
  //     return address;
  //   }
  // }
 
  // const getMetaDataStr = async( name, date, awareTokenType, awareAssetId, productionFacility, producer, batchNo, valueChainProcess, materialSpecs) => {
  //   const objJSON = {    
  //     "name": name,  
  //     "date": date,
  //     "awareTokenType": awareTokenType,
  //     "awareAssetId": awareAssetId,
  //     "productionFacility": productionFacility,
  //     "producer": producer,
  //     "batchNo": batchNo,
  //     "valueChainProcess": valueChainProcess,
  //     "materialSpecs": materialSpecs
  //   }
  //   return JSON.stringify(objJSON);
  // } 
  /**
   * Converts File to an ArrayBuffer for hashing preperation
   * @param {File} file uploaded file
   * @returns {ArrayBuffer} from file
   */
  const getFileBuffer = async (file) => {
    return new Promise((res, rej) => {
      // create file reader
      let reader = new FileReader();

      // register event listeners
      reader.addEventListener("loadend", (e) => res(e.target.result));
      reader.addEventListener("error", rej);

      // read file
      reader.readAsArrayBuffer(file);
    });
  };

  /**
   * Mints media to Pebble
   * @param {File} file media to mint
   * @param {String} name of media
   * @param {String} description of media
   * @param {Number} fee to share with previous owner
   */
  const mintAwareToken = async (file, name, awaremetadata, useraddress, amount ) => {
    
    // console.log(file, name, awaremetadata.description, awaremetadata.sustainableProcessClaim);
    // Generate metadataJSON
    const metadataJSON = generateMetadata("aware-20221012", {
      description: awaremetadata.description ? awaremetadata.description : "",
      version: "aware-20221012",      
      name: name,
      date: awaremetadata.date,
      awareTokenType: awaremetadata.awareTokenType,
      awareAssetId: awaremetadata.awareAssetId,
      productionFacility: awaremetadata.productionFacility,
      producer: awaremetadata.producer,
      batchNo: awaremetadata.batchNo,
      weightInKgs: awaremetadata.weightInKgs
    });

    // Generate image buffer
    const buffer = getFileBuffer(file);

    // console.log(buffer);

    // Generate content hashes
    const contentHash = sha256FromBuffer(Buffer.from(buffer));
    const metadataHash = sha256FromBuffer(Buffer.from(metadataJSON));

    // Upload files to fleek
    let formData = new FormData();
    formData.append("upload", file);
    formData.append("name", name);
    formData.append("metadata", metadataJSON);

    //Post upload endpoint
    const upload = await axios.post("/api/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });


    // Collect fileUrl and metadataUrl from Fleek
    const { fileUrl, metadataUrl } = upload.data;

    // Construct mediaData object
    const awareData = constructAwareData(
      fileUrl,
      metadataUrl,
      contentHash,
      metadataHash
    );

    // console.log("awareData", JSON.stringify(awareData));
    // console.log("useraddress", useraddress, amount);
        
    // const tx = await AwareToken.mint(awareData, useraddress, amount );
    // await tx.wait(1); // Wait 1 confirmation and throw user to next screen
    
  };


  // On load events
  // useEffect(setupWeb3Modal, []);

  // return {
  //   address,
  //   mintAwareToken,    
  //   getMetaDataStr,
  //   authenticate,    
  //   getuserAddress,    
  // };
}

// // Create unstate-next container
// const web3 = createContainer(useWeb3);
// export default web3;
