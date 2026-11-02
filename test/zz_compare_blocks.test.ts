import { expect } from "chai"
import { compareBlocksWithRpc, finalityTimeoutMs, isFireethAvailable, resolveCompareRange } from "./lib/compare_blocks"
import { sendEth } from "./lib/ethereum"
import { knownExistingAddress } from "./lib/addresses"
import { oneWei } from "./lib/money"
import { owner } from "./global"
import { isNetwork } from "./lib/network"

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
    if (isNetwork("monad-dev")) {
      expect(
        unacceptedMonadDifferences(result.output),
        `Firehose blocks differ from RPC blocks in range #${start}-#${stop}, output:\n${result.output}`,
      ).to.deep.equal([])
      expect(result.identicalCount + result.differences.length).to.be.greaterThan(0)
      return
    }

    expect(
      result.differences.filter((difference) => !isAcceptedDifference(difference)),
      `Firehose blocks differ from RPC blocks in range #${start}-#${stop}, output:\n${result.output}`,
    ).to.deep.equal([])
    expect(
      result.identicalCount,
      `No block was compared in range #${start}-#${stop}, output:\n${result.output}`,
    ).to.be.greaterThan(0)
  })
})

// BSC Firehose blocks, from geth-BSC and reth-bsc alike, treat the zero base fee as absent, so a
// dynamic-fee transaction's gas price is its fee cap where RPC reports the effective price. The
// per-transaction snapshots pin the Firehose value.
function isAcceptedDifference(difference: string): boolean {
  return isNetwork("bnb-dev") && /^different \[@ \["transaction_traces",\d+,"gas_price"\]$/.test(difference.trim())
}

function unacceptedMonadDifferences(output: string): string[] {
  const unaccepted: string[] = []
  const lines = output.split("\n")

  for (let i = 0; i < lines.length; i++) {
    const path = lines[i].match(/@ (\[.*\])$/)?.[1]
    if (path === undefined) {
      continue
    }

    const rpc = lines[i + 1]?.match(/^- "(.*)"$/)?.[1]
    const firehose = lines[i + 2]?.match(/^\+ "(.*)"$/)?.[1]
    if (!isAcceptedMonadDifference(path, rpc, firehose)) {
      unaccepted.push(`${path}: rpc=${rpc} firehose=${firehose}`)
    }
  }

  return unaccepted
}

function isAcceptedMonadDifference(path: string, rpc?: string, firehose?: string): boolean {
  if (rpc === undefined || firehose === undefined) {
    return false
  }

  if (path === '["size"]') {
    return firehose === "0x0"
  }

  if (/^\["transaction_traces",\d+,"v"\]$/.test(path)) {
    if (rpc === "0x") {
      return firehose === "0x00"
    }

    const v = BigInt(rpc)
    return v >= 35n && (v - 35n) % 2n === BigInt(firehose)
  }

  return false
}
