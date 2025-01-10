import hre from "hardhat"

export function networkName(): string {
  return hre.network.name
}

export function isNetwork(name: string): boolean {
  return networkName() === name
}
