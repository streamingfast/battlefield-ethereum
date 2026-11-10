# Firehose Ethereum Battlefield — Agent Guide

## What This Repository Is

This is a Hardhat test project that validates **Firehose Ethereum tracer integrations** across multiple EVM chains. It contains Solidity smart contracts and TypeScript tests that exercise every corner case of transaction tracing: calls, logs, storage, deploys, suicides, token transfers, typed transactions (access list, dynamic fee, blob, set-code), and more.

The test suite submits real transactions against a live local chain, fetches the resulting `TransactionTrace` from a running Firehose gRPC endpoint, and asserts the trace fields match expected values (either inline assertions or snapshot files stored in `test/snapshots/`).

### Key directories

| Path | Purpose |
|------|---------|
| `test/*.test.ts` | One test file per feature area |
| `test/lib/` | Helpers: chain interaction, Firehose fetch, assertions, snapshots |
| `test/snapshots/` | Per-network snapshot files used for comparison |
| `contracts/` | Solidity contracts exercised by the tests |
| `scripts/` | Chain launchers for each supported network |
| `pb/` | Generated TypeScript protobuf types for Firehose blocks |

---

## Prerequisites

You need the following tools before running any test cycle. Check each with the command shown.

### Runtime

| Tool | Check | Install |
|------|-------|---------|
| Node.js ≥ 20 | `node --version` | https://nodejs.org/en/download |
| pnpm | `pnpm --version` | `npm install -g pnpm` or https://pnpm.io/installation |
| jq | `jq --version` | `brew install jq` / `apt-get install jq` |
| sd | `sd --version` | `brew install sd` / `apt-get install sd` |

### Firehose orchestrator

`fireeth` orchestrates the Firehose stack (reader, merger, relayer, gRPC server).

```bash
# Check
fireeth --help

# Install (macOS/Linux with Homebrew), v2.24.0 or later
brew install streamingfast/tap/firehose-ethereum

# Or download a release binary
# https://github.com/streamingfast/firehose-ethereum/releases
```

### Firehose-instrumented `geth` (for `geth-dev`)

This is the StreamingFast fork of go-ethereum with the Firehose tracer compiled in. **Not** the standard upstream geth.

```bash
# Check (look for --vmtrace flag in the output)
geth --help | grep vmtrace
```

Download the latest pre-built binary — `arm64` and `amd64` builds are available:

**https://github.com/streamingfast/go-ethereum/releases?q=geth-&expanded=true**

Pick the asset matching your OS and architecture (e.g. `geth-linux-amd64`, `geth-darwin-arm64`), download it, make it executable, and place it on your `PATH`:

```bash
# Example — replace <version> and the filename with the latest release asset
curl -L https://github.com/streamingfast/go-ethereum/releases/download/<version>/geth-linux-amd64 \
  -o /usr/local/bin/geth
chmod +x /usr/local/bin/geth

# macOS only: fix code-signing if the binary is blocked by Gatekeeper
codesign --sign - --force --preserve-metadata=entitlements,requirements,flags,runtime $(which geth)
```

### Firehose-instrumented `reth` (for `reth-dev`)

The Firehose-instrumented Reth binary must be on your `PATH` as `reth`.

```bash
# Check
reth --version
```

Find the correct pre-built binary for your chain and architecture on the Firehose chains overview page:

**https://firehose.streamingfast.io/firehose/overview/chains**

Download the binary, rename it to `reth`, make it executable, and place it on your `PATH`. You can also override the binary path without renaming it:

```bash
export RETH_BINARY=/path/to/your/reth-binary
```

**Amsterdam fork support:** the pre-built binaries above may lag Amsterdam support. If you need it, build `reth` locally from the `release/reth-2.x` branch of `streamingfast/reth`:

```bash
RUSTUP_TOOLCHAIN=stable cargo build --release --bin reth
```

### Build tools for native addons (`c-kzg`)

The blob transaction tests (`cancun.test.ts`) use the `c-kzg` package which requires a C++ compiler. Without it, the package silently falls back and blob tests fail.

```bash
# Check
g++ --version

# Install — Debian/Ubuntu
sudo apt-get install -y g++

# Install — macOS (Xcode Command Line Tools, includes clang/g++)
xcode-select --install
```

