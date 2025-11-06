import type { NodePath } from "@babel/traverse";
import type * as t from "@babel/types";
import type {
  ChildElement,
  ChildExpression,
  ChildMerged,
  ChildText,
} from "./internal-interfaces.js";
import type {
  ComponentChild,
  ParseJsValueOptions,
  ParsedApp,
  ParsedModule,
} from "./interfaces.js";
import { parseElement } from "./parseElement.js";
import { parseEmbedded } from "./parseEmbedded.js";

export function parseLowLevelChildren(
  paths: NodePath<t.Node>[],
  state: ParsedModule,
  app: ParsedApp,
  options: ParseJsValueOptions
): {
  textContent?: string;
  children?: ComponentChild[];
} {
  let rawChildren: (ChildElement | ChildMerged)[] = paths.flatMap((p) =>
    parseElement(p, state, app, options)
  );

  // Remove leading and trailing nulls
  if (rawChildren.length > 0 && rawChildren[0] === null) {
    rawChildren = rawChildren.slice(1);
  }
  if (rawChildren.length > 0 && rawChildren[rawChildren.length - 1] === null) {
    rawChildren = rawChildren.slice(0, rawChildren.length - 1);
  }

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
    const textContent = constructMergeTexts(
      rawChildren.flatMap((child) =>
        child!.type === "merged"
          ? (child as ChildMerged).children
          : (child as ChildText)
      ),
      state,
      app,
      options
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
                  : child.type === "expression"
                    ? parseEmbedded(child.expression, state, app, {
                        ...options,
                        modifier: "=",
                      })
                    : constructMergeTexts(child.children, state, app, options),
            },
          }
    );

  return { children };
}

function constructMergeTexts(
  elements: (ChildText | ChildExpression)[],
  state: ParsedModule,
  app: ParsedApp,
  options: ParseJsValueOptions
) {
  state.usedHelpers.add("_helper_mergeTexts");
  return `<%= FN._helper_mergeTexts(${elements
    .map((elem) =>
      elem.type === "text"
        ? JSON.stringify(elem)
        : `{type:"expression",value:(${parseEmbedded(elem.expression, state, app, options, true)})}`
    )
    .join(", ")}) %>`;
}
