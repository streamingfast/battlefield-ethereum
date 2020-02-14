#!/usr/bin/env bash

set -e

ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

current_dir=`pwd`
log_file="$ROOT/ropsten-active.md"

function usage() {
    echo "./generate_ropsten.sh"
    echo "Generate Battlefield transaction on the ETH Ropsten network"
    exit 0
}

function cleanup {
    echo "\`\`\`" >> $log_file

    echo ""
    echo "Last run output has been saved to '$log_file' file."

    cd $current_dir
}

function main {
    if [[ $1 == "--help" || $1 == "-h" ]]; then
        usage
    fi

    # Trap exit signal and clean up
    trap cleanup EXIT

    $ROOT/contract/build.sh
    echo ""

    echo "Executing transactions contained in script 'main.ts'"
    echo "## Ropsten Last Run Log (`date`)" > $log_file
    echo "" >> $log_file
    echo "\`\`\`" >> $log_file

    yarn -s run ropsten | tee -a $log_file
    echo ""

    # The `cleanup` function is going to add the ending ``` backticks
}

main $@
