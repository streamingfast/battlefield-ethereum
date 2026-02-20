#!/usr/bin/env bash

set -e

ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
source "$ROOT/lib.sh"

main() {
  check_fireeth
  check_besu

  echo "Running Besu local devnet node with Firehose tracer activated via 'fireeth'"
  run_fireeth 0 "bash" "$ROOT/ethereum_devnet/wrapped_besu.sh"
}

usage() {
  echo "Usage: $0"
  echo ""
  echo "Runs a Besu devnet with the Firehose tracer activated using version 3.0 on the devnet genesis."
  echo ""
  echo "Note that the fork version might or might not be supported based on the 'geth' binary"
  echo "you are using."
}

main "$@"
