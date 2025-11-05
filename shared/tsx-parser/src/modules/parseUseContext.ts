import type { NodePath } from "@babel/traverse";
import type * as t from "@babel/types";
import type {
  ParsedModule,
  BindingInfo,
  ParsedApp,
  ParseJsValueOptions,
} from "./interfaces.js";
import { getContextReference } from "./getContextReference.js";

export function parseUseContext(
  decl: NodePath<t.VariableDeclarator>,
  args: NodePath<t.Expression | t.SpreadElement | t.ArgumentPlaceholder>[],
  state: ParsedModule,
  app: ParsedApp,
  options: ParseJsValueOptions
): BindingInfo[] | null {
  if (args.length !== 1) {
    state.errors.push({
      message: `"useContext()" must have exactly one argument, but got ${args.length}`,
      node: decl.node,
      severity: "error",
    });
    return null;
  }
  const firstArg = args[0];
  if (!firstArg.isIdentifier()) {
    state.errors.push({
      message: `"useContext()" argument must be an identifier, but got ${firstArg.type}`,
      node: firstArg.node,
      severity: "error",
    });
    return null;
  }

  const contextRef = getContextReference(firstArg, state, app, options);
  if (!contextRef) {
    return null;
  }

  const declId = decl.get("id");
  if (!declId.isObjectPattern()) {
    return null;
  }
  const properties = declId.get("properties");

  const bindings: BindingInfo[] = [];

  for (const prop of properties) {
    if (!prop.isObjectProperty()) {
      state.errors.push({
        message: `Unsupported property type in "useContext()" destructuring: ${prop.type}`,
        node: prop.node,
        severity: "error",
      });
      continue;
    }
    if (prop.node.computed) {
      state.errors.push({
        message: `"useContext()" destructuring property cannot be computed`,
        node: prop.node,
        severity: "error",
      });
      continue;
    }
    const key = prop.get("key");
    if (!key.isIdentifier()) {
      state.errors.push({
        message: `"useContext()" destructuring property key must be an identifier, but got ${key.type}`,
        node: key.node,
        severity: "error",
      });
      continue;
    }
    const value = prop.get("value");
    if (!value.isIdentifier()) {
      state.errors.push({
        message: `"useContext()" destructuring property value must be an identifier, but got ${value.type}`,
        node: value.node,
        severity: "error",
      });
      continue;
    }
    bindings.push({
      id: value.node,
      kind: "context",
      contextProvider: contextRef,
      contextKey: key.node.name,
    });
  }
  return bindings;
}
