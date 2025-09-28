import * as t from "@babel/types";
import type { ConstructJsValueOptions } from "./interfaces.js";
import type {
  ParseResult,
  EventHandler,
  ParseOptions,
  TypeEventHandlerOfShowMessage,
} from "../interfaces.js";
import { constructJsValue } from "./values.js";
import { parseTsxCallApi } from "./api.js";

export function constructTsxEvent(
  node: t.Expression | t.ArgumentPlaceholder | t.SpreadElement,
  result: ParseResult,
  options?: ParseOptions,
  valueOptions?: ConstructJsValueOptions,
  isCallback?: boolean
): EventHandler[] | null {
  if (!t.isArrowFunctionExpression(node)) {
    result.errors.push({
      message: `Expected arrow function expression as event handler, but got ${node.type}`,
      node,
      severity: "error",
    });
    return null;
  }

  if (node.params.length > 1) {
    result.errors.push({
      message: `Event handler expects 0 or 1 parameter, but got ${node.params.length}`,
      node,
      severity: "error",
    });
    return null;
  }

  const replacePatterns = new Map<string, string>(
    valueOptions?.replacePatterns ?? []
  );
  const param = node.params[0];
  if (param) {
    if (!t.isIdentifier(param)) {
      result.errors.push({
        message: `Event handler parameter expects an identifier, but got ${param.type}`,
        node: param,
        severity: "error",
      });
      return null;
    }
    const eventParamName = param.name;
    replacePatterns.set(eventParamName, isCallback ? "EVENT.detail" : "EVENT");
    if (result.contexts.includes(eventParamName)) {
      result.errors.push({
        message: `Event handler parameter "${eventParamName}" conflicts with existing global variables`,
        node: param,
        severity: "error",
      });
    }
  }

  if (!t.isBlockStatement(node.body)) {
    result.errors.push({
      message: `Event handler body expects a block statement, but got ${node.body.type}`,
      node: node.body,
      severity: "error",
    });
    return null;
  }

  const handlers: EventHandler[] = [];
  for (const stmt of node.body.body) {
    if (t.isExpressionStatement(stmt)) {
      if (t.isAssignmentExpression(stmt.expression)) {
        const { left, right } = stmt.expression;
        if (!t.isIdentifier(left)) {
          result.errors.push({
            message: `Assignment in event handler expects an identifier on the left side, but got ${left.type}`,
            node: left,
            severity: "error",
          });
          continue;
        }
        const value = constructJsValue(right, result, {
          ...valueOptions,
          allowExpression: true,
          replacePatterns,
        });
        handlers.push({
          action: "update_variable",
          payload: {
            name: left.name,
            value,
          },
        });
      } else if (
        t.isCallExpression(stmt.expression) ||
        t.isOptionalCallExpression(stmt.expression)
      ) {
        const { callee, arguments: args } = stmt.expression;
        if (
          t.isMemberExpression(callee) ||
          t.isOptionalMemberExpression(callee)
        ) {
          if (callee.computed) {
            result.errors.push({
              message: `Member expression in event handler does not support computed property`,
              node: callee.property,
              severity: "error",
            });
            continue;
          }
          const { object } = callee;
          if (
            t.isMemberExpression(object) ||
            t.isOptionalMemberExpression(object)
          ) {
            if (
              !object.computed &&
              t.isIdentifier(object.property) &&
              object.property.name === "current"
            ) {
              const refObject = object.object;
              if (t.isIdentifier(refObject)) {
                const refName = refObject.name;
                const refs = result.templateCollection
                  ? result.templateCollection.refs
                  : result.refs;
                if (!refs.includes(refName)) {
                  result.errors.push({
                    message: `Ref "${refName}" is not defined`,
                    node: refObject,
                    severity: "error",
                  });
                  continue;
                }
                if (!t.isIdentifier(callee.property)) {
                  result.errors.push({
                    message: `Member expression in event handler expects an identifier as property, but got ${callee.property.type}`,
                    node: callee.property,
                    severity: "error",
                  });
                  continue;
                }
                handlers.push({
                  action: "call_ref",
                  payload: {
                    ref: refName,
                    method: callee.property.name,
                    args: args.map((arg) =>
                      constructJsValue(arg, result, {
                        allowExpression: true,
                        replacePatterns,
                      })
                    ),
                    scope: result.templateCollection ? "template" : "view",
                  },
                });
                continue;
              }
            }
          }

          if (!t.isCallExpression(object)) {
            result.errors.push({
              message: `Member expression in event handler expects a call expression as object, but got ${object.type}`,
              node: object,
              severity: "error",
            });
            continue;
          }
          if (!t.isIdentifier(object.callee)) {
            result.errors.push({
              message: `Member expression in event handler expects an identifier as callee, but got ${object.callee.type}`,
              node: object.callee,
              severity: "error",
            });
            continue;
          }
          if (!t.isIdentifier(callee.property)) {
            result.errors.push({
              message: `Member expression in event handler expects an identifier as property, but got ${callee.property.type}`,
              node: callee.property,
              severity: "error",
            });
            continue;
          }
          const action = object.callee.name;
          const componentArgs = object.arguments;
          if (action === "getComponent") {
            if (componentArgs.length !== 2) {
              result.errors.push({
                message: `"getComponent()" expects 2 arguments, but got ${componentArgs.length}`,
                node: stmt.expression,
                severity: "error",
              });
              continue;
            }
            const nameArg = componentArgs[0];
            if (!t.isStringLiteral(nameArg)) {
              result.errors.push({
                message: `"getComponent()" expects a string literal as its first argument, but got ${nameArg.type}`,
                node: nameArg,
                severity: "error",
              });
              continue;
            }
            const idArg = componentArgs[1];
            if (!t.isStringLiteral(idArg)) {
              result.errors.push({
                message: `"getComponent()" expects a string literal as its second argument, but got ${idArg.type}`,
                node: idArg,
                severity: "error",
              });
              continue;
            }
            handlers.push({
              action: "call_component",
              payload: {
                componentId: idArg.value,
                method: callee.property.name,
                args: args.map((arg) =>
                  constructJsValue(arg, result, {
                    allowExpression: true,
                    replacePatterns,
                  })
                ),
              },
            });
          } else if (action === "callApi" || action === "callHttp") {
            if (callee.property.name !== "then") {
              result.errors.push({
                message: `"${action}()" expects "then" as its method, but got ${callee.property.name}`,
                node: callee.property,
                severity: "error",
              });
              continue;
            }
            if (args.length !== 1) {
              result.errors.push({
                message: `"${action}().then()" expects exactly 1 argument, but got ${args.length}`,
                node: stmt.expression,
                severity: "error",
              });
              continue;
            }
            const payload = parseTsxCallApi(object, result, options, {
              replacePatterns,
            });
            if (!payload) {
              continue;
            }
            result.contracts.add(payload.api);
            const successCallback = constructTsxEvent(
              args[0],
              result,
              options,
              valueOptions,
              true
            );
            handlers.push({
              action: "call_api",
              payload,
              callback: successCallback
                ? {
                    success: successCallback,
                  }
                : undefined,
            });
          } else {
            result.errors.push({
              message: `Unsupported action in event handler: ${action}`,
              node: object.callee,
              severity: "error",
            });
          }
          continue;
        }
        if (!t.isIdentifier(callee)) {
          result.errors.push({
            message: `Call expression in event handler expects an identifier as callee, but got ${callee.type}`,
            node: callee,
            severity: "error",
          });
          continue;
        }

        // Signal setters
        if (result.templateCollection) {
          if (result.templateCollection.setters.has(callee.name)) {
            const arg = args[0];
            handlers.push({
              action: "update_variable",
              payload: {
                scope: "template",
                name: result.templateCollection.setters.get(callee.name)!,
                value:
                  arg === undefined
                    ? undefined
                    : constructJsValue(arg, result, {
                        allowExpression: true,
                        replacePatterns,
                      }),
              },
            });
            if (args.length !== 1) {
              result.errors.push({
                message: `State setter expects exactly 1 argument, but got ${args.length}`,
                node: args[1],
                severity: "error",
              });
            }
            continue;
          }
        } else {
          if (result.contextSetters.has(callee.name)) {
            const arg = args[0];
            handlers.push({
              action: "update_variable",
              payload: {
                name: result.contextSetters.get(callee.name)!,
                value:
                  arg === undefined
                    ? undefined
                    : constructJsValue(arg, result, {
                        allowExpression: true,
                        replacePatterns,
                      }),
              },
            });
            if (args.length !== 1) {
              result.errors.push({
                message: `State setter expects exactly 1 argument, but got ${args.length}`,
                node: args[1],
                severity: "error",
              });
            }
            continue;
          }
        }

        if (callee.name === "showMessage") {
          if (args.length !== 1) {
            result.errors.push({
              message: `"showMessage()" expects 1 argument, but got ${args.length}`,
              node: stmt.expression,
              severity: "error",
            });
            continue;
          }
          const payload = constructJsValue(args[0], result, {
            allowExpression: true,
            replacePatterns,
          });
          handlers.push({
            action: "show_message",
            payload,
          } as TypeEventHandlerOfShowMessage);
        } else if (callee.name === "refresh") {
          if (args.length !== 1) {
            result.errors.push({
              message: `"refresh()" expects 1 argument, but got ${args.length}`,
              node: stmt.expression,
              severity: "error",
            });
            continue;
          }
          if (!t.isIdentifier(args[0])) {
            result.errors.push({
              message: `"refresh()" expects an identifier as its argument, but got ${args[0].type}`,
              node: args[0],
              severity: "error",
            });
            continue;
          }
          handlers.push({
            action: "refresh_data_source",
            payload: {
              name: args[0].name,
            },
          });
        } else if (callee.name === "callApi" || callee.name === "callHttp") {
          const payload = parseTsxCallApi(stmt.expression, result, options, {
            replacePatterns,
          });
          if (!payload) {
            continue;
          }
          result.contracts.add(payload.api);
          handlers.push({
            action: "call_api",
            payload,
          });
        } else if (callee.name === "pushQuery") {
          if (args.length !== 1 && args.length !== 2) {
            result.errors.push({
              message: `"pushQuery()" expects 1 or 2 arguments, but got ${args.length}`,
              node: stmt.expression,
              severity: "error",
            });
            continue;
          }
          const queryArgs = args.map((arg) =>
            constructJsValue(arg, result, {
              allowExpression: true,
              replacePatterns,
            })
          );
          handlers.push({
            action: "update_query",
            payload: {
              method: "push",
              args: queryArgs,
            },
          });
        } else {
          result.errors.push({
            message: `Unsupported action in event handler: ${callee.name}`,
            node: callee,
            severity: "error",
          });
        }
      } else {
        result.errors.push({
          message: `Unsupported event handler expression: ${stmt.expression.type}`,
          node: stmt.expression,
          severity: "error",
        });
      }
    } else {
      result.errors.push({
        message: `Unsupported event handler statement: ${stmt.type}`,
        node: stmt,
        severity: "error",
      });
    }
  }

  return handlers;
}
