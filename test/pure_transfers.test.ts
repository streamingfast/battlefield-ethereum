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
import { owner, ownerAddress } from "./global"
import { isArbitrum, isNetworkOneOf } from "./lib/network"
import { canSkipFreshChainOnlyTests } from "./lib/mocha"

describe("Pure transfers", function () {
  it("Existing address", async function () {
    await expect(sendEth(owner, knownExistingAddress, oneWei)).to.trxTraceEqualSnapshot(
      "pure_transfers/existing_address.expected.json",
      undefined,
    )
  })

  it("Existing address with custom gas limit", async function () {
    // Deliberate EVM gas-boundary test: it sets a fixed gas limit tuned to canonical EVM
    // intrinsic-gas accounting. ArbOS redefines intrinsic gas (L1-data component), so the tx is
    // rejected pre-inclusion rather than mined-then-reverted. Skip on Arbitrum until block v5.
    if (isArbitrum()) {
      this.skip()
    }
    await expect(
      sendEth(owner, knownExistingAddress, oneWei, {
        gasLimit: 75000,
      }),
    ).to.trxTraceEqualSnapshot("pure_transfers/existing_address_custom_gas_limit.expected.json", undefined)
  })

  it("Inexistent address", async function () {
    // Ensures the address has no balance, not perfect has account could exists, but unlikely
    expect(await getBalance(randomAddress1)).to.equal(0)

    await expect(sendEth(owner, randomAddress1, oneWei)).to.trxTraceEqualSnapshot(
      "pure_transfers/inexistent_address.expected.json",
      {
        $randomAddress1: randomAddress1Hex,
      },
    )
  })

  it("0 ETH to inexistent address", async function () {
    // Ensures the address has no balance
    expect(await getBalance(randomAddress2)).to.equal(0)

    await expect(sendEth(owner, randomAddress2, 0)).to.trxTraceEqualSnapshot(
      "pure_transfers/zero_eth_inexistent_address.expected.json",
      {
        $randomAddress2: randomAddress2Hex,
      },
    )
  })

  it("Transfer to precompiled address with balance", async function () {
    // Deliberate EVM gas-boundary test: it sets a fixed gas limit tuned to canonical EVM
    // intrinsic-gas accounting. ArbOS redefines intrinsic gas (L1-data component), so the tx is
    // rejected pre-inclusion rather than mined-then-reverted. Skip on Arbitrum until block v5.
    if (isArbitrum()) {
      this.skip()
    }
    await expect(sendEth(owner, precompileWithBalanceAddress, oneWei, { gasLimit: 300000 })).to.trxTraceEqualSnapshot(
      "pure_transfers/precompiled_address_with_balance.json",
      {
        $precompileAddress: precompileWithBalanceAddressHex,
      },
    )
  })

  it("Self transfer (caller == recipient)", async function () {
    await expect(sendEth(owner, ownerAddress, oneWei)).to.trxTraceEqualSnapshot(
      "pure_transfers/self_transfer.expected.json",
      {
        $ownerAddress: ownerAddress.toLowerCase().slice(2),
      },
    )
  })

  it("Transfer to precompiled address without balance", async function () {
    // Deliberate EVM gas-boundary test: it sets a fixed gas limit tuned to canonical EVM
    // intrinsic-gas accounting. ArbOS redefines intrinsic gas (L1-data component), so the tx is
    // rejected pre-inclusion rather than mined-then-reverted. Skip on Arbitrum until block v5.
    if (isArbitrum()) {
      this.skip()
    }
    if (isNetworkOneOf("op-geth-devnet", "op-reth-devnet", "world-chain-devnet")) {
      // On Optimism devnet, the precompile at address 0x0000000000000000000000000000000000000808 have balance, so we cannot run this test,
      // there is no much we can do about it, skipping the test for this network.
      this.skip()
    }

    // This is a tricky test as once run, the address will have a balance so it cannot run twice.
    if ((await getBalance(precompileWithoutBalanceAddress)) !== 0n) {
      if (canSkipFreshChainOnlyTests()) {
        this.skip()
      }

      throw new Error(
        `This tests requires that the precompile at address ${precompileWithoutBalanceAddress} has no balance but ` +
          `this was not the case. This is a one-time test sadly, you must restart the chain to run the test again. If you are ` +
          `running for development purposes, you can set SKIP_FRESH_CHAIN_ONLY_TESTS=1 to skip this tests (and any other that ` +
          `requires a fresh chain to run).`,
      )
    }

    await expect(
      sendEth(owner, precompileWithoutBalanceAddress, oneWei, { gasLimit: 300000 }),
    ).to.trxTraceEqualSnapshot("pure_transfers/precompiled_address_without_balance.json", {
      $precompileAddress: precompileWithoutBalanceAddressHex,
    })
  })
})
