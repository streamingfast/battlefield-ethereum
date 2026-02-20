#!/usr/bin/env bash

set -e

ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BATTLEFIELD_DIR="$(cd "$ROOT/.." && pwd)"

MONAD_BUILD_DIR="${MONAD_BUILD_DIR:-/data/monad-extended/build/monad-bft}"
MONAD_DOCKER_DIR="$MONAD_BUILD_DIR/docker/single-node"
MONAD_EXECUTION_IMAGE="${MONAD_EXECUTION_IMAGE:-ghcr.io/streamingfast/monad-execution:73ef8ec}"
MONAD_NODE_IMAGE="${MONAD_NODE_IMAGE:-ghcr.io/streamingfast/monad-node:eede85a}"
MONAD_RPC_IMAGE="${MONAD_RPC_IMAGE:-ghcr.io/streamingfast/monad-rpc:eede85a}"
MONAD_TIMESTAMP_DIR=""

setup_monad_infrastructure() {

    cd "$MONAD_DOCKER_DIR/logs"

    set +e
    ../nets/run.sh
    set -e

    LATEST_DIR=$(ls -td 2* 2>/dev/null | head -1)
    if [[ -z "$LATEST_DIR" ]]; then
        echo "ERROR: No timestamped directory found"
        exit 1
    fi
    echo "Using directory: $LATEST_DIR"
    cd "$LATEST_DIR"
    MONAD_TIMESTAMP_DIR="$PWD"

    echo "Creating compose.prebuilt.yaml..."
    cat > compose.prebuilt.yaml << EOF
services:
  build_triedb:
    image: $MONAD_EXECUTION_IMAGE
  build_genesis:
    image: $MONAD_EXECUTION_IMAGE
  monad_execution:
    image: $MONAD_EXECUTION_IMAGE
  monad_node:
    image: $MONAD_NODE_IMAGE
  monad_rpc:
    image: $MONAD_RPC_IMAGE
EOF

    echo "Applying compose.yaml fixes..."
    sed -i.bak 's/monad_mpt/monad-mpt/g' compose.yaml 2>/dev/null || sed -i '' 's/monad_mpt/monad-mpt/g' compose.yaml
    sed -i.bak 's/"8080:8080"/"18080:8080"/g' compose.yaml 2>/dev/null || sed -i '' 's/"8080:8080"/"18080:8080"/g' compose.yaml

    if ! grep -q "persisted-peers-path" compose.yaml 2>/dev/null; then
        sed -i.bak '/--triedb-path \/monad\/triedb/a\      --persisted-peers-path /monad/peers' compose.yaml 2>/dev/null || \
        sed -i '' '/--triedb-path \/monad\/triedb/a\
      --persisted-peers-path /monad/peers
' compose.yaml
    fi

    if [[ -f "node/config/node.toml" ]]; then
        echo "Configuring node.toml..."

        if ! grep -q "ping_rate_limit_per_second = 10" node/config/node.toml 2>/dev/null; then
            sed -i.bak '/\[peer_discovery\]/a\ping_rate_limit_per_second = 10' node/config/node.toml 2>/dev/null || \
            sed -i '' '/\[peer_discovery\]/a\
ping_rate_limit_per_second = 10
' node/config/node.toml
        fi

        if ! grep -q "init_peers = \[\]" node/config/node.toml 2>/dev/null; then
            sed -i.bak '/\[statesync\]/,/^$/ s/^peers = \[\]/init_peers = []\nexpand_to_group = false/' node/config/node.toml 2>/dev/null || \
            sed -i '' '/\[statesync\]/,/^$/ s/^peers = \[\]/init_peers = []\
expand_to_group = false/' node/config/node.toml
        fi
    fi

    echo "Setting up triedb (8GB)..."
    if [[ -f "node/triedb/test.db" ]]; then
        rm -f node/triedb/test.db
    fi
    truncate -s 8GB node/triedb/test.db

    echo "Stopping existing Monad containers..."
    docker-compose -f compose.yaml -f compose.prebuilt.yaml down 2>/dev/null || true

    echo "Starting Monad services..."
    export MONAD_BFT_ROOT="$MONAD_BUILD_DIR"
    export DEVNET_DIR="$MONAD_BUILD_DIR/docker/devnet"
    export RPC_DIR="$MONAD_BUILD_DIR/docker/rpc"
    docker-compose -f compose.yaml -f compose.prebuilt.yaml up -d

    echo "Waiting for Monad to initialize..."
    sleep 10

    echo "Monad infrastructure ready!"
}

setup_firehose_infrastructure() {
    cd "$BATTLEFIELD_DIR"

    echo "Cleaning Firehose data..."
    sudo rm -rf localnet-firehose-data/* 2>/dev/null || true

    echo "Stopping existing Firehose containers..."
    docker-compose -f docker-compose.localnet-firehose.yml down 2>/dev/null || true

    echo "Starting Firehose containers..."
    docker-compose -f docker-compose.localnet-firehose.yml up -d

    echo "Waiting for Firehose to initialize..."
    sleep 5

    echo "Firehose infrastructure ready!"
}

cleanup() {
    echo "Cleaning up..."

    cd "$BATTLEFIELD_DIR"
    echo "Stopping Firehose containers..."
    docker-compose -f docker-compose.localnet-firehose.yml down 2>/dev/null || true

    if [[ -n "$MONAD_TIMESTAMP_DIR" ]] && [[ -d "$MONAD_TIMESTAMP_DIR" ]]; then
        cd "$MONAD_TIMESTAMP_DIR"
        echo "Stopping Monad containers..."
        docker-compose -f compose.yaml -f compose.prebuilt.yaml down 2>/dev/null || true
    fi

    echo "Cleanup complete"
}

trap cleanup EXIT

main() {
    setup_monad_infrastructure
    setup_firehose_infrastructure

    cd "$BATTLEFIELD_DIR"

    export FIREHOSE_ENDPOINT=localhost:20028
    export FIREHOSE_GRPC_ENDPOINT=http://localhost:20028
    export SNAPSHOTS_TAG=fh3.0/monad-dev

    pnpm hardhat test --network monad-dev "$@"
}

main "$@"
