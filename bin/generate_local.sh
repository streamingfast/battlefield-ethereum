ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && cd .. && pwd )"

source "$ROOT/bin/library.sh"

parent_pid="$$"
miner_pid=""
syncer_pid=""
current_dir=`pwd`

main() {
  pushd "$ROOT" &> /dev/null

  component="all"
  wait_forever=

  while getopts "hw" opt; do
    case $opt in
      h) usage && exit 0;;
      w) wait_forever=true;;
      \?) usage_error "Invalid option: -$OPTARG";;
    esac
  done
  shift $((OPTIND-1))

  trap cleanup EXIT

  if [[ $1 == "miner_only" || $1 == "syncer_only" ]]; then
    component=$1; shift
  fi

  killall $geth_bin &> /dev/null || true

  recreate_data_directories miner syncer

  echo "Starting miner process (log `realpath $miner_log`)"
  if [[ $component == "all" || $component == "miner_only" ]]; then
    ($miner_cmd \
      --rpc --rpcapi="personal,db,eth,net,web3,txpool,miner" \
      --allow-insecure-unlock \
      --mine \
      --miner.gastarget=1 \
      --miner.gastarget=94000000 \
      --miner.threads=1 \
      --networkid=1515 \
      --nodiscover \
      --nousb $@ 1> $miner_deep_mind_log 2> $miner_log) &
    miner_pid=$!

    monitor "miner" $miner_pid $parent_pid "$miner_log" &
  fi

  echo "Starting syncer process (log `realpath $syncer_log`)"
  if [[ $component == "all" || $component == "syncer_only" ]]; then
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
  fi

  echo "Giving 5s for miner to be ready"
  sleep 5
  echo ""

  if [[ $component == "all" || $component == "miner_only" ]]; then
    echo "Executing transactions contained in script 'main.ts'"
    yarn -s local
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
    result=`cat "$syncer_log" | grep -E "Imported new chain segment.*number=$blockNum"`
    if [[ $result != "" ]]; then
      echo ""
      break
    fi

    echo "Giving 5s for syncer to complete syncing"
    sleep 5
  done

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
  echo " Deep Mind logs: cat `realpath "$syncer_deep_mind_log"`"
  echo " Miner logs: cat `realpath "$miner_log"`"
  echo " Syncer logs: cat `realpath "$syncer_log"`"
  echo ""

  if [[ $wait_forever == "true" ]]; then
    echo "Sleeping forever"
    sleep_forever
  fi
}

cleanup() {
  kill_pid "miner" $miner_pid
  kill_pid "syncer" $syncer_pid

  # Let's kill everything else
  kill $( jobs -p ) &> /dev/null
  exit 0
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
  echo "usage: generate_local.sh"
  echo ""
  echo ""
  echo "Options"
  echo "    -h          Display help about this script"
  echo "    -w          Wait forever once all transactions have been included instead of quitting, useful for debugging purposes"
}

main "$@"