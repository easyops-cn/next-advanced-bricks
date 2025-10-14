import type { NodePath } from "@babel/traverse";
import type * as t from "@babel/types";
import type {
  ComponentReference,
  ParseJsValueOptions,
  ParsedModule,
} from "./interfaces.js";

export function getComponentReference(
  path: NodePath<t.Identifier | t.JSXIdentifier>,
  state: ParsedModule,
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
        importSource: source.node.value,
      };
    }

    if (
      binding.path.isImportDefaultSpecifier() &&
      binding.path.parentPath.isImportDeclaration()
    ) {
      const source = binding.path.parentPath.get("source");
      return {
        type: "imported",
        importSource: source.node.value,
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
