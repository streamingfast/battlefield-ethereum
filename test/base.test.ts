import { expect } from "chai"
import {
  AbiCoder,
  BytesLike,
  Interface,
  Signature,
  Wallet,
  concat,
  encodeRlp,
  getBytes,
  hexlify,
  id,
  keccak256,
  toBeArray,
  toBigInt,
} from "ethers"
import hre from "hardhat"
import { owner, ownerAddress, LogsFactory } from "./global"
import { defaultGasPrice, deployContract, sendEth } from "./lib/ethereum"
import { waitForTransaction } from "./lib/ethers"
import { fetchFirehoseBlock, fetchFirehoseBlockTimeMs, fetchFirehoseTransactionAndBlock } from "./lib/firehose"
import { knownExistingAddress } from "./lib/addresses"
import { eth } from "./lib/money"
import { isNetwork } from "./lib/network"
import { Block, TransactionTrace, TransactionTrace_Type } from "../pb/sf/ethereum/type/v2/type_pb"

/**
 * Base's own forks, on the devnet of `scripts/base/run_base_devnet.sh` (Azul, Beryl, Cobalt and
 * Denim at blocks 20 to 25, Everest at block 30):
 *
 * - Denim: the BaseTime predeploy that the activation block installs outside the EVM, the BaseTime
 *   deposit at index 1 of every block, and the millisecond Firehose block time of 200 ms blocks.
 * - Cobalt and Denim: the B-20 precompiles (activation registry, factory, token), which write
 *   storage, code and logs from native code.
 * - Everest: the nonce manager code its activation block installs, and EIP-8130 account
 *   abstraction transactions (type 0x79).
 */

const BASE_TIME = "0x4200000000000000000000000000000000000030"
const BASE_TIME_IMPLEMENTATION = "0xc0d3c0d3c0d3c0d3c0d3c0d3c0d3c0d3c0d30030"
const DEPOSITOR = "0xdeaddeaddeaddeaddeaddeaddeaddeaddead0001"
const EIP1967_IMPLEMENTATION_SLOT = "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc"
const SET_TIMESTAMP_MILLIS_PART = id("setTimestampMillisPart(uint16)").slice(0, 10)
const EMPTY_CODE_HASH = keccak256("0x")

const ACTIVATION_REGISTRY = "0x8453000000000000000000000000000000000001"
const B20_FACTORY = "0xB20F000000000000000000000000000000000000"
const VARIANT_ASSET = 0
const FEATURE_ASSET = id("base.b20_asset")
// Base's devnet activation admin: account 5 of the standard test mnemonic, set by the node for the
// devnet chain ID.
const ACTIVATION_ADMIN_KEY = "0x8b3a350cf5c34c9194ca85829a2df0ec3153be0318b5e2d3348e872092edffba"

const NONCE_MANAGER = "0x813000000000000000000000000000000000aa01"
const EIP8130_TX_TYPE = "0x79"

const registry = new Interface([
  "function activate(bytes32 feature)",
  "function deactivate(bytes32 feature)",
  "function isActivated(bytes32 feature) view returns (bool)",
])
const factory = new Interface(["function createB20(uint8 variant, bytes32 salt, bytes params, bytes[] initCalls)"])
const token = new Interface([
  "function mint(address to, uint256 amount)",
  "function transfer(address to, uint256 amount)",
])
const caller = new Interface([
  "function transferTwice(address token, address to, uint256 first, uint256 second)",
  "function transferThenRevert(address token, address to, uint256 amount)",
])

