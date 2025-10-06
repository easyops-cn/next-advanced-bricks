import type { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import type {
  BindingInfo,
  ComponentChild,
  EventHandler,
  Events,
  ParseJsValueOptions,
  ParseModuleState,
} from "./interfaces.js";
import { parsePropValue } from "./parseJsValue.js";
import { parseLowLevelChildren } from "./parseLowLevelChildren.js";
import type { ChildElement } from "./internal-interfaces.js";
import { parseElement } from "./parseElement.js";
import { parseEvent } from "./parseEvent.js";
import { validateGlobalApi } from "./validations.js";

export function parseJSXElement(
  path: NodePath<t.JSXElement>,
  state: ParseModuleState,
  options: ParseJsValueOptions
): ChildElement | null | (ChildElement | null)[] {
  const openingElement = path.get("openingElement");
  const tagName = openingElement.get("name");
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
      .flatMap((child) => parseElement(child, state, options));
  }

  const properties: Record<string, unknown> = {};
  const ambiguousProps: Record<string, unknown> = {};
  let events: Events | undefined;
  let ref: string | undefined;

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

    if (attrName === "ref") {
      ref = parseRefAttribute(attrValuePath, state, options);
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
        handler = parseEvent(exprPath, state, options);
      }
      if (handler) {
        events ??= {};
        events[convertJsxEventAttr(attrName)] = handler;
      }
    } else {
      if (attrValuePath.node == null) {
        properties[attrName] = true;
      } else if (attrValuePath.isStringLiteral()) {
        properties[attrName] = attrValuePath.node.value;
        ambiguousProps[attrName] = attrValuePath.node.value;
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
    options
  );

  if (textContent) {
    properties.textContent = textContent;
  }

  const child: ComponentChild = {
    name: tagName.node.name,
    properties,
    ref,
    events,
    children,
  };

  return {
    type: "component",
    component: child,
  };
}

function parseRefAttribute(
  attrValuePath: NodePath<t.Node | null | undefined>,
  state: ParseModuleState,
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

function convertJsxEventAttr(attr: string): string {
  return attr
    .slice(2)
    .replace(/([a-z])([A-Z])/g, "$1.$2")
    .toLowerCase();
}
