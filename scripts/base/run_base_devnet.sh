#!/usr/bin/env bash

ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

source "$ROOT/../lib.sh"

# Checkout of github.com/streamingfast/base (or github.com/base/base) whose Docker devnet this
# script runs: its compose file, its `devnet-env` and the Dockerfiles of the setup and batcher
# images.
base_repo="${BASE_REPO:-}"
# Image of the Base sequencer and bootnode. It must be the Base release the checkout above is on.
export BASE_NODE_IMAGE="${BASE_NODE_IMAGE:-ghcr.io/base/node:v1.5.4}"

# Read by `run_firehose_base_devnet.sh`, which takes the chain configs from it.
export DEVNET_ROOT="$ROOT/.devnet"

# Base forks, by L2 block. Denim switches to 200 ms blocks; blocks before it take 2 s. Everest
# enables EIP-8130 transactions. Firehose serves from block 0, so the suite can read every
# activation block.
export L2_BASE_AZUL_BLOCK="${L2_BASE_AZUL_BLOCK-20}"
export L2_BASE_BERYL_BLOCK="${L2_BASE_BERYL_BLOCK-21}"
export L2_BASE_COBALT_BLOCK="${L2_BASE_COBALT_BLOCK-22}"
export L2_BASE_DENIM_BLOCK="${L2_BASE_DENIM_BLOCK-25}"
export L2_BASE_EVEREST_BLOCK="${L2_BASE_EVEREST_BLOCK-30}"

compose_project="battlefield-base-devnet"
compose_services=(setup-devnet l1-el l1-cl l1-vc base-bootnode base-builder op-batcher)
compose_cmd=()

# Base's `devnet-env`: the sequencer RPC is published on L2_BUILDER_HTTP_PORT, and account 0 of
# the standard test mnemonic has 10,000 ETH on L2.
l2_rpc_url="http://localhost:7545"
funder_private_key="0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"

main() {
  while getopts "h" opt; do
    case $opt in
      h) usage && exit 0;;
      \?) usage_error "Invalid option: -$OPTARG";;
    esac
  done
  shift $((OPTIND-1))

  check_docker
  check_base_repo
  if ! command -v cast &> /dev/null; then
    echo "The 'cast' command (Foundry) is required, install it with 'curl -L https://foundry.paradigm.xyz | bash && foundryup'"
    exit 1
  fi

  compose_cmd=(
    docker compose
    -p "$compose_project"
    --env-file "$base_repo/etc/docker/devnet-env"
    -f "$base_repo/etc/docker/docker-compose.yml"
    -f "$ROOT/docker-compose.battlefield.yml"
  )

  set -e
  build_images
  set +e

  # Always start from scratch: the Firehose node replays the chain from genesis.
  teardown
  wait_ports_free 4545 4052 7545

  trap "teardown" EXIT
  trap "exit 0" INT TERM

  echo "Starting the Base devnet (Azul #$L2_BASE_AZUL_BLOCK, Beryl #$L2_BASE_BERYL_BLOCK, Cobalt #$L2_BASE_COBALT_BLOCK, Denim #$L2_BASE_DENIM_BLOCK, Everest #${L2_BASE_EVEREST_BLOCK:-never})"
  mkdir -p "$DEVNET_ROOT"
  if ! "${compose_cmd[@]}" up -d --no-build --remove-orphans "${compose_services[@]}"; then
    echo "ERROR: The Base devnet did not start, see 'docker logs <container>' for the failing service"
    exit 1
  fi

  # The suite runs with every fork active, so its snapshots do not depend on how soon it starts.
  wait_rpc_block_at_least "$l2_rpc_url" "$(last_fork_block)" 300 || exit 1
  fund_l2_address

  echo ""
  echo "Base devnet is ready, start the Firehose node in another terminal:"
  echo ""
  echo "  ./scripts/run_firehose_base_devnet.sh"
  echo ""
  echo "Stop this script (Ctrl-C) to tear the devnet down."

  # Keeps the devnet up until this script is stopped, and stops it if the sequencer dies.
  "${compose_cmd[@]}" logs -f --no-log-prefix base-builder > "$DEVNET_ROOT/base-builder.log" 2>&1 &
  wait $!
}

