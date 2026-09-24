import { expect } from "chai"
import { compareBlocksWithRpc, finalityTimeoutMs, isFireethAvailable, resolveCompareRange } from "./lib/compare_blocks"
import { sendEth } from "./lib/ethereum"
import { knownExistingAddress } from "./lib/addresses"
import { oneWei } from "./lib/money"
import { owner } from "./global"

// Deliberately named so it sorts last: the comparison is most useful once the suite has
// produced all its blocks. It replaces the former `scripts/compare-blocks.sh`, which had to
// guess the RPC port and the block range and got both wrong on anything but `geth-dev`.
describe("Compare blocks", function () {
  it("Firehose blocks match RPC blocks", async function () {
    if (process.env.SKIP_COMPARE_BLOCKS === "1") {
      return this.skip()
    }

    const timeoutMs = Number(process.env.COMPARE_BLOCKS_TIMEOUT_MS ?? 5 * 60 * 1000)
    // The comparison is only the last leg: waiting for finality and probing Firehose come first
    // and have budgets of their own, so Mocha must outlast their sum or it kills the run midway
    // and leaves the `fireeth` child running until its own kill timer fires.
    this.timeout(timeoutMs + finalityTimeoutMs() + 60_000)

    // A missing binary is a broken setup, not a reason to quietly pass: every supported chain is
    // launched through `fireeth` in the first place, so it is always on the PATH in practice.
    expect(await isFireethAvailable(), "'fireeth' binary not found on PATH").to.be.true

    const resolved = await resolveCompareRange({
      mineBlock: () => sendEth(owner, knownExistingAddress, oneWei),
    })
    if ("skipReason" in resolved) {
      console.log(`Skipping block comparison, ${resolved.skipReason}`)
      return this.skip()
    }

    const { start, stop } = resolved.range
    const result = await compareBlocksWithRpc(resolved.range, timeoutMs)

    expect(result.exitCode, `'fireeth tools compare-blocks-rpc' failed, output:\n${result.output}`).to.equal(0)
    expect(
      result.differences,
      `Firehose blocks differ from RPC blocks in range #${start}-#${stop}, output:\n${result.output}`,
    ).to.deep.equal([])
    expect(
      result.identicalCount,
      `No block was compared in range #${start}-#${stop}, output:\n${result.output}`,
    ).to.be.greaterThan(0)
  })
})
