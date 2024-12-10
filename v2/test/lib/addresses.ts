import { getAddress, getBytes } from "ethers"

export const bytes = 1

export type AddressLike = string | Uint8Array

export const ownerAddress = getAddress("0x821b55d8abe79bc98f05eb675fdc50dfe796b7ab")

export const knownExistingAddress = getAddress("0xd549d2fd4b177767b84ab2fd17423cee1cf1d7bd")
export const knownExistingAddressBytes = getBytes(knownExistingAddress)

export const precompileWithBalanceAddress = getAddress("0x0000000000000000000000000000000000000004")
export const precompileWithBalanceAddressBytes = getBytes(precompileWithBalanceAddress)
export const precompileWithBalanceAddressHex = precompileWithBalanceAddress.toLowerCase().slice(2)

export const precompileWithoutBalanceAddress = getAddress("0x0000000000000000000000000000000000000005")
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
