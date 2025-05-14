#!/usr/bin/env bash

set -e

PARENT_PID=$$
SCRIPTS_FOLDER="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BNB_SCRIPTS_FOLDER="${SCRIPTS_FOLDER}/bnb"
source "$SCRIPTS_FOLDER/lib.sh"

main() {
  check_fireeth
  check_geth BSC
  check_docker "bnb-miner-1" "You should launch the Binance Smart Chain miner with '${BNB_SCRIPTS_FOLDER}/up.sh -c'"

  wait_geth_up "http://localhost:8545"
  RUNDIR=$(mktemp -d)

  pushd "$RUNDIR"
    echo "Running geth with Firehose tracer activated via 'fireeth'"
    echo "Running geth in '$RUNDIR'"
    ENODE=$("$BNB_SCRIPTS_FOLDER/get-genesis-and-enode.sh" 127.0.0.1:30304)
    "$BNB_SCRIPTS_FOLDER/get-funds.sh"
    "$geth" --datadir="$RUNDIR" --state.scheme=hash init genesis.json
    geth_args="--datadir=\"$RUNDIR\" --bootnodes=$ENODE --vmtrace=firehose --syncmode=full --gcmode=archive --state.scheme=hash"
    echo "running '$geth' '$geth_args'"
    run_fireeth 0 "$geth" "$geth_args"
  popd > /dev/null

}

usage() {
  echo "Usage: $0"
  echo ""
  echo "Runs geth with Firehose tracer activated via 'fireeth'. Your Binance Smart Chain miner should be running (./bnb/up.sh -c) and your geth binary should be a firehose-enabled BSC validator."
  echo ""
}

if [[ "$1" == "--help" ]] || [[ "$1" == "-h" ]]; then
  usage
  exit 0
fi

main "$@"
