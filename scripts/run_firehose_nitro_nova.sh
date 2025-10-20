#!/usr/bin/env bash

set -e

PARENT_PID=$$
ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
source "$ROOT/lib.sh"

main() {
  check_fireeth

  # Check required environment variables
  if [[ -z "$NITRO_NOVA_PARENT_CHAIN_URL" ]]; then
    echo "Error: NITRO_NOVA_PARENT_CHAIN_URL environment variable is required"
    echo "Example: export NITRO_NOVA_PARENT_CHAIN_URL=http://127.0.0.1:38545"
    exit 1
  fi

  if [[ -z "$NITRO_NOVA_BEACON_URL" ]]; then
    echo "Error: NITRO_NOVA_BEACON_URL environment variable is required"
    echo "Example: export NITRO_NOVA_BEACON_URL=http://127.0.0.1:17052"
    exit 1
  fi

  data_dir="$(mktemp -d)"
  nitro_args=(
    "--parent-chain.connection.url=$NITRO_NOVA_PARENT_CHAIN_URL"
    "--parent-chain.blob-client.beacon-url=$NITRO_NOVA_BEACON_URL"
    "--chain.id=42170"
    "--init.latest=genesis"
    "--http.api=net,web3,eth"
    "--http.corsdomain=*"
    "--http.addr=0.0.0.0"
    "--http.vhosts=*"
    "--node.firehose"
  )

  echo "Running Nitro Nova node with Firehose tracer activated via 'fireeth'"
  echo "Parent Chain URL: $NITRO_NOVA_PARENT_CHAIN_URL"
  echo "Beacon URL: $NITRO_NOVA_BEACON_URL"
  echo "Nitro Binary: $nitro"
  echo "Nitro Version: $($nitro --version)"
  echo "Nitro Data Directory: $data_dir"
  echo ""

  run_fireeth 1 "$nitro" "${nitro_args[*]}"
}

usage() {
  echo "Usage: $0"
  echo ""
  echo "Runs Nitro Nova chain with Firehose tracer activated."
  echo ""
  echo "Required environment variables:"
  echo "  NITRO_NOVA_PARENT_CHAIN_URL - Parent chain connection URL"
  echo "  NITRO_NOVA_BEACON_URL       - Beacon client URL"
  echo ""
  echo "Example:"
  echo "  export NITRO_NOVA_PARENT_CHAIN_URL=http://127.0.0.1:38545"
  echo "  export NITRO_NOVA_BEACON_URL=http://127.0.0.1:17052"
  echo "  $0"
}

main "$@"