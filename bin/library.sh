export BIN_DIR=${ROOT}/bin
export BOOT_DIR=${ROOT}/boot
export KEYSTORE_DIR=${BOOT_DIR}/keystore
export GENESIS_DIR=${BOOT_DIR}/genesis
export RUN_DIR=${ROOT}/run

export geth_bin=${GETH_BIN:-"geth"}
export bootnode_bin=${BOOTNODE_BIN:-"bootnode"}

export genesis_log="$GENESIS_DIR/genesis.log"
export genesis_json="$BOOT_DIR/genesis.json"
export genesis_alloc_json="$GENESIS_DIR/alloc.json"

export miner_data_dir="$RUN_DIR/data/miner"
export miner_log="$RUN_DIR/miner.log"
export miner_deep_mind_log="$RUN_DIR/miner.dmlog"
export miner_cmd="$geth_bin --datadir ${miner_data_dir}"

export oracle_data_dir="$RUN_DIR/data/oracle"
export oracle_bootstrap_dir="$RUN_DIR/data/oracle/bootstrap"
export oracle_log="$RUN_DIR/oracle.log"
export oracle_deep_mind_log="$oracle_data_dir/oracle.dmlog"
export oracle_transaction_log="$oracle_data_dir/oracle.md"
export oracle_cmd="$geth_bin --datadir ${oracle_data_dir}"

export syncer_data_dir="$RUN_DIR/data/syncer"
export syncer_log="$RUN_DIR/syncer.log"
export syncer_deep_mind_log="$RUN_DIR/syncer.dmlog"
export syncer_cmd="$geth_bin --datadir ${syncer_data_dir}"

export bootstrap_data_dir="$RUN_DIR/data/bootstrap"

recreate_data_directories() {
  local component
  for component in "$@"; do
    # Dynamically access one of `miner_data_dir`, `syncer_data_dir` or `oracle_data_dir`
    data_dir=`dynamic_var_name=${component}_data_dir; echo ${!dynamic_var_name}`

    if [[ $component != "oracle" ]]; then
      rm -rf "$data_dir"
    fi

    mkdir -p "$data_dir" &> /dev/null

    if [[ $component == "miner" || $component == "syncer" ]]; then
      cp -a "$KEYSTORE_DIR" "$data_dir/keystore"
      cp -a "$GENESIS_DIR/geth" "$data_dir/geth"
    fi

    if [[ $component == "miner" || $component == "oracle" ]]; then
      cp -a "$BOOT_DIR/nodekey" "$data_dir/geth"
    fi

    if [[ $component == "syncer" ]]; then
      cp -a "$BOOT_DIR/static-nodes.json" "$data_dir/geth"
    fi
  done
}

# usage <name> <pid> <parent_pid> [<process_log>]
monitor() {
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

      echo "Process $name ($pid) died, exiting parent"
      if [[ "$process_log" != "" ]]; then
        echo "Last 15 lines of log"
        tail -n 15 $process_log

        echo
        echo "See full logs with 'less $process_log'"
      fi

      kill -s TERM $parent_pid &> /dev/null
      exit 0
    fi

    sleep 1
  done
}

kill_pid() {
  name=$1
  pid=$2

  if [[ $pid != "" ]]; then
    echo "Closing $name process..."
    kill -s TERM $pid &> /dev/null || true
    wait "$pid" &> /dev/null
  fi
}

sleep_forever() {
    while true; do sleep 1000000; done
}

to_dec() {
    value=`echo $1 | awk '{print toupper($0)}'`
    echo "ibase=16; ${value}" | bc
}

realpath() {
  if [[ $1 =~ /* ]]; then
    # Works only if path is already absolute and do not contain ,
    echo "$1" | sed s,$PWD,.,g
  else
    # Print as-is
    echo $1
  fi
}
