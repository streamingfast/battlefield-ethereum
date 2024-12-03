import { expect } from "chai"
import { Contract, contractCall, deployContract, koContractCall } from "./lib/ethereum"
import { Main } from "../typechain-types"
import { MainFactory, owner } from "./global"

describe("Storages", function () {
  let Storage: Contract<Main>

  before(async () => {
    await Promise.all([
      deployContract<Main>(owner, MainFactory, (c) => {
        Storage = c
      }),
    ])
  })

  it("Set long string & array", async function () {
    await expect(contractCall(owner, Storage.setLongString, [])).to.trxTraceEqualSnapshot(
      "storages/set_long_string.expected.json",
      {
        $storageContract: Storage.addressHex,
      }
    )

    await expect(contractCall(owner, Storage.setAfter, [])).to.trxTraceEqualSnapshot(
      "storages/set_long_again_and_array_update.expected.json",
      {
        $storageContract: Storage.addressHex,
      }
    )
  })
})
