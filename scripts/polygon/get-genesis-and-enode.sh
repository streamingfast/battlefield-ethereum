#!/bin/bash -eu

address=$1
ENODE=$(docker exec -ti bor0 curl --data '{"method":"admin_nodeInfo","params":[],"id":1,"jsonrpc":"2.0"}'  -H "Content-Type: application/json" -X POST localhost:8545 | jq -r .result.enode)
docker cp bor0:/var/lib/bor/genesis.json ./genesis.json 2>/dev/null

echo $ENODE | sed "s/@[0-9].*/@"$address"/"
