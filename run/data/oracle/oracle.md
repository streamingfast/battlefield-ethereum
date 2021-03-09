## Transaction Log (Tue Mar  9 15:24:44 EST 2021)

```
$ /Users/maoueh/work/dfuse/ethereum.battlefield/node_modules/.bin/ts-node src/main.ts
Configuration
 Network: local
 Default address: 0x821b55d8abe79bc98f05eb675fdc50dfe796b7ab
 RPC Endpoint: http://localhost:8545

Deploying contracts...
Deploying contract 'Main'
Deploying contract 'Suicidal'
Deploying contract 'Suicidal'
Deploying contract 'Child'
Deploying contract 'EIP20Factory'
Deploying contract 'Grandchild'
Deploying contract 'UniswapV2Factory'

Contracts
- main => 0x71940c77ccadaeA1238CEa27674E6253128ca177
- child => 0x929bc44BBD41Ca0e621dc50f7c7E3204Ce026258
- grandChild => 0xCae819bff9B75c3D34971C19e005F2cAD7354E0f
- suicidal1 => 0x702641c70a11E480F646Ed247d078c65aBAAC5DE
- suicidal2 => 0x9a77F7b94488d24EcA50FA0d144212AE48300A71
- uniswap => 0x314F9285cbC3835e676974abDb7d2ab45ede3686
- erc20 => 0xEC9C1fCee156bf34Ba4fB5D38C9CF09Df16723eF

Transaction Links
- main => http://localhost:8080/tx/0xde86726868e1473be2935bae2cc18c40d08c6f95a87c72263bd9feef1d47e6c7
- child => http://localhost:8080/tx/0x27e234af8a8c915dc10c934ca6619e09d0411d7b9e927315ade9f475013f42f1
- grandChild => http://localhost:8080/tx/0x45440f574bb1e931b5698482d67d2791f08c7be46de33aa8c376b35d2714087d
- suicidal1 => http://localhost:8080/tx/0x2d3c0b25e1a5938da8ad735676df0c518339c5806bc65080ba371c038e9a49e5
- suicidal2 => http://localhost:8080/tx/0x031c0bcbc9a78d878f2587fff81724b1e834e8f3a60d6a5941c2a6d39f3beac4
- uniswap => http://localhost:8080/tx/0x0e06cc07e411a4d1ee0a23610c260f4f691f3e752c0f1c5c89dc9419e071c48a
- erc20 => http://localhost:8080/tx/0xa79c4dbe85ab9c5dabc40d885e8a919ba99fcbd45aaf31fabb2898536b7869fc

Performing pure 'transfer' transactions
Pushed transaction 'http://localhost:8080/tx/0xa0f7c019246761e08a3fe202d2ab466a15bbc514faadfbf812b7c656cbbf2b5b' (pure transfer: existing address with custom gas limit & price)
Pushed transaction 'http://localhost:8080/tx/0x59bba1b390bd42b23f5a33274f9fa1e61d8bb9cbabe53f9dc093c3f51a239361' (pure transfer: existing address)
Pushed transaction 'http://localhost:8080/tx/0x6242f1fbf8867e8ecbf2509e7ad1c73fa9d098de833731fe2286698a9995a6bf' (pure transfer: transfer of 0 ETH to inexistant address generates a transaction with no EVM call)
Pushed transaction 'http://localhost:8080/tx/0x95102382d2a2878f4484d5439a7ffd9419a80c1405b9f51d2dd0adb34a975c52' (pure transfer: inexistant address creates account and has an EVM call)

Performing 'transfer' through contract transactions
Pushed transaction 'http://localhost:8080/tx/0x80ed0b3dc585c79d2e62a75058b96ce09a21fa66fd4d8a60b61269864cab3b9b' (nested transfer through contract: existing addresss)
Pushed transaction 'http://localhost:8080/tx/0x3df947f58e44cb1f82bc0cbad9d17ac8bc37eba445896704ebe8b6e63da51f08' (transfer through contract: existing addresss)
Pushed transaction 'http://localhost:8080/tx/0x1a11955160b28b2a7754e71c54c61aea6a2ebb0896a2e9fb6c6d229ef4b5e3e8' (nested transfer through contract: inexistant address creates account and has an EVM call)
Pushed transaction 'http://localhost:8080/tx/0xbcf49ef547fbfadab5ae99b3b7746f43fd63aa15b6661582e0a5269564844528' (transfer through contract: inexistant address creates account and has an EVM call)

Performing 'log' transactions
Pushed transaction 'http://localhost:8080/tx/0xf2bf1db1a2ead4294dc52a5f1561ed1bafa3b7718f52a0169330c110a55c3e2c' (log: empty)
Pushed transaction 'http://localhost:8080/tx/0xb7af48031734efcd7c40817d1b49eb63dbb9956046b9a5accf03240b04bee0d1' (log: all indexed)
Pushed transaction 'http://localhost:8080/tx/0xc35829d2d0a8a58981bdd1b3178a1f9e9103b16a4179128b011d590771eb9d2b' (log: single)
Pushed transaction 'http://localhost:8080/tx/0x1d8a232c40608baf09d38fcbfe84c0cfb857456411029acee68ad13fa9671396' (log: multi)
Pushed transaction 'http://localhost:8080/tx/0xdccb4d24f97e111a83f125a8ac467f940c479763276dbbf54f6d9f0ba4e3920f' (log: all)
Pushed transaction 'http://localhost:8080/tx/0x1e5e77911d7d5e865053aa449a31803d8493364022bb5d1caa95de6424bc471b' (log: all mixed)

Performing 'storage & input' transactions
Pushed transaction 'http://localhost:8080/tx/0xc0ab4c70dfb181e13c194ba4e81b1a3dbfa2db5e1cfeb222ef62bdfcf5a5dbd2' (input: string equal 32)
Pushed transaction 'http://localhost:8080/tx/0x0fb0dca0a14cfd2ea71b5cb4793c64996289af57500729666ff65a9b67e5d4b8' (input: string longer than 32)
Pushed transaction 'http://localhost:8080/tx/0x9fa8531e47247f8abbe311280a15c3eb68b814bd3a236fa9f071ca26a770407d' (input: string equal 0)
Pushed transaction 'http://localhost:8080/tx/0x091ea9c958ce1a883f4090f5cd69c2d741f5a3861e2435c434ca43075058a35f' (input: string equal 15)
Pushed transaction 'http://localhost:8080/tx/0xe2b920020a162533ed39a51697e15b3c052f162223069cdc64e783b28d371bc4' (input: string equal 30)
Pushed transaction 'http://localhost:8080/tx/0x2102a3c129dbe55b1418c4b7307ac83437c8dd8b5e54ddbc3d965e95e08845d8' (input: string equal 31)
Pushed transaction 'http://localhost:8080/tx/0x64764e01fd5bba254fe8e2e5015c570ba6717c4d6984df336927d759cef7efcb' (storage: set long string)
Pushed transaction 'http://localhost:8080/tx/0xf7173fe7144e4ad99eaae3ba7c4c8f2e30109fc71e5b63e4ea365ab020bb831b' (storage: array update)

Performing 'call' transactions
Pushed transaction 'http://localhost:8080/tx/0x776f630f589f8fd983949eb9760159083db1b20d9612dbb47fb0ddac46f93ef1' (call: contract creation from call, with constructor)
Pushed transaction 'http://localhost:8080/tx/0x8e05eb96243dd861968c025d7e78070f7b419a4672af9e04ab7dbb1a90bcf5d4' (call: nested fail with native transfer)
Pushed transaction 'http://localhost:8080/tx/0x6d6b5ef0c9dfbac95d45263a54e777696881506cc7e464f5bccc6026a3b760a4' (call: complete call tree)
Pushed transaction 'http://localhost:8080/tx/0x1ab5f5f1c7496f47f03e79560a1823491fbe42fe1c686c5b57593af6000cdc70' (call: nested call revert state changes)
Pushed transaction 'http://localhost:8080/tx/0xcef3a4440c3da361da33373e6e3af99455569b8b660943ab3fc4a46be78a907d' (call: contract creation from call, without a constructor)
Pushed transaction 'http://localhost:8080/tx/0x4843893f2f9ecf1b14d2d485bd7192468f52295fd89c716e0aa9be3bd3341807' (call: all pre-compiled)

Performing 'gas' transactions
Pushed transaction 'http://localhost:8080/tx/0x26d0c583bdebfcec4778308e08e607f152e060cf5323abd89062e62be233e425' (gas: empty call for lowest gas)
Pushed transaction 'http://localhost:8080/tx/0x0545282ffe10c61d0f6b6488a8e4d9ad91408b37423921fe201a4cb59b6c318d' (gas: deep nested nested call for lowest gas)
Pushed transaction 'http://localhost:8080/tx/0x1da9ef80054511c135c6db39b00d8b71f70b1a0a096809f56ac369f17f97a943' (gas: deep nested low gas)
Pushed transaction 'http://localhost:8080/tx/0x0b1125ddab9c4370edacfbf916ec129206a9081d0f2f9f2e880d113bdc4fc73b' (gas: nested low gas)
Pushed transaction 'http://localhost:8080/tx/0xfd3e545e7a4ab6729bc6a4aba130925dd66900614c3834c06f6256a5a6842798' (gas: deep nested call for lowest gas)

Performing 'suicide' transactions
Pushed transaction 'http://localhost:8080/tx/0x67fa091ccb5f67ff74be7d23811de1fb8a0c9759500ab609c66f3dd5c7290174' (suicide: contract does not hold any Ether)
Pushed transaction 'http://localhost:8080/tx/0x65566a2613b9c0b2e735f633646b0a56bf0bd0a8a9e9a5973fb5c49e1bc12bed' (suicide: transfer some Ether to contract that's about to suicide itself)
Pushed transaction 'http://localhost:8080/tx/0x83715159db426d7e67f1bee074a4318a93613e47ecfdf7b6c1201fbd006f0c8b' (suicide: contract does hold some Ether, and refund owner on destruct)

Completed battlefield deployment (local)
```
