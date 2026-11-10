import { isNetworkOneOf } from "./network"

// The local op-node started by `scripts/optimism/run_optimism_devnet.sh`, it drives the Firehose EL.
const opNodeRpcUrl = process.env.OP_DEVNET_OP_NODE_RPC_URL ?? "http://127.0.0.1:19545"

// The devnet's L1 execution client, published by builder-playground.
export const opDevnetL1RpcUrl = process.env.OP_DEVNET_L1_RPC_URL ?? "http://127.0.0.1:8545"

export type RollupConfig = {
  genesis: { l2: { number: number }; l2_time: number }
  block_time: number
  deposit_contract_address: string
  karst_time?: number
}

// Returns the rollup configuration of the OP devnet, or undefined on other networks or when its
// op-node does not answer.
export async function fetchOpDevnetRollupConfig(): Promise<RollupConfig | undefined> {
  if (!isNetworkOneOf("op-reth-devnet", "op-geth-devnet")) {
    return undefined
  }

  try {
    const response = await fetch(opNodeRpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "optimism_rollupConfig", params: [] }),
    })
    const body = (await response.json()) as { result?: RollupConfig }
    return body.result
  } catch {
    return undefined
  }
}

// Returns the number of the first L2 block whose timestamp is at or after `forkTime`.
export function activationBlockNumber(config: RollupConfig, forkTime: number): number {
  const elapsed = Math.max(0, forkTime - config.genesis.l2_time)
  return config.genesis.l2.number + Math.ceil(elapsed / config.block_time)
}
