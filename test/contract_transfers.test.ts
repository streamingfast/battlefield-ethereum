import { expect } from "chai"
import {
  knownExistingAddress,
  randomAddress3,
  randomAddress3Hex,
  randomAddress4,
  randomAddress4Hex,
} from "./lib/addresses"
import hre from "hardhat"
import { Contract, contractCall, deployAll, deployContract, koContractCall } from "./lib/ethereum"
import { oneWei } from "./lib/money"
import { Child, GasRefund, SelfTransfers, SelfTransfers__factory, Transfers } from "../typechain-types"
import { ChildFactory, GasRefundFactory, owner, TransfersFactory } from "./global"
import { fetchFirehoseTransactionAndBlock } from "./lib/firehose"
import { BalanceChange_Reason } from "../pb/sf/ethereum/type/v2/type_pb"
import { toBigInt } from "./lib/numbers"

describe("Contract transfers", function () {
  let Child: Contract<Child>
  let Transfers: Contract<Transfers>
  let GasRefundContract: Contract<GasRefund>
  let SelfTransfersContract: Contract<SelfTransfers>

  before(async () => {
    await deployAll(
      async () => (Child = await deployContract(owner, ChildFactory, [])),
      async () => (Transfers = await deployContract(owner, TransfersFactory, [])),
      async () => (GasRefundContract = await deployContract(owner, GasRefundFactory, [])),
      async () => {
        const factory = (await hre.ethers.getContractFactory("SelfTransfers")) as SelfTransfers__factory
        SelfTransfersContract = await deployContract(owner, factory, [])
      },
    )
  })

  it("Existing address", async function () {
    await expect(
      contractCall(owner, Transfers.nativeTransfer, [knownExistingAddress], { value: oneWei }),
    ).to.trxTraceEqualSnapshot("contract_transfers/existing_address.expected.json", {
      $contract: Transfers.addressHex,
    })
  })

  it("Existing address failing transaction", async function () {
    await expect(
      koContractCall(owner, Transfers.nativeTransfer, [knownExistingAddress], { value: oneWei, gasLimit: 22080 }),
    ).to.trxTraceEqualSnapshot("contract_transfers/existing_address_failure.expected.json", {
      $contract: Transfers.addressHex,
    })
  })

  it("Inexistent address", async function () {
    await expect(
      contractCall(owner, Transfers.nativeTransfer, [randomAddress3], { value: oneWei }),
    ).to.trxTraceEqualSnapshot("contract_transfers/inexistent_address.expected.json", {
      $contract: Transfers.addressHex,
      $randomAddress3: randomAddress3Hex,
    })
  })

  it("Nested existing address", async function () {
    await expect(
      contractCall(owner, Transfers.nestedNativeTransfer, [Child.address, knownExistingAddress], {
        value: oneWei,
      }),
    ).to.trxTraceEqualSnapshot("contract_transfers/nested_existing_address.expected.json", {
      $contract: Transfers.addressHex,
      $childContract: Child.addressHex,
    })
  })

  it("Nested inexistent address", async function () {
    await expect(
      contractCall(owner, Transfers.nestedNativeTransfer, [Child.address, randomAddress4], {
        value: oneWei,
      }),
    ).to.trxTraceEqualSnapshot("contract_transfers/nested_inexistent_address.expected.json", {
      $contract: Transfers.addressHex,
      $childContract: Child.addressHex,
      $randomAddress4: randomAddress4Hex,
    })
  })

  it("Self transfer, root call reverts", async function () {
    await expect(
      koContractCall(owner, SelfTransfersContract.selfTransferThenRevert, [], { value: oneWei }),
    ).to.trxTraceEqualSnapshot("contract_transfers/self_transfer_root_reverts.expected.json", {
      $contract: SelfTransfersContract.addressHex,
    })
  })

  it("Self transfer, nested call reverts but root succeeds", async function () {
    await expect(
      contractCall(owner, SelfTransfersContract.nestedSelfTransferThenRevert, [], { value: oneWei }),
    ).to.trxTraceEqualSnapshot("contract_transfers/self_transfer_nested_reverts.expected.json", {
      $contract: SelfTransfersContract.addressHex,
    })
  })

  it("Failing call with value transfer, gas refund old value taken pre-transfer", async function () {
    const response = await koContractCall(
      owner,
      GasRefundContract.consumeGasTransferAndRevert,
      [knownExistingAddress],
      { value: oneWei },
    )

    await expect(response).to.trxTraceEqualSnapshot("contract_transfers/gas_refund_pre_transfer.expected.json", {
      $gasRefundContract: GasRefundContract.addressHex,
    })

    const { trace } = await fetchFirehoseTransactionAndBlock(response)
    const rootCall = trace.calls[0]

    const gasBuyChanges = rootCall.balanceChanges.filter((bc) => bc.reason === BalanceChange_Reason.GAS_BUY)
    const gasRefundChanges = rootCall.balanceChanges.filter((bc) => bc.reason === BalanceChange_Reason.GAS_REFUND)

    expect(gasBuyChanges).to.have.length(1, "must have exactly one REASON_GAS_BUY balance change")
    expect(gasRefundChanges).to.have.length(1, "must have exactly one REASON_GAS_REFUND balance change")

    const gasBuyChange = gasBuyChanges[0]
    const gasRefundChange = gasRefundChanges[0]

    // The gas refund oldValue must equal the gas buy newValue: the refund restores unused gas
    // to the post-gas-buy balance, which excludes the reverted value transfer.
    expect(toBigInt(gasRefundChange.oldValue)).to.equal(
      toBigInt(gasBuyChange.newValue),
      "gas refund oldValue must equal gas buy newValue (balance after gas buying, before reverted transfer)",
    )
  })
})
