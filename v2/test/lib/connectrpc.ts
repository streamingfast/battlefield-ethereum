import { ConnectError } from "@connectrpc/connect"

export function isConnectError(err: unknown): err is ConnectError {
  if (err == null) {
    return false
  }

  // Ok at some point in one project, in an earlier version of connectrpc we
  // had the problem that `err instanceof ConnectError` was returning false
  // but the constructor.name was correctly kept to ConnectError so we
  // were comparing on `constructor.name` instead of `instanceof`.
  //
  // Now today I got the exact opposite problem, the constructor was "minified"
  // to '_t' but the instanceof worked correctly.
  //
  // We are going now the following rules to extract a ConnectErrorCode:
  if (err instanceof ConnectError) {
    return true
  }

  if (err.constructor.name === "ConnectError") {
    return true
  }

  return false
}

// export function connectErrorCode(err: unknown): Code | undefined {
//   return maybeConnectError(err)?.code
// }
