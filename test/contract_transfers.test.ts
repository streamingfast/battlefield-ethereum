import { expect } from "chai"
import {
  knownExistingAddress,
  randomAddress3,
  randomAddress3Hex,
  randomAddress4,
  randomAddress4Hex,
} from "./lib/addresses"
import { Contract, contractCall, deployAll, deployContract, koContractCall } from "./lib/ethereum"
import { oneWei } from "./lib/money"
import { Child, Transfers } from "../typechain-types"
import { ChildFactory, owner, TransfersFactory } from "./global"

describe("Contract transfers", function () {
  let Child: Contract<Child>
  let Transfers: Contract<Transfers>

  before(async () => {
    await deployAll(
      async () => (Child = await deployContract(owner, ChildFactory, [])),
      async () => (Transfers = await deployContract(owner, TransfersFactory, []))
    )
  })

  it("Existing address", async function () {
    await expect(
      contractCall(owner, Transfers.nativeTransfer, [knownExistingAddress], { value: oneWei })
    ).to.trxTraceEqualSnapshot("contract_transfers/existing_address.expected.json", {
      $contract: Transfers.addressHex,
    })
  })

  it("Existing address failing transaction", async function () {
    await expect(
      koContractCall(owner, Transfers.nativeTransfer, [knownExistingAddress], { value: oneWei, gasLimit: 22080 })
    ).to.trxTraceEqualSnapshot("contract_transfers/existing_address_failure.expected.json", {
      $contract: Transfers.addressHex,
    })
  })

  it("Inexistent address", async function () {
    await expect(
      contractCall(owner, Transfers.nativeTransfer, [randomAddress3], { value: oneWei })
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
