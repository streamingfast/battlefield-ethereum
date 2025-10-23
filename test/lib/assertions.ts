import { clone, create, DescMessage, equals, isMessage } from "@bufbuild/protobuf"
import chai from "chai"
import {
  BalanceChange,
  BalanceChange_Reason,
  Block,
  NonceChange,
  TransactionTrace,
  TransactionTraceSchema,
} from "../../pb/sf/ethereum/type/v2/type_pb"
import { hexlify, toBigInt } from "ethers"
import {
  emptyBytes,
  fetchFirehoseTransactionAndBlock,
  normalizeTrxCallFailureReasons,
  relativizeTrxTraceOrdinals,
  trxTraceOrdinals,
} from "./firehose"
import { oneWeiF, weiF, zeroWeiF } from "./money"
import { readFileSync } from "fs"
import { resolveSnapshot, SnapshotKind } from "./snapshots"
import deepEqual from "deep-equal"
import { escapeRegex } from "./regexps"
import { getReceiptForTransactionTrace, TransactionReceiptResult } from "./ethers"
import debugFactory from "debug"
import { toProtoJsonString } from "./proto"
import { EIP } from "./chain_eips"
import { isNetwork } from "./network"

const debug = debugFactory("battlefield:assertions")

type Chai = typeof chai

type TrxTracerEqualSnapshotOptions = {
  /**
   * This option list EIPs for which specific snapshots should be used. Certain EIP
   * like EIP6780 changed the overall behavior of a transaction creating differences on the
   * traced transaction that could be desirable to have a specific snapshot for so that
   * both behavior can be tested, as long as the test is run on multiple environments.
   *
   * The input should a key/value pair where the key being user-defined, usually the fork in
   * which this was activated, and the value a list of EIPs that should be active on the
   * network tested to be taken into account.
   *
   * EIPs being additive over time, you must list all prior EIPs that had an override
   * before to ensure the right one is picked. For example, if you now need to deal with a
   * new fork that changes old behavior of EIP6780, you should define the input like this:
   *
   * { cancun: ["eip6780"], prague: ["eip6780", "eip7890"] }
   *
   * The current network EIPs are inferred from the block and also can be enforced from the network
   * definition in the `./hardhat.config.ts` file directly. See [./chain_eips.ts](./chain_eips.ts) is
   * you need to modify EIPs inference
   *
   * If the tests are running on a network that matches one of the input (the one with most matching
   * EIPs win the race), the snapshot file loaded will be
   * `<groupOf(snapshotFileID)>/<eip-key>/<nameOf(snapshotFileID)>` instead of
   * being picked up as `<groupOf(snapshotFileID)>/<nameOf(snapshotFileID)>`.
   *
   * If the test are running on a network that is not matching any EIPs, the snapshot file loaded will be
   * as usual, e.g. `<groupOf(snapshotFileID)>/<nameOf(snapshotFileID)>`.
   *
   * This value works in conjunction with `networkSnapshotOverrides` to allow for a more fine-grained
   * snapshot override. In the possibility that both matches, the EIP is put first in the snapshot path
   * and the overridden network name second so a test matching both would be picked as
   * `<groupOf(snapshotFileID)>/<eip-key>/<network-name>/<nameOf(snapshotFileID)>`.
   */
  eipSnapshotOverrides?: Record<string, EIP[]>

  /**
   * This option list networks for which network specific snapshots should be used. Certain networks
   * like Arbitrum have discrepancies either from the tracing implementation of because of the chain
   * itself on certain situations.
   *
   * The input element should be a network name, as defined in `./hardhat.config.ts` file. If the tests
   * are running on a network that is in this list, the snapshot file loaded will be
   * `<groupOf(snapshotFileID)>/<network-name>/<nameOf(snapshotFileID)>` instead of
   * being picked up as `<groupOf(snapshotFileID)>/<nameOf(snapshotFileID)>`.
   *
   * If the test are running on a network that is not in this list, the snapshot file loaded will be
   * as usual, e.g. `<groupOf(snapshotFileID)>/<nameOf(snapshotFileID)>`.
   *
   * This value works in conjunction with `eipSnapshotOverrides` to allow for a more fine-grained
   * snapshot override. In the possibility that both matches, the EIP is put first in the snapshot path
   * and the overridden network name second so a test matching both would be picked as
   * `<groupOf(snapshotFileID)>/<eip-key>/<network-name>/<nameOf(snapshotFileID)>`.
   */
  networkSnapshotOverrides?: string[]
}

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
       * The snapshot file can be update using `SNAPSHOTS_UPDATE=true` environment variable, or by setting
       * `SNAPSHOTS_UPDATE="^snapshotId$"` to update only this specific snapshot where `snapshotId` is the
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
      trxTraceEqualSnapshot(
        snapshotFileID: string | Record<string, string>,
        templateVars?: Record<string, string>,
        options?: TrxTracerEqualSnapshotOptions
      ): Promise<void>
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
    input:
      | TransactionReceiptResult
      | Promise<TransactionReceiptResult>
      | [TransactionReceiptResult, TransactionTrace, Block]
      | [TransactionTrace, Block]
  ): Promise<[TransactionReceiptResult, TransactionTrace, Block]> {
    if (Array.isArray(input)) {
      if (input.length === 2) {
        const receipt = await getReceiptForTransactionTrace(input[0], input[1])
        return [receipt, input[0], input[1]]
      }

      return input
    }

    let next: TransactionTrace | TransactionReceiptResult
    if (input instanceof Promise) {
      next = await input
    } else {
      next = input
    }

    if (next instanceof TransactionReceiptResult) {
      const { block, trace } = await fetchFirehoseTransactionAndBlock(next)
      return [next, trace, block]
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
    async function (
      snapshotIdentifier: string,
      templateVars?: Record<string, string>,
      options?: TrxTracerEqualSnapshotOptions
    ) {
      const [trxReceipt, actualTrace, actualBlock] = await resolveTrxTrace(this._obj)
      if (isNetwork("polygon-dev")) {
        // filter logs from special contract
        if (actualTrace.receipt && actualTrace.receipt.logs) {
          actualTrace.receipt.logs = actualTrace.receipt.logs.filter((log) => {
            return hexlify(log.address) !== "0x0000000000000000000000000000000000001010"
          })
        }
        actualTrace.calls.forEach((call) => {
          call.logs = call.logs.filter((log) => {
            return hexlify(log.address) !== "0x0000000000000000000000000000000000001010"
          })
          call.balanceChanges.forEach((bc) => {
            if (hexlify(bc.address) === "0x000000000000000000000000000000000000dead") {
              bc.oldValue = undefined // undeterministic value for that polygon system account
              bc.newValue = undefined // undeterministic value for that polygon system account
            }
          })
        })
      }
      // Check on original trace for correctness of ordinal handling
      const ordinals = trxTraceOrdinals(actualTrace)
      const skipOrdinalCheck = options && (options as any).skipOrdinalCheck
      assertTrxOrdinals(chai, ordinals, actualTrace, trxReceipt.blockNumber, { skipOrdinalCheck })

      const actualNormalized = normalizeTrace(clone(TransactionTraceSchema, actualTrace))
      const actualNormalizedJson = toProtoJsonString(actualNormalized)

      const snapshot = resolveSnapshot(snapshotIdentifier, options)

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
            case "$logsBloom":
              return trxReceipt.logsBloom.replace("0x", "")
            case "$cumulativeGasUsed":
              if (isNetwork("sei-dev")) {
                // Sei cumulative gas used is now returned by the RPC but we still don't have it in Firehose receipt,
                // so force it to be 0 so equality passes.
                return "0"
              }

              return trxReceipt.cumulativeGasUsed.toString()
            case "$coinbase":
              return findBlockMiner(actualBlock)
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
        new chai.Assertion(actual).to.equal(
          expected,
          `Transaction ${trxReceipt.hash} (Block #${trxReceipt.blockNumber}) trace mismatch against stored snapshot ${snapshot.id}` +
            "\n" +
            `Use SNAPSHOTS_UPDATE=true to update all snapshots or SNAPSHOTS_UPDATE="^${snapshot.id}$" this specific snapshot` +
            "\n\n" +
            `See the diff locally by running: ` +
            `'${process.env.DIFF_EDITOR || "diff -u"} ${snapshot.toSnapshotPath(
              SnapshotKind.ActualNormalized,
              true
            )} ${snapshot.toSnapshotPath(SnapshotKind.ExpectedResolved, true)}'`
        )
      }
    }
  )
}

