#!/usr/bin/env bash

set -e

ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
source "$ROOT/lib.sh"

main() {
    check_sd
    check_env "SEI_CHAIN_REPOSITORY_HOME" "You need to set the SEI_CHAIN_REPOSITORY_HOME environment variable pointing to our Sei fork at https://github.com/streamingfast/sei-chain"

    transaction_executor=${TRANSACTION_EXECUTOR:-"parallel"}

    echo "Initializing local chain"
    echo "- Transaction executor: $transaction_executor"
    echo ""

    pushd "$SEI_CHAIN_REPOSITORY_HOME" > /dev/null
        NO_RUN=1 "./scripts/initialize_local_chain.sh"
    popd > /dev/null

    sd '\[evm\]' "[evm]\nlive_evm_tracer = \"firehose\"" "$HOME/.sei/config/app.toml"

    occ_enabled="true"
    if [[ "${transaction_executor}" == "sequential" ]]; then
        occ_enabled="false"
    fi

    sd 'occ-enabled *=.*' "occ-enabled = ${occ_enabled}" "$HOME/.sei/config/app.toml"

    echo "Bootstrapping Sei chain completed"
}

main "$@"
