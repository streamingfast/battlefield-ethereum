import { Code, ConnectError, createClient } from "@connectrpc/connect"
import {
  EndpointInfo,
  Fetch,
  SingleBlockRequest,
  SingleBlockRequestSchema,
  Stream,
} from "../../pb/sf/firehose/v2/firehose_pb"
import { createGrpcTransport } from "@connectrpc/connect-node"
import {
  BalanceChange,
  BalanceChange_Reason,
  BalanceChangeSchema,
  BigInt as BigIntF,
  Block,
  BlockSchema,
  Call,
  CallSchema,
  CallType,
  GasChange,
  GasChange_Reason,
  GasChangeSchema,
  NonceChange,
  NonceChangeSchema,
  TransactionReceiptSchema,
  TransactionTrace,
  TransactionTrace_Type,
  TransactionTraceSchema,
  TransactionTraceStatus,
} from "../../pb/sf/ethereum/type/v2/type_pb"
import { BigNumberish, ethers, getBytes, toBigInt, TransactionReceipt } from "ethers"
import { anyUnpack } from "@bufbuild/protobuf/wkt"
import { create, createRegistry, MessageInitShape } from "@bufbuild/protobuf"
import { weiF } from "./money"
import { TransactionReceiptResult } from "./ethers"
import debugFactory from "debug"
import { toProtoJsonObject } from "./proto"
import { isConnectError } from "./connectrpc"

const debug = debugFactory("battlefield:firehose")

export const emptyBytes = Uint8Array.of()

// Host:port of the Firehose gRPC endpoint. Every launcher in `scripts/` binds it to
// `localhost:8089` (see `run_fireeth` in `scripts/lib.sh`), the environment variable is
// only an escape hatch for non-standard setups. It is deliberately prefixed: the bare
// `FIREHOSE_ENDPOINT` is commonly exported in a developer shell for the public endpoints.
export const firehoseEndpoint = process.env.BATTLEFIELD_FIREHOSE_ENDPOINT ?? "localhost:8089"

const transport = createGrpcTransport({
  baseUrl: `http://${firehoseEndpoint}`,
})

export const firehose = createClient(Fetch, transport)

const firehoseStream = createClient(Stream, transport)
const firehoseInfo = createClient(EndpointInfo, transport)

const messageRegistry = createRegistry(BlockSchema)

export async function fetchFirehoseTransaction(receipt: TransactionReceipt): Promise<TransactionTrace> {
  const { trace } = await fetchFirehoseTransactionAndBlock(receipt)
  return trace
}

export async function fetchFirehoseBlock(
  tag: number | bigint | string | { hash: string; num: number | bigint },
  options?: { timeoutMs?: number },
): Promise<Block> {
  const block = await fetchFirehoseBlockNoLogging(tag, options?.timeoutMs)
  if (block) {
    debug(`Found Firehose block #${block.number} (${block.hash}) %O`, toProtoJsonObject(block))
  }

  return block
}

async function fetchFirehoseBlockNoLogging(
  tag: number | bigint | string | { hash: string; num: number | bigint },
  timeoutMs?: number,
): Promise<Block> {
  const deadline = timeoutMs !== undefined ? Date.now() + timeoutMs : Infinity
  let attempts = 0
  let lastErrors: unknown[] = []

  while (attempts <= 10) {
    const remaining = deadline - Date.now()
    if (remaining <= 0) {
      throw new ConnectError(
        `Block ${firehoseBlockTagToString(tag)} not found in Firehose within ${timeoutMs}ms, last errors: ${lastErrors}`,
      )
    }

    attempts += 1

    try {
      const abort = new AbortController()
      const timer = setTimeout(() => abort.abort(), Math.min(10_000, remaining))
      try {
        const response = await firehose.block({ reference: firehoseBlockTagToRef(tag) }, { signal: abort.signal })
        return anyUnpack(response.block!, messageRegistry) as Block
      } finally {
        clearTimeout(timer)
      }
    } catch (error) {
      lastErrors.push(error)

      if (isConnectError(error) && error.code !== Code.InvalidArgument) {
        const retryIn = Math.max(0, Math.min(125 + 250 * (attempts - 1), deadline - Date.now()))
        debug(`Block ${firehoseBlockTagToString(tag)} not found in Firehose yet, retrying in ${retryIn}ms`)
        await new Promise((resolve) => setTimeout(resolve, retryIn))

        continue
      }

      throw error
    }
  }

  throw new ConnectError(`Block not found in Firehose after ${attempts} attempts, last errors: ${lastErrors}`)
}

