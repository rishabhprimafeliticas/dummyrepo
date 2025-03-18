import { BigNumber, BigNumberish } from '@ethersproject/bignumber';
import { BytesLike } from '@ethersproject/bytes';
/**
 * Internal type to represent a Decimal Value
 */
export declare type DecimalValue = {
    value: BigNumber;
};
/**
 * Aware Token Protocol AwareData
 */
export declare type AwareData = {
    tokenURI: string;
    metadataURI: string;
    contentHash: BytesLike;
    metadataHash: BytesLike;
};
/**
 * EIP712 Signature
 */
export declare type EIP712Signature = {
    deadline: BigNumberish;
    v: number;
    r: BytesLike;
    s: BytesLike;
};
/**
 * EIP712 Domain
 */
export declare type EIP712Domain = {
    name: string;
    version: string;
    chainId: number;
    verifyingContract: string;
};
