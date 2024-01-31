## Transaction Log (Wed Jan 31 10:11:25 EST 2024)

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
Deploying contract 'Child'
Deploying contract 'EIP20Factory'
Deploying contract 'Transfers'
Deploying contract 'Calls'
Deploying contract 'Suicidal'
Deploying contract 'Suicidal'
Deploying contract 'UniswapV2Factory'
Deploying contract 'Main'
Deploying contract 'GrandChild'
Deploying contract 'Logs'

Contracts
- main => 0x34C044506dB54D3e8966300b7CBEFBb569b02C60
- calls => 0x929bc44BBD41Ca0e621dc50f7c7E3204Ce026258
- logs => 0xf0d54E7d8399dF98817E4bD6DDe189ABC8824E3D
- transfers => 0x9a77F7b94488d24EcA50FA0d144212AE48300A71
- child => 0x71940c77ccadaeA1238CEa27674E6253128ca177
- grandChild => 0x410fd7B9368812207DCf674afCB5E359e1365011
- suicidal1 => 0xCae819bff9B75c3D34971C19e005F2cAD7354E0f
- suicidal2 => 0xEC9C1fCee156bf34Ba4fB5D38C9CF09Df16723eF
- uniswap => 0x314F9285cbC3835e676974abDb7d2ab45ede3686
- erc20 => 0x702641c70a11E480F646Ed247d078c65aBAAC5DE

Transaction Links
- main => http://localhost:8080/tx/0x11e6a8b5bd6a3e07b103f4eebda92dd54b8eb48dac4303603aa903b091a53526
- calls => http://localhost:8080/tx/0x2c44cd78805dbcdaacd9925e93528f640867486764ad891db1c69c034eee4259
- logs => http://localhost:8080/tx/0x97a060728d25fac7111a38f4016a5c65c0211e7ea2aeb3f233a41407165c378b
- transfers => http://localhost:8080/tx/0xebcb98976ca603c02aa850835bdb7db8ca499c838eb8a4984c4c792ad6c8e8f2
- child => http://localhost:8080/tx/0xfa98d8e1619857d63d60de40d40a8a7429f0fdaecb2310eb052ef00f6b869503
- grandChild => http://localhost:8080/tx/0x66e6defd3be475facc7a6b898ba79fdf10d2c13f93d80388995963ec73c09c17
- suicidal1 => http://localhost:8080/tx/0xfff1df17c8b05255a16214b4ca2aa0c461d1c8509156304189f28e8b1b745d68
- suicidal2 => http://localhost:8080/tx/0xc8ffb172055b467e4cf90fbe00fa43f62d0bb2b188d7ff842aa430bfb306ba00
- uniswap => http://localhost:8080/tx/0x0e06cc07e411a4d1ee0a23610c260f4f691f3e752c0f1c5c89dc9419e071c48a
- erc20 => http://localhost:8080/tx/0x411c3ddb69f9ac1de3f01cb93abaf811b59339562fe6aed8a1682ceb334b257b

Performing pure 'transfer' transactions
Pushed transaction 'http://localhost:8080/tx/0xee11e7aa2c4b4c5b557f7f1bbd851edfb5b7198bff36d1c5e64b308664d457f0' (pure transfer: existing address with custom gas limit & price)
Pushed transaction 'http://localhost:8080/tx/0xe956abb2f513aa4753082e968fe28d6a8e393ff1a658222b285fd3f741d8afec' (pure transfer: transfer of 0 ETH to inexistant address generates a transaction with no EVM call)
Pushed transaction 'http://localhost:8080/tx/0x5f7f550eead6836f05477b3a0e4fb7d73cc154655a2d3de9cdd2644b59c70e2a' (pure transfer: inexistant address creates account and has an EVM call)
Pushed transaction 'http://localhost:8080/tx/0x98adc7220b1f5d173715b852bcd97127239ee67006e8be48c901b40db5e19b3f' (pure transfer: existing address)

