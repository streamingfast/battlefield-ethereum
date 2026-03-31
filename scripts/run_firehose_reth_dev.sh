#!/usr/bin/env bash

set -e

ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
source "$ROOT/lib.sh"

main() {
  check_fireeth
  check_reth_firehose_tracer

  echo "Running Reth dev node with Firehose tracer activated via 'fireeth'"
  FIREHOSE_VERSION="3.0" FORK_VERSION="prague" run_fireeth 1 "bash" "$ROOT/reth_dev/wrapped_reth_dev.sh"
}

usage() {
  echo "Usage: $0"
  echo ""
  echo "Runs a Reth dev with the Firehose tracer activated using version 3.0."
}

main "$@"
