## Transaction Log (Tue 30 Mar 2021 11:26:18 EDT)

```
Geth
Version: 1.9.13-stable
Architecture: amd64
Protocol Versions: [65 64 63]
Go Version: go1.15.5
Operating System: darwin
GOPATH=/Users/julien/go
GOROOT=/usr/local/Cellar/go/1.15.5/libexec
```

```
$ /Users/julien/codebase/dfuse-io/eth-battlefield/node_modules/.bin/ts-node src/main.ts
Configuration
 Network: local
 Default address: 0x821b55d8abe79bc98f05eb675fdc50dfe796b7ab
 RPC Endpoint: http://localhost:8545

Deploying contracts...
Deploying contract 'EIP20Factory'
Deploying contract 'Suicidal'
Deploying contract 'Suicidal'
Deploying contract 'Child'
Deploying contract 'UniswapV2Factory'
Deploying contract 'Main'
Deploying contract 'GrandChild'

Contracts
- main => 0xCae819bff9B75c3D34971C19e005F2cAD7354E0f
- child => 0x929bc44BBD41Ca0e621dc50f7c7E3204Ce026258
- grandChild => 0x314F9285cbC3835e676974abDb7d2ab45ede3686
- suicidal1 => 0x702641c70a11E480F646Ed247d078c65aBAAC5DE
- suicidal2 => 0x9a77F7b94488d24EcA50FA0d144212AE48300A71
- uniswap => 0xEC9C1fCee156bf34Ba4fB5D38C9CF09Df16723eF
- erc20 => 0x71940c77ccadaeA1238CEa27674E6253128ca177

Transaction Links
- main => http://localhost:8080/tx/0x87e10c0473230c5ac5bffdb1f288c31af5dc7ba447752be9538bbeacc4cc2910
- child => http://localhost:8080/tx/0x27e234af8a8c915dc10c934ca6619e09d0411d7b9e927315ade9f475013f42f1
- grandChild => http://localhost:8080/tx/0xfe58387d854e1eb80591906dff51fc97179a507a3084c244f8894b5e0dab79c0
- suicidal1 => http://localhost:8080/tx/0x2d3c0b25e1a5938da8ad735676df0c518339c5806bc65080ba371c038e9a49e5
- suicidal2 => http://localhost:8080/tx/0x031c0bcbc9a78d878f2587fff81724b1e834e8f3a60d6a5941c2a6d39f3beac4
- uniswap => http://localhost:8080/tx/0x8754a357b30be2e902a59decc1460eca1d96585e13cce750771d2ade1b7b763a
- erc20 => http://localhost:8080/tx/0x5ac4ca43dfa5ccedb8e799d4bce9188461267c807dc1b50f8e141f62d787d66e

Performing pure 'transfer' transactions
Pushed transaction 'http://localhost:8080/tx/0x5a215c52d4626649d12dd5ba78d6c04ab43e80d6a25e61f50d091562c2b06ad3' (pure transfer: existing address)
Pushed transaction 'http://localhost:8080/tx/0xec6ab9a187d19e7d20c80508440f9cebdb308decf08a336e7e43b66298af433c' (pure transfer: existing address with custom gas limit & price)
Pushed transaction 'http://localhost:8080/tx/0xa40beea79c8617fd7bd27d695c96a15c1e2d9851d43d6b4e322d0d2d4162ff8f' (pure transfer: inexistant address creates account and has an EVM call)
Pushed transaction 'http://localhost:8080/tx/0x0661b32d7c53d5a2b77f55ee3e7e8da5c138789266af9682449eb2a91239c504' (pure transfer: transfer of 0 ETH to inexistant address generates a transaction with no EVM call)

Performing 'transfer' through contract transactions
Pushed transaction 'http://localhost:8080/tx/0x656a5158873ae03b2bd132bdc322d032abdcc8520e17f7485276f4d9c90b47dd' (transfer through contract: existing addresss)
Pushed transaction 'http://localhost:8080/tx/0x009bcdd105ba0881aedc7a3663f1a7da6b6b39d7cc5521ed420754ab5138ed5a' (transfer through contract: inexistant address creates account and has an EVM call)
Pushed transaction 'http://localhost:8080/tx/0x56bdddbaabc5cd6568e88855612b25c12366df030c9e8f9e5c42a9afd52c61a6' (nested transfer through contract: existing addresss)
Pushed transaction 'http://localhost:8080/tx/0xfd4e211140053330751f33944b68309ab79d6e428a66943645c38cb247050ac8' (nested transfer through contract: inexistant address creates account and has an EVM call)

Performing failing 'transfer' through contract transactions
Pushed transaction 'http://localhost:8080/tx/0x286e35168fa508e6541918467b48b6d1ef92676d406067c51556348609b6eb93' (transfer through contract: existing addresss correctly failed with EVM reverted without reason)

Performing 'log' transactions
Pushed transaction 'http://localhost:8080/tx/0xffddf4d8ccfa66767bfe2dc00d46a744ff6dc9d6d6bf54526c32de979266ed46' (log: empty)
Pushed transaction 'http://localhost:8080/tx/0x74f210c96712f50653b84a05dcd02082a9d6ce40cd4dd098d50f16a73fade3b2' (log: all indexed)
Pushed transaction 'http://localhost:8080/tx/0xbc60b1c147e645e5c2fa8194d082da403f5c54991fc206458cf0c66444eb98cb' (log: single)
Pushed transaction 'http://localhost:8080/tx/0x22430ddf5c0e7d7367cd938f84e53c6a915bafe4c7914ed49185c4beb3c50adf' (log: all)
Pushed transaction 'http://localhost:8080/tx/0x58db352cacc8410c538005453ce76bcbf722e6bd3b71263f4274066418736cd7' (log: all mixed)
Pushed transaction 'http://localhost:8080/tx/0x53f91af412732884437364b455f8353eb44152d5dedbd60e3ef3472c05c16c6c' (log: multi)

Performing 'storage & input' transactions
Pushed transaction 'http://localhost:8080/tx/0xcc89ad60435f9aa0a440c6e5a9a0b26ab0bd4059c38224c04945e8ef61d7b094' (input: string equal 32)
Pushed transaction 'http://localhost:8080/tx/0x1ecc0b0d6c8e086cc4d359b5509019739e68e5bb40f327d2a5e77a3286a33291' (input: string equal 30)
Pushed transaction 'http://localhost:8080/tx/0xfd7417744c80bc673e3e68739261d817aa7c03e2076a6badd69fe043ff997910' (input: string equal 15)
Pushed transaction 'http://localhost:8080/tx/0x6b12572008d30071597738a2ca7560d2163c3cd1903d79b634cc2e577eece4b8' (storage: set long string)
Pushed transaction 'http://localhost:8080/tx/0x910b0aaa6545b5b87e64bb9d7b4d71ea3aafc543332394376bcb9b0bee8228cf' (input: string equal 31)
Pushed transaction 'http://localhost:8080/tx/0x42fe18149b5c6be022693a84f5cf4c024d1726e9a327c6921f327d8f7c8f87ce' (input: string equal 0)
Pushed transaction 'http://localhost:8080/tx/0x1674c607b5f17d945b5c92696c418fede69157a3f74801d2314344b5b1fd78f0' (input: string longer than 32)
Pushed transaction 'http://localhost:8080/tx/0x4b7ec72c38a3cf7c970007ba2e3b17ec2e043c7a34f74e8011db2586541710b0' (storage: array update)

Performing 'call' & 'constructor' transactions
Pushed transaction 'http://localhost:8080/tx/0x84f21b91bb55b00a7da1c201d4e9f4b950ad6ae66bbf8de999e23475315db6c4' (call: contract creation from call, with constructor that will fail correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0x1cd0d34973893b1e219cbfa2698fb3f0cbeda54669f8ea5804a8728f047edcd5' (call: contract creation from call, without a constructor)
Pushed transaction 'http://localhost:8080/tx/0x61411ce2a5ca46e7d95fb2adb7517e2311a82bc0848ee404fbe84516d6efee55' (call: contract creation from call, with constructor)
Pushed transaction 'http://localhost:8080/tx/0x75cea49f4d8ea3a1c2dc9d1e79c393a6773cb129faad229ec54c52f46f187d7b' (call: contract creation from call, recursive constructor, second will fail correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0x030ad8a3abb1393c8a911f32a77a48308fa7d76cedf2d2841bc931f292ba4f9a' (call: nested fail with native transfer)
Pushed transaction 'http://localhost:8080/tx/0xa4c4b0f72b129cab3d0d02525e0389f33f0fe8d4d3b72f5ba76aed53bb3cb464' (call: complete call tree)
Pushed transaction 'http://localhost:8080/tx/0xd35fe03199b1d6698dd701e4f025655de6d2733a23f0693f12162e728a7e7ad8' (call: nested call revert state changes)
Pushed transaction 'http://localhost:8080/tx/0xaa63247f0f47459b54909f72d4b1123f05b35de179ca6ba847efa562ff3bfa2b' (call: assert failure root call correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0x526f5ec6a5c420a893c1eb2113e5c5a6b8374bb011a8ecae770a7962d51be3ec' (call: assert failure on child call correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0xfee551b66c3bf05fe9c1c09e38a2290d3e8dd1c098fe71e2786583dc1d772332' (call: all pre-compiled)
Pushed transaction 'http://localhost:8080/tx/0x609b1cf6c93f533ecde4514107541f88175bd306547bafa4eba6d86ebfa1c518' (call: revert failure root call correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0x4c57904a761a1a430276974f4d1dd20e1c7b807fd3dfd36997be8374e0e2661f' (call: contract fail just enough gas for intrinsic gas correctly failed with The contract code couldn't be stored, please check your gas limit.)
Pushed transaction 'http://localhost:8080/tx/0xd9f459b47ac5177719ac38ffb59318a4506f1d45f02e13fc8386937dfe8081f5' (call: contract fail not enough gas after code_copy correctly failed with The contract code couldn't be stored, please check your gas limit.)

Performing 'gas' transactions
Pushed transaction 'http://localhost:8080/tx/0xb1e76d495ec511d8c3dec7440293e97073b2ddd387196d1d8a9c7f98190ddf75' (gas: empty call for lowest gas)
Pushed transaction 'http://localhost:8080/tx/0xc9d70e3335a27c6299ab7ce1559d2d3fdd937b6e584493e9737341a6c3d926f3' (gas: deep nested nested call for lowest gas)
Pushed transaction 'http://localhost:8080/tx/0x78338fc694a556151d07397ce9eae3e23b7fd83cc9e8d04173c306ee770d056c' (gas: deep nested low gas)
Pushed transaction 'http://localhost:8080/tx/0x1f67df9e3c672ce812ed63e9362261fd79e4801b7b8a58241dfa1bd5f42b9384' (gas: nested low gas)
Pushed transaction 'http://localhost:8080/tx/0xb0596b31220f55af2146559e3d4a38d711356e8951a54b41c3132f6966ee2477' (gas: deep nested call for lowest gas)

Performing 'suicide' transactions
Pushed transaction 'http://localhost:8080/tx/0xe8939467e258203c7ba2ac8ba42ef5b18f9c9fef790f1ebcb8e14eb19dbc9bad' (suicide: contract does not hold any Ether)
Pushed transaction 'http://localhost:8080/tx/0x2d37bbbdcb75a68772f805c02ddc8d553af85bd2fe6f339d335fe8bdd06f3846' (suicide: transfer some Ether to contract that's about to suicide itself)
Pushed transaction 'http://localhost:8080/tx/0xfa40cdd68620f6367ed461e48691bb8eee738c5a438098f1e57c65913a360657' (suicide: contract does hold some Ether, and refund owner on destruct)

Completed battlefield deployment (local)
```
