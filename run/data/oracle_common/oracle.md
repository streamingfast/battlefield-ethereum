## Transaction Log (Fri Apr 19 15:56:40 EDT 2024)

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
 Default address: 0x821B55D8AbE79bC98f05Eb675fDc50dFe796B7Ab
 RPC Endpoint: http://localhost:8545

Deploying contracts...
Deploying contract 'EIP20Factory'
Deploying contract 'Logs'
Deploying contract 'Main'
Deploying contract 'Transfers'
Deploying contract 'GrandChild'
Deploying contract 'UniswapV2Factory'
Deploying contract 'Suicidal'
Deploying contract 'Child'
Deploying contract 'Calls'
Deploying contract 'Suicidal'

Contracts
- main => 0x9a77F7b94488d24EcA50FA0d144212AE48300A71
- calls => 0xf0d54E7d8399dF98817E4bD6DDe189ABC8824E3D
- logs => 0x702641c70a11E480F646Ed247d078c65aBAAC5DE
- transfers => 0x929bc44BBD41Ca0e621dc50f7c7E3204Ce026258
- child => 0x34C044506dB54D3e8966300b7CBEFBb569b02C60
- grandChild => 0xEC9C1fCee156bf34Ba4fB5D38C9CF09Df16723eF
- suicidal1 => 0x410fd7B9368812207DCf674afCB5E359e1365011
- suicidal2 => 0x314F9285cbC3835e676974abDb7d2ab45ede3686
- uniswap => 0xCae819bff9B75c3D34971C19e005F2cAD7354E0f
- erc20 => 0x71940c77ccadaeA1238CEa27674E6253128ca177

Performing pure 'transfer' transactions
Pushed transaction '0x254f13e1ea8c651f527d1e57b0e82c433efc3e7a7a962a40d1db6c40a07a054f' (pure transfer: existing address)
Pushed transaction '0x1df1048f92c8d30024997af5eb470a55c8a9ef897f20b0edd6bd1bf0e5d2f048' (pure transfer: transfer of 0 ETH to inexistant address generates a transaction with no EVM call)
Pushed transaction '0xd49ae13dbb34ca0a47af51fed538217778d030bd489ce9bf388ce94be992a5e8' (pure transfer: existing address with custom gas limit & price)
Pushed transaction '0xfa1ea99db692279092912495620db84495a5d31a4cb2d6a7cd429910c4a2b286' (pure transfer: inexistant address creates account and has an EVM call)
Pushed transaction '0xa1b8b199588dba0751a3478da4b5ea9cced9484ae719d4b9643c75f14307ad13' (pure transfer: to precompile address)

Performing 'transfer' through contract transactions
Pushed transaction '0xa2e206c0932c81277f5102fb4e72fa53ea633a0587bc002658df2b0282f80558' (nested transfer through contract: existing addresss)
Pushed transaction '0xfbb83a5c9311b00a6f7c7b5d3d283eff957afe98f1d047f079c8f186ebd3ba60' (nested transfer through contract: inexistant address creates account and has an EVM call)
Pushed transaction '0x6db318f7651e08f78a869dc34fd12e3d33ad00836e42ea87bc77e88e7ca10321' (transfer through contract: existing addresss)
Pushed transaction '0xb6d3b43e404605052861bc7fa79029ff1a91c8d944562b24b074b2cc97c32098' (transfer through contract: inexistant address creates account and has an EVM call)

Performing failing 'transfer' through contract transactions
Pushed transaction '0xc818c9466ed90f6195550c2a0f5c3057e7287a500c55658e94844eda1887d9a0' (transfer through contract: existing addresss correctly failed with EVM reverted without reason)

Performing 'log' transactions
Pushed transaction '0xb02c92bf284f52d796faf8ff6c5f6492063f6e787d4e166f9c0a1e28d7cd21c4' (log: single)
Pushed transaction '0x77dc674302ed0ef5560646b68473203ed77d8b8f95c05cc143cc892c090d96e2' (log: multi)
Pushed transaction '0x2b28ccaa6d5cad093596a4fac277f7a7dd21bc2c2a9dc01e981e452a16222532' (log: all indexed)
Pushed transaction '0x7f5a91a9036683dc4e3f75f914f2c78bac0509e7add3a428db560863102ae028' (log: no topics (log0))
Pushed transaction '0xf9550074e464bb195d311a8e3376d940e98de5f393d617e0a252919dd69c61c3' (log: empty)
Pushed transaction '0x422f092772528605f0b7482b2989d9b4d6613a4e7a683b7f0f57dcdad1a2144e' (log: all mixed)
Pushed transaction '0xc46dc7f42dfe694ff1154dc7036263bb6fb24188bb7e964b4dbf17e9b0b56a61' (log: all)
Pushed transaction '0x58a38bebf9606cdb16ba496c9ab4dc8238aa9a012457680ee5626f7f0d45932e' (log: log in sub-call that fails but top-level trx succeed)
Pushed transaction '0xe01b51fea35b8135dd4cd87a443d189cacf7ff8d1730cebd2611088adbeadd62' (log: log in top-level trx and then top-leve trx fails correctly failed with EVM reverted without reason)
Pushed transaction '0x5fbd45ae337e1a85fd885feee132aa3422310f8810afc1da4e7df5fc2b2d2d81' (log: log in sub-call that succeed but top-level trx fails correctly failed with EVM reverted without reason)

