#!/usr/bin/env bash

set -e

PARENT_PID=$$
ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
source "$ROOT/lib.sh"

main() {
  check_fireeth
  check_env "SEI_CHAIN_REPOSITORY_HOME" "You need to set the SEI_CHAIN_REPOSITORY_HOME environment variable pointing to our Sei fork at https://github.com/streamingfast/sei-chain"

  if [[ ! $# -eq 1 ]]; then
    usage_error "Wrong arguments"
  fi

  seid_args="start --home \"$HOME/.sei\" --trace --chain-id sei-chain"
  transaction_executor="$1"

  if [[ "$transaction_executor" != "sequential" && "$transaction_executor" != "parallel" ]]; then
    usage_error "Invalid transaction executor config '$transaction_executor'"
  fi

  # This is done here because the script compiles some Golang code which takes time usually. By doing
  # it once here, we will wait until the compilation is done before starting the node. This will enable
  # 'launch_funder' to work properly since it it has ~15 seconds to fund the address before exiting
  pushd "$SEI_CHAIN_REPOSITORY_HOME" > /dev/null
    NO_RUN=1 "./scripts/initialize_local_chain.sh"
  popd > /dev/null

  launch_funder &

  echo "Running Sei node with Firehose tracer activated via 'fireeth'"
  run_fireeth 1 "$seid" "$seid_args" --reader-node-bootstrap-data-url="bash://$ROOT/bootstrap_sei.sh?env_TRANSACTION_EXECUTOR=${transaction_executor}"
}

launch_funder() {
    # A first sleep to let the node start
    sleep 2
    ensure_parent_runs "$PARENT_PID"

    echo "Funding $address_to_fund"

    tries=0
    while true; do
        ensure_parent_runs "$PARENT_PID"

        tries=$((tries + 1))
        if [ $tries -gt 10 ]; then
            echo "Unable to fund address after 10 tries"
            kill $PARENT_PID
            exit 1
        fi

        set +e
        "$seid" tx evm send --from=admin "$address_to_fund" 10000000000000000000000000 -b block -y
        if [[ $? -ne 0 ]]; then
            echo "Failed to send the funding transaction, retrying in 1s"
        else
            break
        fi

        sleep 1
    done

    echo "Funding transaction sent"
}

usage() {
  echo "Usage: $0 <executor>"
  echo ""
  echo "Runs a Sei chain the Firehose tracer activated using transaction <executor>"
  echo "which can be either 'sequential' or 'parallel'. Sei has two transaction executors"
  echo "and usually you want to test both".
}

main "$@"