// The Firehose block time in milliseconds, read from the block metadata. It can have a finer
// precision than the block header's timestamp, which is in seconds.
export async function fetchFirehoseBlockTimeMs(tag: { hash: string; num: number | bigint }): Promise<bigint> {
  const response = await firehose.block({ reference: firehoseBlockTagToRef(tag) })
  const time = response.metadata?.time
  if (time === undefined) {
    throw new Error(`Firehose returned no metadata time for block ${firehoseBlockTagToString(tag)}`)
  }

  return time.seconds * 1000n + BigInt(Math.floor(time.nanos / 1_000_000))
}

export async function fetchFirehoseTransactionAndBlock(
  receipt: TransactionReceipt,
): Promise<{ block: Block; trace: TransactionTrace }> {
  const block = await fetchFirehoseBlock({ hash: receipt.blockHash, num: receipt.blockNumber })

  for (const tx of block.transactionTraces) {
    if (ethers.hexlify(tx.hash) === receipt.hash) {
      debug(
        `Found transaction ${receipt.hash} in Firehose at block #${receipt.blockNumber} (${receipt.blockHash}) %O`,
        toProtoJsonObject(block),
      )

      return { block, trace: tx }
    }
  }

  throw new Error(
    `Transaction ${receipt.hash} not found in Firehose at block #${receipt.blockNumber} (${receipt.blockHash})`,
  )
}

/** Make it easier to create a transaction trace from a receipt */
export function trxTraceFromReceipt(
  receipt: TransactionReceiptResult,
  init?: MessageInitShape<typeof TransactionTraceSchema>,
): TransactionTrace {
  return create(TransactionTraceSchema, {
    hash: getBytes(receipt.hash),
    from: getBytes(receipt.from),
    to: getBytes(receipt.to || "0x"),
    value: weiF(receipt.response.value),
    type: TransactionTrace_Type.TRX_TYPE_DYNAMIC_FEE,
    status: TransactionTraceStatus.SUCCEEDED,
    index: 1,
    // Are those fixed enough?
    gasPrice: weiF(8),
    maxFeePerGas: weiF(8),
    maxPriorityFeePerGas: weiF(1),
    // Default for transfer, most likely would be overriden often
    gasLimit: 21000n,
    // We use gasLimit as gasUsed by default if set
    gasUsed: init?.gasLimit ?? 21000n,
    v: emptyBytes,
    r: emptyBytes,
    s: emptyBytes,
    receipt: create(TransactionReceiptSchema, {
      cumulativeGasUsed: receipt.cumulativeGasUsed,
      logs: [],
      logsBloom: getBytes(
        "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
      ),
      stateRoot: getBytes("0x"),
    }),
    nonce: receipt.nonce,

    ...init,
  })
}

/** Make it easier to create a transaction trace from a receipt */
export function rootCallFromReceipt(
  receipt: TransactionReceiptResult,
  init?: MessageInitShape<typeof CallSchema>,
): Call {
  return call({
    caller: getBytes(receipt.from),
    address: getBytes(receipt.to || "0x"),
    value: weiF(receipt.response.value),

    ...init,
  })
}

export function call(init?: MessageInitShape<typeof CallSchema>): Call {
  return create(CallSchema, {
    value: weiF(0),
    index: 1,
    gasLimit: 0n,
    callType: CallType.CALL,

    ...init,
  })
}

export function balanceChange(
  address: string,
  oldValue: BigNumberish | BigIntF,
  newValue: BigNumberish | BigIntF,
  ordinal: number,
  reason: BalanceChange_Reason,
): BalanceChange {
  return create(BalanceChangeSchema, {
    address: getBytes(address),
    oldValue: weiF(oldValue),
    newValue: weiF(newValue),
    ordinal: BigInt(ordinal),
    reason,
  })
}

export function balanceChangeDelta(
  address: string,
  delta: BigNumberish,
  ordinal: number,
  reason: BalanceChange_Reason,
): BalanceChange {
  const deltaValue = toBigInt(delta)
  if (deltaValue < 0n) {
    return balanceChange(address, deltaValue * -1n, 0, ordinal, reason)
  }

  return balanceChange(address, 0, delta, ordinal, reason)
}

