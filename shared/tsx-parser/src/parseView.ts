import { parse, type ParseResult as BabelParseResult } from "@babel/parser";
import * as t from "@babel/types";
import type { ParseOptions } from "./interfaces.js";
import { parseLegacyModule } from "./modules/parseLegacyModule.js";
import type { ParsedApp } from "./modules/interfaces.js";
import { parseFile } from "./modules/parseFile.js";

export function parseView(source: string, options?: ParseOptions): ParsedApp {
  const app: ParsedApp = {
    appType: "view",
    modules: new Map(),
    files: [
      {
        filePath: "View.tsx",
        content: source,
      },
    ],
    errors: [],
  };

  let ast: BabelParseResult<t.File> | undefined;
  try {
    ast = parse(source, {
      plugins: ["jsx", "typescript"],
      sourceType: "module",
      errorRecovery: true,
    });
  } catch (error) {
    app.errors.push({
      message: `Failed to parse TSX: ${error}`,
      node: null,
      severity: "fatal",
    });
    return app;
  }

  for (const stmt of ast.program.body) {
    if (t.isExportDefaultDeclaration(stmt)) {
      if (t.isFunctionDeclaration(stmt.declaration)) {
        parseFile("View.tsx", app, ast, options);
        return app;
      }
      break;
    }
  }

  parseLegacyModule("View.tsx", app, ast, options);
  return app;
}
