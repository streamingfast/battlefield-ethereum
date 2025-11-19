#!/usr/bin/env bash

set -e

ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

source "$ROOT/lib.sh"

# This name comes from the fact that in [./optimism/run_optimism_devnet.sh], the op-node container named is
# derived from where builder-playground outputs the op-stack, which is named "op-chain" there, hence
# the container name is "op-chain-op-node-1".
chain_docker_op_node="op-chain-op-node-1"
op_stack_path="$ROOT/optimism/op-chain"

main() {
  check_fireeth
  check_op_geth
  check_docker "$chain_docker_op_node" "You should launch the Op Stack chain with './scripts/optimism/run_optimism_devnet.sh'"

  run_dir=$(mktemp -d)

  pushd "$run_dir"
    echo "Running op-geth with Firehose tracer activated via 'fireeth'"
    db_path="`pwd`/op-geth-data"

    echo "Initializing op-geth with L2 genesis"
    "$op_geth" init --datadir "$db_path" --state.scheme hash "$op_stack_path/l2-genesis.json"

    trap 'kill $(jobs -p) 2>/dev/null' EXIT
    add_peer "enode://79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8@127.0.0.1:30304" &

    verbosity=3
    if [[ "$DEBUG" == "true" ]]; then
      verbosity=4
    elif [[ "$TRACE" == "true" ]]; then
      verbosity=5
    fi

    op_geth_args="--datadir=\"$db_path\" --verbosity=$verbosity --http --http.corsdomain="*" --http.vhosts="*" --http.addr=0.0.0.0 --http.port=28545 --http.api="web3,debug,eth,txpool,net,engine,miner" --ws --ws.addr=0.0.0.0 --ws.port=28546 --ws.origins="*" --ws.api="debug,eth,txpool,net,engine,miner" --syncmode="full" --nodiscover --maxpeers=5 --rpc.allow-unprotected-txs --authrpc.addr=0.0.0.0 --authrpc.port=28551 --authrpc.vhosts="*" --authrpc.jwtsecret="$op_stack_path/jwtsecret" --port=20303 --metrics --metrics.addr=0.0.0.0 --metrics.port=16061 --vmtrace=firehose --vmtrace.jsonconfig='{\"applyBackwardCompatibility\":false}' --gcmode=archive --state.scheme=hash"
    run_fireeth 0 "$op_geth" "$op_geth_args"
  popd > /dev/null

}

add_peer() {
    echo "Waiting for OP node to be ready to accept peers..."
    until [ -S "$db_path/geth.ipc" ]; do
        sleep 1
    done

    local peer_addr=$1
    echo "Adding OP node peer: $peer_addr"
    "$op_geth" attach --datadir="$db_path" --exec "admin.addPeer('$peer_addr')"
}

usage() {
  echo "Usage: $0"
  echo ""
  echo "Runs op-geth with Firehose tracer activated via 'fireeth'. Your Op Stack chain should be running (./optimism/run_optimism_devnet.sh) and your op-geth binary should be a firehose-enabled Op Stack execution client."
  echo ""
}

if [[ "$1" == "--help" ]] || [[ "$1" == "-h" ]]; then
  usage
  exit 0
fi

main "$@"
