#!/usr/bin/env bash

ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

source "$ROOT/../lib.sh"

playground_pid=""

db_path="$ROOT/op-node-db"
op_stack_path="$ROOT/op-chain"
docker_op_node_name="`basename "$op_stack_path"`-op-node-1"
docker_op_geth_name="`basename "$op_stack_path"`-op-geth-1"

# This is el `http` port (container named `op-chain-el-1`)
l1_rpc_url="http://localhost:8545"
# This is beacon 'http' port (container named `op-chain-beacon-1`)
l1_beacon_rpc_url="http://localhost:3500"
# This is rollup-boost `authrpc` port (container named `op-chain-rollup-boost-1`)
l2_sequencer_rpc_url="http://localhost:8554"
# This is op-geth `http` port (container named `op-chain-op-geth-1`)
l2_geth_rpc_url="http://localhost:8547"
# This is op-geth address that will be started by the `./scripts/run_firehose_optimism_devnet.sh` script
local_op_geth_authrpc_url="http://localhost:28551"

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
  echo ""

  wait_for_chain_op_node
  echo ""

  wait_for_chain_op_geth
  echo ""

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

  fund_l2_address &

  echo "Starting op-node"
  echo " DB path: $db_path"
  echo " OP node peer: $op_node_peer"
  echo ""

  op-node \
    --l1="$l1_rpc_url" \
    --l1.beacon="$l1_beacon_rpc_url" \
    --l2="$local_op_geth_authrpc_url"  \
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

wait_for_chain_op_geth() {
  echo "Waiting for OP geth..."
  local attempts=0
  local max_attempts=30

  wait_for_block="1"

  while [ $attempts -lt $max_attempts ]; do
    imported_block="$(docker logs "$docker_op_geth_name" 2>&1 | grep "Imported new potential chain segment" | grep -oE "number=$wait_for_block")"

    if [ -n "$imported_block" ]; then
      echo "Found imported block: $imported_block"
      return 0
    fi

    sleep 1
    attempts=$((attempts + 1))
  done

  echo "Failed to find Op Geth imported block after $max_attempts attempts"
  return 1
}

extract_chain_op_node_peer_id() {
  echo "$(docker logs "$docker_op_node_name" 2>&1 | grep "started p2p host" | cut -d ' ' -f 8- | sd 'peerID=' '')"
}

fund_l2_address() {
  local pk="0x2a871d0798f97d79848a013d4936a73bf4cc922c825d33c1cf7073dff6d409c6"
  local attempts=0
  local max_attempts=15

  echo "Funding the default address with 1,000,000 ETH on L2 (background)..."

  # It seems cast does not like being run from the project's root, it complains about not
  # finding the project root, probably a wrong heuristic on cast side think he is in a Forge
  # project. So run it from ROOT folder which is outside of root.
  pushd "$ROOT" &> /dev/null

  while [ $attempts -lt $max_attempts ]; do
    if cast send --async --rpc-url="$rpc_url" --private-key "$pk" --value 1000000ether "$address_to_fund" --priority-gas-price=25000000000 --gas-price=250000000000; then
      echo "Successfully funded address $address_to_fund on L2"
      return 0
    fi

    sleep 1
    attempts=$((attempts + 1))
  done

  popd &> /dev/null

  echo "ERROR: Failed to fund L2 address after $max_attempts attempts"
  kill -s SIGTERM $$
  return 1
}

fund_l2_address() {
  local pk="0x2a871d0798f97d79848a013d4936a73bf4cc922c825d33c1cf7073dff6d409c6"

  # It seems cast does not like being run from the project's root, it complains about not
  # finding the project root, probably a wrong heuristic on cast side think he is in a Forge
  # project. So run it from ROOT folder which is outside of root.
  pushd "$ROOT" &> /dev/null

  echo "Funding the default address with 1,000,000 ETH on L2 (background)..."
  cast send --async --rpc-url="$l2_sequencer_rpc_url" --private-key "$pk" --value 1000000ether "$address_to_fund" --priority-gas-price=25000000000 --gas-price=250000000000 > /dev/null

  echo "Waiting for fund to arrive"
  local attempts=0
  local max_attempts=15
  while [ $attempts -lt $max_attempts ]; do
    balance=`cast balance --rpc-url "$l2_geth_rpc_url" "$address_to_fund"`
    if [[ $? -eq 0 && $balance != "0" ]]; then
      echo "L2 address properly funded"
      return 0
    fi

    sleep 1
    attempts=$((attempts + 1))
  done

  popd &> /dev/null

  echo "ERROR: Failed to fund L2 address after $max_attempts attempts"
  kill -s SIGTERM $$
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