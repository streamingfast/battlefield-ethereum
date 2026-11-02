import { spawn } from "node:child_process"
import hre from "hardhat"
import debugFactory from "debug"
import { fetchFirehoseFirstStreamableBlock, fetchFirehoseHead, FirehoseHead, firehoseEndpoint } from "./firehose"
import { isMineOnDemand, isNetwork } from "./network"

const debug = debugFactory("battlefield:compare-blocks")

// Largest amount of blocks a single comparison run covers. Dev chains produce a few hundred
// blocks per suite run so the whole chain fits, the cap only matters on long-lived networks
// (e.g. a public testnet) where comparing from the first streamable block would never end.
const defaultMaxSpan = 2_000

// How long we keep mining blocks on a mine-on-demand chain so finality catches up with the
// blocks the test suite just produced. Those chains only finalize when new blocks arrive, so
// without this the tail of the run (~30 blocks on geth-dev) would never be compared.
const defaultFinalityTimeoutMs = 60_000

// How long the finality wait is allowed to take, exported so the Mocha timeout can account for
// the time spent before the comparison itself even starts.
export function finalityTimeoutMs(): number {
  return Number(process.env.COMPARE_BLOCKS_FINALITY_TIMEOUT_MS ?? defaultFinalityTimeoutMs)
}

// `fireeth` is the same binary the launchers in `scripts/` use, honour the same override.
export function fireethBinary(): string {
  return process.env.FIREETH_BINARY ?? "fireeth"
}

// Resolves the RPC endpoint of the network currently under test. Hardhat already knows it
// per network (including the dynamically-assigned world-chain devnet port), which is exactly
// the piece of information a standalone shell script cannot guess.
export function rpcEndpoint(): string {
  const url = (hre.network.config as { url?: string }).url
  if (url === undefined) {
    throw new Error(`Network "${hre.network.name}" has no RPC url configured`)
  }

  return url
}

export type BlockRange = { start: number; stop: number }

export type ResolvedRange = { range: BlockRange } | { skipReason: string }

// Computes the inclusive block range to compare.
//
// The upper bound is the last irreversible block: `fireeth tools compare-blocks-rpc` streams
// with `final_blocks_only`, so a stop block past finality makes it hang instead of finishing.
// The lower bound is the first streamable block, capped so at most `maxSpan` blocks are compared.
//
// On a mine-on-demand chain the blocks the suite just produced are not final yet and no further
// block is coming, so `mineBlock` is used to push finality past them before the range is frozen.
export async function resolveCompareRange(options?: {
  maxSpan?: number
  finalityTimeoutMs?: number
  mineBlock?: () => Promise<unknown>
}): Promise<ResolvedRange> {
  // Amoy is a long-lived public testnet: comparing a full span there means thousands of receipt
  // fetches against a shared RPC, which is both slow and pointless for tracer validation.
  if (isNetwork("amoy")) {
    return { skipReason: "block comparison is not run against the public Amoy testnet" }
  }

  const maxSpan = options?.maxSpan ?? Number(process.env.COMPARE_BLOCKS_MAX_SPAN ?? defaultMaxSpan)

  let head = await fetchFirehoseHead()
  if (head === undefined) {
    return { skipReason: "Firehose did not report a head block with finality metadata" }
  }

  if (options?.mineBlock !== undefined && isMineOnDemand() && head.libNum < head.num) {
    head = await advanceFinality(head.num, options.mineBlock, options?.finalityTimeoutMs)
  }

  // Genesis is deliberately left out: Firehose synthesizes that block (it has no real
  // transactions to trace) so its serialized size never matches what the RPC reports. Its
  // content is asserted directly by `genesis.test.ts`.
  const firstComparable = Math.max(await fetchFirehoseFirstStreamableBlock(), 1)
  if (head.libNum < firstComparable) {
    return {
      skipReason: `last irreversible block #${head.libNum} is below first comparable block #${firstComparable}, chain has no final block to compare yet`,
    }
  }

  const start = Math.max(firstComparable, head.libNum - maxSpan + 1)
  debug("Comparing blocks #%d to #%d (first comparable #%d, head #%d)", start, head.libNum, firstComparable, head.num)

  return { range: { start, stop: head.libNum } }
}

