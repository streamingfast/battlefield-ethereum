import { expect } from "chai"
import hre from "hardhat"
import {
  AbiCoder,
  Contract as EthersContract,
  HDNodeWallet,
  JsonRpcProvider,
  TransactionRequest,
  Wallet,
  concat,
  getAddress,
  hexlify,
  keccak256,
  toBeHex,
  zeroPadValue,
} from "ethers"
import { defaultGasPrice, sendEth } from "./lib/ethereum"
import { fetchFirehoseBlock } from "./lib/firehose"
import { TransactionReceiptResult, waitForTransaction } from "./lib/ethers"
import { activationBlockNumber, fetchOpDevnetRollupConfig, opDevnetL1RpcUrl, RollupConfig } from "./lib/optimism"
import { knownExistingAddress } from "./lib/addresses"
import { eth } from "./lib/money"
import { toBigInt } from "./lib/numbers"
import { owner } from "./global"
import { Block, TransactionTrace_Type, TransactionTraceStatus } from "../pb/sf/ethereum/type/v2/type_pb"

/**
 * OP Stack Karst network upgrade, checked on the OP devnet started by
 * `scripts/optimism/run_optimism_devnet.sh`, which activates Karst a few blocks after genesis.
 * See https://specs.optimism.io/protocol/karst/overview.html for what it changes:
 *
 * - the activation block carries 31 network upgrade deposits (L2 Contract Manager) and a gas
 *   limit raised by their upgrade gas for that block only,
 * - the Osaka EIPs on L2: CLZ opcode (EIP-7939), MODEXP bounds and gas (EIP-7823, EIP-7883),
 *   P256VERIFY gas (EIP-7951) and the 2^24 transaction gas cap (EIP-7825), which deposits bypass,
 * - the bn256 pairing precompile input limit lowered from 427 to 300 pairs.
 *
 * Each probe sits right at the boundary where the pre-Karst and Karst rules disagree, mirroring
 * the `check-karst` conformance checks of the optimism monorepo.
 *
 * Every test is skipped when the chain under test is not an OP devnet with Karst active.
 */

// Number of transactions in the Karst NUT bundle and the gas they add to the activation block.
const KARST_UPGRADE_TX_COUNT = 31
const KARST_UPGRADE_GAS = 55_370_657n

// EIP-7825, deposits are exempt from it.
const TX_GAS_LIMIT_CAP = 16_777_216n

const MODEXP_ADDRESS = "0x0000000000000000000000000000000000000005"
const BN256_PAIRING_ADDRESS = "0x0000000000000000000000000000000000000008"
const P256VERIFY_ADDRESS = "0x0000000000000000000000000000000000000100"

// One (G1, G2) pair of the bn256 pairing precompile input, and the Karst input limit in pairs.
const BN256_PAIR_SIZE = 192
const KARST_BN256_MAX_PAIRS = 300

// Init code computing CLZ(1) = 255 and returning it as the deployed code:
// PUSH1 1, CLZ, PUSH1 0, MSTORE, PUSH1 32, PUSH1 0, RETURN
const CLZ_RETURNING_INIT_CODE = "0x60011e60005260206000f3"

// Init code deploying a runtime that stores CLZ(calldata[0:32]) in slot 0:
// PUSH1 6, PUSH1 10, PUSH0, CODECOPY, PUSH1 6, PUSH0, RETURN || PUSH0, CALLDATALOAD, CLZ, PUSH0, SSTORE, STOP
const CLZ_STORING_INIT_CODE = "0x6006600a5f3960065ff3" + "5f351e5f5500"

// A key prefunded on L1 by builder-playground, unused by the devnet's own services.
const L1_DEPOSITOR_KEY = "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d"

