import { expect } from "chai"
import { Contract, contractCall, deployAll, deployContract, koContractCall } from "./lib/ethereum"
import { Child, Logs, LogsNoTopics } from "../typechain-types"
import { ChildFactory, LogsFactory, LogsNoTopicsFactory, owner } from "./global"
import { fetchFirehoseTransactionAndBlock } from "./lib/firehose"

describe("Logs", function () {
  let Child: Contract<Child>
  let Logs: Contract<Logs>
  let LogsNoTopics: Contract<LogsNoTopics>

  before(async () => {
    await deployAll(
      async () => (Child = await deployContract(owner, ChildFactory, [])),
      async () => (Logs = await deployContract(owner, LogsFactory, [])),
      async () => (LogsNoTopics = await deployContract(owner, LogsNoTopicsFactory, []))
    )
  })

  it("No topics (log0)", async function () {
    await expect(contractCall(owner, Logs.logNoTopics, [])).to.trxTraceEqualSnapshot(
      "logs/log_no_topics.expected.json",
      {
        $logsContract: Logs.addressHex,
      }
    )
  })

  it("No topics but with data (log0)", async function () {
    await expect(contractCall(owner, LogsNoTopics.withData, [])).to.trxTraceEqualSnapshot(
      "logs/log_no_topics_with_data.expected.json",
      {
        $logsContract: LogsNoTopics.addressHex,
      }
    )
  })

  it("No topics (log0) but call reverts", async function () {
    // Firehose 2.3 had a wrong behavior for failed call with log0.
    const result = await koContractCall(owner, LogsNoTopics.fullyEmptyReverts, [])
    const { block, trace } = await fetchFirehoseTransactionAndBlock(result)

    await expect([result, trace, block]).to.trxTraceEqualSnapshot(
      "logs/log_no_topics_but_call_reverts.expected.json",
      {
        $logsContract: LogsNoTopics.addressHex,
      },
      {
        networkSnapshotOverrides: [
          // Arbitrum Geth uses Firehose 3.0-beta tracer but using backwards compatibility mode
          // generating Firehose 2.3 block model. However the tracer had a bug not correctly aligning
          // with Firehose 2.3 model when a log as no topics and the call reverts.
          //
          // Firehose 2.3 model generates `topics: [""]` while bogus Arbitrum Geth model
          // generates `topics: []`.
          "arbitrum-geth-dev",

          // Optimism revert vs failed, see comment with ref id 1be64cf0820f in this project for details
          "optimism-geth-dev",
        ],
      }
    )
  })

  it("No topics but with data (log0) but call reverts", async function () {
    await expect(koContractCall(owner, LogsNoTopics.withDataReverts, [])).to.trxTraceEqualSnapshot(
      "logs/log_no_topics_with_data_but_call_reverts.expected.json",
      {
        $logsContract: LogsNoTopics.addressHex,
      },
      {
        networkSnapshotOverrides: [
          // Arbitrum Geth uses Firehose 3.0-beta tracer but using backwards compatibility mode
          // generating Firehose 2.3 block model. However the tracer had a bug not correctly aligning
          // with Firehose 2.3 model when a log as no topics and the call reverts.
          //
          // Firehose 2.3 model generates `topics: [""]` while bogus Arbitrum Geth model
          // generates `topics: []`.
          "arbitrum-geth-dev",

          // Optimism revert vs failed, see comment with ref id 1be64cf0820f in this project for details
          "optimism-geth-dev",
        ],
      }
    )
  })

  it("Empty", async function () {
    await expect(contractCall(owner, Logs.logEmpty, [])).to.trxTraceEqualSnapshot("logs/log_empty.expected.json", {
      $logsContract: Logs.addressHex,
    })
  })

  it("Single", async function () {
    await expect(contractCall(owner, Logs.logSingle, [])).to.trxTraceEqualSnapshot("logs/log_single.expected.json", {
      $logsContract: Logs.addressHex,
    })
  })

  it("All", async function () {
    await expect(contractCall(owner, Logs.logAll, [])).to.trxTraceEqualSnapshot("logs/log_all.expected.json", {
      $logsContract: Logs.addressHex,
    })
  })

  it("All indexed", async function () {
    await expect(contractCall(owner, Logs.logAllIndexed, [])).to.trxTraceEqualSnapshot(
      "logs/log_all_indexed.expected.json",
      {
        $logsContract: Logs.addressHex,
      }
    )
  })

  it("All mixed", async function () {
    await expect(contractCall(owner, Logs.logAllMixed, [])).to.trxTraceEqualSnapshot(
      "logs/log_all_mixed.expected.json",
      {
        $logsContract: Logs.addressHex,
      }
    )
  })

  it("Multi", async function () {
    await expect(contractCall(owner, Logs.logMulti, [])).to.trxTraceEqualSnapshot("logs/log_multi.expected.json", {
      $logsContract: Logs.addressHex,
    })
  })

  it("Log in top-level trx and then top-level trx fails", async function () {
    await expect(koContractCall(owner, Logs.logAndTopLevelFail, [])).to.trxTraceEqualSnapshot(
      "logs/log_top_level_fail.expected.json",
      {
        $logsContract: Logs.addressHex,
      }
    )
  })

  it("Log in sub-call that fails but top-level trx succeed", async function () {
    await expect(contractCall(owner, Logs.logInSubFailedCallButTrxSucceed, [Child.address])).to.trxTraceEqualSnapshot(
      "logs/log_sub_call_fails_top_level_succeed.expected.json",
      {
        $logsContract: Logs.addressHex,
        $childContract: Child.addressHex,
      },
      {
        networkSnapshotOverrides: ["arbitrum-geth-dev"],
      }
    )
  })

  it("Log in sub-call that succeed but top-level trx fails", async function () {
    await expect(koContractCall(owner, Logs.logInSubSuccessCallButTrxFails, [Child.address])).to.trxTraceEqualSnapshot(
      "logs/log_sub_call_succeed_top_level_fail.expected.json",
      {
        $logsContract: Logs.addressHex,
        $childContract: Child.addressHex,
      },
      {
        networkSnapshotOverrides: ["arbitrum-geth-dev"],
      }
    )
  })
})
