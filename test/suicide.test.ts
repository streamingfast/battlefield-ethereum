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
import {
  SuicidalFactory,
  CallsFactory,
  owner,
  SuicideOnConstructorFactory,
  SuicideContractAsBeneficiary,
  SuicideContractAsBeneficiarySameTrx,
  TripleSuicideFactory,
} from "./global"
import hre from "hardhat"
import { eth, oneWei } from "./lib/money"
import { EIP } from "./lib/chain_eips"
import { isNetwork, networkValue } from "./lib/network"
import { hexlify } from "ethers"
import { CallType } from "../pb/sf/ethereum/type/v2/type_pb"
import { fetchFirehoseTransactionAndBlock } from "./lib/firehose"
import { isSameAddress } from "./lib/addresses"

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

  const callsGasLimit = networkValue({
    "*": 3_500_000,
  })

  before(async () => {
    await deployAll(
      async () => (Suicidal1 = await deployContract(owner, SuicidalFactory, [])),
      async () => (Suicidal2 = await deployContract(owner, SuicidalFactory, [])),
      async () => (Calls = await deployContract(owner, CallsFactory, [], { gasLimit: callsGasLimit })),
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
      },
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
      },
    )
  })

  it("Contract hold Ether", async function () {
    await sendEth(owner, Suicidal2.address, oneWei, { gasLimit: 42000 })

    await expect(contractCall(owner, Suicidal2.kill, [])).to.trxTraceEqualSnapshot(
      "suicide/contract_does_hold_ether.expected.json",
      {
        $suicidal2Contract: Suicidal2.addressHex,
      },
    )
  })

  it("Create contract, kill it and try to call within same call", async function () {
    let Calls = await deployStableContractCreator(owner, CallsFactory, [], 2, 2, { gasLimit: callsGasLimit })
    let firstCreatedContract = getCreateAddressHex(Calls.address, 1)

    await expect(
      contractCall(owner, Calls.contractSuicideThenCall, [], { gasLimit: callsGasLimit }),
    ).to.trxTraceEqualSnapshot("suicide/create_contract_kill_it_and_try_to_call_within_same_call.expected.json", {
      $callsContract: Calls.addressHex,
      $firstCreatedContract: firstCreatedContract,
      $secondCreatedContract: getCreateAddressHex("0x" + firstCreatedContract, 1),
      $thirdCreatedContract: getCreateAddressHex("0x" + firstCreatedContract, 2),
    })
  })

  it("Create contract to fixed address (create2), kill it and try instantiate it again at same address", async function () {
    const salt = "0x736f6d652073616c740000000000000000000000000000000000000000000000"
    let createdContract = getCreate2AddressHex(Calls.addressHex, salt, ContractSuicideNoConstructor__factory)

    await expect(
      contractCall(owner, Calls.contractFixedAddressSuicideThenTryToCreateOnSameAddress, []),
    ).to.trxTraceEqualSnapshot("suicide/create_contract_to_fixed_address_kill_it.expected.json", {
      $callsContract: Calls.addressHex,
      $createdContract: createdContract,
    })

    await expect(
      contractCall(owner, Calls.contractFixedAddressSuicideThenTryToCreateOnSameAddress, []),
    ).to.trxTraceEqualSnapshot("suicide/create_contract_to_fixed_address_kill_it_while_already_killed.expected.json", {
      $callsContract: Calls.addressHex,
      $createdContract: createdContract,
    })
  })

  it("Contract created in trx and suicides in constructor", async function () {
    const deployer = await stableDeployerFunded(owner, 1, eth(0.01))

    await expect(contractCreation(deployer, SuicideOnConstructorFactory, [])).to.trxTraceEqualSnapshot(
      "suicide/create_contract_suicide_in_constructor.json",
      {
        $sender: deployer.address.toLowerCase().slice(2),
        $createdContract: getCreateAddressHex(deployer.address, 0),
      },
    )
  })

  it("Contract and suicide beneficiary are the same", async function () {
    const deployer = await stableDeployerFunded(owner, 1, eth(0.01))
    const Contract = await deployContract(deployer, SuicideContractAsBeneficiary, [])

    await sendEth(owner, Contract.address, oneWei, { gasLimit: 45000 })

    await expect(contractCall(owner, Contract.killSelf, [])).to.trxTraceEqualSnapshot(
      "suicide/contract_and_suicide_beneficiary_are_the_same.json",
      {
        $sender: deployer.address.toLowerCase().slice(2),
        $createdContract: Contract.addressHex,
      },
    )
  })

  it("Contract and suicide beneficiary are the same, in same trx", async function () {
    const Contract = await deployStableContractCreator(owner, SuicideContractAsBeneficiarySameTrx, [], 1, 1, {
      gasLimit: callsGasLimit,
    })
    const createdContract = getCreateAddressHex(Contract.address, 1)

    await expect(contractCall(owner, Contract.execute, [], { value: oneWei })).to.trxTraceEqualSnapshot(
      "suicide/contract_and_suicide_beneficiary_are_the_same_in_same_trx.json",
      {
        $contract: Contract.addressHex,
        $createdContract: createdContract,
      },
    )
  })

  it("Contract created in subcall suicides in its constructor", async function () {
    // Reproduces the pattern observed in Optimism trx 1be5b6c3...:
    //   root tx → wrapper.execute() (depth 0)
    //                → CREATE child (depth 1) — child constructor selfdestructs
    //
    // Because the create and the suicide happen in the same transaction, the child
    // is fully removed at end-of-tx (true on every fork: pre-Cancun by default,
    // post-Cancun via the EIP-6780 same-tx exception). Finalization writes the
    // nonce 1→0 reset to the root call.
    const CreateSuicideInSubcallFactory = await hre.ethers.getContractFactory("CreateSuicideInSubcall")
    const Wrapper = await deployStableContractCreator(owner, CreateSuicideInSubcallFactory, [], 1, 1, {
      gasLimit: callsGasLimit,
    })
    const childAddress = getCreateAddressHex(Wrapper.address, 1)

    const response = await contractCall(owner, Wrapper.execute, [], { gasLimit: callsGasLimit })
    const { trace } = await fetchFirehoseTransactionAndBlock(response)

    // Root + wrapper.execute() + CREATE child
    expect(trace.calls).to.have.length(2, "must have 2 calls: root wrapper call + CREATE child")

    const rootCall = trace.calls[0]
    expect(rootCall.depth).to.equal(0, "first call must be the root call")

    const createCall = trace.calls[1]
    expect(createCall.callType).to.equal(CallType.CREATE, "second call must be a CREATE")
    expect(isSameAddress(hexlify(createCall.address), childAddress)).to.be.true
    expect(createCall.suicide).to.be.true

    // CREATE subcall: nonce 0→1 for the freshly created child
    const childNonceCreate = createCall.nonceChanges.find((nc) => isSameAddress(hexlify(nc.address), childAddress))
    expect(childNonceCreate, "CREATE subcall must record a nonce change for the child contract").to.not.be.undefined
    expect(childNonceCreate!.oldValue).to.equal(0n, "child nonce in CREATE subcall must start at 0")
    expect(childNonceCreate!.newValue).to.equal(1n, "child nonce in CREATE subcall must end at 1")

    // Root call: nonce 1→0 cleanup written during end-of-tx finalization
    const childNonceCleanup = rootCall.nonceChanges.find(
      (nc) => isSameAddress(hexlify(nc.address), childAddress) && nc.newValue === 0n,
    )
    expect(childNonceCleanup, "root call must record nonce 1→0 cleanup for the suicided child").to.not.be.undefined
    expect(childNonceCleanup!.oldValue).to.equal(1n)
    expect(childNonceCleanup!.newValue).to.equal(0n)
  })

  it("Create 3 contracts and suicide all in same transaction", async function () {
    const Factory = await deployStableContractCreator(owner, TripleSuicideFactory, [], 3, 1, {
      gasLimit: callsGasLimit,
    })
    const childAddrs = [
      getCreateAddressHex(Factory.address, 1),
      getCreateAddressHex(Factory.address, 2),
      getCreateAddressHex(Factory.address, 3),
    ]

    const response = await contractCall(owner, Factory.createAndDestroyThree, [], { gasLimit: callsGasLimit })
    const { trace } = await fetchFirehoseTransactionAndBlock(response)

    // root + 3 CREATEs + 3 kill() calls
    expect(trace.calls).to.have.length(7, "must have 7 calls: root + 3 CREATE + 3 kill")

    const createCalls = trace.calls.filter((c) => c.callType === CallType.CREATE)
    expect(createCalls).to.have.length(3, "must have exactly 3 CREATE calls")

    const suicideCalls = trace.calls.filter((c) => c.suicide)
    expect(suicideCalls).to.have.length(3, "must have exactly 3 suicide calls")

    for (const call of suicideCalls) {
      const addr = hexlify(call.address)
      expect(childAddrs.some((a) => isSameAddress(a, addr))).to.be.true
    }

    // selfdestruct finalization writes code removals and nonce resets to the root call; verify
    // they are sorted by address (exercises statedb_hooked finalization sorting).
    const rootCall = trace.calls[0]

    const codeRemovals = rootCall.codeChanges.filter(
      (cc) => cc.newCode.length === 0 && childAddrs.some((a) => isSameAddress(a, hexlify(cc.address))),
    )
    expect(codeRemovals).to.have.length(3, "root call must have 3 code removals for child contracts")

    const codeRemovalAddrs = codeRemovals.map((cc) => hexlify(cc.address))
    expect(codeRemovalAddrs).to.deep.equal(
      [...codeRemovalAddrs].sort(),
      "code removals must be in sorted address order",
    )

    const nonceResets = rootCall.nonceChanges.filter(
      (nc) => nc.newValue === 0n && childAddrs.some((a) => isSameAddress(a, hexlify(nc.address))),
    )
    expect(nonceResets).to.have.length(3, "root call must have 3 nonce resets for child contracts")

    const nonceResetAddrs = nonceResets.map((nc) => hexlify(nc.address))
    expect(nonceResetAddrs).to.deep.equal([...nonceResetAddrs].sort(), "nonce resets must be in sorted address order")
  })
})