// Mines blocks until finality reaches `target`, giving up after `timeoutMs` and returning the
// most recent head seen. Used on mine-on-demand chains only, where finality advances solely as
// a consequence of new blocks being produced.
//
// `mineBlock` must wait for its transaction to be mined: it both paces the loop and keeps the
// signer's nonce in sync. A failed send is fatal rather than ignored, because `owner` is an
// ethers `NonceManager` that consumes a nonce before sending and never gives it back, so every
// later transaction would queue behind a nonce that is never used and no block would be mined.
async function advanceFinality(
  target: number,
  mineBlock: () => Promise<unknown>,
  timeoutMs = finalityTimeoutMs(),
): Promise<FirehoseHead> {
  const deadline = Date.now() + timeoutMs
  let head = await fetchFirehoseHead()
  let lastKnownHead = head

  while (head !== undefined && head.libNum < target && Date.now() < deadline) {
    await mineBlock()
    head = await fetchFirehoseHead()
    lastKnownHead = head ?? lastKnownHead
  }

  const reached = lastKnownHead?.libNum ?? 0
  if (reached < target) {
    // Loud on purpose: the suite's last blocks are the ones that went unchecked, and a silent
    // debug line would leave a green test hiding a shorter comparison than the reader expects.
    console.log(
      `Finality only reached #${reached} of #${target} within ${timeoutMs}ms, blocks #${reached + 1} to #${target} are left out of the comparison`,
    )
  } else {
    debug("Finality reached #%d (target #%d)", reached, target)
  }

  return lastKnownHead ?? { num: target, libNum: 0 }
}

export type CompareResult = {
  exitCode: number | null
  output: string
  identicalCount: number
  differences: string[]
}

// Runs `fireeth tools compare-blocks-rpc` over the given range and parses its report.
//
// The command prints `<num> identical` per matching block and `different <diffs>` on a
// mismatch, but exits 0 either way, so the verdict has to come from its output.
export async function compareBlocksWithRpc(range: BlockRange, timeoutMs: number): Promise<CompareResult> {
  const args = [
    "tools",
    "compare-blocks-rpc",
    "--plaintext",
    firehoseEndpoint,
    rpcEndpoint(),
    String(range.start),
    String(range.stop),
  ]

  debug("Running %s %o", fireethBinary(), args)
  const { exitCode, stdout, output } = await runProcess(fireethBinary(), args, timeoutMs)

  // Parse stdout alone: zap writes its logs to stderr and a `different ...` report carries a
  // rendered multi-line diff, so interleaving the two streams could split a report in half.
  const lines = stdout.split("\n")
  const identicalCount = lines.filter((line) => /^\d+ identical$/.test(line.trim())).length
  const differences = lines.filter((line) => line.trim().startsWith("different"))

  return { exitCode, output, identicalCount, differences }
}

export async function isFireethAvailable(): Promise<boolean> {
  try {
    const { exitCode } = await runProcess(fireethBinary(), ["--version"], 10_000)
    return exitCode === 0
  } catch {
    return false
  }
}

// Runs `command`, returning its stdout on its own (what the caller parses) and both streams
// interleaved (what the caller reports when something goes wrong).
async function runProcess(
  command: string,
  args: string[],
  timeoutMs: number,
): Promise<{ exitCode: number | null; stdout: string; output: string }> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: ["ignore", "pipe", "pipe"] })

    let stdout = ""
    let output = ""
    let timedOut = false

    const timer = setTimeout(() => {
      timedOut = true
      child.kill("SIGKILL")
    }, timeoutMs)

    child.stdout.on("data", (chunk: Buffer) => {
      stdout += chunk.toString()
      output += chunk.toString()
    })
    child.stderr.on("data", (chunk: Buffer) => (output += chunk.toString()))

    child.on("error", (err) => {
      clearTimeout(timer)
      reject(err)
    })

    child.on("close", (code) => {
      clearTimeout(timer)
      if (timedOut) {
        reject(new Error(`'${command} ${args.join(" ")}' timed out after ${timeoutMs}ms, output:\n${output}`))
        return
      }

      resolve({ exitCode: code, stdout, output })
    })
  })
}
