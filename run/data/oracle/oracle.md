## Transaction Log (Wed 31 Mar 2021 14:32:51 EDT)

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
Deploying contract 'UniswapV2Factory'
Deploying contract 'Child'
Deploying contract 'Suicidal'
Deploying contract 'Main'
Deploying contract 'GrandChild'

Contracts
- main => 0xCae819bff9B75c3D34971C19e005F2cAD7354E0f
- child => 0x929bc44BBD41Ca0e621dc50f7c7E3204Ce026258
- grandChild => 0x314F9285cbC3835e676974abDb7d2ab45ede3686
- suicidal1 => 0xEC9C1fCee156bf34Ba4fB5D38C9CF09Df16723eF
- suicidal2 => 0x702641c70a11E480F646Ed247d078c65aBAAC5DE
- uniswap => 0x9a77F7b94488d24EcA50FA0d144212AE48300A71
- erc20 => 0x71940c77ccadaeA1238CEa27674E6253128ca177

Transaction Links
- main => http://localhost:8080/tx/0xeee3dd4bb8728db085ca57bb85f5ee18bc1a467e3ec75fc0b4105cc270bd5796
- child => http://localhost:8080/tx/0x27e234af8a8c915dc10c934ca6619e09d0411d7b9e927315ade9f475013f42f1
- grandChild => http://localhost:8080/tx/0xfe58387d854e1eb80591906dff51fc97179a507a3084c244f8894b5e0dab79c0
- suicidal1 => http://localhost:8080/tx/0xdb817b0906b80b24654db5951f054aa42b2ff282bf29f0a4c37b38af6f008236
- suicidal2 => http://localhost:8080/tx/0x2d3c0b25e1a5938da8ad735676df0c518339c5806bc65080ba371c038e9a49e5
- uniswap => http://localhost:8080/tx/0x9ca2f631b00513cef151c42e42e00a0271d5aee1916671a1adeb6cf3a88e64f2
- erc20 => http://localhost:8080/tx/0x5ac4ca43dfa5ccedb8e799d4bce9188461267c807dc1b50f8e141f62d787d66e

Performing pure 'transfer' transactions
Pushed transaction 'http://localhost:8080/tx/0x5a215c52d4626649d12dd5ba78d6c04ab43e80d6a25e61f50d091562c2b06ad3' (pure transfer: existing address)
Pushed transaction 'http://localhost:8080/tx/0xec6ab9a187d19e7d20c80508440f9cebdb308decf08a336e7e43b66298af433c' (pure transfer: existing address with custom gas limit & price)
Pushed transaction 'http://localhost:8080/tx/0x3a42aaac0eb4821038d9d8ece62826042e669bbd72ab98b68c92812f8346b51d' (pure transfer: inexistant address creates account and has an EVM call)
Pushed transaction 'http://localhost:8080/tx/0xefd11a1d133a2bdb8172fb7c3ff6768754b532ca897195691d120b2d8af07252' (pure transfer: transfer of 0 ETH to inexistant address generates a transaction with no EVM call)

Performing 'transfer' through contract transactions
Pushed transaction 'http://localhost:8080/tx/0x656a5158873ae03b2bd132bdc322d032abdcc8520e17f7485276f4d9c90b47dd' (transfer through contract: existing addresss)
Pushed transaction 'http://localhost:8080/tx/0x07115020a540ed02b3687f72e1199e7156c8a62bb1cf529dbac2156057d23189' (transfer through contract: inexistant address creates account and has an EVM call)
Pushed transaction 'http://localhost:8080/tx/0x705f82d094a7c4f82f12c5c3e595ceadd58bc92e6c393fa5f66ceb4b7b9c523f' (nested transfer through contract: inexistant address creates account and has an EVM call)
Pushed transaction 'http://localhost:8080/tx/0x59236b01cd0e4714ddc5daacc5570353c45ee9e967b4e85d41a5a6cb05184337' (nested transfer through contract: existing addresss)

