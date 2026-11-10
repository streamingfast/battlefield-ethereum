#!/usr/bin/env bash

set -e

SCRIPTS_FOLDER="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BNB_SCRIPTS_FOLDER="${SCRIPTS_FOLDER}/bnb"
source "$SCRIPTS_FOLDER/lib.sh"

main() {
  check_fireeth
  check_reth_bsc
  check_docker "bnb-miner-1" "You should launch the Binance Smart Chain miner with '${BNB_SCRIPTS_FOLDER}/up.sh -c -j'"

  wait_geth_up "http://localhost:8545"
  # The miner's genesis activates Berlin and London at block 8 (Dockerfile.miner): typed
  # transactions sent before that are rejected, which fails the first tests of the suite.
  wait_rpc_block_at_least "http://localhost:8545" 8 120
  check_jenner_miner "http://localhost:8545"
  RUNDIR=$(mktemp -d)

  pushd "$RUNDIR"
    echo "Running reth-bsc with Firehose tracing via 'fireeth' (BSC miner must be running)"
    echo "Working directory: '$RUNDIR'"
    "$BNB_SCRIPTS_FOLDER/get-funds.sh"
    force_devnet_finality
    run_fireeth 0 "bash" "$SCRIPTS_FOLDER/reth_bsc/wrapped_reth_bsc.sh"
  popd > /dev/null
}

# The reth-bsc-dev goldens, genesis included, come from the Jenner miner (`up.sh -j`), whose
# genesis deploys the PaymentLane contract at 0x...2007.
check_jenner_miner() {
  local rpc_url="$1"
  local code
  code=$(curl -s -m 5 -X POST -H 'Content-Type: application/json' \
    --data '{"jsonrpc":"2.0","method":"eth_getCode","params":["0x0000000000000000000000000000000000002007","latest"],"id":1}' \
    "$rpc_url" | sed -n 's/.*"result":"\(0x[0-9a-fA-F]*\)".*/\1/p')

  if [[ -z "$code" || "$code" == "0x" ]]; then
    echo "The BSC miner at $rpc_url was not started with Jenner (no PaymentLane contract at genesis)."
    echo "The reth-bsc-dev snapshots need it, restart the miner with: ${BNB_SCRIPTS_FOLDER}/up.sh -c -j"
    exit 1
  fi
}

usage() {
  echo "Usage: $0"
  echo ""
  echo "Runs reth-bsc with Firehose tracing enabled as a follower of the dockerized BSC"
  echo "miner, wrapped by 'fireeth'. Start the miner first: ${BNB_SCRIPTS_FOLDER}/up.sh -c -j"
  echo "Then run the test suite: pnpm test:fh3.0:reth-bsc-dev"
  echo ""
  echo "Env: RETH_BSC_BINARY  path to the Firehose-instrumented reth-bsc binary"
}

if [[ "$1" == "--help" ]] || [[ "$1" == "-h" ]]; then
  usage
  exit 0
fi

main "$@"
