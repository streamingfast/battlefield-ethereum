import { getBytes, NonceManager } from "ethers"
import { initChainStaticInfo } from "./lib/chain"
import hre from "hardhat"
import {
  Calls__factory,
  Child__factory,
  ContractEmpty__factory,
  GasRefund__factory,
  GrandChild__factory,
  Logs__factory,
  LogsNoTopics__factory,
  Main__factory,
  Suicidal__factory,
  SuicideOnConstructor__factory,
  Transfers__factory,
  DelegateToEmptyContract__factory,
  SuicideContractAsBeneficiary__factory,
  SuicideContractAsBeneficiarySameTrx__factory,
  TripleSuicide__factory,
  CompleteCallTree__factory,
} from "../typechain-types"
import debugFactory from "debug"
import { addFirehoseEthereumMatchers } from "./lib/assertions"
import { use } from "chai"
import { executeTransactions, sendImmediateEth } from "./lib/ethereum"
import { knownExistingAddress, precompileWithBalanceAddress } from "./lib/addresses"
import { oneWei } from "./lib/money"
import { getGlobalSnapshotsTag, setGlobalSnapshotsTag } from "./lib/snapshots"
import { fetchFirehoseBlock, waitForFirehoseReady } from "./lib/firehose"
import { Block } from "../pb/sf/ethereum/type/v2/type_pb"
import { isNetwork } from "./lib/network"
import { registerGlobalExcludedFields } from "./lib/field-exclusion"
import {
  besu_exclude_fields as besuExcludeFields,
  arbitrum_exclude_fields as arbitrumExcludeFields,
} from "./lib/constants"

export let owner: NonceManager
export let ownerAddress: string
export let ownerAddressBytes: Uint8Array

export let MainFactory: Main__factory
export let ChildFactory: Child__factory
export let GrandChildFactory: GrandChild__factory
export let CallsFactory: Calls__factory
export let GasRefundFactory: GasRefund__factory
export let CompleteCallTreeFactory: CompleteCallTree__factory
export let ContractEmptyFactory: ContractEmpty__factory
export let DelegateToEmptyContract: DelegateToEmptyContract__factory
export let LogsFactory: Logs__factory
export let LogsNoTopicsFactory: LogsNoTopics__factory
export let TransfersFactory: Transfers__factory
export let SuicidalFactory: Suicidal__factory
export let SuicideOnConstructorFactory: SuicideOnConstructor__factory
export let SuicideContractAsBeneficiary: SuicideContractAsBeneficiary__factory
export let SuicideContractAsBeneficiarySameTrx: SuicideContractAsBeneficiarySameTrx__factory
export let TripleSuicideFactory: TripleSuicide__factory

const debug = debugFactory("battlefield:global")

use(addFirehoseEthereumMatchers)

