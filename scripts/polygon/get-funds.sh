#!/bin/bash -eu

docker exec -ti bor0 bor attach /var/lib/bor/data/bor.ipc --exec "eth.sendTransaction({from: \"0x4196A1a1E21a53e1BAA3A0A5a2A1203571B250cD\", to: \"0x821B55D8AbE79bC98f05Eb675fDc50dFe796B7Ab\", value: web3.toWei(1000000, \"ether\")})"
