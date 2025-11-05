import type { NodePath, Visitor } from "@babel/traverse";
import type * as t from "@babel/types";
import type { ParseJsValueOptions, ParsedModule } from "./interfaces.js";
import { getContextReferenceVariableName } from "./getContextReference.js";

type Replacement = IdReplacement | Annotation;

interface IdReplacement {
  type: "id";
  start: number;
  end: number;
  replacement: string;
  shorthand?: string;
}

interface Annotation {
  type: "annotation";
  start: number;
  end: number;
}

export function parseEmbedded(
  path: NodePath<t.Expression | t.FunctionDeclaration>,
  state: ParsedModule,
  options: ParseJsValueOptions,
  noWrapping?: boolean
): string {
  const replacements: Replacement[] = [];

  const visitor: Visitor = {
    TSTypeAnnotation(tsPath) {
      replacements.push({
        type: "annotation",
        start: tsPath.node.start!,
        end: tsPath.node.end!,
      });
      tsPath.skip();
    },
    TSTypeParameterInstantiation(tsPath) {
      replacements.push({
        type: "annotation",
        start: tsPath.node.start!,
        end: tsPath.node.end!,
      });
      tsPath.skip();
    },
    TSAsExpression(tsPath) {
      replacements.push({
        type: "annotation",
        start: tsPath.node.expression.end!,
        end: tsPath.node.end!,
      });
      tsPath.skip();
    },
    Identifier(idPath) {
      if (!idPath.isReferencedIdentifier()) {
        return;
      }
      const shorthand =
        idPath.parentPath.isObjectProperty() &&
        idPath.parentPath.node.shorthand;
      const varName = idPath.node.name;
      const bindingId = idPath.scope.getBindingIdentifier(varName);
      if (bindingId) {
        let specificReplacement: string | undefined;
        switch (bindingId) {
          case options.eventBinding?.id:
            specificReplacement = options.eventBinding?.isCallback
              ? "EVENT.detail"
              : "EVENT";
            break;
          case options.forEachBinding?.item:
            specificReplacement = "ITEM";
            break;
          case options.forEachBinding?.index:
            specificReplacement = "INDEX";
            break;
          case options.dataBinding?.id:
            specificReplacement = "DATA";
            break;
        }
        if (specificReplacement) {
          replacements.push({
            type: "id",
            start: idPath.node.start!,
            end: idPath.node.end!,
            replacement: specificReplacement,
            shorthand: shorthand ? varName : undefined,
          });
          return;
        }

        const binding = options.component?.bindingMap.get(bindingId);
        if (binding) {
          if (
            binding.kind === "state" ||
            binding.kind === "resource" ||
            binding.kind === "constant" ||
            binding.kind === "param" ||
            binding.kind === "query" ||
            binding.kind === "pathParams"
          ) {
            replacements.push({
              type: "id",
              start: idPath.node.start!,
              end: idPath.node.end!,
              replacement:
                binding.kind === "query"
                  ? "QUERY"
                  : binding.kind === "pathParams"
                    ? "PATH"
                    : `${options.component!.type === "template" ? "STATE" : "CTX"}.${bindingId.name}`,
              shorthand: shorthand ? varName : undefined,
            });
          } else if (binding.kind === "context") {
            replacements.push({
              type: "id",
              start: idPath.node.start!,
              end: idPath.node.end!,
              replacement: `CTX.${getContextReferenceVariableName(binding.contextProvider!.name, binding.contextKey!)}`,
              shorthand: shorthand ? varName : undefined,
            });
          } else {
            state.errors.push({
              message: `Invalid usage of ${binding.kind} variable "${bindingId.name}"`,
              node: idPath.node,
              severity: "error",
            });
          }
        } else if (options.functionBindings?.has(bindingId)) {
          replacements.push({
            type: "id",
            start: idPath.node.start!,
            end: idPath.node.end!,
            replacement: `FN.${varName}`,
            shorthand: shorthand ? varName : undefined,
          });
        }
      } else if (options.stateBindings?.includes(varName)) {
        replacements.push({
          type: "id",
          start: idPath.node.start!,
          end: idPath.node.end!,
          replacement: `CTX.${varName}`,
          shorthand: shorthand ? varName : undefined,
        });
      }
    },
  };

  if (path.isIdentifier()) {
    (visitor.Identifier as any)(path);
  }
  path.traverse(visitor);

  replacements.sort((a, b) => a.start - b.start);

  const chunks: string[] = [];
  let prevStart = path.node.start!;
  for (const rep of replacements) {
    chunks.push(
      state.source.substring(prevStart, rep.start),
      rep.type === "annotation"
        ? ""
        : `${rep.shorthand ? `${rep.shorthand}:` : ""}${rep.replacement}`
    );
    prevStart = rep.end;
  }
  chunks.push(state.source.substring(prevStart, path.node.end!));

  const value = chunks.join("");

  if (noWrapping) {
    return value;
  }

  return `<%${options.modifier ?? ""} ${value} %>`;
}
