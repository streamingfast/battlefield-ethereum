import { expect } from "chai"
import fs from "fs"
import path from "path"
import { owner } from "./global"
import { isNetworkOneOf } from "./lib/network"
import { defaultGasPrice } from "./lib/ethereum"
import { fetchFirehoseTransactionAndBlock } from "./lib/firehose"

/**
 * Regression repro for the Firehose-instrumented Reth "capacity overflow" panic.
 *
 * Replays Sepolia transaction
 *   0x1af75e6035f1ebc61a1149a340a6ea395e68dc0fc50d02aba86befe9907ef6cf  (block 8784485)
 * which calls selector 0xb757c638 on contract 0xa7327ae4e942cafeff54b240377a8ec30162dc55
 * and consumes its entire gas limit (20,979,492) — an out-of-gas revert. Tracing that block
 * with the instrumented Reth panics with a Rust "capacity overflow".
 *
 * The Sepolia transaction cannot be resubmitted verbatim (wrong chain id / nonce / sender), so
 * we reconstruct the same execution on the devnet:
 *   1. Deploy the exact runtime bytecode. The deploy init-stub writes `slot0 = msg.sender`
 *      so the contract's owner is our deployer — otherwise the onlyOwner guard on 0xb757c638
 *      would revert cheaply (Unauthorized(), selector 0x82b42900) and never reach the OOG path.
 *   2. Send the exact Sepolia calldata with the original 20,979,492 gas limit from that same
 *      owner. Execution consumes all gas (OOG revert), reproducing the block that crashes the
 *      instrumented Reth tracer.
 *
 * Fixture generated from the on-chain prestate (see
 * test/snapshots/prestate/reth-devnet/out_of_gas_revert/).
 */
describe("Reth capacity overflow (Sepolia OOG replay)", function () {
  before(function () {
    // Only meaningful against the Firehose-instrumented Reth.
    if (!isNetworkOneOf("reth-devnet", "reth-dev")) {
      this.skip()
    }
  })

  it("replays the out-of-gas transaction that crashes the Firehose Reth tracer", async function () {
    const fixture = JSON.parse(
      fs.readFileSync(path.join(__dirname, "snapshots/prestate/reth-devnet/out_of_gas_revert/replay.json"), "utf8"),
    )

    // 1. Deploy the Sepolia contract with slot0 = deployer (owner guard).
    const deployResponse = await owner.sendTransaction({
      data: fixture.deployData,
      gasPrice: defaultGasPrice,
      gasLimit: 3_000_000,
    })
    const deployReceipt = await deployResponse.wait(1, 60_000)
    const contractAddress = deployReceipt?.contractAddress
    expect(contractAddress, "contract deployment did not yield an address").to.not.be.null

    // 2. Call 0xb757c638 with the exact Sepolia calldata and gas limit → out-of-gas revert.
    //    This is the transaction that makes the instrumented Reth panic with "capacity overflow".
    const callResponse = await owner.sendTransaction({
      to: contractAddress!,
      data: fixture.calldata,
      gasLimit: fixture.gasLimit,
      gasPrice: defaultGasPrice,
    })

    // `.wait` rejects on a reverted tx; the revert (out of gas) is the expected outcome here.
    const receipt = await callResponse.wait(1, 60_000).catch(async () => {
      return owner.provider!.getTransactionReceipt(callResponse.hash)
    })

    expect(receipt, "out-of-gas transaction was never mined").to.not.be.null
    expect(receipt!.status, "transaction was expected to revert (out of gas)").to.equal(0)

    // The instrumented Reth used to panic ("capacity overflow") while tracing this block, which
    // killed the node before the block reached Firehose. Fetching the block+transaction back from
    // Firehose therefore proves the tracer survived and produced the trace. `fetchFirehoseTransactionAndBlock`
    // throws if the block is missing or the transaction is absent from it.
    const { trace } = await fetchFirehoseTransactionAndBlock(receipt!)

    const rootCall = trace.calls[0]
    expect(rootCall.statusFailed, "Firehose trace root call should be marked failed").to.be.true
    expect(rootCall.failureReason, "Firehose trace should report the out-of-gas failure").to.include("out of gas")
  })
})
