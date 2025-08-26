import * as t from "@babel/types";
import type {
  ChildElement,
  ChildExpression,
  ChildMerged,
  ChildText,
  Component,
  ConstructJsValueOptions,
  ConstructResult,
  ParseJsxOptions,
} from "../interfaces.js";
import { constructTsxElement } from "./element.js";
import { replaceCTX, replaceVariables } from "./replaceVariables.js";

export function constructChildren(
  nodes: t.Node[],
  result: ConstructResult,
  options?: ParseJsxOptions,
  valueOptions?: ConstructJsValueOptions
): {
  textContent?: string;
  children?: Component[];
} {
  let rawChildren: (ChildElement | ChildMerged)[] = nodes.flatMap((node) =>
    constructTsxElement(node, result, options, valueOptions)
  );

  let onlyTextChildren = rawChildren.every((child) => child?.type === "text");
  if (!onlyTextChildren) {
    let previousChild: ChildElement | ChildMerged = null;
    const tempChildren: (ChildElement | ChildMerged)[] = [];

    for (const child of rawChildren) {
      if (child === null) {
        // Do nothing
      } else if (child.type === "text" || child.type === "expression") {
        if (
          previousChild?.type === "text" ||
          previousChild?.type === "expression"
        ) {
          previousChild = {
            type: "merged",
            children: [previousChild, child],
          };
          tempChildren.splice(tempChildren.length - 1, 1, previousChild);
          continue;
        } else if (previousChild?.type === "merged") {
          previousChild.children.push(child);
          continue;
        }
      }
      previousChild = child;
      tempChildren.push(child);
    }

    rawChildren = tempChildren;
    onlyTextChildren = rawChildren.every(
      (child) =>
        child?.type === "text" ||
        (child?.type === "merged" &&
          child.children.every((c) => c.type === "text"))
    );
  }

  if (onlyTextChildren) {
    const textContent = rawChildren
      .flatMap((child) =>
        child!.type === "text"
          ? child!.text
          : (child as ChildMerged).children.map((c) => (c as ChildText).text)
      )
      .join("")
      .trim();
    return { textContent };
  }
  const onlyLooseTextChildren = rawChildren.every(
    (child) => !!child && child.type !== "component"
  );
  if (onlyLooseTextChildren) {
    const text = mergeTexts(
      rawChildren.flatMap((child) =>
        child!.type === "merged"
          ? (child as ChildMerged).children
          : (child as ChildText)
      ),
      result.source
    );
    const textContent = replaceVariables(
      replaceCTX(text, result.contexts),
      valueOptions?.replacePatterns
    );
    return { textContent };
  }

  const children = rawChildren
    .filter((child) => !!child)
    .map((child) =>
      child.type === "component"
        ? child.component
        : {
            name: "Plaintext",
            properties: {
              textContent:
                child.type === "text"
                  ? child.text
                  : replaceVariables(
                      replaceCTX(
                        child.type === "expression"
                          ? `<%= ${result.source.slice(child.expression.start!, child.expression.end!)} %>`
                          : mergeTexts(child.children, result.source),
                        result.contexts
                      ),
                      valueOptions?.replacePatterns
                    ),
            },
          }
    );

  return { children };
}

function mergeTexts(elements: (ChildText | ChildExpression)[], source: string) {
  return `<%= CTX.__builtin_fn_mergeTexts(${elements
    .map((elem) =>
      elem.type === "text"
        ? JSON.stringify(elem)
        : `{type:"expression",value:(${source.substring(elem.expression.start!, elem.expression.end!)})}`
    )
    .join(", ")}) %>`;
}
