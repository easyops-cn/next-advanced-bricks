import * as t from "@babel/types";
import type z from "zod";
import type { ConstructResult, Events } from "../interfaces.js";
import { constructJsValue } from "./values.js";
import { EventHandler, type EventHandlerOfCallAPI } from "../schemas.js";

export function constructEvents(node: t.Expression, result: ConstructResult) {
  if (!t.isObjectExpression(node)) {
    result.errors.push({
      message: `Expected an object expression for events, but got ${node.type}`,
      node,
      severity: "error",
    });
    return;
  }

  const events: Events = {};
  for (const prop of node.properties) {
    if (!t.isObjectProperty(prop)) {
      result.errors.push({
        message: `Unsupported property type in events: ${prop.type}`,
        node: prop,
        severity: "error",
      });
      continue;
    }
    if (prop.computed || prop.shorthand) {
      result.errors.push({
        message:
          "Computed properties and shorthand properties are not supported in events",
        node: prop,
        severity: "error",
      });
      continue;
    }
    let key: string;
    if (t.isIdentifier(prop.key)) {
      key = prop.key.name;
    } else if (t.isStringLiteral(prop.key)) {
      key = prop.key.value;
    } else {
      result.errors.push({
        message: `Unsupported object key type in events: ${prop.key.type}`,
        node: prop.key,
        severity: "error",
      });
      continue;
    }

    if (t.isArrayExpression(prop.value)) {
      const handlers: z.infer<typeof EventHandler>[] = [];
      for (const elem of prop.value.elements) {
        if (elem === null) {
          result.errors.push({
            message: "Array elements cannot be empty in events",
            node: prop.value,
            severity: "error",
          });
          continue;
        }
        if (t.isSpreadElement(elem)) {
          result.errors.push({
            message: "Spread elements are not supported in events",
            node: elem,
            severity: "error",
          });
          continue;
        }
        const handler = constructEventHandler(elem, result);
        if (handler) {
          handlers.push(handler);
        }
      }
      events[key] = handlers;
    } else if (t.isObjectExpression(prop.value)) {
      const handler = constructEventHandler(prop.value, result);
      if (handler) {
        events[key] = handler;
      }
    }
  }
  return events;
}

export function constructEventHandler(
  node: t.Expression,
  result: ConstructResult
) {
  if (!t.isObjectExpression(node)) {
    result.errors.push({
      message: `Expected an object expression for event handler, but got ${node.type}`,
      node,
      severity: "error",
    });
    return null;
  }
  const handler: Record<string, unknown> = {};
  let payloadProp: t.Node | undefined;
  for (const prop of node.properties) {
    if (!t.isObjectProperty(prop)) {
      result.errors.push({
        message: `Unsupported property type in event handler: ${prop.type}`,
        node: prop,
        severity: "error",
      });
      continue;
    }
    if (prop.computed || prop.shorthand) {
      result.errors.push({
        message:
          "Computed properties and shorthand properties are not supported in event handlers",
        node: prop,
        severity: "error",
      });
      continue;
    }
    let key: string;
    if (t.isIdentifier(prop.key)) {
      key = prop.key.name;
    } else if (t.isStringLiteral(prop.key)) {
      key = prop.key.value;
    } else {
      result.errors.push({
        message: `Unsupported object key type in event handler: ${prop.key.type}`,
        node: prop.key,
        severity: "error",
      });
      continue;
    }

    handler[key] = constructJsValue(prop.value, result, {
      allowExpression: true,
    });

    if (key === "payload") {
      payloadProp = prop.value;
    }
  }

  // Set ambiguousParams if for call_api action
  let ambiguousParams: unknown;
  if (
    handler.action === "call_api" &&
    (handler as z.infer<typeof EventHandlerOfCallAPI>).payload?.api &&
    payloadProp
  ) {
    if (t.isObjectExpression(payloadProp)) {
      for (const prop of payloadProp.properties) {
        if (
          t.isObjectProperty(prop) &&
          !prop.computed &&
          !prop.shorthand &&
          t.isIdentifier(prop.key) &&
          prop.key.name === "params"
        ) {
          ambiguousParams = constructJsValue(
            prop.value,
            {
              ...result,
              // Ignore errors in ambiguous params
              errors: [],
            },
            {
              allowExpression: true,
              disallowArrowFunction: true,
              ambiguous: true,
            }
          );
        }
      }
    }
  }

  const parsedHandler = EventHandler.safeParse(handler);
  if (parsedHandler.success) {
    const result = parsedHandler.data;

    if (ambiguousParams) {
      // Assert: result is a call_api action
      (
        result as {
          payload: {
            ambiguousParams?: unknown;
          };
        }
      ).payload.ambiguousParams = ambiguousParams;
    }

    return result;
  } else {
    result.errors.push({
      message: `Invalid event handler structure: ${parsedHandler.error}`,
      node,
      severity: "error",
    });
  }

  return null;
}
