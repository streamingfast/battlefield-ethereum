#!/usr/bin/env bash

set -e

ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

source "$ROOT/lib.sh"

playground_path="$ROOT/.playground/chain"
docker_beacon_name="`basename "$playground_path"`-beacon-1"
docker_el_name="`basename "$playground_path"`-el-1"

# Connect to primary EL port for JSON-RPC
l1_rpc_url="http://localhost:8545"
# This is beacon 'http' port
l1_beacon_rpc_url="http://localhost:3500"

main() {
  check_fireeth
  check_geth
  check_docker "$docker_el_name" "You should launch the playground with './scripts/run_playground_devnet.sh'"
  check_docker "$docker_beacon_name" "You should launch the playground with './scripts/run_playground_devnet.sh'"

  echo "Connecting to playground at:"
  echo "  EL RPC: $l1_rpc_url"
  echo "  Beacon RPC: $l1_beacon_rpc_url"
  echo ""

  wait_for_chain_beacon
  echo ""

  wait_for_chain_el
  echo ""

  echo "Getting EL enode for peer connection..."
  el_enode=$(get_el_enode)
  if [[ -z "$el_enode" ]]; then
    echo "Failed to get EL enode"
    exit 1
  fi
  echo "EL enode: $el_enode"
  echo ""

  echo "Running Geth playground node with Firehose tracer activated via 'fireeth'"
  echo "Note: Adding EL peer via RPC call after Geth starts"

  # Start geth in background and add peer
  trap 'kill $(jobs -p) 2>/dev/null' EXIT
  add_peer "$el_enode" &

  run_fireeth 0 "bash" "$ROOT/wrapped_geth_playground.sh"
}

wait_for_chain_beacon() {
  echo "Waiting for beacon node to be ready..."
  local attempts=0
  local max_attempts=60
  until curl -sS "$l1_beacon_rpc_url/eth/v1/node/syncing" &> /dev/null; do
      sleep 1
      attempts=$((attempts + 1))
      if [ $attempts -ge $max_attempts ]; then
          echo "Failed to connect to beacon node after $max_attempts attempts"
          return 1
      fi
  done
  echo "Beacon node is ready"
}

wait_for_chain_el() {
  echo "Waiting for execution client..."
  local attempts=0
  local max_attempts=60  # Increased timeout

  while [ $attempts -lt $max_attempts ]; do
    # Try a simple curl to see if the endpoint responds
    if curl -s --max-time 5 "$l1_rpc_url" > /dev/null 2>&1; then
      echo "Execution client is responding on $l1_rpc_url"
      return 0
    fi

    echo "Attempt $((attempts + 1))/$max_attempts: EL not ready yet..."
    sleep 2
    attempts=$((attempts + 1))
  done

  echo "Failed to connect to execution client after $max_attempts attempts"
  return 1
}

get_el_enode() {
  check_jq
  local attempts=0
  local max_attempts=30

  while [ $attempts -lt $max_attempts ]; do
    enode=$(curl -sS -X POST \
      -H "Content-Type: application/json" \
      --data '{"jsonrpc":"2.0","method":"admin_nodeInfo","params":[],"id":1}' \
      "$l1_rpc_url" 2>/dev/null | jq -r '.result.enode' 2>/dev/null)

    if [[ -n "$enode" && "$enode" != "null" ]]; then
      # Replace any IP address (IPv4 or IPv6) with 127.0.0.1
      echo "$enode" | sed -E \
        -e 's/@[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+:/@127.0.0.1:/' \
        -e 's/@\[::\]/@127.0.0.1/' \
        -e 's/@\[::1\]/@127.0.0.1/' \
        -e 's/@0\.0\.0\.0/@127.0.0.1/'
      return 0
    fi

    sleep 1
    attempts=$((attempts + 1))
  done

  return 1
}

add_peer() {
    local data_dir="/tmp/geth-playground-data"
    echo "Waiting for Geth to be ready to accept peers..."
    until [ -S "$data_dir/geth.ipc" ]; do
        sleep 1
    done

    local peer_addr=$1
    echo "Adding EL peer: $peer_addr"
    "$geth" attach --datadir="$data_dir" --exec "admin.addPeer('$peer_addr')"
}

usage() {
  echo "usage: $0"
  echo ""
  echo "Run Geth with Firehose tracer connecting to an existing playground L1 chain."
  echo ""
  echo "The playground L1 chain should be started first using './scripts/run_playground_devnet.sh'."
  echo "Geth will connect to the playground's cl-proxy as a secondary execution client."
  echo ""
}

if [[ "$1" == "--help" ]] || [[ "$1" == "-h" ]]; then
  usage
  exit 0
fi

main "$@"
