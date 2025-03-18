import { AwareData } from './types';
import { BigNumber, BigNumberish } from '@ethersproject/bignumber';
import { ContractTransaction } from '@ethersproject/contracts';
import { Provider } from '@ethersproject/providers';
import { Signer } from '@ethersproject/abstract-signer';
import { AwareToken } from './typechain/contracts';
import { BytesLike } from 'ethers';
export declare class awaretoken {
    chainId: number;
    awareTokenAddress: string;
    signerOrProvider: Signer | Provider;
    awaretoken: AwareToken;
    readOnly: boolean;
    constructor(signerOrProvider: Signer | Provider, chainId: number, awareTokenAddress?: string);
    /*********************
     * Aware View Methods
     *********************
     */
    /**
     * Fetches the content hash for the specified media on the Aware Token Contract
     * @param tokenId
     */
    fetchContentHash(tokenId: BigNumberish): Promise<string>;
    /**
     * Fetches the metadata hash for the specified Aware Token on an instance of the Aware NFT Contract
     * @param tokenId
     */
    fetchMetadataHash(tokenId: BigNumberish): Promise<string>;
    /**
     * Fetches the content uri for the specified token on an instance of the Aware Token Contract
     * @param tokenId
     */
    fetchContentURI(tokenId: BigNumberish): Promise<string>;
    /**
     * Fetches the metadata uri for the specified token on an instance of the Aware Token Contract
     * @param tokenId
     */
    fetchMetadataURI(tokenId: BigNumberish): Promise<string>;
    /**
     * Fetches the creator for the specified media on an instance of the Aware token Contract
     * @param tokenId
     */
    fetchCreator(tokenId: BigNumberish): Promise<string>;
    /*********************
     * Aware Token Write Methods
     *********************
     */
    /**
     * Updates the content uri for the specified token on an instance of the Aware token Contract
     * @param tokenId
     * @param tokenURI
     */
    updateContentURI(tokenId: BigNumberish, tokenURI: string): Promise<ContractTransaction>;
    /**
     * Updates the metadata uri for the specified token on an instance of the Aware Token Contract
     * @param tokenId
     * @param metadataURI
     */
    updateMetadataURI(tokenId: BigNumberish, metadataURI: string): Promise<ContractTransaction>;
    /**
     * Mints a new piece of aware token on an instance of the Aware Token Contract
     * @param awareData
     * @param to
     * @param amount
     */
    mint(awareData: AwareData, to: string, amount: BigNumberish): Promise<ContractTransaction>;
    /**
     * Burns the specified token on an instance of the Aware Token Contract
     * @param tokenId
     */
    burn(from: string, tokenId: BigNumberish, amount: BigNumberish): Promise<ContractTransaction>;
    /***********************
     * ERC-1155 View Methods
     ***********************
     */
    /**
     * Fetches the total balance of aware token owned by the specified owner on an instance of the Aware Token Contract
     * @param owner
     * @param tokenId
     */
    fetchBalanceOf(owner: string, tokenId: BigNumberish): Promise<BigNumber>;
    /**
     * Fetches the owner of the specified aware token on an instance of the Aware Token Contract
     * @param tokenId
     */
    fetchOwnerOf(tokenId: BigNumberish): Promise<string>;
    /**
     * Fetches if the specified operator is approved for all aware Token owned by the specified owner on an instance of the aware Token Contract
     * @param owner
     * @param operator
     */
    fetchIsApprovedForAll(owner: string, operator: string): Promise<boolean>;
    /***********************
     * ERC-1155 Write Methods
     ***********************
    */
    /**
     * Grants approval for all media owner by msg.sender on an instance of the Pebble Media Contract
     * @param operator
     * @param approved
     */
    setApprovalForAll(operator: string, approved: boolean): Promise<ContractTransaction>;
    /**
     * Transfers the specified token to the specified to address on an instance of the Aware Token Contract
     * @param from
     * @param to
     * @param tokenId
     */
    safeTransferFrom(from: string, to: string, tokenId: BigNumberish, amount: BigNumberish, data: BytesLike): Promise<ContractTransaction>;
    /**
     * Transfers the specified token to the specified to address on an instance of the Aware Token Contract
     * @param from
     * @param to
     * @param tokenId
     */
    safeBatchTransferFrom(from: string, to: string, tokenId: BigNumberish[], amount: BigNumberish[], data: BytesLike): Promise<ContractTransaction>;
    /****************
     * Miscellaneous
     * **************
    */
    /**
     * Checks to see if a piece of token has verified uris that hash to their immutable hashes
     *
     * @param tokenId
     * @param timeout
    */
    isVerifiedMedia(tokenId: BigNumberish, timeout?: number): Promise<boolean>;
    /******************
     * Private Methods
     ******************
    */
    /**
     * Throws an error if called on a readOnly == true instance of Pebble Sdk
     * @private
     */
    private ensureNotReadOnly;
}
