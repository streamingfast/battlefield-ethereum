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
import { sendEth } from "./lib/ethereum"
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
    await expect(sendEth(owner, randomAddress1, oneWei)).to.trxTraceEqualSnapshot(
      "pure_transfers/inexistent_address.expected.json",
      {
        $randomAddress1: randomAddress1Hex,
      }
    )
  })

  it("0 ETH to inexistent address", async function () {
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
    await expect(
      sendEth(owner, precompileWithoutBalanceAddress, oneWei, { gasLimit: 300000 })
    ).to.trxTraceEqualSnapshot("pure_transfers/precompiled_address_without_balance.json", {
      $precompileAddress: precompileWithoutBalanceAddressHex,
    })
  })
})
