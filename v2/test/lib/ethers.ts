import { TransactionReceipt, TransactionResponse } from "ethers"
import hre from "hardhat"

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
  const receipt = await response.wait(1, 2500).catch(async (e) => {
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
