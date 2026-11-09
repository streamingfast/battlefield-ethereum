# Changelog

## Unreleased

### Added

- `wait_rpc_block_at_least <rpc_url> <block_number> [<timeout_seconds>]` in `scripts/lib.sh`, for launchers that must wait for a fork activation block or a minimum chain height.
- `pnpm-workspace.yaml` with the build-script approvals that pnpm 11 and later require, so `pnpm install` works there without `pnpm approve-builds`.
- `AGENTS.md` sections on Firehose readiness, stopping a chain by its launcher PID (instead of `pkill -f`, which matches the calling shell), and reading a test run.

- `pnpm perf:reth-dev` (`scripts/perf/reth_dev_parallel_tracing.sh`): compares the block execution time of the Firehose-instrumented `reth` dev node with its parallel block access list path enabled and disabled, on blocks of 160 contract calls from 20 senders (`scripts/perf/load.ts`, `contracts/perf_counter.sol`), for cheap calls and for calls that hash 300 times. The node mines on a timer for this run, so `scripts/reth_dev/wrapped_reth_dev.sh` takes its mining flags from `RETH_DEV_MINING_ARGS` and extra node flags from `RETH_EXTRA_ARGS`.
- CAS20 tests on `reth-bsc-dev` that call a token from a contract (`contracts/cas20_caller.sol`): two transfers interleaved with the caller's logs, a transfer whose caller reverts, and a transfer that runs out of gas on a write, which must not report that write.
- Full Amsterdam (Glamsterdam) fork coverage on `reth-dev`: `test/amsterdam.test.ts` exercises EIP-7708 (ETH transfer logs), EIP-7843 (`SLOTNUM`/`slot_number`), EIP-7928 (block access lists), EIP-8037 (state gas), and EIP-8282 (builder execution requests); EIP-8246 (no-burn SELFDESTRUCT) is covered in its own `describe` in `test/suicide.test.ts`, contrasted against pre-Amsterdam burn behaviour on the same test. Amsterdam is now the default fork for `reth-dev` (`./scripts/run_firehose_reth_dev.sh`, optionally `... prague`), backed by a new `scripts/geth_dev/genesis.amsterdam.json`.
- Amsterdam test landing 48 transactions in a single block on `reth-dev`, past reth's 30 transactions threshold where a block carrying a BAL has its transactions streamed out of order for parallel execution; asserts the Firehose block traces them in block order. A failure stops the whole run, since the node then stops producing blocks and every following test would only time out.
- Genesis snapshot for `reth-devnet`, so its full suite (including the `Compare blocks` test, which needs a `fireeth` that fills withdrawals on the RPC side) passes.
- Block comparison between Firehose and the node's JSON-RPC now runs as the last test of every `pnpm test:*` run, resolving the RPC endpoint from the Hardhat network configuration and bounding the range at the chain's last irreversible block.

### Changed

- The global setup waits for Firehose to report ready on every network, not only on mine-on-demand chains, and prints its progress every 30 seconds. The wait lasts up to 10 minutes on chains that produce blocks on their own (`FIREHOSE_READY_TIMEOUT_MS` overrides it), so a suite started while the launcher is still syncing waits instead of failing.
- The `Compare blocks` test waits up to `COMPARE_BLOCKS_FINALITY_TIMEOUT_MS` for finality to reach the suite's last block on every network before computing its range. It used to wait on mine-on-demand chains only, so devnets left their most recent blocks out of the comparison.
- Stopping a `scripts/run_firehose_*.sh` launcher with `SIGTERM` or `SIGINT` now stops `fireeth` and its reader node too (`run_fireeth` in `scripts/lib.sh` forwards the signal), so a chain stops with `kill <launcher pid>`.
- `scripts/bnb` and `scripts/run_monad_devnet.sh` call `docker compose` instead of the retired `docker-compose` v1 binary.
- `check_builder_playground` points to the StreamingFast fork of builder-playground, which makes the L1 honor `--block-time`.

- Snapshots on tracers that keep only storage slot keccak preimages (reth, op-reth, reth-bsc, world-chain, arc, Nitro) are compared after running both sides through the same filter (`test/lib/keccak-filter.ts`), so the shared snapshots still apply.
- `test/lib/network.ts`'s `gasLimitOverride`/`dynamicGasLimit` now scale up on Amsterdam, mirroring the existing Arbitrum special-case: EIP-8037 state gas (CPSB = 1530 gas/byte) inflates the cost of anything that grows state (a fresh SSTORE, a new account, a code deposit) well past the canonical-EVM-tuned fixed gas limits used throughout the suite. All `reth-dev` snapshots have been regenerated against an Amsterdam chain to match.

### Removed

- `scripts/compare-blocks.sh`, replaced by the `Compare blocks` test. The script hardcoded the `geth-dev` RPC port and computed a block range that was invalid on short-lived dev chains.
- Three EVM gas-boundary tests (`Existing address failing transaction`, `Contract fail just enough gas for intrinsic gas`, `FAILED value transfer to a precompile still records both TRANSFER balance changes`) tuned to a precise pre-Amsterdam intrinsic-gas floor. Computing that boundary reliably across forks/clients at this E2E black-box level proved impractical (`eth_estimateGas` doesn't decompose cleanly into a bare intrinsic-only number). The underlying scenarios are being ported to Rust-level inspector tests in `streamingfast/reth` instead, to keep the regression coverage without the E2E fragility.
- `test/reth_capacity_overflow.test.ts`, a reth-tracer-specific "capacity overflow" panic regression test that was already gated to `reth-devnet` only. Being reth-tracer-specific by nature, it belongs as a Rust-level test in `streamingfast/reth` rather than a JS E2E replay; ported there alongside the three tests above.

### Known limitations

- `fireeth tools compare-blocks-rpc` (used by the `Compare blocks` test) crashes with a nil-pointer panic on Amsterdam blocks; use `SKIP_COMPARE_BLOCKS=1` on `reth-dev` until that's fixed upstream in `firehose-ethereum`.
