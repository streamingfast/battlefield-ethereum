#!/usr/bin/env bash

ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

BROWN='\033[0;33m'
NC='\033[0m'

SOLC_CONTAINER=${SOLC_CONTAINER:-"ethereum/solc"}
SOLC_VERSION=${SOLC_VERSION:-"0.5.4"}

image_id="${SOLC_CONTAINER}:${SOLC_VERSION}"

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

solc_args="-o ./build --overwrite --abi --bin src/main.sol"
docker run --rm -it -v "$ROOT:/contract" -w /contract "${image_id}" $solc_args 1> /dev/null
