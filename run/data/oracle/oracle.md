## Transaction Log (Mon Mar 29 16:10:40 EDT 2021)

```
Geth
Version: 1.9.13-stable
Architecture: amd64
Protocol Versions: [65 64 63]
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
Deploying contract 'Child'
Deploying contract 'Suicidal'
Deploying contract 'EIP20Factory'
Deploying contract 'Main'
Deploying contract 'Suicidal'
Deploying contract 'GrandChild'
Deploying contract 'UniswapV2Factory'

Contracts
- main => 0x929bc44BBD41Ca0e621dc50f7c7E3204Ce026258
- child => 0x71940c77ccadaeA1238CEa27674E6253128ca177
- grandChild => 0xCae819bff9B75c3D34971C19e005F2cAD7354E0f
- suicidal1 => 0xEC9C1fCee156bf34Ba4fB5D38C9CF09Df16723eF
- suicidal2 => 0x702641c70a11E480F646Ed247d078c65aBAAC5DE
- uniswap => 0x314F9285cbC3835e676974abDb7d2ab45ede3686
- erc20 => 0x9a77F7b94488d24EcA50FA0d144212AE48300A71

Transaction Links
- main => http://localhost:8080/tx/0x8071c226b8a6899e793f8094e408d7348714647e4991aedcea76b1ba1c197bf6
- child => http://localhost:8080/tx/0x8f1ea8065402d525ed02be23749b1b8f82c7896ce4292b9fdef541da62d58c31
- grandChild => http://localhost:8080/tx/0x45440f574bb1e931b5698482d67d2791f08c7be46de33aa8c376b35d2714087d
- suicidal1 => http://localhost:8080/tx/0xdb817b0906b80b24654db5951f054aa42b2ff282bf29f0a4c37b38af6f008236
- suicidal2 => http://localhost:8080/tx/0x2d3c0b25e1a5938da8ad735676df0c518339c5806bc65080ba371c038e9a49e5
- uniswap => http://localhost:8080/tx/0x0e06cc07e411a4d1ee0a23610c260f4f691f3e752c0f1c5c89dc9419e071c48a
- erc20 => http://localhost:8080/tx/0x81ba6b83ae860362bb9a6ad202edc8a6edc33ed3803b1314a79c1a71722af4d0

Performing pure 'transfer' transactions
Pushed transaction 'http://localhost:8080/tx/0x5a215c52d4626649d12dd5ba78d6c04ab43e80d6a25e61f50d091562c2b06ad3' (pure transfer: existing address)
Pushed transaction 'http://localhost:8080/tx/0x6a5468d2774c8b7b2aab6cc582d76e0cd1e93d99ac3d5cf26e761675d62f9f0c' (pure transfer: inexistant address creates account and has an EVM call)
Pushed transaction 'http://localhost:8080/tx/0x3c974d14dbbbfd6ce4a89d02644353c699fd710ae478ba611f96e945929be018' (pure transfer: existing address with custom gas limit & price)
Pushed transaction 'http://localhost:8080/tx/0x70fb823458a16d195062f3de087c2b400833116146c1af59b09f07fd34e06447' (pure transfer: transfer of 0 ETH to inexistant address generates a transaction with no EVM call)

Performing 'transfer' through contract transactions
Pushed transaction 'http://localhost:8080/tx/0x8da4e87b1ffde3653ef05d4111ea9330e090549ba3238d5e38df38ad94f890f2' (nested transfer through contract: inexistant address creates account and has an EVM call)
Pushed transaction 'http://localhost:8080/tx/0xbcaf8f3d07641011328a1c4227222bf003b6786b1f9dd978b8c6cb3edf325c85' (transfer through contract: existing addresss)
Pushed transaction 'http://localhost:8080/tx/0xf0dbd2650d9da5ac3e149ddb74631fc50f6d2f281e4e8239937196ceae3b3943' (nested transfer through contract: existing addresss)
Pushed transaction 'http://localhost:8080/tx/0x6f27c23c3d8cc0ddab58c22f24448d9a532d3af8997e599e72b5ba076d1151c8' (transfer through contract: inexistant address creates account and has an EVM call)

Performing failing 'transfer' through contract transactions
Pushed transaction 'http://localhost:8080/tx/0x50f739f016dc5285fd0ffc338375fac9070e864d5dff2bab52cf8aa456f54b6e' (transfer through contract: existing addresss correctly failed with EVM reverted without reason)

Performing 'log' transactions
Pushed transaction 'http://localhost:8080/tx/0xe0aa8ecdac654d6a3db9466dd29fa5b71b72572cea881e3a6cb5537e1507b153' (log: empty)
Pushed transaction 'http://localhost:8080/tx/0x4d60582438494d82572cfce806119d1bfb413b6ff159b088d441082374be03f6' (log: all)
Pushed transaction 'http://localhost:8080/tx/0xdcbf285ba02d71f40d75621a8bc2d4334abcfe3338909eaa39ec664d1b4c5496' (log: single)
Pushed transaction 'http://localhost:8080/tx/0x5adfe7a19fbf5c75011ed53dd9d0ae2d0c79728fc45c105de309654d77009042' (log: all indexed)
Pushed transaction 'http://localhost:8080/tx/0xe7ee3fd8f4d17f3a90786bcc6c4ed82b1711098566ae8ec44c43d23d222c1b87' (log: all mixed)
Pushed transaction 'http://localhost:8080/tx/0x434eb27b7eaae8f4fd65a0edb679caacd7553c3e72f218f51c982bb2822515d8' (log: multi)

Performing 'storage & input' transactions
Pushed transaction 'http://localhost:8080/tx/0xd7c70dea3b4e645920331ce0eab1d337166476763b714aebed0efa34737fc0cc' (input: string equal 30)
Pushed transaction 'http://localhost:8080/tx/0xd84ee46c1327ae981506c83aca470275679567583c3d77233f33920d54c285f8' (input: string equal 31)
Pushed transaction 'http://localhost:8080/tx/0x2d4377b149393310adc28df305552fa29184f0ada59ea6b6d2c66e86b5b3b082' (input: string longer than 32)
Pushed transaction 'http://localhost:8080/tx/0x25256385eefd5bcaa7686d80f7b3846123c95955820319e55d6117a5b29f201a' (input: string equal 0)
Pushed transaction 'http://localhost:8080/tx/0x47979874a5936f9e576ffe1eda60f7cd38a17efeca3097160985451545f7dc8f' (input: string equal 15)
Pushed transaction 'http://localhost:8080/tx/0xf36b47b9a2d8e86b9fed3c435813ae7530ed8c27be3ffded42c2028aac219e07' (input: string equal 32)
Pushed transaction 'http://localhost:8080/tx/0xba0b1a3b99bfc1fe752f3b0b11be7c77f9bdf685cd7907f90d5554252fd8cbf5' (storage: set long string)
Pushed transaction 'http://localhost:8080/tx/0x4dee4a18fbab0f8eb51b4cd3077eeae0641b63a76c3b7ee76b1c72dcd98f59ad' (storage: array update)

Performing 'call' & 'constructor' transactions
Pushed transaction 'http://localhost:8080/tx/0xa6facd8cea51ac5829d6e0bfa66cb366117ded7a9ce12eccfd053b00f4d1f959' (call: nested fail with native transfer)
Pushed transaction 'http://localhost:8080/tx/0xde179ed3c71f8a7ce1d155e31bdc985b9122b0385cee6eec0b867afd23a8176f' (call: contract creation from call, with constructor)
Pushed transaction 'http://localhost:8080/tx/0x2704525138ff86015f62fd52139dcd597150ec4d4a455693d16046cc31bc7389' (call: contract creation from call, recursive constructor, second will fail correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0xab915c5d4a6bcc5f36236319bef963c18a43c29e103f0298af170f83c3e0f981' (call: all pre-compiled)
Pushed transaction 'http://localhost:8080/tx/0x54473d4be6924a599ff282fb9b5bb0504750279082efef3657a2cad16e9da8ee' (call: complete call tree)
Pushed transaction 'http://localhost:8080/tx/0x6984000da0efbec94799e635763b158a58c5ef409f587776e366e4ee30133114' (call: nested call revert state changes)
Pushed transaction 'http://localhost:8080/tx/0x59184906aa59ba1ddbf370593e455ed2ffa7b2992b16604ca741a42ada0cbc85' (call: contract creation from call, without a constructor)
Pushed transaction 'http://localhost:8080/tx/0x7804d934acbbf90670700c5e498d7fc6a0e14a4a3f2401dde01f3c68b0eff187' (call: assert failure root call correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0xc560b0acdf9dbd9ef232686992cc2ee7a9b229ac3c97b264a8a37ee7c3c77d96' (call: revert failure root call correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0x87910c023735182632cadc00c15ba93588ba00d3950b9a5e56e4e1a6aba59f78' (call: contract creation from call, with constructor that will fail correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0x052d073a990fa1546941024bc553585e293acf415805397edd446dfb0e8a0986' (call: contract fail not enough gas after code_copy correctly failed with The contract code couldn't be stored, please check your gas limit.)
Pushed transaction 'http://localhost:8080/tx/0x22098aacab30853811770f52cd137692b00644ffb29f02a50d49f24caa5ee3bc' (call: assert failure on child call correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0x69f617c84e66f45e2dd9717a7be92191d48bbf44c5f5e095dd652e4e897adc23' (call: contract fail just enough gas for intrinsic gas correctly failed with The contract code couldn't be stored, please check your gas limit.)

Performing 'gas' transactions
Pushed transaction 'http://localhost:8080/tx/0x57c9c1bb055b2eaf8a24b2e87089d8f9e8c7e5afa283d7e21c5ae071012c5295' (gas: empty call for lowest gas)
Pushed transaction 'http://localhost:8080/tx/0x4f83f5d9f79efb04957e29c199029127beaa065a3ced9c6c5574cd86646e3ff7' (gas: deep nested call for lowest gas)
Pushed transaction 'http://localhost:8080/tx/0x6dd07c8b654a12abac47a252a632fb89f3a2762040884dc107a0232919e5f888' (gas: deep nested nested call for lowest gas)
Pushed transaction 'http://localhost:8080/tx/0x881e789e717763e382a6573c6d8caaafaebefabd572bb148f2ed6a1d5a5369fe' (gas: deep nested low gas)
Pushed transaction 'http://localhost:8080/tx/0x9cca171c3dff65156c5acfa9e5c5f30280880d3c77d50690f406d43c8e8f1fa9' (gas: nested low gas)

Performing 'suicide' transactions
Pushed transaction 'http://localhost:8080/tx/0xc2dcc7370f4097bc7f4fbb7b051e34c95b9c7b8cb40bb7e92e534a043050bae5' (suicide: contract does not hold any Ether)
Pushed transaction 'http://localhost:8080/tx/0xaeb6f476f487d3a8bc46679ab6bad882d4c452e3c0a3b6b54cefa32babd6991d' (suicide: transfer some Ether to contract that's about to suicide itself)
Pushed transaction 'http://localhost:8080/tx/0x79a3697a0534f650d634a68716f3af99952c246fde49b5bc6e985e8aac9b4099' (suicide: contract does hold some Ether, and refund owner on destruct)

Completed battlefield deployment (local)
```
