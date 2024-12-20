import { existsSync, writeFileSync, mkdirSync } from "fs"
import path from "path"

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
  constructor(public id: string) {
    let local = id.replace("./", "")
    local = local.replace(snapshotsPrefixRegex, "")
    local = local.replace(snapshotsSuffixRegex, "")

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
    let filePath: string
    const snapshotsTag = getGlobalSnapshotsTag()

    // We want to insert the tag between the first element and the snapshot name
    // so that `calls/test.expected.json` becomes `calls/<tag>/test.expected.json`.
    //
    // We try to extract the dirname from the snapshot id and if it's not the same
    // as the id, we know it has a "parent" directory and we insert us between them.
    const dirname = path.dirname(this.id)
    if (dirname && dirname !== this.id) {
      let lastSegment = this.id.replace(dirname, "").replace(/^(\/|\\)/, "")
      filePath = path.join(snapshotsUrl, dirname, snapshotsTag, lastSegment)
    } else {
      filePath = path.join(snapshotsUrl, snapshotsTag, this.id)
    }

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

export function resolveSnapshot(identifier: string): Snapshot {
  return new Snapshot(identifier)
}
