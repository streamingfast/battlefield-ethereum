import { Provider } from "ethers"
import debugFactory from "debug"
import hre from "hardhat"
import { EIPs, inferEIPsFromBlock, newEmptyEIPs } from "./chain_eips"
import { HttpNetworkUserConfig } from "hardhat/types"
import { mustGetRpcBlock } from "./ethereum"

const debug = debugFactory("battlefield:chain")

export type ChainStaticInfo = {
  coinbase: string
  eips: EIPs
}

export const chainStaticInfo: ChainStaticInfo = {
  coinbase: "0x",
  eips: newEmptyEIPs(),
}

export async function initChainStaticInfo(provider: Provider): Promise<void> {
  debug("Initializing chain static info")

  mustGetRpcBlock("latest").then(async (block) => {
    chainStaticInfo.eips = newEmptyEIPs()

    if (block) {
      chainStaticInfo.coinbase = block.miner
      chainStaticInfo.eips = inferEIPsFromBlock(block)

      const config = hre.network.config as HttpNetworkUserConfig & { eips: EIPs }
      if (config.eips) {
        debug("Initializing enforced network's EIPs", config.eips)

        Object.keys(config.eips).forEach((eip) => {
          if (config.eips[eip as keyof EIPs] != undefined) {
            chainStaticInfo.eips[eip as keyof EIPs] = config.eips[eip as keyof EIPs]
          }
        })
      }

      debug("Initialized chain static info from block %O", chainStaticInfo)
    }
  })
}
