import { expect } from "chai"
import { Contract, contractCall, deployAll, deployContract } from "./lib/ethereum"
import { Child, GrandChild, Main } from "../typechain-types"
import { ChildFactory, GrandChildFactory, MainFactory, owner } from "./global"

describe("Gas", function () {
  let Gas: Contract<Main>
  let Child: Contract<Child>
  let GrandChild: Contract<GrandChild>

  before(async () => {
    await deployAll(
      async () => (Gas = await deployContract(owner, MainFactory, [])),
      async () => (Child = await deployContract(owner, ChildFactory, []))
    )

    await deployAll(async () => (GrandChild = await deployContract(owner, GrandChildFactory, [Child.address, false])))
  })

  it("Empty call for lowest gas", async function () {
    await expect(contractCall(owner, Gas.emptyCallForLowestGas, [])).to.trxTraceEqualSnapshot(
      "gas/empty_call_for_lowest_gas.expected.json",
      {
        $gasContract: Gas.addressHex,
      }
    )
  })

  it("Nested low gas", async function () {
    await expect(contractCall(owner, Gas.nestedLowGas, [Child.address])).to.trxTraceEqualSnapshot(
      "gas/nested_low_gas.expected.json",
      {
        $gasContract: Gas.addressHex,
        $childContract: Child.addressHex,
      }
    )
  })

  it("Deep nested nested call for lowest gas", async function () {
    await expect(contractCall(owner, Gas.nestedCallForLowestGas, [Child.address])).to.trxTraceEqualSnapshot(
      "gas/deep_nested_nested_call_for_lowest_gas.expected.json",
      {
        $gasContract: Gas.addressHex,
        $childContract: Child.addressHex,
      }
    )
  })

  it("Deep nested low gas", async function () {
    await expect(
      contractCall(owner, Gas.deepNestedLowGas, [Child.address, GrandChild.address])
    ).to.trxTraceEqualSnapshot("gas/deep_nested_low_gas.expected.json", {
      $gasContract: Gas.addressHex,
      $childContract: Child.addressHex,
      $grandChildContract: GrandChild.addressHex,
    })
  })

  it("Deep nested call for lowest gas", async function () {
    await expect(
      contractCall(owner, Gas.deepNestedCallForLowestGas, [Child.address, GrandChild.address])
    ).to.trxTraceEqualSnapshot("gas/deep_nested_call_for_lowest_gas.expected.json", {
      $gasContract: Gas.addressHex,
      $childContract: Child.addressHex,
      $grandChildContract: GrandChild.addressHex,
    })
  })
})
