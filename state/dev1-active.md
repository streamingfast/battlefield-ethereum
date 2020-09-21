## Dev1 Last Run Log (Fri Sep 18 16:52:26 EDT 2020)

```
$ /Users/maoueh/work/dfuse/ethereum.battlefield/node_modules/.bin/ts-node src/main.ts
Configuration
 Network: dev1
 Default address: 0xea143138dab9a14e11d1ae91e669851e6cc72131
 RPC Endpoint: http://localhost:8545
 Private key: 4941116954b6ced5ead503a2fa8c04a0...

Deploying contracts...
Contract main already deployed for network dev1
Contract child already deployed for network dev1
Contract grandChild already deployed for network dev1
Contract suicidal1 already deployed for network dev1
Contract suicidal2 already deployed for network dev1
(Delete or edit file '/Users/maoueh/work/dfuse/ethereum.battlefield/state/dev1-deployment-state.json' to force a re-deploy to new addresses)

Contracts
- main       | 0x09c467442a9bcb471C7B00924b971E8B1bAaF206
- child      | 0x8C29b3635A221d2fA34cC07E305Cd93fD7099C78
- grandChild | 0xa7Ba8e4eA7Fdaf8388d7a0E4f46C07647AB435Fc
- suicidal1  | 0x5526cfcdAd01cCBC8684efF2072330f0BAc49b31
- suicidal2  | 0x45946BbFFb8b30A51D6bF2AC96cac68E649F427f

Transaction Links
- main       | https://dev1-eth.ethq.dfuse.dev/tx/0x6c6aeacdfea29a744c155297282d28299cd629c9f1c1da8c43300f77025287f8
- child      | https://dev1-eth.ethq.dfuse.dev/tx/0x104669ee429a632f569d4a7ab0c7e24cf7c1931e6ba6ccd12680f38cde20b0ac
- grandChild | https://dev1-eth.ethq.dfuse.dev/tx/0xb63405fd38ca89ef6ea0c6e441553abd3363331875aa6d12339d29917da7f1ee
- suicidal1  | https://dev1-eth.ethq.dfuse.dev/tx/0xb5959b204e99cc4acdc52f5584c5930da438aab9c6bedfe807601e46ef5bedcd
- suicidal2  | https://dev1-eth.ethq.dfuse.dev/tx/0x31ceb75424bc4890f75937796370c9524024b40320987d24b4e814e52d049bb2

Performing pure 'transfer' transactions
Pushed transaction 'https://dev1-eth.ethq.dfuse.dev/tx/0x160529b6a240662467c86f714d365464b4a9c381be2aff10bd1c1d5197251cb4' (pure transfer: existing address)
Pushed transaction 'https://dev1-eth.ethq.dfuse.dev/tx/0x113d73f90716c3d5af86da8301710aa43ec9515f3f9ba66ba105211f0c60bc24' (pure transfer: existing address with custom gas limit & price)
Pushed transaction 'https://dev1-eth.ethq.dfuse.dev/tx/0x6c93203ec90104322486699e4a2a7147e70e6c0c12e33f7f04612cc3d3ca4de9' (pure transfer: inexistant address creates account and has an EVM call)
Pushed transaction 'https://dev1-eth.ethq.dfuse.dev/tx/0x930a24fdde8fd351f1c5baaf407f7c3946cd2af41af2b8715f1f652d588b9b03' (pure transfer: transfer of 0 ETH to inexistant address generates a transaction with no EVM call)

Performing 'transfer' through contract transactions
Pushed transaction 'https://dev1-eth.ethq.dfuse.dev/tx/0xa2e25207e7ddc90ee5c2d639245cfeecfa652da80063615ca6b442e6ca82db94' (transfer through contract: existing addresss)
Pushed transaction 'https://dev1-eth.ethq.dfuse.dev/tx/0xd5b26a059857af2db6d857770747fe33ade30fc1c88e47b7519b87e1bc155172' (transfer through contract: inexistant address creates account and has an EVM call)
Pushed transaction 'https://dev1-eth.ethq.dfuse.dev/tx/0x75825f002c66eb57dea32372a9eb0190b42e43a80487c4a6b16e19c7416ff5ae' (nested transfer through contract: existing addresss)
Pushed transaction 'https://dev1-eth.ethq.dfuse.dev/tx/0x57ff8622281805d964d23f5c76ba7ffe89fc9c2b248dfdb0d29c6829a01b88df' (nested transfer through contract: inexistant address creates account and has an EVM call)

Performing 'log' transactions
Pushed transaction 'https://dev1-eth.ethq.dfuse.dev/tx/0x6e926f27a3ff64b2ecd0353d4a5224962e1a8b8f4f9f70193d4d19ba97301a17' (log: empty)
Pushed transaction 'https://dev1-eth.ethq.dfuse.dev/tx/0x4cc2c6a56a4fdacacc3bf18dbd07283a8bdb76aa3075061457e6957c680f12f8' (log: single)
Pushed transaction 'https://dev1-eth.ethq.dfuse.dev/tx/0xbe78523bc90f679af4d345f95fa90999877769d52b4c2aec3df44bdc92231023' (log: all)
Pushed transaction 'https://dev1-eth.ethq.dfuse.dev/tx/0xf950b3873f8712016ebc99c31ffe89c2d122fe74ffcc3b889204fca2d5a8d86e' (log: all indexed)
Pushed transaction 'https://dev1-eth.ethq.dfuse.dev/tx/0xbe431cadf2c37a33704b0b03c4b4e5fa6d4e341c73092ff5259165f3756db6e7' (log: all mixed)
Pushed transaction 'https://dev1-eth.ethq.dfuse.dev/tx/0xc7e4ce4bcab80b6cc5feb9234cc671b936c5b2f8fece05178b1730644a55aae4' (log: multi)

Performing 'storage & input' transactions
Pushed transaction 'https://dev1-eth.ethq.dfuse.dev/tx/0x77eee6622bb2bac7d833d0e2f6ab8c3db271cd7f7fc04b8201ecbbe3c19461e5' (storage: long string)
Pushed transaction 'https://dev1-eth.ethq.dfuse.dev/tx/0x9e7538d8941bd6689a0cfbc36833ee7955f27bc9942d2e29455d6ea673929954' (storage: array update)
Pushed transaction 'https://dev1-eth.ethq.dfuse.dev/tx/0x5b1e140fe88cf55946ebadf67e39574814d4f44050695833738ced9d1dad23e0' (storage: long string input)

Performing 'call' transactions
Pushed transaction 'https://dev1-eth.ethq.dfuse.dev/tx/0x8a9461c87b9044fce9ed9c749608214e5895ee3fd2b899b2c2c63cf84e6a7188' (call: complete call tree)
Pushed transaction 'https://dev1-eth.ethq.dfuse.dev/tx/0xea350c0da9f50ae510a47db2af4f3e29ac8bd31b08c4e057312e8e9c404c808e' (call: contract creation from call, without a constructor)
Pushed transaction 'https://dev1-eth.ethq.dfuse.dev/tx/0x3bed94c0d16478fed659ff929e1ae8cb9fc6c16a0ee4acca1dc226aea045742c' (call: contract creation from call, with constructor)
Pushed transaction 'https://dev1-eth.ethq.dfuse.dev/tx/0xa6c08dbf923dc2aea62f3788df7e24987aed734e8d2970631206bfda8a6efd16' (call: nested fail with native transfer)
Pushed transaction 'https://dev1-eth.ethq.dfuse.dev/tx/0x496939df36838145f39cfe3b1f2b22ce6f396f12fe516a4f6b0e9d2439a43f35' (call: nested call revert state changes)

Performing 'gas' transactions
Pushed transaction 'https://dev1-eth.ethq.dfuse.dev/tx/0xea40903faa87c678a0502b93a0fb20c9eaa16f292e402cfce1bbc0a59669929f' (gas: empty call for lowest gas)
Pushed transaction 'https://dev1-eth.ethq.dfuse.dev/tx/0xbded682b5059d8d3b8c011685dc534bda47a9215e3f8af03155d64b8a249ea27' (gas: nested low gas)
Pushed transaction 'https://dev1-eth.ethq.dfuse.dev/tx/0x78efe0afdb747a3e699cc64a355af83e54ae3cbf5a8eaf1e4f42f44c89203656' (gas: deep nested nested call for lowest gas)
Pushed transaction 'https://dev1-eth.ethq.dfuse.dev/tx/0x3ea143e1c475de6722bce76055f285fc175d45cbe1f2f02f8ec143a87f67684c' (gas: deep nested low gas)
Pushed transaction 'https://dev1-eth.ethq.dfuse.dev/tx/0xd1f0f97213de4e778d58d58d1645fec12236fea9dee4d66faafe140e313584f3' (gas: deep nested call for lowest gas)

Performing 'suicide' transactions
Pushed transaction 'https://dev1-eth.ethq.dfuse.dev/tx/0xbd0239baa8607b757a98785b69885527a28ed4a98a049dd594b418c0c40a605c' (suicide: contract does not hold any Ether)
Pushed transaction 'https://dev1-eth.ethq.dfuse.dev/tx/0x90dd29e59dd188ac3970c1d668516e1ddab71153bf32b07eded39a8d08b5ddb5' (suicide: transfer some Ether to contract that's about to suicide itself)
Pushed transaction 'https://dev1-eth.ethq.dfuse.dev/tx/0x4e83156665dff41044b798225346b80181468a49e6945dab88ff9461b3dd5055' (suicide: contract does hold some Ether, and refund owner on destruct)

Completed battlefield deployment (dev1)
```
