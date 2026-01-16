#!/usr/bin/env bash

set -e

PARENT_PID=$$
ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

source "$ROOT/lib.sh"

main() {
    firehose_version=${FIREHOSE_VERSION:-"3.0"}

    if [[ "$firehose_version" != "3.0" ]]; then
        echo "Unsupported Firehose version: $firehose_version (Monad only supports 3.0)"
        exit 1
    fi

    # Monad localnet/devnet configuration
    # This script connects to an existing Monad localnet instance
    chain_id="${MONAD_CHAIN_ID:-20143}"  # Monad localnet chain ID
    network_name="${MONAD_NETWORK_NAME:-monad-localnet}"
    event_ring_path="${MONAD_EVENT_RING_PATH:-/dev/hugepages/monad-localnet/monad-events}"
    rpc_endpoint="${MONAD_RPC_ENDPOINT:-http://127.0.0.1:18080}"  # Monad localnet RPC

    # Optional: Address to fund for testing (battlefield default test account)
    address_to_fund="${ADDRESS_TO_FUND:-0x821b55d8abe79bc98f05eb675fdc50dfe796b7ab}"

    echo "=========================================="
    echo "Monad Localnet Firehose Tracer"
    echo "=========================================="
    echo ""
    echo "This tracer connects to an existing Monad localnet instance."
    echo ""
    echo "Prerequisites:"
    echo "  - Monad localnet running (via docker-compose or native)"
    echo "  - Event ring enabled at: $event_ring_path"
    echo "  - RPC accessible at: $rpc_endpoint"
    echo ""
    echo "Configuration:"
    echo "  Chain ID: $chain_id"
    echo "  Network Name: $network_name"
    echo "  Event Ring Path: $event_ring_path"
    echo "  RPC Endpoint: $rpc_endpoint"
    echo "  Firehose version: $firehose_version"
    echo "  Address to fund: $address_to_fund"
    echo ""

    # Check if event ring exists
    if [[ ! -e "$event_ring_path" ]]; then
        echo "ERROR: Event ring not found at $event_ring_path"
        echo ""
        echo "Make sure Monad localnet is running with event ring enabled."
        echo ""
        echo "You can customize the path with MONAD_EVENT_RING_PATH environment variable."
        echo ""
        exit 1
    fi

    # Get monad-firehose-tracer binary
    monad_tracer="${MONAD_TRACER_BINARY:-monad-firehose-tracer}"
    if ! command -v "$monad_tracer" &> /dev/null; then
        echo "ERROR: monad-firehose-tracer binary not found in PATH"
        echo ""
        echo "Install it by:"
        echo "  cd ~/Documents/SF/evm-firehose-tracer-rs"
        echo "  cargo build --release -p monad"
        echo "  cp target/release/monad-firehose-tracer ~/.local/bin/"
        echo ""
        echo "Or set MONAD_TRACER_BINARY environment variable to point to the binary."
        exit 1
    fi

    echo "Monad Tracer Binary: $monad_tracer"
    echo "Monad Tracer Version: $($monad_tracer --version 2>/dev/null || echo 'unknown')"
    echo ""
    echo "Starting tracer..."
    echo ""

    # Run the tracer
    # Note: The tracer will output Firehose protocol messages to stdout
    # which will be consumed by fireeth
    exec "$monad_tracer" \
        --chain-id "$chain_id" \
        --network-name "$network_name" \
        --monad-event-ring-path "$event_ring_path" \
        --rpc-endpoint "$rpc_endpoint"
}

main "$@"