export function nonceChange(
  address: string,
  oldValue: BigNumberish,
  newValue: BigNumberish,
  ordinal: number,
): NonceChange {
  return create(NonceChangeSchema, {
    address: getBytes(address),
    oldValue: BigInt(oldValue),
    newValue: BigInt(newValue),
    ordinal: BigInt(ordinal),
  })
}

export function nonceChangeDelta(address: string, delta: BigNumberish, ordinal: number): NonceChange {
  const deltaValue = toBigInt(delta)
  if (deltaValue < 0n) {
    return nonceChange(address, deltaValue * -1n, 0, ordinal)
  }

  return nonceChange(address, 0, delta, ordinal)
}

export function gasChange(
  oldValue: BigNumberish,
  newValue: BigNumberish,
  ordinal: number,
  reason: GasChange_Reason,
): GasChange {
  return create(GasChangeSchema, {
    oldValue: BigInt(oldValue),
    newValue: BigInt(newValue),
    ordinal: BigInt(ordinal),
    reason,
  })
}

/**
 * Returns the lowest ordinal of the transaction trace that is **not** 0 (to account for
 * the tracer 2.3 bug where root's call 'beginOrdinal' is always 0).
 */
export function trxTraceLowestOrdinal(trace: TransactionTrace): number {
  const ordinals = Object.keys(trxTraceOrdinals(trace))
  if (ordinals.length === 0) {
    throw new Error("No non-zero ordinals found in transaction trace, this is invalid")
  }

  let lowestOrdinal: number | null = null
  ordinals.forEach((ordinal) => {
    // We intentially use == to perform a loose comparison against also 0 (number)
    if (ordinal == "0") {
      return
    }

    if (lowestOrdinal == null || parseInt(ordinal) < lowestOrdinal) {
      lowestOrdinal = parseInt(ordinal)
    }
  })

  return lowestOrdinal || 0
}

export function trxTraceOrdinals(trace: TransactionTrace): Record<number, number> {
  const ordinals: Record<number, number> = {}

  ordinals[Number(trace.beginOrdinal)] = (ordinals[Number(trace.beginOrdinal)] || 0) + 1
  ordinals[Number(trace.endOrdinal)] = (ordinals[Number(trace.endOrdinal)] || 0) + 1

  trace.calls.forEach((call) => {
    collectCallOrdinals(ordinals, call)
  })

  return ordinals
}

function collectCallOrdinals(ordinals: Record<number, number>, call: Call) {
  ordinals[Number(call.beginOrdinal)] = (ordinals[Number(call.beginOrdinal)] || 0) + 1
  ordinals[Number(call.endOrdinal)] = (ordinals[Number(call.endOrdinal)] || 0) + 1

  collectChangesOrdinals(ordinals, call.logs)
  collectChangesOrdinals(ordinals, call.accountCreations)
  collectChangesOrdinals(ordinals, call.balanceChanges)
  collectChangesOrdinals(ordinals, call.gasChanges)
  collectChangesOrdinals(ordinals, call.nonceChanges)
  collectChangesOrdinals(ordinals, call.storageChanges)
  collectChangesOrdinals(ordinals, call.codeChanges)
}

function collectChangesOrdinals(ordinals: Record<number, number>, changes: { ordinal?: bigint }[]) {
  changes.forEach((change) => {
    ordinals[Number(change.ordinal)] = (ordinals[Number(change.ordinal)] || 0) + 1
  })
}

// Maps each ordinal to the list of trace locations (e.g. "call[1].accountCreation[0]") that
// emitted it. Used by the ordinal-uniqueness assertion so it can report exactly which events
// collide and apply targeted per-chain leniency.
export function trxTraceOrdinalSources(trace: TransactionTrace): Record<number, string[]> {
  const sources: Record<number, string[]> = {}
  const add = (ord: bigint | undefined, label: string) => {
    const k = Number(ord)
    ;(sources[k] = sources[k] || []).push(label)
  }
  add(trace.beginOrdinal, "trace.begin")
  add(trace.endOrdinal, "trace.end")
  trace.calls.forEach((call) => {
    const i = call.index
    add(call.beginOrdinal, `call[${i}].begin`)
    add(call.endOrdinal, `call[${i}].end`)
    const addChanges = (name: string, changes: { ordinal?: bigint }[]) =>
      changes.forEach((c, j) => add(c.ordinal, `call[${i}].${name}[${j}]`))
    addChanges("log", call.logs)
    addChanges("accountCreation", call.accountCreations)
    addChanges("balanceChange", call.balanceChanges)
    addChanges("gasChange", call.gasChanges)
    addChanges("nonceChange", call.nonceChanges)
    addChanges("storageChange", call.storageChanges)
    addChanges("codeChange", call.codeChanges)
  })
  return sources
}

