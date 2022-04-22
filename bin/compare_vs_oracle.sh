#!/usr/bin/env bash

ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && cd .. && pwd )"

source "$ROOT/bin/library.sh"

parent_pid="$$"
oracle_pid=""
syncer_pid=""
current_dir=`pwd`

main() {
  pushd "$ROOT" &> /dev/null

  skip_comparison=false
  skip_generation=false

  while getopts "hsn" opt; do
    case $opt in
      h) usage && exit 0;;
      s) skip_generation=true;;
      n) skip_comparison=true;;
      \?) usage_error "Invalid option: -$OPTARG";;
    esac
  done
  shift $((OPTIND-1))

  if [[ $1 == "" ]]; then
    usage_error "The <chain> argument must be provided, either geth (Geth) or oe (OpenEthereum)"
  fi

  if [[ $1 != "geth" && $1 != "oe" ]]; then
    usage_error "The <chain> argument must be either geth (Geth) or oe (OpenEthereum)"
  fi

  chain="$1"; shift
  trap cleanup EXIT

  killall $geth_bin &> /dev/null || true
  killall $oe_bin &> /dev/null || true

  if [[ $chain == "geth" ]]; then
      syncer_log="$syncer_geth_log"
      syncer_deep_mind_log="$syncer_geth_deep_mind_log"
  else
      syncer_log="$syncer_oe_log"
      syncer_deep_mind_log="$syncer_oe_deep_mind_log"
  fi

  if [[ $skip_generation == false ]]; then
    recreate_data_directories oracle syncer_geth syncer_oe

    if [[ $chain == "geth" ]]; then
      # For the syncer to correctly work, it must uses the same genesis block `geth` data as what `oracle` uses
      # so let's ensure it's the case here.
      rm -rf "$syncer_geth_data_dir/geth" &> /dev/null || true
      cp -a "$oracle_data_dir/genesis" "$syncer_geth_data_dir/geth"
      cp -a "$BOOT_DIR/static-nodes.json" "$syncer_geth_data_dir/geth"
    else
      # For the syncer to correctly work, it must uses the same chainspec as what `oracle` uses
      # so let's ensure it's the case here.
      cp "$oracle_data_dir/genesis/chainspec.json" "$syncer_oe_data_dir/chainspec.json"
    fi

    echo "Starting oracle (log `relpath $oracle_log`)"
    ($oracle_cmd \
        --syncmode="full" \
        --http --http.api="personal,eth,net,web3,txpool" \
        --allow-insecure-unlock \
        --mine=false \
        --miner.threads=0 \
        --port=30303 \
        --networkid=1515 \
        --nodiscover \
        --nocompaction $@ &> $oracle_log) &
    oracle_pid=$!

    monitor "oracle" $oracle_pid $parent_pid "$oracle_log" &

    if [[ $chain == "geth" ]]; then
      echo "Starting syncer process (log `relpath $syncer_log`)"
      ($syncer_geth_cmd \
          --firehose-deep-mind \
          --syncmode="full" \
          --http --http.api="personal,eth,net,web3" \
          --http.port=8555 \
          --port=30313 \
          --networkid=1515 \
          --nodiscover $@ 1> $syncer_deep_mind_log 2> $syncer_log) &
      syncer_pid=$!
    else
      echo "Starting OpenEthereum syncer process (log `relpath $syncer_log`)"
      ($syncer_oe_cmd \
          --firehose-deep-mind \
          --chain="$syncer_oe_data_dir/chainspec.json" \
          --port=30313 \
          --network-id=1515 \
          --jsonrpc-port=8555 \
          --jsonrpc-apis=debug,web3,net,eth,parity,parity,parity_pubsub,parity_accounts,parity_set \
          $@ 1> $syncer_deep_mind_log 2> $syncer_log) &
      syncer_pid=$!
    fi

    monitor "syncer" $syncer_pid $parent_pid "$syncer_log" &

    while true; do
      blockNumHex=`curl -s -X POST -H 'Content-Type: application/json' localhost:8545 --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' | jq -r .result | sed 's/0x//'`
      blockNum=`to_dec $blockNumHex`
      if [[ "$blockNum" -gt "0" ]]; then
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
      latest=`cat "$syncer_deep_mind_log" | grep -E "DMLOG FINALIZE_BLOCK [0-9]+" | tail -n1 | grep -Eo [0-9]+`
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
  echo " Account w/o Code: `cat "$syncer_deep_mind_log" | grep "ACCOUNT_WITHOUT_CODE" | wc -l | tr -d ' '`"
  echo " Balance Changes: `cat "$syncer_deep_mind_log" | grep "BALANCE_CHANGE" | wc -l | tr -d ' '`"
  echo " Created Accounts: `cat "$syncer_deep_mind_log" | grep "CREATED_ACCOUNT" | wc -l | tr -d ' '`"
  echo " Code Changes: `cat "$syncer_deep_mind_log" | grep "CODE_CHANGE" | wc -l | tr -d ' '`"
  echo " Event Logs: `cat "$syncer_deep_mind_log" | grep "ADD_LOG" | wc -l | tr -d ' '`"
  echo " Gas Changes: `cat "$syncer_deep_mind_log" | grep "GAS_CHANGE" | wc -l | tr -d ' '`"
  echo " Gas Events: `cat "$syncer_deep_mind_log" | grep "GAS_EVENT" | wc -l | tr -d ' '`"
  echo " Keccak Operations: `cat "$syncer_deep_mind_log" | grep "EVM_KECCAK" | wc -l | tr -d ' '`"
  echo " Nonce Changes: `cat "$syncer_deep_mind_log" | grep "NONCE_CHANGE" | wc -l | tr -d ' '`"
  echo " Suicide Changes: `cat "$syncer_deep_mind_log" | grep "SUICIDE_CHANGE" | wc -l | tr -d ' '`"
  echo " Storage Changes: `cat "$syncer_deep_mind_log" | grep "STORAGE_CHANGE" | wc -l | tr -d ' '`"
  echo ""

  echo "Inspect log files"
  echo " Oracle Deep Mind logs: cat `relpath "$oracle_deep_mind_log"`"
  echo " Syncer Deep Mind logs: cat `relpath "$syncer_deep_mind_log"`"
  echo ""
  echo " Oracle logs (geth): cat `relpath "$oracle_log"`"
  echo " Syncer logs (geth): cat `relpath "$syncer_log"`"
  echo ""

  if [[ $skip_comparison == false ]]; then
    echo "Launching blocks comparison task (and compiling Go code)"
    go mod tidy
    go run battlefield.go compare "$syncer_deep_mind_log"
  fi
}

