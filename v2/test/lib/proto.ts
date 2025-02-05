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

  if (typeof value === "object" && value["type"] === "Buffer" && value["data"]) {
    // Not sure where this came from but some fields looked like wrapped Buffer objects,
    // unclear if it comes from bufbuild/protobuf, Node.js or something else. For now
    // treat them as buffer by converting them to hex.
    return Buffer.from(value["data"]).toString("hex")
  }

  if (Buffer.isBuffer(value)) {
    return value.toString("hex")
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
  // All enums are number, so we can check that first and return early if it's not a number
  if (typeof value !== "number") {
    return undefined
  }

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
