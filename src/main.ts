import BN from "bn.js"
import { readContractBin, requireProcessEnv, setDefaultGasConfig, waitFor } from "./common"
import { BattlefieldRunner, Network } from "./runner"
import { join as pathJoin } from "path"

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
const randomAddress6 = `0xdead5000${randomHex()}0007beef`

async function main() {
  const network = requireProcessEnv("NETWORK")
  const only = process.env["ONLY"]

  const runner = new BattlefieldRunner(network as Network, {
    ethqUrl: process.env["ETHQ_URL"],
  })

  if (only) {
    runner.only = new RegExp(only)
  }

  console.log("Initializing runner...")
  await runner.initialize()
  runner.printConfiguration()

  console.log("Deploying contracts...")
  setDefaultGasConfig(5_566_000, runner.web3.utils.toWei("50", "gwei"))

  await runner.deployContracts()
  runner.printContracts()

  const mainContract = runner.contracts["main"]
  const callsContract = runner.contracts["calls"]
  const logsContract = runner.contracts["logs"]
  const transfersContract = runner.contracts["transfers"]

  const childContract = runner.contracts["child"]
  const grandChildContract = runner.contracts["grandChild"]
  const suicidal1Contract = runner.contracts["suicidal1"]
  const suicidal2Contract = runner.contracts["suicidal2"]

  const childContractAddress = childContract.options.address
  const grandChildContractAddress = grandChildContract.options.address
  const suicidal2ContractAddress = suicidal2Contract.options.address

  console.log()
  console.log("Performing pure 'transfer' transactions")
  setDefaultGasConfig(21000, runner.web3.utils.toWei("50", "gwei"))

  await runner.parallelize(
    () =>
      runner.okTransfer("pure transfer: existing address", "default", knownExistingAddress, oneWei),
    () =>
      runner.okTransfer(
        "pure transfer: existing address with custom gas limit & price",
        "default",
        knownExistingAddress,
        oneWei,
        {
          gas: 75000,
          gasPrice: runner.web3.utils.toWei("1", "gwei"),
        }
      ),
    () =>
      runner.okTransfer(
        "pure transfer: inexistant address creates account and has an EVM call",
        "default",
        randomAddress1,
        oneWei
      ),
    () =>
      runner.okTransfer(
        "pure transfer: transfer of 0 ETH to inexistant address generates a transaction with no EVM call",
        "default",
        randomAddress2,
        0
      )
  )

  console.log()
  console.log("Performing 'transfer' through contract transactions")
  setDefaultGasConfig(75000, runner.web3.utils.toWei("50", "gwei"))

  await runner.parallelize(
    () =>
      runner.okContractSend(
        "transfer through contract: existing addresss",
        "transfers",
        transfersContract.methods.nativeTransfer(knownExistingAddress),
        {
          from: "default",
          value: oneWei,
        }
      ),
    () =>
      runner.okContractSend(
        "transfer through contract: inexistant address creates account and has an EVM call",
        "transfers",
        transfersContract.methods.nativeTransfer(randomAddress3),
        {
          from: "default",
          value: oneWei,
        }
      ),
    () =>
      runner.okContractSend(
        "nested transfer through contract: existing addresss",
        "transfers",
        transfersContract.methods.nestedNativeTransfer(childContractAddress, knownExistingAddress),
        {
          from: "default",
          value: oneWei,
        }
      ),
    () =>
      runner.okContractSend(
        "nested transfer through contract: inexistant address creates account and has an EVM call",
        "transfers",
        transfersContract.methods.nestedNativeTransfer(childContractAddress, randomAddress4),
        {
          from: "default",
          value: oneWei,
        }
      )
  )

  console.log()
  console.log("Performing failing 'transfer' through contract transactions")
  setDefaultGasConfig(75000, runner.web3.utils.toWei("50", "gwei"))

  await runner.parallelize(() =>
    runner.koContractSend(
      "transfer through contract: existing addresss",
      "transfers",
      transfersContract.methods.nativeTransfer(knownExistingAddress),
      {
        from: "default",
        value: oneWei,
        gas: 22000,
      }
    )
  )

  console.log()
  console.log("Performing 'log' transactions")
  setDefaultGasConfig(95000, runner.web3.utils.toWei("50", "gwei"))

  await runner.parallelize(
    () => runner.okContractSend("log: empty", "main", logsContract.methods.logEmpty()),
    () => runner.okContractSend("log: single", "main", logsContract.methods.logSingle()),
    () => runner.okContractSend("log: all", "main", logsContract.methods.logAll()),
    () => runner.okContractSend("log: all indexed", "main", logsContract.methods.logAllIndexed()),
    () => runner.okContractSend("log: all mixed", "main", logsContract.methods.logAllMixed()),
    () => runner.okContractSend("log: multi", "main", logsContract.methods.logMulti()),
    () =>
      runner.koContractSend(
        "log: log in top-level trx and then top-leve trx fails",
        "logs",
        logsContract.methods.logAndTopLevelFail()
      ),
    () =>
      runner.okContractSend(
        "log: log in sub-call that fails but top-level trx succeed",
        "logs",
        logsContract.methods.logInSubFailedCallButTrxSucceed(childContractAddress)
      ),
    () =>
      runner.koContractSend(
        "log: log in sub-call that succeed but top-level trx fails",
        "logs",
        logsContract.methods.logInSubSuccessCallButTrxFails(childContractAddress)
      )
  )

  console.log()
  console.log("Performing 'storage & input' transactions")
  setDefaultGasConfig(966000, runner.web3.utils.toWei("50", "gwei"))

  const stringTests = [
    ["string equal 0", ""],
    ["string equal 15", "just 15 chars!!"],
    ["string equal 30", "equal directly 30 bytes fillin"],
    ["string equal 31", "equal directly 30 bytes fillin"],
    ["string equal 32", "equal directly 32 bytes filling!"],
    [
      "string longer than 32",
      "really long string larger than 32 bytes to test out solidity splitting stuff",
    ],
  ]

  const promises = [
    ...stringTests.map((input) => {
      return () =>
        runner.okContractSend(
          `input: ${input[0]}`,
          "main",
          mainContract.methods.longStringInput(input[1])
        )
    }),
    () =>
      runner.okContractSend(
        "storage: set long string",
        "main",
        mainContract.methods.setLongString()
      ),
  ]

  await runner.parallelize(...promises)

  // Depends on `setLongString` being set, so it's better to perform it on its own
  await runner.okContractSend("storage: array update", "main", mainContract.methods.setAfter())

  console.log()
  console.log("Performing 'call' & 'constructor' transactions (new contract)")
  setDefaultGasConfig(300000, runner.web3.utils.toWei("50", "gwei"))

  await runner.parallelize(
    () =>
      runner.koDeployContract("call: contract fail just enough gas for intrinsic gas", "Suicidal", {
        // This is the exact minimum required so the transaction pass the JSON-RPC barrier, hopefully it's good for the future, if it fails prior that
        gas: 59244,
      }),

    () =>
      runner.koDeployContract("call: contract fail not enough gas after code_copy", "Suicidal", {
        // This has been found by trial and error such that the transaction reaches GAS_CHANGE ... code_copy but fails afterwards when storing the actual contract on the chain
        gas: 99309,
      }),

    () =>
      runner.okContractSend(
        "call: complete call tree",
        "calls",
        callsContract.methods.completeCallTree(childContractAddress, grandChildContractAddress)
      ),
  )

  console.log()
  console.log("Performing 'call' & 'constructor' transactions")
  setDefaultGasConfig(300000, runner.web3.utils.toWei("50", "gwei"))

  const contractBin = await readContractBin(pathJoin(__dirname, `../contract/build/Suicidal.bin`))
  const saltForCollision = `0x${randomHex()}`

  await runner.parallelize(
    () =>
      runner.koDeployContract("call: contract fail just enough gas for intrinsic gas", "Suicidal", {
        // This is the exact minimum required so the transaction pass the JSON-RPC barrier, hopefully it's good for the future, if it fails prior that
        gas: 59244,
      }),

    () =>
      runner.koDeployContract("call: contract fail not enough gas after code_copy", "Suicidal", {
        // This has been found by trial and error such that the transaction reaches GAS_CHANGE ... code_copy but fails afterwards when storing the actual contract on the chain
        gas: 99309,
      }),

    () =>
      runner.okContractSend(
        "call: complete call tree",
        "calls",
        callsContract.methods.completeCallTree(childContractAddress, grandChildContractAddress)
      ),

    () =>
      runner.okContractSend(
        "call: contract creation from call, without a constructor",
        "calls",
        callsContract.methods.contractWithEmptyConstructor()
      ),

    () =>
      runner.okContractSend(
        "call: contract creation from call, with constructor",
        "calls",
        callsContract.methods.contractWithConstructor()
      ),

      () =>
      runner.okContractSend(
        "call: delegate with value",
        "calls",
        callsContract.methods.delegateWithValue(childContractAddress)
      ),

    () =>
      runner.koContractSend(
        "call: contract creation from call, with constructor that will fail",
        "calls",
        callsContract.methods.contractWithFailingConstructor()
      ),

    () =>
      runner.koContractSend(
        "call: contract creation from call, recursive constructor, second will fail",
        "calls",
        callsContract.methods.contracFailingRecursiveConstructor()
      ),

    () =>
      runner.okContractSend(
        "call: nested fail with native transfer",
        "transfers",
        transfersContract.methods.nestedFailtNativeTransfer(childContractAddress, randomAddress5),
        {
          value: threeWei,
        }
      ),

    () =>
      runner.okContractSend(
        "call: nested call revert state changes",
        "calls",
        callsContract.methods.nestedRevertFailure(childContractAddress)
      ),

    () =>
      runner.okContractSend(
        "call: all pre-compiled",
        "calls",
        callsContract.methods.allPrecompiled()
      ),

    () =>
      runner.koContractSend(
        "call: assert failure root call",
        "calls",
        callsContract.methods.assertFailure()
      ),

    () =>
      runner.koContractSend(
        "call: revert failure root call",
        "calls",
        callsContract.methods.revertFailure()
      ),

    () =>
      runner.koContractSend(
        "call: assert failure on child call",
        "calls",
        callsContract.methods.nestedAssertFailure(childContractAddress)
      ),

    () =>
      runner.okContractSend(
        "call: contract with create2, inner call fail due to insufficent funds (transaction succeed though)",
        "calls",
        callsContract.methods.contractCreate2(
          contractBin,
          "300000000000000000000000000000",
          `0x${randomHex()}`,
          false
        )
      ),

    () =>
      runner.koContractSend(
        "call: contract with create2, inner call fail due to insufficent funds then revert",
        "calls",
        callsContract.methods.contractCreate2(
          contractBin,
          "300000000000000000000000000000",
          `0x${randomHex()}`,
          true
        )
      ),

    () =>
      runner.okContractSend(
        "call: contract with create2, succesful creation",
        "calls",
        callsContract.methods.contractCreate2(contractBin, "0", saltForCollision, false)
      )
  )

  // Depends on 'contract with create2, succesful creation' to run, so needs to be peformed afterward
  await runner.parallelize(
    () =>
      runner.okContractSend(
        "call: contract with create2, inner call fail due to address already exists (transaction succeed though)",
        "calls",
        callsContract.methods.contractCreate2(contractBin, "0", saltForCollision, false)
      ),

    () =>
      runner.koContractSend(
        "call: contract with create2, inner call fail due to address already exists then revert",
        "calls",
        callsContract.methods.contractCreate2(contractBin, "0", saltForCollision, true)
      )
  )

  console.log()
  console.log("Performing 'gas' transactions")

  await runner.parallelize(
    () =>
      runner.okContractSend(
        "gas: empty call for lowest gas",
        "main",
        mainContract.methods.emptyCallForLowestGas()
      ),

    () =>
      runner.okContractSend(
        "gas: nested low gas",
        "main",
        mainContract.methods.nestedLowGas(childContractAddress)
      ),

    () =>
      runner.okContractSend(
        "gas: deep nested nested call for lowest gas",
        "main",
        mainContract.methods.nestedCallForLowestGas(childContractAddress)
      ),

    () =>
      runner.okContractSend(
        "gas: deep nested low gas",
        "main",
        mainContract.methods.deepNestedLowGas(childContractAddress, grandChildContractAddress)
      ),

    () =>
      runner.okContractSend(
        "gas: deep nested call for lowest gas",
        "main",
        mainContract.methods.deepNestedCallForLowestGas(
          childContractAddress,
          grandChildContractAddress
        )
      )
  )

  console.log()
  console.log("Performing 'suicide' transactions")

  setDefaultGasConfig(5566000, runner.web3.utils.toWei("50", "gwei"))

  await runner.parallelize(
    () =>
      runner.okContractSend(
        "suicide: contract does not hold any Ether",
        "suicidal1",
        suicidal1Contract.methods.kill()
      ),

    () =>
      runner.okContractSend(
        "suicide: create contract, kill it and try to call within same call",
        "calls",
        callsContract.methods.contractSuicideThenCall()
      ),

    () =>
      runner.okContractSend(
        "suicide: create contract to fixed address (create2), kill it and try instantiate it again at same address",
        "calls",
        callsContract.methods.contractFixedAddressSuicideThenTryToCreateOnSameAddress()
      ),

    () =>
      runner.okContractSend(
        "suicide: ensure suicidal2 bump is nonce by creating a contract (#1)",
        "suicidal2",
        suicidal2Contract.methods.createContract()
      ),

    () =>
      runner.okContractSend(
        "suicide: ensure suicidal2 bump is nonce by creating a contract (#2)",
        "suicidal2",
        suicidal2Contract.methods.createContract()
      ),

    // A suicide where the contract does hold some Ether, and refund owner on destruct
    () =>
      runner.okTransfer(
        "suicide: transfer some Ether to contract suicide that's about to suicide itself",
        "default",
        suicidal2ContractAddress,
        oneWei
      )
  )

  // Depends on transfer some transaction above, so let's run it only afterwards
  await runner.parallelize(
    () =>
      runner.okContractSend(
        "suicide: contract does hold some Ether, and refund owner on destruct",
        "suicidal2",
        suicidal2Contract.methods.kill()
      ),

    () =>
      runner.okContractSend(
        "suicide: create contract to fixed address (create2), kill it and try instantiate it again at same address",
        "calls",
        callsContract.methods.contractFixedAddressSuicideThenTryToCreateOnSameAddress()
      ),

    () =>
      runner.okContractSend(
        "suicide: create contract, kill it and try to call within same call (second time to valid nonce change after suicide)",
        "calls",
        callsContract.methods.contractSuicideThenCall()
      )
  )

  // Close eagerly as there is a bunch of pending not fully resolved promises due to PromiEvent
  console.log()
  console.log(`Completed battlefield deployment (${network})`)
  process.exit(0)
}

main()
  .then(() => {
    console.log("Finished!")
  })
  .catch((error) => {
    console.error("An error occurred", error)
    process.exit(1)
  })
