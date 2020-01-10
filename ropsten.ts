import { join as pathJoin } from "path"
import Web3 from "web3"
import { HttpProvider } from "web3-providers"
import {
  readContract,
  promisifyOnFirstConfirmation,
  requireProcessEnv,
  initialDefaultAddress,
  getDefaultAddress,
  setDefaultGasConfig,
  sendRawTx,
  createRawTx,
  setDefaultTxOptions,
  GasOptions,
  getDefaultGasConfig,
  getDefaultSendOptions
} from "./common"
import { ContractSendMethod, SendOptions, Contract } from "web3-eth-contract"
import { deployContractRaw } from "./deploy"

const rpcEndpoint = process.env["RPC_ENDPOINT"] || "https://ropsten.infura.io/json-rpc/"

let web3 = new Web3(new HttpProvider(rpcEndpoint))
let privateKey: Buffer = Buffer.of()

async function main() {
  requireProcessEnv("PRIVATE_KEY")
  requireProcessEnv("FROM_ADDRESS")

  const defaultAddress = await initialDefaultAddress(web3.eth, process.env["FROM_ADDRESS"])
  setDefaultTxOptions({ chain: "ropsten", hardfork: "istanbul" })

  const privateKeyRaw = process.env["PRIVATE_KEY"]!

  console.log("Configuration")
  console.log(` Default address: ${defaultAddress}`)
  console.log(` Private key: ${privateKeyRaw}`)
  console.log(` RPC Endpoint: ${rpcEndpoint}`)

  console.log()

  privateKey = Buffer.from(privateKeyRaw, "hex")

  // console.log("Deploying contracts...")
  // setDefaultGasConfig(3066000, web3.utils.toWei("50", "gwei"))

  // const mainDeployment = await deployContractRaw(web3, defaultAddress, privateKey, "Main")
  // const childDeployment = await deployContractRaw(web3, defaultAddress, privateKey, "Child")
  // const grandChildDeployment = await deployContractRaw(
  //   web3,
  //   defaultAddress,
  //   privateKey,
  //   "Grandchild",
  //   {
  //     contractArguments: ["0x0000000000000000000000000000000000000330", false],
  //     value: "25000"
  //   }
  // )
  // const suicidal1Deployment = await deployContractRaw(web3, defaultAddress, privateKey, "Suicidal")
  // const suicidal2Deployment = await deployContractRaw(web3, defaultAddress, privateKey, "Suicidal")
  // console.log()

  // const mainAddress = mainDeployment.contractAddress
  // const childAddress = childDeployment.contractAddress
  // const grandChildAddress = grandChildDeployment.contractAddress
  // const suicidal1Address = suicidal1Deployment.contractAddress
  // const suicidal2Address = suicidal2Deployment.contractAddress

  // Placeholder to keep current active addresses
  const mainAddress = "0x604f77048D705aF06FBc794057FeC16D29b8cf24"
  const childAddress = "0x22D2716f5F032b08a37703E175E99Cc181259775"
  const grandChildAddress = "0x0AEE80101BfBdDE780aCA8A36Ba2B1cbb03E7A85"
  const suicidal1Address = "0x5bA93f3A5d908dD1e9fAeB3D42CCef2df607D48a"
  const suicidal2Address = "0x2ab753147956E9890A3337c4403EC03C8736D745"

  const mainContract = await getContract("Main", mainAddress)
  const childContract = await getContract("Child", childAddress)
  const grandChildContract = await getContract("Grandchild", grandChildAddress)
  const suicidal1Contract = await getContract("Suicidal", suicidal1Address)
  const suicidal2Contract = await getContract("Suicidal", suicidal2Address)

  console.log("Contracts")
  console.log(`const mainAddress = "${mainContract.address}"`)
  console.log(`const childAddress = "${childContract.address}"`)
  console.log(`const grandChildAddress = "${grandChildContract.address}"`)
  console.log(`const suicidal1Address = "${suicidal1Contract.address}"`)
  console.log(`const suicidal2Address = "${suicidal2Contract.address}"`)

  console.log()

  if (process.argv.length > 2 && process.argv[2] == "deployOnly") {
    console.log(
      "Quitting since requested 'deployOnly', don't forget to update hard-coded addresses!"
    )
    process.exit(0)
  }

  console.log("Performing 'storage & input' transactions")
  setDefaultGasConfig(966000, web3.utils.toWei("50", "gwei"))

  await okSend(mainContract, mainContract.methods.setLongString())
  await okSend(mainContract, mainContract.methods.setAfter())
  await okSend(
    mainContract,
    mainContract.methods.longStringInput(
      "realy long string larger than 32 bytes to test out solidity splitting stuff"
    )
  )

  console.log("Performing 'log' transactions")
  setDefaultGasConfig(966000, web3.utils.toWei("50", "gwei"))

  await okSend(mainContract, mainContract.methods.logEmpty())
  await okSend(mainContract, mainContract.methods.logSingle())
  await okSend(mainContract, mainContract.methods.logAll())
  await okSend(mainContract, mainContract.methods.logAllIndexed())
  await okSend(mainContract, mainContract.methods.logAllMixed())
  await okSend(mainContract, mainContract.methods.logMulti())

  console.log("Performing 'transfer' transactions")
  setDefaultGasConfig(966000, web3.utils.toWei("50", "gwei"))

  console.log("Transfer native to an inexistant address creates it and has an EVM call")
  await okTransfer(defaultAddress, "0xa00b0000000e00000f0001000003000040501001", 0.000000000001)

  console.log(
    "Transfer native of 0 to an inexistant address, generates a transaction without an EVM call"
  )
  await okTransfer(defaultAddress, "0xb00c0000000f0000010002000004000050602002", 0)

  console.log("Transfer to existing address")
  await okSend(
    mainContract,
    mainContract.methods.nativeTransfer("0xa00b0000000e00000f0001000003000040501001"),
    {
      from: defaultAddress,
      value: 0.000000000002
    }
  )

  console.log("Transfer to new address")
  await okSend(
    mainContract,
    mainContract.methods.nativeTransfer("0xc00d000000010000020003000005000060703003"),
    {
      from: defaultAddress,
      value: 0.000000000003
    }
  )

  console.log("Nested transfer to existing address")
  await okSend(
    mainContract,
    mainContract.methods.nestedNativeTransfer(
      childContract.address,
      "0xb00c0000000f0000010002000004000050602002"
    ),
    {
      from: defaultAddress,
      value: 0.000000000004
    }
  )

  console.log("Nested transfer to new address")
  await okSend(
    mainContract,
    mainContract.methods.nestedNativeTransfer(
      childContract.address,
      "0xc00d000000010000020003000005000060704004"
    ),
    {
      from: defaultAddress,
      value: 0.000000000005
    }
  )

  // Close eagerly as there is a bunch of pending not fully resolved promises due to PromiEvent
  console.log("Completed battlefield deployment on ETH Ropsten")
  process.exit(0)
}

