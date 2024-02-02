## Transaction Log (Fri Feb  2 12:04:24 EST 2024)

```
Geth
Version: 1.13.11-unstable
Firehose Tracer Protocol Version: fh 3.0
Git Commit: 8849451b97063e50dde5ced08751c9bdbe7546cc
Git Commit Date: 20240124
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
Deploying contract 'Main'
Deploying contract 'Suicidal'
Deploying contract 'Transfers'
Deploying contract 'GrandChild'
Deploying contract 'Calls'
Deploying contract 'Logs'
Deploying contract 'EIP20Factory'
Deploying contract 'Child'
Deploying contract 'UniswapV2Factory'

Contracts
- main => 0x702641c70a11E480F646Ed247d078c65aBAAC5DE
- calls => 0xCae819bff9B75c3D34971C19e005F2cAD7354E0f
- logs => 0x314F9285cbC3835e676974abDb7d2ab45ede3686
- transfers => 0x929bc44BBD41Ca0e621dc50f7c7E3204Ce026258
- child => 0x410fd7B9368812207DCf674afCB5E359e1365011
- grandChild => 0xEC9C1fCee156bf34Ba4fB5D38C9CF09Df16723eF
- suicidal1 => 0x71940c77ccadaeA1238CEa27674E6253128ca177
- suicidal2 => 0x9a77F7b94488d24EcA50FA0d144212AE48300A71
- uniswap => 0xf0d54E7d8399dF98817E4bD6DDe189ABC8824E3D
- erc20 => 0x34C044506dB54D3e8966300b7CBEFBb569b02C60

Transaction Links
- main => http://localhost:8080/tx/0x5d1a6bbc3bd99a75357c17f5a754e073099f7a9d59d8ccad6c42cf4d0f9d5bd1
- calls => http://localhost:8080/tx/0xf61be1cca510936fe02739dd62edcbed7b9d4f39b0250c1fa7c927377e79d1ab
- logs => http://localhost:8080/tx/0x87a4e07776604a20b2d3050c597bc75b7b375f3128ed2c2d411d7f6f5df18630
- transfers => http://localhost:8080/tx/0xc6aba819582738ece590e1d0415d43fb1ce454208f9a3322f8cdc0d7113df07a
- child => http://localhost:8080/tx/0xd9a548bb849a7d1b2af398df8c9da73ec0bce6070799db23e3ec7df12bfa78b3
- grandChild => http://localhost:8080/tx/0xc101c0bca6ed52b43a199427274903beac0d44414bb18cf8cc2a24a098f63973
- suicidal1 => http://localhost:8080/tx/0xb865c6013c6a5612851ead73ee67aff34a0e912b9e09d6a0ab44e76020e4e686
- suicidal2 => http://localhost:8080/tx/0x7d152174204af92c9e5e7884d1168ff08dfb44b0942988d4b8cba561ad6ff8f9
- uniswap => http://localhost:8080/tx/0x9d45a05f1173539e95dbc10f54f4458d4cac00cf8987f02b1fb3c979291c173e
- erc20 => http://localhost:8080/tx/0x0a37a908bb7480e7401c048a0cbf06fe0ec7f220078d36ee43f5064698024a7f

Performing pure 'transfer' transactions
Pushed transaction 'http://localhost:8080/tx/0xee11e7aa2c4b4c5b557f7f1bbd851edfb5b7198bff36d1c5e64b308664d457f0' (pure transfer: existing address with custom gas limit & price)
Pushed transaction 'http://localhost:8080/tx/0xd6a5303fc4058d6dd95a531c3fb2979e275c488befa68ed7b0e9e99f99a6c664' (pure transfer: existing address)
Pushed transaction 'http://localhost:8080/tx/0x6730f43566a910581965d92d7961bb75d7a74d578533b3a62f8138ce881470fd' (pure transfer: transfer of 0 ETH to inexistant address generates a transaction with no EVM call)
Pushed transaction 'http://localhost:8080/tx/0xbc22c78691f6fdb8ca8112e08dbe8b63590f8e723ea46875a0ccb643bdcf3ae2' (pure transfer: to precompile address)
Pushed transaction 'http://localhost:8080/tx/0x9fa16b76414b02e06b76afd8288f406c1c33174d29e50b32f37fac94a594878b' (pure transfer: inexistant address creates account and has an EVM call)

Performing 'transfer' through contract transactions
Pushed transaction 'http://localhost:8080/tx/0xba9ea0e137c388ec5d08eaae6c659a3f4f4e1b420207602a39583935e514e04d' (nested transfer through contract: existing addresss)
Pushed transaction 'http://localhost:8080/tx/0xab77cc26d98e6c4e7c32e91693b57a034c5f8e9138ed3398b334d1a719098482' (transfer through contract: inexistant address creates account and has an EVM call)
Pushed transaction 'http://localhost:8080/tx/0xb179f4774148762f710931477e82d3c9c186af13a3f58636f845170cdcf44813' (transfer through contract: existing addresss)
Pushed transaction 'http://localhost:8080/tx/0xeb2720d5f33758f3dd95b9b00047d7afc947ce7379b4aa05bb06ebfe53f00c43' (nested transfer through contract: inexistant address creates account and has an EVM call)

Performing failing 'transfer' through contract transactions
Pushed transaction 'http://localhost:8080/tx/0xc818c9466ed90f6195550c2a0f5c3057e7287a500c55658e94844eda1887d9a0' (transfer through contract: existing addresss correctly failed with EVM reverted without reason)

Performing 'log' transactions
Pushed transaction 'http://localhost:8080/tx/0x788a1803b209225850bb897d16a0cfbf3365e8995e9873fb2395da533d059833' (log: multi)
Pushed transaction 'http://localhost:8080/tx/0x44f34757fb371fc283a06b8e801e561e3b05b06401da9157c696c7049927fca6' (log: empty)
Pushed transaction 'http://localhost:8080/tx/0x74e410db86586ba8f93dad8a21e9389b37f7f3c4864a08992020d07cfc5f11dc' (log: all indexed)
Pushed transaction 'http://localhost:8080/tx/0xff2a1954f17595e1cdc641eb1db52e31c7bcde37b906de5646c94fec2c28281f' (log: log in sub-call that fails but top-level trx succeed)
Pushed transaction 'http://localhost:8080/tx/0x59027e197bd4fae4125d493c44635fae0c01221aa1eadf1e8677731b66f9006d' (log: all mixed)
Pushed transaction 'http://localhost:8080/tx/0xa9afaef49e21ef1b20b97639633131b78038c99e35623857cbd43fa6d8ac4159' (log: single)
Pushed transaction 'http://localhost:8080/tx/0x8d314ccf0555690854a4c8bf6be85f37b7c166d7ae3bf3f98e34b4d37998eaf2' (log: log in top-level trx and then top-leve trx fails correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0xefce8b3aa1e69c4e4be2f70386dbd701d895dbff7c5ca6e954215ccb58d49277' (log: all)
Pushed transaction 'http://localhost:8080/tx/0x02738efcf01732c11433427855fa29b69243ee50c8a8e8a6a0f7e6367e1fbdc2' (log: log in sub-call that succeed but top-level trx fails correctly failed with EVM reverted without reason)

Performing 'storage & input' transactions
Pushed transaction 'http://localhost:8080/tx/0x11304fc727a19f795e77cece38df84a45dc2613cb7ed23e570206728de3e7bcc' (input: string longer than 32)
Pushed transaction 'http://localhost:8080/tx/0xf3da425ad63dcd89674bf929b9758a50119887300f44834256cc30442b558987' (input: string equal 32)
Pushed transaction 'http://localhost:8080/tx/0xdfef68edcce2d7640fb10b8708c664918b3d6b574477b77b58480d29e820f42e' (input: string equal 31)
Pushed transaction 'http://localhost:8080/tx/0xcea57ae6c15e9522655361532f054801e5a1ec03f6f324b65c95cc9b7e8466dc' (input: string equal 15)
Pushed transaction 'http://localhost:8080/tx/0x1a1ad27e57311228835c4220c1819266502d3e916bce30e6e6ea9497502bb9f0' (input: string equal 0)
Pushed transaction 'http://localhost:8080/tx/0x789433294a47aa60ad54d3b94509ad1287224ac6d5b555e1a37a3270b6bed73d' (input: string equal 30)
Pushed transaction 'http://localhost:8080/tx/0x16a45dd1cde2cceae48c05ce2086aa4bd42c004bf2c00b4fe00598145076824d' (storage: set long string)
Pushed transaction 'http://localhost:8080/tx/0xa7e1bed8bab4829b19e41f06c6f6e9952d4b262b4d1cd1c075bb18a87f06695a' (storage: array update)

Performing 'call' & 'constructor' transactions (new contract)
Pushed transaction '' (call: contract fail just enough gas for intrinsic gas correctly failed with Returned error: intrinsic gas too low)
Pushed transaction 'http://localhost:8080/tx/0x1c01f4822b7488c6236988ab30f8711c802fcddbe6eae57903401f6691437980' (call: complete call tree)
Pushed transaction 'http://localhost:8080/tx/0x489c68a4974a417e91f0b24dde1ecf5ed2bc4a42e5154032cf43a8e21f6b4518' (call: contract fail not enough gas after code_copy correctly failed with The contract code couldn't be stored, please check your gas limit.)

Performing 'call' & 'constructor' transactions
Pushed transaction '' (call: contract fail just enough gas for intrinsic gas correctly failed with Returned error: intrinsic gas too low)
Pushed transaction 'http://localhost:8080/tx/0x4d4cc12814339b35378f31f917a15c967b4888beb3b3f6583bc508b791ed5ce7' (call: nested call revert state changes)
Pushed transaction 'http://localhost:8080/tx/0x787573474edeee44bdd9e1e96971b2648ddd9ea6692d904f9899c610439d76f1' (call: all pre-compiled)
Pushed transaction 'http://localhost:8080/tx/0x0294bfc51680541f7f5f1069ad1d49a95aa3d65cebd28271cede3b6433b9f0a7' (call: contract creation from call, with constructor)
Pushed transaction 'http://localhost:8080/tx/0xc1c6651b6f045a4a7744f88ffcafe529f7459e3c00b9bdcb3a1ed373de700b6a' (call: call to a precompiled address without balance)
Pushed transaction 'http://localhost:8080/tx/0xc28f24eb7d9fbe8670fc63e864bdb3b186d696e2e17441486b66184e82067e03' (call: delegate with value)
Pushed transaction 'http://localhost:8080/tx/0xc92b55e83b02d0b82c7b5896aea86ac48a6af4ceee651befeb7f8b8ab2d5e48b' (call: contract creation from call, without a constructor)
Pushed transaction 'http://localhost:8080/tx/0x07847ec9b34a596edc1f9f675cb3239097f9d51470717c35719d12a13e7dfe5e' (call: nested fail with native transfer)
Pushed transaction 'http://localhost:8080/tx/0x8728ee261008188a572f32a4e8f01df92c5a541bfaf20c4ec5d2b0143e521909' (call: complete call tree)
Pushed transaction 'http://localhost:8080/tx/0x0eb5ddcf68fb1ade9f3ba454649cb722ec1cb3b9c432257ac5f023dba567f708' (call: assert failure on child call correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0x42aa3dbc4ddab87119b94a22bb4b13a7f07de14c32775f9ca0380d65eac3f419' (call: assert failure root call correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0xd538661b63308f007f3c52abcf4d0b597154b492ef1179521a5aec08f1ca544f' (call: contract creation from call, recursive constructor, second will fail correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0xccfe171704b7b1e928a277375c9977dbeb7390d88694738d019a63a123083d44' (call: revert failure root call correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0x4de4d3d46e2f1429d561d23cae642a63f6ded3712f2c28f2fea5a38d8520caf4' (call: contract creation from call, with constructor that will fail correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0x70ab6d5a778c376aa0ca482f481cd06788c6b209c5f32a4b1786b19cb39f741b' (call: contract with create2, inner call fail due to insufficent funds then revert correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0x0725dfb307b4833d0299f3146f15880194f03010cd73e3915d4a089c6f7cdf49' (call: contract with create2, succesful creation)
Pushed transaction 'http://localhost:8080/tx/0x781646a3f2705284592d728e0e9bab5aa27daa67fb4c40bb34fad39c51f15415' (call: call to a precompiled address with balance)
Pushed transaction 'http://localhost:8080/tx/0xd121d52ecf1394c2939d4ef5860f6117e9c53eb4137a3021cadda18377da52c7' (call: contract with create2, inner call fail due to insufficent funds (transaction succeed though))
Pushed transaction 'http://localhost:8080/tx/0x8097feeaa7d83235d72d9cfd7f70712ca076cc0728aa465876ae4290ba070574' (call: contract fail not enough gas after code_copy correctly failed with The contract code couldn't be stored, please check your gas limit.)
Pushed transaction 'http://localhost:8080/tx/0x75eab7a7db44a115d8db1f270816ad733af39774b88e99f322c95d690ece0725' (call: contract with create2, inner call fail due to address already exists (transaction succeed though))
Pushed transaction 'http://localhost:8080/tx/0x1903ff1b04ea8435a589e079ac37e4eca4d69a72ceb9b659ff3b0764ab598353' (call: contract with create2, inner call fail due to address already exists then revert correctly failed with EVM reverted without reason)

Performing 'gas' transactions
Pushed transaction 'http://localhost:8080/tx/0xadbae49ebf456474e3e863e7c620769bee1db545b9784f18b3dcae36d3e150d3' (gas: empty call for lowest gas)
Pushed transaction 'http://localhost:8080/tx/0xeef1f6a67caa160772e8fb2a4e377b24cadd3c2c5e207792ca720670ac5f1865' (gas: deep nested nested call for lowest gas)
Pushed transaction 'http://localhost:8080/tx/0x49774a2ed31752585260d088426aaaa9345ce36e1bb048176ddc0e887adceafe' (gas: deep nested call for lowest gas)
Pushed transaction 'http://localhost:8080/tx/0xa9184a7651f153c3be3f813363f8a5bdaa27ce61ae75e10844a9429598d5c98a' (gas: nested low gas)
Pushed transaction 'http://localhost:8080/tx/0xd46724de6a221cffa40aa1c7cac8dc072dbc527569bbfd75a122b5e7c38b66da' (gas: deep nested low gas)

Performing 'suicide' transactions
Pushed transaction 'http://localhost:8080/tx/0x8a0c064ba29237da793b048af32ae0addd4ce8fe4dfa3c636ebcd1e383d6cf16' (suicide: contract does not hold any Ether)
Pushed transaction 'http://localhost:8080/tx/0x31486e2b40df2e247caa47323773ac5978b29d225b7b3c89ea570f4dcd7e2f0a' (suicide: create contract to fixed address (create2), kill it and try instantiate it again at same address)
Pushed transaction 'http://localhost:8080/tx/0xec5d924bb557658be4f46df4ead432b225e38ae5c3c2d1f36920e86a32799b8d' (suicide: ensure suicidal2 bump is nonce by creating a contract (#2))
Pushed transaction 'http://localhost:8080/tx/0x102e189c0f6df74e250c9836eb62996f1215e0e801419383b6364f6bb6ff5525' (suicide: create contract, kill it and try to call within same call)
Pushed transaction 'http://localhost:8080/tx/0x8e5750bd29b4d160a0de62929a5e82b02c1416340ef46be444c4744127ff63dd' (suicide: ensure suicidal2 bump is nonce by creating a contract (#1))
Pushed transaction 'http://localhost:8080/tx/0xadcc30a47f6115b8c552c1a27a39ea193d9e83bc9b766d0706bc51dd9747a722' (suicide: transfer some Ether to contract suicide that's about to suicide itself)
Pushed transaction 'http://localhost:8080/tx/0xed1adf95bbea3275ae27da01291a804193168d9060b54e9bc41eb8c1cafbd3c4' (suicide: contract does hold some Ether, and refund owner on destruct)
Pushed transaction 'http://localhost:8080/tx/0x2a096e6ba81028c2c10ff9db75948911ebaf267b68815fa495007c7057109cac' (suicide: create contract, kill it and try to call within same call (second time to valid nonce change after suicide))
Pushed transaction 'http://localhost:8080/tx/0xab2192da57786311e8275ee6e6e425ae7cdc3959910a9376138a950b473f76a7' (suicide: create contract to fixed address (create2), kill it and try instantiate it again at same address)
Pushed transaction 'http://localhost:8080/tx/0x52617df117bea8e2dd50c51604ba55f1125d400764a1d325dee95f164da553b0' (call: call to a precompiled address without balance again at the very end, to see effect on OnNewAccount)
Pushed transaction 'http://localhost:8080/tx/0x6fe5517bf7b3d678c432fc17bbb2550d943622e52abc2623c9d747a241dc652f' (call: call to a precompiled address with balance again at the very end, to see effect on OnNewAccount)

Completed battlefield deployment (local)
```
