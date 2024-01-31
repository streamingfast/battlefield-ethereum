## Transaction Log (Wed Jan 31 12:54:01 EST 2024)

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
Deploying contract 'Calls'
Deploying contract 'Suicidal'
Deploying contract 'Logs'
Deploying contract 'Transfers'
Deploying contract 'Main'
Deploying contract 'Child'
Deploying contract 'EIP20Factory'
Deploying contract 'UniswapV2Factory'
Deploying contract 'GrandChild'
Deploying contract 'Suicidal'

Contracts
- main => 0xEC9C1fCee156bf34Ba4fB5D38C9CF09Df16723eF
- calls => 0x71940c77ccadaeA1238CEa27674E6253128ca177
- logs => 0x9a77F7b94488d24EcA50FA0d144212AE48300A71
- transfers => 0x929bc44BBD41Ca0e621dc50f7c7E3204Ce026258
- child => 0xCae819bff9B75c3D34971C19e005F2cAD7354E0f
- grandChild => 0x410fd7B9368812207DCf674afCB5E359e1365011
- suicidal1 => 0xf0d54E7d8399dF98817E4bD6DDe189ABC8824E3D
- suicidal2 => 0x702641c70a11E480F646Ed247d078c65aBAAC5DE
- uniswap => 0x34C044506dB54D3e8966300b7CBEFBb569b02C60
- erc20 => 0x314F9285cbC3835e676974abDb7d2ab45ede3686

Transaction Links
- main => http://localhost:8080/tx/0xe51aa654727b94bcaac622f9a721258751428619342e27355e882e9b206ebdc6
- calls => http://localhost:8080/tx/0x6d1df2b548c78627cda2cba09ebeb78dfc7ff4c9ad7f9b819d27334f65cc6a6b
- logs => http://localhost:8080/tx/0xd403a86aa09eae1d5315bdab64bd2369d2da584aed2b7bb01ca1b3b44476e8c0
- transfers => http://localhost:8080/tx/0xc6aba819582738ece590e1d0415d43fb1ce454208f9a3322f8cdc0d7113df07a
- child => http://localhost:8080/tx/0x7a58a2986841efa88f7fcf8eec7be0d84c2398d489928fee1141c6cf174a2c2a
- grandChild => http://localhost:8080/tx/0x66e6defd3be475facc7a6b898ba79fdf10d2c13f93d80388995963ec73c09c17
- suicidal1 => http://localhost:8080/tx/0x51bae219b0a942836abbea674f4aee7b67c14bf52b33ae9811f838b85b012616
- suicidal2 => http://localhost:8080/tx/0x7ef9db7b88f20a2a6f0abbbb56edced49e87124ea9bf14592335364fa4f6655d
- uniswap => http://localhost:8080/tx/0xcffa5fb363d767fe72f5d52dde0ace78d125f5038d625de948a74958389778e6
- erc20 => http://localhost:8080/tx/0x41b56fc456afb55331cac0566e4fdeddf8bc8e7277173b648032bdb91cf55bb9

Performing pure 'transfer' transactions
Pushed transaction 'http://localhost:8080/tx/0xdbcfbc7bf21c25d0989dfdd51acdf6327d7428ffb16a42be5673dccaf663c1cf' (pure transfer: existing address with custom gas limit & price)
Pushed transaction 'http://localhost:8080/tx/0x254f13e1ea8c651f527d1e57b0e82c433efc3e7a7a962a40d1db6c40a07a054f' (pure transfer: existing address)
Pushed transaction 'http://localhost:8080/tx/0x794e936eee49c64af5c0d2d8c511a0753f66158896cbc0796fd43635d8995987' (pure transfer: transfer of 0 ETH to inexistant address generates a transaction with no EVM call)
Pushed transaction 'http://localhost:8080/tx/0xd72563292ffa6af55ea19708d0bf9655945e9e8a4ff468121db796794f1a3d9e' (pure transfer: inexistant address creates account and has an EVM call)

