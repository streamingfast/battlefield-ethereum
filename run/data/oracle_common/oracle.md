## Transaction Log (Wed Jan 10 15:56:30 EST 2024)

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
Deploying contract 'Transfers'
Deploying contract 'Logs'
Deploying contract 'Calls'
Deploying contract 'Main'
Deploying contract 'GrandChild'
Deploying contract 'EIP20Factory'
Deploying contract 'Suicidal'
Deploying contract 'Child'
Deploying contract 'UniswapV2Factory'
Deploying contract 'Suicidal'

Contracts
- main => 0x929bc44BBD41Ca0e621dc50f7c7E3204Ce026258
- calls => 0x9a77F7b94488d24EcA50FA0d144212AE48300A71
- logs => 0x702641c70a11E480F646Ed247d078c65aBAAC5DE
- transfers => 0x71940c77ccadaeA1238CEa27674E6253128ca177
- child => 0x34C044506dB54D3e8966300b7CBEFBb569b02C60
- grandChild => 0xEC9C1fCee156bf34Ba4fB5D38C9CF09Df16723eF
- suicidal1 => 0x314F9285cbC3835e676974abDb7d2ab45ede3686
- suicidal2 => 0xf0d54E7d8399dF98817E4bD6DDe189ABC8824E3D
- uniswap => 0x410fd7B9368812207DCf674afCB5E359e1365011
- erc20 => 0xCae819bff9B75c3D34971C19e005F2cAD7354E0f

Transaction Links
- main => http://localhost:8080/tx/0x79b9768e1adfe0433bf547ad59490d0cf5f20f39e2acf3bdf5bf9b1e705d2ec5
- calls => http://localhost:8080/tx/0x2a911ac2a8aeb02eda0717359f8d6f1b5ca578353eb4f8168e158a7a2525a556
- logs => http://localhost:8080/tx/0x8e5bd5fea1c2ce00a190dc513536c37922958cd3a9eb1a82b116aa90adedfc18
- transfers => http://localhost:8080/tx/0x79ca84ce2b276ee1acfd591733fc91f439a7e0ee249fde6501f71a6b61dc6fbc
- child => http://localhost:8080/tx/0xed78452bb7fb5352bede151df7489f156923f05b53bb8c31da3a17a7cc2815ef
- grandChild => http://localhost:8080/tx/0xc101c0bca6ed52b43a199427274903beac0d44414bb18cf8cc2a24a098f63973
- suicidal1 => http://localhost:8080/tx/0x0591bbf2393be3e84af143b8d1ac4dac5dedb4aed215b7fea34bc21a61db86a6
- suicidal2 => http://localhost:8080/tx/0x51bae219b0a942836abbea674f4aee7b67c14bf52b33ae9811f838b85b012616
- uniswap => http://localhost:8080/tx/0x7e8a4182bdd7ad5cbe7428ba2626b3c739093787eccd8ee1a5ddebb0980b797b
- erc20 => http://localhost:8080/tx/0x5f2c1ddb03b7b26c714d8c76bb2a8079aa72ce60236f1cf95890f28a6aeb084d

Performing pure 'transfer' transactions
Pushed transaction 'http://localhost:8080/tx/0x254f13e1ea8c651f527d1e57b0e82c433efc3e7a7a962a40d1db6c40a07a054f' (pure transfer: existing address)
Pushed transaction 'http://localhost:8080/tx/0xb18b5442f64ca81d7072b6ba5a3296e005c7bc0e547c6c3eeb81cf060f97e090' (pure transfer: existing address with custom gas limit & price)
Pushed transaction 'http://localhost:8080/tx/0x55c8e1029295a851d5de7b4dc626aef6762c76d72b97873de16dc9ee99fb948a' (pure transfer: inexistant address creates account and has an EVM call)
Pushed transaction 'http://localhost:8080/tx/0x96c193f0b3803d05bc50a46880ed0f7c21670be953e93183a92926dd1bd23eb5' (pure transfer: transfer of 0 ETH to inexistant address generates a transaction with no EVM call)

