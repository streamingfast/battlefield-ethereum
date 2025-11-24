import "@nomicfoundation/hardhat-toolbox"
import { HardhatUserConfig } from "hardhat/config"
import { HttpNetworkUserConfig } from "hardhat/types"
import { EIP, EIPs, newEIPsFromList } from "./test/lib/chain_eips"

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.6.12",
        settings: {
          optimizer: {
            enabled: false,
          },
        },
      },
      {
        version: "0.8.27",
        settings: {
          optimizer: {
            enabled: false,
          },
        },
      },
    ],
  },

  networks: {
    "geth-dev": firehoseNetwork([]),
    "arbitrum-geth-dev": firehoseNetwork([]),
    "arbitrum-nitro-dev": { ...firehoseNetwork([]), url: "http://127.0.0.1:8547" },
    "optimism-geth-dev": firehoseNetwork([]),
    "sei-dev": firehoseNetwork([]),
    "bnb-dev": firehoseNetwork([]),
    "polygon-dev": firehoseNetwork([]),
    amoy: firehoseNetwork([]),
    "monad-dev": {
      ...firehoseNetwork([]),
      accounts: ["0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"],
      gasPrice: 100_000_000_000,
    },
  },

  mocha: {
    require: ["global"],
    reporterOptions: {
      maxDiffSize: "100000",
    },
  },
}

function firehoseNetwork(enforcedEips: EIP[]): HttpNetworkUserConfig & { eips: EIPs } {
  return {
    url: "http://127.0.0.1:8545",
    accounts: ["0x52e1cc4b9c8b4fc9b202adf06462bdcc248e170c9abd56b2adb84c8d87bee674"],
    eips: newEIPsFromList(enforcedEips),
  }
}

export default config
