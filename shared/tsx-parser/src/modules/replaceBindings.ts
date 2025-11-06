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
import { validateFunction, validateGlobalApi } from "./validations.js";

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

const GlobalConstants = new Map([
  ["BASE_URL", "BASE_URL"],
  ["translate", "I18N"],
  ["translateByRecord", "I18N_TEXT"],
]);

export function replaceBindings(
  path: NodePath<t.Expression | t.FunctionDeclaration>,
  state: ParsedModule,
  app: ParsedApp,
  options: ParseJsValueOptions,
  noWrapping?: boolean
) {
  const isFunc = path.isFunctionDeclaration();

  if (isFunc && !validateFunction(path.node, state)) {
    return null;
  }

  const replacements: Replacement[] = [];

  const visitor: Visitor = {
    Identifier(idPath) {
      if (!idPath.isReferencedIdentifier()) {
        return;
      }
      const shorthand =
        idPath.parentPath.isObjectProperty() &&
        idPath.parentPath.node.shorthand;
      const varName = idPath.node.name;

      for (const [globalName, replacement] of GlobalConstants) {
        if (validateGlobalApi(idPath, globalName)) {
          replacements.push({
            type: "id",
            start: idPath.node.start!,
            end: idPath.node.end!,
            replacement,
            shorthand: shorthand ? varName : undefined,
          });
          return;
        }
      }

      const binding = idPath.scope.getBinding(varName);

      if (!binding) {
        if (options.stateBindings?.includes(varName)) {
          replacements.push({
            type: "id",
            start: idPath.node.start!,
            end: idPath.node.end!,
            replacement: `CTX.${varName}`,
            shorthand: shorthand ? varName : undefined,
          });
        }
        return;
      }

      const bindingId = binding.identifier;

      if (binding.kind === "module") {
        const isImportDefault = binding.path.isImportDefaultSpecifier();
        if (isImportDefault || binding.path.isImportSpecifier()) {
          const importDecl = binding.path.parentPath!
            .node as t.ImportDeclaration;
          let importedName: string | undefined;
          if (!isImportDefault) {
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
            importedName = imported.node.name;
          }

          const source = importDecl.source.value;
          if (source.startsWith(".") || source.startsWith("/")) {
            // Local modules
            const importSource = resolveImportSource(
              source,
              state.filePath,
              app.files
            );
            const mod = app.modules.get(importSource);
            if (mod?.moduleType === "css") {
              if (isFunc) {
                state.errors.push({
                  message: `Css imports are not supported for utils functions`,
                  node: idPath.node,
                  severity: "error",
                });
                return;
              }
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
              modulePart = mod?.namedExports.get(importedName!);
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
            // External modules
            switch (source) {
              case "lodash":
                replacements.push({
                  type: "id",
                  start: idPath.node.start!,
                  end: idPath.node.end!,
                  replacement: isImportDefault ? "_" : `_.${importedName!}`,
                  shorthand: shorthand ? varName : undefined,
                });
                break;
              case "moment":
                if (isImportDefault) {
                  replacements.push({
                    type: "id",
                    start: idPath.node.start!,
                    end: idPath.node.end!,
                    replacement: "moment",
                    shorthand: shorthand ? varName : undefined,
                  });
                } else {
                  state.errors.push({
                    message: `Named imports are not supported for "moment" module`,
                    node: idPath.node,
                    severity: "error",
                  });
                }
                break;
            }
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

      if (isFunc && bindingId === path.node.id) {
        return;
      }

      if (options.functionBindings?.has(bindingId)) {
        replacements.push({
          type: "id",
          start: idPath.node.start!,
          end: idPath.node.end!,
          replacement: `FN.${varName}`,
          shorthand: shorthand ? varName : undefined,
        });
        return;
      }

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

      const localBinding = options.component?.bindingMap.get(bindingId);
      if (localBinding) {
        if (
          localBinding.kind === "state" ||
          localBinding.kind === "resource" ||
          localBinding.kind === "constant" ||
          localBinding.kind === "param" ||
          localBinding.kind === "app" ||
          localBinding.kind === "auth" ||
          localBinding.kind === "location" ||
          localBinding.kind === "query" ||
          localBinding.kind === "pathParams"
        ) {
          replacements.push({
            type: "id",
            start: idPath.node.start!,
            end: idPath.node.end!,
            replacement:
              localBinding.kind === "app"
                ? "APP"
                : localBinding.kind === "auth"
                  ? "SYS"
                  : localBinding.kind === "location"
                    ? "location"
                    : localBinding.kind === "query"
                      ? "QUERY"
                      : localBinding.kind === "pathParams"
                        ? "PATH"
                        : `${options.component!.type === "template" ? "STATE" : "CTX"}.${bindingId.name}`,
            shorthand: shorthand ? varName : undefined,
          });
        } else if (localBinding.kind === "context") {
          replacements.push({
            type: "id",
            start: idPath.node.start!,
            end: idPath.node.end!,
            replacement: `CTX.${getContextReferenceVariableName(localBinding.contextProvider!.name, localBinding.contextKey!)}`,
            shorthand: shorthand ? varName : undefined,
          });
        } else {
          state.errors.push({
            message: `Invalid usage of ${localBinding.kind} variable "${bindingId.name}"`,
            node: idPath.node,
            severity: "error",
          });
        }
      }
    },
  };

  if (!isFunc) {
    Object.assign(visitor, {
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
    } as Visitor);
  }

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

  if (isFunc || noWrapping) {
    return value;
  }

  return `<%${options.modifier ?? ""} ${value} %>`;
}
