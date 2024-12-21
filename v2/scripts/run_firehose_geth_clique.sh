#!/usr/bin/env bash

set -e

PARENT_PID=$$
ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
source "$ROOT/lib.sh"

main() {
  check_fireeth
  check_geth
  check_jq
  check_sd

  launch_miner
  wait_geth_up http://localhost:8545

  enode_raw=$(curl -sS --data '{"method":"admin_nodeInfo","params":[],"id":1,"jsonrpc":"2.0"}' -H "Content-Type: application/json" -X POST http://localhost:8545 | jq -r .result.enode)
  enode=$(echo $enode_raw | sd '\?.*$' '')

  geth_args="--networkid=1515"
  geth_args="$geth_args --bootnodes=$enode"
  geth_args="$geth_args --datadir='$firehose_data_dir/node' --syncmode=full --gcmode=archive"
  geth_args="$geth_args --authrpc.port=9551 --http.port=9545 --ws.port=9546 --port=30304"
  geth_args="$geth_args --http --http.api=admin,eth,web3,net"
  geth_args="$geth_args --firehose-enabled --firehose-genesis-file='$ROOT/geth_clique/genesis.json'"

  echo "Running Geth Clique node with Firehose tracer activated via 'fireeth'"
  run_fireeth 0 "$geth" "$geth_args" --reader-node-bootstrap-data-url="bash://$ROOT/bootstrap_geth_clique.sh"
}

miner_pid=""

on_exit() {
  if [[ -n "$miner_pid" ]]; then
    echo "Killing miner process"
    kill -s TERM $miner_pid &> /dev/null
  fi
}

launch_miner() {
  run_dir="$(mktemp -d)"
  miner_log="$ROOT/geth_clique/miner.log"
  miner_bootstrap_log="$ROOT/geth_clique/miner.bootstrap.log"
  keystore_dir="$run_dir/geth/keystore"

  "$geth" --datadir="$run_dir" init "$ROOT/geth_clique/genesis.json" 2> "$miner_bootstrap_log"
  cp -R "$ROOT/geth_clique/keystore" "$run_dir/geth/"

  echo "Starting miner process (log `relative_path "$miner_log"`, data `relative_path "$run_dir"`)"

  ("$geth" \
      --datadir="$run_dir" \
      --allow-insecure-unlock \
      --keystore="$keystore_dir" \
      --unlock=832de76536377dd681de5d26e2d5f6117db11392 \
      --password="$keystore_dir/passphrase.txt" \
      --mine \
      --miner.etherbase=832de76536377dd681de5d26e2d5f6117db11392 \
      --syncmode=full \
      --gcmode=archive \
      --port=30303 \
      --networkid=1515 \
      --http --http.api admin,eth,web3,net \
      --nodiscover 2> $miner_log) &
  miner_pid=$!
  trap "on_exit" EXIT

  monitor_child_process "miner" $miner_pid $PARENT_PID "$miner_log" &
}

usage() {
  echo "Usage: $0"
  echo ""
  echo "Runs a Geth Clique consensus node with Firehose tracer activated."
}

main "$@"