The `postinstall` script in `package.json` automatically rebuilds `c-kzg` after every `pnpm install`. If the build fails, it means the C++ compiler is missing — install it first, then re-run `pnpm install`.

**Rebuilding after OS change:** If the addon was compiled on a different OS (e.g. the workspace was set up on macOS but is now mounted in a Linux container), it will fail with `invalid ELF header` or a similar binary-format error. Fix it by running `pnpm install` from the repo root — the postinstall script will recompile it for the current platform. If `pnpm install` itself fails due to store path permission issues (common in containers), fall back to invoking `node-gyp` directly:

```bash
cd node_modules/.pnpm/c-kzg@4.1.0/node_modules/c-kzg && node-gyp rebuild
```

---

## Installing JavaScript Dependencies

Always run this from the repo root before running any tests:

```bash
pnpm install
```

---

## Avoiding Data Directory Conflicts

The Firehose stack writes all its state (chain data, logs, block files) to a single data directory, defaulting to `.firehose-data/` inside the repo. If a human developer and an agent run chains simultaneously, they will collide on this directory.

**Always set `FIREHOSE_DATA_DIR` to an isolated path before starting any chain.** Use a path that is unique to your session and will not conflict with the developer's default:

```bash
export FIREHOSE_DATA_DIR=/tmp/firehose-battlefield-agent
```

Set this in your shell before running any `./scripts/run_firehose_*.sh` command. The scripts read this variable and use it as the data directory instead of the default.

---

## Firehose Readiness

Every test fetches its trace from Firehose, so the global setup (`test/global.ts`) waits for the Firehose HTTP health endpoint (`http://localhost:8089`) to return `{"is_ready":true}` before any test runs, on every network. It prints a progress line every 30 seconds while it waits. The wait lasts at most 30 seconds on mine-on-demand chains (below) and 10 minutes elsewhere, where Firehose first needs the chain to produce a merged bundle (100 blocks) on its own clock. Override it with `FIREHOSE_READY_TIMEOUT_MS`.

On the op-reth, op-geth, world-chain, reth-bsc and Base devnets, the node reports no finality and its tracer falls back to a LIB 200 blocks behind the head. Their launchers set `FORCE_FINALITY_AFTER_BLOCKS=10` for `fireeth`, so Firehose serves from about block 110 and the `Compare blocks` test does not wait 200 blocks for the last one to be final. Never set it for a public network: it marks blocks final that the chain has not finalized.

**Do not poll port 8089 yourself before starting the tests**, and do not re-run the suite because it started "too early": start it as soon as the node's JSON-RPC answers and let the global setup wait.

## Mine-on-Demand Networks — `geth-dev` and `reth-dev`

Both `geth-dev` and `reth-dev` use **mine-on-demand** mode: the node produces a new block only when a pending transaction arrives. No transaction → no block → no mining.

This creates a chicken-and-egg situation at startup: Firehose cannot become ready until it has processed at least one merged bundle of blocks (100 blocks), but blocks are only mined when transactions are submitted.

**The test suite handles this automatically.** The global setup (`test/global.ts`) runs `waitForFirehoseReady()` which simultaneously:
1. Pumps lightweight ETH transfer transactions every 200 ms so the chain keeps mining.
2. Polls the Firehose HTTP health endpoint (`http://localhost:8089`) until it returns `{"is_ready":true}`.

On these chains the wait lasts at most 30 seconds. If Firehose is not ready within that window the whole test run aborts with an error.

**Consequences for agents:**

- **Do NOT wait for `http://localhost:8089` to return `is_ready` before launching the tests.** On a cold chain it will never become ready on its own — only the test run's transaction pump can bootstrap it.
- **Do NOT send transactions manually** to try to pre-warm the chain; the test suite handles it.
- The only readiness check you need before running tests is that the node's JSON-RPC is accepting connections on the network's port (`url` in `hardhat.config.ts`: 8545 on `geth-dev`, 9545 on `reth-dev`).
- Keep the chain running between `--grep` runs. There is no need to restart between individual test invocations.

---

## Test Cycle — `geth-dev`

This is the primary and simplest chain to test against. Uses the StreamingFast Firehose-instrumented `geth` in `--dev` mode.

### Step 1 — Start the chain

In one terminal (or background), start `geth` and the full Firehose stack:

