
set -e

PARENT_PID=$$
ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

source "$ROOT/lib.sh"

main() {
    data_dir="$(mktemp -d)"
    firehose_version=${FIREHOSE_VERSION:-"2.3"}
    fork_version=${FORK_VERSION:-"cancun"}

    backward_compatibility="true"
    if [[ "$firehose_version" == "2.3" ]]; then
        backward_compatibility="true"
    elif [[ "$firehose_version" == "3.0" ]]; then
        backward_compatibility="false"
    else
        echo "Unsupported Firehose version: $firehose_version"
        exit 1
    fi

    "$geth" --dev --datadir="$data_dir" init "$ROOT/geth_dev/genesis.$fork_version.json" 2> /dev/null

    geth_extra_args=("--dev" "--dev.period=1" "--http" "--http.api=eth,web3,net" "--datadir=$data_dir")
    if has_vmtrace; then
        geth_extra_args+=("--vmtrace=firehose")

        if has_vmtrace_jsonconfig_flag; then
            forced_backward_compatibility=""
            if [[ $FIREHOSE_ETHEREUM_TRACER_FORCED_BACKWARD_COMPATIBILITY == "true" ]]; then
                forced_backward_compatibility=",\"_private\":{\"forcedBackwardCompatibility\":true}"
            else
                forced_backward_compatibility=""
            fi

            # There must be no spaces in the JSON config string otherwise bash is not happy
            geth_extra_args+=("--vmtrace.jsonconfig={\"applyBackwardCompatibility\":${backward_compatibility}${forced_backward_compatibility}}")
        fi
    fi

    echo "Running local Geth --dev chain"
    echo "Address to fund: $address_to_fund"
    echo "Geth Binary: $geth"
    echo "Geth Fork Version: $fork_version"
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

main "$@"
