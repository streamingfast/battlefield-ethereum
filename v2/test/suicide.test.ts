import { expect } from "chai"
import {
  Contract,
  contractCall,
  contractCreation,
  deployAll,
  deployContract,
  deployStableContractCreator,
  getCreate2AddressHex,
  getCreateAddressHex,
  sendEth,
  stableDeployerFunded,
} from "./lib/ethereum"
import { Suicidal, Calls, ContractSuicideNoConstructor__factory } from "../typechain-types"
import { SuicidalFactory, CallsFactory, owner, SuicideOnConstructorFactory } from "./global"
import { eth, oneWei } from "./lib/money"
import { EIP } from "./lib/chain_eips"
import { isNetwork } from "./lib/network"

const callsGasLimit = 3_500_000

// Arbitrum Geth Dev Suicide Note (comment ref id 5564fd945748)
//
// Arbitrum Geth uses Firehose 3.0-beta tracer but using backwards compatibility mode
// generating Firehose 2.3 block model. However the tracer had a bug not correctly aligning
// with Firehose 2.3 model when dealing with balance change happening due to a selfdestruct
// withdraw.
//
// When a contracts suicide, if the contract had **no** balance, Firehose 2.3 model is
// not generating any `BalanceChange` in this situation because there is actually no balance
// change since there is no balance on the destructed contract.
//
// The bogus Arbitrum Geth model generates one in those cases where the old and new
// amount are the same, e.g. 0.

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
    let eipSnapshotOverrides: Record<string, EIP[]> = {}
    if (isNetwork("arbitrum-geth-dev")) {
      // Arbitrum when running under Cancun doesn't have have the actual bug referred
      // in comment 5564fd945748 as the code path is different and the bug doesn't
      // exist there.
      eipSnapshotOverrides = {
        cancun: ["eip6780"],
      }
    }

    await expect(contractCall(owner, Suicidal1.kill, [])).to.trxTraceEqualSnapshot(
      "suicide/contract_does_not_hold_any_ether.expected.json",
      {
        $suicidal1Contract: Suicidal1.addressHex,
      },
      {
        eipSnapshotOverrides,
        networkSnapshotOverrides: [
          // See comment with ref id 5564fd945748 in this file
          "arbitrum-geth-dev",
        ],
      }
    )

    await expect(contractCall(owner, Suicidal1.kill, [])).to.trxTraceEqualSnapshot(
      "suicide/contract_does_not_hold_any_ether_already_killed.expected.json",
      {
        $suicidal1Contract: Suicidal1.addressHex,
      },
      {
        eipSnapshotOverrides: {
          cancun: ["eip6780"],
        },
        networkSnapshotOverrides: [
          // See comment with ref id 5564fd945748 in this file
          "arbitrum-geth-dev",
        ],
      }
    )
  })

  it("Contract hold Ether", async function () {
    await sendEth(owner, Suicidal2.address, oneWei, { gasLimit: 42000 })

    await expect(contractCall(owner, Suicidal2.kill, [])).to.trxTraceEqualSnapshot(
      "suicide/contract_does_hold_ether.expected.json",
      {
        $suicidal2Contract: Suicidal2.addressHex,
      },
      {
        networkSnapshotOverrides: [
          // Arbitrum Geth uses Firehose 3.0-beta tracer but using backwards compatibility mode
          // generating Firehose 2.3 block model. However the tracer had a bug not correctly aligning
          // with Firehose 2.3 model when dealing with balance change happening due to a selfdestruct.
          //
          // When a contracts suicide, if the contract had a balance, Firehose 2.3 model is
          // generating one `BalanceChange` with reason `REASON_SUICIDE_WITHDRAW` but the bogus
          // Arbitrum Geth model is generating two, twice the same. The second one being a duplicate
          // of the first and shouldn't have been there
          "arbitrum-geth-dev",
        ],
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
      },
      {
        networkSnapshotOverrides: [
          // See comment with ref id 5564fd945748 in this file
          "arbitrum-geth-dev",
        ],
      }
    )
  })

  it("Create contract to fixed address (create2), kill it and try instantiate it again at same address", async function () {
    const salt = "0x736f6d652073616c740000000000000000000000000000000000000000000000"
    let createdContract = getCreate2AddressHex(Calls.addressHex, salt, ContractSuicideNoConstructor__factory)

    await expect(
      contractCall(owner, Calls.contractFixedAddressSuicideThenTryToCreateOnSameAddress, [])
    ).to.trxTraceEqualSnapshot(
      "suicide/create_contract_to_fixed_address_kill_it.expected.json",
      {
        $callsContract: Calls.addressHex,
        $createdContract: createdContract,
      },
      {
        networkSnapshotOverrides: [
          // See comment with ref id 5564fd945748 in this file
          "arbitrum-geth-dev",
        ],
      }
    )

    await expect(
      contractCall(owner, Calls.contractFixedAddressSuicideThenTryToCreateOnSameAddress, [])
    ).to.trxTraceEqualSnapshot(
      "suicide/create_contract_to_fixed_address_kill_it_while_already_killed.expected.json",
      {
        $callsContract: Calls.addressHex,
        $createdContract: createdContract,
      },
      {
        networkSnapshotOverrides: [
          // See comment with ref id 5564fd945748 in this file
          "arbitrum-geth-dev",
        ],
      }
    )
  })

  it("Contract created in trx and suicides in constructor", async function () {
    const deployer = await stableDeployerFunded(owner, 1, eth(0.01))

    await expect(contractCreation(deployer, SuicideOnConstructorFactory, [])).to.trxTraceEqualSnapshot(
      "suicide/create_contract_suicide_in_constructor.json",
      {
        $sender: deployer.address.toLowerCase().slice(2),
        $createdContract: getCreateAddressHex(deployer.address, 0),
      }
    )
  })
})