Performing 'transfer' through contract transactions
Pushed transaction 'http://localhost:8080/tx/0xc73d6b299075d46c3a77332b4f9109d2346e2c74642852648fcc97b91ae53e14' (transfer through contract: existing addresss)
Pushed transaction 'http://localhost:8080/tx/0x8243506a2753f7bb71817702653895a178372c3fdd14d06fb83ec3d634d8be6e' (nested transfer through contract: existing addresss)
Pushed transaction 'http://localhost:8080/tx/0x3c81e2d687977223afa4c98ebd375213dcaaeec1f3aa33e8897ae6faf099e3b1' (transfer through contract: inexistant address creates account and has an EVM call)
Pushed transaction 'http://localhost:8080/tx/0x856010314786e58981bf641f61e12eef4e0f0ad465f54082c5f50639cba3ab6d' (nested transfer through contract: inexistant address creates account and has an EVM call)

Performing failing 'transfer' through contract transactions
Pushed transaction 'http://localhost:8080/tx/0x63d2bff37faa143841187d0d8abba75b9c8bd7757244f08e9dd77a81b6e953d0' (transfer through contract: existing addresss correctly failed with EVM reverted without reason)

Performing 'log' transactions
Pushed transaction 'http://localhost:8080/tx/0x743bdfdf78f31b349b7f5ccc24f5a21cd18ee3b9551b18008f2a10a9cd28c6db' (log: all)
Pushed transaction 'http://localhost:8080/tx/0xea125df5df21bd18e491e18fa7c805b17764965e14c3aa1ea72e6f53f16d6408' (log: single)
Pushed transaction 'http://localhost:8080/tx/0x7a44c86c2d58f58f99e911c007fa1420090eb2728112e7f1e2062b0f93393524' (log: empty)
Pushed transaction 'http://localhost:8080/tx/0x0b05023a020b5ab1d13799e98bd838103e4756adcbc2b1af9f3465f249ef8513' (log: multi)
Pushed transaction 'http://localhost:8080/tx/0xfe2d9157950711186dd35d7813212f1613d6856984507bd1fe8f1095c6f23219' (log: log in sub-call that fails but top-level trx succeed)
Pushed transaction 'http://localhost:8080/tx/0x259559b326639ce87c72381298c954e85109e8d71666325fd381937c8fa9c747' (log: all indexed)
Pushed transaction 'http://localhost:8080/tx/0x48c0afd5aff0c2f6baa41ad64271e5aa69f324850407ac98cae8fcae77707e0b' (log: all mixed)
Pushed transaction 'http://localhost:8080/tx/0x45c3d436f29fb5a4f10cbd7658dea8bae74f767532ae88a9d834c9bfd502f083' (log: log in top-level trx and then top-leve trx fails correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0x634c1c3597cd709b5790386d3eb13e5bf7800c163825eb3f2e1692655e3aaf0d' (log: log in sub-call that succeed but top-level trx fails correctly failed with EVM reverted without reason)

Performing 'storage & input' transactions
Pushed transaction 'http://localhost:8080/tx/0x7f217b74b7755ae92fd4a323c9831ce5ce39280bfff6030fbf941a24a85c3389' (input: string equal 30)
Pushed transaction 'http://localhost:8080/tx/0x8e132a58e564c4a835aaa1b95d42316b692749e2bde01722b42cb34fe6c1f537' (storage: set long string)
Pushed transaction 'http://localhost:8080/tx/0xf3dfe1b4f18d3f8f38fdbb20f236f67afcd86d0835976bd8c323dc42f40fce18' (input: string equal 15)
Pushed transaction 'http://localhost:8080/tx/0xc5782769128f16f9285c9a60b8247060b2c194d551f04878ec3dc6e48633ec99' (input: string equal 0)
Pushed transaction 'http://localhost:8080/tx/0x21595ed500d61bf346a8c303dc44eeba2d4e2a3556c96e9ddf419b091faa2710' (input: string longer than 32)
Pushed transaction 'http://localhost:8080/tx/0xcfc48d50a9cb9e14a1062ad0548bb6d65e5213e6a48ee66082b0f74b896b065b' (input: string equal 31)
Pushed transaction 'http://localhost:8080/tx/0x3e8ba502fc99e1f0135b60b46ecd7b24d0ff7c7fd9fa9d1183725533a1d32eb4' (input: string equal 32)
Pushed transaction 'http://localhost:8080/tx/0x968c0d8719b554e075ccef313e73f70bdd54eb62deb60c5602d4aaad893279f5' (storage: array update)

Performing 'call' & 'constructor' transactions (new contract)
Pushed transaction '' (call: contract fail just enough gas for intrinsic gas correctly failed with Returned error: intrinsic gas too low)
Pushed transaction 'http://localhost:8080/tx/0x0284220829f3f55d77ee0252d4574eaca8a0ebc31d60052731f74e729294b8b1' (call: complete call tree)
Pushed transaction 'http://localhost:8080/tx/0x3a71d4ebfdeb207c526634bbc3c7851c9aa55fa4d42c035976794cbe9c1684b1' (call: contract fail not enough gas after code_copy correctly failed with The contract code couldn't be stored, please check your gas limit.)

Performing 'call' & 'constructor' transactions
Pushed transaction '' (call: contract fail just enough gas for intrinsic gas correctly failed with Returned error: intrinsic gas too low)
Pushed transaction 'http://localhost:8080/tx/0x84687417a3c4128b0320c0837df9e9fe8e9be76dded1a959cad972a5c092a112' (call: contract creation from call, without a constructor)
Pushed transaction 'http://localhost:8080/tx/0x614ed5206531bf07942398e730c23e80e1ec594e8eb801902df9297117fff97d' (call: delegate with value)
Pushed transaction 'http://localhost:8080/tx/0xd7b9cabf90fc3304b340eecb5854a46ea0d1b1a345d949266cee0a71fc752ba8' (call: nested fail with native transfer)
Pushed transaction 'http://localhost:8080/tx/0xf975057fbf41f9bd668f8a65aed4d7b3cfaa5ac2dc052e7043520927aecdc869' (call: nested call revert state changes)
Pushed transaction 'http://localhost:8080/tx/0x840d235de28fa4a2a5ef55557e703245c1c254a9c55a84a6da4719ee44c0a8dd' (call: contract creation from call, with constructor)
Pushed transaction 'http://localhost:8080/tx/0xc74b71b427daea69644bad416431f10b5a7e49501a46cda7f308956ac965ea98' (call: contract creation from call, with constructor that will fail correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0xc84df26dbe915d4d499a4f7329c0e9eff611c956de01749130d016da64d9093a' (call: assert failure root call correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0xc0984338cc285a9f918506d6b124f77b750b9f9888d28ed2a7129dc2c1d2504a' (call: complete call tree)
Pushed transaction 'http://localhost:8080/tx/0xeb31ccc63fb26e2888d319eb0079407f4cb5040cff75544960986713cdc6d6cb' (call: all pre-compiled)
Pushed transaction 'http://localhost:8080/tx/0x6a61576250e7d9a5bc7534a81eea270ad6870700190e46b88bd3e0e05b9bade6' (call: contract with create2, inner call fail due to insufficent funds (transaction succeed though))
Pushed transaction 'http://localhost:8080/tx/0x3d1963912553d593d09e5131b04445256f9268b25293fd6f7ba5a9d2ceb9cd12' (call: assert failure on child call correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0x6d634b6faebc29735b61750fac42707febd9aa3fdc8f9f9658d1f9f9f6fa9755' (call: revert failure root call correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0x46ca7469a1945c1df3343eff1958850ff64f03ba1bc08c14e3a27aa51ced39a7' (call: call to a precompiled address)
Pushed transaction 'http://localhost:8080/tx/0xa9042dd8e69d5df902f104abd8d2ea93d23136fa9a10634515a3862c928766a8' (call: contract with create2, succesful creation)
Pushed transaction 'http://localhost:8080/tx/0x7cd23cf657160043a1633d758a29d8281870be22c19d79670e411a2bc03632e4' (call: contract creation from call, recursive constructor, second will fail correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0x1444fe4f0af7f1705fc8b49b15d92ba2c0e19fd0ca7f230722bb424611365c0b' (call: contract with create2, inner call fail due to insufficent funds then revert correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0x0bd314073c63711807e96198b8833f5bf95011351f123224124a317a7ce475e7' (call: contract fail not enough gas after code_copy correctly failed with The contract code couldn't be stored, please check your gas limit.)
Pushed transaction 'http://localhost:8080/tx/0xdc094a8a9896020fa8665672aa0bd427eca26c3e5933850c33235ee150d2bcce' (call: contract with create2, inner call fail due to address already exists (transaction succeed though))
Pushed transaction 'http://localhost:8080/tx/0xba8a85e5b469d165d121b73e4d0246bcc682b363160d9976499bd84693e34f73' (call: contract with create2, inner call fail due to address already exists then revert correctly failed with EVM reverted without reason)

Performing 'gas' transactions
Pushed transaction 'http://localhost:8080/tx/0xa2d04da88c969b2a7000e4b97d6b60eb14a673fa72107826596160d9c63d818d' (gas: deep nested call for lowest gas)
Pushed transaction 'http://localhost:8080/tx/0x6efae2beafa06a457b567223af049bea4f318e65e496afd9e8cddfa500d83c0b' (gas: deep nested low gas)
Pushed transaction 'http://localhost:8080/tx/0x524fa57f0af28590d018033a4f8c91884fbc91ae5efbfa6d06154ae583c22857' (gas: nested low gas)
Pushed transaction 'http://localhost:8080/tx/0x75dfcd37f5dbefeb9fb654853b98a671989a7520c809475c9dbae1a94ab9f1d8' (gas: deep nested nested call for lowest gas)
Pushed transaction 'http://localhost:8080/tx/0xadbe82ba009dbe62dbce58f4f7e508555cdfb5448c97507ef460aa910be345f1' (gas: empty call for lowest gas)

Performing 'suicide' transactions
Pushed transaction 'http://localhost:8080/tx/0x188a48372461217f8a6f1fb29047e96a4a3d1d214e193943350bc963176aa6e5' (suicide: create contract, kill it and try to call within same call)
Pushed transaction 'http://localhost:8080/tx/0x5f110aaf3db4292993fffd16127e436f4ab2443b15f1db8a1f0e42b51eddf538' (suicide: ensure suicidal2 bump is nonce by creating a contract (#2))
Pushed transaction 'http://localhost:8080/tx/0x7fdbfa7dde4f17ea2a17d6f16e7f00a0f372724e403d1486a5b4369cf7fd7e00' (suicide: contract does not hold any Ether)
Pushed transaction 'http://localhost:8080/tx/0xa66b3f2b871f3591c5bd8a76fd7d61cb88828b081357a90bf847dcc9fa329811' (suicide: create contract to fixed address (create2), kill it and try instantiate it again at same address)
Pushed transaction 'http://localhost:8080/tx/0x142a6ae9e7df8a523ef5f6a7f7f944a57d18ce41a6c803e8a78a75fc1a586620' (suicide: transfer some Ether to contract suicide that's about to suicide itself)
Pushed transaction 'http://localhost:8080/tx/0xae566a8969214346becc0c181abd8d7ef47e14299697c5163a2ec573ada9566d' (suicide: ensure suicidal2 bump is nonce by creating a contract (#1))
Pushed transaction 'http://localhost:8080/tx/0x36326718daecacde02d2c187f3de3eae04994e09896c7790a88e4d12933e7b19' (suicide: create contract, kill it and try to call within same call (second time to valid nonce change after suicide))
Pushed transaction 'http://localhost:8080/tx/0xc776b0bff74cce3bac35ef5948f1a207a13007d83003ce2070a0d9887eecee89' (suicide: contract does hold some Ether, and refund owner on destruct)
Pushed transaction 'http://localhost:8080/tx/0x8f5f74dedcd1beded0dfa9bc62cba87eb8def134da537911529fb7daae7364a2' (suicide: create contract to fixed address (create2), kill it and try instantiate it again at same address)

Completed battlefield deployment (local)
```
