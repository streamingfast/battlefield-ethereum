import { createClient } from "@connectrpc/connect"
import { Fetch } from "../pb/sf/firehose/v2/firehose_pb"
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
} from "../pb/sf/ethereum/type/v2/type_pb"
import { BigNumberish, ethers, getBytes, toBigInt, TransactionReceipt } from "ethers"
import { anyUnpack } from "@bufbuild/protobuf/wkt"
import { create, createRegistry, MessageInitShape } from "@bufbuild/protobuf"
import { weiF } from "./money"
import { TransactionReceiptResult } from "./trxs"

export const emptyBytes = Uint8Array.of()

const transport = createGrpcTransport({
  baseUrl: "http://localhost:8089",
})

export const firehose = createClient(Fetch, transport)

const messageRegistry = createRegistry(BlockSchema)

export async function fetchFirehoseTransaction(
  receipt: TransactionReceipt
): Promise<TransactionTrace> {
  const response = await firehose.block({
    reference: {
      case: "blockHashAndNumber",
      value: { hash: receipt.blockHash, num: BigInt(receipt.blockNumber) },
    },
  })

  const block = anyUnpack(response.block!, messageRegistry) as Block
  for (const tx of block.transactionTraces) {
    if (ethers.hexlify(tx.hash) === receipt.hash) {
      return tx
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

export function nonceChangeDelta(
  address: string,
  delta: BigNumberish,
  ordinal: number
): NonceChange {
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
