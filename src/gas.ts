import { BattlefieldRunner } from "./runner"

export async function runGas(
  runner: BattlefieldRunner,
  mainContract: any,
  childContractAddress: string,
  grandChildContractAddress: string
) {
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
}
