import * as t from "@babel/types";
import { isEmpty } from "lodash";
import { parse } from "@babel/parser";
import { Options as FormatOptions } from "prettier";
import { format } from "prettier/standalone";
import * as parserBabel from "prettier/plugins/babel";
import * as pluginEstree from "prettier/plugins/estree";
import { transformFromAst } from "@babel/standalone";
import { NodeItem, NodeType, TransformOptions } from "../interface.js";

function processCodeItem(item: NodeItem): t.Statement[] {
  const source = item.params?.[0];

  if (!source) return [];
  const ast = parse(source);

  return ast.program.body;
}

function preProcessCommandParams(item: NodeItem): any[] | undefined {
  if (item.name.startsWith("should")) {
    const [, args] = item.name.split(":");

    const params = item.params?.slice() || [];
    args && params.unshift(args);
    return params;
  }

  return item.params;
}

function preProcessCommandName(item: NodeItem): string {
  if (item.name.startsWith("should")) {
    return item.name.split(":")?.[0];
  }

  return item.name;
}

function createCommandParams(item: NodeItem): t.Expression[] {
  const { name } = item;

  const params = preProcessCommandParams(item);
  if (!params) return [];

  if (!Array.isArray(params)) {
    throw new Error(
      `The expected type of the \`params\` field in \`${name}\` is an array, but the received type is a ${typeof params}`
    );
  }

  const args = JSON.stringify(params);
  const ast = parse(args);
  return (ast.program.body[0] as any).expression.elements;
}

function createChainedExpr(
  chainList: NodeItem[],
  { startItem }: { startItem: NodeItem }
): t.Expression {
  const [current, ...rest] = chainList;

  if (rest.length === 0) {
    return getChainStartExpr(startItem);
  }

  if (current.name === "code") {
    const exprArr = processCodeItem(current);

    if (exprArr.length === 0) {
      return createChainedExpr(rest.slice(1), { startItem });
    } else {
      const callExpr = (exprArr[0] as t.ExpressionStatement)?.expression;

      // istanbul ignore if
      if (!t.isCallExpression(callExpr)) {
        throw new Error(
          "to use the `code` command in the call chain, it must be a callExpression type"
        );
      }

      return createChainedCode(callExpr, rest, { startItem });
    }
  }

  return t.callExpression(
    t.memberExpression(
      createChainedExpr(rest, { startItem }),
      t.identifier(preProcessCommandName(current))
    ),
    createCommandParams(current)
  );
}

function createChainedCode(
  callExpr: t.CallExpression,
  nodes: NodeItem[],
  { startItem }: { startItem: NodeItem }
): t.CallExpression {
  if (t.isMemberExpression(callExpr.callee)) {
    return t.callExpression(
      t.memberExpression(
        createChainedCode(
          (callExpr.callee as t.MemberExpression).object as t.CallExpression,
          nodes,
          { startItem }
        ),
        (callExpr.callee as t.MemberExpression).property
      ),
      callExpr.arguments
    );
  }

  return t.callExpression(
    t.memberExpression(
      createChainedExpr(nodes, { startItem }),
      callExpr.callee as t.Identifier
    ),
    callExpr.arguments
  );
}

function getChainStartExpr(startItem: NodeItem) {
  return t.callExpression(
    t.memberExpression(
      t.identifier("cy"),
      t.identifier(preProcessCommandName(startItem))
    ),
    createCommandParams(startItem)
  );
}

function processCommandItem(item: NodeItem): t.ExpressionStatement {
  if (isEmpty(item.children)) {
    return t.expressionStatement(getChainStartExpr(item));
  }

  const chainList = item.children?.reverse().concat(item) as NodeItem[];

  return t.expressionStatement(
    createChainedExpr(chainList, { startItem: item })
  );
}

function createCommandNode(children: NodeItem[]): t.Statement[] {
  const statementList = [] as t.Statement[];

  children.forEach((item) => {
    if (item.name === "code") {
      statementList.push(...processCodeItem(item));
    } else {
      statementList.push(processCommandItem(item));
    }
  });

  return statementList;
}

function processBlockItem(item: NodeItem): t.Statement[] {
  if (isEmpty(item.children)) {
    return [];
  }

  if (item.name === "describe") {
    if (item.children!.some((c) => c.type !== NodeType.Block)) {
      throw new Error(
        `The children of the \`${item.name}\` are only be  \` block \` type, specifically including before, beforeEach, after, afterEach and "it."`
      );
    }

    return item.children!.map((c) => createBlockNode(c));
  } else {
    return createCommandNode(item.children!);
  }
}

function createBlockNode(item: NodeItem): t.ExpressionStatement {
  const callee = ["only", "skip"].includes(item.flag as string)
    ? t.memberExpression(
        t.identifier(item.name),
        t.identifier(item.flag as string)
      )
    : t.identifier(item.name);

  const extraArgs = [];
  if (item.tags?.length) {
    extraArgs.push(
      t.objectExpression([
        t.objectProperty(
          t.identifier("tags"),
          t.arrayExpression(item.tags.map((tag) => t.stringLiteral(tag)))
        ),
      ])
    );
  }

  return t.expressionStatement(
    t.callExpression(callee, [
      ...(["before", "beforeEach", "after", "afterEach"].includes(item.name)
        ? []
        : [t.stringLiteral(item.label || ""), ...extraArgs]),
      t.arrowFunctionExpression([], t.blockStatement(processBlockItem(item))),
    ])
  );
}

function processSuiteChildren(children: NodeItem[]): t.Statement[] {
  if (!children.every((item) => item.type === NodeType.Block)) {
    throw new Error(
      `The children nodes of the suite type must be of the block type`
    );
  }
  return children.map((item) => createBlockNode(item));
}

// eslint-disable-next-line
function crateSuiteNode(item: NodeItem): t.ExpressionStatement {
  return t.expressionStatement(
    t.callExpression(t.identifier(item.name), [
      t.stringLiteral(item.label || ""),
      t.arrowFunctionExpression(
        [],
        t.blockStatement(
          isEmpty(item.children) ? [] : processSuiteChildren(item.children!)
        )
      ),
    ])
  );
}

export function parseSuiteAst(suiteData: NodeItem): t.Statement[] {
  if (isEmpty(suiteData.children)) return [];
  return processSuiteChildren(suiteData.children as NodeItem[]);
}

export function parseSourceCode(
  suiteData: NodeItem,
  options?: TransformOptions
): string {
  const program = t.program(parseSuiteAst(suiteData), undefined, "module");

  return transformFromAst(program, undefined, {
    generatorOpts: {
      jsescOption: {
        minimal: true,
      },
    },
    ...options,
  }).code as string;
}

export async function formatCode(sourceCode: string, options?: FormatOptions) {
  // https://prettier.io/blog/2023/07/05/3.0.0.html#api-1
  return format(sourceCode as string, {
    parser: "babel-ts",
    plugins: [parserBabel, pluginEstree as any],
    printWidth: 50,
    ...options,
  });
}
