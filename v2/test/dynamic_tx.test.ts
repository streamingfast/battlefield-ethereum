import { expect } from "chai"
import { defaultGasPrice, sendEth } from "./lib/ethereum"
import { oneWei } from "./lib/money"
import { fetchFirehoseTransactionAndBlock } from "./lib/firehose"
import { hexlify } from "ethers"
import { knownExistingAddress } from "./lib/addresses"
import { TransactionTrace_Type } from "../pb/sf/ethereum/type/v2/type_pb"
import { owner } from "./global"
import { toBigInt } from "./lib/numbers"

describe("Dynamic Tx", function () {
  it("Dynamic transaction max fee", async function () {
    const result = await sendEth(owner, knownExistingAddress, oneWei, {
      gasPrice: undefined,
      maxFeePerGas: defaultGasPrice,
    })
    const { block, trace } = await fetchFirehoseTransactionAndBlock(result)

    expect(toBigInt(block.header?.baseFeePerGas)).to.be.above(0n)

    expect(hexlify(trace.hash)).to.equal(result.hash)
    expect(trace.type).to.equal(TransactionTrace_Type.TRX_TYPE_DYNAMIC_FEE)
    expect(toBigInt(trace.gasPrice)).to.above(toBigInt(block.header?.baseFeePerGas))
    expect(toBigInt(trace.gasPrice)).to.be.below(toBigInt(defaultGasPrice))
    expect(toBigInt(trace.maxFeePerGas)).to.equal(defaultGasPrice)
    expect(toBigInt(trace.maxPriorityFeePerGas)).to.equal(1n)
  })

  it("Dynamic transaction max tip", async function () {
    const result = await sendEth(owner, knownExistingAddress, oneWei, {
      gasPrice: undefined,
      maxFeePerGas: defaultGasPrice,
      maxPriorityFeePerGas: 25_000,
    })
    const { block, trace } = await fetchFirehoseTransactionAndBlock(result)

    expect(toBigInt(block.header?.baseFeePerGas)).to.be.above(0n)

    expect(hexlify(trace.hash)).to.equal(result.hash)
    expect(trace.type).to.equal(TransactionTrace_Type.TRX_TYPE_DYNAMIC_FEE)
    expect(toBigInt(trace.gasPrice)).to.above(toBigInt(block.header?.baseFeePerGas))
    expect(toBigInt(trace.gasPrice)).to.be.below(toBigInt(defaultGasPrice))
    expect(toBigInt(trace.maxFeePerGas)).to.equal(defaultGasPrice)
    expect(toBigInt(trace.maxPriorityFeePerGas)).to.equal(25_000n)
  })
})
