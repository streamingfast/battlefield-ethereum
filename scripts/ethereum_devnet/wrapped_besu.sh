#!/usr/bin/env bash

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

source "$PROJECT_ROOT/lib.sh"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting local Besu secondary client...${NC}"

# Check if besu binary is available
check_besu

# Check if playground is running
if ! docker ps --format '{{.Names}}' | grep -q '^chain-el-1$'; then
    echo -e "${RED}Error: Playground doesn't seem to be running. Please start it first with:${NC}"
    echo "  ./scripts/run_playground_devnet.sh"
    exit 1
fi

# Use playground genesis and configuration
playground_path="$PROJECT_ROOT/.playground/chain"
jwt_secret_file="$playground_path/jwtsecret"
data_dir="/tmp/besu-playground-data"

# Clean up any existing data
if [[ -d "$data_dir" ]]; then
    echo "Removing existing Besu data directory: $data_dir"
    rm -rf "$data_dir"
fi

mkdir -p "$data_dir"

# Wait for Reth to be ready
echo "Waiting for Reth to be ready..."
max_attempts=30
attempt=1
while [ $attempt -le $max_attempts ]; do
    if curl -s http://localhost:8545 -X POST -H "Content-Type: application/json" \
        --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' > /dev/null 2>&1; then
        break
    fi
    echo "Attempt $attempt/$max_attempts: Reth not ready yet..."
    sleep 2
    attempt=$((attempt + 1))
done

if [ $attempt -gt $max_attempts ]; then
    echo -e "${RED}Error: Reth didn't become ready within expected time${NC}"
    exit 1
fi

echo -e "${GREEN}Reth is ready!${NC}"

# Get Reth enode for peer connection (similar to geth script)
echo "Getting Reth enode for peer connection..."
RETH_ENODE=$(curl -s http://localhost:8545 -X POST -H "Content-Type: application/json" \
    --data '{"jsonrpc":"2.0","method":"admin_nodeInfo","params":[],"id":1}' | \
    jq -r '.result.enode' 2>/dev/null)

if [ -z "$RETH_ENODE" ] || [ "$RETH_ENODE" = "null" ]; then
    echo -e "${RED}Error: Could not get Reth enode${NC}"
    exit 1
fi

echo "Reth enode: $RETH_ENODE"

# Fix the enode to use localhost since Reth's P2P port is mapped to localhost:30303
RETH_ENODE=$(echo "$RETH_ENODE" | sed 's/@[^@]*:/@127.0.0.1:/')
echo "Fixed Reth enode: $RETH_ENODE"

# Create static-nodes.json for Besu if it supports it
STATIC_NODES_FILE="$data_dir/static-nodes.json"
echo "[\"$RETH_ENODE\"]" > "$STATIC_NODES_FILE"
echo "Created static-nodes.json: $STATIC_NODES_FILE"

# Build besu command - similar to the firehose besu script but as secondary client
besu_extra_args=(
    "--host-allowlist=*"
    "--data-path=$data_dir"
    "--genesis-file=$playground_path/genesis.json"
    "--rpc-http-cors-origins=all"
    "--rpc-http-api=ETH,NET,WEB3,ENGINE,DEBUG,ADMIN"
    "--rpc-http-enabled"
    "--rpc-http-port=8547"  # Secondary EL port (matching geth's port)
    "--rpc-http-host=127.0.0.1"
    "--rpc-ws-enabled"
    "--rpc-ws-host=127.0.0.1"
    "--rpc-ws-port=8548"
    "--engine-rpc-enabled"
    "--engine-host-allowlist=*"
    "--engine-rpc-port=8552"  # Engine API port (matching geth's authrpc port)
    "--engine-jwt-secret=$jwt_secret_file"
    "--logging=INFO"
    "--miner-enabled=false"  # Don't mine, just sync
    "--bootnodes=$RETH_ENODE"  # Try to connect to Reth as bootnode
    "--p2p-port=30306"  # Use different P2P port than geth
)

# Add firehose tracing if available
if command -v fireeth &> /dev/null; then
    echo "Firehose available, enabling tracing"
    # For local besu, we'll run it directly instead of through fireeth
    # since fireeth is for streaming data, not for running a client
else
    echo "Firehose not available, running Besu without tracing"
fi

echo -e "${YELLOW}Static node enode: $RETH_ENODE${NC}"
echo -e "${YELLOW}Starting local Besu with command:${NC}"
echo "besu ${besu_extra_args[*]}"
echo ""

# Start besu
exec "besu" "${besu_extra_args[@]}"
