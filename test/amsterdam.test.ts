import { expect } from "chai"
import { mustGetRpcBlock, sendEth, contractCall, deployContract, getStableCreate2Data } from "./lib/ethereum"
import { fetchFirehoseBlock, fetchFirehoseTransactionAndBlock } from "./lib/firehose"
import { isBlockOnAmsterdamOrLater } from "./lib/chain_eips"
import { Log, TransactionTrace } from "../pb/sf/ethereum/type/v2/type_pb"
import { owner, ownerAddress, ContractEmptyFactory, SuicidalFactory, TransfersFactory } from "./global"
import { oneWei } from "./lib/money"
import { systemAddress, isSameAddress, knownExistingAddress } from "./lib/addresses"
import { hexlify, toBigInt } from "ethers"
import hre from "hardhat"

/**
 * Amsterdam (Glamsterdam) fork tests, covering the five Firehose-visible EIPs shipped by
 * the StreamingFast reth fork: EIP-7708 (ETH transfer logs), EIP-7843 (SLOTNUM opcode),
 * EIP-7928 (block access lists), EIP-8037 (state gas), and EIP-8282 (builder execution
 * requests). EIP-8246 (SELFDESTRUCT no longer burns) is covered in test/suicide.test.ts,
 * next to the pre-Amsterdam behaviour it contrasts with.
 *
 * If the connected chain does not support Amsterdam (no slotNumber in block header),
 * every test returns successfully without assertions.
 */

const ETH_TRANSFER_LOG_TOPIC = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"

// Probe contract deployed at genesis (see scripts/geth_dev/genesis.amsterdam.json): runtime
// bytecode `SLOTNUM PUSH0 MSTORE PUSH1 0x20 PUSH0 RETURN` returns the current block's slot
// number.
const SLOTNUM_PROBE_ADDRESS = "0x00000000000000000000000000000000534c4f54"

// EIP-8282 builder execution request predeploys, also injected at genesis.
const BUILDER_DEPOSIT_ADDRESS = "0x0000bFF46984e3725691FA540a8C7589300D8282"
const BUILDER_EXIT_ADDRESS = "0x000064D678505ad48F8cCb093BC65613800E8282"
const EXCESS_INHIBITOR = (1n << 256n) - 1n

// EIP-8037 constants.
const TX_GAS_LIMIT_CAP = 16_777_216
const CPSB = 1530n
const SSTORE_SET_BYTES = 64n
const STATE_GAS_FOR_FRESH_SSTORE = SSTORE_SET_BYTES * CPSB // 97,920

