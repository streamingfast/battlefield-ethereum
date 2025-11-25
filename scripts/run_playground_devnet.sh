#!/usr/bin/env bash

ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

source "$ROOT/lib.sh"

playground_pid=""

playground_path="$ROOT/.playground/chain"
docker_node_name="`basename "$playground_path"`-reth-1"

# This is el `http` port (container named `playground-reth-1`)
l1_rpc_url="http://localhost:8545"
# This is secondary el `http` port for additional clients to connect
l1_secondary_rpc_url="http://localhost:8547"
# This is beacon 'http' port (container named `playground-beacon-1`)
l1_beacon_rpc_url="http://localhost:3500"

main() {
  pushd "$ROOT" &> /dev/null

  check_builder_playground

  while getopts "h" opt; do
    case $opt in
      h) usage && exit 0;;
      \?) usage_error "Invalid option: -$OPTARG";;
    esac
  done
  shift $((OPTIND-1))

  maybe_cleanup_previous

  trap "cleanup_on_exit" EXIT
  builder-playground cook l1 --output="$playground_path" --secondary-el 8547 &
  playground_pid=$!
  echo ""

  wait_for_playground_ready
  echo ""

  echo "L1 playground is ready!"
  echo "Primary EL RPC: $l1_rpc_url"
  echo "Secondary EL RPC: $l1_secondary_rpc_url"
  echo "Beacon RPC: $l1_beacon_rpc_url"
  echo ""
  echo "You can now connect your Besu client to sync with the L1 chain."
  echo "Press Ctrl+C to stop the playground."

  # Wait for the playground process to finish
  wait $playground_pid

}

maybe_cleanup_previous() {
  if [[ -d "$playground_path" && -f "$playground_path/docker-compose.yaml" ]]; then
    echo "Tearing down existing playground at $playground_path"
    cd "$playground_path" && docker compose down
  fi
}

cleanup_on_exit() {
  echo "Cleaning up..."
  if [[ -n "$playground_pid" ]]; then
    echo "Killing builder-playground (pid: $playground_pid)"
    kill -s SIGTERM "$playground_pid"
  fi

  maybe_cleanup_previous

  kill $(jobs -p) 2>/dev/null
}

wait_for_playground_ready() {
  echo "Waiting for playground to be ready..."
  sleep 5  # Give playground time to start up
  echo "Playground started successfully"
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
  echo "usage: run_playground_devnet.sh <none>"
  echo ""
  echo "Run L1 playground with beacon chain and secondary EL port for external clients to connect."
  echo ""
  echo "Options"
  echo "    -h          Display help about this script"
}

main "$@"