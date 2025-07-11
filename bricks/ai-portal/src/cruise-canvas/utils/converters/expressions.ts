const VALID_IDENTIFIER_REG = /^[$_\p{ID_Start}][$\p{ID_Continue}]*$/u;

const EXPRESSION_PREFIX_REG = /^\s*<%=?\s+/;
const EXPRESSION_SUFFIX_REG = /\s+%>\s*$/;

export function isExpression(value: string) {
  return EXPRESSION_PREFIX_REG.test(value) && EXPRESSION_SUFFIX_REG.test(value);
}

export function getMemberAccessor(property: unknown): string {
  const propertyStr = String(property);
  return VALID_IDENTIFIER_REG.test(propertyStr)
    ? `.${propertyStr}`
    : `[${JSON.stringify(propertyStr)}]`;
}

export function extractDataSource(data: string | object):
  | {
      isString: false;
      embedded?: undefined;
      expression?: undefined;
    }
  | {
      isString: true;
      embedded: string;
      expression: string;
    } {
  if (typeof data !== "string") {
    return {
      isString: false,
    };
  }

  if (isExpression(data)) {
    const expression = data
      .replace(EXPRESSION_PREFIX_REG, "")
      .replace(EXPRESSION_SUFFIX_REG, "")
      .trim();

    return {
      isString: true,
      embedded: data,
      expression,
    };
  }

  if (data.includes("CTX.")) {
    return {
      isString: true,
      embedded: `<%= ${data} %>`,
      expression: data,
    };
  }

  const expression = `CTX${getMemberAccessor(data)}`;

  return {
    isString: true,
    embedded: `<%= ${expression} %>`,
    expression,
  };
}
