## Transaction Log (Mon Jan 15 13:24:07 EST 2024)

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
Deploying contract 'GrandChild'
Deploying contract 'Child'
Deploying contract 'Transfers'
Deploying contract 'UniswapV2Factory'
Deploying contract 'Logs'
Deploying contract 'Main'
Deploying contract 'Suicidal'
Deploying contract 'EIP20Factory'
Deploying contract 'Calls'
Deploying contract 'Suicidal'

Contracts
- main => 0xCae819bff9B75c3D34971C19e005F2cAD7354E0f
- calls => 0x410fd7B9368812207DCf674afCB5E359e1365011
- logs => 0xEC9C1fCee156bf34Ba4fB5D38C9CF09Df16723eF
- transfers => 0x9a77F7b94488d24EcA50FA0d144212AE48300A71
- child => 0x702641c70a11E480F646Ed247d078c65aBAAC5DE
- grandChild => 0x71940c77ccadaeA1238CEa27674E6253128ca177
- suicidal1 => 0x314F9285cbC3835e676974abDb7d2ab45ede3686
- suicidal2 => 0xf0d54E7d8399dF98817E4bD6DDe189ABC8824E3D
- uniswap => 0x929bc44BBD41Ca0e621dc50f7c7E3204Ce026258
- erc20 => 0x34C044506dB54D3e8966300b7CBEFBb569b02C60

Transaction Links
- main => http://localhost:8080/tx/0x6860bd28eadf921e1b684a16ca1ff2498f2a2f48245659905c7dd2352916d2f8
- calls => http://localhost:8080/tx/0xe23fd277af6494d84630311e3e7ee299b220ad0afcdc77a695eb6f892b0a60e6
- logs => http://localhost:8080/tx/0x52624a643b009bc0ea3426840901b1002078db1714d145f6a69f33e1b2860741
- transfers => http://localhost:8080/tx/0xebcb98976ca603c02aa850835bdb7db8ca499c838eb8a4984c4c792ad6c8e8f2
- child => http://localhost:8080/tx/0x77b88c4c82162726d17c07736e73afc59084a9460e64ffad978f2e869100c3d9
- grandChild => http://localhost:8080/tx/0x44d41a518c0ae877c0b0a4a5be9ce7629f250f8355ee05c69b2353ec214cf997
- suicidal1 => http://localhost:8080/tx/0x0591bbf2393be3e84af143b8d1ac4dac5dedb4aed215b7fea34bc21a61db86a6
- suicidal2 => http://localhost:8080/tx/0x51bae219b0a942836abbea674f4aee7b67c14bf52b33ae9811f838b85b012616
- uniswap => http://localhost:8080/tx/0xe43f8b2bdc21a2bce06d2f9a87d889413cb6e9c67a374dde08d4200efef0484c
- erc20 => http://localhost:8080/tx/0x0a37a908bb7480e7401c048a0cbf06fe0ec7f220078d36ee43f5064698024a7f

Performing pure 'transfer' transactions
Pushed transaction 'http://localhost:8080/tx/0x254f13e1ea8c651f527d1e57b0e82c433efc3e7a7a962a40d1db6c40a07a054f' (pure transfer: existing address)
Pushed transaction 'http://localhost:8080/tx/0x829ca36ddd495a92e423760db9615d61ae629758283d9f5a5327ff30cf9f18e7' (pure transfer: inexistant address creates account and has an EVM call)
Pushed transaction 'http://localhost:8080/tx/0xd49ae13dbb34ca0a47af51fed538217778d030bd489ce9bf388ce94be992a5e8' (pure transfer: existing address with custom gas limit & price)
Pushed transaction 'http://localhost:8080/tx/0xea789bf13434b62af704389672671f4d0f2a57afb23ef8ecff424ecf7e8cc5d1' (pure transfer: transfer of 0 ETH to inexistant address generates a transaction with no EVM call)