Performing 'transfer' through contract transactions
Pushed transaction 'http://localhost:8080/tx/0x70e82e61896d09f9b3d8b3c4201989a022365ec370526d464a7a60cd780fd4a3' (transfer through contract: existing addresss)
Pushed transaction 'http://localhost:8080/tx/0x0c4b3e3a05e8dfdae8a06c9cdaa1eedc437388c8e9297dd821d01070053bf0b5' (nested transfer through contract: inexistant address creates account and has an EVM call)
Pushed transaction 'http://localhost:8080/tx/0xdf5adbf9d58a7861e5ad3cae403e7d8b8583b4bafca8400d8c0112d9d2bc36d3' (transfer through contract: inexistant address creates account and has an EVM call)
Pushed transaction 'http://localhost:8080/tx/0x85b96ae3862e9b191a144b924f2e103b4d430cbf8ca4b7bf9168f947595271c2' (nested transfer through contract: existing addresss)

Performing failing 'transfer' through contract transactions
Pushed transaction 'http://localhost:8080/tx/0xba4646aeb91d24c4b76b58b5736937adcdf086afb767fa0903e5557153d5e72a' (transfer through contract: existing addresss correctly failed with EVM reverted without reason)

Performing 'log' transactions
Pushed transaction 'http://localhost:8080/tx/0x49f2ff789985688e9219dd09f902cb5b769bcaad217a388d99888de5fe292a2e' (log: single)
Pushed transaction 'http://localhost:8080/tx/0x82a756d0a47aa26a7c4e1a0a95d6a18e3240a3c3824b76ddfe8f164d52a25fe1' (log: log in sub-call that fails but top-level trx succeed)
Pushed transaction 'http://localhost:8080/tx/0x881ba1d90bc98a8c0f4c7c162bfaf7a75b3d86396ce52ccbc7e263da799eb0bf' (log: empty)
Pushed transaction 'http://localhost:8080/tx/0x0b3f96f7f199f9e1e6e15e302ace6884f183d297f6df6e6c5819f1483871e19a' (log: all mixed)
Pushed transaction 'http://localhost:8080/tx/0x9b57c5165be5dc4e997ac730990212516af0919bc714bf3a28a86c17cccb386a' (log: multi)
Pushed transaction 'http://localhost:8080/tx/0x203aaea7922b119bbefab49697e2542b0f88f7bf2e2145a6a2238de609b7135f' (log: all indexed)
Pushed transaction 'http://localhost:8080/tx/0x08e7ea7129217a00a1ad4fc27a48f2d96d06653fa40d87d768fddab2f56f7598' (log: all)
Pushed transaction 'http://localhost:8080/tx/0x6c5edbbaa95562e841736d65c657b65c1800361049997dd652ad4112df2c8067' (log: log in sub-call that succeed but top-level trx fails correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0xe494437aa18b4e866c04f52151aaed0fbcd53972c096646b11c99d5ab8a76aee' (log: log in top-level trx and then top-leve trx fails correctly failed with EVM reverted without reason)

Performing 'storage & input' transactions
Pushed transaction 'http://localhost:8080/tx/0xcf5008e2e3b15586b35a755d68e7111d27e47eeaa8a3e37bde87f51fedc3caaf' (input: string equal 30)
Pushed transaction 'http://localhost:8080/tx/0x29f0d5477bc8ff6794cabb3d64bfdb88573371f60b5e0f6772f87982f223609b' (input: string longer than 32)
Pushed transaction 'http://localhost:8080/tx/0x481b8fac8af7dc1f64e6a31fd28d0af7519b78951c259afe1730b6729bcb903c' (input: string equal 0)
Pushed transaction 'http://localhost:8080/tx/0xdd9e5b997c3097951b1e47d570d2e84fee3e90843d1068145cfc9c26fb1f5bd1' (storage: set long string)
Pushed transaction 'http://localhost:8080/tx/0x17f38d53d362596bdb8d4a54de065cca69d06e4fed5899103b32ee0259c799a2' (input: string equal 31)
Pushed transaction 'http://localhost:8080/tx/0x8eacc4d460cd07c57a65c97a59f84efdfa8c3c3b261b4d6b90a1669a11dffa93' (input: string equal 15)
Pushed transaction 'http://localhost:8080/tx/0xaf702ea809a9a26a9a6c97fd18c57b62507ec742a4e80d0098285fa9d29ac6fb' (input: string equal 32)
Pushed transaction 'http://localhost:8080/tx/0x3ea5c10249d9e63e22fa874bc7ca964c0a49ab6ebb48a0c29fe9d487903cf487' (storage: array update)

Performing 'call' & 'constructor' transactions (new contract)
Pushed transaction '' (call: contract fail just enough gas for intrinsic gas correctly failed with Returned error: intrinsic gas too low)
Pushed transaction 'http://localhost:8080/tx/0xdbab426584399f1453d24dd9aaedef37cfc8992e000ea6c9a56ac00b3fe617c4' (call: complete call tree)
Pushed transaction 'http://localhost:8080/tx/0x3a71d4ebfdeb207c526634bbc3c7851c9aa55fa4d42c035976794cbe9c1684b1' (call: contract fail not enough gas after code_copy correctly failed with The contract code couldn't be stored, please check your gas limit.)

Performing 'call' & 'constructor' transactions
Pushed transaction '' (call: contract fail just enough gas for intrinsic gas correctly failed with Returned error: intrinsic gas too low)
Pushed transaction 'http://localhost:8080/tx/0xfe0fafd961a1060493c13f8a69c384e7ffdb7c767c317d0a5b86ce9c0911a1b2' (call: complete call tree)
Pushed transaction 'http://localhost:8080/tx/0xe0efa6af01e9c90944dd99f54a5ef6cb4cbf46575c185ec5a35d28a52d199439' (call: contract creation from call, without a constructor)
Pushed transaction 'http://localhost:8080/tx/0x3b8702877e21ed96ec0f2c6d5f377918a01d4642a9966ae923a8f211f506c43d' (call: delegate with value)
Pushed transaction 'http://localhost:8080/tx/0x46cb234924f16cc5a3928263dc19294e4ae1870b0ec70f113b2a3e08bd56c2ef' (call: nested fail with native transfer)
Pushed transaction 'http://localhost:8080/tx/0xda0ae2cfa28a65d8bf69591c7179ed2e18739cf5ef24d16474cfb71a71e6e834' (call: contract creation from call, with constructor that will fail correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0x6967c87f535b5b9d54b90a8ba85d1e07a5a623763c4807e5a1d029b751e93468' (call: contract creation from call, recursive constructor, second will fail correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0x72022d4c41e059c0dd083336d815e1eafeb2344d500ffefb298b558a89645a9f' (call: assert failure root call correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0xd881a0d034fd34c44b01dff5152d58137b92bb9adc65a0388bc323c6baeb359e' (call: all pre-compiled)
Pushed transaction 'http://localhost:8080/tx/0xa65849ce7dca801050b84c6170d83575f658fb7d6507235b76e9c6754acca1df' (call: nested call revert state changes)
Pushed transaction 'http://localhost:8080/tx/0x1a48dc0bcc4d73263ae29fc7650d392c4a2914ba3d0e2b7c370a78b3f303492b' (call: revert failure root call correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0x5e2eb706e34ab456657f7aafd810dbedef7afea9092992ba4259967748582087' (call: assert failure on child call correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0x8d9d9f88efaea83bee3befc83b99a9959b2f2cd958d33473e3bd9370ee036bb2' (call: contract with create2, inner call fail due to insufficent funds (transaction succeed though))
Pushed transaction 'http://localhost:8080/tx/0x5988fd4652eeed575d363549e141289ab351944b7100fbe60e5ade245fe7fde7' (call: contract creation from call, with constructor)
Pushed transaction 'http://localhost:8080/tx/0xe1c413709695103f16f227158edac5bf32ca7aeaaf7f56355acd8039d53a4b1a' (call: call to a precompiled address)
Pushed transaction 'http://localhost:8080/tx/0xe5ac03247ea261d50a2fdf4f5693624fc0b79f59aba549017b2691d13931af41' (call: contract with create2, inner call fail due to insufficent funds then revert correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0xf95fc5ea738670e6e065f296657f7e33a3d82c0d4a952779053f3b66fbf9da25' (call: contract with create2, succesful creation)
Pushed transaction 'http://localhost:8080/tx/0x0bd314073c63711807e96198b8833f5bf95011351f123224124a317a7ce475e7' (call: contract fail not enough gas after code_copy correctly failed with The contract code couldn't be stored, please check your gas limit.)
Pushed transaction 'http://localhost:8080/tx/0x4a434f2d8af4505b63a4fdd6ee499d9ef26cdecf5d814f52a6453abe48c3b5d0' (call: contract with create2, inner call fail due to address already exists (transaction succeed though))
Pushed transaction 'http://localhost:8080/tx/0xeee94b9d5a6468553a844e92eccddeceb7ea6ba8a33c53580b1a10693d4b621a' (call: contract with create2, inner call fail due to address already exists then revert correctly failed with EVM reverted without reason)

Performing 'gas' transactions
Pushed transaction 'http://localhost:8080/tx/0x792a54cfa00a6cc5809f39568a1cbe7f29445fd908a37facc63d8f5d8e56d7e5' (gas: nested low gas)
Pushed transaction 'http://localhost:8080/tx/0x8683b234fa917b0720f287e0a8fe033c9c41d06c77262e676f63649b9f268241' (gas: deep nested nested call for lowest gas)
Pushed transaction 'http://localhost:8080/tx/0x373da11646bd93b07e81c2298a1f4908100c7b05c1b2dc3e71726715eb6be180' (gas: deep nested low gas)
Pushed transaction 'http://localhost:8080/tx/0x2d019f9f02d4c83095a6d4c6e73d55f4eff4a25c007d9df808209240947947d6' (gas: empty call for lowest gas)
Pushed transaction 'http://localhost:8080/tx/0x77fb0aec5320bc4292254a393621f60054de6e948cdf247dd1e9b87fa505937b' (gas: deep nested call for lowest gas)

Performing 'suicide' transactions
Pushed transaction 'http://localhost:8080/tx/0x1ffa24950882671ac5e76dcd446a96655ffd1315e6aabac38cf3c28f0639e95c' (suicide: create contract to fixed address (create2), kill it and try instantiate it again at same address)
Pushed transaction 'http://localhost:8080/tx/0x7e1eed1f9ae118f42f74ff355e867fd9ebe74f4cc4e28a949af2ac69e4ec8edf' (suicide: create contract, kill it and try to call within same call)
Pushed transaction 'http://localhost:8080/tx/0xa1734b5c09fd8b4ad1837451c6db14555fbcfedfaf30b1ee26359e8d6318d416' (suicide: contract does not hold any Ether)
Pushed transaction 'http://localhost:8080/tx/0x0ef28f95658894585ad2a41bb71a505ef93c4ddc1dbafa86d19dcf51df8d073f' (suicide: transfer some Ether to contract suicide that's about to suicide itself)
Pushed transaction 'http://localhost:8080/tx/0x448ad04a70b1224290ca9ffb6cd04834464496fd13a97160f56934cfbfc5bc27' (suicide: ensure suicidal2 bump is nonce by creating a contract (#1))
Pushed transaction 'http://localhost:8080/tx/0x5921c279a6a1571c500a1dcf84a02faed575a61ae19d0b5d8823bd869ce7824f' (suicide: ensure suicidal2 bump is nonce by creating a contract (#2))
Pushed transaction 'http://localhost:8080/tx/0x3caa0d5c8081858d8c35831e534c93ebc9ba8d7317bbac411dc1e3c7edcb3bff' (suicide: contract does hold some Ether, and refund owner on destruct)
Pushed transaction 'http://localhost:8080/tx/0x1bebb589239de99543f8032b2e2bd93a9f2b48b378c481ccd1530ad461f2a18c' (suicide: create contract to fixed address (create2), kill it and try instantiate it again at same address)
Pushed transaction 'http://localhost:8080/tx/0x61d3cf72818a3d14217298bb3f9e19d42784eabae097d52c48e05714e2f92209' (suicide: create contract, kill it and try to call within same call (second time to valid nonce change after suicide))
Pushed transaction 'http://localhost:8080/tx/0x3f86157e159e47e4e3f377e514dfc15798bab39fc84d7c59100f96d0ccfe3714' (call: call to a precompiled address again at the very end, to see duplicate OnNewAccount)

Completed battlefield deployment (local)
```
