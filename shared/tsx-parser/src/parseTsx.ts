import { parse, type ParseResult as BabelParseResult } from "@babel/parser";
import * as t from "@babel/types";
import type { ParseOptions, ParseResult } from "./interfaces.js";
import { parseModule } from "./modules/parseModule.js";
import { moduleToCompatible } from "./modules/moduleToCompatible.js";
import { parseLegacyModule } from "./modules/parseLegacyModule.js";
import type { ParsedModule } from "./modules/interfaces.js";

export function parseTsx(source: string, options?: ParseOptions): ParseResult {
  let ast: BabelParseResult<t.File> | undefined;
  try {
    ast = parse(source, {
      plugins: ["jsx", "typescript"],
      sourceType: "module",
      errorRecovery: true,
    });
  } catch (error) {
    return {
      source,
      dataSources: [],
      variables: [],
      components: [],
      componentsMap: new Map(),
      contracts: new Set(),
      errors: [
        {
          message: `Failed to parse TSX: ${error}`,
          node: null,
          severity: "fatal",
        },
      ],
      functions: [],
      usedHelpers: new Set(),
      templates: [],
    };
  }

  let mod: ParsedModule | undefined;

  for (const stmt of ast.program.body) {
    if (t.isExportDefaultDeclaration(stmt)) {
      if (t.isFunctionDeclaration(stmt.declaration)) {
        mod = parseModule(source, ast, options);
      }
      break;
    }
  }

  if (!mod) {
    mod = parseLegacyModule(source, ast, options);
  }

  return moduleToCompatible(mod);
}
