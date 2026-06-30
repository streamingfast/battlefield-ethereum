#!/usr/bin/env bash

set -e

PARENT_PID=$$
ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
source "$ROOT/lib.sh"

main() {
  check_fireeth
  check_nitro

  data_dir="$(mktemp -d)"
  # We do NOT use Nitro's '--dev' shortcut: it *replaces* every other CLI argument
  # with a fixed list (see confighelpers.devFlagArgs / BeginCommonParse), which drops
  # '--node.firehose' and funds a hard-coded address instead of ours. Instead we spell
  # out the equivalent standalone L2 dev-chain flags ourselves and add Firehose + our
  # funding address. '--init.dev-init' funds '--init.dev-init-address' with 1000 ETH.
  nitro_args=(
    "--init.dev-init"
    "--init.dev-init-address=$address_to_fund"
    "--init.empty=false"
    "--node.dangerous.no-l1-listener"
    "--node.parent-chain-reader.enable=false"
    "--parent-chain.id=1337"
    "--chain.id=412346"
    "--node.sequencer"
    "--execution.sequencer.enable"
    "--node.dangerous.no-sequencer-coordinator"
    "--node.staker.enable=false"
    "--execution.vmtrace.tracer-name=firehose"
    # ArbOS inflates gas accounting heavily (simple transfer ~1.3M, heavy calls ~60M), so the
    # battlefield uses a large fixed gas limit. Disable the RPC per-tx fee cap (default 1 ETH)
    # and the eth_call/estimateGas gas cap (default 50M) so those large limits — and the tests
    # that pair them with an explicit gas price — are accepted on this dev node.
    "--execution.rpc.tx-fee-cap=0"
    "--execution.rpc.gas-cap=0"
    "--persistent.chain=$data_dir"
    "--http.addr=0.0.0.0"
    "--http.port=8547"
    "--http.api=net,web3,eth,arb"
    "--http.corsdomain=*"
    "--http.vhosts=*"
  )

  echo "Running Nitro standalone L2 dev node with Firehose tracer activated via 'fireeth'"
  echo "Address to fund: $address_to_fund"
  echo "JSON-RPC: http://127.0.0.1:8547"
  echo "Nitro Binary: $nitro"
  echo "Nitro Version: $($nitro --version)"
  echo "Nitro Data Directory: $data_dir"
  echo ""

  run_fireeth 1 "$nitro" "${nitro_args[*]}"
}

usage() {
  echo "Usage: $0"
  echo ""
  echo "Runs Nitro --dev chain with Firehose tracer activated."
}

main "$@"
