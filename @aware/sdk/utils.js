"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAwareDataVerified = exports.isURIHashVerified = exports.stripHexPrefix = exports.sha256FromFile = exports.sha256FromHexString = exports.sha256FromBuffer = exports.chainIdToNetworkName = exports.validateAndParseAddress = exports.validateURI = exports.validateBytes32 = exports.constructAwareData = void 0;
const tslib_1 = require("tslib");
const address_1 = require("@ethersproject/address");
const tiny_warning_1 = tslib_1.__importDefault(require("tiny-warning"));
const tiny_invariant_1 = tslib_1.__importDefault(require("tiny-invariant"));
const sjcl_1 = tslib_1.__importDefault(require("sjcl"));
const bytes_1 = require("@ethersproject/bytes");
const axios_1 = tslib_1.__importDefault(require("axios"));
/********************
 * Type Constructors
 ********************
 */
/**
 * Constructs a MediaData type.
 *
 * @param tokenURI
 * @param metadataURI
 * @param contentHash
 * @param metadataHash
 */
function constructAwareData(tokenURI, metadataURI, contentHash, metadataHash) {
    // validate the hash to ensure it fits in bytes32
    validateBytes32(contentHash);
    validateBytes32(metadataHash);
    validateURI(tokenURI);
    validateURI(metadataURI);
    return {
        tokenURI: tokenURI,
        metadataURI: metadataURI,
        contentHash: contentHash,
        metadataHash: metadataHash,
    };
}
exports.constructAwareData = constructAwareData;
/**
 * Validates if the input is exactly 32 bytes
 * Expects a hex string with a 0x prefix or a Bytes type
 *
 * @param value
 */
function validateBytes32(value) {
    if (typeof value == 'string') {
        if (bytes_1.isHexString(value) && bytes_1.hexDataLength(value) == 32) {
            return;
        }
        tiny_invariant_1.default(false, `${value} is not a 0x prefixed 32 bytes hex string`);
    }
    else {
        if (bytes_1.hexDataLength(bytes_1.hexlify(value)) == 32) {
            return;
        }
        tiny_invariant_1.default(false, `value is not a length 32 byte array`);
    }
}
exports.validateBytes32 = validateBytes32;
/**
 * Validates the URI is prefixed with `https://`
 *
 * @param uri
 */
function validateURI(uri) {
    if (!uri.match(/^https:\/\/(.*)/)) {
        tiny_invariant_1.default(false, `${uri} must begin with \`https://\``);
    }
}
exports.validateURI = validateURI;
/**
 * Validates and returns the checksummed address
 *
 * @param address
 */
function validateAndParseAddress(address) {
    try {
        const checksummedAddress = address_1.getAddress(address);
        tiny_warning_1.default(address === checksummedAddress, `${address} is not checksummed.`);
        return checksummedAddress;
    }
    catch (error) {
        tiny_invariant_1.default(false, `${address} is not a valid address.`);
    }
}
exports.validateAndParseAddress = validateAndParseAddress;
/**
 * Returns the proper network name for the specified chainId
 *
 * @param chainId
 */
function chainIdToNetworkName(chainId) {
    switch (chainId) {
        case 4: {
            return 'rinkeby';
        }
        case 3: {
            return 'ropsten';
        }
        case 4690: {
            return 'iotextest';
        }
        case 1: {
            return 'mainnet';
        }
    }
    tiny_invariant_1.default(false, `chainId ${chainId} not officially supported by the Aware Token Protocol`);
}
exports.chainIdToNetworkName = chainIdToNetworkName;
/********************
 * Hashing Utilities
 ********************
 */
/**
 * Generates the sha256 hash from a buffer and returns the hash hex-encoded
 *
 * @param buffer
 */
function sha256FromBuffer(buffer) {
    const bitArray = sjcl_1.default.codec.hex.toBits(buffer.toString('hex'));
    const hashArray = sjcl_1.default.hash.sha256.hash(bitArray);
    return '0x'.concat(sjcl_1.default.codec.hex.fromBits(hashArray));
}
exports.sha256FromBuffer = sha256FromBuffer;
/**
 * Generates a sha256 hash from a 0x prefixed hex string and returns the hash hex-encoded.
 * Throws an error if `data` is not a hex string.
 *
 * @param data
 */
function sha256FromHexString(data) {
    if (!bytes_1.isHexString(data)) {
        throw new Error(`${data} is not valid 0x prefixed hex`);
    }
    const bitArray = sjcl_1.default.codec.hex.toBits(data);
    const hashArray = sjcl_1.default.hash.sha256.hash(bitArray);
    return '0x'.concat(sjcl_1.default.codec.hex.fromBits(hashArray));
}
exports.sha256FromHexString = sha256FromHexString;
/**
 * Generates a sha256 hash from a file and returns the hash hex-encoded
 *
 * This method is preferred for generating the hash for large files
 * because it leverages a read stream and only stores the specified chunk
 * size in memory.
 *
 * @param pathToFile
 * @param chunkSize (Bytes)
 */
function sha256FromFile(pathToFile, chunkSize) {
    if (typeof window !== 'undefined') {
        throw new Error('This method is not available in a browser context');
    }
    const fs = require('fs');
    const hash = new sjcl_1.default.hash.sha256();
    const readStream = fs.createReadStream(pathToFile, { highWaterMark: chunkSize });
    return new Promise((resolve, reject) => {
        readStream.on('data', (chunk) => {
            hash.update(sjcl_1.default.codec.hex.toBits(chunk.toString('hex')));
        });
        readStream.on('end', () => {
            resolve('0x'.concat(sjcl_1.default.codec.hex.fromBits(hash.finalize())));
        });
        readStream.on('error', (err) => {
            reject(err);
        });
    });
}
exports.sha256FromFile = sha256FromFile;
/**
 * Removes the hex prefix of the passed string if it exists
 *
 * @param hex
 */
function stripHexPrefix(hex) {
    return hex.slice(0, 2) == '0x' ? hex.slice(2) : hex;
}
exports.stripHexPrefix = stripHexPrefix;
/**
 * Returns the `verified` status of a uri.
 * A uri is only considered `verified` if its content hashes to its expected hash
 *
 * @param uri
 * @param expectedHash
 * @param timeout
 */
async function isURIHashVerified(uri, expectedHash, timeout = 10) {
    try {
        validateURI(uri);
        const resp = await axios_1.default.get(uri, {
            timeout: timeout,
            responseType: 'arraybuffer',
        });
        const uriHash = sha256FromBuffer(resp.data);
        const normalizedExpectedHash = bytes_1.hexlify(expectedHash);
        return uriHash == normalizedExpectedHash;
    }
    catch (err) {
        return Promise.reject(err.message);
    }
}
exports.isURIHashVerified = isURIHashVerified;
/**
 * Returns the `verified` status of some AwareData.
 * AwareData is only considered `verified` if the content of its URIs hash to their respective hash
 *
 * @param awareData
 * @param timeout
 */
async function isAwareDataVerified(awareData, timeout = 10) {
    const isTokenURIVerified = await isURIHashVerified(awareData.tokenURI, awareData.contentHash, timeout);
    const isMetadataURIVerified = await isURIHashVerified(awareData.metadataURI, awareData.metadataHash, timeout);
    return isTokenURIVerified && isMetadataURIVerified;
}
exports.isAwareDataVerified = isAwareDataVerified;
//# sourceMappingURL=utils.js.map