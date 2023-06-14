## Transaction Log (Wed Jun 14 15:21:35 EDT 2023)

```
Bor
Version: 0.3.7-stable-fh2
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
Deploying contract 'Child'
Deploying contract 'UniswapV2Factory'
Deploying contract 'Suicidal'
Deploying contract 'GrandChild'
Deploying contract 'EIP20Factory'
Deploying contract 'Main'
Deploying contract 'Suicidal'

Contracts
- main => 0xCae819bff9B75c3D34971C19e005F2cAD7354E0f
- child => 0x71940c77ccadaeA1238CEa27674E6253128ca177
- grandChild => 0x929bc44BBD41Ca0e621dc50f7c7E3204Ce026258
- suicidal1 => 0x314F9285cbC3835e676974abDb7d2ab45ede3686
- suicidal2 => 0x9a77F7b94488d24EcA50FA0d144212AE48300A71
- uniswap => 0x702641c70a11E480F646Ed247d078c65aBAAC5DE
- erc20 => 0xEC9C1fCee156bf34Ba4fB5D38C9CF09Df16723eF

Transaction Links
- main => http://localhost:8080/tx/0xf3493bac9f086349c612c56e7aa3203cb1a807407f845e2a88ff4a58f57f0574
- child => http://localhost:8080/tx/0x34750b76da39878632058cdca4fc0b6818a809525dac4b82414586de0ec7e6bd
- grandChild => http://localhost:8080/tx/0x7266627bcf60392e5e7c0c2a90d744ebb9749a3b80bb897bdd9e9ad513cb3f69
- suicidal1 => http://localhost:8080/tx/0x0591bbf2393be3e84af143b8d1ac4dac5dedb4aed215b7fea34bc21a61db86a6
- suicidal2 => http://localhost:8080/tx/0x7d152174204af92c9e5e7884d1168ff08dfb44b0942988d4b8cba561ad6ff8f9
- uniswap => http://localhost:8080/tx/0xcf122e9d894175dd124c6e530a5fde059ec4f5eaff1ce94b5ce2c5cc62d3701b
- erc20 => http://localhost:8080/tx/0xa79c4dbe85ab9c5dabc40d885e8a919ba99fcbd45aaf31fabb2898536b7869fc

Performing pure 'transfer' transactions
Pushed transaction 'http://localhost:8080/tx/0xd9a4048440a345d4b6be24cea720582a864ab8509233156b25b93c7239f3a244' (pure transfer: inexistant address creates account and has an EVM call)
Pushed transaction 'http://localhost:8080/tx/0x59bba1b390bd42b23f5a33274f9fa1e61d8bb9cbabe53f9dc093c3f51a239361' (pure transfer: existing address)
Pushed transaction 'http://localhost:8080/tx/0x3c974d14dbbbfd6ce4a89d02644353c699fd710ae478ba611f96e945929be018' (pure transfer: existing address with custom gas limit & price)
Pushed transaction 'http://localhost:8080/tx/0xa14ba6f18f23efb854e4cb48dba2836bdf048bc010a9298c78274a710ac541aa' (pure transfer: transfer of 0 ETH to inexistant address generates a transaction with no EVM call)

Performing 'transfer' through contract transactions
Pushed transaction 'http://localhost:8080/tx/0x2d9245a99cf7b2678894acc0e52966d69ba083052d440a1acbb4e06676859559' (transfer through contract: inexistant address creates account and has an EVM call)
Pushed transaction 'http://localhost:8080/tx/0x9afb329f3fcaed911ef682cea020812b1c9c46c4c5d3eb6667294f5c64a58d2c' (nested transfer through contract: existing addresss)
Pushed transaction 'http://localhost:8080/tx/0x656a5158873ae03b2bd132bdc322d032abdcc8520e17f7485276f4d9c90b47dd' (transfer through contract: existing addresss)
Pushed transaction 'http://localhost:8080/tx/0x9f165c7b34e9e8b704b98b8564a39284b882414e637d3d08fd87f05c07ac7fbb' (nested transfer through contract: inexistant address creates account and has an EVM call)

Performing failing 'transfer' through contract transactions
Pushed transaction 'http://localhost:8080/tx/0x286e35168fa508e6541918467b48b6d1ef92676d406067c51556348609b6eb93' (transfer through contract: existing addresss correctly failed with EVM reverted without reason)

Performing 'log' transactions
Pushed transaction 'http://localhost:8080/tx/0xbccdbfebf448ab3f44a2e1883e85255f4248c4f13ed9d59e9531f00dbb010740' (log: all)
Pushed transaction 'http://localhost:8080/tx/0x9a14092f7bce81fc5d9f16c1119f53b98f04bd8a5c30938add9352b033cc12b0' (log: all mixed)
Pushed transaction 'http://localhost:8080/tx/0x44310f4a57410fba8127793f18a7ec3c07f1bb615522f232bfe7fb44524fe806' (log: empty)
Pushed transaction 'http://localhost:8080/tx/0x460c8472f4faf742a10215d7e5058f7c4b0aaa0374bff2d13ba487a77f500620' (log: multi)
Pushed transaction 'http://localhost:8080/tx/0xe35f5647941ebcb2e27123554394a59aee5867756a457e65f4e383f82a2cb60c' (log: log in top-level trx and then top-leve trx fails correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0xcbaadb897aa9895a77f819356be1a45364c59aa2c71d82d6d624a16b5eb7b22d' (log: log in sub-call that fails but top-level trx succeed)
Pushed transaction 'http://localhost:8080/tx/0xc73071b0d6ae7e2bc73baf7803b9c5cf73474d7ffadcf29b5c4bf1cdd70f6000' (log: all indexed)
Pushed transaction 'http://localhost:8080/tx/0x93293f6ee029f24dcda6e6e41ab433797bbddb66af3e622396c4362e5609bee4' (log: single)
Pushed transaction 'http://localhost:8080/tx/0x3c8702edc4f6375219e8b8d769e9874e34646b7d95a5b477484028d1c4ddaea4' (log: log in sub-call that succeed but top-level trx fails correctly failed with EVM reverted without reason)

Performing 'storage & input' transactions
Pushed transaction 'http://localhost:8080/tx/0x067088a1117f3a9ad4779c056fdeeb49358fe1d155445117538378197e304d8a' (input: string equal 0)
Pushed transaction 'http://localhost:8080/tx/0x3f4af5f250a5c3a443c6122b1abef4c4462618ebfeda661faa0f82d13bd95c39' (input: string equal 31)
Pushed transaction 'http://localhost:8080/tx/0x6a902cf121d8ca1ed3dc3118439906fce78384c7a23ed3a53be54bba7d30fb81' (storage: set long string)
Pushed transaction 'http://localhost:8080/tx/0xc8353067300deaa8d6a99b896e3cc757e0c28e6badbf57914296a9adad4dffac' (input: string equal 32)
Pushed transaction 'http://localhost:8080/tx/0xc3c02f524cc508f5c0f4dad29c7b3dd65038c156cce20ee946dc41f07e98ee0a' (input: string longer than 32)
Pushed transaction 'http://localhost:8080/tx/0x86b687310da2bdbfb307e8573cf7fd4f934d1446905c9694f6e3b7e294ff1ce9' (input: string equal 15)
Pushed transaction 'http://localhost:8080/tx/0x828cd6b53f8f1b46155964c1ebbf35eefe2b6b169247ab1a5cd4ff594737db9f' (input: string equal 30)
Pushed transaction 'http://localhost:8080/tx/0x08dbdb61c81dffcaac21343c9bf9fd152012317b4441b84a477a53539168353f' (storage: array update)

Performing 'call' & 'constructor' transactions
Pushed transaction '' (call: contract fail just enough gas for intrinsic gas correctly failed with Returned error: intrinsic gas too low)
Pushed transaction 'http://localhost:8080/tx/0xf97d7f01a773ae4a5d7d976b7c17208d61dcf6da421b360569469cde5701cee6' (call: contract creation from call, without a constructor)
Pushed transaction 'http://localhost:8080/tx/0x88fc3d379b20db29d2db0b25d16c5e4eed46bb9f5c4a3c26f95cab8acbe9e33e' (call: contract creation from call, with constructor)
Pushed transaction 'http://localhost:8080/tx/0x0180a46abe56c144c8d5b887a906972e0a8892f447088d103f4de3e012c483b8' (call: nested call revert state changes)
Pushed transaction 'http://localhost:8080/tx/0x787573474edeee44bdd9e1e96971b2648ddd9ea6692d904f9899c610439d76f1' (call: all pre-compiled)
Pushed transaction 'http://localhost:8080/tx/0x2cd2c97d2c81f26debb130b7d96453b247049cae5a451e20dbb60ff5ce58ab3c' (call: nested fail with native transfer)
Pushed transaction 'http://localhost:8080/tx/0x07f951f4a5739e080a752d1fbc56d92ec6eaa52044ec565c837b766e45988b94' (call: contract creation from call, with constructor that will fail correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0x7104b75e22e86fb98463d8016d33f2ed9f666bc6eefae51110373e2404c891fd' (call: contract creation from call, recursive constructor, second will fail correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0xaa63247f0f47459b54909f72d4b1123f05b35de179ca6ba847efa562ff3bfa2b' (call: assert failure root call correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0x609b1cf6c93f533ecde4514107541f88175bd306547bafa4eba6d86ebfa1c518' (call: revert failure root call correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0x364dba46c8459fe0165b409fce17561d704130ef8fcfe80065dfef2ec173c140' (call: contract with create2, inner call fail due to insufficent funds (transaction succeed though))
Pushed transaction 'http://localhost:8080/tx/0xd4a70f810fa495cc5e6c7fd0c2063159d76d4b4c8e0c71ef2e31a32404278801' (call: complete call tree)
Pushed transaction 'http://localhost:8080/tx/0x0d5c98c25fe662d4aed0cf4cbf74ec931a3a1497e11a521de11339b22e318a0c' (call: contract with create2, inner call fail due to insufficent funds then revert correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0xd19d2cc97487af6797c107bc409bc4700ff99beb191dbf681cc2755b95d6c459' (call: contract with create2, succesful creation)
Pushed transaction 'http://localhost:8080/tx/0xb19fcd7576cf47b7369c6ca18270f6dda72b2e23cac0e6fdf0dbc32f33009078' (call: assert failure on child call correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0xd0a8459e5ec5f61ee7a19dba140af44e895f6bb06eef6519d4253de5a0b60c81' (call: contract fail not enough gas after code_copy correctly failed with The contract code couldn't be stored, please check your gas limit.)
Pushed transaction 'http://localhost:8080/tx/0x6ae920806a4ca92013e0824d353b77110b781fda93ab9b2e8e1318037284afee' (call: contract with create2, inner call fail due to address already exists (transaction succeed though))
Pushed transaction 'http://localhost:8080/tx/0xa12896959c085d5d80590de4bfa913eba9343b51f0095035886d92a6ebc3a42b' (call: contract with create2, inner call fail due to address already exists then revert correctly failed with EVM reverted without reason)

Performing 'gas' transactions
Pushed transaction 'http://localhost:8080/tx/0x1c87f225470704f0692c54c0a4c9068f007985142e781d298319daf59c5fe71c' (gas: nested low gas)
Pushed transaction 'http://localhost:8080/tx/0x7e19142bc7cb8110cb44184c7488e159d77ee9589305cc7d856d6eb2aa94a521' (gas: empty call for lowest gas)
Pushed transaction 'http://localhost:8080/tx/0xd4194ac2cf2eeeb46b6aa65c8268b91a8632a1b840ca2cc8e4ec9e542bcc3aef' (gas: deep nested call for lowest gas)
Pushed transaction 'http://localhost:8080/tx/0x19e9c53c0e58b9a612a85c1e7005907c954975fac5d0cec6a9b7cd7d97474651' (gas: deep nested nested call for lowest gas)
Pushed transaction 'http://localhost:8080/tx/0x3fbf0b9053e100eb9e77406f642749b7ac70db6f60c38ea6e3a4dbc632291616' (gas: deep nested low gas)

Performing 'suicide' transactions
Pushed transaction 'http://localhost:8080/tx/0xa240ca33794047b0d8fc98e3ab96c41d120fb94107ed2cdcdf1dbe5d55d41a8a' (suicide: contract does not hold any Ether)
Pushed transaction 'http://localhost:8080/tx/0x89904a8bd857ad47c429721ee33c00632c3ec0a46195f8477a270a7eac1e5f48' (suicide: ensure suicidal2 bump is nonce by creating a contract (#1))
Pushed transaction 'http://localhost:8080/tx/0xd9255d395405fd6d1f66860ee907ad07877abf6d7a186c6a5031c648efb30d4a' (suicide: create contract to fixed address (create2), kill it and try instantiate it again at same address)
Pushed transaction 'http://localhost:8080/tx/0x7dc9519c2cb8eef59030aff7de556d2a77bafa7df7512e3e4b9b51dfca18c207' (suicide: create contract, kill it and try to call within same call)
Pushed transaction 'http://localhost:8080/tx/0x0aaf994b4390cd8290957e4be4500d2d272aa5c4f32fa4ba1fab99fc5b348776' (suicide: ensure suicidal2 bump is nonce by creating a contract (#2))
Pushed transaction 'http://localhost:8080/tx/0x3128e608bb1ea2a7ada9d0233cc0bece57ff6847607a1911a542ede359679d9a' (suicide: transfer some Ether to contract suicide that's about to suicide itself)
Pushed transaction 'http://localhost:8080/tx/0xcb79826cce67b36a7f9e3e02f8e8061981c2a5dfdc8c00d6ee7ed8c9777b1c61' (suicide: contract does hold some Ether, and refund owner on destruct)
Pushed transaction 'http://localhost:8080/tx/0x48b1c5c0d9df2ca01503f03919c188ab68b8cef9e5136c3ab0ef03c4bffe12f6' (suicide: create contract to fixed address (create2), kill it and try instantiate it again at same address)
Pushed transaction 'http://localhost:8080/tx/0x37f3da2dd7101e38ecea17296e726e6b366576ad0e9a734d130e469de29af686' (suicide: create contract, kill it and try to call within same call (second time to valid nonce change after suicide))

Completed battlefield deployment (local)
```
