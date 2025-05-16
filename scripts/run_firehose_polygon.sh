#!/usr/bin/env bash

set -e

ARG=$1
if [[ "$ARG" == "2.3" ]]; then
    ENABLE_FIREHOSE="--firehose-enabled"
elif [[ "$ARG" == "3.0" ]]; then
    ENABLE_FIREHOSE="--vmtrace=firehose"
elif [[ "$ARG" == "" ]]; then
    echo "You must specify version 2.3 or 3.0 as argument (ex: $0 2.3)"
    exit 1
else
    echo "Unsupported version: $ARG"
    exit 1
fi

PARENT_PID=$$
SCRIPTS_FOLDER="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BOR_SCRIPTS_FOLDER="${SCRIPTS_FOLDER}/polygon"
export GETH_BINARY=bor
source "$SCRIPTS_FOLDER/lib.sh"

main() {
  check_fireeth
  check_geth BSC
  check_docker "bor0" "You should launch the polygon miner with '${BOR_SCRIPTS_FOLDER}/up.sh $ARG -c'"

  wait_geth_up "http://localhost:8545"
  RUNDIR=$(mktemp -d)

  pushd "$RUNDIR"
    echo "Running geth with Firehose tracer activated via 'fireeth'"
    echo "Running geth in '$RUNDIR'"
    ENODE=$("$BOR_SCRIPTS_FOLDER/get-genesis-and-enode.sh" 127.0.0.1:30303)
    "$BOR_SCRIPTS_FOLDER/get-funds.sh"
    geth_args="server --parallelevm.enable=false --db.engine=leveldb --chain=genesis.json --datadir \"$RUNDIR\" --port 30403 --bor.heimdall http://localhost:1317 --http --http.addr 0.0.0.0 --ws --ws.addr 0.0.0.0 --ws.port 8646 --ws.api eth,txpool,net,web3,bor --http.vhosts '*' --http.corsdomain '*' --ws.origins '*' --http.port 8645 --http.api personal,eth,net,web3,txpool,miner,admin,bor,debug --syncmode full --bootnodes=enode://10c10bdc4dbdfd4114c11cf34ac7340ea2db8c664221ba97d32223ebda34121e394d7739e3e6d1ec837ce7f4199978581a0425265b8f509cfcc29aa1f19e911f@127.0.0.1:30303 $ENABLE_FIREHOSE"
    echo "running '$geth' '$geth_args'"
    run_fireeth 0 "$geth" "$geth_args"
  popd > /dev/null

}

usage() {
  echo "Usage: $0"
  echo ""
  echo "Runs geth(bor binary) with Firehose tracer activated via 'fireeth'. Your Polygon miner should be running ($0/polygon/up.sh $ARG -c) and your bor binary should be a firehose-enabled Polygon validator."
  echo ""
}

if [[ "$1" == "--help" ]] || [[ "$1" == "-h" ]]; then
  usage
  exit 0
fi

main "$@"
