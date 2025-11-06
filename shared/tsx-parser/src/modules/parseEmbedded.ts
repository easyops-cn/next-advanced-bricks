import type { NodePath, Visitor } from "@babel/traverse";
import type * as t from "@babel/types";
import type {
  ModulePart,
  ParseJsValueOptions,
  ParsedApp,
  ParsedModule,
} from "./interfaces.js";
import { getContextReferenceVariableName } from "./getContextReference.js";
import { resolveImportSource } from "./resolveImportSource.js";
import { validateGlobalApi } from "./validations.js";

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
  app: ParsedApp,
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

      const isTranslate = validateGlobalApi(idPath, "translate");
      const isTranslateByRecord =
        !isTranslate && validateGlobalApi(idPath, "translateByRecord");

      if (isTranslate || isTranslateByRecord) {
        replacements.push({
          type: "id",
          start: idPath.node.start!,
          end: idPath.node.end!,
          replacement: isTranslate ? "I18N" : "I18N_TEXT",
          shorthand: shorthand ? varName : undefined,
        });
        return;
      }

      const binding = idPath.scope.getBinding(varName);
      if (binding?.kind === "module") {
        const isImportDefault = binding.path.isImportDefaultSpecifier();
        if (isImportDefault || binding.path.isImportSpecifier()) {
          const importDecl = binding.path.parentPath!
            .node as t.ImportDeclaration;
          const source = importDecl.source.value;
          const importSource = resolveImportSource(
            source,
            state.filePath,
            app.files
          );
          const mod = app.modules.get(importSource);
          if (mod?.moduleType === "css") {
            if (isImportDefault) {
              replacements.push({
                type: "id",
                start: idPath.node.start!,
                end: idPath.node.end!,
                replacement: `CONSTANTS[${JSON.stringify(importSource)}]`,
                shorthand: shorthand ? varName : undefined,
              });
            } else {
              state.errors.push({
                message: `Named imports are not supported for CSS modules`,
                node: idPath.node,
                severity: "error",
              });
            }
            return;
          }

          let modulePart: ModulePart | null | undefined;
          if (isImportDefault) {
            modulePart = mod?.defaultExport;
          } else {
            const imported = (binding.path as NodePath<t.ImportSpecifier>).get(
              "imported"
            );
            if (!imported.isIdentifier()) {
              state.errors.push({
                message: `Unsupported import specifier type: ${imported.type}`,
                node: imported.node,
                severity: "error",
              });
              return null;
            }
            const importedName = imported.node.name;
            modulePart = mod?.namedExports.get(importedName);
          }

          if (modulePart?.type === "function") {
            replacements.push({
              type: "id",
              start: idPath.node.start!,
              end: idPath.node.end!,
              replacement: `FN.${modulePart.function.name}`,
              shorthand: shorthand ? varName : undefined,
            });
          } else {
            state.errors.push({
              message: `Invalid usage: "${varName}"`,
              node: idPath.node,
              severity: "error",
            });
          }
        } else {
          state.errors.push({
            message: `Invalid module binding for "${varName}"`,
            node: idPath.node,
            severity: "error",
          });
          return;
        }
      }

      const bindingId = binding?.identifier;
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
