## Transaction Log (Wed Jan 10 20:29:41 EST 2024)

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
Deploying contract 'Calls'
Deploying contract 'EIP20Factory'
Deploying contract 'UniswapV2Factory'
Deploying contract 'Main'
Deploying contract 'GrandChild'
Deploying contract 'Transfers'
Deploying contract 'Child'
Deploying contract 'Suicidal'
Deploying contract 'Logs'
Deploying contract 'Suicidal'

Contracts
- main => 0x929bc44BBD41Ca0e621dc50f7c7E3204Ce026258
- calls => 0x71940c77ccadaeA1238CEa27674E6253128ca177
- logs => 0xf0d54E7d8399dF98817E4bD6DDe189ABC8824E3D
- transfers => 0xCae819bff9B75c3D34971C19e005F2cAD7354E0f
- child => 0x314F9285cbC3835e676974abDb7d2ab45ede3686
- grandChild => 0xEC9C1fCee156bf34Ba4fB5D38C9CF09Df16723eF
- suicidal1 => 0x34C044506dB54D3e8966300b7CBEFBb569b02C60
- suicidal2 => 0x410fd7B9368812207DCf674afCB5E359e1365011
- uniswap => 0x9a77F7b94488d24EcA50FA0d144212AE48300A71
- erc20 => 0x702641c70a11E480F646Ed247d078c65aBAAC5DE

Transaction Links
- main => http://localhost:8080/tx/0x79b9768e1adfe0433bf547ad59490d0cf5f20f39e2acf3bdf5bf9b1e705d2ec5
- calls => http://localhost:8080/tx/0x6d1df2b548c78627cda2cba09ebeb78dfc7ff4c9ad7f9b819d27334f65cc6a6b
- logs => http://localhost:8080/tx/0x97a060728d25fac7111a38f4016a5c65c0211e7ea2aeb3f233a41407165c378b
- transfers => http://localhost:8080/tx/0xe074e4e83489f4a7a15e23069189210e07a0d2cd8f468429e526b8a5699608e0
- child => http://localhost:8080/tx/0xc715c44697ef4046a37e483f9d626f7998f7001efaba3a290eebd4c67131f6ad
- grandChild => http://localhost:8080/tx/0xc101c0bca6ed52b43a199427274903beac0d44414bb18cf8cc2a24a098f63973
- suicidal1 => http://localhost:8080/tx/0xff369ace8aae1dce9b35b2cbc6ee77fd036d302188c5041a05d6e342cde0572c
- suicidal2 => http://localhost:8080/tx/0x48e0a79b60820779b43b28ae7eba53139cf974604f6cdaf148ac4c7601feeb85
- uniswap => http://localhost:8080/tx/0x0c7ea66c4bce580d2e4fa6283b57a3fe665c3cdd064144acc211c48e69fa7555
- erc20 => http://localhost:8080/tx/0x411c3ddb69f9ac1de3f01cb93abaf811b59339562fe6aed8a1682ceb334b257b

Performing pure 'transfer' transactions
Pushed transaction 'http://localhost:8080/tx/0x254f13e1ea8c651f527d1e57b0e82c433efc3e7a7a962a40d1db6c40a07a054f' (pure transfer: existing address)
Pushed transaction 'http://localhost:8080/tx/0x8712eddc5638edbe13083385c044cf6a00d7892f5dea847294b6cd032ed67b63' (pure transfer: transfer of 0 ETH to inexistant address generates a transaction with no EVM call)
Pushed transaction 'http://localhost:8080/tx/0xb18b5442f64ca81d7072b6ba5a3296e005c7bc0e547c6c3eeb81cf060f97e090' (pure transfer: existing address with custom gas limit & price)
Pushed transaction 'http://localhost:8080/tx/0x49b4b37d6aad87588a7256e3b715fea594869f3795fdae0b8088bdcbbe65d83e' (pure transfer: inexistant address creates account and has an EVM call)

