#!/usr/bin/env bash

set -e

ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BATTLEFIELD_DIR="$(cd "$ROOT/.." && pwd)"

source "$ROOT/lib.sh"

main() {
    check_docker

    setup_monad_infrastructure
    setup_firehose_infrastructure

    cd "$BATTLEFIELD_DIR"

    export FIREHOSE_ENDPOINT=localhost:20028
    export FIREHOSE_GRPC_ENDPOINT=http://localhost:20028
    export SNAPSHOTS_TAG=fh3.0

    pnpm hardhat test --network monad-dev "$@"
}

usage() {
    echo "Usage: $0"
    echo ""
    echo "Runs Monad devnet with Firehose tracer activated for battlefield testing."
    echo ""
    echo "For setup instructions: scripts/monad-devnet/README.md"
    echo ""
}

setup_monad_infrastructure() {
    cd "$ROOT/monad-devnet" || {
        echo "ERROR: Failed to change to monad-devnet directory"
        exit 1
    }

    echo "Validating configuration files..."
    local required_files=(
        "compose.yaml"
        "compose.prebuilt.yaml"
        "node/config/node.toml"
        "node/config/forkpoint.toml"
        "node/config/validators.toml"
        "node/config/id-bls"
        "node/config/id-secp"
        "node/config/profile.json"
    )

    for file in "${required_files[@]}"; do
        if [[ ! -f "$file" ]]; then
            echo "ERROR: Required configuration file missing: $file"
            cat "$ROOT/monad-devnet/README.md"
            exit 1
        fi
    done

    export MONAD_BFT_ROOT="$ROOT/monad-devnet"
    export DEVNET_DIR="$ROOT/monad-devnet"
    export RPC_DIR="$ROOT/monad-devnet"

    echo "Preparing node directories..."
    mkdir -p node/ledger
    mkdir -p node/triedb
    touch node/ledger/wal

    if [[ ! -f node/triedb/test.db ]]; then
        truncate -s 8G node/triedb/test.db
    fi

    echo "Stopping existing Monad containers..."
    docker-compose -f compose.yaml -f compose.prebuilt.yaml down 2>/dev/null || true

    echo "Starting Monad containers..."
    docker-compose -f compose.yaml -f compose.prebuilt.yaml up -d || {
        echo "ERROR: Failed to start Monad containers"
        exit 1
    }

    echo "Waiting for Monad to initialize..."
    sleep 10

    wait_geth_up "http://127.0.0.1:18080" || {
        echo "ERROR: Monad RPC failed to start"
        exit 1
    }

    wait_event_ring || {
        echo "ERROR: Monad event ring not created"
        exit 1
    }

    MONAD_TIMESTAMP_DIR="$ROOT/monad-devnet"
}

setup_firehose_infrastructure() {
    cd "$BATTLEFIELD_DIR" || {
        echo "ERROR: Failed to change to battlefield directory"
        exit 1
    }

    if [[ ! -f scripts/monad-devnet/docker-compose.localnet-firehose.yml ]]; then
        echo "ERROR: Firehose compose file not found: scripts/monad-devnet/docker-compose.localnet-firehose.yml"
        cat "$ROOT/monad-devnet/README.md"
        exit 1
    fi

    echo "Stopping existing Firehose containers..."
    docker-compose -f scripts/monad-devnet/docker-compose.localnet-firehose.yml down 2>/dev/null || true

    echo "Cleaning Firehose data..."
    sudo rm -rf localnet-firehose-data/* 2>/dev/null || true
    sudo rm -rf localnet-substreams-data/* 2>/dev/null || true

    echo "Starting Firehose containers..."
    docker-compose -f scripts/monad-devnet/docker-compose.localnet-firehose.yml up -d || {
        echo "ERROR: Failed to start Firehose containers"
        exit 1
    }

    echo "Waiting for Firehose to process blocks..."
    sleep 20

    echo "Verifying Firehose containers are running..."
    if ! docker ps | grep -q "monad-localnet-extended-firehose"; then
        echo "ERROR: Firehose reader container not running"
        exit 1
    fi

    if ! docker ps | grep -q "monad-localnet-extended-firehose-api"; then
        echo "ERROR: Firehose API container not running"
        exit 1
    fi

    echo "Firehose infrastructure ready!"
}

wait_event_ring() {
    echo "Waiting for Monad event ring to be created..."
    for i in {1..30}; do
        if [[ -f /dev/hugepages/monad-localnet/monad-events ]]; then
            echo "Event ring detected!"
            return 0
        fi
        if [[ $i -eq 30 ]]; then
            echo "WARNING: Event ring not created after 30 seconds"
            return 1
        fi
        sleep 1
    done
}

cleanup() {
    echo "Cleaning up..."

    cd "$BATTLEFIELD_DIR"
    echo "Stopping Firehose containers..."
    docker-compose -f scripts/monad-devnet/docker-compose.localnet-firehose.yml down 2>/dev/null || true

    cd "$ROOT/monad-devnet"
    echo "Stopping Monad containers..."
    docker-compose -f compose.yaml -f compose.prebuilt.yaml down 2>/dev/null || true

    echo "Cleanup complete"
}

if [[ "$1" == "--help" ]] || [[ "$1" == "-h" ]]; then
    usage
    exit 0
fi

main "$@"
