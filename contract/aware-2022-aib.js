// module.exports = [
//     {
//         "inputs": [],
//         "stateMutability": "nonpayable",
//         "type": "constructor"
//     },
//     {
//         "anonymous": false,
//         "inputs": [
//             {
//                 "indexed": true,
//                 "internalType": "address",
//                 "name": "account",
//                 "type": "address"
//             },
//             {
//                 "indexed": true,
//                 "internalType": "address",
//                 "name": "operator",
//                 "type": "address"
//             },
//             {
//                 "indexed": false,
//                 "internalType": "bool",
//                 "name": "approved",
//                 "type": "bool"
//             }
//         ],
//         "name": "ApprovalForAll",
//         "type": "event"
//     },
//     {
//         "anonymous": false,
//         "inputs": [
//             {
//                 "indexed": true,
//                 "internalType": "uint256",
//                 "name": "_tokenId",
//                 "type": "uint256"
//             },
//             {
//                 "indexed": false,
//                 "internalType": "address",
//                 "name": "owner",
//                 "type": "address"
//             },
//             {
//                 "indexed": false,
//                 "internalType": "string",
//                 "name": "_uri",
//                 "type": "string"
//             }
//         ],
//         "name": "TokenMetadataURIUpdated",
//         "type": "event"
//     },
//     {
//         "anonymous": false,
//         "inputs": [
//             {
//                 "indexed": true,
//                 "internalType": "uint256",
//                 "name": "_tokenId",
//                 "type": "uint256"
//             },
//             {
//                 "indexed": false,
//                 "internalType": "address",
//                 "name": "owner",
//                 "type": "address"
//             },
//             {
//                 "indexed": false,
//                 "internalType": "string",
//                 "name": "_uri",
//                 "type": "string"
//             }
//         ],
//         "name": "TokenURIUpdated",
//         "type": "event"
//     },
//     {
//         "anonymous": false,
//         "inputs": [
//             {
//                 "indexed": true,
//                 "internalType": "address",
//                 "name": "operator",
//                 "type": "address"
//             },
//             {
//                 "indexed": true,
//                 "internalType": "address",
//                 "name": "from",
//                 "type": "address"
//             },
//             {
//                 "indexed": true,
//                 "internalType": "address",
//                 "name": "to",
//                 "type": "address"
//             },
//             {
//                 "indexed": false,
//                 "internalType": "uint256[]",
//                 "name": "ids",
//                 "type": "uint256[]"
//             },
//             {
//                 "indexed": false,
//                 "internalType": "uint256[]",
//                 "name": "values",
//                 "type": "uint256[]"
//             }
//         ],
//         "name": "TransferBatch",
//         "type": "event"
//     },
//     {
//         "anonymous": false,
//         "inputs": [
//             {
//                 "indexed": true,
//                 "internalType": "address",
//                 "name": "operator",
//                 "type": "address"
//             },
//             {
//                 "indexed": true,
//                 "internalType": "address",
//                 "name": "from",
//                 "type": "address"
//             },
//             {
//                 "indexed": true,
//                 "internalType": "address",
//                 "name": "to",
//                 "type": "address"
//             },
//             {
//                 "indexed": false,
//                 "internalType": "uint256",
//                 "name": "id",
//                 "type": "uint256"
//             },
//             {
//                 "indexed": false,
//                 "internalType": "uint256",
//                 "name": "value",
//                 "type": "uint256"
//             }
//         ],
//         "name": "TransferSingle",
//         "type": "event"
//     },
//     {
//         "anonymous": false,
//         "inputs": [
//             {
//                 "indexed": false,
//                 "internalType": "string",
//                 "name": "value",
//                 "type": "string"
//             },
//             {
//                 "indexed": true,
//                 "internalType": "uint256",
//                 "name": "id",
//                 "type": "uint256"
//             }
//         ],
//         "name": "URI",
//         "type": "event"
//     },
//     {
//         "inputs": [
//             {
//                 "internalType": "address",
//                 "name": "account",
//                 "type": "address"
//             },
//             {
//                 "internalType": "uint256",
//                 "name": "id",
//                 "type": "uint256"
//             }
//         ],
//         "name": "balanceOf",
//         "outputs": [
//             {
//                 "internalType": "uint256",
//                 "name": "",
//                 "type": "uint256"
//             }
//         ],
//         "stateMutability": "view",
//         "type": "function"
//     },
//     {
//         "inputs": [
//             {
//                 "internalType": "address[]",
//                 "name": "accounts",
//                 "type": "address[]"
//             },
//             {
//                 "internalType": "uint256[]",
//                 "name": "ids",
//                 "type": "uint256[]"
//             }
//         ],
//         "name": "balanceOfBatch",
//         "outputs": [
//             {
//                 "internalType": "uint256[]",
//                 "name": "",
//                 "type": "uint256[]"
//             }
//         ],
//         "stateMutability": "view",
//         "type": "function"
//     },
//     {
//         "inputs": [
//             {
//                 "internalType": "address",
//                 "name": "from",
//                 "type": "address"
//             },
//             {
//                 "internalType": "uint256",
//                 "name": "tokenId",
//                 "type": "uint256"
//             },
//             {
//                 "internalType": "uint256",
//                 "name": "amount",
//                 "type": "uint256"
//             }
//         ],
//         "name": "burn",
//         "outputs": [],
//         "stateMutability": "nonpayable",
//         "type": "function"
//     },
//     {
//         "inputs": [
//             {
//                 "internalType": "address",
//                 "name": "account",
//                 "type": "address"
//             },
//             {
//                 "internalType": "uint256[]",
//                 "name": "ids",
//                 "type": "uint256[]"
//             },
//             {
//                 "internalType": "uint256[]",
//                 "name": "values",
//                 "type": "uint256[]"
//             }
//         ],
//         "name": "burnBatch",
//         "outputs": [],
//         "stateMutability": "nonpayable",
//         "type": "function"
//     },
//     {
//         "inputs": [
//             {
//                 "internalType": "address",
//                 "name": "account",
//                 "type": "address"
//             },
//             {
//                 "internalType": "address",
//                 "name": "operator",
//                 "type": "address"
//             }
//         ],
//         "name": "isApprovedForAll",
//         "outputs": [
//             {
//                 "internalType": "bool",
//                 "name": "",
//                 "type": "bool"
//             }
//         ],
//         "stateMutability": "view",
//         "type": "function"
//     },
//     {
//         "inputs": [
//             {
//                 "components": [
//                     {
//                         "internalType": "string",
//                         "name": "tokenURI",
//                         "type": "string"
//                     },
//                     {
//                         "internalType": "string",
//                         "name": "metadataURI",
//                         "type": "string"
//                     },
//                     {
//                         "internalType": "bytes32",
//                         "name": "contentHash",
//                         "type": "bytes32"
//                     },
//                     {
//                         "internalType": "bytes32",
//                         "name": "metadataHash",
//                         "type": "bytes32"
//                     }
//                 ],
//                 "internalType": "struct IAwareToken.AwareData",
//                 "name": "data",
//                 "type": "tuple"
//             },
//             {
//                 "internalType": "address",
//                 "name": "recipient",
//                 "type": "address"
//             },
//             {
//                 "internalType": "uint256",
//                 "name": "amount",
//                 "type": "uint256"
//             }
//         ],
//         "name": "mint",
//         "outputs": [],
//         "stateMutability": "nonpayable",
//         "type": "function"
//     },
//     {
//         "inputs": [
//             {
//                 "internalType": "uint256",
//                 "name": "tokenId",
//                 "type": "uint256"
//             }
//         ],
//         "name": "ownerOf",
//         "outputs": [
//             {
//                 "internalType": "address",
//                 "name": "",
//                 "type": "address"
//             }
//         ],
//         "stateMutability": "view",
//         "type": "function"
//     },
//     {
//         "inputs": [
//             {
//                 "internalType": "uint256",
//                 "name": "",
//                 "type": "uint256"
//             }
//         ],
//         "name": "previousTokenOwners",
//         "outputs": [
//             {
//                 "internalType": "address",
//                 "name": "",
//                 "type": "address"
//             }
//         ],
//         "stateMutability": "view",
//         "type": "function"
//     },
//     {
//         "inputs": [
//             {
//                 "internalType": "address",
//                 "name": "from",
//                 "type": "address"
//             },
//             {
//                 "internalType": "address",
//                 "name": "to",
//                 "type": "address"
//             },
//             {
//                 "internalType": "uint256[]",
//                 "name": "ids",
//                 "type": "uint256[]"
//             },
//             {
//                 "internalType": "uint256[]",
//                 "name": "amounts",
//                 "type": "uint256[]"
//             },
//             {
//                 "internalType": "bytes",
//                 "name": "data",
//                 "type": "bytes"
//             }
//         ],
//         "name": "safeBatchTransferFrom",
//         "outputs": [],
//         "stateMutability": "nonpayable",
//         "type": "function"
//     },
//     {
//         "inputs": [
//             {
//                 "internalType": "address",
//                 "name": "from",
//                 "type": "address"
//             },
//             {
//                 "internalType": "address",
//                 "name": "to",
//                 "type": "address"
//             },
//             {
//                 "internalType": "uint256",
//                 "name": "id",
//                 "type": "uint256"
//             },
//             {
//                 "internalType": "uint256",
//                 "name": "amount",
//                 "type": "uint256"
//             },
//             {
//                 "internalType": "bytes",
//                 "name": "data",
//                 "type": "bytes"
//             }
//         ],
//         "name": "safeTransferFrom",
//         "outputs": [],
//         "stateMutability": "nonpayable",
//         "type": "function"
//     },
//     {
//         "inputs": [
//             {
//                 "internalType": "address",
//                 "name": "operator",
//                 "type": "address"
//             },
//             {
//                 "internalType": "bool",
//                 "name": "approved",
//                 "type": "bool"
//             }
//         ],
//         "name": "setApprovalForAll",
//         "outputs": [],
//         "stateMutability": "nonpayable",
//         "type": "function"
//     },
//     {
//         "inputs": [
//             {
//                 "internalType": "uint256",
//                 "name": "_tokenId",
//                 "type": "uint256"
//             },
//             {
//                 "internalType": "string",
//                 "name": "_type",
//                 "type": "string"
//             }
//         ],
//         "name": "setTokenType",
//         "outputs": [],
//         "stateMutability": "nonpayable",
//         "type": "function"
//     },
//     {
//         "inputs": [
//             {
//                 "internalType": "bytes4",
//                 "name": "interfaceId",
//                 "type": "bytes4"
//             }
//         ],
//         "name": "supportsInterface",
//         "outputs": [
//             {
//                 "internalType": "bool",
//                 "name": "",
//                 "type": "bool"
//             }
//         ],
//         "stateMutability": "view",
//         "type": "function"
//     },
//     {
//         "inputs": [
//             {
//                 "internalType": "uint256",
//                 "name": "",
//                 "type": "uint256"
//             }
//         ],
//         "name": "tokenContentHashes",
//         "outputs": [
//             {
//                 "internalType": "bytes32",
//                 "name": "",
//                 "type": "bytes32"
//             }
//         ],
//         "stateMutability": "view",
//         "type": "function"
//     },
//     {
//         "inputs": [
//             {
//                 "internalType": "uint256",
//                 "name": "",
//                 "type": "uint256"
//             }
//         ],
//         "name": "tokenCreators",
//         "outputs": [
//             {
//                 "internalType": "address",
//                 "name": "",
//                 "type": "address"
//             }
//         ],
//         "stateMutability": "view",
//         "type": "function"
//     },
//     {
//         "inputs": [
//             {
//                 "internalType": "uint256",
//                 "name": "",
//                 "type": "uint256"
//             }
//         ],
//         "name": "tokenMetadataHashes",
//         "outputs": [
//             {
//                 "internalType": "bytes32",
//                 "name": "",
//                 "type": "bytes32"
//             }
//         ],
//         "stateMutability": "view",
//         "type": "function"
//     },
//     {
//         "inputs": [
//             {
//                 "internalType": "uint256",
//                 "name": "tokenId",
//                 "type": "uint256"
//             }
//         ],
//         "name": "tokenMetadataURI",
//         "outputs": [
//             {
//                 "internalType": "string",
//                 "name": "",
//                 "type": "string"
//             }
//         ],
//         "stateMutability": "view",
//         "type": "function"
//     },
//     {
//         "inputs": [
//             {
//                 "internalType": "uint256",
//                 "name": "tokenId",
//                 "type": "uint256"
//             }
//         ],
//         "name": "tokentype",
//         "outputs": [
//             {
//                 "internalType": "string",
//                 "name": "",
//                 "type": "string"
//             }
//         ],
//         "stateMutability": "view",
//         "type": "function"
//     },
//     {
//         "inputs": [
//             {
//                 "internalType": "uint256",
//                 "name": "tokenId",
//                 "type": "uint256"
//             },
//             {
//                 "internalType": "string",
//                 "name": "metadataURI",
//                 "type": "string"
//             }
//         ],
//         "name": "updateTokenMetadataURI",
//         "outputs": [],
//         "stateMutability": "nonpayable",
//         "type": "function"
//     },
//     {
//         "inputs": [
//             {
//                 "internalType": "uint256",
//                 "name": "tokenId",
//                 "type": "uint256"
//             },
//             {
//                 "internalType": "string",
//                 "name": "tokenURI",
//                 "type": "string"
//             }
//         ],
//         "name": "updateTokenURI",
//         "outputs": [],
//         "stateMutability": "nonpayable",
//         "type": "function"
//     },
//     {
//         "inputs": [
//             {
//                 "internalType": "uint256",
//                 "name": "tokenId",
//                 "type": "uint256"
//             }
//         ],
//         "name": "uri",
//         "outputs": [
//             {
//                 "internalType": "string",
//                 "name": "",
//                 "type": "string"
//             }
//         ],
//         "stateMutability": "view",
//         "type": "function"
//     }
// ]