before(async () => {
  const start = Date.now()
  console.log("Global setup")

  if (!process.env.SNAPSHOTS_TAG) {
    throw new Error(
      "SNAPSHOTS_TAG environment variable must be set, it is mandatory, you are probably not running the test suite as intended. Use pnpm test:<tag> to run the test suite.",
    )
  }

  setGlobalSnapshotsTag(process.env.SNAPSHOTS_TAG)

  // Register global excluded fields for specific networks
  registerGlobalExcludedFields("besu-devnet", besuExcludeFields)
  registerGlobalExcludedFields("arbitrum-nitro-dev", arbitrumExcludeFields)

  debug("Initializing contract factories sequentially")
  ContractEmptyFactory = await hre.ethers.getContractFactory("ContractEmpty")
  GasRefundFactory = await hre.ethers.getContractFactory("GasRefund")
  MainFactory = await hre.ethers.getContractFactory("Main")
  ChildFactory = await hre.ethers.getContractFactory("Child")
  GrandChildFactory = await hre.ethers.getContractFactory("GrandChild")
  CallsFactory = await hre.ethers.getContractFactory("Calls")
  CompleteCallTreeFactory = await hre.ethers.getContractFactory("CompleteCallTree")
  DelegateToEmptyContract = await hre.ethers.getContractFactory("DelegateToEmptyContract")
  LogsFactory = await hre.ethers.getContractFactory("Logs")
  LogsNoTopicsFactory = await hre.ethers.getContractFactory("LogsNoTopics")
  TransfersFactory = await hre.ethers.getContractFactory("Transfers")
  SuicidalFactory = await hre.ethers.getContractFactory("Suicidal")
  SuicideOnConstructorFactory = await hre.ethers.getContractFactory("SuicideOnConstructor")
  SuicideContractAsBeneficiary = await hre.ethers.getContractFactory("SuicideContractAsBeneficiary")
  SuicideContractAsBeneficiarySameTrx = await hre.ethers.getContractFactory("SuicideContractAsBeneficiarySameTrx")
  TripleSuicideFactory = await hre.ethers.getContractFactory("TripleSuicide")
  debug("Initialized contract factories")

  if (isNetwork("world-chain-devnet")) {
    // World Chain activates Jovian (EIP-7825: tx gas cap = 2^24) while its devnet block gas
    // limit is 60M. Bare eth_estimateGas uses the block gas limit as the upper bound and the
    // node rejects it with "intrinsic gas too high", so clamp every estimation to the tx cap.
    const provider = hre.ethers.provider
    const originalEstimateGas = provider.estimateGas.bind(provider)
    provider.estimateGas = (tx) => originalEstimateGas({ ...tx, gasLimit: 16_777_216 })
  }

  debug("Initializing owner")
  // first and owner are the same here, but first is of type HardhatSigner and have .address already resolved
  const [first] = await hre.ethers.getSigners()
  // @ts-ignore - TypeScript is not aware that NonceManager can be used as a signer, but it can, and it is useful for our tests to have a signer that automatically manage the nonce for us
  owner = new hre.ethers.NonceManager(first)
  // NonceManager optimistically increments its nonce *before* the send and never rolls back
  // on failure (see ethers' own "don't increment if the tx was certainly not sent" TODO).
  // On chains that reject a transaction pre-inclusion instead of mining-then-reverting it
  // (e.g. Arbitrum/Nitro rejecting a deliberately-low-gas tx with "intrinsic gas too low"),
  // that leaves the nonce desynced and every later transaction fails with "nonce too high".
  // Reset on a failed send so one rejected tx can't cascade into the rest of the suite.
  const ownerSendTransaction = owner.sendTransaction.bind(owner)
  owner.sendTransaction = async (tx) => {
    try {
      return await ownerSendTransaction(tx)
    } catch (err) {
      owner.reset()
      throw err
    }
  }
  ownerAddress = first.address
  ownerAddressBytes = getBytes(ownerAddress)
  debug("Initialized owner")

  if (isNetwork("reth-dev") || isNetwork("geth-dev") || isNetwork("arbitrum-nitro-dev")) {
    debug("Waiting for Firehose to be ready on mine-on-demand chain")
    const firehoseReadyStart = Date.now()
    await waitForFirehoseReady(() => sendImmediateEth(owner, knownExistingAddress, oneWei))
    debug("Firehose ready in %d ms", Date.now() - firehoseReadyStart)
  }

  // Do not wait for this to finish, other stuff will fail if it's not fast enough of if provider is broken
  const initChainStart = Date.now()
  initChainStaticInfo(hre.ethers.provider)
    .then(debugLogTimeTakenOnCompletion(initChainStart, "Initialized chain static info"))
    .catch(abortTagged("Initializing chain static info"))

  const executeTransactionsStart = Date.now()
  if (!isNetwork("amoy")) {
    executeTransactions(
      sendImmediateEth(owner, knownExistingAddress, oneWei),
      sendImmediateEth(owner, precompileWithBalanceAddress, oneWei),
    )
      .then(debugLogTimeTakenOnCompletion(executeTransactionsStart, "Executed initialization transaction(s)"))
      .catch(abortTagged("Executing initialization transactions"))
  } else {
    debug("Skipping initial funding transactions on Amoy testnet")
  }

  // FIXME: Fix Firehose service to allow querying the head block of the chain and use it here, it will make the overall
  // setup faster and more reliable
  try {
    const block = await fetchFirehoseBlock(2, { timeoutMs: 30_000 })
    validateFirehoseBlockVersion(block)
  } catch (err) {
    abortTagged("Validating Firehose block version")(err)
  }

  debug("Global setup completed in %d ms", Date.now() - start)
})

function validateFirehoseBlockVersion(block: Block) {
  const globalTag = getGlobalSnapshotsTag()
  const tag = globalTag.split("/")[0]

  switch (tag) {
    case "fh2.3":
      if (block.ver !== 3) {
        throw new Error(
          `You specified testing with ${tag} but Firehose block version is ${block.ver} while fh2.3 expect version 3, it seems your node is not running with the correct Firehose version`,
        )
      }
      break

    case "fh3.0":
      if (block.ver !== 4 && block.ver !== 5) {
        throw new Error(
          `You specified testing with ${tag} but Firehose block version is ${block.ver} while fh3.0 expect version 4 or version 5, it seems your geth instance is not running with the correct geth/Firehose version`,
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
