import * as t from "@babel/types";
import type {
  ChildElement,
  ChildExpression,
  ChildMerged,
  ChildText,
  ConstructJsValueOptions,
} from "./interfaces.js";
import type { Component, ParseResult, ParseOptions } from "../interfaces.js";
import { constructTsxElement } from "./element.js";
import { replaceGlobals, replaceVariables } from "./replaceVariables.js";
import { removeTypeAnnotations } from "./values.js";

export function constructChildren(
  nodes: t.Node[],
  result: ParseResult,
  options?: ParseOptions,
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
    const text = constructMergeTexts(
      rawChildren.flatMap((child) =>
        child!.type === "merged"
          ? (child as ChildMerged).children
          : (child as ChildText)
      ),
      result
    );
    const textContent = replaceVariables(
      replaceGlobals(text, result),
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
                      replaceGlobals(
                        child.type === "expression"
                          ? `<%= ${removeTypeAnnotations(result.source, child.expression)} %>`
                          : constructMergeTexts(child.children, result),
                        result
                      ),
                      valueOptions?.replacePatterns
                    ),
            },
          }
    );

  return { children };
}

function constructMergeTexts(
  elements: (ChildText | ChildExpression)[],
  result: ParseResult
) {
  result.usedHelpers.add("_helper_mergeTexts");
  return `<%= FN._helper_mergeTexts(${elements
    .map((elem) =>
      elem.type === "text"
        ? JSON.stringify(elem)
        : `{type:"expression",value:(${removeTypeAnnotations(result.source, elem.expression)})}`
    )
    .join(", ")}) %>`;
}
