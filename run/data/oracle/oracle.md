## Transaction Log (Tue Mar  9 11:12:07 EST 2021)

```
$ /Users/maoueh/work/dfuse/ethereum.battlefield/node_modules/.bin/ts-node src/main.ts
Configuration
 Network: local
 Default address: 0x821b55d8abe79bc98f05eb675fdc50dfe796b7ab
 RPC Endpoint: http://localhost:8545

Deploying contracts...
Deploying contract 'Main'
Deploying contract 'Suicidal'
Deploying contract 'EIP20Factory'
Deploying contract 'UniswapV2Factory'
Deploying contract 'Suicidal'
Deploying contract 'Grandchild'
Deploying contract 'Child'

Contracts
- main => 0x71940c77ccadaeA1238CEa27674E6253128ca177
- child => 0x314F9285cbC3835e676974abDb7d2ab45ede3686
- grandChild => 0xCae819bff9B75c3D34971C19e005F2cAD7354E0f
- suicidal1 => 0xEC9C1fCee156bf34Ba4fB5D38C9CF09Df16723eF
- suicidal2 => 0x702641c70a11E480F646Ed247d078c65aBAAC5DE
- uniswap => 0x929bc44BBD41Ca0e621dc50f7c7E3204Ce026258
- erc20 => 0x9a77F7b94488d24EcA50FA0d144212AE48300A71

Transaction Links
- main => http://localhost:8080/tx/0xde86726868e1473be2935bae2cc18c40d08c6f95a87c72263bd9feef1d47e6c7
- child => http://localhost:8080/tx/0xf1f2c8f4d4c211061e747438182e09d45dc603e4bf43f2c7fee157a638399446
- grandChild => http://localhost:8080/tx/0x45440f574bb1e931b5698482d67d2791f08c7be46de33aa8c376b35d2714087d
- suicidal1 => http://localhost:8080/tx/0xdb817b0906b80b24654db5951f054aa42b2ff282bf29f0a4c37b38af6f008236
- suicidal2 => http://localhost:8080/tx/0x2d3c0b25e1a5938da8ad735676df0c518339c5806bc65080ba371c038e9a49e5
- uniswap => http://localhost:8080/tx/0xe43f8b2bdc21a2bce06d2f9a87d889413cb6e9c67a374dde08d4200efef0484c
- erc20 => http://localhost:8080/tx/0x81ba6b83ae860362bb9a6ad202edc8a6edc33ed3803b1314a79c1a71722af4d0

Performing pure 'transfer' transactions
Pushed transaction 'http://localhost:8080/tx/0x5a215c52d4626649d12dd5ba78d6c04ab43e80d6a25e61f50d091562c2b06ad3' (pure transfer: existing address)
Pushed transaction 'http://localhost:8080/tx/0xec6ab9a187d19e7d20c80508440f9cebdb308decf08a336e7e43b66298af433c' (pure transfer: existing address with custom gas limit & price)
Pushed transaction 'http://localhost:8080/tx/0x667fbef6cf7aa13de74674ade777e6076cd5af4051985f21fb12cd5c5bd4cb73' (pure transfer: inexistant address creates account and has an EVM call)
Pushed transaction 'http://localhost:8080/tx/0x577ceccb97446b37804382f27d7a795e3f5dc3797767fc3c5c597f286b2c2cef' (pure transfer: transfer of 0 ETH to inexistant address generates a transaction with no EVM call)

Performing 'transfer' through contract transactions
Pushed transaction 'http://localhost:8080/tx/0xd148bf29e414472c8e2fb42d6f8086482748cace2559f74dad685c9103788e30' (nested transfer through contract: existing addresss)
Pushed transaction 'http://localhost:8080/tx/0xe250f5af57772e6b7c2b3c157400f4c8270224bb0d97f8749d06bd58eaea3fa4' (transfer through contract: existing addresss)
Pushed transaction 'http://localhost:8080/tx/0x3906c85d86d459cb10d2bb4fe813f6d12c83306839b2953363ba0bc55a0b946d' (transfer through contract: inexistant address creates account and has an EVM call)
Pushed transaction 'http://localhost:8080/tx/0xe67537be0cf5c8ec11e7fec4fdd723d5876a03bcc78fe101d8965f76140ffc51' (nested transfer through contract: inexistant address creates account and has an EVM call)

Performing 'log' transactions
Pushed transaction 'http://localhost:8080/tx/0x7d7a28c2409c7d2be0a3876082658eec900fbc2b1b9e648b5ec53e424267297f' (log: single)
Pushed transaction 'http://localhost:8080/tx/0x72e310b333325b2859f0665e9b9154778fd3d047e3afb7df00d2763d3de1e97e' (log: all indexed)
Pushed transaction 'http://localhost:8080/tx/0x1d8a232c40608baf09d38fcbfe84c0cfb857456411029acee68ad13fa9671396' (log: multi)
Pushed transaction 'http://localhost:8080/tx/0x2b85324f8579b5ab3ce66663b126a760cf1dcf00790de14fe61777e6e862f4d3' (log: all mixed)
Pushed transaction 'http://localhost:8080/tx/0xf2bf1db1a2ead4294dc52a5f1561ed1bafa3b7718f52a0169330c110a55c3e2c' (log: empty)
Pushed transaction 'http://localhost:8080/tx/0xdccb4d24f97e111a83f125a8ac467f940c479763276dbbf54f6d9f0ba4e3920f' (log: all)

Performing 'storage & input' transactions
Pushed transaction 'http://localhost:8080/tx/0x2102a3c129dbe55b1418c4b7307ac83437c8dd8b5e54ddbc3d965e95e08845d8' (input: string equal 30)
Pushed transaction 'http://localhost:8080/tx/0x031e5707437fdb41d1d5a5f50227d3324e8f00ec53877c3dbe1fcf5b164d9463' (input: string equal 31)
Pushed transaction 'http://localhost:8080/tx/0x133377a50b90b0a4de41b2ad9b41c645d9b4dd665da0d787561a992aba1d551a' (input: string equal 32)
Pushed transaction 'http://localhost:8080/tx/0x9fa8531e47247f8abbe311280a15c3eb68b814bd3a236fa9f071ca26a770407d' (input: string equal 0)
Pushed transaction 'http://localhost:8080/tx/0xdce8d2244e96ca2852df3de0c437a049b1d4f49081bf78291c4b412f8662d6ef' (input: string longer than 32)
Pushed transaction 'http://localhost:8080/tx/0x091ea9c958ce1a883f4090f5cd69c2d741f5a3861e2435c434ca43075058a35f' (input: string equal 15)
Pushed transaction 'http://localhost:8080/tx/0x8f6f0efd20fdb8ed2ce472607948ba8d675a7db7ddea578786cee4330e44e992' (storage: set long string)
Pushed transaction 'http://localhost:8080/tx/0xf7173fe7144e4ad99eaae3ba7c4c8f2e30109fc71e5b63e4ea365ab020bb831b' (storage: array update)

Performing 'call' transactions
Pushed transaction 'http://localhost:8080/tx/0x9acba1fe4c64f38c36a06969f0b0af014aac52e68a431302b856866c55e62e6e' (call: contract creation from call, without a constructor)
Pushed transaction 'http://localhost:8080/tx/0x526c78a23832528e6fd57ea102af1913fb3c5ebda79b6e6fdb7ccf78e9b0f4db' (call: complete call tree)
Pushed transaction 'http://localhost:8080/tx/0xb36de3d6def49dec91c6633b4f68c2a60f40f90afdc2697076174aa8082783b4' (call: nested fail with native transfer)
Pushed transaction 'http://localhost:8080/tx/0xce156f7319050ea7bd2dff58f5cf9cf45bd2cd9e8b4e06481f3d7d16b2db83f2' (call: contract creation from call, with constructor)
Pushed transaction 'http://localhost:8080/tx/0x4517e9bad10734f9a0c49bf4245efa798f57b14756ad6c932b375c7046c63501' (call: nested call revert state changes)
Pushed transaction 'http://localhost:8080/tx/0xf4704241df13f91c8dccf1cb5a8a88a539fa1b554a699614f43820b53cf054a0' (call: all pre-compiled)

Performing 'gas' transactions
Pushed transaction 'http://localhost:8080/tx/0x26d0c583bdebfcec4778308e08e607f152e060cf5323abd89062e62be233e425' (gas: empty call for lowest gas)
Pushed transaction 'http://localhost:8080/tx/0xffbac6389819b26e377ee16cf3d6921a7c631560e897fc056bfdaf98490c7be7' (gas: deep nested low gas)
Pushed transaction 'http://localhost:8080/tx/0x205dff68e7c70f53d726dc47664407515945a45c21aa9dc43be4ddbd5713b443' (gas: deep nested nested call for lowest gas)
Pushed transaction 'http://localhost:8080/tx/0x55200c16183265b87f0c2925814e94520a39f77f18d089386f99db2ca217c011' (gas: nested low gas)
Pushed transaction 'http://localhost:8080/tx/0x80322c7cb17e5d4a822d63168cbac912bcd80a58030c86ffa6b6b803ed7080c7' (gas: deep nested call for lowest gas)

Performing 'suicide' transactions
Pushed transaction 'http://localhost:8080/tx/0x332163ed0983a5e729f634abf1eca33819124b05f0c3763c400504c4db2ea0b7' (suicide: contract does not hold any Ether)
Pushed transaction 'http://localhost:8080/tx/0xd05133d3f842831d6919e3c6db3403619b3fedcfcbbb01cafe9dc7fd35f7f609' (suicide: transfer some Ether to contract that's about to suicide itself)
Pushed transaction 'http://localhost:8080/tx/0x37830eb21b8fa31f62f4c7918901c2fd14f7f3cbcf3a54bebd4392bc481f8586' (suicide: contract does hold some Ether, and refund owner on destruct)

Completed battlefield deployment (local)
```
