import type { ParseResult as BabelParseResult } from "@babel/parser";
import * as t from "@babel/types";
import type { ParseOptions, ParseResult } from "./interfaces.js";
import { constructFunction } from "./tsx-constructors/function.js";
import { constructFunctionComponent } from "./solid/functionComponent.js";

export function parseSolid(
  ast: BabelParseResult<t.File>,
  result: ParseResult,
  options?: ParseOptions
): void {
  for (const stmt of ast.program.body) {
    if (t.isFunctionDeclaration(stmt) && stmt.id && !isTemplate(stmt.id)) {
      result.functionNames.push(stmt.id.name);
    }
  }

  for (const stmt of ast.program.body) {
    if (t.isFunctionDeclaration(stmt)) {
      if (!stmt.id) {
        result.errors.push({
          message: `Function declaration must have a name`,
          node: stmt,
          severity: "error",
        });
        continue;
      }
      if (isTemplate(stmt.id)) {
        constructFunctionComponent(stmt, result, "template", options);
      } else {
        constructFunction(stmt, result);
      }
    } else if (t.isExportDefaultDeclaration(stmt)) {
      if (!t.isFunctionDeclaration(stmt.declaration)) {
        result.errors.push({
          message: `Expected function declaration as default export, but got ${stmt.declaration.type}`,
          node: stmt.declaration,
          severity: "error",
        });
        continue;
      }
      constructFunctionComponent(stmt.declaration, result, "view", options);
    } else if (
      !(t.isTSInterfaceDeclaration(stmt) || t.isTSTypeAliasDeclaration(stmt))
    ) {
      result.errors.push({
        message: `Unsupported top level statement type: ${stmt.type}`,
        node: stmt,
        severity: "error",
      });
    }
  }
}

function isTemplate(id: t.Identifier) {
  return id.name[0] >= "A" && id.name[0] <= "Z";
}
