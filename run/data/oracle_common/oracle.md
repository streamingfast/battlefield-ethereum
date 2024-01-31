## Transaction Log (Wed Jan 24 15:24:09 EST 2024)

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
Deploying contract 'Logs'
Deploying contract 'Suicidal'
Deploying contract 'GrandChild'
Deploying contract 'Child'
Deploying contract 'Calls'
Deploying contract 'UniswapV2Factory'
Deploying contract 'EIP20Factory'
Deploying contract 'Transfers'
Deploying contract 'Suicidal'
Deploying contract 'Main'

Contracts
- main => 0xf0d54E7d8399dF98817E4bD6DDe189ABC8824E3D
- calls => 0xEC9C1fCee156bf34Ba4fB5D38C9CF09Df16723eF
- logs => 0x71940c77ccadaeA1238CEa27674E6253128ca177
- transfers => 0x34C044506dB54D3e8966300b7CBEFBb569b02C60
- child => 0x929bc44BBD41Ca0e621dc50f7c7E3204Ce026258
- grandChild => 0x9a77F7b94488d24EcA50FA0d144212AE48300A71
- suicidal1 => 0x702641c70a11E480F646Ed247d078c65aBAAC5DE
- suicidal2 => 0x410fd7B9368812207DCf674afCB5E359e1365011
- uniswap => 0xCae819bff9B75c3D34971C19e005F2cAD7354E0f
- erc20 => 0x314F9285cbC3835e676974abDb7d2ab45ede3686

Transaction Links
- main => http://localhost:8080/tx/0xa3eb90cf60276016d7102f8a14d47307d5e957797ecaa9639aabbf7c53c0c6e0
- calls => http://localhost:8080/tx/0x1c34632573a7b75ccb30902dd4e8c8e0969168162cfea17e50c15a8c8b80fa94
- logs => http://localhost:8080/tx/0xb6250a033c5e578467a6876b5c9d088ad7ccc9b6d5f3302cc0c613c0217ac7a9
- transfers => http://localhost:8080/tx/0xf20229bf882d42478bb8848774478bcc2577a874c4af6d6389203cd794714ca1
- child => http://localhost:8080/tx/0x1364b3692485aa50701d77c94a1583b8c576b59c1999fd25fd11ee5fb0953621
- grandChild => http://localhost:8080/tx/0x48f111305a5a53fcfb7e1aa633a06675700e0532444b1eefa8d2449cd392dded
- suicidal1 => http://localhost:8080/tx/0x7ef9db7b88f20a2a6f0abbbb56edced49e87124ea9bf14592335364fa4f6655d
- suicidal2 => http://localhost:8080/tx/0x48e0a79b60820779b43b28ae7eba53139cf974604f6cdaf148ac4c7601feeb85
- uniswap => http://localhost:8080/tx/0x10cda91467a48b5f485ac23dbc239505ee51956745615e27a75296cb85442617
- erc20 => http://localhost:8080/tx/0x41b56fc456afb55331cac0566e4fdeddf8bc8e7277173b648032bdb91cf55bb9

Performing pure 'transfer' transactions
Pushed transaction 'http://localhost:8080/tx/0x254f13e1ea8c651f527d1e57b0e82c433efc3e7a7a962a40d1db6c40a07a054f' (pure transfer: existing address)
Pushed transaction 'http://localhost:8080/tx/0x5ebcfbde711a7824b1ca53913c6baa9757ac0e41550e73c430dd80948f0ff69d' (pure transfer: transfer of 0 ETH to inexistant address generates a transaction with no EVM call)
Pushed transaction 'http://localhost:8080/tx/0x91d11625c7331482a047cab059b26d7440f5715303b82c003aee861751c0475a' (pure transfer: inexistant address creates account and has an EVM call)
Pushed transaction 'http://localhost:8080/tx/0xb18b5442f64ca81d7072b6ba5a3296e005c7bc0e547c6c3eeb81cf060f97e090' (pure transfer: existing address with custom gas limit & price)

