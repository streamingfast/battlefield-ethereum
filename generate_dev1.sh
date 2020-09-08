#!/usr/bin/env bash

set -e

ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

current_dir=`pwd`
log_file="$ROOT/dev1-active.md"

function usage() {
    echo "./generate_dev1.sh"
    echo "Generate Battlefield transaction on dfuse Ethereum Tesnet (dev1)"
    echo ""
    echo "To correctly work, you will need to have those environment variables"
    echo "defined:"
    echo "- RPC_ENDPOINT     The url to use to reach the RPC endpoint so we can send transaction to it"
    echo "- PRIVATE_KEY      The private key to use to sign transactions"
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
    echo "## Dev1 Last Run Log (`date`)" > $log_file
    echo "" >> $log_file
    echo "\`\`\`" >> $log_file

    yarn -s run dev1 | tee -a $log_file
    echo ""

    # The `cleanup` function is going to add the ending ``` backticks
}

main $@
