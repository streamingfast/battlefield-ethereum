import BN from "bn.js"
import { requireProcessEnv, setDefaultGasConfig } from "./common"
import { BattlefieldRunner, Network } from "./runner"

const randomHex6chars = () => ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0")
const randomHex = () =>
  randomHex6chars() + randomHex6chars() + randomHex6chars() + randomHex6chars()

const oneWei = new BN(1)
const threeWei = new BN(3)

const knownExistingAddress = "0xd549d2fd4b177767b84ab2fd17423cee1cf1d7bd"
const randomAddress1 = `0xdead1000${randomHex()}0002beef`
const randomAddress2 = `0xdead2000${randomHex()}0001beef`
const randomAddress3 = `0xdead3000${randomHex()}0004beef`
const randomAddress4 = `0xdead4000${randomHex()}0003beef`
const randomAddress5 = `0xdead5000${randomHex()}0006beef`

async function main() {
  const network = requireProcessEnv("NETWORK")
  const only = process.env["ONLY"]

  const runner = new BattlefieldRunner(network as Network)
  if (only) {
    runner.only = new RegExp(only)
  }

  await runner.initialize()
  runner.printConfiguration()

  console.log("Deploying contracts...")
  setDefaultGasConfig(3566000, runner.web3.utils.toWei("50", "gwei"))

  await runner.deployContracts()
  runner.printContracts()

  const mainContract = runner.contracts["main"]
  const childContract = runner.contracts["child"]
  const grandChildContract = runner.contracts["grandChild"]
  const suicidal1Contract = runner.contracts["suicidal1"]
  const suicidal2Contract = runner.contracts["suicidal2"]

  console.log()
  console.log("Performing pure 'transfer' transactions")
  setDefaultGasConfig(21000, runner.web3.utils.toWei("50", "gwei"))

  await runner.okTransfer(
    "pure transfer: existing address",
    "default",
    knownExistingAddress,
    oneWei
  )

  await runner.okTransfer(
    "pure transfer: existing address with custom gas limit & price",
    "default",
    knownExistingAddress,
    oneWei,
    {
      gas: 75000,
      gasPrice: runner.web3.utils.toWei("1", "gwei"),
    }
  )

  await runner.okTransfer(
    "pure transfer: inexistant address creates account and has an EVM call",
    "default",
    randomAddress1,
    oneWei
  )

  await runner.okTransfer(
    "pure transfer: transfer of 0 ETH to inexistant address generates a transaction with no EVM call",
    "default",
    randomAddress2,
    0
  )

  console.log()
  console.log("Performing 'transfer' through contract transactions")
  setDefaultGasConfig(75000, runner.web3.utils.toWei("50", "gwei"))

  await runner.okContractSend(
    "transfer through contract: existing addresss",
    "main",
    mainContract.methods.nativeTransfer(knownExistingAddress),
    {
      from: "default",
      value: oneWei,
    }
  )

  await runner.okContractSend(
    "transfer through contract: inexistant address creates account and has an EVM call",
    "main",
    mainContract.methods.nativeTransfer(randomAddress3),
    {
      from: "default",
      value: oneWei,
    }
  )

  await runner.okContractSend(
    "nested transfer through contract: existing addresss",
    "main",
    mainContract.methods.nestedNativeTransfer(childContract.address, knownExistingAddress),
    {
      from: "default",
      value: oneWei,
    }
  )

  // Nested transfer to new address
  await runner.okContractSend(
    "nested transfer through contract: inexistant address creates account and has an EVM call",
    "main",
    mainContract.methods.nestedNativeTransfer(childContract.address, randomAddress4),
    {
      from: "default",
      value: oneWei,
    }
  )

  console.log()
  console.log("Performing 'log' transactions")
  setDefaultGasConfig(95000, runner.web3.utils.toWei("50", "gwei"))

  await runner.okContractSend("log: empty", "main", mainContract.methods.logEmpty())
  await runner.okContractSend("log: single", "main", mainContract.methods.logSingle())
  await runner.okContractSend("log: all", "main", mainContract.methods.logAll())
  await runner.okContractSend("log: all indexed", "main", mainContract.methods.logAllIndexed())
  await runner.okContractSend("log: all mixed", "main", mainContract.methods.logAllMixed())
  await runner.okContractSend("log: multi", "main", mainContract.methods.logMulti())

  console.log()
  console.log("Performing 'storage & input' transactions")
  setDefaultGasConfig(966000, runner.web3.utils.toWei("50", "gwei"))

  await runner.okContractSend("storage: long string", "main", mainContract.methods.setLongString())
  await runner.okContractSend("storage: array update", "main", mainContract.methods.setAfter())
  await runner.okContractSend(
    "storage: long string input",
    "main",
    mainContract.methods.longStringInput(
      "realy long string larger than 32 bytes to test out solidity splitting stuff"
    )
  )

  console.log()
  console.log("Performing 'call' transactions")
  setDefaultGasConfig(300000, runner.web3.utils.toWei("50", "gwei"))

  await runner.okContractSend(
    "call: complete call tree",
    "main",
    mainContract.methods.completeCallTree(childContract.address, grandChildContract.address)
  )

  await runner.okContractSend(
    "call: contract creation from call, without a constructor",
    "main",
    mainContract.methods.contractWithEmptyConstructor()
  )

  await runner.okContractSend(
    "call: contract creation from call, with constructor",
    "main",
    mainContract.methods.contractWithConstructor()
  )

  await runner.okContractSend(
    "call: nested fail with native transfer",
    "main",
    mainContract.methods.nestedFailtNativeTransfer(childContract.address, randomAddress5),
    {
      value: threeWei,
    }
  )

  await runner.okContractSend(
    "call: nested call revert state changes",
    "main",
    mainContract.methods.nestedRevertFailure(childContract.address)
  )

  // FIXME: Enabling any other make the full suite go hairy, either never ending
  //        straight in the now un-commented transaction or later in the first
  //        `gas` transaction. Really not clear why, but I don't get it ... yet!
  // await koSend(mainContract.methods.assertFailure())

  // FIXME: Port me to new runner!
  // await koSend(mainContract.methods.revertFailure())
  // await koSend(mainContract.methods.nestedAssertFailure(childContract.address))

  console.log()
  console.log("Performing 'gas' transactions")
  await runner.okContractSend(
    "gas: empty call for lowest gas",
    "main",
    mainContract.methods.emptyCallForLowestGas()
  )

  await runner.okContractSend(
    "gas: nested low gas",
    "main",
    mainContract.methods.nestedLowGas(childContract.address)
  )

  await runner.okContractSend(
    "gas: deep nested nested call for lowest gas",
    "main",
    mainContract.methods.nestedCallForLowestGas(childContract.address)
  )

  await runner.okContractSend(
    "gas: deep nested low gas",
    "main",
    mainContract.methods.deepNestedLowGas(childContract.address, grandChildContract.address)
  )

  await runner.okContractSend(
    "gas: deep nested call for lowest gas",
    "main",
    mainContract.methods.deepNestedCallForLowestGas(
      childContract.address,
      grandChildContract.address
    )
  )

  console.log()
  console.log("Performing 'suicide' transactions")

  await runner.okContractSend(
    "suicide: contract does not hold any Ether",
    "suicidal1",
    suicidal1Contract.methods.kill()
  )

  // A suicide where the contract does hold some Ether, and refund owner on destruct
  await runner.okTransfer(
    "suicide: transfer some Ether to contract that's about to suicide itself",
    "default",
    runner.contracts.suicidal2.address,
    oneWei
  )

  await runner.okContractSend(
    "suicide: contract does hold some Ether, and refund owner on destruct",
    "suicidal2",
    suicidal2Contract.methods.kill()
  )

  // Close eagerly as there is a bunch of pending not fully resolved promises due to PromiEvent
  console.log()
  console.log(`Completed battlefield deployment (${network})`)
  process.exit(0)
}

async function waitFor(timeInMs: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, timeInMs)
  })
}

main()
  .then(() => {
    console.log("Finished!")
  })
  .catch((error) => {
    console.error("An error occurred", error)
    process.exit(1)
  })