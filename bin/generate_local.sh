#!/usr/bin/env bash

ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && cd .. && pwd )"

source "$ROOT/bin/library.sh"

parent_pid="$$"
miner_pid=""
syncer_anvil_pid=""
syncer_pid=""
current_dir=`pwd`
log_file=""

main() {
  pushd "$ROOT" &> /dev/null

  component="all"
  wait_forever=

  while getopts "hwl:" opt; do
    case $opt in
      h) usage && exit 0;;
      w) wait_forever=true;;
      l) log_file="$OPTARG";;
      \?) usage_error "Invalid option: -$OPTARG";;
    esac
  done
  shift $((OPTIND-1))

  trap cleanup EXIT

  if [[ $1 == "miner_only" || $1 == "syncer_only" ]]; then
    component=$1; shift
  fi

  chain="geth"
  if [[ "$1" != "" ]]; then
    chain="$1"; shift
  fi

  if [[ $chain == "anvil" ]]; then
      syncer_cmd="$syncer_anvil_cmd"
      syncer_log="$syncer_anvil_log"
      syncer_firehose_log="$syncer_anvil_firehose_log"
  elif [[ $chain == "geth" ]]; then
      syncer_cmd="$syncer_geth_cmd"
      syncer_log="$syncer_geth_log"
      syncer_firehose_log="$syncer_geth_firehose_log"
      syncer_genesis_json="$syncer_geth_genesis_json"
  elif [[ $chain == "polygon" ]]; then
      syncer_cmd="$syncer_polygon_cmd"
      syncer_log="$syncer_polygon_log"
      syncer_firehose_log="$syncer_polygon_firehose_log"
      syncer_genesis_json="$syncer_polygon_genesis_json"
  elif [[ $chain == "erigon" ]]; then
      syncer_cmd="$syncer_erigon_cmd"
      syncer_log="$syncer_erigon_log"
      syncer_firehose_log="$syncer_erigon_firehose_log"
  else
      usage_error "The <chain> argument must be geth, polygon or erigon are supported"
  fi

  set -e
  if [[ "$chain" == "geth" ]]; then
    killall $geth_bin &> /dev/null || true

    recreate_data_directories miner syncer_geth

    is_legacy_geth="`is_version $geth_bin 'Version: (1.9.[0-9]+|1.10.[0-1])'`"

    miner_version_dependent_args="--http --http.api=personal,eth,net,web3,txpool,miner"
    syncer_version_dependent_args="--http --http.api=personal,eth,net,web3 --http.port=8555 --authrpc.port=9669"

    if [[ "$is_legacy_geth" == "true" ]]; then
      miner_version_dependent_args="--rpc --rpcapi=personal,eth,net,web3,txpool,miner"
      syncer_version_dependent_args="--rpc --rpcapi=personal,eth,net,web3 --rpcport=8555"
    fi

    if [[ $component == "all" || $component == "miner_only" ]]; then
      echo "Starting miner process (log `relpath $miner_log`)"

      ($miner_cmd \
        $miner_version_dependent_args \
        --allow-insecure-unlock \
        --keystore="/Users/maoueh/work/sf/ethereum.battlefield/run/data/miner/keystore" \
        --unlock=821b55d8abe79bc98f05eb675fdc50dfe796b7ab \
        --password="/Users/maoueh/work/sf/ethereum.battlefield/run/data/miner/keystore/passphrase.txt" \
        --mine \
        --port=30303 \
        --networkid=1515 \
        --nodiscover --verbosity 4 $@ 1> $miner_firehose_log 2> $miner_log) &
      miner_pid=$!

      monitor "miner" $miner_pid $parent_pid "$miner_log" &
    fi

    if [[ $component == "all" || $component == "syncer_only" ]]; then
        echo "Starting syncer process (log `relpath $syncer_log`)"

        ($syncer_cmd \
          $syncer_version_dependent_args \
          --firehose-enabled \
          --firehose-genesis-file="$syncer_genesis_json" \
          --syncmode="full" \
          --port=30313 \
          --networkid=1515 \
          --nodiscover --verbosity 4 $@ 1> $syncer_firehose_log 2> $syncer_log) &
        syncer_pid=$!
    fi
  elif [[ "$chain" == "polygon" ]]; then
    killall $polygon_bin &> /dev/null || true

    recreate_data_directories miner syncer_polygon

    is_legacy_polygon="`is_version $polygon_bin 'Version: 0.3.7-stable-fh2'`"

    miner_version_dependent_args="server"
    syncer_version_dependent_args="server"

    if [[ "$is_legacy_polygon" == "true" ]]; then
      miner_version_dependent_args=""
      syncer_version_dependent_args=""
    fi

    if [[ $component == "all" || $component == "miner_only" ]]; then
      echo "Starting polygon miner process (log `relpath $miner_log`)"

      ($miner_polygon_cmd \
        $miner_version_dependent_args \
        --http --http.api=personal,eth,net,web3,txpool,miner \
        --allow-insecure-unlock \
        --keystore="/Users/maoueh/work/sf/ethereum.battlefield/run/data/miner/keystore" \
        --unlock=821b55d8abe79bc98f05eb675fdc50dfe796b7ab \
        --password="/Users/maoueh/work/sf/ethereum.battlefield/run/data/miner/keystore/passphrase.txt" \
        --mine \
        --port=30303 \
        --networkid=1515 \
        --nodiscover --verbosity 4 $@ 1> $miner_firehose_log 2> $miner_log) &
      miner_pid=$!

      monitor "miner" $miner_pid $parent_pid "$miner_log" &
    fi

    if [[ $component == "all" || $component == "syncer_only" ]]; then
        echo "Starting polygon syncer process (log `relpath $syncer_log`)"

        echo "Value of dependents args: $syncer_version_dependent_args"
        ($syncer_cmd \
          $syncer_version_dependent_args \
          --http --http.api=personal,eth,net,web3 --http.port=8555 --authrpc.port=9669 \
          --firehose-enabled \
          --firehose-genesis-file="$syncer_genesis_json" \
          --syncmode="full" \
          --port=30313 \
          --networkid=1515 \
          --nodiscover --verbosity 4 $@ 1> $syncer_firehose_log 2> $syncer_log) &
        syncer_pid=$!
    fi

  elif [[ "$chain" == "anvil" ]]; then
    killall "$anvil_bin" &> /dev/null || true

    recreate_data_directories syncer_anvil

    ($syncer_cmd \
        --firehose-enabled \
        $@ 1> $syncer_log 2> $syncer_firehose_log) &
    syncer_pid=$!
  fi

  monitor "syncer" $syncer_pid $parent_pid "$syncer_log" &

  echo "Giving 5s for miner to be ready"
  sleep 5
  echo ""

  if [[ $chain == "anvil" ]]; then
    exit 1
  fi

  if [[ $component == "all" || $component == "miner_only" ]]; then
    echo "Executing transactions contained in script 'main.ts'"

    if [[ "$log_file" != "" ]]; then
      echo "## Transaction Log (`date`)" > $log_file
      echo "" >> $log_file
      echo "\`\`\`" >> $log_file
      $geth_bin version 2>/dev/null 1>> $log_file
      echo "\`\`\`" >> $log_file

      echo "" >> $log_file
      echo "\`\`\`" >> $log_file
    fi

    if [[ "$log_file" != "" ]]; then
      ETHQ_URL=http://localhost:8080 npm run -s local | tee -a $log_file
      echo "\`\`\`" >> $log_file
    else
      npm run -s local
    fi

    echo ""
  fi

  if [[ $component == "miner_only" ]]; then
    echo "Miner sleeping forever"
    sleep_forever
  fi

  blockNumHex=`curl -s -X POST -H 'Content-Type: application/json' localhost:8545 --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' | jq -r .result | sed s/0x//`
  blockNum=`to_dec $blockNumHex`

  echo "Waiting for syncer to reach block #$blockNum"

  set +e
  while true; do
    # Sometimes, syncing group blocks together so we miss our wanted value, let's use arithmetic to be sure
    latest=`cat "$syncer_log" | grep -E "Imported new chain segment" | tail -n1 | grep -Eo number=[0-9]+ | grep -Eo [0-9]+`
    if [[ $latest -ge $blockNum ]]; then
      echo ""
      break
    fi

    echo "Giving 5s for syncer to complete syncing"
    sleep 5
  done

  echo "Statistics"
  echo " Blocks: `cat "$syncer_firehose_log" | grep "END_BLOCK" | wc -l | tr -d ' '`"
  echo " Trxs: `cat "$syncer_firehose_log" | grep "END_APPLY_TRX" | wc -l | tr -d ' '`"
  echo " Calls: `cat "$syncer_firehose_log" | grep "EVM_END_CALL" | wc -l | tr -d ' '`"
  echo ""
  echo " Balance Changes: `cat "$syncer_firehose_log" | grep "BALANCE_CHANGE" | wc -l | tr -d ' '`"
  echo " Event Logs: `cat "$syncer_firehose_log" | grep "ADD_LOG" | wc -l | tr -d ' '`"
  echo " Gas Changes: `cat "$syncer_firehose_log" | grep "GAS_CHANGE" | wc -l | tr -d ' '`"
  echo " Gas Events: `cat "$syncer_firehose_log" | grep "GAS_EVENT" | wc -l | tr -d ' '`"
  echo " Nonce Changes: `cat "$syncer_firehose_log" | grep "NONCE_CHANGE" | wc -l | tr -d ' '`"
  echo " Storage Changes: `cat "$syncer_firehose_log" | grep "STORAGE_CHANGE" | wc -l | tr -d ' '`"
  echo ""

  echo "Inspect log files"
  echo " Firehose logs: cat `relpath "$syncer_firehose_log"`"
  echo " Miner logs: cat `relpath "$miner_log"`"
  echo " Syncer logs: cat `relpath "$syncer_geth_log"`"
  echo ""

  if [[ $wait_forever == "true" ]]; then
    echo "Sleeping forever"
    sleep_forever
  fi
}

cleanup() {
  kill_pid "miner" $miner_pid
  kill_pid "syncer_geth" $syncer_pid
  kill_pid "syncer_anvil" $syncer_anvil_pid

  # Let's kill everything else
  kill $( jobs -p ) &> /dev/null
}

usage_error() {
  message="$1"
  exit_code="$2"

  echo "ERROR: $message"
  echo ""
  usage
  exit ${exit_code:-1}
}

usage() {
  echo "usage: generate_local.sh [-w] [-l <logFile>] [<component>] [<chain>]"
  echo ""
  echo ""
  echo "Options"
  echo "    -h          Display help about this script"
  echo "    -w          Wait forever once all transactions have been included instead of quitting, useful for debugging purposes"
  echo "    -l <file>   The execution log file to produce when locally executing the transaction"
}

main "$@"
