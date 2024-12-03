import { getBytes, NonceManager } from "ethers"
import { initChainStaticInfo } from "./lib/chain"
import hre from "hardhat"
import { Child__factory, Logs__factory, Main__factory, Transfers__factory } from "../typechain-types"
import debugFactory from "debug"
import { addFirehoseEthereumMatchers } from "./lib/assertions"
import { use } from "chai"
import { executeTransactions, sendImmediateEth } from "./lib/ethereum"
import { knownExistingAddress } from "./lib/addresses"
import { oneWei } from "./lib/money"

export let owner: NonceManager
export let ownerAddress: string
export let ownerAddressBytes: Uint8Array

export let MainFactory: Main__factory
export let ChildFactory: Child__factory
export let LogsFactory: Logs__factory
export let TransfersFactory: Transfers__factory

const debug = debugFactory("battlefield:global")

use(addFirehoseEthereumMatchers)

before(async () => {
  const start = Date.now()
  console.log("Global setup")

  debug("Initializing contract factories sequentially")
  MainFactory = await hre.ethers.getContractFactory("Main")
  ChildFactory = await hre.ethers.getContractFactory("Child")
  LogsFactory = await hre.ethers.getContractFactory("Logs")
  TransfersFactory = await hre.ethers.getContractFactory("Transfers")
  debug("Initialized contract factories")

  debug("Initializing owner")
  // first and owner are the same here, but first is of type HardhatSigner and have .address already resolved
  const [first] = await hre.ethers.getSigners()
  owner = new hre.ethers.NonceManager(first)
  ownerAddress = first.address
  ownerAddressBytes = getBytes(ownerAddress)
  debug("Initialized owner")

  // Do not wait for this to finish, other stuff will fail if it's not fast enough of if provider is broken
  const initChainStart = Date.now()
  initChainStaticInfo(hre.ethers.provider)
    .then(debugLogTimeTakenOnCompletion(initChainStart, "Initialized chain static info"))
    .catch(abort)

  const executeTransactionsStart = Date.now()
  executeTransactions(sendImmediateEth(owner, knownExistingAddress, oneWei))
    .then(debugLogTimeTakenOnCompletion(executeTransactionsStart, "Executed initialization transaction(s)"))
    .catch(abort)

  debug("Global setup completed in %d ms", Date.now() - start)
})

function abort(message: unknown) {
  console.error(message)
  process.exit(1)
}

function debugLogTimeTakenOnCompletion(start: number, message: string): () => void {
  return () => {
    debug(`${message} asynchronously in ${Date.now() - start} ms`)
  }
}
