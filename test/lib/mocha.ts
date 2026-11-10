import type { Context, Suite } from "mocha"

/**
 * Wraps a test body so that, if it fails, the whole test run stops right after it: every
 * remaining test and suite is skipped. Use it for tests whose failure leaves the chain unusable
 * (e.g. the node rejects its own block and stops producing new ones), where every subsequent test
 * would only time out and bury the actual failure.
 *
 * Mocha has no API to abort the run from a test, so this flips bail on every suite of the tree:
 * Mocha checks it before each remaining test and suite, and stops once a failure was recorded.
 */
export function stopRunOnFailure(body: (this: Context) => Promise<void>): (this: Context) => Promise<void> {
  return async function (this: Context) {
    try {
      await body.call(this)
    } catch (error) {
      let root = this.test!.parent!
      while (root.parent) {
        root = root.parent
      }
      bailAll(root)

      throw error
    }
  }
}

function bailAll(suite: Suite) {
  suite.bail(true)
  suite.suites.forEach(bailAll)
}

export function canSkipFreshChainOnlyTests(): boolean {
  if (!process.env.SKIP_FRESH_CHAIN_ONLY_TESTS || process.env.SKIP_FRESH_CHAIN_ONLY_TESTS === "false") {
    return false
  }

  if (process.env.SNAPSHOTS_UPDATE && process.env.SNAPSHOTS_UPDATE !== "false") {
    throw new Error(
      `You are running with snapshots update enabled, you cannot skip tests that require a fresh chain to run as it wouldn't update the snapshot.`,
    )
  }

  console.warn(
    "[Skipped] You are skipping a test that requires a fresh chain to run, ensure you are not validating your Firehose tracer while skipping any tests!",
  )

  return true
}
