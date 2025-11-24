#!/usr/bin/env bash

set -e

ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )/../.." && pwd )"
source "$ROOT/scripts/lib.sh"

# Function to kill processes using a port
kill_port() {
    local port=$1
    local pids=$(lsof -ti:$port 2>/dev/null || true)
    if [[ -n "$pids" ]]; then
        kill -9 $pids 2>/dev/null || true
    fi
}

# Cleanup function
cleanup() {
    echo ""
    echo "Cleaning up..."
    kill_pid "$FIRST_PID" 2>/dev/null || true
    kill_pid "$SECOND_PID" 2>/dev/null || true
    
    # Also kill any processes on our ports
    kill_port 8545
    kill_port 8546
    kill_port 8547
    kill_port 30303
    kill_port 30305
    
    if [[ -n "$SECOND_DATA_DIR" && -d "$SECOND_DATA_DIR" ]]; then
        rm -rf "$SECOND_DATA_DIR"
    fi
    exit 0
}

trap cleanup SIGINT SIGTERM EXIT

check_besu
check_jq

# Clean up any existing processes on our ports
echo "Cleaning up any existing processes on ports 8545, 8546, 8547, 30303, 30305..."
kill_port 8545
kill_port 8546
kill_port 8547
kill_port 30303
kill_port 30305
sleep 2

echo "=== Besu Node Sync Test Script ==="
echo ""

# Step 1: Start first Besu node using run_besu_dev.sh
echo "Step 1: Starting first Besu node using run_besu_dev.sh..."
"$ROOT/scripts/run_besu_dev.sh" &
FIRST_PID=$!

# Wait for first node to be ready
wait_geth_up "http://localhost:8545"

