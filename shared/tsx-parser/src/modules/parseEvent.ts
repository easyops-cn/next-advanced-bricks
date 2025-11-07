import type { NodePath } from "@babel/traverse";
import type * as t from "@babel/types";
import type {
  BindingInfo,
  EventHandler,
  ParseJsValueOptions,
  ParsedApp,
  ParsedModule,
} from "./interfaces.js";
import type {
  TypeEventHandlerOfShowMessage,
  TypeEventHandlerOfHandleHttpError,
} from "../interfaces.js";
import { parseJsValue } from "./parseJsValue.js";
import {
  CALL_API_LIST,
  HISTORY_METHODS,
  type CallApiType,
  type HistoryMethodType,
} from "./constants.js";
import { parseCallApi } from "./parseCallApi.js";
import {
  isGeneralCallExpression,
  isGeneralMemberExpression,
  validateGlobalApi,
} from "./validations.js";
import { getContextReferenceEventAgentId } from "./getContextReference.js";
import { convertJsxEventAttr } from "./parseJSXElement.js";

export function parseEvent(
  path: NodePath<t.Node>,
  state: ParsedModule,
  app: ParsedApp,
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
  const handler = parseEventHandler(body, state, app, eventOptions);
  if (!handler) {
    return null;
  }

  return ([] as EventHandler[]).concat(handler);
}

