## Transaction Log (Wed Jun 14 16:21:39 EDT 2023)

```
Bor
Version: 0.3.7-stable-fh2
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
Deploying contract 'Suicidal'
Deploying contract 'Suicidal'
Deploying contract 'EIP20Factory'
Deploying contract 'Child'
Deploying contract 'Main'
Deploying contract 'UniswapV2Factory'
Deploying contract 'GrandChild'

Contracts
- main => 0xEC9C1fCee156bf34Ba4fB5D38C9CF09Df16723eF
- child => 0x929bc44BBD41Ca0e621dc50f7c7E3204Ce026258
- grandChild => 0x314F9285cbC3835e676974abDb7d2ab45ede3686
- suicidal1 => 0x702641c70a11E480F646Ed247d078c65aBAAC5DE
- suicidal2 => 0x71940c77ccadaeA1238CEa27674E6253128ca177
- uniswap => 0xCae819bff9B75c3D34971C19e005F2cAD7354E0f
- erc20 => 0x9a77F7b94488d24EcA50FA0d144212AE48300A71

Transaction Links
- main => http://localhost:8080/tx/0x0c50b2a1dbb13bf1b528f1af4e41c96074234dcfad46bb4e2afd4beea86fd286
- child => http://localhost:8080/tx/0x62bfeb3e7a384f780f815caf2f118375c33426d71aa695a2fed5285f3d16d2a0
- grandChild => http://localhost:8080/tx/0xbafbdc25ca7c219aa47c00cc3944a8624434706038526262cdb0c759d33a4607
- suicidal1 => http://localhost:8080/tx/0x7ef9db7b88f20a2a6f0abbbb56edced49e87124ea9bf14592335364fa4f6655d
- suicidal2 => http://localhost:8080/tx/0xb865c6013c6a5612851ead73ee67aff34a0e912b9e09d6a0ab44e76020e4e686
- uniswap => http://localhost:8080/tx/0x10cda91467a48b5f485ac23dbc239505ee51956745615e27a75296cb85442617
- erc20 => http://localhost:8080/tx/0x81ba6b83ae860362bb9a6ad202edc8a6edc33ed3803b1314a79c1a71722af4d0

Performing pure 'transfer' transactions
Pushed transaction 'http://localhost:8080/tx/0x59bba1b390bd42b23f5a33274f9fa1e61d8bb9cbabe53f9dc093c3f51a239361' (pure transfer: existing address)
Pushed transaction 'http://localhost:8080/tx/0xdbf9b38a75f0cc924a8391c3dfe9eedcbc5c96eeb595ea9d36072f0c305b6cfd' (pure transfer: inexistant address creates account and has an EVM call)
Pushed transaction 'http://localhost:8080/tx/0xa0f7c019246761e08a3fe202d2ab466a15bbc514faadfbf812b7c656cbbf2b5b' (pure transfer: existing address with custom gas limit & price)
Pushed transaction 'http://localhost:8080/tx/0xa516b9bbd41de65b9cb24c271f7a82d2aca5f82d0cc25aa80cab7eef732bde8f' (pure transfer: transfer of 0 ETH to inexistant address generates a transaction with no EVM call)

Performing 'transfer' through contract transactions
Pushed transaction 'http://localhost:8080/tx/0xabe9ea084fb2e1ea55db95a0ecbb7936098fce239244bb1b522af99573261faa' (transfer through contract: inexistant address creates account and has an EVM call)
Pushed transaction 'http://localhost:8080/tx/0x71cdeff1587fc1d804f2072b56fa7a8176f7b6c774e3040e00d4d18c5f4a5b30' (nested transfer through contract: inexistant address creates account and has an EVM call)
Pushed transaction 'http://localhost:8080/tx/0x895f1fd01f09ea00a2167093e08bdbd5da65bfba88f46e215c732b5a7716361a' (nested transfer through contract: existing addresss)
Pushed transaction 'http://localhost:8080/tx/0x15271904e75cf928bc8437803641ca9ee66084f1b69a68b3af3c7c9da804ee14' (transfer through contract: existing addresss)

Performing failing 'transfer' through contract transactions
Pushed transaction 'http://localhost:8080/tx/0x2fff5fba1b46c7bc219796eb88be658d94699942317ba8eb1972ab2d7390419d' (transfer through contract: existing addresss correctly failed with EVM reverted without reason)

Performing 'log' transactions
Pushed transaction 'http://localhost:8080/tx/0x7a250a902d138d9823eb9c45a7e637b5477072ed121c9343af4a518d8e61a5a6' (log: empty)
Pushed transaction 'http://localhost:8080/tx/0xf5133e2c3bcb291a6ff320b2b5b4018fe6f1269ec2d9df9cad354bb93fe8dd75' (log: all mixed)
Pushed transaction 'http://localhost:8080/tx/0xccfab947ca92d72ecc9f7592521fd9934d962b10665a50812916e6825b5fe466' (log: all)
Pushed transaction 'http://localhost:8080/tx/0x958d27821839a1563038c7a8e986a6272cd0acfa2a749be33ff2f89d361a1985' (log: all indexed)
Pushed transaction 'http://localhost:8080/tx/0xabeeabc14fccf81aad4262805e2f00785a2ed46954e3f36bbcd4cb01586d8a6d' (log: log in top-level trx and then top-leve trx fails correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0xf1ec4f2cdcdf5de3dd81df98002a6e7bfe3d65dbf7a36fdd22b777e3dea43f1d' (log: multi)
Pushed transaction 'http://localhost:8080/tx/0xaf7307b65c75ed1d16a1474265bedaafee6a9d447878e3685bfe369a0d0294eb' (log: log in sub-call that fails but top-level trx succeed)
Pushed transaction 'http://localhost:8080/tx/0xb1afc96a5b2dbce63f0850e5691377ba20c170dedba4781048df85d53ec0961b' (log: log in sub-call that succeed but top-level trx fails correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0xabf2934faff238f0d508ae2f39b1404b9fd853c2d691fa0ca3197fb75d1ed3ad' (log: single)

Performing 'storage & input' transactions
Pushed transaction 'http://localhost:8080/tx/0x69e13490f18b9ba34cb5037abbffa8b37bcaa6dee2e9425bffdba9905933ed3b' (input: string equal 15)
Pushed transaction 'http://localhost:8080/tx/0xea3323c939d911b34d0dac08c8bc145e2dd2e19208633ead5ceba8b2eeb2e0b3' (input: string equal 31)
Pushed transaction 'http://localhost:8080/tx/0x61d6504e1cd6ca3a43a6f825a3042a30ad1263d774ca561c58b2210ae1d7bcbd' (input: string equal 0)
Pushed transaction 'http://localhost:8080/tx/0x7cc187a5199c6fdbd8d58f1278217aa898b86381d34e0bc949c1326a2e91b67f' (storage: set long string)
Pushed transaction 'http://localhost:8080/tx/0xd10c0cb3998b50241b24e8271ad62df0260d6d0baf67bbc83b4e424c749a849b' (input: string equal 30)
Pushed transaction 'http://localhost:8080/tx/0x8ae03fbb34c90930c20474feef624f3fe64b3c5741110aa7c9722f0f8c2f24c8' (input: string equal 32)
Pushed transaction 'http://localhost:8080/tx/0xfe84826dd4196730a3925bb913fa1e9698bf8c6527feeae0fac4a92af8adf7f7' (input: string longer than 32)
Pushed transaction 'http://localhost:8080/tx/0x1fca69608f7c9a3355340edd1e0f419877856ec5278ccf46931783b2d3d57266' (storage: array update)

Performing 'call' & 'constructor' transactions
Pushed transaction '' (call: contract fail just enough gas for intrinsic gas correctly failed with Returned error: intrinsic gas too low)
Pushed transaction 'http://localhost:8080/tx/0xf1ace1e21b2197870b81c1d4f6ca59b5c30259860a8156e97a940d874b5b446f' (call: contract creation from call, with constructor that will fail correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0xa927537a3ea80764457009fc8e8353a30df49ef54a6ba27b7610b9ebf59678ff' (call: contract creation from call, without a constructor)
Pushed transaction 'http://localhost:8080/tx/0xc7ce2df3b95be83909765d345790904755ef6c7477091d2f601b8394f6711dea' (call: contract creation from call, with constructor)
Pushed transaction 'http://localhost:8080/tx/0x39f0e163eda0de65512d50dac171d2e656334869515f3403ca3b74462a72cce6' (call: nested fail with native transfer)
Pushed transaction 'http://localhost:8080/tx/0x57247ebfe00d05bf7929ef813143266a1aff7fe79431933ffb4b4cc6fb9e745b' (call: all pre-compiled)
Pushed transaction 'http://localhost:8080/tx/0xf0a13b855ef32ef9fbfb9b8c6b37fe1f6a25fa44769ee0560cd32c73fe9f16a3' (call: assert failure root call correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0xa9a51e42f1e6cf6c467db5d9ef31c2909212f99c36f125543301c9d07bf79b89' (call: contract creation from call, recursive constructor, second will fail correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0x4cdf364a32dc33f6e55f940652a136274eb9051f51498278407730b1631bfa86' (call: assert failure on child call correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0xf83879577eefaa2318837484fd9b8ad0dd4f4ff3420dd743d161dfc142e13b87' (call: revert failure root call correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0x9be7ed9c363bbd412712fbf22c11858a5f31007e11c1b63b039e5f0477a3c6cb' (call: contract with create2, inner call fail due to insufficent funds (transaction succeed though))
Pushed transaction 'http://localhost:8080/tx/0x886404602da74b99be9d0d172cf0f5043b8d633ddadaaa444ff0286fd3ea08d8' (call: complete call tree)
Pushed transaction 'http://localhost:8080/tx/0x21bc8b7a595bc15ac367e5e6be12879c26f0342b6d52d3057632c146f85b4cbd' (call: contract with create2, succesful creation)
Pushed transaction 'http://localhost:8080/tx/0x0d7974d25a6d24638ffaa047c45d9acef5459861a016d7574279875d5fc617d5' (call: contract with create2, inner call fail due to insufficent funds then revert correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0x8016024ccc6ff81bdc65a86e7dd0114a808095305e5f2ebbc35d0f1f57ab8737' (call: nested call revert state changes)
Pushed transaction 'http://localhost:8080/tx/0xd0a8459e5ec5f61ee7a19dba140af44e895f6bb06eef6519d4253de5a0b60c81' (call: contract fail not enough gas after code_copy correctly failed with The contract code couldn't be stored, please check your gas limit.)
Pushed transaction 'http://localhost:8080/tx/0x266dad2433da3d0cec94cdcc68e7c829649a5d63e60cfba7bbc5e22c7e8647d5' (call: contract with create2, inner call fail due to address already exists (transaction succeed though))
Pushed transaction 'http://localhost:8080/tx/0x92ad3d953acb4c3d459d7128d14b1d39edb378a761556f72e32af7dbc2c15c1b' (call: contract with create2, inner call fail due to address already exists then revert correctly failed with EVM reverted without reason)

Performing 'gas' transactions
Pushed transaction 'http://localhost:8080/tx/0x337313d683992f6b62d31192f57301b66e15728bc41047b1e6c56944f4eed85a' (gas: deep nested low gas)
Pushed transaction 'http://localhost:8080/tx/0xae8f090801a9ea7385f06861a698efb7027c02f1852c2ae8923cec376592dcf2' (gas: empty call for lowest gas)
Pushed transaction 'http://localhost:8080/tx/0x83aedb74c06ae6a13167f42e8f5581d5b3682ecdaf05d960a45d9bb77b195beb' (gas: deep nested call for lowest gas)
Pushed transaction 'http://localhost:8080/tx/0x1ba4d2d99a840912e5712c3ae8c0451544314b107762a309f92d23d2fbaf341e' (gas: deep nested nested call for lowest gas)
Pushed transaction 'http://localhost:8080/tx/0x1015e1faa733674fde1a714f18f86d41cb09ba0dec798758430d5aa5f330e4ee' (gas: nested low gas)

Performing 'suicide' transactions
Pushed transaction 'http://localhost:8080/tx/0x8beaa3330d5ca6b690deae296121f0f01d193d04a20a3195cbd45d4e2910777f' (suicide: contract does not hold any Ether)
Pushed transaction 'http://localhost:8080/tx/0x4d2f2e8a710e468e6b43ecc8039fb0e3cb1efbbdff2ff0b73057f44d39487a57' (suicide: ensure suicidal2 bump is nonce by creating a contract (#2))
Pushed transaction 'http://localhost:8080/tx/0x1112293ab7febf7d4ebb7f3470c53a6b3484b0b15cce1a0fec49544ba05fae08' (suicide: create contract to fixed address (create2), kill it and try instantiate it again at same address)
Pushed transaction 'http://localhost:8080/tx/0xa9ba8648290eb92457e41692651d25db8fd73ddfad885df62757036ff3b3c7fb' (suicide: transfer some Ether to contract suicide that's about to suicide itself)
Pushed transaction 'http://localhost:8080/tx/0xb57cfd40fc81d4e25c37c99c881fd4afb131bbabf717af6d9d7de33b2967496c' (suicide: create contract, kill it and try to call within same call)
Pushed transaction 'http://localhost:8080/tx/0xec6206cbb7532702a8bcc8c428eef3196aad3d708a5b21472e73a376c7dcdc61' (suicide: ensure suicidal2 bump is nonce by creating a contract (#1))
Pushed transaction 'http://localhost:8080/tx/0xa7197876035c2f46264946f88a0dbffbd77d35eccbc45eda3eb120ef5c2fd5fd' (suicide: contract does hold some Ether, and refund owner on destruct)
Pushed transaction 'http://localhost:8080/tx/0xd35b8c3a0e794c8812e52a1bcda2dbf133539a71064bf046d53a51b377ea97a6' (suicide: create contract to fixed address (create2), kill it and try instantiate it again at same address)
Pushed transaction 'http://localhost:8080/tx/0xbd8046dda963b00459723a689ecec084148049e5b4c7578882b9869c82507fd1' (suicide: create contract, kill it and try to call within same call (second time to valid nonce change after suicide))

Completed battlefield deployment (local)
```