Performing 'transfer' through contract transactions
Pushed transaction 'http://localhost:8080/tx/0x4837a1074c40e737c773b3236ab18dec726a0bd273465e3e1c52ebe3d8880e2e' (transfer through contract: inexistant address creates account and has an EVM call)
Pushed transaction 'http://localhost:8080/tx/0x987cf44868441891f5513415e0548ff902be9e02cbc9eab64c5bd505d4bd267e' (transfer through contract: existing addresss)
Pushed transaction 'http://localhost:8080/tx/0x848ac049b1c54128138d4671fc2d3d8f6033d4dbc97e3be108f5912098967fb0' (nested transfer through contract: existing addresss)
Pushed transaction 'http://localhost:8080/tx/0xa1e05a828c7aa1612eb9e9b4dc635c2953bbaa45886ddfdf0c8a6affa4208db9' (nested transfer through contract: inexistant address creates account and has an EVM call)

Performing failing 'transfer' through contract transactions
Pushed transaction 'http://localhost:8080/tx/0x610e5385bd34d6099f92cb7c4f265a36040cc1bf5b7e475165fafc03e8eba51f' (transfer through contract: existing addresss correctly failed with EVM reverted without reason)

Performing 'log' transactions
Pushed transaction 'http://localhost:8080/tx/0x6eadea7da7699550daa8c49f0265bd7a06b663649632737279603d66b20798e9' (log: multi)
Pushed transaction 'http://localhost:8080/tx/0xde94b87bc2bc475e857571b39e17847c54cc63908df51094c2de007f5221a5b9' (log: single)
Pushed transaction 'http://localhost:8080/tx/0xed7c8267fb5def970c360dde3190c63ea02deb64b3edeafa99e2e3096b83786c' (log: all indexed)
Pushed transaction 'http://localhost:8080/tx/0xa3b14dafadfae95c59417bb1beddc05fce91878c5583fe579b2c2171601df92e' (log: log in sub-call that succeed but top-level trx fails correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0x68d1d3079a4d2e8ed744d44bc79cde35872fd2655cc191256f1a664a76fa6df0' (log: log in top-level trx and then top-leve trx fails correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0x8b889b4c5a385b9fb4a624673de1f5425f6e2fef02f41fea99537f6e9bc03f80' (log: all mixed)
Pushed transaction 'http://localhost:8080/tx/0x61cb15df088284bc9e7fe8b5dac30e8d0b2dad22c819f5e0f877b1aeaeb84328' (log: log in sub-call that fails but top-level trx succeed)
Pushed transaction 'http://localhost:8080/tx/0xcc6248beeb9d438b7c090d9b2b729c37d9f507597a74eac6f3b91d4e05ed4f88' (log: empty)
Pushed transaction 'http://localhost:8080/tx/0x533580d361d5b6c3fc78082713095ae66109ea7e9496915603fc6c0da1a2d699' (log: all)

Performing 'storage & input' transactions
Pushed transaction 'http://localhost:8080/tx/0x09f3ff31536e158d8aae1006aa77a899f0f52ea45e1dee1a439727e369a89d48' (input: string equal 0)
Pushed transaction 'http://localhost:8080/tx/0x4a6f18ba0b119a4ad695c18279f3daac54a5fe0fc44482c99d674cf4cd57676c' (input: string equal 15)
Pushed transaction 'http://localhost:8080/tx/0x01a497ffe0e78596dcdf04ba89e4ddbe163538a4f1092fc8b9720ceff280f9cb' (input: string equal 30)
Pushed transaction 'http://localhost:8080/tx/0xc11f3c6e45824aa32c213ce02f0c456a6591bd352a5c2178d9680579281c4425' (input: string equal 31)
Pushed transaction 'http://localhost:8080/tx/0xfac26dd8648f373d514b21e9e323ee9ed79b6c8ba90a006d355b71932d30ccc8' (input: string equal 32)
Pushed transaction 'http://localhost:8080/tx/0xefc464f7051ae9262310ecfeedd159ca2f1eb207f7b2962373b17f7b02f3a59b' (input: string longer than 32)
Pushed transaction 'http://localhost:8080/tx/0x8ec6e0c1c31c3427a168cd2a886e501882c72b247c562c16ccb8a102f103f7d5' (storage: set long string)
Pushed transaction 'http://localhost:8080/tx/0x2d8b45319eee136ce5c7706d64edce0b7ece8b4e845c4b1bfbc1a61337f67b47' (storage: array update)

Performing 'call' & 'constructor' transactions (new contract)
Pushed transaction '' (call: contract fail just enough gas for intrinsic gas correctly failed with Returned error: intrinsic gas too low)
Pushed transaction 'http://localhost:8080/tx/0x6f2d6c43cc21894b750cd4e48be4006ec326455d4170dc7b110cf49a791321ad' (call: complete call tree)
Pushed transaction 'http://localhost:8080/tx/0x3a71d4ebfdeb207c526634bbc3c7851c9aa55fa4d42c035976794cbe9c1684b1' (call: contract fail not enough gas after code_copy correctly failed with The contract code couldn't be stored, please check your gas limit.)

Performing 'call' & 'constructor' transactions
Pushed transaction '' (call: contract fail just enough gas for intrinsic gas correctly failed with Returned error: intrinsic gas too low)
Pushed transaction 'http://localhost:8080/tx/0xce84a3f02145944c1d3ff6298016c11af01ee3a85fd3fcca5648d48068ee58c6' (call: complete call tree)
Pushed transaction 'http://localhost:8080/tx/0x8233b67cc496b8cc038d421525404ebaa9cd3f2df59c8187bab6d514e81c19be' (call: contract creation from call, recursive constructor, second will fail correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0xaccc3449d8ffdfe756c1c596264edc8b91bec9ffbd26ea372e033169cf344e2a' (call: delegate with value)
Pushed transaction 'http://localhost:8080/tx/0x0537f0b777bbfb11e2a03efbf7654b457fbc6ed4b51cef3b8b27ef8754a45903' (call: contract creation from call, with constructor)
Pushed transaction 'http://localhost:8080/tx/0xd2d395731325c13da02da42af58cfd7580191d0d7d6f6d1f35d85d257ea58278' (call: contract creation from call, with constructor that will fail correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0x524a4155dfc91219027f7e81abf921a3ada601a97155b6fbc089135f5754831a' (call: nested fail with native transfer)
Pushed transaction 'http://localhost:8080/tx/0x5f60b6b6eda2fccfd79a81bf8f932b44d7c4f9615d49a5f85a77e58a43312813' (call: nested call revert state changes)
Pushed transaction 'http://localhost:8080/tx/0xc11049fe40059bd3ea952565d5c65ca5a600356a688fb1fce7672f9bd56e851a' (call: all pre-compiled)
Pushed transaction 'http://localhost:8080/tx/0x3df88b3c3c2b5f9bb54cbca3168e390c4a306aa4c233d23710183743ad299dd0' (call: assert failure root call correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0x4608b1f9b897613cda0c6a7991afc8b87641c0d587063cc279de03e0cff4c428' (call: contract creation from call, without a constructor)
Pushed transaction 'http://localhost:8080/tx/0x0217f31d80b785e334b7400e86156012a4ecab503b31186e4baeb496bbb5c3a9' (call: contract with create2, inner call fail due to insufficent funds (transaction succeed though))
Pushed transaction 'http://localhost:8080/tx/0x6ee2e05e8043fe67735a5d3ef34b400147754acdff097420e05a721235cbc7cf' (call: revert failure root call correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0xd97c0902a63c97c87818e68dc13d4f6d0caa86daba5c8223fb928160812f1df0' (call: assert failure on child call correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0xa9bfd0ee2dc704a3391d564fe75a301c6c18a3d4420f08d1bdc3a98a87fdfdf8' (call: contract with create2, succesful creation)
Pushed transaction 'http://localhost:8080/tx/0xf544ea6a525f8794478f43769bbdb2275eeb1be355dbe42df8fc14660d8e6c1c' (call: contract with create2, inner call fail due to insufficent funds then revert correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0xb6bd2991a1dfbf1d7360a6fe05553a2ca5f3f1340320748d0c1b54fc746b49ed' (call: contract fail not enough gas after code_copy correctly failed with The contract code couldn't be stored, please check your gas limit.)
Pushed transaction 'http://localhost:8080/tx/0x1b3a6e83ca70278f6c97447b01c19766aaeba63682cb42753f8cc35c2e35463a' (call: contract with create2, inner call fail due to address already exists (transaction succeed though))
Pushed transaction 'http://localhost:8080/tx/0xcd0c8f6d4075b3142f67443bef38dcb848d22cab5f6afd2a10566017672fe9af' (call: contract with create2, inner call fail due to address already exists then revert correctly failed with EVM reverted without reason)

Performing 'gas' transactions
Pushed transaction 'http://localhost:8080/tx/0x7ac5c09c073042512267d04356f41b18829c6d6427cc357b7fab80364f7f1021' (gas: nested low gas)
Pushed transaction 'http://localhost:8080/tx/0x2d63a5bd7d36707e18b04e4e5c50c1f7422e0acb7c80e06dc5796bd6d65aea51' (gas: deep nested nested call for lowest gas)
Pushed transaction 'http://localhost:8080/tx/0xa6c9f52059334ab698ab4f4d759fef9c0c109464165b45ec13ca6b3ed0a1f29c' (gas: deep nested call for lowest gas)
Pushed transaction 'http://localhost:8080/tx/0x38cbffb3bf36933b1c6bd4b6e53a968b08d27ef67d0fdb738eadee48abd062a9' (gas: deep nested low gas)
Pushed transaction 'http://localhost:8080/tx/0x441a168a0871ac56290dbadae97c7f8c476123ed366445dfab2a72e1649b7be6' (gas: empty call for lowest gas)

Performing 'suicide' transactions
Pushed transaction 'http://localhost:8080/tx/0xeb4a631ea1e1e93c6baae26118c4f2499f5d6490d03f1280fcb3f4b0bd0f3246' (suicide: ensure suicidal2 bump is nonce by creating a contract (#1))
Pushed transaction 'http://localhost:8080/tx/0xe572a35fbf6b097e33bc25ff59d8c50ee7fdd33a739d34922e11ed3263ee03e7' (suicide: transfer some Ether to contract suicide that's about to suicide itself)
Pushed transaction 'http://localhost:8080/tx/0xf473d49f599383f064e2f1305df76cdb52be364d4f26b849633fe575b2f49253' (suicide: contract does not hold any Ether)
Pushed transaction 'http://localhost:8080/tx/0x53419a69864f7a4eef4db227d89e1b48196256239b1dfae902358250a828fb65' (suicide: ensure suicidal2 bump is nonce by creating a contract (#2))
Pushed transaction 'http://localhost:8080/tx/0x1ffa24950882671ac5e76dcd446a96655ffd1315e6aabac38cf3c28f0639e95c' (suicide: create contract to fixed address (create2), kill it and try instantiate it again at same address)
Pushed transaction 'http://localhost:8080/tx/0x410d281eb6a40d79d4ade30f565c488b78aa9e305817f903b52da8d36c22c2ed' (suicide: create contract, kill it and try to call within same call)
Pushed transaction 'http://localhost:8080/tx/0x8436b393728665ea43c7485eb2b26a6e98c9a7ece312fb4a84838c79010d59c7' (suicide: create contract, kill it and try to call within same call (second time to valid nonce change after suicide))
Pushed transaction 'http://localhost:8080/tx/0x1bebb589239de99543f8032b2e2bd93a9f2b48b378c481ccd1530ad461f2a18c' (suicide: create contract to fixed address (create2), kill it and try instantiate it again at same address)
Pushed transaction 'http://localhost:8080/tx/0xa405b8d74b37b55316e4299bb0e31269818ddc6a37c7644ab3ce8437423fdd46' (suicide: contract does hold some Ether, and refund owner on destruct)

Completed battlefield deployment (local)
```
