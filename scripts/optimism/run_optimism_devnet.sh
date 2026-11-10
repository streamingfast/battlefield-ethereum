#!/usr/bin/env bash

ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

source "$ROOT/../lib.sh"

playground_pid=""

db_path="$ROOT/op-node-db"
op_stack_path="$ROOT/op-chain"

# This is el `http` port (container named `op-chain-el-1`)
l1_rpc_url="http://localhost:8545"
# This is beacon 'http' port (container named `op-chain-beacon-1`)
l1_beacon_rpc_url="http://localhost:3500"
# This is the sequencer EL `http` port (container named `op-chain-op-reth-1`, or
# `op-chain-op-geth-1` with `-n`), also the `op-*-devnet` RPC url in `hardhat.config.ts`
l2_rpc_url="http://localhost:8547"
# This is the Engine API of the Firehose EL started by `../run_firehose_op_reth_devnet.sh` or
# `../run_firehose_op_geth_devnet.sh`, driven by the local op-node this script starts
local_el_authrpc_url="http://localhost:28551"

# L2 block at which Karst activates. Early enough that the whole suite runs on Karst, after
# genesis so the Jovian genesis (and the snapshots taken from it) stays the same and the
# activation block carries the network upgrade transactions.
karst_block=10

main() {
  pushd "$ROOT" &> /dev/null

  check_sd
  check_jq
  check_builder_playground opstack
  check_op_node

  karst=true
  while getopts "hn" opt; do
    case $opt in
      h) usage && exit 0;;
      n) karst=false;;
      \?) usage_error "Invalid option: -$OPTARG";;
    esac
  done
  shift $((OPTIND-1))

  maybe_cleanup_previous

  trap "cleanup_on_exit" EXIT
  # - Jovian is enabled at genesis (`--enable-latest-fork=0`), the recipe stops at Isthmus otherwise.
  # - Karst activates at `karst_block`. op-geth cannot run Karst, so the sequencer is op-reth;
  #   `-n` keeps the recipe's op-geth sequencer and leaves Karst out.
  # - 1s L2 blocks (default 2s): Firehose serves once the first 100-block bundle is final, which the
  #   EL launchers make happen 10 blocks later (`force_devnet_finality`).
  # - No external builder: `--external-builder op-rbuilder --flashblocks` adds rollup-boost, bproxy
  #   and flashblocks-rpc, nothing the suite needs, and bproxy races op-rbuilder at startup.
  local fork_flags=(--enable-latest-fork=0)
  if [[ "$karst" == "true" ]]; then
    sequencer_el="op-reth"
    fork_flags+=(--sequencer-el=op-reth "--enable-karst=$karst_block")
  else
    sequencer_el="op-geth"
  fi

  builder-playground cook opstack --output="$op_stack_path" "${fork_flags[@]}" --block-time=1 &
  playground_pid=$!
  echo ""

  # Two notes:
  # - We need to sleep a bit otherwise find by name found nothing, it's probably worse if there is image pulling to be done ...
  # - Find by ends with is picky because it's pass to grep, so a leading - must not be put otherwise grep complains
  echo "Waiting for OP node container to be created..."
  while [[ "$(find_docker_by_name_ends_with "op-node-1")" == "" ]]; do
    sleep 1
  done

  docker_op_node_name="$(find_docker_by_name_ends_with "op-node-1")"

  # An extra blank line is required it seems otherwise there no separation between builder-playground output and ours
  echo ""
  echo "Container op-node started, waiting for it to be ready..."
  echo " DB path: $db_path"
  echo " Docker OP node name: $docker_op_node_name"
  echo " Sequencer EL: $sequencer_el"
  if [[ "$karst" == "true" ]]; then
    echo " Karst activation block: $karst_block"
  fi
  echo ""

  wait_for_chain_op_node "$docker_op_node_name"
  echo ""

  check_sequencer_rpc_port "$(find_docker_by_name_ends_with "$sequencer_el-1")"

  wait_for_sequencer_el
  echo ""

  # The op-stack above always starts from scratch, so we need to do the same here
  if [[ -d "$db_path" ]]; then
    echo "Removing existing op-node-db at $db_path"
    rm -rf "$db_path"
  fi

  mkdir -p "$db_path/safedb"
  mkdir -p "$db_path/peers"
  mkdir -p "$db_path/discovery"

  op_node_peer_id="$(extract_chain_op_node_peer_id "$docker_op_node_name")"
  op_node_peer="/ip4/127.0.0.1/tcp/9003/p2p/$op_node_peer_id"

  fund_l2_address

  echo ""
  echo "Op Stack devnet is ready, start the Firehose execution client in another terminal:"
  echo ""
  if [[ "$karst" == "true" ]]; then
    echo "  ./scripts/run_firehose_op_reth_devnet.sh"
    echo ""
    echo "Karst activates at block $karst_block, op-geth cannot follow it: start this script with -n"
    echo "for ./scripts/run_firehose_op_geth_devnet.sh."
  else
    echo "  ./scripts/run_firehose_op_reth_devnet.sh   (op-reth)"
    echo "  ./scripts/run_firehose_op_geth_devnet.sh   (op-geth)"
  fi
  echo ""
  echo "Firehose serves once L2 reaches block 110, about 2 minutes after the devnet started. The test"
  echo "suite waits for it, so start it right after the EL."
  echo ""
  # op-node gives up when the Engine API is not reachable at startup, so it is only started once
  # the Firehose EL answers. There is no time limit: start the EL whenever you are ready.
  wait_for_local_el_authrpc

  echo "Firehose EL is up, launching local op-node (peer: $op_node_peer)"
  echo ""

  "$op_node" \
    --l1="$l1_rpc_url" \
    --l1.beacon="$l1_beacon_rpc_url" \
    --l2="$local_el_authrpc_url"  \
    --l2.engine-rpc-timeout=900s \
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
    # No `cd`: this runs in the main shell, and builder-playground deletes and recreates this
    # directory, which would leave everything started afterwards in a deleted working directory.
    docker compose -f "$op_stack_path/docker-compose.yaml" down
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

