#!/usr/bin/env bash

if [[ "$DEBUG" == "true" ]]; then
  set -x
fi

ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && cd .. && pwd )"

source "$ROOT/bin/library.sh"

miner_pid=""

main() {
  working_directory=`pwd`
  pushd "$ROOT" &> /dev/null

  mkdir -p $ROOT/state &> /dev/null || true

  while getopts "h" opt; do
    case $opt in
      h) usage && exit 0;;
      \?) usage_error "Invalid option: -$OPTARG";;
    esac
  done
  shift $((OPTIND-1))

  trap cleanup EXIT

  bootstrap_log_file="$bootstrap_data_dir/bootstrap.md"
  copy_to=""

  if [[ $# -gt 0 ]]; then
    copy_to="$1"; shift
  fi

  recreate_data_directories miner bootstrap

  echo "Starting miner process (log `relpath $miner_log`)"
  ($miner_cmd \
        --http --http.api="personal,eth,net,web3,txpool,miner" \
        --allow-insecure-unlock \
        --mine \
        --port=30303 \
        --networkid=1515 \
        --nodiscover $@ 1> $miner_firehose_log 2> $miner_log) &
  miner_pid=$!

  monitor "miner" $miner_pid $parent_pid "$miner_log" &
  monitor_pid=$!

  echo "Giving 5s for miner to be ready"
  sleep 5
  echo ""

  set -e
  echo "Executing transactions contained in script 'main.ts'"
  unset FROM_ADDRESS RPC_ENDPOINT PRIVATE_KEY

  echo "## ${target} Bootstrap Log (`date`)" > $bootstrap_log_file
  echo "" >> $bootstrap_log_file
  echo "\`\`\`" >> $bootstrap_log_file
  yarn -s local | tee -a $bootstrap_log_file
  echo "\`\`\`" >> $bootstrap_log_file

  kill -s TERM $monitor_pid
  kill_pid "miner" $miner_pid
  miner_pid=

  echo ""
  echo "Compressing bootstrap data"

  pushd "$KEYSTORE_DIR" &> /dev/null
    zip $miner_data_dir/keystore.zip * 1> /dev/null
  popd &> /dev/null

  cd $miner_data_dir
  tar -cf bootstrap.tar --exclude nodekey * 1> /dev/null
  zstd -14 bootstrap.tar &> /dev/null

  cp bootstrap.tar.zst "$bootstrap_data_dir"
  cp "$miner_data_dir/keystore.zip" "$bootstrap_data_dir"
  cp "$BOOT_DIR/genesis.json" "$bootstrap_data_dir"
  cp "$BOOT_DIR/keystore.md" "$bootstrap_data_dir"

  if [[ "$copy_to" != "" ]]; then
    echo "About to copy bootstrap files to $copy_to"
    sleep 2

    cp "$bootstrap_log_file" "$working_directory/$copy_to/bootstrap.md"
    cp "bootstrap.tar.zst" "$working_directory/$copy_to/miner/bootstrap.tar.zst"
    cp "$BOOT_DIR/keystore.md" "$working_directory/$copy_to/miner/keystore.md"

    rm -rf "$working_directory/$copy_to/miner/keystore"
    cp -R "$KEYSTORE_DIR" "$working_directory/$copy_to/miner/keystore"

    cp "$BOOT_DIR/genesis.json" "$working_directory/$copy_to/mindreader/genesis.json"
  fi
}

cleanup() {
  kill_pid "miner" $miner_pid

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
  echo "usage: generate_chain.sh [<copy_to>]"
  echo ""
  echo "Generate Battlefield transaction locally and package Geth"
  echo "data set into a single archive usable with 'fireeth' to bootstrap a chain."
  echo ""
  echo "If '<copy_to>' argument is passed, copy over the files to this folder,"
  echo "assuming the folder layout is the one used to bootstrap 'fireeth' chain."
  echo ""
  echo "Options"
  echo "    -h              Display help about this script"
}

main $@
