import { expect } from "chai"
import { hexlify, Interface } from "ethers"
import hre from "hardhat"
import { Contract, contractCall, defaultGasPrice, deployAll, deployContract } from "./lib/ethereum"
import { waitForTransaction } from "./lib/ethers"
import { Main } from "../typechain-types"
import { MainFactory, owner } from "./global"
import { networkValue } from "./lib/network"
import { fetchFirehoseTransactionAndBlock } from "./lib/firehose"

// EIP-2929: cold SSTORE for a zero→nonzero slot costs COLD_SLOAD_COST (2100) + SSTORE_SET_GAS (20000)
const COLD_SSTORE_SET_GAS = 22100n

describe("Storages", function () {
  let Storage: Contract<Main>
  let oogStorageAddress: string
  let oogStorageAddressHex: string

  before(async () => {
    await deployAll(
      async () => (Storage = await deployContract(owner, MainFactory, [])),
      async () => {
        const factory = await hre.ethers.getContractFactory("OOGStorage")
        const contract = await factory.connect(owner).deploy()
        await contract.waitForDeployment()
        oogStorageAddress = await contract.getAddress()
        oogStorageAddressHex = oogStorageAddress.toLowerCase().slice(2)
      },
    )
  })

  it("Set long string & array", async function () {
    const customTx = networkValue({
      "sei-dev": { gasLimit: 1_525_000 },
      "optimism-devnet": { gasLimit: 1_525_000 },
      "*": {},
    })

    await expect(contractCall(owner, Storage.setLongString, [], customTx)).to.trxTraceEqualSnapshot(
      "storages/set_long_string.expected.json",
      {
        $storageContract: Storage.addressHex,
      },
    )

    await expect(contractCall(owner, Storage.setAfter, [])).to.trxTraceEqualSnapshot(
      "storages/set_long_again_and_array_update.expected.json",
      {
        $storageContract: Storage.addressHex,
      },
    )
  })

  // Replicates the Hoodi testnet tx 0x835d...59d6 discrepancy between Geth and Reth:
  // a SSTORE that happened before the OOG was missing from the Geth Firehose trace
  // but present in the Reth trace.
  //
  // Pattern: SSTORE → SHA256 precompile → SSTORE → OOG
  // Both storage changes must appear in the trace with state_reverted=true.
  it("Both storage writes before OOG appear in trace", async function () {
    const a = "0xb2300732a65a6fda46d9612e7ae2b0ca9f83d166e38e6d4b723c006f76cbf7dc"
    const b = "0x9df6b64338919f844529872976787ab91993cff90084b15f256646cde3532e13"

    // Storage slot keys (left-padded to 32 bytes)
    const SLOT_FIRST_WRITE = "0x" + "00".repeat(32) // slot 0
    const SLOT_SECOND_WRITE = "0x" + "00".repeat(31) + "01" // slot 1

    const OOGStorageABI = new Interface([
      "function writeIntermediateCallWrite(bytes32 a, bytes32 b) external",
      "function writeIntermediateCallWriteThenOOG(bytes32 a, bytes32 b) external",
    ])

    // Estimate gas for the clean version (no infinite loop), then subtract the cost
    // of the second cold SSTORE so that OOG fires exactly on that opcode — mirroring
    // the Hoodi scenario where only ~8 gas remained when the SSTORE was attempted.
    const estimatedGas = await hre.ethers.provider.estimateGas({
      to: oogStorageAddress,
      data: OOGStorageABI.encodeFunctionData("writeIntermediateCallWrite", [a, b]),
      gasPrice: defaultGasPrice,
    })
    const gasLimit = estimatedGas - COLD_SSTORE_SET_GAS

    const response = await owner.sendTransaction({
      to: oogStorageAddress,
      data: OOGStorageABI.encodeFunctionData("writeIntermediateCallWriteThenOOG", [a, b]),
      gasLimit,
      gasPrice: defaultGasPrice,
    })

    const result = await waitForTransaction(response, true)
    const { trace, block } = await fetchFirehoseTransactionAndBlock(result)
    const rootCall = trace.calls[0]

    expect(rootCall.stateReverted).to.be.true
    expect(rootCall.statusFailed).to.be.true
    expect(rootCall.failureReason).to.include("out of gas")

    expect(
      rootCall.storageChanges.some((c) => hexlify(c.key) === "0x" + "00".repeat(32)),
      `storage change for firstWrite (slot 0) must be present`,
    ).to.be.true

    await expect([result, trace, block]).to.trxTraceEqualSnapshot("storages/oog_two_writes_before_oog.expected.json", {
      $oogStorageContract: oogStorageAddressHex,
    })
  })
})
