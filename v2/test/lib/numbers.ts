import { BigNumberish, toBigInt as toBigIntEthers } from "ethers"
import { BigIntSchema as PbBigIntSchema, BigInt as PbBigInt } from "../../pb/sf/ethereum/type/v2/type_pb"
import { isMessage } from "@bufbuild/protobuf"

export function toBigInt(value: BigNumberish | PbBigInt | undefined): bigint {
  if (isMessage(value, PbBigIntSchema)) {
    return toBigIntEthers(value.bytes)
  }

  if (value == null) {
    return BigInt(0)
  }

  return toBigIntEthers(value)
}
