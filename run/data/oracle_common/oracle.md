## Transaction Log (Thu Feb  1 10:10:44 EST 2024)

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
Deploying contract 'Logs'
Deploying contract 'Child'
Deploying contract 'Suicidal'
Deploying contract 'Main'
Deploying contract 'Calls'
Deploying contract 'GrandChild'
Deploying contract 'EIP20Factory'
Deploying contract 'UniswapV2Factory'
Deploying contract 'Suicidal'
Deploying contract 'Transfers'

Contracts
- main => 0x929bc44BBD41Ca0e621dc50f7c7E3204Ce026258
- calls => 0xEC9C1fCee156bf34Ba4fB5D38C9CF09Df16723eF
- logs => 0x71940c77ccadaeA1238CEa27674E6253128ca177
- transfers => 0xf0d54E7d8399dF98817E4bD6DDe189ABC8824E3D
- child => 0x702641c70a11E480F646Ed247d078c65aBAAC5DE
- grandChild => 0xCae819bff9B75c3D34971C19e005F2cAD7354E0f
- suicidal1 => 0x410fd7B9368812207DCf674afCB5E359e1365011
- suicidal2 => 0x9a77F7b94488d24EcA50FA0d144212AE48300A71
- uniswap => 0x34C044506dB54D3e8966300b7CBEFBb569b02C60
- erc20 => 0x314F9285cbC3835e676974abDb7d2ab45ede3686

Transaction Links
- main => http://localhost:8080/tx/0x79b9768e1adfe0433bf547ad59490d0cf5f20f39e2acf3bdf5bf9b1e705d2ec5
- calls => http://localhost:8080/tx/0x1c34632573a7b75ccb30902dd4e8c8e0969168162cfea17e50c15a8c8b80fa94
- logs => http://localhost:8080/tx/0xb6250a033c5e578467a6876b5c9d088ad7ccc9b6d5f3302cc0c613c0217ac7a9
- transfers => http://localhost:8080/tx/0xc15901c89c95adf232109115173ff7c7de5ebf33ab03ef6a5dba119b5de81c80
- child => http://localhost:8080/tx/0x77b88c4c82162726d17c07736e73afc59084a9460e64ffad978f2e869100c3d9
- grandChild => http://localhost:8080/tx/0x49fd97769f1933740fce36479fdbfcadbf14a4dff1d98f7fa703120e918fd488
- suicidal1 => http://localhost:8080/tx/0x48e0a79b60820779b43b28ae7eba53139cf974604f6cdaf148ac4c7601feeb85
- suicidal2 => http://localhost:8080/tx/0x7d152174204af92c9e5e7884d1168ff08dfb44b0942988d4b8cba561ad6ff8f9
- uniswap => http://localhost:8080/tx/0xcffa5fb363d767fe72f5d52dde0ace78d125f5038d625de948a74958389778e6
- erc20 => http://localhost:8080/tx/0x41b56fc456afb55331cac0566e4fdeddf8bc8e7277173b648032bdb91cf55bb9

Performing pure 'transfer' transactions
Pushed transaction 'http://localhost:8080/tx/0xa1b8b199588dba0751a3478da4b5ea9cced9484ae719d4b9643c75f14307ad13' (pure transfer: to precompile address)
Pushed transaction 'http://localhost:8080/tx/0x254f13e1ea8c651f527d1e57b0e82c433efc3e7a7a962a40d1db6c40a07a054f' (pure transfer: existing address)
Pushed transaction 'http://localhost:8080/tx/0x255197169052e147249a80d8a6a6016182055d360cf44f041534613f81755033' (pure transfer: transfer of 0 ETH to inexistant address generates a transaction with no EVM call)
Pushed transaction 'http://localhost:8080/tx/0xb18b5442f64ca81d7072b6ba5a3296e005c7bc0e547c6c3eeb81cf060f97e090' (pure transfer: existing address with custom gas limit & price)
Pushed transaction 'http://localhost:8080/tx/0x40abe1a7b5b222d67e50817f5eb19d4c3f2eb600b2904cb48a8f4f2bf1772301' (pure transfer: inexistant address creates account and has an EVM call)

