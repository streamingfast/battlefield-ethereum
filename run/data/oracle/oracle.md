## Transaction Log (Wed Mar 24 22:59:37 EDT 2021)

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
Deploying contract 'UniswapV2Factory'
Deploying contract 'Suicidal'
Deploying contract 'Main'
Deploying contract 'EIP20Factory'
Deploying contract 'GrandChild'
Deploying contract 'Suicidal'
Deploying contract 'Child'

Contracts
- main => 0x9a77F7b94488d24EcA50FA0d144212AE48300A71
- child => 0x314F9285cbC3835e676974abDb7d2ab45ede3686
- grandChild => 0xEC9C1fCee156bf34Ba4fB5D38C9CF09Df16723eF
- suicidal1 => 0x702641c70a11E480F646Ed247d078c65aBAAC5DE
- suicidal2 => 0xCae819bff9B75c3D34971C19e005F2cAD7354E0f
- uniswap => 0x71940c77ccadaeA1238CEa27674E6253128ca177
- erc20 => 0x929bc44BBD41Ca0e621dc50f7c7E3204Ce026258

Transaction Links
- main => http://localhost:8080/tx/0xddd456b7db7a2b7c72b9fec6cce428473bbd996cecd2a98bab7f506168018a2e
- child => http://localhost:8080/tx/0xf1f2c8f4d4c211061e747438182e09d45dc603e4bf43f2c7fee157a638399446
- grandChild => http://localhost:8080/tx/0x20c134be7336755a6063499d18be979c374f3c871d9bd7ca2b6a0ec4b32d5b14
- suicidal1 => http://localhost:8080/tx/0x2d3c0b25e1a5938da8ad735676df0c518339c5806bc65080ba371c038e9a49e5
- suicidal2 => http://localhost:8080/tx/0xd8550ee33c1c42b2f2c78dbaa0e7a05e2800d8b354fe20920a026afb93c4a518
- uniswap => http://localhost:8080/tx/0xbda611d85e6df66b4b2fe2d4edc8d518068df19bdcd1c317bda7988a7aecccb4
- erc20 => http://localhost:8080/tx/0x692c2485d95f3a88eb948b8944e03eecc4c58ad16d5917fccd8bf5237c3638f7

Performing pure 'transfer' transactions
Pushed transaction 'http://localhost:8080/tx/0x5a215c52d4626649d12dd5ba78d6c04ab43e80d6a25e61f50d091562c2b06ad3' (pure transfer: existing address)
Pushed transaction 'http://localhost:8080/tx/0xc7b7a943255654f463557f6c925684a28722e79f54a9bf29166a220229c4a9bf' (pure transfer: inexistant address creates account and has an EVM call)
Pushed transaction 'http://localhost:8080/tx/0x040b8015c4eb1627d40edb3f8aeabfa0d8646b0a27260e0cfa155db6b08b98e6' (pure transfer: transfer of 0 ETH to inexistant address generates a transaction with no EVM call)
Pushed transaction 'http://localhost:8080/tx/0xee11e7aa2c4b4c5b557f7f1bbd851edfb5b7198bff36d1c5e64b308664d457f0' (pure transfer: existing address with custom gas limit & price)

Performing 'transfer' through contract transactions
Pushed transaction 'http://localhost:8080/tx/0xcb86b3702053a4c2eb1b605defe1409167d7ab53309460995ab8a64e301a1975' (transfer through contract: existing addresss)
Pushed transaction 'http://localhost:8080/tx/0xce67329162b678a2153ddbc53bd0a0b9b3abe4d25c9851170721f1afaa240818' (nested transfer through contract: inexistant address creates account and has an EVM call)
Pushed transaction 'http://localhost:8080/tx/0x796c06602ed8a7a4a76b935eabaf3bcef3b0b331beee325833eaade4de315b23' (nested transfer through contract: existing addresss)
Pushed transaction 'http://localhost:8080/tx/0x2e7e5c49d627ed1694a8bba52cde98522f51fee7c511b09cdd20e105e42e0da3' (transfer through contract: inexistant address creates account and has an EVM call)

Performing failing 'transfer' through contract transactions
Pushed transaction 'http://localhost:8080/tx/0xd145b2412fcd3c152ce66c3db6b5ae934c3cb45d3178adcf4299cdc6fd906455' (transfer through contract: existing addresss correctly failed with EVM reverted without reason)

Performing 'log' transactions
Pushed transaction 'http://localhost:8080/tx/0x191167436d04d9e5bf23bc37b159f01f940c2548bde1acb8f16f4286ce46e949' (log: single)
Pushed transaction 'http://localhost:8080/tx/0x47b85139226aa296b5f594e010100c98aa3cf04a250e9002d937b2ba88086797' (log: all mixed)
Pushed transaction 'http://localhost:8080/tx/0xf45bb05bbda7ba26c5e1d601756aa40914d864a1551a8d7cc60909bd92473a7a' (log: multi)
Pushed transaction 'http://localhost:8080/tx/0x181168d7ad4e52ddb06f1a0d5c6f47624288855c7579c4feb7339ba6ceba3b35' (log: all)
Pushed transaction 'http://localhost:8080/tx/0x7d995144e0862c2d4f248176439bbb8c8f91ee7ab7582afd175fc6c8c683d194' (log: empty)
Pushed transaction 'http://localhost:8080/tx/0x8c93d84558faa4819249a13b09d75da9ec6006df4e5b167d67cc2b6ce3740868' (log: all indexed)

