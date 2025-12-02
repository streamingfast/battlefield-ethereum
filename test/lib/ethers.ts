import { accessListify, hexlify, Signature, TransactionReceipt, TransactionResponse } from "ethers"
import hre from "hardhat"
import { Block, CallType, TransactionTrace } from "../../pb/sf/ethereum/type/v2/type_pb"
import { toBigInt } from "./numbers"

/**
 * A TransactionReceipt with additional fields to store the nonce and the response
 * on the initial transaction sending that contains a {@link TransactionResponse}
 * with extra field available like {@link TransactionResponse.nonce},
 * {@link TransactionResponse.value} and others.
 *
 * The {@link nonce} field is the nonce the resolved nonce in `bigint`.
 */
export class TransactionReceiptResult extends TransactionReceipt {
  public nonce: bigint = 0n
  public response: TransactionResponse = null as any
}

export async function waitForTransaction(
  response: TransactionResponse,
  shouldRevert: boolean
): Promise<TransactionReceiptResult> {
  const receipt = await response.wait(1, 30_000).catch(async (e) => {
    // It seems `.wait(...)` enforces successful transactions, so we need to check
    // catch the error, retrieve the receipt and check it ourself.
    if (shouldRevert && e.toString().includes("transaction execution reverted")) {
      const receipt = await hre.ethers.provider.getTransactionReceipt(response.hash)
      if (receipt !== null) {
        return receipt
      }

      return null
    }

    throw e
  })
  if (receipt === null) {
    throw new Error(`Transaction ${response.hash} not mined after 2.5s`)
  }

  if (shouldRevert && receipt.status === 1) {
    throw new Error(
      `Transaction ${response.hash} (Block #${receipt.blockNumber}) did not revert as expected\n${JSON.stringify(
        receipt,
        null,
        2
      )}`
    )
  }

  const out = new TransactionReceiptResult(receipt, receipt.provider)
  out.nonce = BigInt(response.nonce)
  out.response = response

  return out
}

export async function getReceiptForTransactionTrace(
  trxTrace: TransactionTrace,
  block: Block
): Promise<TransactionReceiptResult> {
  let effectiveGasPriceCalc: bigint
  if (trxTrace.type === 2) {
    // EIP-1559
    const baseFeePerGas = block.header?.baseFeePerGas ? toBigInt(block.header.baseFeePerGas) : 0n
    const maxPriorityFeePerGas = trxTrace.maxPriorityFeePerGas ? toBigInt(trxTrace.maxPriorityFeePerGas) : 0n
    const maxFeePerGas = trxTrace.maxFeePerGas ? toBigInt(trxTrace.maxFeePerGas) : 0n

    const sumFee = baseFeePerGas + maxPriorityFeePerGas
    effectiveGasPriceCalc = sumFee < maxFeePerGas ? sumFee : maxFeePerGas
    // Ensure effective gas price is not less than base fee if maxFeePerGas is high enough
    if (effectiveGasPriceCalc < baseFeePerGas && maxFeePerGas >= baseFeePerGas) {
      effectiveGasPriceCalc = baseFeePerGas
    } else if (maxFeePerGas < baseFeePerGas) {
      // If user's max_fee_per_gas is less than current base_fee
      effectiveGasPriceCalc = maxFeePerGas
    }
  } else {
    // Legacy (type 0) or EIP-2930 (type 1)
    effectiveGasPriceCalc = toBigInt(trxTrace.gasPrice)
  }

  const receipt = new TransactionReceipt(
    {
      to: trxTrace.calls[0].callType === CallType.CREATE ? null : hexlify(trxTrace.to),
      from: hexlify(trxTrace.from),
      contractAddress: trxTrace.calls[0].callType === CallType.CREATE ? hexlify(trxTrace.to) : null,
      index: trxTrace.index,
      root:
        trxTrace.receipt?.stateRoot && trxTrace.receipt.stateRoot.length > 0
          ? hexlify(trxTrace.receipt.stateRoot)
          : null,
      gasUsed: toBigInt(trxTrace.gasUsed),
      logsBloom:
        trxTrace.receipt?.logsBloom && trxTrace.receipt.logsBloom.length > 0
          ? hexlify(trxTrace.receipt.logsBloom)
          : `0x${"00".repeat(256)}`,
      blockHash: hexlify(block.hash),
      hash: hexlify(trxTrace.hash),
      logs:
        trxTrace.receipt?.logs.map((log) => ({
          transactionHash: hexlify(trxTrace.hash),
          blockHash: hexlify(block.hash),
          blockNumber: Number(block.number),
          removed: false, // Assuming logs are not removed for traced transactions
          address: hexlify(log.address),
          data: hexlify(log.data),
          topics: log.topics.map((t) => hexlify(t)),
          index: Number(log.index), // log.index is log's position in block
          transactionIndex: trxTrace.index,
        })) ?? [],
      blockNumber: Number(block.number),
      cumulativeGasUsed: trxTrace.receipt?.cumulativeGasUsed ? toBigInt(trxTrace.receipt.cumulativeGasUsed) : 0n,
      gasPrice: trxTrace.type === 2 ? null : effectiveGasPriceCalc,
      effectiveGasPrice: effectiveGasPriceCalc,
      blobGasUsed: block.header?.blobGasUsed,
      blobGasPrice: trxTrace.blobGas,
      type: trxTrace.type,
      status: trxTrace.status === 1 ? 1 : trxTrace.status === 2 ? 0 : null, // SUCCEEDED: 1, FAILED: 0, REVERTED (also 0 in practice for status), UNKNOWN: null
    },
    hre.ethers.provider
  )

  const out = new TransactionReceiptResult(receipt, receipt.provider)
  out.nonce = trxTrace.nonce
  out.response = new TransactionResponse(
    {
      hash: hexlify(trxTrace.hash),
      blockNumber: Number(block.number),
      blockHash: hexlify(block.hash),
      index: trxTrace.index,
      type: trxTrace.type,
      to: trxTrace.to && trxTrace.to.length > 0 ? hexlify(trxTrace.to) : null,
      from: hexlify(trxTrace.from),
      nonce: Number(trxTrace.nonce),
      gasLimit: toBigInt(trxTrace.gasLimit),
      gasPrice: toBigInt(trxTrace.gasPrice),
      maxPriorityFeePerGas: toBigInt(trxTrace.maxPriorityFeePerGas),
      maxFeePerGas: toBigInt(trxTrace.maxFeePerGas),
      data: hexlify(trxTrace.input),
      value: toBigInt(trxTrace.value),
      chainId: BigInt(0),
      signature:
        trxTrace.r.length === 0 || trxTrace.s.length === 0 || trxTrace.v.length === 0
          ? Signature.from({
              r: "0x" + "00".repeat(32),
              s: "0x" + "00".repeat(32),
              v: 27,
            })
          : Signature.from({
              r: hexlify(trxTrace.r),
              s: hexlify(trxTrace.s),
              v: trxTrace.v[0],
            }),
      accessList: accessListify(
        trxTrace.accessList.map((item) => ({
          address: hexlify(item.address),
          storageKeys: item.storageKeys.map((k) => hexlify(k)),
        }))
      ),
      maxFeePerBlobGas: toBigInt(trxTrace.blobGas),
      blobVersionedHashes: trxTrace.blobHashes.map((h) => hexlify(h)),
    },
    hre.ethers.provider
  )
  return out
}
