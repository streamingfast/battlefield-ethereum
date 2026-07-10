#!/usr/bin/env bash
# Launches fireeth wrapping a Firehose-instrumented `world-chain` EL that follows the
# World Chain devnet started by `scripts/world_chain/run_world_chain_devnet.sh`.
#
# The follower kona-node container (started by the devnet script) drives this EL over the
# Engine API on authrpc :28551, so every canonical block flows through the Firehose tracer.
#
# The `world-chain` binary must come from the StreamingFast fork (streamingfast/world-chain,
# branch release/v2.x-fh) — the tracer is always-on in that build, there is no --vmtrace flag.

set -e

ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
source "$ROOT/lib.sh"

state_dir="$ROOT/world_chain/.devnet"
db_path="$ROOT/world_chain/data"

main() {
  check_world_chain

  if [[ ! -f "$state_dir/workdir" ]]; then
    echo "World Chain devnet state not found ($state_dir/workdir missing)."
    echo "Start the devnet first: ./scripts/world_chain/run_world_chain_devnet.sh"
    exit 1
  fi
  workdir="$(cat "$state_dir/workdir")"
  if [[ ! -f "$workdir/genesis.json" ]]; then
    echo "L2 genesis not found at $workdir/genesis.json — is the devnet still running?"
    exit 1
  fi
  check_docker "battlefield-world-chain-kona"

  rm -rf "$db_path" "$firehose_data_dir"

  echo "Initializing world-chain with L2 genesis"
  "$world_chain" init --datadir "$db_path" --chain "$workdir/genesis.json"

  trap 'kill $(jobs -p) 2>/dev/null' EXIT

  verbosity="-v"
  if [[ "$DEBUG" == "true" ]]; then
    verbosity="-vvv"
  elif [[ "$TRACE" == "true" ]]; then
    verbosity="-vvvv"
  fi

  world_chain_args_parts=(
    "node"
    "--datadir=\"$db_path\""
    "--chain=\"$workdir/genesis.json\""
    "$verbosity"
    "--http"
    "--http.corsdomain=\"*\""
    "--http.addr=0.0.0.0"
    "--http.port=28545"
    "--http.api=\"web3,debug,eth,txpool,net,admin\""
    "--ws"
    "--ws.addr=0.0.0.0"
    "--ws.port=28546"
    "--ws.origins=\"*\""
    "--ws.api=\"debug,eth,txpool,net\""
    "--authrpc.addr=0.0.0.0"
    "--authrpc.port=28551"
    "--authrpc.jwtsecret=\"$workdir/jwt.hex\""
    "--port=20303"
    "--disable-discovery"
    "--metrics=0.0.0.0:16061"
    "--engine.persistence-threshold=0"
    "--engine.memory-block-buffer-target=0"
    # NOTE: like firehose-instrumented op-reth, the SF world-chain build initializes the
    # Firehose tracer unconditionally in `main` — there is no `--vmtrace` flag. PBH args are
    # left at their defaults (zero addresses), matching the devnet where PBH is disabled.
  )
  # Sequencer EL enodes (written by the devnet script): needed so this EL can backfill
  # block bodies over devp2p — the follower kona-node only feeds it unsafe tips.
  if [[ -s "$state_dir/el-trusted-peers" ]]; then
    world_chain_args_parts+=("--trusted-peers=$(cat "$state_dir/el-trusted-peers")")
  fi

  world_chain_args="${world_chain_args_parts[*]}"

  # First streamable block is 1, not 0: like op-reth, world-chain's genesis (block 0) is
  # written by `world-chain init` and never flows through the engine API, so the Firehose
  # stream starts at block 1. See run_firehose_op_reth_devnet.sh for the full explanation.
  run_fireeth ${WORLD_CHAIN_FIRST_BLOCK:-1} "$world_chain" "$world_chain_args"
}

main "$@"
