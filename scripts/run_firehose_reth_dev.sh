#!/usr/bin/env bash
set -e

PARENT_PID=$$
ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
source "$ROOT/lib.sh"

main() {
  if [[ "$1" == "--help" || "$1" == "-h" ]]; then
    usage; exit 0
  fi

  if [[ "$#" -ne 1 && "$#" -ne 2 ]]; then
    usage_error "Expected 1 or 2 arguments, got $#"
  fi

  tracer_version="$1"
  fork_version="${2:-cancun}"

  if [[ "$tracer_version" != "2.3" && "$tracer_version" != "3.0" ]]; then
    usage_error "Invalid tracer version '$tracer_version', must be '2.3' or '3.0'"
  fi
  if [[ "$fork_version" != "cancun" && "$fork_version" != "prague" ]]; then
    usage_error "Invalid fork version '$fork_version', must be 'cancun' or 'prague'"
  fi

  check_fireeth

  echo "Running Reth dev node with Firehose tracer via 'fireeth'"
  echo "Note: this script only validates connectivity, it does not start Reth."
  echo
  echo "Firehose version : $tracer_version"
  echo "Fork version     : $fork_version"
  echo
  echo "Expected endpoints:"
  echo "  Firehose gRPC : localhost:10001"
  echo "  Reth RPC      : http://localhost:8545"
  echo

  if ! curl -s --connect-timeout 2 localhost:10001 >/dev/null 2>&1; then
    echo "Error: cannot connect to Firehose gRPC at localhost:10001"
    echo "Start your fireeth instance (e.g. 'fireeth start -c fireeth.config.yaml')"
    exit 1
  fi

  if ! curl -sS --connect-timeout 2 \
       -H "content-type: application/json" \
       -X POST http://localhost:8545 \
       --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
       --fail >/dev/null; then
    echo "Error: cannot connect to Reth RPC at http://localhost:8545"
    echo "Ensure your Reth node is running with RPC enabled"
    exit 1
  fi

  echo "Firehose gRPC connection ok"
  echo "Reth RPC connection ok"
  echo
  echo "Ready to run tests:"
  echo "  pnpm test:fh${tracer_version}:reth-dev"
}

usage() {
  echo "Usage: $0 <tracer-version> [<fork-version>]"
  echo
  echo "Validates connectivity to a running Reth + Firehose setup."
  echo
  echo "Arguments:"
  echo "  <tracer-version> : '2.3' or '3.0'"
  echo "  <fork-version>   : 'cancun' or 'prague' (default: 'cancun')"
  echo
  echo "Notes:"
  echo "  - This script does not start Reth, only checks endpoints."
  echo "  - Firehose gRPC expected at localhost:10001"
  echo "  - Reth RPC expected at http://localhost:8545"
}

main "$@"
