#!/usr/bin/env bash

set -e

PARENT_PID=$$
ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

source "$ROOT/lib.sh"

monad_tracer="${MONAD_TRACER_BINARY:-monad-firehose-tracer}"

main() {
    firehose_version=${FIREHOSE_VERSION:-"3.0"}

    if [[ "$firehose_version" != "3.0" ]]; then
        echo "Unsupported Firehose version: $firehose_version (Monad only supports 3.0)"
        exit 1
    fi

    if [[ -n "$USE_EXISTING_FIREHOSE" ]]; then
        echo "=========================================="
        echo "Using existing Firehose endpoint"
        echo "=========================================="
        echo ""
        echo "Skipping tracer launch - tests will connect to existing Firehose at:"
        echo "  Endpoint: ${FIREHOSE_ENDPOINT:-localhost:8089}"
        echo ""
        echo "Make sure your monad-extended setup is running with:"
        echo "  - Monad node with event ring enabled"
        echo "  - monad-firehose-tracer producing extended blocks"
        echo "  - fireeth serving gRPC on the expected port"
        echo ""
        echo "Battlefield tests will use:"
        echo "  - RPC endpoint: ${MONAD_RPC_ENDPOINT:-http://127.0.0.1:8545} (for sending transactions)"
        echo "  - Firehose endpoint: ${FIREHOSE_ENDPOINT:-localhost:8089} (for block validation)"
        echo ""

        while true; do
            sleep 3600
        done
    fi

    chain_id="${MONAD_CHAIN_ID:-1337}"
    network_name="${MONAD_NETWORK_NAME:-monad-devnet}"
    event_ring_path="${MONAD_EVENT_RING_PATH:-/var/run/monad/exec-events}"
    rpc_endpoint="${MONAD_RPC_ENDPOINT:-http://127.0.0.1:8545}"

    address_to_fund="${ADDRESS_TO_FUND:-0x821b55d8abe79bc98f05eb675fdc50dfe796b7ab}"

    echo "Running Monad Firehose Tracer"
    echo "Address to fund: $address_to_fund"
    echo "Monad Tracer Binary: $monad_tracer"
    echo "Monad Tracer Version: $($monad_tracer --version 2>/dev/null || echo 'unknown')"
    echo "Chain ID: $chain_id"
    echo "Network Name: $network_name"
    echo "Event Ring Path: $event_ring_path"
    echo "RPC Endpoint: $rpc_endpoint"
    echo "Firehose version: $firehose_version"
    echo ""

    if [[ ! -e "$event_ring_path" ]]; then
        echo "WARNING: Event ring not found at $event_ring_path"
        echo "Make sure Monad node is running with event ring enabled"
        echo ""
        echo "You can customize the path with MONAD_EVENT_RING_PATH environment variable"
        echo ""
        sleep 2
    fi

    exec "$monad_tracer" \
        --chain-id "$chain_id" \
        --network-name "$network_name" \
        --event-ring "$event_ring_path" \
        --rpc-endpoint "$rpc_endpoint"
}

main "$@"
