
set -e

PARENT_PID=$$
ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

source "$ROOT/../lib.sh"

# Going to be filled up when Geth starts
geth_active_pid=""

main() {
    check_geth

    data_dir="$(mktemp -d)"
    geth_log="$ROOT/geth_dev.log"

    echo "Dumping Geth --dev genesis"
    echo "Geth Binary: $geth"
    echo "Geth Version: $($geth --version)"
    echo "Geth Logs: $geth_log"
    echo ""

    echo "Starting geth --dev in background"
    ("$geth" "--dev" "--datadir=$data_dir" "--http" "--http.port=9111" 2> "$geth_log") &
    geth_active_pid=$!

    wait_geth_up "http://localhost:9111"

    kill_pid "$geth_active_pid"

    echo ""
    echo "Dumping genesis"

    echo ""
    "$geth" "--dev" "--datadir=$data_dir" 2>> "$geth_log" dumpgenesis
}

main "$@"
