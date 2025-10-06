import type { NodePath } from "@babel/traverse";
import type * as t from "@babel/types";
import type {
  ParseModuleState,
  DataSourceConfig,
  ParseJsValueOptions,
  DataSource,
  BindingInfo,
} from "./interfaces.js";
import { validateFunction } from "./validations.js";
import { parseJsValue } from "./parseJsValue.js";
import { parseResourceCall } from "./parseResourceCall.js";

export function parseUseResource(
  decl: NodePath<t.VariableDeclarator>,
  args: NodePath<t.Expression | t.SpreadElement | t.ArgumentPlaceholder>[],
  state: ParseModuleState,
  options: ParseJsValueOptions
): BindingInfo | null {
  const declId = decl.get("id");
  if (!declId.isArrayPattern()) {
    return null;
  }
  const elements = declId.get("elements");
  if (elements.length !== 1 && elements.length !== 2) {
    return null;
  }
  const resourceVar = elements[0];
  if (!resourceVar.isIdentifier()) {
    return null;
  }
  if (args.length !== 1 && args.length !== 2) {
    return null;
  }
  const resourcePath = args[0];
  if (!resourcePath.isArrowFunctionExpression()) {
    return null;
  }
  if (!validateFunction(resourcePath.node, state)) {
    return null;
  }
  const call = resourcePath.get("body");
  if (call.isBlockStatement()) {
    return null;
  }
  if (!call.isCallExpression()) {
    return null;
  }
  const callee = call.get("callee");
  if (!(callee.isIdentifier() || callee.isMemberExpression())) {
    return null;
  }
  const resourceConfig = args[1];
  let config: DataSourceConfig | undefined;
  if (resourceConfig) {
    if (!resourceConfig.isObjectExpression()) {
      state.errors.push({
        message: `"useResource()" second argument must be an object expression, but got ${resourceConfig.type}`,
        node: resourceConfig.node,
        severity: "error",
      });
      return null;
    }
    for (const prop of resourceConfig.get("properties")) {
      if (!prop.isObjectProperty()) {
        state.errors.push({
          message: `Unsupported property type in "useResource()" second argument: ${prop.type}`,
          node: prop.node,
          severity: "error",
        });
        return null;
      }
      const key = prop.get("key");
      if (!key.isIdentifier()) {
        state.errors.push({
          message: `"useResource()" second argument property key must be an identifier, but got ${key.type}`,
          node: key.node,
          severity: "error",
        });
        return null;
      }
      if (prop.node.computed) {
        state.errors.push({
          message: `"useResource()" second argument property key cannot be computed`,
          node: key.node,
          severity: "error",
        });
        return null;
      }
      if (key.node.name !== "enabled" && key.node.name !== "fallback") {
        state.errors.push({
          message: `"useResource()" second argument property key must be "enabled" or "fallback", but got "${key.node.name}"`,
          node: key.node,
          severity: "error",
        });
        return null;
      }
      config ??= {};
      config[key.node.name] = parseJsValue(prop.get("value"), state, options);
    }
  }

  let resource: DataSource | null = null;
  if (callee.isMemberExpression()) {
    const property = callee.get("property");
    if (
      !property.isIdentifier() ||
      callee.node.computed ||
      (property.node.name !== "then" && property.node.name !== "catch")
    ) {
      state.errors.push({
        message: `Unexpected awaited expression`,
        node: property.node,
        severity: "error",
      });
      return null;
    }
    resource = parseResourceCall(
      callee.get("object"),
      state,
      options,
      resourceVar.node.name,
      config,
      call.get("arguments"),
      property.node.name
    );
  } else {
    resource = parseResourceCall(
      call,
      state,
      options,
      resourceVar.node.name,
      config
    );
  }

  if (resource) {
    return { id: resourceVar.node, kind: "resource", resource };
  }

  return null;
}
