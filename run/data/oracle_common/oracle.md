## Transaction Log (Wed Jan 10 15:37:45 EST 2024)

```
Geth
Version: 1.10.1-fh2.3
Architecture: arm64
Go Version: go1.21.5
Operating System: darwin
GOPATH=
GOROOT=/opt/homebrew/Cellar/go/1.21.5/libexec
```

```
Initializing runner...
Configuration
 Network: local
 Default address: 0x821b55d8abe79bc98f05eb675fdc50dfe796b7ab
 RPC Endpoint: http://localhost:8545

Deploying contracts...
Deploying contract 'Logs'
Deploying contract 'Calls'
Deploying contract 'Suicidal'
Deploying contract 'Child'
Deploying contract 'Suicidal'
Deploying contract 'EIP20Factory'
Deploying contract 'UniswapV2Factory'
Deploying contract 'Main'
Deploying contract 'GrandChild'

Contracts
- main => 0x34C044506dB54D3e8966300b7CBEFBb569b02C60
- calls => 0x702641c70a11E480F646Ed247d078c65aBAAC5DE
- logs => 0x71940c77ccadaeA1238CEa27674E6253128ca177
- child => 0x929bc44BBD41Ca0e621dc50f7c7E3204Ce026258
- grandChild => 0x410fd7B9368812207DCf674afCB5E359e1365011
- suicidal1 => 0xEC9C1fCee156bf34Ba4fB5D38C9CF09Df16723eF
- suicidal2 => 0x9a77F7b94488d24EcA50FA0d144212AE48300A71
- uniswap => 0x314F9285cbC3835e676974abDb7d2ab45ede3686
- erc20 => 0xCae819bff9B75c3D34971C19e005F2cAD7354E0f

Transaction Links
- main => http://localhost:8080/tx/0xc7e50d46c81e9f280736b2be14f086a25f201cf9b95c0ac90a0e82653a911f2a
- calls => http://localhost:8080/tx/0x4a652f36aebf10a3edefbd6a1b1df47ef6cb8b3ad502530458cfac0044ffb5cd
- logs => http://localhost:8080/tx/0xb6250a033c5e578467a6876b5c9d088ad7ccc9b6d5f3302cc0c613c0217ac7a9
- child => http://localhost:8080/tx/0x62bfeb3e7a384f780f815caf2f118375c33426d71aa695a2fed5285f3d16d2a0
- grandChild => http://localhost:8080/tx/0x66e6defd3be475facc7a6b898ba79fdf10d2c13f93d80388995963ec73c09c17
- suicidal1 => http://localhost:8080/tx/0xc8ffb172055b467e4cf90fbe00fa43f62d0bb2b188d7ff842aa430bfb306ba00
- suicidal2 => http://localhost:8080/tx/0x7d152174204af92c9e5e7884d1168ff08dfb44b0942988d4b8cba561ad6ff8f9
- uniswap => http://localhost:8080/tx/0x0e06cc07e411a4d1ee0a23610c260f4f691f3e752c0f1c5c89dc9419e071c48a
- erc20 => http://localhost:8080/tx/0x5f2c1ddb03b7b26c714d8c76bb2a8079aa72ce60236f1cf95890f28a6aeb084d

Performing pure 'transfer' transactions
Pushed transaction 'http://localhost:8080/tx/0x8b7fc816476771c54096e3ecaee9e963e79549622c306470c90fb517edcf8d13' (pure transfer: inexistant address creates account and has an EVM call)
Pushed transaction 'http://localhost:8080/tx/0x254f13e1ea8c651f527d1e57b0e82c433efc3e7a7a962a40d1db6c40a07a054f' (pure transfer: existing address)
Pushed transaction 'http://localhost:8080/tx/0xd49ae13dbb34ca0a47af51fed538217778d030bd489ce9bf388ce94be992a5e8' (pure transfer: existing address with custom gas limit & price)
Pushed transaction 'http://localhost:8080/tx/0x4ce8ffde03724857e1e9a4e23011fee18ffd596171348160c6256d4b520310f2' (pure transfer: transfer of 0 ETH to inexistant address generates a transaction with no EVM call)

Performing 'transfer' through contract transactions
Pushed transaction 'http://localhost:8080/tx/0x964fa214458b2af506191f75c7847d3661f255ec686107235f1e865bcc5cc08b' (transfer through contract: inexistant address creates account and has an EVM call)
Pushed transaction 'http://localhost:8080/tx/0x594682155db65459edcdf91bfe28342c6c68ca2884222646e6cc9f88002a8edd' (nested transfer through contract: existing addresss)
Pushed transaction 'http://localhost:8080/tx/0x71b1afd036873addfbc21d60f3f98fe577a756b3539a05b310ebccdd3e3fce90' (transfer through contract: existing addresss)
Pushed transaction 'http://localhost:8080/tx/0xb05c12c9c0b2cd180951053fc6fbaa8c3acae4eb446d4c76f3107533b96bbc17' (nested transfer through contract: inexistant address creates account and has an EVM call)

Performing failing 'transfer' through contract transactions
Pushed transaction 'http://localhost:8080/tx/0xcc29888a72c78152a168de522f2906dbf642deae77372e526cc0ef3dc271cc70' (transfer through contract: existing addresss correctly failed with EVM reverted without reason)

Performing 'log' transactions
Pushed transaction 'http://localhost:8080/tx/0x6d98a9b52d803a9b2a7d71092972bf32c5009204f27ebcd930cc9e7572d31d72' (log: all indexed)
Pushed transaction 'http://localhost:8080/tx/0x1e555385f41630a2fe2a4843c8fa8113b7eda309586bf7eb1eb9719868dd1cb4' (log: single)
Pushed transaction 'http://localhost:8080/tx/0x9e960ea53fe5c4435da20ffc0ba64918622d9364c5b66735225195c05f1c822a' (log: log in sub-call that fails but top-level trx succeed)
Pushed transaction 'http://localhost:8080/tx/0x383f7da8dca36712babbbfcf6ae2606c6d6d8e4779df9c8823272cf17ff800e5' (log: all)
Pushed transaction 'http://localhost:8080/tx/0x180be63b8dbcd5d8f37ae99006b167f027a03d6ddc76151a2853b64647a0da6b' (log: empty)
Pushed transaction 'http://localhost:8080/tx/0x1d8a232c40608baf09d38fcbfe84c0cfb857456411029acee68ad13fa9671396' (log: multi)
Pushed transaction 'http://localhost:8080/tx/0x957642f1dce3fe955b7456a5a5f23305ec158f104c6ca4088cd2abe76fe7dc55' (log: all mixed)
Pushed transaction 'http://localhost:8080/tx/0xf1cfe7e532b1c268e7e3a387184f60b6724048b2dca5b68bccbc204c6a902258' (log: log in top-level trx and then top-leve trx fails correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0x643445c4ef08d9fa0e7067a0215372caaa2f9089d4a12b2157ba160fe13d4e6b' (log: log in sub-call that succeed but top-level trx fails correctly failed with EVM reverted without reason)

Performing 'storage & input' transactions
Pushed transaction 'http://localhost:8080/tx/0xbe90fd6d02064d02250b961f73b76943132cb408707dafc57d4082cee44e0d3e' (input: string equal 0)
Pushed transaction 'http://localhost:8080/tx/0x8115b5db608b8786ea9ace08701521a7b974773f00a69f668def7e71128e6e86' (storage: set long string)
Pushed transaction 'http://localhost:8080/tx/0x2f6af2e95356e4a95e43b6ca0a34a23dc1e6061dcf65d58eddd2fe1d147ebeed' (input: string equal 32)
Pushed transaction 'http://localhost:8080/tx/0x4dc6e779326804cfcb0cca8c3070d7924bbf08877c6247fbc4ba4537d18d289d' (input: string longer than 32)
Pushed transaction 'http://localhost:8080/tx/0x78fea552c798198b856434450a2b810c4e146ae6619d83bf0013f5801559166b' (input: string equal 31)
Pushed transaction 'http://localhost:8080/tx/0x5089bd50f1ce66d71558d1621add529a43fff8188197e206234c5906371911a3' (input: string equal 30)
Pushed transaction 'http://localhost:8080/tx/0x36af2726b81f668ac7970d2b56aa11346319162373f1ef3321a90c4871d3151b' (input: string equal 15)
Pushed transaction 'http://localhost:8080/tx/0xa9d5a99024c42a3e73b2ca92bcaeca54a54063b994e68624dc111f4bf3f3d2ee' (storage: array update)

Performing 'call' & 'constructor' transactions (new contract)
Pushed transaction '' (call: contract fail just enough gas for intrinsic gas correctly failed with Returned error: intrinsic gas too low)
Pushed transaction 'http://localhost:8080/tx/0x596b42fb4e63c42407b805289b8e937f93b749562f2782b77b753d01d52b7a20' (call: complete call tree)
Pushed transaction 'http://localhost:8080/tx/0xef5e5b9bc0a4d24073da9574447428ac2e1baaee80d84861438d04a0768f8f1e' (call: contract fail not enough gas after code_copy correctly failed with The contract code couldn't be stored, please check your gas limit.)

Performing 'call' & 'constructor' transactions
Pushed transaction '' (call: contract fail just enough gas for intrinsic gas correctly failed with Returned error: intrinsic gas too low)
Pushed transaction 'http://localhost:8080/tx/0xeb0a45d7be228a31c07fda10b02d68b1776cb3c6e9b8044f9227a37d1d376e10' (call: contract creation from call, with constructor that will fail correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0x620ab8b4d8b8b79e3e6c61206255a7e5ac111ae7e4d8d5f28534aa7076e54684' (call: all pre-compiled)
Pushed transaction 'http://localhost:8080/tx/0x4477aafe3580f2cec75a071b13e1a0892195b2c0e2364927ac290a464a6383aa' (call: nested fail with native transfer)
Pushed transaction 'http://localhost:8080/tx/0x18ba66bdf400b6c9aa2fd3e20ac46e13f0dd0f1c36952148aba29b0c7dd1a6b3' (call: contract creation from call, without a constructor)
Pushed transaction 'http://localhost:8080/tx/0x029e649a8fc8a7fd6f51dc021f789df7ea93baf2cd374e930d7a21c3677e5c28' (call: nested call revert state changes)
Pushed transaction 'http://localhost:8080/tx/0xa6ec1ead6daef5ba19cfed984cf733a807b7a10247dd74f878efa4025f179928' (call: contract creation from call, with constructor)
Pushed transaction 'http://localhost:8080/tx/0xdf2f5f26c5c4fe7f83d732b93b134fcf705dd4ea65c04692e278dd944a7a775f' (call: assert failure root call correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0xaf91e9850c3533105b217cefc8438937d255c22b39edc82a66c2069cd3a50388' (call: contract creation from call, recursive constructor, second will fail correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0x7f606b8fc11a201461fdf0eab3846df8a7535941845333f1b5eff8948ce519be' (call: revert failure root call correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0xb53efe3811161f0574923114e9dfca8fa4d6349bbb1d335ec8414718d747e6be' (call: complete call tree)
Pushed transaction 'http://localhost:8080/tx/0xa18ad0d4c5b9788e3ed58924096cc8712b1e4e46c726b91a9b01b131886ef29b' (call: contract with create2, inner call fail due to insufficent funds (transaction succeed though))
Pushed transaction 'http://localhost:8080/tx/0xae1e68290d4fbdccdd1f69e774ab0bb2d7768e9e3a11fa53bdc095718d887a4b' (call: contract with create2, succesful creation)
Pushed transaction 'http://localhost:8080/tx/0xe3407de857b9c15f3e68c1fbfb0891127e89ccc98f55dc6f257f3a8e01cbdb53' (call: contract with create2, inner call fail due to insufficent funds then revert correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0x44f7239f483839a3ae3b92d10980a321c8ff682472be05383daceffb525299bf' (call: assert failure on child call correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0x3d154f1e282aa2f413afecd1bdb1483f1967c1e45cc4e6d1fd62845de4e6a6d7' (call: contract fail not enough gas after code_copy correctly failed with The contract code couldn't be stored, please check your gas limit.)
Pushed transaction 'http://localhost:8080/tx/0xf807e677e11c30807caad49e61e1dd94a9c331c96cced2bbe7859a3074123b0f' (call: contract with create2, inner call fail due to address already exists (transaction succeed though))
Pushed transaction 'http://localhost:8080/tx/0x6c004faf9d994da6cbcec62881b7d2d646ba91e96b3eb805ca5e53a26e73d070' (call: contract with create2, inner call fail due to address already exists then revert correctly failed with EVM reverted without reason)

Performing 'gas' transactions
Pushed transaction 'http://localhost:8080/tx/0xec777cf1e8e62710d795d5eaaf4d622a2b6a61cf52a28aee3cd4dc7b42dd4b18' (gas: deep nested nested call for lowest gas)
Pushed transaction 'http://localhost:8080/tx/0xafd9828770e29a510e75cbd840c997e20959b20f9ba441ac201cf9993f091ff2' (gas: nested low gas)
Pushed transaction 'http://localhost:8080/tx/0x343341a6d75761896dadfe03fdb76522b45964e68c048b90743a7f30107e647e' (gas: empty call for lowest gas)
Pushed transaction 'http://localhost:8080/tx/0x9e7c8c6973052d675f931849a77bd9ac2657a267b8c0cbb30ba53b03c6e791a5' (gas: deep nested call for lowest gas)
Pushed transaction 'http://localhost:8080/tx/0x4d5c6ff2f99bc24e27758724f9322cb4fa77a35ca821bfcea30c4e2917d75a78' (gas: deep nested low gas)

Performing 'suicide' transactions
Pushed transaction 'http://localhost:8080/tx/0x0aaf994b4390cd8290957e4be4500d2d272aa5c4f32fa4ba1fab99fc5b348776' (suicide: ensure suicidal2 bump is nonce by creating a contract (#1))
Pushed transaction 'http://localhost:8080/tx/0xa5d385fe8c8faf386b527f20996614287e34aa46580a406b08b5c2540a6f866d' (suicide: contract does not hold any Ether)
Pushed transaction 'http://localhost:8080/tx/0x9c57e0e98799daa4c52127db3f7dfa7de3afb1f87806267ee4ecdd41751649ea' (suicide: ensure suicidal2 bump is nonce by creating a contract (#2))
Pushed transaction 'http://localhost:8080/tx/0x6a44da2580b166efdc93dfd1af704a3fe6edb1c83dc61f7c2ad807fff07935aa' (suicide: create contract, kill it and try to call within same call)
Pushed transaction 'http://localhost:8080/tx/0x714384bdd2c856e134d30264bffa5594893ab1c367ad6045b267543ba9a63856' (suicide: create contract to fixed address (create2), kill it and try instantiate it again at same address)
Pushed transaction 'http://localhost:8080/tx/0x8ffe4858fc8178d47bf5e2decf9d856c26fb5c138e777df86f7b6b2955892ad0' (suicide: transfer some Ether to contract suicide that's about to suicide itself)
Pushed transaction 'http://localhost:8080/tx/0x5366050ba2535b5c477b18ef0d78aaa6ef6e4a5eb2bf8c3d3bf67894d18f3552' (suicide: contract does hold some Ether, and refund owner on destruct)
Pushed transaction 'http://localhost:8080/tx/0x3d3ba0825807ccc77a16846f1298e061388712fe372247b896f6556e42123f08' (suicide: create contract, kill it and try to call within same call (second time to valid nonce change after suicide))
Pushed transaction 'http://localhost:8080/tx/0x13a303c7db55ef61de66b718ae9aa1f074fec475e733b308608d6bb93262b8aa' (suicide: create contract to fixed address (create2), kill it and try instantiate it again at same address)

Completed battlefield deployment (local)
```
