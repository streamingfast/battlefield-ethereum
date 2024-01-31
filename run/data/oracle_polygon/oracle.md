## Transaction Log (Wed Jan 31 10:18:52 EST 2024)

```
Bor
Version: 0.3.7-stable-fh2
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
Deploying contract 'Suicidal'
Deploying contract 'Logs'
Deploying contract 'EIP20Factory'
Deploying contract 'GrandChild'
Deploying contract 'Calls'
Deploying contract 'Suicidal'
Deploying contract 'Child'
Deploying contract 'Main'
Deploying contract 'Transfers'
Deploying contract 'UniswapV2Factory'

Contracts
- main => 0x34C044506dB54D3e8966300b7CBEFBb569b02C60
- calls => 0xEC9C1fCee156bf34Ba4fB5D38C9CF09Df16723eF
- logs => 0x702641c70a11E480F646Ed247d078c65aBAAC5DE
- transfers => 0x410fd7B9368812207DCf674afCB5E359e1365011
- child => 0x314F9285cbC3835e676974abDb7d2ab45ede3686
- grandChild => 0x929bc44BBD41Ca0e621dc50f7c7E3204Ce026258
- suicidal1 => 0x71940c77ccadaeA1238CEa27674E6253128ca177
- suicidal2 => 0xCae819bff9B75c3D34971C19e005F2cAD7354E0f
- uniswap => 0xf0d54E7d8399dF98817E4bD6DDe189ABC8824E3D
- erc20 => 0x9a77F7b94488d24EcA50FA0d144212AE48300A71

Transaction Links
- main => http://localhost:8080/tx/0x11e6a8b5bd6a3e07b103f4eebda92dd54b8eb48dac4303603aa903b091a53526
- calls => http://localhost:8080/tx/0x1c34632573a7b75ccb30902dd4e8c8e0969168162cfea17e50c15a8c8b80fa94
- logs => http://localhost:8080/tx/0x8e5bd5fea1c2ce00a190dc513536c37922958cd3a9eb1a82b116aa90adedfc18
- transfers => http://localhost:8080/tx/0xaa6f88eccc8207f4e074d1992c9dd42640b46ce700b0fe41f45e06c165721463
- child => http://localhost:8080/tx/0xc715c44697ef4046a37e483f9d626f7998f7001efaba3a290eebd4c67131f6ad
- grandChild => http://localhost:8080/tx/0x7266627bcf60392e5e7c0c2a90d744ebb9749a3b80bb897bdd9e9ad513cb3f69
- suicidal1 => http://localhost:8080/tx/0xb865c6013c6a5612851ead73ee67aff34a0e912b9e09d6a0ab44e76020e4e686
- suicidal2 => http://localhost:8080/tx/0xfff1df17c8b05255a16214b4ca2aa0c461d1c8509156304189f28e8b1b745d68
- uniswap => http://localhost:8080/tx/0x9d45a05f1173539e95dbc10f54f4458d4cac00cf8987f02b1fb3c979291c173e
- erc20 => http://localhost:8080/tx/0x81ba6b83ae860362bb9a6ad202edc8a6edc33ed3803b1314a79c1a71722af4d0

Performing pure 'transfer' transactions
Pushed transaction 'http://localhost:8080/tx/0x254f13e1ea8c651f527d1e57b0e82c433efc3e7a7a962a40d1db6c40a07a054f' (pure transfer: existing address)
Pushed transaction 'http://localhost:8080/tx/0x2a3ac060d0a6877a941b84a44f3560a5346ed17fa05c9d8cfe4fdfe26847397f' (pure transfer: inexistant address creates account and has an EVM call)
Pushed transaction 'http://localhost:8080/tx/0xd49ae13dbb34ca0a47af51fed538217778d030bd489ce9bf388ce94be992a5e8' (pure transfer: existing address with custom gas limit & price)
Pushed transaction 'http://localhost:8080/tx/0x5c23fc2eb911a3b3e664dcc1ed63368c071fbcffd9dd2a573640acc392ab897b' (pure transfer: transfer of 0 ETH to inexistant address generates a transaction with no EVM call)

Performing 'transfer' through contract transactions
Pushed transaction 'http://localhost:8080/tx/0x3bddec026916937dff937892658092d272cfb35c4a3ce2c9c9f04a684fba747c' (transfer through contract: inexistant address creates account and has an EVM call)
Pushed transaction 'http://localhost:8080/tx/0x284da8106ca7f12a70a420aa2862206846095398daef1d291afaef4ec56b3cc9' (nested transfer through contract: existing addresss)
Pushed transaction 'http://localhost:8080/tx/0xc3f7ea44e847255bdb6e46ea3c7d33659185afd0c6aba6544d6e9ee6237897ae' (transfer through contract: existing addresss)
Pushed transaction 'http://localhost:8080/tx/0x01c3adb67b0f75827076943557025eb78397e3cc68ba36a998408976838e462d' (nested transfer through contract: inexistant address creates account and has an EVM call)

Performing failing 'transfer' through contract transactions
Pushed transaction 'http://localhost:8080/tx/0x5cc7c2d997c81e84ae9fe997fedd0b7a253305c78f40f40c32c1428329a85f02' (transfer through contract: existing addresss correctly failed with EVM reverted without reason)

Performing 'log' transactions
Pushed transaction 'http://localhost:8080/tx/0xb02c92bf284f52d796faf8ff6c5f6492063f6e787d4e166f9c0a1e28d7cd21c4' (log: single)
Pushed transaction 'http://localhost:8080/tx/0x8f7401817018659b9c8e59ce83485388dfc91e60233b47c010df0ad4fb7571c1' (log: empty)
Pushed transaction 'http://localhost:8080/tx/0xf8ce498e10141285b8296785cc3282a84bf0f16ec5fd66156bea073afd3e8c0e' (log: all mixed)
Pushed transaction 'http://localhost:8080/tx/0x30bb4ba38d676bd1611853aeefae4ff6a51ba85ddfda4ed01c0d371611da7913' (log: all indexed)
Pushed transaction 'http://localhost:8080/tx/0xc46dc7f42dfe694ff1154dc7036263bb6fb24188bb7e964b4dbf17e9b0b56a61' (log: all)
Pushed transaction 'http://localhost:8080/tx/0x719bd0ec675644fe115d445f4a40bed2d1075e3ca970faa84a7cb9084e6217ce' (log: log in top-level trx and then top-leve trx fails correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0x3240de05642ca3ffe50cf00a4847d659c720b0df0fb561a5db7d5fef9401826c' (log: log in sub-call that succeed but top-level trx fails correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0x77dc674302ed0ef5560646b68473203ed77d8b8f95c05cc143cc892c090d96e2' (log: multi)
Pushed transaction 'http://localhost:8080/tx/0xab5fe2f39f6128f07eef968f241b0d2945dd410fab90786a7784894f61ee3e98' (log: log in sub-call that fails but top-level trx succeed)

Performing 'storage & input' transactions
Pushed transaction 'http://localhost:8080/tx/0xcfc48d50a9cb9e14a1062ad0548bb6d65e5213e6a48ee66082b0f74b896b065b' (input: string equal 30)
Pushed transaction 'http://localhost:8080/tx/0x3e8ba502fc99e1f0135b60b46ecd7b24d0ff7c7fd9fa9d1183725533a1d32eb4' (input: string equal 32)
Pushed transaction 'http://localhost:8080/tx/0xe235dbad9902080d8ba42430a6c99d9c6d21806b12287908cf7933d20a13bdb0' (storage: set long string)
Pushed transaction 'http://localhost:8080/tx/0x38e7da4b93619e0c99d044311dc1a939034506ae3045c4ea1509969496e34266' (input: string equal 0)
Pushed transaction 'http://localhost:8080/tx/0x4dc6e779326804cfcb0cca8c3070d7924bbf08877c6247fbc4ba4537d18d289d' (input: string longer than 32)
Pushed transaction 'http://localhost:8080/tx/0x7f217b74b7755ae92fd4a323c9831ce5ce39280bfff6030fbf941a24a85c3389' (input: string equal 31)
Pushed transaction 'http://localhost:8080/tx/0xa9c68ca3a8fdaae8804140bbb7cf88c7220e5ad03c81fc471729d11eb7d340f3' (input: string equal 15)
Pushed transaction 'http://localhost:8080/tx/0x968c0d8719b554e075ccef313e73f70bdd54eb62deb60c5602d4aaad893279f5' (storage: array update)

Performing 'call' & 'constructor' transactions (new contract)
Pushed transaction '' (call: contract fail just enough gas for intrinsic gas correctly failed with Returned error: intrinsic gas too low)
Pushed transaction 'http://localhost:8080/tx/0xd1d37a1dde74b3960e9721e4e902adf82a5db5a333d86890e8de1672cd211925' (call: complete call tree)
Pushed transaction 'http://localhost:8080/tx/0x3a71d4ebfdeb207c526634bbc3c7851c9aa55fa4d42c035976794cbe9c1684b1' (call: contract fail not enough gas after code_copy correctly failed with The contract code couldn't be stored, please check your gas limit.)

Performing 'call' & 'constructor' transactions
Pushed transaction '' (call: contract fail just enough gas for intrinsic gas correctly failed with Returned error: intrinsic gas too low)
Pushed transaction 'http://localhost:8080/tx/0x7cd29b2cbf4bb094a3227bff30b190e0f1aab733aa56c7215f9f3cec181adecd' (call: delegate with value)
Pushed transaction 'http://localhost:8080/tx/0x4f92c270e0e693f91522df5fc400c6e283d329eb72ea9ee1e8f5b46490f75462' (call: complete call tree)
Pushed transaction 'http://localhost:8080/tx/0xcde6b689f7e1933165b85635991db4d06ccee651a9f545f16beefa3c68cf93b4' (call: contract creation from call, without a constructor)
Pushed transaction 'http://localhost:8080/tx/0x453731eaa610350f297c4639b0ee879c1fa6b38c8b7bf3dc1685d01da11032d5' (call: call to a precompiled address)
Pushed transaction 'http://localhost:8080/tx/0x05823d57adbbe59fd3a7c49b7110ba50f6c1b81f955699aceeaf043a1bb6750e' (call: nested fail with native transfer)
Pushed transaction 'http://localhost:8080/tx/0xeceeb6a937e79002ca589b9d800598083c5e8b42b502c628a04f6063ffc161a2' (call: contract creation from call, with constructor)
Pushed transaction 'http://localhost:8080/tx/0xfb9d7503bb4a1a441d44569db773432a7e820b75ae817d732535af74b26def42' (call: contract creation from call, recursive constructor, second will fail correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0xa0251ed57540efdca7521051cdb2681bc1ad8544eb9ac66dd88fca862f5af5fb' (call: contract creation from call, with constructor that will fail correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0x686d774b296b1303f5a51fb09903775bfcab742d2c7d1949ef3b66b4262a547b' (call: nested call revert state changes)
Pushed transaction 'http://localhost:8080/tx/0xc5d533f97be6385fc088377c7f04008c78c0fb03e620a4e74711c2834833aa83' (call: all pre-compiled)
Pushed transaction 'http://localhost:8080/tx/0x51e572c0d5fb509f97ceb2e47b6d1e6ae174fbe4377fa4d13e639959c5d9d623' (call: contract with create2, inner call fail due to insufficent funds (transaction succeed though))
Pushed transaction 'http://localhost:8080/tx/0xc3f2028468832ca1cf04aa5bbf004e0ded79aff850fd035f295949d353637a2e' (call: revert failure root call correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0xadaaea0c503273de7842df6cd8136e9cf86bbd3164786f8ecca2645921c7daf5' (call: assert failure root call correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0x3322a81e17c7f4dcce75dba9839f4cf89c73dd7a852a0d06c3051f3385a3fe23' (call: contract with create2, inner call fail due to insufficent funds then revert correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0x024abeab08c7edee2592b889fd2bf0ef9a7d88cf84be03601ab9d5c78cd3687a' (call: contract with create2, succesful creation)
Pushed transaction 'http://localhost:8080/tx/0xe29961172a0c69f1cf7695490bcbb08b73e0d724b9c00193c1d867291014564a' (call: assert failure on child call correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0x0bd314073c63711807e96198b8833f5bf95011351f123224124a317a7ce475e7' (call: contract fail not enough gas after code_copy correctly failed with The contract code couldn't be stored, please check your gas limit.)
Pushed transaction 'http://localhost:8080/tx/0x6d830a8c5515587c7b2e6fef150f2e911d794c48c9ba83e3eb8407feb5ce9df0' (call: contract with create2, inner call fail due to address already exists (transaction succeed though))
Pushed transaction 'http://localhost:8080/tx/0x556430abb4bebcb3451d8694838e1296ebe4c81a2ddb4a06666ba487037b8c6c' (call: contract with create2, inner call fail due to address already exists then revert correctly failed with EVM reverted without reason)

Performing 'gas' transactions
Pushed transaction 'http://localhost:8080/tx/0xcd7dd88a37bf4eb0f1ea077bf7c2fc0888d0e9ac1da6924d6f921f0ad26fac86' (gas: deep nested nested call for lowest gas)
Pushed transaction 'http://localhost:8080/tx/0xb05049c08d4d1e7290c1f147c81a3a2e1720042fed67a004d7bbd5a781ce51a1' (gas: nested low gas)
Pushed transaction 'http://localhost:8080/tx/0x01b311fb18697e5f26b1efcec95021da055e3856a1c18a0ecd77c7e49728f11d' (gas: empty call for lowest gas)
Pushed transaction 'http://localhost:8080/tx/0x885614c2ab831c993f67a31cff30ce908ee26125618104025c8e244e05a27ef6' (gas: deep nested call for lowest gas)
Pushed transaction 'http://localhost:8080/tx/0x9003a3e603b8b4c4db56732cf2ac0957695f7f30d42970f519f7cb555b168cb5' (gas: deep nested low gas)

Performing 'suicide' transactions
Pushed transaction 'http://localhost:8080/tx/0x70c065a098e4584eaf05088e4152f4e985d2a3dd5def8660dd4899fe397f7e67' (suicide: transfer some Ether to contract suicide that's about to suicide itself)
Pushed transaction 'http://localhost:8080/tx/0xbaf1976e326a0a6b1ab67297e4ce45b2f0d108fa421d91e4dafc39a459c7cc6b' (suicide: create contract to fixed address (create2), kill it and try instantiate it again at same address)
Pushed transaction 'http://localhost:8080/tx/0xa52720770b0cddb71de197b49c01972f40dd28de60262dd00472daaf3c4ad537' (suicide: ensure suicidal2 bump is nonce by creating a contract (#1))
Pushed transaction 'http://localhost:8080/tx/0x8a0c064ba29237da793b048af32ae0addd4ce8fe4dfa3c636ebcd1e383d6cf16' (suicide: contract does not hold any Ether)
Pushed transaction 'http://localhost:8080/tx/0xc9f18e96cb0664f35eed2bb7fbf75afe35abda1e4b929d1c3476646e61f9d0b5' (suicide: ensure suicidal2 bump is nonce by creating a contract (#2))
Pushed transaction 'http://localhost:8080/tx/0x3357c153aa724ce395b0c4668cb1ac23f875d837d92de10a6fddcf03be1de231' (suicide: create contract, kill it and try to call within same call)
Pushed transaction 'http://localhost:8080/tx/0xa80a6c520eadf8dc7f3bab6fd961e4df84bf962708bf9659d2695c8351f68b0b' (suicide: contract does hold some Ether, and refund owner on destruct)
Pushed transaction 'http://localhost:8080/tx/0x0254c5ad376880326cf97a59b8648b51ea4f566f0737418bd6bb125d0e803336' (suicide: create contract, kill it and try to call within same call (second time to valid nonce change after suicide))
Pushed transaction 'http://localhost:8080/tx/0x8cf27f0ac617345de1a4fac00985b9eadcab103ddfba6db9cd32a038ed1c976f' (suicide: create contract to fixed address (create2), kill it and try instantiate it again at same address)

Completed battlefield deployment (local)
```
