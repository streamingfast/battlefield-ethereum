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

// Returns true on Arbitrum/Nitro networks. These run ArbOS rather than a vanilla EVM, so
// several Firehose trace behaviors legitimately differ from the canonical model and need
// dedicated handling (gas model, account-creation ordinals, fee recipient, selfdestruct).
export function isArbitrum(): boolean {
  return isNetworkStartsWith(["arbitrum"])
}

// A single large gas limit substituted for the EVM-tuned fixed limits on Arbitrum/Nitro.
// ArbOS bakes an L1-data component into intrinsic gas, so canonical-EVM limits (e.g. 21000 for
// a transfer) are rejected with "intrinsic gas too low". We can't estimate instead, because
// eth_estimateGas reverts for transactions that intentionally fail, which would break every
// expected-revert test. This value sits well above any intrinsic floor yet far below Arbitrum's
// huge block gas limit (~1.1e15); combined with the low L2 gas price it stays under the node's
// per-tx fee cap. Only gasUsed is billed, so over-provisioning the limit is free.
const ARBITRUM_GAS_LIMIT = 100_000_000

// Produces a transaction `gasPrice` override. On normal networks it returns the provided default;
// on Arbitrum/Nitro it returns an empty object so the node fills its own gas price. Forcing a high
// gas price (e.g. 45 gwei) there combines with the large gas limit to exceed the node's per-tx fee
// cap ("tx fee exceeds the configured cap"); the real L2 gas price is orders of magnitude lower.
export function gasPriceOverride(value: number): { gasPrice?: number } {
  return isArbitrum() ? {} : { gasPrice: value }
}

// Returns the given fixed gas limit on normal networks, or the large Arbitrum substitute on
// Arbitrum/Nitro. Use where a gas limit is consumed as a bare value (e.g. assigned to a shared
// `gasLimit:` field) rather than spread.
export function dynamicGasLimit(value: number): number {
  return isArbitrum() ? ARBITRUM_GAS_LIMIT : value
}

// Produces a transaction `gasLimit` override. On normal networks it returns the provided default;
// on Arbitrum/Nitro it returns the large substitute limit. A caller-supplied gasLimit spread after
// this still wins, so tests that deliberately set an exact limit keep their value.
export function gasLimitOverride(value: number | bigint): { gasLimit: number | bigint } {
  return { gasLimit: isArbitrum() ? ARBITRUM_GAS_LIMIT : value }
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
