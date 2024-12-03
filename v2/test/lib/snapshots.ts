import { existsSync, writeFileSync, mkdirSync } from "fs"
import path from "path"

const lib = __dirname
const testUrl = path.join(lib, "..")
const snapshotsUrl = path.join(testUrl, "snapshots")

const snapshotsPrefixRegex = /^(\.(\/|\\))?snapshots(\/|\\)/
const snapshotsSuffixRegex = /\.([^\.]+\.)?json$/

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

    writeFileSync(
      this.toSnapshotPath(SnapshotKind.ExpectedTemplatized),
      expectedTemplatizedJsonString
    )
  }

  writeSnapshotDebugFiles(
    actualJsonString: string,
    normalizedJsonString: string,
    expectedResolvedJsonString: string
  ) {
    this.ensureParentDirs()

    writeFileSync(this.toSnapshotPath(SnapshotKind.ActualOriginal), actualJsonString)
    writeFileSync(this.toSnapshotPath(SnapshotKind.ActualNormalized), normalizedJsonString)
    writeFileSync(this.toSnapshotPath(SnapshotKind.ExpectedResolved), expectedResolvedJsonString)
  }

  toSnapshotPath(kind: SnapshotKind): string {
    const toQualifier = () => {
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

    return `${snapshotsUrl}/${this.id}.${toQualifier()}.json`
  }

  userRequestedExpectedUpdate(): boolean {
    const value = process.env.SNAPSHOT_UPDATE
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
