#!/usr/bin/env bash

set -e

PARENT_PID=$$
ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
source "$ROOT/lib.sh"

main() {
  check_fireeth
  check_seid

  if [[ ! $# -eq 1 ]]; then
    usage_error "Wrong arguments"
  fi

  transaction_executor="$1"
  if [[ "$transaction_executor" != "sequential" && "$transaction_executor" != "parallel" ]]; then
    usage_error "Invalid transaction executor config '$transaction_executor'"
  fi

  occ_enabled="true"
  if [[ "${transaction_executor}" == "sequential" ]]; then
      occ_enabled="false"
  fi

  run_dir=$(mktemp -d)
  cp -R "$ROOT/sei_dev/chain_data" "$run_dir/sei"
  sd 'occ-enabled *=.*' "occ-enabled = ${occ_enabled}" "$run_dir/sei/config/app.toml"

  launch_funder "$run_dir/sei" &

  echo "Running Sei node with Firehose tracer activated via 'fireeth'"
  run_fireeth 1 "$seid" "start --home \"$run_dir/sei\" --trace --chain-id sei-chain"
}

launch_funder() {
    home_dir="$1"

    # A first sleep to let the node start
    sleep 2
    ensure_parent_runs "$PARENT_PID"

    ls "$home_dir" || {
        echo "Home dir '$home_dir' does not exist"
        exit 1
    }

    echo "Funding $address_to_fund"
    echo "- Home dir: $1"

    tries=0
    while true; do
        ensure_parent_runs "$PARENT_PID"

        tries=$((tries + 1))
        if [ $tries -gt 10 ]; then
            echo "Unable to fund address after 10 tries"
            killall "$seid"
            kill $PARENT_PID
            exit 1
        fi

        set +e
        "$seid" --home "$home_dir" tx evm send --from=admin "$address_to_fund" 10000000000000000000000000 -b block -y
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
