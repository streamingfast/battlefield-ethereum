import { expect } from "chai"
import { compareBlocksWithRpc, isFireethAvailable, resolveCompareRange } from "./lib/compare_blocks"
import { sendImmediateEth } from "./lib/ethereum"
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
    this.timeout(timeoutMs + 60_000)

    if (!(await isFireethAvailable())) {
      console.log("Skipping block comparison, 'fireeth' binary not found on PATH")
      return this.skip()
    }

    const resolved = await resolveCompareRange({
      mineBlock: () => sendImmediateEth(owner, knownExistingAddress, oneWei),
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