module.exports = [
    {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "account",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "operator",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "bool",
          "name": "approved",
          "type": "bool"
        }
      ],
      "name": "ApprovalForAll",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "_tokenId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "_uri",
          "type": "string"
        }
      ],
      "name": "TokenMetadataURIUpdated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "_tokenId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "_uri",
          "type": "string"
        }
      ],
      "name": "TokenURIUpdated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "operator",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256[]",
          "name": "ids",
          "type": "uint256[]"
        },
        {
          "indexed": false,
          "internalType": "uint256[]",
          "name": "values",
          "type": "uint256[]"
        }
      ],
      "name": "TransferBatch",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "operator",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        }
      ],
      "name": "TransferSingle",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "string",
          "name": "value",
          "type": "string"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        }
      ],
      "name": "URI",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        }
      ],
      "name": "balanceOf",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address[]",
          "name": "accounts",
          "type": "address[]"
        },
        {
          "internalType": "uint256[]",
          "name": "ids",
          "type": "uint256[]"
        }
      ],
      "name": "balanceOfBatch",
      "outputs": [
        {
          "internalType": "uint256[]",
          "name": "",
          "type": "uint256[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "burn",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        },
        {
          "internalType": "uint256[]",
          "name": "ids",
          "type": "uint256[]"
        },
        {
          "internalType": "uint256[]",
          "name": "values",
          "type": "uint256[]"
        }
      ],
      "name": "burnBatch",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "operator",
          "type": "address"
        }
      ],
      "name": "isApprovedForAll",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "components": [
            {
              "internalType": "string",
              "name": "tokenURI",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "metadataURI",
              "type": "string"
            },
            {
              "internalType": "bytes32",
              "name": "contentHash",
              "type": "bytes32"
            },
            {
              "internalType": "bytes32",
              "name": "metadataHash",
              "type": "bytes32"
            }
          ],
          "internalType": "struct IAwareToken.AwareData",
          "name": "data",
          "type": "tuple"
        },
        {
          "internalType": "address",
          "name": "recipient",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "mint",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "name": "ownerOf",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "previousTokenOwners",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256[]",
          "name": "ids",
          "type": "uint256[]"
        },
        {
          "internalType": "uint256[]",
          "name": "amounts",
          "type": "uint256[]"
        },
        {
          "internalType": "bytes",
          "name": "data",
          "type": "bytes"
        }
      ],
      "name": "safeBatchTransferFrom",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "internalType": "bytes",
          "name": "data",
          "type": "bytes"
        }
      ],
      "name": "safeTransferFrom",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "operator",
          "type": "address"
        },
        {
          "internalType": "bool",
          "name": "approved",
          "type": "bool"
        }
      ],
      "name": "setApprovalForAll",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_tokenId",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "_type",
          "type": "string"
        }
      ],
      "name": "setTokenType",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes4",
          "name": "interfaceId",
          "type": "bytes4"
        }
      ],
      "name": "supportsInterface",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "tokenContentHashes",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "tokenCreators",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "tokenMetadataHashes",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "name": "tokenMetadataURI",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "name": "tokentype",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "metadataURI",
          "type": "string"
        }
      ],
      "name": "updateTokenMetadataURI",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "tokenURI",
          "type": "string"
        }
      ],
      "name": "updateTokenURI",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "name": "uri",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ]