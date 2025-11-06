import type { NodePath } from "@babel/traverse";
import type * as t from "@babel/types";
import type { StoryboardFunction } from "@next-core/types";
import type {
  ModulePart,
  ParseJsValueOptions,
  ParsedApp,
  ParsedModule,
} from "./interfaces.js";
import { validateFunction, validateGlobalApi } from "./validations.js";
import { resolveImportSource } from "./resolveImportSource.js";

interface Replacement {
  type: "id";
  start: number;
  end: number;
  replacement: string;
  shorthand?: string;
}

export function parseFunction(
  fn: NodePath<t.FunctionDeclaration>,
  state: ParsedModule,
  app: ParsedApp,
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
            state.errors.push({
              message: `Css imports are not supported for utils functions`,
              node: idPath.node,
              severity: "error",
            });
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
          }
        }
      }

      const bindingId = binding?.identifier;
      if (bindingId && bindingId !== fn.node.id) {
        if (options.functionBindings?.has(bindingId)) {
          replacements.push({
            type: "id",
            start: idPath.node.start!,
            end: idPath.node.end!,
            replacement: `FN.${bindingId.name}`,
            shorthand: shorthand ? varName : undefined,
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
