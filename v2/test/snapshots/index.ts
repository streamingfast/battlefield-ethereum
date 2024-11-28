import path from "path"

const snapshotsUrl = __dirname
const testUrl = path.dirname(snapshotsUrl)

export function snapshotFile(id: string): string {
  let local = id.replace("./", "")
  if (local.endsWith(".json")) {
    local = local.slice(0, -5)
  }

  if (local.startsWith("snapshots")) {
    return `${testUrl}/${local}.json`
  }

  return `${snapshotsUrl}/${local}.json`
}
