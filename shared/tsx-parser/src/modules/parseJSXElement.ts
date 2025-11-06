import type { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import type {
  BindingInfo,
  ComponentChild,
  EventHandler,
  Events,
  ParseJsValueOptions,
  ParsedApp,
  ParsedModule,
} from "./interfaces.js";
import { parsePropValue } from "./parseJsValue.js";
import { parseLowLevelChildren } from "./parseLowLevelChildren.js";
import type { ChildElement } from "./internal-interfaces.js";
import { parseElement } from "./parseElement.js";
import { parseEvent } from "./parseEvent.js";
import { validateGlobalApi } from "./validations.js";
import { getComponentReference } from "./getComponentReference.js";
import type { LifeCycle } from "../interfaces.js";
import { parseContextProvider } from "./parseContextProvider.js";

export function parseJSXElement(
  path: NodePath<t.JSXElement>,
  state: ParsedModule,
  app: ParsedApp,
  options: ParseJsValueOptions
): ChildElement | null | (ChildElement | null)[] {
  const openingElement = path.get("openingElement");
  const tagName = openingElement.get("name");

  if (
    app.appType === "app" &&
    (state.moduleType === "page" || state.moduleType === "entry") &&
    tagName.isJSXMemberExpression()
  ) {
    const object = tagName.get("object");
    const property = tagName.get("property");
    if (!object.isJSXIdentifier()) {
      state.errors.push({
        message: `When using JSX Member Expression, only JSX Identifier is allowed as object, but got: ${object.type}`,
        node: object.node,
        severity: "error",
      });
      return null;
    }
    if (property.node.name !== "Provider") {
      state.errors.push({
        message: `Unsupported JSX Member Expression property: ${property.node.name}. Only "Provider" is supported.`,
        node: property.node,
        severity: "error",
      });
      return null;
    }
    return parseContextProvider(path, object, state, app, options);
  }

  if (!tagName.isJSXIdentifier()) {
    state.errors.push({
      message: `Unsupported JSX element name type: ${tagName.type}`,
      node: tagName.node,
      severity: "error",
    });
    return null;
  }

  if (validateGlobalApi(tagName, "Fragment")) {
    for (const attr of openingElement.node.attributes) {
      if (
        !(
          t.isJSXAttribute(attr) &&
          t.isJSXIdentifier(attr.name) &&
          attr.name.name === "key"
        )
      ) {
        state.errors.push({
          message: `Invalid attribute for Fragment`,
          node: attr,
          severity: "error",
        });
      }
    }
    return path
      .get("children")
      .flatMap((child) => parseElement(child, state, app, options));
  }

  const reference = getComponentReference(tagName, state, app, options);
  const properties: Record<string, unknown> = {};
  // const ambiguousProps: Record<string, unknown> = {};
  let events: Events | undefined;
  let lifeCycle: LifeCycle | undefined;
  let ref: string | undefined;
  let slot: string | undefined;

  const isRoute = validateGlobalApi(tagName, "Route");

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
    if (attrName === "key") {
      // Ignore key attribute
      continue;
    }
    const attrValuePath = (attr as NodePath<t.JSXAttribute>).get("value");

    if (isRoute) {
      if (attrName === "component") {
        if (!attrValuePath.isJSXExpressionContainer()) {
          state.errors.push({
            message: `The "component" attribute in Route expects a JSXExpressionContainer, but got ${attrValuePath.node?.type}`,
            node: attrValuePath.node ?? attrValuePath.parent,
            severity: "error",
          });
          continue;
        }
        const exprPath = attrValuePath.get("expression");
        if (!exprPath.isIdentifier()) {
          state.errors.push({
            message: `The "component" attribute in Route expects an identifier, but got ${exprPath.node.type}`,
            node: exprPath.node,
            severity: "error",
          });
          continue;
        }
        const reference = getComponentReference(exprPath, state, app, options);
        if (!reference) {
          state.errors.push({
            message: `The component "${exprPath.node.name}" is not defined`,
            node: exprPath.node,
            severity: "error",
          });
          continue;
        }
        properties.component = {
          name: exprPath.node.name,
          reference,
        };
      } else if (attrName === "path") {
        if (!attrValuePath.isStringLiteral()) {
          state.errors.push({
            message: `The "path" attribute in Route expects a string literal, but got ${attrValuePath.node?.type}`,
            node: attrValuePath.node ?? attrValuePath.parent,
            severity: "error",
          });
          continue;
        }
        properties.path = attrValuePath.node.value;
      } else {
        state.errors.push({
          message: `Unsupported attribute "${attrName}" in Route`,
          node: attrNamePath.node,
          severity: "error",
        });
      }
      continue;
    }

    if (attrName === "ref") {
      ref = parseRefAttribute(attrValuePath, state, options);
      continue;
    }

    if (attrName === "slot") {
      if (!attrValuePath.isStringLiteral()) {
        state.errors.push({
          message: `The "slot" attribute in component expects a string literal, but got ${attrValuePath.node?.type}`,
          node: attrValuePath.node ?? attrValuePath.parent,
          severity: "error",
        });
        continue;
      }
      slot = attrValuePath.node.value;
      continue;
    }

    const isEventHandler = /^on[A-Z]/.test(attrName);
    if (isEventHandler) {
      if (!attrValuePath.isJSXExpressionContainer()) {
        state.errors.push({
          message: `Event handler "${attrName}" expects a JSXExpressionContainer, but got ${attrValuePath.node?.type}`,
          node: attrValuePath.node ?? attrValuePath.parent,
          severity: "error",
        });
        continue;
      }
      const exprPath = attrValuePath.get("expression");
      if (exprPath.isJSXEmptyExpression()) {
        state.errors.push({
          message: `Empty expression in events is not allowed`,
          node: exprPath.node,
          severity: "warning",
        });
        continue;
      }
      let handler: EventHandler[] | null = null;
      // Assert: exprPath.isReferencedIdentifier()
      if (exprPath.isIdentifier()) {
        const bindingId = exprPath.scope.getBindingIdentifier(
          exprPath.node.name
        );
        if (bindingId) {
          const binding = options.component?.bindingMap.get(bindingId);
          if (binding && binding.kind === "eventHandler") {
            handler = [
              {
                action: "dispatch_event",
                payload: {
                  type: convertJsxEventAttr(binding.id.name),
                  detail: "<% EVENT.detail %>",
                },
              },
            ];
          }
        }
      }
      if (!handler) {
        handler = parseEvent(exprPath, state, app, options);
      }
      if (handler) {
        if (attrName === "onMount" || attrName === "onUnmount") {
          lifeCycle ??= {};
          lifeCycle[attrName] = handler;
        } else {
          events ??= {};
          events[convertJsxEventAttr(attrName)] = handler;
        }
      }
    } else {
      if (attrValuePath.node == null) {
        properties[attrName] = true;
      } else if (attrValuePath.isStringLiteral()) {
        properties[attrName] = attrValuePath.node.value;
        // ambiguousProps[attrName] = attrValuePath.node.value;
      } else if (attrValuePath.isJSXExpressionContainer()) {
        const exprPath = attrValuePath.get("expression");
        if (exprPath.isJSXEmptyExpression()) {
          state.errors.push({
            message: `Empty expression in JSX attribute "${attrName}" is not allowed`,
            node: exprPath.node,
            severity: "warning",
          });
        } else {
          properties[attrName] = parsePropValue(
            exprPath as NodePath<t.Expression>,
            state,
            app,
            {
              ...options,
              allowUseBrick: true,
              modifier: "=",
            }
          );
          // TODO: set ambiguousProps when reward is enabled
        }
      } else {
        state.errors.push({
          message: `Unsupported attribute value type in component: ${attrValuePath.node.type}`,
          node: attrValuePath.node,
          severity: "error",
        });
      }
    }
  }

  const { textContent, children } = parseLowLevelChildren(
    path.get("children"),
    state,
    app,
    options
  );

  if (textContent) {
    properties.textContent = textContent;
  }

  const child: ComponentChild = {
    name: tagName.node.name,
    reference,
    properties,
    ref,
    slot,
    events,
    lifeCycle,
    children,
  };

  return {
    type: "component",
    component: child,
  };
}

