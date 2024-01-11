## Transaction Log (Wed Jan 10 20:26:45 EST 2024)

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
Deploying contract 'Suicidal'
Deploying contract 'Calls'
Deploying contract 'Suicidal'
Deploying contract 'Main'
Deploying contract 'Transfers'
Deploying contract 'EIP20Factory'
Deploying contract 'Logs'
Deploying contract 'UniswapV2Factory'

Contracts
- main => 0xCae819bff9B75c3D34971C19e005F2cAD7354E0f
- calls => 0x929bc44BBD41Ca0e621dc50f7c7E3204Ce026258
- logs => 0x410fd7B9368812207DCf674afCB5E359e1365011
- transfers => 0x314F9285cbC3835e676974abDb7d2ab45ede3686
- child => 0x702641c70a11E480F646Ed247d078c65aBAAC5DE
- grandChild => 0x71940c77ccadaeA1238CEa27674E6253128ca177
- suicidal1 => 0x9a77F7b94488d24EcA50FA0d144212AE48300A71
- suicidal2 => 0xEC9C1fCee156bf34Ba4fB5D38C9CF09Df16723eF
- uniswap => 0xf0d54E7d8399dF98817E4bD6DDe189ABC8824E3D
- erc20 => 0x34C044506dB54D3e8966300b7CBEFBb569b02C60

Transaction Links
- main => http://localhost:8080/tx/0x6860bd28eadf921e1b684a16ca1ff2498f2a2f48245659905c7dd2352916d2f8
- calls => http://localhost:8080/tx/0xa53d1f07f5fe3ff9a42da8c112ac62f245b4c2e4cdd50d036f78e73564a88abf
- logs => http://localhost:8080/tx/0x363a97806e8417677b7d80f5e6190998c2bf9ebd8e3e6f48ac07839d0e787d03
- transfers => http://localhost:8080/tx/0x1c4963817d6edcf3c14c3c1d03ec2c1c1fcb1b3990bacefd4ddccf0e27274c8e
- child => http://localhost:8080/tx/0x956404ad3482adeb7ad7eb99324c54f8bf1964aa2358fb1617a8bbce80be85de
- grandChild => http://localhost:8080/tx/0x44d41a518c0ae877c0b0a4a5be9ce7629f250f8355ee05c69b2353ec214cf997
- suicidal1 => http://localhost:8080/tx/0x7d152174204af92c9e5e7884d1168ff08dfb44b0942988d4b8cba561ad6ff8f9
- suicidal2 => http://localhost:8080/tx/0xc8ffb172055b467e4cf90fbe00fa43f62d0bb2b188d7ff842aa430bfb306ba00
- uniswap => http://localhost:8080/tx/0x9d45a05f1173539e95dbc10f54f4458d4cac00cf8987f02b1fb3c979291c173e
- erc20 => http://localhost:8080/tx/0x0a37a908bb7480e7401c048a0cbf06fe0ec7f220078d36ee43f5064698024a7f

Performing pure 'transfer' transactions
Pushed transaction 'http://localhost:8080/tx/0x254f13e1ea8c651f527d1e57b0e82c433efc3e7a7a962a40d1db6c40a07a054f' (pure transfer: existing address)
Pushed transaction 'http://localhost:8080/tx/0xd49ae13dbb34ca0a47af51fed538217778d030bd489ce9bf388ce94be992a5e8' (pure transfer: existing address with custom gas limit & price)
Pushed transaction 'http://localhost:8080/tx/0x954071427ad615cb4bff460391fa10212af080c288fa5fa425f8d15b5f3bbbd8' (pure transfer: inexistant address creates account and has an EVM call)
Pushed transaction 'http://localhost:8080/tx/0xb04c1ea8edd4f2e983cd50e684f6da0b0de4bc550f1c240a98abb3b46189058c' (pure transfer: transfer of 0 ETH to inexistant address generates a transaction with no EVM call)

Performing 'transfer' through contract transactions
Pushed transaction 'http://localhost:8080/tx/0x214d1aba2d7529f48072e33e7b7b44505caff8bfc8212eba11259b69832bdec8' (nested transfer through contract: existing addresss)
Pushed transaction 'http://localhost:8080/tx/0x3c4b2545e886af50229c8b4f4cf63671a0fefb1af54ec17568aacd21434cf864' (transfer through contract: inexistant address creates account and has an EVM call)
Pushed transaction 'http://localhost:8080/tx/0xd9daf1ee68d3691c3add53376722d34314958810a6911ed0537d8332ae4f715f' (transfer through contract: existing addresss)
Pushed transaction 'http://localhost:8080/tx/0xba520bbc5ad6ecfcbf25f7c3d69bcf4c2eacb1b07ecad43acdc12c8ce096465b' (nested transfer through contract: inexistant address creates account and has an EVM call)

