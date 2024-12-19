import { expect } from "chai"
import { mustGetRpcBlock, sendEth } from "./lib/ethereum"
import { oneWei } from "./lib/money"
import { fetchFirehoseBlock, fetchFirehoseTransactionAndBlock } from "./lib/firehose"
import { knownExistingAddress } from "./lib/addresses"
import { owner } from "./global"
import { hexlify } from "ethers"
import { toBigInt } from "./lib/numbers"

describe("Blocks", function () {
  it("Block header corresponds to RPC", async function () {
    const result = await sendEth(owner, knownExistingAddress, oneWei)
    const { block } = await fetchFirehoseTransactionAndBlock(result)

    expect(block.number).to.be.equal(result.blockNumber)

    const rpcBlock = await mustGetRpcBlock(result.blockNumber)
    const firehoseBlock = block.header!

    function field(name: string): string {
      return `${name} (block #${block.number} (${block.hash}))`
    }

    expect(hexlify(firehoseBlock.coinbase)).to.be.equal(rpcBlock.miner, field("coinbase"))
    expect(hexlify(firehoseBlock.parentHash)).to.be.equal(rpcBlock.parentHash, field("parentHash"))
    expect(hexlify(firehoseBlock.uncleHash)).to.be.equal(rpcBlock.sha3Uncles, field("uncleHash"))
    expect(hexlify(firehoseBlock.stateRoot)).to.be.equal(rpcBlock.stateRoot, field("stateRoot"))
    expect(hexlify(firehoseBlock.transactionsRoot)).to.be.equal(rpcBlock.transactionsRoot, field("transactionsRoot"))
    expect(hexlify(firehoseBlock.receiptRoot)).to.be.equal(rpcBlock.receiptsRoot, field("receiptsRoot"))
    expect(hexlify(firehoseBlock.logsBloom)).to.be.equal(rpcBlock.logsBloom, field("logsBloom"))
    expect(firehoseBlock.number).to.be.equal(rpcBlock.number, field("number"))
    expect(firehoseBlock.gasLimit).to.be.equal(rpcBlock.gasLimit, field("gasLimit"))
    expect(firehoseBlock.gasUsed).to.be.equal(rpcBlock.gasUsed, field("gasUsed"))
    expect(hexlify(firehoseBlock.extraData)).to.be.equal(rpcBlock.extraData, field("extraData"))
    expect(hexlify(firehoseBlock.mixHash)).to.be.equal(rpcBlock.mixHash, field("mixHash"))
    expect(firehoseBlock.nonce).to.be.equal(toBigInt(rpcBlock.nonce), field("nonce"))
    expect(hexlify(firehoseBlock.hash)).to.be.equal(rpcBlock.hash, field("hash"))

    expect(toBigInt(firehoseBlock.difficulty)).to.be.equal(rpcBlock.difficulty, field("difficulty"))
    expect(firehoseBlock.timestamp?.seconds).to.be.equal(rpcBlock.timestamp, field("timestamp"))

    expect(hexlify(firehoseBlock.withdrawalsRoot)).to.be.equal(rpcBlock.withdrawalsRoot, field("withdrawalsRoot"))
    expect(hexlify(firehoseBlock.parentBeaconRoot)).to.be.equal(
      rpcBlock.parentBeaconBlockRoot,
      field("parentBeaconRoot")
    )

    expect(toBigInt(firehoseBlock.baseFeePerGas)).to.be.equal(toBigInt(rpcBlock.baseFeePerGas), field("baseFeePerGas"))
    expect(firehoseBlock.blobGasUsed).to.be.equal(rpcBlock.blobGasUsed, field("blobGasUsed"))
    expect(firehoseBlock.excessBlobGas).to.be.equal(rpcBlock.excessBlobGas, field("excessBlobGas"))

    // No supported yet
    // expect(firehoseBlock.requestsHash).to.be.equal(rpcBlock., field("requestsHash"))
  })

  it("Block header parentBeaconRoot system call", async function () {
    const rpcBlock = await mustGetRpcBlock("latest")
    if (!rpcBlock.parentBeaconBlockRoot) {
      // Test do not apply to this network
      return
    }

    const firehoseBlock = await fetchFirehoseBlock(rpcBlock.number)
    const header = firehoseBlock.header!

    expect(hexlify(header.parentBeaconRoot)).to.be.equal(rpcBlock.parentBeaconBlockRoot)

    const beaconRootCall = firehoseBlock.systemCalls.find(
      (systemCall) => hexlify(systemCall.caller) === "0xfffffffffffffffffffffffffffffffffffffffe"
    )
    expect(beaconRootCall).to.not.be.undefined

    // There should be a storage change within the system call, not sure why we are not recording
    // it correctly :$
  })
})
