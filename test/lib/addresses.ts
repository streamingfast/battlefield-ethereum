import { getAddress, getBytes, hexlify } from "ethers"

export const bytes = 1

export type AddressLike = string | Uint8Array

export const ownerAddress = getAddress("0x821b55d8abe79bc98f05eb675fdc50dfe796b7ab")

export const knownExistingAddress = getAddress("0xd549d2fd4b177767b84ab2fd17423cee1cf1d7bd")
export const knownExistingAddressBytes = getBytes(knownExistingAddress)

export const precompileWithBalanceAddress = getAddress("0x0000000000000000000000000000000000000003")
export const precompileWithBalanceAddressBytes = getBytes(precompileWithBalanceAddress)
export const precompileWithBalanceAddressHex = precompileWithBalanceAddress.toLowerCase().slice(2)

export const precompileWithoutBalanceAddress = getAddress("0x0000000000000000000000000000000000000004")
export const precompileWithoutBalanceAddressBytes = getBytes(precompileWithoutBalanceAddress)
export const precompileWithoutBalanceAddressHex = precompileWithoutBalanceAddress.toLowerCase().slice(2)

export const randomAddress1 = `0xdead${randomHex(14 * bytes)}0001beef`
export const randomAddress2 = `0xdead${randomHex(14 * bytes)}0002beef`
export const randomAddress3 = `0xdead${randomHex(14 * bytes)}0003beef`
export const randomAddress4 = `0xdead${randomHex(14 * bytes)}0004beef`
export const randomAddress5 = `0xdead${randomHex(14 * bytes)}0005beef`

export const randomAddress1Bytes = getBytes(randomAddress1)
export const randomAddress2Bytes = getBytes(randomAddress2)
export const randomAddress3Bytes = getBytes(randomAddress3)
export const randomAddress4Bytes = getBytes(randomAddress4)
export const randomAddress5Bytes = getBytes(randomAddress5)

// Versions without 0x suffix
export const randomAddress1Hex = randomAddress1.slice(2)
export const randomAddress2Hex = randomAddress2.slice(2)
export const randomAddress3Hex = randomAddress3.slice(2)
export const randomAddress4Hex = randomAddress4.slice(2)
export const randomAddress5Hex = randomAddress5.slice(2)

// System Contracts

/** SystemAddress is where the system-transaction is sent from as per EIP-4788 */
export const systemAddress = getAddress("0xfffffffffffffffffffffffffffffffffffffffe")
/** SystemAddress is where the system-transaction is sent from as per EIP-4788 */
export const systemAddressHex = systemAddress.toLowerCase().slice(2)

/** EIP-4788 - Beacon block root in the EVM */
export const systemBeaconRootsAddress = getAddress("0x000F3df6D732807Ef1319fB7B8bB8522d0Beac02")
/** EIP-4788 - Beacon block root in the EVM */
export const systemBeaconRootsAddressHex = systemBeaconRootsAddress.toLowerCase().slice(2)

/** EIP-2935 - Serve historical block hashes from state */
export const systemHistoryStorageAddress = getAddress("0x0000F90827F1C53a10cb7A02335B175320002935")
/** EIP-2935 - Serve historical block hashes from state */
export const systemHistoryStorageAddressHex = systemHistoryStorageAddress.toLowerCase().slice(2)

/** EIP-7002 - Execution layer triggerable withdrawals */
export const systemWithdrawalQueueAddress = getAddress("0x00000961Ef480Eb55e80D19ad83579A64c007002")
/** EIP-7002 - Execution layer triggerable withdrawals */
export const systemWithdrawalQueueAddressHex = systemWithdrawalQueueAddress.toLowerCase().slice(2)

/** EIP-7251 - Increase the MAX_EFFECTIVE_BALANCE */
export const systemConsolidationQueueAddress = getAddress("0x0000BBdDc7CE488642fb579F8B00f3a590007251")
/** EIP-7251 - Increase the MAX_EFFECTIVE_BALANCE */
export const systemConsolidationQueueAddressHex = systemConsolidationQueueAddress.toLowerCase().slice(2)

export function addressHasZeroBytes(address: string | null): boolean {
  if (address == null) {
    return true
  }

  return getBytes(address.startsWith("0x") ? address : "0x" + address).some((byte) => byte === 0)
}

/**
 * Generates a random hexadecimal string of the given byte count but there
 * will be no 0 bytes in the result.
 */
export function randomHex(byteCount: number): string {
  return [...Array(byteCount)].map(() => random1ByteHex()).join("")
}

function random1ByteHex(): string {
  // The << 0 is to convert the number to an integer
  return ((Math.random() * 0xfe + 1) << 0).toString(16).padStart(2, "0")
}

export function isSameAddress(leftRaw: string | Uint8Array, rightRaw: string | Uint8Array): boolean {
  return anyAddress(leftRaw) === anyAddress(rightRaw)
}

function anyAddress(input: string | Uint8Array): string {
  if (typeof input === "string") {
    if (!input.startsWith("0x")) {
      input = "0x" + input
    }

    return getAddress(input)
  }

  return getAddress(hexlify(input))
}
