import { RpcBlock } from "./ethereum"

// This is not an exhaustive list of EIPs, just the ones we need to know about
export type EIP = CancunEIP | PragueEIP

export type CancunEIP =
  // Changes in our SELFDESTRUCT behaves, activated in Cancun fork
  "eip6780"

export type PragueEIP =
  // Save historical block hashes in state
  | "eip2935"
  // Supply validator deposits on chain
  | "eip6110"
  // Execution layer triggerable withdrawals
  | "eip7002"
  // Increase calldata cost
  | "eip7623"
  // General purpose execution layer requests
  | "eip7685"
  // Set EOA account code for one transaction
  | "eip7702"

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
    // Cancun
    eip6780: undefined,

    // Prague
    eip2935: undefined,
    eip6110: undefined,
    eip7002: undefined,
    eip7623: undefined,
    eip7685: undefined,
    eip7702: undefined,
  }
}

export function inferEIPsFromBlock(block: RpcBlock | undefined): EIPs {
  const eips: EIPs = newEmptyEIPs()
  if (!block) {
    return eips
  }

  // Cancun EIPs
  eips.eip6780 = block.blobGasUsed != null

  // Prague EIPs
  eips.eip2935 = block.requestsHash != null
  eips.eip6110 = block.requestsHash != null
  eips.eip7002 = block.requestsHash != null
  eips.eip7623 = block.requestsHash != null
  eips.eip7685 = block.requestsHash != null
  eips.eip7702 = block.requestsHash != null

  return eips
}

export function isEIPActive(eips: EIPs, eip: EIP): boolean {
  return eips[eip] === true
}

export function isBlockOnCancunOrLater(block: RpcBlock | undefined): boolean {
  return isEIPActive(inferEIPsFromBlock(block), "eip6780")
}

export function isBlockOnPragueOrLater(block: RpcBlock | undefined): boolean {
  return isEIPActive(inferEIPsFromBlock(block), "eip2935")
}
