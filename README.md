# Firehose Ethereum Battlefield

This repository contains an Hardhat project and scripts to test the various Firehose Ethereum integrations we support. It contains Solidity smart contracts and test cases that exercises all corner cases of tracing an Ethereum node.

Install dependencies:

```bash
pnpm install
```

Ensure you have `node` version 20 or more recent as as the chain's binary compiled on your machine. Review [Dependencies](#dependencies) section to determine which tool you need to have locally for the commands below to work.

## Run Test Suite

- Launch Firehose instance using `geth --dev` model (requires [geth](#build-firehose-geth) and [fireeth](#get-fireeth) to be available locally) in a terminal by running:

  ```bash
  ./scripts/run_firehose_geth_dev.sh 2.3
  ```

  This launches the Geth node and Firehose tracer version 2.3, change `2.3` to `3.0` to run Geth node and Firehose tracer version 3.0 instead.

- Launch the test suite:

  ```bash
  pnpm test:fh2.3:geth-dev
  ```

Ensure that you run match command above with the Firehose Tracer Version you use when launching `./scripts/run_firehose_geth_dev.sh` as well
as for the chain your are testing against. See below for chain details and how you should launch the chain and the corresponding tests.

### Chain Tests

Battlefield supports testing across various forks of Ethereum. Usually, you need to run the specific tests, here the list of currently supported/known chain and how to test them:

| Chain                   | Firehose Launcher                                                                         | Tests Launcher                             | Notes                                                                     |
|-------------------------|-------------------------------------------------------------------------------------------|--------------------------------------------| ------------------------------------------------------------------------- |
| Ethereum (Firehose 2.3) | `./scripts/run_firehose_geth_dev.sh 2.3 cancun`                                           | `pnpm test:fh2.3:geth-dev`                 | None                                                                      |
| Ethereum (Firehose 3.0) | `./scripts/run_firehose_geth_dev.sh 3.0 prague`                                           | `pnpm test:fh3.0:geth-dev`                 | None                                                                      |
| Arbitrum                | `./scripts/run_firehose_geth_dev.sh 2.3 cancun`                                           | `pnpm test:fh2.3:arbitrum-geth-dev`        | None                                                                      |
| Optimism                | `./scripts/run_firehose_geth_dev.sh 3.0 prague`                                           | `pnpm test:fh3.0:optimism-geth-dev`        | None                                                                      |
| Sei                     | `./scripts/run_firehose_sei.sh sequential`                                                | `pnpm test:fh3.0:sei-dev`                  | The `sequential` tag refers to transaction execution algorithm, test both |
| Sei                     | `./scripts/run_firehose_sei.sh parallel`                                                  | `pnpm test:fh3.0:sei-dev`                  | The `parallel` tag refers to transaction execution algorithm, test both   |
| BNB                     | Docker miner: `./scripts/bnb/up.sh`, then `./scripts/run_firehose_bnb.sh`                 | `pnpm test:fh3.0:bnb-dev`                  | None                                                                      |
| Polygon (fh 2.3)        | Docker miner: `./scripts/polygon/up.sh 2.3`, then `./scripts/run_firehose_polygon.sh 2.3` | `pnpm test:fh2.3:polygon-dev`              | None                                                                      |
| Polygon (fh 3.0)        | Docker miner: `./scripts/polygon/up.sh 3.0`, then `./scripts/run_firehose_polygon.sh 3.0` | `pnpm test:fh3.0:polygon-dev`              | None                                                                      |
| Amoy                    | `./scripts/run_firehose_polygon.sh 3.0 amoy`                                              | `pnpm test:fh2.3:polygon-dev --grep "Amoy"` | None                                                                      |

### Specific Tests

You can run a specific test group or a specific test by using:

```bash
pnpm test:<id> --grep "<filter>"
```

The `<filter>` works by concatenating the series of `describe` and `it` in the tests handlers using a space. So for example, to run all tests found in `calls.test.ts`, you would use:

```bash
pnpm test:<id> --grep "Calls"
```

As the file as a single `describe("Calls", ...)` definition. And to run specific `Delegate with value` you would use:

```bash
pnpm test:<id> --grep "Calls Delegate with value"
```

### Snapshot Tags

The test suite has different snapshot tags that can exercises different different tracer behavior. The snapshots tag to use when running tests is controlled by the environment variable `SNAPSHOTS_TAG`. Here the list of snapshot tags we currently support.

- `SNAPSHOTS_TAG="fh2.3"` expects a Firehose Tracer Version 2.3 `./scripts/run_firehose_geth_dev.sh 2.3`
- `SNAPSHOTS_TAG="fh3.0"` expects a Firehose Tracer Version 3.0 `./scripts/run_firehose_geth_dev.sh 3.0`

> [!NOTE]
> You should use `pnpm test:<id>` to run the tests, it sets `SNAPSHOTS_TAG` environment variable for you as well as the correct network to use.

#### Network Snapshots Overrides

Some network like Arbitrum have bugs compared to the "canonical" Ethereum Firehose tracer which is Ethereum Mainnet. They trace almost the same thing as their respective model (`fh2.3` or `fh3.0`) for most transactions but have some differences for specific test cases. We leverage Hardhat networks to implement this functionality.

Instead of creating a brand new tag specific for this network, instead it's possible to override the snapshot to use on a test case basis:

```typescript
await expect(contractCall(owner, Logs.logInSubFailedCallButTrxSucceed, [Contract.address])).to.trxTraceEqualSnapshot(
  "logs/log_sub_call_fails_top_level_succeed.expected.json",
  {
    $contract: Contract.addressHex,
  },
  {
    networkSnapshotOverrides: ["arbitrum-geth-dev"],
  }
)
```

Here, if the Hardhat network we run the tests against is named `arbitrum-geth-dev`, the snapshot that will be used for comparison will be `logs/arbitrum-geth-dev/log_sub_call_fails_top_level_succeed.expected.json` and in all other cases it will be `logs/log_sub_call_fails_top_level_succeed.expected.json`.

To add new overrides to a new network, modify [./hardhat.config.ts](./hardhat.config.ts) `networks` config element to add a new unique network name. Then simply modify
the test case if the same way as presented above.

## Development

A bunch of unit tests uses "snapshot" testing to avoid writing lengthy assertions. The test suite manages, uses and updates snapshots using a few environment variables. If you are adding new tests and the snapshot doesn't exist, the first test run will update the snapshot on disk. You should review the taken snapshot to ensure it fits the desired model state.

If there is differences, you should update a specific snapshot by using `SNAPSHOTS_UPDATE=<id>` variable, on differences, the test will report the exact `<id>` to use. You update a snapshot with a command like:

```bash
SNAPSHOTS_UPDATE="transfer_existing_address" pnpm test:<id>
```

If you modify a setting/config that affects all snapshots, you technically need to update all affected tags. You can use `SNAPSHOTS_UPDATE=".*"` to update all snapshots, normally you will need to do it for each tag

- `SNAPSHOTS_UPDATE=".*" pnpm test:fh2.3:geth-dev`
- `SNAPSHOTS_UPDATE=".*" pnpm test:fh3.0:geth-dev`

### Snapshots

We support only `TransactionTrace` snapshot within the test project (we do have block-level test but they don't use snapshots). Snapshots are mostly implemented within [./test/lib/snapshots.ts](./test/lib/snapshots.ts) and in [./test/lib/assertions.ts](./test/lib/assertions.ts) (search for `trxTraceEqualSnapshot`).

The transaction snapshot is dynamic through variables that are resolved at runtime based on the transaction as sent on the network. Indeed, since we are running transactions against a real network that is evolving instead of replay existing transactions, we need to account for "normal" varying data like transaction's hash, nonce, global balances, and many more.

The snapshots comparison process could be defined as:

- We load the `<id>.expected.json` file which contains human JSON format of the `TransactionTrace` protobuf. It's mainly ProtoJSON with `bytes` rendered as `hex` and `BigInt` Ethereum Protobuf Message inlined as `hex` directly. This file can contain `$<variable>` any where in the file and those will be replaced in the normalization step below.
- From the template above, we generate the (_git ignored_) file `<id>.expected.resolved.json` which has variables resolves with transaction's receipt and test provided variables like address of a contract the test interact with.
- The actual `TransactionTrace` Protobuf value is retrieved from the Firehose instance running against the network and written to `<id>.actual.original.json`. This file will contains the untouched transaction as fetched from Firehose.
- The actual `TransactionTrace` Protobuf is normalized and the normalized version is written to `<id>.original.normalized.json`:
  - Balance and nonce changes are deltaize, a process in which we change absolute values to become relative by computing the `new - old` delta, if positive, we update the change to become `old: 0, new: <delta>` otherwise if negative we do `old: <delta>, new: 0`.
  - Balance changes with `REWARD_TRANSACTION_FEE` are normalized to `old: 0, new: 1`, this is because most chains uses EIP-1159 which introduce dynamic fees making the fee changes without being controllable.
- [Optional] If `SNAPSHOTS_UPDATE` is set and the regex matches current snapshot `<id>`, then the `<id>.original.normalized.json` is taken and templatized:

  - First by explicitly changing some fixes "path" to variables (`$hash`, `$index`, `$nonce`, `$cumulativeGasUsed`, `$logsBloom`)
  - Second by taking the `name => values` variables map a specific test is providing and replacing all `values` within the JSON by the `$<name>` of the associated variable (this has the consequences that values and names must unique within a test case).

  The templatized value is then saved as the new expect value and written to `<id>.expected.json`. The test runner is updated to use the actual as the expect value which will yield no differences.

- The `<id>.original.normalized.json` and `<id>.expected.resolved.json` content are then compared deeply, if there is a difference the diff is presented.

### Protobuf Generation

If you have a weird Protobuf decoding error like `Error: Buffer is not a value in enum sf.ethereum.type.v2.TransactionTrace.Typ` or in that vein, it probably means that the block you receives and the Protobuf representation of the Block have diverged.

You can re-generate the Ethereum Protobuf ES code by doing:

```bash
pnpm generate
```

## Installation Instructions

### Dependencies

Dependencies you will need to have locally to run the scripts contained in this project:

- [Node.js](https://nodejs.org/) ([Installation](https://nodejs.org/en/download))
- [pnpm](https://pnpm.io/) ([Installation](https://pnpm.io/installation))
- [jq](https://jqlang.github.io/jq/) (`brew install jq`, `apt-get install jq`, [others](https://jqlang.github.io/jq/download/))
- [sd](https://github.com/chmln/sd?tab=readme-ov-file#sd---search--displace) (`brew install sd`, `apt-get install sd`, [others](https://github.com/chmln/sd?tab=readme-ov-file#installation))
- [fireeth](https://github.com/streamingfast/firehose-ethereum) (`brew install tap/streamingfast/firehose-ethereum` or [others](https://github.com/streamingfast/firehose-core/tree/develop?tab=readme-ov-file#installation))

### Get `fireeth`

To install `fireeth`, you can simply do `brew install tap/streamingfast/firehose-ethereum` or follow [other installations](https://github.com/streamingfast/firehose-core/tree/develop?tab=readme-ov-file#installation) section of the project's README.

### Build Firehose `geth`

- Clone https://github.com/streamingfast/go-ethereum/tree/firehose-fh3.0

  ```bash
  git clone https://github.com/streamingfast/go-ethereum --branch firehose-fh3.0 --single-branch <folder>
  ```

- Install it locally:

  ```bash
  go install ./cmd/geth
  ```

  > [!NOTE]
  > If you have some problem running the built binary on OSX, it could be due to OSX code signing issue, fix signature of the built binary with `codesign --sign - --force --preserve-metadata=entitlements,requirements,flags,runtime $(which geth)`
