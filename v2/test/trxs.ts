import { BigNumberish, Signer, TransactionReceipt, TransactionResponse } from "ethers"

/// Run all the promises and return the results, if any of the promises fails
export async function executeTransactions(
  ...promises: Promise<TransactionResponse>[]
): Promise<TransactionResponse[]> {
  const results = await Promise.allSettled(promises)
  const errors = results
    .map((result, index) => {
      if (result.status === "rejected") {
        return "Error when sending transaction at " + index + ": " + result.reason
      } else {
        return null
      }
    })
    .filter((error) => error !== null)

  if (errors.length > 0) {
    throw new Error(errors.join("\n"))
  }

  return results.map((result) => {
    if (result.status === "fulfilled") {
      return result.value
    }

    // Shouldn't happen, alreadt checked for errors, but this please the compiler
    throw new Error("Transaction failed: " + result.reason)
  })
}

/// Send a transaction to the network but does not wait for it to be mined, this is
/// an optimistic send, it will return the transaction response.
export async function sendImmediateEth(from: Signer, to: string, value: BigNumberish) {
  return from.sendTransaction({
    to,
    value,
  })
}

/// Send a transaction to the network and wait for it to be mined, this is a
export async function sendEth(
  from: Signer,
  to: string,
  value: BigNumberish
): Promise<TransactionReceiptResult> {
  const response = await from.sendTransaction({
    to,
    value,
  })

  const receipt = await response.wait(1, 2500)
  if (receipt === null) {
    throw new Error(`Transaction ${response.hash} not mined after 2.5s`)
  }

  const out = new TransactionReceiptResult(receipt, receipt.provider)
  out.nonce = BigInt(response.nonce)
  out.response = response

  return out
}

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
