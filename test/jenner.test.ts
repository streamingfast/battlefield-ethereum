import { expect } from "chai"
import { AbiCoder, Interface, hexlify, id, toBigInt } from "ethers"
import hre from "hardhat"
import { owner, ownerAddress } from "./global"
import { defaultGasPrice } from "./lib/ethereum"
import { waitForTransaction } from "./lib/ethers"
import { fetchFirehoseTransactionAndBlock } from "./lib/firehose"
import { knownExistingAddress } from "./lib/addresses"

/**
 * BSC Jenner fork (BEP-718): the millisecond timestamp precompile (BEP-706) and the CAS20
 * stateful precompiles (BEP-702). A CAS20 call writes storage, code and logs from native code,
 * and the trace must carry them in write order, with intermediate values, and keep them when the
 * call reverts, as geth's hooked state does.
 *
 * The chain must run the Jenner miner (`scripts/bnb/up.sh -c -j`), whose genesis makes the
 * battlefield owner the CAS20 ActivationRegistry admin. On any other chain the registry has no
 * code and every test is skipped.
 */

const MILLI_TIMESTAMP_PRECOMPILE = "0x0000000000000000000000000000000000000070"
const ACTIVATION_REGISTRY = "0x7020000000000000000000000000000000000001"
const CAS20_FACTORY = "0xCA5F000000000000000000000000000000000000"
const VARIANT_ASSET = 0
const FEATURE_ASSET = id("bsc.cas20_asset")

const registry = new Interface([
  "function activate(bytes32 feature)",
  "function deactivate(bytes32 feature)",
  "function isActivated(bytes32 feature) view returns (bool)",
])
const factory = new Interface(["function createCAS20(uint8 variant, bytes32 salt, bytes params, bytes[] initCalls)"])
const token = new Interface([
  "function mint(address to, uint256 amount)",
  "function transfer(address to, uint256 amount)",
])

describe("Jenner", function () {
  before(async function () {
    if ((await hre.ethers.provider.getCode(ACTIVATION_REGISTRY)) === "0x") {
      this.skip()
    }
  })

  it("Millisecond timestamp precompile returns the block time in milliseconds", async function () {
    const result = await sendData(MILLI_TIMESTAMP_PRECOMPILE, "0x", false)
    const { trace, block } = await fetchFirehoseTransactionAndBlock(result)

    const call = trace.calls[0]
    expect(call.statusFailed).to.equal(false)
    expect(call.returnData).to.have.length(32)
    const millis = toBigInt(call.returnData)
    expect(millis / 1000n).to.equal(block.header!.timestamp!.seconds)
  })

  describe("CAS20", function () {
    let tokenAddressHex: string

    it("Admin activates the asset feature", async function () {
      if (await isActivated(FEATURE_ASSET)) {
        await sendData(ACTIVATION_REGISTRY, registry.encodeFunctionData("deactivate", [FEATURE_ASSET]), false)
      }

      await expect(
        sendData(ACTIVATION_REGISTRY, registry.encodeFunctionData("activate", [FEATURE_ASSET]), false),
      ).to.trxTraceEqualSnapshot("jenner/cas20_activate_feature")
    })

    it("Token creation records code, storage and logs in write order", async function () {
      // Two mints of the same balance slot: the trace must carry the intermediate value.
      const { data, salt } = createCAS20Data([mint(ownerAddress, 1000n), mint(ownerAddress, 500n)])
      const tokenAddress = await predictToken(data)
      tokenAddressHex = tokenAddress.toLowerCase().slice(2)

      await expect(sendData(CAS20_FACTORY, data, false)).to.trxTraceEqualSnapshot("jenner/cas20_create_token", {
        $token: tokenAddressHex,
        $salt: salt,
      })
    })

    it("Token transfer", async function () {
      await expect(
        sendData(`0x${tokenAddressHex}`, token.encodeFunctionData("transfer", [knownExistingAddress, 100n]), false),
      ).to.trxTraceEqualSnapshot("jenner/cas20_token_transfer", {
        $token: tokenAddressHex,
      })
    })

    it("Reverted token creation keeps its writes in the trace", async function () {
      // The second init call mints to the zero address, which reverts the whole creation after the
      // token code, its metadata and the first mint were written.
      const { data, salt } = createCAS20Data([
        mint(ownerAddress, 1n),
        mint("0x0000000000000000000000000000000000000000", 1n),
      ])
      const result = await sendData(CAS20_FACTORY, data, true)
      const { trace, block } = await fetchFirehoseTransactionAndBlock(result)

      const call = trace.calls[0]
      expect(call.stateReverted).to.equal(true)
      expect(call.codeChanges).to.have.length(1, "the token code install stays in the reverted call")
      expect(call.storageChanges).to.not.be.empty
      expect(call.logs).to.not.be.empty

      await expect([result, trace, block]).to.trxTraceEqualSnapshot("jenner/cas20_create_token_reverted", {
        $token: hexlify(call.codeChanges[0].address).slice(2),
        $salt: salt,
      })
    })
  })
})

async function sendData(to: string, data: string, shouldRevert: boolean) {
  const response = await owner.sendTransaction({ to, data, gasLimit: 2_000_000, gasPrice: defaultGasPrice })
  return waitForTransaction(response, shouldRevert)
}

async function isActivated(feature: string): Promise<boolean> {
  const ret = await hre.ethers.provider.call({
    to: ACTIVATION_REGISTRY,
    data: registry.encodeFunctionData("isActivated", [feature]),
  })
  return registry.decodeFunctionResult("isActivated", ret)[0]
}

/**
 * A createCAS20 call for an asset token administered by the owner, and its salt as snapshot hex.
 * The salt is random so the test can run again on the same chain, and has no zero byte so the
 * calldata gas is the same every run.
 */
function createCAS20Data(initCalls: string[]): { data: string; salt: string } {
  const salt = crypto.getRandomValues(new Uint8Array(32)).map((b) => b | 1)
  const params = AbiCoder.defaultAbiCoder().encode(
    ["tuple(uint256,string,string,address,uint8)"],
    [[1, "Battlefield Token", "BFT", ownerAddress, 18]],
  )
  return {
    data: factory.encodeFunctionData("createCAS20", [VARIANT_ASSET, salt, params, initCalls]),
    salt: hexlify(salt).slice(2),
  }
}

function mint(to: string, amount: bigint): string {
  return token.encodeFunctionData("mint", [to, amount])
}

/** The factory returns the new token address, so a simulated call predicts it. */
async function predictToken(data: string): Promise<string> {
  const ret = await hre.ethers.provider.call({ from: ownerAddress, to: CAS20_FACTORY, data })
  return AbiCoder.defaultAbiCoder().decode(["address"], ret)[0]
}
