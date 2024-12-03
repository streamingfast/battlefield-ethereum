import { getBytes } from "ethers"
import { ethers } from "hardhat"

export type AddressLike = string | Uint8Array

const randomHex6chars = () => ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0")
const randomHex = () =>
  randomHex6chars() + randomHex6chars() + randomHex6chars() + randomHex6chars()

export const knownExistingAddress = ethers.getAddress("0xd549d2fd4b177767b84ab2fd17423cee1cf1d7bd")
export const knownExistingAddressBytes = getBytes(knownExistingAddress)

export const randomAddress1 = `0xdead1000${randomHex()}0002beef`
export const randomAddress2 = `0xdead2000${randomHex()}0001beef`
export const randomAddress3 = `0xdead3000${randomHex()}0004beef`
export const randomAddress4 = `0xdead4000${randomHex()}0003beef`
export const randomAddress5 = `0xdead5000${randomHex()}0006beef`

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