Performing 'storage & input' transactions
Pushed transaction '0x483482b979a107fba67b5a68f5482b0f99e2a35ca8b6f4c349b30de112bb4144' (input: string equal 0)
Pushed transaction '0xab60e43d20af5d63abb940d365969c7d34f9aaeafff87799231a2c9b2fbba783' (input: string equal 15)
Pushed transaction '0x55bf1ed1f9006cd4a93d5e55eb79f7de632e540c16c1d032283efaeea34087a9' (input: string equal 30)
Pushed transaction '0x3ed1bef02dfb4c42c352d5ac400be537c73ea876395b9b5f45d855295412fc64' (input: string equal 31)
Pushed transaction '0x6850aef0fa0d1eb3a782f163979fc645a770091f585f40dc6eef265cd604afc5' (storage: set long string)
Pushed transaction '0x434877eb3e2dec14f78a8a73a23d0eb35bf5f7c08637937adbd5c5e17c6eec44' (input: string longer than 32)
Pushed transaction '0x18201ca1e1f40a4f2fc1ee1985604435c14547683be4a94b210b95e677cf355c' (input: string equal 32)
Pushed transaction '0x867c629b6d05320f6f08b49999786940bfa3719733fb2823e1bc8e8174569b44' (storage: array update)

Performing 'call' & 'constructor' transactions (new contract)
Pushed transaction '' (call: contract fail just enough gas for intrinsic gas correctly failed with Returned error: intrinsic gas too low)
Pushed transaction '0x25ab5595a138919341716931fcdf659cb194309c28b7fa1fc7dbef59bbc5e3ff' (call: complete call tree)
Pushed transaction '0xf07052611182622ce378fb7c4843a2a6e0aafa5f36f42ceb932602be25d528b0' (call: contract fail not enough gas after code_copy correctly failed with The contract code couldn't be stored, please check your gas limit.)

Performing 'call' & 'constructor' transactions
Pushed transaction '' (call: contract fail just enough gas for intrinsic gas correctly failed with Returned error: intrinsic gas too low)
Pushed transaction '0x73f841638497eed474355ad1197482fd37b6b8d8eeec77da491949e7a9622e4a' (call: contract creation from call, with constructor)
Pushed transaction '0x5a96d3da07d051f12af51730ab4e578b0028aa57cd5f51ebcdaffe16df277853' (call: call to a precompiled address with balance)
Pushed transaction '0x25ffe5cd3e5bfb031458671c555b79739e09775299137e72ad830a1de50814ea' (call: nested call revert state changes)
Pushed transaction '0xd211177cb263f351ae780add7cb1ff8bce4433be64291d486f0432f85da209c6' (call: contract creation from call, without a constructor)
Pushed transaction '0xa6fe8c10d9756df8117223f5162ed10872d617095810c7fccb876ba8d045c22c' (call: call to a precompiled address without balance)
Pushed transaction '0x6d07053483d596aa0e6881b8a11af39543c1c10ac27f5337f925ae4bc13045c6' (call: delegate with value)
Pushed transaction '0x9e6029d8974141146c0edd5e37cd709cf62bcb0d21314cc0111d95b1a24580c6' (call: nested fail with native transfer)
Pushed transaction '0x84c266e3810be4bb17c838d43e7625346bfad6deba1d975763ed27c0d79edbbd' (call: all pre-compiled)
Pushed transaction '0x5665edabb47bff3bc3901e88d8c8a74fbfa852837147c7e6f8d4ab6616b5d324' (call: complete call tree)
Pushed transaction '0x5b2eb43c2d84c7d1561531abb1b4811dd388d2e564f4bc6376a1e63fffbaeac2' (call: contract creation from call, with constructor that will fail correctly failed with EVM reverted without reason)
Pushed transaction '0xcf7cdc6b1655647a49df6cff1a7150dc83e99e7b4ac9c8e9722d6f8534426f59' (call: contract creation from call, recursive constructor, second will fail correctly failed with EVM reverted without reason)
Pushed transaction '0xe20f5eebba25c62e56396b13d314ec396a7410a5053ad6bcd7b9b362d72069dd' (call: contract with create2, inner call fail due to insufficent funds (transaction succeed though))
Pushed transaction '0x648ad10f48c98955409b01d7f81c65cfa874b8a6b573f40a2abbff83f4b83a83' (call: contract with create2, succesful creation)
Pushed transaction '0x6b7c46d6bc9e3c0f69e4ffb9d16f313bceded8c908edc316859362abd643db1e' (call: assert failure root call correctly failed with EVM reverted without reason)
Pushed transaction '0x2e66943a4747cd3e21d0755a74e3c89b4d2d13498fd11596f9d6a848c8bdb919' (call: assert failure on child call correctly failed with EVM reverted without reason)
Pushed transaction '0x8a3e8ec6e7e85801ad6a1d962e6e1fffc5d4ccaad903c565ef30bc9b7ff46527' (call: revert failure root call correctly failed with EVM reverted without reason)
Pushed transaction '0x3dd4fbab4ea7fff7ee638b4b3ee271f76b245706ce34459a166a661debf81115' (call: contract with create2, inner call fail due to insufficent funds then revert correctly failed with EVM reverted without reason)
Pushed transaction '0x4e4dd0924617e1fa525a99998b2683de0b25cd929c5e774a67f8c4681aaf221f' (call: contract fail not enough gas after code_copy correctly failed with The contract code couldn't be stored, please check your gas limit.)
Pushed transaction '0x3aa97a2710cb1ee441c72ec8649a4c6e12488e82f4bc4ab179fa3bdd0d4ac00e' (call: contract with create2, inner call fail due to address already exists (transaction succeed though))
Pushed transaction '0xae166f287cd175f78410bf1e4a7f6eaafd8c53a361a4337e2b6345fd9886ba34' (call: contract with create2, inner call fail due to address already exists then revert correctly failed with EVM reverted without reason)

Performing 'gas' transactions
Pushed transaction '0x3cc57d48ccf907a3f9dc7746a19f4b568497dbdac752c72c65a4a42f7b438d34' (gas: empty call for lowest gas)
Pushed transaction '0xa6515def5db539617d23712648481bf6f80795338aca901d16d7f056f37c6035' (gas: deep nested call for lowest gas)
Pushed transaction '0x382f074b5e03ed37502020ccfc451967612b6ed9b587d380961f65c3ad1e4309' (gas: deep nested low gas)
Pushed transaction '0x9f3d9c6372f989dbf4650b1a2e67c4554e0e49b1e3f5fb0411435b7bd3c5fe4a' (gas: nested low gas)
Pushed transaction '0xa09a096e84a7bcdea864e54041bf313e6803d263116a458e7ad9f0ffd78f9140' (gas: deep nested nested call for lowest gas)

Performing 'suicide' transactions
Pushed transaction '0x3d466cb0a87555bde66594c5c6eb23d2bbb8fbd14bfc0e484b2f4fb85f18d4a3' (suicide: contract does not hold any Ether)
Pushed transaction '0x0a0015d50cbd7daa62fad736c128a8be8ae9209a5f27759588ef498ea32faaf5' (suicide: ensure suicidal2 bump is nonce by creating a contract (#1))
Pushed transaction '0xc884f11c5216af2a49c49633eec79b14fdd339e7b97f9c5a08c203be17c93177' (suicide: create contract to fixed address (create2), kill it and try instantiate it again at same address)
Pushed transaction '0x87eef88d87d8d39736b405af8994817283799e9931a3bebdce72b73d3b560387' (suicide: create contract, kill it and try to call within same call)
Pushed transaction '0x9c108c15d8745a6e71e8555dc0ed20d3f7e2b477b9429532743cbce97931eabc' (suicide: transfer some Ether to contract suicide that's about to suicide itself)
Pushed transaction '0x45ec0d86a0c2efa6162001a6731282a77242a935f82290fba924daf88947d812' (suicide: ensure suicidal2 bump is nonce by creating a contract (#2))
Pushed transaction '0x25aa7c0598c2234e353e898f114a557e441554002e7acff011c310d3802ba4d4' (suicide: contract does hold some Ether, and refund owner on destruct)
Pushed transaction '0xac1014e6aa1b02a4f257f0f3f72f59dbfeb0e30876de6c87b98944c78c814731' (suicide: create contract to fixed address (create2), kill it and try instantiate it again at same address)
Pushed transaction '0x2495fbd0cb8363c2b0ffea9a3a1b6f4ea54a3018c3fc5cc3ce4cf02be16bc6bb' (suicide: create contract, kill it and try to call within same call (second time to valid nonce change after suicide))
Pushed transaction '0x060bc5e15bed23837e2f1beeb7ca10ce53e516991dc1597c51053218fb83b1d2' (call: call to a precompiled address without balance again at the very end, to see effect on OnNewAccount)
Pushed transaction '0xe5ad75f90176b6914a96cbab3de3640417c9e9a1ea5595375e6c51df1a806851' (call: call to a precompiled address with balance again at the very end, to see effect on OnNewAccount)

Completed battlefield deployment (local)
```
