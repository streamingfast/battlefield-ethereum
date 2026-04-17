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

export const reth_exclude_fields = [
  // Ordinals (we have a bug to investigate with Deploys tests, order inversion on nonce <> code changes)
  "calls[].beginOrdinal",
  "calls[].endOrdinal",
  "calls[].codeChanges[].ordinal",
  "calls[].nonceChanges[].ordinal",
  "calls[].storageChanges[].ordinal",
]
