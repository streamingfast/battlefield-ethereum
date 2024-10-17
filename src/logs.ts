import { setDefaultGasConfig } from "./common"
import { BattlefieldRunner } from "./runner"

export async function runLogs(
  runner: BattlefieldRunner,
  logsContract: any,
  childContractAddress: string
) {
  console.log()
  console.log("Performing 'log' transactions")
  setDefaultGasConfig(95000, runner.web3.utils.toWei("50", "gwei"))

  await runner.parallelize(
    () =>
      runner.okContractSend(
        "log: no topics (log0)",
        "logs",
        logsContract.methods.logNoTopics(),
        undefined,
        true
      ),
    () =>
      runner.okContractSend("log: empty", "logs", logsContract.methods.logEmpty(), undefined, true),
    () =>
      runner.okContractSend(
        "log: single",
        "logs",
        logsContract.methods.logSingle(),
        undefined,
        true
      ),
    () => runner.okContractSend("log: all", "logs", logsContract.methods.logAll(), undefined, true),
    () =>
      runner.okContractSend(
        "log: all indexed",
        "logs",
        logsContract.methods.logAllIndexed(),
        undefined,
        true
      ),
    () =>
      runner.okContractSend(
        "log: all mixed",
        "logs",
        logsContract.methods.logAllMixed(),
        undefined,
        true
      ),
    () =>
      runner.okContractSend("log: multi", "logs", logsContract.methods.logMulti(), undefined, true),
    () =>
      runner.koContractSend(
        "log: log in top-level trx and then top-level trx fails",
        "logs",
        logsContract.methods.logAndTopLevelFail()
      ),
    () =>
      runner.okContractSend(
        "log: log in sub-call that fails but top-level trx succeed",
        "logs",
        logsContract.methods.logInSubFailedCallButTrxSucceed(childContractAddress),
        undefined,
        true
      ),
    () =>
      runner.koContractSend(
        "log: log in sub-call that succeed but top-level trx fails",
        "logs",
        logsContract.methods.logInSubSuccessCallButTrxFails(childContractAddress)
      )
  )
}
