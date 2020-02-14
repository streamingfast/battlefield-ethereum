import { readFile } from "fs"
import { promisify } from "util"
import { PromiEvent, TransactionReceipt } from "web3-core"
import { Contract, SendOptions } from "web3-eth-contract"
import { Eth } from "web3-eth"
import { Transaction, BufferLike, TxData, TransactionOptions } from "ethereumjs-tx"
import Web3 from "web3"

export type GasOptions = {
  gasPrice?: string
  gas?: number
}

let defaultAddress = ""

export const getDefaultAddress = () => defaultAddress
export const setDefaultAddress = (address: string) => {
  defaultAddress = address
}

export type GasConfig = { gasLimit: number; gasPrice: string }

let defaultGasConfig: GasConfig = { gasLimit: 93999999, gasPrice: "1" }
export const getDefaultGasConfig = () => defaultGasConfig
export const setDefaultGasConfig = (gasLimit: number, gasPrice: string) => {
  defaultGasConfig = { gasLimit, gasPrice }
}

export const unsetDefaultGasConfig = () => {
  defaultGasConfig = { gasLimit: 0, gasPrice: "" }
}

export const isUnsetDefaultGasConfig = () =>
  defaultGasConfig.gasLimit === 0 && defaultGasConfig.gasPrice === ""

let defaultTxOptions: TransactionOptions = { chain: "mainnet", hardfork: "muirglacier" }

export const getDefaultTxOptions = () => defaultTxOptions
export const setDefaultTxOptions = (options: TransactionOptions) => {
  defaultTxOptions = options
}

export const getDefaultSendOptions = (): SendOptions => {
  return {
    from: defaultAddress,
    gas: defaultGasConfig.gasLimit,
    gasPrice: defaultGasConfig.gasPrice
  }
}

const asyncReadFile = promisify(readFile)

export function requireProcessEnv(name: string): string {
  const value = process.env[name]
  if (value == null) {
    console.error(`environment variable ${name} required`)
    process.exit(1)
  }

  return value!
}

export async function initialDefaultAddress(
  eth: Eth,
  input: string | null | undefined
): Promise<string> {
  setDefaultAddress(await addressOrDefault(eth, input))

  return defaultAddress
}

export async function addressOrDefault(
  eth: Eth,
  input: string | null | undefined
): Promise<string> {
  if (input != null) return input
  if (eth.defaultAccount != null) return eth.defaultAccount

  return await eth.getCoinbase()
}

export async function unlockAccount(eth: Eth, address: string) {
  // FIXME: All account must be created with an empty key
  //        Implement a read from env fallback to CLI if tty mechanism
  const succeed = await eth.personal.unlockAccount(address, "", 5000)
  if (!succeed) {
    throw new Error(`Unable to unlock account`)
  }
}

export async function readContract(eth: Eth, abiFilename: string): Promise<Contract> {
  const buffer = await asyncReadFile(abiFilename)

  return new eth.Contract(JSON.parse(buffer.toString()))
}

export async function readContractBin(filename: string): Promise<string> {
  const buffer = await asyncReadFile(filename)

  return "0x" + buffer.toString()
}

export function fullyExecuteAndLog<T>(event: PromiEvent<T>): Promise<TransactionReceipt> {
  return new Promise((resolve, reject) => {
    event.once("transactionHash", (transactionHash) => {
      console.log(`Receivied transaction hash event: ${transactionHash}`)
    })
    event.on("confirmation", (confirmationNumber) => {
      console.log(`Received confirmation #${confirmationNumber}`)
    })
    event.once("receipt", (receipt) => {
      console.log(`Receivied receipt`, JSON.stringify(receipt, null, "  "))
      resolve(receipt)
    })
    event.once("error", (error) => {
      console.log("Received error", error)
      reject(error)
    })
  })
}

export function promisifyOnReceipt<T>(event: PromiEvent<T>): Promise<TransactionReceipt> {
  return new Promise((resolve, reject) => {
    event.once("receipt", resolve).once("error", reject)
  })
}

export function promisifyOnFirstConfirmation<T>(event: PromiEvent<T>): Promise<TransactionReceipt> {
  return new Promise((resolve, reject) => {
    event
      .once("confirmation", (_, receipt) => {
        // @ts-ignore
        event.removeAllListeners()
        resolve(receipt)
      })
      .once("error", reject)
  })
}

export function configureDefaultSendOptions(options?: SendOptions): SendOptions {
  if (options === undefined) {
    options = {
      from: defaultAddress
    }
  }

  if (options.gas == undefined) {
    options.gas = defaultGasConfig.gasLimit
  }

  if (options.gasPrice == undefined) {
    options.gasPrice = defaultGasConfig.gasPrice
  }

  if (options.from == undefined) {
    options.from = defaultAddress
  }

  return options
}

export function sendRawTx(web3: Web3, tx: Transaction): PromiEvent<TransactionReceipt> {
  return web3.eth.sendSignedTransaction("0x" + tx.serialize().toString("hex"))
}

export async function createRawTx(
  web3: Web3,
  fromAddress: string,
  privateKey: Buffer,
  sendOptions?: SendOptions & { to?: BufferLike; data?: BufferLike; txOptions?: TransactionOptions }
): Promise<Transaction> {
  sendOptions = configureDefaultSendOptions(sendOptions)

  const nonce = await web3.eth.getTransactionCount(fromAddress)
  const txData: TxData = {
    nonce: web3.utils.toHex(nonce),
    gasLimit: web3.utils.toHex(sendOptions.gas!),
    gasPrice: web3.utils.toHex(sendOptions.gasPrice!),
    to: sendOptions.to,
    data: sendOptions.data
  }

  if (sendOptions.value) {
    txData.value = web3.utils.toHex(sendOptions.value)
  }

  // The second parameter is not necessary if these values are used
  const tx = new Transaction(txData, sendOptions.txOptions || defaultTxOptions)
  tx.sign(privateKey)

  return tx
}
