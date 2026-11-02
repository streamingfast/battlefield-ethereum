#!/usr/bin/env bash

set -e

ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
source "$ROOT/lib.sh"

main() {
  check_fireeth
  check_reth_firehose_tracer

  if [[ "$#" -gt 1 ]]; then
    usage_error "Invalid number of arguments, expected 0 or 1, got $#"
  fi

  fork_version="amsterdam"
  if [[ "$#" -eq 1 ]]; then
    fork_version="$1"
  fi

  if [[ "$fork_version" != "prague" && "$fork_version" != "amsterdam" ]]; then
    usage_error "Invalid fork version '$fork_version', only 'prague' and 'amsterdam' are supported right now"
  fi

  echo "Running Reth dev node with Firehose tracer activated via 'fireeth'"
  FIREHOSE_VERSION="3.0" FORK_VERSION="$fork_version" run_fireeth 0 "bash" "$ROOT/reth_dev/wrapped_reth_dev.sh"
}

usage() {
  echo "Usage: $0 [<fork-version>]"
  echo ""
  echo "Runs a Reth dev with the Firehose tracer activated using version 3.0."
  echo ""
  echo "You can optionally specify against which fork you want to test by specifying"
  echo "the <fork-version> which can be one of: 'prague', 'amsterdam'. Defaults to 'amsterdam'."
}

main "$@"
