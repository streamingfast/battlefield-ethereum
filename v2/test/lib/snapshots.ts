import { existsSync, writeFileSync, mkdirSync } from "fs"
import path from "path"
import hre from "hardhat"
import debugFactory from "debug"
import { EIP } from "./chain_eips"
import { chainStaticInfo } from "./chain"

const debug = debugFactory("battlefield:snapshots")

const lib = __dirname
const testUrl = path.join(lib, "..")
const snapshotsUrl = path.join(testUrl, "snapshots")

const snapshotsPrefixRegex = /^(\.(\/|\\))?snapshots(\/|\\)/
const snapshotsSuffixRegex = /\.([^\.]+\.)?json$/

/**
 * Globally controls the tag into which snapshots are read and write from.
 * Should be call before using any snapshots.
 *
 * The tag is free-form and will be appended to the snapshot between the first
 * element and the snapshot name. So for example if snapshot id `calls/test.expected.json`
 * is received and the tag is set to `fh3.0`, the snapshot will be read from
 * `calls/fh3.0/test.expected.json` (and derived files too).
 */
let globalSnapshotsTag = ""

export function getGlobalSnapshotsTag(): string {
  if (!globalSnapshotsTag) {
    throw new Error(
      "The 'globalSnapshotsTag' variable is not set, it is mandatory, you are probably not running the test suite as intended. Use pnpm test:<tag> to run the test suite."
    )
  }

  return globalSnapshotsTag
}

export function setGlobalSnapshotsTag(tag: string) {
  globalSnapshotsTag = tag
}

/**
 * The different variant of snapshots that can be written. The actual
 * snapshot comparison is done between the expected resolved and the actual
 * normalized.
 */
export enum SnapshotKind {
  ExpectedTemplatized,
  ExpectedResolved,
  ActualOriginal,
  ActualNormalized,
}

export class Snapshot {
  public eipOverride: string | undefined
  public networkOverride: string | undefined

  constructor(public id: string, options: ResolveSnapshotOptions = {}) {
    let local = id.replace("./", "")
    local = local.replace(snapshotsPrefixRegex, "")
    local = local.replace(snapshotsSuffixRegex, "")

    if (local.split(path.sep).length <= 1) {
      throw new Error(`Snapshot id ${id} is not valid, it must contain at least one directory`)
    }

    const eipOverrides = options.eipSnapshotOverrides || {}
    debug(
      `Looking for EIP overrides again current network ${hre.network.name} (EIPS %o): %o`,
      chainStaticInfo.eips,
      eipOverrides
    )

    if (Object.keys(eipOverrides).length > 0) {
      const matchingEipsPerOverride = Object.fromEntries(
        Object.entries(eipOverrides).map(([network, eips]) => [
          network,
          eips.filter((eip) => chainStaticInfo.eips[eip] === true).length,
        ])
      )
      const maxMatchingEips = Math.max(...Object.values(matchingEipsPerOverride))
      if (maxMatchingEips !== 0) {
        const eipOverridesMatchingMax = Object.keys(matchingEipsPerOverride).filter(
          (network) => matchingEipsPerOverride[network] === maxMatchingEips
        )

        if (eipOverridesMatchingMax.length > 1) {
          throw new Error(
            `Multiple network overrides with the same number of matching EIPs: ${eipOverridesMatchingMax}`
          )
        }

        const eipSnapshotOverride = eipOverridesMatchingMax[0]
        debug("EIP specific override(s) found, using it: %o", eipOverrides)
        this.eipOverride = eipSnapshotOverride
      }
    }

    const networkOverrides = options.networkSnapshotOverrides || []
    debug(`Looking for network specific overrides again current network ${hre.network.name}: %o`, networkOverrides)
    const hasNetworkOverride = networkOverrides.some((network) => hre.network.name === network)
    if (hasNetworkOverride) {
      debug("Network specific override found, using it")
      this.networkOverride = hre.network.name
    }

    this.id = local
  }

  exists(kind: SnapshotKind): boolean {
    return existsSync(this.toSnapshotPath(kind))
  }

  ensureParentDirs() {
    const filePath = this.toSnapshotPath(SnapshotKind.ExpectedTemplatized)
    const dir = path.dirname(filePath)

    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true })
    }
  }

  writeExpected(expectedTemplatizedJsonString: string) {
    this.ensureParentDirs()

    writeFileSync(this.toSnapshotPath(SnapshotKind.ExpectedTemplatized), expectedTemplatizedJsonString)
  }

  writeSnapshotDebugFiles(actualJsonString: string, normalizedJsonString: string, expectedResolvedJsonString: string) {
    this.ensureParentDirs()

    writeFileSync(this.toSnapshotPath(SnapshotKind.ActualOriginal), actualJsonString)
    writeFileSync(this.toSnapshotPath(SnapshotKind.ActualNormalized), normalizedJsonString)
    writeFileSync(this.toSnapshotPath(SnapshotKind.ExpectedResolved), expectedResolvedJsonString)
  }

  toSnapshotPath(kind: SnapshotKind, relativeToCwd: boolean = false): string {
    const snapshotsTag = getGlobalSnapshotsTag()

    const group = path.dirname(this.id)
    const lastSegment = this.id.replace(group, "").replace(/^(\/|\\)/, "")

    const segments = [snapshotsUrl, group, snapshotsTag]
    if (this.eipOverride) {
      segments.push(this.eipOverride)
    }
    if (this.networkOverride) {
      segments.push(this.networkOverride)
    }
    segments.push(lastSegment)

    const filePath = path.join(...segments)
    const absolute = `${filePath}.${this.toSnapshotQualifier(kind)}.json`
    if (relativeToCwd) {
      return "./" + path.relative(process.cwd(), absolute)
    }

    return absolute
  }

  toSnapshotQualifier(kind: SnapshotKind): string {
    switch (kind) {
      case SnapshotKind.ExpectedTemplatized:
        return "expected"
      case SnapshotKind.ExpectedResolved:
        return "expected.resolved"
      case SnapshotKind.ActualOriginal:
        return "actual.original"
      case SnapshotKind.ActualNormalized:
        return "actual.normalized"
    }
  }

  userRequestedExpectedUpdate(): boolean {
    const value = process.env.SNAPSHOTS_UPDATE
    if (value === undefined) {
      return false
    }

    if (value === "true" || value === "1") {
      return true
    }

    return this.id.match(value) !== null
  }
}

type ResolveSnapshotOptions = {
  eipSnapshotOverrides?: Record<string, EIP[]>
  networkSnapshotOverrides?: string[]
}

export function resolveSnapshot(identifier: string, options: ResolveSnapshotOptions = {}): Snapshot {
  return new Snapshot(identifier, options)
}
