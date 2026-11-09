#!/usr/bin/env bash
# Launches a World Chain devnet (streamingfast/world-chain native devnet: Anvil L1,
# op-deployer artifacts, kona-node sequencer(s), world-chain EL(s), op-batcher/proposer)
# plus an extra follower kona-node container that will drive the Firehose-instrumented
# `world-chain` EL you launch afterwards with `run_firehose_world_chain_devnet.sh`.
#
# Requirements:
# - streamingfast/world-chain checkout (branch release/v2.x-fh) at $WORLD_CHAIN_REPO
#   (default: ../world-chain next to this repo), with rustc 1.95+ and `just` installed
# - docker, jq, cast (Foundry), forge on PATH (the devnet deploys its proof system with forge)
# - protoc with the well-known types (Debian: protobuf-compiler and libprotobuf-dev), a
#   world-chain dependency compiles .proto files
#
# Usage: ./run_world_chain_devnet.sh
# Cleanup is automatic on exit (tears down the devnet and the follower kona-node).
#
# Env:
# - WORLD_CHAIN_DEVNET_TIMEOUT_SECS: how long the devnet gets to write its endpoints file
#   (default 1200). A first boot pulls large images (SP1 is ~7 GB) and deploys the proof system.

set -e

ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." && pwd )"
source "$ROOT/lib.sh"

world_chain_repo="${WORLD_CHAIN_REPO:-$ROOT/../../world-chain}"
follower_container="battlefield-world-chain-kona"
state_dir="$ROOT/world_chain/.devnet"
endpoints_file="$world_chain_repo/target/devnet/endpoints.json"

# Must match the world-chain devnet constants (crates/devnet/src/full_stack.rs).
dev_chain_id="2151908"
l1_slot_duration_secs="2"
# Standard anvil/test-mnemonic account 0 — pre-funded on L2 by op-deployer's fundDevAccounts.
dev_prefunded_pk="0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"

main() {
  check_binaries
  mkdir -p "$state_dir"

  trap cleanup EXIT

  # The dev profile's debug info pushes the world-chain binary past the 4 GiB linker limit on
  # Linux. Upstream CI builds without it too.
  export CARGO_PROFILE_DEV_DEBUG="${CARGO_PROFILE_DEV_DEBUG:-0}"

  echo "Starting World Chain devnet (this builds world-chain and pulls OP-stack images on first run)..."
  pushd "$world_chain_repo" > /dev/null
    rm -f "$endpoints_file"
    # Prebuild so the detached `devnet up -d` starts immediately instead of spending its
    # startup window inside cargo (first build can take a long while).
    cargo build -p world-chain -p xtask
    just devnet up -d
  popd > /dev/null

  wait_for_endpoints_file "${WORLD_CHAIN_DEVNET_TIMEOUT_SECS:-1200}"

  sequencer_rpc="$(jq -r '.primary.sequencer_rpc_url' "$endpoints_file")"
  l1_rpc="$(jq -r '.primary.l1_rpc_url' "$endpoints_file")"
  echo "Sequencer RPC: $sequencer_rpc"
  echo "L1 RPC:        $l1_rpc"

  wait_rpc_block_at_least "$sequencer_rpc" 1 120

  # The op-deployer artifacts (genesis.json, rollup.json, l1-genesis.json, jwt.hex) live in
  # a tempdir created by the devnet harness with a fixed prefix.
  workdir="$(find_op_workdir)"
  echo "OP artifacts:  $workdir"
  echo "$workdir" > "$state_dir/workdir"
  echo "$sequencer_rpc" > "$state_dir/rpc-url"

  echo "Funding battlefield test account $address_to_fund on L2..."
  retry 30 cast send --rpc-url "$sequencer_rpc" --private-key "$dev_prefunded_pk" \
    --value 1000ether "$address_to_fund" > /dev/null

  collect_el_trusted_peers

  echo "Starting follower kona-node (drives the Firehose world-chain EL on authrpc :28551)..."
  start_follower_kona_node

  echo ""
  echo "World Chain devnet is ready."
  echo ""
  echo "- Sequencer RPC: $sequencer_rpc (also written to scripts/world_chain/.devnet/rpc-url)"
  echo "- Now run './scripts/run_firehose_world_chain_devnet.sh' in another terminal"
  echo "- Then run 'pnpm test:fh3.0:world-chain-devnet' in a third terminal"
  echo ""
  echo "Press Ctrl+C to tear everything down."

  while true; do sleep 3600; done
}

