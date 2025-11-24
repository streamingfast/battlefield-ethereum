#!/usr/bin/env bash

set -e

ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
source "$ROOT/lib.sh"

main() {
    data_dir="$(mktemp -d)"
    fork_version=${FORK_VERSION:-"cancun"}

    echo "Running local Besu dev chain"
    echo "Data directory: $data_dir"
    echo "Fork version: $fork_version"
    echo "Besu Binary: $besu"
    echo "Besu Version: $($besu --version)"
    echo ""

    # Use the battlefield genesis file
    genesis_file="$ROOT/besu_dev/genesis.$fork_version.json"
    if [[ ! -f "$genesis_file" ]]; then
        echo "Error: Genesis file not found: $genesis_file"
        exit 1
    fi

    # Build Besu command matching the working command structure
    besu_args=(
        "--miner-enabled"
        "--miner-coinbase=0xfe3b557e8fb62b89f4916b721be55ceb828dbd73"
        "--rpc-http-cors-origins=all"
        "--rpc-http-api=ETH,NET,WEB3,DEBUG,MINER"
        "--host-allowlist=*"
        "--rpc-ws-enabled"
        "--rpc-http-enabled"
        "--data-path=$data_dir"
        "--genesis-file=$genesis_file"
        "--rpc-http-port=8545"
        "--rpc-http-host=127.0.0.1"
        "--logging=INFO"
    )

    echo "Command: $besu ${besu_args[*]}"
    echo ""
    exec "$besu" "${besu_args[@]}"
}

main "$@"
