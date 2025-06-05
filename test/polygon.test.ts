import { expect } from "chai"
import { fetchFirehoseBlock, fetchFirehoseTransactionAndBlock } from "./lib/firehose"
import { sendEth } from "./lib/ethereum"
import { knownExistingAddress } from "./lib/addresses"
import { owner } from "./global"
import { oneWei } from "./lib/money"
import { isNetwork } from "./lib/network"

if (isNetwork("polygon-dev")) {
  describe("Polygon", function () {
    it("Polygon System Transaction", async function () {
      const firehoseBlock = await fetchFirehoseBlock(64)
      expect(firehoseBlock.transactionTraces).to.have.lengthOf(1)
      const tx = firehoseBlock.transactionTraces[0]
      await expect(
        [tx, firehoseBlock]
      ).to.trxTraceEqualSnapshot("system_tx/validator_update.expected.json", {
      })
    })

    it("Polygon ETH Transfer Logs", async function () {
      const result = await sendEth(owner, knownExistingAddress, oneWei)
      const { block, trace } = await fetchFirehoseTransactionAndBlock(result)
      expect(block.number).to.be.equal(result.blockNumber)

      // Verify top-level logs
      expect(trace.receipt).to.not.be.undefined
      expect(trace.receipt!.logs).to.be.an('array')
      expect(trace.receipt!.logs).to.have.lengthOf(2)

      // Validate transaction receipt structure
      expect(trace.receipt!.$typeName).to.equal("sf.ethereum.type.v2.TransactionReceipt")
      expect(trace.receipt!.stateRoot).to.be.instanceOf(Uint8Array)
      expect(trace.receipt!.cumulativeGasUsed).to.be.a('bigint')
      expect(trace.receipt!.logsBloom).to.be.instanceOf(Buffer)
      expect(trace.receipt!.logsBloom).to.have.lengthOf(256)

      const receiptLog1 = trace.receipt!.logs[0]
      expect(receiptLog1.$typeName).to.equal("sf.ethereum.type.v2.Log")
      expect(receiptLog1.address).to.be.instanceOf(Buffer).with.lengthOf(20)
      expect(receiptLog1.topics).to.be.an('array').with.lengthOf(4)
      expect(receiptLog1.topics[0]).to.be.instanceOf(Buffer).with.lengthOf(32)
      expect(receiptLog1.topics[1]).to.be.instanceOf(Buffer).with.lengthOf(32)
      expect(receiptLog1.topics[2]).to.be.instanceOf(Buffer).with.lengthOf(32)
      expect(receiptLog1.topics[3]).to.be.instanceOf(Buffer).with.lengthOf(32)
      expect(receiptLog1.data).to.be.instanceOf(Buffer).with.lengthOf(160)
      expect(receiptLog1.index).to.equal(0)
      expect(receiptLog1.blockIndex).to.be.a('number')
      expect(receiptLog1.ordinal).to.be.a('bigint')

      const receiptLog2 = trace.receipt!.logs[1]
      expect(receiptLog2.$typeName).to.equal("sf.ethereum.type.v2.Log")
      expect(receiptLog2.address).to.be.instanceOf(Buffer).with.lengthOf(20)
      expect(receiptLog2.topics).to.be.an('array').with.lengthOf(4)
      expect(receiptLog2.topics[0]).to.be.instanceOf(Buffer).with.lengthOf(32)
      expect(receiptLog2.topics[1]).to.be.instanceOf(Buffer).with.lengthOf(32)
      expect(receiptLog2.topics[2]).to.be.instanceOf(Buffer).with.lengthOf(32)
      expect(receiptLog2.topics[3]).to.be.instanceOf(Buffer).with.lengthOf(32)
      expect(receiptLog2.data).to.be.instanceOf(Buffer).with.lengthOf(160)
      expect(receiptLog2.index).to.equal(1)
      expect(receiptLog2.blockIndex).to.be.a('number')
      expect(receiptLog2.ordinal).to.be.a('bigint')

      expect(receiptLog2.ordinal).to.be.greaterThan(receiptLog1.ordinal)

      // Verify internal calls
      expect(trace.calls).to.be.an('array')
      expect(trace.calls).to.have.lengthOf(1)

      const singleCall = trace.calls[0]
      expect(singleCall).to.exist
      expect(singleCall.index).to.equal(1)
      expect(singleCall.parentIndex).to.equal(0)
      expect(singleCall.depth).to.equal(0)
      expect(singleCall.callType).to.equal(1)
      expect(singleCall.logs).to.be.an("array").with.lengthOf(2)

      const log1 = singleCall.logs[0]
      expect(log1.$typeName).to.equal("sf.ethereum.type.v2.Log")
      expect(log1.address).to.be.instanceOf(Buffer).with.lengthOf(20)
      expect(log1.topics).to.be.an('array').with.lengthOf(4)
      expect(log1.topics[0]).to.be.instanceOf(Buffer).with.lengthOf(32)
      expect(log1.topics[1]).to.be.instanceOf(Buffer).with.lengthOf(32)
      expect(log1.topics[2]).to.be.instanceOf(Buffer).with.lengthOf(32)
      expect(log1.topics[3]).to.be.instanceOf(Buffer).with.lengthOf(32)
      expect(log1.data).to.be.instanceOf(Buffer).with.lengthOf(160)
      expect(log1.index).to.equal(0)
      expect(log1.blockIndex).to.be.a('number')
      expect(log1.ordinal).to.be.a('bigint')

      const log2 = singleCall.logs[1]
      expect(log2.$typeName).to.equal("sf.ethereum.type.v2.Log")
      expect(log2.address).to.be.instanceOf(Buffer).with.lengthOf(20)
      expect(log2.topics).to.be.an('array').with.lengthOf(4)
      expect(log2.topics[0]).to.be.instanceOf(Buffer).with.lengthOf(32)
      expect(log2.topics[1]).to.be.instanceOf(Buffer).with.lengthOf(32)
      expect(log2.topics[2]).to.be.instanceOf(Buffer).with.lengthOf(32)
      expect(log2.topics[3]).to.be.instanceOf(Buffer).with.lengthOf(32)
      expect(log2.data).to.be.instanceOf(Buffer).with.lengthOf(160)
      expect(log2.index).to.equal(1)
      expect(log2.blockIndex).to.be.a('number');
      expect(log2.ordinal).to.be.a('bigint')

      expect(log2.ordinal).to.be.greaterThan(log1.ordinal)
    })
  })
}
