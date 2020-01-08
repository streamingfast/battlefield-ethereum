import { join as pathJoin } from "path"
import Web3 from "web3"
import {
  promisifyOnFirstConfirmation,
  readContract,
  readContractBin,
  unlockAccount,
  createRawTx,
  sendRawTx
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

  const contract = await readContract(
    web3.eth,
    pathJoin(__dirname, `./contract/build/${contractName}.abi`)
  )
  const contractBin = await readContractBin(
    pathJoin(__dirname, `./contract/build/${contractName}.bin`)
  )

  // FIXME: It's not possible to cancel a PromiEvent in between of the confirmation, it continues
  //        until it completes (`receipt` event) or error out. We want to quit fast, so we will
  //        quit manually at the end, but not that this might be problematic in other cases since
  //        the actual observer backing the `PromiEvent` is still running and continue to send
  //        events to the `PromiEvent`.
  console.log(`Deploying contract '${contractName}'`)
  const receipt = await promisifyOnFirstConfirmation(
    contract
      .deploy({ arguments: options.contractArguments || [], data: contractBin })
      .send({ from: fromAddress, gas: 93999999, gasPrice: "1", value: options.value })
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
  const contractBin = await readContractBin(
    pathJoin(__dirname, `./contract/build/${contractName}.bin`)
  )

  const tx = await createRawTx(web3, fromAddress, privateKey, {
    from: fromAddress,
    data: contractBin,
    value: options.value
  })

  console.log(`Deploying contract '${contractName}'`)
  const receipt = await promisifyOnFirstConfirmation(sendRawTx(web3, tx))

  return {
    contractAddress: receipt.contractAddress!,
    transactionHash: receipt.transactionHash
  }
}
