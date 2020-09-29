ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && cd .. && pwd )"

source "$ROOT/bin/library.sh"

miner_pid=""

main() {
  pushd "$ROOT" &> /dev/null

  mkdir -p $ROOT/state &> /dev/null || true
  state_file="$ROOT/state/dev1-active.md"

  while getopts "hw" opt; do
    case $opt in
      h) usage && exit 0;;
      \?) usage_error "Invalid option: -$OPTARG";;
    esac
  done
  shift $((OPTIND-1))

  if [[ $1 == "bootstrap" ]]; then
    execute_bootstrap
  else
    execute_remote
  fi
}

execute_bootstrap() {
  trap cleanup_bootstrap EXIT

  recreate_data_directories miner

  echo "Starting miner process (log `realpath $miner_log`)"
  ($miner_cmd \
        --rpc --rpcapi="personal,eth,net,web3,txpool,miner" \
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
  monitor_pid=$!

  echo "Giving 5s for miner to be ready"
  sleep 5
  echo ""

  set -e
  echo "Executing transactions contained in script 'main.ts'"
  unset FROM_ADDRESS RPC_ENDPOINT PRIVATE_KEY
  yarn -s local

  kill -s TERM $monitor_pid
  kill_pid "miner" $miner_pid
  miner_pid=

  echo ""
  echo "Compression bootstrap data and sending it to remote storage"
  cd $miner_data_dir
  tar -cf bootstrap.tar --exclude nodekey * > /dev/null
  zstd -14 bootstrap.tar &> /dev/null

  gsutil cp bootstrap.tar.zst gs://dfuseio-global-seed-us/eth-dev1/bootstrap.tar.zst &> /dev/null
}

execute_remote() {
  trap cleanup_remote EXIT

  ./contract/build.sh
  echo ""

  echo "Executing transactions contained in script 'main.ts'"
  echo "## Dev1 Last Run Log (`date`)" > $state_file
  echo "" >> $state_file
  echo "\`\`\`" >> $state_file

  yarn -s run dev1 | tee -a $state_file
  echo ""
}

cleanup_bootstrap() {
  kill_pid "miner" $miner_pid

  # Let's kill everything else
  kill $( jobs -p ) &> /dev/null
}

cleanup_remote() {
  echo "\`\`\`" >> $state_file

  echo ""
  echo "Last run output has been saved to '$state_file' file."
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
  echo "usage: generate_dev1.sh [bootstrap]"
  echo ""
  echo "Generate Battlefield transaction on dfuse Ethereum Tesnet (dev1). If the"
  echo "'bootstrap' option is used, we generate transaction locally, package that"
  echo "into a single archive "
  echo ""
  echo "Environment Variables (required when **not** doing 'bootstrap')"
  echo "    RPC_ENDPOINT    The url to use to reach the RPC endpoint so we can send transaction to it"
  echo "    FROM_ADDRESS    The address that sends all the battlefield transaction, PRIVATE_KEY must be able to sign for this address"
  echo "    PRIVATE_KEY     The private key to use to sign transaction, must be able to sign for FROM_ADDRESS"
  echo ""
  echo "Options"
  echo "    -h              Display help about this script"
}

main $@
