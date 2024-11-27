import { Provider } from "ethers"

export type ChainStaticInfo = {
  coinbase: string
}

export const chainStaticInfo = {
  coinbase: "0x",
}

export async function initChainStaticInfo(provider: Provider): Promise<void> {
  provider.getBlock("latest").then((block) => {
    if (block) {
      chainStaticInfo.coinbase = block.miner
    }
  })
}