describe("Karst", function () {
  let rollupConfig: RollupConfig
  let activationBlock: number

  before(async function () {
    const config = await fetchOpDevnetRollupConfig()
    if (config?.karst_time === undefined) {
      return this.skip()
    }

    const latest = await hre.ethers.provider.getBlock("latest")
    if (latest === null || latest.timestamp < config.karst_time) {
      return this.skip()
    }

    rollupConfig = config
    activationBlock = activationBlockNumber(config, config.karst_time)
  })

  describe("Network upgrade transactions", function () {
    let block: Block

    before(async function () {
      block = await fetchFirehoseBlock(activationBlock)
    })

    it("activation block holds the L1 info deposit followed by the upgrade deposits", async function () {
      const rpcBlock = await hre.ethers.provider.send("eth_getBlockByNumber", [toBeHex(activationBlock), false])
      const parent = await hre.ethers.provider.getBlock(activationBlock - 1)

      expect(Number(parent!.timestamp)).to.be.lessThan(rollupConfig.karst_time!, "parent must predate Karst")
      expect(toBigInt(block.header!.timestamp!.seconds)).to.equal(BigInt(rollupConfig.karst_time!))

      const hashes = block.transactionTraces.map((trace) => hexlify(trace.hash))
      expect(hashes).to.deep.equal(rpcBlock.transactions, "Firehose transactions must match RPC ones, in order")
      expect(hashes).to.have.length(1 + KARST_UPGRADE_TX_COUNT)

      for (const trace of block.transactionTraces) {
        expect(trace.type).to.equal(TransactionTrace_Type.TRX_TYPE_OPTIMISM_DEPOSIT)
        expect(trace.status, `deposit ${hexlify(trace.hash)}`).to.equal(TransactionTraceStatus.SUCCEEDED)
      }

      const traceGasUsed = block.transactionTraces.reduce((sum, trace) => sum + trace.gasUsed, 0n)
      expect(traceGasUsed).to.equal(block.header!.gasUsed)
      expect(block.header!.gasUsed).to.equal(BigInt(rpcBlock.gasUsed))
    })

    it("activation block gas limit carries the upgrade gas, the next one drops it", async function () {
      const parent = await fetchFirehoseBlock(activationBlock - 1)
      const next = await fetchFirehoseBlock(activationBlock + 1)

      expect(block.header!.gasLimit).to.equal(parent.header!.gasLimit + KARST_UPGRADE_GAS)
      expect(next.header!.gasLimit).to.equal(parent.header!.gasLimit)
    })

    it("upgrade deposits match their snapshots", async function () {
      for (const [index, trace] of block.transactionTraces.slice(1).entries()) {
        await expect([trace, block]).to.trxTraceEqualSnapshot(
          `karst/upgrade_transaction_${String(index).padStart(2, "0")}.expected.json`,
        )
      }
    })
  })

  describe("EIP-7939 - CLZ opcode", function () {
    it("contract creation returning CLZ(1) as code", async function () {
      const result = await sendRaw({ data: CLZ_RETURNING_INIT_CODE, gasLimit: 100_000 })

      expect(await hre.ethers.provider.getCode(result.contractAddress!)).to.equal(zeroPadValue("0xff", 32))
      await expect(result).to.trxTraceEqualSnapshot("karst/clz_returning_creation.expected.json", {
        $contract: result.contractAddress!.toLowerCase().slice(2),
      })
    })

    it("call storing CLZ of its input", async function () {
      const deployment = await sendRaw({ data: CLZ_STORING_INIT_CODE, gasLimit: 100_000 })
      const contract = deployment.contractAddress!

      // 2^200 has 55 leading zero bits.
      const result = await sendRaw({ to: contract, data: toBeHex(1n << 200n, 32), gasLimit: 100_000 })

      expect(await hre.ethers.provider.getStorage(contract, 0)).to.equal(toBeHex(55, 32))
      await expect(result).to.trxTraceEqualSnapshot("karst/clz_storing_call.expected.json", {
        $contract: contract.toLowerCase().slice(2),
      })
    })
  })

  describe("EIP-7883 - MODEXP gas cost", function () {
    // Empty input: 21,000 intrinsic gas, the rest is the precompile's budget.
    it("empty input call pays the 500 gas floor", async function () {
      const result = await sendRaw({ to: MODEXP_ADDRESS, gasLimit: 21_600 })

      expect(result.gasUsed).to.equal(21_500n)
      await expect(result).to.trxTraceEqualSnapshot("karst/modexp_gas_floor.expected.json")
    })

    it("empty input call with the former 200 gas floor runs out of gas", async function () {
      const result = await sendRaw({ to: MODEXP_ADDRESS, gasLimit: 21_300 }, true)

      await expect(result).to.trxTraceEqualSnapshot("karst/modexp_below_gas_floor.expected.json")
    })
  })

  describe("EIP-7823 - MODEXP input bounds", function () {
    it("call within the 1024 bytes bounds succeeds", async function () {
      // 2^3 mod 5 = 3
      const result = await sendRaw({ to: MODEXP_ADDRESS, data: modExpInput("0x02", "0x03", "0x05"), gasLimit: 200_000 })

      await expect(result).to.trxTraceEqualSnapshot("karst/modexp_within_bounds.expected.json")
    })

    it("call with a 1025 bytes modulus fails", async function () {
      const modulus = new Uint8Array(1025)
      modulus[1024] = 5

      const result = await sendRaw(
        { to: MODEXP_ADDRESS, data: modExpInput("0x02", "0x03", hexlify(modulus)), gasLimit: 2_000_000 },
        true,
      )

      expect(result.gasUsed).to.equal(2_000_000n, "a failing precompile consumes all the gas it receives")
      await expect(result).to.trxTraceEqualSnapshot("karst/modexp_over_bounds.expected.json")
    })
  })

  describe("EIP-7951 - P256VERIFY gas cost", function () {
    it("call pays 6,900 gas", async function () {
      const result = await sendRaw({ to: P256VERIFY_ADDRESS, gasLimit: 28_000 })

      expect(result.gasUsed).to.equal(27_900n)
      await expect(result).to.trxTraceEqualSnapshot("karst/p256verify_gas.expected.json")
    })

    it("call with the former 3,450 gas cost runs out of gas", async function () {
      const result = await sendRaw({ to: P256VERIFY_ADDRESS, gasLimit: 24_500 }, true)

      await expect(result).to.trxTraceEqualSnapshot("karst/p256verify_below_gas.expected.json")
    })
  })

  describe("bn256 pairing input limit", function () {
    // An all-zero input pairs points at infinity, which succeeds.
    it("call with 300 pairs succeeds", async function () {
      const input = hexlify(new Uint8Array(KARST_BN256_MAX_PAIRS * BN256_PAIR_SIZE))
      const result = await sendRaw({ to: BN256_PAIRING_ADDRESS, data: input, gasLimit: 12_000_000 })

      await expect(result).to.trxTraceEqualSnapshot("karst/bn256_pairing_at_limit.expected.json")
    })

    it("call with 301 pairs fails", async function () {
      const input = hexlify(new Uint8Array((KARST_BN256_MAX_PAIRS + 1) * BN256_PAIR_SIZE))
      const result = await sendRaw({ to: BN256_PAIRING_ADDRESS, data: input, gasLimit: 12_000_000 }, true)

      expect(result.gasUsed).to.equal(12_000_000n, "a failing precompile consumes all the gas it receives")
      await expect(result).to.trxTraceEqualSnapshot("karst/bn256_pairing_over_limit.expected.json")
    })
  })

  describe("EIP-7825 - Transaction gas limit cap", function () {
    // A dedicated wallet: `owner` is a NonceManager, which would lose the nonce of the rejected
    // transaction and leave every later one stuck behind it.
    let sender: HDNodeWallet

    before(async function () {
      sender = Wallet.createRandom(hre.ethers.provider)
      await sendEth(owner, sender.address, eth(1))
    })

    it("transaction with a 2^24 gas limit is included", async function () {
      const response = await sender.sendTransaction({
        to: knownExistingAddress,
        value: 1n,
        gasLimit: TX_GAS_LIMIT_CAP,
        gasPrice: defaultGasPrice,
      })
      const result = await waitForTransaction(response, false)

      await expect(result).to.trxTraceEqualSnapshot("karst/transfer_at_gas_cap.expected.json", {
        $sender: sender.address.toLowerCase().slice(2),
      })
    })

    it("transaction above the 2^24 gas limit is rejected", async function () {
      const error = await sender
        .sendTransaction({
          to: knownExistingAddress,
          value: 1n,
          gasLimit: TX_GAS_LIMIT_CAP + 1n,
          gasPrice: defaultGasPrice,
        })
        .then(
          (response) => new Error(`transaction ${response.hash} above the gas limit cap was accepted`),
          (error: Error) => error,
        )

      expect(error.message).to.match(/gas limit/i)
    })

    it("deposit above the 2^24 gas limit is included", async function () {
      this.timeout(4 * 60 * 1000)

      const l1Provider = new JsonRpcProvider(opDevnetL1RpcUrl)
      const depositor = new Wallet(L1_DEPOSITOR_KEY, l1Provider)
      const portal = new EthersContract(
        rollupConfig.deposit_contract_address,
        [
          "function depositTransaction(address _to, uint256 _value, uint64 _gasLimit, bool _isCreation, bytes _data) payable",
        ],
        depositor,
      )

      const l2Start = await hre.ethers.provider.getBlockNumber()
      const depositGasLimit = TX_GAS_LIMIT_CAP + 1n

      // The portal burns L1 gas in proportion to the L2 gas bought, well above an estimate's margin.
      const l1Response = await portal.depositTransaction(knownExistingAddress, 0n, depositGasLimit, false, "0x", {
        gasLimit: 20_000_000,
      })
      const l1Receipt = await l1Response.wait()
      expect(l1Receipt.status).to.equal(1, "L1 deposit transaction failed")

      const depositEvent = l1Receipt.logs.find(
        (log: { address: string }) => getAddress(log.address) === getAddress(rollupConfig.deposit_contract_address),
      )
      expect(depositEvent, "TransactionDeposited event not found").to.not.be.undefined

      const sourceHash = userDepositSourceHash(l1Receipt.blockHash, depositEvent.index)
      const depositHash = await findL2DepositHash(sourceHash, l2Start, 3 * 60 * 1000)

      const receipt = await hre.ethers.provider.getTransactionReceipt(depositHash)
      expect(receipt!.status).to.equal(1)

      const transaction = await hre.ethers.provider.getTransaction(depositHash)
      expect(transaction!.gasLimit).to.equal(depositGasLimit)

      const result = new TransactionReceiptResult(receipt!, receipt!.provider)
      result.nonce = BigInt(transaction!.nonce)

      await expect(result).to.trxTraceEqualSnapshot("karst/deposit_above_gas_cap.expected.json")
    })
  })
})

