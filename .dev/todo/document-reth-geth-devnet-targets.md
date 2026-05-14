# Document reth_dev, geth_devnet and reth_devnet as valid test targets

mode: feature
state: review
root_git: .worktrees/feature/document-reth-geth-devnet-targets
worktree: .worktrees/feature/document-reth-geth-devnet-targets
branch: feature/document-reth-geth-devnet-targets
target_branch: master

> **Resume protocol:** read **Dev Feedback** and the **State Tracker** below first, then jump to the
> step marked `Current`. Ensure that you are in the correct worktree and branch according to preamble here. Update current with Developer feedback and update the tracker after every meaningful change.
> Do not mutate completed steps; append a new entry instead.

---

## Initial Description

Document reth_dev, geth_devnet and reth_devnet as valid test target for Ethereum.
They run with `./scripts/run_firehose_reth_dev.sh`, `./scripts/run_firehose_reth_devnet.sh` and `./scripts/run_firehose_geth_devnet.sh` for starting the chain & firehose (requires Firehose enabled `reth` binary, `fireeth` binary (github.com/streamingfast/firehose-ethereum) or Firehose enabled `geth` binary).

We run the test suite with them with:
- pnpm test:fh3.0:reth-dev
- pnpm test:fh3.0:reth-devnet
- pnpm test:fh3.0:geth-devnet

## Dev Feedback

1. In the Readme, for devnet versions (geth & reth), in the table, make it clear that `devnet` playground and run firehose and pnpm must all be run in different terminal
2. `reth-firehose-tracer` this is not the correct bin anymore, the correct bin is `reth`, if we found that somewhere in the codebase, please adjust also the codebase default value(s). Search all occurencces to understand where its used and fixed it.

## Spec & Implementation

### What was done

- Confirmed all three scripts already exist:
  - `scripts/run_firehose_reth_dev.sh`
  - `scripts/run_firehose_geth_devnet.sh`
  - `scripts/run_firehose_reth_devnet.sh`
- Confirmed all three test commands already exist in `package.json`:
  - `pnpm test:fh3.0:reth-dev`
  - `pnpm test:fh3.0:geth-devnet`
  - `pnpm test:fh3.0:reth-devnet`
- **README.md** updated:
  - Added `reth-dev` row to the Chain Tests table (was missing)
  - Added `geth-devnet` and `reth-devnet` rows to the Chain Tests table
  - Added `### Get reth-firehose-tracer` installation section
  - Added `### Geth Devnet and Reth Devnet` detailed setup section with step-by-step instructions for both devnet targets
- **AGENTS.md** updated:
  - Added full `## Test Cycle — geth-devnet` section (4-step cycle matching pattern of existing sections)
  - Added full `## Test Cycle — reth-devnet` section (4-step cycle matching pattern of existing sections)

### Key observations

- Both `geth-devnet` and `reth-devnet` require [builder-playground](https://github.com/flashbots/builder-playground) to be running first — they run as secondary EL clients connected via Engine API.
- `reth-dev` was already in AGENTS.md but missing from the README chain table; that was added.

## State Tracker

**Last Updated:** 2026-05-14
**Current Step:** Step 3 — Address dev feedback (terminal clarity + reth binary rename)
**Status:** Changes committed; ready for re-review

### Step 1 — Begin implementation ✅
Completed: Read task file, README.md, AGENTS.md, scripts, and package.json.

### Step 2 — Implementation complete ✅
Committed documentation updates to README.md and AGENTS.md covering all three targets.

### Step 3 — Address dev feedback ✅ `Current`
- README.md Chain Tests table: Geth Devnet and Reth Devnet rows now explicitly show Terminal 1/2/3 separation
- README.md devnet setup sections: steps now labeled "Terminal 1", "Terminal 2", "Terminal 3"
- Renamed `reth-firehose-tracer` → `reth` everywhere: README.md, AGENTS.md, scripts/lib.sh (install hint updated to point to download page)
