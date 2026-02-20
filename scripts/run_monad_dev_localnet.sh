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

    cd "$BATTLEFIELD_DIR"
    echo "Stopping existing Firehose containers..."
    docker-compose -f docker-compose.localnet-firehose.yml down 2>/dev/null || true

    export MONAD_BFT_ROOT="$MONAD_BUILD_DIR"
    export DEVNET_DIR="$MONAD_BUILD_DIR/docker/devnet"
    export RPC_DIR="$MONAD_BUILD_DIR/docker/rpc"
    export MONAD_EXECUTION_ROOT="$MONAD_BUILD_DIR/monad-cxx/monad-execution"
    export HOST_GID=$(id -g)
    export HOST_UID=$(id -u)

    cd "$MONAD_DOCKER_DIR"

    cd logs
    for dir in 2*/; do
        if [[ -f "$dir/compose.yaml" ]]; then
            (cd "$dir" && docker-compose -f compose.yaml -f compose.prebuilt.yaml down 2>/dev/null) || true
        fi
    done
    cd ..

    set +e
    ./nets/run.sh 2>/dev/null
    set -e

    cd logs
    LATEST_DIR=$(ls -td 2* 2>/dev/null | head -1)
    if [[ -z "$LATEST_DIR" ]]; then
        exit 1
    fi

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
    sed -i.bak '/--triedb-path \/monad\/triedb/a\      --persisted-peers-path /monad/peers' compose.yaml 2>/dev/null || \
    sed -i '' '/--triedb-path \/monad\/triedb/a\
      --persisted-peers-path /monad/peers
' compose.yaml

    echo "Configuring node.toml..."
    sed -i.bak '/\[peer_discovery\]/a\ping_rate_limit_per_second = 10' node/config/node.toml 2>/dev/null || \
    sed -i '' '/\[peer_discovery\]/a\
ping_rate_limit_per_second = 10
' node/config/node.toml

    sed -i.bak '/\[statesync\]/,/^$/ s/^peers = \[\]/init_peers = []\nexpand_to_group = false/' node/config/node.toml 2>/dev/null || \
    sed -i '' '/\[statesync\]/,/^$/ s/^peers = \[\]/init_peers = []\
expand_to_group = false/' node/config/node.toml

    echo "Setting up triedb..."
    rm -f node/triedb/test.db
    truncate -s 8GB node/triedb/test.db

    echo "Copying known-good configs from monad-devnet..."
    cp "$ROOT/monad-devnet/node/node.toml" node/config/node.toml
    cp "$ROOT/monad-devnet/compose.yaml" compose.yaml

    docker-compose -f compose.yaml -f compose.prebuilt.yaml up -d

    echo "Waiting for Monad to initialize..."
    sleep 10

    echo "Waiting for Monad RPC to be ready..."
    for i in {1..30}; do
        if curl -s -X POST -H "Content-Type: application/json" --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' http://127.0.0.1:18080 > /dev/null 2>&1; then
            echo "Monad RPC is ready!"
            break
        fi
        if [[ $i -eq 30 ]]; then
            echo "ERROR: Monad RPC not responding after 30 seconds"
            exit 1
        fi
        sleep 1
    done

    echo "Waiting for Monad event ring to be created..."
    for i in {1..30}; do
        if [[ -f /dev/hugepages/monad-localnet/monad-events ]]; then
            echo "Event ring detected!"
            break
        fi
        if [[ $i -eq 30 ]]; then
            echo "WARNING: Event ring not created after 30 seconds"
        fi
        sleep 1
    done
}

setup_firehose_infrastructure() {
    cd "$BATTLEFIELD_DIR"

    echo "Stopping existing Firehose containers..."
    docker-compose -f docker-compose.localnet-firehose.yml down 2>/dev/null || true

    echo "Cleaning Firehose data..."
    sudo rm -rf localnet-firehose-data/* 2>/dev/null || true
    sudo rm -rf localnet-substreams-data/* 2>/dev/null || true

    echo "Starting Firehose containers..."
    docker-compose -f docker-compose.localnet-firehose.yml up -d

    echo "Waiting for Firehose to process blocks..."
    sleep 20

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
