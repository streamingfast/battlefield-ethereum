import { expect } from "chai"
import { mustGetRpcBlock, sendEth, defaultGasPrice, deployContract } from "./lib/ethereum"
import { fetchFirehoseTransactionAndBlock } from "./lib/firehose"
import { isBlockOnPragueOrLater } from "./lib/chain_eips"
import { CodeChange, TransactionTrace, TransactionTrace_Type } from "../pb/sf/ethereum/type/v2/type_pb"
import { owner } from "./global"
import { isSameAddress } from "./lib/addresses"
import { waitForTransaction } from "./lib/ethers"
import { Wallet, concat, getBytes, hexlify } from "ethers"
import { eth } from "./lib/money"
import hre from "hardhat"
import { SetCode7702Caller__factory } from "../typechain-types"

/**
 * Prague (EIP-7702) SetCode transaction tests.
 *
 * Mirrors the Go test TestFirehose_EIP7702 in:
 * go-ethereum/eth/tracers/internal/tracetest/firehose/firehose_test.go
 *
 * The test replicates a three-transaction scenario:
 *   TX1 (SetCodeTx)  – wallet1 delegates to Caller, wallet2 delegates to Setter (with overwrite)
 *   TX2 (LegacyTx)   – executes the delegation chain: Caller calls Setter which does SSTORE
 *   TX3 (SetCodeTx)  – wallet1 resets (clears) its delegation with a zero-address auth
 *
 * If the connected chain does not support Prague (no requestsHash in block header),
 * every test returns successfully without assertions.
 */
