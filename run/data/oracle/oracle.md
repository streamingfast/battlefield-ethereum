## Transaction Log (Wed Mar 31 15:29:15 EDT 2021)

```
Geth
Version: 1.9.10-stable
Architecture: amd64
Protocol Versions: [64 63]
Go Version: go1.15.5
Operating System: darwin
GOPATH=/Users/maoueh/work
GOROOT=/usr/local/Cellar/go/1.15.5/libexec
```

```
$ /Users/maoueh/work/dfuse/ethereum.battlefield/node_modules/.bin/ts-node src/main.ts
Configuration
 Network: local
 Default address: 0x821b55d8abe79bc98f05eb675fdc50dfe796b7ab
 RPC Endpoint: http://localhost:8545

Deploying contracts...
Deploying contract 'GrandChild'
Deploying contract 'Child'
Deploying contract 'Suicidal'
Deploying contract 'Suicidal'
Deploying contract 'UniswapV2Factory'
Deploying contract 'EIP20Factory'
Deploying contract 'Main'

Contracts
- main => 0x314F9285cbC3835e676974abDb7d2ab45ede3686
- child => 0x702641c70a11E480F646Ed247d078c65aBAAC5DE
- grandChild => 0x71940c77ccadaeA1238CEa27674E6253128ca177
- suicidal1 => 0x929bc44BBD41Ca0e621dc50f7c7E3204Ce026258
- suicidal2 => 0x9a77F7b94488d24EcA50FA0d144212AE48300A71
- uniswap => 0xEC9C1fCee156bf34Ba4fB5D38C9CF09Df16723eF
- erc20 => 0xCae819bff9B75c3D34971C19e005F2cAD7354E0f

Transaction Links
- main => http://localhost:8080/tx/0xad64d0aaa1ac251a2f2b96a2d8a381c6cff6e3074bce756fefaf9fae5823bc13
- child => http://localhost:8080/tx/0xd264d659f4fbb2cb8c777f7d7732b25d9cc4fb040ed5164542b147629f9a3834
- grandChild => http://localhost:8080/tx/0xf20c4598f6a67d8b8b2403a1b7d6771d17a060f4c3c2838f1152bc08e52cac6d
- suicidal1 => http://localhost:8080/tx/0xa8115d64eb1975d8f4e86d7c46c2b1a2232e78a82ffded66f4ee28680f5cf000
- suicidal2 => http://localhost:8080/tx/0x031c0bcbc9a78d878f2587fff81724b1e834e8f3a60d6a5941c2a6d39f3beac4
- uniswap => http://localhost:8080/tx/0x846545936f239c675b6f253ecba2d375c60a4d43ba0bed64b133f6868e2b2757
- erc20 => http://localhost:8080/tx/0x5f2c1ddb03b7b26c714d8c76bb2a8079aa72ce60236f1cf95890f28a6aeb084d

Performing pure 'transfer' transactions
Pushed transaction 'http://localhost:8080/tx/0x5a215c52d4626649d12dd5ba78d6c04ab43e80d6a25e61f50d091562c2b06ad3' (pure transfer: existing address)
Pushed transaction 'http://localhost:8080/tx/0xec6ab9a187d19e7d20c80508440f9cebdb308decf08a336e7e43b66298af433c' (pure transfer: existing address with custom gas limit & price)
Pushed transaction 'http://localhost:8080/tx/0xe87498f857dd4b59caabf1e44acff923640ae1c85a450543780103352a136fc4' (pure transfer: inexistant address creates account and has an EVM call)
Pushed transaction 'http://localhost:8080/tx/0xfa5fd01cee351d590ecf1e9b2e4da96dea8dc7c94d7b7a6256192177ba219a27' (pure transfer: transfer of 0 ETH to inexistant address generates a transaction with no EVM call)

Performing 'transfer' through contract transactions
Pushed transaction 'http://localhost:8080/tx/0xcd64315839ee8fb239d10d60221832fbf4ead3010cb7099ce53285b3e8d721c9' (transfer through contract: existing addresss)
Pushed transaction 'http://localhost:8080/tx/0xfc3f1b4b6e6db6e634826370b3af3c953a43daccdb5e035028acaef8172a385a' (transfer through contract: inexistant address creates account and has an EVM call)
Pushed transaction 'http://localhost:8080/tx/0x99c2e8b96d3e5f3ab8da61a6ce4e901ab305e32b920f1b00b92f69b4cd7dd3fd' (nested transfer through contract: existing addresss)
Pushed transaction 'http://localhost:8080/tx/0x764bcda47407bdb64e496815ecddcaf3f8da3ad193bd0ccc4603bd06c893bdc8' (nested transfer through contract: inexistant address creates account and has an EVM call)

Performing failing 'transfer' through contract transactions
Pushed transaction 'http://localhost:8080/tx/0x778f290a439aefa6bdf01da4af175e85d19e615bf868b84d21b61b30a2a570f5' (transfer through contract: existing addresss correctly failed with EVM reverted without reason)

Performing 'log' transactions
Pushed transaction 'http://localhost:8080/tx/0x57f29ca7272d26bbef44a941c22334789da375eedc4e963d19695556505031c6' (log: empty)
Pushed transaction 'http://localhost:8080/tx/0x59d5865a2cc6f3b7cc396c989d04f39740c9ccc702fe2c3b8e486f3e4585189f' (log: all mixed)
Pushed transaction 'http://localhost:8080/tx/0x45c17b3efbcc7c25ebb9c38e815aa75900c8f3b8a0b9757237adf9cd240c998b' (log: all indexed)
Pushed transaction 'http://localhost:8080/tx/0x527784b5e69a5c2acca1fc4cb45eec0268cdb350d4ba05ca739f7e4423052929' (log: single)
Pushed transaction 'http://localhost:8080/tx/0x788a1803b209225850bb897d16a0cfbf3365e8995e9873fb2395da533d059833' (log: multi)
Pushed transaction 'http://localhost:8080/tx/0x1a1975ccffdb80b87df680fc25162990c2afc928e3037d76be3b563efe4f7bce' (log: all)

Performing 'storage & input' transactions
Pushed transaction 'http://localhost:8080/tx/0x099882210325774de5ddb361e387c00811ef58eacb705e17f013f544ffa4cebb' (input: string equal 15)
Pushed transaction 'http://localhost:8080/tx/0x448a769712b6492f47bcedfab00bfde8cf35e86d6d4757f38896bf2938633f60' (input: string equal 30)
Pushed transaction 'http://localhost:8080/tx/0x5596e751166e79d8492353afaa8fa2d599e5e16a25ea22ec6233f5976c019b16' (storage: set long string)
Pushed transaction 'http://localhost:8080/tx/0x41c434843aad5f100291aabc40f86cd85c4668c95db2b7e62329205687f49702' (input: string longer than 32)
Pushed transaction 'http://localhost:8080/tx/0x8b8cc19f39922de621c25288f341967952c1de691f2d140d0ab19061baad37b4' (input: string equal 31)
Pushed transaction 'http://localhost:8080/tx/0xdb5bdca2d50e746aeacb3a00bb48266ecd6f3b6a6d4acd780bb3ca14d1528b41' (input: string equal 32)
Pushed transaction 'http://localhost:8080/tx/0x1777a07a3c88e399a82cff6f32d08abd03b175d0539d347e7245bdff7338692d' (input: string equal 0)
Pushed transaction 'http://localhost:8080/tx/0x16ec32dc10a507d540d57a0663b9c8c343166a9e752b13e6f550d0a9901e9ce9' (storage: array update)

Performing 'call' & 'constructor' transactions
Pushed transaction 'http://localhost:8080/tx/0x37d35a2298f674899cb68da7f73908c63d9b4a17bea8f9046bf20e6950377a54' (call: contract creation from call, without a constructor)
Pushed transaction 'http://localhost:8080/tx/0x059fa7842d98d25b10a765c65f50448aac299c4a473bf62782a9db7e9f1f71c0' (call: contract creation from call, with constructor)
Pushed transaction 'http://localhost:8080/tx/0xc910ce064ad8a2fb27c4a1355233e7aa5d0d6787d7d01b47f45d5cb856649d08' (call: contract creation from call, recursive constructor, second will fail correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0xb5bef9939023f5cc2f6b6130935e81ffaa21b68d742b687bc8578205038fdfce' (call: contract creation from call, with constructor that will fail correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0x9c38586bb618673b38024b54eba4b5bb4f6d137a4431912f7729747e8f5e4ce5' (call: nested fail with native transfer)
Pushed transaction 'http://localhost:8080/tx/0x6b5830a55af920e2f1cb41a0de3cdffff34d1865eaa016daaff6d54305452e44' (call: nested call revert state changes)
Pushed transaction 'http://localhost:8080/tx/0x27a0d75f0d0ca0bfd5300c734c57ae9c3a10f3407fdcaa43e09a9bcb9911bd8f' (call: all pre-compiled)
Pushed transaction 'http://localhost:8080/tx/0x286522fc1e97154e66c0b62a144558d1875d6c2aa5d08d48ed9df8fcccf45ed5' (call: complete call tree)
Pushed transaction 'http://localhost:8080/tx/0x1e072288e9c81876595a8d19cede0717e51131112d4cf740e5d44b0afc8daee3' (call: contract with create2, inner call fail due to insufficent funds (transaction succeed though))
Pushed transaction 'http://localhost:8080/tx/0xb9d3dd71781f7c4aeed9ee00d8b592cb3c977768ea1590f796f13d99392e92b5' (call: assert failure root call correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0x6cbec29fda043e5e2b821eb9d30e89d5a55e0118dd6a77e77adc6420aa67ad0a' (call: assert failure on child call correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0x140c3e2a23bdb1270116fe45bac60051e7fcc3146c179543dcf420121b45e9a1' (call: contract with create2, succesful creation)
Pushed transaction 'http://localhost:8080/tx/0x6ddb1f706439032b43c00836c63c7b98c5fa26a83935960d6581e2c0d89adeca' (call: revert failure root call correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0x69d03812174cc270095b14313f6c2da41e676c3809213d1db971036cf00e5be8' (call: contract with create2, inner call fail due to insufficent funds then revert correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0x87b1cf1487fc03652e3bf192d22d08040fa694032d6319ddd4bf407694898f47' (call: contract fail just enough gas for intrinsic gas correctly failed with The contract code couldn't be stored, please check your gas limit.)
Pushed transaction 'http://localhost:8080/tx/0x947e9c54a85b7265284b572cbd3f6cb29c56ddb0ed452b63857d3a2b30821fed' (call: contract fail not enough gas after code_copy correctly failed with The contract code couldn't be stored, please check your gas limit.)
Pushed transaction 'http://localhost:8080/tx/0x541ec1da8ab3395167be73d939d535d7bc039d56f9b694b4699511a18465a0b5' (call: contract with create2, inner call fail due to address already exists (transaction succeed though))
Pushed transaction 'http://localhost:8080/tx/0x3e2b2ff4333706043d0ecb6ca907e86955899b334acacc024db143f55c4e3be0' (call: contract with create2, inner call fail due to address already exists then revert correctly failed with EVM reverted without reason)

Performing 'gas' transactions
Pushed transaction 'http://localhost:8080/tx/0x5af34af6fc0cd006eef15abf6386a7da3de841c2b6c3cae946e611932fe1cfae' (gas: empty call for lowest gas)
Pushed transaction 'http://localhost:8080/tx/0x94bc7c5cb61572f8005fadbdb0975f61af9ca8bc7fdd3764d76551c0af872260' (gas: nested low gas)
Pushed transaction 'http://localhost:8080/tx/0x3f9ed2846073e0734410dc7a5b077477582f8fa35360379fbf421f0bf6d59da0' (gas: deep nested nested call for lowest gas)
Pushed transaction 'http://localhost:8080/tx/0x16785f2e8c695beff82ac46422af136e169bc37f5aee499c04aa52e4ae9631dd' (gas: deep nested low gas)
Pushed transaction 'http://localhost:8080/tx/0x091dcb52b0cd5cf954f91237a9fcb82a2980e9033b59f986add71d8c532487fc' (gas: deep nested call for lowest gas)

Performing 'suicide' transactions
Pushed transaction 'http://localhost:8080/tx/0xc3e5ead695eae21a832753b79646df64a6540a28b35248c4156d1a7f50b59fba' (suicide: contract does not hold any Ether)
Pushed transaction 'http://localhost:8080/tx/0x8b5e7e3d9a2d9d0ec1f8802f667b271068b80cb2b5593fb09ca9062e7a3882d4' (suicide: transfer some Ether to contract that's about to suicide itself)
Pushed transaction 'http://localhost:8080/tx/0x06d0fa237690354b582e2a4b29428cb6924e4b63ba9f9f3dfbc9b66cf4da1950' (suicide: contract does hold some Ether, and refund owner on destruct)

Completed battlefield deployment (local)
```
