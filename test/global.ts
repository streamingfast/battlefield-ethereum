import { getBytes, NonceManager } from "ethers"
import { initChainStaticInfo } from "./lib/chain"
import hre from "hardhat"
import {
  Calls__factory,
  Child__factory,
  ContractEmpty__factory,
  GrandChild__factory,
  Logs__factory,
  LogsNoTopics__factory,
  Main__factory,
  Suicidal__factory,
  SuicideOnConstructor__factory,
  Transfers__factory,
} from "../typechain-types"
import debugFactory from "debug"
import { addFirehoseEthereumMatchers } from "./lib/assertions"
import { use } from "chai"
import { executeTransactions, sendImmediateEth } from "./lib/ethereum"
import { knownExistingAddress, precompileWithBalanceAddress } from "./lib/addresses"
import { oneWei } from "./lib/money"
import { getGlobalSnapshotsTag, setGlobalSnapshotsTag } from "./lib/snapshots"
import { fetchFirehoseBlock } from "./lib/firehose"
import { Block } from "../pb/sf/ethereum/type/v2/type_pb"

export let owner: NonceManager
export let ownerAddress: string
export let ownerAddressBytes: Uint8Array

export let MainFactory: Main__factory
export let ChildFactory: Child__factory
export let GrandChildFactory: GrandChild__factory
export let CallsFactory: Calls__factory
export let ContractEmptyFactory: ContractEmpty__factory
export let DelegateToEmptyContract: DelegateToEmptyContract__factory
export let LogsFactory: Logs__factory
export let LogsNoTopicsFactory: LogsNoTopics__factory
export let TransfersFactory: Transfers__factory
export let SuicidalFactory: Suicidal__factory
export let SuicideOnConstructorFactory: SuicideOnConstructor__factory

const debug = debugFactory("battlefield:global")

use(addFirehoseEthereumMatchers)

before(async () => {
  const start = Date.now()
  console.log("Global setup")

  if (!process.env.SNAPSHOTS_TAG) {
    throw new Error(
      "SNAPSHOTS_TAG environment variable must be set, it is mandatory, you are probably not running the test suite as intended. Use pnpm test:<tag> to run the test suite."
    )
  }

  setGlobalSnapshotsTag(process.env.SNAPSHOTS_TAG)

  debug("Initializing contract factories sequentially")
  ContractEmptyFactory = await hre.ethers.getContractFactory("ContractEmpty")
  MainFactory = await hre.ethers.getContractFactory("Main")
  ChildFactory = await hre.ethers.getContractFactory("Child")
  GrandChildFactory = await hre.ethers.getContractFactory("GrandChild")
  CallsFactory = await hre.ethers.getContractFactory("Calls")
  DelegateToEmptyContract = await hre.ethers.getContractFactory("DelegateToEmptyContract")
  LogsFactory = await hre.ethers.getContractFactory("Logs")
  LogsNoTopicsFactory = await hre.ethers.getContractFactory("LogsNoTopics")
  TransfersFactory = await hre.ethers.getContractFactory("Transfers")
  SuicidalFactory = await hre.ethers.getContractFactory("Suicidal")
  SuicideOnConstructorFactory = await hre.ethers.getContractFactory("SuicideOnConstructor")
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
    .catch(abortTagged("Initializing chain static info"))

  const executeTransactionsStart = Date.now()
  executeTransactions(
    sendImmediateEth(owner, knownExistingAddress, oneWei),
    sendImmediateEth(owner, precompileWithBalanceAddress, oneWei)
  )
    .then(debugLogTimeTakenOnCompletion(executeTransactionsStart, "Executed initialization transaction(s)"))
    .catch(abortTagged("Executing initialization transactions"))

  // FIXME: Fix Firehose service to allow querying the head block of the chain and use it here, it will make the overall
  // setup faster and more reliable
  fetchFirehoseBlock(1).then(validateFirehoseBlockVersion).catch(abortTagged("Validating Firehose block version"))

  debug("Global setup completed in %d ms", Date.now() - start)
})

function validateFirehoseBlockVersion(block: Block) {
  const tag = getGlobalSnapshotsTag()

  switch (tag) {
    case "fh2.3":
      if (block.ver !== 3) {
        throw new Error(
          `You specified testing with ${tag} but Firehose block version is ${block.ver} while fh2.3 expect version 3, it seems your geth instance is not running with the correct geth/Firehose version`
        )
      }
      break

    case "fh3.0":
      if (block.ver !== 4) {
        throw new Error(
          `You specified testing with ${tag} but Firehose block version is ${block.ver} while fh3.0 expect version 4, it seems your geth instance is not running with the correct geth/Firehose version`
        )
      }
      break

    default:
      throw new Error(`Unhandled snapshots tag value ${tag}`)
  }
}

function abort(message: unknown) {
  console.error(message)
  process.exit(1)
}

function abortTagged(tag: string): (message: unknown) => void {
  return (message: unknown) => {
    console.log("Error", tag)
    abort(message)
  }
}

function debugLogTimeTakenOnCompletion(start: number, message: string): () => void {
  return () => {
    debug(`${message} asynchronously in ${Date.now() - start} ms`)
  }
}
