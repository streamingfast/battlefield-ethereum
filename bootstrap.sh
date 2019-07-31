#!/usr/bin/env bash

set -e

ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
GETH_BIN=${GETH_BIN:-"geth"}

data_dir=$ROOT/boot
geth_cmd="$GETH_BIN --datadir ${data_dir}"

##
# Can be used as the basic to regenerate some parts of the boot folder.
#
# This will create three accounts with an empty passphrase. You are then
# responsible of editing the `genesis.json` according to newly created
# account addresses.
#
# Most instructions and related information can be obtain from this
# blog post: https://hackernoon.com/setup-your-own-private-proof-of-authority-ethereum-network-with-geth-9a0a3750cda8
#
function main {
    echo -n "This will delete existing keystore and will require a genesis.json update, continue (y/n)? "
    read answer

    if [[ "$answer" != "y" && "$answer" != "Y" ]]; then
        exit 0
    fi

    keystore_dir="$data_dir"/keystore
    rm -rf "$keystore_dir" &> /dev/null || true
    mkdir $keystore_dir
    printf "" > "$keystore_dir"/passphrase.txt

    $geth_cmd account new --keystore "$keystore_dir" --password "$keystore_dir/passphrase.txt"
    $geth_cmd account new --keystore "$keystore_dir" --password "$keystore_dir/passphrase.txt"
    $geth_cmd account new --keystore "$keystore_dir" --password "$keystore_dir/passphrase.txt"

    echo "Ensure to edit genesis.json to fit with those addresses"
    ls keystore | cut -d '-' -f9

    echo "You will need also to change the extraData address (the non-0 part) with the new first account"
}

main $@
