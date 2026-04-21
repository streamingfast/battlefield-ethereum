#!/usr/bin/env bash

PARENT_PID=$$
ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && cd .. && pwd )"

source "$ROOT/lib.sh"

main() {
    data_dir="$(mktemp -d)"
    firehose_version=${FIREHOSE_VERSION:-"3.0"}
    fork_version=${FORK_VERSION:-"prague"}

    # Yes we re-use Geth genesis files as they work as-is with Reth too
    genesis_file="$ROOT/geth_dev/genesis.$fork_version.json"

    "$reth" init --datadir="$data_dir" --chain="$genesis_file" 2> /dev/null

    # Use non-default ports so this battlefield instance does not conflict with any other
    # reth node the developer may be running locally (which would use the defaults below).
    reth_extra_args=(
        "node"
        "--datadir=$data_dir"
        "--dev"
        "--dev.block-max-transactions=1"
        "--chain=$genesis_file"
        "--http.port=9545"
        "--ws.port=9546"
        "--authrpc.port=9551"
        "--port=30403"
    )

    echo "Running local Reth --dev chain"
    echo "Address to fund: $address_to_fund"
    echo "Reth Binary: $reth"
    echo "Reth Fork Version: $fork_version"
    echo "Reth Version: $($reth --version)"
    echo "IPC Directory: $ipc_dir"
    echo "IPC Path: $ipc_path"
    echo "Firehose version: $firehose_version"
    echo "Command: $reth ${reth_extra_args[@]}"
    echo ""

    exec "$reth" ${reth_extra_args[@]}
}

main "$@"
