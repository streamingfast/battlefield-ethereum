#!/usr/bin/env bash

ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

source "$ROOT/../lib.sh"

playground_pid=""

db_path="$ROOT/op-node-db"
op_stack_path="$ROOT/op-chain"
docker_op_node_name="`basename "$op_stack_path"`-op-node-1"

main() {
  pushd "$ROOT" &> /dev/null

  check_sd
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
  builder-playground cook opstack --output="$op_stack_path" --external-builder op-rbuilder --flashblocks &
  playground_pid=$!

  echo "Waiting for builder-playground to start OP stack correctly..."
  wait_for_chain_op_node

  # The op-stack above always starts from scratch, so we need to do the same here
  if [[ -d "$db_path" ]]; then
    echo "Removing existing op-node-db at $db_path"
    rm -rf "$db_path"
  fi

  mkdir -p "$db_path/safedb"
  mkdir -p "$db_path/peers"
  mkdir -p "$db_path/discovery"

  op_node_peer_id="$(extract_chain_op_node_peer_id)"
  op_node_peer="/ip4/127.0.0.1/tcp/9003/p2p/$op_node_peer_id"

  pk="0x2a871d0798f97d79848a013d4936a73bf4cc922c825d33c1cf7073dff6d409c6"
  pushd /tmp &> /dev/null
  sleep 15
  echo "Funding the default address with 1,000,000 ETH on L2"
  cast send --rpc-url=http://localhost:8547  --private-key "$pk" --value 1000000ether "$address_to_fund" --priority-gas-price=25000000000 --gas-price=250000000000
  popd &> /dev/null

  echo "Starting op-node"
  echo " DB path: $db_path"
  echo " OP node peer: $op_node_peer"
  echo ""

  # Configuration
  # - http://localhost:8545 -> points to el RPC address
  # - http://localhost:3500 -> points to beacon RPC address
  # - http://localhost:28551 -> points to op-geth authrpc address
  # - /ip4/127.0.0.1/tcp/9003 -> points to op-node P2P address

  op-node \
    --l1=http://localhost:8545 \
    --l1.beacon=http://localhost:3500 \
    --l2=http://localhost:28551  \
    --l2.engine-rpc-timeout=60s \
    --l2.jwt-secret="$op_stack_path/jwtsecret" \
    --log.level=error \
    --rollup.config="$op_stack_path/rollup.json" \
    --rollup.l1-chain-config="$op_stack_path/genesis.json" \
    --sequencer.enabled=false \
    --rpc.addr=0.0.0.0 \
    --rpc.port=19545 \
    --rpc.enable-admin \
    --metrics.enabled \
    --metrics.addr=0.0.0.0 \
    --metrics.port=17300 \
    --pprof.enabled \
    --pprof.addr=0.0.0.0 \
    --pprof.port=16060 \
    --p2p.no-discovery \
    --p2p.sync.onlyreqtostatic=true \
    --p2p.listen.ip=0.0.0.0 \
    --p2p.listen.tcp=19222 \
    --p2p.listen.udp=19222 \
    --p2p.static="/ip4/127.0.0.1/tcp/9003/p2p/$op_node_peer_id" \
    --safedb.path="$db_path/safedb" \
    --p2p.peerstore.path="$db_path/peers" \
    --p2p.discovery.path="$db_path/discovery" \
    --p2p.priv.path="$db_path/p2p_node_key.txt"
}

maybe_cleanup_previous() {
  if [[ -d "$op_stack_path" && -f "$op_stack_path/docker-compose.yaml" ]]; then
    echo "Tearing down existing op-stack at $op_stack_path"
    cd "$op_stack_path" && docker compose down
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

wait_for_chain_op_node() {
  wait_for_chain_op_node_rpc
  wait_for_chain_op_node_peer_id
}

wait_for_chain_op_node_rpc() {
  echo "Waiting for OP node to be ready to accept peers..."
  local attempts=0
  local max_attempts=60
  until curl -sS http://localhost:8556/eth/v1/node/peers &> /dev/null; do
      sleep 1
      attempts=$((attempts + 1))
      if [ $attempts -ge $max_attempts ]; then
          echo "Failed to connect to OP node after $max_attempts attempts"
          return 1
      fi
  done
}

wait_for_chain_op_node_peer_id() {
  echo "Waiting for OP node peer ID..."
  local attempts=0
  local max_attempts=30

  while [ $attempts -lt $max_attempts ]; do
    op_node_peer_id="$(extract_chain_op_node_peer_id)"

    if [ -n "$op_node_peer_id" ]; then
      echo "Found OP node peer ID: $op_node_peer_id"
      return 0
    fi

    sleep 1
    attempts=$((attempts + 1))
  done

  echo "Failed to find OP node peer ID after $max_attempts attempts"
  return 1
}

extract_chain_op_node_peer_id() {
  echo "$(docker logs "$docker_op_node_name" 2>&1 | grep "started p2p host" | cut -d ' ' -f 8- | sd 'peerID=' '')"
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
  echo "usage: run_op_node.sh <none>"
  echo ""
  echo "Run op-node stack connecting to local op-geth instance."
  echo ""
  echo "Options"
  echo "    -h          Display help about this script"
  echo "    -b          Build op-node from source before starting"
  echo "    -c          Clean the existing database before starting"
}

main "$@"