```bash
# Prague fork (recommended — enables all tests including EIP-7702 SetCode)
./scripts/run_firehose_geth_dev.sh 3.0 prague

# Cancun fork (if you only need tests up to Cancun, skips Prague-specific tests)
./scripts/run_firehose_geth_dev.sh 3.0 cancun
```

Wait only until the node's JSON-RPC is accepting connections — **do not wait for Firehose to be ready**:

```bash
# Retry until you get a valid JSON response (a hex block number)
curl -s http://localhost:8545 -X POST -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
# Expected: {"jsonrpc":"2.0","id":1,"result":"0x0"}
```

Once you see that response, the chain is ready to receive transactions and you can proceed to run the tests. The test suite's global setup will bootstrap Firehose on its own.

### Step 2 — Run the tests

**Always use `--grep` during development.** The full suite takes 2–3 minutes; targeting a specific suite or test is much faster for iterating:

```bash
pnpm test:fh3.0:geth-dev --grep "Berlin"
pnpm test:fh3.0:geth-dev --grep "Cancun"
pnpm test:fh3.0:geth-dev --grep "Calls Delegate with value"
```

Run the full suite **only as a final validation step** once all targeted tests pass:

```bash
pnpm test:fh3.0:geth-dev
```

### Step 3 — Stop the chain

