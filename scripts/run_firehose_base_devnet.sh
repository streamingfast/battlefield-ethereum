#!/usr/bin/env bash

set -e

ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

source "$ROOT/lib.sh"

# Written by `./base/run_base_devnet.sh`.
devnet_root="$ROOT/base/.devnet"

# The devnet's L1 and sequencer, as published by `./base/run_base_devnet.sh`.
l1_rpc_url="http://localhost:4545"
l1_beacon_url="http://localhost:4052"
sequencer_rpc_url="http://localhost:7545"

# Ports of the Firehose node: its HTTP RPC is the `base-devnet` url in `hardhat.config.ts`.
http_port=9645
authrpc_port=9651
p2p_port=9603
consensus_rpc_port=9649

main() {
  check_fireeth
  check_base_reth_node
  check_base_consensus
  check_jq

  if [[ ! -f "$devnet_root/l2/configs/rollup.json" ]]; then
    echo "No Base devnet configuration in $devnet_root, start it first with './scripts/base/run_base_devnet.sh'"
    exit 1
  fi

  run_dir=$(mktemp -d)
  echo "Running base-reth-node with the Firehose tracer through 'fireeth' (run directory: $run_dir)"

  # The Engine API secret is shared by this node and the consensus node that drives it only.
  od -An -tx1 -N32 /dev/urandom | tr -d ' \n' > "$run_dir/jwt.hex"

  # base-reth-node derives the Denim block times from `config.blockTime`, which the devnet
  # genesis leaves out: Base's own nodes take it from the rollup config instead.
  jq --argjson block_time "$(jq .block_time "$devnet_root/l2/configs/rollup.json")" \
    '.config.blockTime = $block_time' "$devnet_root/l2/configs/genesis.json" > "$run_dir/genesis.json"

  local args=(
    "node"
    "--chain=$run_dir/genesis.json"
    "--datadir=$run_dir/base-reth-data"
    "--http"
    "--http.addr=127.0.0.1"
    "--http.port=$http_port"
    "--http.api=eth,net,web3,debug,txpool"
    "--authrpc.addr=127.0.0.1"
    "--authrpc.port=$authrpc_port"
    "--authrpc.jwtsecret=$run_dir/jwt.hex"
    "--port=$p2p_port"
    "--disable-discovery"
    "--ipcdisable"
    "--rollup.sequencer-http=$sequencer_rpc_url"
    "-v"
  )

  start_consensus_follower "$run_dir" &
  local follower_pid=$!
  trap "kill $follower_pid 2> /dev/null" EXIT

  force_devnet_finality
  run_fireeth 0 "$base_reth_node" "${args[*]}" "$@"
}

# The devnet's sequencer sends its blocks to no one outside Docker, so the node gets them from a
# consensus node in follow mode, which reads them from the sequencer RPC and inserts them through
# the Engine API, like Base's own proofs node in its local Nitro devnet. It needs the Engine API
# to be up when it starts.
start_consensus_follower() {
  local run_dir="$1"

  until curl -s -o /dev/null --connect-timeout 1 "http://127.0.0.1:$authrpc_port"; do
    sleep 1
  done

  echo "Firehose node Engine API is up, starting base-consensus in follow mode (logs: $run_dir/base-consensus.log)"
  "$base_consensus" \
    --chain "$(jq -r .l2_chain_id "$devnet_root/l2/configs/rollup.json")" \
    follow \
    --source-l2-rpc="$sequencer_rpc_url" \
    --l2-rpc-url="http://127.0.0.1:$http_port" \
    --l2-engine-rpc="http://127.0.0.1:$authrpc_port" \
    --l2-engine-jwt-secret="$run_dir/jwt.hex" \
    --l1-eth-rpc="$l1_rpc_url" \
    --l1-beacon="$l1_beacon_url" \
    --l2-config-file="$devnet_root/l2/configs/rollup.json" \
    --l1-config-file="$devnet_root/l1/configs/el/chain-config.json" \
    --rpc.addr=127.0.0.1 \
    --port="$consensus_rpc_port" \
    > "$run_dir/base-consensus.log" 2>&1 &
  local pid=$!

  trap "kill $pid 2> /dev/null" TERM INT EXIT
  wait $pid
}

usage() {
  echo "Usage: $0 [<fireeth flags>...]"
  echo ""
  echo "Runs the Firehose-instrumented base-reth-node (streamingfast/base, branch 'release/1.x')"
  echo "through 'fireeth', following the Base devnet started by './scripts/base/run_base_devnet.sh'"
  echo "with base-consensus in follow mode. Extra arguments are passed to 'fireeth start'."
  echo ""
  echo "Environment"
  echo "    BASE_RETH_NODE_BINARY   Path to base-reth-node (default: base-reth-node on PATH)"
  echo "    BASE_CONSENSUS_BINARY   Path to base-consensus (default: base-consensus on PATH)"
}

if [[ "$1" == "--help" ]] || [[ "$1" == "-h" ]]; then
  usage
  exit 0
fi

main "$@"
