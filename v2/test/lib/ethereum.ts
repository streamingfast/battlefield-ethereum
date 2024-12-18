import {
  BaseContract,
  BigNumberish,
  ContractFactory,
  HDNodeWallet,
  Signer,
  TransactionRequest,
  Wallet,
  getCreate2Address,
  getCreateAddress,
  keccak256,
} from "ethers"
import debugFactory from "debug"
import hre from "hardhat"
import { ContractMethodArgs, StateMutability, TypedContractMethod } from "../../typechain-types/common"
import { addressHasZeroBytes, bytes, randomHex } from "./addresses"
import { TransactionReceiptResult, waitForTransaction } from "./ethers"
import { eth } from "./money"

const debug = debugFactory("battlefield:eth")

export const defaultGasPrice = 45_000_000_000

/**
 * Our own internal allowed transaction request, it will only allow the value and gasLimit
 * fields from the ethers TransactionRequest, but it will also allow a shouldRevert field
 * that will be used to check if the transaction should revert or not.
 */
type TxRequest = Pick<
  TransactionRequest,
  "value" | "gasLimit" | "gasPrice" | "maxFeePerGas" | "maxPriorityFeePerGas"
> & { shouldRevert?: boolean }

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
  const trxRequest = {
    to,
    value,
    gasLimit: 21000,
    gasPrice: defaultGasPrice,
    ...custom,
  }

  debug("Send eth call being performed %o", debuggableTrx(trxRequest))
  const response = await from.sendTransaction(trxRequest)

  return waitForTransaction(response, custom.shouldRevert ?? false)
}

