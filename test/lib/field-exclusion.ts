/**
 * Global registry of network-specific excluded fields.
 * This allows defining excluded fields once that apply to all tests.
 */
const globalExcludedFields: Map<string, string[]> = new Map()

/**
 * Register excluded fields for a specific network.
 * These fields will be automatically excluded in all tests running on that network.
 *
 * @param network The network name (e.g., "besu-devnet")
 * @param fields Array of field paths to exclude
 */
export function registerGlobalExcludedFields(network: string, fields: string[]): void {
  globalExcludedFields.set(network, fields)
}

/**
 * Get the globally registered excluded fields for a specific network.
 *
 * @param network The network name
 * @returns Array of field paths to exclude, or empty array if none registered
 */
export function getGlobalExcludedFields(network: string): string[] {
  return globalExcludedFields.get(network) || []
}

/**
 * Excludes specified fields from an object based on field paths.
 * Supports dot notation and array notation (e.g., "calls[].gasConsumed").
 *
 * @param obj The object to filter
 * @param excludeFields Array of field paths to exclude
 * @returns A new object with specified fields excluded
 */
export function excludeFieldsFromObject(obj: any, excludeFields: string[]): any {
  if (!obj || typeof obj !== "object" || !excludeFields.length) {
    return obj
  }

  // TODO
  const result = JSON.parse(JSON.stringify(obj))

  for (const fieldPath of excludeFields) {
    const pathParts = fieldPath.split(".")
    excludeFieldRecursive(result, pathParts, 0)
  }

  return result
}

/**
 * Recursively excludes a field from an object based on path parts.
 */
function excludeFieldRecursive(obj: any, pathParts: string[], currentIndex: number): void {
  if (currentIndex >= pathParts.length || !obj || typeof obj !== "object") {
    return
  }

  const currentPart = pathParts[currentIndex]
  const isLastPart = currentIndex === pathParts.length - 1

  // Handle array notation like "calls[]"
  const arrayMatch = currentPart.match(/^(.+)\[\]$/)
  if (arrayMatch) {
    const arrayFieldName = arrayMatch[1]
    if (Array.isArray(obj[arrayFieldName])) {
      if (isLastPart) {
        // Remove the entire array field
        delete obj[arrayFieldName]
      } else {
        // Process each array element
        obj[arrayFieldName].forEach((item: any) => {
          if (item && typeof item === "object") {
            excludeFieldRecursive(item, pathParts, currentIndex + 1)
          }
        })
      }
    }
    return
  }

  // Handle indexed array access like "calls[0]"
  const indexedMatch = currentPart.match(/^(.+)\[(\d+)\]$/)
  if (indexedMatch) {
    const arrayFieldName = indexedMatch[1]
    const index = parseInt(indexedMatch[2], 10)
    if (Array.isArray(obj[arrayFieldName]) && obj[arrayFieldName][index]) {
      if (isLastPart) {
        delete obj[arrayFieldName][index]
      } else {
        excludeFieldRecursive(obj[arrayFieldName][index], pathParts, currentIndex + 1)
      }
    }
    return
  }

  // Handle regular field access
  if (isLastPart) {
    delete obj[currentPart]
  } else {
    excludeFieldRecursive(obj[currentPart], pathParts, currentIndex + 1)
  }
}
