#!/bin/bash -eu

docker exec -ti bnb-miner-1 geth attach --exec "eth.sendTransaction({from: \"0x9fB29AAc15b9A4B7F17c3385939b007540f4d791\", to: \"0x821B55D8AbE79bC98f05Eb675fDc50dFe796B7Ab\", value: web3.toWei(1000000, \"ether\")})"
