import "@nomicfoundation/hardhat-toolbox"
import { HardhatUserConfig } from "hardhat/config"
import { HttpNetworkUserConfig } from "hardhat/types"
import { EIP, EIPs, newEIPsFromList } from "./test/lib/chain_eips"
import * as fs from "fs"
import * as path from "path"

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
    "arbitrum-geth-dev": firehoseNetwork([]),
    "arbitrum-nitro-dev": { ...firehoseNetwork([]), url: "http://127.0.0.1:8547" },
    "besu-devnet": { ...firehoseNetwork([]), url: "http://127.0.0.1:8545" },
    "bnb-dev": firehoseNetwork([]),
    "geth-dev": firehoseNetwork([]),
    "geth-devnet": { ...firehoseNetwork([]), url: "http://127.0.0.1:8545" },
    "op-geth-dev": firehoseNetwork([]),
    "op-geth-devnet": { ...firehoseNetwork([]), url: "http://127.0.0.1:8547" },
    "op-reth-devnet": { ...firehoseNetwork([]), url: "http://127.0.0.1:8547" },
    "polygon-dev": firehoseNetwork([]),
    "world-chain-devnet": { ...firehoseNetwork([]), url: worldChainDevnetUrl() },
    "reth-dev": { ...firehoseNetwork([]), url: "http://127.0.0.1:9545" },
    "reth-devnet": { ...firehoseNetwork([]), url: "http://127.0.0.1:8545" },
  },

  mocha: {
    require: ["global"],
    // Gives up to 2 minutes for each test to complete
    timeout: 2 * 60 * 1000,
    reporterOptions: {
      maxDiffSize: "100000",
    },
  },
}

// The world-chain devnet assigns its sequencer RPC port dynamically; the devnet launcher
// (scripts/world_chain/run_world_chain_devnet.sh) writes the resolved URL to a state file.
function worldChainDevnetUrl(): string {
  if (process.env.WORLD_CHAIN_RPC_URL) {
    return process.env.WORLD_CHAIN_RPC_URL
  }
  const stateFile = path.join(__dirname, "scripts", "world_chain", ".devnet", "rpc-url")
  if (fs.existsSync(stateFile)) {
    return fs.readFileSync(stateFile, "utf-8").trim()
  }
  return "http://127.0.0.1:8545"
}

function firehoseNetwork(enforcedEips: EIP[]): HttpNetworkUserConfig & { eips: EIPs } {
  return {
    url: "http://127.0.0.1:8545",
    accounts: [
      // This private key maps to address 0x821b55d8abe79bc98f05eb675fdc50dfe796b7ab
      "0x52e1cc4b9c8b4fc9b202adf06462bdcc248e170c9abd56b2adb84c8d87bee674",
    ],
    eips: newEIPsFromList(enforcedEips),
  }
}

export default config
