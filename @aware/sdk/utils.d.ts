/// <reference types="node" />
import { AwareData } from './types';
import { BytesLike } from 'ethers';
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
export declare function constructAwareData(tokenURI: string, metadataURI: string, contentHash: BytesLike, metadataHash: BytesLike): AwareData;
/**
 * Validates if the input is exactly 32 bytes
 * Expects a hex string with a 0x prefix or a Bytes type
 *
 * @param value
 */
export declare function validateBytes32(value: BytesLike): void;
/**
 * Validates the URI is prefixed with `https://`
 *
 * @param uri
 */
export declare function validateURI(uri: string): void;
/**
 * Validates and returns the checksummed address
 *
 * @param address
 */
export declare function validateAndParseAddress(address: string): string;
/**
 * Returns the proper network name for the specified chainId
 *
 * @param chainId
 */
export declare function chainIdToNetworkName(chainId: number): string;
/********************
 * Hashing Utilities
 ********************
 */
/**
 * Generates the sha256 hash from a buffer and returns the hash hex-encoded
 *
 * @param buffer
 */
export declare function sha256FromBuffer(buffer: Buffer): string;
/**
 * Generates a sha256 hash from a 0x prefixed hex string and returns the hash hex-encoded.
 * Throws an error if `data` is not a hex string.
 *
 * @param data
 */
export declare function sha256FromHexString(data: string): string;
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
export declare function sha256FromFile(pathToFile: string, chunkSize: number): Promise<string>;
/**
 * Removes the hex prefix of the passed string if it exists
 *
 * @param hex
 */
export declare function stripHexPrefix(hex: string): string;
/**
 * Returns the `verified` status of a uri.
 * A uri is only considered `verified` if its content hashes to its expected hash
 *
 * @param uri
 * @param expectedHash
 * @param timeout
 */
export declare function isURIHashVerified(uri: string, expectedHash: BytesLike, timeout?: number): Promise<boolean>;
/**
 * Returns the `verified` status of some AwareData.
 * AwareData is only considered `verified` if the content of its URIs hash to their respective hash
 *
 * @param awareData
 * @param timeout
 */
export declare function isAwareDataVerified(awareData: AwareData, timeout?: number): Promise<boolean>;
