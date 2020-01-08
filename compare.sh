#!/usr/bin/env bash

set -e

ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
GETH_BIN=${GETH_BIN:-"geth"}

oracle_init_log="$ROOT/oracle.init.log"
syncer_init_log="$ROOT/syncer.init.log"

oracle_log="$ROOT/oracle.log"
oracle_deep_mind_log="$ROOT/oracle.dmlog"

syncer_log="$ROOT/syncer.log"
syncer_deep_mind_log="$ROOT/syncer.dmlog"

oracle_data_dir="$ROOT/data/oracle"
syncer_data_dir="$ROOT/data/syncer"

oracle_geth_cmd="$GETH_BIN --datadir ${oracle_data_dir}"
syncer_geth_cmd="$GETH_BIN --datadir ${syncer_data_dir}"

oracle_pid=""
syncer_pid=""
current_dir=`pwd`

function usage() {
    echo "./compare.sh [all|syncer_only|oracle_only] [--wait-forever]"
    exit 0
}

function cleanup {
    if [[ $oracle_pid != "" ]]; then
        echo "Closing oracle process"
        kill -s TERM $oracle_pid || true
    fi

    if [[ $syncer_pid != "" ]]; then
        echo "Closing syncer process"
        kill -s TERM $syncer_pid || true
    fi

    cd $current_dir
    exit 0
}

function main {
    if [[ $1 == "--help" || $1 == "-h" ]]; then
        usage
    fi

    # Trap exit signal and clean up
    trap cleanup EXIT

    component="all"
    wait_forever="false"

    if [[ $1 == "oracle_only" || $1 == "syncer_only" ]]; then
        component=$1; shift
    fi

    if [[ $1 == "--wait-forever" ]]; then
        wait_forever="true"; shift
    fi

    rm -rf "$syncer_data_dir"
    mkdir -p "$syncer_data_dir/geth"

    cp -a "$ROOT/boot/keystore" "$syncer_data_dir"
    cp -a "$ROOT/boot/static-nodes.json" "$syncer_data_dir/geth"

    echo "Starting oracle process"
    if [[ $component == "all" || $component == "oracle_only" ]]; then
        $oracle_geth_cmd init "$ROOT"/boot/genesis.json 2> $oracle_init_log

        ($oracle_geth_cmd \
            --rpc --rpcapi="personal,db,eth,net,web3,txpool,oracle" \
            --allow-insecure-unlock \
            --mine=false \
            --miner.threads=0 \
            --networkid=1515 \
            --nodiscover \
            --nousb $@ 2> $oracle_log) &
        oracle_pid=$!
    fi

    echo "Starting syncer process"
    if [[ $component == "all" || $component == "syncer_only" ]]; then
        $syncer_geth_cmd init "$ROOT"/boot/genesis.json 2> $syncer_init_log

        ($syncer_geth_cmd \
            --deep-mind \
            --rpc --rpcapi="personal,db,eth,net,web3" \
            --rpcport=8555 \
            --port=30313 \
            --networkid=1515 \
            --nodiscover \
            --nousb $@ 1> $syncer_deep_mind_log 2> $syncer_log) &
        syncer_pid=$!
    fi

    echo "Giving 15s for oracle to be ready"
    sleep 15
    echo ""

    if [[ $component == "oracle_only" ]]; then
        echo "oracle sleeping forever"
        sleep_forever
    fi

    blockNumHex=`curl -s -X POST -H 'Content-Type: application/json' localhost:8545 --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' | jq -r .result | sed s/0x//`
    blockNum=`to_dec $blockNumHex`

    echo "Waiting for syncer to reach block #$blockNum"

    set +e
    while true; do
        result=`cat "$syncer_log" | grep -E "Imported new chain segment.*number=$blockNum"`
        if [[ $result != "" ]]; then
            echo ""
            break
        fi

        echo "Giving 5s for syncer to complete syncing"
        sleep 5
    done

    echo "Inspect log files"
    echo " Oracle logs: cat `realpath --relative-to="$current_dir" "$oracle_log"`"
    echo " Syncer logs: cat `realpath --relative-to="$current_dir" "$syncer_log"`"
    echo ""
    echo " Deep Mind logs (oracle): cat `realpath --relative-to="$current_dir" "$oracle_deep_mind_log"`"
    echo " Deep Mind logs (syncer): cat `realpath --relative-to="$current_dir" "$syncer_deep_mind_log"`"
    echo ""

    if [[ $wait_forever == "true" ]]; then
        echo "Sleeping forever"
        sleep_forever
    fi
}

function sleep_forever {
    while true; do sleep 1000000; done
}

function to_dec {
    value=`echo $1 | awk '{print toupper($0)}'`
    echo "ibase=16; ${value}" | bc
}

main $@

realpath() {
    [[ $1 = /* ]] && echo "$1" || echo "$PWD/${1#./}"
}

realpath "$0"