cleanup() {
  kill_pid "oracle" $oracle_pid
  kill_pid "syncer" $syncer_pid

  # Clean up oracle changes
  git clean -xfd "$oracle_data_dir/geth" > /dev/null
  git restore "$oracle_data_dir/geth"

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
  echo "usage: compare_vs_oracle.sh [-s] [-n] <chain>"
  echo ""
  echo "The <chain> parameter must be either 'geth' (Geth) or 'oe' (OpenEthereum)."
  echo ""
  echo "Run a comparison between oracle reference files and a new Deep Mind version."
  echo "This scripts starts a non-mining miner and let a syncer with syncs with it."
  echo "It then runs necessary comparison between the old and new deep mind files to"
  echo "ensure we have the same output."
  echo ""
  echo "The oracle is always started with Geth, best version for Oracle is 1.9.10"
  echo "Geth 1.10+ is discouraged because OpenEthereum 2.7x - 3.0.x is unable to connect"
  echo "to it."
  echo ""
  echo "The syncer is conditionally started based on the chain parameter received either"
  echo "geth for Geth or oe for OpenEthereum."
  echo ""
  echo "Options"
  echo "    -s          Skip syncer/miner launching and only run comparison (useful when developing 'battlefield.go')"
  echo "    -n          Dry-run by not running any comparison code, exit right away once syncing has completed"
  echo "    -h          Display help about this script"
}

main "$@"
