import { expect } from "chai"
import { Contract, contractCall, deployAll, deployContract } from "./lib/ethereum"
import { Main } from "../typechain-types"
import { MainFactory, owner } from "./global"
import { networkValue } from "./lib/network"
import { besu_exclude_fields } from "./lib/constants"

describe("Storages", function () {
  let Storage: Contract<Main>

  before(async () => {
    await deployAll(async () => (Storage = await deployContract(owner, MainFactory, [])))
  })

  it("Set long string & array", async function () {
    const customTx = networkValue({
      "sei-dev": { gasLimit: 1_525_000 },
      "*": {},
    })

    await expect(contractCall(owner, Storage.setLongString, [], customTx)).to.trxTraceEqualSnapshot(
      "storages/set_long_string.expected.json",
      {
        $storageContract: Storage.addressHex,
      },
      {
        networkSnapshotOverrides: ["optimism-geth-dev"], // less gas used on bnb here
        excludeFields: { "besu-devnet": besu_exclude_fields },
      },
    )

    await expect(contractCall(owner, Storage.setAfter, [])).to.trxTraceEqualSnapshot(
      "storages/set_long_again_and_array_update.expected.json",
      {
        $storageContract: Storage.addressHex,
      },
      {
        excludeFields: { "besu-devnet": besu_exclude_fields },
      },
    )
  })
})
