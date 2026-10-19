import { expect } from "chai"
import { AbiCoder, Interface, hexlify, id, keccak256, toBigInt } from "ethers"
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
const caller = new Interface([
  "function transferTwice(address token, address to, uint256 first, uint256 second)",
  "function transferThenRevert(address token, address to, uint256 amount)",
  "function transferWithGas(address token, address to, uint256 amount, uint256 callGas)",
])

// Holders that never receive tokens before their test, so crediting them is a zero to non-zero
// write (20,000 gas). Each run creates a new token, so they start empty every run.
const FRESH_HOLDER_1 = "0x1111111111111111111111111111111111111111"
const FRESH_HOLDER_2 = "0x2222222222222222222222222222222222222222"

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

    describe("called from a contract", function () {
      let callerAddressHex: string
      let callerAddress: string
      let vars: Record<string, string>

      before(async function () {
        const factory = await hre.ethers.getContractFactory("CAS20Caller")
        const contract = await factory.connect(owner).deploy()
        await contract.waitForDeployment()
        callerAddress = await contract.getAddress()
        callerAddressHex = callerAddress.toLowerCase().slice(2)
        vars = {
          $token: tokenAddressHex,
          $caller: callerAddressHex,
          $balanceSlotOfCaller: balanceSlot(callerAddress).slice(2),
        }

        await sendData(`0x${tokenAddressHex}`, token.encodeFunctionData("transfer", [callerAddress, 1000n]), false)
      })

      it("Two transfers interleave with the caller's logs", async function () {
        await expect(
          sendData(
            callerAddress,
            caller.encodeFunctionData("transferTwice", [`0x${tokenAddressHex}`, knownExistingAddress, 10n, 20n]),
            false,
          ),
        ).to.trxTraceEqualSnapshot("jenner/cas20_contract_transfer_twice", vars)
      })

      it("A transfer whose caller reverts keeps its writes in the trace", async function () {
        await expect(
          sendData(
            callerAddress,
            caller.encodeFunctionData("transferThenRevert", [`0x${tokenAddressHex}`, knownExistingAddress, 30n]),
            true,
          ),
        ).to.trxTraceEqualSnapshot("jenner/cas20_contract_transfer_then_revert", vars)
      })

      it("A transfer that runs out of gas on a write does not report that write", async function () {
        // The same transfer with ample gas first, to learn what it costs.
        const paid = await sendData(
          callerAddress,
          caller.encodeFunctionData("transferWithGas", [`0x${tokenAddressHex}`, FRESH_HOLDER_1, 40n, 1_000_000n]),
          false,
        )
        await expect(paid).to.trxTraceEqualSnapshot("jenner/cas20_contract_transfer_with_gas", vars)
        const { trace: paidTrace } = await fetchFirehoseTransactionAndBlock(paid)
        const transferGas = BigInt(paidTrace.calls[1].gasConsumed)

        // 10,000 gas short: the debit of the caller is paid, the credit of the fresh holder is
        // not, and enough gas is left to pass the 2,300-gas guard before it.
        const result = await sendData(
          callerAddress,
          caller.encodeFunctionData("transferWithGas", [
            `0x${tokenAddressHex}`,
            FRESH_HOLDER_2,
            40n,
            transferGas - 10_000n,
          ]),
          false,
        )
        const { trace, block } = await fetchFirehoseTransactionAndBlock(result)

        const transfer = trace.calls[1]
        expect(transfer.statusFailed).to.equal(true)
        expect(transfer.storageChanges).to.have.length(1, "only the debit of the caller is paid for")

        await expect([result, trace, block]).to.trxTraceEqualSnapshot("jenner/cas20_contract_transfer_oog", vars)
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

/** A token's balance slot for `holder`: the `balances` mapping of the `bsc.cas20` ERC-7201 namespace. */
function balanceSlot(holder: string): string {
  const coder = AbiCoder.defaultAbiCoder()
  const root = toBigInt(keccak256(coder.encode(["uint256"], [toBigInt(id("bsc.cas20")) - 1n]))) & ~0xffn
  const SLOT_BALANCES = 4n
  return keccak256(coder.encode(["address", "uint256"], [holder, root + SLOT_BALANCES]))
}

/** The factory returns the new token address, so a simulated call predicts it. */
async function predictToken(data: string): Promise<string> {
  const ret = await hre.ethers.provider.call({ from: ownerAddress, to: CAS20_FACTORY, data })
  return AbiCoder.defaultAbiCoder().decode(["address"], ret)[0]
}
