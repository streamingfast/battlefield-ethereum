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

// Returns true if the current network name matches any of the provided names. To look
// for a list of supported network names, see `hardhat.config.ts` file in the `config.networks`
// location.
export function isNetworkOneOf(...names: string[]): boolean {
  return names.includes(networkName())
}

// Returns true if the current network name starts with any of the provided prefixes. To look
// for a list of supported network names, see `hardhat.config.ts` file in the `config.networks`
// location.
export function isNetworkStartsWith(prefixes: string[]): boolean {
  const name = networkName()
  return prefixes.some((prefix) => name.startsWith(prefix))
}

// Returns a value from a mapping based on the current network name. If no value
// or will try to find a default value in the mapping using the keys "*", "default" or "".
export function networkValue<T>(mapping: { [name: string]: T }, defaultValue?: T): T {
  const name = networkName()
  if (mapping[name] !== undefined) {
    return mapping[name]
  }

  if (defaultValue !== undefined) {
    return defaultValue
  }

  // Find default ("*", or "default" or "") value and use it if
  if (mapping["*"] !== undefined) {
    return mapping["*"]
  }
  if (mapping["default"] !== undefined) {
    return mapping["default"]
  }
  if (mapping[""] !== undefined) {
    return mapping[""]
  }

  throw new Error(`No value found for network "${name}", and no default value provided`)
}
