#!/usr/bin/env bash

set -e

ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
GETH_BIN=${GETH_BIN:-"geth"}

miner_init_log="$ROOT/miner.init.log"
syncer_init_log="$ROOT/syncer.init.log"

miner_log="$ROOT/miner.log"
syncer_log="$ROOT/syncer.log"
deep_mind_log="$ROOT/deep-mind.log"

miner_data_dir="$ROOT/data/miner"
syncer_data_dir="$ROOT/data/syncer"

miner_geth_cmd="$GETH_BIN --datadir ${miner_data_dir}"
syncer_geth_cmd="$GETH_BIN --datadir ${syncer_data_dir}"

miner_pid=""
syncer_pid=""
current_dir=`pwd`

function cleanup {
    if [[ $miner_pid != "" ]]; then
        echo "Closing miner process"
        kill -s TERM $miner_pid || true
    fi

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

    $ROOT/contract/build.sh
    echo ""

    rm -rf "$miner_data_dir" "$syncer_data_dir"
    mkdir -p "$miner_data_dir/geth" "$syncer_data_dir/geth"

    cp -a "$ROOT/boot/keystore" "$miner_data_dir"
    cp -a "$ROOT/boot/nodekey" "$miner_data_dir/geth"

    cp -a "$ROOT/boot/keystore" "$syncer_data_dir"
    cp -a "$ROOT/boot/static-nodes.json" "$syncer_data_dir/geth"

    echo "Initializing nodes..."
    $miner_geth_cmd init "$ROOT"/boot/genesis.json 2> $miner_init_log
    $syncer_geth_cmd init "$ROOT"/boot/genesis.json 2> $syncer_init_log

    echo "Starting miner process"
    ($miner_geth_cmd \
        --rpc --rpcapi="personal,db,eth,net,web3,txpool,miner" \
        --allow-insecure-unlock \
        --mine \
        --miner.gastarget=1 \
        --miner.gastarget=94000000 \
        --miner.threads=1 \
        --networkid=1515 \
        --nodiscover \
        --nousb $@ 2> $miner_log) &
    miner_pid=$!

    echo "Starting syncer process"
    ($syncer_geth_cmd \
        --deep-mind \
        --rpc --rpcapi="personal,db,eth,net,web3" \
        --rpcport=8555 \
        --port=30313 \
        --networkid=1515 \
        --nodiscover \
        --nousb $@ 1> $deep_mind_log 2> $syncer_log) &
    syncer_pid=$!

    echo "Giving 5s for miner to be ready"
    sleep 5
    echo ""

    yarn -s start
    echo ""

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

    echo "Statistics"
    echo " Blocks: `cat "$deep_mind_log" | grep "END_BLOCK" | wc -l | tr -d ' '`"
    echo " Trxs: `cat "$deep_mind_log" | grep "END_APPLY_TRX" | wc -l | tr -d ' '`"
    echo " Calls: `cat "$deep_mind_log" | grep "EVM_END_CALL" | wc -l | tr -d ' '`"
    echo ""

    echo "Inspect log files"
    echo " Deep Mind logs: cat `realpath --relative-to="$current_dir" "$deep_mind_log"`"
    echo " Miner logs: cat `realpath --relative-to="$current_dir" "$miner_log"`"
    echo " Syncer logs: cat `realpath --relative-to="$current_dir" "$syncer_log"`"
    echo ""
}

function to_dec {
    value=`echo $1 | awk '{print toupper($0)}'`
    echo "ibase=16; ${value}" | bc
}

main $@