export async function contractCall<A extends Array<any> = Array<any>, R = any, S extends StateMutability = "payable">(
  from: Signer,
  call: TypedContractMethod<A, R, S>,
  args: ContractMethodArgs<A, S>,
  customTx: TxRequest = {}
): Promise<TransactionReceiptResult> {
  const trxCall = await call.populateTransaction(...args)
  const trxRequest = {
    ...trxCall,
    gasLimit: 900_000,
    gasPrice: defaultGasPrice,
    ...customTx,
  }

  debug("Contract call being performed %o", debuggableTrx(trxRequest))
  const response = await from.sendTransaction(trxRequest)

  return waitForTransaction(response, customTx.shouldRevert ?? false)
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

/**
 * Same as {@link BaseContract} but with the address field filled in.
 */
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

/**
 * Deploy a new contract to the network and wait for it to be mined, but this time,
 * it is expected to fail, so it will return the receipt but will validate that
 * it has reverted.
 *
 * The inferred constructorArgs from your specific contract will contains a final optional parameter named
 * 'overrides', it can be ignored.
 */
export async function koContractCreation<F extends ContractFactory>(
  owner: Signer,
  factory: ContractFactory,
  constructorArgs: SolidityConstructorArgs<F>,
  customTx: TxRequest = {}
): Promise<TransactionReceiptResult> {
  return contractCreation(owner, factory, constructorArgs, { shouldRevert: true, ...customTx })
}

/**
 * The inferred constructorArgs from your specific contract will contains a final optional parameter named
 * 'overrides', it can be ignored.
 */
export async function contractCreation<F extends ContractFactory, C extends BaseContract = SolidityContract<F>>(
  owner: Signer,
  factory: ContractFactory,
  constructorArgs: SolidityConstructorArgs<F>,
  customTx: TxRequest = {}
): Promise<TransactionReceiptResult> {
  const [receipt, _] = await _deployContract(owner, factory, constructorArgs, customTx)
  return receipt
}

/**
 * This extract Solidity constructor arguments from a ContractFactory type.
 *
 * FIXME: This function should strip the last parameter as it's not really a constructor argument
 * more a transaction overrides which we don't need. But I haven't found a way to do it. Parameters<F["deploy"]>
 */
type SolidityConstructorArgs<F extends ContractFactory> = Parameters<F["deploy"]>

/**
 * From a ContractFactory type, it extracts the concrete contract type that it will be deployed.
 */
type SolidityContract<F extends ContractFactory> = Awaited<ReturnType<F["deploy"]>>

/**
 * The inferred constructorArgs from your specific contract will contains a final optional parameter named
 * 'overrides', it can be ignored.
 */
export async function deployContract<F extends ContractFactory, C extends BaseContract = SolidityContract<F>>(
  owner: Signer,
  factory: F,
  constructorArgs: SolidityConstructorArgs<F>,
  customTx: TxRequest = {}
): Promise<Contract<C>> {
  const [_, contract] = await _deployContract(owner, factory, constructorArgs, customTx)
  return contract as Contract<C>
}

async function _deployContract<F extends ContractFactory, C extends BaseContract = SolidityContract<F>>(
  owner: Signer,
  factory: ContractFactory,
  constructorArgs: SolidityConstructorArgs<F>,
  customTx: TxRequest = {}
): Promise<[TransactionReceiptResult, Contract<C>]> {
  let receipt: TransactionReceiptResult
  while (true) {
    const trx = await factory.getDeployTransaction(...constructorArgs)
    const trxRequest = {
      ...trx,
      gasPrice: defaultGasPrice,
      ...customTx,
    }

    const response = await owner.sendTransaction(trxRequest)

    receipt = await waitForTransaction(response, customTx.shouldRevert ?? false)

    if (addressHasZeroBytes(receipt.contractAddress)) {
      debug("Contract address had zero bytes, this could lead to differences in gas computing, deploying again")
      continue
    }

    break
  }

  const contract = factory.attach(receipt.contractAddress!) as Contract<C>
  contract.address = receipt.contractAddress!
  contract.addressHex = contract.address.toLowerCase().slice(2)

  return [receipt, contract]
}

function debuggableTrx(trx: TransactionRequest) {
  if (trx.data && trx.data.length < 120) {
    return trx
  }

  if (!trx.data) {
    return trx
  }

  return { ...trx, data: trx.data.slice(0, 16) + `... ${trx.data.length - 16}` }
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
 * Creates a new address ensuring that the created address contains no zero bytes
 * as well as ensuring that contracts deployed from the created address (up to `creationCount`)
 * will also not contain zero bytes.
 *
 * The operation is retried until a valid address is found.
 *
 * The address is also automatically funded, with `fundWei` amount of wei,
 * defaults to 2 ETH if not provided.
 */
export async function stableDeployerFunded(
  from: Signer,
  creationCount: number,
  fundWei?: string | BigNumberish
): Promise<HDNodeWallet> {
  while (true) {
    const deployer = Wallet.createRandom(hre.ethers.provider)
    if (addressHasZeroBytes(deployer.address)) {
      debug("Deployer address had zero bytes, this could lead to differences in gas computing, re-generating again")
      continue
    }

    if (getCreateAddressesHex(deployer.address, creationCount).some(addressHasZeroBytes)) {
      debug(
        `Deployer address would create a contract address with zero bytes, this could lead to differences in gas computing, deploying again`
      )
      continue
    }

    await sendEth(from, deployer.address, fundWei ?? eth(2))

    return deployer
  }
}

/**
 * Deploy a contract and ensures that contract that are going to be created by this newly
 * deployed contract would only yield addresses without zero bytes, this is necessary for
 * stable gas computing.
 *
 * We verify up to <creationCount> addresses to ensure and not all of them.
 */
export async function deployStableContractCreator<
  F extends ContractFactory,
  C extends BaseContract = SolidityContract<F>
>(
  owner: Signer,
  factory: F,
  constructorArgs: SolidityConstructorArgs<F>,
  creationCount: number = 1,
  depth: number = 1,
  customTx: TxRequest = {}
): Promise<Contract<C>> {
  while (true) {
    const contract = await deployContract(owner, factory, constructorArgs, customTx)
    const addresses = getCreateAddressesHex(contract.address, creationCount)

    // Ensure that for the first <creationCount> contracts, the generated address will contains no zero bytes
    if (addresses.some(addressHasZeroBytes)) {
      debug(
        `Deployed contract would create a contract address with zero bytes, this could lead to differences in gas computing, deploying again`
      )
      continue
    }

    if (depth <= 1) {
      return contract as Contract<C>
    }

    if (depth == 2) {
      if (addresses.some(wouldCreateSomeZeroBytesAddress(creationCount))) {
        debug(
          `Deployed second depth contract would create a contract address with zero bytes, this could lead to differences in gas computing, deploying again`
        )
        continue
      }

      return contract as Contract<C>
    }

    throw new Error("Depth > 2 not implemented")
  }
}

function getCreateAddressesHex(from: string, count: number): string[] {
  return Array.from({ length: count }, (_, i) => getCreateAddressHex(from, i))
}

function wouldCreateSomeZeroBytesAddress(count: number): (from: string) => boolean {
  return (from) => getCreateAddressesHex(from, count).some(addressHasZeroBytes)
}
