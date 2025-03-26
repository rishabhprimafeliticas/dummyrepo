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


function useWeb3() {
 
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

    
    
  };


 
}