export function relativizeTrxTraceOrdinals(trace: TransactionTrace) {
  const lowestOrdinal = trxTraceLowestOrdinal(trace)

  const adjustChangesOrdinals = (changes: { ordinal?: bigint }[]) => {
    changes.forEach((change) => {
      change.ordinal = BigInt(Number(change.ordinal) - lowestOrdinal)
    })
  }

  trace.beginOrdinal = BigInt(Number(trace.beginOrdinal) - lowestOrdinal)
  trace.endOrdinal = BigInt(Number(trace.endOrdinal) - lowestOrdinal)

  trace.calls.forEach((call, index) => {
    // Root call can have 0 as begin ordinal, that is a bug in the tracer 2.3
    if (index != 0 || call.beginOrdinal != 0n) {
      call.beginOrdinal = BigInt(Number(call.beginOrdinal) - lowestOrdinal)
    }
    call.endOrdinal = BigInt(Number(call.endOrdinal) - lowestOrdinal)

    adjustChangesOrdinals(call.logs)
    adjustChangesOrdinals(call.accountCreations)
    adjustChangesOrdinals(call.balanceChanges)
    adjustChangesOrdinals(call.gasChanges)
    adjustChangesOrdinals(call.nonceChanges)
    adjustChangesOrdinals(call.storageChanges)
    adjustChangesOrdinals(call.codeChanges)
  })

  if (trace.receipt) {
    adjustChangesOrdinals(trace.receipt.logs)
  }
}

export function normalizeTrxCallFailureReasons(trx: TransactionTrace) {
  trx.calls.forEach((call) => {
    call.failureReason = normalizeCallFailureReason(call.failureReason)
  })
}

function normalizeCallFailureReason(reason: string): string {
  if (reason === "out of gas: out of gas") {
    return "out of gas"
  }

  return reason
}

// How long the global setup waits for Firehose to report ready. A mine-on-demand chain gets
// there within seconds because the setup pumps transactions. Other chains have to produce a full
// merged bundle (100 blocks) on their own clock first, which takes minutes on 1-2s block times.
export function firehoseReadyTimeoutMs(mineOnDemand: boolean): number {
  const fromEnv = process.env.FIREHOSE_READY_TIMEOUT_MS
  if (fromEnv !== undefined) {
    return Number(fromEnv)
  }

  return mineOnDemand ? 30_000 : 10 * 60_000
}

/**
 * Waits for Firehose to report ready on its HTTP health endpoint (`/` on the gRPC port, which
 * returns `{"is_ready":true}`).
 *
 * On mine-on-demand chains (e.g. reth-dev, geth --dev) the node only mines a block when there is
 * a pending transaction, and Firehose does not mark itself ready until it has processed live
 * blocks. Pass `sendTransaction` there: it is called every 200 ms so the chain keeps mining while
 * we wait. Other chains produce blocks on their own and need no pump.
 *
 * Why HTTP and not gRPC `Block(1)`? The gRPC block-fetch call holds the connection open
 * and waits for the requested block to appear (Firehose server-side streaming behaviour).
 * This makes it unsuitable as a readiness probe — it hangs indefinitely if block 1 has not
 * been produced yet, and AbortController interactions with the ConnectRPC Node transport
 * are unreliable. The plain HTTP health endpoint responds immediately and is safe to poll.
 *
 * Prints progress every 30 seconds so a slow start is visibly a wait, not a hang. Throws if
 * Firehose does not become ready within `timeoutMs` milliseconds.
 */
