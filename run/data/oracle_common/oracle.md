## Transaction Log (Thu Nov 30 12:23:31 EST 2023)

```
Geth
Version: 1.10.1-fh2.3
Architecture: arm64
Go Version: go1.21.1
Operating System: darwin
GOPATH=
GOROOT=/opt/homebrew/Cellar/go/1.21.1/libexec
```

```
Initializing runner...
Configuration
 Network: local
 Default address: 0x821b55d8abe79bc98f05eb675fdc50dfe796b7ab
 RPC Endpoint: http://localhost:8545

Deploying contracts...
Deploying contract 'Calls'
Deploying contract 'Child'
Deploying contract 'GrandChild'
Deploying contract 'Suicidal'
Deploying contract 'Main'
Deploying contract 'Suicidal'
Deploying contract 'EIP20Factory'
Deploying contract 'UniswapV2Factory'

Contracts
- main => 0xEC9C1fCee156bf34Ba4fB5D38C9CF09Df16723eF
- calls => 0x71940c77ccadaeA1238CEa27674E6253128ca177
- child => 0x702641c70a11E480F646Ed247d078c65aBAAC5DE
- grandChild => 0x9a77F7b94488d24EcA50FA0d144212AE48300A71
- suicidal1 => 0xCae819bff9B75c3D34971C19e005F2cAD7354E0f
- suicidal2 => 0x929bc44BBD41Ca0e621dc50f7c7E3204Ce026258
- uniswap => 0x34C044506dB54D3e8966300b7CBEFBb569b02C60
- erc20 => 0x314F9285cbC3835e676974abDb7d2ab45ede3686

Transaction Links
- main => http://localhost:8080/tx/0x0c50b2a1dbb13bf1b528f1af4e41c96074234dcfad46bb4e2afd4beea86fd286
- calls => http://localhost:8080/tx/0xffffe337e93f78413ee777522b14d07cfdf629255a8dcd47fc464a7737c83501
- child => http://localhost:8080/tx/0x956404ad3482adeb7ad7eb99324c54f8bf1964aa2358fb1617a8bbce80be85de
- grandChild => http://localhost:8080/tx/0x48f111305a5a53fcfb7e1aa633a06675700e0532444b1eefa8d2449cd392dded
- suicidal1 => http://localhost:8080/tx/0xfff1df17c8b05255a16214b4ca2aa0c461d1c8509156304189f28e8b1b745d68
- suicidal2 => http://localhost:8080/tx/0x63b732dd2be3ac783c3e5f2419130e817a9daa05e79c5401b2a1d1e60d43607c
- uniswap => http://localhost:8080/tx/0xcffa5fb363d767fe72f5d52dde0ace78d125f5038d625de948a74958389778e6
- erc20 => http://localhost:8080/tx/0x41b56fc456afb55331cac0566e4fdeddf8bc8e7277173b648032bdb91cf55bb9

Performing pure 'transfer' transactions
Pushed transaction 'http://localhost:8080/tx/0x05ed6086259a23fb1bc29c762ec4115a2cacdffb194c5af5a17f7369e9e031ed' (pure transfer: existing address)
Pushed transaction 'http://localhost:8080/tx/0xb1f3b8a936eb16361e4585ff1316ac1a5ae4d60334e04912f0c078484e80ba6c' (pure transfer: transfer of 0 ETH to inexistant address generates a transaction with no EVM call)
Pushed transaction 'http://localhost:8080/tx/0x75bdff7daff3f2185fcfbb0631a75f7e9f915b1ab0dbea79b49147b35fbda83e' (pure transfer: inexistant address creates account and has an EVM call)
Pushed transaction 'http://localhost:8080/tx/0xec6ab9a187d19e7d20c80508440f9cebdb308decf08a336e7e43b66298af433c' (pure transfer: existing address with custom gas limit & price)

Performing 'transfer' through contract transactions
Pushed transaction 'http://localhost:8080/tx/0xd57e93a99a87ac8d1a83991f00d63aa54e3a886bf0a196bada3db4d7ece1f257' (transfer through contract: existing addresss)
Pushed transaction 'http://localhost:8080/tx/0xf4d62144dc544ccc301821258c6bea53842413ec13d3089567669999328d1761' (nested transfer through contract: existing addresss)
Pushed transaction 'http://localhost:8080/tx/0x6c921e6e563181961599c2d60b9a9ee10f24024e3608d84c370a1771578288d4' (nested transfer through contract: inexistant address creates account and has an EVM call)
Pushed transaction 'http://localhost:8080/tx/0xc7d386e1ffe6e74c4697a0c16eb22fed32bf3932fb0cc8cefcbce5b830ef21ca' (transfer through contract: inexistant address creates account and has an EVM call)

Performing failing 'transfer' through contract transactions
Pushed transaction 'http://localhost:8080/tx/0xcbb0ec5b5e0d1c3b0d352959fc79ded69cb0cabc02943b6eee6686788e5c9765' (transfer through contract: existing addresss correctly failed with EVM reverted without reason)

Performing 'log' transactions
Pushed transaction 'http://localhost:8080/tx/0x22535c3c15cf36385e7dbda6e601029a33b5e7a1c041b455f3049172e0ddd58c' (log: empty)
Pushed transaction 'http://localhost:8080/tx/0x958d27821839a1563038c7a8e986a6272cd0acfa2a749be33ff2f89d361a1985' (log: all indexed)
Pushed transaction 'http://localhost:8080/tx/0x65de2a20f6a818a904a924509d6e2d974d194cf3b7521184152bdf270f36baee' (log: log in sub-call that fails but top-level trx succeed)
Pushed transaction 'http://localhost:8080/tx/0x308313b8aed45548b5470fd2b5a5b4ddb9a5cc2f80112e9e51a0c4771b3b6aed' (log: multi)
Pushed transaction 'http://localhost:8080/tx/0x41782c26bce8774b043d71732d2c923f702f72f2be417a54f28e795c039b97ce' (log: single)
Pushed transaction 'http://localhost:8080/tx/0xf7aa8c4a3b969313b0a4b2cdd4280febe35d1b057f12eb03ea6427dedc0abf7b' (log: all)
Pushed transaction 'http://localhost:8080/tx/0xb983555f08e3bf5a66e074766fa113cbf1283e580a6e58bf2656d5aacf70a31f' (log: log in sub-call that succeed but top-level trx fails correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0x28a0141bdaf6ea2ed759b7bd8e9edb3b7365f719e8756ef9b060bdd53d5f9107' (log: log in top-level trx and then top-leve trx fails correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0x8dfa45a49a8292056a3231d54dd3570c5617dba65903e23e56046efa57a468f5' (log: all mixed)

Performing 'storage & input' transactions
Pushed transaction 'http://localhost:8080/tx/0x61d6504e1cd6ca3a43a6f825a3042a30ad1263d774ca561c58b2210ae1d7bcbd' (input: string equal 0)
Pushed transaction 'http://localhost:8080/tx/0x15ab9f9686cf8518ab2682c07eb10d4467f2dfbcb1840e64384cbea036d221e0' (input: string longer than 32)
Pushed transaction 'http://localhost:8080/tx/0xb6c438176be6299180d7cef620e601cb852b51c951e1e1a303458d1ecf8ace7b' (storage: set long string)
Pushed transaction 'http://localhost:8080/tx/0x8eacc4d460cd07c57a65c97a59f84efdfa8c3c3b261b4d6b90a1669a11dffa93' (input: string equal 15)
Pushed transaction 'http://localhost:8080/tx/0x33c3f8d66a42845dc0e1719cdbb561d1f2bdc5293ec641010e3e5f9805215d90' (input: string equal 31)
Pushed transaction 'http://localhost:8080/tx/0xea3323c939d911b34d0dac08c8bc145e2dd2e19208633ead5ceba8b2eeb2e0b3' (input: string equal 30)
Pushed transaction 'http://localhost:8080/tx/0xfefb2c2fc4d5bbaa5a515876f60cfa834af99cfb3da7f757d077154420dd3984' (input: string equal 32)
Pushed transaction 'http://localhost:8080/tx/0x643a094cc78a4e57598905f55d8bb60754420f5a5f8e1b4e88572cdfad8fc653' (storage: array update)

Performing 'call' & 'constructor' transactions (new contract)
Pushed transaction '' (call: contract fail just enough gas for intrinsic gas correctly failed with Returned error: intrinsic gas too low)
Pushed transaction 'http://localhost:8080/tx/0xa4f4ccf43a82cfe4ccfe83bb0ee56dd20a10768e5e8ccef2787f926f0c2fc2ea' (call: complete call tree)
Pushed transaction 'http://localhost:8080/tx/0x9678a32b8b0e9b1d6d43071419b569ae7a914ac6e3375d851362799614d3a1a3' (call: contract fail not enough gas after code_copy correctly failed with The contract code couldn't be stored, please check your gas limit.)

Performing 'call' & 'constructor' transactions
Pushed transaction '' (call: contract fail just enough gas for intrinsic gas correctly failed with Returned error: intrinsic gas too low)
Pushed transaction 'http://localhost:8080/tx/0x4debabcc3cd0ef14ecc406102c1b4e985b8a4faa908dada08e4a98c0259a869e' (call: contract creation from call, recursive constructor, second will fail correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0x9e302f3cc3f5c011d7f8230162a46eedaf5a647fe78e5bf2893405dbb5c93ffb' (call: nested call revert state changes)
Pushed transaction 'http://localhost:8080/tx/0xac012cc035d20b8d9a6998f36d7d619fd9b3a35e9852f6b9581c1cc4aaf21436' (call: nested fail with native transfer)
Pushed transaction 'http://localhost:8080/tx/0x89cf0ee60282b5f9882f146812af5fc11b3e604aa90931398fc5d3b682d8a34b' (call: contract creation from call, with constructor)
Pushed transaction 'http://localhost:8080/tx/0xe84bc21ebaeb8e65d8a865ae1574a6bfc4d8577243e1e71329a6d1f1c1f4c67d' (call: contract creation from call, without a constructor)
Pushed transaction 'http://localhost:8080/tx/0x20ea9bf5e7d6b162d559d15a2acd02626efe00f16e5b9b524685d7a49339ceac' (call: all pre-compiled)
Pushed transaction 'http://localhost:8080/tx/0x51239efbab76af044c1a34b666d8fc4b1796b0eaba38b4f8929d0f98b5684846' (call: complete call tree)
Pushed transaction 'http://localhost:8080/tx/0x506415c65a13bc2a24c969cc11be9127c64e8cca05ec02cd033b1d5a46d12d17' (call: revert failure root call correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0x054debad53e9214fa85ce6c273044f81258e44ec377a5e685caf3d01390c1ee3' (call: assert failure root call correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0xac3446e7c562c3a45f2933df3c9628643fae4c9e531251df33a1ac4e50b75c1e' (call: assert failure on child call correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0x92fc4bf467097fab2c10698be1c5aa2a46551961d69eced33a240a8e8e157301' (call: contract creation from call, with constructor that will fail correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0xb839564630ed1e3d6dcab225c3beb1c58c04e4f5b2b5cb1fa1251ab4107589ed' (call: contract with create2, succesful creation)
Pushed transaction 'http://localhost:8080/tx/0xfce2c21e43ab06e434819eea5728e087af1cec190e45a52c3aea0d4459b70375' (call: contract with create2, inner call fail due to insufficent funds (transaction succeed though))
Pushed transaction 'http://localhost:8080/tx/0x3bf34e4a25e88db3517a63ab823b2abb7148a99ec62dfda0bd6e39be3b818bad' (call: contract with create2, inner call fail due to insufficent funds then revert correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0xca855436cab713b70dce047c57c13fdec6b5d4d6d602914b1ff83cd277a42a1e' (call: contract fail not enough gas after code_copy correctly failed with The contract code couldn't be stored, please check your gas limit.)
Pushed transaction 'http://localhost:8080/tx/0x126cc003f70b0dd5c0a3caa113e000bff0820e1cb0557292b457ab155cc559c6' (call: contract with create2, inner call fail due to address already exists (transaction succeed though))
Pushed transaction 'http://localhost:8080/tx/0xc8c540749fadf44dc23a2aae23baee16fc165900d4eaf9c536d2971ed94b4a7f' (call: contract with create2, inner call fail due to address already exists then revert correctly failed with EVM reverted without reason)

Performing 'gas' transactions
Pushed transaction 'http://localhost:8080/tx/0xae8f090801a9ea7385f06861a698efb7027c02f1852c2ae8923cec376592dcf2' (gas: empty call for lowest gas)
Pushed transaction 'http://localhost:8080/tx/0x1dfcbfc35adcba85f2ba17133dcae681317864c3976a09ff00023096b8575f0e' (gas: deep nested low gas)
Pushed transaction 'http://localhost:8080/tx/0x6e1bdc0a0a862a398df56f0b776f0db6cd69c8c4997a37bfd06c05886c25277e' (gas: deep nested nested call for lowest gas)
Pushed transaction 'http://localhost:8080/tx/0xbde70c34e53ae989564f24ebc71fb264b9b0b161db3ad4baf1905a308528a92b' (gas: nested low gas)
Pushed transaction 'http://localhost:8080/tx/0x65b732adf0153cdfad076a9a776c2c8f85f817c042b3e5f070d566402f2808b2' (gas: deep nested call for lowest gas)

Performing 'suicide' transactions
Pushed transaction 'http://localhost:8080/tx/0x757c962bfc2a378562baf3f96bb2c3ec1b603aea9ea7b913baf5c589968bc744' (suicide: contract does not hold any Ether)
Pushed transaction 'http://localhost:8080/tx/0x3e3897a3eaa3931de76c9286d9bd8f13c6f8ec7991668745fdb040f34b625e0f' (suicide: create contract, kill it and try to call within same call)
Pushed transaction 'http://localhost:8080/tx/0xac0b7779dfd5de2df1e9cb5739c1f83bff068724f41c814734306549837a9262' (suicide: ensure suicidal2 bump is nonce by creating a contract (#2))
Pushed transaction 'http://localhost:8080/tx/0x1cdb5d3fc3649b5f5043de5480cc45b9745ae33fa04c22d153adb0e2fc848439' (suicide: transfer some Ether to contract suicide that's about to suicide itself)
Pushed transaction 'http://localhost:8080/tx/0xb3de669d37de70c311b299e59c52c6f28073527abbb9ccf8be670d331e665775' (suicide: create contract to fixed address (create2), kill it and try instantiate it again at same address)
Pushed transaction 'http://localhost:8080/tx/0xb70c40046229ba61ed70d347fadf1ddb4fff850226e98f587c986d4e7fc31030' (suicide: ensure suicidal2 bump is nonce by creating a contract (#1))
Pushed transaction 'http://localhost:8080/tx/0x5fa116d69c5aa3b2fa7124d4aae08b72d5e18c3ce1c6ba52c77d900461a9912f' (suicide: create contract, kill it and try to call within same call (second time to valid nonce change after suicide))
Pushed transaction 'http://localhost:8080/tx/0xecb12b3769d50227cc41286f9b8684a97aecdd16510d69885ce2f489d640811e' (suicide: contract does hold some Ether, and refund owner on destruct)
Pushed transaction 'http://localhost:8080/tx/0x644d5382e790d33fd94b5a4523ead4e6c84af0c6867d6eebbcc7a29eda6f00f7' (suicide: create contract to fixed address (create2), kill it and try instantiate it again at same address)

Completed battlefield deployment (local)
```
