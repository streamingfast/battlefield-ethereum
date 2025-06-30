import { expect } from "chai"
import { fetchFirehoseBlock } from "./lib/firehose"
import { isNetwork } from "./lib/network"

if (isNetwork("amoy")) {
  describe("Amoy", function (){
    it("Validate unmergeable system tx (block 16)", async function () {
      const block = await fetchFirehoseBlock(16)
      expect(block).to.exist
      expect(block.number).to.be.equal(16)
      expect(block.transactionTraces).to.have.lengthOf(1)
      const tx = block.transactionTraces[0]
      await expect(
        [tx, block]
      ).to.trxTraceEqualSnapshot("system_tx/unmergeable_system_tx_hash.json")
    })

    it("Validate combine system transaction  (block 35248)", async function () {
      const block = await fetchFirehoseBlock(35248)
      expect(block).to.exist
      expect(block.number).to.be.equal(35248)
      expect(block.transactionTraces).to.have.lengthOf(1)
      const tx = block.transactionTraces[0]
      await expect(
        [tx, block]
      ).to.trxTraceEqualSnapshot("system_tx/combine_system_transaction.json")
    })
  })
}