check_binaries() {
  for bin in just docker jq cast forge; do
    if ! command -v "$bin" &> /dev/null; then
      echo "The '$bin' binary could not be found, it is required to run the World Chain devnet"
      exit 1
    fi
  done

  if ! protoc_has_well_known_types; then
    echo "protoc with the well-known types (google/protobuf/*.proto) is required to build world-chain"
    echo "Install it with 'apt-get install protobuf-compiler libprotobuf-dev' or 'brew install protobuf'"
    exit 1
  fi

  if [[ ! -d "$world_chain_repo" ]]; then
    echo "World Chain repository not found at '$world_chain_repo'"
    echo "Clone it with: git clone -b release/v2.x-fh https://github.com/streamingfast/world-chain.git"
    echo "or point the WORLD_CHAIN_REPO environment variable to your checkout."
    exit 1
  fi

  # The devnet deploys its proof-system contracts with forge; pkg/contracts needs its
  # submodule libraries (openzeppelin, forge-std, ...), including the ones nested in the optimism
  # submodule, or the deploy fails mid-startup.
  if [[ ! -f "$world_chain_repo/pkg/contracts/lib/openzeppelin-contracts/README.md" || \
        ! -f "$world_chain_repo/pkg/contracts/lib/optimism/packages/contracts-bedrock/lib/solady/src/utils/LibClone.sol" ]]; then
    echo "pkg/contracts submodules are not initialized in $world_chain_repo"
    echo "Run: git -C '$world_chain_repo' submodule update --init --recursive"
    exit 1
  fi
}

find_op_workdir() {
  # macOS $TMPDIR and Linux /tmp; newest matching dir that has the artifacts wins.
  # Plain glob + stat (no `ls`) so shell aliases/colors can't pollute the path.
  local newest="" newest_mtime=0 d mtime
  for d in "${TMPDIR:-/tmp}"/world-devnet-op-* /tmp/world-devnet-op-*; do
    [[ -f "$d/rollup.json" ]] || continue
    # GNU stat first: on Linux `stat -f` prints the file system status to stdout before failing.
    mtime="$(stat -c %Y "$d" 2>/dev/null || stat -f %m "$d")"
    if (( mtime > newest_mtime )); then
      newest="$d"
      newest_mtime="$mtime"
    fi
  done
  if [[ -z "$newest" ]]; then
    echo "Could not locate the world-devnet-op-* artifacts tempdir (rollup.json missing)" >&2
    exit 1
  fi
  echo "$newest"
}

collect_el_trusted_peers() {
  # The firehose world-chain EL needs devp2p peers to backfill block bodies (the follower
  # kona-node only feeds it unsafe tips over the Engine API; without EL peers it can never
  # sync blocks it missed). All sequencer ELs run with the admin API enabled.
  local urls enode peers=""
  urls="$(jq -r '.components[] | select(.kind == "world-chain-execution-node") | .endpoints[] | select(.name == "rpc") | .url' "$endpoints_file")"
  for url in $urls; do
    enode="$(curl -s -X POST -H 'Content-Type: application/json' \
      --data '{"jsonrpc":"2.0","method":"admin_nodeInfo","params":[],"id":1}' "$url" \
      | jq -r '.result.enode // empty')"
    [[ -n "$enode" ]] && peers="${peers:+$peers,}$enode"
  done
  if [[ -z "$peers" ]]; then
    echo "WARNING: could not discover sequencer EL enodes; the firehose EL will not be able to backfill blocks"
    return 0
  fi
  echo "$peers" > "$state_dir/el-trusted-peers"
  echo "Sequencer EL trusted peers written to $state_dir/el-trusted-peers"
}

