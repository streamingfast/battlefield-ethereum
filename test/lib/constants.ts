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

export const reth_exclude_fields = [
  // Changes
  // This is from v4 but we target v5 which don't save gas changes anymore, we will re-generate fully the
  // snapshots at one point and remove excluded fields.
  "calls[].gasChanges",

  // Ordinals (we keep them for the very end when we will re-generate fully the snapshots and remove excluded fields)
  "calls[].beginOrdinal",
  "calls[].endOrdinal",
  "calls[].logs[].ordinal",
  "calls[].balanceChanges[].ordinal",
  "calls[].nonceChanges[].ordinal",
  "calls[].codeChanges[].ordinal",
  "calls[].storageChanges[].ordinal",
  "endOrdinal",
  "receipt.logs[].ordinal",
]
