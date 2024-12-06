import { expect } from "chai"
import { Contract, contractCall, deployAll, deployContract, koContractCall } from "./lib/ethereum"
import { Calls, Child } from "../typechain-types"
import { CallsFactory, ChildFactory, GrandChildFactory, owner, SuicidalFactory } from "./global"
import { wei } from "./lib/money"

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

  // it("Complete call tree", async function () {
  //   const GrandChild = await deployContract(owner, GrandChildFactory, [Child.address, false])

  //   await expect(
  //     contractCall(owner, Calls.completeCallTree, [Child.address, GrandChild.address])
  //   ).to.trxTraceEqualSnapshot("calls/complete_call_tree.expected.json", {
  //     $callsContract: Calls.addressHex,
  //     $childContract: Child.addressHex,
  //     $grandChildContract: GrandChild.addressHex,
  //   })
  // })

  // it("call to a precompiled address with balance", async function () {
  //   await expect(
  //     contractCall(owner, Calls.callToPrecompiledAddressWithBalance, [], { to: precompileWithBalance })
  //   ).to.trxTraceEqualSnapshot("calls/call_to_precompiled_address_with_balance.expected.json")
  // })

  // it("call to a precompiled address without balance", async function () {
  //   await expect(
  //     contractCall(owner, Calls.callToPrecompiledAddressWithoutBalance, [], { to: precompileWithoutBalance })
  //   ).to.trxTraceEqualSnapshot("calls/call_to_precompiled_address_without_balance.expected.json")
  // })

  it("Delegate with value", async function () {
    await expect(
      contractCall(owner, Calls.delegateWithValue, [Child.addressHex], { value: wei(3) })
    ).to.trxTraceEqualSnapshot("calls/delegate_with_value.expected.json", {
      $callsContract: Calls.addressHex,
      $childContract: Child.addressHex,
    })
  })

  // it("nested fail with native transfer", async function () {
  //   await expect(
  //     contractCall(owner, Transfers.nestedFailtNativeTransfer, [childContractAddress, randomAddress5], {
  //       value: threeWei,
  //     })
  //   ).to.trxTraceEqualSnapshot("transfers/nested_fail_with_native_transfer.expected.json")
  // })

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
    await expect(koContractCall(owner, Calls.nestedAssertFailure, [Child.address])).to.trxTraceEqualSnapshot(
      "calls/assert_failure_on_child_call.expected.json",
      {
        $callsContract: Calls.addressHex,
        $childContract: Child.addressHex,
      }
    )
  })
})
