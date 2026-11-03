// Fills blocks of the reth dev node with contract calls from many senders.
//
// Deploys `PerfCounter`, funds `PERF_SENDERS` fresh accounts, then for `PERF_ROUNDS` rounds sends
// `PERF_CALLS_PER_SENDER` calls from every sender at once and waits for them to be mined. Each
// call hashes `PERF_WORK` times, which sets how expensive a transaction is. Prints the transaction
// count of every block the calls landed in. Run with
// `hardhat run scripts/perf/load.ts --network <network>` against a node that mines on a timer.

import hre from "hardhat"
import { NonceManager, TransactionResponse, Wallet, parseEther } from "ethers"

const SENDERS = Number(process.env.PERF_SENDERS ?? 20)
const ROUNDS = Number(process.env.PERF_ROUNDS ?? 10)
const CALLS_PER_SENDER = Number(process.env.PERF_CALLS_PER_SENDER ?? 8)
const WORK = Number(process.env.PERF_WORK ?? 300)

async function main() {
  const provider = hre.ethers.provider
  const [owner] = await hre.ethers.getSigners()
  const funder = new NonceManager(owner)

  const counter = await (await hre.ethers.getContractFactory("PerfCounter", owner)).deploy()
  await counter.waitForDeployment()
  const address = await counter.getAddress()
  const data = counter.interface.encodeFunctionData("hit", [WORK])
  console.log(`PerfCounter deployed at ${address}`)

  const wallets = Array.from({ length: SENDERS }, () => Wallet.createRandom().connect(provider))
  const funding = await Promise.all(
    wallets.map((wallet) => funder.sendTransaction({ to: wallet.address, value: parseEther("10") })),
  )
  await Promise.all(funding.map((response) => response.wait()))
  console.log(`Funded ${SENDERS} senders`)

  const feeData = await provider.getFeeData()
  const maxFeePerGas = (feeData.maxFeePerGas ?? parseEther("0.000001")) * 4n
  const maxPriorityFeePerGas = feeData.maxPriorityFeePerGas ?? 1_000_000_000n
  const nonces = await Promise.all(wallets.map((wallet) => provider.getTransactionCount(wallet.address)))

  const firstBlock = (await provider.getBlockNumber()) + 1
  let totalCalls = 0
  for (let round = 0; round < ROUNDS; round++) {
    const sends: Promise<TransactionResponse>[] = []
    wallets.forEach((wallet, index) => {
      for (let call = 0; call < CALLS_PER_SENDER; call++) {
        sends.push(
          wallet.sendTransaction({
            to: address,
            data,
            // Each hash round of `hit` costs under 1,200 gas.
            gasLimit: 300_000 + 1_200 * WORK,
            nonce: nonces[index]++,
            maxFeePerGas,
            maxPriorityFeePerGas,
            type: 2,
          }),
        )
      }
    })
    const responses = await Promise.all(sends)
    const receipts = await Promise.all(responses.map((response) => response.wait()))
    const perBlock = new Map<number, number>()
    for (const receipt of receipts) {
      if (receipt == null) throw new Error("transaction dropped")
      if (receipt.status !== 1) throw new Error(`call ${receipt.hash} failed`)
      perBlock.set(receipt.blockNumber, (perBlock.get(receipt.blockNumber) ?? 0) + 1)
    }
    totalCalls += receipts.length
    const blocks = [...perBlock.entries()].sort(([a], [b]) => a - b)
    console.log(`round ${round + 1}: ${blocks.map(([block, count]) => `block ${block}: ${count} txs`).join(", ")}`)
  }
  const lastBlock = await provider.getBlockNumber()
  console.log(`PERF_SUMMARY calls=${totalCalls} work=${WORK} first_block=${firstBlock} last_block=${lastBlock}`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
