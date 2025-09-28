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

  const handlers = node.body.body
    .map(
      (stmt) =>
        constructEventHandler(
          stmt,
          result,
          replacePatterns,
          options,
          valueOptions
        ) ?? []
    )
    .flat();

  return handlers;
}

function constructEventHandler(
  stmt: t.Statement,
  result: ParseResult,
  replacePatterns: Map<string, string>,
  options?: ParseOptions,
  valueOptions?: ConstructJsValueOptions
): EventHandler | EventHandler[] | null {
  if (t.isBlockStatement(stmt)) {
    return stmt.body
      .map((s) =>
        constructEventHandler(s, result, replacePatterns, options, valueOptions)
      )
      .filter((h): h is EventHandler => h !== null)
      .flat();
  }

  if (t.isIfStatement(stmt)) {
    const test = constructJsValue(stmt.test, result, {
      ...valueOptions,
      allowExpression: true,
      replacePatterns,
    }) as string | boolean | undefined;
    return {
      action: "conditional",
      payload: {
        test,
        consequent: constructEventHandler(
          stmt.consequent,
          result,
          replacePatterns,
          options,
          valueOptions
        ),
        alternate: stmt.alternate
          ? constructEventHandler(
              stmt.alternate,
              result,
              replacePatterns,
              options,
              valueOptions
            )
          : null,
      },
    };
  }

  if (t.isExpressionStatement(stmt)) {
    if (t.isAssignmentExpression(stmt.expression)) {
      const { left, right } = stmt.expression;
      if (!t.isIdentifier(left)) {
        result.errors.push({
          message: `Assignment in event handler expects an identifier on the left side, but got ${left.type}`,
          node: left,
          severity: "error",
        });
        return null;
      }
      const value = constructJsValue(right, result, {
        ...valueOptions,
        allowExpression: true,
        replacePatterns,
      });
      return {
        action: "update_variable",
        payload: {
          name: left.name,
          value,
        },
      };
    }

    if (
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
          return null;
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
                return null;
              }
              if (!t.isIdentifier(callee.property)) {
                result.errors.push({
                  message: `Member expression in event handler expects an identifier as property, but got ${callee.property.type}`,
                  node: callee.property,
                  severity: "error",
                });
                return null;
              }
              return {
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
              };
            }
          }
        }

        if (!t.isCallExpression(object)) {
          result.errors.push({
            message: `Member expression in event handler expects a call expression as object, but got ${object.type}`,
            node: object,
            severity: "error",
          });
          return null;
        }
        if (!t.isIdentifier(object.callee)) {
          result.errors.push({
            message: `Member expression in event handler expects an identifier as callee, but got ${object.callee.type}`,
            node: object.callee,
            severity: "error",
          });
          return null;
        }
        if (!t.isIdentifier(callee.property)) {
          result.errors.push({
            message: `Member expression in event handler expects an identifier as property, but got ${callee.property.type}`,
            node: callee.property,
            severity: "error",
          });
          return null;
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
            return null;
          }
          const nameArg = componentArgs[0];
          if (!t.isStringLiteral(nameArg)) {
            result.errors.push({
              message: `"getComponent()" expects a string literal as its first argument, but got ${nameArg.type}`,
              node: nameArg,
              severity: "error",
            });
            return null;
          }
          const idArg = componentArgs[1];
          if (!t.isStringLiteral(idArg)) {
            result.errors.push({
              message: `"getComponent()" expects a string literal as its second argument, but got ${idArg.type}`,
              node: idArg,
              severity: "error",
            });
            return null;
          }
          return {
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
          };
        }

        if (action === "callApi" || action === "callHttp") {
          if (callee.property.name !== "then") {
            result.errors.push({
              message: `"${action}()" expects "then" as its method, but got ${callee.property.name}`,
              node: callee.property,
              severity: "error",
            });
            return null;
          }
          if (args.length !== 1) {
            result.errors.push({
              message: `"${action}().then()" expects exactly 1 argument, but got ${args.length}`,
              node: stmt.expression,
              severity: "error",
            });
            return null;
          }
          const payload = parseTsxCallApi(object, result, options, {
            replacePatterns,
          });
          if (!payload) {
            return null;
          }
          result.contracts.add(payload.api);
          const successCallback = constructTsxEvent(
            args[0],
            result,
            options,
            valueOptions,
            true
          );
          return {
            action: "call_api",
            payload,
            callback: successCallback
              ? {
                  success: successCallback,
                }
              : undefined,
          };
        }

        result.errors.push({
          message: `Unsupported action in event handler: ${action}`,
          node: object.callee,
          severity: "error",
        });
        return null;
      }

      if (!t.isIdentifier(callee)) {
        result.errors.push({
          message: `Call expression in event handler expects an identifier as callee, but got ${callee.type}`,
          node: callee,
          severity: "error",
        });
        return null;
      }

      // Signal setters
      if (result.templateCollection) {
        if (result.templateCollection.setters.has(callee.name)) {
          if (args.length !== 1) {
            result.errors.push({
              message: `State setter expects exactly 1 argument, but got ${args.length}`,
              node: args[1],
              severity: "error",
            });
          }
          const arg = args[0];
          return {
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
          };
        }
      } else {
        if (result.contextSetters.has(callee.name)) {
          if (args.length !== 1) {
            result.errors.push({
              message: `State setter expects exactly 1 argument, but got ${args.length}`,
              node: args[1],
              severity: "error",
            });
          }
          const arg = args[0];
          return {
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
          };
        }
      }

      if (callee.name === "showMessage") {
        if (args.length !== 1) {
          result.errors.push({
            message: `"showMessage()" expects 1 argument, but got ${args.length}`,
            node: stmt.expression,
            severity: "error",
          });
          return null;
        }
        const payload = constructJsValue(args[0], result, {
          allowExpression: true,
          replacePatterns,
        });
        return {
          action: "show_message",
          payload,
        } as TypeEventHandlerOfShowMessage;
      }

      if (callee.name === "refresh") {
        if (args.length !== 1) {
          result.errors.push({
            message: `"refresh()" expects 1 argument, but got ${args.length}`,
            node: stmt.expression,
            severity: "error",
          });
          return null;
        }
        if (!t.isIdentifier(args[0])) {
          result.errors.push({
            message: `"refresh()" expects an identifier as its argument, but got ${args[0].type}`,
            node: args[0],
            severity: "error",
          });
          return null;
        }
        return {
          action: "refresh_data_source",
          payload: {
            name: args[0].name,
          },
        };
      }

      if (callee.name === "callApi" || callee.name === "callHttp") {
        const payload = parseTsxCallApi(stmt.expression, result, options, {
          replacePatterns,
        });
        if (!payload) {
          return null;
        }
        result.contracts.add(payload.api);
        return {
          action: "call_api",
          payload,
        };
      }

      if (callee.name === "pushQuery") {
        if (args.length !== 1 && args.length !== 2) {
          result.errors.push({
            message: `"pushQuery()" expects 1 or 2 arguments, but got ${args.length}`,
            node: stmt.expression,
            severity: "error",
          });
          return null;
        }
        const queryArgs = args.map((arg) =>
          constructJsValue(arg, result, {
            allowExpression: true,
            replacePatterns,
          })
        );
        return {
          action: "update_query",
          payload: {
            method: "push",
            args: queryArgs,
          },
        };
      }

      result.errors.push({
        message: `Unsupported action in event handler: ${callee.name}`,
        node: callee,
        severity: "error",
      });
      return null;
    }

    result.errors.push({
      message: `Unsupported event handler expression: ${stmt.expression.type}`,
      node: stmt.expression,
      severity: "error",
    });
    return null;
  }

  result.errors.push({
    message: `Unsupported event handler statement: ${stmt.type}`,
    node: stmt,
    severity: "error",
  });
  return null;
}
