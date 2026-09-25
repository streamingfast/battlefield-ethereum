import { expect } from "chai"
import { fetchFirehoseTransactionAndBlock } from "./lib/firehose"
import { owner, ownerAddress } from "./global"
import { waitForTransaction } from "./lib/ethers"
import { hexlify } from "ethers"
import { isSameAddress } from "./lib/addresses"
import { dynamicGasLimit } from "./lib/network"

/**
 * A top-level transaction sending value directly to a precompile records both TRANSFER (reason
 * 5) balance changes: sender debit and precompile credit.
 *
 * A FAILED-transaction variant of this (Hoodi block 3171397: the precompile runs out of gas
 * after the value transfer, revm reverts, but both balance changes must still be recorded) used
 * to be covered here too, tuned to a precise gasLimit boundary. It was dropped because computing
 * that boundary reliably across forks/clients at this E2E black-box level proved impractical —
 * see the reth-side Rust inspector tests for that scenario instead.
 */
describe("PrecompileValue", function () {
  const REASON_TRANSFER = 5

  it("successful value transfer to a precompile records both TRANSFER balance changes", async function () {
    const precompile = "0x0000000000000000000000000000000000000002"
    const resp = await owner.sendTransaction({ to: precompile, value: 12345n, gasLimit: dynamicGasLimit(100_000) })
    const result = await waitForTransaction(resp, false)
    const { trace } = await fetchFirehoseTransactionAndBlock(result)

    const transfers = trace.calls[0].balanceChanges.filter((b) => b.reason === REASON_TRANSFER)
    expect(transfers).to.have.length(2, "expected sender-debit + precompile-credit transfers")
    expect(isSameAddress(hexlify(transfers[0].address), ownerAddress)).to.equal(true)
    expect(isSameAddress(hexlify(transfers[1].address), precompile)).to.equal(true)
  })
})
