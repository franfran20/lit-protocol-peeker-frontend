const chain = "mumbai";
export const evmContractConditions = [
  {
    contractAddress: "0xB930bE2810c66d5A4f400217De35b81D297f3ED6",
    functionName: "amIAllowedToPeek",
    functionParams: [":userAddress"],
    functionAbi: {
      inputs: [
        {
          internalType: "address",
          name: "_peeker",
          type: "address",
        },
      ],
      name: "amIAllowedToPeek",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    chain,
    returnValueTest: {
      key: "",
      comparator: "=",
      value: "true",
    },
  },
];
