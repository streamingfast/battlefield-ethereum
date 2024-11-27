import { create, DescMessage, equals } from "@bufbuild/protobuf"
import chai from "chai"
import {
  BalanceChange,
  NonceChange,
  TransactionTrace,
  TransactionTraceSchema,
} from "../pb/sf/ethereum/type/v2/type_pb"
import { toBigInt } from "ethers"
import { emptyBytes } from "./firehose"
import { weiF, zeroWeiF } from "./money"

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
    const sanitizeTrace = (trace: TransactionTrace) => {
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

    const localActual = sanitizeTrace(create(TransactionTraceSchema, this._obj))
    const localExpected = sanitizeTrace(create(TransactionTraceSchema, type))

    new chai.Assertion(localActual).to.be.protoEqual(TransactionTraceSchema, localExpected)
  })
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