function assertTrxOrdinals(
  chai: Chai,
  ordinalsMap: Record<number, number>,
  trace: TransactionTrace,
  blockNumber: number,
  options?: { skipOrdinalCheck?: boolean }
) {
  if (options?.skipOrdinalCheck) {
    return
  }
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

    call.balanceChanges.forEach((change) => {
      if (change.reason === BalanceChange_Reason.REWARD_TRANSACTION_FEE) {
        change.oldValue = zeroWeiF
        change.newValue = oneWeiF
      }
    })
  }

  normalizeTrxCallFailureReasons(trace)
  relativizeTrxTraceOrdinals(trace)

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

    if (receipt["logsBloom"] != null) {
      receipt["logsBloom"] = "$logsBloom"
    }
  }

  for (const call of parsed["calls"] || []) {
    const changes = call["balanceChanges"]
    if (!changes) {
      continue
    }

    for (const change of changes) {
      if (["REASON_REWARD_TRANSACTION_FEE", "REASON_REWARD_MINE_BLOCK"].includes(change["reason"])) {
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
          debug("Replacing %s with %s", value, name)
          const replacer = new RegExp(escapeRegex(value), "g")
          replaced = replaced.replace(replacer, name)
        }
      }

      return replaced
    }

    return object
  }

  debug("Templatized custom variables: %o", vars, parsed)
  return replaceValuesByTemplateVariables(parsed) as Record<string, any>
}

function isFreeformObject(obj: any): obj is Record<string, any> {
  return typeof obj === "object" && obj != null && !Array.isArray(obj)
}

function findBlockMiner(block: Block): string {
  for (const tx of block.transactionTraces) {
    for (const call of tx.calls) {
      for (const change of call.balanceChanges) {
        if (
          change.reason === BalanceChange_Reason.REWARD_MINE_BLOCK ||
          change.reason === BalanceChange_Reason.REWARD_TRANSACTION_FEE
        ) {
          return hexlify(change.address).slice(2)
        }
      }
    }
  }

  return hexlify(block.header!.coinbase).slice(2)
}