# Step 2: Get first node's enode and block count
echo "Step 2: Getting first node's info..."
ENODE=$(curl -s -X POST -H "Content-Type: application/json" --data '{"jsonrpc":"2.0","method":"net_enode","params":[],"id":1}' http://localhost:8545 | jq -r '.result')
BLOCKS=$(curl -s -X POST -H "Content-Type: application/json" --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' http://localhost:8545 | jq -r '.result')

echo "First node enode: $ENODE"
echo "First node blocks: $BLOCKS"
echo ""

# Step 3: Start second Besu node directly using besu command
echo "Step 3: Starting second Besu node directly..."
SECOND_DATA_DIR="$(mktemp -d)"
GENESIS_FILE="$ROOT/scripts/besu_dev/genesis.cancun.json"

if [[ ! -f "$GENESIS_FILE" ]]; then
    echo "Error: Genesis file not found: $GENESIS_FILE"
    exit 1
fi

besu_args=(
    "--miner-enabled=false"
    "--rpc-http-cors-origins=all"
    "--rpc-http-api=ETH,NET,WEB3,DEBUG,ADMIN"
    "--host-allowlist=*"
    "--rpc-ws-enabled=false"
    "--rpc-http-enabled"
    "--data-path=$SECOND_DATA_DIR"
    "--genesis-file=$GENESIS_FILE"
    "--rpc-http-port=8547"
    "--rpc-http-host=127.0.0.1"
    "--p2p-port=30305"
    "--p2p-host=127.0.0.1"
    "--discovery-enabled=false"
    "--logging=INFO"
)

"$besu" "${besu_args[@]}" &
SECOND_PID=$!

# Wait for second node to be ready
wait_geth_up "http://localhost:8547"

# Step 4: Get second node's enode and verify ADMIN API
echo "Step 4: Getting second node's enode..."
SECOND_ENODE=$(curl -s -X POST -H "Content-Type: application/json" --data '{"jsonrpc":"2.0","method":"net_enode","params":[],"id":1}' http://localhost:8547 | jq -r '.result')
echo "Second node enode: $SECOND_ENODE"

# Verify ADMIN API is enabled on second node
ADMIN_CHECK=$(curl -s -X POST -H "Content-Type: application/json" --data '{"jsonrpc":"2.0","method":"admin_nodeInfo","params":[],"id":1}' http://localhost:8547 2>/dev/null || echo "")
if [[ -z "$ADMIN_CHECK" || "$ADMIN_CHECK" == *"not enabled"* ]]; then
    echo "⚠️  Warning: ADMIN API may not be enabled on second node"
else
    echo "✅ ADMIN API is enabled on second node"
fi
echo ""

# Step 5: Connect nodes (from first node to second)
echo "Step 5: Connecting nodes..."
# Use the actual enode from second node (even if port shows 30303, that's what it's listening on)
CONNECT_RESULT=$(curl -s -X POST -H "Content-Type: application/json" --data "{\"jsonrpc\":\"2.0\",\"method\":\"admin_addPeer\",\"params\":[\"$SECOND_ENODE\"],\"id\":1}" http://localhost:8545)

if [[ "$CONNECT_RESULT" == *"true"* ]]; then
    echo "✅ Nodes connected successfully!"
    
    # Verify connection by checking peer count
    sleep 2
    PEER_COUNT=$(curl -s -X POST -H "Content-Type: application/json" --data '{"jsonrpc":"2.0","method":"net_peerCount","params":[],"id":1}' http://localhost:8545 | jq -r '.result' 2>/dev/null || echo "0")
    PEER_COUNT_DEC=$(printf "%d" "$PEER_COUNT" 2>/dev/null || echo "0")
    if [[ "$PEER_COUNT_DEC" -gt 0 ]]; then
        echo "✅ Peer count on Node1: $PEER_COUNT_DEC"
    else
        echo "⚠️  Warning: Peer count is 0, nodes may not be connected"
    fi
    
    # Also check from Node2
    PEER_COUNT2=$(curl -s -X POST -H "Content-Type: application/json" --data '{"jsonrpc":"2.0","method":"net_peerCount","params":[],"id":1}' http://localhost:8547 | jq -r '.result' 2>/dev/null || echo "0")
    PEER_COUNT_DEC2=$(printf "%d" "$PEER_COUNT2" 2>/dev/null || echo "0")
    if [[ "$PEER_COUNT_DEC2" -gt 0 ]]; then
        echo "✅ Peer count on Node2: $PEER_COUNT_DEC2"
    fi
else
    echo "❌ Failed to connect nodes: $CONNECT_RESULT"
    echo "Trying alternative: connecting from Node2 to Node1..."
    CONNECT_RESULT2=$(curl -s -X POST -H "Content-Type: application/json" --data "{\"jsonrpc\":\"2.0\",\"method\":\"admin_addPeer\",\"params\":[\"$ENODE\"],\"id\":1}" http://localhost:8547)
    if [[ "$CONNECT_RESULT2" == *"true"* ]]; then
        echo "✅ Nodes connected successfully (from Node2 to Node1)!"
    else
        echo "❌ Failed to connect nodes from either direction: $CONNECT_RESULT2"
    fi
fi

echo ""

# Step 6: Monitor sync progress
echo "Step 6: Monitoring sync progress..."
echo "Check block counts (run in another terminal):"
echo "curl -s http://localhost:8545 -X POST -H 'Content-Type: application/json' -d '{\"jsonrpc\":\"2.0\",\"method\":\"eth_blockNumber\",\"params\":[],\"id\":1}' | jq -r .result"
echo "curl -s http://localhost:8547 -X POST -H 'Content-Type: application/json' -d '{\"jsonrpc\":\"2.0\",\"method\":\"eth_blockNumber\",\"params\":[],\"id\":1}' | jq -r .result"
echo ""
echo "Press Ctrl+C to stop monitoring..."

# Keep running to monitor
while true; do
    sleep 5
    FIRST_BLOCKS=$(curl -s -X POST -H "Content-Type: application/json" --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' http://localhost:8545 | jq -r '.result' 2>/dev/null || echo "error")
    SECOND_BLOCKS=$(curl -s -X POST -H "Content-Type: application/json" --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' http://localhost:8547 | jq -r '.result' 2>/dev/null || echo "error")

    echo "$(date +%H:%M:%S) - Node1: $FIRST_BLOCKS, Node2: $SECOND_BLOCKS"
done

