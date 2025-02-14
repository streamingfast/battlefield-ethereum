#!/usr/bin/env bash

set -e

PARENT_PID=$$
ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
source "$ROOT/lib.sh"

main() {
  check_fireeth

  data_dir="$(mktemp -d)"
  nitro_args="--dev --node.firehose --init.dev-init-address '$address_to_fund' --persistent.chain '$data_dir'"

  echo "Running Nitro --dev node with Firehose tracer activated via 'fireeth'"
  echo "Address to fund: $address_to_fund"
  echo "Nitro Binary: $nitro"
  echo "Nitro Version: $($nitro --version)"
  echo "Nitro Data Directory: $data_dir"
  echo ""

  run_fireeth 1 "$nitro" "$nitro_args"
}

usage() {
  echo "Usage: $0"
  echo ""
  echo "Runs Nitro --dev chain with Firehose tracer activated."
}

main "$@"