Performing failing 'transfer' through contract transactions
Pushed transaction 'http://localhost:8080/tx/0x8b524676ee95f42b7d618709d909cda53e2df5fa300dce03d7d23d1a24dd4192' (transfer through contract: existing addresss correctly failed with EVM reverted without reason)

Performing 'log' transactions
Pushed transaction 'http://localhost:8080/tx/0x6db8853aff9fa4e2599296303da3ec3bdd9e2106c1b35a1202b6b333ba55bbfe' (log: empty)
Pushed transaction 'http://localhost:8080/tx/0xdf795e78cfce19299b745a5bd04c0a12e12e7e9e54dd084a9ba151112daac9d0' (log: all)
Pushed transaction 'http://localhost:8080/tx/0xa86fab30c8f8c479afb4dc6c00c2d29de862356b52d347570693c5db54ac00ef' (log: all mixed)
Pushed transaction 'http://localhost:8080/tx/0x28ddcc3249f389e012cb520fedb5d054dfb3109f841088d7f2f697e1afe693d5' (log: all indexed)
Pushed transaction 'http://localhost:8080/tx/0xaf2d169b1fef9bc49d856c9faeed87317c67d0a44c750e75ab1dde35c2c0fa84' (log: single)
Pushed transaction 'http://localhost:8080/tx/0x6d48a88e4ea44712b61fc7628335dc38dd4ffa0f35352709b668f1b384bd2acd' (log: multi)
Pushed transaction 'http://localhost:8080/tx/0xfd685b6f45579441dfc4598b0defad8dd7f6a50ce5653a1c513a0bceed74d27a' (log: log in sub-call that succeed but top-level trx fails correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0x96dac3b0e72567626491ef67075c05dfabad1fcfe6f3b9681b4dc759fae6fe65' (log: log in top-level trx and then top-leve trx fails correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0xdb512251bf52cc3ff1ab8dac2349cabcde6d25b1a70c1e160cf3d05c061de109' (log: log in sub-call that fails but top-level trx succeed)

Performing 'storage & input' transactions
Pushed transaction 'http://localhost:8080/tx/0xb7f333f74ea6dbf535673946a04f65cc43ba8ebf347013295b9dde95e12a0271' (input: string equal 0)
Pushed transaction 'http://localhost:8080/tx/0xd291e582aedb55e6daefd3cfe14c28a09e9acf532ac028381533fde17d311b12' (input: string equal 32)
Pushed transaction 'http://localhost:8080/tx/0x86b687310da2bdbfb307e8573cf7fd4f934d1446905c9694f6e3b7e294ff1ce9' (input: string equal 15)
Pushed transaction 'http://localhost:8080/tx/0x828cd6b53f8f1b46155964c1ebbf35eefe2b6b169247ab1a5cd4ff594737db9f' (input: string equal 30)
Pushed transaction 'http://localhost:8080/tx/0x4360db02ec28019c9f12241be67e01a85ed40f075da167f591ef4c86df6eea79' (input: string equal 31)
Pushed transaction 'http://localhost:8080/tx/0xbb1abe7a96444b5e7a268d63ac3b26fcbb91b404304c21a4c24ff7c1d5048c7e' (storage: set long string)
Pushed transaction 'http://localhost:8080/tx/0x68e14482d00d3197eb057a769248e87284002cf5633a8015283e2950dae4c153' (input: string longer than 32)
Pushed transaction 'http://localhost:8080/tx/0x953f5351c4aa55585bf25133e34c260c7a183a9c032960904c3f78561128e1dc' (storage: array update)

Performing 'call' & 'constructor' transactions (new contract)
Pushed transaction '' (call: contract fail just enough gas for intrinsic gas correctly failed with Returned error: intrinsic gas too low)
Pushed transaction 'http://localhost:8080/tx/0x4db7beeebf7707f06037577fa7e38bf456a49c615cb3eb6175cb144077fbba1b' (call: complete call tree)
Pushed transaction 'http://localhost:8080/tx/0x3a71d4ebfdeb207c526634bbc3c7851c9aa55fa4d42c035976794cbe9c1684b1' (call: contract fail not enough gas after code_copy correctly failed with The contract code couldn't be stored, please check your gas limit.)

Performing 'call' & 'constructor' transactions
```
