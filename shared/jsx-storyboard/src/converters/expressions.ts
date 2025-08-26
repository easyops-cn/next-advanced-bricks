import { strictCollectMemberUsage } from "@next-core/utils/storyboard";

const VALID_IDENTIFIER_REG = /^[$_\p{ID_Start}][$\p{ID_Continue}]*$/u;

const EXPRESSION_PREFIX_REG = /^<%=?\s/;
const EXPRESSION_SUFFIX_REG = /\s%>$/;

function isExpression(value: string) {
  const trimmed = value.trim();
  return (
    EXPRESSION_PREFIX_REG.test(trimmed) && EXPRESSION_SUFFIX_REG.test(trimmed)
  );
}

function getMemberAccessor(property: unknown): string {
  const propertyStr = String(property);
  return VALID_IDENTIFIER_REG.test(propertyStr)
    ? `.${propertyStr}`
    : `[${JSON.stringify(propertyStr)}]`;
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

  let embedded: string;
  let expression: string;

  if (isExpression(data)) {
    expression = data
      .replace(EXPRESSION_PREFIX_REG, "")
      .replace(EXPRESSION_SUFFIX_REG, "")
      .trim();

    embedded = data;
  } else if (data.includes("CTX.")) {
    expression = data;
    embedded = `<%= ${data} %>`;
  } else {
    expression = `CTX${getMemberAccessor(data)}`;
    embedded = `<%= ${expression} %>`;
  }

  const usedContexts = strictCollectMemberUsage(embedded, "CTX");

  return {
    isString: true,
    embedded,
    expression,
    usedContexts,
  };
}
