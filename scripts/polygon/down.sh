#!/bin/bash
pushd "$(dirname "${BASH_SOURCE[0]}")"
    docker-compose down
popd
