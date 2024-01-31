## Transaction Log (Wed Jan 31 11:12:40 EST 2024)

```
Bor
Version: 0.3.7-stable-fh2
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
Deploying contract 'EIP20Factory'
Deploying contract 'GrandChild'
Deploying contract 'Main'
Deploying contract 'Calls'
Deploying contract 'Logs'
Deploying contract 'Suicidal'
Deploying contract 'UniswapV2Factory'
Deploying contract 'Suicidal'
Deploying contract 'Transfers'
Deploying contract 'Child'

Contracts
- main => 0x9a77F7b94488d24EcA50FA0d144212AE48300A71
- calls => 0x929bc44BBD41Ca0e621dc50f7c7E3204Ce026258
- logs => 0xEC9C1fCee156bf34Ba4fB5D38C9CF09Df16723eF
- transfers => 0x410fd7B9368812207DCf674afCB5E359e1365011
- child => 0xf0d54E7d8399dF98817E4bD6DDe189ABC8824E3D
- grandChild => 0x702641c70a11E480F646Ed247d078c65aBAAC5DE
- suicidal1 => 0xCae819bff9B75c3D34971C19e005F2cAD7354E0f
- suicidal2 => 0x34C044506dB54D3e8966300b7CBEFBb569b02C60
- uniswap => 0x314F9285cbC3835e676974abDb7d2ab45ede3686
- erc20 => 0x71940c77ccadaeA1238CEa27674E6253128ca177

Transaction Links
- main => http://localhost:8080/tx/0xeec6e34476ee0069439d20a2e9ffdff8113b0319033da8159d9aa8cb00fca05f
- calls => http://localhost:8080/tx/0x2c44cd78805dbcdaacd9925e93528f640867486764ad891db1c69c034eee4259
- logs => http://localhost:8080/tx/0x52624a643b009bc0ea3426840901b1002078db1714d145f6a69f33e1b2860741
- transfers => http://localhost:8080/tx/0xaa6f88eccc8207f4e074d1992c9dd42640b46ce700b0fe41f45e06c165721463
- child => http://localhost:8080/tx/0x32431cdc275523eab09d3b9eb730181874e526b0c4fb20994cb80c4f64fa962f
- grandChild => http://localhost:8080/tx/0x8bc763e41e8c412c2b8f8c2476891d169c6493b4e1afb94800e49fe61205a3e5
- suicidal1 => http://localhost:8080/tx/0xfff1df17c8b05255a16214b4ca2aa0c461d1c8509156304189f28e8b1b745d68
- suicidal2 => http://localhost:8080/tx/0xff369ace8aae1dce9b35b2cbc6ee77fd036d302188c5041a05d6e342cde0572c
- uniswap => http://localhost:8080/tx/0x0e06cc07e411a4d1ee0a23610c260f4f691f3e752c0f1c5c89dc9419e071c48a
- erc20 => http://localhost:8080/tx/0x5ac4ca43dfa5ccedb8e799d4bce9188461267c807dc1b50f8e141f62d787d66e

Performing pure 'transfer' transactions
Pushed transaction 'http://localhost:8080/tx/0x98adc7220b1f5d173715b852bcd97127239ee67006e8be48c901b40db5e19b3f' (pure transfer: existing address)
Pushed transaction 'http://localhost:8080/tx/0x3a2af8be9b66475038d6c0c506e9dae838698919226e27a9b7c325b6e7c2c617' (pure transfer: transfer of 0 ETH to inexistant address generates a transaction with no EVM call)
Pushed transaction 'http://localhost:8080/tx/0xee11e7aa2c4b4c5b557f7f1bbd851edfb5b7198bff36d1c5e64b308664d457f0' (pure transfer: existing address with custom gas limit & price)
Pushed transaction 'http://localhost:8080/tx/0x6f50a30be648f4571c3358214b15b0ab5b40c2179b59d4fc6c7d5d285f481397' (pure transfer: inexistant address creates account and has an EVM call)

Performing 'transfer' through contract transactions
Pushed transaction 'http://localhost:8080/tx/0x208dfd647cf4a375d2ce8a132ae3e3dc173e668c0b42bbe1c2aa8ae985f41503' (nested transfer through contract: existing addresss)
Pushed transaction 'http://localhost:8080/tx/0x5808ddcc56c061b0acf721cb928c1f9df1823c2ac8b3adb573f15616bf25e3bf' (nested transfer through contract: inexistant address creates account and has an EVM call)
Pushed transaction 'http://localhost:8080/tx/0x1b7f835765cbbff02c87acb0a6dcc217853dc34713f23e2b8b6b4657adb0e9ad' (transfer through contract: existing addresss)
Pushed transaction 'http://localhost:8080/tx/0x87da302b53506ee238ee9eb7687e304c135a4d04685508f53ed60739d50ababb' (transfer through contract: inexistant address creates account and has an EVM call)

Performing failing 'transfer' through contract transactions
Pushed transaction 'http://localhost:8080/tx/0x5cc7c2d997c81e84ae9fe997fedd0b7a253305c78f40f40c32c1428329a85f02' (transfer through contract: existing addresss correctly failed with EVM reverted without reason)

Performing 'log' transactions
Pushed transaction 'http://localhost:8080/tx/0x23a64ed32e6a57a3a9d79f46ea3cd317efb3d6e4e8eb04191e499d7b15cc005e' (log: log in sub-call that fails but top-level trx succeed)
Pushed transaction 'http://localhost:8080/tx/0x8a681462c4b6631d8477191ca92eb3f56584f2885d838104e870e45e67f58e28' (log: all mixed)
Pushed transaction 'http://localhost:8080/tx/0xcdf3d0b98046ed01d11a29708c24b046a438e0d34260aaf924a308ad09fc7712' (log: single)
Pushed transaction 'http://localhost:8080/tx/0x4237377ddd5ec62a98478c89fc438735e3c46830fe7608f9d4e49c5fed2243c6' (log: all indexed)
Pushed transaction 'http://localhost:8080/tx/0x85376ea5ea6bcba3814074f5cbf0df4ad363a74ff02c6fde98eb90d6c4805d63' (log: all)
Pushed transaction 'http://localhost:8080/tx/0x308313b8aed45548b5470fd2b5a5b4ddb9a5cc2f80112e9e51a0c4771b3b6aed' (log: multi)
Pushed transaction 'http://localhost:8080/tx/0xbb898db5c993fda02f0b975194c02cbfd316df4e194dfc21704c8adba7cd0cdb' (log: log in sub-call that succeed but top-level trx fails correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0x765b0f928c30319ba4b960ebe8751e4e336308f02c2055ff3a9f8181cc6f3fa3' (log: empty)
Pushed transaction 'http://localhost:8080/tx/0x47e956964d148028b82f3ef7fbf5f134eb1bcb9e1aa197c0efaefae2b9121088' (log: log in top-level trx and then top-leve trx fails correctly failed with EVM reverted without reason)

Performing 'storage & input' transactions
Pushed transaction 'http://localhost:8080/tx/0x89fb4a8b0c72d671f5ffa8c7509ac29866d972df9d512159db99b5e12fa4d7c0' (input: string equal 15)
Pushed transaction 'http://localhost:8080/tx/0x38eb06487300f9822638b085480caba0c77b9c3e84b6c863406585291d214348' (storage: set long string)
Pushed transaction 'http://localhost:8080/tx/0x5460a6b5516cfc357199444fd6e73e424ae343d34d52f86329448b8ad3c24c65' (input: string longer than 32)
Pushed transaction 'http://localhost:8080/tx/0xa04cef5966b71b385b50291241a6ddcb203b726566638639d6892d6c8d3b5e3f' (input: string equal 32)
Pushed transaction 'http://localhost:8080/tx/0x838ca85f190df82aa9049fe0897106745cd26b341953dc13bdde67cacd17316a' (input: string equal 30)
Pushed transaction 'http://localhost:8080/tx/0x5af96d399dfec7b4d9551f21dd3035732234153741eca23036b4fcdda712fcae' (input: string equal 31)
Pushed transaction 'http://localhost:8080/tx/0x6e54816c5921b83f93b49bab955872fda65ff95c782c56047cfdc1590fc966d0' (input: string equal 0)
Pushed transaction 'http://localhost:8080/tx/0x7c225bdbbc01d063784cab04cd0772cdb9e9df8e984ca9f2eebf5ffd93193d57' (storage: array update)

Performing 'call' & 'constructor' transactions (new contract)
Pushed transaction '' (call: contract fail just enough gas for intrinsic gas correctly failed with Returned error: intrinsic gas too low)
Pushed transaction 'http://localhost:8080/tx/0x5c7a6436db5a8b55ae2d91deb89605642e137da3addd9f78ecf956abb6b3b9d2' (call: complete call tree)
Pushed transaction 'http://localhost:8080/tx/0x3a71d4ebfdeb207c526634bbc3c7851c9aa55fa4d42c035976794cbe9c1684b1' (call: contract fail not enough gas after code_copy correctly failed with The contract code couldn't be stored, please check your gas limit.)

Performing 'call' & 'constructor' transactions
Pushed transaction '' (call: contract fail just enough gas for intrinsic gas correctly failed with Returned error: intrinsic gas too low)
Pushed transaction 'http://localhost:8080/tx/0x31acd95510415466c8bec2edf9646630cbcb10272da071f1115505a403b926de' (call: all pre-compiled)
Pushed transaction 'http://localhost:8080/tx/0x51c058e1b6497529accb7db4974905e997100866082dd5a19a77e7343ab386e7' (call: nested call revert state changes)
Pushed transaction 'http://localhost:8080/tx/0x4d85c191423a397650c4379573f5013db99d16365451c86516d28b4e9658ff22' (call: contract creation from call, with constructor)
Pushed transaction 'http://localhost:8080/tx/0x07b60169c2c18a9c659d6535b39b6d7ffbe557b02e2404aad0fac6481ae5300c' (call: delegate with value)
Pushed transaction 'http://localhost:8080/tx/0x2b777707fba14dff33eb2fc7ecc69cd3ba4dc50ad54635db141767d1777f3e49' (call: assert failure root call correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0x76ad9af1f8193338f3ff8a1d701acc66701644a07cd441830fec02fa6d6b6f8e' (call: contract creation from call, with constructor that will fail correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0xd310501dc34403c35fc0a9fc76d2da6cf136d885a5288eb116e9619da1eeba64' (call: contract with create2, succesful creation)
Pushed transaction 'http://localhost:8080/tx/0x46ca7469a1945c1df3343eff1958850ff64f03ba1bc08c14e3a27aa51ced39a7' (call: call to a precompiled address)
Pushed transaction 'http://localhost:8080/tx/0x3aa8910099267ab14f06f3c5d6f8b7735913b496bdc48a81a2704e111c96e54f' (call: contract creation from call, without a constructor)
Pushed transaction 'http://localhost:8080/tx/0x2030524692e0fe2500198d19353416078924b56cd0e2e601c5a151864336d146' (call: complete call tree)
Pushed transaction 'http://localhost:8080/tx/0x6c39ea96736008c5bd57af601f6fcd17308e54324cbc2a35dacba030e73efa64' (call: contract with create2, inner call fail due to insufficent funds (transaction succeed though))
Pushed transaction 'http://localhost:8080/tx/0xf30dbdd42e74204f1762d04db23e046ff12be2e4adac7bed70e220e66b583751' (call: contract with create2, inner call fail due to insufficent funds then revert correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0x58b8bdc29e8f91ae049c85572a334abb81574671b60b2a7634472c01238d2b61' (call: assert failure on child call correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0x9ed34fe6c20bcadb28c05917b338f151ba6883a5a12654f3e0b5913e2880bf55' (call: nested fail with native transfer)
Pushed transaction 'http://localhost:8080/tx/0xa8057fac21c2ef78c4d267cee4a8e7df7a17cc654fbc93613513094aae5b1842' (call: contract creation from call, recursive constructor, second will fail correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0x0bd314073c63711807e96198b8833f5bf95011351f123224124a317a7ce475e7' (call: contract fail not enough gas after code_copy correctly failed with The contract code couldn't be stored, please check your gas limit.)
Pushed transaction 'http://localhost:8080/tx/0x6d634b6faebc29735b61750fac42707febd9aa3fdc8f9f9658d1f9f9f6fa9755' (call: revert failure root call correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0xaf667b8db3789e6d208dd1bcffb62b0c98816a87b6da061ff658eda088648be7' (call: contract with create2, inner call fail due to address already exists (transaction succeed though))
Pushed transaction 'http://localhost:8080/tx/0x899d21c5fb2522a85209633911e3980411d99df29fe3e57bd36f7d8d574bda40' (call: contract with create2, inner call fail due to address already exists then revert correctly failed with EVM reverted without reason)

Performing 'gas' transactions
Pushed transaction 'http://localhost:8080/tx/0x58e73c1d1236a32603ef833b918f56b78e31c94ad7a9e13443319f93af7a4dde' (gas: empty call for lowest gas)
Pushed transaction 'http://localhost:8080/tx/0x94b85ec630988b33fa398f0415688149d20db087edf078743371a94ae0e876af' (gas: deep nested call for lowest gas)
Pushed transaction 'http://localhost:8080/tx/0xf54d3e6e6856d4e31a306075b61fe9ce933b48646a19c9190c8e4b6c62b7c626' (gas: nested low gas)
Pushed transaction 'http://localhost:8080/tx/0xa2ae7b06570895e885a7c055a4af777520477b034785f759b5e628960120da6f' (gas: deep nested low gas)
Pushed transaction 'http://localhost:8080/tx/0x08710e17a8519914ee8d8228387f2144292fde7e14920c579ad7ec1faa27e2ec' (gas: deep nested nested call for lowest gas)

Performing 'suicide' transactions
Pushed transaction 'http://localhost:8080/tx/0x1bad7f245f413ea35bac624657808c875b8c86f349d0f0b4f0bb768c384488cc' (suicide: contract does not hold any Ether)
Pushed transaction 'http://localhost:8080/tx/0xdd21648414abeae94b6c9708078cc3de750d38aa15a4de73399b6931834cbaf4' (suicide: ensure suicidal2 bump is nonce by creating a contract (#2))
Pushed transaction 'http://localhost:8080/tx/0x6cf10024d40942307d907ca470af915ecdb3911af496757bf023581073cdc356' (suicide: transfer some Ether to contract suicide that's about to suicide itself)
Pushed transaction 'http://localhost:8080/tx/0x5a8db1925228c0b95cd629255176060b6ae0af6ad43edb0aaaf7d1cb37c7ddd3' (suicide: ensure suicidal2 bump is nonce by creating a contract (#1))
Pushed transaction 'http://localhost:8080/tx/0x73f06fbd375492c65e55b1492296db002866f9165b73cdb9a66b7b7e06688869' (suicide: create contract to fixed address (create2), kill it and try instantiate it again at same address)
Pushed transaction 'http://localhost:8080/tx/0xffa45e0a4d728b2c0134b4064d0cd7547f89330197865f077eb19d9c2b8e9062' (suicide: create contract, kill it and try to call within same call)
Pushed transaction 'http://localhost:8080/tx/0x8f5f74dedcd1beded0dfa9bc62cba87eb8def134da537911529fb7daae7364a2' (suicide: create contract to fixed address (create2), kill it and try instantiate it again at same address)
Pushed transaction 'http://localhost:8080/tx/0x36326718daecacde02d2c187f3de3eae04994e09896c7790a88e4d12933e7b19' (suicide: create contract, kill it and try to call within same call (second time to valid nonce change after suicide))
Pushed transaction 'http://localhost:8080/tx/0xc47316bb098c49d61261c6749fc77062bc5fd9d2ffcab5eb087a4368f9ddaad5' (suicide: contract does hold some Ether, and refund owner on destruct)

Completed battlefield deployment (local)
```
