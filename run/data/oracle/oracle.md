## Transaction Log (Mon Nov  2 16:00:26 EST 2020)

```
$ /Users/maoueh/work/dfuse/ethereum.battlefield/node_modules/.bin/ts-node src/main.ts
Configuration
 Network: local
 Default address: 0x821b55d8abe79bc98f05eb675fdc50dfe796b7ab
 RPC Endpoint: http://localhost:8545

Deploying contracts...
Deploying contract 'Suicidal'
Deploying contract 'Main'
Deploying contract 'Suicidal'
Deploying contract 'Grandchild'
Deploying contract 'UniswapV2Factory'
Deploying contract 'Child'
Deploying contract 'EIP20Factory'

Contracts
- main => 0x702641c70a11E480F646Ed247d078c65aBAAC5DE
- child => 0xCae819bff9B75c3D34971C19e005F2cAD7354E0f
- grandChild => 0x929bc44BBD41Ca0e621dc50f7c7E3204Ce026258
- suicidal1 => 0x9a77F7b94488d24EcA50FA0d144212AE48300A71
- suicidal2 => 0x71940c77ccadaeA1238CEa27674E6253128ca177
- uniswap => 0xEC9C1fCee156bf34Ba4fB5D38C9CF09Df16723eF
- erc20 => 0x314F9285cbC3835e676974abDb7d2ab45ede3686

Transaction Links
- main => http://localhost:8080/tx/0x346765ac35b7ed54286f1f82f158b4def6023254b334b3ce8510a542eeddea34
- child => http://localhost:8080/tx/0x40f68759a7ff734d3e8be40fc82692822d306f59cf303cb7e240f677e5c79189
- grandChild => http://localhost:8080/tx/0x20ef27c474b695eee0baae9e75df139b85ff5f38cca2c6fdab367ded6eb77e1c
- suicidal1 => http://localhost:8080/tx/0xa1e59766fe14ab9a0aba03a4ee25c4d6a1916a279b6ed01ae40c2d251b217bab
- suicidal2 => http://localhost:8080/tx/0xf35928c1d0be9caaf415348d7bd61503196b6b0c0b239660e900af62fc45b811
- uniswap => http://localhost:8080/tx/0x846545936f239c675b6f253ecba2d375c60a4d43ba0bed64b133f6868e2b2757
- erc20 => http://localhost:8080/tx/0x41b56fc456afb55331cac0566e4fdeddf8bc8e7277173b648032bdb91cf55bb9

Performing pure 'transfer' transactions
Pushed transaction 'http://localhost:8080/tx/0x5a215c52d4626649d12dd5ba78d6c04ab43e80d6a25e61f50d091562c2b06ad3' (pure transfer: existing address)
Pushed transaction 'http://localhost:8080/tx/0xec6ab9a187d19e7d20c80508440f9cebdb308decf08a336e7e43b66298af433c' (pure transfer: existing address with custom gas limit & price)
Pushed transaction 'http://localhost:8080/tx/0x5867b453347b812efc6259c5d4ea7ef13c0cd669ae8e050453a23685fcfcec28' (pure transfer: inexistant address creates account and has an EVM call)
Pushed transaction 'http://localhost:8080/tx/0xd64bc544276af676988008541d59729389b8a2a02ba2a59f8ccd1af054647dc8' (pure transfer: transfer of 0 ETH to inexistant address generates a transaction with no EVM call)

Performing 'transfer' through contract transactions
Pushed transaction 'http://localhost:8080/tx/0xb096d70947aef7fac5f0f63d2ffe213ad23fb4be59fdc5e09acf7f9617c2a8a8' (transfer through contract: existing addresss)
Pushed transaction 'http://localhost:8080/tx/0xa931923d140a8bc7b705924fc46f507aa13ca576088965ad67865d48c08efe2f' (transfer through contract: inexistant address creates account and has an EVM call)
Pushed transaction 'http://localhost:8080/tx/0x9bbacbb66c63e49663e4d31e4efe45e8eb4344c73605b949bdf639026ffe31b4' (nested transfer through contract: existing addresss)
Pushed transaction 'http://localhost:8080/tx/0x9833b3fe91e20902971a690a9735c7fdfe023718f630b7f6fb376f371ddd6429' (nested transfer through contract: inexistant address creates account and has an EVM call)

Performing 'log' transactions
Pushed transaction 'http://localhost:8080/tx/0x11a53d482637117f32263c2a763dfad0b8ec885f9bc9e4bb8eba6ff330a844af' (log: empty)
Pushed transaction 'http://localhost:8080/tx/0x56851ebb8e008d8489e787f6d58a470236d9bf0421731a44c94cb0fa3a34950f' (log: all)
Pushed transaction 'http://localhost:8080/tx/0x904cf1259453382e26a0d01b4fcb836790c488ea2039a7ee8023758e7e1e0d45' (log: all indexed)
Pushed transaction 'http://localhost:8080/tx/0xf8ca7ec85c578d45452c51c64918db5b1578fc509cc8c8744d97ab6b2dc3d58f' (log: single)
Pushed transaction 'http://localhost:8080/tx/0x065dc7d5ac1ad8f8f03bc1a6cadee29e4c2660d0bba1b65723974df9675cffc4' (log: all mixed)
Pushed transaction 'http://localhost:8080/tx/0x1c298dc87cded59cce2fb10a07932b3d1652c99503b2c03d799538bfeff211b0' (log: multi)

Performing 'storage & input' transactions
Pushed transaction 'http://localhost:8080/tx/0xa44e84cdb385f8ec87057afdbea941968a1fd90a312283cad7d3ed0a99db7730' (input: string equal 32)
Pushed transaction 'http://localhost:8080/tx/0x730fa67cedbcc7b31dc23142d340319a8928329709722424c70a4324239b46d5' (input: string longer than 32)
Pushed transaction 'http://localhost:8080/tx/0x39906c9cc54ef698c4c077c8b853ccc1a363fd9a8204d1fc8b73eff4501fa5fd' (storage: set long string)
Pushed transaction 'http://localhost:8080/tx/0x6cc134bba25f954ceefaa08420e6f2fb7d2200658530c5371fef5e836cb180a8' (input: string equal 15)
Pushed transaction 'http://localhost:8080/tx/0x36b69e16e9bcfd09f0311a6966e2486e0d11f052c7876ebe61876871e4f1bac0' (input: string equal 0)
Pushed transaction 'http://localhost:8080/tx/0xd2e93a6e1ec8896e622196a32aee3ea5fb72f5e018050b2a84ba16b30a70dfc8' (input: string equal 30)
Pushed transaction 'http://localhost:8080/tx/0x3647bc50e3a1fa0a592d48692fc7d3fd1d4fd73f06982f18a4c6b1e4405bd643' (input: string equal 31)
Pushed transaction 'http://localhost:8080/tx/0x5c47655caf397e17568c58f05b32cb11c4afc9794cffa653a3f7abee2e889d7e' (storage: array update)

Performing 'call' transactions
Pushed transaction 'http://localhost:8080/tx/0x028fcbe36461e698922495291d6cd8341df57f29b4aef757040f4d719a4e0fde' (call: contract creation from call, with constructor)
Pushed transaction 'http://localhost:8080/tx/0x2323dfa5adc0803f7941a99c82ea7ecc2f7e6d36ade12dd7817a2f6a3f24cb81' (call: contract creation from call, without a constructor)
Pushed transaction 'http://localhost:8080/tx/0x6b739435bceda79c408041bd4c18d8de051833fe2ab8c40e57a53df90c270644' (call: complete call tree)
Pushed transaction 'http://localhost:8080/tx/0x0a4f1a25cd73d507799691ed8ac93fbe3c0de089150f6d4e952d0173884ab917' (call: nested call revert state changes)
Pushed transaction 'http://localhost:8080/tx/0x906b9ad07607aea439df8cfc459289765e44f97718b9671fa1b6bf32f0f86bdd' (call: nested fail with native transfer)

Performing 'gas' transactions
Pushed transaction 'http://localhost:8080/tx/0xa67d5936c1f9443f1e3d091a0ca4b04746a100b764d095328eb2fe6c7cae0d08' (gas: empty call for lowest gas)
Pushed transaction 'http://localhost:8080/tx/0x529fe107abdce235640462e534517a2a4daceac4d4ec62d6b23b2c5768256203' (gas: nested low gas)
Pushed transaction 'http://localhost:8080/tx/0xad99ddd7ea4dbb58f3076d7b50d7df23b69b72a12de9c66201ffa464a2c61a1d' (gas: deep nested low gas)
Pushed transaction 'http://localhost:8080/tx/0xa45cc43f67740054cdfc9c6862b115c349568b2bd933fed1654c7dca6f781a1f' (gas: deep nested nested call for lowest gas)
Pushed transaction 'http://localhost:8080/tx/0xa67dfec486d967b632d19e3689e4d228f06c8889c1d0dd601837611bc19c121c' (gas: deep nested call for lowest gas)

Performing 'suicide' transactions
Pushed transaction 'http://localhost:8080/tx/0xfebef6abe2b128175280a1995d335434f9b75f4c7837887a76814091038d3848' (suicide: contract does not hold any Ether)
Pushed transaction 'http://localhost:8080/tx/0xc183e7901d455b73181527aafa3d36a17fc30d30bf03bc25aeb42c44438efd87' (suicide: transfer some Ether to contract that's about to suicide itself)
Pushed transaction 'http://localhost:8080/tx/0xdc188e2c8fe0ce493efbc4eac7e6f95e6bc3320a14bf532f16c6b9fde43da695' (suicide: contract does hold some Ether, and refund owner on destruct)

Completed battlefield deployment (local)
```
