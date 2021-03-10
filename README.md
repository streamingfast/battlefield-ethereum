## Ethereum - Battlefield

A repository containing contracts and scripts to effectively testing
all aspects of our Ethereum instrumentation.

This repository assumes you have the following tool in available
globally through your terminal:

- geth (Deep mind enabled)
- yarn (1.13+)
- curl
- jq

### Running

Running the whole battlefield test set is simply a matter of
first installing script dependencies (mainly web3 to interact
with the chain):

    yarn install

Second step is to build all contracts. We uses various Docker instances
with different version of the `solc` compiler. This is all automated, if
the Docker image is not found on your machine, it will be downloaded
automatically. To compile all contracts, run:

    ./contract/build.sh

Then, you run the `generate_local.sh` script which will compile the
smart contracts, launch a miner and syncer Geth processes,
execute a bunch of transactions and collect the logs of
all this and more specially, the deep mind logs for future
analysis:

    ./bin/generate_local.sh

### Comparing New Version of Geth

If you want to ensure that a new version of our Geth Deep Mind
aware binary is valid against the previously saved valid baseline
version called the `oracle`, ensure that `geth` in your `PATH` points
to the new version to test then run:

    ./bin/compare_vs_oracle.sh

If there is any diff, you will be asked to check the differences using
`diff`.

You will also prompted to accept the changes as the new oracle data files,
which you can answer `Yes` to update the oracle with the newly generated run.

**Important** Great care must be taken when accepting a new version to ensure the
changes are correct. Think about previous versions and other supported Geth forks when
taking your decision

### Regenerating Oracle Data

When you update the battlefield transactions process by the oracle data, you will
need to accept the differences since all transaction ids will be different than before.

To re-generate, we will use the latest Geth tagged version that was known to have pass
the compare step above. By using this latest known version, we ensure to generate the
same set of deep mind logs but with extended transactions.

**Important** If you are updating the coverage to test untested part of some deep mind
instrumentation, you should manually inspect the generated logs to ensure they fit the
expectations.

Ensure that `geth` in your `PATH` points to the latest known version to work then run:

    ./bin/regenerate_oracle.sh

### Explanation

To correctly work, the process is as follow. First, all
smart contracts are compiled through an invocation of
`./contract/build.sh` script which spans a Docker
container to compile all contracts using `solc` compiler.

Then, the rough idea is to have a miner process that will
receive all transactions through RPC calls (via Web3 TypeScript
scripts found in this repository).

The miner process generate blocks for incoming transactions
and not always using a Proof of Authority network.

**FIXME** This is probably not fully simulating the Ethereum
Mainnet as there is no mining reward in this mode, we should
probably do something a bit different?

The syncer is then connected with the miner process via native
Ethereum P2P protocol. The miner `enode` id is set to a fixed
value (via the `boot/nodekey` file that is copied into the
miner data directory). The syncer has a `static-nodes.json`
file that tells it how to talk to the miner process.

The syncer then simply sync from the miner each time new
blocks are propagated through the network. The syncer is
deep mind aware and generates the deep mind log.

#### Private Keys

The current boot addresses and their respective private key are:

- Address `a3c4119cb3e8b8863ffbc8f2895ad96dfd34c559` => Private Key `1fc0f6d5b1cb394cc2c537ed24f417d29d146b958df46c6bf8a6cc7aa9a5f80b`
- Address `e3a046465d119d0cd35faaed34930ddb323b00d7` => Private Key `bfb451713ddf9e92ad21907ef12c0d0357d6e0afd6b9009d3a8c015cccad2ad8`
- Address `71089c8752f2423c0ac967712d677b10bbcf7291` => Private Key `f140a3c91ff64bfa736914cb96f68199948906761d8b3428580130f3daf59306`
- Address `0795853d36c94783226adf0860ecc22c873fffd8` => Private Key `c7f201fce5331ac5c797a9512f88e35d8a132945da380aa7ec6accad6c6d4528`
- Address `c1479b59bc69aaa678d6ae38bcd6d63408595128` => Private Key `7272d95333e12b22a889df3d03cc4db1a91d05ee6392de529858615c73f7bac6`
- Address `c524cd3859ab79232e472d721e1184b9f286c101` => Private Key `b327f85809cca492250c611bd74c7a5532043aaa616ccebd87dd6cde717510ad`
- Address `c3b23d133bdb5badc20ce5f6c8bf1830c2202f68` => Private Key `05e0c929c0d45e514db7b49482f41709c7e15a016829410972714ef0ced64727`
- Address `509ae3311881a61d2a86ff5a2d5ebe3c78d88c3e` => Private Key `42a9b088a0e86d72eec4c7394b29b6685f33a136a94ddb0ae22779eb37275243`
- Address `d70c06459f0837621ad74be1b2f364528d066ebb` => Private Key `eabfd1c8ac58986a8984163443eb6aefb79bb6947f989410d92984af0e3b444d`
- Address `dbe42dd0686c78dda413cdae7777977bf99725af` => Private Key `4ead778de9df54ce749fa38b7df97c3d664067bb5af2bfe5cf03320582786472`
