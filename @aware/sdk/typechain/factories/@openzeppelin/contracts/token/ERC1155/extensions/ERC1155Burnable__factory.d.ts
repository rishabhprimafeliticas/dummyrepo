import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { ERC1155Burnable, ERC1155BurnableInterface } from "../../../../../../@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable";
export declare class ERC1155Burnable__factory {
    static readonly abi: ({
        anonymous: boolean;
        inputs: {
            indexed: boolean;
            internalType: string;
            name: string;
            type: string;
        }[];
        name: string;
        type: string;
        outputs?: undefined;
        stateMutability?: undefined;
    } | {
        inputs: {
            internalType: string;
            name: string;
            type: string;
        }[];
        name: string;
        outputs: {
            internalType: string;
            name: string;
            type: string;
        }[];
        stateMutability: string;
        type: string;
        anonymous?: undefined;
    })[];
    static createInterface(): ERC1155BurnableInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): ERC1155Burnable;
}
