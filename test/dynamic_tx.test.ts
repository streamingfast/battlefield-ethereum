import { expect } from "chai"
import { defaultGasPrice, sendEth } from "./lib/ethereum"
import { oneWei } from "./lib/money"
import { fetchFirehoseTransactionAndBlock } from "./lib/firehose"
import { hexlify } from "ethers"
import { knownExistingAddress } from "./lib/addresses"
import { TransactionTrace_Type } from "../pb/sf/ethereum/type/v2/type_pb"
import { owner } from "./global"
import { toBigInt } from "./lib/numbers"
import { isNetwork, networkName } from "./lib/network"

describe("Dynamic Tx", function () {
  it("Dynamic transaction max fee", async function () {
    if (process.env.BATTLEFIELD_SKIP_VALIDATION === "true") {
      this.skip()
    }

    const result = await sendEth(owner, knownExistingAddress, oneWei, {
      gasPrice: undefined,
      maxFeePerGas: defaultGasPrice,
    })
    const { block, trace } = await fetchFirehoseTransactionAndBlock(result)

    expect(hexlify(trace.hash)).to.equal(result.hash)
    expect(trace.type).to.equal(TransactionTrace_Type.TRX_TYPE_DYNAMIC_FEE)
    expect(toBigInt(trace.gasPrice)).to.equal(result.gasPrice)
    expect(toBigInt(trace.maxFeePerGas)).to.equal(defaultGasPrice)
    expect(toBigInt(block.header?.baseFeePerGas)).to.be.greaterThanOrEqual(0n)

    // Seems that Sei return `null` as `maxPriorityFeePerGas` on dynamic fee transactions, at least at the time of writing this test.
    if (!isNetwork("sei-dev")) {
      expect(toBigInt(trace.maxPriorityFeePerGas)).to.equal(result.response.maxPriorityFeePerGas)
    }
  })

  it("Dynamic transaction max tip", async function () {
    if (process.env.BATTLEFIELD_SKIP_VALIDATION === "true") {
      this.skip()
    }

    let maxPriorityFeePerGas = 25_000
    if (isNetwork("polygon-dev")) {
      maxPriorityFeePerGas = 25_000_000_000
    }
    if (isNetwork("bnb-dev")) {
      maxPriorityFeePerGas = 1_000_000_000
    }
    const result = await sendEth(owner, knownExistingAddress, oneWei, {
      gasPrice: undefined,
      maxFeePerGas: defaultGasPrice,
      maxPriorityFeePerGas: maxPriorityFeePerGas,
    })
    const { block, trace } = await fetchFirehoseTransactionAndBlock(result)

    expect(hexlify(trace.hash)).to.equal(result.hash)
    expect(trace.type).to.equal(TransactionTrace_Type.TRX_TYPE_DYNAMIC_FEE)
    expect(toBigInt(trace.gasPrice)).to.above(toBigInt(block.header?.baseFeePerGas))
    expect(toBigInt(trace.maxFeePerGas)).to.equal(defaultGasPrice)
    expect(toBigInt(trace.gasPrice)).to.be.lessThanOrEqual(toBigInt(defaultGasPrice))
    expect(toBigInt(block.header?.baseFeePerGas)).to.be.greaterThanOrEqual(0n)
    expect(toBigInt(trace.maxPriorityFeePerGas)).to.equal(maxPriorityFeePerGas)
  })
})
