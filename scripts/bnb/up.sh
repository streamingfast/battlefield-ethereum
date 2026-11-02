#!/bin/bash

usage() {
    echo "Usage: $0 [-c] [-j]"
    echo ""
    echo "  -c  Remove the existing miner container so the chain starts fresh"
    echo "  -j  Run bsc v1.8.1 with every fork through Jenner active (reth-bsc v0.1.3+ only, the"
    echo "      Firehose geth-BSC follower does not support Jenner yet)"
}

clean=false
jenner=false
while getopts "cjh" opt; do
    case $opt in
        c) clean=true ;;
        j) jenner=true ;;
        h) usage; exit 0 ;;
        *) usage; exit 1 ;;
    esac
done

if [ "$jenner" == "true" ]; then
    export BSC_GETH_VERSION=v1.8.1
    export BSC_JENNER=true
fi

if docker ps -a |grep -w bnb-miner-1; then
    if [ "$clean" == "true" ]; then
        docker stop bnb-miner-1
        docker rm bnb-miner-1
    else
        echo "################### WARNING ###################"
        echo "Starting from EXISTING container (use $0 -c to remove existing container)"
        echo "###############################################"
        sleep 4
    fi
fi

pushd "$(dirname "${BASH_SOURCE[0]}")"
    docker-compose up --build
popd
