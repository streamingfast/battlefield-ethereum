## Transaction Log (Tue 30 Mar 2021 00:48:17 EDT)

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
Deploying contract 'GrandChild'
Deploying contract 'Suicidal'
Deploying contract 'UniswapV2Factory'
Deploying contract 'Child'
Deploying contract 'Suicidal'
Deploying contract 'Main'

Contracts
- main => 0x314F9285cbC3835e676974abDb7d2ab45ede3686
- child => 0xEC9C1fCee156bf34Ba4fB5D38C9CF09Df16723eF
- grandChild => 0x702641c70a11E480F646Ed247d078c65aBAAC5DE
- suicidal1 => 0x9a77F7b94488d24EcA50FA0d144212AE48300A71
- suicidal2 => 0xCae819bff9B75c3D34971C19e005F2cAD7354E0f
- uniswap => 0x929bc44BBD41Ca0e621dc50f7c7E3204Ce026258
- erc20 => 0x71940c77ccadaeA1238CEa27674E6253128ca177

Transaction Links
- main => http://localhost:8080/tx/0xf8d17dfe158c4b1208b67ad6ccff73a76934d7bd63e343b3a0782c290e682622
- child => http://localhost:8080/tx/0x616e0ef84f6cb8aeaf33e3300ec5e200db43cb434ffb9c4bd4c3d00bb905929f
- grandChild => http://localhost:8080/tx/0xfeb7158587ff596ed583fcf3f935e627b2b0ac3c03b99f5b12f1d577ad8f57c4
- suicidal1 => http://localhost:8080/tx/0x031c0bcbc9a78d878f2587fff81724b1e834e8f3a60d6a5941c2a6d39f3beac4
- suicidal2 => http://localhost:8080/tx/0xd8550ee33c1c42b2f2c78dbaa0e7a05e2800d8b354fe20920a026afb93c4a518
- uniswap => http://localhost:8080/tx/0x0fa6c2d16e27e8b53568bd5f59917d39fac7b0ae4ed066baef358fc066200266
- erc20 => http://localhost:8080/tx/0x5ac4ca43dfa5ccedb8e799d4bce9188461267c807dc1b50f8e141f62d787d66e

Performing pure 'transfer' transactions
Pushed transaction 'http://localhost:8080/tx/0x5a215c52d4626649d12dd5ba78d6c04ab43e80d6a25e61f50d091562c2b06ad3' (pure transfer: existing address)
Pushed transaction 'http://localhost:8080/tx/0xec6ab9a187d19e7d20c80508440f9cebdb308decf08a336e7e43b66298af433c' (pure transfer: existing address with custom gas limit & price)
Pushed transaction 'http://localhost:8080/tx/0x9f1394ccd36641f909d34215b196e4f25d8df1e8e55d848a2e6471b758917f4d' (pure transfer: transfer of 0 ETH to inexistant address generates a transaction with no EVM call)
Pushed transaction 'http://localhost:8080/tx/0x9a9498da344a3944b12a728e9ae6d4d7d6d77cf3fa3234129b7d86d1d4f02a23' (pure transfer: inexistant address creates account and has an EVM call)

Performing 'transfer' through contract transactions
Pushed transaction 'http://localhost:8080/tx/0x1fda2c013bec8f3f273a055f2d66a5ee76ab1fede333efa7585ab6fd9b45c68d' (transfer through contract: inexistant address creates account and has an EVM call)
Pushed transaction 'http://localhost:8080/tx/0xb6505d3f242343d48fbf1416463e612e15859cdaaf2acaf26ec34c5486c6c2d9' (transfer through contract: existing addresss)
Pushed transaction 'http://localhost:8080/tx/0xe22eaa1d1bbd003656c6006887090d813778687055d88479d81095c39d4d0b70' (nested transfer through contract: existing addresss)
Pushed transaction 'http://localhost:8080/tx/0xde056d72e7248841e97e5684e279daa939d5dc40ad5329b2758178fb6ede0eb5' (nested transfer through contract: inexistant address creates account and has an EVM call)

Performing failing 'transfer' through contract transactions
Pushed transaction 'http://localhost:8080/tx/0x778f290a439aefa6bdf01da4af175e85d19e615bf868b84d21b61b30a2a570f5' (transfer through contract: existing addresss correctly failed with EVM reverted without reason)

Performing 'log' transactions
Pushed transaction 'http://localhost:8080/tx/0x57f29ca7272d26bbef44a941c22334789da375eedc4e963d19695556505031c6' (log: empty)
Pushed transaction 'http://localhost:8080/tx/0xca862345ba4e57333e72ccb0067d1080e3e78b7eb274fd770fa26e6a40b73d05' (log: single)
Pushed transaction 'http://localhost:8080/tx/0x788a1803b209225850bb897d16a0cfbf3365e8995e9873fb2395da533d059833' (log: multi)
Pushed transaction 'http://localhost:8080/tx/0xd1d65908ad908b50a4690b454626742afed84c9106d9488f93fd906cab183108' (log: all)
Pushed transaction 'http://localhost:8080/tx/0x2e1b35e12aa727a78d4c2aa1fffa22ef816b78245bd3003663abc5b29f0fa32e' (log: all indexed)
Pushed transaction 'http://localhost:8080/tx/0xad2bbde0fd7f080e4d322913d8c0ee5f5ef26ae5a9dd082807afb82b112ef49e' (log: all mixed)

