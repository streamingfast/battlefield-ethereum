import { expect } from "chai"
import { Contract, contractCall, deployAll, deployContract, koContractCall } from "./lib/ethereum"
import { Child, Logs } from "../typechain-types"
import { ChildFactory, LogsFactory, owner } from "./global"

describe("Logs", function () {
  let Child: Contract<Child>
  let Logs: Contract<Logs>

  before(async () => {
    await deployAll(
      async () => (Child = await deployContract(owner, ChildFactory)),
      async () => (Logs = await deployContract(owner, LogsFactory))
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
      }
    )
  })

  it("Log in sub-call that succeed but top-level trx fails", async function () {
    await expect(koContractCall(owner, Logs.logInSubSuccessCallButTrxFails, [Child.address])).to.trxTraceEqualSnapshot(
      "logs/log_sub_call_succeed_top_level_fail.expected.json",
      {
        $logsContract: Logs.addressHex,
        $childContract: Child.addressHex,
      }
    )
  })
})
