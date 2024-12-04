import {
  BaseContract,
  BigNumberish,
  ContractFactory,
  Signer,
  TransactionReceipt,
  TransactionRequest,
  TransactionResponse,
  getCreate2Address,
  getCreateAddress,
  keccak256,
} from "ethers"
import debugFactory from "debug"
import hre from "hardhat"
import { ContractMethodArgs, StateMutability, TypedContractMethod } from "../../typechain-types/common"
import { addressHasZeroBytes, bytes, randomHex } from "./addresses"

const debug = debugFactory("battlefield:eth")

/**
 * Our own internal allowed transaction request, it will only allow the value and gasLimit
 * fields from the ethers TransactionRequest, but it will also allow a shouldRevert field
 * that will be used to check if the transaction should revert or not.
 */
type TxRequest = Pick<TransactionRequest, "value" | "gasLimit"> & { shouldRevert?: boolean }

/**
 * Runs all the promises and return the results, if any of the promises fails
 */
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
  custom: TxRequest = {}
): Promise<TransactionReceiptResult> {
  const response = await from.sendTransaction({
    to,
    value,
    gasLimit: 21000,
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
  customTx: TxRequest = {}
): Promise<TransactionReceiptResult> {
  const trxRequest = await call.populateTransaction(...args)
  const response = await from.sendTransaction({
    ...trxRequest,
    gasLimit: 900_000,
    gasPrice: 450_000_000,
    ...customTx,
  })

  const receipt = await response.wait(1, 2500).catch(async (e) => {
    // It seems `.wait(...)` enforces successful transactions, so we need to check
    // catch the error, retrieve the receipt and check it ourself.
    if (customTx.shouldRevert && e.toString().includes("transaction execution reverted")) {
      const receipt = await hre.ethers.provider.getTransactionReceipt(response.hash)
      if (receipt !== null) {
        return receipt
      }

      return null
    }

    throw e
  })
  if (receipt === null) {
    throw new Error(`Transaction ${response.hash} ot mined after 2.5s`)
  }

  if (customTx.shouldRevert && receipt.status === 1) {
    throw new Error(`Transaction ${response.hash} (Block #${receipt.blockNumber}) did not revert as expected`)
  }

  const out = new TransactionReceiptResult(receipt, receipt.provider)
  out.nonce = BigInt(response.nonce)
  out.response = response

  return out
}

/**
 * Send a transaction to the network and wait for it to be mined, but this time,
 * it is expected to fail, so it will return the receipt but will validate that
 * it has reverted.
 */
export async function koContractCall<A extends Array<any> = Array<any>, R = any, S extends StateMutability = "payable">(
  from: Signer,
  call: TypedContractMethod<A, R, S>,
  args: ContractMethodArgs<A, S>,
  customTx: TxRequest = {}
): Promise<TransactionReceiptResult> {
  return contractCall(from, call, args, { shouldRevert: true, ...customTx })
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
  customTx: TxRequest = {}
): Promise<Contract<C>> {
  const ownerAddress = await owner.getAddress()

  let receipt: TransactionReceipt
  while (true) {
    const trx = await factory.getDeployTransaction({ from: ownerAddress })
    const response = await owner.sendTransaction({
      ...trx,
      gasLimit: 1_000_000,
      gasPrice: 450_000_000,
      ...customTx,
    })
    const txReceipt = await response.wait(1, 2500)
    if (txReceipt === null) {
      throw new Error(`Transaction ${response.hash} to deploy contract not mined after 2.5s`)
    }

    if (!txReceipt.contractAddress) {
      throw new Error(`Transaction ${response.hash} to deploy contract did not return a contract address`)
    }

    receipt = txReceipt
    if (addressHasZeroBytes(receipt.contractAddress)) {
      debug("Contract address had zero bytes, this could lead to differences in gas computing, deploying again")
      continue
    }

    break
  }

  const contract = factory.attach(receipt.contractAddress!) as Contract<C>
  contract.address = receipt.contractAddress!
  contract.addressHex = contract.address.toLowerCase().slice(2)

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

/**
 * Convenience for the ethers.getCreateAddress function, but it returns the address
 * as a string in hexadecimal lower case without the 0x prefix.
 */
export function getCreateAddressHex(from: string, nonce: BigNumberish): string {
  return getCreateAddress({ from, nonce }).toLowerCase().slice(2)
}

interface Bytecodeable {
  readonly bytecode: string
}

/**
 * Convenience for the ethers.getCreate2Address function, but it returns the address
 * as a string in hexadecimal lower case without the 0x prefix.
 */
export function getCreate2AddressHex<F extends Bytecodeable>(from: string, salt: string, contract: F): string {
  return getCreate2Address(from, salt.startsWith("0x") ? salt : "0x" + salt, keccak256(contract.bytecode))
    .toLowerCase()
    .slice(2)
}

type Create2Data = {
  salt: string
  address: string
}

/**
 * Convenience to generate a salt and the address for a create2 operation, but
 * it will keep generating until the address does not have any zero bytes which
 * is necessary for stable gas computing.
 */
export function getStableCreate2Data<F extends Bytecodeable>(from: string, contract: F): Create2Data {
  while (true) {
    const salt = randomHex(32 * bytes)
    const address = getCreate2AddressHex(from, salt, contract)

    if (addressHasZeroBytes(address)) {
      debug(
        "Contract address (for create2) had zero bytes, this could lead to differences in gas computing, re-generating again"
      )
      continue
    }

    return { salt, address }
  }
}

type Runner = () => Promise<any>

export async function deployAll(...runners: Runner[]) {
  await executeTransactions(...runners.map((runner) => runner()))
}

/**
 * Deploy a contract and ensures that contract that are going to be created by this newly
 * deployed contract would only yield addresses without zero bytes, this is necessary for
 * stable gas computing.
 *
 * We verify up to <creationCount> addresses to ensure and not all of them.
 */
export async function deployStableContractCreator<C extends BaseContract>(
  owner: Signer,
  factory: ContractFactory,
  creationCount: number,
  depth = 1,
  customTx: TxRequest = {}
): Promise<Contract<C>> {
  while (true) {
    const contract = await deployContract<C>(owner, factory, customTx)
    const addresses = getCreateAddressesHex(contract.address, creationCount)

    // Ensure that for the first <creationCount> contracts, the generated address will contains no zero bytes
    if (addresses.some(addressHasZeroBytes)) {
      debug(
        `Deployed contract would create a contract address with zero bytes, this could lead to differences in gas computing, deploying again`
      )
      continue
    }

    if (depth <= 1) {
      return contract
    }

    if (depth == 2) {
      if (addresses.some(wouldCreateSomeZeroBytesAddress(creationCount))) {
        debug(
          `Deployed second depth contract would create a contract address with zero bytes, this could lead to differences in gas computing, deploying again`
        )
        continue
      }

      return contract
    }

    throw new Error("Depth > 2 not implemented")
  }
}

function getCreateAddressesHex(from: string, count: number): string[] {
  return Array.from({ length: count }, (_, i) => getCreateAddressHex(from, i + 1))
}

function wouldCreateSomeZeroBytesAddress(count: number): (from: string) => boolean {
  return (from) => getCreateAddressesHex(from, count).some(addressHasZeroBytes)
}
