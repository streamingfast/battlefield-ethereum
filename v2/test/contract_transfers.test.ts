import { expect } from "chai"
import {
  knownExistingAddress,
  randomAddress3,
  randomAddress3Hex,
  randomAddress4,
  randomAddress4Hex,
} from "./lib/addresses"
import { Contract, contractCall, deployContract } from "./lib/ethereum"
import { oneWei } from "./lib/money"
import { Child, Transfers } from "../typechain-types"
import { ChildFactory, owner, TransfersFactory } from "./global"

describe("Contract transfers", function () {
  let Child: Contract<Child>
  let Transfers: Contract<Transfers>

  before(async () => {
    await Promise.all([
      deployContract<Child>(owner, ChildFactory, (c) => {
        Child = c
      }),
      deployContract<Transfers>(owner, TransfersFactory, (c) => {
        Transfers = c
      }),
    ])
  })

  it("Existing address", async function () {
    await expect(
      contractCall(owner, Transfers.nativeTransfer, [knownExistingAddress], { value: oneWei, gasLimit: 75000 })
    ).to.trxTraceEqualSnapshot("contract_transfers/existing_address.expected.json", {
      $contract: Transfers.addressHex,
    })
  })

  it("Inexistent address", async function () {
    await expect(
      contractCall(owner, Transfers.nativeTransfer, [randomAddress3], { value: oneWei, gasLimit: 95000 })
    ).to.trxTraceEqualSnapshot("contract_transfers/inexistent_address.expected.json", {
      $contract: Transfers.addressHex,
      $randomAddress3: randomAddress3Hex,
    })
  })

  it("Nested existing address", async function () {
    await expect(
      contractCall(owner, Transfers.nestedNativeTransfer, [Child.address, knownExistingAddress], {
        value: oneWei,
      })
    ).to.trxTraceEqualSnapshot("contract_transfers/nested_existing_address.expected.json", {
      $contract: Transfers.addressHex,
      $childContract: Child.addressHex,
    })
  })

  it("Nested inexistent address", async function () {
    await expect(
      contractCall(owner, Transfers.nestedNativeTransfer, [Child.address, randomAddress4], {
        value: oneWei,
      })
    ).to.trxTraceEqualSnapshot("contract_transfers/nested_inexistent_address.expected.json", {
      $contract: Transfers.addressHex,
      $childContract: Child.addressHex,
      $randomAddress4: randomAddress4Hex,
    })
  })
})
