import { strictCollectMemberUsage } from "@next-core/utils/storyboard";

const EXPRESSION_PREFIX_REG = /^<%=?\s/;
const EXPRESSION_SUFFIX_REG = /\s%>$/;

/**
 * @param value The trimmed string content
 * @returns if the value is a valid expression
 */
function isExpression(value: string) {
  return EXPRESSION_PREFIX_REG.test(value) && EXPRESSION_SUFFIX_REG.test(value);
}

export function parseDataSource(data: string | object):
  | {
      isString: false;
      embedded?: undefined;
      expression?: undefined;
      usedContexts?: undefined;
    }
  | {
      isString: true;
      embedded: string;
      expression: string;
      usedContexts: Set<string>;
    } {
  if (typeof data !== "string") {
    return {
      isString: false,
    };
  }

  let expression: string;
  const expr = data.trim();
  if (isExpression(expr)) {
    expression = expr
      .replace(EXPRESSION_PREFIX_REG, "")
      .replace(EXPRESSION_SUFFIX_REG, "")
      .trim();
  } else {
    // eslint-disable-next-line no-console
    console.warn("Invalid expression:", JSON.stringify(data));
    expression = "null";
  }

  const usedContexts = strictCollectMemberUsage(data, "CTX");

  return {
    isString: true,
    embedded: data,
    expression,
    usedContexts,
  };
}
