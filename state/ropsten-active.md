## Ropsten Last Run Log (Fri Feb 14 13:02:26 EST 2020)

```
$ /Users/maoueh/work/eoscanada/eth-battlefield/node_modules/.bin/ts-node main.ts
Configuration
 Network: ropsten
 Default address: https://ropsten.etherscan.io/address/0xab07a50AD459B41Fe065f7BBAb866D5390e9f705
 RPC Endpoint: https://ropsten.infura.io/v3/574fd0d761184d72ab9d7d84d310e2a1
 Private key: de9d73ad72bad065d5a959827ccaf660...

Deploying contracts...
Contract main already deployed for network ropsten
Contract child already deployed for network ropsten
Contract grandChild already deployed for network ropsten
Contract suicidal1 already deployed for network ropsten
Contract suicidal2 already deployed for network ropsten
(Delete or edit file '/Users/maoueh/work/eoscanada/eth-battlefield/ropsten-deployment-state.json' to force a re-deploy to new addresses)

Contracts
- main       | 0x79F19a189068a79eC01343B8C70096114F048753
- child      | 0xd14F3a025f396518eB0fDBd5081645562EDeeD6F
- grandChild | 0xeDe28e1ce0Fc54F0aCB67aD971a4AC1b968F624D
- suicidal1  | 0x74C7a7b0Cfd2425161BCB5A529707499533ee570
- suicidal2  | 0x98DdBe02a9aa563dE8936a4BB7060aE89E9fBaba

Transaction Links
- main       | https://ropsten.ethq.app/tx/0x9dd1f2a59977103d08efb05846817da3ada48873b3a1bca999d441c597b0fd25
- child      | https://ropsten.ethq.app/tx/0x638235af6ab3703fcdbba7b645e74702792163a7ebb22c7009de2a8a2a0b6196
- grandChild | https://ropsten.ethq.app/tx/0x26778849b962f30c80bcb080424ce94478087e434e14d05e107398dacbcc7807
- suicidal1  | https://ropsten.ethq.app/tx/0x853beead7825a342d58965501cfc85930d9c8dea84e48cdd91b6141cfa58cac8
- suicidal2  | https://ropsten.ethq.app/tx/0xb73af5214d406ee2f1b857e015489cb95c83a3ed6222b4217b78fc9e94109b66

Performing pure 'transfer' transactions
Pushed transaction 'https://ropsten.ethq.app/tx/0x92b7d2b5fdc3a225db9da25a42c61feab63ddf6603cc8d77987ce295c0e51841' (pure transfer: existing address)
Pushed transaction 'https://ropsten.ethq.app/tx/0xf70e648dd72f99b83a3411c872ef8c8144e178aeadb8d94bd14c3a8684946296' (pure transfer: existing address with custom gas limit & price)
Pushed transaction 'https://ropsten.ethq.app/tx/0x8a66fdb9307c4c1cdb5b1cab91209047823ce87d34e4c086d53246cea4b3166d' (pure transfer: inexistant address creates account and has an EVM call)
Pushed transaction 'https://ropsten.ethq.app/tx/0xc95133f50ae82432761c8f4064fe2905044735e3998739fc9487355eb946e6f4' (pure transfer: transfer of 0 ETH to inexistant address generates a transaction with no EVM call)

Performing 'transfer' through contract transactions
Pushed transaction 'https://ropsten.ethq.app/tx/0x649dd2641420e703356470a81ae07fe0b58cec879e885d8fd2712fec2912e767' (transfer through contract: existing addresss)
Pushed transaction 'https://ropsten.ethq.app/tx/0xdadb83104eaa1e0affdb94eb4cba8468d58bacdd97af0f0bc515891f104a440c' (transfer through contract: inexistant address creates account and has an EVM call)
Pushed transaction 'https://ropsten.ethq.app/tx/0x97ec2bb6930da9845060b4c1a65939062d62b60d7f721d30897a8747c3ee7e20' (nested transfer through contract: existing addresss)
Pushed transaction 'https://ropsten.ethq.app/tx/0x6f9d9402d3c1cc1262fe1a93c32a958bc40b7c71a89b4ff5a6e44664ed8ab2ab' (nested transfer through contract: inexistant address creates account and has an EVM call)

Performing 'log' transactions
Pushed transaction 'https://ropsten.ethq.app/tx/0x4384973053b9232b9c4b039f49a3bcd06517fa9cbd7a68fb37ffbbb7235dd5e0' (log: empty)
Pushed transaction 'https://ropsten.ethq.app/tx/0xc74ec23e8be8cac110098813a69fe110f882322f5e9093f1b6fe645a75228806' (log: single)
Pushed transaction 'https://ropsten.ethq.app/tx/0x636cbe874a02a73df9ebb140fdfcb362bd39d4bb8377565538a041d9ba0a100f' (log: all)
Pushed transaction 'https://ropsten.ethq.app/tx/0x219c0e19ea657be8c58c97bc6fc66d04d68bfad49f7d6b28ded51d8bd0b3fd1c' (log: all indexed)
Pushed transaction 'https://ropsten.ethq.app/tx/0xf6bb6dfd0273539ad734df546cfba217d9bf9638468323021ec090cb4a650441' (log: all mixed)
Pushed transaction 'https://ropsten.ethq.app/tx/0xc162389bb1cf11cf34cedc8528497a982b6e1cde917447bbfd86c8917c72c38e' (log: multi)

Performing 'storage & input' transactions
Pushed transaction 'https://ropsten.ethq.app/tx/0x0b7c17e692f9220e6e3720cc2c50233802f2ff6c9b49151894bcf096dcd16717' (storage: long string)
Pushed transaction 'https://ropsten.ethq.app/tx/0xed75025b5d71b99c7c45327f441bb337739a04443d574a330822dd1b9b28cc5d' (storage: array update)
Pushed transaction 'https://ropsten.ethq.app/tx/0x74b9554595faea99f11f5310c086acaec4686ef94b30466f966d67071b228b65' (storage: long string input)

Performing 'call' transactions
Pushed transaction 'https://ropsten.ethq.app/tx/0x36912027ac2ea3391bba2ff195b6fd1e332055ee61f6a2e5cd0eac4c3a039393' (call: complete call tree)
Pushed transaction 'https://ropsten.ethq.app/tx/0x63b91a4369e27ff4c4642f5eece712dd0182b9ec723310ed04bd31c63324fdf0' (call: contract creation from call, without a constructor)
Pushed transaction 'https://ropsten.ethq.app/tx/0x39ad4f1d62a0f6d2d0bbc074fce1e6a86eaad67cd8b68ac7283d1a69b09c9bef' (call: contract creation from call, with constructor)
Pushed transaction 'https://ropsten.ethq.app/tx/0x7fc91aad48907b5b7cd80e9124816e19f187d34d8dea113e706922455890661d' (call: nested fail with native transfer)
Pushed transaction 'https://ropsten.ethq.app/tx/0xb00e1eaea83ae11661badc2b417fc930e1aa14e5e018ed91c2cb52de5cb70855' (call: nested call revert state changes)

Performing 'gas' transactions
Pushed transaction 'https://ropsten.ethq.app/tx/0x40bf9f2d4426877ad6de294b774140a61da02919f06bbac0c6189407f90c760a' (gas: empty call for lowest gas)
Pushed transaction 'https://ropsten.ethq.app/tx/0xcc4a9bc9edac2f1afd05a8e111daec3dc5d8f9d6f5af2d2155d199f0d3a46d69' (gas: nested low gas)
Pushed transaction 'https://ropsten.ethq.app/tx/0x19b8eb816d3cc5504b9d3a19ae58475a25fab66f749848a6b4f63d7c6c245722' (gas: deep nested nested call for lowest gas)
Pushed transaction 'https://ropsten.ethq.app/tx/0x8d8760c63c0d37bda1bc1f7724ff0115e037f75403a8c72d41556c1c167876b1' (gas: deep nested low gas)
Pushed transaction 'https://ropsten.ethq.app/tx/0x7950d2fb434de91a01faf77ff570821461a40947178c1ecb240c9049bc12ee9f' (gas: deep nested call for lowest gas)

Performing 'suicide' transactions
Pushed transaction 'https://ropsten.ethq.app/tx/0x4d26d2c106b775b09aa93ba47221677ff702fab9efeb550aef457d1a05839fe9' (suicide: contract does not hold any Ether)
Pushed transaction 'https://ropsten.ethq.app/tx/0xcbf6d861f475b268ac915bb79088520dfaafe9a03527b9cc2dbc12ec4f308d17' (suicide: transfer some Ether to contract that's about to suicide itself)
Pushed transaction 'https://ropsten.ethq.app/tx/0x50b154bba6234d00f57606c35d7b16460a5e614a9a7c3e8166bece0ab5b53f18' (suicide: contract does hold some Ether, and refund owner on destruct)

Completed battlefield deployment (ropsten)
```