export function parseEventHandler(
  path: NodePath<t.Statement | t.Expression | null | undefined>,
  state: ParsedModule,
  app: ParsedApp,
  options: ParseJsValueOptions,
  handleReturn?: (returnPath: NodePath<t.ReturnStatement>) => void
): EventHandler | EventHandler[] | null {
  if (path.isBlockStatement()) {
    return path
      .get("body")
      .flatMap((stmtPath) => parseEventHandler(stmtPath, state, app, options))
      .filter((h): h is EventHandler => h !== null);
  }

  if (path.isIfStatement()) {
    const test = parseJsValue(path.get("test"), state, app, options) as
      | string
      | boolean
      | undefined;
    return {
      action: "conditional",
      payload: {
        test,
        consequent: parseEventHandler(
          path.get("consequent"),
          state,
          app,
          options
        ),
        alternate: path.node.alternate
          ? parseEventHandler(path.get("alternate"), state, app, options)
          : null,
      },
    };
  }

  if (path.isExpressionStatement()) {
    return parseEventHandler(path.get("expression"), state, app, options);
  }

  if (path.isReturnStatement() && handleReturn) {
    handleReturn(path);
  }

  if (isGeneralCallExpression(path)) {
    const callee = path.get("callee");
    const args = path.get("arguments");
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
        const payload = parseJsValue(args[0], state, app, options);
        return {
          action: "show_message",
          payload,
        } as TypeEventHandlerOfShowMessage;
      }

      if (validateGlobalApi(callee, "handleHttpError")) {
        if (args.length !== 1) {
          state.errors.push({
            message: `"handleHttpError()" expects exactly 1 argument, but got ${args.length}`,
            node: path.node,
            severity: "error",
          });
          return null;
        }
        const payload = parseJsValue(args[0], state, app, options);
        return {
          action: "handle_http_error",
          payload,
        } as TypeEventHandlerOfHandleHttpError;
      }

      for (const name of CALL_API_LIST) {
        if (validateGlobalApi(callee, name)) {
          const payload = parseCallApi(path, state, app, options);
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
                  : parseJsValue(args[0], state, app, {
                      ...options,
                      modifier: undefined,
                    }),
              scope:
                options.component!.type === "template" ? "template" : "global",
            },
          };
        case "refetch":
          return {
            action: "refresh_data_source",
            payload: {
              name: binding.resourceId!.name,
              scope:
                options.component!.type === "template" ? "template" : "global",
            },
          };
        case "context":
          return {
            action: "call_selector",
            payload: {
              selector: `#${getContextReferenceEventAgentId(binding.contextProvider!.name)}`,
              method: "trigger",
              args: [
                {
                  name: binding.contextKey!,
                  value:
                    args[0] === undefined
                      ? undefined
                      : parseJsValue(args[0], state, app, {
                          ...options,
                          modifier: undefined,
                        }),
                },
              ],
            },
          };
        case "eventHandler": {
          if (args.length > 1) {
            state.errors.push({
              message: `Event dispatcher "${callee.node.name}" expects at most 1 argument, but got ${args.length}`,
              node: path.node,
              severity: "error",
            });
            return null;
          }
          let detail: unknown;
          if (args.length > 0) {
            const event = args[0];
            if (!event.isObjectExpression()) {
              state.errors.push({
                message: `Event dispatcher "${callee.node.name}" argument must be an object expression, but got ${event.type}`,
                node: event.node,
                severity: "error",
              });
              return null;
            }
            for (const prop of event.get("properties")) {
              if (!prop.isObjectProperty()) {
                state.errors.push({
                  message: `Event dispatcher "${callee.node.name}" argument object expression must have only object properties, but got ${prop.type}`,
                  node: prop.node,
                  severity: "error",
                });
                return null;
              }
              if (prop.node.computed) {
                state.errors.push({
                  message: `Event dispatcher "${callee.node.name}" argument object expression must not have computed properties`,
                  node: prop.node,
                  severity: "error",
                });
                return null;
              }
              const key = prop.get("key");
              if (!key.isIdentifier() || key.node.name !== "detail") {
                state.errors.push({
                  message: `Event dispatcher "${callee.node.name}" argument object expression property key must be an identifier with name "detail", but got ${key.type}${key.isIdentifier() ? ` (name: ${key.node.name})` : ""}`,
                  node: key.node,
                  severity: "error",
                });
                return null;
              }
              detail = parseJsValue(prop.get("value"), state, app, {
                ...options,
                modifier: undefined,
              });
            }
          }
          return {
            action: "dispatch_event",
            payload: {
              type: convertJsxEventAttr(binding.id.name),
              detail,
            },
          };
        }
        default:
          state.errors.push({
            message: `"${callee.node.name}" is not callable`,
            node: callee.node,
            severity: "error",
          });
          return null;
      }
    } else if (isGeneralMemberExpression(callee)) {
      if (callee.node.computed) {
        state.errors.push({
          message: `Event handler call expression with computed member expression is not supported`,
          node: callee.node,
          severity: "error",
        });
        return null;
      }
      const object = callee.get("object");
      if (isGeneralMemberExpression(object)) {
        const property = object.get("property");
        if (
          !object.node.computed &&
          property.isIdentifier() &&
          property.node.name === "current"
        ) {
          const refObject = object.get("object");
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
            const property = callee.get("property");
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
                args: args.map((arg) => parseJsValue(arg, state, app, options)),
                scope:
                  options.component!.type === "template"
                    ? "template"
                    : "global",
              },
            };
          }
        }
      }

      if (object.isIdentifier()) {
        // Assert: object.isReferencedIdentifier()
        const bindingId = object.scope.getBindingIdentifier(object.node.name);
        if (bindingId) {
          const binding = options.component?.bindingMap.get(bindingId);
          if (binding) {
            if (binding.kind === "history") {
              const property = callee.get("property");
              if (!property.isIdentifier()) {
                state.errors.push({
                  message: `Event handler call expression with non-identifier property is not supported`,
                  node: property.node,
                  severity: "error",
                });
                return null;
              }
              const method = property.node.name as HistoryMethodType;
              if (!HISTORY_METHODS.includes(method)) {
                state.errors.push({
                  message: `"history.${method}()" is not supported in event handler`,
                  node: property.node,
                  severity: "error",
                });
                return null;
              }
              return {
                action: "navigate",
                payload: {
                  method,
                  args: args.map((arg) =>
                    parseJsValue(arg, state, app, options)
                  ),
                },
              };
            }
          }
        }
      }

      if (!object.isCallExpression()) {
        state.errors.push({
          message: "Invalid usage in event handler",
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
      const property = callee.get("property");
      if (!property.isIdentifier()) {
        state.errors.push({
          message: `Member expression in event handler expects an identifier as property, but got ${property.type}`,
          node: property.node,
          severity: "error",
        });
        return null;
      }

      let calleeName: CallApiType | undefined;
      for (const name of CALL_API_LIST) {
        if (validateGlobalApi(objectCallee, name)) {
          calleeName = name;
          break;
        }
      }
      if (calleeName) {
        const method = property.node.name;
        if (method !== "then" && method !== "catch") {
          state.errors.push({
            message: `"${calleeName}()" expects "then" or "catch" as its method, but got ${method}`,
            node: property.node,
            severity: "error",
          });
          return null;
        }

        if (method === "catch") {
          if (args.length !== 1) {
            state.errors.push({
              message: `".catch()" expects exactly 1 argument, but got ${args.length}`,
              node: args.length > 0 ? args[1].node : property.node,
              severity: "error",
            });
            return null;
          }
        } else {
          if (args.length === 0 || args.length > 2) {
            state.errors.push({
              message: `".then()" expects 1 or 2 arguments, but got ${args.length}`,
              node: args.length > 2 ? args[2].node : property.node,
              severity: "error",
            });
            return null;
          }
        }

        const payload = parseCallApi(object, state, app, options);
        if (!payload) {
          return null;
        }
        state.contracts.add(payload.api);

        let successCallback: EventHandler[] | null | undefined;
        let errorCallback: EventHandler[] | null | undefined;
        const callback = parseEvent(args[0], state, app, options, true);
        if (method === "catch") {
          errorCallback = callback;
        } else {
          successCallback = callback;
          if (args.length > 1) {
            errorCallback = parseEvent(args[1], state, app, options, true);
          }
        }
        return {
          action: "call_api",
          payload,
          callback: {
            success: successCallback,
            error: errorCallback,
          },
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
