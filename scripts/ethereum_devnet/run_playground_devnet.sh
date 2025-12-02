#!/usr/bin/env bash

ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && cd .. && pwd )"

source "$SCRIPT_DIR/lib.sh"

playground_pid=""
geth_pid=""

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

  builder-playground cook l1 \
    --output="$playground_path" \
    --block-time=1s \
    --secondary-el http://host.docker.internal:8552 \
    --prefunded-account="$private_key_to_fund" \
    --log-level debug &
  playground_pid=$!
  echo ""

  wait_for_playground_ready
  echo ""

  echo ""
  echo -e "${GREEN}L1 Playground ready${NC}"
  echo "Primary EL RPC: $l1_rpc_url"
  echo "Secondary EL RPC: $l1_secondary_rpc_url"
  echo "Beacon RPC: $l1_beacon_rpc_url"
  echo ""
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
  if [[ -n "$geth_pid" ]]; then
    echo "Stopping local Geth process (pid: $geth_pid)..."
    kill -s SIGTERM "$geth_pid" 2>/dev/null || true
  fi

  if [[ -n "$playground_pid" ]]; then
    echo "Killing builder-playground (pid: $playground_pid)"
    kill -s SIGTERM "$playground_pid"
  fi

  maybe_cleanup_previous

  kill $(jobs -p) 2>/dev/null
}

wait_for_playground_ready() {
  echo "Waiting for playground to be ready..."

  max_attempts=30
  attempt=1
  while [ $attempt -le $max_attempts ]; do
      if curl -s http://localhost:8545 -X POST -H "Content-Type: application/json" \
          --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' > /dev/null 2>&1; then
          break
      fi
      echo "Attempt $attempt/$max_attempts: Reth not ready yet..."
      sleep 2
      attempt=$((attempt + 1))
  done

  if [ $attempt -gt $max_attempts ]; then
      echo -e "${RED}Error: Reth didn't become ready within expected time${NC}"
      exit 1
  fi
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