ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && cd .. && pwd )"

source "$ROOT/bin/library.sh"

main() {
  pushd "$ROOT" &> /dev/null

  copy_only=

  while getopts "hc" opt; do
    case $opt in
      h) usage && exit 0;;
      c) copy_only=true;;
      \?) usage_error "Invalid option: -$OPTARG";;
    esac
  done
  shift $((OPTIND-1))

  if [[ $1 == "" ]]; then
    usage_error "The <chain> argument must be provided, geth or polygon is supported"
  fi

  chain="$1"; shift
  if [[ $chain == "geth" ]]; then
    oracle_data_dir="$oracle_common_data_dir"
    oracle_bootstrap_dir="$oracle_common_bootstrap_dir"
    oracle_chain_data_dir="$oracle_common_chain_data_dir"
    oracle_firehose_log="$oracle_common_firehose_log"
    oracle_transaction_log="$oracle_common_transaction_log"

    recreate_data_directories oracle_common
  elif [[ $chain == "polygon" ]]; then
    oracle_data_dir="$oracle_polygon_data_dir"
    oracle_bootstrap_dir="$oracle_polygon_bootstrap_dir"
    oracle_chain_data_dir="$oracle_polygon_chain_data_dir"
    oracle_firehose_log="$oracle_polygon_firehose_log"
    oracle_transaction_log="$oracle_polygon_transaction_log"

    recreate_data_directories oracle_polygon
  else
    usage_error "The <chain> argument must be geth or polygon"
  fi

  if [[ $chain == "geth" ]]; then
    grep_pattern="Version: 1.9.1[0-3]"
    if ! $geth_bin version 2>/dev/null | grep -qE "$grep_pattern"; then
      echo "You need Geth version between 1.9.10 - 1.9.13 to generate the Oracle data."
      echo "This is because it's our smallest supported version and generating the Oracle"
      echo "data with an higher version creates an incompatible database version."
      echo ""
      echo "By doing it with 1.9.10 - 1.9.13, the generated database version is lower"
      echo "and is upgraded on the fly by newer version like 1.9.25 so it's possible"
      echo "to validate all supported versions."
      echo ""
      echo "For github.com/streamingfast/go-ethereum fork, you should be able to checkout"
      echo "tag 'v1.9.10-dm', compile 'geth' using 'go install ./cmd/geth' and re-run this"
      echo "script to properly update bootstrap data."
      echo ""
      echo "The version check was performed on this output (geth version 2> /dev/null)"
      echo ""
      $geth_bin version 2>/dev/null
      echo ""
      echo "And by grepping for 'grep -E \"$grep_pattern\"'"
      exit 1
    fi
  elif [[ $chain == "polygon" ]]; then
    grep_pattern="Version: 0.3.7-stable-fh2"
    if ! $geth_bin version 2>/dev/null | grep -qE "$grep_pattern"; then
      echo "You need Polygon version 0.3.7-stable-fh2 to generate the Oracle data."
      echo "This is because it's our smallest supported version and generating the Oracle"
      echo "data with an higher version creates an incompatible database version."
      echo ""
      echo "For github.com/streamingfast/go-ethereum fork, you should be able to checkout"
      echo "branch 'release/polygon-battlefield-bootstrap', compile 'geth' using"
      echo "'go install ./cmd/geth' and re-run this script to properly update bootstrap data."
      echo ""
      echo "The version check was performed on this output (geth version 2> /dev/null)"
      echo ""
      $geth_bin version 2>/dev/null
      echo ""
      echo "And by grepping for 'grep -E \"$grep_pattern\"'"
      exit 1
    fi
  fi

  set -e

  if [[ $copy_only == "" ]]; then
    ./bin/generate_local.sh -l "$oracle_transaction_log" $chain
  fi

  echo ""
  echo "Copying references file (genesis, data, .firelog) to oracle files..."
  rm -rf $oracle_data_dir/genesis &> /dev/null || true

  # We create the "genesis" folder by copying the chain data to it, so don't create it prior!

  if [[ $chain == "geth" ]]; then
    cp -a "$GENESIS_DIR/geth" "$oracle_data_dir/genesis"
    cp -a $miner_data_dir/geth "$oracle_data_dir"
    cp -a $BOOT_DIR/nodekey "$oracle_data_dir/geth"
  elif [[ $chain == "polygon" ]]; then
    cp -a "$GENESIS_DIR/bor" "$oracle_data_dir/genesis"
    cp -a $miner_data_dir/bor "$oracle_data_dir"
    cp -a $BOOT_DIR/nodekey "$oracle_data_dir/polygon"
  fi

  # "genesis" folder exist reaching this point
  cp -a "$BOOT_DIR/genesis.json" "$oracle_data_dir/genesis/genesis.json"
  cp -a "$BOOT_DIR/chainspec.json" "$oracle_data_dir/genesis/chainspec.json"

  # Remove nodekey, we don't want the syncer when picking up this genesis folder to pick it up
  rm -rf $oracle_data_dir/genesis/nodekey &> /dev/null || true

  # This is correct, for now in all cases we run the same geth binary for both geth and polygon
  cp $syncer_geth_firehose_log $oracle_firehose_log

  # Remove TRX_ENTER_POOL elements (we do not compare them currently)
  temporary_firehose_log=$(mktemp)
  grep -Ev "^FIRE TRX_ENTER_POOL" "$oracle_firehose_log" > "$temporary_firehose_log" && mv "$temporary_firehose_log" "$oracle_firehose_log" &> /dev/null

  echo "Launching blocks generation task (and compiling Go code)"
  go run battlefield.go generate "$oracle_data_dir"
  echo ""

  echo "Compressing oracle bootstrap data"

  pushd $KEYSTORE_DIR &> /dev/null
    zip $miner_data_dir/keystore.zip * &> /dev/null
  popd &> /dev/null

  cd $miner_data_dir
  tar -cf bootstrap.tar --exclude nodekey * > /dev/null
  zstd -14 bootstrap.tar &> /dev/null

  mkdir -p "$oracle_bootstrap_dir" "$oracle_bootstrap_dir/mindreader" &> /dev/null
  cp bootstrap.tar.zst "$oracle_bootstrap_dir" &> /dev/null
  cp keystore.zip "$oracle_bootstrap_dir" &> /dev/null
  cp $BOOT_DIR/genesis.json "$oracle_bootstrap_dir/mindreader" &> /dev/null
  cp $BOOT_DIR/keystore.md "$oracle_bootstrap_dir" &> /dev/null

  echo ""
  echo "Important: You should commit the changes before running './bin/compare_vs_oracle.sh geth'."
  echo "This is because the compare script runs 'git restore -- run/data/oracle' after the Geth node"
  echo "finished his work because it make some changes to some files that are checked in in Git."
  echo ""
  echo "If you run './bin/compare_vs_oracle.sh geth' before committing the changes, your new oracle"
  echo "data will be reverted at the end of the compare execution."
  echo ""
  echo "You've been warned!"
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
  echo "usage: oracle.sh [-c] <chain>"
  echo ""
  echo "Run the local transaction generation script and replaced previous oracle reference"
  echo "data with the new one we just generated."
  echo ""
  echo "The <chain> is used to generate an oracle data directory in 'run/data/oracle/<chain>'"
  echo "this is required because some chains generates different consensus data than others,"
  echo "Polygon is such example."
  echo ""
  echo "Options"
  echo "    -c          Do no run generate_local.sh and only copy over the last generated values"
  echo "    -h          Display help about this script"
}

main "$@"