Stop the chain as soon as you no longer need it. The chain keeps auto-mining blocks indefinitely, consuming CPU and disk even when idle. See [Stopping a Chain](#stopping-a-chain).

### Important: Chain lifecycle and the fresh-chain test

**Normal workflow**: keep the chain running across multiple `--grep` test runs while developing. There is no need to restart between individual test invocations.

**One exception**: the test `Pure transfers / Transfer to precompiled address without balance` requires a **fresh chain** — the target precompile address must have zero balance. This test can only pass once per chain instance. On subsequent runs against the same chain it will fail because the precompile already has a balance.

Strategies:
- Run it first, immediately after chain startup, before any other test sends ETH.
- Or skip it during development with `SKIP_FRESH_CHAIN_ONLY_TESTS=1` and only run it after a fresh restart.
- A full suite run (no `--grep`) should always be done against a freshly started chain to ensure this test passes.

---

## Test Cycle — `reth-dev`

Uses the StreamingFast Firehose-instrumented Reth in `--dev` mode on the Amsterdam fork. The test script and snapshots mirror `geth-dev`. Same mine-on-demand behaviour applies — see the section above.

**`reth-dev` is Amsterdam-only.** Its snapshots are recorded on Amsterdam (state gas, EIP-7708 logs), so `pnpm test:fh3.0:reth-dev` stops in its global setup when the chain is on another fork. They cannot fall back to the `geth-dev` Prague snapshots either: `geth --dev` mines to the zero address, which is warm under EIP-3651, so every call to `address(0)` costs 2500 gas less there. Reth coverage before Amsterdam is [`reth-devnet`](#test-cycle--reth-devnet). The launcher still accepts `prague` for manual experiments.

### Step 1 — Start the chain

```bash
./scripts/run_firehose_reth_dev.sh
```

Wait only until the node's JSON-RPC is accepting connections on port **9545** (same check as geth-dev above, on the reth-dev port). Do not wait for port 8089.

### Step 2 — Run the tests

Same guidance as `geth-dev`: **always use `--grep` during development**, full suite only for final validation. 

```bash
pnpm test:fh3.0:reth-dev --grep "Berlin"
pnpm test:fh3.0:reth-dev --grep "Cancun"
pnpm test:fh3.0:reth-dev --grep "Amsterdam"

# Full suite (final validation only, against a fresh chain)
pnpm test:fh3.0:reth-dev
```

### Step 3 — Stop the chain

Stop the chain as soon as you no longer need it.

See [Stopping a Chain](#stopping-a-chain).

---

## Test Cycle — `geth-devnet`

Uses the StreamingFast Firehose-instrumented `geth` as a secondary execution-layer client on top of a [builder-playground](https://github.com/flashbots/builder-playground) devnet. Always runs with the Prague fork.

### Step 1 — Start the playground devnet

In a separate terminal (keep it running throughout the test cycle):

```bash
./scripts/ethereum_devnet/run_playground_devnet.sh
```

### Step 2 — Start the Firehose-instrumented geth

In another terminal:

```bash
./scripts/run_firehose_geth_devnet.sh
```

Wait only until the node's JSON-RPC is accepting connections on port 8545 (same `eth_blockNumber` check as `geth-dev`). Do not wait for port 8089.

### Step 3 — Run the tests

```bash
pnpm test:fh3.0:geth-devnet --grep "Berlin"
pnpm test:fh3.0:geth-devnet --grep "Cancun"

# Full suite (final validation only, against a fresh chain)
pnpm test:fh3.0:geth-devnet
```

### Step 4 — Stop the chain

See [Stopping a Chain](#stopping-a-chain).

---

## Test Cycle — `reth-devnet`

Uses the StreamingFast Firehose-instrumented Reth (`reth`) as a secondary execution-layer client on top of a [builder-playground](https://github.com/flashbots/builder-playground) devnet. Always runs with the Prague fork.

### Step 1 — Start the playground devnet

In a separate terminal (keep it running throughout the test cycle):

```bash
./scripts/ethereum_devnet/run_playground_devnet.sh
```

### Step 2 — Start the Firehose-instrumented reth

In another terminal:

```bash
./scripts/run_firehose_reth_devnet.sh
```

Wait only until the node's JSON-RPC is accepting connections on port 8545. Do not wait for port 8089.

### Step 3 — Run the tests

```bash
pnpm test:fh3.0:reth-devnet --grep "Berlin"
pnpm test:fh3.0:reth-devnet --grep "Cancun"

# Full suite (final validation only, against a fresh chain)
pnpm test:fh3.0:reth-devnet
```

### Step 4 — Stop the chain

See [Stopping a Chain](#stopping-a-chain).

---

## Test Cycle — `base-devnet`

Uses the StreamingFast Firehose-instrumented `base-reth-node` (`streamingfast/base`, branch `release/1.x`) on Base's Docker devnet, which runs Base's own forks (Azul through Denim at blocks 20 to 25, Everest at block 30) with 200 ms blocks from Denim on. Build `base-reth-node` and `base-consensus` and see the prerequisites in the README's [Base Devnet](README.md#base-devnet) section.

### Step 1 — Start the devnet

```bash
BASE_REPO=/path/to/streamingfast/base ./scripts/base/run_base_devnet.sh > /tmp/base-devnet.log 2>&1 &
echo $! > /tmp/base-devnet.pid
```

Wait until its log prints `Base devnet is ready`. It always starts a new chain.

### Step 2 — Start the Firehose node

```bash
./scripts/run_firehose_base_devnet.sh > /tmp/base-firehose.log 2>&1 &
echo $! > /tmp/base-firehose.pid
```

Wait only until the node's JSON-RPC answers on port **9645**. Do not wait for port 8089: Firehose serves once the chain reaches block 110, about a minute after the devnet started, and the global setup waits for it.

If another Firehose stack already listens on the default `fireeth` ports, pass other listen addresses to the launcher (`--firehose-grpc-listen-addr=localhost:18089`, `--reader-node-grpc-listen-addr`, `--relayer-grpc-listen-addr`, ...) and set `BATTLEFIELD_FIREHOSE_ENDPOINT` for the tests.

### Step 3 — Run the tests

```bash
pnpm test:fh3.1:base-devnet --grep "Base"

# Full suite (final validation only, against a fresh chain)
pnpm test:fh3.1:base-devnet
```

### Step 4 — Stop the chain

Stop the Firehose launcher first, then the devnet launcher (`kill "$(cat /tmp/base-firehose.pid)"`, `kill "$(cat /tmp/base-devnet.pid)"`).

---

## Stopping a Chain

Every `./scripts/run_firehose_*.sh` launcher forwards `SIGTERM` and `SIGINT` to `fireeth`, which stops its reader node. The devnet launchers (`scripts/ethereum_devnet/run_playground_devnet.sh`, `scripts/optimism/run_optimism_devnet.sh`, `scripts/world_chain/run_world_chain_devnet.sh`, `scripts/base/run_base_devnet.sh`) tear their containers down on exit. Stop a chain by signalling the launcher you started, nothing else:

```bash
./scripts/run_firehose_geth_dev.sh 3.0 prague > /tmp/geth-dev.log 2>&1 &
echo $! > /tmp/geth-dev.pid
# ...
kill "$(cat /tmp/geth-dev.pid)"
```

**Do not use `pkill -f` or `pgrep -f` with a chain name** (`reth`, `geth`, `fireeth`, ...). The pattern also matches the shell that runs the command, and any other command whose arguments mention the chain, so it kills your own shell or an unrelated build.

---

## Reading a Test Run

A run on a supported target must end with **0 failing**. Differences that are expected on a given chain are encoded in the tests themselves (network-specific expectations, and `isAcceptedDifference` in `test/zz_compare_blocks.test.ts`), so a failing test is a regression or a broken setup, never a "normal failure". Do not compare against earlier runs to decide whether a failure is expected; read the failure.

**Pending** tests are skipped on purpose: fork-gated suites on a chain without that fork (see [Fork-Gated Tests](#fork-gated-tests)), tests that do not apply to the network, and the block comparison when the chain has no final block yet.

---

## Block Comparison

There is **no `scripts/compare-blocks.sh` to run after a test cycle** — the comparison between
Firehose blocks and the node's JSON-RPC is the `Compare blocks` test, which sorts last in the
suite and runs on every `pnpm test:*` invocation. Do not shell out to
`fireeth tools compare-blocks-rpc` by hand: the test resolves the RPC url from the Hardhat
network configuration (ports differ per network, e.g. `reth-dev` is on 9545) and bounds the
range at the last irreversible block reported by Firehose.

Before computing the range, it waits up to 60 seconds (`COMPARE_BLOCKS_FINALITY_TIMEOUT_MS`) for finality to reach the blocks the suite produced, mining blocks meanwhile on mine-on-demand chains. It reports as **pending** when the chain still has no final block after that, and on the public Amoy testnet.
A missing `fireeth` binary **fails** the test. Set `SKIP_COMPARE_BLOCKS=1` to skip it while
iterating.

**Amsterdam** blocks need `fireeth` v2.24.0 or later: older versions crash with a nil-pointer
panic or report false differences on them.

---

## Snapshot Behaviour

Most tests use **inline assertions**. A subset uses **snapshot files** stored under `test/snapshots/<category>/fh3.0/<network>/`.

- On the **first run** with a new snapshot, the test writes the snapshot to disk. Review it before committing.
- On subsequent runs, the actual trace is compared against the stored snapshot.
- To **update** a snapshot after an intentional change:

```bash
SNAPSHOTS_UPDATE="<snapshot-id>" pnpm test:fh3.0:geth-dev
# Update all snapshots for a tag:
SNAPSHOTS_UPDATE=".*" pnpm test:fh3.0:geth-dev
```

When the test fails on a snapshot mismatch, it prints the exact `<snapshot-id>` to use with `SNAPSHOTS_UPDATE`.

---

## Fork-Gated Tests

Some test suites are gated on a specific fork being active. If the fork is not active on the chain under test, the tests appear as **pending** (skipped) rather than passing or failing. This is expected and correct.

| File | Fork guard | Activated by |
|------|-----------|--------------|
| `test/prague.test.ts` | Prague (`requestsHash` in block header) | `run_firehose_geth_dev.sh 3.0 prague` |
| `test/cancun.test.ts` | Cancun (`blobGasUsed` in block header) | Any Cancun or Prague chain |
| `test/amsterdam.test.ts` | Amsterdam (`slotNumber` in block header) | `run_firehose_reth_dev.sh` (default) |
| `test/berlin.test.ts` | None (Berlin is universal on all supported chains) | Always runs |
| `test/base.test.ts` | `base-devnet` network | `./scripts/base/run_base_devnet.sh` (Denim at block 25, Everest at block 30) |

---

## Blob Transaction Tests (`cancun.test.ts`)

Two additional requirements specific to EIP-4844 blob tests:

1. **`c-kzg` native addon** must be compiled (see Prerequisites above).
2. **`ethers.Wallet`** must be used directly — Hardhat's `NonceManager` strips blob-specific fields. The tests already handle this internally.

---

## Other Chains

For all other supported chains (Sei, BNB, Polygon, Besu, Optimism, Arbitrum, Amoy), refer to the **README.md** in the root of this repository. For Arbitrum, the target is `pnpm test:fh3.0:nitro-dev` against `./scripts/run_firehose_nitro_dev.sh`, never `geth-dev` with an Arbitrum-fork `geth`. It contains the correct launcher/test command pairings, required binaries, and chain-specific notes for each.
