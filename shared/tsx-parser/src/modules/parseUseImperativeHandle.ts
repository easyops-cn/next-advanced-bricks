import type { NodePath } from "@babel/traverse";
import type * as t from "@babel/types";
import type {
  ComponentChild,
  ParsedApp,
  ParsedModule,
  ParseJsValueOptions,
} from "./interfaces.js";
import {
  isGeneralFunctionExpression,
  validateFunction,
} from "./validations.js";
import { parseEventHandler } from "./parseEvent.js";
import type { CustomTemplateProxyMethods } from "@next-core/types";

export function parseUseImperativeHandle(
  expr: NodePath<t.CallExpression>,
  templateRef: NodePath<t.Identifier> | undefined,
  state: ParsedModule,
  app: ParsedApp,
  options: ParseJsValueOptions
): {
  components: ComponentChild[];
  methods: CustomTemplateProxyMethods;
} | null {
  if (!templateRef) {
    state.errors.push({
      message: `useImperativeHandle() can only be used in component with ref parameter`,
      node: expr.node,
      severity: "error",
    });
    return null;
  }
  const args = expr.get("arguments");
  if (args.length < 2) {
    state.errors.push({
      message: `useImperativeHandle() requires at least 2 arguments, received ${args.length}`,
      node: expr.node,
      severity: "error",
    });
    return null;
  }

  const refArg = args[0];
  if (
    !refArg.isIdentifier() ||
    refArg.scope.getBindingIdentifier(refArg.node.name) !== templateRef.node
  ) {
    state.errors.push({
      message: `useImperativeHandle() first argument must be the ref parameter`,
      node: refArg.node,
      severity: "error",
    });
    return null;
  }

  const initArg = args[1];
  if (!initArg.isArrowFunctionExpression()) {
    state.errors.push({
      message: `useImperativeHandle() second argument must be an arrow function expression, received ${initArg.type}`,
      node: initArg.node,
      severity: "error",
    });
    return null;
  }

  const initBody = initArg.get("body");
  if (!initBody.isObjectExpression()) {
    state.errors.push({
      message: `useImperativeHandle() arrow function body must be an object expression, received ${initBody.type}`,
      node: initBody.node,
      severity: "error",
    });
    return null;
  }

  const components: ComponentChild[] = [];
  const methods: CustomTemplateProxyMethods = {};

  for (const prop of initBody.get("properties")) {
    const key = (prop as NodePath<t.ObjectProperty | t.ObjectMethod>).get(
      "key"
    );
    if (!key.isIdentifier()) {
      state.errors.push({
        message: `useImperativeHandle() object property key must be an identifier, received ${key.type}`,
        node: key.node,
        severity: "error",
      });
      continue;
    }

    let body: NodePath<t.BlockStatement>;
    if (prop.isObjectProperty()) {
      if (prop.node.computed || prop.node.shorthand) {
        state.errors.push({
          message: `useImperativeHandle() object properties cannot be computed or shorthand`,
          node: prop.node,
          severity: "error",
        });
        continue;
      }
      const value = prop.get("value");
      if (!isGeneralFunctionExpression(value)) {
        state.errors.push({
          message: `useImperativeHandle() object properties must be functions, received ${value.type}`,
          node: prop.node,
          severity: "error",
        });
        continue;
      }
      if (!validateFunction(value.node, state)) {
        continue;
      }
      const fnBody = value.get("body");
      if (!fnBody.isBlockStatement()) {
        state.errors.push({
          message: `useImperativeHandle() object property functions must have a block statement body, received ${fnBody.type}`,
          node: fnBody.node,
          severity: "error",
        });
        continue;
      }
      body = fnBody;
    } else if (prop.isObjectMethod()) {
      if (
        prop.node.computed ||
        prop.node.kind !== "method" ||
        prop.node.generator ||
        prop.node.async
      ) {
        state.errors.push({
          message: `useImperativeHandle() object methods must be non-computed non-generator non-async methods, received kind=${prop.node.kind}, computed=${prop.node.computed}, generator=${prop.node.generator}, async=${prop.node.async}`,
          node: prop.node,
          severity: "error",
        });
        continue;
      }
      body = prop.get("body");
    } else {
      state.errors.push({
        message: `useImperativeHandle() object properties must be methods or properties, received ${prop.type}`,
        node: prop.node,
        severity: "error",
      });
      continue;
    }

    const handlers = parseEventHandler(body, state, app, options);

    if (handlers && (!Array.isArray(handlers) || handlers.length > 0)) {
      const ref = `imperative-handle-ref-${key.node.name}`;
      methods[key.node.name] = {
        ref,
        refMethod: "trigger",
      };
      components.push({
        name: "eo-event-agent",
        portal: true,
        properties: {},
        ref,
        events: {
          trigger: handlers,
        },
      });
    }
  }

  if (components.length === 0) {
    return null;
  }

  return { components, methods };
}
