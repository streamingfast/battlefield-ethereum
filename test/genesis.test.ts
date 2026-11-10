import { expect } from "chai"
import { fetchFirehoseBlock } from "./lib/firehose"
import { BalanceChange_Reason, TransactionTrace_Type } from "../pb/sf/ethereum/type/v2/type_pb"
import { Interface } from "ethers"
import hre from "hardhat"
import { isNetwork, isNetworkOneOf } from "./lib/network"

describe("Genesis Block", function () {
  it("Block 0 has a single genesis transaction trace with correct structure", async function () {
    // Reasons:
    // - Firehose has problem return block 0 with devent env, so we disable is otherwise the test times out until first bundle ready
    //   we get error like 'Block #0 not found in Firehose within 30000ms'. Outside of this problem, those chains works if you
    //   wait long enough:
    //    - geth-devnet
    //    - op-geth-devnet
    // - Arbitrum/Nitro builds its ArbOS genesis without persisting a genesis state spec, so the live firehose
    //   tracer initializes with an empty alloc: block 0 is emitted but carries no GENESIS_BALANCE changes.
    if (isNetworkOneOf("geth-devnet", "op-geth-devnet", "arbitrum-nitro-dev", "monad-dev")) {
      this.skip()
    }

    const block = await fetchFirehoseBlock(0, { timeoutMs: 30_000 })

    expect(block.number).to.equal(0n, "genesis block number must be 0")
    expect(block.transactionTraces).to.have.length(1, "genesis block must have exactly one synthetic transaction trace")

    const trace = block.transactionTraces[0]

    expect(trace.type).to.equal(TransactionTrace_Type.TRX_TYPE_LEGACY, "genesis trace must be legacy type")
    expect(trace.calls).to.have.length(1, "genesis trace must have exactly one root call")

    const call = trace.calls[0]

    expect(call.balanceChanges.length).to.be.greaterThan(0, "genesis call must carry at least one balance change")

    for (const change of call.balanceChanges) {
      expect(change.reason).to.equal(
        BalanceChange_Reason.GENESIS_BALANCE,
        `every balance change in genesis must have reason GENESIS_BALANCE, got ${change.reason}`,
      )
    }

    await expect([trace, block]).to.trxTraceEqualSnapshot(
      "genesis/genesis_block_trx",
      isNetwork("base-devnet") ? await baseDevnetGenesisVars() : undefined,
    )
  })
})

// Base's devnet deploys its L1 bridge contracts at new addresses on every start, and its L2
// genesis points the bridge predeploys at them, so these values and the genesis state root change
// with every devnet.
async function baseDevnetGenesisVars(): Promise<Record<string, string>> {
  const provider = hre.ethers.provider
  const bridges = new Interface([
    "function otherMessenger() view returns (address)",
    "function otherBridge() view returns (address)",
  ])
  const read = async (predeploy: string, method: "otherMessenger" | "otherBridge") => {
    const ret = await provider.call({ to: predeploy, data: bridges.encodeFunctionData(method), blockTag: 0 })
    return (bridges.decodeFunctionResult(method, ret)[0] as string).toLowerCase().slice(2)
  }
  const genesis = await provider.send("eth_getBlockByNumber", ["0x0", false])

  return {
    $l1CrossDomainMessenger: await read("0x4200000000000000000000000000000000000007", "otherMessenger"),
    $l1StandardBridge: await read("0x4200000000000000000000000000000000000010", "otherBridge"),
    $l1Erc721Bridge: await read("0x4200000000000000000000000000000000000014", "otherBridge"),
    $genesisStateRoot: genesis.stateRoot.slice(2),
  }
}