start_follower_kona_node() {
  docker rm -f "$follower_container" > /dev/null 2>&1 || true

  # Same image the world-chain devnet uses (crates/devnet/src/op_stack.rs)
  local kona_image="us-docker.pkg.dev/oplabs-tools-artifacts/images/kona-node:v1.6.1"

  # kona-node bootnodes are enode:// URLs (devp2p style, see the devnet's
  # devnet_trusted_peer). Build the sequencer kona-node's enode from its p2p key file
  # (op-node-0-p2p-priv.txt in the artifacts dir) and its advertised host port.
  local seq_p2p bootnode_args=()
  seq_p2p="$(jq -r '[.components[] | select(.id == "op-node-0") | .endpoints[] | select(.name == "p2p") | .url][0] // empty' "$endpoints_file")"
  if [[ -n "$seq_p2p" && -f "$workdir/op-node-0-p2p-priv.txt" ]]; then
    local pk pub
    pk="$(tr -d '[:space:]' < "$workdir/op-node-0-p2p-priv.txt")"
    pub="$(cast wallet public-key --raw-private-key "0x$pk" | sed 's/^0x//')"
    bootnode_args=(--p2p.bootnodes "enode://${pub}@${seq_p2p}")
    echo "Follower kona-node bootnode: enode://${pub:0:16}...@${seq_p2p}"
  else
    echo "WARNING: could not build sequencer kona-node enode; follower will rely on L1 derivation only (slower)"
  fi

  local l1_rpc_docker="${l1_rpc/127.0.0.1/host.docker.internal}"
  l1_rpc_docker="${l1_rpc_docker/localhost/host.docker.internal}"

  # kona-node exits fatally when the EL's Engine API is not reachable at startup
  # ("Failed to exchange capabilities with engine"), and the firehose world-chain EL is
  # only started later by run_firehose_world_chain_devnet.sh — so let docker keep
  # restarting the follower until the EL is up.
  docker run -d --name "$follower_container" \
    --restart unless-stopped \
    --add-host host.docker.internal:host-gateway \
    -v "$workdir":/work \
    -p 29545:9545 \
    -p 29222:9222 \
    --entrypoint kona-node \
    "$kona_image" \
    -vvv --logs.stdout.format=logfmt \
    node \
    --chain "$dev_chain_id" \
    --l2-config-file /work/rollup.json \
    --l1-config-file /work/l1-genesis.json \
    --l1-eth-rpc "$l1_rpc_docker" \
    --l1-beacon "$l1_rpc_docker" \
    --l1-slot-duration-override "$l1_slot_duration_secs" \
    --l1-trust-rpc \
    --l2-engine-rpc http://host.docker.internal:28551 \
    --l2-engine-jwt-secret /work/jwt.hex \
    --l2-trust-rpc \
    --p2p.listen.ip 0.0.0.0 \
    --p2p.listen.tcp 9222 \
    --p2p.listen.udp 9222 \
    --p2p.advertise.ip host.docker.internal \
    --p2p.advertise.tcp 29222 \
    --p2p.advertise.udp 29222 \
    --p2p.no-discovery \
    --p2p.bootstore /work/kona-bootstore-battlefield \
    "${bootnode_args[@]}" \
    --rpc.addr 0.0.0.0 \
    --rpc.enable-admin \
    --port 9545 > /dev/null

  echo "Follower kona-node started (container $follower_container, RPC on localhost:29545)"
}

protoc_has_well_known_types() {
  command -v protoc &> /dev/null || return 1

  local dir
  dir="$(mktemp -d)"
  echo 'syntax = "proto3"; import "google/protobuf/empty.proto";' > "$dir/check.proto"
  protoc -I "$dir" --descriptor_set_out=/dev/null "$dir/check.proto" &> /dev/null
  local exit_code=$?
  rm -rf "$dir"
  return $exit_code
}

# The devnet runs detached and logs to target/devnet/logs/devnet.log, so progress is taken from
# there. Its stderr is discarded, so when it dies the reason is not in that log.
wait_for_endpoints_file() {
  local timeout="$1"
  local devnet_log="$world_chain_repo/target/devnet/logs/devnet.log"
  local pid_file="$world_chain_repo/target/devnet/devnet.pid"
  local deadline=$((SECONDS + timeout)) next_progress=$((SECONDS + 60))

  echo "Waiting up to ${timeout}s for the devnet endpoints file (first boot pulls several OP-stack images)..."
  until [[ -s "$endpoints_file" ]]; do
    if [[ ! -s "$pid_file" ]] || ! kill -0 "$(cat "$pid_file")" 2> /dev/null; then
      echo "The devnet process exited before writing $endpoints_file. Last lines of $devnet_log:"
      tail -n 15 "$devnet_log" 2> /dev/null
      echo ""
      echo "'just devnet up -d' discards the devnet's error output. To see why it stopped, run it in"
      echo "the foreground: (cd '$world_chain_repo' && cargo run -p xtask -- devnet up)"
      exit 1
    fi

    if (( SECONDS >= deadline )); then
      echo "The devnet did not write $endpoints_file within ${timeout}s (WORLD_CHAIN_DEVNET_TIMEOUT_SECS)."
      echo "Last lines of $devnet_log:"
      tail -n 30 "$devnet_log" 2> /dev/null
      exit 1
    fi

    if (( SECONDS >= next_progress )); then
      echo "Still waiting for the devnet ($((timeout - (deadline - SECONDS)))s): $(tail -n 1 "$devnet_log" 2> /dev/null | cut -c1-200)"
      next_progress=$((SECONDS + 60))
    fi

    sleep 1
  done
}

# usage: retry <attempts> <command...>
# Runs the command once per second until it succeeds, printing its output from the last attempt
# when it never does.
retry() {
  local attempts="$1"; shift
  local i output
  for ((i=1; i<=attempts; i++)); do
    if output="$("$@" 2>&1)"; then return 0; fi
    sleep 1
  done
  echo "Command failed after $attempts attempts: $*" >&2
  echo "$output" >&2
  return 1
}

cleanup() {
  echo ""
  echo "Tearing down World Chain devnet..."
  docker rm -f "$follower_container" > /dev/null 2>&1 || true
  pushd "$world_chain_repo" > /dev/null
    just devnet down || true
  popd > /dev/null
}

main "$@"
