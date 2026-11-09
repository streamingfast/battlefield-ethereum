import { expect } from "chai"
import {
  compareBlocksWithRpc,
  Difference,
  finalityTimeoutMs,
  formatDifference,
  isFireethAvailable,
  parseDifferences,
  resolveCompareRange,
} from "./lib/compare_blocks"
import { sendEth } from "./lib/ethereum"
import { knownExistingAddress } from "./lib/addresses"
import { oneWei } from "./lib/money"
import { owner } from "./global"
import { isNetwork, isNetworkOneOf } from "./lib/network"

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

    const unaccepted = parseDifferences(result.output)
      .filter((difference) => !isAcceptedDifference(difference))
      .map(formatDifference)
    expect(
      unaccepted,
      `Firehose blocks differ from RPC blocks in range #${start}-#${stop}, output:\n${result.output}`,
    ).to.deep.equal([])

    // Monad Firehose blocks never match RPC on `size`, so every block is reported as different there.
    const compared = isNetwork("monad-dev") ? result.identicalCount + result.differences.length : result.identicalCount
    expect(compared, `No block was compared in range #${start}-#${stop}, output:\n${result.output}`).to.be.greaterThan(
      0,
    )
  })
})

function isAcceptedDifference(difference: Difference): boolean {
  const { path, rpc, firehose } = difference

  // BSC Firehose blocks, from geth-BSC and reth-bsc alike, treat the zero base fee as absent, so a
  // dynamic-fee transaction's gas price is its fee cap where RPC reports the effective price. The
  // per-transaction snapshots pin the Firehose value.
  if (isNetwork("bnb-dev")) {
    return /^\["transaction_traces",\d+,"gas_price"\]$/.test(path)
  }

  // From Jovian on, OP-stack receipts report the transaction's data availability footprint as
  // `blobGasUsed`. `compare-blocks-rpc` reads that as EIP-4844 blob gas and fills both blob gas
  // fields with it, while the Firehose transaction (not a blob transaction, OP has none) has no
  // blob gas. The header's `blob_gas_used`, which Jovian also repurposes, matches on both sides.
  if (isNetworkOneOf("op-reth-devnet", "op-geth-devnet", "world-chain-devnet")) {
    return (
      /^\["transaction_traces",\d+,("blob_gas"|"receipt","blob_gas_used")\]$/.test(path) &&
      rpc !== undefined &&
      firehose === undefined
    )
  }

  if (isNetwork("monad-dev")) {
    return isAcceptedMonadDifference(path, rpc, firehose)
  }

  // Bor commits the next span through a system transaction (from 0xff…fe to the validator
  // contract) that Firehose records but the block's JSON-RPC transaction list leaves out.
  if (isNetwork("polygon-dev")) {
    return path === '["transaction_traces"]' && rpc === undefined && isOnlyBorSystemTransactions(firehose)
  }

  return false
}

const borSystemAddress = "0xfffffffffffffffffffffffffffffffffffffffe"
const borValidatorContract = "0x0000000000000000000000000000000000001000"

function isOnlyBorSystemTransactions(firehose?: string): boolean {
  if (firehose === undefined) {
    return false
  }

  let transactions: unknown
  try {
    transactions = JSON.parse(firehose)
  } catch {
    return false
  }

  return (
    Array.isArray(transactions) &&
    transactions.length > 0 &&
    transactions.every((trx) => trx?.from === borSystemAddress && trx?.to === borValidatorContract)
  )
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
