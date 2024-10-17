import { join as pathJoin } from "path"
import { readContractBin, setDefaultGasConfig } from "./common"
import {
  precompileWithBalance,
  precompileWithoutBalance,
  randomAddress5,
  randomHex,
  threeWei,
} from "./constants"
import { BattlefieldRunner } from "./runner"

export async function runCalls(
  runner: BattlefieldRunner,
  callsContract: any,
  transfersContract: any,
  childContractAddress: string,
  grandChildContractAddress: string
) {
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
      )
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
      runner.okTxSend("call: call to a precompiled address with balance", {
        to: precompileWithBalance,
      }),

    () =>
      runner.okTxSend("call: call to a precompiled address without balance", {
        to: precompileWithoutBalance,
      }),

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
        callsContract.methods.delegateWithValue(childContractAddress),
        {
          value: threeWei,
        }
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
}
