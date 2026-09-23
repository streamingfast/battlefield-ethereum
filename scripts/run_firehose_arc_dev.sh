#!/usr/bin/env bash

set -e

ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
source "$ROOT/lib.sh"

main() {
  check_fireeth
  check_arc_node

  echo "Running Arc dev node with Firehose tracer activated via 'fireeth'"
  FIREHOSE_VERSION="3.1" FORK_VERSION="prague" run_fireeth 0 "bash" "$ROOT/arc_dev/wrapped_arc_dev.sh"
}

usage() {
  echo "Usage: $0"
  echo ""
  echo "Runs an Arc dev with the Firehose tracer activated using version 3.1."
}

main "$@"
