import debugFactory from "debug"
import { join as pathJoin } from "path"
import Web3 from "web3"
import { ContractSendMethod } from "web3-eth-contract"
import {
  createRawTx,
  getDefaultGasConfig,
  promisifyOnReceipt,
  readContract,
  readContractBin,
  sendRawTx,
  unlockAccount,
} from "./common"

const debug = debugFactory("battlefield:deploy")

export type DeploymentResult = {
  contractAddress: string
  transactionHash: string
}

export type DeployerOptions = {
  value?: string
  contractArguments: any[]
}

export async function deployContract(
  web3: Web3,
  fromAddress: string,
  contractName: string,
  options: DeployerOptions = {
    contractArguments: [],
  }
): Promise<DeploymentResult> {
  debug("Deploying %s using from address %s", contractName, fromAddress)

  if (!(web3.currentProvider instanceof Web3.providers.IpcProvider)) {
    debug("Unlocking account for contract %s: %O", contractName, fromAddress)
    await unlockAccount(web3.eth, fromAddress)
  }

  debug("Reading contract %s info: %O", contractName, options.contractArguments)
  const contractMethod = await readContractInfo(web3, contractName, options.contractArguments)
  const { gasLimit, gasPrice } = getDefaultGasConfig()

  // FIXME: It's not possible to cancel a PromiEvent in between of the confirmation, it continues
  //        until it completes (`receipt` event) or error out. We want to quit fast, so we will
  //        quit manually at the end, but not that this might be problematic in other cases since
  //        the actual observer backing the `PromiEvent` is still running and continue to send
  //        events to the `PromiEvent`.
  console.log(`Deploying contract '${contractName}'`)
  const receipt = await promisifyOnReceipt(
    contractMethod.send({
      from: fromAddress,
      gas: gasLimit,
      gasPrice: gasPrice,
      value: options.value,
    })
  )

  return {
    contractAddress: receipt.contractAddress!,
    transactionHash: receipt.transactionHash,
  }
}

export async function deployContractRaw(
  web3: Web3,
  fromAddress: string,
  privateKey: Buffer,
  contractName: string,
  options: DeployerOptions = {
    contractArguments: [],
  }
): Promise<DeploymentResult> {
  debug("Reading contract %s info: %O", contractName, options.contractArguments)
  const contractMethod = await readContractInfo(web3, contractName, options.contractArguments)

  debug("Creating raw transaction to deploy contract %s from %s", contractName, fromAddress)
  const tx = await createRawTx(web3, fromAddress, privateKey, {
    from: fromAddress,
    data: contractMethod.encodeABI(),
    value: options.value,
  })

  debug("Deploying raw contract %o", {
    from: fromAddress,
    value: options.value,
  })

  const receipt = await promisifyOnReceipt(sendRawTx(web3, tx))
  console.log(
    `Contract deployed ${contractName}
    blockHash: ${receipt.blockHash}
    blocknumber: ${receipt.blockNumber}
    trxHash: ${receipt.transactionHash}`
  )

  return {
    contractAddress: receipt.contractAddress!,
    transactionHash: receipt.transactionHash,
  }
}

export async function readContractInfo(
  web3: Web3,
  name: string,
  args: any[] = []
): Promise<ContractSendMethod> {
  const contract = await readContract(
    web3.eth,
    pathJoin(__dirname, `../contract/build/${name}.abi`)
  )
  const contractBin = await readContractBin(pathJoin(__dirname, `../contract/build/${name}.bin`))

  return contract.deploy({ arguments: args, data: contractBin })
}
