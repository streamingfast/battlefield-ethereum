import { expect } from "chai"
import { Contract, contractCall, deployAll, deployContract } from "./lib/ethereum"
import { Main } from "../typechain-types"
import { MainFactory, owner } from "./global"

describe("Inputs", function () {
  let Input: Contract<Main>

  before(async () => {
    await deployAll(async () => (Input = await deployContract(owner, MainFactory, [])))
  })

  it("Input variable sizes", async function () {
    const testCases = [
      ["string_equal_0", ""],
      ["string_equal_15", "just 15 chars!!"],
      ["string_equal_32", "equal directly 32 bytes filling!"],
      [
        "string_longer_than_32",
        "really long string larger than 32 bytes to test out solidity splitting stuff over 64 chars",
      ],
    ]

    await Promise.all(
      testCases.map(async ([name, value]) => {
        await expect(contractCall(owner, Input.longStringInput, [value])).to.trxTraceEqualSnapshot(
          `inputs/${name}.expected.json`,
          {
            $inputContract: Input.addressHex,
          }
        )
      })
    )
  })
})
