import { expect } from "chai"
import { Interface, Wallet, ZeroAddress, hexlify } from "ethers"
import hre from "hardhat"
import type { Context } from "mocha"
import { owner } from "./global"
import { contractCall, deployContract } from "./lib/ethereum"
import { TransactionReceiptResult } from "./lib/ethers"
import { fetchFirehoseTransactionAndBlock } from "./lib/firehose"
import { isSameAddress } from "./lib/addresses"
import { isNetwork } from "./lib/network"
import { canSkipFreshChainOnlyTests } from "./lib/mocha"
import { ARBOS_STATE, ARB_SYS, sendData } from "./lib/arbos"
import { ArbSysCaller__factory } from "../typechain-types"

/**
 * Calls to the ArbOS precompiles, which write ArbOS state, move value and emit logs from native
 * code. `zy_arbos_upgrade.test.ts` covers the ArbOS version upgrade.
 *
 * Retryables, deposits and other L1 to L2 messages need a parent chain and an inbox, a Nitro dev
 * chain has neither, so they are not covered. The suite runs on `arbitrum-nitro-dev` only.
 */

const ARB_ADDRESS_TABLE = "0x0000000000000000000000000000000000000066"

const arbSys = new Interface([
  "function withdrawEth(address destination) payable returns (uint256)",
  "function sendMerkleTreeState() view returns (uint256 size, bytes32 root, bytes32[] partials)",
  "event L2ToL1Tx(address caller, address indexed destination, uint256 indexed hash, uint256 indexed position, uint256 arbBlockNum, uint256 ethBlockNum, uint256 timestamp, uint256 callvalue, bytes data)",
])
const arbAddressTable = new Interface(["function register(address addr) returns (uint256)"])

const L1_DESTINATION = "0x00000000000000000000000000000000000a4b01"
const WITHDRAWN = 1000n

// The L2 to L1 message carries the block number and the time, which change from run to run.
// `expectL2ToL1Message` checks the logs instead.
const volatileLogFields = [
  "calls[].logs[].data",
  "calls[].logs[].topics",
  "receipt.logs[].data",
  "receipt.logs[].topics",
]

describe("ArbOS", function () {
  before(function () {
    if (!isNetwork("arbitrum-nitro-dev")) {
      this.skip()
    }
  })

  it("ArbSys withdrawEth burns the value and logs the L2 to L1 message", async function () {
    await requireOutboxSize(this, 0n)
    const result = await sendData(ARB_SYS, arbSys.encodeFunctionData("withdrawEth", [L1_DESTINATION]), WITHDRAWN)

    await expectL2ToL1Message(result, result.from)
    await expect(result).to.trxTraceEqualSnapshot(
      "arbos/arbsys_withdraw_eth",
      { $destination: L1_DESTINATION.slice(2) },
      { excludeFields: volatileLogFields },
    )
  })

  it("ArbSys withdrawEth called from a contract", async function () {
    await requireOutboxSize(this, 1n)
    const caller = await deployContract(owner, new ArbSysCaller__factory(), [])
    const result = await contractCall(owner, caller.withdraw, [L1_DESTINATION], { value: WITHDRAWN })

    await expectL2ToL1Message(result, caller.address)
    await expect(result).to.trxTraceEqualSnapshot(
      "arbos/arbsys_withdraw_eth_from_contract",
      { $caller: caller.addressHex, $destination: L1_DESTINATION.slice(2) },
      { excludeFields: volatileLogFields },
    )
  })

  it("ArbAddressTable register writes ArbOS state", async function () {
    // A new address each run, registering a known one returns its index without writing.
    const address = Wallet.createRandom().address
    const result = await sendData(ARB_ADDRESS_TABLE, arbAddressTable.encodeFunctionData("register", [address]))
    const { trace } = await fetchFirehoseTransactionAndBlock(result)

    const writes = trace.calls[0].storageChanges.filter((change) => isSameAddress(hexlify(change.address), ARBOS_STATE))
    expect(writes, "expected storage changes on the ArbOS state account").to.not.be.empty
  })
})

// Each message's position in the outbox decides its return value and how many outbox tree
// updates it logs, so the snapshots hold only for the first two messages of a chain.
async function requireOutboxSize(context: Context, expected: bigint) {
  const data = await hre.ethers.provider.call({
    from: ZeroAddress,
    to: ARB_SYS,
    data: arbSys.encodeFunctionData("sendMerkleTreeState"),
  })
  const [size] = arbSys.decodeFunctionResult("sendMerkleTreeState", data)
  if (size === expected) {
    return
  }

  if (canSkipFreshChainOnlyTests()) {
    context.skip()
  }

  throw new Error(
    `This test expects ${expected} earlier L2 to L1 messages but the outbox holds ${size}. It needs a fresh chain ` +
      `with the ArbOS tests run in order, restart the chain or set SKIP_FRESH_CHAIN_ONLY_TESTS=1 to skip it.`,
  )
}

// The Firehose logs must match the node's receipt, and the message must name the caller, the
// destination and the value.
async function expectL2ToL1Message(result: TransactionReceiptResult, caller: string) {
  const { trace } = await fetchFirehoseTransactionAndBlock(result)

  const traceLogs = trace.calls.flatMap((call) => call.logs).sort((a, b) => a.index - b.index)
  expect(
    traceLogs.map((log) => [hexlify(log.address), log.topics.map((topic) => hexlify(topic)), hexlify(log.data)]),
  ).to.deep.equal(result.logs.map((log) => [log.address.toLowerCase(), log.topics, log.data]))

  const message = result.logs
    .filter((log) => isSameAddress(log.address, ARB_SYS))
    .map((log) => arbSys.parseLog(log))
    .find((log) => log?.name === "L2ToL1Tx")
  expect(message, "expected an L2ToL1Tx log from ArbSys").to.not.be.undefined
  expect(isSameAddress(message!.args.caller, caller)).to.equal(true)
  expect(isSameAddress(message!.args.destination, L1_DESTINATION)).to.equal(true)
  expect(message!.args.callvalue).to.equal(WITHDRAWN)
  expect(message!.args.arbBlockNum).to.equal(BigInt(result.blockNumber))
}
