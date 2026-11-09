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

- `scripts/optimism/run_optimism_devnet.sh` (`op-reth-devnet`, `op-geth-devnet`):
  - Runs Jovian at genesis (`--enable-latest-fork=0`) with 1s L2 blocks. Firehose op-reth reports head - 200 as its last irreversible block, so Firehose only serves from L2 block 300: about 5 minutes after the devnet starts instead of 10, and every test waits half as long for its blocks.
  - Drops the external op-rbuilder and flashblocks (`--external-builder op-rbuilder --flashblocks`). The suite does not use them, and bproxy failed to start on a race with op-rbuilder.
  - Funds the test account on the sequencer op-geth (8547) and waits for the funds. The funding transaction used to go to a hard-coded port 8548 with a JWT header, where it was dropped in the chain-update runs.
  - Starts the local op-node only once the Firehose EL answers on `:28551`, so the EL can be started at any time instead of within about 60 seconds, and names both EL launchers.
  - Stops when the sequencer op-geth is not published on 8547, the port `hardhat.config.ts` uses, and no longer waits 60 seconds on an op-node port that no longer exists.
  - Tears down a previous devnet with `docker compose -f` instead of `cd`-ing into the directory builder-playground deletes and recreates.
- `op-reth-devnet` genesis snapshot regenerated for the Jovian genesis (fee vault predeploy storage and implementation addresses), and the `op-geth-devnet` suicide snapshots refreshed with op-geth `optimism-v1.101702.1-fh3.0-2`, which reports the code and nonce clearing of a contract destroyed in its creation transaction like every other target does.
- The `Compare blocks` test checks every differing field of a block against the accepted differences, with its RPC and Firehose values, instead of only the first field of each report. It accepts the OP-stack Jovian `blob_gas`/`receipt.blob_gas_used` difference on `op-reth-devnet`, `op-geth-devnet` and `world-chain-devnet`: the receipts report the data availability footprint as `blobGasUsed`, which `compare-blocks-rpc` reads as EIP-4844 blob gas.

- `scripts/ethereum_devnet/run_playground_devnet.sh` measures the L1 block time once the devnet is up and stops with install instructions for the StreamingFast builder-playground fork when it is more than twice `--block-time` (upstream runs 12s slots whatever the flag says, which stretches the `reth-devnet`/`geth-devnet` suites from 5 to about 25 minutes). `PLAYGROUND_ALLOW_SLOW_L1=1` skips the check.
- The same script tears down a previous devnet with `docker compose -f` instead of `cd`-ing into the directory builder-playground deletes and recreates, which left the rest of the script running in a deleted working directory.

- `pnpm test:fh3.0:reth-dev` stops in its global setup, with an explanation, when the chain is not on Amsterdam. Its snapshots are recorded on Amsterdam, so a Prague chain failed 64 tests on gas values. The docs no longer present Prague as a supported `reth-dev` fork, and no longer ask for `SKIP_COMPARE_BLOCKS=1` on `reth-dev`.

- `arc-dev`: the two `suicide/contract_and_suicide_beneficiary_are_the_same*` snapshots now record `suicide: false` on the self-beneficiary SELFDESTRUCT that Arc rejects (the transaction reverts), as the reth tracer reports a rejected SELFDESTRUCT since `arc-v2.2.0-fh3.1-6`. The EIP-8246 test is skipped on `arc-dev`, where that same SELFDESTRUCT reverts and there is no balance to observe.

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

- The `Compare blocks` test needs `fireeth` v2.24.0 or later on Amsterdam blocks (`reth-dev`): older versions crash with a nil-pointer panic or report false differences there.

