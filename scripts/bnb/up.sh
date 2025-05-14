#!/bin/bash


if docker ps -a |grep -w bnb-miner-1; then
    if [ "$1" == "-c" ]; then
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
    docker-compose up
popd
