import { expect } from "chai"
import hre from "hardhat"
import { fetchFirehoseBlock } from "./lib/firehose"
import { BalanceChange_Reason, TransactionTrace_Type } from "../pb/sf/ethereum/type/v2/type_pb"
import { isNetwork, isNetworkOneOf } from "./lib/network"
import { sendImmediateEth } from "./lib/ethereum"
import { owner } from "./global"
import { knownExistingAddress } from "./lib/addresses"
import { oneWei } from "./lib/money"
import debugFactory from "debug"

const debug = debugFactory("battlefield:firehose")

describe("Genesis Block", function () {
  it("Block 0 has a single genesis transaction trace with correct structure", async function () {
    // Reasons:
    // - Reth don't record genesis yet, work in progress so reth-dev, reth-devnet and op-reth-devnet must be skipped
    //   until it's ready.
    // - Firehose has problem return block 0 with devent env, so we disable is otherwise the test times out until first bundle ready
    //   we get error like 'Block #0 not found in Firehose within 30000ms'. Outside of this problem, those chains works if you
    //   wait long enough:
    //    - geth-devnet
    //    - op-geth-devnet
    // - Arbitrum/Nitro builds its ArbOS genesis without persisting a genesis state spec, so the live firehose
    //   tracer initializes with an empty alloc: block 0 is emitted but carries no GENESIS_BALANCE changes.
    if (
      isNetworkOneOf(
        "reth-dev",
        "geth-devnet",
        "reth-devnet",
        "op-geth-devnet",
        "op-reth-devnet",
        "world-chain-devnet",
        "arbitrum-nitro-dev",
      )
    ) {
      this.skip()
    }

    if (isNetworkOneOf("geth-dev")) {
      await waitUntilMergedBlocksAvailable()
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

    await expect([trace, block]).to.trxTraceEqualSnapshot("genesis/genesis_block_trx")
  })
})

async function waitUntilMergedBlocksAvailable() {
  // Mine-on-demand chains only produce blocks when transactions arrive.
  // Pump ETH transfers until the chain has at least 130 blocks so that
  // Firehose has had time to fully merge the first bundle (blocks 0-99)
  // before we request block 0.
  const toReach = 130
  const current = await hre.ethers.provider.getBlockNumber()
  if (current >= toReach) {
    return
  }

  const count = toReach - current
  debug(`Current block number is ${current}, waiting until it reaches ${toReach} by sending ${count} transactions...`)
  for (let i = 0; i < count; i++) {
    await sendImmediateEth(owner, knownExistingAddress, oneWei)
  }
}