export async function waitForFirehoseReady(timeoutMs: number, sendTransaction?: () => Promise<unknown>): Promise<void> {
  let done = false

  // Fire-and-forget each send so the 200 ms timer drives the pace regardless
  // of how long the node takes to acknowledge each submission.
  const pump = async () => {
    while (sendTransaction !== undefined && !done) {
      sendTransaction().catch(() => {})
      await new Promise((resolve) => setTimeout(resolve, 200))
    }
  }

  const pumping = pump()

  try {
    const start = Date.now()
    const deadline = start + timeoutMs
    let nextProgressAt = start + 30_000
    let lastError = "no answer yet"

    while (true) {
      try {
        const response = await fetch(`http://${firehoseEndpoint}`, { signal: AbortSignal.timeout(1_000) })
        const body = (await response.json()) as { is_ready?: boolean }
        if (body.is_ready === true) {
          debug("Firehose ready")
          return
        }
        lastError = `health endpoint answered ${JSON.stringify(body)}`
      } catch (err) {
        lastError = describeFetchError(err)
      }

      const now = Date.now()
      if (now >= deadline) {
        throw new Error(
          `Firehose at ${firehoseEndpoint} did not become ready within ${timeoutMs}ms (${lastError}). ` +
            `Is the launcher running, and is the node producing blocks? Set FIREHOSE_READY_TIMEOUT_MS to wait longer.`,
        )
      }

      if (now >= nextProgressAt) {
        console.log(
          `Waiting for Firehose at ${firehoseEndpoint} to be ready (${Math.round((now - start) / 1000)}s, ${lastError})`,
        )
        nextProgressAt = now + 30_000
      }

      await new Promise((resolve) => setTimeout(resolve, 500))
    }
  } finally {
    done = true
    await pumping
  }
}

// Node's fetch reports every network failure as "fetch failed" and keeps the actual reason in
// `cause`. A refused connection is an `AggregateError` there, with an empty message but a `code`.
function describeFetchError(err: unknown): string {
  const cause = (err as { cause?: unknown }).cause ?? err
  const { message, code } = cause as { message?: string; code?: string }

  return message || code || String(cause)
}

// Returns the first block number served by the Firehose endpoint. Launchers pass it to
// `fireeth` as `--common-first-streamable-block` and it is not always 0 (Nitro and Sei
// start at 1), so any full-chain range must be clamped to it.
export async function fetchFirehoseFirstStreamableBlock(): Promise<number> {
  const info = await firehoseInfo.info({})
  return Number(info.firstStreamableBlockNum)
}

export type FirehoseHead = { num: number; libNum: number }

// Returns the Firehose head block number together with the last irreversible block (LIB) known
// at that point, or `undefined` when Firehose did not answer within `timeoutMs`.
//
// The LIB is the bound that matters for anything streaming with `final_blocks_only` (which is
// what `fireeth tools compare-blocks-rpc` does): a range extending past the LIB makes the stream
// hang until those blocks finalize. It is read from the head block's metadata rather than probed
// with a final-only stream, because a final-only stream starting at `-1` resolves `-1` against
// the head and then waits for that block to finalize, which is precisely the hang we avoid.
export async function fetchFirehoseHead(timeoutMs = 10_000): Promise<FirehoseHead | undefined> {
  const abort = new AbortController()
  const timer = setTimeout(() => abort.abort(), timeoutMs)

  try {
    for await (const response of firehoseStream.blocks({ startBlockNum: -1n }, { signal: abort.signal })) {
      if (response.metadata === undefined) {
        debug("Firehose response has no metadata, LIB is unknown")
        return undefined
      }

      const head = { num: Number(response.metadata.num), libNum: Number(response.metadata.libNum) }
      debug("Firehose head #%d (LIB #%d)", head.num, head.libNum)

      return head
    }

    return undefined
  } catch (err) {
    if (abort.signal.aborted) {
      debug("Firehose head probe timed out after %d ms", timeoutMs)
      return undefined
    }

    throw err
  } finally {
    clearTimeout(timer)
    abort.abort()
  }
}

type FirehoseBlockTag = string | number | bigint | { hash: string; num: number | bigint }

function firehoseBlockTagToRef(tag: FirehoseBlockTag): MessageInitShape<typeof SingleBlockRequestSchema>["reference"] {
  if (typeof tag === "number" || typeof tag === "bigint") {
    return {
      case: "blockNumber",
      value: { num: toBigInt(tag) },
    }
  }

  if (typeof tag === "string") {
    return {
      case: "blockNumber",
      value: { num: BigInt(parseInt(tag)) },
    }
  }

  if (typeof tag === "object") {
    return {
      case: "blockHashAndNumber",
      value: { hash: tag.hash, num: toBigInt(tag.num) },
    }
  }

  throw new Error(`Unsupported tag type: ${typeof tag}`)
}

function firehoseBlockTagToString(tag: FirehoseBlockTag): string {
  if (typeof tag === "number" || typeof tag === "bigint") {
    return `#${tag}`
  }

  if (typeof tag === "string") {
    return tag
  }

  if (typeof tag === "object") {
    return `#${tag.num} (${tag.hash})`
  }

  return `${tag}`
}
