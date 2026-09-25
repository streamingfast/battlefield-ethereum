# Changelog

## Unreleased

### Added

- Full Amsterdam (Glamsterdam) fork coverage on `reth-dev`: `test/amsterdam.test.ts` exercises EIP-7708 (ETH transfer logs), EIP-7843 (`SLOTNUM`/`slot_number`), EIP-7928 (block access lists), EIP-8037 (state gas), and EIP-8282 (builder execution requests); EIP-8246 (no-burn SELFDESTRUCT) is covered in its own `describe` in `test/suicide.test.ts`, contrasted against pre-Amsterdam burn behaviour on the same test. Amsterdam is now the default fork for `reth-dev` (`./scripts/run_firehose_reth_dev.sh`, optionally `... prague`), backed by a new `scripts/geth_dev/genesis.amsterdam.json`.
- Block comparison between Firehose and the node's JSON-RPC now runs as the last test of every `pnpm test:*` run, resolving the RPC endpoint from the Hardhat network configuration and bounding the range at the chain's last irreversible block.

### Changed

- `test/lib/network.ts`'s `gasLimitOverride`/`dynamicGasLimit` now scale up on Amsterdam, mirroring the existing Arbitrum special-case: EIP-8037 state gas (CPSB = 1530 gas/byte) inflates the cost of anything that grows state (a fresh SSTORE, a new account, a code deposit) well past the canonical-EVM-tuned fixed gas limits used throughout the suite. All `reth-dev` snapshots have been regenerated against an Amsterdam chain to match.

### Removed

- `scripts/compare-blocks.sh`, replaced by the `Compare blocks` test. The script hardcoded the `geth-dev` RPC port and computed a block range that was invalid on short-lived dev chains.
- Three EVM gas-boundary tests (`Existing address failing transaction`, `Contract fail just enough gas for intrinsic gas`, `FAILED value transfer to a precompile still records both TRANSFER balance changes`) tuned to a precise pre-Amsterdam intrinsic-gas floor. Computing that boundary reliably across forks/clients at this E2E black-box level proved impractical (`eth_estimateGas` doesn't decompose cleanly into a bare intrinsic-only number). The underlying scenarios are being ported to Rust-level inspector tests in `streamingfast/reth` instead, to keep the regression coverage without the E2E fragility.
- `test/reth_capacity_overflow.test.ts`, a reth-tracer-specific "capacity overflow" panic regression test that was already gated to `reth-devnet` only. Being reth-tracer-specific by nature, it belongs as a Rust-level test in `streamingfast/reth` rather than a JS E2E replay; ported there alongside the three tests above.

### Known limitations

- `fireeth tools compare-blocks-rpc` (used by the `Compare blocks` test) crashes with a nil-pointer panic on Amsterdam blocks; use `SKIP_COMPARE_BLOCKS=1` on `reth-dev` until that's fixed upstream in `firehose-ethereum`.