# The sequencer op-node logs its peer ID once its p2p host is up, which is what the local op-node
# needs to peer with it.
wait_for_chain_op_node() {
  wait_for_chain_op_node_peer_id "$@"
}

wait_for_chain_op_node_peer_id() {
  docker_op_node_name="$1"

  echo "Waiting for OP node peer ID from ($docker_op_node_name)..."
  local attempts=0
  local max_attempts=30

  while [ $attempts -lt $max_attempts ]; do
    op_node_peer_id="$(extract_chain_op_node_peer_id "$docker_op_node_name")"

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

# The sequencer EL serves blocks on the `op-*-devnet` RPC url once op-node drives it.
wait_for_sequencer_el() {
  echo "Waiting for the sequencer $sequencer_el to produce block 1..."
  local attempts=0
  local max_attempts=60

  while [ $attempts -lt $max_attempts ]; do
    local number
    number="$(curl -s -X POST -H "Content-Type: application/json" \
      --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' "$l2_rpc_url" 2>/dev/null |
      jq -r '.result // empty' 2>/dev/null)"

    if [[ -n "$number" && "$((number))" -ge 1 ]]; then
      echo "Sequencer is at block $((number))"
      return 0
    fi

    sleep 1
    attempts=$((attempts + 1))
  done

  echo "Sequencer $sequencer_el did not produce block 1 after $max_attempts attempts"
  exit 1
}

# builder-playground publishes each port on the next free host port, while `hardhat.config.ts` and
# this script expect the sequencer EL RPC on 8547. It lands elsewhere when 8547 is taken, for
# instance by a previous devnet that is still shutting down.
check_sequencer_rpc_port() {
  local published
  published="$(docker port "$1" 8545/tcp | head -n 1)"
  if [[ "$published" != *":${l2_rpc_url##*:}" ]]; then
    echo "ERROR: $sequencer_el RPC is published on '$published' instead of $l2_rpc_url, which is already taken."
    echo "Stop whatever listens on it (a previous devnet still shutting down?) and start again."
    exit 1
  fi
}

extract_chain_op_node_peer_id() {
  echo "$(docker logs "$1" 2>&1 | grep "started p2p host" | cut -d ' ' -f 8- | sd 'peerID=' '')"
}

# The test account is funded straight on the sequencer EL, which is also where the suite sends
# its transactions.
fund_l2_address() {
  local pk="0x2a871d0798f97d79848a013d4936a73bf4cc922c825d33c1cf7073dff6d409c6"

  # It seems cast does not like being run from the project's root, it complains about not
  # finding the project root, probably a wrong heuristic on cast side think he is in a Forge
  # project. So run it from ROOT folder which is outside of root.
  pushd "$ROOT" &> /dev/null

  echo "Funding $address_to_fund with 1,000,000 ETH on L2..."
  local attempts=0
  until cast send --async --rpc-url="$l2_rpc_url" --private-key "$pk" --value 1000000ether "$address_to_fund" \
      --priority-gas-price=25000000000 --gas-price=250000000000 > /dev/null; do
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

wait_for_local_el_authrpc() {
  echo "Waiting for the Firehose EL Engine API at $local_el_authrpc_url..."
  # Any HTTP answer (401 without a JWT) means the Engine API is listening.
  until curl -s -o /dev/null --connect-timeout 1 "$local_el_authrpc_url"; do
    sleep 1
  done
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
  echo "usage: run_optimism_devnet.sh [-n]"
  echo ""
  echo "Runs a builder-playground Op Stack devnet (Jovian at genesis, Karst at block $karst_block,"
  echo "op-reth sequencer), funds the test account, then waits for a Firehose EL on :28551"
  echo "(run_firehose_op_reth_devnet.sh or run_firehose_op_geth_devnet.sh) and starts the local"
  echo "op-node that drives it."
  echo ""
  echo "Options"
  echo "    -n          No Karst: Jovian only with an op-geth sequencer, required by"
  echo "                run_firehose_op_geth_devnet.sh since op-geth cannot run Karst"
  echo "    -h          Display help about this script"
}

main "$@"