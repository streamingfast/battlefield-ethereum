## Dev1 Bootstrap Log (Tue Sep 29 21:50:00 EDT 2020)

```
$ /Users/maoueh/work/dfuse/ethereum.battlefield/node_modules/.bin/ts-node src/main.ts
Configuration
 Network: local
 Default address: 0x821b55d8abe79bc98f05eb675fdc50dfe796b7ab
 RPC Endpoint: http://localhost:8545

Deploying contracts...
Deploying contract 'UniswapV2Factory'
Deploying contract 'Grandchild'
Deploying contract 'Suicidal'
Deploying contract 'Main'
Deploying contract 'Child'
Deploying contract 'EIP20Factory'
Deploying contract 'Suicidal'

Contracts
- main => 0x929bc44BBD41Ca0e621dc50f7c7E3204Ce026258
- child => 0xEC9C1fCee156bf34Ba4fB5D38C9CF09Df16723eF
- grandChild => 0x702641c70a11E480F646Ed247d078c65aBAAC5DE
- suicidal1 => 0x9a77F7b94488d24EcA50FA0d144212AE48300A71
- suicidal2 => 0x314F9285cbC3835e676974abDb7d2ab45ede3686
- uniswap => 0x71940c77ccadaeA1238CEa27674E6253128ca177
- erc20 => 0xCae819bff9B75c3D34971C19e005F2cAD7354E0f

Transaction Links
- main => https://dev1-eth.ethq.dfuse.dev/tx/0x863a5cead75595daadd2c32524ec3c5988308f67223487e78853f3675e55a217
- child => https://dev1-eth.ethq.dfuse.dev/tx/0xe61eb448238ebcaaf038d1f712a7ad8cee83933e321b815278d7dc72c987bdd9
- grandChild => https://dev1-eth.ethq.dfuse.dev/tx/0x5f30effd7b11908bb32023c74ed82e09334817bfa489e7d155ba318498e010ef
- suicidal1 => https://dev1-eth.ethq.dfuse.dev/tx/0xa1e59766fe14ab9a0aba03a4ee25c4d6a1916a279b6ed01ae40c2d251b217bab
- suicidal2 => https://dev1-eth.ethq.dfuse.dev/tx/0x81b09c95cd3b0bbe1ad41997f895400bc5b716991aa7d7c028efd638f5482538
- uniswap => https://dev1-eth.ethq.dfuse.dev/tx/0xbda611d85e6df66b4b2fe2d4edc8d518068df19bdcd1c317bda7988a7aecccb4
- erc20 => https://dev1-eth.ethq.dfuse.dev/tx/0x5f2c1ddb03b7b26c714d8c76bb2a8079aa72ce60236f1cf95890f28a6aeb084d

Performing pure 'transfer' transactions
Pushed transaction 'https://dev1-eth.ethq.dfuse.dev/tx/0x5a215c52d4626649d12dd5ba78d6c04ab43e80d6a25e61f50d091562c2b06ad3' (pure transfer: existing address)
Pushed transaction 'https://dev1-eth.ethq.dfuse.dev/tx/0x6e5d6d52ce40583093343ae3e34dbde2434619eb6183c4989dd2eb1904e10b31' (pure transfer: inexistant address creates account and has an EVM call)
Pushed transaction 'https://dev1-eth.ethq.dfuse.dev/tx/0xee11e7aa2c4b4c5b557f7f1bbd851edfb5b7198bff36d1c5e64b308664d457f0' (pure transfer: existing address with custom gas limit & price)
Pushed transaction 'https://dev1-eth.ethq.dfuse.dev/tx/0x9b7d7456d6c39b67ed28f7bee2675e1a602685d256baf0a6695bcdf661b4a1c4' (pure transfer: transfer of 0 ETH to inexistant address generates a transaction with no EVM call)

Performing 'transfer' through contract transactions
Pushed transaction 'https://dev1-eth.ethq.dfuse.dev/tx/0xbcaf8f3d07641011328a1c4227222bf003b6786b1f9dd978b8c6cb3edf325c85' (transfer through contract: existing addresss)
Pushed transaction 'https://dev1-eth.ethq.dfuse.dev/tx/0x9a6b5321cf4798a5e817f42e9aa87cf5b50ff8b5f83ccfce10c51e354a3b572a' (transfer through contract: inexistant address creates account and has an EVM call)
Pushed transaction 'https://dev1-eth.ethq.dfuse.dev/tx/0xbce4ec1880458aa03c1e760c73a37bbce04c72cf67a15a3b501d9e96f6268600' (nested transfer through contract: inexistant address creates account and has an EVM call)
Pushed transaction 'https://dev1-eth.ethq.dfuse.dev/tx/0xaf490b99c49ddbc44d975a9df73ce046d05168fbef66a030c65ada78cee431ce' (nested transfer through contract: existing addresss)

Performing 'log' transactions
Pushed transaction 'https://dev1-eth.ethq.dfuse.dev/tx/0x63a365ea877c309e6766fdb83becf42f51b401be661cd9efa0a5c31be30ee42c' (log: empty)
Pushed transaction 'https://dev1-eth.ethq.dfuse.dev/tx/0x3991ab48cc661ffc50880356799a0e63f92de2e3d9c310444a3390e8a17813ce' (log: single)
Pushed transaction 'https://dev1-eth.ethq.dfuse.dev/tx/0x88bc844133b47dead2c75332cb737c7fb6c851a462801e4018f6ecce85861d5e' (log: multi)
Pushed transaction 'https://dev1-eth.ethq.dfuse.dev/tx/0x8ed2585cec477034c530e43637b23b88e1776d27a5937f2d1b815506e7c4e750' (log: all indexed)
Pushed transaction 'https://dev1-eth.ethq.dfuse.dev/tx/0x1bb0b32cde5bf40c8f1e06c7cf91cd2ee94900f306069b8f3181918f3bc39c31' (log: all)
Pushed transaction 'https://dev1-eth.ethq.dfuse.dev/tx/0x3f38806a22b66f80646762a6320321ea658936bcff42b5c3696dab1377dde7cf' (log: all mixed)

Performing 'storage & input' transactions
Pushed transaction 'https://dev1-eth.ethq.dfuse.dev/tx/0x078dd906cc782f745380e030bd95d3e419bd8caa6b3541843d4b60ec32aad131' (input: string equal 15)
Pushed transaction 'https://dev1-eth.ethq.dfuse.dev/tx/0xa2fd91b4b9bcd463ca73d9004da39be5d7a11dd307bbc3c98f9fb78937781097' (input: string equal 0)
Pushed transaction 'https://dev1-eth.ethq.dfuse.dev/tx/0xf36b47b9a2d8e86b9fed3c435813ae7530ed8c27be3ffded42c2028aac219e07' (input: string equal 32)
Pushed transaction 'https://dev1-eth.ethq.dfuse.dev/tx/0xd84ee46c1327ae981506c83aca470275679567583c3d77233f33920d54c285f8' (input: string equal 31)
Pushed transaction 'https://dev1-eth.ethq.dfuse.dev/tx/0x169c20087ac7656758ac3ba826bde3a57646b5a83bb24f38a677acaa02273387' (input: string longer than 32)
Pushed transaction 'https://dev1-eth.ethq.dfuse.dev/tx/0xba0b1a3b99bfc1fe752f3b0b11be7c77f9bdf685cd7907f90d5554252fd8cbf5' (storage: set long string)
Pushed transaction 'https://dev1-eth.ethq.dfuse.dev/tx/0xd7c70dea3b4e645920331ce0eab1d337166476763b714aebed0efa34737fc0cc' (input: string equal 30)
Pushed transaction 'https://dev1-eth.ethq.dfuse.dev/tx/0x520e5646ad4e1876ad48cfdfc5b75a6d12f9581fa4714c4f3a2d3e86af23a232' (storage: array update)

Performing 'call' transactions
Pushed transaction 'https://dev1-eth.ethq.dfuse.dev/tx/0xbdd5435dae4a7f921c4f29eea07ac755abf6abba54fadffe1b1d2c691836173b' (call: complete call tree)
Pushed transaction 'https://dev1-eth.ethq.dfuse.dev/tx/0x88f1788a4d06999d8dd0c1e6be1606ffd0812af76f4c8b61af300c5f8fe151e1' (call: contract creation from call, without a constructor)
Pushed transaction 'https://dev1-eth.ethq.dfuse.dev/tx/0x034962197130f4314bfee2c8edfe713e888b260b8e9a8f7f8faaaf8bd8f5c71d' (call: nested call revert state changes)
Pushed transaction 'https://dev1-eth.ethq.dfuse.dev/tx/0x10402d9ffe97a1f4d62d6778194f0c3646c838a281d9092c9a14671416bcdad1' (call: contract creation from call, with constructor)
Pushed transaction 'https://dev1-eth.ethq.dfuse.dev/tx/0xa4463ceef19e4ef6f2d66fdf3a7350eda9bebfe1b77c913c16389635a799d6db' (call: nested fail with native transfer)

Performing 'gas' transactions
Pushed transaction 'https://dev1-eth.ethq.dfuse.dev/tx/0x60464c29db381b4f3d40e8f159d917aa79b867c7b26313e76434acb056eef7ef' (gas: empty call for lowest gas)
Pushed transaction 'https://dev1-eth.ethq.dfuse.dev/tx/0xa37b57bc6472a87c0d4f14a4192fca78d833176f094bf85e6536991d821fdb32' (gas: deep nested low gas)
Pushed transaction 'https://dev1-eth.ethq.dfuse.dev/tx/0xfe072822c39cb27d49c7579fab47aae1fbaf9731140492eb8037f7da8497b3fc' (gas: deep nested nested call for lowest gas)
Pushed transaction 'https://dev1-eth.ethq.dfuse.dev/tx/0x36dde8b71233b9974baaff321207edf8be1a25b13452fa1be3b1b1b65bdeb78f' (gas: nested low gas)
Pushed transaction 'https://dev1-eth.ethq.dfuse.dev/tx/0x4b2da53533d09800c8323fcb9938d584bd63abe1a8765eb84718b31c5d50180b' (gas: deep nested call for lowest gas)

Performing 'suicide' transactions
Pushed transaction 'https://dev1-eth.ethq.dfuse.dev/tx/0xfebef6abe2b128175280a1995d335434f9b75f4c7837887a76814091038d3848' (suicide: contract does not hold any Ether)
Pushed transaction 'https://dev1-eth.ethq.dfuse.dev/tx/0xb0843a2ff443ef55a795f638ee57d35fd0eb203ab2a0a862f33100b8da3d5f44' (suicide: transfer some Ether to contract that's about to suicide itself)
Pushed transaction 'https://dev1-eth.ethq.dfuse.dev/tx/0x6f3c5ace53bec2edfec6ea91af67fd3077caa44b18370ce3e2bd2dc15db3e061' (suicide: contract does hold some Ether, and refund owner on destruct)

Completed battlefield deployment (local)
```
