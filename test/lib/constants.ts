export const besu_exclude_fields = [
  // Changes
  "calls[].balanceChanges",
  "calls[].gasChanges",
  "calls[].nonceChanges[]",
  "calls[].storageChanges[]",
  "calls[].codeChanges[]",
  // Others (to fix)
  "calls[].keccakPreimages",
]