function parseRefAttribute(
  attrValuePath: NodePath<t.Node | null | undefined>,
  state: ParsedModule,
  options: ParseJsValueOptions
): string | undefined {
  if (!attrValuePath.isJSXExpressionContainer()) {
    state.errors.push({
      message: `The "ref" attribute in component expects a JSXExpressionContainer, but got ${attrValuePath.node?.type}`,
      node: attrValuePath.node ?? attrValuePath.parent,
      severity: "error",
    });
    return;
  }
  const exprPath = attrValuePath.get("expression");
  if (!exprPath.isIdentifier()) {
    state.errors.push({
      message: `The "ref" attribute in component expects an identifier, but got ${exprPath.node.type}`,
      node: exprPath.node,
      severity: "error",
    });
    return;
  }
  const refName = exprPath.node.name;
  // Assert: exprPath.isReferencedIdentifier()
  const bindingId = exprPath.scope.getBindingIdentifier(refName);
  let binding: BindingInfo | undefined;
  if (bindingId) {
    binding = options.component?.bindingMap.get(bindingId);
  }
  if (!binding) {
    state.errors.push({
      message: `The ref "${refName}" is not defined`,
      node: attrValuePath.node,
      severity: "error",
    });
    return;
  }
  if (binding.kind !== "ref") {
    state.errors.push({
      message: `The variable "${refName}" is not a ref, but a ${binding.kind}`,
      node: attrValuePath.node,
      severity: "error",
    });
    return;
  }
  return binding.id.name;
}

export function convertJsxEventAttr(attr: string): string {
  return attr
    .slice(2)
    .replace(/([a-z])([A-Z])/g, "$1.$2")
    .toLowerCase();
}
