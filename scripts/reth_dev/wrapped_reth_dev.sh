
set -e

PARENT_PID=$$
ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

source "$ROOT/lib.sh"

main() {
    data_dir="$(mktemp -d)"
    firehose_version=${FIREHOSE_VERSION:-"3.0"}
    fork_version=${FORK_VERSION:-"prague"}
    genesis_file="$ROOT/geth_dev/genesis.$fork_version.json"

    "$reth" init --datadir="$data_dir" --chain="$genesis_file" 2> /dev/null

    reth_extra_args=("node" "--datadir=$data_dir" "--dev" "--dev.block-time=1s" "--chain=$genesis_file")

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