Performing 'transfer' through contract transactions
Pushed transaction 'http://localhost:8080/tx/0x0ba029007c276adf3f7f678e9f3c6d0b3c95a5933841444f5d6af96d64256a9c' (transfer through contract: inexistant address creates account and has an EVM call)
Pushed transaction 'http://localhost:8080/tx/0x3fe0733a860572bab010fe051ee73f8d918021f6d68df46a54f2b7ff8613de0c' (nested transfer through contract: existing addresss)
Pushed transaction 'http://localhost:8080/tx/0xd21fd253d5d84cb52b13445feb276675df8a67205f3b2a78fce370f13bbce40a' (nested transfer through contract: inexistant address creates account and has an EVM call)
Pushed transaction 'http://localhost:8080/tx/0x018b8f7e9bf0fc71a5d80654b4418b7d7b6c7e7e1e6b2964b1e13206d9006e24' (transfer through contract: existing addresss)

Performing failing 'transfer' through contract transactions
Pushed transaction 'http://localhost:8080/tx/0x6061d9d69ddb30b3e6fa9dfd11e080c679cd6015d8bd11e67fb92b02c12c5e30' (transfer through contract: existing addresss correctly failed with EVM reverted without reason)

Performing 'log' transactions
Pushed transaction 'http://localhost:8080/tx/0x912072f23e13aa91085b3fa0338f768f36bd5512379dbeb95060380a6202ed6b' (log: empty)
Pushed transaction 'http://localhost:8080/tx/0x5ba1b908a75bf10dbd06bc320e44c8eb601784d5d9ae5d3d7c303f5c778b57df' (log: log in top-level trx and then top-leve trx fails correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0x51053827b72b50893bb302777516b9bab74199ff6a0141adf67fc8e8bcfa4a01' (log: log in sub-call that succeed but top-level trx fails correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0x9e960ea53fe5c4435da20ffc0ba64918622d9364c5b66735225195c05f1c822a' (log: log in sub-call that fails but top-level trx succeed)
Pushed transaction 'http://localhost:8080/tx/0x4a3c6b3cd0d3d65b6f78f4a7cafb169a5ddcb66a95585e531285ea8733a01e82' (log: multi)
Pushed transaction 'http://localhost:8080/tx/0xb861c00cc4264bdbb3cf316c19dfcfa275296d4750b0d488a99465d77318d5d6' (log: all)
Pushed transaction 'http://localhost:8080/tx/0x7c005d690f672200b41757132aabab4957c3e251635821c2fd7391ffd291a6c5' (log: all indexed)
Pushed transaction 'http://localhost:8080/tx/0x957642f1dce3fe955b7456a5a5f23305ec158f104c6ca4088cd2abe76fe7dc55' (log: all mixed)
Pushed transaction 'http://localhost:8080/tx/0x35230c57f775dd3928d83929d7f37c3d21d962a1101a380e02f233611c0fc0a8' (log: single)

Performing 'storage & input' transactions
Pushed transaction 'http://localhost:8080/tx/0x13a639f1dad65930ed1013b03bb0695e7592f8fb1018aefa3234f66d1067abc3' (input: string equal 31)
Pushed transaction 'http://localhost:8080/tx/0x1a6d517df559325f3385b1fc80e051cdc738ec96c75089204030853cb75f54a3' (input: string equal 15)
Pushed transaction 'http://localhost:8080/tx/0xf2c01e09d71531e6ad58894e15376dfd51755d6c7a08c4ed99b6a4f4c48509e5' (input: string equal 0)
Pushed transaction 'http://localhost:8080/tx/0x68ba675ceb5219ca4d950b3bdfae8188d5edaec47fb01632bc6b896858632bc1' (input: string equal 30)
Pushed transaction 'http://localhost:8080/tx/0x086cee170c4984fae22729ae66f7c466bc8cbbfd375c83116c0dc65c8a3f5f6f' (input: string longer than 32)
Pushed transaction 'http://localhost:8080/tx/0x92f0917abeb4b672a96c889d38d04666646fb5853c226699c3ab194bfbd000fb' (input: string equal 32)
Pushed transaction 'http://localhost:8080/tx/0x1fac17ea5f8361d4a79dd073cf593b003eca8e748db1f44556ecdb842970e0e6' (storage: set long string)
Pushed transaction 'http://localhost:8080/tx/0xffb80a92ab2a8e8ce453b26cd4f2a885408a33e1457dab320f2603e4ae8e2723' (storage: array update)

Performing 'call' & 'constructor' transactions (new contract)
Pushed transaction '' (call: contract fail just enough gas for intrinsic gas correctly failed with Returned error: intrinsic gas too low)
Pushed transaction 'http://localhost:8080/tx/0xeb2f829b8780a74c4e35fb7ca555ac4702f2ffce3d3cb94a21d9bc79722e9adc' (call: complete call tree)
Pushed transaction 'http://localhost:8080/tx/0x3a71d4ebfdeb207c526634bbc3c7851c9aa55fa4d42c035976794cbe9c1684b1' (call: contract fail not enough gas after code_copy correctly failed with The contract code couldn't be stored, please check your gas limit.)

Performing 'call' & 'constructor' transactions
Pushed transaction '' (call: contract fail just enough gas for intrinsic gas correctly failed with Returned error: intrinsic gas too low)
Pushed transaction 'http://localhost:8080/tx/0xdda2e7d89b2769812d230f26093688bb9b5193a457d107b80bc13c08d166656b' (call: delegate with value)
Pushed transaction 'http://localhost:8080/tx/0xa82b280b753dd181f532730037df18fcbe4dca412f8ea5e6823902bd7b71e066' (call: contract creation from call, without a constructor)
Pushed transaction 'http://localhost:8080/tx/0x7053de4b428e54d140d570e4c581cc304186374a4ba8ee3671f515bf451c5937' (call: nested call revert state changes)
Pushed transaction 'http://localhost:8080/tx/0x01d1f14d1ebd2379985db95a3c99f27146fa93e56e58c8ad69a65a9708389bf5' (call: all pre-compiled)
Pushed transaction 'http://localhost:8080/tx/0xbc68cbb0f94e65d0a990b83db70cb24b87ea2db8b13ceff9b22aca34b1cb1300' (call: call to a precompiled address)
Pushed transaction 'http://localhost:8080/tx/0x7a33889d623f2d4fb6062eb902e86e86d265f37656ee6fba54ea39d131131157' (call: contract with create2, succesful creation)
Pushed transaction 'http://localhost:8080/tx/0xafd4d15f5a5337d758de00341a4faf4cd932a34e7888ff3d9a205c5a3d928326' (call: contract creation from call, with constructor)
Pushed transaction 'http://localhost:8080/tx/0x1ae4d996c3b65e774ef691923551126685aaa122b6fb6111966b25f5cbc7bca1' (call: nested fail with native transfer)
Pushed transaction 'http://localhost:8080/tx/0xc3f2028468832ca1cf04aa5bbf004e0ded79aff850fd035f295949d353637a2e' (call: revert failure root call correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0x32faeca072bbb26ab2d73e0459e0b4bc3e2da8d63622cb7c424d87bc68ec9eee' (call: assert failure on child call correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0x077fd251539630884b8cad5ac2dde639fe1cf89cdb5576bd0e12d81fbfd15c10' (call: contract with create2, inner call fail due to insufficent funds (transaction succeed though))
Pushed transaction 'http://localhost:8080/tx/0xa47be3cd5b1397b3ab3b5cca3f21ccab4a163b708c1e7a56c1395da499ecac85' (call: complete call tree)
Pushed transaction 'http://localhost:8080/tx/0x04fcdedb45297bdd9d9273ac42ae9e41e7e24459a9e05cf974681f758c4873a4' (call: contract creation from call, recursive constructor, second will fail correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0x2678abba83c7eb5bac5c507768f664b9a2d3f012f84e5ff5608a736ef46e383e' (call: assert failure root call correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0xe60043deab32c189ca5016e0466da9ca5df05cf2844e9122bae858ee6b96dc79' (call: contract creation from call, with constructor that will fail correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0x4244d19737fbf838cac97bf09e8d92c83e32a3366bf4e7cb1581fcf2df146132' (call: contract with create2, inner call fail due to insufficent funds then revert correctly failed with EVM reverted without reason)
Pushed transaction 'http://localhost:8080/tx/0x0bd314073c63711807e96198b8833f5bf95011351f123224124a317a7ce475e7' (call: contract fail not enough gas after code_copy correctly failed with The contract code couldn't be stored, please check your gas limit.)
Pushed transaction 'http://localhost:8080/tx/0xf8a8d7175061044eda5cf4344c5a5c90c5190451a368721455d8e1fd45fd205f' (call: contract with create2, inner call fail due to address already exists (transaction succeed though))
Pushed transaction 'http://localhost:8080/tx/0xbbe8e3a58861504a0713fea86a8f2f83a2e6b8c136075723111614361950dfe3' (call: contract with create2, inner call fail due to address already exists then revert correctly failed with EVM reverted without reason)

Performing 'gas' transactions
Pushed transaction 'http://localhost:8080/tx/0xa9346d7e3ec00209ad502fa0f8f34a47ecffbf72547f4b187b64451c2ccff8fb' (gas: nested low gas)
Pushed transaction 'http://localhost:8080/tx/0x7e0b5c37de90204dc9350799f7d0d5214e9391c0e3b112d14c55864119f3b47b' (gas: empty call for lowest gas)
Pushed transaction 'http://localhost:8080/tx/0x3fde5ba10a8f561d5c19f030691cde2f6acae2c35aab03de1bae7461e7c020de' (gas: deep nested call for lowest gas)
Pushed transaction 'http://localhost:8080/tx/0x54f71315d762505d192f13865fdc599992e451c24ea387e7db22a54de319a8c4' (gas: deep nested nested call for lowest gas)
Pushed transaction 'http://localhost:8080/tx/0x650ee07ef07274d3177d5d05fd0c79be9d26a1d65fbde05e6d6a033087a10aee' (gas: deep nested low gas)

Performing 'suicide' transactions
Pushed transaction 'http://localhost:8080/tx/0x2e14fed3723a085282f6b525886184866c145e6eb77d111987f8035bddd8fd27' (suicide: ensure suicidal2 bump is nonce by creating a contract (#1))
Pushed transaction 'http://localhost:8080/tx/0x5fa116d69c5aa3b2fa7124d4aae08b72d5e18c3ce1c6ba52c77d900461a9912f' (suicide: create contract, kill it and try to call within same call)
Pushed transaction 'http://localhost:8080/tx/0xe572a35fbf6b097e33bc25ff59d8c50ee7fdd33a739d34922e11ed3263ee03e7' (suicide: transfer some Ether to contract suicide that's about to suicide itself)
Pushed transaction 'http://localhost:8080/tx/0x168a49a81202611354290e1594d7e4f2350f1230caea681580748e9c3fabb02d' (suicide: ensure suicidal2 bump is nonce by creating a contract (#2))
Pushed transaction 'http://localhost:8080/tx/0xfd3554a6de50bd8b906abc6b4df550f8606ee160bfc3fbbe95acaca65bac6814' (suicide: contract does not hold any Ether)
Pushed transaction 'http://localhost:8080/tx/0x9c1d3ea251e5ceb4c97489fc3a78582307805ec9d03a820f835052bdd1499c54' (suicide: create contract to fixed address (create2), kill it and try instantiate it again at same address)
Pushed transaction 'http://localhost:8080/tx/0x200ba2455e47121d4888db696e2f08953d05298de4b368956c0799d7f6f030bb' (suicide: create contract, kill it and try to call within same call (second time to valid nonce change after suicide))
Pushed transaction 'http://localhost:8080/tx/0xa405b8d74b37b55316e4299bb0e31269818ddc6a37c7644ab3ce8437423fdd46' (suicide: contract does hold some Ether, and refund owner on destruct)
Pushed transaction 'http://localhost:8080/tx/0x1006a5d654b3ced7b20e1a784d088bd7cc099321fdb353260a3cfd3927c45825' (suicide: create contract to fixed address (create2), kill it and try instantiate it again at same address)

Completed battlefield deployment (local)
```
