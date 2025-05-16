#!/bin/bash
pushd "$(dirname "${BASH_SOURCE[0]}")"

if [ "$1" = "-c" ]; then
  docker-compose down
  docker-compose up --build --detach
else
  docker-compose up --detach
fi

popd
