import type { BaseContract, BigNumber, BigNumberish, BytesLike, CallOverrides, ContractTransaction, Overrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result, EventFragment } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent, PromiseOrValue } from "../common";
export declare namespace IAwareToken {
    type AwareDataStruct = {
        tokenURI: PromiseOrValue<string>;
        metadataURI: PromiseOrValue<string>;
        contentHash: PromiseOrValue<BytesLike>;
        metadataHash: PromiseOrValue<BytesLike>;
    };
    type AwareDataStructOutput = [string, string, string, string] & {
        tokenURI: string;
        metadataURI: string;
        contentHash: string;
        metadataHash: string;
    };
}
export interface AwareTokenInterface extends utils.Interface {
    functions: {
        "balanceOf(address,uint256)": FunctionFragment;
        "balanceOfBatch(address[],uint256[])": FunctionFragment;
        "burn(address,uint256,uint256)": FunctionFragment;
        "burnBatch(address,uint256[],uint256[])": FunctionFragment;
        "isApprovedForAll(address,address)": FunctionFragment;
        "mint((string,string,bytes32,bytes32),address,uint256)": FunctionFragment;
        "ownerOf(uint256)": FunctionFragment;
        "previousTokenOwners(uint256)": FunctionFragment;
        "safeBatchTransferFrom(address,address,uint256[],uint256[],bytes)": FunctionFragment;
        "safeTransferFrom(address,address,uint256,uint256,bytes)": FunctionFragment;
        "setApprovalForAll(address,bool)": FunctionFragment;
        "setTokenType(uint256,string)": FunctionFragment;
        "supportsInterface(bytes4)": FunctionFragment;
        "tokenContentHashes(uint256)": FunctionFragment;
        "tokenCreators(uint256)": FunctionFragment;
        "tokenMetadataHashes(uint256)": FunctionFragment;
        "tokenMetadataURI(uint256)": FunctionFragment;
        "tokentype(uint256)": FunctionFragment;
        "updateTokenMetadataURI(uint256,string)": FunctionFragment;
        "updateTokenURI(uint256,string)": FunctionFragment;
        "uri(uint256)": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "balanceOf" | "balanceOfBatch" | "burn" | "burnBatch" | "isApprovedForAll" | "mint" | "ownerOf" | "previousTokenOwners" | "safeBatchTransferFrom" | "safeTransferFrom" | "setApprovalForAll" | "setTokenType" | "supportsInterface" | "tokenContentHashes" | "tokenCreators" | "tokenMetadataHashes" | "tokenMetadataURI" | "tokentype" | "updateTokenMetadataURI" | "updateTokenURI" | "uri"): FunctionFragment;
    encodeFunctionData(functionFragment: "balanceOf", values: [PromiseOrValue<string>, PromiseOrValue<BigNumberish>]): string;
    encodeFunctionData(functionFragment: "balanceOfBatch", values: [PromiseOrValue<string>[], PromiseOrValue<BigNumberish>[]]): string;
    encodeFunctionData(functionFragment: "burn", values: [
        PromiseOrValue<string>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>
    ]): string;
    encodeFunctionData(functionFragment: "burnBatch", values: [
        PromiseOrValue<string>,
        PromiseOrValue<BigNumberish>[],
        PromiseOrValue<BigNumberish>[]
    ]): string;
    encodeFunctionData(functionFragment: "isApprovedForAll", values: [PromiseOrValue<string>, PromiseOrValue<string>]): string;
    encodeFunctionData(functionFragment: "mint", values: [
        IAwareToken.AwareDataStruct,
        PromiseOrValue<string>,
        PromiseOrValue<BigNumberish>
    ]): string;
    encodeFunctionData(functionFragment: "ownerOf", values: [PromiseOrValue<BigNumberish>]): string;
    encodeFunctionData(functionFragment: "previousTokenOwners", values: [PromiseOrValue<BigNumberish>]): string;
    encodeFunctionData(functionFragment: "safeBatchTransferFrom", values: [
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<BigNumberish>[],
        PromiseOrValue<BigNumberish>[],
        PromiseOrValue<BytesLike>
    ]): string;
    encodeFunctionData(functionFragment: "safeTransferFrom", values: [
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BytesLike>
    ]): string;
    encodeFunctionData(functionFragment: "setApprovalForAll", values: [PromiseOrValue<string>, PromiseOrValue<boolean>]): string;
    encodeFunctionData(functionFragment: "setTokenType", values: [PromiseOrValue<BigNumberish>, PromiseOrValue<string>]): string;
    encodeFunctionData(functionFragment: "supportsInterface", values: [PromiseOrValue<BytesLike>]): string;
    encodeFunctionData(functionFragment: "tokenContentHashes", values: [PromiseOrValue<BigNumberish>]): string;
    encodeFunctionData(functionFragment: "tokenCreators", values: [PromiseOrValue<BigNumberish>]): string;
    encodeFunctionData(functionFragment: "tokenMetadataHashes", values: [PromiseOrValue<BigNumberish>]): string;
    encodeFunctionData(functionFragment: "tokenMetadataURI", values: [PromiseOrValue<BigNumberish>]): string;
    encodeFunctionData(functionFragment: "tokentype", values: [PromiseOrValue<BigNumberish>]): string;
    encodeFunctionData(functionFragment: "updateTokenMetadataURI", values: [PromiseOrValue<BigNumberish>, PromiseOrValue<string>]): string;
    encodeFunctionData(functionFragment: "updateTokenURI", values: [PromiseOrValue<BigNumberish>, PromiseOrValue<string>]): string;
    encodeFunctionData(functionFragment: "uri", values: [PromiseOrValue<BigNumberish>]): string;
    decodeFunctionResult(functionFragment: "balanceOf", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "balanceOfBatch", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "burn", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "burnBatch", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "isApprovedForAll", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "mint", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "ownerOf", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "previousTokenOwners", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "safeBatchTransferFrom", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "safeTransferFrom", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "setApprovalForAll", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "setTokenType", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "supportsInterface", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "tokenContentHashes", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "tokenCreators", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "tokenMetadataHashes", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "tokenMetadataURI", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "tokentype", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "updateTokenMetadataURI", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "updateTokenURI", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "uri", data: BytesLike): Result;
    events: {
        "ApprovalForAll(address,address,bool)": EventFragment;
        "TokenMetadataURIUpdated(uint256,address,string)": EventFragment;
        "TokenURIUpdated(uint256,address,string)": EventFragment;
        "TransferBatch(address,address,address,uint256[],uint256[])": EventFragment;
        "TransferSingle(address,address,address,uint256,uint256)": EventFragment;
        "URI(string,uint256)": EventFragment;
    };
    getEvent(nameOrSignatureOrTopic: "ApprovalForAll"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "TokenMetadataURIUpdated"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "TokenURIUpdated"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "TransferBatch"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "TransferSingle"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "URI"): EventFragment;
}
export interface ApprovalForAllEventObject {
    account: string;
    operator: string;
    approved: boolean;
}
export declare type ApprovalForAllEvent = TypedEvent<[
    string,
    string,
    boolean
], ApprovalForAllEventObject>;
export declare type ApprovalForAllEventFilter = TypedEventFilter<ApprovalForAllEvent>;
export interface TokenMetadataURIUpdatedEventObject {
    _tokenId: BigNumber;
    owner: string;
    _uri: string;
}
export declare type TokenMetadataURIUpdatedEvent = TypedEvent<[
    BigNumber,
    string,
    string
], TokenMetadataURIUpdatedEventObject>;
export declare type TokenMetadataURIUpdatedEventFilter = TypedEventFilter<TokenMetadataURIUpdatedEvent>;
export interface TokenURIUpdatedEventObject {
    _tokenId: BigNumber;
    owner: string;
    _uri: string;
}
export declare type TokenURIUpdatedEvent = TypedEvent<[
    BigNumber,
    string,
    string
], TokenURIUpdatedEventObject>;
export declare type TokenURIUpdatedEventFilter = TypedEventFilter<TokenURIUpdatedEvent>;
export interface TransferBatchEventObject {
    operator: string;
    from: string;
    to: string;
    ids: BigNumber[];
    values: BigNumber[];
}
export declare type TransferBatchEvent = TypedEvent<[
    string,
    string,
    string,
    BigNumber[],
    BigNumber[]
], TransferBatchEventObject>;
export declare type TransferBatchEventFilter = TypedEventFilter<TransferBatchEvent>;
export interface TransferSingleEventObject {
    operator: string;
    from: string;
    to: string;
    id: BigNumber;
    value: BigNumber;
}
export declare type TransferSingleEvent = TypedEvent<[
    string,
    string,
    string,
    BigNumber,
    BigNumber
], TransferSingleEventObject>;
export declare type TransferSingleEventFilter = TypedEventFilter<TransferSingleEvent>;
export interface URIEventObject {
    value: string;
    id: BigNumber;
}
export declare type URIEvent = TypedEvent<[string, BigNumber], URIEventObject>;
export declare type URIEventFilter = TypedEventFilter<URIEvent>;
export interface AwareToken extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: AwareTokenInterface;
    queryFilter<TEvent extends TypedEvent>(event: TypedEventFilter<TEvent>, fromBlockOrBlockhash?: string | number | undefined, toBlock?: string | number | undefined): Promise<Array<TEvent>>;
    listeners<TEvent extends TypedEvent>(eventFilter?: TypedEventFilter<TEvent>): Array<TypedListener<TEvent>>;
    listeners(eventName?: string): Array<Listener>;
    removeAllListeners<TEvent extends TypedEvent>(eventFilter: TypedEventFilter<TEvent>): this;
    removeAllListeners(eventName?: string): this;
    off: OnEvent<this>;
    on: OnEvent<this>;
    once: OnEvent<this>;
    removeListener: OnEvent<this>;
    functions: {
        balanceOf(account: PromiseOrValue<string>, id: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<[BigNumber]>;
        balanceOfBatch(accounts: PromiseOrValue<string>[], ids: PromiseOrValue<BigNumberish>[], overrides?: CallOverrides): Promise<[BigNumber[]]>;
        burn(from: PromiseOrValue<string>, tokenId: PromiseOrValue<BigNumberish>, amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        burnBatch(account: PromiseOrValue<string>, ids: PromiseOrValue<BigNumberish>[], values: PromiseOrValue<BigNumberish>[], overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        isApprovedForAll(account: PromiseOrValue<string>, operator: PromiseOrValue<string>, overrides?: CallOverrides): Promise<[boolean]>;
        mint(data: IAwareToken.AwareDataStruct, recipient: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        ownerOf(tokenId: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<[string]>;
        previousTokenOwners(arg0: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<[string]>;
        safeBatchTransferFrom(from: PromiseOrValue<string>, to: PromiseOrValue<string>, ids: PromiseOrValue<BigNumberish>[], amounts: PromiseOrValue<BigNumberish>[], data: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        safeTransferFrom(from: PromiseOrValue<string>, to: PromiseOrValue<string>, id: PromiseOrValue<BigNumberish>, amount: PromiseOrValue<BigNumberish>, data: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        setApprovalForAll(operator: PromiseOrValue<string>, approved: PromiseOrValue<boolean>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        setTokenType(_tokenId: PromiseOrValue<BigNumberish>, _type: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        supportsInterface(interfaceId: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<[boolean]>;
        tokenContentHashes(arg0: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<[string]>;
        tokenCreators(arg0: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<[string]>;
        tokenMetadataHashes(arg0: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<[string]>;
        tokenMetadataURI(tokenId: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<[string]>;
        tokentype(tokenId: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<[string]>;
        updateTokenMetadataURI(tokenId: PromiseOrValue<BigNumberish>, metadataURI: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        updateTokenURI(tokenId: PromiseOrValue<BigNumberish>, tokenURI: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        uri(tokenId: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<[string]>;
    };
    balanceOf(account: PromiseOrValue<string>, id: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<BigNumber>;
    balanceOfBatch(accounts: PromiseOrValue<string>[], ids: PromiseOrValue<BigNumberish>[], overrides?: CallOverrides): Promise<BigNumber[]>;
    burn(from: PromiseOrValue<string>, tokenId: PromiseOrValue<BigNumberish>, amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    burnBatch(account: PromiseOrValue<string>, ids: PromiseOrValue<BigNumberish>[], values: PromiseOrValue<BigNumberish>[], overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    isApprovedForAll(account: PromiseOrValue<string>, operator: PromiseOrValue<string>, overrides?: CallOverrides): Promise<boolean>;
    mint(data: IAwareToken.AwareDataStruct, recipient: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    ownerOf(tokenId: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<string>;
    previousTokenOwners(arg0: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<string>;
    safeBatchTransferFrom(from: PromiseOrValue<string>, to: PromiseOrValue<string>, ids: PromiseOrValue<BigNumberish>[], amounts: PromiseOrValue<BigNumberish>[], data: PromiseOrValue<BytesLike>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    safeTransferFrom(from: PromiseOrValue<string>, to: PromiseOrValue<string>, id: PromiseOrValue<BigNumberish>, amount: PromiseOrValue<BigNumberish>, data: PromiseOrValue<BytesLike>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    setApprovalForAll(operator: PromiseOrValue<string>, approved: PromiseOrValue<boolean>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    setTokenType(_tokenId: PromiseOrValue<BigNumberish>, _type: PromiseOrValue<string>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    supportsInterface(interfaceId: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<boolean>;
    tokenContentHashes(arg0: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<string>;
    tokenCreators(arg0: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<string>;
    tokenMetadataHashes(arg0: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<string>;
    tokenMetadataURI(tokenId: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<string>;
    tokentype(tokenId: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<string>;
    updateTokenMetadataURI(tokenId: PromiseOrValue<BigNumberish>, metadataURI: PromiseOrValue<string>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    updateTokenURI(tokenId: PromiseOrValue<BigNumberish>, tokenURI: PromiseOrValue<string>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    uri(tokenId: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<string>;
    callStatic: {
        balanceOf(account: PromiseOrValue<string>, id: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<BigNumber>;
        balanceOfBatch(accounts: PromiseOrValue<string>[], ids: PromiseOrValue<BigNumberish>[], overrides?: CallOverrides): Promise<BigNumber[]>;
        burn(from: PromiseOrValue<string>, tokenId: PromiseOrValue<BigNumberish>, amount: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<void>;
        burnBatch(account: PromiseOrValue<string>, ids: PromiseOrValue<BigNumberish>[], values: PromiseOrValue<BigNumberish>[], overrides?: CallOverrides): Promise<void>;
        isApprovedForAll(account: PromiseOrValue<string>, operator: PromiseOrValue<string>, overrides?: CallOverrides): Promise<boolean>;
        mint(data: IAwareToken.AwareDataStruct, recipient: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<void>;
        ownerOf(tokenId: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<string>;
        previousTokenOwners(arg0: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<string>;
        safeBatchTransferFrom(from: PromiseOrValue<string>, to: PromiseOrValue<string>, ids: PromiseOrValue<BigNumberish>[], amounts: PromiseOrValue<BigNumberish>[], data: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<void>;
        safeTransferFrom(from: PromiseOrValue<string>, to: PromiseOrValue<string>, id: PromiseOrValue<BigNumberish>, amount: PromiseOrValue<BigNumberish>, data: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<void>;
        setApprovalForAll(operator: PromiseOrValue<string>, approved: PromiseOrValue<boolean>, overrides?: CallOverrides): Promise<void>;
        setTokenType(_tokenId: PromiseOrValue<BigNumberish>, _type: PromiseOrValue<string>, overrides?: CallOverrides): Promise<void>;
        supportsInterface(interfaceId: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<boolean>;
        tokenContentHashes(arg0: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<string>;
        tokenCreators(arg0: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<string>;
        tokenMetadataHashes(arg0: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<string>;
        tokenMetadataURI(tokenId: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<string>;
        tokentype(tokenId: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<string>;
        updateTokenMetadataURI(tokenId: PromiseOrValue<BigNumberish>, metadataURI: PromiseOrValue<string>, overrides?: CallOverrides): Promise<void>;
        updateTokenURI(tokenId: PromiseOrValue<BigNumberish>, tokenURI: PromiseOrValue<string>, overrides?: CallOverrides): Promise<void>;
        uri(tokenId: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<string>;
    };
    filters: {
        "ApprovalForAll(address,address,bool)"(account?: PromiseOrValue<string> | null, operator?: PromiseOrValue<string> | null, approved?: null): ApprovalForAllEventFilter;
        ApprovalForAll(account?: PromiseOrValue<string> | null, operator?: PromiseOrValue<string> | null, approved?: null): ApprovalForAllEventFilter;
        "TokenMetadataURIUpdated(uint256,address,string)"(_tokenId?: PromiseOrValue<BigNumberish> | null, owner?: null, _uri?: null): TokenMetadataURIUpdatedEventFilter;
        TokenMetadataURIUpdated(_tokenId?: PromiseOrValue<BigNumberish> | null, owner?: null, _uri?: null): TokenMetadataURIUpdatedEventFilter;
        "TokenURIUpdated(uint256,address,string)"(_tokenId?: PromiseOrValue<BigNumberish> | null, owner?: null, _uri?: null): TokenURIUpdatedEventFilter;
        TokenURIUpdated(_tokenId?: PromiseOrValue<BigNumberish> | null, owner?: null, _uri?: null): TokenURIUpdatedEventFilter;
        "TransferBatch(address,address,address,uint256[],uint256[])"(operator?: PromiseOrValue<string> | null, from?: PromiseOrValue<string> | null, to?: PromiseOrValue<string> | null, ids?: null, values?: null): TransferBatchEventFilter;
        TransferBatch(operator?: PromiseOrValue<string> | null, from?: PromiseOrValue<string> | null, to?: PromiseOrValue<string> | null, ids?: null, values?: null): TransferBatchEventFilter;
        "TransferSingle(address,address,address,uint256,uint256)"(operator?: PromiseOrValue<string> | null, from?: PromiseOrValue<string> | null, to?: PromiseOrValue<string> | null, id?: null, value?: null): TransferSingleEventFilter;
        TransferSingle(operator?: PromiseOrValue<string> | null, from?: PromiseOrValue<string> | null, to?: PromiseOrValue<string> | null, id?: null, value?: null): TransferSingleEventFilter;
        "URI(string,uint256)"(value?: null, id?: PromiseOrValue<BigNumberish> | null): URIEventFilter;
        URI(value?: null, id?: PromiseOrValue<BigNumberish> | null): URIEventFilter;
    };
    estimateGas: {
        balanceOf(account: PromiseOrValue<string>, id: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<BigNumber>;
        balanceOfBatch(accounts: PromiseOrValue<string>[], ids: PromiseOrValue<BigNumberish>[], overrides?: CallOverrides): Promise<BigNumber>;
        burn(from: PromiseOrValue<string>, tokenId: PromiseOrValue<BigNumberish>, amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        burnBatch(account: PromiseOrValue<string>, ids: PromiseOrValue<BigNumberish>[], values: PromiseOrValue<BigNumberish>[], overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        isApprovedForAll(account: PromiseOrValue<string>, operator: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
        mint(data: IAwareToken.AwareDataStruct, recipient: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        ownerOf(tokenId: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<BigNumber>;
        previousTokenOwners(arg0: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<BigNumber>;
        safeBatchTransferFrom(from: PromiseOrValue<string>, to: PromiseOrValue<string>, ids: PromiseOrValue<BigNumberish>[], amounts: PromiseOrValue<BigNumberish>[], data: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        safeTransferFrom(from: PromiseOrValue<string>, to: PromiseOrValue<string>, id: PromiseOrValue<BigNumberish>, amount: PromiseOrValue<BigNumberish>, data: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        setApprovalForAll(operator: PromiseOrValue<string>, approved: PromiseOrValue<boolean>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        setTokenType(_tokenId: PromiseOrValue<BigNumberish>, _type: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        supportsInterface(interfaceId: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<BigNumber>;
        tokenContentHashes(arg0: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<BigNumber>;
        tokenCreators(arg0: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<BigNumber>;
        tokenMetadataHashes(arg0: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<BigNumber>;
        tokenMetadataURI(tokenId: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<BigNumber>;
        tokentype(tokenId: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<BigNumber>;
        updateTokenMetadataURI(tokenId: PromiseOrValue<BigNumberish>, metadataURI: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        updateTokenURI(tokenId: PromiseOrValue<BigNumberish>, tokenURI: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        uri(tokenId: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<BigNumber>;
    };
    populateTransaction: {
        balanceOf(account: PromiseOrValue<string>, id: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        balanceOfBatch(accounts: PromiseOrValue<string>[], ids: PromiseOrValue<BigNumberish>[], overrides?: CallOverrides): Promise<PopulatedTransaction>;
        burn(from: PromiseOrValue<string>, tokenId: PromiseOrValue<BigNumberish>, amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        burnBatch(account: PromiseOrValue<string>, ids: PromiseOrValue<BigNumberish>[], values: PromiseOrValue<BigNumberish>[], overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        isApprovedForAll(account: PromiseOrValue<string>, operator: PromiseOrValue<string>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        mint(data: IAwareToken.AwareDataStruct, recipient: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        ownerOf(tokenId: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        previousTokenOwners(arg0: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        safeBatchTransferFrom(from: PromiseOrValue<string>, to: PromiseOrValue<string>, ids: PromiseOrValue<BigNumberish>[], amounts: PromiseOrValue<BigNumberish>[], data: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        safeTransferFrom(from: PromiseOrValue<string>, to: PromiseOrValue<string>, id: PromiseOrValue<BigNumberish>, amount: PromiseOrValue<BigNumberish>, data: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        setApprovalForAll(operator: PromiseOrValue<string>, approved: PromiseOrValue<boolean>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        setTokenType(_tokenId: PromiseOrValue<BigNumberish>, _type: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        supportsInterface(interfaceId: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        tokenContentHashes(arg0: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        tokenCreators(arg0: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        tokenMetadataHashes(arg0: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        tokenMetadataURI(tokenId: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        tokentype(tokenId: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        updateTokenMetadataURI(tokenId: PromiseOrValue<BigNumberish>, metadataURI: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        updateTokenURI(tokenId: PromiseOrValue<BigNumberish>, tokenURI: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        uri(tokenId: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
    };
}
