import { expect } from "chai"
import {
  Contract,
  contractCall,
  deployAll,
  deployContract,
  deployStableContractCreator,
  getCreateAddressHex,
  getStableCreate2Data,
  koContractCall,
} from "./lib/ethereum"
import { Calls, Calls__factory } from "../typechain-types"
import { CallsFactory, owner, SuicidalFactory } from "./global"

const callsGasLimit = 3_500_000

describe("Deploys", function () {
  let Calls: Contract<Calls>

  before(async () => {
    await deployAll(async () => (Calls = await deployContract(owner, CallsFactory, { gasLimit: callsGasLimit })))
  })

  // it("contract fail just enough gas for intrinsic gas", async function () {
  //   await deployContract(owner, SuicidalFactory, { gas: 59244 })

  //   await expect(koContractCall(owner, deployContract, ["Suicidal", { gas: 59244 }])).to.trxTraceEqualSnapshot(
  //     "deploys/contract_fail_intrinsic_gas.expected.json"
  //   )
  // })

  // it("contract fail not enough gas after code_copy", async function () {
  //   await expect(
  //     koContractCall(owner, deployContract, ["Suicidal", { gas: 99309 }])
  //   ).to.trxTraceEqualSnapshot("deploys/contract_fail_code_copy.expected.json")
  // })

  it("Contract creation from call, without a constructor", async function () {
    let Calls = await deployStableContractCreator<Calls>(owner, CallsFactory, 1, 1, { gasLimit: callsGasLimit })

    await expect(contractCall(owner, Calls.contractWithEmptyConstructor, [])).to.trxTraceEqualSnapshot(
      "deploys/contract_creation_without_constructor.expected.json",
      {
        $callsContract: Calls.addressHex,
        $createdContract: getCreateAddressHex(Calls.address, 1),
      }
    )
  })

  it("Contract creation from call, with a constructor", async function () {
    let Calls = await deployStableContractCreator<Calls>(owner, CallsFactory, 1, 1, { gasLimit: callsGasLimit })

    await expect(contractCall(owner, Calls.contractWithConstructor, [])).to.trxTraceEqualSnapshot(
      "deploys/contract_creation_with_constructor.expected.json",
      {
        $callsContract: Calls.addressHex,
        $createdContract: getCreateAddressHex(Calls.address, 1),
      }
    )
  })

  it("Contract creation from call, constructor fails", async function () {
    let Calls = await deployStableContractCreator<Calls>(owner, CallsFactory, 1, 1, { gasLimit: callsGasLimit })

    await expect(koContractCall(owner, Calls.contractWithFailingConstructor, [])).to.trxTraceEqualSnapshot(
      "deploys/contract_creation_fail_constructor.expected.json",
      {
        $callsContract: Calls.addressHex,
        $createdContract: getCreateAddressHex(Calls.address, 1),
      }
    )
  })

  it("Contract creation from call, recursive constructor, second fails", async function () {
    let Calls = await deployStableContractCreator<Calls>(owner, CallsFactory, 1, 2, { gasLimit: callsGasLimit })
    let firstCreatedContract = getCreateAddressHex(Calls.address, 1)

    await expect(koContractCall(owner, Calls.contracFailingRecursiveConstructor, [])).to.trxTraceEqualSnapshot(
      "deploys/contract_creation_recursive_fail.expected.json",
      {
        $callsContract: Calls.addressHex,
        $firstCreatedContract: firstCreatedContract,
        $secondCreatedContract: getCreateAddressHex("0x" + firstCreatedContract, 1),
      }
    )
  })

  it("Contract with create2, inner call fail due to insufficient funds (transaction succeed though)", async function () {
    const create2Data = getStableCreate2Data(Calls.address, Calls__factory)

    await expect(
      contractCall(owner, Calls.contractCreate2, [
        Calls__factory.bytecode,
        "300000000000000000000000000000",
        `0x${create2Data.salt}`,
        false,
      ])
    ).to.trxTraceEqualSnapshot("deploys/contract_create2_insufficient_funds_succeed.expected.json", {
      $callsContract: Calls.addressHex,
      $createdContract: create2Data.address,
      $salt: create2Data.salt,
    })
  })

  it("Contract with create2, inner call fail due to insufficient funds then revert", async function () {
    const create2Data = getStableCreate2Data(Calls.address, Calls__factory)

    await expect(
      koContractCall(owner, Calls.contractCreate2, [
        Calls__factory.bytecode,
        "300000000000000000000000000000",
        `0x${create2Data.salt}`,
        true,
      ])
    ).to.trxTraceEqualSnapshot("deploys/contract_create2_insufficient_funds_revert.expected.json", {
      $callsContract: Calls.addressHex,
      $createdContract: create2Data.address,
      $salt: create2Data.salt,
    })
  })

  it("Contract with create2, successful creation", async function () {
    const create2Data = getStableCreate2Data(Calls.address, Calls__factory)

    await expect(
      contractCall(owner, Calls.contractCreate2, [Calls__factory.bytecode, "0", `0x${create2Data.salt}`, false])
    ).to.trxTraceEqualSnapshot("deploys/contract_create2_successful_creation.expected.json", {
      $callsContract: Calls.addressHex,
      $createdContract: create2Data.address,
      $salt: create2Data.salt,
    })
  })

  it("Contract with create2, inner call fail due to address already exists (transaction succeed though)", async function () {
    const Calls = await deployContract<Calls>(owner, CallsFactory, { gasLimit: callsGasLimit })
    const create2Data = getStableCreate2Data(Calls.address, Calls__factory)

    // Perform the first creation that succeeds
    await contractCall(owner, Calls.contractCreate2, [Calls__factory.bytecode, "0", `0x${create2Data.salt}`, false])

    await expect(
      contractCall(owner, Calls.contractCreate2, [Calls__factory.bytecode, "0", `0x${create2Data.salt}`, false])
    ).to.trxTraceEqualSnapshot("deploys/contract_create2_inner_call_fails_address_already_exists.expected.json", {
      $callsContract: Calls.addressHex,
      $createdContract: create2Data.address,
      $salt: create2Data.salt,
    })
  })

  it("Contract with create2, inner call fail due to address already exists and transaction fails too", async function () {
    const Calls = await deployContract<Calls>(owner, CallsFactory, { gasLimit: callsGasLimit })
    const create2Data = getStableCreate2Data(Calls.address, Calls__factory)

    // Perform the first creation that succeeds
    await contractCall(owner, Calls.contractCreate2, [Calls__factory.bytecode, "0", `0x${create2Data.salt}`, false])

    await expect(
      koContractCall(owner, Calls.contractCreate2, [Calls__factory.bytecode, "0", `0x${create2Data.salt}`, true])
    ).to.trxTraceEqualSnapshot(
      "deploys/contract_create2_inner_call_fails_address_already_exists_and_trx_fails.expected.json",
      {
        $callsContract: Calls.addressHex,
        $createdContract: create2Data.address,
        $salt: create2Data.salt,
      }
    )
  })
})
