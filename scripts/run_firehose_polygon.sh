#!/usr/bin/env bash

set -e

ARG=$1
NETWORK=$2
if [[ "$ARG" == "2.3" ]]; then
    ENABLE_FIREHOSE="--vmtrace=firehose --vmtrace.jsonconfig='{\"applyBackwardCompatibility\":true}'"
elif [[ "$ARG" == "2.3-old" ]]; then
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
source "$SCRIPTS_FOLDER/lib.sh"

main() {
  check_fireeth
  check_bor
  check_docker "bor0" "You should launch the polygon miner with '${BOR_SCRIPTS_FOLDER}/up.sh $ARG -c'"

  wait_geth_up "http://localhost:8545"
  RUNDIR=$(mktemp -d)

  pushd "$RUNDIR"
    if [[ -z "$NETWORK" ]]; then
      echo "Running bor with Firehose tracer activated via 'fireeth'"
      echo "Running bor in '$RUNDIR'"
      ENODE=$("$BOR_SCRIPTS_FOLDER/get-genesis-and-enode.sh" 127.0.0.1:30303)
      "$BOR_SCRIPTS_FOLDER/get-funds.sh"
      bor_args="server --parallelevm.enable=false --db.engine=leveldb --chain=genesis.json --datadir \"$RUNDIR\" --port 30403 --bor.heimdall http://localhost:1317 --http --http.addr 0.0.0.0 --ws --ws.addr 0.0.0.0 --ws.port 8646 --ws.api eth,txpool,net,web3,bor --http.vhosts '*' --http.corsdomain '*' --ws.origins '*' --http.port 8645 --http.api personal,eth,net,web3,txpool,miner,admin,bor,debug --syncmode full --bootnodes=enode://10c10bdc4dbdfd4114c11cf34ac7340ea2db8c664221ba97d32223ebda34121e394d7739e3e6d1ec837ce7f4199978581a0425265b8f509cfcc29aa1f19e911f@127.0.0.1:30303 $ENABLE_FIREHOSE"
      echo "running '$bor' '$bor_args'"
      run_fireeth 0 "$bor" "$bor_args"
    elif [[ "$NETWORK" == "amoy" ]]; then
      echo "Running fireeth for Amoy network with custom arguments"

      amoy_args="server --chain=amoy --datadir=bor-data --bor.heimdall='https://heimdall-api-amoy.polygon.technology' --parallelevm.enable=false --vmtrace=firehose --vmtrace.jsonconfig='{\"concurrentBlockFlushing\":16, \"applyBackwardCompatibility\":false}' --port=30403"

      data_dir="$SCRIPTS_FOLDER/.firehose-data"
      if [[ -d "$data_dir" ]]; then
        rm -rf "$data_dir"
      fi

      "$fireeth" \
        start \
        reader-node,relayer,merger,firehose \
        -c '' \
        -d "$data_dir" \
        --advertise-chain-name=amoy \
        --common-first-streamable-block=0 \
        --reader-node-path="$bor" \
        --reader-node-arguments="$amoy_args" \
        --firehose-grpc-listen-addr="localhost:8089"
    else
      echo "Unsupported network: $NETWORK"
      echo "Usage: $0 <version> [amoy]"
      exit 1
    fi
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
