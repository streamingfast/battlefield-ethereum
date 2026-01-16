#!/usr/bin/env bash

set -e

ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
source "$ROOT/lib.sh"

main() {
  check_fireeth
  check_monad_tracer

  if [[ "$#" -ne 0 ]]; then
    usage_error "Invalid number of arguments, expected 0, got $#"
  fi

  tracer_version="3.0"

  echo "Running Monad localnet with Firehose tracer activated via 'fireeth'"
  FIREHOSE_VERSION="$tracer_version" run_fireeth 0 "bash" "$ROOT/wrapped_monad_dev.sh"
}

check_monad_tracer() {
  if ! command -v "monad-firehose-tracer" &> /dev/null; then
    echo "The 'monad-firehose-tracer' binary could not be found, you can install it by:"
    echo ""
    echo "- Building from source: cd ~/Documents/SF/evm-firehose-tracer-rs && cargo build --release -p monad"
    echo "- Then copying: cp target/release/monad-firehose-tracer ~/.local/bin/ (or add to PATH)"
    echo ""
    echo "Alternatively, set MONAD_TRACER_BINARY environment variable to point to the binary"
    exit 1
  fi
}

usage() {
  echo "Usage: $0"
  echo ""
  echo "Runs a Monad node with the Firehose tracer activated."
  echo ""
  echo "The tracer binary can be customized by setting the MONAD_TRACER_BINARY environment variable."
  echo ""
  echo "Requirements:"
  echo "  - monad-firehose-tracer binary in PATH or specified via MONAD_TRACER_BINARY"
  echo "  - Monad node running (or will be started by the tracer)"
}

main "$@"
