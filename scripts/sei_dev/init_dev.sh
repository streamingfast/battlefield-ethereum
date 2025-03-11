#!/usr/bin/env bash

set -e

ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && cd .. && pwd )"
source "$ROOT/lib.sh"

main() {
    check_sd
    check_env "SEI_CHAIN_REPOSITORY_HOME" "You need to set the SEI_CHAIN_REPOSITORY_HOME environment variable pointing to our Sei fork at https://github.com/streamingfast/sei-chain"

    pushd "$SEI_CHAIN_REPOSITORY_HOME" > /dev/null
        NO_RUN=1 "./scripts/initialize_local_chain.sh"

        sd '\[evm\]' "[evm]\nlive_evm_tracer = \"firehose\"" "$HOME/.sei/config/app.toml"
    popd > /dev/null

    cp -R "$HOME/.sei" "$ROOT/sei_dev/chain_data"

    echo "Initializing Sei dev chain completed"
}

main "$@"
