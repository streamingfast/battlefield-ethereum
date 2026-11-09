#!/usr/bin/env bash

ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && cd .. && pwd )"

source "$SCRIPT_DIR/lib.sh"

playground_pid=""

playground_path="$ROOT/.playground/chain"
block_time_secs=1

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

  builder-playground start l1 \
    --output="$playground_path" \
    --block-time=${block_time_secs}s \
    --secondary-el http://host.docker.internal:8552 \
    --prefunded-accounts="$private_key_to_fund" \
    --log-level debug &
  playground_pid=$!
  echo ""

  wait_for_playground_ready
  echo ""

  check_l1_block_time
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

# builder-playground stop all should handle cleanup, this is just a fallback.
# We ran into some cases where files weren't cleaned up properly, so we keep this as a fallback.
maybe_cleanup_previous() {
  if [[ -d "$playground_path" && -f "$playground_path/docker-compose.yaml" ]]; then
    echo "Tearing down existing playground at $playground_path"
    # No `cd`: this runs in the main shell, and builder-playground deletes and recreates this
    # directory, which would leave everything started afterwards in a deleted working directory.
    docker compose -f "$playground_path/docker-compose.yaml" down
  fi
}

cleanup_on_exit() {
  echo "Cleaning up..."
  builder-playground stop all

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


# Upstream builder-playground ignores --block-time on the L1 and runs 12s slots, which makes the
# reth-devnet/geth-devnet suites take about 25 minutes instead of a few.
check_l1_block_time() {
  wait_rpc_block_at_least "$l1_rpc_url" 2 120 || exit 1

  local latest previous
  latest="$(block_timestamp latest)"
  previous="$(block_timestamp "$(printf '0x%x' $(( $(block_number) - 1 )))")"

  local slot_secs=$(( latest - previous ))
  if (( slot_secs > block_time_secs * 2 )); then
    echo -e "${RED}Error: the L1 produces a block every ${slot_secs}s instead of every ${block_time_secs}s.${NC}"
    echo "Your builder-playground ignores --block-time, install the StreamingFast fork:"
    echo ""
    echo "  git clone -b fix/l1-block-time-not-respected-anymore https://github.com/streamingfast/builder-playground.git"
    echo "  cd builder-playground && go install ."
    echo ""
    echo "Set PLAYGROUND_ALLOW_SLOW_L1=1 to run on the slow L1 anyway."
    [[ "$PLAYGROUND_ALLOW_SLOW_L1" == "1" ]] || exit 1
  fi
  echo "L1 block time: ${slot_secs}s"
}

block_number() {
  echo $(( $(rpc_call eth_blockNumber '[]' | sed -n 's/.*"result":"\(0x[0-9a-fA-F]*\)".*/\1/p') ))
}

# usage: block_timestamp <block_tag_or_hex_number>
block_timestamp() {
  local hex
  hex="$(rpc_call eth_getBlockByNumber "[\"$1\",false]" | sed -n 's/.*"timestamp":"\(0x[0-9a-fA-F]*\)".*/\1/p')"
  echo $(( hex ))
}

rpc_call() {
  curl -s -X POST -H "Content-Type: application/json" \
    --data "{\"jsonrpc\":\"2.0\",\"method\":\"$1\",\"params\":$2,\"id\":1}" "$l1_rpc_url"
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