Performing 'transfer' through contract transactions
Pushed transaction 'http://localhost:8080/tx/0xf98ea8bfe37a675be6a2000475ada1ae3faf21f97ecf5817563f460c29828c04' (transfer through contract: inexistant address creates account and has an EVM call)
Pushed transaction 'http://localhost:8080/tx/0xad58cbf00b22e0ea4c289d7820f88d39228ef76459e931a6bdf4f3c7beb8c454' (nested transfer through contract: inexistant address creates account and has an EVM call)
Pushed transaction 'http://localhost:8080/tx/0xe9d13f6b68f47ae07c555075fca78a88251a48ab8bd370b08896a6b28a3910f1' (transfer through contract: existing addresss)
Pushed transaction 'http://localhost:8080/tx/0x82a98150914402df61c6482c98023f92395a251ff32938af614ca1fcd591c8e2' (nested transfer through contract: existing addresss)

Performing failing 'transfer' through contract transactions
Pushed transaction 'http://localhost:8080/tx/0xbaae4c50373548a82a2917f176bb4d17d2eaa8ee44a54e973f012035e3930c2c' (transfer through contract: existing addresss correctly failed with EVM reverted without reason)

Performing 'log' transactions
Pushed transaction 'http://localhost:8080/tx/0xb6034404c2dd3d812c3776b289040ab7ec567e112be8ca6ffd76d99b6ffdf4fc' (log: all)
Pushed transaction 'http://localhost:8080/tx/0x8f7401817018659b9c8e59ce83485388dfc91e60233b47c010df0ad4fb7571c1' (log: empty)
Pushed transaction 'http://localhost:8080/tx/0x0748abc6c4c1e2490d8617a0ced5ca6d20c7c158768eb513cd3a6fa464345cae' (log: single)
Pushed transaction 'http://localhost:8080/tx/0x2b28ccaa6d5cad093596a4fac277f7a7dd21bc2c2a9dc01e981e452a16222532' (log: all indexed)
Pushed transaction 'http://localhost:8080/tx/0x71fb468ecce231e4b4c22311b7e2d00660ff6fe05e6daa038a59bc6978cfcd8a' (log: multi)
Pushed transaction 'http://localhost:8080/tx/0x3ab08f41798a4558b695eeaa20c51490dd0a38501138d4af5c58a4f7da20942b' (log: all mixed)
Pushed transaction 'http://localhost:8080/tx/0xc08617a3054cc5d399906418bf6f4a686f32af1f304ca9cf43f7b406e5f1d8d7' (log: log in sub-call that fails but top-level trx succeed)
Pushed transaction 'http://localhost:8080/tx/0x9744569f0dcc4bcced8251dddb24f23f8dbfa3799986b0b7b6b8d3ba6afa6d1b' (log: log in sub-call that succeed but top-level trx fails correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0x719bd0ec675644fe115d445f4a40bed2d1075e3ca970faa84a7cb9084e6217ce' (log: log in top-level trx and then top-leve trx fails correctly failed with EVM reverted without reason)

Performing 'storage & input' transactions
Pushed transaction 'http://localhost:8080/tx/0x7016a89a7c3f122174263bbf57f0161058995e7125e3b10e2cf5d49f689f3700' (input: string equal 15)
Pushed transaction 'http://localhost:8080/tx/0x4234d5abf4b45d67e81e3fce8ffd77121e464a69455c4d6d9d5ed1d899bea55a' (input: string equal 31)
Pushed transaction 'http://localhost:8080/tx/0xc11f3c6e45824aa32c213ce02f0c456a6591bd352a5c2178d9680579281c4425' (input: string equal 30)
Pushed transaction 'http://localhost:8080/tx/0x09f3ff31536e158d8aae1006aa77a899f0f52ea45e1dee1a439727e369a89d48' (input: string equal 0)
Pushed transaction 'http://localhost:8080/tx/0xefc464f7051ae9262310ecfeedd159ca2f1eb207f7b2962373b17f7b02f3a59b' (input: string longer than 32)
Pushed transaction 'http://localhost:8080/tx/0xfac26dd8648f373d514b21e9e323ee9ed79b6c8ba90a006d355b71932d30ccc8' (input: string equal 32)
Pushed transaction 'http://localhost:8080/tx/0x8ec6e0c1c31c3427a168cd2a886e501882c72b247c562c16ccb8a102f103f7d5' (storage: set long string)
Pushed transaction 'http://localhost:8080/tx/0x2d8b45319eee136ce5c7706d64edce0b7ece8b4e845c4b1bfbc1a61337f67b47' (storage: array update)

Performing 'call' & 'constructor' transactions (new contract)
Pushed transaction '' (call: contract fail just enough gas for intrinsic gas correctly failed with Returned error: intrinsic gas too low)
Pushed transaction 'http://localhost:8080/tx/0x8e17de97b79106c38f6b7621b40bb7b572210a674e65e38e3e33f1dda09e1c9d' (call: complete call tree)
Pushed transaction 'http://localhost:8080/tx/0x3a71d4ebfdeb207c526634bbc3c7851c9aa55fa4d42c035976794cbe9c1684b1' (call: contract fail not enough gas after code_copy correctly failed with The contract code couldn't be stored, please check your gas limit.)

Performing 'call' & 'constructor' transactions
Pushed transaction '' (call: contract fail just enough gas for intrinsic gas correctly failed with Returned error: intrinsic gas too low)
Pushed transaction 'http://localhost:8080/tx/0x74b4ca11af4a699b08e34e36a702b948eb9d78a35a1d4f408643bbfdf2aaa8b2' (call: complete call tree)
Pushed transaction 'http://localhost:8080/tx/0xa65505dde94c4b94ddd0d19de43742b4d3717dcb1dbf19ed95c311d84a90eddb' (call: contract creation from call, with constructor that will fail correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0x8fe793eb5cd906d8fde74c796dcbd8fde0cd4a4f5eabc95074e29ae63f6b0396' (call: nested fail with native transfer)
Pushed transaction 'http://localhost:8080/tx/0xc357d87dcee57d66fee20f6598b1763f031cae1ae894efb3c340a6594d0ce7f3' (call: contract creation from call, with constructor)
Pushed transaction 'http://localhost:8080/tx/0x24a3ea94ff48cc9b614a3a9a7a31781930ece0e93f2413d482c408ac34b5bd9c' (call: contract creation from call, without a constructor)
Pushed transaction 'http://localhost:8080/tx/0x51265ea88dc0f543004f38fe2e4fa70c6c2c3968f86bc6a4eb076ad217e662a2' (call: contract creation from call, recursive constructor, second will fail correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0xe991396d30d1b4a5a81f143fc9571bef3029e2cb6969d909c51c520ee69cfd07' (call: all pre-compiled)
Pushed transaction 'http://localhost:8080/tx/0x0a02dfe4e6fdd0b08e905813c2ec5521144d77f09ba52b981a780864d5c3c175' (call: assert failure root call correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0x65a0550ba123469d39b146f9909a601882e08c3cf5975ce6737e09356355d6b4' (call: revert failure root call correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0x97f234dd28c739fc1c91ee9812e70d938b56d6dbc571a0742068d4cf8a070a14' (call: assert failure on child call correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0x74fe9e83e6267a687b8b135a5fc2811338cbfb1e230980ae785ec00319729eb5' (call: nested call revert state changes)
Pushed transaction 'http://localhost:8080/tx/0xed5f73c76738609bd42294bfc5596f1235bb29a90fe80e1510996b87c3b21a56' (call: contract with create2, inner call fail due to insufficent funds (transaction succeed though))
Pushed transaction 'http://localhost:8080/tx/0x478a33885a045e3742b568b2d4737438d9c6accbd781b73426f98028fadd624e' (call: contract with create2, succesful creation)
Pushed transaction 'http://localhost:8080/tx/0x2787857b972bc993ed98897a88e514fb2e049a077b0ffcd38c7ccf7f6ca0225f' (call: contract with create2, inner call fail due to insufficent funds then revert correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0x1c757a1ed184114606c37cd856db41d95f9d15cf41224084e71834ae8f7ef766' (call: contract fail not enough gas after code_copy correctly failed with The contract code couldn't be stored, please check your gas limit.)
Pushed transaction 'http://localhost:8080/tx/0x6456a02cabfff29c15627eb21e2f8ad9997ef7a3f0ec13baa72a3d5916c94525' (call: contract with create2, inner call fail due to address already exists (transaction succeed though))
Pushed transaction 'http://localhost:8080/tx/0x206ccede5fa782ee9c2adc1695c44a3734aaebc3b1c33bbfc2a59237e1e53197' (call: contract with create2, inner call fail due to address already exists then revert correctly failed with EVM reverted without reason)

Performing 'gas' transactions
Pushed transaction 'http://localhost:8080/tx/0x0c60b16e6dae0c2c4cd0d251d45ae790f753d4caa8f85dfa55bc5619d6b8682f' (gas: empty call for lowest gas)
Pushed transaction 'http://localhost:8080/tx/0x486990e105b2a56ff611886d45e26f424f243cc890df6855d88dc7fc21a25e28' (gas: deep nested call for lowest gas)
Pushed transaction 'http://localhost:8080/tx/0x50101e6d2653fe63fbc4aee35e3b95cd781316399739ebf5d6b3b4f81958fc22' (gas: deep nested low gas)
Pushed transaction 'http://localhost:8080/tx/0x8d183f352c5bdbc50c2f8bcb5b89924227b8b413accaa7f86ce4f93677fb52f9' (gas: deep nested nested call for lowest gas)
Pushed transaction 'http://localhost:8080/tx/0x66c93a535c2398ee1ee0adf344cd6611bda52c97e03c0915bdf3cf261a49c99b' (gas: nested low gas)

Performing 'suicide' transactions
Pushed transaction 'http://localhost:8080/tx/0x16a3bee4cf984dba8f57d2e3d8c8f046bc31d0606ad5e283de78b8432b4aa626' (suicide: contract does not hold any Ether)
Pushed transaction 'http://localhost:8080/tx/0x57d5202aadebd90359e86f3cd6789bb07466387e09dc105e1a2bdc0461c750f9' (suicide: create contract to fixed address (create2), kill it and try instantiate it again at same address)
Pushed transaction 'http://localhost:8080/tx/0x5fc539c9735c7166657f6c54eb76b9f200797f328f982f48d106a35e47ed83bb' (suicide: ensure suicidal2 bump is nonce by creating a contract (#1))
Pushed transaction 'http://localhost:8080/tx/0x308be30ad03211ecd5cf14d848fb9d97d0bb5c71efe548938a6476759c9fbec4' (suicide: transfer some Ether to contract suicide that's about to suicide itself)
Pushed transaction 'http://localhost:8080/tx/0x8041d60b8682092e7166a65e62b85010f1d50fe1244a42a2a1388656c3958ffc' (suicide: ensure suicidal2 bump is nonce by creating a contract (#2))
Pushed transaction 'http://localhost:8080/tx/0xb705e7458094bda5fe6d673b94232c186fe189a602ecef6a1c4f311efaa822b6' (suicide: create contract, kill it and try to call within same call)
Pushed transaction 'http://localhost:8080/tx/0x48aaae33b2c156ff63c9e1a209f66e0d0996192342f590cfd1d04c8384ad3acc' (suicide: create contract to fixed address (create2), kill it and try instantiate it again at same address)
Pushed transaction 'http://localhost:8080/tx/0xf91398105c183fc603d981853d58cc679c6dc05ea3e17f7610730f71042c5b07' (suicide: contract does hold some Ether, and refund owner on destruct)
Pushed transaction 'http://localhost:8080/tx/0x0bfeb9eca73b81700ebe30523c8b147d6d9cc112da83631b2bb0bb36fee08d89' (suicide: create contract, kill it and try to call within same call (second time to valid nonce change after suicide))

Completed battlefield deployment (local)
```
