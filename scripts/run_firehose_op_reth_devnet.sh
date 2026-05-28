#!/usr/bin/env bash

set -e

ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

source "$ROOT/lib.sh"

# This name comes from the fact that in [./optimism/run_optimism_devnet.sh], the op-node container named is
# randomly generate and is suffixed with op-node-1 so we pass that and check docker checks if a container with
# such suffix exist
chain_docker_op_node_suffix="op-node-1"
op_stack_path="$ROOT/optimism/op-chain"

main() {
  check_fireeth
  check_op_reth
  check_docker "$chain_docker_op_node_suffix" "You should launch the Op Stack chain with './scripts/optimism/run_optimism_devnet.sh'"

  run_dir=$(mktemp -d)

  pushd "$run_dir"
    echo "Running op-reth with Firehose tracer activated via 'fireeth'"
    db_path="`pwd`/op-reth-data"

    echo "Initializing op-reth with L2 genesis"
    "$op_reth" init --datadir "$db_path" --chain "$op_stack_path/l2-genesis.json"

    trap 'kill $(jobs -p) 2>/dev/null' EXIT

    verbosity="-v"
    if [[ "$DEBUG" == "true" ]]; then
      verbosity="-vvv"
    elif [[ "$TRACE" == "true" ]]; then
      verbosity="-vvvv"
    fi

    op_reth_args_parts=(
      "node"
      "--datadir=\"$db_path\""
      "--chain=\"$op_stack_path/l2-genesis.json\""
      "$verbosity"
      "--http"
      "--http.corsdomain=\"*\""
      "--http.addr=0.0.0.0"
      "--http.port=28545"
      "--http.api=\"web3,debug,eth,txpool,net,admin\""
      "--ws"
      "--ws.addr=0.0.0.0"
      "--ws.port=28546"
      "--ws.origins=\"*\""
      "--ws.api=\"debug,eth,txpool,net\""
      "--authrpc.addr=0.0.0.0"
      "--authrpc.port=28551"
      "--authrpc.jwtsecret=\"$op_stack_path/jwtsecret\""
      "--port=20303"
      "--disable-discovery"
      "--metrics=0.0.0.0:16061"
      "--engine.persistence-threshold=0"
      "--engine.memory-block-buffer-target=0"
      "--vmtrace=firehose"
      "--vmtrace.jsonconfig='{\"applyBackwardCompatibility\":false}'"
    )
    # 'run_fireeth' expects the node arguments as a single string, so we join the
    # readable multi-line array above into one space-separated argument string.
    op_reth_args="${op_reth_args_parts[*]}"

    run_fireeth 0 "$op_reth" "$op_reth_args"
  popd > /dev/null

}

usage() {
  echo "Usage: $0"
  echo ""
  echo "Runs op-reth with Firehose tracer activated via 'fireeth'. Your Op Stack chain should be running (./optimism/run_optimism_devnet.sh) and your op-reth binary should be a firehose-enabled Op Stack execution client."
  echo ""
}

if [[ "$1" == "--help" ]] || [[ "$1" == "-h" ]]; then
  usage
  exit 0
fi

main "$@"
