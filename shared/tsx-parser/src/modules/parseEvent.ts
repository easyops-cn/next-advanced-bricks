import type { NodePath } from "@babel/traverse";
import type * as t from "@babel/types";
import type {
  BindingInfo,
  EventHandler,
  ParseJsValueOptions,
  ParseModuleState,
  TypeEventHandlerOfShowMessage,
} from "./interfaces.js";
import { parseJsValue } from "./parseJsValue.js";
import { CALL_API_LIST } from "./constants.js";
import { parseCallApi } from "./parseCallApi.js";
import { validateGlobalApi } from "./validations.js";

export function parseEvent(
  path: NodePath<t.Node>,
  state: ParseModuleState,
  options: ParseJsValueOptions,
  isCallback?: boolean
): EventHandler[] | null {
  if (!path.isArrowFunctionExpression()) {
    state.errors.push({
      message: `Event handler must be an arrow function expression, but got ${path.type}`,
      node: path.node,
      severity: "error",
    });
    return null;
  }

  const params = path.get("params");
  if (params.length > 1) {
    state.errors.push({
      message: `Event handler arrow function must have at most one parameter, but got ${params.length}`,
      node: path.node,
      severity: "error",
    });
    return null;
  }

  const param = params[0];
  const eventOptions: ParseJsValueOptions = {
    ...options,
    modifier: undefined,
    eventBinding: undefined,
  };
  if (param) {
    if (!param.isIdentifier()) {
      state.errors.push({
        message: `Event handler arrow function parameter must be an identifier, but got ${param.type}`,
        node: param.node,
        severity: "error",
      });
      return null;
    }
    eventOptions.eventBinding = { id: param.node, isCallback };
  }

  const body = path.get("body");
  const handler = parseEventHandler(body, state, eventOptions);
  if (!handler) {
    return null;
  }

  return ([] as EventHandler[]).concat(handler);
}

