#!/usr/bin/env bash

ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && cd .. && pwd )"

source "$ROOT/bin/library.sh"

miner_pid=""
skip_upload=

main() {
  pushd "$ROOT" &> /dev/null

  mkdir -p $ROOT/state &> /dev/null || true

  bootstrap_state_file="$ROOT/state/dev1-bootstrap-active.md"
  remote_state_file="$ROOT/state/dev1-active.md"

  while getopts "hs" opt; do
    case $opt in
      h) usage && exit 0;;
      s) skip_upload=true;;
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

  recreate_data_directories miner bootstrap

  echo "Starting miner process (log `relpath $miner_log`)"
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

  echo "## Dev1 Bootstrap Log (`date`)" > $bootstrap_state_file
  echo "" >> $bootstrap_state_file
  echo "\`\`\`" >> $bootstrap_state_file
  ETHQ_URL=https://dev1-eth.ethq.dfuse.dev yarn -s local | tee -a $bootstrap_state_file
  echo "\`\`\`" >> $bootstrap_state_file

  kill -s TERM $monitor_pid
  kill_pid "miner" $miner_pid
  miner_pid=

  echo ""
  echo "Compression bootstrap data"

  pushd $KEYSTORE_DIR &> /dev/null
    zip $miner_data_dir/keystore.zip * &> /dev/null
  popd &> /dev/null

  cd $miner_data_dir
  tar -cf bootstrap.tar --exclude nodekey * > /dev/null
  zstd -14 bootstrap.tar &> /dev/null

  cp $bootstrap_state_file "$bootstrap_data_dir" &> /dev/null
  cp bootstrap.tar.zst "$bootstrap_data_dir" &> /dev/null
  cp keystore.zip "$bootstrap_data_dir" &> /dev/null
  cp $BOOT_DIR/genesis.json "$bootstrap_data_dir" &> /dev/null
  cp $BOOT_DIR/keystore.md "$bootstrap_data_dir" &> /dev/null

  if [[ $skip_upload == "" ]]; then
    echo "Uploading bootstrap data "
    gsutil cp * gs://dfuseio-global-seed-us/eth-dev1/ &> /dev/null
  fi
}

execute_remote() {
  trap cleanup_remote EXIT

  ./contract/build.sh
  echo ""

  echo "Executing transactions contained in script 'main.ts'"
  echo "## Dev1 Last Run Log (`date`)" > $remote_state_file
  echo "" >> $remote_state_file
  echo "\`\`\`" >> $remote_state_file

  yarn -s run dev1 | tee -a $remote_state_file
  echo ""
}

cleanup_bootstrap() {
  kill_pid "miner" $miner_pid

  # Let's kill everything else
  kill $( jobs -p ) &> /dev/null
}

cleanup_remote() {
  echo "\`\`\`" >> $remote_state_file

  echo ""
  echo "Last run output has been saved to '$remote_state_file' file."
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
  echo "usage: generate_dev1.sh [-s] [bootstrap]"
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
  echo "    -s              Skip upload of files when bootstrapping, keep them local for later consumption"
}

main $@
