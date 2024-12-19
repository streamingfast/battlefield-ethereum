import { enumToJson, isMessage, JsonValue } from "@bufbuild/protobuf"
import {
  BalanceChange_ReasonSchema,
  BalanceChangeSchema,
  BigIntSchema,
  CallTypeSchema,
  GasChange_ReasonSchema,
  GasChangeSchema,
  TransactionTrace_TypeSchema,
  TransactionTraceStatusSchema,
} from "../../pb/sf/ethereum/type/v2/type_pb"

export function toProtoJsonString(type: any): string {
  return JSON.stringify(type, protoJsonReplacer, 2)
}

export function toProtoJsonObject(type: any): unknown {
  return JSON.parse(toProtoJsonString(type))
}

function protoJsonReplacer(this: any, key: string, value: any): any {
  if (key === "$typeName") {
    return undefined
  }

  if (value instanceof Uint8Array) {
    return Buffer.from(value).toString("hex")
  }

  if (isMessage(value, BigIntSchema)) {
    return Buffer.from(value.bytes).toString("hex")
  }

  const enumJsonValue = maybeEnumToJson(this, key, value)
  if (enumJsonValue !== undefined) {
    return enumJsonValue
  }

  if (typeof value === "bigint") {
    return value.toString()
  }

  return value
}

// There is no easy way to know if a value is an enum, so we do check on keys
// directly for now. We would need to find the corresponding paths from
// the Proto schema to the value to know if it's an enum.
function maybeEnumToJson(parent: any, key: string, value: any): JsonValue | undefined {
  if (key === "type") {
    return enumToJson(TransactionTrace_TypeSchema, value)
  }

  if (key === "status") {
    return enumToJson(TransactionTraceStatusSchema, value)
  }

  if (key === "callType") {
    return enumToJson(CallTypeSchema, value)
  }

  if (key === "reason") {
    if (isMessage(parent, BalanceChangeSchema)) {
      return enumToJson(BalanceChange_ReasonSchema, value)
    }

    if (isMessage(parent, GasChangeSchema)) {
      return enumToJson(GasChange_ReasonSchema, value)
    }
  }

  return undefined
}
