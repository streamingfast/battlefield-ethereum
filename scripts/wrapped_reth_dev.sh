#!/usr/bin/env bash

set -e

PARENT_PID=$$
ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

source "$ROOT/lib.sh"

main() {
    data_dir="$(mktemp -d)"
    firehose_version=${FIREHOSE_VERSION:-"2.3"}
    fork_version=${FORK_VERSION:-"prague"}

    # Reth binary location - assumes it's in the reth-firehose-tracer project
    reth_binary="${RETH_BINARY:-$ROOT/../../reth-firehose-tracer/target/debug/reth-firehose-tracer}"

    if [[ ! -f "$reth_binary" ]]; then
        echo "Error: Reth binary not found at: $reth_binary"
        echo "Please build it first with: cd ~/Documents/SF/reth-firehose-tracer && cargo build"
        echo "Or set RETH_BINARY environment variable to the correct path"
        exit 1
    fi

    # Genesis file location
    genesis_file="$ROOT/reth_dev/genesis.$fork_version.json"

    if [[ ! -f "$genesis_file" ]]; then
        echo "Error: Genesis file not found at: $genesis_file"
        exit 1
    fi

    echo "Running local Reth --dev chain"
    echo "Address to fund: $address_to_fund"
    echo "Reth Binary: $reth_binary"
    echo "Reth Fork Version: $fork_version"
    echo "Reth Version: $($reth_binary --version)"
    echo "Data Directory: $data_dir"
    echo "Genesis File: $genesis_file"
    echo "Firehose version: $firehose_version"
    echo ""

    # Initialize Reth with the genesis file
    echo "Initializing Reth with genesis..."
    "$reth_binary" init --datadir="$data_dir" --chain="$genesis_file" 2>&1 | grep -v "^$"
    echo ""

    # Reth ExEx arguments for dev mode
    # The ExEx outputs FIRE blocks to stdout which fireeth captures
    reth_args=(
        "node"
        "--dev"
        "--dev.block-time=1s"
        "--datadir=$data_dir"
        "--chain=$genesis_file"
        "--http"
        "--http.api=debug,eth,web3,net"
        "--http.addr=0.0.0.0"
        "--http.port=8545"
    )

    echo "Command: $reth_binary ${reth_args[@]}"
    echo ""

    exec "$reth_binary" "${reth_args[@]}"
}

main "$@"