Performing 'storage & input' transactions
Pushed transaction 'http://localhost:8080/tx/0xb7e525752a1be1bf2066149ed17b6e5247df9ebea0cfa347aefa933dab5a83e9' (input: string equal 0)
Pushed transaction 'http://localhost:8080/tx/0x2405d04a344304d5272bb0eeb82a1b8eb94d4f3c7845b4c67c5a83d4458c5b50' (input: string equal 31)
Pushed transaction 'http://localhost:8080/tx/0xf4e3d4dcbaa44c39b2acffe72d11fcbba00bef42d93bdcd8763e5d92a8e434e0' (storage: set long string)
Pushed transaction 'http://localhost:8080/tx/0xdcf29f5b1a76e00efb26f7218d0f69c3b7a7d46819a3436c1b07d6e22305c37a' (input: string equal 15)
Pushed transaction 'http://localhost:8080/tx/0xe9520d454cc13104f8620cb0ac980dd036d520ee235f03e426e01eded77be506' (input: string equal 30)
Pushed transaction 'http://localhost:8080/tx/0xc71ef2e034286163cd19abd90ebe06d1f4c1f2946e6ad591874e44b0bb3b11d8' (input: string longer than 32)
Pushed transaction 'http://localhost:8080/tx/0x9745db6ebc21ea15c71e76bc278d911861510df59916449ea962283907d6258d' (input: string equal 32)
Pushed transaction 'http://localhost:8080/tx/0x16ec32dc10a507d540d57a0663b9c8c343166a9e752b13e6f550d0a9901e9ce9' (storage: array update)

Performing 'call' & 'constructor' transactions
Pushed transaction 'http://localhost:8080/tx/0xaeed0554134c74576f3a0cea739211e87e3b085c2a2bacb12fbc85a803279dfe' (call: nested call revert state changes)
Pushed transaction 'http://localhost:8080/tx/0x5c4c805362fe194732296908d64474428a758009270c87c72ea8537d18f58ebd' (call: nested fail with native transfer)
Pushed transaction 'http://localhost:8080/tx/0xdb83a4b115fa87e5f95051a9c7b3e78832a4d2db44d523b3ab1d046aaee6cb4e' (call: complete call tree)
Pushed transaction 'http://localhost:8080/tx/0x1de01aea7c73213a491003f941e6fd82074b28e283b2c3c82e10879395b11139' (call: all pre-compiled)
Pushed transaction 'http://localhost:8080/tx/0xae7b7e0ddd319b776bb1e8e74b134b28479f9f16db0e17175bb7c1e3bedad910' (call: contract creation from call, without a constructor)
Pushed transaction 'http://localhost:8080/tx/0xf330c0d2a4cd32e9ebbec357c55dffc13e06456636d1e5b13fae96cda31ff027' (call: contract creation from call, recursive constructor, second will fail correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0xb9d3dd71781f7c4aeed9ee00d8b592cb3c977768ea1590f796f13d99392e92b5' (call: assert failure root call correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0x6ddb1f706439032b43c00836c63c7b98c5fa26a83935960d6581e2c0d89adeca' (call: revert failure root call correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0x66e7e889255635b140c6bdac9b203a1c5ce53206a3ca0720283ba3444b996f8b' (call: assert failure on child call correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0x6fb0e36db5d4a27a2018803de8872dab6e79606b79d18fae8433e7eeea3b5f4e' (call: contract creation from call, with constructor that will fail correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0x7a1a5d3754c47412e669a296965c0dad0b46367b45358bb77a4d6f9f9edd475a' (call: contract creation from call, with constructor)
Pushed transaction 'http://localhost:8080/tx/0xf7f826bdfe20132ec6ef1d475ba95f373a998e0681c7210c59567067550dcdac' (call: contract fail not enough gas after code_copy correctly failed with The contract code couldn't be stored, please check your gas limit.)
Pushed transaction 'http://localhost:8080/tx/0x721797c9c677ac42299d1b687e74b6c20ed0a945d61c9604b9dedde999ba40b0' (call: contract fail just enough gas for intrinsic gas correctly failed with The contract code couldn't be stored, please check your gas limit.)

Performing 'gas' transactions
Pushed transaction 'http://localhost:8080/tx/0x69cb559abaaba3affd99837866ba6dea25f6784774f9ed5c17f79a00321172cd' (gas: nested low gas)
Pushed transaction 'http://localhost:8080/tx/0xb211174f0619c306bc2307f69cfc2e846d1046db5f22a1cfb23ae850af32d9e8' (gas: empty call for lowest gas)
Pushed transaction 'http://localhost:8080/tx/0xa01a5ba42f59db5e4a27630c91066e13edb74c394a333a5e9daa42f025cccd53' (gas: deep nested call for lowest gas)
Pushed transaction 'http://localhost:8080/tx/0x1ae347d2be6fb59e43aae3df040cdc53d9d2849ac5cd23dcd2f09638920b0b39' (gas: deep nested low gas)
Pushed transaction 'http://localhost:8080/tx/0xcbb808b5afe4ee1543a6436a3417ffc9ebb955a85141b9b1af20076a9f6bab94' (gas: deep nested nested call for lowest gas)

Performing 'suicide' transactions
Pushed transaction 'http://localhost:8080/tx/0x07b49bd4640ad8c5addf832b4916c79bfe93e45321e26dc1bb889f1cc00709d1' (suicide: transfer some Ether to contract that's about to suicide itself)
Pushed transaction 'http://localhost:8080/tx/0xb976ef231225977f3297145b173d7a54ceba39fc7505df3e37721e83353f108c' (suicide: contract does not hold any Ether)
Pushed transaction 'http://localhost:8080/tx/0xc9a4511640e97908325e890492a1c101a22d4d33015a2d141a01d39d6128d0cb' (suicide: contract does hold some Ether, and refund owner on destruct)

Completed battlefield deployment (local)
```
