import hre from "hardhat"

// Returns the current network name configured in Hardhat Runtime Environment. To look
// for a list of supported network names, see `hardhat.config.ts` file in the `config.networks`
// location.
export function networkName(): string {
  return hre.network.name
}

// Returns true if the current network name matches the provided name. To look
// for a list of supported network names, see `hardhat.config.ts` file in the `config.networks`
// location.
export function isNetwork(name: string): boolean {
  return networkName() === name
}
