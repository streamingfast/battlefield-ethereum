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

echo -e "${GREEN}Starting local Firehose Geth secondary client...${NC}"

# Check if geth binary is available
check_geth

# Check if playground is running
if ! docker ps --format '{{.Names}}' | grep -q '^chain-el-1$'; then
    echo -e "${RED}Error: Playground doesn't seem to be running. Please start it first with:${NC}"
    echo "  ./scripts/builder-playground/run_playground_devnet.sh"
    exit 1
fi

# Use playground genesis and configuration
playground_path="$PROJECT_ROOT/.playground/chain"
jwt_secret_file="$playground_path/jwtsecret"
data_dir="/tmp/geth-playground-data"
l1_beacon_rpc_url="http://localhost:3500"

# Clean up any existing data
if [[ -d "$data_dir" ]]; then
    echo "Removing existing Geth data directory: $data_dir"
    rm -rf "$data_dir"
fi

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

# Wait for Beacon to be ready
echo "Waiting for Beacon to be ready..."
max_attempts=30
attempt=1
while [ $attempt -le $max_attempts ]; do
    if curl -s --max-time 2 "$l1_beacon_rpc_url/eth/v1/node/version" > /dev/null 2>&1; then
        break
    fi
    echo "Attempt $attempt/$max_attempts: Beacon not ready yet..."
    sleep 2
    attempt=$((attempt + 1))
done

if [ $attempt -gt $max_attempts ]; then
    echo -e "${RED}Error: Beacon didn't become ready within expected time${NC}"
    exit 1
fi

echo -e "${GREEN}Beacon is ready!${NC}"

# Initialize Geth with playground genesis
"$geth" init --datadir="$data_dir" --state.scheme=hash "$playground_path/genesis.json"

# Get genesis block root for checkpoint
echo "Getting genesis block root for checkpoint..."
genesis_root=$(curl -sS "$l1_beacon_rpc_url/eth/v1/beacon/headers/0" 2>/dev/null | jq -r '.data.root' 2>/dev/null || echo "")

# Get Reth enode for bootnodes
echo "Getting Reth enode for peer connection..."
RETH_ENODE=$(curl -s http://localhost:8545 -X POST -H "Content-Type: application/json" \
    --data '{"jsonrpc":"2.0","method":"admin_nodeInfo","params":[],"id":1}' | \
    jq -r '.result.enode' 2>/dev/null)

if [ -z "$RETH_ENODE" ] || [ "$RETH_ENODE" = "null" ]; then
    echo -e "${RED}Error: Could not get Reth enode${NC}"
    exit 1
fi
RETH_ENODE=$(printf "$RETH_ENODE" | sed 's/@[^@]*:/@127.0.0.1:/')

echo "Reth enode: $RETH_ENODE"

# Build geth command
geth_extra_args=(
    "--datadir=$data_dir"
    "--http"
    "--http.addr=0.0.0.0"
    "--http.port=8547"
    "--http.api=engine,eth,net,web3,debug,admin"
    "--http.vhosts=*"
    "--authrpc.addr=0.0.0.0"
    "--authrpc.jwtsecret=$jwt_secret_file"
    "--authrpc.port=8552"
    "--authrpc.vhosts=*"
    "--syncmode=full"
    "--gcmode=archive"
    "--state.scheme=hash"
    "--networkid=1337"
    "--verbosity=4"
    "--nodiscover=true"
    "--port=30304"
)

if [[ -n "$genesis_root" && "$genesis_root" != "null" && "$genesis_root" != "0x0000000000000000000000000000000000000000000000000000000000000000" ]]; then
    geth_extra_args+=("--beacon.checkpoint=$genesis_root")
    echo "Using checkpoint: $genesis_root"
fi

# Add firehose tracing if available
# if "$geth" --help 2>/dev/null | grep -q -- '--vmtrace'; then
#     geth_extra_args+=("--vmtrace=firehose")
#     if "$geth" --help 2>/dev/null | grep -q -- '--vmtrace.jsonconfig'; then
#         geth_extra_args+=("--vmtrace.jsonconfig={\"applyBackwardCompatibility\":false}")
#     fi
# fi

# Function to add Reth peer manually
add_reth_peer() {
    echo "Waiting for Geth to be ready for peer addition..."
    local max_attempts=30
    local attempt=1

    while [ $attempt -le $max_attempts ]; do
        # Check if Geth RPC is responding
        if curl -s --max-time 2 http://localhost:8547 -X POST -H "Content-Type: application/json" \
            --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' > /dev/null 2>&1; then
            break
        fi
        echo "Attempt $attempt/$max_attempts: Waiting for Geth RPC..."
        sleep 2
        attempt=$((attempt + 1))
    done

    if [ $attempt -gt $max_attempts ]; then
        echo -e "${RED}Geth RPC not ready, skipping manual peer addition${NC}"
        return
    fi

    echo "Adding Reth peer manually: $RETH_ENODE"

    # Use RPC to add peer
    curl -s -X POST -H "Content-Type: application/json" --data "{\"jsonrpc\":\"2.0\",\"method\":\"admin_addPeer\",\"params\":[\"$RETH_ENODE\"],\"id\":1}" \
        http://localhost:8547 > /dev/null 2>&1 && echo "Peer added successfully" || echo -e "${YELLOW}Manual peer addition failed${NC}"
}

echo -e "${YELLOW}Starting local Geth with command:${NC}"
echo "$geth ${geth_extra_args[*]}"
echo ""

# Start geth in background and add peer
"$geth" "${geth_extra_args[@]}" &
GETH_PID=$!

# Give Geth a moment to start
sleep 5

# Try to add peer manually
add_reth_peer

# Wait for geth process
wait $GETH_PID
