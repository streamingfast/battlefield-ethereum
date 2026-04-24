import { expect } from "chai"
import { fetchFirehoseBlock } from "./lib/firehose"
import { BalanceChange_Reason, TransactionTrace_Type } from "../pb/sf/ethereum/type/v2/type_pb"

describe("Genesis Block", function () {
  it("Block 0 has a single genesis transaction trace with correct structure", async function () {
    const block = await fetchFirehoseBlock(0)

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