Performing 'transfer' through contract transactions
Pushed transaction 'http://localhost:8080/tx/0xc925a87cfe66d40007fef825d1e6d070152f55e9e5cc3d32e174868ec8c5c603' (nested transfer through contract: existing addresss)
Pushed transaction 'http://localhost:8080/tx/0xd0b9327988a359be7847eb5f4cf6b2dcc87e85c6b666c69528bbccbd01b8c1b3' (transfer through contract: inexistant address creates account and has an EVM call)
Pushed transaction 'http://localhost:8080/tx/0x46df1e0a448b143cf56ec38d51e021129539064fcecc3c3fedd1c02eafa0af6c' (nested transfer through contract: inexistant address creates account and has an EVM call)
Pushed transaction 'http://localhost:8080/tx/0x0434efc9a0a26d295036592365dbeaf9c092851a83ec5d4097105699d32c90d8' (transfer through contract: existing addresss)

Performing failing 'transfer' through contract transactions
Pushed transaction 'http://localhost:8080/tx/0x35bfd0b4d8b7c396d2f07699e0a1cca5de48ed744ab6ab24e0a49d125e7e2777' (transfer through contract: existing addresss correctly failed with EVM reverted without reason)

Performing 'log' transactions
Pushed transaction 'http://localhost:8080/tx/0x73ed22dde8bf3afee5a2272a7c7387e10995ebe30a3c6ce491f2b40fa2452a4e' (log: all mixed)
Pushed transaction 'http://localhost:8080/tx/0xa89fa8074edaed4c25bf1136add16e1239c9724325dc223c0f0104591ebc87af' (log: empty)
Pushed transaction 'http://localhost:8080/tx/0xe84ba545418357c83b8adb40aa1a8e1f62f8ba23cdea027200a8cddfe4e21b0c' (log: single)
Pushed transaction 'http://localhost:8080/tx/0x93121dcb38f5051f7f009784e015f3697701bf48c5a3987e16d0c46d31b68eb6' (log: all indexed)
Pushed transaction 'http://localhost:8080/tx/0xe964051a93f716906fe404ddc4a48c9b586fae8d4fc3e7604c034c58b68a01f6' (log: log in sub-call that fails but top-level trx succeed)
Pushed transaction 'http://localhost:8080/tx/0xaba92593477a9d473f03575649f7893208fd28a4463edf187cf042c4706f9d87' (log: all)
Pushed transaction 'http://localhost:8080/tx/0x232ca933d23b5eab4f9e276a260a55c87b55478c5220154d1c806863ac8541e2' (log: multi)
Pushed transaction 'http://localhost:8080/tx/0x110f75d3b82c62a6581141cf941be7dd2ee68264342ecaa6dcbac5f8dbc9a0c8' (log: log in top-level trx and then top-leve trx fails correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0x37724f7091d689328822642fdf05f6b3d9a255f06a6f901d198f919ebf097d77' (log: log in sub-call that succeed but top-level trx fails correctly failed with EVM reverted without reason)

Performing 'storage & input' transactions
Pushed transaction 'http://localhost:8080/tx/0xc11f3c6e45824aa32c213ce02f0c456a6591bd352a5c2178d9680579281c4425' (input: string equal 31)
Pushed transaction 'http://localhost:8080/tx/0x4234d5abf4b45d67e81e3fce8ffd77121e464a69455c4d6d9d5ed1d899bea55a' (input: string equal 30)
Pushed transaction 'http://localhost:8080/tx/0x7016a89a7c3f122174263bbf57f0161058995e7125e3b10e2cf5d49f689f3700' (input: string equal 15)
Pushed transaction 'http://localhost:8080/tx/0xb98034e7b9f00b3363e12210fe765c1d17805e4e35457dc86387e503966e46ef' (input: string equal 32)
Pushed transaction 'http://localhost:8080/tx/0x97cbe31bd67cc587b561d5fed7e6bc52b43a2f0e9ccde6005d48b526935aabf9' (input: string longer than 32)
Pushed transaction 'http://localhost:8080/tx/0xc525c40c7455def873d36a186b7b4a78c431c67765a34f978490039f651b570e' (storage: set long string)
Pushed transaction 'http://localhost:8080/tx/0x5855336b8d4554a2a78c2c6f48aa7b5dbadb58b56c34e666bf9ba749be7567c8' (input: string equal 0)
Pushed transaction 'http://localhost:8080/tx/0x941c916d4466b08bd8b7aca789b763ff1c48718d26b9be0b54c44d6acd1bf4a7' (storage: array update)

Performing 'call' & 'constructor' transactions (new contract)
Pushed transaction '' (call: contract fail just enough gas for intrinsic gas correctly failed with Returned error: intrinsic gas too low)
Pushed transaction 'http://localhost:8080/tx/0x2b7ca2e1df6b98ed21b1fdace342e4fd877ba09f44eb2af0ac883ffbb10f7ae6' (call: complete call tree)
Pushed transaction 'http://localhost:8080/tx/0x489c68a4974a417e91f0b24dde1ecf5ed2bc4a42e5154032cf43a8e21f6b4518' (call: contract fail not enough gas after code_copy correctly failed with The contract code couldn't be stored, please check your gas limit.)

Performing 'call' & 'constructor' transactions
Pushed transaction '' (call: contract fail just enough gas for intrinsic gas correctly failed with Returned error: intrinsic gas too low)
Pushed transaction 'http://localhost:8080/tx/0xeceeb6a937e79002ca589b9d800598083c5e8b42b502c628a04f6063ffc161a2' (call: contract creation from call, with constructor)
Pushed transaction 'http://localhost:8080/tx/0x453731eaa610350f297c4639b0ee879c1fa6b38c8b7bf3dc1685d01da11032d5' (call: call to a precompiled address with balance)
Pushed transaction 'http://localhost:8080/tx/0x967425aea77ffdcf3f513c30f840b6bdb518ab86676cbd582f00bcf0181f209a' (call: all pre-compiled)
Pushed transaction 'http://localhost:8080/tx/0x22d55a13e61a0fd794bd2047c0b54a945b5f00bb41ed32e2443f935c2ca7326c' (call: call to a precompiled address without balance)
Pushed transaction 'http://localhost:8080/tx/0x19a57718efd14d70d6fb0f301518da51a017076b43075584fe353ec59c5e882a' (call: nested fail with native transfer)
Pushed transaction 'http://localhost:8080/tx/0x223a00ca85ff9c58c4b912abe64e18f738a225185a7afdc36409dcbc74cd8d77' (call: contract with create2, inner call fail due to insufficent funds (transaction succeed though))
Pushed transaction 'http://localhost:8080/tx/0xa221a95bc8154bff1f9f6275a55f737804acea5ff5000dc41a88d922a2c68ad4' (call: nested call revert state changes)
Pushed transaction 'http://localhost:8080/tx/0xb534e1b994bfa0a35161337d441c0d6594243241d787fe3430d789b5d72f142b' (call: delegate with value)
Pushed transaction 'http://localhost:8080/tx/0x9004c228d1cc82a241055c1e8206a733e3e79415f691d77d187aecab54758180' (call: contract creation from call, recursive constructor, second will fail correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0x5edb083312bbd123619f96050ba12674a0ecbcda8bef11f51db547abfbc608df' (call: contract creation from call, with constructor that will fail correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0x1497ea7aa8db664cc30c36744a340dd535385d649b4dd84fab314f9dfa148dbd' (call: assert failure on child call correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0x6d2e89c0ed90a599f91c15e36feb2e37e40ebd524d90376e25150dfaf624b692' (call: revert failure root call correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0xadaaea0c503273de7842df6cd8136e9cf86bbd3164786f8ecca2645921c7daf5' (call: assert failure root call correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0x56e6d47723b2314e8af6e1c82ae222932a2a7ff2dc509b73c67c2eb7469fd947' (call: complete call tree)
Pushed transaction 'http://localhost:8080/tx/0x7f0a7f536d99c96c7519736976193d91ca3a547acec5c227e98d78d17e14c2aa' (call: contract with create2, inner call fail due to insufficent funds then revert correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0xa3c18a800c8ef0607dd67f3faabad44ac492079e24f499d453d531cbcfabf7eb' (call: contract with create2, succesful creation)
Pushed transaction 'http://localhost:8080/tx/0xa82b280b753dd181f532730037df18fcbe4dca412f8ea5e6823902bd7b71e066' (call: contract creation from call, without a constructor)
Pushed transaction 'http://localhost:8080/tx/0x4df7fd65b1fb44d22ff892e631251e5d143ecb4846c059daa7ea4bb55ff6e994' (call: contract fail not enough gas after code_copy correctly failed with The contract code couldn't be stored, please check your gas limit.)
Pushed transaction 'http://localhost:8080/tx/0xbc4c0feffac4aed51474685b01ef16c8a3f4884c1f0703f77bb128fa532a2d38' (call: contract with create2, inner call fail due to address already exists (transaction succeed though))
Pushed transaction 'http://localhost:8080/tx/0xdae6f9e71699b17128571a6c0fe91d54b8475de80135b7ab77143a953ef63aab' (call: contract with create2, inner call fail due to address already exists then revert correctly failed with EVM reverted without reason)

Performing 'gas' transactions
Pushed transaction 'http://localhost:8080/tx/0xa665c0d0ea59a0e3328d7347eb74cfd466db26f4a1a0a50c8a237b699d3e1d1b' (gas: nested low gas)
Pushed transaction 'http://localhost:8080/tx/0x0cc7a72050744e361484900e22fe3ae85f0cc79c4711e14e82070f240d89ad30' (gas: deep nested call for lowest gas)
Pushed transaction 'http://localhost:8080/tx/0xd81d16858da0459b2d4803624a7a23b171e4dd1eee3d3dfc849ad3047559a3a1' (gas: deep nested nested call for lowest gas)
Pushed transaction 'http://localhost:8080/tx/0xc23c2b759b9ef92a5722887760b6962352fbc1b56d82de8ff4baca0f5ad5802e' (gas: deep nested low gas)
Pushed transaction 'http://localhost:8080/tx/0x441a168a0871ac56290dbadae97c7f8c476123ed366445dfab2a72e1649b7be6' (gas: empty call for lowest gas)

Performing 'suicide' transactions
Pushed transaction 'http://localhost:8080/tx/0x4972e47f3bca454666d54ae0404c48e1fb4795af4e0e70aaf55260e9d7494065' (suicide: contract does not hold any Ether)
Pushed transaction 'http://localhost:8080/tx/0x613fdc1cbfe14e7666377591fb377fbbd45e4672347befbec5b4ba362610ba47' (suicide: create contract to fixed address (create2), kill it and try instantiate it again at same address)
Pushed transaction 'http://localhost:8080/tx/0x5fa116d69c5aa3b2fa7124d4aae08b72d5e18c3ce1c6ba52c77d900461a9912f' (suicide: create contract, kill it and try to call within same call)
Pushed transaction 'http://localhost:8080/tx/0x3fa17b706eb127335ddeac5cc6e48ec066bfd9638ae340f4aab383e9ee68a50d' (suicide: ensure suicidal2 bump is nonce by creating a contract (#2))
Pushed transaction 'http://localhost:8080/tx/0xec5d924bb557658be4f46df4ead432b225e38ae5c3c2d1f36920e86a32799b8d' (suicide: ensure suicidal2 bump is nonce by creating a contract (#1))
Pushed transaction 'http://localhost:8080/tx/0xadcc30a47f6115b8c552c1a27a39ea193d9e83bc9b766d0706bc51dd9747a722' (suicide: transfer some Ether to contract suicide that's about to suicide itself)
Pushed transaction 'http://localhost:8080/tx/0x002e73365a183a1b3ca631fe65d85c138f04f486401737e133338e5567734cac' (suicide: contract does hold some Ether, and refund owner on destruct)
Pushed transaction 'http://localhost:8080/tx/0x3eae41a56eaac215247c359ff8d8cb4dd09c0dfba3d96a32d0be6a31c906e27c' (suicide: create contract, kill it and try to call within same call (second time to valid nonce change after suicide))
Pushed transaction 'http://localhost:8080/tx/0x046e41845046c5a0a2786a0b078a943767b2f0c47d0b85f9ef89f65c4415cace' (suicide: create contract to fixed address (create2), kill it and try instantiate it again at same address)
Pushed transaction 'http://localhost:8080/tx/0x52617df117bea8e2dd50c51604ba55f1125d400764a1d325dee95f164da553b0' (call: call to a precompiled address without balance again at the very end, to see effect on OnNewAccount)
Pushed transaction 'http://localhost:8080/tx/0x6fe5517bf7b3d678c432fc17bbb2550d943622e52abc2623c9d747a241dc652f' (call: call to a precompiled address with balance again at the very end, to see effect on OnNewAccount)

Completed battlefield deployment (local)
```
