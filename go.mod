module github.com/streamingfast/battlefield-ethereum

go 1.14

require (
	github.com/golang/protobuf v1.5.2
	github.com/google/go-cmp v0.5.9
	github.com/spf13/cobra v1.6.1
	github.com/streamingfast/cli v0.0.4-0.20230610024659-0c1862bfd186
	github.com/streamingfast/firehose-ethereum v1.4.6-0.20230614203150-b3e51591a045
	github.com/streamingfast/firehose-ethereum/types v0.0.0-20230614203150-b3e51591a045
	github.com/streamingfast/jsonpb v0.0.0-20210811021341-3670f0aa02d0
	github.com/streamingfast/logging v0.0.0-20230608130331-f22c91403091
	github.com/stretchr/testify v1.8.2
	go.uber.org/zap v1.24.0
)

replace github.com/gorilla/rpc => github.com/dfuse-io/rpc v1.2.1-0.20200218195849-d2251f4fe50d
