#!/usr/bin/env bash

ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && cd .. && pwd )"

source "$ROOT/bin/library.sh"

parent_pid="$$"
oracle_pid=""
syncer_pid=""
current_dir=`pwd`

main() {
  pushd "$ROOT" &> /dev/null

  skip_generation=

  while getopts "hs" opt; do
    case $opt in
      h) usage && exit 0;;
      s) skip_generation=true;;
      \?) usage_error "Invalid option: -$OPTARG";;
    esac
  done
  shift $((OPTIND-1))

  trap cleanup EXIT

  killall $geth_bin &> /dev/null || true

  if [[ $skip_generation == "" ]]; then
    recreate_data_directories oracle syncer

    # For the syncer to correctly work, it must uses the same genesis block `geth` data as what `oracle` uses
    # so let's ensure it's the case here.
    rm -rf "$syncer_data_dir/geth" &> /dev/null || true
    cp -a "$oracle_data_dir/genesis" "$syncer_data_dir/geth"
    cp -a "$BOOT_DIR/static-nodes.json" "$syncer_data_dir/geth"

    echo "Starting oracle (log `realpath $oracle_log`)"
    ($oracle_cmd \
        --rpc --rpcapi="personal,db,eth,net,web3,txpool" \
        --allow-insecure-unlock \
        --mine=false \
        --miner.gastarget=1 \
        --miner.gastarget=94000000 \
        --miner.threads=0 \
        --networkid=1515 \
        --nodiscover \
        --nocompaction \
        --nousb $@ 1> /dev/null 2> $oracle_log) &
    oracle_pid=$!

    monitor "oracle" $oracle_pid $parent_pid "$oracle_log" &

    echo "Starting syncer process (log `realpath $syncer_log`)"
    ($syncer_cmd \
        --deep-mind \
        --rpc --rpcapi="personal,db,eth,net,web3" \
        --rpcport=8555 \
        --port=30313 \
        --networkid=1515 \
        --nodiscover \
        --nousb $@ 1> $syncer_deep_mind_log 2> $syncer_log) &
    syncer_pid=$!

    monitor "syncer" $syncer_pid $parent_pid "$syncer_log" &

    while true; do
      blockNumHex=`curl -s -X POST -H 'Content-Type: application/json' localhost:8545 --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' | jq -r .result | sed s/0x//`
      blockNum=`to_dec $blockNumHex`
      if [[ $blockNum -gt "0" ]]; then
        echo "Oracle ready"
        echo ""
        break
      fi

      echo "Giving 5s for oracle to start completely"
      sleep 5
    done

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
  fi

  echo "Statistics"
  echo " Blocks: `cat "$syncer_deep_mind_log" | grep "END_BLOCK" | wc -l | tr -d ' '`"
  echo " Trxs: `cat "$syncer_deep_mind_log" | grep "END_APPLY_TRX" | wc -l | tr -d ' '`"
  echo " Calls: `cat "$syncer_deep_mind_log" | grep "EVM_END_CALL" | wc -l | tr -d ' '`"
  echo ""
  echo " Balance Changes: `cat "$syncer_deep_mind_log" | grep "BALANCE_CHANGE" | wc -l | tr -d ' '`"
  echo " Event Logs: `cat "$syncer_deep_mind_log" | grep "ADD_LOG" | wc -l | tr -d ' '`"
  echo " Gas Changes: `cat "$syncer_deep_mind_log" | grep "GAS_CHANGE" | wc -l | tr -d ' '`"
  echo " Gas Events: `cat "$syncer_deep_mind_log" | grep "GAS_EVENT" | wc -l | tr -d ' '`"
  echo " Nonce Changes: `cat "$syncer_deep_mind_log" | grep "NONCE_CHANGE" | wc -l | tr -d ' '`"
  echo " Storage Changes: `cat "$syncer_deep_mind_log" | grep "STORAGE_CHANGE" | wc -l | tr -d ' '`"
  echo ""

  echo "Inspect log files"
  echo " Oracle Deep Mind logs: cat `realpath "$oracle_deep_mind_log"`"
  echo " Syncer Deep Mind logs: cat `realpath "$syncer_deep_mind_log"`"
  echo ""
  echo " Oracle logs (geth): cat `realpath "$oracle_log"`"
  echo " Syncer logs (geth): cat `realpath "$syncer_log"`"
  echo ""

  echo "Launching blocks comparison task (and compiling Go code)"
  go run battlefield.go compare
}

cleanup() {
  kill_pid "oracle" $oracle_pid
  kill_pid "syncer" $syncer_pid

  # Clean up oracle changes
  git clean -xfd $oracle_data_dir/geth > /dev/null
  git restore $oracle_data_dir/geth

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
  echo "usage: compare.sh [-s]"
  echo ""
  echo "Run a comparison between oracle reference files and a new Deep Mind version."
  echo "This scripts starts a non-mining miner and let a syncer with syncs with it."
  echo "It then runs necessary comparison between the old and new deep mind files to"
  echo "ensure we have the same output."
  echo ""
  echo "Options"
  echo "    -s          Skip syncer/miner launching and only run comparison (useful when developing battlefield)"
  echo "    -h          Display help about this script"
}

main "$@"
