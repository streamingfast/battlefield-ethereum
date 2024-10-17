import { setDefaultGasConfig } from "./common"
import {
  knownExistingAddress,
  oneWei,
  precompileWithBalance,
  randomAddress1,
  randomAddress2,
  randomAddress3,
  randomAddress4,
} from "./constants"
import { BattlefieldRunner } from "./runner"

export async function runTransfers(
  runner: BattlefieldRunner,
  transfersContract: any,
  childContractAddress: string
) {
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
      ),
    () =>
      runner.okTransfer(
        "pure transfer: to precompile address",
        "default",
        precompileWithBalance,
        oneWei,
        { gas: 75000 }
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
}
