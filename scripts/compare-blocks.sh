HEAD=$(( $(fireeth tools firehose-client --plaintext localhost:8089 -- -1:   |head -n 1 |jq .block.number) - 200 ))
fireeth tools compare-blocks-rpc --plaintext localhost:8089  http://localhost:8545 0 $HEAD