Performing 'transfer' through contract transactions
Pushed transaction 'http://localhost:8080/tx/0x6eaf487fd225f782d1e97568305a3da127d02c725b6716c5a9ee61d55ce06540' (nested transfer through contract: inexistant address creates account and has an EVM call)
Pushed transaction 'http://localhost:8080/tx/0x62ab89e198f04d8b9a48694221c25697ecceece0b1cdea204650b1b7faa94dac' (transfer through contract: inexistant address creates account and has an EVM call)
Pushed transaction 'http://localhost:8080/tx/0x0c06658f266fc56f7186e9a9544ea39c4651af5514799a3b8f33c6f0b76a544e' (transfer through contract: existing addresss)
Pushed transaction 'http://localhost:8080/tx/0xc932f9ce72b3082daff08559e7116abce2fc230b93a0e1e09b9b3f760c1ba2c0' (nested transfer through contract: existing addresss)

Performing failing 'transfer' through contract transactions
Pushed transaction 'http://localhost:8080/tx/0x63d2bff37faa143841187d0d8abba75b9c8bd7757244f08e9dd77a81b6e953d0' (transfer through contract: existing addresss correctly failed with EVM reverted without reason)

Performing 'log' transactions
Pushed transaction 'http://localhost:8080/tx/0xf1ec4f2cdcdf5de3dd81df98002a6e7bfe3d65dbf7a36fdd22b777e3dea43f1d' (log: multi)
Pushed transaction 'http://localhost:8080/tx/0x765b0f928c30319ba4b960ebe8751e4e336308f02c2055ff3a9f8181cc6f3fa3' (log: empty)
Pushed transaction 'http://localhost:8080/tx/0xeaaf3109f19143630719daa39e3559d53f3631dcfeac02de3618b6046dc0760b' (log: all indexed)
Pushed transaction 'http://localhost:8080/tx/0xccfab947ca92d72ecc9f7592521fd9934d962b10665a50812916e6825b5fe466' (log: all)
Pushed transaction 'http://localhost:8080/tx/0x0e2c849886a5dd9ded059564534fb7e2318db6c8adab4d293463d12afa207d9c' (log: single)
Pushed transaction 'http://localhost:8080/tx/0x5214d03262c039edc669717a595c3035e5a20e242f6986a078d73cb3d7ba965a' (log: log in top-level trx and then top-leve trx fails correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0xa9e2484f25409e4523d180ac9308d798b94ffab684fe676ee7d048ade075f035' (log: log in sub-call that fails but top-level trx succeed)
Pushed transaction 'http://localhost:8080/tx/0x8a681462c4b6631d8477191ca92eb3f56584f2885d838104e870e45e67f58e28' (log: all mixed)
Pushed transaction 'http://localhost:8080/tx/0x9515a634c2a9292c23bd39db907d9d39b285e3c792ff5f8f45cc15afa7655830' (log: log in sub-call that succeed but top-level trx fails correctly failed with EVM reverted without reason)

Performing 'storage & input' transactions
Pushed transaction 'http://localhost:8080/tx/0x31fffa91a13aa05fae4d299fe38d73d66765d63b9f683f5e4696dbfa45e2d226' (input: string equal 30)
Pushed transaction 'http://localhost:8080/tx/0x679032854c42248892d9914db5335aea4a4f4a12c83e2fa95aab01a40f123521' (input: string equal 31)
Pushed transaction 'http://localhost:8080/tx/0xb7f333f74ea6dbf535673946a04f65cc43ba8ebf347013295b9dde95e12a0271' (input: string equal 0)
Pushed transaction 'http://localhost:8080/tx/0xd7ba79a83d142e7811ed26b488329d7be7aae3b76e284153d3816855d84ca7d2' (input: string equal 32)
Pushed transaction 'http://localhost:8080/tx/0xdba916573e26d0de07a136552f224e2550bc33cba6ad7f844703ac29a637cbd4' (storage: set long string)
Pushed transaction 'http://localhost:8080/tx/0x213af4aba11f58a14781f5a4b61da2076baa10a9829a55cd668e3142c968e67b' (input: string equal 15)
Pushed transaction 'http://localhost:8080/tx/0x68e14482d00d3197eb057a769248e87284002cf5633a8015283e2950dae4c153' (input: string longer than 32)
Pushed transaction 'http://localhost:8080/tx/0x953f5351c4aa55585bf25133e34c260c7a183a9c032960904c3f78561128e1dc' (storage: array update)

Performing 'call' & 'constructor' transactions (new contract)
Pushed transaction '' (call: contract fail just enough gas for intrinsic gas correctly failed with Returned error: intrinsic gas too low)
Pushed transaction 'http://localhost:8080/tx/0x6be74cc9ba135e771218d01e7ba42eea2d3c30a0bf00d6d5f09985a95f84d8d2' (call: complete call tree)
Pushed transaction 'http://localhost:8080/tx/0x3a71d4ebfdeb207c526634bbc3c7851c9aa55fa4d42c035976794cbe9c1684b1' (call: contract fail not enough gas after code_copy correctly failed with The contract code couldn't be stored, please check your gas limit.)

Performing 'call' & 'constructor' transactions
Pushed transaction '' (call: contract fail just enough gas for intrinsic gas correctly failed with Returned error: intrinsic gas too low)
Pushed transaction 'http://localhost:8080/tx/0x7855fd09ba32907ab7781673c48649b8a7a20338a758ce05668356c349d3f6b3' (call: contract creation from call, without a constructor)
Pushed transaction 'http://localhost:8080/tx/0x9ad459b2bad2a53626ea8f744f1c4716ec94135b5d7bb54012ba9ac680166335' (call: assert failure root call correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0x7ce86323db19f527267b4bdea224734c23bd6e327baeac9d1649cdc6eb7ad71c' (call: contract creation from call, with constructor that will fail correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0x3bd970e475e66428078be240053ed025b662a03d755d1bbac2f1ed4c2e535d0f' (call: nested call revert state changes)
Pushed transaction 'http://localhost:8080/tx/0xb23b7ce7f1b50170bcfbea2cd432ce09c81354bee82e4ec531173cb1825837bd' (call: contract creation from call, with constructor)
Pushed transaction 'http://localhost:8080/tx/0xfad99a0c167f423ef7af20b0aef7e198a5aba087ff3c8657d95d571495a2d432' (call: all pre-compiled)
Pushed transaction 'http://localhost:8080/tx/0xcb350b406b56d423c7621eab44c6b387971562d4728d50d793a23de5d74c8a7b' (call: contract with create2, inner call fail due to insufficent funds then revert correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0x123f223c5db56f91941b84e1fa5581fe338af8eb4351f06698f62ae84e371870' (call: revert failure root call correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0x330b6ebfeb70423391e32793362b829adf65025cb381dfd506b16c7ab1a646ec' (call: contract creation from call, recursive constructor, second will fail correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0x7e32e11ef8221f2b2d0be18df13beb76b2aeef7f7bb1d3351f26a7652b5e640a' (call: contract with create2, inner call fail due to insufficent funds (transaction succeed though))
Pushed transaction 'http://localhost:8080/tx/0x44f6d38f4edfea7249f0b2ce490d946a0f46f9774739cc3533852c3e88c2fa13' (call: delegate with value)
Pushed transaction 'http://localhost:8080/tx/0xc28b1ffec21052e9879b2d7e4f354149128fc3991a1b203a70435fd2368fe31d' (call: contract with create2, succesful creation)
Pushed transaction 'http://localhost:8080/tx/0x734d3d25b7eb58946bf0788ce9ed13507ee605597fbe4855967fe08a1db56053' (call: nested fail with native transfer)
Pushed transaction 'http://localhost:8080/tx/0x463d27e46b77419174ef4060638a4a02c1bcc6ed7f0e85113dee6b3d35b07f04' (call: assert failure on child call correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0xdaebd6df145e9d5d940fb43f1bd392a62fe8dcbefaaa363428ec099f8729eccd' (call: complete call tree)
Pushed transaction 'http://localhost:8080/tx/0xb6bd2991a1dfbf1d7360a6fe05553a2ca5f3f1340320748d0c1b54fc746b49ed' (call: contract fail not enough gas after code_copy correctly failed with The contract code couldn't be stored, please check your gas limit.)
Pushed transaction 'http://localhost:8080/tx/0x489ca9316d6e5600734ba61a5f0826d20514ef3a68053332e56a9a36bf91208f' (call: contract with create2, inner call fail due to address already exists (transaction succeed though))
Pushed transaction 'http://localhost:8080/tx/0x0702c701166c24ed16fe66f8e87ea6269f0c6d7872a1bbcbb2fc7ddc2f8e4225' (call: contract with create2, inner call fail due to address already exists then revert correctly failed with EVM reverted without reason)

Performing 'gas' transactions
Pushed transaction 'http://localhost:8080/tx/0x85ed5a7c3d6736169522d6b0a5e6a9507b2e0eddb90dde724c110d57663f5352' (gas: deep nested low gas)
Pushed transaction 'http://localhost:8080/tx/0x5d6c30ea4fee4457d884fc82162c9c06563c76b24a755b8a9d0cc86a7ea19b7e' (gas: empty call for lowest gas)
Pushed transaction 'http://localhost:8080/tx/0x1ccaf49302659010a72cc1b7bc7c26243991e621d2a0bad0712b49873fd7e0d9' (gas: deep nested nested call for lowest gas)
Pushed transaction 'http://localhost:8080/tx/0x8425d1fab32e286e868529df4794d0ac8f7eaf3e61a36a7041a51b4b29791a3c' (gas: nested low gas)
Pushed transaction 'http://localhost:8080/tx/0x4b02d8de23b77506d8c81be0ce98c64dd4057f9b24cb21413c85a6610e613c1c' (gas: deep nested call for lowest gas)

Performing 'suicide' transactions
Pushed transaction 'http://localhost:8080/tx/0x3f5979d9f71c18c346f11f0aa2ce07190dd7d587a79eb16dcb3a9250b8d3d083' (suicide: create contract, kill it and try to call within same call)
Pushed transaction 'http://localhost:8080/tx/0x8041d60b8682092e7166a65e62b85010f1d50fe1244a42a2a1388656c3958ffc' (suicide: ensure suicidal2 bump is nonce by creating a contract (#2))
Pushed transaction 'http://localhost:8080/tx/0x5fc539c9735c7166657f6c54eb76b9f200797f328f982f48d106a35e47ed83bb' (suicide: ensure suicidal2 bump is nonce by creating a contract (#1))
Pushed transaction 'http://localhost:8080/tx/0x180ff228d167366499fa8374db600f0f89666204b58c831d5a38ce2c400e203d' (suicide: contract does not hold any Ether)
Pushed transaction 'http://localhost:8080/tx/0x3f9036ae891fd5243a8a8d6577227714b5b8d17336c0cab36004f596040df34a' (suicide: create contract to fixed address (create2), kill it and try instantiate it again at same address)
Pushed transaction 'http://localhost:8080/tx/0x69df1641170d468e5bd5f9f425dc704b52c8279b7b0494eac9ca18da4888edbb' (suicide: transfer some Ether to contract suicide that's about to suicide itself)
Pushed transaction 'http://localhost:8080/tx/0xf91398105c183fc603d981853d58cc679c6dc05ea3e17f7610730f71042c5b07' (suicide: contract does hold some Ether, and refund owner on destruct)
Pushed transaction 'http://localhost:8080/tx/0xf1af3b4b8f22221c6015f0689c1adaece249f183f5d59f4c4fb977f860a86df8' (suicide: create contract to fixed address (create2), kill it and try instantiate it again at same address)
Pushed transaction 'http://localhost:8080/tx/0x6bc7c2d4116c285467d7e123489dae852f3459517925f7e59d8fda4c42ac4c99' (suicide: create contract, kill it and try to call within same call (second time to valid nonce change after suicide))

Completed battlefield deployment (local)
```
