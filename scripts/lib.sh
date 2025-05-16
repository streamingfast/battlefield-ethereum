root_dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

firehose_data_dir="$root_dir/.firehose-data"

address_to_fund="${ADDRESS_TO_FUND:-"0x821b55d8abe79bc98f05eb675fdc50dfe796b7ab"}"

fireeth="${FIREETH_BINARY:-fireeth}"
geth="${GETH_BINARY:-geth}"
nitro="${NITRO_BINARY:-nitro}"
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
    --advertise-chain-name=battlefield \
    --common-first-streamable-block=${first_streamable_block} \
    --reader-node-path="$node_binary" \
    --reader-node-arguments="$node_args" \
    --firehose-grpc-listen-addr="localhost:8089" $@
}

check_docker() {
    if ! command -v "docker" &> /dev/null; then
        echo "The 'docker' command is required for this script, please install it"
        echo "by following instructions at https://docs.docker.com/get-docker/"
        exit 1
    fi
    if [[ -n "$1" ]]; then
        if ! docker ps --format '{{.Names}}' | grep -q "^$1$"; then
            ERR="You should run the appropriate docker-compose recipe first"
            [[ -n "$2" ]] && ERR="$2"
            echo "Docker container '$1' is not running. $ERR"
            exit 1
        fi
    fi
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

wait_geth_up() {
    endpoint="$1"

    i=0
    max_attempts=15

    # The ending space is on-purpose
    printf "Waiting for Geth to be ready at $endpoint "
    while true; do
        i=$((i+1))
        if [[ $i -gt $max_attempts ]]; then
            echo
            echo "Failed to connect to node after $max_attempts attempts"
            exit 1
        fi
        curl --connect-timeout 1 "$endpoint" -sS -X POST --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' -H "content-type: application/json" --fail &> /dev/null && break
        sleep 1
        printf "."
    done

    # The leading space is on-purpose
    printf " now up and running\n"
    return 0
}

check_geth() {
  if ! command -v "$geth" &> /dev/null; then
    echo "The '$geth' binary could not be found, you can install it with:"
    echo ""
    echo "- go install github.com/streamingfast/go-ethereum/cmd/geth@latest"
    echo ""
    echo "> *Note* Install the correct version for the chain you want to test against, see the README for more information"
    exit 1
  fi
  if [[ -n "$1" ]]; then
      if ! geth --help |grep -q "$1"; then
          echo "Your geth version is not compatible with '$1' Chain (grepping the string '$1' in 'geth --help' output)"
          exit 1
      fi
  fi
}

check_seid() {
  if ! command -v "$seid" &> /dev/null; then
    echo "The '$seid' binary could not be found, you can install it with:"
    echo ""
    echo "- go install github.com/streamingfast/sei-chain/cmd/seid@latest"
    exit 1
  fi
}

check_jq() {
  if ! command -v "jq" &> /dev/null; then
    echo "The 'jw' command is required for this script, please install it"
    echo "by following instructions at https://jqlang.github.io/jq/download"
    exit 1
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

# usage <name> <pid> <parent_pid> [<process_log>]
monitor_child_process() {
  name=$1
  pid=$2
  parent_pid=$3
  process_log=

  if [[ $# -gt 3 ]]; then
    process_log=$4
  fi

  while true; do
    if ! kill -0 $pid &> /dev/null; then
      sleep 2

      # If parent is not running, exit, nothing else to do (since our monitored process is also dead)
      if ! ps -p $parent_pid > /dev/null; then
        exit
      fi

      echo "Process $name ($pid) died, exiting parent"
      if [[ "$process_log" != "" ]]; then
        echo "Last 50 lines of log"
        tail -n 50 $process_log

        echo
        echo "See full logs with 'less `relative_path "$process_log"`'"
      fi

      kill -s TERM $parent_pid &> /dev/null
      exit 0
    fi

    sleep 1

    # If parent is not running, terminate the child and exit
    if ! ps -p $parent_pid > /dev/null; then
      kill -s TERM $pid &> /dev/null
      exit
    fi
  done
}

relative_path() {
  if [[ $1 =~ /* ]]; then
    # Works only if path is already absolute and do not contain ,
    echo "$1" | sed s,$PWD,.,g
  else
    # Print as-is
    echo $1
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

kill_pid() {
  pid=$1

  if [[ $pid != "" ]]; then
    kill -s TERM $pid &> /dev/null || true
    wait "$pid" &> /dev/null
  fi
}

lib_error() {
  if [[ $# -gt 0 ]]; then
    echo "Internal Error: $1"
  fi

  exit 1
}
