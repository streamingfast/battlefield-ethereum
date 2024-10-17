import { toBN } from "web3-utils"

export const randomHex6chars = () => ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0")

export const randomHex = () =>
  randomHex6chars() + randomHex6chars() + randomHex6chars() + randomHex6chars()

// It seems the `BN` from `web3-utils` is not fully compatible with the `SendOptions["value"]` type
// that we use in our codebase. They seems to all come from the same require but for an unknown reason,
// I now hit problem with version 1.10 of Web3.js.
//
// Let's deal with this later on and just use `any` for now.
export const oneWei = toBN(1) as any
export const threeWei = toBN(3) as any

// This address is known to exist on the network
export const knownExistingAddress = "0x963ebdf2e1f8db8707d05fc75bfeffba1b5bac17"
export const randomAddress1 = `0xdead1000${randomHex()}0002beef`
export const randomAddress2 = `0xdead2000${randomHex()}0001beef`
export const randomAddress3 = `0xdead3000${randomHex()}0004beef`
export const randomAddress4 = `0xdead4000${randomHex()}0003beef`
export const randomAddress5 = `0xdead5000${randomHex()}0006beef`

export const precompileWithBalance = "0x0000000000000000000000000000000000000004"
export const precompileWithoutBalance = "0x0000000000000000000000000000000000000005"
