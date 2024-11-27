
ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

set -e

main() {
    fireeth="fireeth"
    if ! command -v "$fireeth" &> /dev/null; then
        echo "The '$fireeth' binary could not be found, you can install it through one of those means:"
        echo ""
        echo "- By running 'brew install streamingfast/tap/firehose-ethereum' on Mac or Linux system (with Homebrew installed)"
        echo "- By building it from source cloning https://github.com/streamingfast/firehose-ethereum.git and then 'go install ./cmd/fireeth'"
        echo "- By downloading a pre-compiled binary from https://github.com/streamingfast/firehose-ethereum/releases"
        exit 1
    fi

    geth="geth"
    if ! command -v "$geth" &> /dev/null; then
        echo "The '$geth' binary could not be found, you can install it with:"
        echo ""
        echo "- go install github.com/ethereum/go-ethereum/cmd/geth@latest"
    fi

    data_dir="$ROOT/.firehose-data"

    echo "Running Geth dev node with Firehose tracer activated via 'fireeth'"
    rm -rf "$data_dir"

    "$fireeth" \
        start \
        reader-node,relayer,merger,firehose \
        -c '' \
        -d "$data_dir" \
        --common-first-streamable-block=0 \
        --reader-node-path="bash" \
        --reader-node-arguments="$ROOT/wrapped_geth_dev.sh" \
        --firehose-grpc-listen-addr="localhost:8089"
}

main "$@"
