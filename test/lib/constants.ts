export const besu_exclude_fields = [
  // Changes
  "calls[].balanceChanges",
  "calls[].gasChanges",
  "calls[].nonceChanges[]",
  "calls[].storageChanges[]",
  "calls[].codeChanges[]",
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

export const monad_exclude_fields = [
  "calls[].gasChanges",
  "calls[].executedCode",
  // TODO: remove
  "setCodeAuthorizations",
]

export const reth_exclude_fields = [
  // Changes
  "calls[].balanceChanges",
  "calls[].gasChanges",
  "calls[].nonceChanges[]",
  "calls[].codeChanges[]",
  // Ordinals
  "calls[].beginOrdinal",
  "calls[].endOrdinal",
  "calls[].logs[].ordinal",
  "calls[].storageChanges[].ordinal",
  "endOrdinal",
  "receipt.logs[].ordinal",
]
