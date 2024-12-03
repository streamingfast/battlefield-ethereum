import {
  BaseContract,
  BigNumberish,
  ContractFactory,
  Signer,
  TransactionReceipt,
  TransactionRequest,
  TransactionResponse,
} from "ethers"
import { ContractMethodArgs, StateMutability, TypedContractMethod } from "../../typechain-types/common"

/// Run all the promises and return the results, if any of the promises fails
export async function executeTransactions(...promises: Promise<any>[]): Promise<any[]> {
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

    // Shouldn't happen, already checked for errors, but this please the compiler
    throw new Error("Transaction failed: " + result.reason)
  })
}

/**
 * Send a transaction to the network but does not wait for it to be mined, this is
 * an optimistic send, it will return the transaction response.
 */
export async function sendImmediateEth(from: Signer, to: string, value: BigNumberish) {
  return from.sendTransaction({
    to,
    value,
  })
}

/** Send a transaction to the network and wait for it to be mined. */
export async function sendEth(
  from: Signer,
  to: string,
  value: BigNumberish,
  custom: TransactionRequest = {}
): Promise<TransactionReceiptResult> {
  const response = await from.sendTransaction({
    to,
    value,
    gasPrice: 450_000_000,
    ...custom,
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

export async function contractCall<A extends Array<any> = Array<any>, R = any, S extends StateMutability = "payable">(
  from: Signer,
  call: TypedContractMethod<A, R, S>,
  args: ContractMethodArgs<A, S>,
  customTx: Pick<TransactionRequest, "value" | "gasLimit"> = {}
): Promise<TransactionReceiptResult> {
  const trxRequest = await call.populateTransaction(...args)

  const response = await from.sendTransaction({
    gasPrice: 450_000_000,
    ...trxRequest,
    ...customTx,
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

export type Contract<T extends BaseContract> = T & {
  /**
   * This will be the address of the contract in the network in hexadecimal,
   * possibly checksummed (so with mixed casing) and with the 0x prefix.
   */
  address: string

  /**
   * This will be the address of the contract in the network in hexadecimal
   * lower case without the 0x prefix, used for snapshotting.
   */
  addressHex: string
}

export async function deployContract<C extends BaseContract>(
  owner: Signer,
  factory: ContractFactory,
  setter?: (contract: Contract<C>) => void
): Promise<Contract<C>> {
  const ownerAddress = await owner.getAddress()
  const trx = await factory.getDeployTransaction({ from: ownerAddress })
  const response = await owner.sendTransaction(trx)
  const receipt = await response.wait(1, 2500)
  if (receipt === null) {
    throw new Error(`Transaction ${response.hash} to deploy contract not mined after 2.5s`)
  }

  const contract = factory.attach(receipt.contractAddress!) as Contract<C>
  contract.address = receipt.contractAddress!
  contract.addressHex = contract.address.toLowerCase().slice(2)

  if (setter) {
    setter(contract)
  }

  return contract
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
