export BIN_DIR=${ROOT}/bin
export BOOT_DIR=${ROOT}/boot
export KEYSTORE_DIR=${BOOT_DIR}/keystore
export GENESIS_DIR=${BOOT_DIR}/genesis
export RUN_DIR=${ROOT}/run

export anvil_bin=${ANVIL_BIN:-"anvil"}
export geth_bin=${GETH_BIN:-"geth"}
export erigon_bin=${GETH_BIN:-"erigon"}
export polygon_bin=${POLYGON_BIN:-"geth"}
export bootnode_bin=${BOOTNODE_BIN:-"bootnode"}

export genesis_log="$GENESIS_DIR/genesis.log"
export genesis_json="$BOOT_DIR/genesis.json"
export genesis_alloc_json="$GENESIS_DIR/alloc.json"

export miner_data_dir="$RUN_DIR/data/miner"
export miner_log="$RUN_DIR/miner.log"
export miner_firehose_log="$RUN_DIR/miner.firelog"
export miner_cmd="$geth_bin --datadir ${miner_data_dir}"

export oracle_common_data_dir="$RUN_DIR/data/oracle_common"
export oracle_common_chain_data_dir="$oracle_common_data_dir/geth"
export oracle_common_bootstrap_dir="$oracle_common_data_dir/bootstrap"
export oracle_common_log="$RUN_DIR/oracle_common.log"
export oracle_common_firehose_log="$oracle_common_data_dir/oracle.firelog"
export oracle_common_transaction_log="$oracle_common_data_dir/oracle.md"
export oracle_common_cmd="$geth_bin --datadir ${oracle_common_data_dir}"

export oracle_polygon_data_dir="$RUN_DIR/data/oracle_polygon"
export oracle_polygon_chain_data_dir="$oracle_polygon_data_dir/bor"
export oracle_polygon_bootstrap_dir="$oracle_polygon_data_dir/bootstrap"
export oracle_polygon_log="$RUN_DIR/oracle_polygon.log"
export oracle_polygon_firehose_log="$oracle_polygon_data_dir/oracle.firelog"
export oracle_polygon_transaction_log="$oracle_polygon_data_dir/oracle.md"
export oracle_polygon_cmd="$geth_bin --datadir ${oracle_polygon_data_dir}"

export syncer_anvil_data_dir="$RUN_DIR/data/syncer_anvil"
export syncer_anvil_log="$RUN_DIR/syncer_anvil.log"
export syncer_anvil_firehose_log="$RUN_DIR/syncer_anvil.firelog"
export syncer_anvil_genesis_json="$syncer_anvil_data_dir/genesis.json"
export syncer_anvil_cmd="$anvil_bin"

export syncer_geth_data_dir="$RUN_DIR/data/syncer_geth"
export syncer_geth_log="$RUN_DIR/syncer_geth.log"
export syncer_geth_firehose_log="$RUN_DIR/syncer_geth.firelog"
export syncer_geth_genesis_json="$syncer_geth_data_dir/genesis.json"
export syncer_geth_cmd="$geth_bin --datadir ${syncer_geth_data_dir}"
export syncer_geth_addpeer="echo 'admin.addPeer(\"enode://2c8f6d4764c3aca75696e18aeef683932a2bfa0be1603adb54f30dfad8e5cf2372a9d6eeb0e5caffba1fca22e12878c450e6ef09434888f04c6a97b6f50c75d4@127.0.0.1:30303\")' | $geth_bin attach ${syncer_geth_data_dir}/geth.ipc"

export syncer_erigon_data_dir="$RUN_DIR/data/syncer_erigon"
export syncer_erigon_log="$RUN_DIR/syncer_erigon.log"
export syncer_erigon_firehose_log="$RUN_DIR/syncer_erigon.firelog"
export syncer_erigon_genesis_json="$syncer_erigon_data_dir/genesis.json"
export syncer_erigon_cmd="$erigon_bin --datadir ${syncer_erigon_data_dir}/erigon"

export syncer_polygon_data_dir="$RUN_DIR/data/syncer_polygon"
export syncer_polygon_log="$RUN_DIR/syncer_polygon.log"
export syncer_polygon_firehose_log="$RUN_DIR/syncer_polygon.firelog"
export syncer_polygon_genesis_json="$syncer_polygon_data_dir/genesis.json"
export syncer_polygon_cmd="$polygon_bin --datadir ${syncer_polygon_data_dir}"
export syncer_polygon_addpeer="echo 'admin.addPeer(\"enode://2c8f6d4764c3aca75696e18aeef683932a2bfa0be1603adb54f30dfad8e5cf2372a9d6eeb0e5caffba1fca22e12878c450e6ef09434888f04c6a97b6f50c75d4@127.0.0.1:30303\")' | $polygon_bin attach ${syncer_polygom_data_dir}/bor.ipc"

export bootstrap_data_dir="$RUN_DIR/data/bootstrap"

is_authrpc_supported() {
    if geth version 2>/dev/null | grep -Eq "1\.(10.[2-9][0-9]|1[1-9].[0-9]*)-(fh[0-9]+|dm)"; then
    echo "true"
  else
    echo "false"
  fi
}

recreate_data_directories() {
  local component
  for component in "$@"; do
    # Dynamically access one of `miner_data_dir`, `syncer_geth_data_dir`, syncer_polygon_data_dir` or `oracle_data_dir`
    data_dir=`dynamic_var_name=${component}_data_dir; echo ${!dynamic_var_name}`

    if [[ $component != "oracle_common" && $component != "oracle_polygon" ]]; then
      rm -rf "$data_dir"
    fi

    mkdir -p "$data_dir" &> /dev/null

    if [[ $component == "miner" || $component == "syncer_geth" || $component == "bootstrap" ]]; then
      cp -a "$GENESIS_DIR/geth" "$data_dir/geth"
      cp -a "$genesis_json" "$data_dir/"
    fi

    if [[ $component == "miner" ]]; then
      cp -a "$KEYSTORE_DIR" "$data_dir/keystore"
      cp -a "$BOOT_DIR/nodekey" "$data_dir/geth"

      # Ensure miner bootstrap with correct data when using polygon chain
      cp -a "$GENESIS_DIR/bor" "$data_dir/bor"
      cp -a "$BOOT_DIR/nodekey" "$data_dir/bor"
    fi

    if [[ $component == "syncer_geth" ]]; then
      cp -a "$BOOT_DIR/static-nodes.json" "$data_dir/geth"
    fi

    if [[ $component == "syncer_polygon" ]]; then
      cp -a "$GENESIS_DIR/bor" "$data_dir/bor"
      cp -a "$genesis_json" "$data_dir/"
      cp -a "$BOOT_DIR/static-nodes.json" "$data_dir/bor"
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
        echo "Last 25 lines of log"
        tail -n 25 $process_log

        echo
        echo "See full logs with 'less `relpath $process_log`'"
      fi

      kill -s TERM $parent_pid &> /dev/null
      exit 0
    fi

    sleep 1
  done
}

is_geth_version() {
  geth_bin="$1"
  pattern="$2"

  if ! $geth_bin version 2>/dev/null | grep -qE "$pattern"; then
    echo "false"
  else
    echo "true"
  fi
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

relpath() {
  if [[ $1 =~ /* ]]; then
    # Works only if path is already absolute and do not contain ,
    echo "$1" | sed s,$PWD,.,g
  else
    # Print as-is
    echo $1
  fi
}
