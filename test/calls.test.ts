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
import {
  CallsFactory,
  ChildFactory,
  DelegateToEmptyContract,
  GrandChildFactory,
  owner,
  TransfersFactory,
} from "./global"
import { wei } from "./lib/money"
import { randomAddress5, randomAddress5Hex } from "./lib/addresses"

// Optimism Geth Dev Failed vs Revert Note (comment ref id 1be64cf0820f)
//
// The Optimism Firehose 3.0 model seems to have introduced a small change in how we
// choose the transaction's status. While on the stock Firehose 3.0 model, if a transaction
// as a failed receipt but the its root call has reverted, we change the transactions's status
// to reverted.
//
// On the Optimism Firehose 3.0 model, we keep the transaction's status as failed in all cases.
// This was done to align with RPC's behavior, where the transaction's status cannot be reverted.
// Don't think it was a good idea, we should have sticked to Firehose 3.0 behavior.
//
// See https://github.com/streamingfast/go-ethereum/blob/3b1a1dc9b92d5fd13b36b0030f744b547cf4e6cc/eth/tracers/firehose.go#L658-L665

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
    ).to.trxTraceEqualSnapshot(
      "calls/complete_call_tree.expected.json",
      {
        $callsContract: Calls!.addressHex,
        $callsCreatedContract: getCreateAddressHex(Calls!.address, 1),
        $childContract: Child.addressHex,
        $grandChildContract: GrandChild!.addressHex,
      },
      {
        // Seems BNB has different error message `bn256: malformed point` vs `point is not on curve`
        networkSnapshotOverrides: ["bnb-dev"],
      }
    )
  })

  it("Delegate with value", async function () {
    await expect(
      contractCall(owner, Calls.delegateWithValue, [Child.address], { value: wei(3) })
    ).to.trxTraceEqualSnapshot("calls/delegate_with_value.expected.json", {
      $callsContract: Calls.addressHex,
      $childContract: Child.addressHex,
    })
  })

  it("Delegate to empty contract", async function () {
    let Contract = await deployContract(owner, DelegateToEmptyContract, [])

    await expect(contractCall(owner, Contract.run, [])).to.trxTraceEqualSnapshot(
      "calls/delegate_to_empty_contract.expected.json",
      {
        $contract: Contract.addressHex,
      },
      {
        networkSnapshotOverrides: [
          // Arbitrum had a bogus apply backward compatibility change around executed code
          // when dealing with a call going into an empty contract.
          "arbitrum-geth-dev",
          "bnb-dev", // less gas used on bnb here, also an extra 'REASON_STATE_COLD_ACCESS' gas change
          "optimism-geth-dev", // less gas used on bnb here, also an extra 'REASON_STATE_COLD_ACCESS' gas change
        ],
      }
    )
  })

  it("Nested fail with native transfer", async function () {
    let Transfers = await deployContract(owner, TransfersFactory, [])

    await expect(
      contractCall(owner, Transfers.nestedFailedNativeTransfer, [Child.address, randomAddress5], {
        value: wei(3),
      })
    ).to.trxTraceEqualSnapshot("calls/nested_fail_with_native_transfer.expected.json", {
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
      },
      {
        // Optimism revert vs failed, see comment with ref id 1be64cf0820f in this project for details
        networkSnapshotOverrides: ["optimism-geth-dev"],
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
