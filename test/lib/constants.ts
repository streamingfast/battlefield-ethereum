export const besu_exclude_fields = [
  // Changes
  "calls[].balanceChanges",
  "calls[].gasChanges",
  "calls[].nonceChanges",
  "calls[].storageChanges",
  "calls[].codeChanges",

  // Ordinals
  "calls[].beginOrdinal",
  "calls[].endOrdinal",
  "calls[].logs[].ordinal",
  "endOrdinal",
  "receipt.logs[].ordinal",

  // Others
  "calls[].failureReason",
  "calls[].keccakPreimages",
]

// Arbitrum/Nitro recomputes its L1-derived gas component every run (the ArbOS gas/price state is
// not reproducible across fresh chains), so all gas- and fee-derived *values* drift between runs.
// We exclude only those volatile numeric values — not the surrounding structure — so snapshots
// still validate the call tree, addresses, types, logs, reasons, slot keys and ordinals, just not
// the non-deterministic amounts. Keep this list minimal: it matches exactly the fields observed to
// differ across two fresh seed/validate runs.
export const arbitrum_exclude_fields = [
  // Transaction-level gas/fee
  "gasUsed",
  "gasPrice",
  "maxFeePerGas",
  "gasLimit",

  // Per-call gas
  "calls[].gasLimit",
  "calls[].gasConsumed",
  "calls[].gasChanges[].oldValue",
  "calls[].gasChanges[].newValue",

  // Balances and gas-derived storage carry the drifting gas/fee amounts into their values
  "calls[].balanceChanges[].oldValue",
  "calls[].balanceChanges[].newValue",
  "calls[].storageChanges[].oldValue",
  "calls[].storageChanges[].newValue",
]
