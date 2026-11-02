#!/usr/bin/env bash

PARENT_PID=$$
ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && cd .. && pwd )"

source "$ROOT/lib.sh"

main() {
    data_dir="$(mktemp -d)"
    fork_version=${FORK_VERSION:-"osaka"}

    # Geth genesis files do not work here: Arc reads fee params and gas limits from a
    # ProtocolConfig predeploy, so without it the node never gets past genesis.
    genesis_file="$ROOT/arc_dev/genesis.$fork_version.json"

    "$arc_node" init --datadir="$data_dir" --chain="$genesis_file" 2> /dev/null

    # Use non-default ports so this battlefield instance does not conflict with any other
    # Arc node the developer may be running locally (which would use the defaults below).
    arc_node_extra_args=(
        "node"
        "--datadir=$data_dir"
        "--dev"
        "--dev.block-time=1s"
        "--chain=$genesis_file"
        "--http.port=9545"
        "--http.api=eth,net,web3,debug,txpool"
        "--ws.port=9546"
        "--authrpc.port=9551"
        "--port=30403"
        "--firehose"
    )

    echo "Running local Arc --dev chain"
    echo "Address to fund: $address_to_fund"
    echo "Arc Binary: $arc_node"
    echo "Arc Fork Version: $fork_version"
    echo "Arc Version: $($arc_node --version)"
    echo "Command: $arc_node ${arc_node_extra_args[@]}"
    echo ""

    exec "$arc_node" ${arc_node_extra_args[@]}
}

main "$@"
