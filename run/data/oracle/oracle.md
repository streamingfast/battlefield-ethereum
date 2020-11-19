## Transaction Log (Wed Nov 18 16:33:01 EST 2020)

```
$ /Users/maoueh/work/dfuse/ethereum.battlefield/node_modules/.bin/ts-node src/main.ts
Configuration
 Network: local
 Default address: 0x821b55d8abe79bc98f05eb675fdc50dfe796b7ab
 RPC Endpoint: http://localhost:8545

Deploying contracts...
Deploying contract 'Grandchild'
Deploying contract 'Suicidal'
Deploying contract 'EIP20Factory'
Deploying contract 'Child'
Deploying contract 'UniswapV2Factory'
Deploying contract 'Suicidal'
Deploying contract 'Main'

Contracts
- main => 0x314F9285cbC3835e676974abDb7d2ab45ede3686
- child => 0x929bc44BBD41Ca0e621dc50f7c7E3204Ce026258
- grandChild => 0x71940c77ccadaeA1238CEa27674E6253128ca177
- suicidal1 => 0xCae819bff9B75c3D34971C19e005F2cAD7354E0f
- suicidal2 => 0x702641c70a11E480F646Ed247d078c65aBAAC5DE
- uniswap => 0xEC9C1fCee156bf34Ba4fB5D38C9CF09Df16723eF
- erc20 => 0x9a77F7b94488d24EcA50FA0d144212AE48300A71

Transaction Links
- main => http://localhost:8080/tx/0x25a49150dd819ed5385b4de763ba0b40f5addd2e05e4df6a254cf2fea3b8f071
- child => http://localhost:8080/tx/0x27e234af8a8c915dc10c934ca6619e09d0411d7b9e927315ade9f475013f42f1
- grandChild => http://localhost:8080/tx/0xf20c4598f6a67d8b8b2403a1b7d6771d17a060f4c3c2838f1152bc08e52cac6d
- suicidal1 => http://localhost:8080/tx/0xd8550ee33c1c42b2f2c78dbaa0e7a05e2800d8b354fe20920a026afb93c4a518
- suicidal2 => http://localhost:8080/tx/0x2d3c0b25e1a5938da8ad735676df0c518339c5806bc65080ba371c038e9a49e5
- uniswap => http://localhost:8080/tx/0x846545936f239c675b6f253ecba2d375c60a4d43ba0bed64b133f6868e2b2757
- erc20 => http://localhost:8080/tx/0x81ba6b83ae860362bb9a6ad202edc8a6edc33ed3803b1314a79c1a71722af4d0

Performing pure 'transfer' transactions
Pushed transaction 'http://localhost:8080/tx/0x5a215c52d4626649d12dd5ba78d6c04ab43e80d6a25e61f50d091562c2b06ad3' (pure transfer: existing address)
Pushed transaction 'http://localhost:8080/tx/0x3c974d14dbbbfd6ce4a89d02644353c699fd710ae478ba611f96e945929be018' (pure transfer: existing address with custom gas limit & price)
Pushed transaction 'http://localhost:8080/tx/0xe7a666548a8689b65107ee3fe0209a6d7c41ab63facad9e5e776b1bd45f18b41' (pure transfer: inexistant address creates account and has an EVM call)
Pushed transaction 'http://localhost:8080/tx/0xe5f48a03617bdf3222111e5b2cff0ec6609d969f881f4ed866d98cbc60161823' (pure transfer: transfer of 0 ETH to inexistant address generates a transaction with no EVM call)

Performing 'transfer' through contract transactions
Pushed transaction 'http://localhost:8080/tx/0xcd64315839ee8fb239d10d60221832fbf4ead3010cb7099ce53285b3e8d721c9' (transfer through contract: existing addresss)
Pushed transaction 'http://localhost:8080/tx/0xcafce59a1c87013e2eab8ee5299f6fb79e9f7b597f8abec11daffd054503fa5c' (nested transfer through contract: existing addresss)
Pushed transaction 'http://localhost:8080/tx/0x12af5661db35523ee5374e4292e2327560102aeccc5a82043ff22e33c839e40d' (transfer through contract: inexistant address creates account and has an EVM call)
Pushed transaction 'http://localhost:8080/tx/0x3d8593146cd92518c8a816904b2cc406051b9a45b39dfd70db322f5f24ce7e26' (nested transfer through contract: inexistant address creates account and has an EVM call)

Performing 'log' transactions
Pushed transaction 'http://localhost:8080/tx/0xca862345ba4e57333e72ccb0067d1080e3e78b7eb274fd770fa26e6a40b73d05' (log: single)
Pushed transaction 'http://localhost:8080/tx/0x713ef655b0018764151de0e6b29fba624eb1e4bc268aa72a70fbf43bf4344a82' (log: all)
Pushed transaction 'http://localhost:8080/tx/0x58d41006b3f89b1c62d4e79ce3e205e409ba3fb85b2756eabb7099f16f1ad5b4' (log: multi)
Pushed transaction 'http://localhost:8080/tx/0x2d35e56c2b5049ae2ee3ab1ae16c88056dd6b36359f378e593f445b32b11891b' (log: all mixed)
Pushed transaction 'http://localhost:8080/tx/0xd6a2826030141ed6ecca5e751a54e5cd3a1e42c35295c7eb87fed1f686a36685' (log: empty)
Pushed transaction 'http://localhost:8080/tx/0x2e1b35e12aa727a78d4c2aa1fffa22ef816b78245bd3003663abc5b29f0fa32e' (log: all indexed)

Performing 'storage & input' transactions
Pushed transaction 'http://localhost:8080/tx/0xe0a4f7a0ef7aa5d5039543f4d41c0050920e57ba93a72eac2e17a49566d19078' (input: string equal 15)
Pushed transaction 'http://localhost:8080/tx/0x67fbc05b348d04c4bb9ff8df0895a9ba83d140c0d21c2b322f3a7018cdbacad9' (input: string equal 32)
Pushed transaction 'http://localhost:8080/tx/0xe9520d454cc13104f8620cb0ac980dd036d520ee235f03e426e01eded77be506' (input: string equal 30)
Pushed transaction 'http://localhost:8080/tx/0x77a42bec6ff19a4c248df0d57ab8a83b05753a6f71c5a3750ab71589ce462923' (storage: set long string)
Pushed transaction 'http://localhost:8080/tx/0x2405d04a344304d5272bb0eeb82a1b8eb94d4f3c7845b4c67c5a83d4458c5b50' (input: string equal 31)
Pushed transaction 'http://localhost:8080/tx/0x35c67cc7e1b826168b7c34f57052f653f60d273bdc36a5b173a68cbbb0388c01' (input: string equal 0)
Pushed transaction 'http://localhost:8080/tx/0x42981ff512a9cff5142851ce33987f4429eee028231e3ccc9301c955498250ca' (input: string longer than 32)
Pushed transaction 'http://localhost:8080/tx/0x0d0278b11012ba7fbc36b9c0449203efd21abdb33537f9a8c5e6c4ff9a8ab960' (storage: array update)

Performing 'call' transactions
Pushed transaction 'http://localhost:8080/tx/0x2961a2d2cfceeed3b8c25da19d416c28c217687275a9618dcc24546f6c35444f' (call: complete call tree)
Pushed transaction 'http://localhost:8080/tx/0x7f49e62cffb8649f6c6bb5abb413162627b54b424b59c2e98ea3e7834dac2e01' (call: contract creation from call, without a constructor)
Pushed transaction 'http://localhost:8080/tx/0xa8518687583123e05682ac5485f4bd05e86d7ca593ff5e1da5c256e98e21beda' (call: nested fail with native transfer)
Pushed transaction 'http://localhost:8080/tx/0x53b4fdc2ce97e7341b4d2e671d573d68e246ecfe9ce968105149dbe7765d10f9' (call: nested call revert state changes)
Pushed transaction 'http://localhost:8080/tx/0xf6d7d9784efd908f3b409dca10919ccecc6c321de248599633ad5494813cc50a' (call: contract creation from call, with constructor)
Pushed transaction 'http://localhost:8080/tx/0x36e315c672d5d4a8840f9b05836ad8280ae6a5569daf82380ce110bd8c0463d1' (call: all pre-compiled)

Performing 'gas' transactions
Pushed transaction 'http://localhost:8080/tx/0x6d7e0d633a0f8f4bcebcce9aa3210ed620602c4e66f239ae57d6b4e42be95ea1' (gas: empty call for lowest gas)
Pushed transaction 'http://localhost:8080/tx/0x244ba88016a4fdf46f17d52a042e7244a7edb7b799f08bff83481fb352ced905' (gas: deep nested nested call for lowest gas)
Pushed transaction 'http://localhost:8080/tx/0xac150c8a2980b908609a8a4d1c34748c7777b0ce91a3bdca485bc5d8ce1d14c6' (gas: nested low gas)
Pushed transaction 'http://localhost:8080/tx/0xbadd91b112c18b02541b6f0d71c58df8e65569cc6fb38c5dfb4a87db224fa560' (gas: deep nested call for lowest gas)
Pushed transaction 'http://localhost:8080/tx/0xaacf048ecfcaac16158d499afb41536bc4c1456445697b4443e3e97700721cdb' (gas: deep nested low gas)

Performing 'suicide' transactions
Pushed transaction 'http://localhost:8080/tx/0x520d4c5e10a13310e7d0b39740b148fce42673f1946816ef0d6b13df7d79c412' (suicide: transfer some Ether to contract that's about to suicide itself)
Pushed transaction 'http://localhost:8080/tx/0xc20ffa097a51659569ed08f8d899a4342d0326a2344cd96edca5a6d99b7737f9' (suicide: contract does not hold any Ether)
Pushed transaction 'http://localhost:8080/tx/0x37830eb21b8fa31f62f4c7918901c2fd14f7f3cbcf3a54bebd4392bc481f8586' (suicide: contract does hold some Ether, and refund owner on destruct)

Completed battlefield deployment (local)
```