Performing failing 'transfer' through contract transactions
Pushed transaction 'http://localhost:8080/tx/0x286e35168fa508e6541918467b48b6d1ef92676d406067c51556348609b6eb93' (transfer through contract: existing addresss correctly failed with EVM reverted without reason)

Performing 'log' transactions
Pushed transaction 'http://localhost:8080/tx/0xffddf4d8ccfa66767bfe2dc00d46a744ff6dc9d6d6bf54526c32de979266ed46' (log: empty)
Pushed transaction 'http://localhost:8080/tx/0x1b2029d5a7f2f82bcc4c77686098cb39b0692f5ba6ee91d6f0dc2f82e08cc06d' (log: multi)
Pushed transaction 'http://localhost:8080/tx/0x62e88e75f275a03e57a1d149d67a7708c074e1385ac0d6f36012983ff724acf8' (log: single)
Pushed transaction 'http://localhost:8080/tx/0x68b875099cd05f39c205885805c0d5154c13e80168d685c7f3b7d776d213dea5' (log: all)
Pushed transaction 'http://localhost:8080/tx/0xa0bfce0a95d5631c2714a09bfd034cb32f7d284477420228f75e55e167421cb8' (log: all mixed)
Pushed transaction 'http://localhost:8080/tx/0x2374506f96d4fa85abf8edd05c9eddec064b9a1f519cbb8cb3351d7c5b6d5111' (log: all indexed)

Performing 'storage & input' transactions
Pushed transaction 'http://localhost:8080/tx/0x1674c607b5f17d945b5c92696c418fede69157a3f74801d2314344b5b1fd78f0' (input: string longer than 32)
Pushed transaction 'http://localhost:8080/tx/0x1ecc0b0d6c8e086cc4d359b5509019739e68e5bb40f327d2a5e77a3286a33291' (input: string equal 30)
Pushed transaction 'http://localhost:8080/tx/0xcc89ad60435f9aa0a440c6e5a9a0b26ab0bd4059c38224c04945e8ef61d7b094' (input: string equal 32)
Pushed transaction 'http://localhost:8080/tx/0x42fe18149b5c6be022693a84f5cf4c024d1726e9a327c6921f327d8f7c8f87ce' (input: string equal 0)
Pushed transaction 'http://localhost:8080/tx/0x910b0aaa6545b5b87e64bb9d7b4d71ea3aafc543332394376bcb9b0bee8228cf' (input: string equal 31)
Pushed transaction 'http://localhost:8080/tx/0xfd7417744c80bc673e3e68739261d817aa7c03e2076a6badd69fe043ff997910' (input: string equal 15)
Pushed transaction 'http://localhost:8080/tx/0x6b12572008d30071597738a2ca7560d2163c3cd1903d79b634cc2e577eece4b8' (storage: set long string)
Pushed transaction 'http://localhost:8080/tx/0x4b7ec72c38a3cf7c970007ba2e3b17ec2e043c7a34f74e8011db2586541710b0' (storage: array update)

