import type { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import type {
  BindingInfo,
  ParsedApp,
  ParsedModule,
  ParseJsValueOptions,
} from "./interfaces.js";
import {
  getContextReference,
  getContextReferenceEventAgentId,
  getContextReferenceVariableName,
} from "./getContextReference.js";
import { parseElement } from "./parseElement.js";
import type { ChildElement } from "./internal-interfaces.js";

export function parseContextProvider(
  path: NodePath<t.JSXElement>,
  context: NodePath<t.JSXIdentifier>,
  state: ParsedModule,
  app: ParsedApp,
  options: ParseJsValueOptions
): (ChildElement | null)[] {
  const contextReference = getContextReference(context, state, app, options);
  const elements = path
    .get("children")
    .flatMap((child) => parseElement(child, state, app, options));

  if (!contextReference) {
    return elements;
  }

  const openingElement = path.get("openingElement");

  let attrValuePath: NodePath<t.Node | null | undefined> | undefined;
  for (const attr of openingElement.get("attributes")) {
    if (attr.isJSXSpreadAttribute()) {
      state.errors.push({
        message: `Spread attributes are not supported in component`,
        node: attr.node,
        severity: "error",
      });
      continue;
    }
    const attrNamePath = (attr as NodePath<t.JSXAttribute>).get("name");
    if (!attrNamePath.isJSXIdentifier()) {
      state.errors.push({
        message: `Expected JSXIdentifier, but got ${attrNamePath.node.type}`,
        node: attrNamePath.node,
        severity: "error",
      });
      continue;
    }
    const attrName = attrNamePath.node.name;
    if (attrName !== "value") {
      state.errors.push({
        message: `Unsupported attribute "${attrName}" in Context Provider`,
        node: attr.node,
        severity: "error",
      });
      continue;
    }
    attrValuePath = (attr as NodePath<t.JSXAttribute>).get("value");
  }

  if (!attrValuePath) {
    state.errors.push({
      message: `Context Provider is missing required "value" attribute`,
      node: openingElement.node,
      severity: "error",
    });
    return elements;
  }

  if (!attrValuePath.isJSXExpressionContainer()) {
    state.errors.push({
      message: `Expected JSXExpressionContainer, but got ${attrValuePath.node?.type}`,
      node: attrValuePath.node,
      severity: "error",
    });
    return elements;
  }
  const expression = attrValuePath.get("expression");
  if (!expression.isObjectExpression()) {
    state.errors.push({
      message: `Context Provider "value" must be an object expression, but got ${expression.node.type}`,
      node: expression.node,
      severity: "error",
    });
    return elements;
  }

  const properties = expression.get("properties");
  const stateSetters = new Map<string, string>();
  const stateGetters = new Map<string, string>();
  for (const prop of properties) {
    if (!prop.isObjectProperty()) {
      state.errors.push({
        message: `Unsupported property type in Context Provider value: ${prop.type}`,
        node: prop.node,
        severity: "error",
      });
      continue;
    }
    if (prop.node.computed) {
      state.errors.push({
        message: `Context Provider value property cannot be computed`,
        node: prop.node,
        severity: "error",
      });
      continue;
    }
    if (!prop.node.shorthand) {
      state.errors.push({
        message: `Context Provider value property must use shorthand syntax`,
        node: prop.node,
        severity: "error",
      });
      continue;
    }
    const value = prop.get("value") as NodePath<t.Identifier>;
    const bindingId = value.scope.getBindingIdentifier(value.node.name);
    let binding: BindingInfo | undefined;
    if (bindingId) {
      binding = options.component?.bindingMap.get(bindingId);
    }
    if (!binding) {
      state.errors.push({
        message: `No binding found for Context Provider value property "${value.node.name}"`,
        node: value.node,
        severity: "error",
      });
      continue;
    }
    switch (binding.kind) {
      case "setState":
        stateSetters.set(value.node.name, binding.id.name);
        break;
      case "state":
        stateGetters.set(value.node.name, binding.id.name);
        break;
      default:
        state.errors.push({
          message: `Unsupported binding kind "${binding.kind}" for Context Provider value property "${value.node.name}"`,
          node: value.node,
          severity: "error",
        });
        continue;
    }
  }

  if (stateSetters.size === 0) {
    return elements;
  }

  return [
    {
      type: "component",
      component: {
        name: "eo-event-agent",
        portal: true,
        properties: {
          id: getContextReferenceEventAgentId(contextReference.name),
        },
        events: {
          trigger: [...stateSetters].map(([setterName, stateName]) => ({
            action: "conditional",
            payload: {
              test: `<% EVENT.detail.name === "${setterName}" %>`,
              consequent: {
                action: "update_variable",
                payload: {
                  name: stateName,
                  value: "<% EVENT.detail.value %>",
                },
              },
              alternate: null,
            },
          })),
        },
        ...(stateGetters.size > 0
          ? {
              context: [...stateGetters].map(([getterName, stateName]) => ({
                name: getContextReferenceVariableName(
                  contextReference.name,
                  getterName
                ),
                value: `<% CTX.${stateName} %>`,
                track: true,
              })),
            }
          : undefined),
      },
    },
    ...elements,
  ];
}
