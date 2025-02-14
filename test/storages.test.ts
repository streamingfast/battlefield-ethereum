import { expect } from "chai"
import { Contract, contractCall, deployAll, deployContract } from "./lib/ethereum"
import { Main } from "../typechain-types"
import { MainFactory, owner } from "./global"

describe("Storages", function () {
  let Storage: Contract<Main>

  before(async () => {
    await deployAll(async () => (Storage = await deployContract(owner, MainFactory, [])))
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
