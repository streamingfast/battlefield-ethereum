import { expect } from "chai"
import {
  knownExistingAddress,
  precompileWithBalanceAddress,
  precompileWithBalanceAddressHex,
  precompileWithoutBalanceAddress,
  precompileWithoutBalanceAddressHex,
  randomAddress1,
  randomAddress1Hex,
  randomAddress2,
  randomAddress2Hex,
} from "./lib/addresses"
import { getBalance, sendEth } from "./lib/ethereum"
import { oneWei } from "./lib/money"
import { owner } from "./global"

describe("Pure transfers", function () {
  it("Existing address", async function () {
    await expect(sendEth(owner, knownExistingAddress, oneWei)).to.trxTraceEqualSnapshot(
      "pure_transfers/existing_address.expected.json"
    )
  })

  it("Existing address with custom gas limit", async function () {
    await expect(
      sendEth(owner, knownExistingAddress, oneWei, {
        gasLimit: 75000,
      })
    ).to.trxTraceEqualSnapshot("pure_transfers/existing_address_custom_gas_limit.expected.json")
  })

  it("Inexistent address", async function () {
    // Ensures the address has no balance, not perfect has account could exists, but unlikely
    expect(await getBalance(randomAddress1)).to.equal(0)

    await expect(sendEth(owner, randomAddress1, oneWei)).to.trxTraceEqualSnapshot(
      "pure_transfers/inexistent_address.expected.json",
      {
        $randomAddress1: randomAddress1Hex,
      }
    )
  })

  it("0 ETH to inexistent address", async function () {
    // Ensures the address has no balance
    expect(await getBalance(randomAddress2)).to.equal(0)

    await expect(sendEth(owner, randomAddress2, 0)).to.trxTraceEqualSnapshot(
      "pure_transfers/zero_eth_inexistent_address.expected.json",
      {
        $randomAddress2: randomAddress2Hex,
      }
    )
  })

  it("Transfer to precompiled address with balance", async function () {
    await expect(sendEth(owner, precompileWithBalanceAddress, oneWei, { gasLimit: 300000 })).to.trxTraceEqualSnapshot(
      "pure_transfers/precompiled_address_with_balance.json",
      {
        $precompileAddress: precompileWithBalanceAddressHex,
      }
    )
  })

  it("Transfer to precompiled address without balance", async function () {
    // This is a tricky test as once run, the address will have a balance so it cannot run twice.
    if ((await getBalance(precompileWithoutBalanceAddress)) !== 0n) {
      if (canSkipFreshChainOnlyTests()) {
      }

      throw new Error(
        `This tests requires that the precompile at address ${precompileWithoutBalanceAddress} has no balance but ` +
          `this was not the case. This is a one-time test sadly, you must restart the chain to run the test again. If you are ` +
          `running for development purposes, you can set SKIP_FRESH_CHAIN_ONLY_TESTS=1 to skip this tests (and any other that ` +
          `requires a fresh chain to run).`
      )
    }

    await expect(
      sendEth(owner, precompileWithoutBalanceAddress, oneWei, { gasLimit: 300000 })
    ).to.trxTraceEqualSnapshot(
      "pure_transfers/precompiled_address_without_balance.json",
      {
        $precompileAddress: precompileWithoutBalanceAddressHex,
      },
      {
        networkSnapshotOverrides: [
          // Arbitrum Geth uses Firehose 3.0-beta tracer but using backwards compatibility mode
          // generating Firehose 2.3 block model. However the tracer had a bug not correctly aligning
          // with Firehose 2.3 model when a precompile address was being transferred some ETH while
          // it never had a balance before.
          //
          // Firehose 2.3 model is generating `"accountCreations": [{"account": "$precompileAddress","ordinal": "5"}]`
          // while bogus Arbitrum Geth model generates `accountCreations: []`.
          "arbitrum-geth-dev",
        ],
      }
    )
  })
})

function canSkipFreshChainOnlyTests(): boolean {
  if (!process.env.SKIP_FRESH_CHAIN_ONLY_TESTS || process.env.SKIP_FRESH_CHAIN_ONLY_TESTS === "false") {
    return false
  }

  if (process.env.SNAPSHOTS_UPDATE && process.env.SNAPSHOTS_UPDATE !== "false") {
    throw new Error(
      `You are running with snapshots update enabled, you cannot skip tests that require a fresh chain to run as it wouldn't update the snapshot.`
    )
  }

  console.warn(
    "[Skipped] You are skipping a test that requires a fresh chain to run, ensure you are not validating your Firehose tracer while skipping any tests!"
  )

  return true
}
