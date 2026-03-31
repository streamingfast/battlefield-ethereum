import { expect } from "chai"
import { defaultGasPrice, mustGetRpcBlock, sendEth } from "./lib/ethereum"
import { oneWei } from "./lib/money"
import { fetchFirehoseTransactionAndBlock } from "./lib/firehose"
import { Wallet, hexlify } from "ethers"
import { knownExistingAddress } from "./lib/addresses"
import { TransactionTrace_Type } from "../pb/sf/ethereum/type/v2/type_pb"
import { owner } from "./global"
import { waitForTransaction } from "./lib/ethers"
import { isBlockOnCancunOrLater } from "./lib/chain_eips"
import { toBigInt } from "./lib/numbers"
import { eth } from "./lib/money"
import hre from "hardhat"
import * as kzg from "c-kzg"

/**
 * Cancun (EIP-4844) Blob transaction tests.
 *
 * EIP-4844 introduces type-3 transactions carrying KZG blob commitments. The blobs
 * themselves are not stored on-chain, but the versioned hashes of their KZG commitments
 * are. The Firehose trace must preserve these fields verbatim.
 *
 * Fields asserted:
 *   - type          = TRX_TYPE_BLOB
 *   - blobHashes    = one versioned hash per blob (0x01 || sha256(commitment)[1:])
 *   - blobGasFeeCap = the maxFeePerBlobGas specified by the sender
 *   - blobGas       = GAS_PER_BLOB × len(blobHashes)  (131072 per blob, EIP-4844 constant)
 *
 * Two scenarios:
 *   TX1 – single blob
 *   TX2 – three blobs
 *
 * If the connected chain does not support Cancun (no blobGasUsed in block header),
 * all tests in this suite are skipped.
 */

// Blob gas consumed per blob (EIP-4844 constant: 2^17 = 131072).
const GAS_PER_BLOB = 131072n

// Zero blob: 128 KiB of zeros – the simplest valid blob content.
const ZERO_BLOB = new Uint8Array(131072)

// Versioned hash for a zero blob with the mainnet KZG trusted setup:
//   0x01 (BLOB_COMMITMENT_VERSION_KZG) || sha256(kzgCommitment(ZERO_BLOB))[1:]
// This is deterministic given the fixed trusted setup and fixed blob content.
const ZERO_BLOB_VERSIONED_HASH = "0x010657f37554c781402a22917dee2f75def7ab966d7b770905398eba3c444014"

describe("Cancun", function () {
  // Hardhat's NonceManager strips blob-specific fields (blobs, kzg, maxFeePerBlobGas)
  // when sending transactions, so we use a dedicated ethers Wallet connected directly
  // to the provider — the same pattern used by the Prague (EIP-7702) tests.
  const blobWalletKey = "0x4c0883a69102937d6231471b5dbb6e538eba2ef8f21e606951fb2b3f4e844f1a"
  let blobWallet: Wallet

  before(async function () {
    const rpcBlock = await mustGetRpcBlock("latest")
    if (!isBlockOnCancunOrLater(rpcBlock)) {
      this.skip()
      return
    }

    // Load the mainnet KZG trusted setup (preset 0).
    try {
      kzg.loadTrustedSetup(0)
    } catch (_) {
      // Already loaded
    }

    blobWallet = new Wallet(blobWalletKey, hre.ethers.provider)
    await sendEth(owner, blobWallet.address, eth(1))
  })

  it("Blob transaction with single blob", async function () {
    const maxFeePerBlobGas = 1_000_000_000n // 1 gwei per blob gas unit

    const response = await blobWallet.sendTransaction({
      to: knownExistingAddress,
      value: oneWei,
      maxFeePerGas: defaultGasPrice,
      maxPriorityFeePerGas: 25_000n,
      type: 3,
      maxFeePerBlobGas,
      blobs: [ZERO_BLOB],
      kzg: kzg as any,
    })
    const result = await waitForTransaction(response, false)
    const { trace } = await fetchFirehoseTransactionAndBlock(result)

    expect(hexlify(trace.hash)).to.equal(result.hash)
    expect(trace.type).to.equal(TransactionTrace_Type.TRX_TYPE_BLOB, "transaction must be TRX_TYPE_BLOB")

    expect(trace.blobHashes).to.have.length(1, "must have exactly one blob hash")
    expect(hexlify(trace.blobHashes[0])).to.equal(
      ZERO_BLOB_VERSIONED_HASH,
      "blob versioned hash must match: 0x01 || sha256(commitment)[1:]",
    )

    expect(toBigInt(trace.blobGasFeeCap)).to.equal(maxFeePerBlobGas, "blob gas fee cap must match maxFeePerBlobGas")

    // blobGas = GAS_PER_BLOB × numBlobs (2^17 = 131072 per blob, EIP-4844 constant)
    expect(trace.blobGas).to.equal(GAS_PER_BLOB * 1n, "blob gas must be GAS_PER_BLOB * numBlobs")
  })

  it("Blob transaction with multiple blobs", async function () {
    const maxFeePerBlobGas = 1_000_000_000n // 1 gwei per blob gas unit

    const response = await blobWallet.sendTransaction({
      to: knownExistingAddress,
      value: oneWei,
      maxFeePerGas: defaultGasPrice,
      maxPriorityFeePerGas: 25_000n,
      type: 3,
      maxFeePerBlobGas,
      blobs: [ZERO_BLOB, ZERO_BLOB, ZERO_BLOB],
      kzg: kzg as any,
    })
    const result = await waitForTransaction(response, false)
    const { trace } = await fetchFirehoseTransactionAndBlock(result)

    expect(hexlify(trace.hash)).to.equal(result.hash)
    expect(trace.type).to.equal(TransactionTrace_Type.TRX_TYPE_BLOB, "transaction must be TRX_TYPE_BLOB")

    expect(trace.blobHashes).to.have.length(3, "must have exactly three blob hashes")
    for (const hash of trace.blobHashes) {
      expect(hexlify(hash)).to.equal(ZERO_BLOB_VERSIONED_HASH, "each blob versioned hash must match the zero blob hash")
    }

    expect(toBigInt(trace.blobGasFeeCap)).to.equal(maxFeePerBlobGas, "blob gas fee cap must match maxFeePerBlobGas")

    // blobGas = GAS_PER_BLOB × numBlobs (2^17 = 131072 per blob, EIP-4844 constant)
    expect(trace.blobGas).to.equal(GAS_PER_BLOB * 3n, "blob gas must be GAS_PER_BLOB * numBlobs")
  })
})
