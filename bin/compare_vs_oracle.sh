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
    usage_error "The <chain> argument must be provided, geth (Geth), oe (OpenEthereum) or erigon (Erigon) is supported"
  fi

  if [[ $1 != "geth" && $1 != "oe" && $1 != "erigon" ]]; then
    usage_error "The <chain> argument must be geth (Geth), oe (OpenEthereum) or erigon (Erigon)"
  fi

  chain="$1"; shift
  trap cleanup EXIT

  killall $anvil_bin &> /dev/null || true
  killall $geth_bin &> /dev/null || true
  killall $erigon_bin &> /dev/null || true
  killall $oe_bin &> /dev/null || true

  if [[ $chain == "anvil" ]]; then
      syncer_log="$syncer_anvil_log"
      syncer_firehose_log="$syncer_anvil_firehose_log"
  elif [[ $chain == "geth" ]]; then
      syncer_log="$syncer_geth_log"
      syncer_firehose_log="$syncer_geth_firehose_log"
  elif [[ $chain == "erigon" ]]; then
      syncer_log="$syncer_erigon_log"
      syncer_firehose_log="$syncer_erigon_firehose_log"
  else
      syncer_log="$syncer_oe_log"
      syncer_firehose_log="$syncer_oe_firehose_log"
  fi

  if [[ $skip_generation == false ]]; then
    recreate_data_directories oracle syncer_anvil syncer_geth syncer_oe syncer_erigon

    httpFlag="http"
    httpFlagPrefix="http."
    if `geth version 2>/dev/null | grep -Eq "1.9.10-(fh[0-9]+|dm)"`; then
      httpFlag="rpc"
      httpFlagPrefix="rpc"
    fi

    if [[ $chain == "geth" ]]; then
      # For the syncer to correctly work, it must uses the same genesis block `geth` data as what `oracle` uses
      # so let's ensure it's the case here.
      rm -rf "$syncer_geth_data_dir/geth" &> /dev/null || true
      cp -a "$oracle_data_dir/genesis" "$syncer_geth_data_dir/geth"
      cp -a "$oracle_data_dir/genesis/genesis.json" "$syncer_geth_data_dir"
      cp -a "$BOOT_DIR/static-nodes.json" "$syncer_geth_data_dir/geth"
    elif [[ $chain == "erigon" ]]; then
      rm -rf "$syncer_erigon_data_dir/erigon" &> /dev/null || true
      cp -a "$oracle_data_dir/genesis/genesis.json" "$syncer_erigon_data_dir"
    else
      # For the syncer to correctly work, it must uses the same chainspec as what `oracle` uses
      # so let's ensure it's the case here.
      cp "$oracle_data_dir/genesis/chainspec.json" "$syncer_oe_data_dir/chainspec.json"
    fi

    echo "Starting oracle (log `relpath $oracle_log`)"
    ($oracle_cmd \
        --syncmode="full" \
        --$httpFlag --${httpFlagPrefix}api="personal,eth,net,web3,txpool" \
        --allow-insecure-unlock \
        --mine=false \
        --port=30303 \
        --networkid=1515 \
        --nodiscover \
        --nocompaction $@ &> $oracle_log) &
    oracle_pid=$!

    monitor "oracle" $oracle_pid $parent_pid "$oracle_log" &

    if [[ $chain == "geth" ]]; then
      # We define it to a flag already defined otherwise the empty string is caught as an argument!
      authFlags="--networkid=1515"
      if [[ `is_authrpc_supported` == "true" ]]; then
        authFlags="--authrpc.port=9555"
      fi

      echo "Starting syncer process (log `relpath $syncer_log`)"
      ($syncer_geth_cmd \
          --firehose-enabled \
          --firehose-genesis-file="$syncer_geth_genesis_json" \
          --syncmode="full" \
          --$httpFlag --${httpFlagPrefix}api="personal,eth,net,web3" \
          --${httpFlagPrefix}port=8555 \
          --port=30313 \
          --networkid=1515 \
          "$authFlags" \
          --nodiscover $@ 1> $syncer_firehose_log 2> $syncer_log) &
      syncer_pid=$!
    elif [[ $chain == "erigon" ]]; then
      echo "Starting syncer process (log `relpath $syncer_log`)"
      ($syncer_erigon_cmd --firehose-enabled \
          --firehose-genesis-file="$syncer_erigon_genesis_json" \
           init $syncer_erigon_genesis_json $@ 1> $syncer_firehose_log 2> $syncer_log)
      ($syncer_erigon_cmd \
          --firehose-enabled \
          --firehose-genesis-file="$syncer_erigon_genesis_json" \
          --http \
          --http.port=8555 \
          --http.api=eth,erigon,web3,net,debug,trace,txpool,parity \
          --port=30313 \
          --chain=dev \
          --networkid=1515 \
          --authrpc.port=9555 \
          --prune=disabled \
          --staticpeers="enode://2c8f6d4764c3aca75696e18aeef683932a2bfa0be1603adb54f30dfad8e5cf2372a9d6eeb0e5caffba1fca22e12878c450e6ef09434888f04c6a97b6f50c75d4@127.0.0.1:30303" \
          --nodiscover $@ 1>> $syncer_firehose_log 2>> $syncer_log) &
      syncer_pid=$!
    else
      echo "Starting OpenEthereum syncer process (log `relpath $syncer_log`)"
      ($syncer_oe_cmd \
          --firehose-enabled \
          --chain="$syncer_oe_data_dir/chainspec.json" \
          --port=30313 \
          --network-id=1515 \
          --jsonrpc-port=8555 \
          --jsonrpc-apis=debug,web3,net,eth,parity,parity,parity_pubsub,parity_accounts,parity_set \
          $@ 1> $syncer_firehose_log 2> $syncer_log) &
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
      if [[ $chain == "geth" ]]; then
          echo 'admin.addPeer("enode://2c8f6d4764c3aca75696e18aeef683932a2bfa0be1603adb54f30dfad8e5cf2372a9d6eeb0e5caffba1fca22e12878c450e6ef09434888f04c6a97b6f50c75d4@127.0.0.1:30303")' | $geth_bin attach ${syncer_geth_data_dir}/geth.ipc >/dev/null 2>&1
      fi
      latest=`cat "$syncer_firehose_log" | grep -E "FIRE FINALIZE_BLOCK [0-9]+" | tail -n1 | grep -Eo [0-9]+`
      if [[ $latest -ge $blockNum ]]; then
        echo ""
        break
      fi

      echo "Giving 5s for syncer to complete syncing"
      sleep 5
    done
  fi

  echo "Statistics"
  echo " Blocks: `cat "$syncer_firehose_log" | grep "END_BLOCK" | wc -l | tr -d ' '`"
  echo " Trxs: `cat "$syncer_firehose_log" | grep "END_APPLY_TRX" | wc -l | tr -d ' '`"
  echo " Calls: `cat "$syncer_firehose_log" | grep "EVM_END_CALL" | wc -l | tr -d ' '`"
  echo ""
  echo " Account w/o Code: `cat "$syncer_firehose_log" | grep "ACCOUNT_WITHOUT_CODE" | wc -l | tr -d ' '`"
  echo " Balance Changes: `cat "$syncer_firehose_log" | grep "BALANCE_CHANGE" | wc -l | tr -d ' '`"
  echo " Created Accounts: `cat "$syncer_firehose_log" | grep "CREATED_ACCOUNT" | wc -l | tr -d ' '`"
  echo " Code Changes: `cat "$syncer_firehose_log" | grep "CODE_CHANGE" | wc -l | tr -d ' '`"
  echo " Event Logs: `cat "$syncer_firehose_log" | grep "ADD_LOG" | wc -l | tr -d ' '`"
  echo " Gas Changes: `cat "$syncer_firehose_log" | grep "GAS_CHANGE" | wc -l | tr -d ' '`"
  echo " Gas Events: `cat "$syncer_firehose_log" | grep "GAS_EVENT" | wc -l | tr -d ' '`"
  echo " Keccak Operations: `cat "$syncer_firehose_log" | grep "EVM_KECCAK" | wc -l | tr -d ' '`"
  echo " Nonce Changes: `cat "$syncer_firehose_log" | grep "NONCE_CHANGE" | wc -l | tr -d ' '`"
  echo " Suicide Changes: `cat "$syncer_firehose_log" | grep "SUICIDE_CHANGE" | wc -l | tr -d ' '`"
  echo " Storage Changes: `cat "$syncer_firehose_log" | grep "STORAGE_CHANGE" | wc -l | tr -d ' '`"
  echo ""

  echo "Inspect log files"
  echo " Oracle Firehose logs: cat `relpath "$oracle_firehose_log"`"
  echo " Syncer Firehose logs: cat `relpath "$syncer_firehose_log"`"
  echo ""
  echo " Oracle logs (geth): cat `relpath "$oracle_log"`"
  echo " Syncer logs (geth): cat `relpath "$syncer_log"`"
  echo ""

  if [[ $skip_comparison == false ]]; then
    echo "Launching blocks comparison task (and compiling Go code)"
    go mod tidy
    go run battlefield.go compare "$syncer_firehose_log"
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
  echo "Run a comparison between oracle reference files and a new Firehose version."
  echo "This scripts starts a non-mining miner and let a syncer with syncs with it."
  echo "It then runs necessary comparison between the old and new Firehose files to"
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
