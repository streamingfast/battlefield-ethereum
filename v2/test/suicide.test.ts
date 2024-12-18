import { expect } from "chai"
import {
  Contract,
  contractCall,
  deployAll,
  deployContract,
  deployStableContractCreator,
  getCreate2AddressHex,
  getCreateAddressHex,
  sendEth,
} from "./lib/ethereum"
import { Suicidal, Calls, ContractSuicideNoConstructor__factory } from "../typechain-types"
import { SuicidalFactory, CallsFactory, owner } from "./global"
import { oneWei } from "./lib/money"

const callsGasLimit = 3_500_000

describe("Suicide", function () {
  let Suicidal1: Contract<Suicidal>
  let Suicidal2: Contract<Suicidal>
  let Calls: Contract<Calls>

  before(async () => {
    await deployAll(
      async () => (Suicidal1 = await deployContract(owner, SuicidalFactory, [])),
      async () => (Suicidal2 = await deployContract(owner, SuicidalFactory, [])),
      async () => (Calls = await deployContract(owner, CallsFactory, [], { gasLimit: callsGasLimit }))
    )
  })

  it("Contract does not hold any Ether", async function () {
    await expect(contractCall(owner, Suicidal1.kill, [])).to.trxTraceEqualSnapshot(
      "suicide/contract_does_not_hold_any_ether.expected.json",
      {
        $suicidal1Contract: Suicidal1.addressHex,
      }
    )

    await expect(contractCall(owner, Suicidal1.kill, [])).to.trxTraceEqualSnapshot(
      "suicide/contract_does_not_hold_any_ether_already_killed.expected.json",
      {
        $suicidal1Contract: Suicidal1.addressHex,
      }
    )
  })

  it("Contract hold Ether", async function () {
    await sendEth(owner, Suicidal2.address, oneWei, { gasLimit: 42000 })

    await expect(contractCall(owner, Suicidal2.kill, [])).to.trxTraceEqualSnapshot(
      "suicide/contract_does_hold_ether.expected.json",
      {
        $suicidal2Contract: Suicidal2.addressHex,
      }
    )
  })

  it("Create contract, kill it and try to call within same call", async function () {
    let Calls = await deployStableContractCreator(owner, CallsFactory, [], 2, 2, { gasLimit: callsGasLimit })
    let firstCreatedContract = getCreateAddressHex(Calls.address, 1)

    await expect(contractCall(owner, Calls.contractSuicideThenCall, [])).to.trxTraceEqualSnapshot(
      "suicide/create_contract_kill_it_and_try_to_call_within_same_call.expected.json",
      {
        $callsContract: Calls.addressHex,
        $firstCreatedContract: firstCreatedContract,
        $secondCreatedContract: getCreateAddressHex("0x" + firstCreatedContract, 1),
        $thirdCreatedContract: getCreateAddressHex("0x" + firstCreatedContract, 2),
      }
    )
  })

  it("Create contract to fixed address (create2), kill it and try instantiate it again at same address", async function () {
    const salt = "0x736f6d652073616c740000000000000000000000000000000000000000000000"
    let createdContract = getCreate2AddressHex(Calls.addressHex, salt, ContractSuicideNoConstructor__factory)

    await expect(
      contractCall(owner, Calls.contractFixedAddressSuicideThenTryToCreateOnSameAddress, [])
    ).to.trxTraceEqualSnapshot("suicide/create_contract_to_fixed_address_kill_it.expected.json", {
      $callsContract: Calls.addressHex,
      $createdContract: createdContract,
    })

    await expect(
      contractCall(owner, Calls.contractFixedAddressSuicideThenTryToCreateOnSameAddress, [])
    ).to.trxTraceEqualSnapshot("suicide/create_contract_to_fixed_address_kill_it_while_already_killed.expected.json", {
      $callsContract: Calls.addressHex,
      $createdContract: createdContract,
    })
  })
})
