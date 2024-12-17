
set -e

PARENT_PID=$$
ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

source "$ROOT/lib.sh"

main() {
    ipc_path=${IPC_PATH:-"$ROOT/.firehose-data/geth.ipc"}
    # It seems the 'geth attach' only allows specyfing the datadir directly and not the IPC
    # path, so we need to extract the directory from the IPC path
    ipc_dir=$(dirname "$ipc_path")
    firehose_version=${FIREHOSE_VERSION:-"2.3"}

    backward_compatibility="true"
    if [[ "$firehose_version" == "2.3" ]]; then
        backward_compatibility="true"
    elif [[ "$firehose_version" == "3.0" ]]; then
        backward_compatibility="false"
    else
        echo "Unsupported Firehose version: $firehose_version"
        exit 1
    fi

    echo "Running local Geth --dev chain"
    echo "Address to fund: $address_to_fund"
    echo "Geth Binary: $geth"
    echo "Geth Version: $($geth --version)"
    echo "IPC Directory: $ipc_dir"
    echo "IPC Path: $ipc_path"
    echo "Firehose version: $firehose_version"
    echo "Backward compatibility: $backward_compatibility"
    echo ""

    launch_funder "$ipc_path" &

    exec geth --dev --dev.period=1 --http --http.api eth,web3,net --ipcpath="$ipc_path" --vmtrace=firehose --vmtrace.jsonconfig='{"applyBackwardCompatibility":'$backward_compatibility'}'
}

launch_funder() {
    ipc_path="$1"

    # A first sleep to let the node start
    sleep 1

    echo "Funding $address_to_fund"

    tries=0
    while [ ! -S "$ipc_path" ]; do
        sleep 1
        tries=$((tries + 1))
        if [ $tries -gt 10 ]; then
            echo "IPC path not found after 10 tries, aborting"
            kill $PARENT_PID
            exit 1
        fi
    done

    # It seems the 'geth attach' only allows specyfing the datadir directly and not the IPC
    # path, so we need to extract the directory from the IPC path
    ipc_dir=$(dirname "$ipc_path")

    geth attach --datadir "$ipc_dir" --exec "eth.sendTransaction({from: eth.accounts[0], to: \"$address_to_fund\", value: web3.toWei(15000000000000, \"ether\")})"
    if [[ $? -ne 0 ]]; then
        echo "Failed to send the funding transaction"
        kill $PARENT_PID
        exit 1
    fi

    echo "Funding transaction sent"
}

main "$@"
