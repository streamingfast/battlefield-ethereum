#!/usr/bin/env bash

set -e
ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

function usage() {
    echo "./oracle.sh"
    echo ""
    echo "Updater reference oracle file latest call './generate.sh'"
    exit 0
}

function main {
    if [[ $1 == "--help" || $1 == "-h" ]]; then
        usage
    fi

    current_dir="`pwd`"
    trap "cd \"$current_dir\"" EXIT
    pushd "$ROOT" &> /dev/null

    echo "Copying miner references file (data, .dmlog) to oracle files..."
    rm -rf data/oracle
    cp -R data/miner data/oracle

    cat miner.dmlog | grep -E -v "TRX_DISCARDED|TRX_ENTER_POOL" > oracle.dmlog
}

main $@
