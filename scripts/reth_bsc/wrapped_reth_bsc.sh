#!/usr/bin/env bash
# Runs reth-bsc as a Firehose-instrumented follower of the dockerized BSC miner
# (scripts/bnb/up.sh). Invoked by fireeth as its reader node via run_firehose_reth_bsc.sh.

PARENT_PID=$$
ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && cd .. && pwd )"

source "$ROOT/lib.sh"

main() {
    data_dir="$(mktemp -d)"

    # Genesis + enode come from the running miner container; get-genesis-and-enode.sh
    # writes ./genesis.json into the CWD (fireeth's reader working dir) and prints the
    # enode rewritten to the given address.
    enode=$("$ROOT/bnb/get-genesis-and-enode.sh" 127.0.0.1:30304)
    genesis_file="$PWD/genesis.json"

    # Use non-default ports so this battlefield instance does not conflict with any other
    # reth-bsc node the developer may be running locally.
    reth_bsc_args=(
        "node"
        "--datadir=$data_dir"
        "--chain=$genesis_file"
        "--trusted-peers=$enode"
        "--disable-discovery"
        "--http"
        "--http.port=9545"
        "--authrpc.port=9551"
        "--port=30404"
        "--ipcpath=/tmp/battlefield-reth-bsc-$PARENT_PID.ipc"
        "--color=never"
    )

    echo "Running reth-bsc as Firehose follower of the BSC miner"
    echo "reth-bsc Binary: $reth_bsc"
    echo "reth-bsc Version: $($reth_bsc --version | head -2 | tr '\n' ' ')"
    echo "Genesis: $genesis_file"
    echo "Miner enode: $enode"
    echo "Command: $reth_bsc ${reth_bsc_args[*]}"
    echo ""

    exec "$reth_bsc" "${reth_bsc_args[@]}"
}

main "$@"