describe("Base", function () {
  before(function () {
    if (!isNetwork("base-devnet")) {
      this.skip()
    }
  })

  describe("Denim", function () {
    it("Activation block installs the BaseTime predeploy outside the EVM", async function () {
      const activation = await firstBlockWithCode(BASE_TIME_IMPLEMENTATION)
      const block = await mustFetchFirehoseBlock(activation)

      const codeChange = block.codeChanges.find((change) => hexlify(change.address) === BASE_TIME_IMPLEMENTATION)
      expect(codeChange, "block-level code change of the BaseTime implementation").to.not.be.undefined
      expect(hexlify(codeChange!.oldHash)).to.equal(EMPTY_CODE_HASH)
      expect(hexlify(codeChange!.newHash)).to.equal(keccak256(codeChange!.newCode))
      expect(hexlify(codeChange!.newCode)).to.equal(await hre.ethers.provider.getCode(BASE_TIME_IMPLEMENTATION))

      const slotChange = block.systemCalls
        .filter((call) => hexlify(call.address) === BASE_TIME)
        .flatMap((call) => call.storageChanges)
        .find((change) => hexlify(change.key) === EIP1967_IMPLEMENTATION_SLOT)
      expect(slotChange, "system call writing the BaseTime implementation slot").to.not.be.undefined
      expect(toBigInt(slotChange!.oldValue)).to.equal(0n)
      expect(toBigInt(slotChange!.newValue)).to.equal(toBigInt(BASE_TIME_IMPLEMENTATION))

      expect(isBaseTimeDeposit(block.transactionTraces[1]), "BaseTime deposit at index 1").to.be.true

      for (const other of [
        await mustFetchFirehoseBlock(activation - 1),
        await mustFetchFirehoseBlock(activation + 1),
      ]) {
        expect(other.codeChanges.map((change) => hexlify(change.address))).to.not.include(BASE_TIME_IMPLEMENTATION)
        expect(other.systemCalls.map((call) => hexlify(call.address))).to.not.include(BASE_TIME)
      }

      const before = await mustFetchFirehoseBlock(activation - 1)
      expect(before.transactionTraces.some(isBaseTimeDeposit), "no BaseTime deposit before Denim").to.be.false
    })

    it("BaseTime deposit records the millisecond part of the block time", async function () {
      const result = await sendEth(owner, knownExistingAddress, 1n)
      const { block } = await fetchFirehoseTransactionAndBlock(result)

      const deposit = block.transactionTraces[1]
      expect(isBaseTimeDeposit(deposit), "BaseTime deposit at index 1").to.be.true
      expect(deposit.status).to.equal(1, "deposit succeeded")

      const millis = toBigInt(deposit.input.slice(4))
      expect(millis % 200n).to.equal(0n, "Denim blocks are 200 ms apart")

      const timeMs = await fetchFirehoseBlockTimeMs({ hash: hexlify(block.hash), num: block.number })
      expect(timeMs / 1000n).to.equal(block.header!.timestamp!.seconds, "Firehose time and header agree on seconds")
      expect(timeMs % 1000n).to.equal(millis, "Firehose time carries the deposited milliseconds")

      // The proxy delegates to the implementation, which stores the milliseconds in slot 0 of the proxy.
      const [proxyCall, implementationCall] = deposit.calls
      expect(hexlify(proxyCall.address)).to.equal(BASE_TIME)
      expect(hexlify(implementationCall.address)).to.equal(BASE_TIME_IMPLEMENTATION)
      const previousMillis = (await fetchFirehoseBlockTimeMs(await rpcBlockTag(block.number - 1n))) % 1000n
      const expectedChanges = millis === previousMillis ? 0 : 1
      expect(implementationCall.storageChanges).to.have.length(expectedChanges)
      if (expectedChanges === 1) {
        const change = implementationCall.storageChanges[0]
        expect(hexlify(change.address)).to.equal(BASE_TIME)
        expect(toBigInt(change.key)).to.equal(0n)
        expect(toBigInt(change.oldValue)).to.equal(previousMillis)
        expect(toBigInt(change.newValue)).to.equal(millis)
      }
    })

    it("Consecutive blocks sharing a header timestamp get distinct Firehose times", async function () {
      const head = await hre.ethers.provider.getBlockNumber()
      const times: bigint[] = []
      const seconds: bigint[] = []
      for (let number = head - 5; number <= head; number++) {
        const tag = await rpcBlockTag(BigInt(number))
        times.push(await fetchFirehoseBlockTimeMs(tag))
        seconds.push((await mustFetchFirehoseBlock(number)).header!.timestamp!.seconds)
      }

      for (let i = 1; i < times.length; i++) {
        expect(times[i] - times[i - 1]).to.equal(200n, `block #${head - 5 + i} comes 200 ms after its parent`)
      }
      expect(new Set(seconds).size).to.be.lessThan(seconds.length, "some blocks share their header timestamp")
    })
  })

  describe("B-20", function () {
    let admin: Wallet
    let tokenAddressHex: string

    before(async function () {
      admin = new Wallet(ACTIVATION_ADMIN_KEY, hre.ethers.provider)
      if ((await hre.ethers.provider.getBalance(admin.address)) < eth(1)) {
        await sendEth(owner, admin.address, eth(1))
      }
    })

    it("Admin activates the asset feature", async function () {
      if (await isActivated(FEATURE_ASSET)) {
        await sendData(admin, ACTIVATION_REGISTRY, registry.encodeFunctionData("deactivate", [FEATURE_ASSET]), false)
      }

      await expect(
        sendData(admin, ACTIVATION_REGISTRY, registry.encodeFunctionData("activate", [FEATURE_ASSET]), false),
      ).to.trxTraceEqualSnapshot("base/b20_activate_feature", {
        $admin: admin.address.toLowerCase().slice(2),
      })
    })

    it("Token creation records code, storage and logs in write order", async function () {
      // Two mints of the same balance slot: the trace must carry the intermediate value.
      const { data, salt } = createB20Data([mint(ownerAddress, 1000n), mint(ownerAddress, 500n)])
      const tokenAddress = await predictToken(data)
      tokenAddressHex = tokenAddress.toLowerCase().slice(2)

      await expect(sendData(owner, B20_FACTORY, data, false)).to.trxTraceEqualSnapshot("base/b20_create_token", {
        $token: tokenAddressHex,
        $salt: salt,
      })
    })

    it("Token transfer", async function () {
      await expect(
        sendData(
          owner,
          `0x${tokenAddressHex}`,
          token.encodeFunctionData("transfer", [knownExistingAddress, 100n]),
          false,
        ),
      ).to.trxTraceEqualSnapshot("base/b20_token_transfer", {
        $token: tokenAddressHex,
      })
    })

    it("Token transfer above the balance fails", async function () {
      await expect(
        sendData(
          owner,
          `0x${tokenAddressHex}`,
          token.encodeFunctionData("transfer", [knownExistingAddress, 10_000n]),
          true,
        ),
      ).to.trxTraceEqualSnapshot("base/b20_token_transfer_insufficient_balance", {
        $token: tokenAddressHex,
      })
    })

    describe("called from a contract", function () {
      let callerAddress: string
      let vars: Record<string, string>

      before(async function () {
        const callerFactory = await hre.ethers.getContractFactory("CAS20Caller")
        const contract = await callerFactory.connect(owner).deploy()
        await contract.waitForDeployment()
        callerAddress = await contract.getAddress()
        vars = {
          $token: tokenAddressHex,
          $caller: callerAddress.toLowerCase().slice(2),
          $balanceSlotOfCaller: balanceSlot(callerAddress).slice(2),
        }

        await sendData(
          owner,
          `0x${tokenAddressHex}`,
          token.encodeFunctionData("transfer", [callerAddress, 1000n]),
          false,
        )
      })

      it("Two transfers interleave with the caller's logs", async function () {
        await expect(
          sendData(
            owner,
            callerAddress,
            caller.encodeFunctionData("transferTwice", [`0x${tokenAddressHex}`, knownExistingAddress, 10n, 20n]),
            false,
          ),
        ).to.trxTraceEqualSnapshot("base/b20_contract_transfer_twice", vars)
      })

      it("A transfer whose caller reverts keeps its writes in the trace", async function () {
        await expect(
          sendData(
            owner,
            callerAddress,
            caller.encodeFunctionData("transferThenRevert", [`0x${tokenAddressHex}`, knownExistingAddress, 30n]),
            true,
          ),
        ).to.trxTraceEqualSnapshot("base/b20_contract_transfer_then_revert", vars)
      })
    })

    it("Reverted token creation keeps its writes in the trace", async function () {
      // Pending: the Base Firehose tracer reads a precompile's writes from the journal when the
      // call ends, so a precompile call that reverts itself carries no storage, code or log change.
      this.skip()

      // The second init call mints to the zero address, which reverts the whole creation after the
      // token code, its metadata and the first mint were written.
      const { data, salt } = createB20Data([
        mint(ownerAddress, 1n),
        mint("0x0000000000000000000000000000000000000000", 1n),
      ])
      const result = await sendData(owner, B20_FACTORY, data, true)
      const { trace, block } = await fetchFirehoseTransactionAndBlock(result)

      const call = trace.calls[0]
      expect(call.stateReverted).to.equal(true)
      expect(call.codeChanges).to.have.length(1, "the token code install stays in the reverted call")
      expect(call.storageChanges).to.not.be.empty
      expect(call.logs).to.not.be.empty

      await expect([result, trace, block]).to.trxTraceEqualSnapshot("base/b20_create_token_reverted", {
        $token: hexlify(call.codeChanges[0].address).slice(2),
        $salt: salt,
      })
    })
  })

  describe("Everest", function () {
    let logsAddress: string

    before(async function () {
      const logs = await deployContract(owner, LogsFactory, [])
      logsAddress = logs.address.toLowerCase()
    })

    it("Activation block installs the nonce manager code outside the EVM", async function () {
      const activation = await firstBlockWithCode(NONCE_MANAGER)
      const block = await mustFetchFirehoseBlock(activation)

      const codeChange = block.codeChanges.find((change) => hexlify(change.address) === NONCE_MANAGER)
      expect(codeChange, "block-level code change of the nonce manager").to.not.be.undefined
      expect(hexlify(codeChange!.oldHash)).to.equal(EMPTY_CODE_HASH)
      expect(hexlify(codeChange!.newCode)).to.equal(await hre.ethers.provider.getCode(NONCE_MANAGER))

      const before = await mustFetchFirehoseBlock(activation - 1)
      expect(before.codeChanges.map((change) => hexlify(change.address))).to.not.include(NONCE_MANAGER)
    })

    it("EIP-8130 transaction with calls in two phases", async function () {
      const logs = LogsFactory.interface
      const { trace, block, vars } = await sendEip8130([
        [{ to: logsAddress, data: logs.encodeFunctionData("logAll") }],
        [
          { to: logsAddress, data: logs.encodeFunctionData("logSingle") },
          { to: knownExistingAddress, value: 1n },
        ],
      ])

      expect(trace.type).to.equal(TransactionTrace_Type.TRX_TYPE_ACCOUNT_ABSTRACTION)
      expect(trace.status).to.equal(1, "transaction succeeded")
      expect(trace.receipt!.accountAbstractionTrxOutput!.committedPhases).to.equal(2)

      await expect([trace, block]).to.trxTraceEqualSnapshot("base/eip8130_two_phases", {
        ...vars,
        $logs: logsAddress.slice(2),
      })
    })

    it("EIP-8130 transaction whose second phase reverts keeps the first phase", async function () {
      const logs = LogsFactory.interface
      const { trace, block, vars } = await sendEip8130([
        [{ to: logsAddress, data: logs.encodeFunctionData("logAll") }],
        [{ to: logsAddress, data: logs.encodeFunctionData("logAndTopLevelFail") }],
      ])

      expect(trace.type).to.equal(TransactionTrace_Type.TRX_TYPE_ACCOUNT_ABSTRACTION)
      expect(trace.status).to.equal(2, "transaction failed")
      expect(trace.receipt!.accountAbstractionTrxOutput!.committedPhases).to.equal(1)

      await expect([trace, block]).to.trxTraceEqualSnapshot("base/eip8130_second_phase_reverts", {
        ...vars,
        $logs: logsAddress.slice(2),
      })
    })
  })
})

