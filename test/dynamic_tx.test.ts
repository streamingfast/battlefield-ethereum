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
import { waitForTransaction } from "./lib/ethers"

const SLOT_1 = "0x0000000000000000000000000000000000000000000000000000000000000001"

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

  it("Dynamic transaction with access list", async function () {
    const response = await owner.sendTransaction({
      to: knownExistingAddress,
      value: oneWei,
      gasLimit: 100_000,
      maxFeePerGas: defaultGasPrice,
      type: 2,
      accessList: [{ address: knownExistingAddress, storageKeys: [SLOT_1] }],
    })
    const result = await waitForTransaction(response, false)
    const { trace } = await fetchFirehoseTransactionAndBlock(result)

    expect(hexlify(trace.hash)).to.equal(result.hash)
    expect(trace.type).to.equal(
      TransactionTrace_Type.TRX_TYPE_DYNAMIC_FEE,
      "transaction must remain TRX_TYPE_DYNAMIC_FEE even with access list",
    )
    expect(trace.accessList).to.have.length(1, "access list must have exactly one entry")
    expect(hexlify(trace.accessList[0].address)).to.equal(
      knownExistingAddress.toLowerCase(),
      "access list entry address must match",
    )
    expect(trace.accessList[0].storageKeys).to.have.length(1, "access list entry must have one storage key")
    expect(hexlify(trace.accessList[0].storageKeys[0])).to.equal(SLOT_1, "storage key must match slot 1")
  })
})
