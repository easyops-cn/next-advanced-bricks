import * as t from "@babel/types";
import type {
  ConstructJsValueOptions,
  ConstructResult,
  EventHandler,
  ParseJsxOptions,
  TypeEventHandlerOfShowMessage,
} from "../interfaces.js";
import { constructJsValue } from "./values.js";
import { parseTsxCallApi } from "./api.js";

export function constructTsxEvent(
  node: t.Expression | t.ArgumentPlaceholder | t.SpreadElement,
  result: ConstructResult,
  options?: ParseJsxOptions,
  valueOptions?: ConstructJsValueOptions
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
    replacePatterns.set(eventParamName, "EVENT");
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
          if (!t.isCallExpression(callee.object)) {
            result.errors.push({
              message: `Member expression in event handler expects a call expression as object, but got ${callee.object.type}`,
              node: callee.object,
              severity: "error",
            });
            continue;
          }
          if (!t.isIdentifier(callee.object.callee)) {
            result.errors.push({
              message: `Member expression in event handler expects an identifier as callee, but got ${callee.object.callee.type}`,
              node: callee.object.callee,
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
          const action = callee.object.callee.name;
          const componentArgs = callee.object.arguments;
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
            const payload = parseTsxCallApi(callee.object, result, options, {
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
              valueOptions
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
              node: callee.object.callee,
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
