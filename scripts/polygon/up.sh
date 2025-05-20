#!/bin/bash

if [ "$1" == "2.3" ]; then
    export TAG=v1.5.5
elif [ "$1" == "3.0" ]; then
    export TAG=v2.0.3
else
    echo "Error: First argument must be either 2.3 or 3.0"
    exit 1
fi

pushd "$(dirname "${BASH_SOURCE[0]}")"
    if docker ps -a |grep -w bor0 || [ -d ./data ]; then
        if [ "$2" == "-c" ]; then
            docker-compose down
            docker-compose rm -f
            rm -rf ./data
            cp -a bootstrap data
        else
            echo "################### WARNING ###################"
            echo "Starting from EXISTING container (use $0 -c to remove existing container)"
            echo "###############################################"
            sleep 4
        fi
    fi
    docker-compose up --build --detach
popd

(
i=0
while sleep 2; do
    docker logs heimdall0|grep -q 'Creating and broadcasting new milestone'  && exit 0
    echo "Waiting for create its first milestone... (this may take a minute) - $i"
    i=$((i+1))
done
)

if [ $? -eq 0 ]; then
    echo "Milestone created successfully!"
    echo "- You may now run './scripts/run_firehose_polygon.sh $1'"
    echo ""
    echo "Additionally, you may run './scripts/load-polygon-system-contracts.sh $1', but it is not required for the firehose tests"
fi
