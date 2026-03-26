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

# Install (macOS/Linux with Homebrew)
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

The Firehose-instrumented Reth binary must be on your `PATH` as `reth-firehose-tracer`.

```bash
# Check
reth-firehose-tracer --version
```

Find the correct pre-built binary for your chain and architecture on the Firehose chains overview page:

**https://firehose.streamingfast.io/firehose/overview/chains**

Download the binary, rename it to `reth-firehose-tracer`, make it executable, and place it on your `PATH`. You can also override the binary path without renaming it:

```bash
export RETH_BINARY=/path/to/your/reth-binary
```

### Build tools for native addons (`c-kzg`)

The blob transaction tests (`cancun.test.ts`) use the `c-kzg` package which requires a C++ compiler. Without it, the package silently falls back and blob tests fail.

```bash
# Check
g++ --version

# Install
sudo apt-get install -y g++          # Debian/Ubuntu
brew install gcc                      # macOS
```

---

## Installing JavaScript Dependencies

Always run this from the repo root before running any tests:

```bash
pnpm install
```

If `c-kzg` fails to load its native binding after `pnpm install`, rebuild it manually:

```bash
cd node_modules/.pnpm/c-kzg*/node_modules/c-kzg
node-gyp rebuild
```

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

Wait until you see the gRPC server become ready. Verify with:

```bash
curl -s http://localhost:8545 -X POST -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
# Expected: a JSON response with a hex block number

curl -s http://localhost:8089
# Expected: {"is_ready":true}
```

Also verify blocks are advancing (run twice, 2 seconds apart — the block number must increase):

```bash
curl -s http://localhost:8545 -X POST -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

If the block number is stuck, the `geth` process is stalled. Kill all related processes and restart.

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

Stop the chain as soon as you no longer need it. The chain keeps auto-mining blocks indefinitely, consuming CPU and disk even when idle.

```bash
kill $(ps aux | grep -E "run_firehose_geth_dev|fireeth| geth " | grep -v grep | awk '{print $2}') 2>/dev/null
```

### Important: Chain lifecycle and the fresh-chain test

**Normal workflow**: keep the chain running across multiple `--grep` test runs while developing. There is no need to restart between individual test invocations.

**One exception**: the test `Pure transfers / Transfer to precompiled address without balance` requires a **fresh chain** — the target precompile address must have zero balance. This test can only pass once per chain instance. On subsequent runs against the same chain it will fail because the precompile already has a balance.

Strategies:
- Run it first, immediately after chain startup, before any other test sends ETH.
- Or skip it during development with `SKIP_FRESH_CHAIN_ONLY_TESTS=1` and only run it after a fresh restart.
- A full suite run (no `--grep`) should always be done against a freshly started chain to ensure this test passes.

---

## Test Cycle — `reth-dev`

Uses the StreamingFast Firehose-instrumented Reth in `--dev` mode. Always runs with the Prague fork. The test script and snapshots mirror `geth-dev`.

### Step 1 — Start the chain

```bash
./scripts/run_firehose_reth_dev.sh
```

Verify the same way as geth-dev (ports `8545` for RPC, `8089` for Firehose gRPC).

### Step 2 — Run the tests

Same guidance as `geth-dev`: **always use `--grep` during development**, full suite only for final validation.

```bash
pnpm test:fh3.0:reth-dev --grep "Berlin"
pnpm test:fh3.0:reth-dev --grep "Cancun"

# Full suite (final validation only, against a fresh chain)
pnpm test:fh3.0:reth-dev
```

### Step 3 — Stop the chain

Stop the chain as soon as you no longer need it.

```bash
kill $(ps aux | grep -E "run_firehose_reth_dev|fireeth|reth-firehose-tracer" | grep -v grep | awk '{print $2}') 2>/dev/null
```

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
| `test/berlin.test.ts` | None (Berlin is universal on all supported chains) | Always runs |

---

## Blob Transaction Tests (`cancun.test.ts`)

Two additional requirements specific to EIP-4844 blob tests:

1. **`c-kzg` native addon** must be compiled (see Prerequisites above).
2. **`ethers.Wallet`** must be used directly — Hardhat's `NonceManager` strips blob-specific fields. The tests already handle this internally.

---

## Other Chains

For all other supported chains (Sei, BNB, Polygon, Besu, Optimism, Arbitrum, Amoy), refer to the **README.md** in the root of this repository. It contains the correct launcher/test command pairings, required binaries, and chain-specific notes for each.
