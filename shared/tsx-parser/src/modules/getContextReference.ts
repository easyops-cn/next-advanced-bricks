import type { NodePath } from "@babel/traverse";
import type * as t from "@babel/types";
import type {
  ContextReference,
  ParsedApp,
  ParsedModule,
  ParseJsValueOptions,
} from "./interfaces.js";
import { resolveImportSource } from "./resolveImportSource.js";

export function getContextReference(
  path: NodePath<t.Identifier | t.JSXIdentifier>,
  state: ParsedModule,
  app: ParsedApp,
  options: ParseJsValueOptions
): ContextReference | null {
  if (!path.isReferencedIdentifier()) {
    return null;
  }

  const contextName = path.node.name;
  const binding = path.scope.getBinding(contextName);
  if (!binding) {
    return null;
  }

  if (options.contextBindings?.has(binding.identifier)) {
    return {
      type: "local",
      name: contextName,
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
  }

  state.errors.push({
    message: `Unsupported context binding for "${contextName}"`,
    node: binding.identifier,
    severity: "error",
  });

  return null;
}

export function getContextReferenceVariableName(
  refName: string,
  getterName: string
) {
  return `CONTEXT_PROVIDER__${refName}__${getterName}`;
}

export function getContextReferenceEventAgentId(refName: string) {
  return `context-agent-${refName}`;
}
