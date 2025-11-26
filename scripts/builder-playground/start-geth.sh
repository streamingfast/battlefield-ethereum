#!/usr/bin/env bash

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"


# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting Firehose Geth secondary client...${NC}"

# Check if playground is running and find the network
if ! docker ps --format '{{.Names}}' | grep -q '^chain-el-1$'; then
    echo -e "${RED}Error: Playground doesn't seem to be running. Please start it first with:${NC}"
    echo "  ./scripts/builder-playground/run_playground_devnet.sh"
    exit 1
fi

# Find the network that the playground containers are using
PLAYGROUND_NETWORK=$(docker inspect chain-el-1 --format='{{range $k, $v := .NetworkSettings.Networks}}{{$k}}{{end}}' | head -1)
if [ -z "$PLAYGROUND_NETWORK" ]; then
    echo -e "${RED}Error: Could not determine playground network${NC}"
    exit 1
fi
echo "Using network: $PLAYGROUND_NETWORK"

# Get the IP address of the Reth container in the Docker network
RETH_IP=$(docker inspect chain-el-1 --format='{{.NetworkSettings.Networks.'$PLAYGROUND_NETWORK'.IPAddress}}')
if [ -z "$RETH_IP" ]; then
    echo -e "${RED}Error: Could not get Reth IP address${NC}"
    exit 1
fi
echo "Reth IP: $RETH_IP"

# Note: Using beacon API with nofilter for post-merge consensus validation

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
    if curl -s --max-time 2 http://localhost:3500/eth/v1/node/version > /dev/null 2>&1; then
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

# Get current chain state for validation
echo "Getting current chain state..."
CURRENT_BLOCK=$(curl -s http://localhost:8545 -X POST -H "Content-Type: application/json" \
    --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' | jq -r '.result' 2>/dev/null)
echo "Current Reth block: $CURRENT_BLOCK"

# Note: Geth will share network namespace with cl-proxy for localhost access
# To access Geth from host, use: docker exec chain-geth-secondary curl ...
# Or access via the Docker network IP

# Get Reth enode for bootnodes
echo "Getting Reth enode for peer connection..."
RETH_ENODE=$(curl -s http://localhost:8545 -X POST -H "Content-Type: application/json" \
    --data '{"jsonrpc":"2.0","method":"admin_nodeInfo","params":[],"id":1}' | \
    jq -r '.result.enode' 2>/dev/null)

if [ -z "$RETH_ENODE" ] || [ "$RETH_ENODE" = "null" ]; then
    echo -e "${RED}Error: Could not get Reth enode${NC}"
    exit 1
fi

if [ -z "$RETH_IP" ]; then
    echo -e "${RED}Error: Could not get Reth IP address${NC}"
    exit 1
fi

# Replace the IP in enode with the actual IP address
BOOTNODE=$(echo "$RETH_ENODE" | sed "s/@[^@]*:/@$RETH_IP:/")
echo "Bootnode: $BOOTNODE"
echo "Using Docker network: $PLAYGROUND_NETWORK"

# Using beacon API for post-merge consensus

# Note: Chain has no finalized checkpoints yet, using beacon API for consensus only
if [ -n "$GENESIS_ROOT" ] && [ "$GENESIS_ROOT" != "null" ] && \
   [ "$GENESIS_ROOT" != "0x0000000000000000000000000000000000000000000000000000000000000000" ]; then
    CHECKPOINT_FLAG="--beacon.checkpoint=$GENESIS_ROOT"
    echo "Using checkpoint: $GENESIS_ROOT"
fi

# Check if cl-proxy exists (needed for network sharing)
if ! docker ps --format '{{.Names}}' | grep -q '^chain-cl-proxy-1$'; then
    echo -e "${RED}Error: cl-proxy container (chain-cl-proxy-1) must be running first${NC}"
    exit 1
fi

# Clean up any existing container and volume data
echo "Cleaning up previous Geth container and data..."
docker stop chain-geth-secondary 2>/dev/null || true
docker rm chain-geth-secondary 2>/dev/null || true
docker volume rm chain-geth-data 2>/dev/null || true

# Build the geth command
# Use --network container:cl-proxy-1 to share network namespace with cl-proxy
# This makes localhost work from cl-proxy's perspective
# Note: Can't use -p port mappings with --network container:, ports are shared
GETH_CMD=(
    "docker" "run" "--rm"
    "--name" "chain-geth-secondary"
    "--network" "container:chain-cl-proxy-1"
    "-v" "$PROJECT_ROOT/scripts/.playground/chain:/playground-chain:ro"
    "-v" "chain-geth-data:/data"
    "playground-geth"
    "--datadir=/data"
    "--http"
    "--http.addr=0.0.0.0"
    "--http.port=8547"
    "--http.api=engine,eth,net,web3,debug,admin"
    "--authrpc.jwtsecret=/playground-chain/jwtsecret"
    "--authrpc.port=8551"
    "--syncmode=full"
    "--gcmode=archive"
    "--state.scheme=hash"
    "--networkid=1337"
    "--verbosity=3"
    "--maxpeers=10"
    "--port=30303"
    "--bootnodes=$BOOTNODE"
    "--beacon.api=http://chain-beacon-1:3500"
    "--beacon.nofilter"
    "--beacon.threshold=1"
)

# Add firehose tracing if available
if docker run --rm playground-geth --help 2>/dev/null | grep -q -- '--vmtrace'; then
    GETH_CMD+=("--vmtrace=firehose")
    if docker run --rm playground-geth --help 2>/dev/null | grep -q -- '--vmtrace.jsonconfig'; then
        GETH_CMD+=("--vmtrace.jsonconfig={\"applyBackwardCompatibility\":false}")
    fi
fi

# Using beacon API with nofilter for post-merge consensus (avoids light client sync issues)

echo -e "${YELLOW}Starting Geth with command:${NC}"
echo "${GETH_CMD[*]}"
echo ""

# Function to add Reth peer manually
add_reth_peer() {
    echo "Waiting for Geth to be ready for peer addition..."
    local max_attempts=30
    local attempt=1

    while [ $attempt -le $max_attempts ]; do
        # Check if Geth RPC is responding (via docker exec since Geth is in cl-proxy network namespace)
        if docker exec chain-geth-secondary curl -s --max-time 2 http://localhost:8547 -X POST -H "Content-Type: application/json" \
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

    # Create corrected enode with Docker IP
    local corrected_enode=$(echo "$RETH_ENODE" | sed "s/@[^@]*:/@$RETH_IP:/")
    echo "Adding Reth peer manually: $corrected_enode"

    # Use RPC to add peer (via docker exec)
    docker exec chain-geth-secondary curl -s -X POST -H "Content-Type: application/json" --data "{\"jsonrpc\":\"2.0\",\"method\":\"admin_addPeer\",\"params\":[\"$corrected_enode\"],\"id\":1}" \
        http://localhost:8547 > /dev/null 2>&1 && echo "Peer added successfully" || echo -e "${YELLOW}Manual peer addition failed${NC}"
}

# Start Geth in background and add peer
"${GETH_CMD[@]}" &
GETH_PID=$!

# Give Geth a moment to start
sleep 5

# Try to add peer manually
add_reth_peer

# Wait for Geth process
wait $GETH_PID
