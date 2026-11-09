# Changelog

## Unreleased

### Added

- `fh3.0/arbitrum-nitro-dev` snapshots, recorded with nitro `v3.12.2-fh3.0` on a fresh `run_firehose_nitro_dev.sh` chain. Nitro emits Firehose block v5 since `v3.12.1-fh3.0`, so `pnpm test:fh3.0:nitro-dev` is its target and it had no snapshots: every snapshot test wrote one and passed.

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

- The op-reth, op-geth and world-chain devnet launchers set `FORCE_FINALITY_AFTER_BLOCKS=10` for `fireeth` (`force_devnet_finality` in `scripts/lib.sh`). These nodes report no finality, so their LIB trailed the head by 200 blocks: Firehose served nothing before block 300, and `Compare blocks` waited 200 blocks for the suite's last block, then left most of the range out at its timeout. On the op-reth devnet, Firehose is now ready about 100 seconds after the devnet starts and the comparison covers every block.
- `scripts/run_firehose_polygon.sh` deploys the validators from `0xPolygon/kurtosis-pos` at a pinned upstream commit, with the bor `v2.11.0` and heimdall-v2 `v0.13.2` images that commit defaults to, published on `ghcr.io`. The previous `0xpolygon/bor:2.8.0-beta` and `0xpolygon/heimdall-v2:0.7.2-beta2` Docker Hub tags no longer exist, and the StreamingFast kurtosis-pos fork it pinned wrote Heimdall config keys that newer Heimdall images reject. `KURTOSIS_POS_REF`, `BOR_IMAGE` and `HEIMDALL_IMAGE` can be overridden from the environment.
- The same script checks for `envsubst` and `jq`, which it uses, instead of `bats`, which only `./scripts/polygon-bridge` needs, and `exec`s `fireeth` so stopping the launcher stops bor.
- The same script requires Kurtosis 1.22.2 or later. The pinned kurtosis-pos commit uses an ethereum-package version that older Kurtosis versions cannot interpret (`undefined: GpuConfig`).
- The same script runs the kurtosis-pos bor validator in archive mode. With pruning, kurtosis-pos's L2 bridge deployment failed with `historical state ... is not available` when its `forge script` compile outlasted the retained state.
- The same script waits for the validators to pass the last Bor fork block (128 with kurtosis-pos) before starting the local bor. The forks change gas costs, so tests that ran before them did not match the snapshots.
- The `polygon-dev` snapshots are recorded with every Bor fork kurtosis-pos enables active (up to Uburu), on bor `v2.11.0`.
- The `Compare blocks` test accepts the span-commit system transaction on `polygon-dev`: Firehose records it, the block's JSON-RPC transaction list leaves it out.

- The two ArbOS-specific selfdestruct finalization assertions in `test/suicide.test.ts` only apply to Firehose block v3 (`fh2.3`). On block v5 (`fh3.0`) Nitro writes the end-of-transaction code removals and nonce resets to the root call like geth, and the canonical assertions run.
- README and AGENTS.md point Arbitrum testing to `pnpm test:fh3.0:nitro-dev`, explain how to run it on macOS from the release image, and warn against running `geth-dev` with a `geth` built from the Arbitrum go-ethereum fork.

- `scripts/run_firehose_reth_bsc.sh` and `scripts/run_firehose_bnb.sh` wait for block 8 before starting, where the BSC miner's genesis activates Berlin and London. A suite started earlier failed its first tests on typed transactions the miner rejected.
- `scripts/run_firehose_reth_bsc.sh` refuses a BSC miner started without `-j`. The `reth-bsc-dev` snapshots come from the Jenner miner, and on the default miner the genesis snapshot fails and the Jenner tests skip.
- `Dynamic transaction max fee` expects the fee cap as the trace's gas price on `bnb-dev`/`reth-bsc-dev`, the same BSC Firehose behavior the `Compare blocks` test already accepts.

### Fixed

- `scripts/bnb/Dockerfile.miner` downloads the bsc `geth` matching the build architecture. Its check was inverted and fetched the arm64 binary on x86_64 hosts.

- `scripts/world_chain/run_world_chain_devnet.sh` gives the devnet 1200 seconds to come up instead of 600 (`WORLD_CHAIN_DEVNET_TIMEOUT_SECS`), prints its progress every minute and the end of `target/devnet/logs/devnet.log` when it gives up. A first boot pulls the 7 GB SP1 image and deploys the proof system, which took longer than 600 seconds even with images cached.
- The same script stops as soon as the detached devnet process exits, instead of waiting for the endpoints file until the timeout. `just devnet up -d` discards the devnet's error output, so it prints the command that shows it. It also checks the submodules nested in `pkg/contracts/lib/optimism`, whose absence made the devnet exit on a forge compile error.
- The same script builds world-chain without debug info (`CARGO_PROFILE_DEV_DEBUG=0`, as upstream CI does), which otherwise pushes the binary past the 4 GiB linker limit on Linux, checks for `protoc` and its well-known types up front, and prints the error of the last attempt when a retried command gives up instead of discarding it.

- `find_op_workdir` in the same script tries GNU `stat -c %Y` before BSD `stat -f %m`. On Linux `stat -f` prints the file system status to stdout before failing, so the captured modification time was that text followed by the number, and the comparison that used it aborted the script, tearing the devnet down right after it came up.

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

