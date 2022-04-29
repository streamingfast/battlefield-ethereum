module github.com/streamingfast/battlefield-ethereum

go 1.14

require (
	github.com/golang/protobuf v1.5.2
	github.com/google/go-cmp v0.5.7
	github.com/lithammer/dedent v1.1.0
	github.com/manifoldco/promptui v0.8.0
	github.com/spf13/cobra v1.3.0
	github.com/streamingfast/jsonpb v0.0.0-20210811021341-3670f0aa02d0
	github.com/streamingfast/logging v0.0.0-20220405224725-2755dab2ce75
	github.com/streamingfast/sf-ethereum v0.0.0-20220429152532-8e31abc620d6
	github.com/streamingfast/sf-ethereum/types v0.0.0-20220429152022-7dc5771ffa35
	github.com/stretchr/testify v1.7.1-0.20210427113832-6241f9ab9942
	go.uber.org/zap v1.21.0
	golang.org/x/crypto v0.0.0-20220214200702-86341886e292
)

replace github.com/gorilla/rpc => github.com/dfuse-io/rpc v1.2.1-0.20200218195849-d2251f4fe50d
