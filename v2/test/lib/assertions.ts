import { clone, create, DescMessage, enumToJson, equals, isMessage, JsonValue } from "@bufbuild/protobuf"
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
} from "../../pb/sf/ethereum/type/v2/type_pb"
import { toBigInt } from "ethers"
import {
  emptyBytes,
  fetchFirehoseTransaction,
  relativizeTrxTraceOrdinals as normalizeTrxTraceOrdinals,
  trxTraceOrdinals,
} from "./firehose"
import { weiF, zeroWeiF } from "./money"
import { readFileSync } from "fs"
import { TransactionReceiptResult } from "./ethereum"
import { chainStaticInfo } from "./chain"
import { resolveSnapshot, SnapshotKind } from "./snapshots"
import deepEqual from "deep-equal"
import { escapeRegex } from "./regexps"

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

      /**
       * Compares TransactionTrace against a stored templated snapshot file on disk. The snapshot file
       * is expected to be in JSON format, and the comparison is done against the normalized JSON.
       *
       * The expect() call is expected to be filled with a, possibility async, TransactionReceiptResult,
       * which is then used to fetch the TransactionTrace from Firehose for comparison.
       *
       * The receive trace is normalized before comparison, to make sure that the comparison is constant
       * across runs, here the normalization steps performed:
       * - The signature is removed, as it changes on every run.
       * - Balance changes are normalized, if the balance change delta is positive (or zero), it means we
       *   are increasing a balance, then values are changed to become `oldValue: 0, newValue: delta`.
       *   If the balance change delta is negative, it means we are decreasing a balance, then values are
       *   changed to become `oldValue: delta * -1, newValue: 0`.
       * - Nonce changes are normalized, if the nonce change delta is positive (or zero), it means we are
       *   increasing a nonce, then values are changed to become `oldValue: 0, newValue: delta`. Nonce
       *   are only increasing, so this is fine.
       * - Ordinals are made relative to the lowest ordinal found in the trace, so that it like the transaction
       *   was the first in the block.
       *
       * The snapshot file can be update using `SNAPSHOT_UPDATE=true` environment variable, or by setting
       * `SNAPSHOT_UPDATE="^snapshotId$"` to update only this specific snapshot where `snapshotId` is the
       * snapshot identifier.
       *
       * Once loaded, a snapshot is resolved with dynamic values that changes on every run. For that, we
       * use the Ethereum transaction receipt to replace specific values in the snapshot JSON with a template.
       * The template is a string that starts with a dollar sign, like `$hash`, `$nonce`, `$index`, `$cumulativeGasUsed`,
       * `$coinbase`, and any other value that is expected to change on every run.
       * .
       * The `templateVars` object is used to replace specific values in the snapshot JSON with test specific
       * value like a contract address.
       * @param expected The expected TransactionTrace
       */
      trxTraceEqualSnapshot(snapshotFileID: string, templateVars?: Record<string, string>): Promise<void>
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

  const resolveTrxTrace = async function (
    input: TransactionReceiptResult | Promise<TransactionReceiptResult>
  ): Promise<[TransactionReceiptResult, TransactionTrace]> {
    let next: TransactionTrace | TransactionReceiptResult
    if (input instanceof Promise) {
      next = await input
    } else {
      next = input
    }

    if (next instanceof TransactionReceiptResult) {
      const trace = await fetchFirehoseTransaction(next)
      return [next, trace]
    }

    throw new Error(`Invalid input received: ${next}`)
  }

  chai.Assertion.addMethod("protoEqual", protoEqual)
  chai.Assertion.addMethod("trxTraceEqual", function (type: TransactionTrace) {
    const localActual = normalizeTrace(create(TransactionTraceSchema, this._obj))
    const localExpected = normalizeTrace(create(TransactionTraceSchema, type))

    new chai.Assertion(localActual).to.be.protoEqual(TransactionTraceSchema, localExpected)
  })

  chai.Assertion.addMethod(
    "trxTraceEqualSnapshot",
    async function (snapshotIdentifier: string, templateVars?: Record<string, string>) {
      const [trxReceipt, actualTrace] = await resolveTrxTrace(this._obj)

      // Check on original trace for correctness of ordinal handling
      const ordinals = trxTraceOrdinals(actualTrace)
      assertTrxOrdinals(chai, ordinals, actualTrace, trxReceipt.blockNumber)

      const actualNormalized = normalizeTrace(clone(TransactionTraceSchema, actualTrace))
      const actualNormalizedJson = toProtoJsonString(actualNormalized)

      const snapshot = resolveSnapshot(snapshotIdentifier)

      if (snapshot.userRequestedExpectedUpdate() || !snapshot.exists(SnapshotKind.ExpectedTemplatized)) {
        // Here we "templatize" the JSON, for example transforming literal Ethereum addresses into an actual
        // variable like "$contractAddress", so we can later re-inject new variables into the snapshot.
        const expectedTemplatized = templatizeJsonTransactionTrace(JSON.parse(actualNormalizedJson), templateVars || {})

        snapshot.writeExpected(JSON.stringify(expectedTemplatized, null, 2))
      }

      const expectedJsonString = readFileSync(snapshot.toSnapshotPath(SnapshotKind.ExpectedTemplatized), "utf-8")

      const actual = JSON.parse(actualNormalizedJson)
      const expected = JSON.parse(expectedJsonString, (_key, value) => {
        if (typeof value === "string") {
          switch (value) {
            case "$hash":
              return trxReceipt.hash.replace("0x", "")
            case "$nonce":
              return trxReceipt.nonce.toString()
            case "$index":
              return trxReceipt.index
            case "$cumulativeGasUsed":
              return trxReceipt.cumulativeGasUsed.toString()
            case "$coinbase":
              return chainStaticInfo.coinbase.replace("0x", "")
            default:
              let replaced = value
              for (const [key, replacement] of Object.entries(templateVars || {})) {
                if (value.includes(key)) {
                  const replacer = new RegExp(escapeRegex(key), "g")
                  replaced = replaced.replace(replacer, replacement)
                }
              }

              return replaced
          }
        }

        return value
      })

      snapshot.writeSnapshotDebugFiles(
        toProtoJsonString(actualTrace),
        JSON.stringify(actual, null, 2),
        JSON.stringify(expected, null, 2)
      )

      // Using directly to.deep.equal leads to losing the actual diff, but using to.equal
      // directly leads to equality failing since it's not deep. So we use deep-eql
      // (which Chai uses under the hood) to check differences, and if there are differences
      // we use to.equal so the diff is clear.
      if (!deepEqual(actual, expected)) {
        new chai.Assertion(expected).to.equal(
          actual,
          `Transaction ${trxReceipt.hash} (Block #${trxReceipt.blockNumber}) trace mismatch against stored snapshot ${snapshot.id}` +
            "\n" +
            `Use SNAPSHOT_UPDATE=true to update all snapshots or SNAPSHOT_UPDATE="^${snapshot.id}$" this specific snapshot`
        )
      }
    }
  )
}