async function sendRaw(
  request: Pick<TransactionRequest, "to" | "data" | "gasLimit">,
  shouldRevert = false,
): Promise<TransactionReceiptResult> {
  const response = await owner.sendTransaction({ ...request, gasPrice: defaultGasPrice })
  return waitForTransaction(response, shouldRevert)
}

function modExpInput(base: string, exponent: string, modulus: string): string {
  const length = (value: string) => toBeHex((value.length - 2) / 2, 32)
  return concat([length(base), length(exponent), length(modulus), base, exponent, modulus])
}

// Source hash of a user deposit, see https://specs.optimism.io/protocol/deposits.html#source-hash-computation
function userDepositSourceHash(l1BlockHash: string, logIndex: number): string {
  const coder = AbiCoder.defaultAbiCoder()
  const depositId = keccak256(coder.encode(["bytes32", "uint256"], [l1BlockHash, logIndex]))
  return keccak256(coder.encode(["uint256", "bytes32"], [0, depositId]))
}

async function findL2DepositHash(sourceHash: string, fromBlock: number, timeoutMs: number): Promise<string> {
  const deadline = Date.now() + timeoutMs
  let next = fromBlock

  while (Date.now() < deadline) {
    const head = await hre.ethers.provider.getBlockNumber()
    for (; next <= head; next++) {
      const block = await hre.ethers.provider.send("eth_getBlockByNumber", [toBeHex(next), true])
      const deposit = block.transactions.find((trx: { sourceHash?: string }) => trx.sourceHash === sourceHash)
      if (deposit !== undefined) {
        return deposit.hash
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 1_000))
  }

  throw new Error(`Deposit with source hash ${sourceHash} not found on L2 after ${timeoutMs}ms`)
}
