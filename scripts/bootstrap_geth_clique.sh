#!/usr/bin/env bash

set -e

ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
source "$ROOT/lib.sh"

main() {
    check_geth

    echo "Generating genesis block for Geth Clique chain"
    "$geth" --datadir="$firehose_data_dir/node" init "$ROOT/geth_clique/genesis.json"

    echo "Copying keystore to Geth Clique chain"
    cp -R "$ROOT/geth_clique/keystore" "$firehose_data_dir/node/geth/"

    echo "Bootstrapping Geth Clique chain completed"
}

main "$@"
