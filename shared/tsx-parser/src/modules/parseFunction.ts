import type { NodePath } from "@babel/traverse";
import type * as t from "@babel/types";
import type { StoryboardFunction } from "@next-core/types";
import type { ParseJsValueOptions, ParseModuleState } from "./interfaces.js";
import { validateFunction } from "./validations.js";

interface Replacement {
  type: "id";
  start: number;
  end: number;
  replacement: string;
  shorthand?: string;
}

export function parseFunction(
  fn: NodePath<t.FunctionDeclaration>,
  state: ParseModuleState,
  options: ParseJsValueOptions
): StoryboardFunction | null {
  if (!validateFunction(fn.node, state)) {
    return null;
  }

  const replacements: Replacement[] = [];

  fn.traverse({
    Identifier(idPath) {
      if (!idPath.isReferencedIdentifier()) {
        return;
      }
      const shorthand =
        idPath.parentPath.isObjectProperty() &&
        idPath.parentPath.node.shorthand;
      const bindingId = idPath.scope.getBindingIdentifier(idPath.node.name);
      if (bindingId && bindingId !== fn.node.id) {
        if (options.functionBindings?.has(bindingId)) {
          replacements.push({
            type: "id",
            start: idPath.node.start!,
            end: idPath.node.end!,
            replacement: `FN.${bindingId.name}`,
            shorthand: shorthand ? idPath.node.name : undefined,
          });
        }
      }
    },
  });

  replacements.sort((a, b) => a.start - b.start);

  const chunks: string[] = [];
  let prevStart = fn.node.start!;
  for (const rep of replacements) {
    chunks.push(
      state.source.substring(prevStart, rep.start),
      `${rep.shorthand ? `${rep.shorthand}:` : ""}${rep.replacement}`
    );
    prevStart = rep.end;
  }
  chunks.push(state.source.substring(prevStart, fn.node.end!));

  return {
    name: fn.node.id!.name,
    source: chunks.join(""),
    typescript: true,
  };
}
