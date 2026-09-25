import hre from "hardhat"
import { chainStaticInfo } from "./chain"

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

// Returns true on chains running in mine-on-demand mode, where a block is produced only when a
// transaction arrives. Nothing moves forward on those chains (block production, and with it
// Firehose readiness and finality) unless the test suite keeps sending transactions.
export function isMineOnDemand(): boolean {
  return isNetworkOneOf("geth-dev", "reth-dev", "arbitrum-nitro-dev")
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

// Returns true when the chain is running past the Amsterdam activation (EIP-8037 state gas
// active). Backed by the same synchronously-available chainStaticInfo the snapshot
// EIP-override machinery already relies on.
export function isAmsterdamActive(): boolean {
  return chainStaticInfo.eips.eip7708 === true
}

// EIP-8037 charges state gas (CPSB = 1530 gas per state byte) on top of the pre-Amsterdam
// regular-gas cost for anything that grows state: a fresh SSTORE, a new account, a code
// deposit. A plain transfer to a brand new address alone needs roughly NEW_ACCOUNT_BYTES (120)
// * CPSB ≈ 183,600 extra gas that didn't exist before. Canonical-EVM-tuned fixed gas limits
// throughout this suite (21000 for a transfer, 3,500,000 to deploy Calls.sol, etc.) are sized
// for the pre-Amsterdam cost model and fall short once state gas is added on top.
//
// AMSTERDAM_GAS_MULTIPLIER scales a caller-supplied limit up generously (6x comfortably covers
// every case measured so far, including Calls.sol's ~13KB deployment) and
// AMSTERDAM_NEW_ACCOUNT_GAS_FLOOR guarantees even a bare 21000 floors at something that can
// absorb a single new-account charge. Only gasUsed is billed, so over-provisioning the limit is
// free; it is bounded well below this repo's Amsterdam genesis block gas limit (33,554,432, see
// scripts/geth_dev/genesis.amsterdam.json) for every fixed limit currently used in the suite.
const AMSTERDAM_GAS_MULTIPLIER = 6
const AMSTERDAM_NEW_ACCOUNT_GAS_FLOOR = 250_000

function amsterdamGasLimit(value: number | bigint): bigint {
  const bumped = BigInt(value) * BigInt(AMSTERDAM_GAS_MULTIPLIER)
  const floor = BigInt(AMSTERDAM_NEW_ACCOUNT_GAS_FLOOR)
  return bumped > floor ? bumped : floor
}

// Produces a transaction `gasPrice` override. On normal networks it returns the provided default;
// on Arbitrum/Nitro it returns an empty object so the node fills its own gas price. Forcing a high
// gas price (e.g. 45 gwei) there combines with the large gas limit to exceed the node's per-tx fee
// cap ("tx fee exceeds the configured cap"); the real L2 gas price is orders of magnitude lower.
export function gasPriceOverride(value: number): { gasPrice?: number } {
  return isArbitrum() ? {} : { gasPrice: value }
}

// Returns the given fixed gas limit on normal networks, the large Arbitrum substitute on
// Arbitrum/Nitro, or the Amsterdam-scaled value on Amsterdam (see amsterdamGasLimit above). Use
// where a gas limit is consumed as a bare value (e.g. assigned to a shared `gasLimit:` field)
// rather than spread.
export function dynamicGasLimit(value: number): number {
  if (isArbitrum()) return ARBITRUM_GAS_LIMIT
  if (isAmsterdamActive()) return Number(amsterdamGasLimit(value))
  return value
}

// Produces a transaction `gasLimit` override. On normal networks it returns the provided default;
// on Arbitrum/Nitro it returns the large substitute limit; on Amsterdam it returns the
// Amsterdam-scaled value (see amsterdamGasLimit above). A caller-supplied gasLimit spread after
// this still wins, so tests that deliberately set an exact limit keep their value.
export function gasLimitOverride(value: number | bigint): { gasLimit: number | bigint } {
  if (isArbitrum()) return { gasLimit: ARBITRUM_GAS_LIMIT }
  if (isAmsterdamActive()) return { gasLimit: amsterdamGasLimit(value) }
  return { gasLimit: value }
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
