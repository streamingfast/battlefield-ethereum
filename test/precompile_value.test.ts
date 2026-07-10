import { expect } from "chai"
import { fetchFirehoseTransactionAndBlock } from "./lib/firehose"
import { owner, ownerAddress } from "./global"
import { waitForTransaction } from "./lib/ethers"
import { hexlify } from "ethers"
import { isSameAddress } from "./lib/addresses"

/**
 * Reproduces Hoodi block 3171397: a top-level transaction sending value directly to a
 * precompile. When the tx fails (the precompile runs out of gas after the value transfer),
 * revm reverts the transfer. geth-firehose still records the two TRANSFER (reason 5)
 * balance changes that occurred before the revert; reth-firehose must do the same.
 */
describe("PrecompileValue", function () {
  const REASON_TRANSFER = 5

  it("successful value transfer to a precompile records both TRANSFER balance changes", async function () {
    const precompile = "0x0000000000000000000000000000000000000002"
    const resp = await owner.sendTransaction({ to: precompile, value: 12345n, gasLimit: 100_000 })
    const result = await waitForTransaction(resp, false)
    const { trace } = await fetchFirehoseTransactionAndBlock(result)

    const transfers = trace.calls[0].balanceChanges.filter((b) => b.reason === REASON_TRANSFER)
    expect(transfers).to.have.length(2, "expected sender-debit + precompile-credit transfers")
    expect(isSameAddress(hexlify(transfers[0].address), ownerAddress)).to.equal(true)
    expect(isSameAddress(hexlify(transfers[1].address), precompile)).to.equal(true)
  })

  it("FAILED value transfer to a precompile still records both TRANSFER balance changes", async function () {
    // gasLimit 21000 = intrinsic only; the precompile itself gets 0 gas -> OOG -> tx fails,
    // reverting the value transfer. This is the Hoodi 3171397 shape (status=FAILED).
    const precompile = "0x0000000000000000000000000000000000000005"
    const resp = await owner.sendTransaction({ to: precompile, value: 12345n, gasLimit: 21000 })
    const result = await waitForTransaction(resp, true)
    const { trace } = await fetchFirehoseTransactionAndBlock(result)

    expect(trace.calls[0].stateReverted).to.equal(true, "call must be reverted")

    const transfers = trace.calls[0].balanceChanges.filter((b) => b.reason === REASON_TRANSFER)
    expect(transfers).to.have.length(
      2,
      "reverted precompile value transfer must still emit debit+credit (matches geth)",
    )
    expect(isSameAddress(hexlify(transfers[0].address), ownerAddress)).to.equal(true)
    expect(isSameAddress(hexlify(transfers[1].address), precompile)).to.equal(true)
  })
})
