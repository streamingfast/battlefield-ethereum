#!/usr/bin/env bash

set -e

ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
source "$ROOT/lib.sh"

main() {
  check_fireeth
  check_reth_firehose_tracer

  echo "Running Reth devnet node with Firehose tracer activated via 'fireeth'"
  run_fireeth 0 "bash" "$ROOT/ethereum_devnet/wrapped_reth.sh"
}

usage() {
  echo "Usage: $0"
  echo ""
  echo "Runs a Reth secondary EL node with the Firehose tracer activated using version 3.0."
  echo ""
  echo "Prerequisites:"
  echo "  - builder-playground must already be running:"
  echo "      ./scripts/ethereum_devnet/run_playground_devnet.sh"
}

main "$@"
