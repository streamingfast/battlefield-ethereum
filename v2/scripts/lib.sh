root_dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

address_to_fund="${ADDRESS_TO_FUND:-"0x821b55d8abe79bc98f05eb675fdc50dfe796b7ab"}"

fireeth="${FIREETH_BINARY:-fireeth}"
geth="${GETH_BINARY:-geth}"
seid="${SEID_BINARY:-seid}"

# Usage: run_fireeth <first_streamable_block> <node_binary> <node_args>
run_fireeth() {
  if [[ $# -lt 3 ]]; then
    lib_error "Wrong method call 'run_fireeth <first_streamable_block> <node_binary> <node_args>'"
  fi

  first_streamable_block="$1"; shift
  node_binary="$1"; shift
  node_args="$1"; shift

  data_dir="$root_dir/.firehose-data"

  if [[ -d "$data_dir" ]]; then
    rm -rf "$data_dir"
  fi

  "$fireeth" \
    start \
    reader-node,relayer,merger,firehose \
    -c '' \
    -d "$data_dir" \
    --common-first-streamable-block=${first_streamable_block} \
    --reader-node-path="$node_binary" \
    --reader-node-arguments="$node_args" \
    --firehose-grpc-listen-addr="localhost:8089" $@
}

check_fireeth() {
  if ! command -v "$fireeth" &> /dev/null; then
    echo "The '$fireeth' binary could not be found, you can install it through one of those means:"
    echo ""
    echo "- By running 'brew install streamingfast/tap/firehose-ethereum' on Mac or Linux system (with Homebrew installed)"
    echo "- By building it from source cloning https://github.com/streamingfast/firehose-ethereum.git and then 'go install ./cmd/fireeth'"
    echo "- By downloading a pre-compiled binary from https://github.com/streamingfast/firehose-ethereum/releases"
    exit 1
  fi
}

check_geth() {
  if ! command -v "$geth" &> /dev/null; then
    echo "The '$geth' binary could not be found, you can install it with:"
    echo ""
    echo "- go install github.com/ethereum/go-ethereum/cmd/geth@latest"
  fi
}

check_sd() {
  if ! command -v "sd" &> /dev/null; then
    echo "The 'sd' command is required for this script, please install it"
    echo "by following instructions at https://github.com/chmln/sd?tab=readme-ov-file#installation"
    exit 1
  fi
}

# usage: check_env <name> [<message_if_unset>]
check_env() {
  name="$1"
  message_if_unset="$2"

  if [[ -z "${!name}" ]]; then
    echo "Error: The environment variable '$name' is required"
    if [[ -n "$message_if_unset" ]]; then
      echo "$message_if_unset"
    fi
    exit 1
  fi
}

ensure_parent_runs() {
  if ! ps -p $1 > /dev/null; then
    exit
  fi
}

usage_error() {
  if [[ $# -gt 0 ]]; then
    echo "Error: $1"
  fi

  usage
  exit 1
}

lib_error() {
  if [[ $# -gt 0 ]]; then
    echo "Internal Error: $1"
  fi

  exit 1
}