Performing 'storage & input' transactions
Pushed transaction 'http://localhost:8080/tx/0x984cc66cdc6f59f3fc536e398f87d02bfa087720d258c72589ee183d6f75204e' (input: string equal 32)
Pushed transaction 'http://localhost:8080/tx/0x638f3c4a59a3b49b6a6947e47d046012cb657a18bf317cea20f9ada23c30e639' (input: string equal 31)
Pushed transaction 'http://localhost:8080/tx/0x968502766d72d5ea5533dbe79020cbd86a4c2b03afd40bb9f8e83b10f495de92' (input: string equal 30)
Pushed transaction 'http://localhost:8080/tx/0x9aabff8a822609dc376a5b603160cb60c51f4d4acba5345863884b3a741a2c8e' (storage: set long string)
Pushed transaction 'http://localhost:8080/tx/0x277f70734b5f42bd0b2466329ccce603a88af4826c95a31b76ae24a681b71bfc' (input: string equal 15)
Pushed transaction 'http://localhost:8080/tx/0x89310c0b142a1a5d652276b9e51e32e5cf967c738e102b652155eca26008e192' (input: string equal 0)
Pushed transaction 'http://localhost:8080/tx/0x3169ef4f2cd9594b4aa131df4748160ba6eb79f9948f865ed2ac45d8fa07d3ce' (input: string longer than 32)
Pushed transaction 'http://localhost:8080/tx/0x8672812b3d0cbf339a13360ebf20a1804be22ea803c08c5e65411a7377e41ebc' (storage: array update)

Performing 'call' transactions
Pushed transaction 'http://localhost:8080/tx/0x84d491fc48a3425d478dff2e15dcfeacdc034fdc8509564ee1c91b682930b2c7' (call: nested fail with native transfer)
Pushed transaction 'http://localhost:8080/tx/0x833dcdc69f76d4b736ac5b4eb44915138ffb098d14a319bdfa32931f33cf909c' (call: contract creation from call, with constructor)
Pushed transaction 'http://localhost:8080/tx/0x09f3cc7a72ca95da22535e8c40700939a876ae7f642b03f4deb22c8754ff20e8' (call: nested call revert state changes)
Pushed transaction 'http://localhost:8080/tx/0x103a7b96c3ac441b2a44f9364dea46cc515df2945d0dfb96fcdca391edcdb95e' (call: contract creation from call, without a constructor)
Pushed transaction 'http://localhost:8080/tx/0xb2e115e57146f7d3e1dae393ad1a9ffc88015100c3c23033d6b7299244ff4810' (call: all pre-compiled)
Pushed transaction 'http://localhost:8080/tx/0xfbcfc1cbfeebb1ab2f2e98b18cc7da5f3ecbb2778979fd325b6a599a2008da59' (call: complete call tree)
Pushed transaction 'http://localhost:8080/tx/0xaf85a96e0dec10ad02e81a5494681b38d36d5fb449fe70e98ad422fd909a149b' (call: assert failure root call correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0x01fa1381e55f1220f2165aef2563da6c6df592154f417a1d6c5b2d1454ca0b3b' (call: revert failure root call correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0xd05d66e23ad985816c0d3ea2f7723ee82c276d508018a810ef0577b61b295091' (call: assert failure on child call correctly failed with EVM reverted without reason)

Performing 'gas' transactions
Pushed transaction 'http://localhost:8080/tx/0x5427ad581188a1a3be561d42ce02ac7b5d48a65deb6efb7e15d42cce1ea50f40' (gas: empty call for lowest gas)
Pushed transaction 'http://localhost:8080/tx/0xa401fb64f03b7872239e0229c6eb290b41372d81fd098def8214bb72adced1b7' (gas: deep nested low gas)
Pushed transaction 'http://localhost:8080/tx/0x17d34b86fe57150fdc1ec0cdcf2414d8f95f6a097eb920e6b56bff235e7d019d' (gas: deep nested nested call for lowest gas)
Pushed transaction 'http://localhost:8080/tx/0xd3b49e6e7bb64680b1d0aacc7254837a9cf2f297abe92c2995ebdc2eb8956639' (gas: deep nested call for lowest gas)
Pushed transaction 'http://localhost:8080/tx/0x360cbe44ca1678f818390f9486eda7f3a508faac942ae157761e322a20cb197c' (gas: nested low gas)

Performing 'suicide' transactions
Pushed transaction 'http://localhost:8080/tx/0xbda755d77bf4a85b5a6b2e87c71996cc70a5f977fad02e91c3c27c8234c1f501' (suicide: contract does not hold any Ether)
Pushed transaction 'http://localhost:8080/tx/0x0524f23164ae6fca3617e6f15ecc7e7de4e7add4c7d26e3dc23be06d89b5e1db' (suicide: transfer some Ether to contract that's about to suicide itself)
Pushed transaction 'http://localhost:8080/tx/0xf43db9c1d24ea4b4feebf64531316e36b19af8537a98fb2155f71b9e3e8ed13b' (suicide: contract does hold some Ether, and refund owner on destruct)

Completed battlefield deployment (local)
```
