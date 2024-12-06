import { expect } from "chai"
import {
  Contract,
  contractCall,
  deployAll,
  deployContract,
  deployStableContractCreator,
  getCreateAddressHex,
  koContractCall,
} from "./lib/ethereum"
import { Calls, Child, GrandChild } from "../typechain-types"
import { CallsFactory, ChildFactory, GrandChildFactory, owner, TransfersFactory } from "./global"
import { oneWei, wei } from "./lib/money"
import { randomAddress5, randomAddress5Hex } from "./lib/addresses"

const callsGasLimit = 3_500_000

describe("Calls", function () {
  let Calls: Contract<Calls>
  let Child: Contract<Child>

  before(async () => {
    await deployAll(
      async () => (Calls = await deployContract(owner, CallsFactory, [], { gasLimit: callsGasLimit })),
      async () => (Child = await deployContract(owner, ChildFactory, []))
    )
  })

  it("Complete call tree", async function () {
    let Calls: Contract<Calls>
    let GrandChild: Contract<GrandChild>

    await deployAll(
      async () =>
        (Calls = await deployStableContractCreator(owner, CallsFactory, [], 1, 1, { gasLimit: callsGasLimit })),
      async () => (GrandChild = await deployContract(owner, GrandChildFactory, [Child.address, false]))
    )

    await expect(
      contractCall(owner, Calls!.completeCallTree, [Child.address, GrandChild!.address])
    ).to.trxTraceEqualSnapshot("calls/complete_call_tree.expected.json", {
      $callsContract: Calls!.addressHex,
      $callsCreatedContract: getCreateAddressHex(Calls!.address, 1),
      $childContract: Child.addressHex,
      $grandChildContract: GrandChild!.addressHex,
    })
  })

  it("Delegate with value", async function () {
    await expect(
      contractCall(owner, Calls.delegateWithValue, [Child.address], { value: wei(3) })
    ).to.trxTraceEqualSnapshot("calls/delegate_with_value.expected.json", {
      $callsContract: Calls.addressHex,
      $childContract: Child.addressHex,
    })
  })

  it("Nested fail with native transfer", async function () {
    let Transfers = await deployContract(owner, TransfersFactory, [])

    await expect(
      contractCall(owner, Transfers.nestedFailedNativeTransfer, [Child.address, randomAddress5], {
        value: wei(3),
      })
    ).to.trxTraceEqualSnapshot("transfers/nested_fail_with_native_transfer.expected.json", {
      $transfers: Transfers.addressHex,
      $childContract: Child.addressHex,
      $randomAddress5: randomAddress5Hex,
    })
  })

  it("Nested call revert state changes", async function () {
    await expect(contractCall(owner, Calls.nestedRevertFailure, [Child.address])).to.trxTraceEqualSnapshot(
      "calls/nested_call_revert_state_changes.expected.json",
      {
        $callsContract: Calls.addressHex,
        $childContract: Child.addressHex,
      }
    )
  })

  it("All pre-compiled", async function () {
    await expect(contractCall(owner, Calls.allPrecompiled, [])).to.trxTraceEqualSnapshot(
      "calls/all_precompiled.expected.json",
      {
        $callsContract: Calls.addressHex,
      }
    )
  })

  it("Assert failure root call", async function () {
    await expect(koContractCall(owner, Calls.assertFailure, [])).to.trxTraceEqualSnapshot(
      "calls/assert_failure_root_call.expected.json",
      {
        $callsContract: Calls.addressHex,
      }
    )
  })

  it("Revert failure root call", async function () {
    await expect(koContractCall(owner, Calls.revertFailure, [])).to.trxTraceEqualSnapshot(
      "calls/revert_failure_root_call.expected.json",
      {
        $callsContract: Calls.addressHex,
      }
    )
  })

  it("Assert failure on child call", async function () {
    await expect(contractCall(owner, Calls.nestedAssertFailure, [Child.address])).to.trxTraceEqualSnapshot(
      "calls/assert_failure_on_child_call.expected.json",
      {
        $callsContract: Calls.addressHex,
        $childContract: Child.addressHex,
      }
    )
  })
})