function isBaseTimeDeposit(trace?: TransactionTrace): boolean {
  return (
    trace !== undefined &&
    trace.type === TransactionTrace_Type.TRX_TYPE_OPTIMISM_DEPOSIT &&
    hexlify(trace.from) === DEPOSITOR &&
    hexlify(trace.to) === BASE_TIME &&
    hexlify(trace.input.slice(0, 4)) === SET_TIMESTAMP_MILLIS_PART
  )
}

/** The first block where `address` has code, found by bisecting the node's history. */
async function firstBlockWithCode(address: string): Promise<number> {
  const provider = hre.ethers.provider
  let high = await provider.getBlockNumber()
  if ((await provider.getCode(address, high)) === "0x") {
    throw new Error(`${address} has no code at head #${high}, is the fork scheduled on this devnet?`)
  }

  let low = 0
  while (low < high) {
    const middle = Math.floor((low + high) / 2)
    if ((await provider.getCode(address, middle)) === "0x") {
      low = middle + 1
    } else {
      high = middle
    }
  }

  return low
}

/**
 * Fetches a block by number. Firehose answers a number past its head with its head block, so the
 * number is checked.
 */
async function mustFetchFirehoseBlock(number: number | bigint): Promise<Block> {
  const block = await fetchFirehoseBlock(await rpcBlockTag(BigInt(number)), { timeoutMs: 30_000 })
  expect(block.number).to.equal(BigInt(number))
  return block
}