Performing 'call' & 'constructor' transactions
Pushed transaction 'http://localhost:8080/tx/0x6d7c412babd374988abfba551cdf9f1cfe34a98d39dd8760a424187c158852d7' (call: contract creation from call, without a constructor)
Pushed transaction 'http://localhost:8080/tx/0x7adf96ded2303727eab0a940d6d5b51cff620387988a7458463514d505ef2293' (call: contract creation from call, with constructor)
Pushed transaction 'http://localhost:8080/tx/0x675b21d9991c1eca1e2ecc8a62ae7bb0c355afe3cfe19adff6972238229c1822' (call: contract creation from call, with constructor that will fail correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0x7860536904fbe3c9df9b0ee0dd469c6ce246df61ade1ae2b03110a479b6e9250' (call: nested fail with native transfer)
Pushed transaction 'http://localhost:8080/tx/0x75cea49f4d8ea3a1c2dc9d1e79c393a6773cb129faad229ec54c52f46f187d7b' (call: contract creation from call, recursive constructor, second will fail correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0xa4c4b0f72b129cab3d0d02525e0389f33f0fe8d4d3b72f5ba76aed53bb3cb464' (call: complete call tree)
Pushed transaction 'http://localhost:8080/tx/0xd35fe03199b1d6698dd701e4f025655de6d2733a23f0693f12162e728a7e7ad8' (call: nested call revert state changes)
Pushed transaction 'http://localhost:8080/tx/0xfee551b66c3bf05fe9c1c09e38a2290d3e8dd1c098fe71e2786583dc1d772332' (call: all pre-compiled)
Pushed transaction 'http://localhost:8080/tx/0xae39dd2356d81f4e317f2f087789b15240c2cbe06b8e89c0ea0429c6e23a0823' (call: assert failure root call correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0x609b1cf6c93f533ecde4514107541f88175bd306547bafa4eba6d86ebfa1c518' (call: revert failure root call correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0x3855e0748d9d3ed92f08233b1c9f582014ac54c232454831fc6c08311b76838e' (call: assert failure on child call correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0xf7f826bdfe20132ec6ef1d475ba95f373a998e0681c7210c59567067550dcdac' (call: contract fail not enough gas after code_copy correctly failed with The contract code couldn't be stored, please check your gas limit.)
Pushed transaction 'http://localhost:8080/tx/0x721797c9c677ac42299d1b687e74b6c20ed0a945d61c9604b9dedde999ba40b0' (call: contract fail just enough gas for intrinsic gas correctly failed with The contract code couldn't be stored, please check your gas limit.)
Pushed transaction 'http://localhost:8080/tx/0x28f8abc6e2636a7daab74d7bdd731514480c257bf922561e748fd806c7364f63' (call: contract creation2 from call should fail with transfer exceeding account balance correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0x1f6f8f73eb2353421095a12c006c98173835582abbce8ad8c2353ef30d3d807a' (call: contract creation2 from call)
Pushed transaction 'http://localhost:8080/tx/0xbec7e52cf0d061e394311ca9e7d9d60ba0a9ef7830f521646e182590cb81ff97' (call: contract creation2 will fail with already existing address)

Performing 'gas' transactions
Pushed transaction 'http://localhost:8080/tx/0x8b3be1de8261b522ff4b671c316b9db326a530831c7cfaece85269520fc16bdc' (gas: empty call for lowest gas)
Pushed transaction 'http://localhost:8080/tx/0x77630fe434c86ad7df239a5d5e9f1a646777eaea57ddfa0b621a6bb8aa8bf624' (gas: nested low gas)
Pushed transaction 'http://localhost:8080/tx/0x14974dacbe3eb6b4e511980fd461b515ae1643dd133e5cd2c5aa5130bc50ede4' (gas: deep nested nested call for lowest gas)
Pushed transaction 'http://localhost:8080/tx/0x54e4f8427cafdaa9f3c865493dce9c00736e06396ce037e1eecfa5d4d7986eba' (gas: deep nested call for lowest gas)
Pushed transaction 'http://localhost:8080/tx/0x82fe277affe5298e1428f68c83ee7eadc37de608260a6833b1a2fae41d0cbfda' (gas: deep nested low gas)

Performing 'suicide' transactions
Pushed transaction 'http://localhost:8080/tx/0x68b12019c1c3beca0ed12433b8725a8e2122f27f2d4d2b54048c8b989eb85990' (suicide: contract does not hold any Ether)
Pushed transaction 'http://localhost:8080/tx/0x8d01124dcc3df901565d5e93e1deb84b0d17e767c0bfb92beadc5bc85f9ce104' (suicide: transfer some Ether to contract that's about to suicide itself)
Pushed transaction 'http://localhost:8080/tx/0x37a0ef81b199a7c583a8a11c9cc41813d6c7ddc73cce6b54d0a6ab9ab08003c4' (suicide: contract does hold some Ether, and refund owner on destruct)

Completed battlefield deployment (local)
```
