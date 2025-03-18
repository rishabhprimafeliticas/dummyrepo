"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.awaretoken = void 0;
const tslib_1 = require("tslib");
const abstract_signer_1 = require("@ethersproject/abstract-signer");
const contracts_1 = require("./typechain/factories/contracts");
const addresses_1 = require("./addresses");
const utils_1 = require("./utils");
const tiny_invariant_1 = tslib_1.__importDefault(require("tiny-invariant"));
class awaretoken {
    constructor(signerOrProvider, chainId, awareTokenAddress) {
        if (!awareTokenAddress) {
            tiny_invariant_1.default(false, 'Aware Token Constructor: awareTokenAddress must be non-null');
        }
        if (abstract_signer_1.Signer.isSigner(signerOrProvider)) {
            this.readOnly = false;
        }
        else {
            this.readOnly = true;
        }
        this.signerOrProvider = signerOrProvider;
        this.chainId = chainId;
        if (awareTokenAddress) {
            const parsedAwareTokenAddress = utils_1.validateAndParseAddress(awareTokenAddress);
            this.awareTokenAddress = parsedAwareTokenAddress;
        }
        else {
            const network = utils_1.chainIdToNetworkName(chainId);
            this.awareTokenAddress = addresses_1.addresses[network].awareToken;
        }
        this.awaretoken = contracts_1.AwareToken__factory.connect(this.awareTokenAddress, signerOrProvider);
    }
    /*********************
     * Aware View Methods
     *********************
     */
    /**
     * Fetches the content hash for the specified media on the Aware Token Contract
     * @param tokenId
     */
    async fetchContentHash(tokenId) {
        return this.awaretoken.tokenContentHashes(tokenId);
    }
    /**
     * Fetches the metadata hash for the specified Aware Token on an instance of the Aware NFT Contract
     * @param tokenId
     */
    async fetchMetadataHash(tokenId) {
        return this.awaretoken.tokenMetadataHashes(tokenId);
    }
    /**
     * Fetches the content uri for the specified token on an instance of the Aware Token Contract
     * @param tokenId
     */
    async fetchContentURI(tokenId) {
        return this.awaretoken.uri(tokenId);
    }
    /**
     * Fetches the metadata uri for the specified token on an instance of the Aware Token Contract
     * @param tokenId
     */
    async fetchMetadataURI(tokenId) {
        return this.awaretoken.tokenMetadataURI(tokenId);
    }
    /**
     * Fetches the creator for the specified media on an instance of the Aware token Contract
     * @param tokenId
     */
    async fetchCreator(tokenId) {
        return this.awaretoken.tokenCreators(tokenId);
    }
    /*********************
     * Aware Token Write Methods
     *********************
     */
    /**
     * Updates the content uri for the specified token on an instance of the Aware token Contract
     * @param tokenId
     * @param tokenURI
     */
    async updateContentURI(tokenId, tokenURI) {
        try {
            this.ensureNotReadOnly();
            utils_1.validateURI(tokenURI);
        }
        catch (err) {
            return Promise.reject(err.message);
        }
        return this.awaretoken.updateTokenURI(tokenId, tokenURI);
    }
    /**
     * Updates the metadata uri for the specified token on an instance of the Aware Token Contract
     * @param tokenId
     * @param metadataURI
     */
    async updateMetadataURI(tokenId, metadataURI) {
        try {
            this.ensureNotReadOnly();
            utils_1.validateURI(metadataURI);
        }
        catch (err) {
            return Promise.reject(err.message);
        }
        return this.awaretoken.updateTokenMetadataURI(tokenId, metadataURI);
    }
    /**
     * Mints a new piece of aware token on an instance of the Aware Token Contract
     * @param awareData
     * @param to
     * @param amount
     */
    async mint(awareData, to, amount) {
        try {
            this.ensureNotReadOnly();
            utils_1.validateURI(awareData.metadataURI);
            utils_1.validateURI(awareData.tokenURI);
        }
        catch (err) {
            return Promise.reject(err.message);
        }
        // const gasEstimate = await this.awaretoken.estimateGas.mint(awareData, to, amount);
        // const paddedEstimate = gasEstimate.mul(110).div(100);
        // return this.awaretoken.mint(awareData, to, amount, { gasLimit: paddedEstimate.toString() });
        return this.awaretoken.mint(awareData, to, amount);
    }
    /**
     * Burns the specified token on an instance of the Aware Token Contract
     * @param tokenId
     */
    async burn(from, tokenId, amount) {
        try {
            this.ensureNotReadOnly();
        }
        catch (err) {
            return Promise.reject(err.message);
        }
        return this.awaretoken.burn(from, tokenId, amount);
    }
    /***********************
     * ERC-1155 View Methods
     ***********************
     */
    /**
     * Fetches the total balance of aware token owned by the specified owner on an instance of the Aware Token Contract
     * @param owner
     * @param tokenId
     */
    async fetchBalanceOf(owner, tokenId) {
        return this.awaretoken.balanceOf(owner, tokenId);
    }
    /**
     * Fetches the owner of the specified aware token on an instance of the Aware Token Contract
     * @param tokenId
     */
    async fetchOwnerOf(tokenId) {
        return this.awaretoken.ownerOf(tokenId);
    }
    /**
     * Fetches if the specified operator is approved for all aware Token owned by the specified owner on an instance of the aware Token Contract
     * @param owner
     * @param operator
     */
    async fetchIsApprovedForAll(owner, operator) {
        return this.awaretoken.isApprovedForAll(owner, operator);
    }
    /***********************
     * ERC-1155 Write Methods
     ***********************
    */
    /**
     * Grants approval for all media owner by msg.sender on an instance of the Pebble Media Contract
     * @param operator
     * @param approved
     */
    async setApprovalForAll(operator, approved) {
        try {
            this.ensureNotReadOnly();
        }
        catch (err) {
            return Promise.reject(err.message);
        }
        return this.awaretoken.setApprovalForAll(operator, approved);
    }
    /**
     * Transfers the specified token to the specified to address on an instance of the Aware Token Contract
     * @param from
     * @param to
     * @param tokenId
     */
    async safeTransferFrom(from, to, tokenId, amount, data) {
        try {
            this.ensureNotReadOnly();
        }
        catch (err) {
            return Promise.reject(err.message);
        }
        return this.awaretoken.safeTransferFrom(from, to, tokenId, amount, data);
    }
    /**
     * Transfers the specified token to the specified to address on an instance of the Aware Token Contract
     * @param from
     * @param to
     * @param tokenId
     */
    async safeBatchTransferFrom(from, to, tokenId, amount, data) {
        try {
            this.ensureNotReadOnly();
        }
        catch (err) {
            return Promise.reject(err.message);
        }
        return this.awaretoken.safeBatchTransferFrom(from, to, tokenId, amount, data);
    }
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
    async isVerifiedMedia(tokenId, timeout = 10) {
        try {
            const [tokenURI, metadataURI, contentHash, metadataHash] = await Promise.all([
                this.fetchContentURI(tokenId),
                this.fetchMetadataURI(tokenId),
                this.fetchContentHash(tokenId),
                this.fetchMetadataHash(tokenId),
            ]);
            const awareData = utils_1.constructAwareData(tokenURI, metadataURI, contentHash, metadataHash);
            return utils_1.isAwareDataVerified(awareData, timeout);
        }
        catch (err) {
            return Promise.reject(err.message);
        }
    }
    /******************
     * Private Methods
     ******************
    */
    /**
     * Throws an error if called on a readOnly == true instance of Pebble Sdk
     * @private
     */
    ensureNotReadOnly() {
        if (this.readOnly) {
            throw new Error('ensureNotReadOnly: readOnly Pebble instance cannot call contract methods that require a signer.');
        }
    }
}
exports.awaretoken = awaretoken;
//# sourceMappingURL=awaretoken.js.map