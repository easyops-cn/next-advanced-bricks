import type { NodePath } from "@babel/traverse";
import type * as t from "@babel/types";
import type {
  ParseJsValueOptions,
  ParseModuleState,
  ToolInfo,
} from "./interfaces.js";
import { parseJsValue } from "./parseJsValue.js";
import { isNilPath, validateGlobalApi } from "./validations.js";
import { isExpressionString } from "../utils.js";
import { CALL_API_LIST } from "./constants.js";

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

export function parseCallApi(
  path: NodePath<t.Expression>,
  state: ParseModuleState,
  options: ParseJsValueOptions
): CallApiPayload | null {
  if (!(path.isCallExpression() || path.isOptionalCallExpression())) {
    state.errors.push({
      message: `Await expression must be a call expression, received ${path.node.type}`,
      node: path.node,
      severity: "error",
    });
    return null;
  }
  const callee = path.get("callee") as NodePath<t.Expression>;
  let calleeName: "callApi" | "callHttp" | "callTool" | undefined;
  if (callee.isIdentifier()) {
    for (const name of CALL_API_LIST) {
      if (validateGlobalApi(callee, name)) {
        calleeName = name;
        break;
      }
    }
    if (!calleeName) {
      state.errors.push({
        message: `Await expression must call "callApi", "callHttp" or "callTool", received "${callee.node.name}"`,
        node: callee.node,
        severity: "error",
      });
      return null;
    }
  } else {
    state.errors.push({
      message: `Await expression must call an identifier, received ${callee.type}`,
      node: callee.node,
      severity: "error",
    });
    return null;
  }

  const expectedArgs = EXPECTED_ARGS[calleeName];

  const args = path.get("arguments") as NodePath<
    t.Expression | t.SpreadElement | t.ArgumentPlaceholder
  >[];
  const missingArgs = args.length < expectedArgs[0];
  if (missingArgs || !expectedArgs.includes(args.length)) {
    state.errors.push({
      message: `"${calleeName}()" expects ${expectedArgs.join(" or ")} arguments, but got ${args.length}`,
      node: path.node,
      severity: missingArgs ? "error" : "warning",
    });
    if (missingArgs) {
      return null;
    }
  }

  let payload: CallApiPayload;
  const firstArg = args[0];

  if (calleeName === "callHttp") {
    const value = parseJsValue(firstArg, state, options);
    if (typeof value !== "string") {
      state.errors.push({
        message: `"${calleeName}()" expects a string value as the first argument, but got ${typeof value}`,
        node: firstArg.node,
        severity: "error",
      });
      return null;
    }
    payload = {
      api: value,
      http: true,
    };
  } else if (calleeName === "callApi") {
    if (!firstArg.isStringLiteral()) {
      state.errors.push({
        message: `"${calleeName}()" expects a string literal as the first argument, but got ${firstArg.type}`,
        node: firstArg.node,
        severity: "error",
      });
      return null;
    }
    payload = {
      api: firstArg.node.value,
    };
  } else {
    const conversationId = parseJsValue(firstArg, state, options);
    if (typeof conversationId !== "string") {
      state.errors.push({
        message: `"${calleeName}()" expects a string value as the first argument, but got ${typeof conversationId}`,
        node: firstArg.node,
        severity: "error",
      });
      return null;
    }

    const secondArg = args[1];
    const stepId = parseJsValue(secondArg, state, options);
    if (typeof stepId !== "string") {
      state.errors.push({
        message: `"${calleeName}()" expects a string value as the second argument, but got ${typeof stepId}`,
        node: secondArg.node,
        severity: "error",
      });
      return null;
    }

    const paramsNode = args[2];
    let params: string | Record<string, unknown> | undefined;
    if (paramsNode) {
      params = parseJsValue(paramsNode, state, options) as
        | string
        | Record<string, unknown>;
    }
    payload = {
      api: calleeName,
      tool: { conversationId, stepId },
      params,
    };
  }

  if (calleeName === "callApi" || calleeName === "callHttp") {
    const valuePath = args[1];

    if (valuePath && !isNilPath(valuePath)) {
      if (!valuePath.isObjectExpression()) {
        state.errors.push({
          message: `Data source "params" prefers an object literal, but got ${valuePath.type}`,
          node: valuePath.node,
          severity: "notice",
        });
      }
      const params = parseJsValue(valuePath, state, options);
      if (
        isExpressionString(params) ||
        (typeof params === "object" && params !== null)
      ) {
        payload.params = params as string | Record<string, unknown>;
      } else {
        state.errors.push({
          message: `API params expects an object or expression, but got ${typeof params}`,
          node: valuePath.node,
          severity: "error",
        });
      }
      // TODO: set ambiguousProps when reward is enabled
    }
  }

  if (calleeName === "callApi") {
    const metaPath = args[2];
    if (metaPath && !isNilPath(metaPath)) {
      if (!metaPath.isObjectExpression()) {
        state.errors.push({
          message: `"callApi()" third param "meta" expects an object literal, but got ${metaPath.type}`,
          node: metaPath.node,
          severity: "error",
        });
      } else {
        const props = metaPath.get("properties");
        for (const prop of props) {
          if (!prop.isObjectProperty()) {
            state.errors.push({
              message: `"callApi()" third param "meta" expects object properties, but got ${prop.type}`,
              node: prop.node,
              severity: "error",
            });
            continue;
          }
          const key = prop.get("key");
          if (!key.isIdentifier()) {
            state.errors.push({
              message: `"callApi()" third param "meta" property key must be an identifier, but got ${key.type}`,
              node: key.node,
              severity: "error",
            });
            continue;
          }
          if (key.node.name !== "objectId") {
            state.errors.push({
              message: `"callApi()" third param "meta" property key must be "objectId", but got "${key.node.name}"`,
              node: key.node,
              severity: "error",
            });
            continue;
          }
          const value = prop.get("value");
          if (!isNilPath(value)) {
            if (!value.isStringLiteral()) {
              state.errors.push({
                message: `"callApi()" third param "meta" property "${key.node.name}" expects a string literal, but got ${value.type}`,
                node: value.node,
                severity: "error",
              });
              continue;
            }
            payload.objectId = value.node.value;
          }
        }
      }
    }
  }

  return payload;
}
