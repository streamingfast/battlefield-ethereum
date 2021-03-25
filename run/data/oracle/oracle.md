## Transaction Log (Thu Mar 25 14:40:59 EDT 2021)

```
Geth
Version: 1.9.13-stable
Architecture: amd64
Protocol Versions: [65 64 63]
Go Version: go1.15.5
Operating System: darwin
GOPATH=/Users/maoueh/work
GOROOT=/usr/local/Cellar/go/1.15.5/libexec
```

```
$ /Users/maoueh/work/dfuse/ethereum.battlefield/node_modules/.bin/ts-node src/main.ts
Configuration
 Network: local
 Default address: 0x821b55d8abe79bc98f05eb675fdc50dfe796b7ab
 RPC Endpoint: http://localhost:8545

Deploying contracts...
Deploying contract 'Child'
Deploying contract 'EIP20Factory'
Deploying contract 'UniswapV2Factory'
Deploying contract 'Main'
Deploying contract 'Suicidal'
Deploying contract 'Suicidal'
Deploying contract 'GrandChild'

Contracts
- main => 0x929bc44BBD41Ca0e621dc50f7c7E3204Ce026258
- child => 0x71940c77ccadaeA1238CEa27674E6253128ca177
- grandChild => 0x314F9285cbC3835e676974abDb7d2ab45ede3686
- suicidal1 => 0xCae819bff9B75c3D34971C19e005F2cAD7354E0f
- suicidal2 => 0xEC9C1fCee156bf34Ba4fB5D38C9CF09Df16723eF
- uniswap => 0x9a77F7b94488d24EcA50FA0d144212AE48300A71
- erc20 => 0x702641c70a11E480F646Ed247d078c65aBAAC5DE

Transaction Links
- main => http://localhost:8080/tx/0x8071c226b8a6899e793f8094e408d7348714647e4991aedcea76b1ba1c197bf6
- child => http://localhost:8080/tx/0x8f1ea8065402d525ed02be23749b1b8f82c7896ce4292b9fdef541da62d58c31
- grandChild => http://localhost:8080/tx/0xfe58387d854e1eb80591906dff51fc97179a507a3084c244f8894b5e0dab79c0
- suicidal1 => http://localhost:8080/tx/0xd8550ee33c1c42b2f2c78dbaa0e7a05e2800d8b354fe20920a026afb93c4a518
- suicidal2 => http://localhost:8080/tx/0xdb817b0906b80b24654db5951f054aa42b2ff282bf29f0a4c37b38af6f008236
- uniswap => http://localhost:8080/tx/0x0c7ea66c4bce580d2e4fa6283b57a3fe665c3cdd064144acc211c48e69fa7555
- erc20 => http://localhost:8080/tx/0x411c3ddb69f9ac1de3f01cb93abaf811b59339562fe6aed8a1682ceb334b257b

Performing pure 'transfer' transactions
Pushed transaction 'http://localhost:8080/tx/0x5a215c52d4626649d12dd5ba78d6c04ab43e80d6a25e61f50d091562c2b06ad3' (pure transfer: existing address)
Pushed transaction 'http://localhost:8080/tx/0xec6ab9a187d19e7d20c80508440f9cebdb308decf08a336e7e43b66298af433c' (pure transfer: existing address with custom gas limit & price)
Pushed transaction 'http://localhost:8080/tx/0xaae6b64b58ff2ae9ef249eea35aff7a1b6fde60c947d20eba40feb7e16d29aab' (pure transfer: inexistant address creates account and has an EVM call)
Pushed transaction 'http://localhost:8080/tx/0x50555e633a9df297ad1a3475a52db5158d92a8a307dd225c2344dc715168980f' (pure transfer: transfer of 0 ETH to inexistant address generates a transaction with no EVM call)

Performing 'transfer' through contract transactions
Pushed transaction 'http://localhost:8080/tx/0x11d704137ee2ebce5f0c319272e8a44d8180d311d9b2ed232424fb74e6b31031' (nested transfer through contract: existing addresss)
Pushed transaction 'http://localhost:8080/tx/0xae7b3029384b604a7119e95b84b075496bd320003a59b9789ece828b05807542' (transfer through contract: inexistant address creates account and has an EVM call)
Pushed transaction 'http://localhost:8080/tx/0x3db1ddb221627ba737ae2ac1b24eb29dd12e8131b45afd8d2ff4bf53cbeed847' (nested transfer through contract: inexistant address creates account and has an EVM call)
Pushed transaction 'http://localhost:8080/tx/0x70e82e61896d09f9b3d8b3c4201989a022365ec370526d464a7a60cd780fd4a3' (transfer through contract: existing addresss)

Performing failing 'transfer' through contract transactions
Pushed transaction 'http://localhost:8080/tx/0x50f739f016dc5285fd0ffc338375fac9070e864d5dff2bab52cf8aa456f54b6e' (transfer through contract: existing addresss correctly failed with EVM reverted without reason)

Performing 'log' transactions
Pushed transaction 'http://localhost:8080/tx/0x1a4559c55ce792656c38d096cccda855d1b620d9bbd343c4d41bec72d82e2a5c' (log: all indexed)
Pushed transaction 'http://localhost:8080/tx/0xdcc94b348a11ebb1830afd2ce537e13c0c3209eb0bcaa73410963996a30cb53e' (log: all mixed)
Pushed transaction 'http://localhost:8080/tx/0xaf73a6cc9b3ac6caabbc601e927e3e5cd04614edafdb1dfe1cee3f0d8967f1bc' (log: multi)
Pushed transaction 'http://localhost:8080/tx/0xc7d6bded6302bb94a85ab35620f83ba0748039cee92d01762f7e209676c177d4' (log: all)
Pushed transaction 'http://localhost:8080/tx/0xea232c789ea3330571775e8011861ec91ae5f99efed01563034ed86c911b06ee' (log: single)
Pushed transaction 'http://localhost:8080/tx/0x6713d6114b4a74eaa09196b437381e9fb63b6525a8fcb7b7404d78bbbeae594e' (log: empty)

Performing 'storage & input' transactions
Pushed transaction 'http://localhost:8080/tx/0x25256385eefd5bcaa7686d80f7b3846123c95955820319e55d6117a5b29f201a' (input: string equal 0)
Pushed transaction 'http://localhost:8080/tx/0xad86a19e7fcba58dff9eb466bb51176682d1db30c0ae70a1e8b22186fe71922f' (input: string equal 15)
Pushed transaction 'http://localhost:8080/tx/0xe7ff807ea66347b781e2bd2ee798b23bb51045ab4fc4dd5e940ce04eb671a99e' (input: string equal 30)
Pushed transaction 'http://localhost:8080/tx/0xd7c70dea3b4e645920331ce0eab1d337166476763b714aebed0efa34737fc0cc' (input: string equal 31)
Pushed transaction 'http://localhost:8080/tx/0x169c20087ac7656758ac3ba826bde3a57646b5a83bb24f38a677acaa02273387' (input: string longer than 32)
Pushed transaction 'http://localhost:8080/tx/0xba0b1a3b99bfc1fe752f3b0b11be7c77f9bdf685cd7907f90d5554252fd8cbf5' (storage: set long string)
Pushed transaction 'http://localhost:8080/tx/0x309e84f9a7b74a986d43a85286f84b526f99ff6614b53f2cc7fb03e8dc73156c' (input: string equal 32)
Pushed transaction 'http://localhost:8080/tx/0x4dee4a18fbab0f8eb51b4cd3077eeae0641b63a76c3b7ee76b1c72dcd98f59ad' (storage: array update)

Performing 'call' transactions
Pushed transaction 'http://localhost:8080/tx/0x6e33616cc4e4cf75b27d0522d8be89e88bbfa888d8af0a5ff91c25ae580e5991' (call: nested call revert state changes)
Pushed transaction 'http://localhost:8080/tx/0x88f1788a4d06999d8dd0c1e6be1606ffd0812af76f4c8b61af300c5f8fe151e1' (call: contract creation from call, without a constructor)
Pushed transaction 'http://localhost:8080/tx/0xefe93c2a8ad68b57104619838b6225978f1cb4c1994a4ffe656f3412c3b4c2aa' (call: contract creation from call, with constructor)
Pushed transaction 'http://localhost:8080/tx/0x98e98aa46e8c1d57074508080122fca317a2e444af5d80f40f14fa1a06677660' (call: contract creation from call, with constructor that will fail correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0x6b0c5c4d7bc3fa5ba52da9fed6fbfc58c6cf087b8ecbc22b483198784d9e15db' (call: contract creation from call, recursive constructor, second will fail correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0xb0effc4f3819ed288f9e44b743e452b7c72a934c993c11a31b516a1833599e53' (call: nested fail with native transfer)
Pushed transaction 'http://localhost:8080/tx/0x0853060631850ac441a6ae88ea3713533b75420f3cc80d871e69afcc134c9171' (call: all pre-compiled)
Pushed transaction 'http://localhost:8080/tx/0xd408a433e2fdf83d1c3c7e6e8fd819ee14d9e1197621fe6e175ae91e1524a114' (call: complete call tree)
Pushed transaction 'http://localhost:8080/tx/0x7804d934acbbf90670700c5e498d7fc6a0e14a4a3f2401dde01f3c68b0eff187' (call: assert failure root call correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0x654deb6e4cde4bb0e1f9dee4e7971a9281a862363a12796986aa048a9b589d0a' (call: assert failure on child call correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0x7297ed2b5bc3b94d8f3711f86379594a767f97d83559cd0df77ea51fd2844aa4' (call: revert failure root call correctly failed with EVM reverted without reason)

Performing 'gas' transactions
Pushed transaction 'http://localhost:8080/tx/0x497c17af3e4869161708359881e9f98ee50ec70daefe7257171e2e84b55bd763' (gas: nested low gas)
Pushed transaction 'http://localhost:8080/tx/0xee035ba944b5b48aa9fc96be7718111cde251044cce3f3f1cfdb6e305f4b4db5' (gas: empty call for lowest gas)
Pushed transaction 'http://localhost:8080/tx/0x622f37da8ed8038a17416d5a31d3ccdf272ef236fae0c00b7d68801c1c0de6ba' (gas: deep nested low gas)
Pushed transaction 'http://localhost:8080/tx/0xba53cea6e26c844253dfec4d7a98c4bcc1be4f2dfc415faf89063603d809af21' (gas: deep nested nested call for lowest gas)
Pushed transaction 'http://localhost:8080/tx/0xa4f0e225c20a116061fe2c94ad67c6bee9b818b005640f895e4935b25d85b8aa' (gas: deep nested call for lowest gas)

Performing 'suicide' transactions
Pushed transaction 'http://localhost:8080/tx/0xf43db9c1d24ea4b4feebf64531316e36b19af8537a98fb2155f71b9e3e8ed13b' (suicide: contract does not hold any Ether)
Pushed transaction 'http://localhost:8080/tx/0xa76384f686752c730a81bbffa0e2ffaad2fbd62f1b914daa389bd7706c9d5191' (suicide: transfer some Ether to contract that's about to suicide itself)
Pushed transaction 'http://localhost:8080/tx/0xc2dcc7370f4097bc7f4fbb7b051e34c95b9c7b8cb40bb7e92e534a043050bae5' (suicide: contract does hold some Ether, and refund owner on destruct)

Completed battlefield deployment (local)
```