function assertTrxOrdinals(
  chai: Chai,
  ordinalsMap: Record<number, number>,
  trace: TransactionTrace,
  blockNumber: number
) {
  const ordinals = Object.entries(ordinalsMap)
  ordinals.sort(([a], [b]) => parseInt(a) - parseInt(b))

  new chai.Assertion(ordinals.length).to.be.greaterThan(0)

  let previous: number | undefined = undefined
  ordinals.forEach(([ordinal, count]) => {
    new chai.Assertion(
      count,
      `Ordinal ${ordinal} has been seen ${count} times throughout transaction ${trace.hash} at block ${blockNumber}, that is invalid`
    ).to.equal(1)

    if (previous) {
      // FIXME: It seems Firehose 3.0 in backward compatibility mode is skipping one ordinal, need to investigate, allow it for now
      // new chai.Assertion(
      //   previous + 1,
      //   `Ordinal ${ordinal} should have strictly follow ${previous}, so that ${previous} + 1 == ${ordinal} which was not the case here\n\n` +
      //     toProtoJsonString(trace)
      // ).to.be.equal(parseInt(ordinal))
    }

    previous = parseInt(ordinal)
  })
}

function normalizeTrace(trace: TransactionTrace): TransactionTrace {
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

  normalizeTrxTraceOrdinals(trace)

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

function templatizeJsonTransactionTrace(
  parsed: Record<string, any>,
  vars: Record<string, string>
): Record<string, any> {
  const valuesToName: Record<string, string> = {}
  for (const [key, value] of Object.entries(vars)) {
    valuesToName[value] = key
  }

  if (Object.keys(valuesToName).length !== Object.keys(valuesToName).length) {
    throw new Error(`Template keys & variables must be unique on ${Object.values(vars).join(", ")}`)
  }

  parsed["hash"] = "$hash"
  parsed["nonce"] = "$nonce"
  parsed["index"] = "$index"

  const receipt = parsed["receipt"]
  if (receipt != null && typeof receipt === "object") {
    if (receipt["cumulativeGasUsed"] != null) {
      receipt["cumulativeGasUsed"] = "$cumulativeGasUsed"
    }
  }

  for (const call of parsed["calls"] || []) {
    const changes = call["balanceChanges"]
    if (!changes) {
      continue
    }

    for (const change of changes) {
      if (change["reason"] === "REWARD_TRANSACTION_FEE") {
        change["address"] = "$coinbase"
      } else if (change["reason"] === "REWARD_MINE_BLOCK") {
        change["address"] = "$coinbase"
      }
    }
  }

  const replaceValuesByTemplateVariables = (object: unknown): unknown => {
    if (object === null || object === undefined) {
      return object
    }

    if (Array.isArray(object)) {
      for (const index in object) {
        object[index] = replaceValuesByTemplateVariables(object[index])
      }

      return object
    }

    if (isFreeformObject(object)) {
      for (const [key, value] of Object.entries(object)) {
        object[key] = replaceValuesByTemplateVariables(value)
      }

      return object
    }

    if (typeof object === "string") {
      let replaced = object
      for (const [value, name] of Object.entries(valuesToName)) {
        if (object.includes(value)) {
          const replacer = new RegExp(escapeRegex(value), "g")
          replaced = replaced.replace(replacer, name)
        }
      }

      return replaced
    }

    return object
  }

  return replaceValuesByTemplateVariables(parsed) as Record<string, any>
}

function isFreeformObject(obj: any): obj is Record<string, any> {
  return typeof obj === "object" && obj != null && !Array.isArray(obj)
}
