import type { BaseContract, BigNumber, BigNumberish, BytesLike, CallOverrides, ContractTransaction, Overrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result, EventFragment } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent, PromiseOrValue } from "../../common";
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
export interface IAwareTokenInterface extends utils.Interface {
    functions: {
        "mint((string,string,bytes32,bytes32),address,uint256)": FunctionFragment;
        "ownerOf(uint256)": FunctionFragment;
        "tokenMetadataURI(uint256)": FunctionFragment;
        "updateTokenMetadataURI(uint256,string)": FunctionFragment;
        "updateTokenURI(uint256,string)": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "mint" | "ownerOf" | "tokenMetadataURI" | "updateTokenMetadataURI" | "updateTokenURI"): FunctionFragment;
    encodeFunctionData(functionFragment: "mint", values: [
        IAwareToken.AwareDataStruct,
        PromiseOrValue<string>,
        PromiseOrValue<BigNumberish>
    ]): string;
    encodeFunctionData(functionFragment: "ownerOf", values: [PromiseOrValue<BigNumberish>]): string;
    encodeFunctionData(functionFragment: "tokenMetadataURI", values: [PromiseOrValue<BigNumberish>]): string;
    encodeFunctionData(functionFragment: "updateTokenMetadataURI", values: [PromiseOrValue<BigNumberish>, PromiseOrValue<string>]): string;
    encodeFunctionData(functionFragment: "updateTokenURI", values: [PromiseOrValue<BigNumberish>, PromiseOrValue<string>]): string;
    decodeFunctionResult(functionFragment: "mint", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "ownerOf", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "tokenMetadataURI", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "updateTokenMetadataURI", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "updateTokenURI", data: BytesLike): Result;
    events: {
        "TokenMetadataURIUpdated(uint256,address,string)": EventFragment;
        "TokenURIUpdated(uint256,address,string)": EventFragment;
    };
    getEvent(nameOrSignatureOrTopic: "TokenMetadataURIUpdated"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "TokenURIUpdated"): EventFragment;
}
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
export interface IAwareToken extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: IAwareTokenInterface;
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
        mint(data: IAwareToken.AwareDataStruct, recipient: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        ownerOf(tokenId: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<[string] & {
            owner: string;
        }>;
        tokenMetadataURI(tokenId: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<[string]>;
        updateTokenMetadataURI(tokenId: PromiseOrValue<BigNumberish>, metadataURI: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        updateTokenURI(tokenId: PromiseOrValue<BigNumberish>, tokenURI: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
    };
    mint(data: IAwareToken.AwareDataStruct, recipient: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    ownerOf(tokenId: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<string>;
    tokenMetadataURI(tokenId: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<string>;
    updateTokenMetadataURI(tokenId: PromiseOrValue<BigNumberish>, metadataURI: PromiseOrValue<string>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    updateTokenURI(tokenId: PromiseOrValue<BigNumberish>, tokenURI: PromiseOrValue<string>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    callStatic: {
        mint(data: IAwareToken.AwareDataStruct, recipient: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<void>;
        ownerOf(tokenId: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<string>;
        tokenMetadataURI(tokenId: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<string>;
        updateTokenMetadataURI(tokenId: PromiseOrValue<BigNumberish>, metadataURI: PromiseOrValue<string>, overrides?: CallOverrides): Promise<void>;
        updateTokenURI(tokenId: PromiseOrValue<BigNumberish>, tokenURI: PromiseOrValue<string>, overrides?: CallOverrides): Promise<void>;
    };
    filters: {
        "TokenMetadataURIUpdated(uint256,address,string)"(_tokenId?: PromiseOrValue<BigNumberish> | null, owner?: null, _uri?: null): TokenMetadataURIUpdatedEventFilter;
        TokenMetadataURIUpdated(_tokenId?: PromiseOrValue<BigNumberish> | null, owner?: null, _uri?: null): TokenMetadataURIUpdatedEventFilter;
        "TokenURIUpdated(uint256,address,string)"(_tokenId?: PromiseOrValue<BigNumberish> | null, owner?: null, _uri?: null): TokenURIUpdatedEventFilter;
        TokenURIUpdated(_tokenId?: PromiseOrValue<BigNumberish> | null, owner?: null, _uri?: null): TokenURIUpdatedEventFilter;
    };
    estimateGas: {
        mint(data: IAwareToken.AwareDataStruct, recipient: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        ownerOf(tokenId: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<BigNumber>;
        tokenMetadataURI(tokenId: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<BigNumber>;
        updateTokenMetadataURI(tokenId: PromiseOrValue<BigNumberish>, metadataURI: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        updateTokenURI(tokenId: PromiseOrValue<BigNumberish>, tokenURI: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
    };
    populateTransaction: {
        mint(data: IAwareToken.AwareDataStruct, recipient: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        ownerOf(tokenId: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        tokenMetadataURI(tokenId: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        updateTokenMetadataURI(tokenId: PromiseOrValue<BigNumberish>, metadataURI: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        updateTokenURI(tokenId: PromiseOrValue<BigNumberish>, tokenURI: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
    };
}
