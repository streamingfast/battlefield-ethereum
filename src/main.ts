import { runCalls } from "./calls"
import { requireProcessEnv, setDefaultGasConfig } from "./common"
import { runGas } from "./gas"
import { runLogs } from "./logs"
import { BattlefieldRunner, Network } from "./runner"
import { runStorages } from "./storages"
import { runSuicide } from "./suicide"
import { runTransfers } from "./transfers"

async function main() {
  const network = requireProcessEnv("NETWORK")
  const only = process.env["ONLY"]
  const transfersOnly = process.env["TRANSFERS_ONLY"]
  const logsOnly = process.env["LOGS_ONLY"]
  const storagesOnly = process.env["STORAGES_ONLY"]
  const callsOnly = process.env["CALLS_ONLY"]
  const gasOnly = process.env["GAS_ONLY"]
  const suicideOnly = process.env["SUICIDE_ONLY"]
  const all = shouldRunAll()

  const runner = new BattlefieldRunner(network as Network, {
    ethqUrl: process.env["ETHQ_URL"],
  })

  if (only) {
    runner.only = new RegExp(only)
  }

  console.log("Initializing runner...")
  await runner.initialize()
  runner.printConfiguration()

  console.log("Setting default Gas configudation to 5_566_000 gas and 50 gwei")
  setDefaultGasConfig(5_566_000, runner.web3.utils.toWei("50", "gwei"))

  console.log("Deploying contracts...")
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

  if (all || transfersOnly) {
    await runTransfers(runner, transfersContract, childContractAddress)
  }

  if (all || logsOnly) {
    await runLogs(runner, logsContract, childContractAddress)
  }

  if (all || storagesOnly) {
    await runStorages(runner, mainContract)
  }

  if (all || callsOnly) {
    await runCalls(
      runner,
      callsContract,
      transfersContract,
      childContractAddress,
      grandChildContractAddress
    )
  }

  if (all || gasOnly) {
    await runGas(runner, mainContract, childContractAddress, grandChildContractAddress)
  }

  if (all || suicideOnly) {
    await runSuicide(
      runner,
      suicidal1Contract,
      suicidal2Contract,
      callsContract,
      suicidal2ContractAddress
    )
  }

  console.log()
  console.log(`Completed battlefield deployment (${network})`)
  let output = JSON.stringify(runner.jsonOutput)
  console.log(output)

  process.exit(0)
}

function shouldRunAll(): boolean {
  for (const key in process.env) {
    if (key.includes("ONLY")) {
      return false
    }
  }
  return true
}

main()
  .then(() => {
    console.log("Finished!")
  })
  .catch((error) => {
    console.error("An error occurred", error)
    process.exit(1)
  })
