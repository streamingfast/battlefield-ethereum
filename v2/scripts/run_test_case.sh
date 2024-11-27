
ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
CONTRACTS="$ROOT/../../contracts"
TOP_PID=$$

set -e

main() {
    trap "exit 1" TERM

    if ! command -v "sd" &> /dev/null; then
        echo "The 'sd' command is required for this script, please install it"
        echo "by following instructions at https://github.com/chmln/sd?tab=readme-ov-file#installation"
        exit 1
    fi

    fireeth_log="$ROOT/.fireeth.log"
    start_firehose="true"

    if [[ $start_firehose == "true" ]]; then
        ($ROOT/run_firehose_geth_dev.sh &> "$fireeth_log") &
        fireeth_pid=$!
        trap "cleanup" EXIT

        monitor "fireeth" $fireeth_pid "$fireeth_log" &

        echo "Waiting for Firehose instance to be ready"
        wait_for_firehose_ready "$fireeth_log"

        echo "Firehose instance is ready"
    fi

    echo "Running Firehose tests"
    cd "$CONTRACTS"

    if [[ "$run_only" != "" || "$run_only" == "tracer" ]]; then
        echo "-o <value> flag is not working right now"
        exit 1
    fi

    npx hardhat test --network seilocal test/tracer/firehose/FirehoseTracerTest.js
}

cleanup() {
    for job in `jobs -p`; do
        kill $job &> /dev/null
        wait $job &> /dev/null || true
    done
}

wait_for_firehose_ready() {
    firehose_log="$1"

    for i in {1..8}; do
        if grep -q '(firehose) launching gRPC server' "$firehose_log"; then
            break
        fi

        if [[ $i -eq 8 ]]; then
            >&2 echo "The 'fireeth' instance did not start within ~30s which is not expected."
            >&2 echo ""
            show_logs_preview "$firehose_log"
            kill -s TERM $TOP_PID
        fi

        sleep $i
    done

    # Sleep a bit again to ensure the server is fully started
    sleep 1
}

# usage <name> <pid> <process_log>
monitor() {
  name="$1"
  pid="$2"
  process_log="$3"

  while true; do
    if ! kill -0 $pid &> /dev/null; then
      sleep 2

      echo "Process $name ($pid) died, exiting parent"
      if [[ "$process_log" != "" ]]; then
        show_logs_preview "$process_log"
      fi

      kill -s TERM $TOP_PID &> /dev/null
      exit 0
    fi

    sleep 1
  done
}

show_logs_preview() {
    log_file="$1"

    >&2 echo "Here the first 25 lines followed by the last 25 lines of the log:"
    >&2 echo ""

    >&2 echo "  ..."
    head -n 25 "$log_file" | >&2 sd '^(.)' '  |    $1'
    >&2 echo "  .\n  ."
    tail -n 25 "$log_file" | >&2 sd '^(.)' '  |    $1'

    >&2 echo ""
    >&2 echo "See full logs with 'less `relpath $log_file`'"
}

extract() {
    set +e
    output=`echo "$1" | jq -r "$2"`
    if [ $? -ne 0 ]; then
        >&2 echo "Failed to extract from: $1"
        >&2 echo "JQ: $2"
        kill -s TERM $TOP_PID
    fi

    echo "$output"
    set -e
}

relpath() {
  if [[ $1 =~ /* ]]; then
    # Works only if path is already absolute and do not contain ,
    echo "$1" | sed s,$PWD,.,g
  else
    # Print as-is
    echo $1
  fi
}

main "$@"
