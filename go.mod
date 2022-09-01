module github.com/streamingfast/battlefield-ethereum

go 1.14

require (
	github.com/golang/protobuf v1.5.2
	github.com/google/go-cmp v0.5.8
	github.com/lithammer/dedent v1.1.0
	github.com/manifoldco/promptui v0.8.0
	github.com/spf13/cobra v1.5.0
	github.com/streamingfast/jsonpb v0.0.0-20210811021341-3670f0aa02d0
	github.com/streamingfast/logging v0.0.0-20220511154537-ce373d264338
	github.com/streamingfast/sf-ethereum v0.10.3-0.20220901175240-debc8243b1df
	github.com/streamingfast/sf-ethereum/types v0.0.0-20220901175240-debc8243b1df
	github.com/stretchr/testify v1.8.0
	go.uber.org/zap v1.21.0
	golang.org/x/crypto v0.0.0-20220315160706-3147a52a75dd
)

replace github.com/gorilla/rpc => github.com/dfuse-io/rpc v1.2.1-0.20200218195849-d2251f4fe50d
