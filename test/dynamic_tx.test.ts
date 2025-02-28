import { expect } from "chai"
import { defaultGasPrice, sendEth } from "./lib/ethereum"
import { oneWei } from "./lib/money"
import { fetchFirehoseTransactionAndBlock } from "./lib/firehose"
import { hexlify } from "ethers"
import { knownExistingAddress } from "./lib/addresses"
import { TransactionTrace_Type } from "../pb/sf/ethereum/type/v2/type_pb"
import { owner } from "./global"
import { toBigInt } from "./lib/numbers"
import { isNetwork } from "./lib/network"

describe("Dynamic Tx", function () {
  it("Dynamic transaction max fee", async function () {
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
    const result = await sendEth(owner, knownExistingAddress, oneWei, {
      gasPrice: undefined,
      maxFeePerGas: defaultGasPrice,
      maxPriorityFeePerGas: 25_000,
    })
    const { block, trace } = await fetchFirehoseTransactionAndBlock(result)

    expect(hexlify(trace.hash)).to.equal(result.hash)
    expect(trace.type).to.equal(TransactionTrace_Type.TRX_TYPE_DYNAMIC_FEE)
    expect(toBigInt(trace.gasPrice)).to.above(toBigInt(block.header?.baseFeePerGas))
    expect(toBigInt(trace.maxFeePerGas)).to.equal(defaultGasPrice)
    expect(toBigInt(trace.gasPrice)).to.be.lessThanOrEqual(toBigInt(defaultGasPrice))
    expect(toBigInt(block.header?.baseFeePerGas)).to.be.greaterThanOrEqual(0n)
    expect(toBigInt(trace.maxPriorityFeePerGas)).to.equal(25_000n)
  })
})
