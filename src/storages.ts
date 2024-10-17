import { setDefaultGasConfig } from "./common"
import { BattlefieldRunner } from "./runner"

export async function runStorages(runner: BattlefieldRunner, mainContract: any) {
  console.log()
  console.log("Performing 'storage & input' transactions")
  setDefaultGasConfig(966000, runner.web3.utils.toWei("50", "gwei"))

  const promises = [
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
}
