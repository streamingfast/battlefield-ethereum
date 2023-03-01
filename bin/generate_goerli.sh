#!/usr/bin/env bash

ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && cd .. && pwd )"

source "$ROOT/bin/library.sh"

main() {
  pushd "$ROOT" &> /dev/null

  mkdir -p $ROOT/state &> /dev/null || true
  state_file="$ROOT/state/goerli-active.md"

  while getopts "hw" opt; do
    case $opt in
      h) usage && exit 0;;
      \?) usage_error "Invalid option: -$OPTARG";;
    esac
  done
  shift $((OPTIND-1))

  trap cleanup EXIT

  ./contract/build.sh
  echo ""

  echo "Executing transactions contained in script 'main.ts'"
  echo "## Goerli Last Run Log (`date`)" > $state_file
  echo "" >> $state_file
  echo "\`\`\`" >> $state_file

  yarn -s run goerli | tee -a $state_file
  echo ""
}

cleanup() {
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
  echo "usage: generate_goerli.sh"
  echo ""
  echo "Generate Battlefield transaction on Ethereum Goerli Tesnet"
  echo ""
  echo "Required Environment Variables"
  echo "    RPC_ENDPOINT    The url to use to reach the RPC endpoint so we can send transaction to it"
  echo "    FROM_ADDRESS    The address that sends all the battlefield transaction, PRIVATE_KEY must be able to sign for this address"
  echo "    PRIVATE_KEY     The private key to use to sign transaction, must be able to sign for FROM_ADDRESS"
  echo ""
  echo "Options"
  echo "    -h              Display help about this script"
}

main $@
