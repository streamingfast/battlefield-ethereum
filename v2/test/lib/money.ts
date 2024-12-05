import { ethers, toBeArray, toBigInt } from "ethers"
import { BigInt, BigIntSchema } from "../../pb/sf/ethereum/type/v2/type_pb"
import { create, isMessage } from "@bufbuild/protobuf"

export const zeroWei = wei(0)
export const oneWei = wei(1)

export const zeroWeiF = weiF(0)
export const oneWeiF = weiF(1)

/** Receives an amount of Ether and convert them to a wei value as a bigint */
export function eth(amount: string | ethers.Numeric | BigInt): bigint {
  if (isMessage(amount, BigIntSchema)) {
    return ethers.parseEther(toBigInt(amount.bytes).toString(10))
  }

  if (typeof amount === "string") {
    return ethers.parseEther(amount)
  }

  return ethers.parseEther(amount.toString(10))
}

/** Make receive amount a wei value and output as a string */
export function wei(amount: string | ethers.Numeric | BigInt): string {
  if (isMessage(amount, BigIntSchema)) {
    return ethers.formatUnits(toBigInt(amount.bytes), "wei")
  }

  return ethers.formatUnits(amount, "wei")
}

/** Same as {@link wei} but returns it into Firehose Ethereum {@link BigInt} type (hence the F suffix) */
export function weiF(amount: string | ethers.Numeric | BigInt): BigInt {
  if (isMessage(amount, BigIntSchema)) {
    return amount
  }

  return create(BigIntSchema, {
    bytes: toBeArray(amount as any),
  })
}
