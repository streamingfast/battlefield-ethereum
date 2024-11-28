import { create, DescMessage, enumToJson, equals, isMessage, JsonValue } from "@bufbuild/protobuf"
import chai from "chai"
import {
  BalanceChange,
  BalanceChange_ReasonSchema,
  BalanceChangeSchema,
  BigIntSchema,
  CallTypeSchema,
  GasChange_ReasonSchema,
  GasChangeSchema,
  NonceChange,
  TransactionTrace,
  TransactionTrace_TypeSchema,
  TransactionTraceSchema,
  TransactionTraceStatusSchema,
} from "../pb/sf/ethereum/type/v2/type_pb"
import { toBigInt } from "ethers"
import { emptyBytes } from "./firehose"
import { weiF, zeroWeiF } from "./money"
import { readFileSync } from "fs"
import { TransactionReceiptResult } from "./trxs"
import { chainStaticInfo } from "./chain"
import { snapshotFile } from "./snapshots"

type Chai = typeof chai

declare global {
  export namespace Chai {
    interface Assertion {
      protoEqual<D extends DescMessage>(expected: D, type: TransactionTrace): void

      /**
       * Compares TransactionTrace using Protobuf equality rules. Does **not** compare the transaction
       * signature, as it changes on every run.
       *
       * The method also perform some normalization on the balance changes, to make sure that the
       * comparison is constant across runs. Tracking real final balance value is not really important,
       * so this methods transform all balance changes before comparison.
       *
       * If the balance change delta is positive (or zero), it means we are increasing a balance,
       * then values are changed to become `oldValue: 0, newValue: delta`. If the balance change delta
       * is negative, it means we are decreasing a balance, then values are changed to become
       * `oldValue: delta * -1, newValue: 0`.
       *
       * This makes it easier to compare the balance changes value.
       *
       * A similar approach is taken for the nonce changes.
       *
       * @param expected The expected TransactionTrace
       */
      trxTraceEqual(expected: TransactionTrace): void

      trxTraceEqualSnapshot(snapshotFileID: string, receipt: TransactionReceiptResult): void
    }
  }
}

export function addFirehoseEthereumMatchers(chai: Chai) {
  const protoEqual = function (this: Chai.AssertionStatic, schema: any, type: TransactionTrace) {
    var obj = this._obj

    if (!equals(schema, obj, type)) {
      new chai.Assertion(this._obj).to.be.equal(type)
    }
  }

  chai.Assertion.addMethod("protoEqual", protoEqual)
  chai.Assertion.addMethod("trxTraceEqual", function (type: TransactionTrace) {
    const localActual = sanitizeTrace(create(TransactionTraceSchema, this._obj))
    const localExpected = sanitizeTrace(create(TransactionTraceSchema, type))

    new chai.Assertion(localActual).to.be.protoEqual(TransactionTraceSchema, localExpected)
  })

  chai.Assertion.addMethod(
    "trxTraceEqualSnapshot",
    function (snapshotFileID: string, receipt: TransactionReceiptResult) {
      const localActual = sanitizeTrace(create(TransactionTraceSchema, this._obj))

      const actualJsonString = toProtoJsonString(localActual)
      const actual = JSON.parse(actualJsonString)

      const expectedJsonString = readFileSync(snapshotFile(snapshotFileID), "utf-8")
      const expected = JSON.parse(expectedJsonString, (key, value) => {
        if (typeof value === "string") {
          switch (value) {
            case "$hash":
              return receipt.hash.replace("0x", "")
            case "$nonce":
              return receipt.nonce.toString()
            case "$coinbase":
              return chainStaticInfo.coinbase.replace("0x", "")
          }
        }

        return value
      })

      new chai.Assertion(actual).to.deep.equal(expected)
    }
  )
}

function sanitizeTrace(trace: TransactionTrace): TransactionTrace {
  // The signature changes on every run, so to avoid comparing it, we just set it to empty
  //
  // FIXME: Add a specific that that validates signature for the different kind. The idea would
  // be to obtain the signature from the transaction and validate it against the one
  // recorded in the transaction trace. Those should be equal. Difficulty is to have Ethers.js
  // generating the signature for us, to be checked, should be possible.
  trace.v = emptyBytes
  trace.r = emptyBytes
  trace.s = emptyBytes

  for (const call of trace.calls) {
    call.balanceChanges.forEach(deltaizeBalanceValue)
    call.nonceChanges.forEach(deltaizeNonceValue)
  }

  return trace
}

function deltaizeBalanceValue(change: BalanceChange) {
  const newValue = toBigInt(change.newValue?.bytes ?? emptyBytes)
  const oldValue = toBigInt(change.oldValue?.bytes ?? emptyBytes)

  const delta = toBigInt(newValue) - toBigInt(oldValue)
  if (delta < 0n) {
    change.oldValue = weiF(delta * -1n)
    change.newValue = zeroWeiF
  } else {
    change.oldValue = zeroWeiF
    change.newValue = weiF(delta)
  }
}

function deltaizeNonceValue(change: NonceChange) {
  const delta = (change.newValue ?? 0n) - (change.oldValue ?? 0n)
  if (delta < 0) {
    change.oldValue = delta * -1n
    change.newValue = 0n
  } else {
    change.oldValue = 0n
    change.newValue = delta
  }
}

function toProtoJsonString(type: any): string {
  return JSON.stringify(type, protoJsonReplacer, 2)
}

function protoJsonReplacer(this: any, key: string, value: any): any {
  if (key === "$typeName") {
    return undefined
  }

  if (value instanceof Uint8Array) {
    return Buffer.from(value).toString("hex")
  }

  if (isMessage(value, BigIntSchema)) {
    return Buffer.from(value.bytes).toString("hex")
  }

  const enumJsonValue = maybeEnumToJson(this, key, value)
  if (enumJsonValue !== undefined) {
    return enumJsonValue
  }

  if (typeof value === "bigint") {
    return value.toString()
  }

  return value
}

// There is no easy way to know if a value is an enum, so we do check on keys
// directly for now. We would need to find the corresponding paths from
// the Proto schema to the value to know if it's an enum.
function maybeEnumToJson(parent: any, key: string, value: any): JsonValue | undefined {
  if (key === "type") {
    return enumToJson(TransactionTrace_TypeSchema, value)
  }

  if (key === "status") {
    return enumToJson(TransactionTraceStatusSchema, value)
  }

  if (key === "callType") {
    return enumToJson(CallTypeSchema, value)
  }

  if (key === "reason") {
    if (isMessage(parent, BalanceChangeSchema)) {
      return enumToJson(BalanceChange_ReasonSchema, value)
    }

    if (isMessage(parent, GasChangeSchema)) {
      return enumToJson(GasChange_ReasonSchema, value)
    }
  }

  return undefined
}
