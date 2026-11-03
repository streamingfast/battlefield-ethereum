#!/usr/bin/env bash

# Compares the block execution time of the Firehose-instrumented reth dev node with the parallel
# block access list path enabled (the default) and disabled (serial execution), on blocks filled
# by `load.ts`. The node mines on a timer so blocks hold many transactions, unlike the one
# transaction per block of the regular test run. Each mode runs once per value of PERF_WORKLOADS
# (the `PERF_WORK` of `load.ts`, hash rounds per call), so the comparison covers cheap and
# expensive transactions.
#
# Execution time comes from the node's `sync.execution.execution_histogram` metric, which covers
# the EVM execution of each block (not the state root), so the setup blocks of `load.ts` (one
# deployment, one funding block) are included in the totals along with the call blocks.

set -e
# Job control puts each node in its own process group, so stopping it does not stop this script.
set -m

ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && cd .. && pwd )"
source "$ROOT/lib.sh"

export LC_ALL=C

metrics_addr="127.0.0.1:9001"
modes="${PERF_MODES:-parallel serial}"
workloads="${PERF_WORKLOADS:-0 300}"
results=()

scrape() {
  curl -s "http://$metrics_addr" | grep -E "^reth_sync_execution_execution_histogram_(sum|count)" || true
}

run_mode() {
  local mode="$1"
  local work="$2"
  local extra_args="--metrics=$metrics_addr"
  if [[ "$mode" == "serial" ]]; then
    extra_args="$extra_args --engine.disable-bal-parallel-execution"
  fi
  local log="$ROOT/.perf-$mode-$work.log"

  echo "Starting reth dev node ($mode, work=$work), log at $log"
  # The debug lines name the execution path each block took.
  RUST_LOG="${RUST_LOG:-info,engine::tree::payload_validator=debug}" \
    RETH_DEV_MINING_ARGS="--dev.block-time=${PERF_BLOCK_TIME:-1s}" RETH_EXTRA_ARGS="$extra_args" \
    "$ROOT/run_firehose_reth_dev.sh" amsterdam > "$log" 2>&1 &
  local pid=$!
  local pgid
  pgid="$(ps -o pgid= -p "$pid" | tr -d ' ')"

  for _ in $(seq 1 60); do
    if curl -s -X POST -H 'content-type: application/json' \
        --data '{"jsonrpc":"2.0","id":1,"method":"eth_blockNumber","params":[]}' \
        http://127.0.0.1:9545 > /dev/null 2>&1; then
      break
    fi
    sleep 1
  done

  local before after
  before="$(scrape)"
  (cd "$ROOT/.." && PERF_WORK="$work" pnpm hardhat run scripts/perf/load.ts --network reth-dev)
  after="$(scrape)"
  echo "Metrics before the load:"
  echo "$before"
  echo "Metrics after the load:"
  echo "$after"
  echo "Blocks executed on each path:"
  sed 's/\x1b\[[0-9;]*m//g' "$log" | grep -oE "Executing block( via BAL path)?( \(with Firehose tracing\))?$" | sort | uniq -c

  kill -- -"$pgid" 2> /dev/null || true
  wait "$pid" 2> /dev/null || true

  local sum_before count_before sum_after count_after
  sum_before="$(echo "$before" | awk '/_sum/ {print $2}')"
  count_before="$(echo "$before" | awk '/_count/ {print $2}')"
  sum_after="$(echo "$after" | awk '/_sum/ {print $2}')"
  count_after="$(echo "$after" | awk '/_count/ {print $2}')"
  local blocks seconds
  blocks=$(( ${count_after:-0} - ${count_before:-0} ))
  seconds="$(awk "BEGIN {print ${sum_after:-0} - ${sum_before:-0}}")"
  results+=("$mode work=$work blocks=$blocks execution_seconds=$seconds per_block_ms=$(awk "BEGIN {print 1000 * $seconds / $blocks}")")
}

for work in $workloads; do
  for mode in $modes; do
    run_mode "$mode" "$work"
  done
done

echo ""
echo "Block execution time (sum over the run's blocks, from the node's metrics):"
for result in "${results[@]}"; do
  echo "  $result"
done
