import * as t from "@babel/types";
import { isExpressionString, isNilNode } from "../utils.js";
import type { ConstructJsValueOptions } from "./interfaces.js";
import type { ParseResult, ParseOptions, ToolInfo } from "../interfaces.js";
import { constructJsValue } from "./values.js";

export interface CallApiPayload {
  api: string;
  http?: boolean;
  tool?: ToolInfo;
  params?: string | Record<string, unknown>;
  ambiguousParams?: unknown;
  objectId?: string;
}

const EXPECTED_ARGS = {
  callApi: [2, 3],
  callHttp: [1, 2],
  callTool: [2, 3],
};

export function parseTsxCallApi(
  call: t.Expression,
  result: ParseResult,
  options?: ParseOptions,
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
  let calleeName: "callApi" | "callHttp" | "callTool";
  if (t.isIdentifier(callee)) {
    calleeName = callee.name as "callApi" | "callHttp" | "callTool";
    if (
      calleeName !== "callApi" &&
      calleeName !== "callHttp" &&
      calleeName !== "callTool"
    ) {
      result.errors.push({
        message: `Await expression must call "callApi", "callHttp" or "callTool", received "${calleeName}"`,
        node: callee,
        severity: "error",
      });
      return null;
    }
  } else {
    result.errors.push({
      message: `Await expression must call an identifier, received ${callee.type}`,
      node: callee,
      severity: "error",
    });
    return null;
  }

  const expectedArgs = EXPECTED_ARGS[calleeName];

  const missingArgs = call.arguments.length < expectedArgs[0];
  if (missingArgs || !expectedArgs.includes(call.arguments.length)) {
    result.errors.push({
      message: `"${calleeName}()" expects ${expectedArgs.join(" or ")} arguments, but got ${call.arguments.length}`,
      node: call,
      severity: missingArgs ? "error" : "warning",
    });
    if (missingArgs) {
      return null;
    }
  }

  let payload: CallApiPayload;
  const firstArg = call.arguments[0];

  if (calleeName === "callHttp") {
    const value = constructJsValue(firstArg, result, {
      ...jsValueOptions,
      allowExpression: true,
    });
    if (typeof value !== "string") {
      result.errors.push({
        message: `"${calleeName}()" expects a string value as the first argument, but got ${typeof value}`,
        node: firstArg,
        severity: "error",
      });
      return null;
    }
    payload = {
      api: value,
      http: true,
    };
  } else if (calleeName === "callApi") {
    if (!t.isStringLiteral(firstArg)) {
      result.errors.push({
        message: `"${calleeName}()" expects a string literal as the first argument, but got ${firstArg.type}`,
        node: firstArg,
        severity: "error",
      });
      return null;
    }
    payload = {
      api: firstArg.value,
    };
  } else {
    const conversationId = constructJsValue(firstArg, result, {
      ...jsValueOptions,
      allowExpression: true,
    });
    if (typeof conversationId !== "string") {
      result.errors.push({
        message: `"${calleeName}()" expects a string value as the first argument, but got ${typeof conversationId}`,
        node: firstArg,
        severity: "error",
      });
      return null;
    }

    const secondArg = call.arguments[1];
    const stepId = constructJsValue(secondArg, result, {
      ...jsValueOptions,
      allowExpression: true,
    });
    if (typeof stepId !== "string") {
      result.errors.push({
        message: `"${calleeName}()" expects a string value as the second argument, but got ${typeof stepId}`,
        node: secondArg,
        severity: "error",
      });
      return null;
    }

    const paramsNode = call.arguments[2];
    let params: string | Record<string, unknown> | undefined;
    if (paramsNode) {
      params = constructJsValue(paramsNode, result, {
        ...jsValueOptions,
        allowExpression: true,
      }) as string | Record<string, unknown>;
    }
    payload = {
      api: calleeName,
      tool: { conversationId, stepId },
      params,
    };
  }

  if (calleeName === "callApi" || calleeName === "callHttp") {
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
  }

  if (calleeName === "callApi") {
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
