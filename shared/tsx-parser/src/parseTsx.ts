import { parse, type ParseResult as BabelParseResult } from "@babel/parser";
import * as t from "@babel/types";
import type { StoryboardFunction } from "@next-core/types";
import type {
  Component,
  ParseResult,
  DataSource,
  ParseError,
  ParseOptions,
  Variable,
  Template,
} from "./interfaces.js";
import { parseLegacy } from "./parseLegacy.js";
import { parseSolid } from "./parseSolid.js";

export function parseTsx(source: string, options?: ParseOptions): ParseResult {
  const dataSources: DataSource[] = [];
  const variables: Variable[] = [];
  const components: Component[] = [];
  const errors: ParseError[] = [];
  let title: string | undefined;
  const componentsMap = new Map<string, Component>();
  const contexts: string[] = options?.withContexts ?? [];
  const contextGetters: string[] = [];
  const contextSetters = new Map<string, string>();
  const functions: StoryboardFunction[] = [];
  const functionNames: string[] = [];
  const contracts = new Set<string>();
  const templates: Template[] = [];
  const result: ParseResult = {
    source,
    title,
    dataSources,
    variables,
    components,
    componentsMap,
    errors,
    contexts,
    contextGetters,
    contextSetters,
    functionNames,
    functions,
    contracts,
    templates,
  };

  let ast: BabelParseResult<t.File> | undefined;
  try {
    ast = parse(source, {
      plugins: ["jsx", "typescript"],
      sourceType: "module",
      errorRecovery: true,
    });
  } catch (error) {
    errors.push({
      message: `Failed to parse TSX: ${error}`,
      node: null,
      severity: "fatal",
    });

    return result;
  }

  if (ast.errors?.length) {
    for (const error of ast.errors) {
      errors.push({
        message: `${error.code}: ${error.reasonCode}`,
        node: null,
        severity: "error",
      });
    }
  }

  for (const stmt of ast.program.body) {
    if (t.isExportDefaultDeclaration(stmt)) {
      if (t.isFunctionDeclaration(stmt.declaration)) {
        parseSolid(ast, result, options);
        return result;
      }
      break;
    }
  }

  parseLegacy(ast, result, options);
  return result;
}
