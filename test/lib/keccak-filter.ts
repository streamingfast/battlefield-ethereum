// Mirror of the Firehose tracers' keccak preimage filter (`keccak_filter.rs` in
// evm-firehose-tracer-rs, `firehose_keccak_filter.go` in the go-ethereum fork): keeps only the
// `keccakPreimages` entries that explain a storage change key of the transaction. Must stay in
// sync with those two implementations.
//
// A preimage is kept when a storage change key is its hash plus less than 2^64 (exact match,
// array elements, struct fields), or when such a value appears in a kept preimage as a 32-byte
// word or as its last 32 bytes (nested mappings, mappings in structs or array elements,
// `string`/`bytes` keys), following at most 16 levels.

import { isNetworkOneOf } from "./network"
import { getGlobalSnapshotsTag } from "./snapshots"

const MAX_DEPTH = 16
const MAX_SLOT_OFFSET = (1n << 64n) - 1n

type NormalizedCall = {
  keccakPreimages?: Record<string, string>
  storageChanges?: { key?: string }[]
}

type NormalizedTrace = {
  calls?: NormalizedCall[]
}

// Returns true when the chain's Firehose tracer filters keccak preimages: nodes built on
// evm-firehose-tracer-rs and Nitro. Snapshots are compared after filtering both sides on those
// chains, so a node running a tracer from before the filter still passes.
export function tracerFiltersKeccakPreimages(): boolean {
  return (
    isNetworkOneOf(
      "reth-dev",
      "reth-devnet",
      "op-reth-devnet",
      "world-chain-devnet",
      "arc-dev",
      "arbitrum-nitro-dev",
    ) ||
    // reth-bsc runs on the `bnb-dev` network, only its snapshots tag tells it apart from geth-BSC
    getGlobalSnapshotsTag().includes("reth-bsc-dev")
  )
}

// Returns a copy of `trace` (a normalized transaction trace, hex without `0x`) whose calls keep
// only the storage slot keccak preimages. Applying it to an already filtered trace changes
// nothing.
export function retainStorageSlotPreimages<T extends NormalizedTrace>(trace: T): T {
  if (!trace?.calls?.some((call) => call.keccakPreimages && Object.keys(call.keccakPreimages).length > 0)) {
    return trace
  }

  const preimages = new Map<bigint, string>()
  for (const call of trace.calls) {
    for (const [hash, preimage] of Object.entries(call.keccakPreimages ?? {})) {
      const value = parseWord(hash)
      if (value !== undefined && !preimages.has(value)) {
        preimages.set(value, preimage)
      }
    }
  }

  const sorted = [...preimages.keys()].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))
  const kept = new Set<bigint>()
  let frontier: bigint[] = []
  const keep = (hash: bigint, into: bigint[]) => {
    if (!kept.has(hash)) {
      kept.add(hash)
      into.push(hash)
    }
  }

  for (const call of trace.calls) {
    for (const change of call.storageChanges ?? []) {
      const key = parseWord(change.key)
      const base = key === undefined ? undefined : slotBase(sorted, key)
      if (base !== undefined) {
        keep(base, frontier)
      }
    }
  }

  for (let depth = 0; depth < MAX_DEPTH && frontier.length > 0; depth++) {
    const next: bigint[] = []
    for (const hash of frontier) {
      for (const word of innerHashCandidates(preimages.get(hash)!)) {
        const inner = slotBase(sorted, word)
        if (inner !== undefined) {
          keep(inner, next)
        }
      }
    }
    frontier = next
  }

  return {
    ...trace,
    calls: trace.calls.map((call) => {
      if (!call.keccakPreimages) {
        return call
      }

      const retained = Object.fromEntries(
        Object.entries(call.keccakPreimages).filter(([hash]) => {
          const value = parseWord(hash)
          return value !== undefined && kept.has(value)
        }),
      )

      // Keep the field even when empty: decoded traces always carry `keccakPreimages: {}`.
      return { ...call, keccakPreimages: retained }
    }),
  }
}

// The largest hash at or below `key` when `key` is at most MAX_SLOT_OFFSET above it.
function slotBase(sorted: bigint[], key: bigint): bigint | undefined {
  let lo = 0
  let hi = sorted.length
  while (lo < hi) {
    const mid = (lo + hi) >> 1
    if (sorted[mid] <= key) {
      lo = mid + 1
    } else {
      hi = mid
    }
  }

  if (lo === 0) {
    return undefined
  }

  const base = sorted[lo - 1]
  return key - base <= MAX_SLOT_OFFSET ? base : undefined
}

// Each 32-byte word of the preimage, plus its last 32 bytes when its length is not a multiple
// of 32 (Solidity puts the slot after a `string` or `bytes` key).
function innerHashCandidates(preimageHex: string): bigint[] {
  const out: bigint[] = []
  for (let off = 0; off + 64 <= preimageHex.length; off += 64) {
    out.push(BigInt("0x" + preimageHex.slice(off, off + 64)))
  }
  if (preimageHex.length > 64 && preimageHex.length % 64 !== 0) {
    out.push(BigInt("0x" + preimageHex.slice(preimageHex.length - 64)))
  }
  return out
}

function parseWord(hex: string | undefined): bigint | undefined {
  if (!hex || !/^[0-9a-fA-F]{64}$/.test(hex)) {
    return undefined
  }
  return BigInt("0x" + hex)
}
