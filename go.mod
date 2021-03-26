module github.com/dfuse-io/ethereum.battlefield

go 1.14

require (
	github.com/dfuse-io/dfuse-ethereum v0.0.0-20210308214808-83fd492365a4
	github.com/dfuse-io/jsonpb v0.0.0-20200819202948-831ad3282037
	github.com/dfuse-io/logging v0.0.0-20210109005628-b97a57253f70
	github.com/eoscanada/bstream v1.7.0 // indirect
	github.com/eoscanada/eos-go v0.9.1-0.20200805141443-a9d5402a7bc5 // indirect
	github.com/golang/protobuf v1.4.3
	github.com/google/go-cmp v0.5.4
	github.com/lithammer/dedent v1.1.0
	github.com/manifoldco/promptui v0.7.0
	github.com/spf13/cobra v1.0.0
	github.com/stretchr/testify v1.6.1
	go.uber.org/zap v1.16.0
	golang.org/x/crypto v0.0.0-20201002170205-7f63de1d35b0
)

replace github.com/gorilla/rpc => github.com/dfuse-io/rpc v1.2.1-0.20200218195849-d2251f4fe50d