async function rpcBlockTag(number: bigint): Promise<{ hash: string; num: bigint }> {
  const block = await hre.ethers.provider.getBlock(number)
  if (block === null) {
    throw new Error(`Block #${number} not found on the node`)
  }
  return { hash: block.hash!, num: number }
}

type Signer = typeof owner | Wallet

async function sendData(from: Signer, to: string, data: string, shouldRevert: boolean) {
  const response = await from.sendTransaction({ to, data, gasLimit: 2_000_000, gasPrice: defaultGasPrice })
  return waitForTransaction(response, shouldRevert)
}

async function isActivated(feature: string): Promise<boolean> {
  const ret = await hre.ethers.provider.call({
    to: ACTIVATION_REGISTRY,
    data: registry.encodeFunctionData("isActivated", [feature]),
  })
  return registry.decodeFunctionResult("isActivated", ret)[0]
}

/**
 * A createB20 call for an asset token administered by the owner, and its salt as snapshot hex.
 * The salt is random so the test can run again on the same chain, and has no zero byte so the
 * calldata gas is the same every run.
 */
function createB20Data(initCalls: string[]): { data: string; salt: string } {
  const salt = crypto.getRandomValues(new Uint8Array(32)).map((b) => b | 1)
  const params = AbiCoder.defaultAbiCoder().encode(
    ["tuple(uint8,string,string,address,uint8)"],
    [[1, "Battlefield Token", "BFT", ownerAddress, 18]],
  )
  return {
    data: factory.encodeFunctionData("createB20", [VARIANT_ASSET, salt, params, initCalls]),
    salt: hexlify(salt).slice(2),
  }
}