describe("Prague", function () {
  // Private keys from the Go test (TestFirehose_EIP7702 in firehose_test.go)
  const key1 = "0xb71c71a67e1177ad4e901695e1b4b9ee17ae16c6668d313eac2f96dbcda3f291"
  const key2 = "0x8a1f9a8f95be41cd7ccb6168179afb4504aefe388d1e14474d32c45c72ce7b7a"

  let wallet1: Wallet
  let wallet2: Wallet

  // Contract addresses matching the Go test roles:
  //   callerAddress  ≙ 0xAAAA  – calls wallet2 with 1 wei when invoked
  //   setterCCAddress ≙ 0xCCCC – stores 0x42 in slot 0x42 (wallet2 initial delegation, later overwritten)
  //   setterBBAddress ≙ 0xBBBB – stores 0x42 in slot 0x42 (wallet2 final delegation)
  let callerAddress: string
  let setterCCAddress: string
  let setterBBAddress: string

  before(async function () {
    const rpcBlock = await mustGetRpcBlock("latest")
    if (!isBlockOnPragueOrLater(rpcBlock)) {
      this.skip()
    }

    wallet1 = new Wallet(key1, hre.ethers.provider)
    wallet2 = new Wallet(key2, hre.ethers.provider)

    // Fund both EOAs so they can pay gas and forward value.
    // Use a higher gasLimit than the default 21000 because on repeated test runs against the
    // same chain, wallet2 may still carry delegation code from a previous run (we only reset
    // wallet1 in TX3).  If delegation code is present the plain ETH transfer executes the
    // delegated contract, which requires more gas (e.g. SetterBB does an SSTORE).
    await sendEth(owner, wallet1.address, eth(1), { gasLimit: 100_000 })
    await sendEth(owner, wallet2.address, eth(1), { gasLimit: 100_000 })

    // Deploy the Caller and two Setter instances (CC and BB are identical code, different addresses)
    const CallerFactory = await hre.ethers.getContractFactory("SetCode7702Caller")
    const SetterFactory = await hre.ethers.getContractFactory("SetCode7702Setter")

    const caller = await deployContract(owner, CallerFactory, [])
    const setterCC = await deployContract(owner, SetterFactory, [])
    const setterBB = await deployContract(owner, SetterFactory, [])

    callerAddress = caller.address
    setterCCAddress = setterCC.address
    setterBBAddress = setterBB.address
  })

  it("SetCode transaction sets delegation codes via authorization list", async function () {
    const chainId = (await hre.ethers.provider.getNetwork()).chainId
    const wallet1Nonce = await wallet1.getNonce()
    const wallet2Nonce = await wallet2.getNonce()

    // auth1 (mirrors Go test auth1):
    //   wallet1 → callerContract
    //   nonce = wallet1Nonce + 1 because the SetCodeTx itself increments wallet1's nonce first
    const auth1 = wallet1.authorizeSync({
      address: callerAddress,
      nonce: wallet1Nonce + 1,
      chainId,
    })

    // auth2 (mirrors Go test auth2OverwrittenLaterInList):
    //   wallet2 → setterCC (chain-id 0 = valid on any chain)
    //   This is later overwritten by auth4
    const auth2 = wallet2.authorizeSync({
      address: setterCCAddress,
      nonce: wallet2Nonce,
      chainId: 0n,
    })

    // auth3 (mirrors Go test auth3InvalidAuthority):
    //   A copy of auth2 but with a zero/invalid signature so ECRECOVER fails.
    //   The EVM must silently skip this authorization.
    const auth3InvalidAuthority = {
      address: setterCCAddress,
      nonce: wallet2Nonce,
      chainId: 0n,
      signature: {
        v: 28,
        r: "0x" + "00".repeat(32),
        s: "0x" + "00".repeat(32),
      },
    }

    // auth4 (mirrors Go test auth4):
    //   wallet2 → setterBB, overwrites auth2
    //   nonce = wallet2Nonce + 1 because auth2 increments wallet2's nonce to wallet2Nonce+1
    const auth4 = wallet2.authorizeSync({
      address: setterBBAddress,
      nonce: wallet2Nonce + 1,
      chainId,
    })

    // auth5 (mirrors Go test auth5InvalidNonce):
    //   Same nonce as auth4 but wallet2's nonce is already wallet2Nonce+2 after auth4, so invalid.
    const auth5InvalidNonce = wallet2.authorizeSync({
      address: setterBBAddress,
      nonce: wallet2Nonce + 1,
      chainId,
    })

    // calldata: Caller.callTarget(wallet2.address)
    // When the SetCodeTx executes, wallet1 (delegated to Caller) will call wallet2 with 1 wei.
    const callerIface = SetCode7702Caller__factory.createInterface()
    const calldata = callerIface.encodeFunctionData("callTarget", [wallet2.address])

    // TX1: type-4 SetCode transaction
    const tx1Response = await wallet1.sendTransaction({
      to: wallet1.address,
      nonce: wallet1Nonce,
      data: calldata,
      gasLimit: 500_000n,
      maxFeePerGas: BigInt(defaultGasPrice),
      maxPriorityFeePerGas: 25_000n,
      type: 4,
      authorizationList: [auth1, auth2, auth3InvalidAuthority, auth4, auth5InvalidNonce],
    })
    const tx1Result = await waitForTransaction(tx1Response, false)
    const { trace: trace1 } = await fetchFirehoseTransactionAndBlock(tx1Result)

    expect(trace1.type).to.equal(TransactionTrace_Type.TRX_TYPE_SET_CODE, "TX1 must be TRX_TYPE_SET_CODE")

    // wallet1 should have exactly one code change: delegation to callerAddress
    const wallet1Changes = findCodeChanges(trace1, wallet1.address)
    expect(wallet1Changes).to.have.length(1, "wallet1 should have exactly one code change (delegation set)")
    expect(hexlify(wallet1Changes[0].newCode)).to.equal(
      delegationCode(callerAddress),
      "wallet1 new code must be the EIP-7702 delegation to callerAddress",
    )

    // wallet2 should have exactly two code changes:
    //   1. delegation to setterCC (from auth2)
    //   2. delegation to setterBB (from auth4, overwriting auth2)
    // auth3 (invalid signature) and auth5 (stale nonce) must NOT produce a code change.
    const wallet2Changes = findCodeChanges(trace1, wallet2.address)
    expect(wallet2Changes).to.have.length(2, "wallet2 should have two code changes (auth2 then auth4 overwrite)")
    expect(hexlify(wallet2Changes[0].newCode)).to.equal(
      delegationCode(setterCCAddress),
      "wallet2 first code change must delegate to setterCC (auth2)",
    )
    expect(hexlify(wallet2Changes[1].newCode)).to.equal(
      delegationCode(setterBBAddress),
      "wallet2 second code change must delegate to setterBB (auth4 overwrite)",
    )

    // TX1 authorization list: 5 entries mirroring the Go test
    expect(trace1.setCodeAuthorizations).to.have.length(
      5,
      "TX1 must record all 5 authorizations in setCodeAuthorizations",
    )

    // auth[0] = auth1: wallet1 → callerAddress, valid signature + nonce change → NOT discarded
    const a1 = trace1.setCodeAuthorizations[0]
    expect(a1.discarded).to.equal(false, "auth1 must not be discarded")
    expect(hexlify(a1.authority!)).to.equal(wallet1.address.toLowerCase(), "auth1 authority must be wallet1")
    expect(hexlify(a1.address)).to.equal(callerAddress.toLowerCase(), "auth1 address must be callerAddress")
    expect(a1.nonce).to.equal(BigInt(wallet1Nonce + 1), "auth1 nonce must be wallet1Nonce+1")

    // auth[1] = auth2: wallet2 → setterCC (chainId=0), valid signature + nonce change → NOT discarded
    const a2 = trace1.setCodeAuthorizations[1]
    expect(a2.discarded).to.equal(false, "auth2 must not be discarded")
    expect(hexlify(a2.authority!)).to.equal(wallet2.address.toLowerCase(), "auth2 authority must be wallet2")
    expect(hexlify(a2.address)).to.equal(setterCCAddress.toLowerCase(), "auth2 address must be setterCCAddress")
    expect(a2.nonce).to.equal(BigInt(wallet2Nonce), "auth2 nonce must be wallet2Nonce")

    // auth[2] = auth3: zero/invalid signature → ECRECOVER fails → authority empty → discarded
    const a3 = trace1.setCodeAuthorizations[2]
    expect(a3.discarded).to.equal(true, "auth3 (invalid signature) must be discarded")
    expect(a3.authority).to.satisfy(
      (v: Uint8Array | undefined) => v === undefined || v.length === 0,
      "auth3 authority must be empty (signature recovery failed)",
    )

    // auth[3] = auth4: wallet2 → setterBB, valid signature + nonce change → NOT discarded
    const a4 = trace1.setCodeAuthorizations[3]
    expect(a4.discarded).to.equal(false, "auth4 must not be discarded")
    expect(hexlify(a4.authority!)).to.equal(wallet2.address.toLowerCase(), "auth4 authority must be wallet2")
    expect(hexlify(a4.address)).to.equal(setterBBAddress.toLowerCase(), "auth4 address must be setterBBAddress")
    expect(a4.nonce).to.equal(BigInt(wallet2Nonce + 1), "auth4 nonce must be wallet2Nonce+1")

    // auth[4] = auth5: wallet2, same nonce as auth4 (wallet2Nonce+1), nonce change already consumed → discarded
    const a5 = trace1.setCodeAuthorizations[4]
    expect(a5.discarded).to.equal(true, "auth5 (stale nonce) must be discarded")
    expect(hexlify(a5.authority!)).to.equal(
      wallet2.address.toLowerCase(),
      "auth5 authority must be wallet2 (valid sig)",
    )

    await expect(tx1Result).to.trxTraceEqualSnapshot("prague/setcode_set_delegations.expected.json", {
      $wallet1: wallet1.address.toLowerCase().slice(2),
      $wallet2: wallet2.address.toLowerCase().slice(2),
      $callerContract: callerAddress.toLowerCase().slice(2),
      $setterCC: setterCCAddress.toLowerCase().slice(2),
      $setterBB: setterBBAddress.toLowerCase().slice(2),
    })
  })

  it("Delegated EOA executes delegation code on subsequent legacy call", async function () {
    // wallet1 is now delegated to Caller (from TX1).
    // wallet2 is now delegated to SetterBB (from TX1).
    // Sending a legacy tx to wallet1 triggers Caller which calls wallet2 which runs SetterBB.
    const callerIface = SetCode7702Caller__factory.createInterface()
    const calldata = callerIface.encodeFunctionData("callTarget", [wallet2.address])
    const wallet1Nonce = await wallet1.getNonce()

    // TX2: legacy transaction (mirrors Go test block i==1 LegacyTx)
    const tx2Response = await wallet1.sendTransaction({
      to: wallet1.address,
      nonce: wallet1Nonce,
      data: calldata,
      gasLimit: 500_000n,
      gasPrice: 500_000_000_000n, // 500 gwei (matches Go test newGwei(500))
      type: 0,
    })
    const tx2Result = await waitForTransaction(tx2Response, false)
    const { trace: trace2 } = await fetchFirehoseTransactionAndBlock(tx2Result)

    expect(trace2.type).to.equal(TransactionTrace_Type.TRX_TYPE_LEGACY, "TX2 must be TRX_TYPE_LEGACY")

    // The delegation chain executed: there must be at least one sub-call (wallet1 → wallet2)
    expect(trace2.calls.length).to.be.above(1, "TX2 delegation chain must produce sub-calls")

    // No code changes should occur – TX2 does not set any delegation
    const wallet1Changes = findCodeChanges(trace2, wallet1.address)
    expect(wallet1Changes).to.have.length(0, "TX2 must not produce code changes for wallet1")
    const wallet2Changes = findCodeChanges(trace2, wallet2.address)
    expect(wallet2Changes).to.have.length(0, "TX2 must not produce code changes for wallet2")

    // EIP-7702 delegation tracking via addressDelegatesTo:
    //   calls[0] is sent to wallet1.address which is delegated to callerAddress
    //   → address must be wallet1.address, addressDelegatesTo must equal callerAddress
    expect(hexlify(trace2.calls[0].address)).to.equal(
      wallet1.address.toLowerCase(),
      "TX2 root call address must be wallet1.address",
    )
    expect(trace2.calls[0].addressDelegatesTo).to.not.be.undefined.and.not.be.null
    expect(hexlify(trace2.calls[0].addressDelegatesTo!)).to.equal(
      callerAddress.toLowerCase(),
      "TX2 root call to wallet1 must show addressDelegatesTo = callerAddress",
    )

    // Find the sub-call to wallet2.address (which is delegated to setterBBAddress)
    const callToWallet2 = trace2.calls.find((c) => isSameAddress(hexlify(c.address), wallet2.address))
    expect(callToWallet2).to.not.be.undefined
    expect(hexlify(callToWallet2!.address)).to.equal(
      wallet2.address.toLowerCase(),
      "TX2 sub-call address must be wallet2.address",
    )
    expect(callToWallet2!.addressDelegatesTo).to.not.be.undefined.and.not.be.null
    expect(hexlify(callToWallet2!.addressDelegatesTo!)).to.equal(
      setterBBAddress.toLowerCase(),
      "TX2 sub-call to wallet2 must show addressDelegatesTo = setterBBAddress",
    )
  })

  it("SetCode transaction with zero-address authorization resets delegation", async function () {
    const chainId = (await hre.ethers.provider.getNetwork()).chainId
    const wallet1Nonce = await wallet1.getNonce()

    // auth1Reset (mirrors Go test auth1Reset):
    //   wallet1 → zero address clears the delegation (reverts wallet1 to a plain EOA)
    const auth1Reset = wallet1.authorizeSync({
      address: "0x0000000000000000000000000000000000000000",
      nonce: wallet1Nonce + 1, // after SetCodeTx increments wallet1's nonce
      chainId,
    })

    // TX3: SetCode transaction that resets wallet1's delegation
    const tx3Response = await wallet1.sendTransaction({
      to: wallet1.address,
      nonce: wallet1Nonce,
      gasLimit: 500_000n,
      maxFeePerGas: BigInt(defaultGasPrice),
      maxPriorityFeePerGas: 25_000n,
      type: 4,
      authorizationList: [auth1Reset],
    })
    const tx3Result = await waitForTransaction(tx3Response, false)
    const { trace: trace3 } = await fetchFirehoseTransactionAndBlock(tx3Result)

    expect(trace3.type).to.equal(TransactionTrace_Type.TRX_TYPE_SET_CODE, "TX3 must be TRX_TYPE_SET_CODE")

    // wallet1's delegation must be cleared: one code change with empty newCode
    const wallet1Changes = findCodeChanges(trace3, wallet1.address)
    expect(wallet1Changes).to.have.length(1, "wallet1 should have exactly one code change (delegation cleared)")
    expect(wallet1Changes[0].newCode).to.have.length(0, "wallet1 newCode must be empty after delegation reset")

    // TX3 authorization list: 1 entry (auth1Reset) → valid signature + nonce change → NOT discarded
    expect(trace3.setCodeAuthorizations).to.have.length(1, "TX3 must record the single reset authorization")
    const a1Reset = trace3.setCodeAuthorizations[0]
    expect(a1Reset.discarded).to.equal(false, "auth1Reset must not be discarded")
    expect(hexlify(a1Reset.authority!)).to.equal(wallet1.address.toLowerCase(), "auth1Reset authority must be wallet1")
    expect(hexlify(a1Reset.address)).to.equal(
      "0x0000000000000000000000000000000000000000",
      "auth1Reset address must be zero address (clear delegation)",
    )
    expect(a1Reset.nonce).to.equal(BigInt(wallet1Nonce + 1), "auth1Reset nonce must be wallet1Nonce+1")
  })
})

/**
 * Collects all CodeChange entries for a given address across every call in the trace.
 */
function findCodeChanges(trace: TransactionTrace, address: string): CodeChange[] {
  const result: CodeChange[] = []
  for (const c of trace.calls) {
    for (const cc of c.codeChanges) {
      if (isSameAddress(cc.address, address)) {
        result.push(cc)
      }
    }
  }
  return result
}

/**
 * Returns the 23-byte EIP-7702 delegation designator for a given target address:
 *   0xef0100 || <20-byte address>
 */
function delegationCode(address: string): string {
  return hexlify(concat([getBytes("0xef0100"), getBytes(address)]))
}
