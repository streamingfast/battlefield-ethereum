#!/usr/bin/env bash

set -e

SCRIPTS_FOLDER="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BNB_SCRIPTS_FOLDER="${SCRIPTS_FOLDER}/bnb"
source "$SCRIPTS_FOLDER/lib.sh"

main() {
  check_fireeth
  check_reth_bsc
  check_docker "bnb-miner-1" "You should launch the Binance Smart Chain miner with '${BNB_SCRIPTS_FOLDER}/up.sh -c'"

  wait_geth_up "http://localhost:8545"
  # The miner's genesis activates Berlin and London at block 8 (Dockerfile.miner): typed
  # transactions sent before that are rejected, which fails the first tests of the suite.
  wait_rpc_block_at_least "http://localhost:8545" 8 120
  RUNDIR=$(mktemp -d)

  pushd "$RUNDIR"
    echo "Running reth-bsc with Firehose tracing via 'fireeth' (BSC miner must be running)"
    echo "Working directory: '$RUNDIR'"
    "$BNB_SCRIPTS_FOLDER/get-funds.sh"
    run_fireeth 0 "bash" "$SCRIPTS_FOLDER/reth_bsc/wrapped_reth_bsc.sh"
  popd > /dev/null
}

usage() {
  echo "Usage: $0"
  echo ""
  echo "Runs reth-bsc with Firehose tracing enabled as a follower of the dockerized BSC"
  echo "miner, wrapped by 'fireeth'. Start the miner first: ${BNB_SCRIPTS_FOLDER}/up.sh -c"
  echo "Then run the test suite: pnpm test:fh3.0:reth-bsc-dev"
  echo ""
  echo "Env: RETH_BSC_BINARY  path to the Firehose-instrumented reth-bsc binary"
}

if [[ "$1" == "--help" ]] || [[ "$1" == "-h" ]]; then
  usage
  exit 0
fi

main "$@"
