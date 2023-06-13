## Transaction Log (Tue Jun 13 19:36:16 EDT 2023)

```
Bor
Version: 0.4.0-beta-5-fh2
Architecture: arm64
Go Version: go1.20.4
Operating System: darwin
GOPATH=
GOROOT=/opt/homebrew/Cellar/go/1.20.4/libexec
```

```
$ /Users/maoueh/work/sf/ethereum.battlefield/node_modules/.bin/ts-node src/main.ts
Initializing runner...
Configuration
 Network: local
 Default address: 0x821b55d8abe79bc98f05eb675fdc50dfe796b7ab
 RPC Endpoint: http://localhost:8545

Deploying contracts...
Deploying contract 'GrandChild'
Deploying contract 'UniswapV2Factory'
Deploying contract 'Child'
Deploying contract 'Main'
Deploying contract 'Suicidal'
Deploying contract 'EIP20Factory'
Deploying contract 'Suicidal'

Contracts
- main => 0x929bc44BBD41Ca0e621dc50f7c7E3204Ce026258
- child => 0x9a77F7b94488d24EcA50FA0d144212AE48300A71
- grandChild => 0x71940c77ccadaeA1238CEa27674E6253128ca177
- suicidal1 => 0xEC9C1fCee156bf34Ba4fB5D38C9CF09Df16723eF
- suicidal2 => 0x314F9285cbC3835e676974abDb7d2ab45ede3686
- uniswap => 0x702641c70a11E480F646Ed247d078c65aBAAC5DE
- erc20 => 0xCae819bff9B75c3D34971C19e005F2cAD7354E0f

Transaction Links
- main => http://localhost:8080/tx/0xa2405de809483efe23f1ed4f940a27153bb4107da087ab1cf3476ac8c2e2ea4e
- child => http://localhost:8080/tx/0x9fe4d14925d8a209cd9eb801f0e78b472df77524b6cc3348fd703e5cb9329343
- grandChild => http://localhost:8080/tx/0x44d41a518c0ae877c0b0a4a5be9ce7629f250f8355ee05c69b2353ec214cf997
- suicidal1 => http://localhost:8080/tx/0xc8ffb172055b467e4cf90fbe00fa43f62d0bb2b188d7ff842aa430bfb306ba00
- suicidal2 => http://localhost:8080/tx/0x0591bbf2393be3e84af143b8d1ac4dac5dedb4aed215b7fea34bc21a61db86a6
- uniswap => http://localhost:8080/tx/0xcf122e9d894175dd124c6e530a5fde059ec4f5eaff1ce94b5ce2c5cc62d3701b
- erc20 => http://localhost:8080/tx/0x5f2c1ddb03b7b26c714d8c76bb2a8079aa72ce60236f1cf95890f28a6aeb084d

Performing pure 'transfer' transactions
Pushed transaction 'http://localhost:8080/tx/0xec6ab9a187d19e7d20c80508440f9cebdb308decf08a336e7e43b66298af433c' (pure transfer: existing address with custom gas limit & price)
Pushed transaction 'http://localhost:8080/tx/0x1abd13b1d1abecdde4685de6ea5fa6bbbfc60f6cc2da3971322d993c57bcb30c' (pure transfer: inexistant address creates account and has an EVM call)
Pushed transaction 'http://localhost:8080/tx/0x5a215c52d4626649d12dd5ba78d6c04ab43e80d6a25e61f50d091562c2b06ad3' (pure transfer: existing address)
Pushed transaction 'http://localhost:8080/tx/0x80597da349c44091384c19aba137502a78232c31d6a968ae03ef32145865b185' (pure transfer: transfer of 0 ETH to inexistant address generates a transaction with no EVM call)

Performing 'transfer' through contract transactions
Pushed transaction 'http://localhost:8080/tx/0x31d056f0226a688deb701043a513e65741a586bd545751be4c813008cf4afff1' (transfer through contract: existing addresss)
Pushed transaction 'http://localhost:8080/tx/0xa541157209b2435d658ecda95ad7d3b353fde130fc07790090c2b58bc71b470d' (nested transfer through contract: inexistant address creates account and has an EVM call)
Pushed transaction 'http://localhost:8080/tx/0xf8acac86039b42659a43e00739d0f07b7a1251017ee64b35475353ece7dba076' (nested transfer through contract: existing addresss)
Pushed transaction 'http://localhost:8080/tx/0x802307b5ced0d44b27393b3c148db2115058ad6bf7a81aa4702a6901341dad9a' (transfer through contract: inexistant address creates account and has an EVM call)

Performing failing 'transfer' through contract transactions
Pushed transaction 'http://localhost:8080/tx/0x50f739f016dc5285fd0ffc338375fac9070e864d5dff2bab52cf8aa456f54b6e' (transfer through contract: existing addresss correctly failed with EVM reverted without reason)

Performing 'log' transactions
Pushed transaction 'http://localhost:8080/tx/0x1bb0b32cde5bf40c8f1e06c7cf91cd2ee94900f306069b8f3181918f3bc39c31' (log: all)
Pushed transaction 'http://localhost:8080/tx/0xd763be2a1ceda8bde72b8f6be893907965504607bc5e3402042509b750058178' (log: multi)
Pushed transaction 'http://localhost:8080/tx/0x3991ab48cc661ffc50880356799a0e63f92de2e3d9c310444a3390e8a17813ce' (log: single)
Pushed transaction 'http://localhost:8080/tx/0xe7ee3fd8f4d17f3a90786bcc6c4ed82b1711098566ae8ec44c43d23d222c1b87' (log: all mixed)
Pushed transaction 'http://localhost:8080/tx/0xc362118a967952fb9ebf7aa8e1a6bbaab5a68ee8dce3820bdb280356fcb12732' (log: log in sub-call that fails but top-level trx succeed)
Pushed transaction 'http://localhost:8080/tx/0xb68305780caa4d297cdb1b09605f091cf64bfe08b6d2af2d97b8b1e565f19120' (log: empty)
Pushed transaction 'http://localhost:8080/tx/0x3654aa65fa6e0f2bd5c806fe92bc0bf394a6899219e46c884232c7df20016103' (log: all indexed)
Pushed transaction 'http://localhost:8080/tx/0x400430f5f28381cadb5f9a7c29f293da27be4c8da6872df07628bcde68c34d07' (log: log in top-level trx and then top-leve trx fails correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0x810354a85a4c3811f601ca30e7a57be1569bd246da23e99a6f02c5d1bdeaad49' (log: log in sub-call that succeed but top-level trx fails correctly failed with EVM reverted without reason)

Performing 'storage & input' transactions
Pushed transaction 'http://localhost:8080/tx/0x09e5ab053f737d4a44399773e950bf7879ddb775e90b4494aa4ea3f3ebb77906' (input: string equal 15)
Pushed transaction 'http://localhost:8080/tx/0x9f6e39b0db25977c2c115e929538b5f3ad9056a43da9a95ff2890a60fb4bb819' (input: string equal 31)
Pushed transaction 'http://localhost:8080/tx/0x9668bd5a47680ef7477282e4e0069360747e70280120051c275fd85712a7edd2' (input: string equal 32)
Pushed transaction 'http://localhost:8080/tx/0x39c8d79ef348b4d89a56bdba649f2863a34eca8a3a01fb4b53e9bab3905b63d3' (storage: set long string)
Pushed transaction 'http://localhost:8080/tx/0x53baf99f620e1396a3bad10fc96d228be849d5d06f6134c1c105ad5bf8a6a031' (input: string longer than 32)
Pushed transaction 'http://localhost:8080/tx/0xdf95d3b371de1420d17739516c46f26be2eda4fade5d4b503513249dd1814175' (input: string equal 30)
Pushed transaction 'http://localhost:8080/tx/0xd90cd21535fb874e9426effa2a4acd95bd19540549b504e0f2dc76f97f195ebb' (input: string equal 0)
Pushed transaction 'http://localhost:8080/tx/0x328e9d3cf75befa67a644b81a22c95df36b4d2fb98c115828975aca84be4d377' (storage: array update)

Performing 'call' & 'constructor' transactions
Pushed transaction '' (call: contract fail just enough gas for intrinsic gas correctly failed with Returned error: intrinsic gas too low)
Pushed transaction 'http://localhost:8080/tx/0x3fe4fa7372566a4483831424d6bb3ba8d361ddf133eead4e0f2e0aae98e9bcf3' (call: contract with create2, inner call fail due to insufficent funds then revert correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0xa0044033206af1c9cc18d334e9fcee3584ad170170869aabb6793d7e84f7dae0' (call: assert failure root call correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0xed0b30a6fc3ce945defb93fc0796d2ecb2223a00dcaec6e606b7f1e16666613e' (call: contract creation from call, with constructor that will fail correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0x4f0c445c2a9eb5aba38afca13c6609c42376dc033abaa19e12c68bb97a68fc47' (call: all pre-compiled)
Pushed transaction 'http://localhost:8080/tx/0x3dfb1e6a40896cf9819d8732d2f5d531623b8bb83b2708bb216d0c6f5632b968' (call: complete call tree)
Pushed transaction 'http://localhost:8080/tx/0xe8e9166a6a4fd7743f98653ca51f9cd56dd497a2ec62bf3b613f2e6f8a04a108' (call: contract creation from call, with constructor)
Pushed transaction 'http://localhost:8080/tx/0xe083bda296702fcd945e13d809ba6734ee8ce1621ba934762e8d6af57f9fc46d' (call: nested call revert state changes)
Pushed transaction 'http://localhost:8080/tx/0x16e77fd0deaf5f39c41cf7ab1732d13a55eed7e250d14e4529236d47326fc746' (call: contract creation from call, recursive constructor, second will fail correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0x1b5c77ecfed4e068091f512421e0404669b577c14d6d31640a3e3976e545bef9' (call: contract creation from call, without a constructor)
Pushed transaction 'http://localhost:8080/tx/0xe4dd07ac76335d56aaa591b796dfd68ceeae7351bfa3d34462535e94e786dcb2' (call: revert failure root call correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0x5b3b0273f73e57b9b0dfb76ff22cb55c493e1d2ecc4655a24331271578069511' (call: contract with create2, inner call fail due to insufficent funds (transaction succeed though))
Pushed transaction 'http://localhost:8080/tx/0x45ff3edecf28c8fb6e517051900c34dce89e959b94507f2e2fddc911a6e152a1' (call: contract with create2, succesful creation)
Pushed transaction 'http://localhost:8080/tx/0xfeaed5bb05fe7d04d53d7b12165ff28e34e68fc38d502cd543bdbe1474b7f052' (call: assert failure on child call correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0x12b829b6179220dfdc3e7ebaf6f5d91812481ede35ce7af04ff4beb9de57f0f3' (call: nested fail with native transfer)
Pushed transaction 'http://localhost:8080/tx/0xd0a8459e5ec5f61ee7a19dba140af44e895f6bb06eef6519d4253de5a0b60c81' (call: contract fail not enough gas after code_copy correctly failed with The contract code couldn't be stored, please check your gas limit.)
Pushed transaction 'http://localhost:8080/tx/0xe024ef9ec227e9e58579619b897dfecc92fb1abef9e512ae20b098ee81c11054' (call: contract with create2, inner call fail due to address already exists (transaction succeed though))
Pushed transaction 'http://localhost:8080/tx/0xdc4eb07e36f38e993a5e41eba9dfdca0b5a95d1180eb20b34e64d7ccfe2a7f5a' (call: contract with create2, inner call fail due to address already exists then revert correctly failed with EVM reverted without reason)

Performing 'gas' transactions
Pushed transaction 'http://localhost:8080/tx/0x90b4d6696bae5eabe94954e0c73bcb4036bb2ea491160f2ab8a104d8cfc812fc' (gas: nested low gas)
Pushed transaction 'http://localhost:8080/tx/0x84529fe112beb5a94640cc385bc71db54b0c478900b39143b6111a9032e476c5' (gas: deep nested low gas)
Pushed transaction 'http://localhost:8080/tx/0x0a3bc9559b1615f45665f9a210dbc39cbc0ff0e142233510bd5cc5c814b4c196' (gas: deep nested nested call for lowest gas)
Pushed transaction 'http://localhost:8080/tx/0xd12cb45955ba331d3e4c1512cf3d15be71c4bcba79c093e82d24ae5f169ded1c' (gas: deep nested call for lowest gas)
Pushed transaction 'http://localhost:8080/tx/0x6b648c124fe7bc28205f5edec2c8a68a80b66c31e2d8ba57b671330611b9306e' (gas: empty call for lowest gas)

Performing 'suicide' transactions
Pushed transaction 'http://localhost:8080/tx/0x716227aa412e56665d19c931f557d09a031b5f19d6b4b8961543c932e2373571' (suicide: contract does not hold any Ether)
Pushed transaction 'http://localhost:8080/tx/0xd4f8fae9353a6b6945256663c3c55c7ad6281963c558b821b6abb42120855f64' (suicide: create contract, kill it and try to call within same call)
Pushed transaction 'http://localhost:8080/tx/0x72d8e90f7363c99f44155d60732e7c895070082a5308b0e60a6afc29bee658dd' (suicide: ensure suicidal2 bump is nonce by creating a contract (#1))
Pushed transaction 'http://localhost:8080/tx/0xa76bef6c9164f00c892f6fcfd129aff66339cc0a5d5804396e022bc6d79f6394' (suicide: ensure suicidal2 bump is nonce by creating a contract (#2))
Pushed transaction 'http://localhost:8080/tx/0x839bd57d9bd57290f49ab94fe71954a2c70750bdc15fa03aa310296ab8e76772' (suicide: transfer some Ether to contract suicide that's about to suicide itself)
Pushed transaction 'http://localhost:8080/tx/0x9f120bf7d80736bc41f417be52434345b52897915ac198b687001c607eaf2fad' (suicide: create contract to fixed address (create2), kill it and try instantiate it again at same address)
Pushed transaction 'http://localhost:8080/tx/0x7d4bbfca9e376f5ca744961833ca4cfde4e89dc0e8bd9170740138a0824c10fe' (suicide: create contract to fixed address (create2), kill it and try instantiate it again at same address)
Pushed transaction 'http://localhost:8080/tx/0xdc1e7cd81405220fcc714fbcb331e6f807eb851de9c2b313cfeeef42aba4c351' (suicide: contract does hold some Ether, and refund owner on destruct)
Pushed transaction 'http://localhost:8080/tx/0xc96be8c0e6d2278a7b01a8d2853c5639a07cb3b027ccef53fabf781d38b55ac2' (suicide: create contract, kill it and try to call within same call (second time to valid nonce change after suicide))

Completed battlefield deployment (local)
```