async function waitFor(timeInMs: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, timeInMs)
  })
}

async function getContract(contractName: string, address: string) {
  const contract = await readContract(
    web3.eth,
    pathJoin(__dirname, `./contract/build/${contractName}.abi`)
  )
  contract.address = address

  return contract
}

async function okSend(
  contract: Contract,
  trx: ContractSendMethod,
  sendOptions: SendOptions = { from: getDefaultAddress() }
) {
  try {
    const tx = await createRawTx(web3, sendOptions.from, privateKey, {
      ...sendOptions,
      to: contract.address,
      data: trx.encodeABI()
    })

    const receipt = await promisifyOnFirstConfirmation(sendRawTx(web3, tx))

    // See https://ethereum.stackexchange.com/a/6003
    if (receipt.gasUsed == sendOptions!.gas) {
      console.log(`Transaction '${receipt.transactionHash}' failed`)
      throw new Error(`Unexpected transaction ${receipt.transactionHash} failure`)
    }
  } catch (error) {
    console.log(`Transaction failed`, error)
    throw new Error(`Unexpected transaction failure`)
  }

  return
}

async function okTransfer(
  from: string,
  to: string,
  value: string | number,
  gasOptions: GasOptions = {}
) {
  try {
    const options = {
      from,
      to,
      value,
      gas: gasOptions.gas || getDefaultGasConfig().gasLimit,
      gasPrice: gasOptions.gasPrice || getDefaultGasConfig().gasPrice
    }
    const tx = await createRawTx(web3, from, privateKey, options)

    const receipt = await promisifyOnFirstConfirmation(sendRawTx(web3, tx))

    // See https://ethereum.stackexchange.com/a/6003
    if (receipt.gasUsed == options.gas) {
      console.log(`Transaction '${receipt.transactionHash}' failed`)
      throw new Error(`Unexpected transaction ${receipt.transactionHash} failure`)
    }
  } catch (error) {
    console.log(`Transaction failed`, error)
    throw new Error(`Unexpected transaction failure`)
  }

  return
}

function send(trx: ContractSendMethod, options?: SendOptions) {
  options = { ...getDefaultSendOptions(), ...(options || {}) }

  return {
    options,
    promiEvent: trx.send(options)
  }
}

main()
  .then(() => {
    console.log("Finished!")
  })
  .catch((error) => {
    console.error("An error occurred", error)
    process.exit(1)
  })
