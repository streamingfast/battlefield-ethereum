#!/bin/bash
export TAG=UNUSED
pushd "$(dirname "${BASH_SOURCE[0]}")"
    docker-compose down
popd
