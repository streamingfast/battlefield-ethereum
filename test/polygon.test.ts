import { expect } from "chai"
import { fetchFirehoseBlock, fetchFirehoseTransactionAndBlock } from "./lib/firehose"
import { mustGetRpcBlock, sendEth } from "./lib/ethereum"
import { isSameAddress, systemAddress, knownExistingAddress } from "./lib/addresses"
import { Call } from "../pb/sf/ethereum/type/v2/type_pb"
import { owner } from "./global"
import { oneWei } from "./lib/money"
import { isNetwork } from "./lib/network"

// Polygon system contract addresses from validatorContract in data/bor/genesis.json
const VALIDATOR_CONTRACT_ADDRESS = "0x0000000000000000000000000000000000001000"

if (isNetwork("polygon-dev")) {
  describe("Polygon", function () {
    it("Polygon System Transaction", async function () {
      // Find a block that contains a validator set update system transaction
      const spanEndBlock = await findSpanEndBlock()
      if (!spanEndBlock) {
        return
      }

      const firehoseBlock = await fetchFirehoseBlock(spanEndBlock)
      const systemTx = firehoseBlock.systemCalls.find(isValidatorSetUpdateCall)

      expect(systemTx).to.not.be.undefined
      expect(isSameAddress(systemTx!.caller, systemAddress)).to.be.true
      expect(isSameAddress(systemTx!.address, VALIDATOR_CONTRACT_ADDRESS)).to.be.true
      expect(systemTx!.callType).to.be.equal(1)
      expect(systemTx!.gasConsumed).to.be.greaterThan(0)
      expect(systemTx!.storageChanges.length).to.be.greaterThan(0)
      expect(firehoseBlock.transactionTraces.some(tx =>
        tx.calls.some(call => call === systemTx)
      )).to.be.true
    })

    it("Polygon ETH Transfer Logs", async function () {
      const result = await sendEth(owner, knownExistingAddress, oneWei)
      const { block, trace } = await fetchFirehoseTransactionAndBlock(result)
      expect(block.number).to.be.equal(result.blockNumber)

      // Verify top-level logs
      expect(trace.receipt).to.not.be.undefined
      expect(trace.receipt!.logs).to.be.an('array')
      expect(trace.receipt!.logs).to.have.length.above(0)

      // Verify internal logs
      expect(trace.calls).to.be.an('array')
      expect(trace.calls.length).to.be.greaterThan(0)

      trace.calls.forEach((call, index) => {
        expect(call.logs).to.be.an('array')
        expect(call.logs).to.have.length.above(0)
      })
    })
  })
}

async function findSpanEndBlock(): Promise<number | null> {
  const latestBlock = await mustGetRpcBlock("latest")
  const currentBlock = latestBlock.number

  for (let i = 0; i < Number(latestBlock.number); i++) {
    const blockNum = Number(currentBlock) - i
    if (blockNum <= 0) break

    const block = await fetchFirehoseBlock(blockNum)
    if (block.systemCalls.some(isValidatorSetUpdateCall)) {
      return blockNum
    }
  }

  return null
}

function isValidatorSetUpdateCall(call: Call): boolean {
  return isSameAddress(call.caller, systemAddress) &&
         isSameAddress(call.address, VALIDATOR_CONTRACT_ADDRESS)
}

