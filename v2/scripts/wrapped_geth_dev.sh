
set -e

PARENT_PID=$$
ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

source "$ROOT/lib.sh"

main() {
    data_dir="$(mktemp -d)"
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

    "$geth" --dev --datadir="$data_dir" init "$ROOT/geth_dev/genesis.json" 2> /dev/null

    geth_extra_args=("--dev" "--dev.period=1" "--http" "--http.api=eth,web3,net" "--datadir=$data_dir")
    if has_vmtrace; then
        geth_extra_args+=("--vmtrace=firehose")

        if has_vmtrace_jsonconfig_flag; then
            geth_extra_args+=("--vmtrace.jsonconfig={\"applyBackwardCompatibility\":$backward_compatibility}")
        fi
    fi

    if has_firehose_enabled_flag; then
        geth_extra_args+=("--firehose-enabled")
    fi

    echo "Running local Geth --dev chain"
    echo "Address to fund: $address_to_fund"
    echo "Geth Binary: $geth"
    echo "Geth Version: $($geth --version)"
    echo "IPC Directory: $ipc_dir"
    echo "IPC Path: $ipc_path"
    echo "Firehose version: $firehose_version"
    echo "Command: $geth ${geth_extra_args[@]}"
    echo ""

    exec "$geth" ${geth_extra_args[@]}
}

has_vmtrace() {
    # Overlaps with has_vmtrace_jsonconfig_flag, but fine because either only --vmtrace or both --vmtrace and --vmtrace.jsonconfig are supported
    $geth --help 2>&1 | grep -q -- '--vmtrace'
}

has_vmtrace_jsonconfig_flag() {
    $geth --help 2>&1 | grep -q -- '--vmtrace.jsonconfig'
}

has_firehose_enabled_flag() {
    $geth --help 2>&1 | grep -q -- '--firehose-enabled'
}

main "$@"
