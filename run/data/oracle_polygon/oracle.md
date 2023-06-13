## Transaction Log (Tue Jun 13 18:58:03 EDT 2023)

```
Bor
Version: 0.4.0-beta-5-fh2
Architecture: arm64
Go Version: go1.20.4
Operating System: darwin
GOPATH=
GOROOT=/opt/homebrew/Cellar/go/1.20.4/libexec
```

```
$ /Users/maoueh/work/sf/ethereum.battlefield/node_modules/.bin/ts-node src/main.ts
Initializing runner...
Configuration
 Network: local
 Default address: 0x821b55d8abe79bc98f05eb675fdc50dfe796b7ab
 RPC Endpoint: http://localhost:8545

Deploying contracts...
Deploying contract 'Suicidal'
Deploying contract 'Suicidal'
Deploying contract 'UniswapV2Factory'
Deploying contract 'GrandChild'
Deploying contract 'Main'
Deploying contract 'EIP20Factory'
Deploying contract 'Child'

Contracts
- main => 0xEC9C1fCee156bf34Ba4fB5D38C9CF09Df16723eF
- child => 0x314F9285cbC3835e676974abDb7d2ab45ede3686
- grandChild => 0x929bc44BBD41Ca0e621dc50f7c7E3204Ce026258
- suicidal1 => 0x702641c70a11E480F646Ed247d078c65aBAAC5DE
- suicidal2 => 0x71940c77ccadaeA1238CEa27674E6253128ca177
- uniswap => 0x9a77F7b94488d24EcA50FA0d144212AE48300A71
- erc20 => 0xCae819bff9B75c3D34971C19e005F2cAD7354E0f

Transaction Links
- main => http://localhost:8080/tx/0x0c50b2a1dbb13bf1b528f1af4e41c96074234dcfad46bb4e2afd4beea86fd286
- child => http://localhost:8080/tx/0x0de0475dfb82a7a7759ecb625f8adaceeedf90ad6843c0a05080c878e4a5caf4
- grandChild => http://localhost:8080/tx/0x7266627bcf60392e5e7c0c2a90d744ebb9749a3b80bb897bdd9e9ad513cb3f69
- suicidal1 => http://localhost:8080/tx/0x7ef9db7b88f20a2a6f0abbbb56edced49e87124ea9bf14592335364fa4f6655d
- suicidal2 => http://localhost:8080/tx/0xb865c6013c6a5612851ead73ee67aff34a0e912b9e09d6a0ab44e76020e4e686
- uniswap => http://localhost:8080/tx/0x0c7ea66c4bce580d2e4fa6283b57a3fe665c3cdd064144acc211c48e69fa7555
- erc20 => http://localhost:8080/tx/0x5f2c1ddb03b7b26c714d8c76bb2a8079aa72ce60236f1cf95890f28a6aeb084d

Performing pure 'transfer' transactions
Pushed transaction 'http://localhost:8080/tx/0x5a215c52d4626649d12dd5ba78d6c04ab43e80d6a25e61f50d091562c2b06ad3' (pure transfer: existing address)
Pushed transaction 'http://localhost:8080/tx/0x99bfeb9b1b4aa4bbc8e05d346c949a359f07f76dcdc0f2bc3c9782c250e05512' (pure transfer: transfer of 0 ETH to inexistant address generates a transaction with no EVM call)
Pushed transaction 'http://localhost:8080/tx/0x6c0bfe4ed5e22f73fbb651272734455ec5f6bdb27abbec255592d18012736e3f' (pure transfer: inexistant address creates account and has an EVM call)
Pushed transaction 'http://localhost:8080/tx/0xee11e7aa2c4b4c5b557f7f1bbd851edfb5b7198bff36d1c5e64b308664d457f0' (pure transfer: existing address with custom gas limit & price)

Performing 'transfer' through contract transactions
Pushed transaction 'http://localhost:8080/tx/0xca9650944fb0c0f808889387239975feecb0afc0cc3def0a03f2352380677f32' (transfer through contract: inexistant address creates account and has an EVM call)
Pushed transaction 'http://localhost:8080/tx/0xe1c63e56b93cc195228639e74173a28eae7c3b9a8acfa429d92df779af2b0bc6' (nested transfer through contract: inexistant address creates account and has an EVM call)
Pushed transaction 'http://localhost:8080/tx/0x6582b4059c34353515dc7dd44b71ec3cda0a1f4cb2bebc0b7506a6c2ba0f1ab1' (nested transfer through contract: existing addresss)
Pushed transaction 'http://localhost:8080/tx/0x15271904e75cf928bc8437803641ca9ee66084f1b69a68b3af3c7c9da804ee14' (transfer through contract: existing addresss)

Performing failing 'transfer' through contract transactions
Pushed transaction 'http://localhost:8080/tx/0x2fff5fba1b46c7bc219796eb88be658d94699942317ba8eb1972ab2d7390419d' (transfer through contract: existing addresss correctly failed with EVM reverted without reason)

Performing 'log' transactions
Pushed transaction 'http://localhost:8080/tx/0x57ab8fd12da96c0ed3e9dec8d1b9728dc5775d2801702c593e97d24738d893e7' (log: all)
Pushed transaction 'http://localhost:8080/tx/0x07f9a8928fd2b07db567fb79e7ef53a773c5aef3fac8b349009822ff49a8ec16' (log: all mixed)
Pushed transaction 'http://localhost:8080/tx/0x223b4d98a6e4541b992ee63a558a33f8fc56d656731f2ee796a0b7fade659d02' (log: multi)
Pushed transaction 'http://localhost:8080/tx/0xe848aed2621b5be99c36bbcc94c8b34a3e5179985664f84aee0836d8609f3352' (log: single)
Pushed transaction 'http://localhost:8080/tx/0xcff59dbdd9deb149df9c0fb1254a8e3773c0f902faa6e0263742f6284fe6110a' (log: all indexed)
Pushed transaction 'http://localhost:8080/tx/0xdb5cbc82cb904e61635011710486d83400b8ef78858b3455c36564dfb06e5f66' (log: empty)
Pushed transaction 'http://localhost:8080/tx/0xa79bc5aec61cbdf5b3f3e6eda7d2ecd903249e60a76c00ec022baeb41efce24e' (log: log in sub-call that fails but top-level trx succeed)
Pushed transaction 'http://localhost:8080/tx/0x60d3c0671ec9d3f2895d7cc9c971bb7e32be0fe7c67adebd9204bfb90f66c3d9' (log: log in top-level trx and then top-leve trx fails correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0x3233a10b722dc50fe1a3bbcee2a710d5135543ee09fd885d853f17312f5ba358' (log: log in sub-call that succeed but top-level trx fails correctly failed with EVM reverted without reason)

Performing 'storage & input' transactions
Pushed transaction 'http://localhost:8080/tx/0x92a5721caa0f53d134dcbfb83622e113779ca008f741e13bb6234b5f91b6529c' (input: string equal 30)
Pushed transaction 'http://localhost:8080/tx/0x3245ed03ef710143bdfc44b212e189a47387bf475d893b4b8f43eb0d6e68ff68' (input: string equal 0)
Pushed transaction 'http://localhost:8080/tx/0x447fa019a79863c08e2fa1bc13a9c09cdb27e4e09bb5735df4dce88a06c7fe46' (storage: set long string)
Pushed transaction 'http://localhost:8080/tx/0xfa0f300c6307357e8cfbc4c4eda3c9aa6e6a5c6c96c2e79427d9fb5188563696' (input: string equal 32)
Pushed transaction 'http://localhost:8080/tx/0x17f38d53d362596bdb8d4a54de065cca69d06e4fed5899103b32ee0259c799a2' (input: string equal 31)
Pushed transaction 'http://localhost:8080/tx/0xd541d11ddc9de344dcd6e9103780b3a619ef2d8e0617ad6f5bb7f1fd24a70208' (input: string equal 15)
Pushed transaction 'http://localhost:8080/tx/0xfe84826dd4196730a3925bb913fa1e9698bf8c6527feeae0fac4a92af8adf7f7' (input: string longer than 32)
Pushed transaction 'http://localhost:8080/tx/0x1fca69608f7c9a3355340edd1e0f419877856ec5278ccf46931783b2d3d57266' (storage: array update)

Performing 'call' & 'constructor' transactions
Pushed transaction '' (call: contract fail just enough gas for intrinsic gas correctly failed with Returned error: intrinsic gas too low)
Pushed transaction 'http://localhost:8080/tx/0xb127773a9fc3fe3febed91756db372a6010e57fa2bdcc2badaca45ede4dd6dcd' (call: nested fail with native transfer)
Pushed transaction 'http://localhost:8080/tx/0x173c6b961d0edd2db79c55880169b3d0970b25eb881955e44379de6c9ce11109' (call: contract creation from call, without a constructor)
Pushed transaction 'http://localhost:8080/tx/0x1dc6e8565c11db1541eaafe507eed5b85820a82aca2ca14169856eeedda7e162' (call: nested call revert state changes)
Pushed transaction 'http://localhost:8080/tx/0x1017b39a18a989a049529a6cfd0931161f85508b37c1aeb7a073feed50f2e158' (call: complete call tree)
Pushed transaction 'http://localhost:8080/tx/0xe3954c893311921697620fe1222267acf5f96d59b820a7ac99ad32b08f697f3b' (call: contract creation from call, with constructor)
Pushed transaction 'http://localhost:8080/tx/0xa9a51e42f1e6cf6c467db5d9ef31c2909212f99c36f125543301c9d07bf79b89' (call: contract creation from call, recursive constructor, second will fail correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0x58b60d380db22720149abaa44335cf05669b22596bfe4c7fac2740a00ab0e4a6' (call: assert failure root call correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0x9dde2bd7fa6e593cc7d3d7fa825b6162c79314e98c4412274cb02ff58affe5dc' (call: revert failure root call correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0x1e587b96edbd07164daf2239dd36827ee8a1e334447828ab43efc8a8df41dd6c' (call: contract creation from call, with constructor that will fail correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0xd810b7abf936dd3e3e9b0e1f65a076f3e7eece32e18cd64d54c7b3ea60ac6e8e' (call: contract with create2, inner call fail due to insufficent funds (transaction succeed though))
Pushed transaction 'http://localhost:8080/tx/0x3bd1770c1fbf0db7cc618c06a22eb93d4794f90f445a2b9447648ee1a6ad59d2' (call: assert failure on child call correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0x8b9760b1c51b0f7740456e31d650f5ef441d03e0735de8dc16588b194fa53e86' (call: contract with create2, inner call fail due to insufficent funds then revert correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0x26efac8c119094cc6391f52ae0fcb71fa470cd4e7a6381563813d62846e6bc4b' (call: all pre-compiled)
Pushed transaction 'http://localhost:8080/tx/0x28df1c7143da5f22356c75c5af7086ba530d94ad03b4b7794434bccfca2897ea' (call: contract fail not enough gas after code_copy correctly failed with The contract code couldn't be stored, please check your gas limit.)
Pushed transaction 'http://localhost:8080/tx/0x3114ab1cc6fc1587ae5783cccd6ac340d13541001c064c50581a7c3589e1c8a2' (call: contract with create2, succesful creation)
Pushed transaction 'http://localhost:8080/tx/0x52be32ad28a1b6fbfab76e0f1a91d2bb2be1cc96841a6e194a908eb686c8484b' (call: contract with create2, inner call fail due to address already exists (transaction succeed though))
Pushed transaction 'http://localhost:8080/tx/0x2e1d7702034b82869600e3875348eff62bee4a6c223a132073abce03b82229c1' (call: contract with create2, inner call fail due to address already exists then revert correctly failed with EVM reverted without reason)

Performing 'gas' transactions
Pushed transaction 'http://localhost:8080/tx/0x1351f73eeee3abc3c9b04127cb5eb31af1aab1d5663b887d66bab932155aea13' (gas: deep nested low gas)
Pushed transaction 'http://localhost:8080/tx/0x0ed68e717f53a34df498696e6eb468334cff086a04cfb7ff4db254bf2f755d2e' (gas: deep nested call for lowest gas)
Pushed transaction 'http://localhost:8080/tx/0x3179673167afce48148ea868baa986eae0f9f269f69b05260a4730c57b6e93e7' (gas: deep nested nested call for lowest gas)
Pushed transaction 'http://localhost:8080/tx/0xd53b5a6ccd318e5f3f8facd4f0e768b1e19856a9c9402aa31cb8ca8535a093bd' (gas: empty call for lowest gas)
Pushed transaction 'http://localhost:8080/tx/0xba65bf62432d8b337ad39322cd6cda6d7fb11218f5bbc285a436e53e3743157f' (gas: nested low gas)

Performing 'suicide' transactions
Pushed transaction 'http://localhost:8080/tx/0x2ccce0554d9192591e765196ee22bb92c1394f5d6c40e948bf4e8030b7ac8216' (suicide: transfer some Ether to contract suicide that's about to suicide itself)
Pushed transaction 'http://localhost:8080/tx/0xec6206cbb7532702a8bcc8c428eef3196aad3d708a5b21472e73a376c7dcdc61' (suicide: ensure suicidal2 bump is nonce by creating a contract (#2))
Pushed transaction 'http://localhost:8080/tx/0xef1bf5399a5e415a434aee4ec5e744e0fa6f0ead06d4362a5223505ada11b96f' (suicide: ensure suicidal2 bump is nonce by creating a contract (#1))
Pushed transaction 'http://localhost:8080/tx/0x3e3897a3eaa3931de76c9286d9bd8f13c6f8ec7991668745fdb040f34b625e0f' (suicide: create contract, kill it and try to call within same call)
Pushed transaction 'http://localhost:8080/tx/0x361c8fd6b4240944b9e79634dbeba6ee7c2d6341818c6ee11b216a228ff2aba2' (suicide: contract does not hold any Ether)
Pushed transaction 'http://localhost:8080/tx/0x1112293ab7febf7d4ebb7f3470c53a6b3484b0b15cce1a0fec49544ba05fae08' (suicide: create contract to fixed address (create2), kill it and try instantiate it again at same address)
Pushed transaction 'http://localhost:8080/tx/0xbaf1976e326a0a6b1ab67297e4ce45b2f0d108fa421d91e4dafc39a459c7cc6b' (suicide: create contract to fixed address (create2), kill it and try instantiate it again at same address)
Pushed transaction 'http://localhost:8080/tx/0xc503f5e39ddd1e42a8822b50b9a9d1dd1478ae8588cf4e788c2a571b1765b74b' (suicide: contract does hold some Ether, and refund owner on destruct)
Pushed transaction 'http://localhost:8080/tx/0xbd8046dda963b00459723a689ecec084148049e5b4c7578882b9869c82507fd1' (suicide: create contract, kill it and try to call within same call (second time to valid nonce change after suicide))

Completed battlefield deployment (local)
```
