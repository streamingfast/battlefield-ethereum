# Changelog

## Unreleased

### Added

- Block comparison between Firehose and the node's JSON-RPC now runs as the last test of every `pnpm test:*` run, resolving the RPC endpoint from the Hardhat network configuration and bounding the range at the chain's last irreversible block.

### Removed

- `scripts/compare-blocks.sh`, replaced by the `Compare blocks` test. The script hardcoded the `geth-dev` RPC port and computed a block range that was invalid on short-lived dev chains.
