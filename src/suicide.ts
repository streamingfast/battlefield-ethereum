import { setDefaultGasConfig } from "./common"
import { oneWei, precompileWithBalance, precompileWithoutBalance } from "./constants"
import { BattlefieldRunner } from "./runner"

export async function runSuicide(
  runner: BattlefieldRunner,
  suicidal1Contract: any,
  suicidal2Contract: any,
  callsContract: any,
  suicidal2ContractAddress: string
) {
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

  await runner.parallelize(
    () =>
      runner.okTxSend(
        "call: call to a precompiled address with balance again at the very end, to see effect on OnNewAccount",
        {
          to: precompileWithBalance,
        }
      ),

    () =>
      runner.okTxSend(
        "call: call to a precompiled address without balance again at the very end, to see effect on OnNewAccount",
        {
          to: precompileWithoutBalance,
        }
      )
  )
}
