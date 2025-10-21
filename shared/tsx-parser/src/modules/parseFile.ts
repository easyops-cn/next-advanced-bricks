import { parse, type ParseResult as BabelParseResult } from "@babel/parser";
import type * as t from "@babel/types";
import { parseModule } from "./parseModule.js";
import type {
  ModuleType,
  ParsedApp,
  ParseModuleOptions,
  ParsedModule,
} from "./interfaces.js";

export interface SourceFile {
  filePath: string;
  content: string;
}

export function parseFile(
  filePath: string,
  app: ParsedApp,
  ast?: BabelParseResult<t.File> | undefined,
  options?: ParseModuleOptions
): void {
  const file = app.files.find((f) => f.filePath === filePath);
  if (!file) {
    throw new Error(`File not found: ${filePath}`);
  }

  if (app.modules.has(filePath)) {
    return;
  }

  app.modules.set(filePath, null);

  if (!ast) {
    ast = parse(file.content, {
      plugins: ["jsx", "typescript"],
      sourceType: "module",
      errorRecovery: true,
    });
  }

  const isEntry = !app.entry;

  const moduleType: ModuleType = isEntry
    ? "entry"
    : file.filePath.startsWith("/Pages/")
      ? "page"
      : file.filePath.startsWith("/Components/")
        ? "template"
        : "unknown";

  const mod: ParsedModule = {
    source: file.content,
    filePath,
    moduleType,
    defaultExport: null,
    namedExports: new Map(),
    internals: [],
    errors: [],
    contracts: new Set(),
    usedHelpers: new Set(),
  };

  if (ast.errors?.length) {
    for (const error of ast.errors) {
      mod.errors.push({
        message: `${error.code}: ${error.reasonCode}`,
        node: null,
        severity: "error",
      });
    }
  }

  if (isEntry) {
    app.entry = mod;
  }

  app.modules.set(filePath, mod);

  parseModule(mod, app, ast, options);
}
