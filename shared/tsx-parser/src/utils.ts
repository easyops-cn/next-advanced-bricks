const EXPRESSION_PREFIX_REG = /^<%=?\s/;
const EXPRESSION_SUFFIX_REG = /\s%>$/;

export function isExpressionString(value: unknown): value is string {
  if (typeof value !== "string") {
    return false;
  }
  const trimmed = value.trim();
  return (
    EXPRESSION_PREFIX_REG.test(trimmed) && EXPRESSION_SUFFIX_REG.test(trimmed)
  );
}
