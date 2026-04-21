import { expect } from "chai"
import { mustGetRpcBlock, mustGetRpcBlockReceipts, sendEth } from "./lib/ethereum"
import { oneWei } from "./lib/money"
import { fetchFirehoseBlock, fetchFirehoseTransactionAndBlock } from "./lib/firehose"
import {
  isSameAddress,
  knownExistingAddress,
  systemAddress,
  systemBeaconRootsAddress,
  systemHistoryStorageAddress,
} from "./lib/addresses"
import { owner } from "./global"
import { hexlify } from "ethers"
import { toBigInt } from "./lib/numbers"
import { BalanceChange, BalanceChange_Reason, Call } from "../pb/sf/ethereum/type/v2/type_pb"
import { getGlobalSnapshotsTag } from "./lib/snapshots"
import { isNetwork } from "./lib/network"
import { network } from "hardhat"

describe("Blocks", function () {
  it("Header corresponds to RPC", async function () {
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
    expect(hexlify(firehoseBlock.extraData)).to.be.equal(rpcBlock.extraData, field("extraData"))
    expect(hexlify(firehoseBlock.mixHash)).to.be.equal(rpcBlock.mixHash, field("mixHash"))
    expect(firehoseBlock.nonce).to.be.equal(toBigInt(rpcBlock.nonce), field("nonce"))
    expect(toBigInt(firehoseBlock.difficulty)).to.be.equal(rpcBlock.difficulty, field("difficulty"))
    expect(firehoseBlock.timestamp?.seconds).to.be.equal(rpcBlock.timestamp, field("timestamp"))

    // Seems we have a big problem on Sei :(
    if (!isNetwork("sei-dev")) {
      expect(hexlify(firehoseBlock.hash)).to.be.equal(rpcBlock.hash, field("hash"))
      expect(firehoseBlock.gasLimit).to.be.equal(rpcBlock.gasLimit, field("gasLimit"))
      expect(firehoseBlock.gasUsed).to.be.equal(rpcBlock.gasUsed, field("gasUsed"))
      expect(toBigInt(firehoseBlock.baseFeePerGas)).to.be.equal(
        toBigInt(rpcBlock.baseFeePerGas),
        field("baseFeePerGas"),
      )
    }

    if (rpcBlock.withdrawalsRoot) {
      expect(hexlify(firehoseBlock.withdrawalsRoot)).to.be.equal(rpcBlock.withdrawalsRoot, field("withdrawalsRoot"))
    }

    if (rpcBlock.blobGasUsed) {
      expect(firehoseBlock.blobGasUsed).to.be.equal(rpcBlock.blobGasUsed, field("blobGasUsed"))
      expect(firehoseBlock.excessBlobGas).to.be.equal(rpcBlock.excessBlobGas, field("excessBlobGas"))
    }

    if (rpcBlock.parentBeaconBlockRoot) {
      expect(hexlify(firehoseBlock.parentBeaconRoot)).to.be.equal(
        rpcBlock.parentBeaconBlockRoot,
        field("parentBeaconRoot"),
      )
    }

    if (rpcBlock.requestsHash) {
      expect(hexlify(firehoseBlock.requestsHash)).to.be.equal(rpcBlock.requestsHash, field("requestsHash"))
    }
  })

  it("Transaction fee reward (REWARD_TRANSACTION_FEE) recorded for coinbase", async function () {
    // Send a dynamic-fee transaction with an explicit tip so that a REWARD_TRANSACTION_FEE
    // balance change is guaranteed to be emitted (tip = 0 produces no reward entry).
    const result = await sendEth(owner, knownExistingAddress, oneWei, {
      maxFeePerGas: 10_000_000_000n,
      maxPriorityFeePerGas: 1_000_000_000n,
    })
    const block = await fetchFirehoseBlock(result.blockNumber)
    const coinbase = hexlify(block.header!.coinbase)

    // On PoA/PoS chains (geth-dev, reth-dev) the tip paid by each transaction is recorded as
    // REWARD_TRANSACTION_FEE inside that transaction's call balance changes (not at block level).
    const txFeeRewardChanges = block.transactionTraces.flatMap((tx) =>
      tx.calls.flatMap((call) =>
        call.balanceChanges.filter(
          (change) =>
            change.reason === BalanceChange_Reason.REWARD_TRANSACTION_FEE &&
            isSameAddress(hexlify(change.address), coinbase),
        ),
      ),
    )

    expect(txFeeRewardChanges.length).to.be.greaterThan(
      0,
      `coinbase ${coinbase} should have at least one REWARD_TRANSACTION_FEE in transaction call balance changes`,
    )

    for (const change of txFeeRewardChanges) {
      expect(change.reason).to.equal(BalanceChange_Reason.REWARD_TRANSACTION_FEE)
    }

    const totalReward = txFeeRewardChanges.reduce(
      (sum, change) => sum + toBigInt(change.newValue) - toBigInt(change.oldValue),
      0n,
    )

    const rpcBlock = await mustGetRpcBlock(result.blockNumber)
    const baseFeePerGas = BigInt(rpcBlock.baseFeePerGas ?? 0)
    const receipts = await mustGetRpcBlockReceipts(result.blockNumber)
    const expectedReward = receipts.reduce(
      (sum, r) => sum + BigInt(r.gasUsed) * (BigInt(r.effectiveGasPrice) - baseFeePerGas),
      0n,
    )

    expect(totalReward).to.be.equal(
      expectedReward,
      "total fee reward should equal sum of gasUsed × effectiveTip across all block transactions",
    )
  })

  it("Block mining reward (REWARD_MINE_BLOCK) recorded for coinbase", async function () {
    // This is an always-true condition until we put a network that works for this.
    if (network.name != "any") {
      // Ethereum networks that are post-merge never emit a REWARD_MINE_BLOCK
      this.skip()
    }

    const result = await sendEth(owner, knownExistingAddress, oneWei)
    const block = await fetchFirehoseBlock(result.blockNumber)
    const coinbase = hexlify(block.header!.coinbase)

    // On PoW chains the mining reward is recorded in block.balanceChanges because it happens
    // outside any transaction flow (consensus layer, not EVM execution).
    const blockRewardChanges = block.balanceChanges.filter(
      (change) =>
        change.reason === BalanceChange_Reason.REWARD_MINE_BLOCK && isSameAddress(hexlify(change.address), coinbase),
    )

    expect(blockRewardChanges.length).to.be.greaterThan(
      0,
      `coinbase ${coinbase} should have at least one REWARD_MINE_BLOCK in block.balanceChanges`,
    )

    for (const change of blockRewardChanges) {
      expect(change.reason).to.equal(BalanceChange_Reason.REWARD_MINE_BLOCK)
      expect(toBigInt(change.newValue)).to.be.greaterThan(
        toBigInt(change.oldValue),
        "coinbase balance should have increased by the mining reward",
      )
    }
  })

  // bnb-dev in dev mode does not seem to update any parentBeaconRoot. being set to 00000000000 makes it skip that, so I skipped the test
  if (!isNetwork("bnb-dev")) {
    it("System call ProcessBeaconRoot recorded correctly", async function () {
      const rpcBlock = await mustGetRpcBlock("latest")
      if (!rpcBlock.parentBeaconBlockRoot) {
        // Test do not apply to this network
        return
      }

      const firehoseBlock = await fetchFirehoseBlock(rpcBlock.number)
      const header = firehoseBlock.header!

      expect(hexlify(header.parentBeaconRoot)).to.be.equal(rpcBlock.parentBeaconBlockRoot)

      const beaconRootCall = firehoseBlock.systemCalls.find(isUpdateBeaconRootCall(rpcBlock.parentBeaconBlockRoot))
      expect(beaconRootCall).to.not.be.undefined

      // A storage change could exist but not in `geth --dev` mode, at least not consistently because
      // in dev mode, the beacon root is also sets to 0x0 and in the tracer, storage changes
      // with `prev == new` are ignored hence the storage change is not recorded in that case. So
      // we cannot reliably test for storage changes here.
      //
      // We should once we have a way to check for which "network" the test suite is running
    })
  }

  it("System call ProcessParentBlockHash recorded correctly", async function () {
    const rpcBlock = await mustGetRpcBlock("latest")
    if (!rpcBlock.requestsHash) {
      // Test do not apply to this network
      return
    }

    const firehoseBlock = await fetchFirehoseBlock(rpcBlock.number)
    const header = firehoseBlock.header!

    expect(hexlify(header.requestsHash)).to.be.equal(rpcBlock.requestsHash)

    const updateParentBlockHashCall = firehoseBlock.systemCalls.find(isUpdateParentBlockHash(rpcBlock.parentHash))
    expect(updateParentBlockHashCall).to.not.be.undefined

    expect(updateParentBlockHashCall?.storageChanges).to.be.lengthOf(1)
    expect(updateParentBlockHashCall?.storageChanges[0].newValue).to.not.equal(rpcBlock.parentHash)
  })
})

function isUpdateBeaconRootCall(beaconRoot: string): (call: Call) => boolean {
  return (call: Call) =>
    isSameAddress(call.caller, systemAddress) &&
    isSameAddress(call.address, systemBeaconRootsAddress) &&
    hexlify(call.input) === beaconRoot
}

function isUpdateParentBlockHash(parentHash: string): (call: Call) => boolean {
  return (call: Call) =>
    isSameAddress(call.caller, systemAddress) &&
    isSameAddress(call.address, systemHistoryStorageAddress) &&
    hexlify(call.input) === parentHash
}
