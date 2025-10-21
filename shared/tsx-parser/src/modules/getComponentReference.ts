import type { NodePath } from "@babel/traverse";
import type * as t from "@babel/types";
import type {
  ComponentReference,
  ParseJsValueOptions,
  ParsedApp,
  ParsedModule,
} from "./interfaces.js";
import { resolveImportSource } from "./resolveImportSource.js";

export function getComponentReference(
  path: NodePath<t.Identifier | t.JSXIdentifier>,
  state: ParsedModule,
  app: ParsedApp,
  options: ParseJsValueOptions
): ComponentReference | null {
  if (!path.isReferencedIdentifier()) {
    return null;
  }

  const componentName = path.node.name;
  const binding = path.scope.getBinding(componentName);
  if (!binding) {
    return null;
  }

  if (options.componentBindings?.has(binding.identifier)) {
    return {
      type: "local",
      name: componentName,
    };
  }

  if (binding.kind === "module") {
    if (
      binding.path.isImportSpecifier() &&
      binding.path.parentPath.isImportDeclaration()
    ) {
      const imported = binding.path.get("imported");
      if (!imported.isIdentifier()) {
        state.errors.push({
          message: `Unsupported import specifier type: ${imported.type}`,
          node: imported.node,
          severity: "error",
        });
        return null;
      }
      const source = binding.path.parentPath.get("source");
      return {
        type: "imported",
        name: imported.node.name,
        importSource: resolveImportSource(
          source.node.value,
          state.filePath,
          app.files
        ),
      };
    }

    if (
      binding.path.isImportDefaultSpecifier() &&
      binding.path.parentPath.isImportDeclaration()
    ) {
      const source = binding.path.parentPath.get("source");
      return {
        type: "imported",
        importSource: resolveImportSource(
          source.node.value,
          state.filePath,
          app.files
        ),
      };
    }
  }

  state.errors.push({
    message: `Unsupported component binding for "${componentName}"`,
    node: binding.identifier,
    severity: "error",
  });

  return null;
}
