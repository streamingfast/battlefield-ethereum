import { join as pathJoin } from "path"
import Web3 from "web3"
import { ContractSendMethod } from "web3-eth-contract"
import {
  promisifyOnFirstConfirmation,
  readContract,
  readContractBin,
  unlockAccount,
  createRawTx,
  sendRawTx,
  getDefaultGasConfig
} from "./common"

type DeploymentResult = {
  contractAddress: string
  transactionHash: string
}

export async function deployContract(
  web3: Web3,
  fromAddress: string,
  contractName: string,
  options: {
    value?: string
    contractArguments: any[]
  } = {
    contractArguments: []
  }
): Promise<DeploymentResult> {
  if (unlockAccount) {
    await unlockAccount(web3.eth, fromAddress)
  }

  const contractMethod = await readContractInfo(web3, contractName, options.contractArguments)
  const { gasLimit, gasPrice } = getDefaultGasConfig()

  // FIXME: It's not possible to cancel a PromiEvent in between of the confirmation, it continues
  //        until it completes (`receipt` event) or error out. We want to quit fast, so we will
  //        quit manually at the end, but not that this might be problematic in other cases since
  //        the actual observer backing the `PromiEvent` is still running and continue to send
  //        events to the `PromiEvent`.
  console.log(`Deploying contract '${contractName}'`)
  const receipt = await promisifyOnFirstConfirmation(
    contractMethod.send({
      from: fromAddress,
      gas: gasLimit,
      gasPrice: gasPrice,
      value: options.value
    })
  )

  return {
    contractAddress: receipt.contractAddress!,
    transactionHash: receipt.transactionHash
  }
}

export async function deployContractRaw(
  web3: Web3,
  fromAddress: string,
  privateKey: Buffer,
  contractName: string,
  options: {
    value?: string
    contractArguments: any[]
  } = {
    contractArguments: []
  }
): Promise<DeploymentResult> {
  const contractMethod = await readContractInfo(web3, contractName, options.contractArguments)
  const tx = await createRawTx(web3, fromAddress, privateKey, {
    from: fromAddress,
    data: contractMethod.encodeABI(),
    value: options.value
  })

  console.log(`Deploying contract '${contractName}'`)
  const receipt = await promisifyOnFirstConfirmation(sendRawTx(web3, tx))

  return {
    contractAddress: receipt.contractAddress!,
    transactionHash: receipt.transactionHash
  }
}

export async function readContractInfo(
  web3: Web3,
  name: string,
  args: any[] = []
): Promise<ContractSendMethod> {
  const contract = await readContract(web3.eth, pathJoin(__dirname, `./contract/build/${name}.abi`))
  const contractBin = await readContractBin(pathJoin(__dirname, `./contract/build/${name}.bin`))

  return contract.deploy({ arguments: args, data: contractBin })
}
