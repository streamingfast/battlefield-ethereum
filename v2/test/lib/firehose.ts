import { Code, ConnectError, createClient } from "@connectrpc/connect"
import { Fetch, SingleBlockRequest, SingleBlockRequestSchema } from "../../pb/sf/firehose/v2/firehose_pb"
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

const transport = createGrpcTransport({
  baseUrl: "http://localhost:8089",
})

export const firehose = createClient(Fetch, transport)

const messageRegistry = createRegistry(BlockSchema)

export async function fetchFirehoseTransaction(receipt: TransactionReceipt): Promise<TransactionTrace> {
  const { trace } = await fetchFirehoseTransactionAndBlock(receipt)
  return trace
}

export async function fetchFirehoseBlock(
  tag: number | bigint | string | { hash: string; num: number | bigint }
): Promise<Block> {
  const block = await fetchFirehoseBlockNoLogging(tag)
  if (block) {
    debug(`Found Firehose block #${block.number} (${block.hash}) %O`, toProtoJsonObject(block))
  }

  return block
}

async function fetchFirehoseBlockNoLogging(
  tag: number | bigint | string | { hash: string; num: number | bigint }
): Promise<Block> {
  let attempts = 0
  let lastError: unknown

  while (attempts <= 10) {
    attempts += 1

    try {
      const response = await firehose.block({ reference: firehoseBlockTagToRef(tag) })
      return anyUnpack(response.block!, messageRegistry) as Block
    } catch (error) {
      lastError = error

      if (isConnectError(error) && error.code !== Code.InvalidArgument) {
        let retryIn = 125 + 250 * (attempts - 1)
        debug(`Block ${tag} not found in Firehose yet, retrying in ${retryIn}ms`)
        await new Promise((resolve) => setTimeout(resolve, retryIn))

        continue
      }

      throw error
    }
  }

  throw new ConnectError(`Block not found in Firehose after 3 attempts, last error: ${lastError}`)
}

export async function fetchFirehoseTransactionAndBlock(
  receipt: TransactionReceipt
): Promise<{ block: Block; trace: TransactionTrace }> {
  const block = await fetchFirehoseBlock({ hash: receipt.blockHash, num: receipt.blockNumber })

  for (const tx of block.transactionTraces) {
    if (ethers.hexlify(tx.hash) === receipt.hash) {
      debug(
        `Found transaction ${receipt.hash} in Firehose at block #${receipt.blockNumber} (${receipt.blockHash}) %O`,
        toProtoJsonObject(block)
      )

      return { block, trace: tx }
    }
  }

  throw new Error(
    `Transaction ${receipt.hash} not found in Firehose at block #${receipt.blockNumber} (${receipt.blockHash})`
  )
}

/** Make it easier to create a transaction trace from a receipt */
export function trxTraceFromReceipt(
  receipt: TransactionReceiptResult,
  init?: MessageInitShape<typeof TransactionTraceSchema>
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
        "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"
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
  init?: MessageInitShape<typeof CallSchema>
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
  reason: BalanceChange_Reason
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
  reason: BalanceChange_Reason
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
  ordinal: number
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
  reason: GasChange_Reason
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

function firehoseBlockTagToRef(
  tag: string | number | bigint | { hash: string; num: number | bigint }
): MessageInitShape<typeof SingleBlockRequestSchema>["reference"] {
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