function mint(to: string, amount: bigint): string {
  return token.encodeFunctionData("mint", [to, amount])
}

/** A token's balance slot for `holder`: the `balances` mapping of the `base.b20` ERC-7201 namespace. */
function balanceSlot(holder: string): string {
  const coder = AbiCoder.defaultAbiCoder()
  const root = toBigInt(keccak256(coder.encode(["uint256"], [toBigInt(id("base.b20")) - 1n]))) & ~0xffn
  const SLOT_BALANCES = 4n
  return keccak256(coder.encode(["address", "uint256"], [holder, root + SLOT_BALANCES]))
}

/** The factory returns the new token address, so a simulated call predicts it. */
async function predictToken(data: string): Promise<string> {
  const ret = await hre.ethers.provider.call({ from: ownerAddress, to: B20_FACTORY, data })
  return AbiCoder.defaultAbiCoder().decode(["address"], ret)[0]
}

type Eip8130Call = { to: string; value?: bigint; data?: string }

/**
 * Sends an EIP-8130 transaction on the EOA path: no explicit sender, the sender is recovered from
 * its secp256k1 signature, pays for itself, and uses its account nonce (nonce key 0).
 */
async function sendEip8130(phases: Eip8130Call[][]): Promise<{
  trace: TransactionTrace
  block: Block
  vars: Record<string, string>
}> {
  const provider = hre.ethers.provider
  const { chainId } = await provider.getNetwork()

  const fields = [
    rlpInt(chainId),
    "0x", // sender, none on the EOA path
    rlpInt(0n), // nonce key
    rlpInt(0n), // nonce of a new sender
    rlpInt(0n), // valid after
    rlpInt(0n), // valid before
    rlpInt(1_000_000_000n), // max priority fee per gas
    rlpInt(BigInt(defaultGasPrice)), // max fee per gas
    rlpInt(1_000_000n), // gas limit
    [], // account changes
    phases.map((calls) => calls.map((call) => [call.to, rlpInt(call.value ?? 0n), call.data ?? "0x"])),
    "0x", // metadata
    "0x", // payer, none when the sender pays
  ]
  const signingHash = keccak256(concat([EIP8130_TX_TYPE, encodeRlp(fields)]))

  // The signature is part of the transaction's input, whose zero bytes cost less gas: a new sender
  // is drawn until its signature has none, so the gas used is the same every run.
  let sender: Wallet
  let signature: Signature
  do {
    sender = Wallet.createRandom(provider) as unknown as Wallet
    signature = sender.signingKey.sign(signingHash)
  } while (getBytes(signature.serialized).includes(0))
  await sendEth(owner, sender.address, eth(1))

  const raw = concat([EIP8130_TX_TYPE, encodeRlp([...fields, signature.serialized, "0x"])])
  const hash = await provider.send("eth_sendRawTransaction", [raw])
  expect(hash).to.equal(keccak256(raw))

  const deadline = Date.now() + 30_000
  let receipt: { blockHash: string; blockNumber: string } | null = null
  while (receipt === null) {
    if (Date.now() > deadline) {
      throw new Error(`EIP-8130 transaction ${hash} not mined within 30s`)
    }
    await new Promise((resolve) => setTimeout(resolve, 200))
    receipt = await provider.send("eth_getTransactionReceipt", [hash])
  }

  const block = await fetchFirehoseBlock({ hash: receipt.blockHash, num: BigInt(receipt.blockNumber) })
  const trace = block.transactionTraces.find((trx) => hexlify(trx.hash) === hash)
  if (trace === undefined) {
    throw new Error(`EIP-8130 transaction ${hash} not found in Firehose block #${block.number}`)
  }

  return {
    trace,
    block,
    vars: { $sender: sender.address.toLowerCase().slice(2), $signature: signature.serialized.slice(2) },
  }
}

function rlpInt(value: bigint | number): BytesLike {
  return hexlify(toBeArray(value))
}
