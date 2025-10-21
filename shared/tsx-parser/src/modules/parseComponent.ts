import type { NodePath } from "@babel/traverse";
import type * as t from "@babel/types";
import type {
  BindingInfo,
  BindingMap,
  ParsedComponent,
  ParseJsValueOptions,
  ParsedModule,
  ParsedApp,
  ComponentChild,
} from "./interfaces.js";
import {
  validateEmbeddedExpression,
  validateFunction,
  validateGlobalApi,
} from "./validations.js";
import { parseJsValue, parsePropValue } from "./parseJsValue.js";
import { parseChildren } from "./parseChildren.js";
import { parseUseResource } from "./parseUseResource.js";

export function parseComponent(
  fn: NodePath<t.FunctionDeclaration>,
  state: ParsedModule,
  app: ParsedApp,
  type: "template" | "view" | "page",
  globalOptions?: ParseJsValueOptions
): ParsedComponent | null {
  if (!validateFunction(fn.node, state)) {
    return null;
  }

  const bindingMap: BindingMap = new Map();
  const component: ParsedComponent = {
    bindingMap,
    type,
    id: fn.node.id,
  };
  const options: ParseJsValueOptions = { ...globalOptions, component };

  const params = fn.get("params");
  if (type === "template") {
    if (params.length > 1) {
      state.errors.push({
        message: `Component function can only have zero or one parameter, received ${params.length}`,
        node: fn.node,
        severity: "error",
      });
      return null;
    }
    if (params.length > 0) {
      const param = params[0];
      if (!param.isObjectPattern()) {
        state.errors.push({
          message: `Component function parameter must be an object pattern, received ${param.type}`,
          node: param.node,
          severity: "error",
        });
        return null;
      }
      for (const prop of param.get("properties")) {
        if (prop.isRestElement()) {
          state.errors.push({
            message: `Component function parameter rest element is not allowed`,
            node: prop.node,
            severity: "error",
          });
          return null;
        }
        const propNode = prop.node as t.ObjectProperty;
        if (propNode.computed || !propNode.shorthand) {
          state.errors.push({
            message: `Component function parameter properties must be shorthand and not computed`,
            node: prop.node,
            severity: "error",
          });
          return null;
        }
        const key = prop.get("key") as NodePath<t.ObjectProperty["key"]>;
        const value = prop.get("value") as NodePath<t.ObjectProperty["value"]>;
        if (!key.isIdentifier()) {
          state.errors.push({
            message: `Component function parameter property key must be an identifier, received ${key.type}`,
            node: key.node,
            severity: "error",
          });
          return null;
        }
        const varName = key.node.name;
        const isEventHandler = /^on[A-Z]/.test(varName);
        if (isEventHandler) {
          if (!value.isIdentifier()) {
            state.errors.push({
              message: `Event handler parameter "${varName}" must be an identifier, received ${value.type}`,
              node: value.node,
              severity: "error",
            });
            return null;
          }
          bindingMap.set(value.node, { id: value.node, kind: "eventHandler" });
        } else {
          let bindingId: t.Identifier | undefined;
          let initialValue: unknown;
          if (value.isAssignmentPattern()) {
            const left = value.get("left");
            if (left.isIdentifier()) {
              bindingId = left.node;
              initialValue = parseJsValue(
                value.get("right"),
                state,
                app,
                options
              );
            }
          } else if (value.isIdentifier()) {
            bindingId = value.node;
          }
          if (!bindingId) {
            state.errors.push({
              message: `Component function parameter property value must be an identifier or assignment pattern, received ${value.type}`,
              node: value.node,
              severity: "error",
            });
            continue;
          }
          const paramBinding: BindingInfo = {
            id: bindingId,
            kind: "param",
            initialValue,
          };
          bindingMap.set(bindingId, paramBinding);
        }
      }
    }
  } else if (params.length > 0) {
    state.errors.push({
      message: `Page function cannot have parameters, received ${params.length}`,
      node: params[0].node,
      severity: "error",
    });
    return null;
  }

  let prevSlot: string | undefined;
  let prevParent: ParsedComponent | ComponentChild = component;

  const stmts = fn.get("body").get("body");
  for (const stmt of stmts) {
    if (stmt.isVariableDeclaration()) {
      if (stmt.node.kind !== "const") {
        state.errors.push({
          message: `Only "const" variable declaration is allowed, received "${stmt.node.kind}"`,
          node: stmt.node,
          severity: "error",
        });
        continue;
      }
      for (const decl of stmt.get("declarations")) {
        const init = decl.get("init");
        // Hooks
        if (init.isCallExpression()) {
          const callee = init.get("callee");
          if (callee.isIdentifier()) {
            const args = init.get("arguments");
            if (validateGlobalApi(callee, "useState")) {
              const declId = decl.get("id");
              if (!declId.isArrayPattern()) {
                continue;
              }
              const elements = declId.get("elements");
              if (elements.length !== 2) {
                state.errors.push({
                  message: `useState() destructuring must have exactly two elements, received ${elements.length}`,
                  node: declId.node,
                  severity: "error",
                });
                continue;
              }
              const stateVar = elements[0];
              const setStateVar = elements[1];
              if (!stateVar.isIdentifier() || !setStateVar.isIdentifier()) {
                state.errors.push({
                  message: `useState() destructuring must have identifiers as elements, received ${elements.map((el) => el.type).join(", ")}`,
                  node: declId.node,
                  severity: "error",
                });
                continue;
              }
              const stateInfo: BindingInfo = {
                id: stateVar.node,
                kind: "state",
              };
              bindingMap.set(stateVar.node, stateInfo);
              bindingMap.set(setStateVar.node, {
                id: stateVar.node,
                kind: "setState",
              });
              if (args.length > 0) {
                stateInfo.initialValue = parseJsValue(
                  args[0],
                  state,
                  app,
                  options
                );
              }
              if (args.length > 1) {
                state.errors.push({
                  message: `useState() only accepts at most one argument, received ${args.length}`,
                  node: args[1].node,
                  severity: "warning",
                });
              }
              continue;
            } else if (validateGlobalApi(callee, "useResource")) {
              const bindingInfo = parseUseResource(
                decl,
                args,
                state,
                app,
                options
              );
              if (bindingInfo) {
                bindingMap.set(bindingInfo.id, bindingInfo);
              }
              continue;
            } else if (validateGlobalApi(callee, "useRef")) {
              const declId = decl.get("id");
              if (!declId.isIdentifier()) {
                state.errors.push({
                  message: `useRef() must be assigned to an identifier, received ${declId.type}`,
                  node: declId.node,
                  severity: "error",
                });
                continue;
              }
              if (args.length > 1) {
                state.errors.push({
                  message: `useRef() only accepts at most one argument, received ${args.length}`,
                  node: args[1].node,
                  severity: "warning",
                });
              }
              const firstArg = args[0];
              if (firstArg && !firstArg.isNullLiteral()) {
                state.errors.push({
                  message: `useRef() first argument must be null, received ${firstArg.type}`,
                  node: firstArg.node,
                  severity: "warning",
                });
              }
              bindingMap.set(declId.node, { id: declId.node, kind: "ref" });
              continue;
            } else if (validateGlobalApi(callee, "useQuery")) {
              const declId = decl.get("id");
              if (!declId.isIdentifier()) {
                state.errors.push({
                  message: `useQuery() must be assigned to an identifier, received ${declId.type}`,
                  node: declId.node,
                  severity: "error",
                });
                continue;
              }
              if (args.length > 0) {
                state.errors.push({
                  message: `useQuery() does not accept any arguments, received ${args.length}`,
                  node: args[0].node,
                  severity: "warning",
                });
              }
              bindingMap.set(declId.node, { id: declId.node, kind: "query" });
              continue;
            }
          }
        }

        // Normal variable
        const declId = decl.get("id");
        if (!declId.isIdentifier()) {
          state.errors.push({
            message: `Expect an identifier as the variable name, received ${declId.type}`,
            node: declId.node,
            severity: "error",
          });
          continue;
        }

        const binding: BindingInfo = { id: declId.node, kind: "constant" };
        bindingMap.set(declId.node, binding);
        if (init.node) {
          binding.initialValue = parseJsValue(
            init as NodePath<t.Expression>,
            state,
            app,
            options
          );
        }
      }
    } else if (stmt.isReturnStatement()) {
      const children = parseReturnStatement(stmt, state, app, options);
      if (children) {
        prevParent.children ??= [];
        prevParent.children.push(
          ...(prevSlot
            ? children.map((child) => ({ ...child, slot: prevSlot }))
            : children)
        );
      }
      break;
    } else if (stmt.isIfStatement()) {
      const test = stmt.get("test");
      if (!validateEmbeddedExpression(test.node, state)) {
        return null;
      }
      const consequent = stmt.get("consequent");
      const alternate = stmt.get("alternate");

      const consequentChildren = parseIfStatementChildren(
        consequent,
        state,
        app,
        options
      );
      const alternateChildren = alternate
        ? parseIfStatementChildren(
            alternate as NodePath<t.Statement>,
            state,
            app,
            options
          )
        : null;

      prevParent.children ??= [];
      const ifComponent: ComponentChild = {
        name: "If",
        properties: {
          dataSource: parsePropValue(test, state, app, {
            ...options,
            modifier: "=",
          }),
        },
        children: [
          ...(consequentChildren ?? []),
          ...(alternateChildren ?? []).map((child) => ({
            ...child,
            slot: "else",
          })),
        ],
        slot: prevSlot,
      };
      prevParent.children.push(ifComponent);
      prevParent = ifComponent;
      if (consequentChildren) {
        prevSlot = "else";

        if (alternateChildren) {
          break;
        }
      }
    } else if (
      !stmt.isTSInterfaceDeclaration() &&
      !stmt.isTSTypeAliasDeclaration()
    ) {
      state.errors.push({
        message: `Unsupported top level statement type: ${stmt.type}`,
        node: stmt.node,
        severity: "error",
      });
    }
  }

  return component;
}

