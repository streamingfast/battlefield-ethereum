#!/usr/bin/env bash

set -e

ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

source "$ROOT/lib.sh"

main() {
    # Use playground genesis and configuration
    playground_path="$ROOT/.playground/chain"
    jwt_secret_file="$playground_path/jwtsecret"
    data_dir="/tmp/geth-playground-data"
    l1_beacon_rpc_url="http://localhost:3500"

    # Clean up any existing data
    if [[ -d "$data_dir" ]]; then
        echo "Removing existing Geth data directory: $data_dir"
        rm -rf "$data_dir"
    fi

    # Initialize Geth with playground genesis
    "$geth" init --datadir="$data_dir" --state.scheme=hash "$playground_path/genesis.json"

    # Get genesis block root for checkpoint
    genesis_root=$(curl -sS "$l1_beacon_rpc_url/eth/v1/beacon/headers/0" 2>/dev/null | jq -r '.data.root' 2>/dev/null || echo "")

    geth_extra_args=(
        "--datadir=$data_dir"
        "--http"
        "--http.addr=0.0.0.0"
        "--http.port=8547"
        "--http.api=engine,eth,net,debug,admin"
        "--authrpc.jwtsecret=$jwt_secret_file"
        "--authrpc.port=8552"
        "--syncmode=full"
        "--gcmode=archive"
        "--state.scheme=hash"
        "--verbosity=3"
        "--maxpeers=10"
        "--port=30304"
    )

    if [[ -n "$genesis_root" && "$genesis_root" != "null" && "$genesis_root" != "0x0000000000000000000000000000000000000000000000000000000000000000" ]]; then
        geth_extra_args+=("--beacon.checkpoint=$genesis_root")
    fi

    if has_vmtrace; then
        geth_extra_args+=("--vmtrace=firehose")

        if has_vmtrace_jsonconfig_flag; then
            json_config="{\"applyBackwardCompatibility\":false}"
            echo "Using vmtrace.jsonconfig: $json_config"
            geth_extra_args+=("--vmtrace.jsonconfig=$json_config")
        fi
    fi

    echo "Running Geth playground node with Firehose tracer"
    echo "Command: $geth ${geth_extra_args[*]}"
    echo ""

    exec "$geth" "${geth_extra_args[@]}"
}

has_vmtrace() {
    $geth --help 2>&1 | grep -q -- '--vmtrace'
}

has_vmtrace_jsonconfig_flag() {
    $geth --help 2>&1 | grep -q -- '--vmtrace.jsonconfig'
}

main "$@"
