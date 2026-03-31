import { expect } from "chai"
import { defaultGasPrice } from "./lib/ethereum"
import { oneWei } from "./lib/money"
import { fetchFirehoseTransactionAndBlock } from "./lib/firehose"
import { hexlify } from "ethers"
import { knownExistingAddress } from "./lib/addresses"
import { TransactionTrace_Type } from "../pb/sf/ethereum/type/v2/type_pb"
import { owner, ownerAddress } from "./global"
import { waitForTransaction } from "./lib/ethers"

/**
 * Berlin (EIP-2930) AccessList transaction tests.
 *
 * EIP-2930 introduces type-1 transactions that carry an optional access list, a list
 * of (address, storage keys) tuples that are pre-warmed before execution.  The Firehose
 * trace must preserve the access list verbatim so that consumers can reconstruct the
 * original transaction and verify pre-warming.
 *
 * Three scenarios are covered:
 *   TX1 – single address entry with no storage keys
 *   TX2 – single address entry with two storage keys
 *   TX3 – two address entries each with different storage keys
 */

// Zero-padded 32-byte storage slot values sent in access lists.
const SLOT_0 = "0x0000000000000000000000000000000000000000000000000000000000000000"
const SLOT_1 = "0x0000000000000000000000000000000000000000000000000000000000000001"
const SLOT_2 = "0x0000000000000000000000000000000000000000000000000000000000000002"

describe("Berlin", function () {
  it("Access list transaction with address-only entry", async function () {
    const response = await owner.sendTransaction({
      to: knownExistingAddress,
      value: oneWei,
      gasLimit: 100_000,
      gasPrice: defaultGasPrice,
      type: 1,
      accessList: [{ address: knownExistingAddress, storageKeys: [] }],
    })
    const result = await waitForTransaction(response, false)
    const { trace } = await fetchFirehoseTransactionAndBlock(result)

    expect(hexlify(trace.hash)).to.equal(result.hash)
    expect(trace.type).to.equal(TransactionTrace_Type.TRX_TYPE_ACCESS_LIST, "transaction must be TRX_TYPE_ACCESS_LIST")
    expect(trace.accessList).to.have.length(1, "access list must have exactly one entry")
    expect(hexlify(trace.accessList[0].address)).to.equal(
      knownExistingAddress.toLowerCase(),
      "access list entry address must match",
    )
    expect(trace.accessList[0].storageKeys).to.have.length(0, "address-only entry must have no storage keys")
  })

  it("Access list transaction with address and storage keys", async function () {
    const response = await owner.sendTransaction({
      to: knownExistingAddress,
      value: oneWei,
      gasLimit: 100_000,
      gasPrice: defaultGasPrice,
      type: 1,
      accessList: [{ address: knownExistingAddress, storageKeys: [SLOT_0, SLOT_1] }],
    })
    const result = await waitForTransaction(response, false)
    const { trace } = await fetchFirehoseTransactionAndBlock(result)

    expect(hexlify(trace.hash)).to.equal(result.hash)
    expect(trace.type).to.equal(TransactionTrace_Type.TRX_TYPE_ACCESS_LIST, "transaction must be TRX_TYPE_ACCESS_LIST")
    expect(trace.accessList).to.have.length(1, "access list must have exactly one entry")
    expect(hexlify(trace.accessList[0].address)).to.equal(
      knownExistingAddress.toLowerCase(),
      "access list entry address must match",
    )
    expect(trace.accessList[0].storageKeys).to.have.length(2, "access list entry must have two storage keys")
    expect(hexlify(trace.accessList[0].storageKeys[0])).to.equal(SLOT_0, "first storage key must match slot 0")
    expect(hexlify(trace.accessList[0].storageKeys[1])).to.equal(SLOT_1, "second storage key must match slot 1")
  })

  it("Access list transaction with multiple entries", async function () {
    const response = await owner.sendTransaction({
      to: knownExistingAddress,
      value: oneWei,
      gasLimit: 100_000,
      gasPrice: defaultGasPrice,
      type: 1,
      accessList: [
        { address: knownExistingAddress, storageKeys: [SLOT_0] },
        { address: ownerAddress, storageKeys: [SLOT_1, SLOT_2] },
      ],
    })
    const result = await waitForTransaction(response, false)
    const { trace } = await fetchFirehoseTransactionAndBlock(result)

    expect(hexlify(trace.hash)).to.equal(result.hash)
    expect(trace.type).to.equal(TransactionTrace_Type.TRX_TYPE_ACCESS_LIST, "transaction must be TRX_TYPE_ACCESS_LIST")
    expect(trace.accessList).to.have.length(2, "access list must have two entries")

    expect(hexlify(trace.accessList[0].address)).to.equal(
      knownExistingAddress.toLowerCase(),
      "first entry address must match knownExistingAddress",
    )
    expect(trace.accessList[0].storageKeys).to.have.length(1, "first entry must have one storage key")
    expect(hexlify(trace.accessList[0].storageKeys[0])).to.equal(SLOT_0, "first entry storage key must be slot 0")

    expect(hexlify(trace.accessList[1].address)).to.equal(
      ownerAddress.toLowerCase(),
      "second entry address must match ownerAddress",
    )
    expect(trace.accessList[1].storageKeys).to.have.length(2, "second entry must have two storage keys")
    expect(hexlify(trace.accessList[1].storageKeys[0])).to.equal(
      SLOT_1,
      "second entry first storage key must be slot 1",
    )
    expect(hexlify(trace.accessList[1].storageKeys[1])).to.equal(
      SLOT_2,
      "second entry second storage key must be slot 2",
    )
  })
})