function parseEventHandler(
  path: NodePath<t.Statement | t.Expression | null | undefined>,
  state: ParseModuleState,
  options: ParseJsValueOptions
): EventHandler | EventHandler[] | null {
  if (path.isBlockStatement()) {
    return path
      .get("body")
      .flatMap((stmtPath) => parseEventHandler(stmtPath, state, options))
      .filter((h): h is EventHandler => h !== null);
  }

  if (path.isIfStatement()) {
    const test = parseJsValue(path.get("test"), state, options) as
      | string
      | boolean
      | undefined;
    return {
      action: "conditional",
      payload: {
        test,
        consequent: parseEventHandler(path.get("consequent"), state, options),
        alternate: path.node.alternate
          ? parseEventHandler(path.get("alternate"), state, options)
          : null,
      },
    };
  }

  if (path.isExpressionStatement()) {
    return parseEventHandler(path.get("expression"), state, options);
  }

  if (path.isCallExpression() || path.isOptionalCallExpression()) {
    const callee = (path as NodePath<t.CallExpression>).get("callee");
    const args = (path as NodePath<t.CallExpression>).get(
      "arguments"
    ) as NodePath<t.Expression | t.SpreadElement>[];
    if (callee.isIdentifier()) {
      if (validateGlobalApi(callee, "showMessage")) {
        if (args.length !== 1) {
          state.errors.push({
            message: `"showMessage()" expects exactly 1 argument, but got ${args.length}`,
            node: path.node,
            severity: "error",
          });
          return null;
        }
        const payload = parseJsValue(args[0], state, options);
        return {
          action: "show_message",
          payload,
        } as TypeEventHandlerOfShowMessage;
      }

      if (validateGlobalApi(callee, "pushQuery")) {
        if (args.length !== 1 && args.length !== 2) {
          state.errors.push({
            message: `"pushQuery()" expects 1 or 2 arguments, but got ${args.length}`,
            node: path.node,
            severity: "error",
          });
          return null;
        }
        const queryArgs = args.map((arg) => parseJsValue(arg, state, options));
        return {
          action: "update_query",
          payload: {
            method: "push",
            args: queryArgs,
          },
        };
      }

      for (const name of CALL_API_LIST) {
        if (validateGlobalApi(callee, name)) {
          const payload = parseCallApi(path, state, options);
          if (!payload) {
            return null;
          }
          state.contracts.add(payload.api);
          return {
            action: "call_api",
            payload,
          };
        }
      }

      // Assert: callee.isReferencedIdentifier()
      const bindingId = callee.scope.getBindingIdentifier(callee.node.name);
      let binding: BindingInfo | undefined;
      if (bindingId) {
        binding = options.component?.bindingMap.get(bindingId);
      }
      if (!binding) {
        state.errors.push({
          message: `Function "${callee.node.name}" is not defined`,
          node: callee.node,
          severity: "error",
        });
        return null;
      }
      switch (binding.kind) {
        case "setState":
          return {
            action: "update_variable",
            payload: {
              name: binding.id.name,
              value:
                args[0] === undefined
                  ? undefined
                  : parseJsValue(args[0], state, {
                      ...options,
                      modifier: undefined,
                    }),
            },
          };
        default:
          state.errors.push({
            message: `"${callee.node.name}" is not callable`,
            node: callee.node,
            severity: "error",
          });
          return null;
      }
    } else if (
      callee.isMemberExpression() ||
      callee.isOptionalMemberExpression()
    ) {
      if (callee.node.computed) {
        state.errors.push({
          message: `Event handler call expression with computed member expression is not supported`,
          node: callee.node,
          severity: "error",
        });
        return null;
      }
      const object = (callee as NodePath<t.MemberExpression>).get("object");
      if (object.isMemberExpression() || object.isOptionalMemberExpression()) {
        const property = (object as NodePath<t.MemberExpression>).get(
          "property"
        );
        if (
          !object.node.computed &&
          property.isIdentifier() &&
          property.node.name === "current"
        ) {
          const refObject = (object as NodePath<t.MemberExpression>).get(
            "object"
          );
          if (refObject.isIdentifier()) {
            const refBindingId = refObject.scope.getBindingIdentifier(
              refObject.node.name
            );
            let refBinding: BindingInfo | undefined;
            if (refBindingId) {
              refBinding = options.component?.bindingMap.get(refBindingId);
            }
            if (!refBinding) {
              state.errors.push({
                message: `Variable "${refObject.node.name}" is not defined`,
                node: refObject.node,
                severity: "error",
              });
              return null;
            }
            if (refBinding.kind !== "ref") {
              state.errors.push({
                message: `Variable "${refObject.node.name}" is not a ref, but a ${refBinding.kind}`,
                node: refObject.node,
                severity: "error",
              });
              return null;
            }
            const property = (callee as NodePath<t.MemberExpression>).get(
              "property"
            );
            if (!property.isIdentifier()) {
              state.errors.push({
                message: `Event handler call expression with non-identifier property is not supported`,
                node: property.node,
                severity: "error",
              });
              return null;
            }
            return {
              action: "call_ref",
              payload: {
                ref: refBinding.id.name,
                method: property.node.name,
                args: args.map((arg) => parseJsValue(arg, state, options)),
                scope: options.component?.type,
              },
            };
          }
        }
      }

      if (!object.isCallExpression()) {
        state.errors.push({
          message: `Member expression in event handler expects a call expression as object, but got ${object.type}`,
          node: object.node,
          severity: "error",
        });
        return null;
      }
      const objectCallee = object.get("callee");
      if (!objectCallee.isIdentifier()) {
        state.errors.push({
          message: `Member expression in event handler expects an identifier as callee, but got ${objectCallee.type}`,
          node: objectCallee.node,
          severity: "error",
        });
        return null;
      }
      const property = (callee as NodePath<t.MemberExpression>).get("property");
      if (!property.isIdentifier()) {
        state.errors.push({
          message: `Member expression in event handler expects an identifier as property, but got ${property.type}`,
          node: property.node,
          severity: "error",
        });
        return null;
      }
      // const action = objectCallee.node.name;
      let calleeName: "callApi" | "callHttp" | "callTool" | undefined;
      for (const name of CALL_API_LIST) {
        if (validateGlobalApi(objectCallee, name)) {
          calleeName = name;
          break;
        }
      }
      if (calleeName) {
        if (property.node.name !== "then") {
          state.errors.push({
            message: `"${calleeName}()" expects "then" as its method, but got ${property.node.name}`,
            node: property.node,
            severity: "error",
          });
          return null;
        }
        if (args.length !== 1) {
          state.errors.push({
            message: `"${calleeName}().then()" expects exactly 1 argument, but got ${args.length}`,
            node: property.node,
            severity: "error",
          });
          return null;
        }
        const payload = parseCallApi(object, state, options);
        if (!payload) {
          return null;
        }
        state.contracts.add(payload.api);
        const successCallback = parseEvent(args[0], state, options, true);
        return {
          action: "call_api",
          payload,
          callback: successCallback ? { success: successCallback } : undefined,
        };
      }

      state.errors.push({
        message: `Unsupported action in event handler: ${objectCallee.node.name}`,
        node: objectCallee.node,
        severity: "error",
      });
      return null;
    }
  }

  state.errors.push({
    message: `Unsupported event handler`,
    node: path.node,
    severity: "error",
  });

  return null;
}