last_fork_block() {
  local last=1 block
  for block in "$L2_BASE_AZUL_BLOCK" "$L2_BASE_BERYL_BLOCK" "$L2_BASE_COBALT_BLOCK" "$L2_BASE_DENIM_BLOCK" "$L2_BASE_EVEREST_BLOCK"; do
    if [[ -n "$block" ]] && (( block > last )); then
      last=$block
    fi
  done
  echo "$last"
}

check_base_repo() {
  if [[ -z "$base_repo" || ! -f "$base_repo/etc/docker/docker-compose.yml" ]]; then
    echo "Set BASE_REPO to a checkout of https://github.com/streamingfast/base (branch 'release/1.x'),"
    echo "the Base Docker devnet is started from its 'etc/docker' folder."
    exit 1
  fi
}

# Same images as Base's `just devnet up`, except the Base node, which is pulled. Rebuilding is a
# cache hit when the checkout did not change.
build_images() {
  echo "Building the devnet setup and op-batcher images from $base_repo"
  docker build --load -q -t devnet-setup:local-v2 -f "$base_repo/etc/docker/Dockerfile.devnet" "$base_repo" > /dev/null
  docker build --load -q -t op-batcher:local -f "$base_repo/etc/docker/Dockerfile.op-batcher" "$base_repo" > /dev/null

  echo "Pulling $BASE_NODE_IMAGE"
  docker pull -q "$BASE_NODE_IMAGE" > /dev/null
}

teardown() {
  "${compose_cmd[@]}" down --remove-orphans &> /dev/null
  # The containers write the chain data as root on Linux.
  if [[ -d "$DEVNET_ROOT" ]]; then
    docker run --rm -v "$DEVNET_ROOT:/devnet" alpine sh -c 'rm -rf /devnet/* /devnet/.[!.]*' &> /dev/null
  fi
}

wait_ports_free() {
  local port
  for port in "$@"; do
    while (echo > "/dev/tcp/127.0.0.1/$port") &> /dev/null; do
      echo "Port $port is in use, waiting for it to be released..."
      sleep 5
    done
  done
}

# The test account is funded on the sequencer, which is where the Firehose node forwards the
# suite's transactions.
fund_l2_address() {
  # cast takes the battlefield root for a Forge project, run it from elsewhere.
  pushd "$ROOT" &> /dev/null

  echo "Funding $address_to_fund with 1,000 ETH on L2..."
  local attempts=0
  until cast send --async --rpc-url="$l2_rpc_url" --private-key "$funder_private_key" --value 1000ether "$address_to_fund" > /dev/null; do
    attempts=$((attempts + 1))
    if [[ $attempts -ge 30 ]]; then
      echo "ERROR: Failed to send the funding transaction to $l2_rpc_url after $attempts attempts"
      exit 1
    fi
    sleep 1
  done

  attempts=0
  while [[ "$(cast balance --rpc-url "$l2_rpc_url" "$address_to_fund" 2> /dev/null)" == "0" ]]; do
    attempts=$((attempts + 1))
    if [[ $attempts -ge 60 ]]; then
      echo "ERROR: Funding transaction was not included on L2 after $attempts seconds"
      exit 1
    fi
    sleep 1
  done

  popd &> /dev/null
  echo "L2 address properly funded"
}

usage() {
  echo "usage: BASE_REPO=<path> run_base_devnet.sh"
  echo ""
  echo "Runs Base's Docker devnet (L1 reth and lighthouse, Base sequencer, op-batcher) with the Base"
  echo "forks scheduled at early blocks, and funds the test account. Stop it with Ctrl-C."
  echo ""
  echo "Environment"
  echo "    BASE_REPO          Checkout of streamingfast/base, branch 'release/1.x' (required)"
  echo "    BASE_NODE_IMAGE    Base node image of the sequencer (default: $BASE_NODE_IMAGE)"
  echo "    L2_BASE_<FORK>_BLOCK  Activation block of AZUL, BERYL, COBALT, DENIM or EVEREST"
  echo ""
  echo "Options"
  echo "    -h          Display help about this script"
}

main "$@"
