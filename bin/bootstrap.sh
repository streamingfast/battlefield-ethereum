#!/usr/bin/env bash

set -e

ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && cd .. && pwd )"

source "${ROOT}/bin/library.sh"

main() {
  pushd "$ROOT" &> /dev/null

  genesis_block=

  while getopts "hb" opt; do
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

  if [[ $genesis_block == "" ]]; then
    recreate_boot_directories $genesis_block
    echo "" > $genesis_log

    echo "Generating public keys"
    printf "" > "$KEYSTORE_DIR"/passphrase.txt

    echo "{" > $genesis_alloc_json
    first=true
    accounts=( "matt" "alex" "stepd" "charles" "julian" "fp" "matb" "josh" "anthony" "marc" )
    for account in "${accounts[@]}"; do
      $geth_bin account new --keystore "$KEYSTORE_DIR" --password "$KEYSTORE_DIR/passphrase.txt" >> $genesis_log 2>&1

      address=`tail -n8 $genesis_log | grep $KEYSTORE_DIR | cut -d '-' -f9`
      log "Account $account (address $address)"

      balance="0x52B7D2DCC80CD2E4000000"
      if [[ $first == true ]]; then
        balance="0x2863C1F5CDAE42F9540000000"
        first=false
      fi

      printf "  \"${address}\": { \"balance\": \"$balance\" }" >> $genesis_alloc_json
      if [[ $account == ${accounts[${#accounts[@]} - 1]} ]]; then
        printf "\n" >> $genesis_alloc_json
      else
        printf ",\n" >> $genesis_alloc_json
      fi
    done
    echo "}" >> $genesis_alloc_json

    echo ""
    echo "Edit $BOOT_DIR/genesis.json 'alloc' structure with this one:"
    echo ""
    cat $genesis_alloc_json
    echo ""
    echo "You will need also to change the 'extraData' field value with the new miner address, which"
    echo "is 20 bytes long starting at offset 32 (so skip the first 64 characters, it's right"
    echo "after '...656c6420436861696e') with this value:"
    echo ""
    cat $genesis_alloc_json | jq -r 'keys_unsorted[0]'
    echo ""

    echo -n "Press any key when you have finished editing 'genesis.json'..."
    read answer

    echo "\`\`\`" > $BOOT_DIR/keystore.md
    (yarn -s r src/keys.ts | tail -n +3) >> $BOOT_DIR/keystore.md
    echo "\`\`\`" >> $BOOT_DIR/keystore.md
  else
    mkdir -p "$GENESIS_DIR" &> /dev/null
    rm -rf $GENESIS_DIR/geth &> /dev/null || true
    echo "" > $genesis_log
  fi

  log "Generating genesis block & node information"
  coinbase_address=`cat $genesis_alloc_json | jq -r 'keys_unsorted[0]'`
  coinbase_private=`yarn -s r src/keys.ts $coinbase_address | tail -n1`
  coinbase_enode=`$bootnode_bin -nodekeyhex $coinbase_private -writeaddress`

  echo "$coinbase_private" > $BOOT_DIR/nodekey
  echo "[\"enode://${coinbase_enode}@127.0.0.1:30303\"]" > $BOOT_DIR/static-nodes.json
  $geth_bin --datadir $GENESIS_DIR init "$BOOT_DIR/genesis.json" >> $genesis_log 2>&1

  echo "Completed"
}

log() {
  echo "$@"
  echo "$@" >> $genesis_log
}

recreate_boot_directories() {
  rm -rf "$GENESIS_DIR" && mkdir -p "$GENESIS_DIR" &> /dev/null
  rm -rf "$KEYSTORE_DIR" && mkdir -p "$KEYSTORE_DIR" &> /dev/null
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
  echo "usage: bootstrap [-b]"
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
