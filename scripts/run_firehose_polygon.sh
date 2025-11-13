#!/usr/bin/env bash

set -e

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check dependencies and provide installation instructions
check_dependencies() {
    echo "Checking dependencies..."
    local missing_deps=()

    # Check Docker
    if ! command_exists docker; then
        missing_deps+=("docker")
        echo "❌ Docker is not installed"
        echo "   Install with: Download Docker Desktop from https://www.docker.com/products/docker-desktop"
    else
        echo "✅ Docker is installed"
    fi

    # Check Kurtosis
    if ! command_exists kurtosis; then
        missing_deps+=("kurtosis")
        echo "❌ Kurtosis is not installed"
        echo "   Install with: brew install kurtosis-tech/tap/kurtosis-cli"
        echo "   Note: You may have to go in the App Store, look for XCode and click Upgrade for that installation to work"
    else
        echo "✅ Kurtosis is installed"
    fi

    # Check Cast (part of Foundry)
    if ! command_exists cast; then
        missing_deps+=("cast")
        echo "❌ Cast (Foundry) is not installed"
        echo "   Install with:"
        echo "   curl -L https://foundry.paradigm.xyz | bash"
        echo "   foundryup"
    else
        echo "✅ Cast (Foundry) is installed"
    fi

    # Check Polycli
    if ! command_exists polycli; then
        missing_deps+=("polycli")
        echo "❌ Polycli is not installed"
        echo "   Install with:"
        echo "   git clone git@github.com:0xPolygon/polygon-cli.git && cd polygon-cli && make install"
    else
        echo "✅ Polycli is installed"
    fi

    # Check Bats
    if ! command_exists bats; then
        missing_deps+=("bats")
        echo "❌ Bats is not installed"
        echo "   Install with:"
        echo "   git clone https://github.com/bats-core/bats-core && cd bats-core && sudo ./install.sh /usr/local"
    else
        echo "✅ Bats is installed"
    fi

    # Check Fireeth
    if ! command_exists fireeth; then
        missing_deps+=("fireeth")
        echo "❌ Fireeth is not installed"
        echo "   Install with: https://github.com/streamingfast/firehose-ethereum"
    else
        echo "✅ Fireeth is installed"
    fi

    # Check Bor
    if ! command_exists bor; then
        missing_deps+=("bor")
        echo "❌ Bor is not installed"
        echo "   Install with: Compile the firehose-instrumented version of bor using 'make bor'"
    else
        echo "✅ Bor is installed"
    fi

    if [ ${#missing_deps[@]} -ne 0 ]; then
        echo ""
        echo "Please install the missing dependencies listed above and run this script again."
        exit 1
    fi

    echo ""
    echo "All dependencies are installed! ✅"
    echo ""
}

# Function to prepare the Kurtosis environment
prepare_kurtosis_environment() {
    echo "Preparing Kurtosis environment..."

    # Pull the required Docker image
    echo "Pulling Docker image..."
    docker pull --platform=linux/amd64 ghcr.io/agglayer/e2e:9fd2d09

    # Run Kurtosis
    echo "Starting Kurtosis POS environment..."
    kurtosis run --enclave pos github.com/streamingfast/kurtosis-pos

    # Test a simple transaction
    echo "Testing simple transaction..."
    export ETH_RPC_URL=$(kurtosis port print pos l2-el-1-bor-heimdall-v2-validator rpc)
    pk="0xd40311b5a5ca5eaeb48dfba5403bde4993ece8eccf4190e98e19fcd4754260ea"
    cast send --private-key "$pk" --value 0.01ether $(cast address-zero) --priority-gas-price=25000000000 --gas-price=250000000000

    # Sending funds to the test account
    cast send --private-key "$pk" --value 1000000ether 0x821B55D8AbE79bC98f05Eb675fDc50dFe796B7Ab  --priority-gas-price=25000000000 --gas-price=250000000000

    echo "Kurtosis environment prepared successfully! ✅"
    echo ""
}

# Function to prepare running our own node
prepare_local_node() {
    echo "Preparing local node configuration..."

    # Get the script directory before changing directories
    SCRIPTS_FOLDER="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

    # Create temporary directory for configuration
    TEMP_DIR=$(mktemp -d)
    cd "$TEMP_DIR"

    # Create directories
    mkdir -p localconfig localdata

    # Extract genesis file
    kurtosis files inspect pos l2-el-genesis genesis.json | jq > localconfig/genesis.json

    # Set environment variables
    export DATADIR=$(pwd)/localdata
    export CONFIGDIR=$(pwd)/localconfig
    export CLHTTPADDR=$(kurtosis port print pos l2-cl-1-heimdall-v2-bor-validator http)
    export CLWSADDR=$(kurtosis port print pos l2-cl-1-heimdall-v2-bor-validator rpc)
    export ELP2PADDR=$(kurtosis port print pos l2-el-1-bor-heimdall-v2-validator discovery)
    export ENODE=$(kurtosis service exec pos l2-el-1-bor-heimdall-v2-validator "echo admin.nodeInfo | bor attach /var/lib/bor/bor.ipc" |awk '/enode/ {print $2}' | sed 's@.*"\(enode://.*\)127.0.0.1:30303.*@\1@')$(echo $ELP2PADDR|sed 's@http://@@')

    # Generate config file from template
    envsubst < "$SCRIPTS_FOLDER/config_polygon.template" > localconfig/config.toml

    # Generate nodekey
    polycli nodekey | jq -r .PrivateKey > localconfig/nodekey

    echo "Local node configuration prepared in: $TEMP_DIR"
    echo "DATADIR: $DATADIR"
    echo "CONFIGDIR: $CONFIGDIR"
    echo ""

    # Store the temp directory path for later use
    echo "$TEMP_DIR" > /tmp/bor_temp_dir
}

# Function to display bridge test instructions
display_bridge_test_instructions() {
    echo "=============================================="
    echo "NEXT STEPS: Run Bridge Tests"
    echo "=============================================="
    echo ""
    echo "Please run the following commands to execute bridge tests."
    echo "This takes about 10 minutes and generates state-sync transactions on chain:"
    echo ""
    echo "# Clone the e2e test repository"
    echo "git clone https://github.com/agglayer/e2e.git"
    echo "cd e2e"
    echo "git checkout 9fd2d09  # this is the version for bor v2.4.0-beta5"
    echo ""
    echo "# Run the bridge e2e tests"
    echo "bats --filter-tags pos --recursive tests/"
    echo ""
    echo "Note: 4/5 tests should pass, ignore the 'prune TxIndexer' test failing"
    echo ""
    echo "=============================================="
}

# Function to run local bor
run_local_bor() {
    echo "Running local Bor node..."
    echo "========================"
    echo ""

    # Get the temp directory path
    TEMP_DIR=$(cat /tmp/bor_temp_dir)
    cd "$TEMP_DIR"

    # Check bor version
    echo "Checking Bor version..."
    bor version
    echo ""

    # Run fireeth with bor server
    echo "Starting Fireeth with Bor server and Firehose tracing..."
    echo "Running: fireeth start reader-node,relayer,merger,firehose -c '' --reader-node-path=bor --reader-node-arguments=\"server --config localconfig/config.toml --vmtrace=firehose\" --advertise-chain-name=devnet --firehose-grpc-listen-addr=\"localhost:8089\""
    echo ""
    fireeth start reader-node,relayer,merger,firehose -c '' --reader-node-path=bor --reader-node-arguments="server --config localconfig/config.toml --vmtrace=firehose" --advertise-chain-name=devnet --firehose-grpc-listen-addr="localhost:8089"
}

# Main function
main() {
    echo "Polygon Development Environment Setup"
    echo "====================================="
    echo ""

    # Step 1: Check dependencies
    check_dependencies

    # Step 2: Prepare Kurtosis environment
    prepare_kurtosis_environment

    # Step 3: Prepare local node
    prepare_local_node

    # Step 4: Display bridge test instructions
    display_bridge_test_instructions

    # Press any key to continue
    echo "Press any key to continue..."
    read -n 1 -s

    # Step 5: Run local bor
    run_local_bor
}

# Show usage information
usage() {
    echo "Usage: $0"
    echo ""
    echo "This script sets up a complete Polygon development environment including:"
    echo "1. Dependency checking and installation instructions"
    echo "2. Kurtosis environment preparation"
    echo "3. Local node configuration"
    echo "4. Instructions for running bridge tests"
    echo "5. Running local Bor node with Firehose tracing"
    echo ""
    echo "Requirements:"
    echo "- macOS (installation instructions are Mac-specific)"
    echo "- Internet connection for downloading dependencies and Docker images"
    echo ""
}

# Handle help flags
if [[ "$1" == "--help" ]] || [[ "$1" == "-h" ]]; then
    usage
    exit 0
fi

# Run main function
main "$@"
