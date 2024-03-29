#!/usr/bin/env bash

set -e

ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
GETH_BIN=${GETH_BIN:-"geth"}

syncer_init_log="$ROOT/syncer.init.log"
syncer_log="$ROOT/syncer.log"
firehose_log="$ROOT/firehose.log"
syncer_data_dir="$ROOT/data/syncer"
syncer_geth_cmd="$GETH_BIN --datadir ${syncer_data_dir}"

syncer_pid=""
current_dir=`pwd`

function cleanup {
    if [[ $syncer_pid != "" ]]; then
        echo "Closing syncer process"
        kill -s TERM $syncer_pid || true
    fi

    cd $current_dir
    exit 0
}

function main {
    # Trap exit signal and clean up
    trap cleanup EXIT

    rm -rf "$syncer_data_dir"
    mkdir -p "$syncer_data_dir/geth"

    cp -a "$ROOT/boot/keystore" "$syncer_data_dir"
    cp -a "$ROOT/boot/static-nodes.json" "$syncer_data_dir/geth"

    echo "Initializing nodes..."
    $syncer_geth_cmd init "$ROOT"/boot/genesis.json 2> $syncer_init_log

    echo "Starting syncer process"
    $syncer_geth_cmd \
        --firehose-enabled \
        --firehose-genesis-file="$ROOT"/boot/genesis.json \
        --http --http.api="personal,eth,net,web3" \
        --http.port=8555 \
        --port=30313 \
        --networkid=1515 \
        --nodiscover 1> $firehose_log
}

main $@
