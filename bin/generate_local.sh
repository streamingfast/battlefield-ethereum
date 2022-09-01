#!/usr/bin/env bash

ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && cd .. && pwd )"

source "$ROOT/bin/library.sh"

parent_pid="$$"
miner_pid=""
syncer_geth_pid=""
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

  set -e
  killall $geth_bin &> /dev/null || true

  recreate_data_directories miner syncer_geth syncer_oe

  is_legacy_geth="`is_geth_version $geth_bin 'Version: 1.9.1[0-3]'`"

  miner_version_dependent_args="--http --http.api=personal,eth,net,web3,txpool,miner"
  syncer_version_dependent_args="--http --http.api=personal,eth,net,web3 --http.port=8555"

  if [[ "$is_legacy_geth" == "true" ]]; then
    miner_version_dependent_args="--rpc --rpcapi=personal,eth,net,web3,txpool,miner"
    syncer_version_dependent_args="--rpc --rpcapi=personal,eth,net,web3 --rpcport=8555"
  fi

  echo "Starting miner process (log `relpath $miner_log`)"
  if [[ $component == "all" || $component == "miner_only" ]]; then
    ($miner_cmd \
      $miner_version_dependent_args \
      --allow-insecure-unlock \
      --mine \
      --miner.threads=1 \
      --port=30303 \
      --networkid=1515 \
      --nodiscover $@ 1> $miner_deep_mind_log 2> $miner_log) &
    miner_pid=$!

    monitor "miner" $miner_pid $parent_pid "$miner_log" &
  fi

  echo "Starting Geth syncer process (log `relpath $syncer_geth_log`)"
  if [[ $component == "all" || $component == "syncer_only" ]]; then
    ($syncer_geth_cmd \
      $syncer_version_dependent_args \
      --firehose-enabled \
      --firehose-genesis-file="$syncer_geth_genesis_json" \
      --syncmode="full" \
      --port=30313 \
      --networkid=1515 \
      --nodiscover $@ 1> $syncer_geth_deep_mind_log 2> $syncer_geth_log) &
    syncer_geth_pid=$!

    monitor "syncer_geth" $syncer_geth_pid $parent_pid "$syncer_geth_log" &
  fi

  echo "Giving 5s for miner to be ready"
  sleep 5
  echo ""

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
      ETHQ_URL=http://localhost:8080 yarn -s local | tee -a $log_file
      echo "\`\`\`" >> $log_file
    else
      yarn -s local
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
    latest=`cat "$syncer_geth_log" | grep -E "Imported new chain segment" | tail -n1 | grep -Eo number=[0-9]+ | grep -Eo [0-9]+`
    if [[ $latest -ge $blockNum ]]; then
      echo ""
      break
    fi

    echo "Giving 5s for syncer to complete syncing"
    sleep 5
  done

  echo "Statistics"
  echo " Blocks: `cat "$syncer_geth_deep_mind_log" | grep "END_BLOCK" | wc -l | tr -d ' '`"
  echo " Trxs: `cat "$syncer_geth_deep_mind_log" | grep "END_APPLY_TRX" | wc -l | tr -d ' '`"
  echo " Calls: `cat "$syncer_geth_deep_mind_log" | grep "EVM_END_CALL" | wc -l | tr -d ' '`"
  echo ""
  echo " Balance Changes: `cat "$syncer_geth_deep_mind_log" | grep "BALANCE_CHANGE" | wc -l | tr -d ' '`"
  echo " Event Logs: `cat "$syncer_geth_deep_mind_log" | grep "ADD_LOG" | wc -l | tr -d ' '`"
  echo " Gas Changes: `cat "$syncer_geth_deep_mind_log" | grep "GAS_CHANGE" | wc -l | tr -d ' '`"
  echo " Gas Events: `cat "$syncer_geth_deep_mind_log" | grep "GAS_EVENT" | wc -l | tr -d ' '`"
  echo " Nonce Changes: `cat "$syncer_geth_deep_mind_log" | grep "NONCE_CHANGE" | wc -l | tr -d ' '`"
  echo " Storage Changes: `cat "$syncer_geth_deep_mind_log" | grep "STORAGE_CHANGE" | wc -l | tr -d ' '`"
  echo ""

  echo "Inspect log files"
  echo " Deep Mind logs: cat `relpath "$syncer_geth_deep_mind_log"`"
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
  kill_pid "syncer" $syncer_geth_pid

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
  echo "usage: generate_local.sh [-w] [-l <logFile>]"
  echo ""
  echo ""
  echo "Options"
  echo "    -h          Display help about this script"
  echo "    -w          Wait forever once all transactions have been included instead of quitting, useful for debugging purposes"
  echo "    -l <file>   The execution log file to produce when locally executing the transaction"
}

main "$@"
