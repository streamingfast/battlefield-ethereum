import { getBytes, NonceManager } from "ethers"
import { initChainStaticInfo } from "./lib/chain"
import hre from "hardhat"
import { Child__factory, Main__factory } from "../typechain-types"
import debugFactory from "debug"

export let owner: NonceManager
export let ownerAddress: string
export let ownerAddressBytes: Uint8Array

export let MainFactory: Main__factory
export let ChildFactory: Child__factory

const debug = debugFactory("battlefield:global")

before(async () => {
  const start = Date.now()
  console.log("Global setup")

  debug("Initializing contract factories sequentially")
  MainFactory = await hre.ethers.getContractFactory("Main")
  ChildFactory = await hre.ethers.getContractFactory("Child")
  debug("Initialized contract factories")

  debug("Initializing owner")
  // first and owner are the same here, but first is of type HardhatSigner and have .address already resolved
  const [first] = await hre.ethers.getSigners()
  owner = new hre.ethers.NonceManager(first)
  ownerAddress = first.address
  ownerAddressBytes = getBytes(ownerAddress)
  debug("Initialized owner")

  // Do not wait for this to finish, other stuff will fail if it's not fast enough of if provider is broken
  initChainStaticInfo(hre.ethers.provider).then(() => {})

  debug("Global setup completed in %d ms", Date.now() - start)
})
