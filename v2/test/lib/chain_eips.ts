import { Block } from "ethers"

// This is not an exhaustive list of EIPs, just the ones we need to know about
export type EIP =
  // Changes in our SELFDESTRUCT behaves, activated in Cancun fork
  "eip6780"

export type EIPs = Record<EIP, boolean | undefined>

export function newEIPsFromList(eips: EIP[]): EIPs {
  const eipMap: EIPs = newEmptyEIPs()
  eips.forEach((eip) => {
    eipMap[eip] = true
  })

  return eipMap
}

export function newEmptyEIPs(): EIPs {
  return {
    eip6780: undefined,
  }
}

export function inferEIPsFromBlock(block: Block | undefined): EIPs {
  const eips: EIPs = newEmptyEIPs()
  if (!block) {
    return eips
  }

  eips.eip6780 = block.baseFeePerGas != null && block.baseFeePerGas != undefined

  return eips
}

export function isEIPActive(eips: EIPs, eip: EIP): boolean {
  return eips[eip] === true
}
