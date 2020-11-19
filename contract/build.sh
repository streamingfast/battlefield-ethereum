#!/usr/bin/env bash

ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"


BROWN='\033[0;33m'
NC='\033[0m'
SOLC_CONTAINER=${SOLC_CONTAINER:-"ethereum/solc"}
SOLC_VERSION=${SOLC_VERSION:-"0.6.6"}

main() {
  pushd "$ROOT" &> /dev/null

  clean=

  while getopts "hc" opt; do
    case $opt in
      h) usage && exit 0;;
      c) clean=true;;
      \?) usage_error "Invalid option: -$OPTARG";;
    esac
  done
  shift $((OPTIND-1))

  contracts="$@"
  if [[ $# -lt 1 ]]; then
    contracts=`cd src; find . -type f -maxdepth 1 -name '*.sol'`
  fi

  set +e
  images=`docker images | grep -E "${SOLC_CONTAINER}\s+${SOLC_VERSION}"`
  exit_code=$?
  if [[ $exit_code != 0 ]]; then
      echo "Docker image [${image_id}] does not exist yet, pulling it..."
      docker pull ${image_id}
  fi
  set -e

  if [[ $clean == true ]]; then
    ./clean.sh
    echo ""
  fi

   mkdir -p ./build

  echo "Compiling contracts"
  for contract in $contracts; do
    name=`printf $contract | sed 's/^\.\///g' | sed 's/^src\///g' | sed 's/.sol$//g'`

    solc_version=${SOLC_VERSION}
    if [[ $name =~ UniswapV2Factory* || $name =~ UniswapV2Pair* ]]; then
      solc_version="0.5.16"
    elif [[ $name =~ UniswapV2* ]]; then
      solc_version="0.6.6"
    elif [[ $name =~ EIP* ]]; then
      solc_version="0.4.21"
    fi

    build_contract $name $solc_version
  done
}

build_contract() {
  name="$1"
  solc_version="${2:-$SOLC_VERSION}"

  build_sum="./build/$1.sum"
  src_file="./src/$1.sol"

  debug "Building contract $name (Source $src_file, Checksum $build_sum)"

  source_checksum=`cat $build_sum 2>/dev/null || echo "<File not found>"`
  actual_checksum=`revision $src_file`

  debug "Source $source_checksum | ($build_sum)"
  debug "Actual $actual_checksum | ($src_file)"

  if [[ "$source_checksum" != "$actual_checksum" ]]; then
    echo "Compiling contract $1 (with solc ${solc_version})"
    image_id="${SOLC_CONTAINER}:${solc_version}"
    solc_args="-o ./build --overwrite --abi --bin"

    docker run --rm -it -v "`pwd`:/contract" -w /contract "${image_id}" $solc_args src/$1.sol
    echo $actual_checksum > $build_sum
  else
    echo "Contract $name source checksum is same as built one, skipping"
  fi
}

revision() {
  cmd=shasum256
  if [[ ! -x "$(command -v $cmd)" ]]; then
    cmd="shasum -a 256"
  fi

  debug "Command for checksum will be '$cmd $@'"
  echo `$cmd $1 | cut -f 1 -d ' '`
}

debug() {
  if [[ $DEBUG != "" ]]; then
    >&2 echo "$@"
  fi
}

usage_error() {
  message="$1"
  exit_code="$2"

  echo "ERROR: $message"
  echo ""
  usage
  exit ${exit_code:-1}
}

usage() {
  echo "usage: build.sh [-c] [<contract> ...]"
  echo ""
  echo "Build all (or specific) contracts found within this folder."
  echo ""
  echo "Options"
  echo "    -c          Clean prior building contracts"
  echo "    -h          Display help about this script"
}

main "$@"
