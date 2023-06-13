## Transaction Log (Mon Jan 31 16:30:53 EST 2022)

```
Geth
Version: 1.9.10-dm-stable
Architecture: arm64
Protocol Versions: [64 63]
Go Version: go1.17.5
Operating System: darwin
GOPATH=
GOROOT=/usr/local/go
```

```
$ /Users/maoueh/work/sf/ethereum.battlefield/node_modules/.bin/ts-node src/main.ts
Configuration
 Network: local
 Default address: 0x821b55d8abe79bc98f05eb675fdc50dfe796b7ab
 RPC Endpoint: http://localhost:8545

Deploying contracts...
Deploying contract 'Main'
Deploying contract 'GrandChild'
Deploying contract 'Child'
Deploying contract 'Suicidal'
Deploying contract 'Suicidal'
Deploying contract 'UniswapV2Factory'
Deploying contract 'EIP20Factory'

Contracts
- main => 0x71940c77ccadaeA1238CEa27674E6253128ca177
- child => 0x9a77F7b94488d24EcA50FA0d144212AE48300A71
- grandChild => 0x702641c70a11E480F646Ed247d078c65aBAAC5DE
- suicidal1 => 0xEC9C1fCee156bf34Ba4fB5D38C9CF09Df16723eF
- suicidal2 => 0x929bc44BBD41Ca0e621dc50f7c7E3204Ce026258
- uniswap => 0xCae819bff9B75c3D34971C19e005F2cAD7354E0f
- erc20 => 0x314F9285cbC3835e676974abDb7d2ab45ede3686

Transaction Links
- main => http://localhost:8080/tx/0xc19856a830470f3624e24a182319abe2a9a5192420e4be4a5c83a7626f4ade32
- child => http://localhost:8080/tx/0x9fe4d14925d8a209cd9eb801f0e78b472df77524b6cc3348fd703e5cb9329343
- grandChild => http://localhost:8080/tx/0xfeb7158587ff596ed583fcf3f935e627b2b0ac3c03b99f5b12f1d577ad8f57c4
- suicidal1 => http://localhost:8080/tx/0xdb817b0906b80b24654db5951f054aa42b2ff282bf29f0a4c37b38af6f008236
- suicidal2 => http://localhost:8080/tx/0xa8115d64eb1975d8f4e86d7c46c2b1a2232e78a82ffded66f4ee28680f5cf000
- uniswap => http://localhost:8080/tx/0x10cda91467a48b5f485ac23dbc239505ee51956745615e27a75296cb85442617
- erc20 => http://localhost:8080/tx/0x41b56fc456afb55331cac0566e4fdeddf8bc8e7277173b648032bdb91cf55bb9

Performing pure 'transfer' transactions
Pushed transaction 'http://localhost:8080/tx/0xa0f7c019246761e08a3fe202d2ab466a15bbc514faadfbf812b7c656cbbf2b5b' (pure transfer: existing address with custom gas limit & price)
Pushed transaction 'http://localhost:8080/tx/0x210543b13f4db2ccb05d5d2bbc021da98f109a4b62efd3d81bc62b520d6eedb7' (pure transfer: transfer of 0 ETH to inexistant address generates a transaction with no EVM call)
Pushed transaction 'http://localhost:8080/tx/0x59bba1b390bd42b23f5a33274f9fa1e61d8bb9cbabe53f9dc093c3f51a239361' (pure transfer: existing address)
Pushed transaction 'http://localhost:8080/tx/0x8c12adffec09de534fc2db77f211088ecbd392f4dd4bb1fc37529b1b6ef94f88' (pure transfer: inexistant address creates account and has an EVM call)

Performing 'transfer' through contract transactions
Pushed transaction 'http://localhost:8080/tx/0xed1f07c0defb3a33499a80391e57ffd6d99e94816b1f6fa39fbf82762556a852' (transfer through contract: existing addresss)
Pushed transaction 'http://localhost:8080/tx/0x519f1f2d835f1ee5e9e94875e454af03b8714ccf4362e92b9e00c1c5ba1c1fdc' (transfer through contract: inexistant address creates account and has an EVM call)
Pushed transaction 'http://localhost:8080/tx/0xf6976a69490baeecfd7e51d6a942d40bce317bec8eea7dc7c2ead926c3ed3d36' (nested transfer through contract: existing addresss)
Pushed transaction 'http://localhost:8080/tx/0xb31733649ada1e1e81fb6210e2b1fc4d29f8364c58392d251f54a418a9f23358' (nested transfer through contract: inexistant address creates account and has an EVM call)

Performing failing 'transfer' through contract transactions
Pushed transaction 'http://localhost:8080/tx/0x93c2f3195644c8ecfe652b1d6da391e552f2692296cabb187b660539decd887b' (transfer through contract: existing addresss correctly failed with EVM reverted without reason)

Performing 'log' transactions
Pushed transaction 'http://localhost:8080/tx/0x7fbd7109d41c7a197e355f1dd351e7f142a6f02b4cfbe7d73b6a87ded438b624' (log: all)
Pushed transaction 'http://localhost:8080/tx/0xa9790e78e556ea918632c953da17f917f91461f40bfc913fe7b5447c678709fd' (log: all indexed)
Pushed transaction 'http://localhost:8080/tx/0x1e5e77911d7d5e865053aa449a31803d8493364022bb5d1caa95de6424bc471b' (log: all mixed)
Pushed transaction 'http://localhost:8080/tx/0x1d8a232c40608baf09d38fcbfe84c0cfb857456411029acee68ad13fa9671396' (log: multi)
Pushed transaction 'http://localhost:8080/tx/0x054518768a18d76e862dcfa9ec1784e581223106d49e936ad1623a7c9bd81838' (log: log in sub-call that fails but top-level trx succeed)
Pushed transaction 'http://localhost:8080/tx/0xc987fb337407ab7ab4a8f98328918df99c474d01fd2bf5a8e2028fe0eb2d0650' (log: empty)
Pushed transaction 'http://localhost:8080/tx/0xe84ba545418357c83b8adb40aa1a8e1f62f8ba23cdea027200a8cddfe4e21b0c' (log: single)
Pushed transaction 'http://localhost:8080/tx/0x5ba1b908a75bf10dbd06bc320e44c8eb601784d5d9ae5d3d7c303f5c778b57df' (log: log in top-level trx and then top-leve trx fails correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0xfe92b3161c55eed15451420a90c7dcf1cee0ca338c71d725e77fbbea6c465042' (log: log in sub-call that succeed but top-level trx fails correctly failed with EVM reverted without reason)

Performing 'storage & input' transactions
Pushed transaction 'http://localhost:8080/tx/0x133377a50b90b0a4de41b2ad9b41c645d9b4dd665da0d787561a992aba1d551a' (input: string equal 32)
Pushed transaction 'http://localhost:8080/tx/0xd75b6297d32e838ceb0bc78517fe534028ffe97039e2b1696d710caae7346cdc' (input: string equal 15)
Pushed transaction 'http://localhost:8080/tx/0xa2495e9dc493e51c83e412870c9adad9d26924684b26f6bccffa3953c3987c8c' (storage: set long string)
Pushed transaction 'http://localhost:8080/tx/0xa7049175b26f1c16f1e4cb64735cceaf2858f9f51f6ea69216cc5c079f34f6da' (input: string longer than 32)
Pushed transaction 'http://localhost:8080/tx/0xd230cbede46eae54dfee57a0538cf213711840427e4f39e1b9268b030c0f1bb7' (input: string equal 0)
Pushed transaction 'http://localhost:8080/tx/0x85ad6ea6aaa70a6c53bec7d35d2414fd27c5a06e2b301956e407eb01ccff9c66' (input: string equal 31)
Pushed transaction 'http://localhost:8080/tx/0xf00d7986c0492997e19f9e9eaea99d7c4b13c6dbb34cbbc08780663b62827e2e' (input: string equal 30)
Pushed transaction 'http://localhost:8080/tx/0x5655aa67566cad558bd07eff90d7ad5a00260924af78068c161dcc7bff1bb6cb' (storage: array update)

Performing 'call' & 'constructor' transactions
Pushed transaction 'http://localhost:8080/tx/0xc4319271e89aa681e58fc85cf59dbd6ec1eff55c9ff9834c932ca8dd971507ad' (call: contract creation from call, without a constructor)
Pushed transaction 'http://localhost:8080/tx/0x688088b48d0a38d2544ac1952dfc6def0709425499092145d81c9641b1fa2319' (call: contract creation from call, with constructor)
Pushed transaction 'http://localhost:8080/tx/0xa3fe31852a3d36d2855e17cdc2cc7af249985f4391e28221994d251b7b8c6212' (call: complete call tree)
Pushed transaction 'http://localhost:8080/tx/0x4905584274490a5dbe04966156266de500088caad3ad07ea39cc130498e3d14d' (call: all pre-compiled)
Pushed transaction 'http://localhost:8080/tx/0x0ac769d8707b662a653b48b5b7e3188556e377a5cab86e19dfcafe2298f677f0' (call: nested fail with native transfer)
Pushed transaction 'http://localhost:8080/tx/0xf6ca6532e5523d74191b31995363464015bf1e7f5af181bab992cf7a11822c02' (call: revert failure root call correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0x89635e4d5191b366b82730697c6687d1037088f3023b35fb66595ddec3286722' (call: assert failure root call correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0x5e1096dab75276f32aabd4b9ef6d45a1d5dae4ee23651d4a7e319ddc7b8f6afd' (call: contract creation from call, recursive constructor, second will fail correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0x66773fbfd91e75b2c5e03e78e9a1151929d8cf6991d4f2797896b089d07a2c78' (call: contract with create2, inner call fail due to insufficent funds (transaction succeed though))
Pushed transaction 'http://localhost:8080/tx/0x318fd4727f07bd7a58d22693eee32ff6203839ae9fbd10110d23a149dc1a232c' (call: nested call revert state changes)
Pushed transaction 'http://localhost:8080/tx/0xc52c89b32a94c0eea36f0e6f6ea70b0c4ff4b0f2980f4f12f6d4c60ea0a53d84' (call: contract with create2, inner call fail due to insufficent funds then revert correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0x939363ce2f1c770dbb3686ffdae127c10058522dddb6389bd357755bb2f8ccd2' (call: assert failure on child call correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0x842ee942b4f348571c573b26d9a27bc2d748e163f266194bc9913788236ebb24' (call: contract creation from call, with constructor that will fail correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0x3eb8198a9abd982cb33674c0d9f87ab478c7c4c50e4334a11fe6dfea435947f3' (call: contract with create2, succesful creation)
Pushed transaction 'http://localhost:8080/tx/0x92ff37d3879e255c73415a671ee18160d2b71a9a0095220d45affdde562df6ba' (call: contract fail not enough gas after code_copy correctly failed with The contract code couldn't be stored, please check your gas limit.)
Pushed transaction 'http://localhost:8080/tx/0xdec9f428ef179da6e70e3d9ee01eb2d8ca8741ef4a3b46b8116098001c31f31f' (call: contract fail just enough gas for intrinsic gas correctly failed with The contract code couldn't be stored, please check your gas limit.)
Pushed transaction 'http://localhost:8080/tx/0xfe6a10bd02767acf5132c975c6facde10ef26c288f1d2b4a9822ae4eae0d563e' (call: contract with create2, inner call fail due to address already exists (transaction succeed though))
Pushed transaction 'http://localhost:8080/tx/0xa0bdd45a191191d3da4471442b125963580b7b0c7b047b5f6205b0a972708dee' (call: contract with create2, inner call fail due to address already exists then revert correctly failed with EVM reverted without reason)

Performing 'gas' transactions
Pushed transaction 'http://localhost:8080/tx/0x8a5ca3f1239c7b1681c186e7deb034ddb905c0382b338b6ab7c26ebda5fd1277' (gas: empty call for lowest gas)
Pushed transaction 'http://localhost:8080/tx/0x7551241d6c93c450c00c877266a6ca48c0d3660c5756a265c5dd50200623a48d' (gas: nested low gas)
Pushed transaction 'http://localhost:8080/tx/0xb30040ead819ddb2f93fbe2cd2518d95efd3d5454d5259a61cd2d1d0be987712' (gas: deep nested nested call for lowest gas)
Pushed transaction 'http://localhost:8080/tx/0x3f20303dab88f0380b83ca957a1af9887e0fbba9fbbb918c76e0f3014418ebcd' (gas: deep nested call for lowest gas)
Pushed transaction 'http://localhost:8080/tx/0xec4409667a337517fff16c24e0707a037b3e3a2b22a03ffef73bf0c2e1ff4a37' (gas: deep nested low gas)

Performing 'suicide' transactions
Pushed transaction 'http://localhost:8080/tx/0x7a2f3f76b0e561e8b166468ded9a1a72f02d0e7c0f9bdd5b116d5124edaaad72' (suicide: contract does not hold any Ether)
Pushed transaction 'http://localhost:8080/tx/0xf12a3f9b6e206c1e5a7e8b390b29f6133aa06a7c1709fd636588711a12aa4799' (suicide: transfer some Ether to contract that's about to suicide itself)
Pushed transaction 'http://localhost:8080/tx/0x2becdee3b9ce9dd9a7274b8f6881e8e8d119ab046502ea90688773ef545731c7' (suicide: contract does hold some Ether, and refund owner on destruct)

Completed battlefield deployment (local)
```
