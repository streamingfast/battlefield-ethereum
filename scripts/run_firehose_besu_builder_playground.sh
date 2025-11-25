#!/usr/bin/env bash

set -e

ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

source "$ROOT/lib.sh"

playground_path="$ROOT/.playground/chain"
docker_beacon_name="`basename "$playground_path"`-beacon-1"
docker_el_name="`basename "$playground_path"`-el-1"

# Connect to primary EL port for JSON-RPC, secondary port will be used for engine API
l1_rpc_url="http://localhost:8545"
# This is beacon 'http' port (container named `chain-beacon-1`)
l1_beacon_rpc_url="http://localhost:3500"

main() {
  check_fireeth
  check_besu
  check_docker "$docker_el_name" "You should launch the playground with './scripts/run_playground_devnet.sh'"
  check_docker "$docker_beacon_name" "You should launch the playground with './scripts/run_playground_devnet.sh'"

  while getopts "h" opt; do
    case $opt in
      h) usage && exit 0;;
      \?) usage_error "Invalid option: -$OPTARG";;
    esac
  done
  shift $((OPTIND-1))

  # No fork version needed - using playground genesis

  echo "Connecting to playground at:"
  echo "  EL RPC: $l1_rpc_url"
  echo "  Beacon RPC: $l1_beacon_rpc_url"
  echo ""

  wait_for_chain_beacon
  echo ""

  wait_for_chain_el
  echo ""

  # Use JWT secret from playground
  jwt_secret_file="$playground_path/jwtsecret"
  if [[ ! -f "$jwt_secret_file" ]]; then
    echo "Error: JWT secret not found at $jwt_secret_file. Make sure playground is running."
    exit 1
  fi

  run_dir=$(mktemp -d)

  pushd "$run_dir"
    echo "Running Besu with Firehose tracer activated via 'fireeth'"
    db_path="`pwd`/besu-data"

    echo "Initializing Besu with playground genesis"
    genesis_file="$playground_path/genesis.json"
    if [[ ! -f "$genesis_file" ]]; then
        echo "Error: Genesis file not found: $genesis_file"
        exit 1
    fi

    mkdir -p "$db_path"

    trap 'kill $(jobs -p) 2>/dev/null' EXIT

    verbosity=3
    if [[ "$DEBUG" == "true" ]]; then
      verbosity=4
    elif [[ "$TRACE" == "true" ]]; then
      verbosity=5
    fi

    besu_args=(
        "--host-allowlist=*"
        "--data-path=$db_path"
        "--genesis-file=$genesis_file"
        "--rpc-http-cors-origins=all"
        "--rpc-http-api=ETH,NET,WEB3"
        "--rpc-http-enabled"
        "--rpc-http-port=28545"
        "--rpc-http-host=127.0.0.1"
        "--rpc-ws-enabled"
        "--rpc-ws-host=127.0.0.1"
        "--rpc-ws-port=28546"
        "--engine-rpc-enabled"
        "--engine-host-allowlist=*"
        "--engine-rpc-port=8546"
        "--engine-jwt-secret=$jwt_secret_file"
        "--logging=INFO"
    )

    if [[ $# -gt 0 && $1 == "flashblocks" ]]; then
      besu_args="$besu_args --flashblock.address=ws://localhost:1114"
    fi

    echo "Command: $besu ${besu_args[*]}"
    exec "$besu" "${besu_args[@]}"
    # run_fireeth 0 "$besu" "$besu_args"
  popd > /dev/null

}

cleanup_on_exit() {
  echo "Cleaning up..."
  kill $(jobs -p) 2>/dev/null
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

check_builder_playground() {
  if ! command -v builder-playground &> /dev/null; then
    usage_error "builder-playground could not be found, please install it from https://github.com/flashbots/builder-playground"
  fi
}

usage_error() {
  message="$1"
  exit_code="$2"

  echo "ERROR: $message"
  echo ""
  usage
  exit ${exit_code:-1}
}

usage() {
  echo "usage: $0 [flashblocks]"
  echo ""
  echo "Run Besu with Firehose tracer connecting to an existing playground L1 chain."
  echo ""
  echo "The playground L1 chain should be started first using './scripts/run_playground_devnet.sh'."
  echo "Besu will connect to the playground's secondary EL port and sync using the merge configuration."
  echo ""
  echo "Options:"
  echo "    flashblocks       Enable flashblocks support (pass 'flashblocks' as first argument)"
  echo ""
  echo "Environment variables:"
  echo "    DEBUG=true        Enable debug logging"
  echo "    TRACE=true        Enable trace logging"
}

if [[ "$1" == "--help" ]] || [[ "$1" == "-h" ]]; then
  usage
  exit 0
fi

main "$@"
