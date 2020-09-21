#!/usr/bin/env bash

set -e

ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && cd .. && pwd )"

source "${ROOT}/bin/library.sh"

main() {
  pushd "$ROOT" &> /dev/null

  genesis_block=

  while getopts "ho:b" opt; do
    case $opt in
      h) usage && exit 0;;
      b) genesis_block=true;;
      \?) usage_error "Invalid option: -$OPTARG";;
    esac
  done
  shift $((OPTIND-1))

  echo -n "This will delete existing wallets, continue (y/n)? "
  read answer

  if [[ "$answer" != "y" && "$answer" != "Y" ]]; then
      exit 0
  fi

  recreate_boot_directories $genesis_block
  echo "" > $genesis_log

  if [[ $genesis_block == "" ]]; then
    echo "Generating public keys"
    printf "" > "$KEYSTORE_DIR"/passphrase.txt

    log "Account #1"
    $geth_bin account new --keystore "$KEYSTORE_DIR" --password "$KEYSTORE_DIR/passphrase.txt" >> $genesis_log 2>&1

    log "Account #2"
    $geth_bin account new --keystore "$KEYSTORE_DIR" --password "$KEYSTORE_DIR/passphrase.txt" >> $genesis_log 2>&1

    log "Account #3"
    $geth_bin account new --keystore "$KEYSTORE_DIR" --password "$KEYSTORE_DIR/passphrase.txt" >> $genesis_log 2>&1

    echo ""
    echo "Edit $BOOT_DIR/genesis.json 'alloc' structure the three new addresses:"
    echo "You will need also to change the 'extraData' address, which is 20 bytes"
    echo "long starting at offset 32 (so skip the first 64 characters) with the new first account"
    ls "$KEYSTORE_DIR" | grep -v 'passphrase' | cut -d '-' -f9

    echo -n "Press any key when done..."
    read answer
  fi

  log "Generating genesis block"
  $geth_bin --datadir $GENESIS_DIR init "$BOOT_DIR/genesis.json" >> $genesis_log 2>&1

  echo "Completed"
}

log() {
  echo "$@" >> $genesis_log
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
  echo "usage: bootstrap <option>"
  echo ""
  echo "Generate all necessary data to boostrap a node process for this chain."
  echo "The bootstrap phase generates keys for all hardcoded account as well as the"
  echo "genesis block information from the genesis configuration."
  echo ""
  echo "Most instructions and related information can be obtain from this"
  echo "blog post: https://hackernoon.com/setup-your-own-private-proof-of-authority-ethereum-network-with-geth-9a0a3750cda8"

  echo ""
  echo "Options"
  echo "    -h          Display help about this script"
  echo "    -b          Only re-generate genesis block and not new accounts"
}

main "$@"
