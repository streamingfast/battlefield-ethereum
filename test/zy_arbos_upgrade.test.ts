import { expect } from "chai"
import { Interface, concat, hexlify, keccak256, toBigInt } from "ethers"
import hre from "hardhat"
import { ownerAddress } from "./global"
import { fetchFirehoseTransactionAndBlock } from "./lib/firehose"
import { isSameAddress } from "./lib/addresses"
import { isNetwork } from "./lib/network"
import { ARBOS_STATE, ARB_SYS, sendData } from "./lib/arbos"
import { TransactionTrace_Type } from "../pb/sf/ethereum/type/v2/type_pb"

/**
 * An ArbOS version upgrade, scheduled through ArbOwner and applied by the internal start-block
 * transaction of the next block. The dev chain lets anyone become chain owner through ArbDebug.
 *
 * Named so it sorts after every other suite: the other suites keep running on the genesis ArbOS
 * version, and the block comparison that sorts last covers the upgrade block. It runs once per
 * chain until the latest version, on a fresh chain for a full suite run.
 */

const ARB_OWNER = "0x0000000000000000000000000000000000000070"
const ARB_DEBUG = "0x00000000000000000000000000000000000000ff"

// ArbSys.arbOSVersion() reports the ArbOS version plus this offset.
const ARBOS_VERSION_OFFSET = 55n
// Must not exceed `params.MaxArbosVersionSupported` of the Nitro under test, the node stops on
// an upgrade to a version it does not know.
const LATEST_ARBOS_VERSION = 61n

// The ArbOS version is the uint64 at offset 0 of the root ArbOS storage, which Nitro maps to the
// first 31 bytes of keccak256 of the key's first 31 bytes, followed by the key's last byte.
const ARBOS_VERSION_SLOT = concat([keccak256(new Uint8Array(31)).slice(0, 2 + 31 * 2), "0x00"])

const arbSys = new Interface(["function arbOSVersion() view returns (uint256)"])
const arbDebug = new Interface(["function becomeChainOwner()"])
const arbOwner = new Interface(["function scheduleArbOSUpgrade(uint64 newVersion, uint64 timestamp)"])

describe("ArbOS upgrade", function () {
  let fromVersion: bigint

  before(async function () {
    if (!isNetwork("arbitrum-nitro-dev")) {
      this.skip()
    }

    fromVersion = await arbOSVersion()
    if (fromVersion >= LATEST_ARBOS_VERSION) {
      this.skip()
    }
  })

  it("Next block's internal transaction records the version change", async function () {
    const toVersion = fromVersion + 1n

    await sendData(ARB_DEBUG, arbDebug.encodeFunctionData("becomeChainOwner"))
    await sendData(ARB_OWNER, arbOwner.encodeFunctionData("scheduleArbOSUpgrade", [toVersion, 0]))

    // The upgrade runs when the next block starts, before this transaction.
    const result = await sendData(ownerAddress, "0x")
    expect(await arbOSVersion()).to.equal(toVersion)

    const { block } = await fetchFirehoseTransactionAndBlock(result)
    const internal = block.transactionTraces[0]
    expect(internal.type).to.equal(TransactionTrace_Type.TRX_TYPE_ARBITRUM_INTERNAL)

    const versionChanges = internal.calls
      .flatMap((call) => call.storageChanges)
      .filter((change) => isSameAddress(hexlify(change.address), ARBOS_STATE))
      .filter((change) => hexlify(change.key) === ARBOS_VERSION_SLOT)
    expect(versionChanges.map((change) => [toBigInt(change.oldValue), toBigInt(change.newValue)])).to.deep.equal([
      [fromVersion, toVersion],
    ])
  })
})

async function arbOSVersion(): Promise<bigint> {
  const data = await hre.ethers.provider.call({ to: ARB_SYS, data: arbSys.encodeFunctionData("arbOSVersion") })
  return BigInt(data) - ARBOS_VERSION_OFFSET
}