function parseReturnStatement(
  stmt: NodePath<t.ReturnStatement>,
  state: ParsedModule,
  app: ParsedApp,
  options: ParseJsValueOptions
): ComponentChild[] | null {
  const arg = stmt.get("argument");
  if (!arg.node) {
    state.errors.push({
      message: `Return statement in component function must have an argument`,
      node: stmt,
      severity: "error",
    });
    return null;
  }
  return parseChildren(arg as NodePath<t.Expression>, state, app, options);
}

function parseIfStatementChildren(
  stmt: NodePath<t.Statement>,
  state: ParsedModule,
  app: ParsedApp,
  options: ParseJsValueOptions
): ComponentChild[] | null {
  if (stmt.isBlockStatement()) {
    const body = stmt.get("body");
    if (body.length === 0) {
      state.errors.push({
        message: `If statement block must contain a return statement`,
        node: stmt.node,
        severity: "error",
      });
      return null;
    }

    let children: ComponentChild[] | null = null;
    for (const st of body) {
      const maybeChildren = parseIfStatementChildren(st, state, app, options);
      if (maybeChildren) {
        children = maybeChildren;
      }
    }
    return children;
  }

  if (stmt.isReturnStatement()) {
    return parseReturnStatement(stmt, state, app, options);
  }

  state.errors.push({
    message: `Only return statement is allowed in if statement, but received: ${stmt.type}`,
    node: stmt.node,
    severity: "error",
  });
  return null;
}
