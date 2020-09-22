## Dev1 Last Run Log (Tue Sep 22 01:10:09 EDT 2020)

```
$ /Users/maoueh/work/dfuse/ethereum.battlefield/node_modules/.bin/ts-node src/main.ts
Configuration
 Network: dev1
 Default address: ea143138dab9a14e11d1ae91e669851e6cc72131
 RPC Endpoint: http://localhost:8545
 Private key: 4941116954b6ced5ead503a2fa8c04a0...

Deploying contracts...
Contract main already deployed for network dev1
Contract child already deployed for network dev1
Contract grandChild already deployed for network dev1
Contract suicidal1 already deployed for network dev1
Contract suicidal2 already deployed for network dev1
Contract uniswap already deployed for network dev1
Contract erc20 already deployed for network dev1
(Delete or edit file '/Users/maoueh/work/dfuse/ethereum.battlefield/state/dev1-deployment-state.json' to force a re-deploy to new addresses)

Contracts
- main => 0x7d94115A1076706b14baF4844299068E3BCcB681
- child => 0x43D805dfa103974acB21F7e6cd51a7da6fcA7903
- grandChild => 0xFc5A09983760EB83CfF1DE491EC7242BCf60C1e9
- suicidal1 => 0x40Ecf831a50C24955752B02d2A95B680930f432C
- suicidal2 => 0x396b07D76ce13F0283B37246593ce7a08B582E23
- uniswap => 0xcf1Fd245D77764Cefaa70dEcC1E8D1FDE38feCB6
- erc20 => 0x8223c666495e586A9C47DFe0746eAbCC2fa209f7

Transaction Links
- main => https://dev1-eth.ethq.dfuse.dev/tx/0xbd1975b8b690adb4442de7c16b54cce7b807a56564a2e3fa9760932b78b8b75b
- child => https://dev1-eth.ethq.dfuse.dev/tx/0x8a4d61763cf54f4a86f207e379a09fa504845f73c6cbdfb1e7cdb3bc9f415be7
- grandChild => https://dev1-eth.ethq.dfuse.dev/tx/0x4b8eb087c38f307493fc4faed69f6f3c221706244fa7cbba89252632da208faa
- suicidal1 => https://dev1-eth.ethq.dfuse.dev/tx/0x069b2aaf0503a492710190a5d4940f3840a7c149f061d8705e6bf5a640a53647
- suicidal2 => https://dev1-eth.ethq.dfuse.dev/tx/0xd97053c7a58d59a3616aab64bd3ba147d19f5b7a604af9ed3ded717c84372615
- uniswap => https://dev1-eth.ethq.dfuse.dev/tx/0xcf6d7c89a1bee8135fcf0d60d59df444dabda790565322d8e0a475f268fa9825
- erc20 => https://dev1-eth.ethq.dfuse.dev/tx/0x530961bc335dd5c329764b2967ff8fc0e0f5700a7ba84a971f088e4933cfb539

Performing pure 'transfer' transactions
Pushed transaction 'https://dev1-eth.ethq.dfuse.dev/tx/0x3e154dbddc7cc439104dd34e928d9d3f1b0f6a5d52f5b3efe6f6ed4a6b949c84' (pure transfer: existing address)
Pushed transaction 'https://dev1-eth.ethq.dfuse.dev/tx/0x2567799f9baeddb4c78ea8d95472dea466e84a67d9b4fb5f28eac520bce95b44' (pure transfer: existing address with custom gas limit & price)
Pushed transaction 'https://dev1-eth.ethq.dfuse.dev/tx/0xadd34e3a318a6c728928adf532361dde244ab02387ad265aac491f72ac261185' (pure transfer: inexistant address creates account and has an EVM call)
Pushed transaction 'https://dev1-eth.ethq.dfuse.dev/tx/0x3545257d7891878f4b8ad6c43f1e439ab3939d0ec26a0f5f746ef3ecded15a68' (pure transfer: transfer of 0 ETH to inexistant address generates a transaction with no EVM call)

Performing 'transfer' through contract transactions
Pushed transaction 'https://dev1-eth.ethq.dfuse.dev/tx/0x57308c3668e91ccf4a0827aa226d06faeb1cbf4951a50c0e24358d751725cb54' (transfer through contract: existing addresss)
Pushed transaction 'https://dev1-eth.ethq.dfuse.dev/tx/0x77cf50aebc40378316c1628cdc8707e37149778cde0fd2fbce199331884c92de' (transfer through contract: inexistant address creates account and has an EVM call)
Pushed transaction 'https://dev1-eth.ethq.dfuse.dev/tx/0xaae099d8460cbedba7945c0cae571fc5ade61e7ba2007a11600315bad3e105fb' (nested transfer through contract: existing addresss)
Pushed transaction 'https://dev1-eth.ethq.dfuse.dev/tx/0xe856b3d229bf48e2bbf3aed46ec9c3100131791fd99f80d1724b184b3c1752e1' (nested transfer through contract: inexistant address creates account and has an EVM call)

Performing 'log' transactions
Pushed transaction 'https://dev1-eth.ethq.dfuse.dev/tx/0x503a70bf38be1bb74a7d4b561385c0df4c80edb9e3566f2e71afd36dff3c1ee8' (log: empty)
Pushed transaction 'https://dev1-eth.ethq.dfuse.dev/tx/0xf6ff9801a4e2a4a4b01419491df30792df9aa8b32f9caf571a354ede355fbd42' (log: single)
Pushed transaction 'https://dev1-eth.ethq.dfuse.dev/tx/0x39637c7d7756c1d6fe83cf2dd946073ba1557a5f3551a43285870cf176837bff' (log: all)
Pushed transaction 'https://dev1-eth.ethq.dfuse.dev/tx/0x1b885041d7751d6d2a12920aae58cd54dd17526dad1992ab985e422b64536d7d' (log: all indexed)
Pushed transaction 'https://dev1-eth.ethq.dfuse.dev/tx/0x9871e3c86aa769a4780f5ee8771cf651ad48789558103f44e9a47c31ea68fcbf' (log: all mixed)
Pushed transaction 'https://dev1-eth.ethq.dfuse.dev/tx/0x9dc7a666a18ae2507a66f99d587f73ad3c9dd77ce662ce2df2c5f1d0f43e6558' (log: multi)

Performing 'storage & input' transactions
Pushed transaction 'https://dev1-eth.ethq.dfuse.dev/tx/0x93456b3f64f687f7e64c06d7c0e3978b212174640416f9bb8a07e7aed9a4ce72' (input: string equal 0)
Pushed transaction 'https://dev1-eth.ethq.dfuse.dev/tx/0xf94452462fc271a4e7aca015dd7a8c53f980ecb3a8c3ebcf875b5472f7c3f299' (input: string equal 15)
Pushed transaction 'https://dev1-eth.ethq.dfuse.dev/tx/0x53b1979945d9c80a8618026e3d2699b77537c64ef5abd487176eb40619cd5758' (input: string equal 30)
Pushed transaction 'https://dev1-eth.ethq.dfuse.dev/tx/0x018e4cd7f176ffb9777b55592bf3911d5ba811a46116a1184c5b73b2da7818c0' (input: string equal 31)
Pushed transaction 'https://dev1-eth.ethq.dfuse.dev/tx/0xd7a822674917f5574ab374d8ca8706028420e341d0f5c53dc5def2a86383f993' (input: string equal 32)
Pushed transaction 'https://dev1-eth.ethq.dfuse.dev/tx/0xd9b056494fecf9ef0683116d245745011321a2c3f363ed2fc857df1c947d117e' (input: string longer than 32)
Pushed transaction 'https://dev1-eth.ethq.dfuse.dev/tx/0xd60a8c9aaaade09f60188525792f776c188e80e092c93aa23c99af28c4027f88' (storage: set long string)
Pushed transaction 'https://dev1-eth.ethq.dfuse.dev/tx/0xdec612e8b9281f16f31e13b96ea328588054553ca8c9b788fee90060d634c277' (storage: array update)

Performing 'call' transactions
Pushed transaction 'https://dev1-eth.ethq.dfuse.dev/tx/0x4f7b7154f8eb27bb1349f22011bf7377c02af89ed3ed68d1ba18c23fc6a0086b' (call: complete call tree)
Pushed transaction 'https://dev1-eth.ethq.dfuse.dev/tx/0xd5f9088d292044e5a2f716c2767493a0c03fcc087ad99f4a53e96218f15eaa5a' (call: contract creation from call, without a constructor)
Pushed transaction 'https://dev1-eth.ethq.dfuse.dev/tx/0xaa2709cced9f68ac78b63baadde5804d25433682d3072c4d410eff09714f2318' (call: contract creation from call, with constructor)
Pushed transaction 'https://dev1-eth.ethq.dfuse.dev/tx/0x555cda840826d4eec570bcec685002018348e76b294acfae759079b4268d7b15' (call: nested fail with native transfer)
Pushed transaction 'https://dev1-eth.ethq.dfuse.dev/tx/0xedbb30b1214a9604958de5b45cafb8f5b83167e5084c0cc405099be7ef0530d1' (call: nested call revert state changes)

Performing 'gas' transactions
Pushed transaction 'https://dev1-eth.ethq.dfuse.dev/tx/0x5a42c7a83439ae728ca7a7af066e1509fe5238144024b6dc9f3dc09fd7de1030' (gas: empty call for lowest gas)
Pushed transaction 'https://dev1-eth.ethq.dfuse.dev/tx/0xfafb5e23c81b3df2147a63be93e180f8662d2580b6a4365f2df3884a71348b2e' (gas: nested low gas)
Pushed transaction 'https://dev1-eth.ethq.dfuse.dev/tx/0xda30cbd12dc709e59daf2ade7e30f9beb01a7a4eba5ffbf3b8122114e5e0210f' (gas: deep nested nested call for lowest gas)
Pushed transaction 'https://dev1-eth.ethq.dfuse.dev/tx/0xeccb47bbc8dcf9adf804456a304bdf38e814a3bac041b191409264d1145010e4' (gas: deep nested low gas)
Pushed transaction 'https://dev1-eth.ethq.dfuse.dev/tx/0x7a351bb129e558c7da6dd0e4f89af57330984ffb09ac0dd7fd2e4444f6b97dee' (gas: deep nested call for lowest gas)

Performing 'suicide' transactions
Pushed transaction 'https://dev1-eth.ethq.dfuse.dev/tx/0xcba4f7e3686458bc255b830cd425fce1cc2e49910a7dc4bd029badec9b865334' (suicide: contract does not hold any Ether)
Pushed transaction 'https://dev1-eth.ethq.dfuse.dev/tx/0x2a5bd13e80baf18628341cf899f905e26e00d3196372551e2ab24df61af9329e' (suicide: transfer some Ether to contract that's about to suicide itself)
Pushed transaction 'https://dev1-eth.ethq.dfuse.dev/tx/0x227b28c8703885cf4cc85f84e2e5f8c7ac2e1de8947e4cab9ea1019f0bf7a678' (suicide: contract does hold some Ether, and refund owner on destruct)

Completed battlefield deployment (dev1)
```
