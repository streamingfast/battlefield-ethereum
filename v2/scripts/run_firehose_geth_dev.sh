#!/usr/bin/env bash

set -e

ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
source "$ROOT/lib.sh"

main() {
  check_fireeth
  check_geth

  if [[ ! $# -eq 1 ]]; then
    usage_error "Wrong arguments"
  fi

  tracer_version="$1"

  if [[ "$tracer_version" != "2.3" && "$tracer_version" != "3.0" ]]; then
    usage_error "Invalid tracer version '$tracer_version'"
  fi

  echo "Running Geth dev node with Firehose tracer activated via 'fireeth'"
  FIREHOSE_VERSION="$tracer_version" run_fireeth 0 "bash" "$ROOT/wrapped_geth_dev.sh"
}

usage() {
  echo "Usage: $0 <tracer-version>"
  echo ""
  echo "Runs a Geth dev with the Firehose tracer activated using version <tracer-version>"
  echo "which can be either '2.3' or '3.0'."
}

main "$@"
