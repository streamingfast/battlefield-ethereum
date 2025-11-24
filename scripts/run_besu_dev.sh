#!/usr/bin/env bash

set -e

ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
source "$ROOT/lib.sh"

main() {
  check_besu

  # Parse arguments
  fork_version="cancun"

  while [[ $# -gt 0 ]]; do
    case $1 in
      --fork)
        fork_version="$2"
        shift 2
        ;;
      --help|-h)
        usage
        exit 0
        ;;
      -*)
        echo "Error: Unknown option: $1"
        usage
        exit 1
        ;;
      *)
        echo "Error: Unexpected argument: $1"
        usage
        exit 1
        ;;
    esac
  done

  if [[ "$fork_version" != "cancun" && "$fork_version" != "prague" ]]; then
    echo "Error: Invalid fork version '$fork_version', only 'cancun' and 'prague' are supported"
    usage
    exit 1
  fi

  echo "Running Besu dev node with $fork_version fork"
  echo "RPC endpoint: http://localhost:8545"
  echo ""

  # Set environment variable for the wrapped script
  FORK_VERSION="$fork_version" exec bash "$ROOT/wrapped_besu_dev.sh"
}

usage() {
  echo "Usage: $0 [--fork <fork-version>]"
  echo ""
  echo "Starts a Besu dev node using the specified fork version."
  echo "Fork version can be 'cancun' (default) or 'prague'."
  echo ""
  echo "The node will be accessible at http://localhost:8545"
  echo ""
  echo "Requires Besu to be installed. Build it using: ./scripts/besu_dev/build_besu.sh"
}

if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
  if [[ "$1" == "--help" ]] || [[ "$1" == "-h" ]]; then
    usage
    exit 0
  fi
  main "$@"
fi