describe("Amsterdam", function () {
  before(async function () {
    const rpcBlock = await mustGetRpcBlock("latest")
    if (!isBlockOnAmsterdamOrLater(rpcBlock)) {
      this.skip()
    }
  })

  describe("EIP-7708 - ETH transfer logs", function () {
    it("transaction's own value transfer emits a Transfer log from the system address", async function () {
      const response = await sendEth(owner, knownExistingAddress, oneWei)
      const { trace } = await fetchFirehoseTransactionAndBlock(response)

      const log = findTransferLog(trace)
      expect(log, "expected a Transfer log emitted by the system address").to.not.be.undefined
      expect(isSameAddress(addressFromTopic(log!.topics[1]), ownerAddress)).to.be.true
      expect(isSameAddress(addressFromTopic(log!.topics[2]), knownExistingAddress)).to.be.true
      expect(toBigInt(log!.data)).to.equal(1n, "log data must be the transferred amount (1 wei)")
    })

    it("value-transferring CALL emits a Transfer log", async function () {
      const Transfers = await deployContract(owner, TransfersFactory, [])
      const response = await contractCall(owner, Transfers.nativeTransfer, [knownExistingAddress], { value: oneWei })
      const { trace } = await fetchFirehoseTransactionAndBlock(response)

      // Sending value directly to Transfers' own call also emits the transaction's own
      // value-transfer log (owner -> Transfers), so match the specific from/to for the inner
      // CALL rather than taking the first Transfer log found.
      const log = allTransferLogs(trace).find((l) => isSameAddress(addressFromTopic(l.topics[1]), Transfers.address))
      expect(log, "expected a Transfer log for the value-transferring CALL").to.not.be.undefined
      expect(isSameAddress(addressFromTopic(log!.topics[2]), knownExistingAddress)).to.be.true
    })

    it("value-transferring CREATE2 emits a Transfer log", async function () {
      const AmsterdamHelperFactory = await hre.ethers.getContractFactory("AmsterdamHelper")
      const helper = await deployContract(owner, AmsterdamHelperFactory, [])
      const PayableEmptyFactory = await hre.ethers.getContractFactory("PayableEmpty")
      const create2Data = getStableCreate2Data(helper.address, PayableEmptyFactory)

      const response = await contractCall(
        owner,
        helper.create2WithValue,
        [PayableEmptyFactory.bytecode, "0x" + create2Data.salt],
        { value: oneWei },
      )
      const { trace } = await fetchFirehoseTransactionAndBlock(response)

      // Same reasoning as the CALL case above: match the specific from/to for the inner
      // CREATE2, not just the first Transfer log in the trace.
      const log = allTransferLogs(trace).find((l) => isSameAddress(addressFromTopic(l.topics[1]), helper.address))
      expect(log, "expected a Transfer log for the value-transferring CREATE2").to.not.be.undefined
      expect(isSameAddress(addressFromTopic(log!.topics[2]), "0x" + create2Data.address)).to.be.true
    })

    it("value-transferring SELFDESTRUCT emits a Transfer log", async function () {
      const Suicidal = await deployContract(owner, SuicidalFactory, [])
      await sendEth(owner, Suicidal.address, oneWei, { gasLimit: 42_000 })

      const response = await contractCall(owner, Suicidal.kill, [])
      const { trace } = await fetchFirehoseTransactionAndBlock(response)

      const log = findTransferLog(trace)
      expect(log, "expected a Transfer log for the value-transferring SELFDESTRUCT").to.not.be.undefined
      expect(isSameAddress(addressFromTopic(log!.topics[1]), Suicidal.address)).to.be.true
      expect(isSameAddress(addressFromTopic(log!.topics[2]), ownerAddress)).to.be.true
    })

    it("withdrawals, coinbase fee payment, and base-fee burn do not emit a Transfer log", async function () {
      const response = await sendEth(owner, knownExistingAddress, oneWei)
      const { trace, block } = await fetchFirehoseTransactionAndBlock(response)

      // Exactly one Transfer log: the transaction's own value transfer. If coinbase fee
      // payment or the base-fee burn produced a log too, there would be more than one.
      const transferLogs = allTransferLogs(trace)
      expect(transferLogs).to.have.length(1, "only the value transfer itself should emit a Transfer log")

      // Validator withdrawals (EIP-4895) are applied outside the EVM journal entirely and
      // never reach the EIP-7708 hook. On a --dev chain there are usually none; if there
      // are, none of them should show up as a Transfer log from the system address either.
      for (const withdrawal of block.withdrawals) {
        const matchesWithdrawal = transferLogs.some((log) =>
          isSameAddress(addressFromTopic(log.topics[2]), withdrawal.address),
        )
        expect(matchesWithdrawal, "a validator withdrawal must not emit a Transfer log").to.be.false
      }
    })
  })

  describe("EIP-7843 - SLOTNUM opcode", function () {
    it("SLOTNUM opcode returns the current block's slot number", async function () {
      const rpcBlock = await mustGetRpcBlock("latest")
      expect(rpcBlock.slotNumber, "expected slotNumber on the block header").to.not.be.undefined

      const result = await hre.ethers.provider.call({ to: SLOTNUM_PROBE_ADDRESS })
      expect(toBigInt(result)).to.equal(
        toBigInt(rpcBlock.slotNumber!),
        "SLOTNUM opcode must return the current block's slot number",
      )
    })

    it("Firehose block header carries slot_number", async function () {
      const response = await sendEth(owner, knownExistingAddress, oneWei)
      const { block } = await fetchFirehoseTransactionAndBlock(response)

      expect(block.header?.slotNumber, "expected slotNumber on the Firehose block header").to.not.be.undefined
    })
  })

  describe("EIP-7928 - Block access lists", function () {
    it("Firehose block header carries block_access_list_hash and block_access_list_rlp", async function () {
      const response = await sendEth(owner, knownExistingAddress, oneWei)
      const { block } = await fetchFirehoseTransactionAndBlock(response)

      expect(block.header?.blockAccessListHash, "expected blockAccessListHash on the block header").to.not.be.undefined
      expect(block.header!.blockAccessListHash!).to.have.length(32, "blockAccessListHash must be a 32-byte hash")

      expect(block.header?.blockAccessListRlp, "expected blockAccessListRlp on the block header").to.not.be.undefined
      expect(block.header!.blockAccessListRlp!.length).to.be.above(
        0,
        "blockAccessListRlp must be non-empty: the block touches at least the sender, recipient, and coinbase",
      )
    })
  })

  describe("EIP-8037 - state gas", function () {
    it("Call.gas_consumed includes state gas drawn from the transaction's reservoir", async function () {
      const AmsterdamHelperFactory = await hre.ethers.getContractFactory("AmsterdamHelper")
      const helper = await deployContract(owner, AmsterdamHelperFactory, [])

      // Gas limit above TX_GAS_LIMIT_CAP (16,777,216) so state gas draws from the reservoir
      // rather than the regular gas pool. This is only permitted since EIP-8037 raised the
      // per-transaction gas limit cap; the Amsterdam genesis bumps the block gas limit to
      // accommodate it (see scripts/geth_dev/genesis.amsterdam.json).
      const response = await contractCall(owner, helper.setValue, [1], { gasLimit: TX_GAS_LIMIT_CAP + 3_000_000 })
      const { trace, block } = await fetchFirehoseTransactionAndBlock(response)

      const rootCall = trace.calls[0]
      // A fresh SSTORE (0 -> non-zero) costs SSTORE_SET_BYTES (64) * CPSB (1530) = 97,920
      // state gas. gas_consumed must include it even though it came out of the reservoir,
      // not the regular gas pool.
      expect(rootCall.gasConsumed).to.be.at.least(
        STATE_GAS_FOR_FRESH_SSTORE,
        "gas_consumed must include the state gas charged for the fresh SSTORE",
      )

      // header.gas_used = max(block_regular_gas_used, block_state_gas_used). This block
      // contains only this one transaction, whose state gas is exactly
      // STATE_GAS_FOR_FRESH_SSTORE (one fresh SSTORE) and whose regular component
      // (trace.gasUsed minus that state gas) is smaller, so gas_used must equal the state
      // component rather than the naive sum of receipt gas.
      const regularGas = trace.gasUsed - STATE_GAS_FOR_FRESH_SSTORE
      expect(regularGas).to.be.below(
        STATE_GAS_FOR_FRESH_SSTORE,
        "test assumption broken: regular gas must be the smaller component here",
      )
      expect(block.header!.gasUsed).to.equal(
        STATE_GAS_FOR_FRESH_SSTORE,
        "header.gas_used must equal max(regular, state) = the state gas component",
      )
    })
  })

  describe("EIP-8282 - builder execution requests", function () {
    it("activation block flips both predeploys' EXCESS_INHIBITOR sentinel to 0", async function () {
      // amsterdamTime is 0 in the genesis, so Amsterdam (and therefore EIP-8282) is active
      // from the chain's first block after genesis.
      const block = await fetchFirehoseBlock(1, { timeoutMs: 30_000 })

      for (const address of [BUILDER_DEPOSIT_ADDRESS, BUILDER_EXIT_ADDRESS]) {
        const call = block.systemCalls.find((c) => isSameAddress(c.address, address))
        expect(call, `expected a system call to the predeploy at ${address} on the activation block`).to.not.be
          .undefined

        const slotChange = call!.storageChanges.find((sc) => toBigInt(sc.key) === 0n)
        expect(slotChange, `expected a storage change on slot 0 for ${address}`).to.not.be.undefined
        expect(toBigInt(slotChange!.oldValue)).to.equal(
          EXCESS_INHIBITOR,
          `${address} slot 0 must start at the EXCESS_INHIBITOR sentinel`,
        )
        expect(toBigInt(slotChange!.newValue)).to.equal(0n, `${address} slot 0 must flip to 0 on activation`)
      }
    })
  })
})

/** All EIP-7708 Transfer logs (emitted from the system address) recorded in a transaction's receipt. */
function allTransferLogs(trace: TransactionTrace): Log[] {
  const logs = trace.receipt?.logs ?? []
  return logs.filter(
    (log) =>
      isSameAddress(log.address, systemAddress) &&
      log.topics.length === 3 &&
      hexlify(log.topics[0]) === ETH_TRANSFER_LOG_TOPIC,
  )
}

function findTransferLog(trace: TransactionTrace): Log | undefined {
  return allTransferLogs(trace)[0]
}

/** Extracts a 20-byte address from a 32-byte topic value (left-padded per the Solidity ABI). */
function addressFromTopic(topic: Uint8Array): string {
  return hexlify(topic.slice(12))
}
