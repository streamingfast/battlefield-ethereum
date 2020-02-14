#!/usr/bin/env bash

ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

BROWN='\033[0;33m'
NC='\033[0m'

SOLC_CONTAINER=${SOLC_CONTAINER:-"ethereum/solc"}
SOLC_VERSION=${SOLC_VERSION:-"0.5.4"}

image_id="${SOLC_CONTAINER}:${SOLC_VERSION}"
solc_args="-o ./build --overwrite --abi --bin"

function main {
    debug "Building contracts with image id $image_id and solc args $solc_args"

    set +e
    images=`docker images | grep -E "${SOLC_CONTAINER}\s+${SOLC_VERSION}"`
    exit_code=$?
    if [[ $exit_code != 0 ]]; then
        echo "Docker image [${image_id}] does not exist yet, pulling it..."
        docker pull ${image_id}
    fi
    set -e

    if [[ $1 == "clean" ]]; then
        $ROOT/clean.sh
        echo ""
    fi

    mkdir -p $ROOT/build

    echo "Compiling contracts"

    build_contract main
    build_contract child
    build_contract grandchild
    build_contract suicide
}

function build_contract {
    echo "Compiling contract $1"

    build_sum="contract/build/$1.sum"
    src_file="contract/src/$1.sol"

    debug "Building contract $1 (Source $src_file, Checksum $build_sum)"

    source_checksum=`cat $build_sum 2>/dev/null || echo "<File not found>"`
    actual_checksum=`revision $src_file`

    debug "Source $source_checksum | ($build_sum)"
    debug "Actual $actual_checksum | ($src_file)"

    if [[ "$source_checksum" != "$actual_checksum" ]]; then
        docker run --rm -it -v "$ROOT:/contract" -w /contract "${image_id}" $solc_args src/$1.sol
        echo $actual_checksum > $build_sum
    fi
}

function revision {
    cmd=shasum256
    if [[ ! -x "$(command -v $cmd)" ]]; then
        cmd="shasum -a 256"
    fi

    debug "Command for checksum will be '$cmd $@'"
    echo `$cmd $1 | cut -f 1 -d ' '`
}

function debug {
    if [[ $DEBUG != "" ]]; then
        >&2 echo "$@"
    fi
}

main "$@"