#!/usr/bin/env bash

set -e

ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
source "$ROOT/lib.sh"

main() {
  check_fireeth
  check_reth_firehose_tracer

  if [[ "$#" -ne 1 && "$#" -ne 2 ]]; then
    usage_error "Invalid number of arguments, expected 1 or 2, got $#"
  fi

  tracer_version="$1"
  fork_version="cancun"
  if [[ "$#" -eq 2 ]]; then
    fork_version="$2"
  fi

  if [[ "$tracer_version" != "3.0" ]]; then
    usage_error "Invalid tracer version '$tracer_version'"
  fi

  if [[ "$fork_version" != "cancun" && "$fork_version" != "prague" ]]; then
    usage_error "Invalid fork version '$fork_version', only 'cancun' and 'prague' are supported right now"
  fi

  echo "Running Geth dev node with Firehose tracer activated via 'fireeth'"
  FIREHOSE_VERSION="$tracer_version" FORK_VERSION="$fork_version" run_fireeth 1 "bash" "$ROOT/reth_dev/wrapped_reth_dev.sh"
}

usage() {
  echo "Usage: $0 3.0 [<fork-version>]"
  echo ""
  echo "Runs a Reth dev with the Firehose tracer activated using version 3.0."
  echo ""
  echo "You can also optionally specify against which fork you want to test by specifying"
  echo "the <fork-version> which can be one of: 'cancun', 'prague'."
  echo ""
  echo "Note that the fork version might or might not be supported based on the 'reth-firehose-tracer' binary"
  echo "you are using."
}

main "$@"
