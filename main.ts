import { join as pathJoin } from "path"
import Web3 from "web3"
import { HttpProvider } from "web3-providers"
import { addressOrDefault, readContract, promisifyOnFirstConfirmation } from "./common"
import { deployContract } from "./deploy"
import { ContractSendMethod, SendOptions } from "web3-eth-contract"

let web3 = new Web3(new HttpProvider("http://localhost:8545"))
let defaultAddress = ""

async function main() {
  defaultAddress = await addressOrDefault(web3.eth, process.env["FROM_ADDRESS"])
  console.log("Configuration")
  console.log(` Default address: ${defaultAddress}`)
  console.log()

  console.log("Deploying contracts...")
  const mainDeployment = await deployContract(web3, defaultAddress, "Main")
  const childDeployment = await deployContract(web3, defaultAddress, "Child")
  const grandChildDeployment = await deployContract(web3, defaultAddress, "Grandchild", {
    contractArguments: ["0x0000000000000000000000000000000000000330", false],
    value: "25000"
  })
  const suicidal1Deployment = await deployContract(web3, defaultAddress, "Suicidal")
  const suicidal2Deployment = await deployContract(web3, defaultAddress, "Suicidal")

  const mainContract = await getContract("Main", mainDeployment.contractAddress)
  const childContract = await getContract("Child", childDeployment.contractAddress)
  const grandChildContract = await getContract("Grandchild", grandChildDeployment.contractAddress)
  const suicidal1Contract = await getContract("Suicidal", suicidal1Deployment.contractAddress)
  const suicidal2Contract = await getContract("Suicidal", suicidal2Deployment.contractAddress)

  console.log("Contracts")
  console.log(` Main: ${mainDeployment.contractAddress}`)
  console.log(` Child: ${childDeployment.contractAddress}`)
  console.log(` Grand Child: ${grandChildDeployment.contractAddress}`)
  console.log(` Suicidal1: ${suicidal1Deployment.contractAddress}`)
  console.log(` Suicidal2: ${suicidal2Deployment.contractAddress}`)

  console.log()

  console.log("Performing 'transfer' transactions")
  // Transfer native between two existing accounts
  await promisifyOnFirstConfirmation(
    web3.eth.sendTransaction({
      from: defaultAddress,
      to: "0xd549d2fd4b177767b84ab2fd17423cee1cf1d7bd",
      value: 1e18
    })
  )

  // Transfer native of to an inexistant address creates it and has an EVM call
  await promisifyOnFirstConfirmation(
    web3.eth.sendTransaction({
      from: defaultAddress,
      to: "0x0000000000000000000000000000000000001001",
      value: 1e18
    })
  )

  // Transfer native of 0 value to an inexistant address which genrates a transaction without an EVM call
  await promisifyOnFirstConfirmation(
    web3.eth.sendTransaction({
      from: defaultAddress,
      to: "0x0000000000000000000000000000000000005005",
      value: 0
    })
  )

  // Transfer to existing address
  await okSend(mainContract.methods.nativeTransfer("0xd549d2fd4b177767b84ab2fd17423cee1cf1d7bd"), {
    from: defaultAddress,
    value: "0x1234"
  })

  // Transfer to new address
  await okSend(mainContract.methods.nativeTransfer("0x0000000000000000000000000000000000002002"), {
    from: defaultAddress,
    value: "0x5678"
  })

  // Nested transfer to existing address
  await okSend(
    mainContract.methods.nestedNativeTransfer(
      childContract.address,
      "0xd549d2fd4b177767b84ab2fd17423cee1cf1d7bd"
    ),
    {
      from: defaultAddress,
      value: "0x9abc"
    }
  )

  // Nested transfer to new address
  await okSend(
    mainContract.methods.nestedNativeTransfer(
      childContract.address,
      "0x0000000000000000000000000000000000003003"
    ),
    {
      from: defaultAddress,
      value: "0xdeff"
    }
  )

  console.log("Performing 'call' transactions")
  await okSend(
    mainContract.methods.completeCallTree(childContract.address, grandChildContract.address)
  )
  await okSend(mainContract.methods.contractWithConstructor())
  await okSend(mainContract.methods.contractWithEmptyConstructor())

  // FIXME: Enabling any other make the full suite go hairy, either never ending
  //        straight in the now un-commented transaction or later in the first
  //        `gas` transaction. Really not clear why, but I don't get it ... yet!
  // await koSend(mainContract.methods.assertFailure())
  await koSend(mainContract.methods.revertFailure())
  // await koSend(mainContract.methods.nestedAssertFailure(childContract.address))
  // await okSend(mainContract.methods.nestedRevertFailure(childContract.address))

  console.log("Performing 'gas' transactions")
  await okSend(
    mainContract.methods.deepNestedCallForLowestGas(
      childContract.address,
      grandChildContract.address
    )
  )
  await okSend(
    mainContract.methods.deepNestedLowGas(childContract.address, grandChildContract.address)
  )
  await okSend(mainContract.methods.nestedCallForLowestGas(childContract.address))
  await okSend(mainContract.methods.nestedLowGas(childContract.address))
  await okSend(mainContract.methods.emptyCallForLowestGas())

  console.log("Performing 'storage & input' transactions")
  await okSend(mainContract.methods.setLongString())
  await okSend(mainContract.methods.setAfter())
  await okSend(
    mainContract.methods.longStringInput(
      "realy long string larger than 32 bytes to test out solidity splitting stuff"
    )
  )

  console.log("Performing 'log' transactions")
  await okSend(mainContract.methods.logEmpty())
  await okSend(mainContract.methods.logSingle())
  await okSend(mainContract.methods.logAll())
  await okSend(mainContract.methods.logAllIndexed())
  await okSend(mainContract.methods.logAllMixed())
  await okSend(mainContract.methods.logMulti())

  console.log("Performing 'suicide' transactions")
  // A suicide where the contract does **not** hold any Ether
  await okSend(suicidal1Contract.methods.kill())

  // A suicide where the contract does hold some Ether, and refund owner on destruct
  await promisifyOnFirstConfirmation(
    web3.eth.sendTransaction({
      from: defaultAddress,
      to: suicidal2Deployment.contractAddress,
      value: 1e18
    })
  )
  await okSend(suicidal2Contract.methods.kill())

  // Close eagerly as there is a bunch of pending not fully resolved promises due to PromiEvent
  console.log("Completed battlefield tests")
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

async function okSend(trx: any, sendOptions?: SendOptions) {
  try {
    const result = send(trx, sendOptions)
    sendOptions = result.sendOptions

    const receipt = await promisifyOnFirstConfirmation(result.promiEvent)

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

async function koSend(trx: any, sendOptions?: SendOptions) {
  let receipt
  try {
    const result = send(trx, sendOptions)
    sendOptions = result.sendOptions

    receipt = await promisifyOnFirstConfirmation(result.promiEvent)
  } catch (error) {
    // Expected failure, do nothing
    return
  }

  if (receipt.gasUsed != sendOptions!.gas) {
    console.log(
      `Transaction '${receipt.transactionHash}' expected to failed, but succeed?`,
      receipt,
      sendOptions!.gas
    )
    throw new Error(`Unexpected transaction ${receipt.transactionHash} success`)
  }
}

function send(trx: ContractSendMethod, sendOptions?: SendOptions) {
  if (sendOptions === undefined) {
    sendOptions = {
      from: defaultAddress
    }
  }

  if (sendOptions.gas == undefined) {
    sendOptions.gas = 93999999
  }

  if (sendOptions.gasPrice == undefined) {
    sendOptions.gasPrice = "1"
  }

  if (sendOptions.from == undefined) {
    sendOptions.from = defaultAddress
  }

  return {
    sendOptions,
    promiEvent: trx.send(sendOptions)
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
