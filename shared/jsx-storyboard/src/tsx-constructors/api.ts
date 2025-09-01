import * as t from "@babel/types";
import { isExpressionString, isNilNode } from "../utils.js";
import type {
  ConstructJsValueOptions,
  ConstructResult,
  ParseJsxOptions,
} from "../interfaces.js";
import { constructJsValue } from "./values.js";

export interface CallApiPayload {
  api: string;
  http?: boolean;
  params?: string | Record<string, unknown>;
  ambiguousParams?: unknown;
  objectId?: string;
}

export function parseTsxCallApi(
  call: t.Expression,
  result: ConstructResult,
  options?: ParseJsxOptions,
  jsValueOptions?: ConstructJsValueOptions
): CallApiPayload | null {
  if (!(t.isCallExpression(call) || t.isOptionalCallExpression(call))) {
    result.errors.push({
      message: `Await expression must be a call expression, received ${call.type}`,
      node: call,
      severity: "error",
    });
    return null;
  }
  const { callee } = call;
  if (!t.isIdentifier(callee)) {
    result.errors.push({
      message: `Await expression must call an identifier, received ${callee.type}`,
      node: callee,
      severity: "error",
    });
    return null;
  }

  if (callee.name !== "callApi" && callee.name !== "callHttp") {
    result.errors.push({
      message: `Await expression must call "callApi" or "callHttp", received ${callee.name}`,
      node: callee,
      severity: "error",
    });
    return null;
  }
  if (callee.name === "callHttp") {
    const missingArgs = call.arguments.length < 1;
    if (missingArgs || call.arguments.length > 2) {
      result.errors.push({
        message: `"${callee.name}()" expects 1 or 2 arguments, but got ${call.arguments.length}`,
        node: call,
        severity: missingArgs ? "error" : "notice",
      });
      if (missingArgs) {
        return null;
      }
    }
  } else {
    const missingArgs = call.arguments.length < 2;
    if (missingArgs || call.arguments.length > 3) {
      result.errors.push({
        message: `"${callee.name}()" expects 2 or 3 arguments, but got ${call.arguments.length}`,
        node: call,
        severity: missingArgs ? "error" : "notice",
      });
      if (missingArgs) {
        return null;
      }
    }
  }

  let payload: CallApiPayload;
  const apiNode = call.arguments[0];

  if (callee.name === "callHttp") {
    const value = constructJsValue(apiNode, result, {
      ...jsValueOptions,
      allowExpression: true,
    });
    if (typeof value !== "string") {
      result.errors.push({
        message: `"${callee.name}()" expects a string value as the first argument, but got ${typeof value}`,
        node: apiNode,
        severity: "error",
      });
      return null;
    }
    payload = {
      api: value,
      http: true,
    };
  } else {
    const apiNode = call.arguments[0];
    if (!t.isStringLiteral(apiNode)) {
      result.errors.push({
        message: `"${callee.name}()" expects a string literal as the first argument, but got ${apiNode.type}`,
        node: apiNode,
        severity: "error",
      });
      return null;
    }
    payload = {
      api: apiNode.value,
    };
  }

  const valueNode = call.arguments[1];

  if (valueNode && !isNilNode(valueNode)) {
    if (!t.isObjectExpression(valueNode)) {
      result.errors.push({
        message: `Data source "params" prefers an object literal, but got ${valueNode.type}`,
        node: valueNode,
        severity: "notice",
      });
    }
    const params = constructJsValue(valueNode, result, {
      ...jsValueOptions,
      allowExpression: true,
    });
    if (
      isExpressionString(params) ||
      (typeof params === "object" && params !== null)
    ) {
      payload.params = params as string | Record<string, unknown>;
    } else {
      result.errors.push({
        message: `API params expects an object or expression, but got ${typeof params}`,
        node: valueNode,
        severity: "error",
      });
    }
    if (options?.reward) {
      payload.ambiguousParams = constructJsValue(
        valueNode,
        {
          ...result,
          // Ignore errors in ambiguous params
          errors: [],
        },
        {
          allowExpression: true,
          ambiguous: true,
        }
      );
    }
  }

  if (callee.name === "callApi") {
    const metaNode = call.arguments[2];
    if (metaNode && !isNilNode(metaNode)) {
      if (!t.isObjectExpression(metaNode)) {
        result.errors.push({
          message: `"callApi()" third param "meta" expects an object literal, but got ${metaNode.type}`,
          node: metaNode,
          severity: "error",
        });
      } else {
        for (const prop of metaNode.properties) {
          if (!t.isObjectProperty(prop)) {
            result.errors.push({
              message: `"callApi()" third param "meta" expects object properties, but got ${prop.type}`,
              node: prop,
              severity: "error",
            });
            continue;
          }
          const key = prop.key;
          if (!t.isIdentifier(key)) {
            result.errors.push({
              message: `"callApi()" third param "meta" property key must be an identifier, but got ${key.type}`,
              node: key,
              severity: "error",
            });
            continue;
          }
          if (key.name !== "objectId") {
            result.errors.push({
              message: `"callApi()" third param "meta" property key must be "objectId", but got "${key.name}"`,
              node: key,
              severity: "error",
            });
            continue;
          }
          const value = prop.value;
          if (!isNilNode(value)) {
            if (!t.isStringLiteral(value)) {
              result.errors.push({
                message: `"callApi()" third param "meta" property "${key.name}" expects a string literal, but got ${value.type}`,
                node: value,
                severity: "error",
              });
              continue;
            }
            payload.objectId = value.value;
          }
        }
      }
    }
  }

  return payload;
}
